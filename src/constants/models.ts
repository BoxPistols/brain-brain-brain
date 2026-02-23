import { ModelInfo, ChatMessage } from '../types';

/** APIキーがPro mode（ユーザー所有）か判定 */
export const isProMode = (apiKey: string): boolean => apiKey.trim().startsWith('sk-');

const friendlyError = (status: number, body: string): string => {
  if (status === 429) return 'リクエストが集中しています。1分ほど待ってから「生成」ボタンを再度押してください。';
  if (status === 401) return 'APIキーが正しくありません。右上の設定パネルからキーを確認・再入力してください。';
  if (status === 403) return 'APIキーの権限が不足しています。右上の設定パネルからキーを確認してください。';
  if (status === 404) return `選択中のAIモデルが利用できません。設定パネルから別のモデルを選んでください。${body ? `（${body.slice(0, 80)}）` : ''}`;
  if (status === 500 || status === 502 || status === 503) return 'AIサービスが一時的に混み合っています。1〜2分後に再度お試しください。';
  return `通信エラーが発生しました。インターネット接続を確認し、再度お試しください。（${status}）`;
};

export const AUTO_MODEL_ID = 'auto';
export const DEFAULT_MODEL_ID = AUTO_MODEL_ID;

const API_ENDPOINT = '/api/openai';

export const MODELS: ModelInfo[] = [
  { id: AUTO_MODEL_ID,  label: 'Auto',     t: '自動選択', cost: '$~$$' },
  { id: 'gpt-5-nano',  label: '5 Nano',   t: '最速',    cost: '$'  },
  { id: 'gpt-5-mini',  label: '5 Mini',   t: 'バランス', cost: '$$' },
  { id: 'gpt-4.1-mini', label: '4.1 Mini', t: 'コスパ',  cost: '$'  },
  { id: 'gpt-4.1-nano', label: '4.1 Nano', t: '最安',    cost: '$'  },
];

/** モデル別コスト単価 (JPY / 1M tokens) */
export const MODEL_COSTS: Record<string, { inputPerM: number; outputPerM: number }> = {
  'gpt-5-nano':   { inputPerM: 10,  outputPerM: 40  },
  'gpt-5-mini':   { inputPerM: 50,  outputPerM: 200 },
  'gpt-4.1-mini': { inputPerM: 40,  outputPerM: 160 },
  'gpt-4.1-nano': { inputPerM: 10,  outputPerM: 45  },
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
    body: JSON.stringify({ model: resolvedId, ...tokenParam, messages: [{ role: 'user', content: 'Say exactly: OK' }] }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(friendlyError(r.status, d?.error?.message || JSON.stringify(d)));
  return d.model || resolvedId;
};

/** サーバー経由でOpenAI APIを呼び出す共通関数 */
const callAPI = async (modelId: string, msgs: ChatMessage[], maxTokens: number, jsonMode: boolean, apiKey?: string): Promise<APICallResult> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey && isProMode(apiKey)) headers['x-api-key'] = apiKey.trim();
  const r = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelId, ...tokenParam, messages: msgs,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!r.ok) throw new Error(friendlyError(r.status, (await r.text()).slice(0, 300)));
  const data = await r.json();
  const content = data.choices?.[0]?.message?.content || '';
  if (!content && data.choices?.[0]?.finish_reason === 'length') {
    throw new Error('AIの回答が長くなりすぎました。左パネルの「分析深度」スライダーを1段下げるか、課題・目標の入力を短くしてから再度お試しください。');
  }

  // rate limit ヘッダー取得（Free mode のみサーバーが返す）
  const rlRemaining = r.headers.get('X-RateLimit-Remaining');
  const rlLimit = r.headers.get('X-RateLimit-Limit');
  const rlReset = r.headers.get('X-RateLimit-Reset');
  const rateLimit = rlRemaining != null && rlLimit != null
    ? { remaining: Number(rlRemaining), limit: Number(rlLimit), ...(rlReset ? { resetAt: Number(rlReset) } : {}) }
    : undefined;

  return {
    content,
    usage: data.usage ? { prompt_tokens: data.usage.prompt_tokens ?? 0, completion_tokens: data.usage.completion_tokens ?? 0 } : null,
    rateLimit,
  };
};

/** Free mode: サーバープロキシ経由（環境変数のAPIキー使用） */
export const callAI = async (modelId: string, msgs: ChatMessage[], maxTokens = 4096, jsonMode = false): Promise<APICallResult> =>
  callAPI(modelId, msgs, maxTokens, jsonMode);

/** Pro mode: サーバープロキシ経由（ユーザーのAPIキー使用） */
export const callAIWithKey = async (apiKey: string, modelId: string, msgs: ChatMessage[], maxTokens = 4096, jsonMode = false): Promise<APICallResult> =>
  callAPI(modelId, msgs, maxTokens, jsonMode, apiKey);
