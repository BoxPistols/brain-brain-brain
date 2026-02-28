import { ModelInfo, ChatMessage, LLMProvider } from '../types';

/** APIキーがPro mode（ユーザー所有）か判定 */
export const isProMode = (apiKey: string): boolean => apiKey.trim().startsWith('sk-');

const friendlyError = (status: number, body: string): string => {
  if (status === 429)
    return 'リクエストが集中しています。1分ほど待ってから「生成」ボタンを再度押してください。';
  if (status === 401)
    return 'APIキーが正しくありません。右上の設定パネルからキーを確認・再入力してください。';
  if (status === 403)
    return 'APIキーの権限が不足しています。右上の設定パネルからキーを確認してください。';
  if (status === 404)
    return `選択中のAIモデルが利用できません。設定パネルから別のモデルを選んでください。${body ? `（${body.slice(0, 80)}）` : ''}`;
  if (status === 400) {
    const msg = (() => {
      try {
        return JSON.parse(body)?.error?.message || body;
      } catch {
        return body;
      }
    })();
    return `リクエストエラー（400）: ${msg ? msg.slice(0, 200) : '詳細不明'}`;
  }
  if (status === 504)
    return 'AIの応答がタイムアウトしました。分析深度を下げるか、入力を短くしてから再度お試しください。';
  if (status === 500 || status === 502 || status === 503)
    return 'AIサービスが一時的に混み合っています。1〜2分後に再度お試しください。';
  return `通信エラーが発生しました。インターネット接続を確認し、再度お試しください。（${status}）`;
};

export const AUTO_MODEL_ID = 'auto';
export const DEFAULT_MODEL_ID = AUTO_MODEL_ID;

const API_ENDPOINT = '/api/openai';

/** プロバイダー別デフォルト設定 */
export const PROVIDER_DEFAULTS: Record<
  LLMProvider,
  { label: string; endpoint: string; desc: string }
> = {
  openai: { label: 'OpenAI', endpoint: '/api/openai', desc: 'クラウドAPI' },
  ollama: { label: 'Ollama', endpoint: 'http://localhost:11434', desc: 'ローカルLLM（無料）' },
  lmstudio: {
    label: 'LM Studio',
    endpoint: 'http://localhost:1234',
    desc: 'ローカルLLM（無料）',
  },
};

/** ローカルプロバイダー判定 */
export const isLocalProvider = (p: LLMProvider): boolean => p !== 'openai';

export const MODELS: ModelInfo[] = [
  { id: AUTO_MODEL_ID, label: 'Auto', t: '自動選択', cost: '$~$$' },
  { id: 'gpt-5-nano', label: '5 Nano', t: '最速', cost: '$' },
  { id: 'gpt-5-mini', label: '5 Mini', t: 'バランス', cost: '$$' },
  { id: 'gpt-4.1-mini', label: '4.1 Mini', t: 'コスパ', cost: '$' },
  { id: 'gpt-4.1-nano', label: '4.1 Nano', t: '最安', cost: '$' },
];

/** モデル別コスト単価 (JPY / 1M tokens) */
export const MODEL_COSTS: Record<string, { inputPerM: number; outputPerM: number }> = {
  'gpt-5-nano': { inputPerM: 10, outputPerM: 40 },
  'gpt-5-mini': { inputPerM: 50, outputPerM: 200 },
  'gpt-4.1-mini': { inputPerM: 40, outputPerM: 160 },
  'gpt-4.1-nano': { inputPerM: 10, outputPerM: 45 },
};

/** API呼び出し結果（usage トークン数 + rate limit 情報を含む） */
export interface APICallResult {
  content: string;
  usage: { prompt_tokens: number; completion_tokens: number } | null;
  rateLimit?: { remaining: number; limit: number; resetAt?: number };
}

export const testConn = async (modelId: string, apiKey = ''): Promise<string> => {
  const resolvedId = modelId === AUTO_MODEL_ID ? 'gpt-5-nano' : modelId;
  const usesCompletionTokens = resolvedId.startsWith('gpt-5') || resolvedId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: 100 } : { max_tokens: 100 };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (isProMode(apiKey)) headers['x-api-key'] = apiKey.trim();
  const r = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: resolvedId,
      ...tokenParam,
      messages: [{ role: 'user', content: 'Say exactly: OK' }],
    }),
  });
  if (!r.ok) {
    let body = '';
    try {
      body = await r.text();
      const parsed = JSON.parse(body);
      body = String(parsed?.error?.message || parsed?.error || body);
    } catch {
      // body retains raw text
    }
    throw new Error(friendlyError(r.status, body.slice(0, 300)));
  }
  const d = await r.json();
  return d.model || resolvedId;
};

/** サーバー経由でOpenAI APIを呼び出す共通関数 */
const callAPI = async (
  modelId: string,
  msgs: ChatMessage[],
  maxTokens: number,
  jsonMode: boolean,
  apiKey?: string,
): Promise<APICallResult> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens
    ? { max_completion_tokens: maxTokens }
    : { max_tokens: maxTokens };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey && isProMode(apiKey)) headers['x-api-key'] = apiKey.trim();
  const r = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelId,
      ...tokenParam,
      ...(usesCompletionTokens ? {} : { temperature: 0.85 }),
      messages: msgs,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!r.ok) {
    let body = '';
    try {
      body = await r.text();
      const parsed = JSON.parse(body);
      if (parsed?.error?.message) body = parsed.error.message;
      else if (parsed?.error && typeof parsed.error === 'string') body = parsed.error;
    } catch {
      // テキストがそのまま body に残る
    }
    throw new Error(friendlyError(r.status, body.slice(0, 300)));
  }
  const data = await r.json();
  const content = data.choices?.[0]?.message?.content || '';
  if (!content && data.choices?.[0]?.finish_reason === 'length') {
    throw new Error(
      'AIの回答が長くなりすぎました。左パネルの「分析深度」スライダーを1段下げるか、課題・目標の入力を短くしてから再度お試しください。',
    );
  }

  // rate limit ヘッダー取得（Free mode のみサーバーが返す）
  const rlRemaining = r.headers.get('X-RateLimit-Remaining');
  const rlLimit = r.headers.get('X-RateLimit-Limit');
  const rlReset = r.headers.get('X-RateLimit-Reset');
  const rateLimit =
    rlRemaining != null && rlLimit != null
      ? {
          remaining: Number(rlRemaining),
          limit: Number(rlLimit),
          ...(rlReset ? { resetAt: Number(rlReset) } : {}),
        }
      : undefined;

  return {
    content,
    usage: data.usage
      ? {
          prompt_tokens: data.usage.prompt_tokens ?? 0,
          completion_tokens: data.usage.completion_tokens ?? 0,
        }
      : null,
    rateLimit,
  };
};

/** Free mode: サーバープロキシ経由（環境変数のAPIキー使用） */
export const callAI = async (
  modelId: string,
  msgs: ChatMessage[],
  maxTokens = 4096,
  jsonMode = false,
): Promise<APICallResult> => callAPI(modelId, msgs, maxTokens, jsonMode);

/** Pro mode: サーバープロキシ経由（ユーザーのAPIキー使用） */
export const callAIWithKey = async (
  apiKey: string,
  modelId: string,
  msgs: ChatMessage[],
  maxTokens = 4096,
  jsonMode = false,
): Promise<APICallResult> => callAPI(modelId, msgs, maxTokens, jsonMode, apiKey);

/* ────────── ローカル LLM（Ollama / LM Studio）────────── */

const localFriendlyError = (status: number, body: string): string => {
  if (status === 0 || !status)
    return 'ローカルLLMに接続できません。サーバーが起動しているか確認してください。';
  if (status === 404)
    return `指定のモデルが見つかりません。モデル名を確認してください。${body ? `（${body.slice(0, 80)}）` : ''}`;
  return `ローカルLLMエラー（${status}）: ${body.slice(0, 120)}`;
};

/** ローカルLLM用 API 呼び出し */
export const callAILocal = async (
  endpoint: string,
  modelId: string,
  msgs: ChatMessage[],
  maxTokens = 4096,
  _jsonMode = false,
): Promise<APICallResult> => {
  const url = `${endpoint.replace(/\/$/, '')}/v1/chat/completions`;
  let r: Response;
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        max_tokens: maxTokens,
        messages: msgs,
      }),
    });
  } catch {
    throw new Error('ローカルLLMに接続できません。サーバーが起動しているか確認してください。');
  }
  if (!r.ok) throw new Error(localFriendlyError(r.status, (await r.text()).slice(0, 300)));
  const data = await r.json();
  const content = data.choices?.[0]?.message?.content || '';
  return {
    content,
    usage: data.usage
      ? {
          prompt_tokens: data.usage.prompt_tokens ?? 0,
          completion_tokens: data.usage.completion_tokens ?? 0,
        }
      : null,
  };
};

/** ローカルLLM 接続テスト */
export const testConnLocal = async (endpoint: string, modelId: string): Promise<string> => {
  const url = `${endpoint.replace(/\/$/, '')}/v1/chat/completions`;
  let r: Response;
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 100,
        messages: [{ role: 'user', content: 'Say exactly: OK' }],
      }),
    });
  } catch {
    throw new Error('ローカルLLMに接続できません。サーバーが起動しているか確認してください。');
  }
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(localFriendlyError(r.status, body));
  }
  const d = await r.json();
  return d.model || modelId;
};

/** Ollama モデル一覧取得 */
export const fetchOllamaModels = async (endpoint: string): Promise<string[]> => {
  const r = await fetch(`${endpoint.replace(/\/$/, '')}/api/tags`);
  if (!r.ok) throw new Error(`Ollama に接続できません（${r.status}）`);
  const d = await r.json();
  return (d.models || []).map((m: { name: string }) => m.name);
};

/** LM Studio モデル一覧取得 */
export const fetchLMStudioModels = async (endpoint: string): Promise<string[]> => {
  const r = await fetch(`${endpoint.replace(/\/$/, '')}/v1/models`);
  if (!r.ok) throw new Error(`LM Studio に接続できません（${r.status}）`);
  const d = await r.json();
  return (d.data || []).map((m: { id: string }) => m.id);
};
