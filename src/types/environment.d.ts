/// <reference types="next" />

// Why this file exists and is committed.
//
// `next build` writes `next-env.d.ts` at the repository root, and that generated file is what
// normally pulls in `node_modules/next/types/global.d.ts` — the declaration that makes
// `import styles from '@/ui/page-shell.module.css'` and `*.css` side-effect imports type-resolve.
// `.gitignore` excludes `next-env.d.ts` (line 8), so on a fresh checkout — or in CI before the
// build step — `pnpm typecheck` would report `Cannot find module` for every stylesheet import.
// That is a tooling gap, not a code defect, and it is closed here with the same single-line
// reference the generated file uses. `next build` still regenerates its own copy; nothing in this
// file is authored, and nothing here overrides Next's own types.
