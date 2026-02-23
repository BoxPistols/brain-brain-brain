import { MODEL_COSTS } from '../constants/models';
import {
  MAX_COST_PER_CALL,
  MAX_COST_PER_CYCLE,
  DAILY_ALERT_THRESHOLD,
  DAILY_COST_KEY,
} from '../constants/config';

export interface UsageRecord {
  modelId: string;
  promptTokens: number;
  completionTokens: number;
}

export type BudgetSeverity = 'info' | 'warn' | 'critical';

export interface BudgetWarning {
  severity: BudgetSeverity;
  message: string;
}

// ── インメモリ累計 ──
let sessionTotal = 0;
let cycleTotal = 0;

/** モデル別コスト計算 (JPY) */
export function calculateCostJpy(modelId: string, promptTokens: number, completionTokens: number): number {
  const cost = MODEL_COSTS[modelId];
  if (!cost) return 0;
  return (promptTokens * cost.inputPerM + completionTokens * cost.outputPerM) / 1_000_000;
}

/** 使用量を記録 */
export function addUsage(record: UsageRecord): number {
  const cost = calculateCostJpy(record.modelId, record.promptTokens, record.completionTokens);
  sessionTotal += cost;
  cycleTotal += cost;
  addToDailyStorage(cost);
  return cost;
}

export function getSessionTotal(): number {
  return sessionTotal;
}

export function getCycleTotal(): number {
  return cycleTotal;
}

/** generate 開始時にサイクルリセット */
export function resetCycle(): void {
  cycleTotal = 0;
}

// ── localStorage 日次累計 ──
interface DailyRecord {
  date: string;
  total: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadDaily(): DailyRecord {
  try {
    const raw = localStorage.getItem(DAILY_COST_KEY);
    if (!raw) return { date: todayKey(), total: 0 };
    const rec = JSON.parse(raw) as DailyRecord;
    if (rec.date !== todayKey()) return { date: todayKey(), total: 0 };
    return rec;
  } catch {
    return { date: todayKey(), total: 0 };
  }
}

function addToDailyStorage(costJpy: number): void {
  const rec = loadDaily();
  rec.total += costJpy;
  rec.date = todayKey();
  try {
    localStorage.setItem(DAILY_COST_KEY, JSON.stringify(rec));
  } catch {
    // localStorage 容量不足時は無視
  }
}

export function getDailyTotal(): number {
  return loadDaily().total;
}

/** 予算チェック */
export function checkBudget(callCostJpy: number, isProMode: boolean): BudgetWarning | null {
  if (callCostJpy > MAX_COST_PER_CALL) {
    return { severity: 'critical', message: `1回のコスト ¥${callCostJpy.toFixed(2)} が上限 ¥${MAX_COST_PER_CALL} を超過しました` };
  }
  if (cycleTotal > MAX_COST_PER_CYCLE) {
    return { severity: 'warn', message: `サイクル累計 ¥${cycleTotal.toFixed(2)} が上限 ¥${MAX_COST_PER_CYCLE} を超過しました` };
  }
  const daily = getDailyTotal();
  if (!isProMode && daily > DAILY_ALERT_THRESHOLD) {
    return { severity: 'info', message: `本日の利用額 ¥${daily.toFixed(0)} — APIキーを設定するとPro版が利用できます` };
  }
  return null;
}
