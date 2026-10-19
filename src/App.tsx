import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { JourneyPage, WorkPage, NotesPage, HelloPage } from './Pages';
import { useNavigationVisibility, usePhotoMotion } from './ScrollMotion';
const Desk=lazy(()=>import('./Desk'));
const nav=[{id:'journey',label:'My path'},{id:'work',label:'Project stories'},{id:'notes',label:'About Mai'},{id:'hello',label:'Say hello'}];
const readRoute=()=>location.hash.replace(/^#\/?/,'').split('/');

export default function App(){
 const [route,setRoute]=useState(readRoute);const [paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);const [menu,setMenu]=useState(false);const previousPage=useRef(route[0]);
 const page=route[0]||'';const chapter=route[1]===undefined?-1:Math.min(4,Math.max(0,Number(route[1])||0));
 const navigation=useNavigationVisibility(page==='work'?route.join('/'):page,menu);
 usePhotoMotion(paused,route.join('/'));
 const navigate=useCallback((destination:string)=>{location.hash=`/${destination}`},[]);
 useEffect(()=>{const update=()=>{const next=readRoute();if(next[0]!==previousPage.current||next[1]===undefined)window.scrollTo({top:0,behavior:'instant'});previousPage.current=next[0];setRoute(next);setMenu(false)};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[]);
 useEffect(()=>{document.documentElement.dataset.motion=paused?'off':'on'},[paused]);
 useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[menu]);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setPaused(q.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
 useEffect(()=>{document.title=`${nav.find(n=>n.id===page)?.label??'Mai’s corner'} — Ngoc Mai Nguyen`},[page]);
 return <div className={`portfolio-world page-${page||'desk'}`} data-navigation={navigation.hidden?'hidden':'visible'}>
  <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus()}}>Skip to content</a>
  <header className="site-header">
   <a className="signature" href="#/" aria-label="Mai’s corner, home">mai<span>↗</span></a>
   <nav className={menu?'chapter-nav expanded':'chapter-nav'} aria-label="Main navigation">{nav.map(n=><a key={n.id} href={`#/${n.id}`} aria-current={page===n.id?'page':undefined}>{n.label}</a>)}</nav>
   <button className="motion-switch" aria-pressed={paused} aria-label={paused?'Enable motion':'Pause motion'} onClick={()=>setPaused(!paused)} title={paused?'Enable motion':'Pause motion'}>{paused?'▷':'Ⅱ'}</button>
   <button className={`index-toggle ${menu?'open':''}`} aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} onClick={()=>setMenu(!menu)}><span/><span/></button>
   <button className="hide-navigation" aria-label="Hide navigation" title="Hide navigation" onClick={()=>{setMenu(false);navigation.hide()}}>⌃</button>
  </header>
  <button className="navigation-peek" aria-label="Show navigation" onClick={navigation.show}>Menu <span aria-hidden="true">⌄</span></button>
  <main className="page-stage" id="main" tabIndex={-1} key={page}>
   {page===''&&<section className="desk-home" aria-labelledby="desk-title"><div className="desk-introduction"><h1 id="desk-title">Hi, I’m <em>Mai.</em></h1><p>A few chapters on my desk.<br/>Pick one to look inside.</p></div><Suspense fallback={<div className="desk-placeholder">Opening the desk…</div>}><Desk paused={paused} navigate={navigate}/></Suspense></section>}
   {page==='journey'&&<JourneyPage chapter={chapter} paused={paused} onChange={i=>navigate(`journey/${i}`)}/>}
   {page==='work'&&<WorkPage projectId={route[1]} onChange={id=>navigate(`work/${id}`)}/>}
   {page==='notes'&&<NotesPage/>}
   {page==='hello'&&<HelloPage/>}
   {page!==''&&!nav.some(n=>n.id===page)&&<section className="lost-page"><h1>A loose page.</h1><a href="#/">Back to Mai’s desk ↗</a></section>}
  </main>
 </div>
}
