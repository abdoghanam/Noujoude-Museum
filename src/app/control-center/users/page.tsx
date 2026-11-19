import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import { State } from "@/ui/state";

export const metadata: Metadata = {
  title: "Users & Permissions",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Container measure="wide">
      <Heading level={1}>Users & Permissions</Heading>
      <Text variant="secondary">
        Manage users and roles (11 canonical roles).
      </Text>
      <State
        kind="empty"
        title="No users beyond seed"
        description="Users are managed in Payload admin."
      />
      <p style={{ marginTop: "1rem" }}>
        <a
          href="/admin/collections/users"
          style={{ color: "var(--ndm-accent-primary)" }}
        >
          Open Users →
        </a>
      </p>
    </Container>
  );
}
