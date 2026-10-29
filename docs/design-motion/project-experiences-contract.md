# Project experiences — implementation contract

The user requests one agent per project, distinctive advanced interactions, stronger factual achievements and project-specific objects. They also request removing the About instruction/local navigation, fitting the whole desk and chapter story in the screen, and centering the four-photo composition. Prior local work is the baseline, not a release.

## Ownership

Five independent case agents own only their named component and CSS (plus optional helpers inside the matching lower-case subfolder). A sixth integration agent owns the About/desk/photo layout and shared project routing. Codex reviews completed work, integrates isolated worktree patches and tests. All work is local; no deployment or push.

## Case module API

- Default export React component, props `{ study: Study; paused: boolean }`.
- Import `Study` from `../stories` using a type-only import.
- `src/cases/CouncilCase.tsx` + `CouncilCase.css`; class namespace `.case-council`.
- `src/cases/MichelinCase.tsx` + `MichelinCase.css`; class namespace `.case-michelin`.
- `src/cases/CheckpointCase.tsx` + `CheckpointCase.css`; class namespace `.case-checkpoint`.
- `src/cases/CareersFairCase.tsx` + `CareersFairCase.css`; class namespace `.case-careers-fair`.
- `src/cases/CtmCase.tsx` + `CtmCase.css`; class namespace `.case-ctm`.
- Helpers, if needed: `src/cases/council/`, `michelin/`, `checkpoint/`, `careers-fair/`, `ctm/`. No edits to another agent's files.
- Each module owns its full distinctive case body, exactly one h1, project identity, role, actual achievements, contextual challenge, decisions, evidence, outcome, reflection and original source. The integration shell owns global/collection navigation and contextual About backlinks.
- Do not recreate the old shared hero → three decision tabs → image → generic outcome template. Each case needs an authored visual and interaction concept.

## Techniques and behavior

Use actual GSAP timelines/ScrollTrigger, Three.js, Canvas, SVG path animation or CSS 3D as appropriate to the project. A token hover or three generic tabs is insufficient. At least one meaningful user-controlled signature interaction plus coordinated entrance/scroll choreography per project. Existing React/GSAP/Three dependencies only; no installs. Do not claim techniques that the code does not execute.

Use the paper/ink/sage/cobalt foundation and Outfit/DM Sans. The project can introduce a bounded material accent. Scope every selector. Typography is readable, imagery authentic, layout responsive from 320px. Keep ordinary vertical scrolling. Desktop pinning must be scoped and cleaned up; mobile uses normal document flow. Pause/reduced motion must give a complete usable static alternative. No autoplay conveying essential information; no blocked scroll; no uncontrolled render loop offscreen. Dispose scenes, contexts, textures and event listeners.

## Truthfulness

`stories.ts`, `workVisuals.ts`, `content.ts` and original local assets are authoritative. Do not edit those sources or invent outcomes, testimonials, dates, savings, conversion rates, names or artifacts. Abstract props illustrate a process; do not present them as real deliverables. Project data must distinguish Mai's work from team/event totals. Links to actual original sources remain reachable.

- Council: 500M+ VND annual council budget; Club Day S3/2025 has 43 clubs and 2,500+ participants; wider council work 20+ sponsors/30+ stakeholders; 45 clubs in her broader reflection is not the event's 43.
- Michelin: 12+ vendors, 15+ proposals, 4+ internal departments; supported contract finalisation. No invented solar savings or installed capacity.
- Checkpoint: 160 students, three workshops, 88% respondents confident using tools. Keep respondent wording and the one-week adaptation.
- Careers Fair: 300+ students personally engaged; 53 companies and 2,136 participants are whole-event figures. Mai was a Career Booth team member.
- CTM: 15%+ monthly revenue contribution share, not growth; 5+ webinars/month, four channels Facebook/TikTok/LinkedIn/Website.

## Interaction thesis and allowed patterns

Each case stages the actual business process as a tangible interactive visual, then connects it to personal decisions, measured scope and real evidence. The whole desk remains visible while chapter selection lifts/highlights an object and reveals a readable story panel. Four personal photographs form one centered composition.

Allowed patterns: warm paper surfaces, real photographic frames, bounded project-specific 2.5D/3D props, source-backed achievement numbers, diagram/path motion showing relationships, scoped scroll choreography and a restrained ambient layer. Avoid repetitive three-card/tab structures, generic AI copy, fake dashboards or excessive instructions.

The user has delegated design choices and implementation and already uses the local live preview. Continue directly within that authorized scope; no additional design approval or new dependencies are needed. Report tests actually run; the parent will execute browser checks after handoff.

## References

User requests https://www.scrolltide.co/components, https://threeui.com/browse?sort=recent, https://www.inspora.design/, https://land-book.com/, https://www.details.so/inspo/category/carousel, https://sceneai.art/, https://www.createwithswift.com/, https://kitbitz.art/.

Codex revisited all via web and previously captured browser images under `F:/MaiPortfolio/docs/verification/cohesion-references/`. Read the audit there for access limitations. Apply focused framing, tangible objects, meaningful scroll and gesture hierarchy; do not copy paid prompts or gated code. The new user screenshots are the exact critique of the existing layout.
