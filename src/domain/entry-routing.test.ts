import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LOCALE_IDENTIFIERS,
  resolveLocale,
} from "@/domain/locale";
import { ROUTES, buildPath } from "@/domain/routes";

/**
 * src/domain/entry-routing.test.ts — the root redirect must land on the entrance of the locale the
 * domain itself calls the default.
 *
 * `next.config.mjs` is JavaScript, so TypeScript cannot bind the two together, and the literal
 * destination there is free to disagree with `DEFAULT_LOCALE` silently — the kind of drift that
 * shows up as Arabic visitors landing on English or a route that exists in no locale at all. This
 * suite reads the real config file through the module loader rather than grepping its text, so it
 * fails if the shipped config changes, not if a comment changes.
 */

interface Redirect {
  readonly source: string;
  readonly destination: string;
  readonly permanent: boolean;
}

interface NextConfigShape {
  readonly redirects?: () => Promise<readonly Redirect[]>;
}

async function rootRedirects(): Promise<readonly Redirect[]> {
  const imported = (await import("../../next.config.mjs")) as unknown as {
    readonly default: NextConfigShape;
  };
  return imported.default.redirects?.() ?? [];
}

describe("the root URL is resolved inside the locale contract (§4.2 line 408)", () => {
  it("declares exactly one redirect, and it is the root", async () => {
    const redirects = await rootRedirects();
    expect(redirects).toHaveLength(1);
    expect(redirects[0]?.source).toBe("/");
  });

  it("sends `/` to the default locale entrance the domain names", async () => {
    const redirects = await rootRedirects();
    const expected = buildPath(DEFAULT_LOCALE, "home");
    expect(expected).not.toBeNull();
    expect(redirects[0]?.destination).toBe(expected?.path);
  });

  it("stays temporary while the default locale is an unratified engineering choice", async () => {
    const redirects = await rootRedirects();
    // A 301 here would be cached by browsers and CDNs, converting an unapproved choice into an
    // externally visible commitment that is expensive to walk back.
    expect(redirects[0]?.permanent).toBe(false);
  });

  it("lands on a path the registry builds, in a locale the contract declares", async () => {
    const redirects = await rootRedirects();
    const destination = redirects[0]?.destination ?? "";
    const buildable = new Set<string>();
    for (const locale of LOCALE_IDENTIFIERS) {
      for (const route of ROUTES) {
        if (route.param === undefined) {
          const built = buildPath(locale, route.key);
          if (built !== null) buildable.add(built.path);
        }
      }
    }
    expect(buildable.has(destination)).toBe(true);
    const [, firstSegment = ""] = destination.split("/");
    expect(resolveLocale(firstSegment)).toBe(firstSegment);
  });
});
