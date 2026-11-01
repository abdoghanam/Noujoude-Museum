#!/usr/bin/env node
/**
 * scripts/verify-tables.mjs — Markdown table-shape checker for docs/.
 *
 * WHY THIS EXISTS. `verify-citations.mjs` proves that quoted text matches the line it cites. It cannot see a
 * structurally broken table: an edit whose old_string spanned two rows once deleted a row's leading `| R13 |`
 * and merged two roles onto one line, and the citation gate reported no defect (docs/CHANGELOG.md §G records
 * the incident). This tool covers that gap with no dependencies.
 *
 * THE RULES. A pipe-led run is only a table if it has a header and a delimiter row, and every row must then
 * agree on the number of cells:
 *
 *   T1  row 1 is a header. It may not itself be a delimiter row, and it must hold at least one cell.
 *   T2  row 2 is a GFM delimiter row — every cell matches /^:?-+:?$/. Without it the block is not a table at
 *       all and renders as literal text, so "uniform width" inside it proves nothing about readability.
 *   T3  the delimiter row declares the same number of columns as the header.
 *   T4  every row contains the same number of *cells* as the header. Cells, not pipes: `| a | b` and
 *       `| a | b |` are the same two columns with a different trailing pipe, which the old pipe count read
 *       as an inequality. Escaped pipes (`\|`) are content and are not separators.
 *   T5  a run must be at least two rows. One pipe-led line cannot be a table.
 *
 * WHY T1–T3 WERE ADDED (measured 31 Oct 2026). A §8 table had been split into two pipe-led runs by an edit
 * that deleted the blank line separating them from a following paragraph — no: it deleted a row, leaving a
 * second run of data rows with no header and no delimiter. The checker treated each run as its own table,
 * applied only the uniform-width rule, and reported `OK: 193 tables` while exiting 0. The document was
 * broken and the gate that exists to catch exactly this class said nothing. That is the defect this revision
 * removes: a headerless table must now fail, and a valid table must still pass.
 *
 * WHAT IT DOES NOT PROVE. Correct shape does not make a table *right*: the cell text can still be wrong,
 * mis-attributed, or stale. Passing this check is a necessary condition for a readable table, never evidence
 * of a claim's truth. Pass it alongside `audit:citations`, not instead of it.
 *
 * Usage: node scripts/verify-tables.mjs [dir ...]     (default: docs)
 * Exit:  0 = every table well-formed, 1 = at least one defect, 2 = bad invocation.
 */
import fs from 'node:fs';
import path from 'node:path';

const TARGETS = process.argv.slice(2).length ? process.argv.slice(2) : ['docs'];
const BACKSLASH = String.fromCharCode(92);

/** Pipes that are cell separators, i.e. not preceded by a backslash. */
function countSeparators(line) {
  let n = 0;
  for (let k = 0; k < line.length; k++) {
    if (line[k] !== '|') continue;
    if (k > 0 && line[k - 1] === BACKSLASH) continue;
    n++;
  }
  return n;
}

/**
 * The cells of one table row, splitting on unescaped pipes and dropping the synthetic
 * empty cell produced by the leading pipe (and by a trailing pipe, when present).
 */
function cells(line) {
  const sep = countSeparators(line);
  const parts = [];
  let cur = '';
  for (let k = 0; k < line.length; k++) {
    if (line[k] === '|' && !(k > 0 && line[k - 1] === BACKSLASH)) {
      parts.push(cur);
      cur = '';
    } else cur += line[k];
  }
  parts.push(cur);
  if (parts.length !== sep + 1) {
    // Defensive: the two walkers must agree. If they ever diverge the row count is unknown,
    // and an unknown count must not be reported as a violation of the table's shape.
    return { cells: null, separators: sep, inconsistent: true };
  }
  if (parts.length && parts[0].trim() === '') parts.shift();
  const trimmed = line.trimEnd();
  const lastIsUnescapedPipe =
    trimmed.endsWith('|') &&
    !(trimmed.length >= 2 && trimmed[trimmed.length - 2] === BACKSLASH);
  if (lastIsUnescapedPipe && parts.length && parts[parts.length - 1].trim() === '') parts.pop();
  return { cells: parts, separators: sep, inconsistent: false };
}

/** A GFM delimiter cell: dashes with optional leading/trailing alignment colons. */
const isDelimiterCell = (s) => /^:?-+:?$/.test(s.trim());

function isDelimiterRow(line) {
  const { cells: c, inconsistent } = cells(line);
  if (inconsistent || !c || c.length === 0) return false;
  return c.every(isDelimiterCell);
}

/** Files considered, recursively, skipping anything that is not a Markdown document. */
function markdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(full));
    else if (entry.isFile() && /\.md$/i.test(entry.name)) out.push(full);
  }
  return out.sort();
}

let files = 0;
let tables = 0;
let defects = 0;

for (const dir of TARGETS) {
  if (!fs.existsSync(dir)) {
    console.error(`no such directory: ${dir}`);
    process.exit(2);
  }
  if (!fs.statSync(dir).isDirectory()) {
    console.error(`not a directory: ${dir}`);
    process.exit(2);
  }
  for (const file of markdownFiles(dir)) {
    files++;
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    let inFence = false;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        i++;
        continue;
      }
      if (inFence || !/^\s*\|/.test(line)) {
        i++;
        continue;
      }
      // Collect the contiguous run of pipe-led lines: one candidate table.
      const start = i;
      const rows = [];
      while (i < lines.length && !/^\s*(```|~~~)/.test(lines[i]) && /^\s*\|/.test(lines[i])) {
        rows.push({ line: i + 1, text: lines[i] });
        i++;
      }
      tables++;
      const found = [];

      // T5 — one row can never be a table.
      if (rows.length < 2) {
        found.push({ code: 'T5', msg: `single-row pipe block (line ${rows[0].line}) cannot be a table: no header and no delimiter row` });
      } else {
        // T1 — row 1 is a header, not a delimiter and not empty.
        const header = cells(rows[0].text);
        if (header.inconsistent) {
          found.push({ code: 'T4', msg: `line ${rows[0].line}: cell count could not be determined (internal walk disagreement)` });
        } else if (isDelimiterRow(rows[0].text)) {
          found.push({ code: 'T1', msg: `table at line ${start + 1} starts with a delimiter row: it has no header` });
        } else if (header.cells.length === 0) {
          found.push({ code: 'T1', msg: `table at line ${start + 1} has an empty header row` });
        }

        // T2 — row 2 must be the delimiter row.
        if (!isDelimiterRow(rows[1].text)) {
          found.push({ code: 'T2', msg: `table at line ${start + 1} has no GFM delimiter row at line ${rows[1].line} ` +
            `(row reads "${rows[1].text.trim().slice(0, 60)}"); the block will not render as a table` });
        } else if (rows.length === 2) {
          found.push({ code: 'T5', msg: `table at line ${start + 1} has a header and a delimiter row but no data rows` });
        }

        // T3 + T4 — widths, only meaningful once the header is known.
        if (header.cells && header.cells.length && !header.inconsistent) {
          const want = header.cells.length;
          const delim = rows[1];
          if (isDelimiterRow(delim.text)) {
            const d = cells(delim.text);
            if (!d.inconsistent && d.cells.length !== want) {
              found.push({ code: 'T3', msg: `table at line ${start + 1}: header declares ${want} column(s) but the ` +
                `delimiter row at line ${delim.line} declares ${d.cells.length}` });
            }
          }
          const off = [];
          for (const r of rows.slice(2)) {
            const c = cells(r.text);
            if (c.inconsistent) {
              found.push({ code: 'T4', msg: `line ${r.line}: cell count could not be determined` });
              continue;
            }
            if (c.cells.length !== want) off.push({ line: r.line, n: c.cells.length });
          }
          if (off.length) {
            found.push({ code: 'T4', msg: `table at line ${start + 1} has ${want} column(s); ${off.length} uneven row(s): ` +
              off.slice(0, 8).map((o) => `line ${o.line} -> ${o.n}`).join(', ') +
              (off.length > 8 ? `, ... (${off.length - 8} more)` : '') });
            for (const o of off.slice(0, 8)) {
              console.log(`    line ${o.line}: ${lines[o.line - 1].slice(0, 160)}`);
            }
          }
        }
      }

      if (found.length) {
        defects++;
        for (const f of found) console.log(`${file}: [${f.code}] ${f.msg}`);
      }
    }
  }
}

if (defects) {
  console.log(`MALFORMED TABLES: ${defects} of ${tables} tables in ${files} files (exit 1)`);
  process.exit(1);
}
console.log(`OK: ${tables} tables in ${files} markdown files, each with a header, a delimiter row and a uniform column count`);
