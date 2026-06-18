# Retro macOS Portfolio — Design System

## 1. Brand Essence

Nostalgic interactive portfolio that simulates a retro Mac OS 9 experience inside a CRT monitor. Blends tech authenticity with playful interactivity. Every visual decision serves the illusion of using a classic Mac.

## 2. Color Palette

### CRT Monitor
| Token | Value | Usage |
|---|---|---|
| `--monitor-bezel` | `#2c2c2c` | Outer monitor frame |
| `--terminal-bg` | `#0c0c0c` | Boot terminal background |
| `--terminal-green` | `#00ff41` | Terminal text + glow |

### Mac OS 9 Platinum UI
| Token | Value | Usage |
|---|---|---|
| `--platinum-light` | `#d9d9d9` | Menu bar, light surfaces |
| `--platinum-base` | `#c0c0c0` | Classic Platinum mid-tone |
| `--platinum-dark` | `#999999` | Borders, dividers |
| `--platinum-highlight` | `#e8e8e8` | Window background, highlights |
| `--mac-desktop` | `#297e9e` | Desktop background (teal-blue) |

### Window Title Bars
| Token | Value | Usage |
|---|---|---|
| `--mac-titlebar-start` | `#4a80d4` | Title bar gradient start |
| `--mac-titlebar-end` | `#2159b0` | Title bar gradient end |
| `--mac-titlebar-text` | `#ffffff` | Title bar text |

### Window Chrome
| Token | Value | Usage |
|---|---|---|
| `--mac-window-bg` | `#ffffff` | Window content area |
| `--mac-window-border` | `#666666` | Window border |
| `--mac-shadow` | `rgba(0,0,0,0.35)` | Window drop shadow |

## 3. Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| UI text | Inter | 400 / 500 / 600 / 700 | 12px–14px |
| Terminal | VT323 | 400 | 1.5rem |
| Window title | Inter | 600 | 12px |
| Headings | Inter | 700–800 | 14px–22px |

## 4. Spacing Scale

| Token | Value |
|---|---|
| `--header-height` | 25px |

Base unit: 4px. Common gaps: 8px, 12px, 15px, 16px, 20px, 30px.

## 5. Component Architecture

### CRT Frame (`monitor-overlay`)
- Outer bezel, scanline overlay, glass curvature
- Scanlines: `linear-gradient` at 2px + RGB split at 3px
- Boot-time only: flicker animation (`screen.boot-anim`)

### Window System
- Title bar: blue gradient (`#4a80d4` → `#2159b0`)
- Controls: circular macOS-style (close=red, minimize=yellow, maximize=green placed left)
- Shadow: `0 4px 16px rgba(0,0,0,0.35) + 0 1px 3px rgba(0,0,0,0.15)`
- Resizer: bottom-right corner grip
- Draggable by header, z-index stacking on click

### Dock
- Centered at bottom, translucent with `backdrop-filter: blur(10px)`
- Icons: 44×44px, hover scale 1.4× with -15px lift
- Tooltip appears on hover above icon
- Drag-to-reorder supported

### Menu Bar
- Height: 25px, light Platinum (`--platinum-highlight`)
- Apple icon on left, system clock + battery on right

## 6. Animation Principles

| Animation | Duration | Easing | Usage |
|---|---|---|---|
| Flicker | 0.15s | linear | CRT boot only |
| Dock hover | 0.3s | cubic-bezier(0.4,0,0.2,1) | Icon scale + lift |
| Window shadow | 0.2s | ease | Focus transitions |
| Blink | 1s | step-end | Terminal cursor |

- GPU-composited properties only (`transform`, `opacity`)
- No layout-animating properties
- CRT effects are presentational only — no functional dependency

## 7. Icon System

- PNG images for dock icons and file explorer
- HTML entities for paint toolbar tools (no emoji)
- No emoji used as UI icons
- SVG recommended for future additions
