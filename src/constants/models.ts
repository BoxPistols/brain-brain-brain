import { ModelInfo, ChatMessage } from '../types';

const friendlyError = (status: number, body: string): string => {
  if (status === 429) return 'APIレート制限に達しました。しばらく待ってから再試行してください。';
  if (status === 401) return 'APIキーが無効です。設定を確認してください。';
  if (status === 403) return 'APIアクセスが拒否されました。キーの権限を確認してください。';
  if (status === 404) return `モデルが見つかりません。${body.slice(0, 100)}`;
  if (status === 500 || status === 502 || status === 503) return 'APIサーバーが一時的に利用できません。しばらく待ってから再試行してください。';
  return `API エラー (${status}): ${body.slice(0, 200)}`;
};

export const DEFAULT_MODEL_ID = 'gpt-5-nano';

const API_PROXY = '/api/openai/v1/chat/completions';
const API_DIRECT = 'https://api.openai.com/v1/chat/completions';

export const MODELS: ModelInfo[] = [
  { id: DEFAULT_MODEL_ID, label: '5 Nano',   t: '最速',    cost: '$'  },
  { id: 'gpt-5-mini',   label: '5 Mini',   t: 'バランス', cost: '$$' },
  { id: 'gpt-4.1-mini', label: '4.1 Mini', t: 'コスパ',  cost: '$'  },
  { id: 'gpt-4.1-nano', label: '4.1 Nano', t: '最安',    cost: '$'  },
];

export const testConn = async (modelId: string, apiKey = ''): Promise<string> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: 100 } : { max_tokens: 100 };
  const proMode = apiKey.trim().startsWith('sk-');
  const url = proMode ? API_DIRECT : API_PROXY;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (proMode) headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  const r = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: modelId, ...tokenParam, messages: [{ role: 'user', content: 'Say exactly: OK' }] }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(friendlyError(r.status, d?.error?.message || JSON.stringify(d)));
  return d.model || modelId;
};

/** Free mode: call via server proxy (no user key needed) */
export const callAI = async (modelId: string, msgs: ChatMessage[], maxTokens = 4096, jsonMode = false): Promise<string> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens };
  const r = await fetch(API_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

/** Pro mode: call OpenAI directly with user's own API key */
export const callAIWithKey = async (apiKey: string, modelId: string, msgs: ChatMessage[], maxTokens = 4096, jsonMode = false): Promise<string> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens };
  const r = await fetch(API_DIRECT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
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
