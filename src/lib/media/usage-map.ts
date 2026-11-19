/**
 * src/lib/media/usage-map.ts — the explicit surface-to-route binding for the canonical application.
 *
 * Two clauses make this file necessary. The asset requirements' checklist asks that "Every asset usage
 * is discoverable from its asset record", and Module 08's exit criterion asks that the "usage map
 * [be] accurate". Neither is satisfiable by reading code at query time: a page that renders a withheld
 * slot references an asset without using it, and an asset nobody binds is used nowhere. So the binding
 * is written down, one row per surface name the catalog itself uses, and a test asserts that the row
 * set equals the register's surface vocabulary — which turns "the map is complete" from a claim into a
 * measured property.
 *
 * The surface names below are copied verbatim from `docs/ASSET_INVENTORY_AUDIT.csv`'s `Intended Usage`
 * column, because that column is the Owner's catalog speaking, not this file's vocabulary. Where a
 * surface cannot be bound to a §4.2 route it is listed in `UNBOUND_SURFACES` with the reason, and the
 * reason is a fact about the baseline (no such route, no such approval, not a served surface) — not a
 * deferral. `src/lib/media/usage-map.test.ts` proves the two lists meet exactly once per surface.
 *
 * Binding is *not* permission. This file answers "which surface does the catalog place this asset on";
 * `src/domain/rights.ts` answers "may it be served there". Before 4 November 2026 the answer was no for all
 * 82 rows; the Owner's asset declaration armed the production vocabulary, so a bound asset now renders a
 * pixel when its register row clears *and* a derivative exists *and* alt text is recorded — and still renders
 * a refusal through `src/ui/media-slot.tsx` when any of the three is missing.
 */

import { type RouteKey, buildPath, routeDefinition } from "@/domain/routes";

/** A surface the catalog names, and the canonical route that would carry it. */
export interface SurfaceBinding {
  readonly surface: string;
  /** `global` is the locale layout band — the header mark slot every page carries. */
  readonly route: RouteKey | "global";
  /** Present only on `world-detail` and `collection-detail`, whose segment is a slug. */
  readonly slug?: string;
  /** Why this binding, in the baseline's or the register's own terms. */
  readonly basis: string;
}

/** A surface that is deliberately on no route, and what bars it. */
export interface UnboundSurface {
  readonly surface: string;
  readonly reason: string;
}

/** The §4.2 route table has no certificate, gift, social or account surface. */
const NOT_A_CANONICAL_SURFACE =
  "no §4.2 route carries this surface; binding it would place an asset on a page the navigation contract does not know about";

export const SURFACE_BINDINGS: readonly SurfaceBinding[] = [
  // — A.3 Museum Architecture and Environment — the entrance and the institutional routes.
  {
    surface: "Homepage hero",
    route: "home",
    basis:
      "§6.1 required-content item 1 is the hero; NDM-AST-013 is catalogued as the main museum atmosphere",
  },
  {
    surface: "Mobile homepage",
    route: "home",
    basis:
      "§6.1 requires a mobile entrance composition; NDM-AST-014 is catalogued as the vertical entrance",
  },
  {
    surface: "Homepage and identity",
    route: "home",
    basis:
      "§4.2 line: home is the main entrance and discovery hub; NDM-AST-004 is the main wordmark",
  },
  {
    surface: "Museum entrance",
    route: "home",
    basis:
      "§4.2 gives home the entrance role, and the shell's only call to action is Enter the Museum",
  },
  {
    surface: "Header",
    route: "global",
    basis:
      "§6.1 required-content item 1 asks for an approved monogram or wordmark in the masthead band",
  },
  {
    surface: "The Museum",
    route: "the-museum",
    basis: "§4.2: institutional orientation and museum philosophy",
  },
  {
    surface: "Museum architecture",
    route: "the-museum",
    basis:
      "§4.2 institutional orientation; A.3 is the architecture and environment category",
  },
  {
    surface: "Institutional spatial imagery",
    route: "the-museum",
    basis: "§4.2 institutional orientation",
  },
  {
    surface: "Museum environments",
    route: "the-museum",
    basis: "§4.2 institutional orientation",
  },
  {
    surface: "Museum galleries",
    route: "the-museum",
    basis: "§4.2 institutional orientation",
  },
  {
    surface: "Exhibition environments",
    route: "the-museum",
    basis: "§4.2 institutional orientation",
  },
  {
    surface: "Archive experience",
    route: "the-museum",
    basis:
      "§4.2 institutional orientation; NDM-AST-027 is catalogued as the archive room",
  },
  {
    surface: "Institutional atmosphere",
    route: "the-museum",
    basis: "§4.2 institutional orientation",
  },
  {
    surface: "Museum background",
    route: "the-museum",
    basis: "§4.2 institutional orientation",
  },
  {
    surface: "Spatial transitions",
    route: "the-museum",
    basis:
      "§4.2 institutional orientation; NDM-AST-021 is catalogued as a corridor composition",
  },
  {
    surface: "About and Museum",
    route: "about",
    basis: "§4.2: approved institutional identity and mission",
  },

  // — A.5 Collection and Heritage Visual Assets — directory level, until a category list exists.
  {
    surface: "Collections",
    route: "collections",
    basis: "§4.2: browse curated collections",
  },
  {
    surface: "Collections UI",
    route: "collections",
    basis:
      "§4.2 collections directory; A.6 catalogues it as a collection layout reference",
  },
  {
    surface: "Collection and documentation pages",
    route: "collections",
    basis: "§4.2 collections directory",
  },
  {
    surface: "Stamps",
    route: "collections",
    basis:
      "A.8.2 declares four categories — first-day covers, coins, artifacts, souvenirs — and stamps is not one of them, so the catalog's stamp visual binds to the directory, not to an invented category",
  },
  {
    surface: "Stamp exhibition",
    route: "collections",
    basis: "same as Stamps: no A.8.2 category named for it",
  },
  {
    surface: "Letters and archives",
    route: "collections",
    basis:
      "no A.8.2 category named for it; §4.2 collections directory is the nearest declared surface",
  },
  {
    surface: "Letter collections",
    route: "collections",
    basis: "no A.8.2 category named for it",
  },
  {
    surface: "Documents",
    route: "collections",
    basis: "no A.8.2 category named for it",
  },

  // — A.8.2 Collection Category Assets — the four categories the baseline actually declares.
  {
    surface: "First Day Covers",
    route: "collection-detail",
    slug: "first-day-covers",
    basis:
      "A.8.2 collection category; §4.2 collection-detail takes a collection-slug",
  },
  {
    surface: "Coins",
    route: "collection-detail",
    slug: "coins",
    basis: "A.8.2 collection category",
  },
  {
    surface: "Artifacts",
    route: "collection-detail",
    slug: "artifacts",
    basis:
      "A.8.2 collection category — the curated heritage object display, not an individual artifact record",
  },
  {
    surface: "Souvenirs",
    route: "collection-detail",
    slug: "souvenirs",
    basis: "A.8.2 collection category",
  },

  // — A.8.1 Country World Hero Assets — one hero per declared country world.
  {
    surface: "Morocco World",
    route: "world-detail",
    slug: "morocco",
    basis: "A.8.1 country world hero; §4.2 world-detail takes a country-slug",
  },
  {
    surface: "Egypt World",
    route: "world-detail",
    slug: "egypt",
    basis: "A.8.1 country world hero",
  },
  {
    surface: "Syria World",
    route: "world-detail",
    slug: "syria",
    basis: "A.8.1 country world hero",
  },
  {
    surface: "Mauritania World",
    route: "world-detail",
    slug: "mauritania",
    basis: "A.8.1 country world hero",
  },
  {
    surface: "Libya World",
    route: "world-detail",
    slug: "libya",
    basis: "A.8.1 country world hero",
  },
  {
    surface: "Sudan World",
    route: "world-detail",
    slug: "sudan",
    basis: "A.8.1 country world hero",
  },
  {
    surface: "Editorial and country contexts where suitable",
    route: "worlds",
    basis:
      "§4.2 worlds directory is country-world discovery; the catalog names no single country",
  },

  // — Stories.
  {
    surface: "Stories and archives",
    route: "stories",
    basis: "§4.2: browse editorial and curatorial stories",
  },
  {
    surface: "Museum storytelling",
    route: "stories",
    basis: "§4.2 stories directory",
  },
  {
    surface: "Collection storytelling",
    route: "stories",
    basis:
      "§4.2 stories directory; §6.1 places stories among the required sections",
  },
  {
    surface: "Institutional storytelling",
    route: "stories",
    basis: "§4.2 stories directory",
  },

  // — AI Curator, search, contact, artifact detail.
  {
    surface: "AI Curator page",
    route: "curator",
    basis: "§4.2: guided museum discovery",
  },
  {
    surface: "AI Curator visual identity",
    route: "curator",
    basis: "§4.2 AI Curator route; A.4 is the curator visual category",
  },
  {
    surface: "Search",
    route: "search",
    basis:
      "§4.2: museum-wide discovery; §4.1 line 404 keeps it in the utility band rather than the primary navigation",
  },
  {
    surface: "Contact",
    route: "contact",
    basis: "§4.2: general and collection inquiries",
  },
  {
    surface: "Contact information",
    route: "contact",
    basis: "§4.2 contact route",
  },
  {
    surface: "Heritage objects",
    route: "artifact-detail",
    basis: "§4.2 artifact-detail presents one heritage object",
  },
  {
    surface: "Artifact documentation",
    route: "artifact-detail",
    basis:
      "§4.2 artifact-detail; A.2 catalogues the certificate visual as artifact documentation",
  },

  // Two canonical routes carry no binding, and that is a fact about the register rather than a gap
  // here. `story-detail` is a single story record's own cover image, and the delivered catalog has no
  // story-cover surface to bind — §8.14 puts cover art on the record, which Phase 2 owns. `privacy` and
  // `terms` are legal text with no imagery in §4.2's purposes. Both resolve to an empty slot list, and
  // an empty list is what `assetsBoundToRoute` returns rather than borrowing a neighbouring route's
  // picture to fill a page.
];

/**
 * Surfaces the baseline gives no route. Listing them here is what makes the map complete: an omission
 * would look identical to a binding nobody wrote, and the audit would report silence as a fact.
 */
export const UNBOUND_SURFACES: readonly UnboundSurface[] = [
  // Brand identity that is not masthead furniture.
  { surface: "identity", reason: NOT_A_CANONICAL_SURFACE },
  {
    surface: "certificates",
    reason:
      "the authenticity-certificate surface the monogram is catalogued for is not a §4.2 route, and no certificate record type exists yet",
  },
  {
    surface: "Brand applications",
    reason:
      "brand collateral, not a served web surface; BA-001 records that no brand file is approved",
  },
  {
    surface: "Formal and vertical compositions",
    reason:
      "brand composition references for the identity system, not a page surface",
  },
  {
    surface: "Brand presentation",
    reason: "presentation material; no §4.2 route is a presentation",
  },
  {
    surface: "Approved communication visuals",
    reason:
      "outbound communication, gated on an approval that does not exist (RB-02)",
  },
  {
    surface: "Approved image branding",
    reason:
      "the watermark system applies to delivered imagery, so its surface is a derivative, and no derivative exists (RB-09)",
  },
  {
    surface: "Certificates and archival details",
    reason: NOT_A_CANONICAL_SURFACE,
  },
  {
    surface: "Archive and certificate presentation",
    reason: NOT_A_CANONICAL_SURFACE,
  },
  {
    surface: "Approved social identity",
    reason: "social channels are outside §4.2's route table entirely",
  },
  {
    surface: "Institutional announcements",
    reason: "social and launch communication, outside §4.2's route table",
  },
  {
    surface: "Optional visitor atmosphere reference",
    reason:
      "the catalog calls it optional and §4.2 has no visitor-facility route",
  },
  {
    surface: "Reference only unless a museum gift area is approved",
    reason:
      "§6.7 and `tests/e2e/assets/no-commerce.spec.ts` treat commerce as out of scope; a gift area is not approved",
  },
  {
    surface: "Reference only unless relevant to actual collection material",
    reason:
      "conditional on collection material that has not been supplied (RB-04, Owner input outstanding)",
  },

  // Interface references and restricted or unapproved areas.
  {
    surface: "UI design reference",
    reason:
      "a design reference is not a rendered surface; using it as page content would be fabricated imagery",
  },
  {
    surface: "Mobile presentation",
    reason: "product presentation reference, not §4.2's mobile homepage route",
  },
  {
    surface: "Administrative environment",
    reason:
      "the control centre is an operator surface under Module 08, not a public §4.2 route",
  },
  {
    surface: "Restricted account-related interface if applicable",
    reason: "conditional, and no account surface exists in §4.2",
  },
  {
    surface: "Future visitor interaction only if approved",
    reason:
      "the catalog's own words make it conditional on an approval that has not been given",
  },
  {
    surface: "Location presentation if applicable",
    reason:
      "the institution's physical address and jurisdiction are Owner inputs still outstanding",
  },

  // A.7: textures, lighting and motion inputs. They are styling material, and none of §4.2's fifteen
  // route purposes is "a background", "a texture" or "a transition" — so binding one would put an
  // unapproved decorative surface behind copy that has been approved, and the audit would then report
  // the texture as used simply because a page happens to be coloured.
  {
    surface: "Selected editorial panels",
    reason:
      "A.7 background material; no §4.2 route purpose names an editorial panel treatment",
  },
  {
    surface: "Dark page backgrounds",
    reason:
      "A.7 background material; no §4.2 route purpose names a page background",
  },
  {
    surface: "Exhibition backgrounds",
    reason:
      "A.7 background material; §4.2 gives exhibition environments to the-museum but no route to a backdrop",
  },
  {
    surface: "Luxury visual details",
    reason:
      "A.7 texture material; a decorative accent is not a content surface",
  },
  {
    surface: "Archival environments",
    reason:
      "A.7 texture material; the archive surfaces the register does name are A.3's, not a texture",
  },
  {
    surface: "Selected thematic sections",
    reason: "A.7 background material; §4.2 has no thematic-section route",
  },
  {
    surface: "Detailed archival accents",
    reason:
      "A.7 texture material; an accent is applied by styling, which is not an asset usage",
  },
  {
    surface: "Restrained luxury details",
    reason:
      "A.7 texture material; an accent is applied by styling, which is not an asset usage",
  },
  {
    surface: "Paper and architectural surfaces",
    reason:
      "A.7 texture material; no §4.2 route purpose names a material surface",
  },
  {
    surface: "Soft backgrounds",
    reason:
      "A.7 background material; no §4.2 route purpose names a page background",
  },
  {
    surface: "Selected identity sections",
    reason:
      "A.7 texture material; the identity surfaces that are bound belong to A.2, not to a marble swatch",
  },
  {
    surface: "Document storytelling",
    reason:
      "A.7 texture material; the catalog names a texture, not a story record",
  },
  {
    surface: "Page transitions",
    reason:
      "A.7 transition material; motion is an undecided design question, and `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §10 records no approved treatment",
  },
  {
    surface: "Museum lighting",
    reason:
      "A.7 lighting material; a lighting treatment is applied by styling, not served as an image",
  },
  {
    surface: "Loading states",
    reason:
      "A.7 loading-state material; there is no approved loading treatment to attach it to",
  },
  {
    surface: "Selected transitions",
    reason: "A.7 transition material; motion treatment is undecided",
  },
  {
    surface: "Museum atmosphere",
    reason:
      "A.7 illumination material; an atmosphere reference is not a §4.2 surface",
  },
  {
    surface: "Museum displays",
    reason:
      "A.7 overlay material; an overlay is applied by styling, not served as an image",
  },
];

const BY_SURFACE = new Map(
  SURFACE_BINDINGS.map((binding) => [binding.surface, binding]),
);

/**
 * §6.1's eight home-page sections, in the order the baseline lists them, each naming the canonical route
 * it introduces.
 *
 * This table lives in the usage map rather than in `src/app/[locale]/page.tsx` because the entrance
 * *renders other routes' slots*: the "Featured Collections" band is the collections route's catalogued
 * imagery, so NDM-AST-034 is referenced from two places. A usage record that named only the owning route
 * would be incomplete in exactly the way Module 08's exit criterion checks for, so the composition is
 * data here and the page reads it, and `describeUsage()` folds it into the sentence.
 */
export const HOME_SECTIONS: readonly {
  readonly title: string;
  readonly route: RouteKey | null;
}[] = [
  { title: "Hero / Museum Entrance", route: "home" },
  { title: "Institutional Introduction", route: "the-museum" },
  { title: "The Worlds", route: "worlds" },
  { title: "Featured Collections", route: "collections" },
  { title: "Selected Artifacts", route: "artifact-detail" },
  { title: "Stories", route: "stories" },
  { title: "AI Curator Introduction", route: "curator" },
  // The closing invitation is a call to contact the museum, not an image surface: §4.2 gives no asset
  // route a "closing" purpose, so the section renders its action and nothing else.
  { title: "Closing Invitation", route: null },
];

/** The routes whose catalogued imagery the entrance also renders. */
const SECTION_TARGETED_ROUTES: ReadonlySet<RouteKey> = new Set(
  HOME_SECTIONS.flatMap((section) =>
    section.route === null ? [] : [section.route],
  ),
);

export function bindingForSurface(surface: string): SurfaceBinding | null {
  return BY_SURFACE.get(surface.trim()) ?? null;
}

/**
 * The bindings a given route renders, global ones included.
 *
 * Two kinds of detail binding exist and they resolve differently. A slug binding — `Morocco World` on
 * `world-detail[morocco]` — names one record, so it appears only under that slug and never on a
 * neighbouring world's page. A template binding — `Heritage objects` on `artifact-detail`, with no slug —
 * is the catalog speaking about the artifact page rather than about an artifact, so it renders on every
 * slug of that route and on the entrance section that shows the same template.
 *
 * A directory route asking without a slug picks up no slug binding, which is what keeps one country's
 * hero from becoming the worlds index's default image.
 */
export function bindingsForRoute(
  route: RouteKey | "global",
  slug?: string,
): readonly SurfaceBinding[] {
  return SURFACE_BINDINGS.filter((binding) => {
    if (binding.route !== route) return false;
    return binding.slug === undefined || binding.slug === slug;
  });
}

const UNBOUND_BY_NAME = new Map(
  UNBOUND_SURFACES.map((entry) => [entry.surface, entry]),
);

export function unboundReasonFor(surface: string): UnboundSurface | null {
  return UNBOUND_BY_NAME.get(surface.trim()) ?? null;
}

/**
 * The canonical path a binding points at, in English so the register's `Actual Usage` column reads as
 * one site's addresses rather than as a table of internal keys.
 *
 * Three shapes. `global` has no path of its own: the masthead band is on every page, which is the fact
 * worth saying. A binding with a slug resolves to a real URL through the route registry. A binding on a
 * detail route *without* a slug — "Heritage objects", which is the artifact template rather than any one
 * artifact — is rendered as the path pattern with its own param name, because inventing a slug to make
 * the sentence concrete would be putting a record that does not exist into a usage claim.
 */
function pathOf(binding: SurfaceBinding): string {
  if (binding.route === "global") return "every page (masthead band)";
  if (binding.slug !== undefined) {
    const built = buildPath("en", binding.route, binding.slug);
    if (built !== null) return built.path;
  }
  const definition = routeDefinition(binding.route);
  const base = definition.segment === "" ? "/en" : `/en/${definition.segment}`;
  return definition.param === undefined
    ? base
    : `${base}/{${definition.param}}`;
}

/**
 * The canonical paths one set of declared surfaces resolves to, deduplicated, in binding order.
 *
 * Exported because the publication register has to answer the same question the register's `Actual Usage`
 * column answers — "where would this asset live?" — and a second implementation of `pathOf` outside this
 * file is how the two drift apart. `describeUsage` reads it, `scripts/build-publication-register.mjs` reads
 * it, and the agreement test asserts a published asset's paths *are* these.
 *
 * Surfaces the map does not bind contribute nothing here: a path list is a statement about routes, and an
 * unbound surface has none.
 */
export function boundPathsFor(surfaces: readonly string[]): readonly string[] {
  const paths: string[] = [];
  for (const surface of surfaces) {
    const binding = bindingForSurface(surface);
    if (binding === null) continue;
    paths.push(pathOf(binding));
    // The entrance renders this route's imagery as one of its §6.1 sections, so the asset is
    // referenced from the entrance too. Saying only the owning route would understate the usage.
    if (
      binding.route !== "global" &&
      SECTION_TARGETED_ROUTES.has(binding.route)
    ) {
      paths.push("/en");
    }
  }
  return [...new Set(paths)];
}

/**
 * The usage sentence for one asset, from its own declared surfaces.
 *
 * This is what `docs/ASSET_INVENTORY_AUDIT.csv`'s `Actual Usage` column should say. It is derived from
 * the record's surfaces and this map, so it cannot go stale the way the delivered literal did — until
 * 3 November 2026 the register asserted on all 82 rows that `src/` was empty, a sentence that stopped
 * being true when `src/` was populated and that no tool recomputed until the generator measured it.
 *
 * Three states, kept distinct per Master Spec A.9: bound (a route references it), unbound (the baseline
 * gives it no route), and unrecognised (the catalog named a surface this map has never seen — a defect
 * in one of the two, and it must read as one rather than silently as "no usage").
 *
 * The sentence names paths and nothing else. Until 4 November 2026 it also ended "; served nowhere while
 * the rights gate denies", which was true when the production vocabulary had no cleared marker and became
 * false the day the Owner's declaration armed one. This module answers "which route is this placed on";
 * whether a placed asset may be served is `src/domain/rights.ts` plus the register row, and a binding table
 * that asserted the serving outcome would be asserting a fact it cannot see.
 */
export function describeUsage(surfaces: readonly string[]): {
  readonly state: "bound" | "unbound" | "unrecognised" | "none";
  readonly text: string;
} {
  if (surfaces.length === 0)
    return {
      state: "none",
      text: "None — the register declares no surface for this asset",
    };
  const unbound: string[] = [];
  const unknown: string[] = [];
  for (const surface of surfaces) {
    if (bindingForSurface(surface) !== null) continue;
    if (unboundReasonFor(surface) !== null) {
      unbound.push(surface);
      continue;
    }
    unknown.push(surface);
  }
  if (unknown.length > 0)
    return {
      state: "unrecognised",
      text: `Unmapped surface(s): ${unknown.join(", ")} — the register and the usage map disagree`,
    };
  const paths = boundPathsFor(surfaces);
  if (paths.length > 0)
    return { state: "bound", text: `Referenced by ${paths.join(", ")}` };
  return {
    state: "unbound",
    text: `None — bound to no route: ${unbound.join(", ")}`,
  };
}
