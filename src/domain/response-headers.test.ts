import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * `src/domain/response-headers.test.ts` — the header set a visitor actually gets, asserted against the
 * configuration that ships it.
 *
 * Why the test reaches into `next.config.mjs` instead of holding its own list of headers: `SR-03` was
 * not a missing idea, it was a missing mechanism — the config carried a comment saying the header set
 * was "scheduled", while `docs/SECURITY_AND_PERMISSIONS.md` §6.1 states the requirement ("Strict Content
 * Security Policy and security headers configured for production", Standard §5 line 171). A suite that
 * asserted a copied-out list would have stayed green while the response stayed bare. This one reads the
 * shipped `headers()` output through the module loader, the same way
 * `src/domain/entry-routing.test.ts` reads the shipped `redirects()`, so the guard moves only when the
 * policy moves.
 *
 * The two environment readings are tested because the policy is one string built two ways: production
 * is what §6.1 names, and development is allowed exactly one relaxation for the dev tooling. Asserting
 * both keeps that relaxation from quietly becoming the shipped value.
 */

interface ResponseHeader {
  readonly key: string;
  readonly value: string;
}

interface HeaderEntry {
  readonly source: string;
  readonly headers: readonly ResponseHeader[];
}

interface NextConfigShape {
  readonly headers?: () => Promise<readonly HeaderEntry[]>;
}

interface ShippedPolicy {
  readonly entry: HeaderEntry;
  readonly byKey: Map<string, string>;
  /** The CSP split into directives, keyed by directive name. */
  readonly csp: Map<string, string>;
}

function directiveName(directive: string): string {
  const space = directive.indexOf(" ");
  return space === -1 ? directive : directive.slice(0, space);
}

async function policyFor(
  nodeEnv: "production" | "development",
): Promise<ShippedPolicy> {
  vi.stubEnv("NODE_ENV", nodeEnv);
  try {
    const imported = (await import("../../next.config.mjs")) as unknown as {
      readonly default: NextConfigShape;
    };
    const entries = await (imported.default.headers?.() ?? Promise.resolve([]));
    const [entry] = entries;
    if (entry === undefined) throw new Error("headers() returned no matcher");
    const byKey = new Map(
      entry.headers.map((header) => [header.key.toLowerCase(), header.value]),
    );
    const cspValue = byKey.get("content-security-policy");
    if (cspValue === undefined) {
      throw new Error("no Content-Security-Policy is shipped");
    }
    const csp = new Map(
      cspValue
        .split(";")
        .map((part) => part.trim())
        .map((directive) => [directiveName(directive), directive] as const),
    );
    return { byKey, csp, entry };
  } finally {
    vi.unstubAllEnvs();
  }
}

function directiveValues(
  policy: ShippedPolicy,
  name: string,
): readonly string[] {
  const directive = policy.csp.get(name);
  return directive === undefined ? [] : directive.split(" ").slice(1);
}

/**
 * The CSP tokens that the two dynamic-evaluation assertions need to spell out.
 *
 * `no-restricted-syntax`'s `Literal[value=/\beval\b/]` selector is a keyword scanner, so it also
 * matches the substring inside a Content-Security-Policy source expression. Naming the token is the
 * assertion itself: the finding `SR-03` closed is "the production policy grants no dynamic-evaluation
 * permission", and a test that cannot write the token cannot prove it is absent — while a test that
 * compares against the *dev tooling's* full directive is the only way to pin "development relaxes
 * exactly one string". Each disable is scoped to the single literal that needs it and re-armed on the
 * next line; the project's real prohibition on arbitrary code execution is `no-eval`,
 * `no-implied-eval` and `no-new-func`, and all three stay armed for this file. Same technique and
 * reasoning as the documented self-disable at the head of `eslint.config.mjs`.
 */
const UNSAFE_EVAL_TOKEN =
  // eslint-disable-next-line no-restricted-syntax -- CSP token named to assert its absence
  "'unsafe-eval'";

const DEVELOPMENT_SCRIPT_SRC =
  // eslint-disable-next-line no-restricted-syntax -- the exact dev directive, compared verbatim
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

describe("the response header set is present on every route (SR-03, §6.1)", () => {
  let production: ShippedPolicy;

  beforeAll(async () => {
    production = await policyFor("production");
  });

  it("covers every path the application serves, not a curated subset", () => {
    // One matcher, `/:path*`. The refusal endpoint under `/api/media/*` is a response too, and the
    // finding that opened this item measured it bare.
    expect(production.entry.source).toBe("/:path*");
  });

  it("carries a Content-Security-Policy at all", () => {
    expect(production.byKey.has("content-security-policy")).toBe(true);
  });

  it("denies every frame relationship the shell has no use for", () => {
    // Clickjacking is the named risk (ASVS V5, OWASP Top 10 A05); the shell embeds nothing and is
    // embedded by nothing, so a denial states the application's actual shape.
    expect(production.csp.get("frame-ancestors")).toBe(
      "frame-ancestors 'none'",
    );
    expect(production.csp.get("frame-src")).toBe("frame-src 'none'");
    expect(production.csp.get("object-src")).toBe("object-src 'none'");
    expect(production.byKey.get("x-frame-options")).toBe("DENY");
  });

  it("keeps every fetchable source on the application's own origin", () => {
    for (const name of [
      "default-src",
      "script-src",
      "style-src",
      "img-src",
      "font-src",
      "connect-src",
      "worker-src",
    ]) {
      expect(directiveValues(production, name), name).toContain("'self'");
    }
    expect(production.csp.get("base-uri")).toBe("base-uri 'self'");
    expect(production.csp.get("form-action")).toBe("form-action 'self'");
  });

  it("names no wildcard source anywhere in the policy", () => {
    // Nothing in the build reaches another origin: no `next/font`, no remote image pattern, no
    // analytics. A wildcard would be a permission the application does not need.
    for (const [name, directive] of production.csp) {
      for (const value of directive.split(" ").slice(1)) {
        expect(value, `${name} carries ${value}`).not.toBe("*");
      }
    }
  });

  it("ships no dynamic-evaluation permission in the production policy", () => {
    expect(directiveValues(production, "script-src")).not.toContain(
      UNSAFE_EVAL_TOKEN,
    );
  });

  it("records 'unsafe-inline' as the measured concession it is", () => {
    // The App Router inlines its flight data, so a policy without this produces a blank page rather
    // than a safer one. The value is asserted to exist, and the reason is written where the policy is
    // built; per-response nonces stay the open item that would retire it.
    expect(directiveValues(production, "script-src")).toContain(
      "'unsafe-inline'",
    );
    expect(directiveValues(production, "style-src")).toContain(
      "'unsafe-inline'",
    );
  });

  it("stops a browser re-interpreting a response body as something else", () => {
    expect(production.byKey.get("x-content-type-options")).toBe("nosniff");
  });

  it("refuses to hand a visitor's next request to whoever they land on", () => {
    expect(production.byKey.get("referrer-policy")).toBe("no-referrer");
  });

  it("closes the powerful browser APIs this shell does not use", () => {
    const permissions = production.byKey.get("permissions-policy");
    expect(permissions).toBeDefined();
    for (const feature of [
      "camera",
      "microphone",
      "geolocation",
      "payment",
      "usb",
    ]) {
      expect(permissions, feature).toContain(`${feature}=()`);
    }
  });

  it("treats every response as this origin's own, for embedding and for opening", () => {
    expect(production.byKey.get("cross-origin-resource-policy")).toBe(
      "same-origin",
    );
    expect(production.byKey.get("cross-origin-opener-policy")).toBe(
      "same-origin",
    );
  });

  it("ships no Strict-Transport-Security, because its precondition is measured as unmet", () => {
    // This is the requirement speaking, not the implementation: §6.2 holds HSTS behind
    // "once HTTPS and subdomain policy are confirmed" (Standard §5 line 172) and says "do not
    // pre-enable", and SV-20's criterion is that HSTS is asserted 0 times until HTTPS exists. A header
    // a browser is not allowed to honour over plain HTTP is a control that cannot be verified, so its
    // absence is pinned here and the row moves when the Owner confirms a TLS origin.
    expect(production.byKey.has("strict-transport-security")).toBe(false);
  });

  it("names no report endpoint it cannot deliver to", () => {
    // A `report-to`/`report-uri` aimed at nothing reads as a monitored policy while reporting nowhere.
    // Reporting joins the set with the collector that SR-23 owns.
    expect(production.csp.has("report-to")).toBe(false);
    expect(production.csp.has("report-uri")).toBe(false);
  });
});

describe("the development policy, which is the same string with one exception", () => {
  it("relaxes exactly `script-src`, and nothing else", async () => {
    const development = await policyFor("development");
    const production = await policyFor("production");

    expect(development.csp.get("script-src")).toBe(DEVELOPMENT_SCRIPT_SRC);
    // Every other directive is identical, so a hole opened for the dev tooling cannot be mistaken for
    // the policy the requirement is about.
    expect([...development.csp.keys()].sort()).toEqual(
      [...production.csp.keys()].sort(),
    );
    for (const name of development.csp.keys()) {
      if (name === "script-src") continue;
      expect(development.csp.get(name), name).toBe(production.csp.get(name));
    }
  });
});

afterAll(() => {
  vi.unstubAllEnvs();
});
