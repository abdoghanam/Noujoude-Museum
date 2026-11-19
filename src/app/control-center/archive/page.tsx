import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Archive & Recovery Center",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Archive & Recovery Center</Heading>
      <Text variant="secondary">Archive and recovery management.</Text>
      <State
        kind="empty"
        title="No archived records"
        description="Archived records appear here after archival."
      />
    </Container>
  );
}
