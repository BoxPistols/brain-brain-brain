import React, { useState, useRef, useEffect } from 'react';
import {
  Target,
  RefreshCw,
  Search,
  MessageSquarePlus,
  ChevronRight,
  AlertTriangle,
  Eye,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  Presentation,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { AIResults, Idea } from '../../types';
import { T } from '../../constants/theme';
import { ResultCard } from '../results/ResultCard';
import { RichText } from '../results/RichText';

type DlFormat = 'md' | 'txt' | 'csv' | 'pdf' | 'pdfDl' | 'pptx';

interface ResultsPaneProps {
  loading: boolean;
  results: AIResults | null;
  error: string | null;
  isSeedData: boolean;
  displaySuggestions: string[];
  diving: boolean;
  diveProgress: number;
  onDeepDive: (q: string) => void;
  onClearDeepDives: () => void;
  reviewText: string;
  onReviewTextChange: (text: string) => void;
  refining: boolean;
  refineProgress: number;
  onRefine: () => void;
  onShowPreview?: () => void;
  onDownload?: (format: DlFormat) => void;
  onDrillDown?: (idea: Idea, index: number) => void;
  drillingDownId?: string | null;
}

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className={`${T.card} p-5 space-y-3`}>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`${T.card} p-4 space-y-2`}>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <Loader2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
    <p className={`text-sm ${T.t3}`}>左のフォームに情報を入力して「戦略アイデア生成」を実行</p>
  </div>
);

const AnalysisBlock: React.FC<{
  results: AIResults;
  onDrillDown?: (idea: Idea, index: number) => void;
  drillingDownId?: string | null;
  index?: number;
}> = ({ results, onDrillDown, drillingDownId, index = 0 }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className={`${T.card} p-5`} data-tour="result-understanding">
      {results.keyIssue && (
        <div className="mb-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                  最重要イシュー
                </span>
                {results.funnelStage && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 dark:bg-brand-light/30 text-brand-dark dark:text-white border border-brand-light/30 dark:border-brand-light/40">
                    {results.funnelStage}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-rose-800 dark:text-rose-200 mt-1 leading-relaxed">
                {results.keyIssue}
              </p>
            </div>
          </div>
        </div>
      )}
      <RichText text={results.understanding} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" data-tour="result-cards">
      {results.ideas.map((idea, i) => (
        <ResultCard
          key={`${idea.title}-${i}-${index}`}
          idea={idea}
          index={i}
          onDrillDown={onDrillDown}
          drillingDownId={drillingDownId}
        />
      ))}
    </div>
  </div>
);

export const ResultsPane: React.FC<ResultsPaneProps> = ({
  loading,
  results,
  error,
  isSeedData,
  displaySuggestions,
  diving,
  diveProgress,
  onDeepDive,
  onClearDeepDives,
  reviewText,
  onReviewTextChange,
  refining,
  refineProgress,
  onRefine,
  onShowPreview,
  onDownload,
  onDrillDown,
  drillingDownId,
}) => {
  const [showDlMenu, setShowDlMenu] = useState(false);
  const dlRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDlMenu) return;
    const close = (e: MouseEvent) => {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) setShowDlMenu(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showDlMenu]);

  // スクロール追従（新しい結果が出た時）
  useEffect(() => {
    if (refining || diving) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [refining, diving, results?.refinements?.length, results?.deepDives?.length]);

  if (loading && !results) return <LoadingSkeleton />;
  if (!results) return <EmptyState />;

  const dlOptions: { fmt: DlFormat; label: string; icon: React.ReactNode }[] = [
    {
      fmt: 'md',
      label: 'Markdown (.md)',
      icon: <FileText className="w-3.5 h-3.5 text-brand" />,
    },
    {
      fmt: 'txt',
      label: 'テキスト (.txt)',
      icon: <FileText className="w-3.5 h-3.5 text-slate-500" />,
    },
    {
      fmt: 'csv',
      label: 'CSV (.csv)',
      icon: <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" />,
    },
    { fmt: 'pdfDl', label: 'PDF (.pdf)', icon: <Download className="w-3.5 h-3.5 text-rose-500" /> },
    {
      fmt: 'pptx',
      label: 'PowerPoint (.pptx)',
      icon: <Presentation className="w-3.5 h-3.5 text-orange-500" />,
    },
    {
      fmt: 'pdf',
      label: '印刷プレビュー',
      icon: <Printer className="w-3.5 h-3.5 text-slate-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header / Tools */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md py-2 -mx-2 px-2 rounded-lg border-b border-slate-200 dark:border-slate-800">
        <h3 className={`text-xs font-semibold ${T.accentTxt} flex items-center gap-1.5`}>
          <Target className="w-3.5 h-3.5" />
          AI 戦略分析
          {isSeedData && (
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40">
              Demo
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1">
          {onShowPreview && (
            <button
              onClick={onShowPreview}
              className={`p-1.5 rounded-lg ${T.btnGhost}`}
              title="レポートプレビュー"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {onDownload && (
            <div ref={dlRef} className="relative" data-tour="result-download">
              <button
                onClick={() => setShowDlMenu((s) => !s)}
                className={`flex items-center gap-0.5 p-1.5 rounded-lg ${T.btnGhost}`}
              >
                <Download className="w-3.5 h-3.5" />
                <ChevronDown className="w-2.5 h-2.5 opacity-50" />
              </button>
              {showDlMenu && (
                <div
                  className={`absolute right-0 top-full mt-1 z-30 w-44 rounded-lg border shadow-lg ${T.card} py-1`}
                >
                  {dlOptions.map((o) => (
                    <button
                      key={o.fmt}
                      onClick={() => {
                        onDownload(o.fmt);
                        setShowDlMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${T.t2} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                    >
                      {o.icon}
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Initial Results Block */}
      <section className="space-y-4">
        <AnalysisBlock
          results={results}
          onDrillDown={onDrillDown}
          drillingDownId={drillingDownId}
          index={0}
        />
      </section>

      {/* History / Refinements */}
      {(results.refinements?.length ?? 0) > 0 && (
        <div className="space-y-8 border-t border-slate-200 dark:border-slate-800 pt-8">
          {results.refinements!.map((r, i) => (
            <section key={i} className="space-y-4 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800/40 z-10">
                BRUSH-UP #{i + 1}
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-800/20 rounded-xl p-4">
                <p className={`text-[11px] ${T.t3} mb-2 italic flex items-center gap-1.5`}>
                  <MessageSquarePlus className="w-3 h-3" /> レビュー: {r.review}
                </p>
                {r.results ? (
                  <AnalysisBlock
                    results={r.results}
                    onDrillDown={onDrillDown}
                    drillingDownId={drillingDownId}
                    index={i + 1}
                  />
                ) : (
                  <RichText text={r.answer} />
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Deep dive output (remains at the bottom or contextual) */}
      {results.deepDives && results.deepDives.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-semibold ${T.accentTxt} flex items-center gap-1`}>
              <Search className="w-3.5 h-3.5" />
              追加深掘り（{results.deepDives.length}件）
            </h4>
            <button
              onClick={onClearDeepDives}
              className={`text-xs ${T.t3} hover:text-red-500 transition`}
            >
              クリア
            </button>
          </div>
          {results.deepDives.map((dd, i) => (
            <div
              key={i}
              className={`${T.card} p-5 border-l-2 border-l-brand-light dark:border-l-brand`}
            >
              <p className={`text-xs font-semibold ${T.t1} mb-2`}>{dd.question}</p>
              <RichText text={dd.answer} />
            </div>
          ))}
        </div>
      )}

      {/* Suggestions & Input area */}
      <div className="pt-6 space-y-4">
        {/* Deep-dive suggestions */}
        <div className={`${T.cardFlat} p-3`} data-tour="dive-suggestions">
          <h4 className={`text-xs font-semibold ${T.t2} mb-2 flex items-center gap-1`}>
            <Search className="w-3 h-3" />
            全体深掘りサジェスト
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {displaySuggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => onDeepDive(q)}
                disabled={diving}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${T.btnGhost} hover:border-brand-light dark:hover:border-brand-light/50 hover:text-brand dark:hover:text-brand-light disabled:opacity-30 transition`}
              >
                <ChevronRight className="w-3 h-3" />
                {q}
              </button>
            ))}
          </div>
          {diving && (
            <div className="mt-2 space-y-1.5">
              <div className={`flex items-center gap-1.5 text-xs ${T.t3}`}>
                <div className="w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-brand rounded-full animate-spin" />
                分析中 {diveProgress}%
              </div>
              <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-300"
                  style={{ width: `${diveProgress}%` }}
                />
              </div>
            </div>
          )}
          {error && !diving && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* Review input */}
        <div className={`${T.cardFlat} p-4`} data-tour="review-input">
          <h4 className={`text-xs font-semibold ${T.t2} mb-2 flex items-center gap-1`}>
            <MessageSquarePlus className="w-3 h-3" />
            レビュー & ブラッシュアップ（履歴に追加されます）
          </h4>
          <textarea
            value={reviewText}
            onChange={(e) => onReviewTextChange(e.target.value)}
            rows={3}
            placeholder="方向性修正、追加観点、深掘りポイント…"
            className={`${T.inp} resize-none mb-2`}
          />
          <div className="space-y-1.5">
            <button
              onClick={onRefine}
              disabled={refining || !reviewText.trim()}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-80 transition overflow-hidden"
            >
              {refining && (
                <div className="absolute inset-0 bg-white/10">
                  <div
                    className="h-full bg-white/20 transition-all duration-300 ease-out"
                    style={{ width: `${refineProgress}%` }}
                  />
                </div>
              )}
              <span className="relative flex items-center gap-1.5">
                {refining ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    分析中 {refineProgress}%
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    ブラッシュアップ実行
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* フッターDLバー */}
      {onDownload && (
        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          {onShowPreview && (
            <button
              onClick={onShowPreview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${T.btnGhost} cursor-pointer`}
            >
              <Eye className="w-3.5 h-3.5" /> プレビュー
            </button>
          )}
          <button
            onClick={() => setShowDlMenu((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${T.btnAccent}`}
          >
            <Download className="w-3.5 h-3.5" /> 結果をダウンロード
          </button>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
};
