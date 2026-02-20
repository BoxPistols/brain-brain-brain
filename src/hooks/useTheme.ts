import { useState } from 'react';

const THEME_KEY = 'ai-brainstorm-theme';

const getInitialDark = (): boolean => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored !== null) return stored === 'dark';
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
};

const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  } catch {}
};

export const useTheme = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const d = getInitialDark();
    applyTheme(d);
    return d;
  });

  const toggleTheme = () => {
    setIsDark(d => {
      const next = !d;
      applyTheme(next);
      return next;
    });
  };

  return { isDark, toggleTheme };
};
