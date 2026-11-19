import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = { title: "Brand & Identity Studio", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Brand & Identity Studio</Heading>
      <Text variant="secondary">Brand tokens, logo assets, and identity configuration (OID-18).</Text>
      <State kind="empty" title="Brand assets pending approval" description="Owner approval required for logo, fonts, and tokens." />
    </Container>
  );
}