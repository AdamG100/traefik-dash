import { Card as NinnaCard } from '@ninna-ui/data-display';
import { LinkBox, LinkOverlay } from '@ninna-ui/primitives';
import { Favicon } from './Favicon';
import type { DomainCard } from '../lib/parseRouters';

function formatServiceName(service: string): string {
  return service
    .split('@')[0]
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function Card({ domain, service, online }: DomainCard & { online?: boolean }) {
  return (
    <LinkBox className="group block">
      <NinnaCard
        variant="elevated"
        color="primary"
        className="relative flex w-full items-center gap-3 p-4 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-xl"
      >
        <span
          aria-hidden
          title={online === undefined ? 'Checking…' : online ? 'Online' : 'Unreachable'}
          className={`absolute right-3 top-3 h-2 w-2 rounded-full ${
            online ? 'bg-success' : 'bg-base-content/30'
          }`}
        />

        <Favicon domain={domain} service={service} />

        <NinnaCard.Body className="min-w-0 flex-1 p-0">
          <NinnaCard.Title className="truncate font-data text-sm font-semibold">
            <LinkOverlay href={`https://${domain}`} external>
              {formatServiceName(service)}
            </LinkOverlay>
          </NinnaCard.Title>
          <NinnaCard.Description className="truncate font-data text-xs text-primary/70">
            {domain}
          </NinnaCard.Description>
        </NinnaCard.Body>
      </NinnaCard>
    </LinkBox>
  );
}
