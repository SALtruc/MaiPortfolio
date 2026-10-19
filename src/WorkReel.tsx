import { useEffect, useRef, useState } from 'react';
import { studies } from './stories';
import { workVisuals } from './workVisuals';

export function WorkReel(){
 const [active,setActive]=useState(0);
 const sections=useRef<(HTMLElement|null)[]>([]);
 const pendingJump=useRef<number|null>(null);
 const focusedProject=useRef<number|null>(null);
 const settleTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const captions:Record<string,string>={checkpoint:'Original recap of the three-workshop Career Checkpoint series.',michelin:'The project team at a Michelin dealership in Vietnam.',council:'Club Day S3/2025: 43 clubs and more than 2,500 participants.','careers-fair':'Mai supporting students at the RMIT Careers Fair booth.',ctm:'The CTM team at an education consulting event.'};
 const clearTimer=()=>{if(settleTimer.current)clearTimeout(settleTimer.current)};
 const finishJump=()=>{clearTimer();const index=pendingJump.current;pendingJump.current=null;if(index!==null)sections.current[index]?.focus({preventScroll:true})};
 useEffect(()=>{
  const scroll=()=>{if(pendingJump.current===null)return;clearTimer();settleTimer.current=setTimeout(finishJump,110)};
  const cancel=()=>{clearTimer();pendingJump.current=null;focusedProject.current=null};
  const focus=(event:FocusEvent)=>{if(!(event.target instanceof Element)||!event.target.closest('.reel-story'))focusedProject.current=null};
  const key=(event:KeyboardEvent)=>{if(['Tab','Escape','ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))cancel()};
  window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('scrollend',finishJump);window.addEventListener('wheel',cancel,{passive:true});window.addEventListener('touchstart',cancel,{passive:true});window.addEventListener('keydown',key);document.addEventListener('focusin',focus);
  return()=>{cancel();window.removeEventListener('scroll',scroll);window.removeEventListener('scrollend',finishJump);window.removeEventListener('wheel',cancel);window.removeEventListener('touchstart',cancel);window.removeEventListener('keydown',key);document.removeEventListener('focusin',focus)};
 },[]);
 useEffect(()=>{
  const media=matchMedia('(min-width: 900px)');
  let observer:IntersectionObserver|undefined;
  const observe=()=>{
   observer?.disconnect();if(!media.matches)return;
   const visible=new Set<HTMLElement>();
   observer=new IntersectionObserver(entries=>{
    for(const entry of entries){const node=entry.target as HTMLElement;if(entry.isIntersecting)visible.add(node);else visible.delete(node)}
    const closest=[...visible].sort((a,b)=>Math.abs(a.getBoundingClientRect().top+a.offsetHeight/2-innerHeight/2)-Math.abs(b.getBoundingClientRect().top+b.offsetHeight/2-innerHeight/2))[0];
    if(closest&&pendingJump.current===null&&focusedProject.current===null)setActive(Number(closest.dataset.project));
   },{rootMargin:'-35% 0px -35% 0px',threshold:0});
   sections.current.forEach(section=>section&&observer!.observe(section));
  };
  observe();media.addEventListener('change',observe);
  return()=>{observer?.disconnect();media.removeEventListener('change',observe)};
 },[]);
 const jump=(index:number)=>{
  clearTimer();pendingJump.current=index;
  setActive(index);
  const reduced=document.documentElement.dataset.motion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches;
  sections.current[index]?.scrollIntoView({block:'center',behavior:reduced?'instant':'smooth'});
  settleTimer.current=setTimeout(finishJump,reduced?0:900);
 };
 return <section className="work-reel" aria-labelledby="work-reel-title">
  <header className="reel-heading"><h1 id="work-reel-title">Project stories</h1><span>Ngoc Mai Nguyen / Selected work</span></header>
  <div className="reel-layout">
   <div className="reel-stories">{studies.map((study,index)=>{
    const visual=workVisuals[study.id];
    return <article className={`reel-story reel-story-${study.id}`} key={study.id} ref={element=>{sections.current[index]=element}} data-project={index} aria-labelledby={`reel-title-${study.id}`} tabIndex={-1} onFocusCapture={()=>{focusedProject.current=index;setActive(index)}}>
     <a className="reel-mobile-photo" href={`#/work/${study.id}`} aria-label={`Explore ${study.name}`}><img src={visual.cover} alt={visual.coverAlt} loading={index===0?'eager':'lazy'}/></a>
     <div className="reel-story-text"><span className="reel-company">{study.company}</span><h2 id={`reel-title-${study.id}`}><a href={`#/work/${study.id}`}>{study.name}</a></h2><p>{visual.subtitle}</p>
      <div className="reel-impact">{(study.id==='careers-fair'?study.results.slice(0,1):study.id==='ctm'?[study.results[2],study.results[1]]:study.results.slice(0,2)).map(result=><p key={result.label}><strong>{result.value}</strong><span>{result.label}</span></p>)}</div>
      {study.id==='careers-fair'&&<p className="reel-scope">At an event with 2,136 attendees and 53 companies.</p>}
      <a className="reel-open" href={`#/work/${study.id}`}>Explore project <span aria-hidden="true">↗</span></a>
     </div>
    </article>
   })}</div>
   <aside className="reel-viewer" aria-label="Project photographs and navigation">
    <div className="reel-screen">{studies.map((study,index)=>{const visual=workVisuals[study.id];return <a key={study.id} className={`reel-frame frame-${study.id} ${active===index?'is-active':''}`} href={`#/work/${study.id}`} aria-label={`Explore ${study.name}`} aria-hidden={active!==index} tabIndex={active===index?0:-1} inert={active!==index}><img src={visual.cover} alt={visual.coverAlt}/></a>})}</div>
    <div className="reel-viewer-caption"><p>{captions[studies[active].id]}</p><span>{studies[active].date}</span></div>
    <div className="reel-controls"><nav className="reel-index" aria-label="Choose a project">{studies.map((study,index)=><button key={study.id} aria-label={`Show ${study.name}`} title={study.name} aria-current={active===index?'true':undefined} onClick={()=>jump(index)}>{String(index+1).padStart(2,'0')}</button>)}</nav><span aria-live="polite">{studies[active].name}</span></div>
   </aside>
  </div>
  <div className="reel-end"><a href="#/journey">The experiences behind the projects <span aria-hidden="true">↗</span></a><a href="#/hello">Say hello <span aria-hidden="true">↗</span></a></div>
 </section>
}
