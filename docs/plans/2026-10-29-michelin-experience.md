# Michelin Green Finance — Interactive Solar / Finance Case Plan

## Goal
Build a distinctive, production-ready interactive case study module for Mai's Michelin Vietnam internship (`src/cases/MichelinCase.tsx`, `src/cases/MichelinCase.css`, `src/cases/michelin/buildSolarWorkbench.ts`, and `docs/design-motion/michelin-experience.md`) implementing the contract in `docs/design-motion/project-experiences-contract.md`.

## Steps
- [x] Write implementation plan and design/motion architecture notes in `docs/plans/2026-10-29-michelin-experience.md` and `docs/design-motion/michelin-experience.md`.
- [x] Create Three.js 3D solar-finance workbench helper in `src/cases/michelin/buildSolarWorkbench.ts` featuring an illustrative dealership solar canopy array, 12+ vendor input packets, 15+ proposal evaluation sheets, and 4+ internal department alignment blocks with full resource disposal.
- [x] Implement `src/cases/MichelinCase.tsx` (`{ study: Study; paused: boolean }`) with coordinated focus lenses (`vendors`, `proposals`, `departments`, `overview`), interactive consolidation stage progression, GSAP/ScrollTrigger choreography, accessible non-WebGL/reduced-motion schematic fallback, authentic dealership photography lightbox, and complete source-backed narrative.
- [x] Implement scoped responsive styling in `src/cases/MichelinCase.css` under `.case-michelin` across 320px–1920px viewports with `>=44px` controls, keyboard focus states, and reduced-motion rules.
- [x] Verify all study facts, truthfulness guardrails, TypeScript types, and resource cleanup, then mark all plan steps complete.

## Key Decisions
1. **Honest Illustrative 3D Workbench (Not a Fake Dashboard)**: The Three.js scene stages the actual coordination workflow—12+ vendor packets on the intake rail, 15+ proposal comparison sheets in the forest-green Michelin folder, 4+ internal department alignment blocks, and an architectural scale model of a dealership solar canopy—explicitly labeled as an illustrative process model with zero invented kW capacities, cost savings, or ROI percentages.
2. **Coordinated Multi-Lens Signature Interaction**: Users can switch focus between **Vendors (`12+`)**, **Proposals (`15+`)**, **Departments (`4+`)**, and **Overview**, plus scrub through the 3 consolidation stages or tilt/rotate the 3D workbench. Every lens change updates the 3D camera/object elevation, the synchronized 2D SVG flow schematic, and the sourced decision & evidence inspector.
3. **Complete Accessibility & Motion Discipline**: All controls are `>=44x44px` with keyboard arrow navigation (`ArrowLeft`/`ArrowRight`/`Home`/`End`), `touch-action: pan-y` preserves native vertical scrolling, offscreen `IntersectionObserver` + `visibilitychange` stops the render loop, `paused` / `prefers-reduced-motion` halts ambient motion and renders static frames on demand, and a full SVG blueprint schematic provides a seamless non-WebGL fallback.
4. **Strict Ownership & API Compliance**: Only owned files (`src/cases/MichelinCase.tsx`, `src/cases/MichelinCase.css`, `src/cases/michelin/buildSolarWorkbench.ts`, and `docs/design-motion/michelin-experience.md` + plan doc) are created/updated. The component exports a default React component accepting `{ study: Study; paused: boolean }` with type-only `Study` import from `../stories` and owns exactly one `<h1>`.
