import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { Scene3D } from "@/ui/scene-3d";
import { PageShell } from "@/ui/page-shell";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";

import styles from "@/app/[locale]/the-museum/page.module.css";

const ROUTE: RouteKey = "the-museum";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function TheMuseumPage({
  params,
}: {
  readonly params: Promise<{ readonly locale?: string }>;
}) {
  const { locale } = await params;
  const resolved = resolveLocale(locale);

  return (
    <PageShell route={ROUTE} locale={resolved}>
      {/* Museum Identity */}
      <section className={`${styles.identity} light-reveal`}>
        <Heading level={1} className={styles.title}>
          The Museum
        </Heading>
        <Text variant="secondary" className={styles.subtitle}>
          An interpretive orientation into the Noujoude Digital Heritage Museum.
        </Text>
        <Text variant="secondary" className={styles.body}>
          Institutional identity, founding history, and mission are Owner inputs
          that have not been supplied. This page renders its structure and
          available entry points only.
        </Text>
      </section>

      {/* Museum Philosophy */}
      <section className={styles.philosophy}>
        <Heading level={2}>Museum Philosophy</Heading>
        <Text variant="secondary">
          Heritage is preserved not by accumulation but by interpretation. Every
          object carries a story; every story carries a context. The museum
          exists to make that relationship visible.
        </Text>
      </section>

      {/* Museum Exploration */}
      <section className={styles.exploration}>
        <Heading level={2}>Museum Exploration</Heading>
        <div className={styles.entryGrid}>
          <a href={`/${resolved}/worlds`} className={styles.entryCard}>
            <Heading level={3}>The Worlds</Heading>
            <Text variant="caption">Country-based cultural exhibitions</Text>
          </a>
          <a href={`/${resolved}/collections`} className={styles.entryCard}>
            <Heading level={3}>Collections</Heading>
            <Text variant="caption">Objects organized by type and meaning</Text>
          </a>
          <a href={`/${resolved}/stories`} className={styles.entryCard}>
            <Heading level={3}>Stories</Heading>
            <Text variant="caption">Editorial and curatorial narratives</Text>
          </a>
          <a href={`/${resolved}/curator`} className={styles.entryCard}>
            <Heading level={3}>AI Curator</Heading>
            <Text variant="caption">Guided museum discovery</Text>
          </a>
        </div>
      </section>

      {/* Museum Atmosphere */}
      <section className={styles.atmosphere}>
        <Heading level={2}>Museum Atmosphere</Heading>
        <MediaSlotGroup views={slotViewsFor(ROUTE, resolved)} />
        <Scene3D>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Heading level={3}>Nocturnal Elegance</Heading>
            <Text variant="secondary">Heritage Under Candlelight</Text>
          </div>
        </Scene3D>
      </section>

      {/* Institutional Closing */}
      <section className={styles.closing}>
        <Text variant="secondary">
          More than a collection... it&apos;s a story.
        </Text>
      </section>
    </PageShell>
  );
}
