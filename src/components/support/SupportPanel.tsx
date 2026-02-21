import { useState } from 'react'
import { ArrowLeft, Bot, ChevronRight } from 'lucide-react'
import { T } from '../../constants/theme'
import { FAQ_CATEGORIES } from './supportData'
import { SupportFAQList } from './SupportFAQList'
import { SupportAIChat } from './SupportAIChat'

type View = 'top' | 'faq' | 'ai'

interface Props {
    apiKey: string
}

export const SupportPanel: React.FC<Props> = ({ apiKey }) => {
    const [view, setView] = useState<View>('top')
    const [categoryId, setCategoryId] = useState<string | null>(null)

    const selectedCategory = FAQ_CATEGORIES.find(c => c.id === categoryId)

    return (
        <div className={`${T.card} shadow-2xl flex flex-col max-h-[70vh] sm:max-h-[500px] overflow-hidden`}>
            {/* ヘッダー */}
            <div className='flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700/60 shrink-0'>
                <div className='flex items-center gap-2'>
                    {view !== 'top' && (
                        <button
                            onClick={() => setView('top')}
                            className={`${T.t2} hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer`}
                        >
                            <ArrowLeft className='w-4 h-4' />
                        </button>
                    )}
                    <span className={`text-sm font-semibold ${T.t1}`}>
                        {view === 'top' && 'サポート'}
                        {view === 'faq' && selectedCategory?.label}
                        {view === 'ai' && 'AIに質問'}
                    </span>
                </div>
            </div>

            {/* コンテンツ */}
            <div className={`flex-1 p-4 ${view === 'ai' ? 'overflow-hidden flex flex-col min-h-0' : 'overflow-y-auto overscroll-contain'}`}>
                {view === 'top' && (
                    <div className='space-y-2'>
                        {/* カテゴリ一覧 */}
                        {FAQ_CATEGORIES.map(cat => {
                            const Icon = cat.icon
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategoryId(cat.id); setView('faq') }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 ${T.accentTxt} shrink-0`}>
                                        <Icon className='w-4 h-4' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className={`text-sm font-medium ${T.t1}`}>{cat.label}</div>
                                        <div className={`text-xs ${T.t3}`}>{cat.items.length}件の質問</div>
                                    </div>
                                    <ChevronRight className={`w-3.5 h-3.5 ${T.t3} shrink-0`} />
                                </button>
                            )
                        })}

                        {/* AI質問への導線 */}
                        <div className='pt-3 border-t border-slate-200 dark:border-slate-700/40'>
                            <button
                                onClick={() => setView('ai')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-blue-900/15 transition-colors cursor-pointer`}
                            >
                                <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white shrink-0'>
                                    <Bot className='w-4 h-4' />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <div className={`text-sm font-medium ${T.t1}`}>AIに直接質問する</div>
                                    <div className={`text-xs ${T.t3}`}>使い方や機能について自由に質問</div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 ${T.t3} shrink-0`} />
                            </button>
                        </div>
                    </div>
                )}

                {view === 'faq' && selectedCategory && (
                    <SupportFAQList
                        category={selectedCategory}
                        onAskAI={() => setView('ai')}
                    />
                )}

                {view === 'ai' && (
                    <SupportAIChat apiKey={apiKey} />
                )}
            </div>
        </div>
    )
}
