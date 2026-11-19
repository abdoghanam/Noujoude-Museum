import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import type { Locale } from "@/domain/locale";
import { type RouteKey, isValidSlug } from "@/domain/routes";
import { PageShell } from "@/ui/page-shell";
import { State } from "@/ui/state";
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
  /**
   * The route's media slots, built by the page from `src/lib/server/media/slots.ts`. They arrive as
   * children rather than being resolved here because this component is in `src/ui/`, which is inside the
   * eslint client-boundary scope and reads nothing from disk.
   */
  readonly children?: ReactNode;
}

export function DetailPage({
  route,
  locale,
  slug,
  kind,
  children,
}: DetailPageProps) {
  const candidate = typeof slug === "string" ? slug : undefined;
  if (!isValidSlug(candidate)) notFound();

  return (
    <PageShell route={route} locale={locale}>
      <State
        kind="empty"
        title={`No ${kind} records published`}
        description={`The identifier ${candidate ?? ""} resolves to nothing; this is an empty state, not a missing asset.`}
      >
        <p className={styles.withheld} lang="en">
          Owner-supplied records, rights and approvals are required before any
          {` ${kind} `} may be published. Until then this page renders structure
          only.
        </p>
      </State>
      {children}
    </PageShell>
  );
}
