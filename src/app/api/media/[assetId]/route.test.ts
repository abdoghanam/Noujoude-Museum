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
 * the real gate — and every case above it asserts that it answers `404` for all 82 catalogued assets,
 * which is measured, not assumed. `createMediaRouteHandler(serve)` is the seam STEP 9 added: the same
 * response logic with an explicit serving service, so the `200`/`304` branch can be asserted for what it
 * is — a mapping from an outcome to a status, headers and bytes. The service handed to it here is
 * controlled, so the gate is not re-tested through the wire; the six checks, the synthetic cleared record
 * and the real `node:fs` read are tested in `src/lib/server/media/serving.test.ts`. Nothing in this file
 * is evidence that a catalogued asset can receive a `200`: the last block asserts the opposite, that the
 * production handler answers `404` for the same synthetic id the fixture clears.
 *
 * The handler is called directly with the `params` promise Next.js hands it, the way `slots.test.ts`
 * calls the layout. No server is started, no socket is used, and nothing is written to the repository:
 * the only fixtures are lineage records injected through `setDerivativeManifest`, the same seam the slot
 * tests already use, and in-memory outcomes for the served branch.
 *
 * One case the file deliberately does not cover: a corrupt `lineage.json` sitting in the repository's own
 * git-ignored private store. Creating it would write into the tree and would falsify the measured pin in
 * `slots.test.ts` that the pipeline has never run, and the refusal path never reaches the manifest anyway
 * — check 2 runs first — so the covered claim is the one that matters for the wire: no reachable input
 * makes the production handler throw, and none makes it answer anything but 404.
 */

import { createHash } from "node:crypto";

import * as mediaRoute from "@/app/api/media/[assetId]/route";
import { afterEach, describe, expect, it } from "vitest";

import {
  DERIVATIVE_STORE_DIR,
  type DerivativeLineage,
  type DerivativeManifest,
  derivativeUrl,
} from "@/lib/server/media/derivative-store";
import { assetRegister } from "@/lib/server/media/registry";
import {
  derivativeManifest,
  resetDerivativeManifestCache,
  setDerivativeManifest,
} from "@/lib/server/media/slot-facts";
import { type ServedDerivative, serveDerivative } from "@/lib/server/media/serving";

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
const SYNTHETIC_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50]);
const SYNTHETIC_DIGEST = createHash("sha256").update(SYNTHETIC_BYTES).digest("hex");
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

function requestFor(headers: HeadersInit = {}, assetId: string = FIRST_ASSET_ID): Request {
  return new Request(`http://localhost:3000/api/media/${assetId}`, { headers });
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

afterEach(() => {
  resetDerivativeManifestCache();
});

describe("the handler's surface", () => {
  it("exports GET as the only verb, and one factory next to it", () => {
    // `HEAD` is derived by Next from GET; any other verb exported here would be an unreviewed second path
    // to the same bytes. The refusal logic lives in one function precisely so verbs cannot diverge.
    // `createMediaRouteHandler` is not a verb: it is the seam that lets the response rules be read with an
    // explicit service, and nothing in `src/` imports it — `GET` is the only entry point Next will call.
    expect(Object.keys(mediaRoute).sort()).toEqual(["GET", "createMediaRouteHandler"]);
    expect(typeof mediaRoute.GET).toBe("function");
    expect(typeof mediaRoute.createMediaRouteHandler).toBe("function");
  });

  it("binds GET to the production service, measured as the same answers", async () => {
    // The equivalence this file depends on: `GET` is this response logic over `serveDerivative`, so the
    // served-branch cases below describe the shipped handler's behaviour once a real record clears, not
    // the behaviour of a stand-in. Four inputs, one refused-by-register, one unknown, one malformed, one
    // withheld real id, compared as full fingerprints.
    const production = mediaRoute.createMediaRouteHandler(serveDerivative);
    for (const assetId of [FIRST_ASSET_ID, "NDM-AST-083", "../../.env", ""]) {
      const left = await fingerprint(await mediaRoute.GET(requestFor(), context(assetId)));
      const right = await fingerprint(await production(requestFor(), context(assetId)));
      expect(right, assetId).toBe(left);
    }
  });
});

describe("every catalogued asset is withheld", () => {
  it("refuses all 82 register ids with 404, an empty body and no validator", async () => {
    for (const asset of register) {
      const response = await mediaRoute.GET(requestFor(), context(asset.assetId));
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
      const response = await mediaRoute.GET(requestFor(), context(asset.assetId));
      shapes.add(JSON.stringify([...response.headers.entries()].sort()));
    }
    expect([...shapes]).toEqual(
      ['[["cache-control","no-store"],["x-content-type-options","nosniff"]]'],
    );
  });

  it("never answers 403 for a real id it is withholding", async () => {
    // The distinction is the disclosure rule: 403 means "you are not allowed this known thing", 404 means
    // "there is nothing here". Only the second is safe to say to an anonymous caller.
    for (const asset of register.slice(0, 12)) {
      const response = await mediaRoute.GET(requestFor(), context(asset.assetId));
      expect([401, 403]).not.toContain(response.status);
      expect(response.status).toBe(404);
    }
  });

  it("leaks no reason, no path and no digest into status, headers or body", async () => {
    const response = await mediaRoute.GET(requestFor(), context(FIRST_ASSET_ID));
    const body = await response.text();
    const wire = [
      String(response.status),
      ...response.headers.keys(),
      ...response.headers.values(),
      body,
    ].join(" ");
    for (const forbidden of FORBIDDEN_STRINGS) {
      expect(wire.toLowerCase(), forbidden).not.toContain(forbidden.toLowerCase());
    }
  });
});

describe("a withheld asset and an imaginary one cannot be told apart", () => {
  it("fingerprint-matches a real withheld id, an unregistered id and a malformed id", async () => {
    const withheld = await fingerprint(await mediaRoute.GET(requestFor(), context(FIRST_ASSET_ID)));
    for (const id of ["NDM-AST-083", "ndm-ast-001", `${FIRST_ASSET_ID}.webp`, "../../.env", ""]) {
      const response = await mediaRoute.GET(requestFor(), context(id));
      expect(await fingerprint(response), id).toBe(withheld);
    }
  });

  it("answers the same for a missing parameter as for a withheld asset", async () => {
    expect(
      await fingerprint(await mediaRoute.GET(requestFor(), context())),
    ).toBe(
      await fingerprint(await mediaRoute.GET(requestFor(), context(FIRST_ASSET_ID))),
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
    ["a path prefix that lands in the store", `../media-derivatives/${FIRST_ASSET_ID}.webp`],
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
    ["an entity tag shaped like a real digest", { "if-none-match": ENTITY_TAG }],
    ["a weak entity tag", { "if-none-match": 'W/"aaaa"' }],
    ["the wildcard validator", { "if-none-match": "*" }],
    ["a modification date", { "if-modified-since": "Sun, 02 Nov 2026 00:00:00 GMT" }],
  ];
  it.each(conditionals)("still answers 404 when the client sends %s", async (_label, headers) => {
    // A `304` asserts that the client already holds a representation of this resource. For a withheld
    // derivative that is false, and it would also let a cache keep bytes the gate has not authorised.
    const response = await mediaRoute.GET(requestFor(headers), context(FIRST_ASSET_ID));
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
    expect(await response.text()).toBe("");
  });
});

describe("the private store is not a capability", () => {
  it("refuses the URL the lineage record would answer on, with the lineage present", async () => {
    setDerivativeManifest(manifestFor(FIRST_ASSET_ID));
    // The preconditions, so the assertions below cannot pass on an empty cache or a made-up path: the
    // manifest really does describe this asset, and the segment requested is the one `derivativeUrl`
    // builds — the exact URL a slot would have shipped if the gate had let it get that far.
    expect(derivativeManifest()?.derivatives.map((row) => row.assetId)).toEqual([FIRST_ASSET_ID]);
    expect(derivativeUrl(FIRST_ASSET_ID)).toBe(`/api/media/${FIRST_ASSET_ID}`);

    const response = await mediaRoute.GET(requestFor(), context(FIRST_ASSET_ID));
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

  it("refuses even a lineage row whose file escapes the store, and does not throw", async () => {
    const escaping: DerivativeManifest = {
      ...manifestFor(FIRST_ASSET_ID),
      derivatives: [{ ...lineageRow(FIRST_ASSET_ID), file: "../../../../.env" }],
    };
    setDerivativeManifest(escaping);
    const response = await mediaRoute.GET(requestFor(), context(FIRST_ASSET_ID));
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });

  it("refuses an id that is a lineage row for another asset", async () => {
    setDerivativeManifest(manifestFor(FIRST_ASSET_ID));
    const response = await mediaRoute.GET(requestFor(), context("NDM-AST-002"));
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
  });

  it("emits no served-branch header for any injected lineage", async () => {
    // `must-revalidate` and a quoted digest are what the `200` branch sends. Their absence across the
    // whole register, with a manifest injected for every row, is the measured form of "no bytes served".
    setDerivativeManifest({
      ...manifestFor(FIRST_ASSET_ID),
      derivatives: register.map((asset) => lineageRow(asset.assetId)),
    });
    for (const asset of register) {
      const response = await mediaRoute.GET(requestFor(), context(asset.assetId));
      expect(response.status, asset.assetId).toBe(404);
      expect(response.headers.get("cache-control"), asset.assetId).not.toContain("must-revalidate");
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
    const response = await mediaRoute.GET(requestFor(), context(FIRST_ASSET_ID));
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("the served branch, through the handler factory", () => {
  // A controlled service, because instruction 9 asks for the response rules in isolation: the six checks
  // and the record that clears them are `serving.test.ts`'s subject, and re-running them here would only
  // couple two files that answer different questions. Nothing in this block is evidence that a catalogued
  // asset can receive a `200` — the block after it measures that none can.
  const handler = mediaRoute.createMediaRouteHandler(serveSynthetic);

  it("answers 200 with the bytes, the lineage mime and the digest as the validator", async () => {
    const response = await handler(requestFor({}, SYNTHETIC_ID), context(SYNTHETIC_ID));
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("etag")).toBe(SYNTHETIC_TAG);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(SYNTHETIC_BYTES);
  });

  it("marks a served derivative revalidable and never stale", async () => {
    // `public` is the point: the bytes are cleared, so a shared cache may hold them. `max-age=0,
    // must-revalidate` means every later visit asks the gate again, which is what keeps a withdrawn asset
    // from surviving in a CDN after its row changes. The refusal branch's `no-store` must not appear here.
    const response = await handler(requestFor({}, SYNTHETIC_ID), context(SYNTHETIC_ID));
    expect(response.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
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
    const response = await handler(requestFor({}, SYNTHETIC_ID), context(SYNTHETIC_ID));
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
      expect(wire.toLowerCase(), forbidden).not.toContain(forbidden.toLowerCase());
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
    expect(response.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
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
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(SYNTHETIC_BYTES);
  });

  it("measures the wildcard and weak-validator divergence from RFC 9110, without calling it correct", async () => {
    // Requirement, from RFC 9110 §8.8.3: `If-None-Match: *` evaluates false when the target has a current
    // representation, and If-None-Match compares with the weak function — both should answer 304. Measured
    // here: the shipped comparison is an exact string match against the quoted strong tag, so each answers
    // 200 and re-transfers. The consequence is bandwidth, not disclosure — a cleared derivative is public
    // either way — so this is recorded as an open deviation rather than redefined as expected behaviour.
    // A later fix should change this case, not the other way round.
    const wildcard = await handler(
      requestFor({ "if-none-match": "*" }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(wildcard.status).toBe(200);
    await wildcard.body?.cancel();
    const weak = await handler(
      requestFor({ "if-none-match": `W/${SYNTHETIC_TAG}` }, SYNTHETIC_ID),
      context(SYNTHETIC_ID),
    );
    expect(weak.status).toBe(200);
    await weak.body?.cancel();
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
    expect([...shapes]).toEqual(['[["cache-control","no-store"],["x-content-type-options","nosniff"]]']);
  });
});

describe("no catalogued asset can reach the served branch", () => {
  // The boundary instruction 9 asks for. The block above shows what the handler does with bytes; this one
  // shows that no shipped service produces bytes for any real id. Read together they are evidence about
  // the response rules and about today's rights state — not a claim that any asset is clearable.
  it("answers 404 through the production GET for the id the controlled service serves", async () => {
    const response = await mediaRoute.GET(requestFor({}, SYNTHETIC_ID), context(SYNTHETIC_ID));
    expect(response.status).toBe(404);
    expect(response.headers.get("etag")).toBeNull();
    expect(response.headers.get("content-type")).toBeNull();
    expect(await response.text()).toBe("");
  });

  it("answers 404 through the factory bound to `serveDerivative` for the same id", async () => {
    // The fixture is not a register row, so check 1 stops it before the gate — the synthetic approval has
    // no path onto the wire even through the seam that was built for testing it.
    const handler = mediaRoute.createMediaRouteHandler(serveDerivative);
    const response = await handler(requestFor({}, SYNTHETIC_ID), context(SYNTHETIC_ID));
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("answers 404 for all 82 through the production GET, with the served headers absent", async () => {
    for (const asset of register) {
      const response = await mediaRoute.GET(requestFor({}, asset.assetId), context(asset.assetId));
      expect(response.status, asset.assetId).toBe(404);
      expect(response.headers.get("cache-control"), asset.assetId).toBe("no-store");
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
      expect(response.headers.get("content-type"), asset.assetId).toBeNull();
    }
  });

  it("keeps a complete injected lineage from producing a served answer for any real asset", async () => {
    // The strongest input available short of editing the register: a validated-shaped record for all 82
    // rows, held by the cache the production service reads. Check 2 still runs first.
    setDerivativeManifest({
      ...manifestFor(FIRST_ASSET_ID),
      derivatives: register.map((asset) => lineageRow(asset.assetId)),
    });
    const handler = mediaRoute.createMediaRouteHandler(serveDerivative);
    for (const asset of register.slice(0, 20)) {
      const response = await handler(requestFor({}, asset.assetId), context(asset.assetId));
      expect(response.status, asset.assetId).toBe(404);
      expect(response.headers.get("etag"), asset.assetId).toBeNull();
    }
  });
});
