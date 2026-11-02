"use client";

import { RenderFailure } from "@/ui/render-failure";

/**
 * `src/app/[locale]/error.tsx` — the boundary for a failure inside a locale page.
 *
 * Why this segment and not the root: a boundary catches what is *below* it, and the root layout of
 * this application is `src/app/[locale]/layout.tsx` — there is no `src/app/layout.tsx`. A page that
 * throws while reading its media slots is inside this segment, so this is the boundary that fires, and
 * it fires while the locale layout is still standing: the header, the navigation and the measured
 * footer counts keep rendering, because nothing about them failed. `src/app/global-error.tsx` is the
 * one above the layout, and it owns the case where the layout itself cannot render.
 *
 * The register (`SR-05`) named `src/app/error.tsx` as the file to add. Placing it there would have put
 * the fallback outside `<html lang dir>` and outside the locale contract §4.2 builds, so it sits in the
 * segment that actually catches the throw. That is the same sentence the boundary renders either way —
 * `src/ui/render-failure.tsx` holds it, and `src/ui/render-failure.test.tsx` asserts what a boundary
 * must never do with the message it is handed.
 */

export function LocaleError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  return <RenderFailure digest={error.digest ?? null} reset={reset} />;
}

// The App Router reads the default export; `src/ui/render-failure.test.tsx` imports the named one, so
// the boundary is testable without a relative default import — which the project's own
// "prefer named exports at domain boundaries" guard in `eslint.config.mjs` exists to stop.
export default LocaleError;
