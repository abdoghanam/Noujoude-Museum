/**
 * src/domain/locale.ts — the locale contract, and nothing beyond it.
 *
 * Source of truth: `reference/Noujoude_Master_Specification_EN.md` §4.2, which states that "Locale
 * prefixing is mandatory for public English and Arabic experiences" (line 408) and that "Locale
 * identifiers are `en` and `ar`" (line 428). §10 makes Arabic a right-to-left experience, so the
 * writing direction is derived from the identifier rather than stored beside it — one fact, one
 * place, so a route cannot claim `ar` and render `ltr`.
 *
 * This module is deliberately pure: no Next imports, no I/O. That is what lets `pnpm test` assert
 * the contract directly (Standard §12 check 3, "Unit tests for domain and validation logic").
 */

/** The only two locale identifiers the baseline admits (§4.2, line 428). */
export const LOCALE_IDENTIFIERS = ["en", "ar"] as const;

export type Locale = (typeof LOCALE_IDENTIFIERS)[number];

/**
 * The default is an engineering choice, not a requirement: the baseline fixes the identifiers and
 * the mandatory prefixing, and the Owner has not supplied a preference for a first visit. Recorded
 * in `docs/OWNER_INPUT_REGISTER.md` rather than invented here.
 */
export const DEFAULT_LOCALE: Locale = "en";

const DIRECTIONS: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

/**
 * Exact-match validation. `EN` is not a locale: the identifiers are fixed strings in the baseline,
 * and a case-insensitive match would let a URL segment drift into a directory that has no layout.
 */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (LOCALE_IDENTIFIERS as readonly string[]).includes(value)
  );
}

/**
 * Resolve the `[locale]` segment. Next passes `string`, and a catch-all or a rewrite can pass an
 * array; anything that is not an exact identifier falls back to the default instead of throwing,
 * because an unresolvable locale is a routing fact, not a domain error.
 */
export function resolveLocale(param: string | string[] | undefined): Locale {
  const candidate = typeof param === "string" ? param : undefined;
  return isLocale(candidate) ? candidate : DEFAULT_LOCALE;
}

export function directionOf(locale: Locale): "ltr" | "rtl" {
  return DIRECTIONS[locale];
}

/** The other supported locale, for the language switcher (§4.2, line 428). */
export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}
