import { Card as NinnaCard } from '@ninna-ui/data-display';
import { Badge, LinkBox, LinkOverlay } from '@ninna-ui/primitives';
import { Favicon } from './Favicon';
import type { DomainCard } from '../lib/parseRouters';

export function Card({ domain, service }: DomainCard) {
  const provider = service.split('@')[1];

  return (
    <LinkBox className="group block">
      <NinnaCard
        variant="elevated"
        color="primary"
        className="relative flex aspect-square w-full flex-col items-center justify-center gap-3 p-4 text-center transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-xl"
      >
        {provider && (
          <Badge
            color="neutral"
            size="xs"
            variant="soft"
            className="absolute right-2 top-2 font-data"
          >
            {provider}
          </Badge>
        )}

        <Favicon domain={domain} />

        <NinnaCard.Body className="min-w-0 p-0">
          <NinnaCard.Title className="truncate font-data text-sm font-medium">
            <LinkOverlay href={`https://${domain}`} external>
              {domain}
            </LinkOverlay>
          </NinnaCard.Title>
          <NinnaCard.Description className="truncate font-data text-xs text-base-content/50">
            {service}
          </NinnaCard.Description>
        </NinnaCard.Body>
      </NinnaCard>
    </LinkBox>
  );
}
