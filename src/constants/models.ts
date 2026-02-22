import { ModelInfo, ChatMessage } from '../types';

/** APIキーがPro mode（ユーザー所有）か判定 */
export const isProMode = (apiKey: string): boolean => apiKey.trim().startsWith('sk-');

const friendlyError = (status: number, body: string): string => {
  if (status === 429) return 'APIレート制限に達しました。しばらく待ってから再試行してください。';
  if (status === 401) return 'APIキーが無効です。設定を確認してください。';
  if (status === 403) return 'APIアクセスが拒否されました。キーの権限を確認してください。';
  if (status === 404) return `モデルが見つかりません。${body.slice(0, 100)}`;
  if (status === 500 || status === 502 || status === 503) return 'APIサーバーが一時的に利用できません。しばらく待ってから再試行してください。';
  return `API エラー (${status}): ${body.slice(0, 200)}`;
};

export const DEFAULT_MODEL_ID = 'gpt-5-nano';

const API_ENDPOINT = '/api/openai';

export const MODELS: ModelInfo[] = [
  { id: DEFAULT_MODEL_ID, label: '5 Nano',   t: '最速',    cost: '$'  },
  { id: 'gpt-5-mini',   label: '5 Mini',   t: 'バランス', cost: '$$' },
  { id: 'gpt-4.1-mini', label: '4.1 Mini', t: 'コスパ',  cost: '$'  },
  { id: 'gpt-4.1-nano', label: '4.1 Nano', t: '最安',    cost: '$'  },
];

export const testConn = async (modelId: string, apiKey = ''): Promise<string> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: 100 } : { max_tokens: 100 };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (isProMode(apiKey)) headers['x-api-key'] = apiKey.trim();
  const r = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: modelId, ...tokenParam, messages: [{ role: 'user', content: 'Say exactly: OK' }] }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(friendlyError(r.status, d?.error?.message || JSON.stringify(d)));
  return d.model || modelId;
};

/** サーバー経由でOpenAI APIを呼び出す共通関数 */
const callAPI = async (modelId: string, msgs: ChatMessage[], maxTokens: number, jsonMode: boolean, apiKey?: string): Promise<string> => {
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
    throw new Error('回答が長すぎてトークン上限に達しました。分析深度を下げるか、入力を簡潔にしてください。');
  }
  return content;
};

/** Free mode: サーバープロキシ経由（環境変数のAPIキー使用） */
export const callAI = async (modelId: string, msgs: ChatMessage[], maxTokens = 4096, jsonMode = false): Promise<string> =>
  callAPI(modelId, msgs, maxTokens, jsonMode);

/** Pro mode: サーバープロキシ経由（ユーザーのAPIキー使用） */
export const callAIWithKey = async (apiKey: string, modelId: string, msgs: ChatMessage[], maxTokens = 4096, jsonMode = false): Promise<string> =>
  callAPI(modelId, msgs, maxTokens, jsonMode, apiKey);
