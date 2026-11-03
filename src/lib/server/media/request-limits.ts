/**
 * src/lib/server/media/request-limits.ts — the per-client token bucket the endpoint was documented as
 * having and did not have.
 *
 * `docs/SECURITY_AND_PERMISSIONS.md` §16 scheduled rate limiting and the deployment template declared
 * `RATE_LIMIT_REDIS_URL`, while no line of code read either. That is risk **SR-04** in the 2 November
 * register and hole **H-1** in the readiness report: an announced control with no implementation is worse
 * than an absent one, because whoever reads the configuration believes the protection is on. This module is
 * the implementation, and `rateLimitPolicyFromEnvironment` is where the declared variables stop being
 * decoration. The store choice and the failure mode are decided in **ADR-034**.
 *
 * **Why in-process, and what that costs.** The declared variable names a Redis server; a Redis client is a
 * dependency this build has not been authorized to add, so buckets live in this process's memory.
 * `RATE_LIMIT_REDIS_URL` is now read and **refused when non-empty**: `rateLimitPolicyFromEnvironment` throws
 * a `RateLimitConfigurationError` that names SR-04 and never echoes the value, `productionRequestLimitGuard`
 * lets it stand, and the route does not catch it — so the endpoint declines to serve rather than serving
 * while a distributed limit is believed to exist. Measured on a `next start` on 2 November 2026
 * (`evidence/live-sr04-rate-limit.txt` §C9): the deployed server answers **500 with a zero-byte body**, the
 * configuration error appears in the server log and nowhere on the wire, and every request repeats it. That
 * status belongs to Next.js, not to this module — which is why this module returns no status for the case
 * (`RateLimitResponse` offers `429` alone) and why the response is not documented as a `503` it does not send.
 * Fail-closed is the point: the alternative is serving bytes while believing a distributed limit exists. The
 * variable itself no longer appears in `.env.example` — ADR-034 takes item 2.9(c)'s second exit and removes
 * the declaration, while this refusal stays, so an operator who carries an older `.env` forward gets the
 * same decline rather than an unthrottled endpoint. The costs of in-process limiting are stated rather than
 * hidden: with N workers there are N independent buckets, so a client may get up to N× the allowance, and a
 * process restart forgets every bucket.
 *
 * **Why the key is a hash.** An IP address is personal data, and this project's own configuration bars
 * telemetry from carrying personal content (`.env.example`'s observability block), while Master Spec §6.12
 * puts anything address-shaped under PII handling. A map keyed by raw address would be an access log nobody
 * approved, so buckets are keyed by `SHA-256(salt ‖ address)`. The salt is per process, which also means a
 * leaked bucket table cannot be reversed for any address the attacker does not already know. The trade is
 * real and recorded: a hashed key cannot be used to name-and-block one address, so operational blocklisting
 * stays a proxy concern.
 *
 * **Why the client address is not trusted further than the deployment says it should be.** Measured in
 * `node_modules/next/dist/server/base-server.js` line 601 of 16.4.3: Next fills `x-forwarded-for` from the
 * socket's `remoteAddress` **only when the header is absent** (`??=`). So with no proxy in front, the header
 * usually *is* the peer address — and a caller may also have typed it themselves, because Next will not
 * overwrite a value that arrived. `RATE_LIMIT_TRUSTED_PROXY_HOPS` names which situation a deployment is in:
 * 0 (the default, and the honest one while no deployment exists) takes the leftmost entry, which is
 * best-effort and documented as such; N takes the entry N positions from the right, which is the address the
 * outermost trusted proxy saw and is not reachable by a client that injects extra entries at the left.
 * A request with no address at all shares one `unaddressed` bucket: unknown caller is a reason to apply the
 * limit, never a reason to skip it.
 *
 * **What a denial does.** Denials are answered before `serveDerivative` runs, so the work an attacker is
 * trying to buy — read the register, parse 82 rows, read the derivative, hash it — is exactly the work that
 * does not happen. The response is `429` with `Retry-After`, an empty body, `no-store`, and no
 * `X-RateLimit-Limit`/`-Remaining`: publishing the bucket size and the caller's position in it is a gift to
 * the caller this exists to slow down. A denial can never turn into a `304`, which the route's tests assert
 * against a matching `If-None-Match`.
 */

import { createHash, randomUUID } from "node:crypto";

/** How many requests one client may make in a burst, and how fast the allowance grows back. */
export interface RateLimitPolicy {
  /** Tokens a client starts with, and the ceiling the bucket refills to. At least 1. */
  readonly capacity: number;
  /** Tokens added per second of elapsed time. Greater than 0. */
  readonly refillPerSecond: number;
  /** Upper bound on simultaneously tracked clients; past it the least-recently-seen bucket is evicted. */
  readonly maxTrackedClients: number;
  /** Trusted proxies in front of this process. 0 means "the header is the caller's word". */
  readonly trustedProxyHops: number;
}

/**
 * The defaults, anchored to a measurement rather than to a guess.
 *
 * The worst route in `src/lib/media/usage-map.ts` declares 11 surfaces (`the-museum`) plus the one global
 * binding, so one page render *will* ask for at most 12 derivative URLs once derivatives exist; 40 tokens
 * leave room for three such pages back to back before pacing begins. What the page asks for today is
 * different, and was measured rather than assumed: `/ar/the-museum` served by `next start` on 2 November 2026
 * contains 0 occurrences of `/api/media` and 0 `<img>` elements, because no derivative manifest exists and
 * every slot renders without a source (§C6 of `evidence/live-sr04-rate-limit.txt`). So 40 is a margin over a
 * future render, not headroom over a current one — and the number that matters for the present is that a
 * direct burst behaves as declared: 200 concurrent requests from one address granted 49 and paced 151, which
 * is 40 tokens plus about a second of refill at 10 per second (§C8). 10 tokens per second is far above any
 * real reading rate, and low enough that an id-enumeration sweep is throttled to 600 refusals a minute per
 * client. `maxTrackedClients` bounds the memory the limiter itself can be made to consume — a limiter that
 * grows without limit is a second resource-exhaustion vector, which is the thing it exists to prevent.
 */
export const DEFAULT_RATE_LIMIT_POLICY: RateLimitPolicy = {
  capacity: 40,
  maxTrackedClients: 10_000,
  refillPerSecond: 10,
  trustedProxyHops: 0,
};

export interface RateLimitDecision {
  readonly allowed: boolean;
  /** Whole seconds the caller should wait; null when allowed. */
  readonly retryAfterSeconds: number | null;
  /** Tokens left after this decision. Never sent to the client; asserted by operator-facing tests. */
  readonly remaining: number;
}

export interface IpRateLimiter {
  /** Consumes one token when the client is within its allowance. */
  readonly check: (clientKey: string) => RateLimitDecision;
  /** Buckets currently held. A test seam for the eviction bound, not a public number. */
  readonly trackedClients: () => number;
  readonly policy: RateLimitPolicy;
}

interface Bucket {
  tokens: number;
  /** Milliseconds, from the limiter's own clock. */
  updatedAt: number;
}

/**
 * A token bucket over an injectable clock.
 *
 * `now` is a parameter rather than `Date.now()` because the refill arithmetic is the part worth asserting:
 * against a real clock a test can only check the first burst and then sleep, which proves the bucket exists
 * and not that it refills at the configured rate. A `Map` is deliberate — its insertion order is the
 * eviction order, so the least-recently-seen client is what a bounded table drops, and dropping a bucket
 * costs a client its spent tokens, never its permission.
 */
export function createIpRateLimiter(
  policy: RateLimitPolicy = DEFAULT_RATE_LIMIT_POLICY,
  now: () => number = Date.now,
): IpRateLimiter {
  validatePolicy(policy);
  const buckets = new Map<string, Bucket>();

  function settle(clientKey: string, present: number): Bucket {
    const remembered = buckets.get(clientKey);
    // A client with no bucket starts full: the allowance is what the policy says it is, not what the last
    // evicted stranger spent.
    const base: Bucket = remembered ?? {
      tokens: policy.capacity,
      updatedAt: present,
    };
    if (remembered === undefined && buckets.size >= policy.maxTrackedClients) {
      evictOne();
    }
    const elapsedMs = Math.max(0, present - base.updatedAt);
    const bucket: Bucket = {
      tokens: Math.min(
        policy.capacity,
        base.tokens + (elapsedMs / 1000) * policy.refillPerSecond,
      ),
      updatedAt: present,
    };
    // Re-insert so insertion order tracks "last seen", which is what `evictOne` reads.
    buckets.delete(clientKey);
    buckets.set(clientKey, bucket);
    return bucket;
  }

  function evictOne(): void {
    // Least-recently-seen, which `Map` insertion order makes O(1). The alternative — scan every bucket and
    // project its refill to find the idlest — is O(clients) per request, and once an attacker has filled
    // the table that scan is the CPU exhaustion the limiter was written to prevent. The cost of the cheap
    // choice is stated rather than hidden: an evicted client regains a full bucket, so the bound protects
    // memory absolutely and accounting approximately, under churn it degrades toward a shared allowance.
    // Reaching that state costs an attacker one real request per distinct address, which is the trade this
    // project takes.
    const oldest = buckets.keys().next();
    if (!oldest.done) buckets.delete(oldest.value);
  }

  return {
    policy,
    check(clientKey: string): RateLimitDecision {
      const present = now();
      const bucket = settle(clientKey, present);
      if (bucket.tokens < 1) {
        const secondsToNextToken = (1 - bucket.tokens) / policy.refillPerSecond;
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil(secondsToNextToken)),
        };
      }
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        retryAfterSeconds: null,
      };
    },
    trackedClients: () => buckets.size,
  };
}

/** Thrown for a policy that cannot be honoured, or for a declared control this build does not implement. */
export class RateLimitConfigurationError extends Error {
  override readonly name = "RateLimitConfigurationError";
}

/**
 * A policy is only meaningful if it can be violated, so a nonsense number is an error rather than a silent
 * behaviour change. `capacity: 0` would deny every request; `refillPerSecond: 0` turns a limiter into a
 * permanent ban after one burst. Neither should be reachable by a typo in an environment file.
 */
export function validatePolicy(policy: RateLimitPolicy): void {
  if (!Number.isFinite(policy.capacity) || policy.capacity < 1) {
    throw new RateLimitConfigurationError(
      `rate limit capacity must be a finite number of at least 1 token, got ${String(policy.capacity)}`,
    );
  }
  if (!Number.isFinite(policy.refillPerSecond) || policy.refillPerSecond <= 0) {
    throw new RateLimitConfigurationError(
      `rate limit refill must be a finite number of tokens per second greater than 0, got ${String(policy.refillPerSecond)}`,
    );
  }
  if (
    !Number.isInteger(policy.maxTrackedClients) ||
    policy.maxTrackedClients < 1
  ) {
    throw new RateLimitConfigurationError(
      `rate limit tracked-client bound must be a positive integer, got ${String(policy.maxTrackedClients)}`,
    );
  }
  if (
    !Number.isInteger(policy.trustedProxyHops) ||
    policy.trustedProxyHops < 0
  ) {
    throw new RateLimitConfigurationError(
      `trusted proxy hop count must be a non-negative integer, got ${String(policy.trustedProxyHops)}`,
    );
  }
}

type EnvRecord = Record<string, string | undefined>;

/**
 * The policy the deployment declared, or the measured defaults where it declared nothing.
 *
 * An empty string is how `.env.example` writes "unset", so empty means default rather than zero — an empty
 * file must not be able to deny every visitor. A non-numeric value throws instead of being coerced.
 *
 * The bounds are `validatePolicy`'s, restated here in the vocabulary a deployment can type: capacity at
 * least 1 token, refill any positive number of tokens per second (so one request every ten seconds is
 * declarable as `0.1`), the tracked-client bound a positive integer, the hop count a non-negative integer.
 */
export function rateLimitPolicyFromEnvironment(
  env: EnvRecord = process.env,
): RateLimitPolicy {
  const redisUrl = (env["RATE_LIMIT_REDIS_URL"] ?? "").trim();
  if (redisUrl !== "") {
    throw new RateLimitConfigurationError(
      "RATE_LIMIT_REDIS_URL is set, but this build limits requests in process memory only: no Redis client is a dependency, so the distributed bucket the variable names does not exist. Unset the variable to run the in-process limiter, or authorize the client and implement it (register SR-04).",
    );
  }
  return {
    capacity: numberAtLeast(
      env,
      "RATE_LIMIT_BUCKET_CAPACITY",
      DEFAULT_RATE_LIMIT_POLICY.capacity,
    ),
    refillPerSecond: positiveNumber(
      env,
      "RATE_LIMIT_REFILL_PER_SECOND",
      DEFAULT_RATE_LIMIT_POLICY.refillPerSecond,
    ),
    maxTrackedClients: wholeNumber(
      env,
      "RATE_LIMIT_MAX_TRACKED_CLIENTS",
      DEFAULT_RATE_LIMIT_POLICY.maxTrackedClients,
    ),
    trustedProxyHops: wholeNumber(
      env,
      "RATE_LIMIT_TRUSTED_PROXY_HOPS",
      DEFAULT_RATE_LIMIT_POLICY.trustedProxyHops,
      0,
    ),
  };
}

function numberAtLeast(env: EnvRecord, name: string, fallback: number): number {
  const raw = (env[name] ?? "").trim();
  if (raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) {
    throw new RateLimitConfigurationError(
      `${name} must be a number of at least 1, got "${raw}"`,
    );
  }
  return value;
}

/**
 * A rate, so the bound is "greater than 0" rather than "at least 1" — and fractions are the point.
 *
 * The first live run of this endpoint refused `RATE_LIMIT_REFILL_PER_SECOND=0.2` while `validatePolicy`
 * accepted 0.2 in a policy object: the shared reader had borrowed capacity's floor. A limit that cannot be
 * set slower than one request a second is a limit that cannot be set at all for a museum derivative, so the
 * reader now matches the rule the policy type already states.
 */
function positiveNumber(
  env: EnvRecord,
  name: string,
  fallback: number,
): number {
  const raw = (env[name] ?? "").trim();
  if (raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new RateLimitConfigurationError(
      `${name} must be a positive number of tokens per second, got "${raw}"`,
    );
  }
  return value;
}

function wholeNumber(
  env: EnvRecord,
  name: string,
  fallback: number,
  minimum = 1,
): number {
  const raw = (env[name] ?? "").trim();
  if (raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum) {
    throw new RateLimitConfigurationError(
      `${name} must be a whole number of ${minimum} or more, got "${raw}"`,
    );
  }
  return value;
}

/** The salt every bucket key of this process is built from. Never logged, never persisted. */
const PROCESS_SALT = randomUUID();

/**
 * The bucket key for a request: a salted digest of an address, never the address itself.
 *
 * Falls back to one shared `unaddressed` value when no client address can be read, because "unknown
 * caller" is a reason to apply the limit rather than a reason to skip it.
 */
export function clientKeyFor(
  request: Request,
  policy: RateLimitPolicy = DEFAULT_RATE_LIMIT_POLICY,
  salt: string = PROCESS_SALT,
): string {
  const address =
    clientAddressFrom(request, policy.trustedProxyHops) ?? "unaddressed";
  return createHash("sha256")
    .update(`${salt}|${address}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * The address this deployment is allowed to believe in.
 *
 * `x-forwarded-for` is a comma list each proxy appends to, so behind N trusted proxies the client is the
 * entry N positions from the right; indexing from the right is what stops a caller from sliding its own
 * entries in at the left. With 0 trusted proxies the leftmost entry is used, which is the caller's word as
 * often as it is the peer address (see the header note on the measured `??=` behaviour) — the limiter is
 * therefore best-effort at hop count 0 and is documented as such rather than as a guarantee.
 * `x-real-ip` is the single-value form the same proxies commonly set, and is used only when the list is
 * absent.
 */
export function clientAddressFrom(
  request: Request,
  trustedProxyHops: number = DEFAULT_RATE_LIMIT_POLICY.trustedProxyHops,
): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded !== null && forwarded.trim() !== "") {
    const entries = forwarded
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "");
    if (entries.length > 0) {
      const index =
        trustedProxyHops >= 1 ? entries.length - trustedProxyHops : 0;
      const chosen = entries[Math.max(0, Math.min(index, entries.length - 1))];
      if (chosen !== undefined && chosen !== "") return chosen;
    }
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp !== null && realIp.trim() !== "") return realIp.trim();
  return null;
}

/**
 * Everything an HTTP surface needs to refuse a caller that is over its allowance.
 *
 * This is the shape SR-04's remedy asks for — "a token bucket per IP on `/api/*`, plus initial protection
 * for any future write endpoint": the limiter is not specialized to media, so the first write route can
 * take the same three calls. Keeping the response construction here is the part that matters: one
 * implementation means a future endpoint cannot invent a denial that leaks which asset was being asked for.
 *
 * Stated at its exact size: `/api/*` today is one route (`src/app/api/media/[assetId]/route.ts` — the build
 * prints 17 routes and that is the only API among them), so this guard covers every API surface the site has
 * and no surface it does not. It is not a middleware-level limit, and an HTTP surface added later is
 * un-paced until it calls `enforce` — which is a fact about the build, not about this module.
 */
export interface RequestLimitGuard {
  /** The response to send instead of doing the work, or `{ allowed: true }` when the request may proceed. */
  readonly enforce: (request: Request) => RateLimitResponse;
  readonly limiter: IpRateLimiter;
  readonly policy: RateLimitPolicy;
}

/**
 * The guard's answer, as a discriminant the route has to read rather than a status it has to guess.
 *
 * `status` is `429` alone, not a union that also offers `503`. A denial of service is the only thing this
 * guard can decide: the misconfigured-deployment case is a thrown `RateLimitConfigurationError`, not a
 * status this module returns, and a type that advertised a `503` branch would invite a route to write a
 * branch that no input can ever reach.
 */
export type RateLimitResponse =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly status: 429;
      readonly retryAfterSeconds: number;
    };

export function createRequestLimitGuard(
  policy: RateLimitPolicy = DEFAULT_RATE_LIMIT_POLICY,
  options: {
    readonly now?: () => number;
    readonly salt?: string;
  } = {},
): RequestLimitGuard {
  const limiter = createIpRateLimiter(policy, options.now ?? Date.now);
  return {
    limiter,
    policy,
    enforce(request: Request): RateLimitResponse {
      const decision = limiter.check(
        clientKeyFor(request, policy, options.salt),
      );
      if (decision.allowed) return { allowed: true };
      return {
        allowed: false,
        retryAfterSeconds: decision.retryAfterSeconds ?? 1,
        status: 429,
      };
    },
  };
}

/**
 * The production guard, built lazily so that a misconfiguration is a refusal at request time rather than a
 * process that cannot start.
 *
 * Laziness has a cost: the first request pays for reading the environment and constructing the bucket
 * table. It buys the property that matters here — `next build` never evaluates deployment configuration, so
 * a build on a machine without the production environment cannot be reddened by a policy it has no business
 * knowing, and a wrong policy still cannot serve bytes.
 *
 * There is deliberately no exported reset. SR-10's finding is that a process-level cache with a public
 * setter is a seam production code can be talked into using; tests that need a specific policy or clock
 * build one with `createRequestLimitGuard(policy, { now, salt })`, which is the same factory the production
 * path calls, so nothing about the behaviour under test depends on mutating a global.
 */
let productionGuard: RequestLimitGuard | null = null;

export function productionRequestLimitGuard(): RequestLimitGuard {
  if (productionGuard === null) {
    productionGuard = createRequestLimitGuard(rateLimitPolicyFromEnvironment());
  }
  return productionGuard;
}
