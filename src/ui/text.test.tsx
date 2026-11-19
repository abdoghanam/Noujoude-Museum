import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Text } from "./text";

describe("Text primitive", () => {
  it("renders a paragraph", () => {
    const html = renderToStaticMarkup(<Text>hello</Text>);
    expect(html).toContain("<p");
    expect(html).toContain("hello");
  });

  it("applies variant class", () => {
    expect(renderToStaticMarkup(<Text variant="caption">c</Text>)).toContain("caption");
    expect(renderToStaticMarkup(<Text variant="secondary">s</Text>)).toContain("secondary");
  });
});