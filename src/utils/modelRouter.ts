import { AUTO_MODEL_ID } from '../constants/models';
import type { BrainstormForm, ChatMessage } from '../types';

export type TaskType = 'generate' | 'deepDive' | 'refine' | 'drillDown';

export interface ModelRouterInput {
  taskType: TaskType;
  depth: number;
  form?: BrainstormForm;
  messages?: ChatMessage[];
}

export interface ModelDecision {
  modelId: string;
  reason: string;
}

/** 日本語テキストのトークン数を推定（1トークン ≒ 2文字） */
export function estimateTokens(messages: ChatMessage[]): number {
  return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 2), 0);
}

const NANO = 'gpt-5-nano';
const MINI = 'gpt-5-mini';

/**
 * Auto モード時のモデル自動選択
 * Free mode → 常に Nano（サーバー負担軽減）
 * Pro mode → タスク複雑度に応じて Nano / Mini を切り替え
 */
export function selectModel(
  currentModelId: string,
  input: ModelRouterInput,
  isProMode: boolean,
  isLocal = false,
): ModelDecision {
  // ローカルLLM → 指定モデルをそのまま使用
  if (isLocal) {
    return { modelId: currentModelId, reason: 'ローカルLLM: 指定モデル使用' };
  }

  // 手動選択 → そのまま
  if (currentModelId !== AUTO_MODEL_ID) {
    return { modelId: currentModelId, reason: '手動選択' };
  }

  // Free mode → 最安固定
  if (!isProMode) {
    return { modelId: NANO, reason: 'Free mode: 最安モデル固定' };
  }

  // ── Pro mode: ルールベース判定 ──
  const { taskType, depth, form, messages } = input;

  // 深度 3 以上 → Mini
  if (depth >= 3) {
    return { modelId: MINI, reason: `深度${depth}: 高精度モデル選択` };
  }

  // generate で課題3つ以上 + 目標が複数行
  if (taskType === 'generate' && form) {
    const issueCount = form.issues.filter((i) => i.text.trim()).length;
    const multiGoals = form.teamGoals.includes('\n') || form.teamGoals.length > 60;
    if (issueCount >= 3 && multiGoals) {
      return { modelId: MINI, reason: `課題${issueCount}件+複数目標: 高精度モデル選択` };
    }

    // 競合・KPIデータあり → Mini
    const hasCompetitors = (form.competitors || []).some((c) => c.name.trim() || c.url.trim());
    const hasKpis = (form.kpis || []).some((k) => k.label.trim() && k.value.trim());
    if (hasCompetitors || hasKpis) {
      return { modelId: MINI, reason: '競合/KPIデータあり: 高精度モデル選択' };
    }
  }

  // 入力トークン推定 > 2000 → Mini
  if (messages && estimateTokens(messages) > 2000) {
    return { modelId: MINI, reason: '入力トークン2000超: 高精度モデル選択' };
  }

  // デフォルト → Nano
  return { modelId: NANO, reason: 'デフォルト: 最安モデル選択' };
}
