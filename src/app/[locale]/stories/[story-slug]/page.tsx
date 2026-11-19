import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { DetailPage } from "@/ui/detail-page";

/**
 * One row of the §4.2 canonical route table. Locale prefixing is mandatory (line 408), so the page
 * reads `locale` from its own segment and renders the shell the registry defines. No editorial
 * copy: the Owner has supplied none, and §6.1 forbids filling space with fabricated content.
 * The media band comes from the usage map and the register, and the gate is armed as of
 * 4 November 2026: a slot renders as an image exactly when its asset is cleared, approved,
 * published and servable, and as an explicit withheld state otherwise. The Owner's declaration
 * of that date cleared and approved all 82 register rows, and the publication register names 46
 * of them; `src/ui/media-slot.tsx` still draws no pixel unless the gate, the served copy, the
 * alt text and the measured dimensions are all present, so a page says which surface has nothing
 * servable rather than showing a reader none.
 */

const ROUTE: RouteKey = "story-detail";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function StoryDetailPage({
  params,
}: {
  readonly params: Promise<{
    readonly locale?: string;
    readonly "story-slug": string;
  }>;
}) {
  const { locale, "story-slug": slug } = await params;
  return (
    <DetailPage
      route={ROUTE}
      locale={resolveLocale(locale)}
      slug={slug}
      kind="story"
    >
      <MediaSlotGroup
        views={slotViewsFor(ROUTE, resolveLocale(locale), slug)}
      />
    </DetailPage>
  );
}
