import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { DetailPage } from "@/ui/detail-page";
import { MuseumScene } from "@/ui/museum-scene";
import exhibitStyles from "@/ui/artifact-exhibition.module.css";

import { Text } from "@/ui/text";
import { State } from "@/ui/state";

const ROUTE: RouteKey = "artifact-detail";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function ArtifactDetailPage({
  params,
}: {
  readonly params: Promise<{
    readonly locale?: string;
    readonly "artifact-slug": string;
  }>;
}) {
  const { locale, "artifact-slug": slug } = await params;
  const resolved = resolveLocale(locale);

  return (
    <DetailPage route={ROUTE} locale={resolved} slug={slug} kind="artifact">
      <div className={exhibitStyles.artifactStage}>
        <div className={exhibitStyles.exhibitImageArea}>
          <div className={exhibitStyles.exhibitImageFrame}>
            <MediaSlotGroup views={slotViewsFor(ROUTE, resolved, slug)} />
          </div>
          <p className={exhibitStyles.exhibitImageCaption}>
            Primary image — rights-gated
          </p>
        </div>
        <div className={exhibitStyles.metadataArea}>
          <div className={exhibitStyles.objectIdentity}>
            <h2 className={exhibitStyles.objectTitle}>Artifact</h2>
            <span className={exhibitStyles.objectIdentifier}>
              NDM-AST — — —
            </span>
          </div>
          <div className={exhibitStyles.metadataSection}>
            <span className={exhibitStyles.metadataLabel}>Object Type</span>
            <p className={exhibitStyles.metadataValue}>Owner input required</p>
          </div>
          <div className={exhibitStyles.metadataSection}>
            <span className={exhibitStyles.metadataLabel}>Period</span>
            <p className={exhibitStyles.metadataValue}>Owner input required</p>
          </div>
          <div className={exhibitStyles.metadataSection}>
            <span className={exhibitStyles.metadataLabel}>Origin</span>
            <p className={exhibitStyles.metadataValue}>Owner input required</p>
          </div>
          <div className={exhibitStyles.curatorNote}>
            <span className={exhibitStyles.curatorNoteLabel}>Curator Note</span>
            Curatorial interpretation will appear here when artifact records are
            published.
          </div>
        </div>
      </div>

      <MuseumScene scene="archive" title="Documentation & Evidence">
        <div className="evidence-reveal">
          <State
            kind="empty"
            title="No artifact records published"
            description="Object identity, description, historical context, classification, documentation, provenance, condition, image rights, and curator note are Owner inputs. Until supplied, this page renders its structure only."
          />
        </div>
      </MuseumScene>

      <MuseumScene scene="corridor" title="Related Exploration">
        <Text variant="secondary">
          Related objects, stories, and AI Curator connections will appear here
          when artifact records are published.
        </Text>
      </MuseumScene>
    </DetailPage>
  );
}
