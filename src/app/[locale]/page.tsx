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

export default async function HomePage({ params }: HomePageProps) {
  const { locale: segment } = await params;
  const locale: Locale = segment === "ar" ? "ar" : "en";
  const museumEntrance = buildPath(locale, "the-museum");

  return (
    <PageShell route="home" locale={locale}>
      {/* Hero / Museum Entrance */}
      <div className={pageStyles.hero}>
        <div className={pageStyles.heroContent}>
          <p className={pageStyles.heroEyebrow}>Noujoude</p>
          <Heading level={1} className={pageStyles.heroTitle}>
            More than a collection... it&apos;s a story.
          </Heading>
          <Text variant="secondary" className={pageStyles.heroSubtitle}>
            A bilingual digital heritage museum preserving and presenting
            cultural objects, collections, and the stories they carry.
          </Text>
          {museumEntrance === null ? null : (
            <a className={pageStyles.heroCta} href={museumEntrance.path}>
              Enter the Museum
            </a>
          )}
        </div>
        <MediaSlotGroup views={slotViewsFor("home", locale)} />
      </div>

      {/* Required sections in specified order */}
      <div className={pageStyles.sections}>
        {HOME_SECTIONS.map((section) => {
          if (section.route === "home") return null;
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
              {section.route === null ? (
                <State
                  kind="empty"
                  title="Closing Invitation"
                  description="Contact the museum to learn more."
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