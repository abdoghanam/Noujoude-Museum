// Quick connectivity check: count structural rows.
import { getPayload } from "payload";
// eslint-disable-next-line no-restricted-syntax
import config from "../src/payload/payload.config.ts";

const payload = await getPayload({ config });
const countries = await payload.find({ collection: "countries", limit: 0 });
const categories = await payload.find({ collection: "categories", limit: 0 });
console.log("countries:", countries.totalDocs);
console.log("categories:", categories.totalDocs);
process.exit(0);
