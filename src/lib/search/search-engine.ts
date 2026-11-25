// Search engine — Noujoude
// Server-backed museum content discovery.

import { normalizeQuery, validateQuery } from "./query-builder";
import { buildFilterConditions, applyFilters } from "./filters";
import { computeRelevanceScore, rankResults, paginateResults } from "./ranking";

export interface SearchableRecord {
  readonly id: string;
  readonly type: "artifact" | "collection" | "country" | "story";
  readonly title: string;
  readonly excerpt: string;
  readonly locale: "en" | "ar";
  readonly published: boolean;
  readonly metadata: Record<string, unknown>;
}

export interface SearchEngineConfig {
  readonly records: SearchableRecord[];
}

export interface SearchResultItem {
  readonly id: string;
  readonly type: "artifact" | "collection" | "country" | "story";
  readonly title: string;
  readonly excerpt: string;
  readonly metadata: Record<string, unknown>;
}

export interface SearchResponse {
  readonly results: SearchResultItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly query: string;
}

export function createSearchEngine(config: SearchEngineConfig) {
  const { records } = config;

  return {
    search(params: {
      q: string;
      locale: "en" | "ar";
      filters?: Record<string, string | number | string[] | undefined> | { type?: string } | undefined;
      sort?: "relevance" | "newest" | "alphabetical" | "historical";
      page?: number;
      pageSize?: number;
      isPublic?: boolean;
    }): SearchResponse {
      const queryInput: {
        q: string;
        locale: "en" | "ar";
        sort: "relevance" | "newest" | "alphabetical" | "historical";
        page: number;
        pageSize: number;
        filters?: Record<string, string | number | string[] | undefined>;
      } = {
        q: params.q,
        locale: params.locale,
        sort: params.sort ?? "relevance",
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      };
      if (params.filters) {
        queryInput.filters = params.filters;
      }
      const normalized = normalizeQuery(queryInput);

      const validation = validateQuery(normalized);
      if (!validation.valid) {
        return {
          results: [],
          total: 0,
          page: normalized.page,
          pageSize: normalized.pageSize,
          totalPages: 0,
          query: normalized.normalized,
        };
      }

      // Filter to published records only (for public search)
      let eligible = records.filter((r) => {
        if (params.isPublic !== false && !r.published) return false;
        if (r.locale !== params.locale) return false;
        return true;
      });

      // Apply filters
      const conditions = buildFilterConditions(normalized.filters as unknown as Record<string, string | number | string[] | undefined>);
      eligible = applyFilters(eligible as unknown as Record<string, unknown>[], conditions) as unknown as SearchableRecord[];

      // Compute relevance scores
      const scored = eligible.map((record) => ({
        id: record.id,
        type: record.type,
        title: record.title,
        excerpt: record.excerpt,
        score: computeRelevanceScore(normalized.terms, record.title, record.excerpt, record.metadata),
        metadata: record.metadata,
      }));

      // Filter out zero-score results (no match)
      const matched = normalized.terms.length > 0
        ? scored.filter((r) => r.score > 0)
        : scored;

      // Rank results
      const ranked = rankResults(matched);

      // Paginate
      const paginated = paginateResults(ranked, normalized.page, normalized.pageSize);

      return {
        results: paginated.items.map(({ score: _score, ...rest }) => rest),
        total: paginated.total,
        page: paginated.page,
        pageSize: paginated.pageSize,
        totalPages: paginated.totalPages,
        query: normalized.normalized,
      };
    },
  };
}