import type { ReactNode } from "react";

import type { Locale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import styles from "@/ui/page-shell.module.css";

/**
 * The shared shell every canonical route renders while the Owner's content is still outstanding.
 *
 * It exists so that "Initialize application in `src/`" (Master Execution Directive §14, line 250)
 * produces a navigable application rather than a directory, and so that §6.1's rule — "never use
 * fabricated content to fill space" — is enforced structurally: a route can only render the label
 * and purpose the baseline itself supplies, and the notice below, unless a later phase passes real
 * records in as children.
 */

export interface PageShellProps {
  readonly route: RouteKey;
  readonly locale: Locale;
  readonly children?: ReactNode;
}

export function PageShell({ route, locale, children }: PageShellProps) {
  const definition = routeDefinition(route);
  return (
    <section className={styles.shell} data-route={definition.key}>
      <header className={styles.head}>
        <h1 className={styles.title}>{definition.title}</h1>
        <p className={styles.purpose}>{definition.purpose}</p>
      </header>
      {children}
      <p className={styles.notice} data-state="unpopulated">
        Structural shell — this route holds no published records yet, and
        editorial copy for {locale === "ar" ? "Arabic" : "English"} has not been
        supplied. Nothing on this page is release content, and the page is
        marked non-indexable.
      </p>
    </section>
  );
}
