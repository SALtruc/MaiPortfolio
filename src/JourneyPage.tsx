import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { awardSource, journeyStories } from './stories';
import { approaches } from './content';
import { chapterLessons } from './routes';
import { Reveal } from './ScrollMotion';

const JourneyDesk = lazy(() => import('./JourneyDesk'));

export function JourneyPage({
  chapter,
  invalidChapter = false,
  paused,
  onChange,
}: {
  chapter: number;
  invalidChapter?: boolean;
  aboutSection?: 'desk' | 'background' | 'recognition' | null;
  paused: boolean;
  onChange: (n: number) => void;
}) {
  const selected = invalidChapter ? -1 : chapter;
  const opening = useRef<HTMLElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLElement>(null);
  const storyPanel = useRef<HTMLElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const story = selected >= 0 ? journeyStories[selected] : null;
  const lesson = selected >= 0 ? chapterLessons[selected] : null;

  useLayoutEffect(() => {
    const area = workspace.current;
    if (!area) return;

    const fitWorkspace = () => {
      // Layout offsets stay stable while the page arrives or the reader scrolls.
      let top = 0;
      let node: HTMLElement | null = area;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      const available = Math.floor((window.visualViewport?.height ?? window.innerHeight) - top - 16);
      area.style.setProperty('--j-workspace-height', `${Math.min(860, Math.max(0, available))}px`);
      area.dataset.viewportFit = available >= 410 ? 'contained' : 'flow';
    };

    fitWorkspace();
    const observer = new ResizeObserver(fitWorkspace);
    [opening.current, document.querySelector('.site-header'), area.previousElementSibling].forEach(element => {
      if (element) observer.observe(element);
    });
    window.addEventListener('resize', fitWorkspace);
    window.visualViewport?.addEventListener('resize', fitWorkspace);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fitWorkspace);
      window.visualViewport?.removeEventListener('resize', fitWorkspace);
    };
  }, [invalidChapter]);

  useEffect(() => {
    if (storyPanel.current) {
      storyPanel.current.scrollTop = 0;
    }
  }, [selected]);

  useEffect(() => {
    if (selected < 0) return;
    const nav = strip.current;
    const button = buttons.current[selected];
    if (!nav || !button || nav.scrollWidth <= nav.clientWidth + 4) return;
    const left = button.offsetLeft - (nav.clientWidth - button.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: paused ? 'instant' : 'smooth' });
  }, [selected, paused]);

  return (
    <section className="j-page about-unified" aria-labelledby="journey-title">
      <header className="j-opening" ref={opening}>
        <div className="j-opening-main">
          <p className="j-eyebrow">About Mai · Biography &amp; interactive journey</p>
          <h1 id="journey-title">
            Still curious. <em>Still growing.</em>
          </h1>
        </div>
        <div className="j-opening-side">
          <p className="j-opening-bio">
            I’m <strong>Ngoc Mai Nguyen</strong>—a Business student at RMIT Vietnam (Finance major, Digital Marketing minor) and AI Data Service &amp; Operations Intern at TikTok.
          </p>
          <div className="j-opening-status" aria-live="polite">
            <span className="j-status-pill">
              <i aria-hidden="true" />
              {story && lesson
                ? `0${selected + 1} / 05 · ${story.company} — ${story.role}`
                : '5 chapters on the desk · 2024 – Now'}
            </span>
            {selected >= 0 && (
              <button type="button" className="j-opening-reset" onClick={() => onChange(-1)}>
                Whole desk
              </button>
            )}
          </div>
        </div>
      </header>

      {invalidChapter && (
        <div className="invalid-route-callout" role="alert">
          <div>
            <strong>That chapter isn’t on the desk yet.</strong>
            <p>
              Mai’s journey currently spans five chapters (01 Student Council to 05 TikTok). Choose one of the five chapters below or explore the whole desk.
            </p>
          </div>
          <button type="button" className="j-callout-reset" onClick={() => onChange(-1)}>
            Show whole desk
          </button>
        </div>
      )}

      <div className="j-workspace" id="journey-desk" ref={workspace} data-selected-chapter={selected}>
        <Suspense fallback={<div className="j-scene-loading" role="status">Making room for the next chapter…</div>}>
          <JourneyDesk selected={selected} paused={paused} onSelect={onChange} />
        </Suspense>
        <aside className="j-story" id="journey-story-panel" ref={storyPanel} tabIndex={0} aria-label="Selected journey chapter">
          <span className="j-announcement" role="status" aria-live="polite" aria-atomic="true">
            {story && lesson ? `${story.company}. ${lesson.title}` : 'Journey overview. Choose an object or a chapter to explore.'}
          </span>
          {story && lesson ? (
            <div className="j-story-content" key={selected}>
              <div className="j-story-kicker">
                <span>
                  0{selected + 1} / 05 · {lesson.object}
                </span>
                <span>{story.date}</span>
              </div>
              <div className="j-story-header">
                <div className="j-company-line">
                  <p className="j-company">{story.company}</p>
                  <p className="j-role">{story.role}</p>
                </div>
                <h2>{lesson.title}</h2>
                <p className="j-story-summary">{lesson.text}</p>
              </div>
              <div className="j-story-media-block">
                <figure>
                  <img src={story.image} alt={story.alt} />
                  <figcaption>
                    {story.company} · {story.year}
                  </figcaption>
                </figure>
                <p className="j-story-turn">
                  {story.title} <em>{story.turn}</em>
                </p>
              </div>
              {lesson.relatedProjects.length > 0 && (
                <div className="j-project-links">
                  {lesson.relatedProjects.map((proj, idx) => (
                    <a
                      key={proj.id}
                      className={idx === 0 ? 'j-project-link' : 'j-project-link j-project-link-secondary'}
                      href={`#/work/${proj.id}`}
                    >
                      <span>{idx === 0 ? `See the work behind it · ${proj.name}` : proj.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              )}
              <details className="j-reflection">
                <summary>
                  A little more of the story <span>+</span>
                </summary>
                <p>{story.body}</p>
                <p>{story.insight}</p>
                <p className="j-carry">{story.carry}</p>
                <a href={story.source} target="_blank" rel="noreferrer">
                  Read the original reflection ↗
                </a>
              </details>
              <div className="j-story-navigation">
                <button type="button" onClick={() => onChange((selected + 4) % 5)} aria-label="Previous chapter">
                  ←
                </button>
                <div className="j-story-nav-center">
                  <span>{selected + 1} of 5 chapters</span>
                  <button type="button" className="j-story-reset-inline" onClick={() => onChange(-1)}>
                    Whole desk
                  </button>
                </div>
                <button type="button" onClick={() => onChange((selected + 1) % 5)} aria-label="Next chapter">
                  →
                </button>
              </div>
            </div>
          ) : (
            <div className="j-overview">
              <p className="j-story-kicker">
                <span>Different chapters. Same curious me.</span>
                <span>2024 – Now</span>
              </p>
              <h2>
                Growing into<br />
                my own.
              </h2>
              <p>From student clubs to a new role at TikTok, I’m learning by showing up, asking questions and trying again.</p>
              <figure>
                <img src="/assets/mai-portrait.webp" alt="Mai at RMIT University Vietnam" />
                <figcaption>Ngoc Mai Nguyen · RMIT Business</figcaption>
              </figure>
              <div className="j-overview-pillars">
                <div>
                  <strong>RMIT University Vietnam</strong>
                  <span>Finance major · Digital Marketing minor</span>
                </div>
                <div>
                  <strong>TikTok / ByteDance</strong>
                  <span>AI Data Service &amp; Operations Intern</span>
                </div>
              </div>
              <button type="button" className="j-start" onClick={() => onChange(0)}>
                Start with the notebook <span>↗</span>
              </button>
            </div>
          )}
        </aside>
        <nav className="j-chapters" ref={strip} aria-label="Journey chapters">
          {journeyStories.map((item, index) => (
            <button
              key={item.company}
              type="button"
              ref={node => {
                buttons.current[index] = node;
              }}
              aria-pressed={selected === index}
              onClick={() => onChange(index)}
              onKeyDown={event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (index + (event.key === 'ArrowRight' ? 1 : 4)) % 5;
                buttons.current[next]?.focus();
                onChange(next);
              }}
            >
              <span className="j-chapter-year">
                0{index + 1} · {item.year}
              </span>
              <span className="j-chapter-name">{item.company}</span>
              <span className="j-chapter-lesson">{chapterLessons[index].lessonShort}</span>
            </button>
          ))}
        </nav>
      </div>

      <section className="about-connected-bio" id="about-background" aria-labelledby="about-title">
        <div className="about-main">
          <figure className="about-portrait scroll-photo" data-depth-frame>
            <img src="/assets/mai-portrait.webp" alt="Mai at RMIT Vietnam" loading="lazy" />
          </figure>
          <article className="about-bio-article">
            <p className="j-eyebrow">Who I am · Beyond the timeline</p>
            <h2 id="about-title">
              A little more <em>Mai.</em>
            </h2>
            <Reveal>
              <p>I’m a Business student at RMIT Vietnam, exploring what happens when data, technology and people come together.</p>
              <p>
                Student leadership taught me to listen. Finance taught me to look closely. Working with students and employers helped me become more comfortable speaking up and bringing an idea into the room.
              </p>
              <p>Now, at TikTok, I’m getting to know a different kind of fast-moving environment: AI data service and operations.</p>
            </Reveal>
            <p className="personal-signature">
              Still learning. Always Day 1.<br />— Mai
            </p>
          </article>
        </div>

        <Reveal className="about-approaches-grid">
          {approaches.map((item, idx) => (
            <article key={item.word} className="about-approach-card">
              <span className="about-approach-kicker">
                0{idx + 1} · {item.word}
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <small>{item.proof}</small>
            </article>
          ))}
        </Reveal>

        <Reveal className="about-learning">
          <div className="about-learning-card">
            <p className="j-eyebrow">Education</p>
            <h2>
              Learning on <em>two tracks.</em>
            </h2>
            <p>
              <strong>RMIT University Vietnam</strong>
              <br />
              Bachelor of Business · Expected 2027
              <br />
              Finance major · Digital Marketing minor
            </p>
          </div>
          <div className="about-learning-card">
            <div>
              <h3>Things I work with</h3>
              <p>Excel, Google Workspace, Canva, Premiere Pro, CapCut and RStudio.</p>
            </div>
            <div>
              <h3>Languages</h3>
              <p>
                Vietnamese · native
                <br />
                English · fluent
                <br />
                German · intermediate
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="award-story" id="about-recognition" aria-labelledby="award-title">
        <figure className="scroll-photo" data-depth-frame>
          <img src="/assets/award-portrait.webp" alt="Mai holding her RMIT leadership award" loading="lazy" />
        </figure>
        <Reveal className="award-copy">
          <p className="j-eyebrow">Recognition · RMIT Vietnam 2026</p>
          <h2 id="award-title">
            A moment that <em>meant a lot.</em>
          </h2>
          <p>
            In 2026, I received RMIT’s Impactful Leaders Award and was one of 14 students selected for the Student Leadership Recognition Awards.
          </p>
          <p>What mattered most to me was that the recognition came from people who had seen different chapters of my growth.</p>
          <div className="award-actions">
            <a href={awardSource} target="_blank" rel="noreferrer">
              Read the reflection ↗
            </a>
            <a href="#/work/council">See my Student Council work ↗</a>
          </div>
        </Reveal>
      </section>

      <footer className="j-footer">
        <p>
          Not a finished story.
          <br />
          <span>Just a good place to begin the next chapter.</span>
        </p>
        <div className="j-footer-links">
          <a href="#/work">Explore all 5 projects ↗</a>
          <a href="#/contact">Contact Mai ↗</a>
        </div>
      </footer>
    </section>
  );
}
