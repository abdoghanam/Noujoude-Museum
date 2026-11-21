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

      <div className={styles.grid}>
        {CATEGORIES.map((cat) => (
          <a
            key={cat.slug}
            href={`/${resolved}/collections/${cat.slug}`}
            className={`${styles.card} collection-card`}
          >
            <MediaSlotGroup
              views={slotViewsFor("collection-detail", resolved, cat.slug)}
            />
            <Heading level={3} className={styles.cardTitle}>
              {cat.name}
            </Heading>
            <span className={styles.cardState}>{cat.state}</span>
          </a>
        ))}
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
