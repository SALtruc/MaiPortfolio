# CTM: campaign to conversation

## Local refinement

The first implementation buried its Canvas/SVG relay under a long photo hero, equal metric cards and eight large controls. It also assigned unsupported customer intent, messaging and conversions to individual channels. This refinement puts the actual interaction in the opening composition and removes those invented claims.

Owned files:

- `src/cases/CtmCase.tsx`
- `src/cases/CtmCase.css`
- `src/cases/ctm/ctmFlowData.ts`

The default export keeps `{ study: Study; paused: boolean }`. All CSS is scoped to `.case-ctm`. There is exactly one h1, “Beyond the first click.” The company, dates, role, contextual question, three original decisions and reasoning, outcome, lesson, authentic event photo and original source remain available. The photograph opens in a native dialog.

## Opening composition

A short masthead pairs the title with the documented **15%+ monthly revenue contribution share**. The interactive relay sits immediately below it, beside a folded-paper action note. Four channel nodes are their own controls; there is no separate control console. Webinar coordination, feedback and follow-up form the connected work nodes. The **5+ webinars/month** and **four channels** are visual anchors inside the process.

The diagram is explicitly an illustrated workflow. Selecting a channel highlights and redraws that channel’s route. It does not assert platform-specific strategy or measured conversion. Selecting a work node updates the selected paths, factual personal action and relevant metric. The associated action note uses a short GSAP perspective rotation, rather than a fake private campaign artifact.

## Actual techniques

- Canvas 2D animates five particles per active cubic Bézier path without React updates per frame.
- HTML controls, SVG paths and Canvas particles share the same geometry function. A separate 320×470 coordinate system reflows the diagram vertically below 640px.
- Selected SVG paths draw with GSAP `strokeDashoffset`; the action note changes with a scoped GSAP 2.5D transition.
- `useGSAP` handles entrance choreography, decision reveals and photographic scale/fade with ScrollTrigger, scoped to the case root and reverted on pause/unmount.
- Canvas uses capped DPR, ResizeObserver, IntersectionObserver and document visibility. Cleanup cancels animation frames, disconnects observers and removes listeners. It stops when paused, reduced motion is requested or the diagram is offscreen. Selecting a channel while paused redraws a complete static route without restarting a loop.
- Native buttons expose pressed state, visible focus and a 44px minimum target. Arrow/Home/End keys move between channels or work nodes. Native vertical touch panning is preserved. Photo dialog supports Escape.

## Evidence and wording

Facts remain limited to `stories.ts` and `content.ts`:

- Coordinated Facebook, TikTok, LinkedIn and the company website.
- Coordinated 5+ monthly webinars and information sessions, including participant communications and follow-up.
- Tracked audience engagement, customer feedback and campaign performance.
- Course promotion, customer engagement and sales support contributed to 15%+ of monthly revenue. This is a contribution share.

The sole photo is the existing `/assets/ctm-event.webp`. No private analytics, customer quotes, messages, registration forms, campaign screenshots or per-platform conversion claims are presented.

## Verification run

`npx tsc -b --pretty false` passed after the implementation.

`python -X utf8 docs/verification/project-experiences/ctm-refined-check.py` passed **24/24** integrated-route checks: Canvas movement; four channel routes; three factual action selections; keyboard selection/focus; pause, paused redraw and resume; offscreen stop; native dialog/Escape; expanded reasoning; reduced-motion static fallback; native pan CSS; source link; and no uncaught browser errors.

Responsive browser checks at **1440×1000, 1280×720, 1024×900, 768×844, 390×844 and 320×844** confirmed all seven nodes fully contained, targets at least 44px, no horizontal overflow and one h1 on one or two lines. A CDP touch swipe inside the mobile diagram moved the page from scrollY 216 to 355, confirming ordinary vertical scrolling.

Evidence:

- `docs/verification/project-experiences/ctm-refined-results.json`
- `docs/verification/project-experiences/ctm-refined-layout-results.json`
- `docs/verification/project-experiences/ctm-refined-opening-{width}.png`
- `docs/verification/project-experiences/ctm-refined-signature.png`
- `docs/verification/project-experiences/ctm-refined-mobile-signature.png`

These are local changes and local browser checks. No push, deployment or production configuration change was performed.
