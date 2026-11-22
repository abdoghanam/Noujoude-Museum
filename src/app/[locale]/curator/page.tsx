import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import { PageShell } from "@/ui/page-shell";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";
import { MuseumScene } from "@/ui/museum-scene";
import { Scene3D } from "@/ui/scene-3d";

const ROUTE: RouteKey = "curator";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function CuratorPage({
  params,
}: {
  readonly params: Promise<{ readonly locale?: string }>;
}) {
  const { locale } = await params;
  const resolved = resolveLocale(locale);

  return (
    <PageShell route={ROUTE} locale={resolved}>
      <MuseumScene scene="chamber" title="AI Curator">
        <div className="curator-enter">
          <State
            kind="empty"
            title="AI Curator not configured"
            description="No inference provider is active. The AI Curator is not configured, so no answer is generated. The architecture is ready for activation when a provider is selected (OID-19)."
          />
          <MediaSlotGroup views={slotViewsFor(ROUTE, resolved)} />
        </div>
      </MuseumScene>

      <MuseumScene scene="chamber" title="Knowledge & Governance">
        <div className="uncertainty-reveal">
          <Text variant="secondary">
            Approved source retrieval only. Claim-level citations. Explicit
            uncertainty. No invented heritage facts. No fabricated provenance.
            No disclosure of private drafts. No access to restricted records.
          </Text>
        </div>
        <Scene3D>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Heading level={3}>Curator Chamber</Heading>
            <Text variant="secondary">Scholarship &amp; Reflection</Text>
          </div>
        </Scene3D>
      </MuseumScene>
    </PageShell>
  );
}