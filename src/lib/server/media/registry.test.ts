import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ASSET_REGISTER_PATH,
  assetByFilename,
  assetById,
  assetRegister,
  assetsForSurface,
  publiclyServeableAssets,
  readAssetRegister,
  registerTally,
  registryFromText,
  resetAssetRegisterCache,
} from "@/lib/server/media/registry";
import { AssetRegistryError, type AssetRecord, AUDIT_COLUMNS } from "@/lib/media/asset-record";
import { decidePublicServing } from "@/domain/rights";

/**
 * The register read through the media layer, measured against the delivered file.
 *
 * Every number in this file is a measurement of `docs/ASSET_INVENTORY_AUDIT.csv` taken on
 * 2 November 2026, not a guess about what an inventory ought to contain. They are asserted rather than
 * logged because they are the release condition: "0 of 82 assets may be served publicly" is a claim
 * the site makes in its own footer, and a claim a footer makes is a claim a test has to hold.
 *
 * Several of these will go red on purpose the day an Owner input arrives — a signed rights statement,
 * an approval record, a re-audit that changes a count. That is the intended behaviour, not a
 * regression: the red test is the notification that the sentence in the layout needs re-writing.
 */

const register = assetRegister();

/**
 * Strict mode makes an indexed read `T | undefined`, and a test that silences that with `!` is a test
 * that can pass by asserting nothing. This helper makes the absent case a failure with a name.
 */
function one<T>(items: readonly T[], what: string): T {
  const [first] = items;
  if (first === undefined) throw new Error(`expected one ${what}, found none`);
  return first;
}

function need(assetId: string): AssetRecord {
  const record = assetById(assetId);
  if (record === null) throw new Error(`${assetId} is not in the register`);
  return record;
}

describe("the delivered register parses through the media layer", () => {
  it("reads 82 assets from the 20-column file the audit delivers", () => {
    expect(register).toHaveLength(82);
    expect(new Set(register.map((asset) => asset.assetId)).size).toBe(82);
    expect(register[0]?.assetId).toBe("NDM-AST-001");
    expect(register[81]?.assetId).toBe("NDM-AST-082");
  });

  it("reads the same bytes the audit wrote, so the two cannot disagree about a count", () => {
    const text = readFileSync(
      path.join(process.cwd(), ASSET_REGISTER_PATH),
      "utf8",
    );
    const viaLayer = registryFromText(text);
    expect(viaLayer.map((asset) => asset.assetId)).toEqual(
      register.map((asset) => asset.assetId),
    );
    expect(viaLayer).toHaveLength(82);
  });

  it("holds a record per asset, not a path to a file it may not open", () => {
    // `src/README.md` fixes this rule: application code reads asset data through the media/rights
    // layer and never reaches into the original library at runtime. The register's `Actual Path` column
    // is a record of where a file lives, always relative to `Noujoude.photo/`, so a page that joined it
    // to a filesystem root would be a page that bypassed the gate.
    for (const asset of register) {
      expect(asset.libraryPath.startsWith("/")).toBe(false);
      expect(asset.libraryPath).not.toMatch(/^[A-Za-z]:/);
      expect(asset.libraryPath).not.toContain("..");
      expect(asset.libraryPath).not.toContain("Noujoude.photo");
    }
  });

  it("records the file it read, so a missing register is a failure and not an empty library", () => {
    expect(ASSET_REGISTER_PATH).toBe(path.join("docs", "ASSET_INVENTORY_AUDIT.csv"));
    expect(() => readAssetRegister(path.join(process.cwd(), "docs"))).toThrow(
      AssetRegistryError,
    );
  });

  it("re-reads on demand and caches between reads", () => {
    const first = assetRegister();
    expect(assetRegister()).toBe(first);
    resetAssetRegisterCache();
    expect(assetRegister()).not.toBe(first);
    expect(assetRegister().map((a) => a.assetId)).toEqual(
      first.map((a) => a.assetId),
    );
  });
});

describe("the three dimensions of the 82 assets, never merged into one number", () => {
  const tally = registerTally(register);

  it("measures physical state", () => {
    expect(tally.total).toBe(82);
    expect(tally.present).toBe(81);
    expect(tally.notPresent).toBe(1);
    // NDM-AST-041 is the one row the audit flags: a .jpg extension on a WebP container.
    expect(need("NDM-AST-041").physicalStatus).toBe("WRONG_FORMAT");
    expect(need("NDM-AST-041").notes).toContain(
      "extension .jpg but container is image/webp",
    );
  });

  it("measures rights state: nothing is cleared, ten are in review", () => {
    expect(tally.rightsCleared).toBe(0);
    expect(tally.rightsPending).toBe(10);
    expect(tally.rightsUnknown).toBe(72);
    expect(tally.rightsCleared + tally.rightsPending + tally.rightsUnknown).toBe(
      tally.total,
    );
    // The ten AI-generated assets are the pending ones, and they are the last ten ids.
    expect(
      register.filter((a) => a.rights === "pending").map((a) => a.assetId),
    ).toEqual([
      "NDM-AST-073",
      "NDM-AST-074",
      "NDM-AST-075",
      "NDM-AST-076",
      "NDM-AST-077",
      "NDM-AST-078",
      "NDM-AST-079",
      "NDM-AST-080",
      "NDM-AST-081",
      "NDM-AST-082",
    ]);
  });

  it("measures approval state: not one asset has a curatorial approval", () => {
    expect(tally.approved).toBe(0);
    expect(tally.notApproved).toBe(82);
    expect(tally.approvalUnknown).toBe(0);
  });

  it("measures publication: no publish record exists, so nothing is published", () => {
    expect(register.every((asset) => asset.published === false)).toBe(true);
  });

  it("offers no combined completion percentage, because A.9 forbids one", () => {
    const keys = Object.keys(tally).sort();
    expect(keys).toEqual([
      "approvalUnknown",
      "approved",
      "declarationMismatch",
      "notApproved",
      "notPresent",
      "present",
      "rightsCleared",
      "rightsPending",
      "rightsUnknown",
      "serveable",
      "total",
    ]);
    expect(keys.some((key) => /percent|complete|progress/i.test(key))).toBe(
      false,
    );
  });
});

describe("R-04: a filename is a claim about pixels, and the pixels win", () => {
  it("carries the same 18 name/pixel defects the audit and the preflight gate report", () => {
    expect(registerTally(register).declarationMismatch).toBe(18);
    expect(
      register.filter((asset) => asset.declaration !== null),
    ).toHaveLength(18);
  });

  it("states the defect in the audit's own words rather than inventing a format", () => {
    expect(need("NDM-AST-001").declaration).toBe(
      "filename declares 1024px, longest side is 512px (512x512)",
    );
    expect(need("NDM-AST-003").declaration).toBe(
      "filename declares 1024x1536, file is 341x512",
    );
  });

  it("keeps the measured dimensions as the dimensions of record", () => {
    const declared = need("NDM-AST-001");
    expect(declared.filename).toContain("1024");
    expect(declared.width).toBe(512);
    expect(declared.height).toBe(512);
  });

  it("leaves the declaration null where the name and the pixels agree", () => {
    expect(need("NDM-AST-041").declaration).toBeNull();
  });
});

describe("§20.4: the serveable set, measured today", () => {
  it("serves nothing, because 0 of 82 assets are cleared", () => {
    expect(publiclyServeableAssets()).toEqual([]);
    expect(registerTally(register).serveable).toBe(0);
  });

  it("denies every single asset, with a reason that is not a bare false", () => {
    for (const asset of register) {
      const decision = decidePublicServing(asset);
      expect(decision.serve).toBe(false);
      expect(decision.denial).not.toBeNull();
    }
  });

  it("denies on rights before approval, which is why the reason differs by row", () => {
    expect(decidePublicServing(need("NDM-AST-001")).denial).toBe(
      "rights_not_cleared",
    );
    // Every row is unapproved, so approval is never the first failure reached today. The distinction is
    // recorded here so the day a cleared asset appears, the denial order is already specified.
    expect(
      new Set(register.map((asset) => decidePublicServing(asset).denial)),
    ).toEqual(new Set(["rights_not_cleared"]));
  });
});

describe("surface lookup, which is a question about the catalog, not about rights", () => {
  it("finds the asset the catalog assigns to the homepage hero", () => {
    const heroes = assetsForSurface("Homepage hero");
    expect(heroes.map((asset) => asset.assetId)).toEqual(["NDM-AST-013"]);
    // Belonging is not permission: the candidate for the hero is denied like every other asset.
    expect(decidePublicServing(one(heroes, "homepage hero")).serve).toBe(false);
  });

  it("matches the catalog's surface names case-insensitively", () => {
    expect(assetsForSurface("homepage hero")).toHaveLength(1);
    expect(assetsForSurface("  Morocco World  ")).toHaveLength(1);
  });

  it("returns nothing for a surface the catalog never named", () => {
    expect(assetsForSurface("Checkout Page")).toEqual([]);
  });

  it("every asset carries a role and at least one surface, so none is unassigned", () => {
    expect(register.every((asset) => asset.role.length > 0)).toBe(true);
    expect(register.every((asset) => asset.surfaces.length > 0)).toBe(true);
  });

  it("has no asset claiming a surface that contradicts its own category prefix", () => {
    // Guards the parse itself: a shifted `Intended Usage` column would surface category text.
    for (const asset of register) {
      expect(asset.role).not.toMatch(/^A\.\d/);
      expect(asset.surfaces.join(",")).not.toMatch(/^A\.\d/);
    }
  });
});

describe("lookup by identity", () => {
  it("resolves an asset id and a filename, and answers null for what is not in the register", () => {
    expect(assetById("NDM-AST-013")?.assetId).toBe("NDM-AST-013");
    expect(assetByFilename("brand_seal_monogram_1024.webp")?.assetId).toBe(
      "NDM-AST-001",
    );
    expect(assetById("NDM-AST-999")).toBeNull();
    expect(assetByFilename("..//escape.webp")).toBeNull();
    expect(assetById("")).toBeNull();
  });

  it("names each asset's recorded container, which is sniffed from bytes, not from the extension", () => {
    const counts = new Map<string, number>();
    for (const asset of register) {
      counts.set(asset.mime, (counts.get(asset.mime) ?? 0) + 1);
    }
    expect([...counts.entries()].sort()).toEqual([
      ["image/jpeg", 13],
      ["image/webp", 69],
    ]);
    // The WRONG_FORMAT row is the visible proof: its name says .jpg, its bytes say WebP.
    const wrong = assetById("NDM-AST-041");
    expect(wrong?.filename.endsWith(".jpg")).toBe(true);
    expect(wrong?.mime).toBe("image/webp");
  });

  it("keeps the header contract the audit delivers", () => {
    const text = readFileSync(
      path.join(process.cwd(), ASSET_REGISTER_PATH),
      "utf8",
    );
    const header = one(text.split(/\r?\n/), "the register's header line");
    const columns = header.split(",");
    expect(columns.length).toBe(AUDIT_COLUMNS.length);
    expect(columns[0]).toBe(AUDIT_COLUMNS[0]);
    expect(columns[columns.length - 1]).toBe(AUDIT_COLUMNS[19]);
  });
});

/**
 * SR-08 — a register change is visible on the next read.
 *
 * `assetRegister()` used to answer "have I read this file yet?" and then keep the rows for the lifetime of
 * the process. That is not a performance defect, it is a governance one: the day an Owner withdraws a
 * rights statement or rescinds an approval, the row in `docs/ASSET_INVENTORY_AUDIT.csv` changes and the
 * running site carries on deciding from the previous rows — a revocation that takes effect only at the next
 * restart is a revocation that has not taken effect (ASVS V3.5, NIST SP 800-53r5 AC-4). The cache is now
 * keyed on the SHA-256 of the register bytes, so these cases are written against the *file*: rewrite it,
 * call again, and require the new content with no reset in between.
 *
 * Every case runs against a throwaway root under the OS temp directory. The delivered register is read by
 * the blocks above and is never edited by this one.
 */
const fixtureRoots: string[] = [];

/** One register row, in the delivered 20-column order, with the cells a case cares about overridden. */
function registerRow(overrides: Record<string, string> = {}): string {
  const cells: Record<string, string> = {
    "Asset ID": "NDM-AST-001",
    Filename: "fixture_asset_512.webp",
    "Expected Category": "A.2 Brand Identity Assets",
    "Physical Status": "PRESENT",
    "Actual Path": "fixture_asset_512.webp",
    "MIME Type": "image/webp",
    Width: "512",
    Height: "512",
    "File Size": "4096",
    "SHA-256": "0".repeat(64),
    "Source/Creator": "fixture",
    "Rights Status": "No rights statement supplied",
    "Brand/Curatorial Approval": "Not Approved — no approval record supplied",
    "Intended Usage": "fixture role | Fixture surface",
    "Actual Usage": "Not in use",
    "Derivative Status": "None",
    "Alt Text Status": "Not Recorded",
    Notes: "Test-only row. The delivered register is not written by this file.",
    "Verified By": "registry.test.ts",
    "Verified Date": "2026-11-02",
    ...overrides,
  };
  return AUDIT_COLUMNS.map((column) => {
    const value = cells[column] ?? "";
    return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
  }).join(",");
}

/** A temp root whose `docs/` holds a register with exactly these rows. */
function tempRegisterRoot(rows: readonly string[]): string {
  const root = mkdtempSync(path.join(tmpdir(), "ndm-registry-"));
  fixtureRoots.push(root);
  return writeRegister(root, rows);
}

function writeRegister(root: string, rows: readonly string[]): string {
  const file = path.join(root, ASSET_REGISTER_PATH);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${AUDIT_COLUMNS.join(",")}\n${rows.join("\n")}\n`, "utf8");
  return root;
}

afterEach(() => {
  for (const dir of fixtureRoots.splice(0)) rmSync(dir, { force: true, recursive: true });
});

describe("SR-08: the register cache revalidates against the file", () => {
  it("sees a replaced row on the next read, and rebuilds the surface index with it", () => {
    const root = tempRegisterRoot([
      registerRow({ "Intended Usage": "fixture role | First surface" }),
    ]);
    expect(assetRegister(root).map((asset) => asset.assetId)).toEqual(["NDM-AST-001"]);
    expect(assetsForSurface("First surface", root)).toHaveLength(1);

    writeRegister(root, [
      registerRow({ "Asset ID": "NDM-AST-002", "Intended Usage": "fixture role | Second surface" }),
    ]);

    // Both caches moved together. The surface index used to be a second module variable cleared only by an
    // explicit reset, so a refreshed register could still answer a surface lookup from the old one.
    expect(assetRegister(root).map((asset) => asset.assetId)).toEqual(["NDM-AST-002"]);
    expect(assetById("NDM-AST-001", root)).toBeNull();
    expect(assetsForSurface("First surface", root)).toEqual([]);
    expect(assetsForSurface("Second surface", root).map((a) => a.assetId)).toEqual([
      "NDM-AST-002",
    ]);
  });

  it("reports a rights statement that changed underneath it", () => {
    // The revocation case in the only form the delivered vocabulary can express it: `pending` is a named
    // statement, so writing a different one moves the count the gate reads. Both states deny — the point
    // is that the *record* the gate decides from is the record on disk, now.
    const root = tempRegisterRoot([
      registerRow({ "Rights Status": "Awaiting Rights Review" }),
    ]);
    expect(registerTally(assetRegister(root)).rightsPending).toBe(1);
    expect(registerTally(assetRegister(root)).rightsUnknown).toBe(0);

    writeRegister(root, [
      registerRow({ "Rights Status": "Rights withdrawn by the Owner — no clearance in force" }),
    ]);
    expect(registerTally(assetRegister(root)).rightsPending).toBe(0);
    expect(registerTally(assetRegister(root)).rightsUnknown).toBe(1);
    expect(decidePublicServing(one(assetRegister(root), "the rewritten row")).serve).toBe(false);
  });

  it("throws when the register disappears, rather than serving the rows it remembered", () => {
    const root = tempRegisterRoot([registerRow()]);
    expect(assetRegister(root)).toHaveLength(1);

    rmSync(path.join(root, ASSET_REGISTER_PATH));

    expect(() => assetRegister(root)).toThrow(AssetRegistryError);
    expect(() => assetById("NDM-AST-001", root)).toThrow(AssetRegistryError);
  });

  it("does not remember an absent register either", () => {
    const root = mkdtempSync(path.join(tmpdir(), "ndm-registry-"));
    fixtureRoots.push(root);
    expect(() => assetRegister(root)).toThrow(AssetRegistryError);

    writeRegister(root, [registerRow()]);
    expect(assetRegister(root)).toHaveLength(1);
  });

  it("still reuses the parse while the bytes have not moved", () => {
    // Freshness is bought with a read and a hash, not with a re-parse per request: 55,941 bytes measured
    // on 2 November 2026, hashed on every call, parsed only when the digest changes.
    const rows = [registerRow()];
    const root = tempRegisterRoot(rows);
    const first = assetRegister(root);
    expect(assetRegister(root)).toBe(first);

    writeRegister(root, rows);
    expect(assetRegister(root)).toBe(first);
  });

  it("keeps the two lookups on one version of the file", () => {
    const root = tempRegisterRoot([
      registerRow({ "Asset ID": "NDM-AST-001", Filename: "first_512.webp" }),
      registerRow({ "Asset ID": "NDM-AST-002", Filename: "second_512.webp" }),
    ]);
    expect(assetRegister(root)).toHaveLength(2);

    writeRegister(root, [
      registerRow({ "Asset ID": "NDM-AST-002", Filename: "second_512.webp" }),
    ]);
    expect(assetByFilename("first_512.webp", root)).toBeNull();
    expect(assetById("NDM-AST-002", root)?.filename).toBe("second_512.webp");
  });
});
