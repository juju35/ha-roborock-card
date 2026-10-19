// Bundles src/roborock-card.js into the single HACS file dist/roborock-card.js,
// inlining the Roborock logo and device pictures so the card needs no extra resource.
// Usage: node scripts/build.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));
const b64 = (file) => readFileSync(`${root}images/${file}`).toString("base64");

const out = readFileSync(`${root}src/roborock-card.js`, "utf8")
  .replace("__VERSION__", pkg.version)
  .replace("__IMG_LOGO__", `data:image/svg+xml;base64,${b64("logo.svg")}`)
  .replace("__IMG_SAROS_20__", `data:image/webp;base64,${b64("saros-20.webp")}`)
  .replace("__IMG_F25_ULTRA__", `data:image/webp;base64,${b64("f25-ultra.webp")}`);

const target = `${root}dist/roborock-card.js`;
if (process.argv.includes("--check")) {
  if (!existsSync(target) || readFileSync(target, "utf8") !== out) {
    console.error("dist/roborock-card.js is out of date: run `npm run build` and commit the result.");
    process.exit(1);
  }
  console.log("dist/roborock-card.js is up to date.");
} else {
  writeFileSync(target, out);
  console.log(`Built dist/roborock-card.js (${(out.length / 1024).toFixed(1)} KB)`);
}
