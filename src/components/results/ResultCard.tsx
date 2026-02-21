import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Idea } from '../../types';
import { ll, priorityC, effortC, impactC } from '../../utils/formatters';
import { RichText } from './RichText';
import { FeasibilityBar } from './FeasibilityBar';
import { T } from '../../constants/theme';

interface ResultCardProps {
  idea: Idea;
  index: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ idea, index }) => {
  return (
    <div className={`${T.card} p-3.5 hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors`}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-5 h-5 rounded bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-xs font-bold ${T.t2} shrink-0`}>
          {index + 1}
        </div>
        <h4 className={`text-sm font-semibold ${T.t1} leading-snug`}>{idea.title}</h4>
      </div>
      
      <div className="mb-2.5">
        <RichText text={idea.description} />
      </div>
      
      <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700/40">
        {[
          { l: '優先度', v: idea.priority, c: priorityC }, 
          { l: '工数', v: idea.effort, c: effortC, ico: <Clock className="w-2.5 h-2.5" /> }, 
          { l: 'インパクト', v: idea.impact, c: impactC, ico: <TrendingUp className="w-2.5 h-2.5" /> }
        ].map(r => (
          <div key={r.l} className="flex items-center justify-between text-xs">
            <span className={`flex items-center gap-1 ${T.t3}`}>{r.ico}{r.l}</span>
            <span className={`px-1.5 py-0.5 rounded-full border text-xs font-medium ${r.c(r.v)}`}>{ll(r.v)}</span>
          </div>
        ))}
      </div>
      {idea.feasibility && <FeasibilityBar f={idea.feasibility} />}
    </div>
  );
};
