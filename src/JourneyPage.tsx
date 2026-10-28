import { lazy, Suspense, useEffect, useRef } from 'react';
import { journeyStories } from './stories';

const JourneyDesk = lazy(() => import('./JourneyDesk'));
const lessons = [
  { title: 'People before spreadsheets.', text: 'Student leadership taught me to listen, build trust and adapt to different teams.', object: 'The notebook', project: 'council' },
  { title: 'Look beyond the first click.', text: 'At CTM, I began connecting content, customer conversations and the follow-up that comes next.', object: 'The phone', project: 'ctm' },
  { title: 'Try again. Then speak up.', text: 'Four applications later, I joined RMIT Careers. Confidence grew through conversations and taking ownership.', object: 'The photograph', project: 'checkpoint' },
  { title: 'Make the details useful.', text: 'Michelin taught me to organise different inputs into something a team could make a decision with.', object: 'The project folder', project: 'michelin' },
  { title: 'A beginner, all over again.', text: 'Now at TikTok, I’m learning how data, quality and everyday operations support products people use.', object: 'The laptop', project: null },
];

export function JourneyPage({ chapter, paused, onChange }: { chapter: number; paused: boolean; onChange: (n: number) => void }) {
  const selected = chapter;
  const strip = useRef<HTMLElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const story = selected >= 0 ? journeyStories[selected] : null;
  const lesson = selected >= 0 ? lessons[selected] : null;
  useEffect(() => {
    if (selected < 0) return;
    const nav = strip.current, button = buttons.current[selected];
    if (!nav || !button || nav.scrollWidth <= nav.clientWidth + 4) return;
    const left = button.offsetLeft - (nav.clientWidth - button.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: paused ? 'instant' : 'smooth' });
  }, [selected, paused]);
  return <section className="j-page" aria-labelledby="journey-title">
    <header className="j-opening"><div><p className="j-eyebrow">My path · A work in progress</p><h1 id="journey-title">Still curious.<br /><em>Still growing.</em></h1></div><p>Five chapters, a few lessons,<br /> and plenty still to learn.<span>Pick an object. There’s a story behind it.</span></p></header>
    <div className="j-workspace">
      <Suspense fallback={<div className="j-scene-loading" role="status">Making room for the next chapter…</div>}><JourneyDesk selected={selected} paused={paused} onSelect={onChange} /></Suspense>
      <aside className="j-story" aria-label="Selected journey chapter">
        <span className="j-announcement" role="status" aria-live="polite" aria-atomic="true">{story && lesson ? `${story.company}. ${lesson.title}` : 'Journey overview. Choose an object or a chapter to explore.'}</span>
        {story && lesson ? <div className="j-story-content" key={selected}>
          <p className="j-story-kicker">{lesson.object} <span>{story.date}</span></p>
          <div><p className="j-company">{story.company}</p><h2>{lesson.title}</h2><p className="j-story-summary">{lesson.text}</p></div>
          <p className="j-role">{story.role}</p>
          <p className="j-story-turn">{story.title} <em>{story.turn}</em></p>
          <figure><img src={story.image} alt={story.alt} /><figcaption>{story.company} · {story.year}</figcaption></figure>
          <details className="j-reflection"><summary>A little more of the story <span>+</span></summary><p>{story.body}</p><p>{story.insight}</p><p className="j-carry">{story.carry}</p><a href={story.source} target="_blank" rel="noreferrer">Read the original reflection ↗</a></details>
          {lesson.project && <a className="j-project-link" href={`#/work/${lesson.project}`}>See the work behind it <span>↗</span></a>}
          <div className="j-story-navigation"><button onClick={() => onChange((selected + 4) % 5)} aria-label="Previous chapter">←</button><span>{selected + 1} of 5 chapters</span><button onClick={() => onChange((selected + 1) % 5)} aria-label="Next chapter">→</button></div>
        </div> : <div className="j-overview"><p className="j-story-kicker">Different chapters. Same curious me.</p><h2>Growing into<br />my own.</h2><p>From student clubs to a new role at TikTok, I’m learning by showing up, asking questions and trying again.</p><figure><img src="/assets/mai-portrait.webp" alt="Mai at RMIT University Vietnam" /><figcaption>Ngoc Mai Nguyen · RMIT Business</figcaption></figure><button className="j-start" onClick={() => onChange(0)}>Start with the notebook <span>↗</span></button></div>}
      </aside>
      <nav className="j-chapters" ref={strip} aria-label="Journey chapters">{journeyStories.map((item, index) => <button key={item.company} ref={node => { buttons.current[index] = node; }} aria-pressed={selected === index} onClick={() => onChange(index)} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (index + (event.key === 'ArrowRight' ? 1 : 4)) % 5;
        buttons.current[next]?.focus(); onChange(next);
      }}><span className="j-chapter-year">{item.year}</span><span className="j-chapter-name">{item.company}</span><span className="j-chapter-lesson">{['Learning to lead', 'Seeing the whole picture', 'Finding my voice', 'Building clarity', 'Always Day 1'][index]}</span></button>)}</nav>
    </div>
    <footer className="j-footer"><p>Not a finished story.<br /><span>Just a good place to begin the next chapter.</span></p><a href="#/hello">Say hello ↗</a></footer>
  </section>;
}
