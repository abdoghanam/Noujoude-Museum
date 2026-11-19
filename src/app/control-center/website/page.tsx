import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = { title: "Website & Page Studio", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Website & Page Studio</Heading>
      <Text variant="secondary">Manage public pages, blocks and navigation content.</Text>
      <State kind="empty" title="No pages published" description="Create page records in Payload admin." />
      <p style={{ marginTop: "1rem" }}><a href="/admin/collections/pages" style={{ color: "var(--ndm-accent-primary)" }}>Open Pages →</a></p>
    </Container>
  );
}