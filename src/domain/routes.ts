/**
 * src/domain/routes.ts — the canonical route registry.
 *
 * Source of truth: `reference/Noujoude_Master_Specification_EN.md` §4.2, lines 406–428 (the route
 * table and the two locale rules) and §4.1, lines 391–404 (the eight primary navigation items and
 * the instruction that "Search and language selection are global utility functions"). The `title`
 * and `purpose` strings below are the baseline's own labels and Purpose column, not editorial copy:
 * the Owner has supplied no page content, and an unpopulated shell must not read as if it had.
 *
 * Rare Pieces appears in the Owner's mandate as a surface, and OD-13 resolved it as an editorial
 * treatment of Collection detail — which is why there is no `/rare-pieces` segment here. A route
 * the navigation contract does not know about must not be built.
 */

import { type Locale, directionOf, isLocale } from "@/domain/locale";

export type RouteKey =
  | "home"
  | "the-museum"
  | "worlds"
  | "world-detail"
  | "collections"
  | "collection-detail"
  | "artifact-detail"
  | "stories"
  | "story-detail"
  | "curator"
  | "search"
  | "about"
  | "contact"
  | "privacy"
  | "terms";

export interface RouteDefinition {
  readonly key: RouteKey;
  /** Path segment under `/{locale}`; empty for the entrance itself. */
  readonly segment: string;
  /** Present only on the four detail routes, whose segment is a slug. */
  readonly param?:
    "country-slug" | "collection-slug" | "artifact-slug" | "story-slug";
  /** §4.1 primary navigation label; `null` means the route is not in the primary navigation. */
  readonly navLabel: string | null;
  readonly title: string;
  /** The §4.2 Purpose column, carried verbatim so a shell states what it is for. */
  readonly purpose: string;
}

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,79}[a-z0-9])?$/;

export const ROUTES: readonly RouteDefinition[] = [
  {
    key: "home",
    segment: "",
    navLabel: "Home",
    title: "Home",
    purpose: "Main entrance and discovery hub",
  },
  {
    key: "the-museum",
    segment: "the-museum",
    navLabel: "The Museum",
    title: "The Museum",
    purpose: "Institutional orientation and museum philosophy",
  },
  {
    key: "worlds",
    segment: "worlds",
    navLabel: "The Worlds",
    title: "Worlds directory",
    purpose: "Country-world discovery",
  },
  {
    key: "world-detail",
    segment: "worlds",
    param: "country-slug",
    navLabel: null,
    title: "Country world",
    purpose: "Individual cultural exhibition",
  },
  {
    key: "collections",
    segment: "collections",
    navLabel: "Collections",
    title: "Collections directory",
    purpose: "Browse curated collections",
  },
  {
    key: "collection-detail",
    segment: "collections",
    param: "collection-slug",
    navLabel: null,
    title: "Collection detail",
    purpose: "Present one curated collection",
  },
  {
    key: "artifact-detail",
    segment: "artifacts",
    param: "artifact-slug",
    navLabel: null,
    title: "Artifact detail",
    purpose: "Present one heritage object",
  },
  {
    key: "stories",
    segment: "stories",
    navLabel: "Stories",
    title: "Stories directory",
    purpose: "Browse editorial and curatorial stories",
  },
  {
    key: "story-detail",
    segment: "stories",
    param: "story-slug",
    navLabel: null,
    title: "Story detail",
    purpose: "Present one story",
  },
  {
    key: "curator",
    segment: "curator",
    navLabel: "AI Curator",
    title: "AI Curator",
    purpose: "Guided museum discovery",
  },
  {
    key: "search",
    segment: "search",
    // §4.1, line 404: search is a global utility, kept out of the primary navigation list.
    navLabel: null,
    title: "Search",
    purpose: "Museum-wide discovery",
  },
  {
    key: "about",
    segment: "about",
    navLabel: "About",
    title: "About",
    purpose: "Approved institutional identity and mission",
  },
  {
    key: "contact",
    segment: "contact",
    navLabel: "Contact",
    title: "Contact",
    purpose: "General and collection inquiries",
  },
  {
    key: "privacy",
    segment: "privacy",
    navLabel: null,
    title: "Privacy",
    purpose: "Approved privacy notice",
  },
  {
    key: "terms",
    segment: "terms",
    navLabel: null,
    title: "Terms",
    purpose: "Approved terms of use",
  },
];

const BY_KEY = new Map(ROUTES.map((route) => [route.key, route]));

export function routeDefinition(key: RouteKey): RouteDefinition {
  const route = BY_KEY.get(key);
  if (route === undefined) {
    // Unreachable for a typed caller; kept explicit so a future registry edit fails loudly here
    // rather than rendering a silently wrong page.
    throw new RangeError(`Unknown route key: ${String(key)}`);
  }
  return route;
}

/** The §4.1 primary navigation, in the order the baseline lists it. */
export function primaryNavigation(): readonly {
  key: RouteKey;
  label: string;
}[] {
  return ROUTES.filter((route) => route.navLabel !== null).map((route) => ({
    key: route.key,
    label: route.navLabel ?? route.title,
  }));
}

/**
 * Slugs reach the page from the URL, which makes them untrusted input at a public boundary
 * (Technology & Security Standard §2.2, §5). A rejected slug never reaches a path.
 */
export function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG.test(value);
}

export interface BuiltPath {
  readonly path: string;
  readonly direction: "ltr" | "rtl";
}

/**
 * Build a locale-prefixed canonical path. Returns `null` for a detail route whose slug fails
 * validation, so a caller must handle the rejection instead of receiving a fabricated path.
 */
export function buildPath(
  locale: Locale,
  key: RouteKey,
  slug?: string,
): BuiltPath | null {
  if (!isLocale(locale)) return null;
  const route = routeDefinition(key);
  const base =
    route.segment === "" ? `/${locale}` : `/${locale}/${route.segment}`;
  if (route.param === undefined)
    return { path: base, direction: directionOf(locale) };
  if (!isValidSlug(slug)) return null;
  return { path: `${base}/${slug}`, direction: directionOf(locale) };
}

/**
 * The language switcher rule at §4.2, line 428: it "should preserve the current page and content
 * context when a corresponding published translation exists". Availability is supplied by the
 * caller — this is the decision, not a database read — so the fallback to the entrance is testable
 * before any publication record exists.
 */
export function switchTarget(
  key: RouteKey,
  from: Locale,
  to: Locale,
  publishedIn: readonly Locale[],
): BuiltPath | null {
  if (!publishedIn.includes(to)) return buildPath(to, "home");
  const route = routeDefinition(key);
  if (route.param !== undefined) return null; // detail paths need the same record identity, not a slug
  return buildPath(to, key);
}
