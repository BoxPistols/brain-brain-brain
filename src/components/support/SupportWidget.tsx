import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { T } from '../../constants/theme'
import { SupportPanel } from './SupportPanel'

interface Props {
    apiKey: string
}

export const SupportWidget: React.FC<Props> = ({ apiKey }) => {
    const [isOpen, setIsOpen] = useState(false)

    // Escape で閉じる（ウィジェット内で完結）
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen])

    return (
        <>
            {/* パネル */}
            <div
                className={`fixed z-40 bottom-20 right-4 left-4 sm:left-auto sm:w-96
                    transition-all duration-200 ease-out origin-bottom-right
                    ${isOpen
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
            >
                <SupportPanel apiKey={apiKey} />
            </div>

            {/* FABボタン */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className={`fixed z-40 bottom-4 right-4 w-12 h-12 rounded-full
                    ${T.btnAccent} shadow-lg
                    flex items-center justify-center
                    transition-transform duration-200 hover:scale-110
                    cursor-pointer`}
                title={isOpen ? 'サポートを閉じる' : 'サポート'}
                aria-label={isOpen ? 'サポートを閉じる' : 'サポート'}
            >
                {isOpen
                    ? <X className='w-5 h-5' />
                    : <MessageCircle className='w-5 h-5' />
                }
            </button>
        </>
    )
}
