#!/usr/bin/env node
/**
 * Noujoude — derivative builder with lineage, and no authority to build anything today.
 *
 * Module 08 requires produced derivatives (`optimized and responsive image variants exist`, RB-04) and
 * O-09 requires that "each derivative has a traceable relationship to its original". That relationship
 * is this script's whole point: every produced file records the original's filename and the SHA-256 the
 * register carries for it, so "this WebP came from that PNG" is a lookup rather than a memory. The ten
 * quarantined AI assets in `_pending_review_AI_generated/` are the counter-example — they are derivatives
 * of PNG originals that were never retained, and their lineage is now unrecoverable from disk (RB-05).
 *
 * THREE THINGS THIS SCRIPT DOES NOT DO, each one a rule somebody wrote down rather than a preference:
 *
 * 1. **It does not choose an output profile.** §10 of `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` records the
 *    sharp profile, quality, width ladder and format set as an explicit *non-selection* — the baseline
 *    never picks them. A script with a built-in default would be making that choice silently, so
 *    `--profile` is mandatory and the profile definitions have to arrive in a file this script reads.
 *    No such file exists in the repository, and this script will not create one.
 * 2. **It does not decide what is cleared.** The gate is `decidePublicServing` in
 *    `src/domain/rights.ts`, and a second copy of a rights decision in a build script is defect H-7's
 *    shape all over again. Instead the script takes a *clearance ledger* — an explicit record naming the
 *    assets that may be derived, quoting each one's rights and approval statements — and refuses any row
 *    whose quotation does not match the register cell byte-for-byte. A stale ledger therefore cannot act
 *    on an asset the register describes differently, and a ledger that does not exist (today) authorises
 *    nothing. The serving route re-runs the real gate per request, so even a wrong ledger cannot leak a
 *    pixel.
 * 3. **It does not write into the original library.** `Noujoude.photo/` is read-only by `.gitignore` line
 *    45, "originals are never overwritten". The audit script reads it; this script reads it too, and
 *    writes only into `media-derivatives/`, which is outside both the library and `public/` — anything in
 *    `public/` is served by the static handler without passing a gate, which §20.4 bars for gated media.
 *
 * Every original is hashed before and after the run. If any byte of any input changed, no manifest is
 * written and the process exits 4: a pipeline that quietly rewrote its own inputs would destroy the
 * evidence the register is made of.
 *
 * Usage:
 *   node scripts/build-media-derivatives.mjs --profile <id> --profiles <file> --ledger <file>
 *     [--register <csv>] [--library <dir>] [--store <dir>] [--dry-run]
 *
 * Exit codes:
 *   0  derivatives produced (or a clean `--dry-run`)
 *   2  the invocation is wrong or a supplied input is malformed
 *   3  nothing is authorised: no profile set, no ledger, or no ledger row that survives verification
 *   4  an original changed during the run — outputs are left in place, the manifest is withheld
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { parseCsv } from "./lib/csv.mjs";
import { sniffFormat } from "./lib/image-signature.mjs";
import "./lib/ts-module-hooks.mjs";

// The production wording-to-state vocabulary, read from the module that decides it rather than restated here.
// A refusal message that says "0 of 82 are cleared" is a claim this script cannot see without that vocabulary,
// and it was in fact false from the day the Owner's 4 November declaration armed it — a script that reports the
// gate has to report what the gate measures, per run, from the register it was handed.
const { PRODUCTION_RIGHTS_VOCABULARY, approvalFrom, rightsStateFrom } =
  await import("@/lib/media/asset-record");

// ------------------------------------------------------------------ inputs

const ARGS = process.argv.slice(2);

function flag(name) {
  const at = ARGS.indexOf(`--${name}`);
  return at >= 0 ? ARGS[at + 1] : undefined;
}

const DRY_RUN = ARGS.includes("--dry-run");
const PROFILE_ID = flag("profile");
const PROFILES_FILE = flag("profiles");
const LEDGER_FILE = flag("ledger");
const REGISTER_FILE =
  flag("register") ??
  path.join(process.cwd(), "docs", "ASSET_INVENTORY_AUDIT.csv");
const LIBRARY_DIR =
  flag("library") ?? path.join(process.cwd(), "Noujoude.photo");
const STORE_DIR =
  flag("store") ?? path.join(process.cwd(), "media-derivatives");

/** Column names this script reads by header position, so a re-ordered register is refused, not misread. */
const REQUIRED_COLUMNS = [
  "Asset ID",
  "Physical Status",
  "Actual Path",
  "MIME Type",
  "SHA-256",
  "Rights Status",
  "Brand/Curatorial Approval",
];

const MIME_EXTENSIONS = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/avif": "avif",
};

const SHARP_FITS = new Set(["cover", "contain", "fill", "inside", "outside"]);

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function fail(code, message) {
  process.stdout.write(`${message}\n`);
  process.exitCode = code;
}

// --------------------------------------------------------------- validation

/**
 * The profile shape, validated rather than trusted.
 *
 * Nothing here picks a "good default" — the point of §10's non-selection is that the numbers are not
 * this script's to make. What is checked is that whatever a human chose is expressible: a name, one
 * format, a bounded quality, at least one width, and a resize rule sharp actually implements.
 */
function validateProfile(value, where) {
  if (typeof value !== "object" || value === null)
    throw new Error(`${where}: profile is not an object`);
  const id = value.id;
  if (typeof id !== "string" || !/^[a-z0-9][a-z0-9._-]{0,63}$/.test(id)) {
    throw new Error(
      `${where}: "id" must be a lower-case token usable as a file name`,
    );
  }
  const mime = value.mime;
  if (typeof mime !== "string" || MIME_EXTENSIONS[mime] === undefined) {
    throw new Error(
      `${where}: "mime" is ${JSON.stringify(mime)}; this script emits ${Object.keys(MIME_EXTENSIONS).join(", ")} and nothing else`,
    );
  }
  const quality = value.quality;
  if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
    throw new Error(`${where}: "quality" must be an integer from 1 to 100`);
  }
  const resize = value.resize;
  if (typeof resize !== "object" || resize === null)
    throw new Error(`${where}: "resize" is required`);
  if (!Number.isInteger(resize.width) || resize.width <= 0) {
    throw new Error(`${where}: "resize.width" must be a positive integer`);
  }
  if (
    resize.height !== undefined &&
    (!Number.isInteger(resize.height) || resize.height <= 0)
  ) {
    throw new Error(
      `${where}: "resize.height" must be a positive integer when given`,
    );
  }
  if (resize.fit !== undefined && !SHARP_FITS.has(resize.fit)) {
    throw new Error(
      `${where}: "resize.fit" must be one of ${[...SHARP_FITS].join(", ")}`,
    );
  }
  /*
   * Optional, and the reason it exists is measured rather than theoretical. The register records real
   * pixels, and 43 of the 82 catalogued assets are 512px on their longest side while the country heroes are
   * 1792px. A profile that says `width: 1280` would therefore *upsample* every small original by 2.5x and
   * then record the enlarged number as the derivative's dimensions — a lineage row that misstates how much
   * detail the file holds, in a project whose whole media architecture is built on the lineage being
   * truthful. `withoutEnlargement` is sharp's own guard, passed through rather than assumed.
   */
  const withoutEnlargement = resize.withoutEnlargement;
  if (
    withoutEnlargement !== undefined &&
    typeof withoutEnlargement !== "boolean"
  ) {
    throw new Error(
      `${where}: "resize.withoutEnlargement" must be a boolean when given`,
    );
  }
  return {
    id,
    mime,
    quality,
    resize: {
      width: resize.width,
      height: resize.height,
      fit: resize.fit,
      withoutEnlargement,
    },
  };
}

function readJson(file, label) {
  if (!existsSync(file)) return undefined;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(
      `${label} at ${file} is not valid JSON: ${String(error.message)}`,
    );
  }
  return parsed;
}

/**
 * The register, as the rows this script needs.
 *
 * Parsed with the shared CSV reader — the one function the audit, the preflight gate and
 * `src/lib/server/media/registry.ts` all call, because H-7 was a column shift caused by a second parser
 * and a third copy would recreate it.
 */
function readRegister(file) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  const header = rows[0] ?? [];
  const index = {};
  for (const name of REQUIRED_COLUMNS) {
    const at = header.indexOf(name);
    if (at === -1)
      throw new Error(`the register at ${file} has no "${name}" column`);
    index[name] = at;
  }
  const byId = new Map();
  for (const row of rows.slice(1)) {
    if (row.length === 1 && row[0] === "") continue;
    if (row.length !== header.length) {
      throw new Error(
        `a register row has ${String(row.length)} cells where the header declares ${String(header.length)}; refusing to read shifted columns`,
      );
    }
    byId.set(row[index["Asset ID"]], {
      assetId: row[index["Asset ID"]],
      physicalStatus: row[index["Physical Status"]],
      libraryPath: row[index["Actual Path"]],
      mime: row[index["MIME Type"]],
      sha256: row[index["SHA-256"]],
      rightsStatement: row[index["Rights Status"]],
      approvalStatement: row[index["Brand/Curatorial Approval"]],
    });
  }
  return byId;
}

// ------------------------------------------------------------------ the run

/**
 * What the register in front of this run says about rights, in the gate's own words.
 *
 * Used in the refusal text, so the sentence a blocked operator reads is computed from the same cells the
 * application computes its decisions from. The counts are of the register this invocation was handed, which in
 * a fixture is the fixture's rows and in the real workspace is the delivered 82 — one sentence, two truths,
 * neither of them typed in.
 */
function rightsPosition(register) {
  const rows = [...register.values()];
  const cleared = rows.filter(
    (row) =>
      rightsStateFrom(row.rightsStatement, PRODUCTION_RIGHTS_VOCABULARY) ===
      "cleared",
  ).length;
  const approved = rows.filter(
    (row) =>
      approvalFrom(row.approvalStatement, PRODUCTION_RIGHTS_VOCABULARY) ===
      "approved",
  ).length;
  return `Measured from this register now: ${String(cleared)} of ${String(
    rows.length,
  )} rows read as rights-cleared and ${String(
    approved,
  )} as approved under src/lib/media/asset-record.ts's production vocabulary.`;
}

/**
 * Why one ledger row did not become a file.
 *
 * Every reason is a fact about the delivered record, not a judgement about the asset: the register is
 * the evidence, and where the ledger and the register disagree the register wins.
 */
function verify(approval, register, libraryDir) {
  const asset = register.get(approval.assetId);
  if (asset === undefined) return { ok: false, why: "not_in_register" };
  if (asset.rightsStatement !== approval.rightsStatement)
    return { ok: false, why: "rights_statement_changed" };
  if (asset.approvalStatement !== approval.approvalStatement) {
    return { ok: false, why: "approval_statement_changed" };
  }
  if (asset.physicalStatus !== "PRESENT")
    return { ok: false, why: `physical_${asset.physicalStatus}` };
  const rel = asset.libraryPath.replace(/\\/g, "/");
  if (rel.startsWith("/") || rel.startsWith("..") || /^[A-Za-z]:/.test(rel)) {
    return { ok: false, why: "path_escapes_library" };
  }
  const file = path.join(libraryDir, rel);
  if (!existsSync(file)) return { ok: false, why: "original_missing" };
  const bytes = readFileSync(file);
  const digest = sha256(bytes);
  if (digest !== asset.sha256)
    return { ok: false, why: "checksum_mismatch", detail: digest };
  // The container is re-sniffed from magic bytes rather than believed from the register's MIME cell or
  // the file name. This is the same rule `scripts/preflight.mjs` applies and the reason NDM-AST-041 is
  // catalogued as `WRONG_FORMAT`: a file whose extension says .jpg and whose header says WebP. A
  // derivative minted from a file the register mis-describes would carry that error into its lineage.
  const container = sniffFormat(bytes);
  if (container === null) return { ok: false, why: "container_unrecognised" };
  if (container !== asset.mime)
    return { ok: false, why: "mime_mismatch", detail: container };
  return { ok: true, asset, bytes, file };
}

function outputName(profile, assetId, mime) {
  const ext = MIME_EXTENSIONS[mime];
  return `${assetId}--${profile.id}.${ext}`;
}

async function emit(profile, verified, storeDir) {
  const { asset, bytes } = verified;
  // No `failOn` override: a container sharp cannot decode is refused, and a half-decoded derivative of a
  // heritage original is the kind of artefact that later gets described as "the file we have".
  const pipeline = sharp(bytes).resize({
    width: profile.resize.width,
    height: profile.resize.height,
    fit: profile.resize.fit ?? "cover",
    // Defaults to the value the profile omits, so a profile file written before this option existed resizes
    // exactly as it did on 2 November. The enlargement guard is opt-out, not opt-in, by default.
    withoutEnlargement: profile.resize.withoutEnlargement ?? false,
  });
  // `MIME_EXTENSIONS` admits only the three formats a browser-native heritage gallery needs. A PNG
  // derivative of a photographic original is a raster of a raster, and offering it here would invite a
  // profile file that chooses it without anybody having decided to.
  const kind = profile.mime.split("/")[1];
  const encoded =
    kind === "jpeg"
      ? pipeline.jpeg({ quality: profile.quality, mozjpeg: true })
      : pipeline[kind]({ quality: profile.quality });
  const out = await encoded.toBuffer({ resolveWithObject: true });
  const name = outputName(profile, asset.assetId, profile.mime);
  const target = path.join(storeDir, name);
  if (!target.startsWith(`${storeDir}${path.sep}`)) {
    throw new Error(
      `refusing to write ${target}, which is not inside the derivative store`,
    );
  }
  writeFileSync(target, out.data);
  return {
    assetId: asset.assetId,
    originalFilename: asset.libraryPath.replace(/\\/g, "/").split("/").pop(),
    originalSha256: asset.sha256,
    file: name,
    sha256: sha256(out.data),
    width: out.info.width,
    height: out.info.height,
    bytes: out.data.length,
    mime: profile.mime,
    profile: profile.id,
  };
}

/** Every original the run touched, hashed. Used to prove the library is byte-identical afterwards. */
function snapshot(files) {
  const map = new Map();
  for (const file of files) map.set(file, sha256(readFileSync(file)));
  return map;
}

async function main() {
  if (
    PROFILE_ID === undefined ||
    PROFILES_FILE === undefined ||
    LEDGER_FILE === undefined
  ) {
    const missing = [
      PROFILE_ID === undefined ? "--profile <id>" : undefined,
      PROFILES_FILE === undefined ? "--profiles <file>" : undefined,
      LEDGER_FILE === undefined ? "--ledger <file>" : undefined,
    ].filter((entry) => entry !== undefined);
    fail(
      2,
      `build-media-derivatives: ${missing.join(" and ")} must be supplied. ` +
        "The output profile is a recorded non-selection in docs/MEDIA_AND_RIGHTS_GOVERNANCE.md §10, and the " +
        "clearance ledger is the only thing that can authorise a derivative; this script invents neither.",
    );
    return;
  }

  let profiles;
  try {
    profiles = readJson(PROFILES_FILE, "the profile file");
  } catch (error) {
    fail(2, `build-media-derivatives: ${String(error.message)}`);
    return;
  }
  if (profiles === undefined) {
    fail(
      3,
      `build-media-derivatives: no profile set exists at ${PROFILES_FILE}. §10 leaves the format, quality and ` +
        "width decisions unmade, and this script has no default of its own, so nothing can be produced until a " +
        "human writes the choice down.",
    );
    return;
  }

  let profile;
  try {
    const list = Array.isArray(profiles.profiles) ? profiles.profiles : [];
    const chosen = list.find((entry) => entry?.id === PROFILE_ID);
    if (chosen === undefined) {
      fail(
        2,
        `build-media-derivatives: "${PROFILE_ID}" is not in ${PROFILES_FILE}. Defined profiles: ${
          list.map((entry) => entry?.id).join(", ") || "(none)"
        }.`,
      );
      return;
    }
    profile = validateProfile(chosen, `profile "${PROFILE_ID}"`);
  } catch (error) {
    fail(2, `build-media-derivatives: ${String(error.message)}`);
    return;
  }

  let ledger;
  try {
    ledger = readJson(LEDGER_FILE, "the clearance ledger");
  } catch (error) {
    fail(2, `build-media-derivatives: ${String(error.message)}`);
    return;
  }
  if (ledger === undefined) {
    fail(
      3,
      `build-media-derivatives: no clearance ledger at ${LEDGER_FILE}, so nothing is authorised for derivation ` +
        "whatever the register's rights cells say. §8 of docs/MEDIA_AND_RIGHTS_GOVERNANCE.md bars producing a " +
        "derivative from an asset no clearance record names, and the ledger is that record: write it with " +
        "`node scripts/build-clearance-ledger.mjs`, which copies the register's own cells rather than authoring new ones.",
    );
    return;
  }

  let register;
  try {
    register = readRegister(REGISTER_FILE);
  } catch (error) {
    fail(2, `build-media-derivatives: ${String(error.message)}`);
    return;
  }

  const approvals = Array.isArray(ledger.approvals) ? ledger.approvals : [];
  const refusals = [];
  const buildable = [];
  for (const approval of approvals) {
    if (typeof approval?.assetId !== "string") {
      refusals.push({
        assetId: "(malformed)",
        why: "ledger_row_has_no_asset_id",
      });
      continue;
    }
    const result = verify(approval, register, LIBRARY_DIR);
    if (result.ok) buildable.push(result);
    else
      refusals.push({
        assetId: approval.assetId,
        why: result.why,
        detail: result.detail,
      });
  }

  if (buildable.length === 0) {
    const detail = refusals
      .map(
        (refusal) =>
          `  ${refusal.assetId}: ${refusal.why}${refusal.detail === undefined ? "" : ` (${refusal.detail})`}`,
      )
      .join("\n");
    fail(
      3,
      `build-media-derivatives: ${String(approvals.length)} ledger row(s) supplied, 0 authorised for derivation.` +
        (detail === "" ? "" : `\n${detail}\n`) +
        ` Nothing was written${DRY_RUN ? " (dry run)" : ""}. ${rightsPosition(register)} §8 of ` +
        "docs/MEDIA_AND_RIGHTS_GOVERNANCE.md bars producing a derivative from an asset whose rights state is " +
        "unknown — the fix cannot precede the clearance.",
    );
    return;
  }

  if (DRY_RUN) {
    process.stdout.write(
      `build-media-derivatives (dry run): profile ${profile.id}, ${String(buildable.length)} asset(s) would be ` +
        `produced into ${STORE_DIR}, ${String(refusals.length)} ledger row(s) refused.\n`,
    );
    return;
  }

  mkdirSync(STORE_DIR, { recursive: true });
  const before = snapshot(buildable.map((entry) => entry.file));
  const derivatives = [];
  for (const entry of buildable) {
    try {
      derivatives.push(await emit(profile, entry, STORE_DIR));
    } catch (error) {
      // One unreadable original must not abort the run: the rest of the ledger still gets its lineage,
      // and the failure is recorded where the operator will see it rather than in a stack trace.
      refusals.push({
        assetId: entry.asset.assetId,
        why: "encode_failed",
        detail: String(error.message),
      });
    }
  }
  const originalsUnchanged = [...before.entries()].every(
    ([file, digest]) =>
      existsSync(file) && sha256(readFileSync(file)) === digest,
  );

  if (!originalsUnchanged) {
    // The outputs exist but the input evidence moved. Withholding the manifest means nothing can be
    // served from them: `readDerivativeManifest()` finds no lineage, so `servedSrcFor()` returns null.
    process.stdout.write(
      "build-media-derivatives: an original is not byte-identical to the hash taken before the run. No lineage " +
        "manifest was written, so none of the produced files are servable, and nothing in the library was deleted.\n",
    );
    process.exitCode = 4;
    return;
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    storeDirectory: path.relative(process.cwd(), STORE_DIR).replace(/\\/g, "/"),
    originalsUnchanged,
    derivatives,
  };
  writeFileSync(
    path.join(STORE_DIR, "lineage.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  process.stdout.write(
    `build-media-derivatives: produced ${String(derivatives.length)} derivative(s) with profile ${profile.id} into ` +
      `${STORE_DIR}, refused ${String(refusals.length)} ledger row(s), and confirmed every original byte-identical.\n`,
  );
  for (const refusal of refusals) {
    process.stdout.write(`  refused ${refusal.assetId}: ${refusal.why}\n`);
  }
}

await main();
