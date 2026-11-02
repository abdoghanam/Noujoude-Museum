/**
 * src/lib/server/media/derivative-store.ts — where a produced derivative lives, and how it is read.
 *
 * Two locations are forbidden and one is chosen. `Noujoude.photo/` is off limits because `.gitignore`
 * declares it the original asset library and "originals are never overwritten"; a derivative written
 * beside an original is a future re-audit reading the derivative as the asset. `public/` is off limits
 * because anything there is served without passing a gate, which is exactly what §20.4 bars while zero
 * of 82 assets are cleared. So derivatives live in a private directory at the repository root and reach
 * a browser only through the route in task O-08, which re-runs the rights decision on every request.
 *
 * The manifest is the lineage record: each derivative names its original's filename and SHA-256, so
 * "this WebP came from that PNG" is a lookup rather than a memory. O-09 requires that a replacement keep
 * a traceable relationship to the previous file, and RB-05 is the failure mode of not having one — ten
 * quarantined assets are derivatives of PNG originals that were never retained, and their lineage is
 * now unrecoverable from disk.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

/** Private store for produced derivatives. Not the original library, not a public directory. */
export const DERIVATIVE_STORE_DIR = "media-derivatives";

export const DERIVATIVE_MANIFEST_FILE = "lineage.json";

export const DERIVATIVE_MANIFEST_PATH = path.join(
  DERIVATIVE_STORE_DIR,
  DERIVATIVE_MANIFEST_FILE,
);

export interface DerivativeLineage {
  readonly assetId: string;
  readonly originalFilename: string;
  /** The original's SHA-256 as the register recorded it — the join key between the two trees. */
  readonly originalSha256: string;
  /** Filename inside `DERIVATIVE_STORE_DIR`, never an absolute or traversing path. */
  readonly file: string;
  readonly sha256: string;
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  readonly mime: string;
  /** Identifies the profile that produced this file, so a re-run can tell which outputs are stale. */
  readonly profile: string;
}

export interface DerivativeManifest {
  readonly generatedAt: string;
  readonly storeDirectory: string;
  /** Were the originals byte-identical before and after the run? A false here is a failed build. */
  readonly originalsUnchanged: boolean;
  readonly derivatives: readonly DerivativeLineage[];
}

export class DerivativeManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DerivativeManifestError";
  }
}

/**
 * The URL the serving route answers on. It is a locator, not a capability: holding it grants nothing,
 * because `decidePublicServing` runs again inside the handler. O-08's short-lived signed URLs for
 * restricted originals are still open and are not implemented here.
 */
export function derivativeUrl(assetId: string): string {
  return `/api/media/${encodeURIComponent(assetId)}`;
}

/**
 * The manifest plus the digest of the bytes it was parsed from, or `null` when the store has not been
 * built.
 *
 * The stamp exists so a caller can tell "the record has not changed since I last parsed it" from "I have
 * not looked yet" without re-parsing — which is what lets `slot-facts.ts` revalidate per request instead
 * of reading once per process (SR-08). The digest is of the *file bytes*, so it changes when the lineage
 * changes and a page built from the previous lineage cannot keep being rendered off a remembered copy.
 *
 * Absent answers `{manifest: null, stamp: null}` rather than throwing: see `readDerivativeManifest`.
 */
export interface DerivativeManifestSource {
  readonly manifest: DerivativeManifest | null;
  /** Lowercase SHA-256 of the manifest file, or null when there is no manifest file. */
  readonly stamp: string | null;
}

export function readDerivativeManifestSource(
  root = process.cwd(),
): DerivativeManifestSource {
  const file = path.join(root, DERIVATIVE_MANIFEST_PATH);
  let bytes: Buffer;
  try {
    bytes = readFileSync(file);
  } catch {
    return { manifest: null, stamp: null };
  }
  const stamp = createHash("sha256").update(bytes).digest("hex");
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new DerivativeManifestError(
      `${DERIVATIVE_MANIFEST_PATH} is not valid JSON; refusing to serve from a lineage record it cannot read`,
    );
  }
  return { manifest: validateManifest(parsed, file), stamp };
}

/**
 * Read the manifest, or `null` when the store has not been built.
 *
 * Absent is a legitimate state, not an error: the pipeline has never run, and on this repository it
 * cannot run for any asset until RB-01 is answered. A page must render its refusal either way, so the
 * caller needs the distinction without needing an exception.
 */
export function readDerivativeManifest(
  root = process.cwd(),
): DerivativeManifest | null {
  return readDerivativeManifestSource(root).manifest;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringField(record: Record<string, unknown>, key: string, where: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new DerivativeManifestError(`${where}: "${key}" is not a non-empty string`);
  }
  return value;
}

function numberField(record: Record<string, unknown>, key: string, where: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new DerivativeManifestError(`${where}: "${key}" is not a positive integer`);
  }
  return value;
}

/**
 * Shape validation, because this file decides which bytes reach a browser.
 *
 * A derivative entry whose `file` escapes the store directory would turn the serving route into an
 * arbitrary file read, so the path is checked against traversal here rather than sanitised later.
 */
export function validateManifest(value: unknown, where: string): DerivativeManifest {
  if (!isRecord(value)) throw new DerivativeManifestError(`${where}: manifest is not an object`);
  const generatedAt = stringField(value, "generatedAt", where);
  const storeDirectory = stringField(value, "storeDirectory", where);
  const originalsUnchanged = value["originalsUnchanged"];
  if (typeof originalsUnchanged !== "boolean") {
    throw new DerivativeManifestError(`${where}: "originalsUnchanged" is not a boolean`);
  }
  const rows = value["derivatives"];
  if (!Array.isArray(rows)) {
    throw new DerivativeManifestError(`${where}: "derivatives" is not an array`);
  }
  const derivatives: DerivativeLineage[] = rows.map((row, index) => {
    const at = `${where} derivatives[${String(index)}]`;
    if (!isRecord(row)) throw new DerivativeManifestError(`${at}: not an object`);
    const file = stringField(row, "file", at);
    if (file.includes("..") || file.startsWith("/") || /^[A-Za-z]:/.test(file)) {
      throw new DerivativeManifestError(
        `${at}: "file" is ${file}, which would resolve outside ${storeDirectory}`,
      );
    }
    const sha256 = stringField(row, "sha256", at);
    if (!/^[0-9a-f]{64}$/.test(sha256)) {
      throw new DerivativeManifestError(`${at}: "sha256" is not a lowercase SHA-256 hex digest`);
    }
    const originalSha256 = stringField(row, "originalSha256", at);
    if (!/^[0-9a-f]{64}$/.test(originalSha256)) {
      throw new DerivativeManifestError(
        `${at}: "originalSha256" is not a lowercase SHA-256 hex digest, so the lineage does not join the register`,
      );
    }
    return {
      assetId: stringField(row, "assetId", at),
      originalFilename: stringField(row, "originalFilename", at),
      originalSha256,
      file,
      sha256,
      width: numberField(row, "width", at),
      height: numberField(row, "height", at),
      bytes: numberField(row, "bytes", at),
      mime: stringField(row, "mime", at),
      profile: stringField(row, "profile", at),
    };
  });
  const ids = new Set(derivatives.map((derivative) => derivative.assetId));
  if (ids.size !== derivatives.length) {
    throw new DerivativeManifestError(
      `${where}: one asset id appears twice, so the lineage would be ambiguous about which bytes to serve`,
    );
  }
  return { generatedAt, storeDirectory, originalsUnchanged, derivatives };
}
