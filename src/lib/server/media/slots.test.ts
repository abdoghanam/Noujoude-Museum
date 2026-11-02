/**
 * src/lib/server/media/slots.test.ts — the seam every page stands on, and the sentence in the footer.
 *
 * Two claims are made in production code that this file exists to keep honest.
 *
 * 1. `src/app/[locale]/layout.tsx` says how many catalogued assets pass the public-serving gate. It now
 *    says it by calling `servingFooterSentence(publicServingSummary())`, and the test proves the wording
 *    is a function of its input by calling it with figures the register does not have today. A footer
 *    that hard-coded "82 … 0" would keep passing while the audit said something else, which is exactly
 *    how the shell used to work.
 * 2. `src/README.md:53` says application code reaches asset data only through the media layer. So this
 *    file also renders the layout and every bound route to static markup and asserts that no `<img>`
 *    element appears in any of it — the measured form of "0 of 82 may be served", and the check a reader
 *    of a footer sentence cannot do for themselves.
 *
 * The counts below are measurements taken on 2 November 2026 against
 * `docs/ASSET_INVENTORY_AUDIT.csv` and `src/lib/media/usage-map.ts`: 82 catalogued assets, 0 cleared,
 * 0 approved, 0 passing the gate, 46 surfaces bound across 21 route targets, and 36 assets the map
 * places on no route because every surface they declare is on `UNBOUND_SURFACES`. A re-audit that moves
 * one of those numbers fails this file, which is the intended behaviour: the numbers are evidence, not
 * decoration.
 */

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import LocaleLayout from "@/app/[locale]/layout";
import { ROUTES, type RouteKey } from "@/domain/routes";
import type { Locale } from "@/domain/locale";
import type { AssetRecord } from "@/lib/media/asset-record";
import {
  SURFACE_BINDINGS,
  UNBOUND_SURFACES,
  bindingsForRoute,
} from "@/lib/media/usage-map";
import {
  assetById,
  assetRegister,
  assetsForSurface,
  publiclyServeableAssets,
} from "@/lib/server/media/registry";
import {
  altTextFor,
  derivativeManifest,
  servedSrcFor,
  setDerivativeManifest,
  resetDerivativeManifestCache,
  slotInputFor,
} from "@/lib/server/media/slot-facts";
import {
  DERIVATIVE_STORE_DIR,
  type DerivativeManifest,
  readDerivativeManifest,
} from "@/lib/server/media/derivative-store";
import {
  publicServingSummary,
  servingFooterSentence,
  slotOutcome,
  slotViewsFor,
  viewFor,
} from "@/lib/server/media/slots";
import { MediaSlotGroup } from "@/ui/media-slot";

const LOCALES: readonly Locale[] = ["en", "ar"];

interface RouteTarget {
  readonly route: RouteKey | "global";
  /** `null` means the route is asked without a slug: a directory, or a template-level binding. */
  readonly slug: string | null;
}

/**
 * The targets the map itself declares, not a hand-copied list.
 *
 * Deriving them from `SURFACE_BINDINGS` means a new binding is exercised by every assertion below the
 * moment it is written, and a stale target list cannot make an untested route look covered.
 */
const TARGETS: readonly RouteTarget[] = Array.from(
  new Map(
    SURFACE_BINDINGS.map((binding) => [
      `${String(binding.route)}|${binding.slug ?? ""}`,
      { route: binding.route, slug: binding.slug ?? null } as RouteTarget,
    ]),
  ).values(),
);

function need(assetId: string): AssetRecord {
  const record = assetById(assetId);
  if (record === null) throw new Error(`${assetId} is not in the register`);
  return record;
}

/**
 * Indexing under `noUncheckedIndexedAccess` yields `| undefined`, and a test that destructured and
 * carried on would assert nothing at all. Naming the miss turns an empty result into a failure.
 */
function one<T>(items: readonly T[], what: string): T {
  const [first] = items;
  if (first === undefined) throw new Error(`expected one ${what}, found none`);
  return first;
}

function label(target: RouteTarget): string {
  return `${String(target.route)}|${target.slug ?? "-"}`;
}

/** The tally sentence `MediaSlotGroup` builds, with its singular and plural forms. */
function expectedTally(count: number): string {
  return `Of ${String(count)} catalogued surface${count === 1 ? "" : "s"} bound to this route, 0 are cleared for public serving.`;
}

/**
 * The second path to the same answer: bindings walked against the surface index, de-duplicated in
 * binding order. `assetsBoundToRoute` builds the list inside the media layer; this builds it outside,
 * so a disagreement between the two is a defect rather than a shared mistake.
 */
function expectedAssetIdsFor(target: RouteTarget): readonly string[] {
  const ids: string[] = [];
  for (const binding of bindingsForRoute(target.route, target.slug ?? undefined)) {
    for (const asset of assetsForSurface(binding.surface)) {
      if (!ids.includes(asset.assetId)) ids.push(asset.assetId);
    }
  }
  return ids;
}

function viewsFor(target: RouteTarget, locale: Locale) {
  return slotViewsFor(target.route, locale, target.slug ?? undefined);
}

/** A record the legal gate would let through, built from a real register row. */
function cleared(asset: AssetRecord): AssetRecord {
  return { ...asset, approval: "approved", published: true, rights: "cleared" };
}

const DIGEST_A = "a".repeat(64);
const DIGEST_B = "b".repeat(64);

function manifestWith(assetId: string, width: number, height: number): DerivativeManifest {
  return {
    derivatives: [
      {
        assetId,
        bytes: 40_960,
        file: `${assetId}.webp`,
        height,
        mime: "image/webp",
        originalFilename: `${assetId}.png`,
        originalSha256: DIGEST_B,
        profile: "test-probe",
        sha256: DIGEST_A,
        width,
      },
    ],
    generatedAt: "2026-11-02T00:00:00.000Z",
    originalsUnchanged: true,
    storeDirectory: DERIVATIVE_STORE_DIR,
  };
}

async function renderLayout(locale: Locale): Promise<string> {
  const element = await LocaleLayout({
    children: null,
    params: Promise.resolve({ locale }),
  });
  return renderToStaticMarkup(element);
}

function footerSentenceOf(html: string): string {
  const match = /<footer[^>]*><p[^>]*>([\s\S]*?)<\/p><\/footer>/.exec(html);
  if (match === null || match[1] === undefined)
    throw new Error(`the rendered layout has no footer paragraph: ${html}`);
  return match[1];
}

afterEach(() => {
  resetDerivativeManifestCache();
});

describe("publicServingSummary", () => {
  it("reports four separate dimensions and no merged completion figure", () => {
    expect(Object.keys(publicServingSummary()).sort()).toEqual([
      "approved",
      "cleared",
      "gatePassed",
      "total",
    ]);
  });

  it("measures the register as delivered: 82 assets, 0 cleared, 0 approved, 0 through the gate", () => {
    expect(publicServingSummary()).toEqual({
      total: 82,
      cleared: 0,
      approved: 0,
      gatePassed: 0,
    });
  });

  it("computes each number from the register rather than remembering it", () => {
    const records = assetRegister();
    const serving = publicServingSummary();
    expect(serving.total).toBe(records.length);
    expect(serving.cleared).toBe(
      records.filter((asset) => asset.rights === "cleared").length,
    );
    expect(serving.approved).toBe(
      records.filter((asset) => asset.approval === "approved").length,
    );
    expect(serving.gatePassed).toBe(publiclyServeableAssets().length);
  });

  it("keeps the gate count and the slot count distinct concepts", () => {
    // `gatePassed` is what `decidePublicServing` allows. A slot additionally needs a served copy and a
    // recorded alt text, so the two numbers answer different questions and A.9 forbids merging them.
    // Today both are zero, which is why this is asserted as a property of the vocabulary, not as a
    // difference in the figures.
    const serving = publicServingSummary();
    const servableViews = TARGETS.flatMap((target) => viewsFor(target, "en")).filter(
      (view) => slotOutcome(view) === "image",
    );
    expect(servableViews).toEqual([]);
    expect(serving.gatePassed).toBe(0);
  });
});

describe("servingFooterSentence", () => {
  it("states today's measured position", () => {
    expect(servingFooterSentence(publicServingSummary())).toBe(
      "Pre-publication shell. 82 catalogued assets, 0 pass the public-serving gate, so no imagery is rendered anywhere in this build.",
    );
  });

  it("moves when its input moves, which is the only proof that the footer is computed", () => {
    const partial = servingFooterSentence({
      total: 82,
      cleared: 40,
      approved: 12,
      gatePassed: 12,
    });
    expect(partial).toBe(
      "Pre-publication shell. 82 catalogued assets, 12 pass the public-serving gate; every other asset is withheld by its slot.",
    );
    expect(servingFooterSentence({ total: 7, cleared: 0, approved: 0, gatePassed: 0 })).toContain(
      "7 catalogued assets, 0 pass",
    );
    expect(partial).not.toBe(servingFooterSentence(publicServingSummary()));
  });

  it("never promises an image in either branch", () => {
    for (const summary of [
      publicServingSummary(),
      { total: 82, cleared: 82, approved: 82, gatePassed: 82 },
    ] as const) {
      expect(servingFooterSentence(summary)).not.toMatch(/renders? (the )?(imagery|photos)/i);
    }
  });

  it("is what both locales' layouts actually print", async () => {
    const expected = servingFooterSentence(publicServingSummary());
    for (const locale of LOCALES) {
      const html = await renderLayout(locale);
      expect(footerSentenceOf(html)).toBe(expected);
      // Structural English copy inside an Arabic document has to declare its own language, or a
      // screen reader reads the sentence with Arabic pronunciation rules.
      expect(html).toContain(`<p lang="en">${expected}</p>`);
    }
  });
});

describe("the layout band", () => {
  it("says the approved mark is pending without publishing which gate stopped it", async () => {
    for (const locale of LOCALES) {
      const html = await renderLayout(locale);
      const [masthead] = slotViewsFor("global", locale);
      if (masthead === undefined) throw new Error("the map binds no Header surface");
      // SR-02: the band's structural hook records that the mark is not there yet — which is the fact a
      // visitor needs — and the reason the layer computed is asserted here rather than printed in the
      // page. The route refuses a withheld asset with a 404 that carries no reason; a header that named
      // `rights_not_cleared`, or the catalog id behind it, would undo that decision in markup.
      expect(html).toContain('data-slot="approved-mark-pending"');
      expect(slotOutcome(masthead)).toBe("rights_not_cleared");
      expect(html).not.toMatch(/\sdata-(?:asset-id|surface|reason)=/);
      expect(html).not.toContain(slotOutcome(masthead));
      expect(html).not.toContain(masthead.assetId);
      // What the band shows instead of the mark: the name, as text. The refusal is not a blank gap.
      expect(html).toContain(">Noujoude</p>");
    }
  });

  it("renders no picture anywhere in the shell", async () => {
    for (const locale of LOCALES) {
      const html = await renderLayout(locale);
      expect(html).not.toContain("<img");
      // React's static renderer also emits a preload hint beside an image it draws, so a guard that
      // only looks for `<img` would miss a leak that prefetches.
      expect(html).not.toContain('as="image"');
    }
  });

  it("keeps the direction rule intact while the media story is computed", async () => {
    expect(await renderLayout("ar")).toContain('<html lang="ar" dir="rtl">');
    expect(await renderLayout("en")).toContain('<html lang="en" dir="ltr">');
  });
});

describe("slotViewsFor — the seam between the map and the register", () => {
  it("has exactly 21 route targets and 46 bound surfaces today", () => {
    expect(TARGETS.length).toBe(21);
    const surfaces = TARGETS.reduce((sum, target) => sum + viewsFor(target, "en").length, 0);
    expect(surfaces).toBe(46);
  });

  it("resolves each target to the same asset list the surface index produces, in the same order", () => {
    for (const target of TARGETS) {
      const views = viewsFor(target, "en");
      expect(
        views.map((view) => view.assetId),
        label(target),
      ).toEqual(expectedAssetIdsFor(target));
    }
  });

  it("binds one surface to one asset with no asset counted twice on a route", () => {
    const ids = TARGETS.flatMap((target) => viewsFor(target, "en").map((view) => view.assetId));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(SURFACE_BINDINGS.map((binding) => binding.surface)).size).toBe(
      SURFACE_BINDINGS.length,
    );
  });

  it("names each slot with a surface the asset itself declares", () => {
    for (const target of TARGETS) {
      for (const view of viewsFor(target, "en")) {
        expect(need(view.assetId).surfaces).toContain(view.surface);
      }
    }
  });

  it("answers for every canonical route without throwing, bound or not", () => {
    for (const route of ROUTES) {
      for (const locale of LOCALES) {
        expect(() => slotViewsFor(route.key, locale)).not.toThrow();
      }
    }
    for (const target of TARGETS) {
      expect(() => viewsFor(target, "ar")).not.toThrow();
    }
  });

  it("returns nothing for the routes the catalog placed no imagery on", () => {
    for (const route of ["privacy", "terms", "story-detail"] as const) {
      expect(slotViewsFor(route, "en")).toEqual([]);
    }
  });

  it("carries the register's own facts into the slot, and invents none", () => {
    for (const target of TARGETS) {
      for (const view of viewsFor(target, "en")) {
        const asset = need(view.assetId);
        expect(view.record.assetId).toBe(asset.assetId);
        expect(view.record.rights).toBe(asset.rights);
        expect(view.record.approval).toBe(asset.approval);
        expect(view.record.published).toBe(asset.published);
        expect(view.record.width).toBe(asset.width);
        expect(view.record.height).toBe(asset.height);
        // The register has no served copy and no alt text, so the seam reports their absence instead of
        // filling it in. `Alt Text Status` is a status column, not a description column.
        expect(view.facts.src).toBeNull();
        expect(view.facts.altText).toBeNull();
      }
    }
  });

  it("refuses every bound slot with the legal reason, in both locales", () => {
    const reasons = new Set(
      LOCALES.flatMap((locale) =>
        TARGETS.map((target) => slotOutcome(one(viewsFor(target, locale), label(target)))),
      ),
    );
    expect([...reasons]).toEqual(["rights_not_cleared"]);
  });

  it("leaves 36 catalogued assets on no route, and every one of them is unbound by the map's own list", () => {
    const bound = new Set(
      TARGETS.flatMap((target) => viewsFor(target, "en").map((view) => view.assetId)),
    );
    const unbound = assetRegister().filter((asset) => !bound.has(asset.assetId));
    expect(unbound.length).toBe(36);
    const unboundSurfaces = new Set(
      UNBOUND_SURFACES.map((entry) => entry.surface.toLowerCase()),
    );
    for (const asset of unbound) {
      expect(
        asset.surfaces.every((surface) => unboundSurfaces.has(surface.toLowerCase())),
        `${asset.assetId}: ${asset.surfaces.join(", ")}`,
      ).toBe(true);
    }
  });
});

describe("viewFor", () => {
  it("matches a bound surface case-insensitively and reports the catalog's spelling", () => {
    const view = viewFor(need("NDM-AST-013"), "en", ["HOMEPAGE HERO"]);
    expect(view.surface).toBe("Homepage hero");
  });

  it("falls back to the first declared surface when the caller names none of the asset's own", () => {
    const asset = need("NDM-AST-013");
    const [first] = asset.surfaces;
    const view = viewFor(asset, "en", ["Some surface nobody declared"]);
    expect(view.surface).toBe(first);
  });

  it("says undeclared for an asset with no surfaces, rather than inventing a label", () => {
    const bare: AssetRecord = { ...need("NDM-AST-001"), surfaces: [] };
    expect(viewFor(bare, "en").surface).toBe("undeclared");
  });
});

describe("the private store cannot open the gate", () => {
  it("reports no manifest, because the pipeline has never run", () => {
    expect(readDerivativeManifest()).toBeNull();
    expect(derivativeManifest()).toBeNull();
  });

  it("serves nothing to any of the 82 assets while the gate refuses them", () => {
    setDerivativeManifest(
      manifestWith("NDM-AST-001", 640, 480),
    );
    for (const asset of assetRegister()) {
      expect(servedSrcFor(asset)).toBeNull();
    }
  });

  it("keeps the masthead refused even when a lineage row exists for it", () => {
    setDerivativeManifest(manifestWith("NDM-AST-001", 640, 480));
    const outcome = slotOutcome(one(slotViewsFor("global", "en"), "the global masthead slot"));
    expect(outcome).toBe("rights_not_cleared");
    // The lineage plumbing is live — the slot reports the derivative's pixels, not the original's —
    // and it still draws nothing. That is the difference between an unbuilt feature and a refused one.
    expect(need("NDM-AST-001").width).not.toBe(640);
    const { record, facts } = slotInputFor(need("NDM-AST-001"), "en");
    expect(record.width).toBe(640);
    expect(record.height).toBe(480);
    expect(facts.src).toBeNull();
  });

  it("hands a cleared asset a source and still refuses it for want of alt text", () => {
    setDerivativeManifest(manifestWith("NDM-AST-001", 640, 480));
    const asset = cleared(need("NDM-AST-001"));
    expect(servedSrcFor(asset)).toBe("/api/media/NDM-AST-001");
    const { record, facts } = slotInputFor(asset, "en");
    expect(facts.src).toBe("/api/media/NDM-AST-001");
    expect(altTextFor(asset, "en")).toBeNull();
    expect(slotOutcome({ assetId: asset.assetId, record, facts, surface: "Header" })).toBe(
      "alt_text_not_recorded",
    );
  });

  it("writes no alt text into either locale for any register asset", () => {
    for (const asset of assetRegister()) {
      for (const locale of LOCALES) {
        expect(altTextFor(asset, locale)).toBeNull();
      }
    }
  });
});

describe("the bound routes as a visitor receives them", () => {
  it("render a refusal per surface and not one image", () => {
    for (const target of TARGETS) {
      const views = viewsFor(target, "en");
      const html = renderToStaticMarkup(
        createElement(MediaSlotGroup, { views }),
      );
      expect(html).not.toContain("<img");
      expect(html).not.toContain('as="image"');
      expect(html.match(/data-slot="media-withheld"/g)?.length).toBe(views.length);
      /*
       * SR-02, measured over every route the catalog binds rather than over one fixture: before this the
       * assertion was `data-reason="rights_not_cleared"` per view, which is the disclosure being tested
       * for rather than tested against. Every one of the 46 bound surfaces names a real register id, so
       * this is where an id leak would actually show up — a page enumeration needs no guessing, and the
       * `/api/media/<id>` refusals were built to avoid confirming exactly that an id is real.
       */
      expect(html).not.toMatch(/\sdata-(?:asset-id|surface|reason)=/);
      for (const view of views) {
        expect(html).not.toContain(view.assetId);
        expect(html).not.toContain(view.surface);
      }
      expect(html).not.toMatch(/NDM-AST-\d{3}/);
      expect(html).toContain(expectedTally(views.length));
    }
  });

  it("render nothing at all where the catalog bound nothing", () => {
    for (const route of ["privacy", "terms", "story-detail"] as const) {
      expect(
        renderToStaticMarkup(createElement(MediaSlotGroup, { views: slotViewsFor(route, "en") })),
      ).toBe("");
    }
  });
});
