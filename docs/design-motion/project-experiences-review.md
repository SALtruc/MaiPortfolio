# Portfolio experience review — 2026-10-30

## Cause

The previous case pages repeated the same hero, three decision tabs and outcome layout. Large navigation blocks and repeated insets pushed the main interaction down the page. About used a fixed-height workspace and conservative synthetic scene corners: the workspace could extend below a laptop screen while the desk itself looked small. Mobile verification also exposed a delayed compatibility click selecting a neighboring marker after the story layout moved; its old 400ms suppression could expire during rendering.

## Local changes

- Removed the requested About instruction and three local navigation pills. The desk, story and chapter rail now share the available desktop viewport; shorter windows and mobile use normal page flow. Story content remains keyboard scrollable, and pausing preserves the reading position.
- The desk camera fits actual mesh geometry and sampled moving-object poses. A cached 35-point hull drives framing; an independent projection checks all 234 mesh bounds. At 1280×720, table width increased from 379px to 501px (+32.2%) while keeping props visible.
- Desk pointer selection now consumes its compatibility click once instead of relying on a timeout. A new pointer gesture resets the guard, while keyboard activation remains available. Actual touch, drag, cancellation and native vertical scrolling were verified after the fix.
- Centered the four real photographs as one symmetric composition; mobile keeps the selected frame centered with neighbor previews.
- Replaced the generic case body with five separately loaded authored experiences:
  - Council: 43-point community constellation, responsibility lenses and authentic event photographs.
  - Michelin: interactive Three.js solar coordination workbench with three sourced decision stations.
  - Checkpoint: page-turning workshop booklet, activity selection, schedule adaptation and published respondent feedback.
  - Careers Fair: physical event pass with Then/Now flip, responsibility path and clear personal/event attribution.
  - CTM: Canvas/SVG channel relay connecting communications, webinars, feedback and follow-up.
- Shortened the shared mobile breadcrumb to two 44px links and removed duplicate company/date content. Retained canonical project routes, matching About chapter links, collection returns and browser history behavior.
- Full role, action, reasoning, outcome, reflection, real evidence and original-source links remain available. Removed unsupported invented cohorts, precise workshop minute splits and channel-conversion narratives. The 15%+ CTM figure is explicitly monthly revenue contribution share; respondent and whole-event figures are labeled accordingly.

## Verification

The review uses the actual integrated application at `http://127.0.0.1:4174/`.

| Check | Result | Evidence |
|---|---|---|
| TypeScript and Vite production build | Passed, exit 0 | `docs/verification/project-experiences/final-build.log` |
| All five cases: 320/390/768/1280/1440px layout, targets, keyboard, photo dialogs, actual motion and pause | 111/111 passed | `scripts/review-project-experiences.py`, `docs/verification/project-experiences/reviewer-results.json` |
| Navigation, route aliases, project/chapter links, browser Back, invalid routes and contact | 78/78 passed | `scripts/review-portfolio-cohesion.py`, `docs/verification/cohesion-review/final-review.log` |
| Careers Fair integrated opening, mobile, flip and photo controls | 14/14 passed | `docs/verification/project-experiences/fair-final-opening-results.json` |
| Full-desk geometry, 54 chapter/rotation states, independent bounds, enlargement and zoom reset | 74/74 passed | `docs/verification/immersive-review/actual-geometry-results.json` |
| Actual 320/390px touch, drag/cancel, vertical pan and keyboard selection | 22/22 passed | `scripts/review-journey-touch.py`, `docs/verification/journey-touch-review.json` |
| Final viewport fit and centered four-photo composition | 61/61 passed | `scripts/review-immersive-layout.py`, `docs/verification/immersive-review/layout-results.json`, `layout-after-bounds.log` |

Representative screenshots: `reviewer-{project}-{width}-opening.png` under `docs/verification/project-experiences/`; `actual-bounds-1280x720.png` under `docs/verification/immersive-review/`.

The design audit found 16/18 checks clean. The two findings are intentional: the source-backed 500M+ annual budget and blur behind an enlarged-photo modal. Neither is decorative invented data or a glass-card visual system.

## Limits and production impact

Physical-phone frame pacing has not been measured. Headless browser checks establish functionality, sizing, native scrolling and pause behavior; they do not establish a physical-device FPS result. The shared Three.js chunk is 555.71kB minified (139.91kB gzip), so Vite retains its size warning. Case modules and the desk are loaded separately; the main entry is 424.36kB minified (140.74kB gzip).

All changes are local. No push, merge, deployment, production restart or configuration change occurred. A future release would update only the portfolio frontend; it requires explicit user approval under `C:/Users/PC/.agents/RELEASE_APPROVAL_POLICY.md`.
