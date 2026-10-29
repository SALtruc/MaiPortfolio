# Portfolio Navigation, About/Journey Unification & Visual Cohesion Plan

**Date:** 2026-10-29  
**Branch:** `agentdesk/t_58798808` (base `2def595`)  
**Goal:** Unify portfolio information architecture (`Home / Projects / About Mai / Contact`), merge the disconnected `About Mai` biography and interactive 3D `Journey` into a single connected experience, establish `#/work` as the sole full 5-project collection with a curated 3-project spotlight preview on Home, standardize selection vs. navigation and scroll/back behaviors, and visually unify the warm paper, deep ink, calm sage, and restrained cobalt design language across all routes.

---

## 1. Audit Summary & Key Decisions

1. **Single Canonical Main Navigation (`Home / Projects / About Mai / Contact`):**
   - Replace the fragmented 4-link header (`My path / Project stories / About Mai / Say hello`, which lacked an explicit `Home` link and split `My path` from `About Mai`) with one consistent navigation set in header and footers:
     - `Home` (`#/`)
     - `Projects` (`#/work`)
     - `About Mai` (`#/about`)
     - `Contact` (`#/contact`, with `#/hello` preserved as an alias)
   - Remove the auto-hiding header behavior (`useNavigationVisibility`), `.hide-navigation` (`⌃`),floating `.navigation-peek` (`Menu ⌄`), and the competing sticky `<SectionIndex>` dropdown overlay on project detail pages so the main header is always predictable and discoverable.

2. **Canonical Route Map & Backwards-Compatible Deep Links:**
   | Route / Pattern | Canonical Owner | Active Nav | Scroll & History Behavior |
   | :--- | :--- | :--- | :--- |
   | `#/` (alias `#/home`) | **Home** (`HomePage`) | `Home` | Starts at top on page change. |
   | `#/work` (alias `#/projects`) | **Projects Collection** (`WorkPage` -> `WorkReel`) | `Projects` | Sole full 5-project collection; starts at top on navigation. |
   | `#/work/:id` (alias `#/projects/:id`) | **Project Case Study** (`WorkPage` -> `ProjectCase`) | `Projects` | Canonical detail for `checkpoint`, `michelin`, `council`, `careers-fair`, `ctm`. Invalid `:id` renders a coherent not-found project state with links back to `#/work`. |
   | `#/about` | **About Mai** (`AboutPage` / `JourneyPage` unified) | `About Mai` | Connected single experience: Interactive 3D Journey Desk (`#journey-desk`) + Biography, Principles & Education (`#about-background`) + Leadership Recognition (`#about-recognition`). |
   | `#/journey`, `#/journey/0..4`, `#/about/0..4` | **About Mai — Journey Desk & Chapter Deep Links** | `About Mai` | Backwards-compatible deep links to the exact chapter (`0..4`) or desk overview (`-1`) on the unified `About Mai` page. Selecting chapters/objects on the desk updates URL (`#/journey/:n` / `#/journey`) without remounting `<main>` or jumping scroll to top. Invalid chapter indices render a clear invalid-chapter state. |
   | `#/notes` | **About Mai — Biography Alias** | `About Mai` | Backwards-compatible alias to `About Mai` (`#/about`), scrolling to `#about-background` when opened directly. |
   | `#/contact` (alias `#/hello`) | **Contact** (`HelloPage`) | `Contact` | Obvious direct contact bar (`mailto:`, `Copy email`, `LinkedIn ↗`, `Download CV ↗`) paired with the interactive postcard. |
   | Any invalid route (`#/invalid`) | **Not Found** (`LostPage`) | None | Coherent fallback with direct links to `Home`, `Projects`, `About Mai`, and `Contact`. |

3. **Content Ownership & Elimination of Duplication:**
   - **Home (`#/`)**: Owns the authentic Mai portrait hero, a **3-project Spotlight Preview** (`Michelin`, `Career Checkpoint`, `Student Council`) inspired by Scrolltide's Expanded Cards (selecting/hovering a card widens its framed visual preview locally; clicking its CTA opens `#/work/:id`; header/footer links open all 5 projects at `#/work`), a **single-destination About & 3D Journey invitation** (replacing the confusing mixed-destination photo carousel), and the contact footer.
   - **Projects (`#/work` & `#/work/:id`)**: Owns the sole full 5-project collection (`WorkReel`) and the 5 deep case studies (`ProjectCase`). Every study includes clear breadcrumbs (`← All projects`), a contextual link back to its matching chapter on Mai's 3D Journey Desk (`#/journey/:n`), and a bottom project switcher.
   - **About Mai (`#/about`)**: Owns both the interactive 3D Journey Desk (`JourneyDesk` + 5 chapter stories) and Mai's personal biography, 3 working approaches (`Clarity`, `Connection`, `Ownership`), RMIT education & toolkit, and 2026 Impactful Leaders Award story, joined by an explicit local section nav (`Interactive 3D Desk · Story & Education · Recognition`).
   - **Contact (`#/contact` / `#/hello`)**: Owns direct contact actions (email, copy email, LinkedIn, CV PDF) alongside the interactive postcard.

4. **Selection vs. Navigation & Mobile Ergonomics:**
   - Local selection controls (spotlight project cards on Home, chapter pills, 3D desk objects/markers, process decision tabs) update local state in-place without unexpected page jumps.
   - Navigation controls use explicit action labels (`Read case study ↗`, `Explore all 5 projects ↗`, `Meet Mai & explore the 3D desk ↗`, `See the work behind it ↗`).
   - On mobile (`<= 850px`), selecting a 3D desk object or chapter displays an immediate **Active Chapter Status Bar** directly beneath the desk with the selected chapter's title and a `"Read story ↓"` jump button, making selection obvious without hijacking touch drag or shifting marker hit coordinates.

5. **Visual System Unification:**
   - Harmonize CSS tokens around warm archival paper (`#f5f4ee`), elevated cream card (`#fbfaf5`), calm sage surface (`#ecefe8`), organic sage accent (`#43614a`), deep charcoal-navy ink (`#16202a`), and restrained cobalt (`#2b54c7`).
   - Restrain the Home hero ribbon so it supports the portrait rather than overpowering it, and replace the jarring electric-blue Home contact block with a refined dark-ink/sage/paper editorial footer.

---

## 2. Implementation Steps

- [x] **Step 1: Create shared route & chapter-project mapping module (`src/routes.ts`)**
  - Define canonical nav items (`Home`, `Projects`, `About Mai`, `Contact`), route parser (`parseRoute`) handling valid/alias/invalid routes, chapters (`0..4`), and bidirectional mapping between the 5 Journey chapters and 5 Project case studies.
- [x] **Step 2: Unify `App.tsx` navigation, route handling, and scroll restoration**
  - Update main header to `Home / Projects / About Mai / Contact`, remove auto-hide header & floating `Menu ⌄` / `⌃` buttons, key `<main>` by `canonicalPage` so within-About/Journey chapter selection never remounts the 3D scene or jumps to top, and handle invalid routes coherently.
- [x] **Step 3: Unify `About Mai` & `3D Journey` (`src/JourneyPage.tsx` & `src/Pages.tsx`)**
  - Combine the interactive 3D Journey Desk and 5 chapter stories with Mai's biography, working approaches, education/toolkit, and 2026 leadership award into a single connected experience on `#/about` (aliasing `#/journey`, `#/journey/:n`, `#/notes`), with explicit local section navigation, mobile selected-chapter visibility banner, chapter-to-project links for all 5 studies, and coherent invalid-chapter handling.
- [x] **Step 4: Refactor Home (`src/HomePage.tsx` & `src/InteractiveStories.tsx`)**
  - Replace the 5-project duplicate gallery with a 3-project Spotlight Expanded Cards preview (`Michelin`, `Career Checkpoint`, `Student Council`) + link to all 5 projects (`#/work`).
  - Replace the mixed-destination photo carousel with a cohesive About Mai & 3D Journey invitation section linking exclusively to `#/about` and `#/journey/:n`.
  - Update hero and footer CTAs/navigation to match canonical IA.
- [x] **Step 5: Refine Projects (`src/WorkPage.tsx` & `src/WorkReel.tsx`) & Contact (`src/Pages.tsx`)**
  - Remove competing `<SectionIndex>` overlay from `ProjectCase`; add clear breadcrumb (`← All projects`), matching Journey chapter backlink (`#/journey/:n`), bottom project index switcher, and coherent invalid-project handling.
  - Enhance `WorkReel` with a 5-project quick index bar and Journey chapter badges.
  - Enhance `HelloPage` (`#/contact` / `#/hello`) with always-visible direct links (`mailto:`, `Copy email`, `LinkedIn`, `CV`) alongside the interactive postcard.
- [x] **Step 6: Cohesive visual pass across CSS (`src/styles.css`, `src/refinement.css`, `src/motion-home.css`, `src/interactive-stories.css`, `src/journey-desk.css`, `src/work.css`)**
  - Unify color tokens (warm paper, ink, sage, restrained cobalt), header styling, spotlight card transitions, unified About sections, and responsive mobile layouts (`320px–1440px+`) while preserving reduced-motion rules and `>=44px` hit targets.
- [x] **Step 7: Update & expand browser verification scripts (`scripts/verify-motion.py`, `scripts/verify-journey-desk.py`, `scripts/review-journey-touch.py`)**
  - Align `scripts/verify-motion.py` and `scripts/verify-journey-desk.py` with the canonical IA (`Home / Projects / About Mai / Contact`, 3-project Home spotlight preview, unified About/Journey, deep-link aliases, invalid route/chapter/project handling) while preserving all motion, reduced-motion, 3D desk, and mobile touch checks.
