# Draft: portfolio-refactor

## Intent Classification

**Route**: CLEAR — The user explicitly listed 6 concrete issues (#2–#7) from a prior audit and wants them fixed. No ambiguity about outcomes.

## Evidence Ledger

### From direct codebase reading:

| Claim | Evidence | Status |
|-------|----------|--------|
| main.ts is ~2066 lines, style.css is ~1698 lines | `(Get-Content src/main.ts).Length` = 2066, `(Get-Content src/style.css).Length` = 1698 | verified |
| Natural module boundaries exist | Boot sequence (lines 1–144), Wallpaper (405–456), Terminal (458–567), Files (569–715), Paint (717–1007), Flappy Bird (1009–1188), Calculator (1190–1299), Contact form (1301–1403), Menu (1405–1457), Dark mode (1459–1470), Search (1472–1588), Screensaver (1590–1656), Blog (1658–1733), Analytics (1735–1752), Dock click handlers (1754–2004), Dock drag (2006–2066) | verified |
| Hardcoded colors in JS template strings | `#333` used 5 times (lines 127, 1307, 1311, 1315, 1319, 1806), `#007bff` twice (line 1831), `#000` twice (lines 1044, 1831 border), `#70c5ce`, `#73be2e`, `#888`, `#222`, `#666` | verified |
| Double scanline overlay | `.monitor-overlay::after` (4px scanlines + 3px RGB split at 0.3 opacity) + `.screen::before` (2px scanlines + 3px RGB split). DESIGN.md specifies "2px + 3px RGB split" — the outer overlay doesn't match spec | verified |
| Emoji as UI icons | Dark mode toggle (☀️/🌙), search toggle (🔍), search results (🖥️ 📄 🔬 🐙 📁 📝 💻 🎨 🧮 🐦 📅 ✉️ 📰 ⚡ 🖼️ 📂), screensaver (🍞 🔥 ✦ ⬡ ⚡ ◆ ★ ☄) | verified |
| Wallpaper directories identical | `img/wallpapers/` and `public/img/wallpapers/` — same 8 files, same byte sizes. Code references `./img/wallpapers/...` | verified |
| Resume.pdf duplicated | `Resume.pdf` and `public/img/Resume.pdf` — same file (107,921 bytes each). Both in `.gitignore`. Referenced at line 616 via `<iframe src="./img/Resume.pdf">` which would 404 in production | verified |
| calender1.png typo in filename | `index.html:86` references `./img/calender1.png` — misspelled | verified |

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Module extraction approach | Extract into `src/` subdirectory with named modules, keep a thin `main.ts` re-exporting | Single-file is unsustainable at 2k+ lines; natural boundaries are clear |
| Emoji replacement strategy | Replace with SVG icons inline as data URIs (no extra HTTP requests) | Matches DESIGN.md "SVG recommended for future additions"; no build-tool dependency |
| Wallpaper deduplication | Remove `img/wallpapers/` (non-standard dir), keep `public/img/wallpapers/` | `public/` is Vite's static dir; `img/` at root is non-standard and confusing |
| Resume PDF handling | Remove file from `.gitignore`, commit it — or remove the iframe viewer entirely since inline HTML already shows resume | TBD — ask user preference |
| Double scanline fix | Remove `.monitor-overlay::after` scanline layer, keep only `.screen::before` which matches DESIGN.md | DESIGN.md spec is authoritative; outer scanline appears to be a leftover |

## Approval Gate

**Status**: approved by user
**User decision**: "Drop iframe viewer" for Resume PDF (#4) — remove the iframe code, delete the PDF files, remove from .gitignore
**Pending action**: Write `.omo/plans/portfolio-refactor.md` with full todo breakdown
**Approach**: 6 work items, sequential + parallel where dependencies permit

---

## Brief for the user

**6 issues, ordered by dependency:**

1. **Extract modules** (prerequisite for many others) — carve main.ts into `src/boot.ts`, `src/window-manager.ts`, `src/apps/*.ts`, `src/desktop.ts`
2. **Replace hardcoded colors** — convert all inline `style="color: #..."` to CSS custom properties + classes
3. **Deduplicate wallpapers** — remove `img/wallpapers/`, verify `./img/wallpapers/...` paths still resolve through Vite
4. **Fix Resume PDF** — either commit the PDF (remove from `.gitignore`) or drop the iframe viewer since inline HTML resume is what shows
5. **Replace emoji icons** — swap to inline SVG icons for all UI icon emoji
6. **Fix double scanline** — remove `.monitor-overlay::after` scanlines, keep `.screen::before`

Item 1 must come first (module extraction touches everything). Items 3 & 4 are asset-only. Items 2, 5, 6 touch CSS + JS in parallel after 1 is done.

**One question**: For the Resume PDF (#4) — your inline HTML resume is what actually displays in the "Resume" window. The `iframe` viewer (line 616) is hidden inside Files > Documents > double-click. Do you want to **keep the PDF viewer** (commit the PDF, remove from `.gitignore`) or **drop it entirely** (remove the iframe code) since the inline HTML already shows everything?
