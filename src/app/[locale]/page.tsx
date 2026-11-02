import type { Locale } from "@/domain/locale";
import { buildPath } from "@/domain/routes";
import { HOME_SECTIONS } from "@/lib/media/usage-map";
import { slotViewsFor } from "@/lib/server/media/slots";
import pageStyles from "@/app/[locale]/page.module.css";
import shellStyles from "@/ui/page-shell.module.css";
import { MediaSlotGroup } from "@/ui/media-slot";
import { PageShell } from "@/ui/page-shell";

/**
 * The entrance. §6.1 (lines 542 onward) fixes the eight required sections and their order, the hero
 * action, and the two rules that decide everything below: "Featured content is real, approved, and
 * linked correctly" and "Empty or unavailable sections do not render fabricated counts or objects".
 *
 * The section order and their targets are now measured rather than narrated. Each §6.1 section names the
 * canonical route it introduces, and the slots under it are the assets the catalog binds to that route —
 * `src/lib/media/usage-map.ts` answers the placement, `docs/ASSET_INVENTORY_AUDIT.csv` answers what the
 * asset is, and `src/ui/media-slot.tsx` answers whether it may be drawn. No asset clears the gate, so
 * every slot on this page is a refusal that says which check stopped it.
 *
 * That is the correct reading of "featured content is real, approved, and linked correctly": nothing here
 * is featured, because nothing here is approved, and the page says so per surface instead of leaving a
 * blank space that a reader cannot distinguish from an unfinished one.
 */

interface HomePageProps {
  readonly params: Promise<{ locale?: string }>;
}

const NO_RECORDS =
  "No published record is connected to this section, and no cleared imagery exists; nothing is counted, captioned or invented here.";

export default async function HomePage({ params }: HomePageProps) {
  const { locale: segment } = await params;
  const locale: Locale = segment === "ar" ? "ar" : "en";
  const museumEntrance = buildPath(locale, "the-museum");
  const contact = buildPath(locale, "contact");

  return (
    <PageShell route="home" locale={locale}>
      <div className={pageStyles.sections}>
        {HOME_SECTIONS.map((section) => {
          const views =
            section.route === null ? [] : slotViewsFor(section.route, locale);
          const anchor = section.title.replace(/\W+/g, "-");
          return (
            <section key={section.title} aria-labelledby={`section-${anchor}`}>
              <h2 className={pageStyles.sectionTitle} id={`section-${anchor}`}>
                {section.title}
              </h2>
              {section.route === "home" ? (
                <>
                  <p>
                    The approved monogram, the primary tagline and the
                    introductory statement are Owner inputs and have not been
                    supplied, so the hero renders its structure only.
                  </p>
                  {museumEntrance === null ? null : (
                    <a className={shellStyles.cta} href={museumEntrance.path}>
                      Enter the Museum
                    </a>
                  )}
                </>
              ) : null}
              {section.route === null ? (
                <>
                  <p>{NO_RECORDS}</p>
                  {contact === null ? null : (
                    <a className={shellStyles.cta} href={contact.path}>
                      Contact the Museum
                    </a>
                  )}
                </>
              ) : null}
              <MediaSlotGroup views={views} />
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
