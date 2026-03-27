/**
 * エンジニアリング・ソフトウェア開発 ドメイン知識ベース
 * DORA Metrics・テストピラミッド・CI/CD成熟度・アーキテクチャ原則・技術負債分類を定義し、プロンプトに注入する
 */

export const ENG_REGEX =
  /アーキテクチャ|マイクロサービス|API|CI\/CD|テスト自動化|デプロイ|コードレビュー|リファクタリング|Docker|Kubernetes|DevOps|SRE|フロントエンド|バックエンド|データベース|クラウド|AWS|GCP|Azure|パイプライン|スプリント|アジャイル|スクラム|Git|ブランチ戦略|プルリクエスト|技術負債|パフォーマンス|スケーラビリティ|モニタリング|オブザーバビリティ|インフラ|Terraform|IaC|セキュリティスキャン|SAST|DAST|DDD|TDD|Clean\s?Architecture|SOLID|デザインパターン|コンポーネント設計|React|Vue|Angular|TypeScript|Node\.js|Go言語|Rust|Python/i;

/** DORA Metrics（DevOps Research and Assessment） */
export const DORA_METRICS = [
  {
    metric: 'デプロイ頻度',
    elite: '1日複数回',
    high: '週1〜月1',
    medium: '月1〜半年1',
    low: '半年以上',
  },
  {
    metric: 'リードタイム',
    elite: '1時間未満',
    high: '1日〜1週間',
    medium: '1週間〜1ヶ月',
    low: '1ヶ月以上',
  },
  {
    metric: 'MTTR（復旧時間）',
    elite: '1時間未満',
    high: '1日未満',
    medium: '1日〜1週間',
    low: '1週間以上',
  },
  { metric: '変更失敗率', elite: '0-15%', high: '16-30%', medium: '31-45%', low: '46%以上' },
] as const;

/** テストピラミッド */
export const TEST_PYRAMID = [
  { layer: 'Unit', ratio: '70%', desc: '関数・クラス単位の高速テスト。実行時間ms単位' },
  { layer: 'Integration', ratio: '20%', desc: 'モジュール間・API結合テスト。DB/外部サービス含む' },
  { layer: 'E2E', ratio: '10%', desc: 'ユーザーシナリオ全体テスト。実行コスト高・メンテ負荷大' },
] as const;

/** CI/CD 成熟度レベル */
export const CICD_MATURITY = [
  { level: 1, label: 'Manual', desc: '手動ビルド・手動デプロイ。手順書ベース' },
  { level: 2, label: 'Scripted', desc: 'シェルスクリプト化。再現性あるが属人的' },
  { level: 3, label: 'Automated', desc: 'CI/CDパイプライン構築。自動テスト・自動デプロイ' },
  { level: 4, label: 'Continuous', desc: '継続的デリバリー。Feature Flag・Canaryリリース' },
  { level: 5, label: 'Autonomous', desc: '自律的運用。自動ロールバック・Self-healing' },
] as const;

/** アーキテクチャ原則 */
export const ARCHITECTURE_PRINCIPLES = [
  {
    principle: 'SOLID',
    desc: '単一責任・開放閉鎖・リスコフ置換・インターフェース分離・依存性逆転',
  },
  {
    principle: 'DDD Bounded Context',
    desc: 'ドメイン境界の明確化。コンテキストマップで依存関係を管理',
  },
  {
    principle: 'Clean Architecture',
    desc: 'Entities → Use Cases → Interface Adapters → Frameworks。依存は内側へ',
  },
] as const;

/** 技術負債分類（Martin Fowler's Technical Debt Quadrant） */
export const TECH_DEBT_QUADRANT = [
  {
    type: '意図的×無謀',
    desc: '「設計する時間がない」— 速度優先で品質を犠牲。短期は速いが長期コスト大',
  },
  { type: '意図的×慎重', desc: '「今はこれで出荷し後でリファクタ」— 計画的負債。返済計画が重要' },
  {
    type: '無意識×無謀',
    desc: '「レイヤリングって何？」— スキル不足による負債。教育・レビューで防止',
  },
  { type: '無意識×慎重', desc: '「今ならこう設計する」— 経験で気づく負債。継続的改善で対処' },
] as const;

/** エンジニアリング文脈かどうかを判定 */
export function isEngineeringContext(productService: string, issueTexts: string[]): boolean {
  return ENG_REGEX.test(productService + ' ' + issueTexts.join(' '));
}

/**
 * プロンプト注入用 エンジニアリング ドメインコンテキスト
 * Pro mode: 詳細版（~400 tokens）
 * Free mode: 圧縮版（~100 tokens）
 */
export function getEngineeringDomainContext(proMode: boolean): string {
  if (proMode) {
    return `
【エンジニアリング・ソフトウェア開発 ドメイン知識】
■ DORA Metrics（開発生産性の4指標 ※チーム規模・ドメインで大きく変動）:
${DORA_METRICS.map((m) => `  ${m.metric}: Elite=${m.elite} / High=${m.high} / Medium=${m.medium} / Low=${m.low}`).join('\n')}

■ テストピラミッド（推奨比率 ※プロジェクト特性で調整）:
${TEST_PYRAMID.map((t) => `  ${t.layer}（${t.ratio}）: ${t.desc}`).join('\n')}

■ CI/CD成熟度:
${CICD_MATURITY.map((c) => `  Lv${c.level} ${c.label}: ${c.desc}`).join('\n')}

■ アーキテクチャ原則:
${ARCHITECTURE_PRINCIPLES.map((a) => `  ${a.principle}: ${a.desc}`).join('\n')}

■ 技術負債分類（Fowlerの4象限）:
${TECH_DEBT_QUADRANT.map((d) => `  ${d.type}: ${d.desc}`).join('\n')}

【分析指示】
- ユーザーの課題がDORA Metricsのどの指標に影響するか特定し、現在の成熟度レベルを推定
- 技術負債は4象限のどれに該当するか分類し、返済の優先度と戦略を提案
- CI/CD成熟度の現在レベルと次のレベルへの具体的ステップを示す
- 数値は「業界Eliteチーム比」「現状比+○%」等の相対表現を優先。上記ベンチマークは業界目安であり、ユーザー入力に具体数値がない場合は「一般的に」「業界目安では」と付記する`.trim();
  }
  return `[ENG文脈] DORA Metrics: デプロイ頻度・リードタイム・MTTR・変更失敗率で生産性評価。テストピラミッド: Unit70%/Integration20%/E2E10%。CI/CD成熟度: Manual→Scripted→Automated→Continuous→Autonomous。原則: SOLID・DDD Bounded Context・Clean Architecture。技術負債: 意図的×無謀/慎重、無意識×無謀/慎重の4象限で分類。課題のDORA影響・負債分類・CI/CD成熟度を分析し、相対値優先で改善提案。`;
}
