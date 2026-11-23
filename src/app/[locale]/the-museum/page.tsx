import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { PageShell } from "@/ui/page-shell";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";

import { MuseumScene } from "@/ui/museum-scene";
import { Scene3D } from "@/ui/scene-3d";
import { RemotionPlayer } from "@/ui/cinematic-engine";
import { Lazy3DScene } from "@/ui/spatial-engine";
import styles from "@/app/[locale]/the-museum/page.module.css";
import lightingStyles from "@/ui/environmental-lighting.module.css";

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
      <MuseumScene scene="entrance" title="Museum Entrance">
        <div style={{ width: "100%", maxWidth: "80rem", margin: "0 auto" }}>
          <RemotionPlayer composition="MuseumEntrance" autoPlay loop={false} />
        </div>
      </MuseumScene>

      <MuseumScene scene="lobby" title="The Museum">
        <Text variant="secondary">
          An interpretive orientation into the Noujoude Digital Heritage Museum.
        </Text>
        <Text variant="secondary">
          Institutional identity, founding history, and mission are Owner inputs
          that have not been supplied. This page renders its structure and
          available entry points only.
        </Text>
      </MuseumScene>

      <MuseumScene scene="gallery" title="Museum Philosophy">
        <Text variant="secondary">
          Heritage is preserved not by accumulation but by interpretation. Every
          object carries a story; every story carries a context. The museum
          exists to make that relationship visible.
        </Text>
      </MuseumScene>

      <MuseumScene scene="gallery" title="Museum Exploration">
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
      </MuseumScene>

      <MuseumScene scene="archive" title="Museum Atmosphere">
        <div className={lightingStyles.museumAtmosphere}>
          <MediaSlotGroup views={slotViewsFor(ROUTE, resolved)} />
          <Lazy3DScene scene="rare-pieces" />
          <Scene3D>
            <div
              className={lightingStyles.candleGlow}
              style={{ textAlign: "center", padding: "2rem" }}
            >
              <Heading level={3}>Nocturnal Elegance</Heading>
              <Text variant="secondary">Heritage Under Candlelight</Text>
            </div>
          </Scene3D>
        </div>
      </MuseumScene>

      <MuseumScene scene="closing" title="Closing Reflection">
        <Text variant="secondary">
          More than a collection... it&apos;s a story.
        </Text>
      </MuseumScene>
    </PageShell>
  );
}
