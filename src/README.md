# `src/` — application source

**State: initialized, executing, and now carrying one real security surface (3 November 2026).** Directive
§14 line 250, "Initialize application in `src/`", is no longer an open Phase 1 item. `pnpm build` exits **0**
with **0** warnings and a **17**-entry route table (the 15 locale-prefixed page patterns, `/_not-found`, and
`/api/media/[assetId]`), `pnpm test` exits **0** on **397 tests in 15 files**, and `pnpm lint`, `pnpm typecheck`,
`pnpm format:check` and `pnpm test:gates` each exit **0**. The measurements are in
[`docs/IMPLEMENTATION_PLAN.md`](../docs/IMPLEMENTATION_PLAN.md) Level B and the transcripts in
[`docs/ROUTE_RUNTIME_EVIDENCE.txt`](../docs/ROUTE_RUNTIME_EVIDENCE.txt).

Measured on 3 November 2026, not inherited: **61 files** under `src/` — 29 `.ts`, 24 `.tsx`, 7 `.css`, and
this README — **11,194 lines** of TypeScript/TSX/CSS, of which **15 files are test files**. The earlier
sentence here said 32 files and 1,752 lines with 34 assertions; it was a Phase 1 snapshot that the media
layer, the response-header policy and the gate suites made false, and it is superseded by the count above.

**What is here is a shell, not a product.** Every page renders the title and purpose the baseline
itself supplies, and a notice saying the route holds no published records. No catalogue record, image,
editorial sentence, institutional claim or contact detail is rendered anywhere, because none has been
supplied — §6.1's rule that space must never be filled with fabricated content is enforced by the
shape of `ui/page-shell.tsx`: a route can only render what the registry gives it. The whole tree is
marked `noindex, nofollow` until approved content replaces it.

## Layout as it actually stands

```
src/
├── app/
│   ├── global-error.tsx              # last boundary: builds its own <html>, titles it, leaks nothing
│   ├── api/media/[assetId]/route.ts  # the only URL on which a derivative byte reaches a browser; 404 by default, 429 over allowance
│   └── [locale]/                     # en | ar — locale prefix mandatory (§4.2, line 408)
│       ├── layout.tsx                # <html lang dir> from the segment; §4.1 navigation; utility band
│       ├── error.tsx                 # boundary for a failed page, rendered inside the locale shell
│       ├── page.tsx                  # Home — §6.1's eight sections in baseline order
│       ├── the-museum/  worlds/  collections/  stories/  curator/  search/
│       ├── about/  contact/  privacy/  terms/
│       ├── worlds/[country-slug]/
│       ├── collections/[collection-slug]/
│       ├── artifacts/[artifact-slug]/
│       └── stories/[story-slug]/     # 4 detail routes; invalid slug → notFound(), never a render
├── domain/                           # pure: no Next imports, no I/O, no database
│   ├── locale.ts                     # the two identifiers, direction, resolution
│   ├── routes.ts                     # §4.2 route registry, §4.1 navigation, slug validation, switcher
│   ├── rights.ts                     # STT-002 public-serving gate, fail-closed
│   ├── site.ts                       # SITE_NAME, the one string used for this shell's own name
│   └── *.test.ts                     # assertions over the four modules above + next.config
├── lib/
│   ├── media/                        # presentation side: what a slot may ask for, never a byte
│   │   ├── asset-record.ts (+ .test) # the record a page may see, built from an explicit policy argument
│   │   ├── slot.ts (+ .test)         # alt text and src chosen from that record, through the same gate
│   │   └── usage-map.ts (+ .test)    # which surface may carry which asset
│   └── server/media/                 # server-only: the decision over whether a byte exists for the wire
│       ├── derivative-store.ts       # where the private store is; reads and validates lineage.json (no bypass)
│       ├── registry.ts (+ .test)     # the 82-row register over docs/ASSET_INVENTORY_AUDIT.csv, revalidated per request (SR-08)
│       ├── serving.ts (+ .test)      # the seven checks in order: gate, lineage, containment, 4 MiB ceiling, digest (SR-09)
│       ├── slot-facts.ts             # what a slot may render and the URL it may point at
│       ├── slots.ts (+ .test)        # the publicServingSummary the refusing pages read
│       └── request-limits.ts (+ .test) # the per-client token bucket consulted before anything else (SR-04)
├── types/environment.d.ts            # supplies Next's ambient types; `next-env.d.ts` is git-ignored
└── ui/
    ├── styles/global.css             # custom-property layer: §12.2 palette (proposed), §12.5 type
    │                                 # roles, §12.13 durations, reduced-motion override
    ├── page-shell.tsx + .module.css  # the shared unpopulated shell
    ├── detail-page.tsx + .module.css # slug validation + honest empty state
    ├── media-slot.tsx + .module.css  # the one image element, and the refusal it cannot skip
    ├── render-failure.tsx + .css     # the failure sentence, the correlation ID, the retry
    └── layout.module.css             # header/nav/footer, logical properties only
```

## What is absent, and what is not

`src/lib/server/` is no longer an absent directory: `src/lib/server/media/` holds the seven-check serving
decision, and it is the only code in this tree that reads a file at runtime. Still absent, each owned by a
later phase: `src/app/control-center/` (Phase 6), `src/payload/` with collections, hooks and access
(Phase 2), and `src/generated/` (derived, git-ignored).

There is still no image pipeline inside `src/`; derivatives are produced by
`scripts/build-media-derivatives.mjs` into `media-derivatives/`, and measured on 4 November 2026 that
directory holds **45 WebP files and a `lineage.json` of 45 rows**, with `originalsUnchanged: true`. The two
fail-closed conditions this section used to describe have separated rather than disappeared. Check 2, the
gate, now passes 46 of the 82 catalogued rows, because the Owner's declaration of 4 November armed the
cleared and approval markers and the register carries the citation — that is an Owner fact, recorded in
`docs/asset-governance/owner-authorization.json`, and not something this tree decided. Check 3, the store,
still stops one of those 46, because no derivative was produced for it. So 45 assets answer a media request
with bytes and every other id — 36 gate denials, one cleared-but-unproduced row, and everything outside the
register — answers the byteless `404`. `src/app/api/media/[assetId]/route.test.ts` derives that partition
from the register and the manifest on every run, which is why a withdrawal or a new derivative moves a
number instead of breaking a comment.

## Two rules that shape every file added here

- `reference/` and `Noujoude.photo/` are read-only. Application code may read asset data only through
  the media/rights layer, never by reaching into the original library at runtime. Measured against that rule
  on 3 November 2026: the runtime read surface is two files — `docs/ASSET_INVENTORY_AUDIT.csv`, the register
  `registry.ts` revalidates per request, and `media-derivatives/lineage.json` when a store has been
  provisioned — and both are _records about_ the library, never a handle into it. One test enumerates and
  stats `Noujoude.photo/` to re-measure the serving ceiling instead of trusting a comment: it reads names and
  sizes, not bytes. There is still no database behind any of it — `@/lib/db` has no implementation file,
  `tests/setup/env.ts` mocks it so that both branches refuse, and integration tests stay gated behind
  `NDM_ALLOW_INTEGRATION`.
- No commerce surface of any kind — including hidden, unlinked, API-only or admin-configurable
  variants — and no price or product schema installed at all (Master Spec Appendix G.3, line 3702).

## Reading the green

Per Directive §15, a route or a component is not proof of a completed feature. The claims this
directory can support are narrow: the canonical route set exists and is locale-prefixed; the writing
direction follows the locale; an untrusted slug is refused; the rights gate is a closed vocabulary that
answers each of its four questions from a cited marker rather than from a heuristic, and refuses an
unrecognised state instead of allowing it; the shell renders no content it was not given. Since the serving
layer landed, four more claims are test-pinned rather than asserted: a lineage row that names a path outside
the store is refused before any read; a derivative whose bytes exceed the 4 MiB serving ceiling, or no
longer hash to what the manifest records, is not served; every refusal answers `404` with the reason
withheld from the body; a client past its per-surface allowance answers `429` — measured in-process, not
yet measured over a running `next start`. Two of those branches are now reachable with real assets rather
than only with fixtures, and both are read that way: the digest re-check and the containment check run on
requests for the 45 served derivatives, and a substitution written into a copy of the store is refused
(`route.test.ts`, "the bytes a visitor receives are the bytes the manifest recorded"). The claims it cannot
support: that the museum has content beyond what the Owner has authorised and the register records, that a
served image is evidence about the object depicted in it (`DEC-INV-001` and B-05 keep provenance open — the
rights question and the historical question are different questions), that the design system is approved
(BA-001…BA-007, OD-16), that any page is release-ready, or that anything here has run in CI (B-08,
zero runs — there is no remote).
