# Journey: youthful and growing

The user wanted the earlier 3D desk restored to Journey, with more detail and sharpness, and a youthful, growing personality. The previous desk was preserved in source but not connected to a route. Journey itself displayed five long consecutive reflections. The old scene's distant camera, strong ambient light and similar material properties made its objects feel small and uniformly plastic.

## Collaboration and decisions

Antigravity / Gemini 4 Argon High completed initial independent source inspection and art direction (`t_2f416858`, run `r_14c0c946`), followed by Codex's baseline implementation (`20ae9a9`) and Argon's direct code quality review and implementation passes (`t_1a1d8eea`, runs `r_7a57af17` and `r_f8ac9d8a`). Full review and implementation details are in `argon-journey-review.md`.

Adopted: a warm study desk, authentic chapter material, different paper/metal/ceramic surfaces, closer composition, five chapter objects, slight focus and lift on selection, normal touch scrolling, accessible HTML controls and render-on-demand when motion is paused. The homepage stays intact.

Adapted: an orthographic camera keeps objects legible across widths; CTM uses a phone and Michelin uses the folder and small solar-panel model. Long reflections live in a disclosure inside the selected chapter, rather than repeating five full articles below the scene. Existing sources in `stories.ts` and `content.ts` remain authoritative. The desk objects are a visual storytelling model, not claimed photographs of Mai's personal possessions or workplace systems.

## Local changes

- Five objects connect to `#/journey/0` through `#/journey/4`, with browser history, a chapter strip, arrow-key navigation, previous/next controls and direct URLs.
- A birch desktop, stitched mat, page layers, notebook wire binding and opening lined cover, thin laptop bezels, instanced keycaps, speaker grilles, metallic hinges, deep-forest project folder with clipped analysis sheets, solar cells, navy/coral phone, cable, printed RMIT Career Ready lanyard pass, warm-lit desk lamp, mug, layered books and plant add physical detail.
- **Argon quality pass (`t_1a1d8eea`)**:
  - **Scene composition & camera framing**: Repositioned the desk lamp (`(-4.35, 0.08, -0.78)`) and RMIT Careers photo frame (`(-2.85, 0.12, -1.52)`) so the lamp silhouette no longer overlaps behind the photo frame or clips at the top canvas edge when focusing chapters. Balanced vertical focus (`y = 0.38..0.52`) and clamped foreground Z shift (`<= 0.08`).
  - **Marker & tooltip collision prevention**: Moved 3D marker anchors to object corners/bezels so badges `1`–`5` never obscure headline typography on the notebook, phone, folder, photo frame, or laptop screen. Added dynamic `data-tip` edge-flipping (`top`/`bottom` and `-start`/`-end`) and `data-hover` synchronization between 3D canvas hover and DOM marker badges.
  - **Material contrast & font-ready textures**: Differentiated the Michelin folder (`#2f5349` deep forest) from the `#b7cbbb` sage desk mat, upgraded the CTM phone case to deep navy (`#25364f`) with a coral frame, added a printed Career Ready lanyard card texture to the badge beside the photo frame, added a cream inner lining to the Council notebook cover (`0.46 rad` open angle), and redrew all `CanvasTexture` surfaces with `'Outfit'` once `document.fonts.ready` resolves.
  - **Draw & DOM cost**: Eliminated per-frame `Vector3` allocations and cached projected marker transform/tooltip/hover strings so no redundant DOM writes occur during ambient plant sway; included cover and laptop hinge deltas in `shadowMap.needsUpdate`; added `Escape` to reset to the whole desk.
  - **Responsive & mobile marker touch targets**: Surfaced the truthful turning-point line (`story.title` + `story.turn`) in `.j-story-turn`, made all five mobile `1`–`5` markers interactive touch and keyboard controls with `44x44px` hit targets (`pointer-events: auto; touch-action: pan-y`) while retaining `22x22px` visual badge faces, unified stage pointer drag/tap handling on `.j-desk-canvas` so horizontal drag and vertical scroll work seamlessly without accidental chapter selection, and horizontally centered the active chapter button inside the mobile `.j-chapters` strip without affecting `window.scrollY`.
- Lighting uses hemisphere fill, directional daylight, a reflection environment and a 2048px shadow map. Shadow maps refresh during object/view/hinge changes; the small ambient plant sway reuses the static shadow. Render resolution follows device pixel ratio up to 2; generated canvas maps use anisotropic filtering.
- Three.js is loaded only when Journey's desk is mounted.

## Review and release status

Baseline production build and 49 browser checks (+5 persistent live-region checks) passed at `20ae9a9`, and 6 additional mobile marker hit-target and center-touch regression checks were added in `scripts/verify-journey-desk.py`. In Argon's headless environment (`r_f8ac9d8a`), shell commands and live browser execution are restricted by the sandbox, so verification was performed via source and coordinate analysis, ready for Codex's build and Playwright verification pass.

All changes are local for review. Nothing was pushed, merged or deployed, and no production service or configuration was changed.
