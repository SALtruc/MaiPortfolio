# Careers Fair — local project experience

## Final direction

The opening is a physical lanyard and photo pass, framed by the short headline “One conversation at a time.” The pass is an illustrative visual retelling, not a reproduction of an official credential. It uses Mai’s genuine Career Booth photograph and RMIT portrait. A compact Then / Now control rotates the two faces through CSS 3D with a real GSAP tween; fine-pointer movement gives the outer object a small, damped tilt.

The largest result is Mai’s **300+ students personally engaged**. The adjacent **53 companies** and **2,136 participants** are explicitly labelled whole-event figures, delivered by the wider RMIT team. The pass identifies Mai as one Career Booth team member. No fabricated badge number, earlier attendance figures, employer name, placement outcome or venue position is shown.

The next section follows **Guide → Connect → Learn** along a conceptual responsibility path. It is not an actual floor plan. A native range input and keyboard-operable phase buttons move the SVG traveler and draw the route, then reveal the matching original action and reflection from `stories.ts`. This preserves the complete source-backed decisions without putting them all in the first screen. The small labels describe the responsibilities rather than invented operational stations.

Reflection notes cover AI in recruitment, resilience and human connection. The four applications are attributed to Mai’s broader Career Ready Assistant journey. The real evidence strip distinguishes the Fair booth, a professional networking event, and related Career Ready Launching Week work. The role, outcome, lesson and original source remain readable below.

## Owned files

- `src/cases/CareersFairCase.tsx`
- `src/cases/CareersFairCase.css`
- `src/cases/careers-fair/fairData.ts`

Every visual selector is scoped to `.case-careers-fair`; the `h1 em` selector includes `.portfolio-world` only to defeat the existing shared headline color override. No shared component, authoritative content source, dependency or other project was changed.

## Motion and access

- `useGSAP` scopes entrance and one-shot ScrollTrigger reveals; contexts and media-query listeners revert on cleanup and pause changes.
- Pass and path tweens are killed before replacement and on unmount. Pointer listeners and quickTo tweens are removed on cleanup.
- Pause and system reduced motion immediately apply the selected pass/path state and show the complete static content. There is no continuous render loop or required autoplay.
- Ordinary scrolling and `touch-action: pan-y` are retained. The inactive pass face is `inert` and `aria-hidden`.
- Native buttons and range input support touch and keyboard. Phase controls accept Left/Right/Home/End. The native photo dialog closes with Escape and a visible Close control.

## Actual local verification — 2026-10-29

Chromium via Python Playwright, against port 4174:

- 1440, 1280, 768, 390 and 320px: one h1, no horizontal overflow, and all visible case controls at least 44×44px.
- Then/Now: verified the actual 180-degree transformation and inactive-face inert state.
- Photo dialog: opens from the pass; Escape closes it.
- ArrowRight selects Connect and displays its original action/reflection; the range selects Learn.
- The path’s dash offset changed during the motion-enabled transition, settled at the selected endpoint, and remained stable with motion paused.
- Paused and system reduced-motion pass changes reach their final state immediately; native pan remains `pan-y`.
- The integrated `/#/work/careers-fair` route mounted with one h1, no overflow and no browser errors.
- `npx tsc -b --pretty false` passed after the Fair changes. A later full `npm run build` encountered only concurrent CTM import/type errors while that separate agent was editing; no Fair error was reported. Root should rerun the full build after all project edits settle.

Evidence:

- `docs/verification/project-experiences/careers-fair-opening.png`
- `docs/verification/project-experiences/careers-fair-signature.png`
- `docs/verification/project-experiences/careers-fair-refined-desktop.png`
- `docs/verification/project-experiences/careers-fair-refined-390.png`
- `docs/verification/project-experiences/careers-fair-refined-320.png`
- `docs/verification/project-experiences/careers-fair-refined-checks.json`

All work is local. No push, merge, production deployment or configuration change was performed.

## Integrated opening spacing follow-up (2026-10-30)

- Verified the compact desktop spacing already present in the CSS against the actual `/#/work/careers-fair` route. At 1440×900, the full 660×330px pass occupies y535.4–865.4; both personal and whole-event metric scopes and the 44px perspective controls fit the opening viewport.
- Added one narrowly scoped rule for desktop windows at most 760px tall. It reduces the heading, masthead gaps and lanyard length while retaining the full-size pass and all content. At 1280×720, the pass moves from y535.1 to y486.3; the photo starts at y532.3 instead of y581.1, exposing about 188 of its 234px height before scrolling.
- Mobile CSS is unchanged. The 320px and 390px routes have zero horizontal overflow and 44px Then/Now controls. The flip, original-photo dialog and Escape still work on the short desktop layout.
- Focused integrated verification: **14/14 checks passed**, no uncaught browser errors; `git diff --check` clean. Evidence: `docs/verification/project-experiences/fair-final-opening-results.json` and `fair-final-opening-{1440,1280,390,320}.png`. Parent owns the final combined build and case suite.
