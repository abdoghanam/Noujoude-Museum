# NOUJOUDE DIGITAL HERITAGE MUSEUM — Phase 1 discovery and readiness report

Document ID: `NDM-PHASE1-001` · Version: `0.1.0` · Date: 2 November 2026
Author: Qoder (working agent) · Requesting authority: the Owner's `MASTER DESIGN, MOTION, SECURITY & ENGINEERING QUALITY MANDATE` (2 November 2026), Part VIII
Status: **PROPOSED — awaiting Owner review.** This document is a discovery report, not an approval record and not an acceptance record.

---

## 0. What this document is, and what it is not

**Is:** the Phase 1 deliverable the mandate requires — a comprehensive discovery and readiness report of the project as it actually stands on 2 November 2026, with a verified current-state audit, an asset and brand-reference map, a page inventory, the design/technical/security/performance gap set, the requirement conflicts found between the mandate and the governing baseline, the missing-evidence inventory, the Owner blockers, and the exact document changes proposed for Phase 2 onward.

**Is not:** an implementation, a design proposal, an approval, or a score of anything except what could be measured. It authorizes nothing. It does not restate approved requirements; it points at them.

Four rules govern every line of it, inherited and not negotiable:

| Rule | Source | Effect here |
|---|---|---|
| A requirement is accepted only by implemented behaviour plus recorded evidence | `reference/Noujoude_Master_Specification_EN.md` §20.1 (lines 3003–3006) | Nothing in this report is a pass; the readings in §12 are computed against that rule |
| A gate may be marked passed only with recorded evidence and an identified approver | `docs/IMPLEMENTATION_PLAN.md` §4A (lines 340–355) | Every status word here carries the measurement or the register row that produced it |
| The specification is not the implementation | `docs/MASTER_SPECIFICATION.md` §0.6 (working-copy lines 202–214) | Design dimensions are reported as *specified and unimplemented*, never as *delivered* |
| Missing facts stay missing | Owner authorization §2, 1 November 2026 | 20 of 22 Owner inputs are still open and are listed as blockers, not answered |

**Citation convention used here — the same one the traceability register uses.** Every line number given against the Master Specification is a line of `reference/Noujoude_Master_Specification_EN.md`, the read-only source, not of the generated working copy `docs/MASTER_SPECIFICATION.md`. The offset was measured in this run at exactly **128 lines**: eleven section headings and one acceptance row were checked at both locations (`## 4.2` at 406 and 534, `## 12.1` at 1660 and 1788, `## 12.7` at 1745 and 1873, `## 12.13` at 1805 and 1933, `## 16.3` at 2343 and 2471, `## 19.3` at 2880 and 3008, `## 19.6` at 2932 and 3060, `## 20.1` at 3003 and 3131, `## 20.4` at 3053 and 3181, STT-002 at 3086 and 3214, `## A.2` at 3323 and 3451). Line numbers against the other eleven `docs/` files are those files' own lines.

---

## 1. Scope of this run

Phase 1 only, as the mandate directs. Read-only discovery: four audits (specification design requirements, brand and asset inventory, traceability and architecture decisions, security and CI and test infrastructure) plus direct file inspection and gate execution. No file under `src/`, `reference/`, `Noujoude.photo/`, `brand/`, `scripts/`, `tests/`, or any configuration was created, modified, or deleted by this run. No dependency was installed. No deploy happened. Two new documents are proposed by this run and written by it: this report and `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md`. Nothing else.

---

## 2. Verified current state (measured 2 November 2026)

| Item | Command or method | Actual reading | Exit |
|---|---|---|---:|
| Node.js | `node -v` | v24.22.1 — inside the declared range at `package.json` line 8 | 0 |
| pnpm | `pnpm -v` | 11.21.0 — equals `packageManager` at `package.json` line 11 | 0 |
| Git | `git -v` | 2.56.0.windows.2 | 0 |
| Commits | `git log --oneline` | 2 commits: `9522379`, `aedeee0` | 0 |
| Remote | `git remote -v` | empty — no remote exists, nothing has been pushed | 0 |
| Working tree | `git status --short` | ` M docs/CITATION_VERIFICATION.json`, `?? brand/` | 0 |
| Lockfile | `wc -c pnpm-lock.yaml` | 285,200 bytes, committed in `aedeee0` | 0 |
| Local env | presence check only | `.env` exists and is git-ignored; its values were not read into this report | — |
| Application code | `find src -type f`, counted with `wc -l`, and re-counted restricted to `.ts`, `.tsx`, `.css` | **History, the reading this report was written against:** `src/README.md` **only**. **Current, re-measured 2 November 2026 by the closure batch: 32 files** under `src/`, of which **31 are code or style (18 `.tsx`, 8 `.ts`, 5 `.css`) totalling 1,752 lines**, plus `src/README.md` | — |
| Application tests | `find tests -type f`, then `find src -name '*.test.ts*'`, then `pnpm test` | **History:** `tests/setup/env.ts` **only**. **Current:** `tests/` still holds **1** file, but the four real suites are under `src/domain/` (`locale.test.ts`, `routes.test.ts`, `rights.test.ts`, `entry-routing.test.ts`) and `pnpm test` runs **4 files / 34 assertions** | 0 |
| Stylesheets and tokens | `find src -name '*.css'` and a custom-property scan of `src/ui/styles/global.css`, plus the old repo-wide search for `*.css` and `tokens*` outside `node_modules` | **History:** **zero files**. **Current: 5 CSS files** (`src/app/[locale]/page.module.css` and four under `src/ui/`), and `src/ui/styles/global.css` carries **50** `--ndm-*` custom properties holding the §12.2 palette (source lines 1668–1685) as `proposed`, not adopted brand (BA-002 open). A `tokens*` filename search still returns **zero** — the tokens are custom properties, not a token artefact | — |
| Font files | repo-wide search for `woff`, `woff2`, `ttf`, `otf` outside `node_modules` | **History: zero files.** **Current reading of the same search:** still **zero** font files in the application — nothing under `src/`, nothing loaded by `src/ui/styles/global.css`; six `.ttf` files exist only inside the quarantined, untracked `brand/_tools/fonts/` tree, with no licence record and no adoption (OD-14), and are not served. OID-18 stays open | — |
| Documentation gates | `node scripts/verify-citations.mjs` | **History, the §2 baseline reading:** `scanned 12 docs/ markdown files, 533 quoted fragments`; `VERIFIED 427`, `LINE_OFF 0`, `NOT_FOUND 0`, `NO_LINE_REF 86`; `BARE REFERENCES: 1247 checked, 0 defect(s)`. **Current, re-run 2 November 2026 by the closure batch, twice because the count moves under concurrent editors:** first pass `scanned 14 docs/ markdown files, 545 quoted fragments carrying a line reference`, VERIFIED 434 + SELF_RECORDING 10 + PROJECT_RECORD 10 + NO_LINE_REF 91 = 545 with `DEFINED_TERM` 6 inside the 91, `LINE_OFF 0`, `NOT_FOUND 0`, `BARE REFERENCES: 1494 checked, 0 defect(s)`; second pass, minutes later, 543 fragments with VERIFIED 433, PROJECT_RECORD 9, NO_LINE_REF 91 and `BARE REFERENCES: 1505 checked, 0 defect(s)`. `CITATION GATE PASSED` on both. The rule that keeps this row honest is the project's own: read the printed number, never a quoted one | 0 |
| Documentation gates | `node scripts/verify-tables.mjs` | **History:** `OK: 199 tables in 12 markdown files`. **Current, re-run 2 November 2026:** `OK: 234 tables in 14 markdown files, each with a header, a delimiter row and a uniform column count`. **Mid-window reading, kept because the reason matters:** the same gate exited **1** earlier in this batch on 233 tables, on one malformed row of a register table in `docs/IMPLEMENTATION_PLAN.md` — a file this batch does not own — and its author repaired that row before this batch's second pass, so the exit 1 is history and the exit 0 is the reading | 0 |
| Environment gates | `node scripts/preflight.mjs` | `10 checks: 0 FAIL, 2 WARN, 8 PASS` | 0 |

Two honest notes. First, running the citation gate rewrites its generated artifact, so `docs/CITATION_VERIFICATION.json` now shows as modified; it is a machine output, not authored evidence. Second, the `brand/` tree grew during this session: the audit read 80 files and `noujoude-monogram-seal.svg` at 16,321 bytes modified 21:27; this run measured 89 files and the same path at 18,458 bytes modified 22:12. Something outside this agent is writing there. It is untracked, it is not in any commit, and §6 classifies it accordingly.

The four engineering gates that matter for release (`typecheck`, `lint`, `test`, `build`) are recorded at 1 November 2026 in `docs/TEST_AND_RELEASE_REPORT.md` §4 and §9 with their measured exits — `lint` exits 2, `test` exits 1 with `No test files found`, `build` exits 1 with no pages or app directory — and were **not** re-run by the discovery run that wrote the rows above, because that run changed no input to them; `format:check` is deliberately not quoted there, because the project's own rule at `docs/IMPLEMENTATION_PLAN.md` §4B.1 is that the figure is re-read, not quoted. **Those four readings are no longer current, and the closure batch re-ran them on 2 November 2026.** Measured exits, each re-read from its own command: `pnpm typecheck` **0**, `pnpm test` **0** (4 files, 34 assertions), `pnpm lint` **0**, `pnpm format:check` **1** over **25** hand-written tooling and configuration files with **none** under `docs/`, and `pnpm audit --audit-level=high` **1** with **15** vulnerabilities (4 low, 5 moderate, 3 high, 3 critical). `pnpm build` was not re-run by this batch — another process owns it — and its 2 November exit **0** over 16 routes, followed by `pnpm start` answering HTTP probes on localhost, is recorded in `docs/ROUTE_RUNTIME_EVIDENCE.txt`; the audit transcript is `docs/DEPENDENCY_AUDIT_2026-11-02.txt`; and `pnpm test:gates` now exits **1** on defects in files outside this batch, not on any assertion about the gates themselves. Standard §12 is tracked in this project as **Level B** (`docs/IMPLEMENTATION_PLAN.md` §4B), and Level B moved from 0 of 12 to **3 of 12** — rows 2, 3 and 9 — on local exits while CI itself has still never run (blocker B-08), so no §12 row is green in CI and Gate 5 stays closed.

---

## 3. The application reality, stated plainly

There is no application. What exists is a governed baseline: a 4,069-line adopted specification, twelve authored engineering documents, 25 architecture decision records, a documentation-integrity gate system that actually runs, a database and CI contract that has never executed, an 82-row asset catalog with zero cleared rights, and a dependency manifest that names a stack but has never built it. **Corrected as to its first clause by the 2 November closure batch; the rest still stands, and the correction is narrower than it looks.** That sentence was written against a `src/` holding one README; `src/` now holds **32 files / 1,752 lines** of typed, linted, built and HTTP-served code — the locale contract, the canonical route registry, the fail-closed rights gate and the entry routing read off the real `next.config.mjs`, over 15 canonical routes plus Next's own not-found, with `pnpm build` exiting 0 and `pnpm start` answering on a local port (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). What remains true, and is why this section still exists: **there is no content-bearing application.** No Payload configuration, no collection, no migration, no database access, no Control Center, no AI surface, no rights-cleared image and no editorial sentence — every route renders an honest empty state and is served marked non-indexable. The correct present-tense reading is therefore *an initialized, executed shell plus a real domain layer, verified as to shape and unverified as to product*, not *no application* and not *a museum*: for the design dimensions there is still no approved brand material, no adopted token state and no populated page to inspect.

That is not a failure of Phase 0/1 — those phases were about establishing the baseline and they closed it with evidence — but it decides what the mandate can mean. Every dimension of the mandate that asks whether the homepage composes well, whether motion reads as Noujoude, or whether Arabic behaves as a first-class language has the same current answer: **there is nothing rendered to inspect.** The mandate is explicit that this cannot be scored as a pass, and this report does not score it as one.

The corollary that Phase 2 onward must respect: the specification already decides most of what the mandate asks to be designed. It fixes the visual direction (§12.1, lines 1660–1667), the twelve colour tokens and their distribution (§12.2–12.3, lines 1668–1700), the font roles per language (§12.5, lines 1712–1732), the logo roles and integrity rules (§12.7, lines 1745–1765), the material families (§12.8, lines 1766–1771), the shape and iconography rules (§12.9–12.10, lines 1772–1785), the approved motion types and reference timing table (§12.13, lines 1805–1822), the reduced-motion obligation (line 1821), the Core Web Vitals thresholds at p75 (§19.6, lines 2932–2943), the WCAG 2.2 Level AA target (§19.8, line 2957), the SEO and hreflang clauses (§19.11, lines 2993–3000 and G.9, lines 3842–3858), the Control Center identity (§15.4, lines 2152–2165), and the AI Curator's governance (§14, lines 1945–2119). The mandate's work for dimensions 02–05 and 07–12 is therefore **implementation and verification against a fixed baseline**, not a fresh design decision — and any Phase 2 output that differs from Section 12 of the specification is a defect requiring an ADR, not a stylistic choice. That is the requirement of the binding visual rules at G.6 (lines 3746–3765), which state that font licensing and final brand approval remain recorded dependencies and that developers must not replace them with arbitrary alternatives without an ADR and visual review.

---

## 4. Dependency reality versus what the mandate assumes

| Named by the mandate | Declared in `package.json`? | Installed? | ADR? | Note |
|---|---|---|---|---|
| GSAP (cinematic timelines, ScrollTrigger) | No | No | No | The specification never names it either; the mandate introduces it |
| Motion (React UI states) | No | No | No | Same |
| Lenis (optional scroll) | No | No | No | The mandate itself makes it optional with native scroll as baseline |
| A CSS approach (tokens, methodology) | No | No | No | No Tailwind, no CSS Modules, no vanilla-extract — nothing declared |
| An i18n or locale-routing library | No | No | No | Locale prefixing is mandatory (`reference/Noujoude_Master_Specification_EN.md` §4.2, line 408) and no mechanism is chosen |
| Font loading strategy | No | No | No | Cormorant Garamond, Inter and Tajawal are fixed by role at §12.5 (lines 1712–1732); zero font files exist; licence unverified |
| Image pipeline | `sharp` 0.35.5 declared | In the manifest, never exercised | No | §19.7 (lines 2944–2954) requires responsive variants, reserved dimensions and lazy loading |
| `@eslint/js` | **No — but `eslint.config.mjs` imports it** | No | No | This is why `pnpm lint` exits 2; the lint gate cannot run at all |
| `axe-core` | Yes, devDependency | Installed with the tree, never imported | Adjacent only | `test:a11y` greps `@a11y`; no spec applies the tag, so that run would pass vacuously |
| Playwright, Vitest | Yes | Installed | Authored configs | `tests/e2e/` and `tests/a11y/` do not exist; Vitest finds no test file |

The mandate's Part VII requirement — one sheet per proposed dependency with exact package, purpose, version, licence, stack compatibility, bundle impact, maintenance status, security implication, alternatives and necessity, and no competing animation engines — is the right gate, and it is currently unsatisfied in both directions: no candidate library has such a sheet, and the *styling* and *font-loading* choices that the design dimensions depend on have not been proposed at all. Those two are the true prerequisites: colour, type, spacing and motion tokens cannot exist as artefacts before the project decides how CSS is authored and how fonts arrive. §11 lists them as Owner decisions because they cost dependencies and bytes on every route.

---

## 5. Page inventory — the mandate's list against the canonical route table

The canonical public routes are `reference/Noujoude_Master_Specification_EN.md` §4.2 (lines 406–429): fifteen route patterns, every one locale-prefixed, with locale identifiers `en` and `ar` at line 428. The country worlds are six, with Morocco first, at §2.3 (lines 246–260).

| Mandate page | Canonical spec route | Spec section | Status of the mandate's ask |
|---|---|---|---|
| Homepage | `/{locale}` | §6.1 (lines 542–589) | Exists in the baseline; eight ordered sections are fixed there |
| The Museum | `/{locale}/the-museum` | §6.2 (lines 590–605) | Exists; §4.5 (lines 449–453) makes it the Enter-the-Museum destination, not an interstitial |
| The Worlds | `/{locale}/worlds` | §6.3 (lines 606–633) | Exists as *Worlds directory* — a naming difference only |
| Country pages (Morocco, Egypt, Syria, Mauritania, Libya, Sudan) | `/{locale}/worlds/{country-slug}` | §6.4 (lines 634–651) | Exists; order and openness are governed, not designed |
| Collections | `/{locale}/collections` and `/{locale}/collections/{collection-slug}` | §6.5–§6.6 (lines 652–695) | Exists as two routes where the mandate names one |
| Rare Pieces | **No canonical route** | — | **Conflict C-1** — see §9 |
| Artifact Details | `/{locale}/artifacts/{artifact-slug}` | §6.7 (lines 696–751) | Exists; §6.8 treats the image viewer as its own concern |
| AI Curator | `/{locale}/curator` | §6.10 (lines 785–821) | Exists, with prohibited behaviours at lines 813–818 |
| Contact | `/{locale}/contact` | §6.12 (lines 838–855) | Exists |
| Control Center | `/control-center` route family | §15 (lines 2120–2256), 20 modules at §15.6 (lines 2178–2204) | Exists as a private module family, not a page |
| — not in the mandate's list | `/{locale}/stories`, `/{locale}/stories/{story-slug}` | §6.9 (lines 752–784) | Spec pages the mandate omitted |
| — not in the mandate's list | `/{locale}/search` | §6.13 (lines 856–875) | Same |
| — not in the mandate's list | `/{locale}/about`, `/{locale}/privacy`, `/{locale}/terms` | §6.11 (lines 822–837), §6.14 (lines 876–896) | Same — and each needs approved institutional text that does not exist yet |

So the mandate's per-page composition work is well-defined for ten of its twelve named surfaces, needs a naming reconciliation for three, and for "Rare Pieces" needs an Owner decision. The canonical routes the mandate does not mention are still in scope of the baseline and cannot be dropped by a mandate that does not amend the specification — including the story, search, about, privacy and terms pages, which are where the missing institutional facts bite hardest.

---

## 6. Asset, brand and reference map

| Fact | Reading | Source |
|---|---|---|
| Catalogued assets | 82 rows, IDs `NDM-AST-001`–`NDM-AST-082` | `docs/ASSET_INVENTORY_AUDIT.csv` |
| Physical files in the library | 85 | Same audit, reconciled against disk |
| Uncatalogued physical files | 3 | Same |
| Name-versus-pixel mismatches | 18 — every `_1024` asset is smaller than its name claims | `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §6.3 |
| Container-versus-extension defect | 1 — `NDM-AST-041 vintage_collector_desk_16x9.jpg` carries `RIFF`/`WEBP` magic bytes | `docs/SECURITY_AND_PERMISSIONS.md` §10, control M-04 (line 529) |
| Rights state | 72 `UNKNOWN`, 10 `Awaiting Rights Review`, **0 cleared** | Catalog columns K and L |
| Publication approval | **0 of 82 approved** — `Not Approved — no approval record supplied` | Catalog column M |
| Source of record | 72 `Not supplied`, 10 `AI-generated (Qwen ImageGen tooling)` | Catalog source column |
| Lifecycle position | The furthest any asset has travelled is `Located`; `Rights Reviewed`, `Approved`, `Optimized`, `Integrated` and `Verified in Context` are all **0** | `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §1.2 |
| Identity assets in the reference set | 12, including wordmark, stacked wordmark, monogram and seal, burgundy badge and watermark | `reference/Noujoude_Master_Specification_EN.md` §A.2 (lines 3323–3339) |
| Frame, ornament and separator files | **None exist** — §12.9 (lines 1772–1779) requires them and the library has none | Audit finding |
| Font files | **Zero** on disk; licence and deployment source unverified | §12.5 (lines 1712–1732); BA-003 at §21.3 (lines 3207–3218) |
| Brand approval | BA-001–BA-007 all `Pending …` | `reference/Noujoude_Master_Specification_EN.md` §21.3 (lines 3207–3218) |

**The `brand/` tree.** `brand/` exists outside the catalog and outside Git: 89 files at the time of this measurement, growing during the session, containing `brand/noujoude-monogram-seal.svg` and a `brand/_trace/` working area of scripts and PNGs. The SVG's own header describes it as a vector redraw of `brand_seal_monogram_1024.webp` — that is `NDM-AST-001`, whose rights state is `UNKNOWN` and whose approval state is `Not Approved`. It carries no Asset ID, no rights record, no approval record and no commit.

Classification: **unknown-provenance derivative draft of an uncleared asset.** Consequences that bind Phase 2: it is not an approved brand asset and must not be adopted as one; a redraw of an uncleared file inherits the rights question rather than resolving it; the integrity rule at §12.7 (lines 1745–1765) forbids recreating the official logo from text when the approved asset exists and forbids unapproved recoloring; and this report neither commits nor deletes it, because preserving unknown files is a standing instruction. If the Owner wants it considered, the honest route is a new catalog row with its own provenance and rights question — not a silent promotion.

---

## 7. Gap register — what each dimension has today

| # | Dimension | Specification coverage | Implemented artefacts | Evidence available today | Nearest blocker |
|---|---|---|---|---|---|
| 01 | Security and protection | Strong — §19.3–19.5 (lines 2880–2931), ASVS 5.0.0 Level 2 target at §19.4 (lines 2908–2913), and a 716-line `docs/SECURITY_AND_PERMISSIONS.md` with roles, a 240-cell permission matrix, invariants A-01–A-10, CMS boundary C-01–C-10 and media controls M-01–M-11 | None — every control is `Contract — unimplemented` | Zero. No control has been exercised; CI has run 0 times; `pnpm audit` has never executed | No application, no IdP (B-05), no remote or runner (B-08) |
| 02 | Brand identity | Roles and integrity rules at §12.7 (lines 1745–1765); Brand Studio at §16.3 (lines 2343–2376) | No token artefact, no approved files in the repository | Zero approved brand assets; BA-001 pending | Owner approval and rights |
| 03 | Visual design and composition | Direction fixed at §12.1 (lines 1660–1667); per-page section orders in §6 | Nothing rendered | Zero — there is no page to inspect | Implementation |
| 04 | Colour and material | 12 tokens with HEX at §12.2 (lines 1668–1686); distribution at §12.3 (lines 1687–1700); materials at §12.8 (lines 1766–1771) | No semantic tokens exist anywhere — zero CSS files | Pair contrast is computable but unproven in a rendered UI | Styling decision plus BA-002 |
| 05 | Motion | Approved types at §12.13 (lines 1805–1812), timing table (lines 1813–1819), reduced motion (line 1821), CMS preset limit at §16.3 (line 2365) | No motion system, no tokens, no engine | Zero | Engine ADR (C-2) |
| 06 | Performance | CWV at p75 with three thresholds at §19.6 (lines 2932–2943); required test surfaces (line 2942); image rules §19.7 (lines 2944–2954) | No bundle, no route, so no baseline to budget against | Zero measured bytes | A real application first |
| 07 | Operational reliability | 12 release checks in Standard §12, mirrored in `docs/SECURITY_AND_PERMISSIONS.md` §13 (lines 618–695); a compose contract with 10 static rules; append-only privilege design ADR-019 | Config authored; `lint` cannot run at all; backup and restore have never been performed | Preflight and the doc gates pass; privilege evidence exists only against a disposable container | `@eslint/js` (C-12), B-03 runtime, B-05 backup vendor |
| 08 | Responsive | §19.9 (lines 2977–2982) requires current-stable browsers and mobile usability; four Playwright projects are configured | No page, no breakpoint system | Zero | Implementation |
| 09 | Arabic RTL and English LTR | §10 (lines 1434–1521): nine Arabic clauses at §10.5 (lines 1471–1482), logical properties (line 1476), the mirroring rule (line 1477), the RTL test matrix (line 1481), no machine translation | No locale mechanism, no RTL CSS, no font file | Zero | Locale or routing ADR plus fonts and translation content |
| 10 | QA | 15 required test types at §20.3 (lines 3033–3052); a 60-row acceptance matrix at §20.4 (lines 3053–3117); a 219-row traceability register | 146 documentation-gate assertions run; 0 application tests | Real, but about documentation | Implementation |
| 11 | Content integrity and asset rights | §13 (lines 1829–1944), §8.11–8.13 (lines 1249–1296), safeguards at §A.9 (lines 3449–3460) | Register exists with 82 rows; 0 cleared | Honest negative evidence, which is still evidence | B-06 |
| 12 | SEO | §19.11 (lines 2993–3000) and Appendix G.9's 13 clauses (lines 3842–3858) | Nothing | Zero | Institutional facts, rights-cleared OG image |
| 13 | Maintainability | ADR discipline, the naming taxonomy at §20.2 (lines 3007–3032), the doc gates | 25 ADRs, gates that run, a real lockfile | Strongest dimension today, and still documentation-grade only | Empty `src/`; two hollow-green gates — **six cells in this register are superseded by the 2 November execution; read §16 before using this column** |

---

## 8. What is genuinely good, and why it is not inflation

Three things are better than nothing. The specification is adopted with a hash and an approver (Gate 0 passed 1 November 2026, `docs/IMPLEMENTATION_PLAN.md` §4A). The documentation is under *executable* verification — 533 quoted fragments resolve against real source lines, 1,247 bare line references resolved and 199 tables were structurally valid at the §2 baseline, 146 gate assertions run, and each of those tools was regression-tested by proving it catches the defect class it exists for; §15 carries the post-write figures for the two Phase 1 documents, and the 2 November closure re-run in that same table prints **545 then 543** fragments and **1,494 then 1,505** bare references over **14** markdown files with **0** citation defects, and **233 then 234** tables. The movement is not noise: four documents other than this batch's two were being edited while this batch worked, and the table gate exited **1** mid-window on a malformed register row in `docs/IMPLEMENTATION_PLAN.md` that its own author then repaired — which is the defect class these gates exist to catch, reported rather than papered over. And the security, media and AI documents state their own non-implementation explicitly instead of implying coverage: `docs/SECURITY_AND_PERMISSIONS.md` line 6 declares that none of its controls is a satisfied control.

That last property is what makes a 100-point framework survivable here: the register can say *specified, unimplemented, unevidenced* without the document silently reading as compliance. The danger the framework must police is the opposite failure — a high specification-completeness number being read as progress. The companion framework document keeps specification, implementation and verification as three separately published axes for exactly that reason.

---

## 9. Requirement conflicts found

| ID | The mandate says | The governing baseline says | Conflict type | Proposed resolution | Needs Owner? |
|---|---|---|---|---|---|
| C-1 | A page named Rare Pieces with its own composition standard | No such route in `reference/Noujoude_Master_Specification_EN.md` §4.2 (lines 406–429); the nearest canonical surfaces are Collections at §6.5–§6.6 (lines 652–695) | Scope naming | Either adopt it as a new route with a specification amendment plus an ADR, or map it onto the collection detail route as an editorial treatment. Do not build a route that §4.4 (lines 436–447) and the navigation contract do not know about | **Yes** |
| C-2 | GSAP, Motion and CSS each own a class of motion, and no competing animation engines may be added | `reference/Noujoude_Master_Specification_EN.md` §12.13 (lines 1805–1822) specifies motion by effect and reference duration with no library named anywhere | Unchosen mechanism | One ADR proposing the engine set with the Part VII sheet per dependency, sized against a measured bundle baseline, with one owner per element class | **Yes** — it authorizes new dependencies |
| C-3 | Lenis is optional; native scrolling is the baseline and activation follows mobile, keyboard, accessibility and performance testing | The atmosphere is cinematic but restrained (`reference/Noujoude_Master_Specification_EN.md` §12.1, lines 1660–1667) and reduced motion cannot be disabled by branding settings (§16.3, line 2365) | Risk of an unneeded engine | Default: do not install Lenis; re-open only if a measured scroll-jank problem survives the other fixes | No — propose and record |
| C-4 | Exact HEX plus semantic tokens at full AA contrast | The twelve values are the proposed canonical baseline subject to formal approval (`reference/Noujoude_Master_Specification_EN.md` §12.2, lines 1668–1670) and BA-002 is pending | Approval state | Implement tokens marked `proposed`, publish per-pair contrast measurements, and let brand adoption flip the state. No dimension-02 or 04 pass before BA-001 and BA-002 close | **Yes** |
| C-5 | Structured data that is accurate and source-backed | `reference/Noujoude_Master_Specification_EN.md` §19.11 (lines 2993–3000) and G.9 (lines 3842–3858) forbid fabricated structured data, and no institutional facts have been supplied | Missing input | Ship only non-fact-bearing schema — WebSite, BreadcrumbList, localized OG — and withhold Organization or LocalBusiness claims until §21.1 (lines 3178–3191) closes | **Yes** |
| C-6 | Every page must clearly belong to Noujoude, including through its imagery | 0 of 82 assets cleared and 0 approved; STT-002 bars uncleared media from public serving (`reference/Noujoude_Master_Specification_EN.md` §20.4, line 3086) | Content blocker | Composition work proceeds on layout; every image slot is a rights-gated placeholder that cannot be published | **Yes** — B-06 |
| C-7 | Type as a first-class design dimension | `reference/Noujoude_Master_Specification_EN.md` §12.5 (lines 1712–1732) fixes Cormorant Garamond, Inter and Tajawal by role and bars an English display face for Arabic; line 1725 requires licence verification before deployment; zero font files exist | Unverified input | A font ADR plus a self-hosted file inventory with licence evidence before any typographic pass | **Yes** — OID-18, BA-003 |
| C-8 | The admin interface must not inherit unnecessary cinematic decoration | Agrees: `reference/Noujoude_Master_Specification_EN.md` §12.14 (lines 1823–1827) and §15.4 (lines 2152–2165) | No conflict | Record as alignment and cite both sections | No |
| C-9 | Five QA statuses: PASS, FAIL, NOT TESTED, BLOCKED, NOT APPLICABLE | The register has five different statuses and the gates have Passed and Open | Vocabulary | Keep both; publish a mapping table and forbid one status from silently implying the other | No |
| C-10 | A weighted score out of 100 | Acceptance is per-requirement evidence (`reference/Noujoude_Master_Specification_EN.md` §20.1, lines 3003–3006) and gates need recorded evidence with a named approver | Measurement semantics | The score is a reporting overlay; a gate record and a score are independent and the score never opens a gate | No — but it must be adopted |
| C-11 | A clean `format:check` inside the reliability dimension | **As recorded on 1 November:** `docs/MASTER_SPECIFICATION.md` is inside Prettier's scope and is the anchor for 533 citations — hole H-13, `docs/IMPLEMENTATION_PLAN.md` §8. **That structural cause is closed by execution as at 2 November 2026** | Tool conflict — **cause closed, result still red** | The blocker was closed on 2 Nov 2026: the Owner's directive authorized exactly the `.prettierignore` correction and nothing else, `docs/` is excluded at `.prettierignore` line 40, `prettier --file-info` on `docs/MASTER_SPECIFICATION.md` reports the file ignored, and `pnpm format:check` now lists **25** files with **none** under `docs/` (measured 0 of 25), against the **103** files in scope before the two authorized additions. **This row is not green.** `pnpm format:check` still exits **1**, because the Owner forbade broad reformatting and the 25 remaining files are hand-written tooling and configuration that this batch may not reshape — the row's structural cause is gone, its measured failure is not | **Granted** — OD-12, executed 2 Nov 2026 |
| C-12 | Lint as an operational-reliability gate | `eslint.config.mjs` imports `@eslint/js`, which no manifest declares, so `pnpm lint` exits 2 | Missing dependency | Declare the package under a Part VII sheet; until then the lint gate is unavailable, not passing | **Yes** — OD-11 |
| C-13 | Automated accessibility checking | Vitest looks for a11y specs under one path, Playwright's `testDir` is another, `test:a11y` greps a tag nothing applies, and `scripts/tests/*` sits outside every Vitest include glob | Wiring defect | Reconcile the three before the first a11y spec, or the run will be green on nothing | No |
| C-14 | Reproducible builds | `.github/workflows/ci.yml` pins Node `24.22.2` at line 59 while the verified host is v24.22.1 | Drift inside the allowed range | Align the pin with the verified host or document the difference; both satisfy `>=24.22.1 <25` | No |
| C-15 | Stale self-descriptions | `ci.yml` header lines 6–10 still assert that no Git repository and no lockfile exist; `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §9 still cites blocker B-01 for a missing `node_modules`; `docs/REQUIREMENTS_TRACEABILITY.md` row REQ-TEST-002 at line 487 carries the superseded tally 23/5/167/20/4 against §1's 24/8/166/19/4 — and this very citation drifted when REQ-BRAND-007/008 were added on 2 November (478 → 487), which is the maintenance property C-15 describes | Documentation drift | Corrected in Phase 2 as a labelled evidence-propagation batch; listed here rather than edited now | No |
| C-16 | AI safety wiring | `.env.example` line 58 sets `AI_CURATOR_ENABLED=true` directly under its own comment naming it the kill switch, while the AI document's gate G7 requires the flag to be consumed by retrieval | Default-on defect | Ship the default off until the retrieval-layer consumer and the red-team suite exist | No — but flag it |
| C-17 | Where AI red-team tests live | `docs/REQUIREMENTS_TRACEABILITY.md` row REQ-AI-010 plans one path while `docs/AI_CURATOR_GOVERNANCE.md` §7 plans another | Naming | Choose one in the Phase 2 test plan and cite it in both | No |
| C-18 | Security benchmark wording | The mandate names OWASP Top 10:2025; the repository names ASVS 5.0.0 Level 2 only — a repo-wide search for any Top 10 form returns zero hits | Reference gap | Add a Top 10:2025 mapping column to the existing security document rather than creating a second one | No |

---

## 10. Missing-evidence inventory

| Evidence class | Exists? | Why not | Earliest honest production |
|---|---|---|---|
| Rendered page for visual inspection | No | No application | Phase 2, first vertical slice |
| Lighthouse or lab CWV numbers | No | Nothing to serve, and no Lighthouse step exists in `ci.yml` | Phase 3, after the first real route |
| Real-user field CWV | No | No deployment and no analytics vendor (B-05) | Only after an approved production target |
| Route-level bundle and asset budgets | No | The mandate requires budgets set *after* measuring a real baseline; there is none | Phase 3 |
| Contrast measurements in context | Partial — computable on paper | No rendered surfaces | Phase 2 |
| Keyboard and screen-reader sessions | No | No components | Phase 3 |
| RTL rendering evidence | No | No locale mechanism and no Arabic font file | Phase 3 |
| Permission positive and negative results | No | The 240-cell matrix is contract only; the 14 privilege cases ran against a disposable container, which the security document itself says is not a pass here | Phase 4 |
| Session, cookie, header and CSP behaviour | No | No server, and no CSP directive set is drafted anywhere | Phase 4 |
| Upload validation and magic-byte enforcement | No | Controls M-01–M-11 are contract; the one measured magic-byte finding came from the Phase 0 file audit | Phase 4 |
| Secret-scanning output | No | Declared absent in `ci.yml` job 4 and never implemented | Phase 4, and it needs a seeded false positive to prove it bites |
| Dependency audit result | No | The `pnpm audit` step is authored but has never executed | Immediately once CI can run (B-08) |
| Backup and restore test transcript | No | No backup exists and no restore has ever run; the security document's §11 says a successful job is not proof of recoverability | Phase 4, needs B-05 |
| Security headers in a real response | No | No HTTPS and no host | Phase 4 |
| Asset rights clearance | No | 0 of 82; the Owner has not supplied them | Blocked — B-06 |
| Approved brand files and font licences | No | BA-001–BA-003 pending | Blocked — OID-18 and brand approval |
| Independent security assessment | No | None commissioned; the mandate forbids claiming certification without one | Post-launch unless the Owner engages an assessor |
| CI run transcript | No | Zero runs and no remote | Blocked — B-08 |

---

## 11. Owner decisions and blockers required to leave Phase 1

Blockers inherited and unchanged: **B-05** storage, AI provider, hosting, SMTP and backup vendor (blocks the media pipeline, field performance, backups and AI); **B-06** asset rights and curatorial approvals (blocks all public imagery and dimension 11); **B-08** CI remote and runner (blocks every automated gate, the dependency audit, and any no-unresolved-High claim); **OID-18** font licences and deployment source. Twenty of the twenty-two Owner input rows remain Outstanding; OID-20 is accepted as internal targets only and OID-22 is approved in principle with nothing waived.

New decisions this mandate makes unavoidable, each small and each explicitly a permission rather than a suggestion:

| ID | Decision | Why it needs the Owner | Consequence if deferred |
|---|---|---|---|
| OD-8 | Approve or amend the acceptance framework, including whether the weighted score is reporting-only | It changes how every future claim of progress is recorded | Scores would be quoted with no agreed meaning |
| OD-9 | Authorize the CSS and design-token approach as an ADR with a dependency sheet | It adds bytes to every route and fixes how tokens become real artefacts | Dimensions 03, 04 and 05 stay unimplementable |
| OD-10 | Authorize the motion engine set — GSAP and/or Motion — with per-dependency sheets, or direct a CSS-only Phase 2 | Part VII states the mandate does not authorize uncontrolled dependency installation | The motion dimension cannot start, and an ad-hoc choice risks arriving later without review |
| OD-11 | Authorize `@eslint/js` as a devDependency so the lint gate can run | It adds a declared package | The reliability dimension keeps a gate that cannot execute |
| OD-12 | Authorize the one-line `.prettierignore` addition for the generated specification copy (H-13) — **granted by the Owner on 2 November 2026 and executed the same day, as the only correction the directive authorized** | It changes project configuration that protects 533 citations | **No longer a deferral risk — the exclusion is in force and measured.** `.prettierignore` line 40 holds `docs/`; `prettier --file-info` on `docs/MASTER_SPECIFICATION.md` reports that file ignored, and `eslint.config.mjs` reports not ignored, which is the proof the rule bites rather than the whole tree being clean; `pnpm format:check` reports **25** files of which **0** are under `docs/`, down from the **103** files in scope before the two authorized additions (`brand/` and `docs/`). What the grant did **not** buy is a green format gate: `pnpm format:check` still exits **1** over the 25 hand-written tooling and configuration files, because the Owner forbade broad reformatting and the residual is recorded as an open item rather than formatted away |
| OD-13 | Decide Rare Pieces: a new route with an amendment, or an editorial treatment of Collections | C-1 is a scope question, not a design question | A page built outside the navigation contract |
| OD-14 | Direct the disposition of the untracked `brand/` tree: catalog it with provenance, quarantine it, or leave it | It is a derivative redraw of an uncleared asset and must not be promoted silently | A draft risks being read as approved brand material |
| OD-15 | Confirm the document plan in §13, including extending the security document instead of creating a second one | Part V requires inspecting before creating, and this is the one place an existing document already serves | Two competing security plans |
| OD-16 | Supply or waive BA-001–BA-007 — brand files, palette approval, font licence, component tokens | The brand and colour passes depend on it | Dimensions 02 and 04 cap below 60 under the framework's cap rules |

---

## 12. Readiness readings at Phase 1 close

The full model, the caps and the arithmetic live in `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md`. The honest headline readings, computed under that model against today's evidence:

| Axis | Reading | Basis |
|---|---|---|
| Specification completeness | **High** | Thirteen of thirteen dimensions are specified or constrained by the adopted baseline |
| Implementation completeness | **0** | No route, component, token file, stylesheet, font file, migration or collection exists |
| Verification completeness | **Documentation-grade only** | 146 gate assertions and the Phase 0 asset and privilege measurements are real; none of the 60 rows of the specification's acceptance matrix has product evidence |
| Composite weighted score | **Cannot be nonzero where an artefact is required** | Dimensions 02–12 have no implementation and no verification, so both artefact-bearing axes score 0 for each; the 24 `Implemented and Verified` register rows are documents, CSV measurements and one host version reading |
| Production acceptance | **Not reachable, and no rule in the framework pretends otherwise** | Three open blockers, twenty open Owner inputs, 0 of 82 rights cleared, 0 CI runs, 0 restore tests, no rendered page |

What this run adds to the project's records: the four audits behind it, the conflict register above, and a scoring discipline that keeps a well-written specification from being mistaken for a built museum.

**Re-measured on 2 November 2026 by the closure batch, which moved one axis of the table above and none of its conclusions.** `Implementation completeness = 0` was the reading against an empty `src/`; the measured value now is **31 code-and-style files / 1,752 lines** (18 `.tsx`, 8 `.ts`, 5 `.css`), 15 canonical routes plus the generated not-found built and served over HTTP with `<html lang="ar" dir="rtl">` observed in the Arabic response. So the honest present-tense reading of that axis is **a typed, built, served shell with a real domain layer**, not zero and not a product. It is still not a pass on any artefact-bearing dimension: no migration, no collection, no database access, no content record, no Control Center, no AI surface, 0 of 82 rights cleared, 0 CI runs, 0 restore tests and 0 measured CWV. The composite score and the production-acceptance row are unchanged by that correction — the framework's own rule is that a green build over a shell is evidence about the shell — and Level B, which tracks Standard §12 in `docs/IMPLEMENTATION_PLAN.md` §4B, moved from **0 of 12** to **3 of 12** (rows 2, 3 and 9) on local exits while the §12-in-CI requirement that Gate 5 actually cites remains unmet.

---

## 13. Exact document changes proposed for Phase 2 (nothing executed by this run beyond the two Phase 1 files)

| Target | Action | Reason |
|---|---|---|
| `docs/DESIGN_SYSTEM.md` | **Create** | Named deliverable; nothing in the repository holds tokens, contrast data, component inventory or type-scale artefacts. It must carry `proposed` states until BA-001–BA-004 close |
| `docs/MOTION_SYSTEM.md` | **Create** | Named deliverable; §12.13 (lines 1805–1822) fixes effects and reference durations but no scene specifications, no token map and no engine ownership |
| `docs/PERFORMANCE_BUDGET.md` | **Create** | Named deliverable; thresholds exist at §19.6 (lines 2932–2943) but route-level budgets require a measured baseline first, so the file opens with an empty budget table marked `awaiting baseline` |
| `docs/SECURITY_VERIFICATION_PLAN.md` | **Do not create. Extend `docs/SECURITY_AND_PERMISSIONS.md` with a new §16 carrying test-case IDs, exit criteria and the Top 10:2025 mapping** | The existing document already performs that function — its §3 test inventory, §7 ASVS mapping and §13 gate list — and Part V forbids a competing copy |
| `docs/VISUAL_QA_MATRIX.md` | **Create** | Named deliverable; no per-page visual acceptance record exists |
| `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` | **Created by this run as a proposal** | The mandate requires a consolidated framework and no existing document defines a 13-dimension or weighted model |
| `docs/REQUIREMENTS_TRACEABILITY.md` | **Add mapped acceptance rows** in the framework's ID scheme, plus the C-15 corrections | Acceptance rows must resolve into the register, not sit beside it |
| `docs/IMPLEMENTATION_PLAN.md` | **Add the Phase 2–6 entry criteria from the framework and register C-11 and C-12 as explicit prerequisites** | The plan owns gates and phases |
| `docs/CHANGELOG.md` | **Record this deliverable pair** | Every batch is recorded there |
| `docs/ARCHITECTURE.md` | **Update the documentation map** and open the missing ADR slots: styling, fonts, motion, locale routing, security headers | Its document map currently lists twelve `docs/` files; the five ADRs named do not exist |
| New ADRs | **Propose, do not write yet:** styling approach and tokens; font loading and licensing; motion engine set; locale routing; security headers and CSP | Each is a decision, not an implementation detail, and none may be back-filled after the code exists |

Two mechanical notes the Owner should see before approving file creation. Adding these two documents moves the gate output from 12 markdown files to 14; the historical transcripts that say 12 remain true as dated measurements, and the project's existing rule — read the printed number, never a quoted one — is what absorbs that. Every new table must satisfy the three structural rules or `verify-tables` exits 1, and every verbatim quotation must carry an honest line reference or `verify-citations` exits 1. Both gates were run against the pair written here; the results are in §15.

---

## 14. Measurement log for this run

| Command or method | Result | Exit |
|---|---|---|
| `node -v`, `pnpm -v`, `git -v` | v24.22.1, 11.21.0, 2.56.0.windows.2 | 0 |
| `git log --oneline`, `git remote -v`, `git status --short` | 2 commits, no remote, one modified generated artifact and the untracked `brand/` | 0 |
| `find src -type f`, `find tests -type f` | one file each — `src/README.md` and `tests/setup/env.ts` | 0 |
| Repo-wide search for `*.css`, `tokens*`, `woff`, `woff2`, `ttf`, `otf` | zero files | 0 |
| Repo-wide search for any OWASP Top 10 form | zero hits | 0 |
| Offset check, eleven spec anchors in both `reference/` and `docs/` copies | 128-line difference confirmed at every anchor | 0 |
| `node scripts/verify-citations.mjs` before this run's writes | 12 files, 533 fragments, 0 defects, 1,247 bare references resolve | 0 |
| `node scripts/verify-tables.mjs` before | 199 tables in 12 markdown files | 0 |
| `node scripts/preflight.mjs` before | 10 checks, 0 FAIL, 2 WARN, 8 PASS | 0 |
| Direct reads of §4.2, §10.5, §12.1–12.14, §15.4–15.6, §16.3, §19.3–19.11, §20.1–20.4, §21.3, §A.2 and §G.6, plus the CI, Playwright, Vitest and manifest files | Every line number above comes from these reads, not from memory | 0 |
| Gate run after this file was written | 5 actionable defects found and fixed — 4 citation-form defects and 1 unverifiable quotation — then a clean run | 1, then 0 |

The defect detail is worth recording because it is a finding about the gates, not just about this file. The first draft cited the specification by *working-copy* line numbers; the citation gate resolves `§section, line N` citations against the read-only source in `reference/`, so four of them were reported as section mismatches and one as a blank target, and a quotation of the mandate's own words was reported as NOT_FOUND against the requirement sources. All five were corrected by converting to source numbering with the measured 128-line offset and by putting the mandate's wording in a code span. The gate caught this; nothing was waved through.

---

## 15. Post-write verification

Recorded after both Phase 1 documents were complete and the gates were re-run over the whole `docs/` set. Values are transcribed from that run, not predicted. Both files were new, so the markdown count moved 12 → 14; the fragment count stayed at 533 because the framework document cites sections and ranges rather than re-quoting requirement text, and the bare-reference count rose from 1,247 to the final figure in the table below as their citations were resolved. **The first four rows are that batch's record and are kept unchanged. The rows added beneath them are the 2 November 2026 closure re-run and are the latest recorded readings; where the two differ, the difference is the edits written since, plus one table defect in a file this batch does not own.**

| Command, run after both Phase 1 documents were written | Measured output | Exit |
|---|---|---|
| `node scripts/verify-citations.mjs` | 14 markdown files, 533 quoted fragments: VERIFIED 427, SELF_RECORDING 10, PROJECT_RECORD 10, DEFINED_TERM 6, NO_LINE_REF 86, LINE_OFF 0, LINE_OFF_OTHER_SOURCE 0, NOT_FOUND 0; BARE REFERENCES 1,407 checked, 0 defects; `CITATION GATE PASSED`; rewrote `docs/CITATION_VERIFICATION.json` | 0 |
| `node scripts/verify-tables.mjs` | `OK: 226 tables in 14 markdown files, each with a header, a delimiter row and a uniform column count` | 0 |
| `node scripts/preflight.mjs` | 10 checks: 0 FAIL, 1 WARN, 9 PASS | 0 |
| `pnpm test:gates` | 7 suites — 14, 22, 23, 25, 32, 19 and 11 assertions, `0 failed` in every one (146 total) | 0 |
| Independent endpoint audit of every `lines A–B` citation in the two new files against the real heading boundaries in `reference/` | 7 corrections across 5 over-inclusive ranges — see the paragraph below | 0 defects remain |
| `node scripts/verify-citations.mjs` — **2 November 2026 closure re-run; a reading taken mid-window, since superseded** | Two passes minutes apart, both printed because documents outside this batch were being edited while it worked. Pass 1: 14 markdown files, 545 quoted fragments carrying a line reference (22 quoted strings shorter than 3 tokens skipped) — VERIFIED 434, SELF_RECORDING 10, PROJECT_RECORD 10, DEFINED_TERM 6, NO_LINE_REF 91, LINE_OFF 0, LINE_OFF_OTHER_SOURCE 0, NOT_FOUND 0; BARE REFERENCES 1494 checked, 0 defects. Pass 2: 543 fragments, VERIFIED 433, PROJECT_RECORD 9, NO_LINE_REF 91, the rest equal; BARE REFERENCES 1505 checked, 0 defects. `CITATION GATE PASSED` on both; rewrote `docs/CITATION_VERIFICATION.json`. The batch's final run, after every register and plan row had landed, printed 542 fragments, VERIFIED 433, SELF_RECORDING 10, PROJECT_RECORD 9, DEFINED_TERM 6, NO_LINE_REF 90 and 1,503 bare references with 0 defects, exit **0**, and that reading is the one recorded in `docs/PHASE01_CLOSURE.json` | 0 both |
| `node scripts/verify-tables.mjs` — **2 November 2026 closure re-run; a reading taken mid-window, since superseded** | `OK: 234 tables in 14 markdown files, each with a header, a delimiter row and a uniform column count`. **Mid-batch reading kept as the defect record:** the same gate exited **1** at 233 tables on one malformed row of a register table in `docs/IMPLEMENTATION_PLAN.md` — a file this batch may not edit — whose author repaired it before this pass. It exited **1** again at 238 tables on three more malformed rows, two of them this report's own register rows in `docs/REQUIREMENTS_TRACEABILITY.md`, repaired by rewriting those rows so no cell carries an unescaped pipe inside a code span; the batch's final run prints **238** at exit **0**, and that reading is the one recorded in `docs/PHASE01_CLOSURE.json` | 1, then 0 |
| `pnpm test:gates` — **2 November 2026 closure re-run** | 7 suites — `14 · 0 failed`, `22 · 0`, `23 · 0`, `25 · 0` with `0 skipped`, `32 · 0`, `19 · 0`, `11 · 0` — 146 assertions, none failed. **Mid-batch it exited 1 on `22 passed, 1 failed`**, the citation suite refusing the real `docs/` set while the two foreign defects above were live; that red is recorded rather than hidden and this row is the re-run after the other authors landed their repairs | 1, then 0 |
| `pnpm typecheck` · `pnpm test` · `pnpm lint` · `pnpm format:check` · `pnpm audit --audit-level=high` — **executed 2 November 2026 by the closure batch; the paragraph below this table no longer describes them as unrun** | typecheck exit **0**; test exit **0** with 4 files and 34 assertions; lint exit **0**; format:check exit **1** with **25** files listed and **0** of them under `docs/`; audit exit **1** with **15** vulnerabilities (4 low, 5 moderate, 3 high, 3 critical). `pnpm build` was **not** re-run by this batch — another process owns it — and its 2 November exit **0** over 16 routes is read from `docs/ROUTE_RUNTIME_EVIDENCE.txt`, not claimed here | 0 · 0 · 0 · 1 · 1 |
| `node scripts/verify-citations.mjs` · `node scripts/verify-tables.mjs` · `node scripts/preflight.mjs` · `pnpm test:gates` — **2 November 2026, closing re-run taken after the §4, §3 and §9 corrections in `docs/TEST_AND_RELEASE_REPORT.md` were written; the latest recorded reading of all four** | Citations: 14 markdown files, **542** quoted fragments carrying a line reference — VERIFIED 433 + SELF_RECORDING 10 + PROJECT_RECORD 9 + NO_LINE_REF 90 = 542, with LINE_OFF 0, LINE_OFF_OTHER_SOURCE 0 and NOT_FOUND 0; bare references **1503 checked, 0 defects**. Tables: `OK: 238 tables in 14 markdown files`, the count rising from 234 as the parallel batches added rows. Preflight: `10 checks: 0 FAIL, 1 WARN, 9 PASS`, the surviving WARN being the `Noujoude.photo/` reconciliation reserved to the Owner (B-06). `test:gates`: seven suites, **146 assertions**, `0 failed`. **Both gate counts moved again between the readings above and this one, which is the documented behaviour of a concurrently edited `docs/` set — read the number the command prints today.** `pnpm build` and `pnpm start` were again not executed by this batch | 0 · 0 · 0 · 0 |

The surviving preflight WARN is the `Noujoude.photo/` reconciliation row, unchanged and unchangeable by this batch: 1 image file with no catalog row, 2 non-image files not catalogued, 1 `WRONG_FORMAT` (`.jpg` holding `image/webp`), 18 `NAME/PIXEL` mismatches, catalog rows 82 against physical files 85. That is B-06, the Owner's asset-governance work. The §2 "before" reading showed 2 WARN because the container engine was cold at that moment; `docs/IMPLEMENTATION_PLAN.md` §0 records the warm/cold pair (`0 FAIL, 1 WARN, 9 PASS` and `0 FAIL, 2 WARN, 8 PASS`, both exit 0) as an engine-temperature fact, so the difference between the two rows in this file is not a state change and is not reported as one.

The endpoint audit found a class of defect that the citation gate does not currently police. A span citation such as `§6.1–§6.14 (lines 542–898)` passes the gate, but 897 is the heading line of §7, so the range reached into the next section; the measured end of §6.14 is 896. The same held for `§13 (lines 1829–1946)` (§14 begins at 1945; true end 1944), `§10 (lines 1436–1524)` (§11 begins at 1522; true range 1434–1521), `§15 (lines 2120–2258)` (§16 begins at 2257; true end 2256) and `§6.14 (lines 876–898)`. All seven occurrences were corrected to the measured boundaries and both files re-verified clean. The finding for the Owner is that the gate validates a citation's section identity and its quoted text, not the upper endpoint of a multi-section span, so span ranges need either a human endpoint audit — the one performed here — or a gate extension in a later phase. Nothing in this repository's earlier Phase 0/1 evidence was rewritten to apply that rule, because doing so would edit evidence outside this batch's scope.

Not run by the discovery batch, and therefore not claimed by it: `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` were not re-executed in that batch, so no exit code was asserted for them in §2; no application test, render, screenshot, accessibility run, performance measurement, restore test or deployment was performed by it; no remote was contacted and nothing was pushed; `reference/`, `Noujoude.photo/` and the 82-row asset register were read only. **That paragraph was accurate as a scope statement and wrong as a state statement — its last clause pointed at §2 readings the 2 November execution had already overtaken.** Corrected by the closure batch: `typecheck`, `lint`, `test`, `format:check` and `audit` were all executed on 2 November and their exits are recorded in §2 and §15 above; `build` was executed by a different batch the same date and its transcript is `docs/ROUTE_RUNTIME_EVIDENCE.txt`, not claimed here. Still not performed by any batch, and still not claimed: an accessibility run, a performance measurement, a restore test, a migration, an E2E journey, a secret scan, and any CI run — the remote still does not exist and CI's run count is still zero (B-08).

**Why the two paragraphs above were rewritten in place instead of appended as new rows, and why §16 exists at all.** A `line N` citation in another document is addressed to this file's physical line count, so every line this batch inserted near the top silently re-points citations written by other authors. Three such citations exist against this file today — `docs/ARCHITECTURE_DECISIONS.md` lines 936 and 997 (this file's line 85) and line 1014 (line 170), plus line 1071 (line 171) — and the closure batch therefore made every correction above line 171 **line-count neutral**: readings were replaced inside the same cell or appended to the same paragraph line, and the only superseded-register correction that could not fit that rule was moved here. The invariant was verified after the edits by re-locating the three cited passages, which still sit at 85, 170 and 171; had this batch instead added rows to the §2 table, the citation gate would have reported a foreign file as defective because of a local edit.

## 16. Dated correction to the §7 gap register (2 November 2026 closure batch)

The §7 register was written against an empty `src/` and four gates that could not go green over real code; six of its cells are no longer current readings. What changed, each with the command that shows it: `src/` is not empty — **32 files / 31 code-and-style files / 1,752 lines**, and `pnpm build` exits **0** over 16 routes with `pnpm start` answering HTTP probes, which closes dimension 13's blocker cell and dimension 03's *nothing rendered* premise at shell level only (`docs/ROUTE_RUNTIME_EVIDENCE.txt`). `pnpm lint` exits **0**, so dimension 07's *`lint` cannot run at all* and conflict C-12's premise are gone, `@eslint/js` having been declared. `pnpm typecheck` exits **0** over a program that now contains **26** `.ts`/`.tsx` files under `src/`, so it is no longer the hollow exit this register flagged. `pnpm test` exits **0** with **4 files / 34 assertions** under `src/domain/`, so dimension 10's *0 application tests* is superseded. `pnpm audit --audit-level=high` **has** now executed — exit **1**, **15** vulnerabilities (4 low, 5 moderate, 3 high, 3 critical) — so dimension 01's *never executed* is replaced by a real, unremediated security finding registered as blocker **B-11**. Dimension 04 is half-superseded: **5 CSS files** exist and `src/ui/styles/global.css` carries **50** `--ndm-*` custom properties holding the §12.2 palette as `proposed`, so *zero CSS files* is no longer true, while still no adopted token artefact, no licence-verified font and no contrast measurement in a rendered page exists — BA-002 and OID-18 still cap it.

**What none of this changes.** Dimensions 02, 06, 08, 09, 11 and 12 gained no artefact; no rights clearance arrived (0 of 82); no migration, collection, database access, Control Center, AI surface or content record exists; and CI has never run, so no cell in the *Evidence available today* column became a pass by execution. The three green Standard §12 rows are green **locally, on this host, with recorded exits**; Level B is **3 of 12**, not 12 of 12, and Gate 5 — whose evidence line is §12 green **in CI** — is unchanged and closed.
