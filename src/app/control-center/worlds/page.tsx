import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = { title: "Worlds Management", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Worlds Management</Heading>
      <Text variant="secondary">Manage country worlds and exhibition states.</Text>
      <State kind="empty" title="No countries seeded" description="Seed countries or create via Payload admin." />
      <p style={{ marginTop: "1rem" }}><a href="/admin/collections/countries" style={{ color: "var(--ndm-accent-primary)" }}>Open Countries →</a></p>
    </Container>
  );
}