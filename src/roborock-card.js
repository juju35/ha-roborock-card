/*
 * Roborock Card for Home Assistant
 * https://github.com/juju35/ha-roborock-card
 *
 * Lovelace cards for the Roborock integration (https://www.home-assistant.io/integrations/roborock/).
 * Entities are resolved through the entity and device registries (platform, translation_key and
 * device), so they work whatever the Home Assistant language or entity ids.
 */

const VERSION = "__VERSION__";
const IMG_LOGO = "__IMG_LOGO__";
const IMAGES = {
  saros_20: "__IMG_SAROS_20__",
  f25_ultra: "__IMG_F25_ULTRA__",
};
const ROBOROCK_SITE = "https://www.roborock.com";

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
    no_device: "No Roborock device found. Is the Roborock integration installed?",
    unknown_device: "Roborock device not found",
    no_registry: "This card needs Home Assistant 2023.4 or later.",
    // Editor
    device: "Roborock device",
    title: "Title (optional, defaults to the device name)",
    image: "Device picture",
    image_auto: "Automatic (per model)",
    image_none: "None",
    show_logo: "Show Roborock logo",
    show_controls: "Show control buttons",
    show_modes: "Show cleaning settings",
    show_routines: "Show routines",
    show_dock: "Show dock",
    show_consumables: "Show maintenance",
    show_stats: "Show statistics",
    show_map: "Show map",
    map_never: "Never",
    map_cleaning: "While cleaning",
    map_always: "Always",
    language: "Language",
    lang_auto: "Automatic",
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
    no_device: "Aucun appareil Roborock trouvé. L'intégration Roborock est-elle installée ?",
    unknown_device: "Appareil Roborock introuvable",
    no_registry: "Cette carte nécessite Home Assistant 2023.4 ou plus récent.",
    device: "Appareil Roborock",
    title: "Titre (facultatif, nom de l'appareil par défaut)",
    image: "Image de l'appareil",
    image_auto: "Automatique (selon le modèle)",
    image_none: "Aucune",
    show_logo: "Afficher le logo Roborock",
    show_controls: "Afficher les boutons de commande",
    show_modes: "Afficher les réglages de nettoyage",
    show_routines: "Afficher les routines",
    show_dock: "Afficher la station",
    show_consumables: "Afficher l'entretien",
    show_stats: "Afficher les statistiques",
    show_map: "Afficher la carte",
    map_never: "Jamais",
    map_cleaning: "Pendant le nettoyage",
    map_always: "Toujours",
    language: "Langue",
    lang_auto: "Automatique",
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
  const l = (config && config.language) || (hass && (hass.locale?.language || hass.language)) || "en";
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

const fmtHours = (h) => {
  if (h === null || h === undefined) return "—";
  if (h <= 0) return "0 h";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 10) {
    const m = Math.round((h % 1) * 60);
    return m ? `${Math.floor(h)} h ${String(m).padStart(2, "0")}` : `${Math.floor(h)} h`;
  }
  return `${Math.round(h)} h`;
};

const fmtNum = (v, digits = 0, locale) => (v === null ? "—" : Number(v).toLocaleString(locale, { maximumFractionDigits: digits }));

const ago = (hass, config, iso) => {
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return null;
  const diff = (d - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(lang(hass, config), { numeric: "auto" });
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
    if (e.platform !== "roborock" || !e.device_id || e.hidden) continue;
    const domain = e.entity_id.split(".")[0];
    const item = byDevice.get(e.device_id) || { entities: {}, extra: {} };
    if (e.translation_key && e.translation_key !== "map") {
      if (!(e.translation_key in item.entities)) item.entities[e.translation_key] = e.entity_id;
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
    if (isDock(d)) docks.push({ d, item });
    else {
      const vacuum = item.entities.roborock || item.entities._vacuum;
      const kind = vacuum && vacuum.startsWith("vacuum.") ? "robot" : /\.wdv\./.test(d.model || "") ? "wetdry" : "other";
      devices.push({ id, name: devName(d), rawName: d.name, model: d.model, kind, vacuum, entities: item.entities, extra: item.extra, dock: {} });
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
  :host { --rr-red: #ea0029; --rr-ok: var(--success-color, #43a047); --rr-warn: var(--warning-color, #ffa000);
          --rr-crit: var(--error-color, #db4437); --rr-idle: var(--disabled-text-color, #9e9e9e); --rr-active: var(--info-color, #039be5); }
  ha-card { overflow: hidden; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  .ok { --c: var(--rr-ok); } .warn { --c: var(--rr-warn); } .crit { --c: var(--rr-crit); } .idle { --c: var(--rr-idle); } .active { --c: var(--rr-active); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c, var(--rr-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--rr-ok)) 15%, transparent); color: var(--c, var(--rr-ok)); flex: none; }
  .bar { height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--rr-ok)); transition: width .6s ease; }
  .header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 8px; }
  .logo { height: 40px; width: auto; flex: none; }
  a.logo-link { display: flex; flex: none; }
  .titles { flex: 1; min-width: 0; }
  .name { font-size: 18px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: var(--rr-warn); }
  .alert-line { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--c, var(--rr-crit)); }
  .alert-line .icon { width: 16px; height: 16px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 7px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn:hover { background: color-mix(in srgb, var(--rr-red) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn.primary { background: var(--rr-red); color: #fff; }
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
          background: transparent; border: 1px solid var(--divider-color, rgba(127,127,127,.35)); }
  .room.on { background: color-mix(in srgb, var(--rr-red) 14%, transparent); border-color: var(--rr-red); color: var(--rr-red); font-weight: 500; }
  .room.all { color: var(--secondary-text-color); }
  .room.all.on { color: var(--rr-red); }
  .rooms-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
`;

class RoborockBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._html = "";
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
    const html = this._render();
    if (html !== this._html) {
      this._html = html;
      this.shadowRoot.innerHTML = html;
    }
  }

  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!el) return;
    ev.stopPropagation();
    const { action, entity, label } = el.dataset;
    if (this._roomAction(action, entity, el.dataset.room)) return;
    if (action === "reset") {
      if (window.confirm(this._t("confirm_reset", { name: label }))) this._hass.callService("button", "press", { entity_id: entity });
    } else if (action === "routine") {
      if (window.confirm(this._t("run_routine", { name: label }))) this._hass.callService("button", "press", { entity_id: entity });
    } else if (action) {
      this._hass.callService("vacuum", action, { entity_id: entity });
    } else if (entity) {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
    }
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
      } catch (e) {
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
    return null;
  }

  _picture(dev) {
    const img = this._config.image;
    if (img === "none") return null;
    if (img && IMAGES[img]) return IMAGES[img];
    if (img && img !== "auto") return img;
    return dev.kind === "wetdry" ? IMAGES.f25_ultra : dev.kind === "robot" ? IMAGES.saros_20 : null;
  }

  _header(dev, status, sub) {
    const c = this._config;
    return `
      <div class="header">
        ${
          c.show_logo !== false
            ? `<a class="logo-link" href="${ROBOROCK_SITE}" target="_blank" rel="noopener noreferrer" title="Roborock"><img class="logo" src="${IMG_LOGO}" alt="Roborock"></a>`
            : ""
        }
        <div class="titles">
          <div class="name">${esc(c.title || dev.name)}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${
          status
            ? `<span class="chip clickable ${statusClass(status.state)}" data-entity="${status.entity}"><span class="dot"></span>${esc(status.text)}</span>`
            : ""
        }
      </div>`;
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
      `<button class="btn ${round ? "round" : ""} ${cls}" title="${esc(label)}" data-action="${action}" data-entity="${vac.entity_id}">${svgIcon(icon)}${
        round ? "" : `<span>${esc(label)}</span>`
      }</button>`;
    const list = [
      cleaning
        ? btn("pause", ICONS.pause, this._t("pause"), "primary")
        : btn(this._config.room_selection !== false && vac.state !== "paused" ? "open_rooms" : "start", ICONS.play, this._t("start"), "primary"),
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
        this._hass.callService("vacuum", "send_command", {
          entity_id: entity,
          command: "app_segment_clean",
          params: [{ segments: r.selected.map(Number) }],
        });
        this._rooms = null;
        this._update();
        return true;
      case "clean_all":
        this._hass.callService("vacuum", "start", { entity_id: entity });
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
    } catch (e) {
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
        <button class="room all ${r.selected.length === r.list.length ? "on" : ""}" data-action="all_rooms" data-entity="${dev.vacuum}">${esc(this._t("select_all"))}</button>
        ${r.list
          .map(
            (x) =>
              `<button class="room ${r.selected.includes(x.id) ? "on" : ""}" data-action="toggle_room" data-entity="${dev.vacuum}" data-room="${esc(x.id)}">${esc(x.name)}</button>`
          )
          .join("")}
      </div>`;
    return `<div class="rooms">
      <div class="rooms-title">${svgIcon(ICONS.room)}${esc(this._t("choose_rooms"))}</div>
      ${body}
      <div class="rooms-actions">
        <button class="btn" data-action="close_rooms" data-entity="${dev.vacuum}"><span>${esc(this._t("cancel"))}</span></button>
        <button class="btn" data-action="clean_all" data-entity="${dev.vacuum}">${svgIcon(ICONS.home)}<span>${esc(this._t("whole_home"))}</span></button>
        <button class="btn primary ${r.selected.length ? "" : "disabled"}" data-action="clean_rooms" data-entity="${dev.vacuum}" ${
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
  .content { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 16px; }
  .hero { display: flex; gap: 16px; align-items: center; }
  .picture { width: 120px; height: 132px; flex: none; display: flex; align-items: center; justify-content: center; }
  .picture img { max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,.18)); }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
  .batt { display: flex; align-items: center; gap: 8px; }
  .batt .pct { font-size: 28px; font-weight: 400; line-height: 1; }
  .batt .pct small { font-size: 16px; margin-left: 2px; color: var(--secondary-text-color); }
  .batt .icon { color: var(--c); }
  .batt .bolt { color: var(--rr-ok); width: 20px; height: 20px; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 16px; height: 16px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 3px 8px; border-radius: 8px;
         background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); white-space: nowrap; }
  .tag .icon { width: 14px; height: 14px; color: var(--secondary-text-color); }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; }
  .controls .btn { flex: 1 1 auto; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 8px; }
  .section-title .icon { width: 16px; height: 16px; }
  .routines { display: flex; flex-wrap: wrap; gap: 8px; }
  .routines .btn { font-weight: 400; padding: 6px 12px 6px 8px; }
  .routines .btn .icon { color: var(--rr-red); }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); gap: 8px; }
  .tiles.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tile { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .tile .k { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .k .icon { width: 14px; height: 14px; color: var(--c, var(--secondary-text-color)); }
  .tile .v { font-size: 15px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .tile.warn .v, .tile.crit .v { color: var(--c); }
  .cons { display: grid; grid-template-columns: 18px minmax(0, 1fr) 90px 56px; align-items: center; gap: 4px 10px; font-size: 13px; }
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
    const pic = this._picture(dev);
    const batt = this._battery(dev);
    const { v, cls } = this._batteryLevel(batt);
    const status = this._status(dev);
    const charging = /charg/.test(status?.state || "") && !/problem|complete/.test(status?.state || "");
    const lines = [];

    const room = this._s(e.current_room);
    if (valid(room)) lines.push(`<div class="line clickable" data-entity="${room.entity_id}">${svgIcon(ICONS.room)}<span>${esc(room.state)}</span></div>`);

    if (statusClass(status?.state) === "active") {
      const pct = num(this._s(e.clean_percent));
      const area = num(this._s(e.cleaning_area));
      const time = hours(this._s(e.cleaning_time));
      const bits = [pct ? `${this._t("progress")} ${Math.round(pct)} %` : null, area !== null ? `${fmtNum(area, 1, this._locale())} m²` : null, time !== null ? fmtHours(time) : null];
      if (bits.some(Boolean))
        lines.push(`<div class="line clickable" data-entity="${e.clean_percent || e.cleaning_area || ""}">${svgIcon(ICONS.clock)}<span>${esc(bits.filter(Boolean).join(" · "))}</span></div>`);
    }

    const err = this._error(dev);
    if (err) lines.push(`<div class="alert-line crit clickable" data-entity="${err.entity}">${svgIcon(ICONS.alert)}<span>${esc(err.text)}</span></div>`);

    if (this._config.show_modes !== false) {
      const tags = [];
      const tag = (id, icon, text) => (text ? `<span class="tag clickable" data-entity="${id}">${svgIcon(icon)}${esc(text)}</span>` : "");
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
      ${pic ? `<div class="picture clickable" data-entity="${dev.vacuum || status?.entity || ""}"><img src="${esc(pic)}" alt=""></div>` : ""}
      <div class="info">
        ${
          batt
            ? `<div class="batt clickable ${cls}" data-entity="${batt.entity_id}">
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
      <div class="section-title">${svgIcon(ICONS.routine)}${esc(this._t("routines"))}</div>
      <div class="routines">${items
        .map((r) => `<button class="btn" data-action="routine" data-entity="${r.id}" data-label="${esc(r.name)}">${svgIcon(ICONS.routine)}<span>${esc(r.name)}</span></button>`)
        .join("")}</div>
    </div>`;
  }

  _tile(id, icon, label, value, cls = "") {
    return `<div class="tile clickable ${cls}" data-entity="${id || ""}"><div class="k">${svgIcon(icon)}${esc(label)}</div><div class="v">${esc(value)}</div></div>`;
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
    const dry = this._s(d.mop_drying_remaining_time);
    const dryH = hours(dry);
    if (dryH > 0) tiles.push(this._tile(dry.entity_id, ICONS.fan, this._t("drying"), fmtHours(dryH), "active"));
    if (!tiles.length) return "";
    return `<div>
      <div class="section-title">${svgIcon(ICONS.dock)}${esc(this._t("station"))}</div>
      <div class="tiles">${tiles.join("")}</div>
    </div>`;
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
        ${svgIcon(icon)}<span class="lbl clickable" data-entity="${s.entity_id}">${esc(this._t(label))}</span>
        ${pct !== null ? `<div class="bar ${cls}"><div style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>` : `<div class="nobar"></div>`}
        <span class="v clickable ${cls}" data-entity="${s.entity_id}">${esc(text)}</span>
        ${resets ? this._resetButton(dev, resetKey, label) : ""}`);
    }
    if (!rows.length) return "";
    return `<div>
      <div class="section-title">${svgIcon(ICONS.brush)}${esc(this._t("consumables"))}</div>
      <div class="cons ${resets ? "with-reset" : ""}">${rows.join("")}</div>
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
    return `<button class="reset" title="${esc(this._t("reset"))}" data-action="reset" data-entity="${id}" data-label="${esc(this._t(label))}">${svgIcon(ICONS.reset)}</button>`;
  }

  _stats(dev) {
    const e = dev.entities;
    const tiles = [];
    const area = this._s(e.cleaning_area);
    const time = this._s(e.cleaning_time);
    if (valid(area) || valid(time)) {
      const bits = [valid(area) ? `${fmtNum(num(area), 1, this._locale())} m²` : null, valid(time) ? fmtHours(hours(time)) : null].filter(Boolean);
      tiles.push(this._tile((area || time).entity_id, ICONS.clock, this._t("last_clean"), bits.join(" · ")));
    }
    const count = this._s(e.total_cleaning_count);
    if (valid(count)) tiles.push(this._tile(count.entity_id, ICONS.count, this._t("total_count"), fmtNum(num(count), 0, this._locale())));
    const tArea = this._s(e.total_cleaning_area);
    if (valid(tArea)) tiles.push(this._tile(tArea.entity_id, ICONS.area, this._t("total_area"), `${fmtNum(num(tArea), 0, this._locale())} m²`));
    const tTime = this._s(e.total_cleaning_time);
    if (valid(tTime)) tiles.push(this._tile(tTime.entity_id, ICONS.clock, this._t("total_time"), fmtHours(hours(tTime))));
    if (!tiles.length) return "";
    return `<div>
      <div class="section-title">${svgIcon(ICONS.stats)}${esc(this._t("statistics"))}</div>
      <div class="tiles two">${tiles.join("")}</div>
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
    const maps = (dev.extra.image || []).map((id) => this._s(id)).filter((s) => s?.attributes?.entity_picture);
    if (!maps.length) return "";
    const selected = this._s(dev.entities.selected_map)?.state;
    const map = (selected && maps.find((s) => (s.attributes.friendly_name || "").endsWith(selected))) || maps[0];
    return `<div class="map clickable" data-entity="${map.entity_id}"><img src="${esc(map.attributes.entity_picture)}" alt="${esc(this._t("map"))}"></div>`;
  }
}

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  .header { padding: 12px 12px 4px; }
  .logo { height: 32px; }
  .name { font-size: 16px; }
  .content { padding: 4px 12px 12px; display: flex; align-items: center; gap: 12px; }
  .picture { width: 64px; height: 72px; flex: none; display: flex; align-items: center; justify-content: center; }
  .picture img { max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,.18)); }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .batt { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .batt .icon { color: var(--c); width: 16px; height: 16px; }
  .batt .bar { flex: 1; }
  .batt .v { font-weight: 500; min-width: 40px; text-align: right; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 14px; height: 14px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .controls { display: flex; gap: 6px; flex: none; }
  .rooms-wrap { padding: 0 12px 12px; }
`;

class RoborockMiniCard extends RoborockBase {
  static getConfigElement() {
    return document.createElement("roborock-mini-card-editor");
  }

  static getStubConfig(hass) {
    return RoborockCard.getStubConfig(hass);
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 6 };
  }

  _render() {
    const { dev, error } = findDevice(this._hass, this._config);
    if (error) return this._errorCard(error);
    this._dev = dev;
    const e = dev.entities;
    const status = this._status(dev);
    const pic = this._picture(dev);
    const batt = this._battery(dev);
    const { v, cls } = this._batteryLevel(batt);
    const lines = [];
    const err = this._error(dev);
    if (err) lines.push(`<div class="alert-line crit clickable" data-entity="${err.entity}">${svgIcon(ICONS.alert)}<span>${esc(err.text)}</span></div>`);
    const room = this._s(e.current_room);
    if (valid(room)) lines.push(`<div class="line clickable" data-entity="${room.entity_id}">${svgIcon(ICONS.room)}<span>${esc(room.state)}</span></div>`);
    const last = this._lastClean(dev);
    if (last) lines.push(`<div class="line">${svgIcon(ICONS.clock)}<span>${esc(last)}</span></div>`);
    return `<style>${BASE_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._header(dev, status, "")}
        <div class="content">
          ${pic ? `<div class="picture clickable" data-entity="${dev.vacuum || status?.entity || ""}"><img src="${esc(pic)}" alt=""></div>` : ""}
          <div class="info">
            ${
              batt
                ? `<div class="batt clickable ${cls}" data-entity="${batt.entity_id}">${svgIcon(ICONS.battery)}<div class="bar ${cls}"><div style="width:${
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
              { value: "saros_20", label: "Saros 20" },
              { value: "f25_ultra", label: "F25 Ultra" },
              { value: "none", label: tr("image_none") },
            ],
          },
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
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = { ...Object.fromEntries(toggles), image: "auto", ...this.constructor.selects };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and options left at their default.
          if (v === "" || v === undefined || v === null || (k in defaults && v === defaults[k])) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { image: "auto", ...this.constructor.selects, ...this._config };
    if (data.show_map === true) data.show_map = "always";
    if (data.show_map === false) data.show_map = "never";
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    if (!data.device) data.device = RoborockCard.getStubConfig(this._hass).device;
    this._form.hass = this._hass;
    this._form.data = data;
    this._form.schema = this._schema();
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
    return { show_map: "cleaning" };
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
    ];
  }
}

class RoborockMiniCardEditor extends RoborockEditorBase {
  static get toggles() {
    return [
      ["show_controls", true],
      ["room_selection", true],
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
