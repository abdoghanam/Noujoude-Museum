import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Stories & Editorial Studio",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Stories & Editorial Studio</Heading>
      <Text variant="secondary">Manage stories and editorial content.</Text>
      <State
        kind="empty"
        title="No stories"
        description="Create stories in Payload admin."
      />
      <p style={{ marginTop: "1rem" }}>
        <a
          href="/admin/collections/stories"
          style={{ color: "var(--ndm-accent-primary)" }}
        >
          Open Stories →
        </a>
      </p>
    </Container>
  );
}
