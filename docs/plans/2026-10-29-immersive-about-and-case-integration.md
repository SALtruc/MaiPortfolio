# Plan: Immersive Full-Desk About, Centered Photo Fan & Case-Module Integration

**Date:** 2026-10-29
**Branch:** `agentdesk/t_4d59c9e2` (Base: `feat/dynamic-project-stories` @ `d687499`)

## Goal
Deliver the shared project case-module integration shell, redesign the About Mai interactive 3D desk workspace so the entire desk and readable chapter story fit together on desktop viewports without instructional clutter, and center the four-photo personal composition on Home.

## Key Decisions
1. **Shared Project Case Integration (`src/App.tsx`, `src/WorkPage.tsx`, `src/work.css`, `src/cases/case-shell.css`)**:
   - Pass the live `paused` state from `App` to `WorkPage` and into each lazy-loaded project case module (`{ study: Study; paused: boolean }`) without altering `App.tsx`'s tested history and scroll-restoration logic.
   - Replace the old generic detail body in `WorkPage.tsx` with a lazy registry mapping `council`, `michelin`, `checkpoint`, `careers-fair`, and `ctm` to `./cases/CouncilCase`, `./cases/MichelinCase`, `./cases/CheckpointCase`, `./cases/CareersFairCase`, and `./cases/CtmCase`.
   - Preserve `.visual-case.visual-case-${study.id}` with `data-project={study.id}`, top case breadcrumb/navigation, matching About chapter backlink, next-project exhibit, and 5-project collection footer, while delegating the single `<h1>` and case body to each case module.
2. **About Desk Workspace & Orthographic Whole-Desk Fit (`src/JourneyPage.tsx`, `src/JourneyDesk.tsx`, `src/journey-desk.css`)**:
   - Remove the instructional paragraph (`"Pick an object on my desk to explore the five chapters so far, or read my background below."`) and the three local navigation pill buttons (`01 Interactive 3D desk`, `02 Story & education`, `03 Leadership recognition`).
   - Craft a compact page intro with genuine personal context (RMIT Business Finance major / Digital Marketing minor & TikTok AI Data Service & Operations Intern) and active chapter status badge.
   - Size the desktop workspace (`min-width: 851px`) to fit within `100svh`/`100dvh` minus header and gutters (`~67%` left 3D desk stage, `~33%` right contained scrollable story panel, with the 5-chapter rail visibly bound at the bottom of the workspace) across `1280x720`, `1440x900`, and `1920x1080`.
   - Replace the clipping `1.06`/`1.18` selection auto-zoom and focus pan in `JourneyDesk.tsx` with an exact orthographic camera view-space bounding-box fit across the full table and props (including lifted selection states and bounded rotation `[-0.65, 0.65]`), highlighting the selected object via 3D lift, selection ring/material emphasis, and active marker state while keeping manual user zoom (`+`/`-`) and `Whole desk` reset.
   - Keep mobile in normal document flow with full table visible and no nested scroll trap.
3. **Centered Four-Photo Composition (`src/InteractiveStories.tsx`, `src/interactive-stories.css`)**:
   - Replace the left-weighted `[-2, -1, 0, 1]` slot formula in `AboutPlayground` with a symmetric even-four arrangement (`[-1.5, -0.5, 0.5, 1.5]` on desktop/tablet and centered active stack `[-1, 0, 1]` on mobile) so both bounding-box margins and card centroids are centered in the page while keeping all four real photos visible, interactive, and keyboard/swipe accessible.

## Steps
- [x] 1. Wire `paused` prop in `src/App.tsx` and implement lazy case-module routing shell in `src/WorkPage.tsx`, `src/cases/case-shell.css`, and `src/work.css`.
- [x] 2. Redesign `src/JourneyPage.tsx`, `src/JourneyDesk.tsx`, and `src/journey-desk.css` to remove the instructional copy and 3 local nav pills, fit the full desk + story + chapter rail in desktop viewports, and use projected-bounds orthographic camera fitting with 3D selection highlight.
- [x] 3. Update `AboutPlayground` in `src/InteractiveStories.tsx` and `src/interactive-stories.css` to center the 4-photo fan symmetrically while preserving `ProjectShowcase` and all motion/gesture controls.
- [x] 4. Document integration architecture and verification notes in `docs/design-motion/immersive-about-integration.md` and verify all owned files for strict TypeScript and contract compliance.
