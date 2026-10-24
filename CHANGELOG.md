# Changelog

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
