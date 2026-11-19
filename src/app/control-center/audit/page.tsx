import type { Metadata } from "next";

import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Audit & Activity Center",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  return (
    <Container measure="wide">
      <Heading level={1}>Audit & Activity Center</Heading>
      <Text variant="secondary">
        Append-only audit events. Enforced by DB grants + trigger + RLS
        (ADR-019).
      </Text>
      <State
        kind="empty"
        title="No audit events"
        description="Audit events are written by the system during content operations."
      />
      <p style={{ marginTop: "1rem" }}>
        <a
          href="/admin/collections/audit-event"
          style={{ color: "var(--ndm-accent-primary)" }}
        >
          Open Audit Events →
        </a>
      </p>
    </Container>
  );
}
