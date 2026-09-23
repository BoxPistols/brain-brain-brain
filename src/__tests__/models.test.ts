import { describe, it, expect, vi, afterEach } from 'vitest';
import { callAI, DEFAULT_MODEL_ID } from '../constants/models';

// 既定モデルがmax_tokens / temperatureの旧経路に落ちると400になるため、送信内容を確認する
describe('callAI のパラメータ出し分け', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('既定モデルはmax_completion_tokensを送り、temperatureを送らない', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'OK' } }] }),
      headers: new Headers(),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await callAI(DEFAULT_MODEL_ID, [{ role: 'user', content: 'hi' }], 100);

    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
    );
    expect(body.model).toBe('gpt-6-luna');
    expect(body.max_completion_tokens).toBe(100);
    expect(body).not.toHaveProperty('max_tokens');
    expect(body).not.toHaveProperty('temperature');
  });
});
