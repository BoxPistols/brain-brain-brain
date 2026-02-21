import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { T } from '../../constants/theme'
import { callAI, callAIWithKey, DEFAULT_MODEL_ID, isProMode } from '../../constants/models'
import { SUPPORT_SYSTEM_PROMPT } from './supportData'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface Props {
    apiKey: string
}

export const SupportAIChat: React.FC<Props> = ({ apiKey }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        const text = input.trim()
        if (!text || loading) return

        const userMsg: Message = { role: 'user', content: text }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            const chatMsgs = [
                { role: 'system' as const, content: SUPPORT_SYSTEM_PROMPT },
                ...newMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            ]
            const reply = isProMode(apiKey)
                ? await callAIWithKey(apiKey, DEFAULT_MODEL_ID, chatMsgs, 2048)
                : await callAI(DEFAULT_MODEL_ID, chatMsgs, 2048)
            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '申し訳ありません。回答を取得できませんでした。ヘッダーの?アイコンから使い方ガイドをご確認ください。',
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex flex-col h-full'>
            {/* メッセージエリア */}
            <div ref={scrollRef} className='flex-1 overflow-y-auto space-y-3 mb-3 overscroll-contain min-h-[120px]'>
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
            </div>

            {/* 入力欄 */}
            <div className='flex items-center gap-2'>
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
