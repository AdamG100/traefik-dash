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

const candidateUrls = (domain: string) => [
  `https://${domain}/favicon.ico`,
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
];

// Probes each candidate URL with an off-DOM Image() so the visible element
// is always Ninna's Avatar (consistent ring/shape/sizing throughout), rather
// than swapping between a raw <img> and Avatar depending on fallback step.
function useResolvedFavicon(domain: string) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);

    async function resolve() {
      for (const url of candidateUrls(domain)) {
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
