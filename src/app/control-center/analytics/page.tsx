import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = { title: "Analytics & Insights", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Analytics & Insights</Heading>
      <Text variant="secondary">Analytics and insights (zero-cost, no external service).</Text>
      <State kind="empty" title="No analytics data" description="Analytics requires an observability backend (OID-19)." />
    </Container>
  );
}