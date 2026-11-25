import { NextResponse } from "next/server";
import { createSearchEngine } from "@/lib/search";

// In production, this would query Payload/PostgreSQL
// For now, returns empty results (no published records exist)
const engine = createSearchEngine({ records: [] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const locale = (searchParams.get("locale") ?? "en") as "en" | "ar";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const type = searchParams.get("type") as "artifact" | "collection" | "country" | "story" | undefined;

  const result = engine.search({
    q,
    locale,
    filters: type ? { type } : undefined,
    page,
    pageSize,
    isPublic: true,
  });

  return NextResponse.json(result);
}