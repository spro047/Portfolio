# Retro macOS Portfolio — Agent Guide

Single-page interactive portfolio built as a macOS 9 simulator inside a CRT monitor. Vanilla TypeScript + CSS, no framework.

## Commands

```sh
npm run dev          # Starts Vite (port 5173) + API dev server (port 3001) concurrently
npm run dev:api      # API dev server only (http://localhost:3001)
npm run build        # tsc (typecheck) → vite build  — run BOTH, never just vite build
npm run preview      # vite preview of built dist/
npm run vercel-build # Same as build, used by Vercel
```

**Important**: `npm run dev` runs concurrently. It starts both the Vite dev server and the API server. The API server is a Node HTTP server at `api/dev-server.mjs` on port 3001. Vite proxies `/api/*` to it.

## Architecture

- **`index.html`** — single entry point, no routing
- **`src/main.ts`** — all application logic (~2066 lines): boot sequence, desktop, window manager, terminal, paint, flappy bird, calculator, contact form, blog, calendar, search, screensaver, dock drag-reorder
- **`src/style.css`** — all styling (~1700 lines). Design tokens are CSS custom properties in `:root`. Full design system in [`DESIGN.md`](DESIGN.md)
- **`api/*.js`** — Vercel serverless functions. Routes: `GET /api/health`, `GET /api/projects`, `GET /api/research`, `POST /api/contact`
- **`api/dev-server.mjs`** — local HTTP server that serves the same API routes (port 3001). Used only in `npm run dev`
- **`data/*.json`** — JSON seed files loaded by API functions
- **`img/`** — static images used at runtime (referenced as `./img/...`)
- **`public/img/`** — Vite static directory, also has image copies
- **`dist/`** — build output, gitignored

## Key Technical Details

- **No test framework** — no tests to run or update
- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` are all on. `tsc` is typecheck-only (`noEmit: true`). Fix all TS errors before `vite build`
- **No CSS framework** — vanilla CSS3, no Tailwind/Bootstrap. All colors and spacing are CSS custom properties defined in `:root`
- **`build` runs tsc first** — if tsc fails the build fails. Run `npx tsc --noEmit` to typecheck without building
- **State** is in `localStorage` — keys: `dark-mode`, `desktop-wallpaper`, `user-paints`, `flappy-high-score`, `boot-time`, `page-views`. There is no backend database
- **No HTTP state** — contact form POSTs to `/api/contact` which logs to console (dev) or Vercel logs (prod). Optional `CONTACT_EMAIL_WEBHOOK` env var forwards to email
- **Window manager** — vanilla drag/drop/resize/z-index. Global window control functions exposed via `(window as any)` for inline `onclick`: `minimizeWindow(id)`, `maximizeWindow(id)`, `closeWindow(id)`
- **Images** referenced as `./img/...` from JS and HTML — paths resolve through Vite's dev server during development

## Vercel Deployment

- Config: [`vercel.json`](vercel.json) — `framework: null` (custom), build via `npx tsc && npx vite build`
- Output dir: `dist`
- API rewrite: `/api/(.*)` → `/api/$1` (Vercel serves `api/*.js` as serverless functions)
- Asset caching: 1-year immutable for `/assets/*` and `/img/*`

## Style Rules

- Use CSS custom properties from `:root` for all colors — never hardcode color values
- Prefer `transform`/`opacity` animations over layout-triggering properties
- No emoji for UI icons (use HTML entities or images)
- If adding new JS logic, keep in `src/main.ts` (single-file app); if it grows large, extract modules into `src/`

## Design Reference

[`DESIGN.md`](DESIGN.md) documents the complete design system: colors, typography, spacing, component specs, animation values. Consult it before styling changes.
