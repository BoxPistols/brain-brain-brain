import React, { useState, useMemo } from 'react'
import {
    Wand2,
    SlidersHorizontal,
    Layers,
    Plus,
    ChevronDown,
    ChevronUp,
    Target,
} from 'lucide-react'
import { BrainstormForm, IssueTemplate, SessionType } from '../../types'
import {
    TYPES,
    FREE_DEPTH,
    PRO_DEPTH,
    EXAMPLE_PRODUCTS,
    ISSUE_TEMPLATES,
    getIssueSuggestions,
    getGoalSuggestions,
} from '../../constants/prompts'
import { T } from '../../constants/theme'
import { IssueRow } from './IssueRow'
import { CompetitiveIntelSection } from './CompetitiveIntelSection'

interface ProjectFormProps {
    form: BrainstormForm
    setForm: React.Dispatch<React.SetStateAction<BrainstormForm>>
    dep: number
    setDep: (d: number) => void
    proMode: boolean
    showValidation?: boolean
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    form,
    setForm,
    dep,
    setDep,
    proMode,
    showValidation = false,
}) => {
    const depTable = proMode ? PRO_DEPTH : FREE_DEPTH
    const [issueTemplateOpen, setIssueTemplateOpen] = useState(false)

    const onF = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const onSessionTypeChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const next = e.target.value as SessionType
        setForm((prev) => {
            if (prev.sessionType === next) return prev
            return {
                ...prev,
                sessionType: next,
                productService: '',
                teamGoals: '',
                issues: [{ text: '', detail: '', sub: [] }],
            }
        })
    }

    const setIssue = (
        i: number,
        k: keyof BrainstormForm['issues'][number],
        v: string,
    ) =>
        setForm((p) => {
            const is = [...p.issues]
            is[i] = { ...is[i], [k]: v }
            return { ...p, issues: is }
        })

    const addIssue = (t = '') =>
        setForm((p) => ({
            ...p,
            issues: [...p.issues, { text: t, detail: '', sub: [] }],
        }))

    const addIssueWithDetail = (tpl: IssueTemplate) =>
        setForm((p) => ({
            ...p,
            issues: [
                ...p.issues,
                { text: tpl.text, detail: tpl.detail, sub: [...tpl.sub] },
            ],
        }))

    const rmIssue = (i: number) =>
        setForm((p) => ({ ...p, issues: p.issues.filter((_, j) => j !== i) }))

    const addSub = (i: number) =>
        setForm((p) => {
            const is = [...p.issues]
            is[i] = { ...is[i], sub: [...(is[i].sub || []), ''] }
            return { ...p, issues: is }
        })

    const setSub = (i: number, si: number, v: string) =>
        setForm((p) => {
            const is = [...p.issues]
            const s = [...(is[i].sub || [])]
            s[si] = v
            is[i] = { ...is[i], sub: s }
            return { ...p, issues: is }
        })

    const rmSub = (i: number, si: number) =>
        setForm((p) => {
            const is = [...p.issues]
            is[i] = {
                ...is[i],
                sub: (is[i].sub || []).filter((_, j) => j !== si),
            }
            return { ...p, issues: is }
        })

    const issueTemplateKey = form.sessionType
    const issueTpl = getIssueSuggestions(form.sessionType, form.productService)
    const goalSuggestions = useMemo(
        () => getGoalSuggestions(form.sessionType, form.productService),
        [form.sessionType, form.productService],
    )
    const [goalPickerOpen, setGoalPickerOpen] = useState(false)
    const shouldNudgeGoal = !goalPickerOpen && !form.teamGoals.trim() && form.productService.trim().length > 0

    const toggleGoal = (goal: string) => {
        setForm((p) => {
            const current = p.teamGoals
                .split(/[,、・\n]/)
                .map((s) => s.trim())
                .filter(Boolean)
            const exists = current.includes(goal)
            const next = exists
                ? current.filter((g) => g !== goal)
                : [...current, goal]
            return { ...p, teamGoals: next.join('・') }
        })
    }

    return (
        <>
            {/* Project + Product */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
                <div className='relative'>
                    <label htmlFor='projectName' className={`block text-xs font-medium ${T.t2} mb-1`}>
                        プロジェクト名
                    </label>
                    <input
                        id='projectName'
                        name='projectName'
                        value={form.projectName}
                        onChange={onF}
                        placeholder='空欄→AI命名'
                        className={`${T.inp} pr-16`}
                    />
                    <span
                        className={`absolute right-2.5 top-7 text-xs ${T.t3} pointer-events-none flex items-center gap-0.5`}
                    >
                        <Wand2 className='w-3 h-3' />
                        自動
                    </span>
                </div>
                <div data-tour='product-service'>
                    <label htmlFor='productService' className={`block text-xs font-medium ${T.t2} mb-1`}>
                        プロダクト / サービス *
                    </label>
                    <input
                        id='productService'
                        name='productService'
                        value={form.productService}
                        onChange={onF}
                        placeholder='プロダクト / サービスカテゴリ名'
                        className={`${T.inp} ${showValidation && !form.productService.trim() ? 'ring-2 ring-red-400 dark:ring-red-500' : ''}`}
                    />
                    {form.productService === '' && (
                        <div className='flex flex-wrap gap-1 mt-1'>
                            {(
                                EXAMPLE_PRODUCTS[form.sessionType] ||
                                EXAMPLE_PRODUCTS.other
                            ).map((ex, i) => (
                                <button
                                    key={i}
                                    onClick={() =>
                                        setForm((p) => ({
                                            ...p,
                                            productService: ex,
                                        }))
                                    }
                                    className={`px-2 py-0.5 rounded-full text-xs border ${T.btnGhost}`}
                                >
                                    <span className={T.t3}>例: </span>
                                    {ex}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Session type */}
            <div className='mb-3' data-tour='session-type'>
                <label htmlFor='sessionType' className={`block text-xs font-medium ${T.t2} mb-1`}>
                    セッションタイプ
                </label>
                {form.sessionType === 'other' ? (
                    <div className='flex gap-2'>
                        <button
                            onClick={() =>
                                setForm((p) => ({
                                    ...p,
                                    sessionType: 'product',
                                }))
                            }
                            className={`shrink-0 px-2.5 py-2 rounded-lg border text-xs ${T.btnGhost}`}
                        >
                            ← 戻す
                        </button>
                        <input
                            name='customSession'
                            value={form.customSession}
                            onChange={onF}
                            placeholder='例: 海外展開戦略、M&A検討、IPO準備…'
                            className={`${T.inp} flex-1`}
                            autoFocus
                        />
                    </div>
                ) : (
                    <select
                        id='sessionType'
                        name='sessionType'
                        value={form.sessionType}
                        onChange={onSessionTypeChange}
                        className={T.inp}
                        style={{ backgroundImage: 'none' }}
                    >
                        {Object.entries(TYPES).map(([v, l]) => (
                            <option key={v} value={v}>
                                {l}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Goals + Depth */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-3'>
                <div className='md:col-span-2' data-tour='team-goals'>
                    <label htmlFor='teamGoals' className={`block text-xs font-medium ${T.t2} mb-1`}>
                        チーム目標 *
                    </label>
                    <textarea
                        id='teamGoals'
                        name='teamGoals'
                        value={form.teamGoals}
                        onChange={onF}
                        rows={2}
                        placeholder='定量目標を含めると精度向上（下から選択 or 自由入力）'
                        className={`${T.inp} resize-none ${showValidation && !form.teamGoals.trim() ? 'ring-2 ring-red-400 dark:ring-red-500' : ''}`}
                    />
                    <div className='relative mt-1'>
                        <button
                            type='button'
                            onClick={() => setGoalPickerOpen((o) => !o)}
                            title='セッションタイプに応じた目標候補から選択できます'
                            className={`flex items-center gap-1 text-xs transition-all duration-300 cursor-pointer ${
                                shouldNudgeGoal
                                    ? 'px-2.5 py-1 rounded-lg border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30 animate-[nudge_2s_ease-in-out_1]'
                                    : `${T.t3} hover:text-slate-600 dark:hover:text-slate-300`
                            }`}
                        >
                            <Target className='w-3.5 h-3.5' />
                            目標サジェストから選択
                            {goalPickerOpen ? (
                                <ChevronUp className='w-3 h-3' />
                            ) : (
                                <ChevronDown className='w-3 h-3' />
                            )}
                        </button>
                        {goalPickerOpen && (
                            <div className='mt-1 flex flex-wrap gap-1'>
                                {goalSuggestions.map((g, i) => {
                                    const selected = form.teamGoals
                                        .split(/[,、・\n]/)
                                        .map((s) => s.trim())
                                        .includes(g)
                                    return (
                                        <button
                                            key={i}
                                            type='button'
                                            onClick={() => toggleGoal(g)}
                                            className={`px-2 py-0.5 rounded-full text-xs border transition ${
                                                selected
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                                                    : T.btnGhost
                                            }`}
                                        >
                                            {g}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
                <div data-tour='depth'>
                    <label
                        className={`block text-xs font-medium ${T.t2} mb-1 flex items-center gap-1`}
                    >
                        <SlidersHorizontal className='w-3 h-3' />
                        分析深度
                    </label>
                    <div className='space-y-1'>
                        {Object.entries(depTable).map(([k, v]) => {
                            const isSelected = Number(k) === dep
                            const isHighClass = Number(k) === 4
                            const activeStyle = isHighClass
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 font-medium'
                                : 'bg-slate-900 dark:bg-slate-700 border-slate-600 text-slate-100 font-medium'
                            
                            return (
                                <button
                                    key={k}
                                    onClick={() => setDep(Number(k))}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs border transition ${isSelected ? activeStyle : `${T.btnGhost} border-slate-200 dark:border-slate-700/60`}`}
                                >
                                    <div className='flex items-center justify-between'>
                                        <span className='font-medium flex items-center gap-1.5'>
                                            {v.label}
                                            {isHighClass && <span className="text-[10px] px-1 py-0.5 bg-amber-200 dark:bg-amber-800 rounded text-amber-900 dark:text-amber-100 leading-none">Pro</span>}
                                        </span>
                                        <span
                                            className={`text-xs ${isSelected ? (isHighClass ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400') : T.t3}`}
                                        >
                                            {v.wait}
                                        </span>
                                    </div>
                                    <div className={`mt-0.5 text-[10px] ${isSelected ? (isHighClass ? 'text-amber-800/80 dark:text-amber-200/80' : 'opacity-70') : 'opacity-50'}`}>
                                        {v.desc}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Issues */}
            <div className='mb-3'>
                <label
                    className={`block text-xs font-medium ${T.t2} mb-1.5 flex items-center gap-1`}
                >
                    <Layers className='w-3 h-3' />
                    現状課題
                </label>
                <div className='space-y-1.5'>
                    {form.issues.map((iss, i) => (
                        <IssueRow
                            key={i}
                            issue={iss}
                            idx={i}
                            onChange={setIssue}
                            onRemove={rmIssue}
                            onAddSub={addSub}
                            onSubChange={setSub}
                            onRemoveSub={rmSub}
                        />
                    ))}
                </div>
                <div className='flex items-center gap-2 mt-2 flex-wrap'>
                    <button
                        onClick={() => addIssue()}
                        className={`flex items-center gap-1 text-xs ${T.t3} hover:text-slate-600 dark:hover:text-slate-300`}
                    >
                        <Plus className='w-3 h-3' />
                        追加
                    </button>
                    <span className={T.t3}>|</span>
                    {issueTpl.map((t, i) => (
                        <button
                            key={i}
                            onClick={() => addIssue(t)}
                            className={`px-2 py-0.5 rounded-full text-xs border ${T.btnGhost}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                {/* Issue template panel */}
                <div className='mt-2'>
                    <button
                        type='button'
                        onClick={() => setIssueTemplateOpen((o) => !o)}
                        className={`flex items-center gap-1 text-xs ${T.t3} hover:text-slate-600 dark:hover:text-slate-300`}
                    >
                        {issueTemplateOpen ? (
                            <ChevronUp className='w-3 h-3' />
                        ) : (
                            <ChevronDown className='w-3 h-3' />
                        )}
                        よくある課題パターン（詳細付き）
                    </button>
                    {issueTemplateOpen && (
                        <div className='mt-1.5 space-y-1.5'>
                            {(
                                ISSUE_TEMPLATES[issueTemplateKey] ||
                                ISSUE_TEMPLATES.other
                            ).map((tpl, i) => (
                                <button
                                    key={i}
                                    onClick={() => addIssueWithDetail(tpl)}
                                    className={`w-full text-left p-2 rounded-lg border cursor-pointer ${T.cardFlat} hover:border-blue-300 dark:hover:border-blue-500 transition`}
                                >
                                    <div
                                        className={`text-xs font-medium ${T.t1}`}
                                    >
                                        {tpl.text}
                                    </div>
                                    <div className={`text-xs ${T.t3} mt-0.5`}>
                                        {tpl.detail}
                                    </div>
                                    {tpl.sub.length > 0 && (
                                        <ul className='mt-0.5 space-y-0.5'>
                                            {tpl.sub.map((s, si) => (
                                                <li
                                                    key={si}
                                                    className={`text-xs ${T.t3}`}
                                                >
                                                    ・{s}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 競合・データ情報 */}
            <CompetitiveIntelSection form={form} setForm={setForm} />
        </>
    )
}
