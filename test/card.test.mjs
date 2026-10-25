import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const rr = load();

const makeHass = (st = states) => {
  const calls = [];
  return { calls, entities, devices, states: st, language: "en", callService: (...a) => calls.push(a) };
};

const newCard = (hass) => {
  const card = new rr.RoborockCard();
  card.setConfig({ device: "saros", show_map: "never" });
  card.hass = hass;
  return card;
};

// A click on an element of the card, as composedPath() would report it.
const click = (card, dataset, extra = []) => {
  const el = { dataset };
  card._onClick({ composedPath: () => [el, ...extra], stopPropagation() {} });
  return el;
};

test("an unrelated state change does not rebuild the card", () => {
  const hass = makeHass();
  const card = newCard(hass);
  let renders = 0;
  const render = card._render.bind(card);
  card._render = () => {
    renders++;
    return render();
  };
  card.hass = { ...hass, states: { ...states, "light.elsewhere": { entity_id: "light.elsewhere", state: "on", attributes: {} } } };
  assert.equal(renders, 0);
  const batt = "sensor.aspirateur_batterie";
  card.hass = { ...hass, states: { ...states, [batt]: { ...states[batt], state: "99" } } };
  assert.equal(renders, 1);
  assert.match(card.shadowRoot.innerHTML, />99<small>/);
});

test("a routine asks for confirmation in the card, Cancel does nothing", () => {
  const hass = makeHass();
  const card = newCard(hass);
  click(card, { action: "routine", entity: "button.routine", label: "Morning" });
  assert.equal(hass.calls.length, 0);
  assert.match(card.shadowRoot.innerHTML, /class="dialog-open"/);
  assert.match(card.shadowRoot.innerHTML, /Run routine Morning\?/);
  click(card, { action: "confirm_cancel" });
  assert.equal(hass.calls.length, 0);
  assert.doesNotMatch(card.shadowRoot.innerHTML, /dialog-open/);
});

test("confirming presses the button once", () => {
  const hass = makeHass();
  const card = newCard(hass);
  click(card, { action: "reset", entity: "button.aspirateur_reinitialiser_sensor", label: "Sensors" });
  // Clicks elsewhere in the card do nothing while the popup is open.
  click(card, { action: "stop", entity: "vacuum.aspirateur" });
  assert.equal(hass.calls.length, 0);
  click(card, { action: "confirm_ok" });
  assert.deepEqual(JSON.parse(JSON.stringify(hass.calls)), [["button", "press", { entity_id: "button.aspirateur_reinitialiser_sensor" }]]);
  assert.doesNotMatch(card.shadowRoot.innerHTML, /dialog-open/);
});

test("a click inside the more-info dialog keeps the sections unfolded", () => {
  const card = newCard(makeHass());
  card.connectedCallback();
  click(card, { action: "toggle_section", section: "stats" });
  assert.equal(card._toggled.size, 1);
  card._onOutside({ composedPath: () => [{ tagName: "DIV" }, { tagName: "HA-MORE-INFO-DIALOG" }] });
  assert.equal(card._toggled.size, 1);
  card._onOutside({ composedPath: () => [{ tagName: "DIV" }] });
  assert.equal(card._toggled.size, 0);
});

test("a failed dock switch call drops the pending state and leaves no unhandled rejection", async () => {
  const rejections = [];
  const onRejection = (e) => rejections.push(e);
  process.on("unhandledRejection", onRejection);
  try {
    const hass = { ...makeHass(), callService: () => Promise.reject(new Error("read-only")) };
    const card = newCard(hass);
    const id = "switch.station_vidage_de_la_poussiere";
    click(card, { action: "dock_toggle", entity: id });
    assert.ok(card._pending[id], "requested state shown meanwhile");
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(card._pending[id], undefined);
    assert.equal(card._isOn(id), false);
    assert.equal(rejections.length, 0);
    card.disconnectedCallback();
  } finally {
    process.off("unhandledRejection", onRejection);
  }
});

test("detaching the card clears the pending timer and closes the zoomed map", () => {
  const card = newCard(makeHass());
  let closed = 0;
  card._pendingTimer = setTimeout(() => assert.fail("timer still running"), 20);
  card._closeZoom = () => closed++;
  card.disconnectedCallback();
  assert.equal(closed, 1);
  return new Promise((r) => setTimeout(r, 40));
});

test("the relative time formatter is built once per language", () => {
  const hass = makeHass();
  const iso = new Date(Date.now() - 2 * 3600e3).toISOString();
  rr.ago(hass, {}, iso);
  const fmt = rr.RTF.en;
  assert.ok(fmt);
  rr.ago(hass, {}, iso);
  assert.equal(rr.RTF.en, fmt);
  rr.ago(hass, { language: "fr" }, iso);
  assert.ok(rr.RTF.fr && rr.RTF.fr !== fmt);
});

test("the full and mini cards share the room, error and picture blocks", () => {
  const err = "sensor.aspirateur_erreur";
  const hass = makeHass({ ...states, [err]: { ...states[err], state: "main_brush_jammed" } });
  const full = newCard(hass);
  const mini = new rr.RoborockMiniCard();
  mini.setConfig({ device: "saros" });
  mini.hass = hass;
  for (const html of [full.shadowRoot.innerHTML, mini.shadowRoot.innerHTML]) {
    assert.match(html, /class="line clickable" data-entity="sensor\.aspirateur_piece_actuelle"/);
    assert.match(html, /class="alert-line crit clickable" data-entity="sensor\.aspirateur_erreur"/);
    assert.match(html, /class="picture clickable" data-entity="vacuum\.aspirateur"><img data-img="/);
  }
});

test("Escape still closes the popup after a re-render took the focus away", () => {
  const hass = makeHass();
  const card = newCard(hass);
  click(card, { action: "routine", entity: "button.routine", label: "Morning" });
  // A device state changes while the popup is open: the card is rewritten and the focus falls back to <body>,
  // so the keydown only reaches the window.
  const batt = "sensor.aspirateur_batterie";
  card.hass = { ...hass, states: { ...states, [batt]: { ...states[batt], state: "42" } } };
  assert.match(card.shadowRoot.innerHTML, /dialog-open/);
  rr.window.fire("keydown", { key: "Escape", stopPropagation() {} });
  assert.doesNotMatch(card.shadowRoot.innerHTML, /dialog-open/);
  assert.equal(hass.calls.length, 0);
});

test("the second click of a double click on OK does not reach the card under the popup", () => {
  const hass = makeHass();
  const card = newCard(hass);
  click(card, { action: "routine", entity: "button.routine", label: "Morning" });
  click(card, { action: "confirm_ok" });
  // What lies under OK once the popup is gone: the battery (more-info) or an action button.
  click(card, { entity: "sensor.aspirateur_batterie" });
  click(card, { action: "stop", entity: "vacuum.aspirateur" });
  assert.equal(hass.calls.length, 1);
  assert.equal((card.events || []).length, 0);
  card._confirmClosedAt -= 1000;
  click(card, { entity: "sensor.aspirateur_batterie" });
  assert.equal(card.events.length, 1, "clicks act again afterwards");
});

test("inlined pictures are not written into the HTML of every render", () => {
  const card = new rr.RoborockCard();
  card.setConfig({ device: "saros", show_map: "never", image: "data:image/png;base64,AAAA" });
  card.hass = makeHass();
  assert.doesNotMatch(card.shadowRoot.innerHTML, /data:image\/png/);
  assert.match(card.shadowRoot.innerHTML, /class="picture clickable" data-entity="vacuum\.aspirateur"><img data-img="\d+" alt="">/);
  card.setConfig({ device: "saros", show_map: "never", image: "/local/robot.png" });
  card.hass = makeHass();
  assert.match(card.shadowRoot.innerHTML, /<img src="\/local\/robot\.png" alt="">/);
});

test("a re-render keeps the popup focus without scrolling the page to the card", () => {
  const hass = makeHass();
  const card = newCard(hass);
  click(card, { action: "routine", entity: "button.routine", label: "Morning" });
  const focusCalls = [];
  card.shadowRoot.querySelector = (sel) => (sel === ".modal .primary" ? { focus: (opts) => focusCalls.push(opts) } : null);
  const batt = "sensor.aspirateur_batterie";
  card.hass = { ...hass, states: { ...states, [batt]: { ...states[batt], state: "41" } } };
  assert.equal(focusCalls.length, 1);
  assert.equal(focusCalls[0]?.preventScroll, true);
});

test("Escape still closes the popup after the card is detached and attached again", () => {
  const hass = makeHass();
  const card = newCard(hass);
  card.connectedCallback();
  click(card, { action: "routine", entity: "button.routine", label: "Morning" });
  card.disconnectedCallback();
  card.connectedCallback();
  assert.match(card.shadowRoot.innerHTML, /dialog-open/);
  rr.window.fire("keydown", { key: "Escape", stopPropagation() {} });
  assert.doesNotMatch(card.shadowRoot.innerHTML, /dialog-open/);
  assert.equal(hass.calls.length, 0);
});

const newMini = (hass, config = {}) => {
  const mini = new rr.RoborockMiniCard();
  mini.setConfig({ device: "saros", show_map: "never", ...config });
  mini.hass = hass;
  mini.connectedCallback();
  return mini;
};

test("the mini card's detail button shows the full card, and back", () => {
  const hass = makeHass();
  const mini = newMini(hass);
  const full = newCard(hass);
  assert.match(mini.shadowRoot.innerHTML, /class="zoom" data-action="zoom" title="Show the full card"/);
  assert.doesNotMatch(mini.shadowRoot.innerHTML, /class="section-title/);
  let stopped = 0;
  mini._onClick({ composedPath: () => [{ dataset: { action: "zoom" } }], stopPropagation: () => stopped++, detail: 1 });
  assert.equal(stopped, 1, "the click does not reach the header");
  assert.equal(hass.calls.length, 0);
  const zoomed = mini.shadowRoot.innerHTML;
  assert.match(zoomed, /title="Back to the compact view"/);
  // Everything the full card shows, same markup, plus the button.
  assert.equal(zoomed.replace(/<button class="zoom"[\s\S]*?<\/button>/, ""), full.shadowRoot.innerHTML);
  assert.equal(mini.getCardSize(), full.getCardSize());
  assert.deepEqual(mini.getGridOptions(), full.getGridOptions());
  click(mini, { action: "zoom" });
  assert.match(mini.shadowRoot.innerHTML, /title="Show the full card"/);
  assert.doesNotMatch(mini.shadowRoot.innerHTML, /class="section-title/);
  assert.equal(mini.getCardSize(), 3);
});

test("a click outside the mini card brings the compact view back, not one inside it or in a dialog", () => {
  const mini = newMini(makeHass());
  click(mini, { action: "zoom" });
  mini._onUnzoom({ composedPath: () => [{ tagName: "BUTTON" }, mini] });
  mini._onUnzoom({ composedPath: () => [{ tagName: "DIV" }, { tagName: "HA-MORE-INFO-DIALOG" }] });
  mini._onUnzoom({ composedPath: () => [{ tagName: "DIV" }, { tagName: "HA-DIALOG" }] });
  assert.equal(mini._zoomed, true);
  assert.match(mini.shadowRoot.innerHTML, /class="section-title/);
  mini._onUnzoom({ composedPath: () => [{ tagName: "DIV" }] });
  assert.equal(mini._zoomed, false);
  assert.doesNotMatch(mini.shadowRoot.innerHTML, /class="section-title/);
});

test("from the keyboard, the focus moves to the new detail button", () => {
  const mini = newMini(makeHass());
  const focused = [];
  mini.shadowRoot.querySelector = (sel) => (sel === ".zoom" ? { focus: () => focused.push(sel) } : null);
  mini._onClick({ composedPath: () => [{ dataset: { action: "zoom" } }], stopPropagation() {}, detail: 0 });
  assert.equal(focused.length, 1);
  mini._onClick({ composedPath: () => [{ dataset: { action: "zoom" } }], stopPropagation() {}, detail: 1 });
  assert.equal(focused.length, 1, "a mouse click leaves the focus alone");
});

test("zoom: false removes the detail button", () => {
  const mini = newMini(makeHass(), { zoom: false });
  assert.doesNotMatch(mini.shadowRoot.innerHTML, /class="zoom"/);
  const full = newCard(makeHass());
  assert.doesNotMatch(full.shadowRoot.innerHTML, /class="zoom"/);
});
