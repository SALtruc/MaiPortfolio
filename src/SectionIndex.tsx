import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

export function SectionIndex({id,label,current,children}:{id:string;label:string;current:string;children:ReactNode}){
 const [open,setOpen]=useState(false);
 const toggle=useRef<HTMLButtonElement>(null);
 return <div className="section-index" onKeyDown={e=>{if(e.key==='Escape'&&open){setOpen(false);toggle.current?.focus()}}}>
  <button ref={toggle} className="section-index-toggle" aria-expanded={open} aria-controls={id} aria-label={`${open?'Hide':'Show'} ${label.toLowerCase()}`} onClick={()=>setOpen(!open)}>
   <span>{label}</span><strong>{current}</strong><span className="index-chevron" aria-hidden="true">⌄</span>
  </button>
  <div id={id} hidden={!open} onClick={e=>{if((e.target as HTMLElement).closest('nav button')){setOpen(false);toggle.current?.focus({preventScroll:true})}}}>{children}</div>
 </div>
}
