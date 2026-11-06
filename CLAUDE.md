# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Acheter en France": an Astro + React app that, for a French postal code / commune, aggregates public data (risks, water quality, amenities, elections, INSEE stats, weather, travel times to saved destinations). The UI text is in French.

## Commands

```bash
npm install
npm run dev       # astro dev on http://localhost:4321
npm run build     # astro build (Netlify adapter)
npm run preview
```

There is no test suite, linter, or formatter configured.

## Architecture

- **Pages** (`src/pages/*.astro`) are thin shells that mount React islands with `client:load`. `index.astro` mounts `Search`, `Destinations`, and `Results`. All app logic lives in React components.
- **State** is shared between islands via nanostores atoms in `src/stores/search.js` (one atom per data domain, plus `isLoading`/`isLoaded`/`hasErrors`, a `serviceErrors` map, and `totalTasks`/`completedTasks` driving the progress bar). Islands are separate React roots, so cross-component communication must go through these atoms, not props/context.
- **Search flow** (`src/components/Search.jsx` `handleSubmit`): resets every atom, resolves the commune from the bundled `src/data/france.json` (postal code + name → INSEE code + GPS coords; INSEE codes stored as numbers lose their leading zero, so 4-digit codes are left-padded), then fires all service calls in parallel grouped as geo / amenities / political / durations, and writes results into the atoms. `Results.jsx` subscribes to the atoms with `useStore` and renders a location header (from the `searchedLocation` atom), a key-figures strip, a sticky table of contents driven by the `SECTIONS` array, and one `<Section>` card per domain. Adding a new data source means: a service function, a new atom, reset + fetch + set in `Search.jsx`, an entry in `SECTIONS` plus a `<Section>` in `Results.jsx`, and keeping `totalTasks` consistent with the `incrementCompletedTasks()` calls.
- **Design system**: colour/font tokens (`paper`, `ink`, `accent`, `clay`, `sage`, `amber`, `line`, `font-display` = Fraunces) are defined in the `@theme` block of `src/styles/global.css`, along with component classes (`.card`, `.field`, `.btn-primary`, `.btn-secondary`, `.eyebrow`, `.data-table`). Shared React primitives (`Section`, `Badge`, `Loadable`, `Empty`, `Skeleton`, …) live in `src/components/ui.jsx`. Use these rather than raw Tailwind grays/blues.
- **Services** (`src/services/*.js`) call public APIs directly from the browser with axios and return `null` on failure (they log rather than throw): georisques.gouv.fr (seismic, soil pollution, GASPAR), hubeau.eaufrance.fr (tap water), Overpass API (stores, health, schools), opendatasoft (associations), open-meteo archive (weather), OSRM (driving durations, with a 1s delay for rate limiting), Nominatim, and election results read from public Google Sheets via the `gviz/tq` endpoint (`political.js`).
- **Netlify Functions** (`netlify/functions/`) handle what can't run in the browser:
  - `getCityFromZipcode` — postal code → list of communes from `france.json` (called as `/.netlify/functions/getCityFromZipcode`).
  - `getInsee` — scrapes the insee.fr commune page with axios + cheerio and returns its tables keyed by caption (called as `/api/getInsee`, rewritten by `netlify.toml` to `/.netlify/functions/:splat`).
  In `astro dev`, the Netlify adapter's Vite plugin emulates these functions and the `/api/*` redirect, so `netlify dev` isn't required. Functions must be ES modules (`package.json` has `"type": "module"`); `require`/`exports` fail to load. Edge-function emulation is disabled in `astro.config.mjs` because the project has none and it needs a local Deno server.
- **Saved destinations** are persisted in `localStorage` under `savedDestinations` (`src/utils/helpers.js`, `Destinations.jsx`); search computes durations from the searched commune to each of them.
- Styling: Tailwind CSS v4 via `@tailwindcss/vite`, imported through `src/styles/global.css`.

Note: the project structure shown in README.md is outdated (there is no `App.jsx`/`main.jsx`); trust the code.
