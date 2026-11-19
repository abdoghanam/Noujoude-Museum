// Noujoude — Phase 2 structural seed.
//
// Seeds ONLY non-factual structural data:
//   - the six country worlds (with truthful exhibition states; Morocco first),
//   - the eight collection categories,
//   - the eleven canonical Control Center roles (as user records, no passwords).
//
// No artifact, claim, image, story, provenance, rights or institutional fact is
// seeded. Any of those would violate the content truth boundary (Master Spec §2.8).
//
// Usage: node scripts/seed-structural.mjs
// Requires: a provisioned database reachable via DATABASE_URI (runtime role).

import { getPayload } from "payload";
// eslint-disable-next-line no-restricted-syntax
import config from "../src/payload/payload.config.ts";

const payload = await getPayload({ config });

const countries = [
  { name: "Morocco", slug: "morocco", exhibitionState: "In Preparation" },
  { name: "Egypt", slug: "egypt", exhibitionState: "Coming Soon" },
  { name: "Syria", slug: "syria", exhibitionState: "Coming Soon" },
  { name: "Mauritania", slug: "mauritania", exhibitionState: "Coming Soon" },
  { name: "Libya", slug: "libya", exhibitionState: "Coming Soon" },
  { name: "Sudan", slug: "sudan", exhibitionState: "Coming Soon" },
];

const categories = [
  { name: "Stamps", slug: "stamps" },
  { name: "First Day Covers", slug: "first-day-covers" },
  { name: "Coins", slug: "coins" },
  { name: "Documents", slug: "documents" },
  { name: "Letters", slug: "letters" },
  { name: "Souvenirs", slug: "souvenirs" },
  { name: "Heritage Objects", slug: "heritage-objects" },
  { name: "Artifacts", slug: "artifacts" },
];

for (const c of countries) {
  const ex = await payload.find({ collection: "countries", where: { slug: { equals: c.slug } }, limit: 1 });
  if (ex.totalDocs > 0) { console.log("country exists:", c.slug); continue; }
  await payload.create({ collection: "countries", data: c });
  console.log("seeded country:", c.slug);
}
for (const c of categories) {
  const ex = await payload.find({ collection: "categories", where: { slug: { equals: c.slug } }, limit: 1 });
  if (ex.totalDocs > 0) { console.log("category exists:", c.slug); continue; }
  await payload.create({ collection: "categories", data: c });
  console.log("seeded category:", c.slug);
}

// Eleven canonical roles (Master Spec §17.2 A-K) as user records.
// Passwords are dev-only placeholders; production identities are Owner-provisioned.
const roleUsers = [
  { email: "owner@noujoude.local", role: "owner", name: "Owner / Institutional Authority" },
  { email: "sysadmin@noujoude.local", role: "system_administrator", name: "System Administrator" },
  { email: "director@noujoude.local", role: "museum_director", name: "Museum Director" },
  { email: "curator@noujoude.local", role: "curator", name: "Curator" },
  { email: "editor@noujoude.local", role: "editor", name: "Editor" },
  { email: "publisher@noujoude.local", role: "publisher", name: "Publisher" },
  { email: "translator@noujoude.local", role: "translator", name: "Translator / Language Editor" },
  { email: "media@noujoude.local", role: "media_manager", name: "Media Manager" },
  { email: "researcher@noujoude.local", role: "researcher", name: "Researcher / Contributor" },
  { email: "visitor@noujoude.local", role: "public_visitor", name: "Public Visitor" },
  { email: "ai@noujoude.local", role: "ai_service_principal", name: "AI Service Principal" },
];

const DEV_PASSWORD = "DevSeedPassword!ChangeMe";
for (const u of roleUsers) {
  const existing = await payload.find({ collection: "users", where: { email: { equals: u.email } }, limit: 1 });
  if (existing.totalDocs > 0) {
    console.log("user exists:", u.email);
    continue;
  }
  await payload.create({ collection: "users", data: { ...u, password: DEV_PASSWORD } });
  console.log("seeded user:", u.email, "(", u.role, ")");
}

console.log("structural seed complete");
process.exit(0);