import { describe, expect, it } from "vitest";

import {
  AUDIT_COLUMNS,
  AssetRegistryError,
  approvalFrom,
  publishedFrom,
  parseIntendedUsage,
  rightsStateFrom,
  recordsFromRows,
} from "@/lib/media/asset-record";

/**
 * The pure mapping rules, exercised on invented rows.
 *
 * The real 82 rows are measured in `src/lib/server/media/registry.test.ts`. What belongs here is the
 * behaviour the real file cannot show, because every one of its rows sits in the same three states:
 * what happens on the input that has not arrived yet, and what happens on a register that lies.
 */

const row = (over: Partial<Record<(typeof AUDIT_COLUMNS)[number], string>> = {}): string[] => {
  const cells: Record<string, string> = {
    "Asset ID": "NDM-AST-001",
    Filename: "hero_16x9.webp",
    "Expected Category": "A.8.1 Country World Hero Assets",
    "Physical Status": "PRESENT",
    "Actual Path": "hero/hero_16x9.webp",
    "MIME Type": "image/webp",
    Width: "1600",
    Height: "900",
    "File Size": "12345",
    "SHA-256": "a".repeat(64),
    "Source/Creator": "Not supplied in any reference document",
    "Rights Status": "UNKNOWN — no rights statement supplied in reference/",
    "Brand/Curatorial Approval": "Not Approved — no approval record supplied",
    "Intended Usage": "Museum entrance | Homepage hero, Mobile homepage",
    "Actual Usage": "None — not referenced by any page",
    "Derivative Status": "Original (no derivatives produced)",
    "Alt Text Status": "Not Recorded",
    Notes: "",
    "Verified By": "",
    "Verified Date": "",
  };
  return AUDIT_COLUMNS.map((column) => over[column] ?? cells[column] ?? "");
};

const register = (...rows: string[][]): string[][] => [
  [...AUDIT_COLUMNS],
  ...rows,
];

describe("R-04 and §20.4: the register maps fail-closed, never permissively", () => {
  it("reads the delivered header cell-for-cell", () => {
    const records = recordsFromRows(register(row()));
    expect(records).toHaveLength(1);
    const first = records[0];
    expect(first?.assetId).toBe("NDM-AST-001");
    expect(first?.width).toBe(1600);
    expect(first?.height).toBe(900);
    expect(first?.bytes).toBe(12345);
    expect(first?.libraryPath).toBe("hero/hero_16x9.webp");
  });

  it("carries the raw statements alongside the mapped states", () => {
    const [record] = recordsFromRows(register(row()));
    expect(record?.rightsStatement).toBe(
      "UNKNOWN — no rights statement supplied in reference/",
    );
    expect(record?.rights).toBe("unknown");
    expect(record?.approvalStatement).toBe(
      "Not Approved — no approval record supplied",
    );
    expect(record?.approval).toBe("not_approved");
  });

  it("splits the catalog's role | surfaces convention", () => {
    const [record] = recordsFromRows(register(row()));
    expect(record?.role).toBe("Museum entrance");
    expect(record?.surfaces).toEqual(["Homepage hero", "Mobile homepage"]);
  });

  it("treats a usage with no surface list as an empty list, not a fabricated one", () => {
    const [record] = recordsFromRows(
      register(row({ "Intended Usage": "Reference only" })),
    );
    expect(record?.role).toBe("Reference only");
    expect(record?.surfaces).toEqual([]);
  });

  it("honours a trailing blank line instead of reading it as an asset", () => {
    const records = recordsFromRows(register(row(), [""]));
    expect(records).toHaveLength(1);
  });
});

describe("the three status dimensions stay three", () => {
  it("a PRESENT file is not therefore cleared", () => {
    const [record] = recordsFromRows(
      register(row({ "Physical Status": "PRESENT" })),
    );
    expect(record?.physicalStatus).toBe("PRESENT");
    expect(record?.rights).toBe("unknown");
  });

  it("a MISSING file keeps whatever rights statement the row carries", () => {
    const [record] = recordsFromRows(
      register(
        row({
          "Physical Status": "MISSING",
          "Rights Status": "Awaiting Rights Review",
        }),
      ),
    );
    expect(record?.physicalStatus).toBe("MISSING");
    expect(record?.rights).toBe("pending");
  });

  it("a WRONG_FORMAT row parses, because the register reports it rather than hiding it", () => {
    const [record] = recordsFromRows(
      register(row({ "Physical Status": "WRONG_FORMAT" })),
    );
    expect(record?.physicalStatus).toBe("WRONG_FORMAT");
  });
});

describe("the vocabulary the audit actually emits", () => {
  it("maps the two rights statements present in the register", () => {
    expect(rightsStateFrom("UNKNOWN — no rights statement supplied in reference/")).toBe(
      "unknown",
    );
    expect(rightsStateFrom("Awaiting Rights Review")).toBe("pending");
  });

  it("maps the one approval statement present in the register", () => {
    expect(approvalFrom("Not Approved — no approval record supplied")).toBe(
      "not_approved",
    );
  });

  it("returns unknown, not approved, for a statement it does not recognise", () => {
    expect(rightsStateFrom("Rights: (c) someone, contact us")).toBe("unknown");
    expect(rightsStateFrom("")).toBe("unknown");
    expect(approvalFrom("Approved by the Owner")).toBe("unknown");
    expect(approvalFrom("")).toBe("unknown");
    expect(publishedFrom("Anything at all")).toBe(false);
  });

  it("has no cleared marker yet, so nothing can be read as cleared by accident", () => {
    // The whitelist is empty on purpose. If this test ever passes with `cleared`, someone added a
    // marker — which is the moment a human decision became a string match, and it should be argued
    // about in review, not discovered in production.
    expect(rightsStateFrom("Cleared")).toBe("unknown");
    expect(rightsStateFrom("approved")).toBe("unknown");
    expect(approvalFrom("Approved")).toBe("unknown");
    expect(approvalFrom("CLEARED")).toBe("unknown");
  });

  it("trims before matching, so padding in a cell is not a different state", () => {
    expect(rightsStateFrom("  Awaiting Rights Review  ")).toBe("pending");
    expect(approvalFrom("\tNot Approved — no approval record supplied")).toBe(
      "not_approved",
    );
  });
});

describe("parseIntendedUsage", () => {
  it("drops empty surface entries", () => {
    expect(parseIntendedUsage("Role | a, , b ,").surfaces).toEqual(["a", "b"]);
  });

  it("keeps a surface name containing a space intact", () => {
    expect(
      parseIntendedUsage("Role | Homepage hero, Morocco World").surfaces,
    ).toEqual(["Homepage hero", "Morocco World"]);
  });
});

describe("a register that lies is refused, not repaired", () => {
  it("rejects a header it does not know", () => {
    const bad = ["ID", ...AUDIT_COLUMNS.slice(1)];
    expect(() => recordsFromRows([bad, row()])).toThrow(AssetRegistryError);
    expect(() => recordsFromRows([bad, row()])).toThrow(/column 0 is "ID"/);
  });

  it("rejects a header that dropped or added a column", () => {
    expect(() => recordsFromRows([[...AUDIT_COLUMNS.slice(0, 19)], row()])).toThrow(
      /expected a 20-column header, found 19/,
    );
  });

  it("rejects a row whose cell count differs, which is what a shifted column looks like", () => {
    expect(() => recordsFromRows(register([...row(), "extra"]))).toThrow(
      /a register row has 21 cells, expected 20/,
    );
  });

  it("rejects a Physical Status outside the delivered vocabulary", () => {
    expect(() =>
      recordsFromRows(register(row({ "Physical Status": "OK" }))),
    ).toThrow(/Physical Status "OK" is outside the allowed set/);
  });

  it("rejects a non-integer Width rather than treating it as unknown pixels", () => {
    expect(() => recordsFromRows(register(row({ Width: "auto" })))).toThrow(
      /Width is "auto", which is not a positive integer/,
    );
    expect(() => recordsFromRows(register(row({ Height: "" })))).toThrow(
      /Height/,
    );
    expect(() => recordsFromRows(register(row({ Width: "1600.5" })))).toThrow(
      /Width/,
    );
  });

  it("rejects a zero File Size, which is an empty file wearing a row", () => {
    expect(() => recordsFromRows(register(row({ "File Size": "0" })))).toThrow(
      /File Size is "0"/,
    );
  });

  it("names the offending asset, so a 82-row register does not fail anonymously", () => {
    expect(() =>
      recordsFromRows(register(row({ "Asset ID": "NDM-AST-042", Width: "x" }))),
    ).toThrow(/^NDM-AST-042: Width/);
  });
});
