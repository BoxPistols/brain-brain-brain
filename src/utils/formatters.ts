import { SEEDS } from '../constants/mockData';

export const autoN = (s: string, g: string): string => {
  const h = `${s}${g}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `${SEEDS[h % SEEDS.length]}-${((h * 7) % 900) + 100}`;
};

export const ll = (v: string): string =>
  ({ High: '高', Medium: '中', Low: '低' }[v] || v);

export const priorityC = (v: string): string =>
  ({
    High: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700/40',
    Medium: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/40',
    Low: 'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600/40'
  }[v] || 'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 border-slate-200');

export const effortC = (v: string): string =>
  ({
    High: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/40',
    Medium: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/40',
    Low: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/40'
  }[v] || 'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 border-slate-200');

export const impactC = (v: string): string =>
  ({
    High: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/40',
    Medium: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700/40',
    Low: 'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600/40'
  }[v] || 'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 border-slate-200');
