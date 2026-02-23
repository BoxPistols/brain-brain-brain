import { useEffect, useCallback } from 'react'
import introJs from 'intro.js'
import 'intro.js/introjs.css'

interface AppTourProps {
    enabled: boolean
    onExit: () => void
}

const ALL_STEPS = [
    {
        element: '[data-tour="session-type"]',
        title: 'セッション種別',
        intro: '分析の切り口を選びます。マーケティング・グロース・DXなど、目的に応じたセッションを選択してください。',
        position: 'bottom' as const,
    },
    {
        element: '[data-tour="product-service"]',
        title: 'プロダクト / サービス',
        intro: '対象のサービス名を入力します。入力に応じて課題や目標のサジェストが変わります。',
        position: 'bottom' as const,
    },
    {
        element: '[data-tour="team-goals"]',
        title: 'チーム目標',
        intro: '達成したい目標を記入します。定量的な目標（売上30%増など）を含めるとAI分析の精度が向上します。',
        position: 'bottom' as const,
    },
    {
        element: '[data-tour="depth"]',
        title: '分析深度',
        intro: '深度が高いほど、より詳細で専門的な分析を生成します。Pro モードでは最大 Lv4（High-Class）まで選択可能です。',
        position: 'left' as const,
    },
    {
        element: '[data-tour="generate"]',
        title: 'アイデア生成',
        intro: 'ボタンを押すと AI が戦略アイデアを生成します。Cmd/Ctrl+Enter でも実行できます。',
        position: 'top' as const,
    },
    {
        element: '[data-tour="seed"]',
        title: 'サンプルデータ',
        intro: 'まずはサンプルで試してみましょう。業種別のシナリオデータを一発で読み込めます。',
        position: 'bottom' as const,
    },
    {
        element: '[data-tour="settings"]',
        title: '設定',
        intro: 'API キーを設定すると Pro モードが有効になり、高度な分析が利用できます。',
        position: 'bottom' as const,
    },
]

export const AppTour: React.FC<AppTourProps> = ({ enabled, onExit }) => {
    const stableOnExit = useCallback(onExit, [onExit])

    useEffect(() => {
        if (!enabled) return

        // DOM が確実にレンダリングされた後に開始
        const raf = requestAnimationFrame(() => {
            const steps = ALL_STEPS.filter(s => document.querySelector(s.element))
            if (steps.length === 0) {
                stableOnExit()
                return
            }

            const tour = introJs()
            tour.setOptions({
                steps,
                nextLabel: '次へ',
                prevLabel: '戻る',
                doneLabel: '完了',
                skipLabel: 'スキップ',
                showProgress: true,
                showBullets: true,
                exitOnOverlayClick: true,
                scrollToElement: true,
                disableInteraction: false,
            })
            tour.onexit(() => stableOnExit())
            tour.oncomplete(() => stableOnExit())
            tour.start()

            cleanup = () => {
                try { tour.exit(true) } catch { /* すでに終了済み */ }
            }
        })

        let cleanup = () => { cancelAnimationFrame(raf) }
        return () => cleanup()
    }, [enabled, stableOnExit])

    return null
}
