import { Player, PlayerRef } from '@remotion/player'
import { useRef, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { WelcomeComposition, WELCOME_DURATION } from './WelcomeComposition'

interface WelcomeVideoModalProps {
    onClose: () => void
    onStartTour: () => void
}

export const WelcomeVideoModal: React.FC<WelcomeVideoModalProps> = ({ onClose, onStartTour }) => {
    const playerRef = useRef<PlayerRef>(null)

    const handleStartTour = useCallback(() => {
        onStartTour()
    }, [onStartTour])

    const handleEnded = useCallback(() => {
        setTimeout(handleStartTour, 500)
    }, [handleStartTour])

    // ESC キーで閉じる
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <div
            className='fixed inset-0 z-[9999] flex items-center justify-center'
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            role='dialog'
            aria-modal='true'
            aria-label='イントロダクション動画'
        >
            <div
                className='relative w-[92vw] max-w-[860px] rounded-2xl overflow-hidden'
                style={{
                    background: '#0f172a',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <Player
                    ref={playerRef}
                    component={WelcomeComposition}
                    durationInFrames={WELCOME_DURATION}
                    compositionWidth={860}
                    compositionHeight={484}
                    fps={30}
                    autoPlay
                    style={{ width: '100%', aspectRatio: 860 / 484 }}
                    controls={false}
                    onEnded={handleEnded}
                />

                {/* スキップボタン */}
                <button
                    type='button'
                    onClick={onClose}
                    className='absolute top-3 right-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition cursor-pointer'
                    aria-label='動画をスキップ'
                >
                    <X size={13} />
                    スキップ
                </button>

                {/* ツアー開始ボタン */}
                <div className='flex justify-end items-center px-5 py-3' style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                        type='button'
                        onClick={handleStartTour}
                        className='px-5 py-2 rounded-lg text-[13px] font-semibold text-white cursor-pointer'
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}
                    >
                        ガイドツアーを開始
                    </button>
                </div>
            </div>
        </div>
    )
}
