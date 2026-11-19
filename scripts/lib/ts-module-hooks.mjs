/**
 * scripts/lib/ts-module-hooks.mjs — let a plain Node script import the TypeScript modules in `src/`.
 *
 * Why this exists: `src/lib/media/usage-map.ts` is the only authority on which surface is bound to which
 * route, and a governance generator that needs that answer has three options. It can duplicate the table in
 * JavaScript, which is the H-7 defect class this repository has already paid for once (two parsers, one
 * column shift). It can hand-author the answer into a JSON file and hope the map and the file keep agreeing.
 * Or it can ask the module itself. This makes the third option work outside Next's bundler.
 *
 * Node resolves `@/*` through nothing — tsconfig `paths` is a compiler setting, not a runtime one — so the
 * hook below turns `@/domain/routes` into `<root>/src/domain/routes.ts` by trying the extensions a `.ts`
 * import would take. Type stripping is Node's own (v24 runs `.ts` directly), which is why there is no
 * compiler here and no dependency added to get one.
 *
 * Scope is deliberately narrow: only a specifier that starts with `@/` and resolves to a file that exists
 * under `src/` is rewritten. Everything else — node builtins, npm packages, relative paths — goes to the
 * next hook untouched, so this cannot shadow a real module.
 */

import { existsSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SRC_DIR = path.resolve(import.meta.dirname, "..", "..", "src");

/** The extension order a bundler would try for `@/lib/media/usage-map`. */
const CANDIDATE_SUFFIXES = [
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  "/index.ts",
  "/index.tsx",
];

function resolveAlias(specifier) {
  const inner = specifier.slice(2);
  if (inner.length === 0 || inner.startsWith("/") || inner.includes(".."))
    return null;
  const base = path.resolve(SRC_DIR, inner);
  const inside =
    base === SRC_DIR || base.startsWith(SRC_DIR + path.sep) ? base : null;
  if (inside === null) return null;
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = inside + suffix;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
    const found = resolveAlias(specifier);
    if (found === null) {
      throw new Error(
        `ts-module-hooks: "${specifier}" has no file under ${SRC_DIR} — check the path before importing it from a script`,
      );
    }
    // `format` is deliberately not set. Node decides it from the file extension, and a `.ts` file must come
    // back as `module-typescript` so the built-in type stripper runs; claiming `module` here hands Node a
    // TypeScript file to parse as JavaScript, which fails on the first `import { type X }`.
    return { shortCircuit: true, url: pathToFileURL(found).href };
  },
});
