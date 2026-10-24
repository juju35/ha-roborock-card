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
