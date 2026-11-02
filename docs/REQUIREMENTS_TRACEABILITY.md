# Noujoude Digital Heritage Museum — Requirements Traceability Register

**Document ID:** NDM-TRACE-001
**Version:** 1.0.0
**Status:** Register of a **contentless shell** baseline as at 2 November 2026, opened against a **zero-implementation** baseline on 31 October 2026. `src/` now executes as a route, locale and rights-gate shell; **no requirement row moves on that account**, because Directive §15 treats a route, a component and a successful build as insufficient evidence. Column schema is exactly Directive §15 (lines 282–288).
**Date:** 31 October 2026, current-state cells re-measured 2 November 2026
**Column source (verbatim, Directive §15 lines 282–288):** Requirement ID · Source section and source lines/range ·
V1/future classification · Implementation location · Test(s) · Evidence · Status
(Implemented and Verified / Partially Implemented / Not Implemented / Blocked by Owner Input / Out of V1 Scope)
**Related:** `docs/ARCHITECTURE_DECISIONS.md` (ADR-001…ADR-033; `grep -c '^### ADR-'` → 33, measured 2 Nov 2026) · `docs/DATA_MODEL.md` · `docs/MASTER_SPECIFICATION.md` §2 (S-01…S-15) ·
`docs/ASSET_INVENTORY_AUDIT.csv` · `docs/asset-audit-summary.json`

---

## 0. Reading rules — why most rows say "Not Implemented"

Directive §15 line 290: *"A route, React component, button, schema field, migration, or successful build alone is not
proof of a completed feature."* Directive §17 line 318: *"Do not claim a feature is implemented without verifying
behavior."*

**Measured 2 November 2026 — this is the current truth.** `src/` holds **32** files: 18 `.tsx`,
8 `.ts` (4 of them test files), 5 `.css` and `src/README.md`, **1,752** lines across the 31
code/style files. `tsc --noEmit` exits `0`, `eslint .` exits `0`, `vitest run` exits `0` over
4 test files and **34** assertions, `pnpm build` exits `0` over **16** routes, and `pnpm start`
answered HTTP probes on the loopback interface (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). Dependencies
are installed: 18 declared packages with `pnpm-lock.yaml` on disk. **What is still zero, measured
the same way:** zero collections, zero Payload configuration files, zero migrations, zero
databases, zero Control Center directories, zero owner-supplied records.

The 31 October 2026 baseline is kept as the record it was, not deleted: **`src/` then contained
only `src/README.md`; there were zero collections, zero migrations, zero routes, zero tests and
zero installed dependencies** (`src/README.md`; `ARCHITECTURE_DECISIONS.md` §7
rows 4–7; preflight run 31 Oct 2026 = 1 FAIL / 2 WARN / 4 PASS).

What the shell does not change: Directive §15 refuses a route, a component or a successful build
as proof of a feature, so an initialized route set evidences a route set and nothing more. No
application behavior has been verified against a record, and **application-level verified
progress stays at 0 rows** — no row in this register moves because `src/` stopped being empty.

Column conventions:

| Notation | Meaning |
|---|---|
| `— (planned: <path>)` | The path is where the implementing code is intended to go. Measured 2 Nov 2026 with `find src -type d`: it either **does not exist** or exists only as shell. The paths that hold files are `src/app/[locale]/**` (15 `page.tsx`), `src/ui/**` and `src/domain/**`; the paths that do not exist at all are `src/payload/`, `src/lib/`, `src/app/control-center/`, `src/generated/`, `src/domain/states/`, `src/domain/asset-states/` and `src/domain/ai/`. Where a shell file sits at a planned path, the row names it in Evidence and its status does not move |
| `— (none)` | No test exists. The parenthetical names the test type that will be required. Since 2 Nov 2026 the register has one test layer that runs — 4 unit files and 34 assertions over `src/domain/` — so this marker now means *this row's named test has not been written*, not that no test exists anywhere |
| `— (no behavior exists to evidence)` | Empty by design; never fill it with a projection. From 2 Nov 2026 it means no *required* behaviour at that path: the shell's own behaviour — a rendered title, a `dir` attribute, a refused slug, an unpopulated notice — is named in the row it belongs to, never smuggled in as evidence for the requirement |
| `<file> + <measured value>` | Real, re-checkable evidence for a documentation/audit deliverable |
| `V1` / `Future` | Classification per Directive §15 line 284; `Future` rows are sourced from §2.7 lines 322–334 and §9.4 line 1430 |
| Status column values | The five that Directive §15 line 288 permits, quoted by name throughout: "Implemented and Verified" / "Partially Implemented" / "Not Implemented" / "Blocked by Owner Input" / "Out of V1 Scope". Line 288 is their only source; Appendix C's separate vocabulary is handled by REQ-CFX-015 |
| `§11.9 1613–1617`, `G.2 3672`, `Directive 194` | The Source column's declared style (its header says "section · lines"): a section locator followed by the line number(s) it occupies in that file, written without the word "line". `scripts/verify-citations.mjs` reads both this style and `line N`, so a number in a Source cell is a checkable citation, not decoration |

Only **documentation, audit and one host-runtime version gate** can honestly reach "Implemented and Verified" at this
baseline, because their deliverable *is* a document, a measurement, or an environment reading that a command re-checks.
Every such row states the exact scope of the claim. The 2 November 2026 shell adds nothing to that set: its commands
are green and its records are zero, so the count of application rows at "Implemented and Verified" is still 0.

---

## 1. Summary — rows per status

| Status | Rows | Share |
|---|---:|---:|
| Implemented and Verified | 24 | 10.9% |
| Partially Implemented | 8 | 3.6% |
| Not Implemented | 166 | 75.1% |
| Blocked by Owner Input | 19 | 8.6% |
| Out of V1 Scope | 4 | 1.8% |
| **Total** | **221** | **100.0%** |

Counts are recomputed from the table body, not asserted. The command that produced them, run against this file on
2 November 2026: `grep -E '^\| REQ-' docs/REQUIREMENTS_TRACEABILITY.md | awk -F' [|] ' '{print $NF}' | sort | uniq -c`
→ 166 / 24 / 19 / 8 / 4, and the five shares are one-decimal so that they sum to 100.0 rather than to 101 by rounding.

**Two rows were added on 2 November 2026, and no existing row moved.** `REQ-BRAND-007` and `REQ-BRAND-008` were opened
to record the identity asset system and the Owner-supplied Arabic name; both are `Partially Implemented`, which is why
that class is 6 → 8. Application-level verified progress is **still 0 rows**, and the count of `Implemented and
Verified` is unchanged at 24. Neither new row claims a passed approval: `OID-18` (final logo and variants) is
Outstanding, so every one of the 114 rows in `docs/BRAND_ASSET_INVENTORY.csv` reads `Not Approved`, and the Arabic
rendering is catalogued as a build proposal against OI-002's still-unmet approval half.

**Two rows moved on 1 November 2026, and both moved because an Owner decision was executed, not because a status was
re-labelled.** **REQ-BLD-002** left `Blocked by Owner Input` for `Implemented and Verified` once OD-1 put the host
inside `engines.node` and preflight printed the PASS line. **REQ-BLD-005** left `Not Implemented` for `Partially
Implemented` because `pnpm-lock.yaml` now exists and is committed while its named verification
(`pnpm install --frozen-lockfile`) has still never run. Nothing else moved: **application-level verified progress is
still 0 rows**, and the 24th row is a runtime reading, not product behaviour.

**What the counts actually prove:** Phase 0 (audit) and Phase 1 (architecture, decisions, modelling, governance
contracts, this register) are delivered and measurable. **Product implementation has not started; application
*initialization* has** — on 2 November 2026 `src/` became an executed route, locale, rights-gate and empty-state shell
with no content, no Payload configuration and no database, which is one line of Directive §14 and nothing beyond it.
Application-level verified
progress is **0 rows**: all 24 "Implemented and Verified" rows are documentation, audit or version-verification
deliverables whose evidence is a file in `docs/` or a re-runnable command — none is product behavior, and none may be
quoted as a feature being working. 19 rows are blocked on facts, rights, approvals or hosting commitments that must not
be fabricated (Standard §13 lines 296–304; G.13 line 3935), including all ten quarantined AI-generated assets (§19).

Group totals (221 rows): 15 conflict resolutions · 6 build gate · 8 commerce · 10 CMS boundary · 8 brand · 8 worlds ·
4 taxonomy · 14 data model · 9 state machines · 9 localization · 6 SEO · 6 search · 10 public experience ·
20 Control Center modules · 9 auth/roles · 11 AI Curator · 10 asset governance · 10 quarantined AI assets ·
4 accessibility · 4 performance · 5 telemetry · 8 backup/ops · 8 truth rules · 6 testing/release · 13 documentation.

---

## 2. S-01…S-15 — every specification conflict and its resolution → REQ-CFX

Source of the conflict log: `docs/MASTER_SPECIFICATION.md` §2 (S-01…S-15). Each row's product obligation is what must
eventually be enforced in the running system, which is why ten of the fifteen are Not Implemented: the four
"Implemented and Verified" rows and the one "Partial" row describe documents and measurements that genuinely exist,
not product behavior.

| ID | Source (section · lines) | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-CFX-001 | S-01; §11.9 1613–1617 + G.4 3723 + §6.3 625–628; ADR-010 | V1 | — (planned: `src/payload/collections/Country.ts`) | — (none; enum + hidden-route exposure tests) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-002 | S-02; §8.16 1352 vs 1134/1170/1218; ADR-008; D-02 | V1 | — (planned: `src/payload/collections/PublicationRecord.ts`) | — (none; per-locale publish/unpublish) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-003 | S-03; §11 1524, machines at 1543/1555/1266; ADR-009 | V1 | — (planned: `src/domain/states/`) | — (none; no-collapsed-badge tests) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-004 | S-04; §8.1 1019–1020, §8.13 1291–1295, gap at 1030–1051/1147–1172; ADR-011 | V1 | — (planned: `src/payload/collections/OwnershipStatement.ts`, `AuthenticityAssessment.ts`, `ConditionReport.ts`) | — (none; evidence + approval separation) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-005 | S-05; §8.14 1315 vs §8.17 1373; ADR-012 | V1 | — (planned: `src/payload/migrations/` join `media_asset_rights`) | — (none; multi-rights-per-use) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-006 | S-06; §8.17 1376 vs §8.7 1147–1172; ADR-012 | V1 | — (planned: `src/payload/collections/ArtifactCountryRelationship.ts`) | — (none; six controlled types) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-007 | S-07; §8.19 1398, §9.4 1430, Standard §3.3 117; ADR-007 | V1 | — (planned: absent by design — no vector column) | — (none; schema assertion "no pgvector") | ADR-007 records the prohibition and `docs/DATA_MODEL.md` §8 item 2 keeps it undecided; `768` appears in project documents **only as an express non-adoption**, never as a dimension in any design or schema contract | Implemented and Verified |
| REQ-CFX-008 | S-08; §9.1–9.3 1406–1426; ADR-006 | V1 | — (planned: `src/payload/collections/` FTS columns; field names deferred to Phase 2) | — (none; trigram + FTS filters) | — (gap logged, deliberately unresolved per ADR-006) | Not Implemented |
| REQ-CFX-009 | S-09; A.10 3463; ADR-013 | V1 | `docs/ASSET_INVENTORY_AUDIT.csv` (Asset ID column) | re-run `node scripts/audit-assets.mjs`; assert 82 unique `NDM-AST-001…082` | 82 IDs issued in Appendix A catalog order; `docs/asset-audit-summary.json` `catalogTotal: 82`; no reuse rule recorded in ADR-013 | Implemented and Verified |
| REQ-CFX-010 | S-10; A.11 3467, §13.3 1872–1889, §11.8 1603; ADR-009 | V1 | — (planned: `src/domain/asset-states/`) | — (none; three-dimension separation) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-011 | S-11; A.2–A.8 3323–3448 vs cited range 3779–3937 | V1 | `scripts/audit-assets.mjs` → `docs/ASSET_INVENTORY_AUDIT.csv` | assert every catalog filename matched verbatim in `Noujoude_Line_by_Line_Traceability_EN.csv` | `asset-audit-summary.json` `sourceVerification`: **82 verified of 82, 0 mismatched**; `.md` line numbers explicitly rejected as locators | Implemented and Verified |
| REQ-CFX-012 | S-12; §16.6 2425–2467 (A–K) vs G.8 3809 | V1 | — (planned: `src/app/control-center/artifacts/`) | — (none; union screen set) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-013 | S-13; §16.9 2544 (8 classes) vs §14.13 2085–2093 (9 classes) | V1 | — (planned: `src/domain/ai/evaluation.ts`) | — (none; 9-class classifier incl `Misstates Uncertainty`) | — (no behavior exists to evidence) | Not Implemented |
| REQ-CFX-014 | S-14; DOCX 142,645 B vs MD 242,312 B, no stated precedence | V1 | `docs/MASTER_SPECIFICATION.md` §1 + `scripts/copy-master-spec.mjs` | `node scripts/check-docx-alignment.mjs`; assert 0 content-loss word types | `docs/DOCX_MD_ALIGNMENT.json`: **337/337 headings, 0 DOCX types absent, 0 MD types absent**; verdict ALIGNED; SHA-256 `5b30b21e…4ecd5` in `docs/REFERENCE_INTEGRITY.json`; formalized as **ADR-018** | Implemented and Verified |
| REQ-CFX-015 | S-15; Appendix C 3586–3597 vs Directive §15 288 | V1 | this register (status axis) + Appendix C fields carried as separate columns | — (none; one record satisfies both vocabularies) | the five Directive values are the Status column throughout; Appendix C's 3597 rule ("Implemented" ≠ "Verified") is enforced by §0's reading rules. **Not yet carried:** Appendix C's priority (3588), release (3589), verification method (3592), result (3593), verifier/date (3594), defect/exception (3595) columns are absent from this register | Partially Implemented |

---

## 3. Build, stack and version gate → REQ-BLD

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-BLD-001 | Standard §2.3 63–87; Directive §7 118–121 | V1 | `docs/ARCHITECTURE_DECISIONS.md` §3 | re-query npm registry / payloadcms.com / postgresql.org / nodejs.org | 31 Oct 2026 direct-source matrix, payload 3.92.1, next 16.4.3, react 19.3.1, PG 18.6; "UNVERIFIED" used where unproven | Implemented and Verified |
| REQ-BLD-002 | ADR-003 / B-01; Standard §2.2 46 | V1 | host runtime, not code (`node -v`) | `node scripts/preflight.mjs` | **Executed 1 Nov 2026 under OD-1:** `node -v` → `v24.22.1` and preflight prints `PASS \| Node.js 24.22.1 \| satisfies engines.node`. Scope of the claim is **this host only** — no CI runner image has ever executed (B-08), and the pinned range `>=24.22.1 <25` is what the requirement binds, not any particular patch | Implemented and Verified |
| REQ-BLD-003 | Standard §2.3 step 9 77; §12 269–280 | V1 | — (planned: CI pipeline; `.github/workflows/ci.yml` exists and has never run) | clean install → typecheck → test → production build | **Re-run end-to-end 2 Nov 2026: the chain moves and the row still does not pass.** Install exit 0; `tsc --noEmit` exit 0 over 26 `src/` files plus 19 `scripts/**/*.mjs` with `checkJs` off, so the scripts stay parsed-not-checked; `vitest run` exit 0 with 4 files and 34 assertions; `pnpm build` exit 0 over **16** routes and `pnpm start` answers loopback probes (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). What keeps this row down: the chain has never run in CI (**B-08**, zero workflow runs, no remote), `pnpm format:check` exits 1 over 25 files, `pnpm audit --audit-level=high` exits 1 with 15 advisories (**B-11**), and a route table is Directive §15's own example of insufficient proof. The 1 Nov reading — typecheck hollow over 0 `.ts` files, test exit 1 with no test files, build exit 1 with no app directory — is kept as that day's record. ADR §7 row 7 stays ⚠️ partly executed | Not Implemented |
| REQ-BLD-004 | Standard §15 329; §2.3 65 | V1 | — (planned: lockfile audit + CI guard) | — (none; rejects beta/RC/canary dist-tags) | **There is now something to audit** — `pnpm-lock.yaml` (8,399 lines) resolved every entry to a stable version, and the install printed `✓ Lockfile passes supply-chain policies` — but no automated beta/RC/canary rejection guard exists and the CI `security-scans` job has never run, so the requirement's mechanism is still unimplemented | Not Implemented |
| REQ-BLD-005 | Standard §2.2 47 (pnpm, committed lockfile) | V1 | `pnpm-lock.yaml` (authored by `pnpm install` under OD-2, 285,200 bytes / `lockfileVersion: '9.0'`, committed in `aedeee0`) | `pnpm install --frozen-lockfile` | The lockfile exists and is tracked, and `packageManager` is pinned in `package.json`. **What has not been done is the verification the row names:** `pnpm install --frozen-lockfile` has never been executed, so reproducibility is asserted from the file's presence rather than proven by a frozen install | Partially Implemented |
| REQ-BLD-006 | Standard §3.2 99–106; ADR-005 | V1 | `scripts/db/init-roles.sh` (authored; **executed inside the A.5 harness's throwaway container** on 1 Nov 2026 — entrypoint run plus an idempotent re-run, `docs/A5_PRIVILEGE_EVIDENCE.txt`) | — (none; runtime role has DML only, no DDL, not superuser) | The script ran and the grant state was asserted, but **against a disposable database, not this project's**: no project database has been created. **The reason this row stated on 31 Oct is now false and is corrected here** — `docker compose config` no longer exits 1 on unset `.env` secrets (OD-3 created `.env`; the render now exits **0**, verified with `--quiet` so no secret is printed). `pnpm db:up` simply has not been run | Not Implemented |

---

## 4. Non-negotiable commerce exclusions → REQ-COMM

Appendix G.3 line 3702 (verbatim): *"No commerce framework, payment provider, cart schema, order schema, or sales
analytics is to be installed for V1."* G.3 line 3692 closes the loophole: the prohibition applies *"including hidden,
unlinked, API-only, or admin-configurable variants"*.

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-COMM-001 | G.3 3702; §2.6 302; §23 item 5 3294; Directive 63 | V1 | — (planned: absent by design; no package, no schema, no analytics) | — (none; dependency + schema allowlist guard) | Measured 2 Nov 2026 over the installed tree, not an empty one: `package.json` declares 18 dependencies and none is a commerce framework, payment provider, cart, order or sales-analytics package; `src/` renders no such surface because it renders no records. **Still no enforcing guard** — the dependency and schema allowlist test named in the Test cell does not exist, so this is a reading, not a control | Not Implemented |
| REQ-COMM-002 | G.3 3694; Directive 75; §6.7 725 | V1 | — (planned: no price column on Artifact/Collection/Story) | — (none; schema scan for price/value/currency fields) | — (no behavior exists to evidence) | Not Implemented |
| REQ-COMM-003 | G.3 3695; Directive 76 | V1 | — (planned: forbidden-token lint over routes, API, CMS fields) | — (none; Buy Now/Checkout/Payment/Order absent incl. admin UI) | Measured 2 Nov 2026: `src/` carries no such token, and `src/domain/routes.test.ts` proves the route registry refuses a key it does not hold — the case names `checkout` and expects `RangeError`, inside `vitest run` exit 0. That is one invented route refused, not a lint; the forbidden-token scan over routes, API and CMS fields this row names is unwritten, and `eslint.config.mjs` today restricts syntax and client env reads, not commerce vocabulary | Not Implemented |
| REQ-COMM-004 | G.3 3696 | V1 | — (planned: no seller/listing/bidding surface) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-COMM-005 | G.3 3697; Directive 78 | V1 | — (planned: no stock/inventory/variant/shipping fields) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-COMM-006 | G.3 3698; §6.12 838+ | V1 | `src/app/[locale]/contact/page.tsx` — the planned directory now exists as a shell page; no form, no submission path, no inquiry record | — (none; inquiry form carries no conversion funnel) | Measured 2 Nov 2026: `/en/contact` is in the built route table and is one of the eight navigation destinations served from `/en` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`), and the page renders the shell with the `unpopulated` notice (`src/ui/page-shell.tsx`), so nothing here can convert, price or collect. The requirement's subject — an inquiry form that carries no funnel — is still unimplemented, which is why this row stays where it is | Not Implemented |
| REQ-COMM-007 | G.3 3692 (hidden/API-only/admin-configurable) | V1 | — (planned: CI negative scan of CMS settings + REST/GraphQL surface) | — (none) | — (this is the row most likely to be quietly violated later; guard is unwritten) | Not Implemented |
| REQ-COMM-008 | A.9 3455–3458; §2.6 318 | V1 | — (planned: asset→feature authorization gate) | — (none; `gift_boutique.webp`, `favorite_heart_1024.webp`, `user_account_1024.webp`, `museum_cafe_morning.webp`, `location_paris_1024.webp` authorize nothing) | audit CSV records all five as present-but-non-authorizing | Not Implemented |

---

## 5. CMS security boundary — arbitrary code, SQL, secrets, infra, logging → REQ-SECB

Sources: §15.3 lines 2136–2150, §16.16 line 2624, Appendix G.7 lines 3785–3796, Standard §15 line 333, Directive §17 line 324.

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-SECB-001 | G.7 3789; §15.3 2141; §16.16 2624; Standard 333 | V1 | — (planned: `src/lib/server/access/`) | — (none; negative: no SQL console, no schema mutation, no superuser credential field) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-002 | G.7 3787; §15.3 2142 | V1 | — (planned: Lexical-only rich text, ADR-016) | — (none; no arbitrary source/executable/JS/CSS editing) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-003 | G.7 3792; §15.3 2143 | V1 | — (planned: server-side storage only, Standard §6 191) | — (none; no filesystem browsing / arbitrary deletion) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-004 | G.7 3788; §15.3 2144; §16.16 2624 | V1 | — (planned: no shell/OS command surface) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-005 | G.7 3791; §15.3 2145; §16.16 2624 | V1 | — (planned: no Docker/host/cloud/DNS/firewall admin UI) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-006 | G.7 3790; §15.3 2138–2140; §16.16 2622–2624 | V1 | — (planned: masked secret fields; secrets never retrievable as plaintext) | — (none; positive+negative secret read tests; Standard 180 bans `NEXT_PUBLIC_*`) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-007 | G.7 3794; §15.3 2147; Standard §12 281 | V1 | — (planned: no deployment execution from the CMS) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-008 | G.7 3793; §15.3 2148; G.8 3822 | V1 | — (planned: `src/payload/hooks/audit.ts` + grant/trigger guard) | — (none; **inability to disable audit integrity, access-control enforcement, evidence requirements, privacy safeguards or security logging**) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-009 | §8.16 1350; Standard §3.2 106 | V1 | — (planned: field-level access deny on password/secret/token columns) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SECB-010 | G.7 3796 (break-glass separated); §17.6 2808 | V1 | — (planned: out-of-band infra process, own auth+audit) | — (none) | — (no behavior exists to evidence) | Not Implemented |

---

## 6. Brand identity and the exact tagline → REQ-BRAND

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-BRAND-001 | §1.3 139 + front matter 15; G.2 3672; Directive 67 | V1 | — (planned: `src/ui/brand/tagline.ts`) | — (none; exact-string test) | the string `More than a collection... it's a story.` is recorded verbatim in `docs/MASTER_SPECIFICATION.md` (source lines 15, 139, 3672) | Not Implemented |
| REQ-BRAND-002 | G.2 3672 ("No silent rewriting or alternate tagline") | V1 | — (planned: institutional settings + lint) | — (none; rejects any variant/paraphrase) | — (no behavior exists to evidence) | Not Implemented |
| REQ-BRAND-003 | §1.3 143; Directive 71 | V1 | — (planned: `src/ui/brand/progression.ts`) | — (none; exact-string test) | string `You enter. You discover. You understand. You remember.` verified at line 143 | Not Implemented |
| REQ-BRAND-004 | §1.3 145; §4.6 455+; Directive 71 | V1 | — (planned: `src/app/[locale]/` journeys; the route set exists since 2 Nov 2026, the journey does not) | — (none; Playwright journey per locale) | 15 `page.tsx` files build into 16 routes and `/en` plus `/ar` answer `200` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`); no Playwright project has launched, so no progression through the narrative is evidenced. The required behaviour is a tested journey, not a reachable URL, so the row stays put | Not Implemented |
| REQ-BRAND-005 | §12.1 1660+; §23 items 1–3 3290–3292; G.6 3746+; Directive 110 | V1 | — (planned: `src/ui/tokens/` — that directory does not exist; `src/ui/styles/global.css` is the ADR-026 custom-property layer) | — (none; token + palette conformance) | `src/ui/styles/global.css` carries §12.2's palette, §12.5's type roles and §12.13's durations as `proposed` custom properties with a reduced-motion override, and BA-002/OD-16 keep the palette unapproved. Proposed values in a stylesheet are not a conformance test and not an approved system, so the row stays Not Implemented | Not Implemented |
| REQ-BRAND-006 | Directive 112; A.9 3458; §23 item 1 3290 | V1 | — (planned: copy + structured-data guards) | — (none; no Paris/French physical location asserted) | — (no behavior exists to evidence) | Not Implemented |
| REQ-BRAND-007 | §12.7 1745–1765; A.2 3323–3339; Directive 114 | V1 | `brand/noujoude-monogram-seal.svg` + `brand/svg/**` (25 masters) + `brand/png/**` (88 rasters); generator `brand/_tools/build.mjs` → `export.mjs` → `inventory.mjs` | `node brand/_tools/joincheck.mjs brand/svg/noujoude-wordmark-arabic.svg 1024` (ink-island count); `node brand/_tools/inventory.mjs` (114 rows, 20 columns, all measured from bytes) | All five §12.7 roles exist in Latin and Arabic as editable vectors. "No stretching or proportion distortion." is structural: `run()` applies one `k` to x and y and no path accepts separate scales. "Do not recreate the official logo from text when the approved asset exists." is satisfied for the seal, which ships as drawn artwork and is never re-typeset. **The gate's own precondition is unmet: no logo asset is approved, so the "approved asset" §12.7 refers to does not exist yet** (OID-18 Outstanding; `docs/BRAND_ASSET_INVENTORY.csv` records `Not Approved` on 114/114). No application consumes any of these files: `src/` is a 32-file shell as of 2 Nov 2026 and imports nothing from `brand/`, `grep` over `src/**` finds no reference to those files, `src/app/[locale]/layout.tsx` states that no approved monogram or wordmark is rendered, and `src/ui/styles/global.css` carries §12.2's palette as `proposed` tokens with BA-002 open rather than as adopted brand | Partially Implemented |
| REQ-BRAND-008 | §21.1 3183 (OI-002); §12.7 1745–1765; A.2 3323–3339 | V1 | `brand/svg/noujoude-wordmark-arabic.svg` and the Arabic lockups/watermark | `joincheck.mjs` → **4 ink islands** for نجود (joined body + detached د + 2 dots); cross-checked against Blink/HarfBuzz rendering the same TTF (advance 143.7/100 em vs 1437/1000 units) | §21.1 asks for the "Official Arabic name and approved Noujoude Arabic rendering". The **name half is supplied**: نجود, Owner chat message 2 November 2026, recorded `Provided` in `docs/OWNER_INPUT_REGISTER.md` §6B and carried in `brand/svg/manifest.json → name.arabic`. The **approval half is not**: OID-18 is Outstanding, so the rendering is a build proposal. The Arabic tagline متحف التراث الرقمي is flagged `DERIVED … must not be published as approved copy` in that same manifest. Defect found and closed while building this row: `text2svg.py` had been requesting `medi`/`fina` as user features, which re-ran GSUB over already-shaped output and rendered every Arabic asset as **detached letters** (6 ink islands, layout width 2070/1000 em against the shipped 1437) — visual review had passed all of them | Partially Implemented |

---

## 7. Six country worlds, Morocco first → REQ-WORLD

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-WORLD-001 | G.4 3706–3713; §2.3 246+; Directive 84–91 | V1 | — (planned: `src/payload/collections/Country.ts`) | — (none; 6 seeded rows) | — (no database exists; zero country rows exist) | Not Implemented |
| REQ-WORLD-002 | G.2 3674 | V1 | — (planned: change-control gate) | — (none; rejects a 7th world) | — (no behavior exists to evidence) | Not Implemented |
| REQ-WORLD-003 | G.4 3708, 3725; G.2 3673; Directive 93 | V1 | — (planned: Morocco world experience; the route `src/app/[locale]/worlds/[country-slug]/page.tsx` exists as a shell, the experience does not) | — (none; Morocco is the only `Open Exhibition`) | No Morocco record, no exhibition-state field and no content exist: `docs/DATA_MODEL.md` rows are design contracts, `docs/ASSET_INVENTORY_AUDIT.csv` shows 0 of 82 assets rights-cleared, and the shell renders the `unpopulated` notice. A route that can hold Morocco is not a Morocco world | Not Implemented |
| REQ-WORLD-004 | G.4 3715 | V1 | — (planned: `src/payload/collections/Country.ts` + joins) | — (none; each world: identity fields, state, route, relationship model) | — (no behavior exists to evidence) | Not Implemented |
| REQ-WORLD-005 | §11.9 1613–1617; G.4 3717–3723; ADR-010 | V1 | — (planned: `exhibitionState` enum + visibility filter) | — (none; `Hidden/Not Public` excluded from nav, search, sitemap, AI retrieval) | — (no behavior exists to evidence) | Not Implemented |
| REQ-WORLD-006 | G.4 3725; §2.8 338; Directive 93 | V1 | — (planned: readiness derivation from eligible published records) | — (none; no equal-size fakery) | — (no behavior exists to evidence) | Not Implemented |
| REQ-WORLD-007 | §6.3 630–632 | V1 | `src/app/[locale]/worlds/page.tsx` — exists as a shell since 2 Nov 2026; the readiness derivation it depends on is `src/domain/rights.ts` plus the absent publication state | — (none; directory opens only genuinely ready worlds) | The gate exists in code and fails closed: `rights.test.ts` asserts denial for every asset in the library's recorded state and refuses an unrecognised state rather than allowing it (9 assertions, exit 0). What is unevidenced is the directory's own behaviour — no world row, no readiness derivation, no published-in-locale check — because the data layer has never been created | Not Implemented |
| REQ-WORLD-008 | Egypt/Syria/Mauritania/Libya/Sudan full exhibitions — §2.7 324 | Future | — (out of V1 by spec) | — (n/a) | §2.7 line 336: *"Future scope must not be used as a dependency for V1 acceptance."* | Out of V1 Scope |

---

## 8. Collection taxonomy → REQ-TAX

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-TAX-001 | G.5 3729+; §2.4 261+; G.2 3675; Directive 97–104 | V1 | — (planned: `src/payload/collections/Category.ts`) | — (none; 8 seeded rows: Stamps, First Day Covers, Coins, Documents, Letters, Souvenirs, Heritage Objects, Artifacts) | — (no database exists; 8 category names appear in no schema) | Not Implemented |
| REQ-TAX-002 | Directive 106; §2.8 338 | V1 | — (planned: public count derivation, §7.6 1001) | — (none; category record ≠ object availability) | — (no behavior exists to evidence) | Not Implemented |
| REQ-TAX-003 | Directive 106; Standard §13 300 | V1 | — (blocked: real artifact inventory is an Owner fact) | — (none) | Standard §13 forbids fabricating "Real artifact inventory and factual data"; §21.2 3192+ | Blocked by Owner Input |
| REQ-TAX-004 | §8.5 1115; §8.17 1365 | V1 | — (planned: `is_active` + hierarchy + migration plan rule) | — (none; deactivation never deletes artifacts) | — (no behavior exists to evidence) | Not Implemented |

---

## 9. Data model → REQ-DM

Full contracts: `docs/DATA_MODEL.md` (all rows there are design contracts, not deployed state).

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-DM-001 | Standard §3.1 93–95; ADR-002 | V1 | — (planned: `src/payload/payload.config.ts`) | — (none; single migration stream) | — (no migrations exist) | Not Implemented |
| REQ-DM-002 | Standard §15 327; §2.2 50 | V1 | — (planned: absent by design — no Prisma) | — (none; dependency scan) | Measured 2 Nov 2026 against the installed tree, not an empty one: `package.json` declares 18 dependencies and `grep -c` for prisma in it is 0; `pnpm-lock.yaml` carries no top-level `prisma` or `@prisma/client` entry (0 matches). Persistence stays undecided until `src/payload/` exists, so the prohibition holds by fact and still has no automated scan behind it | Not Implemented |
| REQ-DM-003 | Standard §15 328; Directive 323 | V1 | — (planned: absent by design — one migration system) | — (none) | Measured term-by-term in the 2 November closure window, not by an alternation the table cannot hold: `grep -ci drizzle package.json` → **0** and `grep -ci knex package.json` → **0**, so no declared dependency and no script in the file names either migrator. `pnpm-lock.yaml` carries **13** drizzle lines and **4** knex lines, all transitive under `@payloadcms/db-postgres`, which is ADR-002's single stream rather than a competitor to it. `src/payload/migrations/` does not exist, so there is exactly one *intended* stream and zero actual streams. The row stays Not Implemented until the adapter's migration stream runs | Not Implemented |
| REQ-DM-004 | §8.2 1032–1051 | V1 | — (planned: `src/payload/collections/*`) | — (none; model-vs-source completeness check) | 20 entities enumerated as a design contract in `docs/DATA_MODEL.md` §2 (Master Spec §8.2 line 1053 itself denies existence) | Not Implemented |
| REQ-DM-005 | §8.1 1011–1026; Directive 162–175 | V1 | — (planned: `src/domain/`) | — (none; no concept collapse; no blanket "Verified") | — (no behavior exists to evidence) | Not Implemented |
| REQ-DM-006 | §8.16 1352; ADR-008 | V1 | — (planned: `PublicationRecord`, key (entity, locale)) | — (none; published derived, not stored twice) | — (no behavior exists to evidence) | Not Implemented |
| REQ-DM-007 | §8.13 1291–1295; ADR-011 | V1 | — (planned: `OwnershipStatement`, `AuthenticityAssessment`) | — (none; separate evidence+approval+disclosure) | — (no behavior exists to evidence) | Not Implemented |
| REQ-DM-008 | §8.7 1169; §16.6 H 2453; ADR-011 | V1 | — (planned: `ConditionReport`) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-DM-009 | §8.17 1363, 1376; ADR-012 | V1 | — (planned: `artifact_country_relationship`) | — (none; 6 controlled types; primary display ≠ erasure) | — (no behavior exists to evidence) | Not Implemented |
| REQ-DM-010 | §8.17 1373; §8.14 1315; ADR-012 | V1 | — (planned: `media_asset_rights`) | — (none; per-use rights) | — (no behavior exists to evidence) | Not Implemented |
| REQ-DM-011 | Standard §3.3 110; §8.18 1382–1383 | V1 | — (planned: UUID PKs + unique locale slugs) | — (none) | — (no schema exists) | Not Implemented |
| REQ-DM-012 | §8.18 1393–1394; §7.6 999 | V1 | — (planned: unknown-value encoding) | — (none; empty string rejected as an unknown) | — (no schema exists) | Not Implemented |
| REQ-DM-013 | Standard §3.3 115; §8.17 1378; §8.18 1392 | V1 | — (planned: `RESTRICT` FKs, no cascade on claims/evidence/rights/audit/revisions) | — (none; delete-parent failures) | retention rule itself is a legal/Owner input — none supplied (Standard §13 298; §19.1 2850+) | Blocked by Owner Input |
| REQ-DM-014 | Standard §3.4 121–126 | V1 | — (planned: `src/payload/migrations/`) | — (none; fresh creation + upgrade from preceding schema) | — (zero migrations exist; plan recorded in `docs/DATA_MODEL.md` §9) | Not Implemented |

---

## 10. State machines → REQ-STATE

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-STATE-001 | §11.1 1530–1537 | V1 | — (planned: `src/domain/states/`) | — (none; 8 independent dimensions) | — (no schema exists) | Not Implemented |
| REQ-STATE-002 | §11 1524 ("No single 'status' field may be used") | V1 | — (planned: namespaced columns) | — (none; lint forbids a `status` column on content) | — (no schema exists) | Not Implemented |
| REQ-STATE-003 | §11.2 1543–1551 | V1 | — (planned: `editorialState`) | — (none; branches; approval ≠ publish, line 1551) | — (no behavior exists to evidence) | Not Implemented |
| REQ-STATE-004 | §11.3 1555–1567 | V1 | — (planned: `publicationState` + 7 publish-gate confirmations 1561–1567) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-STATE-005 | §11.4 1571–1573 | V1 | — (planned: invalidation on material change) | — (none; revision retained for cosmetic edits) | — (no behavior exists to evidence) | Not Implemented |
| REQ-STATE-006 | §8.11 1266; §11.5 1577 | V1 | — (planned: `claimReviewState`, 9 values) | — (none; `Supported` requires evidence review) | — (no behavior exists to evidence) | Not Implemented |
| REQ-STATE-007 | §11.6 1583–1593; §8.15 1344 | V1 | — (planned: `permission_status`, 9 values) | — (none; public-domain-documented needs a basis) | — (no rights statement supplied for any of the 82 assets) | Blocked by Owner Input |
| REQ-STATE-008 | §11.8 1603–1607 | V1 | — (planned: `processingState`) | — (none; display only when all four conditions met) | — (no behavior exists to evidence) | Not Implemented |
| REQ-STATE-009 | §11.10 1625–1634 | V1 | — (planned: `inquiryState`, 8 values) | — (none; PII retention + role restriction) | — (no behavior exists to evidence) | Not Implemented |

---

## 11. Bilingual EN/AR and RTL → REQ-I18N

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-I18N-001 | §10.1 1440–1443; Directive 198–200 | V1 | `src/app/[locale]/` exists since 2 Nov 2026 with locales `en` and `ar` resolved in `src/domain/locale.ts`; no per-locale content exists | — (none; Playwright both locales) | Measured: 15 `page.tsx` under the locale segment, 16 built routes, and the running server answers `<html lang="ar" dir="rtl">` for `/ar` and a `200` for `/en` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). Playwright has never launched, no locale holds a published record, and the requirement is a tested bilingual experience — so the row stays Not Implemented | Not Implemented |
| REQ-I18N-002 | §4.2 408; G.9 3844; Directive 200 | V1 | `src/domain/routes.ts` (the §4.2 registry) plus `src/app/[locale]/**` — the locale-prefixed route map exists as a shell since 2 Nov 2026 | — (none; route tests per locale) | Measured: unit tests over the registry (14 assertions in `routes.test.ts`, 4 in `entry-routing.test.ts`) and HTTP facts from the running server — `/` answers `307` to `/en`, `/en` and `/ar` answer `200`, `/en/nope` answers `404` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). Prefixing and resolution are real; the published-record half of the route map, per-locale canonicals and hreflang are not, so the row does not move | Not Implemented |
| REQ-I18N-003 | §10.3 1453; ADR-008 | V1 | — (planned: per-locale editorial + publication state) | — (none; EN published while AR unpublished) | — (Payload `experimental.localizeStatus` deliberately rejected — D-02) | Not Implemented |
| REQ-I18N-004 | §10.2 1447; Directive 202 | V1 | — (planned: independent per-locale authoring) | — (none; same facts, independent phrasing) | — (no behavior exists to evidence) | Not Implemented |
| REQ-I18N-005 | §10.3 1457–1461 | V1 | — (planned: unavailable-in-language notice + explicit action) | — (none; never silent substitution; no unreviewed machine translation) | The shell's `unpopulated` notice in `src/ui/page-shell.tsx` is not this row's notice: it says the route holds no published records in any locale, not that a record exists in one language and not the other. Per-locale availability needs `PublicationRecord`, which needs the absent data layer, so substitution cannot be tested yet — and cannot happen either, because there is nothing to substitute | Not Implemented |
| REQ-I18N-006 | §10.5 1473–1481; Directive 203; Standard §8 212 | V1 | — (planned: RTL primitives, CSS logical properties, `dir="rtl"`); `src/ui/*.module.css` and `src/ui/styles/global.css` use logical properties only, and `src/app/[locale]/layout.tsx` sets `dir` from the segment | — (none; forms/tables/metadata/breadcrumbs/drawers/viewers/nav in RTL) | A UI exists as of 2 Nov 2026 — three CSS modules, one global stylesheet and the shell components — and it serves `lang`/`dir` correctly for `/ar`. What does not exist is the surface list this row names: no form, table, breadcrumb, drawer or viewer has been built, and no RTL composition has been tested or measured. Not Implemented is the honest status for the requirement, not for the directory | Not Implemented |
| REQ-I18N-007 | §10.7 1489–1499; §10.2 1449 | V1 | — (planned: `translationState`, 7 values, stale-source invalidation) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-I18N-008 | §10.4 1465–1469 | V1 | `src/app/[locale]/layout.tsx` renders the switcher and `src/domain/routes.ts` holds `switchTarget()` — the selector exists as a shell; no preference is persisted | — (none; no unrelated-homepage redirect) | Measured 2 Nov 2026: `switchTarget()` refuses to derive a target without the record identity (asserted in `routes.test.ts`), and the served `/en` carries the eight primary-navigation destinations plus a utility band holding Search and the sibling-locale link to `/ar` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`, `src/app/[locale]/layout.tsx`). The shipped behaviour is the documented interim: the switcher moves to the sibling locale's entrance, because page preservation needs published-translation availability that does not exist until Phase 2. Persisted preference and the tested no-redirect invariant are absent | Not Implemented |
| REQ-I18N-009 | §10.8 1505–1514; §10.6 1485; Directive 204 | V1 | — (planned: controlled terminology store) | — (none; natural English, preserved original names) | approved vocabulary lists are editorial/Owner content — none supplied | Blocked by Owner Input |

---

## 12. SEO and indexing → REQ-SEO

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-SEO-001 | §19.11 2995+; §10.9 1518; Directive 207; G.9 3846–3847 | V1 | — (planned: `src/app/[locale]/**/metadata.ts`); routes exist since 2 Nov 2026 and each page exports `metadata` with the registry title only | — (none; localized title/description/canonical/OG) | Measured: no `metadata.ts`, `sitemap.ts` or `robots.ts` file exists under `src/` (`find src -name sitemap* -o -name robots* -o -name metadata*` → 0); `src/app/[locale]/layout.tsx` line 44 sets `robots: { index: false, follow: false }`, and the served head carries `noindex, nofollow` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). That is the deliberate refusal to index an unapproved shell — the opposite of this row's localized-title/canonical/OG obligation, so the row stays Not Implemented | Not Implemented |
| REQ-SEO-002 | G.9 3848–3849; Directive 207 | V1 | — (planned: hreflang generator) | — (none; reciprocal + published-only; none to missing translations) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SEO-003 | G.9 3854–3855; Directive 207 | V1 | — (planned: sitemap + robots generators) | — (none; only canonical published indexable routes; drafts/private/restricted/preview/inquiries noindexed) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SEO-004 | G.9 3856; Standard §13 300 | V1 | — (planned: structured-data validator gate) | — (none; rejects invented address/hours/legal status/ratings/prices/product data) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SEO-005 | G.9 3850–3852, 3857 | V1 | — (planned: redirect table + locale-preserving canonicals) | — (none; no chains/loops) | — (no behavior exists to evidence) | Not Implemented |
| REQ-SEO-006 | G.9 3858 | V1 | — (planned: `tests/e2e/seo-routes.spec.ts`) | — (none; automated coverage of every locale switch, canonical, hreflang, sitemap entry, redirect) | Still absent where it is named: `tests/` holds only `tests/setup/env.ts`, and no `tests/e2e/` directory exists. The unit tests that do live in `src/domain/` (4 files, 34 assertions, exit 0 measured 2 Nov 2026) cover the route registry and the language switcher in code, not the SEO surface over HTTP, and Playwright has never run | Not Implemented |

---

## 13. Search and discovery → REQ-SRCH

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-SRCH-001 | §9.1 1406 | V1 | — (planned: partial index predicate keyed to publication+rights+access dimensions) | — (none) | — (no index exists) | Not Implemented |
| REQ-SRCH-002 | §9.1 1410 | V1 | — (planned: exclusion list at index construction) | — (none; drafts, private curatorial notes, private provenance docs, permission files, inquiries, user records never indexed) | — (no index exists) | Not Implemented |
| REQ-SRCH-003 | §9.2 1414; ADR-006; Standard §3.3 116 | V1 | — (planned: `pg_trgm` GIN + native FTS) | — (none; capitalization/spacing/punctuation tolerance) | — (no index exists; no project database exists — PostgreSQL has run only inside the disposable A.5 container on 1 Nov 2026, never through this project's `pnpm db:up`) | Not Implemented |
| REQ-SRCH-004 | §9.2 1415–1420; §9.3 1424–1426 | V1 | `src/app/[locale]/search/page.tsx` — the planned route exists as a shell since 2 Nov 2026; it queries nothing | — (none; typed results, conditional filters, chronology guard, 4 distinct empty states) | The route builds and is a navigation destination served from `/en` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`); `src/domain/rights.ts` is the fail-closed eligibility gate in code, and it denies all 82 assets in the library's recorded state. No typed result, filter, chronology guard or indexed search has ever executed, and the page says so in its own body. A route without an index is not discovery | Not Implemented |
| REQ-SRCH-005 | ADR-006; Standard §2.2 | V1 | — (planned: absent by design — no Elasticsearch/Meilisearch in V1) | — (none; dependency guard) | Measured 2 Nov 2026 against the installed tree, term by term so no cell needs an escaped pipe: `grep -ci elasticsearch`, `grep -ci meilisearch` and `grep -ci typesense` each return **0** in `package.json` and **0** in `pnpm-lock.yaml` — not merely no top-level entry, but no mention anywhere. The absence is real now that something is installed, and it is still unguarded — the dependency check this row names has not been written | Not Implemented |
| REQ-SRCH-006 | §9.4 1430; §2.7 327 | Future | — (out of V1 by spec) | — (n/a) | ADR-007 keeps the vector dimension un-adoptioned until a model is selected and tested | Out of V1 Scope |

---

## 14. Public experience → REQ-PAGE

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-PAGE-001 | §6.1 542+; §4.2 412; §4.5 449+ | V1 | `src/app/[locale]/page.tsx` — the planned file exists as a shell since 2 Nov 2026; `src/ui/page-shell.tsx` is its renderer | — (none) | `/en` answers `200` and its served headings are §6.1's required items 1–8 in baseline order (`docs/ROUTE_RUNTIME_EVIDENCE.txt`); the page carries the `unpopulated` notice and no record. Structure without content is §6.1's own rule against filling space, so the row stays Not Implemented | Not Implemented |
| REQ-PAGE-002 | §6.2 590+; §4.2 413 | V1 | `src/app/[locale]/the-museum/page.tsx` — exists as a shell since 2 Nov 2026 | — (none) | `/en/the-museum` answers `200` with 10,725 bytes of shell (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). No institution fact is rendered, because the Owner has supplied none (OID-01 legal identity, location and history still Outstanding). Not Implemented is about the content and its sources, not the URL | Not Implemented |
| REQ-PAGE-003 | §6.3 606–632 | V1 | `src/app/[locale]/worlds/page.tsx` — exists as a shell since 2 Nov 2026 | — (none) | The route is built and served in the navigation set; no world opens, because zero country records exist and `src/domain/rights.ts` denies every asset in the library's recorded state. The requirement is that the directory opens only genuinely ready worlds — nothing is ready, and the shell renders accordingly | Not Implemented |
| REQ-PAGE-004 | §6.4 634+; G.4 3727 | V1 | `src/app/[locale]/worlds/[country-slug]/page.tsx` — exists as a shell since 2 Nov 2026; the slug parameter is the planned detail route | — (none) | `src/ui/detail-page.tsx` validates the slug and an unrecognised one reaches `notFound()` before render, proved for the artifact route by HTTP (`/en/artifacts/BAD_SLUG` → 404) and for the registry by unit test (34 assertions, exit 0). No country world page has content to show, so the §6.4 behaviour set is unevidenced | Not Implemented |
| REQ-PAGE-005 | §6.5 652+, §6.6 673+ | V1 | `src/app/[locale]/collections/page.tsx` and `collections/[collection-slug]/page.tsx` — both exist as shells since 2 Nov 2026 | — (none) | Routes build and answer; zero collection records exist, so no count, no curation rule and no Rare Pieces treatment (ADR-031 makes it an editorial treatment inside Collections, never a route) can be evidenced. The shell states its own emptiness rather than inventing a collection | Not Implemented |
| REQ-PAGE-006 | §6.7 696–727 | V1 | `src/app/[locale]/artifacts/[artifact-slug]/page.tsx` — exists as a shell since 2 Nov 2026 | — (none; 14 required behaviors + prohibited content scan 725) | Measured 2 Nov 2026: `/en/artifacts/valid-slug` answers `200` from the empty-state branch and `/en/artifacts/BAD_SLUG` answers `404` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). That is the refusal behaviour and nothing else — no artifact field, no verification statement, no prohibited-content scan over a real record exists, because no record exists | Not Implemented |
| REQ-PAGE-007 | §6.7 722–723; Directive 177 | V1 | — (planned: badge component + derivation from claims/rights/authenticity) | — (none; **"Verified" badge must not imply authenticity or ownership established**; publication ≠ authenticity, line 722) | — (no behavior exists to evidence) | Not Implemented |
| REQ-PAGE-008 | §6.8 729+; §19.7 2946–2953 | V1 | — (planned: `src/ui/image-viewer/`) | — (none; documentary detail preserved) | — (no component exists) | Not Implemented |
| REQ-PAGE-009 | §6.9 752+; §6.10 785+; §6.11 822+; §6.12 838+; §6.13 856+; §6.14 876+ | V1 | `src/app/[locale]/{stories,curator,about,contact,search}/page.tsx` — all five planned routes exist as shells since 2 Nov 2026, plus `privacy/` and `terms/` | — (none) | All five are in the 16-route build and appear as served navigation destinations from `/en` (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). None carries the behaviour its section requires: no story record, no curator answer, no inquiry form, no indexed search result. The Curator page states in its own body that no model, index or prompt boundary is configured | Not Implemented |
| REQ-PAGE-010 | §5.1 475+, §5.2 490+, §5.4 510+, §5.5 514+, §5.6 518+; Directive 116 | V1 | `src/ui/layout.module.css`, `src/ui/page-shell.tsx`, `src/ui/detail-page.tsx` — the planned `src/ui/layout/` directory does not exist; the layout lives as three files under `src/ui/` | — (none; every visible control performs a defined action — no decorative buttons) | Measured 2 Nov 2026: `/en` serves 8 distinct primary-navigation destinations, the §4.1 count, and Home is `/en` itself; the utility band carries search; `dir` follows the locale. No visual audit, no interaction test and no approved design system (BA-001…BA-007, OD-16) exist, so the no-decorative-control rule is argued from the served markup, not proven by a test | Not Implemented |

---

## 15. Control Center — the 20 canonical modules → REQ-CC

Canonical module map: §15.6 lines 2182–2201, declared *"the only canonical module map"* at line 2203. Acceptance gates:
G.8 lines 3800–3823. Directive §14 Phase 6 line 267 requires all twenty with "genuine screen behavior". Common screen
contract §15.7 2205+, global states §15.8 2225+, shared interaction contract G.8.1 3827+.

| ID | Source (module · lines) | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-CC-001 | 01 Executive Overview · §15.6 2182; §16.1 2259; G.8 3804 | V1 | — (planned: `src/app/control-center/overview/`) | — (none; every metric derives from actual records; "unavailable" is not zero) | — (no screen exists) | Not Implemented |
| REQ-CC-002 | 02 Website & Page Studio · §15.6 2183; §16.2 2285–2341; G.8 3805 | V1 | — (planned: `src/app/control-center/pages/`) | — (none; 13 block types; section removal keeps referenced data; template impact disclosed) | **blocked by an unresolved model gap, not by progress:** §8.2 lines 1032–1051 contain no `Page` entity although line 1372 uses it as a relation target — see §27 F-02. No screen and no model row exist | Not Implemented |
| REQ-CC-003 | 03 Brand & Visual Identity Studio · §15.6 2184; §16.3 2343; G.8 3806 | V1 | — (planned: `src/app/control-center/brand/`) | — (none; only approved assets/tokens) | — (no screen exists) | Not Implemented |
| REQ-CC-004 | 04 Museum Worlds Management · §15.6 2185; §16.4 2377; G.8 3807 | V1 | — (planned: `src/app/control-center/worlds/`) | — (none; six worlds exist as records; Morocco first) | — (no screen exists) | Not Implemented |
| REQ-CC-005 | 05 Collections Management · §15.6 2186; §16.5 2402; G.8 3808 | V1 | — (planned: `src/app/control-center/collections/`) | — (none; counts use eligible published artifacts) | — (no screen exists) | Not Implemented |
| REQ-CC-006 | 06 Artifact Management · §15.6 2187; §16.6 2419–2471 (A–K); G.8 3809 | V1 | — (planned: `src/app/control-center/artifacts/`) | — (none; union of §16.6 A–K and G.8 sources + ownership/authenticity) | — (S-12 resolution recorded in `MASTER_SPECIFICATION.md`; no screen exists) | Not Implemented |
| REQ-CC-007 | 07 Stories & Editorial Studio · §15.6 2188; §16.7 2480; G.8 3810 | V1 | — (planned: `src/app/control-center/stories/`) | — (none) | — (no screen exists) | Not Implemented |
| REQ-CC-008 | 08 Media & Asset Library · §15.6 2189; §16.8 2492; G.8 3811 | V1 | — (planned: `src/app/control-center/media/`) | — (none; original preserved, derivatives traceable, usage map) | audit evidence exists (82 SHA-256) but no screen does | Not Implemented |
| REQ-CC-009 | 09 AI Curator Command Center · §15.6 2190; §16.9 2510–2552; G.8 3812 | V1 | — (planned: `src/app/control-center/curator/`) | — (none; registry, reindex, policy, test console, evaluation queue, version/rollback, privacy) | — (no screen exists) | Not Implemented |
| REQ-CC-010 | 10 Navigation & Footer Studio · §15.6 2191; §16.10 2554; G.8 3813 | V1 | — (planned: `src/app/control-center/navigation/`) | — (none; destination validator; private routes blocked) | — (no screen exists) | Not Implemented |
| REQ-CC-011 | 11 SEO & Metadata Center · §15.6 2192; §16.11 2562; G.8 3814 | V1 | — (planned: `src/app/control-center/seo/`) | — (none; canonical/hreflang preview, sitemap/robots status) | — (no screen exists) | Not Implemented |
| REQ-CC-012 | 12 Language & Translation Center · §15.6 2193; §16.12 2572; G.8 3815 | V1 | — (planned: `src/app/control-center/translation/`) | — (none; stale-source alerts, locale publish gate) | — (no screen exists) | Not Implemented |
| REQ-CC-013 | 13 Forms & Inquiries Center · §15.6 2194; §16.13 2582; G.8 3816 | V1 | — (planned: `src/app/control-center/inquiries/`) | — (none; PII role-restricted, retention/deletion) | — (no screen exists) | Not Implemented |
| REQ-CC-014 | 14 Users, Roles & Permissions · §15.6 2195; §16.14 2592; G.8 3817 | V1 | — (planned: `src/app/control-center/access/`) | — (none; server-enforced authorization; positive **and** negative cases for all 20 modules, Standard §4.2 153) | — (no screen exists) | Not Implemented |
| REQ-CC-015 | 15 Publishing & Revision Control · §15.6 2196; §16.15 2600; G.8 3818 | V1 | — (planned: `src/app/control-center/publishing/`) | — (none; compare revisions, approve/return/reject, emergency withdrawal) | — (no screen exists) | Not Implemented |
| REQ-CC-016 | 16 System & Institutional Settings · §15.6 2197; §16.16 2612–2624; G.8 3819 | V1 | — (planned: `src/app/control-center/settings/`) | — (none; line 2624 boundary enforced) | — (no screen exists) | Not Implemented |
| REQ-CC-017 | 17 Analytics & Insights · §15.6 2198; §16.17 2626; G.8 3820 | V1 | — (planned: `src/app/control-center/analytics/`) | — (none; metrics identify source, window, method) | — (no screen exists; no invented metrics permitted, Standard §15 334) | Not Implemented |
| REQ-CC-018 | 18 Notifications & Alerts · §15.6 2199; §16.18 2634; G.8 3821 | V1 | — (planned: `src/app/control-center/alerts/`) | — (none; alerts originate from actual detected conditions) | — (no screen exists) | Not Implemented |
| REQ-CC-019 | 19 Audit & Activity Center · §15.6 2200; §16.19 2647; G.8 3822 | V1 | — (planned: `src/app/control-center/audit/`) | — (none; append-only to ordinary application roles) | — (no screen exists; no `audit_event` table exists) | Not Implemented |
| REQ-CC-020 | 20 Archive & Recovery Center · §15.6 2201; §16.20 2666; G.8 3823 | V1 | — (planned: `src/app/control-center/recovery/`) | — (none; restore permission-checked, creates a new event) | — (no screen exists) | Not Implemented |

---

## 16. Identity, authorization, sessions → REQ-AUTH

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-AUTH-001 | Standard §4.1 132; §8.16 1350 | V1 | — (planned: Payload `auth.strategies` consuming a maintained OIDC-compatible provider, per ADR-025; no custom crypto in this repository) | — (none) | Standard §15 330 bans homemade crypto; ADR-025 records the mechanism decision, including that Payload's own auth docs (read 31 Oct 2026) list cookies/JWT/API keys and no MFA option | Not Implemented |
| REQ-AUTH-002 | Standard §4.1 134; Directive 224 | V1 | — (planned: second factor enforced by the identity provider per ADR-025; local staff passwords disabled, one audited break-glass Owner account. This row formerly planned `src/payload/plugins/mfa` — that path is rejected by ADR-025 and its Rejected list, so the plan is corrected here rather than left to mislead Module 14) | — (none; MFA required for Owner + privileged; negative test owed: first factor without second yields no session) | — (no user exists; no IdP instance exists — B-05, OID-19) | Not Implemented |
| REQ-AUTH-003 | Standard §4.1 136–141 | V1 | — (planned: Argon2id params; rate limits on login/reset/verify) | — (none) | — (no auth surface exists) | Not Implemented |
| REQ-AUTH-004 | Standard §4.2 147–150; §17.1 2680+ | V1 | — (planned: `src/lib/server/access/`) | — (none; deny by default; server check per operation; no client-supplied role/state/locale/ID; IDOR) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AUTH-005 | Standard §4.2 153 | V1 | — (planned: `tests/e2e/access-matrix.spec.ts`) | — (none; positive + negative for **all twenty modules**) | — (no test exists) | Not Implemented |
| REQ-AUTH-006 | Standard §4.2 151; §17.5 2791+ | V1 | — (planned: role/action matrix §17.3 2738+, §17.4 2764+) | — (none; evidence review separated from publication) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AUTH-007 | §17.6 2804–2808; G.7 3769+ | V1 | — (planned: protected Owner-change flow + audit) | — (none; ordinary admins cannot downgrade the Owner) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AUTH-008 | Standard §4.3 159; §5 179 | V1 | — (planned: cookie/session config + re-auth on sensitive actions) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AUTH-009 | Standard §4.2 155 | Future (optional defense) | — (not adopted; `docs/DATA_MODEL.md` §8 item 11) | — (none; would require testing as the runtime role) | Standard permits but does not require RLS | Out of V1 Scope |

---

## 17. AI Curator governance → REQ-AI

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-AI-001 | Standard §7 197; §14.4 1987; Directive 213; ADR-017 | V1 | — (planned: `src/lib/server/ai/retrieval-gateway.ts`) | — (none; permission filter applied **before** the model, not after generation) | — (no retrieval path exists) | Not Implemented |
| REQ-AI-002 | §14.4 1980–1985 | V1 | — (planned: eligibility predicate over `PublicationRecord` + rights + `aiKnowledgeEligibility`) | — (none) | — (no records exist to gate) | Not Implemented |
| REQ-AI-003 | Standard §7 199; §14.3 1976; §9.1 1410; Directive 213 | V1 | — (planned: exclusion at query construction) | — (none; inquiries, PII, credentials, private notes, drafts, restricted artifacts, internal control data excluded) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AI-004 | Standard §7 200–201; §14.8 2023+ | V1 | — (planned: untrusted-document handling + injection defenses) | — (none; retrieved docs are data, never instructions) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AI-005 | Standard §7 202; §14.5 1991+ | V1 | — (planned: citation binding per claim) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AI-006 | Standard §7 203; §14.6 2005+ | V1 | — (planned: uncertainty expression from `claimReviewState`) | — (none; `Misstates Uncertainty` is the class that makes this testable — S-13) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AI-007 | §14.9 2029+; §11.11 1640–1650 | V1 | — (planned: 9 AI response states incl. refusal/fallback) | — (none; never invent a response to keep conversational flow) | — (no behavior exists to evidence) | Not Implemented |
| REQ-AI-008 | §14.13 2085–2093; S-13 | V1 | — (planned: `src/domain/ai/evaluation.ts`) | — (none; 9 classes) | resolution recorded in `docs/MASTER_SPECIFICATION.md` §2 S-13 | Not Implemented |
| REQ-AI-009 | §14.13 2095; ADR-017 | V1 | — (planned: release gate in CI) | — (none; unauthorized disclosure / fabricated provenance-ownership-authenticity = release-blocking) | — (no gate exists) | Not Implemented |
| REQ-AI-010 | Standard §7 204; §14.14 2097–2099; §16.9 2540 | V1 | — (planned: `tests/ai/red-team/`) | — (none; restricted-source disclosure, malicious docs, prompt injection, citation mismatch, hallucination) | — (no test exists) | Not Implemented |
| REQ-AI-011 | §14.11 2049+; §14.10 2043+; Directive 215; Standard §7 205–206; §2.6 315 | V1 | — (planned: escalation, retention controls, provider adapter, config versioning) | — (none; AI cannot approve/verify/publish its own content) | provider credentials + model choice depend on an approved hosting/provider commitment (Standard §13 304) | Blocked by Owner Input |

---

## 18. Asset governance → REQ-AST

Evidence base: `docs/ASSET_INVENTORY_AUDIT.csv` (82 rows) and `docs/asset-audit-summary.json`.

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-AST-001 | Directive 190; A.2–A.8 3323–3448 | V1 | `docs/ASSET_INVENTORY_AUDIT.csv` | `node scripts/audit-assets.mjs` | **82 catalog entries parsed (72 + 10), per-category expected = parsed for all of A.2 = 12, A.3 = 18, A.4 = 3, A.5 = 11, A.6 = 10, A.7 = 18, A.8.1 = 6, A.8.2 = 4; `catalogParseDrift: []`** | Implemented and Verified |
| REQ-AST-002 | Directive 192 | V1 | `docs/ASSET_INVENTORY_AUDIT.csv` (one row per expected asset) | assert required columns present per row | 82/82 rows carry path, presence, format, dimensions, size, SHA-256, rights state, approval state, intended use, actual use. Physical result: **71 PRESENT + 1 WRONG_FORMAT of the original 72; 10/10 PRESENT of the requested 10** | Implemented and Verified |
| REQ-AST-003 | A.10 3463 | V1 | — (planned: `src/payload/collections/MediaAsset.ts`) | — (none; full 26-item metadata list enforced at record level) | audit CSV records a subset (filename, type, MIME, dimensions, size, checksum, source/creator, rights, approval, intended/actual usage, derivative status, alt text); **color profile, original filename, license, permitted uses, restrictions, expiry, focal point, responsive variants, associated entity, revision history are not yet recorded anywhere** | Partially Implemented |
| REQ-AST-004 | A.11 3467–3469; S-10 | V1 | — (planned: `src/domain/asset-states/`) | — (none; auditable transitions; no averaged completion percentage) | current lifecycle stage is recorded per asset in the audit CSV (rights/approval/usage), but auditable transitions require the absent DB | Partially Implemented |
| REQ-AST-005 | §13.3 1870–1891 | V1 | — (planned: `assetReadinessState`, 18 values) | — (none; not collapsed into a "complete" flag) | — (no schema exists) | Not Implemented |
| REQ-AST-006 | Directive 194 ("Never overwrite originals"); ADR-014; Standard §6 192–193 | V1 | `scripts/audit-assets.mjs` (writes only into `docs/`) | `node scripts/preflight.mjs` checksum re-verification | preflight 31 Oct 2026: **PASS — "all 82 audited assets match their recorded SHA-256"**; `reference/` fingerprinted: 7 files in `docs/REFERENCE_INTEGRITY.json` | Implemented and Verified |
| REQ-AST-007 | Directive 194; Standard §6 193; §8.14 1318; §8.18 1386 | V1 | — (planned: `src/lib/server/media/derivatives/`) | — (none; original↔derivative lineage) | **lineage already broken for `NDM-AST-073…082`**: `_manifest.json` names source PNGs (e.g. `world_morocco_hero_16x9_1793387944337_307329d3.png`) that are absent from the workspace — recorded in the audit CSV Notes column | Not Implemented |
| REQ-AST-008 | §13.2 1858; §8.14 1311; §19.8 2964 | V1 | — (planned: `MediaAsset.alt_text_en/alt_text_ar`) | — (none; meaningful public images require alt text) | audit CSV: **`Alt Text Status = Not Recorded` for 82/82** | Blocked by Owner Input |
| REQ-AST-009 | §8.15 1344; §11.6 1593; §13.6 1918+; Standard §13 302 | V1 | — (planned: `RightsRecord` + approval workflow) | — (none; nothing public without a cleared right for that use) | audit CSV: **72/72 original assets `Rights Status = UNKNOWN — no rights statement supplied in reference/`; 10/10 requested assets `Awaiting Rights Review`; 82/82 `Not Approved — no approval record supplied`; 82/82 `Actual Usage = None — no application code exists yet (src/ is empty)`** — quoted as the file records them, generated 1 Nov 2026. The usage value holds on 2 Nov 2026 for a different reason: `src/` is no longer empty and still serves no asset, because `grep` over `src/**` finds no path into `Noujoude.photo/` and no image pipeline exists; the generator's parenthetical is stale wording, tracked in REQ-TRUTH-006 | Blocked by Owner Input |
| REQ-AST-010 | §13.8 1939+; audit findings | V1 | — (planned: checksum-based duplicate detection) | — (none) | 18 filename/pixel mismatches measured (`asset-audit-summary.json` `namePixelMismatches`, e.g. `NDM-AST-001` declares 1024px, is 512×512); 1 wrong-format (`NDM-AST-041 vintage_collector_desk_16x9.jpg`); 3 uncatalogued files found; `physicalFileCount: 85` vs 82 catalogued — measured, unresolved | Partially Implemented |

---

## 19. The 10 AI-generated quarantined assets → REQ-ASTQ

These are Appendix A.8 (`world_*` heroes 3433–3438, `collection_*` 3444–3447). Physically they exist **only inside the
quarantine folder** `Noujoude.photo/_pending_review_AI_generated/`, never in the primary library. Their own manifest
records `approval_state: "Pending Human Approval"` and `rights_state: "Awaiting Rights Review"`
(`_manifest.json` lines 21–23 per object). **Human approval and a rights decision are Owner-side inputs**
(Standard §13 lines 296–304; §21.3 line 3207+). They therefore trace to **Blocked by Owner Input**, never to
"Implemented" — presence of a file is not integration (§23 item 18 line 3307; §13.3 line 1891; Directive 194).
§13.5 line 1916 is binding: they are *"illustrative country/category visuals, not evidence of actual objects in the
collection"*, and line 1914 requires them to be labelled as AI-generated illustrative visuals where used.

| ID | Source (asset · catalog line) | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-ASTQ-073 | `NDM-AST-073 world_morocco_hero_16x9.webp` · A.8.1 3433 | V1 | — (quarantined: `Noujoude.photo/_pending_review_AI_generated/…`; **no integrated path exists**) | — (none; blocked until human approval + rights decision) | audit CSV row 073: PRESENT in quarantine only, `Awaiting Rights Review`, `Not Approved`, `ai_generated=true` in `_manifest.json`; source PNG absent | Blocked by Owner Input |
| REQ-ASTQ-074 | `NDM-AST-074 world_egypt_hero_16x9.webp` · 3434 | V1 | — (quarantined, as above) | — (none) | audit CSV row 074, same field states | Blocked by Owner Input |
| REQ-ASTQ-075 | `NDM-AST-075 world_syria_hero_16x9.webp` · 3435 | V1 | — (quarantined, as above) | — (none) | audit CSV row 075 | Blocked by Owner Input |
| REQ-ASTQ-076 | `NDM-AST-076 world_mauritania_hero_16x9.webp` · 3436 | V1 | — (quarantined, as above) | — (none) | audit CSV row 076 | Blocked by Owner Input |
| REQ-ASTQ-077 | `NDM-AST-077 world_libya_hero_16x9.webp` · 3437 | V1 | — (quarantined, as above) | — (none) | audit CSV row 077 | Blocked by Owner Input |
| REQ-ASTQ-078 | `NDM-AST-078 world_sudan_hero_16x9.webp` · 3438 | V1 | — (quarantined, as above) | — (none) | audit CSV row 078 | Blocked by Owner Input |
| REQ-ASTQ-079 | `NDM-AST-079 collection_first_day_covers_4x3.webp` · 3444 | V1 | — (quarantined, as above) | — (none) | audit CSV row 079 | Blocked by Owner Input |
| REQ-ASTQ-080 | `NDM-AST-080 collection_coins_4x3.webp` · 3445 | V1 | — (quarantined, as above) | — (none) | audit CSV row 080 | Blocked by Owner Input |
| REQ-ASTQ-081 | `NDM-AST-081 collection_artifacts_4x3.webp` · 3446 | V1 | — (quarantined, as above) | — (none) | audit CSV row 081 | Blocked by Owner Input |
| REQ-ASTQ-082 | `NDM-AST-082 collection_souvenirs_4x3.webp` · 3447 | V1 | — (quarantined, as above) | — (none) | audit CSV row 082 | Blocked by Owner Input |

**Group rule (`DC`):** none of these ten may appear in public UI, sitemap, search index or AI retrieval until
`approval_state` and `rights_state` are resolved by a human decision, and each use must carry the AI-generated label
required by §13.5 line 1914. Their `asset_id`s are reserved and never renumbered (ADR-013).

---

## 20. Accessibility → REQ-A11Y

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-A11Y-001 | §19.8 2957; Standard §8 210; Directive 228; G.2 3680 | V1 | — (planned: whole application, public + Control Center) | — (none; axe-core in CI per Standard §8 212 + manual audit records) | Pages exist since 2 Nov 2026 — 16 routes, `/en` and `/ar` answering `200` with `lang` and `dir` set by the segment — and that is the whole of the accessibility evidence: **no axe run has ever executed**, no manual audit record exists, and the Control Center half has no screen at all. Presence of a page is not an accessible page | Not Implemented |
| REQ-A11Y-002 | §19.8 2961–2973 | V1 | `src/ui/page-shell.tsx`, `src/ui/detail-page.tsx`, `src/ui/layout.module.css` — the primitives exist as shells; the planned set in §19.8 does not | — (none; landmarks, keyboard, focus, names, alt, contrast, announcements, modals/viewers, targets, no color-only info, reduced motion) | What the shell already does, read from the files: a `main` landmark in `src/app/[locale]/layout.tsx`, logical properties throughout the CSS, and a reduced-motion override in `src/ui/styles/global.css`. What is unevidenced: no keyboard or focus test, no contrast measurement, no alt text anywhere (0 of 82 assets recorded), no viewer, modal or announcement. One row of the checklist is not the checklist | Not Implemented |
| REQ-A11Y-003 | §10.5 1473–1481; §19.8 2972 | V1 | — (planned: RTL a11y test suite) | — (none; RTL and LTR testing) | The Arabic tree renders and declares `dir="rtl"` over HTTP (measured 2 Nov 2026), and 4 unit files assert locale direction in code — but no accessibility test suite exists in either direction, Playwright has never launched, and `tests/` still holds only `tests/setup/env.ts` | Not Implemented |
| REQ-A11Y-004 | Standard §8 212; §12 item 6 273 | V1 | — (planned: CI job; its records are to be written into `docs/TEST_AND_RELEASE_REPORT.md`, which exists but holds no accessibility result yet) | — (none; automation supplements, never replaces, manual review) | Standard §15 line 336 *"No silent downgrade of RPO/RTO, accessibility, performance, or security requirements."* is the standing constraint; `docs/TEST_AND_RELEASE_REPORT.md` records accessibility automation (§1 row 8) and the manual WCAG audit (§1 row 17) as **`Not run`**, which is the honest state | Not Implemented |

---

## 21. Performance → REQ-PERF

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-PERF-001 | §19.6 2936–2940; Standard §9 218–220; Directive 229; G.2 3681 | V1 | — (planned: Lighthouse/field measurement in CI) | — (none; **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75**) | line 2942 + G.2 3681: these are *targets, not measured current results*. **No measurement exists.** Reporting any number now would breach Standard §15 334 | Not Implemented |
| REQ-PERF-002 | Standard §9 222 | V1 | — (planned: `tests/perf/`; the routes named as measurement targets now exist as shells) | — (none; Home, The Museum, Country World, Collection, Artifact Detail, Story, Search, Control Center) | 7 of the 8 named surfaces are built routes (`docs/ROUTE_RUNTIME_EVIDENCE.txt` records `/en`, `/ar`, `/en/the-museum`, `/en/artifacts/valid-slug`); Control Center does not exist, and no field or lab measurement of any kind has been taken. Response bytes on a loopback port are not a Core Web Vitals reading | Not Implemented |
| REQ-PERF-003 | §19.7 2946–2953; Standard §9 224 | V1 | — (planned: responsive image pipeline + `focal_point`) | — (none; reserved dimensions, lazy loading, hero preload, documentary detail preserved) | — (no pipeline exists; zero derivatives produced) | Not Implemented |
| REQ-PERF-004 | §2.6 304–305; §3.3 383+; §2.7 331 | Future | — (out of V1 by spec) | — (n/a) | public visitor accounts / saved collections are excluded and `user_account_1024.webp` authorizes nothing (A.9 3455) | Out of V1 Scope |

---

## 22. OpenTelemetry and monitoring → REQ-TELE

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-TELE-001 | G.10 3862; Standard §10 228; Directive 227; G.2 3682 | V1 | — (planned: `src/lib/server/telemetry/`) | — (none; traces + metrics + structured logs, OTLP-compatible export) | — (no instrumentation exists) | Not Implemented |
| REQ-TELE-002 | G.10 3866–3868; Standard §10 233–239 | V1 | — (planned: instrument request paths, DB, Payload hooks, jobs, media, search, AI, integrations) | — (none; minimum service indicators) | — (no signals emitted) | Not Implemented |
| REQ-TELE-003 | G.10 3872 | V1 | — (planned: correlation IDs across boundaries) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-TELE-004 | G.10 3873–3876; Standard §10 241 | V1 | — (planned: redaction/masking filter) | — (none; no passwords, secrets, tokens, private artifact data, full inquiry messages, raw AI prompts) | — (no behavior exists to evidence) | Not Implemented |
| REQ-TELE-005 | G.10 3879; G.11 3883 | V1 | — (planned: telemetry backend + alert routing choice) | — (none; documented before production) | backend selection is a provider/cost commitment reserved to the Owner (Standard §13 304; §19.10 2991) | Blocked by Owner Input |

---

## 23. Backup, recovery and service objectives → REQ-OPS

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-OPS-001 | G.11.1 3887–3889; Directive 230 | V1 | — (planned: availability probe) | — (none; homepage + representative content route + admin auth boundary, no private data exposed) | 99.5% monthly objective is an **engineering target, not a claim**; Standard §15 336 bans silent downgrade | Not Implemented |
| REQ-OPS-002 | G.11.2 3895; Directive 231; Standard §11 249 | V1 | — (planned: backup pipeline) | — (none; **DB RPO ≤ 1 h / RTO ≤ 4 h**, encrypted + PITR/WAL) | — (no database exists; nothing backed up) | Not Implemented |
| REQ-OPS-003 | G.11.2 3896; Directive 232; Standard §11 250 | V1 | — (planned: object storage versioning + protected deletion) | — (none; **media RPO ≤ 4 h / RTO ≤ 8 h**) | — (no object storage exists; `storage_key` column is a design contract only) | Not Implemented |
| REQ-OPS-004 | G.11.2 3897; Standard §11 251 | V1 | — (planned: config/deploy artifact protection) | — (none; RPO ≤ 24 h / RTO ≤ 4 h) | — (no deployment exists) | Not Implemented |
| REQ-OPS-005 | G.11.3 3901–3902; Standard §11 256 | V1 | — (planned: retention policy) | — (none; 35 daily / 12 weekly / 12 monthly recovery points) | — (no recovery point exists) | Not Implemented |
| REQ-OPS-006 | G.11.3 3904–3905; Standard §11 258; ADR-005 | V1 | — (planned: isolated backup identity) | — (none; not reachable from CMS credentials or the Control Center) | Corrected wording for what has and has not run: `scripts/db/init-roles.sh` **has** executed — twice, inside the disposable A.5 container on 1 Nov 2026 (`docs/A5_PRIVILEGE_EVIDENCE.txt`) — and **never** through this project's provisioning path, so no `ndm_backup` role exists in a database this project owns. The earlier reading on this row, that the script never executed at all, is superseded by that transcript | Not Implemented |
| REQ-OPS-007 | G.11.3 3906–3908; Standard §11 259–260; Directive 233 | V1 | — (planned: quarterly restore test + pre-migration test) | — (none; record date, dataset, measured RPO/RTO, integrity checks, failures, reviewer) | **Master Spec line 3908 verbatim: "A backup job reporting success is not proof of recoverability; only a tested restore is acceptable evidence."** Zero restore tests performed | Not Implemented |
| REQ-OPS-008 | G.11 3883; §19.10 2991; Standard §11 262 | V1 | — (planned: provider feasibility record) | — (none; feasibility proven before production) | hosting/storage provider and cost are Owner commitments (Standard §13 304) — none supplied. No SLA may be published from the internal objective | Blocked by Owner Input |

---

## 24. Truth, anti-fabrication and honesty rules → REQ-TRUTH

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-TRUTH-001 | Directive 318; Directive §15 290 | V1 | — (planned: this register + release evidence pack) | — (none; every "done" claim must cite a passing test) | Directive 290 verbatim: a route/component/button/schema field/migration/build alone is not proof. This row is the register testing itself: on 2 November 2026 `pnpm build` exited 0 over 16 routes and `vitest run` exited 0 on 34 assertions, and **no row of this register moved on that account**. **Claim-versus-artifact defect found by the post-closure motion batch:** that batch committed with a message saying the SHA-256 manifest had been regenerated and landed, while the regenerated file had never been staged, so the commit carried the closure-time copy and the working tree held the other. A message describing an artifact the commit does not contain is the same failure class as a build cited as proof, so the repair is a new commit that leaves the false sentence visible in history rather than an amendment that erases it, and the rule taken from it is that the digest manifest is regenerated last, after every gate run, and that status output is read before the message is written | Not Implemented |
| REQ-TRUTH-002 | Standard §15 334; §16.17 G.8 3820 | V1 | — (planned: analytics + metric provenance fields) | — (none; rejects invented metrics, compliance claims, backup success claims) | — (no behavior exists to evidence) | Not Implemented |
| REQ-TRUTH-003 | Directive 319, 321; Standard §13 296–306; §1.5 166+; §21.1 3178+ | V1 | `docs/OWNER_INPUT_REGISTER.md` — the file this row planned as *not yet created* has existed since 31 October 2026 and was current on 2 November 2026 | — (none; unapproved facts never reach public output) | Directive 321 bans generic mock data as final visitor content; Standard 306: implement workflows + placeholders, keep unapproved facts out of public output. The register records 0 of 20 owner facts on 1 November and, on 2 November, two partially supplied rows (OID-01, OID-02) — the Arabic name only, its approval half still Outstanding. What is absent is enforcement: no check stops an unapproved fact reaching a page, though the shell today renders no fact at all | Not Implemented |
| REQ-TRUTH-004 | Directive 320 | V1 | — (planned: no seeded fake records) | — (none) | seed plan is explicitly *structure only* (`docs/DATA_MODEL.md` §9 step 8) | Not Implemented |
| REQ-TRUTH-005 | §23 items 11–13, 19 3300–3302, 3308 | V1 | — (planned: state derivation) + `src/ui/page-shell.tsx` and `src/ui/detail-page.tsx` for the honest empty-state half, both real since 2 Nov 2026 | — (none; published ≠ verified; illustrative imagery ≠ proof; missing content shown honestly) | The empty-state half now has files: the shell renders the `unpopulated` notice, refuses to print a record it was not given, and answers an unknown slug with 404 rather than a placeholder (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). The derivation half — published vs verified vs exhibition state computed from records — has nothing to derive from: no `PublicationRecord`, no claims, no rights row exists. The requirement is the derivation, so the row stays where it is | Not Implemented |
| REQ-TRUTH-006 | §23 items 18 3307; §13.3 1891; A.9 3459 | V1 | — (planned: asset state separation) | — (none) | measured: 82/82 assets carry `Actual Usage = None — no application code exists yet (src/ is empty)` in `docs/ASSET_INVENTORY_AUDIT.csv` as generated 1 Nov 2026 — presence is not integration. **Scope note, 2 Nov 2026:** the field value is still true (no asset is served anywhere; `grep` over `src/` finds no path into `Noujoude.photo/`), but the generator's parenthetical is now stale wording, because `src/` holds 32 files. Re-stamping it means re-running `scripts/audit-assets.mjs`, which rewrites the CSV and is outside this batch | Implemented and Verified |
| REQ-TRUTH-007 | §23 items 15–16 3304–3305 | V1 | — (planned: permission+audit+reversibility on every critical operation) | — (none) | — (no behavior exists to evidence) | Not Implemented |
| REQ-TRUTH-008 | Standard §15 336; Directive 326 | V1 | — (planned: change-control + ADR requirement) | — (none) | every conflict found so far was logged before it was decided, and then decided on the record: **S-01…S-15** in `docs/MASTER_SPECIFICATION.md` §2, **D-01…D-04** in `docs/ARCHITECTURE_DECISIONS.md` §4, the four modelling findings **F-01…F-04** in this register's §27 + `docs/DATA_MODEL.md` §8 (each closed by ADR-021…ADR-024, decisions recorded *after* the findings were written up, never in place of them), and the audit-privilege conflict **§2.4 finding 2** closed by ADR-019, whose design evidence was produced on 1 November 2026 in the disposable A.5 container (`docs/A5_PRIVILEGE_EVIDENCE.txt`, exit 0) while its proof against this project's own database is still owed | Implemented and Verified |

---

## 25. Testing and release gates → REQ-TEST

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-TEST-001 | Standard §12 269–280 (12 required checks) | V1 | `vitest.config.ts` (executed 2 Nov 2026), `playwright.config.ts` (authored, still unexecuted), `.github/workflows/ci.yml` (authored, never run) | — (none; all 12 checks) | Config files are not evidence (Directive §15 290), and the picture is now mixed rather than empty: Vitest runs and passes — 4 files, **34** assertions over `src/domain/` — while Playwright has never launched and `tests/` still contains only `tests/setup/env.ts`. Standard §12's twelve checks stand at **3 of 12** as measured in `docs/IMPLEMENTATION_PLAN.md` Level B on 2 Nov 2026; this row asks for all twelve | Not Implemented |
| REQ-TEST-002 | §20.2 3007+; §20.4 3053+; Directive §15 282–288 | V1 | `docs/REQUIREMENTS_TRACEABILITY.md` (this file) | — (none; register completeness vs §20.4 matrix) | 221 rows carrying the exact Directive §15 column set, re-measured 2 November 2026 with the command printed in §1: **221 table rows, 221 distinct IDs, status tally 166 Not Implemented / 24 Implemented and Verified / 19 Blocked by Owner Input / 8 Partially Implemented / 4 Out of V1 Scope**. The 31 October reading — 219 rows and the tally 23/5/167/20/4 — is kept as the baseline it measured; `REQ-BRAND-007` and `REQ-BRAND-008` are the two rows added since | Implemented and Verified |
| REQ-TEST-003 | §20.5 3118+; §20.6 3133+; G.12 3914–3929 | V1 | — (planned: release-gate pipeline) | — (none; publication checklist + release gates) | — (no release exists) | Not Implemented |
| REQ-TEST-004 | Directive §15 292 | V1 | — (planned: per-module acceptance + negative-permission suites) | — (none; every completed module passes its own acceptance **and** negative-permission tests) | — (no module exists) | Not Implemented |
| REQ-TEST-005 | Standard §5 163; Directive 223; G.12 3924 | V1 | — (planned: ASVS control mapping) | — (none; ASVS 5.0.0 Level 2 baseline, extra controls for privileged functions) | — (no security verification has run) | Not Implemented |
| REQ-TEST-006 | Standard §12 281; §15 335; Directive 325 | V1 | — (planned: deploy approval gate) | — (none) | no production target exists; no deployment has occurred. Standard 281: *"Do not use mock functionality as release evidence."* | Not Implemented |

---

## 26. Required documentation output → REQ-DOC (Directive §16, lines 298–310)

| ID | Source | V1/F | Implementation location | Test(s) | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-DOC-001 | Directive 298 | V1 | `docs/MASTER_SPECIFICATION.md` | `node scripts/copy-master-spec.mjs` reproducibility + `scripts/check-docx-alignment.mjs` | verbatim copy with provenance (SHA-256 `5b30b21e…`, 3,942 lines) + §2 discrepancy log resolving S-01…S-15 formally, body unmodified | Implemented and Verified |
| REQ-DOC-002 | Directive 299 | V1 | `docs/ARCHITECTURE.md` (NDM-ARCH-001 v0.1.0) | — (none; must stay truthful to implemented state) | exists; its Status line declares the application layer an initialized, executed **shell** and not a product — 32 files / 1,752 lines in `src/`, typecheck, lint and tests at exit 0, `pnpm build` emitting 16 routes and `pnpm start` answering probes, with no content, no Payload configuration, no collections, no migrations, no database and no Control Center. The line's earlier reading, `contract only, with zero implementation`, is kept inside ARCHITECTURE.md as the baseline it was written against. This row documents the architecture that is actually implemented, which at this baseline is a shell | Implemented and Verified |
| REQ-DOC-003 | Directive 300 | V1 | `docs/ARCHITECTURE_DECISIONS.md` | re-query the official sources listed in its §1 | 33 ADRs (ADR-001…ADR-033, re-counted 2 Nov 2026 with `grep -c '^### ADR-'` = 33; ADR-026…ADR-033 record the Owner-approved defaults granted in the final Directive §1) + verified compatibility matrix + D-01…D-04 | Implemented and Verified |
| REQ-DOC-004 | Directive 301 | V1 | `docs/DATA_MODEL.md` | — (none; reconcile against generated schema when migrations exist) | 25-entity inventory, field contracts, 8 state dimensions, cardinality, index/constraint plan, migration plan — every row marked a design contract | Implemented and Verified |
| REQ-DOC-005 | Directive 302 | V1 | `docs/REQUIREMENTS_TRACEABILITY.md` | — (none; row-count + status assertions recomputed from the table body) | this document; Directive §15 column set reproduced exactly | Implemented and Verified |
| REQ-DOC-006 | Directive 303 | V1 | `docs/IMPLEMENTATION_PLAN.md` (NDM-PLAN-001 v0.1.0) | — (n/a) | exists; its Status line declares "No item below this line is evidence of implemented behaviour" | Implemented and Verified |
| REQ-DOC-007 | Directive 304 | V1 | `docs/OWNER_INPUT_REGISTER.md` (NDM-OWNER-INPUT-001 v0.1.0) | — (n/a) | the register document exists and is the required deliverable, **but it contains no owner facts, because none have been supplied**. The facts themselves remain outstanding — every row that depends on them stays Blocked by Owner Input | Partially Implemented |
| REQ-DOC-008 | Directive 305 | V1 | `docs/ASSET_INVENTORY_AUDIT.csv` | `node scripts/audit-assets.mjs` | physical verification for **all 82 catalog entries** (72 + 10), SHA-256 per file | Implemented and Verified |
| REQ-DOC-009 | Directive 306 | V1 | `docs/SECURITY_AND_PERMISSIONS.md` (NDM-SEC-001 v1.0.0) | — (none; controls require named passing tests before any status rises) | exists and declares **"CONTRACT — UNIMPLEMENTED … None is a satisfied control"** — so it does not lift a single REQ-SECB or REQ-AUTH row above Not Implemented | Implemented and Verified |
| REQ-DOC-010 | Directive 307 | V1 | `docs/AI_CURATOR_GOVERNANCE.md` (NDM-AI-GOV-001 v1.0.0) | — (n/a) | exists and declares "no AI Curator, no retrieval layer, no provider, no model, no index, no test" — REQ-AI rows stay Not Implemented | Implemented and Verified |
| REQ-DOC-011 | Directive 308 | V1 | `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` (NDM-MED-001 v1.0.0) | — (n/a) | exists and declares "No asset in this project is production-ready, rights-cleared, approved, optimized, integrated or verified" | Implemented and Verified |
| REQ-DOC-012 | Directive 309 | V1 | `docs/TEST_AND_RELEASE_REPORT.md` (NDM-QA-001 v0.1.0) | — (n/a; its §9 lists the four commands that re-produce every figure in its §1) | exists and declares **"No application has been tested, because no application exists"**; its §1 holds only command-produced environment/audit measurements and its §2 records corrections. Verified as the required deliverable only — it lifts no REQ-TEST row and provides no application test evidence | Implemented and Verified |
| REQ-DOC-013 | Directive 310 | V1 | `docs/CHANGELOG.md` | — (n/a) | exists; opens with **"Nothing in this file is a released version"** (`package.json` is `0.0.0`, no artefact published, no deployment) and separates *executed with transcript* from *authored but unexecuted*. Verified as the required deliverable only — no repository is initialized (`ARCHITECTURE_DECISIONS.md` §7 row 6), so it records no release | Implemented and Verified |

---

## 27. Conflicts found beyond S-01…S-15 and D-01…D-04

Recorded here and in `docs/DATA_MODEL.md` §8 so they are not resolved silently inside a migration. They were
reported first, before deciding — and each is now **decided by an ADR**, listed in the Resolution column
below. No source line was rewritten to make a decision convenient: `reference/` stays byte-identical
(`docs/REFERENCE_INTEGRITY.json`), and every resolution is this project's own record.

**Relationship to the governing logs.** `docs/MASTER_SPECIFICATION.md` §2 now carries **S-01…S-15** (S-15, the
status-vocabulary conflict between Appendix C lines 3586–3597 and Directive §15 line 288, was added after this
register's first pass) and `docs/ARCHITECTURE_DECISIONS.md` now carries **ADR-001…ADR-033** (ADR-018 fixes the
Markdown master as the implementation authority, verified against the DOCX; ADR-019 … ADR-024 are the decisions
below, and ADR-025 is the identity/MFA mechanism decision that closes coverage hole H-3 — it is not one of the
F-01…F-04 modelling resolutions). **ADR-026 … ADR-033 were added 2 November 2026** and record the Owner-approved
defaults of the final Directive §1 — the token layer and CSS Modules, motion-engine ownership in two parts with
plain CSS for simple transitions, Lenis deferred, Rare Pieces as an editorial treatment rather than a route, the
`brand/` tree preserved and quarantined, and security documentation extended in place. F-01…F-04 remain
**distinct from both sets**: none of them is recorded as an
S-row or a D-row, and they were found by modelling work rather than by comparing the two supplied masters.

| Finding | Evidence | Why it is not already logged | Resolution |
|---|---|---|---|
| **F-01 — Era↔Artifact cardinality conflict.** | §8.7 line 1155 declares singular `era_id`; §8.17 line 1366 permits "Many-to-one **or many-to-many** according to documented periods". | S-05 covers Media↔Rights and S-06 covers Country; neither reaches Era. A singular column cannot carry the many-to-many branch the canonical rules allow. | **Decided — ADR-021.** `ArtifactEra` join relation is authoritative; `era_id` is kept as specified but reclassified as a derived display/sort projection. Same mechanism as ADR-012. |
| **F-02 — `Page` is a modelled relation target but not an entity.** | §8.17 line 1372 names `Page` as a MediaAsset usage target; §16.2 lines 2285–2341 specify a page directory, 13 section block types, section controls and shared-template impact; §8.2 lines 1032–1051 contain no `Page`, and §8 gives it no field table. | No S-row or D-row addresses it. The register therefore marked REQ-CC-002 "Not Implemented" — the gap is structural, not a matter of progress — rather than inventing an entity. | **Decided at the model level — ADR-022.** `Page` / `PageSection` / `Template` are first-class, each field traced to a §16.2 line; publication state stays in `PublicationRecord` (ADR-008). REQ-CC-002 stays "Not Implemented" until routes, migrations and tests exist — a decided model is not an implemented feature. |
| **F-03 — Review-decision authority is duplicated between `ArtifactClaim` and `VerificationReview`.** | §8.11 lines 1259 and 1261 require each claim to store "Current review status" and "Reviewer and review timestamp"; §8.2 line 1041 defines `VerificationReview` as "a review decision on a claim or defined set of claims". No precedence is stated. | Structurally identical to S-02 (which resolved only publication state). Two candidate sources of truth for a review decision; unresolved. | **Decided — ADR-023.** `VerificationReview` holds the decision; the two claim fields are transactional projections and are refused if written directly. Mirrors the S-02/ADR-008 precedent. |
| **F-04 — `ProvenanceEvent ↔ Source` has no canonical cardinality.** | §8.12 line 1282 requires provenance events to carry "Supporting source/evidence links"; §8.17 line 1370 routes Artifact↔Source exclusively through ArtifactClaim/ClaimEvidence and states "Sources support claims, not merely the artifact in the abstract", but gives `ProvenanceEvent ↔ Source` no row in the canonical table. | The §8.17 table is presented as canonical; a required link with no canonical rule is a gap, and S-rows cover neither provenance nor this pair. | **Decided — ADR-024.** `ProvenanceSourceLink` (many-to-many, controlled `role` list) supports the *event*; asserting a claim about the artifact still requires `ArtifactClaim`/`ClaimEvidence`, so line 1370's routing rule is preserved rather than bypassed. |

**Re-test note (F-01…F-04):** the four ADRs close the *decision* half of each finding; none of them is a
model implementation. Re-test in Phase 2 by inspecting the produced migration and the constraint tests — the
singular `era_id` must exist and be derived, `Page` must exist as a collection with the §16.2 block union, a
direct write to a claim's review projection must be refused, and `ProvenanceSourceLink` must carry its
controlled role list. Until then these rows are "decided, unmodelled", not "done".

---

## 28. Maintenance rules

1. One row per testable requirement. A row moves to "Implemented and Verified" **only** with a named passing test and
   a re-runnable command in the Evidence column (Directive §15 290, §17 318).
2. A prohibition (REQ-COMM, REQ-SECB) is not "Verified" merely because nothing exists to violate it; it verifies when
   the enforcing guard/test exists and passes.
3. Any row whose status changes must cite the change's ADR or migration (Standard §3.4 121; §23 item 20 line 3309).
4. New conflicts are appended to §27 and to `docs/DATA_MODEL.md` §8 — never folded quietly into code.
5. Regenerate counts from the table body; do not hand-maintain the §1 totals.
