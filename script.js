'use strict';
const source=[
['06',"Look! My tooth came out.\nDo you think the fairy knows we moved?"],
['11',"We said best friends forever.\nI wrote it on my hand so I wouldn't forget."],
['17',"I played that song all the way home.\nI think she likes me. I think."],
['24',"Two suitcases. A key of my own.\nI called Mum as soon as I got there."],
['36',"He's finally asleep.\nHis whole hand fits around my finger."],
['52',"Dad still asks if I've eaten.\nThese days, I ask him first."],
['68',"We have time for the long way home now.\nShe still reaches for my hand."],
['83',"You're here.\nCome sit beside me. The tea is still warm."]];
const $=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let w=innerWidth,h=innerHeight,started=false,time=0,drift=0,last=performance.now(),active=null,paused=reduced,companion=false,menu=false,keyboard=false,still=0,speed=0,nextLucid=22,wasShared=false,audio,gain,sound=false;
const pointer={x:w/2,y:h/2},light={...pointer},friend={x:w*.8,y:h*.3};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let saved=[];try{const v=JSON.parse(localStorage.getItem('afterglow-memories-en')||'[]');if(Array.isArray(v))saved=v.filter(t=>typeof t==='string').slice(-12)}catch{}
const scene=$('#fragments');
const darkness=document.createElement('div');darkness.id='paper-darkness';darkness.setAttribute('aria-hidden','true');$('#space').append(darkness);
let tiltX=0,tiltY=0,clarityMix=0,blinkStart=-100,previousClarity=false;
const warmth=document.createElement('div');warmth.id='warmth';warmth.setAttribute('aria-hidden','true');$('#space').append(warmth);
const touchDevice=matchMedia('(pointer: coarse)').matches;
let gyroAsked=false,gyroEnabled=false,gyroX=0,gyroY=0,gyroOrigin=null,dwell=null,dwellSince=0;
async function requestGyro(){
 if(gyroAsked||reduced||!touchDevice)return;gyroAsked=true;
 try{if(typeof DeviceOrientationEvent==='undefined')return;if(typeof DeviceOrientationEvent.requestPermission==='function'&&await DeviceOrientationEvent.requestPermission()!=='granted')return;
 addEventListener('deviceorientation',e=>{if(!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;if(!gyroOrigin)gyroOrigin={beta:e.beta,gamma:e.gamma};gyroX=clamp((e.beta-gyroOrigin.beta)*.16,-5,5);gyroY=clamp((e.gamma-gyroOrigin.gamma)*.16,-5,5);gyroEnabled=true});}catch{gyroEnabled=false}
}
$('#space').addEventListener('pointerdown',requestGyro,{once:true});
// Choose scattered screen positions with breathing room, not unconstrained clusters.
const placedPositions=[];
function scatteredPosition(){
 let best=null,bestGap=-1;
 for(let i=0;i<60;i++){const point={x:.035+Math.random()*.93,y:.10+Math.random()*.81};const gap=placedPositions.length?Math.min(...placedPositions.map(p=>Math.hypot((point.x-p.x)*w/h,point.y-p.y))):1;if(gap>bestGap){best=point;bestGap=gap}}
 placedPositions.push(best);return best;
}
function make(age,text,decorative=false){
 const el=document.createElement('article');el.className='fragment paper-stack';el.style.opacity='1';
 const label=document.createElement('small'),quote=document.createElement('blockquote');quote.className='sr-only';
 const sheet=document.createElement('div');sheet.className='paper torn-piece';sheet.setAttribute('aria-hidden','true');
 const texture=document.createElement('div');texture.className='paper-texture';texture.style.setProperty('--flip-x',Math.random()<.5?-1:1);texture.style.setProperty('--flip-y',Math.random()<.5?-1:1);
 const ink=document.createElement('div');ink.className='paper-ink';const face=document.createElement('div');face.className='paper-face';const distanceShade=document.createElement('div');distanceShade.className='distance-shade';face.append(texture,label,ink,distanceShade);sheet.append(face);el.append(quote,sheet);scene.append(el);
 const index=placedPositions.length,tier=index%5===4?'near':index%4===2?'middle':'far';
 const baseZ=tier==='far'?-450-Math.random()*150:tier==='middle'?-260-Math.random()*150:-80-Math.random()*110;
 const position=scatteredPosition();
 return{el,label,quote,sheets:[{sheet,ink,texture,distanceShade}],age,text,decorative,x:position.x,y:position.y,tier,restScale:tier==='far'?.28+Math.random()*.15:tier==='middle'?.5+Math.random()*.13:.74+Math.random()*.15,restBlur:tier==='far'?4+Math.random()*2:tier==='middle'?1.5+Math.random():.5+Math.random()*.4,phase:Math.random()*20,rate:.012+Math.random()*.014,baseZ,z:baseZ,angle:(Math.random()-.5)*50,size:.82+Math.random()*.35,lift:0,seen:0,exposure:0,textExposure:0,armed:true,anchor:null,version:text,tag:age,ready:null,lucid:false,lucidUntil:0,alignment:1,settled:null}
}
const memories=[...source.slice(0,-1),...saved.map(t=>[null,t])].map(([a,t])=>make(a,t));
const backgroundPapers=Array.from({length:3},()=>make(null,'',true));
const papers=()=>[...memories,...backgroundPapers];let echoes=[];
const readMemories=new Set();let endingStage='explore',endingClock=0,endingPending=false,endingCompanion=false;
const lastMemory=make('83',source[7][1]);lastMemory.el.hidden=true;
function announce(text){$('#announcement').textContent=text}
function begin(){if(started)return;started=true;document.body.classList.add('started');$('#hint').classList.remove('visible');$('#hint').classList.add('dispersed')}
function move(x,y){begin();speed=Math.hypot(x-pointer.x,y-pointer.y);pointer.x=x;pointer.y=y;still=0}
$('#space').addEventListener('pointermove',e=>move(e.clientX,e.clientY));$('#space').addEventListener('pointerdown',e=>move(e.clientX,e.clientY));
addEventListener('resize',()=>{w=innerWidth;h=innerHeight;pointer.x=clamp(pointer.x,0,w);pointer.y=clamp(pointer.y,0,h)});
setTimeout(()=>{if(!started)$('#hint').classList.add('visible');document.body.classList.add('can-control')},500);
setTimeout(()=>$('#hint').classList.remove('visible'),10000);
$('#menu').onclick=()=>{menu=!menu;$('#menu').setAttribute('aria-expanded',menu);document.body.classList.toggle('menu-open',menu)};
addEventListener('keydown',e=>{if(e.key==='Tab'){keyboard=true;document.body.classList.add('keyboard')}if(document.querySelector('dialog[open]')||e.target.matches('textarea,input,button,a'))return;const d={ArrowLeft:[-30,0],ArrowRight:[30,0],ArrowUp:[0,-30],ArrowDown:[0,30]}[e.key];if(d){e.preventDefault();move(clamp(pointer.x+d[0],0,w),clamp(pointer.y+d[1],0,h))}if(e.code==='Space'){e.preventDefault();paused=!paused;announce(paused?'Drifting paused.':'Drifting resumed.')}});
for(const [b,d]of[['#about','#info'],['#leave','#write']])$(b).onclick=()=>$(d).showModal();document.querySelectorAll('.close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#together').onclick=()=>{if(endingStage!=='explore')return;companion=!companion;$('#together').setAttribute('aria-pressed',companion);$('#together span').textContent=companion?'On':'Off';announce(companion?'A simulated companion is wandering independently.':'The companion has left.')};
$('#memory-form').onsubmit=e=>{e.preventDefault();const text=$('#memory').value.trim();if(!text)return;const next=[...saved,text].slice(-12);let stored=true;try{localStorage.setItem('afterglow-memories-en',JSON.stringify(next));saved=next}catch{stored=false}memories.push(make(null,text));$('#memory').value='';$('#write').close();announce(stored?'Your memory is saved on this device.':'Your memory is here for this visit. Device storage is unavailable.');$('#state').textContent=stored?'A memory saved':'A memory for this visit'};

function echo(f){
 const previous=f.lastVisit||{anchor:f.anchor,exposure:f.exposure,text:f.quote.textContent};if(f.seen<1||!previous.anchor||!previous.exposure)return;
 for(let i=0;i<1+(f.seen%2);i++){
 const el=document.createElement('div');el.className='memory-echo fallen-paper';el.setAttribute('aria-hidden','true');el.textContent=previous.text.split(/\s+/).filter((_,j)=>(j+i)%3!==0).join(' ');
 const side=previous.anchor.x>w/2?-1:1;const x=clamp(previous.anchor.x+side*(330+Math.random()*160),30,w-170),y=clamp(previous.anchor.y+100+Math.random()*70,100,h-130);
 el.style.backgroundImage='url("assets/paper-transparent.png")';el.style.left=x+'px';el.style.top=y+'px';el.style.transform=`translateZ(${-650-Math.random()*180}px) rotate(${reduced?0:(Math.random()-.5)*65}deg)`;const echoFont=9+Math.random()*6,echoWidth=Math.min(w-40,Math.round(echoFont*13));el.style.fontSize=echoFont+'px';el.style.width=echoWidth+'px';el.style.minHeight=Math.round(echoFont*11)+'px';el.style.padding=Math.round(echoFont*1.5)+'px';el.style.filter=`blur(${.8+Math.random()*1.5}px)`;scene.append(el);echoes.push(el);if(echoes.length>12)echoes.shift().remove();
 }
}
function letterMistake(token){
 const letters=(token.match(/[a-zA-Z]+/g)||[]).sort((a,b)=>b.length-a.length)[0]||'word';
 const at=Math.floor(Math.random()*Math.max(1,letters.length-1)),kind=Math.floor(Math.random()*3);
 let result=kind===0?letters.slice(0,at)+letters[at+1]+letters[at]+letters.slice(at+2):kind===1?letters.slice(0,at)+letters.slice(at+1):letters.slice(0,at)+letters[at]+letters.slice(at);
 if(result===letters)result=letters.slice(0,at)+letters.slice(at+1);
 return result;
}
function renderPaper(f,stable){
 f.el.classList.toggle('is-lucid',stable);
 const shown=Math.floor(f.version.length*f.textExposure),key=f.version+'|'+shown;
 if(f.paperKey!==key){
 f.quote.textContent=f.version.slice(0,shown);const ink=f.sheets[0].ink;ink.textContent='';
 if(f.fadeVersion!==f.version||f.mistakeVisit!==f.seen){f.fadeVersion=f.version;f.mistakeVisit=f.seen;f.wordFades=[];
 const eligible=(f.version.match(/\S+/g)||[]).map((token,i)=>({token,i})).filter(v=>/[a-zA-Z]{4,}/.test(v.token));
 f.mistakes=new Set();const mistakeCount=Math.min(eligible.length,1+Math.round(Math.random()));for(let n=0;n<mistakeCount;n++){const pick=Math.floor(Math.random()*eligible.length);f.mistakes.add(eligible.splice(pick,1)[0].i);}}

 const tokens=f.quote.textContent.match(/\S+|\s+/g)||[];let index=0;
 for(const token of tokens){const word=document.createElement('span');word.textContent=token;if(/\S/.test(token)){if(f.wordFades[index]===undefined)f.wordFades[index]=.55+Math.random()*.45;word.style.setProperty('--word-fade',f.wordFades[index]);if(f.mistakes.has(index)&&/[a-zA-Z]{4,}/.test(token)){word.textContent='';const original=document.createElement('span');original.className='word-original';original.textContent=token;const error=document.createElement('span');error.className='word-error';error.setAttribute('aria-hidden','true');error.textContent=' '+letterMistake(token);word.append(original,error)}index++;}ink.append(word)}f.paperKey=key}
 const disorder=stable?0:1-clarityMix;
 f.el.style.setProperty('--disorder',disorder);f.el.style.setProperty('--ghost-offset',(1.5+.5*Math.min(1,time/180))+'px');
 const currentlyClear=f===active&&f.lucid;
 if(currentlyClear&&!f.wasClear)f.focusStarted=time;
 f.wasClear=currentlyClear;
 const focusBlur=currentlyClear&&!reduced?2*(1-clamp((time-f.focusStarted)/.6,0,1)):0;

 f.sheets[0].sheet.style.opacity=(f.exposure*(f===active?1:1-clarityMix)).toFixed(3);
 const blur=reduced?0:f.restBlur*(1-f.lift);
 const faded=stable&&!f.lucid?0:1-clarityMix;f.el.style.setProperty('--ink-clarity',f===active?clarityMix:0);f.sheets[0].sheet.style.filter=`blur(${(blur+focusBlur).toFixed(2)}px) grayscale(${(.85*faded).toFixed(3)}) brightness(${(1-.25*faded).toFixed(3)}) saturate(${(1+.25*clarityMix).toFixed(3)}) sepia(${(.1*faded+.15*clarityMix).toFixed(3)})`;
 f.label.style.opacity=f.textExposure;f.sheets[0].distanceShade.style.opacity=((f.tier==='far'?.82:f.tier==='middle'?.52:.23)*(1-f.lift)).toFixed(3);
}
function select(f,x,y){f.revealAfter=time+.55;if(f.decorative){const recalled=source[Math.floor(Math.random()*(source.length-1))];f.age=recalled[0];f.text=recalled[1];f.version=f.text;f.tag=f.age;f.decorative=false;}f.textExposure=0;f.lucidUntil=0;f.focusX=light.x;f.focusY=light.y;f.targetX=tiltX+(Math.random()-.5)*(f.seen?5:1.2);f.targetY=tiltY+(Math.random()-.5)*(f.seen?5:1.2);f.paperKey=null;if(f.seen)echo(f);f.seen++;f.armed=false;f.anchor={x,y};f.exposure=0;f.ready=null;f.lucid=time>=nextLucid;if(f.lucid){nextLucid=time+35;f.lucidUntil=time+8;}const other=source[Math.floor(Math.random()*(source.length-1))];f.tag=f.age&&f.seen%2===0?other[0]:f.age;f.version=f.text;if(!f.lucid){f.version=f.version.replace(/Mum|Dad|she|She/, 'that person…');if(f.seen%2===0)f.version=f.version.split('\n')[0]+'\n'+other[1].split('\n').at(-1);if(f.seen%3===0)f.version+='\nWhat day is it? What day is it?'}active=f;paperSound(.85);}
function releaseMemory(){
 if(!active)return;active.lastVisit={anchor:{...active.anchor},exposure:active.exposure,text:active.quote.textContent};active.anchor=null;active.settled=null;active.lucid=false;active.baseZ=active.tier==='far'?-450-Math.random()*150:active.tier==='middle'?-260-Math.random()*150:-80-Math.random()*110;active.x=clamp(active.x+(Math.random()-.5)*.10,.08,.92);active.y=clamp(active.y+(Math.random()-.5)*.08,.18,.80);active=null;
}
function frame(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;
 const modal=!!document.querySelector('dialog[open]');if(started&&!modal)time+=dt;advanceEnding(dt,modal);if(!['explore','gather'].includes(endingStage)){renderEnding(dt);requestAnimationFrame(frame);return;}if(started&&!paused&&!modal)drift+=dt;still+=dt;speed*=Math.exp(-dt*8);
 const follow=reduced||active?.lucid?1:1-Math.exp(-dt*15);light.x+=(pointer.x-light.x)*follow;light.y+=(pointer.y-light.y)*follow;
 friend.x=w*(.5+.36*Math.sin(drift*.055+1.3));friend.y=h*(.5+.28*Math.sin(drift*.083+2.1));
 const shared=endingStage==='explore'&&started&&companion&&Math.hypot(light.x-friend.x,light.y-friend.y)<125;
 const clear=!!active?.lucid;
 if(clear&&!previousClarity)blinkStart=time;previousClarity=clear;
 const blinkTime=time-blinkStart;
 const blinkAlpha=clear&&!reduced?(blinkTime<.25?blinkTime/.25:blinkTime<.55?1:clamp(1-(blinkTime-.55)/.8,0,1)):0;
 if(clear)clarityMix=reduced?1:clamp((blinkTime-.55)/.8,0,1);else clarityMix=clamp(clarityMix-dt/3,0,1);
 const desiredX=reduced||paused?0:touchDevice?(gyroEnabled?gyroX:0):clamp((.5-pointer.y/h)*10,-5,5);
 const desiredY=reduced||paused?0:touchDevice?(gyroEnabled?gyroY:0):clamp((pointer.x/w-.5)*10,-5,5);
 if(clear){tiltX*=Math.exp(-dt*6);tiltY*=Math.exp(-dt*6)}else{tiltX+=(desiredX-tiltX)*(1-Math.exp(-dt*3))*(1-clarityMix);tiltY+=(desiredY-tiltY)*(1-Math.exp(-dt*3))*(1-clarityMix)}
 scene.style.transform=`rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
 const radius=(Math.max(155,240-time*.1)*(1-clarityMix)+Math.min(450,w*.95)*clarityMix)*(endingStage==='gather'?1-.4*clamp(endingClock/25,0,1):1);const litX=light.x*(1-clarityMix)+w/2*clarityMix,litY=light.y*(1-clarityMix)+h/2*clarityMix;warmth.style.background=started?`radial-gradient(circle ${radius*(.8-.065*clarityMix)}px at ${litX}px ${litY}px,rgba(255,205,140,${.035+.065*clarityMix}),transparent 70%)`:'none';warmth.style.opacity=clarityMix>0?1:clear?1:'';
 for(const [id,p,on]of[['#light',light,started],['#companion',friend,started&&companion]]){const el=$(id);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.opacity=on?(id==='#companion'&&endingStage==='gather'?clamp(1-endingClock/3,0,1):1):0}
 $('#light').style.width=radius*2+'px';$('#light').style.height=radius*2+'px';
 // Original paper + black overlay model. Default gradient is retained verbatim.
 darkness.style.background=started?`radial-gradient(circle ${radius}px at ${light.x}px ${light.y}px,rgba(0,0,0,.15) 0%,rgba(0,0,0,.28) 25%,rgba(0,0,0,.65) 58%,#000 100%)`:'#000';
 if(clarityMix>0)darkness.style.background=`radial-gradient(circle ${radius}px at ${litX}px ${litY}px,rgba(0,0,0,${.15-.11*clarityMix}) 0%,rgba(0,0,0,${.28-.12*clarityMix}) 25%,rgba(0,0,0,${.65-.12*clarityMix}) 58%,rgba(0,0,0,${1-.15*clarityMix}) 100%)`;
 // Two holes in the SAME black veil. Intersect their alpha fields, so overlap is clearest.
 const holes=endingStage==='explore'&&started&&companion&&!clear&&clarityMix===0?`radial-gradient(circle ${radius}px at ${light.x}px ${light.y}px,#0002 0%,#0004 25%,#000a 58%,#000 100%),radial-gradient(circle ${radius*.85}px at ${friend.x}px ${friend.y}px,#0002 0%,#0004 25%,#000a 58%,#000 100%)`:'none';
 darkness.style.maskImage=holes;darkness.style.webkitMaskImage=holes;if(endingStage==='explore'&&started&&companion&&!clear&&clarityMix===0)darkness.style.background='#000';if(blinkAlpha>0)darkness.style.background=`linear-gradient(rgba(0,0,0,${blinkAlpha}),rgba(0,0,0,${blinkAlpha})),${darkness.style.background}`;
 const paperRect=active?.el.getBoundingClientRect();document.body.classList.toggle('light-on-paper',!!paperRect&&light.x>=paperRect.left&&light.x<=paperRect.right&&light.y>=paperRect.top&&light.y<=paperRect.bottom);
 if(shared!==wasShared){$('#shared').textContent=shared?'For a moment, we remember together.':'';announce(shared?'Another light is here. For a moment, we remember together.':'The other light moves away.');wasShared=shared}
 document.body.classList.toggle('edge',started&&(pointer.y<75||pointer.y>h-100));
 // Pointer proximity is the approach gesture: projected edges, not a click or timer.
 const proximityTo=f=>{const r=f.el.getBoundingClientRect();const dx=Math.max(r.left-light.x,0,light.x-r.right),dy=Math.max(r.top-light.y,0,light.y-r.bottom);const distance=Math.hypot(dx,dy);const t=clamp(1-distance/Math.min(240,w*.48),0,1);return t*t*(3-2*t)};
 const approachPaper=started&&!active?papers().filter(f=>!f.el.hidden).map(f=>({f,near:proximityTo(f)})).sort((a,b)=>b.near-a.near||b.f.z-a.f.z)[0]?.f:null;
 const positions=[];const mobile=w<=700;const memoryStart=Math.floor(time/40)%memories.length;const mobileSet=new Set(Array.from({length:5},(_,i)=>memories[(memoryStart+i)%memories.length]));mobileSet.add(backgroundPapers[0]);if(active){mobileSet.add(active);if(mobileSet.size>6){const other=[...mobileSet].find(f=>f!==active&&f!==backgroundPapers[0]);mobileSet.delete(other)}}
 for(const f of papers()){
 const visible=!mobile||mobileSet.has(f);f.el.hidden=!visible;if(!visible){f.lift=0;f.textExposure=0;continue}
 const selected=f===active;const stable=selected&&f.lucid||f.inMeeting;const proximity=proximityTo(f);const targetLift=selected?(stable?1:proximity):(f===approachPaper?proximity*.68:0);
 const previousLift=f.lift;f.lift=reduced?(selected?1:0):f.lift+(targetLift-f.lift)*(1-Math.exp(-dt*(selected?1.8:1.4)));
 f.z=reduced?f.baseZ:f.baseZ*(1-f.lift);if(!selected)f.z-=500*clarityMix;else if(!reduced)f.z+=30*clarityMix;
 const font=stable&&!f.lucid?22:18+4*(selected?clarityMix:0),lucidScale=(1+.3*(selected?clarityMix:0))/(1+4/18*(selected?clarityMix:0)),paperWidth=Math.min(w-40,Math.round(292*font/18*f.size*lucidScale*(f.restScale+(1-f.restScale)*f.lift))),columns=Math.max(10,Math.floor(paperWidth*.65/(font*.6*(f.restScale+(1-f.restScale)*f.lift))));
 const lines=f.version.split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/columns)),0);
 const topPadding=79,bottomPadding=79;const height=Math.max(270*f.size,lines*font*1.5+topPadding+bottomPadding);
 const restFactor=f.restScale+(1-f.restScale)*f.lift;f.el.style.setProperty('--paper-scale',restFactor);f.sheets[0].ink.style.fontSize=(font*restFactor)+'px';f.el.style.width=paperWidth+'px';f.el.style.height=(height*restFactor)+'px';const measuredInk=f.sheets[0].ink.scrollHeight||0;const safeHeight=Math.max(height*restFactor,measuredInk+(topPadding+bottomPadding)*restFactor);f.el.style.height=safeHeight+'px';
 const amplitude=reduced?0:.025+Math.min(.045,time/4000);
 let x=(f.x+Math.sin(drift*f.rate+f.phase)*amplitude)*w,y=(f.y+Math.cos(drift*f.rate*.7+f.phase)*amplitude)*h;
 if(selected&&f.anchor){x=f.anchor.x+(f.focusX-f.anchor.x)*f.lift;y=f.anchor.y+(f.focusY-f.anchor.y)*f.lift}if(stable||selected&&clarityMix>.01){if(!f.settled)f.settled={x,y};x=f.settled.x;y=f.settled.y}else f.settled=null;
 // Counter perspective's pull toward the vanishing point for scattered background centers.
 const projection=1-f.z/1100;
 const parallax=f.tier==='far'?.10:f.tier==='middle'?.42:1;
 const depthShiftX=reduced?0:tiltY*(f.tier==='near'?5:parallax)* (1-f.lift);
 const depthShiftY=reduced?0:-tiltX*(f.tier==='near'?4:parallax)* (1-f.lift);
 x+=depthShiftX;y+=depthShiftY;
 const cancelX=reduced?0:-f.z*Math.sin(tiltY*Math.PI/180)*(1-parallax),cancelY=reduced?0:f.z*Math.sin(tiltX*Math.PI/180)*(1-parallax);const rawX=w/2+(x-w/2)*projection-paperWidth/2+cancelX,rawY=h/2+(y-h/2)*projection-safeHeight/2+cancelY;
 let px=selected?clamp(rawX,20,Math.max(20,w-paperWidth-20)):rawX,py=selected?clamp(rawY,75,Math.max(75,h-height-90)):rawY;
 if(selected&&clarityMix>0){px=px*(1-clarityMix)+(w-paperWidth)/2*clarityMix;py=py*(1-clarityMix)+(h-safeHeight)/2*clarityMix;}
 const chaosAmount=(stable?0:1-clarityMix)*(1+Math.min(1,time/180)*.25);
 const swayPhase=drift*(Math.PI*2/(6+f.phase%3))+f.phase;
 const swayX=reduced||paused?0:Math.sin(swayPhase)*3*chaosAmount,swayY=reduced||paused?0:Math.cos(swayPhase*.93)*3*chaosAmount,swayAngle=reduced||paused?0:Math.sin(swayPhase*.87)*Math.min(4,3.2*chaosAmount);
 f.el.style.transform=`translate3d(${px+swayX}px,${py+swayY}px,${f.z.toFixed(2)}px) rotate(${reduced?0:f.angle*(1-f.lift)+swayAngle}deg)`;
 // Distant surfaces remain original paper; distance reduces their projected size only.
 const rect=f.el.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 const overPaper=light.x>=rect.left&&light.x<=rect.right&&light.y>=rect.top&&light.y<=rect.bottom;const arrivalHold=selected&&f.lift<.97&&Math.hypot(light.x-f.focusX,light.y-f.focusY)<85;const inside=overPaper||arrivalHold;
 const distance=Math.hypot(cx-light.x,cy-light.y);f.inMeeting=shared&&distance<radius*.85&&Math.hypot(cx-friend.x,cy-friend.y)<radius*.85;
 f.exposure=started?Math.min(1,f.exposure+dt*1.2):0;if(endingStage==='gather'){const index=papers().indexOf(f);f.exposure=1-clamp((endingClock-index*2)/2.5,0,1);f.z-=Math.max(0,endingClock-index*2)*35;f.el.style.transform+=` translateZ(${-Math.max(0,endingClock-index*2)*35}px)`;}
 if(selected){
 if(f.lucid&&time>=f.lucidUntil){f.lucid=false;f.settled=null}
 if(!f.lucid&&time>=nextLucid){f.lucid=true;f.lucidUntil=time+8;f.version=f.text;f.tag=f.age;f.paperKey=null;nextLucid=time+40;announce('A clear moment. '+f.text)}
 if(f.inMeeting){f.version=f.text;f.tag=f.age;if(time>=f.revealAfter)f.textExposure=1}
 if(inside&&time>=f.revealAfter)f.textExposure=Math.min(1,f.textExposure+dt*.65);else if(!f.lucid)f.textExposure=Math.max(0,f.textExposure-dt*.7);
 if(f.textExposure===1&&f.ready===null){f.ready=time;readMemories.add(f.text);announce(f.version)}
 if(!inside&&distance>radius*.7&&!f.lucid&&clarityMix<.01)releaseMemory();
 }else f.textExposure=Math.max(0,f.textExposure-dt*.6);
 const labelKey=[f.tag,f.age,stable].join('|');if(f.labelKey!==labelKey){f.label.textContent='';if(f.age&&f.tag!==f.age&&!stable){const old=document.createElement('s');old.textContent=f.age;old.className='age-correction';f.label.append(old,document.createTextNode(' '+f.tag+' years'));}else f.label.textContent=f.age?`${stable?f.age:f.tag} years`:f.decorative?'':'a shared memory';f.labelKey=labelKey;}
 
 renderPaper(f,stable);positions.push({f,x,y,inside,distance});
 }
 if(endingStage==='explore'&&started&&!active&&!modal){
 const held=positions.find(p=>p.f===dwell&&p.inside);const candidate=held||positions.filter(p=>p.inside).sort((a,b)=>b.f.z-a.f.z||a.distance-b.distance)[0];
 if(candidate&&candidate.f===dwell){if(time-dwellSince>=.5&&papers().every(f=>f.lift<.85))select(candidate.f,candidate.x,candidate.y)}else{dwell=candidate?.f||null;dwellSince=time}
 }else{dwell=null;dwellSince=time}
 if(endingStage==='gather')for(const el of echoes)el.style.opacity=(.015*(1-clamp(endingClock/25,0,1))).toFixed(4);document.body.classList.toggle('reading',!!active);updateAtmosphere(shared,dt);updateSoundscape();requestAnimationFrame(frame)
}requestAnimationFrame(frame);

// State-based atmosphere. All ambient traces are decorative and bounded.
const depth=document.createElement('div');depth.id='depth';depth.setAttribute('aria-hidden','true');$('#space').prepend(depth);
const fusion=document.createElement('div');fusion.id='fusion';fusion.setAttribute('aria-hidden','true');$('#space').append(fusion);
let lastTrace=-10,lastGlint=-10,warmUntil=0,nextWarm=30+Math.random()*20;
function transient(className,x,y,text,duration){const el=document.createElement('div');el.className=className;el.textContent=text;el.style.left=x+'px';el.style.top=y+'px';depth.append(el);setTimeout(()=>el.remove(),duration);while(depth.children.length>24)depth.firstElementChild.remove()}
function updateAtmosphere(shared,dt){
 const clear=!!active?.lucid;const chaos=started&&!clear&&!shared;
 // Make a quiet reading pocket around the current memory, including rotated echoes.
 const reading=active?.el.getBoundingClientRect();
 for(const el of echoes){const box=el.getBoundingClientRect();const close=reading&&box.right>reading.left-65&&box.left<reading.right+65&&box.bottom>reading.top-45&&box.top<reading.bottom+45;el.classList.toggle('near-reading',!!close);}

 document.body.classList.toggle('clarity',clear);document.body.classList.toggle('confused',chaos);document.body.classList.toggle('meeting',shared);
 if(time>nextWarm){warmUntil=time+6;nextWarm=time+35+Math.random()*35}
 const warm=time<warmUntil;const cool=clamp(time/240,0,1);const rgb=clear?'241,244,232':chaos?'180,187,193':warm?'245,175,104':`${Math.round(231-74*cool)},${Math.round(216-31*cool)},${Math.round(163+43*cool)}`;
 document.body.style.setProperty('--light-rgb',rgb);document.body.style.setProperty('--memory-ink',clear?'#eeeede':warm?'#dcc09a':`rgb(${Math.round(201-30*cool)},${Math.round(201-17*cool)},${Math.round(187+7*cool)})`);
 fusion.style.left=((light.x+friend.x)/2)+'px';fusion.style.top=((light.y+friend.y)/2)+'px';fusion.style.opacity=shared?1:0;
 if(started&&!clear&&!reduced&&time-lastTrace>1.8){transient('old-light',light.x,light.y,'',11000);lastTrace=time}
 if(started&&!clear&&time-lastGlint>5){const x=25+Math.random()*(w-50),y=90+Math.random()*Math.max(30,h-200);if(Math.hypot(x-light.x,y-light.y)>200){transient('distant-letter',x,y,['m','…','h','w','you','a'][Math.floor(Math.random()*6)],9000);lastGlint=time}}
}


// Procedural soundscape: created only after the visitor enables Sound.
let roomGain,noiseBuffer,rustleBuffer,roomSource,audioQuiet=null,lastTypingAt=0,lastRustleAt=0,audioMemory=null,audioChars=0;
function initSoundscape(){
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)throw new Error('Audio unavailable');
 audio=new Context();gain=audio.createGain();gain.gain.value=0;gain.connect(audio.destination);
 noiseBuffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);
 const data=noiseBuffer.getChannelData(0);let brown=0;
 for(let i=0;i<data.length;i++){brown=(brown+(.02*(Math.random()*2-1)))/1.02;data[i]=brown*3.5;}
 rustleBuffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate);
 const rustle=rustleBuffer.getChannelData(0);let softened=0;
 for(let i=0;i<rustle.length;i++){softened=softened*.4+(Math.random()*2-1)*.6;rustle[i]=softened;}
 roomSource=audio.createBufferSource();roomSource.buffer=noiseBuffer;roomSource.loop=true;
 const low=audio.createBiquadFilter();low.type='lowpass';low.frequency.value=650;low.Q.value=.25;
 const high=audio.createBiquadFilter();high.type='highpass';high.frequency.value=65;
 roomGain=audio.createGain();roomGain.gain.value=0;
 roomSource.connect(high);high.connect(low);low.connect(roomGain);roomGain.connect(gain);roomSource.start();
}
function soundAllowed(){return sound&&audio?.state==='running'&&!document.hidden&&!active?.lucid&&!document.querySelector('dialog[open]')}
function paperSound(strength){
 if(!soundAllowed())return;lastRustleAt=audio.currentTime;
 const t=audio.currentTime,src=audio.createBufferSource(),filter=audio.createBiquadFilter(),envelope=audio.createGain();
 src.buffer=rustleBuffer;src.playbackRate.value=.85+Math.random()*.25;
 filter.type='bandpass';filter.frequency.value=1400+Math.random()*500;filter.Q.value=.65;
 envelope.gain.setValueAtTime(.0001,t);envelope.gain.linearRampToValueAtTime(.16*strength,t+.07);envelope.gain.linearRampToValueAtTime(.045*strength,t+.16);envelope.gain.linearRampToValueAtTime(.12*strength,t+.24);envelope.gain.exponentialRampToValueAtTime(.0001,t+.55);
 src.connect(filter);filter.connect(envelope);envelope.connect(gain);src.start(t,Math.random()*.6);src.stop(t+.6);
 src.onended=()=>{src.disconnect();filter.disconnect();envelope.disconnect()};
}
function typeSound(){
 if(!soundAllowed()||audio.currentTime-lastTypingAt<.16)return;lastTypingAt=audio.currentTime;
 const t=audio.currentTime,src=audio.createBufferSource(),filter=audio.createBiquadFilter(),envelope=audio.createGain();
 src.buffer=noiseBuffer;src.playbackRate.value=2.8;
 filter.type='highpass';filter.frequency.value=1200+Math.random()*800;
 envelope.gain.setValueAtTime(.055,t);envelope.gain.exponentialRampToValueAtTime(.0001,t+.024);
 src.connect(filter);filter.connect(envelope);envelope.connect(gain);src.start(t,Math.random());src.stop(t+.03);
 src.onended=()=>{src.disconnect();filter.disconnect();envelope.disconnect()};
 const key=audio.createOscillator(),body=audio.createGain();key.type='sine';key.frequency.setValueAtTime(190+Math.random()*80,t);key.frequency.exponentialRampToValueAtTime(95,t+.025);body.gain.setValueAtTime(.007,t);body.gain.exponentialRampToValueAtTime(.0001,t+.035);key.connect(body);body.connect(gain);key.start(t);key.stop(t+.04);key.onended=()=>{key.disconnect();body.disconnect()};
}
function updateSoundscape(){
 if(!audio)return;
 const quiet=!['explore','gather'].includes(endingStage)||!!active?.lucid||document.hidden||!!document.querySelector('dialog[open]');
 if(endingStage==='gather')roomGain.gain.setTargetAtTime(.055*(1-clamp(endingClock/25,0,1)),audio.currentTime,.5);
 if(quiet!==audioQuiet){roomGain.gain.setTargetAtTime(quiet?0:.055,audio.currentTime,quiet?.12:1.6);audioQuiet=quiet;}
 if(active!==audioMemory){audioMemory=active;audioChars=0;}
 if(active){const count=Math.floor(active.version.length*active.textExposure);if(count-audioChars>=3){if(!quiet)typeSound();audioChars=count;}}
}
$('#sound').onclick=async()=>{
 try{if(!audio)initSoundscape();await audio.resume();sound=!sound;
 gain.gain.cancelScheduledValues(audio.currentTime);gain.gain.setTargetAtTime(sound&&!document.hidden?.45:0,audio.currentTime,.18);
 $('#sound').setAttribute('aria-pressed',sound);$('#sound span').textContent=sound?'On':'Off';audioQuiet=null;updateSoundscape();
 }catch{sound=false;if(gain&&audio)gain.gain.setTargetAtTime(0,audio.currentTime,.05);$('#sound').setAttribute('aria-pressed','false');$('#sound span').textContent='Off';announce('Sound is unavailable.');}
};
document.addEventListener('visibilitychange',()=>{if(!audio)return;gain.gain.setTargetAtTime(sound&&!document.hidden?.45:0,audio.currentTime,.12);updateSoundscape()});

// One-way ending. Its clock pauses for dialogs and hidden tabs, just like exploration.
function endingPhase(stage){endingStage=stage;endingClock=0;document.body.classList.add('ending');document.body.classList.toggle('ending-black',stage==='black'||stage==='invitation');if(stage==='arrival'){lastMemory.el.hidden=false;active=lastMemory;lastMemory.lucid=true;lastMemory.version=lastMemory.text;lastMemory.tag='83';lastMemory.exposure=1;lastMemory.textExposure=0;lastMemory.paperKey=null;lastMemory.seen=1;lastMemory.lift=0;lastMemory.focusStarted=time;announce("You're here.");}if(stage==='invitation'){document.body.classList.add('ending-invitation');$('#ending-invite').hidden=false;$('#ending-leave').focus();announce('Leave a little light for the next person.');}}
function advanceEnding(dt,modal){
 if(!started||modal||document.hidden)return;
 if(endingStage==='explore'){
 if(readMemories.size>=6||time>=240)endingPending=true;
 const revealing=active&&(active.textExposure<1||active.ready===null||time-active.ready<2);
 if(endingPending&&!revealing){endingCompanion=companion;releaseMemory();endingPhase('gather');dwell=null;$('#hint').classList.remove('visible');$('#shared').textContent='';}
 return;}
 endingClock+=dt;
 const durations={gather:25,arrival:6,hold:7,fade:10,black:3};
 if(endingClock>=durations[endingStage]){const next={gather:'arrival',arrival:'hold',hold:'fade',fade:'black',black:'invitation'}[endingStage];if(endingStage==='gather'){companion=false;$('#together').setAttribute('aria-pressed','false');$('#together span').textContent='Off';papers().forEach(f=>f.el.hidden=true);echoes.forEach(el=>el.hidden=true)}if(next)endingPhase(next);}
}
function renderEnding(dt){
 const phase=endingStage,t=endingClock,arrival=phase==='arrival'?clamp(t/6,0,1):1,fade=phase==='fade'?clamp(t/10,0,1):0,black=phase==='black'||phase==='invitation';
 light.x+=(pointer.x-light.x)*(reduced?1:1-Math.exp(-dt*10));light.y+=(pointer.y-light.y)*(reduced?1:1-Math.exp(-dt*10));
 const f=lastMemory,warm=black?0:(phase==='arrival'?arrival:1-fade);clarityMix=warm;
 document.body.classList.toggle('clarity',warm>.5&&!black);document.body.classList.remove('confused','meeting');
 scene.style.transform='none';$('#companion').style.opacity=0;$('#fusion').style.opacity=0;$('#depth').style.opacity=0;
 const paperW=Math.min(w-40,340),columns=Math.max(12,Math.floor(paperW*.65/13.2)),lines=f.text.split('\n').reduce((sum,line)=>sum+Math.ceil(line.length/columns),0),paperH=Math.max(310,lines*33+158);
 f.el.style.width=paperW+'px';f.el.style.height=paperH+'px';f.el.style.setProperty('--paper-scale',1);
 const px=clamp(light.x-paperW/2,20,Math.max(20,w-paperW-20)),py=clamp(light.y-paperH/2,55,Math.max(55,h-paperH-65));
 const z=reduced?0:phase==='arrival'?-500*(1-arrival):phase==='fade'?-600*fade:0;
 f.z=z;f.lift=1;f.el.style.transform=`translate3d(${px}px,${py}px,${z}px)`;f.el.hidden=black;
 f.exposure=black?0:phase==='arrival'?arrival:1-fade;
 const endingWords=phase==='arrival'?Math.floor(f.text.length*arrival):phase==='fade'?Math.ceil(f.text.length-(f.text.length-12)*Math.min(1,fade/.75)):f.text.length;
 const content=phase==='fade'&&fade>.75?f.text.slice(0,12):f.text.slice(0,endingWords);
 f.quote.textContent=content;f.sheets[0].ink.textContent=content;f.sheets[0].ink.style.fontSize='22px';f.sheets[0].ink.style.color='#2b1d12';f.sheets[0].ink.style.textShadow='none';
 f.textExposure=f.text.length?content.length/f.text.length:0;f.label.textContent='83 years';f.label.style.opacity=f.exposure;
 f.sheets[0].sheet.style.opacity=f.exposure;f.sheets[0].distanceShade.style.opacity=0;f.el.classList.add('is-lucid');f.el.style.setProperty('--disorder',0);
 f.sheets[0].sheet.style.filter=`grayscale(${.85*(1-warm)}) saturate(${1+.25*warm}) sepia(${.1+.05*warm})`;
 const radius=black?0:phase==='fade'?Math.max(0,260*(1-fade)):phase==='arrival'?140+120*arrival:260;
 darkness.style.maskImage='none';darkness.style.webkitMaskImage='none';
 darkness.style.background=black?'#000':`radial-gradient(circle ${radius}px at ${light.x}px ${light.y}px,rgba(0,0,0,${.15-.1*warm}) 0%,rgba(0,0,0,.28) 25%,rgba(0,0,0,.65) 58%,#000 100%)`;
 warmth.style.opacity=black?0:1;warmth.style.background=`radial-gradient(circle ${radius*.75}px at ${light.x}px ${light.y}px,rgba(255,205,140,${.1*warm}),transparent 70%)`;
 $('#light').style.opacity=0;updateSoundscape();
}
$('#ending-leave').onclick=()=>$('#write').showModal();
