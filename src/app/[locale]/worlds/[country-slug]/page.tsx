import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { DetailPage } from "@/ui/detail-page";
import { MuseumScene } from "@/ui/museum-scene";

import { State } from "@/ui/state";

const ROUTE: RouteKey = "world-detail";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function CountryDetailPage({
  params,
}: {
  readonly params: Promise<{
    readonly locale?: string;
    readonly "country-slug": string;
  }>;
}) {
  const { locale, "country-slug": slug } = await params;
  const resolved = resolveLocale(locale);

  return (
    <DetailPage
      route={ROUTE}
      locale={resolved}
      slug={slug}
      kind="country"
    >
      <MuseumScene scene="gallery" title={`${slug} — Country World`}>
        <div className="country-enter">
          <MediaSlotGroup
            views={slotViewsFor(ROUTE, resolved, slug)}
          />
        </div>
        <State
          kind="empty"
          title="No country records published"
          description="Curatorial introduction, featured collections, featured artifacts, stories, curator perspective and related exploration are Owner inputs. Until supplied, this page renders its structure only."
        />
      </MuseumScene>
    </DetailPage>
  );
}