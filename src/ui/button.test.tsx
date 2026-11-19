import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button primitive", () => {
  it("renders children and a button element", () => {
    const html = renderToStaticMarkup(<Button>Enter</Button>);
    expect(html).toContain("<button");
    expect(html).toContain("Enter");
  });

  it("applies the primary variant by default", () => {
    const html = renderToStaticMarkup(<Button>Enter</Button>);
    expect(html).toContain("primary");
  });

  it("applies the ghost variant when requested", () => {
    const html = renderToStaticMarkup(<Button variant="ghost">Back</Button>);
    expect(html).toContain("ghost");
  });

  it("forwards arbitrary attributes", () => {
    const html = renderToStaticMarkup(<Button aria-label="enter">x</Button>);
    expect(html).toContain('aria-label="enter"');
  });
});