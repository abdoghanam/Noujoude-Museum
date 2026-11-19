import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = { title: "Collections Management", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Collections Management</Heading>
      <Text variant="secondary">Manage collections and their taxonomy.</Text>
      <State kind="empty" title="No collections" description="Create collections in Payload admin." />
      <p style={{ marginTop: "1rem" }}><a href="/admin/collections/collections" style={{ color: "var(--ndm-accent-primary)" }}>Open Collections →</a></p>
    </Container>
  );
}