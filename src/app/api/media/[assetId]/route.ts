/**
 * src/app/api/media/[assetId]/route.ts — the only URL on which a derivative byte reaches a browser.
 *
 * `src/lib/server/media/slot-facts.ts` hands a slot `/api/media/<id>` as its source, and this handler is
 * what answers on it. The important part is that the URL is not the permission: every request runs
 * `serveDerivative`, which re-resolves the asset in the register, re-runs `decidePublicServing`, re-checks
 * that the derivative has lineage, that its path stays inside the private store, and that its bytes still
 * hash to what the manifest recorded. A link that someone bookmarked, typed or scraped therefore buys
 * nothing — the gate is consulted at the moment of serving, which is what §20.4's STT-002 row requires and
 * what RB-01 is about: measured today, 0 of 82 assets pass, so every request to this endpoint answers 404.
 *
 * Why the refusal is a 404 and not a 403: a 403 would tell an anonymous caller that the id is real, is
 * derived, and is being withheld from them. That is a disclosure about the register to anyone who can
 * guess an id. The specific reason is kept server-side in the `ServingOutcome`, asserted by
 * `src/lib/server/media/serving.test.ts`, and visible to a visitor through the slot that refused to build
 * the URL in the first place.
 *
 * The handler is intentionally thin. `route.ts` is not in the exempted set of `eslint.config.mjs`, so it
 * sits inside the client-boundary scope by path — which is a good thing here, because the file that should
 * never read an environment variable is the one that answers the public.
 *
 * `createMediaRouteHandler` exists for one reason: the response rules — `ETag`, `Cache-Control`, the 304,
 * the `Content-Type` — are behavior worth testing, and with a hard-wired service they could only be tested
 * through the withheld branch. `GET` below passes `serveDerivative`, the production binding over the real
 * register and the real gate, so nothing a handler test does can put a synthetic approval on the wire.
 */

import { type ServingOutcome, serveDerivative } from "@/lib/server/media/serving";

interface RouteContext {
  readonly params: Promise<{ assetId?: string }>;
}

/** A serving service: whatever decides one asset id, production binding or fixture alike. */
export type DerivativeServer = (assetId: string) => Promise<ServingOutcome>;

/** Everything the client is allowed to learn about a refusal: nothing, and do not cache it. */
function withheld(): Response {
  return new Response(null, {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function answer(
  request: Request,
  context: RouteContext,
  serve: DerivativeServer,
): Promise<Response> {
  const { assetId } = await context.params;
  if (typeof assetId !== "string" || assetId.trim() === "") return withheld();

  const outcome = await serve(assetId);
  if (outcome.kind === "refused") return withheld();

  const entityTag = `"${outcome.etag}"`;
  const base = {
    "ETag": entityTag,
    "X-Content-Type-Options": "nosniff",
    // Revalidate every time. A derivative's permission to exist can be withdrawn the moment its
    // original's rights change, and a year-long `max-age` would keep drawing pixels from browser caches
    // after the gate said no. O-08's short-lived signed URLs for restricted originals are still open
    // work and would replace this if restricted material ever needed a cache.
    "Cache-Control": "public, max-age=0, must-revalidate",
  };

  if (request.headers.get("if-none-match") === entityTag) {
    return new Response(null, { headers: base, status: 304 });
  }

  return new Response(outcome.body, {
    headers: { ...base, "Content-Type": outcome.mime },
    status: 200,
  });
}

/** The handler with an explicitly supplied serving service. See the header note on `GET`. */
export function createMediaRouteHandler(
  serve: DerivativeServer,
): (request: Request, context: RouteContext) => Promise<Response> {
  return (request, context) => answer(request, context, serve);
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  return answer(request, context, serveDerivative);
}
