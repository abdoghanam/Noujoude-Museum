import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { GlobalError } from "../app/global-error";
import { LocaleError } from "../app/[locale]/error";
import {
  RENDER_FAILURE_SENTENCE,
  RenderFailure,
  type RenderFailureProps,
} from "@/ui/render-failure";

/**
 * `src/ui/render-failure.test.tsx` — the boundary is tested by handing it a secret and proving the
 * secret cannot come back out.
 *
 * `SR-05`'s finding was behavioural, so the assertions are behavioural: these tests render the two
 * boundaries the application actually ships (`src/app/[locale]/error.tsx` and
 * `src/app/global-error.tsx`), not a fixture that imitates them, and the error object they receive
 * carries the exact strings the finding said would leak — an absolute repository path, the register's
 * filename, and a stack frame pointing at the line that threw. Standard §5 line 176, quoted in
 * `docs/SECURITY_AND_PERMISSIONS.md` §6.8, is the requirement: "Safe error responses without stack
 * traces, secrets, or internal implementation details", with "details to logs, correlation ID to
 * client". The correlation ID half is asserted too, so the sentence cannot be satisfied by deleting
 * the reference a log line needs.
 *
 * Every guard here was red-checked by reintroducing the leak it forbids: printing `error.message` in
 * the band fails the message and path assertions, and dropping the title fails the document assertion.
 */

const LEAKED_MESSAGE =
  "the asset register at E:\\no\\docs\\ASSET_INVENTORY_AUDIT.csv could not be read; media slots cannot decide without it";

const LEAKED_STACK = `Error: ${LEAKED_MESSAGE}
    at readRegisterBytes (E:/no/src/lib/server/media/registry.ts:120:11)
    at registerSnapshot (E:/no/src/lib/server/media/registry.ts:141:18)`;

const DIGEST = "9f2c1e7a4b8d";

function failingError(): Error & { readonly digest?: string } {
  const error = new Error(LEAKED_MESSAGE);
  error.stack = LEAKED_STACK;
  return error;
}

const INTERNAL_MARKERS = [
  LEAKED_MESSAGE,
  "ASSET_INVENTORY_AUDIT.csv",
  "registry.ts",
  "E:/no",
  "E:\\no",
  "at readRegisterBytes",
  LEAKED_STACK,
] as const;

/**
 * A React element, narrowed to what these assertions need. The tree walk below is deliberately typed
 * rather than `any`-typed: an assertion on an untyped node proves nothing about the node the renderer
 * actually built.
 */
interface ElementLike {
  readonly type: unknown;
  readonly props: {
    readonly children?: unknown;
    readonly onClick?: unknown;
    readonly reset?: unknown;
  };
}

function asElement(node: unknown): ElementLike | null {
  if (typeof node !== "object" || node === null) return null;
  return node as ElementLike;
}

function findButton(node: unknown): ElementLike | null {
  const element = asElement(node);
  if (element === null) return null;
  if (element.type === "button") return element;
  const children = element.props.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findButton(child);
    if (found !== null) return found;
  }
  return null;
}

describe("the locale boundary", () => {
  it("renders one fixed sentence and none of the failure it was handed", () => {
    const html = renderToStaticMarkup(
      LocaleError({ error: failingError(), reset: () => undefined }),
    );
    expect(html).toContain(RENDER_FAILURE_SENTENCE);
    expect(html).toContain('data-slot="render-failure"');
    expect(html).toContain('lang="en"');
    for (const marker of INTERNAL_MARKERS) {
      expect(html, marker).not.toContain(marker);
    }
  });

  it("hands the visitor the correlation ID, which is the half of §6.8 that survives", () => {
    const error = Object.assign(failingError(), { digest: DIGEST });
    const html = renderToStaticMarkup(
      LocaleError({ error, reset: () => undefined }),
    );
    expect(html).toContain(DIGEST);
    expect(html).toContain("Server reference");
  });

  it("states no reference when the failure produced none, instead of inventing one", () => {
    const html = renderToStaticMarkup(
      LocaleError({ error: failingError(), reset: () => undefined }),
    );
    expect(html).not.toContain("Server reference");
  });

  it("offers a retry that cannot submit anything", () => {
    const html = renderToStaticMarkup(
      LocaleError({ error: failingError(), reset: () => undefined }),
    );
    // `type="button"` because a boundary that renders inside a future form must not become its submit
    // control by inheritance.
    expect(html).toMatch(/<button[^>]*type="button"[^>]*>Try again<\/button>/);
  });

  it("re-renders the failed subtree when the retry is used", () => {
    const reset = vi.fn();
    // Typed through `ElementLike` rather than read off the returned `JSX.Element`: `ReactElement`'s
    // `props` is `any` unless the generic is supplied, and an assertion against `any` is checked by
    // nothing — the project's own `no-unsafe-member-access` rule says so, and it is armed for `src/`.
    const element = asElement(LocaleError({ error: failingError(), reset }));
    // The boundary forwards React's own `reset` rather than a link that reloads the page, and the band
    // puts that same function on the button's handler. Both halves are asserted because either one
    // dropped leaves a retry that does not retry.
    expect(element?.props.reset).toBe(reset);
    const button = findButton(RenderFailure({ digest: null, reset }));
    expect(button).not.toBeNull();
    expect(button?.props.onClick).toBe(reset);
  });
});

describe("the root boundary", () => {
  it("builds a whole document, because the layout that normally does it is what failed", () => {
    const html = renderToStaticMarkup(
      GlobalError({ error: failingError(), reset: () => undefined }),
    );
    expect(html).toContain('<html dir="ltr" lang="en">');
    expect(html).toContain("<body>");
    // WCAG 2.2's 2.4.2: a failure page is still a page a visitor is standing on.
    expect(html).toContain("<title>Noujoude</title>");
    expect(html).toContain(RENDER_FAILURE_SENTENCE);
    for (const marker of INTERNAL_MARKERS) {
      expect(html, marker).not.toContain(marker);
    }
  });

  it("says plainly that it cannot honour the locale contract", () => {
    // The band's copy is English and marked `lang="en"`; the document falls back the same way, and the
    // comment in `global-error.tsx` records the cost rather than claiming bilingual coverage it does
    // not have.
    const html = renderToStaticMarkup(
      GlobalError({ error: failingError(), reset: () => undefined }),
    );
    expect(html).not.toContain('lang="ar"');
    expect(html).toContain('lang="en"');
  });
});

describe("the shared band itself", () => {
  it("has no channel through which a message could arrive", () => {
    // The props are `{digest, reset}`. A hostile caller can still spread an extra key — and this is the
    // test that proves spreading one changes nothing visible, which is the structural version of the
    // rule: the boundary is not *choosing* to hide a message, it is never given one.
    const hostile = {
      digest: null,
      message: LEAKED_MESSAGE,
      reset: () => undefined,
      stack: LEAKED_STACK,
    } satisfies RenderFailureProps & {
      readonly message: string;
      readonly stack: string;
    };
    const html = renderToStaticMarkup(RenderFailure(hostile));
    for (const marker of INTERNAL_MARKERS) {
      expect(html, marker).not.toContain(marker);
    }
    expect(html).toContain(RENDER_FAILURE_SENTENCE);
  });

  it("carries no count, no status code and no invented explanation", () => {
    const html = renderToStaticMarkup(
      RenderFailure({ digest: null, reset: () => undefined }),
    );
    // Class names are content-hashed by the CSS-module transform, so the assertion runs on the text
    // the visitor is given, not on the markup's plumbing.
    const visible = html.replace(/ class="[^"]*"/g, "");
    // §6.1 bars fabricated content, and a failure page is where an agent is most tempted to print a
    // status code or promise a repair.
    expect(visible).not.toMatch(/500|\bstatus\b|HTTP/i);
    expect(visible).not.toMatch(/fixed|resolved|back to normal/i);
    expect(visible.match(/<p/g)?.length).toBe(1);
  });
});
