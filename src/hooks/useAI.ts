import { useState, useCallback } from 'react';
import { isHRContext, getHRDomainContext } from '../constants/domainContext';
import { parseAIJson, extractMarkdown } from '../utils/parseAIJson';
import { BrainstormForm, AIResults, ChatMessage, ConnStatus, Idea, LLMProvider } from '../types';
import {
  callAI,
  callAIWithKey,
  callAILocal,
  testConn,
  testConnLocal,
  DEFAULT_MODEL_ID,
  isProMode,
  isLocalProvider,
} from '../constants/models';
import type { APICallResult } from '../constants/models';
import { FREE_DEPTH, PRO_DEPTH } from '../constants/prompts';
import { MAX_HIST, CHAT_MAX_TOKENS } from '../constants/config';
import { selectModel, type TaskType, type ModelRouterInput } from '../utils/modelRouter';
import {
  addUsage,
  resetCycle,
  getSessionTotal,
  checkBudget,
  type BudgetWarning,
} from '../utils/costTracker';

/** 競合・データ情報のプロンプト文字列を生成 */
function buildCompetitiveIntelContext(form: BrainstormForm): string {
  const parts: string[] = [];
  if (form.serviceUrl?.trim()) {
    parts.push(`自社サービスURL: ${form.serviceUrl.trim()}`);
  }
  const comps = (form.competitors || []).filter((c) => c.name.trim() || c.url.trim());
  if (comps.length) {
    parts.push(
      '競合情報:\n' +
        comps
          .map((c, i) => {
            const items = [`${i + 1}. ${c.name || '(名称未入力)'}`];
            if (c.url) items.push(`URL: ${c.url}`);
            if (c.note) items.push(`特徴: ${c.note}`);
            return items.join(' / ');
          })
          .join('\n'),
    );
  }
  const kpis = (form.kpis || []).filter((k) => k.label.trim() && k.value.trim());
  if (kpis.length) {
    parts.push('主要KPI実績値:\n' + kpis.map((k) => `- ${k.label}: ${k.value}`).join('\n'));
  }
  return parts.length ? parts.join('\n\n') : '';
}

export const useAI = () => {
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [connStatus, setConnStatus] = useState<ConnStatus>({ status: 'idle', msg: '' });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [refining, setRefining] = useState(false);
  const [diving, setDiving] = useState(false);
  const [drillingDownId, setDrillingDownId] = useState<string | null>(null);
  const [hist, setHist] = useState<ChatMessage[]>([]);
  const [activeForm, setActiveForm] = useState<BrainstormForm | null>(null);
  const [costWarning, setCostWarning] = useState<BudgetWarning | null>(null);
  const [sessionCost, setSessionCost] = useState(0);
  const [lastUsedModel, setLastUsedModel] = useState<string | null>(null);
  const [freeRemaining, setFreeRemainingState] = useState<{
    remaining: number;
    limit: number;
    resetAt?: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('ai-brainstorm-rate-limit');
      if (saved) {
        const parsed = JSON.parse(saved);
        // resetAt を過ぎていたらリセット
        if (parsed.resetAt && Date.now() > parsed.resetAt) {
          return { remaining: parsed.limit || 50, limit: parsed.limit || 50 };
        }
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return { remaining: 50, limit: 50 };
  });
  const setFreeRemaining = useCallback(
    (rl: { remaining: number; limit: number; resetAt?: number }) => {
      setFreeRemainingState(rl);
      try {
        localStorage.setItem('ai-brainstorm-rate-limit', JSON.stringify(rl));
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const runConnTest = useCallback(
    async (apiKey = '', provider: LLMProvider = 'openai', endpoint = '', localModelId = '') => {
      setConnStatus({ status: 'testing', msg: '' });
      try {
        if (isLocalProvider(provider)) {
          await testConnLocal(endpoint, localModelId);
        } else {
          await testConn(modelId, apiKey);
        }
        setConnStatus({ status: 'ok', msg: 'OK' });
      } catch (e: unknown) {
        setConnStatus({ status: 'error', msg: e instanceof Error ? e.message : String(e) });
      }
    },
    [modelId],
  );

  /** API呼び出し + モデル自動選択 + コスト追跡 */
  const callWithTracking = async (
    taskType: TaskType,
    msgs: ChatMessage[],
    maxTokens: number,
    jsonMode: boolean,
    apiKey: string,
    routerInput: ModelRouterInput,
    provider: LLMProvider = 'openai',
    localEndpoint?: string,
    localModel?: string,
  ): Promise<{ content: string; resolvedModel: string }> => {
    const isLocal = isLocalProvider(provider);
    const pro = isLocal || isProMode(apiKey);
    const currentModel = isLocal ? localModel || modelId : modelId;
    const decision = selectModel(currentModel, routerInput, pro, isLocal);
    const resolvedId = decision.modelId;

    console.debug(`[modelRouter] ${taskType}: ${decision.reason} → ${resolvedId}`);

    const result: APICallResult = isLocal
      ? await callAILocal(localEndpoint || '', resolvedId, msgs, maxTokens, jsonMode)
      : pro
        ? await callAIWithKey(apiKey.trim(), resolvedId, msgs, maxTokens, jsonMode)
        : await callAI(resolvedId, msgs, maxTokens, jsonMode);

    // コスト追跡（ローカルはスキップ）
    if (!isLocal && result.usage) {
      const cost = addUsage({
        modelId: resolvedId,
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
      });
      setSessionCost(getSessionTotal());
      const warning = checkBudget(cost, pro);
      if (warning) setCostWarning(warning);
    }

    // Free mode: rate limit 残り回数更新
    if (result.rateLimit != null) {
      setFreeRemaining(result.rateLimit);
    }

    setLastUsedModel(resolvedId);
    return { content: result.content, resolvedModel: resolvedId };
  };

  const buildPrompt = (
    pn: string,
    form: BrainstormForm,
    dep: number,
    sesLabel: string,
    issueStr: string,
    proMode: boolean,
  ) => {
    const dc = proMode ? PRO_DEPTH[dep] : FREE_DEPTH[dep];

    // ── セッションタイプ別 役割定義（Prompt74jpから抽出・合成） ──
    const ROLE_DEFS: Record<string, { role: string; lens: string }> = {
      product: {
        role: 'あなたは、事業戦略の立案と実行計画の策定を専門とするビジネスコンサルタントです。事業計画ロードマップの構築・収益性改善・差別化戦略の設計に深い知見を持ち、ユーザーのサービス・事業の現状を多角的に分析して実行可能な改善策を提案します。',
        lens: '収益性・成長性・競争優位性・実行可能性。分析フレーム: バリューチェーン・3C分析',
      },
      marketing: {
        role: 'あなたは、ターゲット顧客の深層心理と購買行動に精通した一流のマーケティング戦略家です。DRM（ダイレクト・レスポンス・マーケティング）の「マーケット・メッセージ・メディア」3要素を統合分析し、費用対効果の高い集客設計と訴求メッセージの改善を支援します。',
        lens: 'ターゲットのメンタルモデル・メッセージ共鳴・チャネル最適化・ROI。分析フレーム: JTBD（顧客のジョブ）・顧客メンタルモデル',
      },
      growth: {
        role: 'あなたは、収益拡大とビジネスグロースを専門とするコンサルタントです。ユニットエコノミクス（LTV/CAC）の分析・顧客セグメント別成長ポテンシャルの評価・解約抑制と新規獲得の最適化を統合的に設計し、持続可能な成長の打ち手を提案します。',
        lens: 'ユニットエコノミクス・セグメント収益性・獲得コスト・継続率。分析フレーム: アンゾフ成長マトリクス・ランチェスター戦略',
      },
      innovation: {
        role: 'あなたは、新規事業立ち上げと仮説検証を専門とするビジネスコンサルタントです。「未知の領域に対して仮説行動を実践し価値あるアイデアを導き出す思考パートナー」として、情報の構造化と「分からないことのあぶり出し」を通じて鋭い仮説を生成・検証し、ユーザーが次に取るべき行動を明確にします。',
        lens: 'イシュー特定・仮説検証・PMF・経営承認可能性。分析フレーム: リーンスタートアップ・仮説検証サイクル',
      },
      cx: {
        role: 'あなたは、顧客行動と顧客心理に基づいて顧客体験を設計するCX（顧客体験）コンサルタントです。顧客の顕在・潜在ニーズを深く分析し、期待値とのギャップを特定して、満足度向上・継続率改善・信頼関係構築の具体策を提案します。',
        lens: '顧客ジャーニー・期待値ギャップ・担当者品質均一化・信頼構築。分析フレーム: ペインポイント分析（顕在/潜在）・カスタマージャーニー',
      },
      ops: {
        role: 'あなたは、営業活動と業務オペレーション改善を専門とするコンサルタントです。論点思考（イシュー思考）に基づき、商談化率・CRM活用・業務標準化・担当者間ナレッジ共有を通じて組織全体の営業生産性を高める施策を設計します。表面的な問題ではなく根本的なイシューから打ち手を設計することを最優先とします。',
        lens: '商談化率・CRM活用深度・ナレッジ標準化・業務効率。分析フレーム: イシューツリー・バリューチェーン',
      },
      dx: {
        role: 'あなたは、業種を問わずデジタルトランスフォーメーション（DX）と業務効率化を支援する経験豊富なDXコンサルタントです。現場の実態と変革抵抗を踏まえた段階的なデジタル化ロードマップを設計し、ツール選定・定着化・ROI最大化を統合的に支援します。',
        lens: '現場定着可能性・投資対効果・段階的移行リスク・変革管理。分析フレーム: チェンジマネジメント・段階的移行設計',
      },
      'design-system': {
        role: 'あなたは、ブランド一貫性とコミュニケーション品質の向上を専門とするブランドコンサルタントです。複数の媒体・接点を横断したメッセージ統一と、制作プロセスの効率化・外注品質管理を両立する施策を設計します。',
        lens: 'ブランド一貫性・制作コスト・承認効率・メッセージ統一。分析フレーム: ブランドアーキテクチャ・タッチポイント一貫性',
      },
      other: {
        role: 'あなたは、経営戦略の立案と意思決定支援を専門とする戦略コンサルタントです。定性的な顧客の声・組織の実態・市場データを統合分析し、最も重要な課題（イシュー）を特定して、論理（ロジック）と実行可能性の両面から具体的な行動計画を提案します。',
        lens: '戦略的優先順位・実行可能性・ステークホルダー合意・短期成果と中長期投資のバランス。分析フレーム: イシューツリー・3C分析・SWOT→クロスSWOT',
      },
    };

    const rd = ROLE_DEFS[form.sessionType] ?? ROLE_DEFS['other'];

    // ── HR ドメイン知識注入 ──
    const issueTexts = form.issues.filter((x) => x.text.trim()).map((x) => x.text);
    const hrDetected = isHRContext(form.productService, issueTexts);
    const hrContext = hrDetected ? getHRDomainContext(proMode) : '';

    // ── 競合・データ情報 ──
    const compIntel = buildCompetitiveIntelContext(form);
    const hasCompetitors = (form.competitors || []).some((c) => c.name.trim() || c.url.trim());
    const compInstructions = compIntel
      ? [
          'KPI実績値が提供されている場合、業界平均と比較してボトルネックを特定し、数値から逆算した改善提案を行う',
          ...(hasCompetitors
            ? [
                '【必須】understanding セクション内に「## 競合分析」サブセクションを設け、提供された各競合企業について以下4点を必ず記述すること: (1)事業概要（推定事業規模・主力サービス・ターゲット層） (2)強み（差別化要因・競争優位性） (3)弱み（構造的な限界・手薄な領域） (4)自社との差別化ポイント。知識の確実性が低い場合は「推定」と明記する',
                'ユーザー企業と競合の相対的なポジショニング差（規模・専門性・価格帯・ターゲットセグメント）を明確に対比する',
                '競合が構造的に苦手な領域を特定し、ideas にその領域での差別化施策を最低1つ含める',
                '「競合の顧客が不満を感じるとしたら何か」を推定し、その不満を解消するサービス設計を ideas に反映する',
              ]
            : []),
          '深掘り質問（suggestions）は、提供データから回答可能な質問、または次に取得すべきデータを示す質問を優先する',
        ].join('。')
      : '';

    // ── 共通前提条件 ──
    const commonConditions = [
      `【最重要】分析対象は「${form.productService}」のみ。ユーザーが入力したプロダクト名・サービス名を正確に使用し、異なる業界・サービスの話を混入させない。understanding・ideas ともに「${form.productService}」に直接関連する内容だけを出力する`,
      '現状の取り組みを否定せず、強みを活かしながら「次に何をすべきか」を建設的・前向きに提案する',
      'この業種で一般的に実施される標準施策（例: CRM導入、データ分析活用、定期MTG等）は企業が既に実施済みと想定する。ideas には「標準施策の先にある施策」または「標準施策が機能していない根本原因を解消する施策」を提案する。「○○を導入する」「○○を活用する」レベルの一般論は不可',
      '担当者（営業・マーケ・経営企画）が明日から実行できる具体的なアクションを含める',
      '各アイデアの description の末尾に、その施策のトレードオフを1文で付記する。形式: 「※トレードオフ: ○○は改善するが△△が短期的に悪化しうる」。トレードオフのない施策は存在しない',
      '数値は必ずレンジ（範囲）で示す。単一値の断言は禁止。形式例: 「CVR 0.3〜0.8pt改善が現実的な初期目標（3ヶ月運用後）」。「○倍」「+○○%」等の楽観的な断言は禁止。推定値には「業界目安」「条件次第で」等の留保を付記する',
      '各アイデアの description には抽象的な方針だけでなく「例: 」で始まる具体的な行動例を1つ以上含める。IT専門用語やカタカナ業界用語は避け、現場担当者が「明日の朝一でこれをやる」とイメージできる粒度で書く。「最適化」「差別化」「戦略的」等の抽象語を使った場合は必ず直後に「（例: ○○を△△に変える）」と補足する',
      '各アイデアには「なぜそれが有効か」のメカニズム（因果関係）を1文含める。「○○をすると→△△が変わり→結果として□□が改善する」の形式',
      '【多様性】毎回異なる切り口で分析すること。前回と同じ結論に至りそうな場合は、あえて別の分析フレームワーク・別の優先課題・別の業界事例を起点にする。keyIssue と understanding は入力課題の組み合わせによって異なる根本原因を特定する',
      compInstructions,
    ]
      .filter(Boolean)
      .join('。');

    // ── 深度別 出力指示 ──
    const depthMap: Record<number, { understanding: string; desc: string }> = {
      1: {
        understanding: '1-2文で核心を指摘',
        desc: '1文で具体的アクション + 「例: 」で実行イメージ1つ',
      },
      2: {
        understanding: '2-3文。3C（顧客・自社・競合）の視点で現状分析と改善機会を指摘',
        desc: '2-3文。①なぜ今やるか ②具体的に何をするか ③「例: 」で現場がイメージできる行動例1つ',
      },
      3: {
        understanding:
          '3-5文。イシューツリーで表面課題→直接原因→根本原因を構造化し、最優先の改善機会を特定',
        desc: '3-5文。①なぜ今 ②何をするか ③どうやるか ④「例: 明日○○に△△を実行」レベルの行動例 ⑤期待効果（定量示唆）',
      },
      4: {
        understanding:
          '5-7文。業界構造をフレームワーク（Porter Five Forces・3C・バリューチェーン等）で分析。競合比較と根本イシュー特定を含む',
        desc: '5-7文。①Why ②What ③How ④「例: 」で現場レベルの行動例2つ ⑤定量効果・優先順位根拠 ⑥注意点・リスク',
      },
    };
    const dmap = depthMap[dep] ?? depthMap[2];

    let roleDescription = rd.role;
    let deepExpert = '';

    if (proMode) {
      if (dep === 4) {
        // High-Class Consultant Mode
        roleDescription = `あなたは世界トップティアの戦略ファーム（McKinsey, BCG, Bain等）のパートナーレベルのコンサルタントです。\n${rd.role}\n\nあなたのミッションは、クライアント（ユーザー）の思考の枠を超え、非連続な成長をもたらす「筋の良い戦略」を提示することです。表面的な改善ではなく、構造的な課題（イシュー）を特定し、論理的かつ創造的な解決策を提示してください。`;

        deepExpert = `
【思考プロセス（この順序で厳密に分析せよ）】

Step 1 - イシュー再定義:
ユーザーが提示した課題をそのまま受け取るな。「解くと最もインパクトが大きい問い」を再定義せよ。
判断基準: (a)答えが出せる問いか (b)答えが出ると意思決定が変わるか (c)今の情報で取り組めるか。
例: 「スカウト返信率を上げたい」→「チャネル飽和市場で、スカウトに依存しない候補者獲得モデルを構築すべきか？」

Step 2 - 仮説構築:
イシューに対する仮説を1文で立てよ。形式: 「[根本原因] が [構造的メカニズム] を通じて [表面症状] を引き起こしている」
反証不能な仮説（「市場環境が厳しい」等）は禁止。

Step 3 - 構造化:
仮説をMECEに分解。各サブ仮説を「支持根拠」「反証根拠」「未検証」に分類。
未検証で最もインパクトの大きいものを suggestions に含めよ。

Step 4 - 打ち手設計:
ideas[0-1]は「イシューの根本原因に直接作用する本命施策」。残りは「補完施策」または「仮説が外れた場合のヘッジ」。
ideas のうち少なくとも1つは反直感（業界の常識に反するが論理的に正しい施策）を含める。
「やめるべきこと」「投資を減らすべきこと」も候補に含める。

【understandingの構造（SCRフレームワーク）】
S（Situation）: ユーザーが入力した事実のみ。推測を混ぜない。
C（Complication）: なぜ現状のままではダメかの因果メカニズム。一般的な課題ではなくこの企業固有の構造的課題。この業種で一般的に行われている標準施策を列挙し「それでも解決しない理由」を示す。
R（Resolution）: どの方向に舵を切るべきかの提言。ideas への橋渡し。

【ideas の記述構造】
各ideaのdescriptionは: (1)仮説と戦略ロジック (2)メカニズム（因果経路） (3)具体例「例: 明日から[誰が][何を]」 (4)期待効果（レンジ） (5)トレードオフ (6)検証方法「[期間]後に[指標]を確認。[基準]未達なら撤退」

【プロフェッショナリズム】
- 迎合せずプロとして最善の提言を行う。クライアントが聞きたいことではなく、聞くべきことを言う。
- 単なるToDoリストではなく「戦略的ストーリー」として一貫性のある提言にする。`;
      } else if (dep >= 3) {
        // Standard Deep Mode
        deepExpert = `
【思考プロセス】
1. イシュー再定義: ユーザーの課題をそのまま受け取らず「解くと最もインパクトが大きい問い」を特定せよ
2. 仮説構築: 根本原因の仮説を1文で立て、understanding でその根拠を示せ
3. 打ち手設計: 仮説の根本原因に直接作用する施策を ideas の先頭に配置。各ideaに因果メカニズムと検証方法を含めよ

【understanding構造】
S（事実）→ C（なぜダメか。標準施策で解決しない構造的理由）→ R（方向性の提言）の順で記述。
フレームワーク（3C・MECE・イシューツリー・バリューチェーン等）を必ず1つ以上適用すること。`;
      }
    }

    const hrJson = hrDetected
      ? `"keyIssue":"最重要イシューを1文で特定","funnelStage":"ボトルネックのファネルステージ名",`
      : '';

    if (proMode) {
      return `【あなたの役割】
${roleDescription}
${deepExpert}

【前提条件】
${commonConditions}。

【分析の視点】
${rd.lens}
${hrContext ? `\n${hrContext}` : ''}${compIntel ? `\n【競合・データ情報】\n${compIntel}\n` : ''}${hasCompetitors && dep >= 3 ? `\n【競合戦略分析の指示】\n- 競合の事業モデル・強み・弱みをあなたの知識範囲内で推定し understanding に含めよ\n- 競合が構造的に手薄な領域（ニッチ市場・未対応セグメント・サービスギャップ）を特定し ideas に反映せよ\n- 「競合と同じ土俵で戦う施策」より「競合が真似できない独自領域を作る施策」を優先せよ\n- ランチェスター戦略の観点: ユーザーが市場リーダーでなければ一点集中・局地戦を優先提案せよ\n` : ''}
【分析対象】
プロジェクト: ${pn} / プロダクト・サービス: ${form.productService}
チーム目標: ${form.teamGoals}${issueStr ? `\n現状課題: ${issueStr}` : ''}
セッション: ${sesLabel} / 分析深度: ${dc.label}

【出力形式】JSONのみ・コードブロック不要:
{"understanding":"${dmap.understanding}",${hrJson}"ideas":[${dc.ideas}個: {"title":"8語以内の行動起点タイトル","description":"${dmap.desc}","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High","feasibility":{"total":0-100総合,"resource":0-100リソース充足度,"techDifficulty":0-100技術的容易性(高=容易),"orgAcceptance":0-100組織受容性}}],"suggestions":["深掘り質問を5個。抽象的な方向性の質問ではなく、(1)次に取得すべき具体的データを指定する質問 (2)仮説の検証に必要な情報を問う質問 (3)意思決定に直結する判断軸を問う質問 を優先すること"]}`;
    } else {
      return `ビジネスコンサルとして建設的に分析。${rd.lens}の観点。${hrContext ? ` ${hrContext}` : ''}${compIntel ? ` [データ] ${compIntel.replace(/\n/g, ' ')}${hasCompetitors ? ' 【必須】各競合企業について事業概要・強み・弱みを understanding 内に含めること' : ''}` : ''}
対象: ${form.productService} / 目標: ${form.teamGoals}${issueStr ? ` / 課題: ${issueStr}` : ''}
JSONのみ回答:
{"understanding":"${dmap.understanding}",${hrJson}"ideas":[${dc.ideas}個: {"title":"6語以内","description":"${dmap.desc}","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High","feasibility":{"total":0-100,"resource":0-100,"techDifficulty":0-100,"orgAcceptance":0-100}}],"suggestions":["深掘り質問を4個"]}`;
    }
  };

  const generate = useCallback(
    async (
      pn: string,
      form: BrainstormForm,
      dep: number,
      sesLabel: string,
      issueStr: string,
      onSuccess: (res: AIResults, prompt: string) => void,
      apiKey = '',
      provider: LLMProvider = 'openai',
      localEndpoint?: string,
      localModel?: string,
    ) => {
      if (!form.productService || !form.teamGoals) {
        setError('必須項目（*）を入力');
        return;
      }

      const isLocal = isLocalProvider(provider);
      const proMode = isLocal || isProMode(apiKey);
      const depTable = proMode ? PRO_DEPTH : FREE_DEPTH;
      const dc = depTable[dep] || depTable[1];

      setLoading(true);
      setError(null);
      setResults(null);
      setReviewText('');
      setHist([]);
      setActiveForm(form);

      const prompt = buildPrompt(pn, form, dep, sesLabel, issueStr, proMode);
      resetCycle();

      try {
        const msg: ChatMessage = { role: 'user', content: prompt };
        const routerInput: ModelRouterInput = {
          taskType: 'generate',
          depth: dep,
          form,
          messages: [msg],
        };
        const { content: raw } = await callWithTracking(
          'generate',
          [msg],
          dc.maxTokens,
          true,
          apiKey,
          routerInput,
          provider,
          localEndpoint,
          localModel,
        );
        const parsed = parseAIJson(raw);

        setResults(parsed);
        setHist([msg, { role: 'assistant', content: raw }]);
        onSuccess(parsed, prompt);
      } catch (e: unknown) {
        console.error(e);
        setError(
          `生成に失敗しました: ${e instanceof Error ? e.message : String(e)}\nテンプレート結果を表示しています。設定パネルからAPIキーを登録するとAI分析が利用できます。`,
        );
        const issues =
          form.issues
            .filter((x) => x.text.trim())
            .map((x) => x.text)
            .join('、') || '未指定';
        setResults({
          understanding: `「${form.productService}」の${sesLabel}セッション（目標: ${form.teamGoals}）。現状課題「${issues}」を踏まえた戦略提案。APIとの通信に失敗したためフォールバック結果を表示しています。`,
          ideas: [
            {
              title: '現状課題の構造化分析',
              description: `「${issues}」の根本原因を特定し、影響度×緊急度マトリクスで優先順位を整理。`,
              priority: 'High',
              effort: 'Low',
              impact: 'High',
            },
            {
              title: 'クイックウィンの特定と実行',
              description: `${form.teamGoals}達成に向け、2週間以内に成果が出る施策を3つ選定し即座に着手。`,
              priority: 'High',
              effort: 'Low',
              impact: 'High',
            },
            {
              title: 'KPIツリーの設計',
              description: `最終目標を分解し、先行指標と遅行指標を整理。週次レビューサイクルを確立。`,
              priority: 'High',
              effort: 'Medium',
              impact: 'High',
            },
            {
              title: 'ステークホルダーマップ整備',
              description: '意思決定に関わる人物を整理し、合意形成のボトルネックを特定・解消。',
              priority: 'Medium',
              effort: 'Low',
              impact: 'Medium',
            },
            {
              title: 'ベンチマーク分析',
              description: `同業・異業種の成功事例を調査し${form.productService}に適用可能な施策を抽出。`,
              priority: 'Medium',
              effort: 'Medium',
              impact: 'High',
            },
            {
              title: '実行ロードマップ策定',
              description:
                '30-60-90日プランを策定し、各フェーズのマイルストーンと判断基準を明確化。',
              priority: 'Medium',
              effort: 'Low',
              impact: 'Medium',
            },
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
    },
    [modelId],
  );

  const refine = useCallback(
    async (
      onSuccess: (res: AIResults, text: string) => void,
      apiKey = '',
      provider: LLMProvider = 'openai',
      localEndpoint?: string,
      localModel?: string,
    ) => {
      if (!reviewText.trim() || !results) return;
      setRefining(true);
      setError(null);

      try {
        // keyIssue / funnelStage を注入
        const keyContext = [
          results.keyIssue ? `【最重要イシュー】${results.keyIssue}` : '',
          results.funnelStage ? `【ファネルステージ】${results.funnelStage}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        const ideaSummary = results.ideas
          .map((idea, i) => `${i + 1}. ${idea.title}: ${idea.description}`)
          .join('\n');

        // 過去のブラッシュアップ履歴
        const pastRefinements = (results.refinements || [])
          .map(
            (r, i) =>
              `Review${i + 1}: ${r.review}\nResult: ${r.answer.length > 300 ? r.answer.slice(0, 300) + '…' : r.answer}`,
          )
          .join('\n\n');

        const ciCtx = activeForm ? buildCompetitiveIntelContext(activeForm) : '';
        const systemMsg: ChatMessage = {
          role: 'system',
          content: `あなたは戦略コンサルタントです。以下の事業状況と過去の分析を踏まえ、レビュー・フィードバックに基づいて戦略提案をブラッシュアップしてください。

${keyContext}

【状況分析】
${results.understanding}

【現在の戦略アイデア】
${ideaSummary}
${pastRefinements ? `\n【過去のブラッシュアップ履歴】\n${pastRefinements}` : ''}${ciCtx ? `\n【競合・データ情報】\n${ciCtx}` : ''}

【前提条件】
- 【最重要】分析対象は「${activeForm?.productService || ''}」のみ。ユーザーが入力したプロダクト名を正確に使用し、異なる業界・サービスの話を混入させないこと
- 一般論ではなく、ユーザーの具体的な状況・数値・競合情報に基づいた改善提案を行う。この業種で誰でも思いつく標準施策の羅列は不可
- 現状を批判せず、強みを活かした建設的な改善提案に絞る
- 過去のブラッシュアップ結果と矛盾しない一貫した改善を行う
- 「最適化する」「改善する」のような抽象表現には必ず「例えば〜」で具体的な行動ステップを付加する
- 数値は必ずレンジ（範囲）で示す。「○倍」「+○○%」等の楽観的な断言は禁止
- 読者は戦略コンサルタントではなく現場営業担当。インターン生でも実行できるレベルまで噛み砕く${ciCtx ? '\n- KPI実績値は「ファクト」として扱い、業界平均と比較してボトルネックを特定する' : ''}`,
        };

        const msg: ChatMessage = {
          role: 'user',
          content: `【レビュー内容】${reviewText}\n\nMarkdown形式（見出し・箇条書き活用）で詳細に回答した後、文末に必ず以下の形式のJSONを付加してください。JSONのみコードブロックで囲んでください。
\`\`\`json
{"understanding":"改善後の状況分析","ideas":[{"title":"タイトル","description":"内容","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High"}]}
\`\`\``,
        };
        const recentHist = hist.slice(-MAX_HIST);
        const h2 = [systemMsg, ...recentHist, msg];
        const routerInput: ModelRouterInput = { taskType: 'refine', depth: 2, messages: h2 };
        const { content: raw } = await callWithTracking(
          'refine',
          h2,
          CHAT_MAX_TOKENS,
          false,
          apiKey,
          routerInput,
          provider,
          localEndpoint,
          localModel,
        );

        // JSONを抽出・パース（parseAIJsonで安全に処理）
        let structRes: AIResults | undefined;
        try {
          structRes = parseAIJson(raw);
        } catch {
          // Markdown 混在の回答ではJSON抽出できない場合がある（正常）
        }

        const cleanAnswer = extractMarkdown(raw);
        const entry = { review: reviewText, answer: cleanAnswer, results: structRes };
        const newResults = {
          ...results,
          refinement: cleanAnswer,
          refinements: [...(results.refinements || []), entry],
        };
        setResults(newResults);
        const newHist = [...h2, { role: 'assistant' as const, content: raw }];
        setHist(newHist.slice(-MAX_HIST));
        setReviewText('');

        onSuccess(newResults, reviewText);
      } catch (e: unknown) {
        setError(
          `ブラッシュアップに失敗しました: ${e instanceof Error ? e.message : String(e)}\nレビュー内容を短くするか、しばらく待ってから再度お試しください。`,
        );
      } finally {
        setRefining(false);
      }
    },
    [reviewText, results, hist, modelId, activeForm],
  );

  /** APIが使えない場合の戦略的フォールバック深掘り回答を生成 */
  const buildFallbackDeepDive = (q: string, r: AIResults): string => {
    const qWords = q
      .replace(/[？?は。、の]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);
    const scored = r.ideas.map((idea) => {
      const text = `${idea.title} ${idea.description}`;
      const hits = qWords.filter((w) => text.includes(w)).length;
      return { idea, hits };
    });
    scored.sort((a, b) => b.hits - a.hits);
    const top = scored.slice(0, 3).map((s) => s.idea);
    const highPri = r.ideas.filter((i) => i.priority === 'High');
    const highImpact = r.ideas.filter((i) => i.impact === 'High');

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
      {
        step: '①現状把握',
        action: `${top[0]?.title || '重点施策'}に関する定量データを収集`,
        role: '経営企画/データ',
        deadline: '1週間',
        output: '現状レポート',
      },
      {
        step: '②仮説設定',
        action: 'ボトルネック仮説を3つ設定し検証計画を策定',
        role: 'マネージャー',
        deadline: '2週間',
        output: '仮説検証シート',
      },
      {
        step: '③Quick Win',
        action: '最もROIの高い1施策を選定し即座に着手',
        role: '実行チーム',
        deadline: '3週間',
        output: '初期成果報告',
      },
      {
        step: '④検証と修正',
        action: '初期成果をレビューし、次の打ち手を決定',
        role: '全体',
        deadline: '1ヶ月',
        output: '修正ロードマップ',
      },
    ];
    actions.forEach((a) => {
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

  const deepDive = useCallback(
    async (
      q: string,
      apiKey = '',
      provider: LLMProvider = 'openai',
      localEndpoint?: string,
      localModel?: string,
    ) => {
      if (!results) return;
      setDiving(true);
      setError(null);
      const currentResults = results;

      try {
        const ideaSummary = currentResults.ideas
          .map((idea, i) => `${i + 1}. ${idea.title}: ${idea.description}`)
          .join('\n');

        // 過去の深掘り履歴をコンテキストに含める
        const pastDives = (currentResults.deepDives || [])
          .map(
            (dd, i) =>
              `Q${i + 1}: ${dd.question}\nA: ${dd.answer.length > 300 ? dd.answer.slice(0, 300) + '…' : dd.answer}`,
          )
          .join('\n\n');

        // keyIssue / funnelStage を注入
        const keyContext = [
          currentResults.keyIssue ? `【最重要イシュー】${currentResults.keyIssue}` : '',
          currentResults.funnelStage ? `【ファネルステージ】${currentResults.funnelStage}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        const ddCiCtx = activeForm ? buildCompetitiveIntelContext(activeForm) : '';
        const systemMsg: ChatMessage = {
          role: 'system',
          content: `あなたは戦略コンサルタントです。以下の事業状況と過去の分析を踏まえ、質問に詳細回答してください。

${keyContext}

【状況分析】
${currentResults.understanding}

【検討中の戦略アイデア】
${ideaSummary}
${pastDives ? `\n【過去の深掘り履歴】\n${pastDives}` : ''}${ddCiCtx ? `\n【競合・データ情報】\n${ddCiCtx}` : ''}

【前提条件】
- 【最重要】分析対象は「${activeForm?.productService || ''}」のみ。ユーザーが入力したプロダクト名を正確に使用し、異なる業界・サービスの話を混入させないこと
- 一般論ではなく、ユーザーの具体的な状況・数値・競合情報に基づいた分析を行う。この業種で誰でも思いつく標準施策の羅列は不可
- 「○○すべき」だけでなく「なぜそれが有効か（メカニズム）」と「よくある失敗パターンと回避策」を含める
- 現状批判ではなく「次の打ち手・改善機会」として建設的に回答する
- 過去の深掘り結果と矛盾しない一貫した回答をする
- 「最適化する」「改善する」のような抽象表現には必ず「例えば〜」で具体的な行動ステップを付加する
- 数値は必ずレンジ（範囲）で示す。「○倍」「+○○%」等の楽観的な断言は禁止
- 読者は戦略コンサルタントではなく現場営業担当。インターン生でも実行できるレベルまで噛み砕く${ddCiCtx ? '\n- KPI実績値を「ファクト」として扱い、改善提案に具体的数値を活用する' : ''}`,
        };

        const userMsg: ChatMessage = {
          role: 'user',
          content: `【質問】${q}\n\nMarkdown形式（見出し・テーブル・箇条書き活用）で詳細回答してください。JSONやコードブロックは使わず、プレーンなMarkdownテキストで回答してください。`,
        };

        // 会話履歴を活用
        const recentHist = hist.slice(-MAX_HIST);
        const messages: ChatMessage[] = [systemMsg, ...recentHist, userMsg];
        const routerInput: ModelRouterInput = { taskType: 'deepDive', depth: 2, messages };
        const { content: raw } = await callWithTracking(
          'deepDive',
          messages,
          CHAT_MAX_TOKENS,
          false,
          apiKey,
          routerInput,
          provider,
          localEndpoint,
          localModel,
        );

        const cleanAnswer = extractMarkdown(raw);
        setResults((p) =>
          p
            ? { ...p, deepDives: [...(p.deepDives || []), { question: q, answer: cleanAnswer }] }
            : p,
        );
        // 深掘りの会話も履歴に追加
        const newHist = [...recentHist, userMsg, { role: 'assistant' as const, content: raw }];
        setHist(newHist.slice(-MAX_HIST));
      } catch (e: unknown) {
        try {
          const fallback = buildFallbackDeepDive(q, currentResults);
          setResults((p) =>
            p
              ? { ...p, deepDives: [...(p.deepDives || []), { question: q, answer: fallback }] }
              : p,
          );
        } catch {
          setError(
            `深掘りに失敗しました: ${e instanceof Error ? e.message : '不明なエラー'}\n質問を短くするか、しばらく待ってから再度お試しください。`,
          );
        }
      } finally {
        setDiving(false);
      }
    },
    [results, hist, modelId, activeForm],
  );

  const drillDownIdea = useCallback(
    async (
      idea: Idea,
      ideaIndex: number,
      apiKey = '',
      provider: LLMProvider = 'openai',
      localEndpoint?: string,
      localModel?: string,
    ) => {
      if (!results) return;
      const drillId = `${idea.title}-${ideaIndex}`;
      setDrillingDownId(drillId);
      setError(null);

      try {
        const systemMsg: ChatMessage = {
          role: 'system',
          content: `あなたは戦略コンサルタントです。以下の「戦略アイデア」をさらに深掘りし、具体的で実行可能な「2〜3個のサブアイデア（子要素）」に分解してください。
各サブアイデアは、親の目的を達成するための具体的なステップ、あるいは異なるアプローチの切り口として提示してください。
description には必ず「例: 」で始まる具体的な行動例を含め、現場担当者がすぐ実行をイメージできるレベルで書いてください。
【最重要】分析対象は「${activeForm?.productService || ''}」のみ。ユーザーが入力したプロダクト名を正確に使用し、異なる業界・サービスの話を混入させないこと。`,
        };

        const userMsg: ChatMessage = {
          role: 'user',
          content: `【親アイデア】
タイトル: ${idea.title}
内容: ${idea.description}

【出力形式】JSONのみ（コードブロック不要）。以下の配列形式で返してください:
[{"title":"具体的なサブアイデア名","description":"具体的アクションと期待効果","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High"}]`,
        };

        const drillMsgs = [systemMsg, userMsg];
        const routerInput: ModelRouterInput = {
          taskType: 'drillDown',
          depth: 2,
          messages: drillMsgs,
        };
        const { content: raw } = await callWithTracking(
          'drillDown',
          drillMsgs,
          CHAT_MAX_TOKENS,
          false,
          apiKey,
          routerInput,
          provider,
          localEndpoint,
          localModel,
        );

        // JSON配列を抽出・パース
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('AIの回答を処理できませんでした。もう一度お試しください。');
        const subIdeas = JSON.parse(jsonMatch[0]) as Idea[];

        setResults((p) => {
          if (!p) return p;
          const nextIdeas = [...p.ideas];
          nextIdeas[ideaIndex] = { ...nextIdeas[ideaIndex], subIdeas };
          return { ...p, ideas: nextIdeas };
        });
      } catch (e: unknown) {
        setError(`カードの深掘りに失敗しました: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setDrillingDownId(null);
      }
    },
    [results, modelId, activeForm],
  );

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
    drillingDownId,
    generate,
    refine,
    deepDive,
    drillDownIdea,
    costWarning,
    setCostWarning,
    sessionCost,
    lastUsedModel,
    freeRemaining,
  };
};
