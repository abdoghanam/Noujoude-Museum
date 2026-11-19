import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@payloadcms/next/css";

export const metadata: Metadata = {
  title: "Noujoude Control Center",
  robots: { index: false, follow: false },
};

export default function PayloadLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
