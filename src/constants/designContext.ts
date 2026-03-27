/**
 * デザイン・UX ドメイン知識ベース
 * HR ドメインコンテキスト（domainContext.ts）と同パターンで、
 * デザイン/UX 関連キーワードを検出しドメイン知識をプロンプトに注入する
 */

export const DESIGN_REGEX =
  /UX|UI|ユーザビリティ|アクセシビリティ|WCAG|デザインシステム|Figma|Sketch|コンポーネント|トークン|カラーパレット|タイポグラフィ|インタラクション|プロトタイプ|ユーザーテスト|ヒューリスティック|ペルソナ|ジャーニーマップ|ワイヤーフレーム|モックアップ|レスポンシブ|アニメーション|マイクロインタラクション|情報設計|IA|ナビゲーション|デザインレビュー|DesignOps|ハンドオフ|Storybook|デザイナー|ビジュアル|ブランド|グリッド|レイアウト|A11y|スクリーンリーダー|コントラスト|フォーカス|キーボード操作|色覚多様性/i;

/** ニールセンのユーザビリティ10ヒューリスティクス */
export const NIELSEN_HEURISTICS = [
  { no: 1, name: 'システム状態の視認性' },
  { no: 2, name: 'システムと現実世界の一致' },
  { no: 3, name: 'ユーザーの主導権と自由' },
  { no: 4, name: '一貫性と標準' },
  { no: 5, name: 'エラー防止' },
  { no: 6, name: '記憶より認識' },
  { no: 7, name: '柔軟性と効率性' },
  { no: 8, name: '美的で最小限のデザイン' },
  { no: 9, name: 'エラーからの回復支援' },
  { no: 10, name: 'ヘルプとドキュメント' },
] as const;

/** ドン・ノーマンの7つの基本デザイン原則 */
export const NORMAN_PRINCIPLES = [
  { key: 'Discoverability', name: '発見可能性', desc: '何ができるか・現在の状態がわかる' },
  { key: 'Feedback', name: 'フィードバック', desc: '操作結果が即座に伝わる' },
  { key: 'ConceptualModel', name: '概念モデル', desc: 'システムの仕組みを正しく想起できる' },
  { key: 'Affordance', name: 'アフォーダンス', desc: 'オブジェクトが操作方法を示唆する' },
  { key: 'Signifier', name: 'シグニファイア', desc: '操作可能な箇所と方法を明示する' },
  { key: 'Mapping', name: 'マッピング', desc: '操作と結果の関係が自然に対応する' },
  { key: 'Constraints', name: '制約', desc: '誤操作を物理的・論理的に防ぐ' },
] as const;

/** WCAG POUR 原則 */
export const WCAG_POUR = [
  {
    key: 'Perceivable',
    name: '知覚可能',
    criteria: '1.1 代替テキスト / 1.3 適応可能 / 1.4 判別可能',
  },
  {
    key: 'Operable',
    name: '操作可能',
    criteria: '2.1 キーボード / 2.4 ナビゲーション / 2.5 入力モダリティ',
  },
  {
    key: 'Understandable',
    name: '理解可能',
    criteria: '3.1 読みやすさ / 3.2 予測可能 / 3.3 入力支援',
  },
  { key: 'Robust', name: '堅牢', criteria: '4.1 互換性（支援技術との適合）' },
] as const;

/** UX 成熟度モデル（Nielsen Norman Group） */
export const UX_MATURITY_LEVELS = [
  { level: 1, name: 'Absent（不在）', desc: 'UXプロセスが存在しない' },
  { level: 2, name: 'Limited（限定的）', desc: '散発的にUX活動が行われる' },
  { level: 3, name: 'Emergent（萌芽）', desc: 'UXの価値が認識され始める' },
  { level: 4, name: 'Structured（構造化）', desc: '組織的なUXプロセスが確立' },
  { level: 5, name: 'Integrated（統合）', desc: 'UXが事業戦略に組み込まれる' },
  { level: 6, name: 'User-driven（ユーザー駆動）', desc: 'ユーザー中心が組織文化に浸透' },
] as const;

/** デザインシステム成熟度 */
export const DS_MATURITY_LEVELS = [
  { level: 1, name: 'Ad-hoc（場当たり）', desc: '統一されたルールがなく個別実装' },
  { level: 2, name: 'Consistent（一貫）', desc: '基本ルール・共通コンポーネントが存在' },
  { level: 3, name: 'Governed（統制）', desc: 'ガバナンス・貢献プロセスが確立' },
  { level: 4, name: 'Integrated（統合）', desc: 'コード・デザイン・ドキュメントが同期' },
] as const;

/** デザイン/UX 文脈かどうかを判定 */
export function isDesignContext(productService: string, issueTexts: string[]): boolean {
  return DESIGN_REGEX.test(productService + ' ' + issueTexts.join(' '));
}

/**
 * プロンプト注入用 デザイン/UX ドメインコンテキスト
 * Pro mode: 詳細版（~400 tokens）
 * Free mode: 圧縮版（~100 tokens）
 */
export function getDesignDomainContext(proMode: boolean): string {
  if (proMode) {
    return `
【デザイン・UX ドメイン知識】
■ ニールセンのユーザビリティ10ヒューリスティクス:
${NIELSEN_HEURISTICS.map((h) => `  ${h.no}. ${h.name}`).join('\n')}

■ ドン・ノーマンの7つの基本デザイン原則:
${NORMAN_PRINCIPLES.map((p) => `  ${p.name}（${p.key}）: ${p.desc}`).join('\n')}

■ WCAG POUR 原則（主要達成基準）:
${WCAG_POUR.map((p) => `  ${p.name}（${p.key}）: ${p.criteria}`).join('\n')}

■ UX 成熟度モデル:
${UX_MATURITY_LEVELS.map((l) => `  Lv${l.level} ${l.name} — ${l.desc}`).join('\n')}

■ デザインシステム成熟度:
${DS_MATURITY_LEVELS.map((l) => `  Lv${l.level} ${l.name} — ${l.desc}`).join('\n')}

【分析指示】
- ユーザーの課題がどのデザイン原則・ヒューリスティクスに関わるか特定し understanding に構造的に記述
- 組織の UX 成熟度・デザインシステム成熟度を推定し、段階に応じた現実的な改善策を提案
- アクセシビリティの課題は WCAG 達成基準番号を付記して具体化
- keyIssue にデザイン観点の最重要イシューを1文で特定`.trim();
  }
  return `[デザイン/UX文脈] ニールセン10ヒューリスティクス（視認性・一貫性・エラー防止等）。ノーマン7原則（発見可能性・フィードバック・アフォーダンス等）。WCAG POUR（知覚可能・操作可能・理解可能・堅牢）。UX成熟度: 不在→限定的→萌芽→構造化→統合→ユーザー駆動。DS成熟度: 場当たり→一貫→統制→統合。課題を原則・ヒューリスティクスに紐付け、成熟度に応じた改善策を提案。keyIssueにデザイン観点の最重要イシューを出力。`;
}
