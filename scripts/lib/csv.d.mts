/**
 * scripts/lib/csv.d.mts — types for the one RFC-4180-ish CSV reader in the repository.
 *
 * Shared by `scripts/audit-assets.mjs`, `scripts/preflight.mjs` and `src/lib/server/media/registry.ts`.
 * The reason it is shared is defect H-7: the preflight gate used to split rows with a regex that
 * dropped empty cells and shifted every later column left, so a row with an empty Notes field made
 * the gate read the wrong column as the SHA-256. The media registry reads the same file, so it must
 * not carry a third parser.
 */

export function parseCsv(text: string): string[][];

declare const csv: { parseCsv: typeof parseCsv };
export default csv;
