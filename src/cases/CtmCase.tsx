import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Study } from '../stories';
import { CTM_CHANNELS, CTM_STAGES, curvePath, curvePoint, relayGeometry } from './ctm/ctmFlowData';
import type { CtmChannelId, CtmStageId, Point } from './ctm/ctmFlowData';
import './CtmCase.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CtmCase({ study, paused }: { study: Study; paused: boolean }) {
  const root = useRef<HTMLElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const note = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const channelButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const stageButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const redraw = useRef<() => void>(() => {});
  const titleId = useId();
  const noteId = useId();
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 640px)').matches);
  const [channel, setChannel] = useState<CtmChannelId>('facebook');
  const [stage, setStage] = useState<CtmStageId>('webinars');
  const [zoomed, setZoomed] = useState(false);
  const geometry = useMemo(() => relayGeometry(compact), [compact]);
  const channelIndex = CTM_CHANNELS.findIndex(item => item.id === channel);
  const selected = CTM_STAGES.find(item => item.id === stage)!;
  const active = useRef({ channelIndex, stage });
  active.current = { channelIndex, stage };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useGSAP(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('.ctm-masthead > *, .ctm-composition', {
      y: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity',
    });
    gsap.from('.ctm-source-photo', {
      y: 38, scale: 0.96, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.ctm-evidence', start: 'top 87%', once: true },
      clearProps: 'transform,opacity',
    });
    gsap.utils.toArray<HTMLElement>('.ctm-decision').forEach(item => {
      gsap.from(item, {
        y: 25, opacity: 0, duration: 0.55, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 90%', once: true }, clearProps: 'transform,opacity',
      });
    });
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  useGSAP(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo('.ctm-wire.is-selected', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' });
    gsap.fromTo(note.current, { rotateY: -9, y: 6, opacity: 0.5 }, { rotateY: 0, y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
  }, { scope: root, dependencies: [channel, stage, paused, compact], revertOnUpdate: true });

  useEffect(() => {
    const element = canvas.current;
    const container = field.current;
    const context = element?.getContext('2d');
    if (!element || !container || !context) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const curves = [...geometry.channelsToHub, ...geometry.work];
    let frame = 0;
    let time = 0;
    let previous = 0;
    let visible = false;
    let disposed = false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frames = 0;
    const moving = () => !paused && !reduce.matches && visible && !document.hidden;
    const draw = (timestamp = 0) => {
      frame = 0;
      if (disposed) return;
      if (moving()) time += previous ? Math.min((timestamp - previous) / 1000, 0.05) * 0.16 : 0;
      previous = timestamp;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.scale(width / geometry.width, height / geometry.height);
      const current = active.current;
      curves.forEach((path, index) => {
        const show = index < 4 ? index === current.channelIndex
          : current.stage === 'webinars' ? index === 4 || index === 5
            : current.stage === 'feedback' ? index === 4 || index === 6 : index === 5 || index === 6;
        if (!show) return;
        context.fillStyle = index < 4 ? '#2952c8' : '#44614b';
        for (let dot = 0; dot < 5; dot += 1) {
          const position = curvePoint(path, (time + dot / 5) % 1);
          context.beginPath();
          context.arc(position.x, position.y, compact ? 2.3 : 4, 0, Math.PI * 2);
          context.fill();
        }
      });
      element.dataset.frames = String(++frames);
      if (moving()) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      draw(performance.now());
    };
    const resize = () => {
      const box = container.getBoundingClientRect();
      width = box.width;
      height = box.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      wake();
    };
    const size = new ResizeObserver(resize);
    const visibility = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      wake();
    }, { threshold: 0.05 });
    redraw.current = wake;
    size.observe(container);
    visibility.observe(container);
    document.addEventListener('visibilitychange', wake);
    reduce.addEventListener('change', wake);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      size.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', wake);
      reduce.removeEventListener('change', wake);
      redraw.current = () => {};
    };
  }, [geometry, compact, paused]);

  useEffect(() => { redraw.current(); }, [channel, stage]);
  useEffect(() => {
    if (zoomed && !dialog.current?.open) dialog.current?.showModal();
    if (!zoomed && dialog.current?.open) dialog.current?.close();
  }, [zoomed]);

  function keyboard(event: KeyboardEvent<HTMLButtonElement>, index: number, kind: 'channel' | 'stage') {
    const count = kind === 'channel' ? CTM_CHANNELS.length : CTM_STAGES.length;
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % count;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    if (kind === 'channel') {
      setChannel(CTM_CHANNELS[next].id);
      channelButtons.current[next]?.focus();
    } else {
      setStage(CTM_STAGES[next].id);
      stageButtons.current[next]?.focus();
    }
  }

  const position = (point: Point): CSSProperties => ({ left: `${point.x / geometry.width * 100}%`, top: `${point.y / geometry.height * 100}%` });
  const workSelected = (index: number) => stage === 'webinars' ? index < 2 : stage === 'feedback' ? index !== 1 : index !== 0;

  return <article ref={root} className="case-ctm" data-channel={channel} data-stage={stage} data-motion={paused ? 'paused' : 'on'} aria-labelledby={titleId}>
    <header className="ctm-masthead">
      <div className="ctm-heading">
        <p className="ctm-kicker">CTM <span>· {study.date}</span></p>
        <h1 id={titleId}>Beyond the first click.</h1>
        <p className="ctm-intro">Four channels, live conversations and the follow-up between them.</p>
        <p className="ctm-role">{study.role}</p>
      </div>
      <p className="ctm-opening-result"><strong>15%+</strong><span>monthly revenue<br />contribution share</span></p>
    </header>

    <section className="ctm-composition" aria-label="Explore the campaign and conversation workflow">
      <div className="ctm-relay">
        <div className="ctm-relay-heading"><h2>4 channels. One connected role.</h2><span>Choose a touchpoint</span></div>
        <div ref={field} className="ctm-signal-field" style={{ aspectRatio: `${geometry.width} / ${geometry.height}` }}>
          <svg className="ctm-relay-wires" viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true">
            {geometry.channelsToHub.map((path, i) => <path key={CTM_CHANNELS[i].id} className={`ctm-wire${i === channelIndex ? ' is-selected' : ''}`} pathLength="1" d={curvePath(path)} />)}
            {geometry.work.map((path, i) => <path key={i} className={`ctm-wire ctm-work-wire${workSelected(i) ? ' is-selected' : ''}`} pathLength="1" d={curvePath(path)} />)}
          </svg>
          <canvas ref={canvas} className="ctm-relay-canvas" aria-hidden="true" />
          {CTM_CHANNELS.map((item, index) => <button key={item.id} ref={element => { channelButtons.current[index] = element; }} className={`ctm-channel-node${channel === item.id ? ' is-selected' : ''}`} style={position(geometry.channels[index])} aria-pressed={channel === item.id} aria-controls={noteId} onClick={() => setChannel(item.id)} onKeyDown={event => keyboard(event, index, 'channel')}><span className="ctm-channel-symbol" aria-hidden="true">{item.symbol}</span>{item.name}<span className="ctm-node-dot" aria-hidden="true" /></button>)}
          {CTM_STAGES.map((item, index) => <button key={item.id} ref={element => { stageButtons.current[index] = element; }} className={`ctm-work-node ctm-node-${item.id}${stage === item.id ? ' is-selected' : ''}`} style={position(geometry.stages[index])} aria-pressed={stage === item.id} aria-controls={noteId} onClick={() => setStage(item.id)} onKeyDown={event => keyboard(event, index, 'stage')}><strong aria-hidden={index === 1}>{index === 0 ? '5+' : index === 1 ? '↺' : '15%+'}</strong><span>{item.name}</span><small>{index === 0 ? 'sessions per month' : index === 1 ? 'engagement & response' : 'monthly revenue share'}</small></button>)}
        </div>
        <p className="ctm-diagram-caption">Illustrated workflow · my work across campaigns, sessions and follow-up.</p>
      </div>
      <aside ref={note} id={noteId} className="ctm-work-note" aria-live="polite" aria-atomic="true">
        <p className="ctm-selected-context"><span>{CTM_CHANNELS[channelIndex].name}</span><span aria-hidden="true">/</span><span>{selected.name}</span></p>
        <h2>{selected.title}</h2>
        <p className="ctm-personal-action">{selected.action}</p>
        <p className="ctm-connection">{selected.connection}</p>
        <p className="ctm-note-result"><strong>{selected.metric}</strong><span>{selected.metricLabel}</span></p>
      </aside>
    </section>

    <section className="ctm-craft" aria-labelledby={`${titleId}-part`}>
      <div className="ctm-craft-intro"><p className="ctm-kicker">My part in the work</p><h2 id={`${titleId}-part`}>Keep the next step connected.</h2><p>{study.question}</p></div>
      <div className="ctm-decisions">{study.decisions.map((decision, index) => <article className="ctm-decision" key={decision.title}><span className="ctm-decision-number" aria-hidden="true">0{index + 1}</span><div><h3>{decision.title}</h3><p>{decision.action}</p><details><summary>Why it mattered<span aria-hidden="true">+</span></summary><p>{decision.why}</p></details></div></article>)}</div>
    </section>

    <section className="ctm-evidence" aria-labelledby={`${titleId}-people`}>
      <div className="ctm-evidence-heading"><p className="ctm-kicker">At CTM</p><h2 id={`${titleId}-people`}>The people behind the work.</h2></div>
      <figure className="ctm-source-photo"><button onClick={() => setZoomed(true)} aria-label="Enlarge CTM event photograph"><img src={study.image} alt={study.alt} loading="lazy" /><span className="ctm-photo-zoom" aria-hidden="true">View photograph ↗</span></button><figcaption>Education and consulting work, documented in my original portfolio.</figcaption></figure>
    </section>

    <footer className="ctm-outcome"><div><p className="ctm-kicker">What I contributed</p><p className="ctm-outcome-copy">{study.outcome}</p></div><div className="ctm-takeaway"><p>{study.lesson}</p><a href={study.source} target="_blank" rel="noreferrer">See the original portfolio <span aria-hidden="true">↗</span></a></div></footer>
    <dialog ref={dialog} className="ctm-photo-dialog" onCancel={() => setZoomed(false)} onClose={() => setZoomed(false)} onClick={event => { if (event.target === event.currentTarget) setZoomed(false); }} aria-label="CTM event photograph"><button className="ctm-dialog-close" onClick={() => setZoomed(false)} aria-label="Close photograph">×</button><img src={study.image} alt={study.alt} /></dialog>
  </article>;
}
