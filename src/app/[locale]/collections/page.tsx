import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { PageShell } from "@/ui/page-shell";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";
import styles from "@/app/[locale]/collections/page.module.css";
import wallStyles from "@/ui/exhibition-wall.module.css";

const ROUTE: RouteKey = "collections";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

const CATEGORIES = [
  { slug: "stamps", name: "Stamps", state: "In Preparation" },
  {
    slug: "first-day-covers",
    name: "First Day Covers",
    state: "In Preparation",
  },
  { slug: "coins", name: "Coins", state: "In Preparation" },
  { slug: "documents", name: "Documents", state: "In Preparation" },
  { slug: "letters", name: "Letters", state: "In Preparation" },
  { slug: "souvenirs", name: "Souvenirs", state: "In Preparation" },
  {
    slug: "heritage-objects",
    name: "Heritage Objects",
    state: "In Preparation",
  },
  { slug: "artifacts", name: "Artifacts", state: "In Preparation" },
];

export default async function CollectionsPage({
  params,
}: {
  readonly params: Promise<{ readonly locale?: string }>;
}) {
  const { locale } = await params;
  const resolved = resolveLocale(locale);

  return (
    <PageShell route={ROUTE} locale={resolved}>
      <section className={styles.header}>
        <Heading level={1} className={styles.title}>
          Collections
        </Heading>
        <Text variant="secondary" className={styles.subtitle}>
          Curated museum groupings by object type and curatorial meaning.
        </Text>
      </section>

      <div className={wallStyles.exhibitionWall}>
        <div className={wallStyles.wallSurface}>
          <div className={wallStyles.exhibitCluster}>
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={`/${resolved}/collections/${cat.slug}`}
                className={`${wallStyles.exhibitFrame} collection-card`}
              >
                <div className={wallStyles.exhibitImage}>
                  <MediaSlotGroup
                    views={slotViewsFor(
                      "collection-detail",
                      resolved,
                      cat.slug,
                    )}
                  />
                </div>
                <div className={wallStyles.exhibitLabel}>
                  <h3 className={wallStyles.exhibitTitle}>{cat.name}</h3>
                  <span className={wallStyles.exhibitMeta}>{cat.state}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.emptyState}>
        <State
          kind="empty"
          title="No collection records published"
          description="Collection records, curatorial explanations and related stories are Owner inputs. Until supplied, this directory renders its structure and bound imagery only."
        />
      </section>
    </PageShell>
  );
}
