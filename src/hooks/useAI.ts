import { useState, useCallback } from 'react';

/** JSONが途中で切れていても修復してパースする */
function parseAIJson(raw: string): any {
  // コードフェンス除去、先頭の { を探す
  let text = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in response');
  text = text.slice(start);

  // まず素直にパース
  try {
    return JSON.parse(text);
  } catch {}

  // 末尾の } まで削ってみる
  try {
    const end = text.lastIndexOf('}');
    if (end > 0) return JSON.parse(text.slice(0, end + 1));
  } catch {}

  // 途中切れ修復: depth=1 に戻った最後の位置まで切り詰め、]} で閉じる
  let depth = 0;
  let lastDepth1Close = -1;
  let inStr = false;
  let esc = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 1) lastDepth1Close = i;
    }
  }

  if (lastDepth1Close > 0) {
    text = text.slice(0, lastDepth1Close + 1) + ']}';
  }

  return JSON.parse(text);
}
import { BrainstormForm, AIResults } from '../types';
import { callAI, callAIWithKey, testConn } from '../constants/models';
import { FREE_DEPTH, PRO_DEPTH } from '../constants/prompts';

export const useAI = () => {
  const [modelId, setModelId] = useState('gpt-5-nano');
  const [connStatus, setConnStatus] = useState<{ status: 'idle' | 'testing' | 'ok' | 'error', msg: string }>({ status: 'idle', msg: '' });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [refining, setRefining] = useState(false);
  const [diving, setDiving] = useState(false);
  const [hist, setHist] = useState<any[]>([]);

  const runConnTest = useCallback(async () => {
    setConnStatus({ status: 'testing', msg: '' });
    try {
      const model = await testConn(modelId);
      setConnStatus({ status: 'ok', msg: `OK: ${model}` });
    } catch (e: any) {
      setConnStatus({ status: 'error', msg: e.message });
    }
  }, [modelId]);

  const buildPrompt = (pn: string, form: BrainstormForm, dep: number, sesLabel: string, tlStr: string, issueStr: string, proMode: boolean) => {
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

    // ── 共通前提条件 ──
    const commonConditions = [
      '現状の取り組みを否定せず、強みを活かしながら「次に何をすべきか」を建設的・前向きに提案する',
      '課題の原因を指摘する場合も批判的な表現を避け、改善の機会として表現する',
      '担当者（営業・マーケ・経営企画）が明日から実行できる具体的なアクションを含める',
      'ビジネス成果（売上・利益・顧客満足・効率改善）を軸に効果を示す',
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

    if (proMode) {
      return `【あなたの役割】
${roleDescription}
${deepExpert}

【前提条件】
${commonConditions}。

【分析の視点】
${rd.lens}

【分析対象】
プロジェクト: ${pn} / プロダクト・サービス: ${form.productService}
タイムライン: ${tlStr} / チーム目標: ${form.teamGoals}${issueStr ? `\n現状課題: ${issueStr}` : ''}
セッション: ${sesLabel} / 分析深度: ${dc.label}

【出力形式】JSONのみ・コードブロック不要:
{"understanding":"${dmap.understanding}","ideas":[${dc.ideas}個: {"title":"8語以内の行動起点タイトル","description":"${dmap.desc}","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High"}],"suggestions":["入力内容のプロダクト・課題・目標に直結する深掘り質問を5個。セッションタイプに縛られず実務担当者が次に考えるべき問いを設定すること"]}`;
    } else {
      return `【あなたの役割】
${rd.role}

【前提条件】
${commonConditions}。

【分析対象】
プロダクト・サービス: ${form.productService} / 目標: ${form.teamGoals}${issueStr ? ` / 課題: ${issueStr}` : ''}
セッション: ${sesLabel}

【出力形式】JSONのみ・コードブロック不要:
{"understanding":"${dmap.understanding}","ideas":[${dc.ideas}個: {"title":"6語以内","description":"${dmap.desc}","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High"}],"suggestions":["入力内容に直結する深掘り質問を4個"]}`;
    }
  };

  const generate = useCallback(async (
    pn: string,
    form: BrainstormForm,
    dep: number,
    sesLabel: string,
    tlStr: string,
    issueStr: string,
    onSuccess: (res: AIResults, prompt: string) => void,
    apiKey = '',
  ) => {
    if (!form.productService || !form.teamGoals) {
      setError('必須項目（*）を入力');
      return;
    }

    const proMode = apiKey.trim().startsWith('sk-');
    const depTable = proMode ? PRO_DEPTH : FREE_DEPTH;
    const dc = depTable[dep] || depTable[1];

    setLoading(true);
    setError(null);
    setResults(null);
    setReviewText('');
    setHist([]);

    const prompt = buildPrompt(pn, form, dep, sesLabel, tlStr, issueStr, proMode);

    try {
      const msg = { role: 'user', content: prompt };
      const raw = proMode
        ? await callAIWithKey(apiKey.trim(), modelId, [msg], dc.maxTokens)
        : await callAI(modelId, [msg], dc.maxTokens);
      const parsed = parseAIJson(raw);
      
      setResults(parsed);
      setHist([msg, { role: 'assistant', content: raw }]);
      onSuccess(parsed, prompt);
    } catch (e: any) {
      console.error(e);
      setError(`生成失敗: ${e.message}`);
      // Fallback for demo purposes
      setResults({ 
        understanding: `PJ「${pn}」の${sesLabel}セッション。目標「${form.teamGoals}」に向けた戦略提案。`, 
        ideas: [
          { title: 'バリューチェーン再構築', description: '低付加価値プロセスを特定し自動化を推進。', priority: 'High', effort: 'High', impact: 'High' }, 
          { title: 'データドリブン意思決定', description: 'KPIツリーとダッシュボードで仮説検証サイクルを週次に短縮。', priority: 'High', effort: 'Medium', impact: 'High' }, 
          { title: 'クロスファンクショナルスクワッド', description: '機能横断チーム編成でE2E提供速度を向上。', priority: 'Medium', effort: 'Medium', impact: 'High' }, 
          { title: 'JTBD分析UXリデザイン', description: 'ジョブ理論で顧客ニーズを特定しコア体験を再設計。', priority: 'Medium', effort: 'High', impact: 'High' }, 
          { title: 'アジャイルPoC標準化', description: '2週スプリント検証で投資判断を高速化。', priority: 'Medium', effort: 'Low', impact: 'Medium' }, 
          { title: 'エコシステムアライアンス', description: '補完ケイパビリティ持つパートナー協業で制約を突破。', priority: 'Low', effort: 'Medium', impact: 'Medium' }
        ] 
      });
    }
    setLoading(false);
  }, [modelId]);

  const refine = useCallback(async (
    onSuccess: (res: AIResults, text: string) => void,
    apiKey = '',
  ) => {
    if (!reviewText.trim() || !results) return;
    setRefining(true);
    setError(null);
    const proMode = apiKey.trim().startsWith('sk-');

    try {
      const msg = { role: 'user', content: `あなたは戦略コンサルタントです。以下のレビュー・フィードバックに基づき、戦略提案をブラッシュアップしてください。\n\n【前提条件】現状を批判せず、強みを活かした建設的な改善提案に絞る。担当者が実行できる具体案を出す。\n\n【レビュー内容】${reviewText}\n\nMarkdown形式（見出し・箇条書き活用）で回答してください。` };
      const h2 = [...hist, msg];
      const raw = proMode
        ? await callAIWithKey(apiKey.trim(), modelId, h2, 4096)
        : await callAI(modelId, h2, 2000);
      
      const newResults = { ...results, refinement: raw };
      setResults(newResults); 
      setHist([...h2, { role: 'assistant', content: raw }]);
      
      onSuccess(newResults, reviewText);
    } catch (e: any) { 
      setError(`改善失敗: ${e.message}`); 
    }
    setRefining(false);
  }, [reviewText, results, hist, modelId]);

  const deepDive = useCallback(async (q: string, apiKey = '') => {
    if (!results) return;
    setDiving(true);
    setError(null);
    const proMode = apiKey.trim().startsWith('sk-');

    try {
      // hist全体を送るとトークン超過するため、状況分析+アイデアサマリーの軽量コンテキストのみ使用
      const ideaSummary = results.ideas
        .map((idea, i) => `${i + 1}. ${idea.title}: ${idea.description}`)
        .join('\n');
      const context = `【状況分析】\n${results.understanding}\n\n【検討中の戦略アイデア】\n${ideaSummary}`;
      const msg = {
        role: 'user',
        content: `あなたは戦略コンサルタントです。以下の事業状況を踏まえ、質問に詳細回答してください。\n\n【事業状況】\n${context}\n\n【前提条件】現状批判ではなく「次の打ち手・改善機会」として建設的に回答すること。担当者（営業・マーケ・経営企画）が実行できる具体策を含めること。\n\n【質問】${q}\n\nMarkdown形式（見出し・テーブル・箇条書き活用）で詳細回答してください。`,
      };
      const raw = proMode
        ? await callAIWithKey(apiKey.trim(), modelId, [msg], 4096)
        : await callAI(modelId, [msg], 2000);

      setResults(p => p ? ({ ...p, deepDive: (p.deepDive ? p.deepDive + '\n\n---\n\n' : '') + `### ${q}\n\n${raw}` }) : p);
    } catch (e: any) {
      setError(`深掘り失敗: ${e.message}`);
    }
    setDiving(false);
  }, [results, modelId]);

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
