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
    assert.match(html, /class="picture clickable" data-entity="vacuum\.aspirateur"><img src="/);
  }
});
