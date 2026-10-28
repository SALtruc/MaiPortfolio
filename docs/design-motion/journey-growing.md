# Journey: youthful and growing

The user wanted the earlier 3D desk restored to Journey, with more detail and sharpness, and a youthful, growing personality. The previous desk was preserved in source but not connected to a route. Journey itself displayed five long consecutive reflections. The old scene's distant camera, strong ambient light and similar material properties made its objects feel small and uniformly plastic.

## Collaboration and decisions

Antigravity / Gemini 4 Argon High completed independent source inspection and art direction through AgentDesk task `t_2f416858`, run `r_14c0c946`. Its full response is in `argon-journey-review.md`.

Adopted: a warm study desk, authentic chapter material, different paper/metal/ceramic surfaces, closer composition, five chapter objects, slight focus and lift on selection, normal touch scrolling, accessible HTML controls and render-on-demand when motion is paused. The homepage stays intact.

Adapted: an orthographic camera keeps objects legible across widths; CTM uses a phone and Michelin uses the folder and small solar-panel model. Long reflections live in a disclosure inside the selected chapter, rather than repeating five full articles below the scene. The proposed count of 45 clubs was not added; existing sources remain authoritative. The desk objects are a visual storytelling model, not claimed photographs of Mai's personal possessions or workplace systems.

## Local changes

- Five objects connect to `#/journey/0` through `#/journey/4`, with browser history, a chapter strip, arrow-key navigation, previous/next controls and direct URLs.
- A birch desktop, stitched mat, page layers, notebook wire binding and opening cover, thin laptop bezels, instanced keycaps, speaker grilles, metallic hinges, clipped project sheets, solar cells, phone, cable, desk lamp, mug, layered books and plant add physical detail.
- Lighting uses hemisphere fill, directional daylight, a reflection environment and a 2048px shadow map. Shadow maps refresh during object/view changes; the small ambient plant sway reuses the static shadow. No depth-of-field blur. Render resolution follows device pixel ratio up to 2; generated canvas maps use anisotropic filtering.
- Drag rotates the desk; zoom and rotation also have buttons. Native vertical touch scrolling remains available. The scene pauses offscreen, in hidden tabs and with reduced motion. WebGL initialization/context failures leave all chapter content accessible.
- Three.js is loaded only when Journey's desk is mounted. Its production chunk is roughly 147KB gzip. Vite reports the uncompressed chunk over its 500KB warning threshold; this is a deliberate lazy-loaded scene, not a new homepage dependency.

Rendering configuration was checked against the [Three.js documentation](https://threejs.org/docs/). No new dependency was installed.

## Review and release status

Production build and 49 browser checks passed. Results are recorded alongside the verification script and artifacts in `../verification/journey-desk-*`. Browser checks use Chromium, including emulated touch, six viewport widths from 320 to 1440px, WebGL context loss and unavailable-WebGL fallback. A final accessibility check verifies the persistent live region updates across all five chapters. This is not a physical-device frame-time certification.

All changes are local for review. Nothing was pushed, merged or deployed, and no production service or configuration was changed. A future approved deployment would replace Journey's long scrolling layout with this interactive desk and chapter panel; existing chapter URLs, source reflections and project links remain usable. Reverting the Journey route/component imports and associated new files would restore the prior layout.

Skills used: redesign-existing-projects, motion-design, threejs-lighting, threejs-interaction, full-output-enforcement. The existing desk and captured earlier homepage were the visual reference; no generated human assets were introduced.
