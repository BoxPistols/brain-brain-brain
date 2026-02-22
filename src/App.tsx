import { useState, useRef, useEffect, useMemo } from 'react'
import { Sparkles, Eye, AlertCircle, GripVertical } from 'lucide-react'

// Hooks
import { useTheme } from './hooks/useTheme'
import { useLogs } from './hooks/useLogs'
import { useBrainstormForm } from './hooks/useBrainstormForm'
import { useAI } from './hooks/useAI'
import { usePanelResize } from './hooks/usePanelResize'

// Components
import { HeaderBar } from './components/layout/HeaderBar'
import { ResultsPane } from './components/layout/ResultsPane'
import { ProjectForm } from './components/form/ProjectForm'
import { PreviewModal } from './components/modals/PreviewModal'
import { LogPanel } from './components/modals/LogPanel'
import { SettingsModal } from './components/modals/SettingsModal'
import { AppHelpModal } from './components/modals/AppHelpModal'
import { SupportWidget } from './components/support/SupportWidget'

// Utils & Constants
import { buildReportMd, buildReportCsv, mdToTxt, printReport, dlFile, downloadPdf, downloadPptx } from './utils/report'
import { T } from './constants/theme'
import { MODELS, isProMode } from './constants/models'
import { FREE_DEPTH, PRO_DEPTH } from './constants/prompts'

export default function App() {
    // Global hooks
    const { isDark, toggleTheme } = useTheme()
    const { ratio, applyRatio, startDrag, startTouchDrag, isDragging, containerRef, activePreset } = usePanelResize()

    const {
        logs, stgSettings, showLogs, setShowLogs,
        saveLog, deleteLog, deleteAllLogs, importLogs, updateSettings,
    } = useLogs()

    const {
        form, setForm, dep, setDep, usedName, setUsedName,
        sesLabel, suggestions, issueStr,
        getValidProjectName, applySeed, seedScenarios,
    } = useBrainstormForm()

    const {
        modelId, setModelId, connStatus, setConnStatus, runConnTest,
        loading, results, setResults, error,
        reviewText, setReviewText, refining, diving, drillingDownId,
        generate, refine, deepDive, drillDownIdea,
    } = useAI()

    // Handle seed data injection into AI state
    const handleSeed = (index: number) => {
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
        if (!isProMode(key) && dep > 3) setDep(3)
    }
    const proMode = isProMode(apiKey)

    // Local UI state
    const [showCfg, setShowCfg] = useState(false)
    const [showHelp, setShowHelp] = useState(() => !localStorage.getItem('ai-brainstorm-visited'))
    const [showPrev, setShowPrev] = useState(false)
    const [showValidation, setShowValidation] = useState(false)
    const [isSeedData, setIsSeedData] = useState(false)
    const [progress, setProgress] = useState(0)
    const [diveProgress, setDiveProgress] = useState(0)
    const [refineProgress, setRefineProgress] = useState(0)
    const handleGenerateRef = useRef<(() => void) | null>(null)

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                handleGenerateRef.current?.()
            }
            if (e.key === 'Escape') {
                if (showLogs) setShowLogs(false)
                else if (showPrev) setShowPrev(false)
                else if (showHelp) { localStorage.setItem('ai-brainstorm-visited', '1'); setShowHelp(false) }
                else if (showCfg) setShowCfg(false)
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [showLogs, showPrev, showHelp, showCfg])

    // Progress simulation during loading
    useEffect(() => {
        if (!loading) { setProgress(0); return }
        const dc = proMode ? PRO_DEPTH[dep] : FREE_DEPTH[dep]
        const waitStr = dc?.wait || '1-3分'
        const nums = waitStr.match(/\d+/g)?.map(Number) || [60]
        const estSec = (nums.length > 1 ? (nums[0] + nums[1]) / 2 : nums[0]) * 60
        const start = Date.now()
        const tick = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000
            const pct = Math.min(95, (1 - Math.exp(-2.5 * elapsed / estSec)) * 100)
            setProgress(Math.round(pct))
        }, 300)
        return () => clearInterval(tick)
    }, [loading, dep, proMode])

    // Deep dive progress
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

    // Refine progress
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
        generate(pn, form, dep, sesLabel, issueStr, (res, prompt) => {
            if (stgSettings.autoSave) saveLog(pn, form, res, prompt, cm.label, dep)
        }, apiKey)
    }
    handleGenerateRef.current = handleGenerate

    const handleRefine = () => {
        refine((res, text) => {
            if (stgSettings.autoSave) saveLog(usedName, form, res, text, cm.label, dep)
        }, apiKey)
    }

    return (
        <div className={T.page}>
            <div className='max-w-screen-2xl mx-auto px-4 py-4 md:px-8 md:py-6'>
                {/* ── Header ── */}
                <HeaderBar
                    proMode={proMode}
                    modelLabel={cm.label}
                    connStatus={connStatus}
                    seedScenarios={seedScenarios}
                    onSeed={handleSeed}
                    activePreset={activePreset}
                    onPreset={applyRatio}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                    onShowHelp={() => setShowHelp(true)}
                    onShowLogs={() => setShowLogs(true)}
                    showCfg={showCfg}
                    onToggleCfg={() => setShowCfg(s => !s)}
                />

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

                    {/* ── LEFT: Form pane ── */}
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

                            {error && (
                                <div className='mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/40 flex items-start gap-2'>
                                    <AlertCircle className='w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0' />
                                    <p className='text-red-700 dark:text-red-300 text-xs whitespace-pre-wrap'>{error}</p>
                                </div>
                            )}

                            {/* Submit row */}
                            <div className='flex items-center justify-between flex-wrap gap-2 mt-4'>
                                {usedName && results && (
                                    <span className={`text-xs ${T.t3}`}>
                                        PJ: <span className={`font-medium ${T.accentTxt}`}>{usedName}</span>
                                        {!form.projectName.trim() && <span className='ml-1 opacity-40'>(auto)</span>}
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
                        <ResultsPane
                            loading={loading}
                            results={results}
                            error={error}
                            isSeedData={isSeedData}
                            displaySuggestions={displaySuggestions}
                            diving={diving}
                            diveProgress={diveProgress}
                            onDeepDive={(q) => deepDive(q, apiKey)}
                            onClearDeepDives={() => setResults(p => p ? { ...p, deepDives: [] } : p)}
                            reviewText={reviewText}
                            onReviewTextChange={setReviewText}
                            refining={refining}
                            refineProgress={refineProgress}
                            onRefine={handleRefine}
                            onShowPreview={results ? () => setShowPrev(true) : undefined}
                            onDrillDown={(idea, index) => drillDownIdea(idea, index, apiKey)}
                            drillingDownId={drillingDownId}
                            onDownload={report && results ? (fmt) => {
                                const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-')
                                switch (fmt) {
                                    case 'md':
                                        dlFile(report, `${usedName}_${ts}.md`, 'text/markdown'); break
                                    case 'txt':
                                        dlFile(mdToTxt(report), `${usedName}_${ts}.txt`, 'text/plain'); break
                                    case 'csv':
                                        dlFile(buildReportCsv(usedName, form, results, cm.label, dep), `${usedName}_${ts}.csv`, 'text/csv'); break
                                    case 'pdfDl':
                                        downloadPdf(report, `${usedName}_${ts}`); break
                                    case 'pptx':
                                        downloadPptx(usedName, form, results, cm.label, dep); break
                                    case 'pdf':
                                        printReport(mdToTxt(report), usedName); break
                                }
                            } : undefined}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showHelp && <AppHelpModal onClose={() => { localStorage.setItem('ai-brainstorm-visited', '1'); setShowHelp(false) }} />}
            {showPrev && report && (
                <PreviewModal md={report} pn={usedName} onClose={() => setShowPrev(false)} />
            )}
            {showLogs && (
                <LogPanel
                    logs={logs}
                    onClose={() => setShowLogs(false)}
                    onDelete={deleteLog}
                    onDeleteAll={deleteAllLogs}
                    onExportAll={() => {
                        const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
                        dlFile(JSON.stringify(logs, null, 2), `brainstorm-logs_${ts}.json`, 'application/json');
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

            {/* サポートチャット */}
            <SupportWidget apiKey={apiKey} />
        </div>
    )
}
