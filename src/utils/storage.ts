import { LogEntry, Settings } from '../types';

export const STORE_KEY = 'ai-brainstorm-logs';
export const SETTINGS_KEY = 'ai-brainstorm-settings';

export const defaultSettings: Settings = { logMode: 'all', autoSave: true };

export const loadLogs = (): LogEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveLogs = (l: LogEntry[]): boolean => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(l));
    return true;
  } catch {
    return false;
  }
};

export const loadSettings = (): Settings => {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (s: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
};

export const exportJSON = (data: unknown, fn: string): void => {
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const u = URL.createObjectURL(b);
  Object.assign(document.createElement('a'), { href: u, download: fn }).click();
  URL.revokeObjectURL(u);
};
