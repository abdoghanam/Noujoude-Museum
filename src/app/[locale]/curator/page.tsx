import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import shellStyles from "@/ui/page-shell.module.css";
import { PageShell } from "@/ui/page-shell";

/**
 * One row of the §4.2 canonical route table. Locale prefixing is mandatory (line 408), so the page
 * reads `locale` from its own segment and renders the shell the registry defines. No editorial
 * copy: the Owner has supplied none, and §6.1 forbids filling space with fabricated content.
 */

const ROUTE: RouteKey = "curator";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function CuratorPage({
  params,
}: {
  readonly params: Promise<{ readonly locale?: string }>;
}) {
  const { locale } = await params;
  return (
    <PageShell route={ROUTE} locale={resolveLocale(locale)}>
      <p className={shellStyles.slot}>
        {
          "No model, retrieval index or prompt boundary is configured for the AI Curator, and Phase 5 owns that work. This page does not claim that it answers."
        }
      </p>
    </PageShell>
  );
}
