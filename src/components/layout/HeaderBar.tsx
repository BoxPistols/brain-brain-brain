import React, { useState, useRef, useEffect } from 'react'
import {
    Sparkles,
    Database,
    Settings,
    FlaskConical,
    Sun,
    Moon,
    Zap,
    PanelLeftClose,
    Columns2,
    PanelRightClose,
} from 'lucide-react'
import { T } from '../../constants/theme'
import { PRESETS } from '../../hooks/usePanelResize'

interface HeaderBarProps {
    proMode: boolean
    modelLabel: string
    connStatus: { status: 'idle' | 'testing' | 'ok' | 'error'; msg: string }
    seedScenarios: Array<{ label: string; form: { productService: string } }>
    onSeed: (index: number) => void
    activePreset?: keyof typeof PRESETS
    onPreset: (ratio: number) => void
    isDark: boolean
    onToggleTheme: () => void
    onShowLogs: () => void
    showCfg: boolean
    onToggleCfg: () => void
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
    proMode,
    modelLabel,
    connStatus,
    seedScenarios,
    onSeed,
    activePreset,
    onPreset,
    isDark,
    onToggleTheme,
    onShowLogs,
    showCfg,
    onToggleCfg,
}) => {
    const [seedOpen, setSeedOpen] = useState(false)
    const seedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const seedRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!seedOpen) return
        const handler = (e: MouseEvent | TouchEvent) => {
            if (seedRef.current && !seedRef.current.contains(e.target as Node)) setSeedOpen(false)
        }
        document.addEventListener('mousedown', handler)
        document.addEventListener('touchstart', handler)
        return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler) }
    }, [seedOpen])

    return (
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
                {proMode && (
                    <div className='flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'>
                        <Zap className='w-3 h-3' />
                        Pro
                    </div>
                )}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${T.cardFlat} ${T.t2}`}>
                    <span className={T.accentTxt}>◆</span> {modelLabel}
                    {connStatus.status === 'ok' && (
                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' title={connStatus.msg} role='status' aria-label='接続正常' />
                    )}
                    {connStatus.status === 'error' && (
                        <span className='w-1.5 h-1.5 rounded-full bg-red-500' title={connStatus.msg} role='status' aria-label='接続エラー' />
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
                        className='flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition'
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
                                    onClick={() => { onSeed(i); setSeedOpen(false); }}
                                    className='w-full text-left px-3 py-2 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 transition'
                                >
                                    <div className={`font-medium ${T.t1}`}>{s.label}</div>
                                    <div className={`${T.t3} truncate`}>{s.form.productService}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className='hidden lg:flex items-center gap-0.5 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40'>
                    {([
                        { key: 'leftFocus', icon: PanelLeftClose, title: '左メイン (70:30)' },
                        { key: 'equal', icon: Columns2, title: '均等 (50:50)' },
                        { key: 'rightFocus', icon: PanelRightClose, title: '右メイン (30:70)' },
                    ] as const).map(({ key, icon: Icon, title }) => (
                        <button
                            key={key}
                            onClick={() => onPreset(PRESETS[key])}
                            title={title}
                            className={`p-1 rounded transition ${activePreset === key ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : `${T.t3} hover:${T.t2}`}`}
                        >
                            <Icon className='w-3.5 h-3.5' />
                        </button>
                    ))}
                </div>
                <button
                    onClick={onToggleTheme}
                    className={`p-1.5 rounded-lg ${T.btnGhost}`}
                    title={isDark ? 'ライトモード' : 'ダークモード'}
                    aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
                >
                    {isDark ? <Sun className='w-3.5 h-3.5' /> : <Moon className='w-3.5 h-3.5' />}
                </button>
                <button
                    onClick={onShowLogs}
                    className={`p-1.5 rounded-lg ${T.btnGhost}`}
                    title='ログ'
                    aria-label='ログ管理を開く'
                >
                    <Database className='w-3.5 h-3.5' />
                </button>
                <button
                    onClick={onToggleCfg}
                    className={`p-1.5 rounded-lg ${showCfg ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400' : T.btnGhost} rounded-lg border`}
                    aria-label='設定パネルの開閉'
                >
                    <Settings className='w-3.5 h-3.5' />
                </button>
            </div>
        </div>
    )
}
