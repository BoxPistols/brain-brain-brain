/** ログ保存・インポートの最大件数 */
export const MAX_LOGS = 200;

/** 会話履歴の最大メッセージ数 */
export const MAX_HIST = 10;

/** ログ保存デバウンス間隔 (ms) */
export const SAVE_DEBOUNCE_MS = 300;

/** refine / deepDive のデフォルトトークン上限 */
export const CHAT_MAX_TOKENS = 12000;

/** 1回のAPIコールの最大コスト (JPY) */
export const MAX_COST_PER_CALL = 1;

/** 1サイクル (generate + deepDive + refine) の最大コスト (JPY) */
export const MAX_COST_PER_CYCLE = 5;

/** 1日のアラートしきい値 (JPY) — 超過でAPIキー入力を促す */
export const DAILY_ALERT_THRESHOLD = 30;

/** コスト日次記録の localStorage キー */
export const DAILY_COST_KEY = 'ai-brainstorm-daily-cost';
