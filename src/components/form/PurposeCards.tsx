import React from 'react';
import { TrendingUp, Users, Trophy, Zap, Rocket, Heart } from 'lucide-react';
import { PurposeCluster } from '../../constants/prompts';
import { T } from '../../constants/theme';

const ICONS: Record<string, React.ReactNode> = {
  'close-deals': <TrendingUp className="w-4 h-4" />,
  'get-leads': <Users className="w-4 h-4" />,
  'beat-competitors': <Trophy className="w-4 h-4" />,
  efficiency: <Zap className="w-4 h-4" />,
  'new-biz': <Rocket className="w-4 h-4" />,
  'team-cx': <Heart className="w-4 h-4" />,
};

interface Props {
  clusters: PurposeCluster[];
  selectedId: string | null;
  onSelect: (cluster: PurposeCluster) => void;
}

export const PurposeCards: React.FC<Props> = ({ clusters, selectedId, onSelect }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 mb-3">
    {clusters.map((c) => {
      const active = selectedId === c.id;
      return (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c)}
          className={`text-left px-2.5 py-2 rounded-lg border transition cursor-pointer ${
            active
              ? 'bg-brand-50 dark:bg-slate-800 border border-brand dark:border-brand-light shadow-[0_0_0_1px] shadow-brand dark:shadow-brand-light'
              : `${T.cardFlat} hover:border-brand/30 dark:hover:border-brand-light/40`
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${active ? 'text-brand-dark dark:text-white' : T.t1}`}
          >
            {ICONS[c.id]}
            {c.label}
          </div>
          <div
            className={`text-[10px] mt-0.5 ${active ? 'text-brand/70 dark:text-slate-300' : T.t3}`}
          >
            {c.sublabel}
          </div>
        </button>
      );
    })}
  </div>
);
