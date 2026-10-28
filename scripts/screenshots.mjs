// Renders the cards with mock Roborock data and saves the README screenshots.
// Usage: npm run build && npm run screenshots
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { states, entities, devices, cleaning, returning, washing, drying, f25Cleaning, ecovacsCleaning, dysonCleaning, dysonReturning, maps } from "./mock-states.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const cardJs = readFileSync(`${root}dist/vacuum-card.js`, "utf8");

const THEMES = {
  light: {
    "--primary-background-color": "#e8eaed",
    "--secondary-background-color": "#ececec",
    "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121",
    "--secondary-text-color": "#727272",
    "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111",
    "--secondary-background-color": "#282828",
    "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1",
    "--secondary-text-color": "#9b9b9b",
    "--divider-color": "rgba(225,225,225,.12)",
  },
};

// Minimal stand-in for Home Assistant's <ha-card>.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});`;

const page_html = (theme, width) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { ${Object.entries(THEMES[theme]).map(([k, v]) => `${k}:${v};`).join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: ${width}px; }
</style></head><body><div id="root"></div></body></html>`;

// Opens a card on a fresh page (its script declares top-level names, which cannot be evaluated twice in one page)
// and mounts it with the mock hass; `overrides` patch the mock states for this shot only.
async function openCard(browser, { file, type, config, theme, width, overrides }) {
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2000 } });
  page.on("pageerror", (err) => console.error(`pageerror (${file}): ${err.message}`));
  await page.setContent(page_html(theme, width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs });
  await page.evaluate(
    ({ type, config, states, entities, devices, overrides, maps, theme }) => {
      for (const [id, o] of Object.entries(overrides || {})) states[id] = { ...states[id], ...o };
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      el.hass = {
        states, entities, devices, language: "en", locale: { language: "en" }, themes: { darkMode: theme === "dark" }, callService: () => {},
        callWS: async () => ({ response: maps }),
      };
      document.getElementById("root").appendChild(el);
    },
    { type, config, states, entities, devices, overrides, maps, theme }
  );
  return page;
}

const shots = [
  { file: "card", type: "vacuum-card", theme: "light", width: 460, config: {} },
  { file: "card-dark", type: "vacuum-card", theme: "dark", width: 460, config: { crop: { top: 10, bottom: 10, left: 10, right: 10 } }, overrides: cleaning },
  { file: "card-rooms", type: "vacuum-card", theme: "light", width: 460, config: { show_routines: false, show_dock: false, show_consumables: false, show_stats: false },
    clicks: ['[data-action="open_rooms"]', '[data-room="2"]', '[data-room="11"]', '[data-room="9"]'] },
  { file: "card-f25", type: "vacuum-card", theme: "light", width: 460, config: { device: "Roborock F25 Ultra" } },
  { file: "card-xiaomi", type: "vacuum-card", theme: "light", width: 460, config: { device: "Robot vacuum", show_map: "always", map_entity: "camera.dustbusters_map" } },
  { file: "mini-card", type: "vacuum-mini-card", theme: "light", width: 380, config: {} },
  { file: "mini-card-dark", type: "vacuum-mini-card", theme: "dark", width: 380, config: {}, overrides: cleaning },
  { file: "mini-card-f25", type: "vacuum-mini-card", theme: "light", width: 380, config: { device: "Roborock F25 Ultra" } },
  { file: "mini-card-xiaomi", type: "vacuum-mini-card", theme: "light", width: 380, config: { device: "Robot vacuum" } },
  { file: "card-dreame", type: "vacuum-card", theme: "dark", width: 460, config: { device: "Upstairs robot", show_map: "always", collapsed: ["stats"] } },
  { file: "mini-card-dreame", type: "vacuum-mini-card", theme: "dark", width: 380, config: { device: "Upstairs robot" } },
  { file: "mini-card-dreame-light", type: "vacuum-mini-card", theme: "light", width: 380, config: { device: "Upstairs robot" } },
  { file: "mini-card-xiaomi-dark", type: "vacuum-mini-card", theme: "dark", width: 380, config: { device: "Robot vacuum" } },
  { file: "card-ecovacs", type: "vacuum-card", theme: "light", width: 460, config: { device: "Studio robot", show_map: "always", collapsed: ["stats"] } },
  { file: "mini-card-ecovacs", type: "vacuum-mini-card", theme: "light", width: 380, config: { device: "Studio robot" } },
  { file: "mini-card-ecovacs-dark", type: "vacuum-mini-card", theme: "dark", width: 380, config: { device: "Studio robot" } },
  { file: "card-dyson", type: "vacuum-card", theme: "dark", width: 460, config: { device: "Toy room robot" } },
  { file: "mini-card-dyson", type: "vacuum-mini-card", theme: "dark", width: 380, config: { device: "Toy room robot" } },
  { file: "mini-card-dyson-light", type: "vacuum-mini-card", theme: "light", width: 380, config: { device: "Toy room robot" } },
  { file: "mini-card-zoom", type: "vacuum-mini-card", theme: "light", width: 460, config: {}, clicks: [".zoom"] },
  { file: "mini-card-zoom-dark", type: "vacuum-mini-card", theme: "dark", width: 460, config: {}, overrides: cleaning, clicks: [".zoom"] },
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
for (const s of shots) {
  const page = await openCard(browser, s);
  for (const sel of s.clicks || []) {
    // A mouse click (detail 1), not .click(): a keyboard-like click would move the focus and show its ring.
    await page.evaluate(
      (sel) =>
        document
          .querySelector("#root")
          .firstElementChild.shadowRoot.querySelector(sel)
          .dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 })),
      sel
    );
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(800);
  const box = await page.locator("#root").boundingBox();
  await page.screenshot({
    path: `${root}screenshots/${s.file}.png`,
    clip: { x: 0, y: 0, width: s.width + 32, height: Math.ceil(box.height) + 32 },
    animations: "disabled",
  });
  console.log(`screenshots/${s.file}.png`);
  await page.close();
}

// Records one animated state as a looping GIF (screenshots/<gif.file>.gif) — needs ffmpeg on PATH.
// Every animation is paused and stepped frame by frame, so the GIF is identical whatever the machine's speed.
async function makeGif(browser, gif, { fps = 20, seconds = 3 } = {}) {
  const page = await openCard(browser, gif);
  await page.waitForTimeout(300);
  const box = await page.locator("#root").boundingBox();
  const clip = { x: 0, y: 0, width: gif.width + 32, height: Math.ceil(box.height) + 32 };
  const dir = mkdtempSync(join(tmpdir(), "rr-frames-"));
  const frames = Math.round(fps * seconds);
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => {
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = t;
      }
    }, (i * 1000) / fps);
    await page.screenshot({ path: join(dir, `f${String(i).padStart(3, "0")}.png`), clip });
  }
  await page.close();
  const out = `${root}screenshots/${gif.file}.gif`;
  // Halve the retina capture and build a per-clip palette: the colours stay clean and the file stays small.
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(dir, "f%03d.png"),
    "-vf", `scale=${clip.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
    "-loop", "0", out,
  ]);
  rmSync(dir, { recursive: true });
  console.log(`screenshots/${gif.file}.gif`);
}

// One looping GIF per distinct animated state the card shows (each plays different keyframes):
//   cleaning     — robot out vacuuming and mopping (sway, spin, dust, wet, drop)
//   returning    — robot heading back to the dock (home)
//   mop-washing  — robot docked, washing its mop (bub)
//   mop-drying   — robot docked, drying its mop (heat)
//   f25-cleaning — F25 Ultra wet-dry vacuum mid-clean (tilt, roll)
//   ecovacs-cleaning — DEEBOT X1 Omni vacuuming and mopping (white robot out of its station)
//   dyson-cleaning / dyson-returning — Dyson 360 Vis Nav: tracks rolling and dust / sliding home
const gifs = [
  { file: "cleaning", type: "vacuum-card", theme: "light", width: 460, config: {}, overrides: cleaning },
  { file: "returning", type: "vacuum-card", theme: "light", width: 460, config: {}, overrides: returning },
  { file: "mop-washing", type: "vacuum-card", theme: "light", width: 460, config: {}, overrides: washing },
  { file: "mop-drying", type: "vacuum-card", theme: "light", width: 460, config: {}, overrides: drying },
  { file: "f25-cleaning", type: "vacuum-card", theme: "light", width: 460, config: { device: "Roborock F25 Ultra" }, overrides: f25Cleaning },
  { file: "ecovacs-cleaning", type: "vacuum-card", theme: "light", width: 460, config: { device: "Studio robot", show_map: "never" }, overrides: ecovacsCleaning },
  { file: "dyson-cleaning", type: "vacuum-card", theme: "dark", width: 460, config: { device: "Toy room robot" }, overrides: dysonCleaning },
  { file: "dyson-returning", type: "vacuum-card", theme: "dark", width: 460, config: { device: "Toy room robot" }, overrides: dysonReturning },
];
for (const g of gifs) await makeGif(browser, g);
await browser.close();
