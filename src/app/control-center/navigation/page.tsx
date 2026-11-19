import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Navigation & Footer Studio",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Navigation & Footer Studio</Heading>
      <Text variant="secondary">Manage navigation and footer content.</Text>
      <State
        kind="empty"
        title="Navigation managed in code"
        description="Navigation is defined in src/domain/routes.ts."
      />
    </Container>
  );
}
