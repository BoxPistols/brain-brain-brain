import React from 'react'
import { X, Key, Zap, Clock, ChevronRight, ExternalLink } from 'lucide-react'
import { T } from '../../constants/theme'

interface HelpModalProps {
    onClose: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div
                className='absolute inset-0 bg-black/50 backdrop-blur-sm'
                onClick={onClose}
            />
            <div
                className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto ${T.card} p-5 shadow-2xl`}
            >
                {/* Header */}
                <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-2'>
                        <Key className='w-4 h-4 text-blue-500' />
                        <h2 className={`text-sm font-semibold ${T.t1}`}>
                            APIキー設定ガイド
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-lg ${T.btnGhost}`}
                    >
                        <X className='w-4 h-4' />
                    </button>
                </div>

                {/* Free vs Pro comparison */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                    <div className={`p-3 rounded-xl border ${T.cardFlat}`}>
                        <div className='flex items-center gap-1.5 mb-2'>
                            <Clock className='w-3.5 h-3.5 text-slate-400' />
                            <span className={`text-xs font-semibold ${T.t2}`}>
                                フリーモード
                            </span>
                        </div>
                        <ul className={`text-xs ${T.t3} space-y-1`}>
                            <li className='flex items-start gap-1'>
                                <ChevronRight className='w-3 h-3 mt-0.5 shrink-0' />
                                APIキー不要
                            </li>
                            <li className='flex items-start gap-1'>
                                <ChevronRight className='w-3 h-3 mt-0.5 shrink-0' />
                                3段階（1-2分〜5-10分）
                            </li>
                            <li className='flex items-start gap-1'>
                                <ChevronRight className='w-3 h-3 mt-0.5 shrink-0' />
                                アイデア最大7件
                            </li>
                            <li className='flex items-start gap-1'>
                                <ChevronRight className='w-3 h-3 mt-0.5 shrink-0' />
                                簡潔な分析
                            </li>
                        </ul>
                    </div>
                    <div className='p-3 rounded-xl border border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/10'>
                        <div className='flex items-center gap-1.5 mb-2'>
                            <Zap className='w-3.5 h-3.5 text-blue-500' />
                            <span className='text-xs font-semibold text-blue-700 dark:text-blue-300'>
                                プロモード
                            </span>
                        </div>
                        <ul className='text-xs text-blue-700/80 dark:text-blue-300/80 space-y-1'>
                            <li className='flex items-start gap-1'>
                                <ChevronRight className='w-3 h-3 mt-0.5 shrink-0' />
                                自前APIキー使用
                            </li>
                            <li className='flex items-start gap-1'>
                                <ChevronRight className='w-3 h-3 mt-0.5 shrink-0' />
                                4段階（〜5分〜BCG Grade）
                            </li>
                            <li className='flex items-start gap-1'>
                                <ChevronRight className='w-3 h-3 mt-0.5 shrink-0' />
                                アイデア最大10件
                            </li>
                            <li className='flex items-start gap-1'>
                                <ChevronRight className='w-3 h-3 mt-0.5 shrink-0' />
                                深掘り分析・ブラッシュアップ全開放
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Steps */}
                <div className='space-y-3 mb-4'>
                    <h3 className={`text-xs font-semibold ${T.t2}`}>
                        APIキーの取得手順
                    </h3>

                    {[
                        {
                            step: 1,
                            title: 'OpenAIアカウントを作成',
                            desc: 'platform.openai.com にアクセスしてサインアップ',
                            url: 'https://platform.openai.com/signup',
                            urlLabel: 'platform.openai.com/signup',
                        },
                        {
                            step: 2,
                            title: 'APIキーを発行',
                            desc: 'ダッシュボード → API Keys → "Create new secret key"',
                            url: 'https://platform.openai.com/api-keys',
                            urlLabel: 'platform.openai.com/api-keys',
                        },
                        {
                            step: 3,
                            title: 'クレジットを追加（必要に応じて）',
                            desc: '初回は無料クレジットあり。Billing → Add creditから追加可能',
                            url: 'https://platform.openai.com/settings/organization/billing',
                            urlLabel: 'Billing設定',
                        },
                        {
                            step: 4,
                            title: 'このアプリの設定に入力',
                            desc: '⚙️ 設定 → "自分のAPIキー" 欄に sk-... を貼り付けてEnter',
                        },
                    ].map(({ step, title, desc, url, urlLabel }) => (
                        <div key={step} className='flex gap-3'>
                            <div className='w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5'>
                                {step}
                            </div>
                            <div>
                                <p className={`text-xs font-medium ${T.t1}`}>{title}</p>
                                <p className={`text-xs ${T.t3} mt-0.5`}>{desc}</p>
                                {url && (
                                    <a
                                        href={url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='inline-flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-600 mt-0.5'
                                    >
                                        {urlLabel}
                                        <ExternalLink className='w-2.5 h-2.5' />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cost note */}
                <div className='p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40'>
                    <p className='text-xs text-amber-700 dark:text-amber-300'>
                        💡 <strong>コストの目安:</strong>{' '}
                        gpt-4.1-nanoなら1回あたり約$0.001〜0.005（〜0.5〜0.8円）。
                        gpt-5-nanoでも1回あたり数円程度です。
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className={`mt-4 w-full py-2 rounded-lg text-xs font-medium ${T.btnAccent}`}
                >
                    閉じる
                </button>
            </div>
        </div>
    )
}
