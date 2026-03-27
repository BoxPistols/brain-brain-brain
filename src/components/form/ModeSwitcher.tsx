import React, { useRef, useLayoutEffect, useState } from 'react';
import { Briefcase, Code2, Palette } from 'lucide-react';
import type { BrainstormMode } from '../../types';
import { MODE_LABELS } from '../../constants/prompts';

const MODE_CONFIG: {
  key: BrainstormMode;
  icon: React.ReactNode;
  activeBg: string;
  activeText: string;
  glow: string;
}[] = [
  {
    key: 'strategy',
    icon: <Briefcase className="w-3.5 h-3.5" />,
    activeBg: 'bg-mode-strategy-bg dark:bg-mode-strategy/15',
    activeText: 'text-mode-strategy-dark dark:text-white',
    glow: 'shadow-mode-strategy/20 dark:shadow-mode-strategy-light/15',
  },
  {
    key: 'player',
    icon: <Code2 className="w-3.5 h-3.5" />,
    activeBg: 'bg-mode-player-bg dark:bg-mode-player/15',
    activeText: 'text-mode-player-dark dark:text-white',
    glow: 'shadow-mode-player/20 dark:shadow-mode-player-light/15',
  },
  {
    key: 'designer',
    icon: <Palette className="w-3.5 h-3.5" />,
    activeBg: 'bg-mode-designer-bg dark:bg-mode-designer/15',
    activeText: 'text-mode-designer-dark dark:text-white',
    glow: 'shadow-mode-designer/20 dark:shadow-mode-designer-light/15',
  },
];

interface Props {
  mode: BrainstormMode;
  onChange: (mode: BrainstormMode) => void;
}

export const ModeSwitcher: React.FC<Props> = ({ mode, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const activeIdx = MODE_CONFIG.findIndex((m) => m.key === mode);
  const activeCfg = MODE_CONFIG[activeIdx];

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const btns = containerRef.current.querySelectorAll<HTMLButtonElement>('[data-mode-btn]');
    const btn = btns[activeIdx];
    if (btn) {
      setIndicator({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
      });
    }
  }, [activeIdx]);

  // 動的なボーダー色: モード別
  const borderColor =
    mode === 'strategy'
      ? 'border-mode-strategy/20 dark:border-mode-strategy-light/20'
      : mode === 'player'
        ? 'border-mode-player/20 dark:border-mode-player-light/20'
        : 'border-mode-designer/20 dark:border-mode-designer-light/20';

  return (
    <div className="mb-4">
      <div
        ref={containerRef}
        className={`relative inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border ${borderColor} transition-colors duration-300`}
      >
        {/* スライディングインジケーター */}
        <div
          className={`absolute top-0.5 h-[calc(100%-4px)] rounded-md transition-all duration-300 ease-out ${activeCfg.activeBg} shadow-sm ${activeCfg.glow}`}
          style={{ left: indicator.left, width: indicator.width }}
        />

        {MODE_CONFIG.map((cfg) => {
          const isActive = cfg.key === mode;
          return (
            <button
              key={cfg.key}
              data-mode-btn
              type="button"
              onClick={() => onChange(cfg.key)}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 cursor-pointer ${
                isActive
                  ? cfg.activeText
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {cfg.icon}
              <span className="hidden sm:inline">{MODE_LABELS[cfg.key]}</span>
              <span className="sm:hidden">{MODE_LABELS[cfg.key].replace('モード', '')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
