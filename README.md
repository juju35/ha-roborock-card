# Vacuum Card

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-vacuum-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-vacuum-card/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-vacuum-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-vacuum-card/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-vacuum-card)](https://github.com/juju35/ha-vacuum-card/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <img src="images/logo.svg" alt="Roborock" width="64">&nbsp;&nbsp;
  <img src="images/xiaomi.png" alt="Xiaomi" width="64">&nbsp;&nbsp;
  <img src="images/mihome.png" alt="Xiaomi Mi Home" width="64">&nbsp;&nbsp;
  <img src="images/dreame.png" alt="Dreame" width="64">&nbsp;&nbsp;
  <img src="images/ecovacs.png" alt="Ecovacs" width="64">&nbsp;&nbsp;
  <img src="images/dyson.png" alt="Dyson" width="64">
</p>

Lovelace cards for Home Assistant to monitor and control robot vacuums and wet-dry vacuums from **[Roborock](https://www.roborock.com)**, **Xiaomi / Mijia**, **[Dreame](https://www.dreametech.com)**, **[Ecovacs](https://www.ecovacs.com)** and **[Dyson](https://www.dyson.com)**: status, battery, room, maintenance, statistics and map at a glance, plus rooms, routines and dock for Roborock.

The cards work on top of the integrations you already use — [Roborock](https://www.home-assistant.io/integrations/roborock/), [Xiaomi Miio](https://www.home-assistant.io/integrations/xiaomi_miio/), [Xiaomi Home](https://github.com/XiaoMi/ha_xiaomi_home), [Dreame Vacuum](https://github.com/Tasshack/dreame-vacuum), [Ecovacs](https://www.home-assistant.io/integrations/ecovacs/) and [Dyson](https://github.com/libdyson-wg/ha-dyson). Entities are **discovered automatically** from the Home Assistant registries: you don't pick them one by one, and it works whatever your Home Assistant language or entity ids. The logo, the button color and the drawn picture follow the brand and the model of each robot.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-vacuum-card&category=plugin)

| <img src="images/logo.svg" alt="" width="20"> Roborock | <img src="images/xiaomi.png" alt="" width="20"> Xiaomi | <img src="images/dreame.png" alt="" width="20"> Dreame |
|---|---|---|
| ![roborock card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/card.png) | ![xiaomi card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/card-xiaomi.png) | ![dreame card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/card-dreame.png) |
| ![roborock mini card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/mini-card.png) | ![xiaomi mini card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/mini-card-xiaomi.png) | ![dreame mini card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/mini-card-dreame.png) |

| <img src="images/ecovacs.png" alt="" width="20"> Ecovacs | <img src="images/dyson.png" alt="" width="20"> Dyson |
|---|---|
| ![ecovacs card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/card-ecovacs.png) | ![dyson card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/card-dyson.png) |
| ![ecovacs mini card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/mini-card-ecovacs.png) | ![dyson mini card](https://raw.githubusercontent.com/juju35/ha-vacuum-card/main/screenshots/mini-card-dyson.png) |

## Supported integrations

| Integration | Brands | What the cards show |
|---|---|---|
| <img src="images/logo.svg" alt="" width="16"> [Roborock](https://www.home-assistant.io/integrations/roborock/) (core) | Roborock, Mi Robot Vacuum (1S…) | Everything: status, room, progress, modes, controls, **room selector**, **routines**, **dock**, maintenance with reset, statistics, map |
| <img src="images/mihome.png" alt="" width="16"> [Xiaomi Miio](https://www.home-assistant.io/integrations/xiaomi_miio/) (core) | Roborock and Xiaomi robots paired with Mi Home | Status, errors, fan speed, controls, maintenance with reset, statistics; map with `map_entity` |
| <img src="images/xiaomi.png" alt="" width="16"> [Xiaomi Home](https://github.com/XiaoMi/ha_xiaomi_home) (custom) | Xiaomi / Mijia robots | Vacuum (status, fan speed, controls) and battery |
| <img src="images/dreame.png" alt="" width="16"> [Dreame Vacuum](https://github.com/Tasshack/dreame-vacuum) (custom) | Dreame, Xiaomi / Mijia robots built by Dreame | Status, room, progress, errors, controls, maintenance (mop included) with reset, statistics, map |
| <img src="images/ecovacs.png" alt="" width="16"> [Ecovacs](https://www.home-assistant.io/integrations/ecovacs/) (core) | Ecovacs DEEBOT | Status, errors, cleaning mode and water amount, controls, maintenance in % (mop included) with reset, statistics, map |
| <img src="images/dyson.png" alt="" width="16"> [Dyson](https://github.com/libdyson-wg/ha-dyson) (custom, `dyson_local`) | Dyson 360 Eye, 360 Heurist, 360 Vis Nav | Vacuum (status, power mode, controls) and battery |

Only the vacuums of these integrations are listed: their other devices (purifiers, lamps, mowers…) are skipped. Details in [Integrations](#integrations).

## Features

- Two cards: a full **Vacuum Card** (`custom:vacuum-card`) and a compact **Vacuum Mini Card** (`custom:vacuum-mini-card`)
- Robot vacuums and wet-dry vacuums, several devices supported, Roborock dock merged with its robot
- Drawn device picture that follows the model (about 120 Roborock, Xiaomi / Mijia, Dreame, Ecovacs and Dyson models recognized from their model id, even when the device was renamed), animated by what the robot is doing, white or dark (`color`), or your own picture
- Brand logo (Roborock, Xiaomi, Mi Home, Dreame, Ecovacs or Dyson) opening the brand's site, and buttons in the brand's color, readable in the light and dark themes
- Battery (sensor, or the vacuum's attribute when the integration has no sensor), status, current room, cleaning progress and errors
- Cleaning settings: mode, suction power, mop intensity and route
- Start / pause, stop, return to dock and locate buttons
- Maintenance: main brush, side brush, filter, sensors, mop, dock strainer… with remaining time or percentage, and a reset button (with confirmation) when the integration provides one
- Statistics: last clean, number of cleanings, total area and time
- Map of the current floor while the robot is cleaning (or always, or never), with optional cropping, enlarged full screen on click; any camera or image entity can be used (`map_entity`)
- Roborock: room selector on the Start button, routines of the Roborock app as one-tap buttons, dock (water tanks, detergent, auto-empty mode, mop drying, Empty bin / Wash mop / Dry mop buttons)
- Collapsible sections (statistics and dock folded by default)
- Detail button on the mini card (top right): it switches the mini card to the full card's content and back; a click anywhere outside the card brings the compact view back
- Click any value to open its Home Assistant history (more-info dialog)
- Visual editor in the dashboard UI for both cards (no YAML needed)
- Light and dark mode, English and French
- Single file, no external dependency, the logos and pictures are embedded

## Prerequisites

Home Assistant 2024.8 or later, with at least one of the [supported integrations](#supported-integrations) configured.

## Installation

### Via HACS (recommended)

Click the button below to add the repository directly:

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-vacuum-card&category=plugin)

Then click **Download**, and reload your browser when HACS asks you to.

Or manually:

1. Open HACS → **⋮** (top right) → **Custom repositories**
2. Add `https://github.com/juju35/ha-vacuum-card` — Type: **Dashboard**
3. Search for **Vacuum Card** and click **Download**
4. Clear your browser cache and refresh

### Manual

1. Download `vacuum-card.js` from the [latest release](https://github.com/juju35/ha-vacuum-card/releases/latest)
2. Copy it to `/config/www/vacuum-card.js`
3. Go to **Settings → Dashboards → ⋮ → Resources** → Add resource:
   - URL: `/local/vacuum-card.js`
   - Type: **JavaScript Module**
4. Clear your browser cache and refresh

### Upgrading from ha-roborock-card (1.x)

The repository was renamed from `ha-roborock-card` to `ha-vacuum-card` (GitHub redirects the former address, HACS keeps updating it) and the file from `roborock-card.js` to `vacuum-card.js`. With HACS, check after the update that **Settings → Dashboards → ⋮ → Resources** points to `vacuum-card.js` (`/hacsfiles/ha-vacuum-card/vacuum-card.js` for a new install; an existing install may keep its `ha-roborock-card` folder) and remove the former `roborock-card.js` resource. For a manual install, replace the file and the resource URL as above; the releases still carry a `roborock-card.js` copy for the transition. Dashboards using `custom:roborock-card` keep working: the former types stay registered (see [Card types](#card-types)).

## Configuration

### Card types

| Card | Type | Former types (same card) |
|---|---|---|
| Vacuum Card | `custom:vacuum-card` | `custom:roborock-card`, `custom:robot-vacuum-card` |
| Vacuum Mini Card | `custom:vacuum-mini-card` | `custom:roborock-mini-card`, `custom:robot-vacuum-mini-card` |

The former types are identical (same options, same editor), whatever the brand of the robot: existing dashboards keep working.

> [!NOTE]
> `custom:vacuum-card` is also the type of [denysdovhan/vacuum-card](https://github.com/denysdovhan/vacuum-card). When both are installed, the one loaded first gets `vacuum-card`; use `custom:robot-vacuum-card` / `custom:robot-vacuum-mini-card` for this one, they are always available.

### Visual editor

Edit a dashboard, click **Add card** and search for **Vacuum Card** or **Vacuum Mini Card**. The first robot vacuum is preselected; pick another device in the list if you have several, set an optional title, choose the picture and its color, the sections to display and the language. The preview updates live, and options left at their default are kept out of the generated YAML.

### Minimal

```yaml
type: custom:vacuum-card
```

```yaml
type: custom:vacuum-mini-card
```

### Full options

```yaml
type: custom:vacuum-card
device: Roborock Saros 20
title: Saros
image: auto
color: auto
show_logo: true
show_controls: true
room_selection: true
show_modes: true
show_routines: true
show_dock: true
show_consumables: true
show_stats: true
show_map: cleaning
map_entity: camera.dustbusters_map
collapsed:
  - stats
  - dock
crop:
  top: 170
  bottom: 190
  left: 180
  right: 150
language: fr
```

```yaml
type: custom:vacuum-mini-card
device: Roborock F25 Ultra
title: F25
image: auto
color: dark
show_logo: true
show_controls: true
room_selection: true
zoom: true
language: fr
```

### Options reference

| Option | Card | Default | Description |
|---|---|---|---|
| `device` | both | First robot vacuum | Device to display: its name (as shown in Home Assistant) or its device id (set by the visual editor) |
| `title` | both | Device name | Card title |
| `image` | both | `auto` | Device picture: `auto` (per model), a model id to draw another model (e.g. `roborock.vacuum.a72` for the Q5 Pro — the visual editor lists the models by brand and name), `none`, or the URL of your own picture (e.g. `/local/my-robot.png`). The former presets `saros_20`, `s8_maxv_ultra`, `qrevo`, `q7`, `f25_ultra` and `dyad_pro` still work |
| `color` | both | `auto` | Color of the drawn picture: `auto` (per model), `white` or `dark` — for models sold in both colors (F25 Ultra, S7, Q5…) |
| `show_logo` | both | `true` | Show the brand logo (opens the brand's site in a new tab), see [Brands](#brands) |
| `show_controls` | both | `true` | Start / pause, stop, dock and locate buttons (robot vacuums), dock actions (empty bin, wash and dry mop) and maintenance reset buttons |
| `room_selection` | both | `true` | Roborock integration: the Start button opens the room selector; `false` starts a full cleaning right away |
| `zoom` | mini | `true` | Detail button at the top right of the mini card: it shows the full card's content (with the same options, so `show_dock`, `show_map`, `collapsed`… can be set on the mini card too) and switches back to the compact view; a click outside the card also brings the compact view back. `false` removes the button |
| `show_modes` | full | `true` | Cleaning mode, suction power, mop intensity and route |
| `show_routines` | full | `true` | Routines buttons (Roborock integration) |
| `show_dock` | full | `true` | Dock status (Roborock integration) |
| `show_consumables` | full | `true` | Maintenance (remaining time of brushes, filter, sensors…) |
| `show_stats` | full | `true` | Cleaning statistics |
| `show_map` | full | `cleaning` | Map of the current floor: `cleaning` (only while the robot is cleaning), `always` (or `true`) or `never` (or `false`) |
| `collapsed` | full | `[stats, dock]` | Sections folded by default, among `routines`, `dock`, `consumables` and `stats` (`[]` to unfold everything). Click a section title to fold or unfold it. The dock section unfolds on its own when the dock reports a problem |
| `map_entity` | full | — | Camera or image entity to show as the map instead of the integration's map, e.g. the camera of [Xiaomi Cloud Map Extractor](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Xiaomi-Cloud-Map-Extractor) |
| `crop` | full | — | Crop the map, in pixels of the map image: `top`, `bottom`, `left` and/or `right` (see below) |
| `language` | both | Auto | Force language: `fr` or `en` (auto-detects from HA settings) |

### Cropping the map

Map images often have wide empty borders. Remove them with `crop`, in pixels of the original image (all four values are optional):

```yaml
type: custom:vacuum-card
crop:
  top: 170
  bottom: 190
  left: 180
  right: 150
```

In the visual editor, the values are under **Map crop (pixels)**.

Click the map to open it full screen; click anywhere or press Escape to close it.

## Screenshots

### Animations

The picture animates to match what the device is doing and settles back to a still card once it is idle, for every brand (Ecovacs and Dyson animations in their sections below). Each state plays its own animation, and every one of them honours `prefers-reduced-motion`.

While the robot is out vacuuming and mopping, it sways across the floor, its side brushes spin, and dust and water trail behind it:

![cleaning animation](screenshots/cleaning.gif)

Heading back, it slides in from the side and settles in front of its dock:

![returning animation](screenshots/returning.gif)

Docked and washing its mop, blue bubbles rise at the dock:

![mop washing animation](screenshots/mop-washing.gif)

Docked and drying its mop, orange heat waves rise instead:

![mop drying animation](screenshots/mop-drying.gif)

A wet-dry vacuum (F25 Ultra) rocks on its handle and its floor roller turns while it cleans:

![F25 cleaning animation](screenshots/f25-cleaning.gif)

### <img src="images/logo.svg" alt="" width="24"> Roborock

Saros 20 with its dock, set up with the Roborock integration:

| Light | Dark (cleaning: the map is shown) |
|---|---|
| ![card](screenshots/card.png) | ![card dark](screenshots/card-dark.png) |
| ![mini card](screenshots/mini-card.png) | ![mini card dark](screenshots/mini-card-dark.png) |

Mini card zoomed in with its detail button (top right, click it again or anywhere outside the card to go back):

| Light | Dark (cleaning) |
|---|---|
| ![mini card zoomed in](screenshots/mini-card-zoom.png) | ![mini card zoomed in dark](screenshots/mini-card-zoom-dark.png) |

Room selector (opened by the Start button):

![room selector](screenshots/card-rooms.png)

Wet-dry vacuum (F25 Ultra):

| Card | Mini card |
|---|---|
| ![card f25](screenshots/card-f25.png) | ![mini card f25](screenshots/mini-card-f25.png) |

Drawn Roborock models (a few of the ~60 recognized):

<p align="center"><img src="images/models-roborock.svg" alt="Roborock device pictures" width="760"></p>

### <img src="images/xiaomi.png" alt="" width="24"> Xiaomi / Mijia

Mi Robot Vacuum 1S renamed « Robot vacuum », set up with Xiaomi Miio, map from Xiaomi Cloud Map Extractor (`map_entity`):

| Card | Mini card |
|---|---|
| ![card xiaomi](screenshots/card-xiaomi.png) | ![mini card xiaomi](screenshots/mini-card-xiaomi.png) |
| | ![mini card xiaomi dark](screenshots/mini-card-xiaomi-dark.png) |

Drawn Xiaomi / Mijia models (white; the ones with a station are drawn in it):

<p align="center"><img src="images/models-xiaomi.svg" alt="Xiaomi device pictures" width="760"></p>

### <img src="images/dreame.png" alt="" width="24"> Dreame

L10s Ultra renamed « Upstairs robot », set up with Dreame Vacuum, with the map camera of the integration:

| Card | Mini card |
|---|---|
| ![card dreame](screenshots/card-dreame.png) | ![mini card dreame](screenshots/mini-card-dreame.png) |
| | ![mini card dreame light](screenshots/mini-card-dreame-light.png) |

Drawn Dreame models:

<p align="center"><img src="images/models-dreame.svg" alt="Dreame device pictures" width="560"></p>

### <img src="images/ecovacs.png" alt="" width="24"> Ecovacs

<p><img src="images/ecovacs-logo.png" alt="Ecovacs" height="32"></p>

DEEBOT X1 Omni renamed « Studio robot », set up with the Ecovacs integration, with its map image; maintenance in percent with the reset buttons of the integration:

| Card | Mini card |
|---|---|
| ![card ecovacs](screenshots/card-ecovacs.png) | ![mini card ecovacs](screenshots/mini-card-ecovacs.png) |
| | ![mini card ecovacs dark](screenshots/mini-card-ecovacs-dark.png) |

Drawn Ecovacs models:

<p align="center"><img src="images/models-ecovacs.svg" alt="Ecovacs device pictures" width="700"></p>

Animations of the DEEBOT: out vacuuming and mopping, heading back to its station, then the station washing and drying the mops — read from the integration's **Station state** sensor (`washing_mop`, `drying_mop`):

| Cleaning | Returning |
|---|---|
| ![ecovacs cleaning animation](screenshots/ecovacs-cleaning.gif) | ![ecovacs returning animation](screenshots/ecovacs-returning.gif) |

| Washing the mops (dark) | Drying the mops (dark) |
|---|---|
| ![ecovacs mop washing animation](screenshots/ecovacs-mop-washing.gif) | ![ecovacs mop drying animation](screenshots/ecovacs-mop-drying.gif) |

### <img src="images/dyson.png" alt="" width="24"> Dyson

360 Vis Nav renamed « Toy room robot », set up with the Dyson integration (`dyson_local`): the vacuum and its battery (dark theme):

| Card | Mini card |
|---|---|
| ![card dyson](screenshots/card-dyson.png) | ![mini card dyson](screenshots/mini-card-dyson.png) |
| | ![mini card dyson light](screenshots/mini-card-dyson-light.png) |

Drawn Dyson models:

<p align="center"><img src="images/models-dyson.svg" alt="Dyson device pictures" width="420"></p>

The Dyson 360 robots have their own drawing — a tall drum on two tank tracks with the 360° camera on top (wider and lower for the Vis Nav, with its purple band). Vacuuming, the tracks roll and dust is sucked in; heading back, the robot slides in from the side (dark theme):

| Cleaning | Returning |
|---|---|
| ![dyson cleaning animation](screenshots/dyson-cleaning.gif) | ![dyson returning animation](screenshots/dyson-returning.gif) |

## How it works

The cards read the Home Assistant entity and device registries instead of entity ids: every entity of a supported integration is matched by its `translation_key` (`status`, `current_room`, `main_brush_time_left`…) and by the device it belongs to. The keys of Xiaomi Miio, Dreame Vacuum and Ecovacs are mapped onto the Roborock ones, so the same card reads all of them. Entity ids can therefore be in any language or renamed without breaking the cards.

States and errors are shown with the card's own translations when available, otherwise with Home Assistant's translation of the integration.

### Brands

The brand comes from the model id of the device: `roborock.*` → Roborock, the Mi / Xiaomi / Mijia robots (`rockrobo.vacuum.v1`, `roborock.vacuum.m1s`, `xiaomi.*`, `mijia.*`, `ijai.*` and the Mi models built by Dreame or Viomi) → Xiaomi, other `dreame.*` → Dreame, `DEEBOT …` → Ecovacs, Dyson product types (`N223`, `276`, `277`) → Dyson. A model of another brand gets the brand of its integration: Mi Home for Xiaomi Miio, Xiaomi for Xiaomi Home, Dreame for Dreame Vacuum, Ecovacs for Ecovacs, Dyson for Dyson. A Q5 Pro set up with Xiaomi Miio therefore shows the Roborock logo, an X10+ (built by Dreame, sold by Xiaomi) the Xiaomi one.

The brand gives the logo and the color of the buttons, taken from the logo, with a darker shade in the light theme so that they stay readable on a white card:

| Brand | Light theme | Dark theme |
|---|---|---|
| <img src="images/logo.svg" alt="" width="16"> Roborock | `#ea0029` | `#ea0029` |
| <img src="images/xiaomi.png" alt="" width="16"> Xiaomi | `#c24c00` | `#ff6900` |
| <img src="images/mihome.png" alt="" width="16"> Mi Home | `#2a7f57` | `#43b17e` |
| <img src="images/dreame.png" alt="" width="16"> Dreame | `#8a6a3c` | `#c9a46e` |
| <img src="images/ecovacs.png" alt="" width="16"> Ecovacs | `#0b6bc4` | `#3d9be9` |
| <img src="images/dyson.png" alt="" width="16"> Dyson | `#4a4a4a` | `#b8b8b8` |

The Ecovacs and Dyson logos are drawn on a white rounded tile, so that they stay visible on a dark card.

### Device pictures

The picture is drawn from the device name and the commercial name of its model id (`roborock.vacuum.a72` → Q5 Pro…), for about 120 models compatible with the integrations: Roborock E2 / S4 to S8, Q5 to Q10, the Qrevo range (Edge, Curv 2, S Pro…), Saros 10 / 20, G10 / G30, Dyad and F25; Xiaomi / Mijia Mi Robot Vacuum, 1S, Vacuum-Mop Essential / 1C / P / 2 / 2 Pro+ / 2 Ultra, X10 / X10+ / X20+, S10+, Omni 2, M40…; Dreame F9, D9, Z10 Pro, L10 Pro, D10 Plus, L10s Ultra; Ecovacs DEEBOT N8, OZMO, T8 to T30, X1 / X2 / X5 (Omni, Turbo); Dyson 360 Eye, 360 Heurist, 360 Vis Nav. A renamed device keeps the right picture.

Saros robots, the E / C1 series and the Mi Vacuum-Mop Essential / 1C have no LiDAR turret; the Q series (Q5…Q10, Qrevo), the Xiaomi, Dreame and Ecovacs robots are white, the other robots (S series…) are dark; the dock is drawn when the integration reports one or the name implies it (Ultra, Plus / +, Qrevo, Saros, Omni, Self-Cleaning, G10 / G30). Wet-dry vacuums (`roborock.wdv.*`, `roborock.wetdryvac.*`) show an upright vacuum, dark for the Dyad series.

The picture is animated by the current activity, from the status, the cleaning mode and the dock drying: vacuuming (side brushes and dust), mopping (wet trail and drops), both, returning to the dock, washing the mops (bubbles) and drying them (heat waves); it stays still otherwise and with the reduced-motion setting. Use the `image` option to pick another model or your own picture, and `color` (`white` / `dark`) when your model exists in both colors.

### Integrations

- **Roborock**: the dock entities, which the integration puts on a separate "… Dock" device, are attached to their robot. The room selector reads the rooms of the current map (the one chosen in the integration's **Selected map** select) with the `roborock.get_maps` service, then cleans the selected rooms with the same `app_segment_clean` command the integration uses; when the robot is paused, the Start button resumes the cleaning instead. Routines created in the Roborock app appear as buttons in the integration; the card lists them and asks for confirmation before running one.
- **Xiaomi Miio**: current / last clean (`clean_time`, `clean_area`), totals (`total_duration`, `total_area`, `count`), last clean start / end, maintenance (`main_brush_left`, `side_brush_left`, `filter_left`, `sensor_dirty_left`) with their **Reset** buttons. The status comes from the vacuum entity, errors from its `error` attribute. Some of these sensors are disabled by default in the integration (totals, DND): enable them to see the statistics. No map: set `map_entity` to the camera of [Xiaomi Cloud Map Extractor](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Xiaomi-Cloud-Map-Extractor).
- **Xiaomi Home**: its entities have no `translation_key`, so the cards show the vacuum (status, fan speed, controls) and the battery only. No map: use `map_entity` as for Xiaomi Miio.
- **Dreame Vacuum**: status, battery, current room, cleaning progress, error, current and total cleaning, maintenance (`main_brush_time_left`, `side_brush_time_left`, `filter_time_left`, `sensor_dirty_time_left`, `mop_pad_time_left`) with the **Reset** buttons of the integration, and its map camera.
- **Ecovacs**: current and total cleaning (`stats_area`, `stats_time`, `total_stats_*`), cleaning mode (`work_mode`) and water amount (`water_amount`), maintenance in percent (`lifespan_brush`, `lifespan_side_brush`, `lifespan_filter`, `lifespan_round_mop`) with the `reset_lifespan_*` buttons, error code (`0`: no error) with its description, the station state (`station_state`: mops washed / dried, animated on the picture), and the map image. The error sensor is disabled by default in the integration: enable it to see the errors.
- **Dyson** (`dyson_local`): the vacuum entity only — status, power mode, controls — and the battery from its `battery_level` attribute. The picture is a dedicated Dyson 360 drawing.
- Xiaomi Miio, Xiaomi Home, Dreame Vacuum, Ecovacs and Dyson have no `roborock.get_maps` service: the Start button starts a full cleaning (no room selector), and there is no routine or dock section.

Each maintenance line has a reset button when the integration exposes the matching reset button, and asks for confirmation before resetting the counter. The remaining time turns orange under 10 % of the part lifetime (or under 10 h when the lifetime is unknown), and red when it reaches 0; a percentage (Ecovacs, Roborock wet-dry vacuums) turns orange under 10 % and red at 0 %. Bars use the robot lifetimes: main brush 300 h, side brush 200 h, filter 150 h, sensors 30 h.

## Development

```bash
npm install
npm run build        # bundles src/vacuum-card.js + the logos of images/ into dist/vacuum-card.js (and a dist/roborock-card.js copy)
npm run check        # builds and checks the card (run in CI)
node scripts/models.mjs  # renders the drawn model galleries of the README into images/models-*.svg
npm run screenshots  # renders the cards (and one GIF per animated state, needs ffmpeg) with mock data into screenshots/
```

`dist/` is not committed: `npm run build` creates it locally, CI builds it on every push, and the release workflow attaches the built file to the release, which is where HACS downloads it from.

### Releasing

1. Bump `version` in `package.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](CHANGELOG.md)
3. Push to `main`: the **Release** workflow builds the card, creates the tag and the GitHub release with the changelog section as notes, and attaches `vacuum-card.js` (and the `roborock-card.js` copy)

## Translations

The cards auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |

Contributions for additional languages are welcome!

## Credits

Roborock, the Roborock logo and the product pictures are trademarks and property of Roborock; Xiaomi, Mi Home and their logos are trademarks of Xiaomi; Dreame and its logo are trademarks of Dreame Technology (logos from the [Home Assistant brands](https://github.com/home-assistant/brands) repository). Ecovacs, its logo and DEEBOT are trademarks of Ecovacs Robotics; Dyson and its logo are trademarks of Dyson. This project is not affiliated with Roborock, Xiaomi, Dreame, Ecovacs or Dyson.

## License

[MIT](LICENSE)
