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
//   * Security headers and CSP — `docs/SECURITY_AND_PERMISSIONS.md` §16 schedules the ASVS-mapped
//     header set with the negative tests that prove it; shipping an unverified header policy would
//     read as a control that has never been exercised.
//   * Image remote patterns — 0 of 82 assets are cleared for serving (B-06), so there is no
//     permitted image origin to whitelist.

export default {
  // Catch the double-render that React Strict Mode performs in development, so a component with
  // hidden side effects fails visibly here rather than in production.
  reactStrictMode: true,

  // Standard §5.4: do not advertise the server stack to anonymous requests.
  poweredByHeader: false,

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
};
