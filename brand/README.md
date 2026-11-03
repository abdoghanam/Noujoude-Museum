# Noujoude — identity system

Everything in `brand/svg/` and `brand/png/` is **generated**. The wordmarks, lockups,
badge, icon, small mark and watermarks come from one build chain; nothing was drawn by
hand in a design tool, and nothing should be edited there either.

```
node brand/_tools/build.mjs      # → brand/svg/**  (15 colour + 10 mono) + manifest.json
node brand/_tools/export.mjs     # → brand/png/**  (88 rasters) + _tools/export-manifest.json
node brand/_tools/export.mjs --check   # also writes the proof sheets in brand/_tools/_t/
node brand/_tools/inventory.mjs  # → docs/BRAND_ASSET_INVENTORY.csv (114 rows)
```

Run them in that order. Each step reads what the previous one *recorded*, not what it
is assumed to have produced — see [The catalogue](#the-catalogue).

The one file that *is* hand-authored and *is* meant to be edited directly is
[`brand/noujoude-monogram-seal.svg`](./noujoude-monogram-seal.svg) — the parent
artwork that `build.mjs` reads. See [Editing the seal](#editing-the-seal).

```
brand/
├── noujoude-monogram-seal.svg   hand-authored parent · the only source of the seal
├── svg/                         15 colour marks + manifest.json      ← generated
│   └── mono/                    10 single-ink variants               ← generated
├── png/                         88 rasters in 7 folders              ← generated
├── _tools/                      build.mjs · export.mjs · text2svg.py · contact.mjs ·
│                                joincheck.mjs · inventory.mjs · fonts/ · export-manifest.json
├── _trace/                      the redraw toolkit that produced the seal (53 scripts + renders)
└── _tools/_t/                   proof sheets and intermediate renders
```

`_trace/` and `_t/` are kept because they are the evidence trail, not because they are
tidy: the scripts record how the seal was measured and drawn, and "layered, not traced"
is a claim about process that needs a process on file. They are never a deliverable and
nothing downstream reads them. The scripts are tracked; the ~11 MB of probe renders they
emitted are git-ignored, not deleted — re-running the tools regenerates them.
[`brand/_tools/_t/regress-medi.svg`](./_tools/_t/regress-medi.svg) is the one specimen
that is neither: it is the broken shaping, kept so the defect described under
[Arabic shaping](#arabic-shaping--how-it-is-verified) can be seen rather than taken on
trust.

---

## The name, and where it came from

The Arabic name is **نجود**, supplied by the Owner on 2 November 2026. It closes
`OID-01` and `OID-02` in [`docs/OWNER_INPUT_REGISTER.md`](../docs/OWNER_INPUT_REGISTER.md) — the
Arabic-name field of the first, the Arabic-rendering field of the second. It did not close either
row: OID-01 still owes the English legal name, the legal nature and the jurisdiction, and OID-02
still owes the Arabic tagline and the rest of the brand strings. It arrived as a chat message, not as a file under `reference/`, so the register entry
carries that caveat.

The Owner's own spelling used kashida: **نــجــود**. That spelling is preserved as its
own asset (`noujoude-wordmark-arabic-kashida.svg`) rather than being treated as the
default; نجود without elongation is the standard form and is what the lockups use.

The Arabic tagline **متحف التراث الرقمي** is *not* an Owner fact. It is a build
proposal derived from the approved English tagline. It is marked as such in
`manifest.json → tagline` and must not be treated as approved institutional wording.

---

## What each file is for (§12.7 roles)

| §12.7 role | Latin | Arabic |
|---|---|---|
| Primary Wordmark | `noujoude-wordmark-latin.svg` | `noujoude-wordmark-arabic.svg` |
| Primary Wordmark, alternate cut | `noujoude-wordmark-latin-ornamented.svg` | `…-arabic-tajawal.svg` |
| Stacked Wordmark | `noujoude-lockup-stacked-latin.svg` | `noujoude-lockup-stacked-arabic.svg` |
| Horizontal lockup (name + tagline) | `noujoude-lockup-horizontal-latin.svg` | `noujoude-lockup-horizontal-arabic.svg` |
| N Monogram / Seal | `noujoude-seal.svg` | shared |
| Burgundy Badge | `noujoude-badge-burgundy.svg` | shared |
| App icon / small mark | `noujoude-icon-app.svg`, `noujoude-mark-small.svg` | shared |
| Watermark | `noujoude-watermark-latin.svg` | `noujoude-watermark-arabic.svg` |

Alternate Arabic cut: §12.5 assigns Arabic display to **Tajawal**, but the wordmark
ships in **Amiri Bold** as primary. Amiri is a naskh face and carries the museum's
antiquarian register the way Cormorant does on the Latin side; Tajawal is a geometric
sans and reads as UI, not as an institutional name. Both are shipped, the deviation is
recorded, and it is a decision for the brand approval gate (BA-001), not a silent pick.

---

## Two rules that are structural, not advisory

**Never stretch.** `run()` in `build.mjs` applies one scale factor `k` to x and y. There
is no code path that can produce a stretched mark, so a stretched mark can only come
from someone editing a viewBox by hand.

**Never letterspace Arabic.** `run()` throws if a run has `direction: 'rtl'` and a
non-zero tracking. Arabic is joined script; tracking pulls the letters apart and breaks
the joining. Latin tracking (30/1000 em on the name, 300 on the caps, 320 on the
tagline) is applied per-glyph at shape time and is unaffected.

**Do not recreate the seal from text.** §12.7 forbids it, and the seal is drawn artwork
(a laurel, a crest, a beaded ring, a monogram with a swash) that no typeface contains.

---

## Sizing

**Clear space.** Lockups and badges: 0.24 × the seal ink diameter on every side.
Wordmark alone: 1 × its own cap height. Small mark: 0.5 × the mark box.
Clear space is **not** baked into any viewBox — the viewBox carries only 12 units of
breathing room, which is not clear space.

**Minimum sizes.**

| Asset | Minimum |
|---|---|
| Small mark | 16 px |
| Seal | 64 px (96 px before the beaded ring collapses) |
| Latin wordmark | 132 px wide |
| Arabic wordmark | 110 px wide |
| Horizontal lockup | 260 px wide |
| Stacked lockup | 150 px wide |
| Wordmark in print | 24 mm |

These were read off `brand/_tools/_t/sizes.jpg`, which renders the mark at 16/24/32/48/64/96
and the seal at 64/96/128/192/256. Below 24 px the small mark's ring disappears and only
the burgundy plate and the N survive; below 96 px the seal's beaded ring turns to mush.

**Alignment is optical, not geometric.** The seal's ink box is `94,95 → 929,936` — the
wreath overhangs the ring by about 120 units, so aligning to the 1024 frame leaves every
lockup visibly high and left. `sealAt()` centres on the measured ink box.

**The two scripts are not sized the same way.** Latin ink is 4.01:1, Arabic 1.30:1.
Matching widths would make the Arabic name twice as tall as the Latin one, so the
Arabic name is sized by *height* against the Latin name with a 1.25 allowance (naskh
carries its mass vertically). The rule is in `build.mjs` next to `ARA_NAME_H`.

---

## Colour

Every fill in every colour file is one of the twelve §12.2 tokens, emitted as a CSS
custom property with the hex as its fallback:

```
--ndm-noir #111014 · --ndm-midnight #1A151C · --ndm-burgundy #351522 · --ndm-burgundy2 #552536
--ndm-gold #C6A56B · --ndm-champagne #DFC99E · --ndm-ivory #F3EBDD · --ndm-paper #E5D8C3
--ndm-stone #9D9184 · --ndm-rose #A96D78 · --ndm-wood #30241F · --ndm-glass #D8D9D5
```

So a mark re-tints from the design tokens in a browser and still renders standalone in
any other viewer.

**Approved grounds.** Noir, Midnight Velvet, Deep Burgundy, Heritage Burgundy.
Light grounds (Warm Ivory, Archive Paper) are allowed only in single ink — see below.

**Gold on ivory is 1.9:1.** That is below every text and icon threshold, so it is not a
taste question. On a light ground, set `--ndm-gold` to burgundy `#351522`, or use the
badge on its own disc.

## The mono set, and why it exists

`brand/svg/mono/` holds ten single-ink variants where every paint is `currentColor`.
Two reasons:

1. **librsvg ignores CSS custom properties.** It paints the `var(--x,#hex)` fallback and
   never sees the token. Verified with a three-rect test where `--ndm-gold` was set to
   red in a `<style>` block — all three rects came out `#C6A56B`. `currentColor` *is*
   honoured, so every light-ground raster in `brand/png/` is rendered from the mono cut
   with an explicit `color="#351522"`.
2. A mark that must print in one ink — engraving, foil, embossing, wax — needs a file
   that is genuinely one ink, not one that happens to look like it.

A mono wrapper may set `color` and nothing else. `fill` and `stroke` are inherited, so
setting them on the wrapper strokes every unstroked path inside the seal.

---

## Arabic shaping — how it is verified

`text2svg.py` shapes with HarfBuzz and draws the outlines from the same engine, so an
instance can never desync between advances and glyphs. `isol`, `init`, `medi` and `fina`
are **deliberately not requested**: the Arabic shaper already selects positional forms,
and re-enabling those tags as user features runs the GSUB lookups a second time over the
output glyphs, which un-joins them. Both halves of that claim are reproducible at
`--size 1000` on Amiri Bold: the default set gives **layout width 1437/1000 em, 4 ink
components**; adding `medi=1,fina=1` gives **2070, 6 components** — four detached letters
plus two dots. That broken run is kept as a specimen at
[`_t/regress-medi.svg`](./_tools/_t/regress-medi.svg). (The ink boxes quoted here come
from a bare `--emit svg` call; the shipped files are measured by `build.mjs` through
`--emit json`, which is why `manifest.json → type.arabicAmiri` reads 1.30 where the
command above reads 1.28. Same shaping, two measurement points.)

The check is geometric, because a shaper can report correct forms and still lay them out
so they never touch:

```
node brand/_tools/joincheck.mjs brand/svg/noujoude-wordmark-arabic.svg 1024
→ 4 components   (joined ن+ج+و body · detached د · two dots)
```

Cross-checked against Blink rendering the same TTF as a base64 `@font-face`:
143.7/100 em, 4 islands. Both wordmarks agree.

---

## Editing the seal

`brand/noujoude-monogram-seal.svg` is layered, not traced. Everything symmetric is
authored once and mirrored, so a change lands on both sides.

| id | what it is |
|---|---|
| `#gWide`, `#gLetter` | the gold tone; `gLetter` is radial so a 180° rotation cannot reverse it |
| `#gLeaf`, `#gBerry`, `#gGem` | objectBoundingBox gradients, work at any scale |
| `#leaf` | one laurel leaf, 100 × 32 along +X — also the source for the wordmark sprig |
| `#branch` | one wreath branch (leaves + berries); mirrored for the other side |
| `#n-half` | left stem, thorn, swash and foot serif of the monogram |
| `#strand` | the diagonal, drawn once in full and copied at 180° |
| `#crest-half` / `#footer-half` | right halves only, mirrored |
| `#frame`, `#wreath`, `#crest`, `#footer`, `#monogram` | the assembled artwork |

After editing, re-run `build.mjs` — it re-reads the seal, re-measures the ink box, and
re-emits every lockup, badge, icon, watermark and mono variant.

---

## The catalogue

[`docs/BRAND_ASSET_INVENTORY.csv`](../docs/BRAND_ASSET_INVENTORY.csv) has one row per
file — 114 rows, the same 20 columns as `docs/ASSET_INVENTORY_AUDIT.csv` — with size,
SHA-256, dimensions, provenance, rights and approval state. It is regenerated, not
maintained: `node brand/_tools/inventory.mjs`.

It is a separate file because `ASSET_INVENTORY_AUDIT.csv` is the output of
`scripts/audit-assets.mjs`, which enumerates `Noujoude.photo/`. Hand-appending brand rows
there would be erased on its next run and would make that CSV disagree with its own
generator.

Three things the catalogue refuses to guess:

**A raster's master is read from `brand/_tools/export-manifest.json`,** which
`export.mjs` writes at the moment it rasterises. Deriving it from the filename is a real
bug that was live here: `og-1200x630-arabic.png` catalogued against the *Latin* stacked
lockup, because `-\d+.*$` ate the `-arabic` marker along with the size. The exporter now
records `src`, ground and ink per file, and the inventory warns if a PNG has no record
instead of inventing one.

**Rights are read from the markup.** A file that contains seal artwork — tested by the
ids only the seal drawing has (`id="n-half"`, `<g id="artwork">`, `href="#leaf"`) —
inherits `NDM-AST-001`'s UNKNOWN status; a file that contains only HarfBuzz outlines does
not. The previous rule was a naming convention: a row was rights-open if its master was
`noujoude-seal`. That counted **23** of 114. The markup test counts **77**, so **54 rows
moved in the stricter direction** — the badge, the app icon, all four lockups, both
watermarks and the ornamented Latin wordmark all inline seal artwork (the ornamented
wordmark's sprig is literally the seal's `#leaf`), and every raster of a master that does
inherits the question too. Only 37 rows are clean, and they are the ones that should be:
the plain Latin and Arabic wordmarks, the two Arabic alternates, the kashida cut, and the
small mark — which is a geometric N, not a shrunken seal.

**Nothing is approved.** Every row carries `Not Approved — OID-18 is Outstanding`. The
name arrived; the logo did not get signed off. Those are different registers, and
protocol §7.5 says publishing an answer never authorises a different one.

---

## Rights and status

The seal is a redraw of `NDM-AST-001` (`brand_seal_monogram_1024.webp`), whose provenance
and rights are **UNKNOWN** and whose approval state is **Not Approved**. The redraw is a
derivative of an unprovenanced asset and inherits that question; it is not a clearance.

The wordmarks are independent: outlines drawn by HarfBuzz from four SIL Open Font
Licence 1.1 families, with no reference to the unknown asset. Note that the ornamented
Latin wordmark is *not* fully independent — its laurel sprig is composed from the seal's
own `#leaf`, so it carries the seal's question with it.

| Family | Role here | Licence |
|---|---|---|
| Cormorant Garamond | Latin display, name and caps | OFL 1.1 |
| Inter | (available for UI; not used in these marks) | OFL 1.1 |
| Amiri | Arabic wordmark, primary | OFL 1.1 |
| Tajawal | Arabic display per §12.5, and the Arabic tagline | OFL 1.1 |

Outlines ship as paths, so no font file travels with a mark and no licence text has to
accompany one. The OFL does reserve the font *names* — do not rename a face to "Noujoude".

`NDM-AST-001` itself stays in `docs/ASSET_INVENTORY_AUDIT.csv`, which owns the
`Noujoude.photo/` originals; these 114 `NDM-BRD-` rows own `brand/`. The open rights
question is recorded in both, and `OID-15`/`OID-16`/`OID-18` in
[`docs/OWNER_INPUT_REGISTER.md`](../docs/OWNER_INPUT_REGISTER.md) are what has to close
before any of it is published.
