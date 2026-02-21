import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { T } from '../../constants/theme'
import { callAI, callAIWithKey, isProMode } from '../../constants/models'

const SUPPORT_MODEL = 'gpt-4.1-nano'
import { SUPPORT_SYSTEM_PROMPT } from './supportData'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

const MAX_HISTORY = 6

interface Props {
    apiKey: string
}

export const SupportAIChat: React.FC<Props> = ({ apiKey }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const handleSend = async () => {
        const text = input.trim()
        if (!text || loading) return

        const userMsg: Message = { role: 'user', content: text }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            // 直近のメッセージのみ送信し、長い回答は要約して送信
            const recent = newMessages.slice(-MAX_HISTORY).map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.role === 'assistant' && m.content.length > 200
                    ? m.content.slice(0, 200) + '…'
                    : m.content,
            }))
            const chatMsgs = [
                { role: 'system' as const, content: SUPPORT_SYSTEM_PROMPT },
                ...recent,
            ]
            const reply = isProMode(apiKey)
                ? await callAIWithKey(apiKey, SUPPORT_MODEL, chatMsgs, 512)
                : await callAI(SUPPORT_MODEL, chatMsgs, 512)
            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        } catch (err) {
            console.error('[SupportChat]', err)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '回答を取得できませんでした。もう一度お試しください。',
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex flex-col min-h-0 h-full'>
            {/* メッセージエリア */}
            <div className='flex-1 overflow-y-auto space-y-3 mb-3 overscroll-contain'>
                {messages.length === 0 && (
                    <p className={`text-xs ${T.t3} text-center py-6`}>
                        使い方や機能について質問できます
                    </p>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                            m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-slate-100 dark:bg-slate-800 rounded-bl-sm ' + T.t1
                        }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className='flex justify-start'>
                        <div className={`px-3 py-2 rounded-xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 ${T.t3}`}>
                            <Loader2 className='w-4 h-4 animate-spin' />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* 入力欄 */}
            <div className='flex items-center gap-2 shrink-0'>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend() }}
                    placeholder='質問を入力...'
                    className={`flex-1 px-3 py-2 rounded-lg text-xs ${T.inp}`}
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className={`shrink-0 p-2 rounded-lg ${T.btnAccent} disabled:opacity-40 transition-opacity cursor-pointer`}
                >
                    <Send className='w-3.5 h-3.5' />
                </button>
            </div>
        </div>
    )
}
