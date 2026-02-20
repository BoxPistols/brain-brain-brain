import { useState, useCallback, useRef } from 'react';
import { LogEntry, Settings, BrainstormForm, AIResults } from '../types';
import { loadLogs, saveLogs, loadSettings, saveSettings } from '../utils/storage';

export const useLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => loadLogs());
  const [stgSettings, setStgSettings] = useState<Settings>(() => loadSettings());
  const [showLogs, setShowLogs] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback((data: LogEntry[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!saveLogs(data)) {
        console.warn('localStorage quota exceeded — logs may not be saved');
      }
    }, 300);
  }, []);

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
    debouncedSave(updated);
  }, [logs, stgSettings, debouncedSave]);

  const deleteLog = useCallback((id: string) => {
    const u = logs.filter(l => l.id !== id);
    setLogs(u);
    debouncedSave(u);
  }, [logs, debouncedSave]);

  const deleteAllLogs = useCallback(() => {
    if (!window.confirm('全ログを削除しますか？')) return;
    setLogs([]);
    saveLogs([]);
  }, []);

  const importLogs = useCallback((data: unknown) => {
    const arr = Array.isArray(data) ? data : [data];
    const valid = arr.filter((d): d is LogEntry => d != null && typeof d === 'object' && 'id' in d && 'timestamp' in d);
    const merged = [...valid, ...logs];
    const unique = [...new Map(merged.map(x => [x.id, x])).values()]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 200);

    setLogs(unique);
    if (!saveLogs(unique)) {
      alert('ストレージ容量が不足しています。古いログを削除してください。');
    }
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
