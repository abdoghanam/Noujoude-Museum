import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Publishing & Revision Control",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Publishing & Revision Control</Heading>
      <Text variant="secondary">Manage publication records and revisions.</Text>
      <State
        kind="empty"
        title="No publication records"
        description="Publication records are created per (entity, locale)."
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
