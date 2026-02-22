import { useState, useCallback } from 'react';
import { isHRContext, getHRDomainContext } from '../constants/domainContext';
import { parseAIJson } from '../utils/parseAIJson';
import { BrainstormForm, AIResults, ChatMessage, ConnStatus } from '../types';
import { callAI, callAIWithKey, testConn, DEFAULT_MODEL_ID, isProMode } from '../constants/models';
import { FREE_DEPTH, PRO_DEPTH } from '../constants/prompts';
import { MAX_HIST, CHAT_MAX_TOKENS } from '../constants/config';

export const useAI = () => {
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [connStatus, setConnStatus] = useState<ConnStatus>({ status: 'idle', msg: '' });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [refining, setRefining] = useState(false);
  const [diving, setDiving] = useState(false);
  const [hist, setHist] = useState<ChatMessage[]>([]);

  const runConnTest = useCallback(async (apiKey = '') => {
    setConnStatus({ status: 'testing', msg: '' });
    try {
      const model = await testConn(modelId, apiKey);
      setConnStatus({ status: 'ok', msg: `OK: ${model}` });
    } catch (e: unknown) {
      setConnStatus({ status: 'error', msg: e instanceof Error ? e.message : String(e) });
    }
  }, [modelId]);

  const buildPrompt = (pn: string, form: BrainstormForm, dep: number, sesLabel: string, issueStr: string, proMode: boolean) => {
    const dc = proMode ? PRO_DEPTH[dep] : FREE_DEPTH[dep];

    // ── セッションタイプ別 役割定義（Prompt74jpから抽出・合成） ──
    const ROLE_DEFS: Record<string, { role: string; lens: string }> = {
      'product': {
        role: 'あなたは、事業戦略の立案と実行計画の策定を専門とするビジネスコンサルタントです。事業計画ロードマップの構築・収益性改善・差別化戦略の設計に深い知見を持ち、ユーザーのサービス・事業の現状を多角的に分析して実行可能な改善策を提案します。',
        lens: '収益性・成長性・競争優位性・実行可能性',
      },
      'marketing': {
        role: 'あなたは、ターゲット顧客の深層心理と購買行動に精通した一流のマーケティング戦略家です。DRM（ダイレクト・レスポンス・マーケティング）の「マーケット・メッセージ・メディア」3要素を統合分析し、費用対効果の高い集客設計と訴求メッセージの改善を支援します。',
        lens: 'ターゲットのメンタルモデル・メッセージ共鳴・チャネル最適化・ROI',
      },
      'growth': {
        role: 'あなたは、収益拡大とビジネスグロースを専門とするコンサルタントです。ユニットエコノミクス（LTV/CAC）の分析・顧客セグメント別成長ポテンシャルの評価・解約抑制と新規獲得の最適化を統合的に設計し、持続可能な成長の打ち手を提案します。',
        lens: 'ユニットエコノミクス・セグメント収益性・獲得コスト・継続率',
      },
      'innovation': {
        role: 'あなたは、新規事業立ち上げと仮説検証を専門とするビジネスコンサルタントです。「未知の領域に対して仮説行動を実践し価値あるアイデアを導き出す思考パートナー」として、情報の構造化と「分からないことのあぶり出し」を通じて鋭い仮説を生成・検証し、ユーザーが次に取るべき行動を明確にします。',
        lens: 'イシュー特定・仮説検証・PMF・経営承認可能性',
      },
      'cx': {
        role: 'あなたは、顧客行動と顧客心理に基づいて顧客体験を設計するCX（顧客体験）コンサルタントです。顧客の顕在・潜在ニーズを深く分析し、期待値とのギャップを特定して、満足度向上・継続率改善・信頼関係構築の具体策を提案します。',
        lens: '顧客ジャーニー・期待値ギャップ・担当者品質均一化・信頼構築',
      },
      'ops': {
        role: 'あなたは、営業活動と業務オペレーション改善を専門とするコンサルタントです。論点思考（イシュー思考）に基づき、商談化率・CRM活用・業務標準化・担当者間ナレッジ共有を通じて組織全体の営業生産性を高める施策を設計します。表面的な問題ではなく根本的なイシューから打ち手を設計することを最優先とします。',
        lens: '商談化率・CRM活用深度・ナレッジ標準化・業務効率',
      },
      'dx': {
        role: 'あなたは、業種を問わずデジタルトランスフォーメーション（DX）と業務効率化を支援する経験豊富なDXコンサルタントです。現場の実態と変革抵抗を踏まえた段階的なデジタル化ロードマップを設計し、ツール選定・定着化・ROI最大化を統合的に支援します。',
        lens: '現場定着可能性・投資対効果・段階的移行リスク・変革管理',
      },
      'design-system': {
        role: 'あなたは、ブランド一貫性とコミュニケーション品質の向上を専門とするブランドコンサルタントです。複数の媒体・接点を横断したメッセージ統一と、制作プロセスの効率化・外注品質管理を両立する施策を設計します。',
        lens: 'ブランド一貫性・制作コスト・承認効率・メッセージ統一',
      },
      'other': {
        role: 'あなたは、経営戦略の立案と意思決定支援を専門とする戦略コンサルタントです。定性的な顧客の声・組織の実態・市場データを統合分析し、最も重要な課題（イシュー）を特定して、論理（ロジック）と実行可能性の両面から具体的な行動計画を提案します。',
        lens: '戦略的優先順位・実行可能性・ステークホルダー合意・短期成果と中長期投資のバランス',
      },
    };

    const rd = ROLE_DEFS[form.sessionType] ?? ROLE_DEFS['other'];

    // ── HR ドメイン知識注入 ──
    const issueTexts = form.issues.filter(x => x.text.trim()).map(x => x.text);
    const hrDetected = isHRContext(form.productService, issueTexts);
    const hrContext = hrDetected ? getHRDomainContext(proMode) : '';

    // ── 共通前提条件 ──
    const commonConditions = [
      '現状の取り組みを否定せず、強みを活かしながら「次に何をすべきか」を建設的・前向きに提案する',
      '課題の原因を指摘する場合も批判的な表現を避け、改善の機会として表現する',
      '担当者（営業・マーケ・経営企画）が明日から実行できる具体的なアクションを含める',
      'ビジネス成果（売上・利益・顧客満足・効率改善）を軸に効果を示す',
      '数値を使う場合は絶対値より相対値（「業界平均比○倍」「現状比+○%」等）を優先し、推定値には「業界目安」「一般的に」等の根拠を付記する。裏付けのない具体的数字の断言は避ける',
    ].join('。');

    // ── 深度別 出力指示 ──
    const depthMap: Record<number, { understanding: string; desc: string }> = {
      1: { understanding: '1-2文で核心を指摘', desc: '1文で具体的アクション' },
      2: { understanding: '2-3文で現状分析と機会を指摘', desc: '2文。Why（なぜ今）とWhat（何をするか）' },
      3: { understanding: '3-5文の深い分析。市場文脈・根本原因・改善機会を構造的に', desc: '3-4文。Why/What/How＋期待効果（定量示唆）' },
      4: { understanding: '5-7文の戦略コンサル級分析。業界構造・競合動向・ユニットエコノミクスを含む', desc: '4-6文。Why/What/How/So What＋定量効果・優先順位の根拠' },
    };
    const dmap = depthMap[dep] ?? depthMap[2];

    let roleDescription = rd.role;
    let deepExpert = '';

    if (proMode) {
      if (dep === 4) {
        // High-Class Consultant Mode
        roleDescription = `あなたは世界トップティアの戦略ファーム（McKinsey, BCG, Bain等）のパートナーレベルのコンサルタントです。\n${rd.role}\n\nあなたのミッションは、クライアント（ユーザー）の思考の枠を超え、非連続な成長をもたらす「筋の良い戦略」を提示することです。表面的な改善ではなく、構造的な課題（イシュー）を特定し、論理的かつ創造的な解決策を提示してください。`;
        
        deepExpert = `
【思考・振る舞いのルール】
1. **イシューからはじめよ**: 「何が本質的な課題か」を最初に定義し、そこから逆算して解を導く。
2. **MECEかつロジカル**: 漏れなくダブりなく構造化し、論理の飛躍を避ける（Why so? / So what?）。
3. **ファクトベース**: 曖昧な精神論ではなく、想定される定量インパクトやKPIを具体的に示す。
4. **建設的クリティカル**: 現状を否定するのではなく、「さらなる高み」を目指すための建設的な批判と進化の提案を行う。
5. **プロフェッショナリズム**: クライアント（ユーザー）をリスペクトしつつ、迎合せずにプロとして最善の提言を行う。

【出力品質の基準】
- 単なる「ToDoリスト」ではなく、「戦略的ストーリー」として記述する。
- 各アイデアには、なぜそれが有効なのかの「メカニズム」を記載する。
- リスクやトレードオフがあれば正直に付記する。`;
      } else if (dep >= 3) {
        // Standard Deep Mode
        deepExpert = '\n【高深度モード】業界固有の構造課題に踏み込み、定量根拠やフレームワーク（3C・MECE・Issue Tree・バリューチェーン等）を援用。仮説駆動でアクションプランと期待効果まで言及すること。';
      }
    }

    const hrJson = hrDetected ? `"keyIssue":"最重要イシューを1文で特定","funnelStage":"ボトルネックのファネルステージ名",` : '';

    if (proMode) {
      return `【あなたの役割】
${roleDescription}
${deepExpert}

【前提条件】
${commonConditions}。

【分析の視点】
${rd.lens}
${hrContext ? `\n${hrContext}` : ''}
【分析対象】
プロジェクト: ${pn} / プロダクト・サービス: ${form.productService}
チーム目標: ${form.teamGoals}${issueStr ? `\n現状課題: ${issueStr}` : ''}
セッション: ${sesLabel} / 分析深度: ${dc.label}

【出力形式】JSONのみ・コードブロック不要:
{"understanding":"${dmap.understanding}",${hrJson}"ideas":[${dc.ideas}個: {"title":"8語以内の行動起点タイトル","description":"${dmap.desc}","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High","feasibility":{"total":0-100総合,"resource":0-100リソース充足度,"techDifficulty":0-100技術的容易性(高=容易),"orgAcceptance":0-100組織受容性}}],"suggestions":["入力内容のプロダクト・課題・目標に直結する深掘り質問を5個。セッションタイプに縛られず実務担当者が次に考えるべき問いを設定すること"]}`;
    } else {
      return `ビジネスコンサルとして建設的に分析。${rd.lens}の観点。${hrContext ? ` ${hrContext}` : ''}
対象: ${form.productService} / 目標: ${form.teamGoals}${issueStr ? ` / 課題: ${issueStr}` : ''}
JSONのみ回答:
{"understanding":"${dmap.understanding}",${hrJson}"ideas":[${dc.ideas}個: {"title":"6語以内","description":"${dmap.desc}","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High","feasibility":{"total":0-100,"resource":0-100,"techDifficulty":0-100,"orgAcceptance":0-100}}],"suggestions":["深掘り質問を4個"]}`;
    }
  };

  const generate = useCallback(async (
    pn: string,
    form: BrainstormForm,
    dep: number,
    sesLabel: string,
    issueStr: string,
    onSuccess: (res: AIResults, prompt: string) => void,
    apiKey = '',
  ) => {
    if (!form.productService || !form.teamGoals) {
      setError('必須項目（*）を入力');
      return;
    }

    const proMode = isProMode(apiKey);
    const depTable = proMode ? PRO_DEPTH : FREE_DEPTH;
    const dc = depTable[dep] || depTable[1];

    setLoading(true);
    setError(null);
    setResults(null);
    setReviewText('');
    setHist([]);

    const prompt = buildPrompt(pn, form, dep, sesLabel, issueStr, proMode);

    try {
      const msg: ChatMessage = { role: 'user', content: prompt };
      const raw = proMode
        ? await callAIWithKey(apiKey.trim(), modelId, [msg], dc.maxTokens, true)
        : await callAI(modelId, [msg], dc.maxTokens, false);
      const parsed = parseAIJson(raw);
      
      setResults(parsed);
      setHist([msg, { role: 'assistant', content: raw }]);
      onSuccess(parsed, prompt);
    } catch (e: unknown) {
      console.error(e);
      setError(`生成失敗: ${e instanceof Error ? e.message : String(e)}。フォールバック結果を表示しています。`);
      const issues = form.issues.filter(x => x.text.trim()).map(x => x.text).join('、') || '未指定';
      setResults({
        understanding: `「${form.productService}」の${sesLabel}セッション（目標: ${form.teamGoals}）。現状課題「${issues}」を踏まえた戦略提案。APIとの通信に失敗したためフォールバック結果を表示しています。`,
        ideas: [
          { title: '現状課題の構造化分析', description: `「${issues}」の根本原因を特定し、影響度×緊急度マトリクスで優先順位を整理。`, priority: 'High', effort: 'Low', impact: 'High' },
          { title: 'クイックウィンの特定と実行', description: `${form.teamGoals}達成に向け、2週間以内に成果が出る施策を3つ選定し即座に着手。`, priority: 'High', effort: 'Low', impact: 'High' },
          { title: 'KPIツリーの設計', description: `最終目標を分解し、先行指標と遅行指標を整理。週次レビューサイクルを確立。`, priority: 'High', effort: 'Medium', impact: 'High' },
          { title: 'ステークホルダーマップ整備', description: '意思決定に関わる人物を整理し、合意形成のボトルネックを特定・解消。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
          { title: 'ベンチマーク分析', description: `同業・異業種の成功事例を調査し${form.productService}に適用可能な施策を抽出。`, priority: 'Medium', effort: 'Medium', impact: 'High' },
          { title: '実行ロードマップ策定', description: '30-60-90日プランを策定し、各フェーズのマイルストーンと判断基準を明確化。', priority: 'Medium', effort: 'Low', impact: 'Medium' },
        ],
        suggestions: [
          `${form.productService}の最も重要なKPIは何ですか？`,
          `${issues}の中で最も影響の大きい課題はどれですか？`,
          `${form.teamGoals}を達成するための最大の障壁は？`,
          `競合と比較した際の強み・弱みは？`,
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  const refine = useCallback(async (
    onSuccess: (res: AIResults, text: string) => void,
    apiKey = '',
  ) => {
    if (!reviewText.trim() || !results) return;
    setRefining(true);
    setError(null);
    const proMode = isProMode(apiKey);

    try {
      // keyIssue / funnelStage を注入
      const keyContext = [
        results.keyIssue ? `【最重要イシュー】${results.keyIssue}` : '',
        results.funnelStage ? `【ファネルステージ】${results.funnelStage}` : '',
      ].filter(Boolean).join('\n');

      const ideaSummary = results.ideas
        .map((idea, i) => `${i + 1}. ${idea.title}: ${idea.description}`)
        .join('\n');

      // 過去のブラッシュアップ履歴
      const pastRefinements = (results.refinements || [])
        .map((r, i) => `Review${i + 1}: ${r.review}\nResult: ${r.answer.length > 300 ? r.answer.slice(0, 300) + '…' : r.answer}`)
        .join('\n\n');

      const systemMsg: ChatMessage = {
        role: 'system',
        content: `あなたは戦略コンサルタントです。以下の事業状況と過去の分析を踏まえ、レビュー・フィードバックに基づいて戦略提案をブラッシュアップしてください。

${keyContext}

【状況分析】
${results.understanding}

【現在の戦略アイデア】
${ideaSummary}
${pastRefinements ? `\n【過去のブラッシュアップ履歴】\n${pastRefinements}` : ''}

【前提条件】
- 現状を批判せず、強みを活かした建設的な改善提案に絞る
- 担当者が実行できる具体案を出す
- 過去のブラッシュアップ結果と矛盾しない一貫した改善を行う`,
      };

      const msg: ChatMessage = { role: 'user', content: `【レビュー内容】${reviewText}\n\nMarkdown形式（見出し・箇条書き活用）で回答してください。` };
      const recentHist = hist.slice(-MAX_HIST);
      const h2 = [systemMsg, ...recentHist, msg];
      const raw = proMode
        ? await callAIWithKey(apiKey.trim(), modelId, h2, CHAT_MAX_TOKENS)
        : await callAI(modelId, h2, CHAT_MAX_TOKENS);

      const entry = { review: reviewText, answer: raw };
      const newResults = {
        ...results,
        refinement: raw,
        refinements: [...(results.refinements || []), entry],
      };
      setResults(newResults);
      const newHist = [...h2, { role: 'assistant' as const, content: raw }];
      setHist(newHist.slice(-MAX_HIST));
      setReviewText('');

      onSuccess(newResults, reviewText);
    } catch (e: unknown) {
      setError(`改善失敗: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setRefining(false);
    }
  }, [reviewText, results, hist, modelId]);

  /** APIが使えない場合の戦略的フォールバック深掘り回答を生成 */
  const buildFallbackDeepDive = (q: string, r: AIResults): string => {
    const qWords = q.replace(/[？?は。、の]/g, ' ').split(/\s+/).filter(w => w.length > 1);
    const scored = r.ideas.map(idea => {
      const text = `${idea.title} ${idea.description}`;
      const hits = qWords.filter(w => text.includes(w)).length;
      return { idea, hits };
    });
    scored.sort((a, b) => b.hits - a.hits);
    const top = scored.slice(0, 3).map(s => s.idea);
    const highPri = r.ideas.filter(i => i.priority === 'High');
    const highImpact = r.ideas.filter(i => i.impact === 'High');

    let md = '';

    // ── 1. イシューの構造化 ──
    md += `## イシューの構造化\n\n`;
    md += `「${q}」という問いの本質は、**現状の施策体系に欠けている戦略的一貫性（ストーリーライン）を明確化し、実行の優先順位を再定義すること**にあります。\n\n`;
    if (r.keyIssue) {
      md += `最重要イシュー「${r.keyIssue}」を起点に考えると、この問いは以下の3つのサブイシューに分解できます。\n\n`;
    }
    md += `| サブイシュー | 検証すべき仮説 | 判断基準 |\n|---|---|---|\n`;
    top.forEach((idea, i) => {
      const hypotheses = [
        `${idea.title}が未着手または不十分な場合、目標達成が構造的に阻まれる`,
        `${idea.title}の効果が他施策の前提条件となっている`,
        `${idea.title}の工数対効果が他施策と比較して最も高い`,
      ];
      const criteria = [
        '現状データ（KPI実績）との乖離度',
        '他施策への波及効果の大きさ',
        '2週間以内に初期成果を計測可能か',
      ];
      md += `| ${idea.title} | ${hypotheses[i]} | ${criteria[i]} |\n`;
    });

    // ── 2. 戦略的分析 ──
    md += `\n## 戦略的分析\n\n`;
    md += `### Why：なぜ今この問いが重要か\n\n`;
    md += `現在提示されている ${r.ideas.length} 件の施策のうち、優先度Highは ${highPri.length} 件、インパクトHighは ${highImpact.length} 件です。`;
    if (highPri.length >= 3) {
      md += ` 優先度Highが多いということは、**真の優先順位が曖昧なまま施策が並列化されている**可能性を示唆します。「すべてが重要」は「何も優先していない」と同義であり、ここにイシューの核があります。\n\n`;
    } else {
      md += ` この配分は比較的明確ですが、施策間の**依存関係と実行順序**がより重要な論点となります。\n\n`;
    }

    md += `### What：何を変えるべきか\n\n`;
    if (top.length > 0) {
      md += `最も関連性の高い施策「**${top[0].title}**」を軸に考えると:\n\n`;
      md += `1. **短期（〜1ヶ月）**: ${top[0].title}の成功指標（KPI）を定義し、ベースラインを計測\n`;
      md += `2. **中期（1-3ヶ月）**: ${top.length > 1 ? top[1].title : '関連施策'}との相乗効果を設計し、統合的に実行\n`;
      md += `3. **長期（3-6ヶ月）**: 成果をもとに施策ポートフォリオ全体を再評価し、リソース再配分\n\n`;
    }

    md += `### How：どう実行するか\n\n`;
    md += `| ステップ | アクション | 担当 | 期限目安 | 成果物 |\n|---|---|---|---|---|\n`;
    const actions = [
      { step: '①現状把握', action: `${top[0]?.title || '重点施策'}に関する定量データを収集`, role: '経営企画/データ', deadline: '1週間', output: '現状レポート' },
      { step: '②仮説設定', action: 'ボトルネック仮説を3つ設定し検証計画を策定', role: 'マネージャー', deadline: '2週間', output: '仮説検証シート' },
      { step: '③Quick Win', action: '最もROIの高い1施策を選定し即座に着手', role: '実行チーム', deadline: '3週間', output: '初期成果報告' },
      { step: '④検証と修正', action: '初期成果をレビューし、次の打ち手を決定', role: '全体', deadline: '1ヶ月', output: '修正ロードマップ' },
    ];
    actions.forEach(a => {
      md += `| ${a.step} | ${a.action} | ${a.role} | ${a.deadline} | ${a.output} |\n`;
    });

    // ── 3. リスクと判断基準 ──
    md += `\n## リスクと撤退基準\n\n`;
    md += `| リスク | 発生条件 | 対策 |\n|---|---|---|\n`;
    md += `| 施策の分散 | 3施策以上を同時着手 | 最重要1施策に集中、他は待機 |\n`;
    md += `| 効果測定不能 | KPI未定義のまま実行 | 着手前にベースライン計測を必須化 |\n`;
    md += `| 現場の抵抗 | 変更の意義が共有されていない | キックオフで「Why」を30秒で説明できる状態に |\n`;

    // ── 4. So What ──
    md += `\n## So What（結論）\n\n`;
    md += `この問いに対する回答は、**「${top[0]?.title || '最重要施策'}」を起点とした段階的な実行計画の策定**です。`;
    md += ` 全施策を同時に動かすのではなく、最もインパクトの大きい1施策で早期に成果を出し、その実績をレバレッジにして次の施策への投資判断を行うアプローチを推奨します。\n\n`;

    md += `> **注**: この分析はオフラインモードの構造化フレームワークによる回答です。設定画面でOpenAI APIキーを設定すると、AIによるさらに詳細な分析が利用できます。`;
    return md;
  };

  const deepDive = useCallback(async (q: string, apiKey = '') => {
    if (!results) return;
    setDiving(true);
    setError(null);
    const proMode = isProMode(apiKey);
    const currentResults = results;

    try {
      const ideaSummary = currentResults.ideas
        .map((idea, i) => `${i + 1}. ${idea.title}: ${idea.description}`)
        .join('\n');

      // 過去の深掘り履歴をコンテキストに含める
      const pastDives = (currentResults.deepDives || [])
        .map((dd, i) => `Q${i + 1}: ${dd.question}\nA: ${dd.answer.length > 300 ? dd.answer.slice(0, 300) + '…' : dd.answer}`)
        .join('\n\n');

      // keyIssue / funnelStage を注入
      const keyContext = [
        currentResults.keyIssue ? `【最重要イシュー】${currentResults.keyIssue}` : '',
        currentResults.funnelStage ? `【ファネルステージ】${currentResults.funnelStage}` : '',
      ].filter(Boolean).join('\n');

      const systemMsg: ChatMessage = {
        role: 'system',
        content: `あなたは戦略コンサルタントです。以下の事業状況と過去の分析を踏まえ、質問に詳細回答してください。

${keyContext}

【状況分析】
${currentResults.understanding}

【検討中の戦略アイデア】
${ideaSummary}
${pastDives ? `\n【過去の深掘り履歴】\n${pastDives}` : ''}

【前提条件】
- 現状批判ではなく「次の打ち手・改善機会」として建設的に回答する
- 担当者（営業・マーケ・経営企画）が実行できる具体策を含める
- 過去の深掘り結果と矛盾しない一貫した回答をする`,
      };

      const userMsg: ChatMessage = {
        role: 'user',
        content: `【質問】${q}\n\nMarkdown形式（見出し・テーブル・箇条書き活用）で詳細回答してください。`,
      };

      // 会話履歴を活用
      const recentHist = hist.slice(-MAX_HIST);
      const messages: ChatMessage[] = [systemMsg, ...recentHist, userMsg];

      const raw = proMode
        ? await callAIWithKey(apiKey.trim(), modelId, messages, CHAT_MAX_TOKENS)
        : await callAI(modelId, messages, CHAT_MAX_TOKENS);

      setResults(p => p ? ({ ...p, deepDives: [...(p.deepDives || []), { question: q, answer: raw }] }) : p);
      // 深掘りの会話も履歴に追加
      const newHist = [...recentHist, userMsg, { role: 'assistant' as const, content: raw }];
      setHist(newHist.slice(-MAX_HIST));
    } catch (e: unknown) {
      try {
        const fallback = buildFallbackDeepDive(q, currentResults);
        setResults(p => p ? ({ ...p, deepDives: [...(p.deepDives || []), { question: q, answer: fallback }] }) : p);
      } catch {
        setError(`深掘り失敗: ${e instanceof Error ? e.message : '不明なエラー'}`);
      }
    } finally {
      setDiving(false);
    }
  }, [results, hist, modelId]);

  return {
    modelId,
    setModelId,
    connStatus,
    setConnStatus,
    runConnTest,
    loading,
    results,
    setResults,
    error,
    reviewText,
    setReviewText,
    refining,
    diving,
    generate,
    refine,
    deepDive
  };
};
