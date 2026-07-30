import { Avatar } from '@ninna-ui/primitives';
import type { Color } from '@ninna-ui/core';
import { useEffect, useState } from 'react';

// Semantic-sounding colors (success/danger) are skipped so a fallback swatch
// never reads as an accidental status indicator.
const FALLBACK_COLORS: Color[] = ['primary', 'secondary', 'accent', 'info', 'warning'];

function colorFromDomain(domain: string): Color {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

// Curated icon set (same one Homarr/Homepage/Dashy use) keyed by app slug,
// served from a public, unauthenticated CDN — tried before the real site
// favicon. Many self-hosted admin tools sit behind Authentik's forwardAuth,
// which intercepts *any* unauthenticated request to the domain, including
// ours (server-side or client-side) — so favicon.ico just redirects to the
// login page instead of returning the icon, no matter who asks for it.
const DASHBOARD_ICONS_CDN = 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg';

// Maps docker/compose service naming to this icon set's slugs where they
// don't already match directly (checked against the CDN by hand).
const ICON_ALIASES: Record<string, string> = {
  pihole: 'pi-hole',
  wgeasy: 'wireguard',
  codeserver: 'vscode',
  visualstudiocode: 'vscode',
};

function iconSlugCandidates(service: string): string[] {
  const base = service.split('@')[0].toLowerCase();
  const slugs = new Set<string>();
  const add = (s: string) => slugs.add(ICON_ALIASES[s] ?? s);

  add(base);
  base.split('-').filter(Boolean).forEach(add);

  return [...slugs];
}

// The real favicon (last resort before the generated initial) is fetched
// via our own server (/favicon-proxy) rather than requested directly by the
// browser, since a direct client-side request to an auth-protected domain
// would trigger the browser's native login prompt on a 401 challenge.
function candidateUrls(domain: string, service: string): string[] {
  return [
    ...iconSlugCandidates(service).map((slug) => `${DASHBOARD_ICONS_CDN}/${slug}.svg`),
    `/favicon-proxy?domain=${encodeURIComponent(domain)}`,
  ];
}

// Probes each candidate URL with an off-DOM Image() so the visible element
// is always Ninna's Avatar (consistent ring/shape/sizing throughout), rather
// than swapping between a raw <img> and Avatar depending on fallback step.
function useResolvedFavicon(domain: string, service: string) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);

    async function resolve() {
      for (const url of candidateUrls(domain, service)) {
        const loaded = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        if (cancelled) return;
        if (loaded) {
          setSrc(url);
          return;
        }
      }
      if (!cancelled) setSrc('');
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [domain, service]);

  return src;
}

export function Favicon({ domain, service }: { domain: string; service: string }) {
  const src = useResolvedFavicon(domain, service);

  return (
    <Avatar
      src={src || undefined}
      name={domain}
      shape="square"
      radius="md"
      size="lg"
      showRing
      color={colorFromDomain(domain)}
    />
  );
}
