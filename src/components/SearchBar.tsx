import { Input, InputGroup } from '@ninna-ui/forms';
import { Search } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <InputGroup startElement={<Search size={16} strokeWidth={2} />} className="w-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter by domain or service…"
        fullWidth
        clearable
        onClear={() => onChange('')}
      />
    </InputGroup>
  );
}
