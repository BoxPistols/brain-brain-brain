import React, { useState } from 'react'
import {
    Wand2,
    CalendarRange,
    CalendarCheck,
    SlidersHorizontal,
    Layers,
    Plus,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import { BrainstormForm, IssueTemplate } from '../../types'
import {
    TYPES,
    ISSUE_TPL,
    FREE_DEPTH,
    PRO_DEPTH,
    EXAMPLE_PRODUCTS,
    GOAL_TEMPLATES,
    ISSUE_TEMPLATES,
} from '../../constants/prompts'
import { T } from '../../constants/theme'
import { IssueRow } from './IssueRow'

interface ProjectFormProps {
    form: BrainstormForm
    setForm: React.Dispatch<React.SetStateAction<BrainstormForm>>
    dep: number
    setDep: (d: number) => void
    proMode: boolean
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    form,
    setForm,
    dep,
    setDep,
    proMode,
}) => {
    const depTable = proMode ? PRO_DEPTH : FREE_DEPTH
    const [issueTemplateOpen, setIssueTemplateOpen] = useState(false)

    const onF = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

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

    const issueTpl = ISSUE_TPL[form.sessionType] || ISSUE_TPL.other

    return (
        <>
            {/* Project + Product */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
                <div className='relative'>
                    <label className={`block text-xs font-medium ${T.t2} mb-1`}>
                        プロジェクト名
                    </label>
                    <input
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
                <div>
                    <label className={`block text-xs font-medium ${T.t2} mb-1`}>
                        プロダクト / サービス *
                    </label>
                    <input
                        name='productService'
                        value={form.productService}
                        onChange={onF}
                        placeholder='例: ドローン点検SaaS'
                        className={T.inp}
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
            <div className='mb-3'>
                <label className={`block text-xs font-medium ${T.t2} mb-1`}>
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
                        name='sessionType'
                        value={form.sessionType}
                        onChange={onF}
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

            {/* Timeline */}
            <div className='mb-3'>
                <label className={`block text-xs font-medium ${T.t2} mb-1`}>
                    タイムライン
                </label>
                <div className='flex items-center gap-2'>
                    <div
                        className={`flex shrink-0 rounded-lg overflow-hidden border ${T.div}`}
                    >
                        {(
                            Object.entries({
                                period: { l: '期間', I: CalendarRange },
                                deadline: { l: '期日', I: CalendarCheck },
                            }) as [
                                'period' | 'deadline',
                                { l: string; I: React.ElementType },
                            ][]
                        ).map(([m, { l, I }]) => (
                            <button
                                key={m}
                                onClick={() =>
                                    setForm((p) => ({ ...p, tlMode: m }))
                                }
                                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs transition ${form.tlMode === m ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : `${T.t2} hover:bg-slate-100 dark:hover:bg-slate-700/40`}`}
                            >
                                <I className='w-3 h-3' />
                                {l}
                            </button>
                        ))}
                    </div>
                    {form.tlMode === 'period' ? (
                        <div className='flex items-center gap-1.5 flex-1'>
                            <input
                                type='date'
                                name='tlStart'
                                value={form.tlStart}
                                onChange={onF}
                                className={`${T.inp} flex-1`}
                            />
                            <span className={`text-xs ${T.t3}`}>〜</span>
                            <input
                                type='date'
                                name='tlEnd'
                                value={form.tlEnd}
                                onChange={onF}
                                className={`${T.inp} flex-1`}
                            />
                        </div>
                    ) : (
                        <input
                            type='date'
                            name='tlDead'
                            value={form.tlDead}
                            onChange={onF}
                            className={`${T.inp} flex-1`}
                        />
                    )}
                </div>
            </div>

            {/* Goals + Depth */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-3'>
                <div className='md:col-span-2'>
                    <label className={`block text-xs font-medium ${T.t2} mb-1`}>
                        チーム目標 *
                    </label>
                    <textarea
                        name='teamGoals'
                        value={form.teamGoals}
                        onChange={onF}
                        rows={2}
                        placeholder='定量目標を含めると精度向上'
                        className={`${T.inp} resize-none`}
                    />
                    {form.teamGoals === '' && (
                        <div className='flex flex-wrap gap-1 mt-1'>
                            {(
                                GOAL_TEMPLATES[form.sessionType] ||
                                GOAL_TEMPLATES.other
                            ).map((g, i) => (
                                <button
                                    key={i}
                                    onClick={() =>
                                        setForm((p) => ({ ...p, teamGoals: g }))
                                    }
                                    className={`px-2 py-0.5 rounded-full text-xs border ${T.btnGhost}`}
                                >
                                    <span className={T.t3}>目標例: </span>
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <label
                        className={`block text-xs font-medium ${T.t2} mb-1 flex items-center gap-1`}
                    >
                        <SlidersHorizontal className='w-3 h-3' />
                        分析深度
                    </label>
                    <div className='space-y-1'>
                        {Object.entries(depTable).map(([k, v]) => (
                            <button
                                key={k}
                                onClick={() => setDep(Number(k))}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs border transition ${Number(k) === dep ? 'bg-slate-900 dark:bg-slate-700 border-slate-600 text-slate-100 font-medium' : `${T.btnGhost} border-slate-200 dark:border-slate-700/60`}`}
                            >
                                <span className='font-medium'>{v.label}</span>
                                <span className='opacity-50'> · {v.desc}</span>
                                <span className={`ml-1 text-xs ${Number(k) === dep ? 'text-slate-400' : T.t3}`}>{v.wait}</span>
                            </button>
                        ))}
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
                                ISSUE_TEMPLATES[form.sessionType] ||
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
        </>
    )
}
