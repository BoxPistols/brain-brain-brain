import { useState, useRef, useEffect, useMemo } from 'react'
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
    AlertTriangle,
    Zap,
    PanelLeftClose,
    Columns2,
    PanelRightClose,
    GripVertical,
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
import { buildReportMd, dlFile } from './utils/report'
import { T } from './constants/theme'
import { MODELS } from './constants/models'
import { FREE_DEPTH, PRO_DEPTH } from './constants/prompts'
import { usePanelResize, PRESETS } from './hooks/usePanelResize'

export default function App() {
    // Global hooks
    const { isDark, toggleTheme } = useTheme()
    const { ratio, applyRatio, startDrag, startTouchDrag, isDragging, containerRef, activePreset } = usePanelResize()

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
        seedScenarios,
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
    const handleSeed = (index?: number) => {
        const { modelId, results } = applySeed(index)
        setModelId(modelId)
        setResults(results)
        setConnStatus({ status: 'idle', msg: '' })
        setIsSeedData(true)
    }

    // API key (persisted in localStorage)
    const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('userApiKey') || '')
    const setApiKey = (key: string) => {
        setApiKeyState(key)
        localStorage.setItem('userApiKey', key)
        // Clamp dep to free-mode max when switching to free
        if (!key.trim().startsWith('sk-') && dep > 3) setDep(3)
    }
    const proMode = apiKey.trim().startsWith('sk-')

    // Local UI state
    const [showCfg, setShowCfg] = useState(false)
    const [showPrev, setShowPrev] = useState(false)
    const [showValidation, setShowValidation] = useState(false)
    const [isSeedData, setIsSeedData] = useState(false)
    const [progress, setProgress] = useState(0)
    const [diveProgress, setDiveProgress] = useState(0)
    const [refineProgress, setRefineProgress] = useState(0)
    const [seedOpen, setSeedOpen] = useState(false)
    const seedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const seedRef = useRef<HTMLDivElement | null>(null)
    const handleGenerateRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        if (!seedOpen) return
        const handler = (e: MouseEvent | TouchEvent) => {
            if (seedRef.current && !seedRef.current.contains(e.target as Node)) setSeedOpen(false)
        }
        document.addEventListener('mousedown', handler)
        document.addEventListener('touchstart', handler)
        return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler) }
    }, [seedOpen])

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Cmd/Ctrl+Enter → 生成
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                handleGenerateRef.current?.()
            }
            // Escape → モーダル閉じ
            if (e.key === 'Escape') {
                if (showLogs) setShowLogs(false)
                else if (showPrev) setShowPrev(false)
                else if (showCfg) setShowCfg(false)
                else if (seedOpen) setSeedOpen(false)
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [showLogs, showPrev, showCfg, seedOpen])

    // Progress simulation during loading
    useEffect(() => {
        if (!loading) { setProgress(0); return }
        const dc = proMode ? PRO_DEPTH[dep] : FREE_DEPTH[dep]
        // Parse estimated seconds from wait string (e.g. "〜1分" → 60, "1-3分" → 120, "3-5分" → 240)
        const waitStr = dc?.wait || '1-3分'
        const nums = waitStr.match(/\d+/g)?.map(Number) || [60]
        const estSec = (nums.length > 1 ? (nums[0] + nums[1]) / 2 : nums[0]) * 60
        const start = Date.now()
        const tick = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000
            // Asymptotic curve: approaches 95% at estimated time, never reaches 100%
            const pct = Math.min(95, (1 - Math.exp(-2.5 * elapsed / estSec)) * 100)
            setProgress(Math.round(pct))
        }, 300)
        return () => clearInterval(tick)
    }, [loading, dep, proMode])

    // Deep dive progress (estimated ~30s for free, ~60s for pro)
    useEffect(() => {
        if (!diving) { setDiveProgress(0); return }
        const estSec = proMode ? 60 : 30
        const start = Date.now()
        const tick = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000
            setDiveProgress(Math.min(95, Math.round((1 - Math.exp(-2.5 * elapsed / estSec)) * 100)))
        }, 300)
        return () => clearInterval(tick)
    }, [diving, proMode])

    // Refine progress (estimated ~30s for free, ~60s for pro)
    useEffect(() => {
        if (!refining) { setRefineProgress(0); return }
        const estSec = proMode ? 60 : 30
        const start = Date.now()
        const tick = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000
            setRefineProgress(Math.min(95, Math.round((1 - Math.exp(-2.5 * elapsed / estSec)) * 100)))
        }, 300)
        return () => clearInterval(tick)
    }, [refining, proMode])

    const cm = MODELS.find((m) => m.id === modelId) || MODELS[0]
    // AI生成サジェストがあればそちらを優先、なければstatic fallback
    const displaySuggestions = useMemo(
        () => results?.suggestions?.length ? results.suggestions : suggestions,
        [results?.suggestions, suggestions]
    )
    const report = useMemo(
        () => results ? buildReportMd(usedName, form, results, 'OpenAI', cm.label, dep) : null,
        [results, usedName, form, cm.label, dep]
    )

    const handleGenerate = () => {
        if (!form.productService.trim() || !form.teamGoals.trim()) {
            setShowValidation(true)
            return
        }
        setShowValidation(false)
        setIsSeedData(false)
        const pn = getValidProjectName()
        setUsedName(pn)
        generate(pn, form, dep, sesLabel, tlStr, issueStr, (res, prompt) => {
            if (stgSettings.autoSave)
                saveLog(pn, form, res, prompt, cm.label, dep)
        }, apiKey)
    }
    handleGenerateRef.current = handleGenerate

    const handleRefine = () => {
        refine((res, text) => {
            if (stgSettings.autoSave)
                saveLog(usedName, form, res, text, cm.label, dep)
        }, apiKey)
    }

    return (
        <div className={T.page}>
            <div className='max-w-screen-2xl mx-auto px-4 py-4 md:px-8 md:py-6'>
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
                        {/* Pro mode badge */}
                        {proMode && (
                            <div className='flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'>
                                <Zap className='w-3 h-3' />
                                Pro
                            </div>
                        )}
                        {/* Model badge */}
                        <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${T.cardFlat} ${T.t2}`}
                        >
                            <span className={T.accentTxt}>◆</span> {cm.label}
                            {connStatus.status === 'ok' && (
                                <span
                                    className='w-1.5 h-1.5 rounded-full bg-emerald-500'
                                    title={connStatus.msg}
                                    role='status'
                                    aria-label='接続正常'
                                />
                            )}
                            {connStatus.status === 'error' && (
                                <span
                                    className='w-1.5 h-1.5 rounded-full bg-red-500'
                                    title={connStatus.msg}
                                    role='status'
                                    aria-label='接続エラー'
                                />
                            )}
                            {connStatus.status === 'testing' && (
                                <div className='w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin' />
                            )}
                        </div>

                        <div
                            ref={seedRef}
                            className='relative'
                            onMouseEnter={() => { if (seedTimer.current) clearTimeout(seedTimer.current); setSeedOpen(true); }}
                            onMouseLeave={() => { seedTimer.current = setTimeout(() => setSeedOpen(false), 200); }}
                        >
                            <button
                                onClick={() => setSeedOpen(o => !o)}
                                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition`}
                                title='サンプルデータを投入'
                            >
                                <FlaskConical className='w-3.5 h-3.5' />
                                Seed
                            </button>
                            {seedOpen && (
                                <div className='absolute right-0 top-full mt-1 w-64 max-h-80 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50'>
                                    {seedScenarios.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { handleSeed(i); setSeedOpen(false); }}
                                            className='w-full text-left px-3 py-2 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 transition'
                                        >
                                            <div className={`font-medium ${T.t1}`}>{s.label}</div>
                                            <div className={`${T.t3} truncate`}>{s.form.productService}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Layout presets (desktop only) */}
                        <div className='hidden lg:flex items-center gap-0.5 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40'>
                            {([
                                { key: 'leftFocus', icon: PanelLeftClose, title: '左メイン (70:30)' },
                                { key: 'equal', icon: Columns2, title: '均等 (50:50)' },
                                { key: 'rightFocus', icon: PanelRightClose, title: '右メイン (30:70)' },
                            ] as const).map(({ key, icon: Icon, title }) => (
                                <button
                                    key={key}
                                    onClick={() => applyRatio(PRESETS[key])}
                                    title={title}
                                    className={`p-1 rounded transition ${activePreset === key ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : `${T.t3} hover:${T.t2}`}`}
                                >
                                    <Icon className='w-3.5 h-3.5' />
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`p-1.5 rounded-lg ${T.btnGhost}`}
                            title={isDark ? 'ライトモード' : 'ダークモード'}
                            aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
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
                            aria-label='ログ管理を開く'
                        >
                            <Database className='w-3.5 h-3.5' />
                        </button>
                        <button
                            onClick={() => setShowCfg((s) => !s)}
                            className={`p-1.5 rounded-lg ${showCfg ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400' : T.btnGhost} rounded-lg border`}
                            aria-label='設定パネルの開閉'
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
                        apiKey={apiKey}
                        setApiKey={setApiKey}
                    />
                )}

                {/* ══════════ 2-col layout (lg+) ══════════ */}
                <div ref={containerRef} className='flex flex-col lg:flex-row items-start'>

                    {/* ── LEFT: Form pane (sticky on desktop) ── */}
                    <div className='w-full lg:sticky lg:top-4 lg:shrink-0 lg:pr-2' style={{ flex: `0 0 ${ratio}%` }}>
                        <div className={`${T.card} p-4`}>
                            <ProjectForm
                                form={form}
                                setForm={setForm}
                                dep={dep}
                                setDep={setDep}
                                proMode={proMode}
                                showValidation={showValidation}
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
                                            <span className='ml-1 opacity-40'>(auto)</span>
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
                                        title='Cmd/Ctrl+Enter'
                                        className={`relative flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm ${T.btnAccent} disabled:opacity-90 transition-all overflow-hidden`}
                                    >
                                        {loading && (
                                            <div className='absolute inset-0 bg-white/10'>
                                                <div className='h-full bg-white/20 transition-all duration-300 ease-out' style={{ width: `${progress}%` }} />
                                            </div>
                                        )}
                                        <span className='relative flex items-center gap-1.5'>
                                            {loading ? (
                                                <>
                                                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                                    分析中 {progress}%
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className='w-4 h-4' />
                                                    戦略アイデア生成
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Drag handle ── */}
                    <div
                        onMouseDown={startDrag}
                        onTouchStart={startTouchDrag}
                        className={`hidden lg:flex items-center justify-center shrink-0 cursor-col-resize group transition-colors self-stretch ${isDragging ? 'w-1.5 bg-blue-500/40' : 'w-4 hover:bg-blue-500/10'}`}
                    >
                        <GripVertical className={`w-3 h-3 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-blue-400'}`} />
                    </div>

                    {/* ── RIGHT: Results pane ── */}
                    <div className='w-full lg:pl-2 min-w-0' style={{ flex: 1 }}>
                        {results ? (
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

                                {/* Idea grid — 2col on md, 3col on xl */}
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
                                                onClick={() => deepDive(q, apiKey)}
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
                                            <button onClick={() => setResults(p => p ? { ...p, deepDives: [] } : p)} className={`text-xs ${T.t3} hover:text-red-500 transition`}>クリア</button>
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
                                        onChange={(e) => setReviewText(e.target.value)}
                                        rows={3}
                                        placeholder='方向性修正、追加観点、深掘りポイント…'
                                        className={`${T.inp} resize-none mb-2`}
                                    />
                                    <div className='space-y-1.5'>
                                        <button
                                            onClick={handleRefine}
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
                        ) : (
                            /* Empty state (desktop only) */
                            <div className={`hidden lg:flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed ${T.div} gap-3`}>
                                <Sparkles className={`w-8 h-8 ${T.t3} opacity-30`} />
                                <p className={`text-sm ${T.t3} opacity-50`}>
                                    左のフォームを入力して生成ボタンを押すと、ここに結果が表示されます
                                </p>
                            </div>
                        )}
                    </div>

                </div>
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
                    onExportAll={() => {
                        const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
                        const data = JSON.stringify(logs, null, 2);
                        dlFile(data, `brainstorm-logs_${ts}.json`, 'application/json');
                    }}
                    onExportAnswers={() => {
                        const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
                        const answers = logs.map(l => ({
                            id: l.id, projectName: l.projectName, timestamp: l.timestamp,
                            model: l.model, depth: l.depth, results: l.results,
                        }));
                        dlFile(JSON.stringify(answers, null, 2), `brainstorm-answers_${ts}.json`, 'application/json');
                    }}
                    onExportOne={(l) => {
                        const ts = new Date(l.timestamp).toISOString().slice(0, 16).replace(/[T:]/g, '-');
                        dlFile(JSON.stringify(l, null, 2), `brainstorm-${l.projectName || l.id}_${ts}.json`, 'application/json');
                    }}
                    onImport={importLogs}
                    settings={stgSettings}
                    onSettings={updateSettings}
                />
            )}
        </div>
    )
}
