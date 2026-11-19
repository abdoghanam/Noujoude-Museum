import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Card } from "./card";

describe("Card primitive", () => {
  it("renders children inside an article by default", () => {
    const html = renderToStaticMarkup(<Card>x</Card>);
    expect(html).toContain("<article");
    expect(html).toContain("x");
  });

  it("supports section/div as element", () => {
    expect(renderToStaticMarkup(<Card as="section">y</Card>)).toContain("<section");
    expect(renderToStaticMarkup(<Card as="div">z</Card>)).toContain("<div");
  });
});