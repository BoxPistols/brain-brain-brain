import React from 'react';
import { Wifi, WifiOff, Loader } from 'lucide-react';
import { MODELS } from '../../constants/models';
import { T } from '../../constants/theme';

interface SettingsModalProps {
  modelId: string;
  setModelId: (id: string) => void;
  connStatus: { status: 'idle' | 'testing' | 'ok' | 'error'; msg: string };
  setConnStatus: (status: { status: 'idle' | 'testing' | 'ok' | 'error'; msg: string }) => void;
  runConnTest: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  modelId, setModelId, connStatus, setConnStatus, runConnTest
}) => {
  return (
    <div className={`${T.card} p-3 mb-4 space-y-3 text-xs`}>
      {/* Model select */}
      <div>
        <p className={`text-xs font-medium ${T.t2} mb-1.5`}>モデル</p>
        <div className="flex gap-1.5 flex-wrap">
          {MODELS.map(m => (
            <button key={m.id} onClick={() => { setModelId(m.id); setConnStatus({ status: 'idle', msg: '' }); }}
              className={`px-2.5 py-1.5 rounded-lg border transition text-xs text-left ${modelId === m.id ? 'bg-slate-800 dark:bg-slate-700 border-slate-600 dark:border-slate-500 text-slate-100 font-medium' : `${T.btnGhost} border-slate-200 dark:border-slate-700/60`}`}>
              <span className="font-medium">{m.label}</span> <span className={`${T.t3} font-normal`}>{m.cost} · {m.t}</span>
            </button>
          ))}
        </div>
      </div>
      <p className={`text-xs ${T.t3}`}>✓ APIキー不要（サーバープロキシ経由）</p>
      
      {/* Connection test */}
      <div className={`flex items-center gap-2 pt-2 border-t ${T.div}`}>
        <button onClick={runConnTest} disabled={connStatus.status === 'testing'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${T.btnGhost} disabled:opacity-40`}>
          {connStatus.status === 'testing' ? <><Loader className="w-3 h-3 animate-spin" />テスト中…</> : <><Wifi className="w-3 h-3" />接続テスト</>}
        </button>
        {connStatus.status === 'ok' && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{connStatus.msg}
          </span>
        )}
        {connStatus.status === 'error' && (
          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 max-w-xs truncate" title={connStatus.msg}>
            <WifiOff className="w-3 h-3 shrink-0" />{connStatus.msg}
          </span>
        )}
      </div>
    </div>
  );
};
