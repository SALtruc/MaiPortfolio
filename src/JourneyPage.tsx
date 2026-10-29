import { lazy, Suspense, useEffect, useRef } from 'react';
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
  const strip = useRef<HTMLElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const story = selected >= 0 ? journeyStories[selected] : null;
  const lesson = selected >= 0 ? chapterLessons[selected] : null;

  useEffect(() => {
    if (selected < 0) return;
    const nav = strip.current;
    const button = buttons.current[selected];
    if (!nav || !button || nav.scrollWidth <= nav.clientWidth + 4) return;
    const left = button.offsetLeft - (nav.clientWidth - button.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: paused ? 'instant' : 'smooth' });
  }, [selected, paused]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: paused ? 'instant' : 'smooth', block: 'start' });
  };

  return (
    <section className="j-page about-unified" aria-labelledby="journey-title">
      <header className="j-opening">
        <div>
          <p className="j-eyebrow">About Mai · Biography & interactive journey</p>
          <h1 id="journey-title">
            Still curious.<br />
            <em>Still growing.</em>
          </h1>
        </div>
        <div className="j-opening-side">
          <p>
            I’m Ngoc Mai Nguyen—a Business student at RMIT Vietnam (Finance major, Digital Marketing minor) and AI Data Service &amp; Operations Intern at TikTok.
            <span>Pick an object on my desk to explore the five chapters so far, or read my background below.</span>
          </p>
          <nav className="about-local-nav" aria-label="On this page">
            <button type="button" onClick={() => scrollToSection('journey-desk')}>
              <span>01</span> Interactive 3D desk
            </button>
            <button type="button" onClick={() => scrollToSection('about-background')}>
              <span>02</span> Story &amp; education
            </button>
            <button type="button" onClick={() => scrollToSection('about-recognition')}>
              <span>03</span> Leadership recognition
            </button>
          </nav>
        </div>
      </header>

      {invalidChapter && (
        <div className="invalid-route-callout" role="alert">
          <div>
            <strong>That chapter isn’t on the desk yet.</strong>
            <p>Mai’s journey currently spans five chapters (01 Student Council to 05 TikTok). Choose one of the five chapters below or explore the whole desk.</p>
          </div>
          <button type="button" className="j-callout-reset" onClick={() => onChange(-1)}>
            Show whole desk
          </button>
        </div>
      )}

      <div className="j-workspace" id="journey-desk">
        <Suspense fallback={<div className="j-scene-loading" role="status">Making room for the next chapter…</div>}>
          <JourneyDesk selected={selected} paused={paused} onSelect={onChange} />
        </Suspense>
        <aside className="j-story" id="journey-story-panel" aria-label="Selected journey chapter">
          <span className="j-announcement" role="status" aria-live="polite" aria-atomic="true">
            {story && lesson ? `${story.company}. ${lesson.title}` : 'Journey overview. Choose an object or a chapter to explore.'}
          </span>
          {story && lesson ? (
            <div className="j-story-content" key={selected}>
              <p className="j-story-kicker">
                {lesson.object} <span>{story.date}</span>
              </p>
              <div>
                <p className="j-company">{story.company}</p>
                <h2>{lesson.title}</h2>
                <p className="j-story-summary">{lesson.text}</p>
              </div>
              <p className="j-role">{story.role}</p>
              <p className="j-story-turn">
                {story.title} <em>{story.turn}</em>
              </p>
              <figure>
                <img src={story.image} alt={story.alt} />
                <figcaption>{story.company} · {story.year}</figcaption>
              </figure>
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
              {lesson.relatedProjects.map((proj, idx) => (
                <a
                  key={proj.id}
                  className={idx === 0 ? 'j-project-link' : 'j-project-link j-project-link-secondary'}
                  href={`#/work/${proj.id}`}
                >
                  {idx === 0 ? 'See the work behind it' : proj.label} <span>↗</span>
                </a>
              ))}
              <div className="j-story-navigation">
                <button onClick={() => onChange((selected + 4) % 5)} aria-label="Previous chapter">
                  ←
                </button>
                <span>{selected + 1} of 5 chapters</span>
                <button onClick={() => onChange((selected + 1) % 5)} aria-label="Next chapter">
                  →
                </button>
              </div>
            </div>
          ) : (
            <div className="j-overview">
              <p className="j-story-kicker">Different chapters. Same curious me.</p>
              <h2>
                Growing into<br />
                my own.
              </h2>
              <p>From student clubs to a new role at TikTok, I’m learning by showing up, asking questions and trying again.</p>
              <figure>
                <img src="/assets/mai-portrait.webp" alt="Mai at RMIT University Vietnam" />
                <figcaption>Ngoc Mai Nguyen · RMIT Business</figcaption>
              </figure>
              <button className="j-start" onClick={() => onChange(0)}>
                Start with the notebook <span>↗</span>
              </button>
            </div>
          )}
        </aside>
        <nav className="j-chapters" ref={strip} aria-label="Journey chapters">
          {journeyStories.map((item, index) => (
            <button
              key={item.company}
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
              <span className="j-chapter-year">{item.year}</span>
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
              <span className="about-approach-kicker">0{idx + 1} · {item.word}</span>
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
              <strong>RMIT University Vietnam</strong><br />
              Bachelor of Business · Expected 2027<br />
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
                Vietnamese · native<br />
                English · fluent<br />
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
          <p>In 2026, I received RMIT’s Impactful Leaders Award and was one of 14 students selected for the Student Leadership Recognition Awards.</p>
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
          Not a finished story.<br />
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
