import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Container } from "./container";

describe("Container primitive", () => {
  it("renders children", () => {
    const html = renderToStaticMarkup(<Container>x</Container>);
    expect(html).toContain("x");
  });

  it("applies measure class", () => {
    expect(
      renderToStaticMarkup(<Container measure="reading">y</Container>),
    ).toContain("reading");
    expect(
      renderToStaticMarkup(<Container measure="wide">z</Container>),
    ).toContain("wide");
  });
});
