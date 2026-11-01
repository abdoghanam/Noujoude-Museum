# NOUJOUDE DIGITAL HERITAGE MUSEUM — ARCHITECTURE

**Document ID:** NDM-ARCH-001
**Version:** 0.1.0
**Status:** Mixed — a real tooling layer exists and is verified; the application layer is a **contract only, with zero implementation**. Read §0 before using any statement in this file.
**Phase:** 1 (Architecture & Foundations)
**Date:** 31 October 2026
**Governing inputs:** `reference/Noujoude_Technology_and_Security_Standard_EN.md` (§2 architecture), `reference/Noujoude_Master_Specification_EN.md` (product requirements), `reference/Noujoude_Master_Execution_Directive_EN.md` (§3 workspace, §16 documentation)

---

## 0. What is actually implemented, and what is only decided

Directive §15 forbids treating a route, component, schema field, migration, or a
successful build as proof of a feature. This file therefore separates the two
architectures that exist right now, because they have completely different evidence
status.

| Layer | Contents | Evidence status |
|---|---|---|
| **A. Repository & verification architecture** | `scripts/` tooling, root configuration, integrity baselines, environment gates | **Implemented and executed.** Each item below is a real file that has been run, with recorded output. |
| **B. Application architecture** | Next.js app, Payload CMS, domain services, data model, AI gateway, storage | **Contract only. Not implemented.** No dependency is installed, `src/` contains one README, no database exists, no schema exists, no migration exists. |

Nothing in §2 onward describes running software. It describes the shape the software
must take, decided under the 25 ADRs recorded in `docs/ARCHITECTURE_DECISIONS.md`
(ADR-001…ADR-025, re-counted 31 October 2026 with `grep -c '^### ADR-'` → 25). The
conditions that block layer B are **B-01** (host Node v24.19.0 vs required
`>=24.22.1 <25`; no version manager is installed), **B-02** (no dependency install has been authorized) and
**B-03** (`.env` absent — measured, not assumed: `docker compose config` exits 1 on seven unset secrets, so the
PostgreSQL stack cannot start and no project database exists). **B-09 no longer belongs in this list**: the
container engine answers (`docker info` rc=0, server 29.9.2, 1 November 2026) and `postgres:18.6-alpine` is in
the local cache; what it blocked — the ADR-019 privilege proof — has since run. All are recorded with their
measured probes in ARCHITECTURE_DECISIONS §2, §7.2 and ADR-003.

### 0.1 Layer A — the architecture that genuinely exists

| Component | Path | Verified behaviour |
|---|---|---|
| Runtime gate | `package.json` `engines.node: ">=24.22.1 <25"`, `packageManager: "pnpm@11.21.0"` | Declared; enforced by the preflight check below, not yet by a package manager (`engine-strict` is not set, and ADR/H-12 measured that pnpm would run the dependency check first anyway). **As of 1 Nov 2026 the host satisfies it: `node -v` → `v24.22.1`, preflight prints `PASS \| Node.js 24.22.1`** |
| Preflight gate | `scripts/preflight.mjs` | Executed 31 Oct 2026: exit 1, "7 checks: 1 FAIL, 2 WARN, 4 PASS" (FAIL Node range; WARN container daemon unresponsive; WARN `.env` absent). Re-executed 1 Nov 2026 after the eighth check was added: exit 1, "8 checks: 1 FAIL, 2 WARN, 5 PASS" — Docker is now PASS (`server reachable; compose: 5.6.1`), the WARNs are the absent `.env` and the asset-governance register, and the new row is the `docker-compose.yml` contract. Re-executed the same day after the ninth check joined it: exit **1**, "9 checks: 1 FAIL, 2 WARN, 6 PASS" — check 9 is the CI workflow structure contract (`PASS`); the single FAIL is still `Node.js 24.19.0` against `engines.node` (B-01) and nothing else moved. Re-executed again the same day after the tenth check joined it: exit **1**, `10 checks: 1 FAIL, 3 WARN, 6 PASS` — check 10 is the `pnpm run` dependency-check trap (**H-12**/B-10), which prints `WARN` because arming it is the Owner's action (OD-7) and no project-scoped setting exists; the three WARNs are `.env` absent (B-03), the asset-governance register (B-06) and that trap. **Executed again 1 Nov 2026 after OD-1, OD-2, OD-3 and OD-7 had all run: exit `0`, `10 checks: 0 FAIL, 1 WARN, 9 PASS`.** Node, `.env` and check 10 all moved to PASS, and the single surviving WARN is the `Noujoude.photo/` reconciliation (B-06, Owner asset-governance work). **Read that tally as a state, not a constant:** re-run minutes later on an idle engine and the same command printed `WARN \| Docker \| daemon did not answer within 20 s` with `0 FAIL, 2 WARN, 8 PASS` — still exit 0, because a cold engine warns rather than fails in this harness. The 60 s/120 s probe pair in `docs/TEST_AND_RELEASE_REPORT.md` §1.1 is the measurement behind that sentence |
| Physical asset audit | `scripts/audit-assets.mjs` | Executed: 82/82 catalog rows parsed, zero per-category drift, 1 `WRONG_FORMAT`, 18 name/pixel mismatches, 3 uncatalogued files |
| Read-only input integrity | `docs/REFERENCE_INTEGRITY.json` | Executed: 7 `reference/` files fingerprinted; preflight re-verifies them each run |
| Original asset protection | audit CSV checksums + preflight | Executed: all 82 catalogued assets in `Noujoude.photo/` match their recorded SHA-256. **Scope the claim:** preflight iterates the audit CSV's rows and never enumerates the directory, which holds **85** files — the 3 uncatalogued files are documented, not lost, but the PASS does not cover them (hole **H-7**). Rights are a separate and far worse number: **0 of 82** cleared |
| DOCX / Markdown alignment | `scripts/check-docx-alignment.mjs` | Executed: 337/337 headings matched, 0 content-loss risk |
| Citation integrity | `scripts/verify-citations.mjs` | Executed 1 Nov 2026 (final run, after the H-10, H-11 and H-12 batches, the measured guard-matrix rewrite, the §2.2 correction and the Owner-authorization window): 12 `docs/` files, 533 quoted fragments carrying a line reference, plus **1,247** quote-less references validated as their own pass (H-8); the mutually exclusive classes sum exactly — VERIFIED 427 + SELF_RECORDING 10 + PROJECT_RECORD 10 + no-line-reference 86 = 533 — with `DEFINED_TERM` 6 a **subset** of those 86 and **0** no-line-reference fragments holding verbatim requirement text. Defects: `NOT_FOUND` 0, `LINE_OFF` 0, `LINE_OFF_OTHER_SOURCE` 0; exit **0**. Result in `docs/CITATION_VERIFICATION.json`. Adding all six printed numbers over-counts by the subset; read the classes, not the sum. Earlier readings of this row (506, 519, 522, 523, 525, 526, 527 and 528 fragments) are superseded by the run above, and the drift is the count-drift class §0 of `docs/IMPLEMENTATION_PLAN.md` exists to catch — including the drift this row's own re-writing caused three times today, when a quoted phrase on the same physical row as a `line N` reference was bound to it and reported `NOT_FOUND`. **The 1 November window produced a sixth red of a different kind, and it is the one a reviewer should remember:** editing `docs/ARCHITECTURE_DECISIONS.md` added seventeen lines to that file and turned four *correct* citations in two *other* documents into `LINE_OFF` defects, because a line-number citation couples every document to the line counts of the documents it cites. **This pass is clean only for the classes the tool checks** — a quotation of the *scanned file's own* wording cannot verify, because that file is deliberately excluded from its own source set (the documented limit in `docs/IMPLEMENTATION_PLAN.md` §8, H-8) |
| Document shape integrity | `scripts/verify-tables.mjs` (`pnpm audit:tables`) | Executed 31 Oct 2026: `OK: 192 tables in 12 markdown files, every row with a uniform separator count`, exit 0. Re-run 1 Nov 2026 after the H-9 header rule joined it, and again after the §2.2 red-green evidence table joined `docs/TEST_AND_RELEASE_REPORT.md`: `OK: 196 tables …`, exit **0**. **Final 1 November run: `OK: 199 tables in 12 markdown files, each with a header, a delimiter row and a uniform column count`, exit 0** — and the +3 is attributed by measurement, not by narrative: `grep -cE '^[\|][\s:-]*---'` per file against `git show HEAD:<file>` shows `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` +2 (§7.2's reconciliation tables) and `docs/OWNER_INPUT_REGISTER.md` +1 (§6A's per-item table), ten files unchanged. The count moves with every `docs/` edit (193 partway, 194, 195, 196, then 199), so read the printed number, never a quoted one. It exited **1** twice during this batch, catching unescaped pipes inside code spans in two newly written rows — a real defect class, found by the tool. It also returned **193** partway through this batch while exit stayed **0**, which exposed a second defect class it cannot catch: `docs/IMPLEMENTATION_PLAN.md` §8's own table had been split by a `---` thematic break between H-6 and H-7, leaving H-7/H-8 as a headerless run that the gate scored as a healthy table. Repaired by moving the rule below H-8; the count returned to 192 and a hand-run sweep for headerless pipe-led runs across all twelve `docs/` files returns **0 orphans**. Registered as hole **H-9** — the gate checks that a run is *uniform*, not that it *has a header*. Negative-tested against a throwaway fixture outside the repository, where a 3-cell row under a 4-cell header was reported and the tool exited 1, while a pipe-led table inside a fenced block was correctly ignored. **Shape only — it is not a truth check and never replaces a read-back** |
| Specification working copy | `scripts/copy-master-spec.mjs`, guarded by `scripts/tests/copy-master-spec-output.test.mjs` | Executed 1 Nov 2026: body byte-identical to source (`misaligned lines: 0`), source SHA-256 stamped into the header, and the copy's own reported size now measured rather than inferred — `257,099 UTF-8 bytes / 4,069 lines (final newline present)`, checked against `wc -c` and `awk 'END{print NR}'` on the file written. Both figures used to be mislabelled (a UTF-16 code-unit count called "bytes", a split length called "lines"); the defect and its correction are in `docs/TEST_AND_RELEASE_REPORT.md` §2.2, and 11 fixture cases now hold the line, red-verified at `4 passed, 7 failed` against the pre-fix formulas |
| Type discipline | `tsconfig.json` | **Executed 1 Nov 2026 — `pnpm typecheck` → `tsc --noEmit`, exit `0`.** The exit must be read with its shape: `allowJs: true` without `checkJs`, include covers `scripts/**/*.mjs` (**19 files**, parsed, not type-checked) and `src/**/*.ts(x)` (**0 files**). So the compiler runs on Node 24.22.1 and the scripts parse; nothing about application types has been checked, because there are no application types. Recorded as a **hollow green** in `docs/IMPLEMENTATION_PLAN.md` §12 rather than as a pass |
| Security linting | `eslint.config.mjs` | **Executed 1 Nov 2026 — `pnpm lint`, exit `2`**: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@eslint/js' imported from E:\no\eslint.config.mjs`. A real declared-dependency gap that only became *measurable* once OD-2 installed the tree — before the install the command could not run at all, and the gap was invisible. It has deliberately **not** been repaired by adding the dependency: that would change the lockfile under an authorization whose text forbids silently changing dependencies, so it is reported as a Phase 2 prerequisite |
| Test configuration | `vitest.config.ts`, `playwright.config.ts` | **Vitest executed 1 Nov 2026 — `pnpm test`, exit `1`**: `No test files found`, with the configured include/exclude lists printed and `passWithNoTests: false` behaving exactly as authored, i.e. an empty suite is loud rather than green. **Playwright: still unexecuted** — no browsers launched, no routes to drive |
| Local infrastructure | `docker-compose.yml`, `scripts/db/init-roles.sh`, `scripts/db/harden-append-only.sh`, `scripts/db/verify-privileges.sh` | Authored; all pass `sh -n`. The three scripts have **run against a live PostgreSQL 18.6 server since 1 Nov 2026** — the privilege harness mounts `scripts/db` read-only, runs `init-roles.sh` as an entrypoint script and again for idempotency, applies `harden-append-only.sh`, and calls `verify-privileges.sh` clean/tampered/remediated (`docs/A5_PRIVILEGE_EVIDENCE.txt`). They have **never run through this project's provisioning path**: `docker compose up` has never started, so `db:harden` and `db:verify-privileges` are unexecuted and the relations the harness tested are representative ones, not migrated ones. `postgres:18.6-alpine` is present locally (measured 1 Nov 2026, 433 MB). **First machine-validated 1 Nov 2026:** `docker compose config` renders the file with exit **0** when the seven secrets are supplied as process-environment placeholders (nothing written to disk) and exits **1** naming each unset variable when they are not — so the definition itself is valid and the only thing blocking a start is B-03. That render also exposed hole **H-10**: the declared container name collided with a stopped container already on this host, and the file now declares `ndm-postgres`. The compose bootstrap attempt created nothing |
| Compose-file contract gate | `scripts/verify-compose-config.mjs` (`pnpm audit:compose`, preflight check 8) | **Executed 1 Nov 2026, exit 0** — ten static rules over `docker-compose.yml` (pinned image, loopback-only publish, every `:?` secret guard on every occurrence, the postgres:18 mount root, read-only script mounts, `pg_isready` healthcheck, no host-escape affordance, restart policy, an `ndm-` container name, no inline secret default). It reads the file only: it starts no container and creates no volume, so **it is not evidence that `pnpm db:up` works**. Regression: `scripts/tests/verify-compose-config.test.mjs` — 25 cases, exit 0 — 22 static red/green fixtures plus three that drive the real engine and print **SKIP** (never PASS) where no engine exists |
| Privilege evidence harness | `scripts/db/run-privilege-tests.sh` (`pnpm db:privilege-evidence`) | **Executed 1 Nov 2026, exit 0** — `IMAGE=postgres:18.6-alpine`, throwaway container and volume, both removed by the run; 34 grant-state assertions plus all 14 behavioural cases A–N matched, and the residual-risk probe reproduced (`VULNERABLE` → `DETECTED` → `RESTORED` → `DENIED`). Transcript: `docs/A5_PRIVILEGE_EVIDENCE.txt`. **Scope:** this proves the ADR-019 grant design behaves as specified *inside a disposable container*, not against this project's database, which does not exist yet |
| Read-only-tree protection for the formatter | `.prettierignore` (45 lines, 14 non-comment patterns, 2,709 bytes — re-measured 1 Nov 2026 after `docs/A5_PRIVILEGE_EVIDENCE.txt` joined the generated-evidence group at line 39) | Added in the gap-closure batch after finding that `package.json` ships `"format": "prettier --write ."` and Prettier parses Markdown — with no ignore file, one format run would have rewritten `reference/` and `Noujoude.photo/`. Line 18 is `reference/`, line 21 is `Noujoude.photo/`; generated evidence artefacts and tool-output paths are also excluded. Upstream guidance recommends exactly this control. **Verified structurally by reading, not by execution** — Prettier is not installed (B-02). Registered as risk R-14, closed |
| Check-only formatting command | `package.json` `"format:check": "prettier --check ."` | Added in the gap-closure batch so that CI and any reviewer can *check* formatting without silently modifying files. Its behaviour and exit codes are documented from Prettier's own published CLI reference (HTTP 200): 0 everything formatted, 1 something was not, 2 something is wrong with Prettier. **Executed 1 Nov 2026: `pnpm format:check` exits `1` with `Code style issues found in 79 files`** — the second leg of that three-way claim, measured on this repository rather than quoted from the reference. It has **not** been repaired with `pnpm format`: `--write` would rewrite citation-bearing Markdown, and every rewritten line number would turn a `VERIFIED` quotation into a `LINE_OFF` defect. Reformatting is therefore a decision with a documented consequence, not an oversight. **The count is a moving target and must be read as one: it was 37 files at the start of 1 Nov 2026, 60 mid-window, and 78 at the window's close — 41 of them in an untracked `brand/` tree this batch neither wrote nor committed** — each hand-written long table row is another file Prettier would reshape, which is the same trade-off the citation gate enforces from the other side |
| CI pipeline definition | `.github/workflows/ci.yml` (**416 lines, 22,226 bytes, four jobs, 45 step items — 37 named plus 8 bare action steps** — re-measured 1 Nov 2026 after the §2.2 spec-copy suite joined `docs-gates`, following the compose, workflow and `pnpm run`-trap contracts and their suites; the 386-line/19,799-byte, 370-line/18,563-byte, 399-line/20,787-byte and earlier readings this row carried are corrected by measurement, not incremented) | Added in the gap-closure batch. Header reads `STATUS: **AUTHORED. NEVER EXECUTED.**`. Jobs: `docs-gates` (the documentation gates plus the `docker-compose.yml` contract, the workflow's own structure contract, and one regression suite per contract), `quality` (install, dependency-lockstep check, `format:check`, lint, typecheck, test, build), `db-privileges` (the A.5 harness unconditionally, then `db:up` → `migrate` → **`db:harden`** → **`db:verify-privileges`**), `security-scans` (`pnpm audit --audit-level=high`, plus a NOTICE that secret scanning is **not implemented**). **Never executed.** Machine-validated only in the sense the host permits: no YAML parser exists here, so the ten structural rules of `scripts/verify-workflow-structure.mjs` (row above) check that it parses as block YAML, that every job and step is well shaped, that every script it invokes and every `pnpm` name it uses exists, and that it has not drifted from `pnpm test:gates` — which is a contract, **not** GitHub's parser and **not** a CI run. There is also no repository for it to run in (B-04). It enforces nothing today |
| Workflow structure gate | `scripts/verify-workflow-structure.mjs` (`pnpm audit:workflow`, preflight check 9) | **Executed 1 Nov 2026, exit 0** — ten rules over `.github/workflows/ci.yml`: W1 byte facts (no tab indentation, no CR, valid UTF-8, final newline), W2 root shape and allowed top-level keys, W3 block structure (a dedent must land on an open column; no duplicate key; no unparseable line; no empty block scalar), W4 job shape, W5 step shape, W6 `needs:` names real jobs and the DAG is acyclic, W7 every script a step *executes* exists (existence probes and globs exempt), W8 every `pnpm <name>` is a declared script, W9 no drift between CI and `pnpm test:gates`, W10 no literal secret in a shell assignment or an `env:` mapping. It reads only; it never runs a workflow. Regression: `scripts/tests/verify-workflow-structure.test.mjs` — **32 cases, exit 0** — 21 red fixtures plus eight green assertions, one exemption per rule that could over-fire, and a case that renames a real gate script inside a *copy* of the committed workflow and requires the gate to fail it. Registered as hole **H-11** |
| Package-manager trap | `.npmrc` (comments only) and `scripts/preflight.mjs` check 10 | **Measured 1 Nov 2026, not theorised.** In this workspace `pnpm run <script>` does not reach the script: pnpm 11.21.0 verifies the declared dependencies first and, with `node_modules` absent by design until OD-2, starts an install — the documented read-only command `pnpm run audit:workflow` resolved 669 packages against the public registry before being killed (no `node_modules` and no `pnpm-lock.yaml` landed here; the machine store at `E:\.pnpm-store\v11` did receive packages). The project-scoped fix does not exist: `verify-deps-before-run` is one of the 67 keys pnpm reads only from the **global** config file (proved by a control line in the same file that *was* honoured), no `--no-verify-deps-before-run` CLI form exists, and `engine-strict=true` runs after the dependency check. So `.npmrc` **sets no options on purpose** and carries the measurement instead; check 10 reads `pnpm config get --global verify-deps-before-run` — a pure config read, nothing resolved or downloaded — and prints `WARN` with both Owner remedies until one is applied (OD-7). Its classification is by **measured behaviour**, not by value name, because the earlier draft of this row was wrong in three places: `error` refuses outright (exit 1, nothing resolved), `warn` and `false` never install but *do run the script*, `prompt` exits 1 only because stdin was not a terminal and would otherwise ask with default=yes, and an unrecognised value runs the script silently because pnpm's switch has **no default case** — fall-through, not a guard. Only `install` and the unset default arm the trap. Until then the executable checks in this repository are run as `node scripts/<name>.mjs`, which is what `docs/TEST_AND_RELEASE_REPORT.md` §9 prints. Registered as hole **H-12** and blocker **B-10** |
| Package-manager trap — **state after OD-7 and OD-2, 1 Nov 2026** | `C:\Users\NaDa\AppData\Local\pnpm\config\config.yaml` (pnpm 11.21.0's real global config file) and `scripts/preflight.mjs` check 10 | **The trap is disarmed by a machine-level change the Owner authorized, and by the install itself.** `verifyDepsBeforeRun: error` was written to the global config file, which is the only place pnpm 11 reads that key (the row above proves no project-scoped form exists); `pnpm config get --global` returns `error`, and the pre-existing three keys in that file (`fetchRetries`, `fetchTimeout`, `networkConcurrency`) were preserved with a dated backup taken before the edit and its SHA-256 recorded in `docs/CHANGELOG.md`. Behaviour, not the value, was verified: `pnpm run audit:workflow` exits **0** and emits **no** `Progress:` line, so the documented `pnpm <name>` commands now reach their scripts. OD-2 then removed the trigger by installing the tree, so check 10 prints PASS for two independent reasons — `node_modules` exists **and** the setting is `error`. **Consequence for this document:** every `pnpm <name>` written in `docs/` is a runnable command as of 1 Nov 2026, which is precisely what H-12 said it was not. `error` is the strictest value and the one that refuses rather than installs: a future missing dependency fails loudly instead of silently resolving the registry |

This distinction is not a formality: an architecture document that quietly merged the
two would let a later reader believe the museum has a rights model and a database when
it has a plan for them.

---

## 1. Architecture pattern

**Modular monolith** for V1 (Standard §2.1, confirmed by ADR-001). One deployable
application, eleven logical boundaries. No microservices, no Kubernetes, no second ORM,
no competing CMS — each of those requires an ADR demonstrating concrete need before it
may be reconsidered.

Because boundaries are enforced by directory and import discipline rather than by the
network, a boundary violation is a code-review defect. The mechanism that makes this
detectable is TypeScript path aliases plus ESLint import restrictions; both are authored
and neither has run.

---

## 2. The eleven boundaries and where they will live

Standard §2.1 lists the required logical boundaries. They map to the planned `src/`
layout recorded in `src/README.md`:

| # | Boundary (Standard §2.1) | Planned location | Depends on |
|---:|---|---|---|
| 1 | Public presentation and visitor experience | `src/app/[locale]/`, `src/ui/` | Payload types, media layer |
| 2 | CMS and administration | `src/app/control-center/`, `src/payload/` | access control, domain services |
| 3 | Museum domain services | `src/domain/` | data model |
| 4 | Authentication and authorization | `src/payload/access/`, `src/lib/server/auth*` | Payload auth, DB roles |
| 5 | Persistence and database access | `src/payload/` collections + adapter migrations | `@payloadcms/db-postgres` |
| 6 | Media storage and processing | `src/lib/server/media*`, `sharp` derivatives | cloud-storage adapter |
| 7 | Search and discovery | `src/domain/search*` | PostgreSQL FTS + `pg_trgm` (ADR-006) |
| 8 | AI Curator and retrieval governance | `src/lib/server/ai-gateway*` | publication + rights dimensions |
| 9 | Background jobs | Payload Jobs (ADR-015) | Payload config |
| 10 | Observability and audit | OpenTelemetry instrumentation, `AuditEvent` entity | Standard §10 |
| 11 | External integrations | server-side adapters | per-integration ADR |

Boundary 8 and boundary 6 are the two that carry product risk: the AI gateway is the
only place source-level permission filtering may happen (ADR-017), and the media layer
is the only route from application code to `Noujoude.photo/`. Both are deliberately
single-chokepoint designs.

---

## 3. Request topology (target, not running)

### 3.1 Public visitor request

```
Browser
  → locale-prefixed path  /en/…  or  /ar/…        (§4.2 makes the prefix mandatory)
  → Next.js App Router server component
  → authorization + publication check
      · is there a PublicationRecord for (entity, locale) in Published state?  (ADR-008)
      · is exhibition availability open, and not Hidden/Not Public?            (ADR-010)
      · is the media rights-cleared for public display?                        (ADR-011/012)
  → content from Payload (stable localized: true field content)
  → derivatives from private S3-compatible storage via the media layer
  → HTML with dir="rtl" for Arabic, CSS logical properties only
```

A page is never "published" as a global fact. Publication is per (entity, locale), so
an English artifact page may be live while its Arabic counterpart remains in review — the
requirement at Master §10 line 1453, and the reason a single `status` column is prohibited
at line 1524.

### 3.2 Control Center request

```
Browser → /control-center/… (private root, noindex, never linked publicly)
  → Payload access control at route, operation, collection, field and record level
  → server-side re-check on every operation; client-supplied role, owner, locale
    or record id is never trusted
  → domain service (never raw SQL, never shell, never infrastructure control)
  → AuditEvent written as a protected record
```

The Control Center is the museum's own interface, not a generic CMS skin. Its scope,
the twenty modules, and the boundary of what it may never expose are specified in
`docs/SECURITY_AND_PERMISSIONS.md`.

### 3.3 AI Curator request

```
Visitor question
  → eligibility filter built BEFORE any retrieval call:
      published-in-this-locale  ∧  rights-cleared  ∧  publicly-exhibitable
      ∧  ai-knowledge-eligible  ∧  not Hidden/Not Public
  → retrieval over eligible records only (keyword / full-text in V1 — ADR-006, ADR-007)
  → retrieved documents treated as untrusted data, never as instructions
  → answer with source references; no unverified claim stated as certain
```

Permission gating after generation is not a mitigation, because the model has already
seen the content. ADR-017 makes the filter part of query construction.

---

## 4. Data architecture

Single authority: Payload's `@payloadcms/db-postgres` adapter and its Drizzle-backed
migration stream (ADR-002). Custom domain tables are added through the adapter's
documented extension mechanism inside the same migration order. Prisma is prohibited by
Standard §15, as is a second migration system.

The four database roles (ADR-005 as refined by ADR-019, Standard §3.2) are implemented as
configuration in `scripts/db/init-roles.sh` (role statements at lines 58–67):
`ndm_migration` (DDL), `ndm_runtime` (DML, not a superuser, no `BYPASSRLS`, and
deliberately **without** `UPDATE`/`DELETE`/`TRUNCATE` on relations declared append-only),
`ndm_reporting` (read-only), `ndm_backup` (replication only, no DML and no DDL).
Append-only enforcement is a three-layer design — grant, a superuser-owned
`ndm_guard.deny(text)` trigger, and RLS deny policies under `FORCE ROW LEVEL SECURITY` —
because `ALTER DEFAULT PRIVILEGES` cannot name a table, so a post-migration harden step
(`scripts/db/harden-append-only.sh`) and an assertion step
(`scripts/db/verify-privileges.sh`) are part of the design rather than optional extras.
All four scripts have passed `sh -n`; none has been executed against a database, because
the container engine became unresponsive (B-09) before the first bootstrap attempt could
complete. The behavioural proof is therefore owed, not passed.

Entities, fields, indexes, and the eight namespaced state dimensions are in
`docs/DATA_MODEL.md`. The reconciliation of per-locale publication state — the
requirement that Payload satisfies only behind an experimental flag this project is
forbidden to ship — is ADR-008.

No `pgvector` column exists or is planned for Phase 1–2 (ADR-007). The `VECTOR(768)`
figure appearing in the source material is explicitly not adopted.

---

## 5. Rendering, performance and accessibility posture

| Concern | Position | Authority |
|---|---|---|
| Rendering | Server components by default; client JavaScript only where an interaction requires it | Standard §9 line 224: "no unnecessary client-side JavaScript" |
| Images | Responsive dimensions, controlled preload of the primary hero, lazy loading below the fold, documentary detail preserved | Standard §9 |
| Core Web Vitals | p75 targets LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 across Home, The Museum, Country World, Collection, Artifact Detail, Story, Search, Control Center | Standard §9 |
| Accessibility | WCAG 2.2 AA for public **and** administrative surfaces; axe automation in CI plus manual audit of key flows | Standard §8 |
| Bilingual | RTL/LTR behaviour tested as a first-class dimension; Playwright projects exist for exactly this split | `playwright.config.ts` |

These are targets set as gates. No measurement has been taken, so no performance or
accessibility claim exists. `docs/TEST_AND_RELEASE_REPORT.md` records the category as
"Not run".

---

## 6. Deployment topology

**Local development (the only topology that currently has any configuration at all):**

```
Host (loopback only)
├── Next.js dev server            (pnpm dev)          — not installed
└── Docker Compose
    └── postgres:18.6-alpine      127.0.0.1:5432      — never started (B-09)
        ├── init-roles.sh → ndm_migration / runtime / reporting / backup
        └── ./scripts/db mounted read-only at /opt/ndm-db
            ├── harden-append-only.sh   (run after every migration)
            └── verify-privileges.sh    (asserts the ADR-019 grant set)
```

`docker-compose.yml` binds PostgreSQL to `127.0.0.1` only and is labelled local
development. It carries no production meaning and is not evidence that a database
exists. The `/opt/ndm-db` mount exists so the two operator scripts can be run with
`docker compose exec` — `pnpm db:harden` and `pnpm db:verify-privileges` — rather than
being copied by hand; the mount was added because `ALTER DEFAULT PRIVILEGES` cannot name
a table, so the append-only guarantee depends on a step that runs *after* each migration.

**Production:** intentionally undescribed here. Provider selection, hosting topology,
object-storage vendor, and AI provider are open Owner inputs recorded in
`docs/OWNER_INPUT_REGISTER.md`. Standard §15 forbids deployment without explicit Owner
authorization, and no SLA may be published from the internal 99.5% availability
objective.

---

## 7. Cross-cutting rules that constrain every future file

1. `reference/` and `Noujoude.photo/` are read-only to all tooling. Application code
   reaches assets only through the media/rights layer, never by addressing the original
   library at runtime. Verified today: 82/82 original checksums unchanged, 7/7 reference
   files unchanged.
2. **No commerce surface of any kind** — no price, Buy Now, cart, checkout, payment,
   order, seller, bidding, shipping, stock, or product variant, including hidden,
   unlinked, API-only, or admin-configurable variants, and no commerce framework,
   payment provider, cart schema, order schema or sales analytics installed for V1
   (Appendix G.3, line 3702).
3. The eight state dimensions stay separate (ADR-009). A UI that collapses them into
   one badge is a defect, not a simplification.
4. No invented facts: legal identity, location, founder history, artifact inventory,
   provenance, authenticity, condition, rights, or contact details. Workflows exist;
   unapproved content stays out of public output.
5. AI-generated imagery is never presented as documentary photography or as an original
   artifact (Appendix A.9). Today all ten additional assets are AI-generated, quarantined
   in `_pending_review_AI_generated/`, pending human approval and awaiting rights review.
6. No secret or privileged value may reach a browser bundle, a log, a telemetry event, a
   source map, a screenshot, or the Control Center UI. Enforced as intent by
   `.env.example`'s header and the `eslint.config.mjs` client-side `process.env` rule.

---

## 8. What is deliberately absent from this architecture

- No vector search, no embedding model, no dimension chosen (ADR-007).
- No dedicated search engine; PostgreSQL FTS + `pg_trgm` until measured need (ADR-006).
- No separate queue or worker; Payload Jobs until a measured need and an ADR (ADR-015).
- No Prisma, no dual migrations, no canary/beta/RC dependencies (Standard §15).
- No multi-tenancy, no public accounts, no favorites, no gift shop, no café feature —
  asset filenames that hint at these explicitly do not authorize them (Appendix A.9).
- No production topology and no vendor commitment.

---

## 9. Open architecture work

| Item | Why it is not closed |
|---|---|
| Dependency install and first scaffold | Blocked by B-01; also outside the scope the Owner selected for this phase |
| PostgreSQL instance and the ADR-019 privilege proof | Split into two claims. **The privilege proof is closed for the design**: `pnpm db:privilege-evidence` ran 1 Nov 2026 against `postgres:18.6-alpine` in a disposable container and exited 0 with all 14 cases A–N matching (`docs/A5_PRIVILEGE_EVIDENCE.txt`); B-09's "engine unavailable" prerequisite cleared by observation. **The instance is still not built**: composing this project's stack needs an authorized `.env` (B-03/OD-3), and the three bootstrap scripts therefore remain unexecuted against a real server. Nothing here is a verified production privilege boundary |
| Physical model for F-01…F-04 | Decided, not built: ADR-021 (`ArtifactEra` join, `era_id` as a projection), ADR-022 (`Page`/`PageSection`/`Template`), ADR-023 (`VerificationReview` as the single review authority), ADR-024 (`ProvenanceSourceLink`). Each becomes a table only once a migration stream can run |
| Search index shape (fields, weights, sort) | Specification names eligibility and filters but no index entity — architect decision due in Phase 2 (ADR-006) |
| Object-storage vendor and bucket policy | Owner input; interface kept vendor-neutral by design |
| AI provider and model | Owner input; adapter boundary already specified so the choice is swappable |
| Hosting and backup provider proof | GAP-14: RPO/RTO are proposed targets pending provider proof and Owner acceptance |
| Visual and rights approval of all 82 assets | GAP-07 and GAP-10: brand/curatorial approval and rights review remain |

`docs/IMPLEMENTATION_PLAN.md` sequences this work; `docs/REQUIREMENTS_TRACEABILITY.md`
holds the requirement-level status.
