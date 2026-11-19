/**
 * src/app/api/media/[assetId]/route.test.ts — what a visitor may learn from a media request.
 *
 * `src/lib/server/media/serving.ts` decides; this file tests the shape of the answer that decision is
 * allowed to have on the wire, because the decision itself is asserted there. The endpoint has two answers
 * and each carries its own contract. A refusal is a `404` and never a `403` (a `403` would confirm to
 * anyone who can guess an id that the id is real, derived and withheld); it is byte-for-byte
 * indistinguishable from the refusal of an id that has never existed; and it carries no reason, no digest,
 * no filesystem path, no content type, no cache validator and nothing a cache is allowed to keep. A served
 * derivative is a `200` with the recorded bytes, the recorded mime type and the recorded digest as the
 * validator, and it is marked revalidable rather than fresh — every later visit asks the gate again, so a
 * withdrawal cannot survive in a cache that was populated while the asset was clear.
 *
 * Which ids get which answer is neither assumed nor hard-coded. The register and the delivered lineage
 * manifest are read and the partition is derived from them: `SERVED` below is the set of assets that pass
 * `decidePublicServing` *and* have a row the shipped reader returns. Measured on 4 November 2026 that is 45
 * served, 36 refused by the gate and 1 refused because its derivative was never produced — and the same
 * loop that computes it asserts that `serveDerivative` agrees. Before the Owner's declaration of 4 November
 * this file asserted "all 82 answer 404", which was a snapshot of the rights state written as though it
 * were the wire contract: it would have gone red the moment an asset was cleared, and a suite that goes red
 * because the governance facts improved is a suite that gets edited rather than read. What is pinned now is
 * the mapping — every asset in the served partition answers exactly the served shape, every other id
 * answers exactly the refusal shape, and neither answer is available to the other's ids. The fail-closed
 * properties that made the old assertion worth making are all still here, and now run against a store that
 * is reachable: the gate is consulted before the store is opened, a store row is never a capability, bytes
 * are re-hashed per request, and a refusal discloses nothing.
 *
 * The handler has two entry points, and they are tested in two different ways because they answer two
 * different questions. `mediaRoute.GET` is the production binding — `serveDerivative`, the real register,
 * the real gate, the real limiter — and the partition blocks run against it.
 * `createMediaRouteHandler(serve, limits)` is the seam STEP 9 added and SR-04 widened: the same response
 * logic over an explicit serving service *and* an explicit guard. Two services are handed to it here. The
 * controlled one answers the served branch for a synthetic id outside the register, so the response rules
 * are read in isolation from the six checks; the other is `serveDerivative` itself, pointed at a temporary
 * root, so the store cases below exercise containment and the missing-file branch through the shipped
 * reader rather than against a stand-in. The seven checks and the record that clears them are tested in
 * `src/lib/server/media/serving.test.ts`. The synthetic id is not a register row, so `GET` answers
 * `unknown_asset` for it; the last block measures that, and measures that no id outside the served
 * partition reaches the `200` branch through the shipped binding either.
 *
 * The handler is called directly with the `params` promise Next.js hands it, the way `slots.test.ts`
 * calls the layout. No server is started, no socket is used, and nothing is written to the repository:
 * store fixtures are `lineage.json` files in a throwaway directory under the OS temp directory, read
 * through the shipped reader and validator, and the served branch runs on in-memory outcomes.
 *
 * Every request this file makes carries its own client address. Since SR-04 the endpoint keeps a token
 * bucket per client, and the production guard `mediaRoute.GET` uses allows 40 requests per client — this
 * file makes roughly four hundred, so a shared address would spend the suite's allowance on the fortieth
 * assertion and every one after it would measure a `429` instead of the refusal it is about. `requestFor`
 * hands each call the next address in RFC 5737's documentation range, which is what those addresses exist
 * for. The limit's own behaviour is tested in its own block below, through `createMediaRouteHandler` with a
 * two-token policy and a manual clock, because that is the only way to assert both halves of it: that a
 * denied caller is paced, and that the denial costs the application no work at all.
 *
 * One case the file deliberately does not cover: a corrupt `lineage.json` sitting in the repository's own
 * git-ignored private store. Creating it would write into the tree and would falsify the delivered manifest
 * every other block in this file reads, and the refusal paths in `serving.test.ts` and the store blocks
 * below already cover both ways a bad record can fail — rejected by the shipped validator on the way in,
 * and refused by check 4 on the way to the bytes. What a *throwing* decision answers with is asserted
 * separately, against a service that throws, because the handler must not depend on that ordering staying
 * put in another module.
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import * as mediaRoute from "@/app/api/media/[assetId]/route";
import { afterEach, describe, expect, it, vi } from "vitest";

import { decidePublicServing } from "@/domain/rights";
import type { AssetRecord } from "@/lib/media/asset-record";
import {
  DERIVATIVE_MANIFEST_PATH,
  DERIVATIVE_STORE_DIR,
  type DerivativeLineage,
  type DerivativeManifest,
  derivativeUrl,
} from "@/lib/server/media/derivative-store";
import { assetRegister } from "@/lib/server/media/registry";
import {
  derivativeManifest,
  lineageFor,
  resetDerivativeManifestCache,
} from "@/lib/server/media/slot-facts";
import {
  type ServingOutcome,
  type ServedDerivative,
  serveDerivative,
} from "@/lib/server/media/serving";
import {
  type RequestLimitGuard,
  createRequestLimitGuard,
  rateLimitPolicyFromEnvironment,
} from "@/lib/server/media/request-limits";
import { createManualClock } from "../../../../../tests/helpers/fake-clock";

/**
 * The delivered register and the delivered derivative store, read once, and the partition they imply.
 *
 * `mayServe` is the endpoint's own rule, not a test-local invention: an asset answers with bytes when the
 * gate passes it *and* the shipped reader returns a lineage row for it, and with a 404 otherwise. Deriving
 * the two lists from it is what lets every block below say "each partition answers its shape" instead of
 * "every id answers 404" — the latter was true only while no asset was cleared, and a wire contract cannot
 * be a photograph of a rights state.
 */
const register = assetRegister();
const LINEAGE_ROWS = new Map(
  (derivativeManifest()?.derivatives ?? []).map((row) => [row.assetId, row]),
);

function mayServe(asset: AssetRecord): boolean {
  return decidePublicServing(asset).serve && LINEAGE_ROWS.has(asset.assetId);
}

const SERVED: AssetRecord[] = register.filter(mayServe);
const REFUSED: AssetRecord[] = register.filter((asset) => !mayServe(asset));
/** Gate-cleared but with no derivative on record: the third state, which is a refusal and not a 404-by-accident. */
const CLEARED_WITHOUT_BYTES: AssetRecord[] = register.filter(
  (asset) =>
    decidePublicServing(asset).serve && !LINEAGE_ROWS.has(asset.assetId),
);
const SERVED_IDS: string[] = SERVED.map((asset) => asset.assetId);
const REFUSED_IDS: string[] = REFUSED.map((asset) => asset.assetId);

function one(rows: AssetRecord[], what: string): AssetRecord {
  const [first] = rows;
  if (!first) throw new Error(`the delivered register holds no ${what}`);
  return first;
}

/** A real register id the endpoint refuses: the withheld half of every indistinguishability claim below. */
const WITHHELD_ID = one(
  REFUSED.filter((asset) => !decidePublicServing(asset).serve),
  "asset the gate denies",
).assetId;
/** A real register id the endpoint serves, and a second one, so a row can be shown not to answer for its neighbour. */
const CLEARED_ID = one(
  SERVED,
  "asset the gate clears and the store carries",
).assetId;
const OTHER_CLEARED_ID = one(
  SERVED.filter((asset) => asset.assetId !== CLEARED_ID),
  "second served asset",
).assetId;
const ENTITY_TAG = `"${"a".repeat(64)}"`;

/** The complete header set of a refusal, sorted the way a client can read it. */
const REFUSAL_HEADERS =
  '[["cache-control","no-store"],["x-content-type-options","nosniff"]]';

/** The four headers a served derivative is allowed to emit, and nothing else. */
const SERVED_HEADER_NAMES = [
  "cache-control",
  "content-type",
  "etag",
  "x-content-type-options",
];

function rowFor(assetId: string): DerivativeLineage {
  const row = LINEAGE_ROWS.get(assetId);
  if (!row)
    throw new Error(`${assetId} has no lineage row in the delivered store`);
  return row;
}

/**
 * The synthetic derivative the served branch answers with.
 *
 * It is not an asset. The id is outside the delivered range, so `mediaRoute.GET` — which resolves through
 * the real register — answers `unknown_asset` for it, which the last block measures. These are in-memory
 * bytes handed to a controlled serving service, because the question here is the response the handler
 * builds from an outcome, not the six checks that produce one; those, and the cleared record that gets a
 * `served` outcome at all, are tested in `src/lib/server/media/serving.test.ts`. The digest is the sha256
 * of these bytes, so the `ETag` asserted below is the value the shipped code would compute rather than one
 * this file invented.
 */
const SYNTHETIC_ID = "NDM-SYNTH-TEST-001";
const SYNTHETIC_BYTES = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50,
]);
const SYNTHETIC_DIGEST = createHash("sha256")
  .update(SYNTHETIC_BYTES)
  .digest("hex");
const SYNTHETIC_TAG = `"${SYNTHETIC_DIGEST}"`;
const SYNTHETIC_SERVED: ServedDerivative = {
  assetId: SYNTHETIC_ID,
  body: SYNTHETIC_BYTES,
  etag: SYNTHETIC_DIGEST,
  kind: "served",
  mime: "image/webp",
  originalSha256: "b".repeat(64),
};

/** The service the served-branch cases are run against: one asset, and nothing else exists. */
const serveSynthetic: mediaRoute.DerivativeServer = async (assetId) =>
  assetId === SYNTHETIC_ID
    ? SYNTHETIC_SERVED
    : { assetId, detail: null, kind: "refused", reason: "unknown_asset" };

/**
 * Everything the handler is permitted to say about a refusal, in the vocabulary of the wire rather than
 * the code. A single header appearing anywhere in this set is a disclosure.
 *
 * The first ten entries are the whole of the decision's vocabulary — the four `ServingDecision` denials and
 * the six `ServingRefusal` reasons in `src/lib/server/media/serving.ts`, listing the two resource limits
 * alongside the rest rather than trusting them never to fire on the wire. Keeping the list complete is the
 * point: a refusal that answers `404` while naming *which* check stopped it is still a disclosure, and the
 * `ServedDerivative` branch is now reachable, so the wire has to be read against every reason at once.
 */
const FORBIDDEN_STRINGS = [
  "rights_not_cleared",
  "approval_not_granted",
  "not_published",
  "unrecognised_state",
  "gate_denied",
  "unknown_asset",
  "no_lineage",
  "path_escapes_store",
  "too_large",
  "size_mismatch",
  "file_unreadable",
  "digest_mismatch",
  DERIVATIVE_STORE_DIR,
  "Noujoude.photo",
  "sha256",
  "webp",
  "lineage.json",
  ".env",
];

/**
 * What must stay off a *served* response.
 *
 * A `200` legitimately carries the mime type — so `webp` is not a disclosure here, it is the `Content-Type`,
 * and it is also the RIFF marker inside the bytes — and legitimately carries the digest as the validator.
 * Everything else the decision knows about is not the client's business: the reason a neighbour was refused,
 * the store's directory, the manifest's filename, the library the original came from, or the word "sha256"
 * that would name the algorithm the tag is built with. This is the same list with the one entry the served
 * branch is allowed to say, and it is asserted against status and headers rather than the body, because the
 * body is the artwork and a byte-level string scan of it would only measure the encoder's choices.
 */
const SERVED_FORBIDDEN = FORBIDDEN_STRINGS.filter(
  (forbidden) => forbidden !== "webp",
);

interface RouteContext {
  readonly params: Promise<{ assetId?: string }>;
}

function context(assetId?: string): RouteContext {
  return { params: Promise.resolve(assetId === undefined ? {} : { assetId }) };
}

function requestFor(
  headers: HeadersInit = {},
  assetId: string = WITHHELD_ID,
): Request {
  const merged = new Headers(headers);
  if (!merged.has("x-forwarded-for")) {
    merged.set("x-forwarded-for", nextClientAddress());
  }
  return new Request(`http://localhost:3000/api/media/${assetId}`, {
    headers: merged,
  });
}

/**
 * A fresh client address for every request this file makes, drawn from RFC 5737's documentation range.
 *
 * `mediaRoute.GET` runs against the production guard, which allows a client 40 requests before pacing.
 * Reusing one address would therefore turn the 41st assertion in this file into a measurement of the rate
 * limiter rather than of the refusal it claims to test — a green suite answering the wrong question. The
 * range is exactly three /24s of addresses reserved for this purpose; the counter cycles, and a cycle
 * returns an address to at most a handful of requests, far under the allowance. A caller that passes its
 * own `x-forwarded-for` wins, which is how the limit block below pins one client.
 */
const DOCUMENTATION_BLOCKS = ["203.0.113", "198.51.100", "192.0.2"];
let clientSequence = 0;

function nextClientAddress(): string {
  clientSequence += 1;
  const block = DOCUMENTATION_BLOCKS[
    Math.floor((clientSequence - 1) / 254) % DOCUMENTATION_BLOCKS.length
  ] as string;
  return `${block}.${((clientSequence - 1) % 254) + 1}`;
}

/**
 * The limiter the factory-based cases run against: the production policy, built without reading the
 * environment, and deliberately not shared with `mediaRoute.GET`'s memoized guard so this file cannot
 * exhaust either one by accident.
 */
function openGuard(): RequestLimitGuard {
  return createRequestLimitGuard(rateLimitPolicyFromEnvironment({}), {
    salt: "route-test-salt",
  });
}

/**
 * The response reduced to what a client can observe. Two responses with the same fingerprint are
 * indistinguishable, which is the property the 404-not-403 decision exists to provide.
 */
async function fingerprint(response: Response): Promise<string> {
  return JSON.stringify({
    body: await response.text(),
    cacheControl: response.headers.get("cache-control"),
    contentType: response.headers.get("content-type"),
    etag: response.headers.get("etag"),
    headerKeys: [...response.headers.keys()].sort(),
    lastModified: response.headers.get("last-modified"),
    ok: response.ok,
    status: response.status,
    type: response.type,
  });
}

/**
 * A well-formed lineage record for one asset, naming a file this fixture does not create.
 *
 * `readableRowFor` below is the version with bytes behind it; this one exists for the cases that need the
 * manifest to be valid and the store to be empty, which is what a fresh checkout of a git-ignored store
 * looks like.
 */
function lineageRow(assetId: string): DerivativeLineage {
  return {
    assetId,
    bytes: 40_960,
    file: `${assetId}.webp`,
    height: 480,
    mime: "image/webp",
    originalFilename: `${assetId}.png`,
    originalSha256: "b".repeat(64),
    profile: "test-probe",
    sha256: "a".repeat(64),
    width: 640,
  };
}

/** A manifest shell the shipped validator accepts, holding exactly these rows. */
function manifestWith(
  derivatives: readonly DerivativeLineage[],
): DerivativeManifest {
  return {
    derivatives,
    generatedAt: "2026-11-04T00:00:00.000Z",
    originalsUnchanged: true,
    storeDirectory: DERIVATIVE_STORE_DIR,
  };
}

/** Temp roots a case created, removed in `afterEach` so a red assertion cannot leave litter behind. */
const tempRoots: string[] = [];

/**
 * A throwaway workspace whose private store holds `lineage.json` with exactly these bytes.
 *
 * This replaces `setDerivativeManifest`, removed under risk **SR-10** because it wrote a record straight
 * into the process cache without ever meeting `validateManifest`. Writing the file is both more honest and
 * more demanding: what a case puts on disk is read through the shipped reader, the shipped validator and
 * the shipped digest-keyed cache, so a fixture that would not survive production parsing cannot pass here.
 * The repository is never written to, and `Noujoude.photo/` is never opened.
 */
function rootWithManifestText(text: string): string {
  const root = mkdtempSync(path.join(tmpdir(), "ndm-route-"));
  tempRoots.push(root);
  mkdirSync(path.join(root, DERIVATIVE_STORE_DIR), { recursive: true });
  writeFileSync(path.join(root, DERIVATIVE_MANIFEST_PATH), text, "utf8");
  return root;
}

function rootWithManifest(manifest: DerivativeManifest): string {
  return rootWithManifestText(JSON.stringify(manifest));
}

/**
 * Real derivative bytes, taken from the delivered store, so a fixture row can be backed by a file that
 * actually hashes to what the row says.
 *
 * Every check after the gate — containment, the size ceiling, the read, the digest — is only reachable for
 * an asset the gate passes, which was not true when this file was written. Testing them therefore needs a
 * store a cleared asset can be refused *for the right reason*, and an all-zeros placeholder would trip
 * check 7 instead of isolating the variable a case is about. Copying a delivered derivative gives the
 * fixture genuine bytes of the right mime type; the rows below record their real digest and length.
 */
const DELIVERED_BYTES = readFileSync(
  path.join(process.cwd(), DERIVATIVE_STORE_DIR, rowFor(CLEARED_ID).file),
);
const DELIVERED_DIGEST = createHash("sha256")
  .update(DELIVERED_BYTES)
  .digest("hex");

/** A register row, or a failure that names what is missing. */
function need(assetId: string): AssetRecord {
  const asset = register.find((row) => row.assetId === assetId);
  if (!asset) throw new Error(`${assetId} is not in the delivered register`);
  return asset;
}

/**
 * A lineage row that describes those bytes, under `assetId`.
 *
 * The lineage *join* fields come from the asset's own register row, not from the asset the bytes were
 * lifted off, so a fixture can never be refused for a reason this case is not about. The derivative's
 * pixel dimensions stay the real ones, because they describe the file that is on disk.
 */
function readableRowFor(assetId: string): DerivativeLineage {
  const asset = need(assetId);
  return {
    ...rowFor(CLEARED_ID),
    assetId,
    bytes: DELIVERED_BYTES.byteLength,
    file: `${assetId}.webp`,
    originalFilename: asset.filename,
    originalSha256: asset.checksum,
    sha256: DELIVERED_DIGEST,
  };
}

/** A temp store holding `lineage.json` *and* the files its rows name. */
function rootWithReadableRows(rows: readonly DerivativeLineage[]): string {
  const root = rootWithManifest(manifestWith(rows));
  const store = path.join(root, DERIVATIVE_STORE_DIR);
  for (const row of rows)
    writeFileSync(path.join(store, row.file), DELIVERED_BYTES);
  return root;
}

/**
 * The shipped handler over `serveDerivative`, pointed at a chosen store root.
 *
 * `mediaRoute.GET` is this same response logic over the same service with `process.cwd()` as the root; the
 * only difference is which directory `lineage.json` is read from, and rights are decided before the store
 * is opened. So a refusal measured here is the refusal `GET` gives, with the fixture placed where a test is
 * allowed to place it. `src/lib/server/media/serving.test.ts` proves that `serveDerivative(id, root)` and
 * `GET`'s own binding share the seven checks.
 */
function productionHandlerOver(root: string) {
  return mediaRoute.createMediaRouteHandler(
    (assetId) => serveDerivative(assetId, root),
    openGuard(),
  );
}

afterEach(() => {
  resetDerivativeManifestCache();
  for (const dir of tempRoots.splice(0))
    rmSync(dir, { force: true, recursive: true });
});

describe("the handler's surface", () => {
  it("exports GET as the only verb, and two named helpers next to it", () => {
    // `HEAD` is derived by Next from GET; any other verb exported here would be an unreviewed second path
    // to the same bytes. The refusal logic lives in one function precisely so verbs cannot diverge.
    // `createMediaRouteHandler` is not a verb: it is the seam that lets the response rules be read with an
    // explicit service. `conditionalRepresentationMatches` is not a verb either: SR-07 made it exported so
    // the RFC's own rules could be asserted as a table instead of only through statuses — see the block
    // named for it. Neither is imported anywhere in `src/`; `GET` is the only entry point Next will call.
    expect(Object.keys(mediaRoute).sort()).toEqual([
      "GET",
      "conditionalRepresentationMatches",
      "createMediaRouteHandler",
    ]);
    expect(typeof mediaRoute.GET).toBe("function");
    expect(typeof mediaRoute.createMediaRouteHandler).toBe("function");
    expect(typeof mediaRoute.conditionalRepresentationMatches).toBe("function");
    // The verbs Next would route are exactly the HTTP method names; nothing else here can become one.
    const HTTP_VERBS = [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "HEAD",
      "OPTIONS",
    ];
    expect(
      Object.keys(mediaRoute).filter((name) => HTTP_VERBS.includes(name)),
    ).toEqual(["GET"]);
  });

  it("binds GET to the production service, measured as the same answers", async () => {
    // The equivalence this file depends on: `GET` is this response logic over `serveDerivative`, so the
    // served-branch cases below describe the shipped handler's behaviour on real bytes and not the
    // behaviour of a stand-in. Five inputs — one asset the partition serves, one the gate denies, one
    // cleared but never derived, one unknown, one malformed — compared as full fingerprints, body bytes
    // included.
    const production = mediaRoute.createMediaRouteHandler(
      serveDerivative,
      openGuard(),
    );
    const clearedWithoutDerivative = CLEARED_WITHOUT_BYTES[0]?.assetId;
    for (const assetId of [
      CLEARED_ID,
      WITHHELD_ID,
      ...(clearedWithoutDerivative ? [clearedWithoutDerivative] : []),
      "NDM-AST-083",
      "../../.env",
      "",
    ]) {
      const left = await fingerprint(
        await mediaRoute.GET(requestFor({}, assetId), context(assetId)),
      );
      const right = await fingerprint(
        await production(requestFor({}, assetId), context(assetId)),
      );
      expect(right, assetId).toBe(left);
    }
  });
});

describe("the served partition answers with the recorded bytes", () => {
  it("derives the partition from the gate and the store, and agrees with the shipped service", async () => {
    /*
     * The precondition the rest of this file rests on. If `SERVED` and `serveDerivative` ever disagree,
     * every partition assertion below is measuring a list this file invented rather than the endpoint's
     * behaviour, so the agreement is measured per request rather than assumed from the filter above. The
     * structural claims are checked first: the two lists must be the register, neither empty (an empty
     * served partition would make the blocks above vacuous, which is how the old universal-404 assertion
     * hid nothing at all), and the refused half must split exactly into the gate's denials and the cleared
     * rows with no derivative.
     */
    expect(SERVED_IDS.length + REFUSED_IDS.length).toBe(register.length);
    expect(SERVED_IDS.length).toBeGreaterThan(0);
    expect(REFUSED_IDS.length).toBeGreaterThan(0);
    expect(
      REFUSED.filter((asset) => decidePublicServing(asset).serve)
        .map((asset) => asset.assetId)
        .sort(),
    ).toEqual(CLEARED_WITHOUT_BYTES.map((asset) => asset.assetId).sort());
    for (const asset of register) {
      const outcome = await serveDerivative(asset.assetId);
      expect(
        outcome.kind,
        `${asset.assetId}: gate ${decidePublicServing(asset).serve}, lineage ${
          LINEAGE_ROWS.has(asset.assetId) ? "recorded" : "absent"
        }`,
      ).toBe(mayServe(asset) ? "served" : "refused");
    }
  });

  it("answers 200 with bytes that hash to the recorded digest, for every served id", async () => {
    for (const asset of SERVED) {
      const row = rowFor(asset.assetId);
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect(response.status, asset.assetId).toBe(200);
      expect(response.ok, asset.assetId).toBe(true);
      const body = new Uint8Array(await response.arrayBuffer());
      // Bytes, not a promise of bytes: the length is the recorded one and the sha256 is the recorded one,
      // recomputed here from what the client actually received.
      expect(body.byteLength, asset.assetId).toBe(row.bytes);
      expect(
        createHash("sha256").update(body).digest("hex"),
        asset.assetId,
      ).toBe(row.sha256);
      expect(response.headers.get("content-type"), asset.assetId).toBe(
        row.mime,
      );
      expect(response.headers.get("etag"), asset.assetId).toBe(
        `"${row.sha256}"`,
      );
      expect(response.headers.get("cache-control"), asset.assetId).toBe(
        "public, max-age=0, must-revalidate",
      );
      expect(
        response.headers.get("x-content-type-options"),
        asset.assetId,
      ).toBe("nosniff");
      expect([...response.headers.keys()].sort(), asset.assetId).toEqual(
        SERVED_HEADER_NAMES,
      );
    }
  });

  it("says nothing about rights, lineage or the store in a served response", async () => {
    // A `200` is a disclosure only of what the gate already authorised: the id, the digest and the mime
    // type. The reason a *neighbour* was refused, the store's path and the manifest's filename are not in
    // it, so a cleared response cannot be turned into a map of the withheld ones.
    for (const asset of SERVED.slice(0, 6)) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      const wire = [
        String(response.status),
        ...response.headers.keys(),
        ...response.headers.values(),
      ].join(" ");
      for (const forbidden of SERVED_FORBIDDEN) {
        expect(
          wire.toLowerCase(),
          `${asset.assetId}: ${forbidden}`,
        ).not.toContain(forbidden.toLowerCase());
      }
      await response.body?.cancel();
    }
  });

  it("marks every served derivative revalidable, so a withdrawal cannot survive in a cache", async () => {
    // `max-age=0, must-revalidate` is what keeps the per-request gate honest: a shared cache may hold the
    // bytes because they are public, but it may not answer from them. `no-store` appearing here would mean
    // the served branch had inherited the refusal policy; `max-age=31536000` would mean a revoked asset
    // stays readable for a year.
    for (const asset of SERVED.slice(0, 8)) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      const cacheControl = response.headers.get("cache-control");
      expect(cacheControl, asset.assetId).toBe(
        "public, max-age=0, must-revalidate",
      );
      expect(cacheControl, asset.assetId).not.toContain("no-store");
      await response.body?.cancel();
    }
  });
});

describe("the refused partition answers with the byteless 404", () => {
  it("refuses every id outside the served partition with 404, an empty body and no validator", async () => {
    for (const asset of REFUSED) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect(response.status, asset.assetId).toBe(404);
      expect(response.ok, asset.assetId).toBe(false);
      expect(await response.text(), asset.assetId).toBe("");
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
      expect(response.headers.get("content-type"), asset.assetId).toBeNull();
    }
  });

  it("sends exactly the two refusal headers on every refused id", async () => {
    const shapes = new Set<string>();
    for (const asset of REFUSED) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      shapes.add(JSON.stringify([...response.headers.entries()].sort()));
      await response.body?.cancel();
    }
    expect([...shapes]).toEqual([REFUSAL_HEADERS]);
    // And the two answers are not interchangeable: no served response can be mistaken for a refusal, which
    // is what makes "the served set is exactly these 45" a claim about the wire rather than about a filter.
    const served = await mediaRoute.GET(
      requestFor({}, CLEARED_ID),
      context(CLEARED_ID),
    );
    expect(
      JSON.stringify([...served.headers.entries()].sort()),
      CLEARED_ID,
    ).not.toBe(REFUSAL_HEADERS);
    await served.body?.cancel();
  });

  it("never answers 403 for a real id it is withholding", async () => {
    // The distinction is the disclosure rule: 403 means "you are not allowed this known thing", 404 means
    // "there is nothing here". Only the second is safe to say to an anonymous caller. Every refused id is
    // read, not a sample: the set is the whole point.
    for (const asset of REFUSED) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect([401, 403], asset.assetId).not.toContain(response.status);
      expect(response.status, asset.assetId).toBe(404);
      await response.body?.cancel();
    }
  });

  it("leaks no reason, no path and no digest into status, headers or body", async () => {
    const response = await mediaRoute.GET(
      requestFor({}, WITHHELD_ID),
      context(WITHHELD_ID),
    );
    const body = await response.text();
    const wire = [
      String(response.status),
      ...response.headers.keys(),
      ...response.headers.values(),
      body,
    ].join(" ");
    for (const forbidden of FORBIDDEN_STRINGS) {
      expect(wire.toLowerCase(), forbidden).not.toContain(
        forbidden.toLowerCase(),
      );
    }
  });

  it("leaks nothing on the asset cleared but never derived, either", async () => {
    /*
     * `NDM-AST-041`-shaped states are the newest risk in this file. The gate passes this asset, so its id
     * appears in a page's slot list and in the publication register; the only reason it is refused is that
     * no derivative exists. That is a *technical* fact, and a response that said "no lineage" would
     * distinguish it from a rights refusal — which is precisely the enumeration the 404-not-403 rule exists
     * to deny. Asserted as identity with the ordinary refusal rather than as an absence of strings.
     */
    const unproduced = CLEARED_WITHOUT_BYTES[0];
    if (!unproduced)
      throw new Error(
        "no cleared asset is missing its derivative; case is vacuous",
      );
    const fingerprintOfRefusal = await fingerprint(
      await mediaRoute.GET(requestFor(), context(WITHHELD_ID)),
    );
    const response = await mediaRoute.GET(
      requestFor({}, unproduced.assetId),
      context(unproduced.assetId),
    );
    expect(await fingerprint(response), unproduced.assetId).toBe(
      fingerprintOfRefusal,
    );
    expect(decidePublicServing(unproduced).serve, unproduced.assetId).toBe(
      true,
    );
    expect(lineageFor(unproduced.assetId), unproduced.assetId).toBeNull();
  });
});

describe("a withheld asset and an imaginary one cannot be told apart", () => {
  it("fingerprint-matches a real withheld id, an unregistered id and a malformed id", async () => {
    const withheld = await fingerprint(
      await mediaRoute.GET(requestFor(), context(WITHHELD_ID)),
    );
    for (const id of [
      "NDM-AST-083",
      WITHHELD_ID.toLowerCase(),
      `${WITHHELD_ID}.webp`,
      "../../.env",
      "",
    ]) {
      const response = await mediaRoute.GET(requestFor({}, id), context(id));
      expect(await fingerprint(response), id).toBe(withheld);
    }
  });

  it("answers the same for a missing parameter as for a withheld asset", async () => {
    expect(
      await fingerprint(await mediaRoute.GET(requestFor(), context())),
    ).toBe(
      await fingerprint(
        await mediaRoute.GET(requestFor(), context(WITHHELD_ID)),
      ),
    );
  });

  it("gives every refused register id the one refusal fingerprint", async () => {
    // The claim in its full form rather than as a sample: not one of the refused assets — including the
    // one the gate clears but the store cannot produce — can be told from any other by status, headers or
    // body. Enumeration needs a difference, and there is none.
    const reference = await fingerprint(
      await mediaRoute.GET(requestFor(), context(WITHHELD_ID)),
    );
    const distinct = new Set<string>();
    for (const assetId of REFUSED_IDS) {
      const response = await mediaRoute.GET(
        requestFor({}, assetId),
        context(assetId),
      );
      distinct.add(await fingerprint(response));
    }
    expect([...distinct]).toEqual([reference]);
  });

  it("does not give a served asset the refusal fingerprint, which is the point of clearing it", async () => {
    // The mirror image, so the block above cannot be satisfied by an endpoint that answers 404 to
    // everything: the cleared bytes are distinguishable precisely because publishing them is the decision
    // the Owner's instrument made.
    const refusal = await fingerprint(
      await mediaRoute.GET(requestFor(), context(WITHHELD_ID)),
    );
    const response = await mediaRoute.GET(
      requestFor({}, CLEARED_ID),
      context(CLEARED_ID),
    );
    expect(await fingerprint(response), CLEARED_ID).not.toBe(refusal);
  });
});

describe("malformed and missing path parameters", () => {
  /*
   * The mutated base is deliberately an asset the endpoint serves. A neighbour of a cleared id — the same
   * id lower-cased, suffixed, given a filename, or reached through the store's own directory — must still
   * be refused, because the register lookup is an exact match and not a prefix search. Mutating a withheld
   * id would pass for the wrong reason.
   */
  it.each([
    ["no assetId key at all", undefined],
    ["an empty string", ""],
    ["whitespace only", "   "],
    ["a tab and newline", "\t\n"],
    ["a traversal-shaped id", "../../.env"],
    ["a percent-encoded traversal", "%2e%2e%2f%2eenv"],
    ["a filename rather than an id", `${CLEARED_ID}.webp`],
    ["a register id in lower case", CLEARED_ID.toLowerCase()],
    ["a register id with a suffix", `${CLEARED_ID}-copy`],
    [
      "a path prefix that lands in the store",
      `../${DERIVATIVE_STORE_DIR}/${CLEARED_ID}.webp`,
    ],
  ])("refuses %s without throwing or reading", async (_label, assetId) => {
    const response = await mediaRoute.GET(
      requestFor({}, assetId ?? ""),
      context(assetId),
    );
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });

  it("sends nothing a browser could render", async () => {
    const response = await mediaRoute.GET(requestFor(), context("../../.env"));
    expect(response.headers.get("content-type")).toBeNull();
    expect(response.headers.get("content-disposition")).toBeNull();
    expect(response.headers.get("location")).toBeNull();
    expect(response.body).toBeNull();
  });
});

describe("a conditional request cannot turn a refusal into a cached copy", () => {
  const conditionals: Array<[string, Record<string, string>]> = [
    [
      "an entity tag shaped like a real digest",
      { "if-none-match": ENTITY_TAG },
    ],
    ["a weak entity tag", { "if-none-match": 'W/"aaaa"' }],
    ["the wildcard validator", { "if-none-match": "*" }],
    [
      "a modification date",
      { "if-modified-since": "Sun, 02 Nov 2026 00:00:00 GMT" },
    ],
    [
      "the real validator of a cleared derivative",
      { "if-none-match": `"${rowFor(CLEARED_ID).sha256}"` },
    ],
  ];
  it.each(conditionals)(
    "still answers 404 when the client sends %s",
    async (_label, headers) => {
      /*
       * A `304` asserts that the client already holds a representation of this resource. For a withheld
       * derivative that is false, and it would also let a cache keep bytes the gate has not authorised. The
       * fifth case is the one that only exists now that some assets *are* served: a validator copied from a
       * cleared derivative is offered for a refused id, and the answer must not change. The service runs
       * before the handler looks at a validator, so a borrowed tag cannot reach the comparison at all.
       */
      const response = await mediaRoute.GET(
        requestFor(headers),
        context(WITHHELD_ID),
      );
      expect(response.status).toBe(404);
      expect(response.headers.get("etag")).toBeNull();
      expect(await response.text()).toBe("");
    },
  );

  it("answers 404 to a conditional for every refused id, never a 304", async () => {
    // The same rule as a measured property of the whole partition rather than of one id: `304` is the only
    // status a conditional could possibly produce, and it does not appear for any refused asset.
    const tag = `"${rowFor(CLEARED_ID).sha256}"`;
    for (const assetId of REFUSED_IDS) {
      const response = await mediaRoute.GET(
        requestFor({ "if-none-match": tag }, assetId),
        context(assetId),
      );
      expect(response.status, assetId).toBe(404);
      expect(response.headers.get("etag"), assetId).toBeNull();
      await response.body?.cancel();
    }
  });
});

describe("a served derivative answers conditionals with its own validator", () => {
  it("gives 304 with no body to the client holding that derivative's digest", async () => {
    // RFC 9110 §13.1.2 for an asset the gate has cleared, on the production binding rather than through the
    // synthetic service: the client's copy *is* current, so the representation is not transferred again, and
    // the 304 repeats the validators so the stored copy stays refreshable.
    for (const asset of SERVED.slice(0, 5)) {
      const row = rowFor(asset.assetId);
      const response = await mediaRoute.GET(
        requestFor({ "if-none-match": `"${row.sha256}"` }, asset.assetId),
        context(asset.assetId),
      );
      expect(response.status, asset.assetId).toBe(304);
      expect(response.body, asset.assetId).toBeNull();
      expect(response.headers.get("etag"), asset.assetId).toBe(
        `"${row.sha256}"`,
      );
      expect(response.headers.get("cache-control"), asset.assetId).toBe(
        "public, max-age=0, must-revalidate",
      );
      // No `Content-Type` on a response that carries no representation to describe.
      expect(response.headers.get("content-type"), asset.assetId).toBeNull();
    }
  });

  it("transfers the bytes again when the validator is not this derivative's", async () => {
    // Including another cleared derivative's digest: a validator is per-resource, and presenting asset A's
    // tag must not claim a current copy of asset B.
    const other = rowFor(OTHER_CLEARED_ID).sha256;
    const cases: Array<[string, string]> = [
      ["a digest of different bytes", `"${"f".repeat(64)}"`],
      ["the unquoted digest", rowFor(CLEARED_ID).sha256],
      ["a stale tag from an earlier build", ENTITY_TAG],
      ["an empty validator", ""],
      ["the tag of a different cleared asset", `"${other}"`],
    ];
    for (const [label, tag] of cases) {
      const response = await mediaRoute.GET(
        requestFor({ "if-none-match": tag }, CLEARED_ID),
        context(CLEARED_ID),
      );
      const body = new Uint8Array(await response.arrayBuffer());
      expect(response.status, `${label}: ${CLEARED_ID}`).toBe(200);
      expect(body.byteLength, label).toBe(rowFor(CLEARED_ID).bytes);
    }
  });

  it("follows RFC 9110's wildcard and weak forms for a cleared asset", async () => {
    // The SR-07 rules, measured through the production binding against real bytes rather than only through
    // the synthetic service: a current representation exists, so `*` is a false condition, and the weak
    // comparison function ignores strength on either side.
    const row = rowFor(CLEARED_ID);
    for (const tag of [
      "*",
      `W/"${row.sha256}"`,
      `"${row.sha256}"`,
      `"${"f".repeat(64)}", "${row.sha256}"`,
    ]) {
      const response = await mediaRoute.GET(
        requestFor({ "if-none-match": tag }, CLEARED_ID),
        context(CLEARED_ID),
      );
      expect([response.status, response.headers.get("etag")], tag).toEqual([
        304,
        `"${row.sha256}"`,
      ]);
    }
  });

  it("ignores If-Modified-Since, because it emits no date validator", async () => {
    /*
     * The endpoint has one validator — the digest — and RFC 9111 §4.3.7 makes a date conditional
     * meaningless when the representation carries no `Last-Modified`. Answering 304 to a date here would be
     * inventing a validator the store does not record, so the honest answer is the transfer. Recorded as a
     * deliberate choice rather than as a silence: the divergence register carries the RFC 9110 row.
     */
    const response = await mediaRoute.GET(
      requestFor(
        { "if-modified-since": "Sun, 02 Nov 2026 00:00:00 GMT" },
        CLEARED_ID,
      ),
      context(CLEARED_ID),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("last-modified")).toBeNull();
    await response.body?.cancel();
  });
});

describe("the private store is not a capability", () => {
  /*
   * These cases used to be provable only in the negative: with nothing cleared, a 404 from a store fixture
   * could not tell "the gate stopped it" from "the store was never reached". Both readings are now
   * separated by a control run in the same fixture — the same root, the same reader, the same bytes, and an
   * asset the gate does pass. Where the control answers 200, a 404 next to it is the gate's doing.
   */
  it("answers 200 for a cleared asset and 404 for a denied one out of the same readable store", async () => {
    const root = rootWithReadableRows([
      readableRowFor(CLEARED_ID),
      readableRowFor(WITHHELD_ID),
    ]);
    const handler = productionHandlerOver(root);
    // Preconditions, so neither half can pass on an empty cache or a made-up path: both rows really are on
    // disk and readable through the shipped reader, and the only fact that separates the two assets is the
    // gate. `derivativeUrl` is the URL a slot would have built, which is the URL being tested.
    expect(lineageFor(CLEARED_ID, root)?.sha256, CLEARED_ID).toBe(
      DELIVERED_DIGEST,
    );
    expect(lineageFor(WITHHELD_ID, root)?.sha256, WITHHELD_ID).toBe(
      DELIVERED_DIGEST,
    );
    expect(derivativeUrl(WITHHELD_ID)).toBe(`/api/media/${WITHHELD_ID}`);
    expect(decidePublicServing(need(WITHHELD_ID)).serve, WITHHELD_ID).toBe(
      false,
    );
    expect(decidePublicServing(need(CLEARED_ID)).serve, CLEARED_ID).toBe(true);

    const granted = await handler(
      requestFor({}, CLEARED_ID),
      context(CLEARED_ID),
    );
    expect(granted.status).toBe(200);
    expect(
      createHash("sha256")
        .update(new Uint8Array(await granted.arrayBuffer()))
        .digest("hex"),
    ).toBe(DELIVERED_DIGEST);

    const refused = await handler(
      requestFor({}, WITHHELD_ID),
      context(WITHHELD_ID),
    );
    expect(refused.status).toBe(404);
    expect([...refused.headers.keys()].sort()).toEqual([
      "cache-control",
      "x-content-type-options",
    ]);
    expect(refused.headers.get("cache-control")).toBe("no-store");
    expect(refused.headers.get("x-content-type-options")).toBe("nosniff");
    expect(refused.headers.get("etag")).toBeNull();
    expect(refused.headers.get("content-type")).toBeNull();
    expect(await refused.text()).toBe("");
  });

  it("serves an asset the store was merely missing, once its row and bytes are there", async () => {
    /*
     * The third partition, pinned to its cause. `NDM-AST-041` is gate-cleared and has no derivative in the
     * delivered store, so today it answers 404 — a *storage* state, not a rights state, and the distinction
     * is what the register's "authorised but not yet produced" row means. Drop a valid row and real bytes
     * for it into a store and the very same id answers 200, which is the evidence that the 404 the public
     * sees is not a hidden denial.
     */
    const unproduced = CLEARED_WITHOUT_BYTES[0];
    if (!unproduced)
      throw new Error("every cleared asset has a derivative; case is vacuous");
    expect(lineageFor(unproduced.assetId), unproduced.assetId).toBeNull();
    const root = rootWithReadableRows([readableRowFor(unproduced.assetId)]);
    expect(
      lineageFor(unproduced.assetId, root),
      unproduced.assetId,
    ).not.toBeNull();
    const response = await productionHandlerOver(root)(
      requestFor({}, unproduced.assetId),
      context(unproduced.assetId),
    );
    expect(response.status, unproduced.assetId).toBe(200);
    expect(response.headers.get("etag"), unproduced.assetId).toBe(
      `"${DELIVERED_DIGEST}"`,
    );
    await response.body?.cancel();
  });

  it("refuses a lineage row whose file escapes the store, and does not throw on the wire", async () => {
    // A cleared asset, so the gate lets the request reach the record: containment is the only thing between
    // this row and an arbitrary file read.
    const escaping = rootWithManifestText(
      JSON.stringify({
        ...manifestWith([]),
        derivatives: [
          { ...readableRowFor(CLEARED_ID), file: "../../../../.env" },
        ],
      }),
    );
    const response = await productionHandlerOver(escaping)(
      requestFor({}, CLEARED_ID),
      context(CLEARED_ID),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
    expect(await response.text()).toBe("");
    /*
     * Where the refusal comes from is asserted rather than assumed: `src/lib/server/media/derivative-store.ts`
     * rejects a `file` that climbs out of the store when the record is *read*, so through the shipped path
     * the throw happens before check 4 is reached and the handler's catch is what turns it into the 404
     * above. `serving.test.ts` pins the validator's own rejection and, over the dependency seam, the
     * `path_escapes_store` check that still guards a record that reached the checks. Both halves refuse;
     * neither serves — and the control two cases above shows the same asset does serve from a store whose
     * row stays inside.
     */
    expect(() => derivativeManifest(escaping)).toThrow();
    expect(existsSync(path.join(escaping, DERIVATIVE_STORE_DIR, ".env"))).toBe(
      false,
    );
  });

  it("refuses an id that is a lineage row for another asset", async () => {
    const root = rootWithReadableRows([readableRowFor(CLEARED_ID)]);
    const handler = productionHandlerOver(root);
    // Both assets are in the served partition, so this is not the gate speaking: the row is for
    // `CLEARED_ID`, and a cleared neighbour asking for those bytes gets nothing.
    expect(mayServe(need(OTHER_CLEARED_ID)), OTHER_CLEARED_ID).toBe(true);
    expect(lineageFor(OTHER_CLEARED_ID, root), OTHER_CLEARED_ID).toBeNull();
    const response = await handler(
      requestFor({}, OTHER_CLEARED_ID),
      context(OTHER_CLEARED_ID),
    );
    expect(response.status, OTHER_CLEARED_ID).toBe(404);
    expect(response.headers.get("etag"), OTHER_CLEARED_ID).toBeNull();
    expect(response.headers.get("cache-control"), OTHER_CLEARED_ID).toBe(
      "no-store",
    );
    await response.body?.cancel();
    // The control: the very same id, served by the delivered store through the production binding.
    const delivered = await mediaRoute.GET(
      requestFor({}, OTHER_CLEARED_ID),
      context(OTHER_CLEARED_ID),
    );
    expect(delivered.status, OTHER_CLEARED_ID).toBe(200);
    await delivered.body?.cancel();
  });

  it("emits no served-branch header where the row exists but the bytes do not", async () => {
    /*
     * `must-revalidate` and a quoted digest are what the `200` branch sends, and a manifest is not a file.
     * The store is git-ignored, so "row present, bytes absent" is the state every fresh checkout is in for
     * every asset — which makes this the branch that decides whether a deployment that forgot to build
     * derivatives leaks bytes or refuses. Rows for all 82 ids, no `.webp` beside them: nothing is served,
     * and the cleared ids are refused exactly as the denied ones are.
     */
    const root = rootWithManifest(
      manifestWith(register.map((asset) => lineageRow(asset.assetId))),
    );
    const handler = productionHandlerOver(root);
    for (const asset of register) {
      const response = await handler(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect(response.status, asset.assetId).toBe(404);
      expect(
        response.headers.get("cache-control"),
        asset.assetId,
      ).not.toContain("must-revalidate");
      expect(response.headers.get("cache-control"), asset.assetId).toBe(
        "no-store",
      );
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
      expect(
        existsSync(
          path.join(root, DERIVATIVE_STORE_DIR, `${asset.assetId}.webp`),
        ),
        asset.assetId,
      ).toBe(false);
      await response.body?.cancel();
    }
  });
});

describe("the bytes a visitor receives are the bytes the manifest recorded", () => {
  /*
   * Check 7 is the one the whole design rests on: the URL is not a capability, and the file behind it is not
   * trusted because a previous request hashed it. Until 4 November the branch could not be reached with real
   * assets, so the wire never showed the verification running — `serving.test.ts` proved it over the
   * dependency seam. These two cases read it at the HTTP level, through the shipped reader, against a store
   * this file creates and destroys.
   */
  it("refuses a derivative whose bytes were substituted after the manifest was written", async () => {
    const row = readableRowFor(CLEARED_ID);
    const root = rootWithReadableRows([row]);
    const handler = productionHandlerOver(root);
    const target = path.join(root, DERIVATIVE_STORE_DIR, row.file);
    // The control, on the same root and the same row: before the substitution the asset serves.
    const before = await handler(
      requestFor({}, CLEARED_ID),
      context(CLEARED_ID),
    );
    expect(before.status).toBe(200);
    await before.body?.cancel();

    // Same length, different content, so the size probe cannot be what stops it: only the digest can.
    const substitute = Buffer.from(DELIVERED_BYTES);
    substitute[0] = (substitute[0] ?? 0) ^ 0xff;
    expect(substitute.byteLength).toBe(DELIVERED_BYTES.byteLength);
    expect(existsSync(target)).toBe(true);
    writeFileSync(target, substitute);

    const after = await handler(
      requestFor({}, CLEARED_ID),
      context(CLEARED_ID),
    );
    expect(after.status).toBe(404);
    expect(after.headers.get("etag")).toBeNull();
    expect(after.headers.get("cache-control")).toBe("no-store");
    expect(await after.text()).toBe("");
  });

  it("refuses a derivative that is not the size the record says it is", async () => {
    // The sibling failure, measured rather than assumed: `bytes` is checked against the filesystem before
    // the file is read at all, so a lying record cannot make the endpoint pull an arbitrarily large file
    // into memory (SR-09). The substitute here is *smaller*, which is the direction that would otherwise be
    // caught only by the digest.
    const row = readableRowFor(CLEARED_ID);
    const root = rootWithReadableRows([row]);
    const handler = productionHandlerOver(root);
    writeFileSync(
      path.join(root, DERIVATIVE_STORE_DIR, row.file),
      Buffer.from(DELIVERED_BYTES.subarray(0, 512)),
    );
    const response = await handler(
      requestFor({}, CLEARED_ID),
      context(CLEARED_ID),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
    expect(await response.text()).toBe("");
  });
});

describe("the cache policy follows the decision, not the request", () => {
  it("forbids storing a refusal, in every input shape", async () => {
    for (const assetId of [WITHHELD_ID, "NDM-AST-083", "", "../../.env"]) {
      const response = await mediaRoute.GET(
        requestFor({}, assetId),
        context(assetId),
      );
      expect(response.headers.get("cache-control"), assetId).toBe("no-store");
      expect(response.headers.get("cache-control"), assetId).not.toContain(
        "public",
      );
      expect(response.headers.get("cache-control"), assetId).not.toContain(
        "max-age",
      );
      await response.body?.cancel();
    }
  });

  it("forbids storing every refused register id, and only those", async () => {
    /*
     * The two directions of one rule, measured over the whole register. A refusal must never be cached,
     * because a cached refusal would keep saying "there is nothing here" after the Owner cleared the
     * asset. A served derivative must never be told `no-store` either — that would be a correctness
     * argument backwards: `no-store` protects bytes the gate has not authorised, and these have been.
     */
    for (const asset of REFUSED) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect(response.headers.get("cache-control"), asset.assetId).toBe(
        "no-store",
      );
      await response.body?.cancel();
    }
    for (const asset of SERVED.slice(0, 10)) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect(
        response.headers.get("cache-control"),
        asset.assetId,
      ).not.toContain("no-store");
      await response.body?.cancel();
    }
  });

  it("declares no sniffing on a body-less response", async () => {
    const response = await mediaRoute.GET(requestFor(), context(WITHHELD_ID));
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("the served branch, through the handler factory", () => {
  /*
   * A controlled service, because instruction 9 asks for the response rules in isolation: the seven checks
   * and the record that clears them are `serving.test.ts`'s subject, and re-running them here would only
   * couple two files that answer different questions. This is no longer the only place a `200` is described
   * — the served partition above reads the same rules off the production binding and real bytes — but the
   * synthetic branch still earns its place: it is the only one that can be pointed at a validator this file
   * chooses, which is what the RFC 9110 table below needs.
   */
  const handler = mediaRoute.createMediaRouteHandler(
    serveSynthetic,
    openGuard(),
  );

  it("answers 200 with the bytes, the lineage mime and the digest as the validator", async () => {
    const response = await handler(
      requestFor({}, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("etag")).toBe(SYNTHETIC_TAG);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      SYNTHETIC_BYTES,
    );
  });

  it("marks a served derivative revalidable and never stale", async () => {
    // `public` is the point: the bytes are cleared, so a shared cache may hold them. `max-age=0,
    // must-revalidate` means every later visit asks the gate again, which is what keeps a withdrawn asset
    // from surviving in a CDN after its row changes. The refusal branch's `no-store` must not appear here.
    const response = await handler(
      requestFor({}, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=0, must-revalidate",
    );
    expect(response.headers.get("cache-control")).not.toContain("no-store");
    expect([...response.headers.keys()].sort()).toEqual([
      "cache-control",
      "content-type",
      "etag",
      "x-content-type-options",
    ]);
    await response.body?.cancel();
  });

  it("says nothing about the asset's rights, lineage or location in the served response", async () => {
    const response = await handler(
      requestFor({}, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    const wire = [
      String(response.status),
      ...response.headers.keys(),
      ...response.headers.values(),
    ].join(" ");
    for (const forbidden of [
      "rights_not_cleared",
      "gate_denied",
      DERIVATIVE_STORE_DIR,
      "lineage.json",
    ]) {
      expect(wire.toLowerCase(), forbidden).not.toContain(
        forbidden.toLowerCase(),
      );
    }
    await response.body?.cancel();
  });

  it("answers 304 with no body when the client holds the exact validator", async () => {
    const response = await handler(
      requestFor({ "if-none-match": SYNTHETIC_TAG }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.status).toBe(304);
    expect(response.body).toBeNull();
    expect(response.headers.get("etag")).toBe(SYNTHETIC_TAG);
    // The 304 repeats the validators so the client's stored copy stays refreshable; a 304 without the ETag
    // would force a second full download on the next visit.
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=0, must-revalidate",
    );
  });

  it("puts no content type on the 304, which has no representation to describe", async () => {
    const response = await handler(
      requestFor({ "if-none-match": SYNTHETIC_TAG }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.headers.get("content-type")).toBeNull();
    expect([...response.headers.keys()].sort()).toEqual([
      "cache-control",
      "etag",
      "x-content-type-options",
    ]);
  });

  it.each([
    ["a digest of different bytes", `"${"f".repeat(64)}"`],
    ["an unquoted digest", SYNTHETIC_DIGEST],
    ["a stale tag from an earlier build", ENTITY_TAG],
    ["an empty validator", ""],
  ])("serves the bytes again when the client sends %s", async (_label, tag) => {
    // Correct behaviour: the client's copy is not current, so the current representation is transferred.
    const response = await handler(
      requestFor({ "if-none-match": tag }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.status).toBe(200);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      SYNTHETIC_BYTES,
    );
  });

  it.each([
    ["the wildcard", "*"],
    ["the weak form of the current tag", `W/${SYNTHETIC_TAG}`],
    ["a list whose last member is current", `${ENTITY_TAG}, ${SYNTHETIC_TAG}`],
    ["a list of weak members", `W/"${"f".repeat(64)}", W/${SYNTHETIC_TAG}`],
  ])(
    "answers 304 to %s, which is what RFC 9110 requires",
    async (_label, tag) => {
      /*
       * SR-07, and the case this file pinned as an open deviation until 2 November 2026. RFC 9110 §13.1.2
       * evaluates `If-None-Match` as a negative condition and states, verbatim, that "If the field value is
       * '*', the condition is false if the origin server has a current representation for the target
       * resource" — and a false condition is what an origin server "MUST NOT perform the requested method"
       * for, answering 304 to a GET (§13.1.2, §15.4.5). The same section makes the comparison function a MUST
       * rather than a choice: "A recipient MUST use the weak comparison function when comparing entity tags
       * for If-None-Match", and §8.8.3.2 defines that function as opaque-tag equality "regardless of either or
       * both being tagged as weak". Rule 2 extends the same match to any member of a list value.
       *
       * The shipped code performed an exact string comparison against the quoted strong tag, so each of these
       * four re-transferred. The consequence was bandwidth and not disclosure — a cleared derivative is public
       * either way — which is why it was recorded rather than silently redefined as expected behaviour. This
       * case is the direction the register asked for: the requirement is asserted, the implementation now
       * meets it.
       */
      const response = await handler(
        requestFor({ "if-none-match": tag }, SYNTHETIC_ID),
        context(SYNTHETIC_ID),
      );
      expect(response.status).toBe(304);
      expect(response.body).toBeNull();
      // RFC 9111 §4.3.4: the 304 carries the validators of the current representation, so the client's stored
      // copy remains refreshable.
      expect(response.headers.get("etag")).toBe(SYNTHETIC_TAG);
    },
  );

  it("adds nothing to the conditional that the 200 would not have said", async () => {
    // The 304 must not become a channel for a second answer: same headers as the 200, minus the
    // `Content-Type` that describes a body it does not carry.
    const conditional = await handler(
      requestFor({ "if-none-match": `W/${SYNTHETIC_TAG}` }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(conditional.headers.get("content-type")).toBeNull();
    expect([...conditional.headers.keys()].sort()).toEqual([
      "cache-control",
      "etag",
      "x-content-type-options",
    ]);
  });

  it("reads a comma inside a quoted entity tag as part of the tag, not as a separator", async () => {
    // The list is scanned, not split: `"a,b"` is one opaque value under §8.8.3's ABNF, and a naive
    // `split(",")` would turn it into two malformed members — a safe answer of 200, but a wrong parse.
    // A tag this route could not have emitted is therefore not what is being tested; the scanner is.
    const quoted = `"${SYNTHETIC_DIGEST.slice(0, 8)},x"`;
    const response = await handler(
      requestFor({ "if-none-match": `${quoted}, ${ENTITY_TAG}` }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.status).toBe(200);
    await response.body?.cancel();
  });

  it("refuses a conditional request for an id the controlled service does not serve", async () => {
    // The branch order, on the wire: the service answers before the handler ever looks at a validator, so
    // no conditional can produce a 304 — let alone a cached copy — for an unknown asset.
    const unknown = "NDM-AST-083";
    const response = await handler(
      requestFor({ "if-none-match": SYNTHETIC_TAG }, unknown),
      context(unknown),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("");
  });

  it("emits no served-branch header for a refusal, through the same handler", async () => {
    /*
     * `serveSynthetic` knows nothing about the register, so a cleared asset is a refusal here — and that is
     * the point being pinned: the handler does not read rights, the service does. Whatever the service
     * answers, a refusal gets exactly the two refusal headers and nothing else, for a withheld id, a cleared
     * id, an unregistered id and a malformed one alike.
     */
    const shapes = new Set<string>();
    for (const assetId of [
      WITHHELD_ID,
      CLEARED_ID,
      "NDM-AST-083",
      "",
      "../../.env",
    ]) {
      const response = await handler(requestFor({}, assetId), context(assetId));
      expect(response.status, assetId).toBe(404);
      shapes.add(JSON.stringify([...response.headers.entries()].sort()));
    }
    expect([...shapes]).toEqual([REFUSAL_HEADERS]);
  });
});

describe("the conditional comparison on its own terms (SR-07)", () => {
  /*
   * The same function the handler calls, read without a `Response` in the way. These are the RFC's own
   * rules — §13.1.2's three evaluation steps and the weak comparison function §8.8.3.2 defines — stated as
   * pairs rather than as statuses, so a future change to the response shape cannot hide a change to the
   * comparison. `CURRENT` is the tag the route emits: strong, quoted, the derivative's digest.
   */
  const CURRENT = SYNTHETIC_TAG;

  it("matches only on the opaque tag, ignoring weakness on either side", () => {
    // RFC 9110 §13.1.2: "A recipient MUST use the weak comparison function when comparing entity tags for
    // If-None-Match." §8.8.3.2: opaque equality "regardless of either or both being tagged as weak".
    expect(mediaRoute.conditionalRepresentationMatches(CURRENT, CURRENT)).toBe(
      true,
    );
    expect(
      mediaRoute.conditionalRepresentationMatches(`W/${CURRENT}`, CURRENT),
    ).toBe(true);
    expect(
      mediaRoute.conditionalRepresentationMatches(CURRENT, `W/${CURRENT}`),
    ).toBe(true);
  });

  it("matches a list on any member, per §13.1.2 rule 2", () => {
    const other = `"${"f".repeat(64)}"`;
    expect(
      mediaRoute.conditionalRepresentationMatches(
        `${other}, ${CURRENT}`,
        CURRENT,
      ),
    ).toBe(true);
    expect(
      mediaRoute.conditionalRepresentationMatches(
        `${CURRENT} ,${other}`,
        CURRENT,
      ),
    ).toBe(true);
    expect(
      mediaRoute.conditionalRepresentationMatches(`${other},${other}`, CURRENT),
    ).toBe(false);
  });

  it("answers the wildcard from the presence of a current validator, per §13.1.2 rule 1", () => {
    // The condition is false — so it matches — whenever the origin server has a current representation, and
    // this function is only reached for one. Whitespace around the field value does not change that.
    expect(mediaRoute.conditionalRepresentationMatches("*", CURRENT)).toBe(
      true,
    );
    expect(mediaRoute.conditionalRepresentationMatches(" * ", CURRENT)).toBe(
      true,
    );
  });

  it("answers rule 3 — no match, so transfer — for anything that is not an entity tag", () => {
    // Every one of these is a *safe* direction: false here means a `200` and a re-transfer, never a `304`
    // asserting that a client holds bytes it does not hold.
    const notTags = [
      SYNTHETIC_DIGEST, // unquoted: not an `opaque-tag`
      "", // empty field value
      '""', // an empty opaque tag, which is not this representation's tag
      `"${SYNTHETIC_DIGEST.slice(0, 62)}`, // unterminated quote
      "W/", // weakness indicator with no tag after it
      `"${"z".repeat(64)}"`, // well formed, and not the current tag
      '"a\\"b"', // a quoted-pair, which this parser rejects rather than unescapes
    ];
    for (const value of notTags) {
      expect(
        mediaRoute.conditionalRepresentationMatches(value, CURRENT),
        value,
      ).toBe(false);
    }
    expect(mediaRoute.conditionalRepresentationMatches(null, CURRENT)).toBe(
      false,
    );
    // A current validator this function cannot parse is no validator at all: match nothing, transfer.
    expect(
      mediaRoute.conditionalRepresentationMatches(CURRENT, SYNTHETIC_DIGEST),
    ).toBe(false);
  });

  it("keeps a comma inside a quoted tag out of the list scan", () => {
    const withComma = `"${SYNTHETIC_DIGEST.slice(0, 8)},x"`;
    expect(
      mediaRoute.conditionalRepresentationMatches(withComma, CURRENT),
    ).toBe(false);
    expect(
      mediaRoute.conditionalRepresentationMatches(
        `${withComma}, ${CURRENT}`,
        CURRENT,
      ),
    ).toBe(true);
  });
});

describe("a serving decision that throws is withheld, not answered (6.8)", () => {
  /**
   * A service that fails the way a corrupt private store fails: after the register and the gate.
   *
   * This state is reachable in production now, and it was not when this file was written: 45 assets clear
   * the gate, so `lineage.json` is opened and its rows are read on their requests, and a record the shipped
   * validator rejects makes `serveDerivative` throw rather than refuse. The store block above measures that
   * real path end to end through the shipped reader; this block measures the handler's half of it — that a
   * throw, from any cause, is mapped to the byteless `404` and not to a `500` — against the seam, because
   * the route's contract must not depend on an ordering that lives in another module. §6.8's row lists "any
   * handler mapping for the API routes" as owed: this is the first API route, and the detail goes to the log
   * while the client learns nothing.
   */
  function throwingServer(cause: Error): mediaRoute.DerivativeServer {
    return async (assetId: string): Promise<ServingOutcome> => {
      throw new Error(`${cause.message} (while deciding ${assetId})`);
    };
  }

  it("answers the refusal shape, not a 500, and echoes none of the cause", async () => {
    // Captured as strings rather than read back off the spy's call array: `console.error` is typed
    // `(...data: any[])`, and a test that destructured `any` to make its point would be asserting nothing.
    // The id is one the endpoint normally serves: a cleared asset whose decision fails is withheld, exactly
    // as an uncleared one is, and the client cannot tell a failure from a refusal.
    const lines: string[] = [];
    const logged = vi
      .spyOn(console, "error")
      .mockImplementation((...data: unknown[]) => {
        lines.push(data.map((part) => String(part)).join(" "));
      });
    try {
      const handler = mediaRoute.createMediaRouteHandler(
        throwingServer(
          new Error("lineage.json at E:\\no\\media-derivatives is corrupt"),
        ),
        openGuard(),
      );
      const response = await handler(
        requestFor({}, CLEARED_ID),
        context(CLEARED_ID),
      );
      expect(response.status).toBe(404);
      expect([...response.headers.keys()].sort()).toEqual([
        "cache-control",
        "x-content-type-options",
      ]);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.text()).toBe("");
      // One log line, carrying the cause; and none of it on the wire, in any header or in the body.
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain("withheld");
      expect(lines[0]).toContain("corrupt");
    } finally {
      logged.mockRestore();
    }
  });

  it("is indistinguishable from an ordinary refusal, even against a conditional", async () => {
    /*
     * The stronger form of "no partial answer", and the one that matters now that some assets serve: a
     * decision that fails for a *cleared* asset must look exactly like a policy refusal for a denied one —
     * same status, header set and body — with a conditional attached that a `served` outcome would have
     * turned into a 304. A throw must not become a second, distinguishable answer on the wire, because an
     * operator's outage would otherwise be readable by anyone as a signal about which assets are clear.
     */
    const logged = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      const throwing = mediaRoute.createMediaRouteHandler(
        throwingServer(new Error("disk unavailable")),
        openGuard(),
      );
      const refusing = mediaRoute.createMediaRouteHandler(
        serveSynthetic,
        openGuard(),
      );
      const broken = await throwing(
        requestFor({ "if-none-match": "*" }, CLEARED_ID),
        context(CLEARED_ID),
      );
      const withheldByPolicy = await refusing(
        requestFor({ "if-none-match": "*" }, CLEARED_ID),
        context(CLEARED_ID),
      );
      expect(await fingerprint(broken)).toBe(
        await fingerprint(withheldByPolicy),
      );
      const productionRefusal = await fingerprint(
        await mediaRoute.GET(
          requestFor({ "if-none-match": "*" }, WITHHELD_ID),
          context(WITHHELD_ID),
        ),
      );
      const brokenAgainstRegister = await throwing(
        requestFor({ "if-none-match": "*" }, WITHHELD_ID),
        context(WITHHELD_ID),
      );
      expect(await fingerprint(brokenAgainstRegister)).toBe(productionRefusal);
    } finally {
      logged.mockRestore();
    }
  });
});

describe("the request limit is enforced before the endpoint does any work (SR-04)", () => {
  /** A service that records every call it receives, so "the work did not happen" is a measurement. */
  function recordingServer(): {
    readonly asked: string[];
    readonly serve: mediaRoute.DerivativeServer;
  } {
    const asked: string[] = [];
    return {
      asked,
      serve: async (assetId: string): Promise<ServedDerivative> => {
        asked.push(assetId);
        return SYNTHETIC_SERVED;
      },
    };
  }

  function limitedGuard(now: () => number): {
    guard: RequestLimitGuard;
    service: ReturnType<typeof recordingServer>;
  } {
    const service = recordingServer();
    const guard = createRequestLimitGuard(
      {
        capacity: 2,
        maxTrackedClients: 10,
        refillPerSecond: 1,
        trustedProxyHops: 0,
      },
      { now, salt: "limit-test" },
    );
    return { guard, service };
  }

  const PINNED = { "x-forwarded-for": "203.0.113.201" };

  it("lets a client spend its allowance and paces it after that, answering 429 with no body", async () => {
    const clock = createManualClock();
    const { guard, service } = limitedGuard(clock.now);
    const handler = mediaRoute.createMediaRouteHandler(service.serve, guard);

    const first = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    const second = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect([first.status, second.status]).toEqual([200, 200]);
    await first.body?.cancel();
    await second.body?.cancel();

    const third = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(third.status).toBe(429);
    expect(third.ok).toBe(false);
    expect(await third.text()).toBe("");
    expect(third.headers.get("retry-after")).toBe("1");
    expect(third.headers.get("cache-control")).toBe("no-store");
    expect(third.headers.get("x-content-type-options")).toBe("nosniff");
    expect(third.headers.get("etag")).toBeNull();
    expect(third.headers.get("content-type")).toBeNull();
  });

  it("refuses without asking the service at all, which is the half that makes it a resource limit", async () => {
    const clock = createManualClock();
    const { guard, service } = limitedGuard(clock.now);
    const handler = mediaRoute.createMediaRouteHandler(service.serve, guard);

    await (
      await handler(requestFor(PINNED, SYNTHETIC_ID), context(SYNTHETIC_ID))
    ).body?.cancel();
    await (
      await handler(requestFor(PINNED, SYNTHETIC_ID), context(SYNTHETIC_ID))
    ).body?.cancel();
    expect(service.asked).toEqual([SYNTHETIC_ID, SYNTHETIC_ID]);

    const denied = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(denied.status).toBe(429);
    // The register was not read, the store was not opened, no bytes were hashed. A refusal that still did
    // the work would protect nothing, which is why this assertion is the point of the block.
    expect(service.asked).toHaveLength(2);
  });

  it("publishes no bucket internals on the denial", async () => {
    const clock = createManualClock();
    const { guard, service } = limitedGuard(clock.now);
    const handler = mediaRoute.createMediaRouteHandler(service.serve, guard);
    // Spend the bucket, then read the denial's header names: two grants, one refusal.
    for (let index = 0; index < 2; index += 1) {
      const response = await handler(
        requestFor(PINNED, SYNTHETIC_ID),
        context(SYNTHETIC_ID),
      );
      await response.body?.cancel();
    }
    const keys = [] as string[];
    const denial = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    for (const key of denial.headers.keys()) keys.push(key);
    expect([...keys].sort()).toEqual([
      "cache-control",
      "retry-after",
      "x-content-type-options",
    ]);
  });

  it("says nothing about the asset, the store or the reason in a denial", async () => {
    const clock = createManualClock();
    const { guard, service } = limitedGuard(clock.now);
    const handler = mediaRoute.createMediaRouteHandler(service.serve, guard);
    for (let index = 0; index < 3; index += 1) {
      const warm = await handler(
        requestFor(PINNED, SYNTHETIC_ID),
        context(SYNTHETIC_ID),
      );
      await warm.body?.cancel();
    }
    const response = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    const wire = [
      String(response.status),
      ...response.headers.keys(),
      ...response.headers.values(),
      await response.text(),
    ].join(" ");
    for (const forbidden of [...FORBIDDEN_STRINGS, SYNTHETIC_ID]) {
      expect(wire.toLowerCase(), forbidden).not.toContain(
        forbidden.toLowerCase(),
      );
    }
  });

  it("does not let a conditional request turn a denial into a 304", async () => {
    // The standing rule from the refusal blocks, applied to the new one: a `304` asserts the client holds a
    // current representation. A paced client that happens to send the right validator gets a `429`, because
    // the endpoint is not transferring that representation now.
    const clock = createManualClock();
    const { guard, service } = limitedGuard(clock.now);
    const handler = mediaRoute.createMediaRouteHandler(service.serve, guard);
    await (
      await handler(requestFor(PINNED, SYNTHETIC_ID), context(SYNTHETIC_ID))
    ).body?.cancel();
    await (
      await handler(requestFor(PINNED, SYNTHETIC_ID), context(SYNTHETIC_ID))
    ).body?.cancel();

    const response = await handler(
      requestFor({ ...PINNED, "if-none-match": SYNTHETIC_TAG }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("etag")).toBeNull();
    expect(service.asked).toHaveLength(2);
  });

  it("paces one client and not the neighbours behind the same endpoint", async () => {
    const clock = createManualClock();
    const { guard, service } = limitedGuard(clock.now);
    const handler = mediaRoute.createMediaRouteHandler(service.serve, guard);
    await (
      await handler(requestFor(PINNED, SYNTHETIC_ID), context(SYNTHETIC_ID))
    ).body?.cancel();
    await (
      await handler(requestFor(PINNED, SYNTHETIC_ID), context(SYNTHETIC_ID))
    ).body?.cancel();
    const denied = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(denied.status).toBe(429);

    const neighbour = await handler(
      requestFor({ "x-forwarded-for": "203.0.113.202" }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(neighbour.status).toBe(200);
    await neighbour.body?.cancel();
  });

  it("lets the client back when the bucket refills, at the rate the policy declares", async () => {
    const clock = createManualClock();
    const { guard, service } = limitedGuard(clock.now);
    const handler = mediaRoute.createMediaRouteHandler(service.serve, guard);
    for (let index = 0; index < 3; index += 1) {
      await (
        await handler(requestFor(PINNED, SYNTHETIC_ID), context(SYNTHETIC_ID))
      ).body?.cancel();
    }
    const stillPaced = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(stillPaced.status).toBe(429);

    // One token per second: 900 ms is not yet a request, 1000 ms is. Against a real clock this pair of
    // assertions would be a sleep, and a sleep proves only that time passed.
    clock.advance(900);
    const almost = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(almost.status).toBe(429);
    clock.advance(100);
    const restored = await handler(
      requestFor(PINNED, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(restored.status).toBe(200);
    await restored.body?.cancel();
    expect(service.asked).toHaveLength(3);
  });

  it("keeps an anonymous crowd in one shared bucket rather than giving each of them a fresh allowance", async () => {
    const clock = createManualClock();
    const { guard, service } = limitedGuard(clock.now);
    const handler = mediaRoute.createMediaRouteHandler(service.serve, guard);
    // Two requests with no address at all are the same client to this process, so the third is paced. The
    // alternative — skip the limit when the caller is unidentifiable — is the fail-open direction SR-04
    // exists to close.
    await (
      await handler(
        new Request(`http://localhost:3000/api/media/${SYNTHETIC_ID}`),
        context(SYNTHETIC_ID),
      )
    ).body?.cancel();
    await (
      await handler(
        new Request(`http://localhost:3000/api/media/${SYNTHETIC_ID}`),
        context(SYNTHETIC_ID),
      )
    ).body?.cancel();
    const third = await handler(
      new Request(`http://localhost:3000/api/media/${SYNTHETIC_ID}`),
      context(SYNTHETIC_ID),
    );
    expect(third.status).toBe(429);
  });
});

describe("nothing outside the served partition reaches the served branch", () => {
  /*
   * The closure instruction 9 asks for, stated as the boundary it really is. The blocks above describe each
   * answer; this one describes the *exhaustive mapping*: for the production binding, an id is answered with
   * bytes if and only if it is in the partition derived from the gate and the delivered store, and every
   * other id — cleared but unproduced, denied, unregistered, malformed — gets the byteless 404. A fixture
   * outside the register still cannot get a `200` through the seam built for testing the served branch,
   * because the seam is bound to the same `serveDerivative` the route uses.
   */
  it("answers with bytes for exactly the served partition, and the refusal for everything else", async () => {
    const servedByWire: string[] = [];
    const refusalShapes = new Set<string>();
    for (const asset of register) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      if (response.status === 200) {
        servedByWire.push(asset.assetId);
        const row = rowFor(asset.assetId);
        expect(response.headers.get("etag"), asset.assetId).toBe(
          `"${row.sha256}"`,
        );
        await response.body?.cancel();
      } else {
        expect(response.status, asset.assetId).toBe(404);
        expect(response.headers.get("cache-control"), asset.assetId).toBe(
          "no-store",
        );
        expect(response.headers.get("etag"), asset.assetId).toBeNull();
        expect(response.headers.get("content-type"), asset.assetId).toBeNull();
        refusalShapes.add(
          JSON.stringify([...response.headers.entries()].sort()),
        );
        await response.body?.cancel();
      }
    }
    expect(servedByWire.sort()).toEqual([...SERVED_IDS].sort());
    expect([...refusalShapes]).toEqual([REFUSAL_HEADERS]);
  });

  it("answers 404 through the production GET for the id the controlled service serves", async () => {
    const response = await mediaRoute.GET(
      requestFor({}, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
    expect(response.headers.get("content-type")).toBeNull();
    expect(await response.text()).toBe("");
  });

  it("answers 404 through the factory bound to `serveDerivative` for the same id", async () => {
    // The fixture is not a register row, so check 1 stops it before the gate — the synthetic approval has
    // no path onto the wire even through the seam that was built for testing it.
    const handler = mediaRoute.createMediaRouteHandler(
      serveDerivative,
      openGuard(),
    );
    const response = await handler(
      requestFor({}, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("keeps a complete on-disk lineage from producing a served answer for a denied asset", async () => {
    /*
     * The strongest input available short of editing the register: a validator-accepted lineage row for all
     * 82 ids, sitting in a store the shipped reader accepts. Since SR-10 this is a file rather than an
     * injected object, which makes the case stronger, not weaker. Before the 4 November declaration this
     * case proved "nothing is served"; it now proves the narrower and still load-bearing thing — that the
     * 37 ids outside the served partition stay outside it however complete the store looks. Check 2 runs
     * first for the denied ones, and the missing file stops the cleared ones, so the store alone never
     * produces bytes.
     */
    const root = rootWithManifest(
      manifestWith(register.map((asset) => lineageRow(asset.assetId))),
    );
    const handler = productionHandlerOver(root);
    for (const asset of REFUSED) {
      const response = await handler(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect(response.status, asset.assetId).toBe(404);
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
      await response.body?.cancel();
    }
  });
});
