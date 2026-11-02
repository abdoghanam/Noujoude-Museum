/**
 * scripts/lib/asset-declarations.d.mts — types for the filename self-declaration rule.
 *
 * `scripts/preflight-asset-reconciliation.test.mjs` asserts that the gate and the audit report the
 * *same* 18 name/pixel mismatches because they call this one function. The media layer derives its
 * dimension claims from the same place, so R-04 ("no code trusts a filename") is enforced by one
 * rule rather than restated in three.
 */

/**
 * A human-readable mismatch description, or `null` when the filename's self-declaration and the
 * measured pixels agree. Three declaration forms, first match wins: `_WxH` exact, `_AxB` ratio,
 * `_N` minimum longest side.
 */
export function declarationMismatch(
  filename: string,
  width: number,
  height: number,
): string | null;

declare const assetDeclarations: {
  declarationMismatch: typeof declarationMismatch;
};
export default assetDeclarations;
