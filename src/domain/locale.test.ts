import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LOCALE_IDENTIFIERS,
  directionOf,
  isLocale,
  otherLocale,
  resolveLocale,
} from "@/domain/locale";

describe("locale identifiers (§4.2, line 428)", () => {
  it("admits exactly en and ar", () => {
    expect(LOCALE_IDENTIFIERS).toEqual(["en", "ar"]);
  });

  it("accepts each identifier exactly", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ar")).toBe(true);
  });

  // These are the cases that would otherwise let a URL segment select a directory no layout
  // defines. Each one has to fail, and each one can.
  it("rejects anything else, including a near miss", () => {
    expect(isLocale("EN")).toBe(false);
    expect(isLocale("Ar")).toBe(false);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("en-US")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(["en"])).toBe(false);
  });
});

describe("[locale] segment resolution", () => {
  it("passes a valid segment through", () => {
    expect(resolveLocale("ar")).toBe("ar");
  });

  it("falls back to the default for a malformed or array segment", () => {
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("xx")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(["ar"])).toBe(DEFAULT_LOCALE);
  });
});

describe("writing direction is derived, never stored beside the route", () => {
  it("is rtl for ar and ltr for en", () => {
    expect(directionOf("ar")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
  });

  it("switches between the two supported locales only", () => {
    expect(otherLocale("en")).toBe("ar");
    expect(otherLocale("ar")).toBe("en");
  });
});
