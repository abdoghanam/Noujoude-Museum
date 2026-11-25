import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "src/payload/collections";
const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));

const skip = new Set(["users.ts", "inquiries.ts", "countries.ts"]);

for (const file of files) {
  if (skip.has(file)) continue;

  const filePath = join(dir, file);
  let content = readFileSync(filePath, "utf8");

  if (content.includes("access:")) continue;

  // Add import after first import line
  content = content.replace(
    /(import type \{ CollectionConfig \} from "payload";)/,
    '$1\n\nimport { isOwnerOrAdmin, canRead, canCreate, canUpdate, canDelete } from "../access";',
  );

  // Add access block after slug line
  content = content.replace(
    /(slug: "[^"]+",)/,
    '$1\n  access: {\n    read: isOwnerOrAdmin,\n    create: canCreate,\n    update: canUpdate,\n    delete: isOwnerOrAdmin,\n  },',
  );

  writeFileSync(filePath, content, "utf8");
  console.log(`Updated: ${file}`);
}