# 2026-10-28 — Journey Mobile Marker Touch Targets & Selection Fix

## Goal
Fix the mobile regression where `.j-markers button` elements look like interactive numbered controls (`1`–`5`) at `<= 600px` but have `pointer-events: none`, causing touches at marker centers on `390x844` to fall through to the 3D raycast and miss 4 of the 5 objects. Ensure all five visible markers are reliable touch and keyboard selection controls with `>= 44px` hit targets while retaining compact `22px` visual badge faces on mobile, and preserve native vertical `pan-y` scrolling, horizontal canvas drag, pause/reduced-motion behavior, chapter strip navigation, and WebGL fallback.

## Key Decisions
1. **Restore `>= 44px` interactive hit targets on mobile while keeping `22px` visual faces**:
   - Remove `.j-markers,.j-markers button{pointer-events:none}` from `@media(max-width:600px)` in `src/journey-desk.css`.
   - Keep `.j-markers button` at `width: 44px; height: 44px; pointer-events: auto; touch-action: pan-y; cursor: pointer;` across breakpoints, while `.j-markers button > span` renders the `22px × 22px` visual circle (`pointer-events: none`) on `<= 600px`.
2. **Unify pointer drag/tap handling across `.j-desk-canvas` (`el`) and `.j-markers button`**:
   - Attach pointer listeners (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `lostpointercapture`, `pointerleave`) to the stage container `el` (`.j-desk-canvas`) rather than only `<canvas>`, ignoring `.j-desk-fallback`.
   - Resolve `hit(e)` against `[data-marker]` (via `e.target.closest('[data-marker]')` and visible marker button `getBoundingClientRect()` bounds) before falling back to the 3D `Raycaster`, so touching the center of any marker `1`–`5` reliably selects chapter `0`–`4`.
   - Guard `<button onClick>` with a post-pointer timestamp (`blockClick`) so pointer taps select once without duplicate history updates, horizontal drags or cancelled touches never trigger accidental chapter selection, and keyboard activation (`Enter`/`Space`, `e.detail === 0`) remains fully functional.
3. **Update verification suite & project docs**:
   - Add regression checks in `scripts/verify-journey-desk.py` verifying `>= 44px` marker hit targets, `22px` mobile badge faces, and CDP touch selection at the center of all five markers (`0`–`4`) on `390x844` with `reduced_motion='reduce'` and overview reset before each touch.
   - Update `docs/design-motion/journey-growing.md` and `docs/design-motion/argon-journey-review.md` to reflect the mobile marker touch fix.

## Steps
- [x] Create plan in `docs/plans/2026-10-28-journey-mobile-markers.md`.
- [x] Update `src/journey-desk.css` to keep `.j-markers button` interactive (`pointer-events: auto`, `44x44px` hit box, `touch-action: pan-y`) at `<= 600px` while retaining `22x22px` visual badge spans.
- [x] Update `src/JourneyDesk.tsx` so stage pointer handling and `hit(e)` support marker buttons directly while preserving horizontal drag, vertical scroll, keyboard selection, and no accidental selection on drag/cancel.
- [x] Update `scripts/verify-journey-desk.py` and documentation (`docs/design-motion/journey-growing.md`, `docs/design-motion/argon-journey-review.md`) with the mobile marker touch regression test and notes.
