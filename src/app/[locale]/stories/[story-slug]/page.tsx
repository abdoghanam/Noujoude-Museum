import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { DetailPage } from "@/ui/detail-page";

/**
 * One row of the §4.2 canonical route table. Locale prefixing is mandatory (line 408), so the page
 * reads `locale` from its own segment and renders the shell the registry defines. No editorial
 * copy: the Owner has supplied none, and §6.1 forbids filling space with fabricated content.
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
    />
  );
}
