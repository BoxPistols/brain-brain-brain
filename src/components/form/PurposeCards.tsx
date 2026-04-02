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
  Blocks,
  FlaskConical,
  Container,
  Monitor,
  Layers,
  Search,
  Accessibility,
  MousePointerClick,
  ArrowLeftRight,
} from 'lucide-react';
import { PurposeCluster } from '../../constants/prompts';
import { T } from '../../constants/theme';
import type { BrainstormMode } from '../../types';

const ICONS: Record<string, React.ReactNode> = {
  // 戦略モード
  'close-deals': <TrendingUp className="w-4 h-4" />,
  'get-leads': <Users className="w-4 h-4" />,
  'beat-competitors': <Trophy className="w-4 h-4" />,
  efficiency: <Zap className="w-4 h-4" />,
  'new-biz': <Rocket className="w-4 h-4" />,
  'team-cx': <Heart className="w-4 h-4" />,
  // プレイヤーモード
  'dev-delivery': <GitBranch className="w-4 h-4" />,
  'design-ops': <Palette className="w-4 h-4" />,
  'unblock-flow': <Workflow className="w-4 h-4" />,
  'my-mission': <Target className="w-4 h-4" />,
  'arch-strategy': <Blocks className="w-4 h-4" />,
  'test-strategy': <FlaskConical className="w-4 h-4" />,
  'devops-platform': <Container className="w-4 h-4" />,
  'frontend-quality': <Monitor className="w-4 h-4" />,
  // デザイナーモード
  'design-system-build': <Layers className="w-4 h-4" />,
  'design-org-ops': <Palette className="w-4 h-4" />,
  'ux-improve': <Search className="w-4 h-4" />,
  'a11y-compliance': <Accessibility className="w-4 h-4" />,
  'interaction-craft': <MousePointerClick className="w-4 h-4" />,
  'design-dev-bridge': <ArrowLeftRight className="w-4 h-4" />,
};

/** モード別のアクセントカラー */
const MODE_ACTIVE_STYLE: Record<BrainstormMode, { card: string; icon: string; sublabel: string }> =
  {
    strategy: {
      card: 'bg-mode-strategy-bg dark:bg-slate-800 border-mode-strategy dark:border-mode-strategy-light shadow-[0_0_0_1px] shadow-mode-strategy dark:shadow-mode-strategy-light',
      icon: 'text-mode-strategy-dark dark:text-white',
      sublabel: 'text-mode-strategy/70 dark:text-slate-300',
    },
    player: {
      card: 'bg-mode-player-bg dark:bg-slate-800 border-mode-player dark:border-mode-player-light shadow-[0_0_0_1px] shadow-mode-player dark:shadow-mode-player-light',
      icon: 'text-mode-player-dark dark:text-white',
      sublabel: 'text-mode-player/70 dark:text-slate-300',
    },
    designer: {
      card: 'bg-mode-designer-bg dark:bg-slate-800 border-mode-designer dark:border-mode-designer-light shadow-[0_0_0_1px] shadow-mode-designer dark:shadow-mode-designer-light',
      icon: 'text-mode-designer-dark dark:text-white',
      sublabel: 'text-mode-designer/70 dark:text-slate-300',
    },
  };

interface Props {
  clusters: PurposeCluster[];
  selectedId: string | null;
  onSelect: (cluster: PurposeCluster) => void;
  mode: BrainstormMode;
}

const CardButton: React.FC<{
  cluster: PurposeCluster;
  active: boolean;
  onSelect: (c: PurposeCluster) => void;
  mode: BrainstormMode;
}> = ({ cluster, active, onSelect, mode }) => {
  const modeStyle = MODE_ACTIVE_STYLE[mode];
  return (
    <button
      type="button"
      onClick={() => onSelect(cluster)}
      className={`text-left px-3 py-2.5 rounded-lg border transition cursor-pointer ${
        active ? modeStyle.card : `${T.cardFlat} hover:border-slate-300 dark:hover:border-slate-600`
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold ${active ? modeStyle.icon : T.t1}`}
      >
        {ICONS[cluster.id]}
        {cluster.label}
      </div>
      <div className={`text-[10px] mt-0.5 leading-relaxed ${active ? modeStyle.sublabel : T.t3}`}>
        {cluster.sublabel}
      </div>
    </button>
  );
};

export const PurposeCards: React.FC<Props> = ({ clusters, selectedId, onSelect, mode }) => {
  // モードでフィルタ（PURPOSE_CLUSTERS は全モード含む）
  const filtered = clusters.filter((c) => c.mode === mode);
  const cols = filtered.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3';

  return (
    <div className="mb-3">
      <div className={`grid ${cols} gap-1.5`}>
        {filtered.map((c) => (
          <CardButton
            key={c.id}
            cluster={c}
            active={selectedId === c.id}
            onSelect={onSelect}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
};
