# Noujoude — Motion system and page-by-page direction

Document: `docs/MOTION_SYSTEM.md` · Written 2 November 2026 by the motion-phase batch that the Owner's
FINAL OWNER DIRECTIVE §7 authorized **after** Phase 0/1 closure, and not before it (closure commit
`28aa2145182350c19442c5a1d2ac831508870b8a`, evidence `docs/PHASE01_CLOSURE.json`).

**What this document is.** The motion system for the public museum: the token layer, the one-owner-per-class
engine matrix, the scene format, and the per-page direction §7 names. It is the file
`docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` §6's storage decision assigns the `QA-05` motion rows to, and it is the
file `docs/PHASE1_DISCOVERY_AND_READINESS.md` line 258 lists as a deliverable to create because the baseline
fixes effects and durations but supplies no scene specification, no token map and no engine ownership.

**What this document is not.** It is not a claim that anything animates. Measured on the host the moment this
file was written: `gsap`, `motion` and `lenis` are absent from `package.json`, from `pnpm-lock.yaml` and from
`node_modules`; `grep -c "transition"` over the six module sheets under `src/` returns 0; zero files under
`src/` carry a client directive, so every route in the build is a server component and no React animation hook
has anywhere to live. Per `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` §4, a row may never be moved to PASS by a
document alone, and this document moves no score — §9 says what would.

---

## 1. What was inspected first, and what the inspection returned

§7's first instruction is to inspect the approved visual assets and the actual page structure before proposing
motion. Both were inspected with commands, and the first inspection produced a constraint rather than a palette
of material to animate.

| Inspection | Measured result | Command that produced it | Consequence for motion |
|---|---|---|---|
| Approved visual assets available to animate | **0 of 82** catalogued assets are approved; every row records rights `UNKNOWN` or pending and approval `Not Approved`; the 3 uncatalogued files are `Reference Only` at best, pending the Owner disposition recorded as AST-3 | `grep -c 'Not Approved' docs/ASSET_INVENTORY_AUDIT.csv` → 82, against 82 data rows | Cinematic motion whose subject is an image cannot be specified against an image that may never be cleared. Scenes below are specified against **slots**, not against files |
| Brand material | The untracked `brand/` tree is preserved and quarantined, never adopted; zero brand files carry an approval (`BA-001`, `OD-16`) | `docs/ARCHITECTURE_DECISIONS.md` ADR-032; `git ls-files -- brand` → empty | No identity animation, no logo reveal, no mark choreography is specifiable yet — the mark slot renders as text |
| Imagery reachable from code | **0** `next/image` imports, **0** `img` elements, **0** asset file references anywhere under `src/`; the only occurrence of the string for the photo library under `src/` is the read-only rule sentence in `src/README.md` | `grep -rn` over `src/`, counted per pattern | The current build has no image to scale, cross-fade or reveal. Everything below is therefore about type, space, light and pace — which is what the baseline's tone section asks for anyway |
| Page structure | **15** canonical routes plus the generated not-found, each rendering the shared shell with an explicit unpopulated notice; locale-prefixed, English and Arabic | `pnpm build` → 16 routes (`docs/PHASE01_CLOSURE_TRANSCRIPT.txt`); registry read from `src/domain/routes.ts` lines 52–158 | Motion is specified per canonical route key, so it cannot drift from the routes the tests assert |
| Interactive surface count | **0** client components in the whole tree | `grep -rn '"use client"' src/` → 0 | Any scene under ADR-027 or ADR-028 begins by introducing a client boundary — a real architectural step, listed in §8 rather than hidden in a scene row |
| Existing motion | Motion **tokens** exist; motion **behaviour** does not. Durations and the one easing curve are `src/ui/styles/global.css` lines 56–61; the reduced-motion override is lines 137–154. Across the four module sheets and the one global sheet under `src/` there are **0** `transition` declarations and **0** `@keyframes` blocks — the only animation-related properties anywhere in the tree are the three override lines at 149–151 | Reads and greps quoted above, run on this host 2 Nov 2026 | The token layer the Owner approved as the default (ADR-026) is already the right place for this, so nothing new is needed to hold it |
| Verification harness | `pnpm test:e2e` exits **1** with `Error: No tests found`; `playwright.config.ts` declares `testDir` `./tests/e2e`, which does not exist; four projects are configured, including two RTL ones | run on this host, 2 Nov 2026, with the web server skipped | No rendered-inspection instrument exists. CAP-5 requires rendered inspection, so no motion row can reach PASS from this file (§9) |

---

## 2. Owner inputs this document is waiting on

Per the adoption rule in `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` §12, this file opens its unresolved inputs as
BLOCKED rows instead of inventing values for them.

| Waiting on | Register | What it gates |
|---|---|---|
| Brand adoption (`BA-001` … `BA-007`) | `OD-16`, `ADR-032` | Any motion that reveals, transforms or frames the mark; the entrance sequences of §6 depend on it for their first and last beat |
| Rights and approval per asset | `OID-15`, `OID-16`, `OID-17`, blocker `B-06` | Every image-driven scene: subtle image scale, soft light reveal, corridor-like transition — all specified as slots below, none bindable |
| Artifact and editorial records | `OID-08` … `OID-17`, blocker `B-12` | Reveal choreography for real content; a reveal of the empty-state notice would be motion performed for its own sake |
| Arabic display and body type | `OID-18` | Entrance motion of Arabic headings. The metric fallbacks differ from the licensed faces, so a line-mask or fade timed against a fallback measures the wrong thing |
| Dependency installation | the standing rule quoted at ADR-027 and ADR-028: uncontrolled installation is not authorized | The GSAP and Motion layers themselves. Selecting the engines was §1; installing them is an Owner-visible act that has not happened |
| Approved palette values as brand | `BA-002` | Whether the champagne-on-noir light treatment below is brand language or a proposal |

---

## 3. The token layer

Durations and the easing curve are not this document's to choose; they are the baseline's reference timing table
at `reference/Noujoude_Master_Specification_EN.md` §12.13, lines 1813–1819, already transcribed as custom
properties at `src/ui/styles/global.css` lines 56–61, and the reduced-motion obligation is line 1821 of the same
section, reinforced by §16.3 line 2365, which the framework quotes as the reason branding cannot switch the
behaviour off. Scenes name tokens, never literals — the same rule ADR-027 writes for a GSAP timeline
definition.

Three additions are proposed, and they are **proposed engineering defaults, not baseline values**: the baseline
fixes durations and says nothing about distance or stagger, so the choice belongs here and is reversible by
review, exactly as the layout scale in `src/ui/styles/global.css` lines 63–69 already is.

| Token | Proposed value | Role | Why this value |
|---|---|---|---|
| `--ndm-motion-near` | `8px` | Restrained upward movement, the small translate of a component entering | One line-height fraction; large enough to read as movement at arm's length, small enough never to reflow the reading measure |
| `--ndm-motion-far` | `24px` | The corridor and archive-opening beats | Three times the near step, so the two tiers stay audibly different without becoming a slide |
| `--ndm-motion-stagger` | `60ms` | Per-item delay inside a reveal sequence | Keeps a six-item group inside the slow-reveal budget of 800 ms rather than stretching it past the cinematic tier |

No token may be added whose value would be quoted back as a brand decision. Colour, type and spacing tokens stay
where they are, in the one custom-property layer ADR-026 establishes; a motion value in a component sheet is a
defect of the same kind as a hard-coded colour.

---

## 4. Engine ownership — one class, one owner

The four ADRs the Owner's §1 directed are already accepted, so this section does nothing but state their
consequence as an operating table. No fifth engine may appear; two owners on one property of one element is a
defect **even while both engines are uninstalled**, which is ADR-029's own wording and the reason this table
exists now rather than at implementation time.

| Motion class | Owner | Installed? | Scope it may touch | Required behaviour under `prefers-reduced-motion` |
|---|---|---|---|---|
| Cinematic timeline, scroll-driven scene, corridor-like transition, archive-like opening, major entrance | ADR-027 — GSAP | **No** | Whole-surface choreography, one per declared scene | The scene collapses to its end state; nothing waits on a scroll position to become visible |
| Component interaction: hover, press, focus, enter and exit of one element | ADR-028 — Motion for React | **No** | Inside one component, one element's properties | A state change with no animation, applied instantly |
| Simple state change expressible as one transition: colour, opacity, border, focus ring, a small transform | ADR-029 — plain CSS | Not applicable, no library needed | The property list above, against the §3 tokens | Handled by the override at `src/ui/styles/global.css` lines 137–154, which wins over any later layer |
| Smooth scrolling | ADR-030 — Lenis, **deferred** | **No** | Nothing in this phase; native scrolling is the baseline | Not applicable — and hijacking scroll for an entrance effect is prohibited outright |

The rule that keeps the classes honest: a surface declares its owner before it animates. A surface with no
declared owner does not acquire one at implementation time; it gets a review comment against ADR-029. And no
JavaScript engine may animate a property that a CSS transition already owns on the same element, because the
measurable result of that collision is jank, not richness.

---

## 5. Doctrine — what the motion is for, and the limits on it

The baseline states the purpose and the prohibition in one line each, at §12.13 lines 1807, 1809 and 1821, and
§7 of the directive repeats the second half in the Owner's own words: do not turn the website into an animation
showcase. Read together, these are the rules this system operates under.

- Only the ten approved effect types are in the vocabulary: slow fade, gentle reveal, restrained upward movement,
  subtle image scale, soft light reveal, controlled transition, delicate hover feedback, corridor-like
  transition, archive-like opening, respectful loading state. An effect outside that list is not a nicer idea;
  it is a defect requiring an ADR.
- One choreographed beat per page, not a sequence of beats competing for the same attention. The museum tone the
  baseline sets at §12.1 comes from space, material and light.
- Motion never carries information that is not also available statically. A reveal is a way of arriving, not a
  way of hiding.
- No scroll-jacking, no pinned sections that must be scrolled through, no infinite loop, no idle animation on a
  reading surface, no parallax stack, no scramble or typewriter effect on text, no motion that gates a control's
  reachability, and no animation of the empty-state notices.
- Loading states are respectful, which here means honest: they show that a record is being fetched, never a
  decorative pretence of scholarship.
- Arabic scenes are specified, then verified in Arabic. A right-to-left entrance is not a left-to-right one
  mirrored; the direction fact comes from the locale layout and the sheet uses logical properties, so motion
  offsets must be declared in logical terms too.
- Reduced motion is not a degraded experience to apologise for; it is the same page arriving at its end state.

---

## 6. Page-by-page direction

Each row is a scene specification. The format is the one this document defines in §7 below. Paths are the real
files of the current build; every scene's content dependency is stated, because a scene that cannot bind to
approved content is a slot, not an animation.

| Route key | Surface | Scene | Trigger | Effect from the approved list | Engine class | Tokens | Reduced motion | Content dependency |
|---|---|---|---|---|---|---|---|---|
| `home` | `src/app/[locale]/page.tsx` with `src/app/[locale]/page.module.css` | `S-HOME-01` Arrival | First paint of the hero region, once per session | slow fade into soft light reveal, then restrained upward movement of the lede | ADR-027 | entrance tier `--ndm-duration-entrance`, `--ndm-motion-near`, `--ndm-motion-stagger` | Hero and lede render in their end state, no scroll position required | The image slot is empty until `B-06` clears an asset; the text beat needs the Owner's narrative (`OID-07`) |
| `home` | same | `S-HOME-02` Corridor into the collection | Scroll enters the discovery band | corridor-like transition, one stage only | ADR-027 | `--ndm-duration-cinematic` | Band appears in place | Worlds and Collections tiles exist today; their imagery does not |
| `the-museum` | `src/app/[locale]/the-museum/page.tsx` inside `src/ui/page-shell.tsx` | `S-MUSEUM-01` Room by room | Section enters the viewport | gentle reveal, then slow fade of the separator | ADR-027 | `--ndm-duration-slow-reveal`, `--ndm-motion-far` | Sections visible immediately, separators static | Institutional identity (`OID-01` … `OID-07`) and every record on the page |
| `stories`, `story-detail` | `src/app/[locale]/stories/page.tsx`, `src/app/[locale]/stories/[story-slug]/page.tsx` | `S-STORY-01` Opening the archive | Route change settles; first paragraph is in view | archive-like opening on the frame only, then nothing animates inside the prose | ADR-027 for the frame, ADR-029 for the link state | `--ndm-duration-cinematic` for the frame, `--ndm-duration-standard` for links | Prose renders complete | Story records; the editorial copy for both locales |
| `stories`, `story-detail` | same | `S-STORY-02` Reading pace | Deliberately none | not applicable — a reading surface gets no idle motion | n/a | n/a | n/a | n/a — this row exists to make the prohibition explicit |
| `worlds` | `src/app/[locale]/worlds/page.tsx` | `S-WORLDS-01` Directory settle | Tiles paint | restrained upward movement with a bounded stagger across the grid | ADR-028, one element per tile | `--ndm-duration-standard`, `--ndm-motion-near`, `--ndm-motion-stagger` | Tiles visible, stagger removed | Country records (`OID-08` … `OID-17`); the Arabic grid re-validated in RTL |
| `world-detail` | `src/app/[locale]/worlds/[country-slug]/page.tsx` | `S-COUNTRY-01` Place arriving | Section enters the viewport | soft light reveal over the atmospheric band; subtle image scale only if an approved image exists | ADR-027 | `--ndm-duration-slow-reveal` | Band and image slot render at their end state | `OID-03` publishable location, `OID-15` image rights; §12.11 country variants are brand-level and `BA-002` is open |
| `collections`, `collection-detail` | `src/app/[locale]/collections/page.tsx`, `src/app/[locale]/collections/[collection-slug]/page.tsx` | `S-COLLECTION-01` Shelf to object | Hover or keyboard focus on a tile | delicate hover feedback; focus ring is a shape as well as a hue | ADR-029 for colour and opacity, ADR-028 if a transform is needed | `--ndm-duration-fast` | Underline and ring states unchanged, transform removed | Collection records |
| Rare Pieces treatment inside `collection-detail` | same file, no route of its own — ADR-031 | `S-RARE-01` The one deliberate beat | Entering the treatment's opening section, once | gentle reveal plus restrained upward movement of the framing rule; **no** additional effect, because this is the editorial distinction, not a set piece | ADR-027 | `--ndm-duration-slow-reveal`, `--ndm-motion-far` | Section renders in place | Approval that the treatment exists at all is `ADR-031`; the assets inside it are `B-06` |
| `artifact-detail` | `src/app/[locale]/artifacts/[artifact-slug]/page.tsx` with `src/ui/detail-page.tsx` | `S-ARTIFACT-01` Object under glass | First paint of the media slot | subtle image scale, then slow fade of the label block; the label is legible before the media settles | ADR-027 | `--ndm-duration-slow-reveal`, `--ndm-motion-near` | Media slot and label at end state; viewer opens instantly | This is the scene most blocked: the image, its rights and every claim beside it |
| `artifact-detail` | same | `S-ARTIFACT-02` Evidence disclosed | Reader moves to a claim's evidence line | controlled transition of the disclosure only | ADR-029 | `--ndm-duration-standard` | Content already present, transition removed | Provenance, ownership and authenticity records (`OID-11`, `OID-12`) — inventing any of them is prohibited, so nothing may animate into view that is not evidenced |
| `curator` | `src/app/[locale]/curator/page.tsx` | `S-CURATOR-01` Invitation, not theatre | Surface mounts | slow fade of the panel; **no** typing or streaming effect on model output | ADR-029 | `--ndm-duration-standard` | Panel visible at once | Provider selection (`B-05`, `OID-19`); governance forbids any pretence of authority, so a typewriter effect here would be a governance defect dressed as polish |
| `curator` | same | `S-CURATOR-02` Waiting honestly | A request is in flight | respectful loading state: one quiet indicator, no spinner theatre | ADR-028 | `--ndm-duration-fast` | Static text states the wait | Same as `S-CURATOR-01` |
| `contact` | `src/app/[locale]/contact/page.tsx` | `S-CONTACT-01` Field response | Focus and validation state | delicate hover and focus feedback; validation appears by controlled transition, never by shake | ADR-029 | `--ndm-duration-fast` | States apply instantly | Real contact details (`OID-06`); the inquiry module's retention rule (`OID-21`) |
| Utility band and navigation, every route | `src/ui/layout.module.css` inside `src/app/[locale]/layout.tsx` | `S-NAV-01` The only everywhere-motion | Pointer or keyboard focus | underline thickness and offset as a state change, colour against the token | ADR-029 | `--ndm-duration-fast` | Instant | None — this is the one scene implementable today |

---

## 7. The scene format, and the one gap in it

A scene is admissible only with all twelve fields filled: route key, surface file, scene id, trigger, effect
drawn from the approved list, engine class with its ADR, token names rather than literals, reduced-motion
behaviour, content dependency, plus the four the review adds — measured duration against the rendered frame,
owner-uniqueness on every animated property, unmount and cleanup behaviour, and the Arabic rendering.

**Registered gap, stated rather than papered over.** `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` line 53 makes
QA-05's test method a scene-by-scene review against **the 24-field specification**, and that field list is not
transcribed anywhere in this repository: a search of `docs/` and `reference/` for it returns that one mention and
nothing else. This section therefore supplies a twelve-field format the review can actually run on, marked as
this project's operational subset. The Owner's list, if it exists outside the repository, supersedes it; until it
is supplied, QA-05's method column cannot be quoted as satisfied and the discrepancy is recorded here so no
later batch can read the twelve as the twenty-four.

---

## 8. What implementation would change, in order

1. A client boundary per animated surface. Today there are none, so the first implementation step is structural,
   not decorative: which component opts in, and what stays a server component. The pages and layouts exempted
   from the client-boundary environment guard in `eslint.config.mjs` are exactly the files that would gain
   `"use client"`, so the guard's recorded precision gap and this step meet here and must be reviewed together.
2. The CSS-only layer (`S-NAV-01`, `S-CONTACT-01`, tile states) needs no dependency at all and could ship in one
   small batch with its own reduced-motion verification.
3. GSAP and Motion require the Owner's installation authorization plus the per-dependency justification sheet and
   the before-and-after bundle measurement ADR-027 names. No install is performed by this document.
4. Scroll evidence either way — measured, not asserted — is the trigger ADR-030 sets for re-opening Lenis.
5. Every scene above waits on its content dependency row before it may be built, or it becomes animation
   performed over an empty room.

---

## 9. Verification, and why no row below reads PASS

CAP-5 in `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` requires rendered inspection for the visual and motion
dimensions, and §4 of the same document forbids moving a row to PASS by writing about it. The instrument that
would render and inspect does not yet exist: `pnpm test:e2e` exits **1** with `Error: No tests found`, because
the configured `testDir` has never been created. So each `QA-05` row below is honestly `NOT TESTED` or
`BLOCKED`, the columns are filled in the framework's own schema, and the score stays where the closure record
put it: QA-05 `A_05 = 0.0`, capped by CAP-1 and CAP-5, total `5.45` of 100 at level L3.

| ID | Dimension | Requirement | Criticality | Page or component | Implementation location | Test method | Expected | Actual | Status | Evidence path | Remaining issue | Register mapping |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| QA-05-001 | Motion design | Every duration and easing comes from the token layer, never from a literal | High | All animated surfaces | `src/ui/styles/global.css` lines 56–61 | Static scan of the motion layer for numeric timing outside a custom property | `reference/Noujoude_Master_Specification_EN.md` §12.13 lines 1813–1819 | No motion layer exists to scan | NOT TESTED | `planned: evidence/QA-05/QA-05-001-2026-11-02.txt` | Depends on §8 step 2 or 3 | `REQ-UI-*` motion rows |
| QA-05-002 | Motion design | `prefers-reduced-motion` suppresses every scene and nothing essential is lost | Critical | Global | `src/ui/styles/global.css` lines 137–154 | Rendered run with the media preference emulated, per scene end state | §12.13 line 1821 and §16.3 line 2365 | 0 of 15 scenes rendered; e2e harness absent | NOT TESTED | `planned: evidence/QA-05/QA-05-002-2026-11-02.txt` | The override exists and is unexercised | `REQ-A11Y-*` |
| QA-05-003 | Motion design | Each animated property has exactly one engine owner | High | Per declared surface | `planned: scripts/verify-motion-owners.mjs` | Static check that no property appears under both ADR-029 and ADR-027 or 028 for one element | ADR-029's two-owner defect rule | No scenes implemented, so the check has nothing to read | NOT TESTED | `planned: evidence/QA-05/QA-05-003-2026-11-02.txt` | The checker is not written | ADR-027, ADR-028, ADR-029 |
| QA-05-004 | Motion design | Scroll behaviour is native; no smooth-scroll engine is present | Medium | Global | `package.json` dependencies | Install manifest plus a keyboard and assistive-technology scroll pass | ADR-030 deferral | `lenis` measured absent from `package.json`, lockfile and `node_modules` | BLOCKED | `planned: evidence/QA-05/QA-05-004-2026-11-02.txt` | The AT pass needs the rendered harness; deferral is a dated state, not a result | ADR-030 |
| QA-05-005 | Motion design | No scene animates an asset that is not cleared for display | Critical | Every media slot | `src/domain/rights.ts` plus the serving path | Negative run requesting an uncleared original inside an animated slot | Master Spec §13 rights rule and the fail-closed gate | The gate refuses all 82 assets and 0 bytes are served today, but no animated slot calls it | BLOCKED | `planned: evidence/QA-05/QA-05-005-2026-11-02.txt` | `B-06`, and the serving path of `SV-09` | `REQ-AST-*`, `SV-08`, `SV-09` |
| QA-05-006 | Motion design | The AI Curator surface uses no typing or streaming effect that imitates authority | High | `curator` | `src/app/[locale]/curator/page.tsx` | Rendered inspection of `S-CURATOR-01` and `S-CURATOR-02` | §14 governance of the specification, read with `docs/AI_CURATOR_GOVERNANCE.md` | Surface is an empty-state shell; provider unselected | BLOCKED | `planned: evidence/QA-05/QA-05-006-2026-11-02.txt` | `B-05`, `OID-19` | `REQ-AI-*`, `SV-19` |

Recount obligation, stated so it cannot be quietly skipped: writing §6 does supply the per-page scene
specifications that `docs/QUALITY_ACCEPTANCE_FRAMEWORK.md` line 270 names as the reason QA-05's `S` axis has not
moved, but no axis is adjusted in this batch, because the framework's own rule is that a number moves only with
the row arithmetic that justifies it, and the QA-05 matrix is not yet itemised into that ledger. The recount is
named work for the batch that lands §8 step 2, with the ledger shown.

---

## 10. Non-goals of this batch

No dependency installed. No component converted to a client component. No stylesheet animated. No production
deployment and no published content. No redesign and no backend work under the cover of the transition, which
§7 forbids by name. The quarantined `brand/` tree is untouched and untracked, and no scene above is presented as
approved brand behaviour.
