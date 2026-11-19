# NOUJOUDE DIGITAL HERITAGE MUSEUM — SECURITY & PERMISSIONS

**Document ID:** NDM-SEC-001
**Version:** 1.0.0
**Date:** 31 October 2026
**Status:** **CONTRACT — UNIMPLEMENTED.** Every control in this document is a *required* rule with a named
enforcement mechanism and a named planned test. **None is a satisfied control.**
**Supersedes nothing.** Companion documents: `docs/ARCHITECTURE_DECISIONS.md` (NDM-ARCH-ADR-001),
`docs/MASTER_SPECIFICATION.md` (working copy + discrepancy log), `docs/AI_CURATOR_GOVERNANCE.md` (NDM-AI-GOV-001),
`docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` (NDM-MED-001).

---

## 0. Status banner and evidence rule — read before using this document

There is **zero application code**. At the time of writing the workspace contains two files under `src/`
and `tests/` (`src/README.md`, `tests/setup/env.ts`), authored configuration at root
(`package.json`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`,
`.env.example`, `docker-compose.yml`, `scripts/db/init-roles.sh`), and documentation under `docs/`.
**Re-measured 1 November 2026:** the dependency set is no longer a *candidate* list — `pnpm install` executed under
OD-2 with exit **0**, so `node_modules/` and `pnpm-lock.yaml` exist and every pinned version is now a *resolved*
one — and the clean-install gate of Standard §2.3 step 9 is no longer blocked by B-01, because the host reads
`v24.22.1`, inside `engines.node: ">=24.22.1 <25"`. What that gate still lacks is an application to install *for*:
the chain now breaks at `pnpm test` (exit 1) and `pnpm build` (exit 1), not at the install. The consequence below
is unchanged — every control in this document remains a contract with no implemented, tested mechanism behind it.

This document is therefore governed by the two binding statements it must not violate:

| Rule | Source | Consequence here |
|---|---|---|
| "Do not claim a feature is implemented without verifying behavior." | Directive §17 (line 318) | No control below is marked met. |
| "A route, React component, button, schema field, migration, or successful build alone is not proof." | Directive §15 (line 290) | Authored config (ESLint rule, `.env.example`, role script) is recorded as *intended enforcement*, never as verified behaviour. |
| "No invented metrics, security compliance, or backup success claims." | Standard §15 (line 334) | No ASVS, WCAG, RPO/RTO, or availability *result* is asserted. |
| "A security header set alone does not establish that the application is secure. Security must be verified through tests against the implemented system." | Master Spec §19.3 (line 2906) | Each control carries a required test, all Not Implemented. |
| Requirement status vocabulary: Implemented and Verified / Partially Implemented / Not Implemented / Blocked by Owner Input / Out of V1 Scope | Directive §15 (line 288) | Default status throughout: **Not Implemented**. |

Two vocabulary notes used consistently below:

- **Contract — unimplemented** = the rule is binding, the mechanism is named, nothing has executed.
- **Authored, unexecuted** = a file exists that is *intended* to enforce the rule and has not been run.
  `eslint.config.mjs` is the example that still holds: ESLint has never run because `node_modules` is absent
  (B-02). `scripts/db/init-roles.sh` **left this class on 1 November 2026** — the A.5 harness ran it against a
  live PostgreSQL 18.6 container (`docs/A5_PRIVILEGE_EVIDENCE.txt`) — so it is now *executed in isolation,
  undeployed here*, because this project's compose stack cannot start without `.env` (B-03) and the image pull
  that D-03 once recorded as unattempted is moot: the tag is already in the local cache.

---

## 1. Threat model framing for this specific product

Master Spec §19.3 (line 2884) requires the public application, Control Center, APIs, data layer, media
pipeline and AI retrieval services to be "assessed as one system". §19.5 (lines 2916–2930) names the minimum
assessment set. Framed against the four actual surfaces of this product:

### 1.1 Surface A — public bilingual (EN/AR) museum experience
Anonymous, high-volume, indexable, RTL and LTR, with search and an AI Curator (§17.2 J, line 2732: "No
ordinary visitor account is required for browsing").

Primary threats (§19.5 lines 2918–2930): reflected/stored XSS through rich text, forms, metadata and imported
content; injection through search, filtering, sorting, upload and integration inputs; unintended publication or
indexing of private content; open redirects through language switching; scraping that enumerates unpublished
records; enumeration of draft slugs. Product-specific aggravator: the §10 lines 1457–1461 rule "Never silently
substitute another language" and §23 invariant 19 (line 3308) "Missing content is shown honestly rather than
fabricated" mean an information-disclosure bug here is also a *content-truth* defect.

### 1.2 Surface B — private 20-module Control Center (`/control-center`)
Root protected by authentication and server-side authorization; "A user must not gain access by hiding a
navigation element" (§4.3, line 432); "Direct links to private Control Center pages must be denied to
unauthorized users" (§4.4, line 444); module map fixed by ADM-001 (line 3097: "Control Center uses the 20-module
map only").

Primary threats: unauthorized `/control-center` and protected-API access; privilege escalation and Owner
account takeover (§19.5 lines 2918–2919); broken object-level access (§19.3 line 2893 requires
*object-level* authorization to prevent insecure direct object reference); CMS as a lateral-move platform —
the Control Center is the only rich administrative surface the product has, so any capability creep inside it
is a control-plane compromise (§23 invariant 14, line 3303).

### 1.3 Surface C — AI Curator over governed knowledge
A retrieval system whose *permission model* is the museum's own eight state dimensions
(§11.1 lines 1528–1537). Threats: prompt injection through user prompts **and** through retrieved documents
(§19.5 lines 2927–2928; §14.8 lines 2025–2027); AI disclosure of private source material or administrative
records; secret/credential extraction via tool access; retrieval-layer bypass by crafting a query that matches
an ineligible record; fabricating provenance/ownership/authenticity, which §14.13 (line 2095) makes a
**release-blocking defect**. Detailed governance is `docs/AI_CURATOR_GOVERNANCE.md`.

### 1.4 Surface D — private originals for heritage artifacts whose rights are largely uncleared
Physical fact from the Phase 0 audit (`docs/asset-audit-summary.json`, `docs/ASSET_INVENTORY_AUDIT.csv`):
**all 82 catalogued assets have `Not Approved — no approval record supplied`, and 72 of them carry rights
status `UNKNOWN — no rights statement supplied in reference/`.** There is therefore no asset in this
workspace whose public display is presently defensible — **the two bolded readings are the Phase 0 audit's, kept as
the record of that date and superseded as a state statement on 4 November 2026: the Owner's declaration of that date
(`docs/OWNER_ASSET_AUTHORIZATION_2026-11-04.md`) puts `cleared` and `approved` on 82 of 82 register rows and
`Published` on 46, so display permission now exists while every fact about the depicted objects is still absent. The
consequence for this document is the opposite of relief: the surface below is no longer protected by an empty cell,
it is protected by the serving gate, which raises the stakes on §6 and §10 rather than lowering them.**

Threats: public serving of restricted originals; signed-URL leakage, replay or over-long validity; using a
file extension as a sanitization claim (Standard §6 line 189); upload of an executable/SVG/script payload
executing in the application origin (Standard §6 line 190); destructive deletion of an original; loss of
original→derivative lineage — **already materialized** in this workspace for the 10 quarantined AI-generated
assets, whose manifest-referenced source PNGs are absent from the workspace
(`ASSET_INVENTORY_AUDIT.csv` `Derivative Status` = "DERIVATIVE (webp) from a PNG original that is not retained").

### 1.5 Cross-surface threats named by the specification
Exposure of draft/private/rights-restricted content (§19.5 line 2921); malicious or oversized uploads
(line 2924); CSRF/session abuse (line 2925); secret exposure in source maps, logs, frontend bundles or admin
views (line 2926); unauthorized permanent deletion or destructive recovery (line 2930). Standard §15 adds the
unconditional prohibitions: no frontend-only authorization, no public access to private originals or
restricted artifacts, no raw SQL/shell/secret/infrastructure controls through the ordinary CMS UI, no
deployment to production without Owner authorization, no silent downgrade of RPO/RTO, accessibility,
performance or security requirements (lines 331–336).

---

## 2. Roles and the permission model

### 2.1 Canonical roles (Master Spec §17.2 A–K, lines 2688–2736) and roles the spec *implies* but does not canonicalize

| # | Role (this document's name) | Canonical source | Verbatim constraint that drives the design | Status |
|---|---|---|---|---|
| R1 | **Owner / Institutional Authority** | §17.2 A, 2688–2696 | "The Owner's authority must not be silently removed or downgraded by an ordinary administrator" (2694); "Owner control does not expose raw credentials, arbitrary code execution, production deployment secrets, direct unrestricted SQL, or destructive infrastructure operations" (2696) | Contract — unimplemented |
| R2 | **System Administrator** | §17.2 B, 2698–2700 | "Does not automatically receive curatorial authority to verify artifact claims, provenance, ownership, or authenticity. Does not automatically override the Owner" (2700) | Contract — unimplemented |
| R3 | **Museum Director** | §17.2 C, 2702–2704 | Institutional content governance and *assigned* publication oversight within scope (2704) | Contract — unimplemented |
| R4 | **Curator / claim reviewer** | §17.2 D, 2706–2708; action row "Review/verify claims" (2775) | "Does not automatically manage user security or infrastructure" (2708); §8.11 line 1268: "Verification is claim-specific" | Contract — unimplemented |
| R5 | **Editor (content editor)** | §17.2 E, 2710–2712 | "Cannot independently mark uncertain historical claims verified or bypass curatorial review" (2712) | Contract — unimplemented |
| R6 | **Publisher** | §17.2 F, 2714–2716 | "Cannot bypass required curatorial, rights, or locale approval" (2716) | Contract — unimplemented |
| R7 | **Translator / localization editor** | §17.2 G, 2718–2720 | "Translation authority does not grant authority to alter factual claims, provenance, ownership, or verification state" (2720) | Contract — unimplemented |
| R8 | **Media Manager** | §17.2 H, 2722–2724 | "A media-management role does not automatically prove legal rights; a qualified rights reviewer/Owner must approve relevant permission claims" (2724) | Contract — unimplemented |
| R9 | **Researcher / Contributor** | §17.2 I, 2726–2728 | "A contributor cannot publish or approve their own material unless separately granted that authority" (2728) | Contract — unimplemented |
| R10 | **Public Visitor** (anonymous) | §17.2 J, 2730–2732 | Published public content, search, AI Curator, language change, permitted contact requests only (2732) | Contract — unimplemented |
| R11 | **AI Service Principal** (non-human) | §17.2 K, 2734–2736 | "read-only, scoped access to eligible knowledge sources. It cannot publish, approve, edit collection records, change permissions, or access secrets beyond its minimal runtime requirement" (2736) | Contract — unimplemented |
| R12 | **Rights reviewer (competent approver)** | **Implied, not canonical.** Named only inside §17.2 H line 2724 ("a qualified rights reviewer/Owner") and reached through the §17.4 row "Approve rights status" = "Yes / delegated" + "Assigned" (lines 2780) | §17.2 lists A–K and contains no rights-reviewer role, yet §8.15 (line 1344) states "The presence of a file in the library does not prove a right to display it" and §11.6 line 1593 requires "Only rights states explicitly cleared for the intended public use may be displayed". A distinct approver must exist for that to be enforceable. | Contract — unimplemented; **§2.4 finding 1 closed by ADR-020**: not a twelfth role, but the `Approve` action (line 2749) scoped to the rights module, granted by recorded delegation |
| R13 | **AI knowledge reviewer** | **Implied, not canonical.** Reached through Module 09 "Knowledge review" (§16.9 line 2536) and §17.4 row "Manage AI knowledge policy" = Curator "Source/curation input", Translator "Terminology only", Director "Oversight" (line 2782) | §14.13 (line 2083) says "Reviewers may classify outputs…" — a reviewer actor the role list never defines | Contract — unimplemented; **§2.4 finding 1 closed by ADR-020**: the `Review` action (line 2747) scoped to the AI knowledge module, plus `Verify Claims` (line 2748) where a review changes retrieval eligibility |
| R14 | **Read-only auditor** | **Implied, not canonical.** §17.3 action "View Audit Records" (line 2759) is a distinct permission; §16.19 line 2664 restricts audit access; Standard §3.2 (line 103) already provisions a read-only DB identity (`ndm_reporting`) | "Ordinary users must not be able to silently edit or erase audit history. Access to sensitive audit details is restricted" (2664) | Contract — unimplemented; **§2.4 finding 1 closed by ADR-020**: `View Audit Records` granted with no write action in the same assignment, field-level scope for sensitive detail, and `ndm_reporting` for the data-layer read path (ADR-019) |

### 2.2 Permission action vocabulary (§17.3, lines 2740–2760)

View · Create · Edit · Duplicate · Submit for Review · Review · Verify Claims · Approve · Publish · Unpublish ·
Archive · Restore · Delete (protected, exceptional) · Manage Users · Manage Roles and Permissions ·
Manage Institutional Settings · Manage Security-Sensitive Integrations · View Audit Records · Export Data
(where approved).

Scoping rule, verbatim (line 2762): "Every permission must be scoped by module, record type, record, locale,
and action where relevant. A role must not acquire permissions solely because it can open a module." Grant
narrowing rule (line 2766): "Owner may grant narrower scopes where appropriate; privileges must not be
broadened implicitly."

### 2.3 Positive / negative permission matrix — 20 Control Center modules (§16.1–§16.20, lines 2259–2674)

Legend — **A** = allow (positive case required), **D** = deny (negative case required),
**S** = allow only within an explicit record/locale/action scope, **R** = read-only, **X** = structurally
forbidden to every role except Owner through a protected process.
Derived from the §17.4 baseline matrix (lines 2768–2789); the module list is ADM-001 (line 3097).

| # | Module (line) | OWN | ADM | DIR | CUR | ED | PUB | TR | MM | RES | AUD | AI | PUB-V | Enforcement basis |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | Executive Overview (2259) | A | S | A | A | A | R | R | R | R | R | D | D | read aggregation only; must not fabricate metrics (Directive §17 line 320) |
| 02 | Website & Page Studio (2285) | A | D | A | S | A | D | S | D | D | R | D | D | §17.4 "Manage page sections" (2772) |
| 03 | Brand & Visual Identity Studio (2343) | A | S | A | D | D | D | D | S | D | R | D | D | §17.4 "Manage institutional identity" (2771); §23 invariant 1 (3290) |
| 04 | Museum Worlds Management (2377) | A | D | A | A | S | S | S | S | S | R | D | D | §17.4 "Manage country/collection records" (2773); G.4 six-value state incl. `Hidden/Not Public` (3723) |
| 05 | Collections Management (2402) | A | D | A | A | S | S | S | S | S | R | D | D | (2773) |
| 06 | Artifact Management (2419) | A | D | S | A | S | D | D | S | S | R | D | D | factual metadata (2774), claims (2775), provenance (2776); screen sets §16.6 + G.8 per S-12 |
| 07 | Stories & Editorial Studio (2480) | A | D | A | S | A | D | S | S | S | R | D | D | (2777) |
| 08 | Media & Asset Library (2492) | A | D | S | S | D | D | D | A | D | R | D | D | (2779); upload safeguards line 2504 |
| 09 | AI Curator Command Center (2510) | A | S | S | S | D | D | S | D | D | R | **X** | D | (2782); AI may not self-approve (§17.5 line 2797; Standard §7 line 206) |
| 10 | Navigation & Footer Studio (2554) | A | D | A | S | S | S | S | D | D | R | D | D | (2772); route rules 438–447 |
| 11 | SEO & Metadata Center (2562) | A | D | A | S | S | S | S | D | D | R | D | D | G.9 (3842); §20.5 checklist (3120–3131) |
| 12 | Language & Translation Center (2572) | A | D | S | D | D | D | A | D | D | R | D | D | (2778) "No factual authority" for Curator on translation review |
| 13 | Forms & Inquiries Center (2582) | A | S | A | D | D | D | D | D | D | R | **X** | D | PII surface; §19.2 line 2871, §9.1 line 1410, Standard §7 line 199 |
| 14 | Users, Roles & Permissions (2592) | A | S | D | D | D | D | D | D | D | R | **X** | D | (2783) "Technical account admin"; Owner protection §17.6 (2804–2808) |
| 15 | Publishing & Revision Control (2600) | A | D | S | D | D | A | D | D | D | R | **X** | D | (2781); emergency unpublish line 2610 |
| 16 | System & Institutional Settings (2612) | A | S | S | D | D | D | S | D | D | R | **X** | D | (2784); hard boundary G.7 (3785–3794), line 2624 |
| 17 | Analytics & Insights (2626) | A | S | A | R | R | R | R | R | D | R | D | D | line 2630: unconfigured metrics "must be shown as unavailable" |
| 18 | Notifications & Alerts (2634) | A | S | A | A | A | A | A | A | S | R | D | D | alert categories (2636–2641) incl. backup/security events |
| 19 | Audit & Activity Center (2647) | R | S | S | S | R | R | R | S | R | **R** | D | D | line 2664; no edit/erase path for any role |
| 20 | Archive & Recovery Center (2666) | A | S | S | S | D | S | D | S | D | R | **X** | D | (2786–2787); permanent deletion = "Protected Owner process" (2787); §18.8 (2844) |

Every cell above is a **required test**, not an observed behaviour. The matrix carries 12 role columns; roles
R12 (rights reviewer) and R13 (AI knowledge reviewer) are absent as columns because **ADR-020 decided they are
not roles** — they are scoped permission grants, so they are matrixed as *grants on the columns that already
exist* rather than as new ones (the delegation rows themselves still need a design; see §2.4 finding 1 status).
Status of all **240 (20 × 12)** cells: **Contract — unimplemented.**

### 2.4 Recorded gaps found while building this matrix (new, not in S-01…S-14 / D-01…D-04)

1. **Three implied competences had no canonical definition — decided by ADR-020.** §17.2 defines exactly
   eleven roles (A–K, lines 2688–2736), yet §17.4/§16.9/§16.19 depend on a competent **rights reviewer**
   (line 2724, 2780), an **AI knowledge reviewer** (line 2083 "Reviewers may classify outputs", 2536) and a
   **read-only auditor**
   (line 2759, 2664). The permission engine could not be built without deciding whether these are roles,
   permission grants on existing roles, or both. **Decided: scoped permission grants on the eleven canonical
   roles, expressed with §17.3's own action vocabulary and recorded as delegations with grantor, grantee,
   scope and timestamp — ADR-020.** The eleven-role boundary stays closed (§21.6 line 3240 puts "the role
   boundaries" in the baseline an architect implements without asking); *who* holds each delegated approval
   remains an Owner input, not an engineering invention.
2. **Audit-record integrity is not achievable with the delivered role grants.** Master Spec §8.16 line 1356
   ("Audit records are protected from ordinary editing") and §16.19 line 2664 ("must not be able to silently
   edit or erase audit history") are absolute. `scripts/db/init-roles.sh` — the delivered implementation of
   Standard §3.2 / ADR-005 — grants `ndm_runtime` `SELECT, INSERT, UPDATE, DELETE ON ALL TABLES` plus
   `ALTER DEFAULT PRIVILEGES … GRANT SELECT, INSERT, UPDATE, DELETE`, i.e. the runtime identity **can**
   `DELETE` and `UPDATE` the audit table. So "protected from ordinary editing" (line 1356) is enforceable only by the
   application layer as written; it had no database-level guarantee. **RESOLVED as a decision and as
   implementation — ADR-019** (`docs/ARCHITECTURE_DECISIONS.md` §6): the runtime identity keeps
   `SELECT, INSERT` and loses `UPDATE`, `DELETE`, `TRUNCATE` on the declared append-only relations, with a
   superuser-owned guard trigger and `FORCE ROW LEVEL SECURITY` deny policies behind the grant, because
   `ALTER DEFAULT PRIVILEGES` cannot name a table and the table owner otherwise bypasses its own policies.
   **The evidence has now been produced, twice-qualified**: the behavioural matrix in
   `scripts/db/run-privilege-tests.sh` executed on 1 November 2026 with **exit 0** — 34 grant-state assertions
   and 14 of 14 cases A–N matching, 10 of them refused for an authorization reason
   (`docs/A5_PRIVILEGE_EVIDENCE.txt`) — after the 31 October attempt aborted on B-09, which has since cleared by
   observation. It ran against a **disposable container**, so this is "decision taken, code delivered, grant
   design demonstrated in isolation" — still **not** a passing control for this project, whose own database does
   not exist (`pnpm db:up` is blocked by B-03, the absent `.env`).
   **This conflict was not in S-01…S-14 or D-01…D-04 when it was found; it is now covered by ADR-019.**
3. **Provider selection has no compliant CMS path.** G.7 line 3779 requires the Owner to manage "provider
   selection" for the AI Curator through the Control Center, while G.7 line 3790 forbids editable Owner UI
   fields for "…provider tokens, or raw storage credentials", §16.16 line 2624 places "environment files …
   private deployment credentials … outside ordinary CMS settings", and Standard §13 (line 304) makes provider
   approval a non-fabricable Owner input. `.env.example` currently resolves the provider out-of-band
   (`AI_PROVIDER=`, `AI_PROVIDER_API_KEY=`, `AI_MODEL=` — all empty). A DB-backed, credential-*referencing*
   configuration record is required to satisfy both sides. Not previously logged.
4. **Two authored configs disagree on where tag-defined specs live.** `vitest.config.ts` comments place axe
   automation at `tests/a11y/**`, while `playwright.config.ts` sets `testDir: './tests/e2e'` and
   `package.json` runs `test:a11y` as `playwright test --grep @a11y`. Until reconciled, an `--grep @a11y`
   run against an empty `tests/e2e` would pass vacuously — which is exactly the "successful build alone is not
   proof" failure mode (Directive §15 line 290). Reconcile before writing the first a11y spec.

### 2.5 Authorization invariants (A-01…A-09 all Standard §4.2, lines 145–155; all Contract — unimplemented)

A-10 below is **not** from §4.2: it is an architect addition made by ADR-025 and is sourced from Standard §4.1
lines 132 and 134. It is labelled as an addition rather than presented as a quotation of the Standard's
authorization list.

| # | Invariant | Verbatim source | Enforcement plan | Required evidence |
|---|---|---|---|---|
| A-01 | Deny by default | Standard §4.2 line 147 | Payload access control returns `false` unless a predicate matches; no collection/global ships with open `read`/`create`/`update`/`delete` | `src/lib/access/*.access.integration.ts` — default-deny assertion per collection + global |
| A-02 | Server-side check on every protected operation | Standard §4.2 line 148; Master §17.1 line 2684 "Hiding a menu item or button is not authorization" | Payload hooks + access predicates on REST/Local API; Next.js route handlers re-check; no `use client` authorization decision | direct-API tests per §20.3 item 8 (line 3044); SEC-002 (line 3105) |
| A-03 | Never trust client-supplied role, owner, state, locale or record IDs | Standard §4.2 line 149 | Zod validation on every boundary (Standard §2.2 line 51: "Client validation is usability only; server validation is authoritative"); identity taken from the session, scope re-derived server-side | fuzzed-identity integration tests |
| A-04 | IDOR / object-level protection | Standard §4.2 line 150; Master §19.3 line 2893 | every read/write resolves the record, then evaluates the record's own scope; opaque existence for denied records (404 vs 403 choice must be deliberate and tested) | negative cross-object tests per module |
| A-05 | Separation of duties, evidence review vs publication | Standard §4.2 line 151; Master §17.5 lines 2793–2800; §11.3 line 1551 "Approval does not automatically publish content" | the *actor who reviewed a claim* may not be recorded as the actor who publishes it without an explicit second event; §17.5 line 2800 allows one person in multiple roles but requires "distinct review events and record who made each decision" | workflow tests §20.3 item 5 (line 3041); IAM-002 (line 3102) |
| A-06 | Owner authority protected from ordinary administrators | Standard §4.2 line 152; Master §17.6 lines 2804–2808; §17.2A line 2694 | Owner reassignment is a protected, re-authenticated, audited, two-step process; no admin UI path downgrades Owner; IAM-003 (line 3103) | negative tests: SysAdmin attempting Owner change must fail server-side |
| A-07 | Positive **and** negative cases for all twenty modules | Standard §4.2 line 153; G.12 line 3920 "Admin tests cover all twenty modules and permissions, including negative/unauthorized cases" | matrix in §2.3 instantiated as 20 spec files (§3) | planned files listed in §3; **all Not Implemented** |
| A-08 | Permission breadth never widens implicitly | Master §17.4 line 2766 | no role inheritance chain that grants by proximity; explicit grant records only | policy unit tests |
| A-09 | No frontend-only authorization | Standard §15 line 331 | ESLint `no-restricted-properties` on `process.env` in client scope (`eslint.config.mjs` lines 54–62) — **authored, unexecuted**; plus the runtime rule that the client never receives an authorization decision object it can act on | lint gate in CI (never run yet) + API tests |
| A-10 *(ADR-025 addition)* | **A role grant means nothing until the identity layer has authenticated its holder.** Authorization is never evaluated for a session whose second factor is unproven. | Standard §4.1 line 134 (MFA mandatory for Owner and privileged administrative accounts) and line 132 (Payload-supported auth or a maintained OIDC-compatible provider); Master §19.3 line 2890 re-authentication | the identity provider's assertion carries the authentication method; `auth.strategies` maps it to the Payload `users` record; privileged-route access predicates require the authenticated principal *and* the factor claim, so a session lacking either is denied before any role is consulted; local staff passwords disabled, break-glass account disabled unless actively recovered | negative tests in ADR-025's Consequences: first factor without second yields no session; assertion without the method claim refused on every privileged route; IdP-side revocation must not survive the cookie/JWT window; MFA-bypass attempt writes an `AuditEvent`; break-glass enablement names both approvers. **None executed — no IdP exists (B-05)** |

**Two clarifications added in the gap-closure batch (31 Oct 2026), because A-10 is the invariant most likely to
be over-read.**

*First — what has actually been verified about the mechanism.* ADR-025's premise is that Payload 3.92.1 ships no
native second factor, so the factor must come from an external identity provider. That premise is now verified
**against the pinned release rather than against a moving branch**: enumerating the monorepo's `packages/`
directory at tag `v3.92.1` returns **44** packages with **zero** hits for any identity, MFA, OTP, two-factor,
WebAuthn, SSO, OIDC or passkey keyword, and the published `payload-3.92.1.tgz` contains no second-factor module.
The verification has recorded limits, and they are part of the finding rather than a footnote: the `@payloadcms`
npm *scope* could not be enumerated at all (the registry search endpoint returned `total: 0`), so a package
published outside the monorepo would not have been seen; and the measurement is dated, which is why
`docs/ARCHITECTURE_DECISIONS.md` §8 makes re-verification a trigger condition. **What is verified is the absence
of a native mechanism at one pinned version. What is not verified is anything about behaviour** — no strategy has
been configured, no assertion has been received, no session has been issued.

*Second — A-10's acceptance tests are staged behind OID-19 and must not be scheduled before it.* Every negative
test in the right-hand column requires a reachable identity provider. Scheduling them into Module 14's wave-1
acceptance would schedule criteria that are guaranteed to be blocked, which produces either a false green or a
red box everyone learns to ignore. `docs/IMPLEMENTATION_PLAN.md` §6 therefore splits Module 14's gate in two: the
role and permission half stays in wave 1 and is testable once the schema exists; the MFA half is deferred **by
name** until OID-19 supplies an IdP instance. Until that half closes, Module 14 is *partially accepted* and must
be reported as such — never as accepted. This is a scheduling correction, not a weakening: Standard §4.1 line 134
still binds, and A-10 still holds as an invariant.

---

## 3. Required test inventory for §2 — planned locations and status

`vitest.config.ts` only collects `src/**/*.test.ts`, `src/**/*.test.tsx`, `src/**/*.integration.ts`, with
`passWithNoTests: false`; `playwright.config.ts` uses `testDir: './tests/e2e'` with four projects
(en-desktop, ar-desktop-rtl, en-mobile, ar-mobile-rtl). Planned paths below respect those two include-lists.

| Planned location | Covers | Status |
|---|---|---|
| `tests/e2e/permissions/module-01-executive-overview.spec.ts` … `module-20-archive-recovery.spec.ts` (20 files) | A-07 positive + negative per module | Not Implemented (no `tests/e2e/` files exist) |
| `src/lib/access/collections.access.integration.ts` | A-01, A-02, A-04 per collection & global | Not Implemented |
| `src/lib/access/ownership-protection.integration.ts` | A-06 | Not Implemented |
| `src/lib/access/separation-of-duties.integration.ts` | A-05 | Not Implemented |
| `src/lib/validation/untrusted-boundary.integration.ts` | A-03 (role/owner/locale/id injection) | Not Implemented |
| `src/lib/access/rls-runtime-role.integration.ts` | §5.4 RLS-as-runtime-role | Not Implemented |
| `tests/e2e/security/headers.spec.ts` | §6.1 CSP/headers/HSTS | Not Implemented |
| `tests/e2e/security/csrf.spec.ts` | §6.3 | Not Implemented |
| `tests/e2e/security/upload.spec.ts` | §6.4 + Standard §6 | Not Implemented |
| `tests/e2e/security/rate-limit.spec.ts` | §6.2 | Not Implemented |
| `tests/e2e/security/secret-leak.spec.ts` | §6.9, SEC-005 (line 3108) | Not Implemented |
| `tests/e2e/ai/redteam-*.spec.ts` (5 files, see `AI_CURATOR_GOVERNANCE.md` §7) | Standard §7 line 204 | Not Implemented |

Status of the whole table: **Contract — unimplemented.** No test has ever executed; `pnpm test`,
`pnpm lint`, `pnpm typecheck` and `pnpm build` have not been run (no `node_modules`, B-01).

---

## 4. The CMS boundary as a security control

G.7 (lines 3785–3794) is the normative list: "The following are NOT ordinary CMS capabilities and MUST NOT be
exposed as editable Owner UI fields". ADM-004 (line 3100) makes it an acceptance gate: "CMS does not expose
arbitrary SQL, source code, or infrastructure secrets". §23 invariant 14 (line 3303) makes it an invariant.
Standard §15 line 333 states it as a prohibition. Counterweight, so the boundary is not read as obstruction:
G.7 line 3769 and §15 line 2130 require the Owner to do all ordinary museum work **without editing source
code**, through "explicit forms, safe structured configuration, preview, validation, confirmation, audit
logging, and rollback" (line 3783).

| # | Capability the Control Center must never expose | Verbatim source | Mechanism intended to enforce it | Status | Planned verification |
|---|---|---|---|---|---|
| C-01 | Arbitrary source-code or executable editing | G.7 line 3787 | Payload field-level access control: no collection field accepts code; Lexical rich text only (ADR-016), no arbitrary HTML/script (Standard §2.2 line 52); ESLint blocks `eval` (`eslint.config.mjs` lines 37–42) | Contract — unimplemented | AST/API test attempting to persist executable content |
| C-02 | Shell / OS command execution | G.7 line 3788; Standard §15 line 333 | No child-process API reachable from any handler; Payload hooks are code-defined, never UI-defined; deployment runs the app, not the CMS | Contract — unimplemented | negative API test: command string in every text field, assert no side effect + no `child_process` import in `src/` |
| C-03 | Arbitrary SQL, DB console, schema mutation, superuser credentials | G.7 line 3789; Standard §15 line 333; §16.16 line 2624; §17.2A line 2696 | Only `@payloadcms/db-postgres`/Drizzle reach (ADR-002); parameterized operations (Standard §5 line 169); `DATABASE_URI` = `ndm_runtime`, `DATABASE_URI_MIGRATION` kept separate (`.env.example` lines 35–36); no superuser connection string in app env (`docker-compose.yml` header comment) | Contract — unimplemented | SQLi suite; assert `pg_read_file`/DDL via app role fails at the DB, not only in the UI |
| C-04 | Editing `.env`, secrets, signing keys, encryption keys, provider tokens, raw storage credentials | G.7 line 3790; §16.16 line 2624; Standard §5 line 180; G.11.3 line 3905 | `.env` git-ignored (`.gitignore` lines 10–15); ESLint blocks non-`NEXT_PUBLIC_*` env reads in client scope (`eslint.config.mjs` lines 54–62) — **authored, unexecuted**; secret fields rendered masked only | Contract — unimplemented | secret-scan over build output, source maps, rendered admin HTML and logs (SEC-005, line 3108) |
| C-05 | Docker daemon, host OS, cloud account, network, firewall, DNS, infrastructure administration | G.7 line 3791; §16.16 line 2624 | `docker-compose.yml` is declared "LOCAL DEVELOPMENT INFRASTRUCTURE ONLY … never a production deployment definition" (its own header lines 3–8) — **authored, unexecuted**; no infra API in the app; ops lives outside the CMS | Contract — unimplemented | route-inventory review: no `/control-center/**` handler touches infra providers |
| C-06 | Unrestricted file-system browsing or arbitrary server-side file deletion | G.7 line 3792 | Object storage only, via private bucket (`S3_BUCKET_PRIVATE`, `.env.example` line 43); originals preserved (Standard §6 line 192; §16.8 line 2504); path traversal tests (Standard §5 line 173) | Contract — unimplemented | traversal suite + assert no `fs` write path from handlers |
| C-07 | Destructive DB commands / casual permanent deletion | G.7 line 3792; Standard §15; §16.20 line 2672; §18.8 line 2844; §17.4 line 2787 ("Protected Owner process"); Standard §3.3 line 115 (no cascading deletes of claims/evidence/rights/audit/revisions) | Archive/soft-delete default; dependency-impact review before deletion (§16.8 line 2506); no cascade of artifacts/stories/sources/media on collection or page-section removal (line 2844) | Contract — unimplemented | DAT-002 (line 3080) cascade test; deletion-permission negative test |
| C-08 | Ability to disable authorization, security logging, evidence requirements, privacy safeguards, or audit integrity | G.7 line 3793; Standard §4.2; §23 invariant 15 (line 3304) | These five are *not representable as settings fields at all*: no boolean exists to switch off access control or audit writing; audit writes are inline with the operation, not configurable. The DB-level half of the audit-integrity guarantee is now specified as grants + guard trigger + forced RLS (ADR-019); it is authored, not yet executed. **See §2.4 finding 2 for status.** | Contract — unimplemented | assert no settings key disables access control / audit; assert audit row written on every privileged action; `pnpm db:verify-privileges` in the deploy pipeline |
| C-09 | Direct deployment/release execution through the public CMS | G.7 line 3794; Standard §12 line 281; §15 line 335 | Release is a controlled pipeline step; "Do not deploy production without explicit Owner authorization" (Standard §12 line 281) | Contract — unimplemented | no deploy endpoint exists (grep gate in CI) |
| C-10 | Break-glass inside the museum interface | G.7 line 3796 | Emergency technical break-glass "belong[s] to a separately secured infrastructure process with independent authentication and audit, not the museum content interface" | Contract — unimplemented; procedure not authored | documented runbook + independent auth path |

---

## 5. Database roles (ADR-005, Standard §3.2, `scripts/db/init-roles.sh`)

Standard §3.2 (lines 99–106) requires four separate roles and states: "The runtime role must not be a database
superuser and must not have unnecessary DDL privileges. Migration credentials must not be present in browser
bundles or the CMS settings UI. Backup credentials must be isolated from normal application credentials."
ADR-005 records the four-role decision; **ADR-019 refines what the runtime role may do to data.**
`scripts/db/init-roles.sh` is the authored bootstrap, now accompanied by `scripts/db/harden-append-only.sh`
(apply the per-table append-only exception), `scripts/db/verify-privileges.sh` (assert the resulting grant
state, non-zero exit on violation) and `scripts/db/run-privilege-tests.sh` (behavioural evidence).
**Status of all four: executed against a live PostgreSQL 18.6 server on 1 November 2026, inside the harness's
throwaway container — and never yet against this project's own database, which does not exist.** The harness
mounts `scripts/db` read-only, runs `init-roles.sh` as an entrypoint script *and* re-runs it to prove
idempotency, applies `harden-append-only.sh`, and calls `verify-privileges.sh` three times (clean, tampered,
remediated); the transcript is `docs/A5_PRIVILEGE_EVIDENCE.txt`, exit 0. That is why the relations under test are
described as *representative* — created by the harness the way a migration will create them, not by
`pnpm migrate`. Before this batch this line read "never executed against a server", and the 31 October blocker
sequence it recorded (engine reachable in the morning pass — `preflight.mjs` reported
`PASS | Docker | server reachable; compose 5.3.1`, then `500 Internal Server Error` on `/containers/create`,
then timeouts) is now history: `preflight.mjs` reports `PASS | Docker | server reachable; compose: 5.6.1`.
That sequence, and the Owner actions it appeared to require, were recorded as **B-09** in
`docs/ARCHITECTURE_DECISIONS.md` §7.2. **B-09 has since cleared by observation** — on
1 November 2026 `docker info` exits 0 (server 29.9.2) and the harness that it blocked ran with exit 0 — while
`wsl -l -v` *still* reports the `docker-desktop` distribution as Stopped, which is why that listing is no longer
cited as a daemon test (`docs/TEST_AND_RELEASE_REPORT.md` §0). `.env` still does not exist by agreement — its
password variables are deliberately empty and creating credentials is out of scope. `docker compose config`
confirms both halves of the consequence rather than asserting one: rc=1 naming `required variable … is missing a
value: set in .env` for all seven secrets when they are unset, and **rc=0** rendering the whole stack when they are
supplied as process-environment placeholders — so the definition is valid and the role design has a working place
to be applied once B-03 clears.

| Role | Purpose | Privileges as authored in `init-roles.sh` | Never present in | Status |
|---|---|---|---|---|
| `ndm_migration` | DDL, schema owner, `pnpm migrate:create` / `pnpm migrate` | `LOGIN`; owns `public` schema (`ALTER SCHEMA public OWNER TO ndm_migration`) | browser bundle, Control Center UI, telemetry, logs | Contract — unimplemented |
| `ndm_runtime` | the running application and Payload | `LOGIN`; `SELECT, INSERT, UPDATE, DELETE` on ordinary + default tables; `USAGE, SELECT` on sequences; **`SELECT, INSERT` only on the declared append-only relations** (`UPDATE`/`DELETE`/`TRUNCATE` revoked by `harden-append-only.sh`, guard trigger + forced RLS deny policies behind it); **no `CREATE`, no DDL, not superuser, no `BYPASSRLS`** | migration path | Contract — unimplemented in this project; **§2.4 finding 2 closed by ADR-019: implementation authored and its grant design demonstrated in a disposable container (1 November 2026, exit 0, 10 refusals for authorization reasons)** |
| `ndm_reporting` | read-only reporting/analytics/audit queries | `LOGIN`; `SELECT` only, all + default tables | any write path | Contract — unimplemented |
| `ndm_backup` | `pg_basebackup` / WAL / PITR | `LOGIN REPLICATION`; `CONNECT` on database; **no DML, no DDL** | application env, Control Center | Contract — unimplemented |
| bootstrap superuser | one-time init only | container `POSTGRES_USER`, used only to run `init-roles.sh` once | the application, ever (`docker-compose.yml` lines 15–16) | Contract — unimplemented |

Credential hygiene, verified against the authored files rather than asserted: `.env.example` declares a
distinct password variable per role (lines 22–30) and separate URIs for runtime and migration (lines 35–36);
`.gitignore` ignores `.env`, `.env.*`, `*.pem`, `*.key`, `secrets/` and force-keeps only `.env.example`
(lines 10–15); `tests/setup/env.ts` injects inert values so no test can reach a real credential or provider,
and refuses integration unless `NDM_ALLOW_INTEGRATION=1` targets `noujoude_test`. **None of this has executed.**
One unresolved wiring question is recorded here rather than answered: `DATABASE_URI_MIGRATION` is not a
variable the Payload CLI reads by itself, so routing `payload migrate` through `ndm_migration` requires an
explicit configuration decision in Phase 2 — an ADR-005 feasibility item, not a satisfied control.

### 5.4 Row-Level Security — the warning the Standard makes explicit

Standard §4.2 line 155, verbatim: *"Row-Level Security may be used as defense in depth when compatible with
Payload's connection and migration model. It must be tested with the actual runtime database role; never
assume an RLS policy is effective if the runtime role bypasses it."* ADR-005 repeats it. Consequences adopted
as required rules:

1. RLS, if adopted, is **defense in depth only**. Payload access control (§4.2 line 145) stays the primary
   authority; RLS is never the sole enforcement of A-01…A-04.
2. RLS must be exercised **as `ndm_runtime`**, because `ndm_runtime` is neither superuser nor
   `BYPASSRLS` per `init-roles.sh` — that is precisely the condition under which a policy *can* bind, and it
   must be measured, not assumed.
3. A test executed as the bootstrap superuser or `ndm_migration` proves nothing and is **invalid evidence**
   for an RLS claim.
4. `ALTER DEFAULT PRIVILEGES` grants future tables to `ndm_runtime` automatically, so a new table can be
   reachable without a policy. Required guard: `src/lib/access/rls-runtime-role.integration.ts` must enumerate
   every relation in `information_schema` and assert policy coverage as `ndm_runtime`, failing on any
   unprotected table.
5. Payload's migration model must be confirmed compatible with policies attached to tables Payload owns;
   incompatibility is a Standard §4.2 condition ("when compatible"), so a measured failure is a recorded
   decision, not a silent skip.

Status: RLS is **not adopted** in Phase 1/2; the rule above is the contract for when it is.

---

## 6. Application and API security controls (Standard §5, lines 163–180)

"Minimum controls include" (line 165) is a floor, not a target; the target is the ASVS review in §7.

**Measured 2 November 2026, in the SR-03 and SR-05 batch:** two rows — **6.1** and **6.8** — left "Contract —
unimplemented" and are now **Partially implemented**, each with a shipped mechanism and a live capture behind it
(§16.3's sixth reading; transcripts `live-capture-sr03-sr05.txt`, `live-capture-globalerr.txt`,
`live-capture-final.txt`, `live-capture-final-dups.txt` and `live-capture-browser.txt` in the evidence bundle
recorded at `docs/IMPLEMENTATION_PLAN.md` Level B). Every other row in this table remains **Contract —
unimplemented**, and neither moved row may be read as *verified for production*: the class of the evidence is
`host`, the `local-container` half of SV-20 is still unrun, and the Control Center matcher named in 6.1 cannot
exist while Phase 6 does not.

| # | Control | Verbatim requirement | Enforcement plan | Status |
|---|---|---|---|---|
| 6.1 | CSP + security headers | "Strict Content Security Policy and security headers configured for production" (line 171) | response headers at the edge/app for public *and* `/control-center`; admin UI compatibility with a strict policy must be measured, not assumed. **Mechanism shipped 2 November 2026 (SR-03):** one `/:path*` matcher in `next.config.mjs` `headers()`, built in a single function so the test and the response cannot diverge — CSP with `default-src`, `img-src`, `font-src`, `connect-src`, `worker-src`, `base-uri` and `form-action` on `'self'`, `object-src`, `frame-src` and `frame-ancestors` on `'none'`; plus `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, `Referrer-Policy no-referrer`, a `Permissions-Policy` closing camera, microphone, geolocation, payment, usb, clipboard-read, clipboard-write, interest-cohort and browsing-topics, `Cross-Origin-Resource-Policy` and `Cross-Origin-Opener-Policy` at `same-origin`, `X-DNS-Prefetch-Control off`, `Origin-Agent-Cluster ?1`. Two concessions are recorded rather than hidden: `'unsafe-inline'` in `script-src` and `style-src` (the App Router inlines its flight data and CSS Modules land inline in development, so a policy without them produces a blank page — per-response nonces are the open item that would retire it), and a development-only `script-src` that alone adds `'unsafe-eval'` for the dev tooling. No `report-to` or `report-uri` is emitted, because there is no collector (that belongs to SR-23). Enforced by `src/domain/response-headers.test.ts` (14 assertions) which imports the shipped `headers()` through the module loader, and red-checked by deleting the matcher | Partially implemented — mechanism shipped, 14 assertions green at `host`, and the header set captured live from a production build (§16.3). The Control Center matcher, the nonce path that would drop `'unsafe-inline'`, and any `local-container`-or-higher reading remain unmeasured |
| 6.2 | HSTS | "HSTS once HTTPS and subdomain policy are confirmed" (line 172) | gated on a condition that is **not yet true**: no HTTPS deployment exists, `.env.example` still sets `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Ship only after confirmation; do not pre-enable. Since 2 November 2026 the absence is *enforced rather than merely omitted*: `next.config.mjs` names HSTS in its "deliberately absent" block with this precondition and RFC 6797 §7.2 (a browser may not honour the header over a plain-HTTP origin), and `src/domain/response-headers.test.ts` fails if a `Strict-Transport-Security` key ever appears in the shipped set — the live capture reads `strict-transport-security 0` on `/en`, `/ar`, the media refusal and a 404 | Contract — unimplemented by design; precondition unmet, and the absence is now pinned by a test and by a live reading rather than by a comment |
| 6.3 | CSRF | "CSRF protection where cookie-authenticated state changes are exposed" (line 170) | Cookie-authenticated Payload admin + REST writes make this live; `CSRF_ORIGIN_ALLOWLIST` exists in `.env.example` line 76 with no consumer yet | Contract — unimplemented |
| 6.4 | Input validation & output encoding | "Input validation on every untrusted boundary" (167); "Context-sensitive output encoding and safe rich-text rendering" (167) | Zod at every boundary + server-side domain validation (Standard §2.2 line 51); Lexical sanitized, no arbitrary executable HTML (§2.2 line 52, ADR-016); ESLint blocks `innerHTML` assignment (lines 44–46) — **authored, unexecuted** | Contract — unimplemented |
| 6.5 | Injection classes | "Protection against XSS, SQL injection, command injection, SSRF, open redirects, path traversal, insecure deserialization, and unsafe file processing" (173) | parameterized operations only (169); outbound fetch allowlist for SSRF incl. any AI/provider/webhook call; redirect allowlist; storage-key derivation never from user paths | Contract — unimplemented |
| 6.6 | Rate limits | "Rate limits on authentication, contact forms, search, AI, upload, and public expensive routes" (174); Master §19.3 line 2891 | five named route families. **Mechanism shipped 2 November 2026 (SR-04):** `src/lib/server/media/request-limits.ts` is a dependency-free token bucket with an O(1) least-recently-seen eviction bound, keyed on `SHA-256(per-process salt ‖ client address)` rather than on the address, because an address-keyed map would be an access log nobody approved; `src/app/api/media/[assetId]/route.ts` calls `enforce(request)` **before** it resolves the asset, so a paced caller buys none of the work the endpoint exists to do (register read, manifest lookup, file read, SHA-256). A refusal is `429` with `Retry-After`, `no-store`, `nosniff` and a zero-byte body — no `X-RateLimit-*`, because telling a hammer where the ceiling is helps the hammer. The four `RATE_LIMIT_*` variables in `.env.example` (lines 96, 101, 103, 108) are read by `rateLimitPolicyFromEnvironment` and a value outside the policy's own bounds throws rather than being coerced; an empty value is "unset", never zero. The store and this failure mode are decided by `docs/ARCHITECTURE_DECISIONS.md` **ADR-034**, which also takes item 2.9(c)'s exit and *removes* `RATE_LIMIT_REDIS_URL` from the template: this build has no Redis client (`grep -ci redis package.json` → 0) and no such service (`grep -ci redis docker-compose.yml` → 0), so declaring one was a promise nobody implemented. The refusal still stands in code — a non-empty value throws, and its value is never printed — so a deployment that carries an older `.env` forward is declined rather than silently unthrottled. `RATE_LIMIT_TRUSTED_PROXY_HOPS` exists because of a measured fact, not a guess: `node_modules/next/dist/server/base-server.js` line 601 fills `x-forwarded-for` from the socket address with `??=`, so a directly-exposed caller may type the header it is given and the hop count says which of the two situations a deployment is in | Partially implemented — one of the five named families has a limiter, because only that one is a route today (the build prints 17 routes and `/api/media/[assetId]` is the only API among them; auth, contact, search, AI and upload have no route to limit). 39 assertions in `src/lib/server/media/request-limits.test.ts` plus 8 in the route suite's SR-04 block, all green at `host`; live host-class readings in the 2 November bundle (`live-sr04-rate-limit.txt` C1–C10): declared capacity 4 granted exactly 4 then paced with a decreasing `Retry-After`, a second address was untouched, a paced client sending a matching `If-None-Match` got `429` and never `304`, an address-less request fell into the shared bucket instead of escaping the limit, and a server declared with a Redis URL answered `500` with a zero-byte body on every request while its page routes kept returning `200`. Unmeasured: the `local-container` half of SV-15, the four families that have no route, the multi-worker case (N workers means N independent allowances, stated in the module's own header), and the fact that this is a route-level guard and not middleware — an API route added later is un-paced until it calls `enforce` |
| 6.7 | Size / timeout / pagination | "Request size, body size, timeout, and pagination limits" (175) | upload body caps; DB statement timeouts; every list endpoint paginated; AI request token/turn caps | Contract — unimplemented |
| 6.8 | Safe errors | "Safe error responses without stack traces, secrets, or internal implementation details" (176) | error boundary + handler mapping; details to logs, correlation ID to client. **Mechanism shipped 2 November 2026 (SR-05):** `src/ui/render-failure.tsx` is the one band both boundaries render, and its props are `{digest, reset}` — it is *never handed a message*, so the prohibition is structural rather than a choice to hide one. `src/app/[locale]/error.tsx` catches a failure inside a locale page while the layout, navigation and measured footer keep rendering; `src/app/global-error.tsx` catches a failure inside the layout itself and rebuilds the document (`<html lang dir>`, `<title>` from `src/domain/site.ts`, the token layer) because the layout that normally supplies them is what failed. The correlation ID is Next's own `error.digest`, which is also what the server log records, so a log line and the visitor's screen refer to the same event. `src/ui/render-failure.test.tsx` (9 assertions) renders the two shipped boundaries against an error carrying an absolute repository path, the register filename and a stack frame, and asserts none of them returns; red-checked by printing `error.message` and by dropping the document title. Live: a production route that throws through the real registry answered **500** with the sentence and `Server reference 1594644146`, and the same class of throw from the layout answered with the root boundary's own document and digest `2031186396` — while the server log held the message and frames. The **locale contract costs one thing here**: a root-segment boundary has no `[locale]` segment left to read, so its document falls back to `lang="en" dir="ltr"` and an Arabic visitor sees English; stated in the file's own comment, not papered over | Partially implemented — boundaries shipped, 9 assertions green at `host`, both boundaries observed firing live against a real throw (§16.3). Unmeasured: the `local-container` half of SV-20, the Arabic copy of the band (Owner-supplied text, §6.1's no-fabrication rule bars inventing it), and any handler mapping for the API routes that do not exist yet |
| 6.9 | CORS | "CORS allowlists; never use permissive wildcards with credentialed access" (177) | explicit origin allowlist derived from `CSRF_ORIGIN_ALLOWLIST`; CI assertion that no config emits `origin: '*'` with `credentials: true` | Contract — unimplemented |
| 6.10 | Dependency & secret scanning | "Dependency audit and vulnerability response process" (178); "Dependency and secret scanning" (§12 item 8, line 275) | pnpm audit + secret scan on the lockfile and build artifacts; pinned exact versions per Standard §2.3 step 7 and `ARCHITECTURE_DECISIONS.md` §5 | Contract — unimplemented; `pnpm-lock.yaml` does not exist yet. **Split state, recorded so the easier half cannot close the row (see §13.1):** the *dependency* half is now **authored** as CI job `security-scans` running `pnpm audit --audit-level=high` and has never executed; the *secret* half is **NOT IMPLEMENTED anywhere** and is deliberately absent from `.github/workflows/ci.yml`, which declares that absence in its own header. Landing point for both halves: `docs/IMPLEMENTATION_PLAN.md` §4 work item **2.10** |
| 6.11 | Secret placement | "No secrets or privileged values in `NEXT_PUBLIC_*` variables, source maps, HTML, logs, screenshots, or client-side bundles" (180) | the **one mechanism that already exists as configuration**: `eslint.config.mjs` lines 54–62 restrict `process.env` property access to `/^(?!NEXT_PUBLIC_).*/`, with server-only overrides at lines 66–73. Cited as *authored, unexecuted* — ESLint has never run, and the override globs (`src/app/**/page.tsx`, `layout.tsx`) are broad enough to re-open the hole in a server component that is later marked `'use client'`; that specific risk needs its own test | Contract — unimplemented |
| 6.12 | Secure cookies | "Secure cookies and session handling" (179) | see §8 | Contract — unimplemented |

Also required by §19.3 (lines 2894–2904) and not covered above: safe rich-text sanitization with no arbitrary
script execution from CMS content (2896); secure uploads with type/content validation, size limits, safe
storage and scanning where available (2897); secrets masked in administrative interfaces (2898); secure
transport and headers appropriate to production (2899); dependency and vulnerability management (2900);
restricted database and infrastructure privileges (2902). All **Contract — unimplemented**.

---

## 7. OWASP ASVS 5.0.0 Level 2 — review target, mapping, and an explicit non-claim

Source: Standard §5 line 163 ("reviewed against OWASP ASVS 5.0.0, targeting Level 2 by default and adding
risk-based controls for privileged and high-impact functions") and Master Spec §19.4 line 2910, which closes
with the sentence that governs this whole section: **"This is a target, not a compliance claim."**

**No compliance claim exists in this document, is implied by it, or may be derived from it.** The project has
no application to review, no ASVS requirement IDs have been walked, no assessor has been engaged, and the
published ASVS 5.0.0 requirement numbering has not been transcribed into this repository. Column "Planned
evidence" therefore names the artifact that *must* exist before any statement could be made.

| ASVS 5.0.0 control area (by name; exact requirement IDs to be pinned against the published edition at review start — deliberately not asserted here) | Project control | Planned evidence | Status |
|---|---|---|---|
| Architecture, design and threat modeling | §1 of this document; Master §19.5 (2916–2930); Standard §2.1 boundaries | threat register with owner + review date; ADR links | Contract — unimplemented |
| Authentication | Standard §4.1: Payload-supported auth or maintained OIDC, "Do not write custom cryptographic authentication mechanisms" (132); MFA mandatory for Owner + privileged accounts (134); Argon2id with reviewed parameters if local passwords (138); rate-limited login/reset/verification (141) | SEC-001 evidence (line 3104); MFA enrolment records; parameter review note; ADR-025's negative tests — a first factor without a second must yield no session, an assertion lacking the authentication-method claim must be refused on privileged routes, IdP-side revocation must not survive the cookie/JWT window, an MFA-bypass attempt must write an `AuditEvent`, and break-glass enablement must name both approvers | Contract — unimplemented. **Mechanism decided by ADR-025** (OIDC-compatible provider enforces the factor per its own policy; Payload consumes it through `auth.strategies`; local staff passwords disabled; one audited break-glass Owner account). **Provider instance still not selected and none is claimed** — ADR-025 names self-hosted Keycloak only as a non-committed zero-cost candidate, and `.env.example` deliberately carries no identity keys (`grep -c 'OIDC' .env.example` → 0) |
| Session management | §8 of this document; Standard §4.3 (159) | cookie attribute capture from a real response; expiry/revocation/re-auth tests | Contract — unimplemented |
| Access control | §2 + §4; Standard §4.2 (145–155) | the 20 module spec files (§3), IAM-001/002/003 (3101–3103), SEC-002 (3105) | Contract — unimplemented |
| Validation, sanitization and output encoding | §6.4, §6.5; ADR-016 | Zod schemas per boundary; XSS corpus test; Lexical render snapshot tests | Contract — unimplemented |
| Cryptography | Standard §4.1 (138–139) "Never store plaintext or reversibly encrypted passwords"; Master §19.2 line 2873 data at rest/in transit | hashing parameters record; TLS configuration record | Contract — unimplemented |
| Error handling and logging | §6.8; Standard §10 (228–241) | correlation-ID behaviour test; log-redaction fixture | Contract — unimplemented |
| Data protection | §9, §11; Master §19.2 (2869–2878) | inquiry-retention policy record (blocked on Owner: §14.10 line 2045) | Contract — unimplemented; **Blocked by Owner Input** for the policy itself |
| Communications | §6.1, §6.2, §6.9 | header capture; HSTS only after HTTPS confirmed | Contract — unimplemented; precondition unmet |
| Files and media | §6.6, §6.7; Standard §6; Master §16.8 (2504–2506) | upload/security-scan suite; SEC-004 (3107) | Contract — unimplemented |
| API and web services | A-02, A-04; Master §20.3 item 8 (3044) | direct-API authorization matrix | Contract — unimplemented |
| Configuration | Standard §2.3, §5, §12; `.gitignore`, `docker-compose.yml` posture | deployment config review; CI check list §12 mapped | Contract — unimplemented |
| Dependencies | §6.10; Standard §15 (329) no canary/alpha/beta/RC without written exception | lockfile + `pnpm audit` output (both absent — install blocked by B-01) | Contract — unimplemented |
| Business logic / high-risk operations | A-05, A-06; Standard §4.3 (159) role changes, Owner changes, rights approval, publication, destructive ops, export, recovery "with appropriate confirmation and audit" | workflow tests; audit-row assertions | Contract — unimplemented |

Higher-risk components needing risk-based additions (Standard §5 line 163; Master §19.4 line 2910 "a documented
threat assessment for any higher-risk component and explicit justification for exclusions"): `/control-center`
as a whole, Module 09 AI Curator Command Center, Module 14 Users/Roles/Permissions, Module 16 System Settings,
Module 19 Audit, Module 20 Archive & Recovery, the upload pipeline, the AI retrieval layer, and the inquiry
(PII) pipeline. **None has been assessed.** G.12 line 3924 requires this mapping at release; line 3929 forbids
unresolved critical/high defects without explicit Owner risk acceptance.

---

## 8. Session and cookie controls (Standard §4.3, line 159; Master §19.3 line 2890)

Required, all **Contract — unimplemented**:

- Secure, HttpOnly, SameSite cookies; HTTPS-only in production (Standard §4.3 line 159). Production HTTPS
  does not exist, so this cannot be exercised; recording it as satisfied would be false.
- Session expiration and revocation established as *behaviour*, with tests (line 159).
- **ADR-025 adds one revocation path that this document previously did not name:** because the assertion now
  comes from an identity provider, an IdP-side revocation or de-provisioned staff account must not remain
  usable inside Payload's own cookie/JWT window. Line 159's revocation requirement and §19.3 line 2890's
  re-authentication rule therefore become a *cross-system* behaviour to test, not a local session-setting:
  the session lifetime must be bounded by, or revalidated against, the provider. Short access-token lifetimes
  plus per-privileged-route claim checks are the planned mechanism; **nothing here is measured, because no
  provider exists (B-05) and no session has ever been issued in this workspace.**
- Re-authentication for sensitive actions; §19.3 line 2890 "re-authentication for critical actions"; §17.6
  line 2807 "Critical operations must require re-authentication or additional verification where appropriate".
- Safe account recovery; §17.6 line 2806 "Account recovery and transfer must be protected against
  unauthorized takeover".
- Confirmation + audit for: role changes, Owner changes, rights approval, publication, destructive
  operations, export, recovery actions (Standard §4.3 line 159).
- Admin language independent of content language (§15.9 line 2248) must not become a session-scoped
  authorization input — see A-03.
- `PAYLOAD_SECRET` rotation invalidates sessions, as recorded in `.env.example` line 15; rotation procedure is
  **not authored**.

---

## 9. Audit events and audit integrity

**Entity, verbatim (Master §8.16, line 1356; entity also listed at line 1051 as item 20 of §8.2):**
"`AuditEvent:` event ID, timestamp, actor, action, target record, outcome, relevant before/after state where
appropriate, and security context. **Audit records are protected from ordinary editing.**" §8.2 line 1051
adds: "`AuditEvent` — an immutable or protected record of a consequential action."

**Required recorded events** (Master §16.19, lines 2649–2662): user login and access changes · permission and
role changes · artifact creation/editing · source and evidence changes · verification decisions · publication
and unpublication · archive and restore · media replacement · rights updates · AI policy/configuration changes ·
site-wide settings changes · inquiry assignment or status changes where required. Plus Standard §4.3 line 159's
destructive/export/recovery set, and §19.3 line 2901 "Audit logging for privileged and sensitive actions".

**Integrity rules:** "Ordinary users must not be able to silently edit or erase audit history. Access to
sensitive audit details is restricted" (line 2664). "Preserve audit history for consequential changes"
(§8.18 line 1391). "Do not delete historical claims, evidence, rights, audit events, or revisions through
cascading deletes without an approved retention rule" (Standard §3.3 line 115). Audit integrity may not be
disabled from the CMS (G.7 line 3793). Restoring a revision "must create a new traceable revision; it must not
erase intervening history" (§16.15 line 2608). Asset "Status transitions must be auditable" (A.11 line 3469).

**Module 01 and Module 19 exposure rule:** an overview screen must show only "trustworthy information derived
from actual system records and configured services" (§16.1 line 2261) and unavailable metrics must render as
unavailable (§16.17 line 2630) — faked audit or activity counts in an admin screen is separately prohibited by
Directive §17 line 320.

**Telemetry boundary (Standard §10, lines 228–241):** instrument request paths, DB operations, Payload hooks,
jobs, media, search, AI calls and integrations; minimum indicators include authentication failures and
suspicious access patterns (line 238) and backup success and restore-test status (line 239). Telemetry
"must avoid personal/inquiry content, credentials, tokens, and unnecessary sensitive identifiers" and
"Define retention, access, and alert routing before production" (line 241). **No OTLP endpoint is configured
(`OTEL_EXPORTER_OTLP_ENDPOINT=` empty), so no signal has ever been emitted; retention, access and alert
routing are undefined.** Status: Contract — unimplemented.

---

## 10. Media and object-storage security (Standard §6, lines 183–193)

Detail of the asset *governance* side is `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md`; this section states the
security controls. All **Contract — unimplemented** as written on 31 October 2026, and that sentence is now a dated
reading: re-measured 4 November 2026, **M-04 is implemented** (magic-byte sniffing in `scripts/lib/image-signature.mjs`,
used by the audit and by the derivative builder, with `NDM-AST-041` held out as the proven contradiction), **M-06 is
implemented** (`sharp` 0.35.5 / libvips 8.18.7 installed and run; 45 derivatives produced), and **M-10 is partly
implemented** (`media-derivatives/lineage.json` records original→derivative with a sha256 per render; the 10 broken
links below are still broken). M-01, M-02, M-03, M-05, M-07, M-08, M-09 and M-11 remain **Contract — unimplemented**,
and none of the three that moved is verified in a production environment — §2's line-6 rule still caps every row here.

| # | Control | Verbatim requirement (Standard §6) | Plan / note |
|---|---|---|---|
| M-01 | Private originals by default | "Keep original collection photography and documentary files private by default **until rights and publication approval are recorded**" (184) | The 31 October reading — **no asset in this workspace currently satisfies the condition**, 82/82 `Not Approved`, 72/82 rights `UNKNOWN` (`ASSET_INVENTORY_AUDIT.csv`) — is kept as history. Re-measured 4 November 2026: the condition the control names is now **recorded** on 82/82 (`Owner-Declared Owned…` / `Approved — Owner mandate 2026-11-04…`), so this control no longer rests on an empty cell to keep originals private. That is the sharper result, not the safer one: **the control itself is still unimplemented.** `S3_BUCKET_PRIVATE=noujoude-originals` is declared at `.env.example` line 43 with no bucket, no provider and no policy existing (OID-19), and the 82 originals sit in `Noujoude.photo/` as ordinary files on this host. The only boundary that actually stops an original byte today is the serving gate: `src/lib/server/media/serving.ts` answers with derivative renders and has no path to an original at all |
| M-02 | Separate policies for public derivatives vs restricted originals | "Use separate logical policies for public derivative assets and restricted originals" (185) | two buckets declared (`noujoude-originals` / `noujoude-derivatives`, `.env.example` 43–44) — **declaration only; nothing provisioned** |
| M-03 | Short-lived signed URLs | "Use short-lived signed URLs for private assets" (186) | TTL is a decision that must be recorded and tested; `.env.example` lines 39–40 state the rule; no expiry value chosen |
| M-04 | Content validation | "Validate MIME type, magic bytes, extension, file size, dimensions, and allowed formats" (187) | the Phase 0 audit proves why extension is not evidence: `NDM-AST-041 vintage_collector_desk_16x9.jpg` has a `.jpg` name but its container is `RIFF….WEBP` (magic bytes read directly during preparation of this document; `ASSET_INVENTORY_AUDIT.csv` row 42: MIME `image/webp`, 512×290, `WRONG_FORMAT`) |
| M-05 | Malware scanning | "Scan uploaded files for malware where the selected infrastructure supports it" (188) | Master §11.8 (line 1603) makes `Security Scan` a pipeline stage and §16.8 (2504) says "scan where tooling supports it"; **no scanner is selected** — a capability-dependent control that must not be reported as unconditional |
| M-06 | Re-encode derivatives | "Re-encode web-display derivatives; **never treat an extension change as sanitization**" (189) | `sharp` is the approved processor (Standard §2.2 line 53, `ARCHITECTURE_DECISIONS.md` §5) — **installed and running as of 4 November 2026**: `sharp` 0.35.5 over libvips 8.18.7, `node_modules/sharp/package.json` read directly, driving `scripts/build-media-derivatives.mjs` to **45** renders under `media-derivatives/` (2,422,790 bytes, largest 165,426). The 31 October pair — *not installed*, and `Original (no derivatives produced)` on 72 of 82 — is kept as that date's reading, and the surviving half of it is real: **37** rows still produce nothing, 36 because the publication register names no entry for them and 1 because of M-04's `WRONG_FORMAT` defect on `NDM-AST-041`. The sanitization rule is honoured by construction rather than by wording: the builder re-encodes through libvips from sniffed container bytes and records the resulting digest, so an extension never decides anything — and the profile is a recorded decision (ADR-038), not an ad-hoc call |
| M-07 | Script/SVG payloads | "Prevent SVG/script payloads and unsafe document previews from executing in the application origin" (190) | reject unsafe formats (§16.8 line 2504); never preview uploaded documents in the app origin; served from a distinct origin/policy where feasible |
| M-08 | Credentials server-side | "Keep object storage credentials server-side" (191) | Standard §5 line 180 + ESLint client env rule (§6.11) + G.7 line 3790; `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` are non-`NEXT_PUBLIC_*` by construction (`.env.example` 45–46) |
| M-09 | Versioning + protected deletion | "Enable versioning and protected deletion for original assets" (192) | also §16.8 line 2506 and §18.8 line 2844; **not provisioned**; note that "protected deletion" for the 10 AI-generated derivatives is already compromised by lost source PNGs (see M-10) |
| M-10 | Lineage + checksums | "Record original/derivative lineage, checksums, rights, and usage links" (193); §8.14 `source_asset_id` (line 1318); §8.18 line 1386 "Keep the original media file separate from derivatives" | **Partly implemented as of 4 November 2026, and still broken where it was broken.** Implemented: `media-derivatives/lineage.json` carries one row per produced render with `assetId`, `originalFilename`, `originalSha256`, `sha256`, dimensions, bytes, mime and profile (45 rows); `src/lib/server/media/derivative-store.ts` parses and validates it row by row and rejects any `file` value that would resolve outside `media-derivatives`; and `src/lib/server/media/serving.ts` refuses a byte whose sha256 differs from the recorded row — so the lineage record is load-bearing at the boundary, not a log beside it. **What is not bound:** the clearance ledger never reads `lineage.json` (`grep -n 'lineage' scripts/build-clearance-ledger.mjs` → **0 matches**; it binds the *publication register* by digest and the *profile set* by path and id only), `scripts/preflight.mjs` never reads it either (**0 matches**), and there is no `--check` mode that re-verifies the 45 stored bytes against their recorded digests without a rebuild. So a tampered lineage file would be caught at the serving boundary, where the digest is compared before any byte leaves, and by the 27-assertion derivative gate — but not by the ledger or by preflight. That asymmetry is recorded rather than smoothed over. Still broken: **10/82** original→derivative links, because `_manifest.json` names source PNGs (e.g. `world_morocco_hero_16x9_1793387944337_307329d3.png`) that are absent from the workspace (**RB-05**) — re-verified 4 November 2026 against both the quarantine folder and the library root, 10 of 10 absent |
| M-11 | No public access to restricted artifacts | Standard §15 line 332; STT-002 line 3086 "Unclear/restricted media cannot be publicly served for unauthorized use" | enforced at the serving layer, not by UI hiding |

---

## 11. Backup, recovery and service objectives — **proposed engineering targets, not provider claims**

Standard §11 opens: "These are proposed engineering targets, not a claim that a hosting vendor already meets
them" (line 245). Master G.11 line 3883 adds: "They are engineering acceptance targets, not public contractual
SLAs. The selected hosting/storage providers and cost plan must demonstrate that they can meet them **before**
production approval. If a provider cannot meet them, the gap must be explicitly presented to the Owner; the
target must not be silently downgraded." Standard §15 line 336 makes silent downgrade a prohibition.

| Data class | Target RPO | Target RTO | Source | Required protection (Master G.11.2 lines 3895–3897) | Status |
|---|---:|---:|---|---|---|
| PostgreSQL primary data | ≤ 1 hour | ≤ 4 hours | Standard §11 line 249; G.11.2 line 3895 | encrypted backups, PITR/WAL or provider-equivalent, isolated backup credentials, restore runbook | Contract — unimplemented; **no provider selected, so feasibility is unknown** |
| Original media + critical object storage / metadata | ≤ 4 hours | ≤ 8 hours | line 250; G.11.2 line 3896 | bucket versioning, protected deletion, replication or independent backup copy | Contract — unimplemented |
| Application config + deployment artifacts | ≤ 24 hours | ≤ 4 hours | line 251; G.11.2 line 3897 | version-controlled configuration **without secrets**, reproducible build, protected deployment | Contract — unimplemented |

Policy requirements (Standard §11 lines 255–260; G.11.3 lines 3901–3908): daily encrypted DB backup plus
WAL/PITR to meet the 1-hour RPO; **35 daily, 12 weekly, 12 monthly** recovery points (mirrored as
`BACKUP_RETENTION_DAILY=35`, `WEEKLY=12`, `MONTHLY=12` in `.env.example` lines 80–82 — declared, not
provisioned); object versioning and protected deletion with independent recoverable copies of critical
originals; **isolated backup identities and credentials** (`ndm_backup`, §5; "Backups must be isolated from
ordinary CMS credentials and production application write permissions", line 3904); backup keys and
credentials never exposed in the Control Center (3905); **restore tests quarterly and before major
database/storage migrations** (3906); each restore test records date, dataset, measured RPO/RTO, integrity
checks, failures, corrective actions and reviewer (3907).

Two sentences that decide how this section may be reported:
- G.11.3 line 3908: **"A backup job reporting success is not proof of recoverability; only a tested restore is
  acceptable evidence."** §19.10 line 2987 repeats it. Therefore *no restore test has been performed and no
  backup exists*, and nothing here may be described as "backups are tested".
- Standard §11 line 262 / G.11.1 lines 3887–3888: monthly availability objective **99.5%** for the public
  museum and the same basis for the Control Center, "subject to the actual provider/support plan and formal
  Owner acceptance". **No SLA may be published from an internal objective** (line 262), and §19.10 line 2991
  forbids inferring numerical commitments from the design. Availability objective status: **Contract —
  unimplemented; no measurement, no provider, no Owner acceptance.** OPS-002 (line 3114) acceptance requires
  "Backup configuration is verified and restore test succeeds" — both absent.

Graceful degradation (G.11.4 line 3912; §19.10 line 2987): failure of AI, analytics, search enhancement,
external media optimization or notifications must not disable core published pages. Contract — unimplemented.

---

## 12. Accessibility and performance — release **gates to be met**, not met

**WCAG 2.2 Level AA** — Standard §8 line 210 ("Target WCAG 2.2 Level AA for public and administrative
experiences"), Master §19.8 line 2957 ("subject to an accessibility audit of the implemented experience"),
G.12 line 3922. Required test scope (Standard §8 line 212): semantic structure, keyboard access, focus
visibility, form labels, error announcements, contrast, target sizes, modal behaviour, image viewer controls,
reduced motion, screen-reader navigation, RTL/LTR behaviour; "Automated axe checks are required in CI for key
pages, followed by manual testing of key visitor and admin flows". §19.8 (2961–2973) enumerates the
requirements, including meaningful alt text with decorative images treated as decorative, no information
conveyed by colour alone, reduced-motion support, captions/transcripts if meaningful audio/video is
introduced, RTL and LTR testing, and accessible admin tables/forms/validation.

Recorded against the physical audit rather than asserted: **alt text status is `Not Recorded` for 82 of 82
assets** (`ASSET_INVENTORY_AUDIT.csv`), and §8.14 (line 1311) makes `alt_text_en` / `alt_text_ar` *required
for meaningful public images*. Automated axe checks have never run: `axe-core` is a declared devDependency
that is not installed. **No claim of WCAG AA attainment exists or may be made.** NFR-002 (line 3111) requires
"WCAG 2.2 AA audit has no unresolved release-blocking issue" — there is no audit.

**Re-measured 4 November 2026; two of those four sentences moved and the fourth did not.** Alt text is no
longer absent: `Alt Text Status` reads `Recorded — EN and AR` on **82 of 82**, backed by
`docs/asset-governance/descriptive-labels.json` (82 rows, `unlabelled.count` **0**, **21** flagged decorative),
and `src/lib/media/slot.ts` refuses to draw a labelled-less image, so the field gates pixels rather than
decorating a row. `axe-core` 4.10.2 is now **installed** (`node_modules/axe-core` present, declared at
`package.json` line 76) — which is a different problem from the one this paragraph recorded: it is installed and
**wired to nothing**, since `grep -rn 'axe'` over `src/`, `scripts/` and `tests/` finds only the words `axes` and
`relaxes`, `playwright.config.ts` line 12 points at `./tests/e2e`, and that directory **does not exist**, so a
Playwright run today answers *no tests found* — which Directive §17 and the standing rule both refuse to treat as a
pass. **The WCAG sentence stands unchanged: no audit has ever run, no AA attainment is claimed, and none may be
asserted from governed alt text.** §8.14's two `Localized text` *columns* still have no `media_asset` record to
live in, and captions remain unwritten for the curatorial reason **RB-03** gives.

**Core Web Vitals at p75** — Standard §9 lines 216–221; Master §19.6 lines 2934–2941:

| Metric | Gate | Status |
|---|---|---|
| LCP | ≤ 2.5 s | Contract — unimplemented; §19.6 line 2942: "These are performance targets, not measured current results" |
| INP | ≤ 200 ms | Contract — unimplemented |
| CLS | ≤ 0.1 | Contract — unimplemented |

Required coverage (Standard §9 line 222): Home, The Museum, Country World, Collection, Artifact Detail,
Story, Search, and Control Center critical routes — none of these routes exists. Techniques required by
Standard §9 line 224 and §19.7 lines 2946–2954 (responsive images, reserved dimensions, controlled preload of
the primary hero, lazy loading below the fold, caching with clear invalidation, no unnecessary client
JavaScript, focal-point/crop metadata) collide with a measured asset-library fact: 18 of 82 assets declare
their pixel size in the filename and are wrong (see `MEDIA_AND_RIGHTS_GOVERNANCE.md` §6), so dimensions cannot
be trusted from filenames and must be read from the decoded file. §19.7 line 2952 additionally forbids
optimization that corrupts "meaningful inscriptions or material features". NFR-001 (line 3110) requires either
met targets or a documented exception: **neither exists.**

---

## 13. CI/release gates this document depends on (Standard §12, lines 266–281)

Required checks: 1 formatting and lint · 2 strict TypeScript typecheck (`tsconfig.json` `strict`) · 3 unit
tests for domain and validation logic · 4 integration tests for database, CMS hooks, **access control**, jobs
and storage adapters · 5 Playwright E2E for key public/admin routes in both locales · 6 accessibility
automation plus manual audit records · 7 security checks mapped to ASVS controls and **negative authorization
tests** · 8 dependency and secret scanning · 9 production build · 10 database migration verification **and
restore test** · 11 SEO route and metadata checks · 12 performance measurements and regression checks.

**Status: none of the twelve has ever been executed in this repository.** Directive §15 line 292 requires
"Every completed module must pass its own acceptance tests and negative-permission tests" after every
important change. Standard §12 line 281: "Do not deploy production without explicit Owner authorization. Do
not use mock functionality as release evidence." Standard §15 line 335 repeats the deployment prohibition.
Master §23 invariant 17 (line 3306): "A documented feature never counts as implemented without evidence."

### 13.1 The CI definition now exists; the twelve checks still do not

Added in the gap-closure batch, because the state changed in a way that is easy to over-read.

`.github/workflows/ci.yml` **now exists** — 416 lines, 45 step items (37 named + 8 bare action steps), four jobs
(`docs-gates`, `quality`, `db-privileges`, `security-scans`), and a header that reads `STATUS: **AUTHORED. NEVER
EXECUTED.**`. It expresses the twelve checks above as pipeline steps. It enforces nothing, for four concrete reasons:

1. It has **never run**. There is no run transcript anywhere, and no green tick exists to point at.
2. It has **never been validated by a YAML conformance parser**. None exists on this host — measured, not assumed
   (python, python3, `perl -MYAML`, `perl -MYAML::Tiny`, ruby and PowerShell `ConvertFrom-Yaml` all fail). What was
   substituted on 1 November 2026 is `scripts/verify-workflow-structure.mjs`: ten structural rules that prove the
   file parses as block YAML and that its jobs, steps, script paths, `pnpm` names and gate list are internally
   consistent (hole H-11). That closes most of the risk a parse error would carry, and it is **not** the same thing
   as GitHub's parser accepting the file.
3. There **is a repository now, and the pipeline still has never run.** What this line recorded — no repository for
   the workflow to live in — was cleared on 1 November 2026 under OD-4 (`git init`, commit `aedeee0`). But
   `git remote -v` prints nothing, so no hosted Actions service can pick the file up: the honest state is authored,
   structurally checked, **zero runs** (blocker B-08).
4. Its `quality` job **will fail**, and 1 November 2026 measured *why*, because OD-1 and OD-2 have since cleared:
   `pnpm lint` exits **2** (`eslint.config.mjs` imports `@eslint/js`, which no manifest declares) and
   `pnpm format:check` exits **1**. This is now a *known* failure rather than a predicted one, and it must still be
   recorded as a failure, not suppressed.

There is a fifth trap, and it is about how a reviewer *runs* the checks rather than what the file contains. It was
real, and it is now closed. In this workspace `pnpm run <script>` used to perform a dependency install before it
executed the script, because `node_modules` was absent and pnpm's built-in `verify-deps-before-run` default is
`install` — measured on 1 November 2026, when `pnpm run audit:workflow` resolved 669 packages against the public
registry instead of checking this repository. No project-scoped setting prevents it (`verify-deps-before-run` is read
only from the global pnpm config), so `.npmrc` intentionally set nothing, `scripts/preflight.mjs` check 10 reported
whether the trap was still armed, and `docs/TEST_AND_RELEASE_REPORT.md` §9 printed `node scripts/<name>.mjs` for every
read-only gate. Recorded as hole **H-12**, blocker **B-10**, Owner decision **OD-7**. **OD-7 executed the same day:**
pnpm 11.21.0's real global config file on this host — `C:\Users\NaDa\AppData\Local\pnpm\config\config.yaml`, not
`~/.npmrc`, which does not exist here — now carries `verifyDepsBeforeRun: error`, applied with the minimum change and
the pre-existing keys preserved, and the behaviour was verified rather than assumed: `pnpm run audit:workflow` exits 0
with no `Progress:` line anywhere, and preflight check 10 prints `PASS | pnpm run deps-before-run` alongside
`global setting: error`. The workaround of invoking `node scripts/<name>.mjs` directly is still what §9 documents,
because a check should not depend on a machine-level setting being right — but the trap is no longer armed, and a
future out-of-sync tree now *refuses* instead of silently installing. The CI file was never exposed to it:
`docs-gates` calls `node scripts/…` directly and was verified to contain no `pnpm` invocation, while the other three
jobs install explicitly first.

Two things the pipeline does contain that matter to this document. Job `db-privileges` runs
`scripts/db/run-privilege-tests.sh` **unconditionally** and uploads its output as an artifact, then — behind a
step that tests for `src/payload/payload.config.ts` — runs `pnpm db:up`, `pnpm migrate`, **`pnpm db:harden`** and
**`pnpm db:verify-privileges`**, with `pnpm db:down` under an always-run condition. Those two named steps are the
compensating control for ADR-019's residual risk, that the table owner `ndm_migration` can drop the audit guard
trigger. **Because the workflow has never executed, that compensating control is authored and not enforced, and
the residual risk stands open.** It must not be described as mitigated.

Job `security-scans` runs `pnpm audit --audit-level=high` and carries a NOTICE that secret scanning is **not
implemented**. The absence is declared rather than omitted so that check 8 cannot be quietly upgraded when the
dependency half goes green.

**The vulnerability-response process required by Standard §5 line 178 is still not written.** Scanning is a
detector; line 178 asks for a *process*. What must exist and does not: who triages a reported advisory, within
what window, what severity blocks a release, what the exception path is when a fix does not exist, and where the
decision is recorded. Phase 2 work item **2.10** owns it, and its acceptance evidence requires a **seeded
false-positive test** proving the secret scanner actually fails a build — an untested scanner is an unverified
control, and a step in a YAML file is not behaviour.

---

## 14. Owner inputs this document must not fabricate (Standard §13, lines 296–305)

Not decided here, and not inferable: institutional legal identity and jurisdiction · actual founder story and
attributions · real artifact inventory and factual data · ownership, provenance and authenticity evidence ·
image/document rights and licenses · official contact details · approval of operational costs, providers and
formal service commitments. Two of these gate controls above: the hosting/storage provider (§11) and the
conversation-data policy (§14.10 line 2045, referenced in `AI_CURATOR_GOVERNANCE.md`). Standard §13 line 306:
"Implement the required workflows and placeholders; keep unapproved facts out of public output."

## 15. Non-negotiable prohibitions restated as binding on this document (Standard §15, lines 327–336)

No Prisma alongside Payload's Drizzle-backed adapter (ADR-002) · no dual competing migration systems · no
canary/alpha/beta/RC dependencies in production without written exception (`ARCHITECTURE_DECISIONS.md` §3.1
records the rejected pre-releases) · no plaintext passwords or homemade crypto · no frontend-only
authorization · no public access to private originals or restricted artifacts · no raw SQL, shell, secret or
infrastructure controls through the ordinary CMS UI · **no invented metrics, security compliance, or backup
success claims** · no deployment to production without Owner authorization · no silent downgrade of RPO/RTO,
accessibility, performance, or security requirements.

*End of NDM-SEC-001. Every control above is a contract. Verification is pending; nothing here is evidence of a
running system. Verification of the controls in sections 4 to 13 is scheduled in the appended §16 below, whose
closing paragraph carries that plan's own non-claim; every §16 case is scheduled pending and none is marked
Passed.*

---

## 16. Verification plan — how each control above gets proved

Sections §0–§15 state the controls and their required tests; this section states **how each control is to be
proved**, one case at a time. It is the verification half of the contract, not new requirement text, and it
adds nothing to §§0–15. Every case is scheduled **pending**: `Master Spec §20.6 line 3159` forbids marking a gate
Passed without recorded evidence and a named approver, and this document records neither for any case below. A
case carries seven fields — an ID, the control it verifies with the section it comes from, the **environment
class** it will run in, the method (a command, a harness, or a planned test path already listed in §3), a
**numeric exit criterion**, the **phase that owns executing it**, and **what remains unproven until then**. The
plan maps §2.3's 240 matrix cells, §2.5's invariants, §4's C-01…C-10, §6's controls, §7's ASVS areas, §8's
session rules, §9's audit rules, §10's media rules, §11's recovery rules, §13's twelve CI checks, and the AI
boundary §1.3 names.

### 16.1 The environment-class ladder, which caps every claim below

Five classes, in ascending order: `disposable-harness → local-container → host → second-environment →
production`. The rule that governs this whole section — restated here in the document's own voice, first
enforced by `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` rule 8 — is that **a claim may not reach above the class of
the evidence behind it.** A `disposable-harness` result proves the design of the fixture's subject and nothing
else; a `host` result proves a detector fires against files on this machine, not that a running application
behaves; only a `production` result could support the phrase *verified as running*. The two exit-coded
measurements this repository already holds sit at the bottom two rungs: the privilege harness
(`docs/A5_PRIVILEGE_EVIDENCE.txt`) at `disposable-harness`, and the dependency audit
(`docs/DEPENDENCY_AUDIT_2026-11-02.txt`) at `host`. The rights decision spec and the client-boundary lint guard,
re-run when this section was written, are `host`-class **unit and lint** runs — they prove a pure function and a
selector behave, which the ladder caps and which prove nothing about enforcement. The rest are scheduled.

### 16.2 Verification case register

| Case | Control verified (source section) | Environment class | Method | Numeric exit criterion | Owning phase | What remains unproven until then |
|---|---|---|---|---|---|---|
| SV-01 | Database role separation and privilege matrix (see §5) | `disposable-harness` | `scripts/db/run-privilege-tests.sh` in a throwaway container, transcript `docs/A5_PRIVILEGE_EVIDENCE.txt` | 34 grant-state assertions and 14 of 14 behavioural cases A–N match, exit 0 | A.5 owns this run; Phase 2 re-runs it | It may not be cited as application authorization, a migration test, a restore, or a production claim |
| SV-02 | Same matrix on this project's own runtime identity (see §5, §5.4) | `local-container` | `pnpm db:up` then `pnpm migrate`, `pnpm db:harden`, `pnpm db:verify-privileges` | 0 grant-state deviations and 14 of 14 refusals against the real schema | Phase 2, re-checked by CI job `db-privileges` | This project's database does not exist yet, so SV-01 proves the grant design, not its application here |
| SV-03 | Deny-by-default access control per collection and global (§2.5 A-01, A-02) | `local-container` | `src/lib/access/collections.access.integration.ts`, direct REST and Local API calls | 0 collections or globals ship an open default, and every unauthorized direct-API write returns 403 | Phase 6 | Predicates and hooks are unbuilt; nothing enforces a default yet |
| SV-04 | Object-level authorization and IDOR refusal (§2.5 A-04) | `local-container` | per-module negative cross-object tests under `src/lib/access/` | 0 cross-object reads or writes succeed, and a deliberate 404-versus-403 choice recorded for each module | Phase 6 | The existence-disclosure choice is undecided and untested |
| SV-05 | The 20-module positive and negative matrix (§2.3, §2.5 A-07) | `local-container` | `tests/e2e/permissions/module-01-executive-overview.spec.ts` … `module-20-archive-recovery.spec.ts` | all 240 cells exercised, 14 of 14 negative cases return 403 per module, and 0 allowed by hiding a menu | Phase 6 | No `tests/e2e/` file exists; the matrix is derived from the requirement baseline, not from behaviour |
| SV-06 | No frontend-only authorization (§2.5 A-09, §6.11) | `host` then `local-container` | ESLint client guard plus a runtime assertion that no decision object reaches the client | 0 authorization decisions acted on in client scope, and 0 findings under the client selector | Phase 6 | A selector firing is not enforcement; see SV-10 for the gap it cannot close |
| SV-07 | CMS boundary against raw SQL, shell, secret and host-admin input (§4 C-01 to C-10) | `local-container` | negative API suite injecting SQL and command strings into every text field, plus an import scan of `src/` | 0 executable payloads persisted, 0 `child_process` import found, and SQL or DDL via the app role refused at the database not only in the UI | Phase 6 | Handlers are unbuilt; the refusal must be measured against a live route |
| SV-08 | Public-serving rights decision as pure logic (§10 M-01, M-11 and STT-002) | `host` | `vitest run src/domain/rights.test.ts` | 9 of 9 assertions pass, exit 0, and all 82 catalogued assets resolve to a refusal | Phase 2 owns the rule | It tests only the function; no storage adapter calls it, so no byte is yet refused in a response |
| SV-09 | Serving-layer enforcement of the rights gate through a real adapter (§10 M-01) | `local-container` then `production` | HTTP request for a private original and for an uncleared derivative on the deployed serving path | 0 requests for an uncleared asset ID return bytes, and every such request is refused before storage emits any object | Phase 6 | There is no bucket, adapter, or serving route; the rule is implemented but unreached |
| SV-10 | Client-boundary secret-leak guard (§6.11, §4 C-04) | `host` | `eslint` over a probe reading a non-`NEXT_PUBLIC_` variable | the probe yields exit 1 with the `no-restricted-syntax` selector firing, and a `page.tsx` probe of the same variable yields exit 0, proving the recorded exemption is real | Phase 6 and the build-time boundary | `src/app/**/page.tsx` and `layout.tsx` are exempt, so the definitive control is SV-11 on build artifacts, not this selector |
| SV-11 | Secret scanning of build output, source maps, rendered admin HTML and logs (§6.10, SEC-005) | `host` then `local-container` | planned scanner carrying a seeded false positive, a planted token that must be caught | at least 1 planted secret produces a non-zero exit and 0 planted secrets slip through before the scanner may be trusted | Phase 2 work item 2.10 | Secret scanning is not implemented anywhere in this repository and is absent from `ci.yml`; an untested scanner is an unverified control |
| SV-12 | Dependency scanning (§6.10, §13 check 8, §13.1) | `host` | `pnpm audit --audit-level=high`; the opening transcript is `docs/DEPENDENCY_AUDIT_2026-11-02.txt` and the re-run is `audit-2026-11-02-post-sr11.txt` in the 2 November evidence bundle | green needs 0 findings at Critical or High. **Met as re-measured 2 Nov 2026: exit 0.** The run that opened the finding was red at exit 1 with 15 vulnerabilities, 3 critical and 3 high, and stays recorded as history rather than being edited away; a full-level run still finds 3 advisories below the threshold (1 low, 2 moderate), named with their reasons in `docs/IMPLEMENTATION_PLAN.md` §2's B-11 row | Phase 2 work item 2.10 keeps it running, and owns the reachability triage of the three sub-threshold advisories | The advisories were closed at their root cause under the Owner's 2 November authorization — a `vitest` version bump that removed `tinypool` from the graph, plus two `overrides` written into `pnpm-workspace.yaml` lines 48–50 with the measurement that made each necessary; nothing was suppressed and no advisory is labelled benign. **This row covers dependency scanning only: the secret-scanning half of §6.10 is implemented nowhere, and CI job `security-scans` has still never run** |
| SV-13 | Session and cookie controls (§8) | `local-container` | capture `Set-Cookie` on a real authenticated response, then expiry, revocation and re-auth tests | Secure, HttpOnly and SameSite on every authenticated response, and 0 sessions usable past the bounded revocation window | Phase 6, the second-factor half deferred | No HTTPS deployment, no session issued, and no identity provider exists, so revocation is unmeasured |
| SV-14 | Audit-event completeness and audit-table integrity (§9, §2.4 finding 2) | `local-container` | one privileged action per event type, then attempt `UPDATE` and `DELETE` on the audit table as the runtime identity | 1 audit row per privileged action with 0 missing, and 0 successful `UPDATE` or `DELETE` of an audit row by the runtime role | Phase 6 | Only the harness grant design shows today; no running application writes a real audit row yet |
| SV-15 | Rate limiting and abuse on the named route families (§6.6) | `local-container` | `tests/e2e/security/rate-limit.spec.ts` over auth, forms, search, AI and upload | 5 of 5 families answer 429 at or past threshold, and 0 expensive public route is unthrottled | Phase 5 | The mechanism now exists (§6.6, selected and its failure mode fixed by `docs/ARCHITECTURE_DECISIONS.md` **ADR-034**), so this case is no longer waiting on an unimplemented control — it is waiting on routes that do not exist yet and on a harness class above `host`. What has been read is 1 of the 5 families, at `host`: the media route paced a declared burst and answered `429` with `Retry-After` on a live `next start`, and the other four families have no route to exercise. A `local-container` run should re-read the multi-worker case, because in-process buckets mean N workers grant N allowances |
| SV-16 | Backup and restore verification (§11) | `second-environment` then `production` | a restore runbook executed against a real backup, producing a transcript with measured RPO and RTO | 1 completed restore whose measured RPO and RTO fall inside the §11 targets, and 0 reliance on a backup job's exit 0 as proof | Phase 8 | Nothing has ever been restored; the §11 targets are unpublished proposals and provider feasibility is unknown |
| SV-17 | ASVS 5.0.0 Level 2 mapping status (§7) | `host` then `second-environment` | pin the published ASVS 5.0.0 requirement IDs into each §7 control area and attach an evidence path | 0 of the 15 §7 control areas left without a pinned requirement ID and a resolvable evidence path | Phase 5 and Phase 6 | No requirement ID is transcribed and no assessor engaged; a target, never a compliance claim |
| SV-18 | OWASP Top 10 2025 mapping (§1, §7) | `host` then `second-environment` | map each 2025 category to a project control and an SV case, pinning the numbering against the published edition before any statement | 10 of 10 categories mapped to at least one control and one case, and 0 categories unmapped | Phase 5 | The 2025 category numbering is not transcribed here and is not asserted, mirroring §7's discipline for the ASVS IDs |
| SV-19 | AI Curator retrieval boundary (§1.3, §2.3, §17.5 in the source spec) | `local-container` then `second-environment` | red-team suite under `tests/e2e/ai/` plus one retrieval test that orders permission before the model | 0 ineligible records retrieved, 0 retrieval-layer bypass across the red-team set, and 0 fabricated provenance, ownership or authenticity outputs | Phase 7 | No provider, index, or model call exists, so the ordering guarantee is entirely unproven |
| SV-20 | Safe errors and security headers (§6.1, §6.8; HSTS §6.2 held) | `host` for the reading taken 2 November 2026; `local-container` still owed for the E2E half | taken: `src/domain/response-headers.test.ts` and `src/ui/render-failure.test.tsx` over the shipped config and the shipped boundaries, plus a production build served locally and read with `curl` and a browser page surface. owed: `tests/e2e/security/headers.spec.ts` plus a 4xx-body assertion | taken at `host`: 23 of 23 assertions exit 0, one `/:path*` matcher, 1 of 1 occurrence for each security header on `/en` (no duplicates), `strict-transport-security`, `x-powered-by`, `report-to` and `report-uri` at 0 occurrences on all four routes read, and a live 500 whose body carries 0 stack frames, 0 absolute paths and 0 internal class names while the log carries both and the same digest appears on screen. owed: the same readings at `local-container` or above, and on Control Center responses | Phase 5 owns the E2E half | No deployed origin exists, so every number above is a `host` reading on `127.0.0.1` and none of it is a production claim; the Control Center half cannot be taken before Phase 6; and the dev-server half is now its own finding — **SR-35** measures that `next dev` puts the error class, the register filename and the throwing function into the response it sends the browser and does not render the boundary at all, so a release must be `next build` plus `next start`, never `next dev` |

### 16.3 The exit-coded measurements already held, and what each may be cited for

Two cases carry a repository transcript with an exit code. **SV-01** ran to completion with exit 0 inside a
throwaway container and volume the run itself removed; it is `disposable-harness` evidence for ADR-019's grant
design and nothing more, and it is barred from standing for application authorization, migration, restore, or any
production claim. **SV-12** ran against the lockfile twice on 2 November: the first run exited **1** — the
scanner did not fail, it found 15 vulnerabilities, 3 critical and 3 high — and the re-run after the SR-11
dependency work exits **0**, so the dependency half of §6.10 is executed **and green at the declared
threshold**, with three sub-threshold advisories recorded by name in the plan's B-11 row rather than waived or
re-labelled. The secret-scanning half is still implemented nowhere, which is what keeps §6.10 itself open. Two further
cases carry exit codes from unit and lint runs reproduced while this section was written: **SV-08** (the rights
decision, 9 of 9 assertions, exit 0) and **SV-10** (the client-boundary guard, exit 1 on a server-only probe,
exit 0 on the exempt `page.tsx` probe). All four sit at the two lowest rungs of the ladder, and none is
closeable to a higher rung by re-reading the same fixture. SV-11 has no run because the control does not exist.

**A fifth reading, taken in the 2 November closure window, and the defect it found.** SV-10's probe method was
extended to dynamic evaluation, because `eslint.config.mjs` asserted in its own comment that the project's
`no-restricted-syntax` selectors prohibited it. They did not: a source file containing a direct call to `eval`
passed `pnpm lint` at **exit 0**, in both `src/` and `scripts/`, and `eslint --print-config` reported **no
`no-eval` entry at all** for either path — `tseslint.configs.strict` turns the base rule off, and a selector that
matches a *string literal containing the word* eval cannot see a call. After the rule was re-enabled alongside
`no-implied-eval` and `no-new-func`, the same probes return **exit 1** with **8** named errors, and the clean tree
returns **exit 0**. `--print-config` now reports `no-eval` at severity **2** for both a `src/` file and a
`scripts/` file. What this may be cited for: a lint-time prohibition of dynamic evaluation, at `host` class, proved
falsifiable. What it may not: it is a static guard over a 32-file shell with no dynamic code path in it, and SV-07's
promise that the *CMS boundary* refuses executable input is still unrun, because there is no CMS write path yet.

**A socket-level finding, recorded rather than silently fixed.** Serving the production build locally on 2 November
exposed the address the app actually binds. `netstat` returned `TCP 0.0.0.0:3122 0.0.0.0:0 LISTENING`, and the same
page answered over the machine's LAN address `http://192.168.192.1:3122/en` with **200** — because the `start`
script is `next start` with no `-H` option. The loopback guarantee this document and `docs/ARCHITECTURE.md` had
been crediting to the local serve belongs only to the PostgreSQL publish in `docker-compose.yml`
(`127.0.0.1:5432`), which the compose contract gate does check. Two things follow, and neither is decided here: the
local serve is reachable from other hosts on the network while it runs, which matters more once `src/` holds a
Control Center; and hardening it means editing the `start` script, which is a configuration decision the Owner has
not been asked for. It is therefore registered as an open observation for the Owner, alongside the fact that the
served shell currently exposes no secret, no user data and no admin surface to reach.

**A sixth reading, taken 2 November 2026 for SR-03 and SR-05.** `pnpm build` (exit 0, 17 routes, the same 3
pre-existing Turbopack tracing warnings on `serving.ts` it carried before the batch) followed by `next start` on
`127.0.0.1` produced the first *response-level* evidence this document has held for either control. What was read:
the full header set on `/en` (200), `/ar` (200), `/api/media/NDM-AST-001` (404) and an unmatched route (404), each
security header present exactly once, `strict-transport-security` and `x-powered-by` present 0 times, and `SR-02`
re-checked on the served HTML at 0 occurrences of `data-asset-id`, `data-surface` and `data-reason`. Then two
failures provoked on purpose — a page calling the shipping `assetRegister()` against a root that does not exist,
and the locale layout itself throwing the register's own production message — which is how §6.8's two boundaries
were shown to fire in a browser rather than only in a test fixture: the locale boundary inside a still-standing
layout with `Server reference 1594644146`, the root boundary as a whole document of its own with
`Server reference 2031186396`, and in both cases 0 stack frames, 0 absolute paths and 0 internal class names in the
served bytes, while the server log held the message and the frames and the same digest the visitor saw. The only
client-side error on either page is React's own minified message, whose published text for code 441 is "An error
occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking
sensitive details. A digest property is included on this error instance…" — the framework stating the requirement,
not this project asserting it.

Three things this reading turned up that are worth keeping, because each one looked like a defect until it was
measured. **First, a boundary is not in the server response.** `curl` of a failing route returns Next's
`<html id="__next_error__">` shell with the layout's metadata and none of the band's text, because `error.tsx` and
`global-error.tsx` are client components drawn after hydration; a header-and-body assertion alone would have
"failed" a control that was working, which is why SV-20's method now names a page surface as well as `curl`.
**Second, a probe directory whose name begins with an underscore is not a route** — the first probe was written
under `__sr05probe/`, was silently absent from the route table, and answered 404, which is exactly what a missing
boundary would have looked like. **Third, `.next/dev/types/validator.ts` caches the route list**, so deleting a
route leaves a production build type-checking against a module that no longer exists; the fix was to remove the
regenerable build output and rebuild from the restored tree (exit 0, 17 routes), which is also what proved the
artifact reproducible from the committed state. No source file, no asset and no evidence file was in that
directory.

**What the sixth reading may be cited for, and what it may not.** It may be cited for: a shipped header policy
observed on live responses, and two error boundaries observed containing a real failure without disclosing it, at
`host` class. It may not be cited for: *verified for production* — the ladder caps this at `host`; there is no
HTTPS origin, no deployed edge, no Control Center response, and no `local-container` E2E run. It is also the first
measurement of the `SR-35` consequence below, and it inherits the exposure recorded in the paragraph above: these
captures were served by a `next start` process bound to `0.0.0.0`, so the shell was reachable from the LAN for the
minutes it ran, with no secret, no user data and no admin surface to reach. The probe route and the guarded layout
existed only in the working tree and in the evidence bundle
(`live-capture-sr03-sr05.txt`, `live-capture-globalerr.txt`, `live-capture-final.txt`,
`live-capture-final-dups.txt`, `live-capture-browser.txt`, `sr05probe-page.tsx.archived`); the tree was restored
byte-for-byte from its pre-mutation backup and re-verified by SHA-256 before this batch was committed.

### 16.4 ASVS 5.0.0 Level 2 — mapping status, not compliance

§7 already maps the ASVS control **areas** to project controls and to the evidence that must exist first. SV-17
is the case that closes that mapping: every §7 row must carry a requirement ID pinned against the published ASVS
5.0.0 edition and a resolvable evidence path before any statement about a control area is admissible. Today the
published requirement numbering is not transcribed in this repository and no assessor is engaged, so the honest
status is `Contract — unimplemented` for all 15 areas, and §7's own governing sentence — this is a target, not a
compliance claim — is the ceiling on anything SV-17 can ever produce without CAP-7's independent assessment.

### 16.5 OWASP Top 10 2025 — mapping status, not compliance

SV-18 requires each of the ten 2025 categories to map to at least one §6 control and one case above, and to be
pinned against the published edition before the numbering is written down. The threat framing in §1 already
names the risk areas the categories cover — access control, injection, security misconfiguration, vulnerable and
outdated components, identification and authentication failures, logging and monitoring failures, and server-side
request forgery — and each has a home in the register above (SV-03, SV-05, SV-06, SV-07, SV-19, SV-20, and SV-15
for abuse, with SV-12 for components). What is **not** done, and what SV-18 must not fabricate, is the official
2025 category numbering: it is not transcribed here and is deliberately not asserted, exactly as §7 defers the
ASVS IDs.

### 16.6 Non-claim statement

**No control in this document is verified as running in production, and nothing here is evidence of a running
system.** No case above is Passed, no case has a recorded approver, and no case has produced a `production`-class
or even `second-environment`-class artifact. The four exit-coded measurements at §16.3 are capped at their own
class — SV-01 at `disposable-harness`, SV-08, SV-10 and SV-12 at `host` — by the ladder rule at §16.1 that a
claim may not reach above the class of the evidence behind it, so none of them may be read as application
behavior, as authorization enforcement, as a migration test, as a restore, or as a compliance claim. **SV-12 was
red** when this paragraph was written, at 3 critical and 3 high; re-measured on this tree 4 November 2026,
`pnpm audit --audit-level=high` exits **0** with `3 vulnerabilities found — Severity: 1 low \| 2 moderate`, so the
Critical/High class the §6.10 threshold names is empty and SV-12's own row (§16.3) carries that reading — while the
unfiltered `pnpm audit` still exits **1** over those same three sub-threshold advisories, which is a red at a
different threshold and is recorded as B-11's residual, not waived. **SV-11 does not exist**; several cases (SV-09, SV-13,
SV-16, SV-19) cannot close without Owner-supplied facts that are absent and not inferable — no provider, storage,
hosting, backup vendor, or identity provider is selected, and no institutional or legal fact is supplied. **Asset
rights were the fifth item in that list when this paragraph was written ("0 of 82 asset rights are cleared"); on
4 November 2026 the Owner supplied a declaration that clears and approves all 82 register rows and publishes 46, so
that leg no longer withholds these cases — and none of them closes on the strength of it either, because SV-09,
SV-13, SV-16 and SV-19 ask for infrastructure and institutional facts, not for permission over a file, and the
provenance half of the asset question is still open as RB-04.** Every case is therefore scheduled **pending**, owned by the phase named in its row, and
governed by §20.6's evidence-and-approver rule. This section proves that each control has a defined way to be
proved; it proves none of the controls themselves.
