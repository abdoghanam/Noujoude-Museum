import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Phase 3 exit criterion: layout code paths must use CSS logical properties
// only (no physical left/right/top/bottom in margin/padding/border/inset).
// Scans .css files under src/ for forbidden physical properties.

const ROOT = join(process.cwd(), "src");
const FORBIDDEN = [
  /margin-left\s*:/,
  /margin-right\s*:/,
  /padding-left\s*:/,
  /padding-right\s*:/,
  /border-left\s*:/,
  /border-right\s*:/,
  /left\s*:\s*\d/,
  /right\s*:\s*\d/,
  /top\s*:\s*\d/,
  /bottom\s*:\s*\d/,
];

function collectCss(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) collectCss(full, out);
    else if (name.endsWith(".css")) out.push(full);
  }
  return out;
}

describe("logical properties only", () => {
  it("no physical left/right/top/bottom properties in src CSS", () => {
    const files = collectCss(ROOT);
    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const re of FORBIDDEN) {
        if (re.test(content)) {
          violations.push(`${relative(process.cwd(), file)}: ${re}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});