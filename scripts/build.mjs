// Bundles src/roborock-card.js into the single HACS file dist/roborock-card.js,
// inlining the integration logos (Roborock, Xiaomi Mi Home, Xiaomi, Dreame) so the card needs no extra resource.
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));
const dataUri = (file) =>
  `data:${file.endsWith(".svg") ? "image/svg+xml" : "image/png"};base64,${readFileSync(`${root}images/${file}`).toString("base64")}`;

const out = readFileSync(`${root}src/roborock-card.js`, "utf8")
  .replace("__VERSION__", pkg.version)
  .replace("__IMG_LOGO__", dataUri("logo.svg"))
  .replace("__IMG_LOGO_MIHOME__", dataUri("mihome.png"))
  .replace("__IMG_LOGO_XIAOMI__", dataUri("xiaomi.png"))
  .replace("__IMG_LOGO_DREAME__", dataUri("dreame.png"));

const target = `${root}dist/roborock-card.js`;
mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(target, out);
console.log(`Built dist/roborock-card.js (${(out.length / 1024).toFixed(1)} KB)`);
