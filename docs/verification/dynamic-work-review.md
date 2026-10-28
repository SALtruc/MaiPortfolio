# Dynamic Work review ? 19 October 2026

## Direction

A native vertical reading path changes a single photographic stage. Clicking the numbered index jumps to a project; images, linked titles, source context and keyboard focus stay synchronized. Work uses the existing DM Sans and blue/white palette. Authentic recap artwork stays intact. Case studies replace faux paper and equal process cards with compact decision tabs and an unframed evidence strip. The existing Three.js home is outside this change.

Allowed patterns: a sticky photographic stage, numbered project navigation that changes the actual selected project, original recap artwork, authentic project figures with their scope, and diagrams explaining coordination rather than imitating product screenshots. No perpetual movement, decorative paper stacking or wheel interception.

## Collaboration

The baseline is backed up on private GitHub main. Gemini 4 Argon High reviewed the complete reel component and a CSS excerpt through a self-contained Antigravity CLI prompt. Its initial AgentDesk worker run was denied read_file in headless mode; the successful text-only review did not require changing any permissions. See ../gemini-direction-review.md for the full response and the distinction between actual findings and code outside its excerpt.

Applied refinements: lock image state during index jumps, synchronize keyboard focus, provide project-specific evidence captions, distinguish personal contribution from whole-event scale, respect original artwork proportions, simplify navigation, and preserve reduced-motion behavior.

## Checked here

- Production TypeScript/Vite build passes. Existing lazy-loaded Three.js chunk-size advisory remains.
- Native wheel scroll changes the active frame, caption and index together. Observed Checkpoint ? Michelin and keyboard-focus release ? Club Day.
- Index navigation reaches CTM directly and puts focus on its article. A pending-scroll guard prevents intermediate IntersectionObserver entries from replacing the selected photograph.
- Keyboard Tab from Checkpoint's open link focuses the Michelin title and displays Michelin's photograph. Returning to wheel scrolling releases that focus preference.
- The active image links to the matching project case; cases start at scrollY=0.
- At 390?844, all five mobile photos are visible in their respective stories, the sticky desktop viewer is hidden, document width is 375px, and body copy is 22px.
- Desktop body copy is 24px. On the normal desktop viewport the stage controls end within the viewport.
- The existing motion pause sets data-motion=off and a computed 0s transition; jumping then uses instant scrolling. An OS preference guard is also present, but changing the OS preference itself was not tested.
- Process tab semantics remain intact (three role=tab controls with the existing tablist/tabpanel relationship). Image dialogs and the underlying source links are preserved.
- Calculated text contrast on #f8fbff: #243b5c 10.91:1, #425b7d 6.69:1, #285eb6 6.01:1, #536f94 4.97:1. New secondary labels use the latter rather than lower-contrast grey.
- Static tells audit examined 13 files: 18 checks with no findings, plus one existing About Mai signature em dash in Pages.tsx. That pre-existing signature is outside this change. No new repeated-card, perpetual-motion, glow, glass or invented-status findings.
- New image-state animation uses transform and opacity only, with a shared cubic-bezier(.22,.7,.1,1). There are no added continuous animation loops or dependencies.

## Not verified here

No Chrome Performance trace or low-end device measurement was taken; no frame-rate claim is made. Exact 375px, 768px and 1024px viewport passes were not run. The manual pause was tested; an OS-level reduce-motion toggle was not changed. Contrast computations cover the new Work text on its main background, not a complete site-wide WCAG audit.

Modules loaded: motion-principles, css-native, tells, mobile-principles.
Modules not loaded: none required for this Work scope; the existing Three.js home was not changed.
