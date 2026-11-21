import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { PageShell } from "@/ui/page-shell";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";

import styles from "@/app/[locale]/worlds/page.module.css";

const ROUTE: RouteKey = "worlds";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

const COUNTRIES = [
  { slug: "morocco", name: "Morocco", state: "In Preparation" },
  { slug: "egypt", name: "Egypt", state: "Coming Soon" },
  { slug: "syria", name: "Syria", state: "Coming Soon" },
  { slug: "mauritania", name: "Mauritania", state: "Coming Soon" },
  { slug: "libya", name: "Libya", state: "Coming Soon" },
  { slug: "sudan", name: "Sudan", state: "Coming Soon" },
];

export default async function WorldsPage({
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
          The Worlds
        </Heading>
        <Text variant="secondary" className={styles.subtitle}>
          Six Cultural Worlds
        </Text>
        <Text variant="secondary">
          Country-based cultural exhibitions. Morocco is the first intended
          exhibition; others reflect their actual readiness.
        </Text>
      </section>

      <div className={`${styles.grid} grid-reveal`}>
        {COUNTRIES.map((country) => (
          <a
            key={country.slug}
            href={`/${resolved}/worlds/${country.slug}`}
            className={styles.card}
          >
            <MediaSlotGroup
              views={slotViewsFor("world-detail", resolved, country.slug)}
            />
            <Heading level={3} className={styles.cardTitle}>
              {country.name}
            </Heading>
            <span className={styles.cardState}>{country.state}</span>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
