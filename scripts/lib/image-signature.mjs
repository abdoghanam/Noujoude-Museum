#!/usr/bin/env node
/**
 * scripts/lib/image-signature.mjs — container sniffing and dimension decoding from magic bytes.
 *
 * Moved verbatim out of scripts/audit-assets.mjs so that scripts/preflight.mjs can re-derive what a
 * physical asset actually is instead of trusting the catalog's own columns. Two independent
 * implementations of the same sniffing rules is how a gate ends up disagreeing with the audit that is
 * supposed to be its source of truth, which is the class of defect recorded as H-7 and H-9.
 *
 * Dependency-free: PNG/JPEG/WebP/GIF/BMP/SVG headers only, no image library.
 * Behaviour is unchanged from the original; the extraction is verified by regenerating
 * docs/ASSET_INVENTORY_AUDIT.csv and diffing it against the pre-refactor copy.
 */

/** Detect the real container from magic bytes, independent of extension. */
export function sniffFormat(buf) {
  if (buf.length < 12) return null;
  const b = buf;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return "image/png";
  if (
    b.slice(0, 4).toString("latin1") === "RIFF" &&
    b.slice(8, 12).toString("latin1") === "WEBP"
  )
    return "image/webp";
  if (b.slice(0, 6).toString("latin1").startsWith("GIF8")) return "image/gif";
  if (b.slice(0, 4).toString("latin1") === "BM") return "image/bmp";
  if (
    b
      .slice(0, 12)
      .toString("latin1")
      .match(/^.*ftyp/)
  )
    return "video/image-unknown";
  const head = b.slice(0, 512).toString("utf8").trimStart();
  if (head.startsWith("<?xml") || head.startsWith("<svg"))
    return "image/svg+xml";
  if (head.startsWith("<!DOCTYPE html") || head.startsWith("<html"))
    return "text/html";
  return null;
}

/** Width/height decoded from container headers. No external libraries. */
export function readDimensions(buf, mime) {
  try {
    if (mime === "image/png") {
      if (buf.length < 24) return null;
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (mime === "image/jpeg") {
      let p = 2;
      while (p < buf.length - 9) {
        if (buf[p] !== 0xff) {
          p++;
          continue;
        }
        const marker = buf[p + 1];
        if (marker === 0xff) {
          p++;
          continue;
        }
        // Standalone markers with no length segment.
        if ((marker >= 0xd0 && marker <= 0xd9) || marker === 0x01) {
          p += 2;
          continue;
        }
        const len = buf.readUInt16BE(p + 2);
        // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15 carry the frame size.
        const sof = [
          0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
          0xce, 0xcf,
        ];
        if (sof.includes(marker)) {
          return {
            height: buf.readUInt16BE(p + 5),
            width: buf.readUInt16BE(p + 7),
          };
        }
        p += 2 + len;
      }
      return null;
    }
    if (mime === "image/webp") {
      let p = 12;
      while (p + 8 <= buf.length) {
        const fourcc = buf.slice(p, p + 4).toString("latin1");
        const size = buf.readUInt32LE(p + 4);
        const payload = p + 8;
        if (fourcc === "VP8X") {
          return {
            width: 1 + buf.readUIntLE(payload + 4, 3),
            height: 1 + buf.readUIntLE(payload + 7, 3),
          };
        }
        if (fourcc === "VP8 ") {
          // Keyframe header: 3-byte frame tag, then start code 9d 01 2a,
          // then 16-bit horizontal size (14 used bits) and vertical size.
          if (
            buf[payload + 3] === 0x9d &&
            buf[payload + 4] === 0x01 &&
            buf[payload + 5] === 0x2a
          ) {
            return {
              width: buf.readUInt16LE(payload + 6) & 0x3fff,
              height: buf.readUInt16LE(payload + 8) & 0x3fff,
            };
          }
          return null;
        }
        if (fourcc === "VP8L") {
          if (buf[payload] !== 0x2f) return null;
          const bits = buf.readUInt32LE(payload + 1);
          return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >> 14) & 0x3fff) + 1,
          };
        }
        if (fourcc === "ANIM" || fourcc === "ANMF") {
          p += 8 + size + (size % 2);
          continue;
        }
        if (size <= 0) break;
        p += 8 + size + (size % 2);
      }
      return null;
    }
    if (mime === "image/gif")
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    if (mime === "image/bmp")
      return {
        width: buf.readInt32LE(18),
        height: Math.abs(buf.readInt32LE(22)),
      };
    if (mime === "image/svg+xml") {
      const txt = buf.slice(0, 4000).toString("utf8");
      const w = txt.match(/\bwidth\s*=\s*"([\d.]+)/);
      const h = txt.match(/\bheight\s*=\s*"([\d.]+)/);
      const vb = txt.match(
        /\bviewBox\s*=\s*"\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/,
      );
      if (w && h) return { width: +w[1], height: +h[1] };
      if (vb) return { width: +vb[1], height: +vb[2] };
      return null;
    }
  } catch {
    return null;
  }
  return null;
}
export default { sniffFormat, readDimensions };
