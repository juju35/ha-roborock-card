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

test("the device picture follows the model, the image option overrides it", () => {
  const { autoSvg, IMAGES, robotSvg, wetdrySvg } = rr;
  const robot = (name, dock = {}) => autoSvg({ kind: "robot", rawName: name, dock });
  assert.equal(robot("Roborock Saros 20"), robotSvg({ turret: false }));
  assert.equal(robot("Roborock S8 MaxV Ultra"), robotSvg());
  assert.equal(robot("Roborock Qrevo Curv"), robotSvg({ white: true }));
  assert.equal(robot("Roborock Q7 Max"), robotSvg({ white: true, dock: false }));
  assert.equal(robot("Roborock S6", { dock_error: "sensor.x" }), robotSvg()); // dock reported by the integration
  assert.equal(robot("Roborock S5 Max"), robotSvg({ dock: false }));
  assert.equal(autoSvg({ kind: "wetdry", rawName: "Roborock F25 Ultra" }), wetdrySvg());
  assert.equal(autoSvg({ kind: "wetdry", rawName: "Roborock Dyad Pro" }), wetdrySvg({ white: false }));
  assert.equal(autoSvg({ kind: "other", rawName: "Roborock Saros 20 Dock" }), null);
  assert.equal(IMAGES.f25_ultra(), wetdrySvg());
});
