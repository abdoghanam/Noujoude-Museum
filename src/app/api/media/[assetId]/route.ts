/**
 * src/app/api/media/[assetId]/route.ts — the only URL on which a derivative byte reaches a browser.
 *
 * `src/lib/server/media/slot-facts.ts` hands a slot `/api/media/<id>` as its source, and this handler is
 * what answers on it. The important part is that the URL is not the permission: every request runs
 * `serveDerivative`, which re-resolves the asset in the register, re-runs `decidePublicServing`, re-checks
 * that the derivative has lineage, that its path stays inside the private store, that it is small enough to
 * read at all (SR-09), and that its bytes still hash to what the manifest recorded. A link that someone
 * bookmarked, typed or scraped therefore buys nothing — the gate is consulted at the moment of serving,
 * which is what §20.4's STT-002 row requires and what RB-01 is about: measured today, 0 of 82 assets pass,
 * so every request to this endpoint answers 404.
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

import {
  type ServingOutcome,
  serveDerivative,
} from "@/lib/server/media/serving";
import {
  type RequestLimitGuard,
  productionRequestLimitGuard,
} from "@/lib/server/media/request-limits";

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

/**
 * The over-the-allowance answer: a `429`, an empty body, and nothing cacheable.
 *
 * No `X-RateLimit-Limit` or `X-RateLimit-Remaining`. Those headers are a courtesy to a well-behaved client
 * and a specification sheet to the caller this exists to slow down, and this endpoint has no well-behaved
 * automated client today. `Retry-After` is kept because RFC 9110 §10.2.3 makes it the header that tells a
 * honest client how long to wait, and a denial that cannot be acted on is only a denial.
 */
function rateLimited(retryAfterSeconds: number): Response {
  return new Response(null, {
    status: 429,
    headers: {
      "Cache-Control": "no-store",
      "Retry-After": String(retryAfterSeconds),
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * The opaque tag of one `entity-tag`, parsed strictly — or null when the value is not an entity tag.
 *
 * RFC 9110 §8.8.3's ABNF is `entity-tag = [ weak ] opaque-tag`, `weak = %s"W/"`, and `opaque-tag` a
 * DQUOTE-delimited string whose contents exclude a bare DQUOTE. So an unquoted digest, an empty string, or
 * a value with an embedded quote or backslash escape is not an entity tag and answers null rather than a
 * guess. (A `\"` quoted-pair is legal ABNF inside a DQUOTE string per §5.5; this parser rejects it instead
 * of unescaping, because an entity tag carrying an escaped quote is not something this route emits,
 * generating or comparing, and the failure direction is one extra transfer rather than extra code.)
 *
 * The `W/` prefix is stripped and then not returned: §13.1.2 mandates the weak comparison function for
 * `If-None-Match`, and that function compares opaque tags only, "regardless of either or both being tagged
 * as weak" (§8.8.3.2). Strength is therefore not a fact this decision needs.
 */
function parseEntityTag(value: string): string | null {
  let rest = value.trim();
  if (rest.slice(0, 2).toUpperCase() === "W/") rest = rest.slice(2).trim();
  if (rest.length < 2 || !rest.startsWith('"') || !rest.endsWith('"'))
    return null;
  const opaque = rest.slice(1, -1);
  if (opaque.includes('"') || opaque.includes("\\")) return null;
  return opaque;
}

/**
 * The comma-separated members of a conditional header, with commas inside a quoted tag left alone.
 *
 * `String.split(",")` would cut `"a,b"` into two garbage members. The scanner is six lines and exists so
 * that a list value is read as a list of tags rather than as a list of fragments.
 */
function splitTagList(header: string): string[] {
  const members: string[] = [];
  let start = 0;
  let inQuotes = false;
  for (let index = 0; index < header.length; index += 1) {
    const character = header[index];
    if (character === '"') inQuotes = !inQuotes;
    else if (character === "," && !inQuotes) {
      members.push(header.slice(start, index));
      start = index + 1;
    }
  }
  members.push(header.slice(start));
  return members;
}

/**
 * Does this `If-None-Match` mean "the client already holds the current representation"?
 *
 * RFC 9110 evaluates the header as a *negative* condition — §13.1.2's three rules each say when "the
 * condition is false", and a false condition is what forbids the method and produces a `304` for GET and
 * HEAD (§13.1.2, §15.4.5). This function answers the positive form of the same fact, so the mapping is:
 * returns true ⇔ the RFC's condition is false ⇔ `304`. Getting that inversion right is the whole of
 * register risk **SR-07**: the comparison this route shipped before was an exact string match against the
 * quoted strong tag, which implemented none of §13.1.2's rules.
 *
 * Rule by rule, against the shipped text of the RFC:
 *
 * - §13.1.2 rule 1 — "If the field value is `*`, the condition is false if the origin server has a current
 *   representation for the target resource." Reaching this function at all *is* having a current
 *   representation, because the outcome that got here was `served` with a digest in hand. So `*` matches.
 * - §13.1.2 rule 2 — "If the field value is a list of entity tags, the condition is false if one of the
 *   listed tags matches the entity tag of the selected representation." Hence the list scan, and any member
 *   matching is enough.
 * - §13.1.2's MUST — "A recipient MUST use the weak comparison function when comparing entity tags for
 *   If-None-Match." §8.8.3.2 defines that function as opaque-tag equality "regardless of either or both
 *   being tagged as weak", so the `W/` prefix is parsed and then deliberately ignored on both sides. The
 *   strong comparison function is *not* used here, even though it is the one that reads intuitively correct
 *   for a bytes-integrity check: §13.1.2 rules it out for this header, and the route's own `ETag` is always
 *   strong (§8.8.3.1) so the two functions agree on every input the route can emit today.
 * - §13.1.2 rule 3 — "Otherwise, the condition is true", i.e. transfer. A member that is not an `entity-tag`
 *   at all under §8.8.3's ABNF (unquoted, empty, containing an embedded quote or a backslash escape) is not
 *   a validator and cannot match.
 *
 * That last point is also the safety direction: every ambiguity here answers `false` from this function,
 * which means a `200` and a re-transfer. A `304` is a claim about bytes the client already holds, and a
 * false positive would leave a cache holding a derivative the gate has since withheld; the cost of the
 * false negative is bandwidth. The refusal path never reaches this function at all.
 */
export function conditionalRepresentationMatches(
  ifNoneMatch: string | null,
  currentEntityTag: string,
): boolean {
  if (ifNoneMatch === null) return false;
  const field = ifNoneMatch.trim();
  if (field === "") return false;
  if (field === "*") return true;
  const current = parseEntityTag(currentEntityTag);
  if (current === null) return false;
  // The weak comparison function of RFC 9110 §8.8.3.2: opaque equality, weakness on either side ignored.
  return splitTagList(field).some(
    (member) => parseEntityTag(member) === current,
  );
}

async function answer(
  request: Request,
  context: RouteContext,
  serve: DerivativeServer,
  limits: RequestLimitGuard,
): Promise<Response> {
  // First thing, before the id is read and before the register is touched: the point of the limit is the
  // work it prevents, so a denied request must cost the application nothing (ASVS V5.5, SC-5).
  const permission = limits.enforce(request);
  if (!permission.allowed) return rateLimited(permission.retryAfterSeconds);

  const { assetId } = await context.params;
  if (typeof assetId !== "string" || assetId.trim() === "") return withheld();

  /*
   * A failing decision is withheld, not thrown. `serveDerivative` reads and validates `lineage.json` on
   * every request (SR-08), so a corrupt or hostile record in the private store is a throw, not a refusal —
   * and an uncaught throw here reaches the visitor as a `500`. The endpoint's contract is that a request
   * that does not get authorised bytes gets the byteless `404`, and a `500` breaks it while adding nothing a
   * `404` does not already say. The cause goes to the server log, which is where §6.8 puts implementation
   * detail; nothing of it is echoed. This is the handler mapping §6.8's row listed as owed to "the API
   * routes that do not exist yet", and this is the first of them.
   */
  let outcome: ServingOutcome;
  try {
    outcome = await serve(assetId);
  } catch (cause) {
    console.error(
      `/api/media: the serving decision threw, so the request is withheld. Cause:`,
      cause,
    );
    return withheld();
  }
  if (outcome.kind === "refused") return withheld();

  const entityTag = `"${outcome.etag}"`;
  const base = {
    ETag: entityTag,
    "X-Content-Type-Options": "nosniff",
    // Revalidate every time. A derivative's permission to exist can be withdrawn the moment its
    // original's rights change, and a year-long `max-age` would keep drawing pixels from browser caches
    // after the gate said no. O-08's short-lived signed URLs for restricted originals are still open
    // work and would replace this if restricted material ever needed a cache.
    "Cache-Control": "public, max-age=0, must-revalidate",
  };

  if (
    conditionalRepresentationMatches(
      request.headers.get("if-none-match"),
      entityTag,
    )
  ) {
    return new Response(null, { headers: base, status: 304 });
  }

  return new Response(outcome.body, {
    headers: { ...base, "Content-Type": outcome.mime },
    status: 200,
  });
}

/**
 * The handler with its serving service and its request limit supplied explicitly.
 *
 * Both are parameters rather than imports for the same reason: they are the behaviour worth testing, and
 * a hard-wired service could only be exercised through the withheld branch (see `serving.ts`), while a hard
 * -wired limiter could only be tested by waiting for a real clock to refill. `GET` below passes
 * `serveDerivative` and the production guard, so nothing a handler test does can put a synthetic approval or
 * an unthrottled path on the wire. The limiter is a required parameter on purpose — a media route built
 * without one is the defect SR-04 records, and the type is where that choice can be enforced.
 */
export function createMediaRouteHandler(
  serve: DerivativeServer,
  limits: RequestLimitGuard,
): (request: Request, context: RouteContext) => Promise<Response> {
  return (request, context) => answer(request, context, serve, limits);
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  // `productionRequestLimitGuard` throws `RateLimitConfigurationError` when the declared configuration
  // cannot be honoured — including when `RATE_LIMIT_REDIS_URL` is set, the control the template used to
  // declare and this build does not implement (ADR-034 removes the declaration and keeps this refusal). The
  // throw is left to stand: it happens before any asset is read, so
  // the endpoint fails closed rather than serving unlimited bytes under a belief, and the message stays in
  // the server log where §6.8 puts it, not in a client response.
  return answer(
    request,
    context,
    serveDerivative,
    productionRequestLimitGuard(),
  );
}
