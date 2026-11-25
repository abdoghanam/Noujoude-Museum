import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const dir = "src/payload/collections";
const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));

for (const file of files) {
  const filePath = dir + "/" + file;
  let content = readFileSync(filePath, "utf8");
  if (content.includes("delete: isOwner") && content.includes('from "../access"')) {
    // Check if isOwner is already imported
    if (!content.match(/import \{[^}]*\bisOwner\b[^}]*\} from "\.\.\/access"/)) {
      // Add isOwner to the import
      content = content.replace(
        /import \{ (isOwnerOrAdmin[^}]*) \} from "\.\.\/access"/,
        "import { isOwner, $1 } from \"../access\"",
      );
      // Handle case where import has different format
      if (!content.includes("isOwner") && content.includes('from "../access"')) {
        content = content.replace(
          'from "../access"',
          'from "../access"\n// isOwner needs to be imported',
        );
      }
      writeFileSync(filePath, content, "utf8");
      console.log("Fixed import: " + file);
    }
  }
}