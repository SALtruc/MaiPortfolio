# Council case: the people behind Club Day

The case now opens with a compact masthead and the 43-point constellation, rather than a photo hero followed by a large control dashboard. Three native controls select Listen, Coordinate and Deliver. Each updates the connections, real photograph, sourced decision and a scoped achievement. All 43 points represent the participating clubs collectively; they are not an actual floorplan or per-club record.

The first implementation's invented cohorts, club ranges, 15/30-club semester counts, precise semester role chronology and stitched quotations have been removed. The remaining facts come from `stories.ts`, `content.ts` and the original photographs: 43 clubs and 2,500+ participants at Club Day S3/2025; 500M+ VND annual council budget; wider council work with 20+ sponsors, 30+ stakeholders and 15+ monthly budgets/reimbursements. The broader 45-club reflection remains in the sourced decision explanation, distinct from the 43-club event.

The narrative below the opening contains all three sourced decisions and explanations, a compact responsibility ledger, four real photographs with image enlargement, the shared outcome, personal learning and original/recognition source links. It avoids duplicate scope cards and console-style labels.

Technical interaction: actual GSAP path drawing across the constellation on selection, staggered point entrance, bounded fine-pointer perspective, and ScrollTrigger choreography on the work record/evidence. GSAP contexts clean up on pause and route unmount. No continuous animation loop is required. Native tab controls support ArrowLeft/ArrowRight/Home/End, image dialogs support Escape, and reduced motion retains all content and state changes.

## Verification performed

- Browser case lab checked at 320, 390, 768, 1280 and 1440px. No horizontal overflow, one h1, 43 points and three controls at every width.
- Actual selection and keyboard progression verified at all five widths. Photo modal opening and Escape closing verified.
- GSAP path offset changed from 635px to 26px during an actual selection; pausing left the selected view usable and the path still.
- No uncaught browser errors in these checks. Screenshots: `docs/verification/project-experiences/council-refined-1440.png` and `council-refined-320.png`.
- The broad TypeScript build reported only the existing Michelin host-null errors at the time of this review; Council produced no reported TypeScript errors. Parent owns the final combined build.

Physical-device frame pacing was not measured. No release actions were performed.
