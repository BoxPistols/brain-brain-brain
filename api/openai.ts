import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 55_000; // Vercel function timeout (60s) より余裕を持たせる

// --- Rate limiter (per-IP, Free mode only) ---
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 50;
const RATE_WINDOW = 24 * 60 * 60_000; // 24h

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, 5 * 60_000);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function getClientIP(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0].trim();
  if (Array.isArray(xff)) return xff[0]?.split(',')[0]?.trim() || 'unknown';
  return (req.headers['x-real-ip'] as string) || 'unknown';
}

/** レスポンスボディを安全にパースする */
async function safeParseResponse(
  response: Response,
): Promise<{ data: Record<string, unknown> | null; raw: string }> {
  const raw = await response.text();
  try {
    return { data: JSON.parse(raw), raw };
  } catch {
    return { data: null, raw };
  }
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userKey = req.headers['x-api-key'] as string | undefined;
  const isProMode = userKey?.startsWith('sk-');
  const apiKey = isProMode ? userKey : process.env.OPENAI_API_KEY;

  // Free mode のみレート制限
  if (!isProMode) {
    const ip = getClientIP(req);
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error:
          'リクエスト上限に達しました。しばらく時間をおくか、設定からAPIキーを入力してProモードでご利用ください。',
      });
    }
  }

  if (!apiKey) {
    console.error('[openai-proxy] APIキー未設定: OPENAI_API_KEY 環境変数を確認してください');
    return res.status(500).json({ error: 'APIキーが設定されていません' });
  }

  const model = (req.body as Record<string, unknown>)?.model ?? 'unknown';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const { data, raw } = await safeParseResponse(response);

    if (!response.ok) {
      console.error(
        `[openai-proxy] OpenAI API error: status=${response.status} model=${model} body=${raw.slice(0, 200)}`,
      );
      // JSON パースに成功していればそのまま返す、失敗時はテキストをラップ
      if (data) {
        return res.status(response.status).json(data);
      }
      return res.status(response.status).json({
        error: `OpenAI APIエラー（${response.status}）: ${raw.slice(0, 200)}`,
      });
    }

    if (data === null) {
      console.error(
        `[openai-proxy] Invalid JSON from OpenAI: model=${model} body=${raw.slice(0, 200)}`,
      );
      return res.status(502).json({ error: 'OpenAI APIから不正なレスポンスが返されました' });
    }

    // Free mode: rate limit 情報をレスポンスヘッダーに付加
    if (!isProMode) {
      const ip = getClientIP(req);
      const entry = rateMap.get(ip);
      res.setHeader('X-RateLimit-Remaining', String(RATE_LIMIT - (entry?.count || 0)));
      res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT));
      if (entry) {
        res.setHeader('X-RateLimit-Reset', String(entry.resetAt));
      }
    }

    return res.status(200).json(data);
  } catch (e) {
    const isTimeout = e instanceof Error && e.name === 'AbortError';
    const msg = isTimeout
      ? 'OpenAI APIがタイムアウトしました。分析深度を下げるか、入力を短くしてから再度お試しください。'
      : `OpenAI接続エラー: ${e instanceof Error ? e.message : String(e)}`;
    console.error(`[openai-proxy] ${isTimeout ? 'Timeout' : 'Error'}: model=${model} ${msg}`);
    return res.status(isTimeout ? 504 : 502).json({ error: msg });
  }
}
