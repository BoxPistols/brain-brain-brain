import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Plus, X, Globe, Users, BarChart3 } from 'lucide-react'
import { BrainstormForm, CompetitorEntry, KpiEntry } from '../../types'
import { getKpiSuggestions } from '../../constants/prompts'
import { T } from '../../constants/theme'

interface Props {
    form: BrainstormForm
    setForm: React.Dispatch<React.SetStateAction<BrainstormForm>>
}

const emptyComp = (): CompetitorEntry => ({ name: '', url: '', note: '' })
const emptyKpi = (): KpiEntry => ({ label: '', value: '' })

export const CompetitiveIntelSection: React.FC<Props> = ({ form, setForm }) => {
    const [open, setOpen] = useState(
        () => !!(form.serviceUrl || form.competitors?.length || form.kpis?.length)
    )

    const competitors = form.competitors || []
    const kpis = form.kpis || []

    const kpiSuggestions = useMemo(
        () => getKpiSuggestions(form.sessionType, form.productService),
        [form.sessionType, form.productService],
    )

    // 既に追加済みのKPIラベルを除外
    const availableKpiSuggestions = useMemo(
        () => kpiSuggestions.filter(s => !kpis.some(k => k.label === s.label)),
        [kpiSuggestions, kpis],
    )

    const updateComp = (i: number, field: keyof CompetitorEntry, val: string) => {
        const next = [...competitors]
        next[i] = { ...next[i], [field]: val }
        setForm(f => ({ ...f, competitors: next }))
    }
    const addComp = () => {
        if (competitors.length < 3) setForm(f => ({ ...f, competitors: [...competitors, emptyComp()] }))
    }
    const removeComp = (i: number) => {
        setForm(f => ({ ...f, competitors: competitors.filter((_, j) => j !== i) }))
    }

    const updateKpi = (i: number, field: keyof KpiEntry, val: string) => {
        const next = [...kpis]
        next[i] = { ...next[i], [field]: val }
        setForm(f => ({ ...f, kpis: next }))
    }
    const addKpi = (label = '', value = '') => {
        if (kpis.length < 8) setForm(f => ({ ...f, kpis: [...kpis, { label, value }] }))
    }
    const removeKpi = (i: number) => {
        setForm(f => ({ ...f, kpis: kpis.filter((_, j) => j !== i) }))
    }

    const filledCount = [
        form.serviceUrl ? 1 : 0,
        competitors.filter(c => c.name || c.url).length,
        kpis.filter(k => k.label && k.value).length,
    ].reduce((a, b) => a + b, 0)

    return (
        <div className={`rounded-xl border ${T.div} overflow-hidden`}>
            {/* Toggle header */}
            <button
                type='button'
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left cursor-pointer ${T.cardFlat.replace('rounded-xl', '')} hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors`}
            >
                <span className={`text-xs font-semibold ${T.t2} flex items-center gap-1.5`}>
                    <BarChart3 className='w-3.5 h-3.5' />
                    競合・データ情報
                    <span className={`text-[10px] font-normal ${T.t3}`}>（任意）</span>
                    {filledCount > 0 && (
                        <span className='ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'>
                            {filledCount}件入力済
                        </span>
                    )}
                </span>
                {open ? <ChevronUp className={`w-3.5 h-3.5 ${T.t3}`} /> : <ChevronDown className={`w-3.5 h-3.5 ${T.t3}`} />}
            </button>

            {open && (
                <div className='px-3 pb-3 space-y-4'>
                    {/* 自社URL */}
                    <div>
                        <label className={`text-[11px] font-medium ${T.t2} flex items-center gap-1 mb-1`}>
                            <Globe className='w-3 h-3' /> 自社サービスURL
                        </label>
                        <input
                            type='url'
                            value={form.serviceUrl || ''}
                            onChange={e => setForm(f => ({ ...f, serviceUrl: e.target.value }))}
                            placeholder='https://example.co.jp'
                            className={T.inpSm}
                        />
                    </div>

                    {/* 競合情報 */}
                    <div>
                        <label className={`text-[11px] font-medium ${T.t2} flex items-center gap-1 mb-1`}>
                            <Users className='w-3 h-3' /> 競合情報（最大3件）
                        </label>
                        <div className='space-y-1.5'>
                            {competitors.map((c, i) => (
                                <div key={i} className='flex gap-1.5 items-start'>
                                    <input
                                        value={c.name}
                                        onChange={e => updateComp(i, 'name', e.target.value)}
                                        placeholder='競合名'
                                        className={`${T.inpSm} flex-[2] min-w-0`}
                                    />
                                    <input
                                        value={c.url}
                                        onChange={e => updateComp(i, 'url', e.target.value)}
                                        placeholder='URL'
                                        className={`${T.inpSm} flex-[3] min-w-0`}
                                    />
                                    <input
                                        value={c.note}
                                        onChange={e => updateComp(i, 'note', e.target.value)}
                                        placeholder='特徴メモ'
                                        className={`${T.inpSm} flex-[2] min-w-0`}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => removeComp(i)}
                                        className={`p-1 rounded ${T.t3} hover:text-red-500 transition shrink-0 cursor-pointer`}
                                    >
                                        <X className='w-3.5 h-3.5' />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {competitors.length < 3 && (
                            <button
                                type='button'
                                onClick={addComp}
                                className={`mt-1.5 flex items-center gap-1 text-[11px] ${T.accentTxt} hover:underline cursor-pointer`}
                            >
                                <Plus className='w-3 h-3' /> 競合を追加
                            </button>
                        )}
                    </div>

                    {/* 主要KPI */}
                    <div>
                        <label className={`text-[11px] font-medium ${T.t2} flex items-center gap-1 mb-1`}>
                            <BarChart3 className='w-3 h-3' /> 主要KPI・実績値
                        </label>
                        <div className='space-y-1.5'>
                            {kpis.map((k, i) => (
                                <div key={i} className='flex gap-1.5 items-start'>
                                    <input
                                        value={k.label}
                                        onChange={e => updateKpi(i, 'label', e.target.value)}
                                        placeholder='KPI名'
                                        className={`${T.inpSm} flex-[3] min-w-0`}
                                    />
                                    <input
                                        value={k.value}
                                        onChange={e => updateKpi(i, 'value', e.target.value)}
                                        placeholder='値'
                                        className={`${T.inpSm} flex-[2] min-w-0`}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => removeKpi(i)}
                                        className={`p-1 rounded ${T.t3} hover:text-red-500 transition shrink-0 cursor-pointer`}
                                    >
                                        <X className='w-3.5 h-3.5' />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {kpis.length < 8 && (
                            <button
                                type='button'
                                onClick={() => addKpi()}
                                className={`mt-1.5 flex items-center gap-1 text-[11px] ${T.accentTxt} hover:underline cursor-pointer`}
                            >
                                <Plus className='w-3 h-3' /> KPIを追加
                            </button>
                        )}
                        {/* KPI サジェスト chips */}
                        {availableKpiSuggestions.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-2'>
                                {availableKpiSuggestions.slice(0, 6).map(s => (
                                    <button
                                        key={s.label}
                                        type='button'
                                        onClick={() => addKpi(s.label, '')}
                                        className={`px-2 py-0.5 rounded-full text-[10px] border ${T.btnGhost} hover:border-blue-300 dark:hover:border-blue-700/50 cursor-pointer transition`}
                                    >
                                        + {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
