import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const rr = load();

test("fmtHours carries rounded minutes over to the hours", () => {
  assert.equal(rr.fmtHours(1.995), "2 h");
  assert.equal(rr.fmtHours(9.996), "10 h");
  assert.equal(rr.fmtHours(0.999), "1 h");
  assert.equal(rr.fmtHours(0.9999), "1 h");
});

test("fmtHours keeps its other formats", () => {
  assert.equal(rr.fmtHours(null), "—");
  assert.equal(rr.fmtHours(0), "0 h");
  assert.equal(rr.fmtHours(0.001), "1 min");
  assert.equal(rr.fmtHours(0.5), "30 min");
  assert.equal(rr.fmtHours(1), "1 h");
  assert.equal(rr.fmtHours(2.5), "2 h 30");
  assert.equal(rr.fmtHours(1.05), "1 h 03");
  assert.equal(rr.fmtHours(12.4), "12 h");
});

test("hours converts duration units", () => {
  const s = (state, unit) => ({ state, attributes: { unit_of_measurement: unit } });
  assert.equal(rr.hours(s("90", "min")), 1.5);
  assert.equal(rr.hours(s("7200", "s")), 2);
  assert.equal(rr.hours(s("1", "d")), 24);
  assert.equal(rr.hours(s("3", "h")), 3);
  assert.equal(rr.hours(s("unknown", "h")), null);
});

test("statusClass maps states to colors", () => {
  assert.equal(rr.statusClass("error"), "crit");
  assert.equal(rr.statusClass("paused"), "warn");
  assert.equal(rr.statusClass("segment_cleaning"), "active");
  assert.equal(rr.statusClass("charging"), "ok");
  assert.equal(rr.statusClass("idle"), "idle");
});

test("esc escapes text and attribute values", () => {
  assert.equal(rr.esc(`<b title="x">'&`), "&lt;b title=&quot;x&quot;&gt;&#39;&amp;");
});

test("resolve merges the dock into its robot", () => {
  const model = rr.resolve({ entities, devices, states });
  const saros = model.devices.find((d) => d.id === "saros");
  assert.equal(saros.vacuum, "vacuum.aspirateur");
  assert.ok(Object.keys(saros.dock).length > 0);
  assert.ok(!model.devices.some((d) => d.id === "saros_dock"));
});
