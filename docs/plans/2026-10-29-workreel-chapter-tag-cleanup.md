# Plan: Final WorkReel Chapter Tag Affordance Cleanup (2026-10-29)

## Goal
Remove ambiguous per-project `.reel-chapter-tag` object links (`The photograph ↗`, `The notebook ↗`, etc.) from `src/WorkReel.tsx` so the Projects collection (`#/work`) only exposes clear project destinations while preserving the footer invitation to About Mai and all contextual chapter links on project detail pages and the 3D Journey desk.

## Steps
- [x] Remove unused `projectChapterMap` import and local `chapterInfo` lookup from `src/WorkReel.tsx`.
- [x] Remove `.reel-chapter-tag` anchor from `.reel-story-meta` in `src/WorkReel.tsx`, preserving `.reel-company`, collection controls, project links, and footer links.

## Key Decisions
- Keep `.reel-story-meta` wrapper around `<span className="reel-company">{study.company}</span>` so vertical spacing and layout rhythm remain unchanged.
- Keep `projectChapterMap` in `src/routes.ts` and all contextual Journey links in `src/WorkPage.tsx` (`ProjectCase`) and `src/JourneyPage.tsx` untouched.
