import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const dir = "src/payload/collections";
const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));

for (const file of files) {
  const filePath = dir + "/" + file;
  let content = readFileSync(filePath, "utf8");
  if (content.includes("canRead, canCreate, canUpdate, canDelete")) {
    content = content.replace(
      "isOwnerOrAdmin, canRead, canCreate, canUpdate, canDelete",
      "isOwnerOrAdmin, canCreate, canUpdate",
    );
    writeFileSync(filePath, content, "utf8");
    console.log("Fixed: " + file);
  }
}