'use strict';
/* Небесный Престол — бой: расчёт ходов и анимация на холсте */
const BT=(()=>{
let B=null,raf=0,cv,cx,W=0,H=0,lastT=0;
const FOOT=.895,POS={A:[[.32,.63],[.68,.63],[.17,.8],[.5,.83],[.83,.8]],E:[[.32,.41],[.68,.41],[.17,.24],[.5,.21],[.83,.24]]};
const el=s=>document.querySelector(s);
const rgba=ART.rgba;

function mk(sp,side,slot){return Object.assign({},sp,{side,slot,mhp:sp.mhp||sp.hp,hp:sp.hp,vhp:sp.hp,dhp:sp.hp,en:0,g:Math.random()*25,alive:true,stun:0,burn:0,burnT:0,shield:0,dmg:0,heal:0,fade:1,flash:0,q:false,mv:null})}
function start(cfg){
 B={cfg,U:[],acts:0,max:cfg.max||160,auto:!!S.set.auto,spd:Math.min(4,S.set.spd||1),over:false,tm:0,busy:1.25,fx:[],parts:[],txt:[],proj:[],rings:[],beams:[],cut:null,shake:0,dsum:{A:0,E:0},th:cfg.theme||THEMES[0],pause:false,maxHit:0,intro:{t0:0,dur:1.15,t:cfg.intro||'Бой!',sub:cfg.title||'',boss:cfg.enemies.some(u=>u&&u.big)}};
 clearInterval(anxI);
 cfg.allies.forEach((s,i)=>s&&B.U.push(mk(s,'A',i)));cfg.enemies.forEach((s,i)=>s&&B.U.push(mk(s,'E',i)));
 B.U.forEach(u=>{u.spr=ART.sprite(u,u.big?190:130)});
 const ov=el('#battle');ov.hidden=false;cv=el('#bc');cx=cv.getContext('2d');
 el('#bres').hidden=true;el('#btitle').textContent=cfg.title||'';
 hud();resize();lastT=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
 music('battle');
}
let anxI=0;
function resize(){if(!cv)return;const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=Math.round(W*ART.DPR);cv.height=Math.round(H*ART.DPR)}
function pos(u){if(u.big&&u.side=='E')return{x:W*.5,y:H*.3};const p=POS[u.side][u.slot];return{x:W*p[0],y:H*p[1]}}
const alive=side=>B.U.filter(u=>u.side==side&&u.alive);
const foeOf=u=>u.side=='A'?'E':'A';

/* ---------- расчёт ---------- */
function nextActor(){
 const q=B.U.find(u=>u.alive&&u.q&&u.en>=100);if(q){q.q=false;return{u:q,force:true}}
 let best=null,bt=1e9;for(const u of B.U){if(!u.alive)continue;const t=(100-u.g)/u.spd;if(t<bt){bt=t;best=u}}
 for(const u of B.U)if(u.alive)u.g+=u.spd*bt;best.g-=100;return{u:best,force:false};
}
function adv(a,b){if(!a.fac||!b.fac)return 1;if(BEATS[a.fac]==b.fac)return 1.25;if(BEATS[b.fac]==a.fac)return .85;return 1}
function calc(a,b,mult,crit){const mit=Math.min(.75,b.def/(b.def+a.atk*1.6)),av=adv(a,b);let d=a.atk*mult*(1-mit)*av*(.92+Math.random()*.16);const cr=crit||Math.random()<a.crit;if(cr)d*=1.6;return{d:Math.max(1,Math.round(d)),cr,av}}
function hit(src,t,d,ev,o){o=o||{};let dd=d;if(t.shield>0){const s=Math.min(t.shield,dd);t.shield-=s;dd-=s}t.hp=Math.max(0,t.hp-dd);
 if(src){src.dmg+=d;B.dsum[src.side]+=d;if(src.side=='A'&&d>B.maxHit)B.maxHit=d}t.en=Math.min(100,t.en+8);
 ev.push({t:'hit',src,tgt:t,d,cr:o.cr,av:o.av,burn:o.burn,hp:t.hp});
 if(t.hp<=0&&t.alive){t.alive=false;ev.push({t:'die',u:t})}}
function heal(src,t,n,ev){if(!t.alive)return;const h=Math.min(n,t.mhp-t.hp);t.hp+=h;if(src)src.heal+=h;ev.push({t:'heal',tgt:t,d:Math.round(n),hp:t.hp})}
function pick(u){const a=alive(foeOf(u));if(!a.length)return null;
 if(u.cls=='asn')return a.slice().sort((x,y)=>((y.slot>=2||y.big)-(x.slot>=2||x.big))||x.hp-y.hp)[0];
 const f=a.filter(x=>x.slot<2&&!x.big);const L=f.length?f:a;return L[Math.floor(Math.random()*L.length)]}
function step(){
 const{u,force}=nextActor();B.acts++;const ev=[];ev.actor=u;
 if(u.burnT>0){u.burnT--;hit(null,u,Math.round(u.burn),ev,{burn:1});if(!u.alive)return ev}
 if(u.stun>0){u.stun--;ev.push({t:'txt',u,s:'Оглушён',c:'#ffd35a'});return ev}
 if(u.en>=100&&(force||u.side=='E'||B.auto))ult(u,ev);else basic(u,ev);
 return ev;
}
function basic(u,ev){
 if(u.cls=='hea'){const w=alive(u.side).sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp)[0];if(w&&w.hp/w.mhp<.7){ev.push({t:'shoot',src:u,tgt:w,heal:1});heal(u,w,u.atk*1.5,ev);u.en=Math.min(100,u.en+34);return}}
 const t=pick(u);if(!t)return;const ranged=u.cls=='mag'||u.cls=='arc'||u.cls=='hea';
 ev.push({t:ranged?'shoot':'lunge',src:u,tgt:t});const r=calc(u,t,1);hit(u,t,r.d,ev,{cr:r.cr,av:r.av});
 if(u.fac=='dem')heal(null,u,r.d*.12,ev);u.en=Math.min(100,u.en+34);
}
function ult(u,ev){
 u.en=0;ev.push({t:'ult',u});const foe=foeOf(u),k=(u.ultM||1)*(u.fac=='sol'?1.2:1);
 if(u.cls=='war'){const t=pick(u);if(t){ev.push({t:'slam',src:u,tgt:t});const r=calc(u,t,2.6*k);hit(u,t,r.d,ev,{cr:r.cr,av:r.av});if(t.alive&&Math.random()<.6){t.stun=1;ev.push({t:'txt',u:t,s:'Оглушение',c:'#ffd35a'})}}u.shield+=Math.round(u.mhp*.12)}
 else if(u.cls=='mag'){ev.push({t:'nova',src:u,side:foe});for(const t of alive(foe)){const r=calc(u,t,1.35*k);hit(u,t,r.d,ev,{cr:r.cr,av:r.av})}}
 else if(u.cls=='arc'){const t=alive(foe).sort((a,b)=>a.hp-b.hp)[0];if(t){ev.push({t:'beam',src:u,tgt:t});const r=calc(u,t,3.4*k);hit(u,t,r.d,ev,{cr:r.cr,av:r.av})}}
 else if(u.cls=='asn'){const a=alive(foe),t=a.filter(x=>x.slot>=2||x.big).sort((x,y)=>x.hp-y.hp)[0]||a[0];if(t){ev.push({t:'blink',src:u,tgt:t});for(let i=0;i<2&&t.alive;i++){const r=calc(u,t,1.5*k,true);hit(u,t,r.d,ev,{cr:true,av:r.av})}}}
 else if(u.cls=='hea'){ev.push({t:'bless',src:u});for(const t of alive(u.side)){heal(u,t,u.atk*2.4*k,ev);t.shield+=Math.round(u.atk*.8)}}
 const tg=ev.filter(e=>e.t=='hit'&&e.src==u);
 if(u.fac=='plm')tg.forEach(e=>{if(e.tgt.alive){e.tgt.burn=u.atk*.35;e.tgt.burnT=2}});
 if(u.fac=='vol')tg.forEach(e=>{e.tgt.g=Math.max(0,e.tgt.g-35)});
 if(u.fac=='les')heal(u,u,u.mhp*.1,ev);
 if(u.fac=='ang')alive(u.side).forEach(t=>t.shield+=Math.round(u.atk*.5));
 if(u.fac=='dem'){const s=tg.reduce((a,e)=>a+e.d,0);heal(u,u,s*.3,ev)}
}
function check(){if(!alive('E').length)return'win';if(!alive('A').length)return'lose';if(B.acts>=B.max)return'time';return null}

/* ---------- анимация хода ---------- */
const at=(t,fn)=>B.fx.push({t,fn});
function play(ev){
 const t0=B.tm;let off=0,imp=.18;
 const ul=ev.find(e=>e.t=='ult');
 if(ul){const a=ul.u;if(a.side=='A'||a.big){B.cut={u:a,t0,dur:.9};off=.9;sfx('ult');if(a.side=='A')haptic(25)}else{at(t0,()=>ring(a,'#ffffff',1.2));off=.22}}
 for(const e of ev){const s=t0+off;
  if(e.t=='lunge'||e.t=='slam')at(s,()=>{e.src.mv={t0:B.tm,dur:.38,to:e.tgt,k:e.t=='slam'?.85:.7};if(e.t=='slam')B.shake=8});
  if(e.t=='blink')at(s,()=>{e.src.mv={t0:B.tm,dur:.42,to:e.tgt,k:.9,blink:1}});
  if(e.t=='shoot'){at(s,()=>proj(e.src,e.tgt,e.heal?'#7dffb0':col(e.src)));imp=.22}
  if(e.t=='beam'){at(s,()=>beam(e.src,e.tgt));imp=.16}
  if(e.t=='nova'){at(s,()=>nova(e.src,e.side));imp=.32}
  if(e.t=='bless'){at(s,()=>alive(e.src.side).forEach(u=>ring(u,'#7dffb0',1)));imp=.22}
 }
 let n=0;
 for(const e of ev){const s=t0+off+imp+n*.055;
  if(e.t=='hit'){n++;at(s,()=>{e.tgt.vhp=e.hp;e.tgt.flash=1;const mk=e.av>1?'▲':e.av<1?'▼':'';text(e.tgt,mk+fmt(e.d)+(e.cr?'!':''),e.burn?'#ff9a4a':e.cr?'#ffd35a':e.av>1?'#ffb87a':e.av<1?'#a8b4cc':'#ffffff',e.cr?1.35:1);burst(e.tgt,e.src?col(e.src):'#ff9a4a',e.cr?14:8);if(e.cr){B.shake=Math.max(B.shake,5);if(e.src&&e.src.side=='A')haptic(8)}sfx(e.cr?'crit':'hit')})}
  if(e.t=='heal'){n++;at(s,()=>{e.tgt.vhp=e.hp;text(e.tgt,'+'+fmt(e.d),'#7dffb0',1)})}
  if(e.t=='txt')at(s,()=>text(e.u,e.s,e.c,.9));
  if(e.t=='die')at(s+.08,()=>{e.u.dying=1;burst(e.u,'#ffffff',18)});
 }
 return off+imp+n*.055+.3;
}
function col(u){return u.fac?FAC[u.fac].c:'#f3cb6b'}
function ring(u,c,s){const p=pos(u);B.rings.push({x:p.x,y:p.y-szOf(u)*.5,c,t0:B.tm,dur:.5,s:s||1})}
function proj(a,b,c){const p=pos(a),q=pos(b);B.proj.push({x0:p.x,y0:p.y-szOf(a)*.7,x1:q.x,y1:q.y-szOf(b)*.6,c,t0:B.tm,dur:.22})}
function beam(a,b){const p=pos(a),q=pos(b);B.beams.push({x0:p.x,y0:p.y-szOf(a)*.7,x1:q.x,y1:q.y-szOf(b)*.6,c:col(a),t0:B.tm,dur:.45})}
function nova(a,side){const c=col(a);alive(side).forEach(u=>{const p=pos(u);for(let i=0;i<5;i++)B.parts.push({x:p.x+(Math.random()-.5)*60,y:-20-Math.random()*80,vx:0,vy:900,life:.35,max:.35,c,r:3.5,star:1});setTimeout(()=>{},0);B.rings.push({x:p.x,y:p.y-szOf(u)*.4,c,t0:B.tm+.25,dur:.5,s:1.4})})}
function burst(u,c,n){const p=pos(u),y=p.y-szOf(u)*.55;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=60+Math.random()*160;B.parts.push({x:p.x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:.5,max:.5,c,r:1.5+Math.random()*2.5})}}
function text(u,s,c,sc){const p=pos(u);B.txt.push({x:p.x+(Math.random()-.5)*20,y:p.y-szOf(u)*1.05,s,c,sc:sc||1,t0:B.tm,dur:.9})}
const szOf=u=>W*(u.big?.4:u.look&&u.look.kind=='mon'?.22:.27)*(u.main?1.06:1);

/* ---------- кадр ---------- */
function loop(t){
 if(!B){return}
 const dt0=Math.min(.05,(t-lastT)/1000);lastT=t;const dt=B.pause?0:dt0;const sp=B.over?1:B.spd;B.tm+=dt*sp;
 if(cv.clientWidth&&Math.abs(cv.clientWidth-W)>1)resize();
 B.fx.sort((a,b)=>a.t-b.t);while(B.fx.length&&B.fx[0].t<=B.tm)B.fx.shift().fn();
 if(!B.over&&!B.cut&&B.tm>=B.busy&&!B.fx.length){const r=check();if(r)finish(r);else B.busy=B.tm+play(step())}
 draw(dt*sp);updHud();if(B.pause)pauseOv();raf=requestAnimationFrame(loop);
}
function draw(dt){
 cx.setTransform(ART.DPR,0,0,ART.DPR,0,0);
 const sh=B.shake;if(sh>0){cx.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);B.shake=Math.max(0,sh-dt*40)}
 ART.bg(cx,W,H,B.th,'battle',B.tm);
 {const v=cx.createRadialGradient(W/2,H*.5,H*.25,W/2,H*.5,H*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');cx.fillStyle=v;cx.fillRect(0,0,W,H)}
 const us=[...B.U].sort((a,b)=>pos(a).y-pos(b).y);
 for(const u of us)unitDraw(u,dt);
 for(let i=B.rings.length-1;i>=0;i--){const r=B.rings[i],p=(B.tm-r.t0)/r.dur;if(p<0)continue;if(p>=1){B.rings.splice(i,1);continue}cx.beginPath();cx.ellipse(r.x,r.y,(20+70*p)*r.s,(8+28*p)*r.s,0,0,Math.PI*2);cx.lineWidth=4*(1-p);cx.strokeStyle=rgba(r.c,1-p);cx.stroke()}
 for(let i=B.beams.length-1;i>=0;i--){const b=B.beams[i],p=(B.tm-b.t0)/b.dur;if(p>=1){B.beams.splice(i,1);continue}cx.save();cx.lineCap='round';cx.shadowColor=b.c;cx.shadowBlur=18;cx.beginPath();cx.moveTo(b.x0,b.y0);cx.lineTo(b.x1,b.y1);cx.lineWidth=10*(1-p);cx.strokeStyle=rgba(b.c,.7*(1-p));cx.stroke();cx.lineWidth=3*(1-p);cx.strokeStyle='rgba(255,255,255,.95)';cx.stroke();cx.restore()}
 for(let i=B.proj.length-1;i>=0;i--){const q=B.proj[i],p=(B.tm-q.t0)/q.dur;if(p>=1){B.proj.splice(i,1);continue}const x=q.x0+(q.x1-q.x0)*p,y=q.y0+(q.y1-q.y0)*p-Math.sin(p*Math.PI)*30;cx.save();cx.shadowColor=q.c;cx.shadowBlur=14;cx.beginPath();cx.arc(x,y,5,0,Math.PI*2);cx.fillStyle='#ffffff';cx.fill();cx.beginPath();cx.arc(x,y,9,0,Math.PI*2);cx.fillStyle=rgba(q.c,.45);cx.fill();cx.restore()}
 cx.save();cx.globalCompositeOperation='lighter';
 for(let i=B.parts.length-1;i>=0;i--){const p=B.parts[i];p.life-=dt;if(p.life<=0){B.parts.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.star?0:260*dt;const a=p.life/p.max;cx.beginPath();cx.arc(p.x,p.y,p.r*(p.star?1.6:a),0,Math.PI*2);cx.fillStyle=rgba(p.c,a);cx.fill()}
 cx.restore();
 if(B.intro&&!B.pause){const it=B.intro,p=(B.tm-it.t0)/it.dur;if(p>=1)B.intro=null;else{const a=p<.18?p/.18:p>.75?(1-p)/.25:1,sl=(1-Math.min(1,p/.2))*W*.3;cx.save();cx.globalAlpha=a;
  const g=cx.createLinearGradient(0,0,W,0),c0=it.boss?'#a8201a':'#8a6a24';g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.2,rgba(c0,.85));g.addColorStop(.8,rgba(c0,.85));g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(0,H*.4,W,H*.13);
  cx.textAlign='center';cx.font=`${Math.round(W*.12)}px Forum,serif`;cx.lineWidth=5;cx.strokeStyle='rgba(10,6,4,.9)';cx.strokeText(it.boss?'Босс!':it.t,W/2+sl,H*.475);cx.fillStyle=it.boss?'#ffd0c0':'#fff3c8';cx.fillText(it.boss?'Босс!':it.t,W/2+sl,H*.475);
  cx.font=`500 ${Math.round(W*.036)}px Rubik,sans-serif`;cx.fillStyle='#f0e6cc';cx.fillText(it.sub,W/2-sl,H*.515);cx.restore()}}
 for(let i=B.txt.length-1;i>=0;i--){const x=B.txt[i],p=(B.tm-x.t0)/x.dur;if(p>=1){B.txt.splice(i,1);continue}const s=Math.round(W*.05*x.sc*(p<.15?.6+p*2.7:1));cx.font=`800 ${s}px Rubik,system-ui,sans-serif`;cx.textAlign='center';cx.globalAlpha=p>.7?(1-p)/.3:1;cx.lineWidth=4;cx.strokeStyle='rgba(8,6,24,.9)';cx.strokeText(x.s,x.x,x.y-p*40);cx.fillStyle=x.c;cx.fillText(x.s,x.x,x.y-p*40);cx.globalAlpha=1}
 if(B.cut)cutIn();
}
function unitDraw(u,dt){
 if(u.dying)u.fade=Math.max(0,u.fade-dt*1.8);if(u.fade<=0)return;
 const p=pos(u),sz=szOf(u),hh=sz*1.3;let x=p.x,y=p.y;
 if(u.mv){const m=u.mv,k=(B.tm-m.t0)/m.dur;if(k>=1)u.mv=null;else{const q=pos(m.to),e=k<.45?1-Math.pow(1-k/.45,3):k<.6?1:1-((k-.6)/.4)**2;if(m.blink&&k<.5){x=q.x;y=q.y+(u.side=='A'?30:-30)}else{x+=(q.x-x)*m.k*e;y+=(q.y-y+(u.side=='A'?40:-40))*m.k*e}}}
 u.dhp+=(u.vhp-u.dhp)*Math.min(1,dt*7);
 const bob=u.alive?Math.sin(B.tm*2.4+u.slot*1.3)*sz*.014:0,top=y-hh*FOOT*1.15+bob;
 cx.save();cx.globalAlpha=u.fade;
 const w=sz*1.15,h=hh*1.15;
 if(u.st>=21){const gy=top+h*.55,pr=.75+.25*Math.sin(B.tm*3+u.slot),g=cx.createRadialGradient(x,gy,sz*.05,x,gy,sz*.75);g.addColorStop(0,'rgba(255,240,200,'+(.55*pr)+')');g.addColorStop(.45,'rgba(255,110,210,'+(.28*pr)+')');g.addColorStop(1,'rgba(120,200,255,0)');cx.fillStyle=g;cx.fillRect(x-sz,gy-sz,sz*2,sz*2);
  cx.save();cx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const a=B.tm*1.4+i*1.05,px=x+Math.cos(a)*sz*.38,py=top+h*.9-((B.tm*30+i*22)%(h*.8));cx.beginPath();cx.arc(px,py,1.6,0,Math.PI*2);cx.fillStyle=['#ffe9a0','#ff7ae0','#7ad0ff'][i%3];cx.fill()}cx.restore()}
 cx.drawImage(u.spr,x-w/2,top,w,h);
 if(u.flash>0){cx.globalCompositeOperation='lighter';cx.globalAlpha=u.flash*.55*u.fade;cx.drawImage(u.spr,x-w/2,top,w,h);u.flash=Math.max(0,u.flash-dt*5)}
 cx.restore();
 if(u.fade<.6)return;
 const bw=sz*(u.big?.6:.74),by=top+h*.06,bx=x-bw/2;
 cx.fillStyle='rgba(6,6,20,.75)';cx.fillRect(bx-1,by-1,bw+2,7);
 cx.fillStyle=u.side=='A'?'#4fe39a':'#ff5d6c';cx.fillRect(bx,by,bw*Math.max(0,u.dhp/u.mhp),5);
 if(u.shield>0){cx.fillStyle='rgba(160,220,255,.85)';cx.fillRect(bx,by,bw*Math.min(1,u.shield/u.mhp),2)}
 cx.fillStyle=u.en>=100?'#ffd35a':'#5aa8ff';cx.fillRect(bx,by+6,bw*u.en/100,2.5);
 if(u.stun>0){cx.font=`700 ${Math.round(sz*.14)}px Rubik,sans-serif`;cx.textAlign='center';cx.fillStyle='#ffd35a';cx.fillText('✦ ✦',x,by-4)}
 if(u.big){cx.font=`700 ${Math.round(W*.034)}px Forum,serif`;cx.textAlign='center';cx.fillStyle='#ffe9b0';cx.fillText(u.name,x,by-8)}
}
function cutIn(){
 const c=B.cut,p=(B.tm-c.t0)/c.dur;if(p>=1){B.cut=null;return}
 const a=p<.15?p/.15:p>.82?(1-p)/.18:1,u=c.u,colr=col(u),cy=H*.44,bh=H*.2,sl=1-Math.min(1,p/.22);
 cx.fillStyle=`rgba(4,6,20,${.55*a})`;cx.fillRect(0,0,W,H);
 cx.save();cx.translate(0,cy);cx.rotate(-.08);
 const g=cx.createLinearGradient(0,0,W,0);g.addColorStop(0,rgba(colr,0));g.addColorStop(.15,rgba(colr,.85*a));g.addColorStop(.75,rgba(ART.dk(colr,.6),.9*a));g.addColorStop(1,rgba('#000000',0));
 cx.fillStyle=g;cx.fillRect(-W*.2,-bh/2,W*1.4,bh);
 cx.strokeStyle=rgba('#ffffff',.5*a);cx.lineWidth=1.5;for(let i=0;i<16;i++){const yy=-bh/2+((i*37)%100)/100*bh,xx=W-((B.tm*1400+i*130)%(W*1.4));cx.beginPath();cx.moveTo(xx,yy);cx.lineTo(xx+60+i*4,yy);cx.stroke()}
 const ph=bh*2.1,pw=ph/1.3;cx.globalAlpha=a;cx.drawImage(u.spr,W*.02-sl*W*.6,-ph*.62,pw,ph);
 cx.textAlign='left';cx.font=`${Math.round(W*.078)}px Forum,serif`;cx.lineWidth=5;cx.strokeStyle='rgba(10,6,24,.85)';const tx=W*.42+sl*W*.6;
 cx.strokeText(u.ult||'Умение',tx,bh*.12);const tg=cx.createLinearGradient(0,-20,0,20);tg.addColorStop(0,'#fff6d0');tg.addColorStop(1,'#f3cb6b');cx.fillStyle=tg;cx.fillText(u.ult||'Умение',tx,bh*.12);
 cx.font=`600 ${Math.round(W*.035)}px Rubik,sans-serif`;cx.fillStyle='#e8ecff';cx.fillText(u.name,tx,-bh*.18);
 cx.restore();cx.globalAlpha=1;
}

/* ---------- интерфейс боя ---------- */
function pauseOv(){cx.setTransform(ART.DPR,0,0,ART.DPR,0,0);cx.fillStyle='rgba(0,0,0,.45)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.font=`${Math.round(W*.09)}px Forum,serif`;cx.fillStyle='#f3e6bf';cx.fillText('Пауза',W/2,H*.46);cx.font=`${Math.round(W*.035)}px Rubik,sans-serif`;cx.fillStyle='#cfc8b4';cx.fillText('Нажмите ▶, чтобы продолжить',W/2,H*.51)}
function hud(){
 const box=el('#ballies');const A=B.U.filter(u=>u.side=='A');
 box.innerHTML=A.map(u=>`<button class="ally" data-act="bUlt" data-i="${B.U.indexOf(u)}" aria-label="Умение: ${esc(u.name)}"><img src="${ART.portrait(u,64,64,'head')}" alt=""><i class="hb"><b></b></i><i class="eb"><b></b></i></button>`).join('');
 el('#bspd').textContent='×'+B.spd;el('#bauto').classList.toggle('on',B.auto);el('#bpause').textContent='❚❚';
}
function updHud(){
 const bs=document.querySelectorAll('#ballies .ally');
 bs.forEach(b=>{const u=B.U[+b.dataset.i];if(!u)return;b.children[1].firstChild.style.width=Math.max(0,u.dhp/u.mhp*100)+'%';b.children[2].firstChild.style.width=u.en+'%';b.classList.toggle('ready',u.alive&&u.en>=100);b.classList.toggle('dead',!u.alive)});
}
function finish(r){
 B.over=true;B.pause=false;const win=r=='win',aliveA=alive('A').length,totA=B.U.filter(u=>u.side=='A').length;
 S.st.battles=(S.st.battles||0)+1;if(B.maxHit>(S.st.maxHit||0))S.st.maxHit=B.maxHit;
 const res={win,r,stars:win?(aliveA==totA?3:aliveA>=totA/2?2:1):0,dmg:B.dsum.A,acts:B.acts,units:B.U,maxHit:B.maxHit};
 const out=B.cfg.onEnd?B.cfg.onEnd(res):{};
 sfx(win?'win':'lose');music(null);if(win)haptic(40);
 const A=B.U.filter(u=>u.side=='A'),mx=Math.max(1,...A.map(u=>u.dmg)),mvp=A.reduce((a,u)=>u.dmg>a.dmg?u:a,A[0]);
 const box=el('#bres');box.hidden=false;
 box.innerHTML=`<div class="res-card ${win?'win':'lose'}"><div class="ribbon">${out.title||(win?'Победа':r=='time'?'Время вышло':'Поражение')}</div>
 ${win?`<div class="rstars">${[0,1,2].map(i=>`<i class="${i<res.stars?'on':''}" style="animation-delay:${.2+i*.18}s">${icon('star',30)}</i>`).join('')}</div>`:''}
 ${r=='time'?'<p class="mute" style="font-size:12.5px">Бой длился слишком долго. Нужно больше урона: поднимите уровни атакующих героев.</p>':''}
 ${out.html||''}
 <div class="dmgl">${A.map(u=>`<div class="dl"><img src="${ART.portrait(u,40,40,'head')}" alt=""><span><b>${esc(u.name)}</b>${u==mvp&&u.dmg>0?' <small class="mvp">MVP</small>':''}<i style="width:${u.dmg/mx*100}%"></i></span><em>${fmt(u.dmg)}${u.heal>0?`<small class="hl">+${fmt(u.heal)}</small>`:''}</em></div>`).join('')}</div>
 <div class="mute" style="font-size:11.5px;margin:-4px 0 10px">Сильнейший удар: <b class="num" style="color:var(--gold)">${fmt(B.maxHit)}</b> · ходов ${B.acts}</div>
 ${out.auto?`<div class="anx"><span id="anxT">Следующий этап через <b>3</b> с</span><button class="btn sm sec" data-act="anxStop">Стоп</button></div>`:''}
 <div class="res-btns">${(out.buttons||[]).map(b=>`<button class="btn ${b.cls||''}" data-act="${b.act}" ${b.data||''}>${b.t}</button>`).join('')}<button class="btn sec" data-act="bExit">${out.exit||'Выйти'}</button></div>
 ${out.toggle?`<button class="anxtg ${S.set.anx?'on':''}" data-act="anxToggle">${S.set.anx?'✓ ':''}Автопрохождение этапов</button>`:''}</div>`;
 if(out.auto){let n=3;const me=B;anxI=setInterval(()=>{if(B!==me||!B.over){clearInterval(anxI);return}n--;const t=el('#anxT');if(t)t.innerHTML=`Следующий этап через <b>${n}</b> с`;if(n<=0){clearInterval(anxI);ACT[out.auto]&&ACT[out.auto]()}},1000)}
}
function stopAuto(){clearInterval(anxI);const a=el('.anx');if(a)a.remove()}
function skip(){if(!B||B.over)return;let r;while(!(r=check()))step();B.fx=[];B.cut=null;B.intro=null;B.U.forEach(u=>{u.vhp=u.hp;u.dhp=u.hp;if(!u.alive)u.dying=1;u.mv=null});finish(r)}
function close(){clearInterval(anxI);cancelAnimationFrame(raf);B=null;el('#battle').hidden=true;music('home')}
function pause(v){if(!B||B.over)return;B.pause=v==null?!B.pause:!!v;el('#bpause').textContent=B.pause?'▶':'❚❚';el('#bpause').classList.toggle('on',B.pause)}
function ultTap(i){if(!B||B.over)return;const u=B.U[i];if(u&&u.alive&&u.en>=100&&!u.q){u.q=true;sfx('tap')}}
function speed(){if(!B)return;B.spd=B.spd>=4?1:B.spd+1;S.set.spd=B.spd;el('#bspd').textContent='×'+B.spd}
function auto(){if(!B)return;B.auto=!B.auto;S.set.auto=B.auto?1:0;el('#bauto').classList.toggle('on',B.auto)}
window.addEventListener('resize',()=>{if(B)resize()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&B&&!B.over)pause(true)});
return{start,skip,close,ultTap,speed,auto,pause,stopAuto,get active(){return!!B},get over(){return!!B&&B.over},get paused(){return!!B&&B.pause}};
})();
