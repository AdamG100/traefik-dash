export interface DomainCard {
  domain: string;
  service: string;
}

interface TraefikRouter {
  rule?: string;
  service?: string;
  provider?: string;
  name?: string;
}

const HOST_RE = /Host\(`([^`]+)`\)/g;

// Vite env override for local dev, where window.location.hostname won't
// match the real Traefik-routed domain the dashboard is deployed under.
const DASHBOARD_HOSTNAME =
  import.meta.env.VITE_DASHBOARD_HOSTNAME || window.location.hostname;

// Placeholder cards for previewing the design in `npm run dev` without a
// working Traefik connection. Only reachable in dev builds. Real vendor
// domains are used (rather than *.example.com) so the favicon fallback
// chain actually resolves real icons instead of Google's generic globe.
const MOCK_DOMAINS: DomainCard[] = [
  { domain: 'sonarr.tv', service: 'sonarr@docker' },
  { domain: 'radarr.video', service: 'radarr@docker' },
  { domain: 'plex.tv', service: 'plex@docker' },
  { domain: 'grafana.com', service: 'grafana@docker' },
  { domain: 'portainer.io', service: 'portainer@docker' },
  { domain: 'nextcloud.com', service: 'nextcloud@docker' },
  { domain: 'github.com', service: 'vaultwarden@docker' },
  { domain: 'pi-hole.net', service: 'pihole@docker' },
];

// Domains that should read as unreachable in the mock preview, so the
// offline dot state is visible without a live connection to check against.
const MOCK_OFFLINE_DOMAINS = new Set(['pi-hole.net']);

export async function fetchDomains(): Promise<DomainCard[]> {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_DATA === 'true') {
    return MOCK_DOMAINS;
  }

  const res = await fetch('/api/http/routers');
  if (!res.ok) {
    throw new Error(`Traefik API returned ${res.status}`);
  }

  const routers: TraefikRouter[] = await res.json();
  const seen = new Map<string, string>();

  for (const router of routers) {
    if (router.provider === 'internal' || !router.rule) continue;

    const service = router.service ?? router.name ?? 'unknown';
    for (const match of router.rule.matchAll(HOST_RE)) {
      const domain = match[1];
      if (domain === DASHBOARD_HOSTNAME) continue;
      if (!seen.has(domain)) seen.set(domain, service);
    }
  }

  return Array.from(seen, ([domain, service]) => ({ domain, service })).sort(
    (a, b) => a.domain.localeCompare(b.domain),
  );
}

// Checks whether each domain is actually reachable, via the server (so the
// browser never talks to the target domains directly — the same reasoning
// as the favicon proxy: some sit behind auth that would otherwise trigger a
// native browser login prompt on a client-side request).
export async function checkReachability(domains: string[]): Promise<Record<string, boolean>> {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_DATA === 'true') {
    return Object.fromEntries(domains.map((d) => [d, !MOCK_OFFLINE_DOMAINS.has(d)]));
  }

  if (domains.length === 0) return {};

  try {
    const res = await fetch('/status-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains }),
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}
