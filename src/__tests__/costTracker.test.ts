import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateCostJpy,
  addUsage,
  getSessionTotal,
  getCycleTotal,
  resetCycle,
  checkBudget,
  getDailyTotal,
  _resetAll,
} from '../utils/costTracker';
import { DAILY_COST_KEY } from '../constants/config';

// localStorage モック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => {
      store[key] = val;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

describe('calculateCostJpy', () => {
  it('gpt-5-nano のコストを正しく計算する', () => {
    // input: 1000 tokens × 10/1M = 0.01, output: 500 tokens × 40/1M = 0.02
    const cost = calculateCostJpy('gpt-5-nano', 1000, 500);
    expect(cost).toBeCloseTo(0.03, 4);
  });

  it('gpt-5-mini のコストを正しく計算する', () => {
    // input: 1000 × 50/1M = 0.05, output: 500 × 200/1M = 0.10
    const cost = calculateCostJpy('gpt-5-mini', 1000, 500);
    expect(cost).toBeCloseTo(0.15, 4);
  });

  it('未知のモデルは 0 を返す', () => {
    expect(calculateCostJpy('unknown-model', 1000, 500)).toBe(0);
  });
});

describe('addUsage / getSessionTotal / getCycleTotal', () => {
  beforeEach(() => {
    _resetAll();
  });

  it('addUsage でセッション・サイクル累計が増加する', () => {
    const before = getSessionTotal();
    const cost = addUsage({ modelId: 'gpt-5-nano', promptTokens: 1000, completionTokens: 500 });
    expect(cost).toBeGreaterThan(0);
    expect(getSessionTotal()).toBeGreaterThan(before);
    expect(getCycleTotal()).toBeGreaterThan(0);
  });

  it('resetCycle でサイクル累計のみリセットされる', () => {
    addUsage({ modelId: 'gpt-5-nano', promptTokens: 1000, completionTokens: 500 });
    const sessionBefore = getSessionTotal();
    resetCycle();
    expect(getCycleTotal()).toBe(0);
    // セッション累計はリセットされない
    expect(getSessionTotal()).toBe(sessionBefore);
  });
});

describe('checkBudget', () => {
  beforeEach(() => {
    _resetAll();
    localStorageMock.clear();
  });

  it('1回のコストが ¥1 超で critical を返す', () => {
    const warning = checkBudget(1.5, true);
    expect(warning).not.toBeNull();
    expect(warning!.severity).toBe('critical');
  });

  it('サイクル累計が ¥5 超で warn を返す', () => {
    // サイクル累計を ¥5 超にする: gpt-5-mini × 大量トークン
    for (let i = 0; i < 50; i++) {
      addUsage({ modelId: 'gpt-5-mini', promptTokens: 5000, completionTokens: 2000 });
    }
    const warning = checkBudget(0.1, true);
    expect(warning).not.toBeNull();
    expect(warning!.severity).toBe('warn');
  });

  it('予算内なら null を返す', () => {
    const warning = checkBudget(0.05, true);
    expect(warning).toBeNull();
  });

  it('日次累計 ¥30 超 + Free mode で info を返す', () => {
    // localStorage に高額の日次累計をセット
    const today = new Date().toISOString().slice(0, 10);
    localStorageMock.setItem(DAILY_COST_KEY, JSON.stringify({ date: today, total: 35 }));
    const warning = checkBudget(0.01, false);
    expect(warning).not.toBeNull();
    expect(warning!.severity).toBe('info');
  });
});

describe('getDailyTotal', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('データなしの場合 0 を返す', () => {
    expect(getDailyTotal()).toBe(0);
  });

  it('今日のデータがあれば合計を返す', () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorageMock.setItem(DAILY_COST_KEY, JSON.stringify({ date: today, total: 12.5 }));
    expect(getDailyTotal()).toBe(12.5);
  });

  it('昨日のデータは 0 として扱う', () => {
    localStorageMock.setItem(DAILY_COST_KEY, JSON.stringify({ date: '2020-01-01', total: 50 }));
    expect(getDailyTotal()).toBe(0);
  });
});
