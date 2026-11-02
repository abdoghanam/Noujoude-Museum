// Why this file exists and is committed.
//
// `react-dom` 19.3.1 is a declared runtime dependency in `package.json`, but its TypeScript types ship
// in a separate package, `@types/react-dom`, which is not on disk in this tree — `node_modules/@types`
// holds `react` only. The media slot tests have to assert *markup*, because the Phase 3 deliverable is
// a component that refuses to draw a pixel and a refusal is only observable through what a renderer
// emits. That renderer is `renderToStaticMarkup` from `react-dom/server`.
//
// Two ways close the gap: add a package, or declare the one function the tests call. No dependency
// enters the tree without a reason, and "a type shim for a single API already in use" is not one — so
// the signature is declared here, the same way `src/types/environment.d.ts` closes the stylesheet-typing
// gap left by the git-ignored `next-env.d.ts`, and the same way `scripts/lib/*.d.mts` type the shared
// Node helpers the media layer imports.
//
// If `@types/react-dom` is ever added as a devDependency, delete this file. The real package declares
// the whole server API; two ambient declarations of `react-dom/server` in one program is a maintenance
// trap, not a safety margin.

declare module "react-dom/server" {
  import type { ReactElement } from "react";

  /**
   * Render an element to a static HTML string: no event handlers, no `data-reactroot`, no hydration
   * markers. The subset the tests use, typed as the real one behaves — an element in, a string out.
   */
  export function renderToStaticMarkup(element: ReactElement): string;
}
