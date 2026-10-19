# Ngoc Mai Nguyen — portfolio

A white-and-blue portfolio with five separate destinations: an interactive 3D desk, a scrolling personal journey, five in-depth project stories, an about page and a contact postcard. Body text is 24px on desktop and at least 22px on mobile. Real LinkedIn photographs, scroll-linked motion and reduced-motion support are included.

## Run

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy the `dist` directory to any static host. No environment variables or backend required. The site has not been published to an external host.

## Edit

- `src/content.ts`: original CV-backed material and contact details.
- `src/stories.ts`: current journey reflections, project decisions, documented results and source links.
- `src/App.tsx`: navigation, hash routes and motion control.
- `src/Pages.tsx`: scrolling journey, detailed project stories with decision tabs and evidence galleries, about and contact.
- `src/ScrollMotion.tsx`: intersection-driven entry reveals and scroll-linked photo movement. Only photographs close to the viewport receive animation-frame updates; movement stops when paused or reduced motion is requested.
- `src/Desk.tsx`: interactive Three.js miniature desk, lazy loaded separately; clickable objects and equivalent HTML controls.
- `src/styles.css`: typography, blue/white tokens, responsive layout and motion.
- `public/assets/`: genuine photos extracted from the supplied deck.
- `public/ngoc-mai-cv.pdf`: the supplied CV page, which predates TikTok. Replace when a revised CV is ready.
- `docs/sources.md`: source links, discrepancies and accuracy decisions.
- `docs/design-references/`: generated visual references; filenames ending in `v2` describe the revised direction. Illustrative text and generated sample faces are not factual source material.

The latest TikTok role is verified from LinkedIn and uses 2026–present. Older source CV information is preserved with its source, without inventing new TikTok achievements.

Routes: `#/`, `#/journey/4`, `#/work/checkpoint`, `#/work/michelin`, `#/notes`, `#/hello`. The chronological navigation lives within My Path. Project Stories contains practical decisions and evidence rather than repeating the personal journey. Links support browser back/forward and direct opening.
