import { describe, expect, it } from "vitest";

import {
  SURFACE_BINDINGS,
  UNBOUND_SURFACES,
  bindingForSurface,
  bindingsForRoute,
  boundPathsFor,
  describeUsage,
  unboundReasonFor,
} from "@/lib/media/usage-map";
import { ROUTES, type RouteKey, isValidSlug } from "@/domain/routes";
import { assetRegister, assetsBoundToRoute } from "@/lib/server/media/registry";
import { decidePublicServing } from "@/domain/rights";

/**
 * The usage map, proved complete.
 *
 * "Every asset usage is discoverable from its asset record" is only true if the map covers the register
 * — and the failure mode of an incomplete map is invisible, because a missing row reads exactly like an
 * asset nobody placed anywhere. So the central test here is a set equality between the surfaces the
 * delivered register declares and the surfaces this file partitions into bound and unbound, plus a
 * per-route check that every binding actually resolves to an asset.
 */

const register = assetRegister();

/** Every thing a binding may point at: the fifteen canonical routes plus the masthead band. */
const ALL_TARGETS: readonly (RouteKey | "global")[] = [
  ...ROUTES.map((route) => route.key),
  "global",
];

const declaredSurfaces = (): Set<string> => {
  const set = new Set<string>();
  for (const asset of register) {
    for (const surface of asset.surfaces) set.add(surface);
  }
  return set;
};

describe("the map partitions the register's whole surface vocabulary", () => {
  it("covers every declared surface exactly once, in either list", () => {
    const declared = declaredSurfaces();
    const mapped = [
      ...SURFACE_BINDINGS.map((binding) => binding.surface),
      ...UNBOUND_SURFACES.map((entry) => entry.surface),
    ];
    expect(new Set(mapped).size).toBe(mapped.length);
    expect([...mapped].sort()).toEqual([...declared].sort());
  });

  it("binds and unbinds disjoint sets, never both", () => {
    for (const entry of UNBOUND_SURFACES) {
      expect(bindingForSurface(entry.surface)).toBeNull();
    }
    for (const binding of SURFACE_BINDINGS) {
      expect(unboundReasonFor(binding.surface)).toBeNull();
    }
  });

  it("gives every unbound surface a reason that says something", () => {
    for (const entry of UNBOUND_SURFACES) {
      expect(entry.reason.trim().length).toBeGreaterThan(20);
    }
  });

  it("names each bound surface in the register's own words, not a paraphrase", () => {
    const declared = declaredSurfaces();
    for (const binding of SURFACE_BINDINGS) {
      expect(declared.has(binding.surface)).toBe(true);
    }
  });
});

describe("every binding points at a route the navigation contract knows", () => {
  const knownRoutes = new Set<string>(ROUTES.map((route) => route.key));

  it("uses only canonical route keys, or the masthead band", () => {
    for (const binding of SURFACE_BINDINGS) {
      expect(binding.route === "global" || knownRoutes.has(binding.route)).toBe(
        true,
      );
    }
  });

  it("carries a reason for every binding", () => {
    for (const binding of SURFACE_BINDINGS) {
      expect(binding.basis.trim().length).toBeGreaterThan(10);
    }
  });

  it("puts a slug only on the two detail routes that take one, and only a valid slug", () => {
    for (const binding of SURFACE_BINDINGS) {
      if (binding.slug === undefined) continue;
      expect(["world-detail", "collection-detail"]).toContain(binding.route);
      expect(isValidSlug(binding.slug)).toBe(true);
    }
  });

  it("never binds the same slug twice on one route", () => {
    const keys = SURFACE_BINDINGS.filter(
      (binding) => binding.slug !== undefined,
    ).map((binding) => `${String(binding.route)}:${binding.slug ?? ""}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("resolution, which is where a bad map becomes a broken page", () => {
  it("resolves every route without a dangling binding", () => {
    for (const target of ALL_TARGETS) {
      expect(() => assetsBoundToRoute(target)).not.toThrow();
    }
  });

  it("binds the entrance to the four assets the catalog places there", () => {
    expect(assetsBoundToRoute("home").map((asset) => asset.assetId)).toEqual([
      "NDM-AST-013",
      "NDM-AST-014",
      "NDM-AST-004",
      "NDM-AST-015",
    ]);
  });

  it("binds the masthead band to the monogram, separately from the page slots", () => {
    expect(assetsBoundToRoute("global").map((asset) => asset.assetId)).toEqual([
      "NDM-AST-001",
    ]);
    // The masthead is not a home-page slot: asking for `home` must not pull the header mark in, or the
    // monogram would be counted twice in a page's usage.
    expect(bindingsForRoute("home").some((b) => b.route === "global")).toBe(
      false,
    );
  });

  it("gives each country world only its own hero", () => {
    const cases: readonly (readonly [string, string])[] = [
      ["morocco", "NDM-AST-073"],
      ["egypt", "NDM-AST-074"],
      ["syria", "NDM-AST-075"],
      ["mauritania", "NDM-AST-076"],
      ["libya", "NDM-AST-077"],
      ["sudan", "NDM-AST-078"],
    ];
    for (const [slug, assetId] of cases) {
      expect(
        assetsBoundToRoute("world-detail", slug).map((asset) => asset.assetId),
      ).toEqual([assetId]);
    }
    // A slug with no binding is an empty list, not another country's picture.
    expect(assetsBoundToRoute("world-detail", "andalus")).toEqual([]);
    expect(assetsBoundToRoute("world-detail")).toEqual([]);
  });

  it("gives each declared collection category only its own cover", () => {
    expect(
      assetsBoundToRoute("collection-detail", "coins").map((a) => a.assetId),
    ).toEqual(["NDM-AST-080"]);
    expect(
      assetsBoundToRoute("collection-detail", "first-day-covers").map(
        (a) => a.assetId,
      ),
    ).toEqual(["NDM-AST-079"]);
    expect(
      assetsBoundToRoute("collection-detail", "artifacts").map(
        (a) => a.assetId,
      ),
    ).toEqual(["NDM-AST-081"]);
    expect(
      assetsBoundToRoute("collection-detail", "souvenirs").map(
        (a) => a.assetId,
      ),
    ).toEqual(["NDM-AST-082"]);
  });

  it("routes the catalog never placed anything on come back empty rather than borrowed", () => {
    for (const route of ["privacy", "terms", "story-detail"] as const) {
      expect(assetsBoundToRoute(route)).toEqual([]);
    }
  });
});

describe("describeUsage, the sentence the register should carry", () => {
  it("names the canonical path for a bound surface", () => {
    const usage = describeUsage(["Homepage hero"]);
    expect(usage.state).toBe("bound");
    expect(usage.text).toContain("/en");
  });

  it("reports placement only, because the map cannot see the gate", () => {
    // Until 4 November 2026 this sentence ended "; served nowhere while the rights gate denies". That
    // clause was a claim about a module this file does not consult, and the Owner's asset declaration made
    // it false on the same day it became measurable. The requirement is the narrower one: a usage sentence
    // must not assert a serving outcome.
    const usage = describeUsage(["Homepage hero", "Morocco World"]);
    expect(usage.text).not.toMatch(/serv|den|refus|withheld/i);
    expect(usage.text).toContain("/en/worlds/morocco");
  });

  it("resolves a slug binding to the detail path, not the directory", () => {
    expect(describeUsage(["Morocco World"]).text).toContain(
      "/en/worlds/morocco",
    );
  });

  it("says which surface bars an unbound asset", () => {
    const usage = describeUsage(["Loading states"]);
    expect(usage.state).toBe("unbound");
    expect(usage.text).toContain("Loading states");
  });

  it("reports no-surfaces as no-surfaces, without inventing a route", () => {
    expect(describeUsage([])).toEqual({
      state: "none",
      text: "None — the register declares no surface for this asset",
    });
  });

  it("treats a surface neither list knows as a disagreement, not as an absence", () => {
    const usage = describeUsage(["Surface the catalog invented"]);
    expect(usage.state).toBe("unrecognised");
    expect(usage.text).toContain("disagree");
  });

  it("mixes bound and unbound surfaces into one bound sentence, de-duplicated", () => {
    const usage = describeUsage([
      "Homepage hero",
      "Homepage and identity",
      "Loading states",
    ]);
    expect(usage.state).toBe("bound");
    expect(usage.text.split("/en").length - 1).toBe(1);
  });
});

describe("the map is usage, not permission", () => {
  it("binds 46 surfaces across the canonical routes and leaves the rest unbound", () => {
    expect(SURFACE_BINDINGS.length).toBe(46);
    expect(UNBOUND_SURFACES.length).toBe(38);
  });

  it("binds an asset without clearing it: placement and permission stay different questions", () => {
    // The invariant is not "no bound asset is ever served" — that was a reading of a register whose
    // production vocabulary was empty, and the Owner's 4 November declaration changed the register, not
    // the rule. The rule is that a serve decision is a function of the row's three cells and of nothing the
    // map holds, so a bound-and-denied asset must be denied *by its cells*, and a bound-and-served asset
    // must be served *by its cells*. Either way, consulting the binding tells you nothing.
    const bound = new Set<string>();
    for (const target of ALL_TARGETS) {
      for (const asset of assetsBoundToRoute(target)) bound.add(asset.assetId);
    }
    expect(bound.size).toBeGreaterThan(0);
    for (const assetId of bound) {
      const asset = register.find((candidate) => candidate.assetId === assetId);
      if (asset === undefined)
        throw new Error(`${assetId} vanished from the register`);
      const cleared =
        asset.rights === "cleared" &&
        asset.approval === "approved" &&
        asset.published;
      expect(decidePublicServing(asset).serve).toBe(cleared);
    }
  });

  it("leaves no bound asset published without being placed, and none placed without a path", () => {
    // `boundPathsFor` is what the publication register is generated from, so the two failure modes worth
    // pinning are the ones that would make a register cell untrue: a surface that resolves to nothing, and
    // a register row whose declared surfaces are not the ones the map knows.
    for (const asset of register) {
      if (asset.surfaces.length === 0) continue;
      const unrecognised = asset.surfaces.filter(
        (surface) =>
          bindingForSurface(surface) === null &&
          unboundReasonFor(surface) === null,
      );
      expect(unrecognised, `${asset.assetId} surfaces`).toEqual([]);
      for (const path of boundPathsFor(asset.surfaces)) {
        expect(path.length).toBeGreaterThan(0);
      }
    }
  });

  it("is a pure table: no binding object carries more than the three documented fields", () => {
    const keys = new Set<string>();
    for (const binding of SURFACE_BINDINGS) {
      for (const key of Object.keys(binding)) keys.add(key);
    }
    expect([...keys].sort()).toEqual(["basis", "route", "slug", "surface"]);
  });
});
