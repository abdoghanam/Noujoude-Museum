// Search query builder — Noujoude
// Normalizes and validates search queries.

export interface SearchQuery {
  readonly q: string;
  readonly locale: "en" | "ar";
  readonly filters?: SearchFilters | Record<string, string | number | string[] | undefined>;
  readonly sort?: SearchSort;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface SearchFilters {
  readonly country?: string;
  readonly era?: string;
  readonly category?: string;
  readonly collection?: string;
  readonly material?: string;
  readonly type?: "artifact" | "collection" | "country" | "story";
}

export type SearchSort = "relevance" | "newest" | "alphabetical" | "historical";

export interface NormalizedQuery {
  readonly terms: string[];
  readonly normalized: string;
  readonly locale: "en" | "ar";
  readonly filters: SearchFilters;
  readonly sort: SearchSort;
  readonly page: number;
  readonly pageSize: number;
}

const MAX_QUERY_LENGTH = 200;
const DEFAULT_PAGE_SIZE = 20;

export function normalizeQuery(raw: SearchQuery): NormalizedQuery {
  // Sanitize and normalize the query string
  const q = (raw.q ?? "").trim().slice(0, MAX_QUERY_LENGTH);

  // Split into terms, removing empty strings
  const terms = q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  return {
    terms,
    normalized: terms.join(" "),
    locale: raw.locale,
    filters: raw.filters ?? {},
    sort: raw.sort ?? "relevance",
    page: Math.max(1, raw.page ?? 1),
    pageSize: Math.min(50, Math.max(1, raw.pageSize ?? DEFAULT_PAGE_SIZE)),
  };
}

export function validateQuery(query: NormalizedQuery): { valid: boolean; error?: string } {
  if (query.terms.length === 0 && Object.keys(query.filters).length === 0) {
    return { valid: false, error: "Query or filters required" };
  }

  // Check for injection patterns
  const injectionPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /--/, /;/];
  for (const pattern of injectionPatterns) {
    if (pattern.test(query.normalized)) {
      return { valid: false, error: "Invalid query" };
    }
  }

  return { valid: true };
}