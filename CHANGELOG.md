# Changelog

## 1.14.0
### Changes
- About 55 common Roborock and Xiaomi models are recognized from their model id (`roborock.vacuum.a72` → Q5 Pro, `roborock.vacuum.m1s` → Mi Robot Vacuum 1S, `dreame.vacuum.mc1808` → Mi Robot Vacuum-Mop 1C, `roborock.wetdryvac.a56` → Dyad Pro…): the device picture and its animations follow the model even when the device was renamed. New rules: E / C1 series and Mi Vacuum-Mop Essential / 1C without LiDAR turret, Mi / Xiaomi robots white, G10 series and `+` models with their dock.
- The `image` option accepts a model id, and the visual editor lists every recognized Roborock and Xiaomi model by name (the former six presets still work).
- The logo follows the brand of the model: Roborock for Roborock models (also on Xiaomi Miio / Xiaomi Home), Xiaomi for the Mi / Xiaomi robots (`rockrobo.vacuum.v1`, `roborock.vacuum.m1s`, the Mi Vacuum-Mop models, `xiaomi.*`, `mijia.*`, `ijai.*`); other models keep the integration's logo (Mi Home on Xiaomi Miio).
- Wet-dry vacuums reported as `roborock.wetdryvac.*` are recognized (was `roborock.wdv.*` only).
- New `color` option (both cards, visual editor): `auto` (per model), `white` or `dark` drawn picture, also applied to the `image` presets — for models sold in both colors (F25 Ultra, S7, Q5…).

## 1.13.0
### Changes
- Roborock robots set up with the Xiaomi Miio or Xiaomi Home integration are supported (#16): their vacuums are discovered with the Roborock devices (other Xiaomi devices are skipped). Xiaomi Miio sensors are matched by their `translation_key` (current / last clean, totals, maintenance with reset buttons) and errors come from the vacuum's `error` attribute; Xiaomi Home shows the vacuum and battery. No room selector for these integrations (no `roborock.get_maps`): Start cleans the whole home.
- The header logo follows the device's integration: Roborock, Xiaomi Mi Home (Xiaomi Miio) or Xiaomi (Xiaomi Home), each linking to its brand's site. Logos from the Home Assistant brands repository, embedded in the bundle.
- New `map_entity` option (full card, visual editor): a camera or image entity shown as the map, e.g. the camera of Xiaomi Cloud Map Extractor.

### Maintenance
- Mock Xiaomi Miio Q5 Pro (and a purifier that must be skipped), 4 new tests, `card-xiaomi` / `mini-card-xiaomi` screenshots.

## 1.12.0 - 2026-10-26
### Fixes
- Harden the `image` option against inherited property names: `_picture()` now uses `Object.hasOwn(IMAGES, img)` so that only real presets are recognised. A value matching an inherited prototype property (`__proto__`, `constructor`, `hasOwnProperty`…) no longer returns a truthy non-callable value that crashed the render with a `TypeError`. Legitimate values (`auto`, presets, custom URL, `none`) are unchanged.

## 1.11.0
### Changes
- The Roborock logo is fitted in a 40 × 40 px box (`object-fit: contain`), like the brand logos of the other ha-* cards; it looks the same.
- Mini card: the Roborock logo is back to 32 × 32 px, like the header icon of every ha-* mini card (the zoomed-in view keeps the full card's 40 px).
- Start / Pause, the mini card's round play / pause button, the room selector's Clean button and the popup's confirm button are tinted with the Roborock red instead of filled; the room chips are neutral (selected: tinted) instead of outlined, like the other ha-* cards.
- The battery level next to the picture is 30 px (was 24 px), like the other cards' main value.
- The content starts 8 px under the header (was 4 px), like the other cards.

### Maintenance
- Screenshots: English everywhere (no more French dark shots, English room and routine names), zoomed-in mini card at 460 px, on the shared 16 px frame and theme tokens.

## 1.10.0

### Changes
- Drawn device pictures that follow the model, instead of the two photos (Saros 20, F25 Ultra): robot with or without LiDAR turret (Saros), dark or white (Q series, Qrevo), with its dock when the integration reports one or the name implies it; upright wet-dry vacuum, dark for the Dyad series. The bundle is lighter.
- The picture is animated by what the device is doing: side brushes turning and dust sucked in while vacuuming, wet trail and drops while mopping (both in vacuum-and-mop mode), the robot rolling back into its dock when returning, bubbles while the mops are washed, heat waves while they dry. Upright wet-dry vacuums rock with their roller turning while cleaning, and show bubbles / heat waves while self-cleaning / drying. Motion is off with the system's reduced-motion setting.
- New `image` presets in the visual editor: `s8_maxv_ultra`, `qrevo`, `q7`, `dyad_pro` (`saros_20` and `f25_ultra` still work).

### Fixes
- The Roborock logo of the mini card is the same size as on the full card (40 px instead of 32 px).

### Maintenance
- Tests for the picture choice and its animation (25 in all); screenshots regenerated.

## 1.9.0

### Changes
- Mini card: a small detail button at the top right of the header (after the status pill) switches it to the full card's content, with the same device and options, and back. A click anywhere outside the card brings the compact view back; clicks inside the card or in a dialog opened from it (more-info) do not. From the keyboard, the focus stays on the button.
- New `zoom` option (default `true`, in the visual editor too): `zoom: false` removes the button.
- Zoomed in, the mini card reports the full card's size to the dashboard.

### Maintenance
- The mini card now builds on the full card (no duplicated markup); tests for the zoom (23 in all) and two new screenshots of the zoomed-in mini card.

## 1.8.2

### Fixes
- While the confirmation popup is open, an update of the vacuum no longer scrolls the page back to the card.
- Escape still closes the popup after the card was hidden and shown again (view switch, card editor).

### Maintenance
- Tests for both cases (19 in all); duplication checks run on Node 22.

## 1.8.1

### Fixes
- Escape closes the confirmation popup even when the card was redrawn while it was open (a battery change, for instance), and the keyboard focus goes back to the popup button that had it.
- A double click on OK presses the button once and no longer opens what lies under the popup.
- A click outside the card closes the popup the same way as Cancel.

### Changes
- Lighter redraws: the built-in logo and robot pictures are no longer rewritten into the page on every update (about 35 KB → 20 KB per redraw). Pictures set with `image:` are unchanged.

### Maintenance
- New tests for the popup and the redraws (17 in all); the screenshot script renders each capture in its own page, and the duplicate-code check ignores test folders.

## 1.8.0

### Changes
- Running a routine or resetting a consumable now asks for confirmation in a small popup at the top of the card instead of the browser's confirm dialog; Cancel, Escape or a click outside does nothing, OK presses the button once.
- The card is redrawn only when the vacuum, its dock or the "last clean" time change, not on every state change in Home Assistant: no more flicker, lost hover or focus.
- The "needs Home Assistant" message says 2024.8, as HACS and the README do.

### Fixes
- Durations no longer read "1 h 60" or "60 min": they round to "2 h", "1 h", and so on.
- The sections no longer fold when you click inside the more-info dialog.
- When a dock switch call fails, the switch goes back to its real state right away instead of showing the requested state for 45 s; failed calls no longer leave an error in the browser console.
- Removing the card from the page closes a zoomed map and clears its pending timer.
- The visual editor no longer rebuilds its form on every update.

### Maintenance
- Shared code between the full and mini cards; no visible change.
- CI: actions pinned by commit SHA, read-only token permissions, Dependabot for GitHub Actions, duplicate-code annotations, and a `node --test` suite run on every push.

## 1.7.2

### Maintenance
- Neutral room name in the screenshot mock data; screenshots regenerated.

## 1.7.1

### Maintenance
- Tooling only, no functional change: Biome linting, pre-commit and a Lint CI (duplication checks). Card source modernized (optional chaining, template literals), identical behavior.

## 1.7.0

### Changes
- More compact layout with the same information, like the other ha-* cards: 12 px card padding, 36 px header icon, 16 px name and 12 px subtitle, 11 px pills, tighter tiles and sections.
- Vacuum picture 120 × 132 → 96 × 104 px, battery 28 → 24 px, lower buttons, 12 px consumables.
- The mini card picks up the smaller pills and subtitle.

## 1.6.1

### Changes
- The status pill is back on the right of the header: moving it under the title in the previous version is undone.

## 1.6.0

### Changes
- The status pill sits under the title, as in the other ha-* cards, instead of on the right of the header.
- HACS now asks for Home Assistant 2024.8 or later, the version that brought the sections view the card supports; the README says so under **Prerequisites**.

### Maintenance
- CHANGELOG headings use the same plain English set as the other ha-* repositories.

## 1.5.0

### What's new
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

### Changes
- The Roborock logo only shows the symbol, without the "roborock" text.

## 1.3.1

### What's new
- The Dock section unfolds on its own when the dock reports a problem (dock error, clean water tank empty, dirty water tank full, detergent empty), even when it is folded by default.

## 1.3.0

### What's new
- **Collapsible sections**: click the title of Routines, Dock, Maintenance or Statistics to fold or unfold it. Statistics and Dock are folded by default; choose the sections folded by default with the new `collapsed` option (also in the visual editor, `collapsed: []` to unfold everything).

## 1.2.2

### Fixes
- Statistics still at 0 are hidden, and the Statistics section too when all of them are (e.g. an F25 Ultra whose total cleaning time is 0).

## 1.2.1

### Fixes
- Map crop not applied in some browsers: the map size is now read from the image itself, even when it comes from the cache. The visual editor shows the size of the map image to help pick the crop values.
- Dock buttons show the requested state right away instead of waiting for the next update of the integration (up to about 30 s), and the drying tile shows "Running" until the remaining drying time is known.

## 1.2.0

### What's new
- **Dock actions**: Empty bin, Wash mop and Dry mop buttons in the dock section, using the integration's dock switches. A running action is highlighted and its button stops it. Hidden with `show_controls: false`.

## 1.1.0

### What's new
- **Room selector**: the Start button no longer starts the robot right away. It opens the list of rooms of the current map: pick one or more rooms and start cleaning them, or clean the whole home. Rooms come from the integration (`roborock.get_maps`). Set `room_selection: false` to start directly as before.
- The map is now shown while the robot is cleaning and hidden otherwise. The `show_map` option (a list in the visual editor) accepts `cleaning` (default), `always` / `true` or `never` / `false`.
- **Map crop**: the new `crop` option (`top`, `bottom`, `left`, `right`, in pixels of the map image) trims the empty borders of the map. Also in the visual editor.
- Clicking the map opens it full screen (cropped as configured). Click anywhere or press Escape to close it.

## 1.0.1

### Fixes
- Maintenance list misaligned on devices without reset buttons (such as the F25 Ultra).

## 1.0.0

First release of the Roborock cards for Home Assistant, built for the [Roborock integration](https://www.home-assistant.io/integrations/roborock/).

| Roborock Card | Roborock Mini Card |
|---|---|
| ![roborock-card](https://raw.githubusercontent.com/juju35/ha-roborock-card/main/screenshots/card.png) | ![roborock-mini-card](https://raw.githubusercontent.com/juju35/ha-roborock-card/main/screenshots/mini-card.png) |

### What's new
- **Roborock Card** (`custom:roborock-card`): device picture, battery, status, current room, cleaning progress, cleaning settings, start / pause / stop / dock / locate buttons, routines, dock (water tanks, detergent, auto-empty, mop drying), maintenance (brushes, filter, sensors…) with reset buttons, statistics and optional map.
- **Roborock Mini Card** (`custom:roborock-mini-card`): compact overview with picture, battery, room or error and quick start / pause and dock buttons.
- Robot vacuums (Saros 20 picture) and wet-dry vacuums (F25 Ultra picture), picked automatically per model, or a picture of your own.
- **Automatic discovery** through the entity and device registries: no entity to pick, several devices supported, dock entities merged with their robot, works with entity ids in any language.
- **Visual editor** for both cards: device, title, picture, sections to display and language.
- Clicking the Roborock logo opens [roborock.com](https://www.roborock.com) in a new tab.
- Click any value to open its history (more-info dialog).
- Light and dark mode, English and French.
- Single file with no external dependency.

### Installation
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-roborock-card&category=plugin)

Open the link above (or add `https://github.com/juju35/ha-roborock-card` as a **Dashboard** custom repository in HACS), click **Download**, then reload your browser. Manual install: copy `roborock-card.js` from the assets below to `/config/www/` and add `/local/roborock-card.js` as a JavaScript Module resource.

### Quick start
```yaml
type: custom:roborock-card
```

```yaml
type: custom:roborock-mini-card
```

All options are described in the [README](https://github.com/juju35/ha-roborock-card#configuration).
