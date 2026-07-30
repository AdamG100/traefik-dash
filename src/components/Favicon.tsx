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

// The real favicon is fetched via our own server (/favicon-proxy) rather
// than requested directly by the browser: some proxied services sit behind
// HTTP Basic Auth, and a client-side request to those triggers the browser's
// native login prompt (a WWW-Authenticate challenge does this for <img>
// requests same as any other, regardless of credentials mode). Google's
// s2/favicons service was tried as a further fallback, but it can't reach
// these internal-only domains and returns broken/generic results.
const faviconUrl = (domain: string) => `/favicon-proxy?domain=${encodeURIComponent(domain)}`;

// Probes the URL with an off-DOM Image() so the visible element is always
// Ninna's Avatar (consistent ring/shape/sizing throughout), rather than
// swapping between a raw <img> and Avatar depending on load state.
function useResolvedFavicon(domain: string) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);

    const url = faviconUrl(domain);
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setSrc(url);
    };
    img.onerror = () => {
      if (!cancelled) setSrc('');
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [domain]);

  return src;
}

export function Favicon({ domain }: { domain: string }) {
  const src = useResolvedFavicon(domain);

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
