import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ImageViewer } from "./image-viewer";

describe("ImageViewer primitive", () => {
  it("renders thumbnail image", () => {
    const html = renderToStaticMarkup(
      <ImageViewer
        src="/test.webp"
        alt="Test image"
        width={100}
        height={100}
      />,
    );
    expect(html).toContain("<img");
    expect(html).toContain('alt="Test image"');
  });

  it("renders caption and credit", () => {
    const html = renderToStaticMarkup(
      <ImageViewer
        src="/test.webp"
        alt="Test"
        width={100}
        height={100}
        caption="A caption"
        credit="A credit"
      />,
    );
    expect(html).toContain("A caption");
    expect(html).toContain("A credit");
  });

  it("renders dialog element", () => {
    const html = renderToStaticMarkup(
      <ImageViewer src="/test.webp" alt="Test" width={100} height={100} />,
    );
    expect(html).toContain("<dialog");
  });
});
