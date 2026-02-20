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
    label: '新規事業 PoC判断',
    prov: 'openai', modelId: 'gpt-5-nano', dep: 2,
    form: {
      projectName: 'Catalyst-319',
      productService: 'スマート農業IoT（大手食品メーカー新規事業）',
      teamGoals: '6ヶ月でPoC完了・PMF仮説3件検証・投資回収見通し策定',
      sessionType: 'innovation',
      customSession: '',
      tlMode: 'period',
      tlStart: '2025-05-01',
      tlEnd: '2025-10-31',
      tlDead: '',
      issues: [
        { text: '仮説検証未完', detail: 'PoC開始から4ヶ月、農家ヒアリング6件のみでPMF仮説未確定', sub: ['定量データ未取得', '意思決定者へのアクセス不足'] },
        { text: '組織的抵抗', detail: '既存農業資材事業部との競合懸念でリソース確保困難', sub: [] },
      ],
    },
    results: {
      understanding: `大手食品メーカーの新規事業PoCは「組織vs市場」の二重課題。農業IoT市場は2030年に国内3,000億円見込みだが、既存事業との利害対立と社内承認プロセスが最大ボトルネック。PoC4ヶ月・ヒアリング6件は意思決定に必要な証拠として不十分であり、3C+リーンキャンバスで仮説を構造化し残り2ヶ月で定量検証に集中する必要がある。`,
      ideas: [
        { title: 'リーンキャンバス再構築', description: '現状の仮説をリーンキャンバスに整理し、未検証の前提仮説を優先度順にリスト化。最重要仮説「農家の支払い意欲」を2週間で定量検証するスプリント設計。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: '顧客セグメント絞り込み', description: '50ha以上の大規模農家5セグメントに絞りNPS調査を実施。「なくなったら困る」40%超のセグメントをICPとして確定し投資集中。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'スポンサー役員の確保', description: '既存事業部の懸念を逆用し「DX化でシェア防衛」のフレームで役員スポンサーを取得。月次報告でCxO可視化を確保し予算承認の障壁を除去。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'パイロット農家との共同開発契約', description: '3農家と共同開発MOUを締結し顧客検証と技術検証を同時進行。フィールドデータを取得しながら製品仕様を確定。ROI試算の実データ源として活用。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: '競合PoC比較分析', description: 'クボタ・ヤンマー・スタートアップのIoTソリューションをベンチマーク分析し差別化ポイントを特定。「食品メーカー×農家」の川上統合モデルを唯一の競合優位として設計。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
        { title: '投資回収シナリオ3案作成', description: 'Bull/Base/Bearの3シナリオでROI試算。投資回収5年以内・市場シェア3%のBaseシナリオを経営会議提出用に整備。Go/No-Goの判断基準を定量化。', priority: 'Low', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'マーケ GTM戦略',
    prov: 'openai', modelId: 'gpt-5-nano', dep: 2,
    form: {
      projectName: 'Beacon-472',
      productService: 'BtoB営業支援SaaS（スタートアップ、ARR 3,000万円）',
      teamGoals: '新規リード月300件・CPA ¥50,000以下・パイプライン転換率25%',
      sessionType: 'marketing',
      customSession: '',
      tlMode: 'period',
      tlStart: '2025-06-01',
      tlEnd: '2025-11-30',
      tlDead: '',
      issues: [
        { text: 'CAC高騰', detail: '6ヶ月でCACが1.8倍に増加、ROASが目標の60%', sub: ['有料広告CPAが上限を突破', 'オーガニック流入が停滞'] },
        { text: '競合ポジショニング不明確', detail: '営業が「他社との違い」を説明できない', sub: [] },
      ],
    },
    results: {
      understanding: `ARR 3,000万円のBtoB SaaSはPMF後のGTMスケールが最重要フェーズ。CAC高騰はチャネルミックスの問題ではなくICP（理想顧客プロファイル）の不明確さが根本原因。ポジショニング不明確は製品機能ではなく「誰の・どの課題を解決するか」の再定義が必要。`,
      ideas: [
        { title: 'ICP再定義とABM導入', description: '既存顧客のヘルススコア上位20%を分析しICP（業種・規模・役職・ペインパターン）を再定義。ABMリスト500社を特定しパーソナライズドアウトリーチに集中。CAC/3を目標。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'コンテンツSEO×インバウンド強化', description: '競合が弱いロングテールキーワード30件を特定し月4本の専門記事を公開。半年でオーガニック流入を現在比3倍に拡大しCAC構造を転換。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: '競合ポジショニングマップ策定', description: '「価格×機能の深さ」「導入スピード×カスタマイズ性」の2軸でポジショニングマップを作成。自社の「30日で稼働・CRM連携不要」を差別化軸として営業資料を全面改訂。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'カスタマーケーススタディ量産', description: 'NPS +50以上の顧客5社からケーススタディを作成。業種別の「導入前後ROI」を定量化した1ページャーを商談材料として活用しCV率改善。', priority: 'Medium', effort: 'Low', impact: 'High' },
        { title: 'パートナー販売チャネル開拓', description: 'SIer・コンサル10社とのリセラー契約でCAC/2を実現。紹介フィー設計とパートナー向けトレーニング資料を整備し間接販売比率30%を目標。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
        { title: 'プロダクトレッドGrowth要素追加', description: 'フリートライアルの活用データを分析し「アハモーメント」を特定。オンボーディングフローを最適化しトライアル→有料転換率を現状12%→20%へ。', priority: 'Low', effort: 'Medium', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'オペレーション改革',
    prov: 'anthropic', modelId: 'claude-sonnet-4-20250514', dep: 2,
    form: {
      projectName: 'Fulcrum-651',
      productService: '食品物流企業（従業員500名、拠点12箇所）',
      teamGoals: 'オペコスト15%削減・配送リードタイム20%短縮・品質不良率0.5%以下',
      sessionType: 'ops',
      customSession: '',
      tlMode: 'period',
      tlStart: '2025-08-01',
      tlEnd: '2026-03-31',
      tlDead: '',
      issues: [
        { text: 'プロセス非効率', detail: '手作業工数が全体の45%、入力エラー率3.2%', sub: ['Excel管理で属人化', 'ダブルチェック工数が月200時間'] },
        { text: '拠点間データ分断', detail: '12拠点の在庫・配送データがリアルタイム共有されない', sub: [] },
      ],
    },
    results: {
      understanding: `食品物流の典型的なオペ課題。Excel依存・手作業による属人化が根本原因で、デジタル化の前にプロセス標準化が必須。12拠点のデータ分断はWMS/TMSのSaaS化で解決可能。投資対効果はコスト削減額で測定しやすく、ROI提示が経営承認の鍵。`,
      ideas: [
        { title: 'バリューストリームマッピング', description: '主要プロセス（受注→配送→請求）のVSMを実施し非付加価値工数を特定。全体の45%の手作業のうち「即座に廃止可能」「自動化対象」「標準化対象」に分類し改革ロードマップ作成。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'WMS/TMS一体型SaaS導入', description: 'HACOBU or オービックのWMS/TMS統合SaaSを導入し12拠点をリアルタイム連携。在庫可視化・配送最適化で拠点間の「お見合い在庫」を解消し在庫回転率+20%。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'RPA導入で手作業工数50%削減', description: '入力・突合・レポート生成の3業務にRPAを導入。月200時間のダブルチェックを自動化しエラー率3.2%→0.3%に低減。ROI：初期投資600万円・年間削減効果2,400万円。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: '配送ルート最適化AI', description: 'AIルート最適化ツール（Hacobu MOVO）を12拠点に展開。燃料費15%・残業時間20%削減を実現。ドライバー不足問題の緩和にも寄与。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: '品質管理デジタル化', description: 'IoT温度センサー+QRコードで冷凍品の温度履歴を自動記録。不良品発生時の原因追跡を4時間→15分に短縮。食品安全基準への対応もトレーサビリティ強化で同時解決。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'デザインシステム整備',
    prov: 'openai', modelId: 'gpt-5-mini', dep: 2,
    form: {
      projectName: 'Mosaic-738',
      productService: '大規模Webサービス（DAU 50万、プロダクト4本）',
      teamGoals: '全プロダクト採用率80%・新機能実装速度2倍・a11y AA準拠100%',
      sessionType: 'design-system',
      customSession: '',
      tlMode: 'period',
      tlStart: '2025-09-01',
      tlEnd: '2026-02-28',
      tlDead: '',
      issues: [
        { text: '採用率低下', detail: '新機能の60%が独自実装でDSを不使用', sub: ['ドキュメント不足で使い方不明', 'コンポーネントAPIが不明確'] },
        { text: 'マルチプロダクト展開困難', detail: 'トークン設計がシングルブランド前提で4本目のプロダクトに対応不可', sub: [] },
      ],
    },
    results: {
      understanding: `DSの採用率低下は「ドキュメントの質」と「開発者体験（DX）」の問題。コンポーネント数の問題ではなく、既存コンポーネントの発見性・理解容易性・拡張性が不足している。マルチブランド対応はトークンアーキテクチャの再設計が必要で、既存コンポーネントへの影響を最小化したDesign Token 2.0移行計画が必要。`,
      ideas: [
        { title: 'DS成熟度モデル評価', description: 'Brad Frost DSのLevel 0-4でチームの現在地を評価。「採用率60%未達」の根本原因を「認知不足/使いにくさ/不足機能」に分類し改善優先度を定量化。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'Storybook×Figmaの双方向同期', description: 'Storybook 7+Figma Code Connectで設計-実装の双方向同期を実現。デザイナーが作ったコンポーネントが即座に開発者のドキュメントに反映されDXを向上。採用率60%→80%の主要施策。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'Design Token 2.0移行', description: 'W3C Design Token仕様準拠のトークンアーキテクチャに移行。Global→Alias→Componentの3層構造でマルチブランド対応。既存コンポーネントは段階的移行しbreaking changeゼロを保証。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'a11y自動テスト統合', description: 'axe-core+Storybookでa11yテストをCI/CDに組み込み。WCAG AA準拠チェックを自動化し新規コンポーネントのa11y違反を即座に検出。現状40%→100%の達成ロードマップ策定。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: 'DS採用インセンティブ制度', description: 'プロダクトチームのスプリントKPIにDS採用率を追加。「DS使用＝開発速度2倍」のデータを実証し自発的採用を促進。DS非採用のカスタム実装にはデザインレビューの承認を必須化。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: '海外展開戦略',
    prov: 'anthropic', modelId: 'claude-sonnet-4-20250514', dep: 2,
    form: {
      projectName: 'Meridian-892',
      productService: 'BtoB SaaS（国内ARR 5億円、東南アジア展開検討）',
      teamGoals: '東南アジア3ヶ国で初期顧客50社獲得・現地ARR 1億円・12ヶ月以内',
      sessionType: 'other',
      customSession: '海外展開戦略',
      tlMode: 'period',
      tlStart: '2025-10-01',
      tlEnd: '2026-09-30',
      tlDead: '',
      issues: [
        { text: '市場優先度が未確定', detail: 'ASEAN6ヶ国のどこから参入すべきか判断基準なし', sub: ['市場規模・競合・法規制の情報不足', '現地パートナー候補なし'] },
        { text: 'ローカライゼーションコスト', detail: '多言語対応・現地法規制対応で推定開発コスト3,000万円超', sub: [] },
      ],
    },
    results: {
      understanding: `国内ARR 5億円はASEAN展開の資金的裏付けとして十分。優先市場はシンガポール（ビジネス環境・英語対応）→タイ（製造業集積）→ベトナム（成長率）の順が典型的なJapanese SaaSの参入パターン。ローカライゼーション3,000万円超はパートナー経由のWhiteLabelモデルで初期投資を1/3に圧縮可能。PMF確認前の全市場同時参入はリソース分散で失敗リスクが高い。`,
      ideas: [
        { title: '市場優先度マトリクス', description: '市場規模・競合密度・法規制難易度・自社競合優位の4軸でASEAN6ヶ国をスコアリング。シンガポールを第1フェーズとして選定し6ヶ月で10社の参照顧客を獲得してから第2市場に展開する段階的戦略。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'ホワイトラベルパートナー戦略', description: '現地SIerとのホワイトラベル契約でローカライゼーションコストをパートナー負担に転換。自社はプロダクトコア+APIに集中し初期投資を1,000万円以下に抑制。シンガポール2社・タイ2社を候補選定。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'Multi-tenant国際化アーキテクチャ', description: '言語・通貨・法規制をテナント設定で切り替えるi18nアーキテクチャに改修。初期は英語・タイ語・日本語の3言語対応。開発コストを段階化し市場確認後に追加言語投資。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'シンガポールPoC（6ヶ月）', description: 'シンガポールで日系企業10社をパイロット顧客として獲得。現地サポートはリモート+月1回の訪問で対応。NPS・解約率・拡張意欲のデータを取得し全市場展開の投資判断材料とする。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: '現地規制サンドボックス活用', description: 'シンガポールMASのFinTechサンドボックス、タイのDigital Economyプログラムを活用し規制対応コストを補助金で賄う。各国のIT展示会（Gitex Asia・Slush Singapore）でブランド認知を獲得。', priority: 'Low', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'プロダクト ロードマップ',
    prov: 'openai', modelId: 'gpt-5-mini', dep: 2,
    form: {
      projectName: 'Helix-563',
      productService: 'BtoB受発注プラットフォーム（ユーザー1,200社）',
      teamGoals: '技術的負債50%削減・デプロイ頻度週1→日次・新機能開発速度2倍',
      sessionType: 'product',
      customSession: '',
      tlMode: 'period',
      tlStart: '2025-07-01',
      tlEnd: '2025-12-31',
      tlDead: '',
      issues: [
        { text: '技術的負債', detail: 'リリース頻度が低下、バグ修正に開発工数の60%', sub: ['テストカバレッジ28%', 'モノリスアーキテクチャで変更が困難'] },
        { text: 'インフラコスト高騰', detail: 'トラフィック増でAWSコストが6ヶ月で2.3倍', sub: [] },
      ],
    },
    results: {
      understanding: `技術的負債60%・テストカバレッジ28%・モノリスの三重苦は典型的なスケールアップ期の課題。一括リファクタリングは現実的でなく「Strangler Fig + テスト先行」の段階的移行が最適解。インフラコスト2.3倍はアーキテクチャ改善と同時にFinOps導入で短期削減可能。`,
      ideas: [
        { title: 'テスト戦略の最優先立て直し', description: 'テストカバレッジ28%→70%を最優先に設定。新規コードは100%テスト必須・既存コードは変更時にテスト追加のルール化。TDDハンドブック整備とペアプログラミングセッションでチーム全体のテスト文化を醸成。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'マイクロサービス段階移行', description: 'Strangler Figパターンで「受発注コア」「在庫管理」「請求」の順でサービス分離。各サービスにCI/CDパイプラインを整備しデプロイ頻度を段階的に改善。6ヶ月でコアサービスの分離完了を目標。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'FinOps導入でコスト30%削減', description: 'AWSコスト分析でEC2 Reserved Instance移行・RDSサイズ適正化・S3ライフサイクルポリシー設定。Spot Instanceのバッチ処理活用で即時20-30%削減。月次コストレビュー体制を確立。', priority: 'High', effort: 'Low', impact: 'Medium' },
        { title: 'フィーチャーフラグ基盤整備', description: 'LaunchDarkly or Flagsmithでフィーチャーフラグを導入。デプロイとリリースを分離しデイリーデプロイ体制を3ヶ月で確立。カナリアリリースとA/Bテストの基盤として活用。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: '開発者生産性ダッシュボード', description: 'DORAメトリクス（デプロイ頻度・リードタイム・変更失敗率・復旧時間）を計測し週次レビューに組み込む。技術的負債削減の進捗を定量化し経営層への可視化を確保。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
        { title: 'AIコードレビュー導入', description: 'GitHub Copilot+PR-Agentを導入しコードレビュー工数を50%削減。セキュリティスキャン・バグ検出を自動化しレビュアーは設計判断に集中できる環境を整備。', priority: 'Low', effort: 'Low', impact: 'Medium' },
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
