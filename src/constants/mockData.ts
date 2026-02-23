import { MockScenario } from '../types';
import { DEFAULT_MODEL_ID } from './models';

export const MOCK_SCENARIOS: MockScenario[] = [
  {
    label: 'IT人材紹介 事業戦略',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Nimbus-447',
      productService: 'ITエンジニア特化の人材紹介エージェント（CA 15名・年間成約300件）',
      teamGoals: '成約件数+40%・ハイスキル層（年収600万+）比率20%・CA一人当たり生産性1.5倍',
      sessionType: 'ops',
      customSession: '',
      issues: [
        { text: 'ハイスキル層の獲得難', detail: '登録者の70%がジュニア・レガシー系、ハイスキル層の登録比率8%で成約単価が低い', sub: ['エンジニアのエージェント不信が強く登録障壁が高い', '技術系コミュニティ・SNSへのリーチがない'] },
        { text: '直接採用・競合増加で差別化が困難', detail: 'LinkedIn等での直接採用が3年で2倍増、大手との価格競争に巻き込まれている', sub: ['差別化ポイントが「担当者の質」のみで再現性・スケールなし', 'フィー値下げ圧力でLTVが低下'] },
        { text: 'CA業務の属人化とスカウト効率の低さ', detail: 'スカウト返信率2〜3%、CA工数の40%をスカウト文作成が占め、ノウハウが個人依存', sub: [] },
      ],
    },
    results: {
      understanding: `IT人材紹介市場は構造的な転換期にある。直接採用・大手統合・AIマッチングの3つの圧力が同時に進行しており、「量×汎用」モデルの賞味期限が切れつつある。ハイスキルエンジニアは従来のエージェントモデルを嫌い、コミュニティや同業者の推薦を信頼する傾向が強まっている。差別化の軸は「エンジニアに信頼されるCA」から「エンジニアに信頼されるブランド・コミュニティ」への転換が必要。CA業務のAI化は生産性向上と同時にCA自身をより高付加価値な仕事（信頼構築・交渉）に集中させる基盤となる。`,
      ideas: [
        { title: 'ハイスキルエンジニア特化の独自ポジション確立', description: '「年収600万+のバックエンド・インフラ・ML系エンジニアに特化」など明確な絞り込みで大手との差別化を図る。特化することで求人の解像度が上がり、マッチング精度・内定率・フィー単価が同時に改善する。6ヶ月でニッチ1位ポジションの検証を実施。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'エンジニアコミュニティへの参入と信頼構築', description: 'Zenn・Qiita・技術系Discordへのスポンサーや勉強会共催でブランドをエンジニアのいる場所で構築。「エージェントではなく技術キャリアの相談相手」としてポジショニング。コミュニティ経由の自然流入は広告CAC比で1/5以下の実績が業界内で報告されている。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'AIスカウト×CA高付加価値化', description: '生成AIを活用しスキル×求人×過去成約データからパーソナライズドスカウト文を自動生成。CA工数を現状の40%→5%に削減し、浮いた時間を面談品質・クロージング・企業リレーション強化に再投資。返信率3%→8%を目標とした検証スプリントを設計。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'ユニットエコノミクスの再設計', description: 'セグメント別（スキル×年収帯）の成約率・フィー・CAC・LTVを計測し収益性の高いセグメントを特定。ジュニア・レガシー系は自動化（ローコスト対応）、ハイスキル系はCA集中投資のハイブリッドモデルに移行。現状「全員同じ対応」からの脱却。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'CA業務標準化×ナレッジDB構築', description: 'トップCAの面談ヒアリング・求人マッチング・クロージング手法を動画+テキストでドキュメント化。NotionベースのナレッジDBと月次ケーススタディ共有会で平均CAの成約率をトップCA比+50%に引き上げる。新人立ち上がり期間を6ヶ月→3ヶ月に短縮。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: '企業クライアントのサクセス設計', description: '採用後3ヶ月・6ヶ月のフォローアップを標準化し、入社者の定着率データを企業に提供。「採用して終わり」から「採用後の定着支援」に価値を拡張することで、リピート率と単価の両立を図る。定着率データはEEATの強化にも活用可能。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'CA業務 AI・DX化',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Anvil-583',
      productService: 'ITエンジニア向け人材紹介（キャリアアドバイザー業務・Salesforce運用）',
      teamGoals: 'CA一人当たり月次成約+50%・スカウト返信率3%→8%・CRM活用率80%達成',
      sessionType: 'ops',
      customSession: '',
      issues: [
        { text: 'CRM活用不足', detail: 'SalesforceはデータDB化に留まり、自動アクション・スコアリング・アラートに未活用', sub: ['求職者の転職意欲変化をリアルタイム把握できない', 'CA間での顧客情報共有がSlack依存'] },
        { text: 'スカウト効率の低さ', detail: 'スカウト返信率2〜3%・CA工数の40%を占める・テンプレート文で個別最適化なし', sub: [] },
        { text: 'CA業務の属人化', detail: 'トップCAのノウハウが個人依存で、退職リスクと新人育成遅延が慢性的に発生', sub: [] },
      ],
    },
    results: {
      understanding: `CA業務の非効率は「CRMをDBとして使っている」「スカウトを量でカバーしている」「ノウハウを共有していない」の3つの構造問題が重なっている。Salesforceはレコード管理ではなく行動自動化ツールとして使うことで、CA一人当たりの対応キャパシティを30〜50%拡大できる。AIスカウト文生成はCAの単純労働を削減し、高付加価値な面談・交渉に集中させる投資対効果が最も高い施策。`,
      ideas: [
        { title: 'Salesforce活用度フェーズ別ロードマップ', description: 'CRM活用を「Level 1: データ入力」→「Level 2: 行動トリガー自動化」→「Level 3: スコアリング×予測」の3段階で設計。まず求職者の「ログイン・応募・資料閲覧」をトリガーにCA自動アラートを設定（Level 2）。工数ゼロでフォロータイミングが最適化され成約率+10〜15%の効果が見込める。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'AIスカウト文生成の内製化', description: '生成AIで「求職者スキルサマリー×求人JD×類似成約事例」を入力しパーソナライズドスカウト文を自動生成。CAはレビュー+送信のみに集中。スカウト作成工数を40%→5%に削減し、浮いた時間を面談・フォローに再配分。返信率3%→8%のABテストを4週間で実施。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: '転職意欲スコアリングの自動化', description: '求職者の行動データ（ログイン頻度・求人閲覧数・資料DL・面談後の反応速度）をSalesforceにイベント連携し意欲スコアを自動算出。スコア上昇時のCA自動通知で「タイミングを逃さないフォロー」を実現。CA経験値に依らない対応品質の底上げ。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'CAナレッジDB×ケーススタディ標準化', description: 'トップCAの「最初の15分の質問設計」「年収交渉のトークスクリプト」「内定後の不安解消フロー」をNotion動画+テキストでドキュメント化。月次ケーススタディ共有会と組み合わせ、新人CA立ち上がり6ヶ月→3ヶ月を目標に設計。', priority: 'Medium', effort: 'Low', impact: 'High' },
        { title: 'JD（求人票）AI品質改善', description: '企業クライアントの既存JDをAIで分析し「エンジニアが離脱するポイント」を特定。技術スタック・開発環境・チーム構成・意思決定スピードなどエンジニアが重視する情報を追記するテンプレートを提供。JD品質向上で応募率・内定承諾率の改善を同時に図る。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: '求人メディア AIO転換',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Lattice-291',
      productService: 'ITエンジニア向け転職メディア（月間PV 60万・記事数3,500本）',
      teamGoals: 'AI検索流入の確立・コンテンツCV率0.3%→1.5%・ターゲット適合ユーザー比率向上',
      sessionType: 'marketing',
      customSession: '',
      issues: [
        { text: 'SEO流入の質的低下', detail: 'PV維持もCV率0.3%→業界平均1.2%の1/4、ターゲット外流入が増加', sub: ['ボリューム優先でターゲット適合度を未計測', 'ネガティブ訴求記事が低意欲層を集めている'] },
        { text: 'EEAT不足・AIO未対応', detail: '外注ライター中心でE(経験)/E(専門性)が担保されておらずAI検索からの流入がほぼゼロ', sub: ['著者情報・一次情報が皆無', '構造化データ（FAQ Schema等）未整備'] },
        { text: 'ターゲットのメンタルモデル乖離', detail: '想定ユーザー（ハイスキルIT人材）と実来訪者（シニア・受け身層）が一致していない', sub: ['エンジニアの情報収集行動・意思決定フローの調査なし'] },
      ],
    },
    results: {
      understanding: `月間PV60万・記事3,500本でCV率0.3%は、量産SEOコンテンツが「転職に動かないユーザー」を大量に集めている構造的課題。人材紹介業界は市場縮小が続いており、旧来のSEO×量産モデルの費用対効果は今後さらに悪化する。AIO（AI Optimization）対応は生成AI検索エンジンからの流入を獲得する新チャネルであり、同時にEEAT強化はGoogleのHelpful Content Updateへの対応でもある。技術的なHTML構造改善（構造化データ・Core Web Vitals）は即効性があり、短期施策として優先度が高い。ターゲット再定義はSEO施策の前提条件であり、エンジニアのジョブ理論（JTBD）調査なしにコンテンツ戦略を立てても改善は見込めない。`,
      ideas: [
        { title: 'FAQ/HowTo Schema大量実装', description: '既存3,500記事のうち「〜とは」「〜の方法」形式の記事にFAQ SchemaとHowTo Schemaを自動付与するスクリプトを実装。AI検索エンジンはSchemaを優先的に参照するため、AIO対応の最速施策。実装工数：エンジニア1人×2週間。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'エンジニア当事者コンテンツの新設', description: '現役エンジニア10名と業務委託契約し「転職判断の実体験」「年収交渉の実例」を月4本公開。著者プロフィールにGitHub/Zennリンクを掲載しEEATを技術的に担保。AI検索での引用率向上とターゲット層の信頼獲得を同時達成。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'ターゲットJTBD調査×コンテンツ戦略再設計', description: 'ハイスキルITエンジニア30名にインタビューし「転職を考え始めるトリガー」「情報収集の行動順序」「意思決定の最終判断基準」を特定。現行コンテンツのターゲット適合率を計測し、適合度の低いボリューム記事は更新停止または削除を判断。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'Core Web Vitals一括改善', description: 'LCP・CLS・INPを計測し上位流入200記事の技術改善を優先実施。画像のWebP変換・遅延読み込み・不要なJSの削除でLCP 2.5秒以内を達成。Googleの評価改善と直帰率低下（＝CV率改善）の両立。', priority: 'High', effort: 'Low', impact: 'Medium' },
        { title: 'コンテンツアトリビューション計測基盤', description: 'GA4×Looker StudioでコンテンツごとのCV貢献度を可視化。「最終流入ページ」だけでなく「転職意向が上がった接点」をマルチタッチ計測し、ROIの高いコンテンツタイプを特定。量産継続か撤退かの意思決定基準を整備。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: 'AIOランディングページ新設', description: 'AI検索で想定される質問「エンジニア転職 [スキル名]」「[年収帯] エンジニア キャリア」に対応したQ&A形式のLPを20本新設。各LPにFAQ Schema・著者Schemaを実装し生成AI検索での引用を狙う。既存SEO資産を活用したリライト中心で開発コスト最小化。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: '採用ブランディング',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Aura-629',
      productService: 'IT企業の採用広報（エンジニア採用年間50名目標）',
      teamGoals: '応募数2倍・内定承諾率60%→80%・採用単価30%削減',
      sessionType: 'marketing',
      customSession: '',
      issues: [
        { text: '応募数の不足', detail: '求人媒体依存度80%、自社チャネルからの応募がほぼゼロ', sub: ['技術ブログ・採用サイトが形骸化'] },
        { text: '内定辞退率の高さ', detail: '内定承諾率60%、競合オファーに負けるケースが多い', sub: [] },
      ],
    },
    results: {
      understanding: `エンジニア採用は「選ばれる側」の競争。求人媒体依存からの脱却と、技術ブランドの構築が採用単価削減の本質的な解決策。内定辞退は候補者体験（CX）の設計不足。`,
      ideas: [
        { title: '技術ブログ再起動', description: 'エンジニア自身が技術課題と解決策を月4本発信。Zenn・Qiitaとのクロスポスト+SNS展開でエンジニアコミュニティでの認知を獲得。6ヶ月で自然応募比率30%を目標。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: '候補者体験の全面設計', description: '応募→面接→内定→入社の各タッチポイントを設計。面接後24時間以内のフィードバック、内定後の1on1メンター制度で承諾率80%を実現。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'リファラル採用プログラム', description: '社員紹介に30万円インセンティブ+紹介プロセスの簡略化。エンジニア同士の信頼ベースで質の高い候補者を獲得。採用単価は媒体比1/3。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'エンジニア向けイベント開催', description: '月1回の技術勉強会・ハッカソンで潜在候補者との接点を構築。イベント参加者の応募転換率は通常の5倍。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
        { title: '採用サイトのリニューアル', description: '技術スタック・開発文化・チーム紹介を中心にしたエンジニア特化の採用サイトに刷新。動画インタビュー+GitHub活動の可視化で透明性を担保。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'HR SaaS グロース',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 3,
    form: {
      projectName: 'Vertex-421',
      productService: 'HR管理SaaS（中小企業向け）',
      teamGoals: 'ARR 2億円達成・チャーンレート3%以下・NPS +40以上',
      sessionType: 'growth',
      customSession: '',
      issues: [
        { text: 'リテンション低下', detail: '月次チャーン6%→業界平均2%の3倍', sub: ['オンボーディング完了率42%', '30日以内解約が全体の38%'] },
        { text: 'CAC高騰', detail: 'CACが18ヶ月で2.4倍に増加、LTV/CAC=1.8（目標3.0）', sub: [] },
        { text: 'PMF検証未完', detail: 'セグメント別NPS：50名以下+12、51-200名+38', sub: [] },
      ],
    },
    results: {
      keyIssue: 'オンボーディング完走率42%が全チャーンの起点であり、LTV/CAC改善の最大レバー',
      funnelStage: '登録→面談（オンボーディング）',
      understanding: `現状分析：HR SaaS市場は2025年に国内1,800億円規模で年率12%成長を継続しているが、中小企業セグメントでは価格感度が高くスイッチングコストが低い構造的課題がある。チャーン6%（業界平均2%）は主にオンボーディング失敗に起因しており、30日以内解約38%という数値はプロダクト-マーケットフィットの問題というよりも、初期価値体験の設計課題を示唆している。LTV/CAC=1.8は持続可能な成長の臨界点を下回っており、CAC削減よりもLTV向上に優先度を置くべき局面。51-200名セグメントのNPS+38はコアターゲットとしての有望性を示しており、50名以下は現時点では戦略的撤退を含む選択と集中が有効。ARR2億円達成にはNet Revenue Retention 110%以上が必要条件。`,
      ideas: [
        { title: 'オンボーディング完走率2倍化', description: 'JTBD分析で「初期価値到達（Time-to-Value）」を特定し、最小価値体験（MVE）を14日以内に設計。チェックリスト型→プロダクトツアー型に転換し、CS介入トリガーを行動ベース（ログイン3日未満）に変更。期待効果：チャーン6%→3%、LTV+40%。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'コホート別ヘルススコア導入', description: 'DAU/MAU・機能利用率・データ入力量の3軸でヘルススコアを算出し、スコア低下時にCS自動アラート。リスクコホートへの先手介入でエクスパンション機会も同時検出。Gainsight相当機能をin-houseで3ヶ月構築。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'PLG（プロダクト主導型グロース）転換', description: 'フリーミアム導入でCAC構造を転換。51-200名セグメントにフォーカスしたバイラル機能（組織図共有・承認ワークフロー外部招待）でオーガニック獲得比率を現在12%→35%へ。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'セグメント別価格体系再設計', description: '50名以下は撤退or価格引上げ、51-200名はSuccess Planを追加層として設計（+¥5,000/月でCS月次レビュー付）。ARPU+25%とチャーン低減の両立でNRR改善を加速。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: 'パートナーチャネル構築', description: '社労士・税理士事務所300社とのリセラー契約でCAC/3を実現。紹介インセンティブ設計とパートナーポータル開発で間接販売比率を12ヶ月で30%へ。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
        { title: 'プロダクトアナリティクス基盤整備', description: 'Mixpanel or Amplitude導入でファネル可視化。機能別採用率・セッション深度・エラー頻度をリアルタイムモニタリングし、週次プロダクトレビューに組み込む。意思決定サイクルを月次→週次に短縮。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
        { title: 'カスタマーサクセス専任化', description: '現在営業兼任のCS機能を分離。51-200名担当CSを2名採用し、1人あたり担当社数を120社以下に抑制。QBR（四半期ビジネスレビュー）標準化でエクスパンション収益+15%。', priority: 'Low', effort: 'Low', impact: 'Medium' },
        { title: 'AI機能によるスイッチングコスト向上', description: '給与計算AI・シフト最適化AIを差別化機能として追加。独自データ蓄積がスイッチングコストを形成し競合優位性を確保。生成AI API活用で開発コスト最小化。', priority: 'Low', effort: 'High', impact: 'High' },
      ],
      deepDive: `### PMF検証の定量アプローチは？\n\n## Rahul Vohra式PMFスコア適用\n\n| 指標 | 現状 | PMF水準 |\n|---|---|---|\n| 「なくなったら残念」% | 測定未 | **40%以上** |\n| NPS（51-200名） | +38 | 目標+50 |\n| 30日リテンション | 62% | 目標80% |\n| Organic比率 | 12% | 目標30% |\n\n## 推奨アクション\n\n1. **Sean Ellis Test** を既存顧客全件に実施（1週間で完了可能）\n2. セグメント別にNPS+40超の顧客コホートを特定 → ICP（理想顧客プロファイル）を再定義\n3. ICPに絞った新規獲得にリソース集中し、PMFスコアを月次計測`,
      refinement: `## 優先度付きロードマップ（90日）\n\n**Phase 1（〜30日）：止血**\n- オンボーディングフロー刷新（MVE設計）\n- ヘルススコアβ版リリース\n- 50名以下セグメントへの価格改定通知\n\n**Phase 2（31〜60日）：基盤**\n- PLGバイラル機能リリース\n- パートナー候補30社へのアウトリーチ\n- CS専任採用（1名）\n\n**Phase 3（61〜90日）：加速**\n- PLGフリーミアム正式ローンチ\n- AI機能PoC開始\n- QBRプログラム全顧客展開\n\n> **KPI確認ポイント**：Day30時点でチャーン4.5%以下、Day60でLTV/CAC>2.2を達成できていれば軌道上`,
    },
  },
  {
    label: 'DX推進 製造業',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Obsidian-537',
      productService: '部品メーカー（従業員800名）社内DX',
      teamGoals: '基幹システム刷新・現場デジタル化・年間コスト15%削減',
      sessionType: 'dx',
      customSession: '',
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
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Catalyst-319',
      productService: 'スマート農業IoT（大手食品メーカー新規事業）',
      teamGoals: '6ヶ月でPoC完了・PMF仮説3件検証・投資回収見通し策定',
      sessionType: 'innovation',
      customSession: '',
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
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Beacon-472',
      productService: 'BtoB営業支援SaaS（スタートアップ、ARR 3,000万円）',
      teamGoals: '新規リード月300件・CPA ¥50,000以下・パイプライン転換率25%',
      sessionType: 'marketing',
      customSession: '',
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
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Fulcrum-651',
      productService: '食品物流企業（従業員500名、拠点12箇所）',
      teamGoals: 'オペコスト15%削減・配送リードタイム20%短縮・品質不良率0.5%以下',
      sessionType: 'ops',
      customSession: '',
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
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Mosaic-738',
      productService: '大規模Webサービス（DAU 50万、プロダクト4本）',
      teamGoals: '全プロダクト採用率80%・新機能実装速度2倍・a11y AA準拠100%',
      sessionType: 'design-system',
      customSession: '',
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
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Meridian-892',
      productService: 'BtoB SaaS（国内ARR 5億円、東南アジア展開検討）',
      teamGoals: '東南アジア3ヶ国で初期顧客50社獲得・現地ARR 1億円・12ヶ月以内',
      sessionType: 'other',
      customSession: '海外展開戦略',
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
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Helix-563',
      productService: 'BtoB受発注プラットフォーム（ユーザー1,200社）',
      teamGoals: '技術的負債50%削減・デプロイ頻度週1→日次・新機能開発速度2倍',
      sessionType: 'product',
      customSession: '',
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
        { title: 'AIコードレビュー導入', description: 'AIコードレビューツールを導入しコードレビュー工数を削減。セキュリティスキャン・バグ検出を自動化しレビュアーは設計判断に集中できる環境を整備。', priority: 'Low', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'プロダクト UXリデザイン',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Prism-284',
      productService: 'BtoBマーケティング自動化ツール',
      teamGoals: 'アクティブ利用率45%→70%・機能採用率改善・NPS+20pt向上',
      sessionType: 'cx',
      customSession: '',
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
  {
    label: 'SaaS 解約防止',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Shield-102',
      productService: '経費精算SaaS（契約社数1,200社）',
      teamGoals: '月次チャーンレート2%→0.8%・NRR 110%達成・NPS +30',
      sessionType: 'growth',
      customSession: '',
      issues: [
        { text: '解約率の高止まり', detail: '月次チャーン2%、年換算で顧客の22%が離脱', sub: ['競合の無料プランに流出', 'オンボーディング未完了での早期解約が40%'] },
        { text: 'エクスパンション不足', detail: 'アップセル率5%、クロスセル実績ほぼゼロ', sub: [] },
      ],
    },
    results: {
      understanding: `チャーン2%の主因はオンボーディング失敗と競合フリーミアムへの流出。NRR 110%達成にはチャーン削減だけでなくエクスパンション収益の設計が不可欠。`,
      ideas: [
        { title: 'ヘルススコア基盤構築', description: 'ログイン頻度・機能利用率・サポート問合せ数からヘルススコアを自動算出。スコア低下時のCS自動介入トリガーで解約予兆の早期検出。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'オンボーディング完走プログラム', description: '初期設定の7ステップをウィザード化し完走率を30%→70%に改善。Day7・Day14・Day30のチェックポイントでCS介入。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'セグメント別リテンション施策', description: '企業規模×利用深度のマトリクスでセグメント分けし各コホートに最適な介入を設計。小規模は自動化、中規模以上はCS担当制。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'アップセル導線の自動化', description: '利用量が閾値を超えた企業に自動でアップグレード提案。既存データから「次に必要になる機能」を予測しタイミング最適化。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: '解約理由の構造化分析', description: '直近6ヶ月の解約企業全件にExitインタビューを実施し原因を5分類に構造化。再発防止策を優先度順に実装。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'D2Cブランド CX設計',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Bloom-415',
      productService: 'D2Cスキンケアブランド（EC売上月8,000万円）',
      teamGoals: 'リピート率35%→55%・顧客単価+30%・LTV 24ヶ月化',
      sessionType: 'cx',
      customSession: '',
      issues: [
        { text: 'リピート率の低迷', detail: '2回目購入率35%、3回目はさらに半減', sub: ['初回購入者へのフォローが手動メール1通のみ'] },
        { text: 'パーソナライズ未対応', detail: '全顧客に同じレコメンド、肌質や悩みに応じた提案なし', sub: [] },
      ],
    },
    results: {
      understanding: `D2Cスキンケアでリピート率35%は業界平均以下。2回目購入への「橋渡し体験」が設計されておらず、初回購入が単発で終わっている。パーソナライズはCX改善の最大レバー。`,
      ideas: [
        { title: '肌診断×パーソナライズレコメンド', description: 'LINE連携の肌診断チャットボットで肌質・悩みを取得し、個別最適な商品セットを提案。診断データをCRMに蓄積しリピート提案を自動化。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'ポストパーチェスジャーニー設計', description: '購入後Day1・Day7・Day14・Day28にステップメール+LINE配信。使い方動画・効果実感の声・次回レコメンドを段階的に提供。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'サブスクリプション導入', description: '定期便モデルを導入し「買い忘れ」による離脱を防止。初回30%OFF+2回目以降15%OFFの価格設計でLTV24ヶ月化を促進。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'UGCレビュープログラム', description: '購入者にレビュー投稿インセンティブ（次回クーポン）を提供。リアルな口コミが新規CVRとリピート率の両方を改善。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
        { title: 'VIP顧客プログラム', description: '累計購入額上位10%にVIPステータスを付与。先行販売・限定商品・1on1カウンセリングで顧客単価+30%とLTV最大化を同時達成。', priority: 'Medium', effort: 'Medium', impact: 'High' },
      ],
    },
  },
  {
    label: 'フィンテック規制対応',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Bastion-776',
      productService: 'クラウド型決済プラットフォーム',
      teamGoals: 'PCI DSS Level 1取得・API稼働率99.99%・加盟店数3倍',
      sessionType: 'product',
      customSession: '',
      issues: [
        { text: 'コンプライアンス対応遅延', detail: 'PCI DSS準拠に必要な改修が12ヶ月計画で4ヶ月遅延中', sub: ['セキュリティ専任エンジニア不足', '監査対応の工数が開発を圧迫'] },
        { text: '可用性の不安定さ', detail: '月間ダウンタイム累計45分、SLA 99.95%未達', sub: [] },
      ],
    },
    results: {
      understanding: `決済プラットフォームはコンプライアンスと可用性が事業継続の前提条件。PCI DSS遅延はセキュリティ債務であり最優先。可用性改善はアーキテクチャレベルの対応が必要。`,
      ideas: [
        { title: 'PCI DSSギャップ分析と加速プラン', description: '残12要件のギャップ分析を実施し、自動化可能な項目をツール導入で加速。外部QSA（認定セキュリティ評価機関）との週次レビュー体制で遅延を回収。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'マルチAZ冗長化', description: 'AWS Multi-AZ構成への移行で単一障害点を排除。Route53ヘルスチェック+自動フェイルオーバーで稼働率99.99%を実現。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'セキュリティエンジニア採用強化', description: 'セキュリティ専任2名の採用を最優先に。採用完了まで外部セキュリティコンサルで監査対応をカバー。', priority: 'High', effort: 'Medium', impact: 'Medium' },
        { title: 'インシデント対応の自動化', description: 'PagerDuty+Runbook自動化で障害検知→初動対応を5分以内に短縮。ポストモーテム文化を定着させ再発防止を構造化。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: '加盟店オンボーディングの効率化', description: 'API連携ドキュメント+サンドボックス環境を整備し、加盟店の技術検証期間を4週間→1週間に短縮。開発者体験の改善が加盟店獲得の加速要因。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: '教育SaaS PMF検証',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Ignite-334',
      productService: '法人向けAI研修プラットフォーム',
      teamGoals: 'PMFスコア40%以上・有料転換率15%・月次リテンション85%',
      sessionType: 'innovation',
      customSession: '',
      issues: [
        { text: 'PMF未達', detail: 'Sean Ellis Test「なくなったら困る」率22%（目標40%）', sub: ['ターゲット企業規模が広すぎてニーズが拡散'] },
        { text: '有料転換率の低さ', detail: 'フリートライアル→有料転換が8%で目標の半分', sub: [] },
      ],
    },
    results: {
      understanding: `PMFスコア22%は「nice-to-have」の段階。ターゲット絞り込みとコアバリューの再定義が最優先。広く浅くから狭く深くへの転換が必要。`,
      ideas: [
        { title: 'ICP再定義スプリント', description: '既存ユーザーの利用データ+インタビューでPMFスコア40%超のコホートを特定。「従業員100-500名×DX推進部門」等の仮説を2週間で検証。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'コアバリュー再設計', description: '「AI研修」から「AI活用スキルの組織定着」にバリュープロポジションを転換。研修完了率ではなく業務適用率をKPIにし顧客の成果に直結。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'オンボーディング改善で体験価値を前倒し', description: 'トライアル開始後48時間以内に「AIで業務が楽になった」体験を提供。テンプレート型ワークショップで即座に価値実感を得られる設計。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'カスタマーサクセス先行投資', description: '有料転換前からCSが伴走する「コンシェルジュ型トライアル」を上位20社に提供。転換率を個別対応で15%→30%に引き上げ成功パターンを型化。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: '導入事例の量産と横展開', description: 'PMFスコア高コホートの成功事例を3本制作。同業種への横展開で獲得効率を改善。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'ECリプレイス計画',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Forge-508',
      productService: 'アパレルEC（年商30億円・SKU 12,000点）',
      teamGoals: 'プラットフォーム刷新・表示速度50%改善・カゴ落ち率15%削減',
      sessionType: 'dx',
      customSession: '',
      issues: [
        { text: 'レガシープラットフォーム', detail: '自社EC基盤が10年前の構築で改修コストが年々増加', sub: ['ページ表示3.5秒（目標1.5秒）', 'モバイルCVRがデスクトップの1/3'] },
        { text: '在庫管理の非効率', detail: '実店舗とECの在庫が分断、欠品と過剰在庫が同時発生', sub: [] },
      ],
    },
    results: {
      understanding: `年商30億円ECのリプレイスは事業リスクの高いプロジェクト。段階的移行（ストラングラーフィグ）で売上影響を最小化しながら技術刷新を進めるべき。在庫統合はOMS導入が最短解。`,
      ideas: [
        { title: 'ヘッドレスコマース移行', description: 'Shopify Plus or commercetoolsでヘッドレス構成に移行。フロントをNext.jsで刷新しLCP 1.5秒以内を実現。バックエンドは段階的に移行しリスクを分散。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'OMS（注文管理システム）導入', description: '実店舗+EC+マーケットプレイスの在庫を統合管理するOMSを導入。「店舗在庫のEC販売」で機会損失を解消し売上+10%を見込む。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'モバイルUX最優先改善', description: 'モバイルCVRがデスクトップの1/3は改善余地が大きい。商品一覧のスケルトンUI・ワンタップ購入・Apple/Google Pay対応で摩擦を最小化。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'パーソナライズレコメンド実装', description: '閲覧・購入履歴ベースのAIレコメンドで回遊率と購入点数を改善。SKU 12,000点の強みを活かしクロスセル率+20%。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: 'カゴ落ちリカバリー自動化', description: 'カゴ落ち後30分・3時間・24時間のステップメール+LINE通知で回収率を改善。決済手段追加（BNPL）でカゴ落ち率-15%。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'サブスク価格改定',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Lever-847',
      productService: 'プロジェクト管理SaaS（ARR 8億円・契約社数3,000社）',
      teamGoals: 'ARPU +25%・既存顧客のダウングレード率5%以下・NRR 115%',
      sessionType: 'growth',
      customSession: '',
      issues: [
        { text: '価格体系の陳腐化', detail: '3年前のプラン設計のまま、機能追加に価格が追いついていない', sub: ['上位プランの差別化が弱く全体の70%が最安プラン'] },
        { text: 'エクスパンション収益の停滞', detail: 'NRR 102%、アップセル・クロスセルの仕組みなし', sub: [] },
      ],
    },
    results: {
      understanding: `ARR 8億円でNRR 102%は成長の天井。価格改定は短期的なリスクを伴うが、中期的にはARPU改善が最大の成長レバー。段階的な移行と十分な顧客コミュニケーションが成功の鍵。`,
      ideas: [
        { title: 'バリューメトリクス再設計', description: '「ユーザー数課金」から「プロジェクト数×機能ティア」に価格体系を転換。利用価値に連動した課金モデルで自然なエクスパンションを促進。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'グランドファザリング戦略', description: '既存顧客は12ヶ月間旧価格を維持し、段階的に新価格へ移行。解約リスクを最小化しながらARPU改善を実現。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: 'プレミアム機能のゲート化', description: '現在全プランで利用可能な高度機能（ガントチャート・リソース管理・API連携）を上位プランに移動。機能の価値を可視化しアップグレード動機を創出。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: '利用量ベースの従量課金追加', description: 'ストレージ・API呼出数・外部連携数に従量課金を追加。ヘビーユーザーから適正な対価を得つつ、小規模利用者の参入障壁を下げる。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
        { title: '価格改定コミュニケーション計画', description: '改定90日前の事前告知→60日前のFAQ公開→30日前の個別対応。CSチーム向けの想定Q&A50問を準備し、問い合わせ対応を標準化。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'ヘルスケアアプリ',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Vitalis-193',
      productService: '法人向け健康管理アプリ（従業員のメンタルヘルス・健診管理）',
      teamGoals: '導入企業100社・MAU率60%・健診受診率90%達成',
      sessionType: 'product',
      customSession: '',
      issues: [
        { text: '利用定着率の低さ', detail: '導入後3ヶ月でMAU率が40%→15%に急落', sub: ['通知が多すぎて無視される', '日常的に使う理由がない'] },
        { text: '企業の導入決裁が長い', detail: '平均商談期間6ヶ月、人事×IT×経営の3部門承認が必要', sub: [] },
      ],
    },
    results: {
      understanding: `ヘルスケアアプリの定着は「義務感」ではなく「日常の習慣」に組み込む設計が鍵。健診管理だけでは月1回の利用にしかならず、毎日使う理由の創出が必須。B2Bの長い商談サイクルは導入事例とROI数値で短縮可能。`,
      ideas: [
        { title: 'マイクロハビット設計', description: '1日1回30秒の気分チェック+ストレッチ提案で日常利用を習慣化。ゲーミフィケーション（連続記録・チームランキング）でMAU率60%を目標。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'Slack/Teams連携', description: '既に毎日使うツールにヘルスチェックを埋め込み。朝のスタンドアップ時に30秒コンディション入力でアプリ起動不要の体験を提供。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'ROI計算ツール提供', description: '「メンタル不調による離職コスト×改善率」で導入ROIを自動計算するWebツールを提供。商談期間6ヶ月→3ヶ月短縮を目標。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: '産業医連携機能', description: '産業医面談のスケジュール管理+面談記録をアプリに統合。法定義務対応をワンストップ化し企業の管理負荷を削減。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
        { title: 'アノニマスレポート機能', description: '組織全体のメンタルヘルス傾向を匿名集計しダッシュボード化。人事が早期にリスクを把握でき、導入企業への提供価値を向上。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
      ],
    },
  },
  {
    label: '物流DX 配車最適化',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Route-462',
      productService: '中堅物流企業（車両200台・配送拠点8箇所）',
      teamGoals: '配車計画自動化率80%・燃料費20%削減・ドライバー残業30%削減',
      sessionType: 'ops',
      customSession: '',
      issues: [
        { text: '配車計画の属人化', detail: 'ベテラン2名の経験値に完全依存、休暇時に効率30%低下', sub: ['Excelベースの手動計画で最適化不能'] },
        { text: '2024年問題対応', detail: 'ドライバー残業上限規制で配送キャパシティ不足が顕在化', sub: [] },
      ],
    },
    results: {
      understanding: `物流の2024年問題（残業上限規制）は業界全体の構造変化。属人化した配車計画のAI化は「効率改善」ではなく「事業継続」の問題。段階的なデジタル化で現場の抵抗を最小化しつつ、短期でROIを出す設計が重要。`,
      ideas: [
        { title: 'AI配車最適化エンジン導入', description: '配送先・時間指定・車両特性・ドライバースキルを考慮したAI配車計画を導入。ベテランの暗黙知をアルゴリズム化し配車計画時間を4時間→30分に短縮。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'テレマティクス基盤構築', description: '全200台にGPS+OBDセンサーを設置しリアルタイム位置・燃費・運転行動を可視化。データ基盤を整備しAI配車の入力データを確保。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'ドライバー勤怠の自動管理', description: 'デジタルタコグラフ連携で残業時間をリアルタイム管理。上限接近アラートで法令違反リスクをゼロに。残業30%削減の定量管理基盤。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: '拠点間幹線輸送の最適化', description: '8拠点間の幹線輸送ルート・頻度を需要データに基づき再設計。空車回送率を現状25%→10%に改善し燃料費削減。', priority: 'Medium', effort: 'Medium', impact: 'High' },
        { title: 'エコドライブ研修+インセンティブ', description: '燃費データに基づくドライバー別エコドライブスコアを算出。上位者にインセンティブを付与し全体の燃費10%改善。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
      ],
    },
  },
  {
    label: 'ブランド統一 リブランディング',
    prov: 'openai', modelId: DEFAULT_MODEL_ID, dep: 2,
    form: {
      projectName: 'Unity-951',
      productService: 'M&A後の統合企業グループ（3社統合・従業員2,000名）',
      teamGoals: '統一ブランドガイドライン策定・全社浸透率80%・制作コスト40%削減',
      sessionType: 'design-system',
      customSession: '',
      issues: [
        { text: 'ブランド乱立', detail: '3社それぞれのロゴ・カラー・トーンが混在し顧客に混乱', sub: ['営業資料が3パターン存在', 'Webサイトのデザインが統一されていない'] },
        { text: '制作プロセスの非効率', detail: '各社別々のデザインチーム・ベンダーで重複コストが発生', sub: [] },
      ],
    },
    results: {
      understanding: `M&A後のブランド統合は「見た目の統一」ではなく「企業アイデンティティの再定義」。3社の強みを活かした新ブランドストーリーが先行し、デザインシステムはその具現化ツール。社内浸透には経営層のコミットメントが不可欠。`,
      ideas: [
        { title: 'ブランドストーリーワークショップ', description: '3社の経営陣+キーパーソン15名でブランドパーパスを再定義。「なぜ統合したのか」「顧客にどんな価値を届けるか」を言語化し全社の共通言語を創出。', priority: 'High', effort: 'Low', impact: 'High' },
        { title: '統一デザインシステム構築', description: 'カラー・タイポグラフィ・コンポーネントをFigma+Storybookで構築。3社のデザイン資産を棚卸しし最良のパターンを統一基盤に採用。', priority: 'High', effort: 'High', impact: 'High' },
        { title: 'テンプレートライブラリ整備', description: '営業資料・提案書・メール署名・名刺のテンプレートを20種類整備。Canva/Figma共有で「誰でも統一品質」の制作を可能にし制作コスト40%削減。', priority: 'High', effort: 'Medium', impact: 'High' },
        { title: 'ブランド浸透プログラム', description: '月次のブランドアンバサダー研修+社内ブランドポータルサイトで全社浸透を促進。浸透度を四半期サーベイで計測しPDCA。', priority: 'Medium', effort: 'Medium', impact: 'Medium' },
        { title: 'デザインベンダー統合', description: '3社別々のベンダーを1社に統合しコスト削減+品質統一。RFP実施でデザインシステム運用に対応可能なパートナーを選定。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
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

export const getSeedByIndex = (index: number): MockScenario => {
  return MOCK_SCENARIOS[index % MOCK_SCENARIOS.length];
};
