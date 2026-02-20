import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Target, Clock, TrendingUp, AlertCircle, Settings, Sparkles, Wand2,
  FileText, Download, Printer, X, Eye, RefreshCw, Search, MessageSquarePlus,
  CalendarRange, CalendarCheck, ChevronRight, Globe, Plus, Minus, Layers,
  SlidersHorizontal, Database, Upload, Trash2, ToggleLeft, ToggleRight,
  ExternalLink, Wifi, WifiOff, Loader, Sun, Moon, FlaskConical,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════
   Dev Seed Data — mock scenarios for UI testing
   ══════════════════════════════════════════════════════ */
const MOCK_SCENARIOS = [
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

let _seedIdx = 0;
const nextSeed = () => { const s = MOCK_SCENARIOS[_seedIdx % MOCK_SCENARIOS.length]; _seedIdx++; return s; };

/* ══════════════════════════════════════════════════════
   Theme — localStorage-persisted dark/light mode
   ══════════════════════════════════════════════════════ */
const THEME_KEY = 'ai-brainstorm-theme';
const getInitialDark = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored !== null) return stored === 'dark';
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
};
const applyTheme = (dark) => {
  document.documentElement.classList.toggle('dark', dark);
  try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch {}
};

/* ══════════════════════════════════════════════════════
   Design tokens — all theme-aware Tailwind class strings
   Used as constants so they're consistent throughout
   ══════════════════════════════════════════════════════ */
const T = {
  // Layout
  page:      'min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-200',
  card:      'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600/70 rounded-xl',
  cardFlat:  'bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/60 rounded-xl',
  // Text
  t1:        'text-slate-900 dark:text-slate-100',
  t2:        'text-slate-600 dark:text-slate-300',
  t3:        'text-slate-400 dark:text-slate-400',
  // Inputs
  inp:       'w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-sm focus:outline-none focus:border-blue-400 dark:focus:border-blue-400 transition',
  inpSm:     'w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-xs focus:outline-none focus:border-blue-400 dark:focus:border-blue-400 transition',
  // Buttons
  btnGhost:  'bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/60 transition',
  btnAccent: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/20',
  // Accent areas
  accentBg:  'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700/40',
  accentTxt: 'text-blue-600 dark:text-blue-400',
  // Divider
  div:       'border-slate-200 dark:border-slate-600/70',
};

/* ══════════════════════════════════════════════════════
   Storage
   ══════════════════════════════════════════════════════ */
const STORE_KEY    = 'ai-brainstorm-logs';
const SETTINGS_KEY = 'ai-brainstorm-settings';
const defaultSettings = { logMode: 'all', autoSave: true };

const loadLogs     = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; } };
const saveLogs     = (l) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(l)); } catch {} };
const loadSettings = () => { try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; } catch { return defaultSettings; } };
const saveSettings = (s) => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {} };
const exportJSON   = (data, fn) => { const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }); const u = URL.createObjectURL(b); Object.assign(document.createElement('a'), { href: u, download: fn }).click(); URL.revokeObjectURL(u); };

/* ══════════════════════════════════════════════════════
   Markdown renderer — theme-aware
   ══════════════════════════════════════════════════════ */
const RichText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0, tableRows = [], inTable = false;

  const ri = (str) => {
    const parts = [];
    const rx = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[([^\]]+)\]\((https?:\/\/[^\)]+)\))|(https?:\/\/[^\s<\]）]+)/g;
    let last = 0, m;
    while ((m = rx.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      if (m[1])  parts.push(<strong key={m.index} className="font-semibold text-slate-800 dark:text-slate-100">{m[2]}</strong>);
      else if (m[3])  parts.push(<em key={m.index} className="italic text-slate-600 dark:text-slate-300">{m[4]}</em>);
      else if (m[5])  parts.push(<code key={m.index} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-600/60 text-blue-600 dark:text-blue-300 text-xs font-mono">{m[6]}</code>);
      else if (m[7])  parts.push(<a key={m.index} href={m[9]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5">{m[8]}<ExternalLink className="w-2.5 h-2.5" /></a>);
      else if (m[10]) parts.push(<a key={m.index} href={m[10]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 break-all">{m[10].length > 60 ? m[10].slice(0, 57) + '…' : m[10]}<ExternalLink className="w-2.5 h-2.5" /></a>);
      last = m.index + m[0].length;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts.length ? parts : str;
  };

  const flushTable = () => {
    if (!tableRows.length) return;
    const hdr = tableRows[0], body = tableRows.slice(2);
    elements.push(
      <div key={`tbl-${i}`} className="overflow-x-auto my-2">
        <table className="w-full text-xs border-collapse">
          <thead><tr>{hdr.split('|').filter(Boolean).map((c, ci) => <th key={ci} className="px-2 py-1.5 text-left bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/60 text-slate-700 dark:text-slate-200 font-semibold">{c.trim()}</th>)}</tr></thead>
          <tbody>{body.map((row, ri2) => <tr key={ri2} className="even:bg-slate-50 dark:even:bg-slate-700/20">{row.split('|').filter(Boolean).map((c, ci) => <td key={ci} className="px-2 py-1 border border-slate-200 dark:border-slate-600/60 text-slate-600 dark:text-slate-300">{ri(c.trim())}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  while (i < lines.length) {
    const ln = lines[i];
    const isT = ln.trim().startsWith('|') && ln.trim().endsWith('|');
    if (isT) { inTable = true; tableRows.push(ln.trim()); i++; continue; }
    if (inTable) { flushTable(); inTable = false; }
    if      (ln.startsWith('### ')) elements.push(<h4 key={i} className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-3 mb-1">{ri(ln.slice(4))}</h4>);
    else if (ln.startsWith('## '))  elements.push(<h3 key={i} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1.5 border-b border-slate-200 dark:border-slate-600/60 pb-1">{ri(ln.slice(3))}</h3>);
    else if (ln.startsWith('# '))   elements.push(<h2 key={i} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">{ri(ln.slice(2))}</h2>);
    else if (ln.startsWith('---'))  elements.push(<hr key={i} className="border-slate-200 dark:border-slate-600/60 my-3" />);
    else if (ln.match(/^[-*]\s/))   elements.push(<div key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed ml-2"><span className="text-slate-400 dark:text-slate-400 shrink-0 mt-0.5">•</span><span>{ri(ln.replace(/^[-*]\s/, ''))}</span></div>);
    else if (ln.match(/^\d+\.\s/))  elements.push(<div key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed ml-2"><span className="text-slate-400 dark:text-slate-400 shrink-0 font-medium">{ln.match(/^(\d+)\./)[1]}.</span><span>{ri(ln.replace(/^\d+\.\s/, ''))}</span></div>);
    else if (ln.trim() === '')      elements.push(<div key={i} className="h-1.5" />);
    else elements.push(<p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ri(ln)}</p>);
    i++;
  }
  if (inTable) flushTable();
  return <div className="space-y-0.5">{elements}</div>;
};

/* ══════════════════════════════════════════════════════
   Connection tester
   ══════════════════════════════════════════════════════ */
const testConn = async (modelId) => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: 100 } : { max_tokens: 100 };
  const r = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelId, ...tokenParam, messages: [{ role: 'user', content: 'Say exactly: OK' }] }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`${r.status}: ${d?.error?.message || JSON.stringify(d)}`);
  return d.model || modelId;
};

/* ══════════════════════════════════════════════════════
   Models
   ══════════════════════════════════════════════════════ */
const MODELS = [
  { id: 'gpt-5-nano',   label: '5 Nano',   t: '最速',    cost: '$'  },
  { id: 'gpt-5-mini',   label: '5 Mini',   t: 'バランス', cost: '$$' },
  { id: 'gpt-4.1-mini', label: '4.1 Mini', t: 'コスパ',  cost: '$'  },
  { id: 'gpt-4.1-nano', label: '4.1 Nano', t: '最安',    cost: '$'  },
];

const callAI = async (modelId, msgs) => {
  const usesCompletionTokens = modelId.startsWith('gpt-5') || modelId.startsWith('o');
  const tokenParam = usesCompletionTokens ? { max_completion_tokens: 4096 } : { max_tokens: 4096 };
  const r = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelId, ...tokenParam, messages: msgs }),
  });
  if (!r.ok) throw new Error(`${r.status}: ${(await r.text()).slice(0, 300)}`);
  return (await r.json()).choices?.[0]?.message?.content || '';
};

/* ══════════════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════════════ */
const TYPES = { product: 'プロダクト開発', marketing: 'マーケティング', growth: 'グロース', innovation: 'イノベーション', cx: 'CX改善', ops: 'オペレーション', dx: 'DX推進', 'design-system': 'デザインシステム', other: 'その他' };

const SEEDS = ['Horizon','Prism','Meridian','Lattice','Helix','Nimbus','Vertex','Cadence','Sextant','Anvil','Loom','Beacon','Torque','Fulcrum','Mosaic','Pinnacle','Obsidian','Catalyst','Epoch','Tessera'];
const autoN = (s, g) => { const h = `${s}${g}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0); return `${SEEDS[h % SEEDS.length]}-${((h * 7) % 900) + 100}`; };
const ll = v => ({ High: '高', Medium: '中', Low: '低' }[v] || v);

const ISSUE_TPL = { product: ['技術的負債','UX課題','パフォーマンス','セキュリティ','スケーラビリティ'], marketing: ['認知不足','CAC高騰','チャネル最適化','CV率','コンテンツ品質'], growth: ['PMF未達','リテンション低下','LTV/CAC','市場飽和','新セグメント'], innovation: ['R&D投資不足','組織硬直','技術追従','実験文化','知財戦略'], cx: ['NPS低下','サポート遅延','オンボーディング','チャーン','VOC活用'], ops: ['プロセス非効率','コスト超過','品質管理','属人化','ツール分散'], dx: ['レガシー依存','データサイロ','リテラシー','変革抵抗','ROI可視化'], 'design-system': ['採用率','トークン設計','コンポーネント不足','ドキュメント','a11y'], other: ['リソース制約','組織課題','市場変化','技術課題','財務課題'] };

const DEPTH = { 1: { label: 'Quick', desc: '概要・5min', ideas: 3 }, 2: { label: 'Standard', desc: '標準・15min', ideas: 6 }, 3: { label: 'Deep', desc: '詳細・30min', ideas: 8 }, 4: { label: 'BCG Grade', desc: '戦略コンサル級', ideas: 10 } };

const SUGGEST = { product: ['アーキテクチャ刷新の判断基準は？','Build vs Buy意思決定フレームは？','テクニカルデット返済ROIは？','プラットフォーム戦略方向性は？','技術ロードマップ優先度は？'], marketing: ['GTM戦略の再構築案は？','ブランドエクイティ定量測定は？','マーケミックス最適配分は？','競合ポジショニングマップは？','ABM導入ROI予測は？'], growth: ['PMF検証の定量アプローチは？','ユニットエコノミクス改善レバーは？','セグメント別成長ポテンシャルは？','ネットワーク効果活用は？','グロースモデルのボトルネックは？'], innovation: ['ディスラプション・リスク評価は？','三つの地平線での配分は？','技術フィージビリティ検証は？','IP戦略最適解は？','イノベーション・ポートフォリオは？'], cx: ['ジャーニーのペインポイント分析は？','CX投資ROI定量化は？','プロアクティブサポート導入は？','セグメント別CX差別化は？','VoCインサイト抽出は？'], ops: ['バリューストリーム分析は？','RPA/AI自動化優先度は？','オペエクセレンスKPIは？','サプライチェーン最適化は？','ケイパビリティギャップは？'], dx: ['DXロードマップ段階設計は？','データガバナンス構築は？','クラウドマイグレーション戦略は？','AI/MLユースケース優先度は？','CoE設計は？'], 'design-system': ['成熟度モデルでの現在地は？','トークンアーキテクチャは？','コンポーネントAPI設計原則は？','Multi-brand拡張は？','開発者DX改善は？'], other: ['最重要KPIと先行指標は？','リスクマトリクスと対応策は？','ステークホルダー影響力分析は？','短期Win vs 中長期投資は？','意思決定プロセス改善は？'] };

/* Badge color helpers — desaturated, theme-aware */
const priorityC = v => ({ High: 'bg-rose-50 dark:bg-rose-800/30 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-600/50', Medium: 'bg-amber-50 dark:bg-amber-800/30 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-600/50', Low: 'bg-slate-100 dark:bg-slate-600/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-500/50' }[v] || 'bg-slate-100 dark:bg-slate-600/40 text-slate-600 dark:text-slate-300 border-slate-200');
const effortC   = v => ({ High: 'bg-purple-50 dark:bg-purple-800/30 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-600/50', Medium: 'bg-blue-50 dark:bg-blue-800/30 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-600/50', Low: 'bg-teal-50 dark:bg-teal-800/30 text-teal-700 dark:text-teal-200 border-teal-200 dark:border-teal-600/50' }[v] || 'bg-slate-100 dark:bg-slate-600/40 text-slate-600 dark:text-slate-300 border-slate-200');
const impactC   = v => ({ High: 'bg-emerald-50 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-600/50', Medium: 'bg-orange-50 dark:bg-orange-800/30 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-600/50', Low: 'bg-slate-100 dark:bg-slate-600/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-500/50' }[v] || 'bg-slate-100 dark:bg-slate-600/40 text-slate-600 dark:text-slate-300 border-slate-200');

/* ══════════════════════════════════════════════════════
   Report builder
   ══════════════════════════════════════════════════════ */
const buildReportMd = (pn, form, results, provN, mL, dep) => {
  const now = new Date().toLocaleString('ja-JP');
  const ses = form.sessionType === 'other' ? form.customSession : TYPES[form.sessionType];
  const tl = form.tlMode === 'period' ? `${form.tlStart || '?'} 〜 ${form.tlEnd || '?'}` : (form.tlDead || '未指定');
  let md = `# AI Strategic Brainstorm Report\n\n| 項目 | 内容 |\n|---|---|\n| PJ | ${pn} |\n| プロダクト | ${form.productService} |\n| セッション | ${ses} |\n| タイムライン | ${tl} |\n| 深度 | ${DEPTH[dep].label} |\n| AI | ${provN}/${mL} |\n| 生成 | ${now} |\n\n`;
  md += `## 目標\n${form.teamGoals}\n\n`;
  const iss = form.issues.filter(x => x.text.trim());
  if (iss.length) { md += `## 課題\n`; iss.forEach(x => { md += `- **${x.text}**${x.detail ? `: ${x.detail}` : ''}${x.sub?.filter(Boolean).length ? '\n' + x.sub.filter(Boolean).map(s => `  - ${s}`).join('\n') : ''}\n`; }); md += '\n'; }
  md += `---\n\n## AI分析\n\n${results.understanding}\n\n---\n\n## 戦略アイデア\n\n`;
  results.ideas.forEach((d, i) => { md += `### ${i + 1}. ${d.title}\n\n${d.description}\n\n| 優先度 | 工数 | インパクト |\n|---|---|---|\n| ${ll(d.priority)} | ${ll(d.effort)} | ${ll(d.impact)} |\n\n`; });
  if (results.refinement) md += `---\n\n## ブラッシュアップ\n\n${results.refinement}\n`;
  if (results.deepDive)   md += `---\n\n## 深掘り\n\n${results.deepDive}\n`;
  md += `\n---\n*Generated by AI Strategic Brainstorm*`;
  return md;
};
const dlFile = (c, fn, mime) => { const b = new Blob(['\uFEFF' + c], { type: `${mime};charset=utf-8` }); const u = URL.createObjectURL(b); Object.assign(document.createElement('a'), { href: u, download: fn }).click(); URL.revokeObjectURL(u); };

/* ══════════════════════════════════════════════════════
   Preview Modal
   ══════════════════════════════════════════════════════ */
const Preview = ({ md, pn, onClose }) => {
  const txt = md.replace(/\*\*/g, '').replace(/#{1,3}\s/g, '■ ').replace(/\|/g, ' | ').replace(/---/g, '──────');
  const doPrint = () => { const w = window.open('', '_blank'); if (!w) return; w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${pn}</title><style>body{font-family:-apple-system,'Hiragino Sans',sans-serif;max-width:780px;margin:32px auto;padding:0 20px;color:#1a1a1a;line-height:1.8;font-size:13px}pre{white-space:pre-wrap;font-family:inherit}@media print{body{margin:16px}}</style></head><body><pre>${txt}</pre></body></html>`); w.document.close(); setTimeout(() => w.print(), 300); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`${T.card} w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${T.div} shrink-0`}>
          <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-blue-500" /><span className={`text-sm font-semibold ${T.t1}`}>プレビュー</span></div>
          <button onClick={onClose} className={`p-1 rounded-lg ${T.btnGhost}`}><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4"><RichText text={md} /></div>
        <div className={`flex items-center justify-end gap-2 px-4 py-2.5 border-t ${T.div} shrink-0`}>
          <button onClick={() => dlFile(md, `${pn}.md`, 'text/markdown')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${T.btnGhost}`}><Download className="w-3 h-3" />MD</button>
          <button onClick={() => dlFile(txt, `${pn}.txt`, 'text/plain')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${T.btnGhost}`}><FileText className="w-3 h-3" />TXT</button>
          <button onClick={doPrint} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${T.btnGhost}`}><Printer className="w-3 h-3" />PDF</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   Log Panel
   ══════════════════════════════════════════════════════ */
const LogPanel = ({ logs, onClose, onDelete, onDeleteAll, onExportAll, onExportAnswers, onExportOne, onImport, settings, onSettings }) => {
  const fileRef = useRef(null);
  const handleImport = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { try { onImport(JSON.parse(ev.target.result)); } catch { alert('Invalid JSON'); } }; r.readAsText(f); e.target.value = ''; };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`${T.card} w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${T.div} shrink-0`}>
          <div className="flex items-center gap-2"><Database className="w-4 h-4 text-blue-500" /><span className={`text-sm font-semibold ${T.t1}`}>ログ管理</span><span className={`text-xs ${T.t3}`}>{logs.length}件</span></div>
          <button onClick={onClose} className={`p-1 rounded-lg ${T.btnGhost}`}><X className="w-4 h-4" /></button>
        </div>
        {/* Save mode */}
        <div className={`px-4 py-2 border-b ${T.div} flex items-center gap-2 flex-wrap text-xs`}>
          <span className={T.t3}>保存モード:</span>
          {['all', 'answers', 'off'].map(m => (
            <button key={m} onClick={() => onSettings({ ...settings, logMode: m })}
              className={`px-2 py-1 rounded-lg border transition text-xs ${settings.logMode === m ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/50 text-blue-700 dark:text-blue-300' : `${T.btnGhost} border-slate-200 dark:border-slate-700/60`}`}>
              {{ all: 'Q&A全保存', answers: '回答のみ', off: 'OFF' }[m]}
            </button>
          ))}
          <button onClick={() => onSettings({ ...settings, autoSave: !settings.autoSave })} className={`flex items-center gap-1 ml-auto text-xs ${T.t2}`}>
            {settings.autoSave ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}自動保存
          </button>
        </div>
        {/* Actions */}
        <div className={`px-4 py-2 border-b ${T.div} flex items-center gap-2 flex-wrap text-xs`}>
          <button onClick={onExportAll} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs ${T.btnGhost}`}><Download className="w-3 h-3" />全エクスポート</button>
          <button onClick={onExportAnswers} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs ${T.btnGhost}`}><Download className="w-3 h-3" />回答のみ</button>
          <button onClick={() => fileRef.current?.click()} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs ${T.btnGhost}`}><Upload className="w-3 h-3" />インポート</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          {logs.length > 0 && <button onClick={onDeleteAll} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition ml-auto"><Trash2 className="w-3 h-3" />全削除</button>}
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {logs.length === 0 && <p className={`text-xs ${T.t3} text-center py-8`}>ログがありません</p>}
          {logs.map((log) => (
            <div key={log.id} className={`${T.cardFlat} p-3`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${T.accentTxt}`}>{log.projectName}</span>
                <span className={`text-xs ${T.t3}`}>{new Date(log.timestamp).toLocaleString('ja-JP')}</span>
              </div>
              <p className={`text-xs ${T.t2} mb-2 line-clamp-2`}>{log.results?.understanding?.slice(0, 120)}…</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onExportOne(log)} className={`text-xs ${T.accentTxt} flex items-center gap-0.5`}><Download className="w-3 h-3" />JSON</button>
                <button onClick={() => onDelete(log.id)} className="text-xs text-red-500 dark:text-red-400 flex items-center gap-0.5 ml-auto"><Trash2 className="w-3 h-3" />削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   Issue Row
   ══════════════════════════════════════════════════════ */
const IssueRow = ({ issue, idx, onChange, onRemove, onAddSub, onSubChange, onRemoveSub }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-start gap-1.5">
        <button onClick={() => setOpen(o => !o)} className={`mt-1.5 p-0.5 rounded ${T.t3} hover:text-slate-600 dark:hover:text-slate-300 transition shrink-0`}>
          <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
        </button>
        <input value={issue.text} onChange={e => onChange(idx, 'text', e.target.value)} placeholder="課題…" className={`${T.inpSm} flex-1`} />
        <button onClick={() => onRemove(idx)} className="mt-1 p-1 rounded text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition shrink-0"><Minus className="w-3 h-3" /></button>
      </div>
      {open && (
        <div className={`ml-5 mt-1.5 space-y-1.5 pl-2 border-l ${T.div}`}>
          <input value={issue.detail || ''} onChange={e => onChange(idx, 'detail', e.target.value)} placeholder="背景・影響度・定量データ…" className={T.inpSm} />
          {(issue.sub || []).map((s, si) => (
            <div key={si} className="flex items-center gap-1">
              <span className={`text-xs ${T.t3}`}>└</span>
              <input value={s} onChange={e => onSubChange(idx, si, e.target.value)} placeholder="サブ課題…" className={`${T.inpSm} flex-1`} />
              <button onClick={() => onRemoveSub(idx, si)} className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400"><Minus className="w-2.5 h-2.5" /></button>
            </div>
          ))}
          <button onClick={() => onAddSub(idx)} className={`flex items-center gap-1 text-xs ${T.t3} hover:text-slate-600 dark:hover:text-slate-300 ml-3`}><Plus className="w-3 h-3" />サブ課題</button>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   Main App
   ══════════════════════════════════════════════════════ */
export default function App() {
  // Theme
  const [isDark, setIsDark] = useState(() => { const d = getInitialDark(); applyTheme(d); return d; });
  const toggleTheme = () => setIsDark(d => { applyTheme(!d); return !d; });

  // Model
  const [modelId, setModelId] = useState('gpt-5-nano');
  const [showCfg, setShowCfg] = useState(false);
  const [connStatus, setConnStatus] = useState({ status: 'idle', msg: '' });

  // Form
  const [dep, setDep] = useState(2);
  const [form, setForm] = useState({ projectName: '', productService: '', teamGoals: '', sessionType: 'product', customSession: '', tlMode: 'period', tlStart: '', tlEnd: '', tlDead: '', issues: [{ text: '', detail: '', sub: [] }] });

  // Results
  const [loading,    setLoading]    = useState(false);
  const [results,    setResults]    = useState(null);
  const [error,      setError]      = useState(null);
  const [usedName,   setUsedName]   = useState('');
  const [showPrev,   setShowPrev]   = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [refining,   setRefining]   = useState(false);
  const [diving,     setDiving]     = useState(false);
  const [hist,       setHist]       = useState([]);

  // Storage
  const [logs,       setLogs]       = useState(() => loadLogs());
  const [stgSettings, setStgSettings] = useState(() => loadSettings());
  const [showLogs,   setShowLogs]   = useState(false);

  const cm = MODELS.find(m => m.id === modelId) || MODELS[0];

  const onF = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const sesLabel  = form.sessionType === 'other' ? (form.customSession || 'カスタム') : TYPES[form.sessionType];
  const tlStr     = form.tlMode === 'period' ? `${form.tlStart || '?'} 〜 ${form.tlEnd || '?'}` : (form.tlDead || '未指定');
  const suggestions = SUGGEST[form.sessionType] || SUGGEST.other;
  const issueTpl    = ISSUE_TPL[form.sessionType] || ISSUE_TPL.other;
  const issueStr  = useMemo(() => form.issues.filter(x => x.text.trim()).map(x => { let s = x.text; if (x.detail) s += `（${x.detail}）`; if (x.sub?.filter(Boolean).length) s += ': ' + x.sub.filter(Boolean).join(', '); return s; }).join(' / '), [form.issues]);

  const setIssue = (i, k, v) => setForm(p => { const is = [...p.issues]; is[i] = { ...is[i], [k]: v }; return { ...p, issues: is }; });
  const addIssue = (t = '') => setForm(p => ({ ...p, issues: [...p.issues, { text: t, detail: '', sub: [] }] }));
  const rmIssue  = i => setForm(p => ({ ...p, issues: p.issues.filter((_, j) => j !== i) }));
  const addSub   = i => setForm(p => { const is = [...p.issues]; is[i] = { ...is[i], sub: [...(is[i].sub || []), ''] }; return { ...p, issues: is }; });
  const setSub   = (i, si, v) => setForm(p => { const is = [...p.issues]; const s = [...(is[i].sub || [])]; s[si] = v; is[i] = { ...is[i], sub: s }; return { ...p, issues: is }; });
  const rmSub    = (i, si) => setForm(p => { const is = [...p.issues]; is[i] = { ...is[i], sub: (is[i].sub || []).filter((_, j) => j !== si) }; return { ...p, issues: is }; });

  // Logs
  const saveLog = useCallback((pn, f, res, q) => {
    if (stgSettings.logMode === 'off') return;
    const entry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), timestamp: new Date().toISOString(), projectName: pn, model: cm.label, depth: dep, form: f, ...(stgSettings.logMode === 'all' ? { query: q, results: res } : { results: res }) };
    const updated = [entry, ...logs].slice(0, 200);
    setLogs(updated); saveLogs(updated);
  }, [logs, stgSettings, cm.label, dep]);

  const deleteLog    = (id) => { const u = logs.filter(l => l.id !== id); setLogs(u); saveLogs(u); };
  const deleteAllLogs = () => { if (!confirm('全ログを削除しますか？')) return; setLogs([]); saveLogs([]); };
  const handleImport  = (data) => { const arr = Array.isArray(data) ? data : [data]; const merged = [...arr.filter(d => d.id && d.timestamp), ...logs]; const unique = [...new Map(merged.map(x => [x.id, x])).values()].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 500); setLogs(unique); saveLogs(unique); };
  const updateSettings = (s) => { setStgSettings(s); saveSettings(s); };

  // Seed
  const applySeed = useCallback(() => {
    const s = nextSeed();
    setModelId(s.modelId);
    setDep(s.dep);
    setForm(s.form);
    setResults(s.results);
    setUsedName(s.form.projectName || autoN(s.form.productService, s.form.teamGoals));
    setReviewText('');
    setHist([]);
    setError(null);
    setConnStatus({ status: 'idle', msg: '' });
  }, []);

  // Connection test
  const runConnTest = useCallback(async () => {
    setConnStatus({ status: 'testing', msg: '' });
    try {
      const model = await testConn(modelId);
      setConnStatus({ status: 'ok', msg: `OK: ${model}` });
    } catch (e) {
      setConnStatus({ status: 'error', msg: e.message });
    }
  }, [modelId]);

  useEffect(() => { if (!showCfg) return; setConnStatus({ status: 'idle', msg: '' }); }, [modelId, showCfg]);

  const buildPrompt = (pn) => {
    const dc = DEPTH[dep];
    const expert = dep >= 3
      ? `あなたはBCG/McKinsey/Accenture出身のシニアパートナー。同等のドメイン専門家への戦略アドバイス。一般論不要。業界固有の構造課題に踏み込み、定量根拠やフレームワーク(Porter, Value Chain, 3C, MECE, Issue Tree等)を援用。仮説駆動でアクションプラン・期待効果まで言及。${webSearch ? '必ずWeb検索で最新市場データ・競合動向を調査し、URLも提示。' : ''}`
      : `経験豊富な戦略コンサルタント。専門家同士の対話レベル。具体的で実行可能な提案。${webSearch ? 'Web検索で最新情報を調査し参照URLを含めてください。' : ''}`;
    return `${expert}\n\n【PJ】${pn}【プロダクト】${form.productService}【タイムライン】${tlStr}【目標】${form.teamGoals}${issueStr ? `【課題】${issueStr}` : ''}【セッション】${sesLabel}【深度】${dc.label}\n\nJSONのみ(コードブロック不要):\n{"understanding":"${dep >= 3 ? '5-7文の深い分析' : '2-3文'}","ideas":[${dc.ideas}個: {"title":"8語以内","description":"${dep >= 3 ? '4-6文。Why/What/How・定量示唆' : '2-3文'}","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High"}]}`;
  };

  const generate = useCallback(async () => {
    if (!form.productService || !form.teamGoals) { setError('必須項目（*）を入力'); return; }
    const pn = form.projectName.trim() || autoN(form.productService, form.teamGoals);
    setUsedName(pn); setLoading(true); setError(null); setResults(null); setReviewText(''); setHist([]);
    const prompt = buildPrompt(pn);
    try {
      const msg = { role: 'user', content: prompt };
      const raw = await callAI(modelId, [msg]);
      const parsed = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      setResults(parsed); setHist([msg, { role: 'assistant', content: raw }]);
      if (stgSettings.autoSave) saveLog(pn, form, parsed, prompt);
    } catch (e) {
      console.error(e);
      setError(`生成失敗: ${e.message}`);
      setResults({ understanding: `PJ「${pn}」の${sesLabel}セッション。目標「${form.teamGoals}」に向けた戦略提案。`, ideas: [{ title: 'バリューチェーン再構築', description: '低付加価値プロセスを特定し自動化を推進。', priority: 'High', effort: 'High', impact: 'High' }, { title: 'データドリブン意思決定', description: 'KPIツリーとダッシュボードで仮説検証サイクルを週次に短縮。', priority: 'High', effort: 'Medium', impact: 'High' }, { title: 'クロスファンクショナルスクワッド', description: '機能横断チーム編成でE2E提供速度を向上。', priority: 'Medium', effort: 'Medium', impact: 'High' }, { title: 'JTBD分析UXリデザイン', description: 'ジョブ理論で顧客ニーズを特定しコア体験を再設計。', priority: 'Medium', effort: 'High', impact: 'High' }, { title: 'アジャイルPoC標準化', description: '2週スプリント検証で投資判断を高速化。', priority: 'Medium', effort: 'Low', impact: 'Medium' }, { title: 'エコシステムアライアンス', description: '補完ケイパビリティ持つパートナー協業で制約を突破。', priority: 'Low', effort: 'Medium', impact: 'Medium' }] });
    }
    setLoading(false);
  }, [form, modelId, dep, sesLabel, tlStr, issueStr, stgSettings, saveLog]);

  const refine = useCallback(async () => {
    if (!reviewText.trim() || !results) return;
    setRefining(true); setError(null);
    try {
      const msg = { role: 'user', content: `以下レビューに基づきブラッシュアップ。専門家レベルで改善。\n\n【レビュー】${reviewText}\n\nMarkdown形式で回答。` };
      const h2 = [...hist, msg]; const raw = await callAI(modelId, h2);
      setResults(p => ({ ...p, refinement: raw })); setHist([...h2, { role: 'assistant', content: raw }]);
      if (stgSettings.autoSave) saveLog(usedName, form, { ...results, refinement: raw }, reviewText);
    } catch (e) { setError(`改善失敗: ${e.message}`); }
    setRefining(false);
  }, [reviewText, results, hist, modelId, stgSettings, saveLog, usedName, form]);

  const deepDive = useCallback(async (q) => {
    if (!results) return; setDiving(true); setError(null);
    try {
      const msg = { role: 'user', content: `専門家として詳細回答。\n\n【質問】${q}\n\nMarkdown形式で回答（見出し・テーブル・リスト活用）。` };
      const h2 = [...hist, msg]; const raw = await callAI(modelId, h2);
      setResults(p => ({ ...p, deepDive: (p.deepDive ? p.deepDive + '\n\n---\n\n' : '') + `### ${q}\n\n${raw}` }));
      setHist([...h2, { role: 'assistant', content: raw }]);
    } catch (e) { setError(`深掘り失敗: ${e.message}`); }
    setDiving(false);
  }, [results, hist, modelId]);

  const report = results ? buildReportMd(usedName, form, results, 'OpenAI', cm.label, dep) : null;

  /* ── Render ── */
  return (
    <div className={T.page}>
      <div className="max-w-5xl mx-auto px-3 py-4 md:px-6 md:py-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className={`text-sm font-semibold ${T.t1}`}>AI Strategic Brainstorm</h1>
              <p className={`text-xs ${T.t3}`}>Expert-grade ideation</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Model badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${T.cardFlat} ${T.t2}`}>
              <span className={T.accentTxt}>◆</span> {cm.label}
              {connStatus.status === 'ok'      && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={connStatus.msg} />}
              {connStatus.status === 'error'   && <span className="w-1.5 h-1.5 rounded-full bg-red-500"     title={connStatus.msg} />}
              {connStatus.status === 'testing' && <Loader className="w-3 h-3 animate-spin" />}
            </div>
            {/* Seed button */}
            <button onClick={applySeed} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition`} title="サンプルデータを投入">
              <FlaskConical className="w-3.5 h-3.5" />Seed
            </button>
            {/* Theme toggle */}
            <button onClick={toggleTheme} className={`p-1.5 rounded-lg ${T.btnGhost}`} title={isDark ? 'ライトモード' : 'ダークモード'}>
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setShowLogs(true)} className={`p-1.5 rounded-lg ${T.btnGhost}`} title="ログ"><Database className="w-3.5 h-3.5" /></button>
            <button onClick={() => setShowCfg(s => !s)} className={`p-1.5 rounded-lg ${showCfg ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400' : T.btnGhost} rounded-lg border`}><Settings className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* ── Config Panel ── */}
        {showCfg && (
          <div className={`${T.card} p-3 mb-4 space-y-3 text-xs`}>
            {/* Model select */}
            <div>
              <p className={`text-xs font-medium ${T.t2} mb-1.5`}>モデル</p>
              <div className="flex gap-1.5 flex-wrap">
                {MODELS.map(m => (
                  <button key={m.id} onClick={() => { setModelId(m.id); setConnStatus({ status: 'idle', msg: '' }); }}
                    className={`px-2.5 py-1.5 rounded-lg border transition text-xs text-left ${modelId === m.id ? 'bg-slate-800 dark:bg-slate-700 border-slate-600 dark:border-slate-500 text-slate-100 font-medium' : `${T.btnGhost} border-slate-200 dark:border-slate-700/60`}`}>
                    <span className="font-medium">{m.label}</span> <span className={`${T.t3} font-normal`}>{m.cost} · {m.t}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className={`text-xs ${T.t3}`}>✓ APIキー不要（サーバープロキシ経由）</p>
            {/* Connection test */}
            <div className={`flex items-center gap-2 pt-2 border-t ${T.div}`}>
              <button onClick={runConnTest} disabled={connStatus.status === 'testing'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${T.btnGhost} disabled:opacity-40`}>
                {connStatus.status === 'testing' ? <><Loader className="w-3 h-3 animate-spin" />テスト中…</> : <><Wifi className="w-3 h-3" />接続テスト</>}
              </button>
              {connStatus.status === 'ok'    && <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{connStatus.msg}</span>}
              {connStatus.status === 'error' && <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 max-w-xs truncate" title={connStatus.msg}><WifiOff className="w-3 h-3 shrink-0" />{connStatus.msg}</span>}
            </div>
          </div>
        )}

        {/* ── Main Form ── */}
        <div className={`${T.card} p-4 mb-4`}>
          {/* Project + Product */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="relative">
              <label className={`block text-xs font-medium ${T.t2} mb-1`}>プロジェクト名</label>
              <input name="projectName" value={form.projectName} onChange={onF} placeholder="空欄→AI命名" className={`${T.inp} pr-16`} />
              <span className={`absolute right-2.5 top-7 text-xs ${T.t3} pointer-events-none flex items-center gap-0.5`}><Wand2 className="w-3 h-3" />自動</span>
            </div>
            <div>
              <label className={`block text-xs font-medium ${T.t2} mb-1`}>プロダクト / サービス *</label>
              <input name="productService" value={form.productService} onChange={onF} placeholder="例: ドローン点検SaaS" className={T.inp} />
            </div>
          </div>

          {/* Session type */}
          <div className="mb-3">
            <label className={`block text-xs font-medium ${T.t2} mb-1`}>セッションタイプ</label>
            {form.sessionType === 'other'
              ? <div className="flex gap-2">
                  <button onClick={() => setForm(p => ({ ...p, sessionType: 'product' }))} className={`shrink-0 px-2.5 py-2 rounded-lg border text-xs ${T.btnGhost}`}>← 戻す</button>
                  <input name="customSession" value={form.customSession} onChange={onF} placeholder="例: 海外展開戦略、M&A検討、IPO準備…" className={`${T.inp} flex-1`} autoFocus />
                </div>
              : <select name="sessionType" value={form.sessionType} onChange={onF} className={T.inp} style={{ backgroundImage: 'none' }}>
                  {Object.entries(TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            }
          </div>

          {/* Timeline */}
          <div className="mb-3">
            <label className={`block text-xs font-medium ${T.t2} mb-1`}>タイムライン</label>
            <div className="flex items-center gap-2">
              <div className={`flex shrink-0 rounded-lg overflow-hidden border ${T.div}`}>
                {[['period', '期間', CalendarRange], ['deadline', '期日', CalendarCheck]].map(([m, l, I]) => (
                  <button key={m} onClick={() => setForm(p => ({ ...p, tlMode: m }))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs transition ${form.tlMode === m ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : `${T.t2} hover:bg-slate-100 dark:hover:bg-slate-700/40`}`}>
                    <I className="w-3 h-3" />{l}
                  </button>
                ))}
              </div>
              {form.tlMode === 'period'
                ? <div className="flex items-center gap-1.5 flex-1">
                    <input type="date" name="tlStart" value={form.tlStart} onChange={onF} className={`${T.inp} flex-1`} />
                    <span className={`text-xs ${T.t3}`}>〜</span>
                    <input type="date" name="tlEnd" value={form.tlEnd} onChange={onF} className={`${T.inp} flex-1`} />
                  </div>
                : <input type="date" name="tlDead" value={form.tlDead} onChange={onF} className={`${T.inp} flex-1`} />
              }
            </div>
          </div>

          {/* Goals + Depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className={`block text-xs font-medium ${T.t2} mb-1`}>チーム目標 *</label>
              <textarea name="teamGoals" value={form.teamGoals} onChange={onF} rows={2} placeholder="定量目標を含めると精度向上" className={`${T.inp} resize-none`} />
            </div>
            <div>
              <label className={`block text-xs font-medium ${T.t2} mb-1 flex items-center gap-1`}><SlidersHorizontal className="w-3 h-3" />分析深度</label>
              <div className="space-y-1">
                {Object.entries(DEPTH).map(([k, v]) => (
                  <button key={k} onClick={() => setDep(Number(k))}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs border transition ${Number(k) === dep ? 'bg-slate-900 dark:bg-slate-700 border-slate-600 text-slate-100 font-medium' : `${T.btnGhost} border-slate-200 dark:border-slate-700/60`}`}>
                    <span className="font-medium">{v.label}</span> <span className="opacity-50">· {v.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="mb-3">
            <label className={`block text-xs font-medium ${T.t2} mb-1.5 flex items-center gap-1`}><Layers className="w-3 h-3" />現状課題</label>
            <div className="space-y-1.5">
              {form.issues.map((iss, i) => <IssueRow key={i} issue={iss} idx={i} onChange={setIssue} onRemove={rmIssue} onAddSub={addSub} onSubChange={setSub} onRemoveSub={rmSub} />)}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button onClick={() => addIssue()} className={`flex items-center gap-1 text-xs ${T.t3} hover:text-slate-600 dark:hover:text-slate-300`}><Plus className="w-3 h-3" />追加</button>
              <span className={T.t3}>|</span>
              {issueTpl.map((t, i) => <button key={i} onClick={() => addIssue(t)} className={`px-2 py-0.5 rounded-full text-xs border ${T.btnGhost}`}>{t}</button>)}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/40 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-xs whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {/* Submit row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {usedName && results && (
              <span className={`text-xs ${T.t3}`}>PJ: <span className={`font-medium ${T.accentTxt}`}>{usedName}</span>{!form.projectName.trim() && <span className="ml-1 opacity-40">(auto)</span>}</span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {results && (
                <button onClick={() => setShowPrev(true)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border ${T.btnGhost}`}>
                  <Eye className="w-3.5 h-3.5" />プレビュー
                </button>
              )}
              <button onClick={generate} disabled={loading}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm ${T.btnAccent} disabled:opacity-40 transition-all`}>
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />分析中…</> : <><Sparkles className="w-4 h-4" />戦略アイデア生成</>}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════ Results ══════════ */}
        {results && (
          <div className="space-y-3">
            {/* Understanding */}
            <div className={`${T.card} p-4`}>
              <h3 className={`text-xs font-semibold ${T.accentTxt} mb-2 flex items-center gap-1.5`}><Target className="w-3.5 h-3.5" />AI 状況分析</h3>
              <RichText text={results.understanding} />
            </div>

            {/* Idea grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.ideas.map((idea, i) => (
                <div key={i} className={`${T.card} p-3.5 hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors`}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`w-5 h-5 rounded bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-xs font-bold ${T.t2} shrink-0`}>{i + 1}</div>
                    <h4 className={`text-sm font-semibold ${T.t1} leading-snug`}>{idea.title}</h4>
                  </div>
                  <div className="mb-2.5"><RichText text={idea.description} /></div>
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700/40">
                    {[{ l: '優先度', v: idea.priority, c: priorityC }, { l: '工数', v: idea.effort, c: effortC, ico: <Clock className="w-2.5 h-2.5" /> }, { l: 'インパクト', v: idea.impact, c: impactC, ico: <TrendingUp className="w-2.5 h-2.5" /> }].map(r => (
                      <div key={r.l} className="flex items-center justify-between text-xs">
                        <span className={`flex items-center gap-1 ${T.t3}`}>{r.ico}{r.l}</span>
                        <span className={`px-1.5 py-0.5 rounded-full border text-xs font-medium ${r.c(r.v)}`}>{ll(r.v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Deep-dive suggestions */}
            <div className={`${T.cardFlat} p-3`}>
              <h4 className={`text-xs font-semibold ${T.t2} mb-2 flex items-center gap-1`}><Search className="w-3 h-3" />深掘りサジェスト</h4>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((q, i) => (
                  <button key={i} onClick={() => deepDive(q)} disabled={diving}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${T.btnGhost} hover:border-blue-300 dark:hover:border-blue-700/50 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 transition`}>
                    <ChevronRight className="w-3 h-3" />{q}
                  </button>
                ))}
              </div>
              {diving && <div className={`mt-2 flex items-center gap-1.5 text-xs ${T.t3}`}><div className="w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin" />分析中…</div>}
            </div>

            {/* Deep dive output */}
            {results.deepDive && (
              <div className={`${T.card} p-4 border-l-2 border-l-blue-400 dark:border-l-blue-600`}>
                <h4 className={`text-xs font-semibold ${T.accentTxt} mb-2 flex items-center gap-1`}><Search className="w-3.5 h-3.5" />深掘り分析</h4>
                <RichText text={results.deepDive} />
              </div>
            )}

            {/* Refinement output */}
            {results.refinement && (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" />ブラッシュアップ</h4>
                <RichText text={results.refinement} />
              </div>
            )}

            {/* Review input */}
            <div className={`${T.cardFlat} p-3`}>
              <h4 className={`text-xs font-semibold ${T.t2} mb-2 flex items-center gap-1`}><MessageSquarePlus className="w-3 h-3" />レビュー & ブラッシュアップ</h4>
              <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={2} placeholder="方向性修正、追加観点、深掘りポイント…" className={`${T.inp} resize-none mb-2`} />
              <button onClick={refine} disabled={refining || !reviewText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 transition">
                {refining ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />処理中…</> : <><RefreshCw className="w-3 h-3" />ブラッシュアップ</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPrev && report && <Preview md={report} pn={usedName} onClose={() => setShowPrev(false)} />}
      {showLogs && <LogPanel logs={logs} onClose={() => setShowLogs(false)} onDelete={deleteLog} onDeleteAll={deleteAllLogs} onExportAll={() => exportJSON(logs, 'brainstorm-logs-all.json')} onExportAnswers={() => exportJSON(logs.map(l => ({ id: l.id, timestamp: l.timestamp, projectName: l.projectName, results: l.results })), 'brainstorm-answers.json')} onExportOne={(l) => exportJSON(l, `${l.projectName}.json`)} onImport={handleImport} settings={stgSettings} onSettings={updateSettings} />}
    </div>
  );
}
