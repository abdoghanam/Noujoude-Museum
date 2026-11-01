# Noujoude Digital Heritage Museum — Owner Input Register

**Document ID:** NDM-OWNER-INPUT-001
**Version:** 0.2.0
**Date:** 31 October 2026, updated 1 November 2026 by the Owner's formal authorization of that date
**Authority:** `reference/Noujoude_Technology_and_Security_Standard_EN.md` §13 (approved defaults versus Owner inputs); `reference/Noujoude_Master_Specification_EN.md` Appendix G.13 (lines 3664, 3933–3937) and §1.5 (lines 166–181); `reference/Noujoude_Master_Execution_Directive_EN.md` §9 (lines 179–186), §17 (line 316), §18 (line 333). Status changes recorded in version 0.2.0 rest on one further authority: the Owner's message **FORMAL OWNER AUTHORIZATION — NOUJOUDE PROJECT**, §1, dated 1 November 2026 — a chat message, not (yet) a file in `reference/`, and §6A.3 records that limitation rather than concealing it.
**Rule this file enforces:** Directive §17 — "Do not invent factual or legal content." (line 319), "Do not fake records or metrics in production screens." (line 320), and "Do not ask the Owner to decide routine technical details already governed here." (line 316). Both halves are binding: §3 keeps every genuine question on the page, §5 removes every question that must never be asked.

**Counts as measured 1 November 2026: 22 Owner inputs — 20 `Outstanding`, 1 `Accepted (internal targets only)` (OID-20), 1 `Approved in principle, conditional` (OID-22).** Nothing in this register has been supplied as a *fact*, and nothing has been rejected. The two rows that moved did so because the Owner answered a **decision** the register was asking for (accept these targets? authorize deployment?); not one of the 20 factual rows gained a value, because §2's re-check found no authoritative source for any of them in this workspace. §6 states how the register was compiled and §6A states exactly what was searched on 1 November, what was found, and what the Owner must still supply for each of the 20 — so the count is evidence, not guesswork.

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
| `Accepted (internal targets only)` | The Owner has adopted proposed engineering figures as internal targets, with an explicit prohibition on external representation. Used only where the item asked for acceptance of values already documented, and the Owner's authorization itself forbids the wider act. |
| `Approved in principle, conditional` | The Owner has authorized an action **when its prerequisites are met**, without waiving any gate and without supplying the missing prerequisites. Not an execution record: nothing has been deployed. |

Two statuses were added on 1 November 2026 because the Owner's authorization distinguishes them and a four-state vocabulary would have had to lie: an approval in principle is not `Provided` (no fact was supplied) and it is not `Outstanding` (the decision was made). The states the Owner's §5 requires — approved, executed, verified, blocked, not applicable — are kept separate from these row statuses throughout: `Approved in principle, conditional` is an approval, and §3's OID-22 row says in the same breath that nothing was executed.

**Status of every row, as measured 1 November 2026:** 20 rows are `Outstanding`, OID-20 is `Accepted (internal targets only)`, OID-22 is `Approved in principle, conditional`. No row is `Provided`, with one exception noted inside OID-02 (the **English** tagline is spec-locked and therefore not an input at all — see §5), and no row is `Rejected`.

---

## 2. The two classes, separated exactly as Standard §13 requires

**Class A — engineering defaults, decided by the architect, never to be escalated as Owner questions.** Component boundaries and naming · database indexes and safe constraints · form validation and error presentation · responsive breakpoints within the design system · test organization and fixtures · telemetry instrumentation approach · cache implementation within the invalidation rules · standard accessible interactions. All eight are exercised in §4.

**Class B — Owner inputs that must never be fabricated.** Standard §13 names the categories: institutional legal identity and jurisdiction · actual founder story and attributions · real artifact inventory and factual data · ownership, provenance and authenticity evidence · image/document rights and licenses · official contact details · approval of operational costs, providers and formal service commitments. §3 below enumerates the concrete instances that are actually missing in this workspace, which is a larger set than the seven category headings because several categories split into separately answerable facts.

---

## 3. Owner input register (22 items: 20 Outstanding, 2 decided on 1 November 2026)

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
| **OID-19** | Hosting/environment selection, object-storage vendor, AI provider **and model**, email/SMTP provider, backup target, OTLP destination, **and now the identity-provider instance** (which OIDC-compatible IdP, hosted where, under whose administrative control, at what recurring cost) — and acceptance of the recurring cost | Standard §13 puts this class with the facts: "Approval of operational costs, providers, and formal service commitments." (line 304) Measured absence: counting empty values in `.env.example` (`grep -cE '^[A-Z0-9_]+=$'`) gives 19, of which 14 are provider/endpoint selections (`S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `AI_PROVIDER`, `AI_PROVIDER_API_KEY`, `AI_MODEL`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `INQUIRY_NOTIFY_ADDRESS`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `RATE_LIMIT_REDIS_URL`, `BACKUP_TARGET_URI`) and 5 are the superuser/role passwords the operator must create locally and `scripts/db/init-roles.sh` reads at lines 58 to 67; no ADR selects a vendor — ADR-025 decides the MFA *mechanism* and explicitly refuses to name a provider, recording self-hosted Keycloak only as a non-committed zero-cost candidate; the AI model choice also decides the vector dimension that ADR-007 deliberately refuses to hard-code. **Updated 1 Nov 2026 by OD-3:** the local `.env` now exists and carries the 5 role passwords plus `PAYLOAD_SECRET` as freshly generated values, which is an operator act the Owner authorized and which answers **none** of this row — the 14 provider/endpoint keys remain deliberately empty in `.env` exactly as in the template, no vendor is selected, and no recurring cost has been accepted. The row is unchanged because the fact is unchanged | `Outstanding` | Module 16 integration status (safeguarded configuration), Module 14's identity configuration (ADR-025 decision 1), `docs/SECURITY_AND_PERMISSIONS.md`, `docs/AI_CURATOR_GOVERNANCE.md` | Every adapter is written to a vendor-neutral interface with contract tests against a local stub; nothing fakes a provider in real environments; the inert test env in `tests/setup/env.ts` keeps keys blank by design; ADR-025 decision 5 deliberately adds no `OIDC` key to `.env.example` until the strategy that reads it exists, so this absence is a stated rule and not a hole (contrast H-1, where a declared variable has no implementation) |
| **OID-20** | Formal acceptance of the proposed RPO/RTO and availability baseline — and a decision on whether anything may ever be **published** as an SLA | The `GAP-14` row of `reference/Noujoude_Gap_Closure_Register_EN.csv` records its closure as `Closed as proposed baseline; provider proof/Owner approval pending` (CSV cell value). The availability rule: "Target monthly availability objective for V1 is 99.5%, subject to the actual provider/support plan and formal Owner acceptance. Do not publish an SLA based solely on this internal objective." (Standard §11 line 262) The specification agrees: "They are engineering acceptance targets, not public contractual SLAs." (Master Spec line 3883) | `Accepted (internal targets only)` — **1 November 2026, Owner authorization §1(7)** | Operations record in `docs/TEST_AND_RELEASE_REPORT.md`; Module 16 service settings | **What was accepted, in the exact documented values, none invented or altered** (Standard §11 lines 249–251 for the RPO/RTO rows, line 256 for retention, line 259 for the restore cadence, line 262 for availability; Master Spec G.11.1 lines 3887–3888 for the two availability scopes): PostgreSQL primary data RPO ≤ 1 hour / RTO ≤ 4 hours; original media and critical object storage RPO ≤ 4 hours / RTO ≤ 8 hours; application config and deployment artifacts RPO ≤ 24 hours / RTO ≤ 4 hours; 35 daily, 12 weekly, 12 monthly recovery points; restores tested quarterly and before major database/storage migrations; 99.5% monthly availability for both the public museum and the Control Center. **What the acceptance does not do:** the Owner's authorization states that it does not authorize representing these figures as a contractual or publicly guaranteed SLA, so the prohibition in Standard §11 line 262 and the public-copy ban in `docs/IMPLEMENTATION_PLAN.md` R-07 survive this row closing, unchanged. **What remains factually missing, and is now an execution prerequisite rather than a decision:** no hosting or support plan has been selected (OID-19), no restore has ever been attempted in this workspace, and Standard §11 line 245 still describes the figures as proposed engineering targets rather than a claim a vendor meets. Acceptance makes them binding *internally*; it does not make them *measured* |
| **OID-21** | Approved legal texts and rules: privacy notice, terms of use, cookie/consent posture, and the **retention period for inquiry personal data** | The route table names the gate twice: the privacy row reads "Approved privacy notice" (Master Spec line 425) and the terms row reads "Approved terms of use" (line 426) — the adjective is the gate, not decoration. Module 13's acceptance criterion is "Inquiry PII is role-restricted; inquiries are excluded from public search and AI retrieval; retention actions are logged." (line 3816) — the retention rule is required but its period is not supplied, and legal retention periods are jurisdiction-dependent, while jurisdiction itself is OID-01 | `Outstanding` | Policy content records per locale with publication state; Module 13 retention configuration | Policy routes, versioning and consent plumbing are built with a withheld state; inquiry PII is role-restricted, excluded from search indexing and from AI knowledge by default — protection does not wait for the text |
| **OID-22** | Explicit authorization to deploy to production | Directive §17 line 325; Standard §12 line 281 and §15 line 335; ADR-level prohibition | `Approved in principle, conditional` — **1 November 2026, Owner authorization §1(8)** | Release record in `docs/TEST_AND_RELEASE_REPORT.md` §8 | **The condition is the content of the decision.** The Owner authorizes production deployment *when all mandatory release gates have passed*, and the authorization explicitly does not waive security requirements, rights and licensing requirements, data protection requirements, release acceptance criteria, required operational readiness, the need for an identified production target, or valid deployment credentials. Therefore the state of this row is an approval, and the state of the act is: **nothing has been deployed, no target exists, no credential exists, and no release gate has passed** — those are execution prerequisites recorded as such in `docs/TEST_AND_RELEASE_REPORT.md` §4A, not Owner decisions this row can manufacture. What changes on 1 November is that the *class* of action is no longer forbidden: a future deployment attempt will not be refused for want of authorization, only for want of gates, a named target, and real credentials. No deployment tooling is pointed at any production target, and staging is not assumed either — the Owner's text forbids deploying to an assumed or invented target |

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

**Superseding note, 1 November 2026 — two rows moved, twenty did not, and the difference is the point.** The
sentence above this one — that all 22 rows remain `Outstanding` — is retained as the 31 October record it was, and
is no longer the current state. The Owner's authorization of 1 November closed exactly two rows, and closed them
because the thing asked for was a *decision the Owner alone could make* (accept these numbers as our internal
target? do you authorize deploying to production someday, on conditions?). Neither closure supplied a fact about
the museum:

- **OID-20** is `Accepted (internal targets only)`. The values are the ones already documented, quoted unchanged
  in the row. The acceptance does not license an SLA, and Standard §11 line 262's prohibition still binds.
- **OID-22** is `Approved in principle, conditional`. It authorizes a class of future act and waives nothing;
  gates, target and credentials remain execution prerequisites, and no deployment has occurred.
- **OID-01 … OID-19 and OID-21 stay `Outstanding`, all 20 of them**, and §6A records the specific fact still
  missing for each and the minimum evidence that would close it. The re-check searched the workspace before
  writing that section; it found nothing that closes any of the 20, and the Owner's blanket authorization was
  explicitly not treated as a substitute for the facts — §6 of that authorization says so in terms.

Two consequences for the rest of the documentation. First, the schedule rule in the note above survives and now
has an exception-shaped hole in it: Module 14's MFA half is still deferred against OID-19, which is still
`Outstanding`, but OID-20's closure means the backup and restore *cadence* is a committed internal target rather
than a proposal awaiting a decision — it can be engineered against, and still cannot be published. Second, no row
in this register became `Provided`. `Accepted` and `Approved in principle` are decisions about *our* targets and
*our* permissions; `Provided` is reserved for the museum's facts, and not one has arrived.

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

**Environment actions, which are neither Owner *facts* nor architecture decisions** — they are operator steps the build cannot perform for itself, listed here once so they are not mistaken for institutional inputs. **All four were authorized and executed on 1 November 2026; the statuses below were re-measured, not asserted, and the full evidence is `docs/IMPLEMENTATION_PLAN.md` §10.1 and `docs/CHANGELOG.md`.**
- Install the Node runtime required by `engines.node` (B-01 / OD-1) — **executed and verified: `v24.22.1`**. **This row previously read 24.22.2, and that was wrong:** the constraint is `>=24.22.1 <25`, the release the Owner authorized and the project installed is **24.22.1**, and the documentation had drifted upward by one patch without anyone changing the requirement. Corrected here rather than quietly, because a register that names a version the project does not run is the kind of stale claim `docs/IMPLEMENTATION_PLAN.md` §8 catalogs as a documentation defect. The ADR still refuses to work around the constraint.
- Create `.env` from `.env.example` with local development values (B-03 / OD-3) — **executed and verified: `.env` exists, 93 lines, 38 keys, 6 freshly generated secrets, 14 provider/endpoint keys left empty on purpose (that emptiness *is* OID-19), mode `0600`, and `git status --ignored` reports `!! .env`. No secret value has been printed in any document, log or report in this workspace.**
- Authorize `git init` and the first checkpoint commit (B-04 / OD-4) — **executed and verified: repository initialized on `main`, first commit recorded, no remote configured, nothing pushed; `.gitignore` reviewed before staging and a secret audit run against the index.**
- Authorize dependency installation and the first application scaffold (B-02 / OD-2) — **installation executed and verified: `pnpm install` exit 0, `node_modules` present, `pnpm-lock.yaml` written and committed. The *scaffold* half was not: `src/` is still empty of application code, and building it is Phase 2 work this batch does not start.**
- Arm the `pnpm run` guard (B-10 / OD-7) — **executed and verified: the global pnpm config now reads `verifyDepsBeforeRun: error`; the fifth action, added because H-12 showed this list was incomplete without it.**

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
| Confirmed no Owner input is marked `Provided` | nothing in the workspace records an Owner decision, approval or supply — **true as compiled on 31 October; §6A records what changed on 1 November and what did not** |

---

## 6A. Re-check of every open row, 1 November 2026 (the Owner's §2 instruction, executed literally)

The Owner's authorization asked for one thing per remaining input: search for an authoritative source; if the exact
fact is already documented, record the source and date and close the row; if not, keep the row open and report the
exact missing fact and the minimum evidence required. It also stated in §6 that the blanket authorization is **not**
a substitute for factual project information. So the search was run, and this section is its output.

**Sources searched, with the commands:** every file under `reference/` (7 files) and every non-generated file under
`docs/`, plus the workspace's own records — `grep -ril` over `reference/` for jurisdiction, legal name, legal form,
foundation, accreditation, founder, established-in, telephone, opening hours, VAT and commercial-register terms; a
read of the Master Spec's own input register at §21 (lines 3176–3242); `docs/ASSET_INVENTORY_AUDIT.csv` re-parsed
for all 82 rows; `Noujoude.photo/_pending_review_AI_generated/_manifest.json` re-read; `.env.example` and `.env`
key states re-counted; the Gap Register re-read for closure wording.

**What the search produced, honestly stated:** one authoritative source the register had not previously cited —
**Master Spec §21, the specification's own Owner-input register** — which enumerates the required inputs under
`OI-001…OI-009`, `CI-001…CI-010`, `BA-001…BA-007` and `LO-001…LO-008`, and records each one's state as pending
supply. That is evidence of *what is required and how it must be answered*; it is not evidence of any of the missing
facts. **Not one of the 20 open rows closed**, because no reference file, asset filename, configuration value or
prior document supplies a legal name, a founder, an address, an artifact, a rights statement or a provider
selection. Every hit for the searched terms was a **requirement or a prohibition**, not a value.

Two near-misses are recorded because they are exactly the kind of thing a later reader (or a later model) would
mistake for evidence. First, Master Spec §21.5 (lines 3234–3236) reproduces a *Current Project Truth* paragraph
claiming an existing Next.js foundation, PostgreSQL/pgvector work and an asset library; the specification itself
excludes those as implementation claims and requires independent dated evidence, so they cannot close any row.
Second, OD-3 filled six secret values into `.env` on 1 November — locally generated, operator-grade, and **not** an
Owner input; OID-19 stayed open precisely because `.env`'s 14 provider/endpoint keys are still empty by design. And
every keyword hit was a rule rather than a value — the About-page prohibition is typical: "The page must not invent the institution's legal status, physical building, founder's biography, origin date, accreditations, or partnerships." (line 836)

**Per-row outcome.** Status is unchanged (`Outstanding`) for all 20 rows below; the column that matters here is the
last one, because that is what the Owner has to act on.

| OID | Spec §21 ID | Exact fact still missing | Minimum evidence that closes it |
|---|---|---|---|
| OID-01 | OI-001, OI-003, LO-001 | English legal/institutional name; legal nature and operating status; governing jurisdiction | A one-paragraph Owner-signed statement giving the registered entity name verbatim, its legal form, and the jurisdiction whose law governs — plus, if the name is to be published, the registry extract or equivalent that supports it |
| OID-02 | OI-002 | The canonical Arabic institutional name and the approved Arabic forms of the brand strings | The Arabic strings themselves, in the orthography the Owner approves. A proposed transliteration from the build does not count: the rule forbids an unapproved substitute (Master Spec line 512) |
| OID-03 | OI-007 | Whether any physical location is intended for publication, and which address if so | A yes/no decision. If yes: the publishable address text and an explicit permission to display it. If no: that sentence, and the location block becomes a permanent not-applicable state |
| OID-04 | OI-004, OI-005 | The founding history, its dates, and the attribution of founder / owner / collector / institutional representative | The narrative as the Owner authorizes it, with dates, and the name or role description that may appear beside it |
| OID-05 | OI-008 | Whether any partnership, affiliation, certification or accreditation exists, and whether any officially-recognized claim may be made | Per claim: the counterparty, the instrument, its date, and permission to name it. A statement that none exists is also a closing answer |
| OID-06 | OI-006 | Postal address, telephone, email, opening hours, and the address that receives inquiries | The channel list exactly as publishable, plus the `INQUIRY_NOTIFY_ADDRESS` value. The SMTP provider that must carry the mail is OID-19, not this row |
| OID-07 | OI-009 | Approved mission, vision and institutional narrative wording, in English and Arabic | The text. The values already fixed by the specification (Master Spec line 187) are not this input; the prose is |
| OID-08 | CI-001, CI-009 | Which artifacts actually exist: identity, classification, dates, and country assignment | An inventory — one row per object with a stable identifier, title, category, and the country relationships the Owner asserts. Nothing in `reference/` lists a single real object |
| OID-09 | CI-003, CI-004 | The factual claims per artifact, with date precision | Per-object statements the Owner authorizes, each marked with its precision (exact / circa / period) |
| OID-10 | CI-004 | The evidence and sources behind each claim | For each claim, the document, catalogue entry, or record that supports it, supplied as material the project can store and cite |
| OID-11 | CI-006 | Ownership statement per artifact, its evidence, and what may be disclosed | A statement of who holds the object, the evidence for it, and the disclosure rule — the model exists (ADR-011) and is empty by design |
| OID-12 | CI-005 | Provenance events: dates, actors, places, and evidence per event | The custody chain as documented, event by event. Fabricated provenance is release-blocking (Master Spec line 2095) |
| OID-13 | CI-007 | Authenticity assessments: conclusion, method, reviewer, approval, and permitted disclosure | An assessment per object the institution intends to assess, signed by a named reviewer. If the institution does not intend to claim authenticity, that decision closes the row instead |
| OID-14 | — (not enumerated in §21; required by Master Spec §16.6 line 2455) | Condition reports for real objects | Approved condition, preservation and conservation observations per object, with reviewer. Depends on OID-08 existing first |
| OID-15 | CI-008, BA-005 | Rights and licences for the 72 original assets, plus creator/source attribution | Per asset: the rights holder, the licence or permission, its scope and term, and the creator/source line to display. Possession of the file is not any of these (Asset Requirements line 111) |
| OID-16 | CI-008 | Rights for scanned letters, certificates and documentary files | The same per-document facts, with the letter's author and the image's rights holder named separately — they are different subjects |
| OID-17 | BA-006 | Approval of the 10 AI-generated assets, their rights position, whether illustrative AI visuals may represent heritage subjects at all, and the 10 missing `source_png` originals | A yes/no per asset from the Owner, the rights position, and the lineage files. All 10 manifest entries still read `Pending Human Approval` and `Awaiting Rights Review`, and all 10 source PNGs are still absent from the filesystem |
| OID-18 | BA-001…BA-004 | Final logo and variants, approval of the palette HEX set, the material families, and final font licences with deployment source | The signed-off brand set and, per font, the licence document plus where it may be served from. The palette row in Asset Requirements line 39 says the values are a working baseline awaiting this approval |
| OID-19 | LO-008, and LO-005's provider half | Hosting/environment selection, object-storage vendor, AI provider and model, SMTP provider, backup target, OTLP destination, identity-provider instance, and acceptance of the recurring cost | A named provider and plan per service, or an explicit decision to run it on the project's own infrastructure, plus the monthly cost the Owner accepts. AI conversation retention and provider data handling (LO-005) is tracked alongside this as PR-07 in `docs/AI_CURATOR_GOVERNANCE.md` |
| OID-21 | LO-002, LO-003, LO-004 | Approved privacy notice, terms of use, cookie/analytics consent posture, the copyright/takedown procedure, and the retention period for inquiry personal data | The legal texts per locale (or the instruction that they are being drafted) and one number: how long an inquiry's personal data is kept. Jurisdiction-dependent, so it also depends on OID-01 |

**What the Owner can do in one sitting, and what cannot be done in one sitting.** OID-03, OID-05, OID-13 and the
*decline* half of OID-17 each close on a decision sentence; OID-06, OID-07 and OID-02 close on short text the Owner
already owns; OID-19 closes on a provider list plus a cost acceptance. OID-08 through OID-14 and OID-15 through OID-16
are collection work — they need the inventory and the rights records, and no document in this workspace contains them.
That distinction matters for the plan: `docs/IMPLEMENTATION_PLAN.md` B-05, B-06 and B-07 gate public *claims*, not
buildable software, and Phase 2 proceeds against the withheld states this register already defines.

**The two rows that did move are not in the table above.** OID-20 is `Accepted (internal targets only)` and OID-22 is
`Approved in principle, conditional`, both on 1 November 2026, both recorded in §3 with what their authorization does
not do. Mapping them back to the specification's own register: OID-20 answers LO-006 and LO-007 (lines 3228–3229),
and OID-22 is the release-side counterpart of Directive §17's prohibition. The reference files are read-only, so the
`Pending … Approval` state the specification writes for those rows is unchanged in `reference/` and superseded only
in this register's status column — which is the correct direction of authority, and is recorded that way so nobody
later reads the spec's stale state as a missing decision.

---

## 7. Update protocol

1. Only the Owner — or a document the Owner supplies — may change a status. The build never moves a row to `Provided` by inference, by silence, or because a value appeared in an asset filename.
2. On receipt: record the source document name and date in the row, then update the module/table field it lands in, then add the traceability row to `docs/REQUIREMENTS_TRACEABILITY.md`.
3. If an item is declined, mark it `Rejected` with the reason; the route must then render the "not applicable" state permanently, and the question is retired from this register.
4. Any answer that contradicts the specification is a change request against the specification, logged in `docs/MASTER_SPECIFICATION.md` §2 — not a silent override.
5. Publishing an answer never authorizes a *different* answer: e.g. approving an image's rights (OID-15) does not approve its curatorial use (OID-18); GAP-10 keeps existence, rights and approval as separate fields.
6. Rows stay here until answered; engineering continues per Master Spec line 3937 and does not queue behind them.
