// Mock Home Assistant registries and states shaped like the Roborock integration (a Saros 20 with
// its dock and an F25 Ultra), used to render screenshots. Entity ids are in French on purpose:
// the cards never rely on them.
export const states = {};
export const entities = {};
export const devices = {};

const device = (id, name, model, identifier) => (devices[id] = { id, name, model, identifiers: [["roborock", identifier]], name_by_user: null });
const entity = (entity_id, device_id, translation_key, state, attributes = {}) => {
  entities[entity_id] = { entity_id, device_id, platform: "roborock", translation_key: translation_key || null };
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
entity("sensor.aspirateur_piece_actuelle", "saros", "current_room", "Salon");
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
entity("binary_sensor.aspirateur_penurie_d_eau", "saros", "water_shortage", "off");
entity("binary_sensor.aspirateur_nettoyage", "saros", "in_cleaning", "off");
entity("select.aspirateur_mode", "saros", "cleaning_mode", "vac_and_mop", { options: ["vacuum", "vac_and_mop", "mop"] });
entity("select.aspirateur_intensite", "saros", "mop_intensity", "moderate");
entity("select.aspirateur_parcours", "saros", "cleaning_route", "deep_plus");
entity("select.aspirateur_carte", "saros", "selected_map", "Appartement");
entity("image.aspirateur_appartement", "saros", null, hoursAgo(1), {
  friendly_name: "Roborock Saros 20 Appartement",
  entity_picture: `data:image/svg+xml;base64,${Buffer.from(MAP).toString("base64")}`,
});
for (const [slug, name] of [
  ["salon", "Salon"],
  ["cuisine", "Cuisine"],
  ["chambres", "Chambres"],
  ["tout", "Toute la maison"],
])
  entity(`button.aspirateur_${slug}`, "saros", null, "unknown", { friendly_name: `Roborock Saros 20 ${name}` });

entity("sensor.station_erreur", "saros_dock", "dock_error", "ok");
entity("binary_sensor.station_eau_propre", "saros_dock", "clean_box_empty", "off");
entity("binary_sensor.station_eau_sale", "saros_dock", "dirty_box_full", "off");
entity("binary_sensor.station_detergent", "saros_dock", "clean_fluid_empty", "off");
entity("select.station_vidage", "saros_dock", "dust_collection_mode", "smart");
entity("sensor.station_sechage", "saros_dock", "mop_drying_remaining_time", "0", { unit_of_measurement: "s", device_class: "duration" });
entity("sensor.station_crepine", "saros_dock", "strainer_time_left", "59", { unit_of_measurement: "h", device_class: "duration" });

// F25 Ultra
device("f25", "Roborock F25 Ultra", "roborock.wdv.a194", "f25");
entity("sensor.balai_etat", "f25", "a01_status", "charging");
entity("sensor.balai_batterie", "f25", null, "87", { device_class: "battery", unit_of_measurement: "%" });
entity("sensor.balai_erreur", "f25", "a01_error", "none");
entity("sensor.balai_filtre", "f25", "filter_time_left", "95.95", { unit_of_measurement: "h", device_class: "duration" });
entity("sensor.balai_rouleau", "f25", "brush_remaining", "95.95", { unit_of_measurement: "h", device_class: "duration" });
entity("sensor.balai_duree_totale", "f25", "total_cleaning_time", "12.4", { unit_of_measurement: "h", device_class: "duration" });

// Same robot while it is cleaning, with the mop drying in the dock and the dirty water tank full.
export const cleaning = {
  "vacuum.aspirateur": { state: "cleaning" },
  "sensor.aspirateur_etat": { state: "segment_cleaning" },
  "sensor.aspirateur_batterie": { state: "64" },
  "sensor.aspirateur_piece_actuelle": { state: "Cuisine" },
  "sensor.aspirateur_progression": { state: "45" },
  "sensor.aspirateur_surface": { state: "18.2" },
  "sensor.aspirateur_duree": { state: "16" },
  "binary_sensor.station_eau_sale": { state: "on" },
  "sensor.station_erreur": { state: "waste_water_tank_full" },
};
