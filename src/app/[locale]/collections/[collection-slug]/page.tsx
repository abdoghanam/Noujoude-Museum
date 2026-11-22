import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { DetailPage } from "@/ui/detail-page";
import { MuseumScene } from "@/ui/museum-scene";

import { State } from "@/ui/state";

const ROUTE: RouteKey = "collection-detail";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function CollectionDetailPage({
  params,
}: {
  readonly params: Promise<{
    readonly locale?: string;
    readonly "collection-slug": string;
  }>;
}) {
  const { locale, "collection-slug": slug } = await params;
  const resolved = resolveLocale(locale);

  return (
    <DetailPage
      route={ROUTE}
      locale={resolved}
      slug={slug}
      kind="collection"
    >
      <MuseumScene scene="gallery" title="Collection Exhibition">
        <div className="image-reveal">
          <MediaSlotGroup
            views={slotViewsFor(ROUTE, resolved, slug)}
          />
        </div>
        <State
          kind="empty"
          title="No collection records published"
          description="Title, subtitle, description, country and period context, cover image, published artifacts, related stories, curator note and related collections are Owner inputs. Until supplied, this page renders its structure only."
        />
      </MuseumScene>
    </DetailPage>
  );
}