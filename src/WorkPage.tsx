import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { studies } from './stories';
import type { Study } from './stories';
import { workVisuals } from './workVisuals';
import { Reveal } from './ScrollMotion';
import { SectionIndex } from './SectionIndex';
import './work.css';

function ProjectCover({study,compact=false}:{study:Study;compact?:boolean}){
 const visual=workVisuals[study.id];
 return <div className={`project-cover cover-${study.id} ${compact?'compact-cover':''}`}>
  {study.id==='checkpoint'?<>
   <div className="checkpoint-portrait"><img src={visual.cover} alt={visual.coverAlt}/></div>
   <div className="checkpoint-scraps"><span className="handwritten">from an idea…</span><img src="/assets/checkpoint-activity.webp" alt="Three hands-on labs, from exploration to networking"/><span className="scrap-note">…to a room full of possibilities.</span></div>
  </>:<img src={visual.cover} alt={visual.coverAlt} loading={compact?'lazy':'eager'}/>}
  <span className="cover-corner" aria-hidden="true">↗</span>
 </div>
}

function WorkCollection(){
 return <section className="work-collection" aria-labelledby="collection-title">
  <header className="collection-intro"><div><span className="collection-eyebrow">A selection of things I helped make happen</span><h1 id="collection-title">The work. <em>The people.</em></h1></div><p>Ideas taken into the real world.<br/>{' '}Pick a story to see how.</p></header>
  <div className="project-wall">{studies.map((study,index)=>{const visual=workVisuals[study.id];return <Reveal key={study.id} className={`project-exhibit exhibit-${study.id}`}><a href={`#/work/${study.id}`} className="project-entry" aria-label={`Explore ${study.name}`}>
   <div className="exhibit-topline"><span>0{index+1} / {visual.category}</span><span>{study.date}</span></div>
   <ProjectCover study={study}/>
   <div className="exhibit-caption"><div><h2>{study.name}</h2><p>{visual.summary}</p></div><span className="open-project" aria-hidden="true">↗</span></div>
  </a></Reveal>})}</div>
  <div className="collection-close"><span className="handwritten">Different projects. A common thread.</span><p>Listen closely. Bring people together.<br/>Follow the details through.</p><a href="#/journey">Meet the person behind the work ↗</a></div>
 </section>
}

function ProcessDrawing({kind}:{kind:'discover'|'document'|'connect'}){
 return <svg className={`process-drawing drawing-${kind}`} viewBox="0 0 180 100" fill="none" aria-hidden="true">
  {kind==='discover'?<><circle cx="78" cy="43" r="28" className="drawing-wash"/><circle cx="78" cy="43" r="20"/><path d="m94 60 28 28M28 25l9 4M40 4l5 8M116 14l-7 7M126 43h13"/><path d="m69 44 7 7 13-15"/></>:kind==='document'?<><path className="drawing-wash" d="m54 13 66-5 5 79-66 5z"/><path d="m48 10 64 4-5 78-64-4zM61 32l32 2M60 44l23 2M59 56l29 2"/><path d="m84 76 11 11 29-30"/><path d="m124 15 8-7M133 28h11"/></>:<><path d="M50 52h80M65 35l25 38 25-38" className="connection-line"/><circle cx="50" cy="48" r="19" className="drawing-wash"/><circle cx="130" cy="48" r="19" className="drawing-wash"/><circle cx="90" cy="76" r="17" className="drawing-wash"/><circle cx="50" cy="42" r="7"/><path d="M37 59c1-14 25-14 26 0"/><circle cx="130" cy="42" r="7"/><path d="M117 59c1-14 25-14 26 0"/><circle cx="90" cy="71" r="6"/><path d="M79 85c1-12 21-12 22 0M85 13l5-7 5 7"/></>}
 </svg>
}

type Evidence={image:string;alt:string;caption:string};
function OperationsMap({project,step}:{project:string;step:number}){
 const finance=project==='michelin';
 return <figure className={`operations-map map-${project}`} data-step={step} aria-label={finance?'Project coordination: vendors, proposal review, internal departments and contract discussions':'Customer journey: four channels, webinars, feedback and sales support'}>
  <figcaption>{finance?'Bringing the moving parts together':'From attention to a conversation'}</figcaption>
  <div className="map-flow"><div className="map-input">{finance?<><strong>12+</strong><span>vendors</span></>:<><div className="channel-names"><span>Facebook</span><span>TikTok</span><span>LinkedIn</span><span>Website</span></div><span>4 channels</span></>}</div><span className="map-arrow" aria-hidden="true">→</span><div className="map-hub"><ProcessDrawing kind="document"/><strong>{finance?'15+':'5+'}</strong><span>{finance?'proposals reviewed':'webinars / month'}</span></div><span className="map-arrow" aria-hidden="true">→</span><div className="map-partners">{finance?<><strong>4+</strong><span>internal departments</span></>:<><ProcessDrawing kind="connect"/><span>Feedback<br/>& follow-up</span></>}</div></div>
  <div className="map-destination"><span aria-hidden="true">↓</span><p>{finance?'Support contract finalisation':'Connect promotion with customer engagement & sales'}</p></div>
 </figure>
}
function ProjectCase({study,onChange}:{study:Study;onChange:(id:string)=>void}){
 const visual=workVisuals[study.id];const [step,setStep]=useState(0);const [zoom,setZoom]=useState<Evidence|null>(null);const dialog=useRef<HTMLDialogElement>(null);
 const next=studies[(studies.indexOf(study)+1)%studies.length];const selected=visual.steps[step];
 useEffect(()=>{if(zoom&&!dialog.current?.open)dialog.current?.showModal();if(!zoom&&dialog.current?.open)dialog.current.close()},[zoom]);
 const choose=(id:string)=>{onChange(id);window.scrollTo({top:0,behavior:'instant'})};
 const evidence=[{image:study.image,alt:study.alt,caption:study.id==='checkpoint'?'From a focus-group insight to the Career Checkpoint series.':visual.subtitle},...study.gallery].filter((p,i,all)=>all.findIndex(other=>other.image===p.image)===i);
 return <section className={`visual-case visual-case-${study.id}`} aria-labelledby="visual-case-title">
  <div className="case-navigation"><a href="#/work">← All projects</a><span>{study.company} · {study.date}</span></div>
  <SectionIndex id="project-index" label="Projects" current={study.name}><nav className="project-selector" aria-label="Project stories">{studies.map((s,i)=><button key={s.id} onClick={()=>choose(s.id)} aria-pressed={s.id===study.id}><span>0{i+1}</span>{s.name}</button>)}</nav></SectionIndex>
  <div className="visual-case-intro"><div className="visual-case-copy"><span className="visual-category">{study.name}</span><h1 id="visual-case-title">{visual.title}</h1><p>{visual.subtitle}</p><div className="visual-role"><span>My part</span><p>{study.role}</p></div><a className="jump-to-process" href="#process" onClick={e=>{e.preventDefault();document.getElementById('process')?.scrollIntoView({behavior:document.documentElement.dataset.motion==='off'?'instant':'smooth'})}}>See how it came together <span aria-hidden="true">↓</span></a></div>
   <button className="visual-hero" aria-label="Enlarge project cover" onClick={()=>setZoom(evidence[0])}><ProjectCover study={study}/></button>
  </div>
  <Reveal className="impact-strip">{study.results.map(result=><div key={result.label}><strong>{result.value}</strong><span>{result.label}</span></div>)}</Reveal>
  <section className="process-lab" id="process" aria-labelledby="process-heading">
   <Reveal className="process-heading"><div><span className="handwritten">The thinking behind the doing</span><h2 id="process-heading">How it <em>came together.</em></h2></div><p>{study.question}</p></Reveal>
   <div className="process-track" role="tablist" aria-label="Explore the project process">{visual.steps.map((item,index)=><button key={item.label} role="tab" id={`process-step-${index}`} aria-selected={index===step} aria-controls="process-focus" tabIndex={index===step?0:-1} onClick={()=>setStep(index)} onKeyDown={e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const nextStep=e.key==='Home'?0:e.key==='End'?2:(index+(e.key==='ArrowRight'?1:2))%3;setStep(nextStep);e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]')[nextStep]?.focus()}}><span className="process-number">0{index+1}</span><ProcessDrawing kind={item.kind}/><strong>{item.label}</strong><span>{item.caption}</span><i aria-hidden="true">↗</i></button>)}</div>
   <div className="process-focus" id="process-focus" role="tabpanel" aria-labelledby={`process-step-${step}`}>
    {study.id==='michelin'||study.id==='ctm'?<OperationsMap project={study.id} step={step}/>:<button className={`process-photo process-photo-${study.id}`} onClick={()=>setZoom({image:selected.image,alt:selected.alt,caption:selected.caption})} aria-label="Enlarge process image"><img key={selected.image} src={selected.image} alt={selected.alt} loading="lazy"/><span>Look closer ↗</span></button>}
    <div className="process-explanation" key={step}><span className="process-step-label">0{step+1} / {selected.label}</span><h3>{study.decisions[step].title}</h3><p>{study.decisions[step].action}</p><details><summary>Why I chose this <span aria-hidden="true">+</span></summary><p>{study.decisions[step].why}</p></details></div>
   </div>
  </section>
  {evidence.length>1&&<section className="evidence-room" aria-labelledby="evidence-heading"><Reveal className="evidence-heading"><h2 id="evidence-heading">A little closer to <em>the work.</em></h2><span>Photos & original project recaps</span></Reveal><div className={`evidence-wall evidence-count-${evidence.length}`}>{evidence.map((photo,index)=><Reveal key={photo.image} className="evidence-sheet"><figure><button onClick={()=>setZoom(photo)} aria-label={`Enlarge evidence ${index+1}: ${photo.alt}`}><img src={photo.image} alt={photo.alt} loading="lazy"/><span aria-hidden="true">↗</span></button><figcaption>{photo.caption}</figcaption></figure></Reveal>)}</div></section>}
  <Reveal className="outcome-reflection"><div><span>What this work made possible</span><p>{study.outcome}</p></div><blockquote><span className="handwritten">A note I’m taking forward</span><p>{study.lesson}</p><a href={study.source} target="_blank" rel="noreferrer">Read the original story ↗</a></blockquote></Reveal>
  <a className="next-project-exhibit" href={`#/work/${next.id}`} onClick={()=>window.scrollTo({top:0,behavior:'instant'})}><img src={workVisuals[next.id].cover} alt={workVisuals[next.id].coverAlt} loading="lazy"/><div><span>Another side of the work</span><h2>{next.name}</h2><p>{workVisuals[next.id].summary}</p></div><span aria-hidden="true">↗</span></a>
  <dialog ref={dialog} className="photo-dialog" onCancel={()=>setZoom(null)} onClose={()=>setZoom(null)} onClick={e=>{if(e.target===e.currentTarget)setZoom(null)}} aria-label="Enlarged project evidence"><button autoFocus onClick={()=>setZoom(null)} aria-label="Close enlarged image">×</button>{zoom&&<><img src={zoom.image} alt={zoom.alt}/><p>{zoom.caption}</p></>}</dialog>
 </section>
}

export function WorkPage({projectId,onChange}:{projectId:string|undefined;onChange:(id:string)=>void}){
 useLayoutEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[projectId]);
 const study=studies.find(item=>item.id===projectId);
 return study?<ProjectCase key={study.id} study={study} onChange={onChange}/>:<WorkCollection/>;
}
