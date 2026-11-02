"use client";

import { SITE_NAME } from "@/domain/site";
import { RenderFailure } from "@/ui/render-failure";
import "@/ui/styles/global.css";

/**
 * `src/app/global-error.tsx` — the last boundary, and the only one that has to build a document.
 *
 * It fires where `src/app/[locale]/error.tsx` cannot: on a failure inside the locale layout itself,
 * which in this shell is a real and measured path rather than a hypothetical one. That layout calls
 * `publicServingSummary()` for its footer, and `src/lib/server/media/registry.ts` throws
 * `AssetRegistryError` instead of guessing when the register cannot be read — the fail-closed choice
 * the gate is built on. Before `SR-05` the consequence of that throw was an unstyled 500 with no
 * boundary anywhere in the tree, and in development the response body carried the absolute path of the
 * repository on the machine.
 *
 * Three things this file has to do that the other boundary does not, and one it cannot:
 *
 *   * It renders its own `<html>` and `<body>`, because the layout that normally supplies them is the
 *     thing that failed. Next requires this of a root-segment error boundary.
 *   * It titles the document, through the same `SITE_NAME` the layout uses. A page with no title fails
 *     WCAG 2.2's 2.4.2, and a failure page is still a page a visitor is standing on.
 *   * It imports the global token layer, so the band is rendered with the palette rather than as
 *     unstyled browser defaults.
 *   * It cannot honour §4.2's locale contract. `lang` and `dir` are derived from the `[locale]` segment
 *     by the layout, and there is no segment left standing to read one from, so the document falls back
 *     to `lang="en" dir="ltr"` — the language the band's own copy is written in. An Arabic visitor who
 *     reaches this page sees English they did not choose; that is stated as the cost of the fallback,
 *     not papered over, and it is why the copy is marked `lang="en"` where it sits.
 */

export function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  return (
    <html dir="ltr" lang="en">
      <head>
        <title>{SITE_NAME}</title>
      </head>
      <body>
        <RenderFailure digest={error.digest ?? null} reset={reset} />
      </body>
    </html>
  );
}

// The App Router reads the default export; `src/ui/render-failure.test.tsx` imports the named one, so
// the boundary is testable without a relative default import — which the project's own
// "prefer named exports at domain boundaries" guard in `eslint.config.mjs` exists to stop.
export default GlobalError;
