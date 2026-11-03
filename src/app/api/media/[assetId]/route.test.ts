/**
 * src/app/api/media/[assetId]/route.test.ts — what a visitor may learn from a media request: nothing.
 *
 * `src/lib/server/media/serving.ts` decides; this file tests the shape of the answer that decision is
 * allowed to have on the wire, because the decision itself is asserted there. Three claims hold the
 * endpoint together and each is checked here in its own block: a refusal is a `404` and never a `403`
 * (a `403` would confirm to anyone who can guess an id that the id is real, derived and withheld); it is
 * byte-for-byte indistinguishable from the refusal of an id that has never existed; and it carries no
 * reason, no digest, no filesystem path, no content type and no cache validator.
 *
 * The handler has two branches, and they are tested in two different ways because they answer two
 * different questions. `mediaRoute.GET` is the production binding — `serveDerivative`, the real register,
 * the real gate, the real limiter — and every case above it asserts that it answers `404` for all 82
 * catalogued assets, which is measured, not assumed. `createMediaRouteHandler(serve, limits)` is the seam
 * STEP 9 added and SR-04 widened: the same response logic over an explicit serving service *and* an
 * explicit guard, so the `200`/`304` branch can be asserted for what it is — a mapping from an outcome to a
 * status, headers and bytes — and so a paced client can be tested against a manual clock instead of against
 * a sleep. Two services are handed to it here. The controlled one answers the served branch for a synthetic
 * id, so the response rules are read in isolation; the other is `serveDerivative` itself, pointed at a
 * temporary root, so the store cases below run the shipped reader and gate rather than a stand-in. The
 * seven checks and the synthetic cleared record that gets a `served` outcome at all are tested in
 * `src/lib/server/media/serving.test.ts`. Nothing in this file is evidence that a catalogued asset can
 * receive a `200`: the last block asserts the opposite, that the production handler answers `404` for the
 * same synthetic id the fixture clears.
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
 * git-ignored private store. Creating it would write into the tree and would falsify the measured pin in
 * `slots.test.ts` that the pipeline has never run, and the refusal path never reaches the manifest anyway
 * — check 2 runs first — so the covered claim is the one that matters for the wire: no reachable input
 * makes the production handler answer anything but 404. What a *throwing* decision answers with is asserted
 * separately, against a service that throws, because the handler must not depend on that ordering staying
 * put in another module.
 */

import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import * as mediaRoute from "@/app/api/media/[assetId]/route";
import { afterEach, describe, expect, it, vi } from "vitest";

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

const register = assetRegister();
const FIRST_ASSET_ID = "NDM-AST-001";
const ENTITY_TAG = `"${"a".repeat(64)}"`;

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
  "file_unreadable",
  "digest_mismatch",
  DERIVATIVE_STORE_DIR,
  "Noujoude.photo",
  "sha256",
  "webp",
  "lineage.json",
  ".env",
];

interface RouteContext {
  readonly params: Promise<{ assetId?: string }>;
}

function context(assetId?: string): RouteContext {
  return { params: Promise.resolve(assetId === undefined ? {} : { assetId }) };
}

function requestFor(
  headers: HeadersInit = {},
  assetId: string = FIRST_ASSET_ID,
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

/** A well-formed lineage record for one asset, for the cases that must prove the store is not the gate. */
function manifestFor(assetId: string): DerivativeManifest {
  return {
    derivatives: [lineageRow(assetId)],
    generatedAt: "2026-11-02T00:00:00.000Z",
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
    // served-branch cases below describe the shipped handler's behaviour once a real record clears, not
    // the behaviour of a stand-in. Four inputs, one refused-by-register, one unknown, one malformed, one
    // withheld real id, compared as full fingerprints.
    const production = mediaRoute.createMediaRouteHandler(
      serveDerivative,
      openGuard(),
    );
    for (const assetId of [FIRST_ASSET_ID, "NDM-AST-083", "../../.env", ""]) {
      const left = await fingerprint(
        await mediaRoute.GET(requestFor(), context(assetId)),
      );
      const right = await fingerprint(
        await production(requestFor(), context(assetId)),
      );
      expect(right, assetId).toBe(left);
    }
  });
});

describe("every catalogued asset is withheld", () => {
  it("refuses all 82 register ids with 404, an empty body and no validator", async () => {
    for (const asset of register) {
      const response = await mediaRoute.GET(
        requestFor(),
        context(asset.assetId),
      );
      expect(response.status, asset.assetId).toBe(404);
      expect(response.ok).toBe(false);
      expect(await response.text(), asset.assetId).toBe("");
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
      expect(response.headers.get("content-type"), asset.assetId).toBeNull();
    }
  });

  it("sends exactly the two refusal headers on all 82", async () => {
    const shapes = new Set<string>();
    for (const asset of register) {
      const response = await mediaRoute.GET(
        requestFor(),
        context(asset.assetId),
      );
      shapes.add(JSON.stringify([...response.headers.entries()].sort()));
    }
    expect([...shapes]).toEqual([
      '[["cache-control","no-store"],["x-content-type-options","nosniff"]]',
    ]);
  });

  it("never answers 403 for a real id it is withholding", async () => {
    // The distinction is the disclosure rule: 403 means "you are not allowed this known thing", 404 means
    // "there is nothing here". Only the second is safe to say to an anonymous caller.
    for (const asset of register.slice(0, 12)) {
      const response = await mediaRoute.GET(
        requestFor(),
        context(asset.assetId),
      );
      expect([401, 403]).not.toContain(response.status);
      expect(response.status).toBe(404);
    }
  });

  it("leaks no reason, no path and no digest into status, headers or body", async () => {
    const response = await mediaRoute.GET(
      requestFor(),
      context(FIRST_ASSET_ID),
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
});

describe("a withheld asset and an imaginary one cannot be told apart", () => {
  it("fingerprint-matches a real withheld id, an unregistered id and a malformed id", async () => {
    const withheld = await fingerprint(
      await mediaRoute.GET(requestFor(), context(FIRST_ASSET_ID)),
    );
    for (const id of [
      "NDM-AST-083",
      "ndm-ast-001",
      `${FIRST_ASSET_ID}.webp`,
      "../../.env",
      "",
    ]) {
      const response = await mediaRoute.GET(requestFor(), context(id));
      expect(await fingerprint(response), id).toBe(withheld);
    }
  });

  it("answers the same for a missing parameter as for a withheld asset", async () => {
    expect(
      await fingerprint(await mediaRoute.GET(requestFor(), context())),
    ).toBe(
      await fingerprint(
        await mediaRoute.GET(requestFor(), context(FIRST_ASSET_ID)),
      ),
    );
  });
});

describe("malformed and missing path parameters", () => {
  it.each([
    ["no assetId key at all", undefined],
    ["an empty string", ""],
    ["whitespace only", "   "],
    ["a tab and newline", "\t\n"],
    ["a traversal-shaped id", "../../.env"],
    ["a percent-encoded traversal", "%2e%2e%2f%2eenv"],
    ["a filename rather than an id", `${FIRST_ASSET_ID}.webp`],
    ["a register id in lower case", FIRST_ASSET_ID.toLowerCase()],
    ["a register id with a suffix", `${FIRST_ASSET_ID}-copy`],
    [
      "a path prefix that lands in the store",
      `../media-derivatives/${FIRST_ASSET_ID}.webp`,
    ],
  ])("refuses %s without throwing or reading", async (_label, assetId) => {
    const response = await mediaRoute.GET(requestFor(), context(assetId));
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
  ];
  it.each(conditionals)(
    "still answers 404 when the client sends %s",
    async (_label, headers) => {
      // A `304` asserts that the client already holds a representation of this resource. For a withheld
      // derivative that is false, and it would also let a cache keep bytes the gate has not authorised.
      const response = await mediaRoute.GET(
        requestFor(headers),
        context(FIRST_ASSET_ID),
      );
      expect(response.status).toBe(404);
      expect(response.headers.get("etag")).toBeNull();
      expect(await response.text()).toBe("");
    },
  );
});

describe("the private store is not a capability", () => {
  it("refuses the URL the lineage record would answer on, with the lineage present", async () => {
    const root = rootWithManifest(manifestFor(FIRST_ASSET_ID));
    const handler = productionHandlerOver(root);
    // The preconditions, so the assertions below cannot pass on an empty cache or a made-up path: the
    // manifest really does describe this asset *on disk and through the shipped reader*, and the segment
    // requested is the one `derivativeUrl` builds — the exact URL a slot would have shipped if the gate had
    // let it get that far.
    expect(
      derivativeManifest(root)?.derivatives.map((row) => row.assetId),
    ).toEqual([FIRST_ASSET_ID]);
    expect(derivativeUrl(FIRST_ASSET_ID)).toBe(`/api/media/${FIRST_ASSET_ID}`);

    const response = await handler(requestFor(), context(FIRST_ASSET_ID));
    expect(response.status).toBe(404);
    expect([...response.headers.keys()].sort()).toEqual([
      "cache-control",
      "x-content-type-options",
    ]);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("etag")).toBeNull();
    expect(response.headers.get("content-type")).toBeNull();
    expect(await response.text()).toBe("");
  });

  it("refuses a lineage row whose file escapes the store, and does not throw on the wire", async () => {
    const escaping = rootWithManifestText(
      JSON.stringify({
        ...manifestFor(FIRST_ASSET_ID),
        derivatives: [
          { ...lineageRow(FIRST_ASSET_ID), file: "../../../../.env" },
        ],
      }),
    );
    const response = await productionHandlerOver(escaping)(
      requestFor(),
      context(FIRST_ASSET_ID),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
    expect(await response.text()).toBe("");
    /*
     * Where the refusal comes from is the part that changed with SR-10, and it is asserted rather than
     * assumed: `src/lib/server/media/derivative-store.ts` rejects a `file` that climbs out of the store
     * when the record is *read*, so through the shipped path the throw happens before check 4 is reached
     * and the handler's catch is what turns it into the 404 above. `serving.test.ts` pins the validator's
     * own rejection and, over the dependency seam, the `path_escapes_store` check that still guards a
     * record that reached the checks. Both halves refuse; neither serves.
     */
    expect(() => derivativeManifest(escaping)).toThrow();
  });

  it("refuses an id that is a lineage row for another asset", async () => {
    const root = rootWithManifest(manifestFor(FIRST_ASSET_ID));
    const response = await productionHandlerOver(root)(
      requestFor(),
      context("NDM-AST-002"),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
  });

  it("emits no served-branch header for any store record", async () => {
    // `must-revalidate` and a quoted digest are what the `200` branch sends. Their absence across the whole
    // register, with a well-formed lineage row on disk for every one of the 82 ids, is the measured form of
    // "no bytes served".
    const root = rootWithManifest({
      ...manifestFor(FIRST_ASSET_ID),
      derivatives: register.map((asset) => lineageRow(asset.assetId)),
    });
    const handler = productionHandlerOver(root);
    for (const asset of register) {
      const response = await handler(requestFor(), context(asset.assetId));
      expect(response.status, asset.assetId).toBe(404);
      expect(
        response.headers.get("cache-control"),
        asset.assetId,
      ).not.toContain("must-revalidate");
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
    }
  });
});

describe("the refusal cache policy", () => {
  it("forbids storing the response, in every input shape", async () => {
    for (const assetId of [FIRST_ASSET_ID, "NDM-AST-083", "", "../../.env"]) {
      const response = await mediaRoute.GET(requestFor(), context(assetId));
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("cache-control")).not.toContain("public");
      expect(response.headers.get("cache-control")).not.toContain("max-age");
    }
  });

  it("declares no sniffing on a body-less response", async () => {
    const response = await mediaRoute.GET(
      requestFor(),
      context(FIRST_ASSET_ID),
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("the served branch, through the handler factory", () => {
  // A controlled service, because instruction 9 asks for the response rules in isolation: the six checks
  // and the record that clears them are `serving.test.ts`'s subject, and re-running them here would only
  // couple two files that answer different questions. Nothing in this block is evidence that a catalogued
  // asset can receive a `200` — the block after it measures that none can.
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
    const shapes = new Set<string>();
    for (const assetId of [FIRST_ASSET_ID, "NDM-AST-083", "", "../../.env"]) {
      const response = await handler(requestFor({}, assetId), context(assetId));
      expect(response.status, assetId).toBe(404);
      shapes.add(JSON.stringify([...response.headers.entries()].sort()));
    }
    expect([...shapes]).toEqual([
      '[["cache-control","no-store"],["x-content-type-options","nosniff"]]',
    ]);
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
   * No input reaches this state through production today — `src/lib/server/media/serving.test.ts` pins that
   * check 2 refuses every register asset before `lineage.json` is opened — so the mapping is asserted
   * against the seam rather than against the delivered store. It is asserted because the route's contract
   * ("a request that does not get authorised bytes gets the byteless 404") must not depend on an ordering
   * that lives in another module, and because §6.8's row lists "any handler mapping for the API routes" as
   * owed: this is the first API route, and the detail goes to the log while the client learns nothing.
   */
  function throwingServer(cause: Error): mediaRoute.DerivativeServer {
    return async (assetId: string): Promise<ServingOutcome> => {
      throw new Error(`${cause.message} (while deciding ${assetId})`);
    };
  }

  it("answers the refusal shape, not a 500, and echoes none of the cause", async () => {
    // Captured as strings rather than read back off the spy's call array: `console.error` is typed
    // `(...data: any[])`, and a test that destructured `any` to make its point would be asserting nothing.
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
        requestFor({}, FIRST_ASSET_ID),
        context(FIRST_ASSET_ID),
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
    // The stronger form of "no partial answer": the same fingerprint a withheld asset produces, header set
    // and body included, for the same id — with a conditional attached that a `served` outcome would have
    // turned into a 304. A throw must not become a second, distinguishable answer on the wire.
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
        requestFor({ "if-none-match": "*" }, FIRST_ASSET_ID),
        context(FIRST_ASSET_ID),
      );
      const withheldByPolicy = await refusing(
        requestFor({ "if-none-match": "*" }, FIRST_ASSET_ID),
        context(FIRST_ASSET_ID),
      );
      expect(await fingerprint(broken)).toBe(
        await fingerprint(withheldByPolicy),
      );
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

describe("no catalogued asset can reach the served branch", () => {
  // The boundary instruction 9 asks for. The block above shows what the handler does with bytes; this one
  // shows that no shipped service produces bytes for any real id. Read together they are evidence about
  // the response rules and about today's rights state — not a claim that any asset is clearable.
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

  it("answers 404 for all 82 through the production GET, with the served headers absent", async () => {
    for (const asset of register) {
      const response = await mediaRoute.GET(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect(response.status, asset.assetId).toBe(404);
      expect(response.headers.get("cache-control"), asset.assetId).toBe(
        "no-store",
      );
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
      expect(response.headers.get("content-type"), asset.assetId).toBeNull();
    }
  });

  it("keeps a complete on-disk lineage from producing a served answer for any real asset", async () => {
    // The strongest input available short of editing the register: a validator-accepted lineage row for all
    // 82 ids, sitting in the store the production service reads. Check 2 still runs first, and nothing
    // reaches the served branch. Since SR-10 this is a file rather than an injected object, which makes the
    // case stronger, not weaker: the record has passed the shipped `validateManifest` on its way in.
    const root = rootWithManifest({
      ...manifestFor(FIRST_ASSET_ID),
      derivatives: register.map((asset) => lineageRow(asset.assetId)),
    });
    const handler = productionHandlerOver(root);
    for (const asset of register.slice(0, 20)) {
      const response = await handler(
        requestFor({}, asset.assetId),
        context(asset.assetId),
      );
      expect(response.status, asset.assetId).toBe(404);
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
    }
  });
});
