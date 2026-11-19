import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Stack } from "./stack";

describe("Stack primitive", () => {
  it("renders children", () => {
    const html = renderToStaticMarkup(<Stack>x</Stack>);
    expect(html).toContain("x");
  });

  it("applies gap and direction classes", () => {
    const html = renderToStaticMarkup(<Stack gap="4" direction="inline">y</Stack>);
    expect(html).toContain("gap4");
    expect(html).toContain("inline");
  });
});