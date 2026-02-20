import React, { useState, useMemo } from 'react';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import { Issue } from '../../types';
import { T } from '../../constants/theme';
import { getSubIssueSuggestions } from '../../constants/prompts';

interface IssueRowProps {
  issue: Issue;
  idx: number;
  onChange: (idx: number, key: keyof Issue, value: string) => void;
  onRemove: (idx: number) => void;
  onAddSub: (idx: number) => void;
  onSubChange: (idx: number, si: number, value: string) => void;
  onRemoveSub: (idx: number, si: number) => void;
}

export const IssueRow: React.FC<IssueRowProps> = ({
  issue, idx, onChange, onRemove, onAddSub, onSubChange, onRemoveSub
}) => {
  const [open, setOpen] = useState(false);
  const subSuggestions = useMemo(
    () => getSubIssueSuggestions(issue.text),
    [issue.text],
  );
  const existingSubs = new Set(issue.sub || []);

  return (
    <div>
      <div className="flex items-start gap-1.5">
        <button onClick={() => setOpen(o => !o)} className={`mt-1.5 p-0.5 rounded ${T.t3} hover:text-slate-600 dark:hover:text-slate-300 transition shrink-0`}>
          <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
        </button>
        <input value={issue.text} onChange={e => onChange(idx, 'text', e.target.value)} placeholder="課題…" className={`${T.inpSm} flex-1`} />
        <button onClick={() => onRemove(idx)} className="mt-1 p-1 rounded text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition shrink-0">
          <Minus className="w-3 h-3" />
        </button>
      </div>

      {open && (
        <div className={`ml-5 mt-1.5 space-y-1.5 pl-2 border-l ${T.div}`}>
          <input value={issue.detail || ''} onChange={e => onChange(idx, 'detail', e.target.value)} placeholder="背景・影響度・定量データ…" className={T.inpSm} />
          {(issue.sub || []).map((s, si) => (
            <div key={si} className="flex items-center gap-1">
              <span className={`text-xs ${T.t3}`}>└</span>
              <input value={s} onChange={e => onSubChange(idx, si, e.target.value)} placeholder="サブ課題…" className={`${T.inpSm} flex-1`} />
              <button onClick={() => onRemoveSub(idx, si)} className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400">
                <Minus className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-1.5 flex-wrap ml-3">
            <button onClick={() => onAddSub(idx)} className={`flex items-center gap-1 text-xs ${T.t3} hover:text-slate-600 dark:hover:text-slate-300`}>
              <Plus className="w-3 h-3" />サブ課題
            </button>
            {subSuggestions.filter(s => !existingSubs.has(s)).map((s, i) => (
              <button
                key={i}
                onClick={() => { onAddSub(idx); setTimeout(() => onSubChange(idx, (issue.sub || []).length, s), 0); }}
                className={`px-1.5 py-0.5 rounded-full text-[10px] border ${T.btnGhost}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
