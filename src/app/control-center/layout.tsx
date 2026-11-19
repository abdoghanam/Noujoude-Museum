import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/ui/styles/global.css";

export const metadata: Metadata = {
  title: "Noujoude Control Center",
  robots: { index: false, follow: false },
};

export default function ControlCenterLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body style={{ margin: 0, background: "var(--ndm-surface-page)", color: "var(--ndm-text-primary)", fontFamily: "var(--ndm-font-body)" }}>
        {children}
      </body>
    </html>
  );
}