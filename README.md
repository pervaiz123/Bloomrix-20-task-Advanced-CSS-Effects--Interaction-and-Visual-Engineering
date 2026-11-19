# FORME — Objects in Motion

A product-led creative studio portfolio built with semantic HTML, modern CSS and vanilla JavaScript. The visual language is intentionally self-contained: all object and project artwork is original local SVG, with no remote images, fonts, or JavaScript dependencies.

## Run

Open `index.html` in a current browser, or start a local static server from this directory:

```bash
python -m http.server 8000
```

Visit `http://localhost:8000`.

## Project map

```text
advanced-css-showcase/
├── index.html
├── styles/main.css
├── scripts/main.js
├── assets/visuals/       # Original SVG artwork
├── screenshots/          # Desktop, tablet, mobile, light/dark, and interaction states
├── recording/            # Short MP4 interaction walkthrough
├── test-results.json     # Browser verification summary
└── README.md
```

## Interaction notes

- Product tiles respond to pointer position with perspective tilt and layered image depth. Quick view is presented in a native dialog.
- The six-work gallery has a keyboard-operable category menu and a project image lightbox.
- The notes section uses an accessible accordion; the mobile navigation reports its open state and closes after navigation.
- Appearance follows the operating-system color scheme on first visit. An explicit choice is saved locally and takes precedence on later visits.
- Scroll-linked CSS animation is used when supported. `IntersectionObserver` and a requestAnimationFrame progress/parallax path cover browsers without those timeline features.
- The View Transitions API is feature-detected for theme changes; the normal theme switch remains functional without it.

## Accessibility and compatibility

Visible focus styles, a skip link, descriptive image text, native buttons and dialogs, keyboard menu controls, and reduced-motion alternatives are included. Modern visual features use feature queries or have a useful base appearance. Animations emphasize transforms and opacity rather than layout-changing properties.

## Verification

`test-results.json` records the automated Chromium checks. The tested states include dialog/lightbox behavior, filtering, keyboard controls, theme persistence and system preference, reduced motion, 3D pointer response, scroll progress, and layout overflow at 1440px, 820px and 390px widths.

Screenshots are in `screenshots/`. A short browser walkthrough is in `recording/forme-showcase-walkthrough.mp4`.
