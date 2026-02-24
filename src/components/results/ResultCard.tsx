import React from 'react';
import { Clock, TrendingUp, Search, Loader2 } from 'lucide-react';
import { Idea } from '../../types';
import { ll, priorityC, effortC, impactC } from '../../utils/formatters';
import { RichText } from './RichText';
import { FeasibilityBar } from './FeasibilityBar';
import { T } from '../../constants/theme';

interface ResultCardProps {
  idea: Idea;
  index: number;
  onDrillDown?: (idea: Idea, index: number) => void;
  drillingDownId?: string | null;
  depth?: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  idea,
  index,
  onDrillDown,
  drillingDownId,
  depth = 0,
}) => {
  const isDrilling = drillingDownId === `${idea.title}-${index}`;
  const hasSubs = idea.subIdeas && idea.subIdeas.length > 0;

  return (
    <div className="space-y-3">
      <div
        className={`${T.card} p-3.5 hover:border-brand-light dark:hover:border-brand-light/50 transition-colors relative group`}
      >
        <div className="flex items-start gap-2 mb-2">
          <div
            className={`w-5 h-5 rounded bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-xs font-bold ${T.t2} shrink-0`}
          >
            {index + 1}
          </div>
          <h4 className={`text-sm font-semibold ${T.t1} leading-snug flex-1`}>{idea.title}</h4>

          {onDrillDown && !hasSubs && (
            <button
              onClick={() => onDrillDown(idea, index)}
              disabled={!!drillingDownId}
              className={`p-1 rounded bg-brand-50 dark:bg-brand-light/20 text-brand dark:text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 cursor-pointer`}
              title="このアイデアを深掘り"
              {...(index === 0 && depth === 0 ? { 'data-tour': 'result-drilldown' } : {})}
            >
              {isDrilling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        <div className="mb-2.5">
          <RichText text={idea.description} />
        </div>

        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700/40">
          {[
            { l: '優先度', v: idea.priority, c: priorityC },
            { l: '工数', v: idea.effort, c: effortC, ico: <Clock className="w-2.5 h-2.5" /> },
            {
              l: 'インパクト',
              v: idea.impact,
              c: impactC,
              ico: <TrendingUp className="w-2.5 h-2.5" />,
            },
          ].map((r) => (
            <div key={r.l} className="flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1 ${T.t3}`}>
                {r.ico}
                {r.l}
              </span>
              <span className={`px-1.5 py-0.5 rounded-full border text-xs font-medium ${r.c(r.v)}`}>
                {ll(r.v)}
              </span>
            </div>
          ))}
        </div>
        {idea.feasibility && <FeasibilityBar f={idea.feasibility} />}
      </div>

      {/* Sub-ideas (Recursive) */}
      {hasSubs && (
        <div className="ml-6 pl-4 border-l-2 border-brand-50 dark:border-brand-light/30 space-y-3">
          <div className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1">
            Sub-plans
          </div>
          {idea.subIdeas!.map((sub, i) => (
            <ResultCard
              key={`${sub.title}-${i}`}
              idea={sub}
              index={i}
              depth={depth + 1}
              onDrillDown={depth < 2 ? onDrillDown : undefined} // 深度制限
              drillingDownId={drillingDownId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
