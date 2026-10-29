# Immersive About Desk, Centered Photo Fan & Shared Case Integration

## Scope & Ownership
This document records the integration shell and layout changes owned by the sixth Argon agent on branch `agentdesk/t_4d59c9e2` (base `d687499`):

- `src/App.tsx`: Passes live `paused` state to `WorkPage` while preserving all tested history and scroll-restoration behavior.
- `src/WorkPage.tsx` & `src/cases/case-shell.css`: Replaces the old generic project case body with lazy-loaded case modules (`CouncilCase`, `MichelinCase`, `CheckpointCase`, `CareersFairCase`, `CtmCase`), each receiving `{ study: Study; paused: boolean }`.
- `src/JourneyPage.tsx`, `src/JourneyDesk.tsx` & `src/journey-desk.css`: Removes the instructional sentence and three local navigation pills, introduces a compact header with genuine personal/role context and chosen-chapter visibility, fits the entire 3D desk + story reading panel + 5-chapter rail inside desktop viewports (`1280×720`, `1440×900`, `1920×1080`), and fits the whole desk in the orthographic camera across overview and all five selected chapters.
- `src/InteractiveStories.tsx` & `src/interactive-stories.css`: Centers the four-photo personal fan in `AboutPlayground` using a symmetric `[-1.5, -0.5, 0.5, 1.5]` arrangement on desktop/tablet and a centered active stack on mobile while keeping `ProjectShowcase` untouched.

## 1. Shared Project Case Routing (`src/WorkPage.tsx`, `src/cases/case-shell.css`, `src/App.tsx`)
- **Lazy Case Registry**:
  - `council` → `lazy(() => import('./cases/CouncilCase'))`
  - `michelin` → `lazy(() => import('./cases/MichelinCase'))`
  - `checkpoint` → `lazy(() => import('./cases/CheckpointCase'))`
  - `careers-fair` → `lazy(() => import('./cases/CareersFairCase'))`
  - `ctm` → `lazy(() => import('./cases/CtmCase'))`
- **Contract & Shell Preservation**:
  - Outer `<section className="visual-case visual-case-${study.id}" data-project={study.id}>` is preserved.
  - Shared shell supplies only top `.case-navigation` (all-projects backlink, numbered breadcrumb `0X / Study Name`, company/date metadata, and matching About chapter link `chapterInfo.href`), `<CaseErrorBoundary>` + `<Suspense>` around `<CaseComponent study={study} paused={paused} />`, `.next-project-exhibit`, and `.case-collection-footer`.
  - When a case module renders, the shared shell emits zero `<h1>` elements so the case module owns the single `<h1>` on the route.
  - `WorkReel` collection at `#/work` and the invalid-project recovery view (`#/work/unknown`) remain intact.

## 2. About Desk Redesign & Orthographic Projected-Bounds Framing (`src/JourneyPage.tsx`, `src/JourneyDesk.tsx`, `src/journey-desk.css`)
- **Removed Clutter**:
  - Deleted `'Pick an object on my desk to explore the five chapters so far, or read my background below.'`
  - Deleted `<nav className="about-local-nav">` and its three buttons (`01 Interactive 3D desk`, `02 Story & education`, `03 Leadership recognition`).
- **Desktop Viewport-Fitting Workspace (`min-width: 851px`)**:
  - Compact `.j-opening` header pairs the title (`Still curious. Still growing.`) with Mai's role/background context and a live chapter status pill (`0X / 05 · Company — Role` + `Whole desk` reset button when a chapter is selected).
  - `.j-workspace` uses `grid-template-columns: minmax(0, 67fr) minmax(320px, 33fr)`, `grid-template-rows: minmax(0, 1fr) auto`, and a measured `--j-workspace-height` (available viewport height below the opening, minus a 16px bottom margin, capped at 860px) so the left 3D desk stage (`~67%`), right contained scrollable story panel (`~33%`), and bottom 5-chapter rail (`grid-column: 1 / -1`) fit together on screen at `1280×720`, `1440×900`, and `1920×1080`.
  - A layout effect measures the workspace document position through `offsetTop`/`offsetParent`, independent of the page-arrival transform or reading scroll. `ResizeObserver` tracks the opening, global header and any invalid-route callout; window/visual-viewport resize updates the available space. No minimum height can force the contained workspace below the opening screen. When fewer than 410px remain, a normal-flow 480px stage keeps the desk and story usable in short desktop windows.
  - `.j-story` displays company, role, date, lesson title, summary, real photograph + turning-point quote, project CTA link(s), expandable `<details className="j-reflection">` with full `body`, `insight`, `carry` and LinkedIn source link, and prev/next/Whole-desk navigation. It scrolls natively whenever the content exceeds the desktop panel. The region has `tabIndex={0}` and a visible keyboard focus ring. Chapter changes reset its scroll position; toggling motion preserves the reading position. Workspace and opening controls retain at least 44px target heights.
- **Mobile Normal Flow (`max-width: 850px`)**:
  - `.j-workspace` switches to normal vertical document flow (`height: auto`) with `.j-story` unclipped (`overflow: visible; max-height: none`) and `.j-desk-canvas` preserving `touch-action: pan-y` so there is no nested scroll trap or hijacked scroll.
- **Orthographic Projected-Bounds Camera Fit (`src/JourneyDesk.tsx`)**:
  - Removed the clipping `1.06`/`1.18` selection auto-zoom and off-center focus pan.
  - Camera framing derives from the real geometry bounding boxes of all 234 desk meshes, including instanced keycaps. Initialization caches their local corners and samples the notebook/laptop hinges, object lift/tilt and plant sway. A one-time convex hull reduces that motion envelope to 35 extreme points; each frame projects those cached points into camera space and fits the orthographic frustum. Synthetic upper table corners no longer add empty space above the scene. Desktop margins are `1.06×` horizontal and `1.08×` vertical; mobile margins are `1.10×` and `1.12×`.
  - A separate projection checks the bounds of all current meshes, using reused corners, vectors and matrices rather than the reduced fit hull. No `Box3`, geometry, vector or matrix is constructed per frame. The ground shadow receiver, decorative halo and lights do not influence the camera fit. Hull construction happens once per mounted scene; GPU resources, frame callbacks, observers and event listeners retain their existing cleanup on unmount.
  - Selected objects are highlighted in place via vertical lift (`+0.24`), interactive hinge opening (notebook cover, laptop screen), a 3D cobalt/paper selection halo ring on the desk surface (`haloGroup`), a dedicated warm focus `PointLight`, and an active cobalt marker pill (`aria-pressed="true"` with visible object label).
  - Manual user zoom (`−`/`+`) and `Whole desk` reset (`Escape` or toolbar/story reset button) remain fully interactive.
  - Hidden QA data attributes on `.j-desk-canvas`: `data-frames`, `data-view-angle`, `data-zoom`, `data-selected-chapter`, `data-table-bounds`, `data-scene-bounds`, `data-whole-desk-visible`, `data-bounds-source="all-mesh-geometry-boxes"`, `data-bounds-mesh-count` and `data-fit-point-count`.

## 3. Centered Four-Photo Composition (`src/InteractiveStories.tsx`, `src/interactive-stories.css`)
- Replaced the left-biased `((index - active + 6) % 4) - 2` (`[-2, -1, 0, 1]`) slot calculation with a symmetric even-four fan:
  - `order = (index - active + 5) % 4`, `slot = order - 1.5` → **`[-1.5, -0.5, 0.5, 1.5]`**.
  - Both the outer pair (`-1.5` and `+1.5`, `--depth: 1`) and inner pair (`-0.5` and `+0.5`, `--depth: 0`) mirror symmetrically across `left: 50%` of `.ix-photo-stage`, centering the entire 4-photo composition inside the page with equal left and right space.
  - The active photo (`.ix-photo-slot.is-active`) lifts (`translateY(-18px) scale(1.04)`), takes top `z-index`, and highlights its frame and caption badge while all four photographs remain visible, readable, and focusable (`tabIndex={0}`).
  - On mobile (`max-width: 700px`), `--mobile-slot` (`-1, 0, 1`) centers the active photo at `50%` with symmetric left/right neighbor peeks (`±42px`) and native vertical scrolling (`touch-action: pan-y`).

## 4. Verification & Testing Notes
- `python -X utf8 scripts/review-immersive-layout.py`: **61/61 checks passed**. Overview and all five selected chapters fit the opening screen at 1280?720, 1440?900 and 1920?1080. The existing four-photo centering checks and 320/390/768px mobile checks also remain green. No uncaught browser errors.
- Focused Playwright follow-up: **24/24 checks passed**. Every desktop/chapter combination reports `data-whole-desk-visible="true"` with the full five-chapter rail on screen; native keyboard panel scrolling works; pausing preserves a 120px reading offset; changing chapter resets it; all visible workspace/opening controls measure at least 44px tall; a 1280?550 window switches to an unclipped normal-flow stage.
- `node_modules/.bin/tsc --noEmit`: passed.
- Measured selected-chapter workspace bounds after touch-target restoration: 1280?720 ? y210.06?704.06; 1440?900 ? y210.06?884.06; 1920?1080 ? y210.06?1064.06. Each leaves approximately 16px below the chapter rail.
- Review artifacts: `docs/verification/immersive-review/layout-results.json`, `about-fit-followup.json`, `about-fit-1280x720.png`, `about-chapter-0.png`, and `about-short-window-flow.png`.
- Camera geometry, bounds framing, source story content and photo composition were unchanged by the viewport-fit follow-up. Local implementation only; no production release performed.

## 5. Real-geometry framing and touch follow-up

- Replaced the synthetic full-height upper box with the cached real-mesh motion envelope described above. At 1280×720 the selected Council table now spans **501px**, up from **379px** in the same 785px-wide stage (**32.2% wider**). The complete scene spans y=15…292 inside the 304px-high canvas. This uses the available height without clipping props or changing the whole-workspace layout.
- **74/74 geometry assertions passed** before the separate mobile touch phase: overview plus all five selected chapters at 1280×720, 1440×900 and 1920×1080, each at the neutral view and both rotation limits; every current mesh remains inside the stage. The checks additionally verify the independent 234-mesh projection, the 35-point fit hull, the size gain and Whole-desk reset after manual zoom. Evidence is retained in `actual-geometry-results.json` and the geometry section of `actual-bounds-check.log`.
- The initial touch phase exposed a real input bug at 320px: pointerup selected the Michelin marker, then the layout moved and Chromium retargeted its compatibility click to the Careers marker. The old 400ms suppression window could expire while rendering, allowing a second selection. Replaced that timeout with a one-click consumption flag: a fresh pointerdown resets it, pointerup/cancel arms it, and a pointer-generated marker click consumes it regardless of render latency. Keyboard clicks (`detail=0`) remain usable.
- After that fix, **22/22 independent touch checks passed**: all five markers at 320px and 390px, drag and cancelled-touch rejection, native vertical scrolling, all five keyboard Enter selections and no browser errors. **61/61 layout checks passed** again, including the complete desktop workspace, centered four-photo fan and mobile About layouts. The test reset targets the toolbar `.j-reset` so the three valid Whole-desk buttons do not create an ambiguous test selector.
- TypeScript passed before the input-guard change; the parent owns the final combined build after that change. Physical-device frame pacing has not been measured. No release actions were performed.
- Updated artifacts under `docs/verification/immersive-review/`: `actual-bounds-1280x720.png`, `actual-bounds-1440x900.png`, `actual-bounds-1920x1080.png`, `actual-geometry-results.json`, `actual-bounds-check.log`, `touch-after-bounds.log`, `layout-after-bounds.log` and `layout-results.json`. `docs/verification/journey-touch-review.json` contains the independent touch results.
