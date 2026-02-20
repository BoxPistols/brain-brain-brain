import { useState } from 'react'
import {
    Target,
    Sparkles,
    Eye,
    RefreshCw,
    Search,
    MessageSquarePlus,
    ChevronRight,
    Database,
    Settings,
    FlaskConical,
    Sun,
    Moon,
    AlertCircle,
} from 'lucide-react'

// Hooks
import { useTheme } from './hooks/useTheme'
import { useLogs } from './hooks/useLogs'
import { useBrainstormForm } from './hooks/useBrainstormForm'
import { useAI } from './hooks/useAI'

// Components
import { ProjectForm } from './components/form/ProjectForm'
import { PreviewModal } from './components/modals/PreviewModal'
import { LogPanel } from './components/modals/LogPanel'
import { SettingsModal } from './components/modals/SettingsModal'
import { ResultCard } from './components/results/ResultCard'
import { RichText } from './components/results/RichText'

// Utils & Constants
import { buildReportMd } from './utils/report'
import { T } from './constants/theme'
import { MODELS } from './constants/models'

export default function App() {
    // Global hooks
    const { isDark, toggleTheme } = useTheme()

    const {
        logs,
        stgSettings,
        showLogs,
        setShowLogs,
        saveLog,
        deleteLog,
        deleteAllLogs,
        importLogs,
        updateSettings,
    } = useLogs()

    const {
        form,
        setForm,
        dep,
        setDep,
        usedName,
        setUsedName,
        sesLabel,
        tlStr,
        suggestions,
        issueStr,
        getValidProjectName,
        applySeed,
    } = useBrainstormForm()

    const {
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
        deepDive,
    } = useAI()

    // Handle seed data injection into AI state
    const handleSeed = () => {
        const { modelId, results } = applySeed()
        setModelId(modelId)
        setResults(results)
        setConnStatus({ status: 'idle', msg: '' })
    }

    // Local UI state
    const [showCfg, setShowCfg] = useState(false)
    const [showPrev, setShowPrev] = useState(false)

    const cm = MODELS.find((m) => m.id === modelId) || MODELS[0]
    const report = results
        ? buildReportMd(usedName, form, results, 'OpenAI', cm.label, dep)
        : null

    const handleGenerate = () => {
        const pn = getValidProjectName()
        setUsedName(pn)
        generate(pn, form, dep, sesLabel, tlStr, issueStr, (res, prompt) => {
            if (stgSettings.autoSave)
                saveLog(pn, form, res, prompt, cm.label, dep)
        })
    }

    const handleRefine = () => {
        refine((res: any, text: string) => {
            if (stgSettings.autoSave)
                saveLog(usedName, form, res, text, cm.label, dep)
        })
    }

    return (
        <div className={T.page}>
            <div className='max-w-5xl mx-auto px-3 py-4 md:px-6 md:py-6'>
                {/* ── Header ── */}
                <div className='flex items-center justify-between mb-4 flex-wrap gap-2'>
                    <div className='flex items-center gap-2.5'>
                        <div className='w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center'>
                            <Sparkles className='w-3.5 h-3.5 text-white' />
                        </div>
                        <div>
                            <h1 className={`text-sm font-semibold ${T.t1}`}>
                                AI Strategic Brainstorm
                            </h1>
                            <p className={`text-xs ${T.t3}`}>
                                Expert-grade ideation
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        {/* Model badge */}
                        <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${T.cardFlat} ${T.t2}`}
                        >
                            <span className={T.accentTxt}>◆</span> {cm.label}
                            {connStatus.status === 'ok' && (
                                <span
                                    className='w-1.5 h-1.5 rounded-full bg-emerald-500'
                                    title={connStatus.msg}
                                />
                            )}
                            {connStatus.status === 'error' && (
                                <span
                                    className='w-1.5 h-1.5 rounded-full bg-red-500'
                                    title={connStatus.msg}
                                />
                            )}
                            {connStatus.status === 'testing' && (
                                <div className='w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin' />
                            )}
                        </div>

                        <button
                            onClick={handleSeed}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition`}
                            title='サンプルデータを投入'
                        >
                            <FlaskConical className='w-3.5 h-3.5' />
                            Seed
                        </button>
                        <button
                            onClick={toggleTheme}
                            className={`p-1.5 rounded-lg ${T.btnGhost}`}
                            title={isDark ? 'ライトモード' : 'ダークモード'}
                        >
                            {isDark ? (
                                <Sun className='w-3.5 h-3.5' />
                            ) : (
                                <Moon className='w-3.5 h-3.5' />
                            )}
                        </button>
                        <button
                            onClick={() => setShowLogs(true)}
                            className={`p-1.5 rounded-lg ${T.btnGhost}`}
                            title='ログ'
                        >
                            <Database className='w-3.5 h-3.5' />
                        </button>
                        <button
                            onClick={() => setShowCfg((s) => !s)}
                            className={`p-1.5 rounded-lg ${showCfg ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400' : T.btnGhost} rounded-lg border`}
                        >
                            <Settings className='w-3.5 h-3.5' />
                        </button>
                    </div>
                </div>

                {/* ── Config Panel ── */}
                {showCfg && (
                    <SettingsModal
                        modelId={modelId}
                        setModelId={setModelId}
                        connStatus={connStatus}
                        setConnStatus={setConnStatus}
                        runConnTest={runConnTest}
                    />
                )}

                {/* ── Main Form ── */}
                <div className={`${T.card} p-4 mb-4`}>
                    <ProjectForm
                        form={form}
                        setForm={setForm}
                        dep={dep}
                        setDep={setDep}
                    />

                    {/* Error */}
                    {error && (
                        <div className='mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/40 flex items-start gap-2'>
                            <AlertCircle className='w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0' />
                            <p className='text-red-700 dark:text-red-300 text-xs whitespace-pre-wrap'>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Submit row */}
                    <div className='flex items-center justify-between flex-wrap gap-2 mt-4'>
                        {usedName && results && (
                            <span className={`text-xs ${T.t3}`}>
                                PJ:{' '}
                                <span className={`font-medium ${T.accentTxt}`}>
                                    {usedName}
                                </span>
                                {!form.projectName.trim() && (
                                    <span className='ml-1 opacity-40'>
                                        (auto)
                                    </span>
                                )}
                            </span>
                        )}
                        <div className='ml-auto flex items-center gap-2'>
                            {results && (
                                <button
                                    onClick={() => setShowPrev(true)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border ${T.btnGhost}`}
                                >
                                    <Eye className='w-3.5 h-3.5' />
                                    プレビュー
                                </button>
                            )}
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm ${T.btnAccent} disabled:opacity-40 transition-all`}
                            >
                                {loading ? (
                                    <>
                                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                        分析中…
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className='w-4 h-4' />
                                        戦略アイデア生成
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ Results ══════════ */}
                {results && (
                    <div className='space-y-3'>
                        {/* Understanding */}
                        <div className={`${T.card} p-4`}>
                            <h3
                                className={`text-xs font-semibold ${T.accentTxt} mb-2 flex items-center gap-1.5`}
                            >
                                <Target className='w-3.5 h-3.5' />
                                AI 状況分析
                            </h3>
                            <RichText text={results.understanding} />
                        </div>

                        {/* Idea grid */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                            {results.ideas.map((idea, i) => (
                                <ResultCard key={i} idea={idea} index={i} />
                            ))}
                        </div>

                        {/* Deep-dive suggestions */}
                        <div className={`${T.cardFlat} p-3`}>
                            <h4
                                className={`text-xs font-semibold ${T.t2} mb-2 flex items-center gap-1`}
                            >
                                <Search className='w-3 h-3' />
                                深掘りサジェスト
                            </h4>
                            <div className='flex flex-wrap gap-1.5'>
                                {suggestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => deepDive(q)}
                                        disabled={diving}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${T.btnGhost} hover:border-blue-300 dark:hover:border-blue-700/50 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 transition`}
                                    >
                                        <ChevronRight className='w-3 h-3' />
                                        {q}
                                    </button>
                                ))}
                            </div>
                            {diving && (
                                <div
                                    className={`mt-2 flex items-center gap-1.5 text-xs ${T.t3}`}
                                >
                                    <div className='w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin' />
                                    分析中…
                                </div>
                            )}
                        </div>

                        {/* Deep dive output */}
                        {results.deepDive && (
                            <div
                                className={`${T.card} p-4 border-l-2 border-l-blue-400 dark:border-l-blue-600`}
                            >
                                <h4
                                    className={`text-xs font-semibold ${T.accentTxt} mb-2 flex items-center gap-1`}
                                >
                                    <Search className='w-3.5 h-3.5' />
                                    深掘り分析
                                </h4>
                                <RichText text={results.deepDive} />
                            </div>
                        )}

                        {/* Refinement output */}
                        {results.refinement && (
                            <div className='bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4'>
                                <h4 className='text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1'>
                                    <RefreshCw className='w-3.5 h-3.5' />
                                    ブラッシュアップ
                                </h4>
                                <RichText text={results.refinement} />
                            </div>
                        )}

                        {/* Review input */}
                        <div className={`${T.cardFlat} p-3`}>
                            <h4
                                className={`text-xs font-semibold ${T.t2} mb-2 flex items-center gap-1`}
                            >
                                <MessageSquarePlus className='w-3 h-3' />
                                レビュー & ブラッシュアップ
                            </h4>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={2}
                                placeholder='方向性修正、追加観点、深掘りポイント…'
                                className={`${T.inp} resize-none mb-2`}
                            />
                            <button
                                onClick={handleRefine}
                                disabled={refining || !reviewText.trim()}
                                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 transition'
                            >
                                {refining ? (
                                    <>
                                        <div className='w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                        処理中…
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className='w-3 h-3' />
                                        ブラッシュアップ
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showPrev && report && (
                <PreviewModal
                    md={report}
                    pn={usedName}
                    onClose={() => setShowPrev(false)}
                />
            )}
            {showLogs && (
                <LogPanel
                    logs={logs}
                    onClose={() => setShowLogs(false)}
                    onDelete={deleteLog}
                    onDeleteAll={deleteAllLogs}
                    onExportAll={() => console.log('Exporting...', logs)}
                    onExportAnswers={() =>
                        console.log('Exporting answers...', logs)
                    }
                    onExportOne={(l) => console.log('Exporting one...', l)}
                    onImport={importLogs}
                    settings={stgSettings}
                    onSettings={updateSettings}
                />
            )}
        </div>
    )
}
