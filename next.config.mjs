// next.config.mjs — the application's own Next configuration.
//
// It exists because Directive §14 line 250 ("Initialize application in `src/`") is not satisfied by
// files in a directory: until `next build` loads a config, renders routes and exits 0, there is an
// application source tree but no application. Everything below is either a routing fact from the
// governing baseline or a documented default; nothing here pre-empts a later phase.
//
// WHAT IS DELIBERATELY ABSENT:
//   * `@payloadcms/next`'s `withPayload()` — the CMS is Phase 2 work (§14 lines 253–255 own models,
//     migrations and constraints), and wiring it now would import a database contract that does not
//     exist yet.
//   * `Strict-Transport-Security` — `docs/SECURITY_AND_PERMISSIONS.md` §6.2 holds it behind a
//     condition that is measured as unmet ("HSTS once HTTPS and subdomain policy are confirmed",
//     Standard §5 line 172), and SV-20's own exit criterion says HSTS is asserted 0 times until HTTPS
//     exists. `.env.example` still carries a `http://localhost` site URL. Sending the header over a
//     plain-HTTP origin would be a control that no browser is allowed to honour (RFC 6797 §7.2) and
//     that this project cannot verify — so it is absent on the record, not forgotten. See the
//     `SR-03` block below for what *is* shipped.
//   * Image remote patterns — 0 of 82 assets are cleared for serving (B-06), so there is no
//     permitted image origin to whitelist.
//   * A CSP report endpoint — reporting needs a collector URL, and an endpoint that does not exist
//     produces a policy that silently reports nowhere. Reporting belongs with SR-23 (logging and
//     audit trail), not here.

/**
 * The response-header policy, one place, so `src/domain/response-headers.test.ts` can assert against
 * the set the application actually ships rather than against a copy of it.
 *
 * `SR-03` in `docs/../risk-register` named this gap in one line: the shell answered every request
 * with nothing but content-type and content-length, so any frame that embedded a page could click on
 * it, any origin could read a referrer out of a link, and no policy said what a script may be. The
 * requirement it is mapped to is `docs/SECURITY_AND_PERMISSIONS.md` §6.1 — "Strict Content Security
 * Policy and security headers configured for production" (Standard §5 line 171).
 *
 * Two decisions below are concessions to what this application actually emits, and both are recorded
 * rather than hidden:
 *
 *   * `'unsafe-inline'` in `script-src` and `style-src`. The App Router ships its flight data as
 *     inline `<script>` elements and CSS Modules land as inline `<style>` in development, so a policy
 *     without them produces a blank page, not a safer site. A policy that breaks the product is not
 *     a control; it is an outage with a security vocabulary in it. The narrow fix is per-response
 *     nonces, which this build cannot enable without opting into Next's experimental CSP hook — so
 *     the value is stated here as the measured reason and the nonce path stays an open item.
 *   * `'unsafe-eval'` in development only. It is what a devtool that materialises modules through
 *     `eval` needs, and it is dropped from the production string, which is the string §6.1 names.
 *
 * The production policy is also deliberately narrower than the app today: `frame-src`/`frame-ancestors`
 * deny, `object-src` denies, `connect-src`/`img-src`/`font-src`/`worker-src` stay on `'self'`, and
 * `form-action` stays on `'self'` — because no form, no remote origin and no embedding exists yet,
 * and every one of those is a ceiling that is cheap to raise and expensive to lower later.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

const DEV_ONLY_CSP_DIRECTIVES = [
  // `'unsafe-eval'` is a Content-Security-Policy source keyword: naming it is how the policy *grants*
  // the permission the dev tooling needs, and dropping it from the joined production string is how the
  // policy withholds it. It is not a call to `eval()`, and the project's actual prohibition on arbitrary
  // code execution — `no-eval`, `no-implied-eval`, `no-new-func`, re-armed explicitly in
  // `eslint.config.mjs` after measurement showed the old selector did not catch `eval()` at all — stays
  // armed for this file. Only `no-restricted-syntax`'s keyword scanner is silenced, on this one line.
  // eslint-disable-next-line no-restricted-syntax -- CSP source keyword, not an eval() call
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
];

function contentSecurityPolicy(isProduction) {
  if (isProduction) return CSP_DIRECTIVES.join("; ");
  // Development keeps every production directive and relaxes exactly the one the dev tooling needs.
  const overrides = new Map(
    DEV_ONLY_CSP_DIRECTIVES.map((directive) => [
      directive.slice(0, directive.indexOf(" ")),
      directive,
    ]),
  );
  return [
    ...CSP_DIRECTIVES.filter(
      (directive) => !overrides.has(directive.slice(0, directive.indexOf(" "))),
    ),
    ...overrides.values(),
  ].join("; ");
}

function securityHeaders(isProduction) {
  return [
    {
      key: "Content-Security-Policy",
      value: contentSecurityPolicy(isProduction),
    },
    // A belt for the browsers that predate `frame-ancestors`. It is coarser than the CSP directive on
    // purpose: `X-Frame-Options` cannot be scoped per origin, and this application has no view that
    // is meant to be framed by anyone, so `DENY` states the same fact the CSP does.
    { key: "X-Frame-Options", value: "DENY" },
    // The media route already sets this on its own refusals; the shell was answering with none.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // A visitor's next click is not this museum's business, and a referrer is a leak in one header.
    { key: "Referrer-Policy", value: "no-referrer" },
    // Every powerful API the shell does not use, closed. `interest-cohort` is the ad-topic API the
    // browser would otherwise let a third party probe for.
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), clipboard-read=(), clipboard-write=(), interest-cohort=(), browsing-topics=()",
    },
    // Nothing may read these responses as its own subresource.
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Origin-Agent-Cluster", value: "?1" },
  ];
}

import { withPayload } from "@payloadcms/next/withPayload";

export default withPayload(
  {
    // Security upgrade agent marker (Next.js advisory). Preserve unrelated config.
    experimental: {
      agentUpgrade: "security",
    },

    // Catch the double-render that React Strict Mode performs in development, so a component with
    // hidden side effects fails visibly here rather than in production.
    reactStrictMode: true,

    // Standard §5.4: do not advertise the server stack to anonymous requests.
    poweredByHeader: false,

    /**
     * The header set above, on every route the application serves — public pages and `/api/*` alike,
     * because a refusal endpoint is a response too and `SR-03` measured it bare.
     *
     * `docs/SECURITY_AND_PERMISSIONS.md` §6.1 also warns that "admin UI compatibility with a strict
     * policy must be measured, not assumed". That measurement belongs to the Phase 6 Control Center,
     * which is where a per-matcher split (a narrower `frame-ancestors` for an embedded editor) would
     * have to be justified by a real frame, not by a guess made now.
     */
    async headers() {
      return [
        {
          source: "/:path*",
          headers: securityHeaders(process.env["NODE_ENV"] === "production"),
        },
      ];
    },

    /**
     * `/` → `/en`. §4.2 line 408 makes the locale prefix mandatory for public pages, so the root URL
     * must resolve to a locale-prefixed page rather than render an unprefixed one — a root page would
     * exist in no locale and could not carry a `lang` attribute.
     *
     * `permanent: false` on purpose. The default locale is an engineering choice the Owner has not
     * ratified (see `docs/OWNER_INPUT_REGISTER.md` and `src/domain/locale.ts`), and a 301 is cached by
     * browsers and CDNs, which would turn an unratified choice into something hard to change. The
     * destination is asserted against `DEFAULT_LOCALE` by `src/domain/entry-routing.test.ts`, so the
     * literal below and the domain constant cannot drift apart unnoticed.
     */
    async redirects() {
      return [{ source: "/", destination: "/en", permanent: false }];
    },
  },
  "./src/payload/payload.config.ts",
);
