# Michelin: solar coordination as the opening composition

## Final refinement

The first-pass case repeated a text/photo hero and buried its useful 3D model below another metric row. The refined case opens with a compact project masthead and the actual solar coordination model. The three source-backed quantities belong to its selectable stations: 12+ vendors, 15+ proposals and 4+ internal departments. Real dealership photography follows as evidence rather than competing with the model.

The user can select a station through the visible controls, keyboard arrows or the model markers, or drag horizontally to turn the scene. The chosen objects lift and highlight while a concise decision panel shows the corresponding action and why it mattered. Reset returns to the whole project. The canopy pitch selector, display-mode console, redundant large schematic and separate three-card metric row were removed.

## Implementation

- `src/cases/MichelinCase.tsx`: default `{ study: Study; paused: boolean }` API retained. Non-null host is captured after the ref guard, fixing TS18047 in the renderer closure.
- `src/cases/MichelinCase.css`: fully scoped to `.case-michelin`, responsive from 320px, with 44px controls and a complete reduced-motion path.
- `src/cases/michelin/buildSolarWorkbench.ts`: original tangible geometry retained; visible texture copy simplified to project coordination.
- Orthographic framing fits eight preallocated model-bound corners in camera space, with margins and current aspect ratio. Selection no longer pans or automatically zooms part of the model outside the frame. No per-frame vector allocation was added.
- Existing DPR cap, lighting, demand rendering when paused, offscreen/document visibility pause, context-loss handling and resource cleanup remain. A simple diagram and all focus narratives remain usable without WebGL.
- Scoped GSAP entrance, object focus response and scroll-linked decision-line reveal are cleaned up on unmount/pause. The actual renderer and physical model provide the signature interaction.

## Content

All three source decisions, the finance internship role, 12+/15+/4+ scope, support for contract finalisation and original source link remain. The genuine dealership photo opens at full size. Broader monthly reporting and review of 500+ documents spanning eight years are presented as wider finance responsibilities. No solar capacity, savings or financial return has been invented. The model is explicitly illustrative, not a site plan.

## Verification

- `npx tsc -b --pretty false`: passed on current shared source after the host fix.
- `git diff --check` for the owned source files: passed.
- Browser review: 1440x1000, 1280x720, 390x844 and 320x844 had no horizontal overflow, one h1, one live canvas and working station selection; no uncaught page errors.
- Forced unavailable-WebGL review: diagram and proposal narrative remained usable.
- Motion, pause, real touch markers, keyboard focus selection, rotation, image dialog and native vertical swipe reviewed separately in `docs/verification/project-experiences/michelin-motion-review.json`.
- Physical-device frame pacing was not measured. Root performs the final integrated route and release review.

Evidence: `docs/verification/project-experiences/michelin-refined-*.png`, `michelin-refined-review.json`, and `michelin-motion-review.json`.

All work is local. No push, deployment or production change.
