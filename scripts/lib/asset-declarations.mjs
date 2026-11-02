#!/usr/bin/env node
/**
 * scripts/lib/asset-declarations.mjs — the filename self-declaration rule.
 *
 * Moved verbatim out of scripts/audit-assets.mjs so that scripts/preflight.mjs applies exactly the same
 * rule as the audit that is its source of truth. The catalog encodes size or ratio in the file name
 * (`_1024`, `_16x9`, `_4x3`, `_9x16`, `_1024x1536`), and the two forms are mutually exclusive patterns:
 * an independently written copy drifts, and a gate that counts a different set of mismatches from the
 * audit is worse than no gate, because the numbers are cited in the reports.
 *
 * Three declaration forms, checked in this order, first match wins (unchanged from the original):
 *   exact  `_WxH`  with 2-4 digits each     → the file must be exactly W×H
 *   ratio  `_AxB`  with 1-2 digits each     → width/height must be within 0.02 of A/B
 *   size   `_N`    with 3-4 digits          → the longest side must be at least N
 */

/**
 * @returns {string|null} a human-readable mismatch description, or null when the name and the pixels agree.
 */
export function declarationMismatch(filename, w, h) {
  if (!w || !h) return null;
  const stem = filename.replace(/\.[^.]+$/, "");
  const exact = stem.match(/_(\d{2,4})x(\d{2,4})$/);
  const ratio = stem.match(/_(\d{1,2})x(\d{1,2})$/);
  const size = stem.match(/_(\d{3,4})$/);
  const actualRatio = w / h;
  if (exact) {
    const [dw, dh] = [Number(exact[1]), Number(exact[2])];
    if (dw !== w || dh !== h)
      return `filename declares ${dw}x${dh}, file is ${w}x${h}`;
    return null;
  }
  if (ratio) {
    const want = Number(ratio[1]) / Number(ratio[2]);
    if (Math.abs(want - actualRatio) > 0.02) {
      return `filename declares ${ratio[1]}:${ratio[2]} (ratio ${want.toFixed(3)}), actual ratio ${actualRatio.toFixed(3)} (${w}x${h})`;
    }
    return null;
  }
  if (size) {
    const declared = Number(size[1]);
    if (Math.max(w, h) < declared) {
      return `filename declares ${declared}px, longest side is ${Math.max(w, h)}px (${w}x${h})`;
    }
    return null;
  }
  return null;
}

export default { declarationMismatch };
