#!/usr/bin/env node
/**
 * Noujoude — publication register generator.
 *
 * Writes `docs/asset-governance/publication-register.json`: the dated record of which catalogued assets this
 * project actually places on which live paths. `scripts/audit-assets.mjs` reads it back to fill the register's
 * `Actual Usage` column, and `src/lib/media/publication-register.test.ts` re-derives it from the same two
 * sources and fails if the file on disk says anything else — which is what makes the column a measurement
 * rather than an assertion.
 *
 * The rule, in full, because a generated file whose rule is not written down is indistinguishable from a
 * fabricated one:
 *
 *   An asset is published on exactly the paths the usage map binds its own declared surfaces to, and only
 *   while an Owner instrument authorises the asset for use at all.
 *
 * Three inputs, none of them invented here:
 *
 * 1. `docs/ASSET_INVENTORY_AUDIT.csv` — the delivered `Intended Usage` surfaces, i.e. the Owner's own catalog
 *    saying where each file belongs.
 * 2. `src/lib/media/usage-map.ts` — the §4.2 route the baseline gives each of those surfaces. Imported as the
 *    module, through `scripts/lib/ts-module-hooks.mjs`, rather than restated in JavaScript: a second copy of
 *    the surface table is how H-7 happened to the CSV parser, and this repository has already paid for one
 *    drift.
 * 3. `docs/asset-governance/owner-authorization.json` — the permission. An asset the declaration does not name
 *    is not published, even when a route would carry it.
 *
 * What the rule deliberately does *not* do: clear an asset, approve a caption, or claim anything about the
 * object depicted. Permission to display and factual verification of a heritage object are different axes
 * (mandate §2, and `DEC-INV-001` / blocker `B-05` stay open), so a published row here says nothing about
 * provenance and the register cells it feeds say "illustrative" in their own wording.
 *
 * Usage:  node scripts/build-publication-register.mjs [--root <workspace>] [--check] [--dry-run]
 *   --check   exit 1 without writing when the file on disk is not what the rule produces (CI gate)
 *   --dry-run print the summary, change nothing
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// The hooks must be *registered* before `@/*` is resolved, and a static import in this file would be
// resolved before any of this file's dependencies have run. So the alias loader is imported for its side
// effect first — module evaluation order guarantees it has run by the time the body starts — and the
// TypeScript modules are pulled in with `await import` below that point.
import "./lib/ts-module-hooks.mjs";
import { parseCsv } from "./lib/csv.mjs";

const { PRODUCTION_RIGHTS_VOCABULARY, recordsFromRows } =
  await import("@/lib/media/asset-record");
const { SURFACE_BINDINGS, bindingForSurface, boundPathsFor } =
  await import("@/lib/media/usage-map");

const argv = process.argv.slice(2);
const flag = (name) => argv.indexOf(`--${name}`) >= 0;
const option = (name, fallback) => {
  const at = argv.indexOf(`--${name}`);
  return at >= 0 ? argv[at + 1] : fallback;
};

const ROOT = path.resolve(option("root", process.cwd()));
const CHECK = flag("check");
const DRY_RUN = flag("dry-run");

const REGISTER_CSV = path.join(ROOT, "docs", "ASSET_INVENTORY_AUDIT.csv");
const AUTHORIZATION_FILE = path.join(
  ROOT,
  "docs",
  "asset-governance",
  "owner-authorization.json",
);
const OUT_FILE = path.join(
  ROOT,
  "docs",
  "asset-governance",
  "publication-register.json",
);

/** The day the Owner's mandate was issued. Every entry carries it so the register cites its own date. */
const PUBLISHED_AT = "2026-11-04";
const AUTHORITY =
  "Owner Master Autonomous Completion & Production Launch Mandate, 4 November 2026, §1 and §2";

function readOrThrow(file) {
  if (!existsSync(file))
    throw new Error(
      `build-publication-register: ${path.relative(ROOT, file)} is missing — this generator has no input to measure`,
    );
  return readFileSync(file, "utf8");
}

const authorization = JSON.parse(readOrThrow(AUTHORIZATION_FILE));
/** Lower-cased filenames the Owner's declaration names, i.e. the only files this rule may publish. */
const authorised = new Set(
  (authorization.assets ?? []).map((name) => String(name).toLowerCase()),
);
if (authorised.size === 0)
  throw new Error(
    "build-publication-register: owner-authorization.json lists no assets, so nothing can be published",
  );

// The register is read with the production vocabulary so that `rights`, `approval` and `published` on each
// record mean exactly what a page will mean by them. The publication transaction itself is what this script
// is writing, so its own rows necessarily begin unpublishable: an asset can be cleared and approved and still
// have no path, which is the `Approved but Unused` state §13.3 refuses to collapse.
const rows = parseCsv(readOrThrow(REGISTER_CSV));
const records = recordsFromRows(rows, () => null, PRODUCTION_RIGHTS_VOCABULARY);

const entries = [];
const skipped = [];
for (const record of records) {
  const paths = boundPathsFor(record.surfaces);
  if (paths.length === 0) {
    skipped.push({
      assetId: record.assetId,
      filename: record.filename,
      why: "the usage map binds none of its declared surfaces to a §4.2 route",
      surfaces: record.surfaces,
    });
    continue;
  }
  if (!authorised.has(record.filename.toLowerCase())) {
    skipped.push({
      assetId: record.assetId,
      filename: record.filename,
      why: "the Owner declaration does not name this file, and a route that would carry it is not permission",
      surfaces: record.surfaces,
    });
    continue;
  }
  entries.push({
    assetId: record.assetId,
    filename: record.filename,
    // The surfaces actually published, i.e. the declared ones the map binds. An asset that declares three
    // surfaces and is bound on one is published on one, and the register must not imply more.
    surfaces: record.surfaces.filter(
      (surface) => bindingForSurface(surface) !== null,
    ),
    paths,
    locales: ["en", "ar"],
    publishedAt: PUBLISHED_AT,
    authority: AUTHORITY,
  });
}

// The paths are the site's own addresses: a register cell that named a path no binding produces would be a
// usage claim the navigation contract cannot back up. This is the cheapest place to catch it.
const knownPaths = new Set(
  SURFACE_BINDINGS.flatMap((binding) => boundPathsFor([binding.surface])),
);
for (const entry of entries) {
  for (const route of entry.paths) {
    if (!knownPaths.has(route))
      throw new Error(
        `build-publication-register: ${entry.assetId} would be published on ${route}, which no binding in src/lib/media/usage-map.ts produces`,
      );
  }
}

const document = {
  record: "noujoude.asset-governance.publication-register",
  version: 1,
  generatedBy: "scripts/build-publication-register.mjs",
  generatedOn: PUBLISHED_AT,
  rule: "An asset is published on exactly the paths src/lib/media/usage-map.ts binds its own declared surfaces to, and only while docs/asset-governance/owner-authorization.json authorises the file for use. Permission to display is not evidence about the object depicted: DEC-INV-001 and blocker B-05 stand, and no published row may be read as a catalogue record.",
  authority: {
    instrument: AUTHORITY,
    recordedIn: "docs/OWNER_ASSET_AUTHORIZATION_2026-11-04.md",
    declaration: "docs/asset-governance/owner-authorization.json",
  },
  counts: {
    registerRows: records.length,
    published: entries.length,
    notPublished: skipped.length,
    boundSurfaces: SURFACE_BINDINGS.length,
  },
  entries,
  notPublished: skipped,
};

const text = `${JSON.stringify(document, null, 2)}\n`;
const current = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : null;

// Wrapped rather than top-level: a `.mjs` module cannot `return`, and the three exit paths below all want to
// stop before the write.
function report() {
  if (CHECK) {
    if (current === null) {
      process.stdout.write(
        `build-publication-register --check: ${path.relative(ROOT, OUT_FILE)} does not exist, but the rule produces ${String(entries.length)} published row(s).\n`,
      );
      process.exitCode = 1;
      return;
    }
    if (current === text) {
      process.stdout.write(
        `build-publication-register --check: ${path.relative(ROOT, OUT_FILE)} matches the rule (${String(entries.length)} published, ${String(skipped.length)} not published).\n`,
      );
      return;
    }
    process.stdout.write(
      "build-publication-register --check: the file on disk is not what the rule produces. Re-run `pnpm build:publication-register` and read the diff before committing.\n",
    );
    process.exitCode = 1;
    return;
  }

  if (DRY_RUN) {
    process.stdout.write(
      `build-publication-register (dry run): ${String(entries.length)} of ${String(records.length)} register rows would be published, ${String(skipped.length)} would not.\n`,
    );
    for (const entry of entries.slice(0, 6))
      process.stdout.write(
        `  ${entry.assetId} ${entry.filename} -> ${entry.paths.join(", ")}\n`,
      );
    return;
  }

  writeFileSync(OUT_FILE, text);
  process.stdout.write(
    `build-publication-register: wrote ${path.relative(ROOT, OUT_FILE)} with ${String(entries.length)} published asset(s) across ${String(knownPaths.size)} distinct path(s); ${String(skipped.length)} register row(s) are not published.\n`,
  );
  const reasons = new Map();
  for (const row of skipped)
    reasons.set(row.why, (reasons.get(row.why) ?? 0) + 1);
  for (const [why, count] of reasons)
    process.stdout.write(`  not published x${String(count)}: ${why}\n`);
}

report();
