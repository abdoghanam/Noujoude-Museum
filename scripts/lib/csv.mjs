#!/usr/bin/env node
/**
 * scripts/lib/csv.mjs — the one RFC-4180-ish CSV reader used by the audit and by the preflight gate.
 *
 * Moved verbatim out of scripts/audit-assets.mjs. The preflight gate previously split rows with the regex
 * /("([^"]|"")*"|[^,]*)/g and then filtered out empty matches, which drops every empty cell and shifts the
 * remaining columns left — so a row with an empty Notes field made the gate read the wrong column as the
 * SHA-256. Sharing one correct parser is what keeps a checking tool from disagreeing with the register it
 * checks (defect H-7).
 */

export function parseCsv(text) {
  const rows = [];
  let row = [],
    cell = "",
    q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export default { parseCsv };
