import { useState, useCallback } from 'react';
import { LogEntry, Settings, BrainstormForm, AIResults } from '../types';
import { loadLogs, saveLogs, loadSettings, saveSettings } from '../utils/storage';

export const useLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => loadLogs());
  const [stgSettings, setStgSettings] = useState<Settings>(() => loadSettings());
  const [showLogs, setShowLogs] = useState(false);

  const updateSettings = useCallback((s: Settings) => {
    setStgSettings(s);
    saveSettings(s);
  }, []);

  const saveLog = useCallback((pn: string, f: BrainstormForm, res: AIResults, q: string, modelName: string, depth: number) => {
    if (stgSettings.logMode === 'off') return;
    
    const entry: LogEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      projectName: pn,
      model: modelName,
      depth,
      form: f,
      ...(stgSettings.logMode === 'all' ? { query: q, results: res } : { results: res })
    };
    
    const updated = [entry, ...logs].slice(0, 200);
    setLogs(updated);
    saveLogs(updated);
  }, [logs, stgSettings]);

  const deleteLog = useCallback((id: string) => {
    const u = logs.filter(l => l.id !== id);
    setLogs(u);
    saveLogs(u);
  }, [logs]);

  const deleteAllLogs = useCallback(() => {
    if (!window.confirm('全ログを削除しますか？')) return;
    setLogs([]);
    saveLogs([]);
  }, []);

  const importLogs = useCallback((data: any) => {
    const arr = Array.isArray(data) ? data : [data];
    const merged = [...arr.filter(d => d.id && d.timestamp), ...logs];
    const unique = [...new Map(merged.map(x => [x.id, x])).values()]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 500);
      
    setLogs(unique);
    saveLogs(unique);
  }, [logs]);

  return {
    logs,
    stgSettings,
    showLogs,
    setShowLogs,
    saveLog,
    deleteLog,
    deleteAllLogs,
    importLogs,
    updateSettings
  };
};
