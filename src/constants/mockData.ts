import { MockScenario } from '../types';

export const MOCK_SCENARIOS: MockScenario[] = [
  {
    label: 'HR SaaS グロース',
    prov: 'openai', modelId: 'gpt-5-nano', dep: 3,
    form: {
      projectName: 'Vertex-421',
      productService: 'HR管理SaaS（中小企業向け）',
      teamGoals: 'ARR 2億円達成・チャーンレート3%以下・NPS +40以上',
      sessionType: 'growth',
      customSession: '',
      tlMode: 'period',
      tlStart: '2025-04-01',
      tlEnd: '2025-09-30',
      tlDead: '',
      issues: [
        { text: 'リテンション低下', detail: '月次チャーン6%→業界平均2%の3倍', sub: ['オンボーディング完了率42%', '30日以内解約が全体の38%'] },
        { text: 'CAC高騰', detail: 'CACが18ヶ月で2.4倍に増加、LTV/CAC=1.8（目標3.0）', sub: [] },
        { text: 'PMF検証未完', detail: 'セグメント別NPS：50名以下+12、51-200名+38', sub: [] },
      ],
    },
    results: {
      understanding: `現状分析：HR SaaS市場は2025年に国内1,800億円規模で年率12%成長を継続しているが、中小企業セグメントでは価格感度が高くスイッチングコストが低い構造的課題がある。チャーン6%（業界平均2%）は主にオンボーディング失敗に起因しており、30日以内解約38%という数値はプロダクト-マーケットフィットの問題というよりも、初期価値体験の設計課題を示唆している。LTV/CAC=1.8は持続可能な成長の臨界点を下回っており、CAC削減よりもLTV向上に優先度を置くべき局面。51-200名セグメントのNPS+38はコアターゲットとしての有望性を示しており、50名以下は現時点では戦略的撤退を含む選択と集中が有効。ARR2億円達成にはNet Revenue Retention 110%以上が必要条件。`,
      ideas: [
        { title: 'オンボーディング完走率2倍化', description: 'JTBD分析で「初期価値到達（Time-to-Value）」を特定し、最小価値体験（MVE）を14日以内に設計。チェックリスト型→プロダクトツアー型に転換し、CS介入トリガーを行動ベース（ログイン3日未満）に変更。期待効果：チャーン6%→3%、LTV+40%。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'コホート別ヘルススコア導入', description: 'DAU/MAU・機能利用率・データ入力量の3軸でヘルススコアを算出し、スコア低下時にCS自動アラート。リスクコホートへの先手介入でエクスパンション機会も同時検出。Gainsight相当機能をin-houseで3ヶ月構築。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'PLG（プロダクト主導型グロース）転換', description: 'フリーミアム導入でCAC構造を転換。51-200名セグメントにフォーカスしたバイラル機能（組織図共有・承認ワークフロー外部招待）でオーガニック獲得比率を現在12%→35%へ。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'セグメント別価格体系再設計', description: '50名以下は撤退or価格引上げ、51-200名はSuccess Planを追加層として設計（+¥5,000/月でCS月次レビュー付）。ARPU+25%とチャーン低減の両立でNRR改善を加速。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: 'パートナーチャネル構築', description: '社労士・税理士事務所300社とのリセラー契約でCAC/3を実現。紹介インセンティブ設計とパートナーポータル開発で間接販売比率を12ヶ月で30%へ。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
        { title: 'プロダクトアナリティクス基盤整備', description: 'Mixpanel or Amplitude導入でファネル可視化。機能別採用率・セッション深度・エラー頻度をリアルタイムモニタリングし、週次プロダクトレビューに組み込む。意思決定サイクルを月次→週次に短縮。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
        { title: 'カスタマーサクセス専任化', description: '現在営業兼任のCS機能を分離。51-200名担当CSを2名採用し、1人あたり担当社数を120社以下に抑制。QBR（四半期ビジネスレビュー）標準化でエクスパンション収益+15%。', priority: 'Low', effort: 'Low', impact: 'Medium' },
        { title: 'AI機能によるスイッチングコスト向上', description: '給与計算AI・シフト最適化AIを差別化機能として追加。独自データ蓄積がスイッチングコストを形成し競合優位性を確保。GPT-4o API活用で開発コスト最小化。', priority: 'Low', effort: 'High', impact: 'High' },
      ],
      deepDive: `### PMF検証の定量アプローチは？\n\n## Rahul Vohra式PMFスコア適用\n\n| 指標 | 現状 | PMF水準 |\n|---|---|---|\n| 「なくなったら残念」% | 測定未 | **40%以上** |\n| NPS（51-200名） | +38 | 目標+50 |\n| 30日リテンション | 62% | 目標80% |\n| Organic比率 | 12% | 目標30% |\n\n## 推奨アクション\n\n1. **Sean Ellis Test** を既存顧客全件に実施（1週間で完了可能）\n2. セグメント別にNPS+40超の顧客コホートを特定 → ICP（理想顧客プロファイル）を再定義\n3. ICPに絞った新規獲得にリソース集中し、PMFスコアを月次計測`,
      refinement: `## 優先度付きロードマップ（90日）\n\n**Phase 1（〜30日）：止血**\n- オンボーディングフロー刷新（MVE設計）\n- ヘルススコアβ版リリース\n- 50名以下セグメントへの価格改定通知\n\n**Phase 2（31〜60日）：基盤**\n- PLGバイラル機能リリース\n- パートナー候補30社へのアウトリーチ\n- CS専任採用（1名）\n\n**Phase 3（61〜90日）：加速**\n- PLGフリーミアム正式ローンチ\n- AI機能PoC開始\n- QBRプログラム全顧客展開\n\n> **KPI確認ポイント**：Day30時点でチャーン4.5%以下、Day60でLTV/CAC>2.2を達成できていれば軌道上`,
    },
  },
  {
    label: 'DX推進 製造業',
    prov: 'anthropic', modelId: 'claude-sonnet-4-20250514', dep: 2,
    form: {
      projectName: 'Obsidian-537',
      productService: '部品メーカー（従業員800名）社内DX',
      teamGoals: '基幹システム刷新・現場デジタル化・年間コスト15%削減',
      sessionType: 'dx',
      customSession: '',
      tlMode: 'period',
      tlStart: '2025-07-01',
      tlEnd: '2026-06-30',
      tlDead: '',
      issues: [
        { text: 'レガシーERP依存', detail: '20年前導入のオンプレERPで改修コスト年間8,000万円', sub: ['ベンダー依存でカスタマイズ不可', 'API非対応でデータ連携不能'] },
        { text: '現場のデジタルリテラシー不足', detail: '平均年齢52歳、PC操作研修未実施', sub: [] },
        { text: 'データサイロ', detail: '生産・品質・在庫が別システムで横断分析不可', sub: [] },
      ],
    },
    results: {
      understanding: `製造業DXの典型的なレガシー課題。段階的移行（ストラングラーフィグパターン）が必須で、一括刷新は操業リスクが高すぎる。現場リテラシー課題はChangeManagement設計が技術同様に重要。`,
      ideas: [
        { title: 'ストラングラーフィグ型マイグレーション', description: 'ERPを一括刷新せず周辺機能からSaaS化。在庫管理→品質管理→生産計画の順で段階移行し既存ERPと並行稼働期間を設ける。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'データレイク構築（ハブ＆スポーク）', description: '各システムからのETLパイプラインを構築しSnowflake or BigQueryに集約。横断ダッシュボードを3ヶ月で稼働させ経営判断のデータ化を先行実現。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'デジタルコーチ制度', description: '各ライン2名のデジタルコーチを選出し集中研修後に現場展開。トップダウン研修でなく「現場の人が現場を教える」モデルで定着率向上。', priority: 'High', effort: 'Low', impact: 'Medium' },
        { title: 'IoTセンサー先行導入', description: '主力ライン3本にIoTセンサーを先行導入し稼働率・不良率のリアルタイム計測を実現。ROIを数値化してから全ライン展開の意思決定材料に。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: 'ERP並行稼働コスト削減', description: '移行期間中の並行稼働コストを最小化するため機能別停止スケジュールを設計。年間8,000万円→移行完了時ゼロのロードマップを明示。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
        { title: 'COE（デジタル推進室）設立', description: 'IT部門とは別にビジネス理解のあるDX推進室を設置。外部DXコンサル1名常駐で内製化を加速。2年で内製比率70%を目標。', priority: 'Low', effort: 'Medium', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'プロダクト UXリデザイン',
    prov: 'openai', modelId: 'gpt-5-mini', dep: 2,
    form: {
      projectName: 'Prism-284',
      productService: 'BtoBマーケティング自動化ツール',
      teamGoals: 'アクティブ利用率45%→70%・機能採用率改善・NPS+20pt向上',
      sessionType: 'cx',
      customSession: '',
      tlMode: 'deadline',
      tlStart: '',
      tlEnd: '',
      tlDead: '2025-12-31',
      issues: [
        { text: 'NPS低下', detail: 'NPS -5（昨年+18）、主因は「使いにくい」', sub: ['設定項目が複雑すぎる', 'ヘルプドキュメントが見つからない'] },
        { text: 'オンボーディング離脱', detail: '初回設定完了率31%', sub: [] },
      ],
    },
    results: {
      understanding: `NPS急落（+18→-5）と初回設定完了率31%は、プロダクトの機能過多・情報アーキテクチャの複雑化が主因。ユーザーは価値を理解する前に離脱しており、まずTime-to-Valueを短縮するUX改善が最優先。`,
      ideas: [
        { title: 'プログレッシブオンボーディング設計', description: '初回ログイン時に「やりたいこと」を3択で選択させ、ユースケース別の最短セットアップフローを提供。不要な設定項目を段階的に表示し認知負荷を低減。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'コンテキストヘルプ強化', description: '設定画面各項目にツールチップ＋動画ショート（15秒以内）を埋め込み。Intercomのin-app tourで設定ステップをガイド。サポート問い合わせ数-30%を目標。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'テンプレートライブラリ拡充', description: '業界×用途別テンプレートを20種類用意し、0→1の設定コストをゼロに。テンプレートから開始したユーザーのDay30リテンションは既存比+40%の仮説を検証。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: 'IA（情報設計）リファクタリング', description: 'カードソーティング調査で現行のナビゲーション構造を検証し、ユーザーのメンタルモデルに合わせてサイドバー・設定画面を再設計。', priority: 'Medium', effort: 'High', impact: 'Medium' },
        { title: 'VOCダッシュボード整備', description: 'NPS・サポートチケット・セッション録画（Hotjar）を週次でレビューするVOCループを確立。定性フィードバックを優先度マトリクスに変換するプロセスを標準化。', priority: 'Low', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
];

export const SEEDS = ['Horizon','Prism','Meridian','Lattice','Helix','Nimbus','Vertex','Cadence','Sextant','Anvil','Loom','Beacon','Torque','Fulcrum','Mosaic','Pinnacle','Obsidian','Catalyst','Epoch','Tessera'];

let _seedIdx = 0;
export const nextSeed = (): MockScenario => {
  const s = MOCK_SCENARIOS[_seedIdx % MOCK_SCENARIOS.length];
  _seedIdx++;
  return s;
};
