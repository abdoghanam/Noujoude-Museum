import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "AI Curator Command Center",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>AI Curator Command Center</Heading>
      <Text variant="secondary">
        Manage AI knowledge sources and retrieval policy.
      </Text>
      <State
        kind="empty"
        title="No AI provider configured"
        description="AI Curator runs in noop mode until a provider is configured (OID-19)."
      />
    </Container>
  );
}
