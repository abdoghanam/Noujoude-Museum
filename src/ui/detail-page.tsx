import { notFound } from "next/navigation";

import type { Locale } from "@/domain/locale";
import { type RouteKey, isValidSlug } from "@/domain/routes";
import { PageShell } from "@/ui/page-shell";
import styles from "@/ui/detail-page.module.css";

/**
 * The shared body of the four §4.2 detail routes (`worlds/[country-slug]`,
 * `collections/[collection-slug]`, `artifacts/[artifact-slug]`, `stories/[story-slug]`).
 *
 * Two rules decide its shape. The slug arrives straight from the URL, so it is untrusted input at a
 * public boundary (Technology & Security Standard §2.2, §5) and is validated before it is echoed or
 * used in any path — an invalid slug produces 404, never a rendered identifier. And there is no
 * record store yet: Phase 2 owns migrations (`docs/IMPLEMENTATION_PLAN.md` §4B.1, row 4), so a
 * well-formed slug that matches nothing must be stated as an honest empty state rather than
 * resolved to an invented record (Master Spec §6.1, "never use fabricated content to fill space").
 */

export interface DetailPageProps {
  readonly route: RouteKey;
  readonly locale: Locale;
  /** The raw dynamic segment as Next supplies it. */
  readonly slug: string | string[] | undefined;
  /** What kind of record the route would have served, from the §4.2 Purpose column. */
  readonly kind: "country" | "collection" | "artifact" | "story";
}

export function DetailPage({ route, locale, slug, kind }: DetailPageProps) {
  const candidate = typeof slug === "string" ? slug : undefined;
  if (!isValidSlug(candidate)) notFound();

  return (
    <PageShell route={route} locale={locale}>
      <p className={styles.identity}>
        No <span className={styles.kind}>{kind}</span> records have been
        published, so the identifier{" "}
        <code>
          {/* Rendered as text: React escapes it, and it never reaches a query, a path or markup. */}
          {candidate}
        </code>{" "}
        resolves to nothing. This is an empty state, not a missing asset.
      </p>
    </PageShell>
  );
}
