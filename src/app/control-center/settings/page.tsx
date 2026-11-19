import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = { title: "System & Institutional Settings", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>System & Institutional Settings</Heading>
      <Text variant="secondary">Institutional settings and configuration.</Text>
      <State kind="empty" title="Settings managed in code" description="Institutional settings are Owner inputs (OID-01…07)." />
    </Container>
  );
}