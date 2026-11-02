# Changelog

All notable changes to the Noujoude Digital Heritage Museum build are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Nothing in this file is a released version.** `package.json` remains at `0.0.0`, no artefact has been
published, and no deployment has occurred. Everything below is therefore `[Unreleased]` by construction,
not by convention.

**Truth rule applied to this changelog.** Directive §17 line 318 forbids claiming a feature is implemented
without verifying behaviour; Directive §15 line 290 states that a route, component, button, schema field,
migration or successful build is not proof. Each entry below therefore distinguishes *executed with
transcript* from *authored but unexecuted* from *planned*. Corrections of earlier claims are recorded in
§C rather than being quietly restated.

---

## [Unreleased]

### A. Phase 0 — physical audit and integrity baseline (executed)

**Added — asset audit tooling.** `scripts/audit-assets.mjs` (dependency-free Node; parses the Appendix A
catalog from `reference/Noujoude_Asset_and_Brand_Requirements_EN.md`, reads each file's magic bytes, decodes
WebP/JPEG/PNG/GIF dimensions without a decoder library, computes SHA-256, and cross-checks every catalogued
filename against the 8,174-line traceability CSV). Exposed as `pnpm audit:assets`. It writes only into
`docs/` and is read-only against `reference/` and `Noujoude.photo/` (ADR-014).
It does **not** decide rights, approval, suitability or usage; it records what the filesystem says.

**Added — audit outputs.**
- `docs/ASSET_INVENTORY_AUDIT.csv` — 82 rows × 20 columns, using exactly the column set named by Asset
  Requirements §10 line 218, one row per expected asset including the ones absent from disk.
  Measured content: 71 `PRESENT` + 1 `WRONG_FORMAT` among the original 72; all 10 additional assets present
  but confined to `_pending_review_AI_generated/`; per-category parse drift `[]`;
  18 name/pixel mismatch notes; 3 uncatalogued files; 85 physical files, 6,467,873 bytes.
  Values written into those columns by the tool: `Source/Creator` = *Not supplied in any reference document*
  on all 82 rows, `Actual Usage` = *None — no application code exists yet (src/ is empty)* on all 82, and
  `Derivative Status` = *Original (no derivatives produced)* on all 82. These are this project's own recorded
  findings, not quotations from any reference document.
- `docs/asset-audit-summary.json` — machine summary of the same run.
- Recorded limitation, not hidden: Appendix A's per-row "Source line" values (3779–3937) are locators into an
  original inventory file that was **not** supplied; line 3779 of the specification itself is AI-Curator text.
  Verification was performed against the traceability CSV instead — 82/82 names confirmed verbatim (S-11).

**Added — reference integrity baseline.** `docs/REFERENCE_INTEGRITY.json` fingerprints all 7 files in
`reference/` with SHA-256 and byte size, captured at `2026-10-30T23:31:40.689Z`, explicitly labelled
"First capture… any later DRIFT means an original was modified". This converts "we did not edit the
references" from an assertion into a re-checkable claim. It does not protect against deletion of a file
outside the baseline set.

**Added — DOCX↔Markdown alignment tool and verdict.** `scripts/check-docx-alignment.mjs` parses the DOCX's
ZIP local headers directly and inflates `word/document.xml` with `node:zlib` — no npm dependency was
installed to produce this evidence — then compares heading sets, vocabulary sets and paragraph containment.
Output: `docs/DOCX_MD_ALIGNMENT.json`. Measured verdict **ALIGNED**: 337/337 Markdown headings located in the
DOCX; 0 DOCX requirement vocabulary absent from the Markdown; 0 Markdown word types absent from the DOCX;
0 substantive paragraph misses; 3 non-contiguous paragraphs, all hyperlink-reflow (WCAG, Core Web Vitals,
ASVS reference blocks); inputs hashed as `5b30b21e…47ecd5` (MD, 242,312 B) and `69ccb03e…f71283`
(DOCX, 142,645 B). Excluded items — the Word-generated "Table of Contents" label and the YAML front matter —
are listed individually so a reviewer can disagree with the classification.
This is the measured basis for discrepancy **S-14** / **ADR-018** (two masters supplied, no stated precedence).

**Not established by Phase 0:** that any asset is licensed, approved, fit for use or integrated; that the
specification is correct; that any implementation exists.

### B. Phase 1 — architecture decisions and configuration (authored; almost nothing executable)

**Added — `docs/ARCHITECTURE_DECISIONS.md`.** Contains the re-verified compatibility matrix and the decision
records. Its §1 method table names the official source queried for each version claim (npm registry
`dist-tags` + per-version manifests, Payload installation and localization docs, postgresql.org versioning,
the Node.js release index, plus local `node -v`/`pnpm -v`/`git --version`/`docker --version`), so no version
in it is inherited from the Standard's 30 October pass (discrepancy **D-04**).
Verified set: `payload` / `@payloadcms/db-postgres` / `@payloadcms/next` / `@payloadcms/richtext-lexical` /
`@payloadcms/plugin-cloud-storage` **3.92.1** (exact-version peers, so they move as one set); `next` **16.4.3**
(within the adapter peer `>=16.3.3 <17.0.0`); `react`/`react-dom` **19.3.1**; `sharp` **0.35.5**;
`zod` **4.6.7**; `graphql ^16.8.1`; PostgreSQL **18.6**; Node **24.22.2** target. Explicitly rejected with
reasons: `payload@4.0.0-beta.6`, the `internal`/`internal-debug` tags, `drizzle-orm@1.0.0-beta.22` and
`1.0.0-rc.5`, pre-release React/Next builds, Node 27 alpha.
**§5 is a *candidate* pinned set, not an installed state**; `pnpm-lock.yaml` does not exist.

**Added — four documented discrepancies against official sources** (§4 of the ADR file), logged rather than
silently absorbed: **D-01** the Standard's "`16.2.6+`" Next.js floor contradicts the adapter's actual peer
range `>=16.3.3 <17.0.0`; **D-02** per-locale publication status is only natively available behind
`experimental.localizeStatus`, which Standard §2.3/§15 forbid in production; **D-03** Docker daemon
reachability, initially unresolved after a timeout, re-tested and PASSING (server reachable, Compose 5.3.1),
with the `postgres:18.6-alpine` pull still unattempted; **D-04** the Standard's compatibility evidence is one
day stale and this document is the mandated refresh.

**Added — ADR-001 … ADR-017**, covering modular monolith; single Drizzle-backed schema authority with Prisma
prohibited; Node 24.22.2 as a prerequisite rather than an install step; PostgreSQL 18.6 via Compose bound to
`127.0.0.1:5432` only; four separate database roles; PostgreSQL FTS + `pg_trgm` with no external search
engine; **no `pgvector` and rejection of the `VECTOR(768)` figure**; per-locale publication state as an
explicit `PublicationRecord` instead of an experimental flag; eight separate namespaced state dimensions
because "No single 'status' field may be used" (line 1524); six country exhibition states;
`OwnershipStatement`/`AuthenticityAssessment`/`ConditionReport` as first-class entities; Media↔Rights as a
join plus `ArtifactCountryRelationship`; the project-issued `NDM-AST-###` ID scheme; the repository layout
including the declared new `scripts/` directory; Payload Jobs with no separate worker; sanitized Lexical; and
permission-gated AI retrieval. **ADR-018** (Markdown as implementation authority, on measured evidence) was
added by the parallel documentation workstream at 01:56 on 31 October and is counted here so the ADR total is
not quietly 17 in one file and 18 in another.

**Added — working copy of the product specification.** `docs/MASTER_SPECIFICATION.md`, generated by
`scripts/copy-master-spec.mjs` (also exposed as `pnpm docs:spec-copy`). Header: provenance with both source
and companion-DOCX SHA-256, the alignment verdict, and the discrepancy/conflict log **S-01 … S-15**.
Body: the specification copied verbatim, byte-checked against the source on every regeneration.
It does **not** rewrite the source: the original stays untouched under `reference/`, the header states
"Do not edit this file", and each resolution is a recorded decision rather than an edit. S-15 was added on
31 October by the parallel workstream, extending the original 14-row log.

**Added — repository configuration, authored and statically validated but never executed:**
- `package.json` — v `0.0.0`, `private`, `type: module`; `engines.node ">=24.22.1 <25"` so a wrong runtime
  fails fast; `packageManager: pnpm@11.21.0`; 22 scripts including `prepare:check`, `dev`, `build`, `start`,
  `typecheck`, `lint`, `lint:fix`, `format`, `test`, `test:watch`, `test:e2e`, `test:a11y`, `payload`,
  `generate:importmap`, `generate:types`, `migrate:create`, `migrate`, `db:up`, `db:down`, `db:status`,
  `audit:assets`, `audit:docx-alignment`, `docs:spec-copy`. Dependency pins mirror §5 of the ADR file.
  **It installs nothing.** `audit:assets` is a physical file inventory and `audit:docx-alignment` is a
  document comparison — neither is a dependency vulnerability scan; no dependency or secret scanner is
  configured (hole H-4 in `docs/IMPLEMENTATION_PLAN.md`).
- `tsconfig.json` — strict plus `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`, `exactOptionalPropertyTypes`, `useUnknownInCatchVariables`,
  `forceConsistentCasingInFileNames`; `@/*` → `./src/*`, `@generated/*` → `./src/generated/*`;
  **excludes `reference`, `Noujoude.photo` and `docs`** from compilation. Never consumed by `tsc`.
- `eslint.config.mjs` — flat config; `no-explicit-any`, `no-unsafe-assignment/-call/-member-access` and
  unused-vars all set to `error`, with two documented narrow `off` exceptions. Never loaded by ESLint.
- `vitest.config.ts` — unit at `src/**/*.test.ts(x)`, integration at `src/**/*.integration.ts`,
  `passWithNoTests: false` so an empty suite cannot produce a false green, coverage excluding generated types.
- `playwright.config.ts` — four projects: `en-desktop` (1440×900), `ar-desktop-rtl` (baseURL `/ar`),
  `en-mobile` (Pixel 7), `ar-mobile-rtl` (iPhone 13) — RTL is tested on mobile too; `retries: 2` in CI and 0
  locally so negative-permission tests cannot be flaked away; six invariants recorded in the file, headed by
  the no-commerce assertion. Never driven a browser.
- `docker-compose.yml` — **local development only, never a production definition**; `postgres:18.6-alpine`,
  named volume, `pg_isready` healthcheck, all credentials injected from `.env` with `:?` guards, port published
  on `127.0.0.1:5432` only. Never started; image never pulled.
- `.env.example` — four separate database role passwords, migration-vs-runtime connection URIs kept distinct,
  private/public bucket split, AI provider behind a server-side adapter, OTLP endpoint, backup target and
  retention numbers. All provider values are empty. `.env` itself does not exist (preflight WARN).
- `.gitignore` — ignores secrets and build output; **migrations are deliberately not ignored** (they are
  source, Standard §3.4) while `src/generated/payload-types.ts` is ignored as derived; carries an explicit
  note that no ignore rule may ever hide a change under `reference/` or `Noujoude.photo/`.
- `src/README.md` — states that `src/` is intentionally empty at the end of Phase 1, that it is not evidence
  of a working product, the planned layout, and the two rules that bind every future file there.
- `tests/setup/env.ts` — a fixture guard that injects inert test-only environment values, forces
  `AI_CURATOR_ENABLED=false`, blanks storage credentials, and makes any integration test without
  `NDM_ALLOW_INTEGRATION=1` fail loudly rather than touch the development database.

**Added — four-role database bootstrap.** `scripts/db/init-roles.sh`, mounted into the container's
`docker-entrypoint-initdb.d`, idempotent, creating `ndm_migration` (DDL, schema owner), `ndm_runtime`
(DML only, no CREATE, not superuser), `ndm_reporting` (read-only) and `ndm_backup` (login + replication).
**Verified only by `sh -n` syntax check (exit 0)** *at the time this entry was written — superseded by §J: the
script has since run inside the A.5 harness's throwaway container, and a connection attempt has been refused as
`ndm_runtime`.* It has never run; the privilege boundaries it describes
are unproven until a connection attempt is actually refused as `ndm_runtime`.

**Added — preflight gate.** `scripts/preflight.mjs`, wired to `prepare:check`, checking seven things: Node
against `engines`, pnpm against `packageManager`, `.env` presence, Docker daemon reachability, `reference/`
against the integrity baseline, every audited `Noujoude.photo/` file against its recorded SHA-256, and `src/`
state. Executed; **exit 1** on the Node line. It is a guard rail against installing half a tree on the wrong
runtime and against editing originals, not a test of application behaviour.

### C. Corrections — earlier claims superseded by later measurement

Recorded rather than restated quietly, because this build's value depends on its evidence trail being
re-runnable and self-critical.

1. **Preflight summary changed three times; the tally alone hides why.**
   `docs/ARCHITECTURE_DECISIONS.md` §7.1 holds the first transcript: `7 checks: 1 FAIL, 2 WARN, 4 PASS`
   including `WARN | src/ | empty — application not yet scaffolded`. A second window measured
   `7 checks: 1 FAIL, 1 WARN, 5 PASS` (`src/README.md` existed; Docker answered normally, `compose: 5.3.1`).
   The **current** reading is again **`7 checks: 1 FAIL, 2 WARN, 4 PASS`** — same tally as the first, for a
   different reason: the Docker check now reports `WARN | daemon did not answer within 20 s` (**B-09**) and
   `.env` is still absent. This entry previously asserted that the middle transcript superseded the first and
   that "the only FAIL remains B-01" settled the matter; that presentation treated Docker's PASS as stable.
   It was not. Full cross-tabulation of the three states is `docs/TEST_AND_RELEASE_REPORT.md` §2.1, and the
   consequence is recorded as blocker B-09 in ARCHITECTURE_DECISIONS §7.2.
2. **A byte count that is not a byte count.** `scripts/copy-master-spec.mjs:265` prints
   `${written.length} bytes` from a UTF-8-decoded string, so the figure is a **UTF-16 code-unit count**.
   Measured at the same instant: printed `255,492 "bytes"` versus `257,024` actual UTF-8 bytes on disk.
   The widely quoted `251,245 bytes` inherits the same mislabelling. The `body byte-identical to source: YES`
   verdict is unaffected — it is a line-by-line comparison. Recommended fix: `Buffer.byteLength(…, 'utf8')`;
   not applied in this documentation-only batch.
3. **Regenerated artefacts drift; the protected content does not.** Within one window
   `docs/MASTER_SPECIFICATION.md` regenerated at 4,042 → 4,069 → 4,070 lines and 14 → 15 discrepancy rows,
   because the parallel workstream was extending the row list inside the generating script. Throughout, the
   verbatim body stayed byte-identical and the source SHA-256 stayed
   `5b30b21eaf6d6457b10b80e0ba48bc511c106db484336934b8e06d34ae47ecd5`. Rule adopted: cite the specification by
   **source** line number, never by line number in the generated copy.
4. **Audit re-runs rewrite `generatedAt`.** `docs/asset-audit-summary.json` and
   `docs/DOCX_MD_ALIGNMENT.json` now carry later timestamps (`2026-10-31T00:13:16.077Z`,
   `2026-10-31T00:12Z`-window alignment pass) with **identical measured content** — which is the point of a
   deterministic tool. The cross-document staleness noted here — `docs/DATA_MODEL.md` declaring it governs
   "ADR-001 … ADR-017" while the ADR file held 18 — has since been closed by re-measurement rather than by
   editing prose: `grep -c '^### ADR-' docs/ARCHITECTURE_DECISIONS.md` now returns **24**, and every count
   claim in DATA_MODEL, ARCHITECTURE §0, REQUIREMENTS_TRACEABILITY, SECURITY_AND_PERMISSIONS,
   OWNER_INPUT_REGISTER and IMPLEMENTATION_PLAN was re-checked against that output in the §G batch. The
   re-count itself is the lesson: the first recount attempt used `REQ-[A-Z]+-\d+` and reported 206
   traceability rows; the register's real IDs include `I18N` and `A11Y`, so `REQ-[A-Z0-9]+-\d+` is the
   correct pattern and the measured answer is **219 rows / 219 unique IDs**. A wrong regex nearly manufactured
   a defect that did not exist.
5. **Two numbers tightened against the raw evidence, not left as approximations.**
   "Every `_1024` asset is 512×512" is *nearly* right and was restated precisely: **18** catalogued filenames
   contain `_1024`, **0** of them reach 1024 px — 16 measure 512×512, `logo_stacked_vertical_1024x1536`
   measures 341×512, `logo_wordmark_1024x768` measures 512×384. The `WRONG_FORMAT` file
   `NDM-AST-041 vintage_collector_desk_16x9.jpg` was characterised exactly: `.jpg` extension, magic bytes
   `RIFF….WEBP`, real MIME `image/webp`, 512×290, SHA-256 `155be122…c13f6b1`.
6. **No earlier overstatement of capability was found that needs deleting.** Specifically, nothing in Phase 0/1 claimed a
   passing test, a licensed asset, an approved AI visual, a working database or a compliance posture, so no
   such claim is being retracted — the corrections above are measurement drift and a mislabelled unit, not
   retractions of capability claims. Stated positively, so it is not misread as a hidden fix: **no source
   document claimed anything was built.**
7. **This window minted a duplicate blocker ID and removed it.** The container-engine failure was written into
   `docs/ARCHITECTURE.md`, `docs/TEST_AND_RELEASE_REPORT.md`, `docs/CHANGELOG.md` and four other documents as
   **B-03** — which `docs/IMPLEMENTATION_PLAN.md` §2 already defines as the `.env` blocker. The collision was
   found while refreshing the plan's gate table, not by a tool: nothing in this workspace validates that
   identifier namespaces stay unique across documents. Resolution: the engine blocker is now **B-09**, the
   register's next free ID. **31 references across seven documents** were re-pointed (`grep -o` counted:
   ARCHITECTURE 5, ARCHITECTURE_DECISIONS 5, CHANGELOG 4, TEST_AND_RELEASE_REPORT 11,
   SECURITY_AND_PERMISSIONS 3, DATA_MODEL 2, REQUIREMENTS_TRACEABILITY 1), and every genuine `.env`/B-03 row
   was left alone, as were the unrelated `RB-03` and `RB-09` risk IDs. §2 gained a B-09 row with its own
   *who acts* and *verification of release* columns, plus an ID-hygiene note recording the rule this project
   will follow from now on: **§2 is the authority for what a blocker ID means; no other document may mint
   one.**
8. **A generated CSV still asserts that `src/` is empty, and this batch did not regenerate it.**
   `scripts/audit-assets.mjs` writes one literal into the `Actual Usage` column of every row it produces, so
   `docs/ASSET_INVENTORY_AUDIT.csv` carries that same sentence on **82 of 82** rows (measured:
   `grep -c "no application code exists yet" docs/ASSET_INVENTORY_AUDIT.csv` → 82 against `wc -l` → 83 lines
   including the header, each row stamped `2026-11-01`). It was true when the tool wrote it and it is false now:
   §P measures `src/` at 32 files and 1,752 lines. The remedy is a tool change plus a re-run, never a hand-edit of
   a generated file — hand-correcting the CSV would be erased by the next run and would make it disagree with its
   own generator, which is exactly the failure §O avoids by putting the brand inventory in a separate file.
   Reported here because the rule of this section is that a claim invalidated by later measurement is recorded
   rather than quietly restated; repairing it needs a file this batch does not own.
9. **The acceptance score moved because the evidence did, and one published row was wrong about its own
   computation.** v0.2.0 of `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` was adopted on 2 November 2026 and published
   **4.1 / 100**. After the closure window executed the lint gate, the typecheck, the unit suite and the
   production build over real files, the recalculated figure is **5.45 / 100, level L3** — the entire delta being
   three QA-07 rows that gained the ability to fail, each credited at a half because the evidence is host-class,
   and `S` unchanged at 0.70. The 4.1 reading stays in that document's §14 as the number published at adoption and
   is not edited. Two self-corrections belong to the same record: §7A's L3 row printed **5.5** while §9 computed
   5.45, and §9 with §9.1 is the computation of record; and the single-number presentation that let 4.1 be read
   both as *the documents are nearly done* and as *the product nearly works* is what §7A's four levels exist to
   make impossible.
10. **A line count and a file permission that this host cannot verify.** `docs/OWNER_INPUT_REGISTER.md` recorded
    OD-3's `.env` as 93 lines with mode `0600`. Re-measured 2 November 2026 with counting commands only — no value
    read, no value printed — the file is **92** lines by both `wc -l` and `awk 'END{print NR}'`, with its 5,212
    bytes, 38 keys and 14 deliberately empty provider values unchanged; the byte size is identical, so the older
    figure was a counting difference, not a changed file. The permission claim is withdrawn rather than corrected:
    POSIX mode bits over NTFS on this host report `644` for a file whose real access control list the tool cannot
    show, so *mode 0600* was never evidence here — it was an assumption written as a measurement. What the
    filesystem does support was re-run and holds: the repository's ignore rule matches `.env`,
    `git ls-files -- .env` returns nothing, `git status --porcelain --ignored` prints `!! .env`, and the file is in
    neither commit. An assertion no command on this environment can check is no longer written as if it were one.
11. **Four figures the closure batch published and then measured differently, plus one attribution it withdrew.**
    §P is the batch's own record, and these are its corrections rather than a later reader's discoveries.
    **①** It first printed `pnpm test:gates` at exit **0** with 146 assertions and no failures; at final measurement
    that command exits **1**, because its first suite fails on malformed tables in documents another workstream is
    writing — 1 uneven row at the first reading, 4 by the last, in `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md`,
    `docs/REQUIREMENTS_TRACEABILITY.md` and `docs/TEST_AND_RELEASE_REPORT.md`, none of them a file this batch owns —
    and the `&&` chain means the remaining six suites never run under that command.
    Run individually they all pass, so the honest reading is 146 cases and one failure in a document gate, not a green
    gate and not a red build. **②** It printed `pnpm format:check` over **25** files; the command now prints **27**, the
    delta being two `.tmp_cfg*.json` scratch files a concurrent workstream left at the repository root — no `src/` or
    `docs/` file is in either set. **③** It printed `git status --porcelain` at **41** entries; the same command then
    read 52 and finally 55, so this register quotes the working-tree count with its timestamps and treats it as moving
    rather than settled. **④** §P and `docs/OWNER_INPUT_REGISTER.md` §5 both first said the OD-2 chain legs were
    `re-measured in this batch`, including `pnpm install` and `pnpm build` and the served-route probes. That was
    wrong in kind, not in value: this batch's mandate forbade running the build, the server, the install and the audit,
    and the figures themselves were inherited. The wording is now re-attributed leg by leg — typecheck, lint, test,
    format, citations and tables are this batch's outputs; install is 1 November's OD-2 execution in
    `docs/IMPLEMENTATION_PLAN.md` §0 and §10.1; build, start and every status code are the transcript in
    `docs/ROUTE_RUNTIME_EVIDENCE.txt`. A number a batch did not produce is cited to the batch that produced it.

### D. Added in this documentation batch (31 October 2026)

- `docs/IMPLEMENTATION_PLAN.md` (NDM-PLAN-001) — current state, an eight-row gate table naming who acts,
  Standard §2.3 step-9 install→typecheck→test→build as Phase 2's gate G0, Phases 2–9 with exit criteria
  expressed as evidence, the critical path with the two specification-completion items (ADR-011 ownership/
  authenticity entities and ADR-008 per-locale `PublicationRecord`) named as prerequisites for real content
  editing, the twenty Control Center modules as a dependency-ordered eight-wave delivery sequence, a
  thirteen-item risk register, and six coverage holes (H-1 rate-limit backend declared in `.env.example` but
  never provisioned or ADR'd; H-2 no CI pipeline owns the twelve required checks and no source doc names a CI
  vendor; H-3 MFA mandated by three sources with no ADR; H-4 dependency/secret scanning has no command;
  H-5 the quarterly restore cadence has no owner after release; H-6 `REQUIREMENTS_TRACEABILITY.md` has no
  start point although S-15 now depends on it).
- `docs/OWNER_INPUT_REGISTER.md` (NDM-OWNER-INPUT-001) — **22 Owner inputs, all `Outstanding`**, each with
  why it cannot be invented, where it will live and what the build does meanwhile; the eight Standard §13
  engineering-default categories recorded as decided; and the S-01…S-15 resolutions listed as decisions taken
  under delegated authority, flagged where a product-visible consequence exists that the Owner may overturn
  (six country states rather than four; eight state dimensions; no blanket "Verified"; deferred semantic
  retrieval; Markdown-as-authority).
- `docs/TEST_AND_RELEASE_REPORT.md` (NDM-QA-001) — seven executed commands with transcripts and exit codes,
  21 activities marked `Not run` each with its future command and required evidence, the twelve Standard §12
  checks each recorded **unmet**, and a release-approval section with an intentionally blank Owner signature
  block.
- This file.

### E. Explicitly not done (so the absence is on the record, not implied)

- **No dependencies installed.** No `node_modules/`, no `pnpm-lock.yaml`. `pnpm install` has never been run;
  it cannot succeed while B-01 stands.
- **No application code.** `src/` contains `README.md`. `tests/` contains one fixture-guard file. No route,
  component, collection, global, hook, access rule, migration or service exists.
- **No database, schema or migration.** No container started by this project, no volume, no roles created.
  Consequence of §G as written on 31 October — *"the ADR-019 privilege boundary is designed and scripted but
  **not proven**"* — was **superseded on 1 November 2026** (see §J): the grant design has since been observed
  refusing things, in a disposable container only. What remains not done is the same thing §E always meant:
  no database belonging to *this project* exists, so nothing above is a verified production privilege boundary,
  and Standard §3.2 / Master Spec line 3822 stay unsatisfied for the audit relations until one does.
- **No content.** No artifact, story, country fact, claim, evidence record, ownership statement,
  authenticity assessment, contact detail or institutional identity exists in this build.
- **No media pipeline.** No derivative has been produced; the recorded `Derivative Status` value is *Original (no derivatives produced)* on every catalogued row.
- **No provider selected**: object storage, AI provider/model, hosting, SMTP, backup target and OTLP endpoint
  all open (OID-19).
- **No Git repository**, therefore no checkpoint commit history; `.gitignore` is prepared but inert.
  Directive Phase 1's "Git checkpoint" is **unmet**, deliberately left as an Owner/environment decision (B-04)
  rather than silently initialized.
- **No CI pipeline**, no security scanning, no performance measurement, no accessibility run, no restore test.
- **No deployment**, and nothing here authorizes one.
- **No commerce surface, and none planned.** Master Spec Appendix G.3, line 3702: *"No commerce framework,
  payment provider, cart schema, order schema, or sales analytics is to be installed for V1."* No changelog
  entry, phase item or module in this build proposes one, including hidden, unlinked, API-only or
  admin-configurable variants.

### F. Verification basis for the entries above

Every claim in §A–§E, §G and §H is supported by a command in `docs/TEST_AND_RELEASE_REPORT.md` §1 or §9, or by a
filesystem fact that `preflight.mjs` re-checks on each run. §G and §H additionally print the exact output of the
commands they rely on, because both describe work done after §1/§9 were first written. Nothing here is inferred
from the existence of a configuration file: per Directive §15, an authored config is reviewable input, not a
completed feature.

### G. Added in the continuation window (31 October 2026) — citation closure, least-privilege design, six new ADRs

Scope unchanged: Phase 0 + Phase 1, local Docker Compose, no dependency install, no `.env`.

**Executed, with transcripts in `docs/TEST_AND_RELEASE_REPORT.md` §1:**

| Command | Measured result |
|---|---|
| `node scripts/copy-master-spec.mjs` | exit 0. Header restamped: source SHA-256 `5b30b21e…47ecd5`, 242,312 B, 3,941 lines, DOCX `69ccb03e…f71283` / 142,645 B, generated `2026-10-31T13:22:46.609Z`, body byte-identical to source. All **15** `S-01…S-15` rows carry an explicit `Evidence (line § section)` value — verified by parsing the generated table's third column rather than by trusting the header claim |
| `node scripts/verify-citations.mjs` | exit 0, final run of this window. `scanned 12 docs/ markdown files, 478 quoted fragments carrying a line reference (skipped 13 quoted strings shorter than 3 tokens)`; `VERIFIED 422 \| LINE_OFF 0 \| LINE_OFF_OTHER_SOURCE 0 \| SELF_RECORDING 10 \| PROJECT_RECORD 8 \| DEFINED_TERM 4 \| NOT_FOUND 0 \| NO_LINE_REF 38 (of which 0 are verbatim requirement text with no citation)`. Two runs were taken inside this window — 476 fragments / 36 no-reference strings at the first, 478 / 38 at the last — with `VERIFIED 422` and zero defects in both. The totals move because documents were being written between the runs; the defect classes did not. `docs/TEST_AND_RELEASE_REPORT.md` §9 carries the rule that any figure from these files is re-run before it is published |
| `node scripts/preflight.mjs` | exit 1, `7 checks: 1 FAIL, 2 WARN, 4 PASS` — see correction C.1 |
| `sh -n` × four `scripts/db/*.sh` | exit 0 for all four |
| `pnpm db:privilege-evidence` | **attempted and aborted** — `FATAL: the container could not be started (engine unavailable?)`. Created nothing; nothing to tear down |
| `docker ps` / `docker info` (each `timeout 25`) | `ps_rc=124`, `info_rc=124`, no output. `wsl -l -v` → `docker-desktop Running 2`, `Ubuntu Stopped 2` |

**Added — database least-privilege layer (ADR-019).** `scripts/db/harden-append-only.sh`
(post-migration grant/trigger/RLS enforcement), `scripts/db/verify-privileges.sh` (asserts the grant set
as catalog rows, including a positive control so a silent failure cannot look like a pass),
`scripts/db/run-privilege-tests.sh` (host-side evidence harness, 14 behavioural cases A–N plus a
residual-risk probe, throwaway container/volume with random passwords that are never persisted).
`scripts/db/init-roles.sh` was rewritten to add the `ndm_guard` schema and its `deny(text)` function, the
append-only `REVOKE` loop, and a check that no ordinary role holds `BYPASSRLS`. `docker-compose.yml` now
mounts `./scripts/db` read-only at `/opt/ndm-db`; `package.json` gained `db:harden`,
`db:verify-privileges` and `db:privilege-evidence`. **Status: authored + syntax-checked, not proven** — the
boundary these scripts create has never been observed refusing anything.

**Added — six ADRs, bringing the file to 24 (measured: `grep -c '^### ADR-'` → 24).** ADR-019 audit
append-only enforcement in three layers (grant, superuser-owned trigger, RLS deny policies under `FORCE
ROW LEVEL SECURITY`), ADR-020 the three implied competences (rights reviewer, AI knowledge reviewer,
read-only auditor) as scoped grants on the eleven canonical roles rather than as new roles, and ADR-021…
ADR-024 resolving findings F-01…F-04 (`ArtifactEra` join with `era_id` demoted to a projection; `Page` /
`PageSection` / `Template` as first-class entities; `VerificationReview` as the single review authority;
`ProvenanceSourceLink` as a many-to-many with a controlled `role` list). Each is a *decision*, not an
implementation: no table, column or class named by ADR-020…ADR-024 exists.

**Changed — counts and statuses refreshed against measurement, not memory** (this was task A.7):
`docs/ARCHITECTURE.md` §0 (two blockers, B-01 and B-09), §0.1 (preflight, citation, infrastructure rows,
new privilege-harness row), §4 (role grant set), §6 (topology with `/opt/ndm-db`), §9 (two new open rows);
`docs/ARCHITECTURE_DECISIONS.md` §2, §7, §7.1, new §7.2 (B-09 probe table and three Owner actions), §8
(re-verification triggers); `docs/DATA_MODEL.md` §3.7, §8, §9, ADR range; `docs/SECURITY_AND_PERMISSIONS.md`
§2.3, §2.4 findings 1–2, R12–R14, §5, C-08; `docs/REQUIREMENTS_TRACEABILITY.md` §27 (fourth *Resolution*
column) and REQ-DOC-003, REQ-TRUTH-008; `docs/OWNER_INPUT_REGISTER.md` OID-19 line range
(`init-roles.sh` 58–67, not 24–33); `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` RB-10;
`docs/IMPLEMENTATION_PLAN.md` governing inputs, Phase 1 row, R-11; `docs/TEST_AND_RELEASE_REPORT.md`
§0, §1.1, §1.5, §1.7, §2.1, §5, §9.

**Preserved rather than removed** — `docs/.triage.txt` was an ad-hoc dump of 47 citation findings
(28 `LINE_OFF`, 11 `LINE_OFF_OTHER_SOURCE`, 8 `NOT_FOUND`) from the remediation. It was renamed to
`docs/CITATION_TRIAGE_2026-10-31.superseded.txt` so a reviewer can find it, given a disposition header
(cross-tabulated from its own body, plus how the resolved rows read in
`docs/CITATION_VERIFICATION.json` today), and kept unedited below that header. Nothing was deleted.

**A defect this window introduced and fixed, recorded because it is the instructive kind.** An edit to
`docs/SECURITY_AND_PERMISSIONS.md` whose `old_string` spanned two table rows deleted the `| R13 |` row
start and merged two roles onto one line. Caught by reading the file back, not by any tool: no checker in
this repository validates Markdown table shape. The row was restored and the §2.3 matrix re-verified line
by line (R1…R14, one per line). The general rule taken from it: table edits need a read-back, and
`verify-citations.mjs` is not a substitute for one. *(Status update from §H: that gap is now closed —
`scripts/verify-tables.mjs` (`pnpm audit:tables`) checks table shape, and its own header states what it does
not prove. The read-back rule stands; a shape check is not a truth check.)*

### H. Identity decision and tooling (31 October 2026, later window) — ADR-025, count corrections, table checker

**Added — ADR-025**, which closes coverage hole **H-3** at the *mechanism* level: the second factor for Owner and
privileged accounts is delegated to a maintained OIDC-compatible identity provider that enforces it per its own
policy, and Payload consumes the assertion through `auth.strategies`. Standard §4.1 lines 132 and 134 (Master Spec
lines 2889, 2890 and SEC-001 at 3104) are quoted in the ADR itself. Local staff passwords are disabled by default;
exactly one break-glass Owner account remains, and enabling it *is* the protected recovery/transfer procedure
Master Spec line 2694 demands. The ADR records a **dated documentation measurement** as its premise — Payload's
auth overview (read 31 Oct 2026) lists cookies/JWT/API keys and no MFA option — and refuses four tempting
alternatives, including implementing TOTP in this repository (banned by line 132) and shipping V1 password-only.
It adds **no dependency and no `.env.example` key**, because declaring `OIDC_*` before the strategy that reads it
exists would repeat hole H-1's declared-but-absent pattern. Its own status line says what that means:
*evidence status: authored — this ADR proves nothing itself.*

**Propagated — the register is now 25 ADRs, re-measured rather than remembered** (`grep -c '^### ADR-'` → 25):
`docs/ARCHITECTURE.md` §0, `docs/ARCHITECTURE_DECISIONS.md` §7 row 1, `docs/DATA_MODEL.md` §0 governing
decisions, `docs/IMPLEMENTATION_PLAN.md` governing inputs and Phase 1 row, `docs/REQUIREMENTS_TRACEABILITY.md`
REQ-DOC-003 and the §27 relationship paragraph, `docs/OWNER_INPUT_REGISTER.md` OID-19. Historical ranges that
name a *specific* set were left alone: ADR-021…ADR-024 still closes F-01…F-04, and ADR-020…ADR-024 still names
no implemented class — ADR-025 is an identity decision, not a modelling one.

**Corrected — a stale count found while propagating.** Risk R-06 claimed that `.env.example` had twelve empty
provider fields. Measured: `grep -cE '^[A-Z0-9_]+=$' .env.example` → **19**, of which 14 are provider/endpoint
selections and 5 are the local role passwords (line numbers 22–30 and 41–79). OID-19 already carried the correct
figures, so the two documents disagreed with each other; R-06 now carries the measured pair. R-06 also gained the
identity provider as an open selection, with the explicit note that ADR-025 names Keycloak only as a non-committed
candidate (`grep -c 'OIDC' .env.example` → 0).

**Rewritten — three rows that pointed at a design ADR-025 rejects.**
`REQ-AUTH-002` planned `src/payload/plugins/mfa`; that path is on ADR-025's Rejected list, so the row now plans the
provider-side factor and records *why the plan changed* instead of silently replacing it. `REQ-AUTH-001` now names
`auth.strategies`. `docs/SECURITY_AND_PERMISSIONS.md` §7's Authentication row said "MFA provider not selected; no
provider is claimed" — it now separates the two states a reader could otherwise conflate: **mechanism decided,
instance not selected**, with the five negative tests listed where they will be checked.
`docs/IMPLEMENTATION_PLAN.md` R-11 and H-3 were reworded the same way, and §8's intro now says plainly that a
hole whose row names an ADR has gained an artefact, not an implementation.

**Added — two security-document structures ADR-025 depends on.** §2.5 gained invariant **A-10**: a role grant
means nothing until the identity layer has authenticated its holder, and authorization is not evaluated for a
session whose second factor is unproven. The section heading was re-scoped to "A-01…A-09 all Standard §4.2" with
an explicit note that A-10 is an architect addition sourced from §4.1 lines 132 and 134 — it is not presented as
a quotation of the Standard's own list. §8 gained the cross-system revocation consequence: an IdP-side revocation
must not remain usable inside Payload's cookie/JWT window, which turns line 159's revocation rule and line 2890's
re-authentication rule into a behaviour to test across two systems. ARCHITECTURE_DECISIONS §8 gained the matching
re-verification trigger, so the dated documentation measurement cannot quietly become a permanent assumption.

**Added — `scripts/verify-tables.mjs`** (`pnpm audit:tables`), which closes the gap §G recorded when an edit
deleted a table row and no tool noticed. One rule, no dependencies: every row in a table must carry the same
number of unescaped pipe separators as its header; fenced code blocks are skipped. Its header states its own
limit — uniform shape is not truth, and it is to be run alongside `audit:citations`, not instead of it.

| Command | Actual output | Exit |
|---|---|---|
| `node scripts/verify-tables.mjs` | `OK: 174 tables in 12 markdown files, every row with a uniform separator count` | 0 |
| same, against a throwaway fixture directory (`/tmp/tblneg`, outside the repository) containing one 4-cell header and one 3-cell row, plus a fenced pseudo-table | `bad.md: table at line 1 has 3 separators; 1 uneven row(s): line 4 -> 2` / `UNEVEN TABLES: 1 of 1 tables in 2 files (exit 1)`; the fenced file was not reported as a table | 1 |
| `node scripts/verify-citations.mjs` | `scanned 12 docs/ markdown files, 485 quoted fragments carrying a line reference (skipped 13 quoted strings shorter than 3 tokens)` / `VERIFIED 425 \| LINE_OFF 0 \| LINE_OFF_OTHER_SOURCE 0 \| SELF_RECORDING 10 \| PROJECT_RECORD 9 \| DEFINED_TERM 4 \| NOT_FOUND 0 \| NO_LINE_REF 41 (of which 0 are verbatim requirement text with no citation)` | 0 |
| `grep -c '^### ADR-' docs/ARCHITECTURE_DECISIONS.md` | `25` | 0 |
| `node -e "JSON.parse(...)"` on `package.json` | `package.json parses OK` | 0 |
| traceability register re-count | 219 rows, 219 unique IDs; status tally 23 Implemented and Verified + 167 Not Implemented + 5 Partially Implemented + 20 Blocked by Owner Input + 4 Out of V1 Scope = 219, so the §0 tally table needed no change | — |

**Deliberately not done in this window.** No dependency installed, no `.env` created, no identity provider
provisioned, no authentication test executed, no database touched — ADR-025's implementation belongs to Phase 2
Module 14, and B-01/B-02/B-05/B-09 still bind it *(B-09 has since cleared by observation — see §J — but B-01,
B-02 and B-05 still bind ADR-025, so this sentence's conclusion stands)*. ADR-019's behavioural proof remains owed
and unexecuted for the
same reason (§G). *(Superseded 1 November 2026: it was executed — see §J. Its Phase-2 deployment proof is still
owed, which is a different claim.)* REQ-AUTH-002 stays `Not Implemented`: a mechanism decision is not an
implementation, and the status was not advanced because an ADR was written.

**Strengthened — the framework-capability premise was re-measured against primary sources the same day.**
ADR-025 was first authored on a documentation summary whose package-name spellings it explicitly distrusted. That
caveat has been retired by going to the source, and one new caveat replaced it:

| Probe (all read-only) | Actual result |
|---|---|
| Payload authentication overview (`payloadcms.com/docs/authentication/overview`) | Strategies documented: HTTP-Only Cookies, JSON Web Tokens (JWT), API Keys, and Custom Strategies as the extension point. No occurrence of MFA, 2FA, TOTP, WebAuthn or `multiFactor` |
| `payloadcms.com/docs/plugins/list` | **HTTP 404** — a guessed URL, recorded because guessing a source is itself a defect worth logging |
| Payload plugins overview (`payloadcms.com/docs/plugins/overview`) | Names Form Builder, MCP, Multi-Tenant, Nested Docs, Redirects, Search, Sentry, SEO, Stripe, Import/Export, Ecommerce; points to the monorepo package directory for the complete list. No OTP/MFA plugin |
| `gh api repos/payloadcms/payload/contents/packages --jq '.[].name'` | **45** package directories; the plugin-prefixed ones are `plugin-cloud-storage`, `plugin-ecommerce`, `plugin-form-builder`, `plugin-import-export`, `plugin-mcp`, `plugin-multi-tenant`, `plugin-nested-docs`, `plugin-redirects`, `plugin-search`, `plugin-sentry`, `plugin-seo`, `plugin-stripe`. `grep -iE 'auth\|mfa\|otp\|2fa\|token\|factor\|identity'` over the 45 → **NONE** |

The new caveat is narrower and honest: the GitHub contents API reads the repository's default branch, while this
project pins `payload@3.92.1`, so ARCHITECTURE_DECISIONS §8 now requires the absence to be re-established
**against the pinned release** before Phase 2 relies on it. Two side findings were recorded in the ADR rather than
buried in this changelog: official `plugin-stripe` and `plugin-ecommerce` exist and are still prohibited for V1
(Master Spec §G.3 line 3702), and an official `kv-redis` package exists, which is evidence for coverage hole H-1
but **not** a decision — H-1 belongs to Phase 2. These probes used the GitHub CLI already installed and already
authenticated on this host; they are `GET` requests against public sources, installed nothing, wrote nothing, and
created no credential.

---

### I. Comprehensive gap closure and evidence update (31 October 2026, gap-closure window)

This window executed a **documentation, verification and approved tooling-correction** batch only. It was not
authorization to begin application implementation, to install anything, or to expand scope. No Node upgrade, no
`pnpm install`, no `.env`, no `git init`, no commit, no application code, no Phase 2 work, no edit under
`reference/` or `Noujoude.photo/`, no deployment, and no Owner decision was made on the project's behalf.

**Tooling changes — two files created, one edited.** `package.json` gained `"format:check": "prettier --check ."`
(29 scripts, was 28). A new `.prettierignore` (42 lines, 13 non-comment patterns) excludes `reference/` at line
18 and `Noujoude.photo/` at line 21 plus the generated evidence artefacts. A new `.github/workflows/ci.yml`
(336 lines, 16,374 bytes, four jobs) expresses the Standard §12 checks as a pipeline and carries the header
`STATUS: **AUTHORED. NEVER EXECUTED.**`

**Two hazards found while doing that work, both recorded rather than quietly fixed.**

1. **`pnpm format` could have rewritten the read-only source tree.** `package.json` ships
   `"format": "prettier --write ."`, Prettier parses Markdown, and before this window there was **no
   `.prettierignore`** — so one well-intentioned format run would have breached Directive §3, tripped
   preflight's `REFERENCE_INTEGRITY` DRIFT check, and invalidated every `line N` citation in `docs/`, because
   citations are addressed to those exact bytes. Found by inspection, not by an incident. Closed by the ignore
   file and by giving CI a non-writing check command; registered as risk **R-14**. Upstream Prettier guidance
   recommends exactly this control, quoted in `docs/TEST_AND_RELEASE_REPORT.md` §3.1.
2. **An integrity claim that had been recorded as ✅ was an overclaim, and was downgraded.** The row asserting
   "tooling cannot write into `reference/`" was true of the audit scripts and false of the shipped format
   command. `docs/TEST_AND_RELEASE_REPORT.md` §5 now carries it as ⚠️ with the reasoning, on the principle that a
   claim which turns out to be weaker than recorded gets edited and the earlier wording quoted — not silently
   left standing.

**Corrections applied, one per finding.** I-1 replaced four transitive dependency rows that had recorded
"latest stable" with the versions the pinned adapter's own registry document declares — `pg 8.20.0`,
`drizzle-orm 0.45.2`, `drizzle-kit 0.31.7`, `@payloadcms/drizzle 3.92.1` — and renamed the column
`Latest stable found` to `Version recorded`. I-2 converted a wrong ✅ on PostgreSQL 18.6 into three named open
assumptions (**A-C1** database compatibility, **A-C2** `zod`, **A-C3** the `graphql` patch level), with the
four-URL documentation probe as evidence; nothing was claimed as official or demonstrated support, and no pinned
version was changed to make compatibility look solved. I-3 corrected a stale `NO_LINE_REF 42` and re-ran the gate
rather than editing silently. I-4 replaced every stale Docker measurement, distinguishing **Desktop stopped**
from **daemon running but unhealthy** from **daemon running and reachable**, and withdrew an earlier claim that
`postgres:18.6-alpine` was absent from the local cache — the cache cannot be enumerated while the engine is down,
so the honest value is **UNKNOWN**. I-5 authored the CI gates for `db:harden` and `db:verify-privileges` and
states plainly that the pipeline is not operational. I-6 gave H-1, H-4 and the `payload_revisions` question real
Phase 2 landing points as work items **2.9**, **2.10** and **2.11**, each with its own acceptance evidence. I-7
split Module 14's acceptance gate so the MFA criterion is deferred **by name** behind OID-19 instead of being
scheduled against an unselected provider. I-8 replaced prose counts with a measurement-method table of commands
and outputs. I-9 proved the Gate 0 → Owner → ERD → traceability order is a DAG in a new §2.1, and identified the
only engineering-to-Owner edge as a *reporting* edge rather than a dependency — **no cycle exists and none may be
described as existing.** I-10 added the check-only formatting command with a three-leg evidence case, and states
that the command has never been executed.

**Findings F-A, F-B and F-C closed.** F-A: the container engine was re-measured instead of inherited, and the
current state is now recorded separately from the historical one. F-B: reading
`scripts/db/run-privilege-tests.sh` established that A.5 needs **only** B-09 — no Node upgrade and no
`pnpm install` — and that prerequisite may not be reintroduced without new evidence. F-C: the ecosystem question
was answered **at the pinned tag** rather than generalized from the core package, with its limits recorded.

**Defects this window introduced and then repaired — disclosed, not hidden.** The first post-edit run of
`verify-citations.mjs` returned **`LINE_OFF 4` and `NOT_FOUND 1`**, not zero. Four were line-number drift into
`docs/ARCHITECTURE_DECISIONS.md`: this window's 20 edits moved ADR-007/008/010 body text by roughly 120 lines and
broke three citations in `docs/AI_CURATOR_GOVERNANCE.md` (221→341, 228→348, 250→369) and one in
`docs/DATA_MODEL.md` (227–228→348). The fifth was self-inflicted: the new §2.1 quoted a *paraphrase* of Master
Spec line 3252 inside quotation marks, which the gate correctly treated as a verbatim citation it could not find;
it was replaced with the exact sentence and its own line number. A sixth defect of the same class was found **by
hand, not by the gate** — `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` cited `ARCHITECTURE_DECISIONS.md line 243` for
ADR-009's consequence, now at lines 362–363 — because the checker only validates line numbers attached to a
*quoted fragment*. That limitation is registered as coverage hole **H-8**, and it means `LINE_OFF 0` must not be
read as "every cross-reference in `docs/` is correct".

**A second coverage hole was registered, H-7.** `scripts/preflight.mjs`'s `Noujoude.photo/` check iterates the
audit CSV's rows and re-hashes each referenced path; it never enumerates the directory. It therefore proves *no
audited asset changed* and does not prove *no unaudited asset appeared*. Measured: the directory holds **85**
files while the audit covers **82**, and the 3-file difference is already documented and reconciled — so nothing
is lost. The gate's PASS message is simply wider than its coverage. `scripts/preflight.mjs` was **deliberately not
modified**: redefining a validation gate is not within a batch authorized to re-run documentation gates.

**New in `docs/IMPLEMENTATION_PLAN.md`:** §2.1 (the no-cycle proof and its DAG), §4B (Phase 1 formal acceptance
as two separately measured levels, with the five-way distinction and an explicit statement that the earlier
**17/18** figure came from the internal session task ledger and is *not* formal acceptance), Phase 2 work items
2.9/2.10/2.11, risk R-14, coverage holes H-7 and H-8, and §10 — a consolidated outstanding-gap and decision
register giving every open item the same nine fields, including **OD-1 … OD-6**, the six Owner decisions that
root every engineering chain.

**Closing pass of this window — the count reconciliation (I-8), which found four more defects.** Every remaining
quoted count in `docs/` was re-measured against a command rather than accepted from prose. Four defects surfaced,
all of them recorded in `docs/TEST_AND_RELEASE_REPORT.md` §1.8.1's twelve-row table as defects 9–12:

1. **`docs/IMPLEMENTATION_PLAN.md` §8's own table was split.** A `---` thematic break sat between H-6 and H-7, so
   the two newest hole rows rendered as a headerless run. `verify-tables.mjs` reported **193 tables and exited 0** —
   it scores a run of pipe-led lines as a table without ever checking that the run has a header row. Repaired by
   moving the rule below H-8; the count returned to **192**, and a hand-run sweep for headerless pipe-led runs
   across all twelve `docs/` files returns **0 orphans**. Registered as coverage hole **H-9**, with the same
   deliberate non-fix as H-7: this batch may re-run documentation gates, not redefine them. It also means the
   **192** recorded at the end of the previous window was not a measurement of the file as it then stood — that
   state returns 193.
2. **§0 claimed 16 Master Spec discrepancies, `S-00…S-15`.** `S-00` has never existed. `grep -o 'S-0[0-9]'` matched
   the substring inside `VIS-001` (line 3215) and `OPS-001` (line 3241) — Appendix G acceptance-criterion IDs.
   Corrected to **15** rows, `S-01…S-15`, with an anchored pattern; the phantom ID is also struck from §10's
   authority index.
3. **§0 claimed 206 distinct requirement IDs against 219 rows**, and explained the gap as cross-references inside
   cells. The explanation was invented. `REQ-[A-Z]+-[0-9]+` silently drops the 13 IDs with a digit inside the
   prefix — `REQ-A11Y-001…004` and `REQ-I18N-001…009`; 219 − 13 = 206. Corrected to **219 distinct IDs**, one per
   row, `uniq -d` empty. **This exact error had already been caught and written up in §H of this same file**
   (lines 192–195, which record the correct pattern and the correct answer) and was then lost when the figure was
   retyped into §0. A recorded lesson that is not re-read is not a control.
4. **`verify-citations.mjs` reported `NOT_FOUND` twice more**, both on phrases written during this closing pass in
   quotation marks next to an unrelated number. The quotation marks were replaced with emphasis. Third occurrence
   of one class, so the class is now stated as a rule for `docs/`: prose quotation marks plus any nearby number are
   parsed as a citation — quote only what you mean to cite.
5. **Every quoted file size and line count in `docs/` was re-measured, and five were wrong.** `.github/workflows/ci.yml`
   was quoted in seven places as *337 lines* and in three as *15,727 bytes*; measured, it is **336** newline-terminated
   lines and **16,374** bytes. `.prettierignore` was quoted as *43 lines*; measured, **42**. ADR-018 quoted the source
   specification as *3,942 lines*; measured, **3,941**, which is what every other document and the generated header
   already said. Two distinct causes, both now named: an editor displays a file of *N* newline-terminated lines as
   *N+1*, which accounts for all three line figures; and the `ci.yml` byte figure was captured before the file's last
   write (mtime `20:01:49`, later than `.prettierignore` at `19:58:18`) and never re-measured. All seven locations were
   corrected, and `docs/TEST_AND_RELEASE_REPORT.md` §1.7 now carries the measurement with its commands.
6. **`scripts/copy-master-spec.mjs` mislabels its line count as well as its byte count**, and §2.2 of the test report
   now says so. It prints `4070 lines` from `written.split(/\r?\n/).length`, which yields one extra empty element for
   a file ending in a newline; the file holds **4,069**. The script's own comment at line 36 already acknowledges this
   behaviour for a different variable. §2.2 also cited the print statement as line 265, which is `const rel = …`; the
   print statement is line **266**. Neither script was modified — a documentation-only batch does not edit its tools —
   but §1.4's transcript was refreshed from a fresh exit-0 run and both mislabels are now stated next to it.
   **Superseded by §M below, same day:** the script has since been modified, both labels are measured against the
   file on disk, and 11 regression cases guard the report. The line reference in this item is now stale twice over,
   which §2.2 records rather than hides.

§0 of `docs/IMPLEMENTATION_PLAN.md` gained a **third rule** naming the pattern-error class (as distinct from the
hand-incrementing class already recorded there) and its defensive form: anchor to the start of a row, and include
digits in any ID-prefix character class. The **blocker** row was also scoped, because an unscoped grep returns 13
rather than 9 — §10.2 restates B-05…B-08 as index rows, deliberately, and double-counting them is not deliberate.
`docs/ARCHITECTURE.md` §0.1's asset row now carries the H-7 coverage limit and the 0-of-82 rights figure beside the
82-of-82 checksum PASS, so the two numbers cannot be confused by a reader who quotes only one.
`docs/TEST_AND_RELEASE_REPORT.md` §1.2 gained the same H-7 note with preflight's exact rendered output.

**Still not done, stated so the absence is on the record.** A.5 remains **blocked by B-09** and was not retried
after a bounded probe; audit immutability must **not** be described as behaviourally verified. Level B acceptance
is **0 of 12** and this window did not change it — improved documentation, new scripts and an authored pipeline
are all authored or configured work, none of it executed. Asset rights clearance remains **0 of 82**. Every
founder, institutional, legal, ownership, provenance, authenticity, partnership and accreditation claim remains
**explicitly unverified**. Phase 1 is **not accepted**.

**Commands executed in this window, with actual exit codes.** `node scripts/audit-assets.mjs` → 0 ·
`node scripts/copy-master-spec.mjs` → 0 · `node scripts/check-docx-alignment.mjs` → 0 ·
`node scripts/verify-citations.mjs` → 0 (after the six repairs; the first post-edit run also exited 0 but
reported 5 defects, and the closing pass produced two further `NOT_FOUND` runs before the final clean one) ·
`node scripts/verify-tables.mjs` → 1 then 0 (it caught two malformed rows this window
introduced — unescaped pipes inside code spans in the new §0 measurement table — and was re-run after the fix);
in the closing pass it returned **193 tables with exit 0**, which is the H-9 finding, and returns **192 / exit 0**
after the repair ·
`node scripts/preflight.mjs` → 1, `7 checks: 1 FAIL, 2 WARN, 4 PASS`, FAIL being Node 24.19.0 (re-executed in the
closing pass to capture its exact asset-check line; same result) ·
`sh -n` on all four `scripts/db/*.sh` → 0 each · `node scripts/show-lines.mjs 3252` and `3250-3253` → 0.
Closing-pass measurements, each → 0: the anchored discrepancy-row count on `docs/MASTER_SPECIFICATION.md` (15) ·
the traceability row count (219) · the distinct-ID count under both the narrow and the corrected pattern (206 and
219, with `uniq -d` empty) · the status tally 23 + 5 + 167 + 20 + 4 = 219 · the register counts
(`grep -c '^### ADR-'` → 25, `^\*\*D-0` → 4, `^\*\*A-C[0-9]` → 3, bolded `H-` rows → 9, bolded `R-` rows → 14) ·
a Node one-liner enumerating every pipe-led run outside fenced blocks in all twelve `docs/` files and reporting
headerless runs → **0 orphans**.
Environment probes: `wsl -l -v` → 0; `docker context ls` → 0; `docker compose version` → 0 (**client only**);
`docker version`, `docker info`, `docker ps -a`, `docker images` → **124** each with 0 bytes of output;
`git rev-parse --is-inside-work-tree` → non-zero, `fatal: not a git repository`. Network probes were read-only
`GET`s against registry and GitHub endpoints; nothing was installed and no credential was created.

**Final gate state at the close of this window:** `verify-citations.mjs` → 12 files, **506** fragments,
`VERIFIED 426 | LINE_OFF 0 | LINE_OFF_OTHER_SOURCE 0 | SELF_RECORDING 10 | PROJECT_RECORD 15 | DEFINED_TERM 4 | NOT_FOUND 0 | NO_LINE_REF 55`, exit **0**, identity 426 + 10 + 15 + 55 = 506; `verify-tables.mjs` →
`OK: 192 tables in 12 markdown files`, exit **0**; `preflight.mjs` → `7 checks: 1 FAIL, 2 WARN, 4 PASS`, exit **1**.

The final documentation-gate transcripts for this window are in `docs/TEST_AND_RELEASE_REPORT.md` §1.8.1.

---

### J. Verification-system defects closed and the A.5 proof executed (1 November 2026)

**This entry supersedes, as current state, the following present-tense claims made earlier in this file:** §B's
"`sh -n` only … it has never run"; §E's "the ADR-019 privilege boundary is designed and scripted but not proven";
§G's "Status: authored + syntax-checked, not proven — the boundary these scripts create has never been observed
refusing anything"; §H's "ADR-019's behavioural proof remains owed and unexecuted"; and §I's "A.5 remains blocked
by B-09 and was not retried". Each stays in place as the dated record of the window that wrote it. None of them is
true now.

**Executed — the A.5 privilege proof, with the mandated image.** `IMAGE=postgres:18.6-alpine sh
scripts/db/run-privilege-tests.sh` completed with **exit 0**. The full transcript, including its provenance header,
is `docs/A5_PRIVILEGE_EVIDENCE.txt`. Inside one throwaway container and volume, on a server reporting
`SHOW server_version` → `18.6`: `init-roles.sh` ran as an entrypoint script and then a second time to prove
idempotency; `harden-append-only.sh` applied the append-only exception; `verify-privileges.sh` printed **34
grant-state assertions**; and the fourteen behavioural cases A–N were attempted **as the relevant role**, ten of
them (B, C, D, F, G, H, K, L, M, N) matching `expect=denied actual=denied` and four (A, E, I, J) matching
`expect=ok actual=ok` — the positive controls that keep the denials meaningful. The residual-risk probe reproduced
the known weakness rather than asserting it: dropping the guard trigger as the table owner succeeded
(`VULNERABLE`), `verify-privileges.sh` then failed on exactly that invariant (`DETECTED`),
`harden-append-only.sh` restored it and the verifier passed again (`RESTORED`), and the `UPDATE` was refused once
more (`DENIED`). The harness removed its own container and volume; the pre-existing `noujoude-postgres*` containers
and `pgvector-data` were listed before and after in their original state and never touched. Throwaway passwords
were generated per run and never written to `.env`, a log, or any file.

**Environment re-measured, and it contradicts the 31 October record.** `docker info` exits **0** (server `29.9.2`,
3 containers, 0 running); `docker compose version` exits **0** → `v5.6.1`; `docker images` exits **0** and lists
`postgres:18.6-alpine` at **433 MB**, so the value that §I recorded as **UNKNOWN** is now **PRESENT**. **B-09 is
therefore cleared in this environment by observation, not closed as an Owner decision** — and OD-5 was never
pulled: the engine answered on a routine re-probe, so the Owner action the plan scheduled was not what unblocked
A.5. One correction goes the other way too: `wsl -l -v` still prints `docker-desktop Stopped` while the daemon
answers, so that listing — the evidence §I cited for the outage — is **not** a daemon test, and `docker info` is.
Nothing was created against the engine by this project; `pnpm db:up` has still never run.

**New executed evidence for the blocker that really binds the database track.** `docker compose config` exits
**1** with `required variable … is missing a value: set in .env` for `NDM_BACKUP_PASSWORD`,
`NDM_MIGRATION_PASSWORD`, `NDM_REPORTING_PASSWORD`, `NDM_RUNTIME_PASSWORD`, `POSTGRES_DB`,
`POSTGRES_SUPERUSER_PASSWORD` and `POSTGRES_SUPERUSER` — seven secrets, so **B-03** blocks provisioning, measured
rather than inferred, and the probe created nothing.

**H-8 closed — the citation gate could not see a citation without quotation marks.**
`scripts/verify-citations.mjs` now harvests quote-less line references into `REF_PAST_END`, `REF_BLANK_TARGET`,
`REF_SECTION_MISMATCH` and `REF_SECTION_UNKNOWN`, exits **1** on actionable defects (never for `SELF_RECORDING`,
`PROJECT_RECORD`, `DEFINED_TERM` or `NO_LINE_REFERENCE`), binds a filename label only by strict adjacency —
tolerant of the markdown emphasis that sits between a label and its section, which previously made a doc→doc
citation resolve against the Master Spec and manufacture a mismatch — and excludes fenced blocks and the
bare-parenthesised `(N)` form. **1,211 bare references** that the old rule could not see are now classified,
against 426 quoted fragments. Seven citations in six documents were traced to measured source lines and corrected:
two of them pointed at `§8.2` for a number that belongs to `§8.16` (the `PublicationRecord` definition; §8.2 only
lists it), one in `DATA_MODEL.md` carried transposed digits for the `§18.4` range, one in
`MEDIA_AND_RIGHTS_GOVERNANCE.md` gave a `§7.1` range that predates this window's growth of that file, one
attributed to `DATA_MODEL.md` a number larger than that file (it has 653 lines, so the Master Spec was the real
target), and two section labels in `SECURITY_AND_PERMISSIONS.md` were relabelled to `G.11.3` and `§15.9`.

**H-8 regression suite added — `scripts/tests/verify-citations.test.mjs`, 23 checks, exit 0.** It runs the real
gate as a child process against throwaway fixture workspaces in a temp directory, with fixture files of exactly
known length whose sizes are asserted before anything is claimed. It proves three separate things: that the
pre-H-8 rule was **blind** to every `REF_*` class while exiting 0, that the loose label binder **manufactured**
defects strict adjacency does not produce, and that the shipped rule exits 1 on each defect class and 0 on an
honest document. It also re-runs the real `docs/` set and asserts a floor on the harvested count, so a silent
regression of the harvest cannot pass as a green gate. Registered as `pnpm test:gate:citations`, added to
`pnpm test:gates`, and added as a CI step beside the H-7 and H-9 suites.

**Gate suites now all run in one command.** `pnpm test:gates` executes the H-9 table-shape suite (14 cases), the
H-7 asset-reconciliation suite (22 checks) and the H-8 citation suite (23 checks); all three exit **0** on
1 November 2026, dependency-free, before any install.
**SUPERSEDED the same day — the command in this sentence does not run the suites.** Section L measured that `pnpm
run <script>` verifies the declared dependencies first, finds `node_modules` absent by design, and starts an install
before reaching the script, which is exactly what this batch is forbidden to do. The numbers in this paragraph were
produced by the individual `node scripts/tests/<suite>.test.mjs` commands, and the aggregate became executable only
after OD-7 arms the guard and OD-2 installs. The claim, not the correction, is the defect: the sentence was written
as fact from a chain that had never been run.

**What did not change.** No dependency was installed, no `.env` created, no `git init`, no container started by
this project, no application code written, no existing project or persistent database resource touched, and no
`reference/` or `Noujoude.photo/` file modified. Level B remains **0 of 12**: a privilege matrix executed against a
disposable container is not one of the twelve Standard §12 checks passing, and none of them has. Asset rights
clearance remains **0 of 82**. Every founder, institutional, legal, ownership, provenance, authenticity,
partnership and accreditation claim remains **explicitly unverified**. **Phase 1 is not accepted** — it has never
been within this build's authority to accept it, and the remaining Phase 1 items are now gated exclusively on Owner
decisions OD-1, OD-2, OD-3, OD-4 and OD-6, with acceptance itself requiring a named approver.

---

### K. The compose definition was rendered for the first time and failed — H-10 (1 November 2026)

**This entry supersedes, as current state, one half of §J and one claim in §E.** §J recorded that
`docker compose config` exits **1** on the seven unset `.env` secrets. That is still true and still the blocker
evidence for **B-03**, but it was only the negative half: it proved the guards bite, not that the file can render.
§J's heading "New executed evidence for the blocker that really binds the database track" is therefore incomplete,
not wrong. §E's "No CI pipeline" is unchanged in substance; what changed is that the pipeline now carries a gate
for a file it previously did not check.

**The defect (H-10).** `docker-compose.yml` had never been handed to a Compose engine — every statement about it
in `docs/` rested on `sh -n` (which does not apply to YAML at all) and a human read. Rendering it exposed
`container_name: noujoude-postgres`, and `docker ps -a` on this host returns **`noujoude-postgres`,
`noujoude-postgres2`, `noujoude-postgres3`** — three stopped `postgres:16-alpine` containers, all Exited 137, none
of them this project's. The failure mode was specific and deferred: the Owner clears **B-03**, runs `pnpm db:up`,
and is refused by a name conflict, in the first minute of the first step they were being asked to take. Removing the
field was rejected rather than adopted — Compose would then generate `noujoude-postgres-1` from the top-level
`name:`, which sits inside the `noujoude-postgres*` glob that the harness rules forbid this project from touching.
The file now declares **`ndm-postgres`**: not in `docker ps -a` (asserted by a test, not by eye) and outside the
protected glob. Nothing else in the repository addresses the container by name — `db:status`, `db:harden`,
`db:verify-privileges` and CI all use the **service** name through `docker compose exec`, which the container name
does not affect — so the fix is one line wide and nothing else had to move. **No container, volume or network was
created to find or fix this**; the probe is `config`, not `up`.

**The second finding came from the guard, not from the render.** The environment block interpolated
`${POSTGRES_DB}` twice: once guarded (`POSTGRES_DB:`) and once bare (`NDM_DATABASE:`). With `.env` absent, Compose
prints `Defaulting to a blank string` for that key and continues — a path by which an empty database name reaches
a container while everything else aborts. It is commented in the file and now impossible to reintroduce: the gate
below checks **every occurrence** of each required variable, not the first.

**The class is gated rather than remembered.** `scripts/verify-compose-config.mjs` (207 lines, 12,094 bytes) reads
the file — never the engine, never the network — and enforces ten rules: **C1** the pinned image tag, **C2** the
publish is loopback-only, **C3** all seven secrets guarded with `:?` on *every* occurrence and each referenced at
least once, **C4** the data volume mounted at the postgres:18 root (`/var/lib/postgresql`, not `.../data`), **C5**
the script mounts read-only, **C6** a `pg_isready` healthcheck, **C7** no host-escape affordance (socket, `privileged`,
`network_mode: host`, `pid: host`, additive capabilities), **C8** an explicit restart policy, **C9** an `ndm-`
container name, **C10** no inline default for a secret. It is wired three ways: `pnpm audit:compose`, preflight
**check 8**, and two CI steps. Exit **0** today with the ten-rule summary line.

**Regression proof — `scripts/tests/verify-compose-config.test.mjs`, 238 lines, 13,012 bytes, 25 cases, exit 0.**
Twenty-two static cases: a red fixture per rule (each mutation asserts the *specific* code it should raise, and the
mutator throws if its anchor is missing so a fixture cannot silently stop mutating anything), the C3 double-read and
comment exemptions, a file carrying several defects at once reported in one pass, and the real `docker-compose.yml`
read green. Three dynamic cases actually run the engine and are the evidence that the static rules describe what
Compose does: `docker compose config` renders the real file with **rc=0** when the seven names are supplied as
placeholders **in the child environment only**, and the render carries `container: ndm-postgres`, the pinned image,
and `host_ip: 127.0.0.1` for the published port; the same command exits **1** naming `required variable … is missing
a value` when they are withheld; and `docker ps -a --format {{.Names}}` confirms `ndm-postgres` is free on this
host. Without an engine those three print **SKIP**, never PASS.

**What the positive render changes in the record, stated narrowly.** The compose file is now machine-validated in
both directions and its name conflict is closed. It does **not** mean `pnpm db:up` has run: B-03 still blocks the
start, `.env` still does not exist by agreement, and Standard §12 checks 9–12 remain 0 of 12. A render that succeeds
with placeholder passwords is proof the definition is coherent, not proof a database works.

**One gate defect found by the gate's own output.** Re-running the citation checker after these edits returned
**`NOT_FOUND 1`** at `docs/IMPLEMENTATION_PLAN.md:516` — a quotation of *that same file's own §0 wording*. The tool
excludes the scanned document from its own source set by design, so such a quotation can never verify, and the first
repair attempt kept the quotation marks and therefore kept failing. The honest fix was to paraphrase it out of
citation position rather than teach the tool to grade its own homework; the limit is now written into the H-8 row of
`docs/IMPLEMENTATION_PLAN.md` §8 instead of being assumed away.

**Figures re-measured for this window, because the previous ones were made stale by these very edits.**
`docker-compose.yml` **63 lines / 3,591 bytes**; `.github/workflows/ci.yml` **370 lines / 18,563 bytes / four jobs /
33 named steps** — and that last figure is a *named*-step count, so as a step count it was **wrong**: the file held
41 step items, because eight `uses:` steps carry no `name:` line and the pattern used cannot see them. The correction
is recorded with H-11 below and in `docs/IMPLEMENTATION_PLAN.md` §0, rule four. `package.json` **35 scripts** (two new: `audit:compose`, `test:gate:compose`; `test:gates` now chains
four suites); `.prettierignore` **45 lines / 2,709 bytes / 14 non-comment patterns**; preflight **8 checks — 1 FAIL,
2 WARN, 5 PASS, exit 1** (the FAIL is the Node version, B-01); `verify-tables.mjs` **194 tables in 12 files, exit
0**; `verify-citations.mjs` **522 fragments — VERIFIED 426 + SELF_RECORDING 10 + PROJECT_RECORD 14 + NO_LINE_REF 72
= 522, `DEFINED_TERM` 6 a subset, LINE_OFF 0, NOT_FOUND 0, exit 0** with **1,222 bare references** resolving;
suites **H-7 22, H-9 14, H-8 23, H-10 25**, all exit 0. The §J-era counts of 336/368 lines and 506/519 fragments are
superseded by these, each in its turn. **This entry re-measured itself after being written and changed two of its own
numbers** — the fragment count moved 519 → 522 as §K's prose joined the scanned set, so the figures above are the
post-write run, not a copy of the pre-write one. **And then it moved again for the third time in the same entry**,
because H-11 is part of §K too: the final run for this window is **523 fragments — 426 + 10 + 10 + 77 = 523 — with
1,225 bare references**, and the suite list is **five**, not four: H-7 22, H-9 14, H-8 23, H-10 25, H-11 32, all exit
0. That last pass is not a clean sweep either: adding the H-11 row and then propagating its figures took the gate red
three separate times, each time for the same reason — a quoted phrase sitting on the same physical row as a `line N`
reference gets bound to that reference and searched in the cited source, where it does not exist — and each time the
repair was to convert the quotation to a code span rather than move the number. The same re-measurement moved two more
figures in the block above: preflight is now **9 checks — 1 FAIL, 2 WARN, 6 PASS** and `package.json` is **37 scripts**,
not the 8 and 35 written there. Every figure in this block is a snapshot of the run that printed it; the commands are
in §9 of `docs/TEST_AND_RELEASE_REPORT.md`.

**H-11 — the pipeline that is supposed to enforce the twelve release checks had never been read by a machine either.**
The same reasoning that found H-10 applies to `.github/workflows/ci.yml`: every claim about it said *"not
machine-validated — no YAML parser exists on this host"*, and that sentence was re-measured rather than inherited
(`python -c "import yaml"`, `python3`, `perl -MYAML`, `perl -MYAML::Tiny`, `ruby -e "require 'yaml'"` and PowerShell
`ConvertFrom-Yaml` all fail; no cached container image carries one either). A 370-line file with four jobs and
forty-one steps was being trusted on a human read — and the read had counted thirty-three of them, which is the
named-step pattern's blind spot for the eight bare `uses:` steps, including `actions/checkout` and
`actions/setup-node` in all four jobs. A human read that mis-counts its own subject is the weakest evidence class in
this workspace.

**Added: `scripts/verify-workflow-structure.mjs` (449 lines, 21,132 bytes) — ten structural rules over the workflow.**
**W1** byte facts (no tab indentation, no CR, valid UTF-8, final newline); **W2** root shape (a mapping, top-level keys
from the Actions set, non-empty `jobs`, an `on:` trigger); **W3** block structure — dedents must land on a column that
opens a block, no duplicate key in one mapping, no line that is neither a key nor a sequence item, no empty block
scalar; **W4** job shape (`name`, `runs-on`, exactly one of `steps`/`uses`, non-empty `steps`); **W5** step shape (a
`run:` step is named, a `uses:` ref is `owner/repo@ref`, no step with neither); **W6** the job DAG (`needs:` names a
real job, no cycle); **W7** every script a step *executes* exists in this workspace; **W8** every `pnpm <name>` is a
script `package.json` declares; **W9** CI and `pnpm test:gates` have not drifted apart; **W10** no literal secret,
neither assigned in a shell line nor set as an `env:` value. It is **not** a YAML conformance parser — it reads the
block subset this repository uses and says so in its own second output line — and it is **not** a CI run.

**The gate was wrong about this project before it was right.** Its first pass over the committed file reported
`src/payload/payload.config.ts` as a missing script — but that path appears inside `if [ -f … ]`, an existence probe
whose whole purpose is to notice the file is absent, and inside an `echo`. The fix narrows W7 to *invocations* (a
`node`/`sh`/`bash` keyword followed by a file argument), skips globs, and the exemption now carries its own green case
so the narrowing cannot silently widen back. W10 was then extended to `env:` mappings, because the mapping form is
where a hard-coded credential actually lands and the shell-line form alone would have missed it.

**Regression proof: `scripts/tests/verify-workflow-structure.test.mjs` (304 lines, 14,038 bytes) — 32 cases, exit 0.**
Twenty-one red fixtures (more than one for the rules that have two forms: W1, W2, W3, W4, W5, W10), eight green
assertions — the baseline file, the W7 probe exemption, the W8 builtins exemption, the W10 generated-value exemption,
the W9 fixture-skip, and both W9 directions through its documented `NDM_EXPECT_SUITES` seam — plus the committed
workflow read green, the `pnpm test:gates` ↔ CI drift claim recomputed from `package.json`, and one case that takes a
**copy of the real workflow**, renames one gate script inside it, and proves the gate fails it. That last case is the
answer to "a step calling a script that no longer exists", the exact failure a reader cannot hold in mind across
forty-three steps.

**Wired three ways, same as H-10:** `pnpm audit:workflow` and `pnpm test:gate:workflow` (package.json now **37**
scripts), `test:gates` now chains **five** suites, preflight **check 9** (`node scripts/preflight.mjs` → `9 checks:
1 FAIL, 2 WARN, 6 PASS`, exit 1 — the FAIL is still Node), and two more `docs-gates` steps take the workflow to
**386 lines / 19,799 bytes / four jobs / 43 step items, 35 of them named**. The file checks itself: a mis-edit makes the step fail rather than
make the step vacuous.

**What H-11 does not change.** The workflow has **still never executed** — B-08 stays open, Standard §12 remains 0 of
12, and a structural pass is not a green tick. It replaces "verified by reading only" with "verified against ten named
rules, by a tool whose own red-ness is proven"; the residue — whether GitHub's real parser accepts the file, whether
each step behaves as written — is only answerable by an actual run after OD-4.

**Figures re-measured again for the same reason as above.** After this second batch of additions: ci.yml **386 lines /
19,799 bytes / four jobs / 43 step items (35 named)**; `package.json` **37 scripts**; gate suites **14 / 22 / 23 / 25 / 32**, all exit 0;
preflight **9 checks — 1 FAIL, 2 WARN, 6 PASS**; `verify-tables.mjs` and `verify-citations.mjs` counts re-run last, and
whatever they print at the moment of reading is the truth — the numbers in this file move every time a section like
this one is written, which is why §9 of `docs/TEST_AND_RELEASE_REPORT.md` gives the commands rather than the answers.

---

### L. The documented check commands were not read-only — H-12 and B-10 (1 November 2026)

**A `pnpm run` that installs instead of checking.** While wiring H-11 in, the documented read-only command
`pnpm run audit:workflow` never reached the script. pnpm 11.21.0 first verifies the dependencies declared in
`package.json`; `node_modules` is absent by design until OD-2, so it began resolving the whole tree against the
public registry (`Progress: resolved 669 …`). It was killed. The project directory gained nothing — no
`node_modules`, no `pnpm-lock.yaml`, re-checked after the kill — but packages landed in the machine-level store at
`E:\.pnpm-store\v11`, which this batch has no authority to touch. Every `pnpm <name>` in `docs/` carries the same
surprise, including `pnpm test:gates`; the `docs-gates` CI job is not exposed because it calls `node scripts/…`
directly (verified: no `pnpm` call in that job).

**Four fixes measured on the installed pnpm, not reasoned from documentation; all four failed or were out of reach.**
`verify-deps-before-run=error` in the project `.npmrc` is **ignored** — that key is one of the 67 pnpm reads only
from the *global* config file (its `pnpmConfigFileKeys` list in `dist/pnpm.mjs`). Proved twice: the install still
started with the line present, and a control line `registry=https://registry.example.invalid/` in the same file *was*
honoured (`ENOTFOUND`), so the file is read and only this key is not. `pnpm run --no-verify-deps-before-run <script>`
and `pnpm --no-… run <script>` both answer `[ERROR] Unknown option: 'verify-deps-before-run'`, exit 1 — no CLI form
exists. `engine-strict=true` (a key this file *can* set) does not help: the dependency check runs first, so the engine
complaint stayed a WARN and the install still started. And `pnpm config get verify-deps-before-run` prints
`undefined`: there is no `~/.npmrc` and no `%LOCALAPPDATA%\pnpm\config\rc`, so the built-in default `install` is in
force. What does work is machine-level and therefore the Owner's: `pnpm config set verify-deps-before-run error
--global`, or per shell `pnpm_config_verify_deps_before_run=error pnpm run <script>` (measured: refuses in about two
seconds with `[ERR_PNPM_VERIFY_DEPS_BEFORE_RUN]`, exit 1, nothing resolved, nothing downloaded).

**What was added, in the order that makes the next engineer safe rather than impressed.** `.npmrc` now documents all
of the above and **sets no options on purpose** — a settings file that looks like a guard and is not one is the defect
class H-9, H-10 and H-11 were each about. `scripts/preflight.mjs` gained **check 10**, which reads
`pnpm config get --global verify-deps-before-run` (a pure config read: it resolves and downloads nothing) and prints
`PASS` when a guard is armed, `WARN` with the trap spelled out and both remedies when it is not — the present state is
the WARN. Hole **H-12** and blocker **B-10** are registered in `docs/IMPLEMENTATION_PLAN.md` §8 and §2, and the remedy
is **OD-7**, the seventh Owner decision (§10.1) — one command, the cheapest thing on that list, and the only one that
installs nothing. The `pnpm <name>` aliases stay declared: they are correct the moment OD-2 lands, and deleting them
would break the three CI jobs that install first. Preflight is now **10 checks — 1 FAIL, 3 WARN, 6 PASS**, exit 1.

**Then the guard itself was measured, and three of my own claims about it were wrong.** The remedy text above named
`error` and listed the accepted values as install/prompt/error/warn. That was documentation-shaped reasoning, so
every value was run through the per-shell lever in a temp fixture — a declared dependency, no `node_modules`, no
lockfile, stdin closed — with a project `.npmrc` pointing the registry at `registry.example.invalid`, the one key a
project file *can* set, chosen precisely so that a value which does install dies on `ENOTFOUND` instead of writing
into the machine store. Nothing landed: no lockfile, no `node_modules`, and `find E:\.pnpm-store -newermt …` answers
**0** files. Measured behaviour of `pnpm run <script>`:

| `verify-deps-before-run` | exit | did the script run? | did an install start? |
|---|---|---|---|
| unset / `install` | hung at the registry | no | **yes — the trap** |
| `error` | 1 | no | no |
| `prompt` | 1 | no | no — **only because stdin was not a terminal**; pnpm's prompt defaults to yes |
| `warn` | 0 | **yes** | no (prints an out-of-sync warning first) |
| `false` | 0 | **yes** | no (no notice at all) |
| `yes-please` | 0 | **yes** | no — the switch in `runDepsStatusCheck` has **no default case**, so junk falls through |

Three consequences, each of which was a false statement in this repository an hour ago. `warn` and `false` do **not**
"refuse" — they run the script, which is why check 10 now says what each value was measured to do instead of sharing
one PASS sentence. `prompt` is not a guard: it refuses in a pipe and asks at a keyboard, so it moved from PASS to
WARN. And an unrecognised value must not be described as arming an install, because measurement says nothing is
fetched — it is safe by fall-through, not by design, and a pnpm bump could take that accident away. `error` remains
the recommended OD-7 value, now because it is measured to be the only setting that cannot install rather than because
the documentation lists it. The suite gained two cases (now **19**, exit 0): `false` as a PASS on the measured fact,
and a wording case that fails check 10 if it ever claims an install for a fall-through value. Red-green was done by
hand rather than assumed: deleting `error` from the classification makes the suite report `17 passed, 2 failed` and
exit 1, and restoring it returns `19 passed, 0 failed` with the file byte-identical to its backup.

### M. The specification generator mislabelled its own output — §2.2 closed with a suite (1 November 2026)

**The defect.** `scripts/copy-master-spec.mjs` writes `docs/MASTER_SPECIFICATION.md`, the copy every `line N`
citation in `docs/` resolves against, and then announces what it wrote. That announcement was
``wrote FILE | ${written.length} bytes | ${wl.length} lines`` where `written` is a **string**: the figure labelled
"bytes" was a UTF-16 code-unit count, so each typographic character the specification carries — em dash, curly
quotes, right single quote, less-or-equal — was counted once where the disk holds three, and the figure labelled
"lines" included the empty element `split` produces after a final newline. On the 1 November copy the true file is
**257,099 bytes over 4,069 lines**; the tool reported **255,561** and **4,070**. Errors in opposite directions, both
inside the plausible range for a document of this size, which is why neither was challenged and why a §2.2 record was
not enough — the next reader of that transcript would have trusted the new numbers just as readily.

**The fix.** The tail now re-reads the file it wrote as a `Buffer` and prints `writtenBuf.length` under the label
`UTF-8 bytes`, and takes the line count from `hasFinalNewline` rather than from `split`'s length, announcing
`(final newline present)` or `(no final newline)` so the branch is visible in the output. `Buffer.byteLength` was
not used: the file is already read back from disk for the byte-identical check, so measuring that `Buffer` reports
the artifact rather than the string that produced it. Nothing about what the tool *writes* changed — the on-disk size
is 257,099 before and after, and two consecutive runs differ only in the `Copy generated` timestamp row.

**Fresh run, exit 0.** `wrote docs/MASTER_SPECIFICATION.md | 257,099 UTF-8 bytes | 4,069 lines (final newline
present)` · `body byte-identical to source: YES (misaligned lines: 0)` · `verbatim body starts at this file's line
129 = source line 1` · `source sha256 5b30b21e…47ecd5` · `header rows: 15 discrepancies`. Cross-checked in the same
command sequence against `wc -c` (257099), `awk 'END{print NR}'` (4069), `grep -c '^'` (4069) and a Node
`Buffer.length` read (257099); the two superseded formulas re-evaluated on that same file returned 255561 and 4070,
which is what proves the new pair describes the same file rather than a different one.

**The guard, and what it does not assume.** `scripts/tests/copy-master-spec-output.test.mjs` — **11 cases**, exit 0 —
runs the real generator with a throwaway temp workspace as its `cwd` and compares what it prints to the file on disk,
with truth computed *differently* from the implementation (a `Buffer` length; a count of newline characters rather
than a split) so the test cannot restate the code it checks. It covers a multi-byte body, a pure-ASCII body, a body
with no final newline, a CRLF body whose breaks must survive un-normalised, the printed body-start line against the
real line, the alignment header both with and without `docs/DOCX_MD_ALIGNMENT.json`, and a source whose opening lines
duplicate the generated header — which the generator must refuse with exit 1 and no partial file. Red-green was
performed against the pre-fix formulas with the labels left byte-identical, so no failure could be blamed on
wording: `4 passed, 7 failed`, exit 1 — `printed 13806 != disk 13980 bytes`, `printed 117 != real 116 lines` — then
the file was restored (`diff` against the backup: **0 lines**) and the suite returned `11 passed, 0 failed`.

**Two things learned from the red run, both kept in the suite.** The four cases that stayed green are green for the
right reason: three never touch the two expressions, and the no-final-newline case failed on bytes but passed on
lines, because with no trailing newline the old `split` count is accidentally correct — the exact boundary a blind
`-1` would have broken. And an expectation of mine was wrong: a pure-ASCII *body* does not make a code-unit count
correct, because the provenance header this tool writes is itself full of em dashes. The defect was never
body-dependent, so the old label had no narrow-case defence. Three of the eleven cases failed on the first green
attempt for the same class of reason — a header assertion aimed at `stdout` when the header goes to the file, and a
line count read as the body's rather than the emitted file's — all three were defects in the test, fixed before any
claim was made.

**Wiring.** `package.json` gains `test:gate:spec-copy` (script count re-measured at **39** by
`node -e "Object.keys(require('./package.json').scripts).length"`) and the suite is the **seventh** entry in the
`test:gates` chain; `.github/workflows/ci.yml` gains a `docs-gates` step invoking `node
scripts/tests/copy-master-spec-output.test.mjs` directly, never through `pnpm` (§L). The workflow is now **416 lines /
22,226 bytes / 45 step items (37 named + 8 bare)**. `node scripts/verify-workflow-structure.mjs` exits **0** over the
edited file, and its W9 rule is the specific claim that the `test:gates` chain and the pipeline steps have not
drifted apart. All seven suites re-run together: 14, 22, 23, 25, 32, 19, 11 — exit 0.

**What this closes and what it does not.** A reporting defect in a Phase 1 tool, now with a guard on the report. It
validates no product requirement, and Level B is unchanged at **0 of 12** — the twelve Standard §12 checks still
require OD-1, OD-2, OD-3 and OD-4, not a corrected console line.

### N. Six Owner decisions granted, executed and verified — Gate 0 Passed, and 20 facts plus 82 rights records still owed (1 November 2026, authorization window)

**What arrived.** A formal Owner authorization message granting OD-1, OD-2, OD-3, OD-4, OD-7, Gate 0, OID-20 and
OID-22 in principle, and instructing that the remaining Owner inputs and the 82 asset-rights records be reconciled
against existing evidence — with the explicit boundary that the blanket authorization is *not* a source of factual
project information and may not be used to close them. Execution order was as instructed, adjusted only where a
documented dependency required it: OD-1 → OD-7 → OD-2 → OD-3 → OD-4 → Gate 0 → OID-20 → OID-22 → reconciliation.

**OD-1 — the runtime (B-01 closed).** `winget upgrade --id OpenJS.NodeJS.LTS --version 24.22.1 --exact --scope
machine` completed; `node -v` → `v24.22.1`, `npm -v` → `11.19.1`, `pnpm --version` → `11.21.0`. The ADR's requirement
is the range `>=24.22.1 <25`, not a patch: nodejs.org also publishes 24.22.2, and 24.22.1 is the newest release inside
that range this host's package manager carries. Node 25 was not installed. `scripts/preflight.mjs` flipped its Node
line from FAIL to PASS, printing `PASS | Node.js 24.22.1 | satisfies engines.node`.

**OD-7 — the guard, armed at the place that actually governs (B-10 and H-12 closed).** The mechanism was inspected
before anything was set, and it was **not** where the documentation assumed: pnpm 11.21.0's global config on this host
is `C:\Users\NaDa\AppData\Local\pnpm\config\config.yaml`; `~/.npmrc` does not exist here. Before: 3 keys, 59 bytes,
SHA-256 `67494dd19aef…627fc`, **backed up first**. The minimum change — one key, its value taken from this project's
own measured matrix rather than guessed — was `pnpm config set verify-deps-before-run error --global`. After: the same
three keys unchanged (`fetchRetries: 5`, `fetchTimeout: 600000`, `networkConcurrency: 1`, the last preserved on
purpose even though it is why the install was slow) plus `verifyDepsBeforeRun: error`. Verified behaviourally, not by
reading the file: `pnpm config get --global verify-deps-before-run` → `error`; `pnpm run audit:workflow` exit 0 with
zero `Progress:` lines; `pnpm test:gates` exit 0; preflight check 10 prints `PASS | pnpm run deps-before-run`.
`networkConcurrency` tuning is a machine decision this batch did not own.

**OD-2 — the tree, and two things it surfaced (B-02 closed).** `pnpm install` exit **0**; `pnpm-lock.yaml` written —
285,200 bytes / 8,399 lines / `lockfileVersion: '9.0'` — `node_modules` present with all 18 declared dependencies
linked and 701 entries under `.pnpm`, and the install printed `✓ Lockfile passes supply-chain policies`. Resolved
versions recorded rather than assumed: `payload` and all four `@payloadcms/*` siblings **3.92.1** (lockstep), next
16.4.3, react 19.3.1, **graphql 16.14.2** — 17.0.2 exists and was not pulled, which closes A-C3 empirically — and
**zod 4.6.7**, which closes A-C2 empirically. The two surfaced problems: **(1)** pnpm refused to finish while two
dependencies wanted install-time build scripts (`ERR_PNPM_IGNORED_BUILDS`, exit 1) **and** then refused every
`pnpm run <script>` with `ERR_PNPM_VERIFY_DEPS_BEFORE_RUN`; resolved by naming the packages to `pnpm approve-builds`
(`esbuild`, `unrs-resolver`), which wrote `allowBuilds` into `pnpm-workspace.yaml` — now a committed project file that
carries its reasoning. The alternative route was measured dead: pnpm 11 no longer reads the `pnpm` field in
`package.json` (it warns so), so an `onlyBuiltDependencies` entry there is inert and was **reverted rather than left
as a fake guard**. **(2)** No version constraint was overridden and no dependency added — but `pnpm lint` now fails
for a missing-declaration reason, recorded below.

**OD-3 — `.env`, six secrets generated, fourteen inputs left empty (B-03 closed for the configuration half).** `.env`
created: 5,212 bytes, 38 assignments — the same 38 keys as `.env.example`, none added, none dropped. Six values
generated locally from `crypto.randomBytes`: `PAYLOAD_SECRET` (64 hex) and five role/bootstrap passwords (48 hex
each), pairwise distinct and hex-only so they cannot break the single-quoted SQL interpolation in
`scripts/db/init-roles.sh`. Fourteen provider/endpoint values were **left empty and labelled in-file as still-required
Owner inputs** — they are OID-19's selections and may not be invented. No secret value was printed anywhere in this
window; verification used key names, lengths and counts only. `docker compose config --quiet` → exit **0** with zero
bytes emitted, which proves all seven `:?` guards are satisfied; preflight's `.env` line flipped WARN → PASS; `next
build` independently reported `- Environments: .env`. `.env` is git-ignored and absent from the index. **Not
executed:** `pnpm db:up` — the container bring-up was not requested.

**OD-4 — a repository, and one checkpoint (B-04 closed, B-08 un-rooted).** `git init` on a tree with no repository in
`E:\no` or any parent, so no existing history was found and none was overwritten. First commit **`aedeee0`** on branch
`main`: 150 files, 49,699 insertions. Verified before committing: `.gitignore` read line by line; `git check-ignore`
→ `.env` IGNORED, `node_modules/` ignored, `.env.example` correctly re-included; a name scan of the staged set found
no `.pem/.key/p12/pfx/secrets//id_rsa/credentials` path; a content scan for private-key blocks, AWS key ids, `ghp_`
and Slack tokens found nothing. `git remote -v` → empty; nothing was pushed, because the authorization forbids it.
Two facts stated rather than smoothed over: the commit records this machine's **pre-existing global** git identity
(changing git config is outside what this batch may do), and `reference/` plus `Noujoude.photo/` are committed
**on purpose** — 7 and 85 files — because that is what makes the read-only and never-overwrite protections enforceable
by diff.

**Gate 0 — adopted, recorded, and nothing in the specification was touched to make it pass.** The Owner's message
adopts the current Master Specification as the governing baseline and names the Owner as the change-control authority.
Recorded in `docs/OWNER_INPUT_REGISTER.md`, in `docs/TEST_AND_RELEASE_REPORT.md` §4A (Gate 0 → Passed, approver named)
and here. The baseline artifact is unchanged and byte-identical to source (SHA-256 `5b30b21e…`, 257,099 bytes over
4,069 lines, 219 requirement rows carrying assigned IDs). **No line of `reference/` and no line of
`docs/MASTER_SPECIFICATION.md` was edited to record this adoption.** Appendix E's per-item rows still read
`Pending Owner approval` where the Owner has not answered that specific item — blanket adoption of the baseline is
recorded as itself and is not smeared across 22 unrelated rows.

**OID-20 and OID-22 — recorded with the exact states, because a single word for both would have lied.** OID-20 is
`Accepted (internal targets only)`: the documented values are adopted as engineering and operational targets — RPO
≤1h / RTO ≤4h for PostgreSQL, ≤4h / ≤8h for media, ≤24h / ≤4h for configuration, 35 daily / 12 weekly / 12 monthly
retention, quarterly restore tests, and 99.5% monthly availability — and the register states what the acceptance does
**not** do: nothing is published as an SLA, no restore test has been executed, and no RPO/RTO has ever been measured.
OID-22 is `Approved in principle, conditional`: production deployment is authorized when the mandatory release gates
have passed, which waives no security, rights, data-protection or acceptance requirement, and the actual target and
credentials remain execution prerequisites. Nothing was deployed; there is no target; no gate that depends on
deployment moved.

**The reconciliation, and its honest result: 0 of 20 facts, 0 of 82 rights records.** All twenty outstanding inputs
were searched for an authoritative source already in the workspace before any was reported as missing; `docs/OWNER_INPUT_REGISTER.md` §6A now
carries the search commands, the near-misses, and a per-item statement of the exact missing fact and the minimum
evidence that would close it. The search did surface new authoritative material — the specification's own
Owner-input register structure, which the project register now maps against — but nothing that supplies a legal name,
a jurisdiction, a founding date, an accreditation, a contact address, an artifact record, or a licence. The 82 asset
records were re-derived from the inventory CSV and the reference sweep in `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §7.2:
rights status is still `UNKNOWN — no rights statement supplied in reference/` on all 72 originals and `Awaiting Rights
Review` on all 10 additional assets, and `Not Approved — no approval record supplied` on **82 of 82**. `.env` and the
git checkpoint were considered as evidence and rejected: neither is a rights statement. Possession of a file is not
ownership of its copyright, and a byte-perfect copy of an unlicensed photograph is a perfect copy of an unlicensed
photograph.

**Four documentation states this window invalidated, and repaired rather than left.** The H-10 compose suite went
**red on a real property change**: 24 passed, **1 failed**. Its negative case had only ever suppressed the *process*
environment, but Compose also reads `.env` from the project directory — so once OD-3 created that file, the seven
`:?` guards stopped biting and the case could no longer prove what it claimed. Repaired **in the test, not in the
product**: it now suppresses both sources with `--env-file <empty>`, and the repair was proved non-vacuous three ways
— the new form exits 1 with `required variable … is missing a value`; the old form exits 0 now that `.env` exists;
and the same command against a copy with the `:?` guards stripped exits 0 with `Defaulting to a blank string`.
Separately, the last case of the H-12 suite had hard-coded an assumption about the *machine* (`WARN` in a real
workspace) that OD-2 and OD-7 made false; it now derives its expectation from the state it is standing in and asserts
preflight's classification against that, so it passes armed *or* guarded and cannot be quietly satisfied by either — a
case that only passes in one world is a fixture, not a test. ADR-003's title carried a patch version that the
requirement does not; ADR-004 and `docs/DATA_MODEL.md` §9 both asserted that `pnpm install` or `docker compose config`
still blocked them, which is now false; each was rewritten with the measured state, and the four stale claims were
found by a sweep, not by luck.

**A fifth incident of the same class, this time caused by this window's own edits.** Rewriting ADR-003 and ADR-004
inserted lines into `docs/ARCHITECTURE_DECISIONS.md`, which shifted every later line in that file — and the citation
gate went **red: 4 `LINE_OFF`**, three in `docs/AI_CURATOR_GOVERNANCE.md` and one in `docs/DATA_MODEL.md`, each
citing a pre-shift line (367 → 384, 374 → 391, 395 → 412). This is not a tooling quirk but the real maintenance
property of a line-number citation system: editing one document can invalidate a correct citation in another, and only
a gate that re-resolves every reference will notice. Fixed by repointing the four references, re-measured green.

**Two requirement rows moved, and only two.** `docs/REQUIREMENTS_TRACEABILITY.md` §1 was re-counted from the table body
rather than incremented by hand: `grep -E '^\| REQ-' … | awk -F' [|] ' '{print $NF}' | sort | uniq -c` → **166 Not
Implemented + 24 Implemented and Verified + 19 Blocked by Owner Input + 6 Partially Implemented + 4 Out of V1 Scope =
219 rows**. REQ-BLD-002 left `Blocked by Owner Input` because OD-1 executed and preflight prints the Node PASS line;
REQ-BLD-005 left `Not Implemented` for `Partially Implemented` because the lockfile now exists and is committed while
its named verification (`pnpm install --frozen-lockfile`) has never been run. Application-level verified progress is
still **0 rows** — the 24th is a runtime reading, not product behaviour — and the 31 October tally these figures
supersede stays in §H and §I above as the record of what was believed then.

**What this batch did not do.** It did not touch `src/`, write a collection, generate a migration, add a dependency,
or start Phase 2. **Two defects found while executing are reported, not repaired,** because the authorization's
boundaries put them outside it: `eslint.config.mjs` imports `@eslint/js`, which no manifest declares, so `pnpm lint`
dies with `Cannot find package '@eslint/js'` at exit **2** — the lint gate cannot run at all, independently of `src/`;
and `pnpm format:check` fails at exit **1**, because hand-edited documentation rows are not Prettier-shaped, while
running `--write` would rewrite bytes and shift the line numbers that 533 cited fragments across this documentation set
resolve against. Level B is still **0 of 12**: four rows now have measured exit codes (`lint` 2, `format:check` 1,
`typecheck` 0 over 19 JavaScript files with `checkJs` off — a hollow green by this project's own H-1 rule — `test` 1
with `No test files found`, `build` 1 with `Couldn't find any pages or app directory`), and none of them is a
defensible pass.

---

### O. The Arabic name arrives, the identity system is built, and a shaping defect that visual review had passed is found by counting ink (2 November 2026)

**What the Owner supplied.** One message, in Arabic: the institutional name is **نجود**, and everything required is to
be created from it. That is the first Owner *fact* this project has ever received — the 1 November window recorded
**0 of 20** facts supplied — and it lands in exactly one field of a two-field row: `docs/OWNER_INPUT_REGISTER.md` OID-01
now reads `Provided` for the Arabic institutional name and stays `Outstanding` for the English legal name, the legal
nature and the jurisdiction; OID-02 now reads `Provided` for the Arabic rendering of the name and stays `Outstanding`
for the Arabic tagline and the remaining brand strings. The register's §3 heading is re-counted from **18 Outstanding +
2 decided 1 Nov + 2 partially supplied 2 Nov**, and §6B records the message verbatim with its authority limitation:
this is a chat message, not a file under `reference/`, so it is the Owner's word with no artifact to cite.

**What was built.** The §12.7 role set in both scripts, as editable vectors plus a raster matrix: **1 hand-authored
parent + 15 colour masters + 10 mono variants + 88 PNGs = 114 identity files**, generated by
`build.mjs` → `export.mjs` → `inventory.mjs`. Two properties were measured rather than asserted. Re-running the chain
reproduces every SVG and every PNG **byte-for-byte** (`find … -exec sha256sum` over the set, identical before and
after), so "generated" means regenerable, not merely not-hand-edited. And the catalogue is now machine-fed:
`docs/BRAND_ASSET_INVENTORY.csv` (114 rows × the same 20 columns the audit CSV uses) reads each file's bytes for size,
SHA-256 and dimensions, reads `brand/svg/manifest.json` for role and script, and reads a new
`brand/_tools/export-manifest.json` for each raster's master, ground and ink. It is a separate file because
`docs/ASSET_INVENTORY_AUDIT.csv` is `scripts/audit-assets.mjs`'s output over `Noujoude.photo/`, and hand-appending
`brand/` rows there would be erased on its next run and make that CSV disagree with its own generator.

**The defect, and why review missed it.** Every Arabic asset — wordmark, both lockups, watermark — was rendering its
four letters **detached**. The cause was in the shaping tool: `text2svg.py` requested `isol/init/medi/fina` as *user*
features, and HarfBuzz's Arabic shaper had already chosen the positional forms, so the same GSUB lookups ran a second
time over their own output and un-joined the word. Reproduced on command for the record, both runs at `--size 1000` on
the same TTF and the same four letters: with `medi=1,fina=1` the run measures **layout width 2070/1000 em, ink
2192×1173 (aspect 1.87) and 6 ink components**; with the default set it measures **1437/1000 em, ink 1465×1147 (aspect
1.28) and 4** — joined body, detached د, two dots. The corrected figures are what every shipped Arabic asset carries
(`noujoude-wordmark-arabic.svg` → `joincheck.mjs` **4 components**; `manifest.json → type.arabicAmiri` aspect 1.30), and
the reference is an independent pipeline: Blink/HarfBuzz rendering the same TTF in headless Edge agrees exactly on the
advance (143.7/100 em against 1437/1000 units) and to 0.01 on the Tajawal aspect (2.16 against 2.15). Two things follow
from this that are worth stating plainly. A rendered image that "looks like Arabic" is not evidence that the Arabic is
joined — the check has to be structural, so `brand/_tools/joincheck.mjs` is now part of the toolchain rather than a
scratch diagnostic. And the fix moved the Arabic ink aspect from **1.87 to 1.28**, which unbalanced every lockup
that had been composed against the wrong number; that was resolved with a named, documented rule (`rules.bilingualSizing`:
the Arabic name is sized by **height** against the Latin name, ×1.25, never by width) rather than by re-guessing
constants until the picture looked right again.

**A rights conclusion this window reversed, in the stricter direction.** The first cut of the inventory derived each
raster's master from its filename and assigned rights by asset family. Both were guesses, and one was visibly wrong:
`og-1200x630-arabic.png` was catalogued against the **Latin** stacked lockup, because `-\d+.*$` swallows the `-arabic`
marker along with the size. Replacing the guess with the exporter's own record fixed that row and, separately, replacing
a naming convention with a markup test (`id="n-half"`, `<g id="artwork">`, `href="#leaf"`) moved **54 of the 114 rows**:
the badge, the app icon, all four lockups, both watermarks and the ornamented Latin wordmark all *inline seal artwork*,
so they inherit `NDM-AST-001`'s UNKNOWN rights, and the laurel on the ornamented wordmark is literally the seal's own
`#leaf`. The honest split is **77 of 114 rows rights-open, 37 clean** — against the **23** the naming convention
reported. Only `noujoude-mark-small.svg` and the plain and alternate wordmarks are genuinely independent, the small mark
being a geometric N rather than a shrunken seal.

**One stale artifact was found by this batch's own verification.** `brand/svg/manifest.json` on disk predated the
`rules.shaping` / `rules.joinCheck` / `rules.bilingualSizing` keys that `build.mjs` had already been edited to emit, so
the shipped manifest did not contain the rule that explains why the shipped Arabic is correct. Re-running the chain
closed it; the idempotency check above is what proves the rebuild changed nothing else.

**What this batch did not do, and did not come close to doing.** It did not touch `src/`, add a dependency, write a
collection, or start Phase 2 — the identity system is 114 files and three generators, and **no application consumes any
of them yet**, which is why `REQ-BRAND-007` is `Partially Implemented` and not more. It approved nothing: `OID-18` (final
logo and variants) and `OID-15`/`OID-16` (rights) are Outstanding, so all **114 rows read `Not Approved`**, and protocol
§7.5 means the supplied *name* cannot be read as approving the *mark* derived from it. It published nothing, and left the
Arabic tagline متحف التراث الرقمي flagged in the manifest as `DERIVED … must not be published as approved copy`. **Gate 1
does not move:** it asks for approved identity fields, and a name that has arrived is not a name that has been signed
off. Requirement rows added: 2 (`REQ-BRAND-007`, `REQ-BRAND-008`), no row removed or re-labelled, so the register is
**221 rows / 221 distinct IDs** measured 2 November against 219 on 1 November, and `Partially Implemented` is 6 → 8 while
`Implemented and Verified` holds at **24** and application-level verified progress holds at **0**.

---

### P. Closure under the Owner's 2 November directive: an application that builds, three Standard §12 rows green over real code, eight new ADRs, and a closure record still owed (1–2 November 2026, closure window)

**What arrived, and what class of authority it is.** Two Owner messages dated 2 November 2026. The first is the
Arabic-name message §O records; the second is `FINAL OWNER DIRECTIVE — PHASE 0 & PHASE 1 CLOSURE → PROFESSIONAL
MOTION PHASE`, in eight parts: §1 execution authority plus eight adopted defaults, §2 ten named defects in the
quality framework, §3 Phase 0 and Phase 1 completed with real command output, §4 honest treatment of external
blockers, §5 closure only when every mandatory exit criterion has passed, §6 one conclusive machine-readable
evidence record, §7 a motion phase that follows closure, §8 a single-line status answer. Both are chat messages and
neither is a file under `reference/`, so the register records that limitation at the point where the authority is
used rather than in a footnote: `docs/OWNER_INPUT_REGISTER.md` §6C for the directive, §6B for the name. **§N above
is the 1 November record and is not rewritten here**; everything below is this window's own measurement, and where
it contradicts an older entry the contradiction is registered in §C instead of being edited out of history.

**The eight authorizations, re-measured rather than re-asserted.** The directive §1 keeps these in force and forbids
re-requesting them; the checks below were run again in this window, and the states are their outputs.

| Authorization | Re-measurement in this window | State after it |
|---|---|---|
| OD-1 — Node runtime (B-01) | `node -v` → `v24.22.1`, the range `>=24.22.1 <25` and not a patch | Unchanged, still verified |
| OD-7 — pnpm machine guard (B-10, H-12) | `pnpm config get --global verify-deps-before-run` → `error` (the command also prints a `--global` WARN line, which is pnpm's own notice, not a failure); `pnpm test:gates` now exits **1**, because its first suite fails on a table in a file this batch does not own — the guard itself is measured by the config read plus the absence of any `Progress:` line in `pnpm lint`, `pnpm test` and `pnpm test:gates` output (3 greps, 0 matches) | Guard unchanged and still armed; the suite chain is red for a reason named below |
| OD-2 — install and lockfile (B-02) | `pnpm-lock.yaml` re-measured at **285,494 bytes / 8,408 lines**, `lockfileVersion: '9.0'`; `package.json` now declares **11** dependencies and **10** devDependencies, against the 11 + 7 §N recorded | Grew by three declared packages, named below |
| OD-3 — local environment (B-03) | `.env` at 5,212 bytes, **38** keys, **14** provider/endpoint values still empty by design; `git status --porcelain --ignored` prints `!! .env`; line count corrected in §C item 10 | Unchanged in substance |
| OD-4 — Git checkpoint (B-04) | `git log --oneline` → **two** commits, `aedeee0` and `9522379`, branch `main`; `git remote -v` empty; `git status --porcelain \| wc -l` → **55** entries at final measurement (**26** modified, **29** untracked), against the **41** read earlier in the same window and the **52** measured between them | Two checkpoints, no remote, and a working-tree count that is **moving** because other workstreams are writing into this tree while this batch edits two files |
| Gate 0 — specification adoption (OD-6) | Not re-run: the adoption is an Owner act with a named approver, recorded in `docs/TEST_AND_RELEASE_REPORT.md` §4A and unchanged since 1 November; no line of `reference/` was edited to keep it passing | Still Passed, still the only gate with an approver |
| OID-20 — internal reliability targets | No restore has ever been attempted; the figures remain internal | `Accepted (internal targets only)`, nothing published as an SLA |
| OID-22 — conditional production authorization | Nothing deployed, no target named, no credential created, Gate 5 Open | `Approved in principle, conditional`, unchanged |

**The application now exists, and here is what it measures.** Directive §14's application-initialization requirement
was the one Phase 1 line §N and §O both recorded as *not touched*. It was executed on 2 November 2026 and
re-measured in this batch, not copied from the plan: `find src -type f | wc -l` → **32** files, which by extension
are **18** `.tsx`, **8** `.ts` (four of them test files), **5** `.css` and one `README.md`;
`find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) | xargs wc -l | tail -1` → **1,752 lines**
over the 31 code and style files. `next.config.mjs` is present and is loaded by the build; it carries
`reactStrictMode`, `poweredByHeader: false` and one redirect entry, `/` → `/en` with `permanent: false`. The four
legs Standard §2.3 step 9 asks for are recorded green on this host, but they were **not** all run by this batch, and
the record separates them by source rather than laundering the difference: `pnpm typecheck` exit **0**, `pnpm lint`
exit **0** and `pnpm test` exit **0** with 4 files and 34 tests are this batch's own command outputs; `pnpm install`
exit 0 against the committed lockfile is 1 November's OD-2 execution, carried in `docs/IMPLEMENTATION_PLAN.md` §0
and §10.1; and `pnpm build` exit **0** emitting **16** routes, followed by `pnpm start` and the HTTP probes, is the
transcript in `docs/ROUTE_RUNTIME_EVIDENCE.txt`, which is where `/` → **307** with `location: /en`, `/ar` →
`<html lang="ar" dir="rtl">`, `/en/artifacts/BAD_SLUG` → **404** and `noindex, nofollow` on every shell were received
from the running server. This batch ran no build and started no server.
**What that is not:** no Payload config, no collection, no migration, no database connection, no image pipeline, no
Control Center, no editorial sentence and no institutional claim — a working shell over an empty library, and
Directive §15 is the reason this paragraph states the limit in the same breath as the exits. One artifact still
contradicts it: `docs/ASSET_INVENTORY_AUDIT.csv` carries the empty-`src/` claim on all 82 rows, registered at §C
item 8 rather than hand-edited.

**Eight new ADRs, counted rather than recited.** `grep -c '^### ADR-' docs/ARCHITECTURE_DECISIONS.md` → **33**, the
ID list contiguous from ADR-001 to ADR-033. The eight added in this window are ADR-026 centralized CSS custom
properties as the token layer with CSS Modules for component scope; ADR-027 GSAP for cinematic timelines and
scroll-driven scenes; ADR-028 Motion for React component-level interaction; ADR-029 plain CSS for simple state
transitions with the rule that no element may carry two motion owners; ADR-030 Lenis deferred rather than rejected;
ADR-031 Rare Pieces resolved as an editorial collection treatment with **no new route**; ADR-032 the untracked
`brand/` tree preserved and quarantined; ADR-033 security documentation extended in place with no competing
security file. Each names what it excludes, and the route registry in `src/domain/routes.ts` proves ADR-031 as a
code fact — **15** canonical locale-prefixed routes and no rare-pieces segment. None of them authorizes animation
work: §7 of the directive places the motion phase **after** closure and says in terms that it is not a showcase,
and the three adopted engines are the only ones this project may install without a further decision.

**The quality framework's ten defects, and the score recalculated without inflating it.**
`docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` v0.2.0 carries the correction log at its §14, one landing place per defect:
the credit formula became `c_r = min(S_r, I_r, V_r)` so a row cannot be accepted against a question the Owner has
not answered; CAP-3's risk-acceptance waiver for an unresolved High or Critical was deleted rather than tightened;
the reduced-motion worked example is held by CAP-1 and CAP-5, not CAP-3; responsive behaviour now reports the
specification gap and the verification gap separately; the B-08 wording no longer claims that nothing can execute,
because seven suites and four toolchain checks do; the A.5 privilege run is labelled `disposable-harness` evidence
and barred from standing for application security, migration, restore or any production claim; caps are printed as
`A_d ≤ k_d × W_d` with the numeric ceiling beside each; within-dimension weights are equal and `N_d` is frozen so
splitting rows cannot buy credit; four acceptance levels are named L1–L4; and the blocker register was reconciled
against `docs/IMPLEMENTATION_PLAN.md` §2, the only place a blocker ID may be minted. The recalculated score of
record is **5.45 / 100 at level L3**, against the **4.1** published at adoption, and §C item 9 keeps both readings
on the record with the reason for the difference. The framework's own approval line names the Owner, through
directive §1 and §2, as the approver, and this agent did not approve it. L1 is genuinely achieved, L2 is met on
§14 and on Level A but **signed nowhere**, and L4 is blocked by CAP-3 on measured advisories rather than on absence.

**Two blockers minted by execution, and an ID collision the reconciliation caught.** **B-11** exists because the
dependency scan ran: `docs/DEPENDENCY_AUDIT_2026-11-02.txt` preserves `pnpm audit --audit-level=high` at exit **1**
with 15 vulnerabilities, `4 low | 5 moderate | 3 high | 3 critical`, the Criticals in `tinypool` and `dompurify` and
the Highs in `dompurify` and `happy-dom`, reached through `vitest`, `@payloadcms/richtext-lexical` and the Monaco
chain inside `@payloadcms/ui`. No package version was changed to silence it and no advisory was re-labelled benign,
because every remedy is an upgrade and the mandate bars uncontrolled installation; that decision is now
`docs/OWNER_INPUT_REGISTER.md` OID-23. **B-12** exists because zero artifact records exist — the Morocco inventory
is outstanding, and the empty-state pages were built so that the absence renders honestly. Reconciling the register
also surfaced a **second ID collision**: `docs/IMPLEMENTATION_PLAN.md` §10.2 had re-used B-05, B-06 and B-07 for
three meanings §2 does not carry, and it is now re-pointed at §2, with these two conditions given fresh IDs rather
than colliding ones. The register's state as measured 2 November: **twelve** blockers, **six** cleared (B-01, B-02,
B-03, B-04, B-09, B-10) and **six** open (B-05, B-06, B-07, B-08, B-11, B-12).

**The two authorized repairs, and the state each left behind.** The `.prettierignore` correction the Owner authorized
as the only formatting change closed hole **H-13**: the file re-measured in this batch at **66 lines / 4,411 bytes /
16 patterns**, naming `reference/`, `Noujoude.photo/`, the quarantined `brand/` and the citation-addressed `docs/`.
Its effect is a count, not a claim: the formatting scope fell from **103** files to **25**, and `pnpm format:check`
still exits **1** — re-run at this batch's close, after the scratch files were removed, where it prints **25**: the
**19** under `scripts/` plus the **6**
hand-written config files (`ci.yml`, `docker-compose.yml`, `eslint.config.mjs`, `playwright.config.ts`,
`vitest.config.ts`, `tests/setup/env.ts`). Earlier in the same window it printed **27**, and the delta was two
`.tmp_cfg*.json` scratch files a concurrent workstream had left at the repository root, which no ignore rule covers;
they were deleted, not ignored, so the 25 is the tree a fresh clone would see. **None** of the 25 is under `src/` and **none** under `docs/`,
which is what the two authorized additions bought and why the red is acceptable to report — and the count is one the
batch can only quote with its timestamp, because other workstreams are writing into this tree while this one edits. The red is not repaired from here: directive §1 authorized the ignore correction and forbade
broad reformatting, and `prettier --write` across the tree would rewrite bytes in files that `docs/` cites by
addressed line, converting a formatting fix into citation-gate defects. Whether to accept, defer or schedule that
work is now OID-25, an Owner decision with a named approver, not a standing silent exception. The lint gate was
restored the same way: `@eslint/js` declared at `9.39.5` — a version verified compatible rather than guessed — with
`typescript-eslint` at `8.72.1` and `@types/react` at `19.3.0`, taking `pnpm lint` from the exit **2** §N recorded
(`Cannot find package '@eslint/js'`) to exit **0**, re-measured in this batch. The three additions pulled nothing new
from the network: the store count did not move and the plan §1 records `downloaded 0`, so these were declarations of
packages already resolved on disk.

**The security document's verification plan, extended rather than duplicated.** `docs/SECURITY_AND_PERMISSIONS.md`
gained §16, a verification plan of **20** cases measured as `grep -oE '^| SV-[0-9]+ '` → **20**, IDs `SV-01` through
`SV-20`, each carrying the control it verifies with its source section, the environment class it will run in, the
method, a **numeric** exit criterion, the phase that owns executing it, and what stays unproven until then. It opens
with the five-rung environment-class ladder that caps every claim in it, and it closes with an explicit non-claim
statement: no case is marked passed, because the release-gate rule requires recorded evidence **and** a named
approver and this document supplies neither for any of them. ADR-033 is what keeps this an extension rather than a
second plan, and no competing security document was created.

**Three Owner rows this window opened, and the refusals the directive wrote down.**
`docs/OWNER_INPUT_REGISTER.md` grew from 22 rows to **25**, all three new rows `Outstanding` with the Owner named as
approver: **OID-23** the dependency-advisory remediation decision, because the build may not upgrade a dependency
this mandate withholds; **OID-24** ratification of the default locale and the root redirect target, because the
served root resolves to `/en` by an engineering default — verified in the code before it was written down:
`src/domain/locale.ts` sets `DEFAULT_LOCALE` to `en` and its own comment records the Owner as not having ratified
it, and `next.config.mjs` sets `permanent: false` for the same reason; **OID-25** the standing formatting red. The
register's §6C records the directive's grants alongside the seven things it explicitly did **not** grant: no
production deployment, no publication of unsupported content, no broad reformatting, no animation engine beyond the
three adopted, no dependency upgrade, no fabricated credentials, rights, CI runs, font licences or institutional
facts, and no remote repository. Nothing in §1's restatement moved a factual row: **0 of 82** assets are rights-cleared
and 21 of 25 Owner rows are still `Outstanding`.

**Where the closure record still is.** Directive §6 asks for **one** machine-readable closure record with the
commands, exit codes, gate results, the commit id, file hashes and a SHA-256 manifest. Two documents already cite
`docs/PHASE01_CLOSURE.json` as that artifact — `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` §10B and
`docs/ARCHITECTURE_DECISIONS.md` §7 — and measured in this batch `ls docs/*.json` returns **4** files with no such
name in them, while `git log --oneline` shows **two** commits and `git status --porcelain` shows 55 uncommitted
entries, so the commit id such a record would carry does not exist yet either. The closure record is therefore
**owed, not produced**, and per directive §5 closure is not application readiness and not production release
approval; this changelog does not claim any of the three.

**Two defects this batch observed in files it does not own, and did not repair.** Mid-window `node
scripts/verify-citations.mjs` returned exit **1** with `NOT_FOUND 1` in `docs/REQUIREMENTS_TRACEABILITY.md` and a
`REF_BLANK_TARGET` on a bare reference in `docs/ARCHITECTURE_DECISIONS.md`, and `pnpm test:gates` returned exit
**1** at the same moment with its real-docs case failing (22 passed, 1 failed). Both citation defects belonged to
concurrent editing outside this batch's two files and both were gone on the next run: the citations gate is exit
**0** at final measurement, 543 fragments across 14 files, `VERIFIED 433`, `LINE_OFF 0`, `NOT_FOUND 0`. One defect
did **not** clear, and this batch leaves it exactly where it found it: `node scripts/verify-tables.mjs` exits **1**
on malformed tables in documents it does not own — `1 of 238 tables in 14 files` at its first reading and **3** at
its last, and the next run already listed **4** uneven rows across `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md`,
`docs/REQUIREMENTS_TRACEABILITY.md` and `docs/TEST_AND_RELEASE_REPORT.md`, where a header declares 3, 7 or 6 columns
and a row carries 9, 8 or 5 because an unescaped pipe inside a cell was read as a separator. None of those files is
this batch's to edit: `docs/OWNER_INPUT_REGISTER.md` and this changelog are the only two files it may write, no
table it authored appears in any reading of the output, and silently repairing another workstream's table would hide
its edit. The consequence is stated
rather than smoothed over — `pnpm test:gates` chains its seven suites with `&&`, so it stops at the first failing
suite and the six behind it did not run under that command. They were each invoked directly, as `pnpm test:gates`
documents them, and all six exit **0** (22, 23, 25, 32, 19, 11 cases), while `verify-tables.test.mjs` prints 13
passed and 1 failed of its own 14. Across the seven suites that is 146 assertion cases and one failure, and it is
the failure of a document gate over documents this batch does not own — which is why §C item 11 records the state
instead of the green. The mechanism is the one §N's fifth incident describes: a line-number citation and table
system couples every document to the byte-level shape of every document it cites.

| Command run in this batch | Exit | What it printed |
|---|---|---|
| `pnpm lint` | **0** | eslint over `src/`, `scripts/`, `tests/` with the type-aware guards |
| `pnpm typecheck` | **0** | `tsc --noEmit` |
| `pnpm test` | **0** | `Test Files 4 passed (4)`, `Tests 34 passed (34)` |
| `pnpm test:gates` | **1** | the first suite prints 13 passed, 1 failed, and the `&&` chain stops there |
| `node scripts/tests/*.test.mjs` (seven, run individually) | **1**, then **0** × 6 | 14, 22, 23, 25, 32, 19, 11 cases — 146 in total, one failure, all in the tables suite |
| `pnpm format:check` | **1** | `Code style issues found in 27 files`, 19 of them under `scripts/`, none under `src/` or `docs/` |
| `node scripts/verify-citations.mjs` | **0** | scanned 14 files and 543 line-bearing fragments; VERIFIED 433, LINE_OFF 0, NOT_FOUND 0, NO_LINE_REF 91, of which 0 are verbatim requirement text |
| `node scripts/verify-tables.mjs` | **1** | MALFORMED TABLES: 3 of 238 tables in 14 files at one reading and 4 uneven rows at the next, none of them in a file this batch owns |
| `grep -c '^### ADR-' docs/ARCHITECTURE_DECISIONS.md` | **0** | 33 |
| `find src -type f \| wc -l` | **0** | 32 |
| `ls docs/*.md \| wc -l` | **0** | 14 |
| `git status --porcelain \| wc -l` | **0** | 55 entries at the final reading; 41 and 52 earlier in the same window |

**What this batch did not do.** It ran no build, no server, no install and no audit — those transcripts already
exist in `docs/ROUTE_RUNTIME_EVIDENCE.txt` and `docs/DEPENDENCY_AUDIT_2026-11-02.txt` and re-running them would
only have produced a different timestamp. It created no commit, no remote and no CI run; it started no container
and touched no database; it cleared no rights, invented no institutional fact, no font licence and no artifact
record; it upgraded no dependency to quiet an advisory; it reformatted nothing beyond the one authorized ignore
correction; it signed no gate and produced no closure record. It changed exactly two files — this changelog and
`docs/OWNER_INPUT_REGISTER.md` — and the sum of its authority is to bring two registers up to the facts without
manufacturing a fact.

### Q. Phase 0/1 closure lands with its evidence bundle, and the motion phase opens on a stage that is measurably empty (2 November 2026)

**The closure record the Owner's directive §6 asked for, and nothing beyond it.** The battery was run once, with
every exit code read straight from the shell rather than from a pipe, and the verbatim stdout of each command is
retained in `docs/PHASE01_CLOSURE_TRANSCRIPT.txt`. Green: typecheck, lint, `pnpm test` over 4 files and 34
assertions, `pnpm test:gates` over the seven gate suites, the citation gate, the table gate, preflight at 0 FAIL,
1 WARN and 9 PASS, and a real production build emitting 16 routes. Red, and reported red rather than silenced:
`pnpm format:check` over 25 files, none of them under `src/` or `docs/`, because the Owner authorized exactly one
`.prettierignore` correction and forbade broad reformatting; and `pnpm audit --audit-level=high`, 15
vulnerabilities with 3 critical and 3 high, which is blocker B-11 and which no version was changed to quiet. The
machine-readable result is `docs/PHASE01_CLOSURE.json`, and the digest manifest is
`docs/PHASE01_CLOSURE_SHA256.txt` — 189 entries, one per file of the committed tree except itself, re-verified by
`sha256sum -c` at exit 0, and meaningful as blob digests because `core.autocrlf` is false and the repository
carries no `.gitattributes`. The closure commit is `28aa2145182350c19442c5a1d2ac831508870b8a` on `main`: 66 files,
6,066 insertions, 657 deletions, no remote created and nothing pushed, the quarantined `brand/` tree deliberately
not staged, and `.env` confirmed absent from the index and the commit.

**A defect the transcript keeps rather than edits out.** Two lines in its structural section exited 2 because this
harness passed an unquoted pattern to `grep`; the corrected block follows immediately after them with quoted
arguments, and the flawed lines stay so that the record shows the mistake instead of hiding it.

**Phase 1's acceptance, stated as two facts rather than one.** The Owner's directive §5 orders closure conditional
on every mandatory exit criterion passing, and §7 makes the motion phase follow it; that conditional was evaluated
by measurement, so the plan's acceptance row now reads as a dated conditional closure instruction that is
satisfied, and as a separate acceptance-signature artefact that is still not written. This batch did not
manufacture the second thing.

**The motion phase opened exactly as §7 instructs — by inspecting before proposing.** What the inspection returned
was a stage with nothing on it, measured on the host and recorded in `docs/MOTION_SYSTEM.md`: 0 of 82 catalogued
assets approved, brand material quarantined and unadopted, 0 `next/image` imports, 0 `img` elements and 0 asset
references anywhere under `src/`, 0 client components in the whole tree, 0 `transition` declarations and 0
`@keyframes` blocks across the four module sheets and the one global sheet, and `gsap`, `motion` and `lenis`
absent from `package.json`, from `pnpm-lock.yaml` and from `node_modules`. The e2e instrument that rendered
inspection requires answers `Error: No tests found` at exit 1, because the configured `testDir` has never been
created. So the document specifies the system — token layer, one-owner-per-class engine matrix, scene format, and
per-page direction for all ten surfaces the Owner named — and animates nothing, because a scene built over an
uncleared image slot and an empty-state notice is precisely the animation showcase §7 forbids.

**A traceability defect found while writing it.** `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` makes QA-05's test method
a scene-by-scene review against a 24-field specification, and that field list exists nowhere in `docs/` or
`reference/` — a search returns the one mention and nothing else. The motion document supplies a twelve-field
operational subset, says plainly that it is a subset, and the framework row now records the discrepancy instead of
continuing to cite an artefact nobody can read.

**No score moved.** QA-05 stays capped at 0.0 under CAP-1 and CAP-5 and the total stays 5.45 of 100 at level L3,
because writing specifications is not implementing them and the framework's own rule forbids moving a row to PASS
by document. The recount that the scene specifications could justify is named as work, with the ledger obligation
attached.

**The manifest is a living file, and the commit that proved it was a defect, not a footnote.**
`docs/PHASE01_CLOSURE_SHA256.txt` was generated over the closure tree of 189 files. The motion batch regenerated it
over 190 entries — the motion document had joined the corpus — and its own commit message asserted that the
regenerated copy had landed. It had not: the file was unstaged when that commit was made, so commit `0d6c2fa` carried
the 189-entry closure copy while the working tree held the 190-entry one. The claim was in the message and the file
was in the tree, which is the worst combination because a reader trusts the message. The repair is this commit, made
as a new commit rather than an amendment, so the false sentence stays visible in history as the evidence that the
defect existed. The closure-time copy is not lost either: it is readable with `git show` against that path inside
commit `28aa2145182350c19442c5a1d2ac831508870b8a`, and it is the copy whose digest was quoted in the Owner-facing
closure line. Nothing in `docs/PHASE01_CLOSURE.json` was rewritten to accommodate any of this, so the closure record
still says what it said when it was committed.

**Why the manifest moves even when nothing is learned.** `pnpm audit:citations` rewrites
`docs/CITATION_VERIFICATION.json`, and that file's first field is a generation timestamp. Running the gate therefore
changes one tracked file's bytes with zero change to any measured value — this batch's run moved only that line, and
the counts around it were identical to the closure readings. The manifest is regenerated after every gate run, last
in the order of writes, because a digest list generated before a gate run is stale by the time the run finishes.

**What this batch did not do.** No dependency installed, no client boundary introduced, no stylesheet animated, no
route added, no redesign and no backend work under the cover of the transition. No gate above the Phase 0/1
instrument was closed: Gates 1 through 5 remain unpassed, Level B remains 3 of 12, and B-05, B-06, B-07, B-08, B-11
and B-12 all remain open with their Owner-approvers named. Production deployment is not authorized by anything here
and nothing was deployed. Four scratch files this window created were deleted before staging; the stale wording in
the asset register, which now says no application code exists while `src/` holds 32 files, is tracked as
REQ-TRUTH-006 rather than re-stamped inside a closure batch.

### R. A 6 MB archive arrives inside the protected library, is proven to contain nothing new, and the thing it brought with it is a broken quarantine (2 November 2026)

**What arrived was a path, not an instruction.** The Owner sent `Noujoude.photo/Noujoude.photo.rar` with no verb
attached to it. An unknown file inside `Noujoude.photo/` is governed by a standing rule — "originals are never
overwritten", and "preserving unknown files is a standing instruction" — so the first job was to characterise it
without touching anything. It was characterised by reading the container's own CRC-32 table against CRCs computed
from the files on disk, which reconciles 78 entries without extracting one. The container is RAR5
(magic `5261 7221 1a07 00`), 6,143,950 bytes, 78 files, **zero subdirectories**, zero encrypted entries,
`7z t` → "Everything is Ok", unpacked total 6,322,441 bytes.

**The archive adds no content to the library.** All 78 entries are byte-identical to files already in
`Noujoude.photo/`: 78 CRC matches, 0 mismatches, 0 size disagreements, **0 entries that exist only inside the
archive**. The library holds 7 files the archive does not (145,432 bytes — four logo originals,
`logo_presentation_scene_16x9_v3.webp`, `GENERATED_ASSETS_MANIFEST_AR.md`, `_manifest.json`), and the arithmetic
closes exactly: 6,467,873 − 145,432 = 6,322,441, the archive's own unpacked sum. So the archive is a copy of the
library minus those seven, not an addition to it. Extraction would have been a no-op with write risk attached,
which is the worst possible trade inside a protected path, and the Owner chose to keep it, not extract it, and not
give it a catalogue row.

**Two things it does not do, stated because they will be asked.** The archive holds **0 PNGs** (64 webp, 14 jpg),
so it does not supply the ten `source_png` originals OID-17 is waiting on — `world_morocco_hero_16x9_1793387944337_307329d3.png`
and its nine siblings are still absent from the filesystem, and the lineage break in §6.4 is unchanged. It also
duplicates `vintage_collector_desk_16x9.jpg` with the **same wrong bytes** (first four bytes `RIFF`, i.e. a WebP
container in a `.jpg` name), so RB-06 does not move either. Possession of a file is not a rights statement; OID-15,
OID-16, OID-17 and OID-18 stay `Outstanding` and no register row changed state because of this archive.

**The measurement was wrong before it was right.** The first reconciliation reported 77 entries as "same name,
different bytes" — because `7z -slt` prints CRCs in lowercase and `zlib.crc32().toString(16).toUpperCase()` prints
them in uppercase, so the comparison was a case test wearing a hashing costume. The tell was the count: 77 differ,
1 identical, and the one that "matched" had a CRC made only of digits. Fixing the normalisation inverted it to 78
identical, 0 differing. The finding survived only because the collision risk was checked separately — 86 files
walked recursively, **0 basename collisions**, so keying the comparison by filename was sound.

**What the archive did bring with it was a broken quarantine, 12 minutes earlier.** `Noujoude.photo/` has mtime
14:13 because of the archive; `_pending_review_AI_generated/` has mtime **14:01**. Git showed the event exactly: 11
tracked files deleted from the worktree and 11 untracked files at the library root — the ten NDM-AST-073 … 082 webp
assets plus `GENERATED_ASSETS_MANIFEST_AR.md`, moved out of the quarantine folder into the primary library. The
bytes were never damaged: each file's SHA-256 matches its catalogue row and its `HEAD` blob. The *rule* is what
broke, and `docs/OWNER_INPUT_REGISTER.md` states it in terms — the ten "stay quarantined in
`_pending_review_AI_generated/` and out of every public render", which is the disk enforcement of
`ai_generated: true` + `approval_state: Pending Human Approval` + `rights_state: Awaiting Rights Review`. Preflight
caught it on its own: **1 FAIL / 1 WARN / 8 PASS**, the FAIL reading "10 catalogued original(s) no longer in the
directory". This is the §L pattern again — the instrument earned its keep by failing on a real change, not by
being green.

**Restored on the Owner's decision, and verified rather than assumed.** `git restore --source=HEAD --worktree --`
against the 11 deleted paths put the quarantine back; the tracked deletions are gone (0 ` D` remaining) and **82 of
82 catalogue rows re-verify by SHA-256 on disk**, which matters because the repository has content filters
configured and a restore is only trustworthy if the bytes are re-hashed rather than re-believed. Preflight returns
to **0 FAIL / 1 WARN / 9 PASS**.

**The residue is named, not hidden.** The eleven files the Owner moved to the library root were left in place,
because deleting a file under `Noujoude.photo/` is not this batch's authority to take. They are byte-identical to
the restored copies, so the current disk state holds **11 duplicated byte-strings and 1,689,045 redundant bytes**:
97 physical files, 14,300,868 bytes, against the **85 files / 6,467,873 bytes** recorded in
`docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §6.1 and `docs/ARCHITECTURE.md`. Those figures are corrected in place, dated,
with both readings kept — the number that was measured and the number that is true now. Removing the duplicates is
provably lossless (the same bytes sit in `HEAD`, in the quarantine folder and inside the archive) and is queued as
an Owner yes, not performed.

**A machine-level ignore rule hides a protected-path file from git.** The archive does not appear in
`git status` at all — not as tracked, not as untracked — because `C:\Users\NaDa\.gitignore_global` line 24 carries
`*.rar` (alongside `*.zip` and `*.7z`). The repository's own `.gitignore` states "No ignore rule may ever hide a
change to those paths", and nothing in the repo can enforce that against a user-global file outside its tree. The
practical consequence is a false sense of backup: **this archive is not under version control and exists on one
disk**, while `preflight` — which enumerates the filesystem rather than the index — sees it plainly. That
asymmetry is the same shape as hole H-7 (preflight iterates catalogue rows and does not enumerate the directory);
here the enumeration works and the VCS is what blinks. Recorded as a finding, not fixed, because the fix is either
a negation rule in the repo's `.gitignore` or an edit to a machine-global file, and neither is authorized by
anything in this conversation.

**What this batch did not do.** No file was extracted, moved, renamed or deleted. No catalogue row was created for
the archive. No OID moved state. No rights position changed, no asset was approved, and Gate 1 does not move. The
corrections below are to counts and locations invalidated by the Owner's own reorganisation and by the arrival of
this file.
