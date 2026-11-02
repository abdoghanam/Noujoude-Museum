# `src/` — application source

**State: initialized and executing (2 November 2026).** Directive §14 line 250, "Initialize application
in `src/`", is no longer an open Phase 1 item. `pnpm build` exits **0** over 16 routes, `pnpm start`
serves them, and `pnpm test` exits **0** on 34 assertions. The measurements are in
[`docs/IMPLEMENTATION_PLAN.md`](../docs/IMPLEMENTATION_PLAN.md) Level B and the transcripts in
[`docs/ROUTE_RUNTIME_EVIDENCE.txt`](../docs/ROUTE_RUNTIME_EVIDENCE.txt).

32 files, 1,752 lines of TypeScript/TSX/CSS: 18 `.tsx`, 8 `.ts` (4 of them test files), 5 `.css`,
plus this README.

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

Absent on purpose, each owned by a later phase: `src/app/control-center/` (Phase 6), `src/payload/`
with collections, hooks and access (Phase 2), `src/lib/server/` (Phases 2, 6, 7), `src/generated/`
(derived, git-ignored), and any image pipeline (nothing may be served until B-06 clears rights).

## Two rules that shape every file added here

- `reference/` and `Noujoude.photo/` are read-only. Application code may read asset data only through
  the media/rights layer, never by reaching into the original library at runtime. Today there is no
  data access at all: `tests/setup/env.ts` mocks `@/lib/db` and integration tests are gated behind
  `NDM_ALLOW_INTEGRATION`.
- No commerce surface of any kind — including hidden, unlinked, API-only or admin-configurable
  variants — and no price or product schema installed at all (Master Spec Appendix G.3, line 3702).

## Reading the green

Per Directive §15, a route or a component is not proof of a completed feature. The claims this
directory can support are narrow: the canonical route set exists and is locale-prefixed; the writing
direction follows the locale; an untrusted slug is refused; the rights gate returns a denial for every
asset in the library's recorded state (0 of 82 cleared, none approved) and refuses an unrecognised
state rather than allowing it; the shell renders no content it was not given. The claims it cannot support: that the museum has content, that the design system is approved
(BA-001…BA-007, OD-16), that any page is release-ready, or that anything here has run in CI (B-08,
zero runs — there is no remote).
