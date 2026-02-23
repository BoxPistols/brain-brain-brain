import { useEffect, useCallback } from 'react'
import introJs from 'intro.js'

interface ResultsTourProps {
    enabled: boolean
    onExit: () => void
}

const STEPS = [
    {
        element: '[data-tour="result-understanding"]',
        title: '状況分析',
        intro: 'AIが入力情報をもとに導き出した現状認識と課題の構造です。最重要イシューがある場合は赤枠で強調されます。',
        position: 'bottom' as const,
    },
    {
        element: '[data-tour="result-cards"]',
        title: '戦略アイデア',
        intro: '優先度・工数・インパクトが評価された戦略提案の一覧です。分析深度が高いほど、より詳細なアイデアが生成されます。',
        position: 'top' as const,
    },
    {
        element: '[data-tour="result-drilldown"]',
        title: 'カード深掘り',
        intro: 'カードにホバーすると虫眼鏡アイコンが表示されます。クリックするとそのアイデアをさらに具体化したサブプランが生成されます。',
        position: 'left' as const,
    },
    {
        element: '[data-tour="dive-suggestions"]',
        title: '全体深掘りサジェスト',
        intro: 'AIが提案する追加の分析テーマです。クリックすると新しい視点で深掘り分析を実行し、結果が追加されます。',
        position: 'top' as const,
    },
    {
        element: '[data-tour="review-input"]',
        title: 'ブラッシュアップ',
        intro: '方向性の修正や追加の観点を入力して「ブラッシュアップ実行」を押すと、指示を反映した新しいアイデアが履歴として追加されます。',
        position: 'top' as const,
    },
    {
        element: '[data-tour="result-download"]',
        title: 'エクスポート',
        intro: '分析結果をMarkdown・CSV・PDF・PowerPointなど複数の形式でダウンロードできます。',
        position: 'bottom' as const,
    },
]

export const ResultsTour: React.FC<ResultsTourProps> = ({ enabled, onExit }) => {
    const stableOnExit = useCallback(onExit, [onExit])

    useEffect(() => {
        if (!enabled) return

        const raf = requestAnimationFrame(() => {
            const steps = STEPS.filter(s => document.querySelector(s.element))
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
                try { tour.exit(true) } catch { /* already exited */ }
            }
        })

        let cleanup = () => { cancelAnimationFrame(raf) }
        return () => cleanup()
    }, [enabled, stableOnExit])

    return null
}
