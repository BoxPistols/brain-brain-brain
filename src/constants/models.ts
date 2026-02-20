import { ModelInfo } from '../types';

const friendlyError = (status: number, body: string): string => {
  if (status === 429) return 'APIレート制限に達しました。しばらく待ってから再試行してください。';
  if (status === 401) return 'APIキーが無効です。設定を確認してください。';
  if (status === 403) return 'APIアクセスが拒否されました。キーの権限を確認してください。';
  if (status === 404) return `モデルが見つかりません。${body.slice(0, 100)}`;
  if (status === 500 || status === 502 || status === 503) return 'APIサーバーが一時的に利用できません。しばらく待ってから再試行してください。';
  return `API エラー (${status}): ${body.slice(0, 200)}`;
};

export const MODELS: ModelInfo[] = [
  { id: 'gpt-5-nano',   label: '5 Nano',   t: '最速',    cost: '$'  },
  { id: 'gpt-5-mini',   label: '5 Mini',   t: 'バランス', cost: '$$' },
  { id: 'gpt-4.1-mini', label: '4.1 Mini', t: 'コスパ',  cost: '$'  },
  { id: 'gpt-4.1-nano', label: '4.1 Nano', t: '最安',    cost: '$'  },
];

export const testConn = async (modelId: string): Promise<string> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: 100 } : { max_tokens: 100 };
  const r = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelId, ...tokenParam, messages: [{ role: 'user', content: 'Say exactly: OK' }] }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(friendlyError(r.status, d?.error?.message || JSON.stringify(d)));
  return d.model || modelId;
};

/** Free mode: call via server proxy (no user key needed) */
export const callAI = async (modelId: string, msgs: any[], maxTokens = 4096, jsonMode = false): Promise<string> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens };
  const r = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelId, ...tokenParam, messages: msgs,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!r.ok) throw new Error(friendlyError(r.status, (await r.text()).slice(0, 300)));
  const data = await r.json();
  return data.choices?.[0]?.message?.content || '';
};

/** Pro mode: call OpenAI directly with user's own API key */
export const callAIWithKey = async (apiKey: string, modelId: string, msgs: any[], maxTokens = 4096, jsonMode = false): Promise<string> => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens };
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: modelId, ...tokenParam, messages: msgs,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!r.ok) throw new Error(friendlyError(r.status, (await r.text()).slice(0, 300)));
  const data = await r.json();
  return data.choices?.[0]?.message?.content || '';
};
