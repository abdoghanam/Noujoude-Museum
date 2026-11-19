import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Forms & Inquiries",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Forms & Inquiries</Heading>
      <Text variant="secondary">Manage contact inquiries.</Text>
      <State
        kind="empty"
        title="No inquiries"
        description="Inquiries appear when visitors submit the contact form."
      />
      <p style={{ marginTop: "1rem" }}>
        <a
          href="/admin/collections/inquiries"
          style={{ color: "var(--ndm-accent-primary)" }}
        >
          Open Inquiries →
        </a>
      </p>
    </Container>
  );
}
