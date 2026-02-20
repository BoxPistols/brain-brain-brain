import React, { useRef } from 'react';
import { Database, Download, Trash2, Upload, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { LogEntry, Settings as AppSettings } from '../../types';
import { T } from '../../constants/theme';

interface LogPanelProps {
  logs: LogEntry[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onExportAll: () => void;
  onExportAnswers: () => void;
  onExportOne: (log: LogEntry) => void;
  onImport: (data: any) => void;
  settings: AppSettings;
  onSettings: (s: AppSettings) => void;
}

export const LogPanel: React.FC<LogPanelProps> = ({
  logs, onClose, onDelete, onDeleteAll, onExportAll,
  onExportAnswers, onExportOne, onImport,
  settings, onSettings
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        if (ev.target?.result) {
          onImport(JSON.parse(ev.target.result as string));
        }
      } catch {
        alert('Invalid JSON');
      }
    };
    r.readAsText(f);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`${T.card} w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${T.div} shrink-0`}>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-semibold ${T.t1}`}>ログ管理</span>
            <span className={`text-xs ${T.t3}`}>{logs.length}件</span>
          </div>
          <button onClick={onClose} className={`p-1 rounded-lg ${T.btnGhost}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Save mode */}
        <div className={`px-4 py-2 border-b ${T.div} flex items-center gap-2 flex-wrap text-xs`}>
          <span className={T.t3}>保存モード:</span>
          {(['all', 'answers', 'off'] as const).map(m => (
            <button key={m} onClick={() => onSettings({ ...settings, logMode: m })}
              className={`px-2 py-1 rounded-lg border transition text-xs ${
                settings.logMode === m 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/50 text-blue-700 dark:text-blue-300' 
                  : `${T.btnGhost} border-slate-200 dark:border-slate-700/60`
              }`}>
              {{ all: 'Q&A全保存', answers: '回答のみ', off: 'OFF' }[m]}
            </button>
          ))}
          <button onClick={() => onSettings({ ...settings, autoSave: !settings.autoSave })} className={`flex items-center gap-1 ml-auto text-xs ${T.t2}`}>
            {settings.autoSave ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}自動保存
          </button>
        </div>
        
        {/* Actions */}
        <div className={`px-4 py-2 border-b ${T.div} flex items-center gap-2 flex-wrap text-xs`}>
          <button onClick={onExportAll} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs ${T.btnGhost}`}>
            <Download className="w-3 h-3" />全エクスポート
          </button>
          <button onClick={onExportAnswers} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs ${T.btnGhost}`}>
            <Download className="w-3 h-3" />回答のみ
          </button>
          <button onClick={() => fileRef.current?.click()} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs ${T.btnGhost}`}>
            <Upload className="w-3 h-3" />インポート
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          {logs.length > 0 && (
            <button onClick={onDeleteAll} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition ml-auto">
              <Trash2 className="w-3 h-3" />全削除
            </button>
          )}
        </div>
        
        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {logs.length === 0 && <p className={`text-xs ${T.t3} text-center py-8`}>ログがありません</p>}
          {logs.map((log) => (
            <div key={log.id} className={`${T.cardFlat} p-3`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${T.accentTxt}`}>{log.projectName}</span>
                <span className={`text-xs ${T.t3}`}>{new Date(log.timestamp).toLocaleString('ja-JP')}</span>
              </div>
              <p className={`text-xs ${T.t2} mb-2 line-clamp-2`}>{log.results?.understanding?.slice(0, 120)}…</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onExportOne(log)} className={`text-xs ${T.accentTxt} flex items-center gap-0.5`}>
                  <Download className="w-3 h-3" />JSON
                </button>
                <button onClick={() => onDelete(log.id)} className="text-xs text-red-500 dark:text-red-400 flex items-center gap-0.5 ml-auto">
                  <Trash2 className="w-3 h-3" />削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
