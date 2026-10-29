# Portfolio cohesion review — 2026-10-29

## Outcome and cause

Home and Projects previously repeated the full five-project collection with different controls. The personal photo carousel linked to unrelated destinations, while About and Journey repeated personal history on disconnected pages. Several components independently reset scroll position, so browser Back lost the reader's place.

The portfolio now has one main navigation: **Home / Projects / About Mai / Contact**. Home presents three selected project previews. Projects owns the complete five-case collection. About Mai combines the detailed interactive desk, personal biography, education and recognition. Case studies and journey chapters link to each other explicitly, including both RMIT Careers projects. Contact actions are visible without turning the postcard.

## Implementation and review ownership

Antigravity / Gemini 4 Argon High implemented the application changes in task `t_58798808` through snapshots `5fa677e`, `1c740a1` and `f533a63`. Codex audited the previous experience, researched references, reviewed each completed handoff, integrated the exact source changes locally, and performed browser/visual verification. Codex changed review scripts and documentation only, not application implementation.

Codex's review returned these issues to Argon for correction:

- Browser Back needed to restore the actual collection/chapter reading position; ordinary navigation starts at the top and in-place desk selection remains in context.
- Global About navigation needed to return to the page opening from a biography alias or lower section, including an already active link.
- Project previews and the collection had object-named links that looked like image controls but navigated to Journey. These were removed; explicit case-detail/About relationships remain.
- Redundant project-count explanations and navigation arrows on selection tabs were removed.
- The hero's Always Day 1 note needed reserved space below the photograph so the portrait caption stayed readable.

Warm paper, ink and sage now recur across pages, with restrained cobalt, dimensional photography, a focused expanding project preview, and the existing genuine Three.js desk. Mai's real photographs and factual project data remain intact.

## Route ownership

| Destination | URL | Behavior |
| --- | --- | --- |
| Home | `#/` | Portrait opening, three selected previews, personal invitation and contact footer. |
| Projects | `#/work` | Only complete five-project collection. |
| Case study | `#/work/:id` | One canonical detail with collection return and matching About chapter link. |
| About Mai | `#/about` | Desk journey, biography, education, toolkit and recognition in one experience. |
| Legacy chapter | `#/journey/0` through `#/journey/4` | Opens the corresponding chapter inside About Mai; About navigation stays active. |
| Legacy About | `#/notes` | Opens the biography section inside About Mai. |
| Contact | `#/contact`, legacy `#/hello` | Direct email, copy, LinkedIn and CV, plus postcard interaction. |

Invalid page, project and chapter links have recovery states. The header is persistent; redundant floating navigation was removed. Mobile chapter selection exposes a clear story jump action without overriding native vertical scrolling.

## Verification

- Final `npm run build`: TypeScript and Vite passed.
- `scripts/verify-motion.py`: **170 checks passed** after the routing and visual corrections. Coverage includes actual motion, keyboard/drag interactions, pause, reduced motion, project navigation, Back/Forward, active About navigation, canonical/legacy/invalid routes, six viewport widths, contact, dialogs and PDF delivery.
- `scripts/review-portfolio-cohesion.py`: **78/78 independent checks passed**, covering content ownership, project/chapter relationships, route state, history, mobile navigation and layouts.
- `scripts/review-journey-touch.py`: **22/22 checks passed** after the routing corrections, with actual browser touch on all five markers at 320px and 390px, keyboard selection, drag cancellation and native scrolling.
- `scripts/verify-journey-desk.py`: **60 checks passed** on the initial cohesion integration, including the real WebGL scene, mesh selection, camera controls, render pause/offscreen behavior and WebGL fallback. The final routing pass was subsequently covered by the independent, motion and touch suites above.
- The final seven-line collection cleanup changed only the redundant links/import in `WorkReel.tsx`; a new build and **9 targeted checks passed**, including all five cases, card destinations, layouts and the case-to-About round trip. The wider suites were not repeated for that deletion.
- No uncaught browser errors were recorded in the completed suites. Desktop and mobile screenshots were reviewed.

Reviewer test corrections: desktop navigation targets a visible project link instead of the hidden mobile image; history assertions measure the real position after bringing a control into view; mobile state assertions wait for route rendering. Caption collision checks measure the actual title/subtitle rather than the outer padding. Animation-frame sampling confirmed the note stayed below the caption text at 320, 375, 390, 768 and 1440px.

Evidence: `docs/verification/motion-browser-results.json`, `journey-touch-review.json`, `journey-desk-results.json`, `cohesion-review/independent-results.json`, `cohesion-review/cleanup-results.json`, and `cohesion-review/final/*.png`.

## References and limits

All eight user-supplied references were revisited. Browser snapshots and a source-by-source audit are in `docs/verification/cohesion-references/README.md`. Focused frames/selection were informed by [Scrolltide](https://www.scrolltide.co/components) and the dimensional compositions visible in [ThreeUI](https://threeui.com/browse?sort=recent). Some sources had unavailable or gated previews, documented in that audit; no gated assets or paid prompts were copied.

Physical-phone frame pacing and other browser engines were not measured. Vite still reports the existing large lazy Three.js chunk: 573.91kB minified / 148.18kB gzip. The main bundle is 428.01kB minified / 141.51kB gzip. The desk loads on About/Journey and retains motion controls and a usable WebGL fallback.

## Production impact

Local preview: http://127.0.0.1:4173/

No push, merge to main, deployment, production restart or production configuration change was performed. A later approved release would update navigation, About/Projects organization and visual presentation while preserving legacy links. All changes remain local and reviewable.
