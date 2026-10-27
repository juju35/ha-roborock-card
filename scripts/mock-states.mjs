// Mock Home Assistant registries and states shaped like the Roborock integration (a Saros 20 with
// its dock and an F25 Ultra) and the Xiaomi Miio integration (a Q5 Pro, and a purifier the cards must skip), used to render screenshots. Entity ids are in French on purpose
// (the cards never rely on them); the names shown are in English.
export const states = {};
export const entities = {};
export const devices = {};

const device = (id, name, model, identifier, domain = "roborock") =>
  (devices[id] = { id, name, model, identifiers: [[domain, identifier]], name_by_user: null });
const entity = (entity_id, device_id, translation_key, state, attributes = {}, platform = "roborock") => {
  entities[entity_id] = { entity_id, device_id, platform, translation_key: translation_key || null };
  states[entity_id] = { entity_id, state: String(state), attributes };
};
const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();

// Floor plan standing in for the map image entity.
const MAP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220">
  <rect width="400" height="220" fill="#1f2a36" rx="12"/>
  <g stroke="#0d141b" stroke-width="3">
    <rect x="20" y="20" width="150" height="110" fill="#4f8fd6"/>
    <rect x="170" y="20" width="110" height="80" fill="#5fb88f"/>
    <rect x="280" y="20" width="100" height="120" fill="#e0a64a"/>
    <rect x="20" y="130" width="90" height="70" fill="#c46a9a"/>
    <rect x="110" y="100" width="170" height="40" fill="#8a96a8"/>
    <rect x="110" y="140" width="120" height="60" fill="#7a73d0"/>
    <rect x="230" y="140" width="150" height="60" fill="#d36b5e"/>
  </g>
  <path d="M40 40h110M40 52h110M40 64h110M40 76h110M40 88h70" stroke="#ffffff" stroke-opacity=".35" stroke-width="6" fill="none"/>
  <circle cx="125" cy="95" r="7" fill="#fff" stroke="#ea0029" stroke-width="3"/>
  <rect x="300" y="125" width="16" height="10" rx="2" fill="#fff"/>
</svg>`;

// Saros 20 + dock
device("saros", "Roborock Saros 20", "roborock.vacuum.a288", "saros");
device("saros_dock", "Roborock Saros 20 Dock", "roborock.vacuum.a288 Dock", "saros_dock");
entity("vacuum.aspirateur", "saros", "roborock", "docked", {
  fan_speed: "turbo",
  fan_speed_list: ["quiet", "balanced", "turbo", "max", "max_plus", "off", "smart_mode", "custom"],
  friendly_name: "Roborock Saros 20",
});
entity("sensor.aspirateur_etat", "saros", "status", "charging");
entity("sensor.aspirateur_batterie", "saros", null, "100", { device_class: "battery", unit_of_measurement: "%" });
entity("sensor.aspirateur_piece_actuelle", "saros", "current_room", "Living room");
entity("sensor.aspirateur_erreur", "saros", "vacuum_error", "none");
entity("sensor.aspirateur_progression", "saros", "clean_percent", "0", { unit_of_measurement: "%" });
entity("sensor.aspirateur_surface", "saros", "cleaning_area", "42.5", { unit_of_measurement: "m²" });
entity("sensor.aspirateur_duree", "saros", "cleaning_time", "38.5", { unit_of_measurement: "min", device_class: "duration" });
entity("sensor.aspirateur_nombre_total", "saros", "total_cleaning_count", "222");
entity("sensor.aspirateur_surface_totale", "saros", "total_cleaning_area", "4087", { unit_of_measurement: "m²" });
entity("sensor.aspirateur_duree_totale", "saros", "total_cleaning_time", "115.48", { unit_of_measurement: "h", device_class: "duration" });
entity("sensor.aspirateur_debut", "saros", "last_clean_start", hoursAgo(20.6), { device_class: "timestamp" });
entity("sensor.aspirateur_fin", "saros", "last_clean_end", hoursAgo(20), { device_class: "timestamp" });
entity("sensor.aspirateur_brosse_principale", "saros", "main_brush_time_left", "296.4", { unit_of_measurement: "h", device_class: "duration" });
entity("sensor.aspirateur_brosse_laterale", "saros", "side_brush_time_left", "192.0", { unit_of_measurement: "h", device_class: "duration" });
entity("sensor.aspirateur_filtre", "saros", "filter_time_left", "146.4", { unit_of_measurement: "h", device_class: "duration" });
entity("sensor.aspirateur_capteurs", "saros", "sensor_time_left", "2.5", { unit_of_measurement: "h", device_class: "duration" });
for (const k of ["main_brush", "side_brush", "air_filter", "sensor"])
  entity(`button.aspirateur_reinitialiser_${k}`, "saros", `reset_${k}_consumable`, "unknown");
entity("button.station_reinitialiser_crepine", "saros_dock", "reset_dock_strainer_consumable", "unknown");
entity("binary_sensor.aspirateur_penurie_d_eau", "saros", "water_shortage", "off");
entity("binary_sensor.aspirateur_nettoyage", "saros", "in_cleaning", "off");
entity("select.aspirateur_mode", "saros", "cleaning_mode", "vac_and_mop", { options: ["vacuum", "vac_and_mop", "mop"] });
entity("select.aspirateur_intensite", "saros", "mop_intensity", "moderate");
entity("select.aspirateur_parcours", "saros", "cleaning_route", "deep_plus");
entity("select.aspirateur_carte", "saros", "selected_map", "Apartment");
entity("image.aspirateur_appartement", "saros", null, hoursAgo(1), {
  friendly_name: "Roborock Saros 20 Apartment",
  entity_picture: `data:image/svg+xml;base64,${Buffer.from(MAP).toString("base64")}`,
});
for (const [slug, name] of [
  ["salon", "Living room"],
  ["cuisine", "Kitchen"],
  ["chambres", "Bedrooms"],
  ["tout", "Whole home"],
])
  entity(`button.aspirateur_${slug}`, "saros", null, "unknown", { friendly_name: `Roborock Saros 20 ${name}` });

entity("sensor.station_erreur", "saros_dock", "dock_error", "ok");
entity("binary_sensor.station_eau_propre", "saros_dock", "clean_box_empty", "off");
entity("binary_sensor.station_eau_sale", "saros_dock", "dirty_box_full", "off");
entity("binary_sensor.station_detergent", "saros_dock", "clean_fluid_empty", "off");
entity("select.station_vidage", "saros_dock", "dust_collection_mode", "smart");
entity("sensor.station_sechage", "saros_dock", "mop_drying_remaining_time", "0", { unit_of_measurement: "s", device_class: "duration" });
entity("switch.station_vidage_de_la_poussiere", "saros_dock", "dust_emptying", "off");
entity("switch.station_lavage_de_la_serpilliere", "saros_dock", "mop_washing", "off");
entity("switch.station_sechage_de_la_serpilliere", "saros_dock", "mop_drying", "off");
entity("sensor.station_crepine", "saros_dock", "strainer_time_left", "59", { unit_of_measurement: "h", device_class: "duration" });

// F25 Ultra
device("f25", "Roborock F25 Ultra", "roborock.wdv.a194", "f25");
entity("sensor.balai_etat", "f25", "a01_status", "charging");
entity("sensor.balai_batterie", "f25", null, "87", { device_class: "battery", unit_of_measurement: "%" });
entity("sensor.balai_erreur", "f25", "a01_error", "none");
entity("sensor.balai_filtre", "f25", "filter_time_left", "95.95", { unit_of_measurement: "h", device_class: "duration" });
entity("sensor.balai_rouleau", "f25", "brush_remaining", "95.95", { unit_of_measurement: "h", device_class: "duration" });
entity("sensor.balai_duree_totale", "f25", "total_cleaning_time", "0.0", { unit_of_measurement: "h", device_class: "duration" });

// Q5 Pro set up with Xiaomi Miio (translation keys of that integration, durations in hours as HA shows them),
// with its map from a Xiaomi Cloud Map Extractor camera, which belongs to no device.
const miio = (entity_id, translation_key, state, attributes = {}) => entity(entity_id, "q5", translation_key, state, attributes, "xiaomi_miio");
device("q5", "Robot vacuum", "roborock.vacuum.a72", "q5", "xiaomi_miio");
miio("vacuum.dustbusters", null, "docked", {
  status: "Charging",
  fan_speed: "Standard",
  fan_speed_list: ["Silent", "Standard", "Medium", "Turbo", "Gentle", "Auto"],
  friendly_name: "Robot vacuum",
});
miio("sensor.dustbusters_battery", null, "100", { device_class: "battery", unit_of_measurement: "%" });
miio("sensor.dustbusters_current_clean_duration", "clean_time", "0.6", { unit_of_measurement: "h", device_class: "duration" });
miio("sensor.dustbusters_current_clean_area", "clean_area", "31.5", { unit_of_measurement: "m²" });
miio("sensor.dustbusters_last_clean_duration", "duration", "2160", { unit_of_measurement: "s", device_class: "duration" });
miio("sensor.dustbusters_total_duration", "total_duration", "677.7", { unit_of_measurement: "h", device_class: "duration" });
miio("sensor.dustbusters_total_clean_area", "total_area", "16921.76", { unit_of_measurement: "m²" });
miio("sensor.dustbusters_total_clean_count", "count", "1182");
miio("sensor.dustbusters_last_clean_start", "last_clean_start", hoursAgo(26.6), { device_class: "timestamp" });
miio("sensor.dustbusters_last_clean_end", "last_clean_end", hoursAgo(26), { device_class: "timestamp" });
miio("sensor.dustbusters_main_brush_remaining", "main_brush_left", "212.4", { unit_of_measurement: "h", device_class: "duration" });
miio("sensor.dustbusters_side_brush_remaining", "side_brush_left", "112.4", { unit_of_measurement: "h", device_class: "duration" });
miio("sensor.dustbusters_filter_remaining", "filter_left", "62.4", { unit_of_measurement: "h", device_class: "duration" });
miio("sensor.dustbusters_sensor_dirty_remaining", "sensor_dirty_left", "-6.5", { unit_of_measurement: "h", device_class: "duration" });
for (const k of ["main_brush", "side_brush", "filter", "sensor_dirty"]) miio(`button.dustbusters_reset_${k}`, `reset_vacuum_${k}`, "unknown");
entities["camera.dustbusters_map"] = { entity_id: "camera.dustbusters_map", device_id: null, platform: "xiaomi_cloud_map_extractor", translation_key: null };
states["camera.dustbusters_map"] = {
  entity_id: "camera.dustbusters_map",
  state: "idle",
  attributes: { friendly_name: "DustBusters map", entity_picture: `data:image/svg+xml;base64,${Buffer.from(MAP).toString("base64")}` },
};
device("purifier", "Air purifier", "zhimi.airpurifier.mb4", "purifier", "xiaomi_miio");
entity("sensor.purificateur_filtre", "purifier", "filter_life_remaining", "80", { unit_of_measurement: "%" }, "xiaomi_miio");

// Same robot while it is cleaning (vacuum + mop), with the mop drying in the dock and the dirty water tank
// full. Picture activity: "vacmop" — the robot sways, its side brushes spin and dust and water trail behind.
export const cleaning = {
  "vacuum.aspirateur": { state: "cleaning" },
  "sensor.aspirateur_etat": { state: "segment_cleaning" },
  "sensor.aspirateur_batterie": { state: "64" },
  "sensor.aspirateur_piece_actuelle": { state: "Kitchen" },
  "sensor.aspirateur_progression": { state: "45" },
  "sensor.aspirateur_surface": { state: "18.2" },
  "sensor.aspirateur_duree": { state: "16" },
  "binary_sensor.station_eau_sale": { state: "on" },
  "switch.station_sechage_de_la_serpilliere": { state: "on" },
  "sensor.station_sechage": { state: "4800" },
  "sensor.station_erreur": { state: "waste_water_tank_full" },
};

// The robot on its way back to the dock, the dock idle. Picture activity: "returning" — the robot slides in
// from the left and settles in front of the dock.
export const returning = {
  "vacuum.aspirateur": { state: "returning" },
  "sensor.aspirateur_etat": { state: "returning_home" },
  "sensor.aspirateur_batterie": { state: "34" },
  "sensor.aspirateur_piece_actuelle": { state: "Hallway" },
  "sensor.aspirateur_progression": { state: "100" },
};

// The robot docked, self-cleaning (washing) its mop. Picture activity: "washing" — blue bubbles rise at the dock.
export const washing = {
  "vacuum.aspirateur": { state: "docked" },
  "sensor.aspirateur_etat": { state: "washing_the_mop" },
  "sensor.aspirateur_batterie": { state: "78" },
  "switch.station_lavage_de_la_serpilliere": { state: "on" },
};

// The robot docked with its mop drying. Picture activity: "drying" — orange heat waves rise at the dock.
export const drying = {
  "vacuum.aspirateur": { state: "docked" },
  "sensor.aspirateur_etat": { state: "drying" },
  "sensor.aspirateur_batterie": { state: "92" },
  "switch.station_sechage_de_la_serpilliere": { state: "on" },
  "sensor.station_sechage": { state: "3600" },
};

// The F25 Ultra wet-dry vacuum mid-clean. Picture activity: "vacuum" — the body rocks (tilt) and the floor
// roller turns (roll); those two keyframes only ever play for a wet-dry vacuum.
export const f25Cleaning = {
  "sensor.balai_etat": { state: "cleaning" },
  "sensor.balai_batterie": { state: "54" },
};

// Response of the roborock.get_maps service, used by the room selector.
export const maps = {
  "vacuum.aspirateur": {
    maps: [
      {
        flag: 0,
        name: "Apartment",
        rooms: { 1: "Guest room", 2: "Living room", 3: "Kids' room", 4: "Hallway", 5: "Entrance", 6: "Main bedroom", 7: "Bathroom", 8: "Toilet", 9: "Dining room", 11: "Kitchen" },
      },
    ],
  },
};
