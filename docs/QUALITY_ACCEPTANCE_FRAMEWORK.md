# NOUJOUDE DIGITAL HERITAGE MUSEUM — master quality acceptance framework

Document ID: `NDM-QAF-001` · Version: `0.2.0` · Date: 2 November 2026
Author: Qoder (working agent) · Requesting authority: the Owner's `MASTER DESIGN, MOTION, SECURITY & ENGINEERING QUALITY MANDATE` (2 November 2026), Part III and Part V
Approving authority: the Owner's `FINAL OWNER DIRECTIVE — PHASE 0 & PHASE 1 CLOSURE → PROFESSIONAL MOTION PHASE` (2 November 2026), §1 and §2
Status: **ADOPTED — conditional.** The Owner's §1 authorises adoption *after* the ten named logical and mathematical defects are corrected, and §2 names the corrections. They are applied in this version: the credit formula (§3.1), the cap arithmetic (§3.3 and §3.5), the security waiver (§3.3 CAP-3, §7), the reduced-motion example (§3.4), the responsive specification/verification split (§2 and §3.3 CAP-6), the B-08 wording (§2, §9.1 and §10), the A.5 evidence label (§3.5 and §11), the anti-gaming rule (§3.3 CAP-9), the four acceptance levels (§7A) and the blocker reconciliation (§10). The provisional score is recalculated at §9 under the corrected formula and is **not** raised by anything except evidence that actually changed.

Companion: `docs/PHASE1_DISCOVERY_AND_READINESS.md` — the discovery report this framework is built on. That document holds the evidence, conflicts and blockers; this one holds the model, the weights and the rules for scoring.

---

## 0. What this framework is, and what it may never be used for

| It is | It is not |
|---|---|
| A single consolidated statement of the thirteen quality dimensions, their weights, their acceptance requirements, their statuses and their evidence rules | A replacement for the Master Specification, which remains the requirement authority and is unchanged by this document |
| A reporting overlay that makes progress comparable across dimensions and across time | A gate. Gate passage is governed by `docs/IMPLEMENTATION_PLAN.md` §4A (lines 340–355) and requires recorded evidence with a named approver |
| A machine for refusing to average away blockers | A route to a comfortable number. Under its own rules the project today scores single digits, and that is the correct reading |
| An adopted measuring instrument, adopted conditionally by the Owner on 2 November 2026 on condition that its arithmetic is honest | An approval record for anything except its own scoring rules. It approves no gate, no deployment and no content; §7A says which level a published number speaks to |

The governing rule it implements, quoted from the adopted baseline: `reference/Noujoude_Master_Specification_EN.md` §20.1 (lines 3003–3006) states that a requirement is not complete because it is described, shown in a mock-up, or partially represented in source code, and is accepted only when implemented behaviour satisfies its acceptance criteria and the evidence is recorded. Every scoring rule below is a mechanical expression of that sentence.

**Citation convention.** Line numbers against the Master Specification are lines of `reference/Noujoude_Master_Specification_EN.md`, the read-only source. The generated working copy is 128 lines longer; the offset was measured anchor-by-anchor in this run and is recorded in `docs/PHASE1_DISCOVERY_AND_READINESS.md` §0.

---

## 1. Three completeness axes, published separately

No single number may be reported for a dimension. Three are reported, and they are never collapsed.

| Axis | Question it answers | How a row earns it | What can never earn it |
|---|---|---|---|
| **S — specification completeness** | Is the requirement fully and unambiguously decided by the governing baseline? | The baseline fixes the value, the behaviour and the acceptance condition, with no open Owner input | A requirement that is described but whose deciding input the Owner has not supplied; that is a specified *question*, not a specified answer |
| **I — implementation completeness** | Does the artefact exist in the product? | Code, token file, component, route, migration, configuration or content record that performs the requirement | A document, a plan, a mock-up, an ADR, a screenshot of something else, or a placeholder |
| **V — verification completeness** | Has the implemented behaviour been tested and recorded? | A named test method, executed, with actual output, a date, an environment and a resolvable evidence path | An assertion of intent, a config file that has never run, a passing run against an empty set, or a lab result claimed as field data |

Two hard rules follow. **Rule A — the documentation ceiling:** a row with I = 0 can never be PASS, no matter how strong its S is, and no dimension score may be reported as though documentation raised it. **Rule B — the vacuity bar:** a test that cannot fail — an empty grep, an assertion over zero records, a green run against a database with no tables — scores V = 0 and is recorded as a defect against the test, not a pass for the product. This project has already been caught producing a hollow green `typecheck` over nineteen files with `checkJs` off, so the rule is not hypothetical.

---

## 2. The thirteen dimensions

Weights are the mandate's, reproduced without change and summing to 100. Each row lists the baseline that already governs the dimension, the acceptance requirement series this framework will use, the verification methods that are admissible, and the condition that caps the dimension regardless of its arithmetic.

**Cap notation (corrected defect 7).** Every cap is stated as a fraction of that dimension's own weight: `A_d ≤ k_d × W_d`, with the numeric ceiling written out. A cap that has no number is not a cap; it is a sentence. The rule that produces each `k_d`, and the action that releases it, are in the cap register at §3.5. Clauses that are *admissibility* rules (what evidence counts) or *status* rules (what a blank means) are not written as caps here; they live in CAP-5, CAP-6 and §4.

| ID | Dimension | W | Governing baseline (source lines) | Requirement series | Admissible verification | Cap condition while status quo holds |
|---|---|---:|---|---|---|---|
| QA-01 | Security and protection | 15 | `reference/Noujoude_Master_Specification_EN.md` §19.3–19.5 (lines 2880–2931); ASVS 5.0.0 Level 2 target at §19.4 (lines 2908–2913); gate rows SEC-001–SEC-006 (lines 3104–3109); `docs/SECURITY_AND_PERMISSIONS.md` §2, §6, §7, §10, §11, §13 | `QA-01-nnn` | Executed negative and positive authorisation tests, header and session capture from a real response, upload rejection transcripts, dependency and secret scan output, incident-detection proof | Capped: `k=0.20`, `A_01 ≤ 0.20 × 15 = 3.0` while no control has been exercised against a running application. The reason is precise, because an earlier wording was not: local automated gates **do** execute (seven regression suites, 146 assertions, exit 0; preflight and the document gates exit 0). What has not executed is the CI pipeline, and no authorisation, session, header or upload control has met a live application |
| QA-02 | Brand identity | 9 | §12.7 (lines 1745–1765); §16.3 (lines 2343–2376); G.6 (lines 3746–3765); §A.2 (lines 3323–3339); VIS-001 (line 3087) | `QA-02-nnn` | Rendered inspection of every surface against the approved files; token-to-file traceability | Capped: `k=0.50`, `A_02 ≤ 0.50 × 9 = 4.5` while BA-001 is pending and 0 of 82 assets are approved. The quarantined `brand/` tree earns nothing here: under §3.3's admissibility note, unapproved derivative material is not brand implementation, and the Owner's directive keeps it preserved and unadopted |
| QA-03 | Visual design and composition | 9 | §12.1 (lines 1660–1667), §12.9–12.14 (lines 1772–1827); per-page orders in §6.1–§6.14 (lines 542–896) | `QA-03-nnn` | Rendered page inspection, per-page storyboard versus actual, side-by-side locale comparison | Capped: `k=0.00`, `A_03 ≤ 0.0` until a rendered page exists. Visual claims from code alone are inadmissible (CAP-5), so no amount of specification strength moves this row |
| QA-04 | Colour and material | 6 | §12.2–12.4 (lines 1668–1711); §12.8 (lines 1766–1771); VIS-002 (line 3088) | `QA-04-nnn` | Measured contrast per token pair in real context, distribution audit per page, material asset inspection | Capped: `k=0.30`, `A_04 ≤ 0.30 × 6 = 1.8` while the palette is `proposed` (BA-002) and no token artefact exists. `k` is the integer fraction `(rows not dependent on BA-002) / N_04 = 3/10` (§3.5) |
| QA-05 | Motion design | 9 | §12.13 (lines 1805–1822) including the timing table (lines 1813–1819) and the reduced-motion rule (line 1821); §16.3 (line 2365); §19.8 (line 2957) | `QA-05-nnn` | Scene-by-scene review against the 24-field specification, reduced-motion run, jank and cleanup checks on unmount | Capped: `k=0.00`, `A_05 ≤ 0.0`. The reason changed and the number did not. OD-10 is now closed — GSAP for cinematic timelines and scroll scenes, Motion for React component interactions, CSS for simple transitions, Lenis deferred — so this cap is no longer an undecided-Owner-input cap; it is CAP-1 (`V_05 = 0`) plus CAP-5: no motion artefact exists and nothing has been rendered. The per-page scene specifications remain the open work, and they were written on 2 Nov 2026 in `docs/MOTION_SYSTEM.md` §6 — which moves nothing here, because no artefact animates and CAP-5 still requires the rendered inspection. **Traceability defect registered in that document and credited here:** this row's test method names a 24-field specification, and that field list is transcribed nowhere in `docs/` or `reference/`; a search returns this one mention. `docs/MOTION_SYSTEM.md` §7 supplies a twelve-field operational subset and says so, rather than presenting twelve as twenty-four. Until the Owner's list is supplied, the method column of this row cannot be quoted as satisfied |
| QA-06 | Performance | 9 | §19.6 (lines 2932–2943) with required test surfaces (line 2942); §19.7 (lines 2944–2954); NFR-001 (line 3110) | `QA-06-nnn` | Lab measurement for regression diagnosis, field data at p75 for the claim, bundle and asset budgets measured from the real build | Capped: `k=0.00`, `A_06 ≤ 0.0` — the p75 field rows are unreachable with no deployment and no analytics vendor, and route budgets cannot be set before a measured baseline exists. The lab-may-not-present-as-field clause is an admissibility rule and lives in CAP-6; it is not a cap and was never a number |
| QA-07 | Operational reliability | 9 | §19.10 (lines 2983–2992); OPS-001–OPS-002 (lines 3113–3114); `docs/SECURITY_AND_PERMISSIONS.md` §13 (lines 618–695); Standard §12 twelve checks | `QA-07-nnn` | Executed install, lockfile, typecheck, lint, test, build, migrate, privilege and restore runs with exit codes and transcripts | Capped: `k=0.40`, `A_07 ≤ 0.40 × 9 = 3.6` — four of the dimension's ten rows (the lint/format, typecheck, dependency-and-secret-scan and privilege-harness rows) can execute without a live application or a runner; the other six need one. **Superseded wording:** an earlier revision of this row reported that `lint` could not execute at all. That was true on 1 November and is false now: `pnpm lint` exits **0** (Owner authority: FINAL OWNER DIRECTIVE §1, `@eslint/js` added at a verified version). Restore claims stay blocked until an actual restore completes |
| QA-08 | Responsive behaviour | 6 | §19.9 (lines 2977–2982); NFR-003 (line 3112) | `QA-08-nnn` | Real-device and rendered-emulation matrix, no-overflow measurement per breakpoint | Capped: `k=0.00`, `A_08 ≤ 0.0` until a rendered surface exists (CAP-1 with `V_08 = 0`, and CAP-5). **Corrected defect 4 — this dimension had two different gaps written as one.** The *specification* gap is that the mandate's nine device categories are not fixed by the baseline: which breakpoints, which viewports and which real devices must be supported is an open `S`, recorded as `S_08 = 0.35`. The *verification* gap is that no device run and no rendered breakpoint exists: that is `V_08 = 0`, and it is what the cap above measures. Fixing the specification would raise `S_08` and change nothing else; running emulation on a page that does not exist raises neither |
| QA-09 | Arabic RTL and English LTR | 6 | §10 (lines 1434–1521) with the nine Arabic clauses at §10.5 (lines 1471–1482); LOC-001–LOC-004 (lines 3081–3084) | `QA-09-nnn` | RTL render inspection of every component class, logical-property audit, mixed-direction identifier test, native-reviewer read | Capped: `k=0.00`, `A_09 ≤ 0.0` without a locale mechanism and with no Arabic font file present. The typographic rows carry an additional Owner cap from OID-18 and BA-003 (§10) |
| QA-10 | Quality assurance | 8 | §20.2 (lines 3007–3032); §20.3 (lines 3033–3052); §20.4 (lines 3053–3116); TST-001 (line 3116) | `QA-10-nnn` | The matrix itself, plus the register reconciliation and the reproducibility of every cited run | No special cap: only the general ones. `A_10 ≤ W_10 × V_10 = 8 × 0.20 = 1.6` by CAP-1, and CAP-4 forbids reporting completeness while any row is NOT TESTED. and that the rule requiring a row with no evidence path to be recorded as NOT TESTED rather than left blank is a **status** rule (§11), not a cap, and was mis-filed as one before |
| QA-11 | Content integrity and asset rights | 6 | §13 (lines 1829–1944); §8.11–8.13 (lines 1249–1296); §A.9 (lines 3449–3460); AST-001–AST-003 (lines 3089–3091); STT-002 (line 3086) | `QA-11-nnn` | Rights-record inspection per use, publication-gate tests, provenance traceability, alt-text review | Capped: `k=0.10`, `A_11 ≤ 0.10 × 6 = 0.6` while 0 of 82 rights are cleared and 0 approved — the two of the dimension's twenty rows that concern the register machinery itself, not the rights state. No cleared state may be asserted without evidence, and a single cleared asset moves the number honestly rather than this rule moving it |
| QA-12 | SEO and discoverability | 4 | §19.11 (lines 2993–3000); G.9 (lines 3842–3858); SEO-001 (line 3115) | `QA-12-nnn` | Crawl and index assertions, hreflang reciprocity checks, structured-data validation against the source facts | Capped: `k=0.00`, `A_12 ≤ 0.0` — there is no page to optimise, so `V_12 = 0` and CAP-1 does the work. Separately, and not as a cap: structured data bearing institutional, ownership or rating claims is **inadmissible** until §21.1 (lines 3178–3191) closes; that is an evidence rule (CAP-5 family), not a number |
| QA-13 | Maintainability | 4 | §20.2 (lines 3007–3032); ADR discipline in `docs/ARCHITECTURE_DECISIONS.md`; gate tooling in `scripts/` | `QA-13-nnn` | Reproducible runs of every gate by a second environment, dead-code and duplication review, onboarding walkthrough | Capped: `k=0.50`, `A_13 ≤ 0.50 × 4 = 2.0` while no gate has been reproduced by a second environment — five of the dimension's ten rows (ADR discipline, lockfile integrity, gate existence, citation resolution, table structure) are checkable here; the reproducibility and onboarding rows are not. **Superseded wording:** an earlier revision of this row stated that two of the dimension's gates could not execute. That was the 1 November state. Measured now, every gate executes; `typecheck` executes green over nineteen tooling files and zero application files, and `format:check`, `test` and `build` execute red because the application does not exist. That is a different and better state, and it is still capped — by CAP-1, not by tooling failure |

Weight check: 15 + 9 + 9 + 6 + 9 + 9 + 9 + 6 + 6 + 8 + 6 + 4 + 4 = **100**.

---

## 3. Scoring model

### 3.1 Row-level scoring

Each acceptance row `r` in dimension `d` carries four fields:

| Field | Domain | Meaning |
|---|---|---|
| `I_r` | 0, 0.5, 1 | Implementation: absent, partially present, complete |
| `V_r` | 0, 0.5, 1 | Verification: none, partial (some cases executed), full with recorded evidence |
| `S_r` | 0, 0.5, 1 | Specification: undecided, partly decided, fully decided by the baseline |
| `c_r` | 0 to 1 | Acceptance credit, defined below |

Acceptance credit is **`c_r = min(S_r, I_r, V_r)`**.

This is the correction of defect 1. The formula in v0.1.0 was `c_r = min(I_r, V_r)`, which let a row take full acceptance credit on an implementation and a test while the requirement behind it was still undecided — a row can be built and tested against a question the Owner has not answered, and that is not acceptance. Under the corrected rule all three must be complete, matching the baseline's own words: a requirement is accepted only when implemented behaviour satisfies its acceptance criteria and the evidence is recorded, and it cannot satisfy criteria the baseline has not fixed.

Three consequences, each of which is the point:
- A complete implementation that has never been tested earns **0**.
- A test of something that does not exist earns **0** (Rule B — a run that cannot fail is a defect in the run, not a pass for the product).
- A fully specified requirement that has never been built earns **0**, and no amount of further writing changes `I_r` or `V_r`.

**No-inflation proof, required by the Owner's §2 ("Do not inflate any score").** The formula change is *not* a scoring increase, and the arithmetic says so rather than the prose. Every row in §9.1 that has `I_r > 0` also has `S_r ≥ min(I_r, V_r)` — the artefacts that exist (gate scripts, configuration, the privilege harness, the toolchain checks) were built against requirements the baseline already fixes, so specification completeness is not the missing axis on any credited row. Where `min(S_r, I_r, V_r) = min(I_r, V_r)` for every row, the totals are identical under both formulas. The recalculation *did* move numbers, and it moved them in both directions: §9.1's itemised ledger shows one row losing a point to Rule B and two rows gaining a half-point each from evidence that genuinely changed class, netting **zero** on the acceptance total. Any future batch in which a formula change *does* move a number must show both computations side by side.

### 3.2 Dimension and total scores

- Dimension raw score: `A_d = W_d × (Σ c_r) / N_d` over the `N_d` applicable rows of that dimension.
- Dimension axis scores: `S_d`, `I_d`, `V_d` are the same means of `S_r`, `I_r`, `V_r`, reported beside `A_d` and never merged into it.
- Total acceptance score: `Σ A_d`, published as `x / 100`, always accompanied by the three weighted axis totals and the blocker list.
- Rows marked NOT APPLICABLE are removed from `N_d`, and each removal carries a written justification. A dimension whose `N_d` drops below its mandated minimum is reported as an incomplete matrix, not as a higher score.

**Within-dimension weighting, stated to remove the arbitrariness (corrected defect 8).** Every applicable row of a dimension carries exactly `1/N_d`. There is no criticality multiplier inside the arithmetic, and that is deliberate: a weighting that lets a row's own importance be set by the person scoring it can be gamed by raising the importance of the rows that are finished. Criticality is not ignored — it moves to §7, where it decides *blocking* rather than points. A High row that fails does not cost the dimension a fraction of a point; it stops production acceptance. That is a stronger position than a multiplier, and it cannot be negotiated by re-labelling a row. `N_d` is frozen at adoption, per CAP-9 below.

### 3.3 Cap and veto rules — the part that keeps the number honest

| Rule | Statement | Effect |
|---|---|---|
| CAP-1 | `A_d ≤ W_d × V_d` | Verification completeness is the ceiling of acceptance; no untested dimension can score. This is already in the required form: a fraction of the dimension's own weight, so it cannot be read as a raw-point discount |
| CAP-2 | A dimension whose deciding Owner input is outstanding is capped at `k_d × W_d`, with `k_d` and the numeric ceiling published in its §2 row and consolidated in the cap register at §3.5 | Rights, brand approval, fonts, hosting and AI vendor all bite here |
| CAP-2a | **Admissibility, added on correction.** Material the Owner has not approved cannot be implementation evidence for the dimension it depicts. The quarantined `brand/` tree is preserved and unapproved derivative work, so it contributes `I = 0` to QA-02 — preserving it is a governance duty, crediting it would be a claim | Stops a draft from scoring points for existing |
| CAP-3 | **Any unresolved Critical or High security row at FAIL, NOT TESTED or BLOCKED blocks production acceptance outright. There is no waiver.** The v0.1.0 wording let the Owner "record an explicit risk acceptance" against a High finding; the Owner's directive §2 removes it, and §7's table is corrected with it. A High finding is closed only by implementing and verifying the control — by evidence, not by decision | No unresolved Critical or High may pass production acceptance under the current mandate. A risk-acceptance record may still be written, but as a dated statement that production acceptance has *not* been reached — never as a route around it |
| CAP-4 | A dimension may not be reported as complete while any row is NOT TESTED, BLOCKED or FAIL | 100/100 requires every applicable row PASS, and nothing below that is described as achieved |
| CAP-5 | Visual, motion, RTL and responsive rows require rendered inspection; documentation, code review or a config file is inadmissible evidence for them | Never claim visual validation without inspecting the rendered page |
| CAP-6 | Lab results may not substitute for field results, and emulation may not be reported as device testing. The reporting basis is the baseline's own: the 75th percentile of real user experience (`reference/Noujoude_Master_Specification_EN.md` §19.6, line 2934) | Labelled surfaces only. Corrected defect 4: this is a *verification admissibility* rule, not a dimension cap, and it is no longer written as one in QA-08's row |
| CAP-7 | Independent security assessment is not produced by internal scoring; no certification or compliance claim may be made without an external assessor | ASVS Level 2 remains a target, per §19.4 (lines 2908–2913) |
| CAP-8 | Blockers are published beside the score and never averaged out of it | A 4.1/100 with four open blockers and two open Owner supplies named beside it is more useful than a 72/100 that hides them — the pair is an illustration from the 1–2 November state, and the measured pair on 3 November is **five** open blockers (§10A) and **nineteen** open Owner inputs (`docs/OWNER_INPUT_REGISTER.md` §3); the rule is the point, the numbers move |
| CAP-9 | **Anti-gaming, added on correction of defect 8.** (a) `N_d` is frozen at the values published in §9.1 and may not change inside a batch that reports a score rise. (b) Within a dimension all rows are equal-weight `1/N_d`; no criticality multiplier exists. (c) A row may only be split or added against a named baseline source line, and the batch that raises `N_d` must republish the dimension under both the old and the new `N_d`, so an inflation-by-subdivision is visible as what it is. (d) A requirement spanning dimensions is scored once, in its primary dimension (§5 rule 4) | Prevents the two ways a matrix inflates itself: splitting finished work into more rows, and doubling a shared requirement into two dimensions |
| CAP-10 | **Added on correction of defect 9.** Every published score names the acceptance level it speaks to — documentation verification, Phase 1 exit, implementation acceptance, or production acceptance (§7A) | A number without its level is the exact ambiguity that let a 4.1 be read as "almost nothing" and a green gate be read as "the product works" |

### 3.4 Worked example

A row asserting that `prefers-reduced-motion` suppresses cinematic motion reads: **S = 1** — the baseline decides it twice, at §12.13, line 1821 and at §16.3, line 2365, and the second citation is what makes the requirement non-negotiable by branding; **I = 0** — there is no stylesheet, no component and no application to hold the behaviour; **V = 0** — there is nothing to toggle, so no run is possible; therefore **`c_r = min(S, I, V) = 0`**, and the status is **NOT TESTED**, because the artefact does not exist to be tested.

**Corrected defect 3.** In v0.1.0 this example was capped "by CAP-3 in dimension 01's accessibility-adjacent security-adjacent pairing and by CAP-5 in dimension 05". Both references were wrong, and the wrongness mattered: CAP-3 is the security veto, and reduced motion is not a security row — it is an accessibility requirement that the mandate and the baseline both place under motion and brand governance. Under the corrected rules the row is held down by **CAP-1** (`A_05 ≤ 9 × V_05 = 0`, because `V_05 = 0`) and by **CAP-5** (motion rows require rendered inspection, so no document can close it). CAP-3 touches this row only if the row is *classified* as a security control, which it is not; if the Owner later makes reduced motion a Critical accessibility requirement, it is still not CAP-3's subject — the §7 blocking vocabulary is security-criticality, and the honest place for an accessibility veto would be a named rule of its own, not a borrowed security rule.

Nothing about the strength of the specification moves that row, and the framework is designed so that writing more about it cannot move it either. Nor is reduced motion a *security* row dressed as one. The baseline fixes it twice — once in the motion section, once in brand governance — and quotes both places rather than paraphrasing them: `reference/Noujoude_Master_Specification_EN.md` §12.13, line 1821 requires that "The experience must respect `prefers-reduced-motion`; essential information and navigation must remain available without animation", and §16.3, line 2365 states "Reduced-motion behavior cannot be disabled by branding settings". That pairing is what makes the requirement an accessibility rule held under brand governance, which is why it belongs to QA-05 and to CAP-5's rendered-inspection rule, and why borrowing CAP-3 for it was both wrong and, in v0.1.0's hands, ineffective.

### 3.5 Cap register — the numbers in one place

`k_d` is the fraction of the dimension's weight that is reachable under the current blocker set, computed as *(rows that do not depend on the missing input) ÷ N_d*, both integers, so the cap is auditable rather than felt. `N_d` is frozen by CAP-9.

| Dim | W_d | N_d | k_d | Ceiling `k_d × W_d` | Produced by | Releasing action |
|---|---:|---:|---:|---:|---|---|
| QA-01 | 15 | 20 | 0.20 | 3.0 | CAP-2 — 4/20 rows (dependency and secret scanning, lockfile integrity, config hygiene, the privilege harness) can reach evidence without a running application | An executed control matrix against a live app (needs the Phase 2 slice, then B-05/B-08 for scanning and CI) |
| QA-02 | 9 | 10 | 0.50 | 4.5 | CAP-2 + CAP-2a — 5/10 rows are governance and integrity rules that do not need approved files; none of the 10 can be evidenced by the quarantined `brand/` tree | BA-001 adoption and per-asset brand approval (B-06, OD-16) |
| QA-03 | 9 | 14 | 0.00 | 0.0 | CAP-1/CAP-5 — no rendered page | First rendered route, inspected by a named reviewer |
| QA-04 | 6 | 10 | 0.30 | 1.8 | CAP-2 — 3/10 rows concern the token mechanism, not the approved values | BA-002 palette approval + a token artefact that exists |
| QA-05 | 9 | 10 | 0.00 | 0.0 | CAP-1/CAP-5 — OD-10 closed the engine question; nothing is built or rendered | Motion system implemented on a rendered scene, with a reduced-motion run |
| QA-06 | 9 | 10 | 0.00 | 0.0 | CAP-1/CAP-6 — no deployment, so no 75th-percentile field data; budgets need a measured baseline | A production target (B-05) plus one measured route |
| QA-07 | 9 | 10 | 0.40 | 3.6 | CAP-2 — 4/10 rows execute without a runner or an instance | A green CI run (B-08) and a completed restore (B-05) |
| QA-08 | 6 | 10 | 0.00 | 0.0 | CAP-1/CAP-5 — no rendered surface; separately `S_08 = 0.35` because the nine device categories are unspecified | Specify the device categories (Owner), then render and measure |
| QA-09 | 6 | 10 | 0.00 | 0.0 | CAP-1/CAP-5 — no locale mechanism, no Arabic font file | Locale mechanism + OID-18 font licence and deployment source |
| QA-10 | 8 | 20 | 0.80 | 6.4 | No Owner cap; only CAP-1 binds, at `V_10 = 0.20` | Every applicable row PASS with an evidence path |
| QA-11 | 6 | 20 | 0.10 | 0.6 | CAP-2 — 2/20 rows (register machinery and the audit script) are evidenced; the other 18 are rights state | Rights records supplied per asset and per use (B-06) |
| QA-12 | 4 | 12 | 0.00 | 0.0 | CAP-1 — no page exists to optimise | Real routes with real metadata |
| QA-13 | 4 | 10 | 0.50 | 2.0 | CAP-2 — 5/10 rows are locally checkable; reproducibility and onboarding rows are not | A second environment reproducing every gate |
| — | **100** | **166** | — | — | Weight-check on `N_d`: the thirteen series total 166 planned rows — 20+10+14+10+10+10+10+10+10+20+20+12+10, in dimension order — which is the denominator every score at §9.1 uses | — |

QA-10's `k_d = 0.80` is not currently binding: its ceiling is 6.4 and its score is 1.6, which CAP-1 sets. Where a `k_d` is not binding, saying so is part of the register — an unbinding cap is a warning label, not a constraint.

---

## 4. Status vocabulary

Only the five statuses the mandate names may appear in the matrix. Their mapping to the project's existing register and gate vocabulary is fixed here so the two cannot be confused.

| Matrix status | Meaning | Register equivalent (`docs/REQUIREMENTS_TRACEABILITY.md` §1) | Gate equivalent | Effect on `c_r` |
|---|---|---|---|---|
| PASS | Implemented and verified, with a resolvable evidence path | Implemented and Verified | Passed | 1 |
| FAIL | Implemented but a recorded test contradicts the requirement, or the artefact is absent when it must be present | Not Implemented with an expected artefact, or Partially Implemented with a defect | Open | 0 |
| NOT TESTED | Artefact may exist; no admissible evidence of its behaviour | Not Implemented, or Partially Implemented awaiting verification | Open | 0 |
| BLOCKED | Cannot proceed or cannot be verified until a named Owner input or approval exists | Blocked by Owner Input | Open | 0, and reported as a blocker, not as a gap in effort |
| NOT APPLICABLE | Out of V1 or outside this build, with a written justification and a source | Out of V1 Scope | n/a | Excluded from `N_d` |

Two prohibitions. A row may never be moved to PASS by a document alone — that is Rule A restated. And a BLOCKED row may never be silently re-labelled NOT APPLICABLE to raise a score; the conversion requires the Owner's written decision.

---

## 5. Requirement identifier scheme and reconciliation to the existing registers

The mandate requires unique IDs. The project already has two ID systems, and the framework adds a third that *maps* rather than competes.

| System | Shape | Owner | Relationship |
|---|---|---|---|
| Specification prefixes | `GOV`, `SCP`, `NAV`, `UX`, `CNT`, `COL`, `DAT`, `LOC`, `STT`, `VIS`, `AST`, `AI`, `ADM`, `IAM`, `OPS`, `SEC`, `NFR`, `SEO`, `TST` | `reference/Noujoude_Master_Specification_EN.md` §20.2 (lines 3007–3032), with the 60-row acceptance matrix at §20.4 (lines 3053–3116) | Immutable. Never renumbered by this framework |
| Traceability register | `REQ-<prefix>-nnn`, 219 rows, seven columns — **219 is the 1 November reading, kept as the row that defined the artifact on that date; re-counted 3 November 2026 the file measures 221 rows carrying 221 distinct IDs with no duplicate, the difference being the `REQ-BRAND-007` and `REQ-BRAND-008` pair, and the seven-column shape still holds. The counting pattern matters: the ID pattern that omits digits inside the prefix silently drops the 13 rows whose prefix carries one (`REQ-A11Y-001…004`, `REQ-I18N-001…009`), which is the trap this project's own log records twice** | `docs/REQUIREMENTS_TRACEABILITY.md` | Immutable. New rows are appended, never renumbered |
| Acceptance matrix | `QA-<dimension>-<nnn>` | This framework, hosted per dimension in the specialised documents and consolidated by ID | Every row must carry at least one existing ID in a mapping column, or an explicit statement that it is a new mandate-only requirement with no baseline ID |

Rules:

1. Every `QA-*` row names its baseline source with a section and line, using reference-file numbering.
2. No `QA-*` row may create an obligation the baseline contradicts; where the mandate asks for something the baseline does not decide — animation engines, per-page scene specifications, nine device categories, route-level budgets — the row records that the *decision* is the requirement and names the Owner decision that closes it.
3. Where the mandate and the baseline genuinely conflict on scope, the row is BLOCKED and the conflict goes to `docs/PHASE1_DISCOVERY_AND_READINESS.md` §9 for Owner decision, as C-1 does for the page the mandate names Rare Pieces.
4. Where a requirement spans dimensions, it is scored once in its primary dimension and referenced in the others; double counting is prohibited, and the primary assignment is written in the row.
5. A `PASS` in the matrix must be reflected by the corresponding `REQ-*` row's status in the same batch, or the batch is incomplete. The two registers may not disagree overnight.

---

## 6. The consolidated acceptance matrix

| Column | Content | Rule |
|---|---|---|
| ID | `QA-<dimension>-<nnn>` | Unique, never reused |
| Dimension | QA-01 to QA-13 | Exactly one |
| Requirement | One sentence, testable | No compound requirements |
| Criticality | Critical, High, Medium, Low | §7 definitions |
| Page or component | Route, module or file | Canonical route form from §4.2 (lines 406–429) |
| Implementation location | Real path, or the planned path prefixed `planned:` | A path that does not exist must be marked `planned:` |
| Test method | Command, assertion or named human inspection | Must be executable or reproducible by a named reviewer |
| Expected | The baseline's value, cited | Cite section and source line |
| Actual | What the run produced | Transcribed, not summarised |
| Status | §4 vocabulary | Five values only |
| Evidence path | `evidence/<dimension>/<id>-<YYYY-MM-DD>.<ext>` | One per PASS or FAIL; the directory is created with its first artefact, not before |
| Remaining issue | Defect, blocker or nothing | A PASS with a known open defect is not a PASS |
| Register mapping | `REQ-*` and baseline gate IDs | §5 rules |

Storage decision, made because Part V forbids competing copies: the matrix is **not** one new mega-document. Visual rows live in `docs/VISUAL_QA_MATRIX.md`, performance rows in `docs/PERFORMANCE_BUDGET.md`, motion rows in `docs/MOTION_SYSTEM.md`, design-token rows in `docs/DESIGN_SYSTEM.md`, security and verification rows in `docs/SECURITY_AND_PERMISSIONS.md`, and the consolidated view is produced by ID from `docs/REQUIREMENTS_TRACEABILITY.md`. Each specialised file uses this schema's columns so the rows merge without translation.

---

## 7. Criticality and production acceptance

| Level | Definition in this project | Consequence |
|---|---|---|
| Critical | Authentication or authorisation bypass, exposure of private or rights-restricted content, secret leakage, arbitrary code execution through the CMS, publication of fabricated heritage facts, unsafe serving of uncleared media | Blocks production acceptance absolutely |
| High | Missing MFA on privileged paths, absent CSP or rate limiting on named route families, XSS through rich text or forms, broken rights gating that permits public serving, destructive deletion without recovery, CWV breach on a primary template | Blocks production acceptance. **No waiver exists** — the Owner's directive §2 removes the v0.1.0 clause that allowed an explicit risk acceptance to pass a High finding |
| Medium | Contrast failure on a secondary surface, missing alt text, RTL defect that resolves but confuses, unlabelled emulation-only result, budget overrun without user-visible impact | Must be listed, may not be averaged away |
| Low | Copy, spacing or minor polish items | Tracked; never affects the score |

Production acceptance requires all of: no Critical or High security row at FAIL, NOT TESTED **or BLOCKED** (CAP-3, and with no waiver route); the twelve Standard §12 checks executed with recorded exits; a completed restore test, because `docs/SECURITY_AND_PERMISSIONS.md` §11 records that a successful backup job is not proof of recoverability; rights clearance for every asset actually served, which is currently 0 of 82; a CI run transcript, which is currently zero; and an identified approver for each gate, which the gate rule requires. The mandate's own boundary stands: no absolute claim of a risk-free system, and no certification claim without an independent assessment.

Today **no** Critical or High security row is at PASS, because none has been exercised; under the corrected CAP-3 that means production acceptance is blocked by the rule itself, not by a score. This is the framework doing what the Owner's directive §2 requires of it: an unverified control is an unresolved finding, and an unresolved finding cannot be traded away for a number.

**A second ground appeared on 2 November 2026, and it is measured rather than inferred.** Standard §12 row 8
(dependency and secret scanning) executed for the first time as `pnpm audit --audit-level=high`, exited **1**, and
reported **3 Critical and 3 High** advisories in the installed tree (**B-11**, transcript in
`docs/DEPENDENCY_AUDIT_2026-11-02.txt`). That row is therefore at FAIL rather than NOT TESTED, and a FAIL carrying
Critical and High findings is precisely what CAP-3 refuses to waive. **The consequence was that L4 had two
independent blockages: the unverified controls, and one verified set of advisories.** That second blockage has
since been cleared by measurement rather than by argument: under the Owner's 2 November authorization the
advisories were fixed at their root cause (`docs/IMPLEMENTATION_PLAN.md` §2's B-11 row names each change,
including the two recorded `overrides` and the three advisories left open below the threshold with their
reasons), and `pnpm audit --audit-level=high` now exits **0** on re-run. **CAP-3 therefore no longer binds on
this row — there is no unresolved Critical or High advisory to waive.** L4 keeps the blockage it always had:
the unverified controls, and the secret-scanning half of the same Standard §12 row, which is implemented
nowhere. Nothing in this paragraph edits the 2 November transcript or the finding it recorded.

---

## 7A. Four acceptance levels — the distinction the v0.1.0 score blurred

Corrected defect 9. A single "acceptance score" was being read as one thing by different readers: as "the documentation is nearly finished" and as "the product nearly works". Those are opposite readings of the same 4.1. The framework therefore names four levels, each with its own evidence type, and CAP-10 requires every published number to say which level it speaks to.

| Level | Question it answers | What its evidence is | What it does **not** prove | Status today |
|---|---|---|---|---|
| **L1 — Documentation verification** | Are the governing documents internally consistent, cited correctly, and machine-checkable? | Citation gate, table gate, preflight, the seven gate regression suites — executed commands with exit codes | Nothing about the product. A green citation gate proves the quotations are where they say they are | **Achieved.** Measured by this batch's closure run on 2 November 2026: `verify-citations.mjs` scanned 14 files and **542** quoted fragments carrying a line reference (**433** VERIFIED, 0 LINE_OFF, 0 NOT_FOUND, 10 SELF_RECORDING, 9 PROJECT_RECORD, 90 NO_LINE_REF, identity 433 + 10 + 9 + 90 = 542) with **1,503** bare references checked and 0 defects, exit **0**; `verify-tables.mjs` reports **238** tables in 14 markdown files well-formed, exit **0**; preflight exits **0** at `10 checks: 0 FAIL, 1 WARN, 9 PASS`; `pnpm test:gates` exits **0** with all seven suites green, including the real-`docs/` cases of the citation, table and asset-reconciliation suites. The post-closure motion batch re-measured both gates the same day, exit **0** over **15** files: **542** fragments with the class figures unchanged, bare references **1,521** and **244** tables. L1 is a claim about the gates running green on the corpus, not about a file count that moves with every document, and the count is quoted from the command each time. **Third dated reading, 3 November 2026, counter-reconciliation batch:** `node scripts/verify-citations.mjs` exits **0** over **15** files and **557** quoted fragments carrying a line reference — 434 VERIFIED, 10 SELF_RECORDING, 11 PROJECT_RECORD, 6 DEFINED_TERM, 102 NO_LINE_REF, identity 434 + 10 + 11 + 102 = 557, LINE_OFF 0, NOT_FOUND 0 — with **1,538** bare references checked and 0 defects; `node scripts/verify-tables.mjs` exits **0** at **249** tables in 15 markdown files; `node scripts/preflight.mjs` exits **0** at `10 checks: 0 FAIL, 2 WARN, 8 PASS`, the Docker WARN being a cold daemon on that run and the other being the Owner's B-06 reconciliation; `pnpm test:gates` exits **0** over **eight** suites and **178** assertions, none failed and none skipped. **A fourth reading closed the same batch:** after `docs/CHANGELOG.md` §T was appended, `verify-citations.mjs` still exits **0** over **557** fragments with the class figures above and **1,545** bare references checked with 0 defects, and `verify-tables.mjs` exits **0** at **250** tables in 15 markdown files — the +1 table and the +6 bare references are that entry's own, which is why L1 quotes the command rather than a number. L1's own criterion — the gates run green and are machine-checkable — is met by these exits, not by the file count |
| **L2 — Phase 0/1 exit** | Has the Directive's own Phase 0 and Phase 1 checklist been satisfied, line by line? | The Master Execution Directive §14 lines, plus Standard §12 checks that the phase actually owns | Application readiness. Phase 1 exit with a contentless shell is a fact about the phase's scope, not a claim that software exists | **Met on §14 and on Level A, and signed nowhere yet.** Phase 0's five lines and Phase 1's three lines are all satisfied — the last of them, Master Execution Directive §14, line 250: "Initialize application in `src/`", satisfied on 2 November 2026 (`find src -type f` → 32 files; `pnpm build` exit 0 over 16 routes). Level A is 14 of 14 and Gate 0 is Passed with the Owner named. **L2 is not the same as acceptance**: an L4-grade instrument, Standard §12, is 3 of 12 as measured on 2 November and **4 of 12** on the 3 November re-run, and 9 of those 12 rows are owned by Phases 2–8. **The 3 November re-measurement of §14 line 250, same command, larger tree:** `find src -type f` → **61** files (60 of them code or style, 1 `README.md`) totalling **11,194** lines, and `pnpm build` exits **0** over **17** route entries. The line is met on both readings; the second is the one a reader should take as current |
| **L3 — Implementation acceptance** | Does each requirement exist as a working artefact and pass its recorded test? | Per-row `c_r = min(S,I,V)` against a real route, component, migration or content record | Security certification, production readiness, rights clearance | **5.45 / 100** (was 4.1, published as 5.5 in one row of this table before §9's arithmetic was re-checked — §9 and §9.1 are the computation of record and this row now matches them). `Σc = 11.0` of the **166** row-points the frozen matrix can earn. The movement is three rows in QA-07 that gained the ability to fail — a typecheck over typed code, unit tests over a real domain, a production build over real routes — and each is credited at a half, not a whole, because the evidence is host-class only. **No row credits published content, rights-cleared media, an admin surface or a database schema**, because none exists |
| **L4 — Production acceptance** | May this be deployed and served to the public under the mandate? | §7's list, in full, plus CAP-3's blocking rows closed by evidence and an Owner approver named per gate | — (this is the last level; nothing it omits may be inferred from L3) | **Blocked, and now blocked by measurement rather than by absence.** CAP-3 forbids any waiver for an unresolved Critical or High, and **B-11 puts three Critical and three High advisories on the record** from an executed `pnpm audit`. Separately blocked by B-05, B-06, B-07, B-08, B-12 and OID-18 |

The score at §9 is an **L3 measurement instrument** reporting an L3 population of almost zero. It is not an L1 report (L1 is genuinely green), and it is not an L4 assessment (L4 is blocked by rule, not by arithmetic). Reading 4.1 as "4 % done" is wrong in both directions: the specification and the documentation layer are far more complete than that, and the product is exactly as incomplete as that.

---

## 8. Phase mapping

| Mandate phase | Content | Gate coupling | Entry condition | Exit condition |
|---|---|---|---|---|
| 1 — Discovery and framework | This document and `docs/PHASE1_DISCOVERY_AND_READINESS.md` | Gate 0 already Passed | Met | **Met for the framework itself** — OD-8 adopted (conditionally, under the Owner's directive §1 and §2, as v0.2.0) and OD-9 to OD-15 decided by the Owner's recorded defaults. **Not met for OD-16**: BA-001…BA-007 (brand files, palette approval, font licences, component tokens) are Owner supplies and stay open |
| 2 — Foundation | Design tokens, styling approach, font acquisition, base component primitives, security scaffolding | Gate 1 and the design half of Gate 2 | OD-9, OD-11 and OD-12 are **closed** (CSS custom properties + CSS Modules authorised; `@eslint/js` authorised at a verified version and the lint gate now exits 0; the `.prettierignore` correction authorised and applied). OID-18 is the only remaining entry condition | Token file and primitives exist with executed typecheck, lint and build — **now stated as measured rather than as intent: all three execute green on 2 November 2026, and the token layer exists as custom properties in `src/ui/styles/global.css` consumed through four CSS Module sheets** |
| 3 — Experience | Public pages in canonical order, motion system, RTL, image pipeline, route budgets | Gate 2 | OD-10 **closed** (GSAP for cinematic timelines and scroll scenes, Motion for React component interactions, CSS for simple transitions, Lenis deferred). B-06 partial clearance for at least one world still required | Every row of QA-03, QA-05, QA-06, QA-08, QA-09 either PASS or named-blocked. **The routes exist and render in both locales with correct `lang`/`dir`, which is the substrate these rows need; nothing is populated, so all five dimensions stay at their caps** |
| 4 — Administration and AI | Control Center modules, permissions, AI Curator with retrieval-layer enforcement | Gate 3 and Gate 4 | B-05 | Positive and negative authorisation matrix executed; AI red-team executed |
| 5 — Hardening | Headers and CSP, rate limiting, uploads, secrets and dependency scanning, backup and restore, monitoring | Gate 5 | B-08 closed | No unresolved Critical or High; restore transcript exists |
| 6 — Acceptance and scoring | Full matrix pass, evidence paths complete, residual risk recorded | All gates | Every dimension at its cap released | Score published with axes and blockers, approver named |

Nothing in phases 2 to 6 is started by this run. The mandate is explicit, and `docs/IMPLEMENTATION_PLAN.md` remains the schedule authority.

---

## 9. Current scores, computed under this model

The values below are recalculated under the corrected formula `c_r = min(S_r, I_r, V_r)` (§3.1) against the evidence measured in this window, not estimated for comfort. I = 0 and V = 0 wherever no artefact exists; S is an assessment of how completely the baseline decides the question, and it is marked as an assessment because it is not machine-measurable. **This score reports level L3 (§7A) about a population that is almost entirely not yet built — it is not an L1 report and not an L4 assessment.**

| Dimension | W | N | S | I | V | `A_d` | Cap `k×W` | Binding? | Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| QA-01 Security | 15 | 20 | 0.85 | 0.00 | 0.00 | 0.0 | 3.0 | CAP-1 binds at 0.0 | Controls specified and documented; none implemented or exercised against a live application |
| QA-02 Brand | 9 | 10 | 0.70 | 0.00 | 0.00 | 0.0 | 4.5 | CAP-1 binds | Roles and integrity rules fixed; 0 approved files; quarantined `brand/` earns nothing (CAP-2a) |
| QA-03 Visual | 9 | 14 | 0.75 | 0.00 | 0.00 | 0.0 | 0.0 | CAP-1/CAP-5 | Direction and per-page orders fixed; nothing rendered |
| QA-04 Colour | 6 | 10 | 0.80 | 0.00 | 0.00 | 0.0 | 1.8 | CAP-1 binds | Twelve HEX values fixed and marked proposed; no token artefact |
| QA-05 Motion | 9 | 10 | 0.55 | 0.00 | 0.00 | 0.0 | 0.0 | CAP-1/CAP-5 | Effects and durations fixed; **engine now decided** (OD-10 closed) — but `S` stays 0.55 because the per-page scene specifications are still unwritten, so deciding the engine moved no axis |
| QA-06 Performance | 9 | 10 | 0.45 | 0.00 | 0.00 | 0.0 | 0.0 | CAP-1/CAP-6 | Thresholds fixed at the 75th percentile (line 2934); budgets and baseline absent |
| QA-07 Reliability | 9 | 10 | 0.75 | 0.40 | 0.25 | **2.25** | 3.6 | CAP-1 binds exactly (9 × 0.25 = 2.25) | Four §12 rows now execute against real artefacts and are credited at a half each because the evidence is host-class: lint (exit 0; falsifiable, and falsified once — the first probe round proved two guards fire, the second found that a direct call to `eval` **passed** the pre-repair gate because `tseslint.configs.strict` turns the base `no-eval` off; the rule was re-enabled and the same probe now exits **1** with **8** named errors over the clean-tree baseline of **0**), typecheck (exit 0 over 31 typed files, exits 2 on a type-error probe), unit tests (exit 0, 34 assertions, red-green proved on the rights gate), production build (exit 0, 16 routes served and probed over HTTP). `format:check` still reports violations (exit 1, 25 files), the A.5 privilege harness stays at a half as disposable-harness evidence (rule 8), and 0 restore tests exist; the pipeline has still never executed on a runner (B-08). **3 November inputs, recorded and not re-scored:** typecheck exits **0** over a program of **84** project files rather than 31 typed ones, unit tests exit **0** over **15** files and **397** tests rather than 4 and 34, the build exits **0** over **17** route entries rather than 16, `pnpm format:check` now exits **0** rather than 1 over 25 files, and the audit at the high threshold exits **0** over 3 sub-threshold advisories. Four of this dimension's ten rows therefore have better inputs than the ledger below records, and `A_07` still reads **2.25**: raising it is a per-row act under CAP-9, which requires the row's `S`/`I`/`V` columns to be re-argued against its own criterion, not inferred from a prose batch. The half-credit for host-only evidence and the missing restore test are unaffected by any of the five readings |
| QA-08 Responsive | 6 | 10 | 0.35 | 0.00 | 0.00 | 0.0 | 0.0 | CAP-1/CAP-5 | Specification gap (nine device categories unfixed) and verification gap (no render) counted separately, per §2 |
| QA-09 RTL and LTR | 6 | 10 | 0.80 | 0.00 | 0.00 | 0.0 | 0.0 | CAP-1/CAP-5 | Nine Arabic clauses fixed; no locale mechanism, no Arabic font file |
| QA-10 Assurance | 8 | 20 | 0.65 | 0.20 | 0.20 | 1.6 | 6.4 | CAP-1 binds exactly (8 × 0.20 = 1.6) | 219-row register plus 146 executed gate assertions; 0 product rows — **both counts in that basis cell are the window this table was computed in, and the 3 November re-run moved them: the register measures 221 rows, and `pnpm test:gates` exits 0 over 8 suites and 178 assertions rather than 7 suites and 146. No `N`, `A_d`, cap or score in this row changed, and CAP-9 is the reason: a counter correction is not per-row product evidence, so `I` and `V` stay 0.20 and the row still describes documentation work** |
| QA-11 Content and rights | 6 | 20 | 0.85 | 0.15 | 0.10 | 0.6 | 0.6 | CAP-2 binds exactly | Catalog, safeguards and audit exist and ran once; 0 of 82 cleared |
| QA-12 SEO | 4 | 12 | 0.75 | 0.00 | 0.00 | 0.0 | 0.0 | CAP-1 | Clauses fixed including G.9's 13; no page to optimise |
| QA-13 Maintainability | 4 | 10 | 0.90 | 0.25 | 0.30 | 1.0 | 2.0 | CAP-1 binds | **36 ADRs** (ADR-001 … ADR-036, `grep -c '^### ADR-'` → 36, re-run 3 Nov 2026 after ADR-035 and ADR-036; the 2 Nov reading after ADR-034 was 34), running gates, a real lockfile, an initialized and documented `src/` layout. **The score does not move in this batch**: QA-13's ten rows have never been itemised into a §9.1-style ledger, and publishing a rise in the same breath as the rows that justify it is the game CAP-9 exists to stop. The batch that writes the ledger may re-derive it, upward or downward |
| **Total / weighted mean** | **100** | **166** | **0.70** | **0.07** | **0.06** | **5.45** | — | — | `Σ A_d`; axes are `Σ(W_d·X_d)/100`. Aggregate CAP-1 holds: 5.45 ≤ 5.65 |

Reading of that table, stated plainly: the specification is close to complete, the product is a buildable shell with
no content, and the verification that exists is verification *of documentation, of verification tooling, of one
disposable database harness, and of four toolchain checks running over real code* — not of published behaviour. The
recalculated acceptance score is **5.45 of 100, level L3** (published as 4.1 in v0.2.0), and every fraction of the
rise is attributable in §9.1's ledger: three QA-07 rows moved from 0 to 0.5 because the checks they describe now run
against artefacts that can make them fail. Nothing else moved. `S` did not move at all; `I` rose from 0.05 to 0.07
and `V` from 0.04 to 0.06, which is the honest shape of the change — implementation and verification grew by
thirty-one typed files and one build, and the specification was already written. **What would have to exist for this
to move materially**: a schema and a migration (rows 4 and 10), a rendered page inspected by a named reviewer
(QA-03, QA-05, QA-08, QA-09), a rights-cleared asset (QA-11 releases its cap by one row at a time), and a CI runner
plus a second environment (which is what turns every half-point in QA-07 into a whole one).

Dimension QA-11 is deliberately at 0.6 rather than higher: the register and the audit script are real, and the
fail-closed serving rule now exists as tested code in `src/domain/rights.ts`, but CAP-2 pins the dimension exactly at
its ceiling while 0 of 82 rights are cleared, and a single cleared asset would move it honestly. The rights gate's
unit test is credited once, in QA-07 row 3, as a unit test of domain logic — not a second time here, and not at all
as an enforced control, because no running application consults it yet (CAP-9(d)).

### 9.1 Credit arithmetic — every number in §9 derived

Published because the Owner's §2 demands corrected arithmetic, not corrected prose. For each dimension: `A_d = W_d × (Σ c_r) / N_d` with `c_r = min(S_r, I_r, V_r)`, and `X_d = (Σ x_r)/N_d` for the three axes. Every `Σ` is a sum of values drawn from {0, 0.5, 1}, so each mean is exact and each `A_d` is reproducible from this table alone.

| Dim | N_d | ΣS | ΣI | ΣV | Σc | `A_d = W_d·Σc/N_d` | CAP-1 check `A_d ≤ W_d·V_d` |
|---|---:|---:|---:|---:|---:|---:|---|
| QA-01 | 20 | 17.0 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-02 | 10 | 7.0 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-03 | 14 | 10.5 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-04 | 10 | 8.0 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-05 | 10 | 5.5 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-06 | 10 | 4.5 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-07 | 10 | 7.5 | 4.0 | 2.5 | **2.5** | 9×2.5/10 = **2.25** | 2.25 ≤ 9×0.25 = 2.25 ✓ (exact) |
| QA-08 | 10 | 3.5 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-09 | 10 | 8.0 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-10 | 20 | 13.0 | 4.0 | 4.0 | 4.0 | 8×4.0/20 = 1.6 | 1.6 ≤ 8×0.20 = 1.6 ✓ (exact) |
| QA-11 | 20 | 17.0 | 3.0 | 2.0 | 2.0 | 6×2.0/20 = 0.6 | 0.6 ≤ 6×0.10 = 0.6 ✓ (exact) |
| QA-12 | 12 | 9.0 | 0 | 0 | 0 | 0.0 | 0.0 ≤ 0.0 ✓ |
| QA-13 | 10 | 9.0 | 2.5 | 3.0 | 2.5 | 4×2.5/10 = 1.0 | 1.0 ≤ 4×0.30 = 1.2 ✓ |
| **Σ** | **166** | — | **7.10** | **5.65** | **11.0** | **5.45** | Holds for all thirteen; binds exactly for four |

Weighted axes, re-derivable from the products: `Σ(W_d·S_d) = 70.15 → 0.70` (unchanged — no `S` value moved in any batch since v0.2.0); `Σ(W_d·I_d) = 7.10 → 0.07` (was 4.85 → 0.05; the whole movement is QA-07's row 2, 3 and 9 gaining implementation artefacts); `Σ(W_d·V_d) = 5.65 → 0.06` (was 4.30 → 0.04, from the same three rows plus the half already carried by row 1). Aggregate CAP-1 holds: `5.45 ≤ 5.65`.

**The convention this batch applied, published so that it can be audited or replaced.** Standard §12's twelve checks
are *CI* controls, so a run performed on this host is evidence at class `host`, one rung below the `second-environment`
class the check actually asks for. Under rule 8 a claim may not reach above its class, so **every §12 row whose
evidence is host-only is capped at `V = 0.5`, whole credit requires CI or second-environment evidence.** The
convention is deliberately conservative: it is the reason rows 2, 3 and 9 rose to a half and not to a whole, and the
reason QA-07 as a dimension is verification-capped at 2.25 rather than 3.6. A later batch may lift a row to `V = 1`
only by pointing at a runner transcript or an independent environment, and must say which.

**The QA-07 ledger — the only dimension whose evidence changed, so the only one itemised at row level.** Ten rows, one per Standard §12 check that this dimension owns (checks 11 and 12 are primary in QA-12 and QA-06 and are not counted twice here, per §5 rule 4 / CAP-9(d)).

| Row (Standard §12) | S | I | V | c | Why |
|---|---:|---:|---:|---:|---|
| 1 Formatting and lint | 1 | 1.0 | 0.5 | **0.5** | `pnpm lint` exits **0** over the project's 51 type-included files with 0 messages, and each configured guard was proved to fire on a probe; `pnpm format:check` exits **1** with 25 files reported. The gate exists and runs; its formatting half reports violations, so the row is a half, not a whole. **3 November: the formatting half is green** — `pnpm format:check` exits **0**, the 25-file violation reading being superseded by the reformat batch that Owner decision OID-25 authorised. `c` stays **0.5** in this ledger because the ledger is the 2 November measurement and CAP-9 forbids moving a row's credit as a side effect of a prose batch; the re-argument that belongs to whoever re-scores it is that both halves of the row's criterion are now executed commands with exit **0**, and the only remaining question is `V` under the host-only convention |
| 2 Strict TypeScript typecheck | 1 | 1.0 | 0.5 | **0.5** | **Rule B applied on 1 November, now lifted by measurement.** The 1 November reading is kept because it is why the row was zero: `tsc --noEmit --listFilesOnly` listed **19** files, **0** of them `.ts`/`.tsx`, so the run could not fail. Re-measured 2 November: **31** typed files across the project (8 `.ts` + 18 `.tsx` under `src/`, plus typed configs), `pnpm typecheck` exits **0**, and a probe line makes it exit **2** with `TS2322` — the check can now say no. `V` is 0.5, not 1, under the host-only convention above; the standing `tsconfig.json` caveat is that `allowJs: true` without `checkJs` still leaves the `.mjs` tooling parsed rather than checked |
| 3 Unit tests | 1 | 0.5 | 0.5 | **0.5** | 1 November: exit **1** with `No test files found`. 2 November: `pnpm test` exits **0** — 4 files, **34** assertions over the locale contract, the canonical route registry, the fail-closed media-rights gate and the root-entrance routing read from the real `next.config.mjs`. Red-green proved: one inverted comparison at `src/domain/rights.ts` line 50 produced **7** named failures, and exit 0 returned only after the file was restored byte-identical. `I` and `V` are halves because the domain under test is the Phase-1 subset; the Phase-2 domain — claims, evidence, provenance, the eight state dimensions — has no implementation to test and no test |
| 4 Integration tests | 0.5 | 0 | 0 | 0 | Required by Standard §12; what to integrate has no implementation to integrate with |
| 5 Playwright e2e | 0.5 | 0 | 0 | 0 | `playwright.config.ts` is authored; zero specs; a config that has never run cannot earn `V` (§1 Rule-B column) |
| 6 Accessibility checks + manual audit | 0.5 | 0 | 0 | 0 | Wiring conflict C-13 unresolved (three different paths); no manual audit record exists |
| 7 Security checks mapped to ASVS, negative authorisation | 0.5 | 0 | 0 | 0 | The mapping column does not exist (C-18) and no negative-authorisation test has run against an application. **The privilege harness is scored once, in row 10, and earns nothing here** — CAP-9(d) forbids the same artefact paying two rows |
| 8 Dependency and secret scanning | 0.5 | 0 | 0 | 0 | **Status moved from NOT TESTED to FAIL, and the score did not.** `pnpm audit --audit-level=high` executed 2 November 2026 and exited **1**: 15 vulnerabilities, 3 critical, 3 high (**B-11**). Re-run after the SR-11 dependency work the same day it exits **0**, so the dependency half is clean at the declared threshold and three sub-threshold advisories are recorded by name rather than waived. **The row still scores 0 because its criterion is both halves and the secret half is implemented nowhere** — a clean dependency scan cannot buy credit for a check that has two parts. CAP-3 no longer blocks L4 on this measurement; the row's own emptiness does |
| 9 Production build | 1 | 1.0 | 0.5 | **0.5** | 1 November: exit **1** — `Couldn't find any pages or app directory`. 2 November: `pnpm build` exits **0**, compiles in 42 s, type-checks in 12.2 s and emits **16** routes, and `pnpm start` serves them with the status codes, `lang`/`dir`, `noindex` and header observations recorded in `docs/ROUTE_RUNTIME_EVIDENCE.txt`. `V` is a half under the host-only convention, and the artefact is a contentless, non-indexable shell — a passing build over a shell is evidence about the build |
| 10 Migration verification and restore test | 1 | 0.5 | 0.5 | **0.5** | The A.5 harness executed fourteen grant/trigger/RLS cases with exit **0** against a disposable container and volume that the run removed. `V = 0.5` because §11 rule 8 puts a ceiling on harness-class evidence; `I = 0.5` because no project migration exists and **no restore has ever completed** |
| **Σ** | **7.5** | **4.0** | **2.5** | **2.5** | `A_07 = 9 × 2.5 / 10 = 2.25`; CAP-1 ceiling `9 × V_07 = 9 × 0.25 = 2.25`, binding exactly |

**Carried readings, named rather than left as numbers.** QA-10's `Σc = 4.0` is the four rows that are artefacts with teeth: the 219-row register machine-counted — **221 rows on the 3 November re-count, the `REQ-BRAND-007`/`-008` pair being the difference, and §9's QA-10 basis cell carries the same supersession so the two readings cannot disagree with each other** — its seven-column shape machine-checked, the citation and table gates reproducible, and the evidence-path rule enforced. QA-11's `Σc = 2.0` is the 82-row asset register with its per-file SHA-256 re-verification, and the audit script that produced it — both can fail and both have (the `WRONG_FORMAT` and `NAME/PIXEL` findings are the proof); its `ΣI = 3.0 > ΣV = 2.0` is the reconciliation row, which executes and reports a FAIL on content (18 mismatches, catalog 82 against 85 physical files). **Corrected on its level word, and re-measured 3 November 2026.** The reconciliation row prints as WARN on both dates — the script that produces it reserves FAIL for a checksum mismatch and reports a governance finding as WARN — and it sits inside a tally of 0 FAIL, 1 WARN and 9 PASS on 2 November and 0 FAIL, 2 WARN and 8 PASS across 10 checks on 3 November, both at exit 0. The 3 November reading holds the same 18 NAME/PIXEL mismatches and the same 1 WRONG_FORMAT, with catalog rows 82 against 97 physical files: 85 at the directory root plus 12 under the pending-review subtree, every one of them timestamped 2 November. Nothing in the library was copied, moved, overwritten or deleted by this window. QA-13's `Σc = 2.5` is lockfile integrity (`--frozen-lockfile` exit 0, hash unchanged), citation resolution (every bare reference re-checked, 0 defects) and a half row for the gate suites' own regression tests. **QA-10 and QA-11 keep the values v0.2.0 published because their evidence genuinely did not change in this window; QA-13's evidence did change — eight further ADRs, gates running over real code, a documented `src/` layout — and its score still does not move, because its ten rows have never been itemised into a ledger and §9.1's rule is that a number moves only with the row arithmetic that justifies it.** All three will be re-derived row by row when their matrices are written, and no later batch may adjust them without showing the same ledger.

**The delta from v0.2.0's 4.1, itemised — +1.35, and it came from four rows, all named.**
1. **+0.5** — row 2, typecheck. v0.2.0 credited this row **0** under Rule B: 19 files, zero of them type-checked, a run that could not fail. It now runs over 31 typed files and exits **2** when a probe introduces a type error, which is the difference between a green light and a gate.
2. **+0.5** — row 3, unit tests. From exit **1** with `No test files found` to exit **0** with 34 assertions that were proved able to fail (7 named failures under a one-operator mutation, then a byte-identical restore).
3. **+0.5** — row 9, production build. From exit **1** to exit **0** over 16 routes, then served and probed over HTTP.
4. **0** — rows 1, 8 and 10. Row 1 keeps its half (the formatting half still reports violations); row 8 moved from NOT TESTED to FAIL and stays at zero credit, because a scan that runs and finds Critical advisories has not satisfied its own criterion; row 10's half stays a half, because rule 8 caps disposable-harness evidence wherever the harness runs.
5. **0** — QA-13, by the explicit no-ledger-no-move rule above, and QA-01/02/03/04/05/06/08/09/12, whose evidence is unchanged: nothing was rendered, nothing was cleared, nothing was deployed, and no scene was animated.
Net: `Σc` 9.5 → 11.0 and **4.1 → 5.45** at level L3. `S` is unchanged at 0.70; `I` rises 0.05 → 0.07 and `V` 0.04 → 0.06. **No `S` value, no weight, no `N_d` and no cap moved**, so the rise cannot be attributed to re-specification, re-weighting or subdivision (CAP-9(a) and (b)). The three rows that gained all gained the same way: somebody wrote an artefact, and then wrote a way for its check to fail.

---

## 10. Open blockers and their scored effect

Corrected defect 10: **one register, one state per ID, no duplicates.** Blocker IDs are minted only in `docs/IMPLEMENTATION_PLAN.md` §2, and the reconciliation below is against that table, not against a memory of it. Counts are stated so a later reader can diff them: **twelve** registered blockers, of which **six** are cleared (B-01, B-02, B-03, B-04, B-09, B-10) and **six** are open (B-05, B-06, B-07, B-08, B-11, B-12) **as at the 2 November measurement this paragraph records; re-measured 3 November 2026 from §2's own status cells the pair is seven cleared (B-01, B-02, B-03, B-04, B-09, B-10, B-11) and five open (B-05, B-06, B-07, B-08, B-12)** — B-11 moved because the dependency scan was re-run after the SR-11 upgrades and exits **0** with no Critical and no High, which is also why §10A's B-11 row now reads as a clearance while still sitting in the "Still open" table (the row is left where it is on purpose: its position is cited by line number, and the countable pair above is the authority). Two of the six are new since v0.2.0 and both arrived by measurement: **B-11** exists because running the dependency scan produced Critical and High advisories that no earlier record contained, and **B-12** exists because the inventory condition was already blocking work but had been recorded in that document's §10.2 under an ID that collided with two other meanings — the collision is described and repaired in `docs/IMPLEMENTATION_PLAN.md` §2's ID hygiene note. The v0.1.0 table also listed OD-9, OD-10, OD-13, OD-14, C-11 and C-12 as blockers; six of those are no longer blockers — four were decided by the Owner's directive §1 (OD-9, OD-10, OD-13, OD-14), OD-15 likewise (extend the security document, create no second one), and C-11/C-12 were closed by execution — so they move to §10B and stop being counted as open obstruction.

### 10A. Still open

| Blocker | Dimensions blocked | Cap in force | Phase-0/1 exit or downstream? | Owner action that releases it |
|---|---|---|---|---|
| **B-05** storage, AI provider, hosting, SMTP, backup vendor unselected | QA-01, QA-06, QA-07, QA-11 | `A_01 ≤ 3.0`, `A_06 ≤ 0.0`, `A_07 ≤ 3.6` | **Downstream.** No Phase 0/1 exit criterion names a vendor; the ADRs record the selection as a Phase 4/5 input | Name the vendors and the production target |
| **B-06** rights and curatorial approvals for 82 assets | QA-02, QA-03, QA-11, QA-12 | `A_02 ≤ 4.5`, `A_11 ≤ 0.6` (binding exactly) | **Downstream for exit, blocking for publication.** Phase 0 audited the files as they are; serving them requires rights the Owner has not supplied | Supply rights records per asset and per use |
| **B-07** institutional facts absent (legal identity, location, founder story, contact details) | QA-11, QA-12 | Withholds admissible source for fact-bearing structured data (§21.1) | **Downstream**, and the reason v0.1.0's table was wrong is that this row was missing from it entirely | Supply the §21.1 facts, or keep the schema non-fact-bearing |
| **B-08** no remote and no runner, therefore 0 CI executions | QA-01, QA-07, QA-10, QA-13 | No dimension may claim CI evidence | **Downstream for exit** — Phase 0/1 asks for the pipeline to be *defined*, which it is — **and blocking for any CI claim** | Authorise a remote and a first run, or accept local-executed evidence with the explicit note below |
| **B-11** dependency advisories, found by running the scan | QA-01, QA-07 | **CAP-3 was the operative rule, and the finding it bound to is now measured away**: the scan that opened this blocker reported 3 Critical + 3 High; the re-run after the SR-11 dependency work exits **0** with no Critical or High left, so CAP-3 has nothing left to refuse to waive. `A_01 ≤ 3.0` and `A_07 ≤ 3.6` are unaffected because neither row carried credit — and §9's check-8 row still scores 0, because the secret-scanning half, not the advisory count, is what withholds the credit | **Downstream for Phase 0/1 exit** — no §14 line names a scan result — **and no longer blocking Gate 5 on its dependency half; Gate 5 still waits on the secret half and on B-08, because a pipeline that has never run enforces nothing** | Released for the dependency half by the version decision this window was given: the `vitest` bump and the two recorded `overrides` are committed, the scan re-runs green, and each of the three remaining sub-threshold advisories is named with the reason it was not forced. What still needs the Owner is any *further* version decision, and a dated acceptance if those three are to be carried rather than fixed — and no reading of this row opens L4 by itself |
| **B-12** no artifact record exists (Morocco inventory outstanding) | QA-10, QA-11, QA-12 | `A_11 ≤ 0.6`, `A_12 ≤ 0.0` regardless — the caps are already binding on other grounds | **Downstream for exit** — Phase 0 catalogued the files that exist and Phase 1 built the shape — **blocking for Gate 1 and for every content-bearing row** | Supply the inventory with a named reviewer per claim. No part of it may be inferred, and the empty-state pages built in this window exist precisely so that its absence renders honestly instead of silently |
| **OID-18 / BA-003** font licences and deployment source | QA-02, QA-04, QA-09 | Typographic rows BLOCKED; `A_09 ≤ 0.0` regardless | **Downstream for exit; blocking for Phase 2's typographic pass** | Supply licence and deployment source |
| **OD-16** BA-001…BA-007 (brand files, palette approval, font licence, component tokens) | QA-02, QA-04 | `A_02 ≤ 4.5`, `A_04 ≤ 1.8` | **Downstream for exit; blocking for dimensions 02 and 04** | Approve or replace the brand set |

**The B-08 wording, corrected (defect 5).** v0.1.0 wrote B-08 as "no CI runner" and, in QA-01's cap cell, as "0 CI runs and **no executed control**". The second half was false. What is true and measured: local automated gates execute on this host — seven regression suites, 146 assertions, exit **0**; the citation, table, compose-config and workflow-structure gates exit **0**; preflight exits **0**; `pnpm lint` and `pnpm typecheck` exit **0**. What is genuinely unverified is (a) execution by the CI pipeline — 0 runs, because there is no remote — and (b) execution by an independent second environment, which is what turns "it works here" into "it is reproducible". Any score or gate record that needs CI evidence must say which of the two it is waiting for.

### 10B. Removed from the blocker list, with the reason

| ID | Was listed as | Now | Evidence |
|---|---|---|---|
| OD-9 styling and token approach | Blocker for QA-03/04/05 | **Decided** — centralized CSS custom properties + CSS Modules, unless the architecture proves better | Owner directive §1; recorded as an ADR in this batch |
| OD-10 motion engines | Blocker for QA-05 | **Decided** — GSAP for cinematic timelines and scroll scenes, Motion for React component interactions, CSS for simple transitions, Lenis deferred | Owner directive §1 and §7 |
| OD-11 / C-12 `@eslint/js` | Blocker: "lint unavailable" | **Closed by execution** — `pnpm lint` exits 0 | `docs/PHASE01_CLOSURE.json` |
| OD-12 / C-11 `.prettierignore` | Blocker: "format unsafe" | **Closed by execution** — the justified additions are in place; 103 files were in scope before, 25 report violations after, with no reformatting of protected material | `docs/PHASE01_CLOSURE.json` |
| OD-13 Rare Pieces | Blocker for QA-03 | **Decided** — no new route; an editorial collection treatment resolved from the existing specification and canonical routes | Owner directive §1 |
| OD-14 `brand/` | Blocker for QA-02 | **Decided** — preserved and quarantined; not approved brand identity, and earns no credit (CAP-2a) | Owner directive §1 |
| OD-15 document plan | Open question | **Decided** — extend `docs/SECURITY_AND_PERMISSIONS.md` rather than creating a competing security document | Owner directive §1 |
| B-01, B-02, B-03, B-04, B-09, B-10, B-11 | Open | **Cleared and verified** in `docs/IMPLEMENTATION_PLAN.md` §2; they are not re-listed as blockers anywhere in this document. B-11 joins this row on 3 November 2026, and the join is by measurement, not by wording: `pnpm audit --audit-level=high` exits **0** with no Critical and no High, and §10A's own B-11 cell had already recorded that re-run while this summary row still listed six cleared and six open — the disagreement was inside one document | Same register, same states |

---

## 11. Evidence rules

1. Every PASS cites a command, its exit code, a date and an environment, or a named human reviewer and the surface they inspected.
2. Evidence paths are resolved relative to the repository and one artefact per claim; a claim whose artefact cannot be opened is NOT TESTED.
3. Machine-verifiable rows are re-run in the same batch that marks them, and the output is transcribed. Human-verifiable rows are marked with the reviewer, the date and the exact rendered surface.
4. Numbers that move are re-read, not quoted — the standing rule for gate counts in this repository.
5. Cross-document line numbers shift when documents are edited; any batch that edits a governed document re-runs the citation gate over the whole set before claiming the batch is clean.
6. No secret value appears in any evidence artefact. Evidence records the check, not the credential.
7. A residual risk register accompanies every score publication. The absence of findings is reported as the absence of findings, not as the absence of risk.
8. **Harness evidence is labelled as harness evidence (corrected defect 6).** An executed test against a disposable fixture proves the design of the fixture's subject and nothing else. `docs/A5_PRIVILEGE_EVIDENCE.txt` is **disposable database-harness evidence**: fourteen privilege, grant, trigger and row-level-security cases executed against a throwaway `postgres:18.6-alpine` container and volume, both removed by the run, with no application, no migration stream and no project instance involved. It may be cited for ADR-019's grant design and for the QA-07 row scored 0.5 at §9.1. It may **not** be cited as application security verification, as authorisation behaviour, as a migration test, as a restore test, or as any part of an L4 claim. The same rule generalises: every evidence artefact names the environment class it was produced in — `disposable-harness`, `local-container`, `host`, `second-environment`, `production` — and a claim may not reach above its class.
9. **A published score names its level (§7A).** A number without a level label is an incomplete record and the batch that published it is incomplete.

---

## 12. Adoption changes, and their state after this batch

| Document | Change | State |
|---|---|---|
| `docs/SECURITY_AND_PERMISSIONS.md` | Add §16 as the security verification plan: case IDs, methods, numeric exit criteria, and a mapping to ASVS 5.0.0 Level 2 areas and to OWASP Top 10:2025. No separate security plan file is created | **Done.** §16 exists in that document under the heading *Verification plan — how each control above gets proved*, and no competing security file was created — `ls docs` still counts 14 markdown documents. Owner directive §1 authorised the extension, not a new document |
| `docs/REQUIREMENTS_TRACEABILITY.md` | Add the mapping column and the `QA-*` cross-reference rule of §5; correct the C-15 stale tally in the REQ-TEST-002 evidence cell | **Half done, and the half that did not land is registered rather than glossed.** The tally is corrected: REQ-TEST-002's evidence cell now carries a 2 November re-measurement produced by the command printed in §1, not an inherited count. The mapping column was **not** added. The register's tables still carry the seven columns `ID`, `Source`, `V1/F`, `Implementation location`, `Test(s)`, `Evidence`, `Status`, and adding an eighth to 221 rows mid-closure would move every one of them under the table gate while crediting nothing the Owner asked to be closed. It is a Phase 2 pass, owned by the register, and saying so here is the only honest form of the row |
| `docs/IMPLEMENTATION_PLAN.md` | Add the phase entry and exit conditions of §8; C-11 and C-12 are no longer prerequisites to register — they closed by execution | **Not adopted, deliberately, and this row is the correction.** §8 closes with *`docs/IMPLEMENTATION_PLAN.md` remains the schedule authority*; copying §8's table into the plan would put two schedule authorities in the repository, which is the competing-document defect this framework was created to avoid. C-11 and C-12 are reflected where they belong: the plan's Level B rows and B-01…B-12 states now record what executed |
| `docs/ARCHITECTURE.md` | Extend the document map to the new files and open the five missing ADR slots | **Not done in this batch.** The document does not yet list `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` or `docs/PHASE1_DISCOVERY_AND_READINESS.md` as governed artefacts, and no ADR slot was opened for the five. Both are Phase 2 housekeeping; the closure record says so rather than claiming a map that was measured as absent (`grep` for those two filenames in `docs/ARCHITECTURE.md` returns no line) |
| `docs/ARCHITECTURE_DECISIONS.md` | Record the Owner's §1 defaults as ADRs with the Part VII dependency-justification fields: CSS custom properties + CSS Modules; GSAP / Motion / CSS split; Lenis deferred; Rare Pieces as an editorial treatment with no new route; `brand/` quarantine; security document extended rather than duplicated | **Done.** `grep -c '^### ADR-'` returned **33** when this batch closed; ADR-026…ADR-033 are the eight defaults the Owner settled on 2 November, appended without renumbering the existing twenty-five. The same command returns **34** as of the SR-04 remediation batch on the same date — **ADR-034** is the rate-limit store-and-failure-mode decision that plan item 2.9 required, and it is outside this row's scope rather than a ninth default — and returns **36** as of 3 November 2026, when **ADR-035** recorded the serving byte ceiling (risk SR-09) and **ADR-036** the declaration that keeps the private store out of the deployment trace (risks SR-37 and SR-21's build half); those two are outside this row's scope for the same reason |
| `docs/DESIGN_SYSTEM.md`, `docs/MOTION_SYSTEM.md`, `docs/PERFORMANCE_BUDGET.md`, `docs/VISUAL_QA_MATRIX.md` | Created in Phase 2 onward, using §6's schema; each opens with its unresolved Owner inputs marked BLOCKED rather than with invented values | **Not created by this batch** — creating them now would produce documents with no artefacts to describe, which §1 forbids reading as progress |
| `docs/CHANGELOG.md` | Record this framework and the discovery report as the Phase 1 deliverable pair, and this adoption as the event that made the framework an instrument rather than a proposal | **Done.** Section *P. Closure under the Owner's 2 November directive* closes the file, after section *O* of the same day; both the framework and the discovery report are named in it |
| `docs/OWNER_INPUT_REGISTER.md` | Add OD-8 to OD-16 as **decisions**, not as facts, and leave the Outstanding OID rows untouched | **Done.** OD-8…OD-16 are recorded as decisions taken under the Owner's directive, each pointing at the artefact that carries it; OD-16 is still open and is written as open. The Outstanding OID rows were reconciled against `reference/` evidence, not deleted |

---

## 13. Non-goals of this framework

It authorises nothing by itself. The Owner's directives authorise; this document measures. It does not license deploying, editing the Master Specification, re-designing an approved asset, asserting a right, or beginning Phase 2 — and the conditional adoption of v0.2.0 changes none of those, only the arithmetic by which progress is reported. It does not measure the mandate's own ambition; it measures the product. It does not permit a dimension to be reported as complete because the team feels it is close, and it does not permit an untested row to be counted as passed. It cannot produce a claim of security certification, and it does not treat the presence of a document as evidence of behaviour. Since v0.2.0 it additionally cannot be read as a single undifferentiated "acceptance" number: CAP-10 requires the level (§7A) on the face of every score it publishes.

---

## 14. Correction log for v0.2.0 — the Owner's ten defects, each with its landing place

| # | Defect as the Owner's §2 states it | Where corrected | How, in one line |
|---|---|---|---|
| 1 | Full acceptance credit requires S, I and V complete | §3.1 | `c_r = min(S_r, I_r, V_r)`, replacing `min(I_r, V_r)`, with the three zero-consequences restated |
| 2 | No rule may let an unresolved High security finding be waived | §3.3 CAP-3, §7 High row, §7 closing paragraph | The conditional at `reference/Noujoude_Master_Specification_EN.md` §G.12, line 3929 that allowed "explicit risk acceptance" is deleted as a waiver route; a High finding closes only on implemented-and-verified evidence, and today no security row is at PASS, so production acceptance is blocked by rule |
| 3 | The reduced-motion example and its CAP references were wrong | §3.4 | Now held by CAP-1 and CAP-5, not CAP-3, with the mis-citation named instead of quietly dropped |
| 4 | Responsive: specification and verification were conflated | §2 QA-08 row, §3.3 CAP-6 note, §3.5 | `S_08 = 0.35` (device categories unfixed) separated from `V_08 = 0` (no render); the emulation-labelling duty moved to CAP-6 where it belongs |
| 5 | B-08 wording overstated what cannot run | §2 QA-01 row, §10A "B-08 wording" note | Local automated gates execute and are listed with their exits; what is unverified is CI execution and independent second-environment execution, and each claim must say which |
| 6 | A.5 evidence must be labelled as what it is | §11 rule 8, §9.1 item 2 | `disposable database-harness evidence`, credited 0.5 not 1.0, barred from standing for application security verification, migration, restore or any L4 claim; generalised into an environment-class ladder |
| 7 | Caps expressed mathematically, as percentages of the dimension's weight | §2 convention note, every §2 cap cell, §3.5 register | `A_d ≤ k_d × W_d` with `k_d` derived as an integer row fraction and the numeric ceiling printed beside it |
| 8 | A fair within-dimension weighting that cannot be gamed by splitting rows | §3.2 weighting rule, §3.3 CAP-9 | Equal `1/N_d` weights, no criticality multipliers inside the arithmetic (criticality blocks instead, §7), `N_d` frozen, splits require a baseline source line and a dual republish |
| 9 | Documentation verification, Phase 1 exit, implementation acceptance and production acceptance distinguished | §7A, §3.3 CAP-10, §9 header | Four named levels L1–L4 with evidence types, what each does not prove, and today's state: L1 achieved, L2 **not met**, L3 4.1/100, L4 blocked by CAP-3 as written |
| 10 | Blocker counts and statuses reconciled, no duplicate or misleading classifications | §10, §10A, §10B | Ten registered blockers, six cleared and four open, stated as a countable pair; B-07 added (it was missing); six ex-blockers moved to §10B with the reason each stopped being one |

**Score recalculated, not adjusted:** **4.1 → 4.1**. The recalculation moved `Σc` by `−1.0` (Rule B withdrawing the credit a hollow `typecheck` run had been given) and by `+0.5 + 0.5` (the restored lint gate and the completed privilege harness, the latter at harness-class), itemised row by row at §9.1. `S` stays 0.70; `V` stays 0.04; `I` moves 0.04 → 0.05 because the ledger attributes implementation more finely than v0.1.0 did. The corrected framework scores this project the same and no higher, and can now show the provenance of every fraction.

---

## 15. Approval

| Field | Value |
|---|---|
| Proposed by | Qoder working agent, 2 November 2026 (v0.1.0) |
| Basis | Phase 1 discovery, four read-only audits, direct file inspection, executed gates |
| Approver | **The Owner**, 2 November 2026, through the `FINAL OWNER DIRECTIVE — PHASE 0 & PHASE 1 CLOSURE → PROFESSIONAL MOTION PHASE` §1 ("adopt the corrected Quality Acceptance Framework") and §2 (the ten corrections). Named approver of record: the Owner, in that directive. This agent did not approve the framework; it applied the corrections the approver specified |
| Form of approval | **Conditional adoption.** v0.1.0's own condition — "not usable as an acceptance record until the Owner approves it" — is discharged by the directive; the condition *inside* the approval was that the logical and mathematical defects be fixed first, and §14 is the record that they were |
| Decision closed | OD-8 (adopt or amend) → adopted as amended. OD-9 to OD-15 → decided by the Owner's §1 defaults and recorded per §10B. **OD-16 remains open** and is not treated as closed by this adoption |
| Effective | 2 November 2026. Scores published from this date are scores of record **only when they name their level (CAP-10) and carry the §11 evidence rules**. The §9 figures are the first score of record under v0.2.0: **4.1 / 100, level L3**, dated 2 November 2026, superseded by each later run — and they are *not* a Phase 0/1 closure claim, which is a separate instrument (§7A, level L2) and is currently **not met** |
| What approval does not mean | It does not approve a gate, a deployment, a rights state, a brand asset, or the reading of 4.1 as "4 % complete". §0's second row still holds: this is a reporting overlay, and gate passage lives in `docs/IMPLEMENTATION_PLAN.md` §4A |
