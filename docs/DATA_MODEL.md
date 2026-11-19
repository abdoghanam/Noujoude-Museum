# Noujoude Digital Heritage Museum — Data Model

**Document ID:** NDM-DATA-001
**Version:** 1.0.0
**Phase:** 2 input (design contract authored after Phase 0 audit + Phase 1 architecture)
**Status:** **Design contract; no schema deployed — there is no database and no migration yet.**
**Date:** 31 October 2026
**Governing decisions:** `docs/ARCHITECTURE_DECISIONS.md` (ADR-001 … ADR-038 as re-counted on 4 November 2026 — the four newest rows are the serving-ceiling, build-tracing, permission-instrument and render-profile decisions, and none of the four changes a column, type or constraint in this model; ADR-001 … ADR-036 was this line's 3 November reading, ADR-001 … ADR-034 its 2 November reading; §3 compatibility matrix, §4 discrepancies D-01…D-04)
**Governing requirements:** `reference/Noujoude_Master_Specification_EN.md` §8–§11 (cited by original line number),
`reference/Noujoude_Technology_and_Security_Standard_EN.md` §3, §15
**Working copy of the product spec:** `docs/MASTER_SPECIFICATION.md` (discrepancy log S-01…S-15 in its §2)

---

## 0. How to read this document — the truth rule

Directive §17 line 318 states: *"Do not claim a feature is implemented without verifying behavior."*
Directive §15 line 290 states: *"A route, React component, button, schema field, migration, or successful build alone is not proof of a completed feature."* Master Specification line 1053 states of its own entity list: *"The list describes the
logical domain model. It does not assert that all entities or fields already exist in the current physical database."*
This document sits inside that same boundary.

**Current implemented state of the data layer — measured, not asserted:**

| Item | Actual state | Evidence |
|---|---|---|
| PostgreSQL instance | Does not exist **for this project**. `docker-compose.yml` is authored and has never been brought up — `docker compose config` exits 1 on the seven unset `.env` secrets (B-03), so it cannot start here, though the same command exits **0** when those seven are supplied as process-environment placeholders, which is what proves the definition itself is sound. The image is **present in the local cache** since 1 Nov 2026 (`postgres:18.6-alpine`, 433 MB), superseding the "pull unattempted" reading, and a PostgreSQL 18.6 server *has* run the role/grant scripts inside the A.5 harness's throwaway container | ADR-004 / ADR-002 §7 row 7; `docs/ARCHITECTURE_DECISIONS.md` §4 D-03; `docs/A5_PRIVILEGE_EVIDENCE.txt` |
| Payload config / collections | Do not exist. `src/` contains only `src/README.md` | `src/README.md` ("State: intentionally empty at the end of Phase 1") |
| Migrations | Zero. No migration directory exists | workspace inspection 31 Oct 2026 |
| Drizzle tables | Zero | no schema code exists |
| Dependencies | Not installed; blocked by B-01 (host Node 24.19.0 < required `>=24.22.1`) | ADR-003, `ARCHITECTURE_DECISIONS.md` §2 |

**Status marker used on every item below** — one of:

| Marker | Meaning |
|---|---|
| `DC` | **Design contract.** The model is defined here and is what a future migration must produce. Nothing is deployed. |
| `DC·OPEN` | Design contract with a named unresolved question that cannot be closed from the supplied sources (see §8, "NOT A DECISION"). |
| `SPEC-VERBATIM` | Field name and logical type are copied from the specification's own table; not invented here. |
| `ADR-ADDED` | Entity/field exists because an ADR completed a gap in the specification; the source text does not name it. |
| `NOT-IMPLEMENTED` | Statement of implemented reality. Always paired with `—` in the location column; never implies code. |

Nothing in this document may be read as `IMPLEMENTED`. There is exactly zero implemented state to report.

---

## 1. Model authority

**The single schema authority is Payload's `@payloadcms/db-postgres` adapter (Drizzle-backed).** (ADR-002;
Technology Standard §3.1: *"Payload's PostgreSQL adapter and its Drizzle-backed migration system are the schema
authority for Payload-managed collections and globals."*)

Derived, non-negotiable rules:

1. **No Prisma.** Standard §15 line 327 lists it first: *"No Prisma alongside Payload's Drizzle-backed PostgreSQL adapter."*
2. **No second migration system.** Standard §15 line 328: *"No dual competing migration systems."* Directive §17 line 323 repeats:
   *"Do not introduce a second ORM or migration system."*
3. **Custom domain tables are allowed, but only through the adapter's documented Drizzle extension and inside the
   same migration stream** (Standard §3.1: *"Custom domain tables may be added using the documented Payload/Drizzle
   extension and migration mechanisms. Name ownership, foreign keys, indexes, and migration order must be explicit."*).
   They are not a parallel schema namespace; they are not created out-of-band by SQL scripts.
4. **`drizzle-orm` is not pinned independently.** The version is whatever `@payloadcms/db-postgres@3.92.1` resolves;
   `drizzle-orm@1.0.0-beta.22` / `1.0.0-rc.5` are prohibited (ADR §3.1).
5. **The physical schema is not defined by this document as final SQL.** Master Spec §8.19 (line 1398): *"This
   document defines the logical product model, not a final physical SQL schema."* This document is the bridge: the
   approved logical model, expressed as a design contract, with the physical decisions that are already made
   (indexes, constraints, storage shape) separated from those deliberately deferred (§8).

### 1.1 Naming conventions adopted (engineering defaults, Standard §13)

- Payload collection slugs: lowerCamel singular (`artifact`, `collection`, `mediaAsset`). Payload's adapter derives
  table names from these; the exact table naming strategy is fixed by the adapter, not hand-rolled.
- Custom Drizzle tables: `snake_case` plural (`audit_event`, `artifact_country_relationship`, `media_asset_rights`).
- State columns: camelCase, always namespaced (§5).
- Every spec field name reproduced with its own spelling (`accession_number`, `object_type`, …) so that the
  traceability register can match a field to a source line without translation.

---

## 2. Entity inventory

Rows 1–20 are `SPEC-VERBATIM` from Master Spec §8.2 (lines 1032–1051, verified). Rows 21–25 are `ADR-ADDED`
consequences of ADR-011 and ADR-012; row 16's *treatment* is changed by ADR-008.

**All rows are `DC` (design contract). None is deployed.**

| # | Entity | Purpose | Payload collection or custom Drizzle table | Source / decision |
|---|---|---|---|---|
| 1 | `Country` | A country world within the museum | Payload collection | §8.2 line 1032; fields §8.3 1059–1075 |
| 2 | `Era` | Historical period / chronological classification | Payload collection | §8.2 line 1033; fields §8.4 1085–1094 |
| 3 | `Category` | Object type or taxonomy node | Payload collection | §8.2 line 1034; fields §8.5 1104–1113 |
| 4 | `Collection` | Curated grouping of artifacts | Payload collection | §8.2 line 1035; fields §8.6 1123–1137 |
| 5 | `Artifact` | Individual heritage object — the factual foundation | Payload collection | §8.2 line 1036; fields §8.7 1147–1172 |
| 6 | `Story` | Published narrative | Payload collection | §8.2 line 1037; fields §8.9 1206–1219 |
| 7 | `Source` | Documentary or research reference | Payload collection | §8.2 line 1038; fields §8.10 1229–1243 |
| 8 | `ArtifactClaim` | One specific factual statement about an artifact | Payload collection | §8.2 line 1039; §8.11 1253–1266 |
| 9 | `ClaimEvidence` | Link between a claim and one or more evidence records | Payload collection | §8.2 line 1040; §8.11 line 1264 |
| 10 | `VerificationReview` | A review decision on a claim or defined set of claims | Payload collection | §8.2 line 1041; §8.11 lines 1259–1261 |
| 11 | `ProvenanceEvent` | Documented custody/ownership/transfer/collection-history event | Payload collection | §8.2 line 1042; §8.12 1276–1285 |
| 12 | `MediaAsset` | An image, document, or other media file (original or derivative) | Payload collection (uploads-style), originals private by default | §8.2 line 1043; §8.14 1303–1319; Standard §6 |
| 13 | `RightsRecord` | Permissions and legal/usage restrictions for media or documentation | Payload collection | §8.2 line 1044; §8.15 1329–1342 |
| 14 | `LocalizedContent` | Locale-specific text/metadata **where a separate translation record is needed** | Split by design: localized *field content* lives on Payload `localized: true` fields (ADR-008); the workflow record is a custom table `translation_record` | §8.2 line 1045; §10.7 line 1499; **ADR-008**. See §8 `DC·OPEN` note |
| 15 | `User`, `Role`, `Permission` | The institutional access model | Payload auth (`User`) collection + role/permission records as Payload collections | §8.2 line 1046; §8.16 line 1350; §17.2 2686+; Standard §4 |
| 16 | `PublicationRecord` | Locale-specific publication state and timestamp | Payload collection; **authoritative store of publication state** | §8.2 line 1047; §8.16 line 1352; **ADR-008** (resolves S-02 / D-02) |
| 17 | `Revision` | A version of an editable record | Payload native version documents (adapter-managed tables) + custom `revision_annotation` for the spec fields Payload does not carry | §8.2 line 1048; §8.16 line 1354; §18.5 | 
| 18 | `Inquiry` | Visitor-submitted communication | Payload collection, PII-restricted access | §8.2 line 1049; §8.16 line 1348; §11.10 1625–1632 |
| 19 | `AIKnowledgeSource` | Approved source record eligible for retrieval | Payload collection | §8.2 line 1050; §14.3 1966–1976; §14.4 1980–1987; ADR-017 |
| 20 | `AuditEvent` | Immutable/protected record of a consequential action | **Custom Drizzle table** (append-only; needs grant/trigger control the CMS layer cannot express) | §8.2 line 1051; §8.16 line 1356; §11.12 line 1654; G.8 row 19 line 3822 |
| 21 | `OwnershipStatement` | A separately evidenced, separately approved ownership conclusion | Payload collection | **ADR-011** (`ADR-ADDED`). Mandated by §8.1 line 1019, §8.13 line 1291; screens required by G.8 line 3809 and by §16.6 line 2449+ as read with S-12; no field in 1147–1172 |
| 22 | `AuthenticityAssessment` | A separately evidenced, separately approved authenticity conclusion | Payload collection | **ADR-011** (`ADR-ADDED`). Mandated by §8.1 line 1020, §8.13 line 1293 |
| 23 | `ConditionReport` | Structured condition/preservation record replacing the untyped `condition_record` slot | Payload collection (referenced from `Artifact`) | **ADR-011** (`ADR-ADDED`). §8.7 line 1169 names `condition_record` as "Structured record"; §16.6 screen H line 2453 |
| 24 | `ArtifactCountryRelationship` | Typed many-to-many between Country and Artifact | **Custom Drizzle join table** | **ADR-012** (`ADR-ADDED`). §8.17 line 1363 + line 1376 controlled types; Artifact table 1147–1172 has no country field (S-06) |
| 25 | `MediaAssetRights` | Join between MediaAsset and RightsRecord scoped by use | **Custom Drizzle join table** | **ADR-012** (`ADR-ADDED`). §8.17 line 1373 vs the singular `rights_record_id` at §8.14 line 1315 (S-05) |

Planned supporting joins (also `DC`, generated by the adapter's many-to-many mechanism unless a controlled payload
forces a hand-authored table): `collection_country`, `collection_category`, `collection_story`,
`artifact_category`, `artifact_media_relationship` (§8.7 line 1164 `media_relationships`; §8.17 line 1372 requires a
usage relationship carrying **role and rights context**, so this one is hand-authored, not implicit),
`story_country`, `story_collection`, `story_artifact`, `story_source`.

### 2.1 Entities the specification names as screens but not as model rows

| Item | Where required | Where absent from §8.2 | Handling |
|---|---|---|---|
| `Page` (unique institutional pages, page sections, shared templates) | §16.2 lines 2310–2341 (page directory, 13 block types, section controls, template impact); §8.17 line 1372 lists `Page` as a MediaAsset usage target | §8.2 lines 1032–1051 contain no `Page`; §8 has no page field table | `DC·OPEN`. **Not decided here** — see §8. Logged by this document as a conflict outside S-01…S-15; requires a new ADR before Phase 2 can model it. |
| `TranslationRecord` fields (source locale, target locale, source text/version, translated text, translator, reviewer, approval state, timestamps, revision history) | §10.7 line 1499 | §8.2 line 1045 offers only `LocalizedContent` | `DC·OPEN` — realized either as `LocalizedContent` renamed, or as a distinct record. Field list is spec-verbatim, the naming is not. |

---

## 3. Field-level design contracts

Every table below is `DC` / `SPEC-VERBATIM` unless a row says `ADR-ADDED`. The "Localized" column follows
ADR-008: `localized: true` on the field. "Required" copies the specification's own wording rather than inventing a
boolean where the spec is conditional. "Exposure" distinguishes visitor-facing from internal per the spec's own
"Public use" column.

### 3.1 Collection — §8.6, lines 1121–1137

| Field | Logical type (spec) | Localized | Required (spec) | Exposure | Status |
|---|---|---|---|---|---|
| `id` | UUID | no | System | No | DC·SPEC-VERBATIM |
| `slug` | String | scoped per locale+route namespace (line 1383) | Required, unique | URL | DC·SPEC-VERBATIM |
| `title` | Localized string | yes | Required for locale publication | Yes | DC·SPEC-VERBATIM |
| `subtitle` | Localized string | yes | Optional | Yes | DC·SPEC-VERBATIM |
| `introduction` | Localized text | yes | Required for publication | Yes | DC·SPEC-VERBATIM |
| `editorial_content` | Localized rich text | yes | Optional | Yes | DC; Lexical, sanitized (ADR-016) |
| `country_ids` | Many-to-many | no | Optional | Yes | DC·SPEC-VERBATIM |
| `category_ids` | Many-to-many | no | Optional | Yes | DC·SPEC-VERBATIM |
| `cover_media_id` | Media reference | no | Conditional | Yes | DC·SPEC-VERBATIM |
| `story_ids` | Relationships | no | Optional | Yes | DC·SPEC-VERBATIM |
| `curator_note` | Localized text | yes | Optional | Yes | DC; note §8.7/line 1410 — *private* curatorial notes are never indexed |
| `publication_state` | Per-locale state | per locale | Required | No | **`DC·ADR-ADAPTED`** — S-02/ADR-008: authoritative copy lives in `PublicationRecord`; the field on the entity is not a second store of truth |
| `display_order` | Integer | no | Optional | No | DC·SPEC-VERBATIM |
| `featured_state` | Boolean / editorial selection | no | Optional | Yes | DC·SPEC-VERBATIM |
| timestamps | System | no | System | No | DC·SPEC-VERBATIM |

Line 1139 (verbatim constraint): *"Collection membership is a relationship, not [an ownership boundary]"* — read with
line 1364: a primary display collection may be designated without restricting other memberships.

### 3.2 Artifact — §8.7, lines 1145–1172

| Field | Logical type (spec) | Localized | Required (spec) | Exposure | Status |
|---|---|---|---|---|---|
| `id` | UUID | no | System | No | DC·SPEC-VERBATIM |
| `accession_number` | String | no | Optional / Owner-defined | Only if approved | DC; **`BLOCKED-OWNER`** for values — Standard §13 line 300 "Real artifact inventory and factual data" |
| `slug` | String | locale/route namespace | Required, unique | URL | DC·SPEC-VERBATIM |
| `title` | Localized string | yes | Required for locale publication | Yes | DC·SPEC-VERBATIM |
| `original_title` | String | no (as documented) | Optional | Yes | DC·SPEC-VERBATIM |
| `alternative_names` | Structured list | per-name language tag (line 1258) | Optional | When relevant | DC·SPEC-VERBATIM |
| `object_type` | String / controlled enum | no | Required | Yes | DC·SPEC-VERBATIM |
| `category_ids` | Relationship list | no | Required for public classification | Yes | DC·SPEC-VERBATIM |
| `era_id` | Relationship | no | Optional | When known | **`DC·OPEN`** — conflicts with §8.17 line 1366 (many-to-one **or** many-to-many); see §8 |
| `short_description` | Localized text | yes | Required for public display | Yes | DC·SPEC-VERBATIM |
| `long_description` | Localized rich text | yes | Optional | Yes | DC; Lexical (ADR-016) |
| `materials` | Structured list | label-level | Optional, evidence-based | When known | DC·SPEC-VERBATIM |
| `dimensions` | Structured measurement | no | Optional, documented | When known | DC·SPEC-VERBATIM |
| `production_date` | Structured date range + precision | no | Optional | When known | DC; precision enum from §8.4 line 1096; line 1388 separates artifact date from record date |
| `origin_location` | Structured location | label-level | Optional | When known | DC·SPEC-VERBATIM |
| `creator_or_issuer` | Structured party/reference | no | Optional, when documented | When documented | DC·SPEC-VERBATIM |
| `primary_media_id` | Media reference | no | Conditional | Yes | DC·SPEC-VERBATIM |
| `media_relationships` | Relationship list | no | Optional | Yes | DC → `artifact_media_relationship` join carrying role + rights context (line 1372) |
| `claim_ids` | Relationship list | no | Required for supported factual presentation | Appropriate summary | DC·SPEC-VERBATIM |
| `provenance_event_ids` | Relationship list | no | Conditional | Approved disclosure only | DC·SPEC-VERBATIM |
| `rights_record_ids` | Relationship list | no | Conditional | Appropriate public notice | DC·SPEC-VERBATIM |
| `curator_note` | Localized text | yes | Optional | Yes | DC·SPEC-VERBATIM |
| `condition_record` | Structured record | narrative part yes | Optional | If approved | **`DC·ADR-ADDED`** — ADR-011: realized as a reference to `ConditionReport`, not an inline blob |
| `publication_state` | Per-locale state | per locale | Required | No | **`DC·ADR-ADAPTED`** — ADR-008, see §3.1 note |
| `created_at`, `updated_at` | Timestamp | no | System | No | DC·SPEC-VERBATIM |
| `created_by`, `updated_by` | User reference | no | System | Internal | DC·SPEC-VERBATIM |

Country is **not** a field here (line 1147–1172 contains none) — it arrives only through
`ArtifactCountryRelationship` (ADR-012, §8.17 lines 1363 + 1376).

**Line 1174 verbatim constraint:** *"An artifact may have several country relationships and several collection
relationships. The data model must not force a single country or a single collection…"*

**§8.8 (lines 1176–1198)** keeps the generic record from forcing irrelevant fields: category-specific metadata profiles
for Stamps/First Day Covers, Coins, Documents/Letters, Souvenirs/Heritage Objects, Other Artifacts. Design contract:
these are **conditional field groups gated by `Category`**, not new entities, and line 1198 forbids unstructured notes
replacing fields required for filtering, sorting, or sourcing. The concrete field lists in 1182–1194 are "potential
fields include", i.e. **`DC·OPEN`** — they are not a closed baseline and are not invented into fixed columns here.

### 3.3 Story — §8.9, lines 1204–1219

| Field | Logical type (spec) | Localized | Required (spec) | Exposure | Status |
|---|---|---|---|---|---|
| `id` | UUID | no | System | No | DC·SPEC-VERBATIM |
| `slug` | String | locale/route namespace | Required, unique | URL | DC·SPEC-VERBATIM |
| `title`, `subtitle` | Localized strings | yes | Required / optional | Yes | DC·SPEC-VERBATIM |
| `summary` | Localized text | yes | Required for publication | Yes | DC·SPEC-VERBATIM |
| `body` | Localized rich text | yes | Required for publication | Yes | DC; Lexical (ADR-016) |
| `cover_media_id` | Media reference | no | Optional | Yes | DC·SPEC-VERBATIM |
| `country_ids` | Many-to-many | no | Optional | Yes | DC·SPEC-VERBATIM |
| `collection_ids` | Many-to-many | no | Optional | Yes | DC·SPEC-VERBATIM |
| `artifact_ids` | Many-to-many | no | Optional | Yes | DC·SPEC-VERBATIM |
| `source_ids` | Relationships | no | Conditional | Appropriate public reference | DC·SPEC-VERBATIM |
| `author_reference` | User / approved display name | no | Optional | If approved | DC; attribution is an Owner fact — Standard §13, Directive §9 |
| `curator_note` | Localized text | yes | Optional | Yes | DC·SPEC-VERBATIM |
| `publication_state` | Per-locale state | per locale | Required | No | `DC·ADR-ADAPTED` (ADR-008) |
| timestamps | System | no | System | No | DC·SPEC-VERBATIM |

Line 1221: relationships must be meaningful and explicit — enforced as a validation rule, not only a UI convention.

### 3.4 ArtifactClaim and ClaimEvidence — §8.11, lines 1251–1268

The spec enumerates these as required content, not as a table; field names below are the design contract mapping each
bullet (`DC`), the content requirement itself is spec-verbatim.

**ArtifactClaim** (lines 1255–1262)

| Field | Maps to spec bullet | Localized | Status |
|---|---|---|---|
| `id` | "Claim ID" (1255) | no | DC·SPEC-VERBATIM |
| `artifact_id` | "linked artifact" (1255) | no | DC·SPEC-VERBATIM |
| `claim_type` | "Claim type" (1256) | no | DC·SPEC-VERBATIM (controlled values not enumerated by the spec — `DC·OPEN`) |
| `claim_text` / `structured_value` | "Claim text or structured value" (1257) | yes (text) | DC·SPEC-VERBATIM |
| `language` | "Language, where applicable" (1258) | no | DC·SPEC-VERBATIM |
| `claimReviewState` | "Current review status" (1259) | no | **`DC·ADR-ADAPTED`** — namespaced per ADR-009; enum verbatim from line 1266 |
| `uncertainty_qualification` | "Uncertainty or qualification" (1260) | yes | DC·SPEC-VERBATIM |
| `reviewed_by`, `reviewed_at` | "Reviewer and review timestamp" (1261) | no | **`DC·OPEN`** — duplicated against `VerificationReview` (§8.2 line 1041); no stated authority, see §8 |
| `disclosure_rule` | "Visibility/disclosure rule" (1262) | no | DC·SPEC-VERBATIM |

`claimReviewState` enum, verbatim from line 1266: `Draft`, `Awaiting Evidence`, `Under Review`, `Supported`,
`Partially Supported`, `Conflicting Evidence`, `Not Established`, `Rejected`, `Requires Re-review`.

**ClaimEvidence** (line 1264, verbatim: *"links a claim to one or more Source records and records the evidential
relationship, reference location, relevant excerpt or note (subject to rights), and whether the source supports,
contradicts, or contextualizes the claim"*)

| Field | Status |
|---|---|
| `id`, `claim_id` | DC |
| `source_ids` (one-to-many from a claim; plural because line 1264 says "one or more Source records") | DC·SPEC-VERBATIM |
| `evidential_relationship` | DC·SPEC-VERBATIM |
| `reference_location` | DC·SPEC-VERBATIM |
| `excerpt_or_note` — subject to rights; internal, never indexed (line 1410) | DC·SPEC-VERBATIM |
| `stance`: `supports` \| `contradicts` \| `contextualizes` | DC·SPEC-VERBATIM |

Line 1268 + §11.5 (line 1577): `Supported` is reachable only after evidence review, and a public summary "must not
imply more certainty than the reviewed claims support" — a validation/derivation rule, not a display rule.

### 3.5 MediaAsset — §8.14, lines 1301–1319

| Field | Logical type (spec) | Localized | Required (spec) | Status |
|---|---|---|---|---|
| `id` | UUID | no | System | DC·SPEC-VERBATIM |
| `filename` | String | no | Required | DC·SPEC-VERBATIM |
| `storage_key` | Protected storage reference | no | Required | DC; private by default, server-side credentials only (Standard §6) |
| `mime_type` | String | no | Required | DC; validated with magic bytes, not extension (Standard §6) |
| `file_size` | Integer | no | System | DC·SPEC-VERBATIM |
| `width`, `height` | Integer | no | System where image | DC·SPEC-VERBATIM |
| `aspect_ratio` | Numeric | no | System where image | DC·SPEC-VERBATIM |
| `checksum` | String | no | System | DC — matches the SHA-256 already recorded for all 82 assets (`docs/ASSET_INVENTORY_AUDIT.csv`) |
| `alt_text_en`, `alt_text_ar` | Localized text | yes | Required for meaningful public images | DC·SPEC-VERBATIM. The delivered files' state moved on 4 November 2026: `Alt Text Status` is `Recorded — EN and AR` for **82 of 82** audited files, from `docs/asset-governance/descriptive-labels.json` (its `unlabelled.count` is **0**), and each string is written to describe what the picture shows while denying the inventory fact it cannot support. Before that date all 82 read `Not Recorded`. The migration into these two columns is still Phase 2 work — no collection exists to receive them |
| `caption_en`, `caption_ar` | Localized text | yes | Optional | DC·SPEC-VERBATIM |
| `media_role` | Controlled enum | no | Required | DC; roles named at line 1321 (logo, entrance, country hero, collection cover, artifact primary/secondary, story cover, AI Curator visual, decorative background, texture, …) |
| `focal_point` | Structured coordinates | no | Optional | DC·SPEC-VERBATIM |
| `rights_record_id` | Relationship | no | Conditional | **`DC·SUPERSEDED`** — ADR-012/S-05: replaced by the `media_asset_rights` join. The singular column would silently destroy the case §8.17 line 1373 names (one asset, several rights by use). |
| `is_primary` | Boolean | no | As required by related object | DC·SPEC-VERBATIM (lives on the usage relationship, not the asset) |
| `display_order` | Integer | no | Optional | DC·SPEC-VERBATIM |
| `source_asset_id` | Media relationship | no | For derivatives | DC; original/derivative lineage — Standard §6, §8.18 line 1386 |
| timestamps / uploader | System | no | System | DC·SPEC-VERBATIM |

Additional planned columns (Standard §6 + §13.2 + ADR-013, `DC·ADR-ADDED`): `asset_id` (`NDM-AST-###`, §8 `DC`),
`ai_generated` (boolean), `rights_review_state`, `processingState` (§5), `storage_class` (public derivative vs
restricted original). Master Spec line 1916 is explicit that the ten additional requested assets are illustrative
country/category visuals, **not evidence of actual objects**, and line 1914 requires labelling where used.

### 3.6 RightsRecord — §8.15, lines 1327–1342

| Field | Logical type (spec) | Required (spec) | Status |
|---|---|---|---|
| `id` | UUID | System | DC·SPEC-VERBATIM |
| `rights_holder` | String/reference | Required when known | DC; **values are Owner-supplied facts** (Standard §13) — `BLOCKED-OWNER` |
| `creator` | String | Optional | DC; likewise `BLOCKED-OWNER` |
| `rights_type` | Controlled enum | Required | DC·SPEC-VERBATIM |
| `permission_status` | Controlled enum | Required | DC; enum verbatim from line 1344 / §11.6 lines 1583–1591: `Unknown`, `Permission Pending`, `Under Review`, `Rights Confirmed`, `Public Domain Documented`, `Licensed`, `Restricted`, `Not Cleared`, `Expired` |
| `attribution_text` | String | Conditional | DC·SPEC-VERBATIM |
| `license_reference` | URL/document reference | Optional | DC·SPEC-VERBATIM |
| `usage_scope` | Structured list | Required | DC·SPEC-VERBATIM — this is the column the ADR-012 join scopes |
| `allowed_channels` | Structured list | Optional | DC·SPEC-VERBATIM |
| `geographic_restrictions` | Structured list | Optional | DC·SPEC-VERBATIM |
| `start_date`, `expiry_date` | Date | Optional | DC·SPEC-VERBATIM |
| `permission_document` | Protected file reference | Optional | DC; never indexed, never public (line 1410) |
| `reviewed_by`, `review_date` | User/timestamp | Optional | DC·SPEC-VERBATIM |
| `notes` | Internal text | Optional | DC·SPEC-VERBATIM |

Line 1344 forbids the default assumption: *"The presence of a file in the library does not prove a right to display it."* — the
audit measured this: all 82 catalogued assets carry `UNKNOWN — no rights statement supplied in reference/`
(`docs/ASSET_INVENTORY_AUDIT.csv`).

### 3.7 Inquiry, User, PublicationRecord, Revision, AuditEvent — §8.16, lines 1348–1356

The specification states these as content sentences. The field lists below are the design contract mapping them
one-to-one; all are `DC`.

**Inquiry** (line 1348): `id`, `submitter_fields` (only those required by the form), `category`, `subject`, `message`,
`submitted_at`, `assigned_to`, `inquiryState`, `internal_notes`, `response_history`, `retention_metadata`.
- `inquiryState` enum verbatim §11.10 lines 1625–1632: `Received`, `Unassigned`, `Assigned`, `In Review`,
  `Awaiting Additional Information`, `Replied`, `Resolved`, `Closed`.
- Line 1634 + G.8 row 13 (line 3816): PII is role-restricted and governed by the retention policy.
- Never a knowledge source and never indexed (§9.1 line 1410; §14.4 lines 1980–1987).
- **Design note:** an inquiry is an institutional communication record. It carries no commerce semantics of any kind
  (Appendix G.3 lines 3694–3702; §6.12 line 838+). No price, cart, order or product column may ever be added.

**User** (line 1350): `id`, `name`, `email`, `active_state`, `roles`, `permission_scope`, `created_at`, `last_access`,
`security_state`. Line 1350 verbatim: *"Passwords, secrets, recovery tokens, and signing credentials are not content
fields and must never be displayed in the CMS."* — they are also not listable columns; auth material is handled by
Payload's supported auth mechanism and, where local, Argon2id (Standard §4.1). MFA is mandatory for Owner and
privileged accounts (Standard §4.1; Directive §13); the mechanism is **decided by ADR-025** — the second factor is
enforced by a maintained OIDC-compatible provider and consumed through `auth.strategies`, with local staff
passwords disabled and exactly one audited break-glass account. ADR-025 changes how a `User` authenticates, not
the `User` field list above: no identity-provider column is added by that decision, because none is required by
Master Spec line 1350 and adding one would be a schema claim with no source.

**PublicationRecord** (line 1352; **ADR-008**, resolves S-02 / D-02): `content_entity_type`, `content_entity_id`,
`locale`, `publication_state`, `published_at`, `unpublished_at`, `publisher`, `scheduled_time`, `route_slug_version`.
- Keyed by **(entity, locale)** — one row per locale, which is what makes line 1453's requirement satisfiable without
  Payload's `experimental.localizeStatus` flag (forbidden by Standard §2.3/§15 for a mandatory requirement).
- `publication_state` enum from §11.3 line 1555 + line 1557: `Draft`, `In Review`, `Approved`, `Scheduled` (optional),
  `Published`, `Unpublished`, `Archived`. Namespaced as `publicationState` per ADR-009.
- publication is derived from the relevant `PublicationRecord`, *"never from one global field"* — the wording of
  `docs/ARCHITECTURE_DECISIONS.md` line 391 (ADR-008), this project's own rule rather than a specification quotation.
- Every publish/unpublish/archive is an explicit, audited operation (`AuditEvent`, §11.12 line 1654).

**Revision** (line 1354): `record_type`, `record_id`, `revision_id`, `previous_and_new_values` *or* a safe structured
diff, `author`, `timestamp`, `change_reason`, `associated_review_or_publication_state`.
- Realized as Payload's native version documents (adapter-managed tables) plus a custom `revision_annotation` table
  for `change_reason` and the review/publication linkage, which the native document does not carry. `DC·OPEN` on the
  exact diff shape (Master Spec line 1354 says "previous and new values or a safe structured diff").
- Line 1557: returning a record for correction must preserve the previous revision; archiving retains the instance.
- §18.5, §18.6 and G.8 row 15 (line 3818) are the screens; emergency withdrawal must be revision-preserving.

**AuditEvent** (line 1356): `id`, `timestamp`, `actor`, `action`, `target_record`, `outcome`, `before_after_state`
where appropriate, `security_context`. Line 1356: *"Audit records are protected from ordinary editing."* G.8 row 19
(line 3822): *"Audit records are append-only to ordinary application roles."*
- **Custom Drizzle table.** Enforcement design, now **decided and implemented as ADR-019**: `INSERT` + `SELECT`
  only for the runtime role (ADR-005 as refined), no `UPDATE`/`DELETE` grant, `TRUNCATE` withheld, plus a
  superuser-owned append-only guard trigger and `FORCE ROW LEVEL SECURITY` deny policies so the table owner is
  bound too — because `ALTER DEFAULT PRIVILEGES` cannot name a table, the exception is applied by
  `scripts/db/harden-append-only.sh` after each migration and asserted by `scripts/db/verify-privileges.sh`. A
  Payload collection cannot express a grant the runtime role must not have, so this table deliberately leaves the
  CMS layer. **Status: authored; the grant design was executed and demonstrated against a live PostgreSQL 18.6
  server on 1 November 2026 in a disposable container** (`docs/A5_PRIVILEGE_EVIDENCE.txt`, exit 0, 14 of 14
  behavioural cases) — **but not in this project's database**, which does not exist (B-03). So this is a
  demonstrated design, not yet a deployed privilege boundary.
- Coverage set is line 1654 (§11.12): creation, edits, review decisions, verification changes, publication,
  unpublication, archiving, restoration, rights updates, and more.
- Disabling or bypassing audit logging must not be reachable from the CMS (§15.3 lines 2136–2148; G.7 line 3767+).

---

## 4. Country, Era, Category, Source (contracts already tabulated by the spec)

These four are fully field-enumerated in the source and are adopted unchanged as `DC`; they are listed here for
completeness rather than re-typed in full. Read them with the same status rules as §3.

| Entity | Source lines | Notable contract |
|---|---|---|
| `Country` | §8.3, 1059–1075 | `slug` required+unique; `name_en`/`name_ar`; `introduction` required **for an open exhibition**; `exhibition_status` required; line 1077: *"A Country record is not proof that its exhibition is complete."* |
| `Era` | §8.4, 1085–1094 | `date_precision` required; supported precision verbatim line 1096: Exact Date, Exact Year, Approximate Year, Estimated Range, Broad Historical Period, Unknown |
| `Category` | §8.5, 1104–1113 | `parent_id` hierarchy; `is_active` required; line 1115: deactivating a category must not delete artifact records, and a replacement/migration plan must exist before removal |
| `Source` | §8.10, 1229–1243 | `source_type` controlled enum required; `review_status` required; `excerpt` subject to rights; line 1247: *"A source link alone does not establish authenticity, ownership, or provenance."* |

`Country.exhibition_status` carries **six** values, not five and not four — ADR-010 / S-01: `Planned/Coming Soon`,
`In Preparation`, `Open Exhibition`, `Temporarily Unavailable`, `Closed/Archived` (§11.9 lines 1613–1617) **plus**
`Hidden/Not Public` (G.4 line 3723, which carries the behavioural rule that the route is not exposed through
navigation, search, sitemap or AI retrieval). §6.3 lines 625–628 is the visitor-facing label subset only.
Namespaced column: `exhibitionState`.

---

## 5. The eight state dimensions (ADR-009)

Master Spec §11.1, line 1524 (verbatim): *"State dimensions are independent. No single 'status' field may be used to
represent all aspects of editorial approval, factual verification, rights clearance, translation…"*
§8.18 line 1390 restates it as a data rule: *"Separate publication, verification, translation, media-processing, and
rights states."*

**Design contract — one namespaced column per dimension, never collapsed:**

| # | Dimension (§11.1 lines 1530–1537) | Namespaced column | Machine / enum source | Applies to | Status |
|---|---|---|---|---|---|
| 1 | Editorial workflow | `editorialState` | §11.2 line 1543 `Draft → In Review → Approved`; branches 1547–1549 | Collection, Artifact, Story, Country, Source | `DC·ADR-ADDED` (naming) |
| 2 | Claim verification | `claimReviewState` | §8.11 line 1266 — 9 values | ArtifactClaim | DC |
| 3 | Locale translation | `translationState` | §10.7 lines 1491–1497 (see table below) — 7 values | per (entity, locale) | DC |
| 4 | Publication | `publicationState` (on `PublicationRecord`) | §11.3 line 1555 + 1557 | all content | `DC·ADR-ADAPTED` (ADR-008) |
| 5 | Media processing | `processingState` | §11.8 line 1603 `Uploaded → Security Scan → Processing → Ready for Review → Approved for Use`; exceptions line 1605 | MediaAsset | DC |
| 6 | Rights permission | `permission_status` on `RightsRecord` | §11.6 lines 1583–1591 — 9 values | RightsRecord, `media_asset_rights` | DC |
| 7 | Exhibition availability | `exhibitionState` | §11.9 lines 1613–1617 **+** G.4 line 3723 — 6 values (ADR-010) | Country | `DC·ADR-ADAPTED` |
| 8 | AI knowledge eligibility | `aiKnowledgeEligibility` | §14.3–14.4 lines 1966–1987; ADR-017 | `AIKnowledgeSource` + per-record gate | DC |

**Shared-label collision rule (S-03 / ADR-009).** `Draft`, `In Review` and `Approved` appear verbatim inside three
different machines — §11.2 line 1543 (editorial), §11.3 line 1555 (publication) and §8.11 line 1266 (claim review,
which also begins at `Draft`). Each value is therefore stored under its own column name so no query, filter or admin
badge can read one label as another. Per ADR-009, a Control Center state chip that collapses two dimensions into one
badge is a defect.

**Additional state vocabularies that are *not* among the eight but are separate, non-collapsible enums in the model:**
`inquiryState` (§11.10 1625–1632), AI response states (§11.11 1640–1648), asset readiness/use states (§13.3 lines
1872–1889, 18 distinct values; line 1870 verbatim: *"The following states are distinct and must not be collapsed into
a single 'complete' flag"*), and the asset governance lifecycle chain (A.11 line 3467). S-10 rules that these three
asset chains are three dimensions of the same object, not one status column, and must never be averaged into a single
completion percentage. `DC`.

**Translation states verbatim (§10.7 lines 1491–1497):** Not Translated, Draft Translation, In Review, Approved,
Published, Requires Correction, Outdated / Re-review Required. Line 1449: a source-text change must mark the dependent
translation as potentially outdated — an invalidation rule with data consequences (§11.4 line 1571).

---

## 6. Relationship cardinality

§8.17 lines 1360–1374 is reproduced **verbatim** below, with the design's actual position in the last column.

| Relationship (spec wording) | Cardinality (spec, verbatim) | Rule (spec, verbatim) | Design position |
|---|---|---|---|
| Country ↔ Collection | Many-to-many | A curated collection may span countries | As spec — `collection_country` join |
| Country ↔ Artifact | Many-to-many through typed relationship | Record whether a country is issuer, origin, production location, find location, or cultural association | **`ADR-ADDED`** — `ArtifactCountryRelationship` table (ADR-012 / S-06). The Artifact field table (1147–1172) has no country field at all, so the typed m2m named here could not otherwise exist. Controlled types verbatim line 1376: `Issued In`, `Produced In`, `Originated In`, `Found In`, `Associated With`, `Used In`, or other controlled values. "A primary display country is a presentation choice; it does not erase other documented relationships" (1376) becomes stored data. |
| Collection ↔ Artifact | Many-to-many | A primary display collection may be designated without restricting other memberships | As spec; `is_primary` lives on the relationship row, not the artifact |
| Category ↔ Artifact | Many-to-many or controlled primary + secondary taxonomy | The approved ERD must support valid cross-classification without duplication | `DC·OPEN` — the spec offers a choice; `artifact.category_ids` (line 1154) is already a list, which satisfies the m2m branch. Primary/secondary designation is not selected. |
| Era ↔ Artifact | Many-to-one or many-to-many according to documented periods | Do not force a precise era if the date is uncertain | **`DC·OPEN` — conflict.** §8.7 line 1155 declares singular `era_id`; this row permits many-to-many. Not covered by S-01…S-15. Reported, not decided (see §8) |
| Story ↔ Artifact | Many-to-many | Relationship must be meaningful and explicit | As spec |
| Story ↔ Collection | Many-to-many | Relationship must be editorially justified | As spec |
| Story ↔ Country | Many-to-many | Country association must be meaningful | As spec |
| Artifact ↔ Source | Many-to-many through ArtifactClaim / ClaimEvidence | Sources support claims, not merely the artifact in the abstract | As spec — no direct `artifact_source` column. **`DC·OPEN` gap:** §8.12 line 1282 requires `ProvenanceEvent` to carry "supporting source/evidence links", but this table gives `ProvenanceEvent ↔ Source` no canonical cardinality. Reported, not decided |
| Artifact ↔ ProvenanceEvent | One-to-many | Events remain chronologically ordered and evidence-linked | As spec; ordering column + evidence links required |
| MediaAsset ↔ Artifact/Story/Collection/Country/Page | Many-to-many through usage relationships | Usage role and rights context must be retained | Hand-authored `artifact_media_relationship`-style joins carrying `media_role`, `is_primary`, `display_order`. **`DC·OPEN`:** `Page` is named here but does not exist in §8.2 — see §2.1 |
| MediaAsset ↔ RightsRecord | One-to-many **or** many-to-many where rights differ by use | No universal permission assumption | **`ADR-ADDED`** — join `media_asset_rights` (ADR-012 / S-05). Singular `rights_record_id` (line 1315) is superseded because it silently destroys the many-to-many branch the spec explicitly allows |
| Entity ↔ Locale | One-to-many localized records | Locale-specific editorial and publication states | Split per ADR-008: field content via Payload `localized: true`; per-locale **state** via `PublicationRecord` (+ `translationState`). Payload's `experimental.localizeStatus` is rejected (D-02) |

**Line 1378 (verbatim):** *"Removing a relationship must not delete the underlying artifact, story, collection,
source, or media record."* This is the primary deletion rule and is carried into §7.

---

## 7. Index and constraint plan

All rows are `DC`. Physical index names are provisional and will be fixed by the migration that creates them.
Standard §3.3 line 112: *"Index fields used by approved filters, joins, full-text search, and routes."*

### 7.1 Uniqueness and identity

| Constraint | Columns | Why | Source | Status |
|---|---|---|---|---|
| PK | `id` (UUID) on every entity | *"Primary keys must be stable and never derived from localized labels"*; *"do not use mutable titles as primary keys"* | Standard §3.3 line 110; §8.18 line 1382 | DC |
| Unique slug per locale+route namespace | `(route_namespace, locale, slug)` on Country, Collection, Artifact, Story, Category, Era, `PublicationRecord` | *"Enforce unique canonical slugs within the appropriate locale and route namespace"*; *"Duplicate or conflicting slugs must be prevented"* | §8.18 line 1383; §4.4 line 446 | DC |
| Unique `PublicationRecord` key | `(content_entity_type, content_entity_id, locale)` | ADR-008 makes the record authoritative; two rows per locale would recreate the S-02 ambiguity | ADR-008; §8.16 line 1352 | DC |
| Unique `NDM-AST-###` | `asset_id` on MediaAsset | ADR-013; stable, never re-used or renumbered | ADR-013; §A.10 line 3463 | DC |
| Check constraint on unknown-value encoding | every nullable/optional factual column | §8.18 lines 1393–1394: distinguish `Unknown`, `Not Applicable`, `Not Recorded`, `Restricted`, `Pending Verification`; *"Do not use an empty string to represent a meaningful unknown state."* Repeated at line 999 | lines 1393–1394, 999 | DC |
| Check on exhibition state | `exhibitionState` IN the six ADR-010 values | prevents the §6.3 four-label subset being treated as the full enum | ADR-010; G.4 line 3723 | DC |

### 7.2 Foreign keys and deletion behaviour

| Relationship | ON DELETE | Why |
|---|---|---|
| Join rows → Artifact / Story / Collection / Source / MediaAsset | `RESTRICT` on the referenced row; join rows themselves are removable | line 1378 — removing a relationship must not delete the underlying record |
| `ArtifactClaim` → `Artifact` | `RESTRICT` | Historical claims must not vanish with a parent (§3.3 retention rule) |
| `ClaimEvidence` → `ArtifactClaim`, → `Source` | `RESTRICT` | Evidence is historical (Standard §3.3 line 115) |
| `RightsRecord` → `MediaAsset` (join) | `RESTRICT` | Rights are historical; expiry is a state change, not a delete |
| `AuditEvent` → actor, → target record | **Denormalized actor/target snapshots, no cascade path at all** | An audit row must outlive the record it describes; the runtime role has no `DELETE` grant |
| `Revision` / version documents → parent | `RESTRICT` | §11.3 line 1557: returning for correction preserves the previous revision |
| `Inquiry` → submitter (if ever an account exists) | No FK cascade; account deletion is a retention-policy action | accounts are excluded from V1 (§3.3 line 383+, §2.6 line 304); PII retention line 1634 |
| `Category` deactivation | `is_active = false`, never delete | line 1115: *"Deactivating a category must not delete artifact records"* |

**The binding retention rule** (Technology Standard §3.3, line 115, verbatim):

> *"Do not delete historical claims, evidence, rights, audit events, or revisions through cascading deletes without an
> approved retention rule."*

Enforcement design, all `DC`:
1. No `ON DELETE CASCADE` anywhere on `ArtifactClaim`, `ClaimEvidence`, `RightsRecord`, `AuditEvent`, or revision
   storage. The default posture is `RESTRICT`.
2. Referenced institutional records are archived, not deleted: *"Do not permanently delete referenced institutional
   records through ordinary UI actions"* (§8.18 line 1392); Module 20 + G.8 row 20 (line 3823) make archive/restore a
   permission-checked action that creates a new event, and §18.8 governs deletion.
3. An approved retention rule is an **Owner/legal input**, not an engineering default (Standard §13 "Institutional
   legal identity and jurisdiction"; §19.1 line 2850+). Until one exists, `RESTRICT` stands and no delete path is
   built. `BLOCKED-OWNER`.
4. *"Prevent orphaned relationships"* (line 1384) is enforced by FK + access-control validation, not by application
   cleanup jobs that could cascade.

### 7.3 Planned indexes by query

| Index (planned) | Table(columns) | Type | Serves | Source |
|---|---|---|---|---|
| slug lookup | each content table `(locale, slug)` | btree unique | Every public route in §4.2 lines 412–426 | §4.4 line 438 |
| publication gate | `publication_record (content_entity_type, content_entity_id, locale, publication_state)` | btree | "Published is derived from the record" — every public read path | ADR-008 |
| state filters | `editorialState`, `claimReviewState`, `translationState`, `processingState`, `permission_status`, `exhibitionState`, `aiKnowledgeEligibility` | btree | Control Center Module 01 attention queues and every list filter (G.8 lines 3804–3823); §16.6 line 2427 "Filter by review status, locale readiness, rights state, publication state" | ADR-009 |
| join FKs | every join table, both directions | btree | m2m reads in §8.17 1362–1373 | Standard §3.3 line 112 |
| taxonomy walk | `category (parent_id)`, `category (is_active, display_order)` | btree | Controlled hierarchy §8.5 line 1115; filter dimensions §9.3 line 1424 | lines 1108, 1424 |
| artifact classification | `artifact_category (category_id, artifact_id)`, `artifact_country_relationship (country_id, relationship_type)` | btree | Filters named at line 1424 (Country, Era/Period, Artifact Type, Category, Collection, Material) and typed country queries | ADR-012 |
| era range ordering | `era (start_year, end_year)`, `era (date_precision)` | btree | Historical Period sort; chronology only when data supports it (line 1426) | line 1426 |
| media usage | `artifact_media_relationship (artifact_id, is_primary, display_order)` | btree | §6.7/§6.8 gallery ordering; §8.14 lines 1316–1317 | lines 1316–1317 |
| checksum | `media_asset (checksum)` | btree | Duplicate detection §13.8 line 1939+; audit already records SHA-256 for 82/82 files | §13.8; `docs/ASSET_INVENTORY_AUDIT.csv` |
| derivative lineage | `media_asset (source_asset_id)` | btree | Original/derivative separation (line 1386; Standard §6) | line 1318 |
| audit query | `audit_event (created_at)`, `(actor)`, `(target_type, target_id)`, `(action)` | btree | Module 19 search/filter/export, G.8 line 3822 | §16.19 |
| inquiry queue | `inquiry (inquiryState, assigned_to, submitted_at)` | btree | Module 13 inbox G.8 line 3816 | §11.10 |
| **full-text search** | artifact title/original title/alternative names, public summaries, approved metadata, country names, period labels, category names, collection titles, story titles/summaries — **field list from line 1408; concrete index columns deferred** | `tsvector` (GIN) per locale + `pg_trgm` GIN for tolerance of capitalization/spacing/punctuation (line 1414) | §9.1–9.3; ADR-006 | line 1408, 1414, 1424; Standard §3.3 line 116 |
| partial/filtered search index | only rows eligible for public search | partial index predicate built from publication + rights + access + exhibition-visibility dimensions | §9.1 line 1406 | ADR-017 |
| composite | `(locale, publication_state, display_order)` on listing tables | btree | §7.6 line 1001: public counts count only records eligible for public display **in the selected language** | line 1001 |

Search-index **exclusions** are a hard data rule, not a runtime filter accident: line 1410 forbids indexing drafts,
private curatorial notes, private provenance documents, rights permission files, visitor inquiries, user records and
internal notes. The partial-index predicate is the enforcement point, and the AI retrieval gate (ADR-017) is keyed to
the same dimensions. `DC`.

### 7.4 Transactions and concurrency

Standard §3.3 lines 113–114: *"Use transactions for multi-record workflows that must commit atomically"* and *"Prevent
concurrent editors from silently overwriting consequential content."*
`DC`: publish/unpublish (writes `PublicationRecord` + `Revision` + `AuditEvent` together) and rights approval are
single transactional units; optimistic concurrency on editable content per §18.4 line 2826+. No implementation exists.

---

## 8. NOT A DECISION

The following are **not settled by the source text alone**. Items 1–2 are deliberate deferrals, items 3–6 were
findings that are now decided by an ADR (the decision is recorded, the model is not yet built), and the rest are
either unresolved in the source or Owner inputs that must not be fabricated (Standard §13). Listing something here
is not permission to guess at it during implementation, and an ADR pointer is not permission to treat the table
as built.

1. **Search index field names and columns are deferred to Phase 2** (ADR-006). §9.1–9.3 (lines 1406–1426) define
   *eligibility, behaviour, filter and sort dimensions* but name no index entity and no index field — logged as S-08.
   This document therefore plans the *index strategy* only. No column list is asserted.
2. **No `pgvector` column, and specifically not the `VECTOR(768)` figure.** ADR-007 / S-07 rest on three
   independent statements: §8.19 line 1398 (it is "not a public artifact field or a fixed product requirement", and the
   dimension must match a selected and tested model), §9.4 line 1430 (advanced semantic retrieval is Future Scope), and
   Standard §3.3 line 117 (*"Do not hard-code a vector dimension before selecting and testing the embedding model."*).
   Adopting 768 would be a false record. V1 AI Curator retrieval is keyword/full-text behind permission filtering
   (ADR-017).
3. **`Era ↔ Artifact` cardinality conflict** — new at discovery, now **decided by ADR-021**. §8.7 line 1155
   declares a singular `era_id`; §8.17 line 1366 allows many-to-many "according to documented periods". The
   authoritative relation is a new `ArtifactEra` join (`artifact_id`, `era_id`, `basis`, `confidence`, `note`);
   `era_id` remains on the artifact as written but is a **derived display/sort projection**, never independently
   editable. Not yet created — Phase 2 migration work.
4. **`ArtifactClaim` review-holder ambiguity** — new at discovery, now **decided by ADR-023**. §8.11 lines
   1259–1261 require each claim to store "Current review status" plus "Reviewer and review timestamp", while
   §8.2 line 1041 defines a separate `VerificationReview` entity holding "a review decision on a claim or
   defined set of claims". `VerificationReview` is the single source of truth; the two claim fields are
   transactional projections of its latest applicable row. Same structural shape as S-02, which was resolved
   the same way by ADR-008.
5. **`ProvenanceEvent ↔ Source` had no canonical cardinality** — new at discovery, now **decided by ADR-024**.
   §8.12 line 1282 requires provenance events to carry "supporting source/evidence links"; §8.17 line 1370
   routes Artifact↔Source exclusively through ArtifactClaim/ClaimEvidence and gives ProvenanceEvent↔Source no
   row. Resolution: `ProvenanceSourceLink` (many-to-many, controlled `role` list) supports the event, and any
   claim *about the artifact* still requires `ArtifactClaim`/`ClaimEvidence`, so line 1370 is preserved rather
   than bypassed. The added cardinality is this project's own model record, not a quotation of §8.17.
6. **`Page` is not in the logical entity list** — new at discovery, now **decided by ADR-022**. §8.17 line 1372
   names `Page` as a MediaAsset usage target and §16.2 (lines 2285–2341) specifies a full page/section/template
   editor, but §8.2 (1032–1051) contains no `Page` entity and §8 has no page field table. `Page`,
   `PageSection` and `Template` become first-class, every field traced to a §16.2 line, publication state kept
   in `PublicationRecord` per ADR-008. Decided at the model level only: no migration, no route, no test exists.
7. **Category-specific metadata profiles are not a closed baseline.** §8.8 lines 1182–1194 open every category list
   with "Potential fields include", which is illustrative rather than a fixed schema. Concrete per-category columns are
   Phase 2 work, and line 1198 forbids introducing additional profiles except through an approved category schema.
8. **`claim_type` controlled values are not enumerated** anywhere in §8.11. Not invented here.
9. **Revision diff representation** — line 1354 permits "previous and new values **or** a safe structured diff". The
   choice is unmade; it interacts with §18.5 and G.8 row 15 (line 3818).
10. **`LocalizedContent` vs a dedicated translation record** — §8.2 line 1045 names the former conditionally ("where a
    separate translation record is needed") and §10.7 line 1499 enumerates a translation record's contents. Which
    entity carries the §10.7 workflow fields is unresolved; ADR-008 settles only that localized *field content* stays on
    Payload's stable mechanism and publication *state* lives in `PublicationRecord`.
11. **Row-Level Security adoption.** Standard §4.2 line 155 permits it as defense in depth but requires it to be tested
    as the actual runtime role. Not decided; not assumed.
12. **Every factual value is an Owner input.** Accession numbers, real artifact records, dates, ownership, provenance,
    authenticity, condition, sources, image authorship, copyright and licence status are never to be invented (Directive
    §9; Standard §13; §2.8 line 338+; §19.1). The schema must be buildable; the rows must stay empty until supplied.
    The audit measured exactly this: 82/82 catalogued assets carry `UNKNOWN` rights and `Not Approved` status
    (`docs/ASSET_INVENTORY_AUDIT.csv`), and the ten Appendix A.8 AI-generated assets
    (`NDM-AST-073`…`NDM-AST-082`) are quarantined in `Noujoude.photo/_pending_review_AI_generated/` with
    `approval_state: "Pending Human Approval"` and `rights_state: "Awaiting Rights Review"` in `_manifest.json` lines 21–23
    —
    model-ready, not publishable.
13. **Retention rules for historical records.** §7.2 rule 3. None exists; therefore no cascade path exists.
14. **Physical SQL, generated column types, and exact DDL.** Owned by the migration stream (§9), which does not exist
    yet. Master Spec §8.19 line 1398 keeps this document explicitly on the logical side of that boundary.

---

## 9. Migration and versioning plan

Governed by Technology Standard §3.4 (lines 121–126) and §3.2 (roles), executed under ADR-002, ADR-004 and ADR-005.
Everything below is a plan. **No migration has been written, generated, or applied** — the migration directory does
not exist. **The reason for that changed on 1 November 2026:** this sentence used to read *because `pnpm install`
cannot yet run (B-01)*, and B-01/B-02 are now cleared — `payload` 3.92.1 and `@payloadcms/*` are installed, so
`pnpm migrate:create` is executable in principle. It has not been run because **there are no Payload collections to
generate a migration from**: `src/` holds no application code, and authoring them is Phase 2 item 1. A blocked
prerequisite and an unbuilt dependency are different facts, and the plan should not confuse them.

**Sequence (`DC`, planned):**

| Step | Action | Gate |
|---|---|---|
| 0 | Host Node 24 in the `>=24.22.1 <25` range installed | ADR-003 / B-01 — **done 1 Nov 2026 under OD-1: `node -v` → `v24.22.1`, and preflight prints `PASS \| Node.js 24.22.1`. ADR-003's own text named 24.22.2 because that was the newest 24.x at read time; the requirement was always the range, and the range is met** |
| 1 | `pnpm install`; lockfile committed; `@payloadcms/*` + `payload` pinned identically (3.92.1) | ADR-002 constraint, `ARCHITECTURE_DECISIONS.md` §5 — **done 1 Nov 2026 under OD-2: install exits 0, `pnpm-lock.yaml` is 285,200 bytes / 8,399 lines / lockfileVersion 9.0 with 701 `.pnpm` entries, and it is committed source. The pins resolved identically at 3.92.1** |
| 2 | `postgres:18.6-alpine` via Docker Compose, `127.0.0.1:5432` only, healthcheck | ADR-004. The image is in the local cache since 1 Nov 2026 (`docker images` rc=0, 433 MB) and the engine answers (`docker info` rc=0), so **B-09 no longer binds this step**. **Neither does B-03, which did when this row was last written:** OD-3 created `.env` on 1 Nov 2026 and `docker compose config --quiet` now exits **0** (the seven `:?` guards are satisfied by present values, not removed — the negative case is still proven by suppressing the env file, and `scripts/tests/verify-compose-config.test.mjs` asserts exactly that). What binds this step now is simply that nobody has run `pnpm db:up` in this batch: `docker ps -a` shows three stopped containers from a different project and no `ndm-postgres`. **Note the engine caveat: reachability here is a latency property, not a constant — a 60 s probe after idle returned rc=124 and a 120 s probe returned rc=0 in the same window** |
| 3 | Bootstrap migration + `scripts/db/init-roles.sh` create the four roles (migration, runtime, reporting, backup) | ADR-005 as refined by **ADR-019**; Standard §3.2 lines 99–106; runtime role DML-only, non-superuser, no `BYPASSRLS`, no `UPDATE`/`DELETE` on append-only relations |
| 4 | Payload-generated migration: base collections (§8.3–8.16) | Standard §3.4 line 121 "Every schema change must be a committed migration" |
| 5 | Adapter-extension migration: custom Drizzle tables — `audit_event`, `artifact_country_relationship`, `media_asset_rights`, `revision_annotation`, `translation_record` (if taken) | ADR-002/011/012; same migration stream, explicit names/FK/indexes/order per Standard §3.1 |
| 6 | Index migration: §7 uniqueness, §7.3 filters/joins, FTS + `pg_trgm` | ADR-006; columns deferred to Phase 2 (item 1 of §8) |
| 7 | Append-only enforcement on `audit_event`: `pnpm db:harden` (`scripts/db/harden-append-only.sh`) revokes `UPDATE`/`DELETE`/`TRUNCATE` from `ndm_runtime` and attaches the guard trigger + forced RLS deny policies, then `pnpm db:verify-privileges` asserts the state and fails on violation | **ADR-019**; G.8 line 3822; Standard §3.3 line 115; Master Spec lines 1356, 2664. Runs after *every* migration, because `ALTER DEFAULT PRIVILEGES` cannot name a table |
| 8 | Seed of *structure only*: the six Country rows with truthful `exhibitionState`, the eight Category rows | Directive §5 lines 84–106; G.4 lines 3706–3715, 3725; §2.8 line 338 — **no fabricated artifact content** |

**Versioning rules adopted (verbatim obligations):**

- *"Every schema change must be a committed migration."* (Standard §3.4, line 121)
- *"Production migrations must be reviewed and run through controlled deployment steps."* (line 122)
- *"Never use development schema-push behavior against production."* (line 123) — no push path is configured against
  any environment other than local, and the CI pipeline exposes no schema-push command to the CMS (§15.3 lines
  2146–2148 forbid unrestricted schema changes and destructive operations from ordinary CMS surfaces).
- *"Test fresh database creation and upgrade from the immediately preceding schema."* (line 124) — both paths are
  required CI checks; Standard §12 item 10 (line 277) makes "database migration verification and restore test" a
  release check.
- *"Provide rollback or forward-recovery instructions for risky changes."* (line 125) — every migration ships with a
  written recovery note; archive/restore is the Module 20 surface (G.8 line 3823), which must create a new event
  rather than overwrite.
- *"Back up before destructive or data-transforming migrations."* (line 126), against the G.11 targets (DB RPO ≤1h /
  RTO ≤4h, line 3895) and the rule at line 3908 that a successful backup job is not proof of recoverability — only a
  tested restore is.

**Version history of this document:** any change to an entity, field, cardinality, index or constraint listed above is
a baseline change and must be *"versioned, justified, and assessed for cross-system impact"* (§23 item 20, line 3309),
recorded as a new ADR in `docs/ARCHITECTURE_DECISIONS.md` §6, and reflected in `docs/REQUIREMENTS_TRACEABILITY.md`
before any migration is authored. Synchronized `@payloadcms/*` bumps re-run the §3 compatibility matrix
(`ARCHITECTURE_DECISIONS.md` §8) first.

---

## 10. Re-verification triggers for this document

| Trigger | Action |
|---|---|
| First successful `pnpm install` | Confirm the adapter's real table-naming and version-document behaviour; replace provisional names in §7 with migration output |
| Any `@payloadcms/*` version bump | Re-run the compatibility matrix; if `payload@4.x` leaves beta, re-test D-02 and re-evaluate whether ADR-008 remains necessary |
| pgvector / embedding model approved | Re-open ADR-007; only then may a vector column and a dimension exist |
| Owner supplies retention rules | Replace `RESTRICT` defaults where a documented rule permits deletion, as a new ADR + migration |
| Any new conflict discovered while modelling | Log it in §8 and in the traceability register; do not resolve it silently inside a migration |
