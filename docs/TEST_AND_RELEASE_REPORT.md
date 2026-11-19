# Noujoude Digital Heritage Museum — Test and Release Report

**Document ID:** NDM-QA-001
**Version:** 0.2.0
**Measurement window:** 31 October 2026, 01:50–02:10 local, on this host.
**Re-measurement window:** 31 October 2026, later the same day — the container engine, the toolchain versions,
the pinned-artifact registry documents, the `v3.92.1` package listing, the preflight gate and both
documentation-integrity gates were all re-run. Where the two windows disagree, §0 and §1.9 carry the **later**
figures and §2 records the correction. The earlier window's numbers are not preserved as current anywhere.
**Third window — 1 November 2026:** the Owner authorized and this batch executed OD-1 (Node 24.22.1), OD-7 (the
`pnpm run` guard), OD-2 (install + lockfile), OD-3 (`.env`), OD-4 (`git init` + first checkpoint) and Gate 0, plus
OID-20 and OID-22. Four Standard §12 checks that had never been runnable were then **run** (§4 rows 1, 2, 3 and 9),
preflight was re-measured (§0 and §9), and Gate 0 was marked Passed in §4A on recorded evidence with a named
approver. Rows in §0 and §1 that still describe an absent toolchain are the 31 October record kept as audit
evidence; where a row was re-measured it says so in its own cell.
**Status:** **No application has been tested, because no application exists.** **This sentence is superseded as a state statement by the 2 November 2026 execution, and is kept because it is the record of the window that made it true.** `src/` now holds **32 files / 1,752 lines** of typed, linted, built and HTTP-served code (§0 row *Application source*, §4 rows 2, 3 and 9), `pnpm test` exits **0** over **4 files and 34 assertions**, and `pnpm build` exits **0** over 16 routes with `pnpm start` answering probes on localhost (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). **Re-measured 3 November 2026 by the counter-reconciliation batch, every figure from its own command on this host: `src/` holds 61 files, 60 of them code or style, over 11,194 lines; `pnpm test` exits 0 over 15 test files and 397 tests; `pnpm test:gates` exits 0 over eight suites totalling 178 assertions; `pnpm lint` and `pnpm format:check` both exit 0, the formatting half having been repaired under OID-25 by batch `2ae97b3`; `pnpm audit --audit-level=high` exits 0 over 3 sub-threshold advisories where the 2 November reading was exit 1 over 15 vulnerabilities, which is B-11 closed; and `pnpm build` exits 0 over 17 route entries. None of it touches what the first sentence denies: there is still no Payload configuration, no collection, no migration, no database access, no Control Center, no AI surface and no content record, so no §12 row here is acceptance of a feature.** What the sentence still correctly denies: no *product* has been tested. There is no Payload configuration, no collection, no migration, no database access, no Control Center, no AI surface and no content record, so no §12 row here is acceptance of a feature; **Level B, which is how this project tracks Standard §12, is 3 of 12 as measured on 2 November and **4 of 12** on the 3 November re-measurement below, and CI has still never run** (§4, and `docs/IMPLEMENTATION_PLAN.md` §4B). §1 lists what genuinely ran; §3 lists everything that has not.
**Rule enforced:** Directive §17 line 318 *"Do not claim a feature is implemented without verifying behavior"* and line 320 *"Do not fake records or metrics"*; Standard §15 line 334 *"No invented metrics, security compliance, or backup success claims."* Every number below was produced by a command shown next to it, on this host, in this window. Where a figure in an earlier document disagreed with a fresh run, §2 records the correction.

**Reproduce everything in §1 in four commands** (§9). Do not trust a number in this file that you have not re-produced: a parallel documentation workstream was editing `scripts/copy-master-spec.mjs` and the generated header of `docs/MASTER_SPECIFICATION.md` *while this report was being written*, which is visible in §2.3.

---

## 0. Environment actually measured

| Tool | Command | Output | Required by decision | Verdict |
|---|---|---|---|---|
| Node.js | `node -v` | **Re-measured 1 November 2026: `v24.22.1`**, rc=0. The 31 October value was `v24.19.0`, and that reading is kept here rather than overwritten because it is what made B-01 true. | `>=24.22.1 <25` (`package.json` engines; Payload 3.92.1 `engines.node "^22.23.4 \|\| >=24.22.1"`) | ✅ **PASS — B-01 cleared by OD-1.** Installed with `winget install OpenJS.NodeJS.LTS --version 24.22.1 --exact --scope machine`, then verified by reading the active binary, not the installer's exit code. npm is now `11.19.1` |
| pnpm | `pnpm -v` | `11.21.0` | `packageManager: pnpm@11.21.0` | ✅ matches |
| npm | `npm -v` | `11.17.0` on 31 October, **`11.19.1`** after OD-1 (npm ships with Node) | unused; pnpm is the authority | — |
| Git | `git --version` | `git version 2.56.0.windows.2` | Git (Standard §2.2) | ✅ binary present, and **a repository now exists**: `git init` executed under OD-4 on 1 November 2026 on branch `main`, first checkpoint committed, `git remote -v` empty, nothing pushed. The 31 October reading — `git rev-parse --is-inside-work-tree` → `fatal: not a git repository` — is what B-04 recorded, and B-04 is cleared |
| Docker CLI | `docker --version` | `Docker version 29.7.2, build a7dcaa6` (client only — answers without a daemon) | local infrastructure (Standard §2.2) | ✅ binary present |
| Docker Compose | `docker compose version` | `Docker Compose version v5.3.1` on 31 October, **rc=0**, 30 bytes — **client only.** Re-measured 1 November 2026: **v5.6.1**, rc=0. Either exit code proves the CLI is installed and says nothing about the engine. | ADR-004 (`postgres:18.6-alpine`) | ✅ binary present; preflight now reports `compose: 5.6.1` |
| Docker context config | `docker context ls` | **rc=0** — lists `default` and `desktop-linux *` → `npipe:////./pipe/dockerDesktopLinuxEngine` | — | ✅ readable; the endpoint is *registered*, which is not the same as *live* |
| Docker **daemon** | `docker version`, `docker info`, `docker ps -a`, `docker images` — each wrapped in `timeout 30`/`40`, exit code captured **before** any pipe | **Re-measured 1 November 2026: `docker info` exits 0**, server `29.9.2`, 3 containers listed (0 running), `docker images` exits 0. **And re-measured again forty minutes later in the same window, when `timeout 60 docker info` returned rc=124 and `timeout 120 docker info` returned rc=0** — the engine answers, but not inside 60 s of going idle (§1.1's third run). The 31 October value in this row's earlier life was all four probes **rc=124** with **0 bytes** — not even the Client section of `docker version` was flushed, so the CLI hung while connecting rather than reporting a refusal. That reading is kept because it is what made B-09 true when it was written. | required to start `postgres:18.6-alpine` (ADR-004) | ✅ **reachable 1 November 2026; B-09 cleared by observation, not by an Owner decision — and re-probed within this very window, where it failed a 60 s probe and passed a 120 s one. Never inherit this state: re-measure it** |
| WSL | `wsl -l -v` | 31 October: **rc=0** → `docker-desktop  Stopped  2`; `Ubuntu  Stopped  2`. **1 November, re-run: the identical output** — `Ubuntu Stopped 2`, `docker-desktop Stopped 2`, rc=0 — *while `docker info` in the same minute exits 0 and answers.* | engine backend | ⚠️ **Diagnostic correction, and it changes F-A's remedy.** `wsl -l -v` was recorded on 31 October as the proof that the daemon was absent. Re-measured 1 November, the distribution still reports **Stopped** and the daemon nonetheless answers, so the WSL listing is **not** a valid proxy for engine reachability on this host; `docker info` is. F-A's two historical signatures stand as recorded — `docker-desktop Running` with `500 Internal Server Error` on `/containers/create` and `/containers/json` (ARCHITECTURE_DECISIONS §7.2.2), then Stopped with rc=124 (§7.2.1) — but neither is the current state, and no Owner engine restart was needed to reach the daemon. |
| `postgres:18.6-alpine` in the local cache | `docker images` | **1 November 2026: rc=0** and the tag is listed, 433 MB. The 31 October value was **rc=124, 0 bytes — the cache could not be enumerated**, which is why this row read UNKNOWN. | ADR-004 mandates this image | ✅ **PRESENT.** An earlier note recorded the image as "absent from the local cache"; that claim stays withdrawn — it was unmeasurable then, and the measurement that finally replaced it is this one. |
| `psql` client | not present | — | not required; the container provides it | ✅ acceptable |
| `node_modules/`, `pnpm-lock.yaml` | `ls` | **Re-measured 1 November 2026: both present.** `pnpm-lock.yaml` is 285,200 bytes / 8,399 lines at `lockfileVersion: 9.0` with 701 `.pnpm` entries; `node_modules/` exists and the tree resolves. The 31 October reading (`both absent`, confirming no install had ever run) is what B-02 recorded and OD-2 cleared | installs must be authorized (OD-2) | ✅ **present, and the lockfile is committed source.** Two facts belong with this one: pnpm 11 ignores the `pnpm` field in `package.json`, so the live supply-chain control is `pnpm-workspace.yaml` → `allowBuilds`, whose two grants (`esbuild`, `unrs-resolver`) were made by name after inspecting what they build; and `ERR_PNPM_IGNORED_BUILDS` made the first install exit **1** until those grants existed |
| Application source | `find src -type f` (counted with `wc -l`, and re-counted restricted to `.ts`, `.tsx`, `.css`) | **31 October / 1 November record, kept as history:** `src/README.md` and `tests/setup/env.ts` — two files, neither application code nor a test, which is what made this row's verdict true in that window. **Re-measured 2 November 2026 by the closure batch: 32 files under `src/`, of which 31 are code or style — 18 `.tsx`, 8 `.ts` (4 of them test files), 5 `.css` — totalling 1,752 lines**, plus `src/README.md`; `tests/` still holds only `tests/setup/env.ts`. **Re-measured again 3 November 2026: 61 files under `src/`, of which 60 are code or style — 24 `.tsx` (2 test), 29 `.ts` (13 test), 7 `.css` — totalling 11,194 lines; `tests/` now holds `setup/env.ts` and `helpers/fake-clock.ts`, the latter still untracked and named for the next local checkpoint** | Phase 1 line of Directive §14 — initialize the application in `src/` | ⚠️ **The `zero implementation` verdict is superseded; the thing it was guarding is still absent.** Measured and executed: typed domain code (locale contract, canonical route registry, fail-closed rights gate, entry routing), 15 canonical routes plus the generated not-found, built to exit 0 and served over HTTP on localhost (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). Measured and still absent: **no Payload configuration, no collection, no migration, no database access, no Control Center, no AI surface and no content record** — every route renders an honest empty state and is served marked non-indexable. Initialization is not product acceptance, so this row upgrades no §12 check and no gate |
| YAML validator | `python -c "import yaml"`, `python3 -c "import yaml"`, `node -e "require('yaml')"`, `perl -MYAML` / `-MYAML::Tiny`, `ruby -e "require 'yaml'"`, PowerShell `ConvertFrom-Yaml`, `jq --version` | python 3.13 → `ModuleNotFoundError: No module named 'yaml'`; python3 the same; node → module not found; both perl modules fail; ruby not installed; PowerShell silent; `jq` absent. Re-probed 1 Nov 2026 — no cached container image carries one either | needed to machine-check the newly authored `.github/workflows/ci.yml` | ❌ **none available, and installing one is outside this batch's authorization.** What was substituted instead is `scripts/verify-workflow-structure.mjs`: ten structural rules over the block subset, exit **0**, proven red-and-green by its own 32-case suite (hole **H-11**). So `ci.yml` is recorded as **authored and structurally checked, not YAML-conformance-validated, never executed** (§1.7). |

---

## 1. Executed — real runs with real output

The commands executed in this window are transcribed below, one subsection per command group, plus §1.5 which
was **attempted and blocked** by the dead container engine on 31 October and **has since been executed with
exit 0** (1 November) — §1.5 carries both readings and says which one supersedes which. The list is *enumerated rather than totalled*: a
count of subsections is precisely the kind of figure that goes stale mid-work, and §2 already records one such
drift. §9 repeats the same commands as a reproduction script. All are read-only against `reference/` and
`Noujoude.photo/` and write only inside `docs/` (ADR-014). Exit codes are from this shell.

### 1.1 `node scripts/preflight.mjs` → **exit 1 on 31 October, exit 0 on 1 November 2026**

Measured 31 October 2026, this window:

```
FAIL | Node.js 24.19.0
     | VIOLATES engines.node ">=24.22.1 <25" — install Node 24.22.1 or later in range. Payload 3.92.1 refuses this version.
WARN | Docker
     | daemon did not answer within 20 s — required for postgres:18.6-alpine (ADR-004)
WARN | .env
     | missing — copy .env.example to .env before install. Do not commit it.
PASS | pnpm 11.21.0
     | packageManager declares pnpm@11.21.0
PASS | reference/ integrity
     | 7 files match baseline checksums
PASS | Noujoude.photo/ integrity
     | all 82 audited assets match their recorded SHA-256
PASS | src/
     | contains README.md

7 checks: 1 FAIL, 2 WARN, 4 PASS
```

**Re-run 1 November 2026, same command, exit code still 1 — and the rows changed, which is why the
tally alone is never the evidence.** `compose` is now reported as **5.6.1** (it was 5.3.1 in the
earliest transcript and the daemon was not answering at all in the one above), so the Docker check
is PASS and B-09 is closed for the harness's purpose — see §1.5. The two WARNs are now `.env`
(absent by agreement, B-03) and the **new** H-7 reconciliation row, which did not exist when the
transcript above was taken:

```
FAIL | Node.js 24.19.0
     | VIOLATES engines.node ">=24.22.1 <25" — install Node 24.22.1 or later in range. Payload 3.92.1 refuses this version.
WARN | .env
     | missing — copy .env.example to .env before install. Do not commit it.
WARN | Noujoude.photo/ reconciliation
     | 1 image file(s) in the directory with NO catalog row: logo_presentation_scene_16x9_v3.webp | 2 non-image file(s) not catalogued (manifests/notes): _pending_review_AI_generated/GENERATED_ASSETS_MANIFEST_AR.md, _pending_review_AI_generated/_manifest.json | 1 WRONG_FORMAT (extension vs container): vintage_collector_desk_16x9.jpg: .jpg holding image/webp | 18 NAME/PIXEL mismatch(es): brand_seal_monogram_1024.webp → filename declares 1024px, longest side is 512px (512x512); logo_badge_burgundy_1024.webp → filename declares 1024px, longest side is 512px (512x512); logo_stacked_vertical_1024x1536.webp → filename declares 1024x1536, file is 341x512 … (catalog rows 82, physical files 85)
PASS | pnpm 11.21.0
     | packageManager declares pnpm@11.21.0
PASS | Docker
     | server reachable; compose: 5.6.1 — required for postgres:18.6-alpine (ADR-004)
PASS | reference/ integrity
     | 7 files match baseline checksums
PASS | src/
     | contains README.md

7 checks: 1 FAIL, 2 WARN, 4 PASS
```

Same three digits, three different reasons: the FAIL is still B-01; the Docker WARN above has become
a PASS; and a WARN that did not exist above (the register-versus-directory reconciliation, H-7) has
appeared. A count would have reported these two runs as identical.

Three claims that would otherwise be assertions are evidence: the `reference/` originals
are unmodified against the baseline in `docs/REFERENCE_INTEGRITY.json`; all 82 audited
originals in `Noujoude.photo/` match their recorded SHA-256, so the read-only rule held;
and the FAIL is B-01, measured rather than assumed.

The Docker row **changed state inside this window**. An earlier transcript in §1.1 read
`PASS | Docker | server reachable; compose: 5.3.1`, and that run is what re-tested
discrepancy D-03. It is superseded, not deleted — see §2.4. The daemon later stopped
answering (`500 Internal Server Error` on `/containers/create` and `/containers/json`,
then timeouts), and the sequence is documented as **B-09** in
`docs/ARCHITECTURE_DECISIONS.md` §7.2 with its probe table. A tool that reported PASS
once does not entitle this report to claim PASS now. The 1 November re-run above is the
fresh measurement that does entitle it: `PASS | Docker | server reachable; compose: 5.6.1`.

**Third run of this command, 1 November 2026, after OD-1/OD-2/OD-3/OD-7 were executed — exit `0`, and the
tally moved twice within minutes of this writing.** With the engine warm:

```
WARN | Noujoude.photo/ reconciliation
     | 1 image file(s) in the directory with NO catalog row: logo_presentation_scene_16x9_v3.webp | 2 non-image file(s) not catalogued (manifests/notes): _pending_review_AI_generated/GENERATED_ASSETS_MANIFEST_AR.md, _pending_review_AI_generated/_manifest.json | 1 WRONG_FORMAT (extension vs container): vintage_collector_desk_16x9.jpg: .jpg holding image/webp | 18 NAME/PIXEL mismatch(es): … (catalog rows 82, physical files 85)
PASS | Node.js 24.22.1
     | satisfies engines.node ">=24.22.1 <25"
PASS | pnpm 11.21.0
     | packageManager declares pnpm@11.21.0
PASS | .env
     | present (values intentionally not read into this report)
PASS | reference/ integrity
     | 7 files match baseline checksums
PASS | src/
     | contains README.md
PASS | docker-compose.yml contract
     | docker-compose.yml states the pinned image, the loopback-only publish, the postgres:18 mount root, the read-only script mounts, the seven required secret guards, a pg_isready healthcheck, no host-escape affordance and an ndm- container name (10 rules)
PASS | CI workflow structure
     | .github/workflows/ci.yml parses as block YAML and its 4 jobs name every step, reference real jobs, invoke scripts that exist, agree with pnpm test:gates, and carry no literal secret (10 rules)
PASS | pnpm run deps-before-run
     | node_modules exists, so the auto-install path no longer fires from a missing tree; global setting: error

10 checks: 0 FAIL, 1 WARN, 9 PASS
```

Four things are worth pinning to that transcript. **B-01's FAIL is gone** — the row now reads `PASS | Node.js
24.22.1`, which is the first time this check has passed in the life of this report. **`.env` moved WARN → PASS**
under OD-3, and the check prints only its presence: `values intentionally not read into this report`, which is
the no-secret-printing rule implemented rather than promised. **Check 10 moved WARN → PASS** under OD-7 and
reports both halves of the H-12 condition. **The surviving WARN is the `Noujoude.photo/` reconciliation, and it is
Owner asset-governance work (B-06) — not a defect in the checker, and nothing OD-3 or OD-4 authorizes touching.**

**And the engine still refuses to be inherited.** Run again minutes later, with the daemon idle, the same command
printed `WARN | Docker | daemon did not answer within 20 s` and the tally read **`0 FAIL, 2 WARN, 8 PASS`** —
still exit `0`, because a cold engine is a warning in this harness, not a failure. Probing directly in that
state: `timeout 60 docker info` returned **rc=124** (no output), and `timeout 120 docker info` returned **rc=0**
with server `29.9.2`. So the engine's reachability on this host is a latency question with a window between 60 and
120 seconds after idle, and the 20-second probe sits below it. That is why §0's Docker row says *re-probe before
relying on it*, and why Phase 2 entry re-probes rather than citing this transcript as a permanent state.

### 1.2 `node scripts/audit-assets.mjs` → **exit 0**

Prints a JSON summary and rewrites `docs/ASSET_INVENTORY_AUDIT.csv` (82 rows × 20 columns, the column set required by Asset Requirements §10 line 218) plus `docs/asset-audit-summary.json`.

| Measurement | Value |
|---|---|
| Catalog rows parsed | **82** (72 original + 10 additional, counted independently as required by Asset Requirements line 220) |
| Per-category parse drift | **none** — expected vs parsed identical for A.2 = 12, A.3 = 18, A.4 = 3, A.5 = 11, A.6 = 10, A.7 = 18, A.8.1 = 6, A.8.2 = 4 |
| Physical files found / bytes | 85 files, 6,467,873 bytes *(1 November reading. Re-measured 2 November: **97 files / 14,300,868 bytes** — one 6,143,950-byte archive that duplicates 78 existing files, plus eleven duplicated quarantined files; `docs/CHANGELOG.md` §R)* |
| Non-`PRESENT` rows | **1** — `NDM-AST-041 vintage_collector_desk_16x9.jpg → WRONG_FORMAT` |
| Name/pixel mismatches | **18** (see §1.6) |
| Dimension decode failures | 0 |
| Uncatalogued files | **3** — `logo_presentation_scene_16x9_v3.webp` (7,572 B), `_pending_review_AI_generated/GENERATED_ASSETS_MANIFEST_AR.md` (9,241 B), `_pending_review_AI_generated/_manifest.json` (7,075 B) *(5 paths by 2 November — the archive and the relocated manifest join the list, and eleven duplicates of catalogued filenames pass unflagged because "uncatalogued" is decided by basename: `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §6.5)* |
| All 10 additional assets | present, located inside `_pending_review_AI_generated/`, and **pending approval** *(their presence at that path lapsed for twelve minutes on 2 November when the Owner relocated them to the library root; preflight FAILed, they were restored from `HEAD`, and 82 of 82 rows re-verify by SHA-256 — §R)* |
| Catalog-name verification | 82 of 82 filenames confirmed verbatim against `reference/Noujoude_Line_by_Line_Traceability_EN.csv` (8,174 data rows) — no entry accepted on the strength of its Appendix A line number (S-11) |

The tool reports presence and pixels; it explicitly does **not** report licensing. `Rights Status` is `UNKNOWN — no rights statement supplied in reference/` for all 72 originals and `Awaiting Rights Review` for all 10 additional assets; `Brand/Curatorial Approval` is `Not Approved — no approval record supplied` for **82 of 82**. That is a finding, not a gap in the tool.

**The three cell values in that paragraph are the 31 October state and no longer appear anywhere in the CSV** (measured 4 November 2026 by a distinct-value scan: `Rights Status` returns two values, both prefixed `Owner-Declared Owned — authorisation: Owner mandate 2026-11-04 §2`, and `Brand/Curatorial Approval` returns two, both prefixed `Approved — Owner mandate 2026-11-04 §2`). The paragraph's *rule* is untouched and is now more load-bearing than it was: the audit still reports no licence, because a marker written by the Owner's declaration is a permission over a file, and the tool cannot and does not convert it into a rights instrument, a creator or an object fact — `Source/Creator` still reads `Not supplied in any reference document` on **72** rows. See §1.6a and `docs/OWNER_INPUT_REGISTER.md` §6F.

**Coverage limit on the `82 of 82` line above — read it before quoting it (hole H-7).** That figure is produced by
iterating the 82 catalog rows and looking each one up on disk. It is a statement about the *catalog*: every catalogued
asset was found. It is not a statement about the *directory*, and this tool's own output shows why — the same run
reports `Physical files found / bytes: 85 files`. The three extra files are the two AI-generated-review manifests and
one quarantined image, all listed in the `Uncatalogued files` row above and documented in
`docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §6.5. A directory-enumerating check would have to report `85`, and would then
have to explain the difference.

`scripts/preflight.mjs` performs the narrower check. Its line 112 holds the message template
`all ${checked} audited assets match their recorded SHA-256`, and the most recent run — re-executed for this batch,
exit **1** overall on the Node check — rendered that record as:

```
PASS | Noujoude.photo/ integrity
     | all 82 audited assets match their recorded SHA-256
```

That check is stronger than mere presence, because it re-hashes each catalogued file against
`docs/ASSET_INVENTORY_AUDIT.csv`. It is also narrower, because it loops over the CSV's rows (`preflight.mjs` line 105)
and never enumerates the directory. The PASS is true as far as it goes and **must not be read as a claim that the asset
library is fully accounted for** — a directory walk reports 85 files, and preflight cannot see the three that are not in
the catalog. The gap is registered as hole **H-7** in `docs/IMPLEMENTATION_PLAN.md` §8, with the interim control
(`audit-assets.mjs`'s `physicalFileCount`, which does enumerate) and the Phase 2 fix. The script was **deliberately not
modified** in this batch: redefining what a validation gate checks is not inside a scope authorized to re-run
documentation gates. The measurement behind the 85 was `find Noujoude.photo -type f` → exit 0.

**Pointer rot found while reconciling counters on 3 November 2026, reported rather than patched away.** Both line
references in the two paragraphs above addressed `scripts/preflight.mjs` as it stood before the reformat batch: the
file measured **362** lines at `2ae97b3^` and **578** at `2ae97b3`, where HEAD still is, because prettier expanded
calls this repository had written compact. The coupling that `docs/IMPLEMENTATION_PLAN.md` §8's H-13 row and its §4B
narrative predicted for that file therefore **did materialise** — the numbers are the evidence — and the citation
above moved with them. Two
substance points follow, both measured at HEAD on 3 November 2026. First, the integrity line this row transcribed has
not been printed since hole H-7 was closed on 1 November: the script now reconciles catalog against directory, and
the string survives only inside the comment that records its removal, at line **106** before the reformat and line
**167** now. Second, the live check prints the reconciliation row, which today reports at WARN inside a tally of
10 checks at 0 FAIL, 2 WARN and 8 PASS, exit **0**, catalog rows 82 against physical files 97 with the Docker row
cold on that run. The figures 105 and 112 are left exactly as written because they are what that batch saw. The
finding for the Owner is a gate-coverage gap in the same family as the span-endpoint one recorded at
`docs/PHASE1_DISCOVERY_AND_READINESS.md` §15: `node scripts/verify-citations.mjs` validates a bare line reference
against the source's length and the presence of text at the addressed line, so a pointer that now lands on
unrelated code still exits 0 — it cannot know which identifier the prose meant. What the paragraphs above claim about
the check's reach — it walked the catalog and could not see files the catalog omitted — is unchanged in kind, and is
now measured by a directory-enumerating row instead of by the PASS line that was removed.

**Neither figure says anything about rights.** 82 of 82 physically present and 0 of 82 rights-cleared are independent
measurements, and the second one is the binding constraint on publication. **Re-measured 4 November 2026, and the
independence is the point that survives the change:** presence is still **82 of 82** (`Physical Status` returns
`PRESENT` on 81 and `WRONG_FORMAT` on `NDM-AST-041`, so 82 files exist and one of them lies about its type), while
the rights column now carries the Owner's cleared marker on **82 of 82**. What was true then and is true now is the
first sentence: a presence count says nothing about rights, and it still does not — the count that moved moved
because a person with the authority to grant permission wrote a declaration, not because this tool learned anything.
The constraint on publication is no longer the rights cell; it is the publication register, the unrecorded creator,
and **RB-12**'s missing provenance label. See §1.6a.

### 1.3 `node scripts/check-docx-alignment.mjs` → **exit 0**

```
docx paragraphs 4430 | md paragraphs 2756
md word types 3364 | docx word types 3357 | external link targets 6
DOCX vocabulary missing from Markdown (content-loss risk): 0 []
Markdown-only word types: 0
md headings: 337 | absent from docx: 0
md paragraphs absent from docx: 3 (substantive: 0)
VERDICT: ALIGNED — the Markdown carries no requirement content the DOCX lacks and the DOCX contributes no requirement vocabulary the Markdown is missing. Remaining differences are Word packaging and hyperlink-reflow artifacts, listed for transparency.
wrote docs/DOCX_MD_ALIGNMENT.json
```

| Item | Result |
|---|---|
| Markdown headings located in the DOCX | **337 / 337** |
| DOCX requirement vocabulary absent from the Markdown | **0** |
| Substantive paragraph misses | **0** |
| Paragraphs not contiguous in the DOCX | **3**, all reference blocks whose URLs the DOCX stores as hyperlink targets (WCAG, Core Web Vitals, ASVS) — classified as reflow, listed for a reviewer to disagree with |
| DOCX input | `reference/Noujoude_Master_Specification_EN.docx`, 142,645 bytes, SHA-256 `69ccb03eec9806a5601c3cd066c93a1faf295efbe3464611256ddd56b5f71283` |
| Markdown input | `reference/Noujoude_Master_Specification_EN.md`, 242,312 bytes, SHA-256 `5b30b21eaf6d6457b10b80e0ba48bc511c106db484336934b8e06d34ae47ecd5` |
| Method | dependency-free: ZIP local headers parsed directly, `word/document.xml` inflated with `node:zlib`, hyperlink targets read from the relationship table; no npm install was needed to prove document alignment |

This is the measured basis for S-14 / ADR-018 (two masters, no stated precedence) — resolved by comparison, not by preference.

### 1.4 `node scripts/copy-master-spec.mjs` → **exit 0** (last run in this window)

```
wrote docs/MASTER_SPECIFICATION.md | 257,099 UTF-8 bytes | 4,069 lines (final newline present)
body byte-identical to source: YES (misaligned lines: 0)
verbatim body starts at this file's line 129 = source line 1
source sha256 5b30b21eaf6d6457b10b80e0ba48bc511c106db484336934b8e06d34ae47ecd5
header rows: 15 discrepancies
```

Transcribed from the run executed at 13:39Z on 1 November 2026, exit **0** — the first run after the §2.2 defect was
fixed, so this transcript and the one it replaces are not the same tool. The previous reading of this section printed
`255,561 bytes | 4070 lines`; those were a UTF-16 code-unit count wearing a byte label and a split length wearing a
line count. The figures above are taken from the file the tool just wrote, and each was checked against an
independent measurement in the same command sequence: `wc -c` → **257099**, `awk 'END{print NR}'` → **4069**,
`grep -c '^'` → **4069**, a Node `Buffer.length` read → **257099**, and the two *old* formulas re-evaluated on that
same file → **255561** and **4070**. Both old figures reproduced exactly, which is what shows the new ones are the
same file measured correctly rather than a different file.

The tool is still idempotent apart from its own timestamp row: two consecutive runs differ by exactly one `diff`
line — `| Copy generated | 2026-11-01T13:39:51.636Z |` against `| Copy generated | 2026-11-01T13:40:05.077Z |`. The
fix changed what the tool *reports*, not what it writes: the file on disk was 257,099 bytes before this run and
257,099 bytes after it.

| Item | Value |
|---|---|
| Source SHA-256 re-stamped into the header | `5b30b21eaf6d6457b10b80e0ba48bc511c106db484336934b8e06d34ae47ecd5` |
| Verbatim body fidelity | byte-identical to the source body, 0 misaligned lines |
| Discrepancy rows in the header | 15 (`S-01`…`S-15`; 14 at the start of this window — see §2.3) |
| Reported size label | **correct as of the run above** — byte count read from the file as a Buffer and labelled `UTF-8 bytes`, line count counted by terminating newline with the final-newline state announced (§2.2 closed) |
| Regression guard | `node scripts/tests/copy-master-spec-output.test.mjs` → `11 passed, 0 failed`, exit **0** (row in §1.8; command in §9) |

### 1.5 `sh -n scripts/db/*.sh` → **exit 0 for all four; the privilege harness has now been executed (1 November 2026, exit 0)**

Syntax check plus, in this batch, the real run. Four scripts now carry the database layer: `init-roles.sh` (bootstrap
roles, ADR-005 refined by ADR-019), `harden-append-only.sh` (post-migration grant/trigger/RLS
enforcement), `verify-privileges.sh` (asserts the ADR-019 grant set as catalog rows), and
`run-privilege-tests.sh` (the host-side evidence harness behind `pnpm db:privilege-evidence`).

`run-privilege-tests.sh` was **attempted** on 31 October 2026 against a throwaway container
name and volume with randomly generated throwaway passwords that were never persisted
anywhere. It aborted at its first step with `FATAL: the container could not be started
(engine unavailable?)`. Nothing was created and nothing was torn down. **That reading is
superseded by the successful run recorded below** and is kept because the sequence — not just
the outcome — is what makes B-09 a dated fact rather than a permanent property of the machine.

**Re-attempted in the gap-closure batch: not possible, and deliberately not retried.** The
prerequisite was re-measured rather than assumed (§0): `wsl -l -v` → `docker-desktop **Stopped**`,
and `docker version` / `docker info` / `docker ps -a` / `docker images` each returned **rc=124**
with **0 bytes**. The harness was therefore **not** launched a second time in that window — an
instruction in force for that batch forbids waiting repeatedly on commands that time out, and a
`docker run` against a stopped engine produces no information that `wsl -l -v` has not already
given. **Also superseded:** the engine answered on 1 November 2026 and the harness was run.

**Finding F-B, recorded so a false prerequisite is never added.** The harness is pure POSIX shell
driving the `docker` CLI, `timeout` and `od`; every SQL statement runs through `psql` **inside**
the container, so no host PostgreSQL client is required. It reads no `package.json`, resolves no
Node module, and never invokes `node` or `pnpm`. Consequently **A.5 requires neither the Node
upgrade (B-01) nor a dependency install (B-02)**, and it does not need `.env` — it generates
throwaway credentials per run and never writes them to a file. Its **only** hard prerequisite is a
reachable container engine (B-09). Anyone who lists B-01 or B-02 as blocking A.5 is repeating an
error this section exists to correct. F-B has now been *demonstrated*, not merely read: the run
below executed with the host still on Node 24.19.0 and with no `node_modules` present.

**A.5 CLOSED — executed 1 November 2026, exit 0, raw transcript in `docs/A5_PRIVILEGE_EVIDENCE.txt`.**
`IMAGE=postgres:18.6-alpine sh scripts/db/run-privilege-tests.sh`. What the transcript measures:

| Element | Measured |
|---|---|
| Server actually tested | `SHOW server_version` → `18.6`; major 18 agrees with the tag, so the transcript measures what it claims |
| Grant-state assertions (`verify-privileges.sh`) | **34 PASS**, ending `[noujoude] privilege state matches ADR-019` |
| Behavioural cases A–N | **14 of 14 matched expectation for an authorization reason** — every denial carried `ERROR: permission denied for table …` or the guard function's own message, never a syntax or connection error |
| Positive controls included | A (runtime may INSERT into `audit_event`), E (runtime may UPDATE an ordinary relation), I (migration may append), J (reporting may SELECT) — without them the denials would prove nothing |
| Append-only enforcement mechanism | trigger `ndm_append_only` + RLS `FORCE ROW LEVEL SECURITY` + four policies; `TRUNCATE`, `DROP POLICY` and `DISABLE ROW LEVEL SECURITY` as `ndm_runtime` are all refused (M, N) |
| Residual risk, measured not asserted | `VULNERABLE` — the table owner `ndm_migration` **can** drop the guard trigger and the RLS policies, and with them dropped its `UPDATE` succeeded, so the exposure is real rather than theoretical |
| Compensating control, proven to detect it | `DETECTED` — `verify-privileges.sh` failed on exactly the removed guard (exit 1), then `RESTORED` — re-applying `harden-append-only.sh` returned it to exit 0 and the owner's `UPDATE` was refused again (`DENIED`) |
| Isolation and cleanup | one throwaway container + one throwaway volume, both named by the run and removed by the run; `noujoude-postgres`, `noujoude-postgres2`, `noujoude-postgres3` and `pgvector-data` were re-listed afterwards in their original state and were never connected to; no password appears in the transcript |

What this means for the claims below: the scripts' content — four roles
`ndm_migration` / `ndm_runtime` / `ndm_reporting` / `ndm_backup`; runtime granted DML but
not CREATE, and stripped of `UPDATE`/`DELETE`/`TRUNCATE` on relations declared append-only;
schema owned by the migration role — **is now a demonstrated privilege boundary, demonstrated
inside a disposable container only.** Standard §3.2 and Master Spec line 3822 compliance for
*this project's actual database* is still not claimed: no project database exists yet (§3 row 9,
`Not run` — **the reason changed on 1 November 2026:** `.env` now exists under OD-3 and `docker compose config`
renders with exit **0**, so `pnpm db:up` is blocked only by not having been requested, not by B-03), and the proof
above ran against representative relations created by the harness, not against migrated Payload tables. The residual
risk survives unchanged by design: the table owner can drop the guard, and the compensating control is a CI assertion
that exists as code (`.github/workflows/ci.yml`, job `db-privileges`) but has **never executed** — a repository has
existed since OD-4, and it still has no remote and zero runs (B-08). **Audit immutability in production therefore
remains unproven even though the grant design is proven** — the two statements are different, and
collapsing them is the error this paragraph exists to prevent.

### 1.6 Derived measurements from the executed audit (same evidence, restated)

Produced by re-reading `docs/ASSET_INVENTORY_AUDIT.csv` rows in Node; these support risk items R-02 … R-05.

| Measurement | Value |
|---|---|
| Rows in the CSV | 82 |
| Filenames containing `_1024` | 18 |
| Of those, longest side ≥ 1024 px | **0** |
| Actual pixel sizes of the `_1024` set | 512×512 ×16; 341×512 ×1 (`logo_stacked_vertical_1024x1536`); 512×384 ×1 (`logo_wordmark_1024x768`) |
| Rights-cleared assets | **0 of 82** — superseded 4 November 2026, see the paragraph under this table |
| Approved assets | **0 of 82** — superseded 4 November 2026, see the paragraph under this table |
| Assets with a supplied creator/source | **0 of 82** (`"Not supplied in any reference document"`) — unchanged on the 4 November re-read, for the reason §1.6a gives |
| `WRONG_FORMAT` detail | `NDM-AST-041`: extension `.jpg`, magic bytes `RIFF….WEBP`, real MIME `image/webp`, 512×290 |
| AI-generated assets in the pending folder | 10, each `ai_generated: true`, `approval_state: "Pending Human Approval"`, `rights_state: "Awaiting Rights Review"` (`_manifest.json` lines 21–23); **all 10 `source_png` originals absent from the filesystem** (existence-tested individually) — unchanged 4 November 2026, and one fact joined it: the same ten files are now cleared, approved and published in `docs/asset-governance/publication-register.json`, each on exactly one concrete route (6 on `/en/worlds/{country}`, 4 on `/en/collections/{category}`), so the quarantined manifest and the register now disagree about the same bytes. `docs/asset-governance/owner-authorization.json` records that the register governs the build; OID-17 records the disagreement as an open Owner item, and no file inside the protected library was edited to hide it |

### 1.6a The same measurements re-run on 4 November 2026

The table above is a 3 November reading of a tree that no longer exists and is kept as that window's measurement.
Re-running the identical Node parse over `docs/ASSET_INVENTORY_AUDIT.csv` on 4 November 2026 returns the same
**82** rows and the same pixel facts, and moves three of its counters: `Rights Status` now carries the cleared
marker the gate recognises on **82 of 82** rows and `UNKNOWN` on **0**, `Brand/Curatorial Approval` carries the
approval marker on **82 of 82** and `Not Approved` on **0**, and `docs/asset-governance/publication-register.json`
names **46** published rows against **36** not published, which `docs/asset-governance/clearance-ledger.json`
resolves into **45** authorised asset/profile pairs and **37** refusals. The fourth row this section reported
did not move: `Source/Creator` is still `Not supplied in any reference document` on **72** rows, the other **10**
naming the generating model rather than a human creator. **`supplied creator/source | 0 of 82` is therefore the
one counter here that the Owner's declaration could not touch, because it counts an absent fact rather than an
absent permission** — the distinction is recorded in `docs/OWNER_INPUT_REGISTER.md` §6F. What this section never
claimed and still cannot: that any of these numbers is a test result. All of them are file reads over a
governance register, and none of them is evidence about a historical object.

### 1.7 Static validation of authored configuration

| Check | Result |
|---|---|
| `JSON.parse` of `package.json` | parse OK (re-verified in the gap-closure batch, after the `format:check` script was added) |
| `JSON.parse` of `tsconfig.json` (JSONC subset actually used) | parse OK |
| `JSON.parse` of `docs/asset-audit-summary.json` | parse OK |
| `JSON.parse` of `docs/REFERENCE_INTEGRITY.json` | parse OK |
| `JSON.parse` of `docs/DOCX_MD_ALIGNMENT.json` | parse OK |
| `JSON.parse` of `docs/CITATION_VERIFICATION.json` | parse OK |
| `sh -n scripts/db/init-roles.sh` | exit 0 |
| `sh -n scripts/db/harden-append-only.sh` | exit 0 |
| `sh -n scripts/db/verify-privileges.sh` | exit 0 |
| `sh -n scripts/db/run-privilege-tests.sh` | exit 0 |
| `package.json` scripts inventory | **39** scripts (re-measured 1 Nov 2026 by `node -e "Object.keys(require('./package.json').scripts).length"` — not by arithmetic over an older reading; this row last carried **37**, so two scripts have joined the file since that measurement. One is this batch's `test:gate:spec-copy`; the other is not attributed here, because counting keys reports a total and not an authorship, and guessing the cause would be the unverified-claim class §0 of `docs/IMPLEMENTATION_PLAN.md` exists to catch. The **29** recorded at the close of the gap-closure batch predates the gate registration, which added `test:gates`, the five `test:gate:*` aliases, and the two new gate commands `audit:compose` and `audit:workflow`); `format` = `prettier --write .`, `format:check` = `prettier --check .` (I-10 — the check-only form now exists) |
| `.prettierignore` | present; **14** non-comment patterns (the row below carries the re-measurement); asserts confirmed for `reference/` and `Noujoude.photo/` (the two read-only inputs) |
| `.npmrc` | present; **75 lines / 5,647 bytes, comments only — 0 option lines** (re-measured by a byte scan on 1 November 2026 after the measured value matrix was added to it: no CR, no tab, final newline present, 75 comment lines and **0** non-comment lines), and that emptiness is the finding: `verify-deps-before-run` (the key that would stop `pnpm run <script>` installing before it runs) is read by pnpm 11.21.0 only from the *global* config file, proved by a control line placed in this same file that *was* honoured. The file now also records what **every** value of that key does, measured rather than assumed: `install`/unset begin resolution; `error` refuses with exit 1; `warn` prints a warning and then **runs the script**; `false` runs it silently; an unrecognised value runs it too, because pnpm's switch has no default case; and `prompt` refuses **only** when stdin is not a terminal, so it is not a guard at a keyboard. It holds no credentials and `.gitignore` does not exclude it, so nothing credential-shaped may be written here. Hole **H-12**, blocker **B-10**, decision **OD-7**; `node scripts/preflight.mjs` check 10 classifies the values exactly that way |
| `.github/workflows/ci.yml` | **416 lines, 22,226 bytes, four jobs, 45 step items (37 named + 8 bare `actions/…` steps)** — re-measured 1 November 2026 after the §2.2 spec-copy suite joined `docs-gates`; the three earlier additions were the compose contract, the workflow contract and the `pnpm run`-trap contract with their suites; **no tab characters, no CR bytes, final newline present** — counted with `tr -dc` over the whole file (0 CR, 0 TAB) and re-confirmed by a Node byte scan. **A measurement trap, recorded because it is repeatable:** `grep -c` with a carriage-return argument reports *every* line of an LF file on this host's Git Bash, so it must not be used for line-ending evidence; use the byte count. **A second trap, found while re-counting for the H-11 gate:** the step counts this table has carried — 33, then 35 — are *named*-step counts from a pattern that matches `- name:`, so they cannot see the eight `uses:` steps that have no `name:` line at all. The honest figures are 41 step items at 370 lines, **43** at 386, **44** at 399 and **45** at 416. Four jobs present (`docs-gates`, `quality`, `db-privileges`, `security-scans`) plus the `on.push` trigger. **Six earlier readings of this file were wrong or stale and are corrected here:** this section first recorded *337 lines, 15727 bytes*; the gap-closure batch corrected that to *336 lines, 16,374 bytes*; the 1 November additions moved it four times more — *368/18,410*, *370/18,563*, *386/19,799* and *399/20,772*, then the value-matrix rewrite of the H-12 step's comment moved the bytes to *20,787* while leaving the line count at **399** (a length-preserving edit, which is why only one of the two figures moved), and the new step took it to the current **416/22,226** — a non-length-preserving one, so both moved this time. Each correction is the count-drift class §0 of `docs/IMPLEMENTATION_PLAN.md` exists to prevent. **Machine-validation status, changed on 1 November 2026:** no YAML conformance parser exists on this host (§0 last row, re-measured rather than inherited), so the file was previously verified by reading only; `node scripts/verify-workflow-structure.mjs` now enforces ten structural rules over it and exits **0**, which proves it parses as block YAML and that its jobs, steps, script paths, `pnpm` names and gate list are consistent — it does **not** prove GitHub's parser accepts it. Recorded as **authored, structurally checked, never executed** — the file says so in its own header. |
| `.prettierignore` | **66 lines** (`awk 'END{print NR}'` → 66), **4,411 bytes**, **16** patterns — counted as the lines that are neither blank nor comment-led — with `reference/` at line **18**, `Noujoude.photo/` at line **21**, the quarantined `brand/` at line **29** and the citation-addressed `docs/` at line **40**. The 1 Nov figures (45 lines, 2,709 bytes, 14 patterns) were correct when taken and were superseded by the two additions the Owner's 2 Nov directive authorised. All four figures re-measured 2 November 2026 |

These prove the files are well-formed. They do **not** prove the files work — and this sentence is the 31 October
record, kept because the paragraph above it is that window's measurement. Two of its five claims were falsified by
the 2 November 2026 execution: `tsconfig.json` **has** since been consumed by `tsc` (`pnpm typecheck` exit **0**),
and `eslint.config.mjs` **has** since been loaded by ESLint (`pnpm lint` exit **0**, and loaded enough to reject
five separate defects in itself before it ran at all — see its own header comment). `vitest.config.ts` has since
been read by Vitest too (exit **0**, 4 files, 34 assertions). What remains exactly as written is
`playwright.config.ts`, which has never driven a browser, and `ci.yml`, which has never been parsed by a YAML
engine belonging to a CI system or run by one: `node scripts/verify-workflow-structure.mjs` checks its shape, and
GitHub's parser has never seen it. A well-formed file that has never been executed is authored work, not verified
work — and the 2 November batch is the difference between the two for four of these five files, which is why §4
rows 2, 3, 5 and 11 now read `Executed` with a recorded exit code, and why rows 7, 8 and 12 still read `Not run`. **2 November 2026: four of those five clauses are superseded by execution, and the fifth is the one that still cannot be fixed here.** `tsconfig.json` has now been consumed by `tsc` (`pnpm typecheck` exits **0** over **26** `.ts`/`.tsx` files under `src/`), `eslint.config.mjs` has now been loaded by ESLint (`pnpm lint` exits **0**, and the same config exits **1** on a planted probe file, so the load is proven to bite and not merely to parse), `vitest.config.ts` has now been read by Vitest (`pnpm test` exits **0** over **4** files with **34** assertions, where its 1 November reading was exit **1**, `No test files found`), and `package.json`'s `format:check` has now been executed by Prettier (exit **1** over **25** files, §3.1). What remains exactly as written: **`playwright.config.ts` has never driven a browser** — `tests/e2e/` contains **0** spec files, so this section's own sentence still holds, and this batch did not launch one (the served-app ports belong to a parallel workstream; §4 rows 5 and 6) — and **`ci.yml` has still never been parsed by a CI system or run**, because there is no remote and no runner (blocker **B-08**, zero runs), which is also why §4's three locally green rows do not move the §8 CI cell from **0 of 12**. The rule at the end of that sentence is what both halves obey: an executed check is verified work, an authored one is not, and neither reading turns a shell exit into a pipeline result.

### 1.8 Documentation-integrity gates → **both exit 0**

These two read `docs/` rather than a system, so they are the documentation-integrity gates. They were **not** the
only dependency-free commands in the repository when this section was written, and they are not now: the compose
contract and the workflow contract (§1.7 rows) and all seven regression suites also run with no `node_modules`, no
server and no network. They were re-run after every batch of `docs/` edits in this window, and again at the end of
the gap-closure batch — the fresh transcripts are in the table below, and the superseded 01:50–02:10 readings are
kept only where a correction has to be shown.

**Correction I-3, applied in this batch.** The 01:50–02:10 transcription of `verify-citations.mjs` recorded
`NO_LINE_REF 42`. That figure was wrong: it contradicted the identity written three paragraphs below it in this
very section (`425 + 10 + 9 + 41 = 485`, the values as they stood at that moment — the final post-edit values are
`426 + 10 + 15 + 55 = 506`, in §1.8.1), it contradicted `docs/ARCHITECTURE_DECISIONS.md` §0.1, and it
contradicted the tool's own machine-written output `docs/CITATION_VERIFICATION.json`, which records
`"noReference": 41`. The JSON was settled as authoritative because its mtime (17:48:04) is later than this
section's (17:47:02) — the tool wrote it after the prose was transcribed. The digit is corrected here and the
gate was then **re-run**, rather than being left as a silent edit.

| Command | Actual output | Exit |
|---|---|---|
| `node scripts/verify-citations.mjs` | _final transcript in §1.8.1 below_ | 0 |
| `node scripts/verify-tables.mjs` | _final transcript in §1.8.1 below_ | 0 |
| `node scripts/verify-tables.mjs` against a **throwaway fixture outside the repository** (`/tmp/tblneg`: one 4-cell header with one 3-cell row, plus a pipe-led pseudo-table inside a fenced block) | `bad.md: table at line 1 has 3 separators; 1 uneven row(s): line 4 -> 2` and `UNEVEN TABLES: 1 of 1 tables in 2 files (exit 1)`; the fenced pseudo-table was correctly not treated as a table | 1 |
| The seven gate regression suites, run **individually** 1 November 2026 (`node scripts/tests/<suite>.test.mjs`, one command per row) | `14 passed, 0 failed` (H-9 tables) · `22 passed, 0 failed` (H-7 asset reconciliation) · `23 passed, 0 failed` (H-8 citations) · `25 passed, 0 failed, 0 skipped (dynamic cases need a container engine)` (H-10 compose) · `32 passed, 0 failed` (H-11 workflow structure) · `19 passed, 0 failed` (H-12 pnpm-run trap — one case per **measured** value of `verify-deps-before-run`, where the two that must not pass are `prompt` and an unrecognised value, and the wording of each line is asserted too) · `11 passed, 0 failed` (§2.2 spec-copy output — the figures the generator prints about the file it wrote, checked against the file on disk, red-verified at `4 passed, 7 failed` against the pre-fix formulas) — the middle suites each drive their own checker over red and green fixtures, the compose suite's three dynamic cases report **SKIP** rather than PASS where no engine answers, the trap suite spawns the real `scripts/preflight.mjs` against temp fixtures with a stub `pnpm` on the child's PATH, and the spec-copy suite spawns the real generator with a throwaway workspace as its `cwd`. **This row used to read "run together (`pnpm test:gates`)" and that claim is withdrawn.** Measured on the same code path: `pnpm run audit:workflow` reached the dependency-resolution stage and printed `Progress: resolved 669 …` before it was killed, because pnpm verifies the declared dependencies before running any script and `node_modules` is absent by design (B-02/OD-2). `pnpm test:gates` was started once, produced **0 bytes** of captured output, and was killed — so its behaviour is the same code path rather than an independently observed one, and it is recorded that way. Nothing landed in this directory; the machine store did receive packages. The aggregate command therefore has never been the thing that produced these numbers, and the seven commands above are the real procedure. `pnpm test:gates` is the correct command **after** OD-7 arms the guard and OD-2 installs; until then the seven commands above are the real procedure, and they are what §9 prints | 0 |

#### 1.8.1 Fresh re-run after the gap-closure edits

Both gates were run **after** every documentation edit in this batch was complete, so these are that batch's
transcripts rather than an intermediate reading. Exit codes were captured directly from the process, not through
a pipe. **The blocks below are dated, not current.** Both gates ran again at the end of the 1 November work, after the
`verify-deps-before-run` matrix was measured and written up, and again after the §2.2 correction was made: **528**
fragments (VERIFIED 426 + SELF_RECORDING 10 +
PROJECT_RECORD 10 + no-line-ref 82 = 528, `DEFINED_TERM` 6 inside that 82, 0 verbatim-without-citation) and **196**
tables, both exit **0**. **A third pair of runs closed the Owner-authorization window later the same day: 533
fragments — VERIFIED 427 + SELF_RECORDING 10 + PROJECT_RECORD 10 + no-line-ref 86 = 533, `DEFINED_TERM` 6 inside that
86, 0 verbatim-without-citation — 199 tables, and 1,247 bare references all resolving, both gates exit 0.** The +3
tables are attributed by measurement, not by narration: `grep -cE '^[\|][\s:-]*---'` per file against
`git show HEAD:<file>` gives +2 in `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` (§7.2's reconciliation tables) and +1 in
`docs/OWNER_INPUT_REGISTER.md` (§6A's per-item table), ten files unchanged. The counts moved — 506 → 522 → 525 → 523 → 526 → 527 → 528 → **533** fragments, 192 → 194 → 195 →
**196** → **199** tables, and 1,225 → 1,226 → **1,247** bare references — because writing about the work adds quotations, references
and table rows; the one-fragment delta lands entirely in the `NO_LINE_REF` class (81 → 82), which is what the tool
prints, but which specific sentence became it is not attributed here, since the gate reports a class total and not an
authorship, and guessing at the cause would be exactly the unverified claim this report exists to prevent. The
transcripts printed below are kept as the record of the run they show, not as today's numbers; §9 is the command list
that produces the current ones.

**Fourth pair of runs — 2 November 2026, the Owner's Phase 0/1 closure batch, and the latest recorded run in this
section until the closure run two paragraphs below.** The `docs/` set had grown to fourteen markdown files by then (the two Phase 1 documents added on 2 November).
First pass: **545** fragments — VERIFIED 434 + SELF_RECORDING 10 + PROJECT_RECORD 10 + no-line-ref 91 = 545, `DEFINED_TERM`
6 inside that 91, 0 verbatim-without-citation — **233** tables, and **1,494** bare references all resolving; the citation
gate exited 0 and the table gate exited **1** on one malformed row of a register table in `docs/IMPLEMENTATION_PLAN.md`
(a 3-cell row under a 4-column header). Second pass, minutes later, after that row's own author repaired it: **543**
fragments (VERIFIED 433, PROJECT_RECORD 9, no-line-ref 91, other classes equal), **234** tables in 14 files, and **1,505**
bare references, **0 defects**, both gates exit **0**. Two transitory reds inside that window are recorded rather than
dropped, because they are findings about concurrency, not about the gates: the citation gate also exited **1** with
`NOT_FOUND 1` while another workstream was rewriting the Status line of `docs/ARCHITECTURE.md` that
`docs/REQUIREMENTS_TRACEABILITY.md` quotes, and `pnpm test:gates` failed on `22 passed, 1 failed` for the same reason.
Neither defect was in a file this batch owned, and neither was repaired at that moment — one of them was repaired
later in the same window, in the run below, because the file that caused it went on being edited.
The chain therefore continues: 506 → … → 533
→ **545** → **543** → **542** fragments, 192 → … → 199 → 226 → **233** → **234** → **238** tables, 1,225 → 1,247 → 1,407 → **1,494** → **1,505** → **1,503**
bare references — and the standing rule is unchanged, *read the number the command prints today, not the one quoted here*.

**Fifth pair — the closure run of the same batch, 2 November 2026, and the reading `docs/PHASE01_CLOSURE.json` carries.**
`node scripts/verify-citations.mjs` exits **0**: 14 markdown files, **542** quoted fragments carrying a line reference
(VERIFIED **433** + SELF_RECORDING 10 + PROJECT_RECORD 9 + no-line-ref 90 = 542, `DEFINED_TERM` 6 inside that total),
0 LINE_OFF, 0 NOT_FOUND, 0 verbatim-without-citation, and **1,503** bare references checked with 0 defects.
`node scripts/verify-tables.mjs` exits **0** at **238** tables in 14 files. Between the fourth and fifth readings the gate
went red on **3** malformed rows, and this time the repairs belong to this batch: two rows of
`docs/REQUIREMENTS_TRACEABILITY.md` whose Evidence cells held a `grep` alternation inside a code span, where the pipe
character still separates table cells, were rewritten term by term with each pattern counted separately — the fresh
counts are drizzle 0 and knex 0 in `package.json` with 13 and 4 lines in the lockfile, and elasticsearch, meilisearch
and typesense 0 in both — and one row of this document's §4 table was rejoined to a single physical line. `pnpm test:gates`
exits **0** with all seven suites green, including the real-`docs/` case of each of the three documentation suites.

**Sixth pair — the motion batch, same day, after closure.** `node scripts/verify-citations.mjs` exits **0**: **15**
markdown files, **542** quoted fragments with every class figure identical to the closure run, and bare references
**1,521** checked with 0 defects — the +18 are the section-and-line citations of `docs/MOTION_SYSTEM.md`, which
cites by reference rather than by quotation and therefore added no fragment to the quoted population.
`node scripts/verify-tables.mjs` exits **0** at **244** tables in **15** files; the +6 are exactly the six tables of
the new document, counted with the same delimiter pattern used for every earlier attribution in this section. The
chain now reads 506 → … → 542 fragments, 192 → … → 238 → **244** tables, 1,225 → … → 1,503 → **1,521** bare
references, and the rule quoted above it is the one that keeps the chain honest: read the number the command prints
today.

```
$ node scripts/verify-citations.mjs
scanned 12 docs/ markdown files, 506 quoted fragments carrying a line reference (skipped 18 quoted strings shorter than 3 tokens)
VERIFIED 426 | LINE_OFF 0 | LINE_OFF_OTHER_SOURCE 0 | SELF_RECORDING 10 | PROJECT_RECORD 15 | DEFINED_TERM 4 | NOT_FOUND 0 | NO_LINE_REF 55 (of which 0 are verbatim requirement text with no citation)

wrote docs/CITATION_VERIFICATION.json
exit code: 0
```

```
$ node scripts/verify-tables.mjs
OK: 192 tables in 12 markdown files, every row with a uniform separator count
exit code: 0
```

The per-file breakdown for this run is clean: no file reports a `LINE_OFF` or `NOT_FOUND` defect, and no file
reports a verbatim requirement quotation missing its line reference. The console prints a per-file line only for
files that have a defect, so the final clean run prints none; the breakdown below is taken from
`docs/CITATION_VERIFICATION.json`, which is the fuller artefact. `docs/IMPLEMENTATION_PLAN.md` contributes
47 fragments — VERIFIED 38, SELF_RECORDING 1, PROJECT_RECORD 4, no-line-reference 4 — and this file contributes
34 — VERIFIED 19, PROJECT_RECORD 2, no-line-reference 13. Across all twelve files the classes reconcile exactly:
426 + 10 + 15 + 55 = 506, with `DEFINED_TERM` 4 counted inside the 55.

**These two gates did not pass first time, and the failures are part of the evidence.** Earlier runs in this same
batch reported `LINE_OFF 4 | NOT_FOUND 1`, then `NOT_FOUND 1` twice more, and `verify-tables.mjs` exited **1**
twice and returned **193** once while still exiting **0**. Twelve distinct defects were found and repaired:

| # | Defect | Found by | Repair |
|---|---|---|---|
| 1 | `docs/AI_CURATOR_GOVERNANCE.md:75` cited `ARCHITECTURE_DECISIONS.md` line 221; the text had moved to 341 | `verify-citations.mjs` | Citation corrected to 341 |
| 2 | `docs/AI_CURATOR_GOVERNANCE.md:116` cited line 228; moved to 348 | `verify-citations.mjs` | Corrected to 348 |
| 3 | `docs/AI_CURATOR_GOVERNANCE.md:150` cited line 250; moved to 369 | `verify-citations.mjs` | Corrected to 369 |
| 4 | `docs/DATA_MODEL.md:341` cited lines 227–228; moved to 348 | `verify-citations.mjs` | Corrected to line 348 (the fragment sits entirely on that line, so a range would have re-triggered `LINE_OFF` against its first number) |
| 5 | `docs/IMPLEMENTATION_PLAN.md` §2.1 quoted a **paraphrase** of Master Spec line 3252 inside quotation marks | `verify-citations.mjs` | Replaced with the verbatim sentence and its own line number |
| 6 | `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md:99` cited `ARCHITECTURE_DECISIONS.md` line 243 for ADR-009's consequence, now at 362–363 | **By hand — the gate cannot see it** | Corrected to lines 362–363, and the blind spot registered as hole **H-8** |
| 7 | The new H-7 row quoted Directive §3's asset rule with no line reference | `verify-citations.mjs` (it named Directive line 54 itself) | Reference added |
| 8 | Two rows of the new §0 measurement table embedded `grep` patterns containing a literal pipe inside code spans | `verify-tables.mjs`, exit 1 | Rows reworded; a Markdown cell cannot carry an unescaped pipe even inside backticks |
| 9 | `docs/IMPLEMENTATION_PLAN.md` §8's own table was split by a `---` thematic break between H-6 and H-7, so the two newest hole rows rendered as a headerless run | **By a count anomaly, not a failure** — `verify-tables.mjs` reported 193 tables and still exited **0** | `---` moved below H-8; the run re-merged; count returned to 192; a hand-run sweep for headerless pipe-led runs across all twelve files returns **0 orphans**. Registered as hole **H-9** |
| 10 | §0's discrepancy-log row reported **16** IDs `S-00…S-15`. `S-00` does not exist — `grep -o 'S-0[0-9]'` matched the substring inside `VIS-001` and `OPS-001` in Appendix G | By hand, while re-measuring every count for I-8 | Corrected to **15** rows `S-01…S-15` with an anchored pattern; the trap named in the row |
| 11 | §0's distinct-requirement-ID row reported **206** against 219 rows and explained the gap as cross-references inside cells. The explanation was invented: `REQ-[A-Z]+-[0-9]+` drops `REQ-A11Y-*` (4) and `REQ-I18N-*` (9) | By hand, when `docs/CHANGELOG.md` lines 192–195 contradicted it | Corrected to **219** distinct IDs, one per row, `uniq -d` empty. The same error had already been caught and written up once in the CHANGELOG and was then lost when the figure was retyped |
| 12 | Two further quoted phrases written in this batch sat next to unrelated line numbers and were read as citations: a phrase beside `preflight.mjs` line 105, and one beside `verify-tables.mjs` lines 71–82 | `verify-citations.mjs`, `NOT_FOUND` twice | Double quotes replaced with emphasis in both places. This is now the **third** occurrence of one class: prose quotation marks plus any nearby number are parsed as a citation |

Defects 1–4 share one cause worth naming: this batch made 20 edits to `docs/ARCHITECTURE_DECISIONS.md`, which moved
ADR-007, ADR-008 and ADR-010 body text by roughly 120 lines. Any document that cites an ADR **by line number** is
therefore structurally fragile, and only the citation gate detects it. Defect 6 shows the gate's reach is
narrower than a clean result implies: it validates a line number when a *quoted fragment* is attached to it, so a
bare parenthetical cross-reference is unvalidated. `LINE_OFF 0` must not be read as a claim that every
cross-reference in `docs/` resolves. Defect 8 is the reason the checker exists at all — a leading pipe eaten by an
edit is invisible to a human skimming a long table. Defect 9 is the sharpest of the twelve, because the gate was
**green** while the document was broken: uniformity inside a run says nothing about whether the run has a header.
Defects 10 and 11 are the same failure in a different tool — the tool was a regular expression, and a too-narrow
character class prints a clean, plausible, reproducible wrong number. Both are recorded in §0 of
`docs/IMPLEMENTATION_PLAN.md` as the third rule of that table.

Two properties of these outputs are recorded so a later reader does not mis-add them. First, the citation tool's
header sentence says "carrying a line reference" while `summary.fragments` is in fact the whole scanned
population; the identity that holds is `VERIFIED + SELF_RECORDING + PROJECT_RECORD + NO_LINE_REF = 426 + 10 + 15 + 55 = 506`, and `DEFINED_TERM` 4 is a **subset** of the 55, not a fifth exclusive class. The tool's console string
is left byte-identical because earlier sections of this file and `docs/CHANGELOG.md` transcribe past runs
verbatim; the explanation is a comment in `scripts/verify-citations.mjs` above the print statement. That quoted
phrase is itself one of the no-reference fragments — this file's description of the tool adds a fragment to
the tool's own count — which is why the totals move when prose about the gate is written, and why the totals are
never used as evidence of anything. The movement in this batch is a concrete instance: 485 → 500 → 506 fragments
and 174 → 180 → 192 tables, entirely from writing about the work. Second, the fixture row in §1.8 matters: a
checker that has never failed is not yet a checker — and in this batch both checkers *did* fail, on defects this
batch introduced, which is stronger evidence of their value than the fixture is. The fixture proves the table
check detects the exact defect class §2 records, and it lives outside the workspace, so no test file was added to
the repository to prove it.

**Correction I-3, restated against the final numbers.** The figure this batch was asked to correct was a stale
`NO_LINE_REF 42`. It was corrected to 41 on the authority of `docs/CITATION_VERIFICATION.json`, and the gate was
then re-run — which is the only reason the value is now known to be **55** rather than merely not-42. The
correction and the re-measurement are separate acts and both are recorded: a digit fixed by hand and never
re-measured would have been a fourth count-drift incident.

What neither gate proves: whether a claim is *true*, whether a table's cells are populated correctly, or whether
any of this works at runtime. `LINE_OFF 0` means every quotation matches the line it cites; it does not mean the
cited line supports the sentence built on it, which is a reading task the reviewer still owns.

### 1.9 Pinned-release verification — read-only, no install, no Node upgrade

Every fact in `docs/ARCHITECTURE_DECISIONS.md` §3, §3.2 and ADR-025 that concerns the **pinned** release was
obtained by reading published artifacts and registry documents. Nothing was installed, nothing was written
outside `docs/`, and no prerequisite was created. This section exists so those numbers can be re-produced rather
than trusted.

Two method notes that cost time and are worth recording. First, an early attempt wrote registry JSON to `/tmp`
and then read it with `node -e`; Node on this host is a Windows binary, so `/tmp/...` resolved to `E:\tmp\...`,
every file appeared `MISSING`, and the HTTP status was 200 — a false negative caused purely by a path-model
mismatch between MSYS and Windows. The fix was to eliminate the files: pipe `curl` into `node -e` on stdin.
Second, exit codes were captured **before** any pipe in every probe, because `cmd | head` reports `head`'s
status and had already produced one bogus `rc=0` for a timed-out `docker info`.

| # | Command (abridged where long) | Exit / HTTP | What it established |
|---:|---|---|---|
| 1 | `curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/payload/3.92.1` | **200** | the version-specific registry document is retrievable |
| 2 | same URL piped into `node -e` on stdin | rc=0 | `engines.node = "^22.23.4 \|\| >=24.22.1"`; `peerDependencies = { "graphql": "^16.8.1" }` and nothing else; **32** dependencies; `zod` **absent**; `jose` present at **5.10.0** |
| 3 | `curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/@payloadcms%2Fdb-postgres/3.92.1` | **200** | — |
| 4 | same URL piped into `node -e` on stdin | rc=0 | **no `engines` field at all**; `peerDependencies = { "payload": "3.92.1" }`; dependencies are exact pins — `pg 8.20.0`, `@types/pg 8.20.0`, `drizzle-orm 0.45.2`, `drizzle-kit 0.31.7`, `@payloadcms/drizzle 3.92.1`, `uuid 13.0.2`, `prompts 2.4.2`, `to-snake-case 1.0.0`, `console-table-printer 2.12.1`. This is the evidence behind correction **I-1** and behind assumption **A-C1** (no server-version constraint is declared anywhere). |
| 5 | `gh api 'repos/payloadcms/payload/contents/packages?ref=v3.92.1' --jq '.[].name'` | **rc=0**, 44 names | the package set at the exact tag this project pins |
| 6 | `grep -Eic 'auth\|mfa\|otp\|2fa\|two.?factor\|webauthn\|token\|factor\|identity\|sso\|oidc\|passkey'` over those 44 | **0 hits** | no first-party identity/MFA package at the pinned tag — closes finding **F-C** |
| 7 | `grep -c '^plugin-'` over the same list | **12** | the plugin set matches the plugins documentation page |
| 8 | `gh api 'repos/payloadcms/payload/contents/packages' --jq '.[].name'` | **rc=0**, 45 names | default-branch comparison |
| 9 | `comm -13` / `comm -23` between the two sorted lists | added: `codemod`, `oxlint-config`, `oxlint-plugin`, `tanstack-start`, `transformer-sharp` (5); gone: `eslint-config`, `eslint-plugin`, `richtext-slate`, `storage-uploadthing` (4) | `44 + 5 − 4 = 45 ✓`. Proves the tag and the default branch are **materially different**, which is why measurement 5 was necessary |
| 10 | `node scripts/preflight.mjs` | **rc=1** — `7 checks: 1 FAIL, 2 WARN, 4 PASS` | fresh transcript in ARCHITECTURE_DECISIONS §7.1 |
| 11 | `wsl -l -v` | rc=0 → `docker-desktop Stopped`, `Ubuntu Stopped` | finding **F-A**: the engine is stopped, not unhealthy |
| 12 | `docker context ls`; `docker compose version` | rc=0 both | client-side configuration and CLI version answer without a daemon |
| 13 | `docker version`; `docker info`; `docker ps -a`; `docker images` (each `timeout 30`/`40`) | **rc=124**, 0 bytes each | the engine does not answer at all → **B-09**, and A.5 cannot run |
| 14 | `node -v`; `pnpm -v`; `git --version`; `git rev-parse --is-inside-work-tree` | `v24.19.0`; `11.21.0`; `2.56.0.windows.2`; `fatal: not a git repository` | **B-01** and **B-04** both still open, re-measured rather than assumed |

Measured in the **earlier** pass on the same day (not re-run here, so no fresh exit code is claimed for them):

| Probe | Result as recorded then |
|---|---|
| `payload-3.92.1.tgz` enumeration | **2831** entries; **302** under `/auth/`; shipped strategies are `dist/auth/strategies/local/*`, `dist/auth/strategies/jwt.js`, `dist/auth/strategies/apiKey.js`, `dist/auth/executeAuthStrategies.js`. Case-insensitive `mfa\|otp\|totp\|2fa\|two.?factor\|webauthn` → 12 hits, **all `forgotPassword` files** (the substring `otP` in `forg`**`otP`**`assword`), i.e. zero genuine second-factor modules |
| `@payloadcms/next@3.92.1` | same `engines.node`; peer `next ">=15.2.9 <15.3.0 \|\| >=15.3.9 <15.4.0 \|\| >=15.4.11 <15.5.0 \|\| >=16.3.3 <17.0.0"`; peer `payload "3.92.1"`; peer `graphql "^16.8.1"` |
| `@payloadcms/richtext-lexical@3.92.1` | same `engines.node`; peer `react`/`react-dom "^19.0.1 \|\| ^19.1.2 \|\| ^19.2.1"`; peer `payload "3.92.1"`; peer `@payloadcms/next "3.92.1"` |
| `@payloadcms/plugin-cloud-storage@3.92.1` | no `engines`; peers on react/react-dom/payload |
| `https://payloadcms.com/docs/installation` | **HTTP 404** |
| `https://payloadcms.com/docs/databases/overview` | **HTTP 404** |
| `https://payloadcms.com/docs/databases/postgres` | **HTTP 404** |
| `https://payloadcms.com/docs/getting-started/installation` | **HTTP 200** — states the Node and Next.js ranges; **no database version range is stated on that page** |
| `https://registry.npmjs.org/-/v1/search?text=scope:payloadcms` (and `scope%3Apayloadcms`) | `total: 0` both ways — the scope route is unavailable, so a registry-wide `@payloadcms/*` enumeration could **not** be obtained. Recorded as a limitation in ADR-025 rather than papered over |

**What this section does not establish.** No installed tree exists, so none of the above is a statement about
what `pnpm install` will actually resolve; the exact `graphql` 16.x patch and any Zod constraint deeper in the
tree remain open (§3.2 A-C2, A-C3). And a manifest that declares no PostgreSQL version constraint is not a
support statement — assumption A-C1 stays open until an 18.6 container has actually been migrated against.

---

## 2. Corrections — claims this window's measurements supersede

The project's rule is that a retracted assertion is worth more than a quiet one. Four apply.

### 2.1 The preflight summary line has flipped four times, and the tally alone hides why

Four transcripts were captured in this working period — the first three of the same seven checks, the fourth of ten:

| # | Summary | What made it differ | Where recorded |
|---:|---|---|---|
| 1 | `7 checks: 1 FAIL, 2 WARN, 4 PASS` | `WARN \| src/ \| empty — application not yet scaffolded (intentional)`; Docker answered normally | superseded text in `docs/ARCHITECTURE_DECISIONS.md` §7.1, kept as a historical transcript |
| 2 | `7 checks: 1 FAIL, 1 WARN, 5 PASS` | `src/README.md` created → that check became PASS; Docker still PASS (`server reachable; compose: 5.3.1`) | the §1.1 block deleted by this edit, and §2.1's own earlier wording |
| 3 | `7 checks: 1 FAIL, 2 WARN, 4 PASS` | Docker degraded to `WARN \| daemon did not answer within 20 s` (**B-09**); `.env` remains absent (out of scope by agreement) | §1.1 — the 31 October reading; **superseded by the 1 November re-run below it**, where Docker is PASS and the second WARN is the H-7 reconciliation row |
| 4 | `10 checks: 1 FAIL, 3 WARN, 6 PASS` (1 November 2026, exit 1) | The **denominator moved**, which rows 1–3 cannot show: check 8 arrived with the compose contract (H-10), check 9 with the workflow structure contract (H-11), check 10 with the `pnpm run` dependency-check trap (H-12). Docker is `PASS`; the three WARNs are `.env` (B-03), the asset register (B-06) and the armed trap (B-10 / OD-7); the single FAIL is still Node 24.19.0 against `engines.node` (B-01) | this window; `docs/CHANGELOG.md` §K and §L; re-run the command in §9 rather than trusting this line |
| 5 | `10 checks: 1 FAIL, 4 WARN, 5 PASS` (1 November 2026, exit 1) — the §2.2 batch's sweep | **Same ten checks, one extra WARN, and the cause is a timing window, not a state change.** The first preflight of the batch ran against a cold Docker Desktop: the engine did answer, but `docker info` on that first call took **113,053 ms**, so check 2 reported `daemon did not answer within 20 s`. Re-measured in the same minute: second call **1,928 ms**, `docker ps` rc=0, `postgres:18.6-alpine` still cached, and a preflight re-run immediately after returned transcript **4**'s tally (`1 FAIL, 3 WARN, 6 PASS`), exit 1 unchanged. Nothing else moved between the two runs. Read as: transcript 4 and transcript 5 are the *same* state sampled at different engine temperatures, and the WARN is the honest report of a 20-second budget being exceeded — preflight is not wrong, and the daemon is not down. Consequence for every row that cites `6 PASS`: cite the per-row output, and if Docker reads WARN, time `docker info` before concluding anything about B-09 | this window, measured while closing §2.2 |

Transcripts 1 and 3 have the *same* tally for *different* reasons. That is the reason this
report keeps the per-row output and not just the summary line: a count of FAIL/WARN/PASS
is not evidence, the rows underneath it are. §2.1 previously asserted that transcript 2
superseded transcript 1 and that "the only FAIL remains B-01" was the only thing that
mattered — both true, but it presented Docker's PASS as stable. It was not. The current
state is B-09, and B-09 blocks the database-provisioning row of §3 (items 9–12) and every
ADR-019 privilege proof. **Both halves of that sentence have since been overtaken, and are kept to
show what was true when written:** on 1 November the engine answered (transcript 4 in §1.1,
`PASS | Docker | server reachable; compose: 5.6.1`), which removed the only prerequisite the
privilege harness has, and the harness ran and passed (§1.5). §3 row 9 is still `Not run`, but not
for the engine's sake — `docker-compose.yml` requires `.env` (B-03), which is absent by agreement.

### 2.2 `scripts/copy-master-spec.mjs` prints a character count labelled "bytes", and a line count that is one too high — **CLOSED 1 November 2026: fixed, measured, and regression-tested**

`scripts/copy-master-spec.mjs:266` reports `${written.length} bytes` where `written = fs.readFileSync(OUT,'utf8')`. `String.length` counts UTF-16 code units, so every typographic character (`’`, `“`, `≤`, `—`) is counted once while occupying 3 UTF-8 bytes. The same statement reports `${wl.length} lines` where `wl = written.split(/\r?\n/)`, and a split on a file that ends with a newline yields one extra empty element — the script's own comment at line 36 acknowledges exactly this for `bodyLines`. **The line reference in this section was itself stale:** an earlier revision named line 265, which is `const rel = …`; re-measured, the print statement is line **266**. **It is stale a second time, and that is the point of the warning:** in the fixed file the statement begins at line **284** of a 290-line file — the correction added 18 lines of comment above it and split the log over two lines — so line 266 now holds the comment that *describes* this defect. A line citation that quietly survives a refactor by landing on prose is more dangerous than one that fails loudly, which is why §1.4 cites the executed run and the suite, not a line number.

| Figure as printed | Correct label | Measured on disk at the same instant |
|---|---|---|
| `255,561 bytes` | UTF-16 code units of the generated file | **257,099** actual UTF-8 bytes (`wc -c`) |
| `4070 lines` | newline-terminated lines **plus one** empty trailing element | **4,069** actual lines (`awk 'END{print NR}'`) |
| _earlier run: `255,492 bytes`_ | same mislabel | _257,024 at that instant — the pair drifts with §2.3_ |

Any earlier citation of this file's size "as printed" (including the widely quoted 251,245 figure from the start of this window) inherits the same mislabel **and** the drift in §2.3. The `body byte-identical to source: YES` verdict is unaffected — it is a line-by-line comparison, not a length check.

**Fix applied on 1 November 2026.** The tail of `scripts/copy-master-spec.mjs` now reads the generated file back as
a `Buffer` and prints `writtenBuf.length` under the label `UTF-8 bytes`, and it derives the line count from
`hasFinalNewline` rather than from `split`'s length — announcing which branch it took, `(final newline present)` or
`(no final newline)`, so the reader can tell from the output rather than from the source. The recommended form in
the previous version of this paragraph, `Buffer.byteLength(written,'utf8')`, was not used: the file is already
re-read from disk for the byte-identical check, so taking the length of that same `Buffer` measures the artifact
instead of the string that produced it. Nothing about what the tool *writes* changed — §1.4 records the same
257,099 bytes on disk before and after.

**Behavioural evidence, not a code read.** `node scripts/tests/copy-master-spec-output.test.mjs` builds a
throwaway workspace in the OS temp directory (a `reference/` source, the companion DOCX the generator insists on
reading, and an empty `docs/`), runs the generator with that workspace as its `cwd`, and compares what it printed
to the file it actually wrote. Truth is computed a different way than the generator computes it — bytes from a
`Buffer` read, lines from counting newline characters rather than splitting — because a test that re-evaluated the
implementation's own expressions would only restate them. The committed copy is never the input and never the
output; the suite does not regenerate `docs/MASTER_SPECIFICATION.md`.

| Step | Command | Actual output |
|---|---|---|
| green | `node scripts/tests/copy-master-spec-output.test.mjs` | `11 passed, 0 failed`, exit **0** |
| red | the same suite against the pre-fix formulas — only the two expressions reverted, labels left byte-identical, so a failure cannot be blamed on the wording | `4 passed, 7 failed`, exit **1**: `printed 13806 != disk 13980 bytes` and `printed 117 != real 116 lines` |
| restore | `diff` between the pre-red backup and the file put back | **0 lines** |
| after restore | the suite again | `11 passed, 0 failed`, exit **0** |

**The red run's `4 passed` is as informative as its `7 failed`.** Three cases never touch the two expressions — the
byte-identical verdict, the printed body-start line, and the alignment header — so their green through both builds
is correct, not a gap. The fourth is the no-final-newline case, which failed on bytes but *passed* on lines:
without a trailing newline the old `split` count is accidentally right, which is exactly the boundary a blind
`-1` would break, and why the suite has a case for it rather than a comment about it.

**One expectation of mine was wrong, and the correction is in the suite.** The first draft assumed a pure-ASCII
source body would make a code-unit count correct. It does not: the provenance header this tool writes is itself
full of em dashes and curly quotes, so `t.oldBytes < t.bytes` holds for an ASCII body too — the case now asserts
that, and records that the defect was never body-dependent, so no "our source is ASCII" defence of the old label
ever existed. Two further cases failed on the first green attempt for the same class of reason — a header
assertion aimed at `stdout` (the header goes to the file, not the terminal) and a line count read as the body's
rather than the emitted file's. All three were defects in the test, all three were fixed before any claim was made,
and none of them was a defect in the generator.

**Wiring, so the guard cannot rot.** `package.json` gains `test:gate:spec-copy` and the suite is the **seventh**
entry in the `test:gates` chain; `.github/workflows/ci.yml` gains a `docs-gates` step that runs it with
`node scripts/tests/…` directly, never through `pnpm` (the H-12 trap, §1.7). `node scripts/verify-workflow-structure.mjs`
exits **0** over the edited file, and its W9 rule is precisely the claim that the `test:gates` chain and the
pipeline steps have not drifted apart. What this closes is a reporting defect with a guard on the report; it
validates no requirement of the product and changes no Level B result (§4).

The same off-by-one class produced the `337`-line and `43`-line figures corrected in §1.7, and the `3,942`-line figure for the source specification corrected in ADR-018: an editor displays a file of *N* newline-terminated lines as *N+1*.

### 2.3 The generated header is not stable while a parallel workstream edits the tool

Within this window, the same command produced 251,245 → 255,434 → 255,492 reported "bytes", 4,042 → 4,069 → 4,070 lines, and 14 → 15 discrepancy rows, because `docs/MASTER_SPECIFICATION.md` is regenerated from a row list in `scripts/copy-master-spec.mjs` that another process was extending (ADR-018 and S-15 were added at the same time). The **verbatim body and its source SHA-256 never changed**, which is the property the tool exists to protect. Consequence for readers: cite the body by *source* line number (stable, SHA-`5b30b21e…`), never by line number inside the generated copy, and re-run the tool before trusting any size or row count.

---

## 3. Not run — everything that has not been executed, and what it must produce

All statuses below are `Not run`. They are **not** `Pass`, `Fail`, or `Partial`. None can be run until B-01 clears and an install is authorized; none has been simulated, stubbed or asserted by inference. **This opening sentence is the 31 October record and is kept verbatim; it is no longer the state of this table.** B-01, B-02 and B-03 cleared on 1 November 2026 and the install was authorized, so rows **1, 2, 3, 4, 5, 11 and 14** now carry executed statuses with their exit codes — three of them green (`typecheck` 0, `test` 0, `lint` 0), two red by measurement (`format:check` 1 over **25** files, by the Owner's own instruction against a broad reformat; `audit` 1 with **15** vulnerabilities, blocker **B-11**), one green-but-not-measured-here (`build` exit 0 over 16 routes, read from `docs/ROUTE_RUNTIME_EVIDENCE.txt`, which a parallel workstream owns and this batch did not re-run), and one verified by effect rather than transcript (row 1). **Rows 6, 7, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20 and 21 remain `Not run`, and nothing in this batch simulated, stubbed or inferred any of them.**

| # | Activity | Command that will run it | Status | Evidence it must produce | Blocked by |
|---|---|---|---|---|---|
| 1 | Dependency install | `pnpm install` | `Executed` — **superseded as at 2 November 2026; not re-run by this batch, and verified by its measurable effects rather than by a transcript this batch owns.** The 1 November blocker column named B-01, B-02 and B-03, and all three are cleared | exit 0; `pnpm-lock.yaml` committed — **measured: `git ls-files -- pnpm-lock.yaml` exits 0 and the file is 8,408 lines**; `node_modules/.pnpm` holds **701** resolved packages; and the ADR-002 lockstep claim is now checkable rather than assumed, since `payload` and all seven `@payloadcms/*` entries in the lockfile resolve to the **same** version, `3.92.1`. The ARCHITECTURE_DECISIONS §5.1 write-back the evidence column also asks for is that register's own row, not this batch's | **B-01**, B-02, B-03 — all three cleared 1 November 2026 |
| 2 | Strict typecheck | `pnpm typecheck` (`tsc --noEmit`) | `Executed` — **exit 0, re-measured by this batch on 2 November 2026**; **exit 0 again 3 November 2026 over a program of 84 project files, 53 of them under `src/`** | exit 0 under `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `useUnknownInCatchVariables` — **now over 26 `.ts`/`.tsx` files under `src/`, not over none**, which is what makes the exit mean anything (§4 row 2 records the 1 November hollow-green objection and its removal) | 1 — cleared |
| 3 | Lint | `pnpm lint` (`eslint .`) | `Executed` — **exit 0, re-measured by this batch on 2 November 2026; the green is falsifiable, not assumed** (a probe file with a relative default import and a `process.env` read produced exit 1 with three named errors) | exit 0, zero `any`/unsafe-assignment violations (rules already set to `error` in `eslint.config.mjs`) — the 1 November reading of this row was exit **2** with `ERR_MODULE_NOT_FOUND` for `@eslint/js`; that is history, and `@eslint/js` is now declared at the version the lockfile already resolved | 1 — cleared |
| 4 | Format check | `pnpm format:check` (`prettier --check .`) — **the check-only script was added in this batch (I-10); previously only the writing `format` script existed.** Its check-only behaviour is evidenced in §3.1 below. | `Executed` — **exit 1 over 25 files, re-measured by this batch on 2 November 2026. Red by the Owner's instruction, not by an unavailable tool.** **Status moved: `pnpm format:check` exits 0 as re-measured 3 November 2026**, after Owner decision OID-25 authorised the dedicated reformat batch (`2ae97b3`); the row stays `Executed` and now passes, and the red reading above is kept as the record of the window that measured it. The 31 October note *Prettier itself is not installed* and the 1 November note *has never been executed on this machine* are both superseded; see §3.1 | exit 0 and no file modified. The *no file modified* half holds absolutely — `--check` never writes, and `prettier --file-info` reports `reference/**`, `Noujoude.photo/**`, `brand/**` and `docs/**` ignored; the *exit 0* half does not, because the Owner authorized only the justified `.prettierignore` correction and forbade a broad reformat (H-13, C-11) | 1 — cleared |
| 5 | Unit tests (domain, validators, state machines) | `pnpm test` (`vitest run`) | `Executed` — **exit 0 with 4 test files and 34 assertions, re-measured by this batch on 2 November 2026** (`src/domain/rights.test.ts` 9, `routes.test.ts` 14, `entry-routing.test.ts` 4, `locale.test.ts` 7). **Re-measured 3 November 2026: exit 0 over 15 test files and 397 tests**, the growth being the media-serving, rate-limit, security-header and route-handler suites added during the remediation window, each of which was run red-before-green | exit 0 with a non-zero test count — the requirement was met by measurement, since the 1 November run exited **1** with `No test files found` under the configured `passWithNoTests: false`. Each ADR-009 dimension covered: **not yet** — these four files cover rights, routing, entry routing and locale only; the state-machine, media and citation dimensions have no test | 1, and a first real test — both now supplied |
| 6 | Integration tests (DB, hooks, access control, jobs, storage adapters) | `NDM_ALLOW_INTEGRATION=1 pnpm test` against `noujoude_test` only | `Not run` | positive **and negative** authorization cases; refusal of DDL as `ndm_runtime`; no test able to touch the development database (`tests/setup/env.ts` enforces this) | 1, 9 |
| 7 | E2E journeys, both locales | `pnpm test:e2e` (`playwright test`) across the 4 projects `en-desktop`, `ar-desktop-rtl`, `en-mobile`, `ar-mobile-rtl` | `Not run` | exit 0 in CI (retries 2) and locally (retries 0); HTML reporter + traces archived; the six invariants listed in `playwright.config.ts` asserted, including the no-commerce invariant (no price, cart, checkout, seller or stock UI on any route) required by Appendix G.3, line 3702 | 1, Phases 2–4 |
| 8 | Accessibility automation | `pnpm test:a11y` (`playwright test --grep @a11y`, axe-core) | `Not run` | axe violations = 0 at WCAG 2.2 AA on key public **and** Control Center pages; RTL composition checked on mobile too, not desktop-only. **4 November 2026 status of the tooling half:** axe-core 4.10.2 is declared in `package.json` and installed on disk, and it is wired to nothing — a tree-wide scan for the identifier returns only ordinary English words, and `playwright.config.ts` line 12 still points `testDir` at `./tests/e2e`, a directory that does not exist. An installed library that no test imports is a dependency, not an accessibility result, so this row stays `Not run` | 1, Phases 3–4, 6 |
| 9 | Database provisioning | `pnpm db:up` (`docker compose up -d postgres`) | `Not run` | container healthy via `pg_isready` healthcheck; `postgres:18.6-alpine` **pulled** — the tag was **already in the local cache on 1 November 2026** (`docker images` rc=0, 433 MB), so the 31 October "cache UNKNOWN because `docker images` cannot run" reading is superseded; the pull step still has never been exercised by *this* project. Port listening on `127.0.0.1:5432` only, verified by an external connection attempt being refused; `scripts/db/init-roles.sh` output present in the entrypoint log | **B-03** only — measured, not inferred: `docker compose config` with the seven variables **unset** (1 November 2026, **rc=1**) aborts with `required variable … is missing a value: set in .env` for `NDM_BACKUP_PASSWORD`, `NDM_MIGRATION_PASSWORD`, `NDM_REPORTING_PASSWORD`, `NDM_RUNTIME_PASSWORD`, `POSTGRES_DB`, `POSTGRES_SUPERUSER_PASSWORD` and `POSTGRES_SUPERUSER`, so the stack cannot start without `.env` and nothing was created by the probe. The same command with those seven supplied as **process-environment placeholders** (never written to a file) exits **rc=0** and renders `host_ip: 127.0.0.1`, `image: postgres:18.6-alpine` — the positive half is what turns the definition from "read by a human" into "validated by the engine". **B-09 no longer binds this row:** the engine answers (`docker info` rc=0, 1 November 2026). B-01 blocks it only if pnpm's engine check is enforced; no `.npmrc` exists to enable one. **H-10 closed here the same day:** the render exposed that the declared container name was already occupied by a stopped container on this host, which would have made `pnpm db:up` fail *after* the Owner created `.env`; the file now declares `ndm-postgres`, and the invariant is guarded by `scripts/verify-compose-config.mjs` (preflight check 8) with its own regression suite. |
| 10 | Migrations | `pnpm migrate:create`, then `pnpm migrate` | `Not run` | committed migration files per Standard §3.4; fresh-database creation succeeds; **upgrade from the immediately preceding schema** succeeds; no schema-push path reachable from the CMS. **This is also the only empirical closure available for assumption A-C1** (PostgreSQL 18.6 ↔ the pinned adapter, ARCHITECTURE_DECISIONS §3.2) | 9, B-01 |
| 11 | Production build | `pnpm build` (`next build`) | `Executed` — **exit 0 with 16 routes, per the dated transcript `docs/ROUTE_RUNTIME_EVIDENCE.txt` (2 November 2026), which also records `pnpm start` answering probes. Not re-run by this batch: a parallel workstream owns `build` and `start` and their ports, so this row cites that transcript rather than claiming a measurement this batch performed. The 1 November reading of this row was exit 1, `Couldn't find any 'pages' or 'app' directory`** | exit 0 with route manifest — **supplied**; build output still not treated as feature proof (Directive §15): the 16 routes carry no Payload config, no collection, no database access and no content record | 1–3 — all cleared |
| 12 | Restore test | backup + PITR restore procedure against the chosen provider once selected | `Not run` | a **measured** RPO/RTO in hours with dataset name, integrity checks, failures, corrective actions, reviewer (Master Spec G.11.3 line 3907). "A backup job reporting success is not proof of recoverability; only a tested restore is acceptable evidence" (line 3908) | 9, 10, **OID-19/OID-20** |
| 13 | Performance measurement | route-level CWV harness over Home, The Museum, Country World, Collection, Artifact Detail, Story, Search and Control Center critical routes (Standard §9) | `Not run` | p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 — as *measurements*, with the device/network conditions recorded. Currently these are targets only (GAP-12: "measurements pending") | 11 |
| 14 | Dependency scanning | `pnpm audit --audit-level=high` — **now authored as CI job `security-scans` in `.github/workflows/ci.yml`, and scheduled as Phase 2 work item 2.10 in `docs/IMPLEMENTATION_PLAN.md` §4 (coverage hole H-4).** **2 November 2026: the command has executed — twice, by this batch, with the identical result.** In the CI job it named, it still has never executed, and that is a different fact from the command having run. `audit:assets` and `audit:docx-alignment` inspect files and documents, not dependencies, and are not a substitute. | `Executed locally, and FAILED` — **exit 1, 15 vulnerabilities: 4 low, 5 moderate, 3 high, 3 critical** (transcript `docs/DEPENDENCY_AUDIT_2026-11-02.txt`; counts only, remediation advice deliberately not transcribed here) | zero unresolved high/critical, **or** a recorded Owner risk acceptance per severity — **recorded as blocker B-11: neither condition is met yet, no risk acceptance exists** | 1 — cleared; B-04 still binds the CI half, because B-08 leaves no remote and no runner |
| 15 | Secret scanning | **still nothing, anywhere.** `.github/workflows/ci.yml` deliberately does **not** contain a secret-scanning step, and says so in its own header ("WHAT IS DELIBERATELY NOT HERE"). Standard §12 check 8 therefore stays **UNMET** and is only *partially* advanced by row 14. Landing point: Phase 2 work item 2.10. | `Not run` | zero findings; a pre-commit/CI hook that cannot be silently disabled | B-04, tooling to be selected and authored |
| 16 | ASVS review | manual verification against OWASP ASVS 5.0.0 **Level 2**, mapped to real routes and controls | `Not run` | control-by-control record with implementation location and test evidence; citing ASVS does not establish compliance (Master Spec §20 reference text) | Phases 2–7 |
| 17 | WCAG audit (manual) | keyboard-only traversal and screen-reader pass (NVDA/VoiceOver) over key visitor and admin flows | `Not run` | a written record per flow, supplementing — not replaced by — axe automation (Standard §8, §2.2) | Phases 3–6 |
| 18 | SEO checks | automated tests over canonical, reciprocal `hreflang`, sitemap, robots, redirects, localized OG, and `noindex` boundaries for drafts/private/restricted/preview (Master Spec G.9) | `Not run` | per-locale pass with the negative case proven: no `hreflang` emitted toward a missing or unpublished translation | Phases 4–6 |
| 19 | AI red-team / disclosure tests | governed retrieval test suite (prompt injection, restricted-source disclosure, citation mismatch, hallucination, uncertainty) | `Not run` | all nine evaluation classes (S-13) executed; `Unauthorized Disclosure` treated as **release-blocking** (line 2095) | Phase 7, **OID-19** |
| 20 | Telemetry verification | OTLP export with the nine minimum service indicators (Standard §10) | `Not run` | live trace/metric/log samples proving no inquiry content, credential or token appears in telemetry | 1, OID-19 |
| 21 | Owner-input-dependent checks | — | `Not run` | any test asserting real artifact facts, rights, contact details or institutional identity | **OID-01…OID-21** |

**Nothing in §3 has been run.** An empty result table for §3 is the correct state at the end of Phase 1; it is not a temporary embarrassment to be papered over. **2 November 2026: that sentence is superseded as a statement of fact and kept as the standard this section is written against.** Seven rows (1, 2, 3, 4, 5, 11, 14) have now run; fourteen still have not. What the sentence was protecting against has not gone away — the runs that happened produced **two reds the tooling did not hide** (row 4 exit 1 by instruction, row 14 exit 1 with 15 vulnerabilities) and three greens whose hollowness had to be argued away before they meant anything (row 2 exited 0 over zero `src/` files on 1 November and now exits 0 over 26 of them). An unrun row is still recorded as unrun, and no row in §3 was upgraded because a package manager happened to be installed.

### 3.1 I-10 — the check-only formatting command: what was added, and exactly what is and is not demonstrated

Two files changed for this item.

1. `package.json` line 21 gains `"format:check": "prettier --check .",` alongside the pre-existing line 20
   `"format": "prettier --write ."`. The writing script was left in place — it is the developer's fixing command
   — and a **separate** non-writing command was added for gates.
2. A new `.prettierignore` was created. This was not a style preference; it closes a live hazard discovered
   while authoring the check command. `prettier --write .` parses Markdown and JSON, and this repository's
   read-only source documents are Markdown under `reference/` with an 82-asset library under `Noujoude.photo/`.
   With no ignore file, one well-intentioned `pnpm format` would rewrite files that Directive §3 places off
   limits (Directive line 53, verbatim: *"Never modify, rename, overwrite, or delete original source files."*), trip the
   `REFERENCE_INTEGRITY.json` DRIFT check in `scripts/preflight.mjs`, and invalidate every `line N` citation in
   `docs/`. `.prettierignore` line 18 is `reference/`, line 21 is `Noujoude.photo/`, plus the generated evidence
   artefacts and tool-output paths. Registered as risk **R-14** in `docs/IMPLEMENTATION_PLAN.md` §7.

**Check-only behaviour — established on three legs, none of which is an execution.**

| Leg | Evidence | Result |
|---|---|---|
| Structural, in this repository | `grep -n '"format' package.json` → line 20 `prettier --write .`, line 21 `prettier --check .`. `grep -c 'format:check.*--write' package.json` → **0**. `grep -n 'pnpm format' .github/workflows/ci.yml` → line 159 `run: pnpm format:check`, and **no** occurrence of the writing script anywhere in the workflow. | The gate command contains no write flag, and CI never invokes the writing one |
| Upstream documentation (authoritative) | `https://raw.githubusercontent.com/prettier/prettier/main/website/versioned_docs/version-stable/cli.md`, **HTTP 200**, 9641 bytes: *"When you want to check if your files are formatted, you can run Prettier with the `--check` flag (or `-c`). This will output a human-friendly message and a list of unformatted files, if any."* Exit-code table: `0` = "Everything formatted properly", `1` = "Something wasn't formatted properly", `2` = "Something's wrong with Prettier". | `--check` is documented as reporting, not writing, and its exit codes are defined for pipeline use |
| The tool's own failure message | Same document, the `--check` failure transcript ends with: *"[warn] Code style issues found in 2 files. Run Prettier with --write to fix."* | Decisive on its own: `--check` instructs the user to run a **different** command to fix the problem, which it would not need to do if it wrote files itself |

The same document also endorses the ignore file directly: *"It's recommended to always make sure that
`prettier --write .` only formats what you want in your project. Use a `.prettierignore` file to ignore things
that should not be formatted."* So `.prettierignore` is the upstream-prescribed control for exactly the hazard
found here, not an invention of this project.

**What is NOT demonstrated, stated plainly.** `pnpm format:check` has **never been executed** on this machine.
Prettier is a devDependency, `node_modules/` does not exist, and installing dependencies is outside this batch's
authorization (B-02). Therefore: the command's exit code on this repository is **unknown**, and whether the
current files are Prettier-clean is **unknown**. The check-only *behaviour* is established by documentation and
by construction; the check-only *result* is pending the first install. Nobody should read this section as
"formatting passes".

**2 November 2026: the result is no longer unknown, and the paragraph above is kept verbatim as the record of what was and was not demonstrated at the time it was written.** `pnpm format:check` has now been executed on this machine, repeatedly, and it exits **1** over **25** files — the first measured answer to the question this section called unanswerable, replacing the 31 October reading (B-02 standing, `node_modules/` absent) and the 1 November reading (**79**, then **103**, files in scope). The three-legged *behaviour* argument above still stands and is now backed by observation: `[warn]` lines name the unformatted files, the exit is 1, and the command modified **nothing** — verified by the fact that the same files still fail after the run. The ignore file is likewise no longer merely *read*: `prettier --file-info` reports `ignored: true` for a file under `docs/` and `ignored: false` for `eslint.config.mjs`, and **0 of the 25** warned files sit under `docs/`, which is the measurement showing the OD-12 exclusion actually bites. **The exit is still 1, and that is a decision rather than a defect:** the Owner authorized only the justified `.prettierignore` correction and forbade the broad reformat that would turn verified `docs/` quotations into `LINE_OFF` defects (H-13, C-11). Read this section as *the guard exists, runs, is check-only, is scoped, and is currently red by design*.

---

## 4. Release gate definition — Standard §12 required checks

The twelve checks are quoted from `Noujoude_Technology_and_Security_Standard_EN.md` §12 (lines 266–279). Every one is **unmet**, and the reason for that changed on 1 November 2026. Before OD-2, five of the twelve were unmet because the tool to run them did not exist on this machine; the tooling gap is now closed, and the twelve have been re-measured rather than re-asserted. **Rows 1, 2, 3 and 9 were actually executed in this batch and their real exit codes are recorded below** — and every one of them fails or proves less than its exit code suggests, for reasons that are now about *missing application code and missing dependencies*, not about a missing runtime. The situation changed in one further respect during this batch and is recorded precisely so it is not over-read: a CI pipeline definition **now exists** at `.github/workflows/ci.yml`, which closes coverage hole H-2's *authoring* half — and on 1 November 2026 it stopped being a file nobody had checked by machine, because `scripts/verify-workflow-structure.mjs` now enforces ten structural rules over it and exits **0** (coverage hole H-11). It has nevertheless **never executed**, its file header says `STATUS: AUTHORED. NEVER EXECUTED.`, no YAML *conformance* parser exists on this host — the structural gate is a contract over the block subset, not GitHub's parser — and while a repository now exists (B-04 is cleared, `git init` executed, first commit recorded), there is still **zero CI runs** and no remote for a run to happen on. An authored pipeline enforces nothing. H-2 therefore moves from `no definition exists` to `definition authored, structurally checked, zero runs`, and the twelve checks stay unmet.

**Everything in the paragraph above is the 1 November record, and it is kept verbatim because that is what the four rows below were measured against. It is no longer the current state, and the difference is a measurement, not a reinterpretation.** Re-run on 2 November 2026 by the Owner's Phase 0/1 closure batch: `pnpm typecheck` exits **0** over a program that now contains **26** `.ts`/`.tsx` files under `src/` (row 2), `pnpm test` exits **0** with **4 files and 34 assertions** under `src/domain/` (row 3), `pnpm lint` exits **0** and `pnpm format:check` exits **1** over **25** hand-written tooling and configuration files with **none** under `docs/` (row 1 — half green, and the format half is red by the Owner's own instruction, not by a missing control), and `pnpm build` exits **0** over 16 routes with `pnpm start` answering HTTP probes (`docs/ROUTE_RUNTIME_EVIDENCE.txt`) (row 9). Row 8's dependency half also executed for the first time and is **red**: `pnpm audit --audit-level=high` exits **1** with **15** vulnerabilities (4 low, 5 moderate, 3 high, 3 critical; transcript `docs/DEPENDENCY_AUDIT_2026-11-02.txt`), recorded as blocker **B-11**. **How this project counts that, stated so no reader inflates it:** Standard §12 is tracked as **Level B** in `docs/IMPLEMENTATION_PLAN.md` §4B, Level B counts a row when its acceptance condition is met **on the evidence recorded**, and on that rule Level B is **3 of 12** — rows 2, 3 and 9 — up from 0 of 12. Those three are green **locally, on this host, with recorded exits and recorded red baselines proving each command can fail**. **CI has still never run** (zero runs, no remote, blocker B-08), and §4A gives Gate 5 the evidence line *the twelve Standard §12 checks green in CI* — so the in-CI requirement is unmet on every one of the twelve rows, rows 2, 3 and 9 are green outside CI only, and **Gate 5 stays closed**. Three rows green on a shell is not twelve in a pipeline and is not 25 % verified.

| # | Required check | Command that will satisfy it | State today | Why unmet |
|---|---|---|---|---|
| 1 | Formatting and lint | `pnpm format:check` + `pnpm lint`, both now steps in CI job `quality` | ✅ **Met locally, on this host, as re-measured 3 November 2026. ⚠️ Half green as at 2 November 2026: the lint half is met, the format half is red by the Owner's own instruction, and neither is green in CI. Superseded 3 November 2026: both halves now exit 0 on this host and the row is Met locally — still not in CI.** | **1 November record, kept as history:** `pnpm format:check` exited **1** with `Code style issues found in 79 files` — the same command printed **37** earlier the same day and **60** mid-window, and 41 of the 79 sat in an untracked `brand/` tree this batch neither wrote nor committed; `pnpm lint` exited **2** with `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@eslint/js' imported from E:\no\eslint.config.mjs`, which made the lint gate unavailable rather than merely failing, and neither half was repaired because a dependency addition was outside that batch's authorization. **2 November re-measurement, the current reading: `pnpm lint` exits 0** with type-aware rules over `src/**`, and the green is *proved falsifiable* — a probe file holding a relative default import and a `process.env` read produced exit **1** with three named errors, both `no-restricted-syntax` guards firing — and `@eslint/js` is now declared at the version the lockfile already resolved. **`pnpm format:check` still exits 1, over 25 files, none of them under `docs/` (0 of 25)**, down from the 103 files in scope before the two `.prettierignore` additions the Owner authorized (`brand/` at line 29, `docs/` at line 40), which closed hole H-13 as to cause. **The residual is deliberate, not unfinished:** the Owner directed that only the justified ignore correction be applied and that no broad reformatting be performed, and `docs/` citations are addressed to script lines by number, so a whole-tree `--write` would turn verified quotations into `LINE_OFF` defects. A row that needs both halves cannot go green on one, so on the 2 November reading this row contributed 0 of 12 to Level B. **That premise changed on 3 November 2026: `pnpm format:check` exits 0 on a fresh run, and `pnpm lint` exits 0 on the same tree — the change being reformat batch `2ae97b3`, the third branch OID-25 named, authorised by the Owner and followed by its own citation-repair pass. The row therefore contributes 1 of 12, Level B is 4 of 12 on the local exits, and the arithmetic in `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` §9.1 is deliberately not re-scored by this prose (CAP-9). Nothing in this row has run in CI** |
| 2 | Strict TypeScript typecheck | `pnpm typecheck` | ✅ **Met as at 2 November 2026 on the recorded local evidence (Level B); NOT met in CI, because CI has never run** | **1 November record, kept as history:** `tsc --noEmit` exited `0`, and that exit 0 was *hollow*: `tsconfig.json` sets `allowJs: true` without `checkJs`, and its include covered `scripts/**/*.mjs` (**19 files**, parsed but not type-checked) and `src/**/*.ts(x)` (**0 files** — there was no application code). The exit proved the compiler runs on Node 24.22.1 and that the scripts parse; it proved nothing about types, which is the defect class catalogued as H-1/H-11 (a check that cannot fail for the reason it exists). **2 November re-measurement, the current reading: `pnpm typecheck` exits 0 over a program that now holds 26 `.ts`/`.tsx` files under `src/`**, so the green is attributable to real types instead of an empty include, and the hollow-ground condition is gone. **Documented residual, not upgraded to more than it is:** the `allowJs`-without-`checkJs` asymmetry still leaves the 19 `.mjs` scripts parsed-but-unchecked, so this row is met for `src/` types and silent for script types. Level B (`docs/IMPLEMENTATION_PLAN.md` §4B) counts this row met on the evidence recorded; **CI has never executed it** (zero runs, blocker B-08), so Standard §12 as a CI requirement remains unmet here and Gate 5 stays closed |
| 3 | Unit tests for domain and validation logic | `pnpm test` | ✅ **Met as at 2 November 2026 on the recorded local evidence (Level B); NOT met in CI, because CI has never run** | **1 November record, kept as history:** vitest 3.2.7 started, resolved `E:/no`, and exited **1** with `No test files found`, listing `include: src/**/*.test.ts, src/**/*.test.tsx, src/**/*.integration.ts` and the exclusions (`node_modules`, `.next`, `reference/**`, `Noujoude.photo/**`, `tests/e2e/**`) — the configured `passWithNoTests: false` behaviour doing its job, the absence loud rather than silent. **2 November re-measurement, the current reading: `pnpm test` exits 0 with 4 test files and 34 assertions**, all four under `src/domain/` (`rights.test.ts` 9, `routes.test.ts` 14, `entry-routing.test.ts` 4, `locale.test.ts` 7), and the same command was recorded at exit 1 on 31 October and 1 November, so the green sits on top of a documented red baseline instead of beside an untested claim. **What the row is still not:** 34 assertions over 4 domain files is the beginning of the suite, not its coverage promise — the integration half (row 4), the end-to-end half (row 5) and the accessibility half (row 6) are separate rows and remain Unmet, `tests/` still holds 1 file, and no CMS, database or storage path is exercised by these four files. Level B counts this row met on the evidence recorded; **CI has never executed it** (zero runs, blocker B-08), so Standard §12 as a CI requirement remains unmet here and Gate 5 stays closed |
| 4 | Integration tests for database, CMS hooks, access control, jobs, storage adapters | `NDM_ALLOW_INTEGRATION=1 pnpm test` | ❌ **Unmet — and its stated cause has changed since it was written** | **Basis when written:** no database, no code under test. **2 November position:** `pnpm test` now exits 0 over 4 files / 34 assertions, but the configured integration pattern `src/**/*.integration.ts` matches **0 files**, so this row has no test to run; no `.integration.ts` file exists, no Payload configuration exists to hook (`payload` 3.92.1 is declared in `package.json` and referenced by **no** file under `src/`, and there is no `payload.config.ts` and no `migrations` directory), and this batch created no project database instance. The row cannot be satisfied from a shell; it needs Phase 2 CMS code. Not executed by this batch |
| 5 | Playwright E2E for key public/admin routes in **both locales** | `pnpm test:e2e` | ❌ **Unmet — the tooling is now present; the tests are not** | **Cause as written:** no routes, no browsers launched. **2 November position:** both halves of that cause are gone and the row is still Unmet. `playwright.config.ts` exists and points `testDir` at `./tests/e2e`, `@playwright/test` is declared, and Chromium plus its headless shell are installed in the local Playwright browser cache; `pnpm build` exits 0 over 16 routes and `pnpm start` answers probes in both locales (`/en` and `/ar`, the latter serving `<html lang="ar" dir="rtl">`, per `docs/ROUTE_RUNTIME_EVIDENCE.txt`). But `tests/` contains exactly **1** file (`tests/setup/env.ts`), `tests/e2e/` holds **0** spec files, and the `./tests/e2e` directory the config names does not exist — so the command would fail on *no tests*, not on *behaviour*. **Counters re-taken 4 November 2026: `tests/` now holds 2 files (`tests/setup/env.ts` and `tests/helpers/fake-clock.ts`), the Vitest side has grown to 16 `*.test.ts(x)` files under `src/` (`pnpm test` exit 0 over 16 files and 448 tests at the last recorded run), `pnpm build` exits 0 over 17 route entries rather than 16, and `tests/e2e/` still does not exist** — the directory `playwright.config.ts` line 12 names, so `pnpm test:e2e` today answers *no tests found*, which Directive §17 and the standing rule both refuse to record as a pass. This batch did not execute `pnpm test:e2e` or `pnpm start`: the build- and server-owning parallel workstream holds those ports, and a browser run that cannot assert anything is the hollow-green check the Owner forbade |
| 6 | Accessibility automated checks **plus manual audit records** | `pnpm test:a11y` + written manual record | ❌ **Unmet — both halves still absent; the route half of the cause is now superseded** | **Basis when written:** neither half exists (GAP-11 *implementation audit pending*). **2 November position:** the automated half is `playwright test --grep @a11y`, which now has a config, installed browsers and served locale routes to point at, but **0** spec files carrying the `@a11y` tag — the `src/ui/styles/global.css` token layer exists (50 `--ndm-*` custom properties) while no webfont is loaded, which is a §12.2-relevant fact and not an accessibility pass. The written manual record required by the row still has **0** entries, and an RTL/Arabic typography audit — the highest-risk surface in this product — has never been performed by a human on a rendered page. Not executed by this batch, for the same reason as row 5 |
| 7 | Security checks mapped to ASVS controls and negative authorization tests | ASVS L2 mapping + negative authz suite | ❌ **Unmet — partially executable now, and the executable part is red for a different row** | **Basis when written:** no controls implemented to test (GAP-13 also *instrumentation pending*). **2 November position:** there is application code, so the cause is no longer absolute — `pnpm lint` exits 0 with both `no-restricted-syntax` guards active and a falsifiable probe (a file with a relative default import and a `process.env` read produced exit 1 and three named errors), and the dependency half of the security posture has been measured: `pnpm audit --audit-level=high` exits **1** with **15** vulnerabilities including **3 critical**, recorded below and as blocker **B-11**. What the row still asks for does not exist: no ASVS L2 control mapping, no negative authorization suite against the application (there is no application access control to deny — no Payload config, no collections, no auth surface), and no instrumentation. The negative authorization *database* cases authored in `run-privilege-tests.sh` were blocked by B-09 (§1.5) when this row was written and have **since executed** — 14 of 14 matched expectation for an authorization reason (1 November 2026, §1.5, `docs/A5_PRIVILEGE_EVIDENCE.txt`). That proves the grant design, not the application's own controls, so the row stays Unmet |
| 8 | Dependency and secret scanning | dependency half: `pnpm audit --audit-level=high`, authored as CI job `security-scans`. Secret half: **nothing exists** | ❌ **Unmet — and as at 2 November 2026 it is Unmet by measurement, not by absence** | **Basis when written:** neither half had run automatically. **2 November position, executed twice (transcript `docs/DEPENDENCY_AUDIT_2026-11-02.txt`, then re-run by this closure batch with the identical result):** `pnpm audit --audit-level=high` exits **1** with **15 vulnerabilities — 4 low, 5 moderate, 3 high, 3 critical**. Recorded as counts only; the per-advisory text lives in the dated transcript, and package-by-package remediation advice is deliberately not written into this row. This is the first time the dependency half has run at all, so the row moved from *never measured* to *measured and red*, and blocker **B-11** now names what stands between it and green. **The secret half is unchanged and still automated by nobody:** no scanner exists, `ci.yml` omits it and declares the omission in its own header, so this row cannot be quietly upgraded when B-11 clears. The one-time manual substitute remains what it was — the staged index audited before the OD-4 checkpoint, `.env` confirmed ignored (`git ls-files -- .env` returns nothing; `git status --ignored` reports `!! .env`), `.npmrc` read before commit and confirmed to carry no credential — a human check on 150 files, not a scanner, and it will not catch the next leak. Landing point for both halves: Phase 2 work item **2.10** in `docs/IMPLEMENTATION_PLAN.md` §4 |
| 9 | Production build | `pnpm build` | ✅ **Met as at 2 November 2026 on the recorded evidence (Level B); NOT met in CI, because CI has never run** | **1 November record, kept as history:** Next.js 16.4.3 (Turbopack) started, printed `- Environments: .env` — the first time OD-3's file was consumed by the toolchain, printed as a name and never as a value — ran `next.config` successfully in 177 ms, then failed with `Error: > Couldn't find any 'pages' or 'app' directory. Please create one under the project root`, exit **1**. That proved the build toolchain and disproved the application. **2 November, the current recorded reading: `pnpm build` exits 0 and emits 16 routes, and `pnpm start` answers HTTP probes** — transcript `docs/ROUTE_RUNTIME_EVIDENCE.txt`, dated 2 November 2026: `/` → 307 → `/en`, `/ar` → 200 carrying `<html lang="ar" dir="rtl">`, an unknown slug → 404, `noindex, nofollow` present, `x-powered-by` absent. **Attribution stated exactly:** this closure batch did **not** execute `pnpm build` or `pnpm start` itself — a parallel workstream owns those two commands and their port bindings, so the exit 0 is read from that dated transcript rather than re-measured here, and the same transcript self-corrects an earlier loopback-only overclaim (the measured socket is `0.0.0.0:3122`, reachable on the machine's LAN-facing address). A built, served shell is not a product: no Payload config, no collection, no database-backed page and no content record is behind those 16 routes. Level B counts this row met on the evidence recorded; **CI has never built it** (zero runs, blocker B-08), so Standard §12 as a CI requirement remains unmet here and Gate 5 stays closed |
| 10 | Database migration verification **and** restore test | `pnpm migrate` + restore procedure | ❌ **Unmet — every upstream blocker is now cleared, and the row still cannot pass** | The 31 October basis — image never pulled, cache unenumerable while B-09 stood — is superseded: `docker images` exits 0 and lists `postgres:18.6-alpine`, and B-01, B-02, B-03, B-04, B-09 and B-10 are all cleared as of 1 November 2026. What binds the row now is *content*: no migration file exists yet (`payload migrate:create` is Phase 2 work, and `src/` holds no Payload config to generate one from), and no project database instance has been created — `docker ps -a` lists three stopped containers belonging to a different project (`noujoude-postgres`, `-2`, `-3`) and **no** `ndm-postgres`, and this batch deliberately did not start one, because the authorization it worked under covered verifying the Compose render, not creating a persistent database. Separately: no restore has ever been attempted, so the specification's rule that a successful backup job is not proof of recoverability still cannot be satisfied. **OID-20's acceptance on 1 November makes the restore cadence a committed internal target; it supplies no measurement.** |
| 11 | SEO route and metadata checks | automated SEO suite | ❌ **Unmet — the routes now exist; the suite does not** | **Basis when written:** no routes (GAP-15 *implementation tests pending*). **2 November position:** 16 routes build and answer probes, with a locale redirect, an RTL `lang="ar"` document and a 404 for an unknown slug measured in `docs/ROUTE_RUNTIME_EVIDENCE.txt`, and `noindex, nofollow` confirmed on the non-public responses — so the cause has moved from *nothing to probe* to *no automated probe exists*. There is still no SEO suite file, no metadata assertions encoded as tests, and no CI to run one in. GAP-15 stays open |
| 12 | Performance measurements and regression checks | CWV harness at p75 | ❌ **Unmet — measurable now, unmeasured still** | **Basis when written:** nothing to measure; targets remain targets (GAP-12). **2 November position:** there are now 16 served routes and a production-built bundle, so *nothing to measure* is no longer accurate — what is missing is the measuring. No Core Web Vitals harness exists, no p75 field data exists, no first-run local number has been recorded against the §5 budgets, and no regression threshold is encoded anywhere. The targets in §5 remain targets, unchanged and unverified |

Standard §12 line 281 additionally forbids using mock functionality as release evidence, and §15 line 336 forbids silently downgrading accessibility, performance or security expectations. Accordingly: no check below is recorded as passing on the strength of a configuration file, a stub, or a planned behaviour. **That rule became harder to honour on 1 November, not easier:** four of the twelve rows can now actually be executed, and two of the executions return a status a dashboard would render as green while proving nothing about application behaviour — `pnpm typecheck` exits 0 over zero `src/` files (row 2), and the test runner would exit 0 on a suite that exists but asserts nothing. A check that cannot fail for the reason it exists is not a check, so rows 2 and 3 are recorded as Unmet *with their exit codes shown*, which is the only honest way to hold line 281 once the tools are installed. **2 November update to the arithmetic of that same rule, with the 1 November sentences above left verbatim:** the four executable rows became three executable-and-met rows and one still-half-red row. `pnpm typecheck` now exits 0 over **26** `.ts`/`.tsx` files under `src/` rather than over zero of them, and `pnpm test` exits 0 over **4 files / 34 assertions** rather than printing *no test files found* — so the hollow-green objection that kept rows 2 and 3 Unmet no longer describes either command, and the falsifiability evidence behind each (the red baselines in §1.9 and §1.8.1, the operator-flip probe recorded in `docs/IMPLEMENTATION_PLAN.md` §14) is what licenses the change of state. The rule itself is unchanged and still does the work: row 1 stays half-red because the Owner directed that no broad reformatting be run; row 8 is red by measurement, not absence; and rows 4, 5, 6, 7, 10, 11 and 12 stay Unmet because the tools being installed is not the same fact as tests existing and asserting. Three rows are marked met **on locally recorded evidence only** — see the paragraph above and §4A — and CI has still never run any of them.

---

## 4A. Product release gates — Master Spec §20.6 (lines 3133–3159)

§4 above is the *engineering* gate: the twelve checks the Standard requires. The specification imposes a second, product-level gate structure — Gate 0 through Gate 5 at lines 3135–3157 — and closes it with a rule that this report exists to enforce, line 3159:

> *"A gate may be marked Passed only with recorded evidence and an identified approver."* — `reference/Noujoude_Master_Specification_EN.md` line 3159

Two obligations follow, and both are reporting obligations rather than coding ones. First, a gate needs **recorded** evidence, which in this document means a transcript or a measurement that a reader can re-produce (§9 lists the commands). Second, it needs an **identified approver** — a named human, not a role filled by the architect. Until 1 November 2026 no gate condition was met at all, so the table below recorded what artifact *would* be the evidence and *who* would sign, so that a later entry could be checked against it rather than asserted. **One row has now been checked against it and filled in:** Gate 0 has both its artifact and its named approver, and is marked Passed on that basis. The other five are unchanged, and the reason this report bothers to say so is that a table in which everything is Open is easy to upgrade by accident — the rows that stay Open must stay Open because their evidence does not exist, not because nobody looked.

| Gate | Condition, verbatim from the cited line | Evidence artifact that would be recorded here | Identified approver (named, not inferred) | State |
|---|---|---|---|---|
| **Gate 0 — Product Baseline** (3137) | *"Master Specification adopted; requirement IDs assigned; scope and change-control authority established."* | Adoption record for `reference/Noujoude_Master_Specification_EN.md` (SHA-256 `5b30b21e…`, re-verified by every preflight run since 30 October); `docs/REQUIREMENTS_TRACEABILITY.md` ID column — **219 rows, 219 distinct IDs, measured on 1 November 2026; 221 / 221 since `REQ-BRAND-007` and `REQ-BRAND-008` were added on 2 November** | **Project Owner** — the Owner signed this decision by name on 1 November 2026 (authorization §1, Gate 0 clause), which is what line 3159 requires and what Appendix E could not supply on its own | ✅ **Passed — 1 November 2026.** All three conditions are met and each has a recorded artifact: *adopted* (the Owner formally adopts the current Master Specification as the governing baseline and its text is fingerprinted in `docs/REFERENCE_INTEGRITY.json`); *IDs assigned* (219, one per requirement row); *change-control authority established* (the Owner is the designated authority, recorded in `docs/OWNER_INPUT_REGISTER.md` and `docs/CHANGELOG.md`). **What this Passing does not include, stated so nobody infers it later:** it does not waive the Owner's own instruction that the specification's requirements must not be altered to make a gate pass; it does not make any other gate closer — Gates 1–5 below are unchanged and remain Open; and it changes nothing about the twelve engineering checks in §4, four of which were executed today and all of which still fail or prove less than their exit codes suggest. Passing Gate 0 says the baseline is fixed and someone owns it. It does not say the baseline is satisfied |
| **Gate 1 — Institutional and Collection Readiness** (3141) | *"Official identity fields approved; actual Morocco inventory loaded; claims/evidence, image permissions, and required content reviewed; no invented collection information."* | `OWNER_INPUT_REGISTER.md` rows OID-01 … OID-07 marked `Provided` with the document each fact came from; artifact inventory with evidence links; rights per asset | **Owner** for identity and inventory; a **qualified rights reviewer** for image permissions (Master Spec line 2724) | **Open — blocked by Owner input.** Engineering cannot supply any of it; the only half this project can enforce is the "no invented" prohibition, which is untested because no content path exists. |
| **Gate 2 — Experience and Design Readiness** (3145) | *"Public routes and page behavior complete; approved visual system applied; English and Arabic layouts reviewed; responsive and accessibility tests passed."* | Playwright + axe transcripts in §3, per locale and per viewport class; the Owner's visual-system approval (OID-18) | Owner (design approval) plus the named accessibility verifier | **Open — 0 tests exist, though 0 routes no longer does.** The 1 November reading of this cell was *0 routes exist*; that is superseded by measurement: `pnpm build` exits 0 over **16** routes and `pnpm start` answers probes in both locales — `/en`, and `/ar` serving `<html lang="ar" dir="rtl">` (transcript `docs/ROUTE_RUNTIME_EVIDENCE.txt`, 2 November 2026). The gate's own conditions are still unmet: `tests/e2e/` holds **0** spec files, so no page-behaviour, responsive or accessibility test has been executed on any of those routes; the Arabic layouts have never been reviewed by a human; and the approved visual-system artifact (OID-18) is not supplied. A route that answers HTTP is not a reviewed experience |
| **Gate 3 — Administration and Data Readiness** (3149) | *"Canonical Control Center modules and essential screens available; permissions enforced; data relationships and validation tested; publication and revision workflows complete."* | Per-module positive **and** negative permission test transcripts for all twenty modules; migration and constraint evidence | Owner / designated administrator | **Open — no module exists.** Module 14 (roles) and Module 19 (audit) are prerequisites and are unbuilt. |
| **Gate 4 — AI and Governance Readiness** (3153) | *"AI source scope, citation, uncertainty, privacy, and safety tests passed; legal/privacy policies approved; no restricted retrieval path remains."* | Red-team and evaluation transcripts covering the nine classes at lines 2085–2093, with `Unauthorized Disclosure` release-blocking; LO-03/LO-05 approvals | Legal / privacy reviewer, then Owner | **Open — no AI component exists** and no provider is selected (B-05/OID-19). `docs/AI_CURATOR_GOVERNANCE.md` is a contract with zero implementation. |
| **Gate 5 — Production Readiness** (3157) | *"Security verification, performance, monitoring, backups, restore testing, SEO checks, and release regression are complete."* | ASVS L2 review record, CWV measured at p75, an **executed** restore test with measured RPO/RTO, §4's twelve checks green in CI | Owner (deployment authorization, OID-22) — **now `Approved in principle, conditional`, 1 November 2026**; the condition is this row's evidence, so the approval changes the gate's prerequisites, not its state | ❌ **Open — and the 1 November authorization proves it is still open.** A restore has never been attempted, so the line-3908 rule — a successful backup job is not proof of recoverability — is unsatisfiable today by definition. OID-22 now answers *may this project ever deploy, given its gates*, and explicitly does not answer *where, with what credentials, or against which passed check*. No target exists, no credential exists, and **0 of 12** of §4's engineering checks are green **in CI**, which is the evidence line this gate asks for. **2 November correction to the second half of that sentence, kept separate so neither number erases the other:** Level B — this project's recorded-evidence view of Standard §12 — has moved from 0 of 12 to **3 of 12**, because rows 2, 3 and 9 now exit 0 locally with recorded red baselines, and rows 1 and 8 have been measured red on purpose (row 1's format half by the Owner's own instruction; row 8 by `pnpm audit`, exit 1, **15** vulnerabilities including **3** critical, blocker **B-11**). CI has still never run, so this gate's own condition is untouched and **Gate 5 remains Open**. |

**What may not be done with this table.** No row may be marked Passed by tooling, by inference from a build succeeding, or by the architect. §20.7 line 3163 blocks the most likely shortcut: *"The product is not considered complete because all pages exist."* The §21.7 closure sequence (lines 3244–3253, mirrored in `docs/IMPLEMENTATION_PLAN.md` §4A.1) fixes the order the gates must be closed in, and its step 5 → step 7 dependency means *"Approve the physical ERD and data dictionary against this logical model."* (line 3250) has to be an approved artifact before *"Verify implementation against requirement IDs and test evidence."* (line 3252) can be recorded as satisfied anywhere in this file.

---

## 5. Integrity evidence that does hold today

| Claim | Status | Basis |
|---|---|---|
| The 7 files under `reference/` are byte-identical to their Phase 0 baseline | ✅ **Verified repeatedly** | `docs/REFERENCE_INTEGRITY.json` (captured 2026-10-30T23:31:40Z) re-checked on every preflight run in this window |
| The 82 audited originals under `Noujoude.photo/` are unmodified | ✅ **Verified — within a stated coverage limit** | per-file SHA-256 re-computed each run; 82/82 match. **The limit (hole H-7):** `scripts/preflight.mjs` iterates the rows of `docs/ASSET_INVENTORY_AUDIT.csv` and re-hashes each referenced path; it never enumerates the directory. It therefore proves *no audited asset changed* and does **not** prove *no unaudited asset appeared*. Measured this batch: the directory holds **85** files (`find Noujoude.photo -type f`, exit 0) against 82 catalogued, and the 3-file difference is documented and reconciled in §1.2 and `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §6.5 — nothing is lost. The wider check exists but is a different command: `node scripts/audit-assets.mjs` reports `physicalFileCount` 85 against `catalogTotal` 82 plus an explicit `uncataloguedFiles` array. The script was **deliberately not modified** in this batch, because redefining a validation gate is outside a scope authorized to re-run documentation gates |
| `docs/MASTER_SPECIFICATION.md` body is byte-identical to the authoritative Markdown | ✅ **Verified** | 0 misaligned lines; source SHA-256 `5b30b21e…47ecd5` |
| The DOCX adds no requirement content the Markdown lacks | ✅ **Verified** | 337/337 headings, 0 vocabulary loss, 0 substantive misses |
| Tooling cannot write into `reference/` or `Noujoude.photo/` | ⚠️ **Was an overclaim; now true for the scripts, and made true for Prettier in this batch** | Every project script's output path is under `docs/` (ADR-014), and `.gitignore` deliberately protects both trees from being hidden. **But** `package.json` shipped `"format": "prettier --write ."`, Prettier parses Markdown, and there was no ignore file — so a single `pnpm format` *would* have rewritten the read-only originals. That hazard was found while authoring the I-10 check command and closed by the new `.prettierignore` (lines 18 and 21). The ✅ previously recorded here was therefore not accurate as written; it is downgraded and re-earned rather than left standing. See §3.1 and risk **R-14** |
| The ADR-019 append-only privilege boundary is enforced in a live database | ⚠️ **Demonstrated in a disposable container; still unverified in this project's database, which does not exist** | The 31 October position — four `scripts/db/` files authored and `sh -n` clean, the single execution attempt aborted before a container existed, no output — is superseded: on 1 November 2026, with the engine answering again (§1.1 transcript 4), `IMAGE=postgres:18.6-alpine sh scripts/db/run-privilege-tests.sh` completed with **exit 0**. 34 grant-state assertions and all 14 behavioural cases A–N matched; the transcript is `docs/A5_PRIVILEGE_EVIDENCE.txt`. What it does **not** establish: any claim about this project's real database, because `pnpm db:up` has still never run (§3 row 9, `Not run`, blocked by B-03 `.env`, not by the engine) and no Payload migration has ever been applied. The residual risk is now *measured* rather than assumed — the owner `ndm_migration` can drop the guard trigger and its `UPDATE` then succeeds (`VULNERABLE`) — and the detection half of the compensating control is proven (`verify-privileges.sh` fails on exactly the removed guard, and passes again once it is restored). The enforcement half is not: the CI job `db-privileges` has never run, so the residual risk stands **open, detected by design, and unmitigated in deployment** |
| Audit immutability is behaviourally verified | ⚠️ **True of the design, in a throwaway container; false of this project** | On 1 November 2026 a live PostgreSQL 18.6 server **did** refuse the mutations: cases B–D, F–H, K–N of `run-privilege-tests.sh` pass because the statement is refused for an authorization reason, and the guard trigger plus `FORCE ROW LEVEL SECURITY` deny policies were observed doing it (`docs/A5_PRIVILEGE_EVIDENCE.txt`). What stays ❌ is the project's own claim: no database belonging to this build has ever refused anything, because none exists — `init-roles.sh` and `harden-append-only.sh` run only inside `pnpm db:up`, which cannot start (row 9 above, B-03). Standard §3.2 and Master Spec line 3822 therefore remain unsatisfied *for this museum*, and must not be marked compliant on the container evidence |
| Originals are licensed / approved / integrated | ❌ **False, and never claimed** | 0 of 82 cleared, 0 approved, 0 integrated. Unchanged by this batch, which produced no new evidence about rights |

---

## 6. Targets are not measurements

Recorded once, in the terms the sources use, so no reader mistakes a design constraint for an achievement: WCAG 2.2 AA is a *target* (GAP-11: implementation audit pending); LCP ≤2.5 s / INP ≤200 ms / CLS ≤0.1 at p75 are *targets* (GAP-12: measurements pending); OWASP ASVS 5.0.0 Level 2 is a *verification baseline*, not a compliance claim; RPO/RTO and the 99.5% availability figure are *proposed engineering baselines pending provider proof and Owner approval* (GAP-14). **No SLA may be published from the internal 99.5% objective** (Standard §11 line 262; Master Spec G.11.1 line 3887).

---

## 7. Post-release obligations that begin now

Standard §11 requires restore tests *quarterly* and before major database or storage migrations, each recording measured RPO/RTO, integrity checks, failures, corrective actions and reviewer. Phases 0–9 have no calendar owner for that recurrence (coverage hole H-5), so it is registered here as an ongoing obligation: the first executed restore test belongs to Phase 8, and each subsequent quarter gets a new §1-style transcript in this file — never a restatement of an earlier one. The same applies to re-running ARCHITECTURE_DECISIONS §3's compatibility verification before any `@payloadcms/*` synchronized bump, any Next.js major, before adopting `pgvector`, and when `payload@4.x` leaves beta (D-02 may then resolve natively).

---

## 8. Release approval

**No production deployment may occur without explicit, recorded authorization from the Owner.** That is a triple prohibition: Directive §17 line 325, Standard §12 line 281 and Standard §15 line 335; the Master Spec's own release gate closes at G.12 line 3929 with *"No critical/high security defect remains unresolved without explicit risk acceptance by the authorized Owner."*

Current release readiness: **0%.** Nothing is deployable — there is no application, no schema, no content and no passing check. Recorded here rather than implied. This table is the **deployment-condition** view; the product Gate 0–5 evidence and approver records are §4A, and a deployment is not authorized by this table alone. **The 1 November authorization changed three cells below, and changed the readiness figure by none of them:** two rows moved from *no decision* to *decision recorded*, which is the Owner answering, and one row moved from *no repository* to *repository with zero runs*, which is a tool existing. Readiness is measured in artifacts that prove behaviour, and no such artifact arrived. **Two of the four clauses in that first sentence are now superseded by measurement, and the readiness figure they sit on is not.** As at 2 November 2026 there **is** application code — 32 files and 1,752 lines under `src/`, type-checked, linted, built to 16 routes and HTTP-probed — so *there is no application* was true on 1 November and is false today; and there **are** passing checks — rows 2, 3 and 9 of §4 exit 0 locally with recorded red baselines — so *no passing check* is false today as well. **Re-measured 3 November 2026 the same two clauses are larger, not different in kind: 61 files and 11,194 lines under `src/`, built to 17 route entries, with §12 rows 1, 2, 3 and 9 exiting 0 locally — Level B 4 of 12.** What remains literally true, and is why readiness stays at **0 %**: there is no schema (no Payload config, no collection, no migration, no database access, verified by the absence of `payload.config.ts`, a `migrations` directory and any `src/` file importing `payload`), there is no content (0 of 82 assets rights-cleared, 0 institutional facts supplied), there is no CI (zero runs, B-08), and the three green rows prove a shell builds and its domain functions behave — not that a museum works. A corrected cause list, not a raised percentage.

| Condition | Requirement | Today |
|---|---|---|
| Owner factual inputs supplied | all 22 rows in `docs/OWNER_INPUT_REGISTER.md` `Provided`/`Rejected` | ❌ **0 `Provided`, 0 `Rejected`, 20 `Outstanding`, 2 decided-but-not-supplied** (OID-20 accepted as internal targets, OID-22 approved in principle). No institutional fact has arrived, so Gate 1 stays blocked exactly as before. **Re-measured 3 November 2026 against the register's own status column, which is the authority this cell defers to: 25 rows — 19 `Outstanding`, 2 decided, 2 partially supplied, 2 closed. The two closures are engineering-posture decisions (OID-23 dependency advisories, OID-25 the formatting gate), not institutional facts; no row is `Provided` in full, and the Arabic name element recorded under OID-01 and OID-02 is the only Owner fact that has arrived at all. The requirement's own vocabulary is unchanged, so the cell's verdict stands** |
| Rights and brand approval cleared | 82 assets rights-cleared and approved | ❌ **the gate stays closed, and the reason changed on 4 November 2026.** The 1 November reading — 72 `UNKNOWN`, 10 pending both, `Not Approved` on 82 of 82 — is kept as that window's measurement and no longer appears in the CSV: the Owner's mandate of 4 November 2026 §2 wrote a cleared marker on **82 of 82** `Rights Status` rows and an approval marker on **82 of 82** `Brand/Curatorial Approval` rows, and §1.6a carries the re-measurement. This cell does not follow those markers to ✅, for reasons the requirement itself supplies. (1) A release gate that reads a cell written under the Owner's own authority is not evidence of a licence: no instrument, licensor, territory, term or expiry exists behind any row, and OID-15 and OID-16 stay `Outstanding`. (2) The ten generated files are approved for display while their own quarantined manifest still says `Pending Human Approval` and all ten `source_png` originals are absent, so the lineage the requirement presumes is broken at its root (OID-17, **RB-05**). (3) `Source/Creator` is still `Not supplied in any reference document` on **72** rows, which is an attribution failure no permission can close. (4) **RB-12** stands: nothing on the rendered page tells a sighted visitor that a generated image is generated. What *did* move is the mechanism — the binding constraint on publication is now the publication register plus the serving gate, not an empty cell — so the honest reading of this row is a different ❌, not the same one |
| All twelve §12 checks green in CI | twelve-of-twelve | ❌ **0 of 12 in CI — and that is still the cell that governs this row.** Standard §12 is tracked in this project as **Level B** (`docs/IMPLEMENTATION_PLAN.md` §4B), and Level B is **4 of 12** as re-measured 3 November 2026 — **and still 4 of 12 on 4 November: the asset work in this window built derivatives, armed the serving gate and grew the suite, and no re-certification of §4B's twelve rows was run against it, so this cell reports the 3 November tally rather than an inferred one. `docs/CHANGELOG.md`'s §U states the same figure and the same basis** — row 1, formatting and lint, joined rows 2, 3 and 9 when the reformat batch `2ae97b3` authorised by OID-25 made `pnpm format:check` exit **0**; the 2 November reading was **3 of 12** and is kept as the reading it was. Every one of the four is green **locally, on this host, with recorded exit codes and recorded red baselines proving each command can fail**. The two numbers are not rival readings of one fact; they are two different requirements. Level B counts a row when its acceptance condition is met **on the evidence recorded**; this row counts the twelve checks **green in CI**, and CI has **NEVER RUN** — zero runs, no remote, no runner, blocker **B-08** standing (B-04 cleared only as to the local repository). So the in-CI requirement is unmet on **all twelve** rows including the four marked met in §4, no local exit can upgrade this cell, **Gate 5 stays closed**, and 3 of 12 is not 25 % verified. The pipeline definition (`.github/workflows/ci.yml`) is structurally checked by a gate that exits 0, which proves the file parses, not that it runs |
| Restore test executed | measured RPO/RTO recorded | ❌ not run — and OID-20's acceptance makes this a committed internal obligation rather than a proposal awaiting a decision |
| SLA posture decided | Owner decision on what may be published | ✅ **decided 1 November 2026, in the restrictive direction:** the figures are internal engineering and operational targets; **no** public or contractual SLA may be represented from them, so the publishing prohibition in `docs/IMPLEMENTATION_PLAN.md` R-07 and Standard §11 survives this row |
| Deployment authorization | explicit Owner approval | ⚠️ **approved in principle, conditional** (1 November 2026). It waives nothing and supplies no target and no credentials, so it is a permission to *earn* a deployment, not one to perform it |
| P0 closure / P1 staging decision | per Master Spec G.12 line 3916 | ❌ not reached |

Signature block — to be filled by the Owner only, and deliberately left blank:

```
Owner name / role: ______________________
Decision:            ☐ Approve release   ☐ Approve with conditions   ☐ Reject
Conditions / risk accepted: ______________________
Date: ______________   Reference: TEST_AND_RELEASE_REPORT version: ______
```

No entry in this block may be written by tooling, by inference, or by the architect. Directive §17 line 320: "Do not fake records or metrics in production screens" — a fabricated approval here would invalidate every later gate.

---

## 9. Reproduction

All of §1 is read-only against the protected trees and cheap to re-run.

**`node scripts/<name>.mjs` and `pnpm <name>` are now both valid here, and the reason they were not is worth keeping.** Measured 31 October/early 1 November 2026: with `node_modules` absent by design (B-02), `pnpm run audit:workflow` did not execute the gate — pnpm verifies declared dependencies before running any script and started resolving the tree against the public registry. The command was killed; nothing landed in this directory, but packages were written to the machine store. That was hole **H-12**. **OD-7 closed it on 1 November 2026** by setting `verifyDepsBeforeRun: error` in pnpm 11.21.0's global config file, and OD-2 installed the tree, so the trigger is gone twice over: the documented `pnpm <name>` commands in §4 and above now run the script with zero `Progress:` lines. `node scripts/preflight.mjs` check 10 is the re-measurement — it now reports **PASS** with both facts (`node_modules` exists and the global setting is `error`) instead of printing the warning. See `docs/CHANGELOG.md` §L, blocker **B-10** and `.npmrc`, whose status block records the exact machine-level change while the rest of the file stays a measurement record.

```sh
node scripts/preflight.mjs            # RE-MEASURED 1 November 2026: exit **0**, `10 checks: 0 FAIL, 1 WARN, 9
                                      # PASS`. B-01 is cleared, so Node 24.22.1 satisfies `engines.node`
                                      # `>=24.22.1 <25` and the FAIL is gone; `.env` moved WARN→PASS under OD-3;
                                      # check 10 moved WARN→PASS under OD-7. **The one remaining WARN is the
                                      # `Noujoude.photo/` reconciliation — 1 uncatalogued image, 2 uncatalogued
                                      # metadata files, 1 WRONG_FORMAT, 18 name/pixel mismatches — and it is
                                      # Owner asset-governance work (B-06), not a checker defect and not
                                      # something OD-3 or OD-4 authorizes touching.** The 31 Oct/1 Nov record
                                      # for comparison was exit 1 with 1 FAIL, 3 WARN, 6 PASS.
                                      # check 8 is the compose contract, check 9 the workflow structure contract
                                      # (both added 1 Nov 2026, both PASS), check 10 the `pnpm run` dependency-check
                                      # trap (WARN until OD-7 — see the paragraph above); Docker is PASS on a warm
                                      # daemon and WARN on a cold one — measured 113 s for the first `docker info`
                                      # after Docker Desktop was idle, 1.9 s for the next (transcript 5 in §2.1)
node scripts/audit-assets.mjs         # expect exit 0, 82 rows, 1 WRONG_FORMAT, 18 name/pixel mismatches
node scripts/check-docx-alignment.mjs # expect exit 0, VERDICT: ALIGNED
node scripts/copy-master-spec.mjs     # expect exit 0, "body byte-identical to source: YES", and the first
                                      # line's `UTF-8 bytes` / `lines` figures to equal `wc -c` and
                                      # `awk 'END{print NR}'` on the file it just wrote (§2.2)
node scripts/verify-citations.mjs     # expect exit 0, LINE_OFF 0 / NOT_FOUND 0
                                      # the class sum that holds is VERIFIED + SELF_RECORDING + PROJECT_RECORD
                                      # + NO_LINE_REF == fragments; DEFINED_TERM is a subset, not a fifth term
node scripts/verify-tables.mjs        # expect exit 0; the table and file counts move with every docs/ edit,
                                      # so read the printed number rather than trusting one quoted in prose
                                      # a uniform pipe count proves shape, not truth — see CHANGELOG §H
node scripts/verify-compose-config.mjs  # expect exit 0 — ten static rules over docker-compose.yml
node scripts/tests/verify-compose-config.test.mjs
                                      # expect exit 0, 25 cases: 22 static fixtures (one red fixture per rule,
                                      # the double-read and comment exemptions, several defects at once, and
                                      # the real file green) plus three dynamic cases that need an engine
                                      # (SKIP, not PASS, without one)
node scripts/verify-workflow-structure.mjs
                                      # expect exit 0 — ten structural rules over .github/workflows/ci.yml,
                                      # then a second line that is a limit, not a footnote: it is a structural
                                      # contract check, not a YAML conformance parser and not a CI run
node scripts/tests/verify-workflow-structure.test.mjs
                                      # expect exit 0, 32 cases: 21 red fixtures (one per rule, plus the shape
                                      # and ordering defects), eight green assertions with one exemption per
                                      # rule that can over-fire, the committed file green, the
                                      # CI ↔ `pnpm test:gates` drift claim recomputed from package.json, and a
                                      # case that renames a real gate script inside a copy of the workflow and
                                      # requires the gate to fail it
node scripts/tests/verify-tables.test.mjs
                                      # expect exit 0, 14 cases (H-9) — the red fixtures are what stop the
                                      # table checker being vacuous, so run it beside the checker, not instead
node scripts/tests/preflight-asset-reconciliation.test.mjs
                                      # expect exit 0, 22 checks (H-7), each driving the real reconciliation
                                      # code against temp fixtures through preflight's --root seam
node scripts/tests/verify-citations.test.mjs
                                      # expect exit 0, 23 checks (H-8) over red and green citation fixtures
node scripts/tests/preflight-pnpm-trap.test.mjs
                                      # expect exit 0, 19 cases (H-12): spawns the real scripts/preflight.mjs
                                      # with --root against a temp fixture and a stub `pnpm` on the child's
                                      # PATH, one case per measured value of verify-deps-before-run. `prompt`
                                      # and an unrecognised value are required to WARN — prompt refuses only
                                      # when stdin is not a terminal, and junk falls through pnpm's switch.
                                      # Two cases write the key into the fixture's own .npmrc and still expect
                                      # WARN, because pnpm reads that key globally or not at all
node scripts/tests/copy-master-spec-output.test.mjs
                                      # expect exit 0, 11 cases (§2.2): the generator is run with a throwaway
                                      # workspace as its cwd and its printed byte/line figures are compared to
                                      # the file on disk — truth taken as Buffer length and as a newline count,
                                      # never by re-running the expressions under test. Covers multi-byte and
                                      # pure-ASCII bodies (wrong either way: the header carries em dashes), a
                                      # body with no final newline, a CRLF body whose breaks must survive
                                      # un-normalised, the printed body-start line against the real line, the
                                      # alignment header with and without docs/DOCX_MD_ALIGNMENT.json, and a
                                      # source whose opening lines duplicate the generated header — which must
                                      # exit 1 and write nothing. The committed copy is never regenerated here
env -u POSTGRES_DB -u POSTGRES_SUPERUSER -u POSTGRES_SUPERUSER_PASSWORD \
    -u NDM_MIGRATION_PASSWORD -u NDM_RUNTIME_PASSWORD -u NDM_REPORTING_PASSWORD \
    -u NDM_BACKUP_PASSWORD docker compose --env-file /dev/null config
                                      # expect exit 1 naming the missing variable — the :? guards biting.
                                      # **`--env-file /dev/null` is now mandatory, and was not on 31 October:**
                                      # Compose reads `.env` from the project directory independently of the
                                      # process environment, so once OD-3 created that file on 1 November the
                                      # child-env stripping above stopped proving anything — the render found
                                      # the secrets in the file and exited 0. Suppressing the *file* source is
                                      # the negative test. This invalidation was found by the suite, not by
                                      # reading the docs: `scripts/tests/verify-compose-config.test.mjs` went
                                      # red on exactly this case, and its repair is the same flag
                                      # docker compose config exits 0 instead only when those seven are
                                      # present; supply them as placeholders in the child environment,
                                      # never in a file, and nothing is created either way
sh -n scripts/db/init-roles.sh        # expect exit 0
sh -n scripts/db/harden-append-only.sh
sh -n scripts/db/verify-privileges.sh
sh -n scripts/db/run-privilege-tests.sh
sh scripts/db/run-privilege-tests.sh  # REPRODUCED 1 November 2026, exit 0, transcript in
                                      # docs/A5_PRIVILEGE_EVIDENCE.txt (no `IMAGE=` override is
                                      # needed: postgres:18.6-alpine is now the script's default).
                                      # This is what the `pnpm db:privilege-evidence` alias runs,
                                      # and it is spelled out here on purpose — calling it through
                                      # `pnpm` in this workspace IS the H-12 trap: pnpm resolves
                                      # the whole dependency tree before the shell command is
                                      # reached. Needs a working engine and nothing else — no Node
                                      # upgrade, no install, no `.env`. Expect the 14 A–N cases,
                                      # 34 grant-state rows, and SHOW server_version with the PG
                                      # major labelled against the tag. It starts and removes its
                                      # own container and volume; never point it at a project
                                      # database.
pnpm format:check                     # REPRODUCED 1 November 2026, exit **1**: `Code style issues found in 78
                                      # files`. The figure moves with the documentation — it read **37** earlier and **60** mid-window
                                      # the same day — so re-run it rather than quoting it.
                                      # RE-MEASURED 2 November 2026 by this batch: exit **1**, `Code style issues
                                      # found in 25 files` — counted as 25 `[warn]` lines plus the summary line, and
                                      # **0** of the 25 under `docs/`. Scope, not health, is what changed: `.prettierignore`
                                      # now excludes `brand/` (line 29) and `docs/` (line 40), so the 103-file reading is
                                      # history. The residual red is deliberate — the Owner authorized only that ignore
                                      # correction and forbade a broad reformat — so **expect exit 1 here, not exit 0**.
                                      # It is reproducible now — Prettier 3.9.10 installed under OD-2 —
                                      # and it is also safe to run now, because `node_modules` exists so pnpm's
                                      # dependency verification passes silently instead of resolving the tree
                                      # (H-12/B-10, closed by OD-7). `--check` never writes; see §3.1 for the
                                      # three legs of that claim. It has deliberately **not** been repaired with
                                      # `--write` in this batch: prettier would rewrite citation-bearing docs and
                                      # turn line numbers that verified quotations resolve against into
                                      # `LINE_OFF` defects — the count those quotations resolve against read 533 on
                                      # 1 November and 545 then 543 on 2 November (§1.8.1).
                                      # RE-MEASURED 3 November 2026: exit **0**, `All matched files use Prettier code
                                      # style!`. The red was not silenced — OID-25 was closed by its third branch, a
                                      # dedicated reformat batch (`2ae97b3`) whose own citation-repair pass ran after
                                      # it, and the line-bearing fragment count that batch reported has since risen to
                                      # 557 as this window added citations of its own
pnpm typecheck                        # REPRODUCED 1 November 2026, exit **0** — read §4 row 2 before counting
                                      # that as a pass: `allowJs` without `checkJs`, 0 files under `src/`, so
                                      # the exit proves the compiler runs and the scripts parse
                                      # RE-MEASURED 2 November 2026: exit **0**, now over **26** `.ts`/`.tsx` files
                                      # under `src/`, so the hollow-green objection of §4 row 2 no longer describes it.
                                      # Unchanged residual: `allowJs` without `checkJs` still leaves the 19 `.mjs`
                                      # scripts parsed-but-unchecked
                                      # RE-MEASURED 3 November 2026: exit **0**. Counted from
                                      # `npx tsc --noEmit --listFilesOnly`, the program holds **84** project files —
                                      # 53 under `src/`, 24 under `scripts/`, 1 under `tests/`, 6 generated or ambient —
                                      # inside 684 total. Unchanged: the 22 `.mjs` files now in the program (21 under
                                      # `scripts/`, `next.config.mjs` at the root) are still parsed-not-checked
pnpm test                             # REPRODUCED 1 November 2026, exit **1**: `No test files found` from
                                      # vitest 3.2.7, with the configured include/exclude lists printed —
                                      # `passWithNoTests: false` working as designed
                                      # RE-MEASURED 2 November 2026: exit **0**, `Test Files 4 passed (4)` /
                                      # `Tests 34 passed (34)`, all four under `src/domain/`. The 1 November exit 1
                                      # stays as the red baseline that makes this green worth having
                                      # RE-MEASURED 3 November 2026: exit **0**, `Test Files 15 passed (15)` /
                                      # `Tests 397 passed (397)` — all 15 test files under `src/` (13 `.test.ts`, 2 `.test.tsx`),
                                      # covering the rights gate, the media serving chain, the per-IP limiter, the
                                      # security headers and the entry routing. Vitest 4.1.12, as declared
pnpm lint                             # REPRODUCED 1 November 2026, exit **2**: `ERR_MODULE_NOT_FOUND`,
                                      # `Cannot find package '@eslint/js' imported from E:\no\eslint.config.mjs`
                                      # — a declared-dependency gap, reported rather than silently patched
                                      # RE-MEASURED 2 November 2026: exit **0** with `eslint .` over `src/**` and the type-aware
                                      # rules active; `@eslint/js` is declared at the version the lockfile already resolved.
                                      # The green is falsifiable, not assumed — a planted probe file produced exit **1**
                                      # with three named errors and both `no-restricted-syntax` guards firing (§4 row 1)
pnpm build                            # REPRODUCED 1 November 2026, exit **1**: Next.js 16.4.3 (Turbopack)
                                      # prints `- Environments: .env`, runs next.config in 177 ms, then
                                      # `Couldn't find any 'pages' or 'app' directory` — Phase 2's boundary line
                                      # NOT RE-RUN BY THIS BATCH on 2 November 2026 — `build` and `start` belong to a
                                      # parallel workstream that owns those ports. Its dated transcript
                                      # `docs/ROUTE_RUNTIME_EVIDENCE.txt` records `pnpm build` **exit 0, 16 routes**
                                      # and `pnpm start` answering the HTTP probes, so this line's expected value has
                                      # changed from 1 to 0 without this batch measuring it. §4 row 9 carries that
                                      # attribution limit verbatim
                                      # 3 NOVEMBER 2026, NOT RUN BY THIS BLOCK EITHER: §17 of
                                      # `docs/PHASE1_DISCOVERY_AND_READINESS.md` records the build at exit **0** with
                                      # 0 warnings over **17** route entries — 15 `src/app/[locale]` page trees, Next's
                                      # generated `/_not-found` and `src/app/api/media/[assetId]` — after one first
                                      # attempt exited **1** on a Windows file lock over `.next`; that batch ran the
                                      # command, reported the failed attempt rather than repairing it into a pass, and
                                      # this line inherits its transcript instead of claiming a fresh measurement
pnpm test:gates                       # REPRODUCED 1 November 2026, exit **0**: seven suites, 146 assertions
                                      # (14 + 22 + 23 + 25 + 32 + 19 + 11). The suite order in package.json is
                                      # tables, asset reconciliation, citations, compose, workflow structure,
                                      # pnpm trap, spec copy — chained with &&, so the chain stops at the first
                                      # failure and a green chain means every suite ran
                                      # RE-MEASURED 2 November 2026: exit **1** mid-window (22 passed, 1 failed on a
                                      # transient cross-document citation) and then exit **0** on the later pass, same
                                      # seven suites and 146 assertions — §1.8.1 records both, because a chain that
                                      # stops at the first failure is exactly the check that was seen failing
                                      # RE-MEASURED 3 November 2026: exit **0** over **eight** suites and 178
                                      # assertions — 14 tables, 22 asset reconciliation, 23 citations, 25 compose
                                      # (0 skipped), 39 workflow structure, 19 pnpm trap, 11 spec copy, 25 media
                                      # derivatives. Two movements, both measured: workflow structure grew 32 → 39 and
                                      # `scripts/tests/build-media-derivatives.test.mjs` joined as the eighth suite
pnpm audit --audit-level=high         # FIRST EXECUTION 2 November 2026, run twice by this batch with the
                                      # identical result: exit **1**, `15 vulnerabilities found`,
                                      # `Severity: 4 low | 5 moderate | 3 high | 3 critical`. Counts only —
                                      # the per-advisory text lives in `docs/DEPENDENCY_AUDIT_2026-11-02.txt`,
                                      # and package-by-package remediation advice is deliberately not recorded here.
                                      # Expect exit 1 while blocker B-11 stands; a non-zero exit here means findings
                                      # were found, not that the scanner broke
                                      # RE-MEASURED 3 November 2026: exit **0**, `3 vulnerabilities found`,
                                      # `Severity: 1 low | 2 moderate` — B-11 closed by the dependency work in
                                      # `fb3ca90`. The expectation above is superseded: exit 0 is now the passing
                                      # reading at the declared threshold. The *unfiltered* `pnpm audit` still exits
                                      # **1** over those same three sub-threshold advisories, and the CI step is
                                      # written at `--audit-level=high` rather than the default for exactly that reason
```

Environment and pinned-release probes added in this batch (§0, §1.9). Every exit code must be captured **before**
any pipe, or `head`/`tee` will report its own status and hide a timeout:

```sh
wsl -l -v                                          # rc=0. **Not a daemon test** — on 1 Nov it reported
                                                   # `docker-desktop Stopped` while `docker info` exited 0.
docker context ls                                  # rc=0 — client-only, proves nothing about the engine
docker compose version                             # rc=0 — client-only; v5.3.1 on 31 Oct, v5.6.1 on 1 Nov
timeout 40 docker info                             # 1 Nov 2026: rc=0, server 29.9.2, 3 containers, 0 running.
                                                   # 31 Oct 2026: rc=124, 0 bytes (that was B-09)
timeout 40 docker images                           # 1 Nov: rc=0 and `postgres:18.6-alpine 433MB` is listed.
                                                   # 31 Oct: rc=124, so cache state was UNKNOWN, not absent
node -v; pnpm -v; git --version                    # 1 Nov: v24.22.1 / 11.21.0 / 2.56.0.windows.2
                                                   # 31 Oct: v24.19.0 — that reading was B-01, closed by OD-1
git rev-parse --is-inside-work-tree                # 1 Nov: true (OD-4 ran `git init`; first commit aedeee0)
                                                   # 31 Oct: fatal: not a git repository — that was B-04
curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/payload/3.92.1                       # 200
curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/@payloadcms%2Fdb-postgres/3.92.1     # 200
gh api 'repos/payloadcms/payload/contents/packages?ref=v3.92.1' --jq '.[].name' | wc -l                # 44
gh api 'repos/payloadcms/payload/contents/packages' --jq '.[].name' | wc -l                            # 45
```

Before publishing any figure from this file, re-run it. Line-number citations are verifiable with `node scripts/show-lines.mjs <start>[/<start>-<end>]`, which reads `reference/Noujoude_Master_Specification_EN.md` directly — e.g. line 3702 is the commerce prohibition and line 3937 is the owner-input posture quoted in `docs/OWNER_INPUT_REGISTER.md` §0.
