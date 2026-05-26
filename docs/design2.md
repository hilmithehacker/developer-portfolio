---
name: Metropolis Urban OS
colors:
  surface: '#0e1320'
  surface-dim: '#0e1320'
  surface-bright: '#343948'
  surface-container-lowest: '#080e1b'
  surface-container-low: '#161b29'
  surface-container: '#1a1f2d'
  surface-container-high: '#242a38'
  surface-container-highest: '#2f3443'
  on-surface: '#dde2f5'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dde2f5'
  inverse-on-surface: '#2b303f'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#cebdff'
  on-tertiary: '#381385'
  tertiary-container: '#b096ff'
  on-tertiary-container: '#442490'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e8ddff'
  tertiary-fixed-dim: '#cebdff'
  on-tertiary-fixed: '#21005e'
  on-tertiary-fixed-variant: '#4f319c'
  background: '#0e1320'
  on-background: '#dde2f5'
  surface-variant: '#2f3443'
  blueprint-base: '#060B18'
  blueprint-panel: '#0A1329'
  blueprint-border: '#1E3E7D'
  planning-orange: '#F97316'
  hazard-red: '#EF4444'
  industrial-yellow: '#F59E0B'
  density-pink: '#EC4899'
  infrastructure-blue: '#3B82F6'
typography:
  hero-display:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  section-title:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0.05em
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  telemetry-data:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  unit-1: 0.25rem
  unit-2: 0.5rem
  unit-4: 1rem
  unit-8: 2rem
  unit-12: 3rem
  unit-20: 5rem
  gutter: 2rem
  margin-safe: 5vw
---

## Brand & Style

This design system establishes a high-fidelity "Urban Operating System" aesthetic. It moves beyond traditional portfolio layouts to simulate a futuristic command center for spatial intelligence. The brand personality is technical, authoritative, and visionary, positioning urban planning as an active, data-driven science rather than static architecture.

The visual style is a hybrid of **Glassmorphism** and **Technical Minimalism**. It utilizes high-blur translucent panels, laser-thin structural lines, and a "dark-mode first" blueprint foundation. The emotional response should be one of immersion—as if the user has gained access to a restricted GIS (Geographic Information System) terminal used to monitor and simulate metropolitan growth.

## Colors

The palette is anchored in "Blueprint Black" and "Deep Navy" to provide a high-contrast environment where functional data can pop. 

- **Primary (Cyber Cyan):** Reserved for active data, telemetry, and primary UI interactions.
- **Secondary (Urban Green):** Applied to sustainability metrics and environmental layers.
- **Tertiary (Transit Purple):** Used exclusively for transportation networks and mobility data.
- **Functional Spectrum:** A specific set of named colors (Orange, Red, Yellow) is used to categorize urban interventions, hazards, and industrial zones, mimicking the standardized color-coding of GIS software.

Surfaces should utilize the `blueprint-panel` with 70% opacity and a 12px-18px backdrop blur to maintain the glassmorphic depth.

## Typography

The typography system follows a tripartite strategy:
1.  **Display (Space Grotesk):** Wide, geometric, and architectural. Used for massive hero statements and section titles to evoke engineering precision.
2.  **Interface (Inter):** Highly legible and neutral. Used for all narrative descriptions and standard UI components to ensure clarity amidst complex data.
3.  **Telemetry (IBM Plex Mono):** Technical and monospaced. Used for "living data" such as coordinates, timestamps, and GIS metrics.

Always use `telemetry-data` for any element that implies system output. Headlines should favor tight tracking, while labels require generous letter-spacing for a "serialized" look.

## Layout & Spacing

This design system employs a **12-column fixed-fluid hybrid grid**. The container respects a maximum width of 1280px (7xl), but background elements like grid lines and map viewports must bleed to the screen edges.

The layout is built on a strict **4px base unit**. Spacing should feel "modular," with HUD panels often snapped to the grid. 

**Responsive Behavior:**
- **Desktop:** Immersive horizontal slide engine using GSAP. Panels are positioned asymmetrically to simulate a multi-monitor setup.
- **Tablet:** 2-column grid, simplified HUD elements, reduced motion.
- **Mobile:** Vertical stack with simplified telemetry. The custom cursor is disabled in favor of standard touch interactions.

## Elevation & Depth

Depth is not created through shadows, but through **Tonal Layering** and **Glassmorphism**.

1.  **Level 0 (Background):** `blueprint-base` with a persistent SVG grid overlay (40px major, 10px minor lines) at 5% opacity.
2.  **Level 1 (Surface):** Project cards and section backgrounds using `blueprint-panel` with high-blur (18px) backdrops.
3.  **Level 2 (HUD):** Floating navigation and telemetry widgets. These feature 1px semi-transparent borders in `cyber-cyan`.
4.  **Level 3 (Interactive):** The "Spatial Cursor" and active tooltips. These use an outer glow (`box-shadow: 0 0 15px rgba(6, 182, 212, 0.3)`) rather than a traditional drop shadow to simulate light emission.

## Shapes

The shape language is "Modular-Geometric." While the base system is `Rounded` (8px), the hierarchy varies to define structural importance:

- **Large Panels/Cards:** 16px (`rounded-2xl`) to soften the high-tech edge.
- **Inner Widgets:** 12px (`rounded-xl`) for dashboard-style nesting.
- **Inputs/Buttons:** 8px (`rounded-lg`) for a precise, tactile feel.
- **Status Indicators/Pills:** Full rounded (`rounded-full`) to denote "live" or "active" status.

Borders are strictly 1px to maintain the blueprint/drafting aesthetic.

## Components

### Spatial HUD Elements
Floating panels used for telemetry. They must include a `label-caps` header and a `telemetry-data` content area. Borders should be `blueprint-border` at 20% opacity.

### GIS Layer Toggles
Switches should not look like standard iOS toggles. They should resemble "Circuit Switches"—rectangular, using `Cyber Cyan` for the "On" state with a subtle inner glow.

### Interactive Metric Counters
Large numbers that "roll" into view using `Space Grotesk`. Accompanied by a small HUD label indicating the unit of measurement (e.g., "HA", "SQM", "LAT").

### Custom Cursor (Reticle)
A 40px diameter crosshair that follows the mouse. It features a small text block to the bottom-right displaying real-time X/Y coordinates in `telemetry-data`.

### Buttons (Vector Style)
Primary buttons are outlined with 1px `Cyber Cyan`. On hover, the button fills with a cyan-to-transparent gradient and triggers a "scanline" animation across the surface.

### Motion Language (Cinematic)
- **Scanning:** 1px horizontal line that periodically wipes vertically across panels.
- **Vector Tracing:** SVG paths should animate using `stroke-dashoffset` when entering the viewport.
- **Spatial Reveal:** Content should use a combination of `opacity: 0` and `filter: blur(10px)` to transition in.