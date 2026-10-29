# Plan: CTM Interactive Campaign-to-Conversation Case (`CtmCase`)

**Date:** 2026-10-29
**Topic:** CTM Translation & Consulting — Interactive Campaign-to-Conversation Case Study
**Owned Files:** `src/cases/CtmCase.tsx`, `src/cases/CtmCase.css`, `src/cases/ctm/ctmFlowData.ts`, `docs/design-motion/ctm-experience.md`

## Goal

Build a production-ready, accessible, responsive project case module (`src/cases/CtmCase.tsx` and `src/cases/CtmCase.css`, scoped under `.case-ctm`) for Mai's Marketing & Sales Intern work at **CTM Translation & Consulting** (`Jul–Nov 2025`). Replace the generic 3-tab template with a signature **Campaign-to-Conversation Relay Studio** combining HTML5 Canvas particle streams, animated SVG routing paths, and 2.5D communication artifacts orchestrated with GSAP and ScrollTrigger.

## Steps

- [x] **Step 1: Author CTM flow dataset & helper models (`src/cases/ctm/ctmFlowData.ts`)**
  - Define the 4 real digital channels (`Facebook`, `TikTok`, `LinkedIn`, `Website`) and 4 connected workflow stages (`01 · Multi-Channel Reach`, `02 · Monthly Webinars (5+/mo)`, `03 · Engagement & Feedback Loop`, `04 · Personal Follow-Up & Sales Support`).
  - Map every channel × stage combination to a concrete relationship path, a concise sourced personal action by Mai, an honest illustrative process artifact schematic, and the linked decision from `study.decisions`.
- [x] **Step 2: Build `src/cases/CtmCase.tsx` with Canvas + SVG + 2.5D GSAP choreography**
  - Export default `CtmCase({ study, paused }: { study: Study; paused: boolean })` with type-only `Study` import from `../stories`.
  - Compose a single `<h1>`, project identity, Mai's role (`Marketing & Sales Intern`), and the intentional framing of `/assets/ctm-event.webp` alongside abstract 2.5D dispatch props.
  - Implement the interactive **Campaign-to-Conversation Relay Studio**:
    - Interactive channel selector (`Facebook`, `TikTok`, `LinkedIn`, `Website`) and stage selector (`Reach`, `Webinars`, `Feedback`, `Follow-Up`) with full keyboard navigation (`ArrowLeft`/`ArrowRight`/`Home`/`End`) and `>=44px` hit targets.
    - HTML5 `<canvas>` particle relay renderer that animates signal particles along cubic-bezier routes from the active channel through the `5+ webinars/month` hub, feedback loop, and `15%+ monthly revenue contribution share` outcome, pausing cleanly when offscreen, tab-hidden, `paused`, or `prefers-reduced-motion: reduce`.
    - Synchronized `<svg>` node-and-path diagram and 2.5D communication artifact card stack animated with GSAP (`useGSAP` + `ScrollTrigger`).
  - Render the complete operational decision ledger (`study.question`, all 3 `study.decisions`), the archival evidence spread for `/assets/ctm-event.webp` with zoom lightbox `<dialog>`, outcome, reflection, and reachable `study.source` link.
- [x] **Step 3: Style `.case-ctm` in `src/cases/CtmCase.css`**
  - Scope every selector under `.case-ctm` using the shared paper/ink/sage/cobalt foundation (`#f5f4ee`, `#151e28`, `#44614b`, `#2952c8`) and `Outfit`/`DM Sans` typography, accented with warm relay terracotta (`#b85d3b`) for human conversation signals.
  - Ensure responsive layout across `320px–1920px`, `>=44px` interactive controls, visible `:focus-visible` states, `touch-action: pan-y` for native vertical scrolling, and full reduced-motion / `html[data-motion=off]` support.
- [x] **Step 4: Document design, motion, and truthfulness in `docs/design-motion/ctm-experience.md`**
  - Record the visual concept, interactive mechanics, GSAP/Canvas/SVG architecture, cleanup guarantees, and source-backed truthfulness boundaries.

## Key Decisions

1. **Interactive Thesis — Campaign-to-Conversation Relay Studio:** Rather than merely coloring a pill or switching static tabs, selecting a channel (`Facebook`, `TikTok`, `LinkedIn`, `Website`) and a workflow stage (`Reach`, `Webinars`, `Feedback`, `Follow-Up`) re-routes the active SVG bezier circuit, shifts the Canvas particle stream density/trajectory, tilts/morphs the 2.5D illustrative communication artifact, and updates the Inspector panel with the specific channel-to-stage relationship and Mai's sourced personal action.
2. **Honest Single-Photo Composition:** Because `/assets/ctm-event.webp` is the sole real photograph for CTM, we frame it intentionally as an archival contact print in the hero and evidence spread, paired with clearly labeled *illustrative process props* (explicitly marked as abstract process diagrams, with zero fake analytics, fabricated messages, or invented conversion rates).
3. **Strict Truthfulness on Revenue Share:** Always present `15%+` as a **monthly revenue contribution share** supported by Mai's course promotion, customer engagement, and sales follow-up — never as revenue growth.
4. **Performance & Motion Hygiene:** Scope all GSAP/ScrollTrigger instances via `useGSAP({ scope, dependencies: [paused], revertOnUpdate: true })`, gate the Canvas `requestAnimationFrame` loop with `IntersectionObserver` + `visibilitychange` + `paused` + `prefers-reduced-motion`, and render a complete static diagram when motion is off.
