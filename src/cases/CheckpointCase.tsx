import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, MouseEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Study } from '../stories';
import { RESPONDENT_METRICS, SCHEDULE_MODES, WORKSHOP_CHAPTERS } from './checkpoint/checkpointData';
import type { ScheduleModeId } from './checkpoint/checkpointData';
import './CheckpointCase.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Photo = { image: string; alt: string; caption: string };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function CheckpointCase({ study, paused }: { study: Study; paused: boolean }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spread = useRef<HTMLDivElement>(null);
  const calendar = useRef<SVGSVGElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef({ id: -1, x: 0, y: 0, dx: 0, locked: false });
  const dragFrame = useRef(0);
  const lastDrag = useRef(-1000);
  const progressId = useId();
  const [chapter, setChapter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activity, setActivity] = useState(0);
  const [schedule, setSchedule] = useState<ScheduleModeId>('focused');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const current = WORKSHOP_CHAPTERS[chapter];
  const decision = study.decisions[chapter];
  const plan = SCHEDULE_MODES[schedule];
  const reduced = () => paused || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const select = (index: number, focus = false) => {
    const next = (index + WORKSHOP_CHAPTERS.length) % WORKSHOP_CHAPTERS.length;
    setChapter(next);
    setProgress(next * 50);
    setActivity(0);
    if (focus) tabs.current[next]?.focus();
  };
  const keys = (event: KeyboardEvent<HTMLElement>, index = chapter) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? 2 : index + (event.key === 'ArrowRight' ? 1 : -1), true);
  };

  useEffect(() => () => cancelAnimationFrame(dragFrame.current), []);
  useEffect(() => {
    const element = dialog.current;
    if (photo && element && !element.open) element.showModal();
    if (!photo && element?.open) element.close();
  }, [photo]);

  useGSAP(() => {
    if (paused) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.cp-masthead > *', { y: 15, opacity: 0, duration: .65, stagger: .07, ease: 'power3.out' });
      gsap.from('.cp-book-stage', { y: 28, rotationX: 4, opacity: 0, duration: .8, delay: .1, ease: 'power3.out' });
      gsap.from('.cp-making-copy > *', { y: 22, opacity: 0, duration: .65, stagger: .08,
        scrollTrigger: { trigger: '.cp-making', start: 'top 85%', once: true } });
      gsap.from('.cp-survey-stat', { y: 20, opacity: 0, duration: .6, stagger: .08,
        scrollTrigger: { trigger: '.cp-survey', start: 'top 85%', once: true } });
      gsap.fromTo('.cp-recap-sheet', { rotationZ: 3, y: 32 }, { rotationZ: -2, y: -8, ease: 'none',
        scrollTrigger: { trigger: '.cp-survey', start: 'top bottom', end: 'bottom top', scrub: .7 } });
    });
    media.add('(min-width: 960px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const element = stage.current;
      if (!element) return;
      const x = gsap.quickTo(element, '--look-x', { duration: .5, ease: 'power3.out' });
      const y = gsap.quickTo(element, '--look-y', { duration: .5, ease: 'power3.out' });
      const move = (event: globalThis.PointerEvent) => {
        if (event.pointerType !== 'mouse' || event.buttons) return;
        const box = element.getBoundingClientRect();
        x(((event.clientX - box.left) / box.width - .5) * 3);
        y(((event.clientY - box.top) / box.height - .5) * -2);
      };
      const leave = () => { x(0); y(0); };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', leave);
      return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); };
    });
    let alive = true;
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; media.revert(); };
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  useGSAP(() => {
    if (reduced() || !spread.current) return;
    const leaf = spread.current.querySelector('.cp-turning-leaf');
    const content = spread.current.querySelectorAll('.cp-page-content');
    const timeline = gsap.timeline();
    timeline.fromTo(leaf, { rotationY: -18, opacity: .55 }, { rotationY: -150, opacity: 0, duration: .48, ease: 'power3.out' }, 0);
    timeline.fromTo(content, { y: 9, opacity: .25 }, { y: 0, opacity: 1, duration: .32, stagger: .035, ease: 'power2.out' }, .06);
  }, { scope: root, dependencies: [chapter, paused], revertOnUpdate: true });

  useGSAP(() => {
    const nodes = calendar.current?.querySelectorAll('.cp-calendar-note');
    if (!nodes) return;
    const offsets = schedule === 'focused' ? [80, 0, -80] : [0, 0, 0];
    if (reduced()) gsap.set(nodes, { x: index => offsets[index] });
    else gsap.to(nodes, { x: index => offsets[index], duration: .42, ease: 'power3.out', stagger: .025 });
  }, { scope: root, dependencies: [schedule, paused], revertOnUpdate: true });

  const finishDrag = (event: PointerEvent<HTMLDivElement>, commit: boolean) => {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    cancelAnimationFrame(dragFrame.current);
    dragFrame.current = 0;
    stage.current?.style.setProperty('--drag-x', '0px');
    if (stage.current) stage.current.dataset.dragging = 'false';
    drag.current = { id: -1, x: 0, y: 0, dx: 0, locked: false };
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (state.locked) {
      lastDrag.current = performance.now();
      if (commit && Math.abs(state.dx) > 42) select(chapter + (state.dx < 0 ? 1 : -1));
    }
  };
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (event.button !== 0 || !event.isPrimary || (target.closest('button,a,input') && !target.closest('.cp-book-photo'))) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, locked: false };
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    state.dx = event.clientX - state.x;
    if (!state.locked && Math.abs(state.dx) > 10 && Math.abs(state.dx) > Math.abs(event.clientY - state.y) * 1.25) {
      state.locked = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = 'true';
    }
    if (!state.locked || dragFrame.current) return;
    dragFrame.current = requestAnimationFrame(() => {
      dragFrame.current = 0;
      stage.current?.style.setProperty('--drag-x', clamp(drag.current.dx, -100, 100) + 'px');
    });
  };
  const clickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (performance.now() - lastDrag.current < 250) { event.preventDefault(); event.stopPropagation(); }
  };

  return <article className="case-checkpoint" data-chapter={current.id} data-motion={paused ? 'paused' : 'active'} ref={root} aria-labelledby="checkpoint-title">
    <header className="cp-masthead">
      <div className="cp-title-block"><p className="cp-kicker">{study.company} <span>{study.date}</span></p><h1 id="checkpoint-title">Career Checkpoint</h1><p className="cp-deck">One idea. Three ways forward.</p></div>
      <dl className="cp-opening-results"><div><dt>students reached</dt><dd>160</dd></div><div><dt>connected workshops</dt><dd>3</dd></div><div><dt>respondents confident using tools</dt><dd>88<span>%</span></dd></div></dl>
      <p className="cp-role"><span>My part</span> Concept, workshop journey &amp; on-ground operations</p>
    </header>

    <section className="cp-booklet-section" id="cp-workshop-booklet" aria-label="Discover, Apply and Connect workshop journey">
      <div className="cp-book-stage" ref={stage} data-dragging="false" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={event => finishDrag(event, true)} onPointerCancel={event => finishDrag(event, false)} onLostPointerCapture={event => { if (event.target === event.currentTarget) finishDrag(event, false); }} onClickCapture={clickCapture}>
        <nav className="cp-bookmarks" aria-label="Workshop chapters">{WORKSHOP_CHAPTERS.map((item, index) => <button type="button" key={item.id} ref={node => { tabs.current[index] = node; }} aria-pressed={chapter === index} aria-controls="cp-selected-spread" onClick={() => select(index)} onKeyDown={event => keys(event, index)}><span>{index + 1}</span>{item.phase}</button>)}</nav>
        <div className="cp-book" id="cp-selected-spread" ref={spread} role="group" aria-label={current.phase + ' workshop spread'} tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget) keys(event); }}>
          <div className="cp-book-underlay" aria-hidden="true" />
          <div className="cp-turning-leaf" aria-hidden="true" />
          <div className="cp-left-page">
            <div className="cp-page-content" key={current.id + '-copy'}>
              <p className="cp-page-number">Workshop {chapter + 1} <span>90-minute format</span></p>
              <h2>{current.labTitle}</h2>
              <p className="cp-decision-action">{decision.action}</p>
              <div className="cp-activity-list" aria-label={current.phase + ' activities'}>{current.activities.map((item, index) => <button type="button" key={item.name} aria-pressed={activity === index} onClick={() => setActivity(index)}>{item.name}</button>)}</div>
              <p className="cp-activity-detail" aria-live="polite">{current.activities[activity]?.detail ?? current.activities[0].detail}</p>
              <details className="cp-why"><summary>Why this choice <span aria-hidden="true">+</span></summary><p>{decision.why}</p></details>
            </div>
          </div>
          <div className="cp-right-page">
            <figure className="cp-page-content" key={current.id + '-photo'}>
              <button type="button" className="cp-book-photo" onClick={() => setPhoto({ image: current.evidenceImage, alt: current.evidenceAlt, caption: current.evidenceCaption })} aria-label={'Enlarge ' + current.phase + ' recap slide'}><img src={current.evidenceImage} alt={current.evidenceAlt} draggable={false} fetchPriority="high" /><span>View original slide <span aria-hidden="true">↗</span></span></button>
              <figcaption>{current.evidenceCaption}</figcaption>
            </figure>
          </div>
          <div className="cp-book-footer"><span aria-live="polite">{current.phase} <small>{chapter + 1} / 3</small></span><div><button type="button" aria-label="Previous workshop" onClick={() => select(chapter - 1)}>←</button><button type="button" aria-label="Next workshop" onClick={() => select(chapter + 1)}>→</button></div></div>
        </div>
        <div className="cp-scrub"><label className="cp-sr-only" htmlFor={progressId}>Browse workshop journey</label><span aria-hidden="true">Discover</span><input id={progressId} type="range" min="0" max="100" step="1" value={progress} aria-valuetext={current.phase + ', workshop ' + (chapter + 1) + ' of 3'} onChange={event => { const next = Number(event.target.value); setProgress(next); const nextChapter = next < 33.5 ? 0 : next < 66.5 ? 1 : 2; if (chapter !== nextChapter) { setChapter(nextChapter); setActivity(0); } }} /><span aria-hidden="true">Connect</span></div>
      </div>
    </section>

    <section className="cp-making" aria-labelledby="cp-making-title">
      <div><p className="cp-kicker">The starting point</p><h2 id="cp-making-title">Practical support starts with listening.</h2><p className="cp-question">{study.question}</p></div>
      <div className="cp-making-copy"><p>{study.intro}</p><p>I developed the concept from that student insight, designed a connected <strong>Discover → Apply → Connect</strong> journey, and supported delivery on the ground. The recap documents eight-plus activities across the three workshops.</p><p>Each workshop had a different job: exploration, application, then conversation. The booklet above connects those activities with the choices behind them.</p></div>
    </section>

    <section className="cp-schedule-section" id="cp-schedule-lab" aria-labelledby="cp-schedule-title">
      <div className="cp-schedule-top"><div><p className="cp-kicker">Adapting the plan</p><h2 id="cp-schedule-title">Keep the purpose.<br />Change the rhythm.</h2></div><div className="cp-schedule-controls" role="group" aria-label="Compare workshop schedules">{(['weekly', 'focused'] as const).map(mode => <button key={mode} type="button" aria-pressed={schedule === mode} onClick={() => setSchedule(mode)}>{SCHEDULE_MODES[mode].label}</button>)}</div></div>
      <div className="cp-calendar-wrap"><svg viewBox="0 0 1000 170" ref={calendar} aria-label={plan.title} role="img"><path className="cp-calendar-line" d="M130 78H870" />{WORKSHOP_CHAPTERS.map((item, index) => <g key={item.id} transform={'translate(' + (166 + index * 334) + ' 0)'}><g className="cp-calendar-note"><rect x="-108" y="24" width="216" height="116" rx="8" /><path d="M-108 52H108" /><circle cy="24" r="4" /><text className="cp-calendar-slot" x="0" y="44" textAnchor="middle">{plan.slots[index]}</text><text className="cp-calendar-title" x="0" y="91" textAnchor="middle">{item.phase}</text><text className="cp-calendar-number" x="0" y="118" textAnchor="middle">Workshop {index + 1}</text></g></g>)}</svg><ol className="cp-calendar-mobile">{WORKSHOP_CHAPTERS.map((item, index) => <li key={item.id}><strong>{item.phase}</strong><span>{plan.slots[index]}</span></li>)}</ol></div>
      <div className="cp-schedule-caption" aria-live="polite"><h3>{plan.title}</h3><p>{plan.summary}</p></div>
    </section>

    <section className="cp-survey" aria-labelledby="cp-survey-title">
      <div className="cp-survey-copy"><p className="cp-kicker">After the workshops</p><h2 id="cp-survey-title">Confidence,<br />after practice.</h2><dl className="cp-survey-numbers">{RESPONDENT_METRICS.map((metric, index) => <div key={metric.value} className={'cp-survey-stat ' + (index === 0 ? 'is-primary' : '')}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl><p className="cp-survey-note">Feedback from post-workshop survey respondents, as reported in the series recap.</p></div>
      <figure className="cp-recap-sheet"><button type="button" onClick={() => setPhoto({ image: '/assets/checkpoint-team.webp', alt: 'Career Checkpoint series recap with participant feedback', caption: 'The published recap records 91%, 88%, 86% and 84% responses to different post-workshop survey questions.' })} aria-label="Enlarge participant feedback recap"><img src="/assets/checkpoint-team.webp" alt="Participant moments with the four survey response figures in the published recap" loading="lazy" /><span>Read the recap <span aria-hidden="true">↗</span></span></button><figcaption>Student participation and feedback, documented in Mai’s original recap.</figcaption></figure>
    </section>

    <footer className="cp-outcome"><div><p className="cp-kicker">What I contributed</p><h2>An idea students could act on.</h2><p>{study.outcome}</p><p className="cp-learning">{study.lesson}</p></div><aside><p className="cp-kicker">Beyond this series</p><p>After four applications, I joined RMIT Careers as a Career Ready Assistant. Across that wider role, I supported <strong>370+ students</strong> with internships, CVs, cover letters and interview preparation.</p><a className="cp-source" href={study.source} target="_blank" rel="noreferrer">Read my original reflection <span aria-hidden="true">↗</span></a></aside></footer>

    <dialog ref={dialog} className="cp-lightbox-dialog" aria-label="Enlarged Career Checkpoint recap" onCancel={() => setPhoto(null)} onClose={() => setPhoto(null)} onClick={event => { if (event.target === event.currentTarget) setPhoto(null); }}>{photo && <div><button type="button" className="cp-lightbox-close" autoFocus onClick={() => setPhoto(null)} aria-label="Close enlarged photograph">Close ×</button><img src={photo.image} alt={photo.alt} /><p>{photo.caption}</p></div>}</dialog>
  </article>;
}
