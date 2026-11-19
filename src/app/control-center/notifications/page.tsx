import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Notifications & Alerts",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Notifications & Alerts</Heading>
      <Text variant="secondary">System notifications and alerts.</Text>
      <State
        kind="empty"
        title="No notifications"
        description="Notifications appear when system events occur."
      />
    </Container>
  );
}
