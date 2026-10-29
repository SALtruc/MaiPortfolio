import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Study } from '../stories';
import { CAREERS_FAIR_EVIDENCE, PASS_PERSPECTIVES, REFLECTION_THEMES, RESPONSIBILITIES } from './careers-fair/fairData';
import type { EvidenceItem, PassPerspectiveId } from './careers-fair/fairData';
import './CareersFairCase.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CareersFairCase({ study, paused }: { study: Study; paused: boolean }) {
  const root = useRef<HTMLElement>(null);
  const passStage = useRef<HTMLDivElement>(null);
  const passTilt = useRef<HTMLDivElement>(null);
  const passRotor = useRef<HTMLDivElement>(null);
  const routePath = useRef<SVGPathElement>(null);
  const traveler = useRef<SVGGElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const progressValue = useRef({ value: 0.16 });
  const [perspective, setPerspective] = useState<PassPerspectiveId>('contributor');
  const [progress, setProgress] = useState(0.16);
  const [evidence, setEvidence] = useState<EvidenceItem | null>(null);
  const titleId = useId();
  const panelId = useId();
  const currentIndex = progress < 0.36 ? 0 : progress < 0.78 ? 1 : 2;
  const current = RESPONSIBILITIES[currentIndex];
  const decision = study.decisions[currentIndex];
  const reduced = paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const syncRoute = (value: number) => {
    const path = routePath.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length * (1 - value)}`;
    const point = path.getPointAtLength(length * value);
    traveler.current?.setAttribute('transform', `translate(${point.x} ${point.y})`);
  };

  useEffect(() => {
    const tween = gsap.to(passRotor.current, { rotateY: perspective === 'visitor' ? 180 : 0, duration: reduced ? 0 : 0.56, ease: 'power3.inOut', overwrite: true });
    return () => { tween.kill(); };
  }, [perspective, reduced]);

  useEffect(() => {
    const value = progressValue.current;
    const tween = gsap.to(value, { value: progress, duration: reduced ? 0 : 0.46, ease: 'power2.inOut', onUpdate: () => syncRoute(value.value), onComplete: () => syncRoute(progress), overwrite: true });
    return () => { tween.kill(); };
  }, [progress, reduced]);

  useEffect(() => {
    if (evidence && !dialog.current?.open) dialog.current?.showModal();
    if (!evidence && dialog.current?.open) dialog.current?.close();
  }, [evidence]);

  useGSAP(() => {
    if (reduced) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.cf-masthead > *', { y: 22, opacity: 0, duration: 0.75, stagger: 0.08, ease: 'power3.out' });
      gsap.from('.cf-pass-assembly', { y: 40, rotate: -3, opacity: 0, duration: 1, delay: 0.12, ease: 'power3.out' });
      gsap.from('.cf-personal-number, .cf-event-context', { y: 20, opacity: 0, duration: 0.75, delay: 0.3, stagger: 0.12 });
      gsap.utils.toArray<HTMLElement>('.cf-reveal').forEach((item) => gsap.from(item, { y: 34, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 91%', once: true } }));
    });
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const stage = passStage.current;
      if (!stage) return;
      const x = gsap.quickTo(passTilt.current, 'rotationX', { duration: 0.65, ease: 'power3.out' });
      const y = gsap.quickTo(passTilt.current, 'rotationY', { duration: 0.65, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        const box = stage.getBoundingClientRect();
        x((0.5 - (event.clientY - box.top) / box.height) * 10);
        y(((event.clientX - box.left) / box.width - 0.5) * 12);
      };
      const leave = () => { x(0); y(0); };
      stage.addEventListener('pointermove', move);
      stage.addEventListener('pointerleave', leave);
      return () => { stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); x.tween.kill(); y.tween.kill(); };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [reduced], revertOnUpdate: true });

  useGSAP(() => {
    if (!reduced) gsap.from('.cf-selected-story', { y: 14, opacity: 0, duration: 0.38, ease: 'power2.out' });
  }, { scope: root, dependencies: [currentIndex, reduced], revertOnUpdate: true });

  return (
    <article ref={root} className="case-careers-fair" aria-labelledby={titleId}>
      <header className="cf-masthead">
        <p className="cf-eyebrow">RMIT Careers Fair · 2026</p>
        <h1 id={titleId}>One conversation<br /><em>at a time.</em></h1>
        <p className="cf-intro">A year after attending as a student, I returned to help other students find their next step.</p>
      </header>

      <section className="cf-opening" aria-label="From participant to Career Booth team member">
        <div className="cf-personal-number">
          <span className="cf-scope-label">My contribution</span>
          <strong>300<span>+</span></strong>
          <p>students I engaged with<br />at the Career Booth</p>
        </div>

        <div className="cf-pass-assembly">
          <div className="cf-perspectives" role="group" aria-label="Choose a perspective">
            <button type="button" aria-pressed={perspective === 'visitor'} onClick={() => setPerspective('visitor')}><span>Then</span> Visitor</button>
            <button type="button" aria-pressed={perspective === 'contributor'} onClick={() => setPerspective('contributor')}><span>Now</span> Booth team</button>
          </div>
          <div ref={passStage} className="cf-pass-stage">
            <div className="cf-lanyard" aria-hidden="true"><i /><i /><span /></div>
            <div ref={passTilt} className="cf-pass-tilt">
              <div ref={passRotor} className="cf-pass-rotor">
                {(['contributor', 'visitor'] as const).map((id) => {
                  const face = PASS_PERSPECTIVES[id];
                  return <div key={id} className={`cf-pass-face cf-pass-${id}`} aria-hidden={perspective !== id} inert={perspective !== id}>
                    <div className="cf-pass-top"><span>RMIT Careers</span><span>{face.label} ↗</span></div>
                    <div className="cf-pass-content">
                      <button className="cf-pass-photo" type="button" aria-label={`Enlarge ${face.alt}`} onClick={() => setEvidence({ image: face.image, alt: face.alt, caption: id === 'contributor' ? 'Mai and a colleague at the RMIT Careers Fair booth.' : 'Portrait of Mai at RMIT. The participant chapter is described in her original reflection.' })}>
                        <img src={face.image} alt={face.alt} /><span aria-hidden="true">↗</span>
                      </button>
                      <div className="cf-pass-identity"><span className="cf-pass-name">Mai</span><h2>{face.role}</h2><p>{face.line}</p><span className="cf-pass-mark" aria-hidden="true">m.</span></div>
                    </div>
                    <div className="cf-pass-bottom"><span>{id === 'contributor' ? 'One member of the wider team' : 'The earlier chapter'}</span><span>Careers Fair</span></div>
                  </div>;
                })}
              </div>
            </div>
          </div>
          <p className="cf-pass-caption">A visual retelling of two perspectives on the same event.</p>
        </div>

        <div className="cf-event-context">
          <span className="cf-scope-label">The whole event</span>
          <p><strong>53</strong><span>companies</span></p>
          <p><strong>2,136</strong><span>participants</span></p>
          <small>Delivered by the wider RMIT team.</small>
        </div>
      </section>

      <section className="cf-responsibilities cf-reveal" aria-labelledby={`${titleId}-path`}>
        <div className="cf-section-heading"><h2 id={`${titleId}-path`}>Helping someone<br />find a next step.</h2><p>{study.question}</p></div>
        <div className="cf-path-controls" role="group" aria-label="Explore responsibilities" onKeyDown={(event) => {
          const next = event.key === 'ArrowRight' ? (currentIndex + 1) % 3 : event.key === 'ArrowLeft' ? (currentIndex + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : -1;
          if (next < 0) return;
          event.preventDefault(); setProgress(RESPONSIBILITIES[next].progress);
          event.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
        }}>
          {RESPONSIBILITIES.map((item, index) => <button key={item.id} type="button" aria-pressed={index === currentIndex} aria-controls={panelId} onClick={() => setProgress(item.progress)}><span>{item.title}</span><small>{item.caption}</small></button>)}
        </div>
        <div className="cf-path-art">
          <svg viewBox="0 0 900 125" aria-hidden="true"><path className="cf-route-track" d="M30 88 C200 88 220 20 400 45 S650 120 870 35" /><path ref={routePath} className="cf-route-progress" d="M30 88 C200 88 220 20 400 45 S650 120 870 35" /><circle cx="154" cy="70" r="5" /><circle cx="450" cy="57" r="5" /><circle cx="870" cy="35" r="5" /><g ref={traveler} className="cf-traveler"><circle r="14" /><path d="m-4 0 4-4 4 4m-4-4v8" /></g></svg>
          <label className="cf-path-scrub"><span>Explore the responsibility path</span><input type="range" min="0" max="1" step="0.01" value={progress} onChange={(event) => setProgress(Number(event.target.value))} aria-label="Explore Careers Fair responsibilities" aria-valuetext={current.title} /></label>
          <p className="cf-path-note">A conceptual path through my responsibilities.</p>
        </div>
        <div id={panelId} className="cf-selected-story" aria-live="polite">
          <div className="cf-story-copy"><span className="cf-scope-label">{current.title}</span><h3>{decision.title}</h3><p>{decision.action}</p><p className="cf-story-why">{decision.why.replace('These conversations changed how she saw the event.', 'These conversations changed how I saw the event.')}</p></div>
          <figure><button type="button" className="cf-story-photo" aria-label={`Enlarge ${current.alt}`} onClick={() => setEvidence({ image: current.image, alt: current.alt, caption: current.imageCaption })}><img src={current.image} alt={current.alt} loading="lazy" /><span aria-hidden="true">↗</span></button><figcaption>{current.imageCaption}</figcaption></figure>
        </div>
      </section>

      <section className="cf-reflection cf-reveal" aria-labelledby={`${titleId}-reflection`}>
        <div><span className="cf-scope-label">What stayed with me</span><h2>Beyond<br />applications.</h2></div>
        <div className="cf-field-notes">{REFLECTION_THEMES.map((theme) => <div key={theme.title}><h3>{theme.title}</h3><p>{theme.body}</p></div>)}</div>
      </section>

      <section className="cf-photo-strip cf-reveal" aria-label="Real moments and related work">{CAREERS_FAIR_EVIDENCE.map((item) => <figure key={item.image}><button type="button" aria-label={`Enlarge ${item.alt}`} onClick={() => setEvidence(item)}><img src={item.image} alt={item.alt} loading="lazy" /><span aria-hidden="true">↗</span></button><figcaption>{item.caption}</figcaption></figure>)}</section>

      <footer className="cf-closing cf-reveal"><div><span className="cf-scope-label">My role</span><h2>{study.role}</h2><p>{study.company} · {study.date}</p></div><div><p>{study.outcome}</p><p className="cf-closing-lesson">{study.lesson}</p><a href={study.source} target="_blank" rel="noreferrer">Read the original reflection <span aria-hidden="true">↗</span></a></div></footer>

      <dialog ref={dialog} className="cf-lightbox" aria-label="Photographic evidence" onCancel={() => setEvidence(null)} onClose={() => setEvidence(null)} onClick={(event) => { if (event.target === event.currentTarget) setEvidence(null); }}>
        {evidence && <><button type="button" className="cf-lightbox-close" autoFocus onClick={() => setEvidence(null)}>Close <span aria-hidden="true">×</span></button><img src={evidence.image} alt={evidence.alt} /><p>{evidence.caption}</p></>}
      </dialog>
    </article>
  );
}
