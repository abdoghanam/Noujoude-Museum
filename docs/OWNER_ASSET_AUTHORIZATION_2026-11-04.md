# Owner Asset Authorisation — 4 November 2026

**Record type:** Owner-supplied authorisation, transcribed and wired into the register.
**Instrument:** Noujoude Digital Heritage Museum — Master Autonomous Completion & Production Launch Mandate, issued by the Owner on 4 November 2026 and executed in this working session.
**Sections relied on:** §1 (execution authorisation) and §2 (Owner-supplied assets).
**Machine-readable form:** `docs/asset-governance/owner-authorization.json`.
**Status:** in force for the 82 catalogued register rows. It does not extend to the three excluded paths named in §5 below.

---

## 1. What the Owner said

Quoted verbatim from mandate §2:

> The Owner authorizes the use of photographs, images, graphics, logos, design materials, and fonts that the
> Owner has supplied or explicitly identified as owned by the Owner. Treat the Owner's explicit ownership
> declaration as authorization to use those identified materials in this project.

Also from §2, quoted verbatim, because the limit is part of the instruction and not a footnote to it:

> Do not assume that an unrelated third-party file is owned merely because it exists in the repository.
>
> Do not invent historical provenance, authenticity, ownership history, copyright claims, institutional
> affiliations, or information about the artifacts depicted in images.
>
> Distinguish between permission to use an image and factual verification of the historical object
> represented in that image.
>
> Decorative generated material must be distinguishable from real museum artifacts.

No signature is recorded here. The mandate arrived as the Owner's own message in this working session; this
file transcribes what it authorised and names where the effect is measurable. Inventing a signature block, a
date of grant, or a witnessed instrument would be exactly the fabrication §2 forbids.

## 2. What that authorises, mechanically

| Dimension | Register cell wording now written on all 82 rows | State it produces |
| --- | --- | --- |
| `Rights Status` | `Owner-Declared Owned — authorisation: Owner mandate 2026-11-04 §2; supplied asset library; not evidence of a catalogued object` (72 rows) / `…project-generated imagery; illustrative only` (10 rows) | `cleared` |
| `Brand/Curatorial Approval` | `Approved — Owner mandate 2026-11-04 §2; presentation is illustrative and must not assert an inventory fact` (72) / `…generated imagery, labelled illustrative wherever shown` (10) | `approved` |
| `Actual Usage` | `Published — register: docs/asset-governance/publication-register.json — 2026-11-04 on <paths>` on the 46 rows the publication register names | `published` |
| `Alt Text Status` | `Recorded — EN and AR from docs/asset-governance/descriptive-labels.json` on all 82 | alt text available |

These strings are the whitelisted markers in `src/lib/media/asset-record.ts`. Each one is the opening of a
sentence that cites the instrument behind it, so a row can only reach `cleared`, `approved` or `published` by
carrying its own authority in the cell. That is the property the vocabulary was built for: arming is a visible
edit to a whitelist, a row that the whitelist does not recognise still denies, and `decidePublicServing` still
has no permissive default.

The gate itself did not change. `src/domain/rights.ts` still requires `rights === "cleared"` **and**
`approval === "approved"` **and** `published === true`, and `src/ui/media-slot.tsx` still draws no pixel unless
the served copy, the alt text and the measured pixels are all present. What changed is that the register now
records facts the Owner supplied, instead of recording that nobody had supplied any.

## 3. What it does not authorise

1. **It is not evidence about the object depicted.** Provenance, date, issuer, authenticity and ownership of
   any artefact shown in any of these files remain unverified. `DEC-INV-001` and blocker `B-05` stay open, and
   the inventory of the collection is still an Owner input that has not arrived.
2. **It is not a catalogue record.** None of the 82 assets is a photograph of an inventoried museum object, and
   no page may present one as one. Every published row's own approval cell says `must not assert an inventory
   fact`, and the ten generated files carry `illustrative only` for the same reason.
3. **It does not cover a file outside the list.** The 82 filenames in
   `docs/asset-governance/owner-authorization.json` are the whole scope. Anything else in the workspace — the
   uncatalogued `Noujoude.photo/` residue, a file a later batch copies in, an image found on the web — is not
   authorised by having been nearby.
4. **It does not license a font.** The four families under `brand/_tools/fonts/` carry their own `*-OFL.txt`
   texts and are governed by those, not by this mandate.

## 4. Where the descriptive labels come from

`docs/asset-governance/descriptive-labels.json` holds 82 rows of `{file, en, ar, decorative}`. Every string is
derived, not invented:

- the 72 supplied-library files are labelled from the Owner's own Appendix A `role` and `association` wording in
  `reference/Noujoude_Master_Specification_EN.md`, the same source the register's `Intended Usage` column is
  copied from;
- the 10 project-generated files are labelled from `Noujoude.photo/GENERATED_ASSETS_MANIFEST_AR.md`, which the
  generating batch wrote. Each of those ten rows carries `decorative: **false**`, measured 4 November 2026 against
  the file itself, and that is the correct flag: a country-world hero and a collection-category cover are placed
  as content images, so their alt text is what a screen reader hears, and every one of the ten opens with
  `Illustrative scene:` (6 rows) or `Illustrative display:` (4 rows), with `مشهد توضيحي:` on the Arabic side of
  the same ten. `decorative: true` is a different population — **21** rows: the 18 `A.7` textures, backgrounds,
  lighting and transitions, 2 `A.3` architecture studies and 1 `A.2` brand file — and it means what
  `decorativeUse` in that file says it means: the row is intended for a CSS background, where it carries no alt
  text at all. A generated hero is not decoration; it is a labelled image, which is why the label rule in
  `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` **RB-12** can be enforced on the component and not only in the data.

A label describes what is visible in the picture. It does not date it, name its issuer, or assert that a
depicted object is real. `src/lib/server/media/labels.ts` is the only reader, it revalidates the file by digest
on every call, and it refuses a malformed or duplicated row rather than serving a partial one.

## 5. Exclusions

Three paths in the workspace are named in the declaration and are **not** authorised:

| Path | Why |
| --- | --- |
| `Noujoude.photo/logo_presentation_scene_16x9_v3.webp` | uncatalogued — no register row, so no asset id, no checksum record and no gate |
| `Noujoude.photo/_pending_review_AI_generated/**` | duplicate copies of the ten generated files, still marked `Pending Human Approval` / `Awaiting Rights Review` by their own manifest; the register rows are the copies at the library root |
| `Noujoude.photo/Noujoude.photo.rar` | an archive, not an asset; invisible to git through a global `*.rar` ignore (OD-18) |

## 6. What the publication register decides

`docs/asset-governance/publication-register.json` answers the fourth gate question — has this asset actually
been put on a page — with one rule, generated rather than typed:

> An asset is published on exactly the paths `src/lib/media/usage-map.ts` binds its own declared surfaces to,
> and only while the Owner declaration names the file.

Measured result: **46 of 82** rows published across **21** distinct paths; **36** not published because the
usage map binds none of their surfaces to a §4.2 route (brand collateral, certificates, social, A.7 textures,
interface references, and the two commerce-adjacent files). The masthead band is one of the 21 paths, and it is
rendered by `src/app/[locale]/layout.tsx` only when the `Header` slot's outcome is an image — the band falls
back to the name in text otherwise, and prints no refusal sentence and no asset id (SR-02).

## 7. Derivatives produced under this authorisation

```
node scripts/audit-assets.mjs
node scripts/build-publication-register.mjs
node scripts/build-clearance-ledger.mjs
node scripts/build-media-derivatives.mjs \
  --profile candlelight-1440-webp \
  --profiles docs/asset-governance/derivative-profiles.json \
  --ledger docs/asset-governance/clearance-ledger.json
```

Measured on 4 November 2026: **45** derivatives produced with profile `candlelight-1440-webp`
(WebP, quality 80, 1440px cap, `withoutEnlargement: true`), **2,422,790** bytes total, recorded in
`media-derivatives/lineage.json` with the SHA-256 of each original, `originalsUnchanged: true`, and every file
in `Noujoude.photo/` byte-identical before and after the run. One published asset — `NDM-AST-041`,
`vintage_collector_desk_16x9.jpg` — is refused by the ledger because its physical status is `WRONG_FORMAT`
(a `.jpg` whose container is WebP); it stays refused until the format question is resolved, and no derivative
of it exists.

The bytes live in `media-derivatives/`, which is git-ignored except for `lineage.json`, outside the library and
outside `public/`. Nothing is served without passing `src/app/api/media/[assetId]/route.ts`, which re-runs
`decidePublicServing` per request.

## 8. How to undo this

Delete or empty the two governance inputs and re-run the audit:

- removing a filename from `owner-authorization.json` puts that row's `Rights Status` back to `UNKNOWN …` or
  `Awaiting Rights Review` and its approval back to `Not Approved — no approval record supplied`;
- removing an entry from `publication-register.json` (or re-running the generator after un-binding the surface)
  puts its `Actual Usage` back to a non-published sentence.

Either way `decidePublicServing` denies again, the slot prints its refusal, and `servedSrcFor()` returns null
for the existing derivative files — the files stay on disk, and no page can reach them. There is no cache of
approval anywhere in the runtime path: the register, the labels file and the lineage manifest are each
re-read and digest-checked per request.

## 9. Traceability

| Reference | Position after this record |
| --- | --- |
| `B-06` (rights and approval unresolved) | **Moved by measurement, not by this file.** The cells the blocker asked for now exist and the gate consumes them: 82 of 82 rows read `cleared` + `approved`, and `pnpm test` / `pnpm test:gates` assert the serving behaviour. Closed scope: the 82 register rows. Open scope: the three excluded paths in §5. |
| `B-05` / `DEC-INV-001` (inventory and provenance) | **Still open.** This authorisation is silent about every depicted object, and no page may treat it otherwise. |
| `AST-1` (rights clearance across the audited library) | Cleared for the register's 82 rows by an Owner record, which is the evidence the row's own exit criterion named ("a cleared value per asset … populated by an Owner record, not by tooling"). Tooling only copied the record into the cells. |
| `OID-15 / 16 / 17` (image authorship, copyright, licence) | Answered for the supplied library and the project-generated set by §2's declaration. Unanswered, and still marked so, for anything outside the list. |
| `RB-01` (no asset clears the gate) | Resolved: 46 published rows, 45 derivatives, alt text on 82. |
| `RB-02` / `RB-09` (approved communication visuals, watermark derivatives) | **Still open** — their surfaces are unbound, so they are not published and not derived. |
| `RB-03` (no alt text recorded) | Resolved by §4. |
| `RB-04` (no collection material) | **Still open.** Publication is placement of *given* assets; it is not collection content, and the collection pages render their empty/pending states. |
