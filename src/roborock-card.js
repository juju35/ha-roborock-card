/*
 * Roborock Card for Home Assistant
 * https://github.com/juju35/ha-roborock-card
 *
 * Lovelace cards for the Roborock integration (https://www.home-assistant.io/integrations/roborock/), also
 * for Roborock robots set up with Xiaomi Miio (https://www.home-assistant.io/integrations/xiaomi_miio/) or
 * Xiaomi Home (https://github.com/XiaoMi/ha_xiaomi_home).
 * Entities are resolved through the entity and device registries (platform, translation_key and
 * device), so they work whatever the Home Assistant language or entity ids.
 */

const VERSION = "__VERSION__";
const IMG_LOGO = "__IMG_LOGO__";
const IMG_LOGO_MIHOME = "__IMG_LOGO_MIHOME__";
const IMG_LOGO_XIAOMI = "__IMG_LOGO_XIAOMI__";
// Roborock pictures: drawn illustrations, picked from the device name (robot with or without LiDAR turret,
// with or without its dock, dark or white) or the wet-dry vacuum kind, and animated by what the device is doing
// (`activity`): vacuum, mop, vacmop (vacuum and mop), returning, washing (the mops), drying (the mops).
const ROBOT_COLORS = {
  dark: { top: "#3a3d42", side: "#1f2124", rim: "#55595f", lens: "#0e0f11" },
  white: { top: "#f4f4f2", side: "#cfd0cd", rim: "#e2e2df", lens: "#2a2c30" },
};
// Animations, shared by every picture. Pictures are <img>, so CSS animations run but no script does.
const ANIM_CSS = `
  .spin { transform-box: fill-box; transform-origin: center; animation: spin .5s linear infinite; }
  .sway { animation: sway 2.4s ease-in-out infinite alternate; }
  .home { animation: home 2.6s cubic-bezier(.3,.7,.4,1) infinite; }
  .tilt { transform-box: fill-box; transform-origin: 50% 100%; animation: tilt 1.6s ease-in-out infinite alternate; }
  .dust { animation: dust 1.2s ease-in infinite; } .drop { animation: drop 1.1s ease-in infinite; }
  .wet { animation: wet 1.6s ease-in-out infinite alternate; }
  .bub { transform-box: fill-box; transform-origin: center; animation: bub 1.8s ease-out infinite; }
  .heat { animation: heat 2.2s ease-out infinite; }
  .roll { animation: roll .4s linear infinite; }
  .d1 { animation-delay: -.3s; } .d2 { animation-delay: -.6s; } .d3 { animation-delay: -.9s; } .d4 { animation-delay: -1.2s; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes sway { from { transform: translateX(-6px); } to { transform: translateX(6px); } }
  @keyframes home { 0% { transform: translateX(-70px); opacity: 0; } 15% { opacity: 1; } 60%, 100% { transform: none; opacity: 1; } }
  @keyframes tilt { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }
  @keyframes dust { from { transform: translateY(14px); opacity: 0; } 30% { opacity: .9; } to { transform: translateY(-4px); opacity: 0; } }
  @keyframes drop { from { transform: translateY(-6px); opacity: 0; } 30% { opacity: 1; } to { transform: translateY(10px); opacity: 0; } }
  @keyframes wet { from { opacity: .25; } to { opacity: .6; } }
  @keyframes bub { from { transform: translateY(0) scale(.4); opacity: 0; } 25% { opacity: .9; } to { transform: translateY(-34px) scale(1.1); opacity: 0; } }
  @keyframes heat { from { transform: translateY(6px); opacity: 0; } 35% { opacity: .9; } to { transform: translateY(-30px); opacity: 0; } }
  @keyframes roll { to { stroke-dashoffset: -12; } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;
// Robot seen from the front, slightly from above: disc of radius r centred on (cx, cy).
const robotShape = (cx, cy, r, turret, col) => {
  const ry = r * 0.3, h = r * 0.2;
  let s = `<ellipse cx="${cx}" cy="${cy + h + ry * 0.35}" rx="${r * 0.98}" ry="${ry * 0.7}" opacity=".22"/>`;
  s += `<path d="M${cx - r} ${cy} v${h} a${r} ${ry} 0 0 0 ${2 * r} 0 v${-h} z" fill="${col.side}"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${ry}" fill="${col.top}"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.97}" ry="${ry * 0.93}" fill="none" stroke="${col.rim}" stroke-width="${r * 0.02}"/>`;
  s += `<rect x="${cx - r * 0.3}" y="${cy + h * 0.35}" width="${r * 0.6}" height="${h * 0.35}" rx="${h * 0.17}" fill="${col.lens}"/>`;
  if (turret) {
    const tr = r * 0.24, th = r * 0.17, ty = cy - ry * 0.25;
    s += `<path d="M${cx - tr} ${ty} v${-th} a${tr} ${tr * 0.3} 0 0 1 ${2 * tr} 0 v${th} a${tr} ${tr * 0.3} 0 0 1 ${-2 * tr} 0 z" fill="${col.side}"/>`;
    s += `<ellipse cx="${cx}" cy="${ty - th}" rx="${tr}" ry="${tr * 0.3}" fill="${col.top}"/>`;
    s += `<rect x="${cx - tr * 0.55}" y="${ty - th * 0.75}" width="${tr * 1.1}" height="${th * 0.4}" rx="${th * 0.2}" fill="${col.lens}"/>`;
  } else {
    s += `<circle cx="${cx + r * 0.55}" cy="${cy - ry * 0.25}" r="${r * 0.04}" fill="#e3212d"/>`;
  }
  return s;
};
const svgDoc = (w, h, body, defs = "", anim = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${anim ? `<style>${ANIM_CSS}</style>` : ""}${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>`;
// Side brush: three spokes turning, at (x, y).
const brush = (x, y, r) =>
  `<g class="spin"><circle cx="${x}" cy="${y}" r="${r}" fill="none"/>${[0, 120, 240]
    .map((a) => {
      const rad = (a * Math.PI) / 180;
      return `<line x1="${x}" y1="${y}" x2="${(x + r * Math.cos(rad)).toFixed(1)}" y2="${(y + r * 0.45 * Math.sin(rad)).toFixed(1)}" stroke="#8a8f96" stroke-width="1.6" stroke-linecap="round"/>`;
    })
    .join("")}</g>`;
// Rising bubbles (washing) or heat waves (drying) around (cx, y), spread over w.
const bubbles = (cx, y, w) =>
  [-0.4, -0.15, 0.1, 0.35, 0.45]
    .map((f, i) => `<circle class="bub d${i % 5}" cx="${cx + f * w}" cy="${y - (i % 2) * 6}" r="${3.5 + (i % 3) * 1.5}" fill="#9fd3ff" stroke="#3f8fd4" stroke-width=".8"/>`)
    .join("");
const heat = (cx, y, w) =>
  [-0.3, 0, 0.3]
    .map(
      (f, i) =>
        `<path class="heat d${i + 1}" d="M${cx + f * w} ${y} q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#ff9f43" stroke-width="2.2" stroke-linecap="round"/>`
    )
    .join("");
// Robot alone or in front of its dock, animated by `activity`.
const robotSvg = ({ turret = true, white = false, dock = true, activity = null } = {}) => {
  const col = ROBOT_COLORS[white ? "white" : "dark"];
  const cleaning = ["vacuum", "mop", "vacmop"].includes(activity);
  // Cleaning: the robot is out on the floor, drawn alone whatever its dock.
  if (!dock || cleaning) {
    const vac = activity === "vacuum" || activity === "vacmop";
    const mop = activity === "mop" || activity === "vacmop";
    let s = "";
    if (mop) s += `<ellipse class="wet" cx="80" cy="84" rx="78" ry="13" fill="#3f8fd4"/>`;
    let robot = robotShape(80, 50, 72, turret, col);
    if (vac) robot += brush(26, 75, 10) + brush(134, 75, 10);
    s += `<g class="${cleaning ? "sway" : ""}">${robot}</g>`;
    if (vac) s += [56, 72, 88, 104].map((x, i) => `<circle class="dust d${i + 1}" cx="${x}" cy="94" r="2.6" fill="#c9ccd0"/>`).join("");
    if (mop) s += [40, 66, 94, 120].map((x, i) => `<path class="drop d${i + 1}" d="M${x} 88 q-3 4 0 6 q3 -2 0 -6z" fill="#3f8fd4"/>`).join("");
    return svgDoc(160, 104, s, "", cleaning);
  }
  const [dTop, dBot, panel, seam] = white
    ? ["#fafaf8", "#d7d8d5", "#ecece9", "#c4c5c2"]
    : ["#b9bcc0", "#62666c", "#2b2e33", "#4a4e54"];
  const defs = `<linearGradient id="d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${dTop}"/><stop offset="1" stop-color="${dBot}"/></linearGradient>`;
  let s = `<ellipse cx="80" cy="152" rx="66" ry="6" opacity=".22"/>`;
  s += `<path d="M18 140 L30 126 H130 L142 140 Q142 146 136 146 H24 Q18 146 18 140 Z" fill="${white ? "#e6e6e3" : "#2b2e33"}"/>`;
  s += `<rect x="34" y="8" width="92" height="124" rx="10" fill="url(#d)"/>`;
  s += `<rect x="40" y="16" width="80" height="54" rx="6" fill="${panel}"/>`;
  s += `<line x1="80" y1="18" x2="80" y2="68" stroke="${seam}" stroke-width="1.5"/>`;
  s += `<rect x="40" y="76" width="80" height="4" rx="2" fill="${seam}"/>`;
  s += `<circle cx="112" cy="90" r="2" fill="${activity === "washing" ? "#2fa3ff" : activity === "drying" ? "#ff9f43" : "#43c463"}"/>`;
  s += `<g class="${activity === "returning" ? "home" : ""}">${robotShape(80, 122, 52, turret, col)}</g>`;
  if (activity === "washing") s += bubbles(80, 112, 100);
  if (activity === "drying") s += heat(80, 108, 100);
  return svgDoc(160, 160, s, defs, !!activity);
};
// Upright wet-dry vacuum: floor head, body with the two water tanks, handle. Cleaning: it rocks back and forth
// and its roller turns; washing / drying (self-cleaning on its base): bubbles / heat waves at the floor head.
const wetdrySvg = ({ white = true, activity = null } = {}) => {
  const [body, edge, accent] = white ? ["#f2f2f0", "#c9cac7", "#3a3d42"] : ["#4a4e54", "#26282c", "#9aa0a6"];
  const cleaning = ["vacuum", "mop", "vacmop"].includes(activity);
  let s = `<ellipse cx="50" cy="194" rx="40" ry="4" opacity=".22"/>`;
  let v = `<path d="M12 178 Q12 168 22 168 H78 Q88 168 88 178 V186 Q88 192 82 192 H18 Q12 192 12 186 Z" fill="${body}" stroke="${edge}" stroke-width="1.5"/>`;
  v += `<rect x="16" y="182" width="68" height="6" rx="3" fill="#3f8fd4" opacity=".7"/>`;
  if (cleaning) v += `<line class="roll" x1="18" y1="185" x2="82" y2="185" stroke="#d6ecff" stroke-width="2" stroke-dasharray="4 8"/>`;
  v += `<rect x="30" y="70" width="40" height="104" rx="14" fill="${body}" stroke="${edge}" stroke-width="1.5"/>`;
  v += `<rect x="35" y="80" width="30" height="34" rx="6" fill="#9fc6e6" opacity=".75"/>`;
  v += `<rect x="35" y="120" width="30" height="40" rx="6" fill="#8a8f96" opacity=".55"/>`;
  v += `<rect x="47" y="14" width="6" height="58" rx="3" fill="${accent}"/>`;
  v += `<path d="M38 6 Q50 -2 62 6 L60 22 Q50 18 40 22 Z" fill="${accent}"/>`;
  v += `<rect x="45" y="26" width="10" height="12" rx="2" fill="#2fa3ff" opacity=".85"/>`;
  s += cleaning ? `<g class="tilt">${v}</g>` : v;
  if (activity === "washing") s += bubbles(50, 176, 70);
  if (activity === "drying") s += heat(50, 168, 60);
  return svgDoc(100, 200, s, "", !!activity);
};
// Presets offered in the editor (`image` option); the keys of the former photos still work.
// `white`: color forced by the `color` option (true / false), undefined to keep the model's.
const IMAGES = {
  saros_20: (activity, white = false) => robotSvg({ turret: false, white, activity }),
  s8_maxv_ultra: (activity, white = false) => robotSvg({ white, activity }),
  qrevo: (activity, white = true) => robotSvg({ white, activity }),
  q7: (activity, white = true) => robotSvg({ white, dock: false, activity }),
  f25_ultra: (activity, white = true) => wetdrySvg({ white, activity }),
  dyad_pro: (activity, white = false) => wetdrySvg({ white, activity }),
};
// `color` option → forced color of the picture: true (white), false (dark), undefined (per model).
const colorOf = (color) => (color === "white" ? true : color === "dark" ? false : undefined);
const IMAGE_LABELS = { saros_20: "Saros 20", s8_maxv_ultra: "S8 MaxV Ultra", qrevo: "Qrevo", q7: "Q7", f25_ultra: "F25 Ultra", dyad_pro: "Dyad Pro" };
// Commercial names of the common Roborock models, by the model id the integrations report (Roborock, Xiaomi Miio
// and Xiaomi Home alike): the picture and the logo then follow the model even when the device was renamed
// (« DustBusters »). Sources: python-roborock and python-miio.
const MODEL_NAMES = {
  "rockrobo.vacuum.v1": "Mi Robot Vacuum",
  "roborock.vacuum.m1s": "Mi Robot Vacuum 1S",
  "roborock.vacuum.c1": "C1",
  "roborock.vacuum.e2": "E2",
  "roborock.vacuum.a01": "E4",
  "roborock.vacuum.s4": "S4",
  "roborock.vacuum.a19": "S4 Max",
  "roborock.vacuum.s5": "S5",
  "roborock.vacuum.s5e": "S5 Max",
  "roborock.vacuum.s6": "S6",
  "roborock.vacuum.t6": "T6",
  "roborock.vacuum.a08": "S6 Pure",
  "roborock.vacuum.a10": "S6 MaxV",
  "roborock.vacuum.a11": "T7",
  "roborock.vacuum.a14": "T7S",
  "roborock.vacuum.a23": "T7S Plus",
  "roborock.vacuum.a15": "S7",
  "roborock.vacuum.a27": "S7 MaxV",
  "roborock.vacuum.a62": "S7 Pro Ultra",
  "roborock.vacuum.a65": "S7 MaxV Ultra",
  "roborock.vacuum.a51": "S8",
  "roborock.vacuum.a70": "S8 Pro Ultra",
  "roborock.vacuum.a97": "S8 MaxV Ultra",
  "roborock.vacuum.a29": "G10",
  "roborock.vacuum.a30": "G10",
  "roborock.vacuum.a46": "G10S",
  "roborock.vacuum.a26": "G10S Pro",
  "roborock.vacuum.a34": "Q5",
  "roborock.vacuum.a72": "Q5 Pro",
  "roborock.vacuum.a40": "Q7",
  "roborock.vacuum.a38": "Q7 Max",
  "roborock.vacuum.a73": "Q8 Max",
  "roborock.vacuum.ss07": "Q10",
  "roborock.vacuum.a75": "Qrevo",
  "roborock.vacuum.a87": "Qrevo MaxV",
  "roborock.vacuum.a101": "Qrevo Pro",
  "roborock.vacuum.a104": "Qrevo S",
  "roborock.vacuum.a117": "Qrevo Master",
  "roborock.vacuum.a135": "Qrevo Curv",
  "roborock.vacuum.a143": "Saros 10R",
  "roborock.vacuum.a144": "Saros 10R",
  "roborock.vacuum.a147": "Saros 10",
  "roborock.vacuum.a288": "Saros 20",
  "roborock.wetdryvac.a56": "Dyad Pro",
  "roborock.wetdryvac.a83": "Dyad Pro Combo",
  "roborock.wetdryvac.a107": "Dyad Air",
  "roborock.wdv.a194": "F25 Ultra",
};
// Brand of a model id, for the logo: Xiaomi for the Mi / Xiaomi robots (built by Roborock for the first ones),
// Roborock for the other Roborock models, null when unknown (the logo of the integration is shown).
const XIAOMI_MODELS = new Set(["rockrobo.vacuum.v1", "roborock.vacuum.m1s"]);
const brandOf = (model) => {
  const m = String(model || "").toLowerCase();
  if (XIAOMI_MODELS.has(m) || /^(xiaomi|mijia|ijai)\./.test(m)) return "xiaomi";
  return /^(roborock|rockrobo)\./.test(m) ? "roborock" : null;
};
// Name the picture is drawn from: the device name and the commercial name of its model.
const modelName = (dev) => [dev.rawName || dev.name, MODEL_NAMES[String(dev.model || "").toLowerCase()]].filter(Boolean).join(" ");
// Automatic picture: Saros robots and the E / C1 series have no LiDAR turret, the Q series (Q5…Q10, Qrevo) and the
// Mi / Xiaomi robots are white, the dock is drawn when the integration reports one (or the model name implies it:
// Ultra, Plus, Saros, Qrevo, G10); Dyad wet-dry vacuums are dark.
const autoSvg = (dev, activity = null, white = undefined) => {
  const name = modelName(dev);
  if (dev.kind === "wetdry") return wetdrySvg({ white: white ?? !/dyad/i.test(name), activity });
  if (dev.kind !== "robot") return null;
  return robotSvg({
    turret: !/saros|\b(e\d|c1)\b/i.test(name),
    white: white ?? (/\bq\s?(revo|\d)|\bmi robot/i.test(name) || brandOf(dev.model) === "xiaomi"),
    dock: Object.keys(dev.dock || {}).length > 0 || /ultra|plus|saros|q\s?revo|\bg\d/i.test(name),
    activity,
  });
};
// What the device is doing, for the picture animation, from its status, cleaning mode and the dock drying
// flag (null: at rest).
const activityOf = (status, mode, drying) => {
  const s = String(status || "").toLowerCase();
  if (/dry/.test(s)) return "drying";
  if (/going_to_wash|return|docking/.test(s)) return "returning";
  if (/wash|self_clean/.test(s)) return "washing";
  if (/mopping/.test(s)) return "mop";
  // The dock drying flag only counts while the robot is not out cleaning.
  if (!/clean|sweep|dusting|mapping|target|working/.test(s)) return drying ? "drying" : null;
  const m = String(mode || "").toLowerCase();
  if (/vac|sweep/.test(m) && /mop/.test(m)) return "vacmop";
  return /mop/.test(m) ? "mop" : "vacuum";
};
const svgUri = (svg) => svg && `data:image/svg+xml,${encodeURIComponent(svg)}`;
// Integrations the cards read, with the logo shown in the header.
const BRANDS = {
  roborock: { logo: IMG_LOGO, name: "Roborock", site: "https://www.roborock.com" },
  xiaomi_miio: { logo: IMG_LOGO_MIHOME, name: "Xiaomi Mi Home", site: "https://home.mi.com" },
  xiaomi_home: { logo: IMG_LOGO_XIAOMI, name: "Xiaomi", site: "https://www.mi.com" },
};
// Xiaomi Miio translation_key → the Roborock integration's, so the cards read both the same way.
// Their last clean "duration" / "area" are left aside: "clean_time" / "clean_area" hold the current
// clean while the robot works and the last one afterwards, like the Roborock cleaning_time / cleaning_area.
const MIIO_KEYS = {
  clean_time: "cleaning_time",
  clean_area: "cleaning_area",
  total_duration: "total_cleaning_time",
  total_area: "total_cleaning_area",
  count: "total_cleaning_count",
  main_brush_left: "main_brush_time_left",
  side_brush_left: "side_brush_time_left",
  filter_left: "filter_time_left",
  sensor_dirty_left: "sensor_time_left",
  reset_vacuum_main_brush: "reset_main_brush_consumable",
  reset_vacuum_side_brush: "reset_side_brush_consumable",
  reset_vacuum_filter: "reset_air_filter_consumable",
  reset_vacuum_sensor_dirty: "reset_sensor_consumable",
};
const PENDING_MS = 45000;
const DEFAULT_COLLAPSED = ["stats", "dock"];

const ICONS = {
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  home: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
  locate:
    "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
  room: "M12,3L2,12H5V20H19V12H22L12,3M12,8.75A2.25,2.25 0 0,1 14.25,11A2.25,2.25 0 0,1 12,13.25A2.25,2.25 0 0,1 9.75,11A2.25,2.25 0 0,1 12,8.75M12,15C13.5,15 16.5,15.75 16.5,17.25V18H7.5V17.25C7.5,15.75 10.5,15 12,15Z",
  battery: "M16.67,4H15V2H9V4H7.33A1.33,1.33 0 0,0 6,5.33V20.67C6,21.4 6.6,22 7.33,22H16.67A1.33,1.33 0 0,0 18,20.67V5.33C18,4.6 17.4,4 16.67,4Z",
  bolt: "M11,15H6L13,1V9H18L11,23V15Z",
  routine: "M10,16.5V7.5L16,12M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  water: "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z",
  water_off:
    "M17.12,17.12L18.5,18.5L19.77,19.77L18.5,21.03L16.5,19.03C15.32,19.67 13.96,20 12.5,20A6.5,6.5 0 0,1 6,13.5C6,12.35 6.4,10.96 7.04,9.54L2.73,5.23L4,3.96L17.12,17.12M18,14C18,14.57 17.92,15.13 17.78,15.65L8.35,6.22C10.26,3.95 12,2 12,2C12,2 18,8.5 18,14Z",
  fluid: "M12,3.77L11.25,4.61C11.25,4.61 9.97,6.06 8.68,7.94C7.39,9.82 6,12.07 6,14.23A6,6 0 0,0 12,20.23A6,6 0 0,0 18,14.23C18,12.07 16.61,9.82 15.32,7.94C14.03,6.06 12.75,4.61 12.75,4.61L12,3.77M12,6.9C12.44,7.42 12.84,7.85 13.68,9.07C14.89,10.83 16,13.07 16,14.23C16,16.45 14.22,18.23 12,18.23C9.78,18.23 8,16.45 8,14.23C8,13.07 9.11,10.83 10.32,9.07C11.16,7.85 11.56,7.42 12,6.9Z",
  dock: "M3,13H21V21H3V13M5,15V19H19V15H5M7,3H17A2,2 0 0,1 19,5V11H5V5A2,2 0 0,1 7,3M7,5V9H17V5H7Z",
  bin: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
  fan: "M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z",
  mode: "M3,3H11V11H3V3M13,3H21V11H13V3M3,13H11V21H3V13M18,13H16V16H13V18H16V21H18V18H21V16H18V13Z",
  route: "M11,10H5L3,8L5,6H11V3L12,2L13,3V6H19L21,8L19,10H13V20A2,2 0 0,1 15,22H9A2,2 0 0,1 11,20V10Z",
  brush:
    "M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z",
  filter:
    "M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3H19C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z",
  sensor:
    "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z",
  area: "M3,3H21V21H3V3M5,5V19H19V5H5M7,7H11V9H9V11H7V7M17,17H13V15H15V13H17V17Z",
  clock:
    "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
  count:
    "M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3",
  stats: "M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z",
  map: "M15,19L9,16.89V5L15,7.11M20.5,3C20.44,3 20.39,3 20.34,3L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21C3.55,21 3.61,21 3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3Z",
  alert: "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  // mdi:arrow-expand and mdi:arrow-collapse (mini card detail button)
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  reset: "M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z",
};

const STRINGS = {
  en: {
    start: "Start",
    pause: "Pause",
    stop: "Stop",
    dock: "Dock",
    locate: "Locate",
    battery: "Battery",
    charging: "Charging",
    room: "Room",
    progress: "Progress",
    routines: "Routines",
    run_routine: "Run routine {name}?",
    empty_bin: "Empty bin",
    running: "Running",
    wash_mop: "Wash mop",
    dry_mop: "Dry mop",
    start_action: "Start: {name}",
    stop_action: "Stop: {name}",
    choose_rooms: "Rooms to clean",
    clean_rooms: "Clean ({n})",
    whole_home: "Whole home",
    select_all: "All",
    cancel: "Cancel",
    rooms_loading: "Loading rooms…",
    rooms_error: "Could not get the rooms from the robot.",
    room_selection: "Start button opens the room selector",
    reset: "Reset",
    confirm_reset: "Reset {name} counter? Do it after replacing or cleaning the part.",
    station: "Dock",
    consumables: "Maintenance",
    statistics: "Statistics",
    map: "Map",
    last_clean: "Last clean",
    last_clean_ago: "Last clean {when}",
    total_count: "Cleanings",
    total_area: "Total area",
    total_time: "Total time",
    main_brush: "Main brush",
    side_brush: "Side brush",
    filter: "Filter",
    sensors: "Sensors",
    mop: "Mop",
    roller: "Roller",
    strainer: "Dock strainer",
    cleaning_brush: "Dock brush",
    dock_state: "Dock",
    clean_water: "Clean water",
    dirty_water: "Dirty water",
    cleaning_fluid: "Detergent",
    water_shortage: "Water tank empty",
    drying: "Drying",
    dust_mode: "Auto-empty",
    ok: "OK",
    empty: "Empty",
    full: "Full",
    no_device: "No Roborock device found. Is the Roborock, Xiaomi Miio or Xiaomi Home integration installed?",
    unknown_device: "Roborock device not found",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    // Editor
    device: "Roborock device",
    title: "Title (optional, defaults to the device name)",
    image: "Device picture",
    image_auto: "Automatic (per model)",
    image_none: "None",
    color: "Device color",
    color_auto: "Automatic (per model)",
    color_white: "White",
    color_dark: "Black",
    show_logo: "Show the brand logo",
    show_controls: "Show control buttons",
    show_modes: "Show cleaning settings",
    show_routines: "Show routines",
    show_dock: "Show dock",
    show_consumables: "Show maintenance",
    show_stats: "Show statistics",
    show_map: "Show map",
    collapsed: "Sections folded by default",
    map_entity: "Map entity (optional, e.g. Xiaomi Cloud Map Extractor camera)",
    crop: "Map crop (pixels)",
    map_size: "Map image size: {w} × {h} px. Values are in pixels of this image.",
    top: "Top",
    bottom: "Bottom",
    left: "Left",
    right: "Right",
    map_never: "Never",
    map_cleaning: "While cleaning",
    map_always: "Always",
    language: "Language",
    lang_auto: "Automatic",
    zoom: "Detail button",
    zoom_helper: "Button at the top right that switches the mini card to the full card and back",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    // States and values
    s_charging: "Charging",
    s_charging_complete: "Charged",
    s_docked: "Docked",
    s_cleaning: "Cleaning",
    s_spot_cleaning: "Spot cleaning",
    s_zoned_cleaning: "Zone cleaning",
    s_segment_cleaning: "Room cleaning",
    s_returning: "Returning to dock",
    s_returning_home: "Returning to dock",
    s_docking: "Docking",
    s_idle: "Idle",
    s_paused: "Paused",
    s_error: "Error",
    s_sleeping: "Sleeping",
    s_mapping: "Mapping",
    s_emptying_the_bin: "Emptying the bin",
    s_washing_the_mop: "Washing the mop",
    s_going_to_wash_the_mop: "Going to wash the mop",
    s_going_to_target: "Going to target",
    s_mopping: "Mopping",
    s_ready: "Ready",
    s_washing: "Washing",
    s_drying: "Drying",
    s_device_offline: "Offline",
    s_unavailable: "Unavailable",
    s_unknown: "Unknown",
    v_vacuum: "Vacuum",
    v_vac_and_mop: "Vacuum & mop",
    v_mop: "Mop",
    v_quiet: "Quiet",
    v_balanced: "Balanced",
    v_turbo: "Turbo",
    v_max: "Max",
    v_max_plus: "Max+",
    v_off: "Off",
    v_smart_mode: "SmartPlan",
    v_custom: "Custom",
    v_gentle: "Gentle",
    v_slight: "Slight",
    v_low: "Low",
    v_mild: "Mild",
    v_medium: "Medium",
    v_moderate: "Moderate",
    v_high: "High",
    v_intense: "Intense",
    v_extreme: "Extreme",
    v_standard: "Standard",
    v_deep: "Deep",
    v_deep_plus: "Deep+",
    v_fast: "Fast",
    v_smart: "Smart",
    v_light: "Light",
    e_water_empty: "Clean water tank empty",
    e_waste_water_tank_full: "Dirty water tank full",
    e_no_dustbin: "Dust bag missing",
    e_duct_blockage: "Duct blocked",
    e_cleaning_tank_full_or_blocked: "Cleaning tank full or blocked",
    e_dirty_tank_latch_open: "Dirty water tank latch open",
  },
  fr: {
    start: "Nettoyer",
    pause: "Pause",
    stop: "Arrêter",
    dock: "Base",
    locate: "Localiser",
    battery: "Batterie",
    charging: "En charge",
    room: "Pièce",
    progress: "Progression",
    routines: "Routines",
    run_routine: "Lancer la routine {name} ?",
    empty_bin: "Vidage",
    running: "En cours",
    wash_mop: "Lavage serpillière",
    dry_mop: "Séchage",
    start_action: "Lancer : {name}",
    stop_action: "Arrêter : {name}",
    choose_rooms: "Pièces à nettoyer",
    clean_rooms: "Nettoyer ({n})",
    whole_home: "Toute la maison",
    select_all: "Toutes",
    cancel: "Annuler",
    rooms_loading: "Chargement des pièces…",
    rooms_error: "Impossible de récupérer les pièces du robot.",
    room_selection: "Le bouton Nettoyer ouvre le choix des pièces",
    reset: "Réinitialiser",
    confirm_reset: "Réinitialiser le compteur {name} ? À faire après avoir remplacé ou nettoyé la pièce.",
    station: "Station",
    consumables: "Entretien",
    statistics: "Statistiques",
    map: "Carte",
    last_clean: "Dernier nettoyage",
    last_clean_ago: "Dernier nettoyage {when}",
    total_count: "Nettoyages",
    total_area: "Surface totale",
    total_time: "Durée totale",
    main_brush: "Brosse principale",
    side_brush: "Brosse latérale",
    filter: "Filtre",
    sensors: "Capteurs",
    mop: "Serpillière",
    roller: "Rouleau",
    strainer: "Crépine de la station",
    cleaning_brush: "Brosse de la station",
    dock_state: "Station",
    clean_water: "Eau propre",
    dirty_water: "Eau sale",
    cleaning_fluid: "Détergent",
    water_shortage: "Réservoir d'eau vide",
    drying: "Séchage",
    dust_mode: "Vidage auto",
    ok: "OK",
    empty: "Vide",
    full: "Plein",
    no_device: "Aucun appareil Roborock trouvé. L'intégration Roborock, Xiaomi Miio ou Xiaomi Home est-elle installée ?",
    unknown_device: "Appareil Roborock introuvable",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    device: "Appareil Roborock",
    title: "Titre (facultatif, nom de l'appareil par défaut)",
    image: "Image de l'appareil",
    image_auto: "Automatique (selon le modèle)",
    image_none: "Aucune",
    color: "Couleur de l'appareil",
    color_auto: "Automatique (selon le modèle)",
    color_white: "Blanc",
    color_dark: "Noir",
    show_logo: "Afficher le logo de la marque",
    show_controls: "Afficher les boutons de commande",
    show_modes: "Afficher les réglages de nettoyage",
    show_routines: "Afficher les routines",
    show_dock: "Afficher la station",
    show_consumables: "Afficher l'entretien",
    show_stats: "Afficher les statistiques",
    show_map: "Afficher la carte",
    collapsed: "Sections repliées par défaut",
    map_entity: "Entité de la carte (facultatif, ex. caméra Xiaomi Cloud Map Extractor)",
    crop: "Recadrage de la carte (pixels)",
    map_size: "Taille de l'image de la carte : {w} × {h} px. Les valeurs sont en pixels de cette image.",
    top: "Haut",
    bottom: "Bas",
    left: "Gauche",
    right: "Droite",
    map_never: "Jamais",
    map_cleaning: "Pendant le nettoyage",
    map_always: "Toujours",
    language: "Langue",
    lang_auto: "Automatique",
    zoom: "Bouton de détail",
    zoom_helper: "Bouton en haut à droite qui passe la mini-carte en carte complète et inversement",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    s_charging: "En charge",
    s_charging_complete: "Chargé",
    s_docked: "Sur la base",
    s_cleaning: "Nettoyage",
    s_spot_cleaning: "Nettoyage localisé",
    s_zoned_cleaning: "Nettoyage de zone",
    s_segment_cleaning: "Nettoyage de pièces",
    s_returning: "Retour à la base",
    s_returning_home: "Retour à la base",
    s_docking: "Retour à la base",
    s_idle: "Inactif",
    s_paused: "En pause",
    s_error: "Erreur",
    s_sleeping: "En veille",
    s_mapping: "Cartographie",
    s_emptying_the_bin: "Vidage du bac",
    s_washing_the_mop: "Lavage de la serpillière",
    s_going_to_wash_the_mop: "Va laver la serpillière",
    s_going_to_target: "Déplacement",
    s_mopping: "Lavage",
    s_ready: "Prêt",
    s_washing: "Lavage",
    s_drying: "Séchage",
    s_device_offline: "Hors ligne",
    s_unavailable: "Indisponible",
    s_unknown: "Inconnu",
    v_vacuum: "Aspiration",
    v_vac_and_mop: "Aspiration et lavage",
    v_mop: "Lavage",
    v_quiet: "Silencieux",
    v_balanced: "Équilibré",
    v_turbo: "Turbo",
    v_max: "Max",
    v_max_plus: "Max+",
    v_off: "Désactivé",
    v_smart_mode: "SmartPlan",
    v_custom: "Personnalisé",
    v_gentle: "Doux",
    v_slight: "Très faible",
    v_low: "Faible",
    v_mild: "Léger",
    v_medium: "Moyen",
    v_moderate: "Modéré",
    v_high: "Élevé",
    v_intense: "Intense",
    v_extreme: "Extrême",
    v_standard: "Standard",
    v_deep: "Approfondi",
    v_deep_plus: "Approfondi+",
    v_fast: "Rapide",
    v_smart: "Intelligent",
    v_light: "Léger",
    e_water_empty: "Réservoir d'eau propre vide",
    e_waste_water_tank_full: "Réservoir d'eau sale plein",
    e_no_dustbin: "Sac à poussière absent",
    e_duct_blockage: "Conduit obstrué",
    e_cleaning_tank_full_or_blocked: "Bac de lavage plein ou obstrué",
    e_dirty_tank_latch_open: "Loquet du réservoir d'eau sale ouvert",
  },
};

// Consumables: [translation_key, label, icon, lifetime in hours for the robot ("pct" when the sensor is a percentage),
//               translation_key of the integration's reset button]
const CONSUMABLES = [
  ["main_brush_time_left", "main_brush", ICONS.brush, 300, "reset_main_brush_consumable"],
  ["side_brush_time_left", "side_brush", ICONS.brush, 200, "reset_side_brush_consumable"],
  ["filter_time_left", "filter", ICONS.filter, 150, "reset_air_filter_consumable"],
  ["sensor_time_left", "sensors", ICONS.sensor, 30, "reset_sensor_consumable"],
  ["mop_life_time_left", "mop", ICONS.water, null],
  ["brush_remaining", "roller", ICONS.brush, null],
  ["main_brush_life", "main_brush", ICONS.brush, "pct"],
  ["side_brush_life", "side_brush", ICONS.brush, "pct"],
  ["filter_life", "filter", ICONS.filter, "pct"],
  ["sensor_life", "sensors", ICONS.sensor, "pct"],
  ["strainer_time_left", "strainer", ICONS.filter, null, "reset_dock_strainer_consumable"],
  ["cleaning_brush_time_left", "cleaning_brush", ICONS.brush, null, "reset_dock_cleaning_brush_consumable"],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = (config?.language) || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

const valid = (s) => s && !["unknown", "unavailable", ""].includes(s.state);

const pretty = (v) => {
  const s = String(v ?? "").replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Duration sensor → hours, whatever its unit.
const hours = (s) => {
  const v = num(s);
  if (v === null) return null;
  const u = s.attributes?.unit_of_measurement;
  return u === "min" ? v / 60 : u === "s" ? v / 3600 : u === "d" ? v * 24 : v;
};

// Rounded to the minute first, so that 1.995 h reads "2 h" (not "1 h 60") and 0.999 h "1 h" (not "60 min").
const fmtHours = (h) => {
  if (h === null || h === undefined) return "—";
  if (h <= 0) return "0 h";
  const total = Math.round(h * 60);
  if (total < 60) return `${Math.max(1, total)} min`;
  if (total < 600) {
    const m = total % 60;
    const H = Math.floor(total / 60);
    return m ? `${H} h ${String(m).padStart(2, "0")}` : `${H} h`;
  }
  return `${Math.round(h)} h`;
};

const fmtNum = (v, digits = 0, locale) => (v === null ? "—" : Number(v).toLocaleString(locale, { maximumFractionDigits: digits }));

// One formatter per language, built on first use.
const RTF = {};
const ago = (hass, config, iso) => {
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return null;
  const diff = (d - Date.now()) / 1000;
  const l = lang(hass, config);
  const rtf = (RTF[l] ??= new Intl.RelativeTimeFormat(l, { numeric: "auto" }));
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
};

// Robot / device status → color class.
const statusClass = (state) => {
  const s = String(state || "").toLowerCase();
  if (/error|problem|offline|locked|fail|unavailable/.test(s)) return "crit";
  if (/paused|waiting|updating|starting|unknown/.test(s)) return "warn";
  if (/clean|mop|sweep|washing|mapping|target|return|docking|emptying|drying|dusting|patrol|ventilating/.test(s)) return "active";
  if (/charg|docked|ready/.test(s)) return "ok";
  return "idle";
};

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

// ---------------------------------------------------------------------------
// Registry-based resolution
// ---------------------------------------------------------------------------

const _cache = new WeakMap();

/**
 * Build the Roborock model from hass.entities / hass.devices:
 * { devices: [{ id, name, kind, entities, extra: { sensor: [...], button: [...], image: [...] } }] }
 * Entities are keyed by translation_key ("_<domain>" when they have none). Dock entities live on a
 * separate "<name> Dock" device and are merged into their robot under the "dock" map.
 */
const resolve = (hass) => {
  if (!hass.entities || !hass.devices) return null;
  const cached = _cache.get(hass.entities);
  if (cached && cached.devices === hass.devices) return cached.model;

  const byDevice = new Map();
  for (const e of Object.values(hass.entities)) {
    if (!(e.platform in BRANDS) || !e.device_id || e.hidden) continue;
    const domain = e.entity_id.split(".")[0];
    const item = byDevice.get(e.device_id) || { platform: e.platform, entities: {}, extra: {} };
    const key = e.platform === "xiaomi_miio" ? MIIO_KEYS[e.translation_key] || e.translation_key : e.translation_key;
    if (key && key !== "map") {
      if (!(key in item.entities)) item.entities[key] = e.entity_id;
    } else {
      (item.extra[domain] = item.extra[domain] || []).push(e.entity_id);
      if (!(`_${domain}` in item.entities)) item.entities[`_${domain}`] = e.entity_id;
    }
    byDevice.set(e.device_id, item);
  }

  const devName = (d) => d.name_by_user || d.name || "";
  const isDock = (d) => /\sDock$/.test(d.model || "") || (d.identifiers || []).some((i) => /_dock$/.test(String(i[1])));
  const devices = [];
  const docks = [];
  for (const [id, item] of byDevice) {
    const d = hass.devices[id];
    if (!d) continue;
    const vacuum = item.entities.roborock || item.entities._vacuum;
    // The Xiaomi integrations cover every Xiaomi device (purifiers, lamps…): only their vacuums are kept.
    if (item.platform !== "roborock" && !vacuum) continue;
    if (item.platform === "roborock" && isDock(d)) docks.push({ d, item });
    else {
      const kind = vacuum?.startsWith("vacuum.") ? "robot" : /\.(wdv|wetdryvac)\./.test(d.model || "") ? "wetdry" : "other";
      devices.push({
        id,
        name: devName(d),
        rawName: d.name,
        model: d.model,
        platform: item.platform,
        kind,
        vacuum,
        entities: item.entities,
        extra: item.extra,
        dock: {},
      });
    }
  }
  for (const { d, item } of docks) {
    const ids = (d.identifiers || []).map((i) => String(i[1]).replace(/_dock$/, ""));
    const owner =
      devices.find((r) => (hass.devices[r.id].identifiers || []).some((i) => ids.includes(String(i[1])))) ||
      devices.find((r) => d.name === `${r.rawName} Dock`) ||
      devices.find((r) => d.model === `${r.model} Dock`);
    if (owner) owner.dock = item.entities;
  }
  const model = { devices: devices.sort((a, b) => a.name.localeCompare(b.name)) };
  _cache.set(hass.entities, { devices: hass.devices, model });
  return model;
};

// Map pictures of a device: the integration's map images, or the camera / image entity set with map_entity
// (Xiaomi Cloud Map Extractor, Valetudo…), which belongs to no Roborock device.
const mapIds = (dev, config) => (config?.map_entity ? [config.map_entity] : dev.extra.image || []);

const listDevices = (hass) => {
  const m = hass && resolve(hass);
  return m ? m.devices.map((d) => ({ value: d.id, label: d.name })) : [];
};

const findDevice = (hass, config) => {
  const m = resolve(hass);
  if (!m) return { error: "no_registry" };
  if (!m.devices.length) return { error: "no_device" };
  if (!config.device) return { dev: m.devices.find((d) => d.kind === "robot") || m.devices[0] };
  const dev = m.devices.find((d) => d.id === config.device || d.name === config.device);
  return dev ? { dev } : { error: "unknown_device" };
};

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --rr-red: #ea0029; --rr-ok: var(--success-color, #43a047); --rr-warn: var(--warning-color, #ffa600);
          --rr-crit: var(--error-color, #db4437); --rr-idle: var(--disabled-text-color, #9e9e9e); --rr-active: var(--info-color, #039be5); }
  ha-card { overflow: hidden; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  .ok { --c: var(--rr-ok); } .warn { --c: var(--rr-warn); } .crit { --c: var(--rr-crit); } .idle { --c: var(--rr-idle); } .active { --c: var(--rr-active); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--rr-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--rr-ok)) 15%, transparent); color: var(--c, var(--rr-ok)); flex: none; }
  .bar { height: 4px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--rr-ok)); transition: width .6s ease; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .logo { width: 40px; height: 40px; object-fit: contain; flex: none; }
  a.logo-link { display: flex; flex: none; }
  .titles { flex: 1; min-width: 0; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: var(--rr-warn); }
  .picture { flex: none; display: flex; align-items: center; justify-content: center; }
  .picture img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .alert-line { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--c, var(--rr-crit)); }
  .alert-line .icon { width: 16px; height: 16px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn:hover { background: color-mix(in srgb, var(--rr-red) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn.primary { background: color-mix(in srgb, var(--rr-red) 16%, transparent); color: var(--rr-red); }
  .btn.primary:hover { background: color-mix(in srgb, var(--rr-red) 24%, transparent); }
  .btn .icon { width: 18px; height: 18px; }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; }
  .btn.disabled { opacity: .45; cursor: default; }
  .rooms { display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: 12px;
           border: 1px solid var(--divider-color, rgba(127,127,127,.25)); }
  .rooms-title { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; }
  .rooms-title .icon { width: 18px; height: 18px; color: var(--rr-red); }
  .rooms-msg { font-size: 13px; color: var(--secondary-text-color); }
  .room-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .room { font: inherit; font-size: 13px; padding: 6px 12px; border-radius: 16px; cursor: pointer; color: var(--primary-text-color);
          background: var(--secondary-background-color, rgba(127,127,127,.12)); border: 1px solid transparent; }
  .room.on { background: color-mix(in srgb, var(--rr-red) 16%, transparent); color: var(--rr-red); font-weight: 500; }
  .room.on:hover { background: color-mix(in srgb, var(--rr-red) 24%, transparent); }
  .room.all { color: var(--secondary-text-color); }
  .room.all.on { color: var(--rr-red); }
  .rooms-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--rr-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--rr-red)); outline-offset: 1px; }
`;

// In-card confirmation popup, as in ha-system-monitor-card and ha-iptv: a backdrop over the card with a
// small dialog at the top of the card, so that it stays in view when the card is long.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 160px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;

// Element names of Home Assistant dialogs (more-info opened from the card, among others).
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);

// True for a click outside `card` that is not in a dialog opened from it (more-info, say).
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// After the confirmation popup closes, clicks on the card are ignored for this long: the second click of a double
// click on OK would otherwise land on what lies under the button (the battery, an action button).
const CONFIRM_GUARD_MS = 400;

// Inlined pictures (data: URIs of the logo and the robots, tens of KB) are written as <img data-img="id"> and get
// their src once, then the same node is moved into every later render: the HTML stays small and the picture is not
// decoded again on each update.
const DATA_IMGS = [];
const imgTag = (src, attrs) => {
  if (!String(src).startsWith("data:")) return `<img src="${esc(src)}" ${attrs}>`;
  let id = DATA_IMGS.indexOf(src);
  if (id < 0) id = DATA_IMGS.push(src) - 1;
  return `<img data-img="${id}" ${attrs}>`;
};

class RoborockBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Escape closes the confirmation popup (as Cancel). Listened on the window while the popup is open: a re-render
    // or a click on its text takes the focus out of the card.
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._confirm) return;
      ev.stopPropagation();
      this._closeConfirm();
    };
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only
  // rebuilt when something it shows changed (see _deps).
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  // What a render reads from hass: the registries, the language, the state objects of the device's
  // entities (HA replaces a state object whenever its state or attributes change) and the relative
  // "last clean" time, which moves on its own. null (no device found): always render.
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const { dev } = findDevice(h, this._config);
    if (!dev) return null;
    const ids = [dev.vacuum, ...Object.values(dev.entities), ...Object.values(dev.dock), ...Object.values(dev.extra).flat()];
    return [h.entities, h.devices, h.language, h.locale, h.localize, h.formatEntityState, this._lastClean(dev), ...ids.map((id) => h.states[id])];
  }

  get hass() {
    return this._hass;
  }

  // A click elsewhere on the page folds the sections back to their defaults (as in ha-carburants-france).
  // A click, not a pointerdown: folding on press would shift the layout under the pointer before the click.
  connectedCallback() {
    // Clicks inside a dialog (the more-info opened from the card) leave the card as it is.
    this._onOutside ??= (ev) => {
      if ((!this._toggled?.size && !this._confirm) || !isOutside(this, ev)) return;
      this._toggled = new Set();
      if (this._confirm) this._closeConfirm();
      else this._update();
    };
    document.addEventListener("click", this._onOutside, true);
    // Reattached with the popup still open (view switch, editor): Escape keeps closing it.
    if (this._confirm) window.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onOutside, true);
    window.removeEventListener("keydown", this._onKey);
    clearTimeout(this._pendingTimer);
    this._closeZoom?.();
  }

  // Service call whose failure is already reported by Home Assistant (toast): the rejection is handled here so
  // that it does not end up as "Uncaught (in promise)". `onError` undoes what the card showed meanwhile.
  _call(domain, service, data, onError) {
    return Promise.resolve(this._hass.callService(domain, service, data)).catch(() => onError?.());
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._html = "";
    this._lastDeps = null;
    this._update();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return this._config.language || this._hass.locale?.language || this._hass.language;
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  _update() {
    if (!this._hass || !this._config) return;
    let html = this._render();
    if (this._confirm) {
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    }
    if (html !== this._html) {
      // The popup keeps its focus across the rewrite (OK, or Cancel when the user moved to it).
      const focused = this._confirm && this.shadowRoot.activeElement?.dataset?.action;
      this._html = html;
      this.shadowRoot.innerHTML = html;
      this._placeImages();
      if (this._confirm) {
        const sel = focused === "confirm_cancel" ? '[data-action="confirm_cancel"]' : ".modal .primary";
        // preventScroll: an update while the popup is open must not bring a scrolled page back to the card.
        this.shadowRoot.querySelector(sel)?.focus({ preventScroll: true });
      }
      // Map size for the crop: read it from the image itself, already loaded (cache) or once loaded.
      for (const img of this.shadowRoot.querySelectorAll("img[data-map]")) {
        if (img.complete && img.naturalWidth) this._onLoad({ target: img });
        else img.addEventListener("load", (ev) => this._onLoad(ev), { once: true });
      }
    }
  }

  // Moves the inlined pictures kept from the previous render into the new one, or gives them their src once.
  _placeImages() {
    const kept = this._imgNodes || new Map();
    this._imgNodes = new Map();
    for (const img of this.shadowRoot.querySelectorAll("img[data-img]")) {
      const key = `${img.dataset.img}|${img.className}`;
      const old = kept.get(key);
      if (old) {
        kept.delete(key);
        img.replaceWith(old);
        this._imgNodes.set(key, old);
      } else {
        img.src = DATA_IMGS[img.dataset.img];
        this._imgNodes.set(key, img);
      }
    }
  }

  // Dock switches only change state on the next poll of the integration (up to ~30 s): the requested
  // state is shown meanwhile, until the entity reports it or the delay runs out.
  _setPending(id, state) {
    this._pending = { ...this._pending, [id]: { state, until: Date.now() + PENDING_MS } };
    clearTimeout(this._pendingTimer);
    this._pendingTimer = setTimeout(() => this._update(), PENDING_MS + 100);
    this._update();
  }

  _isOn(id) {
    const s = this._s(id);
    const p = this._pending?.[id];
    if (p && (Date.now() > p.until || s?.state === p.state)) delete this._pending[id];
    else if (p) return p.state === "on";
    return s?.state === "on";
  }

  // Remember the natural size of the map image, needed to crop it.
  _onLoad(ev) {
    const img = ev.target;
    const id = img?.dataset?.map;
    if (!id || !img.naturalWidth) return;
    const old = this._mapSizes?.[id];
    if (old && old.w === img.naturalWidth && old.h === img.naturalHeight) return;
    this._mapSizes = { ...this._mapSizes, [id]: { w: img.naturalWidth, h: img.naturalHeight } };
    if (this._config.crop) setTimeout(() => this._update());
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    // Just closed: the rest of a double click on OK does nothing.
    if (!this._confirm && Date.now() - (this._confirmClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    // Confirmation popup open: only its buttons and the backdrop itself (outside the dialog) act.
    if (this._confirm) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "confirm_ok") {
        const { entity } = this._confirm;
        this._closeConfirm();
        this._call("button", "press", { entity_id: entity });
      } else if (action === "confirm_cancel" || (action === "confirm_backdrop" && path[0] === el)) {
        this._closeConfirm();
      }
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity, label } = el.dataset;
    if (this._roomAction(action, entity, el.dataset.room)) return;
    if (action === "zoom_map") return this._zoomMap(entity);
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle_section") {
      const key = el.dataset.section;
      this._toggled = new Set(this._toggled);
      if (this._toggled.has(key)) this._toggled.delete(key);
      else this._toggled.add(key);
      return this._update();
    }
    if (action === "dock_toggle") {
      const on = this._isOn(entity);
      this._setPending(entity, on ? "off" : "on");
      return this._call("switch", on ? "turn_off" : "turn_on", { entity_id: entity }, () => {
        // The request failed: show the entity's real state again.
        if (this._pending) delete this._pending[entity];
        this._update();
      });
    }
    if (action === "reset") {
      this._openConfirm({ entity, text: this._t("confirm_reset", { name: label }), ok: this._t("reset") });
    } else if (action === "routine") {
      this._openConfirm({ entity, text: this._t("run_routine", { name: label }), ok: this._t("start") });
    } else if (action) {
      this._call("vacuum", action, { entity_id: entity });
    } else if (entity) {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
    }
  }

  // Confirmation before pressing a button entity (routine, consumable reset): Cancel does nothing.
  _openConfirm(confirm) {
    this._confirm = confirm;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal .primary")?.focus();
  }

  _closeConfirm() {
    this._confirm = null;
    this._confirmClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  _confirmHtml() {
    const c = this._confirm;
    return `<style>${DIALOG_STYLE}</style><div class="backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="msg">${esc(c.text)}</div>
        <div class="modal-actions">
          <button class="btn" data-action="confirm_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="confirm_ok"><span>${esc(c.ok)}</span></button>
        </div>
      </div>
    </div>`;
  }

  // Translated state: card strings first (they follow the language option), then Home Assistant's
  // own translation of the integration, then a readable version of the raw value.
  _fmt(stateObj, prefix = "v_", value) {
    if (!stateObj && value === undefined) return "—";
    const raw = value ?? stateObj.state;
    const k = `${prefix}${String(raw).toLowerCase()}`;
    const own = STRINGS[lang(this._hass, this._config)][k];
    if (own) return own;
    if (stateObj && value === undefined && this._hass.formatEntityState) {
      try {
        return this._hass.formatEntityState(stateObj);
      } catch (_e) {
        /* older Home Assistant */
      }
    }
    return pretty(raw);
  }

  // Status of the device: the detailed status sensor, else the vacuum entity.
  _status(dev) {
    const e = dev.entities;
    const s = this._s(e.status) || this._s(e.a01_status) || this._s(e.q7_status) || this._s(e.zeo_state);
    const vac = this._s(dev.vacuum);
    if (vac && (vac.state === "unavailable" || !valid(s))) return { state: vac.state, text: this._fmt(vac, "s_"), entity: vac.entity_id };
    if (s) return { state: s.state, text: this._fmt(s, "s_"), entity: s.entity_id };
    return null;
  }

  _battery(dev) {
    const ids = [dev.entities.battery, ...(dev.extra.sensor || [])];
    for (const id of ids) {
      const s = this._s(id);
      if (s && (id === dev.entities.battery || s.attributes?.device_class === "battery")) return s;
    }
    return undefined;
  }

  _error(dev) {
    for (const k of ["vacuum_error", "a01_error", "zeo_error"]) {
      const s = this._s(dev.entities[k]);
      if (valid(s) && s.state !== "none") return { entity: s.entity_id, text: this._fmt(s, "e_") };
    }
    const dock = this._s(dev.dock.dock_error);
    if (valid(dock) && dock.state !== "ok") return { entity: dock.entity_id, text: `${this._t("dock_state")} · ${this._fmt(dock, "e_")}` };
    const water = this._s(dev.entities.water_shortage);
    if (water?.state === "on") return { entity: water.entity_id, text: this._t("water_shortage") };
    // Xiaomi Miio: no error sensor, the vacuum carries it in its "error" attribute.
    const vac = this._s(dev.vacuum);
    if (dev.platform !== "roborock" && vac?.state === "error" && vac.attributes?.error) return { entity: vac.entity_id, text: String(vac.attributes.error) };
    return null;
  }

  // Current room (opens its entity), or "" when unknown.
  _roomLine(dev) {
    const room = this._s(dev.entities.current_room);
    return valid(room)
      ? `<div class="line clickable" data-entity="${esc(room.entity_id)}">${svgIcon(ICONS.room)}<span>${esc(room.state)}</span></div>`
      : "";
  }

  // Robot or dock error (opens its entity), or "".
  _errorLine(dev) {
    const err = this._error(dev);
    return err
      ? `<div class="alert-line crit clickable" data-entity="${esc(err.entity)}">${svgIcon(ICONS.alert)}<span>${esc(err.text)}</span></div>`
      : "";
  }

  // Picture of the robot (opens the vacuum), or "" when there is none.
  _pictureBlock(dev, status) {
    const pic = this._picture(dev, status);
    return pic
      ? `<div class="picture clickable" data-entity="${esc(dev.vacuum || status?.entity || "")}">${imgTag(pic, 'alt=""')}</div>`
      : "";
  }

  _picture(dev, status) {
    const img = this._config.image;
    if (img === "none") return null;
    // Object.hasOwn, not IMAGES[img]: an inherited property name ("__proto__", "constructor"…) as the image
    // option would otherwise be a truthy non-function and crash the render.
    const preset = img && Object.hasOwn(IMAGES, img);
    if (img && !preset && img !== "auto") return img;
    // Mops drying: the drying status of the dock, or its remaining time while the robot is not out cleaning.
    const d = dev.dock;
    const drying = [d.mop_drying_status].some((id) => this._isOn(id)) || hours(this._s(d.mop_drying_remaining_time)) > 0;
    const activity = activityOf(status?.state, this._s(dev.entities.cleaning_mode)?.state, drying);
    const white = colorOf(this._config.color);
    return svgUri(preset ? IMAGES[img](activity, white) : autoSvg(dev, activity, white));
  }

  // Logo of the brand of the model (Roborock or Xiaomi), else of the integration the device comes from
  // (Roborock, Xiaomi Mi Home or Xiaomi Home), linking to its site.
  _logo(dev) {
    const brand = brandOf(dev.model);
    const b = BRANDS[brand === "xiaomi" ? "xiaomi_home" : brand] || BRANDS[dev.platform] || BRANDS.roborock;
    return `<a class="logo-link" href="${b.site}" target="_blank" rel="noopener noreferrer" title="${esc(b.name)}">${imgTag(b.logo, `class="logo" alt="${esc(b.name)}"`)}</a>`;
  }

  _header(dev, status, sub) {
    const c = this._config;
    return `
      <div class="header">
        ${
          c.show_logo !== false ? this._logo(dev) : ""
        }
        <div class="titles">
          <div class="name">${esc(c.title || dev.name)}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${
          status
            ? `<span class="chip clickable ${statusClass(status.state)}" data-entity="${esc(status.entity)}"><span class="dot"></span>${esc(status.text)}</span>`
            : ""
        }
        ${this._zoomButton()}
      </div>`;
  }

  // Detail button at the far right of the header (mini card only).
  _zoomButton() {
    return "";
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(
      key === "unknown_device" ? `${this._t(key)}: ${this._config.device}` : this._t(key)
    )}</div></ha-card>`;
  }

  _lastClean(dev) {
    const s = this._s(dev.entities.last_clean_end) || this._s(dev.entities.last_clean_start);
    const when = valid(s) ? ago(this._hass, this._config, s.state) : null;
    return when ? this._t("last_clean_ago", { when }) : "";
  }

  _batteryLevel(batt) {
    const v = num(batt);
    return { v, cls: v === null ? "idle" : v <= 15 ? "crit" : v <= 30 ? "warn" : "ok" };
  }

  _controls(dev, round = false) {
    const vac = this._s(dev.vacuum);
    if (!vac || this._config.show_controls === false) return "";
    const cleaning = vac.state === "cleaning";
    const btn = (action, icon, label, cls = "") =>
      `<button class="btn ${round ? "round" : ""} ${cls}" title="${esc(label)}" data-action="${action}" data-entity="${esc(vac.entity_id)}">${svgIcon(icon)}${
        round ? "" : `<span>${esc(label)}</span>`
      }</button>`;
    const list = [
      cleaning
        ? btn("pause", ICONS.pause, this._t("pause"), "primary")
        : btn(this._config.room_selection !== false && dev.platform === "roborock" && vac.state !== "paused" ? "open_rooms" : "start", ICONS.play, this._t("start"), "primary"),
      round ? "" : btn("stop", ICONS.stop, this._t("stop")),
      btn("return_to_base", ICONS.home, this._t("dock")),
      round ? "" : btn("locate", ICONS.locate, this._t("locate")),
    ];
    return list.join("");
  }

  // ----- Room selector -----------------------------------------------------
  // Rooms come from the integration's roborock.get_maps service (current map, as chosen in the
  // "selected map" select); the selected rooms are cleaned with app_segment_clean, like the
  // integration's own segment cleaning.

  _roomAction(action, entity, room) {
    const r = this._rooms;
    switch (action) {
      case "open_rooms":
        this._rooms = { entity, selected: [], loading: true };
        this._update();
        this._loadRooms(entity);
        return true;
      case "close_rooms":
        this._rooms = null;
        this._update();
        return true;
      case "toggle_room":
        if (!r) return true;
        r.selected = r.selected.includes(room) ? r.selected.filter((x) => x !== room) : [...r.selected, room];
        this._update();
        return true;
      case "all_rooms":
        if (!r?.list) return true;
        r.selected = r.selected.length === r.list.length ? [] : r.list.map((x) => x.id);
        this._update();
        return true;
      case "clean_rooms":
        if (!r?.selected.length) return true;
        this._call("vacuum", "send_command", {
          entity_id: entity,
          command: "app_segment_clean",
          params: [{ segments: r.selected.map(Number) }],
        });
        this._rooms = null;
        this._update();
        return true;
      case "clean_all":
        this._call("vacuum", "start", { entity_id: entity });
        this._rooms = null;
        this._update();
        return true;
      default:
        return false;
    }
  }

  async _loadRooms(entity) {
    try {
      const res = await this._hass.callWS({
        type: "call_service",
        domain: "roborock",
        service: "get_maps",
        target: { entity_id: entity },
        return_response: true,
      });
      const maps = res?.response?.[entity]?.maps || [];
      const selected = this._s(this._dev?.entities.selected_map)?.state;
      const map = maps.find((m) => m.name === selected) || maps[0];
      const list = Object.entries(map?.rooms || {})
        .map(([id, name]) => ({ id, name: name || `#${id}` }))
        .sort((a, b) => a.name.localeCompare(b.name));
      if (this._rooms?.entity !== entity) return;
      this._rooms = { ...this._rooms, loading: false, list, error: !list.length };
    } catch (_e) {
      if (this._rooms?.entity !== entity) return;
      this._rooms = { ...this._rooms, loading: false, list: [], error: true };
    }
    this._update();
  }

  _roomPanel(dev) {
    const r = this._rooms;
    if (!r || r.entity !== dev.vacuum) return "";
    let body;
    if (r.loading) body = `<div class="rooms-msg">${esc(this._t("rooms_loading"))}</div>`;
    else if (r.error) body = `<div class="rooms-msg">${esc(this._t("rooms_error"))}</div>`;
    else
      body = `<div class="room-list">
        <button class="room all ${r.selected.length === r.list.length ? "on" : ""}" data-action="all_rooms" data-entity="${esc(dev.vacuum)}">${esc(this._t("select_all"))}</button>
        ${r.list
          .map(
            (x) =>
              `<button class="room ${r.selected.includes(x.id) ? "on" : ""}" data-action="toggle_room" data-entity="${esc(dev.vacuum)}" data-room="${esc(x.id)}">${esc(x.name)}</button>`
          )
          .join("")}
      </div>`;
    return `<div class="rooms">
      <div class="rooms-title">${svgIcon(ICONS.room)}${esc(this._t("choose_rooms"))}</div>
      ${body}
      <div class="rooms-actions">
        <button class="btn" data-action="close_rooms" data-entity="${esc(dev.vacuum)}"><span>${esc(this._t("cancel"))}</span></button>
        <button class="btn" data-action="clean_all" data-entity="${esc(dev.vacuum)}">${svgIcon(ICONS.home)}<span>${esc(this._t("whole_home"))}</span></button>
        <button class="btn primary ${r.selected.length ? "" : "disabled"}" data-action="clean_rooms" data-entity="${esc(dev.vacuum)}" ${
          r.selected.length ? "" : "disabled"
        }>${svgIcon(ICONS.play)}<span>${esc(this._t("clean_rooms", { n: r.selected.length }))}</span></button>
      </div>
    </div>`;
  }
}

// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------

const FULL_STYLE = `
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .hero { display: flex; gap: 12px; align-items: center; }
  .picture { width: 96px; height: 104px; }
  .picture img { filter: drop-shadow(0 4px 8px rgba(0,0,0,.18)); }
  .batt { display: flex; align-items: center; gap: 8px; }
  .batt .pct { font-size: 30px; font-weight: 400; line-height: 1; }
  .batt .pct small { font-size: 14px; margin-left: 2px; color: var(--secondary-text-color); }
  .batt .icon { color: var(--c); }
  .batt .bolt { color: var(--rr-ok); width: 20px; height: 20px; }
  .line .icon { width: 16px; height: 16px; }
  .tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 6px; border-radius: 8px;
         background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); white-space: nowrap; }
  .tag .icon { width: 14px; height: 14px; color: var(--secondary-text-color); }
  .controls { display: flex; flex-wrap: wrap; gap: 6px; }
  .controls .btn { flex: 1 1 auto; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .routines { display: flex; flex-wrap: wrap; gap: 6px; }
  .routines .btn { font-weight: 400; padding: 6px 12px 6px 8px; }
  .routines .btn .icon { color: var(--rr-red); }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); gap: 6px; }
  .tiles.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tile { display: flex; flex-direction: column; gap: 2px; padding: 6px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .tile .k { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .k .icon { width: 14px; height: 14px; color: var(--c, var(--secondary-text-color)); }
  .tile .v { font-size: 14px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .tile.warn .v, .tile.crit .v { color: var(--c); }
  .cons { display: grid; grid-template-columns: 18px minmax(0, 1fr) 90px 56px; align-items: center; gap: 2px 8px; font-size: 12px; }
  .cons .icon { color: var(--secondary-text-color); }
  .cons .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cons .v { text-align: right; font-weight: 500; white-space: nowrap; }
  .cons .v.warn, .cons .v.crit { color: var(--c); }
  .cons .nobar { height: 6px; }
  .cons.with-reset { grid-template-columns: 18px minmax(0, 1fr) 90px 56px 28px; }
  .reset { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 50%;
           background: transparent; color: var(--secondary-text-color); cursor: pointer; padding: 0; }
  .reset:hover { background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--rr-red); }
  .reset .icon { width: 18px; height: 18px; }
  .map img { width: 100%; border-radius: 10px; display: block; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .map .crop { overflow: hidden; border-radius: 10px; }
  .map { cursor: zoom-in; }
  .dock-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .dock-actions .btn { flex: 1 1 auto; }
  .dock-actions .btn .icon { color: var(--rr-red); }
  .dock-actions .btn.running { background: color-mix(in srgb, var(--rr-active) 16%, transparent); color: var(--rr-active); }
  .dock-actions .btn.running .icon { color: var(--rr-active); }
  .map .crop img { max-width: none; border-radius: 0; background: none; }
`;

class RoborockCard extends RoborockBase {
  static getConfigElement() {
    return document.createElement("roborock-card-editor");
  }

  static getStubConfig(hass) {
    const m = hass && resolve(hass);
    const dev = m && (m.devices.find((d) => d.kind === "robot") || m.devices[0]);
    return dev ? { device: dev.id } : {};
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _render() {
    const { dev, error } = findDevice(this._hass, this._config);
    if (error) return this._errorCard(error);
    this._dev = dev;
    const c = this._config;
    const status = this._status(dev);
    const parts = [this._hero(dev)];
    if (dev.vacuum && c.show_controls !== false) parts.push(`<div class="controls">${this._controls(dev)}</div>`, this._roomPanel(dev));
    if (c.show_routines !== false) parts.push(this._routines(dev));
    if (c.show_dock !== false) parts.push(this._dock(dev));
    if (c.show_consumables !== false) parts.push(this._consumables(dev));
    if (c.show_stats !== false) parts.push(this._stats(dev));
    if (this._showMap(dev)) parts.push(this._map(dev));
    return `<style>${BASE_STYLE}${FULL_STYLE}</style>
      <ha-card>
        ${this._header(dev, status, this._lastClean(dev))}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _hero(dev) {
    const e = dev.entities;
    const batt = this._battery(dev);
    const { v, cls } = this._batteryLevel(batt);
    const status = this._status(dev);
    const charging = /charg/.test(status?.state || "") && !/problem|complete/.test(status?.state || "");
    const lines = [this._roomLine(dev)];

    if (statusClass(status?.state) === "active") {
      const pct = num(this._s(e.clean_percent));
      const area = num(this._s(e.cleaning_area));
      const time = hours(this._s(e.cleaning_time));
      const bits = [pct ? `${this._t("progress")} ${Math.round(pct)} %` : null, area !== null ? `${fmtNum(area, 1, this._locale())} m²` : null, time !== null ? fmtHours(time) : null];
      if (bits.some(Boolean))
        lines.push(`<div class="line clickable" data-entity="${esc(e.clean_percent || e.cleaning_area || "")}">${svgIcon(ICONS.clock)}<span>${esc(bits.filter(Boolean).join(" · "))}</span></div>`);
    }

    lines.push(this._errorLine(dev));

    if (this._config.show_modes !== false) {
      const tags = [];
      const tag = (id, icon, text) => (text ? `<span class="tag clickable" data-entity="${esc(id)}">${svgIcon(icon)}${esc(text)}</span>` : "");
      const mode = this._s(e.cleaning_mode);
      if (valid(mode)) tags.push(tag(mode.entity_id, ICONS.mode, this._fmt(mode)));
      const vac = this._s(dev.vacuum);
      const fan = vac?.attributes?.fan_speed;
      if (fan) tags.push(tag(vac.entity_id, ICONS.fan, this._fmt(vac, "v_", fan)));
      const mop = this._s(e.mop_intensity) || this._s(e.water_flow);
      if (valid(mop)) tags.push(tag(mop.entity_id, ICONS.water, this._fmt(mop)));
      const route = this._s(e.cleaning_route) || this._s(e.mop_mode);
      if (valid(route)) tags.push(tag(route.entity_id, ICONS.route, this._fmt(route)));
      if (tags.length) lines.push(`<div class="tags">${tags.join("")}</div>`);
    }

    return `<div class="hero">
      ${this._pictureBlock(dev, status)}
      <div class="info">
        ${
          batt
            ? `<div class="batt clickable ${cls}" data-entity="${esc(batt.entity_id)}">
                 ${svgIcon(ICONS.battery)}<span class="pct">${v === null ? "—" : Math.round(v)}<small>%</small></span>
                 ${charging ? svgIcon(ICONS.bolt, "bolt") : ""}
               </div>
               <div class="bar ${cls}"><div style="width:${v ?? 0}%"></div></div>`
            : ""
        }
        ${lines.join("")}
      </div>
    </div>`;
  }

  _routines(dev) {
    const prefix = dev.rawName || dev.name;
    const buttons = (dev.extra.button || []).map((id) => this._s(id)).filter((s) => s && s.state !== "unavailable");
    if (!buttons.length) return "";
    const items = buttons.map((s) => {
      let name = s.attributes?.friendly_name || s.entity_id;
      for (const p of [prefix, dev.name]) if (p && name.startsWith(`${p} `)) name = name.slice(p.length + 1);
      return { id: s.entity_id, name };
    });
    items.sort((a, b) => a.name.localeCompare(b.name));
    return `<div>
      ${this._sectionTitle("routines", ICONS.routine, this._t("routines"))}
      ${
        this._isCollapsed("routines")
          ? ""
          : `<div class="routines">${items
              .map((r) => `<button class="btn" data-action="routine" data-entity="${esc(r.id)}" data-label="${esc(r.name)}">${svgIcon(ICONS.routine)}<span>${esc(r.name)}</span></button>`)
              .join("")}</div>`
      }
    </div>`;
  }

  // Collapsible sections: `collapsed` lists the sections folded by default (stats and dock unless
  // set); a click on a section title folds or unfolds it, and a click elsewhere on the page folds it back.
  _isCollapsed(key) {
    if (this._toggled?.has(key)) return !this._defaultCollapsed(key);
    return this._defaultCollapsed(key);
  }

  _defaultCollapsed(key) {
    // A dock reporting a problem is always shown unfolded (it can still be folded by hand).
    if (key === "dock" && this._dev && this._dockProblem(this._dev)) return false;
    const c = this._config.collapsed ?? DEFAULT_COLLAPSED;
    return (Array.isArray(c) ? c : [c]).includes(key);
  }

  _sectionTitle(key, icon, label) {
    const closed = this._isCollapsed(key);
    return `<div class="section-title toggle" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(icon)}${esc(
      label
    )}${svgIcon(ICONS.chevron_down, "chevron")}</div>`;
  }

  _tile(id, icon, label, value, cls = "") {
    return `<div class="tile clickable ${cls}" data-entity="${esc(id || "")}"><div class="k">${svgIcon(icon)}${esc(label)}</div><div class="v">${esc(value)}</div></div>`;
  }

  _dock(dev) {
    const d = dev.dock;
    const tiles = [];
    const dockErr = this._s(d.dock_error);
    if (valid(dockErr)) {
      const ok = dockErr.state === "ok";
      tiles.push(this._tile(dockErr.entity_id, ICONS.dock, this._t("dock_state"), ok ? this._t("ok") : this._fmt(dockErr, "e_"), ok ? "ok" : "crit"));
    }
    const flag = (key, icon, label, problemText) => {
      const s = this._s(d[key]);
      if (!s) return;
      const on = s.state === "on";
      tiles.push(this._tile(s.entity_id, icon, this._t(label), on ? this._t(problemText) : this._t("ok"), on ? "crit" : "ok"));
    };
    flag("clean_box_empty", ICONS.water, "clean_water", "empty");
    flag("dirty_box_full", ICONS.water_off, "dirty_water", "full");
    flag("clean_fluid_empty", ICONS.fluid, "cleaning_fluid", "empty");
    const dust = this._s(d.dust_collection_mode);
    if (valid(dust)) tiles.push(this._tile(dust.entity_id, ICONS.bin, this._t("dust_mode"), this._fmt(dust)));
    // Drying: the remaining time only refreshes on the next poll of the integration (about 30 s after
    // the dryer starts), so the tile also shows while the drying switch or status is on.
    const dry = this._s(d.mop_drying_remaining_time);
    const dryH = hours(dry);
    const drying = [d.mop_drying, d.mop_drying_status].some((id) => this._isOn(id));
    if (dryH > 0 || drying)
      tiles.push(this._tile(dry?.entity_id || d.mop_drying, ICONS.fan, this._t("drying"), dryH > 0 ? fmtHours(dryH) : this._t("running"), "active"));
    const actions = this._dockActions(dev);
    if (!tiles.length && !actions) return "";
    return `<div>
      ${this._sectionTitle("dock", ICONS.dock, this._t("station"))}
      ${this._isCollapsed("dock") ? "" : `${tiles.length ? `<div class="tiles">${tiles.join("")}</div>` : ""}${actions}`}
    </div>`;
  }

  _dockProblem(dev) {
    const d = dev.dock;
    const err = this._s(d.dock_error);
    if (valid(err) && err.state !== "ok") return true;
    return ["clean_box_empty", "dirty_box_full", "clean_fluid_empty"].some((k) => this._s(d[k])?.state === "on");
  }

  // Dock action switches of the integration: on while the action runs, the dock stops it on its own.
  _dockActions(dev) {
    if (this._config.show_controls === false) return "";
    const btns = [
      ["dust_emptying", ICONS.bin, "empty_bin"],
      ["mop_washing", ICONS.water, "wash_mop"],
      ["mop_drying", ICONS.fan, "dry_mop"],
    ]
      .map(([key, icon, label]) => {
        const s = this._s(dev.dock[key]);
        if (!s || s.state === "unavailable") return "";
        const on = this._isOn(s.entity_id);
        return `<button class="btn ${on ? "running" : ""}" title="${esc(this._t(on ? "stop_action" : "start_action", { name: this._t(label) }))}"
          data-action="dock_toggle" data-entity="${esc(s.entity_id)}">${svgIcon(on ? ICONS.stop : icon)}<span>${esc(this._t(label))}</span></button>`;
      })
      .filter(Boolean);
    return btns.length ? `<div class="dock-actions">${btns.join("")}</div>` : "";
  }

  _consumables(dev) {
    const rows = [];
    const resets = this._config.show_controls !== false && CONSUMABLES.some(([key, , , , r]) => (dev.entities[key] || dev.dock[key]) && this._resetId(dev, r));
    for (const [key, label, icon, life, resetKey] of CONSUMABLES) {
      const s = this._s(dev.entities[key]) || this._s(dev.dock[key]);
      if (!s) continue;
      let pct = null;
      let text;
      let cls;
      if (life === "pct") {
        pct = num(s);
        text = pct === null ? "—" : `${Math.round(pct)} %`;
        cls = pct === null ? "" : pct <= 0 ? "crit" : pct < 10 ? "warn" : "ok";
      } else {
        const h = hours(s);
        const lifetime = dev.kind === "robot" ? life : null;
        if (lifetime && h !== null) pct = (100 * h) / lifetime;
        text = fmtHours(h);
        cls = h === null ? "" : h <= 0 ? "crit" : (pct !== null ? pct < 10 : h < 10) ? "warn" : "ok";
      }
      rows.push(`
        ${svgIcon(icon)}<span class="lbl clickable" data-entity="${esc(s.entity_id)}">${esc(this._t(label))}</span>
        ${pct !== null ? `<div class="bar ${cls}"><div style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>` : `<div class="nobar"></div>`}
        <span class="v clickable ${cls}" data-entity="${esc(s.entity_id)}">${esc(text)}</span>
        ${resets ? this._resetButton(dev, resetKey, label) : ""}`);
    }
    if (!rows.length) return "";
    return `<div>
      ${this._sectionTitle("consumables", ICONS.brush, this._t("consumables"))}
      ${this._isCollapsed("consumables") ? "" : `<div class="cons ${resets ? "with-reset" : ""}">${rows.join("")}</div>`}
    </div>`;
  }

  _resetId(dev, key) {
    const id = key && (dev.entities[key] || dev.dock[key]);
    const s = this._s(id);
    return s && s.state !== "unavailable" ? id : null;
  }

  // Reset button of a consumable, when the integration exposes one; an empty cell keeps the grid aligned.
  _resetButton(dev, key, label) {
    const id = this._resetId(dev, key);
    if (!id) return `<span></span>`;
    return `<button class="reset" title="${esc(this._t("reset"))}" data-action="reset" data-entity="${esc(id)}" data-label="${esc(this._t(label))}">${svgIcon(ICONS.reset)}</button>`;
  }

  _stats(dev) {
    const e = dev.entities;
    const tiles = [];
    // Counters still at 0 (device never used, or not reporting them) are left out, and the whole
    // section when nothing is left.
    const area = this._s(e.cleaning_area);
    const time = this._s(e.cleaning_time);
    if ((valid(area) && num(area)) || (valid(time) && num(time))) {
      const bits = [valid(area) ? `${fmtNum(num(area), 1, this._locale())} m²` : null, valid(time) ? fmtHours(hours(time)) : null].filter(Boolean);
      tiles.push(this._tile((area || time).entity_id, ICONS.clock, this._t("last_clean"), bits.join(" · ")));
    }
    const count = this._s(e.total_cleaning_count);
    if (valid(count) && num(count)) tiles.push(this._tile(count.entity_id, ICONS.count, this._t("total_count"), fmtNum(num(count), 0, this._locale())));
    const tArea = this._s(e.total_cleaning_area);
    if (valid(tArea) && num(tArea)) tiles.push(this._tile(tArea.entity_id, ICONS.area, this._t("total_area"), `${fmtNum(num(tArea), 0, this._locale())} m²`));
    const tTime = this._s(e.total_cleaning_time);
    if (valid(tTime) && num(tTime)) tiles.push(this._tile(tTime.entity_id, ICONS.clock, this._t("total_time"), fmtHours(hours(tTime))));
    if (!tiles.length) return "";
    return `<div>
      ${this._sectionTitle("stats", ICONS.stats, this._t("statistics"))}
      ${this._isCollapsed("stats") ? "" : `<div class="tiles two">${tiles.join("")}</div>`}
    </div>`;
  }

  // show_map: true / "always", false / "never", or "cleaning" (default) to show it only during a cleaning job.
  _showMap(dev) {
    const m = this._config.show_map ?? "cleaning";
    if (m === true || m === "always") return true;
    if (m !== "cleaning") return false;
    return this._s(dev.vacuum)?.state === "cleaning" || this._s(dev.entities.in_cleaning)?.state === "on";
  }

  _map(dev) {
    const maps = mapIds(dev, this._config).map((id) => this._s(id)).filter((s) => s?.attributes?.entity_picture);
    if (!maps.length) return "";
    const selected = this._s(dev.entities.selected_map)?.state;
    const map = (selected && maps.find((s) => (s.attributes.friendly_name || "").endsWith(selected))) || maps[0];
    const url = map.attributes.entity_picture;
    const img = `<img src="${esc(url)}" alt="${esc(this._t("map"))}" data-map="${esc(map.entity_id)}"`;
    const crop = this._mapCrop(map.entity_id);
    const attrs = `class="map clickable" data-action="zoom_map" data-entity="${esc(map.entity_id)}" title="${esc(this._t("map"))}"`;
    if (!crop) return `<div ${attrs}>${img}></div>`;
    return `<div ${attrs}><div class="crop" style="aspect-ratio:${crop.ratio}">${img} style="${crop.img}"></div></div>`;
  }

  // crop: { top, bottom, left, right } in pixels of the map image. The image size is only known once
  // it has loaded (see _onLoad), so until then the map is shown uncropped.
  _mapCrop(id) {
    const crop = this._config.crop || {};
    const [t, b, l, r] = ["top", "bottom", "left", "right"].map((k) => Math.max(0, Number(crop[k]) || 0));
    const size = this._mapSizes?.[id];
    if (!size || !(t || b || l || r)) return null;
    if (size.w - l - r <= 0 || size.h - t - b <= 0) {
      if (!this._cropWarned) console.warn(`roborock-card: crop is larger than the map image (${size.w} × ${size.h} px)`);
      this._cropWarned = true;
      return null;
    }
    const w = size.w - l - r;
    const h = size.h - t - b;
    const pct = (v) => `${((100 * v) / w).toFixed(4)}%`;
    return { ratio: `${w} / ${h}`, w, h, img: `width:${pct(size.w)};max-width:none;margin-left:-${pct(l)};margin-top:-${pct(t)};display:block` };
  }

  // Enlarged map, appended to the document body so that it is not clipped or offset by the card
  // (themes with blur or transforms). Closes on click or Escape.
  _zoomMap(id) {
    const s = this._s(id);
    const url = s?.attributes?.entity_picture;
    if (!url) return;
    const size = this._mapSizes?.[id];
    const crop = this._mapCrop(id);
    const ratio = crop ? crop.w / crop.h : size ? size.w / size.h : 16 / 9;
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.82);cursor:zoom-out;padding:16px;box-sizing:border-box";
    const box = document.createElement("div");
    box.style.cssText = `width:min(96vw, calc(92vh * ${ratio}));aspect-ratio:${ratio};overflow:hidden;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.5)`;
    const img = document.createElement("img");
    img.src = url;
    img.alt = this._t("map");
    img.style.cssText = crop ? crop.img : "width:100%;height:100%;object-fit:contain;display:block";
    box.appendChild(img);
    overlay.appendChild(box);
    this._closeZoom?.();
    const close = () => {
      overlay.remove();
      window.removeEventListener("keydown", onKey);
      if (this._closeZoom === close) this._closeZoom = null;
    };
    this._closeZoom = close;
    const onKey = (ev) => ev.key === "Escape" && close();
    overlay.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
  }
}

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  .header { padding: 12px 12px 0; }
  .logo { width: 32px; height: 32px; }
  .name { font-size: 16px; }
  .content { padding: 8px 12px 12px; display: flex; align-items: center; gap: 12px; }
  .picture { width: 64px; height: 72px; }
  .picture img { filter: drop-shadow(0 2px 4px rgba(0,0,0,.18)); }
  .batt { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .batt .icon { color: var(--c); width: 16px; height: 16px; }
  .batt .bar { flex: 1; }
  .batt .v { font-weight: 500; min-width: 40px; text-align: right; }
  .line .icon { width: 14px; height: 14px; }
  .controls { display: flex; gap: 6px; flex: none; }
  .rooms-wrap { padding: 0 12px 12px; }
`;

// The mini card is a full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
class RoborockMiniCard extends RoborockCard {
  constructor() {
    super();
    // Clicks inside a dialog (the more-info opened from the card) leave it zoomed in.
    this._onUnzoom = (ev) => {
      if (this._zoomed && isOutside(this, ev)) this._setZoom(false);
    };
  }

  static getConfigElement() {
    return document.createElement("roborock-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onUnzoom, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onUnzoom, true);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    this._update();
  }

  // The click never reaches the header or an action (stopped in _onClick). From the keyboard (Enter / Space: no
  // click count), the focus moves to the button that replaced this one.
  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus();
  }

  _render() {
    if (this._zoomed) return super._render();
    const { dev, error } = findDevice(this._hass, this._config);
    if (error) return this._errorCard(error);
    this._dev = dev;
    const status = this._status(dev);
    const batt = this._battery(dev);
    const { v, cls } = this._batteryLevel(batt);
    const lines = [this._errorLine(dev), this._roomLine(dev)];
    const last = this._lastClean(dev);
    if (last) lines.push(`<div class="line">${svgIcon(ICONS.clock)}<span>${esc(last)}</span></div>`);
    return `<style>${BASE_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._header(dev, status, "")}
        <div class="content">
          ${this._pictureBlock(dev, status)}
          <div class="info">
            ${
              batt
                ? `<div class="batt clickable ${cls}" data-entity="${esc(batt.entity_id)}">${svgIcon(ICONS.battery)}<div class="bar ${cls}"><div style="width:${
                    v ?? 0
                  }%"></div></div><span class="v">${v === null ? "—" : `${Math.round(v)} %`}</span></div>`
                : ""
            }
            ${lines.join("")}
          </div>
          ${dev.vacuum && this._config.show_controls !== false ? `<div class="controls">${this._controls(dev, true)}</div>` : ""}
        </div>
        ${this._rooms ? `<div class="rooms-wrap">${this._roomPanel(dev)}</div>` : ""}
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

class RoborockEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  static get selects() {
    return {};
  }

  static extraFields() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "device", selector: { select: { mode: "dropdown", options: listDevices(this._hass) } } },
      { name: "title", selector: { text: {} } },
      {
        name: "image",
        selector: {
          select: {
            mode: "dropdown",
            custom_value: true,
            options: [
              { value: "auto", label: tr("image_auto") },
              ...Object.entries(IMAGE_LABELS).map(([value, label]) => ({ value, label })),
              { value: "none", label: tr("image_none") },
            ],
          },
        },
      },
      {
        name: "color",
        selector: {
          select: { mode: "dropdown", options: ["auto", "white", "dark"].map((v) => ({ value: v, label: tr(`color_${v}`) })) },
        },
      },
      ...this.constructor.extraFields(tr),
      {
        type: "grid",
        name: "",
        schema: [["show_logo", true], ...this.constructor.toggles].map(([name]) => ({ name, selector: { boolean: {} } })),
      },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: tr("lang_auto") },
              { value: "en", label: "English" },
              { value: "fr", label: "Français" },
            ],
          },
        },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = [["show_logo", true], ...this.constructor.toggles];
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => {
        if (s.name === "zoom") return t(this._hass, this._config, "zoom_helper");
        return s.name === "crop" && this._mapSize ? t(this._hass, this._config, "map_size", { w: this._mapSize.w, h: this._mapSize.h }) : undefined;
      };
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = { ...Object.fromEntries(toggles), image: "auto", color: "auto", ...this.constructor.selects };
        for (let [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and options left at their default.
          if (v && typeof v === "object" && !Array.isArray(v)) {
            v = config[k] = { ...v };
            for (const [sk, sv] of Object.entries(v)) if (sv === "" || sv === undefined || sv === null || sv === 0) delete v[sk];
            if (!Object.keys(v).length) delete config[k];
          } else if (v === "" || v === undefined || v === null || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { image: "auto", color: "auto", ...this.constructor.selects, ...this._config };
    if (data.show_map === true) data.show_map = "always";
    if (data.show_map === false) data.show_map = "never";
    // The nested form of an expandable section needs an object, even when the option is not set.
    for (const f of this.constructor.extraFields(() => "")) if (f.type === "expandable") data[f.name] = { ...data[f.name] };
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    if (!data.device) data.device = RoborockCard.getStubConfig(this._hass).device;
    this._form.hass = this._hass;
    // A new data or schema object re-renders the whole form: only hand over new ones when the config,
    // the language, the registries or the map size changed, not on every state change.
    const h = this._hass;
    const same = (a, b) => a && a.length === b.length && a.every((d, i) => d === b[i]);
    const dataDeps = [this._config, h.entities, h.devices];
    if (!same(this._dataDeps, dataDeps)) {
      this._dataDeps = dataDeps;
      this._form.data = data;
    }
    const schemaDeps = [lang(h, this._config), h.entities, h.devices, this._mapSize];
    if (!same(this._schemaDeps, schemaDeps)) {
      this._schemaDeps = schemaDeps;
      this._form.schema = this._schema();
    }
    this._loadMapSize(data.device);
  }

  // Size of the map image of the selected device, shown in the crop section to help pick the values.
  _loadMapSize(device) {
    if (!this.constructor.extraFields(() => "").some((f) => f.name === "crop")) return;
    const { dev } = findDevice(this._hass, { device });
    const id = dev && mapIds(dev, this._config).find((i) => this._hass.states[i]?.attributes?.entity_picture);
    if (!id || this._mapSizeFor === id) return;
    this._mapSizeFor = id;
    const img = new Image();
    img.onload = () => {
      this._mapSize = { w: img.naturalWidth, h: img.naturalHeight };
      if (this._form) this._form.schema = this._schema();
    };
    img.src = this._hass.states[id].attributes.entity_picture;
  }
}

class RoborockCardEditor extends RoborockEditorBase {
  static get toggles() {
    return [
      ["show_controls", true],
      ["room_selection", true],
      ["show_modes", true],
      ["show_routines", true],
      ["show_dock", true],
      ["show_consumables", true],
      ["show_stats", true],
    ];
  }

  static get selects() {
    return { show_map: "cleaning", collapsed: DEFAULT_COLLAPSED };
  }

  static extraFields(tr) {
    return [
      {
        name: "show_map",
        selector: {
          select: {
            mode: "dropdown",
            options: ["never", "cleaning", "always"].map((v) => ({ value: v, label: tr(`map_${v}`) })),
          },
        },
      },
      {
        name: "collapsed",
        selector: {
          select: {
            multiple: true,
            mode: "list",
            options: [
              ["routines", "routines"],
              ["dock", "station"],
              ["consumables", "consumables"],
              ["stats", "statistics"],
            ].map(([value, label]) => ({ value, label: tr(label) })),
          },
        },
      },
      { name: "map_entity", selector: { entity: { domain: ["camera", "image"] } } },
      {
        type: "expandable",
        name: "crop",
        title: tr("crop"),
        icon: "mdi:crop",
        schema: ["top", "bottom", "left", "right"].map((name) => ({ name, selector: { number: { min: 0, mode: "box", unit_of_measurement: "px" } } })),
      },
    ];
  }
}

class RoborockMiniCardEditor extends RoborockEditorBase {
  static get toggles() {
    return [
      ["show_controls", true],
      ["room_selection", true],
      ["zoom", true],
    ];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("roborock-card", RoborockCard);
define("roborock-mini-card", RoborockMiniCard);
define("roborock-card-editor", RoborockCardEditor);
define("roborock-mini-card-editor", RoborockMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "roborock-card",
    name: "Roborock Card",
    description: "Monitor and control a Roborock robot vacuum or wet-dry vacuum: status, battery, routines, dock, maintenance and statistics.",
  },
  {
    type: "roborock-mini-card",
    name: "Roborock Mini Card",
    description: "Compact Roborock overview: status, battery, current room and quick controls.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-roborock-card" });
}

console.info(
  `%c ROBOROCK-CARD %c v${VERSION} `,
  "color: white; background: #ea0029; font-weight: 700;",
  "color: #ea0029; background: white; font-weight: 700;"
);
