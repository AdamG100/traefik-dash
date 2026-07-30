import { Heading, Text } from '@ninna-ui/primitives';
import { SimpleGrid } from '@ninna-ui/layout';
import { useEffect, useMemo, useState } from 'react';
import { Card } from './components/Card';
import { PresetSelect } from './components/PresetSelect';
import { SearchBar } from './components/SearchBar';
import { ThemeToggle } from './components/ThemeToggle';
import { usePreset } from './hooks/usePreset';
import { useTheme } from './hooks/useTheme';
import { fetchDomains, type DomainCard } from './lib/parseRouters';

const POLL_INTERVAL_MS = 20_000;

function App() {
  const { mode, setMode } = useTheme();
  const { preset, setPreset } = usePreset();
  const [domains, setDomains] = useState<DomainCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchDomains();
        if (cancelled) return;
        setDomains(result);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load routers');
      }
    }

    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const filtered = useMemo(() => {
    if (!domains) return null;
    const q = query.trim().toLowerCase();
    if (!q) return domains;
    return domains.filter(
      (d) =>
        d.domain.toLowerCase().includes(q) || d.service.toLowerCase().includes(q),
    );
  }, [domains, query]);

  return (
    <div className="min-h-screen bg-base-50 text-base-content">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Text
              as="p"
              size="xs"
              weight="semibold"
              className="font-data uppercase tracking-widest text-base-content/40"
            >
              Traefik service directory
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <PresetSelect preset={preset} onChange={setPreset} />
            <ThemeToggle mode={mode} onChange={setMode} />
          </div>
        </header>

        <SearchBar value={query} onChange={setQuery} />

        <Text as="p" size="xs" className="mb-6 mt-3 font-data text-base-content/40">
          {error
            ? 'connection error'
            : domains === null
              ? 'loading…'
              : `${filtered?.length ?? 0} of ${domains.length} services`}
        </Text>

        {error && (
          <Heading as="h2" size="lg" color="danger">
            Couldn't reach Traefik: {error}
          </Heading>
        )}

        {!error && domains === null && (
          <Heading as="h2" size="lg" color="neutral">
            Loading…
          </Heading>
        )}

        {!error && filtered !== null && filtered.length === 0 && (
          <Heading as="h2" size="lg" color="neutral">
            {domains && domains.length > 0
              ? 'No services match your search.'
              : 'No routers found.'}
          </Heading>
        )}

        {filtered !== null && filtered.length > 0 && (
          <SimpleGrid columns={4} gap="4">
            {filtered.map((d) => (
              <Card key={d.domain} domain={d.domain} service={d.service} />
            ))}
          </SimpleGrid>
        )}
      </div>
    </div>
  );
}

export default App;
