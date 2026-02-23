import React from 'react'
import {
    X, HelpCircle, Sparkles, Target, Layers, SlidersHorizontal,
    Search, FlaskConical, Database, Eye, Columns2,
    Sun, Zap, Clock, ChevronRight, Play, Navigation,
} from 'lucide-react'
import { T } from '../../constants/theme'

interface AppHelpModalProps {
    onClose: () => void
    onStartTour?: () => void
    onStartVideo?: () => void
    onStartResultsTour?: () => void
}

const Section: React.FC<{ title: string; children: React.ReactNode; noBorder?: boolean }> = ({ title, children, noBorder }) => (
    <div className={`pb-5 ${noBorder ? '' : 'mb-5 border-b border-white/10 dark:border-white/5'}`}>
        <h3 className={`text-sm font-semibold ${T.t1} mb-3 tracking-wide`}>{title}</h3>
        {children}
    </div>
)

const steps = [
    { icon: Target, label: 'セッションタイプを選択', desc: 'マーケティング・グロース・新規事業など目的に合った分析軸を選びます' },
    { icon: Layers, label: 'サービス名・目標・課題を入力', desc: '分析対象のサービスと、チームの目標・現状課題を記入します' },
    { icon: SlidersHorizontal, label: '分析深度を選択', desc: 'Lite〜High-Classの4段階。深いほど詳細な分析が得られます' },
    { icon: Sparkles, label: '「戦略アイデア生成」で分析開始', desc: 'AIが状況を分析し、優先度付きの戦略アイデアを生成します' },
    { icon: Search, label: '深掘り・ブラッシュアップ', desc: '気になるアイデアの深掘り分析や、追加指示でのブラッシュアップが可能です' },
]

const sessionTypes = [
    { key: 'product', label: 'サービス・事業改善' },
    { key: 'marketing', label: 'マーケティング・集客' },
    { key: 'growth', label: 'グロース・収益拡大' },
    { key: 'innovation', label: '新規事業・イノベーション' },
    { key: 'cx', label: '顧客体験・関係構築' },
    { key: 'ops', label: '営業・業務オペレーション' },
    { key: 'dx', label: 'デジタル化・業務効率化' },
    { key: 'design-system', label: 'ブランド・UI統一' },
    { key: 'other', label: '経営戦略・その他' },
]

const features = [
    { icon: FlaskConical, label: 'Seed', desc: 'サンプルデータを投入して、すぐに動作を試せます', tip: 'ヘッダーのSeedボタンから選択' },
    { icon: Database, label: 'ログ', desc: 'セッション結果の自動保存・エクスポート・インポート', tip: 'ヘッダーのログボタンから管理' },
    { icon: Eye, label: 'プレビュー', desc: 'レポートをMarkdown・テキストで出力、印刷にも対応', tip: '生成結果のプレビューボタンから表示' },
    { icon: Columns2, label: 'レイアウト', desc: '左右パネルの比率をプリセットやドラッグで調整', tip: 'ヘッダーのレイアウトプリセットから変更' },
    { icon: Sun, label: 'テーマ', desc: 'ダーク / ライトモードを切り替え', tip: 'ヘッダーの月/太陽アイコンで切替' },
]

const shortcuts = [
    { keys: ['Cmd/Ctrl', 'Enter'], desc: '戦略アイデア生成を実行' },
    { keys: ['Esc'], desc: 'モーダルを閉じる' },
]

export const AppHelpModal: React.FC<AppHelpModalProps> = ({ onClose, onStartTour, onStartVideo, onStartResultsTour }) => {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div
                className='absolute inset-0 bg-black/40 backdrop-blur-md animate-[fadeIn_200ms_ease-out]'
                onClick={onClose}
            />
            <div
                className='relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-[scaleIn_200ms_ease-out]'
                role='dialog'
                aria-modal='true'
                aria-labelledby='app-help-title'
            >
                {/* Header */}
                <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-white/10 shrink-0'>
                    <div className='flex items-center gap-2.5'>
                        <div className='w-8 h-8 rounded-lg bg-blue-600/90 backdrop-blur-sm flex items-center justify-center shadow-sm'>
                            <HelpCircle className='w-[18px] h-[18px] text-white' />
                        </div>
                        <h2 id='app-help-title' className={`text-base font-semibold ${T.t1}`}>
                            使い方ガイド
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-1.5 rounded-lg cursor-pointer bg-slate-100/80 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/20 transition-colors duration-200'
                        title='閉じる'
                        aria-label='閉じる'
                    >
                        <X className='w-[18px] h-[18px] text-slate-500 dark:text-slate-400' />
                    </button>
                </div>

                {/* Body */}
                <div className='flex-1 overflow-y-auto px-6 py-5 overscroll-contain'>

                    {/* 概要 */}
                    <div className='p-4 rounded-xl mb-5 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/30 backdrop-blur-sm'>
                        <p className='text-sm text-blue-700 dark:text-blue-300 leading-relaxed'>
                            <strong>AI Strategic Brainstorm</strong> は、AIを活用してビジネス戦略のアイデアを生成・深掘りするツールです。
                            サービスや事業の課題を入力すると、優先度・実行難易度・インパクト付きの戦略提案を受け取れます。
                        </p>
                        <p className='text-[13px] text-blue-600/80 dark:text-blue-400/80 mt-2 leading-relaxed'>
                            フリーモードでもお試しいただけますが、より高品質な分析には<strong>ご自身のOpenAI APIキー</strong>の設定を推奨しています。
                            設定画面から簡単に登録でき、分析深度Lv4やすべての深掘り機能が解放されます。
                        </p>
                    </div>

                    {/* 基本的な使い方 */}
                    <Section title='基本的な使い方'>
                        <div className='space-y-3.5'>
                            {steps.map(({ icon: Icon, label, desc }, i) => (
                                <div key={i} className='flex gap-3' title={`Step ${i + 1}: ${label}`}>
                                    <div className='w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0'>
                                        {i + 1}
                                    </div>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2'>
                                            <Icon className='w-[18px] h-[18px] text-blue-500' />
                                            <span className={`text-sm font-medium ${T.t1}`}>{label}</span>
                                        </div>
                                        <p className={`text-[13px] ${T.t3} mt-0.5 leading-relaxed`}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* セッションタイプ */}
                    <Section title='セッションタイプ'>
                        <div className='grid grid-cols-3 gap-2'>
                            {sessionTypes.map(({ key, label }) => (
                                <div
                                    key={key}
                                    className='px-3 py-2.5 rounded-lg text-[13px] text-center bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-sm text-slate-600 dark:text-slate-400'
                                    title={label}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                        <p className={`text-[13px] ${T.t3} mt-2.5 leading-relaxed`}>
                            選択したタイプに応じて、課題テンプレート・目標サジェスト・深掘り質問が自動最適化されます。
                        </p>
                    </Section>

                    {/* 分析深度 */}
                    <Section title='分析深度'>
                        <div className='grid grid-cols-2 gap-2.5'>
                            <div className='p-3.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-sm' title='APIキーなしで利用可能'>
                                <div className='flex items-center gap-2 mb-2.5'>
                                    <Clock className='w-[18px] h-[18px] text-slate-400' />
                                    <span className={`text-sm font-semibold ${T.t2}`}>フリーモード</span>
                                </div>
                                <ul className={`text-[13px] ${T.t3} space-y-1.5`}>
                                    {['Lv1 Lite — 速報（〜1分）', 'Lv2 Standard — 標準（1-3分）', 'Lv3 Deep — 詳細（3-5分）'].map(t => (
                                        <li key={t} className='flex items-start gap-1.5'>
                                            <ChevronRight className='w-4 h-4 mt-0.5 shrink-0' />{t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className='p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-700/40 bg-blue-50/80 dark:bg-blue-900/15 backdrop-blur-sm' title='自分のAPIキーで利用可能'>
                                <div className='flex items-center gap-2 mb-2.5'>
                                    <Zap className='w-[18px] h-[18px] text-blue-500' />
                                    <span className='text-sm font-semibold text-blue-700 dark:text-blue-300'>プロモード</span>
                                </div>
                                <ul className='text-[13px] text-blue-700/80 dark:text-blue-300/80 space-y-1.5'>
                                    {['Lv1 Quick — 概要（〜5分）', 'Lv2 Standard — 標準（〜15分）', 'Lv3 Deep — 詳細（〜30分）', 'Lv4 High-Class — トップティア（30分+）'].map(t => (
                                        <li key={t} className='flex items-start gap-1.5'>
                                            <ChevronRight className='w-4 h-4 mt-0.5 shrink-0' />{t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <p className={`text-[13px] ${T.t3} mt-2.5`}>
                            プロモードは設定画面でOpenAI APIキーを入力すると有効になります。
                        </p>
                    </Section>

                    {/* 便利な機能 */}
                    <Section title='便利な機能'>
                        <div className='space-y-3'>
                            {features.map(({ icon: Icon, label, desc, tip }) => (
                                <div key={label} className='flex items-start gap-3' title={tip}>
                                    <div className='p-2 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-sm shrink-0'>
                                        <Icon className={`w-[18px] h-[18px] ${T.t2}`} />
                                    </div>
                                    <div>
                                        <span className={`text-sm font-medium ${T.t1}`}>{label}</span>
                                        <p className={`text-[13px] ${T.t3} leading-relaxed`}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* キーボードショートカット */}
                    <Section title='キーボードショートカット' noBorder>
                        <div className='space-y-2.5'>
                            {shortcuts.map(({ keys, desc }) => (
                                <div key={desc} className='flex items-center gap-3' title={desc}>
                                    <div className='flex items-center gap-1'>
                                        {keys.map((k, i) => (
                                            <React.Fragment key={k}>
                                                {i > 0 && <span className={`text-[13px] ${T.t3} mx-0.5`}>+</span>}
                                                <kbd className='px-2 py-1 rounded-md text-[13px] font-mono border shadow-sm bg-white/70 dark:bg-white/10 border-slate-200/80 dark:border-white/15 text-slate-700 dark:text-slate-300'>
                                                    {k}
                                                </kbd>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <span className={`text-sm ${T.t2}`}>{desc}</span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* もう一度見る */}
                    {(onStartVideo || onStartTour || onStartResultsTour) && (
                        <Section title='もう一度見る' noBorder>
                            <div className='flex flex-wrap gap-2'>
                                {onStartVideo && (
                                    <button
                                        onClick={() => { onClose(); onStartVideo() }}
                                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/40 transition-colors'
                                    >
                                        <Play className={`w-4 h-4 ${T.accentTxt}`} />
                                        <span className={T.t1}>イントロ動画を再生</span>
                                    </button>
                                )}
                                {onStartTour && (
                                    <button
                                        onClick={() => { onClose(); onStartTour() }}
                                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/40 transition-colors'
                                    >
                                        <Navigation className={`w-4 h-4 ${T.accentTxt}`} />
                                        <span className={T.t1}>入力画面ガイド</span>
                                    </button>
                                )}
                                {onStartResultsTour && (
                                    <button
                                        onClick={() => { onClose(); onStartResultsTour() }}
                                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/40 transition-colors'
                                    >
                                        <Target className={`w-4 h-4 ${T.accentTxt}`} />
                                        <span className={T.t1}>分析画面ガイド</span>
                                    </button>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* Tip */}
                    <div className='p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-700/30 backdrop-blur-sm' title='APIキー設定のヒント'>
                        <p className='text-[13px] text-amber-700 dark:text-amber-300 leading-relaxed'>
                            <strong>Tip:</strong> APIキーの取得方法やコスト目安は、設定パネル内の「取得方法」ボタンで確認できます。
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className='px-6 py-4 border-t border-slate-200/60 dark:border-white/10 shrink-0'>
                    <button
                        onClick={onClose}
                        className='w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors duration-200'
                        title='ガイドを閉じる'
                    >
                        閉じる
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
            `}</style>
        </div>
    )
}
