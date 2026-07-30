import { useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'traefik-dashboard-mode';

function getStoredMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
}

// Ninna UI's preset CSS keys dark/light styling off classes on <html>:
// class="dark" forces dark, class="light" forces light, no class follows
// prefers-color-scheme automatically.
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (mode !== 'system') root.classList.add(mode);
  }, [mode]);

  return { mode, setMode };
}
