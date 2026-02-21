import React from 'react';
import { Shield } from 'lucide-react';
import { FeasibilityScore } from '../../types';
import { feasibilityBarC, feasibilityTextC } from '../../utils/formatters';
import { T } from '../../constants/theme';

interface FeasibilityBarProps {
  f: FeasibilityScore;
}

const Bar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="space-y-0.5">
    <div className="flex items-center justify-between text-[10px]">
      <span className={T.t3}>{label}</span>
      <span className={`font-semibold ${feasibilityTextC(score)}`}>{score}</span>
    </div>
    <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${feasibilityBarC(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

export const FeasibilityBar: React.FC<FeasibilityBarProps> = ({ f }) => (
  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/40 space-y-1.5">
    <div className="flex items-center justify-between">
      <span className={`flex items-center gap-1 text-xs ${T.t3}`}>
        <Shield className="w-3 h-3" />実現可能性
      </span>
      <span className={`text-xs font-bold ${feasibilityTextC(f.total)}`}>{f.total}</span>
    </div>
    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${feasibilityBarC(f.total)}`}
        style={{ width: `${f.total}%` }}
      />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Bar label="リソース" score={f.resource} />
      <Bar label="技術容易性" score={f.techDifficulty} />
      <Bar label="組織受容性" score={f.orgAcceptance} />
    </div>
  </div>
);
