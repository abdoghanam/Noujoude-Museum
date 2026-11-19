import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input primitive", () => {
  it("renders an input", () => {
    const html = renderToStaticMarkup(<Input label="Name" />);
    expect(html).toContain("<input");
    expect(html).toContain("Name");
  });

  it("renders hint", () => {
    const html = renderToStaticMarkup(<Input hint="help" />);
    expect(html).toContain("help");
  });
});