/**
 * src/lib/server/media/request-limits.ts — what SR-04's remedy has to be true of, tested against the
 * arithmetic rather than against a sleep.
 *
 * The finding this file closes was not "no limiter exists" in the abstract: the deployment template declared
 * `RATE_LIMIT_REDIS_URL`, §6.6 of `docs/SECURITY_AND_PERMISSIONS.md` recorded it as declared with no consumer,
 * and hole H-1 names the shape — a control that is announced but never implemented is read as
 * protection by whoever reads the configuration. So these tests aim at the three things that make the
 * remedy real: the bucket actually paces a client at the configured rate, the configuration the deployment
 * declares is actually read (including the declaration this build refuses to honour), and the key a client
 * is tracked under cannot be turned into an address log. The store and the failure mode are decided by
 * **ADR-034**, which also records that the code arrived before the ADR in this same uncommitted batch.
 *
 * The clock is injected rather than real. Against `Date.now()` a test can only check the first burst and
 * then wait, which proves a bucket exists and not that it refills at the configured rate — and the refill
 * rate *is* the control. `maxTrackedClients` gets the same treatment: a limiter whose own memory grows
 * without bound is a second resource-exhaustion vector, so the bound is asserted directly.
 *
 * Nothing here reads the process environment. `rateLimitPolicyFromEnvironment` takes the record it reads as
 * a parameter, so the production defaults, the overrides and the refused `RATE_LIMIT_REDIS_URL` are all
 * exercised with literal objects — no `process.env` mutation, no test-order coupling, and no credential in
 * any transcript.
 */

import {
  RateLimitConfigurationError,
  type RateLimitPolicy,
  clientAddressFrom,
  clientKeyFor,
  createIpRateLimiter,
  createRequestLimitGuard,
  DEFAULT_RATE_LIMIT_POLICY,
  rateLimitPolicyFromEnvironment,
  validatePolicy,
} from "@/lib/server/media/request-limits";
import { describe, expect, it } from "vitest";

import { createManualClock } from "../../../../tests/helpers/fake-clock";

function policy(overrides: Partial<RateLimitPolicy> = {}): RateLimitPolicy {
  return { ...DEFAULT_RATE_LIMIT_POLICY, ...overrides };
}

function requestWith(headers: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/media/NDM-AST-001", {
    headers,
  });
}

describe("the bucket paces a client at the configured rate (ASVS V2.5, NIST SC-5)", () => {
  it("lets a client spend the burst and refuses the request past it", () => {
    const clock = createManualClock();
    const limiter = createIpRateLimiter(
      policy({ capacity: 3, refillPerSecond: 1 }),
      clock.now,
    );
    for (const index of [0, 1, 2]) {
      expect(limiter.check("client-a").allowed, String(index)).toBe(true);
    }
    const denied = limiter.check("client-a");
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBe(1);
    expect(denied.remaining).toBe(0);
  });

  it("refills at the configured rate and not faster", () => {
    const clock = createManualClock();
    const limiter = createIpRateLimiter(
      policy({ capacity: 1, refillPerSecond: 1 }),
      clock.now,
    );
    expect(limiter.check("client-a").allowed).toBe(true);
    expect(limiter.check("client-a").allowed).toBe(false);

    // Half a token is not a request: the allowance must be a whole token before it is spent.
    clock.advance(500);
    expect(limiter.check("client-a").allowed).toBe(false);

    clock.advance(500);
    expect(limiter.check("client-a").allowed).toBe(true);
  });

  it("never refills past the capacity, so idling buys no larger burst", () => {
    const clock = createManualClock();
    const limiter = createIpRateLimiter(
      policy({ capacity: 2, refillPerSecond: 10 }),
      clock.now,
    );
    expect(limiter.check("client-a").allowed).toBe(true);
    // A minute of idle at ten tokens a second would refill 600 tokens if the ceiling were not applied.
    // The ceiling is the control: after the pause the client gets exactly `capacity`, not `capacity` plus
    // whatever the elapsed time says it earned.
    clock.advance(60_000);
    expect(limiter.check("client-a").allowed).toBe(true);
    expect(limiter.check("client-a").allowed).toBe(true);
    expect(limiter.check("client-a").allowed).toBe(false);
  });

  it("states Retry-After as the whole seconds the deficit needs, rounded up", () => {
    const clock = createManualClock();
    const limiter = createIpRateLimiter(
      policy({ capacity: 1, refillPerSecond: 0.5 }),
      clock.now,
    );
    expect(limiter.check("client-a").allowed).toBe(true);
    // One token short at half a token per second is two seconds, and a fractional wait must never round
    // down to zero — a `Retry-After: 0` would tell the client to hammer again immediately.
    const denied = limiter.check("client-a");
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBe(2);
  });

  it("keeps clients independent, which is what makes it a per-client limit rather than a global one", () => {
    const clock = createManualClock();
    const limiter = createIpRateLimiter(
      policy({ capacity: 1, refillPerSecond: 1 }),
      clock.now,
    );
    expect(limiter.check("client-a").allowed).toBe(true);
    expect(limiter.check("client-a").allowed).toBe(false);
    expect(limiter.check("client-b").allowed).toBe(true);
    expect(limiter.trackedClients()).toBe(2);
  });

  it("bounds the table at the configured number of clients, evicting the least-recently-seen", () => {
    const clock = createManualClock();
    // A refill rate so slow it is invisible inside the test's own timeline: what this case measures is the
    // bound, and a refill would blur which bucket a later decision came from.
    const limiter = createIpRateLimiter(
      policy({ capacity: 1, maxTrackedClients: 2, refillPerSecond: 0.001 }),
      clock.now,
    );
    expect(limiter.check("client-a").allowed).toBe(true);
    expect(limiter.check("client-b").allowed).toBe(true);
    expect(limiter.trackedClients()).toBe(2);

    // The third client cannot grow the map: a limiter whose own memory grows without bound is the second
    // resource-exhaustion vector, and this one exists to prevent the first.
    expect(limiter.check("client-c").allowed).toBe(true);
    expect(limiter.trackedClients()).toBe(2);

    // The eviction is least-recently-seen, and its cost is stated rather than hidden: `client-a` had spent
    // its token and is now back to a full bucket, because forgetting a client is cheaper than an O(clients)
    // scan per request. Under enough address churn the bound therefore protects memory absolutely and
    // accounting approximately, which is the trade the module documents.
    expect(limiter.check("client-a").allowed).toBe(true);
    expect(limiter.trackedClients()).toBe(2);
    // `client-b` is the one that has been forgotten, so a second spend from it is a fresh allowance again.
    expect(limiter.check("client-b").allowed).toBe(true);
  });

  it("keeps a client's own bucket alive while it is being seen, so the eviction is not a reset", () => {
    const clock = createManualClock();
    const limiter = createIpRateLimiter(
      policy({ capacity: 2, maxTrackedClients: 2, refillPerSecond: 0.001 }),
      clock.now,
    );
    expect(limiter.check("client-a").allowed).toBe(true);
    expect(limiter.check("client-a").allowed).toBe(true);
    expect(limiter.check("client-a").allowed).toBe(false);
    // A newcomer that fits inside the bound evicts nobody: `client-a` keeps its spent state and stays
    // denied, which is the property that makes this a limit rather than a rotating door.
    expect(limiter.check("client-b").allowed).toBe(true);
    expect(limiter.trackedClients()).toBe(2);
    expect(limiter.check("client-a").allowed).toBe(false);
  });

  it("puts anonymous callers in one shared bucket and does not punish an addressed caller for them", () => {
    const guard = createRequestLimitGuard(
      policy({ capacity: 2, refillPerSecond: 1 }),
      { salt: "test-salt" },
    );
    expect(guard.enforce(requestWith({})).allowed).toBe(true);
    expect(guard.enforce(requestWith({})).allowed).toBe(true);
    const third = guard.enforce(requestWith({}));
    expect(third.allowed).toBe(false);
    if (!third.allowed) expect(third.status).toBe(429);

    // A caller that supplies an address is a different client, so it is not punished for the anonymous
    // crowd's spending — and the table now holds exactly those two clients.
    expect(
      guard.enforce(requestWith({ "x-forwarded-for": "203.0.113.7" })).allowed,
    ).toBe(true);
    expect(guard.limiter.trackedClients()).toBe(2);
  });
});

describe("the policy the deployment declares is read, not decorated (SR-04, H-1)", () => {
  it("uses the measured defaults when the environment declares nothing", () => {
    const empty = {
      RATE_LIMIT_BUCKET_CAPACITY: "",
      RATE_LIMIT_MAX_TRACKED_CLIENTS: "",
      RATE_LIMIT_REFILL_PER_SECOND: "",
      RATE_LIMIT_REDIS_URL: "",
      RATE_LIMIT_TRUSTED_PROXY_HOPS: "",
    };
    expect(rateLimitPolicyFromEnvironment(empty)).toEqual({
      capacity: 40,
      maxTrackedClients: 10_000,
      refillPerSecond: 10,
      trustedProxyHops: 0,
    });
  });

  it("honours declared values instead of logging that it ignored them", () => {
    const declared = {
      RATE_LIMIT_BUCKET_CAPACITY: "100",
      RATE_LIMIT_MAX_TRACKED_CLIENTS: "500",
      RATE_LIMIT_REFILL_PER_SECOND: "2.5",
      RATE_LIMIT_REDIS_URL: "",
      RATE_LIMIT_TRUSTED_PROXY_HOPS: "2",
    };
    expect(rateLimitPolicyFromEnvironment(declared)).toEqual({
      capacity: 100,
      maxTrackedClients: 500,
      refillPerSecond: 2.5,
      trustedProxyHops: 2,
    });
  });

  it("treats an empty value as 'unset' and never as zero", () => {
    // `.env.example` writes "unset" as an empty string. Reading that as 0 would deny every visitor from an
    // untouched template, which is a denial of service the configuration file itself would cause.
    expect(
      rateLimitPolicyFromEnvironment({
        RATE_LIMIT_BUCKET_CAPACITY: "",
        RATE_LIMIT_REFILL_PER_SECOND: "",
      }).capacity,
    ).toBe(DEFAULT_RATE_LIMIT_POLICY.capacity);
  });

  it("lets a deployment declare a rate slower than one request a second", () => {
    // The measured defect this test now closes. The first live run of the endpoint answered
    // `RATE_LIMIT_REFILL_PER_SECOND=0.2` with a configuration error, because refill shared capacity's
    // "at least 1 token" floor while `validatePolicy` and the bucket accept any positive rate. A limit that
    // cannot be set slower than one request per second is not a limit an archive can choose, and the
    // requirement belongs to the bucket.
    expect(
      rateLimitPolicyFromEnvironment({ RATE_LIMIT_REFILL_PER_SECOND: "0.2" })
        .refillPerSecond,
    ).toBe(0.2);
  });

  it.each([
    ["a zero capacity", { RATE_LIMIT_BUCKET_CAPACITY: "0" }],
    ["a negative capacity", { RATE_LIMIT_BUCKET_CAPACITY: "-5" }],
    ["a word where a number belongs", { RATE_LIMIT_BUCKET_CAPACITY: "many" }],
    ["a zero refill", { RATE_LIMIT_REFILL_PER_SECOND: "0" }],
    ["a negative refill", { RATE_LIMIT_REFILL_PER_SECOND: "-0.5" }],
    [
      "a fractional tracked-client bound",
      { RATE_LIMIT_MAX_TRACKED_CLIENTS: "2.5" },
    ],
    ["a negative hop count", { RATE_LIMIT_TRUSTED_PROXY_HOPS: "-1" }],
  ])(
    "refuses %s rather than serving a limit nobody chose",
    (_label, overrides) => {
      expect(() => rateLimitPolicyFromEnvironment(overrides)).toThrow(
        RateLimitConfigurationError,
      );
    },
  );

  it("refuses to pretend a Redis-backed limit exists, and does not echo the URL it refused", () => {
    // The declared control this build does not implement. Two properties, both load-bearing: it must not be
    // silently ignored (that is H-1), and the error must not print the value — a Redis URL is the canonical
    // place a password sits, and this project's rules bar a secret from any report, log or message.
    const secretish =
      "redis://user:super-secret-token-9e1f@cache.internal:6379/0";
    let caught: unknown = null;
    try {
      rateLimitPolicyFromEnvironment({ RATE_LIMIT_REDIS_URL: secretish });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(RateLimitConfigurationError);
    const message = (caught as Error).message;
    expect(message).toContain("SR-04");
    expect(message).not.toContain("super-secret-token-9e1f");
    expect(message).not.toContain(secretish);
    expect(message).toContain("RATE_LIMIT_REDIS_URL");
  });

  it("leaves an empty declaration alone, because that is the shipped template's value", () => {
    expect(() =>
      rateLimitPolicyFromEnvironment({ RATE_LIMIT_REDIS_URL: "" }),
    ).not.toThrow();
    expect(() => rateLimitPolicyFromEnvironment({})).not.toThrow();
  });

  it.each([
    [policy({ capacity: 0 })],
    [policy({ refillPerSecond: 0 })],
    [policy({ refillPerSecond: Number.NaN })],
    [policy({ maxTrackedClients: 0 })],
    [policy({ trustedProxyHops: -1 })],
    [policy({ trustedProxyHops: 1.5 })],
  ])("refuses a policy that cannot be honoured: %o", (candidate) => {
    expect(() => validatePolicy(candidate)).toThrow(
      RateLimitConfigurationError,
    );
    expect(() => createIpRateLimiter(candidate)).toThrow(
      RateLimitConfigurationError,
    );
  });
});

describe("the address a client is keyed on", () => {
  it("takes the leftmost entry when no proxy is trusted", () => {
    expect(
      clientAddressFrom(
        requestWith({ "x-forwarded-for": "203.0.113.1, 203.0.113.2" }),
        0,
      ),
    ).toBe("203.0.113.1");
  });

  it("reads from the right when the deployment says how many proxies it sits behind", () => {
    // Each trusted proxy appends the peer it saw, so the client is the entry N from the right. Indexing
    // from the right is what makes a client-injected entry at the left harmless.
    const list = "203.0.113.99, 198.51.100.7, 192.0.2.10";
    expect(clientAddressFrom(requestWith({ "x-forwarded-for": list }), 1)).toBe(
      "192.0.2.10",
    );
    expect(clientAddressFrom(requestWith({ "x-forwarded-for": list }), 2)).toBe(
      "198.51.100.7",
    );
  });

  it("clamps instead of crashing when the hop count exceeds the entries", () => {
    expect(
      clientAddressFrom(requestWith({ "x-forwarded-for": "203.0.113.1" }), 4),
    ).toBe("203.0.113.1");
  });

  it("trims whitespace and skips empty list items", () => {
    expect(
      clientAddressFrom(
        requestWith({ "x-forwarded-for": " , 203.0.113.8" }),
        0,
      ),
    ).toBe("203.0.113.8");
  });

  it("falls back to x-real-ip, and to null when the deployment says nothing about the caller", () => {
    expect(
      clientAddressFrom(requestWith({ "x-real-ip": "203.0.113.3" }), 0),
    ).toBe("203.0.113.3");
    expect(clientAddressFrom(requestWith({}), 0)).toBeNull();
    expect(
      clientAddressFrom(requestWith({ "x-forwarded-for": "   " }), 0),
    ).toBeNull();
  });

  it("prefers the list over x-real-ip when both arrive", () => {
    expect(
      clientAddressFrom(
        requestWith({
          "x-forwarded-for": "203.0.113.4",
          "x-real-ip": "203.0.113.5",
        }),
        0,
      ),
    ).toBe("203.0.113.4");
  });
});

describe("the bucket key is a hash of an address, not an address log", () => {
  it("never contains the address it was built from", () => {
    const key = clientKeyFor(
      requestWith({ "x-forwarded-for": "203.0.113.77" }),
      policy(),
      "salt",
    );
    expect(key).not.toContain("203.0.113.77");
    expect(key).toMatch(/^[\da-f]{32}$/);
  });

  it("is stable for one address in one process and different across addresses", () => {
    const a = clientKeyFor(
      requestWith({ "x-forwarded-for": "203.0.113.1" }),
      policy(),
      "salt",
    );
    const same = clientKeyFor(
      requestWith({ "x-forwarded-for": "203.0.113.1" }),
      policy(),
      "salt",
    );
    const b = clientKeyFor(
      requestWith({ "x-forwarded-for": "203.0.113.2" }),
      policy(),
      "salt",
    );
    expect(a).toBe(same);
    expect(a).not.toBe(b);
  });

  it("changes with the process salt, which is why a captured table is not a reusable blocklist", () => {
    const one = clientKeyFor(
      requestWith({ "x-forwarded-for": "203.0.113.1" }),
      policy(),
      "salt-a",
    );
    const two = clientKeyFor(
      requestWith({ "x-forwarded-for": "203.0.113.1" }),
      policy(),
      "salt-b",
    );
    expect(one).not.toBe(two);
  });

  it("puts every address-less caller in one shared bucket rather than in none", () => {
    const key = clientKeyFor(requestWith({}), policy(), "salt");
    expect(clientKeyFor(requestWith({}), policy(), "salt")).toBe(key);
    // Unknown caller is a reason to apply the limit. Two such requests are the same client for this
    // process, which is conservative by design and documented at the function.
    expect(key).toMatch(/^[\da-f]{32}$/);
  });
});

describe("the guard a route calls", () => {
  it("answers 429 with the seconds to wait once the allowance is spent", () => {
    const clock = createManualClock();
    const guard = createRequestLimitGuard(
      policy({ capacity: 1, refillPerSecond: 2 }),
      { now: clock.now, salt: "test-salt" },
    );
    expect(
      guard.enforce(requestWith({ "x-forwarded-for": "203.0.113.1" })),
    ).toEqual({
      allowed: true,
    });
    expect(
      guard.enforce(requestWith({ "x-forwarded-for": "203.0.113.1" })),
    ).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
      status: 429,
    });
    clock.advance(500);
    expect(
      guard.enforce(requestWith({ "x-forwarded-for": "203.0.113.1" })),
    ).toEqual({
      allowed: true,
    });
  });

  it("treats two hop counts as two different views of the same header list", () => {
    // Documents the consequence of the configuration knob: the deployment's topology decides who the
    // bucket belongs to, and the guard is where that decision is applied.
    const headers = { "x-forwarded-for": "203.0.113.1, 192.0.2.2" };
    const asZeroHops = createRequestLimitGuard(policy(), { salt: "s" });
    const asOneHop = createRequestLimitGuard(policy({ trustedProxyHops: 1 }), {
      salt: "s",
    });
    expect(clientKeyFor(requestWith(headers), asZeroHops.policy, "s")).not.toBe(
      clientKeyFor(requestWith(headers), asOneHop.policy, "s"),
    );
  });
});
