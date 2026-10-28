# Business in motion — 28 October 2026

The user rejected the previous pastel, serif, desk-led homepage and explicitly requested Antigravity / Argon collaboration. AgentDesk task `t_a11629f4`, run `r_391adbd1`, completed successfully with `gemini-4-argon-high`. Its independent review is saved alongside this document. Recommendations were evaluated rather than adopted indiscriminately: no executive-sounding claims, decorative telemetry, invented testimonials, or simulated live data were added.

## Research and direction

Actual browser screenshots of seven references are in `../reference-research/`: [Scrolltide](https://www.scrolltide.co/components), [ThreeUI](https://threeui.com/browse?sort=recent), [Inspora](https://www.inspora.design/), [Details](https://www.details.so/inspo/category/carousel), [SceneAI](https://sceneai.art/), [Create with Swift](https://www.createwithswift.com/), and [KitBitz](https://kitbitz.art/). [Landbook](https://land-book.com/) presented a browser-verification challenge; its publicly indexed listings were read without bypassing that challenge. Argon researched through web search and local source reading, not an interactive browser. Its characterization of KitBitz as hand-drawn vector art was not adopted; the direct screenshot shows dimensional low-poly scene collections.

The useful shared principles were large typography, media occupying the main stage, deliberate contrast between sections, and motion tied to a meaningful transition. Four separate image-generated section references were created, followed by one transparent decorative ribbon asset. No generated human image appears in the website.

## Implementation

- Wide, two-line Outfit hero with paper background and a cobalt ribbon. The ribbon is a generated image with scroll and pointer transforms: 2.5D, not a live mesh.
- Follow-up: the user requested Mai’s photo in the opening and more visible movement. The hero now includes the original RMIT portrait, an independently floating photo frame, pointer tilt, a slowly rotating orbit and accent, and ambient ribbon movement. Mobile puts the portrait before the title so it is visible immediately. Continuous hero motion is suspended when the composition leaves the viewport or the document is hidden; Pause and reduced motion disable it entirely.
- Five real project stories now share one compact interactive showcase. Project buttons, arrow controls, keyboard navigation and horizontal drag change the photo, summary, metrics and case-study link together. Only the selected story is exposed to assistive technology. Metrics retain their original scope, particularly the annual council budget versus Club Day attendance, whole Careers Fair versus personal conversations, and CTM revenue contribution versus growth.
- The oversized manifesto and biography have been replaced by four real photo frames arranged in a layered deck. Visitors can drag, swipe, click neighboring photographs, choose a topic or use keyboard arrows. A single short caption explains the selected moment. Photo frames enter together, float gently in view and respond to the mouse; a curved connector joins work to the personal section.
- Cobalt contact section with functional email, clipboard feedback, LinkedIn, CV and route links.
- Shared navigation and inner-page display typography follow the new identity. Existing decision tabs, evidence dialogs, career journey and contact postcard remain functional.
- `useGSAP`/`matchMedia` cleanup removes animations on route exit, pause and viewport changes. Homepage project pinning has been removed. Gesture handlers preserve native vertical scrolling and cancel without changing selection when a pointer is interrupted.

## Reference differences

Real photographs replace illustrative people in the mockups. Council uses Mai's Club Day portrait; Career Checkpoint preserves the entire workshop recap instead of cropping its evidence. The latest revision moves away from the original stacked-project and large-text references toward a project browser and draggable photo deck, following the user's feedback about interactivity and excessive text. Both desktop and mobile now use normal page scrolling.

## Verification

Production build and **129 browser checks** passed with no uncaught browser errors. Current browser results are recorded in `../verification/motion-browser-results.json`. Checks cover six widths from 320 to 1440px, project selection and drag feedback, neighboring photo selection, mouse drag, actual touch swipe, keyboard controls, ambient motion and pause/resume, mobile menu, evidence dialog, clipboard and CV delivery.

Run `npm run build`, `npm run preview`, then `python scripts/verify-motion.py`. Current middle-section screenshots are `../verification/interactive-*`; the recording is in `../verification/interactive-video/`. Earlier `redesign-*` and stacked-project screenshots document superseded versions. The site remains local; no external deployment was requested.
