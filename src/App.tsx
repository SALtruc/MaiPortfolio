import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { JourneyPage, WorkPage, HelloPage } from './Pages';
import { usePhotoMotion, useFrameMotion } from './ScrollMotion';
import HomePage from './HomePage';
import { studies, journeyStories } from './stories';
import { mainNav, parseRoute } from './routes';

type ScrollTarget =
  | { type: 'top'; token: number }
  | { type: 'section'; id: string; token: number }
  | { type: 'restore'; top: number; token: number }
  | { type: 'none'; token: number };

let entryCounter = 0;
const scrollMemory = new Map<string, number>();

function ensureHistoryEntryId(forceNew = false): string {
  const existing = !forceNew && history.state && typeof history.state.__entryId === 'string' ? history.state.__entryId : null;
  if (existing) return existing;
  const nextId = `entry-${Date.now()}-${++entryCounter}`;
  try {
    history.replaceState({ ...(history.state || {}), __entryId: nextId }, '');
  } catch {
    // Ignore restricted history state environments
  }
  return nextId;
}

function normalizeHashRoute(hash: string): string {
  return hash.replace(/^#\/?/, '').replace(/\/+$/, '');
}

export default function App() {
  const [routeState, setRouteState] = useState(() => parseRoute());
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [menu, setMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const activeEntryIdRef = useRef<string>('');
  if (!activeEntryIdRef.current) {
    activeEntryIdRef.current = ensureHistoryEntryId(false);
    scrollMemory.set(activeEntryIdRef.current, window.scrollY);
  }
  const activeHashRef = useRef<string>(location.hash);
  const inPlaceDeskNavRef = useRef(false);
  const explicitTopNavRef = useRef(false);
  const restoringScrollRef = useRef<number | null>(null);
  const scrollTokenRef = useRef(0);
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget>(() => {
    if (routeState.aboutSection === 'background') {
      return { type: 'section', id: 'about-background', token: 0 };
    }
    if (routeState.aboutSection === 'recognition') {
      return { type: 'section', id: 'about-recognition', token: 0 };
    }
    return { type: 'none', token: 0 };
  });

  const { canonicalPage, chapter, invalidChapter, aboutSection, projectId, invalidProject } = routeState;
  const routeKey = `${canonicalPage}:${projectId ?? ''}:${chapter}:${aboutSection ?? ''}`;

  usePhotoMotion(paused, routeKey);
  useFrameMotion(paused, routeKey);

  const navigate = useCallback((destination: string, options?: { inPlace?: boolean }) => {
    const nextHash = `#/${destination.replace(/^\/+/, '')}`;
    if (restoringScrollRef.current === null) {
      scrollMemory.set(activeEntryIdRef.current, window.scrollY);
    }
    if (normalizeHashRoute(location.hash) === normalizeHashRoute(nextHash)) {
      if (!options?.inPlace) {
        restoringScrollRef.current = null;
        window.scrollTo({ top: 0, behavior: 'instant' });
        scrollMemory.set(activeEntryIdRef.current, 0);
        setScrollTarget({ type: 'top', token: ++scrollTokenRef.current });
      }
      return;
    }
    inPlaceDeskNavRef.current = Boolean(options?.inPlace);
    location.hash = `/${destination.replace(/^\/+/, '')}`;
  }, []);

  const handleGlobalNavClick = useCallback((targetHref: string) => {
    setMenu(false);
    if (restoringScrollRef.current === null) {
      scrollMemory.set(activeEntryIdRef.current, window.scrollY);
    }
    if (normalizeHashRoute(location.hash) === normalizeHashRoute(targetHref)) {
      explicitTopNavRef.current = false;
      restoringScrollRef.current = null;
      window.scrollTo({ top: 0, behavior: 'instant' });
      scrollMemory.set(activeEntryIdRef.current, 0);
      setScrollTarget({ type: 'top', token: ++scrollTokenRef.current });
      return;
    }
    explicitTopNavRef.current = true;
  }, []);

  useEffect(() => {
    const recordScroll = () => {
      if (restoringScrollRef.current !== null) return;
      scrollMemory.set(activeEntryIdRef.current, window.scrollY);
    };
    const captureBeforeInteraction = (event: Event) => {
      if (restoringScrollRef.current === null) {
        scrollMemory.set(activeEntryIdRef.current, window.scrollY);
      }
      if (event.type === 'click') {
        const anchor = (event.target as Element | null)?.closest?.('a[href^="#/"]') as HTMLAnchorElement | null;
        if (anchor && !anchor.closest('.m-footer-sign')) {
          const href = anchor.getAttribute('href') || '#/';
          if (normalizeHashRoute(location.hash) === normalizeHashRoute(href)) {
            const parsed = parseRoute(href);
            restoringScrollRef.current = null;
            if (parsed.aboutSection === 'background') {
              setScrollTarget({ type: 'section', id: 'about-background', token: ++scrollTokenRef.current });
            } else if (parsed.aboutSection === 'recognition') {
              setScrollTarget({ type: 'section', id: 'about-recognition', token: ++scrollTokenRef.current });
            } else {
              window.scrollTo({ top: 0, behavior: 'instant' });
              scrollMemory.set(activeEntryIdRef.current, 0);
              setScrollTarget({ type: 'top', token: ++scrollTokenRef.current });
            }
          }
        }
      }
    };

    const handleRouteTransition = () => {
      const incomingEntryId = history.state && typeof history.state.__entryId === 'string' ? history.state.__entryId : null;
      const previousEntryId = activeEntryIdRef.current;

      if (incomingEntryId && incomingEntryId === previousEntryId && location.hash === activeHashRef.current) {
        return;
      }

      if (restoringScrollRef.current === null && previousEntryId) {
        scrollMemory.set(previousEntryId, window.scrollY);
      }

      const next = parseRoute();
      const isInPlaceDesk = inPlaceDeskNavRef.current;
      const isExplicitTopNav = explicitTopNavRef.current;
      inPlaceDeskNavRef.current = false;
      explicitTopNavRef.current = false;

      const isHistoryTraversal =
        !isInPlaceDesk &&
        !isExplicitTopNav &&
        typeof incomingEntryId === 'string' &&
        incomingEntryId !== previousEntryId &&
        scrollMemory.has(incomingEntryId);

      const nextToken = ++scrollTokenRef.current;
      let nextScrollTarget: ScrollTarget;

      if (isHistoryTraversal && incomingEntryId) {
        const savedTop = scrollMemory.get(incomingEntryId) ?? 0;
        activeEntryIdRef.current = incomingEntryId;
        restoringScrollRef.current = savedTop;
        nextScrollTarget = { type: 'restore', top: savedTop, token: nextToken };
      } else {
        const newEntryId = ensureHistoryEntryId(true);
        activeEntryIdRef.current = newEntryId;
        restoringScrollRef.current = null;
        if (isInPlaceDesk) {
          scrollMemory.set(newEntryId, window.scrollY);
          nextScrollTarget = { type: 'none', token: nextToken };
        } else if (!isExplicitTopNav && next.aboutSection === 'background') {
          nextScrollTarget = { type: 'section', id: 'about-background', token: nextToken };
        } else if (!isExplicitTopNav && next.aboutSection === 'recognition') {
          nextScrollTarget = { type: 'section', id: 'about-recognition', token: nextToken };
        } else {
          scrollMemory.set(newEntryId, 0);
          nextScrollTarget = { type: 'top', token: nextToken };
        }
      }

      activeHashRef.current = location.hash;

      flushSync(() => {
        setRouteState(next);
        setScrollTarget(nextScrollTarget);
        setMenu(false);
      });
    };

    window.addEventListener('scroll', recordScroll, { passive: true });
    window.addEventListener('pointerdown', captureBeforeInteraction, { capture: true });
    window.addEventListener('click', captureBeforeInteraction, { capture: true });
    window.addEventListener('keydown', captureBeforeInteraction, { capture: true });
    window.addEventListener('popstate', handleRouteTransition);
    window.addEventListener('hashchange', handleRouteTransition);
    return () => {
      window.removeEventListener('scroll', recordScroll);
      window.removeEventListener('pointerdown', captureBeforeInteraction, { capture: true });
      window.removeEventListener('click', captureBeforeInteraction, { capture: true });
      window.removeEventListener('keydown', captureBeforeInteraction, { capture: true });
      window.removeEventListener('popstate', handleRouteTransition);
      window.removeEventListener('hashchange', handleRouteTransition);
    };
  }, []);

  useLayoutEffect(() => {
    if (scrollTarget.type === 'none') {
      restoringScrollRef.current = null;
      return;
    }

    if (scrollTarget.type === 'top') {
      restoringScrollRef.current = null;
      window.scrollTo({ top: 0, behavior: 'instant' });
      scrollMemory.set(activeEntryIdRef.current, 0);
      return;
    }

    if (scrollTarget.type === 'restore') {
      const targetTop = scrollTarget.top;
      window.scrollTo({ top: targetTop, behavior: 'instant' });
      scrollMemory.set(activeEntryIdRef.current, targetTop);
      const raf = requestAnimationFrame(() => {
        window.scrollTo({ top: targetTop, behavior: 'instant' });
        scrollMemory.set(activeEntryIdRef.current, window.scrollY);
        restoringScrollRef.current = null;
      });
      return () => {
        cancelAnimationFrame(raf);
        restoringScrollRef.current = null;
      };
    }

    if (scrollTarget.type === 'section') {
      restoringScrollRef.current = null;
      const scrollToSectionElement = () => {
        const element = document.getElementById(scrollTarget.id);
        if (element) {
          element.scrollIntoView({ behavior: 'instant', block: 'start' });
          scrollMemory.set(activeEntryIdRef.current, window.scrollY);
        }
      };
      scrollToSectionElement();
      const raf = requestAnimationFrame(scrollToSectionElement);
      const timer = window.setTimeout(scrollToSectionElement, 100);
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(timer);
      };
    }
  }, [scrollTarget]);

  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'off' : 'on';
  }, [paused]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);

  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPaused(q.matches);
    q.addEventListener('change', update);
    return () => q.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (canonicalPage === 'home') {
      document.title = 'Ngoc Mai Nguyen — Business, with a human side.';
    } else if (canonicalPage === 'work') {
      const study = studies.find(item => item.id === projectId);
      document.title = study
        ? `${study.name} — Projects — Ngoc Mai Nguyen`
        : invalidProject
          ? 'Project not found — Ngoc Mai Nguyen'
          : 'Projects — Ngoc Mai Nguyen';
    } else if (canonicalPage === 'about') {
      const story = chapter >= 0 ? journeyStories[chapter] : null;
      document.title = story
        ? `${story.company} — About Mai — Ngoc Mai Nguyen`
        : 'About Mai — Ngoc Mai Nguyen';
    } else if (canonicalPage === 'contact') {
      document.title = 'Contact — Ngoc Mai Nguyen';
    } else {
      document.title = 'A loose page — Ngoc Mai Nguyen';
    }
  }, [canonicalPage, projectId, invalidProject, chapter]);

  const pageClass = canonicalPage === 'home' ? 'desk' : canonicalPage === 'about' ? 'journey' : canonicalPage;

  return (
    <div className={`portfolio-world page-${pageClass}`} data-navigation="visible">
      <a
        className="skip-link"
        href="#main"
        onClick={e => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a className="signature" href="#/" aria-label="Mai, home" onClick={() => handleGlobalNavClick('#/')}>
          mai.<span>↗</span>
        </a>
        <nav className={menu ? 'chapter-nav expanded' : 'chapter-nav'} aria-label="Main navigation">
          {mainNav.map(item => (
            <a
              key={item.id}
              href={item.href}
              aria-current={canonicalPage === item.id ? 'page' : undefined}
              onClick={() => handleGlobalNavClick(item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="motion-switch"
          aria-pressed={paused}
          aria-label={paused ? 'Enable motion' : 'Pause motion'}
          onClick={() => setPaused(!paused)}
          title={paused ? 'Enable motion' : 'Pause motion'}
        >
          {paused ? '▷' : 'Ⅱ'}
        </button>
        <button
          ref={menuButtonRef}
          className={`index-toggle ${menu ? 'open' : ''}`}
          aria-label={menu ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          <span />
          <span />
        </button>
      </header>
      <main className="page-stage" id="main" tabIndex={-1} key={canonicalPage}>
        {canonicalPage === 'home' && <HomePage paused={paused} />}
        {canonicalPage === 'about' && (
          <JourneyPage
            chapter={chapter}
            invalidChapter={invalidChapter}
            aboutSection={aboutSection}
            paused={paused}
            onChange={i => navigate(i < 0 ? 'journey' : `journey/${i}`, { inPlace: true })}
          />
        )}
        {canonicalPage === 'work' && (
          <WorkPage
            projectId={projectId}
            invalidProject={invalidProject}
            paused={paused}
            onChange={id => navigate(id ? `work/${id}` : 'work')}
          />
        )}
        {canonicalPage === 'contact' && <HelloPage />}
        {canonicalPage === 'lost' && (
          <section className="lost-page" aria-labelledby="lost-title">
            <p className="j-eyebrow">404 · Page not found</p>
            <h1 id="lost-title">A loose page.</h1>
            <p className="lost-copy">
              That link doesn’t match a page in Mai’s portfolio. Choose a destination below to continue exploring.
            </p>
            <div className="lost-actions">
              <a className="m-button m-button-dark" href="#/">Back to Home ↗</a>
              <a className="m-button m-button-outline" href="#/work">Explore Projects ↗</a>
              <a className="m-button m-button-outline" href="#/about">About Mai & 3D Desk ↗</a>
              <a className="m-button m-button-outline" href="#/contact">Contact Mai ↗</a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
