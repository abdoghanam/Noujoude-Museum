import type { Locale } from "@/domain/locale";
import { buildPath } from "@/domain/routes";
import pageStyles from "@/app/[locale]/page.module.css";
import shellStyles from "@/ui/page-shell.module.css";
import { PageShell } from "@/ui/page-shell";

/**
 * The entrance. §6.1 (lines 542 onward) fixes the eight required sections and their order, the
 * hero action, and the two rules that decide everything below: "Featured content is real, approved,
 * and linked correctly" and "Empty or unavailable sections do not render fabricated counts or
 * objects".
 *
 * No published records exist, no asset is rights-cleared, and the Owner has supplied no tagline or
 * institutional statement, so every content section renders as its own labelled empty state. The
 * section order and the hero action are real; the content is not, and says so.
 */

interface HomePageProps {
  readonly params: Promise<{ locale?: string }>;
}

const SECTION_ORDER = [
  "Hero / Museum Entrance",
  "Institutional Introduction",
  "The Worlds",
  "Featured Collections",
  "Selected Artifacts",
  "Stories",
  "AI Curator Introduction",
  "Closing Invitation",
] as const;

const EMPTY_STATE =
  "No published record is connected to this section, and no cleared imagery exists; nothing is counted, captioned or invented here.";

export default async function HomePage({ params }: HomePageProps) {
  const { locale: segment } = await params;
  const locale: Locale = segment === "ar" ? "ar" : "en";
  const museumEntrance = buildPath(locale, "the-museum");

  return (
    <PageShell route="home" locale={locale}>
      <div className={pageStyles.sections}>
        <section aria-labelledby="hero-heading">
          <h2 id="hero-heading">{SECTION_ORDER[0]}</h2>
          <p>
            The approved monogram, the primary tagline and the introductory
            statement are Owner inputs and have not been supplied, so the hero
            renders its structure only.
          </p>
          {museumEntrance === null ? null : (
            <a className={shellStyles.cta} href={museumEntrance.path}>
              Enter the Museum
            </a>
          )}
        </section>
        {SECTION_ORDER.slice(1).map((title) => (
          <section
            key={title}
            aria-labelledby={`section-${title.replace(/\W+/g, "-")}`}
          >
            <h2
              className={pageStyles.sectionTitle}
              id={`section-${title.replace(/\W+/g, "-")}`}
            >
              {title}
            </h2>
            <ul className={pageStyles.slotList}>
              <li className={shellStyles.slot}>{EMPTY_STATE}</li>
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
