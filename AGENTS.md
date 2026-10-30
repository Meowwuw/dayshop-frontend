# AGENTS.md

Minimal React 19 + Vite 8 storefront frontend. Plain JavaScript/JSX, no TypeScript.

## Reglas

- Responde siempre en español.
- Usa solo React y Tailwind.
- Cada pantalla debe cumplir los criterios de aceptación de su historia.
- Explica qué archivos cambias y por qué.
- Usa datos de prueba, no datos reales.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint (currently passes; no auto-fix script)
- `npm run preview` — serve the built `dist/`

There is no test runner or typecheck script. Do not invent `npm test`/`tsc` commands; verify changes with `npm run lint` and `npm run build`.

## Stack quirks

- Tailwind CSS v4 is wired through `@tailwindcss/vite` in `vite.config.js`. There is no `tailwind.config.js`, no PostCSS config, and no `@tailwind` directives — just `@import "tailwindcss";` in `src/index.css`.
- Add theme tokens/customization with `@theme` in `src/index.css` instead of creating a JS Tailwind config.
- `src/App.css` is hand-written CSS using native CSS nesting, separate from Tailwind utilities. Keep both patterns as they are.
- ESLint only covers `**/*.{js,jsx}` and ignores `dist/`.

## Structure

- Entry flow: `index.html` → `src/main.jsx` → `src/App.jsx`.
- `src/assets/` holds imported assets; `public/` is served at `/` (e.g. `public/icons.svg` referenced as `/icons.svg#...`).
- `src/pages/` holds screens; `src/services/` holds browser-side logic (auth, cart); `src/data/` holds mock catalog data.
- `src/App.jsx` uses `react-router-dom` (`/carrito`, `/login`, `/mi-cuenta`) with protected routes and a `localStorage` session. No state library or API client exists; add these deliberately rather than assuming conventions.

## Package manager

Use npm (`package-lock.json` is the only lockfile).
