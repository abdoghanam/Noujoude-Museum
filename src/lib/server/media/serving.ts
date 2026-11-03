/**
 * src/lib/server/media/serving.ts — the only path from a derivative file to a browser, and it is gated.
 *
 * `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §20.4's row STT-002 bars uncleared media from public serving, and
 * a file that sits behind a URL is public serving whether or not a page links to it. So this module is
 * not a lookup with a permission check bolted on: it is seven checks that all have to pass, in order, and
 * one of two answers. `src/app/api/media/[assetId]/route.ts` renders the answer and nothing else, and
 * `src/lib/server/media/slot-facts.ts` calls the same first two checks when it decides whether a slot has
 * a source at all — so a URL is a locator, never a capability.
 *
 * The seven, and what each one is there to catch:
 *
 * 1. **Is this asset in the register?** `docs/ASSET_INVENTORY_AUDIT.csv` is the delivered evidence of what
 *    the museum has catalogued. An id that is not in it (R-03's malformed ids, a guess, a typo) is not a
 *    thing the site may serve under any circumstances.
 * 2. **Does the gate pass it?** `decidePublicServing` in `src/domain/rights.ts`, re-run per request rather
 *    than remembered from the last render, because rights are a fact that changes and the whole point of
 *    the gate is that it is consulted at the moment of serving.
 * 3. **Is there lineage?** A derivative that the manifest does not describe has no recorded original, so
 *    serving it would be serving an untraceable copy — RB-05 is exactly that state, reached by hand for
 *    ten quarantined files.
 * 4. **Does the path stay inside the store?** `lineage.json` is data, and data that names `../../.env`
 *    turns this endpoint into an arbitrary file read. The containment check runs on the *resolved* path,
 *    not on the string in the manifest, because `a/b/../c` and `a/c` are the same file and only one of
 *    them looks suspicious.
 * 5. **Are the bytes small enough to read?** A verification that reads an unbounded file into memory is a
 *    denial-of-service handler with good intentions. The ceiling is tested twice before the read: against
 *    the lineage record's declared `bytes`, then against the size the filesystem reports for the resolved
 *    path, because the record is data and the disk is the fact. This is risk **SR-09** (ASVS V5.5 resource
 *    limits, NIST 800-53 SC-5), and the refusal costs no read and no hash at all.
 * 6. **Can the bytes be read at all?** Absent is a legitimate state: the store is git-ignored, so a fresh
 *    checkout has a manifest and no files.
 * 7. **Do the bytes match the recorded digest?** A file that no longer hashes to what the manifest says is
 *    not the derivative the audit authorised. Serving it would launder a substitution. This is checked per
 *    request instead of cached: an image request is not hot on this site, and a verification that is
 *    skipped for speed is a verification that does not exist.
 *
 * Every refusal answers `404` at the route, with no reason in the body. A `403` would confirm that the id
 * is real and derived but withheld, which is a disclosure about the register to whoever can guess an id;
 * the reasons exist for the operator-facing tests and the audit trail in the slot, not for the public.
 */

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  decidePublicServing,
  type MediaRecord,
  type ServingDecision,
} from "@/domain/rights";
import type { AssetRecord } from "@/lib/media/asset-record";
import {
  type DerivativeManifest,
  DERIVATIVE_STORE_DIR,
} from "@/lib/server/media/derivative-store";
import { derivativeManifest } from "@/lib/server/media/slot-facts";
import { assetById } from "@/lib/server/media/registry";

/** Why a request did not get bytes. Never sent to the client; see the header note. */
export type ServingRefusal =
  | "unknown_asset"
  | "gate_denied"
  | "no_lineage"
  | "path_escapes_store"
  | "too_large"
  | "size_mismatch"
  | "file_unreadable"
  | "digest_mismatch";

/**
 * The largest derivative this module will put in memory for one request — risk **SR-09**'s ceiling, and
 * the reason a verification cost is bounded rather than "however big the file happens to be".
 *
 * **Why 4 MiB, measured rather than guessed.** The largest of the 82 originals the register catalogues is
 * 398,236 bytes (`Noujoude.photo/gold_embroidery_detail_1x1.jpg`, stat-ed 2 November 2026 through each
 * register row's own `libraryPath`; all 82 resolve to a file that exists, 14 JPG and 68 WebP among them),
 * and a derivative is a resize of one of those produced by `scripts/build-media-derivatives.mjs`. A resize
 * at any sane setting is smaller than its source, so the ceiling leaves roughly ten times the room the
 * biggest legitimate source needs: no authorised derivative can be refused by it, while a manifest row or a
 * store file that has grown past it is refused before a byte is read.
 *
 * **It is a serving bound, not a pipeline bound, and that is not a hedge.** The pipeline takes its profile
 * from an Owner-supplied file and validates `resize.width` as "a positive
 * integer" with no upper limit, because §10 of `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` records the profile
 * set as an explicit non-selection — so nothing in this repository currently bounds what the pipeline
 * *could* be told to emit. The number here is what the serving path will hold in memory for one request,
 * and it is deliberately independent of that choice: a future Owner-approved profile that emits larger
 * files has to raise this ceiling deliberately, with its own measurement, rather than find the check
 * silently absent. For the record, `Noujoude.photo/` contains files bigger than this ceiling — the
 * delivery archive `Noujoude.photo.rar` at 6,143,950 bytes — and none of them is an asset or reachable
 * through the register. `src/lib/server/media/serving.test.ts` measures both halves of that census.
 *
 * **What it costs and what it does not cover.** Memory per in-flight request is capped at one buffer of
 * this size, so the worst case is the ceiling times the concurrency the SR-04 bucket allows (capacity 40
 * per client, refill 10/s, in-process). The check is deliberately *before* the read; the residual window
 * is a file that grows between the size probe and the read, which is bounded by the fact that the store is
 * this repository's own git-ignored directory written only by the authorized pipeline — a writer able to
 * grow it at will can already replace its bytes, and check 7 is what refuses them. That residual is
 * recorded here rather than hidden, and a streamed digest over `createReadStream` is the alternative that
 * would remove it; it is not taken because the response body would also have to become a stream, which
 * changes the ETag/304 contract that `src/app/api/media/[assetId]/route.ts` and its suite pin.
 */
export const MAX_SERVED_DERIVATIVE_BYTES = 4 * 1024 * 1024;

export interface ServedDerivative {
  readonly kind: "served";
  readonly assetId: string;
  /**
   * Non-shared bytes: `readFile` answers `NonSharedBuffer` (`Buffer<ArrayBuffer>`), and a `Response` body
   * requires `ArrayBufferView<ArrayBuffer>`. Declaring the wider default `Uint8Array<ArrayBufferLike>` here
   * is what made the route fail to compile, not the route itself.
   */
  readonly body: Uint8Array<ArrayBuffer>;
  readonly mime: string;
  /** The manifest's own digest, reused as the entity tag: identical bytes are what it means to be current. */
  readonly etag: string;
  readonly originalSha256: string;
}

export interface RefusedDerivative {
  readonly kind: "refused";
  readonly assetId: string;
  readonly reason: ServingRefusal;
  /** The gate's denial, when the reason is `gate_denied`; null otherwise. */
  readonly detail: string | null;
}

export type ServingOutcome = ServedDerivative | RefusedDerivative;

function refused(
  assetId: string,
  reason: ServingRefusal,
  detail: string | null = null,
): RefusedDerivative {
  return { assetId, detail, kind: "refused", reason };
}

/**
 * The absolute path a manifest row resolves to, or null when it leaves the store.
 *
 * `path.resolve` is used rather than `path.join` so that `..` segments are *applied* before the
 * comparison, which is what catches `nested/../outside.png` — a string that contains no `..` after
 * normalisation but does before it. The manifest validator rejects `..` textually; this is the second
 * gate, and it is the one that sees the filesystem rather than the JSON.
 *
 * **The `turbopackIgnore` comments in this file are about deployment shape, not behaviour.** The store is
 * runtime data provisioned beside the server root by `scripts/build-media-derivatives.mjs`, never an asset
 * the import graph can know at build time. Without the opt-out, `pnpm build` reports four `Dynamic
 * filesystem access causes tracing of the whole project` warnings on these calls and instructs the deploy
 * step to copy everything under the project root into the server output — `Noujoude.photo/`, `reference/`,
 * `brand/`, and, once the pipeline has run, `media-derivatives/` itself. That is a deployment carrying the
 * exact bytes the gate exists to withhold, so it is refused here rather than left as a size warning. The
 * comments change nothing at runtime: Node still resolves the same strings, the same containment rule
 * still applies, and a store that is not present on the machine simply fails closed at check 3 — measured,
 * not assumed, by `src/lib/server/media/serving.test.ts` and `src/app/api/media/[assetId]/route.test.ts`.
 */
export function storePathFor(
  file: string,
  storeDir = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    DERIVATIVE_STORE_DIR,
  ),
): string | null {
  const resolvedStore = path.resolve(/* turbopackIgnore: true */ storeDir);
  const resolved = path.resolve(resolvedStore, file);
  if (
    resolved === resolvedStore ||
    !resolved.startsWith(resolvedStore + path.sep)
  )
    return null;
  return resolved;
}

/**
 * Everything the serving decision needs from outside itself, as values rather than as imports.
 *
 * The seven checks are the interesting part of this module, and until now they could only be exercised
 * through one door: `serveDerivative` resolved the record itself from the delivered register, and since
 * every register row is denied, checks 3 to 7 had no input a test could build. That made the security
 * properties testable and the *served* branch — the bytes, the ETag, the 304 — untestable, which is how
 * a success path quietly rots.
 *
 * `createDerivativeServer` takes the five dependencies instead of assuming them: how to find a record, how
 * to evaluate its rights, how to read the lineage manifest, how to size a file before reading it, and how
 * to read a file from which store. `PRODUCTION_SERVING_DEPENDENCIES` binds all five to the real register,
 * the real gate, the real cache and the real filesystem, and `serveDerivative` uses exactly that binding,
 * so the HTTP path and every page are unchanged and still fail closed. A test builds its own object with a
 * labelled synthetic record and a temporary store; there is no global setter involved and no environment
 * switch that a production process could trip.
 */
export interface ServingDependencies {
  /** Resolved per request, the way the default always was: the store is not fixed at import time. */
  readonly storeDirectory: () => string;
  /** Check 1. In production, `assetById` over the delivered register. */
  readonly findAsset: (assetId: string) => AssetRecord | null;
  /** Check 2. In production, `decidePublicServing` — the same evaluator the slots run, not a stand-in. */
  readonly evaluateServing: (record: MediaRecord) => ServingDecision;
  /** Check 3. In production, the process-level lineage cache. */
  readonly readLineageManifest: () => DerivativeManifest | null;
  /**
   * Check 5. The byte count the filesystem reports for a resolved path, before any of it is read.
   * In production, `node:fs/promises` `stat`. This exists so the size ceiling is enforced against the
   * disk rather than against a number a JSON file chose to print.
   */
  readonly statFileBytes: (target: string) => Promise<number>;
  /** Checks 6 and 7. In production, `node:fs/promises` `readFile`. */
  readonly readFileBytes: (target: string) => Promise<Uint8Array<ArrayBuffer>>;
}

/** The repository's own private store, resolved when a request arrives rather than at import. */
export function defaultStoreDirectory(): string {
  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    DERIVATIVE_STORE_DIR,
  );
}

export const PRODUCTION_SERVING_DEPENDENCIES: ServingDependencies = {
  evaluateServing: decidePublicServing,
  findAsset: assetById,
  readLineageManifest: derivativeManifest,
  readFileBytes: async (target: string): Promise<Uint8Array<ArrayBuffer>> =>
    await readFile(target),
  statFileBytes: async (target: string): Promise<number> =>
    (await stat(target)).size,
  storeDirectory: defaultStoreDirectory,
};

/**
 * The seven checks, bound to explicit dependencies.
 *
 * Nothing inside this function knows whether the record came from the delivered register or from a
 * fixture, which is the point: the order and the guards are one implementation, shared by production and
 * by every test, so a passing success-path test is evidence about the code that serves the public.
 */
export function createDerivativeServer(
  dependencies: ServingDependencies,
): (assetId: string) => Promise<ServingOutcome> {
  return async function serve(assetId: string): Promise<ServingOutcome> {
    const asset = dependencies.findAsset(assetId);
    if (asset === null) return refused(assetId, "unknown_asset");

    const serving = dependencies.evaluateServing(asset);
    if (!serving.serve) return refused(assetId, "gate_denied", serving.denial);

    const lineage = dependencies
      .readLineageManifest()
      ?.derivatives.find((candidate) => candidate.assetId === assetId);
    if (lineage === undefined) return refused(assetId, "no_lineage");

    const target = storePathFor(lineage.file, dependencies.storeDirectory());
    if (target === null) return refused(assetId, "path_escapes_store");

    // Check 5, twice before the read and once after it. The declared figure is refused first because it
    // costs nothing; the measured figure is what actually bounds memory, since a manifest can claim any
    // number it likes and the filesystem cannot. `readFile` has no length argument, so the post-read
    // comparison is the guard against a file that moved between the probe and the read — it does not undo
    // the allocation, which is why the ceiling has to be honoured by the probe in the first place.
    if (lineage.bytes > MAX_SERVED_DERIVATIVE_BYTES)
      return refused(
        assetId,
        "too_large",
        `lineage.json declares ${String(lineage.bytes)} bytes, above the ${String(MAX_SERVED_DERIVATIVE_BYTES)}-byte serving ceiling`,
      );

    let sizeOnDisk: number;
    try {
      sizeOnDisk = await dependencies.statFileBytes(target);
    } catch {
      return refused(assetId, "file_unreadable");
    }
    if (sizeOnDisk > MAX_SERVED_DERIVATIVE_BYTES)
      return refused(
        assetId,
        "too_large",
        `the store holds ${String(sizeOnDisk)} bytes, above the ${String(MAX_SERVED_DERIVATIVE_BYTES)}-byte serving ceiling`,
      );
    if (sizeOnDisk !== lineage.bytes)
      return refused(
        assetId,
        "size_mismatch",
        `the store holds ${String(sizeOnDisk)} bytes where lineage.json records ${String(lineage.bytes)}`,
      );

    let body: Uint8Array<ArrayBuffer>;
    try {
      body = await dependencies.readFileBytes(target);
    } catch {
      return refused(assetId, "file_unreadable");
    }
    if (body.byteLength !== sizeOnDisk)
      return refused(
        assetId,
        "size_mismatch",
        `the file changed between the size probe (${String(sizeOnDisk)}) and the read (${String(body.byteLength)})`,
      );

    const digest = createHash("sha256").update(body).digest("hex");
    if (digest !== lineage.sha256) return refused(assetId, "digest_mismatch");

    return {
      assetId,
      body,
      etag: digest,
      kind: "served",
      mime: lineage.mime,
      originalSha256: lineage.originalSha256,
    };
  };
}

/**
 * The full decision for one asset id, against the production dependencies.
 *
 * `root` is the workspace the private store belongs to, and one value decides both halves of it: where
 * `lineage.json` is read from and which directory a lineage row's filename is resolved inside. They were
 * separate parameters until 2 November 2026, which meant a caller could point the file read anywhere in
 * the world while the lineage record still came from the working directory — a shape only a test would
 * want, and the reason risk **SR-10** kept a global manifest setter alive. One root closes that: the
 * default is `process.cwd()`, so production is unchanged, and a test supplies a temporary root holding a
 * real `lineage.json` and real bytes instead of injecting a record the validator never saw.
 *
 * Nothing here changes how rights are decided: check 2 runs before either path is opened.
 */
export function serveDerivative(
  assetId: string,
  root = process.cwd(),
): Promise<ServingOutcome> {
  const storeDir = path.join(
    /* turbopackIgnore: true */ root,
    DERIVATIVE_STORE_DIR,
  );
  return createDerivativeServer({
    ...PRODUCTION_SERVING_DEPENDENCIES,
    readLineageManifest: () => derivativeManifest(root),
    storeDirectory: () => storeDir,
  })(assetId);
}
