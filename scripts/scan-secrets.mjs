// Noujoude — secret scanning (Phase 8).
// Scans src/ and scripts/ for accidental secret-like patterns.
// Exit 0 = clean, exit 1 = findings.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGETS = ["."];
const PATTERNS = [
  /AKIA[0-9A-Z]{16}/,
  /sk-[a-zA-Z0-9]{20,}/,
  /ghp_[a-zA-Z0-9]{36}/,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  /password\s*=\s*["'][^"']+["']/i,
];

const findings = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (
        name === "node_modules" ||
        name === ".next" ||
        name === ".git" ||
        name === "docs" ||
        name === "reference" ||
        name === "Noujoude.photo" ||
        name === "media-derivatives" ||
        name === "brand" ||
        name === ".tmp"
      )
        continue;
      walk(full);
    } else if (/\.(ts|tsx|js|mjs|json|env|yml|yaml)$/.test(name)) {
      const content = readFileSync(full, "utf8");
      for (const re of PATTERNS) {
        // Skip known false positives: shell-generated values and dev placeholders.
        const lines = content.split("\\n");
        for (const line of lines) {
          if (re.test(line)) {
            if (
              line.includes("$(gen)") ||
              line.includes("ChangeMe") ||
              line.includes("placeholder") ||
              line.includes("change-me")
            )
              continue;
            findings.push(
              `${relative(ROOT, full)}: ${line.trim().slice(0, 80)}`,
            );
            break;
          }
        }
      }
    }
  }
}

for (const t of TARGETS) walk(join(ROOT, t));

if (findings.length > 0) {
  console.error("SECRET SCAN FAILED:");
  for (const f of findings) console.error("  " + f);
  process.exit(1);
}
console.log("Secret scan: clean (0 findings).");
process.exit(0);
