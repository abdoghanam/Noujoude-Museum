#!/usr/bin/env node
/**
 * scripts/tests/preflight-asset-reconciliation.test.mjs — regression tests for defect H-7.
 *
 * H-7 is the claim that the preflight asset check could not see the asset directory. It iterated
 * docs/ASSET_INVENTORY_AUDIT.csv and reported "all 82 audited assets match their recorded SHA-256" while
 * Noujoude.photo/ actually held 85 files, three of which had no catalog row at all. A check that only reads
 * the register cannot detect anything the register forgot to mention.
 *
 * Fixtures are built in the OS temp directory by COPYING real assets out of Noujoude.photo/. The originals
 * are read, never written, renamed or removed — that is the whole reason scripts/preflight.mjs now takes
 * --root: without it, proving that the gate detects a modified original would require damaging the library
 * it guards.
 *
 * The child is run with a stripped PATH so `docker` is absent: the docker probe would otherwise wait 20 s
 * on an unresponsive daemon and this file would take minutes per case. Those checks still run and still
 * report; this test asserts only on the reconciliation line and its level.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { sniffFormat, readDimensions } from "../lib/image-signature.mjs";
import { declarationMismatch } from "../lib/asset-declarations.mjs";

const REPO = path.resolve(import.meta.dirname, "..", "..");
const PREFLIGHT = path.join(REPO, "scripts", "preflight.mjs");
const SRC_LIB = path.join(REPO, "Noujoude.photo");
const CRLF = String.fromCharCode(13) + String.fromCharCode(10);

/**
 * The fixture asset. Its file name carries no size declaration, so unlike brand_seal_monogram_1024.webp
 * (which declares 1024px and holds 512) it agrees with itself and can serve as the clean case.
 */
const CLEAN = "master_atmosphere_definitive.webp";
const CLEAN_W = 512;
const CLEAN_H = 288;

const COLS = [
  "Asset ID",
  "Filename",
  "Expected Category",
  "Physical Status",
  "Actual Path",
  "MIME Type",
  "Width",
  "Height",
  "File Size",
  "SHA-256",
  "Source/Creator",
  "Rights Status",
  "Brand/Curatorial Approval",
  "Intended Usage",
  "Actual Usage",
  "Derivative Status",
  "Alt Text Status",
  "Notes",
  "Verified By",
  "Verified Date",
];

const cell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

function csvRow(o) {
  return [
    o.id,
    o.filename,
    o.category ?? "A.2 Brand Identity Assets",
    o.status,
    o.actualPath,
    o.mime,
    o.width,
    o.height,
    o.bytes,
    o.sha,
    "fixture",
    "UNKNOWN",
    "Not Approved",
    "fixture",
    "None",
    "Original",
    "Not Recorded",
    o.notes ?? "",
    "test",
    "2026-11-01",
  ]
    .map(cell)
    .join(",");
}

/**
 * spec.assets      — copied in AND catalogued: { name, copyFrom?, declared?, corrupt? }
 *                    `declared` overrides what the CSV records, so a row can be made to contradict the file
 *                    it describes. `corrupt` tampers with the copy *after* the row has been written with the
 *                    pristine checksum, which is what a modified original actually looks like.
 * spec.files       — copied in but deliberately not catalogued (the H-7 blind spot).
 * spec.catalogOnly — catalogued but deliberately absent from the directory.
 */
function fixture(spec) {
  const dir = mkdtempSync(path.join(tmpdir(), "ndm-preflight-"));
  mkdirSync(path.join(dir, "reference"), { recursive: true });
  mkdirSync(path.join(dir, "docs"), { recursive: true });
  mkdirSync(path.join(dir, "Noujoude.photo"), { recursive: true });
  writeFileSync(
    path.join(dir, "reference", "README.txt"),
    "fixture read-only input" + String.fromCharCode(10),
  );
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      name: "fixture",
      engines: { node: ">=18" },
      packageManager: "pnpm@11.21.0",
    }),
  );

  const place = (name, copyFrom) => {
    const abs = path.join(dir, "Noujoude.photo", name);
    mkdirSync(path.dirname(abs), { recursive: true });
    copyFileSync(path.join(SRC_LIB, copyFrom ?? CLEAN), abs);
    return abs;
  };

  const rows = [];
  let n = 0;
  for (const a of spec.assets ?? []) {
    const abs = place(a.name, a.copyFrom);
    const pristine = readFileSync(abs);
    const mime = sniffFormat(pristine);
    const dims = mime ? readDimensions(pristine, mime) : null;
    const d = a.declared ?? {};
    n++;
    rows.push(
      csvRow({
        id: "NDM-AST-F" + String(n).padStart(3, "0"),
        filename: a.name.split("/").pop(),
        category: d.category ?? "A.2 Brand Identity Assets",
        notes: d.notes ?? "",
        status: d.status ?? "PRESENT",
        actualPath: d.actualPath ?? a.name,
        mime: d.mime ?? mime ?? "",
        width: d.width ?? (dims ? dims.width : ""),
        height: d.height ?? (dims ? dims.height : ""),
        bytes: d.bytes ?? pristine.length,
        sha: d.sha ?? createHash("sha256").update(pristine).digest("hex"),
      }),
    );
    if (a.corrupt)
      writeFileSync(
        abs,
        Buffer.concat([
          pristine,
          Buffer.from("# fixture tampering" + String.fromCharCode(10)),
        ]),
      );
  }
  for (const f of spec.files ?? []) place(f.name, f.copyFrom);
  for (const extra of spec.catalogOnly ?? []) {
    n++;
    rows.push(
      csvRow({
        id: "NDM-AST-F" + String(n).padStart(3, "0"),
        filename: extra.filename,
        status: extra.status ?? "PRESENT",
        actualPath: extra.actualPath ?? extra.filename,
        mime: "",
        width: "",
        height: "",
        bytes: "",
        sha: "",
      }),
    );
  }
  writeFileSync(
    path.join(dir, "docs", "ASSET_INVENTORY_AUDIT.csv"),
    [COLS.join(","), ...rows].join(CRLF) + CRLF,
  );
  return dir;
}

function reconcileLine(dir, extraArgs = []) {
  const r = spawnSync(
    process.execPath,
    [PREFLIGHT, "--root", dir, ...extraArgs],
    {
      encoding: "utf8",
      env: { ...process.env, PATH: dir },
    },
  );
  const out = (r.stdout || "") + (r.stderr || "");
  const lines = out.split(String.fromCharCode(10));
  const i = lines.findIndex((l) =>
    l.includes("Noujoude.photo/ reconciliation"),
  );
  if (i < 0)
    return { rc: r.status, level: "ABSENT", detail: out.slice(0, 600) };
  return {
    rc: r.status,
    level: lines[i].trim().split(" ")[0],
    detail: (lines[i + 1] || "").trim(),
  };
}

/** The rule as it stood before H-7: iterate the CSV, never the directory. Kept here to prove vacuity. */
function oldRule(dir) {
  const csv = readFileSync(
    path.join(dir, "docs", "ASSET_INVENTORY_AUDIT.csv"),
    "utf8",
  );
  const lines = csv.split(CRLF).filter(Boolean).slice(1);
  let checked = 0,
    changed = 0,
    missing = 0;
  for (const ln of lines) {
    const cells = ln.match(/("([^"]|"")*"|[^,]*)/g)?.filter(Boolean) ?? [];
    const clean = (s) => (s ?? "").replace(/^"|"$/g, "").replace(/""/g, '"');
    const p = clean(cells[4]);
    const want = clean(cells[9]);
    if (!p || !want) continue;
    checked++;
    const abs = path.join(dir, "Noujoude.photo", p);
    if (!existsSync(abs)) {
      missing++;
      continue;
    }
    if (createHash("sha256").update(readFileSync(abs)).digest("hex") !== want)
      changed++;
  }
  return { checked, reported: changed + missing };
}

let passCount = 0,
  failCount = 0;
function check(label, spec, wantLevel, wantPattern) {
  const dir = fixture(spec);
  try {
    const { level, detail } = reconcileLine(dir);
    if (level === wantLevel && wantPattern.test(detail)) {
      passCount++;
      console.log(`PASS  ${label}  [${level}]`);
    } else {
      failCount++;
      console.log(`FAIL  ${label}`);
      console.log(`      wanted ${wantLevel} matching /${wantPattern}/`);
      console.log(`      got    ${level}: ${detail.slice(0, 300)}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── POSITIVE cases: a healthy library must pass ──────────────────────────────────────────────────────
check(
  "clean fixture: one asset whose row agrees with the file",
  { assets: [{ name: CLEAN }] },
  "PASS",
  /every catalogued original matches its recorded SHA-256/,
);

check(
  "an empty catalog against an empty directory reconciles without phantom defects",
  {},
  "PASS",
  /every catalogued original matches/,
);

check(
  "two consistent assets reconcile",
  { assets: [{ name: CLEAN }, { name: "second_copy.webp", copyFrom: CLEAN }] },
  "PASS",
  /every catalogued original matches/,
);

// ── NEGATIVE cases: each one is a thing the pre-H-7 gate could not see ───────────────────────────────
check(
  "UNCATALOGUED IMAGE in the directory with no catalog row is detected",
  { assets: [{ name: CLEAN }], files: [{ name: "untracked_asset.webp" }] },
  "WARN",
  /1 image file\(s\) in the directory with NO catalog row: untracked_asset\.webp/,
);

{
  const dir = fixture({
    assets: [{ name: CLEAN }],
    files: [{ name: "untracked_asset.webp" }],
  });
  try {
    const r = oldRule(dir);
    if (r.checked === 1 && r.reported === 0) {
      passCount++;
      console.log(
        "PASS  [regression proven] the pre-H-7 rule reads 1 row, reports 0 problems, and never learns a second file exists",
      );
    } else {
      failCount++;
      console.log(
        `FAIL  expected the pre-H-7 rule to be blind; it checked ${r.checked} rows and reported ${r.reported}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

check(
  "MODIFIED original is a FAIL, not a warning",
  { assets: [{ name: CLEAN, corrupt: true }] },
  "FAIL",
  /1 MODIFIED original\(s\): master_atmosphere_definitive\.webp/,
);

check(
  "MISSING file named by the catalog is a FAIL",
  { catalogOnly: [{ filename: "vanished.webp" }] },
  "FAIL",
  /1 catalogued original\(s\) no longer in the directory: vanished\.webp/,
);

check(
  "a catalog row contradicted by the file is a FAIL (row claims width 9999)",
  { assets: [{ name: CLEAN, declared: { width: "9999" } }] },
  "FAIL",
  /catalog row\(s\) contradicted by the file: master_atmosphere_definitive\.webp: row records width 9999, container decodes 512/,
);

check(
  "a fabricated SHA-256 in the catalog is caught as MODIFIED rather than trusted",
  { assets: [{ name: CLEAN, declared: { sha: "0".repeat(64) } }] },
  "FAIL",
  /1 MODIFIED original\(s\): master_atmosphere_definitive\.webp/,
);

check(
  "extension vs container mismatch is detected (WebP bytes inside a .jpg name)",
  { assets: [{ name: "pretend.jpg" }] },
  "WARN",
  /1 WRONG_FORMAT \(extension vs container\): pretend\.jpg: \.jpg holding image\/webp/,
);

check(
  "filename self-declaration vs measured pixels is detected, by the same rule the audit uses",
  { assets: [{ name: "logo_stacked_vertical_1024x1536.webp" }] },
  "WARN",
  /1 NAME\/PIXEL mismatch\(es\): logo_stacked_vertical_1024x1536\.webp/,
);

check(
  "the mismatch count in the gate and in the audit share one implementation",
  { assets: [{ name: "logo_stacked_vertical_1024x1536.webp" }] },
  "WARN",
  /file is 512x288/,
);

{
  const d = declarationMismatch(
    "logo_stacked_vertical_1024x1536.webp",
    CLEAN_W,
    CLEAN_H,
  );
  if (d === `filename declares 1024x1536, file is ${CLEAN_W}x${CLEAN_H}`) {
    passCount++;
    console.log(
      "PASS  shared declarationMismatch() returns the audit wording verbatim",
    );
  } else {
    failCount++;
    console.log(`FAIL  declarationMismatch returned ${JSON.stringify(d)}`);
  }
}

// A row that records an asset as absent is itself a claim about the library, so it is reconciled too.
// The two directions of that claim are different failures and must not share one label.
check(
  "a row recording the asset as absent, with no file, is consistent",
  {
    catalogOnly: [
      { filename: "known_gone.webp", status: "MISSING", actualPath: "" },
    ],
  },
  "PASS",
  /every catalogued original matches/,
);

check(
  "a row recording the asset as absent while a file of that name exists is a contradicted register",
  {
    assets: [
      {
        name: CLEAN,
        declared: {
          status: "MISSING",
          sha: "",
          width: "",
          height: "",
          mime: "",
          bytes: "",
          actualPath: "",
        },
      },
    ],
  },
  "FAIL",
  /catalog row\(s\) contradicted by the file: master_atmosphere_definitive\.webp: catalog records it as absent .* but a file of that name exists/,
);

check(
  "a register that honestly records an absent asset is not flagged",
  {
    catalogOnly: [{ filename: "gone.webp", status: "MISSING", actualPath: "" }],
  },
  "PASS",
  /every catalogued original matches/,
);

// ── the gate must not silently disappear when its inputs are absent ──────────────────────────────────
{
  const dir = mkdtempSync(path.join(tmpdir(), "ndm-preflight-nophotos-"));
  mkdirSync(path.join(dir, "reference"), { recursive: true });
  mkdirSync(path.join(dir, "docs"), { recursive: true });
  writeFileSync(path.join(dir, "reference", "README.txt"), "x");
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "f", engines: { node: ">=18" } }),
  );
  writeFileSync(
    path.join(dir, "docs", "ASSET_INVENTORY_AUDIT.csv"),
    COLS.join(",") + CRLF,
  );
  const { level, detail } = reconcileLine(dir);
  if (level === "WARN" && /directory to reconcile against/.test(detail)) {
    passCount++;
    console.log(
      'PASS  a missing Noujoude.photo/ is reported as such, not counted as "nothing wrong"',
    );
  } else {
    failCount++;
    console.log(
      `FAIL  missing-directory case gave [${level}] ${detail.slice(0, 200)}`,
    );
  }
  rmSync(dir, { recursive: true, force: true });
}

{
  const dir = mkdtempSync(path.join(tmpdir(), "ndm-preflight-nocsv-"));
  mkdirSync(path.join(dir, "reference"), { recursive: true });
  mkdirSync(path.join(dir, "docs"), { recursive: true });
  mkdirSync(path.join(dir, "Noujoude.photo"), { recursive: true });
  copyFileSync(
    path.join(SRC_LIB, CLEAN),
    path.join(dir, "Noujoude.photo", CLEAN),
  );
  writeFileSync(path.join(dir, "reference", "README.txt"), "x");
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "f", engines: { node: ">=18" } }),
  );
  const { level, detail } = reconcileLine(dir);
  if (level === "WARN" && /no ASSET_INVENTORY_AUDIT\.csv/.test(detail)) {
    passCount++;
    console.log(
      'PASS  a missing catalog is reported as such, not counted as "nothing wrong"',
    );
  } else {
    failCount++;
    console.log(
      `FAIL  missing-catalog case gave [${level}] ${detail.slice(0, 200)}`,
    );
  }
  rmSync(dir, { recursive: true, force: true });
}

// ── the register itself: quoted fields, embedded commas and empty cells ──────────────────────────────
// The pre-H-7 reader split rows with /("([^"]|"")*"|[^,]*)/g + filter(Boolean). filter(Boolean) drops
// every *empty* cell, so one empty field shifts every later column left: the cell read as the SHA-256
// becomes a neighbouring column. The fixture therefore carries an empty cell BEFORE the checksum and a
// quoted comma-bearing cell after it. A healthy row under that shape must reconcile clean — and the old
// reader must visibly misreport the very same file.
{
  const spec = {
    assets: [
      {
        name: CLEAN,
        declared: { category: "", notes: 'a "quoted", comma-bearing note' },
      },
    ],
  };
  const dir = fixture(spec);
  const badDir = fixture({
    assets: [
      {
        ...spec.assets[0],
        declared: { ...spec.assets[0].declared, sha: "0".repeat(64) },
      },
    ],
  });
  try {
    const { level, detail } = reconcileLine(dir);
    if (level === "PASS") {
      passCount++;
      console.log(
        "PASS  a row with an empty cell and a quoted, comma-bearing cell still resolves to the right columns",
      );
    } else {
      failCount++;
      console.log(
        `FAIL  quoted/empty CSV row broke the reconciliation (level ${level}): ${detail.slice(0, 240)}`,
      );
    }
    const { level: bl, detail: bd } = reconcileLine(badDir);
    if (
      bl === "FAIL" &&
      /MODIFIED original\(s\): master_atmosphere_definitive\.webp/.test(bd)
    ) {
      passCount++;
      console.log(
        "PASS  and the checksum column is still the checksum column under that shape (a wrong SHA is MODIFIED)",
      );
    } else {
      failCount++;
      console.log(
        `FAIL  quoted-row + wrong SHA gave [${bl}] ${bd.slice(0, 240)}`,
      );
    }
    const r = oldRule(dir);
    if (r.checked === 1 && r.reported === 1) {
      passCount++;
      console.log(
        "PASS  [regression proven] the pre-H-7 reader reports 1 problem on that healthy row, because the empty cell shifted its columns",
      );
    } else {
      failCount++;
      console.log(
        `FAIL  expected the pre-H-7 reader to misreport the quoted row; it checked ${r.checked} and reported ${r.reported}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(badDir, { recursive: true, force: true });
  }
}

// ── the real workspace must reconcile, with every registered finding visible ─────────────────────────
{
  const r = spawnSync(process.execPath, [PREFLIGHT], {
    encoding: "utf8",
    cwd: REPO,
    env: { ...process.env, PATH: process.env.WINDIR + "\\System32" },
  });
  const out = (r.stdout || "") + (r.stderr || "");
  const lines = out.split(String.fromCharCode(10));
  const i = lines.findIndex((l) =>
    l.includes("Noujoude.photo/ reconciliation"),
  );
  const detail = i >= 0 ? lines[i + 1] || "" : "";
  const level = i >= 0 ? lines[i].trim().split(" ")[0] : "ABSENT";
  // The counts below are a *measurement of the workspace on 2 November 2026*, not constants of the
  // design: `4 non-image`, `physical files 97` and the eleven duplicates behind them are the residue
  // `docs/CHANGELOG.md` §R records (an archive that duplicates 78 existing files, and an Owner
  // relocation of ten quarantined files that preflight caught as a FAIL and a restore repaired). They
  // are asserted rather than tolerated because this test exists to make every registered finding
  // visible on every run — so when the Owner removes the duplicates or the archive leaves the
  // directory, this line goes red on purpose and the register in
  // `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §6.5 has to be re-measured, not edited to match.
  const ok =
    level === "WARN" &&
    /18 NAME\/PIXEL/.test(detail) &&
    /1 WRONG_FORMAT/.test(detail) &&
    /1 image file\(s\) in the directory with NO catalog row: logo_presentation_scene_16x9_v3\.webp/.test(
      detail,
    ) &&
    /4 non-image file\(s\) not catalogued/.test(detail) &&
    /catalog rows 82, physical files 97/.test(detail);
  if (ok) {
    passCount++;
    console.log(
      "PASS  the real library reconciles: 82 rows / 97 files, 1 uncatalogued image, 4 uncatalogued non-image files, 1 wrong format, 18 name/pixel — the findings the audit registers, now visible on every preflight",
    );
  } else {
    failCount++;
    console.log(
      `FAIL  real-workspace reconciliation is [${level}]: ${detail.slice(0, 500)}`,
    );
  }
}

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount ? 1 : 0);
