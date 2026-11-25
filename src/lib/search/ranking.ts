// Search ranking — Noujoude
// Ranks search results by relevance.

export interface SearchResult {
  readonly id: string;
  readonly type: "artifact" | "collection" | "country" | "story";
  readonly title: string;
  readonly excerpt: string;
  readonly score: number;
  readonly metadata: Record<string, unknown>;
}

export function computeRelevanceScore(
  terms: string[],
  title: string,
  excerpt: string,
  metadata: Record<string, unknown>,
): number {
  let score = 0;
  const titleLower = title.toLowerCase();
  const excerptLower = excerpt.toLowerCase();

  for (const term of terms) {
    // Title match (highest weight)
    if (titleLower.includes(term)) {
      score += 10;
      // Exact title match bonus
      if (titleLower === term) score += 20;
    }

    // Excerpt match
    if (excerptLower.includes(term)) {
      score += 5;
    }

    // Metadata match
    for (const value of Object.values(metadata)) {
      if (String(value).toLowerCase().includes(term)) {
        score += 2;
      }
    }
  }

  return score;
}

export function rankResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => {
    // Primary: score descending
    if (b.score !== a.score) return b.score - a.score;
    // Secondary: title alphabetical
    return a.title.localeCompare(b.title);
  });
}

export function paginateResults<T>(
  results: T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = results.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages };
}