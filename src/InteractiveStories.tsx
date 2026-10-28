import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { studies } from './stories';
import { workVisuals } from './workVisuals';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const work = [
  { id: 'council', label: 'Club Day', title: 'A campus brought together.', text: 'Budgets, sponsors and the people behind Club Day.', metrics: [['500M+', 'VND annual council budget'], ['2,500+', 'Club Day S3/2025 participants']] },
  { id: 'michelin', label: 'Michelin', title: 'Many inputs. A clearer decision.', text: 'Organising proposals for a solar energy rollout.', metrics: [['12+', 'vendors coordinated'], ['15+', 'proposals evaluated']] },
  { id: 'checkpoint', label: 'Career Checkpoint', title: 'An idea students could act on.', text: 'Three workshops: Discover, Apply, Connect.', metrics: [['160', 'students reached'], ['3', 'hands-on workshops']] },
  { id: 'careers-fair', label: 'Careers Fair', title: 'One conversation at a time.', text: 'Practical guidance at the RMIT Career Booth.', metrics: [['300+', 'students I engaged with'], ['53', 'companies at the whole event']] },
  { id: 'ctm', label: 'CTM', title: 'Beyond the first click.', text: 'Connecting campaigns, webinars and customer follow-up.', metrics: [['15%+', 'monthly revenue contribution share'], ['5+', 'webinars each month']] },
];

const moments = [
  { label: 'Meet Mai', image: '/assets/mai-portrait.webp', alt: 'Ngoc Mai Nguyen at RMIT University Vietnam', title: 'Finance major. Curious mind.', note: 'RMIT Business · Finance major · Digital Marketing minor', link: '#/notes', action: 'A little more about me', position: '50% 43%' },
  { label: 'People', image: '/assets/mai-networking.webp', alt: 'Mai speaking with an industry representative', title: 'It starts with listening.', note: '300+ student conversations at the RMIT Careers Fair booth.', link: '#/work/careers-fair', action: 'The story behind the photo', position: '30% center' },
  { label: 'Leadership', image: '/assets/award-portrait.webp', alt: 'Mai at the RMIT Student Leadership Recognition Awards', title: 'Growing into responsibility.', note: 'RMIT Impactful Leaders Award · 2026', link: '#/work/council', action: 'Inside my council work', position: '50% 35%' },
  { label: 'Day 1', image: '/assets/tiktok-mai.webp', alt: 'Mai at TikTok', title: 'Still learning. Always Day 1.', note: 'AI Data Service & Operations Intern · TikTok', link: '#/journey/4', action: 'My current chapter', position: 'center' },
];

function Arrow({ direction = 'up' }: { direction?: 'up' | 'left' | 'right' }) {
  return <svg className={`ix-arrow ix-arrow-${direction}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// Horizontal gestures coexist with native vertical scrolling and regular clicks.
function useDragRail(onStep: (direction: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ id: -1, x: 0, y: 0, dx: 0, locked: false });
  const frame = useRef(0);
  const lastDrag = useRef(-1000);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const reset = (event: ReactPointerEvent<HTMLDivElement>, commit: boolean) => {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    ref.current?.style.setProperty('--drag', '0px');
    if (ref.current) ref.current.dataset.dragging = 'false';
    drag.current = { id: -1, x: 0, y: 0, dx: 0, locked: false };
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (state.locked) {
      lastDrag.current = performance.now();
      if (commit && Math.abs(state.dx) > 45) onStep(state.dx < 0 ? 1 : -1);
    }
  };
  return { ref, handlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => { if (event.button !== 0 || !event.isPrimary) return; drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, locked: false }; },
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = drag.current;
      if (state.id !== event.pointerId) return;
      state.dx = event.clientX - state.x;
      if (!state.locked && Math.abs(state.dx) > 9 && Math.abs(state.dx) > Math.abs(event.clientY - state.y) * 1.25) {
        state.locked = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.dragging = 'true';
      }
      if (!state.locked) return;
      if (!frame.current) frame.current = requestAnimationFrame(() => { frame.current = 0; ref.current?.style.setProperty('--drag', `${Math.max(-180, Math.min(180, drag.current.dx))}px`); });
    },
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => reset(event, true),
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => reset(event, false),
    // Touch starts with implicit capture on the photo button. Its transfer to the rail
    // must not cancel the new drag when the child loses capture.
    onLostPointerCapture: (event: ReactPointerEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) reset(event, false); },
    onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => { if (performance.now() - lastDrag.current < 250) { event.preventDefault(); event.stopPropagation(); } },
  } };
}

export function ProjectShowcase() {
  const [active, setActive] = useState(0);
  const change = (step: number) => setActive(index => (index + step + work.length) % work.length);
  const gesture = useDragRail(change);
  return <section className="ix-work" id="selected-work" aria-labelledby="selected-title">
    <div className="ix-section-heading"><h2 id="selected-title">Work, in practice.</h2><a className="m-text-link" href="#/work">All project stories <Arrow /></a></div>
    <div className="ix-work-tabs" role="group" aria-label="Choose a project">{work.map((item, index) => <button key={item.id} aria-pressed={index === active} onClick={() => setActive(index)}><span>{item.label}</span><Arrow /></button>)}</div>
    <div className="ix-exhibit" data-project={work[active].id}>
      <div className="ix-work-visual" ref={gesture.ref} {...gesture.handlers} role="region" aria-roledescription="carousel" aria-label="Project photographs. Drag or use the arrow keys to explore." tabIndex={0} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); change(event.key === 'ArrowRight' ? 1 : -1); } }}>
        {work.map((item, index) => { const study = studies.find(project => project.id === item.id)!; return <div key={item.id} className={`ix-work-photo ${index === active ? 'is-active' : ''}`} aria-hidden={index !== active}><img draggable="false" src={item.id === 'council' ? '/assets/clubday-portrait.webp' : workVisuals[item.id].cover} alt={index === active ? study.alt : ''} loading="lazy" /></div>; })}
        <div className="ix-drag-label" aria-hidden="true"><span>↔</span> Drag to explore</div>
        <div className="ix-photo-count" aria-hidden="true">0{active + 1}<span> / 05</span></div>
      </div>
      <div className="ix-work-details">
        {work.map((item, index) => { const study = studies.find(project => project.id === item.id)!; return <article key={item.id} className={`ix-project-detail ${index === active ? 'is-active' : ''}`} aria-hidden={index !== active} inert={index !== active}>
          <p className="ix-company">{study.company}</p><h3>{item.title}</h3><p className="ix-project-summary">{item.text}</p>
          <dl>{item.metrics.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <a href={`#/work/${item.id}`} className="m-text-link">Inside the project <Arrow /></a>
        </article>; })}
        <div className="ix-work-controls"><p aria-live="polite" aria-atomic="true">{work[active].label}<span> · {active + 1} of {work.length}</span></p><div className="ix-arrows"><button onClick={() => change(-1)} aria-label="Previous project"><Arrow direction="left" /></button><button onClick={() => change(1)} aria-label="Next project"><Arrow direction="right" /></button></div></div>
      </div>
    </div>
  </section>;
}

export function AboutPlayground({ paused }: { paused: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const change = (step: number) => setActive(index => (index + step + moments.length) % moments.length);
  const gesture = useDragRail(change);
  useGSAP(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const stage = root.current!.querySelector<HTMLElement>('.ix-photo-stage')!;
    gsap.from('.ix-about-heading', { y: 30, opacity: 0, duration: .5, scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
    gsap.from('.ix-photo-float', { y: 55, rotation: -6, scale: .88, opacity: 0, duration: .65, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: stage, start: 'top 85%', once: true } });
    const life = gsap.to('.ix-photo-life', { y: -9, rotation: 1.3, duration: 3.5, ease: 'sine.inOut', stagger: .45, repeat: -1, yoyo: true, paused: true });
    let visible = false;
    const sync = () => { const playing = visible && !document.hidden; stage.dataset.ambient = playing ? 'on' : 'off'; if (playing) life.play(); else life.pause(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(stage);
    document.addEventListener('visibilitychange', sync);
    const moveX = gsap.quickTo(stage, '--look-x', { duration: .55, ease: 'power3.out' });
    const moveY = gsap.quickTo(stage, '--look-y', { duration: .55, ease: 'power3.out' });
    const move = (event: PointerEvent) => { if (event.pointerType !== 'mouse' || event.buttons) return; const box = stage.getBoundingClientRect(); moveX(((event.clientX - box.left) / box.width - .5) * 16); moveY(((event.clientY - box.top) / box.height - .5) * 10); };
    const leave = () => { moveX(0); moveY(0); };
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerleave', leave);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); stage.dataset.ambient = 'off'; };
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  return <section className="ix-about" ref={root} aria-labelledby="about-title">
    <div className="ix-connection" aria-hidden="true"><svg viewBox="0 0 1200 100" preserveAspectRatio="none"><path d="M0 5H370C490 5 470 85 600 85S730 5 850 5H1200" /></svg><span /></div>
    <div className="ix-about-heading"><div><p>Behind the work</p><h2 id="about-title">A few sides of Mai.</h2></div><span className="ix-play-hint"><span aria-hidden="true">↔</span> Drag or tap to explore.</span></div>
    <div className="ix-moment-tabs" role="group" aria-label="Choose a side of Mai">{moments.map((moment, index) => <button key={moment.label} aria-pressed={active === index} onClick={() => setActive(index)}>{moment.label}</button>)}</div>
    <div className="ix-photo-stage" ref={gesture.ref} {...gesture.handlers} data-ambient="off" role="region" aria-roledescription="carousel" aria-label="A few sides of Mai. Drag photographs or use arrow keys." tabIndex={0} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); change(event.key === 'ArrowRight' ? 1 : -1); } }}>
      <div className="ix-stage-word" aria-hidden="true">{moments[active].label === 'Meet Mai' ? 'hello.' : moments[active].label.toLowerCase() + '.'}</div>
      <div className="ix-stage-orbit" aria-hidden="true" />
      {moments.map((moment, index) => { const slot = ((index - active + 6) % 4) - 2; return <div className={`ix-photo-slot ${slot === 0 ? 'is-active' : ''}`} key={moment.image} style={{ '--slot': slot, '--depth': Math.abs(slot), zIndex: 5 - Math.abs(slot) } as CSSProperties}>
        <div className="ix-photo-float"><div className="ix-photo-life"><button className="ix-moment-photo" aria-label={`Show ${moment.label}`} aria-pressed={active === index} tabIndex={Math.abs(slot) > 1 ? -1 : 0} onClick={() => setActive(index)}>
          <img draggable="false" src={moment.image} alt={moment.alt} loading="lazy" style={{ objectPosition: moment.position }} /><span>{moment.label}<span aria-hidden="true">↗</span></span>
        </button></div></div>
      </div>; })}
    </div>
    <div className="ix-moment-caption"><div className="ix-arrows"><button onClick={() => change(-1)} aria-label="Previous moment"><Arrow direction="left" /></button><button onClick={() => change(1)} aria-label="Next moment"><Arrow direction="right" /></button></div><div className="ix-moment-copy" aria-live="polite" aria-atomic="true"><h3>{moments[active].title}</h3><p>{moments[active].note}</p></div><a className="m-text-link" href={moments[active].link}>{moments[active].action}<Arrow /></a></div>
  </section>;
}
