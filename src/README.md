# `src/` — application source

**State: intentionally empty at the end of Phase 1.**

Directive §3 assigns this directory to the application, with framework-required
root configuration living at `no/` root. The configuration at `no/` root
(`package.json`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`,
`playwright.config.ts`, `.env.example`, `docker-compose.yml`) is authored and
reviewable, but no dependency installation has been run.

This directory must not be treated as evidence of a working product. Per
Directive §15, a config file, a route, or a component is not proof of a
completed feature.

## What unblocks filling this directory

1. **B-01** — Node.js on the host is v24.19.0; Payload 3.92.1 requires
   `>=24.22.1`. Install Node 24.22.2 (see `docs/ARCHITECTURE_DECISIONS.md` §2
   and ADR-003). Nothing here installs itself.
2. `cp .env.example .env` and populate it.
3. `pnpm install` → `pnpm db:up` → Payload scaffold/migrations.
4. Then Phase 2 begins: domain model and migrations.

## Planned layout

```
src/
├── app/
│   ├── [locale]/            # en | ar — locale-prefixed routes are mandatory (Master Spec §4.2)
│   │   ├── the-museum/
│   │   ├── worlds/[countrySlug]/
│   │   ├── collections/[collectionSlug]/
│   │   ├── artifacts/[artifactSlug]/
│   │   ├── stories/[storySlug]/
│   │   ├── curator/         # AI Curator
│   │   ├── search/
│   │   ├── about/  contact/  privacy/  terms/
│   │   └── layout.tsx       # sets dir="rtl" for ar; CSS logical properties only
│   └── control-center/      # private root; server-side authorization on every operation
├── payload/                 # Payload config, collections, globals, hooks, access
├── domain/                  # museum domain services: claims, evidence, provenance,
│                            # rights, state machines (eight separate dimensions — ADR-009)
├── lib/server/              # authorization, storage adapter, AI retrieval gateway
├── ui/                      # design tokens, primitives, editorial card surfaces
└── generated/               # payload-types.ts (derived, git-ignored)
```

Two rules that shape every file added here:

- `reference/` and `Noujoude.photo/` are read-only. Application code may read
  asset data only through the media/rights layer, never by reaching into the
  original library at runtime.
- No commerce surface of any kind, including hidden, unlinked, API-only, or
  admin-configurable variants, and no price or product schema installed at all
  (Master Spec Appendix G.3, line 3702).
