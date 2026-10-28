# Argon Journey Desk Quality Improvements Plan (2026-10-28)

## Goal
Inspect the complete Journey 3D desk implementation at checkpoint `20ae9a9` (`src/JourneyPage.tsx`, `src/JourneyDesk.tsx`, `src/desk/buildJourneyScene.ts`, `src/journey-desk.css`, `src/App.tsx`) and verification screenshots (`docs/verification/journey-desk-*.png`), identify the highest-impact visual, interaction, performance, and accessibility quality issues, and directly implement concrete improvements in local Journey source files while preserving homepage, truthful facts in `stories.ts`/`content.ts`, routes, accessibility, reduced-motion/offscreen pause, and WebGL fallback.

## Key Decisions
1. **Eliminate Lamp / Photo Frame Overlap & Top-Edge Clipping**:
   - In `src/desk/buildJourneyScene.ts`, reposition the desk lamp (`lamp`) forward-left (`(-4.35, 0.08, -0.78)`) and refine the RMIT Careers photo frame (`frame`) placement (`(-2.85, 0.12, -1.52)`) and height so their silhouettes never collide in orthographic projection and never clip against the top canvas edge when focusing chapters.
   - In `src/JourneyDesk.tsx`, raise the baseline vertical focus center (`focus.y = 0.38`, `focus.z = -0.08`) and clamp per-chapter focus offsets so background objects stay comfortably framed inside the canvas on selection.
2. **Prevent Marker & Tooltip Collisions With Object Typography and Toolbar**:
   - Move the five 3D marker anchor offsets (`anchors`) to clean corner/bezel positions on each object so the numbered badges no longer sit on top of `"People. Then numbers."`, `"A next step."`, `"Always Day 1."`, or the Michelin solar model.
   - Add edge-aware tooltip placement (`data-tip="bottom"` when near the top toolbar, horizontal edge clamping, and hover state syncing between 3D raycast hover and DOM marker badges).
3. **Upgrade Material Contrast, Authentic Object Details & Font-Ready Textures**:
   - Differentiate the Michelin folder (`#2f5349` deep forest) from the `#b7cbbb` sage desk mat so it no longer blends into the mat.
   - Give the CTM phone a high-contrast deep navy case (`#25364f`) with a coral frame and crisp screen card hierarchy, print an authentic `"RMIT CAREERS · Career Checkpoint"` lanyard pass texture onto the previously blank white badge mesh beside the photo frame, add an inner cream lining to the opening Council notebook cover, and add a warm emissive diffuser glow to the desk lamp.
   - Upgrade canvas textures to use `'Outfit', 'DM Sans', sans-serif` and automatically redraw once `document.fonts.ready` resolves so 3D typography is crisp and consistent with the site.
4. **Reduce Redundant Per-Frame DOM Writes & Polish Interactions**:
   - Cache projected marker positions/states in `src/JourneyDesk.tsx` so `style.transform`, `dataset.tip`, and `dataset.hover` are only mutated when values change, avoiding redundant DOM style writes every frame during subtle ambient plant sway.
   - Include notebook cover and laptop screen hinge deltas in `shadowMap.needsUpdate`, and support `Escape` to reset from a focused chapter to the whole desk.
5. **Responsive Mobile Readability & Honest Warm Copy**:
   - Surface the authentic turning-point quote (`story.title` + `story.turn`) in `src/JourneyPage.tsx` alongside the concise lesson summary while keeping the full reflection disclosure intact.
   - Keep numbered object badges visible as non-blocking visual pins on mobile viewports (`pointer-events: none` on `<= 600px` so native vertical touch scrolling and horizontal canvas drag tests remain 100% intact) and horizontally center the active chapter button inside the mobile `.j-chapters` strip without altering `window.scrollY`.

## Steps
- [x] Inspect baseline Journey files (`src/JourneyPage.tsx`, `src/JourneyDesk.tsx`, `src/desk/buildJourneyScene.ts`, `src/journey-desk.css`, `src/App.tsx`) and verification screenshots.
- [x] Improve 3D scene composition, object silhouettes, and material/texture quality in `src/desk/buildJourneyScene.ts`.
- [x] Improve camera framing, focus easing, tooltip collision handling, keyboard Escape reset, and DOM marker update cost in `src/JourneyDesk.tsx`.
- [x] Enhance story panel warmth, mobile horizontal chapter strip auto-centering, and edge-aware marker tooltips in `src/JourneyPage.tsx` and `src/journey-desk.css`.
- [x] Update `docs/design-motion/journey-growing.md` and `docs/design-motion/argon-journey-review.md` to document the implemented quality improvements and verification checks for Codex.
