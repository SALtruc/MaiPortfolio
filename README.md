# Ngoc Mai Nguyen — portfolio

A business portfolio built around Mai’s real portrait, a draggable project showcase, a layered photo deck, and a direct contact section. Visitors can select a project, swipe photographs or use keyboard arrows to explore short stories. GSAP adds portrait float, photo entry motion and pointer-responsive 2.5D depth. Journey restores the original desk concept as a detailed Three.js scene: five objects open five chapters of learning and growth. Ambient motion pauses outside the viewport and when the tab is hidden. The motion toggle and system reduced-motion preference stop animation while preserving all controls.

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
- `src/HomePage.tsx`: landing page, hero GSAP lifecycle and contact.
- `src/InteractiveStories.tsx` and `src/interactive-stories.css`: project selection, pointer/touch drag, layered photo deck, keyboard controls and responsive layouts.
- `src/motion-home.css`: Outfit typography, paper/ink/cobalt identity, responsive landing-page layouts and shared navigation.
- `src/Pages.tsx`: about, contact and route exports.
- `src/JourneyPage.tsx` and `src/journey-desk.css`: the growing/learning direction, five-chapter selection, short story panel and expandable original reflections.
- `src/JourneyDesk.tsx`: lazy-loaded WebGL scene, pointer picking, drag/zoom/view controls, projected keyboard-accessible markers and pause/visibility cleanup.
- `src/desk/buildJourneyScene.ts`: physical desk objects, material details, canvas textures, authentic photo texture and resource disposal.
- `src/WorkPage.tsx` and `src/WorkReel.tsx`: project collection, decision tabs and evidence galleries.
- `src/ScrollMotion.tsx`: intersection-driven entry reveals, scroll-linked photo movement and frame tilt. Only photographs close to the viewport receive animation-frame updates; movement stops when paused or reduced motion is requested.
- `src/Desk.tsx`: earlier interactive desk, preserved in source but no longer loaded by the landing page.
- `src/styles.css`: typography, blue/white tokens, responsive layout and motion.
- `src/refinement.css`: existing chapter styling; the new landing page has its own scoped stylesheet.
- `public/assets/`: genuine portfolio photos plus the generated decorative `cobalt-ribbon.png`. The ribbon is a 2D render with animated 2.5D transforms, not a live WebGL model.
- `public/ngoc-mai-cv.pdf`: the supplied CV page, which predates TikTok. Replace when a revised CV is ready.
- `docs/sources.md`: source links, discrepancies and accuracy decisions.
- `docs/design-motion/`: the four current generated section references and Antigravity/Argon direction review. Generated sample faces in references are illustrative only and are never used in the site.
- `docs/reference-research/`: captured research of the eight requested websites. Landbook's live browser view was blocked by verification; its public indexed content was consulted instead.

The latest TikTok role is verified from LinkedIn and uses 2026–present. Older source CV information is preserved with its source, without inventing new TikTok achievements.

Routes: `#/`, `#/journey/4`, `#/work/checkpoint`, `#/work/michelin`, `#/notes`, `#/hello`. The chronological navigation lives within My Path. Project Stories contains practical decisions and evidence rather than repeating the personal journey. Links support browser back/forward and direct opening.

## Browser verification

With the app running and Python Playwright installed:

```sh
python scripts/verify-motion.py
python scripts/verify-journey-desk.py
```

The default target is production preview on port 4173. Set `PORTFOLIO_URL` to test another local server. Checks cover 320px, 375px, 390px, 768px, 1024px and 1440px layouts; project selection and drag feedback; photo deck mouse/touch/keyboard controls; mobile navigation; evidence dialogs; clipboard copy; CV delivery; and reduced motion. Screenshots and JSON results are saved to `docs/verification/`. `scripts/capture-motion.py` captures all four scenes from the dev server. `scripts/capture-interactive.py` captures the new middle sections and records their interactions from production preview.
