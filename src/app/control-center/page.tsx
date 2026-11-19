import type { Metadata } from "next";

import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";

export const metadata: Metadata = {
  title: "Control Center",
  robots: { index: false, follow: false },
};

const MODULES = [
  { id: 1, name: "Executive Overview", slug: "overview", href: "/control-center/overview" },
  { id: 2, name: "Website & Page Studio", slug: "website", href: "/control-center/website" },
  { id: 3, name: "Brand & Identity Studio", slug: "brand", href: "/control-center/brand" },
  { id: 4, name: "Worlds Management", slug: "worlds", href: "/control-center/worlds" },
  { id: 5, name: "Collections Management", slug: "collections", href: "/control-center/collections" },
  { id: 6, name: "Artifact Management", slug: "artifacts", href: "/control-center/artifacts" },
  { id: 7, name: "Stories & Editorial Studio", slug: "stories", href: "/control-center/stories" },
  { id: 8, name: "Media & Asset Library", slug: "media", href: "/control-center/media" },
  { id: 9, name: "AI Curator Command Center", slug: "ai-curator", href: "/control-center/ai-curator" },
  { id: 10, name: "Navigation & Footer Studio", slug: "navigation", href: "/control-center/navigation" },
  { id: 11, name: "SEO & Metadata Center", slug: "seo", href: "/control-center/seo" },
  { id: 12, name: "Language & Translation Center", slug: "language", href: "/control-center/language" },
  { id: 13, name: "Forms & Inquiries", slug: "inquiries", href: "/control-center/inquiries" },
  { id: 14, name: "Users & Permissions", slug: "users", href: "/control-center/users" },
  { id: 15, name: "Publishing & Revision Control", slug: "publishing", href: "/control-center/publishing" },
  { id: 16, name: "System & Institutional Settings", slug: "settings", href: "/control-center/settings" },
  { id: 17, name: "Analytics & Insights", slug: "analytics", href: "/control-center/analytics" },
  { id: 18, name: "Notifications & Alerts", slug: "notifications", href: "/control-center/notifications" },
  { id: 19, name: "Audit & Activity Center", slug: "audit", href: "/control-center/audit" },
  { id: 20, name: "Archive & Recovery Center", slug: "archive", href: "/control-center/archive" },
];

export default function ControlCenterIndex() {
  return (
    <Container measure="wide">
      <Heading level={1}>Master Control Center</Heading>
      <Text variant="secondary">
        Restricted administrative environment. All routes are noindex and protected by server-side authorization.
      </Text>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
        {MODULES.map((m) => (
          <a
            key={m.id}
            href={m.href}
            style={{
              display: "block",
              padding: "1rem",
              border: "1px solid var(--ndm-color-museum-glass)",
              background: "var(--ndm-surface-raised)",
              color: "var(--ndm-text-primary)",
              textDecoration: "none",
            }}
          >
            <strong>{m.id}. {m.name}</strong>
          </a>
        ))}
      </div>
    </Container>
  );
}