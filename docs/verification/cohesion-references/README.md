# Reference and interaction audit — 2026-10-29

Codex visited every supplied URL using web extraction and Chromium. Viewport screenshots in this folder are private design review evidence, not product assets. Browser fallback successfully accessed ThreeUI and Details after web extraction failed. Landbook's browser served a 403 verification screen; its web-extracted gallery text was readable. Details showed blurred preview tiles requiring access; SceneAI's preview tiles were unloaded during capture. No gated resources were bypassed.

## Applicable observations

- Scrolltide: one focused component per example, materials and dimensionality used to show affordance; Spotlight Carousel descriptions emphasize a clear selected frame and recropping rather than distorted images. Apply focused selection and unified hover/press feedback.
- ThreeUI: Complete Shelf arranges a few tangible objects on a single shelf; Fold Line creates a single central visual object with compact explanation. Apply composition and visual hierarchy to existing genuine portfolio assets and the desk, not their literal design/code.
- Inspora: editorial alignment, layered print/photographic frames, generous surrounding space. Apply consistent photography and material language across Home/Work/About.
- Landbook: accessible gallery text identifies portfolio, big type, people, 3D, pastel and parallax categories. Do not claim detailed visual inspection behind the challenge.
- Details: clear hierarchy and a single carousel category. Gated example images were blurred; no claims about their actual animation.
- SceneAI: clear hero/primary action, orderly showcase. Some thumbnails did not load; no paid prompt access.
- Create with Swift: strong type hierarchy with clear primary action and separated learning categories; spatial and gesture articles support deliberate gesture priority, not conflicting interaction modes.
- Kitbitz: generous 3D objects framing a single message. Borrow dimensional warmth sparingly; colorful illustrations should not displace real Mai photography or turn a business portfolio into a game.

## Existing product audit

1. Home has all five projects in ProjectShowcase, then WorkReel offers all five again with different controls. Choose one canonical collection; Home becomes a short linked preview.
2. AboutPlayground's personal photo actions scatter to Notes, project cases and Journey. A personal invitation should lead predictably into About; selected project links belong in Projects or explicit contextual CTAs.
3. Notes and Journey duplicate biography and lack a connecting structure. Integrate them as About Mai with personal introduction, growth journey and background.
4. Main auto-hiding navigation, Menu peek, hide button and per-page SectionIndex compete. Consolidate into a predictable global nav and clear local controls.
5. Scroll resetting lives in App, WorkPage and individual click handlers. Canonical routes should own new-page movement; local selection and browser history need distinct, consistent behavior.
6. Current Home's large cobalt ribbon, Work's technical case studies and Journey's sage desktop read as separate design concepts. Unify paper/ink/sage, photographic frames and restrained cobalt interactions while retaining existing Three.js craft.

## Reviewer acceptance journeys

- Home project preview → same canonical case → Projects collection; only one full collection exists.
- Home Meet Mai → About introduction → 3D journey → relevant project → same selected journey chapter.
- Old Notes/Journey deep links → correct About section/chapter, with About active in global navigation.
- Every main destination has consistent labels, correct active state, proper scroll and a way onward/back.
- Mobile menus, desk touch/drag/scroll, keyboard, reduced motion and unavailable WebGL remain usable.
- Photos, metrics, dates and sources remain grounded in existing content. No invented claims.
