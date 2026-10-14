# Null Dimension

Personal engineering lab and developer portfolio of Hrishi, Software Engineer.
Beyond the ordinary. Into the undefined.

Live: https://null-dimension.github.io/

## Overview

Static site with no build step. Plain HTML, CSS and JavaScript plus a vendored
copy of Three.js. Open `index.html` and it runs.

Stack: Space Grotesk + Inter, dark sci-fi theme with `--accent: #6d63ff`,
light/dark toggle persisted as `nd-theme`.

## Features

- Hero with WebGL black hole (Three.js r160, vendored) and a CSS portal fallback
- Custom cursor suite: dot, lagging ring, trail particles, constellation canvas,
  spotlight, card tilt, idle scanner, glitch accents
- Hold-to-charge pointer: progress ring, inward accretion particles, discharge
  wave on release; quick taps get a short void-pop
- Touch pipeline: single-touch tracking, scroll-vs-hold detection, layer
  auto-hide after lift
- Gyro black-hole FX on mobile: tilt drives parallax plus a surge state that
  speeds the shader and flares the disk; iOS enables via tap (permission rule),
  Android starts automatically
- Void-dive warp transitions on anchor navigation and back-to-top
- Boot sequence (skipped on repeat visits and under reduced motion)
- Cmd+K / Ctrl+K command palette: sections, projects, prior versions, actions
- Section ambience zones, scroll-spy nav, animated stat counters, starfield
- Experience timeline and education inside About; Main Stack + Previously
  skills tiers; Live Experiments + Archive project cards
- Footer with prior version links (v0, v1, v2 current)

## Structure

```
index.html
css/styles.css
js/main.js      warp, nav, to-top, scroll-spy, reveals, counters, starfield
js/boot.js      boot sequence
js/palette.js   command palette entries
js/cursor.js    cursor FX, charge/discharge, touch pipeline
js/hero3d.js    WebGL scene, gyro parallax and surge
vendor/three.min.js
```

## Getting started

```sh
git clone https://github.com/null-dimension/null-dimension.github.io.git
cd null-dimension.github.io
```

Then either open `index.html` directly or serve the folder:

```sh
npx serve .
```

No install and no build.

## Customizing

- Content lives in `index.html`: hero copy, about bio, timeline, project cards,
  skill lists, contact email, footer links.
- Palette entries live in `js/palette.js` and mirror the sections and projects.
- Accent color is `--accent` in `css/styles.css`; fonts are loaded in the head
  of `index.html`.
- Brand skill icons are fetched from `cdn.simpleicons.org`; a neutral nodes
  glyph covers marks unavailable there.

## Accessibility and devices

- `prefers-reduced-motion` is respected across boot, reveals, cursor FX and
  the 3D scene.
- Touch devices get no custom cursor dot; the FX layer hides shortly after lift.
- Native cursors return on text inputs; palette dialog follows standard
  keyboard patterns.

## Credits

- Three.js r160, vendored under `vendor/`
- Skill brand marks via Simple Icons CDN and inline SVG
