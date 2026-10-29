# Plan: Post-Handoff Cohesion Review Fixes (2026-10-29)

## Goal
Resolve all five specific issues identified in the Codex post-handoff review of snapshot `5fa677e` on `agentdesk/t_58798808` without altering the accepted visual direction or breaking any of the 150 motion checks or 3D journey desk checks.

## Steps
- [x] **Step 1: Coordinated Scroll & History Restoration Policy (`src/App.tsx`, `src/WorkPage.tsx`, `src/JourneyPage.tsx`)**
  - Track per-history-entry reading positions (`window.scrollY`) keyed by a history state entry ID (`__entryId`) stored via `history.replaceState`.
  - Distinguish history traversal (`popstate` to a known `__entryId`), in-place 3D desk chapter selection, and ordinary forward navigation.
  - On ordinary new-page/case navigation, scroll to top (`0`) or the requested alias section (`#about-background` / `#about-recognition`).
  - On browser Back/Forward traversal, synchronously commit route state with `flushSync` and restore the saved `scrollY` for that history entry in `useLayoutEffect` (including `#/work` → `#/work/michelin` → Back restoring `scrollY = 700`, and About + selected chapter state).
  - Keep in-place desk selection (`JourneyPage` `onChange`) stationary without remounting the desk.
  - Remove competing scroll-to-top calls in `WorkPage` (`useLayoutEffect`, `choose`, and `.next-project-exhibit` `onClick`).
- [x] **Step 2: Global Navigation Active-Destination Reset & Alias Section Scroll Stability (`src/App.tsx`, `src/JourneyPage.tsx`)**
  - Ensure clicking any global nav link (`Home`, `Projects`, `About Mai`, `Contact`, header signature `mai.`, and footer nav links) explicitly returns to the start of its canonical destination (`scrollY = 0`) even when the canonical page or hash already matches (e.g., `#/notes` → click `About Mai`, or scrolled `#/about` → click `About Mai`).
  - Centralize alias section scrolling (`#/notes`, `#/about/background`, `#/about/recognition`) so it runs only on initial load or forward navigation to that alias—never on browser Back/Forward restoration and never when toggling `paused` motion state.
- [x] **Step 3: Remove Competing Destinations & Tab Arrows in Home Project Preview (`src/InteractiveStories.tsx`, `src/interactive-stories.css`)**
  - Remove `.ix-chapter-pill` Journey links from Home's `ProjectShowcase` cards so Home's project section links exclusively to the corresponding project case (`#/work/<id>`) and the full project collection (`#/work`).
  - Keep bidirectional Journey/project links in full project case studies (`WorkPage.tsx`) and on `About Mai` (`JourneyPage.tsx`).
  - Remove the diagonal navigation `<Arrow />` icon from `.ix-work-tabs` buttons since they select previews in-place.
- [x] **Step 4: Visual & Copy Cleanup in Home Project Preview (`src/InteractiveStories.tsx`, `src/HomePage.tsx`, `src/interactive-stories.css`)**
  - Simplify the Home work section kicker to `Selected work` and header link to `View all projects`.
  - Remove the redundant `.ix-photo-count` (`01 / 03`), the `· 1 of 3 featured` suffix in `.ix-work-controls`, and the explanatory `.ix-work-archive-callout` panel while preserving the 3 framed project previews, drag/keyboard interactions, motion, and verified metrics.
- [x] **Step 5: Fix Hero Portrait Caption Overlap (`src/HomePage.tsx`, `src/motion-home.css`)**
  - Reposition `.m-portrait-note` (`Always Day 1. ↗`) into reserved space below `.m-portrait-enter` so `.m-portrait-caption` (`Hi, I’m Mai.` / `RMIT Business · TikTok Intern`) remains 100% uncovered and readable at `320`, `390`, `768`, `1440` and throughout the ambient float cycle.
- [x] **Step 6: Update Regression Verification Tests & Documentation (`scripts/verify-motion.py`, `docs/plans/2026-10-29-cohesion-review-fixes.md`)**
  - Add regression assertions in `scripts/verify-motion.py` covering:
    1. `#/work` → scroll `700` → click `#/work/michelin` → browser Back restores `scrollY ≈ 700` (and Forward returns to case).
    2. `#/notes` → auto-scrolls to background → click global nav `About Mai` returns to top (`scrollY < 20`, `h1` visible in viewport); scrolling `#/about` to Story & education → click global nav `About Mai` returns to top.
    3. Home project preview has no `#/journey` links, no diagonal arrows in `.ix-work-tabs`, simplified `Selected work` / `View all projects` copy, and no `.ix-work-archive-callout`.
    4. Hero `.m-portrait-note` bounding box does not overlap `.m-portrait-caption` at `1440`, `1024`, `768`, `390`, `375`, `320` and during float.

## Key Decisions
1. **Single Owner for Scroll & History (`src/App.tsx`)**: All route-level scroll decisions live in `App.tsx` via a `ScrollTarget` state committed with `flushSync` and applied in `useLayoutEffect`, preventing child effects (`WorkPage`, `JourneyPage`) from clobbering browser Back/Forward restoration or re-scrolling on motion toggle.
2. **History Entry Identification**: Each history entry receives a unique `__entryId` in `history.state` via `history.replaceState`. Scroll positions are continuously recorded on passive `scroll` and capture-phase interaction events so Back/Forward reliably detects and restores the saved reading position.
3. **Reserved Space for Hero Note**: Flowing `.m-portrait-note` beneath `.m-portrait-enter` with explicit vertical margin guarantees zero overlap with `.m-portrait-caption` across all viewports and GSAP float keyframes while keeping `.m-portrait-photo` well within the initial viewport.
