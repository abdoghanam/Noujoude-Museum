import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { State } from "./state";

describe("State primitive", () => {
  it("renders title and description", () => {
    const html = renderToStaticMarkup(<State kind="empty" title="Nothing here" description="Try later" />);
    expect(html).toContain("Nothing here");
    expect(html).toContain("Try later");
    expect(html).toContain('role="status"');
  });

  it("renders loading kind", () => {
    const html = renderToStaticMarkup(<State kind="loading" title="Loading" />);
    expect(html).toContain("loading");
  });
});