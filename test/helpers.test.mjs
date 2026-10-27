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
  // Renamed devices: the model id gives the commercial name.
  const byModel = (model, kind = "robot") => autoSvg({ kind, rawName: "DustBusters", model });
  assert.equal(byModel("roborock.vacuum.a72"), robotSvg({ white: true, dock: false })); // Q5 Pro
  assert.equal(byModel("roborock.vacuum.a147"), robotSvg({ turret: false })); // Saros 10
  assert.equal(byModel("roborock.vacuum.a65"), robotSvg()); // S7 MaxV Ultra
  assert.equal(byModel("roborock.vacuum.a26"), robotSvg()); // G10S Pro, with its dock
  assert.equal(byModel("roborock.vacuum.a01"), robotSvg({ turret: false, dock: false })); // E4, no LiDAR
  assert.equal(byModel("roborock.vacuum.m1s"), robotSvg({ white: true, dock: false })); // Mi Robot Vacuum 1S
  assert.equal(byModel("xiaomi.vacuum.b108gl"), robotSvg({ white: true, dock: false })); // Xiaomi brand
  assert.equal(byModel("roborock.wetdryvac.a56", "wetdry"), wetdrySvg({ white: false })); // Dyad Pro
  assert.equal(byModel("roborock.vacuum.zz99"), robotSvg({ dock: false })); // unknown model
  // color option: forces white (true) or dark (false) on the automatic picture and the presets.
  assert.equal(autoSvg({ kind: "wetdry", rawName: "Roborock F25 Ultra" }, null, false), wetdrySvg({ white: false }));
  assert.equal(autoSvg({ kind: "robot", rawName: "Roborock Qrevo Curv" }, null, false), robotSvg());
  assert.equal(autoSvg({ kind: "robot", rawName: "Roborock S8 MaxV Ultra" }, null, true), robotSvg({ white: true }));
  assert.equal(IMAGES.f25_ultra(null, false), wetdrySvg({ white: false }));
  assert.equal(IMAGES.saros_20(null, undefined), robotSvg({ turret: false }));
  // Xiaomi models
  assert.equal(byModel("dreame.vacuum.mc1808"), robotSvg({ turret: false, white: true, dock: false })); // Mi 1C
  assert.equal(byModel("mijia.vacuum.v2"), robotSvg({ turret: false, white: true, dock: false })); // Essential G1
  assert.equal(byModel("dreame.vacuum.p2041o"), robotSvg({ white: true })); // Mop 2 Pro+, with its dock
  assert.equal(rr.brandOf("viomi.vacuum.v8"), "xiaomi");
  assert.equal(rr.brandOf("dreame.vacuum.p2009"), null);
  assert.equal(rr.brandOf("dreame.vacuum.p2114a"), "xiaomi"); // Mi Robot Vacuum X10+
  assert.equal(byModel("dreame.vacuum.p2114a"), robotSvg({ white: true })); // with its station
  assert.equal(byModel("xiaomi.vacuum.c102cn"), robotSvg({ white: true })); // Mijia Omni 2
  assert.equal(byModel("roborock.vacuum.a187"), robotSvg({ white: true })); // Qrevo Edge
  // One editor preset per commercial name, labelled with the brand.
  const labels = rr.MODEL_PRESETS.map((p) => p.label);
  assert.equal(new Set(labels).size, labels.length);
  assert.ok(labels.includes("Roborock Q5 Pro") && labels.includes("Xiaomi Mi Robot Vacuum 1S") && labels.includes("Roborock F25 Ultra"));
});

test("the picture animation follows the status, the cleaning mode and the dock drying", () => {
  const { activityOf, robotSvg } = rr;
  assert.equal(activityOf("segment_cleaning", "vacuum"), "vacuum");
  assert.equal(activityOf("cleaning", "vac_and_mop"), "vacmop");
  assert.equal(activityOf("zoned_cleaning", "mop"), "mop");
  assert.equal(activityOf("mopping", "vac_and_mop"), "mop");
  assert.equal(activityOf("cleaning", undefined), "vacuum");
  assert.equal(activityOf("returning_home"), "returning");
  assert.equal(activityOf("going_to_wash_the_mop"), "returning");
  assert.equal(activityOf("washing_the_mop"), "washing");
  assert.equal(activityOf("drying"), "drying");
  assert.equal(activityOf("charging", "vacuum", true), "drying");
  assert.equal(activityOf("cleaning", "vacuum", true), "vacuum"); // out cleaning: the dock flag does not count
  assert.equal(activityOf("charging", "vacuum"), null);
  assert.doesNotMatch(robotSvg(), /<style>/); // at rest: no animation
  assert.match(robotSvg({ activity: "vacuum" }), /class="spin"/);
  assert.match(robotSvg({ activity: "mop" }), /class="drop/);
  assert.match(robotSvg({ activity: "returning" }), /class="home"/);
  assert.match(robotSvg({ activity: "washing" }), /class="bub/);
  assert.match(robotSvg({ activity: "drying" }), /class="heat/);
});
