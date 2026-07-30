import { Select, SelectItem } from '@ninna-ui/forms';
import { PRESETS, type Preset } from '../hooks/usePreset';

export function PresetSelect({
  preset,
  onChange,
}: {
  preset: Preset;
  onChange: (preset: Preset) => void;
}) {
  return (
    <Select
      aria-label="Theme preset"
      value={preset}
      onValueChange={(value) => onChange(value as Preset)}
      size="sm"
      variant="outline"
    >
      {PRESETS.map((p) => (
        <SelectItem key={p.value} value={p.value}>
          {p.label}
        </SelectItem>
      ))}
    </Select>
  );
}
