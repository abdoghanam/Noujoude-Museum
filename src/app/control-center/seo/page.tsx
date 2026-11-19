import type { Metadata } from "next";

import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "SEO & Metadata Center",
  robots: { index: false, follow: false },
};

export default function SeoPage() {
  return (
    <Container measure="wide">
      <Heading level={1}>SEO & Metadata Center</Heading>
      <Text variant="secondary">
        Core SEO metadata for pages. Managed via the Pages collection in Payload
        admin.
      </Text>
      <State
        kind="empty"
        title="No SEO records"
        description="Create page records in /admin/collections/pages to manage SEO metadata."
      />
      <p style={{ marginTop: "1rem" }}>
        <a
          href="/admin/collections/pages"
          style={{ color: "var(--ndm-accent-primary)" }}
        >
          Open Pages collection →
        </a>
      </p>
    </Container>
  );
}
