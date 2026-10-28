# Interactive middle-section update ? 28 October 2026

The user requested clearer interaction, connected elements and less text, specifically rejecting the oversized manifesto. The existing off-white, Outfit and cobalt direction remains. Work becomes a single project browser; the introduction becomes a draggable deck of genuine photographs with short factual captions. Implementation follows the existing-ui genjutsu/cast workflow within the user's authorization to continue.

Allowed patterns: overlapping photographic frames, gentle in-view float, a thin connector between sections, and multiple equivalent drag/button/keyboard controls for the same selection. These serve the requested interactive photo-led presentation.

## Checked here

- Thesis and transitions: `src/InteractiveStories.tsx` contains the five-project selection and four-photo deck. `src/interactive-stories.css:5` uses a 350ms fade / 500ms photo translation; line 9 uses a 480ms spring-shaped transform curve for the deck. No new library was introduced.
- Reduced motion: the component's useGSAP guard and stylesheet media query remove ambient, entry and pointer motion. Existing global motion-off rules stop transitions. Browser checks confirm the deck still changes using its controls.
- Entry/exit: photos and project articles stay mounted and transition between active states. Route exits are immediate, as in the existing app; GSAP context cleanup removes listeners and animation state.
- Animation properties: the new component animates transform and opacity. Drag CSS variables feed transforms; no width/height/top/left interpolation was added. Hover shadows are paint work, not claimed compositor-only.
- Focus/semantics: native buttons, aria-pressed selection, labelled carousel regions, inert inactive articles and polite live captions. Focus rings are in `src/interactive-stories.css:10`. All selection controls wrap, so there is no disabled endpoint. Far cards remain selectable by pointer; topic controls provide keyboard access to every photo.
- Gesture lifecycle: pointer movement follows the drag before release; threshold is 45px. Child implicit touch-capture loss is ignored when capture transfers to the rail. Actual touch swipe and touch cancellation are covered by browser tests.
- Contrast, computed from emitted values: #535961 on #f4f4ef = 6.41:1; #4e5a6c on #e9edf2 = 5.95:1; #204dff on #f4f4ef = 5.34:1; white on #204dff = 5.89:1; #10151b on #f4f4ef = 16.62:1. These are text pairs, not an assertion that every decorative boundary meets 3:1.
- Browser evidence: production build and 129 checks passed at 320, 375, 390, 768, 1024 and 1440px. No uncaught errors. Mouse, keyboard, touch, paused and OS reduced-motion paths were exercised. The Outfit face loaded. Results: `../verification/motion-browser-results.json`; video: `../verification/interactive-demo.webm`.

## Static audit findings and limits

The tells scanner examined 18 files: 0 static findings and 5 tell categories. None points into the new interactive component or its stylesheet. Findings retained from the existing site: differing explore-CTA labels (`HomePage.tsx:80`, `WorkReel.tsx:55`), signature em dash (`Pages.tsx:25`), translucent navigation/button surfaces (`motion-home.css:18,59`, `refinement.css:6,14`), marquee/orbit loops (`motion-home.css:32,104,107`), and the hero scroll cue (`HomePage.tsx:81`). These are recorded rather than silently reported as clean. Hero orbit motion is controlled by viewport visibility, Pause and reduced motion.

Token consistency has a limitation: the new stylesheet reuses the visual palette but retains literal colour/spacing values, following the existing scoped CSS style. It does not introduce a full token migration. No conditional-render exit wrapper or will-change allocation is needed for the persistent carousel elements.

UNVERIFIED: hardware frame pacing on a physical phone. To measure: open Chrome DevTools > Performance, record a project drag and photo-deck swipe; inspect long frames against a 16.7ms budget. No 60fps guarantee is made from the headless browser checks. This does not block the working local preview.

Modules loaded: motion-principles, gsap, mobile-principles, tells
Modules not loaded: none
