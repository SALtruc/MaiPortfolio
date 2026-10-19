import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export function useNavigationVisibility(page:string,menuOpen:boolean){
 const [hidden,setHidden]=useState(false);
 useEffect(()=>setHidden(false),[page]);
 useEffect(()=>{
  if(menuOpen)setHidden(false);
  let anchor=window.scrollY;let frame=0;
  const update=()=>{
   frame=0;const y=Math.max(0,window.scrollY);const delta=y-anchor;
   if(menuOpen||y<30){setHidden(false);anchor=y;return}
   if(delta>12){if(y>120)setHidden(true);anchor=y}
   else if(delta< -8){setHidden(false);anchor=y}
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',scroll,{passive:true});
  return()=>{window.removeEventListener('scroll',scroll);cancelAnimationFrame(frame)};
 },[page,menuOpen]);
 return {hidden,hide:()=>setHidden(true),show:()=>setHidden(false)};
}

export function Reveal({children,className=''}:{children:ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current!;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){el.dataset.visible='true';observer.unobserve(el)}},{threshold:.08});observer.observe(el);return()=>observer.disconnect()},[]);
 return <div ref={ref} className={`scroll-reveal ${className}`}>{children}</div>
}

export function usePhotoMotion(paused:boolean,pageKey:string){
 useEffect(()=>{
  const figures=Array.from(document.querySelectorAll<HTMLElement>('.scroll-photo'));
  const active=new Set<HTMLElement>();let frame=0;let stopped=false;
  const clear=()=>figures.forEach(figure=>{const img=figure.querySelector('img');if(img){img.style.transform='';img.style.willChange=''}});
  if(paused||matchMedia('(prefers-reduced-motion: reduce)').matches){clear();return;}
  const tick=()=>{
   frame=0;if(stopped)return;
   if(!document.hidden)for(const figure of active){const img=figure.querySelector('img');if(!img)continue;const anchor=figure.closest<HTMLElement>('.path-story')??figure;const rect=anchor.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));img.style.transform=`translate3d(0,${24-48*progress}px,0) scale(${1.05-.03*progress})`;}
   if(active.size)frame=requestAnimationFrame(tick);
  };
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){const figure=entry.target as HTMLElement;const img=figure.querySelector('img');if(entry.isIntersecting){active.add(figure);if(img)img.style.willChange='transform'}else{active.delete(figure);if(img)img.style.willChange=''}}if(active.size&&!frame)frame=requestAnimationFrame(tick)},{rootMargin:'100px 0px',threshold:0});
  figures.forEach(figure=>observer.observe(figure));
  return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();clear()};
 },[paused,pageKey]);
}
