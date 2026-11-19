import type { Metadata } from "next";

import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Language & Translation Center",
  robots: { index: false, follow: false },
};

export default function LanguagePage() {
  return (
    <Container measure="wide">
      <Heading level={1}>Language & Translation Center</Heading>
      <Text variant="secondary">
        Per-locale publication state and translation review. Managed via
        PublicationRecords in Payload admin.
      </Text>
      <State
        kind="empty"
        title="No publication records"
        description="Publication records are created per (entity, locale) by the publishing workflow."
      />
      <p style={{ marginTop: "1rem" }}>
        <a
          href="/admin/collections/publication-records"
          style={{ color: "var(--ndm-accent-primary)" }}
        >
          Open Publication Records →
        </a>
      </p>
    </Container>
  );
}
