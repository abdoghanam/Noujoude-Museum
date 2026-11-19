import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = { title: "Artifact Management", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Artifact Management</Heading>
      <Text variant="secondary">Manage artifact records, claims, evidence, provenance.</Text>
      <State kind="empty" title="No artifacts" description="Create artifacts in Payload admin." />
      <p style={{ marginTop: "1rem" }}><a href="/admin/collections/artifacts" style={{ color: "var(--ndm-accent-primary)" }}>Open Artifacts →</a></p>
    </Container>
  );
}