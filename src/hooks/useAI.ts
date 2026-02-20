import { useState, useCallback } from 'react';
import { BrainstormForm, AIResults } from '../types';
import { callAI, testConn } from '../constants/models';
import { DEPTH } from '../constants/prompts';

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

  const buildPrompt = (pn: string, form: BrainstormForm, dep: number, sesLabel: string, tlStr: string, issueStr: string) => {
    const dc = DEPTH[dep];
    const webSearch = true; // Based on original prompt text
    const expert = dep >= 3
      ? `あなたはBCG/McKinsey/Accenture出身のシニアパートナー。同等のドメイン専門家への戦略アドバイス。一般論不要。業界固有の構造課題に踏み込み、定量根拠やフレームワーク(Porter, Value Chain, 3C, MECE, Issue Tree等)を援用。仮説駆動でアクションプラン・期待効果まで言及。${webSearch ? '必ずWeb検索で最新市場データ・競合動向を調査し、URLも提示。' : ''}`
      : `経験豊富な戦略コンサルタント。専門家同士の対話レベル。具体的で実行可能な提案。${webSearch ? 'Web検索で最新情報を調査し参照URLを含めてください。' : ''}`;
    return `${expert}\n\n【PJ】${pn}【プロダクト】${form.productService}【タイムライン】${tlStr}【目標】${form.teamGoals}${issueStr ? `【課題】${issueStr}` : ''}【セッション】${sesLabel}【深度】${dc.label}\n\nJSONのみ(コードブロック不要):\n{"understanding":"${dep >= 3 ? '5-7文の深い分析' : '2-3文'}","ideas":[${dc.ideas}個: {"title":"8語以内","description":"${dep >= 3 ? '4-6文。Why/What/How・定量示唆' : '2-3文'}","priority":"High/Medium/Low","effort":"Low/Medium/High","impact":"Low/Medium/High"}]}`;
  };

  const generate = useCallback(async (
    pn: string, 
    form: BrainstormForm, 
    dep: number, 
    sesLabel: string, 
    tlStr: string, 
    issueStr: string,
    onSuccess: (res: AIResults, prompt: string) => void
  ) => {
    if (!form.productService || !form.teamGoals) { 
      setError('必須項目（*）を入力'); 
      return; 
    }
    
    setLoading(true); 
    setError(null); 
    setResults(null); 
    setReviewText(''); 
    setHist([]);
    
    const prompt = buildPrompt(pn, form, dep, sesLabel, tlStr, issueStr);
    
    try {
      const msg = { role: 'user', content: prompt };
      const raw = await callAI(modelId, [msg]);
      const parsed = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      
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
    onSuccess: (res: AIResults, text: string) => void
  ) => {
    if (!reviewText.trim() || !results) return;
    setRefining(true); 
    setError(null);
    
    try {
      const msg = { role: 'user', content: `以下レビューに基づきブラッシュアップ。専門家レベルで改善。\n\n【レビュー】${reviewText}\n\nMarkdown形式で回答。` };
      const h2 = [...hist, msg]; 
      const raw = await callAI(modelId, h2);
      
      const newResults = { ...results, refinement: raw };
      setResults(newResults); 
      setHist([...h2, { role: 'assistant', content: raw }]);
      
      onSuccess(newResults, reviewText);
    } catch (e: any) { 
      setError(`改善失敗: ${e.message}`); 
    }
    setRefining(false);
  }, [reviewText, results, hist, modelId]);

  const deepDive = useCallback(async (q: string) => {
    if (!results) return; 
    setDiving(true); 
    setError(null);
    
    try {
      const msg = { role: 'user', content: `専門家として詳細回答。\n\n【質問】${q}\n\nMarkdown形式で回答（見出し・テーブル・リスト活用）。` };
      const h2 = [...hist, msg]; 
      const raw = await callAI(modelId, h2);
      
      setResults(p => p ? ({ ...p, deepDive: (p.deepDive ? p.deepDive + '\n\n---\n\n' : '') + `### ${q}\n\n${raw}` }) : p);
      setHist([...h2, { role: 'assistant', content: raw }]);
    } catch (e: any) { 
      setError(`深掘り失敗: ${e.message}`); 
    }
    setDiving(false);
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
