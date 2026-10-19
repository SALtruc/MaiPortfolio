# Verification — readability, scroll and real stories

Checked in the connected Chrome browser against the local Vite preview.

- Build: `npm run build` passes TypeScript and production bundling. The lazy Three.js runtime has the existing bundle-size advisory.
- Photos: 13 LinkedIn images downloaded and converted to local WebP assets. The TikTok page uses the actual portrait beside the TikTok logo. Workshop, award, Club Day and Careers Fair imagery are available in the portfolio.
- Content: My Path uses five personal turning points. Project Stories uses five cases with three decisions each, explanations, results, source links and evidence galleries. Careers Fair separates individual contribution from event totals; CTM uses revenue contribution share.
- Desktop: body copy is 24px; supporting reading text and controls are at least 22px. Querying visible paragraph, link, button and caption styles on Journey found no text below 22px.
- Mobile at 390 × 844: no horizontal overflow on Journey, Project Stories, contact or home. Project Stories minimum reading font measured 22px. The four home destination controls use a two-column layout, without overlapping projected labels.
- Scroll: direct link `#/journey/4` positions the TikTok chapter at approximately 190px below the viewport top, beneath the sticky header and chapter navigation. A real scroll changed the TikTok photo matrix from `matrix(1.04073, 0, 0, 1.04073, 0, 9.16263)` to `matrix(1.03197, 0, 0, 1.03197, 0, -4.84746)`. Motion off clears the image transform.
- Project interactions: third decision reveals the actual schedule change from weekly sessions to one connected week. ArrowDown moves to the next decision tab. Gallery changes image; evidence enlargement opens a dialog and Escape closes it.
- Contact: postcard flip exposes email, LinkedIn and CV links. The hidden side is inert. Mobile contact has no horizontal overflow.
- Desktop viewport restored after mobile verification. Preview remains local and has not been publicly deployed.
