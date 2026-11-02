#!/usr/bin/env node
/**
 * scripts/tests/build-media-derivatives.test.mjs — the pipeline that must refuse, proved to refuse and
 * also proved to work.
 *
 * Module 08's exit criterion asks that "optimized and responsive image variants exist" (RB-04) while §8
 * of `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` bars producing a derivative from an asset whose rights state
 * is unknown — "the fix cannot precede the clearance" — and §10 records the sharp profile, quality,
 * width ladder and format set as an explicit non-selection. A script that only ever refuses is untested
 * machinery; a script that produces bytes without an authorisation record violates both clauses. So this
 * file asserts both halves: the real workspace must exit 3 and write nothing, and a fixture workspace
 * with an explicit profile and a clearance ledger must produce a file whose lineage joins the register.
 *
 * Fixtures live in the OS temp directory and are built by COPYING one real asset out of
 * `Noujoude.photo/`. The library is read, never written: every file in the fixture library is hashed
 * before and after each run and the hashes must match, which is the executable form of "originals are
 * never overwritten" (`.gitignore` line 45).
 *
 * The register header is not re-typed here. It is read from the delivered
 * `docs/ASSET_INVENTORY_AUDIT.csv` and rows are addressed by column name, so this test cannot drift into
 * the shape that defect H-7 was — a second copy of the column list that quietly stops agreeing.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { parseCsv } from '../lib/csv.mjs';
import { sniffFormat, readDimensions } from '../lib/image-signature.mjs';

const REPO = path.resolve(import.meta.dirname, '..', '..');
const BUILDER = path.join(REPO, 'scripts', 'build-media-derivatives.mjs');
const REGISTER = path.join(REPO, 'docs', 'ASSET_INVENTORY_AUDIT.csv');
const LIBRARY = path.join(REPO, 'Noujoude.photo');
const CRLF = String.fromCharCode(13) + String.fromCharCode(10);

/** The copied-in asset: 512×288, and its name declares no size, so it agrees with itself. */
const SOURCE_FILE = 'master_atmosphere_definitive.webp';

const HEADER = parseCsv(readFileSync(REGISTER, 'utf8'))[0];

let passCount = 0;
let failCount = 0;
const pass = (message) => {
  passCount++;
  console.log(`PASS  ${message}`);
};
const fail = (message) => {
  failCount++;
  console.log(`FAIL  ${message}`);
};
const check = (ok, message, detail) =>
  ok ? pass(message) : fail(`${message} — ${String(detail).slice(0, 400)}`);

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const cell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

/** A register row addressed by column name, everything unspecified left blank. */
function registerRow(values) {
  return HEADER.map((name) => cell(values[name])).join(',');
}

function writeRegister(file, rows) {
  writeFileSync(file, [HEADER.map(cell).join(','), ...rows].join(CRLF) + CRLF);
}

function run(args, cwd) {
  const r = spawnSync(process.execPath, [BUILDER, ...args], { encoding: 'utf8', cwd });
  return { code: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}

/**
 * A fixture workspace: a library holding one copied asset, a register describing it, a profile set and a
 * ledger. Every piece is optional because the cases are about what happens when one of them is wrong.
 */
function fixture(options = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'ndm-deriv-'));
  const library = path.join(dir, 'library');
  const store = path.join(dir, 'store');
  mkdirSync(library, { recursive: true });
  const bytes = readFileSync(path.join(LIBRARY, SOURCE_FILE));
  writeFileSync(path.join(library, SOURCE_FILE), bytes);
  const digest = sha256(bytes);
  const mime = sniffFormat(bytes);
  const size = readDimensions(bytes, mime);

  const assetPath = options.assetPath ?? SOURCE_FILE;
  const row = registerRow({
    'Asset ID': options.assetId ?? 'NDM-TEST-001',
    Filename: SOURCE_FILE,
    'Physical Status': options.status ?? 'PRESENT',
    'Actual Path': assetPath,
    'MIME Type': options.mime ?? mime,
    Width: size?.width ?? 0,
    Height: size?.height ?? 0,
    'File Size': bytes.length,
    'SHA-256': options.sha ?? digest,
    'Rights Status': options.rights ?? 'Awaiting Rights Review',
    'Brand/Curatorial Approval': options.approval ?? 'Not Approved — no approval record supplied',
  });
  const register = path.join(dir, 'register.csv');
  writeRegister(register, [row]);

  const profiles = path.join(dir, 'profiles.json');
  if (options.profiles !== false) {
    writeFileSync(
      profiles,
      JSON.stringify({
        profiles: [
          { id: 'probe', mime: 'image/webp', quality: 80, resize: { width: 256, height: 144, fit: 'cover' } },
          ...(options.extraProfiles ?? []),
        ],
      }),
    );
  }

  const ledger = path.join(dir, 'ledger.json');
  if (options.ledger !== false) {
    writeFileSync(
      ledger,
      JSON.stringify({
        approvals: [
          {
            assetId: options.ledgerAssetId ?? options.assetId ?? 'NDM-TEST-001',
            rightsStatement: options.ledgerRights ?? options.rights ?? 'Awaiting Rights Review',
            approvalStatement:
              options.ledgerApproval ?? options.approval ?? 'Not Approved — no approval record supplied',
            approvedBy: 'fixture',
            approvedAt: '2026-11-02',
          },
        ],
      }),
    );
  }

  const libraryHashes = () =>
    Object.fromEntries(
      readdirSync(library).map((name) => [name, sha256(readFileSync(path.join(library, name)))]),
    );

  const invoke = (over = {}) =>
    run(
      [
        '--profile',
        over.profile ?? 'probe',
        '--profiles',
        over.profiles ?? profiles,
        '--ledger',
        over.ledger ?? ledger,
        '--register',
        register,
        '--library',
        library,
        '--store',
        store,
        ...(over.extra ?? []),
      ],
      dir,
    );

  return { dir, library, store, invoke, libraryHashes, digest, mime, size, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

// ── 1. the real workspace: nothing is authorised, so nothing is written ────────────────────────────
{
  const r = run(
    ['--profile', 'probe', '--profiles', 'media-derivatives/profiles.json', '--ledger', 'media-derivatives/clearance.json'],
    REPO,
  );
  check(
    r.code === 3 && /no profile set exists/.test(r.out),
    'the delivered workspace exits 3 naming §10, because no profile set and no clearance ledger exist',
    `code ${String(r.code)}: ${r.out}`,
  );
  check(
    !existsSync(path.join(REPO, 'media-derivatives')),
    'and it creates no derivative store while nothing is authorised',
    'media-derivatives/ exists',
  );
  const missing = run([], REPO);
  check(
    missing.code === 2 && /must be supplied/.test(missing.out),
    'a bare invocation is a usage error, not a silent no-op',
    `code ${String(missing.code)}: ${missing.out}`,
  );
}

// ── 2. an authorised fixture produces a file whose lineage joins the register ─────────────────────
{
  const f = fixture();
  const before = f.libraryHashes();
  const r = f.invoke();
  try {
    check(r.code === 0 && /produced 1 derivative/.test(r.out), 'an explicit profile plus a ledger that quotes the register produces one derivative', `code ${String(r.code)}: ${r.out}`);
    const manifestFile = path.join(f.store, 'lineage.json');
    check(existsSync(manifestFile), 'and writes the lineage manifest into the private store, not the library', manifestFile);
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
    check(
      JSON.stringify(Object.keys(manifest).sort()) ===
        JSON.stringify(['derivatives', 'generatedAt', 'originalsUnchanged', 'storeDirectory']),
      'the manifest carries exactly the four keys the loader declares',
      Object.keys(manifest),
    );
    const [row] = manifest.derivatives ?? [];
    check(
      row !== undefined &&
        JSON.stringify(
          Object.keys(row).sort(),
        ) ===
          JSON.stringify([
            'assetId',
            'bytes',
            'file',
            'height',
            'mime',
            'originalFilename',
            'originalSha256',
            'profile',
            'sha256',
            'width',
          ]),
      'and one lineage row with the ten fields that make it joinable and checkable',
      row,
    );
    check(
      row?.originalSha256 === f.digest,
      'the row names the original by the SHA-256 the register recorded, which is the O-09 relationship',
      row?.originalSha256,
    );
    check(
      row?.width === 256 && row?.height === 144,
      'the recorded pixels are measured from the produced bytes, not asked of the profile',
      `${String(row?.width)}x${String(row?.height)}`,
    );
    check(
      row !== undefined &&
        existsSync(path.join(f.store, row.file)) &&
        sha256(readFileSync(path.join(f.store, row.file))) === row.sha256,
      'and the file on disk hashes to the digest the manifest claims',
      row?.file,
    );
    check(manifest.originalsUnchanged === true, 'the manifest reports the originals as unchanged', manifest.originalsUnchanged);
    check(
      JSON.stringify(f.libraryHashes()) === JSON.stringify(before),
      'and every file in the library is byte-identical after the run',
      'a fixture original moved during the build',
    );
  } finally {
    f.cleanup();
  }
}

// ── 3. the ledger cannot overrule the register ────────────────────────────────────────────────────
{
  const stale = fixture({ ledgerRights: 'Cleared — licence granted by the Owner' });
  const r1 = stale.invoke();
  check(
    r1.code === 3 && /rights_statement_changed/.test(r1.out),
    'a ledger quoting a rights statement the register does not carry is refused, not obeyed',
    `code ${String(r1.code)}: ${r1.out}`,
  );
  check(!existsSync(stale.store), 'and nothing is written for it', stale.store);
  stale.cleanup();

  const ghost = fixture({ ledgerAssetId: 'NDM-AST-999' });
  const r2 = ghost.invoke();
  check(
    r2.code === 3 && /not_in_register/.test(r2.out),
    'a ledger naming an asset the register does not have is refused',
    `code ${String(r2.code)}: ${r2.out}`,
  );
  ghost.cleanup();

  const missing = fixture({ status: 'MISSING' });
  const r3 = missing.invoke();
  check(
    r3.code === 3 && /physical_MISSING/.test(r3.out),
    'a ledger row for an asset that is not physically present is refused on its status',
    `code ${String(r3.code)}: ${r3.out}`,
  );
  missing.cleanup();

  const wrong = fixture({ assetPath: '../escape.webp' });
  const r4 = wrong.invoke();
  check(
    r4.code === 3 && /path_escapes_library/.test(r4.out),
    'a register path that climbs out of the library is refused before any byte is read',
    `code ${String(r4.code)}: ${r4.out}`,
  );
  wrong.cleanup();

  const shifted = fixture({ mime: 'image/jpeg' });
  const r5 = shifted.invoke();
  check(
    r5.code === 3 && /mime_mismatch/.test(r5.out) && /image\/webp/.test(r5.out),
    'a register MIME cell contradicted by the container is refused, with the real container named',
    `code ${String(r5.code)}: ${r5.out}`,
  );
  check(!existsSync(shifted.store), 'and no derivative is minted from a mis-described file', shifted.store);
  shifted.cleanup();
}

// ── 4. a modified original is detected, not derived from ─────────────────────────────────────────
{
  const f = fixture();
  // Tamper the library copy after the register row was written with the pristine checksum: this is what
  // a modified original actually looks like, and the pipeline must stop rather than mint a lineage claim
  // against a file that no longer matches the register.
  writeFileSync(path.join(f.library, SOURCE_FILE), readFileSync(path.join(LIBRARY, SOURCE_FILE)).subarray(0, 512));
  const r = f.invoke();
  check(
    r.code === 3 && /checksum_mismatch/.test(r.out),
    'an original that no longer hashes to its register checksum is refused',
    `code ${String(r.code)}: ${r.out}`,
  );
  check(!existsSync(f.store), 'and no derivative store is created from it', f.store);
  f.cleanup();
}

// ── 5. no invented defaults ─────────────────────────────────────────────────────────────────────
{
  const absent = fixture({ profiles: false });
  const r = absent.invoke({ profiles: path.join(absent.dir, 'absent-profiles.json') });
  check(
    r.code === 3 && /no profile set exists/.test(r.out) && /§10/.test(r.out),
    'a missing profile file exits 3 citing the recorded non-selection instead of choosing a profile',
    `code ${String(r.code)}: ${r.out}`,
  );
  absent.cleanup();

  const listed = fixture();
  const unknown = listed.invoke({ profile: 'webp-80-1600' });
  check(
    unknown.code === 2 && /is not in/.test(unknown.out) && /probe/.test(unknown.out),
    'an unlisted profile id is a usage error, and the defined ids are named back',
    `code ${String(unknown.code)}: ${unknown.out}`,
  );
  listed.cleanup();

  const bad = fixture({
    extraProfiles: [{ id: 'oops', mime: 'image/png', quality: 80, resize: { width: 256 } }],
  });
  const badRun = bad.invoke({ profile: 'oops' });
  check(
    badRun.code === 2 && /this script emits/.test(badRun.out),
    'a profile that asks for a format outside the declared set is refused with the set named',
    `code ${String(badRun.code)}: ${badRun.out}`,
  );
  const noQuality = fixture({
    extraProfiles: [{ id: 'loose', mime: 'image/webp', quality: 'high', resize: { width: 256 } }],
  });
  const looseRun = noQuality.invoke({ profile: 'loose' });
  check(
    looseRun.code === 2 && /quality/.test(looseRun.out),
    'and a profile whose quality is a word rather than a bounded integer is refused too',
    `code ${String(looseRun.code)}: ${looseRun.out}`,
  );
  bad.cleanup();
  noQuality.cleanup();
}

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount ? 1 : 0);
