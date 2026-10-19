import { useEffect, useRef, useState } from 'react';
import { email, linkedin } from './content';
import { awardSource, journeyStories } from './stories';
import { Reveal } from './ScrollMotion';
import { SectionIndex } from './SectionIndex';

export function JourneyPage({chapter,paused,onChange}:{chapter:number;paused:boolean;onChange:(n:number)=>void}){
 const [active,setActive]=useState(Math.max(0,chapter));const storyRefs=useRef<(HTMLElement|null)[]>([]);const previousRequest=useRef(-2);
 useEffect(()=>{if(chapter<0||chapter===previousRequest.current)return;let cancelled=false;void document.fonts.ready.then(()=>{if(cancelled)return;previousRequest.current=chapter;storyRefs.current[chapter]?.scrollIntoView({behavior:'instant',block:'start'})});return()=>{cancelled=true}},[chapter,paused]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(Number((e.target as HTMLElement).dataset.chapter))},{rootMargin:'-22% 0px -50% 0px',threshold:0});storyRefs.current.forEach(el=>el&&observer.observe(el));return()=>observer.disconnect()},[]);
 return <section className="path-page" aria-label="Mai’s learning journey">
  <div className="path-opening"><h1>The turning <em>points.</em></h1><p>How each experience changed the way I work.</p></div>
  <SectionIndex id="journey-index" label="Timeline" current={journeyStories[active].company}><nav className="path-chapters" aria-label="Journey, oldest to newest">{journeyStories.map((s,i)=><button key={s.company} aria-current={active===i?'step':undefined} onClick={()=>{storyRefs.current[i]?.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});onChange(i)}}><span>{s.year}</span>{s.company}</button>)}</nav></SectionIndex>
  {journeyStories.map((s,i)=><article className={`path-story story-${i}`} key={s.company} data-chapter={i} ref={el=>{storyRefs.current[i]=el}} aria-labelledby={`story-title-${i}`}>
   <figure className="path-photo scroll-photo"><img src={s.image} alt={s.alt} loading={i===0||i===chapter?'eager':'lazy'}/><figcaption>{s.company} · {s.date}</figcaption></figure>
   <div className="path-story-copy"><Reveal><span className="story-role">{s.role}</span><h2 id={`story-title-${i}`}>{s.title}<em>{s.turn}</em></h2><p>{s.body}</p></Reveal><Reveal className="turning-point"><h3>What shifted</h3><p>{s.insight}</p></Reveal><Reveal className="carry-note"><p>{s.carry}</p><a href={s.source} target="_blank" rel="noreferrer">Read the original reflection ↗</a></Reveal></div>
  </article>)}
  <div className="path-endnote"><Reveal><h2>What does that look like <em>in practice?</em></h2><a href="#/work">Open the project stories ↗</a></Reveal></div>
 </section>
}

export { WorkPage } from './WorkPage';

export function NotesPage(){
 return <section className="about-page" aria-labelledby="about-title"><div className="about-main"><figure className="about-portrait scroll-photo"><img src="/assets/mai-portrait.webp" alt="Mai at RMIT Vietnam"/></figure><article><h1 id="about-title">A little more <em>Mai.</em></h1><Reveal><p>I’m a Business student at RMIT Vietnam, exploring what happens when data, technology and people come together.</p><p>Student leadership taught me to listen. Finance taught me to look closely. Working with students and employers helped me become more comfortable speaking up and bringing an idea into the room.</p><p>Now, at TikTok, I’m getting to know a different kind of fast-moving environment: AI data service and operations.</p></Reveal><p className="personal-signature">Still learning. Always Day 1.<br/>— Mai</p></article></div><Reveal className="about-learning"><div><h2>Learning on <em>two tracks.</em></h2><p>RMIT University Vietnam<br/>Bachelor of Business · Expected 2027<br/>Finance major · Digital Marketing minor</p></div><div><h3>Things I work with</h3><p>Excel, Google Workspace, Canva, Premiere Pro, CapCut and RStudio.</p><h3>Languages</h3><p>Vietnamese · native<br/>English · fluent<br/>German · intermediate</p></div></Reveal><section className="award-story"><figure className="scroll-photo"><img src="/assets/award-portrait.webp" alt="Mai holding her RMIT leadership award" loading="lazy"/></figure><Reveal><h2>A moment that <em>meant a lot.</em></h2><p>In 2026, I received RMIT’s Impactful Leaders Award and was one of 14 students selected for the Student Leadership Recognition Awards.</p><p>What mattered most to me was that the recognition came from people who had seen different chapters of my growth.</p><a href={awardSource} target="_blank" rel="noreferrer">Read the reflection ↗</a></Reveal></section></section>
}

export function HelloPage(){
 const [flipped,setFlipped]=useState(false);const [copied,setCopied]=useState(false);
 const copy=async()=>{try{await navigator.clipboard.writeText(email);setCopied(true);setTimeout(()=>setCopied(false),2000)}catch{location.href=`mailto:${email}`}};
 return <section className="hello-page" aria-labelledby="hello-title"><h1 id="hello-title">A note <em>to Mai.</em></h1><div className={`postcard-scene ${flipped?'flipped':''}`}><div className="postcard"><div className="postcard-face front" inert={flipped}><div className="postcard-drawing" aria-hidden="true"><span>✳</span><p>Good people.<br/>Bright possibilities.</p></div><div className="postcard-copy"><span className="postage-stamp" aria-hidden="true">m.</span><h2>Good conversations<br/>are always welcome.</h2><a href={`mailto:${email}`}>{email} ↗</a><button onClick={()=>setFlipped(true)}>Turn the postcard ↻</button></div></div><div className="postcard-face back" inert={!flipped}><h2>Let’s stay in touch.</h2><a href={`mailto:${email}`}>{email} ↗</a><button onClick={copy}>{copied?'Copied ✓':'Copy email'}</button><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="/ngoc-mai-cv.pdf" target="_blank" rel="noreferrer">My CV ↗</a><button onClick={()=>setFlipped(false)}>Back to the front ↶</button><span role="status" className="sr-only">{copied?'Email address copied':''}</span></div></div></div><a className="desk-return" href="#/">← Back to Mai’s desk</a></section>
}
