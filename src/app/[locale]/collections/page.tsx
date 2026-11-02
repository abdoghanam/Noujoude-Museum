import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { PageShell } from "@/ui/page-shell";

/**
 * One row of the §4.2 canonical route table. Locale prefixing is mandatory (line 408), so the page
 * reads `locale` from its own segment and renders the shell the registry defines. No editorial
 * copy: the Owner has supplied none, and §6.1 forbids filling space with fabricated content.
 * The media band comes from the usage map and the register, and every slot in it is a refusal while
 * RB-01 stands: `src/ui/media-slot.tsx` draws no pixels for an asset the gate has not cleared, so a
 * page states which surface has nothing servable instead of showing a reader none.
 */

const ROUTE: RouteKey = "collections";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function CollectionsPage({
  params,
}: {
  readonly params: Promise<{ readonly locale?: string }>;
}) {
  const { locale } = await params;
  const resolved = resolveLocale(locale);
  return (
    <PageShell route={ROUTE} locale={resolved}>
      <MediaSlotGroup views={slotViewsFor(ROUTE, resolved)} />
    </PageShell>
  );
}
