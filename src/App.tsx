import { Heading, Text } from '@ninna-ui/primitives';
import { SimpleGrid } from '@ninna-ui/layout';
import { MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from './components/Card';
import { PresetSelect } from './components/PresetSelect';
import { SearchBar } from './components/SearchBar';
import { ThemeToggle } from './components/ThemeToggle';
import { usePreset } from './hooks/usePreset';
import { useTheme } from './hooks/useTheme';
import { checkReachability, fetchDomains, type DomainCard } from './lib/parseRouters';

const POLL_INTERVAL_MS = 20_000;

function App() {
  const { mode, setMode } = useTheme();
  const { preset, setPreset } = usePreset();
  const [domains, setDomains] = useState<DomainCard[] | null>(null);
  const [reachable, setReachable] = useState<Record<string, boolean>>({});
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

        const online = await checkReachability(result.map((d) => d.domain));
        if (cancelled) return;
        setReachable(online);
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
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Text
              as="p"
              size="xs"
              weight="semibold"
              className="font-data uppercase tracking-widest text-base-content/40"
            >
              Traefik service directory
            </Text>
            <Heading as="h1" size="3xl" weight="bold" className="mt-1">
              Dashboard
            </Heading>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <SearchBar value={query} onChange={setQuery} />
            </div>
            <PresetSelect preset={preset} onChange={setPreset} />
            <ThemeToggle mode={mode} onChange={setMode} />
          </div>
        </header>

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
          <>
            <SimpleGrid columns={4} gap="4">
              {filtered.map((d) => (
                <Card
                  key={d.domain}
                  domain={d.domain}
                  service={d.service}
                  online={reachable[d.domain]}
                />
              ))}
            </SimpleGrid>

            <div className="mt-6 flex items-center gap-1.5 text-base-content/40">
              <MapPin size={14} strokeWidth={2} />
              <Text as="p" size="xs" className="font-data">
                {query.trim()
                  ? `${filtered.length} of ${domains?.length ?? 0} services matched`
                  : `${domains?.length ?? 0} service${domains?.length === 1 ? '' : 's'} auto-discovered via Traefik`}
              </Text>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
