import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { LOCALE_IDENTIFIERS } from "@/domain/locale";
import { decidePublicServing } from "@/domain/rights";
import { PRODUCTION_RIGHTS_VOCABULARY, type AssetRecord } from "@/lib/media/asset-record";
import {
  SURFACE_BINDINGS,
  bindingForSurface,
  boundPathsFor,
} from "@/lib/media/usage-map";
import { assetRegister } from "@/lib/server/media/registry";

/**
 * The publication register is a derived document, and this file proves it.
 *
 * `docs/asset-governance/publication-register.json` is the dated record of which catalogued assets this
 * project places on which live paths. `scripts/audit-assets.mjs` writes the register's `Actual Usage` cell
 * from it, `publishedFrom()` reads that cell to decide the `published` third of the rights triple, and the
 * serving gate refuses any row whose triple is incomplete. So one file sits under a claim that ends in
 * whether a visitor sees a pixel — which makes it the most valuable place in the governance set to test a
 * tautology, because a derived document that silently drifts from its inputs keeps saying something the
 * pipeline no longer does, and every layer above it quotes it.
 *
 * The rule under test is the document's own `rule` field, restated: an asset is published on exactly the
 * paths `src/lib/media/usage-map.ts` binds its *declared* surfaces to, and only while
 * `docs/asset-governance/owner-authorization.json` names its file. Placement and permission, both, and
 * neither one alone.
 *
 * Three ways this could be tested badly, avoided below:
 *
 * 1. Asserting a count. "46 published" is a reading of the delivered catalog on 4 November 2026, not a
 *    requirement; a suite that goes red because the Owner widened a declaration gets edited rather than
 *    read. Every number here is recomputed from the register and the bindings on each run.
 * 2. Comparing the file to a copy of the generator. The derivation below is the rule, not the prose: it
 *    reconstructs the *placement* fields (which asset, which surfaces, which paths) from the same two
 *    inputs the generator imports, and checks the citation fields against the document's own claims about
 *    itself, so nothing is proved by restating it.
 * 3. Trusting that the generator still agrees with itself. It gets run: `--check` exits non-zero when the
 *    file on disk is not what its rule produces, and that exit code is asserted.
 */

const GOVERNANCE_DIR = path.join(process.cwd(), "docs", "asset-governance");

function governance<T>(file: string): T {
  return JSON.parse(
    readFileSync(path.join(GOVERNANCE_DIR, file), "utf8"),
  ) as T;
}

/** One published row of the document, as the generator writes it. */
interface PublicationEntry {
  readonly assetId: string;
  readonly filename: string;
  readonly surfaces: readonly string[];
  readonly paths: readonly string[];
  readonly locales: readonly string[];
  readonly publishedAt: string;
  readonly authority: string;
}

/** One register row the document declines to publish, and the cause it states. */
interface NotPublishedRow {
  readonly assetId: string;
  readonly filename: string;
  readonly why: string;
  readonly surfaces: readonly string[];
}

interface PublicationDocument {
  readonly record: string;
  readonly version: number;
  readonly generatedBy: string;
  readonly generatedOn: string;
  readonly rule: string;
  readonly authority: {
    readonly instrument: string;
    readonly recordedIn: string;
    readonly declaration: string;
  };
  readonly counts: {
    readonly registerRows: number;
    readonly published: number;
    readonly notPublished: number;
    readonly boundSurfaces: number;
  };
  readonly entries: readonly PublicationEntry[];
  readonly notPublished: readonly NotPublishedRow[];
}

const document = governance<PublicationDocument>("publication-register.json");

/** The Owner's declaration — the permission half of the rule, read from its own file. */
const declaration = governance<{
  assets: string[];
  authority: { instrument: string; recordedIn: string };
  publication: { actualUsage: string };
}>("owner-authorization.json");

const register = assetRegister();

const byId = new Map<string, AssetRecord>(
  register.map((asset) => [asset.assetId, asset]),
);

function need(assetId: string): AssetRecord {
  const record = byId.get(assetId);
  if (record === undefined)
    throw new Error(`${assetId} is not in the delivered register`);
  return record;
}

/**
 * The rule, applied.
 *
 * `authorised` is a parameter rather than a constant so a case can ask the counterfactual — what happens to
 * an asset the map binds when the declaration stops naming it — without editing a governance file to prove
 * a property of the rule. The production call passes the filenames the Owner actually named.
 */
function applyRule(authorised: ReadonlySet<string>): {
  readonly entries: readonly {
    readonly assetId: string;
    readonly filename: string;
    readonly surfaces: readonly string[];
    readonly paths: readonly string[];
  }[];
  readonly unmapped: readonly string[];
  readonly unnamed: readonly string[];
} {
  const entries: {
    assetId: string;
    filename: string;
    surfaces: readonly string[];
    paths: readonly string[];
  }[] = [];
  const unmapped: string[] = [];
  const unnamed: string[] = [];
  for (const record of register) {
    const paths = boundPathsFor(record.surfaces);
    if (paths.length === 0) {
      unmapped.push(record.assetId);
      continue;
    }
    if (!authorised.has(record.filename.toLowerCase())) {
      unnamed.push(record.assetId);
      continue;
    }
    entries.push({
      assetId: record.assetId,
      filename: record.filename,
      // Only the surfaces that produced a path. An asset declaring three surfaces and bound on one is
      // published on one, and a register that listed the other two would claim placement the map denies.
      surfaces: record.surfaces.filter((surface) => bindingForSurface(surface) !== null),
      paths,
    });
  }
  return { entries, unmapped, unnamed };
}

const authorised = new Set(
  declaration.assets.map((filename) => filename.toLowerCase()),
);
const derived = applyRule(authorised);

/** The placement fields only — the citation fields are checked against the document, not copied from it. */
const placementOf = (entry: {
  readonly assetId: string;
  readonly filename: string;
  readonly surfaces: readonly string[];
  readonly paths: readonly string[];
}) => ({
  assetId: entry.assetId,
  filename: entry.filename,
  surfaces: [...entry.surfaces],
  paths: [...entry.paths],
});

const publishedIds = document.entries.map((entry) => entry.assetId);
const notPublishedIds = document.notPublished.map((row) => row.assetId);

describe("the document is the rule applied to its own two inputs", () => {
  it("publishes exactly the assets that are both bound on a route and named by the declaration", () => {
    expect(document.entries.map(placementOf)).toEqual(derived.entries);
  });

  it("declines exactly the rows the rule declines, and splits them by cause", () => {
    // Set equality, not order: the generator appends both causes to one list as it walks the register, so a
    // row barred for permission can sit between two rows barred for want of a route.
    expect([...notPublishedIds].sort()).toEqual(
      [...derived.unmapped, ...derived.unnamed].sort(),
    );
  });

  it("names each published id once, and every published id is a register row", () => {
    expect(new Set(publishedIds).size).toBe(publishedIds.length);
    for (const entry of document.entries) {
      expect(byId.has(entry.assetId), entry.assetId).toBe(true);
      expect(entry.filename).toBe(need(entry.assetId).filename);
    }
  });

  it("leaves no register row outside the document in either direction", () => {
    const accounted = [...publishedIds, ...notPublishedIds].sort();
    expect(accounted).toEqual(register.map((asset) => asset.assetId).sort());
    expect(publishedIds.filter((id) => notPublishedIds.includes(id))).toEqual(
      [],
    );
  });

  it("refuses a bound asset the moment the declaration stops naming it", () => {
    // The counterfactual the rule is asked directly: remove the declaration's cover for one bound asset and
    // the rule must refuse it while the binding still points at a live path. Permission is not placement,
    // and this is the direction that a "route exists, therefore publish" implementation would get wrong.
    const bound = derived.entries[0];
    if (bound === undefined)
      throw new Error(
        "the rule places no register row, so permission has nothing to withhold",
      );
    const withoutOne = new Set(authorised);
    withoutOne.delete(bound.filename.toLowerCase());
    const refused = applyRule(withoutOne);
    expect(refused.entries.map((entry) => entry.assetId)).not.toContain(
      bound.assetId,
    );
    expect(refused.unnamed).toContain(bound.assetId);
    expect(boundPathsFor(need(bound.assetId).surfaces).length).toBeGreaterThan(
      0,
    );
  });

  it("publishes nothing whose declared surfaces resolve to no path", () => {
    // The other direction: an asset can be fully authorised and still have nowhere to go. The document must
    // not invent a home for it, because §13.3's `Approved but Unused` state is a fact, not a gap to fill.
    for (const entry of document.entries) {
      expect(boundPathsFor(need(entry.assetId).surfaces).length).toBeGreaterThan(
        0,
      );
    }
    expect(derived.unmapped.length).toBeGreaterThan(0);
  });
});

describe("every path in the document is a path this site has", () => {
  /** The addresses the bindings themselves produce, across every surface the map knows. */
  const pathsWithABinding = new Set(
    SURFACE_BINDINGS.flatMap((binding) => boundPathsFor([binding.surface])),
  );

  it("uses no address that no binding produces", () => {
    for (const entry of document.entries) {
      for (const route of entry.paths) {
        expect(pathsWithABinding.has(route), `${entry.assetId} -> ${route}`).toBe(
          true,
        );
      }
    }
  });

  it("keeps every address inside the locale contract §4.2 sets", () => {
    const prefixes = LOCALE_IDENTIFIERS.map((locale) => `/${locale}`);
    for (const entry of document.entries) {
      for (const route of entry.paths) {
        const isMasthead = route === "every page (masthead band)";
        const isRooted = prefixes.some(
          (prefix) => route === prefix || route.startsWith(`${prefix}/`),
        );
        expect(isMasthead || isRooted, `${entry.assetId} -> ${route}`).toBe(true);
      }
    }
  });

  it("carries no empty or duplicate address", () => {
    for (const entry of document.entries) {
      expect(entry.paths.length).toBeGreaterThan(0);
      expect(new Set(entry.paths).size).toBe(entry.paths.length);
      for (const route of entry.paths) expect(route.trim()).toBe(route);
    }
  });

  it("publishes in both locales the baseline admits", () => {
    // §4.2 fixes the identifiers and makes prefixing mandatory for public experiences, so a published asset
    // that named one locale would be a record of a page that does not exist.
    for (const entry of document.entries) {
      expect([...entry.locales].sort()).toEqual(
        [...LOCALE_IDENTIFIERS].sort(),
      );
    }
  });

  it("binds surfaces only to routes, and lists only surfaces the row itself declares", () => {
    for (const entry of document.entries) {
      const record = need(entry.assetId);
      expect(entry.surfaces.length).toBeGreaterThan(0);
      expect(new Set(entry.surfaces).size).toBe(entry.surfaces.length);
      for (const surface of entry.surfaces) {
        expect(record.surfaces, `${entry.assetId} ${surface}`).toContain(surface);
        expect(bindingForSurface(surface), surface).not.toBeNull();
      }
    }
  });
});

describe("the document is consistent about its own authority", () => {
  it("dates every entry the day it was generated", () => {
    expect(document.entries.length).toBeGreaterThan(0);
    for (const entry of document.entries) {
      expect(entry.publishedAt).toBe(document.generatedOn);
      expect(entry.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("cites the same instrument the Owner declaration cites", () => {
    const instrument = document.authority.instrument;
    expect(instrument.startsWith(declaration.authority.instrument)).toBe(true);
    expect(document.authority.recordedIn).toBe(declaration.authority.recordedIn);
    for (const entry of document.entries) {
      expect(entry.authority).toBe(instrument);
    }
  });

  it("points its authority at the declaration and the file that records it", () => {
    expect(document.authority.declaration).toBe(
      "docs/asset-governance/owner-authorization.json",
    );
    expect(document.authority.recordedIn.startsWith("docs/")).toBe(true);
    expect(
      readFileSync(
        path.join(process.cwd(), document.authority.recordedIn),
        "utf8",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("keeps the limit on what publication means inside the artefact", () => {
    // The rule field is the only place a generated file can say what it does not assert. Dropping it would
    // leave a dated list of published assets that reads like a provenance grant, which mandate §2 and
    // DEC-INV-001 refuse.
    expect(document.rule).toContain("usage-map.ts");
    expect(document.rule).toContain("owner-authorization.json");
    expect(document.rule).toContain("DEC-INV-001");
    expect(document.rule).toContain("B-05");
  });

  it("says what it is and who wrote it", () => {
    expect(document.record).toBe("noujoude.asset-governance.publication-register");
    expect(document.version).toBe(1);
    expect(document.generatedBy).toBe("scripts/build-publication-register.mjs");
  });

  it("carries no commerce or ownership claim anywhere in its text", () => {
    const text = JSON.stringify(document).toLowerCase();
    for (const forbidden of [
      "add to cart",
      "buy now",
      "checkout",
      "price",
      "in stock",
      "for sale",
      "ownership of",
    ]) {
      expect(text, forbidden).not.toContain(forbidden);
    }
  });
});

describe("the counts are the document's own arithmetic", () => {
  it("adds up to the register it was built from", () => {
    expect(document.counts.registerRows).toBe(register.length);
    expect(document.counts.published).toBe(document.entries.length);
    expect(document.counts.notPublished).toBe(document.notPublished.length);
    expect(document.counts.boundSurfaces).toBe(SURFACE_BINDINGS.length);
    expect(document.counts.published + document.counts.notPublished).toBe(
      document.counts.registerRows,
    );
  });

  it("reports the same split the rule derives", () => {
    expect(document.counts.published).toBe(derived.entries.length);
    expect(document.counts.notPublished).toBe(
      derived.unmapped.length + derived.unnamed.length,
    );
  });
});

describe("each excluded row states the thing that bars it", () => {
  it("names the row's declared surfaces, bound or not", () => {
    for (const row of document.notPublished) {
      expect(byId.has(row.assetId), row.assetId).toBe(true);
      expect(row.filename).toBe(need(row.assetId).filename);
      expect(row.surfaces).toEqual([...need(row.assetId).surfaces]);
      expect(row.why.trim().length).toBeGreaterThan(20);
    }
  });

  it("gives the two causes two different statements", () => {
    // A row with no route and a row without permission are different facts, and §13.3 refuses to collapse
    // them: the first is a gap in the baseline, the second is a withheld consent. One sentence for both
    // would make an unavailable asset indistinguishable from an unauthorised one.
    //
    // The delivered catalog covers all 82 files, so the permission cause has no live row today and its loop
    // below is empty. That is a fact about the Owner's declaration, not a hole in the rule: the counterfactual
    // in the first block of this file exercises exactly that branch by taking one filename away.
    for (const assetId of derived.unmapped) {
      const row = document.notPublished.find((r) => r.assetId === assetId);
      if (row === undefined) throw new Error(`${assetId} vanished from the document`);
      expect(row.why).toMatch(/usage map|route/i);
    }
    for (const assetId of derived.unnamed) {
      const row = document.notPublished.find((r) => r.assetId === assetId);
      if (row === undefined) throw new Error(`${assetId} vanished from the document`);
      expect(row.why).toMatch(/declar|authoris/i);
    }
  });

  it("never bars a row for a cause the rule does not find", () => {
    for (const row of document.notPublished) {
      const paths = boundPathsFor(need(row.assetId).surfaces);
      const named = authorised.has(row.filename.toLowerCase());
      expect(paths.length === 0 || !named, row.assetId).toBe(true);
    }
  });
});

describe("the register the pages read quotes this document, not a copy of it", () => {
  /**
   * The chain that makes the document load-bearing: `scripts/audit-assets.mjs` writes each published row's
   * `Actual Usage` cell from an entry here, `publishedFrom()` reads that cell against the production
   * vocabulary, and `decidePublicServing()` consumes the triple. A cell that disagreed with the document
   * would put a stale publication claim in front of the gate.
   */
  const marker = declaration.publication.actualUsage;

  it("accepts the marker the vocabulary recognises as publication", () => {
    expect(
      PRODUCTION_RIGHTS_VOCABULARY.publishedMarkers.some((prefix) =>
        marker.startsWith(prefix),
      ),
    ).toBe(true);
  });

  it("marks published exactly the rows this document names", () => {
    for (const assetId of publishedIds) {
      expect(need(assetId).published, assetId).toBe(true);
    }
    for (const assetId of notPublishedIds) {
      expect(need(assetId).published, assetId).toBe(false);
    }
  });

  it("writes a cell that repeats the entry's date and every one of its paths", () => {
    for (const entry of document.entries) {
      const cell = need(entry.assetId).usageStatement;
      expect(cell.startsWith(marker), entry.assetId).toBe(true);
      expect(cell).toContain(entry.publishedAt);
      for (const route of entry.paths) {
        expect(cell, `${entry.assetId} -> ${route}`).toContain(route);
      }
    }
  });

  it("gives an unpublished row no cell that reads as publication", () => {
    for (const row of document.notPublished) {
      expect(need(row.assetId).usageStatement.startsWith(marker)).toBe(false);
    }
  });

  it("keeps publication a necessary, not a sufficient, condition for serving", () => {
    // The gate is `cleared && approved && published`. Every published row must satisfy it; and a row this
    // document declines must not be *served*, whatever its other cells say. Whether the converse also fails
    // is a fact about the other two cells, so it is asserted per row rather than as a set equality.
    for (const assetId of publishedIds) {
      expect(decidePublicServing(need(assetId)).serve, assetId).toBe(true);
    }
    for (const row of document.notPublished) {
      expect(decidePublicServing(need(row.assetId)).serve, row.assetId).toBe(
        false,
      );
    }
  });
});

describe("the generator still agrees with the file it wrote", () => {
  it("exits zero when re-running its rule changes nothing", () => {
    // The re-derivation above is this suite's reading of the rule; this is the generator's own. Both have to
    // hold, because the failure that matters is the two drifting apart — a test that reimplements a rule and
    // nothing else stays green while the tool that writes the file starts producing something else.
    // `--check` exits 1 on that drift and writes nothing.
    expect(() =>
      execFileSync(
        process.execPath,
        [path.join("scripts", "build-publication-register.mjs"), "--check"],
        { cwd: process.cwd(), stdio: "pipe" },
      ),
    ).not.toThrow();
  }, 120_000);
});
