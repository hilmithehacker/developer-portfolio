````md
# METROPOLIS — DESIGN SYSTEM MANUAL
## Interactive Urban Planning Portfolio System

> Project Code: `PWK-HUD-V3`
> Discipline Focus: Urban & Regional Planning (PWK), Spatial Intelligence, GIS Visualization, Urban Analytics, Digital Cartography

---

# 1. SYSTEM OVERVIEW

METROPOLIS is an experimental digital portfolio ecosystem designed to represent urban planning not as static documentation, but as a living spatial intelligence environment.

The system combines:
- GIS-inspired HUD interfaces
- interactive spatial storytelling
- modern urban visual aesthetics
- analytical planning simulations
- portfolio presentation architecture
- immersive motion systems
- responsive data telemetry

The visual identity merges:
- cyberpunk urbanism,
- spatial analytics dashboard systems,
- architectural editorial layouts,
- and modern metropolitan cartography.

This platform is not intended to feel like a normal portfolio website.

It must feel like:
- entering a metropolitan control center,
- opening an urban planning operating system,
- or interacting with a speculative city intelligence engine.

Because apparently urban planners now need cinematic interfaces just to prove they can read a zoning map.

---

# 2. CORE DESIGN PHILOSOPHY

## 2.1 Design Principles

### A. Spatial Precision
All layouts must follow rigid modular geometry inspired by:
- GIS viewport systems
- CAD drafting boards
- satellite telemetry dashboards
- urban blueprint structures

The interface must communicate:
- control,
- measurement,
- analysis,
- and systems thinking.

---

### B. Living Data Environment

Every page behaves like:
- an active analytical machine,
- not a static scrolling website.

UI elements should constantly imply:
- live monitoring,
- system diagnostics,
- urban simulation,
- environmental sensing.

Examples:
- fake coordinate trackers,
- layer toggles,
- telemetry counters,
- dynamic grids,
- spatial scanlines,
- live metrics.

---

### C. Urban Narrative Architecture

The website should tell a story:
- from macro-scale territorial systems,
- down to neighborhood-scale interventions,
- ending at human-scale design outcomes.

Narrative hierarchy:
1. Territory
2. Infrastructure
3. Accessibility
4. Social systems
5. Human experience

---

### D. Cinematic Interaction

Transitions must feel:
- fluid,
- deliberate,
- spatial,
- physically weighted.

No generic web animations.

Interactions should resemble:
- map transitions,
- tactical HUD interfaces,
- architectural presentations,
- spatial overlays.

---

# 3. VISUAL LANGUAGE

# 3.1 Color System

## Primary Base Colors

| Name | Hex | Purpose |
|---|---|---|
| Blueprint Black | #060B18 | Main background |
| Deep Navy | #0A1329 | HUD panel base |
| Steel Blue | #11224D | Borders & inactive components |
| Graphite Grid | #1B263B | Spatial grid overlays |
| Frost White | #E5E7EB | Main typography |

---

## Spatial Function Colors

| Function | Hex | Meaning |
|---|---|---|
| Cyber Cyan | #06B6D4 | Data telemetry |
| Urban Green | #10B981 | Sustainability / RTH |
| Transit Purple | #A78BFA | Transportation systems |
| Urban Yellow | #F59E0B | Economic activity |
| Urban Red | #EF4444 | Risk / Vulnerability |
| Infrastructure Blue | #3B82F6 | Utilities & infrastructure |
| Planning Orange | #F97316 | Urban intervention |
| Density Pink | #EC4899 | Population density |

---

## Dynamic Slide Color Logic

Each horizontal section must have a distinct atmospheric identity.

Example:
- Slide 01 → Deep Navy + Cyan
- Slide 02 → Yellow + Black
- Slide 03 → White + Black
- Slide 04 → Purple + Cyan
- Slide 05 → Red + Dark Navy
- Slide 06 → Green + Blueprint

Color transitions must feel intentional and urban-themed.

No random aesthetic chaos pretending to be “creative direction.”

---

# 4. TYPOGRAPHY SYSTEM

## Display Typography

### Primary Display Font
`Space Grotesk`

Used for:
- hero titles,
- planning headlines,
- spatial indexes,
- urban metrics.

Characteristics:
- geometric,
- modern,
- architectural,
- wide proportion.

---

## Body Typography

### Primary Reading Font
`Inter`

Used for:
- descriptions,
- analytical writing,
- project explanations,
- metadata.

Characteristics:
- high readability,
- clean UI density,
- dashboard-compatible.

---

## Technical Typography

### HUD / Telemetry Font
`IBM Plex Mono` or system monospace

Used for:
- coordinates,
- spatial metrics,
- timestamps,
- layer controls,
- diagnostics.

---

# 5. INTERACTION SYSTEM

# 5.1 Scroll Architecture

The website uses:
- horizontal cinematic slide navigation,
- combined with vertical micro-scroll zones.

Core behavior:
- desktop → horizontal immersive storytelling,
- mobile → vertical adaptive layout.

Framework:
- GSAP ScrollTrigger
- Lenis Smooth Scroll

---

# 5.2 Cursor System

Custom HUD cursor required.

Features:
- crosshair reticle
- coordinate telemetry
- subtle lag interpolation
- hover magnetic effect
- interaction pulse

Cursor HUD displays:
- fake LAT/LNG
- zoom level
- interaction status
- spatial mode

---

# 5.3 Motion Language

Animations must simulate:
- scanning,
- layering,
- urban data rendering,
- system activation.

Allowed animation styles:
- opacity interpolation
- blur reveal
- directional slide
- vector tracing
- grid scaling
- spatial masking

Avoid:
- bounce animation
- cartoon easing
- excessive rotation
- generic floating effects

This is an urban intelligence interface, not a crypto landing page designed during caffeine psychosis.

---

# 6. PAGE ARCHITECTURE

# 6.1 Global Navigation

Fixed HUD navigation.

Contains:
- logo
- spatial mode indicator
- menu system
- social links
- telemetry status

Behavior:
- semi-transparent glassmorphism
- backdrop blur
- reactive hover glow

---

# 6.2 Homepage Structure

```plaintext
[ HERO URBAN STATEMENT ]
[ TERRITORIAL VISUALIZATION ]
[ PROJECT SLIDE ENGINE ]
[ GIS ANALYTICS LAYER ]
[ POLICY SIMULATOR ]
[ DATA TELEMETRY ]
[ CREATIVE URBAN LAB ]
[ RESEARCH ARCHIVE ]
[ CONTACT / CONSULTATION ]
````

---

# 6.3 Hero Section

Massive typography.

Example composition:

* oversized urban statements,
* layered GIS labels,
* moving coordinates,
* animated contour backgrounds.

Hero must immediately communicate:

* urban intelligence,
* systems thinking,
* spatial expertise.

---

# 6.4 Horizontal Project Slides

Each project behaves as:

* an independent urban environment.

Each slide contains:

* project title
* urban issue
* GIS layer visualization
* metrics
* motion graphics
* interactive overlays

Slide navigation:

* drag
* wheel
* keyboard
* touch swipe

---

# 7. GIS & SPATIAL VISUALIZATION SYSTEM

# 7.1 GIS Overlay Engine

Core visualization layers:

* road network
* land use
* elevation
* zoning
* flood risk
* accessibility
* density
* infrastructure

All rendered using:

* SVG
* Canvas
* lightweight WebGL

No heavy raster dependency.

Because loading 900 MB shapefiles directly into a browser is how people accidentally reinvent denial-of-service attacks.

---

# 7.2 Spatial Layer Controls

Layer system includes:

* opacity control
* toggle system
* analytical blending
* comparative overlays

Possible interactions:

* hazard vs settlement
* transport vs density
* infrastructure vs accessibility
* poverty vs public facilities

---

# 7.3 GIS Insight Engine

The interface automatically generates insights based on active layer combinations.

Examples:

* Transit + Density → identifies TOD opportunity
* Flood + Settlement → identifies vulnerability
* Industry + Housing → identifies conflict zones
* RTH + Heat Density → identifies ecological deficit

---

# 8. DATA VISUALIZATION

Required dashboard elements:

* animated counters
* radar charts
* temporal graphs
* spatial heatmaps
* accessibility diagrams
* Sankey diagrams
* urban flow simulations

Visualization style:

* minimal,
* scientific,
* high-contrast,
* cinematic.

---

# 9. GLASSMORPHISM SYSTEM

All floating panels use:

* semi-transparent backgrounds
* subtle borders
* high blur backdrop
* soft neon edges

Example:

```css
background: rgba(255,255,255,0.06);
backdrop-filter: blur(18px);
border: 1px solid rgba(255,255,255,0.12);
```

---

# 10. GRID SYSTEM

Core layout:

* 12-column modular grid
* asymmetric composition
* architectural spacing

Spacing ratio:

* 4px base system

---

# 11. RESPONSIVE STRATEGY

Desktop:

* cinematic experience
* horizontal storytelling
* multi-panel overlays

Tablet:

* simplified HUD
* reduced motion

Mobile:

* vertical adaptive stack
* touch-first controls
* simplified telemetry

---

# 12. PERFORMANCE STANDARDS

Maximum target:

* under 25 MB total deployment size

Optimization strategy:

* inline SVG graphics
* AVIF/WebP media
* lazy-loaded WebGL
* dynamic imports
* minimal dependency count

Target metrics:

* Lighthouse > 90
* 60 FPS interaction
* <2s initial load

---

# 13. TECHNOLOGY STACK

## Core Framework

* Next.js
* React

## Styling

* TailwindCSS

## Animation

* GSAP
* Framer Motion

## Scroll Engine

* Lenis

## 3D / WebGL

* Three.js
* React Three Fiber

## GIS Rendering

* MapLibre GL
* Turf.js

## Data Handling

* Local JSON
* Headless CMS optional

---

# 14. FILE ARCHITECTURE

```plaintext
/metropolis
│
├── public/
│   ├── svg/
│   ├── textures/
│   ├── maps/
│   └── data/
│
├── src/
│   ├── app/
│   ├── components/
│   │   ├── hud/
│   │   ├── gis/
│   │   ├── motion/
│   │   ├── portfolio/
│   │   └── telemetry/
│   │
│   ├── systems/
│   │   ├── spatial-engine/
│   │   ├── animation-engine/
│   │   └── analytics-engine/
│   │
│   ├── shaders/
│   ├── styles/
│   └── utils/
│
└── package.json
```

---

# 15. ACCESSIBILITY & USABILITY

Requirements:

* keyboard navigable
* touch-friendly
* reduced motion mode
* contrast-safe typography
* scalable text sizes

---

# 16. FINAL CREATIVE DIRECTION

METROPOLIS must feel like:

* a speculative urban operating system,
* a cinematic GIS laboratory,
* an architectural intelligence dashboard,
* and a futuristic planning manifesto.

Not a template.

Not a Behance clone.

Not another minimalist portfolio where someone puts Helvetica on a black background and calls it “digital experience.”

The interface must embody:

* spatial thinking,
* analytical rigor,
* urban imagination,
* and systems-level planning intelligence.

```
```
