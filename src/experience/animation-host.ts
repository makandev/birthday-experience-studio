// Trusted fixed controller. Generated code runs ONLY in a Worker in an opaque frame.
export const ANIMATION_HOST_SCRIPT = String.raw`(() => {
'use strict';
let worker=null,url=null,pending=null,deadline=0,firstFrame=true;
const stop=()=>{clearTimeout(deadline);if(worker)worker.terminate();worker=null;url=null;pending=null;};
const fail=(reason='invalid')=>{stop();parent.postMessage({type:'bes-animation-failed',reason},'*');};
function valid(raw){
 if(typeof raw!=='string'||raw.length>32768)return null;
 let commands;try{commands=JSON.parse(raw);}catch{return null;}
 if(!Array.isArray(commands)||commands.length>160)return null;
 const fields=['kind','x','y','x2','y2','r','w','h','color','alpha','glow'];
 for(const c of commands){
  if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).some(k=>!fields.includes(k)))return null;
  if(!['circle','line','rect'].includes(c.kind)||!/^#[0-9a-fA-F]{6}$/.test(c.color)||!Number.isFinite(c.alpha)||c.alpha<0||c.alpha>1)return null;
  for(const k of ['x','y'])if(!Number.isFinite(c[k])||c[k]<-1||c[k]>2)return null;
  for(const k of ['x2','y2','r','w','h','glow'])if(k in c&&(!Number.isFinite(c[k])||c[k]<-1||c[k]>2))return null;
  if('glow' in c&&(c.glow<0||c.glow>1))return null;
  if(c.kind==='circle'&&(!Number.isFinite(c.r)||c.r<0||c.r>1))return null;
  if(c.kind==='line'&&(!Number.isFinite(c.x2)||!Number.isFinite(c.y2)))return null;
  if(c.kind==='rect'&&(!Number.isFinite(c.w)||!Number.isFinite(c.h)||c.w<0||c.h<0||c.w>1||c.h>1))return null;
 }
 return commands;
}
addEventListener('message',event=>{
 if(event.source!==parent||!event.data||typeof event.data!=='object')return;
 const m=event.data;
 if(m.type==='bes-animation-init'){
  stop();firstFrame=true;if(typeof m.source!=='string'||m.source.length>16000){fail();return;}
  const source='"use strict";\n'+m.source+'\nself.onmessage=e=>{try{postMessage(JSON.stringify(frame(e.data)));}catch{postMessage("invalid");}};';
  try{url='data:text/javascript;charset=utf-8;base64,'+btoa(String.fromCharCode(...new TextEncoder().encode(source)));worker=new Worker(url);}catch{fail();return;}
  const active=worker;
  worker.onerror=event=>{event.preventDefault();if(worker===active)fail('worker-error');};
  worker.onmessage=event=>{
   if(worker!==active)return;
   if(!pending){fail();return;}
   const commands=valid(event.data);if(!commands){fail();return;}
   firstFrame=false;clearTimeout(deadline);const request=pending;pending=null;
   parent.postMessage({type:'bes-animation-frame',commands,request},'*');
  };
 }else if(m.type==='bes-animation-tick'&&worker&&!pending){
  if(!m.input||typeof m.request!=='number')return;
  pending=m.request;deadline=setTimeout(()=>fail('timeout'),firstFrame?1500:400);worker.postMessage(m.input);
 }else if(m.type==='bes-animation-stop')stop();
});
addEventListener('pagehide',stop);
})();`;
export const ANIMATION_HOST_HASH =
  'LM26vsB8F/vas14FG6bgQ+Z8FhwgfbXjRkj4I1L6DtI=';
export const ANIMATION_HOST_HTML = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${ANIMATION_HOST_HASH}'; worker-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'"><script>${ANIMATION_HOST_SCRIPT}</script>`;
