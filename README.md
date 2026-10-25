# ha-roborock-card

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-roborock-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-roborock-card/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-roborock-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-roborock-card/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-roborock-card)](https://github.com/juju35/ha-roborock-card/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center"><img src="images/logo.svg" alt="Roborock" width="80"></p>

Lovelace cards for Home Assistant to monitor and control [Roborock](https://www.roborock.com) robot vacuums and wet-dry vacuums: status, battery, room, routines, dock, maintenance and statistics at a glance.

The cards are built on top of the [Roborock integration](https://www.home-assistant.io/integrations/roborock/) included in Home Assistant: entities are **discovered automatically** from the Home Assistant registries, you don't have to pick them one by one, and it works whatever your Home Assistant language.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-roborock-card&category=plugin)

| Roborock Card | Roborock Mini Card |
|---|---|
| ![roborock-card](https://raw.githubusercontent.com/juju35/ha-roborock-card/main/screenshots/card.png) | ![roborock-mini-card](https://raw.githubusercontent.com/juju35/ha-roborock-card/main/screenshots/mini-card.png) |

## Features

- Two cards: a full **Roborock Card** and a compact **Roborock Mini Card**
- Robot vacuums and wet-dry vacuums, with a drawn device picture that follows the model (robot with or without LiDAR turret and dock, wet-dry vacuum) or your own
- Automatic discovery of the Roborock devices (several devices supported, dock merged with its robot)
- Battery, status, current room, cleaning progress and errors
- Cleaning settings: mode, suction power, mop intensity and route
- Start / pause, stop, return to dock and locate buttons
- Room selector: the Start button lets you pick the rooms to clean (or the whole home)
- Routines from the Roborock app as one-tap buttons (with confirmation)
- Dock: clean and dirty water tanks, detergent, auto-empty mode, mop drying, and Empty bin / Wash mop / Dry mop buttons
- Maintenance: main brush, side brush, filter, sensors, dock strainer… with remaining time and a reset button (with confirmation) when the integration provides one
- Statistics: last clean, number of cleanings, total area and time
- Collapsible sections (statistics and dock folded by default)
- Detail button on the mini card (top right): it switches the mini card to the full card's content and back; a click anywhere outside the card brings the compact view back
- Map of the current floor while the robot is cleaning (or always, or never), with optional cropping, enlarged full screen on click
- Click any value to open its Home Assistant history (more-info dialog)
- Click the Roborock logo to open [roborock.com](https://www.roborock.com)
- Visual editor in the dashboard UI for both cards (no YAML needed)
- Light and dark mode, English and French
- Single file, no external dependency, the logo and pictures are embedded

## Prerequisites

The [Roborock integration](https://www.home-assistant.io/integrations/roborock/) must be configured, with Home Assistant 2024.8 or later.

## Installation

### Via HACS (recommended)

Click the button below to add the repository directly:

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-roborock-card&category=plugin)

Then click **Download**, and reload your browser when HACS asks you to.

Or manually:

1. Open HACS → **⋮** (top right) → **Custom repositories**
2. Add `https://github.com/juju35/ha-roborock-card` — Type: **Dashboard**
3. Search for **Roborock Card** and click **Download**
4. Clear your browser cache and refresh

### Manual

1. Download `roborock-card.js` from the [latest release](https://github.com/juju35/ha-roborock-card/releases/latest)
2. Copy it to `/config/www/roborock-card.js`
3. Go to **Settings → Dashboards → ⋮ → Resources** → Add resource:
   - URL: `/local/roborock-card.js`
   - Type: **JavaScript Module**
4. Clear your browser cache and refresh

## Configuration

### Visual editor

Edit a dashboard, click **Add card** and search for **Roborock Card** or **Roborock Mini Card**. The first robot vacuum is preselected; pick another device in the list if you have several, set an optional title, choose the picture, the sections to display and the language. The preview updates live, and options left at their default are kept out of the generated YAML.

### Minimal

```yaml
type: custom:roborock-card
```

```yaml
type: custom:roborock-mini-card
```

### Full options

```yaml
type: custom:roborock-card
device: Roborock Saros 20
title: Saros
image: auto
show_logo: true
show_controls: true
room_selection: true
show_modes: true
show_routines: true
show_dock: true
show_consumables: true
show_stats: true
show_map: cleaning
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
type: custom:roborock-mini-card
device: Roborock F25 Ultra
title: F25
image: auto
show_logo: true
show_controls: true
room_selection: true
zoom: true
language: fr
```

### Options reference

| Option | Card | Default | Description |
|---|---|---|---|
| `device` | both | First robot vacuum | Roborock device to display: its name (as shown in Home Assistant) or its device id (set by the visual editor) |
| `title` | both | Device name | Card title |
| `image` | both | `auto` | Device picture: `auto` (per model), `saros_20`, `s8_maxv_ultra`, `qrevo`, `q7`, `f25_ultra`, `dyad_pro`, `none`, or the URL of your own picture (e.g. `/local/my-robot.png`) |
| `show_logo` | both | `true` | Show the Roborock logo (opens [roborock.com](https://www.roborock.com) in a new tab) |
| `show_controls` | both | `true` | Start / pause, stop, dock and locate buttons (robot vacuums), dock actions (empty bin, wash and dry mop) and maintenance reset buttons |
| `room_selection` | both | `true` | The Start button opens the room selector; `false` starts a full cleaning right away |
| `zoom` | mini | `true` | Detail button at the top right of the mini card: it shows the full card's content (with the same options, so `show_dock`, `show_map`, `collapsed`… can be set on the mini card too) and switches back to the compact view; a click outside the card also brings the compact view back. `false` removes the button |
| `show_modes` | full | `true` | Cleaning mode, suction power, mop intensity and route |
| `show_routines` | full | `true` | Routines buttons |
| `show_dock` | full | `true` | Dock status |
| `show_consumables` | full | `true` | Maintenance (remaining time of brushes, filter, sensors…) |
| `show_stats` | full | `true` | Cleaning statistics |
| `show_map` | full | `cleaning` | Map of the current floor: `cleaning` (only while the robot is cleaning), `always` (or `true`) or `never` (or `false`) |
| `collapsed` | full | `[stats, dock]` | Sections folded by default, among `routines`, `dock`, `consumables` and `stats` (`[]` to unfold everything). Click a section title to fold or unfold it. The dock section unfolds on its own when the dock reports a problem |
| `crop` | full | — | Crop the map, in pixels of the map image: `top`, `bottom`, `left` and/or `right` (see below) |
| `language` | both | Auto | Force language: `fr` or `en` (auto-detects from HA settings) |

### Cropping the map

The map image of the integration usually has wide empty borders. Remove them with `crop`, in pixels of the original image (all four values are optional):

```yaml
type: custom:roborock-card
crop:
  top: 170
  bottom: 190
  left: 180
  right: 150
```

In the visual editor, the values are under **Map crop (pixels)**.

Click the map to open it full screen; click anywhere or press Escape to close it.

## Screenshots

| Light | Dark (French, cleaning: the map is shown) |
|---|---|
| ![card](screenshots/card.png) | ![card dark](screenshots/card-dark.png) |
| ![mini card](screenshots/mini-card.png) | ![mini card dark](screenshots/mini-card-dark.png) |

Mini card zoomed in with its detail button (top right, click it again or anywhere outside the card to go back):

| Light | Dark (French, cleaning) |
|---|---|
| ![mini card zoomed in](screenshots/mini-card-zoom.png) | ![mini card zoomed in dark](screenshots/mini-card-zoom-dark.png) |

Room selector (opened by the Start button):

![room selector](screenshots/card-rooms.png)

Wet-dry vacuum (F25 Ultra):

| Roborock Card | Roborock Mini Card |
|---|---|
| ![card f25](screenshots/card-f25.png) | ![mini card f25](screenshots/mini-card-f25.png) |

## How it works

The cards read the Home Assistant entity and device registries instead of entity ids: every entity of the Roborock integration is matched by its `translation_key` (`status`, `current_room`, `main_brush_time_left`, `dirty_box_full`…) and by the device it belongs to. The dock entities, which the integration puts on a separate "… Dock" device, are attached to their robot. Entity ids can therefore be in any language or renamed without breaking the cards.

States and errors are shown with the card's own translations when available, otherwise with Home Assistant's translation of the integration.

<p align="center"><img src="images/models.svg" alt="Device pictures" width="640"></p>

The device picture is drawn from the model name: Saros robots have no LiDAR turret, the Q series (Q7, Q8, Qrevo) is white, the other robots (S series…) are dark; the dock is drawn when the integration reports one or the name implies it (Ultra, Plus, Qrevo, Saros). Wet-dry vacuums (`roborock.wdv.*`) show an upright vacuum, dark for the Dyad series. Use the `image` option to pick another one or your own.

The room selector reads the rooms of the current map (the one chosen in the integration's **Selected map** select) with the `roborock.get_maps` service, then cleans the selected rooms with the same `app_segment_clean` command the integration uses. When the robot is paused, the Start button resumes the cleaning instead.

Routines created in the Roborock app appear as buttons in the integration; the card lists them and asks for confirmation before running one.

Each maintenance line has a reset button when the integration exposes the matching **Reset … consumable** button (main brush, side brush, filter, sensors, dock strainer, dock brush). It asks for confirmation before resetting the counter.

Maintenance thresholds: the remaining time turns orange under 10 % of the part lifetime (or under 10 h when the lifetime is unknown), and red when it reaches 0. Bars use the Roborock lifetimes: main brush 300 h, side brush 200 h, filter 150 h, sensors 30 h.

## Development

```bash
npm install
npm run build        # bundles src/roborock-card.js + images/logo.svg into dist/roborock-card.js
npm run check        # builds and checks the card (run in CI)
npm run screenshots  # renders the cards with mock data (scripts/mock-states.mjs) into screenshots/
```

`dist/` is not committed: `npm run build` creates it locally, CI builds it on every push, and the release workflow attaches the built file to the release, which is where HACS downloads it from.

### Releasing

1. Bump `version` in `package.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](CHANGELOG.md)
3. Push to `main`: the **Release** workflow builds the card, creates the tag and the GitHub release with the changelog section as notes, and attaches `roborock-card.js`

## Translations

The cards auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |

Contributions for additional languages are welcome!

## Credits

Roborock, the Roborock logo and the product pictures are trademarks and property of Roborock. This project is not affiliated with Roborock.

## License

[MIT](LICENSE)
