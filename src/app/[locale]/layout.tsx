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
  slotOutcome,
  slotViewsFor,
} from "@/lib/server/media/slots";
import { MediaSlot } from "@/ui/media-slot";
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
   * No public record of this build has been approved. Asset *use* was authorised by the Owner on 4 November
   * 2026 (see `docs/OWNER_ASSET_AUTHORIZATION_2026-11-04.md`), which is a different axis from what this flag
   * is about: the pages still carry no editorial records, no inventory and no institution facts — RB-04,
   * DEC-INV-001 and the Owner-input register are open on exactly those — and indexing a shell would publish
   * claims the Owner has not made. The flag flips when approved content replaces the shell, not when imagery
   * starts rendering.
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
  /*
    §6.1 required-content item 1 is an "approved monogram or wordmark", and the usage map binds the catalog's
    `Header` surface to this band. Whether the band shows the mark or the name in text is the slot's answer, not
    a constant: `slotOutcome` returns "image" only when the rights gate, the served copy, the alt text and the
    measured pixels all agree, and anything else falls back to the text wordmark. The band still does not print
    a refusal sentence or name the asset that would have filled it (SR-02) — the same hook below carries the
    state, and `src/lib/server/media/slots.test.ts` asserts the reason where it belongs.
  */
  const headerViews = slotViewsFor("global", locale);
  const headerMark = headerViews.find(
    (view) => slotOutcome(view) === "image",
  );

  return (
    <html lang={locale} dir={directionOf(locale)}>
      <body>
        <a className={styles.skip} href="#main">
          Skip to content
        </a>
        <header className={styles.siteHeader}>
          {headerMark === undefined ? (
            <p className={styles.wordmark} data-slot="approved-mark-pending">
              {SITE_NAME}
            </p>
          ) : (
            <p className={styles.markBand} data-slot="approved-mark">
              <MediaSlot facts={headerMark.facts} record={headerMark.record} />
              <span className={styles.markName}>{SITE_NAME}</span>
            </p>
          )}
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
