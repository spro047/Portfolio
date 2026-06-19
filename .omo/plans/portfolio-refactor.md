# Plan: portfolio-refactor

## TL;DR (For humans)

Extract the 2066-line monolithic `main.ts` into modules, replace hardcoded inline colors with CSS custom properties, deduplicate wallpaper assets, drop the dead PDF viewer, replace emoji UI icons with SVGs, and clean up the double scanline overlay. 6 work items in dependency order — module extraction first, then everything else fans out in parallel.

---

## Todos

### Todo 1: Extract main.ts into modules

**Where**: `src/main.ts` → `src/boot.ts`, `src/window-manager.ts`, `src/apps/`, `src/desktop.ts`

**What**: Split ~2066 lines into natural modules:
- `src/boot.ts` — boot sequence: `asciiLogo`, `bootMessages`, `addTerminalLine()`, `runBootSequence()`, `transitionToDesktop()`, `setupContextMenu()`, `showNotification()`, `updateClock()`
- `src/window-manager.ts` — `createWindow()`, `(window as any).minimizeWindow/maximizeWindow/closeWindow`, `WindowEntry` interface, `windowRegistry` array, `syncTaskbar()` (create it — currently missing causing 18 TS errors), `highestZIndex`
- `src/desktop.ts` — `setDesktopWallpaper()`, `openWallpaperFolder()`, `toggleDarkMode()`, `startScreensaverTimer()`/`activateScreensaver()`/`deactivateScreensaver()`, `trackPageView()`, `handleSearchAction()`, `openSearch()`, `searchData`, dock click handlers (lines 1754–2004), dock drag-and-drop (lines 2006–2066)
- `src/apps/terminal.ts` — `openTerminal()` and `commands` object
- `src/apps/paint.ts` — `openPaint()` and all canvas logic
- `src/apps/flappy-bird.ts` — `openFlappyBird()` and game loop
- `src/apps/calculator.ts` — `openCalculator()`
- `src/apps/contact.ts` — `openContactForm()`
- `src/apps/blog.ts` — `blogPosts` data and `openBlog()`
- `src/apps/files.ts` — `openFilesWindow()`, `openPaintsFolder()`, `openProjectsFolder()`
- `src/apps/menu.ts` — `openMenuWindow()`

**Pattern**: Each module exports a single `open*()` function. `main.ts` becomes a thin entrypoint that imports all modules and wires up `runBootSequence().then(transitionToDesktop)` and dock click listeners.

**Keep in main.ts**: DOM element refs (lines 1–10), module imports, the initial `runBootSequence().then(transitionToDesktop)` call, the dock click event binding, and drag-and-drop.

**Acceptance**:
- `npx tsc --noEmit` passes with zero errors (especially `WindowEntry`, `windowRegistry`, `syncTaskbar` which are currently broken)
- `npm run dev` starts and desktop loads
- All apps (terminal, paint, flappy bird, calculator, contact, blog, calendar, this PC, resume, research, files, search, screensaver) open and work
- Window manager (create, drag, resize, minimize, maximize, close) works
- Dock drag-reorder works
- Dark mode toggle works
- Wallpaper change works

**QA strategy**: Manual — open every app, verify window manager, verify boot sequence. The app has no test framework.

---

### Todo 2: Replace hardcoded colors with CSS custom properties

**Where**: `src/main.ts` (template strings with inline styles), `src/style.css` (add new vars if needed)

**What**: Replace every instance of inline `style="color: #..."`, `style="background: #..."`, `border-bottom: 2px solid #000`, etc. in JS template strings with CSS classes or custom property references.

**Exhaustive hit list**:

| Value | Location | Replace with |
|-------|----------|-------------|
| `color: #333` | Lines 127, 1307, 1311, 1315, 1319, 1806 | `var(--mac-menu-text)` (already `#000` — use a new `--text-secondary: #333` if needed, or just use `--mac-menu-text`) |
| `color: #007bff` | Line 1831 (resume links) | New `--link-color` var or just `--mac-titlebar-start` |
| `color: #000` | Line 1044 (project detail border) | `var(--mac-menu-text)` |
| `color: #70c5ce` | Line 1060 (flappy bird sky) | Leave as-is (game color, not UI) |
| `color: #73be2e` | Line 1088 (flappy bird pipes) | Leave as-is (game color, not UI) |
| `color: #888` | Lines 1064, 1073 (empty state, hint) | `var(--platinum-dark)` |
| `color: #222` | Line 1095 (calendar header) | `var(--mac-menu-text)` |
| `color: #666` | Line 1053 (project detail) | `var(--mac-window-border)` |
| `border-bottom: 2px solid #000` | Line 1044 | CSS class `.project-detail h2` in style.css with `var(--mac-menu-text)` |
| `background: #000` | Line 1012 (contact submit) | CSS class `.contact-submit` already exists — move style there using `var(--mac-menu-text)` as background |

**Add missing CSS vars** (if needed):
- `--text-secondary: #333333` for body/secondary text
- `--link-color: #007bff` or reuse `--mac-titlebar-start: #4a80d4`

**Acceptance**:
- All text colors in "This PC", "Resume", "Contact Form", "Calendar", "Files", "Research" windows render correctly
- No `#333` or `#007bff` remains in any template string in main.ts
- Link colors in resume match visually (or use `--mac-titlebar-start`)
- `npx tsc --noEmit` passes
- `npm run build` succeeds

**QA**: Visually inspect each window type. Change dark mode, verify text legibility.

---

### Todo 3: Deduplicate wallpaper assets

**Where**: `img/wallpapers/` (delete), `public/img/wallpapers/` (keep)

**What**:
1. Delete `img/wallpapers/` directory (8 files, ~493KB total)
2. If `img/` is now empty except `img/extracted/`, delete `img/` too
3. No code changes needed — `main.ts` references `./img/wallpapers/...` which Vite resolves from `public/img/wallpapers/...` because Vite serves `public/` at the root

**Verify**: Search `main.ts` and `index.html` for any `img/wallpapers` references — they all use `./img/wallpapers/...` prefix. Vite's dev server serves `public/img/` at `/img/`, so `./img/wallpapers/...` resolves correctly.

**Acceptance**:
- `npm run dev` — Wallpaper folder in-app shows all 8 wallpapers as thumbnails
- Double-click a wallpaper → desktop background changes
- `npm run build` succeeds and preview shows wallpapers correctly

---

### Todo 4: Remove Resume PDF iframe viewer

**Where**: `src/main.ts` line 616, `Resume.pdf` (root), `public/img/Resume.pdf`, `.gitignore`

**What**:
1. Remove the iframe code at `src/main.ts` line 616 — the `createWindow('Resume.pdf', '<iframe src=...')` call. Replace with a simple `createWindow('Resume.pdf', '<div class="content-page"><p>Resume content is available in the Resume window from the dock.</p></div>')` or just don't open a window at all (the Files double-click was the only way to reach this).
2. Delete `Resume.pdf` from root (107,921 bytes)
3. Delete `Resume.pdf` from `public/img/` (107,921 bytes)
4. Remove the following lines from `.gitignore`:
   ```
   Resume.pdf
   public/img/Resume.pdf
   ```
5. Fix `calender1.png` typo in `index.html:86` — rename the file reference to `calendar1.png` if the actual filename is wrong, or just keep it if the file is actually named `calender1.png` on disk. Check actual filename.

**Note**: The inline HTML resume in main.ts (lines 1827–1937) is the primary resume display and stays untouched.

**Acceptance**:
- Files > Documents > double-click Resume.pdf no longer opens a broken iframe window
- `npx tsc --noEmit` passes
- `npm run build` succeeds
- No more 404s for `Resume.pdf`
- `Resume.pdf` and `public/img/Resume.pdf` no longer tracked by git
- `resume-text.txt` at root can stay (it's the raw source for the inline HTML)

---

### Todo 5: Replace emoji UI icons with inline SVG icons

**Where**: `src/main.ts`, `index.html`

**What**: Replace every emoji used as a UI icon with inline SVG icons (data URIs or simple `<svg>` strings). Do NOT replace emoji in blog post content or resume body text.

**Exhaustive replacement list**:

| Emoji | Location | Context |
|-------|----------|---------|
| `🔍` | `index.html:42` | Search toggle button text |
| `🔍` | `main.ts:1513` | Search overlay icon |
| `☀️` / `🌙` | `main.ts:110, 1467` | Dark mode toggle text |
| `🖥️` | `main.ts:1474` | Search result: This PC |
| `📄` | `main.ts:1475` | Search result: Resume |
| `🔬` | `main.ts:1476` | Search result: Research |
| `🐙` | `main.ts:1477` | Search result: GitHub |
| `📁` | `main.ts:1478-1482` | Search results: Projects |
| `📝` | `main.ts:1486-1487` | Search results: Publications |
| `💻` | `main.ts:1488` | Search result: Terminal |
| `🎨` | `main.ts:1489` | Search result: Paint |
| `🧮` | `main.ts:1490` | Search result: Calculator |
| `🐦` | `main.ts:1491` | Search result: Flappy Bird |
| `📅` | `main.ts:1492` | Search result: Calendar |
| `✉️` | `main.ts:1493` | Search result: Contact |
| `📰` | `main.ts:1494` | Search result: Blog |
| `⚡` | `main.ts:1495-1499` | Search results: Skills |
| `🖼️` | `main.ts:1500` | Search result: Wallpapers |
| `📂` | `main.ts:1501` | Search result: Files |
| `🍞`, `🔥`, `✦`, `⬡`, `⚡`, `◆`, `★`, `☄` | `main.ts:1606` | Screensaver floating symbols |

**Strategy**: Use inline SVG strings. For simple icons (🔍 → magnifying glass, ☀️ → sun, 🌙 → moon): inline `<svg>` directly in the template. For the 20 search result icons: create a helper function `iconMap` that returns SVG strings by key. For screensaver symbols: use CSS shapes (rotated squares, circles) instead of emoji — or keep a subset as unicode geometric shapes (✦ ◆ ★ ⬡ are already not emoji but typographic glyphs; only replace the actual emoji: 🍞🔥⚡).

**Replacement candidates for search icons** — simple geometric SVGs:
- System icons: folder/file/document shapes
- External: generic link/arrow shape
- Skill: bolt/star shape

**Acceptance**:
- Dark mode toggle shows sun/moon SVGs instead of emoji
- Search overlay icon is an SVG magnifying glass
- Search result items show SVG icons instead of emoji
- Screensaver has no emoji symbols (use CSS-drawn shapes or typographic glyphs)
- `npx tsc --noEmit` passes

---

### Todo 6: Fix double scanline overlay

**Where**: `src/style.css`

**What**: 
1. Remove the scanline effect from `.monitor-overlay::after` (lines 66–82). This overlay adds 4px scanlines + RGB split on the outer bezel, which is not in the DESIGN.md spec.
2. Keep `.screen::before` (lines 121–133) — this has 2px scanlines + 3px RGB split which matches DESIGN.md exactly.
3. Verify `.monitor-overlay::after` isn't doing something else unique (e.g., the `border-radius: 40px` matches the bezel curve — it might be serving as a bezel-inner-shadow effect). If removing breaks the monitor appearance, keep a simplified version that only does the inner shadow without scanlines.

**Risk**: `.monitor-overlay::after` uses `border-radius: 40px` which matches the outer bezel. If the `.screen::before` scanlines don't extend to the edges of the monitor, the outer overlay might be filling a gap. Verify visually after change.

**Acceptance**:
- CRT scanlines still visible on screen (2px spacing, RGB split)
- No visible regression in the monitor appearance
- DESIGN.md scanline spec is matched

---

## Dependency Matrix

```
Todo 1 (module extraction) ──── blocks ──┐
                                          ├── Todo 2 (colors) — touches extracted modules
                                          ├── Todo 5 (emoji)  — touches extracted modules
                                          │
Todo 3 (wallpapers)  ──── independent ───┤  (no code change, safe anytime)
Todo 4 (PDF viewer)  ──── independent ───┤  (no code change, safe anytime)
                                          │
Todo 6 (scanlines)   ──── independent ───┤  (CSS only, safe anytime)
```

**Execution order**: Todo 1 first, then parallel: Tod2 2+5+6 (code changes in extracted modules) + 3+4 (asset-only, no code changes needed after 1).

## Must-NOT-Have

- Do NOT add any npm dependencies (no icon libraries, no testing frameworks, no build plugins)
- Do NOT change the visual appearance of the CRT monitor, desktop, windows, or dock — only colors and icons should be replaced with equivalent alternatives
- Do NOT extract modules into separate npm packages — keep as sibling `.ts` files in `src/`
- Do NOT refactor logic or fix functional bugs beyond what's in these todos (e.g., don't optimize the paint app, don't rewrite the game loop)
- Do NOT add type assertions or `as any` to silence TS errors — fix them properly
