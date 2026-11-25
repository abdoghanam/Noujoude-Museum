import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import shellStyles from "@/ui/page-shell.module.css";
import { PageShell } from "@/ui/page-shell";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";

const ROUTE: RouteKey = "search";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function SearchPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ readonly locale?: string }>;
  readonly searchParams: Promise<{ readonly q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const resolved = resolveLocale(locale);

  return (
    <PageShell route={ROUTE} locale={resolved}>
      <Heading level={1} className={shellStyles.title}>
        Search
      </Heading>
      <Text variant="secondary" className={shellStyles.subtitle}>
        Search across published museum content.
      </Text>

      <form action={`/${resolved}/search`} method="get" className={shellStyles.searchForm}>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search the museum..."
          className={shellStyles.searchInput}
          aria-label="Search the museum"
        />
        <button type="submit" className={shellStyles.searchButton}>
          Search
        </button>
      </form>

      {q ? (
        <div className={shellStyles.searchResults}>
          <Text variant="secondary">
            Searching for: {q}
          </Text>
          <p className={shellStyles.emptyState}>
            No published records match your query. Search indexes only published,
            approved, locale-eligible content.
          </p>
        </div>
      ) : (
        <p className={shellStyles.emptyState}>
          Enter a search term to discover museum content.
        </p>
      )}

      <MediaSlotGroup views={slotViewsFor(ROUTE, resolved)} />
    </PageShell>
  );
}