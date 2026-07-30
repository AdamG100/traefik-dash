import { useEffect, useState } from 'react';

export type Preset = 'default' | 'ocean' | 'forest' | 'sunset' | 'minimal';

export const PRESETS: { value: Preset; label: string }[] = [
  { value: 'default', label: 'Default — Electric Purple' },
  { value: 'ocean', label: 'Ocean — Deep Blue' },
  { value: 'forest', label: 'Forest — Emerald' },
  { value: 'sunset', label: 'Sunset — Warm Orange' },
  { value: 'minimal', label: 'Minimal — Monochrome' },
];

const STORAGE_KEY = 'traefik-dashboard-preset';

function getStoredPreset(): Preset {
  const stored = localStorage.getItem(STORAGE_KEY);
  return PRESETS.some((p) => p.value === stored) ? (stored as Preset) : 'ocean';
}

export function usePreset() {
  const [preset, setPreset] = useState<Preset>(getStoredPreset);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preset);
    document.documentElement.dataset.theme = preset;
  }, [preset]);

  return { preset, setPreset };
}
