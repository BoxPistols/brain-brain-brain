import { useState, useEffect, useCallback, useRef } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { T } from '../../constants/theme'
import { SupportPanel } from './SupportPanel'

const MIN_W = 320
const MIN_H = 300
const DEFAULT_W = 384 // sm:w-96
const DEFAULT_H = 500

interface Props {
    apiKey: string
}

export const SupportWidget: React.FC<Props> = ({ apiKey }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H })
    const dragging = useRef(false)
    const startRef = useRef({ x: 0, y: 0, w: 0, h: 0 })

    // Escape で閉じる
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen])

    // リサイズ（左上角ドラッグ）
    const onPointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        dragging.current = true
        startRef.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h }
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }, [size])

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragging.current) return
        const { x, y, w, h } = startRef.current
        const newW = Math.max(MIN_W, w + (x - e.clientX))
        const newH = Math.max(MIN_H, h + (y - e.clientY))
        setSize({ w: newW, h: newH })
    }, [])

    const onPointerUp = useCallback(() => {
        dragging.current = false
    }, [])

    return (
        <>
            {/* パネル */}
            <div
                className={`fixed z-40 bottom-20 right-4
                    transition-opacity duration-200 ease-out origin-bottom-right
                    ${isOpen
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none'
                    }`}
                style={{ width: size.w, height: size.h }}
            >
                {/* リサイズハンドル（左上角） */}
                <div
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    className='absolute -top-1 -left-1 w-4 h-4 cursor-nw-resize z-10
                        flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity'
                    title='ドラッグでリサイズ'
                >
                    <svg width='8' height='8' viewBox='0 0 8 8' className='text-slate-400'>
                        <path d='M0 8L8 0M0 5L5 0M0 2L2 0' stroke='currentColor' strokeWidth='1.2' />
                    </svg>
                </div>
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
