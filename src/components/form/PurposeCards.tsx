import React from 'react';
import {
  TrendingUp,
  Users,
  Trophy,
  Zap,
  Rocket,
  Heart,
  GitBranch,
  Palette,
  Workflow,
  Target,
} from 'lucide-react';
import { PurposeCluster } from '../../constants/prompts';
import { T } from '../../constants/theme';

const ICONS: Record<string, React.ReactNode> = {
  'close-deals': <TrendingUp className="w-4 h-4" />,
  'get-leads': <Users className="w-4 h-4" />,
  'beat-competitors': <Trophy className="w-4 h-4" />,
  efficiency: <Zap className="w-4 h-4" />,
  'new-biz': <Rocket className="w-4 h-4" />,
  'team-cx': <Heart className="w-4 h-4" />,
  'dev-delivery': <GitBranch className="w-4 h-4" />,
  'design-ops': <Palette className="w-4 h-4" />,
  'unblock-flow': <Workflow className="w-4 h-4" />,
  'my-mission': <Target className="w-4 h-4" />,
};

/** プレイヤーフェーズのクラスター ID */
const PLAYER_IDS = new Set(['dev-delivery', 'design-ops', 'unblock-flow', 'my-mission']);

interface Props {
  clusters: PurposeCluster[];
  selectedId: string | null;
  onSelect: (cluster: PurposeCluster) => void;
}

const CardButton: React.FC<{
  cluster: PurposeCluster;
  active: boolean;
  onSelect: (c: PurposeCluster) => void;
}> = ({ cluster, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(cluster)}
    className={`text-left px-3 py-2.5 rounded-lg border transition cursor-pointer ${
      active
        ? 'bg-brand-50 dark:bg-slate-800 border border-brand dark:border-brand-light shadow-[0_0_0_1px] shadow-brand dark:shadow-brand-light'
        : `${T.cardFlat} hover:border-brand/30 dark:hover:border-brand-light/40`
    }`}
  >
    <div
      className={`flex items-center gap-1.5 text-xs font-semibold ${active ? 'text-brand-dark dark:text-white' : T.t1}`}
    >
      {ICONS[cluster.id]}
      {cluster.label}
    </div>
    <div
      className={`text-[10px] mt-0.5 leading-relaxed ${active ? 'text-brand/70 dark:text-slate-300' : T.t3}`}
    >
      {cluster.sublabel}
    </div>
  </button>
);

export const PurposeCards: React.FC<Props> = ({ clusters, selectedId, onSelect }) => {
  const bizClusters = clusters.filter((c) => !PLAYER_IDS.has(c.id));
  const playerClusters = clusters.filter((c) => PLAYER_IDS.has(c.id));

  return (
    <div className="space-y-2 mb-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {bizClusters.map((c) => (
          <CardButton key={c.id} cluster={c} active={selectedId === c.id} onSelect={onSelect} />
        ))}
      </div>
      {playerClusters.length > 0 && (
        <>
          <div className={`text-[10px] font-medium ${T.t3} flex items-center gap-2`}>
            <span className="h-px flex-1 bg-current opacity-20" />
            プレイヤー・実行フェーズ
            <span className="h-px flex-1 bg-current opacity-20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {playerClusters.map((c) => (
              <CardButton key={c.id} cluster={c} active={selectedId === c.id} onSelect={onSelect} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
