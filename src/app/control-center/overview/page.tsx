import type { Metadata } from "next";

import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Executive Overview",
  robots: { index: false, follow: false },
};

export default function OverviewPage() {
  return (
    <Container measure="wide">
      <Heading level={1}>Executive Overview</Heading>
      <Text variant="secondary">
        Operational summary. No published records exist yet; all counts are
        measured from the database.
      </Text>
      <State
        kind="empty"
        title="No published content"
        description="Owner-supplied inventory and approvals are required before any record may be published."
      />
    </Container>
  );
}
