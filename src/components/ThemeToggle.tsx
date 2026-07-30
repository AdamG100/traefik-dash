import { IconButton } from '@ninna-ui/primitives';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';

const OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'system', label: 'System', icon: Monitor },
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
];

export function ThemeToggle({
  mode,
  onChange,
}: {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-base-300 bg-base-100 p-1">
      {OPTIONS.map(({ mode: optionMode, label, icon: Icon }) => (
        <IconButton
          key={optionMode}
          aria-label={label}
          icon={<Icon size={15} strokeWidth={2} />}
          variant={mode === optionMode ? 'solid' : 'ghost'}
          color={mode === optionMode ? 'primary' : 'neutral'}
          size="sm"
          radius="full"
          onClick={() => onChange(optionMode)}
        />
      ))}
    </div>
  );
}
