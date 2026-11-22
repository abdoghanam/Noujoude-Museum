import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { DetailPage } from "@/ui/detail-page";
import { MuseumScene } from "@/ui/museum-scene";

import { State } from "@/ui/state";

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
  const resolved = resolveLocale(locale);

  return (
    <DetailPage
      route={ROUTE}
      locale={resolved}
      slug={slug}
      kind="story"
    >
      <MuseumScene scene="archive" title="Story Gallery">
        <div className="archive-open">
          <MediaSlotGroup
            views={slotViewsFor(ROUTE, resolved, slug)}
          />
        </div>
        <State
          kind="empty"
          title="No story records published"
          description="Title, introduction, body, country associations, related collections and related artifacts are Owner inputs. Until supplied, this page renders its structure only."
        />
      </MuseumScene>
    </DetailPage>
  );
}