import type { Locale } from "@/domain/locale";
import { buildPath } from "@/domain/routes";
import { HOME_SECTIONS } from "@/lib/media/usage-map";
import { slotViewsFor } from "@/lib/server/media/slots";
import pageStyles from "@/app/[locale]/page.module.css";
import { MediaSlotGroup } from "@/ui/media-slot";
import { PageShell } from "@/ui/page-shell";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

interface HomePageProps {
  readonly params: Promise<{ locale?: string }>;
}

const NO_RECORDS =
  "No published record is connected to this section, and no cleared imagery exists; nothing is counted, captioned or invented here.";

export default async function HomePage({ params }: HomePageProps) {
  const { locale: segment } = await params;
  const locale: Locale = segment === "ar" ? "ar" : "en";
  const museumEntrance = buildPath(locale, "the-museum");

  return (
    <PageShell route="home" locale={locale}>
      <div className={pageStyles.hero}>
        <Heading level={1} className={pageStyles.heroTitle}>
          Noujoude
        </Heading>
        <Text variant="secondary" className={pageStyles.heroSubtitle}>
          More than a collection... it&apos;s a story.
        </Text>
        <p className={pageStyles.heroSubtitle}>
          The approved monogram, the primary tagline and the introductory
          statement are Owner inputs and have not been supplied, so the hero
          renders its structure only.
        </p>
        {museumEntrance === null ? null : (
          <a className={pageStyles.heroCta} href={museumEntrance.path}>
            Enter the Museum
          </a>
        )}
      </div>

      <div className={pageStyles.sections}>
        {HOME_SECTIONS.map((section) => {
          const views =
            section.route === null ? [] : slotViewsFor(section.route, locale);
          const anchor = section.title.replace(/\W+/g, "-");
          return (
            <section
              key={section.title}
              className={pageStyles.section}
              aria-labelledby={`section-${anchor}`}
            >
              <Heading
                level={2}
                className={pageStyles.sectionTitle}
                id={`section-${anchor}`}
              >
                {section.title}
              </Heading>
              {section.route === "home" ? null : null}
              {section.route === null ? (
                <State
                  kind="empty"
                  title="No records"
                  description={NO_RECORDS}
                />
              ) : null}
              <MediaSlotGroup views={views} />
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
