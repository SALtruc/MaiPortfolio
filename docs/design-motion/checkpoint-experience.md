# Career Checkpoint: open-book case experience

## Result

The opening now presents the actual workshop journey as an open booklet instead of repeating the site’s text/photo hero and three-card layout. A compact masthead makes 160 students, three workshops and 88% respondent tool confidence visible before the booklet. The selected workshop pairs Mai’s sourced decision and verified activities with a real recap slide. There is no duplicate decision sidebar or separate impact-card row.

## Owned files

- `src/cases/CheckpointCase.tsx`: complete case module, unchanged public props `{ study: Study; paused: boolean }`.
- `src/cases/CheckpointCase.css`: responsive styles scoped to the Checkpoint component.
- `src/cases/checkpoint/checkpointData.ts`: concise verified lab/activity, schedule and survey data.
- This document.

## Interaction

Discover, Apply and Connect are physical bookmarks on the booklet. Buttons, arrow/Home/End keys, the journey range input and a horizontal drag can change the spread. Dragging from the photograph changes workshops without opening the photo accidentally. A normal tap opens the original recap in a native dialog; Escape closes it.

GSAP performs a page-leaf turn and content arrival on chapter change. Fine-pointer movement gives the book a bounded 3D tilt. ScrollTrigger choreographs later narrative and the recap photograph. A separate SVG comparison moves the three workshop notes closer together when switching from the original weekly plan to the one-week delivery. Mobile uses a readable vertical schedule instead of a miniature desktop diagram.

Global pause and system reduced motion keep all content and controls usable with motion removed. Vertical touch scrolling remains native. GSAP contexts, media queries, pointer listeners and pending animation frames are cleaned up.

## Factual corrections

The invented 00–20 / 20–65 / 65–90 minute breakdowns were removed. The known 90-minute workshop format remains.

The local activity recap verifies:
- Discover: LinkedIn, Networking, Job-fit Evaluation.
- Apply: CV Detective, Interview Roleplay, Responsible AI Using.
- Connect: LinkedIn, Networking, Job-fit Evaluation.

The local participant-feedback recap verifies 91%, 88%, 86% and 84% responses to different questions. Every figure is framed as post-workshop survey respondents. The 370+ students supported across the wider Career Ready Assistant role are presented separately from the series’ 160 students.

## Verification

- `npx tsc -b --pretty false`: passed against the current integrated workspace.
- Chromium review: 22 checks passed, including distinct chapter content, keyboard navigation, range input, original-image zoom, real GSAP page-turn, paused selection, actual touch swipe, native vertical scroll, 44px button heights and no horizontal overflow at 320, 375, 390, 768 and 1440px.
- Integrated route `#/work/checkpoint` smoke-tested. At 1440×900, the full open book bounds are x44 / y437.5 / width1352 / height451.4, ending at y888.9 inside the screen.
- After the final spacing adjustment, the integrated route still reports zero horizontal overflow at 320px and 390px.
- The attribution assertion normalizes CSS uppercase text; its initial case-sensitive mismatch was a test issue. All other checks passed in the full browser run.
- Evidence: `docs/verification/project-experiences/checkpoint-refined-results.json`, `checkpoint-refined-opening.png`, `checkpoint-refined-mobile.png`, `checkpoint-refined-route.png`.

Physical-device frame pacing was not measured. No production or release action was performed.
