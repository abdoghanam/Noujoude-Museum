/**
 * src/lib/server/media/serving.ts — the only path from a derivative file to a browser, and it is gated.
 *
 * `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §20.4's row STT-002 bars uncleared media from public serving, and
 * a file that sits behind a URL is public serving whether or not a page links to it. So this module is
 * not a lookup with a permission check bolted on: it is six checks that all have to pass, in order, and
 * one of two answers. `src/app/api/media/[assetId]/route.ts` renders the answer and nothing else, and
 * `src/lib/server/media/slot-facts.ts` calls the same first two checks when it decides whether a slot has
 * a source at all — so a URL is a locator, never a capability.
 *
 * The six, and what each one is there to catch:
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
 * 5. **Can the bytes be read at all?** Absent is a legitimate state: the store is git-ignored, so a fresh
 *    checkout has a manifest and no files.
 * 6. **Do the bytes match the recorded digest?** A file that no longer hashes to what the manifest says is
 *    not the derivative the audit authorised. Serving it would launder a substitution. This is checked per
 *    request instead of cached: an image request is not hot on this site, and a verification that is
 *    skipped for speed is a verification that does not exist.
 *
 * Every refusal answers `404` at the route, with no reason in the body. A `403` would confirm that the id
 * is real and derived but withheld, which is a disclosure about the register to whoever can guess an id;
 * the reasons exist for the operator-facing tests and the audit trail in the slot, not for the public.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { decidePublicServing, type MediaRecord, type ServingDecision } from "@/domain/rights";
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
  | "file_unreadable"
  | "digest_mismatch";

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
 */
export function storePathFor(
  file: string,
  storeDir = path.join(process.cwd(), DERIVATIVE_STORE_DIR),
): string | null {
  const resolvedStore = path.resolve(storeDir);
  const resolved = path.resolve(resolvedStore, file);
  if (resolved === resolvedStore || !resolved.startsWith(resolvedStore + path.sep)) return null;
  return resolved;
}

/**
 * Everything the serving decision needs from outside itself, as values rather than as imports.
 *
 * The six checks are the interesting part of this module, and until now they could only be exercised
 * through one door: `serveDerivative` resolved the record itself from the delivered register, and since
 * every register row is denied, checks 3 to 6 had no input a test could build. That made the security
 * properties testable and the *served* branch — the bytes, the ETag, the 304 — untestable, which is how
 * a success path quietly rots.
 *
 * `createDerivativeServer` takes the four dependencies instead of assuming them: how to find a record,
 * how to evaluate its rights, how to read the lineage manifest, and how to read a file from which store.
 * `PRODUCTION_SERVING_DEPENDENCIES` binds all four to the real register, the real gate, the real cache
 * and the real filesystem, and `serveDerivative` uses exactly that binding, so the HTTP path and every
 * page are unchanged and still fail closed. A test builds its own object with a labelled synthetic
 * record and a temporary store; there is no global setter involved and no environment switch that a
 * production process could trip.
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
  /** Checks 5 and 6. In production, `node:fs/promises` `readFile`. */
  readonly readFileBytes: (target: string) => Promise<Uint8Array<ArrayBuffer>>;
}

/** The repository's own private store, resolved when a request arrives rather than at import. */
export function defaultStoreDirectory(): string {
  return path.join(process.cwd(), DERIVATIVE_STORE_DIR);
}

export const PRODUCTION_SERVING_DEPENDENCIES: ServingDependencies = {
  evaluateServing: decidePublicServing,
  findAsset: assetById,
  readLineageManifest: derivativeManifest,
  readFileBytes: async (target: string): Promise<Uint8Array<ArrayBuffer>> => await readFile(target),
  storeDirectory: defaultStoreDirectory,
};

/**
 * The six checks, bound to explicit dependencies.
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

    const lineage = dependencies.readLineageManifest()?.derivatives.find(
      (candidate) => candidate.assetId === assetId,
    );
    if (lineage === undefined) return refused(assetId, "no_lineage");

    const target = storePathFor(lineage.file, dependencies.storeDirectory());
    if (target === null) return refused(assetId, "path_escapes_store");

    let body: Uint8Array<ArrayBuffer>;
    try {
      body = await dependencies.readFileBytes(target);
    } catch {
      return refused(assetId, "file_unreadable");
    }

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
 * `storeDir` stays a parameter because the pipeline's output directory is a fact a caller may already
 * know; it does not, and must not be able to, change how rights are decided.
 */
export function serveDerivative(
  assetId: string,
  storeDir = defaultStoreDirectory(),
): Promise<ServingOutcome> {
  return createDerivativeServer({
    ...PRODUCTION_SERVING_DEPENDENCIES,
    storeDirectory: () => storeDir,
  })(assetId);
}
