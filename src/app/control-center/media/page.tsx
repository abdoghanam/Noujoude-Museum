import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = { title: "Media & Asset Library", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Media & Asset Library</Heading>
      <Text variant="secondary">Manage media assets and rights records.</Text>
      <State kind="empty" title="No media assets" description="Create media assets in Payload admin." />
      <p style={{ marginTop: "1rem" }}><a href="/admin/collections/media-assets" style={{ color: "var(--ndm-accent-primary)" }}>Open Media Assets →</a></p>
      <p><a href="/admin/collections/rights-records" style={{ color: "var(--ndm-accent-primary)" }}>Open Rights Records →</a></p>
    </Container>
  );
}