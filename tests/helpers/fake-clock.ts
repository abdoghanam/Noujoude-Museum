/**
 * tests/helpers/fake-clock.ts — one manual clock for the tests that need to prove a rate, not just a
 * threshold.
 *
 * Time-based behaviour cannot be asserted against `Date.now()` without sleeping: a test that waits a second
 * to see whether a token came back is slow, flaky on a loaded machine, and — the actual problem — it does
 * not say *how fast* the refill is, only that something eventually happens. Passing a clock in and
 * advancing it by hand turns "refills at the configured rate" into an assertion with a number in it.
 *
 * It lives here rather than in each test file because two files measure the same thing at two different
 * layers: `src/lib/server/media/request-limits.test.ts` tests the bucket's arithmetic, and
 * `src/app/api/media/[assetId]/route.test.ts` tests that the route refuses before it does any work. A
 * second copy of this nine-line device would be a second thing to keep honest, which is the pattern
 * `docs/SECURITY_AND_PERMISSIONS.md` §6.1's header guard exists to avoid.
 */
export interface ManualClock {
  /** The function a clock-taking factory calls instead of `Date.now`. */
  readonly now: () => number;
  /** Moves time forward by whole milliseconds. Never moves it back: a clock that goes backwards would make
   *  the bucket's elapsed-time arithmetic negative, and the code under test clamps that to zero rather than
   *  trusting it. */
  readonly advance: (ms: number) => void;
}

export function createManualClock(start = 0): ManualClock {
  let current = start;
  return {
    advance: (ms: number) => {
      if (ms < 0) throw new Error("a manual clock only moves forward");
      current += ms;
    },
    now: () => current,
  };
}
