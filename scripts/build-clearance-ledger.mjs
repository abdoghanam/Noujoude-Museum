#!/usr/bin/env node
/**
 * Noujoude — clearance ledger generator.
 *
 * Writes `docs/asset-governance/clearance-ledger.json`, the input `scripts/build-media-derivatives.mjs`
 * needs before it will encode anything. The builder's design (see its header, and risk O-09) is that a ledger
 * row authorises a derivative only while the register cell it quotes still reads the same way, byte for byte.
 * That means the only honest way to write a ledger is to copy the cells, which is what this script does — so
 * the check "did somebody hand-author a clearance to get a file served?" has a mechanical answer.
 *
 * Three conditions decide whether an asset appears, all of them read rather than assumed:
 *
 * 1. the register's own `Rights Status` and `Brand/Curatorial Approval` cells evaluate to `cleared` and
 *    `approved` under `PRODUCTION_RIGHTS_VOCABULARY` — the same vocabulary every page and every HTTP request
 *    uses, imported rather than restated;
 * 2. the Owner's declaration names the file (`docs/asset-governance/owner-authorization.json`);
 * 3. `docs/asset-governance/publication-register.json` publishes it, so nothing is encoded that no page will
 *    ever show. Encoding an asset nobody publishes would put a second copy of a heritage file on disk for no
 *    stated reason.
 *
 * Physical status must read `PRESENT`. A `WRONG_FORMAT` row is refused here and named, because the builder
 * would refuse it anyway and a ledger that silently omitted it would hide the defect.
 *
 * Usage:  node scripts/build-clearance-ledger.mjs [--root <workspace>] [--check] [--dry-run]
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import "./lib/ts-module-hooks.mjs";
import { parseCsv } from "./lib/csv.mjs";

const {
  PRODUCTION_RIGHTS_VOCABULARY,
  approvalFrom,
  publishedFrom,
  rightsStateFrom,
} = await import("@/lib/media/asset-record");

const argv = process.argv.slice(2);
const flag = (name) => argv.indexOf(`--${name}`) >= 0;
const option = (name, fallback) => {
  const at = argv.indexOf(`--${name}`);
  return at >= 0 ? argv[at + 1] : fallback;
};

const ROOT = path.resolve(option("root", process.cwd()));
const CHECK = flag("check");
const DRY_RUN = flag("dry-run");

const GOVERNANCE_DIR = path.join(ROOT, "docs", "asset-governance");
const REGISTER_FILE = path.join(ROOT, "docs", "ASSET_INVENTORY_AUDIT.csv");
const AUTHORIZATION_FILE = path.join(
  GOVERNANCE_DIR,
  "owner-authorization.json",
);
const PUBLICATION_FILE = path.join(GOVERNANCE_DIR, "publication-register.json");
const PROFILES_FILE = path.join(GOVERNANCE_DIR, "derivative-profiles.json");
const OUT_FILE = path.join(GOVERNANCE_DIR, "clearance-ledger.json");

const AUTHORITY =
  "Owner Master Autonomous Completion & Production Launch Mandate, 4 November 2026, §1 and §2";

function readText(file) {
  if (!existsSync(file))
    throw new Error(
      `build-clearance-ledger: ${path.relative(ROOT, file)} is missing — the ledger quotes documents, and one is not here`,
    );
  return readFileSync(file);
}

const registerBytes = readText(REGISTER_FILE);
const registerSha256 = createHash("sha256").update(registerBytes).digest("hex");

const authorization = JSON.parse(readText(AUTHORIZATION_FILE));
const publication = JSON.parse(readText(PUBLICATION_FILE));
const profiles = JSON.parse(readText(PROFILES_FILE));

const authorised = new Set(
  (authorization.assets ?? []).map((name) => String(name).toLowerCase()),
);
const published = new Map(
  (publication.entries ?? []).map((entry) => [String(entry.assetId), entry]),
);
const profileIds = (profiles.profiles ?? []).map((profile) => profile.id);
if (profileIds.length === 0)
  throw new Error(
    "build-clearance-ledger: the profile set names no profile, so a ledger would authorise work that cannot be shaped",
  );

const rows = parseCsv(registerBytes.toString("utf8"));
const header = rows[0] ?? [];
const index = {};
for (const name of [
  "Asset ID",
  "Filename",
  "Physical Status",
  "Rights Status",
  "Brand/Curatorial Approval",
  "Actual Usage",
  "Derivative Status",
  "Alt Text Status",
]) {
  const at = header.indexOf(name);
  if (at === -1)
    throw new Error(
      `build-clearance-ledger: the register has no "${name}" column`,
    );
  index[name] = at;
}

const approvals = [];
const refused = [];
for (const row of rows.slice(1)) {
  if (row.length === 1 && row[0] === "") continue;
  if (row.length !== header.length)
    throw new Error(
      `build-clearance-ledger: a register row has ${String(row.length)} cells where the header declares ${String(header.length)}`,
    );
  const assetId = row[index["Asset ID"]];
  const filename = row[index["Filename"]];
  const rightsStatement = row[index["Rights Status"]];
  const approvalStatement = row[index["Brand/Curatorial Approval"]];
  const usageStatement = row[index["Actual Usage"]];

  const rights = rightsStateFrom(rightsStatement, PRODUCTION_RIGHTS_VOCABULARY);
  const approval = approvalFrom(
    approvalStatement,
    PRODUCTION_RIGHTS_VOCABULARY,
  );
  const isPublished = publishedFrom(
    usageStatement,
    PRODUCTION_RIGHTS_VOCABULARY,
  );

  // Ordered so the first refusal reason a reviewer sees is the most substantive one.
  if (rights !== "cleared") {
    refused.push({
      assetId,
      filename,
      why: `rights state reads "${rights}", not "cleared"`,
    });
    continue;
  }
  if (approval !== "approved") {
    refused.push({
      assetId,
      filename,
      why: `approval reads "${approval}", not "approved"`,
    });
    continue;
  }
  if (!isPublished) {
    refused.push({
      assetId,
      filename,
      why: "the publication register names no entry, so no page would show a derivative of it",
    });
    continue;
  }
  if (!authorised.has(String(filename).toLowerCase())) {
    refused.push({
      assetId,
      filename,
      why: "the Owner declaration does not name this file, and a cleared-looking cell is not a licence",
    });
    continue;
  }
  if (row[index["Physical Status"]] !== "PRESENT") {
    refused.push({
      assetId,
      filename,
      why: `physical status is "${row[index["Physical Status"]]}"`,
    });
    continue;
  }
  approvals.push({
    assetId,
    filename,
    // The two cells the builder compares, copied from the register without trimming or re-wording.
    rightsStatement,
    approvalStatement,
    publishedOn: published.get(assetId).paths,
    altTextStatus: row[index["Alt Text Status"]],
  });
}

const document = {
  record: "noujoude.asset-governance.clearance-ledger",
  version: 1,
  generatedBy: "scripts/build-clearance-ledger.mjs",
  generatedOn: new Date().toISOString().slice(0, 10),
  quotationRule:
    "Every rightsStatement and approvalStatement below is copied byte-for-byte from the named cell of the register whose digest is recorded here. scripts/build-media-derivatives.mjs re-reads the register and refuses any row whose cell has moved, so an edit to the register invalidates the corresponding ledger row instead of quietly authorising a derivative from stale evidence.",
  authority: {
    instrument: AUTHORITY,
    declaration: "docs/asset-governance/owner-authorization.json",
    publication: "docs/asset-governance/publication-register.json",
    whatItGrants:
      "permission to display, optimise and serve these files in this project (mandate §2). It is not evidence about the object depicted; DEC-INV-001 and blocker B-05 stand.",
  },
  register: {
    path: "docs/ASSET_INVENTORY_AUDIT.csv",
    sha256: registerSha256,
    rows: approvals.length + refused.length,
  },
  profileSet: {
    path: "docs/asset-governance/derivative-profiles.json",
    ids: profileIds,
  },
  counts: {
    authorised: approvals.length,
    refused: refused.length,
  },
  approvals,
  refused,
};

const text = `${JSON.stringify(document, null, 2)}\n`;
const current = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : null;

function report() {
  if (CHECK) {
    const same = current !== null && current === text;
    process.stdout.write(
      same
        ? `build-clearance-ledger --check: ${path.relative(ROOT, OUT_FILE)} quotes the register as it stands (${String(approvals.length)} authorised).\n`
        : `build-clearance-ledger --check: ${path.relative(ROOT, OUT_FILE)} does not quote the register as it stands. The register digest here is ${registerSha256.slice(0, 12)}…; re-run the generator and read the diff.\n`,
    );
    process.exitCode = same ? 0 : 1;
    return;
  }
  if (DRY_RUN) {
    process.stdout.write(
      `build-clearance-ledger (dry run): ${String(approvals.length)} of ${String(approvals.length + refused.length)} register rows would be authorised; ${String(refused.length)} refused.\n`,
    );
    return;
  }
  writeFileSync(OUT_FILE, text);
  process.stdout.write(
    `build-clearance-ledger: wrote ${path.relative(ROOT, OUT_FILE)} with ${String(approvals.length)} authorised row(s) quoting register ${registerSha256.slice(0, 12)}…, ${String(refused.length)} refused.\n`,
  );
  const reasons = new Map();
  for (const row of refused)
    reasons.set(row.why, (reasons.get(row.why) ?? 0) + 1);
  for (const [why, count] of reasons)
    process.stdout.write(`  refused x${String(count)}: ${why}\n`);
}

report();
