import type { Metadata } from "next";

import { type ReactNode } from "react";

import {
  DEFAULT_LOCALE,
  type Locale,
  directionOf,
  isLocale,
} from "@/domain/locale";
import { buildPath, primaryNavigation } from "@/domain/routes";
import { SITE_NAME } from "@/domain/site";
import {
  publicServingSummary,
  servingFooterSentence,
} from "@/lib/server/media/slots";
import styles from "@/ui/layout.module.css";
import "@/ui/styles/global.css";

/**
 * The locale root layout. §4.2 (line 408) makes the locale prefix mandatory and (line 428) fixes
 * the identifiers, so `lang` and `dir` are derived from the segment rather than set anywhere else:
 * one fact, one place, and an Arabic page cannot be rendered left-to-right by construction.
 *
 * Navigation comes from the same registry the unit tests assert (`src/domain/routes.test.ts`), so
 * a page and its navigation cannot disagree about which canonical routes exist.
 */

interface LocaleLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ locale?: string }>;
}

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Noujoude Digital Heritage Museum — bilingual English and Arabic heritage museum. Pre-publication structural shell.",
  /**
   * No public record of this build has been approved: 0 of 82 assets are cleared (B-06), brand
   * adoption is pending (BA-001, OD-16), and the pages carry no editorial content. Indexing a
   * shell would publish claims the Owner has not made, so the shell is explicitly non-indexable
   * and the flag flips when approved content replaces it.
   */
  robots: { index: false, follow: false },
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: segment } = await params;
  const locale: Locale = isLocale(segment) ? segment : DEFAULT_LOCALE;
  const navigation = primaryNavigation();
  const other = locale === "ar" ? "en" : "ar";
  /*
    Both numbers below are read from `docs/ASSET_INVENTORY_AUDIT.csv` through the media layer, on every
    request, which is the point: the footer used to assert "82 catalogued assets, 0 cleared for public
    serving" as typed prose. A sentence in a template cannot notice that a re-audit changed the register,
    and this page's claim is a release condition. `servingFooterSentence` builds the wording from the
    measurement, so the counts move when the measurement does — and
    `src/lib/server/media/slots.test.ts` calls it with figures the register does not have today and fails
    if the sentence and the register can ever disagree.
  */
  const serving = publicServingSummary();

  return (
    <html lang={locale} dir={directionOf(locale)}>
      <body>
        <a className={styles.skip} href="#main">
          Skip to content
        </a>
        <header className={styles.siteHeader}>
          {/*
            §6.1 required-content item 1 is an "approved monogram or wordmark". The usage map binds the
            catalog's `Header` surface to this band, the slot for it resolves to a refusal, and the mark is
            therefore shown as the name in text. The band says *that* it is pending, through the structural
            hook below and the footer's measured counts; it does not publish which gate stopped it or which
            catalogued asset would have filled it (SR-02) — the route's own refusals answer 404 with no
            reason for exactly that reason, and a page that named the reason and the id would undo it in
            markup. The reason is still computed and asserted where it belongs:
            `src/lib/server/media/slots.test.ts` calls `slotOutcome` directly.
          */}
          <p className={styles.wordmark} data-slot="approved-mark-pending">
            {SITE_NAME}
          </p>
          <nav aria-label="Primary" className={styles.primaryNav}>
            <ul className={styles.navList}>
              {navigation.map((item) => {
                const target = buildPath(locale, item.key);
                if (target === null) return null;
                return (
                  <li key={item.key}>
                    {/*
                      English labels only. Arabic navigation copy is editorial content the Owner has
                      not supplied (`docs/OWNER_INPUT_REGISTER.md`), and translating it here would be
                      inventing content; the label therefore declares its own language.
                    */}
                    <a href={target.path} lang="en">
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <p className={styles.utilities}>
            {/*
              §4.1 (line 404) puts search and language selection in the utility band. Same-page
              preservation on the switcher needs published-translation availability, which does not
              exist until Phase 2 connects records — so the switcher moves to the other locale's
              entrance, and `switchTarget()` in the registry holds the rule that will replace it.
            */}
            <a
              href={buildPath(locale, "search")?.path ?? `/${locale}/search`}
              lang="en"
            >
              Search
            </a>
            <a href={`/${other}`} lang={other}>
              {other === "ar" ? "العربية" : "English"}
            </a>
          </p>
        </header>
        <main id="main" className={styles.main}>
          {children}
        </main>
        <footer className={styles.siteFooter}>
          {/*
            `lang="en"` because the sentence is a structural statement about this build, not editorial
            content: §4.2 makes the shell bilingual, but Arabic copy is an Owner input that has not been
            supplied, and writing an Arabic translation here would be inventing content. Marked the way
            the navigation labels are marked, so an Arabic page does not read English text as Arabic.
          */}
          <p lang="en">{servingFooterSentence(serving)}</p>
        </footer>
      </body>
    </html>
  );
}
