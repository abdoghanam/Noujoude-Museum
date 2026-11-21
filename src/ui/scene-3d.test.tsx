import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Scene3D } from "./scene-3d";

describe("Scene3D primitive", () => {
  it("renders children", () => {
    const html = renderToStaticMarkup(<Scene3D>content</Scene3D>);
    expect(html).toContain("content");
  });

  it("renders placeholder when no children", () => {
    const html = renderToStaticMarkup(<Scene3D />);
    expect(html).toContain("Museum Scene");
  });

  it("applies scene class", () => {
    const html = renderToStaticMarkup(<Scene3D />);
    expect(html).toContain("scene");
  });
});