# Changelog

## 1.5.0

### ✨ Features

- Sections fold like the other ha-* cards: the chevron points right when folded and down when unfolded, and a click anywhere else on the page folds the sections back to their defaults (`collapsed`), as in ha-carburants-france.

## 1.4.1

### Development
- The built card is no longer committed in `dist/`: CI builds it on every push, and the release workflow builds it and attaches it to the release, which is where HACS downloads it from. Nothing changes for users.

## 1.4.0

### Changes
- The warning color falls back to Home Assistant's default `#ffa600` (was `#ffa000`), like the other ha-* cards.

### Development
- Releases are published when `version` in `package.json` has no tag yet: bump the version, add its CHANGELOG section and push, like the other ha-* repositories (the manual Release workflow run is no longer needed).
- Issue templates, stale workflow and a "Update release notes" workflow, shared with the other repositories.

## 1.3.2

### 💄 Style

- The Roborock logo only shows the symbol, without the "roborock" text.

## 1.3.1

### ✨ Features

- The Dock section unfolds on its own when the dock reports a problem (dock error, clean water tank empty, dirty water tank full, detergent empty), even when it is folded by default.

## 1.3.0

### ✨ Features

- **Collapsible sections**: click the title of Routines, Dock, Maintenance or Statistics to fold or unfold it. Statistics and Dock are folded by default; choose the sections folded by default with the new `collapsed` option (also in the visual editor, `collapsed: []` to unfold everything).

## 1.2.2

### 🐛 Fixes

- Statistics still at 0 are hidden, and the Statistics section too when all of them are (e.g. an F25 Ultra whose total cleaning time is 0).

## 1.2.1

### 🐛 Fixes

- Map crop not applied in some browsers: the map size is now read from the image itself, even when it comes from the cache. The visual editor shows the size of the map image to help pick the crop values.
- Dock buttons show the requested state right away instead of waiting for the next update of the integration (up to about 30 s), and the drying tile shows "Running" until the remaining drying time is known.

## 1.2.0

### ✨ Features

- **Dock actions**: Empty bin, Wash mop and Dry mop buttons in the dock section, using the integration's dock switches. A running action is highlighted and its button stops it. Hidden with `show_controls: false`.

## 1.1.0

### ✨ Features

- **Room selector**: the Start button no longer starts the robot right away. It opens the list of rooms of the current map: pick one or more rooms and start cleaning them, or clean the whole home. Rooms come from the integration (`roborock.get_maps`). Set `room_selection: false` to start directly as before.
- The map is now shown while the robot is cleaning and hidden otherwise. The `show_map` option (a list in the visual editor) accepts `cleaning` (default), `always` / `true` or `never` / `false`.
- **Map crop**: the new `crop` option (`top`, `bottom`, `left`, `right`, in pixels of the map image) trims the empty borders of the map. Also in the visual editor.
- Clicking the map opens it full screen (cropped as configured). Click anywhere or press Escape to close it.

## 1.0.1

### 🐛 Fixes

- Maintenance list misaligned on devices without reset buttons (such as the F25 Ultra).

## 1.0.0

First release of the Roborock cards for Home Assistant, built for the [Roborock integration](https://www.home-assistant.io/integrations/roborock/).

| Roborock Card | Roborock Mini Card |
|---|---|
| ![roborock-card](https://raw.githubusercontent.com/juju35/ha-roborock-card/main/screenshots/card.png) | ![roborock-mini-card](https://raw.githubusercontent.com/juju35/ha-roborock-card/main/screenshots/mini-card.png) |

### ✨ Features

- **Roborock Card** (`custom:roborock-card`): device picture, battery, status, current room, cleaning progress, cleaning settings, start / pause / stop / dock / locate buttons, routines, dock (water tanks, detergent, auto-empty, mop drying), maintenance (brushes, filter, sensors…) with reset buttons, statistics and optional map.
- **Roborock Mini Card** (`custom:roborock-mini-card`): compact overview with picture, battery, room or error and quick start / pause and dock buttons.
- Robot vacuums (Saros 20 picture) and wet-dry vacuums (F25 Ultra picture), picked automatically per model, or a picture of your own.
- **Automatic discovery** through the entity and device registries: no entity to pick, several devices supported, dock entities merged with their robot, works with entity ids in any language.
- **Visual editor** for both cards: device, title, picture, sections to display and language.
- Clicking the Roborock logo opens [roborock.com](https://www.roborock.com) in a new tab.
- Click any value to open its history (more-info dialog).
- Light and dark mode, English and French.
- Single file with no external dependency.

### 📦 Installation

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-roborock-card&category=plugin)

Open the link above (or add `https://github.com/juju35/ha-roborock-card` as a **Dashboard** custom repository in HACS), click **Download**, then reload your browser. Manual install: copy `roborock-card.js` from the assets below to `/config/www/` and add `/local/roborock-card.js` as a JavaScript Module resource.

### 🚀 Quick start

```yaml
type: custom:roborock-card
```

```yaml
type: custom:roborock-mini-card
```

All options are described in the [README](https://github.com/juju35/ha-roborock-card#configuration).
