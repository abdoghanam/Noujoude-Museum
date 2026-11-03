# NOUJOUDE DIGITAL HERITAGE MUSEUM — MEDIA & RIGHTS GOVERNANCE

**Document ID:** NDM-MED-001
**Version:** 1.0.0
**Date:** 31 October 2026
**Status:** **CONTRACT — UNIMPLEMENTED.** The lifecycle, metadata schema, rights model and safeguards below
are required rules with enforcement plans. **No asset in this project is production-ready, rights-cleared,
approved, optimized, integrated or verified.** The only affirmative physical claims in this document are the
measured ones in §6, each traceable to `docs/ASSET_INVENTORY_AUDIT.csv`, `docs/asset-audit-summary.json` and
`Noujoude.photo/_pending_review_AI_generated/_manifest.json`.
**Sources:** Master Specification Appendix A (**lines 3316–3471**, esp. A.9 3449–3459, A.10 3461–3463,
A.11 3465–3469), §13 Media/Asset Library & IP Governance (**lines 1829–1942**), §8.14 (1297–1321), §8.15
(1323–1344), §8.17 (1358–1378), §8.18 (1380–1394), §11.8 (1599–1607), §6.7 (696–727), §16.8 (2492–2508),
§19.7 (2944–2954), §23 invariants 12 and 18 (lines 3301, 3307), AST-001…AST-003 (lines 3089–3091), STT-002
(line 3086); Technology & Security Standard §6 (lines 182–193), §9 (line 224), §13 (lines 296–306);
ADR-009, ADR-011, ADR-012, ADR-013; discrepancies S-04, S-05, S-09, S-10, S-11.

---

## 0. Evidence rule governing this document

| Binding statement | Source | Effect here |
|---|---|---|
| "Do not claim a feature is implemented without verifying behavior." | Directive §17 (line 318) | Every lifecycle stage and every safeguard below is `Contract — unimplemented`. |
| "A route, React component, button, schema field, migration, or successful build alone is not proof." | Directive §15 (line 290) | The delivered `ASSET_INVENTORY_AUDIT.csv` is proof of a *measurement*, never of asset approval, integration or rights. |
| "A file in a library never counts as integrated or rights-cleared by default." | Master §23 (line 3307) | The central rule of this document. |
| "A file's presence in a folder, copy operation, manifest, code reference, or documentation list does not alone prove that it is correctly integrated or legally usable. An asset is accepted only when its file identity, intended role, actual UI context, responsive behavior, rights, and visual quality are verified." | Master §13.3 (line 1891) | Acceptance requires five verification classes; §6 records that **none** has been performed for any asset. |
| "The filenames below are transcribed from the supplied source inventory. They are reference requirements, **not proof that a file currently exists, has been generated, is legally cleared, is technically optimized, or is used by the live website.** A file must pass physical verification, metadata review, rights review, visual approval, and usage mapping before it is marked production-ready." | Appendix A.1 (line 3319) | The five named gates are §8's blockers; all are open. |
| "Illustrative imagery never becomes proof of artifact existence, ownership, authenticity, or historical fact." | Master §23 (line 3301) | §7 reproduces the A.9 safeguards as binding. |
| "No invented metrics, security compliance, or backup success claims." | Standard §15 (line 334) | §6 numbers are computed from the audit artifacts, not asserted; the reproduction commands are stated. |

Status vocabulary: Directive §15 line 288. Default here: **Not Implemented**, except where an item is
explicitly **Blocked by Owner Input** (rights facts are Owner inputs: Standard §13 line 302).

---

## 1. The asset lifecycle (Appendix A.11, line 3467)

Verbatim, the governance chain:

`Referenced → Located → Metadata Recorded → Rights Reviewed → Curatorial/Brand Approved → Optimized → Integrated → Verified in Context`

Eight labels, seven transitions. A.11 line 3469 adds the alternate statuses and the counting rule, verbatim:
*"An asset may be marked `Reference Only`, `Awaiting Generation`, `Awaiting Rights Review`, `Duplicate`,
`Rejected`, or `Archived`. **Status transitions must be auditable. No asset count may combine these distinct
states into one completion percentage.**"* Corroborated by A.9 line 3459: *"Each asset's technical and legal
status must be tracked separately: referenced, present, rights-cleared, approved, optimized, integrated, and
verified are different states."*

### 1.1 Required rule restated as an implementation contract

| ID | Rule | Enforcement | Status |
|---|---|---|---|
| L-01 | A single "asset complete %" is **prohibited** in any UI, report or metric. Any count must be broken out per A.11 stage and per alternate status. | Module 08 and Module 01 dashboard specs assert one number per stage; a `SUM(status)`-style aggregate is a review defect | Contract — unimplemented |
| L-02 | Stage transitions are auditable events. | A.11 line 3469; §16.19 line 2658 "Media replacement" and line 2659 "Rights updates" are required audit events; `AuditEvent` shape §8.16 line 1356 | Contract — unimplemented |
| L-03 | No stage may be inferred from a later one. Being `Located` is not `Metadata Recorded`; being `Optimized` is not `Rights Reviewed`. | A.9 line 3459; §23 line 3307 | Contract — unimplemented |
| L-04 | `Verified in Context` requires the five §13.3 verification classes: file identity, intended role, actual UI context, responsive behaviour, rights, visual quality (line 1891). | Playwright context tests per usage site; **no route exists to verify in** | Contract — unimplemented |
| L-05 | Six alternate statuses are first-class values, never mapped into the main chain. | ADR-009 namespacing; enum per dimension | Contract — unimplemented |

### 1.2 Where every asset actually sits on that chain (measured, not assumed)

| A.11 stage | Assets satisfying it | Evidence |
|---|---|---|
| Referenced | 82 | Appendix A.2–A.8 catalog parsed; `asset-audit-summary.json` `catalogTotal: 82`, `catalogParseDrift: []` |
| Located | 82 files present; 81 in expected container/format, 1 not | `original72`: 71 `PRESENT` + 1 `WRONG_FORMAT`; `additional10`: 10 `PRESENT` |
| Metadata Recorded | 82 have a **project-authored inventory row**; **0** have a `MediaAsset` record | 20 CSV columns × 82 rows (§3); no database exists |
| Rights Reviewed | **0** | `ASSET_INVENTORY_AUDIT.csv` column *Rights Status*: 72 × "UNKNOWN — no rights statement supplied in reference/", 10 × "Awaiting Rights Review" (state name at Master Spec §13.3 line 1885) |
| Curatorial/Brand Approved | **0** | column *Brand/Curatorial Approval*: **82 × "Not Approved — no approval record supplied"** |
| Optimized | **0** | column *Derivative Status*: 72 × "Original (no derivatives produced)"; `sharp` is a candidate pin, not installed |
| Integrated | **0** | column *Actual Usage*, regenerated 3 Nov 2026: 82/82 read "None recorded — no usage mapping is stored in this register; usage is resolved in code by src/lib/media/usage-map.ts (src/ holds 61 files at audit time)". The register stores **no** usage for any asset; `usage-map.ts` computes it from each row's declared surfaces. Measured on the same tree, and corrected the same day after an earlier draft of this row claimed `next/image` appeared in one file: **0** `next/image` imports exist under `src/` — the string occurs once, at `src/ui/media-slot.tsx:20`, inside the comment that records why plain `<img>` is used instead — and of the 21 `<img>` occurrences over 6 `src/` files, exactly **1** is a rendered element (`src/ui/media-slot.tsx:69`); the other 20 are comments, docstrings and test assertions. All 16 `Noujoude.photo` lines under `src/` are comments, guards and test paths — no asset bytes reach a page, because every serving refusal answers 404 while rights are unreviewed |
| Verified in Context | **0** | the stage asks for an asset seen in a rendered page; no asset is served, so none can be seen. The pages themselves do render and were probed over loopback (`docs/ROUTE_RUNTIME_EVIDENCE.txt`) — that is page evidence, not asset evidence |

**So: 2 of 8 stages have any evidence at all, and the furthest any asset has travelled on the *governance*
chain (as opposed to the *filesystem* chain) is `Located`.** Any dashboard reporting a single completion
percentage over these states would violate A.11 line 3469 (L-01).

---

## 2. Three overlapping vocabularies — discrepancy S-10, resolved as three dimensions

The same physical file is described by three independently-vocabularied chains in the source. They are **not**
one status column and must never be merged or averaged. Logged as **S-10** in `docs/MASTER_SPECIFICATION.md` §2
("Three overlapping asset lifecycles exist for the same object … Treated as three distinct dimensions, per
S-03, not merged into one status column and never averaged into a single completion percentage (A.11 forbids
exactly that) — **ADR-009**"). Governing prohibition, §11.1 line 1524: *"No single 'status' field may be used
to represent all aspects of editorial approval, factual verification, rights clearance, translation, media
processing, and public availability."*

| Dimension | Source | Vocabulary | Cardinality | Field name (ADR-009) |
|---|---|---|---|---|
| **D-A Governance lifecycle** | Appendix A.11, line 3467 (+ alternates line 3469) | `Referenced → Located → Metadata Recorded → Rights Reviewed → Curatorial/Brand Approved → Optimized → Integrated → Verified in Context`; alternates `Reference Only`, `Awaiting Generation`, `Awaiting Rights Review`, `Duplicate`, `Rejected`, `Archived` | 8 primary + 6 alternate | `assetGovernanceStage` |
| **D-B Inventory readiness** | §13.3, **lines 1872–1889** | `Referenced in Source Documentation`, `Source File Located`, `Present in Project`, `Copied into Public Assets`, `Manifested`, `Referenced by Code`, `Integrated into Public UI`, `Integrated into Control Center UI`, `Visually Verified in Context`, `Rights Cleared for Intended Use`, `Approved`, `Approved but Unused`, `Awaiting Generation`, `Awaiting Rights Review`, `Duplicate / Suspected Duplicate`, `Reference Only`, `Excluded from Current Scope`, `Archived` | 18 | `assetReadinessStates` (multi-valued — see note) |
| **D-C Media processing** | §11.8, line 1603 (+ exceptions line 1605) | `Uploaded → Security Scan → Processing → Ready for Review → Approved for Use`; exceptions `Rejected`, `Processing Failed`, `Rights Pending`, `Restricted`, `Archived`, `Replacement Required` | 5 primary + 6 exception | `mediaProcessingState` |
| **D-R Rights** | §8.15 line 1344 and §11.6 lines 1581–1592 | `Unknown`, `Permission Pending`, `Under Review`, `Rights Confirmed`, `Public Domain Documented`, `Licensed`, `Restricted`, `Not Cleared`, `Expired` | 8 named at 1344; §11.6 adds `Under Review` | `rightsState` |

**Resolution rules adopted (all Contract — unimplemented):**

1. The three chains are **separate columns with separate enums**; a UI may not collapse them into one badge —
   that is the STT-001 defect class named in ADR-009's consequence (`ARCHITECTURE_DECISIONS.md` lines 362–363) and
   the shared-label hazard recorded as S-03 (the labels `Draft`/`In Review`/`Approved` recur inside three
   different machines at lines 1543, 1555, 1266).
2. §13.3 line 1870, verbatim: *"The following states are distinct and must not be collapsed into a single
   'complete' flag."* Several D-B values are **not mutually exclusive** — `Approved but Unused` (1883) coexists
   with `Rights Cleared for Intended Use` (1881), and `Integrated into Public UI` (1878) coexists with
   `Integrated into Control Center UI` (1879). D-B is therefore modelled as a **set of boolean state flags**,
   not a single-valued enum; D-A and D-C are single-valued machines. Modelling all three as one enum would
   destroy real information and is prohibited.
3. Public serving is gated on **D-C + D-R + editorial approval together**: §11.8 line 1607, verbatim — *"Public
   display is permitted only when file validation, processing, rights, and editorial approval requirements for
   its role have been satisfied."*
4. Cross-check against `SECURITY_AND_PERMISSIONS.md` §10 M-04/M-05/M-11: the media gates are also security gates (Standard
   §6 lines 184–193).

---

## 3. The `MediaAsset` record — A.10 (line 3463) as the authoritative shape, cross-referenced to the 20 delivered columns

**A.10, verbatim and complete (line 3463):** *"Every asset record MUST include: Asset ID; exact filename;
original filename; asset type; MIME type; dimensions; file size; color profile when relevant; source; creator;
creation/acquisition date when known; rights holder; license; permitted uses; restrictions; expiry/review date
where applicable; original/derivative relationship; alt text; caption; language; focal point; responsive
variants; checksum; associated page/entity; status; approval record; and revision history."* → **27 required
attributes.**

Logical entity source: §8.14 (lines 1297–1321) — "A MediaAsset represents an original file or derivative" —
whose field table supplies `id`, `filename`, `storage_key` ("Protected storage reference", Required),
`mime_type`, `file_size`, `width`/`height`, `aspect_ratio`, `checksum`, `alt_text_en`/`alt_text_ar` ("Required
for meaningful public images", line 1311), `caption_en`/`caption_ar`, `media_role` (Controlled enum, Required;
roles listed at line 1321: "logo, entrance, country hero, collection cover, artifact primary, artifact
secondary, story cover, AI Curator visual, decorative background, texture…"), `focal_point` ("Structured
coordinates", Optional), `rights_record_id` (**superseded — see §4**), `is_primary`, `display_order`,
`source_asset_id` ("Media relationship / For derivatives", line 1318), timestamps/uploader. §13.2 (lines
1846–1866) adds: stable Asset ID, storage path "not exposed publicly", category and intended role, English and
Arabic descriptions and alt text, captions and credits, related country/collection/artifact/story/component,
rights holder and permission state, approved usage scope and channel restrictions, approval state and
reviewer, upload date and uploader, revision and replacement history. §8.18 line 1386 requires the original
file kept separate from derivatives; line 1394 forbids using an empty string for a meaningful unknown state;
line 1393 requires distinguishing `Unknown`, `Not Applicable`, `Not Recorded`, `Restricted`, `Pending
Verification`.

### 3.1 What Phase 0 actually delivered, mapped against A.10

`docs/ASSET_INVENTORY_AUDIT.csv` is 83 lines = 1 header + **82 rows**, with **20 columns** (parsed and
confirmed): `Asset ID, Filename, Expected Category, Physical Status, Actual Path, MIME Type, Width, Height,
File Size, SHA-256, Source/Creator, Rights Status, Brand/Curatorial Approval, Intended Usage, Actual Usage,
Derivative Status, Alt Text Status, Notes, Verified By, Verified Date`.

| A.10 attribute | Delivered column | Coverage | Gap to close in the `MediaAsset` collection |
|---|---|---|---|
| Asset ID | `Asset ID` | ✅ `NDM-AST-001` … `NDM-AST-082` (ADR-013; S-09 — the spec demands an ID and assigns none, so this project issues them deterministically in Appendix A catalog order and never re-uses or renumbers one) | stable primary key, never derived from a localized label (Standard §3.3 line 110) |
| exact filename | `Filename` | ✅ | required |
| original filename | — | ❌ absent (identical today for all 82; meaningful once derivatives exist) | add `originalFilename` |
| asset type / `media_role` | `Expected Category` (A.2–A.8) | ◐ category only, not role | add controlled `mediaRole` enum per §8.14 line 1321 |
| MIME type | `MIME Type` | ✅ measured, not taken from the extension — see §6.2 | required |
| dimensions | `Width` × `Height` | ✅ decoded from the file; **contradicts 18 filenames** (§6.3) | required; drives CLS reservation (Standard §9 line 224) |
| file size | `File Size` | ✅ bytes | required |
| color profile | — | ❌ not recorded | "when relevant" (A.10) — decide per asset |
| source / creator | `Source/Creator` | ✅ recorded as evidence-state: 72 × "Not supplied in any reference document", 10 × "AI-generated (Qwen ImageGen tooling), generator recorded in `_manifest.json`" | **Blocked by Owner Input** for real provenance (Standard §13 line 301) |
| creation/acquisition date | — | ❌ (quarantine manifest carries `generated_date` 2026-10-30 21:35:00 for the 10 only) | add, "where known" |
| rights holder / license / permitted uses / restrictions / expiry-review date | `Rights Status` | ◐ one state value per row; **no holder, licence, scope, restriction or expiry recorded for any of the 82** | these are `RightsRecord` fields (§8.15 lines 1330–1339), not `MediaAsset` fields — see §4 |
| original/derivative relationship | `Derivative Status` | ✅ 72 "Original (no derivatives produced)", 10 "DERIVATIVE (webp) from a PNG original that is not retained" | `source_asset_id` (§8.14 line 1318); 10 rows are **broken** (§6.4) |
| alt text | `Alt Text Status` | ✅ recorded as a gap: **82 × "Not Recorded"** | §8.14 line 1311 makes `alt_text_en`/`alt_text_ar` **required** for meaningful public images; §19.8 line 2964 requires meaningful alt text with decorative images marked decorative |
| caption / language | — | ❌ | `caption_en`/`caption_ar` optional (§8.14 line 1312); `language` required by A.10 |
| focal point | — | ❌ | `focal_point` structured coordinates (§8.14 line 1314); §19.7 line 2954 |
| responsive variants | — | ❌ none exist | A.10 "responsive variants"; §13.1 line 1844 "Mobile-specific variants and responsive derivatives" |
| checksum | `SHA-256` | ✅ all 82 baselined and re-verified 82/82 (`ARCHITECTURE_DECISIONS.md` §7.1 preflight run) | integrity + dedupe (§16.8 line 2508) |
| associated page/entity | `Actual Usage` | ◐ the column records **no** usage for any row; since 3 Nov 2026 it names `src/lib/media/usage-map.ts` as the resolver (the delivered text used to assert "None — no application code exists yet (src/ is empty)" on 82/82, which no tool recomputed) | many-to-many usage (§8.17 line 1372) |
| status | `Physical Status` + `Rights Status` + `Derivative Status` | ◐ three separate dimensions, correctly **not** merged (S-10) | three fields per §2 |
| approval record | `Brand/Curatorial Approval` | ✅ **82 × "Not Approved — no approval record supplied"** | approver identity, date, scope |
| revision history | — | ❌ | `Revision` entity §8.16 line 1354; §8.18 line 1391 |

Coverage summary: **20 delivered columns ≈ satisfy 12 of A.10's 27 attributes**, and do so as an *inventory
record*, not as the `MediaAsset` entity. The `MediaAsset` collection, its indexes and its migrations do not
exist. `storage_key` (§8.14 line 1305) and the private storage path rule (§13.2 line 1851 "not exposed
publicly") are unimplemented — `Actual Path` is a workspace-relative path in a documentation file, which is
acceptable for an audit artifact and **must not** be reused as a storage key.

### 3.2 Category accounting (Appendix A.2–A.8)

`perCategoryExpected` = `perCategoryParsed` exactly, with `catalogParseDrift: []`:
A.2 Brand Identity 12 (line 3323) · A.3 Museum Architecture and Environment 18 (3340) · A.4 AI Curator Visual
3 (3363) · A.5 Collection and Heritage Visual 11 (3371) · A.6 Interface and Supporting Visual 10 (3387) ·
A.7 Textures, Backgrounds, Lighting and Transitions 18 (3402) · A.8.1 Country World Hero 6 (3429) ·
A.8.2 Collection Category 4 (3440). A.1 line 3321 states the split: **12 + 18 + 3 + 11 + 10 + 18 = 72
reference assets, plus 10 additional requested assets** = 82. A.8 line 3427: *"These ten files are separate
from the original 72-file reference inventory. Their generation and physical existence must be verified
independently."*

---

## 4. Rights model

### 4.1 Media ↔ Rights is a join, not a singular field (ADR-012 / S-05)

§8.14 line 1315 carries `rights_record_id` — singular, "Relationship / Conditional". §8.17 line 1373, the
canonical cardinality table, states: `MediaAsset ↔ RightsRecord` = **"One-to-many or many-to-many where rights
differ by use"**, rule: **"No universal permission assumption."** (line 1373) These cannot both be true of one schema.
**Resolution (ADR-012, logged as S-05): a join relation, not a foreign key.** *"A single asset can carry
several rights records scoped by use, which is the case the singular field would silently destroy."*

Required shape (Contract — unimplemented): `MediaAsset` ⟂ `MediaAssetRightsLink` ⟂ `RightsRecord`, with the
link carrying the **usage context** (§8.17 line 1372: "Usage role and rights context must be retained") so that a
country-hero placement, a promotional use, an AI retrieval citation and a derivative crop — illustrative contexts,
not a specification list — can each resolve
to a different rights answer. `RightsRecord` fields per §8.15 (lines 1329–1342): `rights_holder` (Required when
known), `creator`, `rights_type` (controlled enum, Required), `permission_status` (controlled enum, Required),
`attribution_text` (Conditional), `license_reference`, `usage_scope` (Structured list, **Required**),
`allowed_channels`, `geographic_restrictions`, `start_date`/`expiry_date`, `permission_document` ("Protected
file reference"), `reviewed_by`/`review_date`, `notes`. §13.6 (lines 1920–1931) requires the model to
distinguish eight separate things — ownership of the physical object · copyright in the photograph or scan ·
copyright in a transcription, translation or editorial text · permission to display digitally · permission to
crop or otherwise transform · permission to use in promotional materials · attribution requirements ·
geographic, temporal, platform and channel restrictions — and states at line 1931: *"Possession or ownership of
a physical object does not automatically establish ownership of copyright in its photograph or permission to
publish a document image."* That sentence is the reason a many-to-many is required rather than elegant.

### 4.2 Ownership, authenticity and condition become first-class evidenced records (ADR-011 / S-04)

§8.1 (lines 1011–1026) mandates that the data model separate object identity, descriptive metadata, historical
and cultural context, factual claims, evidence sources, provenance events, **ownership statements (1019)**,
**authenticity assessments (1020)**, media and image rights, verification/review state, editorial approval and
locale-specific publication state — "These concepts must not be collapsed into one generic description or one
global 'verified' flag." §8.13 (lines 1291–1295): ownership "is a separate statement requiring its own evidence
and approval. An artifact's presence in a collection database, physical possession, or display does not
automatically [establish ownership]"; authenticity "is a separate assessment. It may require specialist
examination"; and the public vocabulary must be "documented, recorded, attributed, reported, estimated, or not
established". **But §8.2's entity list (1030–1051) and the Artifact field table (1147–1174) define no such
entity or fields** — gap S-04. ADR-011 adds `OwnershipStatement`, `AuthenticityAssessment` and a structured
`ConditionReport`, each carrying its own evidence and approval on the model of §8.13 line 1291, which states
"Ownership is a separate statement requiring its own evidence and approval" — plus §16.6 (2449+) and
Appendix G.8 (3809) screens.

Why this is a media-rights matter and not only a collection matter: §6.7 line 723 forbids the inference —
*"A general 'Verified' badge must not imply that the object's authenticity or ownership has been
established"* — and line 722 "Publication state is never presented as proof of authenticity". Without a
separately approved authenticity conclusion to store, **that prohibition is unenforceable** (ADR-011
consequence). Acceptance gate COL-005 (line 3078): "Ownership/authenticity — Separate evidence and review; no
unsupported labels." Also §17.4 line 2780: only "Yes / delegated" (Owner) and "Assigned" (Director) may approve
rights status; the Curator contributes "Evidence input" and the Media Manager only "Record administration".
§17.2 H line 2724 states the limit plainly: "A media-management role does not automatically prove legal rights;
a qualified rights reviewer/Owner must approve relevant permission claims."

### 4.3 Approval-invalid and deletion rules for rights

- §11.6 line 1593: *"Only rights states explicitly cleared for the intended public use may be displayed.
  `Public Domain Documented` requires a documented basis, not an assumption based on age[ of the object]."*
- §8.15 line 1344: *"The presence of a file in the library does not prove a right to display it."*
- §13.7 line 1937: *"Replacing an image must preserve a traceable relationship to the previous file and must
  not silently invalidate rights approvals."* Before replacement or deletion the system must identify **every**
  current use — pages, sections, country worlds, collections, artifacts, stories, responsive variants and other
  derivatives — and give the user an impact summary (line 1935; §16.8 line 2506).
- §11.4 line 1571: material changes to … **primary images, rights records** … may invalidate prior approvals.
- STT-002 (line 3086): *"Unclear/restricted media cannot be publicly served for unauthorized use."*
- Standard §3.3 line 115: do not delete historical claims, evidence, **rights**, audit events or revisions
  through cascading deletes without an approved retention rule.
- §20.5 publication checklist line 3126: before any page, artifact, collection, story or country world is
  published, check "Clear media rights for every public image/document".

**Enforcement plan:** publication is a server-side transaction that re-resolves the rights dimension from the
join (§4.1) at publish time, not from a cached flag; a `RightsRecord` whose `expiry_date` has passed, or whose
`usage_scope` does not contain the requesting channel, blocks the publish and raises a Module 18 rights alert
(§16.18 line 2639: "permission pending, expired licence, restricted image, missing attribution"). Status: all
**Contract — unimplemented**.

---

## 5. Interpretation safeguards — Appendix A.9, reproduced as binding rules (lines 3449–3459)

Verbatim, all eight, plus the closing rule. Each is **Contract — unimplemented** and each needs a named test.

| ID | Safeguard (verbatim, line) | Applies to | Required test |
|---|---|---|---|
| S-A9-1 | "A visual reference of an artifact category is not evidence that the museum owns the depicted object." (3451) | all A.5/A.8.2 category visuals | assertion that no ownership claim is derivable from an asset association; `tests/e2e/assets/interpretation.spec.ts` |
| S-A9-2 | "A country hero image is an illustrative exhibition visual unless it is independently documented as an original collection photograph." (3452) | the 6 A.8.1 `world_*_hero_16x9.webp` | no "original photograph" label without an `OwnershipStatement`/provenance record |
| S-A9-3 | "AI-generated and composite imagery must never be represented as documentary photography or an original artifact." (3453) | the 10 quarantined assets (§6.4) | label assertion per §13.5 line 1914 ("AI-generated illustrative visual or equivalent approved wording") |
| S-A9-4 | "`certificate_authenticity_1024.webp` is a design asset reference only; it does not establish that any artifact has been authenticated or certified." (3454) | **NDM-AST-005** | assert no artifact acquires an authenticity state from this asset; note the file is also 512×512 despite its name (§6.3) |
| S-A9-5 | "`user_account_1024.webp` and `favorite_heart_1024.webp` do not authorize visitor accounts, favorites, or saved collections in V1." (3455) | **NDM-AST-049**, **NDM-AST-053** | §2.6/§3.3 account exclusion invariant: no account or favourites feature appears because these assets exist; G.3 line 3692 bans hidden/admin-configurable variants too |
| S-A9-6 | "`gift_boutique.webp` does not authorize a gift shop or commerce feature." (3456) | A.6 commerce-adjacent asset | §23 invariant 5 (line 3294) non-commercial; G.3 lines 3694–3702; §6.7 line 725 prohibits price/purchase/cart/checkout/seller language |
| S-A9-7 | "`museum_cafe_morning.webp` does not establish that a public café exists." (3457) | A.3 atmosphere imagery | §1.5/§6 content-truth boundary: "Missing content is shown honestly rather than fabricated" (§23 line 3308) |
| S-A9-8 | "`location_paris_1024.webp` does not establish the museum's official location." (3458) | **NDM-AST-054** | official contact details are a non-fabricable Owner input (Standard §13 line 303); no location claim ships |
| S-A9-9 | "Each asset's technical and legal status must be tracked separately: referenced, present, rights-cleared, approved, optimized, integrated, and verified are different states." (3459) | all 82 | the S-10 three-dimension model in §2; forbids the merged percentage |

§13.5 (lines 1902–1916) is the same rule with an explicit list of what AI-generated imagery **MUST NOT** be
presented as: an original photograph of a collection item · proof that an artifact exists in the museum · an
original historical document · a documentary photograph of a real event or place unless factually grounded and
appropriately represented · a substitute for an actual artifact image in a way that misleads the visitor.
Line 1916 names this project's ten files directly: *"The ten additional requested assets in Appendix A are
illustrative country/category visuals, not evidence of actual objects in the collection."* Acceptance gate
**AST-003** (line 3091): "AI illustrations — Illustrative imagery is not represented as original collection
photography." **AST-001** (3089): every used asset must have an identifiable source and intended role — for 72
of 82 the recorded source is "Not supplied in any reference document", so AST-001 cannot close without Owner
input. **AST-002** (3090): each public media use must be rights-cleared for that purpose — 0 of 82 qualify.

---

## 6. Phase 0 audit findings, stated accurately

**Provenance of every number in this section.** Generated by `scripts/audit-assets.mjs` on
`2026-10-30T23:26:33.833Z` against `E:/no` (re-runnable: `pnpm audit:assets` → `node scripts/audit-assets.mjs`),
recorded in `docs/asset-audit-summary.json` and `docs/ASSET_INVENTORY_AUDIT.csv`, and independently re-verified
by `node scripts/preflight.mjs` on 31 October 2026 (`ARCHITECTURE_DECISIONS.md` §7.1: exit code **1**,
"7 checks: 1 FAIL, 2 WARN, 4 PASS"). `Noujoude.photo/` and `reference/` were read-only inputs throughout
(ADR-014). The `WRONG_FORMAT` container was re-confirmed by reading the file's first twelve bytes directly
while preparing this document.

### 6.1 Catalogue and physical totals

| Measurement | Value |
|---|---|
| Catalogued entries | **82** = **72 original reference assets** + **10 additional requested assets** (A.1 line 3321; A.8 line 3427) |
| Original 72, physical result | 71 `PRESENT`, **1 `WRONG_FORMAT`**, 0 missing |
| Additional 10, physical result | 10 `PRESENT`, all inside `_pending_review_AI_generated/` |
| `perCategoryExpected` vs `perCategoryParsed` | identical across all eight categories; `catalogParseDrift: []` |
| Physical files in `Noujoude.photo/` | **85** (= 82 catalogued + 3 uncatalogued), **6,467,873 bytes** total — the 1 November measurement, still true of the 82 catalogued rows. Re-measured 2 November: **97 files / 14,300,868 bytes**, the difference being one 6,143,950-byte archive and eleven duplicated files, both events recorded in `docs/CHANGELOG.md` §R |
| Dimension decode failures | `dimensionDecodeFailures: []` — all 82 dimensions were decoded from file content, none inferred |
| Name/pixel mismatches | **18** |
| Source verification vs the supplied reference set | `verifiedAgainstSource: 82 of 82`, `mismatched: []`, `unavailable: []` |
| Traceability cross-check | `Noujoude_Line_by_Line_Traceability_EN.csv`: 8,174 data rows, 8,174 distinct source lines; all 82 catalogued filenames confirmed verbatim (S-11) |
| Checksums | SHA-256 baselined for all 82; `preflight.mjs` re-verified **82/82 match** |

### 6.2 `WRONG_FORMAT` — the one genuine container/extension contradiction

**NDM-AST-041 `vintage_collector_desk_16x9.jpg`** (A.5 Collection and Heritage Visual Assets): extension claims
`.jpg`; the file's own magic bytes say otherwise. Verified directly: offset 0–3 `52 49 46 46` = `RIFF`, offset
8–11 `57 45 42 50` = `WEBP`, i.e. `RIFF8z\0\0WEBPVP8 `. CSV row 42 records MIME `image/webp`, 512 × 290,
31,296 bytes, `sha256 155be1228c55257981fcc080e3d65f5f91d6ec3635942b55cd0f5a109c13f6b1`, and the note
"extension .jpg but container is image/webp ; source line 3844 confirms this entry verbatim".

Consequences, as rules rather than commentary:
1. **Filename/extension is not evidence of format.** Ingestion must validate MIME, magic bytes, extension,
   size, dimensions and allowed formats together (Standard §6 line 187) and must never accept an extension
   change as sanitization (line 189). This file is that rule's worked example, found in the project's own
   library before any code existed.
2. A pipeline keyed on extension would mislabel this asset, mis-choose a decoder, and could mis-serve it with a
   `Content-Type` that contradicts its bytes.
3. Remediation is a **derivative** operation, never a rename: the original is preserved (§13.4 line 1895;
   §8.18 line 1386) and the naming contradiction is resolved in recorded metadata plus a re-encoded derivative
   (§9). Status: Contract — unimplemented; the file remains as found, because `Noujoude.photo/` is read-only
   for all tooling (ADR-014) and "Do not delete original references or assets" (Directive §17 line 322).

### 6.3 18 name/pixel mismatches — every `_1024` asset is smaller than its name claims

From `asset-audit-summary.json` `namePixelMismatches`, cross-checked against the CSV rows. **16** assets named
`_1024` are actually **512 × 512**; the two named with a two-part size are short on both axes.

| # | Asset ID | Filename as catalogued | Name claims | Actual |
|---|---|---|---|---|
| 1 | NDM-AST-001 | `brand_seal_monogram_1024.webp` | 1024 | **512×512** — **brand-critical** (official monogram seal; A.2 line 3327 "Header, identity, certificates") |
| 2 | NDM-AST-002 | `logo_badge_burgundy_1024.webp` | 1024 | **512×512** — **brand-critical** (burgundy logo badge; A.2 line 3328) |
| 3 | NDM-AST-003 | `logo_stacked_vertical_1024x1536.webp` | 1024×1536 | **341×512** — declared ratio 2:3 is preserved; declared scale is off by ~3× |
| 4 | NDM-AST-004 | `logo_wordmark_1024x768.webp` | 1024×768 | **512×384** — declared ratio 4:3 is preserved; declared scale is exactly half |
| 5 | NDM-AST-005 | `certificate_authenticity_1024.webp` | 1024 | 512×512 |
| 6 | NDM-AST-012 | `social_instagram_1024.webp` | 1024 | 512×512 |
| 7 | NDM-AST-019 | `museum_building_1024.webp` | 1024 | 512×512 |
| 8 | NDM-AST-032 | `ai_curator_sparkle_1024.webp` | 1024 | 512×512 |
| 9 | NDM-AST-035 | `rare_stamp_1024.webp` | 1024 | 512×512 |
| 10 | NDM-AST-037 | `heritage_jewelry_1024.webp` | 1024 | 512×512 |
| 11 | NDM-AST-039 | `family_letters_1024.webp` | 1024 | 512×512 |
| 12 | NDM-AST-044 | `perfume_vanity_1024.webp` | 1024 | 512×512 |
| 13 | NDM-AST-049 | `user_account_1024.webp` | 1024 | 512×512 (see S-A9-5) |
| 14 | NDM-AST-050 | `search_discovery_1024.webp` | 1024 | 512×512 |
| 15 | NDM-AST-051 | `contact_envelope_1024.webp` | 1024 | 512×512 |
| 16 | NDM-AST-052 | `telephone_1024.webp` | 1024 | 512×512 |
| 17 | NDM-AST-053 | `favorite_heart_1024.webp` | 1024 | 512×512 (see S-A9-5) |
| 18 | NDM-AST-054 | `location_paris_1024.webp` | 1024 | 512×512 (see S-A9-8) |

Read correctly: the mismatch is **between a filename and its content**, not proof of a corrupted file. The
files decode normally (`dimensionDecodeFailures: []`) and are byte-identical to the baseline (82/82 checksums).
Why it is nonetheless a blocking engineering fact:

1. **Brand integrity.** Two of the eighteen are the official monogram seal and the burgundy badge — the two
   identity marks named first in A.2. §23 invariant 1 (line 3290): "The official Noujoude identity is never
   replaced by an unrelated logo or improvised brand", and VIS-001 (line 3087) requires approved logo variants.
   A header that trusts `_1024` and renders 512 px source at 2× will be visibly soft.
2. **Dimensions are not name-derivable.** §8.14 lines 1308–1309 make `width`/`height` "System" values; §19.7
   line 2948 requires reserved layout dimensions (CLS ≤ 0.1, Standard §9 line 220). Deriving dimensions from
   filenames would inject layout shift and wrong `srcset` hints. Required rule: **read dimensions from the
   decoded file, never the name** — and add an automated invariant that fails when a filename's declared size
   disagrees with the decoded size (this project already has one occurrence class of that: 18/82 = 22%).
3. **Aspect ratio and scale are separate failures.** NDM-AST-003 declares `1024x1536` and measures 341×512;
   NDM-AST-004 declares `1024x768` and measures 512×384. In both cases the declared *ratio* (2:3 and 4:3) is
   in fact preserved — the defect is absolute scale (roughly one third and one half of the declared width
   respectively), which is exactly the case a ratio-only check would wave through. The required rule is
   therefore a per-axis comparison of declared versus decoded pixels, not an aspect-ratio comparison.

### 6.4 The 10 additional assets — AI-generated, quarantined, and with broken lineage

All ten live **only** under `Noujoude.photo/_pending_review_AI_generated/` (CSV `Notes`: "ONLY INSIDE
`_pending_review_AI_generated` — not in the primary library folder") and are recorded as **NDM-AST-073 …
NDM-AST-082**. *Location caveat, 2 November 2026:* at 14:01 the ten were relocated to the **primary library root**
by the Owner, byte-for-byte intact (every SHA-256 matched its row), which is exactly the state the sentence above
forbids; preflight caught it as a FAIL — "10 catalogued original(s) no longer in the directory" — and the
quarantine was restored from `HEAD` on the Owner's decision. The relocated copies were **left in place**, so the
ten now exist twice on disk while their catalogued path is satisfied. See `docs/CHANGELOG.md` §R. Six are A.8.1 country-world heroes (Morocco, Egypt, Syria, Mauritania, Libya, Sudan — 1792×1008
each, `ratio: 1.7778`); four are A.8.2 collection-category visuals (First Day Covers, Coins, Artifacts,
Souvenirs — 1024×768, `ratio: 1.3333`). From `_manifest.json`, uniformly for all ten: `ai_generated: true`,
`embedded_provenance: "EXIF ImageDescription"`, `format: WEBP`, `chunks: [VP8X, VP8, EXIF]`, `revision: v1` or
`v2`, `generated_date: "2026:10:30 21:35:00"`, and three governance states:

| Manifest field | Value for all 10 | A.11 / CSV mapping |
|---|---|---|
| `asset_use_state` | `Awaiting Generation -> Pending Review` | not yet `Curatorial/Brand Approved` |
| `approval_state` | **`Pending Human Approval`** | CSV `Brand/Curatorial Approval`: "Not Approved — no approval record supplied" |
| `rights_state` | **`Awaiting Rights Review`** | CSV `Rights Status`: "Awaiting Rights Review" (Master Spec §13.3 line 1885); §11.6 line 1584 `Permission Pending` class |

**Broken original→derivative lineage — the material finding.** Each manifest entry names a `source_png` that
is **absent from the workspace**, so the delivered WebP has no retained original: e.g.
`world_morocco_hero_16x9.webp` names `world_morocco_hero_16x9_1793387944337_307329d3.png`;
`collection_coins_4x3.webp` names `collection_coins_4x3_v2_1793388332564_1e0efaa6.png`. The CSV records this
for all ten as `Derivative Status` = **"DERIVATIVE (webp) from a PNG original that is not retained"**, with the
note "lineage broken: manifest names source PNG "…" which is absent from the workspace".

This is a **Standard §6 line 193 failure in the delivered state** ("Record original/derivative lineage,
checksums, rights, and usage links"), a **§8.14 line 1318 failure** (`source_asset_id` has no target), a
**§13.4 line 1895 failure** ("Preserve the original source file"), and a **§16.8 line 2502/2506 replacement
hazard** — the ten cannot be re-optimized losslessly because the larger PNG originals are gone, and re-encoding
a WebP derivative compounds compression. Note also the asymmetry that matters for governance: the ten are
*named as derivatives but delivered as the only surviving copy*, so no derivative of them can be produced
without treating the quarantine WebP as an original — which §13.5/§8.18 line 1386 forbid silently conflating.
Remediation is a **recorded Owner decision** (regenerate originals, accept the WebP as the archival master with
an explicit note, or `Rejected`/`Archived` per A.11 line 3469), not a silent technical fix.
Status: **Blocked by Owner Input**; Standard §13 lines 300–302 make real artifact facts and image rights
non-fabricable.

### 6.5 The uncatalogued files — 3 measured 1 November, 5 on disk since 2 November

`uncataloguedFiles` — present on disk, absent from Appendix A, therefore outside the governance chain:

| Path (relative to `Noujoude.photo/`) | Bytes | SHA-256 | MIME |
|---|---:|---|---|
| `logo_presentation_scene_16x9_v3.webp` | 7,572 | `771a118b2135b699e0f9ebff1102075e90c5a58b936b7e92bf4fca628fd25e47` | `image/webp` |
| `_pending_review_AI_generated/GENERATED_ASSETS_MANIFEST_AR.md` | 9,241 | `3b35fc1bec7d4a571cf14b24e95a078525c6cf39f1282dc6bf07d2b285df28d3` | — (markdown) |
| `_pending_review_AI_generated/_manifest.json` | 7,075 | `7343e7c76cdc4020049dbc0e348f05f018d92c62e5dadb69129aa6a9b258e7a2` | — (JSON) |
| **`Noujoude.photo.rar`** *(new, 2 November)* | 6,143,950 | `c92597cf0db9dc4e2cda53b76c5e02fb0755c37246164f52dca68cd1524296b5` | — (RAR5 container, magic `526172211a0700cf`) |
| **`GENERATED_ASSETS_MANIFEST_AR.md`** *(new location, 2 November)* | 9,241 | `3b35fc1bec7d4a571cf14b24e95a078525c6cf39f1282dc6bf07d2b285df28d3` | — (markdown; byte-identical to the quarantined copy) |

Two of these five are new to 2 November and neither is an asset: the archive is a **copy of 78 files that already
exist in this directory, CRC-verified identical, containing zero bytes the library did not already hold**, and it
supplies none of the ten missing `source_png` originals (§6.4). The Owner's decision was keep, do not extract, do
not catalogue — so it stays a name with no row, no rights statement and no approval, and it is **invisible to git**
because a machine-global ignore rule (`~/.gitignore_global` line 24, `*.rar`) hides it despite this repository's
own rule that no ignore rule may hide a change to a protected path. `docs/CHANGELOG.md` §R carries the measurement.

A blind spot this exposes, recorded rather than fixed: `scripts/audit-assets.mjs` decides "uncatalogued" by
**basename** (lines 304-307), so a duplicate of a catalogued filename placed anywhere under `Noujoude.photo/` never
registers as uncatalogued. The eleven relocated copies restored alongside their originals therefore appear only in
the raw file count (97 against 85), not in any finding — the same family of gap as H-7, where the check iterates
rows instead of enumerating the directory.

Rules this imposes (Contract — unimplemented): an uncatalogued file is **`Reference Only`** at best (A.11 line
3469) and must never be auto-adopted into the library, because §13.3 line 1891 makes a manifest or a folder
listing insufficient evidence of usability. Two of the three (the 1 November set) are documentation about the other ten assets
(`_manifest.json` is the sole surviving provenance record for §6.4, so it is *governance evidence* and must be
preserved and hashed, not treated as an asset). The third, `logo_presentation_scene_16x9_v3.webp`, is a brand
asset with **no catalogue entry, no rights statement, no approval record, no Asset ID** — the `_v3` suffix
additionally implies two earlier revisions that are also absent, i.e. a second undocumented lineage gap. It is
**not** issued an `NDM-AST-###` identifier: ADR-013 numbers strictly in Appendix A catalog order (S-09), so
inventing ID 083 would corrupt the convention. Disposition requires an Owner decision (adopt + catalogue, or
`Rejected`/`Archived`).

### 6.6 What the audit explicitly does **not** establish

`S-11` remains open as a documentation fact: every Appendix A row cites a "Source line" in the range 3779–3937,
but Appendix A occupies 3316–3471; those numbers address an original source inventory
(`Pasted text(20261030-163919).txt`, 8,174 logical lines per Appendix B.1) that **was not supplied in
`reference/`** — `.md` line 3779 is Appendix G text, not a brand asset. All 82 entries were therefore confirmed
against the traceability CSV instead, 82/82 verbatim; no entry was accepted on the strength of its line number.
And the audit's own scope limit: physical verification of 82 files proves *presence, format, dimensions, size
and integrity*. It proves nothing about rights, nothing about curatorial truth, and nothing about whether an
asset is suitable for its intended role.

---

## 7. Open rights blockers — nothing may be marked production-ready

Blocker identifiers in this section are **RB-nn** (media/rights). They are distinct from **B-01** in
`ARCHITECTURE_DECISIONS.md` §2, which is the host Node.js version blocker.

| # | Blocker | Measured evidence | Gate it blocks | Status |
|---|---|---|---|---|
| RB-01 | **Zero assets are rights-cleared.** | 72/82 `UNKNOWN — no rights statement supplied in reference/`; 10/82 `Awaiting Rights Review` | A.1 line 3319 (five gates); AST-002 (3090); §11.6 line 1593; STT-002 (3086); §20.5 line 3126 | **Blocked by Owner Input** (Standard §13 line 302 "Image/document rights and licenses") |
| RB-02 | **Zero assets are approved.** | 82/82 `Not Approved — no approval record supplied` | A.11 `Curatorial/Brand Approved`; §13.2 line 1864 approval state and reviewer | Blocked by Owner Input |
| RB-03 | **Zero assets carry alt text or captions.** | 82/82 `Not Recorded` | §8.14 line 1311 (required for meaningful public images); §19.8 line 2964; NFR-002 (3111) | Not Implemented |
| RB-04 | **No source/creator for 72 assets.** | `Source/Creator` = "Not supplied in any reference document" | AST-001 (3089); A.10 line 3463 "source; creator; creation/acquisition date when known" | Blocked by Owner Input |
| RB-05 | **Lineage broken for 10 assets** (source PNGs absent). | §6.4 | Standard §6 line 193; §8.14 line 1318; §13.4 line 1895 | Blocked by Owner Input + Not Implemented |
| RB-06 | **Format integrity defect on 1 asset** (`.jpg` holding WebP). | §6.2 | Standard §6 line 187; M-04/M-06 in `SECURITY_AND_PERMISSIONS.md` §10 | Not Implemented |
| RB-07 | **Dimension claims false on 18 assets**, incl. two brand marks. | §6.3 | VIS-001 (3087); §19.7 line 2948; CLS gate | Not Implemented |
| RB-08 | **Uncatalogued files outside governance: 3 on 1 November, 5 paths on disk since 2 November, and a measured total of 15 file-paths with no distinct catalog row on 3 November** (`find Noujoude.photo -type f \| wc -l` → 97 against 82 catalog rows). The 15 = the 5 the audit names (the archive, the two Arabic manifests, `_pending_review_AI_generated/_manifest.json`, `logo_presentation_scene_16x9_v3.webp`) + **10** duplicates whose basename matches a catalogued row and which the basename rule therefore cannot see — each of the ten `world_*_hero_16x9.webp` / `collection_*_4x3.webp` now exists twice, once quarantined and once at the library root, left in place by the Owner on 2 November. | §6.5 | A.11 (no stage); §13.3 line 1891 | Blocked by Owner Input |
| RB-09 | **No derivatives and no usage recorded in the register.** | 72 `Original (no derivatives produced)`; `Actual Usage` stores no usage on 82/82 and, since the 3 Nov 2026 regeneration, names `src/lib/media/usage-map.ts` as the resolver. The mapping exists **in code** and is tested; the register is not its source of truth, so "no usage mapping exists" is now false of the code and true of the record | A.11 `Optimized`/`Integrated`/`Verified in Context` | Optimized Not Implemented; usage mapping Implemented in code, register still records none; asset delivery gated by RB-01 |
| RB-10 | **Rights-approval authority is not yet modelled** — the competent approver is an implied role: §17.2 H line 2724 requires "a qualified rights reviewer/Owner must approve relevant permission claims", yet §17.2 defines no such role. | `SECURITY_AND_PERMISSIONS.md` §2.4 finding 1 | §17.4 line 2780; IAM-002 (3102) | **Decision taken — ADR-020** (a scoped `Approve` grant with recorded delegation, not a twelfth role); the grant record and its screen are still Not Implemented, and the identity of any delegated approver is an Owner input |

### 7.1 The preservation-versus-rights distinction

`preflight.mjs` proved that **82 of 82 checksums match the recorded baseline** — the originals under
`Noujoude.photo/` are **provably unmodified**, and every file under `reference/` is fingerprinted in
`docs/REFERENCE_INTEGRITY.json` so a future edit to an original is detected rather than assumed away
(`ARCHITECTURE_DECISIONS.md` §7.1, lines 1502–1504). That sentence must be read exactly:

- It **is** evidence of **preservation**: integrity, immutability, and correct handling by the tooling.
- It **is not** evidence of **rights**, of authenticity, of approval, of suitability, or of clearance. A
  byte-perfect copy of an unlicensed photograph is a perfect copy of an unlicensed photograph.
- It **is not** evidence that any asset is optimized: the 72 originals have produced no derivatives at all
  (`Derivative Status`), and the ten quarantined files *are* derivatives whose originals are gone (§6.4).

Standard §6 line 184 permits public originals only "until rights and publication approval are recorded" — with
neither recorded for any of the 82, **every original and derivative in this library must remain private**.
Standard §15 line 332 makes that a prohibition, not a preference.

### 7.2 The 1 November 2026 reconciliation attempt — zero of 82 closed, and what each class still needs

The Owner's authorization of 1 November 2026 (§3) instructed this batch to close an asset's rights or approval
status **only** where valid evidence supports it, and named the shortcuts that are forbidden: unknown rights must
not be marked cleared, possession of a file must not be treated as proof of copyright, licences/creators/sources
must not be invented, curatorial approval must not be recorded without an approval record, and where evidence is
insufficient the accurate pending status must be retained with the exact missing evidence identified. Existing
asset identities and catalog references are to be maintained. **All 82 rows were re-read against that standard and
not one of them could be closed.** The searches performed, and what each returned:

| What was searched | Result |
|---|---|
| Every file under `reference/` for a licence, copyright, rights-holder, attribution or stock-source statement | Only **requirements** for those fields, never a value. The asset document's own header still reads `Binding Working Baseline — Final Brand/License Approval Pending` (line 5), and line 106 is the specification of the missing record, not an instance of it |
| `Noujoude.photo/` for rights sidecars, metadata files or a licence document of any kind | **Two** non-image files exist in the whole library — `_pending_review_AI_generated/_manifest.json` and `GENERATED_ASSETS_MANIFEST_AR.md` — and both record the *absence* of rights, not their presence. No `.txt`, `.xmp`, `.json` sidecar sits beside any of the 82 catalogued assets |
| The 10 AI manifest entries, re-read per asset | `rights_state` = `Awaiting Rights Review` on **10 of 10**; `approval_state` = `Pending Human Approval` on **10 of 10**; the Arabic manifest carries the same state and adds "لم تُحلّل بعد" — not yet analysed |
| `docs/ASSET_INVENTORY_AUDIT.csv`, CSV-aware re-parse of all 82 rows × 20 columns, 1 November 2026 | `Physical Status` 81 `PRESENT` + 1 `WRONG_FORMAT` · `Source/Creator` 72 × `Not supplied in any reference document` + 10 × `AI-generated (Qwen ImageGen tooling)…` · `Rights Status` 72 `UNKNOWN…` + 10 `Awaiting Rights Review` · `Brand/Curatorial Approval` **82 × `Not Approved — no approval record supplied`** · `Alt Text Status` 82 × `Not Recorded` · `Actual Usage` 82 × none (no application code) · `Derivative Status` 72 × no derivatives produced + 10 × derivative from an absent PNG original |
| `.env`, `git` state and the toolchain, as possible sources of an implied approval | Rejected as evidence. OD-3's locally generated secrets and OD-4's first commit record **operator acts**, and neither is a rights statement. A file being committed is not a file being licensed |

**What closure would require, class by class — the exact missing evidence.** The form is not invented here;
`Noujoude_Asset_and_Brand_Requirements_EN.md` line 106 defines the fields a rights record must carry, so the minimum
evidence is one record per asset in that shape.

| Class | Rows | Missing evidence | Minimum form that closes it |
|---|---|---|---|
| Original assets, rights unknown | 72 | Copyright owner, licence or permission, attribution line, permitted uses, restrictions, expiry/review date — and a creator/source for each | A per-asset rights record in the six-field shape of line 106, signed or supplied by the Owner. For the 10 country-hero and certificate/collection graphics, additionally the statement of what the image actually depicts, since an asset name is not provenance |
| AI-generated, quarantined | 10 | Human approval, rights position, **and the 10 `source_png` originals**, all of which are absent from the filesystem | Either the originals plus a rights record, or an Owner decision that these ten are used at all — plus the answer to the wider question in OID-17: whether illustrative AI visuals may represent heritage subjects |
| Curatorial/brand approval, all assets | 82 | An approval record naming the approver and the date | A named approval per asset (RB-02 and RB-10 together: the approver must be a real identity, and ADR-020's scoped `Approve` grant is still unimplemented) |
| Alt text and captions | 82 | The text itself, per locale | Editorial copy per asset per locale — depends on OID-02 for Arabic and OID-07 for institutional voice |
| Format and dimension integrity | 1 + 18 | Nothing from the Owner: `vintage_collector_desk_16x9.jpg` is a `.jpg` holding `image/webp`, and 18 files are smaller than their filenames claim | Engineering work gated on RB-01 — no derivative may be produced from an asset whose rights state is unknown, so the fix cannot precede the clearance |
| Uncatalogued files | 3 | A decision on whether they belong in the library | Owner direction; §6.5 records what they are and §10 keeps them out of the 82-row catalogue until then |

**The distinction that keeps this honest.** Preservation evidence is abundant and rights evidence is absent, and the
two are not interchangeable: `preflight` proves 82/82 checksums match the baseline, which says the files are the
files, and says nothing about whether any of them may be shown. `docs/ASSET_INVENTORY_AUDIT.csv` keeps its exact
pending values — none was softened — and `RB-01` through `RB-09` in §7 stay as they were written, because a batch
authorized to *reconcile* is not a batch authorized to *clear*.

---

All **Contract — unimplemented**; `sharp` (Standard §2.2 line 53) is a candidate pin in
`ARCHITECTURE_DECISIONS.md` §5 and is not installed.

| ID | Rule | Verbatim source |
|---|---|---|
| O-01 | Preserve the original; never overwrite it. "Preserve originals; produce traceable derivatives." | Standard §2.2 line 53; §13.4 line 1895; §8.18 line 1386 "Keep the original media file separate from derivatives"; §16.8 line 2504 "preserve originals"; ADR-014 (`audit-assets.mjs` writes only into `docs/`); Directive §17 line 322 "Do not delete original references or assets" |
| O-02 | Derivatives link back via `source_asset_id` and are individually recorded — never inferred from a filename pattern. | §8.14 line 1318; Standard §6 line 193; A.10 line 3463 "original/derivative relationship" |
| O-03 | SHA-256 recorded for originals **and** derivatives; derivative creation does not alter the original's checksum. | A.10 "checksum"; §8.14 line 1310; `preflight.mjs` 82/82 re-verification as the pattern to extend to derivatives |
| O-04 | Re-encode for web display; an extension change is never sanitization. | Standard §6 line 189 (see §6.2 for the in-repo counter-example) |
| O-05 | Documentary fidelity is a constraint on optimization: "Do not retouch an image in a way that changes a historical object's material characteristics, inscriptions, marks, condition, or documentary details"; "Do not hide defects or marks that may be historically meaningful without an approved reason and appropriate disclosure"; "Document significant processing, cropping, color correction, restoration, or reconstruction where relevant." | §13.4 lines 1897–1899; Standard §9 line 224 "Preserve documentary image details"; §19.7 line 2952 "optimization must not corrupt meaningful inscriptions or material features" |
| O-06 | Processing pipeline states are tracked: `Uploaded → Security Scan → Processing → Ready for Review → Approved for Use`, with `Rejected`, `Processing Failed`, `Rights Pending`, `Restricted`, `Archived`, `Replacement Required`. | §11.8 lines 1603–1605 |
| O-07 | Serving formats: responsive variants and modern formats, reserved layout dimensions, lazy loading below the fold, hero prioritized, focal-point/crop metadata — **without** treating the 512 px reality of 18 assets as if it were 1024 px. | §19.7 lines 2946–2954; Standard §9 line 224; §6.3 |
| O-08 | Public derivatives and restricted originals served under separate policies, short-lived signed URLs for private assets. | Standard §6 lines 185–186; `.env.example` lines 43–44 (declared, unprovisioned) |
| O-09 | Replacement preserves a traceable relationship to the previous file and must not silently invalidate rights approvals; deletion requires a full impact summary across pages, sections, country worlds, collections, artifacts, stories, responsive variants and other derivatives. | §13.7 lines 1935–1937; §16.8 lines 2502–2506; §16.19 line 2658 |
| O-10 | Duplicate detection: exact hash duplicates may be identified automatically; **visual similarity is a human-review signal only** — "Two visually similar historical photographs must not be automatically treated as duplicates without human confirmation." | §13.8 line 1941; §16.8 line 2508 |
| O-11 | Versioning and protected deletion enabled for original assets; critical originals keep an independent recoverable copy. | Standard §6 line 192; Standard §11 line 257; G.11.3 line 3903 |

---

## 9. Required verification, planned locations and status

| Planned artifact | Covers | Status |
|---|---|---|
| `docs/ASSET_INVENTORY_AUDIT.csv` (delivered, 82 rows × 20 columns) | A.10 inventory coverage; S-09 ID issuance; S-11 cross-check | **Delivered as a measurement.** Not a `MediaAsset` record, not approval, not rights. |
| `docs/asset-audit-summary.json` (delivered) | totals, mismatches, uncatalogued files, decode failures, traceability | Delivered measurement |
| `scripts/audit-assets.mjs` → `pnpm audit:assets` (delivered, re-runnable) | Directive §10 re-runnable evidence requirement | Delivered; writes only into `docs/` |
| `src/lib/media/dimension-from-content.test.ts` | O-07 / §6.3 — assert dimensions come from decoded content, fail on filename/actual disagreement | Not Implemented |
| `src/lib/media/magic-bytes.test.ts` | §6.2 / Standard §6 line 187 — MIME + magic bytes + extension must agree | Not Implemented |
| `src/lib/media/lineage.test.ts` | O-02/O-03 — every derivative resolves a live `source_asset_id` | Not Implemented |
| `src/lib/media/rights-join.test.ts` | §4.1 — per-use resolution; a licence that clears one channel must not clear another | Not Implemented |
| `src/lib/media/publish-gate.integration.ts` | §11.8 line 1607; §20.5 line 3126; STT-002 — publish blocked by rights/processing/approval | Not Implemented |
| `tests/e2e/assets/interpretation.spec.ts` | S-A9-1 … S-A9-9; §13.5 lines 1906–1914 labelling; AST-003 (3091) | Not Implemented |
| `tests/e2e/assets/no-commerce.spec.ts` | S-A9-6; G.3 lines 3692–3702; §6.7 line 725; `playwright.config.ts` invariance assertion 1 | Not Implemented |
| `tests/e2e/permissions/module-08-media-library.spec.ts` | Module 08 positive/negative cases (`SECURITY_AND_PERMISSIONS.md` §2.3) | Not Implemented |
| derivative checksum + lineage re-verification in `scripts/preflight.mjs` | O-03 extended from originals-only to originals+derivatives | Not Implemented (current pass covers the 82 originals only) |

**Reproduction:** `node scripts/audit-assets.mjs` regenerates the two audit artifacts; `node
scripts/preflight.mjs` re-verifies the 82 original checksums and the `reference/` fingerprint baseline. Both
have been executed at least once (results quoted in §6 and `ARCHITECTURE_DECISIONS.md` §7.1). Nothing else in
this table has been executed; the test runner itself cannot start (no `node_modules`; B-01 in
`ARCHITECTURE_DECISIONS.md` §2).

---

## 10. Register of non-selections and Owner dependencies

**Not selected / not decided, and not to be inferred from this document:** the object storage provider, bucket
provisioning and region (`S3_ENDPOINT`, `S3_REGION`, both keys empty in `.env.example` lines 41–46); any
`sharp` output profile, quality setting, width ladder or format set; whether the ten quarantined WebPs become
archival masters; whether `logo_presentation_scene_16x9_v3.webp` is adopted; whether the 18 dimension mismatches
are remediated by regeneration or by renaming metadata; whether color profile is recorded as A.10's "when
relevant" allows; malware-scanning tooling (Standard §6 line 188 is explicitly conditional — "where the selected
infrastructure supports it"); retention rule for historical rights/audit/revision records (Standard §3.3 line
115 requires "an approved retention rule" that has not been approved).

**Owner inputs, non-fabricable (Standard §13 lines 296–306):** real artifact inventory and factual data ·
ownership, provenance and authenticity evidence · image/document rights and licenses · institutional legal
identity and jurisdiction · approval of providers and operational costs. Standard §13 line 306 is the operating
instruction while these remain open: *"Implement the required workflows and placeholders; keep unapproved facts
out of public output."*

*End of NDM-MED-001. The measured facts are in §6; every rule in §1–§5 and §7–§9 is a contract awaiting
implementation and verification. No asset is approved, cleared, optimized, integrated, or verified.*
