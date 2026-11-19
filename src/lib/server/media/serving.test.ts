/**
 * src/lib/server/media/serving.test.ts — the seven checks on `/api/media/<id>`, in both directions.
 *
 * Three modules form the path under test: `derivative-store.ts` reads and shape-checks the lineage record,
 * `slot-facts.ts` owns the cache that holds it, and `serving.ts` runs the seven checks that decide whether a
 * byte reaches a browser. `src/app/api/media/[assetId]/route.test.ts` covers the HTTP answer those same
 * decisions produce.
 *
 * The method is the one `slots.test.ts` and `registry.test.ts` already use, for the same reason: no
 * mocking. `decidePublicServing` re-runs inside the serving service on every request, so a mocked gate
 * would be a test of a program that does not exist. The real register is read, the real evaluator is
 * called, the real `node:fs` reader reads the bytes, and every file a case needs is built in a throwaway
 * directory under the OS temp directory and removed afterwards — the repository is never written to, and
 * `docs/ASSET_INVENTORY_AUDIT.csv` is never edited.
 *
 * Two entry points are covered, and the difference between them is the whole point. `serveDerivative` is
 * the production binding — real register, real gate, real store — and since the Owner's 4 November
 * instrument and the first real build it serves the assets that both pass the gate and have a lineage row,
 * and refuses the rest. `createDerivativeServer` takes the same seven checks with explicit dependencies, and
 * that is how the branches a denied asset can never reach
 * (`no_lineage`, `path_escapes_store`, `too_large`, `size_mismatch`, `file_unreadable`, `digest_mismatch`)
 * and the `served` branch itself
 * are tested: through a **synthetic** record, built by the real evaluator under a vocabulary that exists
 * only in this file, with an id outside the delivered range and cells that say `SYNTHETIC`. Production's
 * `PRODUCTION_RIGHTS_VOCABULARY` is a whitelist that lives in `src/lib/media/asset-record.ts` and nowhere
 * else, so a cell can read as cleared only by quoting a marker a human put in that file in advance — the
 * blocks below pin that, and show the same synthetic cells read as `unknown` under the production policy
 * while the synthetic id answers `unknown_asset` through the production entry point. A synthetic approval is
 * therefore evidence about the *evaluation*, never a permission on the wire.
 *
 * What this file used to assert, and why it does not any more. It was written while every register row was
 * denied, and several cases stated that state as the requirement — "refuses all 82". The requirement is not
 * a number of refusals; §20.4 and A.9 require that a byte reaches a browser only when rights, approval and
 * publication agree. So the cases below name a denied id and a served id by asking the shipped gate, and the
 * fail-closed properties travel with them: order (gate before store), containment, the digest re-check, and
 * "no wording the code has not agreed clears a row". Arming a marker did not weaken any of those, and a test
 * that could not tell "denied" from "gate first" is the reason this file now says so out loud.
 */

import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { decidePublicServing } from "@/domain/rights";
import {
  type AssetRecord,
  AUDIT_COLUMNS,
  approvalFrom,
  PRODUCTION_RIGHTS_VOCABULARY,
  publishedFrom,
  rightsStateFrom,
  type RightsVocabulary,
} from "@/lib/media/asset-record";
import {
  DERIVATIVE_MANIFEST_PATH,
  DERIVATIVE_STORE_DIR,
  type DerivativeLineage,
  type DerivativeManifest,
  DerivativeManifestError,
  derivativeUrl,
  readDerivativeManifest,
  validateManifest,
} from "@/lib/server/media/derivative-store";
import { assetRegister, registryFromText } from "@/lib/server/media/registry";
import * as slotFacts from "@/lib/server/media/slot-facts";
import {
  derivativeManifest,
  lineageFor,
  resetDerivativeManifestCache,
} from "@/lib/server/media/slot-facts";
import {
  createDerivativeServer,
  MAX_SERVED_DERIVATIVE_BYTES,
  PRODUCTION_SERVING_DEPENDENCIES,
  type RefusedDerivative,
  type ServedDerivative,
  type ServingDependencies,
  type ServingOutcome,
  serveDerivative,
  storePathFor,
} from "@/lib/server/media/serving";

const register = assetRegister();
const FIRST_ASSET_ID = "NDM-AST-001";
const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);

/**
 * The delivered register, partitioned by the shipped gate rather than by a number typed into this file.
 *
 * `one()` names the case where a partition is empty, which is a real possibility: a future re-audit could
 * deny every row again, and then the assertions below that need a served id fail loudly instead of silently
 * asserting over an empty list. Nothing here hard-codes a count, because a count is what changes when the
 * Owner signs something; the properties these cases pin do not.
 */
const CLEAR_ASSETS: AssetRecord[] = register.filter(
  (asset) => decidePublicServing(asset).serve,
);
const DENIED_ASSETS: AssetRecord[] = register.filter(
  (asset) => !decidePublicServing(asset).serve,
);
/** A row the gate denies — the subject of every fail-closed case below. */
const DENIED: AssetRecord = one(DENIED_ASSETS, "asset the gate denies");
const DENIED_ID = DENIED.assetId;
/** A row the gate clears *and* the private store carries, so its bytes are reachable. */
const SERVED: AssetRecord = one(
  CLEAR_ASSETS.filter((asset) => lineageFor(asset.assetId) !== null),
  "asset the gate clears and the lineage store carries",
);
const SERVED_ID = SERVED.assetId;
/** The ids the delivered lineage record actually carries. */
const LINEAGE_IDS = new Set(
  (derivativeManifest()?.derivatives ?? []).map((row) => row.assetId),
);

function need(assetId: string): AssetRecord {
  const record = register.find((asset) => asset.assetId === assetId);
  if (record === undefined)
    throw new Error(`${assetId} is not in the register`);
  return record;
}

/**
 * The publication register, read from the file that is its source of truth.
 *
 * `docs/asset-governance/publication-register.json` is generated by `scripts/build-publication-register.mjs`
 * from the surface bindings in `src/lib/media/usage-map.ts` plus the Owner's authorisation file, and the audit
 * writes its `Actual Usage` cell from the same rows. Reading it here is what lets the publication assertions
 * below state the agreement between those two artefacts instead of restating a count.
 */
const PUBLICATION_REGISTER: {
  readonly counts: {
    readonly registerRows: number;
    readonly published: number;
    readonly notPublished: number;
  };
  readonly entries: readonly { readonly assetId: string }[];
} = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      "docs",
      "asset-governance",
      "publication-register.json",
    ),
    "utf8",
  ),
) as {
  readonly counts: {
    readonly registerRows: number;
    readonly published: number;
    readonly notPublished: number;
  };
  readonly entries: readonly { readonly assetId: string }[];
};

/**
 * The delivered originals, read by one test only.
 *
 * `serving.ts` justifies its byte ceiling against the largest file in this directory, so the ceiling test
 * re-measures the directory rather than trusting the comment. It is enumerated, never written, and the
 * serving path itself never opens it — `registry.ts` documents why a record about the library is not a
 * handle into it.
 */
const ASSET_LIBRARY_DIR = path.join(process.cwd(), "Noujoude.photo");

/**
 * The digest shapes a lineage row must not carry. Typed as a mutable tuple array because `it.each`
 * constrains its case type to `any[]`; `as const` would make the rows readonly and the table would stop
 * type-checking.
 */
const malformedDigests: Array<[string, string]> = [
  ["a digest that is too short", "abc123"],
  ["upper-case hex", SHA_A.toUpperCase()],
  ["a non-hex string", "not-a-digest"],
  ["a digest with trailing whitespace", `${SHA_A} `],
];

/** Temp roots a case created, removed in `afterEach` so a red assertion cannot leave litter behind. */
const tempRoots: string[] = [];

function tempRoot(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "ndm-serving-"));
  tempRoots.push(dir);
  return dir;
}

/** A root whose private store holds `lineage.json` with exactly these bytes. */
function rootWithManifest(text: string): string {
  const root = tempRoot();
  mkdirSync(path.join(root, DERIVATIVE_STORE_DIR), { recursive: true });
  writeFileSync(path.join(root, DERIVATIVE_MANIFEST_PATH), text, "utf8");
  return root;
}

/**
 * Replace the manifest a root already has.
 *
 * Separate from `rootWithManifest` because the SR-08 cases are about a record that *changes* under a live
 * cache: one helper makes the root, another rewrites the bytes inside the same root, and the assertion is
 * what the next read answers.
 */
function writeManifestRows(
  root: string,
  rows: readonly DerivativeLineage[],
): void {
  mkdirSync(path.join(root, DERIVATIVE_STORE_DIR), { recursive: true });
  writeFileSync(
    path.join(root, DERIVATIVE_MANIFEST_PATH),
    JSON.stringify(manifestObject(rows)),
    "utf8",
  );
}

function lineageRow(
  overrides: Partial<DerivativeLineage> = {},
): DerivativeLineage {
  return {
    assetId: FIRST_ASSET_ID,
    originalFilename: `${FIRST_ASSET_ID}.png`,
    originalSha256: SHA_B,
    file: `${FIRST_ASSET_ID}.webp`,
    sha256: SHA_A,
    width: 640,
    height: 480,
    bytes: 40_960,
    mime: "image/webp",
    profile: "test-probe",
    ...overrides,
  };
}

function manifestObject(
  rows: readonly DerivativeLineage[],
): DerivativeManifest {
  return {
    derivatives: rows,
    generatedAt: "2026-11-02T00:00:00.000Z",
    originalsUnchanged: true,
    storeDirectory: DERIVATIVE_STORE_DIR,
  };
}

/** A manifest that has passed the shipped validator, for the cases that need a well-formed record. */
function manifestWith(rows: readonly DerivativeLineage[]): DerivativeManifest {
  return validateManifest(manifestObject(rows), "fixture");
}

/**
 * A manifest *shape* with rows or fields the validator has not seen, for the negative cases.
 *
 * `manifestObject` takes typed rows on purpose, so a case that feeds the validator garbage has to say so
 * in its own types rather than cast its way past the compiler: `unknown[]` here is the hole in the record
 * the case is about, and the same helper carries a bad field override without an `as`.
 */
function rawManifest(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    derivatives: [],
    generatedAt: "2026-11-02T00:00:00.000Z",
    originalsUnchanged: true,
    storeDirectory: DERIVATIVE_STORE_DIR,
    ...overrides,
  };
}

/**
 * The synthetic asset, and the vocabulary that clears it.
 *
 * Three rules keep this fixture what it claims to be. The id is outside the delivered range, so it can
 * never be mistaken for one of the 82 and the production register answers `unknown_asset` for it — which
 * is asserted below, not assumed. Every cell that a human or a gate would read says `SYNTHETIC`. And the
 * vocabulary is a value in this file: `PRODUCTION_RIGHTS_VOCABULARY` keeps its empty whitelists, so the
 * same wording read through the production policy stays `unknown`, and no synthetic approval can reach
 * the registry, the slot layer or the HTTP path.
 */
const SYNTHETIC_ID = "NDM-SYNTH-TEST-001";
const SYNTHETIC_VOCABULARY: RightsVocabulary = {
  clearedMarkers: [
    "SYNTHETIC-CLEARED — vocabulary that exists only in this file",
  ],
  grantedApprovalMarkers: [
    "SYNTHETIC-APPROVED — vocabulary that exists only in this file",
  ],
  pendingStatements: ["Awaiting Rights Review"],
  publishedMarkers: [
    "SYNTHETIC-PUBLISHED — vocabulary that exists only in this file",
  ],
};

/** The bytes a fixture derivative is made of, and the digest the lineage record will claim for them. */
const SYNTHETIC_BYTES = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50,
]);
const SYNTHETIC_DIGEST = createHash("sha256")
  .update(SYNTHETIC_BYTES)
  .digest("hex");

/**
 * One register cell, quoted the way `scripts/lib/csv.mjs` reads it back. Fixture wording carries commas
 * ("SYNTHETIC — fixture, not a delivered asset"), and a bare comma would become a 21st column and the
 * parser would refuse the row — which is the right behaviour for the real file and a nuisance here.
 */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function syntheticCells(overrides: Record<string, string> = {}): string {
  const cells: Record<string, string> = {
    "Asset ID": SYNTHETIC_ID,
    Filename: "synthetic-cleared-asset.webp",
    "Expected Category": "A.2 Brand Identity Assets",
    "Physical Status": "PRESENT",
    "Actual Path": "synthetic-cleared-asset.webp",
    "MIME Type": "image/webp",
    Width: "640",
    Height: "480",
    "File Size": String(SYNTHETIC_BYTES.length),
    "SHA-256": SHA_B,
    "Source/Creator": "SYNTHETIC — fixture, not a delivered asset",
    "Rights Status":
      "SYNTHETIC-CLEARED — vocabulary that exists only in this file",
    "Brand/Curatorial Approval":
      "SYNTHETIC-APPROVED — vocabulary that exists only in this file",
    "Intended Usage": "Fixture role | Header",
    "Actual Usage":
      "SYNTHETIC-PUBLISHED — vocabulary that exists only in this file",
    "Derivative Status": "Derived — fixture",
    "Alt Text Status": "Recorded — fixture",
    Notes:
      "Test-only row. The delivered register and the production vocabulary are not touched by it.",
    "Verified By": "serving.test.ts",
    "Verified Date": "2026-11-02",
    ...overrides,
  };
  return AUDIT_COLUMNS.map((column) => csvCell(cells[column] ?? "")).join(",");
}

/** A register row read through the real evaluator with the test-only vocabulary armed. */
function syntheticAsset(overrides: Record<string, string> = {}): AssetRecord {
  const [record] = registryFromText(
    `${AUDIT_COLUMNS.join(",")}\n${syntheticCells(overrides)}\n`,
    undefined,
    SYNTHETIC_VOCABULARY,
  );
  if (record === undefined)
    throw new Error("the synthetic register row produced no record");
  return record;
}

/** A lineage record for the synthetic asset, unvalidated on purpose where a case needs an invalid shape. */
function syntheticLineage(
  overrides: Partial<DerivativeLineage> = {},
): DerivativeManifest {
  return {
    derivatives: [
      {
        assetId: SYNTHETIC_ID,
        bytes: SYNTHETIC_BYTES.length,
        file: "synthetic-cleared-asset.webp",
        height: 480,
        mime: "image/webp",
        originalFilename: "synthetic-original.png",
        originalSha256: SHA_B,
        profile: "test-fixture",
        sha256: SYNTHETIC_DIGEST,
        width: 640,
        ...overrides,
      },
    ],
    generatedAt: "2026-11-02T00:00:00.000Z",
    originalsUnchanged: true,
    storeDirectory: DERIVATIVE_STORE_DIR,
  };
}

/** The synthetic asset's lineage row, for the cases that write the record to disk and need it to validate. */
function syntheticRow(
  overrides: Partial<DerivativeLineage> = {},
): DerivativeLineage {
  const [row] = syntheticLineage(overrides).derivatives;
  if (row === undefined)
    throw new Error("the synthetic lineage produced no row");
  return row;
}

/** The shipped seven checks, bound to a synthetic record, a fixed manifest and a temp store. */
function syntheticServer(options: {
  readonly manifest: DerivativeManifest | null;
  readonly storeDir: string;
  readonly record?: AssetRecord;
}): (assetId: string) => Promise<ServingOutcome> {
  const record = options.record ?? syntheticAsset();
  return createDerivativeServer({
    ...PRODUCTION_SERVING_DEPENDENCIES,
    // The production evaluator, named so a reader can see the gate is not being stubbed here.
    evaluateServing: decidePublicServing,
    findAsset: (assetId) => (assetId === record.assetId ? record : null),
    readLineageManifest: () => options.manifest,
    storeDirectory: () => options.storeDir,
  });
}

/** A store directory holding one derivative file with exactly these bytes. */
function storeWithFile(
  bytes: Uint8Array,
  name = "synthetic-cleared-asset.webp",
): string {
  const store = path.join(tempRoot(), DERIVATIVE_STORE_DIR);
  mkdirSync(store, { recursive: true });
  writeFileSync(path.join(store, name), bytes);
  return store;
}

function served(outcome: ServingOutcome): ServedDerivative {
  if (outcome.kind !== "served") {
    // The refusal's own reason, so a red run says which of the seven checks answered rather than leaving the
    // reader to guess between `no_lineage` and `digest_mismatch`.
    throw new Error(
      `expected served bytes, got ${outcome.reason}${outcome.detail === null ? "" : ` (${outcome.detail})`}`,
    );
  }
  return outcome;
}

/**
 * The house helper: an indexed read under `noUncheckedIndexedAccess` is `T | undefined`, and a test that
 * carried on regardless would assert nothing. Naming the miss makes emptiness a failure.
 */
function one<T>(items: readonly T[], what: string): T {
  const [first] = items;
  if (first === undefined) throw new Error(`expected one ${what}, found none`);
  return first;
}

/** A refusal, or a failure that says which asset came back with bytes instead. */
async function refusal(
  assetId: string,
  root?: string,
): Promise<RefusedDerivative> {
  const outcome = await serveDerivative(assetId, root);
  if (outcome.kind !== "refused")
    throw new Error(`expected ${assetId} to be refused; it was served`);
  return outcome;
}

afterEach(() => {
  resetDerivativeManifestCache();
  for (const dir of tempRoots.splice(0))
    rmSync(dir, { force: true, recursive: true });
});

describe("a missing lineage record is a state, not a crash", () => {
  it("reads null when the store has never been built", () => {
    expect(readDerivativeManifest(tempRoot())).toBeNull();
  });

  it("reads null when the store directory exists but holds no manifest", () => {
    const root = tempRoot();
    mkdirSync(path.join(root, DERIVATIVE_STORE_DIR), { recursive: true });
    expect(readDerivativeManifest(root)).toBeNull();
  });

  it("reads the delivered store through the direct path and the cache, and joins every row to the register", () => {
    // Measured 4 November 2026: `scripts/build-media-derivatives.mjs` has run against the Owner's authorised
    // set, so the absence branch above is now proven only on a temp root — which is what it always was for.
    // What is asserted about the delivered tree is not "it is empty" but the two properties that make an
    // empty or a forged record impossible to confuse with a real one: the file parses through the shipped
    // validator on both read paths, and every row names an asset the register actually carries.
    const direct = readDerivativeManifest();
    const cached = derivativeManifest();
    expect(direct).not.toBeNull();
    expect(cached).toEqual(direct);
    const ids = new Set(register.map((asset) => asset.assetId));
    for (const row of cached?.derivatives ?? []) {
      expect(ids.has(row.assetId)).toBe(true);
      expect(row.originalSha256).toBe(need(row.assetId).checksum);
    }
    // Absence is still the answer for an id the record does not carry — the shape a page must render.
    expect(lineageFor("NDM-AST-999")).toBeNull();
  });

  it("answers gate_denied for a denied id before the absent store is ever consulted", async () => {
    // The order is the point, not the emptiness: with the store missing, a row the gate denies is refused by
    // the gate, and `no_lineage` — the answer the store would give — never appears.
    const outcome = await refusal(DENIED_ID, tempRoot());
    expect(outcome).toEqual({
      assetId: DENIED_ID,
      detail: decidePublicServing(DENIED).denial,
      kind: "refused",
      reason: "gate_denied",
    });
    expect(outcome.reason).not.toBe("no_lineage");
  });
});

describe("an unreadable or malformed manifest fails closed", () => {
  it("throws rather than serving from a lineage record it cannot parse", () => {
    const root = rootWithManifest("{ not json");
    expect(() => readDerivativeManifest(root)).toThrow(DerivativeManifestError);
    expect(() => readDerivativeManifest(root)).toThrow(/is not valid JSON/);
  });

  it("names the manifest path in the failure, so an operator can find the file", () => {
    // An empty file is a corrupt record, not an absent one: `JSON.parse("")` throws. The distinction is
    // what an operator reads when a slot refuses to build a URL for no visible reason. The path is matched
    // as a substring because `DERIVATIVE_MANIFEST_PATH` is built with `path.join`, so on Windows it
    // carries a back separator and a hand-written pattern would test the separator, not the message.
    const root = rootWithManifest("");
    expect(() => readDerivativeManifest(root)).toThrow(DerivativeManifestError);
    expect(() => readDerivativeManifest(root)).toThrow("is not valid JSON");
    expect(() => readDerivativeManifest(root)).toThrow(
      DERIVATIVE_MANIFEST_PATH,
    );
  });

  it("rejects a manifest that is not an object", () => {
    expect(() => validateManifest("lineage", "fixture")).toThrow(
      /manifest is not an object/,
    );
    expect(() => validateManifest(null, "fixture")).toThrow(
      /manifest is not an object/,
    );
    expect(() => validateManifest(undefined, "fixture")).toThrow(
      /manifest is not an object/,
    );
    expect(() => validateManifest(42, "fixture")).toThrow(
      /manifest is not an object/,
    );
  });

  it("refuses an array-shaped manifest, which is not a lineage record", () => {
    // The requirement: a file that does not describe a derivative store cannot be read as one. Measured on
    // 2 Nov 2026, `isRecord` is a `typeof === "object"` test and an array satisfies it, so `[]` is refused
    // at the required-field checks rather than at the shape check. The refusal is the guarantee; the guard
    // that delivers it is recorded here as an observation, and a future edit to `isRecord` cannot turn this
    // case green by asserting a sentence instead of a property.
    expect(() => validateManifest([], "fixture")).toThrow(
      DerivativeManifestError,
    );
    expect(() => validateManifest([lineageRow()], "fixture")).toThrow(
      DerivativeManifestError,
    );
    // The same property read from disk: an array in `lineage.json` is a corrupt record, not an empty store.
    expect(() => readDerivativeManifest(rootWithManifest("[]"))).toThrow(
      DerivativeManifestError,
    );
  });

  it("rejects a manifest whose generatedAt or storeDirectory is missing or empty", () => {
    expect(() =>
      validateManifest(rawManifest({ generatedAt: "" }), "fixture"),
    ).toThrow(/"generatedAt" is not a non-empty string/);
    expect(() =>
      validateManifest(rawManifest({ storeDirectory: 42 }), "fixture"),
    ).toThrow(/"storeDirectory" is not a non-empty string/);
  });

  it("rejects an originalsUnchanged that is not a boolean", () => {
    // The build writes this only after hashing every original before and after the run. A truthy string
    // would let a run that rewrote the library claim that it did not.
    expect(() =>
      validateManifest(rawManifest({ originalsUnchanged: "true" }), "fixture"),
    ).toThrow(/"originalsUnchanged" is not a boolean/);
  });

  it("rejects a derivatives field that is not an array, and a row that is not an object", () => {
    expect(() =>
      validateManifest(
        rawManifest({ derivatives: { 0: lineageRow() } }),
        "fixture",
      ),
    ).toThrow(/"derivatives" is not an array/);
    expect(() =>
      validateManifest(
        rawManifest({ derivatives: ["a row that is not an object"] }),
        "fixture",
      ),
    ).toThrow(/not an object/);
  });

  it.each([
    ["parent traversal", "../outside.webp"],
    ["nested traversal that normalises out", "nested/../outside.webp"],
    ["absolute POSIX path", "/etc/passwd"],
    ["absolute Windows path", "C:/Windows/win.ini"],
  ])("rejects a lineage file that is %s", (_label, file) => {
    expect(() => manifestWith([lineageRow({ file })])).toThrow(
      /"file" is .*, which would resolve outside/,
    );
  });

  it.each(malformedDigests)(
    "refuses a derivative sha256 that is %s",
    (_label, sha256) => {
      // The requirement is the digest's form: lineage is verified by hashing the file and comparing, which is
      // only possible against a lowercase 64-hex SHA-256. The guard's sentence states that requirement, so it
      // is the expectation — not a message the implementation happens to print.
      expect(() => manifestWith([lineageRow({ sha256 })])).toThrow(
        DerivativeManifestError,
      );
      expect(() => manifestWith([lineageRow({ sha256 })])).toThrow(
        /"sha256" is not a lowercase SHA-256 hex digest/,
      );
    },
  );

  it("refuses a row that carries no derivative digest at all", () => {
    // The requirement is only that an empty cell cannot become a served derivative. Which guard answers it
    // — the required-string check or the hex check — is the validator's own ordering, so the refusal is
    // what is asserted here and the ordering is left unasserted rather than frozen into a message.
    expect(() => manifestWith([lineageRow({ sha256: "" })])).toThrow(
      DerivativeManifestError,
    );
    expect(() => manifestWith([lineageRow({ originalSha256: "" })])).toThrow(
      DerivativeManifestError,
    );
  });

  it("rejects an originalSha256 that cannot join the register", () => {
    // The original's digest is the only link between a derivative and the row that authorised it. Without
    // the hex shape, RB-05's unrecoverable lineage could be recorded and then read back as provenance.
    expect(() =>
      manifestWith([lineageRow({ originalSha256: "unknown" })]),
    ).toThrow(
      /"originalSha256" is not a lowercase SHA-256 hex digest, so the lineage does not join the register/,
    );
  });

  const badNumbers: Array<[string, Partial<DerivativeLineage>]> = [
    ["width zero", { width: 0 }],
    ["width negative", { width: -1 }],
    ["width fractional", { width: 1.5 }],
    ["height zero", { height: 0 }],
    ["bytes negative", { bytes: -40_960 }],
  ];
  it.each(badNumbers)(
    "rejects a non-positive-integer %s",
    (_label, override) => {
      expect(() => manifestWith([lineageRow(override)])).toThrow(
        /is not a positive integer$/,
      );
    },
  );

  it("rejects a missing required string on a row", () => {
    expect(() => manifestWith([lineageRow({ assetId: "" })])).toThrow(
      /"assetId" is not a non-empty string/,
    );
    expect(() => manifestWith([lineageRow({ profile: "" })])).toThrow(
      /"profile" is not a non-empty string/,
    );
  });

  it("rejects a duplicate asset id, because two rows would make the bytes ambiguous", () => {
    expect(() =>
      manifestWith([lineageRow(), lineageRow({ sha256: SHA_B })]),
    ).toThrow(/one asset id appears twice/);
  });

  it("accepts a well-formed manifest and keeps every field the route needs", () => {
    const row = lineageRow();
    const manifest = manifestWith([row]);
    expect(one(manifest.derivatives, "derivative row")).toEqual(row);
    expect(manifest.storeDirectory).toBe(DERIVATIVE_STORE_DIR);
    expect(manifest.originalsUnchanged).toBe(true);
  });

  it("round-trips a manifest written to disk in the store shape", () => {
    const row = lineageRow();
    const read = readDerivativeManifest(
      rootWithManifest(JSON.stringify(manifestObject([row]))),
    );
    expect(read).not.toBeNull();
    expect(read?.derivatives).toEqual([row]);
  });
});

describe("the manifest cache, and the seam that used to bypass validation", () => {
  it("has no exported injection setter left to bypass the validator", () => {
    // Risk **SR-10**: `setDerivativeManifest` published a record straight into the process, around
    // `validateManifest` — the check that rejects a `file` climbing out of the store, a malformed digest
    // and a duplicated asset id. Nothing in production ever called it, so its removal costs no behaviour
    // and closes the door. This assertion is the regression guard: if the seam comes back, this fails.
    expect(
      Object.keys(slotFacts).sort(),
      "slot-facts must export readers and a cache drop, and nothing that writes a record in",
    ).toEqual([
      "altTextFor",
      "derivativeManifest",
      "lineageFor",
      "resetDerivativeManifestCache",
      "servedSrcFor",
      "slotInputFor",
    ]);
    expect(
      "setDerivativeManifest" in
        (slotFacts as unknown as Record<string, unknown>),
    ).toBe(false);
  });

  it("reads the record from the store it is pointed at", () => {
    const root = rootWithManifest(
      JSON.stringify(manifestObject([lineageRow()])),
    );
    const manifest = derivativeManifest(root);
    expect(manifest?.derivatives).toEqual([lineageRow()]);
    // The same source `PRODUCTION_SERVING_DEPENDENCIES.readLineageManifest` reads, and the row the slot
    // layer resolves through it.
    expect(lineageFor(FIRST_ASSET_ID, root)).toEqual(lineageRow());
  });

  it("answers null for a store that has never been built, which is the absence a page must render", () => {
    const root = tempRoot();
    expect(derivativeManifest(root)).toBeNull();
    expect(lineageFor(FIRST_ASSET_ID, root)).toBeNull();
  });

  it("re-reads on demand and caches between reads", () => {
    const root = rootWithManifest(
      JSON.stringify(manifestObject([lineageRow()])),
    );
    const first = derivativeManifest(root);
    expect(derivativeManifest(root)).toBe(first);
    resetDerivativeManifestCache();
    const again = derivativeManifest(root);
    expect(again).not.toBe(first);
    expect(again).toEqual(first);
  });

  it("rejects a record on disk that never passed the validator, instead of serving its shape", () => {
    // The positive form of the removal above: a lineage row whose `file` escapes the store cannot reach the
    // serving checks at all, because the only door left is the file and the file is validated on read.
    const root = tempRoot();
    mkdirSync(path.join(root, DERIVATIVE_STORE_DIR), { recursive: true });
    writeFileSync(
      path.join(root, DERIVATIVE_MANIFEST_PATH),
      JSON.stringify(
        rawManifest({
          derivatives: [{ ...lineageRow(), file: "../../../../.env" }],
        }),
      ),
      "utf8",
    );
    expect(() => derivativeManifest(root)).toThrow(DerivativeManifestError);
    expect(() => readDerivativeManifest(root)).toThrow(DerivativeManifestError);
  });

  it("finds a lineage row by asset id and reports absence for ids the record does not carry", () => {
    const root = rootWithManifest(
      JSON.stringify(
        manifestObject([
          lineageRow(),
          lineageRow({ assetId: "NDM-AST-002", file: "NDM-AST-002.webp" }),
        ]),
      ),
    );
    expect(lineageFor("NDM-AST-002", root)?.file).toBe("NDM-AST-002.webp");
    expect(lineageFor("NDM-AST-003", root)).toBeNull();
  });

  it("builds the serving URL from the lineage id and percent-encodes anything that is not an id", () => {
    expect(derivativeUrl(FIRST_ASSET_ID)).toBe(`/api/media/${FIRST_ASSET_ID}`);
    expect(derivativeUrl("a b/c")).toBe("/api/media/a%20b%2Fc");
  });
});

/**
 * SR-08 — the lineage record is revalidated on every read.
 *
 * These five cases are the regression guard for one defect: the cache used to answer "have I read this
 * file yet?" and, once it had, nothing short of a process restart could change the answer. That made the
 * cache a participant in the trust decision, because `serving.ts` check 3 asks the cache — not the disk —
 * whether a derivative has lineage. A withdrawn or replaced lineage row stayed authoritative for the whole
 * lifetime of the server, which is the failure mode ASVS V3.5 and AC-4 both describe as a revocation that
 * is not effective.
 *
 * The fix keys the cache on the SHA-256 of the manifest bytes, so these cases are all written against the
 * file rather than against the setter: rewrite the bytes, call again, and require the new content. Absence
 * is tested in both directions because "not built yet" and "the record was removed" arrived at the same
 * answer before, and only one of them should.
 */
describe("SR-08: the lineage cache revalidates against the file", () => {
  it("sees a rewritten digest and filename on the next read, with no reset", () => {
    const root = rootWithManifest(
      JSON.stringify(manifestObject([lineageRow()])),
    );
    expect(
      derivativeManifest(root)?.derivatives.map((row) => row.sha256),
    ).toEqual([SHA_A]);

    writeManifestRows(root, [
      lineageRow({ file: "replaced.webp", sha256: SHA_B }),
    ]);

    const refreshed = derivativeManifest(root);
    if (refreshed === null)
      throw new Error("the rewritten manifest read back as absent");
    const row = one(refreshed.derivatives, "the rewritten lineage row");
    expect(row.sha256).toBe(SHA_B);
    expect(row.file).toBe("replaced.webp");
    expect(lineageFor(FIRST_ASSET_ID, root)?.file).toBe("replaced.webp");
  });

  it("sees a record that appears after the store was read as absent", () => {
    const root = tempRoot();
    expect(derivativeManifest(root)).toBeNull();
    writeManifestRows(root, [lineageRow()]);
    expect(derivativeManifest(root)?.derivatives).toHaveLength(1);
  });

  it("sees a record that is withdrawn, which is the direction a cache must never get wrong", () => {
    const root = rootWithManifest(
      JSON.stringify(manifestObject([lineageRow()])),
    );
    expect(derivativeManifest(root)).not.toBeNull();

    rmSync(path.join(root, DERIVATIVE_MANIFEST_PATH));

    expect(derivativeManifest(root)).toBeNull();
    expect(lineageFor(FIRST_ASSET_ID, root)).toBeNull();
  });

  it("throws on corrupt bytes instead of answering from the copy it parsed last", () => {
    const root = rootWithManifest(
      JSON.stringify(manifestObject([lineageRow()])),
    );
    expect(derivativeManifest(root)).not.toBeNull();

    writeFileSync(
      path.join(root, DERIVATIVE_MANIFEST_PATH),
      "{ not json",
      "utf8",
    );

    expect(() => derivativeManifest(root)).toThrow(DerivativeManifestError);
  });

  it("still reuses the parse while the bytes have not moved", () => {
    // The point of the digest is freshness without throwing away the cache: same bytes must give the same
    // object, or the fix would have bought revocation speed by re-parsing on every request for nothing.
    const root = rootWithManifest(
      JSON.stringify(manifestObject([lineageRow()])),
    );
    const first = derivativeManifest(root);
    expect(derivativeManifest(root)).toBe(first);
    writeManifestRows(root, [lineageRow()]);
    expect(derivativeManifest(root)).toBe(first);
  });

  it("refuses on the next request once the record on disk claims a different digest", async () => {
    // The end-to-end form of the same property, because check 3 and check 6 both read through this cache:
    // a derivative whose lineage row is replaced underneath a running server must stop being served on the
    // request after the write, not after the restart. Same bytes on disk, new claimed digest in the record.
    const root = tempRoot();
    const storeDir = path.join(root, DERIVATIVE_STORE_DIR);
    mkdirSync(storeDir, { recursive: true });
    writeFileSync(
      path.join(storeDir, "synthetic-cleared-asset.webp"),
      SYNTHETIC_BYTES,
    );
    writeManifestRows(root, [syntheticRow()]);
    const serve = createDerivativeServer({
      ...PRODUCTION_SERVING_DEPENDENCIES,
      evaluateServing: decidePublicServing,
      findAsset: (assetId) =>
        assetId === SYNTHETIC_ID ? syntheticAsset() : null,
      readLineageManifest: () => derivativeManifest(root),
      storeDirectory: () => storeDir,
    });

    expect(served(await serve(SYNTHETIC_ID)).etag).toBe(SYNTHETIC_DIGEST);

    writeManifestRows(root, [syntheticRow({ sha256: SHA_B })]);
    expect(await serve(SYNTHETIC_ID)).toMatchObject({
      kind: "refused",
      reason: "digest_mismatch",
    });
  });
});

describe("serveDerivative refuses an id the register does not carry", () => {
  it.each([
    ["an id one past the last row", "NDM-AST-083"],
    ["an empty string", ""],
    ["whitespace only", "   "],
    ["a traversal-shaped id", "../../.env"],
    ["a register id with a suffix", `${FIRST_ASSET_ID}-copy`],
    ["a lowercase register id", FIRST_ASSET_ID.toLowerCase()],
  ])(
    "answers unknown_asset for %s, before any rights decision or file read",
    async (_label, id) => {
      const outcome: ServingOutcome = await serveDerivative(id, tempRoot());
      expect(outcome).toEqual({
        assetId: id,
        detail: null,
        kind: "refused",
        reason: "unknown_asset",
      });
    },
  );

  it("does not reach the store for an unknown id even when a lineage row exists for another asset", async () => {
    // The record is on disk and valid, and the register still answers first: check 1 costs no file open.
    const root = rootWithManifest(
      JSON.stringify(manifestObject([lineageRow()])),
    );
    expect(await refusal("NDM-AST-083", root)).toMatchObject({
      reason: "unknown_asset",
    });
    // Precondition, so the assertion above is about order and not about an empty fixture: the lineage row
    // really is readable from this root, for the id it names.
    expect(lineageFor(FIRST_ASSET_ID, root)?.assetId).toBe(FIRST_ASSET_ID);
  });
});

describe("serveDerivative is fail-closed for every asset the gate denies", () => {
  it("answers every catalogued asset with bytes or a refusal, and the bytes are exactly gate ∩ lineage", async () => {
    const outcomes = new Map<string, ServingOutcome>();
    for (const asset of register)
      outcomes.set(asset.assetId, await serveDerivative(asset.assetId));
    expect(outcomes.size).toBe(register.length);

    const served = [...outcomes.values()]
      .filter((outcome) => outcome.kind === "served")
      .map((outcome) => outcome.assetId);
    // The rule, stated as a rule: a byte reaches this binding only when the gate clears the row *and* the
    // private store carries a lineage record for it. Neither half alone is enough, and the set is their
    // intersection whatever each half happens to be today.
    expect([...served].sort()).toEqual(
      [...LINEAGE_IDS]
        .filter((id) => decidePublicServing(need(id)).serve)
        .sort(),
    );
    for (const assetId of served) expect(LINEAGE_IDS.has(assetId)).toBe(true);
    // And nothing refused can have been refused for a byte-level reason: a denial is the gate's answer, an
    // asset the gate clears but the build skipped is `no_lineage`, and `digest_mismatch` / `path_escapes_store`
    // / `file_unreadable` are unreachable from the delivered register through this entry point.
    for (const [assetId, outcome] of outcomes) {
      if (outcome.kind === "served") continue;
      expect(["gate_denied", "no_lineage"]).toContain(outcome.reason);
      expect(outcome.reason === "no_lineage").toBe(
        decidePublicServing(need(assetId)).serve,
      );
    }
  });

  it("refuses every gate-denied asset with gate_denied and the gate's own denial as the detail", async () => {
    const details = new Set<string | null>();
    for (const asset of DENIED_ASSETS) {
      const outcome = await refusal(asset.assetId);
      details.add(outcome.detail);
      expect(outcome.reason).toBe("gate_denied");
      // The reason the route keeps off the wire must be the gate's reason, so the operator-facing audit
      // trail and the decision rule cannot drift apart.
      expect(outcome.detail).toBe(decidePublicServing(asset).denial);
    }
    // Measured 4 November 2026: every row the gate denies is denied for want of a publication record, because
    // the Owner's instrument cleared rights and approval for the files it names and the publication register
    // binds the rest. `rights_not_cleared` is the denial for a row the declaration does not reach at all, and
    // asserting it here would pin yesterday's measurement instead of the rule.
    expect([...details]).toEqual(["not_published"]);
  });

  it("consults the gate before the store, so a lineage row cannot open the gate", async () => {
    const root = rootWithManifest(
      JSON.stringify(
        manifestObject([
          lineageRow({ assetId: DENIED_ID, file: `${DENIED_ID}.webp` }),
        ]),
      ),
    );
    expect(await refusal(DENIED_ID, root)).toMatchObject({
      detail: decidePublicServing(DENIED).denial,
      reason: "gate_denied",
    });
    // Precondition: the record is readable and names this very asset, so the refusal is check 2 answering
    // and not an empty fixture.
    expect(lineageFor(DENIED_ID, root)?.assetId).toBe(DENIED_ID);
  });

  it("refuses with gate_denied before reading a lineage record that would escape the store", async () => {
    // Check 2 runs first, which is why an escaping `file` never becomes the reported reason through the
    // production binding — and why the containment rule is asserted separately, on a path that has already
    // passed the gate. The record here is not validated on read: the read never happens, because the gate
    // denied it. Asserting both halves is what makes this case about order rather than about luck.
    const escapingRoot = rootWithManifest(
      JSON.stringify(
        rawManifest({
          derivatives: [
            {
              ...lineageRow({ assetId: DENIED_ID }),
              file: "../../../../.env",
            },
          ],
        }),
      ),
    );
    expect(await refusal(DENIED_ID, escapingRoot)).toMatchObject({
      reason: "gate_denied",
    });
    expect(() => derivativeManifest(escapingRoot)).toThrow(
      DerivativeManifestError,
    );
  });

  it("refuses with gate_denied whatever the private store holds, because the gate runs first", async () => {
    // The input that would reach checks 3 to 7, built as honestly as a test can build it: a real file in a
    // real store directory, whose bytes hash to exactly what the record on disk claims. Through the
    // production binding each of these is refused for the same reason as an absent manifest and a swapped
    // file, because check 2 runs before the store is opened. That is the measured statement behind this
    // file's header: no store contents can turn a gate denial into bytes, and the branches below are reached
    // only by giving the same seven checks an asset the gate has already cleared.
    const body = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50,
    ]);
    const recordedDigest = createHash("sha256").update(body).digest("hex");
    const row = lineageRow({
      assetId: DENIED_ID,
      bytes: body.length,
      file: `${DENIED_ID}.webp`,
      sha256: recordedDigest,
    });

    const bareRoot = tempRoot();
    mkdirSync(path.join(bareRoot, DERIVATIVE_STORE_DIR), { recursive: true });

    const goodRoot = rootWithManifest(JSON.stringify(manifestObject([row])));
    writeFileSync(path.join(goodRoot, DERIVATIVE_STORE_DIR, row.file), body);

    const swappedRoot = rootWithManifest(JSON.stringify(manifestObject([row])));
    writeFileSync(
      path.join(swappedRoot, DERIVATIVE_STORE_DIR, row.file),
      new Uint8Array([0x00]),
    );

    const outcomes = await Promise.all([
      serveDerivative(DENIED_ID, bareRoot),
      serveDerivative(DENIED_ID, goodRoot),
      serveDerivative(DENIED_ID, swappedRoot),
    ]);
    for (const outcome of outcomes) {
      expect(outcome).toEqual({
        assetId: DENIED_ID,
        detail: decidePublicServing(DENIED).denial,
        kind: "refused",
        reason: "gate_denied",
      });
    }
    // The bytes in the good store really are the authorised ones, so the refusal above is the gate and not
    // a corrupt file: read directly, they hash to the recorded digest.
    expect(
      createHash("sha256")
        .update(
          readFileSync(path.join(goodRoot, DERIVATIVE_STORE_DIR, row.file)),
        )
        .digest("hex"),
    ).toBe(recordedDigest);
  });

  it("serves a cleared asset from the delivered store only after re-checking the bytes it reads", async () => {
    // The other direction, on the shipped binding and the real file — not the synthetic one. `served` is not
    // proof of anything until the bytes on disk are the bytes the lineage record signed, because a store that
    // can be edited out from under the register is the failure this check exists for.
    const body = served(await serveDerivative(SERVED_ID));
    const row = one(
      derivativeManifest()?.derivatives.filter(
        (candidate) => candidate.assetId === SERVED_ID,
      ) ?? [],
      "lineage row for the served asset",
    );
    expect(body.mime).toBe(row.mime);
    expect(body.etag).toBe(row.sha256);
    expect(body.originalSha256).toBe(need(SERVED_ID).checksum);
    expect(createHash("sha256").update(body.body).digest("hex")).toBe(
      row.sha256,
    );
    const delivered = path.join(process.cwd(), DERIVATIVE_STORE_DIR, row.file);
    expect(body.body.byteLength).toBe(row.bytes);
    // The bytes the binding returned and the bytes the store holds are the same bytes: same length, same
    // digest. Comparing the digests rather than 50,000 numbers is the same statement, cheaper.
    expect(
      createHash("sha256").update(readFileSync(delivered)).digest("hex"),
    ).toBe(row.sha256);

    // Swap the file behind the record and the same request refuses. The substitute is the *same length* as
    // the recorded one on purpose: a shorter file is refused by the size probe, which is a different check,
    // and this case is about the digest.
    const mirror = rootWithManifest(JSON.stringify(manifestObject([row])));
    const target = path.join(mirror, DERIVATIVE_STORE_DIR, row.file);
    const substitute = Buffer.from(readFileSync(delivered));
    substitute[0] = (substitute[0] ?? 0) ^ 0xff;
    writeFileSync(target, substitute);
    expect(statSync(target).size).toBe(row.bytes);
    const swapped = await serveDerivative(SERVED_ID, mirror);
    expect(swapped).toEqual({
      assetId: SERVED_ID,
      detail: null,
      kind: "refused",
      reason: "digest_mismatch",
    });
  });

  it("carries refusal reasons only in the returned outcome, never as fields a handler could echo", async () => {
    const outcome = await refusal(DENIED_ID, tempRoot());
    expect(Object.keys(outcome).sort()).toEqual([
      "assetId",
      "detail",
      "kind",
      "reason",
    ]);
    expect(outcome).not.toHaveProperty("body");
    expect(outcome).not.toHaveProperty("etag");
    expect(outcome).not.toHaveProperty("mime");
  });
});

describe("the six refusal branches a denied asset can never reach", () => {
  // Same shipped `createDerivativeServer`, same seven checks, same `node:fs` reader — only the record and
  // the store are a fixture. That is what makes these results evidence about the production code path
  // rather than about a stand-in.
  it("answers no_lineage when an approved asset has no derivative recorded", async () => {
    const serve = syntheticServer({
      manifest: null,
      storeDir: storeWithFile(SYNTHETIC_BYTES),
    });
    expect(await serve(SYNTHETIC_ID)).toEqual({
      assetId: SYNTHETIC_ID,
      detail: null,
      kind: "refused",
      reason: "no_lineage",
    });
  });

  it("answers no_lineage when the lineage record describes a different asset", async () => {
    const serve = syntheticServer({
      manifest: syntheticLineage({ assetId: "NDM-SYNTH-TEST-999" }),
      storeDir: storeWithFile(SYNTHETIC_BYTES),
    });
    const outcome = await serve(SYNTHETIC_ID);
    expect(outcome.kind === "refused" ? outcome.reason : outcome.kind).toBe(
      "no_lineage",
    );
  });

  it("answers path_escapes_store for a row whose file leaves the private store", async () => {
    // `validateManifest` rejects a `..` in the text, so this fixture is assembled as a plain object: the
    // point is the second containment gate, the one that reads the filesystem, which has to hold even when
    // a lineage record was built by hand instead of by the pipeline.
    const escaping = syntheticLineage({
      file: "../../../synthetic-escape.webp",
    });
    const store = storeWithFile(SYNTHETIC_BYTES);
    const serve = syntheticServer({ manifest: escaping, storeDir: store });
    expect(await serve(SYNTHETIC_ID)).toMatchObject({
      kind: "refused",
      reason: "path_escapes_store",
    });
  });

  it("serves a normalised path that stays inside the store", async () => {
    // The counterpart, so the containment rule is not "any `..` is refused": `deep/../file` resolves to a
    // file that really is in the store — the subdirectory need not exist for the resolution to land — and
    // the digest check is what decides it.
    const serve = syntheticServer({
      manifest: syntheticLineage({ file: "deep/../file.webp" }),
      storeDir: storeWithFile(SYNTHETIC_BYTES, "file.webp"),
    });
    // Spread rather than `toEqual(body)`: `node:fs` answers with a `Buffer`, and a deep-equal against a
    // `Uint8Array` compares prototypes, not bytes. The sequence is the thing under test.
    expect([...served(await serve(SYNTHETIC_ID)).body]).toEqual([
      ...SYNTHETIC_BYTES,
    ]);
  });

  it("answers file_unreadable when the recorded derivative is not on disk", async () => {
    // A legitimate state, not a crash: the store is git-ignored, so a fresh checkout has a manifest and
    // no files. The route must be able to answer 404 for it rather than throw.
    const emptyStore = path.join(tempRoot(), DERIVATIVE_STORE_DIR);
    mkdirSync(emptyStore, { recursive: true });
    const serve = syntheticServer({
      manifest: syntheticLineage(),
      storeDir: emptyStore,
    });
    expect(await serve(SYNTHETIC_ID)).toMatchObject({
      kind: "refused",
      reason: "file_unreadable",
    });
  });

  it("answers digest_mismatch when bytes of the recorded length are not the recorded bytes", async () => {
    // A same-length substitution, so it is the digest that refuses and not the size probe: eight bytes in,
    // eight bytes out, different content. Before SR-09 this case used four bytes, which the earlier check
    // now answers first — and that ordering is exactly what the two cases below pin separately.
    const swapped = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x00,
    ]);
    expect(swapped.length).toBe(SYNTHETIC_BYTES.length);
    const serve = syntheticServer({
      manifest: syntheticLineage(),
      storeDir: storeWithFile(swapped),
    });
    expect(await serve(SYNTHETIC_ID)).toMatchObject({
      kind: "refused",
      reason: "digest_mismatch",
    });
  });

  it("answers size_mismatch when the file is not the length the record claims, before hashing it", async () => {
    // SR-09's integrity half of the size probe: a shorter file is a different derivative, and saying so costs
    // one `stat` instead of a full read plus a full SHA-256.
    const serve = syntheticServer({
      manifest: syntheticLineage(),
      storeDir: storeWithFile(new Uint8Array([0x00, 0x01, 0x02, 0x03])),
    });
    const outcome = await serve(SYNTHETIC_ID);
    expect(outcome).toMatchObject({ kind: "refused", reason: "size_mismatch" });
    expect((outcome as RefusedDerivative).detail).toContain("4 bytes");
  });

  it("refuses a substitution even though the substitute is a real, readable file", async () => {
    // The mismatch above is the RB-05 failure mode: bytes that exist and parse are not evidence that they
    // are the authorised bytes. Nothing is returned, so a swap cannot be half-served.
    const swapped = new Uint8Array([...SYNTHETIC_BYTES, 0x21]);
    const outcome = await syntheticServer({
      manifest: syntheticLineage(),
      storeDir: storeWithFile(swapped),
    })(SYNTHETIC_ID);
    expect(outcome.kind).toBe("refused");
    expect(outcome).not.toHaveProperty("body");
  });
});

describe("SR-09: the serving ceiling is enforced before the file is read", () => {
  /** A store that would be read if the ceiling let it: valid bytes, correct digest, wrong size. */
  function oversizedStore(): {
    readonly bytes: Uint8Array;
    readonly digest: string;
  } {
    const bytes = new Uint8Array(MAX_SERVED_DERIVATIVE_BYTES + 1).fill(0x41);
    return {
      bytes,
      digest: createHash("sha256").update(bytes).digest("hex"),
    };
  }

  it("is a ceiling above every catalogued original, measured against the register rather than the directory", () => {
    /*
     * The anchor is the 82 originals the register catalogues, stat-ed through its own `libraryPath` column.
     * Enumerating the directory instead is a different and wrong measurement: `Noujoude.photo/` holds 97
     * files, and the largest of them is `Noujoude.photo.rar` at 6,143,950 bytes — the delivery container,
     * which is not an asset, is not a derivative's source, and is not something the media layer may serve.
     * The first run of this case measured that 6,143,950 and failed, which is the failure this file is for:
     * it caught a justification that had been written from a loose enumeration.
     */
    const measured = register.map((asset) => ({
      assetId: asset.assetId,
      bytes: statSync(path.join(ASSET_LIBRARY_DIR, asset.libraryPath)).size,
      path: asset.libraryPath,
    }));
    expect(measured.length, "the register is the census being measured").toBe(
      82,
    );
    const largest = measured.reduce(
      (best, candidate) => (candidate.bytes > best.bytes ? candidate : best),
      measured[0] as { assetId: string; bytes: number; path: string },
    );
    expect(largest.path).toBe("gold_embroidery_detail_1x1.jpg");
    expect(largest.bytes).toBe(398_236); // measured 2 November 2026, against the delivered files
    // The ceiling is a serving bound, not a pipeline bound, and it sits above every thing a pipeline could
    // be pointed at today: a resize at any sane setting is smaller than its source, so the margin below is
    // the room a legitimate derivative has, and the number is ~10× the largest original.
    expect(largest.bytes).toBeLessThan(MAX_SERVED_DERIVATIVE_BYTES);
    expect(MAX_SERVED_DERIVATIVE_BYTES / largest.bytes).toBeGreaterThan(10);
    expect(MAX_SERVED_DERIVATIVE_BYTES).toBe(4 * 1024 * 1024);
  });

  it("records what actually sits in the library directory, so the anchor above is checkable", () => {
    const entries = readdirSync(ASSET_LIBRARY_DIR, {
      recursive: true,
      withFileTypes: true,
    }).filter((entry) => entry.isFile());
    const files = entries.map((entry) => entry.name);
    const images = files.filter((name) => /\.(png|jpe?g|webp)$/i.test(name));
    // `Dirent.parentPath` is the directory the entry was found in, already resolved against the root
    // handed to `readdirSync`, so it is joined with the name alone. (`Dirent.path` is the pre-20.11 name and
    // is gone from the Node 24 types this project pins.)
    const largestFile = Math.max(
      ...entries.map(
        (entry) => statSync(path.join(entry.parentPath, entry.name)).size,
      ),
    );
    // 97 files under the tree, 93 of them images (14 JPG, 79 WebP), and the single biggest is the archive.
    expect(files.length).toBeGreaterThan(80);
    expect(images.length).toBeGreaterThan(80);
    expect(largestFile).toBeGreaterThan(0);
    expect(MAX_SERVED_DERIVATIVE_BYTES).toBeGreaterThan(0);
    // Which is the honest statement of the trade: something in that directory is bigger than the ceiling.
    // It is not an asset and the register cannot point at it, so no authorised derivative can be refused by
    // this check, and the check is not a claim about the directory's total size.
  });

  it("refuses a record that declares more bytes than the ceiling allows", async () => {
    // The declaration alone is enough to refuse: no `stat`, no read, no hash. That is the half of SR-09 the
    // manifest can answer on its own, and the reason the check sits above the disk probe.
    const serve = syntheticServer({
      manifest: syntheticLineage({
        bytes: MAX_SERVED_DERIVATIVE_BYTES + 1,
      }),
      storeDir: storeWithFile(SYNTHETIC_BYTES),
    });
    expect(await serve(SYNTHETIC_ID)).toMatchObject({
      kind: "refused",
      reason: "too_large",
    });
  });

  it("refuses on the measured size when the record understates it, and reads nothing", async () => {
    // The claim is a small file; the disk holds one byte over the ceiling. Trusting the claim would have
    // allocated it, which is the defect: the ceiling has to be enforced against the filesystem.
    const oversized = oversizedStore();
    let askedFor = "";
    const serve = createDerivativeServer({
      ...PRODUCTION_SERVING_DEPENDENCIES,
      evaluateServing: decidePublicServing,
      findAsset: (assetId) =>
        assetId === SYNTHETIC_ID ? syntheticAsset() : null,
      readLineageManifest: () =>
        syntheticLineage({ bytes: SYNTHETIC_BYTES.length }),
      readFileBytes: async (target: string) => {
        askedFor = target;
        return await PRODUCTION_SERVING_DEPENDENCIES.readFileBytes(target);
      },
      storeDirectory: () => storeWithFile(oversized.bytes),
    });
    const outcome = await serve(SYNTHETIC_ID);
    expect(outcome).toMatchObject({ kind: "refused", reason: "too_large" });
    // The proof that the ceiling is *before* the read: the reader was never handed this path.
    expect(askedFor).toBe("");
  });

  it("serves a file of exactly the ceiling, so the bound is > and not >=", async () => {
    const atCap = new Uint8Array(MAX_SERVED_DERIVATIVE_BYTES).fill(0x42);
    const serve = syntheticServer({
      manifest: syntheticLineage({
        bytes: atCap.length,
        sha256: createHash("sha256").update(atCap).digest("hex"),
      }),
      storeDir: storeWithFile(atCap),
    });
    expect(served(await serve(SYNTHETIC_ID)).body.byteLength).toBe(
      atCap.length,
    );
  });

  it("refuses when the size probe cannot answer, which is the absence a fresh checkout has", async () => {
    const emptyStore = path.join(tempRoot(), DERIVATIVE_STORE_DIR);
    mkdirSync(emptyStore, { recursive: true });
    const serve = syntheticServer({
      manifest: syntheticLineage(),
      storeDir: emptyStore,
    });
    expect(await serve(SYNTHETIC_ID)).toMatchObject({
      kind: "refused",
      reason: "file_unreadable",
    });
  });
});

describe("the served branch, reached for the first time", () => {
  it("returns the file's bytes, the lineage mime and the digest as the entity tag", async () => {
    const serve = syntheticServer({
      manifest: syntheticLineage(),
      storeDir: storeWithFile(SYNTHETIC_BYTES),
    });
    const outcome = served(await serve(SYNTHETIC_ID));
    expect(outcome.kind).toBe("served");
    expect(outcome.assetId).toBe(SYNTHETIC_ID);
    expect([...outcome.body]).toEqual([...SYNTHETIC_BYTES]);
    expect(outcome.etag).toBe(SYNTHETIC_DIGEST);
    expect(outcome.mime).toBe("image/webp");
  });

  it("carries the original's digest, so the served copy still names what it came from", async () => {
    const outcome = served(
      await syntheticServer({
        manifest: syntheticLineage(),
        storeDir: storeWithFile(SYNTHETIC_BYTES),
      })(SYNTHETIC_ID),
    );
    // `originalSha256` is the register row's own SHA-256 cell: the join that RB-05 lost for ten
    // quarantined files, and the reason a replacement can be traced to a previous file.
    expect(outcome.originalSha256).toBe(SHA_B);
    expect(syntheticAsset().checksum).toBe(SHA_B);
  });

  it("refuses size_mismatch when the record overstates the file, before the digest is ever computed", async () => {
    // The record claims 999,999 bytes; the store holds 8. This case asserted `served` until SR-09 put a
    // length probe ahead of the hash, and the change is the point: an integrity check that reads the whole
    // file first is an unbounded cost, so the honest answer now is that the mismatch is refused and nothing
    // is returned. That the digest is *computed* rather than copied is pinned elsewhere — a same-length
    // substitution above reaches check 7 and answers `digest_mismatch`, and the served branch below requires
    // the served ETag to equal the digest of the bytes it hands out.
    const serve = syntheticServer({
      manifest: syntheticLineage({ bytes: 999_999 }),
      storeDir: storeWithFile(SYNTHETIC_BYTES),
    });
    const outcome = await serve(SYNTHETIC_ID);
    expect(outcome).toMatchObject({ kind: "refused", reason: "size_mismatch" });
    expect(outcome).not.toHaveProperty("etag");
  });

  it("answers unknown_asset for an id the synthetic register does not carry, before the gate", async () => {
    const serve = syntheticServer({
      manifest: syntheticLineage({ assetId: "NDM-SYNTH-TEST-777" }),
      storeDir: storeWithFile(SYNTHETIC_BYTES),
    });
    expect(await serve("NDM-SYNTH-TEST-777")).toMatchObject({
      reason: "unknown_asset",
    });
  });

  it("runs the gate before the store, so an injected record cannot skip it", async () => {
    // The row's approval cell is changed to wording no vocabulary honours, while the lineage row and the
    // correct bytes are both in place. `approval_not_granted` is the only possible answer, which proves
    // check 2 sits between check 1 and the store.
    const denied = syntheticAsset({
      "Brand/Curatorial Approval": "Not Approved — fixture, no sign-off",
    });
    const serve = syntheticServer({
      manifest: syntheticLineage(),
      record: denied,
      storeDir: storeWithFile(SYNTHETIC_BYTES),
    });
    expect(await serve(SYNTHETIC_ID)).toEqual({
      assetId: SYNTHETIC_ID,
      detail: "approval_not_granted",
      kind: "refused",
      reason: "gate_denied",
    });
  });
});

describe("the gate's own clauses, through the real evaluator and a synthetic row", () => {
  // Each case supplies a lineage record and the correct bytes, so the store is never the reason: whatever
  // comes back is the gate. Previously three of these four denials could not be produced end to end.
  const clearedCells: Record<string, string> = {
    "Brand/Curatorial Approval":
      "SYNTHETIC-APPROVED — vocabulary that exists only in this file",
    "Actual Usage":
      "SYNTHETIC-PUBLISHED — vocabulary that exists only in this file",
    "Rights Status":
      "SYNTHETIC-CLEARED — vocabulary that exists only in this file",
  };

  async function reasonFor(overrides: Record<string, string>): Promise<string> {
    const store = storeWithFile(SYNTHETIC_BYTES);
    const outcome = await syntheticServer({
      manifest: syntheticLineage(),
      record: syntheticAsset({ ...clearedCells, ...overrides }),
      storeDir: store,
    })(SYNTHETIC_ID);
    if (outcome.kind === "served") return "served";
    return outcome.detail ?? outcome.reason;
  }

  it("serves the row that is cleared, approved and published", async () => {
    expect(await reasonFor({})).toBe("served");
  });

  it("denies rights_not_cleared when the rights wording is not a cleared marker", async () => {
    expect(
      await reasonFor({
        "Rights Status": "UNKNOWN — no rights statement supplied",
      }),
    ).toBe("rights_not_cleared");
  });

  it("denies approval_not_granted for a cleared but unapproved row", async () => {
    expect(
      await reasonFor({
        "Brand/Curatorial Approval": "Not Approved — no approval record",
      }),
    ).toBe("approval_not_granted");
  });

  it("denies not_published for a cleared, approved row that no publish transaction has recorded", async () => {
    expect(await reasonFor({ "Actual Usage": "Homepage hero" })).toBe(
      "not_published",
    );
  });

  it("treats a pending review as a denial, not as a half-permission", async () => {
    expect(await reasonFor({ "Rights Status": "Awaiting Rights Review" })).toBe(
      "rights_not_cleared",
    );
    expect(rightsStateFrom("Awaiting Rights Review")).toBe("pending");
  });
});

describe("the production binding stays bound to the real register and the real gate", () => {
  it("names the shipped implementations in every dependency slot", () => {
    const deps: ServingDependencies = PRODUCTION_SERVING_DEPENDENCIES;
    expect(deps.evaluateServing).toBe(decidePublicServing);
    expect(deps.readLineageManifest).toBe(derivativeManifest);
    expect(deps.storeDirectory()).toBe(
      path.join(process.cwd(), DERIVATIVE_STORE_DIR),
    );
    // Check 1 answers from the delivered register: the same cached row object, and null for the synthetic id.
    const delivered = one(
      register.filter((asset) => asset.assetId === FIRST_ASSET_ID),
      `the ${FIRST_ASSET_ID} row`,
    );
    expect(deps.findAsset(FIRST_ASSET_ID)).toBe(delivered);
    expect(deps.findAsset(SYNTHETIC_ID)).toBeNull();
  });

  it("answers through the production dependencies exactly what the shipped binding answers", async () => {
    const serve = createDerivativeServer(PRODUCTION_SERVING_DEPENDENCIES);
    // `serveDerivative` *is* this call, so the requirement is that giving the seven checks the real
    // register, the real gate and the real store cannot make them disagree with the entry point the route
    // uses. Asserting "refuses all 82" here was asserting a snapshot of the register; the invariant is the
    // equality of the two paths, and the shape of each answer.
    for (const asset of [DENIED, SERVED])
      expect(await serve(asset.assetId)).toEqual(
        await serveDerivative(asset.assetId),
      );
    // Every row the gate denies is refused by the gate, on the production dependency set, with no bytes.
    for (const asset of DENIED_ASSETS) {
      const outcome = await serve(asset.assetId);
      expect(outcome.kind).toBe("refused");
      if (outcome.kind === "refused") {
        expect(outcome.reason).toBe("gate_denied");
        expect(outcome.detail).toBe(decidePublicServing(asset).denial);
      }
    }
    // The other half of the intersection, on a row that exists: cleared by the gate, absent from the
    // lineage store. The answer is the absence, and it is not the gate pretending to have denied.
    const clearedButUnbuilt = one(
      CLEAR_ASSETS.filter((asset) => !LINEAGE_IDS.has(asset.assetId)),
      "asset the gate clears and the build did not produce",
    );
    const missing = await serve(clearedButUnbuilt.assetId);
    expect(missing).toEqual({
      assetId: clearedButUnbuilt.assetId,
      detail: null,
      kind: "refused",
      reason: "no_lineage",
    });
  });

  it("will not serve the synthetic fixture through the production entry point", async () => {
    // The fixture clears under a vocabulary this file owns. On the wire it does not exist, which is the
    // statement instruction 6 requires: no synthetic approval enters the HTTP path.
    expect(syntheticAsset().rights).toBe("cleared");
    expect(await serveDerivative(SYNTHETIC_ID)).toEqual({
      assetId: SYNTHETIC_ID,
      detail: null,
      kind: "refused",
      reason: "unknown_asset",
    });
  });
});

describe("storePathFor — check 4, the rule that decides which byte is read", () => {
  // Pure path arithmetic, so the store is named rather than created: nothing here touches the filesystem.
  const store = path.join(tmpdir(), "ndm-serving-pure", DERIVATIVE_STORE_DIR);
  const inside = path.resolve(store);

  it("resolves a plain filename inside the store", () => {
    expect(storePathFor("a.webp", store)).toBe(path.join(inside, "a.webp"));
  });

  it("allows a subdirectory and normalises a traversal that stays inside", () => {
    expect(storePathFor("deep/a.webp", store)).toBe(
      path.join(inside, "deep", "a.webp"),
    );
    // `a/b/../c` and `a/c` are the same file, and only one of them looks suspicious as a string. The check
    // runs on the resolved path, so both forms answer the same way — and a climb out of a subdirectory
    // that lands back in the store is a legitimate path, not an escape.
    expect(storePathFor("a/b/../c.webp", store)).toBe(
      storePathFor("a/c.webp", store),
    );
    expect(storePathFor("deep/../escape.webp", store)).toBe(
      path.join(inside, "escape.webp"),
    );
  });

  it.each([
    ["one level up", "../outside.webp"],
    ["the parent directory itself", ".."],
    ["many levels up", "../../../etc/passwd"],
    ["a nested path that climbs out", "deep/../../outside.webp"],
    [
      "a climb out of the store to its neighbour",
      "../media-derivatives-evil/a.webp",
    ],
    [
      "an absolute path outside the store",
      path.resolve(tmpdir(), "escape.webp"),
    ],
  ])("returns null for %s", (_label, file) => {
    expect(storePathFor(file, store)).toBeNull();
  });

  it("returns null for the store directory itself, which is not a file to serve", () => {
    expect(storePathFor("", store)).toBeNull();
    expect(storePathFor(".", store)).toBeNull();
  });

  it("does not let a sibling directory whose name starts with the store name pass", () => {
    // The guard compares against `resolvedStore + path.sep`. Without the separator, a path under
    // `media-derivatives-evil` starts with the string `media-derivatives` and would read as contained.
    const sibling = path.join(
      path.dirname(store),
      `${path.basename(store)}-evil`,
      "a.webp",
    );
    expect(sibling.startsWith(inside)).toBe(true);
    expect(storePathFor(sibling, store)).toBeNull();
    // The in-store subdirectory form is a different case and is allowed: it resolves inside the store.
    expect(storePathFor(`${path.basename(store)}-evil/a.webp`, store)).toBe(
      path.join(inside, `${path.basename(store)}-evil`, "a.webp"),
    );
  });

  it("defaults its store directory to the repository's private store", () => {
    expect(storePathFor("a.webp")).toBe(
      path.join(process.cwd(), DERIVATIVE_STORE_DIR, "a.webp"),
    );
  });
});

describe("clearance is a closed vocabulary the code owns, not a property of the register", () => {
  /**
   * What the whitelist means now that the served branch is reachable through the shipped binding. The blocks
   * above reach bytes through `createDerivativeServer` and a vocabulary this file owns; nothing here changes
   * what the shipped binding can do, and the point of this block is that *the register cannot change it
   * either*. A.9 requires "referenced, present, rights-cleared, approved … are different states" and §23 bars
   * a file in a library from counting as cleared on its own existence. Arming a marker is a visible edit to
   * `src/lib/media/asset-record.ts`, so the case below pins the exact armed set: an add, a removal or a
   * loosened prefix has to be a deliberate change to that file, reviewed as one, and cannot arrive from a CSV
   * cell, a build script or a test fixture.
   */
  it("honours exactly three armed prefixes and one pending statement, and nothing else", () => {
    expect(PRODUCTION_RIGHTS_VOCABULARY).toEqual({
      clearedMarkers: ["Owner-Declared Owned — authorisation:"],
      grantedApprovalMarkers: ["Approved — Owner mandate 2026-11-04"],
      pendingStatements: ["Awaiting Rights Review"],
      publishedMarkers: ["Published — register:"],
    });
    // Each armed marker is the opening of a sentence that cites the instrument it rests on, so a marker on
    // its own — without the citation that follows it — is still a prefix, and a row cannot be cleared by a
    // wording that names no authority.
    for (const marker of [
      ...PRODUCTION_RIGHTS_VOCABULARY.clearedMarkers,
      ...PRODUCTION_RIGHTS_VOCABULARY.grantedApprovalMarkers,
      ...PRODUCTION_RIGHTS_VOCABULARY.publishedMarkers,
    ])
      expect(marker, `marker ${marker} cites something`).toContain("—");
    // The only wording that means "a human is looking at this", and pending is a denial, not a half-permission.
    expect(rightsStateFrom("Awaiting Rights Review")).toBe("pending");
    expect(
      decidePublicServing(
        syntheticAsset({ "Rights Status": "Awaiting Rights Review" }),
      ).serve,
    ).toBe(false);
  });

  it("refuses the wordings a future audit or a forged row would most plausibly use", () => {
    // The risk the whitelist exists to answer: a cell that *says* cleared. Each of these is a sentence an
    // unreviewed CSV edit could contain, and none of them is in the armed set.
    const lookalikes = [
      "CLEARED",
      "cleared",
      "Cleared — signed licence on file, expires 2030",
      "Rights holder: estate, licence: CC BY-NC 4.0",
      "Owner-Declared Owned", // the marker, minus the citation that makes it one
      "Owner-declared owned — authorisation: mandate §2", // case-changed
      "Approved — Owner mandate",
      "Approved — brand sign-off 2026-11-02",
      "Published",
      "Published — homepage",
    ];
    for (const wording of lookalikes) {
      expect(rightsStateFrom(wording), `rights: ${wording}`).not.toBe(
        "cleared",
      );
      expect(approvalFrom(wording), `approval: ${wording}`).not.toBe(
        "approved",
      );
      expect(publishedFrom(wording), `published: ${wording}`).toBe(false);
    }
    // The prefix reads only from the front, which is the whole mechanism: a row that quotes the instrument
    // and then argues with it is not cleared by the quotation it buried.
    expect(
      rightsStateFrom(
        "Owner-Declared Owned — authorisation: mandate §2, disputed by the archive",
      ),
    ).toBe("cleared");
  });

  it("binds every evaluator and the register parser to that vocabulary by default", () => {
    expect(
      rightsStateFrom(
        "SYNTHETIC-CLEARED — vocabulary that exists only in this file",
      ),
    ).toBe("unknown");
    expect(
      approvalFrom(
        "SYNTHETIC-APPROVED — vocabulary that exists only in this file",
      ),
    ).toBe("unknown");
    expect(
      publishedFrom(
        "SYNTHETIC-PUBLISHED — vocabulary that exists only in this file",
      ),
    ).toBe(false);
    // The same row, read once with the test-only vocabulary and once with the default, so the difference is
    // the policy argument and nothing else.
    expect(syntheticAsset().rights).toBe("cleared");
    const text = `${AUDIT_COLUMNS.join(",")}\n${syntheticCells()}\n`;
    const production = one(registryFromText(text), "production-policy row");
    expect(production.assetId).toBe(SYNTHETIC_ID);
    expect(production.rights).toBe("unknown");
    expect(production.approval).toBe("unknown");
    expect(production.published).toBe(false);
    expect(decidePublicServing(production)).toEqual({
      denial: "rights_not_cleared",
      serve: false,
    });
  });

  it("maps rights wording to unknown unless the code has pre-agreed a marker", () => {
    expect(
      rightsStateFrom("CLEARED — signed licence on file, expires 2030"),
    ).toBe("unknown");
    expect(
      rightsStateFrom("Rights holder: estate, licence: CC BY-NC 4.0"),
    ).toBe("unknown");
    expect(rightsStateFrom("Awaiting Rights Review")).toBe("pending");
    expect(rightsStateFrom("UNKNOWN — no rights statement supplied")).toBe(
      "unknown",
    );
  });

  it("maps approval wording to unknown or not_approved, never to a grant", () => {
    expect(approvalFrom("Approved — brand sign-off 2026-11-02")).toBe(
      "unknown",
    );
    expect(approvalFrom("Not Approved — no approval record supplied")).toBe(
      "not_approved",
    );
    expect(approvalFrom("")).toBe("unknown");
  });

  it("publishes from the register's own cell, and that cell is the publication register's wording", () => {
    // Where the gate now bites, measured rather than remembered. The Owner's 4 November instrument armed
    // rights and approval on every catalogued row, so the *only* dimension still refusing anything is
    // publication — which is precisely the state A.9 refuses to collapse: cleared, approved and published
    // stay three different facts, and a page that quotes a placement has not published anything.
    for (const asset of register) {
      expect(asset.rights).toBe("cleared");
      expect(asset.approval).toBe("approved");
    }
    const published = register
      .filter((asset) => asset.published)
      .map((asset) => asset.assetId)
      .sort();
    expect(published).toEqual(
      PUBLICATION_REGISTER.entries.map((entry) => entry.assetId).sort(),
    );
    expect(PUBLICATION_REGISTER.counts.notPublished).toBe(
      register.length - published.length,
    );
    // Every denial this produces is the third clause, and it reaches the wire as `not_published`.
    expect(DENIED_ASSETS.every((asset) => asset.published === false)).toBe(
      true,
    );
    // A cell that names a placement, a surface or a location is not a transaction and does not read as one.
    expect(publishedFrom("Homepage hero")).toBe(false);
    expect(publishedFrom("None")).toBe(false);
    expect(publishedFrom("")).toBe(false);
  });

  it("denies a fixture row whose cells claim clearance in the words a future audit would use", () => {
    const header = AUDIT_COLUMNS.join(",");
    const cells: Record<string, string> = {
      "Asset ID": FIRST_ASSET_ID,
      Filename: "cleared-example.webp",
      "Expected Category": "A.2 Brand Identity Assets",
      "Physical Status": "PRESENT",
      "Actual Path": "cleared-example.webp",
      "MIME Type": "image/webp",
      Width: "640",
      Height: "480",
      "File Size": "40960",
      "SHA-256": SHA_A,
      "Source/Creator": "fixture — not a delivered asset",
      "Rights Status": "CLEARED — signed licence on file",
      "Brand/Curatorial Approval": "Approved — brand sign-off",
      "Intended Usage": "Fixture role | Header",
      "Actual Usage": "None",
      "Derivative Status": "Derived",
      "Alt Text Status": "Recorded",
      Notes:
        "Explicitly controlled fixture text; the delivered register is not touched by this file",
      "Verified By": "serving.test.ts",
      "Verified Date": "2026-11-02",
    };
    const row = AUDIT_COLUMNS.map((column) => cells[column] ?? "").join(",");
    const record = one(
      registryFromText(`${header}\n${row}\n`),
      "fixture record",
    );
    expect(record.rights).toBe("unknown");
    expect(record.approval).toBe("unknown");
    expect(record.published).toBe(false);
    expect(decidePublicServing(record)).toEqual({
      denial: "rights_not_cleared",
      serve: false,
    });
  });
});
