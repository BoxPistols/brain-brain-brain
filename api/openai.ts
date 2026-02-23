import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

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
        error: 'リクエスト上限に達しました。しばらく時間をおくか、設定からAPIキーを入力してProモードでご利用ください。',
      });
    }
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません' });
  }

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
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
    return res.status(502).json({ error: `OpenAI接続エラー: ${e instanceof Error ? e.message : String(e)}` });
  }
}
