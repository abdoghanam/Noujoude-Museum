# NOUJOUDE DIGITAL HERITAGE MUSEUM
# ASSET & BRAND REQUIREMENTS
**Document ID:** NDM-BRAND-ASSET-001  
**Version:** 1.0.0  
**Status:** Binding Working Baseline — Final Brand/License Approval Pending  
**Authority:** Master Specification §§12–13 and Appendix A

## 1. Purpose and status rules

This document is the operational reference for the approved visual direction, design tokens, brand safeguards, and exact source asset inventory. The catalog is a reference list, not proof that files currently exist, are generated, rights-cleared, approved, optimized, integrated, or present in the target workspace. Qwen must inspect the actual `Noujoude.photo/` directory and record the exact filesystem status of every filename.
## 2. Brand essence and art direction

**Brand:** Noujoude Digital Heritage Museum  
**Tagline:** “More than a collection... it's a story.”  
**Art direction:** **Nocturnal Museum Elegance**.

The visual impression must communicate refined femininity, private-museum intimacy, French-inspired restraint, cultural heritage, archival credibility, and emotional curation. The French influence is an aesthetic reference only; it does not imply a French location, legal origin, or institutional affiliation. Do not depict a literal fantasy palace. Do not style the product as a hotel, jewelry retailer, luxury e-commerce store, generic corporate website, or generic SaaS dashboard.
### 2.1 Visual atmosphere

- Midnight/noir museum environments and controlled depth.
- Deep burgundy and restrained rose accents.
- Champagne and antique gold used as fine details, not dominant surfaces.
- Warm ivory and archival paper to support reading and documentary presentation.
- Velvet, silk, marble, antique wood, glass, wax seal, aged metal, and archive-paper material references.
- Warm candlelight, museum display reflections, directional light, subtle dust and controlled floral atmosphere.
- Rose/floral details are occasional accents, never repetitive filler.
- The N monogram, circular seal, and wax-seal language may be used only through approved logo/brand assets and their defined variants.
- The image composition prioritizes genuine objects and the meaning of the collection.
### 2.2 Visual prohibitions

- No excessive gold frames or gold typography across long paragraphs.
- No glitter, heavy glow, random ornaments, noisy textures, or excessive animation.
- No generic AI imagery presented as genuine museum architecture, archival evidence, or original artifact photography.
- No unsupported Eiffel Tower, Paris address, palace, museum building, café, boutique, certificate, or authenticity claim inferred from an image filename.
- No commercial price tags, product card layouts, Buy Now, cart, or checkout visuals.
- No cropping, colorization, retouching, or generative alteration that changes documentary artifact details.
## 3. Canonical design tokens

The HEX values below are the source-defined proposed canonical palette. They are the implementation working baseline and require formal Owner/Brand approval before final public launch. Qwen must not silently substitute arbitrary values.

| Token | HEX | Intended use |
|---|---|---|
| Noir Museum | `#111014` | Primary background, hero, museum framing |
| Midnight Velvet | `#1A151C` | Secondary dark background |
| Deep Burgundy | `#351522` | Main burgundy exhibition surfaces |
| Heritage Burgundy | `#552536` | Secondary burgundy elements |
| Champagne Gold | `#C6A56B` | Primary restrained gold accent |
| Soft Champagne | `#DFC99E` | Delicate highlights |
| Warm Ivory | `#F3EBDD` | Readable light text and paper surfaces |
| Archive Paper | `#E5D8C3` | Archival/light content surfaces |
| Muted Stone | `#9D9184` | Secondary text and neutral details |
| Rose Accent | `#A96D78` | Very restrained feminine accent |
| Dark Wood | `#30241F` | Material/architectural reference |
| Museum Glass | `#D8D9D5` | Neutral/translucent material reference |

### 3.1 Color hierarchy

- Dark museum backgrounds: approximately 55–70%.
- Burgundy and dark material surfaces: approximately 15–25%.
- Ivory, archive paper, and neutral surfaces: approximately 10–20%.
- Gold accents: approximately 3–8%.
- Rose accents: approximately 0–3%.

These are visual guidance ranges, not per-page quotas. Contrast and content legibility override decorative ratios. State must never be communicated by color alone.

## 4. Typography

| Role | English family | Arabic family | Approval requirement |
|---|---|---|---|
| Main display | Cormorant Garamond | Tajawal | Verify files, weights, shaping, and license |
| Editorial headings | Cormorant Garamond | Tajawal | Verify license and rendering |
| Body | Inter | Tajawal | Verify license and rendering |
| UI labels | Inter | Tajawal | Use legible approved weights |
| Metadata | Inter | Tajawal | Maintain accessible minimum sizes |
| Numeric IDs | Inter | Tajawal | Ensure mixed-script bidi stability |

Use proper Arabic shaping and natural RTL behavior. Use CSS logical properties. Avoid relying on browser-synthetic weights when a licensed weight is available. If a font cannot be licensed or rendered reliably, use a formally documented substitute that preserves the hierarchy and visual character; never switch fonts ad hoc per page.

## 5. Component and image rules

- Maintain one documented spacing scale, type scale, and responsive grid.
- Public and Control Center may have different density, but must share brand tokens and component semantics.
- Cards are editorial museum surfaces, not commercial product cards.
- Artifact images preserve the true crop and visible evidence; allow gallery navigation and accessible zoom where source resolution permits.
- Preserve originals. Store generated responsive derivatives separately and trace them to the original checksum.
- The homepage must support the approved museum entrance concept and the `Enter the Museum` action; no mandatory long cinematic interstitial.
- Mobile hero and content compositions must be designed deliberately, not simply cropped from desktop.
- Every meaningful image requires localized alt text/caption as appropriate; decorative images use empty alt text or decorative semantics.
- Do not add unapproved social sharing, favorites, accounts, boutique, café, or location claims based on reference filenames.

## 6. Asset lifecycle and governance

Each asset must move through independently recorded states:

`Referenced → Located → Metadata Recorded → Rights Reviewed → Curatorial/Brand Approved → Optimized → Integrated → Verified in Context`

Other allowed states: `Reference Only`, `Awaiting Generation`, `Awaiting Rights Review`, `Duplicate`, `Rejected`, `Archived`.

For every file, record:

- Asset ID and exact original filename.
- Physical presence and exact path.
- MIME type, extension, dimensions, file size, checksum.
- Category, intended role, associated page/entity.
- Source, creator, acquisition/creation date when known.
- Copyright owner, license, attribution, permitted uses, restrictions, expiry/review date.
- Original/derivative relationship.
- Alt text, caption, language, focal point, responsive variants.
- Approval state, reviewer, date, revision history, actual usage locations.

A missing file must be recorded as missing, not generated silently. A file that exists is not automatically licensed, approved, or production-ready. AI-generated/illustrative images must be labelled internally and never presented as authentic artifact photography.

## 7. Original 72 reference assets

- `brand_seal_monogram_1024.webp` — Official monogram seal — intended: Header, identity, certificates (source line 3779).
- `logo_badge_burgundy_1024.webp` — Burgundy logo badge — intended: Brand applications (source line 3780).
- `logo_stacked_vertical_1024x1536.webp` — Vertical logo — intended: Formal and vertical compositions (source line 3781).
- `logo_wordmark_1024x768.webp` — Main wordmark — intended: Homepage and identity (source line 3782).
- `certificate_authenticity_1024.webp` — Certificate identity — intended: Artifact documentation (source line 3783).
- `certificate_identity_scene_4x3.webp` — Certificate visual scene — intended: Archive and certificate presentation (source line 3784).
- `premium_packaging_identity_1x1.webp` — Packaging identity reference — intended: Brand presentation (source line 3785).
- `social_announcement_seal_1x1.jpg` — Announcement seal — intended: Approved communication visuals (source line 3786).
- `watermark_system_16x9.webp` — Watermark reference — intended: Approved image branding (source line 3787).
- `wax_seal_texture_macro_1x1.jpg` — Wax seal texture — intended: Certificates and archival details (source line 3788).
- `launch_banner_16x9.jpg` — Launch banner — intended: Institutional announcements (source line 3789).
- `social_instagram_1024.webp` — Social visual asset — intended: Approved social identity (source line 3790).
- `master_atmosphere_definitive.webp` — Main museum atmosphere — intended: Homepage hero (source line 3798).
- `main_entrance_mobile_9x16.webp` — Vertical entrance composition — intended: Mobile homepage (source line 3799).
- `grand_entrance_dusk.webp` — Grand entrance at dusk — intended: Museum entrance (source line 3800).
- `arrival_hall_morning.webp` — Arrival hall scene — intended: The Museum (source line 3801).
- `golden_hour_hall.webp` — Golden-hour hall — intended: Museum architecture (source line 3802).
- `grand_staircase.webp` — Staircase environment — intended: Institutional spatial imagery (source line 3803).
- `museum_building_1024.webp` — Building image — intended: About and Museum (source line 3804).
- `glass_dome_looking_up.webp` — Architectural detail — intended: Museum environments (source line 3805).
- `marble_corridor.webp` — Marble corridor — intended: Spatial transitions (source line 3806).
- `rose_courtyard_golden_hour.webp` — Courtyard atmosphere — intended: Editorial and country contexts where suitable (source line 3807).
- `luxury_night.webp` — Night environment — intended: Museum background (source line 3808).
- `luxury_library_night.webp` — Library atmosphere — intended: Stories and archives (source line 3809).
- `morning_gallery.webp` — Morning gallery — intended: Exhibition environments (source line 3810).
- `main_gallery_burgundy.webp` — Burgundy gallery — intended: Museum galleries (source line 3811).
- `archive_chamber.webp` — Archive room — intended: Archive experience (source line 3812).
- `private_archive_room_16x9.webp` — Private archive — intended: Collection and documentation pages (source line 3813).
- `collector_lounge_night.webp` — Collector lounge — intended: Institutional atmosphere (source line 3814).
- `museum_cafe_morning.webp` — Museum café environment — intended: Optional visitor atmosphere reference (source line 3815).
- `ai_curator_sanctum_16x9.jpg` — Curator environment — intended: AI Curator page (source line 3825).
- `ai_curator_sparkle_1024.webp` — Curator identity detail — intended: AI Curator visual identity (source line 3826).
- `curator_hands_emotional_moment_16x9.webp` — Human-curatorial atmosphere — intended: Museum storytelling (source line 3827).
- `collection_gallery_shelves_16x9.jpg` — Collection shelving — intended: Collections (source line 3837).
- `rare_stamp_1024.webp` — Stamp visual — intended: Stamps (source line 3838).
- `rare_stamps_glass_cabinet_4x3.jpg` — Stamp cabinet — intended: Stamp exhibition (source line 3839).
- `heritage_jewelry_1024.webp` — Heritage jewelry visual — intended: Heritage objects (source line 3840).
- `historical_documents_atmosphere_4x3.jpg` — Document atmosphere — intended: Documents (source line 3841).
- `family_letters_1024.webp` — Letters visual — intended: Letters and archives (source line 3842).
- `family_letters_bundle_1x1.jpg` — Letter collection — intended: Letter collections (source line 3843).
- `vintage_collector_desk_16x9.jpg` — Collector desk environment — intended: Collection storytelling (source line 3844).
- `brand_muse_golden_hour.webp` — Brand atmosphere — intended: Institutional storytelling (source line 3845).
- `gift_boutique.webp` — Gift boutique visual — intended: Reference only unless a museum gift area is approved (source line 3846).
- `perfume_vanity_1024.webp` — Heritage vanity visual — intended: Reference only unless relevant to actual collection material (source line 3847).
- `app_interface_showcase_16x9.jpg` — Interface visual reference — intended: UI design reference (source line 3857).
- `interface_collection_page_4x3.jpg` — Collection layout reference — intended: Collections UI (source line 3858).
- `control_center_desk_16x9.jpg` — Control Center atmosphere — intended: Administrative environment (source line 3859).
- `mobile_app_scene_9x16.jpg` — Mobile experience reference — intended: Mobile presentation (source line 3860).
- `user_account_1024.webp` — Account visual — intended: Restricted account-related interface if applicable (source line 3861).
- `search_discovery_1024.webp` — Discovery visual — intended: Search (source line 3862).
- `contact_envelope_1024.webp` — Correspondence visual — intended: Contact (source line 3863).
- `telephone_1024.webp` — Contact visual — intended: Contact information (source line 3864).
- `favorite_heart_1024.webp` — Favorite icon reference — intended: Future visitor interaction only if approved (source line 3865).
- `location_paris_1024.webp` — Location visual — intended: Location presentation if applicable (source line 3866).
- `bg_ivory_petals.webp` — Ivory floral background — intended: Selected editorial panels (source line 3878).
- `bg_dark_museum_bokeh.webp` — Dark museum atmosphere — intended: Dark page backgrounds (source line 3879).
- `burgundy_velvet_texture.webp` — Velvet texture — intended: Exhibition backgrounds (source line 3880).
- `champagne_gold_marble_texture.webp` — Marble and gold — intended: Luxury visual details (source line 3881).
- `dark_museum_wood_texture.webp` — Dark wood — intended: Archival environments (source line 3882).
- `floral_section_background_16x9.webp` — Floral background — intended: Selected thematic sections (source line 3883).
- `gold_embroidery_detail_1x1.jpg` — Embroidery texture — intended: Detailed archival accents (source line 3884).
- `gold_leaf_dark_texture.webp` — Gold leaf background — intended: Restrained luxury details (source line 3885).
- `ivory_marble_texture.webp` — Ivory marble — intended: Paper and architectural surfaces (source line 3886).
- `ivory_silk_texture.webp` — Silk texture — intended: Soft backgrounds (source line 3887).
- `old_paper_texture.webp` — Aged archival paper — intended: Document storytelling (source line 3888).
- `rose_marble_texture.webp` — Rose marble — intended: Selected identity sections (source line 3889).
- `section_transition_background_16x9.webp` — Section transition — intended: Page transitions (source line 3890).
- `light_rays_dust.webp` — Light-ray atmosphere — intended: Museum lighting (source line 3891).
- `loading_golden_rays.webp` — Loading atmosphere — intended: Loading states (source line 3892).
- `rose_petals_floating.webp` — Floral motion visual — intended: Selected transitions (source line 3893).
- `warm_candlelight.webp` — Warm illumination — intended: Museum atmosphere (source line 3894).
- `overlay_glass_reflections.webp` — Glass reflection overlay — intended: Museum displays (source line 3895).

## 8. Ten additional requested assets

These are separate from the original 72. Their existence and rights status must be physically verified.
- `world_morocco_hero_16x9.webp` — Authentic-inspired Moroccan architectural environment — intended: Morocco World (source line 3923).
- `world_egypt_hero_16x9.webp` — Historical Egyptian architectural environment — intended: Egypt World (source line 3924).
- `world_syria_hero_16x9.webp` — Historic Damascus-inspired environment — intended: Syria World (source line 3925).
- `world_mauritania_hero_16x9.webp` — Chinguetti manuscript and desert heritage environment — intended: Mauritania World (source line 3926).
- `world_libya_hero_16x9.webp` — Historic Tripoli and Mediterranean heritage environment — intended: Libya World (source line 3927).
- `world_sudan_hero_16x9.webp` — Nubian and Sudanese architectural heritage environment — intended: Sudan World (source line 3928).
- `collection_first_day_covers_4x3.webp` — First-day covers and commemorative envelopes — intended: First Day Covers (source line 3934).
- `collection_coins_4x3.webp` — Numismatic heritage display — intended: Coins (source line 3935).
- `collection_artifacts_4x3.webp` — Curated heritage object display — intended: Artifacts (source line 3936).
- `collection_souvenirs_4x3.webp` — Historic keepsakes and commemorative objects — intended: Souvenirs (source line 3937).

## 9. Asset-specific restrictions

- `certificate_authenticity_1024.webp` is a design reference only; it does not prove any object has been authenticated or certified.
- `gift_boutique.webp` does not authorize a gift shop or commerce.
- `museum_cafe_morning.webp` does not prove that a café exists.
- `location_paris_1024.webp` does not establish the museum's location.
- `favorite_heart_1024.webp` does not authorize V1 favorites.
- `user_account_1024.webp` does not authorize V1 visitor accounts.
- Country hero images are illustrative exhibition visuals unless independently verified as photographs of actual collection objects or a real location.
- Category hero images are category illustrations, not evidence that the museum owns the objects depicted.
- A certificate graphic, watermark, monogram, or seal is not a provenance record, rights record, or authenticity assessment.

## 10. Qwen asset audit deliverable

Before integration, Qwen must create `docs/ASSET_INVENTORY_AUDIT.csv` with exactly one row per catalog item and these columns:

`Asset ID, Filename, Expected Category, Physical Status, Actual Path, MIME Type, Width, Height, File Size, SHA-256, Source/Creator, Rights Status, Brand/Curatorial Approval, Intended Usage, Actual Usage, Derivative Status, Alt Text Status, Notes, Verified By, Verified Date`.

The physical status must be one of: `PRESENT`, `MISSING`, `DUPLICATE`, `WRONG_FORMAT`, `CORRUPT`, `UNREADABLE`, `NOT_APPLICABLE`. Rights and approval are separate fields. The report must count original 72 and additional 10 independently and must not claim 82 are present unless the filesystem audit proves it.

## 11. Brand/asset acceptance checklist

- [ ] All 12 color tokens are represented in the code design-token source.
- [ ] Font files and licenses are verified; English and Arabic shaping passes.
- [ ] Logo variants preserve approved geometry, clear space, and correct background use.
- [ ] Public templates follow the controlled feminine/nocturnal museum art direction.
- [ ] No template looks like an e-commerce product card.
- [ ] Original asset files are unchanged and checksums recorded.
- [ ] All 82 catalog entries have a physical-presence status.
- [ ] Rights state is recorded independently from file presence.
- [ ] AI/illustrative visuals are not represented as real collection photographs.
- [ ] All assets in public use have approved captions/alt text and responsive treatment.
- [ ] Every asset usage is discoverable from its asset record.
- [ ] No unapproved visual implies a location, building, institution, certification, or collection ownership fact.

## 12. Source references

The exact file inventory and roles are transcribed from Appendix A of `Noujoude_Master_Specification_EN.md`, which in turn preserves the original source inventory. The catalog is a reference requirement, not a filesystem manifest. Physical status must be confirmed against the actual workspace.
