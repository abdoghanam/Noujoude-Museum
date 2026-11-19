/**
 * src/lib/server/media/slots.test.ts — the seam every page stands on, and the sentence in the footer.
 *
 * Two claims are made in production code that this file exists to keep honest.
 *
 * 1. `src/app/[locale]/layout.tsx` says how many catalogued assets pass the public-serving gate. It says
 *    it by calling `servingFooterSentence(publicServingSummary())`, and the test proves the wording is a
 *    function of its input by calling it with figures the register does not have today. A footer that
 *    hard-coded "82 … 0" would keep passing while the audit said something else, which is exactly how the
 *    shell used to work.
 * 2. `src/README.md` says application code reaches asset data only through the media layer. So this file
 *    also renders the layout and every bound route to static markup and checks what actually reached the
 *    wire: an `<img>` appears if and only if the gate, the private store and the label file all answered
 *    for that asset, and the number in the section's tally sentence is the number of pictures standing
 *    under it.
 *
 * The counts below are measurements, and which ones are asserted is deliberate. Taken on 4 November 2026
 * against `docs/ASSET_INVENTORY_AUDIT.csv` and `src/lib/media/usage-map.ts`: 82 catalogued assets, all 82
 * rights-cleared and approved by the Owner's 4 November instrument, 46 of them published, 46 surfaces bound
 * across 21 route targets, and 36 assets the map places on no route because every surface they declare is on
 * `UNBOUND_SURFACES`. Most of the cases here do not read those numbers as literals — they recompute them from
 * the register, the publication register and the lineage store, because a literal count is the thing that
 * moves when an Owner signs something, while the properties (the gate runs before the store, a slot needs
 * three facts and invents none, a refusal names nothing) are what the specification actually requires. Where a
 * number *is* pinned, it is pinned because a page prints it.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import LocaleLayout from "@/app/[locale]/layout";
import { ROUTES, type RouteKey } from "@/domain/routes";
import type { Locale } from "@/domain/locale";
import { decidePublicServing } from "@/domain/rights";
import type { AssetRecord } from "@/lib/media/asset-record";
import type { MediaSlotView } from "@/lib/media/slot";
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
  lineageFor,
  servedSrcFor,
  resetDerivativeManifestCache,
  slotInputFor,
} from "@/lib/server/media/slot-facts";
import { labelFor } from "@/lib/server/media/labels";
import {
  DERIVATIVE_MANIFEST_PATH,
  DERIVATIVE_STORE_DIR,
  type DerivativeLineage,
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

/**
 * Two delivered rows, chosen by asking the shipped gate rather than by remembering a state.
 *
 * `DENIED` is what every fail-closed case below needs: an asset whose own register row does not clear the
 * three dimensions, so a lineage record handed to it must change nothing. `SERVED` is the other half — a row
 * that clears the gate *and* has a produced copy *and* has an authored label — which is what lets the same
 * cases say "the seam is live, and it is the permission that decides" instead of "nothing works yet".
 */
const DENIED: AssetRecord = one(
  assetRegister().filter((asset) => !decidePublicServing(asset).serve),
  "asset the gate denies",
);
const SERVED: AssetRecord = one(
  assetRegister().filter(
    (asset) =>
      decidePublicServing(asset).serve &&
      lineageFor(asset.assetId) !== null &&
      altTextFor(asset, "en") !== null,
  ),
  "asset a slot is allowed to render",
);
/** The ids the delivered lineage record actually carries. */
const LINEAGE_IDS = new Set(
  (derivativeManifest()?.derivatives ?? []).map((row) => row.assetId),
);

/**
 * The tally sentence `MediaSlotGroup` is supposed to print, computed the way a reader would compute it:
 * from the views it was handed. Keeping it here rather than reading the number out of the markup is what
 * lets the case below compare the sentence with the pictures — a component that printed a remembered count
 * would disagree with its own `<img>` elements, and both halves of that are measured, not asserted.
 */
function expectedTally(views: readonly MediaSlotView[]): string {
  const served = views.filter((view) => slotOutcome(view) === "image").length;
  return `Of ${String(views.length)} catalogued surface${
    views.length === 1 ? "" : "s"
  } bound to this route, ${String(served)} ${
    served === 1 ? "is" : "are"
  } cleared for public serving.`;
}

/**
 * The second path to the same answer: bindings walked against the surface index, de-duplicated in
 * binding order. `assetsBoundToRoute` builds the list inside the media layer; this builds it outside,
 * so a disagreement between the two is a defect rather than a shared mistake.
 */
function expectedAssetIdsFor(target: RouteTarget): readonly string[] {
  const ids: string[] = [];
  for (const binding of bindingsForRoute(
    target.route,
    target.slug ?? undefined,
  )) {
    for (const asset of assetsForSurface(binding.surface)) {
      if (!ids.includes(asset.assetId)) ids.push(asset.assetId);
    }
  }
  return ids;
}

function viewsFor(target: RouteTarget, locale: Locale) {
  return slotViewsFor(target.route, locale, target.slug ?? undefined);
}

/**
 * How `renderToStaticMarkup` writes a string inside a double-quoted attribute.
 *
 * The cases below compare rendered markup against the exact sentence the label file owns, and React escapes
 * an apostrophe as `&#x27;` — so a label containing one would "not appear" in a page that shows it perfectly
 * well. Comparing escaped to escaped is the only way this assertion says something true.
 */
function attr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * The markup with the drawn imagery removed — both tags a served picture actually produces.
 *
 * One asset id reaches the wire legitimately, and it appears twice: the `<img src>` and the preload hint React
 * hoists beside it. What is left after both tags are stripped is the scaffolding — the tally sentence, the
 * list, every withheld slot — and that part of the page has to be silent about ids, placements and reasons.
 * That is SR-02 stated as an operation on the page rather than as a count.
 */
function withoutDrawnImagery(html: string): string {
  return html
    .replace(/<img[^>]*\/>/g, "")
    .replace(/<link rel="preload" as="image"[^>]*\/>/g, "");
}

/** A record the legal gate would let through, built from a real register row. */
function cleared(asset: AssetRecord): AssetRecord {
  return { ...asset, approval: "approved", published: true, rights: "cleared" };
}

const DIGEST_A = "a".repeat(64);
const DIGEST_B = "b".repeat(64);

function lineageRowFor(
  assetId: string,
  width: number,
  height: number,
): DerivativeLineage {
  return {
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
  };
}

function manifestWith(
  assetId: string,
  width: number,
  height: number,
): DerivativeManifest {
  return {
    derivatives: [lineageRowFor(assetId, width, height)],
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

/** Temp roots a case created, removed in `afterEach` so a red assertion cannot leave litter behind. */
const tempRoots: string[] = [];

/**
 * A throwaway workspace whose private store holds a real `lineage.json`.
 *
 * This replaces `setDerivativeManifest`, removed under risk **SR-10**: that seam published a record into
 * the process cache without ever meeting `validateManifest`, so a fixture could carry a shape production
 * would refuse. A root on disk is read by `derivativeManifest` through the same door production uses, the
 * validator included — which makes the assertions below about the shipped path rather than about a state
 * only a test could reach. The repository is never written to; the tree lives under the OS temp directory
 * and `afterEach` removes it.
 */
function rootWithLineage(
  assetId: string,
  width: number,
  height: number,
): string {
  const root = mkdtempSync(path.join(tmpdir(), "ndm-slot-"));
  tempRoots.push(root);
  mkdirSync(path.join(root, DERIVATIVE_STORE_DIR), { recursive: true });
  writeFileSync(
    path.join(root, DERIVATIVE_MANIFEST_PATH),
    JSON.stringify(manifestWith(assetId, width, height)),
    "utf8",
  );
  return root;
}

/**
 * A throwaway workspace whose private store carries a lineage row for *every* id handed to it.
 *
 * This is the hostile shape the gate has to survive: a `lineage.json` that names assets nobody published —
 * whether because a build was pointed at the whole library or because someone edited the record by hand. The
 * rows are written through the same validator production reads with, so a refusal below is the gate's doing
 * and not a rejected file.
 */
function rootWithRowsFor(assetIds: readonly string[]): string {
  const root = mkdtempSync(path.join(tmpdir(), "ndm-slot-"));
  tempRoots.push(root);
  mkdirSync(path.join(root, DERIVATIVE_STORE_DIR), { recursive: true });
  writeFileSync(
    path.join(root, DERIVATIVE_MANIFEST_PATH),
    JSON.stringify({
      derivatives: assetIds.map((assetId) =>
        lineageRowFor(assetId, 640, 480),
      ),
      generatedAt: "2026-11-04T00:00:00.000Z",
      originalsUnchanged: true,
      storeDirectory: DERIVATIVE_STORE_DIR,
    }),
    "utf8",
  );
  return root;
}

afterEach(() => {
  resetDerivativeManifestCache();
  for (const dir of tempRoots.splice(0))
    rmSync(dir, { force: true, recursive: true });
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

  it("keeps the dimensions apart on the delivered register, where clearing and approving no longer decides", () => {
    // Measured 4 November 2026. The Owner's instrument armed rights and approval on every catalogued row, so
    // the three dimensions now differ only in publication — and that is exactly the state A.9 says must not be
    // collapsed into one "cleared" figure. A summary that merged them would print 82 where the gate says 46,
    // and a footer built from it would claim imagery the pages do not show.
    const records = assetRegister();
    const serving = publicServingSummary();
    expect(serving.total).toBe(records.length);
    expect(serving.cleared).toBe(
      records.filter((asset) => asset.rights === "cleared").length,
    );
    expect(serving.approved).toBe(
      records.filter((asset) => asset.approval === "approved").length,
    );
    expect(serving.gatePassed).toBe(
      records.filter(
        (asset) =>
          asset.rights === "cleared" &&
          asset.approval === "approved" &&
          asset.published,
      ).length,
    );
    expect(serving.gatePassed).toBeLessThan(serving.total);
    // The gate figure is a conjunction, so it can never exceed either dimension it is taken from.
    expect(serving.gatePassed).toBeLessThanOrEqual(serving.cleared);
    expect(serving.gatePassed).toBeLessThanOrEqual(serving.approved);
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
    // `gatePassed` is what `decidePublicServing` allows. A slot additionally needs a produced copy in the
    // private store and an authored label, so the two numbers answer different questions and A.9 forbids
    // merging them. Today they differ for a reason rather than by both being zero: one published asset has no
    // derivative at all, and several bound surfaces point at assets the publication register does not name.
    const serving = publicServingSummary();
    const servableViews = TARGETS.flatMap((target) => viewsFor(target, "en"));
    const images = servableViews.filter(
      (view) => slotOutcome(view) === "image",
    );
    // A rendered slot is a strictly narrower claim than a gate-passing row.
    for (const view of images) {
      expect(decidePublicServing(need(view.assetId)).serve).toBe(true);
      expect(lineageFor(view.assetId)).not.toBeNull();
      expect(altTextFor(need(view.assetId), "en")).not.toBeNull();
    }
    // And a gate-passing row with no produced copy renders nothing, which is the half that would be lost if
    // the slot asked the gate and stopped there.
    const clearedButUnproduced = one(
      assetRegister().filter(
        (asset) => decidePublicServing(asset).serve && !LINEAGE_IDS.has(asset.assetId),
      ),
      "asset the gate clears with no derivative on disk",
    );
    expect(servedSrcFor(clearedButUnproduced)).toBeNull();
    expect(serving.gatePassed).toBeGreaterThan(images.length);
  });
});

describe("servingFooterSentence", () => {
  it("prints the numbers it was given, and only claims no imagery where there is none", () => {
    // The requirement is not the sentence of a particular day. It is that the footer states the delivered
    // summary in the delivered summary's own figures, and that the clause "no imagery is rendered anywhere
    // in this build" belongs to a zero gate and cannot survive one. That second half is what let the old
    // literal stand: a footer that says *both* numbers and *no pictures* is simply false once pictures exist.
    const summary = publicServingSummary();
    const sentence = servingFooterSentence(summary);
    expect(sentence).toContain(
      `${String(summary.total)} catalogued assets`,
    );
    expect(sentence).toContain(
      `${String(summary.gatePassed)} pass the public-serving gate`,
    );
    expect(summary.gatePassed === 0).toBe(
      sentence.includes("no imagery is rendered anywhere in this build"),
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
    expect(
      servingFooterSentence({
        total: 7,
        cleared: 0,
        approved: 0,
        gatePassed: 0,
      }),
    ).toContain("7 catalogued assets, 0 pass");
    expect(partial).not.toBe(servingFooterSentence(publicServingSummary()));
  });

  it("never promises an image in either branch", () => {
    for (const summary of [
      publicServingSummary(),
      { total: 82, cleared: 82, approved: 82, gatePassed: 82 },
    ] as const) {
      expect(servingFooterSentence(summary)).not.toMatch(
        /renders? (the )?(imagery|photos)/i,
      );
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
  it("shows the mark the gate allows, or the name as text, and never which gate stopped it", async () => {
    for (const locale of LOCALES) {
      const html = await renderLayout(locale);
      const [masthead] = slotViewsFor("global", locale);
      if (masthead === undefined)
        throw new Error("the map binds no Header surface");
      const outcome = slotOutcome(masthead);
      /*
       * SR-02 is about what the markup *says*, not about which branch the page is in, so the case follows
       * the band rather than remembering it. Either the header asset clears every check and its picture is
       * drawn, or the name is drawn in text instead. In both branches the band's structural hook names the
       * component's own state and nothing outside it: no `rights_not_cleared`, no `not_published`, no
       * catalog id — a header that printed the reason would undo the 404 with no reason that
       * `src/app/api/media/[assetId]/route.ts` goes out of its way to answer with.
       */
      if (outcome === "image") {
        expect(html).toContain('data-slot="approved-mark"');
        expect(html).toContain("<img");
        expect(html).not.toContain("approved-mark-pending");
      } else {
        expect(html).toContain('data-slot="approved-mark-pending"');
        // What the band shows instead of the mark: the name, as text. The refusal is not a blank gap.
        expect(html).toContain(">Noujoude<");
      }
      for (const reason of [
        "rights_not_cleared",
        "approval_not_granted",
        "not_published",
        "unrecognised_state",
        "alt_text_not_recorded",
      ])
        expect(html, `${locale}: ${reason}`).not.toContain(reason);
      expect(html).not.toMatch(/\sdata-(?:asset-id|surface|reason)=/);
      // An id may reach the wire only inside the URL of a picture that is actually drawn — including the
      // preload hint React hoists beside it, which is the same permission expressed in a different tag.
      expect(withoutDrawnImagery(html).match(/NDM-AST-\d{3}/g)).toBeNull();
    }
  });

  it("renders exactly the pictures the shell is allowed to render, and no others", async () => {
    for (const locale of LOCALES) {
      const html = await renderLayout(locale);
      const drawn = [...html.matchAll(/<img[^>]*src="\/api\/media\/(NDM-AST-\d{3})"[^>]*\/>/g)]
        .map((match) => match[1] as string);
      const expected = slotViewsFor("global", locale)
        .filter((view) => slotOutcome(view) === "image")
        .map((view) => view.assetId);
      expect(drawn).toEqual(expected);
      // The preload hint React emits beside an image is the same leak in a different tag, so a guard that
      // only looks for `<img` would miss it: one image, one hint, no more.
      expect((html.match(/as="image"/g) ?? []).length).toBe(drawn.length);
      // Every image the shell draws carries the label the label file authored for it, and the pixels the
      // lineage record measured — not the original's.
      for (const assetId of drawn) {
        const asset = need(assetId);
        const text = altTextFor(asset, locale);
        expect(text).not.toBeNull();
        expect(html).toContain(`alt="${attr(text ?? "")}"`);
        const lineage = lineageFor(assetId);
        expect(lineage).not.toBeNull();
        expect(html).toContain(`width="${String(lineage?.width ?? 0)}"`);
      }
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
    const surfaces = TARGETS.reduce(
      (sum, target) => sum + viewsFor(target, "en").length,
      0,
    );
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
    const ids = TARGETS.flatMap((target) =>
      viewsFor(target, "en").map((view) => view.assetId),
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      new Set(SURFACE_BINDINGS.map((binding) => binding.surface)).size,
    ).toBe(SURFACE_BINDINGS.length);
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

  it("carries the facts of its own sources into the slot, and invents none", () => {
    let withDerivative = 0;
    let withoutDerivative = 0;
    let dimensionsMoved = 0;
    for (const target of TARGETS) {
      for (const view of viewsFor(target, "en")) {
        const asset = need(view.assetId);
        const lineage = lineageFor(view.assetId);
        expect(view.record.assetId).toBe(asset.assetId);
        expect(view.record.rights).toBe(asset.rights);
        expect(view.record.approval).toBe(asset.approval);
        expect(view.record.published).toBe(asset.published);
        // The dimensions reported are the bytes that will actually be fetched: the derivative's when the
        // store carries one, the register's measured original when it does not. Neither is read off a
        // filename, and the two branches are both live in this build — the profile resizes some originals and
        // leaves others alone, so the counts below are what prove the seam reports the row rather than
        // reporting the same number twice by luck.
        expect(view.record.width).toBe(lineage?.width ?? asset.width);
        expect(view.record.height).toBe(lineage?.height ?? asset.height);
        if (lineage === null) withoutDerivative += 1;
        else {
          withDerivative += 1;
          if (lineage.width !== asset.width || lineage.height !== asset.height)
            dimensionsMoved += 1;
        }
        /*
         * `src` and `altText` are stated here from their own sources — the gate's answer plus the store's
         * row, and the label file's string for this locale — rather than by re-calling the helpers that fill
         * them in. That is the difference between "the seam reports what it read" and "the seam agrees with
         * itself": an asset the gate refuses gets no URL whatever the store holds, and an asset no one has
         * described gets no sentence however much the file exists.
         */
        expect(view.facts.src).toBe(
          decidePublicServing(asset).serve && lineage !== null
            ? `/api/media/${asset.assetId}`
            : null,
        );
        expect(view.facts.altText).toBe(labelFor(asset.filename, "en"));
      }
    }
    expect(withDerivative).toBeGreaterThan(0);
    expect(withoutDerivative).toBeGreaterThan(0);
    expect(dimensionsMoved).toBeGreaterThan(0);
  });

  it("answers every bound slot with the outcome its own facts imply, in both locales", () => {
    const outcomes = new Map<string, string>();
    for (const locale of LOCALES)
      for (const target of TARGETS)
        for (const view of viewsFor(target, locale)) {
          const asset = need(view.assetId);
          const decision = decidePublicServing(asset);
          const sentence = labelFor(asset.filename, locale);
          const expected = !decision.serve
            ? decision.denial
            : lineageFor(view.assetId) === null
              ? "no_image_source"
              : sentence === null
                ? "alt_text_not_recorded"
                : "image";
          expect(slotOutcome(view), label(target)).toBe(expected);
          outcomes.set(slotOutcome(view), slotOutcome(view));
        }
    // What the delivered build actually produces over the 46 bound surfaces in both locales, stated as the
    // set of outcomes rather than as one remembered reason: 90 views draw a picture and 2 answer
    // `no_image_source`, which is `NDM-AST-041` on `en` and `ar` — published and labelled, but the one
    // authorised file the pipeline refused as `WRONG_FORMAT`. No bound surface reaches a *legal* refusal,
    // because the map's bindings are exactly the publication register's rows; the old case asserted
    // `["rights_not_cleared"]`, which was a snapshot of a register the Owner had not yet signed.
    expect([...outcomes.keys()].sort()).toEqual(["image", "no_image_source"]);
  });

  it("leaves 36 catalogued assets on no route, and every one of them is unbound by the map's own list", () => {
    const bound = new Set(
      TARGETS.flatMap((target) =>
        viewsFor(target, "en").map((view) => view.assetId),
      ),
    );
    const unbound = assetRegister().filter(
      (asset) => !bound.has(asset.assetId),
    );
    expect(unbound.length).toBe(36);
    const unboundSurfaces = new Set(
      UNBOUND_SURFACES.map((entry) => entry.surface.toLowerCase()),
    );
    for (const asset of unbound) {
      expect(
        asset.surfaces.every((surface) =>
          unboundSurfaces.has(surface.toLowerCase()),
        ),
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
  it("reads the delivered manifest through the same door the route reads, rows and all", () => {
    // Measured 4 November 2026: the pipeline has run, so the absence branch of this seam is proven on a temp
    // root (`serving.test.ts` covers it) and what is asserted here is the delivered record's own shape: the
    // cache and the direct read agree, the cleared asset the slot renders has a row, and the asset the gate
    // refuses does not.
    const manifest = derivativeManifest();
    expect(manifest).not.toBeNull();
    expect(readDerivativeManifest()).toEqual(manifest);
    expect(LINEAGE_IDS.has(SERVED.assetId)).toBe(true);
    expect(LINEAGE_IDS.has(DENIED.assetId)).toBe(false);
    // Every row belongs to an asset the gate lets through, which is the property the clearance ledger is built
    // to preserve: a derivative exists only for a file the Owner's instrument named.
    for (const row of manifest?.derivatives ?? [])
      expect(decidePublicServing(need(row.assetId)).serve).toBe(true);
  });

  it("serves nothing to a refused asset even when the store carries a row for it", () => {
    // The store is deliberately over-inclusive here — a row for all 82 catalogued assets — because that is the
    // input that would open the gate if the seam asked the store instead of the register. It does not: the
    // answer is a URL for the cleared rows and null for every refused one.
    const root = rootWithRowsFor(assetRegister().map((asset) => asset.assetId));
    for (const asset of assetRegister()) {
      expect(
        servedSrcFor(asset, root),
        `${asset.assetId}: ${asset.rights}/${asset.approval}/${String(asset.published)}`,
      ).toBe(
        decidePublicServing(asset).serve
          ? `/api/media/${asset.assetId}`
          : null,
      );
    }
    expect(servedSrcFor(DENIED, root)).toBeNull();
    // Precondition: the refusal above is not an unreadable record. The row for the denied id is on disk, in
    // the shape the validator accepts, and `lineageFor` finds it.
    expect(lineageFor(DENIED.assetId, root)?.assetId).toBe(DENIED.assetId);
  });

  it("keeps a refused asset refused when a lineage row exists for it, and reports the row's pixels", () => {
    const root = rootWithLineage(DENIED.assetId, 640, 480);
    // The lineage plumbing is live — the slot reports the derivative's pixels, not the original's — and it
    // still draws nothing. That is the difference between an unbuilt feature and a refused one, and it is the
    // property the masthead used to demonstrate while every row was denied.
    expect(need(DENIED.assetId).width).not.toBe(640);
    const { record, facts } = slotInputFor(DENIED, "en", root);
    expect(record.width).toBe(640);
    expect(record.height).toBe(480);
    expect(facts.src).toBeNull();
    expect(
      slotOutcome({
        assetId: DENIED.assetId,
        facts,
        record,
        surface: "Header",
      }),
    ).toBe(decidePublicServing(DENIED).denial);
    // The other side of the same seam, for contrast: the masthead asset the Owner's instrument did clear is
    // drawn, so the block above is about permission and not about a component that cannot render.
    expect(
      slotOutcome(one(slotViewsFor("global", "en"), "the global masthead slot")),
    ).toBe("image");
  });

  it("hands a cleared asset a source and still refuses it for want of alt text", () => {
    const root = rootWithLineage("NDM-AST-001", 640, 480);
    /*
     * The refusal is reached on a row no one has described, which the delivered register no longer contains:
     * `docs/asset-governance/descriptive-labels.json` labels all 82 files, so the branch is exercised against
     * a filename the label file does not carry rather than by editing the register or faking a rights state.
     * The record below is otherwise a real one, and its `Asset ID` stays inside the delivered range so the
     * lineage row resolves — what is synthetic is the *filename*, which is exactly the input the label lookup
     * is keyed on.
     */
    const asset: AssetRecord = {
      ...cleared(need("NDM-AST-001")),
      filename: "a-file-nobody-has-described.webp",
    };
    expect(labelFor(asset.filename, "en")).toBeNull();
    expect(servedSrcFor(asset, root)).toBe("/api/media/NDM-AST-001");
    const { record, facts } = slotInputFor(asset, "en", root);
    expect(facts.src).toBe("/api/media/NDM-AST-001");
    expect(facts.altText).toBeNull();
    expect(
      slotOutcome({ assetId: asset.assetId, facts, record, surface: "Header" }),
    ).toBe("alt_text_not_recorded");
  });

  it("writes the label file's own sentence into each locale, and none for a file it does not describe", () => {
    // §8.14's two required localized values, measured: every catalogued asset now has a description in both
    // languages, the string is the one the governance record owns, and the Arabic page is not handed the
    // English sentence. An absent label still reports absence instead of a guess.
    for (const asset of assetRegister()) {
      for (const locale of LOCALES) {
        const text = altTextFor(asset, locale);
        expect(text, `${asset.assetId}/${locale}`).toBe(
          labelFor(asset.filename, locale),
        );
        expect(text).not.toBeNull();
        expect((text ?? "").trim().length).toBeGreaterThan(0);
      }
      const en = altTextFor(asset, "en") ?? "";
      const ar = altTextFor(asset, "ar") ?? "";
      expect(ar).not.toBe(en);
      expect(ar).toMatch(/[\u0600-\u06FF]/);
    }
    expect(
      altTextFor(
        { ...need("NDM-AST-001"), filename: "a-file-nobody-has-described.webp" },
        "en",
      ),
    ).toBeNull();
  });
});

describe("the bound routes as a visitor receives them", () => {
  it("draw a picture per cleared surface, a refusal per withheld one, and no identity for either", () => {
    for (const target of TARGETS) {
      const views = viewsFor(target, "en");
      const html = renderToStaticMarkup(
        createElement(MediaSlotGroup, { views }),
      );
      const images = views.filter((view) => slotOutcome(view) === "image");
      const withheld = views.length - images.length;

      // The count in the markup is the count of the things standing under it. §6.1 bars a fabricated count,
      // and the fabricated form that matters now is a tally that still says 0 while pictures are drawn.
      expect(html).toContain(expectedTally(views));
      const printed = /bound to this route, (\d+) (?:is|are) cleared/.exec(html);
      expect(printed === null ? null : Number(printed[1])).toBe(images.length);
      expect((html.match(/<img/g) ?? []).length).toBe(images.length);
      expect((html.match(/data-slot="media-withheld"/g) ?? []).length).toBe(
        withheld,
      );

      /*
       * SR-02, reworded for a build that serves imagery. The rule was never "an asset id may not appear"; it
       * is that a *refusal* may not be identified, because the `/api/media/<id>` route answers 404 with no
       * reason precisely so that a stranger cannot confirm an id is real and withheld. So the id is allowed
       * exactly one home: the `src` of a picture the gate let through. Everything else — the scaffolding
       * around it, the tally, every withheld slot — has to be silent about ids, placements and reasons, and
       * the set of ids that do appear has to be exactly the set the gate cleared.
       */
      const srcIds = [
        ...html.matchAll(/<img[^>]*src="\/api\/media\/(NDM-AST-\d{3})"/g),
      ]
        .map((match) => match[1])
        .filter((id): id is string => id !== undefined)
        .sort();
      expect(srcIds).toEqual(
        images.map((view) => view.assetId).sort(),
      );
      const scaffolding = withoutDrawnImagery(html);
      expect(scaffolding).not.toMatch(/NDM-AST-\d{3}/);
      expect(scaffolding).not.toMatch(/\sdata-(?:asset-id|surface|reason)=/);
      for (const reason of [
        "rights_not_cleared",
        "approval_not_granted",
        "not_published",
        "no_image_source",
        "alt_text_not_recorded",
        "dimensions_not_measured",
      ])
        expect(scaffolding, label(target)).not.toContain(reason);
      for (const view of views)
        expect(scaffolding, `${label(target)}: ${view.surface}`).not.toContain(
          view.surface,
        );
    }
  });

  it("draw only what the gate, the store and the label file all agreed to, in both locales", () => {
    // The positive half of the same page: a picture that renders is a picture whose URL is the gated route,
    // whose alt is the governance sentence for *this locale*, and whose boxes are the derivative's measured
    // pixels. A slot that drew any of the three from a guess would pass a "does it render" test and fail
    // this one.
    for (const locale of LOCALES)
      for (const target of TARGETS) {
        const views = viewsFor(target, locale);
        const html = renderToStaticMarkup(
          createElement(MediaSlotGroup, { views }),
        );
        for (const view of views) {
          if (slotOutcome(view) !== "image") continue;
          const asset = need(view.assetId);
          const lineage = lineageFor(view.assetId);
          expect(html, `${label(target)}: ${view.assetId}`).toContain(
            `src="/api/media/${view.assetId}"`,
          );
          expect(html).toContain(`alt="${attr(altTextFor(asset, locale) ?? "")}"`);
          expect(html).toContain(`width="${String(lineage?.width ?? 0)}"`);
          expect(html).toContain(`height="${String(lineage?.height ?? 0)}"`);
        }
      }
  });

  it("render nothing at all where the catalog bound nothing", () => {
    for (const route of ["privacy", "terms", "story-detail"] as const) {
      expect(
        renderToStaticMarkup(
          createElement(MediaSlotGroup, { views: slotViewsFor(route, "en") }),
        ),
      ).toBe("");
    }
  });
});
