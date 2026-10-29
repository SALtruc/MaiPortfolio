import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Study } from '../stories';
import { awardSource } from '../stories';
import { CLUB_POINTS, COUNCIL_LENSES, EVIDENCE_SEQUENCE } from './council/clubConstellationData';
import type { HubId } from './council/clubConstellationData';
import './CouncilCase.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Photograph = { image: string; alt: string; caption: string };

export default function CouncilCase({ study, paused }: { study: Study; paused: boolean }) {
  const root = useRef<HTMLElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState<HubId>('deliver');
  const [evidence, setEvidence] = useState(0);
  const [enlarged, setEnlarged] = useState<Photograph | null>(null);
  const clipId = useId();
  const lens = COUNCIL_LENSES.find(item => item.id === selected)!;
  const decision = study.decisions[lens.index];
  const photograph = EVIDENCE_SEQUENCE[evidence];

  useEffect(() => {
    if (enlarged && !dialog.current?.open) dialog.current?.showModal();
    else if (!enlarged && dialog.current?.open) dialog.current.close();
  }, [enlarged]);

  useGSAP(() => {
    if (paused) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const opening = gsap.timeline({ defaults: { ease: 'power3.out' } });
      opening.from('.council-masthead > *', { y: 18, opacity: 0, duration: .65, stagger: .08 })
        .from('.council-poster', { y: 24, scale: .98, opacity: 0, duration: .7 }, '-=.35')
        .from('.council-club-point', { scale: .4, opacity: 0, transformOrigin: '50% 50%', duration: .4, stagger: .012 }, '-=.35');
      gsap.from('.council-work-item', {
        y: 24, opacity: 0, duration: .6, stagger: .12,
        scrollTrigger: { trigger: '.council-work-record', start: 'top 85%', once: true },
      });
      gsap.from('.council-evidence-view', {
        y: 28, scale: .97, opacity: 0, duration: .75,
        scrollTrigger: { trigger: '.council-evidence', start: 'top 80%', once: true },
      });
    });
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const element = poster.current;
      if (!element) return;
      const tiltX = gsap.quickTo(element, 'rotationX', { duration: .55, ease: 'power3.out' });
      const tiltY = gsap.quickTo(element, 'rotationY', { duration: .55, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        const bounds = element.getBoundingClientRect();
        tiltX(-((event.clientY - bounds.top) / bounds.height - .5) * 3);
        tiltY(((event.clientX - bounds.left) / bounds.width - .5) * 3);
      };
      const reset = () => { tiltX(0); tiltY(0); };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', reset);
      return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', reset); };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  useGSAP(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo('.council-link', { strokeDasharray: 700, strokeDashoffset: 700 }, {
      strokeDashoffset: 0, duration: .75, stagger: .006, ease: 'power2.out', overwrite: 'auto',
    });
    gsap.fromTo('.council-selected-story', { y: 8, opacity: .4 }, {
      y: 0, opacity: 1, duration: .28, ease: 'power2.out', overwrite: 'auto',
    });
  }, { scope: root, dependencies: [selected, paused], revertOnUpdate: true });

  const choose = (index: number, focus = false) => {
    setSelected(COUNCIL_LENSES[index].id);
    if (focus) tabs.current[index]?.focus();
  };

  return <article ref={root} className={`case-council is-${selected}`} aria-labelledby="council-case-title" data-motion={paused ? 'paused' : 'active'}>
    <header className="council-masthead">
      <p className="council-eyebrow">RMIT Student Council · {study.date}</p>
      <h1 id="council-case-title">Club Day &amp; community.</h1>
      <div className="council-masthead-bottom"><p>The event is one day. The work starts much earlier.</p><span>{study.role}</span></div>
    </header>

    <section className="council-opening" aria-label="Explore the work behind Club Day">
      <div className="council-poster-perspective">
        <div ref={poster} className="council-poster">
          <div className="council-poster-top"><span>Beyond the R-CADE</span><span>Club Day · S3/2025</span></div>
          <div className="council-lenses" role="tablist" aria-label="Mai’s council responsibilities">
            {COUNCIL_LENSES.map((item, index) => <button type="button" role="tab" key={item.id}
              ref={node => { tabs.current[index] = node; }} id={`council-lens-${item.id}`}
              aria-selected={selected === item.id} aria-controls="council-story" tabIndex={selected === item.id ? 0 : -1}
              onClick={() => choose(index)} onKeyDown={event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                choose(event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3, true);
              }}><span className="council-lens-dot" aria-hidden="true" />{item.label}</button>)}
          </div>
          <svg className="council-constellation" viewBox="0 0 1000 540" role="img" aria-labelledby="council-graph-title council-graph-description">
            <title id="council-graph-title">43 clubs, connected through council work</title>
            <desc id="council-graph-description">Each point represents one of the 43 participating clubs. The connections illustrate the selected council responsibility, rather than an actual floorplan or individual club record.</desc>
            <defs><clipPath id={clipId}><rect x="278" y="96" width="444" height="270" rx="14" /></clipPath></defs>
            <ellipse className="council-orbit" cx="500" cy="245" rx="430" ry="210" />
            <g aria-hidden="true">{CLUB_POINTS.map(point => <path className="council-link" key={point.id}
              d={`M${point.x},${point.y} Q500,230 ${lens.x},${lens.y}`} />)}</g>
            <rect className="council-photo-mount" x="266" y="84" width="468" height="294" rx="20" />
            <image href={lens.image} x="278" y="96" width="444" height="270" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`} />
            <g aria-hidden="true">{CLUB_POINTS.map(point => <g className="council-club-point" key={point.id}>
              <circle className="council-point-halo" cx={point.x} cy={point.y} r="11" />
              <circle className="council-point-core" cx={point.x} cy={point.y} r="5" />
            </g>)}</g>
            {COUNCIL_LENSES.map(item => <g className={`council-anchor ${selected === item.id ? 'is-selected' : ''}`} key={item.id} aria-hidden="true">
              <circle cx={item.x} cy={item.y} r={selected === item.id ? 22 : 14} />
              <text x={item.x} y={item.y + 39} textAnchor="middle">{item.label}</text>
            </g>)}
          </svg>
          <div className="council-poster-caption"><span>43 points for 43 participating clubs.</span><button type="button" onClick={() => setEnlarged({ image: lens.image, alt: lens.alt, caption: lens.caption })}>View photograph <span aria-hidden="true">↗</span></button></div>
        </div>
      </div>

      <div className="council-story-column">
        <div className="council-selected-story" id="council-story" role="tabpanel" aria-labelledby={`council-lens-${selected}`}>
          <p className="council-story-label">My part · {lens.label}</p>
          <p className="council-selected-metric"><strong>{lens.metric}</strong><span>{lens.metricLabel}</span></p>
          <h2>{decision.title}</h2><p>{decision.action}</p>
          <details><summary>What I learned <span aria-hidden="true">+</span></summary><p>{decision.why}</p></details>
        </div>
        <p className="council-story-announcement" role="status" aria-live="polite">{lens.label}: {decision.title}</p>
        <div className="council-event-total"><strong>43</strong><div><span>clubs at Club Day S3/2025</span><p>Working with the project leader, delivery team and university staff.</p></div></div>
      </div>
    </section>

    <dl className="council-scale-strip" aria-label="Event outcomes and council responsibility">
      <div><dt>Clubs at Club Day S3/2025</dt><dd>43</dd></div>
      <div><dt>Participants at that event</dt><dd>2,500+</dd></div>
      <div><dt>VND annual council budget</dt><dd>500M+</dd></div>
    </dl>

    <section className="council-work-record" aria-labelledby="council-work-title">
      <div className="council-work-intro"><p className="council-eyebrow">Before the day</p><h2 id="council-work-title">Supporting the people<br />behind the event.</h2><p>{study.question}</p>
        <div className="council-responsibility-ledger"><div><strong>20+</strong><span>sponsors coordinated</span></div><div><strong>30+</strong><span>stakeholders across the wider council role</span></div><div><strong>15+</strong><span>monthly budgets and reimbursements processed</span></div></div>
      </div>
      <div className="council-work-items">{study.decisions.map((item, index) => <div className="council-work-item" key={item.title}>
        <span className="council-work-marker" aria-hidden="true">{COUNCIL_LENSES[index].label}</span><h3>{item.title}</h3><p>{item.action}</p><p className="council-work-why">{item.why}</p>
      </div>)}</div>
    </section>

    <section className="council-evidence" aria-labelledby="council-evidence-title">
      <div className="council-evidence-heading"><div><p className="council-eyebrow">The people in the story</p><h2 id="council-evidence-title">Around the table.<br />Out on campus.</h2></div><p>Real moments from council work and Club Day.</p></div>
      <div className="council-evidence-layout">
        <figure className="council-evidence-view"><button type="button" onClick={() => setEnlarged(photograph)} aria-label={`Enlarge: ${photograph.alt}`}><img src={photograph.image} alt={photograph.alt} loading="lazy" /><span>View photograph ↗</span></button><figcaption>{photograph.caption}</figcaption></figure>
        <div className="council-filmstrip" role="group" aria-label="Choose a council photograph">{EVIDENCE_SEQUENCE.map((item, index) => <button type="button" key={item.image} aria-pressed={evidence === index} onClick={() => setEvidence(index)}><img src={item.image} alt="" loading="lazy" /><span>{item.title}</span><span aria-hidden="true">↗</span></button>)}</div>
      </div>
    </section>

    <footer className="council-reflection"><div><p className="council-eyebrow">A result built together</p><h2>One day on campus.<br />Three semesters of learning.</h2><p>{study.outcome}</p></div><div className="council-takeaway"><p>{study.lesson}</p><p className="council-recognition">The wider council journey contributed to RMIT’s 2026 Impactful Leaders Award.</p><div className="council-source-links"><a href={study.source} target="_blank" rel="noreferrer">Original council reflection ↗</a><a href={awardSource} target="_blank" rel="noreferrer">Leadership recognition ↗</a></div></div></footer>

    <dialog ref={dialog} className="council-photo-dialog" aria-label="Enlarged council photograph" onCancel={() => setEnlarged(null)} onClose={() => setEnlarged(null)} onClick={event => { if (event.target === event.currentTarget) setEnlarged(null); }}><button type="button" autoFocus onClick={() => setEnlarged(null)} aria-label="Close photograph">×</button>{enlarged && <><img src={enlarged.image} alt={enlarged.alt} /><p>{enlarged.caption}</p></>}</dialog>
  </article>;
}
