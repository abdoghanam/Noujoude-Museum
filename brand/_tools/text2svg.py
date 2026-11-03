#!/usr/bin/env python3
"""
text2svg — shape text with HarfBuzz and emit the result as editable SVG outlines.

Why this exists: the Noujoude wordmarks must ship as vectors, not live text, so they
render identically everywhere and cannot be "recreated from text" (Master Spec §12.7
integrity rule). Arabic in particular must go through a real shaper — the four forms
of نجود (initial / medial / final / isolated) and the marks only come out right via
GSUB/GPOS, never by laying glyphs side by side.

Everything (shaping AND outlines) comes out of the same HarfBuzz font, so variable
instances cannot desync: font.set_variations() is applied before both.

Usage
    text2svg --font F --text S [--size N] [--wght N] [--var tag=v,...]
             [--tracking N] [--out FILE] [--fill C] [--display-name NAME]
             [--features k=v,...] [--centre-baseline] [--emit svg|path|json]

    --font     a .ttf/.otf on disk (variable fonts are instanced at --wght)
    --size     em size in SVG user units (default 100)
    --wght     value for the 'wght' axis, ignored for static fonts
    --var      any axis, e.g. --var opsz=72 (same engine as --wght)
    --tracking letterspacing per glyph in 1/1000 em (the design-tool convention).
               Added to every x_advance; the INK viewBox is unaffected because the
               trailing space sits outside the last glyph's outlines.
    --fill     colour for the <path> (default currentColor so the SVG stays tintable)
    --out      write here, else stdout
    --emit     svg  = standalone file (default)
               path = bare d= string, for dropping into a larger artwork
               json = machine-readable, for a build script composing lockups

The viewBox is the INK bounding box, y-down, with the typographic baseline at y = 0.
Advances honour HarfBuzz x_advance / y_advance, so RTL text comes out right-to-left.
"""
import argparse
import json
import re
import sys

import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen


# Deliberately absent: isol / init / medi / fina.
# HarfBuzz's Arabic shaper already picks the positional forms. Re-enabling those
# tags as *user* features runs the same GSUB lookups a second time over the output
# glyphs, which re-substitutes them into forms that no longer join. Measured on
# Amiri-Bold, "نجود": default shaping is 450+345+55+587 = 1437 units and the ink is
# four islands (joined body, dal, two dots); with medi=1/fina=1 the sum becomes
# 2070 and the letters come apart. The browser (Blink/HarfBuzz) agrees with 1437.
# Everything else here is on by default anyway — it is listed so the shaping is
# reproducible from the file alone.
DEFAULT_FEATURES = {
    "ccmp": True, "liga": True, "clig": True, "rlig": True, "calt": True,
    "kern": True, "mark": True, "mkmk": True, "locl": True,
    "pres": True, "abvs": True, "blws": True, "psts": True,
}


class FlippingPen:
    """HarfBuzz draws in font units, y-up. Pass everything through to an
    SVGPathPen with y negated and the pen origin added, so the output is
    y-down SVG user units with the baseline at y = 0."""

    def __init__(self, out, sx, sy, ox, oy):
        self.o, self.sx, self.sy, self.ox, self.oy = out, sx, sy, ox, oy

    def _p(self, x, y):
        return self.ox + x * self.sx, self.oy - y * self.sy

    def moveTo(self, p0): self.o.moveTo(self._p(*p0))
    def lineTo(self, p0): self.o.lineTo(self._p(*p0))
    def curveTo(self, *points): self.o.curveTo(*[self._p(*p) for p in points])
    def qCurveTo(self, *points): self.o.qCurveTo(*[self._p(*p) if p is not None else None for p in points])
    def closePath(self): self.o.closePath()
    def endPath(self): self.o.endPath()
    def addComponent(self, name, transform):
        # HarfBuzz's own drawer resolves components, so this is only reached if a
        # client ever draws through fontTools instead; keep it honest and fail loudly.
        raise NotImplementedError("component glyphs must be drawn by HarfBuzz")


def num(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


TOKEN = re.compile(r"[A-Za-z]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?")


def tidy(d):
    """SVGPathPen emits full float precision. Round to 2 dp and put clean single
    spaces between tokens so a wordmark path stays readable in a text editor."""
    out = []
    for tok in TOKEN.findall(d):
        if tok[0].isdigit() or tok[0] in "+-.":
            v = float(tok)
            s = f"{v:.2f}".rstrip("0").rstrip(".")
            out.append("0" if s in ("-0", "") else s)
        else:
            out.append(tok)
    return " ".join(out)


def pairs(spec):
    """'opsz=72,SOFT=50' -> {'opsz': 72.0, 'SOFT': 50.0}"""
    out = {}
    for kv in filter(None, (k.strip() for k in spec.split(","))):
        k, _, v = kv.partition("=")
        out[k] = float(v)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--font", required=True)
    ap.add_argument("--text", required=True)
    ap.add_argument("--size", type=float, default=100.0)
    ap.add_argument("--wght", type=float, default=None)
    ap.add_argument("--var", default="", help="axis=value pairs, e.g. opsz=72,wght=650")
    ap.add_argument("--tracking", type=float, default=0.0,
                    help="letterspacing per glyph in 1/1000 em")
    ap.add_argument("--out", default=None)
    ap.add_argument("--fill", default="currentColor")
    ap.add_argument("--display-name", default="wordmark")
    ap.add_argument("--features", default="", help="e.g. liga=0,ss01=1")
    ap.add_argument("--centre-baseline", action="store_true",
                    help="shift the box so the ink is vertically centred on y=0")
    ap.add_argument("--emit", choices=("svg", "path", "json"), default="svg")
    ap.add_argument("--pad", type=float, default=0.05,
                    help="viewBox padding as a fraction of --size (svg emit only)")
    a = ap.parse_args()

    feats = dict(DEFAULT_FEATURES)
    for k, v in pairs(a.features).items():
        feats[k] = v != 0

    blob = hb.Blob.from_file_path(a.font)
    face = hb.Face(blob)
    font = hb.Font(face)
    tt = TTFont(a.font, lazy=True)
    axes = {ax.axisTag for ax in tt["fvar"].axes} if "fvar" in tt else set()
    wanted = pairs(a.var)
    if a.wght is not None:
        wanted["wght"] = a.wght
    applied = {k: v for k, v in wanted.items() if k in axes}
    if applied:
        font.set_variations(applied)
    upem = tt["head"].unitsPerEm
    font.scale = (upem, upem)          # everything below stays in font units

    buf = hb.Buffer()
    buf.add_str(a.text)
    buf.guess_segment_properties()     # direction / script / language from the codepoints
    hb.shape(font, buf, feats)
    infos, poss = buf.glyph_infos, buf.glyph_positions
    if not infos:
        sys.exit("harfbuzz produced no glyphs — this font does not cover the text")

    s = a.size / upem
    track = a.tracking / 1000 * a.size   # user units added to every advance
    pen_x = pen_y = 0.0
    parts = []
    records = []
    x0 = y0 = None
    x1 = y1 = None
    for info, pos in zip(infos, poss):
        gid = info.codepoint
        ox = pen_x + pos.x_offset * s
        oy = -(pen_y + pos.y_offset * s)
        out = SVGPathPen(None)
        font.draw_glyph_with_pen(gid, FlippingPen(out, s, s, ox, oy))
        d = out.getCommands()
        rec = {
            "gid": gid,
            "cluster": info.cluster,
            "pen_x": round(ox, 2), "pen_y": round(oy, 2),
            "x_advance": round(pos.x_advance * s + track, 3),
            "y_advance": round(pos.y_advance * s, 3),
            "x_offset": round(pos.x_offset * s, 3),
            "y_offset": round(pos.y_offset * s, 3),
        }
        if d and d.strip():
            parts.append(d)
            ex = font.get_glyph_extents(gid)
            if ex and ex[2]:
                gx, gy, gw, gh = ex
                # font units, y-up -> convert; get_glyph_extents ignores side-bearings
                # of the *positioned* glyph, so add the pen offset we actually used.
                bx0 = ox + gx * s
                bx1 = bx0 + gw * s
                by1 = oy - (gy + gh) * s   # top of the ink
                by0 = oy - gy * s          # bottom (may be < 0)
                x0 = bx0 if x0 is None else min(x0, bx0)
                x1 = bx1 if x1 is None else max(x1, bx1)
                y0 = by0 if y0 is None else min(y0, by0)
                y1 = by1 if y1 is None else max(y1, by1)
                rec["ink"] = [round(bx0, 2), round(by0, 2), round(bx1, 2), round(by1, 2)]
        records.append(rec)
        pen_x += pos.x_advance * s + track
        pen_y += pos.y_advance * s

    if not parts:
        sys.exit("glyphs had no outlines")

    d = tidy(" ".join(parts))
    info = {
        "display_name": a.display_name,
        "font": a.font.replace("\\", "/"),
        "text": a.text,
        "direction": buf.direction,
        "size": a.size,
        "upem": upem,
        "axes": applied,
        "tracking": a.tracking,
        "features_off": sorted(k for k, v in feats.items() if not v),
        "glyph_count": len(infos),
        "ink": {"x0": round(x0, 2), "y0": round(y0, 2),
                "x1": round(x1, 2), "y1": round(y1, 2),
                "w": round(x1 - x0, 2), "h": round(y1 - y0, 2)},
        "layout_width": round(pen_x, 2),
        "glyphs": records,
        "path": d,
    }

    if a.emit == "path":
        text = d + "\n"
        note = (f"# {a.display_name}: {len(infos)} glyphs · ink {num(x1 - x0)}×{num(y1 - y0)}"
                f" · layout width {num(pen_x)} · direction {buf.direction}\n")
    elif a.emit == "json":
        text = json.dumps(info, ensure_ascii=True, indent=1) + "\n"
        note = f"# {a.display_name}: written as json\n"
    else:
        pad = a.size * a.pad
        dy = -(y0 + y1) / 2 if a.centre_baseline else 0.0
        w, h = (x1 - x0) + 2 * pad, (y1 - y0) + 2 * pad
        vb = f"{num(x0 - pad)} {num(y0 - pad + dy)} {num(w)} {num(h)}"
        info["viewBox"] = vb
        text = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
            f'width="{num(w)}" height="{num(h)}" role="img" '
            f'aria-label="{a.display_name}">\n'
            f'  <path fill="{a.fill}" fill-rule="nonzero" d="{d}"/>\n'
            f'</svg>\n'
        )
        note = (f"# {a.display_name}: {len(infos)} glyphs · ink {num(w)}×{num(h)} · "
                f"layout width {num(pen_x)} · direction {buf.direction}"
                f"{' · axes ' + str(applied) if applied else ''}"
                f"{' · tracking ' + num(a.tracking) if a.tracking else ''}\n")

    if a.out:
        with open(a.out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
    else:
        try:
            sys.stdout.write(text)
        except UnicodeEncodeError:
            sys.stdout.buffer.write(text.encode("utf-8"))
    sys.stderr.write(note)


if __name__ == "__main__":
    main()
