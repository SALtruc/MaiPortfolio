import { useEffect, useLayoutEffect, useRef } from 'react';
import { awardSource, journeyStories } from './stories';
import { approaches } from './content';
import { chapterLessons } from './routes';
import { Reveal } from './ScrollMotion';
import JourneyRoadmap from './JourneyRoadmap';

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
  const storyPanel = useRef<HTMLElement>(null);
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
                : '5 stops on the roadmap · 2024 – Now'}
            </span>
            {selected >= 0 && (
              <button type="button" className="j-opening-reset" onClick={() => onChange(-1)}>
                Whole roadmap
              </button>
            )}
          </div>
        </div>
      </header>

      {invalidChapter && (
        <div className="invalid-route-callout" role="alert">
          <div>
            <strong>That stop isn’t on the roadmap yet.</strong>
            <p>
              Mai’s journey currently spans five chapters (01 Student Council to 05 TikTok). Choose one of the five stops below or view the whole roadmap.
            </p>
          </div>
          <button type="button" className="j-callout-reset" onClick={() => onChange(-1)}>
            Show whole roadmap
          </button>
        </div>
      )}

      <div className="j-workspace" id="journey-desk" ref={workspace} data-selected-chapter={selected}>
        <JourneyRoadmap selected={selected} paused={paused} onChange={onChange} />
        <aside className="j-story" id="journey-story-panel" ref={storyPanel} tabIndex={0} aria-label="Selected journey chapter">
          <span className="j-announcement" role="status" aria-live="polite" aria-atomic="true">
            {story && lesson ? `${story.company}. ${lesson.title}` : 'Journey overview. Choose a stop on the roadmap to explore.'}
          </span>
          {story && lesson ? (
            <div className="j-story-content" key={selected}>
              <div className="j-story-kicker">
                <span>
                  Stop 0{selected + 1} / 05 · {lesson.skill}
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
                <button type="button" onClick={() => onChange((selected + 4) % 5)} aria-label="Previous stop">
                  ←
                </button>
                <div className="j-story-nav-center">
                  <span>Stop {selected + 1} of 5</span>
                  <button type="button" className="j-story-reset-inline" onClick={() => onChange(-1)}>
                    Whole roadmap
                  </button>
                </div>
                <button type="button" onClick={() => onChange((selected + 1) % 5)} aria-label="Next stop">
                  →
                </button>
              </div>
            </div>
          ) : (
            <div className="j-overview">
              <p className="j-story-kicker">
                <span>Five stops. Same curious me.</span>
                <span>2024 – Now</span>
              </p>
              <h2>
                Growing into<br />
                my own.
              </h2>
              <p>From student clubs to a new role at TikTok, I’m learning by showing up, asking questions and trying again.</p>
              <p className="j-overview-label">What I bring to the team</p>
              <ul className="j-overview-pillars">
                {approaches.map(item => (
                  <li key={item.word}>
                    <strong>{item.word}</strong>
                    <span>{item.short}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="j-start" onClick={() => onChange(0)}>
                Start at stop 01 · Student Council <span>↗</span>
              </button>
            </div>
          )}
        </aside>
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
