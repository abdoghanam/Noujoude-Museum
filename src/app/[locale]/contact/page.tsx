import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { slotViewsFor } from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";
import shellStyles from "@/ui/page-shell.module.css";
import { PageShell } from "@/ui/page-shell";

const ROUTE: RouteKey = "contact";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function ContactPage({
  params,
}: {
  readonly params: Promise<{ readonly locale?: string }>;
}) {
  const { locale } = await params;
  return (
    <PageShell route={ROUTE} locale={resolveLocale(locale)}>
      <div className="contact-enter">
        <p className={shellStyles.slot}>
          Noujoude Majdouli — Digital Heritage Museum
        </p>
        <p className={shellStyles.slot}>Email: Noujoude-Majdouli@gmail.com</p>
        <p className={shellStyles.slot}>Phone: 01011244308</p>
        <p className={shellStyles.slot}>Country: France</p>
        <p className={shellStyles.slot}>Location: France — Capital</p>
        <p className={shellStyles.slot}>
          No postal address or opening hours have been supplied by the Owner, so
          none is displayed; inventing them is prohibited.
        </p>
        <MediaSlotGroup views={slotViewsFor(ROUTE, resolveLocale(locale))} />
      </div>
    </PageShell>
  );
}
