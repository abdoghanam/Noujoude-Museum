# Noujoude Digital Heritage Museum — Owner Input Register

**Document ID:** NDM-OWNER-INPUT-001
**Version:** 0.1.0
**Date:** 31 October 2026
**Authority:** `reference/Noujoude_Technology_and_Security_Standard_EN.md` §13 (approved defaults versus Owner inputs); `reference/Noujoude_Master_Specification_EN.md` Appendix G.13 (lines 3664, 3933–3937) and §1.5 (lines 166–181); `reference/Noujoude_Master_Execution_Directive_EN.md` §9 (lines 179–186), §17 (line 316), §18 (line 333).
**Rule this file enforces:** Directive §17 — "Do not invent factual or legal content." (line 319), "Do not fake records or metrics in production screens." (line 320), and "Do not ask the Owner to decide routine technical details already governed here." (line 316). Both halves are binding: §3 keeps every genuine question on the page, §5 removes every question that must never be asked.

**Counts as measured at write time: 22 Owner inputs, all `Outstanding`.** Nothing in this register has been supplied, and nothing has been rejected. §6 states which facts were checked for in `reference/` and found absent, so the count is evidence, not guesswork.

**Quotation convention:** every string in this file presented inside quotation marks is reproduced from the cited line of the cited reference file, with one typographic exception — the sources use curly quotes (“ ”) which this file renders as straight quotes. Line numbers were verified with `node scripts/show-lines.mjs <range>` and re-checked by `node scripts/verify-citations.mjs`; where a measurement comes from this project's own documents (`docs/ASSET_INVENTORY_AUDIT.csv`, `.env.example`, `_manifest.json`) the text says so, because those are findings, not reference quotations.

---

## 0. What this file is not

It is not a wish list, and it is not a stall. Standard §13 line 306 and Master Spec line 3937 define the required posture:

> *"For every owner input, implement the independent technical workflow, record the dependency, keep unapproved content out of public output, and continue other work."*
> — `reference/Noujoude_Master_Specification_EN.md`, line 3937

So each row below has a **Meanwhile** column: the engineering that proceeds regardless. Where a row says an item blocks publishing, it does not block building.

---

## 1. Status vocabulary

| Status | Meaning |
|---|---|
| `Outstanding` | Not supplied by the Owner; not inferable; no value exists in the workspace. **Must not be filled in by the build.** |
| `Provided` | Supplied with a named source document/date; recorded where it lives |
| `Rejected` | Explicitly declined by the Owner; recorded so it is never re-proposed |

Every row in §3 is `Outstanding`. No row here is `Provided`, with one exception noted inside OID-02 (the **English** tagline is spec-locked and therefore not an input at all — see §5).

---

## 2. The two classes, separated exactly as Standard §13 requires

**Class A — engineering defaults, decided by the architect, never to be escalated as Owner questions.** Component boundaries and naming · database indexes and safe constraints · form validation and error presentation · responsive breakpoints within the design system · test organization and fixtures · telemetry instrumentation approach · cache implementation within the invalidation rules · standard accessible interactions. All eight are exercised in §4.

**Class B — Owner inputs that must never be fabricated.** Standard §13 names the categories: institutional legal identity and jurisdiction · actual founder story and attributions · real artifact inventory and factual data · ownership, provenance and authenticity evidence · image/document rights and licenses · official contact details · approval of operational costs, providers and formal service commitments. §3 below enumerates the concrete instances that are actually missing in this workspace, which is a larger set than the seven category headings because several categories split into separately answerable facts.

---

## 3. Owner input register (22 items, all Outstanding)

Columns: **Why it cannot be invented** = the specific rule plus the specific absence. **Where it will live** = the module/table/field that will hold it once supplied. **Meanwhile** = the work that proceeds.

### Institutional identity and legal facts

| ID | What is needed | Why it cannot be invented | Status | Where it will live | Meanwhile |
|---|---|---|---|---|---|
| **OID-01** | Official legal/institutional name in English; official Arabic institutional name; legal nature and operating status; **jurisdiction** | Master Spec: "The following facts remain Owner Input Required until documented and approved" (line 168); the list names the English legal name, the Arabic institutional name and "Legal nature and operating status of the collection or institution." (line 173); and "The website MUST NOT imply a legal museum designation, public institution status, accreditation, certification, partnership, ownership, or recognition without evidence and approval." (line 181). No legal name and no jurisdiction appears in any file under `reference/` | `Outstanding` | Module 16 institutional profile — "official museum name, tagline, approved description, contact details, default language, supported languages, and public identity." (line 2614) → `InstitutionalProfile`; surfaced in About, footer, privacy/terms signatures | About/Contact/policy routes and the footer name slot render an explicit *withheld* state; the field, its validation and its audit trail are built now |
| **OID-02** | Approved Arabic transliteration/rendering of "Noujoude" (Master Spec line 172) and the **exact Arabic forms of the tagline and brand strings** if they differ from a literal translation | G.2 locks the English string: "Preserve exactly: “More than a collection... it's a story.” No silent rewriting or alternate tagline." (line 3672) — that one is **not** an input. Arabic is: the specification requires independently authored Arabic content, not translation of English — "English is natural museum/editorial language, not literal Arabic translation." (Directive §11 line 204) — and "It must not silently substitute or machine-generate an unapproved translation." (Master Spec line 512). Only the Owner can fix the canonical Arabic brand marks | `Outstanding` (AR); English brand promise is spec-locked and recorded in §5 | Brand string set in Module 03 + localization dictionary (Module 12) | Every locale-keyed string slot exists and is enforced; a `machine-translated` flag makes unapproved Arabic visibly distinct and unpublishable; literal-translation candidates are held as *drafts*, never published |
| **OID-03** | Physical location, **if any is intended for publication** | Master Spec "Official physical location, if intended for publication." (line 176). Directive §6: "Do not create a literal fantasy palace or imply a Paris/French physical location based on aesthetic references or asset names." (line 112). Asset Requirements §9 is explicit: "`location_paris_1024.webp` does not establish the museum's location." (line 207) The file is a marker icon, 512×512, rights `UNKNOWN` — it is evidence of nothing | `Outstanding` | Institutional profile (address, geo, opening presence); maps/embeds only if approved | Location block renders as absent; the asset is catalogued but not wired to any public "we are here" claim; no structured-data `PostalAddress` is emitted |
| **OID-04** | The real founding history and dates; attribution of founder / Owner / collector / institutional representative | Master Spec names both — "Actual founding history and dates." (line 174) and "Founder, Owner, collector, or institutional representative attribution." (line 175); Standard §13 lists "Actual founder story and attributions." (line 299); Directive §9 commands "Never invent:" (line 179) and its first item is "The museum's legal status, accreditation, location, partnerships, or founder history." (line 181). Nothing in `reference/` states who founded Noujoude or when | `Outstanding` | Institutional story record → About, whose purpose is the "Approved institutional identity and mission" (Master Spec line 423) + Module 16 | About page structure exists with a documented "not yet supplied" state; no biographical placeholder text, no invented dates, no decorative origin story |
| **OID-05** | Partnerships, affiliations, certifications, accreditations, and whether any "officially recognized" claim may be made | Master Spec lines 178–179; line 181 prohibits implying accreditation without evidence; `certificate_authenticity_1024.webp` is recorded (Asset §9 line 204) as a design reference that proves no authentication or certification | `Outstanding` | Partners/accreditations collections, gated before any public badge | No accreditation badge, seal or "certified" claim is rendered; the graphic is excluded from public use pending both rights (OID-15) and this approval |
| **OID-06** | Official contact details: postal address, telephone, email, hours; plus the address that receives inquiries | Master Spec line 177; footer rule line 499 "Official contact details, **only when approved**"; §16.16 line 2618 requires official email and routing. `.env.example` leaves `SMTP_*` and `INQUIRY_NOTIFY_ADDRESS` empty — the absence is structural, not accidental | `Outstanding` | Module 16 contact settings → contact block, `Inquiry` routing config | Contact route ships with the form workflow, validation, rate limit and inbox; the "reach us" panel renders empty rather than inventing a number; `INQUIRY_NOTIFY_ADDRESS` fails closed |

### Collection facts and evidence

| ID | What is needed | Why it cannot be invented | Status | Where it will live | Meanwhile |
|---|---|---|---|---|---|
| **OID-07** | Owner-approved mission, vision and institutional narrative text (the words, not the values) | Master Spec line 185: mission/vision "must be based on the Owner-approved institutional story"; the fixed product values at line 187 are not an input, the prose is | `Outstanding` | Institutional story records, EN+AR, each with its own editorial and publication state (line 1453) | Section scaffolding, review workflow and per-locale publish gates are built; body copy slots stay withheld |
| **OID-08** | The actual artifact inventory: which objects exist, their identity, classification and dates | Directive §5 line 106: *"Category records do not prove that real objects are available. Only real, owner-supplied and properly reviewed artifacts may be presented as collection objects."* Directive §9 line 182 forbids inventing artifact records, dates or condition; the eight-category taxonomy is a schema, not a holding | `Outstanding` | Artifact entity + `ArtifactCountryRelationship` (ADR-012); Morocco world first | Full artifact CRUD, state machine and readiness validation exist; Morocco exhibition renders a truthful empty state; no generic mock object is used as visitor content (Directive §17 line 321) |
| **OID-09** | Factual claims per artifact (statements, dates, measurements, attributions) | Claim/factual statement is a mandated separate concept (Directive §9 line 165) and Master Spec line 723 forbids implying proof that does not exist; claims cannot be authored by the build | `Outstanding` | `Claim` records with `claimReviewState` (ADR-009) | Claim authoring, review queue and separation-of-duties enforcement are built; a claim with no evidence cannot reach `Approved` |
| **OID-10** | Evidence supporting each claim, and the sources/references behind it | Directive §9 separates evidence from claim from source; Standard §13 line 301 lists "ownership, provenance, authenticity evidence" as Owner-supplied | `Outstanding` | `Evidence` + `Source` records, many-to-one to claims | Evidence linkage UI, citation rendering and search eligibility by evidence state exist; test console refuses to cite an unlinked claim |
| **OID-11** | Ownership statements + evidence + the disclosure rule for each artifact | Master Spec lines 1019–1020 and §8.13 (lines 1291–1295) mandate ownership as separately evidenced and separately approved, and Appendix G.8 line 3809 requires the screen — while §16.6's A–K screen list (lines 2425–2465) omits it and no entity defines it; **ADR-011** completed the model. Directive §9 line 182 forbids inventing ownership | `Outstanding` | `OwnershipStatement` (ADR-011), Module 06 ownership/authenticity screen | Entity, workflow, approval state and screen exist; the blanket "Verified" badge is structurally impossible; negative test proves it; §8.13 line 1295's vocabulary — "documented", "recorded", "attributed", "reported", "estimated", "not established" — is enforced by the field, not by prose |
| **OID-12** | Provenance events (dates, actors, places, evidence per event) | Directive §9 line 168 names provenance events as a distinct concept, and Master Spec §16.6 F (line 2447) requires custody events, acquisition records, supporting documents and uncertainty notes; Master Spec line 2095 makes fabricated provenance a **release-blocking** defect | `Outstanding` | `ProvenanceEvent` with per-event evidence links | Timeline UI, ordering rules and retention (no cascading delete of historical events, Standard §3.3) are built |
| **OID-13** | Authenticity assessments: conclusion, method, reviewer, approval, and what may be disclosed | Directive §9 separates "Authenticity assessment." (line 170) as its own concept; Master Spec lists it as a required entity (lines 1019–1020); "The CMS must not automatically mark an artifact authentic because it has a source, provenance note, or curator description." (line 1293); "A general 'Verified' badge must not imply that the object's authenticity or ownership has been established." (line 723). No stored assessment exists anywhere, which is why **ADR-011** had to add the entity | `Outstanding` | `AuthenticityAssessment` (ADR-011) | Assessment record + reviewer + disclosure rule built; uncertainty is preserved rather than flattened; no authenticity verdict can originate from the AI Curator: "AI must not approve, verify, or publish its own content." (Directive §12 line 217) |
| **OID-14** | Condition reports for real objects | Directive §9 line 171 separates the condition report as its own concept; Master Spec §16.6 H (line 2455) requires approved physical condition, preservation notes, conservation observations, condition images and reviewer/assessment references; inventing conservation state is a factual claim about a physical object | `Outstanding` | Structured `ConditionReport` (ADR-011), Module 06 screen H (§16.6 line 2453) | Structured form, severity vocabulary and preservation notes exist; no condition text published |

### Rights, licences and approvals

| ID | What is needed | Why it cannot be invented | Status | Where it will live | Meanwhile |
|---|---|---|---|---|---|
| **OID-15** | Image rights and licences for the **72 original** assets, plus creator/source attribution | Measured from `docs/ASSET_INVENTORY_AUDIT.csv` (this project's own recorded cells, not a reference quotation): for all 72 original rows `Source/Creator` = `Not supplied in any reference document`, `Rights Status` = `UNKNOWN — no rights statement supplied in reference/`, `Brand/Curatorial Approval` = `Not Approved — no approval record supplied`; the `Not Approved` value covers all 82 rows. The rule that makes this fatal to any shortcut: "A file that exists is not automatically licensed, approved, or production-ready." (Asset Requirements line 111) and "Image authorship, copyright, or license status." (Directive §9 line 183) is on the Never-invent list | `Outstanding` | `RightsRecord` joined to `MediaAsset` (ADR-012), scoped by use; Module 08 rights tab | Lineage, checksums and per-use rights scoping are implemented; the media layer refuses to serve any asset whose rights state is not a cleared value; nothing is treated as public-domain by default |
| **OID-16** | Document rights for scanned letters, certificates and documentary files (Documents and Letters categories) | Same rule as OID-15 but a different rights subject — the author of a letter is not the holder of its image. The canonical cardinality rule allows "One-to-many or many-to-many where rights differ by use" (Master Spec §8.17 line 1373) | `Outstanding` | `RightsRecord` per asset per use | Join model already supports several rights per asset; upload validation (MIME, magic bytes, size, dimensions) implemented without assuming clearance |
| **OID-17** | Approval of the **10 AI-generated** assets, their rights position, and the missing source originals. Also: whether illustrative AI visuals may represent heritage subjects at all | Measured from `Noujoude.photo/_pending_review_AI_generated/_manifest.json`: all 10 carry `ai_generated: true`, `approval_state: Pending Human Approval`, `rights_state: Awaiting Rights Review`, and every `source_png` value (e.g. `world_morocco_hero_16x9_1793387944337_307329d3.png`) is **absent from the filesystem** — so lineage from original to derivative is broken at the root, which the Directive requires: "Store optimized derivatives separately and preserve original-to-derivative lineage." (Directive §10 line 194) The label rule is quoted below. And "Country hero images are illustrative exhibition visuals unless independently verified as photographs of actual collection objects or a real location." (Asset Requirements §9 line 210) | `Outstanding` | Media approval state + `Pending Review` folder policy; Module 08 approval workflow | The ten stay quarantined in `_pending_review_AI_generated/` and out of every public render; the internal label rule is quoted below; the originals folder is never written to |
| **OID-18** | Brand and curatorial visual approval: the canonical palette HEX set, logo usage, material families, and **final font licences** | The `GAP-07` row of `reference/Noujoude_Gap_Closure_Register_EN.csv` closes the gap as `Closed at specification level; visual approval remains` (CSV cell value). The palette rule: "The HEX values below are the source-defined proposed canonical palette. They are the implementation working baseline and require formal Owner/Brand approval before final public launch." (Asset Requirements line 39) Each typography role carries an approval requirement — "Verify files, weights, shaping, and license" (line 70) — and the Directive is explicit: "Treat final font licenses and visual sign-off as explicit approvals, not assumptions." (Directive §6 line 114) | `Outstanding` | Module 03 Brand & Visual Identity Studio; design-token store | Tokens are implemented as the *proposed* baseline with an `approvalState` field, so nothing silently becomes canonical; approved-only assets/tokens are enforced by G.8 line 3806; fallback font stacks are wired so an unlicensed webfont is never loaded in production |

### Providers, cost and service commitments

| ID | What is needed | Why it cannot be invented | Status | Where it will live | Meanwhile |
|---|---|---|---|---|---|
| **OID-19** | Hosting/environment selection, object-storage vendor, AI provider **and model**, email/SMTP provider, backup target, OTLP destination, **and now the identity-provider instance** (which OIDC-compatible IdP, hosted where, under whose administrative control, at what recurring cost) — and acceptance of the recurring cost | Standard §13 puts this class with the facts: "Approval of operational costs, providers, and formal service commitments." (line 304) Measured absence: counting empty values in `.env.example` (`grep -cE '^[A-Z0-9_]+=$'`) gives 19, of which 14 are provider/endpoint selections (`S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `AI_PROVIDER`, `AI_PROVIDER_API_KEY`, `AI_MODEL`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `INQUIRY_NOTIFY_ADDRESS`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `RATE_LIMIT_REDIS_URL`, `BACKUP_TARGET_URI`) and 5 are the superuser/role passwords the operator must create locally and `scripts/db/init-roles.sh` reads at lines 58 to 67; no ADR selects a vendor — ADR-025 decides the MFA *mechanism* and explicitly refuses to name a provider, recording self-hosted Keycloak only as a non-committed zero-cost candidate; the AI model choice also decides the vector dimension that ADR-007 deliberately refuses to hard-code | `Outstanding` | Module 16 integration status (safeguarded configuration), Module 14's identity configuration (ADR-025 decision 1), `docs/SECURITY_AND_PERMISSIONS.md`, `docs/AI_CURATOR_GOVERNANCE.md` | Every adapter is written to a vendor-neutral interface with contract tests against a local stub; nothing fakes a provider in real environments; the inert test env in `tests/setup/env.ts` keeps keys blank by design; ADR-025 decision 5 deliberately adds no `OIDC` key to `.env.example` until the strategy that reads it exists, so this absence is a stated rule and not a hole (contrast H-1, where a declared variable has no implementation) |
| **OID-20** | Formal acceptance of the proposed RPO/RTO and availability baseline — and a decision on whether anything may ever be **published** as an SLA | The `GAP-14` row of `reference/Noujoude_Gap_Closure_Register_EN.csv` records its closure as `Closed as proposed baseline; provider proof/Owner approval pending` (CSV cell value). The availability rule: "Target monthly availability objective for V1 is 99.5%, subject to the actual provider/support plan and formal Owner acceptance. Do not publish an SLA based solely on this internal objective." (Standard §11 line 262) The specification agrees: "They are engineering acceptance targets, not public contractual SLAs." (Master Spec line 3883) | `Outstanding` | Operations record in `docs/TEST_AND_RELEASE_REPORT.md`; Module 16 service settings | The engineering targets (DB RPO ≤1h/RTO ≤4h; media RPO ≤4h/RTO ≤8h; config ≤24h/≤4h; 35/12/12 retention points) are implemented as design constraints, never as public promises; restore tests will record *measured* numbers |
| **OID-21** | Approved legal texts and rules: privacy notice, terms of use, cookie/consent posture, and the **retention period for inquiry personal data** | The route table names the gate twice: the privacy row reads "Approved privacy notice" (Master Spec line 425) and the terms row reads "Approved terms of use" (line 426) — the adjective is the gate, not decoration. Module 13's acceptance criterion is "Inquiry PII is role-restricted; inquiries are excluded from public search and AI retrieval; retention actions are logged." (line 3816) — the retention rule is required but its period is not supplied, and legal retention periods are jurisdiction-dependent, while jurisdiction itself is OID-01 | `Outstanding` | Policy content records per locale with publication state; Module 13 retention configuration | Policy routes, versioning and consent plumbing are built with a withheld state; inquiry PII is role-restricted, excluded from search indexing and from AI knowledge by default — protection does not wait for the text |
| **OID-22** | Explicit authorization to deploy to production | Directive §17 line 325; Standard §12 line 281 and §15 line 335; ADR-level prohibition | `Outstanding` | Release record in `docs/TEST_AND_RELEASE_REPORT.md` §8 | No deployment tooling is pointed at any production target; staging is not assumed either |

**Note added in the gap-closure batch (31 Oct 2026) — all 22 rows remain `Outstanding`, and one of them now
gates a schedule.** Nothing in that batch supplied an Owner fact, so no status in this register changed. What
did change is how the plan treats an unselected input:

- **OID-19 now carries an explicit staging rule.** Because it includes the identity-provider instance, and
  because Module 14's MFA acceptance test cannot be written or executed without a reachable provider,
  `docs/IMPLEMENTATION_PLAN.md` §6 splits Module 14's gate: the role and permission half stays in wave 1, and
  the MFA half is **deferred by name until OID-19 closes**. The rule is general, not specific to MFA — *an
  acceptance criterion may never be scheduled against an Owner input that is still `Outstanding`.* The
  requirement still binds; what changes is that the schedule stops pretending it can be met.
- **OID-20's figures are internal targets, not commitments.** The RPO/RTO and availability numbers elsewhere in
  `docs/` are engineering proposals awaiting this row. They must never be published, quoted to a third party, or
  represented as an SLA, and none has been measured — no restore has ever been attempted in this workspace.
- **OID-18 keeps every token `proposed`.** Until this row is approved, no palette HEX value in `docs/` is
  canonical, and Phase 3 ships primitives without a sign-off it cannot obtain.

None of these notes moves a row toward `Provided`. A row moves only when the Owner supplies the fact and names
the document it came from (§7's update protocol).

---

## 4. Engineering defaults decided under delegated authority (Class A) — recorded so they are never escalated

Standard §13 line 285 and Directive §17 line 316 require these to be decided, not asked. Each is a real decision already taken in `docs/ARCHITECTURE_DECISIONS.md` or the authored configuration.

| Area | Decision taken | Where |
|---|---|---|
| Component boundaries and naming | Eleven logical boundaries of a modular monolith; directory/import discipline rather than network boundaries; `src/` layout with `app/[locale]`, `payload/`, `domain/`, `lib/server/`, `ui/`, `generated/` | ADR-001, `src/README.md` |
| Indexes and safe constraints | Index fields for approved filters, joins, FTS and routes; FK deletion rules that never cascade-delete claims, evidence, rights, audit or revisions; stable non-localized primary keys | Standard §3.3, ADR-006, Phase 2 item 2.6 |
| Form validation and error presentation | Zod at every boundary as the authoritative check, server-side; client validation is usability only | Standard §2.2, Directive §7 |
| Responsive breakpoints within the design system | Four test projects fixed at 1440×900 desktop and Pixel 7 / iPhone 13 mobile, per locale and direction | `playwright.config.ts` projects |
| Test organization and fixtures | `src/**/*.test.ts` unit, `src/**/*.integration.ts` integration, `tests/e2e/**`, `tests/a11y/**`; `passWithNoTests: false`; integration tests must opt in via `NDM_ALLOW_INTEGRATION` and may only touch `noujoude_test` | `vitest.config.ts`, `tests/setup/env.ts` |
| Telemetry instrumentation approach | OpenTelemetry traces/metrics/logs with OTLP export, instrumenting requests, DB, Payload hooks, jobs, media, search, AI and integrations; vendor of the *destination* is OID-19 | Standard §10 |
| Cache implementation within the invalidation rules | Cache strategy chosen per route inside the specified invalidation rules; no CDN/vendor assumption baked in | Standard §9 |
| Standard accessible interactions | Focus management, keyboard traversal, Escape-to-close with focus return, labelled controls, announced status, reduced motion — WCAG 2.2 AA | Standard §8, Master Spec §6.8, invariants 6 in `playwright.config.ts` |
| Asset identifier scheme | `NDM-AST-001`…`NDM-AST-082`, deterministic, Appendix A order, never re-used — declared as project convention (the spec requires IDs but assigns none) | ADR-013 / S-09 |
| Repository layout | `scripts/` added at root for re-runnable evidence tooling — declared deviation from the literal Directive §3 tree | ADR-014 |

---

## 5. Not an Owner input — do not ask again

**Conflicts inside the supplied specification, resolved as engineering decisions.** Directive §2 line 36: *"Routine engineering choices must not be escalated as Owner questions."* All fourteen original rows (plus S-15, added by the parallel workstream at 02:06) are recorded in `docs/MASTER_SPECIFICATION.md` §2. **The verbatim source body was not edited**; each resolution is a recorded decision.

| Row | Resolution taken | ADR | Product-visible? |
|---|---|---|---|
| S-01 | Three conflicting country-state enumerations resolved to **six** states; §6.3's four labels read as the visitor-facing subset | ADR-010 | **Yes — Owner may overturn.** Visitors see four labels; the sixth (`Hidden / Not Public`, line 3723) changes what a world does when it exists but must not be exposed |
| S-02 | Per-locale publication state modelled once, on `PublicationRecord` | ADR-008 | **Yes — visible as behaviour.** Publish is an explicit per-language audited operation, not a checkbox; English can be live while Arabic is not |
| S-03 | Eight state dimensions kept separate and name-spaced | ADR-009 | **Yes — visible in the Control Center.** Curators see eight distinct chips and eight filter axes, not one status badge |
| S-04 | `OwnershipStatement` / `AuthenticityAssessment` / `ConditionReport` added | ADR-011 | **Yes — visible on the public artifact page.** No blanket "Verified"; ownership and authenticity read as separately approved statements (line 723) |
| S-05 | Media↔Rights becomes a join relation | ADR-012 | No — data model only |
| S-06 | `ArtifactCountryRelationship` with a controlled type list | ADR-012 | Mildly — an artifact can present several documented country relationships, not just one |
| S-07 | No vector column; the `VECTOR(768)` figure not adopted | ADR-007 | **Yes — visible in product quality.** V1 AI Curator answers by keyword/full-text plus permission filtering; semantic retrieval is deferred |
| S-08 | Search implemented on PostgreSQL FTS + `pg_trgm`; no external engine | ADR-006 | Mildly — typo tolerance and ranking behaviour; revisitable with measured load |
| S-09 | `NDM-AST-###` ID scheme | ADR-013 | Mildly — the public/certificate surface may display these project-issued IDs |
| S-10 | Three asset lifecycles treated as separate dimensions, never averaged | ADR-009 | **Yes — visible in Module 01.** No single "collection complete %" number; the specification forbids it |
| S-11 | Appendix A "Source line" values are locators into an unsupplied file; each of the 82 names verified against the traceability CSV instead (82/82) | — | No — an evidence limitation, recorded, not a product choice |
| S-12 | Module 06 screen set = union of §16.6 A–K and Appendix G.8 | — | Mildly — more admin screens than either list alone |
| S-13 | **Nine** AI answer evaluation classes (not eight), keeping `Misstates Uncertainty` | — | Mildly — an extra red-team class; `Unauthorized Disclosure` stays release-blocking |
| S-14 | Markdown is the working authority, justified by measurement, not preference | ADR-018 | **Yes — the Owner may designate the DOCX as authoritative instead**, which would re-baseline every citation. Alignment was verified (337/337 headings, 0 content loss) so the risk of choosing MD is documented, not assumed |
| S-15 | Directive §15's five statuses are the status axis of `docs/REQUIREMENTS_TRACEABILITY.md`; Appendix C's fields are kept | — | No — reporting shape |

**Also not an Owner input, and not to be re-raised:** the choice of Payload/Next/React/PostgreSQL/pnpm versions within the verified matrix (ADR-001…ADR-004, §3); the four database roles (ADR-005); single schema authority and the prohibition on a second ORM (ADR-002); background jobs on Payload Jobs (ADR-015); Lexical rich text (ADR-016); the CI vendor; lint/format rules; migration file naming; test-directory layout; naming of internal types.

**Environment actions, which are neither Owner *facts* nor architecture decisions** — they are operator steps the build cannot perform for itself, listed here once so they are not mistaken for institutional inputs:
- Install **Node 24.22.2** (B-01). The ADR refuses to work around it.
- Create `.env` from `.env.example` with local development values (B-03).
- Authorize `git init` and the first checkpoint commit (B-04).
- Authorize dependency installation and the first application scaffold (B-02).

---

## 6. How the register was compiled (so the count is auditable)

| Check performed | Result |
|---|---|
| Read Standard §13 and Directive §9 "Never invent" list; expand each category into separately answerable facts | 22 items |
| Read Master Spec §1.5 (lines 168–181), §5.2 (line 499), §16.16 (lines 2614–2620), G.13 (lines 3933–3937) | every listed "Owner Input Required" fact maps to a row |
| Searched `reference/` for a legal name, jurisdiction, founding date, founder name, address, phone, email, partner or accreditation | none present |
| Read `docs/ASSET_INVENTORY_AUDIT.csv` rights/approval/attribution columns for all 82 rows (CSV-aware parse, 20 columns × 82 rows) | `Rights Status`: 72 × `UNKNOWN — no rights statement supplied in reference/` + 10 × `Awaiting Rights Review`; `Brand/Curatorial Approval`: 82 × `Not Approved — no approval record supplied`; `Source/Creator`: 72 × `Not supplied in any reference document`, 10 × `AI-generated (Qwen ImageGen tooling), generator recorded in _manifest.json` |
| Read `Noujoude.photo/_pending_review_AI_generated/_manifest.json` and tested each `source_png` for existence | 10 unapproved AI assets; 10 missing source originals |
| Read `Noujoude_Asset_and_Brand_Requirements_EN.md` lines 39, 70–74, 204–212 | palette, fonts and asset-derived claims all require explicit approval |
| Checked `.env.example` for provider configuration | 19 empty values, 14 of them provider/endpoint selections → OID-19 |
| Cross-checked the Gap Register | GAP-07 (visual approval remains) → OID-18; GAP-10 (rights remain to verify) → OID-15/16/17; GAP-14 (proposed baseline pending approval) → OID-20 |
| Confirmed no Owner input is marked `Provided` | nothing in the workspace records an Owner decision, approval or supply |

---

## 7. Update protocol

1. Only the Owner — or a document the Owner supplies — may change a status. The build never moves a row to `Provided` by inference, by silence, or because a value appeared in an asset filename.
2. On receipt: record the source document name and date in the row, then update the module/table field it lands in, then add the traceability row to `docs/REQUIREMENTS_TRACEABILITY.md`.
3. If an item is declined, mark it `Rejected` with the reason; the route must then render the "not applicable" state permanently, and the question is retired from this register.
4. Any answer that contradicts the specification is a change request against the specification, logged in `docs/MASTER_SPECIFICATION.md` §2 — not a silent override.
5. Publishing an answer never authorizes a *different* answer: e.g. approving an image's rights (OID-15) does not approve its curatorial use (OID-18); GAP-10 keeps existence, rights and approval as separate fields.
6. Rows stay here until answered; engineering continues per Master Spec line 3937 and does not queue behind them.
