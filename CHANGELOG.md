# Changelog

## 1.1.0

### ✨ Features

- **Room selector**: the Start button no longer starts the robot right away. It opens the list of rooms of the current map: pick one or more rooms and start cleaning them, or clean the whole home. Rooms come from the integration (`roborock.get_maps`). Set `room_selection: false` to start directly as before.
- The map is now shown while the robot is cleaning and hidden otherwise. The `show_map` option (a list in the visual editor) accepts `cleaning` (default), `always` / `true` or `never` / `false`.

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
