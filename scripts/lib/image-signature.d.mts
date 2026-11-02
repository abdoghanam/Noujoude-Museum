/**
 * scripts/lib/image-signature.d.mts — types for the container/dimension reader.
 *
 * The implementation is JavaScript so that `node scripts/…` runs it without a build step. The media
 * layer in `src/` has to call the *same* functions the audit and the preflight gate call, because a
 * second implementation of magic-byte sniffing is exactly the defect class recorded as H-7 and H-9:
 * a checking tool that disagrees with the register it is supposed to check. This file adds types
 * without adding a copy.
 */

/** Detect the real container from magic bytes, independent of the file's extension. */
export function sniffFormat(buf: Buffer): string | null;

/** Width and height decoded from the container header, or `null` when they cannot be read. */
export function readDimensions(
  buf: Buffer,
  mime: string | null,
): { width: number; height: number } | null;

declare const imageSignature: {
  sniffFormat: typeof sniffFormat;
  readDimensions: typeof readDimensions;
};
export default imageSignature;
