import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Heading } from "./heading";

describe("Heading primitive", () => {
  it("renders h2 by default", () => {
    const html = renderToStaticMarkup(<Heading>x</Heading>);
    expect(html).toContain("<h2");
  });

  it("renders the requested level", () => {
    expect(renderToStaticMarkup(<Heading level={1}>a</Heading>)).toContain("<h1");
    expect(renderToStaticMarkup(<Heading level={3}>b</Heading>)).toContain("<h3");
    expect(renderToStaticMarkup(<Heading level={4}>c</Heading>)).toContain("<h4");
  });
});