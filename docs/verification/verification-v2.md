# Verification — revised portfolio

- `npm run build`: TypeScript and Vite production build passed. Three.js is lazy loaded in its own chunk; the bundler reports a size advisory for the Three.js runtime (approximately 138 KB gzip).
- Desktop: actual WebGL canvas and all four equivalent HTML desk destination buttons present. Projected labels stay within the desk section. No page horizontal overflow.
- Chronology: Michelin station opens the correct 2026 chapter. Next/previous chapter navigation and direct hash links work.
- Work: changing the selected folder updates the URL and matching story. Career Checkpoint and Student Council verified. Contribution and learning tabs work; ArrowRight selects the next tab with focus movement.
- Contact: turning the postcard reveals the correct mailto, LinkedIn and CV links. Hidden face is inert for keyboard and assistive technology.
- Mobile at 390 × 844: no horizontal page overflow on desk, work or contact. All four 3D destination labels stay within the viewport. Mobile chapter menu opens, routes correctly and closes after selection. Folder labels were enlarged and shortened after visual review.
- Motion control works; the initial preference follows `prefers-reduced-motion`. Desktop viewport override reset after mobile testing.
- Browser console inspection found no app errors on the redesigned homepage. Unrelated browser extension messages are excluded from app findings.
- Preview left open at http://127.0.0.1:5173/#/. This is local, not publicly deployed.

Screenshot: `desktop-v2.png` captured from the live browser preview.
