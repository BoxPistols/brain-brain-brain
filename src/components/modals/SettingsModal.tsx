import React, { useState } from 'react'
import { Wifi, WifiOff, Loader, Key, Zap, HelpCircle, Eye, EyeOff, X } from 'lucide-react'
import { MODELS } from '../../constants/models'
import { T } from '../../constants/theme'
import { HelpModal } from './HelpModal'

interface SettingsModalProps {
    modelId: string
    setModelId: (id: string) => void
    connStatus: { status: 'idle' | 'testing' | 'ok' | 'error'; msg: string }
    setConnStatus: (status: {
        status: 'idle' | 'testing' | 'ok' | 'error'
        msg: string
    }) => void
    runConnTest: (apiKey?: string) => void
    apiKey: string
    setApiKey: (key: string) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    modelId,
    setModelId,
    connStatus,
    setConnStatus,
    runConnTest,
    apiKey,
    setApiKey,
}) => {
    const [showKey, setShowKey] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const proMode = apiKey.trim().startsWith('sk-')

    return (
        <>
            <div className={`${T.card} p-3 mb-4 space-y-3 text-xs`}>
                {/* Mode badge */}
                <div className='flex items-center justify-between'>
                    <p className={`text-xs font-medium ${T.t2}`}>動作モード</p>
                    <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            proMode
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
                        }`}
                    >
                        {proMode ? (
                            <>
                                <Zap className='w-3 h-3' />
                                プロモード
                            </>
                        ) : (
                            <>
                                <span className='w-1.5 h-1.5 rounded-full bg-slate-400' />
                                フリーモード
                            </>
                        )}
                    </span>
                </div>

                {/* API key input */}
                <div>
                    <div className='flex items-center justify-between mb-1'>
                        <label className={`text-xs font-medium ${T.t2} flex items-center gap-1`}>
                            <Key className='w-3 h-3' />
                            自分のAPIキー
                            <span className={`${T.t3} font-normal`}>（任意）</span>
                        </label>
                        <button
                            onClick={() => setShowHelp(true)}
                            className={`flex items-center gap-0.5 text-xs ${T.t3} hover:text-blue-500 transition`}
                        >
                            <HelpCircle className='w-3 h-3' />
                            取得方法
                        </button>
                    </div>
                    <div className='relative'>
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder='sk-...'
                            className={`${T.inp} pr-16 font-mono text-xs`}
                            autoComplete='off'
                        />
                        <div className='absolute right-1.5 top-1.5 flex items-center gap-1'>
                            {apiKey && (
                                <button
                                    onClick={() => setApiKey('')}
                                    className={`p-1 rounded ${T.t3} hover:text-red-500 transition`}
                                    title='クリア'
                                >
                                    <X className='w-3 h-3' />
                                </button>
                            )}
                            <button
                                onClick={() => setShowKey((s) => !s)}
                                className={`p-1 rounded ${T.t3} hover:text-slate-600 dark:hover:text-slate-300 transition`}
                            >
                                {showKey ? (
                                    <EyeOff className='w-3 h-3' />
                                ) : (
                                    <Eye className='w-3 h-3' />
                                )}
                            </button>
                        </div>
                    </div>
                    {proMode && (
                        <p className='mt-1 text-xs text-emerald-600 dark:text-emerald-400'>
                            ✓ プロモード有効 — フル機能・高深度分析が使えます
                        </p>
                    )}
                    {!proMode && (
                        <p className={`mt-1 text-xs ${T.t3}`}>
                            入力するとプロモードに切り替わり、全機能が使えます
                        </p>
                    )}
                </div>

                {/* Model select */}
                <div className={`pt-2 border-t ${T.div}`}>
                    <p className={`text-xs font-medium ${T.t2} mb-1.5`}>モデル</p>
                    <div className='flex gap-1.5 flex-wrap'>
                        {MODELS.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => {
                                    setModelId(m.id)
                                    setConnStatus({ status: 'idle', msg: '' })
                                }}
                                className={`px-2.5 py-1.5 rounded-lg border transition text-xs text-left ${
                                    modelId === m.id
                                        ? 'bg-slate-800 dark:bg-slate-700 border-slate-600 dark:border-slate-500 text-slate-100 font-medium'
                                        : `${T.btnGhost} border-slate-200 dark:border-slate-700/60`
                                }`}
                            >
                                <span className='font-medium'>{m.label}</span>{' '}
                                <span className={`${T.t3} font-normal`}>
                                    {m.cost} · {m.t}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Connection test */}
                <div className={`flex items-center gap-2 pt-2 border-t ${T.div}`}>
                    <button
                        onClick={() => runConnTest(apiKey)}
                        disabled={connStatus.status === 'testing'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${T.btnGhost} disabled:opacity-40`}
                    >
                        {connStatus.status === 'testing' ? (
                            <>
                                <Loader className='w-3 h-3 animate-spin' />
                                テスト中…
                            </>
                        ) : (
                            <>
                                <Wifi className='w-3 h-3' />
                                接続テスト
                            </>
                        )}
                    </button>
                    {connStatus.status === 'ok' && (
                        <span className='flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                            {connStatus.msg}
                        </span>
                    )}
                    {connStatus.status === 'error' && (
                        <span
                            className='flex items-center gap-1 text-xs text-red-600 dark:text-red-400 max-w-xs truncate'
                            title={connStatus.msg}
                        >
                            <WifiOff className='w-3 h-3 shrink-0' />
                            {connStatus.msg}
                        </span>
                    )}
                    <p className={`ml-auto text-xs ${T.t3}`}>
                        {proMode ? 'OpenAI直接接続' : 'サーバープロキシ経由'}
                    </p>
                </div>
            </div>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </>
    )
}
