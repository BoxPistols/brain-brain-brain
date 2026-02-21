import React from 'react'
import {
    Target,
    Sparkles,
    RefreshCw,
    Search,
    MessageSquarePlus,
    ChevronRight,
    AlertCircle,
    AlertTriangle,
} from 'lucide-react'
import { AIResults } from '../../types'
import { T } from '../../constants/theme'
import { ResultCard } from '../results/ResultCard'
import { RichText } from '../results/RichText'

interface ResultsPaneProps {
    loading: boolean
    results: AIResults | null
    error: string | null
    isSeedData: boolean
    displaySuggestions: string[]
    diving: boolean
    diveProgress: number
    onDeepDive: (q: string) => void
    onClearDeepDives: () => void
    reviewText: string
    onReviewTextChange: (text: string) => void
    refining: boolean
    refineProgress: number
    onRefine: () => void
}

const LoadingSkeleton: React.FC = () => (
    <div className='space-y-4 animate-pulse'>
        <div className={`${T.card} p-5`}>
            <div className='h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-3' />
            <div className='space-y-2'>
                <div className='h-3 w-full rounded bg-slate-200 dark:bg-slate-700' />
                <div className='h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700' />
                <div className='h-3 w-3/5 rounded bg-slate-200 dark:bg-slate-700' />
            </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
            {[...Array(6)].map((_, i) => (
                <div key={i} className={`${T.card} p-4`}>
                    <div className='h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700 mb-3' />
                    <div className='space-y-2'>
                        <div className='h-2.5 w-full rounded bg-slate-200 dark:bg-slate-700' />
                        <div className='h-2.5 w-2/3 rounded bg-slate-200 dark:bg-slate-700' />
                    </div>
                    <div className='flex gap-1.5 mt-3'>
                        <div className='h-4 w-12 rounded-full bg-slate-200 dark:bg-slate-700' />
                        <div className='h-4 w-12 rounded-full bg-slate-200 dark:bg-slate-700' />
                    </div>
                </div>
            ))}
        </div>
        <div className={`${T.cardFlat} p-3`}>
            <div className='h-3 w-20 rounded bg-slate-200 dark:bg-slate-700 mb-2' />
            <div className='flex gap-2'>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className='h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-700' />
                ))}
            </div>
        </div>
    </div>
)

const EmptyState: React.FC = () => (
    <div className={`hidden lg:flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed ${T.div} gap-3`}>
        <Sparkles className={`w-8 h-8 ${T.t3} opacity-30`} />
        <p className={`text-sm ${T.t3} opacity-50`}>
            左のフォームを入力して生成ボタンを押すと、ここに結果が表示されます
        </p>
    </div>
)

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
}) => {
    if (loading && !results) return <LoadingSkeleton />
    if (!results) return <EmptyState />

    return (
        <div className='space-y-4'>
            {/* Understanding */}
            <div className={`${T.card} p-5`}>
                <h3 className={`text-xs font-semibold ${T.accentTxt} mb-2.5 flex items-center gap-1.5`}>
                    <Target className='w-3.5 h-3.5' />
                    AI 状況分析
                    {isSeedData && <span className='ml-auto px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40'>Demo</span>}
                </h3>
                {results.keyIssue && (
                    <div className='mb-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30'>
                        <div className='flex items-start gap-2'>
                            <AlertTriangle className='w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0' />
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <span className='text-[10px] font-semibold text-rose-700 dark:text-rose-300'>最重要イシュー</span>
                                    {results.funnelStage && (
                                        <span className='px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/40'>
                                            {results.funnelStage}
                                        </span>
                                    )}
                                </div>
                                <p className='text-sm font-medium text-rose-800 dark:text-rose-200 mt-1 leading-relaxed'>{results.keyIssue}</p>
                            </div>
                        </div>
                    </div>
                )}
                <RichText text={results.understanding} />
            </div>

            {/* Idea grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                {results.ideas.map((idea, i) => (
                    <ResultCard key={`${idea.title}-${i}`} idea={idea} index={i} />
                ))}
            </div>

            {/* Deep-dive suggestions */}
            <div className={`${T.cardFlat} p-3`}>
                <h4 className={`text-xs font-semibold ${T.t2} mb-2 flex items-center gap-1`}>
                    <Search className='w-3 h-3' />
                    深掘りサジェスト
                </h4>
                <div className='flex flex-wrap gap-1.5'>
                    {displaySuggestions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => onDeepDive(q)}
                            disabled={diving}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${T.btnGhost} hover:border-blue-300 dark:hover:border-blue-700/50 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 transition`}
                        >
                            <ChevronRight className='w-3 h-3' />
                            {q}
                        </button>
                    ))}
                </div>
                {diving && (
                    <div className='mt-2 space-y-1.5'>
                        <div className={`flex items-center gap-1.5 text-xs ${T.t3}`}>
                            <div className='w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin' />
                            深掘り分析中 {diveProgress}%
                        </div>
                        <div className='h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden'>
                            <div className='h-full bg-blue-500 rounded-full transition-all duration-300 ease-out' style={{ width: `${diveProgress}%` }} />
                        </div>
                    </div>
                )}
                {error && !diving && (
                    <div className='mt-2 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400'>
                        <AlertCircle className='w-3 h-3 mt-0.5 shrink-0' />
                        {error}
                    </div>
                )}
            </div>

            {/* Deep dive output */}
            {results.deepDives && results.deepDives.length > 0 && (
                <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                        <h4 className={`text-xs font-semibold ${T.accentTxt} flex items-center gap-1`}>
                            <Search className='w-3.5 h-3.5' />
                            深掘り分析（{results.deepDives.length}件）
                        </h4>
                        <button onClick={onClearDeepDives} className={`text-xs ${T.t3} hover:text-red-500 transition`}>クリア</button>
                    </div>
                    {results.deepDives.map((dd, i) => (
                        <div key={i} className={`${T.card} p-5 border-l-2 border-l-blue-400 dark:border-l-blue-600`}>
                            <p className={`text-xs font-semibold ${T.t1} mb-2`}>{dd.question}</p>
                            <RichText text={dd.answer} />
                        </div>
                    ))}
                </div>
            )}

            {/* Refinement output */}
            {results.refinement && (
                <div className='bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5'>
                    <h4 className='text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1'>
                        <RefreshCw className='w-3.5 h-3.5' />
                        ブラッシュアップ
                    </h4>
                    <RichText text={results.refinement} />
                </div>
            )}

            {/* Review input */}
            <div className={`${T.cardFlat} p-4`}>
                <h4 className={`text-xs font-semibold ${T.t2} mb-2 flex items-center gap-1`}>
                    <MessageSquarePlus className='w-3 h-3' />
                    レビュー & ブラッシュアップ
                </h4>
                <textarea
                    value={reviewText}
                    onChange={(e) => onReviewTextChange(e.target.value)}
                    rows={3}
                    placeholder='方向性修正、追加観点、深掘りポイント…'
                    className={`${T.inp} resize-none mb-2`}
                />
                <div className='space-y-1.5'>
                    <button
                        onClick={onRefine}
                        disabled={refining || !reviewText.trim()}
                        className='relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-80 transition overflow-hidden'
                    >
                        {refining && (
                            <div className='absolute inset-0 bg-white/10'>
                                <div className='h-full bg-white/20 transition-all duration-300 ease-out' style={{ width: `${refineProgress}%` }} />
                            </div>
                        )}
                        <span className='relative flex items-center gap-1.5'>
                            {refining ? (
                                <>
                                    <div className='w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                    分析中 {refineProgress}%
                                </>
                            ) : (
                                <>
                                    <RefreshCw className='w-3 h-3' />
                                    ブラッシュアップ
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
