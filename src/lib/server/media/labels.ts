/**
 * src/lib/server/media/labels.ts — the authored alt text behind `altTextFor`.
 *
 * `src/lib/server/media/slot-facts.ts` said, since 2 November 2026, that alt text could not be invented and
 * that "a future CMS record supplies the strings and this is where they are read". This is that reader, and the
 * seam it fills is the reason the refusal was correct: a description of a picture is content, and content has to
 * arrive from somewhere that owns it.
 *
 * Where it arrives from is `docs/asset-governance/descriptive-labels.json`, whose own header names its sources —
 * the role column of the Owner's catalog in Appendix A of the Master Specification, and the Arabic manifest that
 * shipped with the ten generated files. Every string therefore traces to a document rather than to a guess made
 * while looking at a page.
 *
 * Read the same way `registry.ts` reads the register (SR-08): hash the bytes, reuse the parsed file only while the
 * digest holds, and let a corrupt file throw on the read instead of answering from a stale memory. A label record
 * that cannot be parsed is a governance failure, and a server that quietly served last week's descriptions for it
 * would be hiding that failure behind a picture.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { Locale } from "@/domain/locale";

export const LABELS_FILE = path.join(
  "docs",
  "asset-governance",
  "descriptive-labels.json",
);

export interface DescriptiveLabel {
  readonly en: string;
  readonly ar: string;
  readonly decorative: boolean;
}

interface LabelCache {
  readonly stamp: string | null;
  readonly byFilename: ReadonlyMap<string, DescriptiveLabel>;
}

let cache: LabelCache | null = null;

function parseLabels(text: string): ReadonlyMap<string, DescriptiveLabel> {
  const parsed = JSON.parse(text) as unknown;
  if (typeof parsed !== "object" || parsed === null)
    throw new Error(`${LABELS_FILE}: root is not an object`);
  const rows = (parsed as Record<string, unknown>)["labels"];
  if (!Array.isArray(rows))
    throw new Error(`${LABELS_FILE}: "labels" is not an array`);
  const out = new Map<string, DescriptiveLabel>();
  rows.forEach((row, index) => {
    const at = `${LABELS_FILE} labels[${String(index)}]`;
    if (typeof row !== "object" || row === null)
      throw new Error(`${at}: not an object`);
    const record = row as Record<string, unknown>;
    const file = record["file"];
    const en = record["en"];
    const ar = record["ar"];
    const decorative = record["decorative"];
    if (typeof file !== "string" || file.trim() === "")
      throw new Error(`${at}: "file" must be a non-empty string`);
    if (typeof en !== "string" || en.trim() === "")
      throw new Error(`${at}: "en" must be a non-empty string`);
    if (typeof ar !== "string" || ar.trim() === "")
      throw new Error(`${at}: "ar" must be a non-empty string`);
    if (typeof decorative !== "boolean")
      throw new Error(`${at}: "decorative" must be a boolean`);
    const key = file.trim().toLowerCase();
    if (out.has(key))
      throw new Error(`${at}: duplicate label for ${file}, which one wins is ambiguous`);
    out.set(key, { en: en.trim(), ar: ar.trim(), decorative });
  });
  return out;
}

function snapshot(root: string): LabelCache {
  const file = path.join(root, LABELS_FILE);
  let bytes: Buffer | null = null;
  try {
    bytes = readFileSync(file);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
    bytes = null;
  }
  const stamp = bytes === null ? null : createHash("sha256").update(bytes).digest("hex");
  if (cache !== null && cache.stamp === stamp) return cache;
  const byFilename = bytes === null ? new Map<string, DescriptiveLabel>() : parseLabels(bytes.toString("utf8"));
  cache = { stamp, byFilename };
  return cache;
}

/** Drop the parsed record and its digest key so the next call reads the file again. A cache drop, not a seam. */
export function resetLabelCache(): void {
  cache = null;
}

/**
 * The label for one register row, in one locale, or `null` when nobody has described it.
 *
 * Matched on filename rather than asset id, because the id is assigned by catalog order and the description
 * belongs to the picture; `registry.ts` is what ties a filename to an id. `decorative` is returned with the
 * text so a caller can choose to paint the asset as a background instead of placing it in a content slot, which
 * is the WCAG-correct treatment for a texture and not an excuse to leave `alt` empty on something a reader needs.
 */
export function labelFor(
  filename: string,
  locale: Locale,
  root = process.cwd(),
): string | null {
  const entry = snapshot(root).byFilename.get(filename.trim().toLowerCase());
  if (entry === undefined) return null;
  return locale === "ar" ? entry.ar : entry.en;
}

export function isDecorative(filename: string, root = process.cwd()): boolean {
  const entry = snapshot(root).byFilename.get(filename.trim().toLowerCase());
  return entry?.decorative ?? false;
}
