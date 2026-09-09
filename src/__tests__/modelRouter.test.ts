import { describe, it, expect } from 'vitest';
import { selectModel, estimateTokens, type ModelRouterInput } from '../utils/modelRouter';
import { AUTO_MODEL_ID } from '../constants/models';
import type { BrainstormForm } from '../types';

/** テスト用の最小 BrainstormForm */
const baseForm: BrainstormForm = {
  projectName: 'Test',
  productService: 'テストサービス',
  teamGoals: '売上向上',
  sessionType: 'ops',
  customSession: '',
  issues: [],
  serviceUrl: '',
  competitors: [],
  kpis: [],
};

describe('selectModel', () => {
  it('手動選択（auto以外）はそのまま返す', () => {
    const input: ModelRouterInput = { taskType: 'generate', depth: 1 };
    const result = selectModel('gpt-5.6-luna', input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
    expect(result.reason).toBe('手動選択');
  });

  it('Free mode + auto → 常に gpt-5.6-luna', () => {
    const input: ModelRouterInput = { taskType: 'generate', depth: 4, form: baseForm };
    const result = selectModel(AUTO_MODEL_ID, input, false);
    expect(result.modelId).toBe('gpt-5.6-luna');
  });

  it('Pro + depth 1 + シンプル入力 → gpt-5.6-luna', () => {
    const input: ModelRouterInput = { taskType: 'generate', depth: 1, form: baseForm };
    const result = selectModel(AUTO_MODEL_ID, input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
  });

  it('Pro + depth 2 + シンプル入力 → gpt-5.6-luna', () => {
    const input: ModelRouterInput = { taskType: 'generate', depth: 2, form: baseForm };
    const result = selectModel(AUTO_MODEL_ID, input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
  });

  it('Pro + depth 3 → gpt-5.6-luna', () => {
    const input: ModelRouterInput = { taskType: 'generate', depth: 3, form: baseForm };
    const result = selectModel(AUTO_MODEL_ID, input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
    expect(result.reason).toContain('深度3');
  });

  it('Pro + depth 4 → gpt-5.6-luna', () => {
    const input: ModelRouterInput = { taskType: 'generate', depth: 4, form: baseForm };
    const result = selectModel(AUTO_MODEL_ID, input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
  });

  it('Pro + 課題3件 + 長い目標 → gpt-5.6-luna', () => {
    const form: BrainstormForm = {
      ...baseForm,
      teamGoals:
        '売上を年間30%成長させ、新規クライアント獲得数を月50社に引き上げる。同時にCA一人あたりの生産性を1.5倍以上に改善する',
      issues: [
        { text: '課題1', detail: '', sub: [] },
        { text: '課題2', detail: '', sub: [] },
        { text: '課題3', detail: '', sub: [] },
      ],
    };
    const input: ModelRouterInput = { taskType: 'generate', depth: 2, form };
    const result = selectModel(AUTO_MODEL_ID, input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
    expect(result.reason).toContain('課題');
  });

  it('Pro + 競合データあり → gpt-5.6-luna', () => {
    const form: BrainstormForm = {
      ...baseForm,
      competitors: [{ name: '競合A', url: 'https://example.com', note: '' }],
    };
    const input: ModelRouterInput = { taskType: 'generate', depth: 1, form };
    const result = selectModel(AUTO_MODEL_ID, input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
    expect(result.reason).toContain('競合');
  });

  it('Pro + KPIデータあり → gpt-5.6-luna', () => {
    const form: BrainstormForm = {
      ...baseForm,
      kpis: [{ label: '成約率', value: '15%' }],
    };
    const input: ModelRouterInput = { taskType: 'generate', depth: 1, form };
    const result = selectModel(AUTO_MODEL_ID, input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
  });

  it('Pro + トークン2000超 → gpt-5.6-luna', () => {
    const longText = 'あ'.repeat(4100); // 4100文字 / 2 = 2050トークン
    const input: ModelRouterInput = {
      taskType: 'deepDive',
      depth: 1,
      messages: [{ role: 'user', content: longText }],
    };
    const result = selectModel(AUTO_MODEL_ID, input, true);
    expect(result.modelId).toBe('gpt-5.6-luna');
    expect(result.reason).toContain('トークン');
  });
});

describe('estimateTokens', () => {
  it('日本語テキストの長さ/2 でトークン数を推定する', () => {
    const messages = [
      { role: 'user' as const, content: 'テスト文章です' }, // 7文字 → 4トークン
    ];
    expect(estimateTokens(messages)).toBe(4);
  });

  it('複数メッセージの合計を返す', () => {
    const messages = [
      { role: 'system' as const, content: 'あ'.repeat(100) },
      { role: 'user' as const, content: 'い'.repeat(200) },
    ];
    expect(estimateTokens(messages)).toBe(150);
  });
});
