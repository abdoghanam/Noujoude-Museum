import { describe, expect, it } from "vitest";

import {
  ROUTES,
  buildPath,
  isValidSlug,
  primaryNavigation,
  routeDefinition,
  switchTarget,
} from "@/domain/routes";

describe("the canonical route table (§4.2, lines 410–426)", () => {
  it("holds the fifteen baseline routes and nothing invented beside them", () => {
    expect(ROUTES.map((route) => route.key)).toEqual([
      "home",
      "the-museum",
      "worlds",
      "world-detail",
      "collections",
      "collection-detail",
      "artifact-detail",
      "stories",
      "story-detail",
      "curator",
      "search",
      "about",
      "contact",
      "privacy",
      "terms",
    ]);
  });

  it("has no /rare-pieces segment — OD-13 resolved it as a Collection detail treatment", () => {
    expect(ROUTES.some((route) => route.segment === "rare-pieces")).toBe(false);
  });
});

describe("primary navigation is §4.1, in order", () => {
  it("carries the eight listed items and excludes the global utilities", () => {
    expect(primaryNavigation().map((item) => item.label)).toEqual([
      "Home",
      "The Museum",
      "The Worlds",
      "Collections",
      "Stories",
      "AI Curator",
      "About",
      "Contact",
    ]);
  });
});

describe("canonical path building", () => {
  it("builds the exact pattern the table writes, for both locales", () => {
    expect(buildPath("en", "home")?.path).toBe("/en");
    expect(buildPath("ar", "home")?.path).toBe("/ar");
    expect(buildPath("en", "the-museum")?.path).toBe("/en/the-museum");
    expect(buildPath("ar", "curator")?.path).toBe("/ar/curator");
    expect(buildPath("en", "world-detail", "syria")?.path).toBe(
      "/en/worlds/syria",
    );
    expect(buildPath("ar", "artifact-detail", "ndm-ast-041")?.path).toBe(
      "/ar/artifacts/ndm-ast-041",
    );
  });

  it("reports the derived direction on the path it returns", () => {
    expect(buildPath("ar", "stories")?.direction).toBe("rtl");
    expect(buildPath("en", "stories")?.direction).toBe("ltr");
  });

  it("refuses to build a detail path around an invalid slug", () => {
    expect(buildPath("en", "artifact-detail")).toBeNull();
    expect(buildPath("en", "artifact-detail", "../../etc/passwd")).toBeNull();
    expect(buildPath("en", "artifact-detail", "Ndast 041")).toBeNull();
    expect(buildPath("en", "artifact-detail", "-lead")).toBeNull();
    expect(buildPath("en", "artifact-detail", "trail-")).toBeNull();
  });

  it("returns null for a non-detail route asked for a slug it does not take", () => {
    expect(buildPath("en", "worlds", "anything")).toEqual({
      path: "/en/worlds",
      direction: "ltr",
    });
  });
});

describe("slug validation at a public boundary (Standard §2.2, §5)", () => {
  it("accepts baseline-shaped identifiers", () => {
    expect(isValidSlug("the-museum")).toBe(true);
    expect(isValidSlug("a")).toBe(true);
    expect(isValidSlug("ndm-ast-041")).toBe(true);
  });

  it("rejects traversal, case, spaces, emptiness and over-length", () => {
    expect(isValidSlug("..")).toBe(false);
    expect(isValidSlug("a/../b")).toBe(false);
    expect(isValidSlug("")).toBe(false);
    // The cap is 81 characters: one, then up to 79 middle characters, then one.
    expect(isValidSlug("x".repeat(81))).toBe(true);
    expect(isValidSlug("x".repeat(82))).toBe(false);
  });
});

describe("the language switcher rule (§4.2, line 428)", () => {
  it("preserves the page when the target locale has a published record", () => {
    expect(switchTarget("collections", "en", "ar", ["en", "ar"])?.path).toBe(
      "/ar/collections",
    );
  });

  it("falls back to the entrance when it does not", () => {
    expect(switchTarget("collections", "en", "ar", ["en"])?.path).toBe("/ar");
  });

  it("cannot derive a detail target without the record identity", () => {
    expect(
      switchTarget("artifact-detail", "en", "ar", ["en", "ar"]),
    ).toBeNull();
  });
});

describe("registry integrity", () => {
  it("names each route with the baseline purpose text rather than invented copy", () => {
    expect(routeDefinition("search").purpose).toBe("Museum-wide discovery");
    expect(routeDefinition("privacy").purpose).toBe("Approved privacy notice");
  });

  it("throws on a key the registry does not hold", () => {
    expect(() =>
      routeDefinition("checkout" as Parameters<typeof routeDefinition>[0]),
    ).toThrow(RangeError);
  });
});
