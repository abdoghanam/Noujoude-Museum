// Noujoude — Payload CMS configuration.
//
// Phase 2 (Domain & database). This file is the single schema authority for
// the museum's content model (ADR-002). It is intentionally minimal on first
// landing: localization is declared so the public locale prefix rule (§4.2)
// has a server-side counterpart, and the collection list starts empty. Entities
// are added one at a time, each with its own migration, so a schema change is
// never a silent side effect of another.
//
// `withPayload()` is NOT wired into next.config.mjs yet — that is a later
// Phase 2 step, once a real collection and a migrated database exist. Until
// then this config is consumed by the Payload CLI (`pnpm payload`,
// `pnpm generate:types`, `pnpm migrate`) via PAYLOAD_CONFIG_PATH.

import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { Countries } from "./collections/countries";
import { Eras } from "./collections/eras";
import { Categories } from "./collections/categories";
import { Collections } from "./collections/collections";
import { Stories } from "./collections/stories";
import { Sources } from "./collections/sources";
import { Inquiries } from "./collections/inquiries";
import { Artifacts } from "./collections/artifacts";
import { PublicationRecords } from "./collections/publication-records";
import { OwnershipStatements } from "./collections/ownership-statements";
import { AuthenticityAssessments } from "./collections/authenticity-assessments";
import { ConditionReports } from "./collections/condition-reports";
import { ArtifactCountryRelationships } from "./collections/artifact-country-relationships";
import { MediaAssets } from "./collections/media-assets";
import { RightsRecords } from "./collections/rights-records";
import { ArtifactClaims } from "./collections/artifact-claims";
import { Users } from "./collections/users";
import { VerificationReviews } from "./collections/verification-reviews";
import { ProvenanceEvents } from "./collections/provenance-events";
import { Pages } from "./collections/pages";
import { AuditEvents } from "./collections/audit-events";
import { AiKnowledgeSources } from "./collections/ai-knowledge-sources";

const serverURL =
  process.env["PAYLOAD_PUBLIC_SERVER_URL"] ?? "http://localhost:3000";

export default buildConfig({
  secret: process.env["PAYLOAD_SECRET"] ?? "dev-only-insecure-secret-change-me",
  serverURL,
  localization: {
    // §4.2: public English and Arabic experiences are mandatory.
    locales: [
      { label: "English", code: "en" },
      { label: "العربية", code: "ar", rtl: true },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    push: false,
    pool: {
      connectionString: process.env["DATABASE_URI"],
    },
  }),
  collections: [
    Countries,
    Eras,
    Categories,
    Collections,
    Stories,
    Sources,
    Inquiries,
    Artifacts,
    PublicationRecords,
    OwnershipStatements,
    AuthenticityAssessments,
    ConditionReports,
    ArtifactCountryRelationships,
    MediaAssets,
    RightsRecords,
    ArtifactClaims,
    Users,
    VerificationReviews,
    ProvenanceEvents,
    Pages,
    AuditEvents,
    AiKnowledgeSources,
  ],
  globals: [],
  typescript: {
    outputFile: "src/generated/payload-types.ts",
  },
  // No plugins in V1 beyond what is explicitly ADR-approved.
  plugins: [],
});
