import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const dir = "src/payload/collections";
const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));

for (const file of files) {
  const filePath = dir + "/" + file;
  let content = readFileSync(filePath, "utf8");
  if (content.includes("delete: isOwnerOrAdmin")) {
    content = content.replace("delete: isOwnerOrAdmin", "delete: isOwner");
    writeFileSync(filePath, content, "utf8");
    console.log("Fixed: " + file);
  }
}