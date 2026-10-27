// Renders the galleries of drawn device pictures shown in the README, one per brand, from the card's own
// drawing code: images/models-roborock.svg, images/models-xiaomi.svg, images/models-dreame.svg.
// Usage: node scripts/models.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { load } from "../test/load.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const { autoSvg } = load();

// [model id, label] per brand: a robot of each look (turret or not, dock or not, white or dark) and the wet-dry vacuums.
const GALLERIES = {
  roborock: [
    ["roborock.vacuum.a288", "Saros 20"],
    ["roborock.vacuum.a97", "S8 MaxV Ultra"],
    ["roborock.vacuum.a135", "Qrevo Curv"],
    ["roborock.vacuum.a38", "Q7 Max"],
    ["roborock.vacuum.a01", "E4"],
    ["roborock.wdv.a194", "F25 Ultra"],
    ["roborock.wetdryvac.a56", "Dyad Pro"],
  ],
  xiaomi: [
    ["rockrobo.vacuum.v1", "Mi Robot Vacuum"],
    ["roborock.vacuum.m1s", "Mi Robot Vacuum 1S"],
    ["mijia.vacuum.v2", "Essential G1"],
    ["dreame.vacuum.p2041o", "Vacuum-Mop 2 Pro+"],
    ["dreame.vacuum.p2114a", "X10+"],
    ["xiaomi.vacuum.c102cn", "Mijia Omni 2"],
  ],
  dreame: [
    ["dreame.vacuum.p2009", "D9"],
    ["dreame.vacuum.p2029", "L10 Pro"],
    ["dreame.vacuum.r2205", "D10 Plus"],
    ["dreame.vacuum.r2228o", "L10s Ultra"],
  ],
};

const CELL = 132;
const PIC = 90;
for (const [brand, models] of Object.entries(GALLERIES)) {
  const cells = models.map(([model, label], i) => {
    const kind = /\.(wdv|wetdryvac)\./.test(model) ? "wetdry" : "robot";
    // Nested pictures share one document: their ids (gradient "d") get a per-picture suffix.
    const svg = autoSvg({ kind, model, dock: {} })
      .replace(/id="(\w+)"/g, `id="$1${i}"`)
      .replace(/url\(#(\w+)\)/g, `url(#$1${i})`)
      .replace("<svg ", `<svg x="${i * CELL + (CELL - PIC) / 2}" y="0" width="${PIC}" height="${PIC}" `);
    return `${svg}<text x="${i * CELL + CELL / 2}" y="${PIC + 22}" text-anchor="middle">${label}</text>`;
  });
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${models.length * CELL} ${PIC + 30}"><style>text{font:12px -apple-system,Segoe UI,Roboto,sans-serif;fill:#8b949e}</style>${cells.join("")}</svg>\n`;
  writeFileSync(`${root}images/models-${brand}.svg`, out);
  console.log(`images/models-${brand}.svg`);
}
