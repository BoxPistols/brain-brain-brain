import { AIResults, FeasibilityScore } from '../types';

/**
 * AIレスポンスからJSONを抽出・修復してパースする。
 * コードフェンス付き、途中切れ、末尾ゴミ等に対応。
 */
export function parseAIJson(raw: string): AIResults {
  let text = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  const start = text.indexOf('{');
  if (start === -1) throw new Error('AIの回答を処理できませんでした。もう一度お試しください。');
  text = text.slice(start);

  // 素直にパース
  const parsed = tryParse(text) ?? tryParseTruncated(text) ?? tryRepairTruncated(text);

  if (!parsed) throw new Error('AIの回答を処理できませんでした。もう一度お試しください。');

  return validateStructure(parsed);
}

function tryParse(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function tryParseTruncated(text: string): unknown | null {
  const end = text.lastIndexOf('}');
  if (end <= 0) return null;
  const truncated = text.slice(0, end + 1);
  // そのままパース
  const r1 = tryParse(truncated);
  if (r1) return r1;
  // ]} で閉じてみる
  const r2 = tryParse(truncated + ']}');
  if (r2) return r2;
  // } で閉じてみる
  const r3 = tryParse(truncated + '}');
  if (r3) return r3;
  return null;
}

function tryRepairTruncated(text: string): unknown | null {
  let depth = 0;
  let lastDepth1Close = -1;
  let inStr = false;
  let esc = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (ch === '\\' && inStr) {
      esc = true;
      continue;
    }
    if (ch === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 1) lastDepth1Close = i;
    }
  }

  if (lastDepth1Close > 0) {
    try {
      return JSON.parse(text.slice(0, lastDepth1Close + 1) + ']}');
    } catch {}
  }
  return null;
}

function parseFeasibility(raw: unknown): FeasibilityScore | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const obj = raw as Record<string, unknown>;
  const clamp = (v: unknown): number => {
    const n = Number(v);
    if (Number.isNaN(n)) return 50;
    return Math.max(0, Math.min(100, Math.round(n)));
  };
  return {
    total: clamp(obj.total),
    resource: clamp(obj.resource),
    techDifficulty: clamp(obj.techDifficulty),
    orgAcceptance: clamp(obj.orgAcceptance),
  };
}

/**
 * パース結果が AIResults の最低限の構造を持つことを検証する。
 * 足りないフィールドはデフォルト値で補完。
 */
function validateStructure(data: unknown): AIResults {
  if (typeof data !== 'object' || data === null) {
    throw new Error('AIの回答を処理できませんでした。もう一度お試しください。');
  }

  const obj = data as Record<string, unknown>;

  const understanding = typeof obj.understanding === 'string' ? obj.understanding : '';

  const ideas = Array.isArray(obj.ideas)
    ? obj.ideas.map((item: unknown) => {
        if (typeof item !== 'object' || item === null) {
          return {
            title: '(不明)',
            description: '',
            priority: 'Medium' as const,
            effort: 'Medium' as const,
            impact: 'Medium' as const,
          };
        }
        const idea = item as Record<string, unknown>;
        return {
          title: typeof idea.title === 'string' ? idea.title : '(不明)',
          description: typeof idea.description === 'string' ? idea.description : '',
          priority: (['High', 'Medium', 'Low'].includes(idea.priority as string)
            ? idea.priority
            : 'Medium') as 'High' | 'Medium' | 'Low',
          effort: (['High', 'Medium', 'Low'].includes(idea.effort as string)
            ? idea.effort
            : 'Medium') as 'High' | 'Medium' | 'Low',
          impact: (['High', 'Medium', 'Low'].includes(idea.impact as string)
            ? idea.impact
            : 'Medium') as 'High' | 'Medium' | 'Low',
          feasibility: parseFeasibility(idea.feasibility),
        };
      })
    : [];

  return {
    understanding,
    ideas,
    suggestions: Array.isArray(obj.suggestions)
      ? obj.suggestions.filter((s): s is string => typeof s === 'string')
      : undefined,
    keyIssue: typeof obj.keyIssue === 'string' ? obj.keyIssue : undefined,
    funnelStage: typeof obj.funnelStage === 'string' ? obj.funnelStage : undefined,
  };
}

/**
 * AI応答からMarkdownテキストを抽出する。
 * - コードフェンス除去
 * - JSON wrapper `{"markdown": "..."}` / `{"content": "..."}` からテキスト抽出
 * - リテラル `\n` → 実際の改行に変換
 * - JSONでなければそのまま返す
 */
export function extractMarkdown(raw: string): string {
  let text = raw.trim();
  // コードフェンス除去
  text = text
    .replace(/^```(?:json|markdown)?\n?/gm, '')
    .replace(/```$/gm, '')
    .trim();
  // JSON wrapper 検出
  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text);
      if (typeof obj === 'object' && obj !== null) {
        const md = obj.markdown || obj.content || obj.answer || obj.text;
        if (typeof md === 'string') text = md;
      }
    } catch {
      // JSONパース失敗 → そのまま使う
    }
  }
  // リテラル \n → 実改行（JSON.parse 済みなら不要だが安全策）
  if (text.includes('\\n')) {
    text = text.replace(/\\n/g, '\n');
  }
  return text.trim();
}
