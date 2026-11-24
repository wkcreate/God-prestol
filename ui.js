'use strict';
/* Небесный Престол — интерфейс: ядро, главная, герои, отряд, главный герой, настройки */
const $=s=>document.querySelector(s);
const ACT={},VIEW={},AFTER={};
let SCR='home',SP={};
const UI={hf:'all',hr:-1,lock:1,wRot:0,spinning:0,sort:'pow'};

/* ---------- звук ---------- */
let AC=null,musWant='home',musI=0;
function ac(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}return AC}
function tone(f,d,type,v,delay){const a=AC;if(!a||!S||!S.set.snd)return;const t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.05,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}
function sfx(n){({tap:()=>tone(660,.06,'triangle',.025),hit:()=>tone(170,.08,'square',.02),crit:()=>{tone(260,.12,'sawtooth',.035);tone(520,.1,'triangle',.03,.03)},
 ult:()=>[392,523,659,784].forEach((f,i)=>tone(f,.25,'triangle',.045,i*.06)),win:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.35,'triangle',.05,i*.12)),
 lose:()=>[392,330,262].forEach((f,i)=>tone(f,.4,'sine',.045,i*.16)),coin:()=>{tone(988,.08,'square',.025);tone(1318,.12,'square',.025,.06)},
 reveal:()=>tone(880,.2,'triangle',.045),usr:()=>[523,659,784,1046,1318,1568].forEach((f,i)=>tone(f,.4,'triangle',.05,i*.08))}[n]||(()=>{}))()}
function music(m){musWant=m}
function haptic(ms){try{if(S&&S.set.vib&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
document.addEventListener('visibilitychange',()=>{try{if(!AC)return;if(document.hidden)AC.suspend();else AC.resume()}catch(e){}});
setInterval(()=>{if(!AC||!S||!S.set.mus||!musWant||document.hidden)return;const ch=(musWant=='battle'?[[220,277,330],[196,247,294],[175,220,262],[208,262,311]]:[[262,330,392],[220,277,330],[175,220,262],[196,247,294]])[musI++%4];
 ch.forEach((f,i)=>{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f/(i==0?2:1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.012,t+1.2);g.gain.linearRampToValueAtTime(0,t+3.9);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+4)})},4000);
document.addEventListener('pointerdown',()=>ac(),{once:true});

/* ---------- общие элементы ---------- */
function toast(t){const box=$('#toasts');while(box.children.length>=3)box.firstChild.remove();const d=document.createElement('div');d.className='toast';d.innerHTML=t;box.appendChild(d);setTimeout(()=>d.remove(),2600)}
/* трата с подтверждением: крупные суммы золота спрашивают, нехватка ведёт в магазин */
function spend(cur,n,what,fn){
 if(n>0&&!canPay(cur,n)){if(cur=='gold')return ask(`Не хватает золота: нужно ${fmt(n)}, у вас ${fmt(S.gold)}. Открыть магазин?`,()=>go('shop',{p:'gold'}),'В магазин');return toast('Не хватает: '+CUR[cur].n.toLowerCase())}
 if(cur=='gold'&&n>=500)return ask(`${what} за ${fmt(n)} золота?`,fn,'Подтвердить');
 fn();
}
function modal(html,cls){const m=$('#modal');m.hidden=false;m.innerHTML=`<div class="sheet panel ${cls||''}"><button class="x" data-act="close" aria-label="Закрыть">${icon('close',18)}</button>${html}</div>`}
function closeModal(){const m=$('#modal');m.hidden=true;m.innerHTML=''}
let askFn=null;
function ask(t,fn,yes){askFn=fn;modal(`<h3 style="padding-right:36px">${t}</h3><div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn sec" data-act="close">Отмена</button><button class="btn" data-act="askYes">${yes||'Да'}</button></div>`)}
const SPECIAL={pet:['pet',()=>PETS],wing:['wing',()=>WINGS],relic:['relic',()=>RELICS]};
const rwHtml=(r,center)=>`<div class="rw" ${center?'style="justify-content:center"':''}>${Object.keys(r).filter(k=>r[k]&&(CUR[k]||SPECIAL[k])).map(k=>CUR[k]?`<span class="pill" title="${CUR[k].n}">${icon(CUR[k].ic,16)}<b>${fmt(r[k])}</b></span>`:`<span class="pill sp2">${icon(SPECIAL[k][0],16)}<b>${esc((SPECIAL[k][1]().find(x=>x.id==r[k])||{n:r[k]}).n)}</b></span>`).join('')}</div>`;
/* звёзды по цветам: 1–5 золотые, 6–10 розовые, 11–15 красные, 16–20 фиолетовые, 21 — слияние */
const stars=n=>{const t=starTier(n);return t>=4?`<span class="stars t4" title="21★ — слияние"><i></i><em>СЛИЯНИЕ</em></span>`:`<span class="stars t${t}" title="${n}★">${'<i></i>'.repeat(starShown(n))}</span>`};
const costHtml=(cur,n)=>`<span class="cost">${icon(CUR[cur].ic,15)}${fmt(n)}</span>`;
ACT.close=()=>closeModal();ACT.noop=()=>{};
ACT.askYes=()=>{const f=askFn;askFn=null;closeModal();f&&f()};
ACT.askNo=()=>{askFn=null;closeModal()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const f=ACT[b.dataset.act];if(f){e.preventDefault();if(b.dataset.act!='bUlt')sfx('tap');f(b.dataset,b,e)}});
$('#modal').addEventListener('click',e=>{if(e.target.id=='modal')closeModal()});

function heroCard(k,o){
  o=o||{};const d=info(k),lock=!d.main&&!d.own,fc=d.fac?FAC[d.fac].c:'#f3cb6b',up=!lock&&!o.tag&&!d.main&&canStar(k);
 return `<button class="hc ${d.main?'rM':'r'+d.rar} ${lock?'lock':''} ${!lock&&d.st>=21?'fz':''} ${o.cls||''}" data-act="${o.act||'hero'}" data-k="${k}" ${o.extra||''} style="--fc:${fc}">
 <img src="${ART.portrait(specOf(k),120,160)}" alt="">
 <span class="rb">${d.main?'ГЕРОЙ':RAR[d.rar].n}</span><span class="fb">${icon(d.fac?FAC[d.fac].ic:CLS[d.cls].ic,13)}</span>
 ${o.tag?`<span class="tag">${o.tag}</span>`:''}${up?`<span class="upb" title="Можно поднять звезду">▲</span>`:''}${lock?`<span class="lk">${icon('lock',22)}</span>`:''}
 <span class="ft"><b>${esc(d.name)}</b>${lock?'<span class="mute">Не получен</span>':`${d.lt} ${stars(d.st)}`}</span></button>`;
}

/* ---------- маршрутизация ---------- */
function dots(){
 if(!S)return{};daily();const a=afk(),login=S.login.last!==today(),pts=questPts(),chest=QCHEST.some((c,i)=>pts>=c.p&&!S.d.qc.includes(i));
 const ach=ACH.some(achReady),mail=S.mail.some(m=>!m.got),heroes=Object.keys(S.h).some(canStar),tut=!!(tutStep()&&tutStep().f()),paid=passPts()>=PASS_TIERS[0].p&&PASS_TIERS.some((T,i)=>passPts()>=T.p&&!S.paid.ps.got.f.includes(i)),story=!!storyNext();
 return{paid,story,main:(featOn('pets')&&S.egg>0),battle:story,home:a.h>=2||login||chest,summon:S.d.fs>0||S.d.fw>0,guild:!S.g||!S.d.ci||!!S.gw,login,quests:chest,ev:S.d.ev>0,arena:S.d.ar>0||!S.d.arr,wheel:S.d.fw>0,events:login||chest||S.d.ev>0||ach,ach,mail,heroes,tut,shop:!S.d.gift};
}
const questPts=()=>QUESTS.filter(q=>(S.d.q[q.k]||0)>=q.g).length*20;
const TITLES={heroes:'Герои',hero:'Герой',main:'Персонаж',battle:'Кампания',summon:'Призыв',guild:'Союз',shop:'Магазин',events:'События',arena:'Арена'};
function renderTop(){
 if(SCR=='home'){$('#top').innerHTML='';return}
 $('#top').innerHTML=`<span class="ttl">${TITLES[SCR]||''}</span>
 <span class="pill">${icon('gold',17)}${fmt(S.gold)}<button class="add" data-act="go" data-s="shop" aria-label="Купить золото">${icon('plus',11)}</button></span>
 <span class="pill">${icon('silver',17)}${fmt(S.silver)}</span>
 <button class="xbtn" data-act="go" data-s="${SCR=='hero'?'heroes':'home'}" aria-label="Закрыть">${icon('close',14)}</button>`;
}
const NAV=[['main','cWar','Персонаж'],['heroes','heroes','Герои'],['battle','battle','Битва'],['summon','summon','Призыв'],['guild','guild','Союз'],['shop','shop','Магазин']];
function nav(){
 const d=dots(),s=Math.min(S.stage,MAX_STAGE),pr=Math.round((stageIn(s)-1)/STAGES_PER_CH*100);
 $('#nav').innerHTML=NAV.map(([k,ic,l])=>`<button class="nb ${k=='battle'?'mid':''} ${SCR==k||(k=='heroes'&&SCR=='hero')?'on':''}" data-act="go" data-s="${k}">${k=='battle'?`<span class="o">${icon(ic,26)}</span>`:icon(ic,28,'gi')}<span>${l}</span>${d[k]?'<i class="dot"></i>':''}</button>`).join('')+
 `<div class="xp"><span>Глава ${chapOf(s)}</span><div class="bar"><i style="width:${pr}%"></i></div><span>${pr}%</span></div>`;
}
function go(s,p){const sc=$('#screen'),same=s==SCR,y=sc.scrollTop;SCR=s;SP=p||(same?SP:{});render();sc.scrollTop=same?y:0;if(!same){sc.classList.remove('fx');void sc.offsetWidth;sc.classList.add('fx')}}
ACT.go=d=>{closeModal();go(d.s,d.p?{p:d.p}:null)};
ACT.tab=d=>{SP=Object.assign({},SP,{p:d.p});render()};
function render(){
 if(!S)return;daily();const sc=$('#screen'),y=sc.scrollTop;sc.className='scr scr-'+SCR;sc.innerHTML=(VIEW[SCR]||VIEW.home)();sc.scrollTop=y;
 renderTop();nav();if(AFTER[SCR])AFTER[SCR]();
}
const tabs=(list,cur)=>`<div class="tabs">${list.map(([p,l,dot])=>`<button class="tab ${cur==p?'on':''}" data-act="tab" data-p="${p}">${l}${dot?'<i class="dot"></i>':''}</button>`).join('')}</div>`;

/* ---------- главная ---------- */
const ib=(ic,l,s,p,dot,cls)=>`<button class="ib ${cls||''}" data-act="go" data-s="${s}" ${p?`data-p="${p}"`:''}><span class="o">${icon(ic,24,'gi')}</span>${l}${dot?'<i class="dot"></i>':''}</button>`;
const CHAT=[];
function chatLine(){
 const n=T(NPC_NAMES[R(NPC_NAMES.length)]),h=HEROES[R(HEROES.length)],L=[
  ['c0','Мир',`призвал(а) ${RAR[h.rar].n} «${h.n}»!`],['c0','Мир',`прошёл(ла) главу «${chapName(1+R(Math.max(1,chapOf(S.stage))))}»`],
  ['c1','Союз','Титан Союза теряет силы, все на атаку!'],['c2','Система',`Событие «${EV_NAME}» идёт всю неделю`],['c0','Мир','ищу союз, мощь '+fmt(teamPower()*(.6+Math.random()))]][R(5)];
 CHAT.push(`<div><b class="${L[0]}">[${L[1]}]</b> ${L[1]=='Система'?'':n+': '}<span>${L[2]}</span></div>`);while(CHAT.length>2)CHAT.shift();
 const el=$('#chat');if(el)el.innerHTML=CHAT.join('');
}
setInterval(()=>{if(S&&SCR=='home')chatLine()},5000);
VIEW.home=()=>{
 const a=afk(),s=Math.min(S.stage,MAX_STAGE),d=dots(),hh=Math.floor(a.h),mm=Math.floor((a.h-hh)*60),r=resonance();
 const q=QUESTS.find(x=>(S.d.q[x.k]||0)<x.g),dleft=7-((today()+3)%7);
 if(!CHAT.length){chatLine();chatLine();chatLine()}
 return `<canvas id="homeCv"></canvas>
 <div class="hud hud-me"><button class="ava" data-act="go" data-s="main" aria-label="Персонаж"><img src="${ART.portrait(specOf('@main'),58,58,'head')}" alt=""><span class="vip">${S.m.lv}</span></button>
  <div class="me-t"><b>${esc(S.name)}</b><span class="pw">${icon('battle',12)} ${fmt(teamPower())}</span><span class="bf">${r.b?`Резонанс «${FAC[r.f].n}» +${Math.round(r.b*100)}%`:CLS[S.m.cls].n+' · '+MAIN_INFO[S.m.cls].t}</span></div></div>
 <div class="hud hud-cur"><div class="row"><span class="pill">${icon('gold',16)}${fmt(S.gold)}<button class="add" data-act="go" data-s="shop" aria-label="Купить золото">${icon('plus',10)}</button></span><span class="pill">${icon('silver',16)}${fmt(S.silver)}</span></div>
  <div class="row"><span class="pill">${icon('scroll',16)}${S.scroll}</span><span class="pill">${icon('coupon',16)}${S.coupon}</span><button class="gear" data-act="settings" aria-label="Настройки">${icon('gear',20,'gi')}</button></div></div>
 <div class="hud colL">${ib('event','События','events','ev',d.ev)}${ib('gift','Вход','events','login',d.login)}${ib('quest','Ежедневно','events','quests',d.quests)}<button class="ib" data-act="mail"><span class="o">${icon('mail',22,'gi')}</span>Почта${d.mail?'<i class="dot"></i>':''}</button>${ib('star','Достижения','events','ach',d.ach)}</div>
 <div class="hud colR"><button class="evbox" data-act="go" data-s="events" data-p="abyss"><b>${EV_NAME}</b>Ступень ${S.ev.t}/30 · ещё ${dleft} дн.</button><button class="evbox lr" data-act="go" data-s="paid"><b>${icon('crown',13)} Эпоха Легенд</b>Рулетка · пазл · герои LR${d.paid?'<i class="dot"></i>':''}</button>${ib('summon','Призыв героя','summon','prem')}${ib('wheel','Колесо Небес','summon','wheel',d.wheel)}${ib('arena','Арена','arena','',d.arena)}</div>
 <div class="hname" style="top:56%">${esc(S.name)}<span>${CLS[S.m.cls].n} · ${MAIN_INFO[S.m.cls].t}</span></div>
 <div class="hud qtrack">
  ${tutLine()}
  <button class="qt" data-act="fight"><b>[Сюжет]</b> Этап ${chapOf(s)}-${stageIn(s)}${stageIn(s)%10==0?' · босс':''}<span>Пройдите главу «${chapName(chapOf(s))}»</span></button>
  ${(()=>{const sc=storyNext();return sc?`<button class="qt story" data-act="storyPlay" data-c="${sc}"><b>[Летопись]</b> Глава ${sc}: «${STORY[sc-1].t}»<span>${Object.keys(FEAT).filter(f=>FEAT[f]==sc).map(f=>'Открывает: '+FEAT_N[f].toLowerCase()).join('')||'Прочитайте — награда за главу'}</span></button>`:''})()}
  ${storyNext()&&tutStep()?'':q?`<button class="qt side" data-act="go" data-s="events" data-p="quests"><b>[Ежедневно]</b> ${q.n}<span>${Math.min(q.g,S.d.q[q.k]||0)}/${q.g}</span></button>`:`<button class="qt side done" data-act="go" data-s="events" data-p="quests"><b>[Ежедневно]</b> Все задания выполнены<span>Заберите сундуки</span></button>`}
  ${tutStep()||storyNext()?'':!S.g?`<button class="qt side" data-act="go" data-s="guild"><b>[Союз]</b> Вступите в союз<span>Титан, война кланов, лавка</span></button>`:!S.d.ci?`<button class="qt side" data-act="go" data-s="guild"><b>[Союз]</b> Отметьтесь в союзе<span>+150 монет Союза</span></button>`:''}
 </div>
 <div class="hud chat" id="chat">${CHAT.join('')}</div>
 <div class="hud hud-br">
  <button class="ib afkb ${a.full?'full':''}" data-act="claimAfk" ${a.h<1/60?'disabled':''}><span class="o">${icon('chest',28,'gi')}</span>${a.full?'Хранилище полно':`Добыча ${hh}:${String(mm).padStart(2,'0')}`}<small class="cap">из ${a.cap} ч${a.wk?' · ×1'+DEC+'5':''}</small>${a.h>=2?'<i class="dot"></i>':''}</button>
  <button class="ib" data-act="quickAfk"><span class="o">${icon('exp',22)}</span>${S.d.qa>0?'Быстрая добыча':'Быстро · 60'}</button>
  <button class="fightb" data-act="fight">${icon('battle',22,'gi')}<span>В бой<small>Этап ${chapOf(s)}-${stageIn(s)}</small></span></button>
 </div>`;
};
let homeRaf=0;
AFTER.home=()=>{
 const cv=$('#homeCv');if(!cv)return;cancelAnimationFrame(homeRaf);const c=cv.getContext('2d'),t0=performance.now(),th=themeOf(Math.min(S.stage,MAX_STAGE));
 const ms=ART.sprite(unitSpec('@main'),260),pet=S.pet&&S.pets[S.pet]?ART.sprite(petSpec(S.pet),190):null,others=S.team.filter(k=>k&&k!='@main'&&S.h[k]).map(k=>ART.sprite(unitSpec(k),170));
 const P=[[.27,-.03],[.73,-.03],[.39,-.06],[.61,-.06]];
 const order=others.map((sp,i)=>({sp,i})).sort((a,b)=>P[a.i][1]-P[b.i][1]);
 function fr(t){
  if(!cv.isConnected||SCR!='home'){homeRaf=0;return}
  if(BT.active||document.hidden){homeRaf=requestAnimationFrame(fr);return}
  const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h){homeRaf=requestAnimationFrame(fr);return}
  if(cv.width!==Math.round(w*ART.DPR)){cv.width=Math.round(w*ART.DPR);cv.height=Math.round(h*ART.DPR)}
  c.setTransform(ART.DPR,0,0,ART.DPR,0,0);const tt=(t-t0)/1000,iy=h*.5;
  ART.bg(c,w,h,th,'home',tt);
  const v=c.createRadialGradient(w/2,h*.45,h*.2,w/2,h*.5,h*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');c.fillStyle=v;c.fillRect(0,0,w,h);
  ART.rings(c,w/2,iy-h*.12,Math.min(w,h*.7),tt);
  ART.island(c,w/2,iy,Math.min(w*.86,h*.75),tt);
  order.forEach(({sp,i})=>{const sz=Math.min(w*.26,h*.2),ww=sz*1.15,hh=sz*1.3*1.15,x=w*P[i][0],y=iy+h*P[i][1]+Math.sin(tt*2+i)*1.5;c.drawImage(sp,x-ww/2,y-hh*.895,ww,hh)});
  const sz=Math.min(w*.4,h*.31),ww=sz*1.15,hh=sz*1.3*1.15,y=iy+h*.03+Math.sin(tt*1.7)*2.5;
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<16;i++){const a=tt*.6+i*.4,r=sz*(.3+(i%3)*.08),px=w/2+Math.cos(a)*r,py=y-hh*.5+Math.sin(a*1.3)*r*.9-((tt*28+i*20)%70);c.beginPath();c.arc(px,py,1.3+(i%3)*.8,0,Math.PI*2);c.fillStyle=`rgba(233,201,127,${.3+.3*Math.sin(tt*3+i)})`;c.fill()}c.restore();
  c.drawImage(ms,w/2-ww/2,y-hh*.895,ww,hh);
  if(pet){const ps=sz*.6,pw=ps*1.15,ph=ps*1.3*1.15,px=w/2-sz*.62,py=iy+h*.075+Math.sin(tt*2.3+1)*2;c.drawImage(pet,px-pw/2,py-ph*.895,pw,ph)}
  homeRaf=requestAnimationFrame(fr);
 }
 homeRaf=requestAnimationFrame(fr);
};
ACT.claimAfk=()=>{const a=claimAfk();if(!a)return;sfx('coin');haptic(15);toast(`Добыча: ${icon('silver',14)} ${fmt(a.silver)} · ${icon('exp',14)} ${fmt(a.exp)}${a.scroll?` · ${icon('scroll',14)} ${a.scroll}`:''}`);render()};
ACT.quickAfk=()=>{const r=quickAfk();if(!r)return toast('Не хватает золота');sfx('coin');toast('Быстрая добыча: '+fmt(r.silver)+' серебра');render()};


/* ---------- герои ---------- */
VIEW.heroes=()=>{
 const p=SP.p||'col';
 return `<div class="stack">${tabs([['col','Коллекция'],['team','Отряд']],p)}${p=='team'?teamView():colView()}</div>`;
};
function colView(){
 const own=Object.keys(S.h).length;
 let L=HEROES.filter(h=>(UI.hf=='all'||h.fac==UI.hf)&&(UI.hr<0||h.rar==UI.hr));
 const pw=id=>powerOf(unitStats(id)),SO={pow:(a,b)=>pw(b.id)-pw(a.id),rar:(a,b)=>b.rar-a.rar||pw(b.id)-pw(a.id),lv:(a,b)=>S.h[b.id].lv-S.h[a.id].lv||b.rar-a.rar,fac:(a,b)=>FAC_ORDER.indexOf(a.fac)-FAC_ORDER.indexOf(b.fac)||b.rar-a.rar};
 const owned=L.filter(h=>S.h[h.id]).sort(SO[UI.sort]||SO.pow);
 const locked=UI.lock?L.filter(h=>!S.h[h.id]).sort((a,b)=>b.rar-a.rar):[];
 return `<div class="chips">${[['all','Все']].concat(FAC_ORDER.map(f=>[f,FAC[f].n])).map(([f,n])=>`<button class="chip ${UI.hf==f?'on':''}" data-act="hf" data-f="${f}">${f!='all'?`<span style="color:${FAC[f].c}">${icon(FAC[f].ic,13)}</span>`:''}${n}</button>`).join('')}</div>
 <div class="chips">${[-1,0,1,2,3,4].map(r=>`<button class="chip ${UI.hr==r?'on':''}" data-act="hr" data-r="${r}" ${r>=0?`style="color:${RAR[r].c}"`:''}>${r<0?'Любая редкость':RAR[r].n}</button>`).join('')}</div>
 <div class="row"><span class="lbl">Собрано ${own} из ${HEROES.length}</span><button class="chip sp" data-act="sortT">Сорт.: ${{pow:'мощь',rar:'редкость',lv:'уровень',fac:'фракция'}[UI.sort]}</button><button class="chip" data-act="lockT">${UI.lock?'Скрыть неполученных':'Показать всех'}</button></div>
 <div class="grid">${UI.hf=='all'&&UI.hr<0?heroCard('@main'):''}${owned.map(h=>heroCard(h.id,{cls:S.team.includes(h.id)?'in':''})).join('')}${locked.map(h=>heroCard(h.id)).join('')}</div>`;
}
ACT.hf=d=>{UI.hf=d.f;render()};ACT.sortT=()=>{const o=['pow','rar','lv','fac'];UI.sort=o[(o.indexOf(UI.sort)+1)%o.length];render()};ACT.hr=d=>{UI.hr=+d.r;render()};ACT.lockT=()=>{UI.lock=!UI.lock;render()};
function teamView(){
 const r=resonance(),slot=i=>{const k=S.team[i];return k?heroCard(k,{act:'slot',extra:`data-i="${i}"`}):`<button class="slot" data-act="slot" data-i="${i}">${icon('plus',22)}<span>Пусто</span></button>`};
 return `<div class="panel"><div class="hdr"><h3>Боевой порядок</h3><small class="sp">Мощь ${fmt(teamPower())}</small></div>
 <div class="form" style="margin-top:12px"><div class="lbl" style="text-align:center">Передний ряд</div><div class="fr2">${slot(0)}${slot(1)}</div><div class="lbl" style="text-align:center">Задний ряд</div><div class="fr3">${slot(2)}${slot(3)}${slot(4)}</div></div>
 <div class="row" style="margin-top:12px"><span class="mute" style="font-size:13px">${r.b?`Резонанс «${FAC[r.f].n}» ×${r.n}: +${Math.round(r.b*100)}% к здоровью и атаке`:'Резонанс: 3 героя одной фракции дают +8%, 4 героя — +15%'}</span><button class="btn sm sp" data-act="autoTeam">Авто</button></div>
 <button class="btn jade wide" style="margin-top:10px" data-act="lvTeam">${icon('plus',14)} Улучшить весь отряд</button><p class="mute" style="font-size:12px;margin:6px 0 0;text-align:center">Опыт и серебро делятся поровну: первым растёт самый отстающий герой.</p></div>
 <div class="card"><div class="lbl">Преимущество фракций · +25% урона</div><div class="cyc" style="margin-top:8px">${['vol','plm','les','sol','vol'].map((f,i)=>`<span style="color:${FAC[f].c}">${icon(FAC[f].ic,13)}${FAC[f].n}</span>${i<4?'›':''}`).join('')}</div><div class="cyc" style="margin-top:6px"><span style="color:${FAC.ang.c}">${icon('wing',13)}Ангелы</span>⇄<span style="color:${FAC.dem.c}">${icon('horn',13)}Демоны</span></div>
 <p class="mute" style="font-size:12.5px;margin:8px 0 0">Воины встают вперёд и принимают удары. Ассасины прорываются к заднему ряду врага. Задний ряд защищён, пока жив передний.</p></div>`;
}
ACT.autoTeam=()=>{autoTeam();save();toast('Отряд собран по мощи');render()};
ACT.lvTeam=()=>{const p0=teamPower(),n=levelTeam();if(!n)return toast('Не хватает опыта или серебра, либо все герои на пределе уровня');save();sfx('coin');toast(`Отряд улучшен: +${n} ур., мощь +${fmt(teamPower()-p0)}`);render()};
ACT.slot=d=>{
 const i=+d.i,cand=['@main',...Object.keys(S.h)].sort((a,b)=>powerOf(unitStats(b))-powerOf(unitStats(a)));
 modal(`<h3>Позиция ${i<2?'переднего':'заднего'} ряда</h3><p class="mute" style="font-size:13px;margin:4px 0 12px">Выберите героя. Если он уже в отряде, герои поменяются местами.</p>
 <div class="grid">${S.team[i]?`<button class="slot" data-act="setSlot" data-i="${i}" data-k="">${icon('close',20)}<span>Убрать</span></button>`:''}${cand.map(k=>heroCard(k,{act:'setSlot',extra:`data-i="${i}"`,cls:S.team.includes(k)?'in':''})).join('')}</div>`);
};
ACT.setSlot=d=>{
 const i=+d.i,k=d.k||null,j=k?S.team.indexOf(k):-1;
 if(!k&&S.team[i]=='@main')return toast('Главный герой всегда в отряде');
 if(j>=0)S.team[j]=S.team[i];S.team[i]=k;
 if(!S.team.includes('@main')){const e=S.team.indexOf(null);if(e>=0)S.team[e]='@main';else S.team[j>=0?j:i]='@main'}
 save();closeModal();render();
};

/* ---------- экран героя ---------- */
ACT.hero=d=>{if(d.k=='@main'){go('main');return}if(!S.h[d.k])return lockedModal(d.k);go('hero',{k:d.k,t:SCR=='hero'?SP.t:undefined})};
function lockedModal(k){const h=HERO[k],src=h.rar==5?'Алтарь Легенд — за Осколки Легенды из платных событий':h.rar==4?'Небесный призыв, Колесо Небес и Лавка Союза':h.rar==3?'Купоны судьбы':'любой призыв и Колесо Небес';
 modal(`<div class="row"><div style="width:110px;flex:none">${heroCard(k,{act:'noop'})}</div><div><h3>${h.n}</h3><div class="mute" style="font-size:13px">${h.t} · ${FAC[h.fac].n} · ${CLS[h.cls].n}</div><p style="font-size:13px;margin:8px 0 0">Умение «${h.u}»: ${ULT_DESC[h.cls].toLowerCase()}.</p><p class="mute" style="font-size:12.5px;margin:6px 0 0">Где найти: ${src}.</p></div></div>`)}
function heroArt(k,big){
 const d=info(k),st=d.main?unitStats('@main'):unitStats(k),F=d.fac?FAC[d.fac]:{d:'#3a2a10',c:'#e9c97f',ic:'sun',n:'Престол'},R0=d.main?2:d.rar;
 const own=d.main?[]:ownSorted(),i=own.indexOf(k),nav=own.length>1?`<button class="hsnav l" data-act="hero" data-k="${own[(i-1+own.length)%own.length]}" aria-label="Предыдущий герой">${icon('chev',22)}</button><button class="hsnav r" data-act="hero" data-k="${own[(i+1)%own.length]}" aria-label="Следующий герой">${icon('chev',22)}</button>`:'';
 return `<div class="hs-art ${d.st>=21?'fz':''} ${R0==5?'lr':''}" style="--fd:${F.d}"><img src="${ART.portrait(specOf(k),360,430,'full')}" alt="">${nav}
 <div class="hs-name"><span style="color:${F.c}">${icon(d.fac?F.ic:CLS[d.cls].ic,16)}</span>${esc(d.name)}</div>
 <div class="rarbig ${R0==4?'u':R0==5?'l':''}">${d.main?'':RAR[R0].n}</div>
 <div class="skcol l"><span class="skc" style="--sc:${F.c}">${icon(CLS[d.cls].ic,22)}</span>${d.u}<span class="skc" style="--sc:#6a3aa0">${icon(d.fac?F.ic:'star',20)}</span>${d.fac?'Сила фракции':'Таланты'}</div>
 ${big||''}
 <div class="rating">Мощь: ${fmt(powerOf(st))}</div></div>`;
}
const ownSorted=()=>Object.keys(S.h).sort((a,b)=>HERO[b].rar-HERO[a].rar||powerOf(unitStats(b))-powerOf(unitStats(a)));
const statRows=st=>`<div class="stats"><div class="stat">${icon('cHea',14)}Здоровье<b>${fmt(st.hp)}</b></div><div class="stat">${icon('cAsn',14)}Атака<b>${fmt(st.atk)}</b></div><div class="stat">${icon('cWar',14)}Защита<b>${fmt(st.def)}</b></div><div class="stat">${icon('star',14)}Скорость · крит<b>${st.spd} · ${Math.round(st.crit*100)}%</b></div></div>`;
VIEW.hero=()=>{
 const k=SP.k;if(!k||!S.h[k]){SCR='heroes';return VIEW.heroes()}
 const h=HERO[k],st=unitStats(k),inT=S.team.includes(k),tab=SP.t||'info',own=ownSorted();
 const side=`<div class="skcol r">${lvSide(k)}<button class="ib" data-act="teamT" data-k="${k}"><span class="o">${icon(inT?'close':'heroes',20,'gi')}</span>${inT?'Убрать':'В отряд'}</button></div>`;
 return `<div class="hs">${heroArt(k,side)}
 <div class="infop">${lvBlock(k)}
 <div style="margin-top:12px">${subTabs([['info','Обзор'],['gear','Снаряжение',(GEAR.some(g=>gearCost(po(k).eq[g.k])&&S.ore>=gearCost(po(k).eq[g.k]).ore))],['star','Звёзды',canStar(k)]],tab)}</div>
 ${tab=='gear'?gearView(k):tab=='star'?starView(k):`<div style="margin-top:10px">${statRows(st)}</div><div class="sect" style="margin-top:12px">${h.u}</div><p class="mute" style="font-size:12.5px;margin:6px 0 0">${ULT_DESC[h.cls]}. Сила фракции «${FAC[h.fac].n}»: ${FAC_DESC[h.fac]}.</p>`}</div>
 <div class="roster">${own.map(x=>heroCard(x,{cls:x==k?'in':''})).join('')}</div></div>`;
};
ACT.lvl=d=>{const p0=powerOf(unitStats(d.k)),n=levelUp(d.k,+d.n);if(!n){const q=nextCost(d.k);toast(!q?capHint(d.k):q.asc&&S.asc<q.asc?'Уровни Зенита требуют Камни возвышения':'Не хватает опыта или серебра');return}sfx('coin');if(n>1)toast(`+${n} ур. · мощь +${fmt(powerOf(unitStats(d.k))-p0)}`);save();render()};
ACT.teamT=d=>{const i=S.team.indexOf(d.k);if(i>=0)S.team[i]=null;else{const e=S.team.indexOf(null);if(e<0)return toast('Отряд заполнен: замените героя во вкладке «Отряд»');S.team[e]=d.k}save();render()};


/* ---------- главный герой ---------- */
const skinSpec=id=>({key:'main',skinKey:S.m.cls+':'+id,look:ART.mainLook(S.m.cls,id)});
function skinCard(s){
 const own=S.m.skins.includes(s.id),on=S.m.skin==s.id,r=s.r<0?'rM':'r'+s.r;
 return `<button class="hc ${r} ${on?'in':''}" data-act="skin" data-id="${s.id}"><img src="${ART.portrait(skinSpec(s.id),120,160)}" alt=""><span class="rb">${s.r<0?'БАЗА':RAR[s.r].n}</span>${on?'<span class="tag">НАДЕТ</span>':''}
 <span class="ft"><b>${s.n}</b>${s.r>=0?`+${(SKIN_BONUS[s.r]*100).toFixed(1).replace('.0','')}% ко всему`:'Без бонуса'}<br>${own?'<span class="g">Получен</span>':s.src=='shop'?costHtml('gold',s.price):`<span class="mute">${s.src=='wheel'?'Колесо Небес':'Событие недели'}</span>`}</span></button>`;
}
VIEW.main=()=>{
 const st=unitStats('@main'),t=S.m.tal,tab=SP.t||'info';
 const tal=[['atk','Сила Престола','+1,5% атаки'],['hp','Небесная плоть','+1,5% здоровья'],['crit','Глаз ястреба','+0,2% крита']];
 const side=`<div class="skcol r">${lvSide('@main')}<button class="ib" data-act="go" data-s="shop" data-p="skins"><span class="o">${icon('skin',22)}</span>Скины</button></div>`;
 let body='';
 if(tab=='gear')body=gearView('@main');
 else if(tab=='wings')body=`<div class="stack" style="margin-top:10px">${wingsView()}</div>`;
 else if(tab=='pets')body=`<div class="stack" style="margin-top:10px">${petsView()}</div>`;
 else if(tab=='arts')body=`<div class="stack" style="margin-top:10px">${relicsView()}</div>`;
 else body=`<div style="margin:10px 0">${statRows(st)}</div>
 <div class="sect">${MAIN_INFO[S.m.cls].u}</div><p class="mute" style="font-size:12.5px;margin:6px 0 10px">${ULT_DESC[S.m.cls]}. Каждые 25 уровней — новая звезда, на R1 — слияние (21★). Предел уровня растёт с главами.</p>
 <div class="stack">
 <div class="panel"><div class="hdr"><h3>Класс</h3><small class="sp">${S.m.chg?'Смена: '+costHtml('gold',500):'Первая смена бесплатно'}</small></div>
 <div class="chips" style="margin-top:8px">${MAIN_CLS.map(k=>`<button class="chip ${S.m.cls==k?'on':''}" data-act="cls" data-c="${k}">${icon(CLS[k].ic,14)}${CLS[k].n}</button>`).join('')}</div>
 <p class="mute" style="font-size:12.5px;margin:8px 0 0">${MAIN_INFO[S.m.cls].d}</p></div>
 <div class="panel"><div class="hdr"><h3>Облики</h3><small class="sp">${S.m.skins.length-1} из ${SKINS.length-1}</small></div>
 <p class="mute" style="font-size:12.5px;margin:4px 0 10px">Скин полностью меняет облик и даёт бонус ко всем характеристикам: R +1%, UR +1,5%, SSR +2%, SSR+ +3%, USR +5%.</p>
 <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${SKINS.map(skinCard).join('')}</div></div>
 <div class="panel"><div class="hdr"><h3>Таланты</h3><small class="sp">${icon('star',14)} ${S.tp} очков</small></div>
 <div class="stack" style="gap:8px;margin-top:8px">${tal.map(([k,n,b])=>{const q=talCost(t[k]);return `<div class="row"><div style="flex:1;min-width:0"><b class="gold" style="font-family:var(--serif);font-weight:400">${n}</b> <span class="mute">${t[k]}/100</span><div class="g" style="font-size:12px">${b} за уровень</div></div><button class="btn sm" data-act="tal" data-k="${k}" ${t[k]>=100?'disabled':''}>${icon('star',13)}1 ${costHtml('silver',q.silver)}</button><button class="btn sm sec" data-act="tal" data-k="${k}" data-n="10" ${t[k]>=100||S.tp<2?'disabled':''}>+10</button></div>`}).join('')}</div>
 <p class="mute" style="font-size:12px;margin:8px 0 0">Очки талантов дают за каждый пройденный этап.</p></div></div>`;
 return `<div class="hs">${heroArt('@main',side)}
 <div class="infop">${lvBlock('@main')}
 <div style="margin-top:12px">${subTabs([['info','Развитие'],['gear','Снаряжение'],['wings','Крылья',0,!featOn('wings')],['pets','Питомцы',featOn('pets')&&S.egg>0,!featOn('pets')],['arts','Артефакты',0,!featOn('arts')]],tab)}</div>
 ${body}</div></div>`;
};
ACT.tal=d=>{const n=talUpN(d.k,+(d.n||1));if(n){sfx('coin');if(n>1)toast(`Талант +${n}`);save();render()}else toast('Нужно очко таланта и серебро')};
ACT.cls=d=>{if(d.c==S.m.cls)return;const doIt=()=>{if(S.m.chg&&!pay('gold',500))return toast('Не хватает золота');S.m.cls=d.c;S.m.chg++;save();render();toast('Новый класс: '+CLS[d.c].n)};
 ask(`Сменить класс на «${CLS[d.c].n}»?${S.m.chg?' Стоимость: 500 золота.':' Первая смена бесплатна.'} Уровень, скины и таланты сохранятся.`,doIt,'Сменить')};
ACT.skin=d=>{const s=SKINS.find(x=>x.id==d.id);if(S.m.skins.includes(s.id)){S.m.skin=s.id;save();render();toast('Скин «'+s.n+'» надет');return}
 if(s.src!='shop')return toast(s.src=='wheel'?'Этот скин выпадает в Колесе Небес':'Этот скин — главная награда события «'+EV_NAME+'»');
 ask(`Купить скин «${s.n}» за ${s.price} золота?`,()=>{if(!pay('gold',s.price))return toast('Не хватает золота');S.m.skins.push(s.id);S.m.skin=s.id;save();sfx('usr');render();toast('Скин получен и надет')},'Купить')};

/* ---------- настройки ---------- */
const tg=(k,l,on,off)=>`<div class="row"><span>${l}</span><button class="btn sm sp ${S.set[k]?'':'sec'}" data-act="setT" data-k="${k}">${S.set[k]?on||'Вкл':off||'Выкл'}</button></div>`;
ACT.settings=()=>{
 let q=1;try{q=+(localStorage.getItem('np_q')??1)}catch(e){}
 modal(`<h3>Настройки</h3><div class="stack" style="margin-top:12px">
 <div class="row"><span>Язык · Language</span><button class="btn sm sp" data-act="langPick">${icon('globe',14)} ${LANGS.find(l=>l[0]==LANG)[1]}</button></div>
 <label class="lbl" for="nmIn">Имя героя</label><div class="row"><input id="nmIn" maxlength="16" value="${esc(S.name)}"><button class="btn sm" data-act="setName">Сохранить</button></div>
 ${tg('snd','Звуковые эффекты')}${tg('mus','Музыка')}${tg('vib','Вибрация')}${tg('anx','Автопрохождение этапов')}
 <div class="row"><span>Графика</span><button class="btn sm sp ${q?'':'sec'}" data-act="quality">${q?'Высокая':'Экономная'}</button></div>
 <div class="card"><div class="lbl">Статистика</div><div class="stats" style="margin-top:6px"><div class="stat">Боёв<b>${fmt(S.st.battles||0)}</b></div><div class="stat">Побед в кампании<b>${fmt(S.st.wins)}</b></div><div class="stat">Призывов<b>${fmt(S.st.sum)}</b></div><div class="stat">Героев USR<b>${S.st.usr}</b></div><div class="stat">Сильнейший удар<b>${fmt(S.st.maxHit||0)}</b></div><div class="stat">В игре дней<b>${Math.max(1,Math.ceil((now()-S.created)/864e5))}</b></div></div></div>
 <div class="card"><div class="lbl">Сохранение</div><p class="mute" style="font-size:12.5px;margin:4px 0 8px">Прогресс сохраняется на устройстве автоматически: каждые 15 секунд и при сворачивании. Код ниже переносит его на другое устройство.</p>
 <textarea id="bkIn" rows="3" placeholder="Вставьте код сохранения"></textarea><div class="row wrap" style="margin-top:8px"><button class="btn sm sec" data-act="exp">Показать мой код</button><button class="btn sm sec" data-act="copyCode">Копировать</button><button class="btn sm" data-act="imp">Загрузить код</button></div></div>
 <div class="row wrap"><button class="btn sm sec" data-act="whatsNew">Что нового</button><button class="btn sm sec" data-act="privacy">Конфиденциальность</button><button class="btn sm sec" data-act="terms">Условия</button>${ERRLOG.length?`<button class="btn sm sec" data-act="errLog">Журнал ошибок (${ERRLOG.length})</button>`:''}</div>
 <div class="row"><button class="btn sec" style="flex:1" data-act="switchChar">Сменить персонажа</button><button class="btn red" data-act="reset">Удалить персонажа</button></div>
 <p class="mute" style="font-size:12px;text-align:center;margin:0">Небесный Престол · версия ${VERSION} · Powered by VantaStack</p></div>`);
};
ACT.setT=d=>{S.set[d.k]=S.set[d.k]?0:1;if(d.k=='vib'&&S.set.vib)haptic(20);save();ACT.settings()};
ACT.quality=()=>{let q=1;try{q=+(localStorage.getItem('np_q')??1);localStorage.setItem('np_q',q?0:1)}catch(e){}save();ask('Качество графики изменится после перезапуска. Перезапустить сейчас?',()=>location.reload(),'Перезапустить')};
ACT.setName=()=>{const v=$('#nmIn').value.trim().slice(0,16);if(!v)return toast('Введите имя');S.name=v;save();closeModal();render()};

ACT.exp=()=>{$('#bkIn').value=exportCode();$('#bkIn').select()};
ACT.copyCode=()=>{const v=$('#bkIn').value||exportCode();$('#bkIn').value=v;try{navigator.clipboard.writeText(v).then(()=>toast('Код скопирован'),()=>{$('#bkIn').select();toast('Выделите и скопируйте код вручную')})}catch(e){$('#bkIn').select()}};
ACT.imp=()=>{try{importCode($('#bkIn').value);closeModal();go('home');toast('Сохранение загружено')}catch(e){toast(e.message=='old'?'Этот код старше прогресса персонажа на этом устройстве — откат прогресса запрещён':'Код не подошёл: проверьте, что он скопирован целиком')}};
ACT.reset=()=>ask('Удалить этого персонажа и весь его прогресс? Это нельзя отменить.',()=>{const id=CID;S=null;CID=null;deleteChar(id);PICK=null;showLogin()},'Удалить');
ACT.switchChar=()=>{save();showLogin()};

/* ---------- новая игра ---------- */
let pickCls='war';
function newGame(){
 $('#top').innerHTML='';$('#nav').innerHTML='';SCR='new';const sc=$('#screen');sc.className='scr';
 sc.innerHTML=`<div class="stack" style="padding-top:8px">${chars().length?`<button class="btn sm sec" style="align-self:flex-start" data-act="toLogin">${icon('chev',12,'flip')} К персонажам</button>`:''}<div style="text-align:center"><div class="lbl">Хроники небожителей</div><h2 style="font-size:34px">Небесный Престол</h2><p class="mute" style="margin:6px 0 0">Престол пуст, и Бездна поднимается к звёздам. Выберите путь героя.</p></div>
 <div class="clsPick">${MAIN_CLS.map(k=>`<button class="${pickCls==k?'on':''}" data-act="pickCls" data-c="${k}"><img src="${ART.portrait({key:'main',skinKey:k+':base',look:ART.mainLook(k,'base')},200,266)}" alt=""><span><b>${CLS[k].n}</b><br><small class="mute">${MAIN_INFO[k].t}</small></span></button>`).join('')}</div>
 <div class="card"><b style="color:var(--gold)">${CLS[pickCls].n}</b><p class="mute" style="margin:4px 0 0;font-size:13px">${MAIN_INFO[pickCls].d} Умение: «${MAIN_INFO[pickCls].u}».</p></div>
 <label class="lbl" for="newNm">Имя героя</label><input id="newNm" maxlength="16" placeholder="Например, Аэлита" value="${esc(UI.nm||'')}">
 <button class="btn wide" data-act="startGame">Начать путь</button></div>`;
}
ACT.pickCls=d=>{UI.nm=($('#newNm')||{}).value||'';pickCls=d.c;newGame()};
ACT.toLogin=()=>showLogin();
ACT.startGame=()=>{const n=($('#newNm').value||'').replace(/[<>]/g,'').trim().slice(0,16)||'Странник';newChar(n,pickCls);S.mailSeen.push('v210','v220','v230');mailSync();daily();save();SCR='home';SP={};render();
 modal(`<h3>Добро пожаловать, ${esc(n)}</h3><p class="mute" style="font-size:13.5px">В отряде уже трое героев. У вас 10 свитков: первый десятикратный призыв гарантирует героя SSR.</p><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-act="go" data-s="summon">К призыву</button></div>`)};

/* ---------- запуск ---------- */
function hideSplash(){const sp=$('#splash');if(sp&&!sp.dataset.out){sp.dataset.out=1;sp.style.opacity=0;setTimeout(()=>sp.remove(),650)}}
/* ---------- вход: сервер и персонажи ---------- */
let SRV='eu1',PICK=null;
function charLook(c){const L=ART.mainLook(CLS[c.cls]?c.cls:'war',SKINS.some(s=>s.id==c.skin)?c.skin:'base');const W=c.wing&&WINGS.find(w=>w.id==c.wing);if(W){L.wings=W.style;L.wingC=W.c;L.wingE=W.e}
 return{key:'main',skinKey:c.cls+':'+(c.skin||'base')+':'+(c.wing||''),look:L}}
const ago=ts=>{const d=Math.floor((now()-(ts||0))/864e5);return d<=0?T('сегодня'):d==1?T('вчера'):d+' '+T('дн. назад')};
let LG_ART=null;
function loginArt(){/* заставка входа: четыре класса героев у Престола */
 if(LG_ART)return LG_ART;const W=390,H=300,D=ART.DPR,cv=document.createElement('canvas');cv.width=W*D;cv.height=H*D;const c=cv.getContext('2d');c.scale(D,D);
 const g=c.createRadialGradient(W/2,H*.66,8,W/2,H*.66,W*.46);g.addColorStop(0,'rgba(243,203,107,.30)');g.addColorStop(1,'rgba(243,203,107,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.save();c.translate(W/2,H*.86);c.scale(1,.2);c.strokeStyle='rgba(243,203,107,.35)';c.lineWidth=3;for(const r of[110,150,185]){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke()}c.restore();
 const row=[['asn',.17,.62],['mag',.83,.62],['arc',.36,.8],['war',.64,.84]];
 for(const[k,x,s]of row){try{const sp=ART.sprite({key:'main',skinKey:k+':base',look:ART.mainLook(k,'base')},200),hh=H*s,ww=hh*sp.width/sp.height;c.drawImage(sp,W*x-ww/2,H*.9-hh,ww,hh)}catch(e){}}
 LG_ART=cv.toDataURL('image/png');return LG_ART}
function showLogin(){
 if(BT.active)BT.close();closeModal();S=null;CID=null;
 $('#top').innerHTML='';$('#nav').innerHTML='';SCR='login';const sc=$('#screen');sc.className='scr scr-login';
 const list=chars().filter(c=>(c.srv||'eu1')==SRV).sort((a,b)=>(b.ts||0)-(a.ts||0)),srv=SERVERS.find(s=>s.id==SRV);
 if(!PICK||!list.some(c=>c.id==PICK))PICK=list[0]?list[0].id:null;
 sc.innerHTML=`<div class="login"><div class="lg-top"><button class="chip" data-act="langPick">${icon('globe',14)} ${LANGS.find(l=>l[0]==LANG)[1]}</button></div>
 <div class="lg-logo"><div class="lbl">Хроники небожителей</div><h1>Небесный Престол</h1></div>
 <button class="srv" data-act="srvPick"><span class="dotg"></span><b>${srv.n}</b><span>${srv.s}</span>${icon('chev',14)}</button>
 <div class="lbl" style="text-align:center">${list.length?'Выберите персонажа':'Персонажей на сервере пока нет'}</div>
 <div class="chars">${list.map(c=>`<button class="ch ${c.id==PICK?'on':''}" data-act="chPick" data-id="${esc(c.id)}"><img src="${ART.portrait(charLook(c),64,64,'head')}" alt=""><span><b>${esc(c.name)}</b><small>${CLS[c.cls]?CLS[c.cls].n:''} · ${c.tr==2?'Зенит '+c.zl:c.tr==1?'R1 · '+c.rl:'Ур. '+c.lv} · ${'Этап'} ${chapOf(Math.min(c.stage||1,MAX_STAGE))}-${stageIn(Math.min(c.stage||1,MAX_STAGE))}</small><small>${icon('battle',11)} ${fmt(c.pw||0)} · ${ago(c.ts)}</small></span>${c.id==PICK?icon('chev',16):''}</button>`).join('')}
 ${list.length<MAX_CHARS?`<button class="ch add" data-act="chNew"><span class="pl">${icon('plus',20)}</span><span><b>Новый персонаж</b><small>Свободно мест: ${MAX_CHARS-list.length}</small></span></button>`:''}</div>
 ${PICK?`<button class="btn wide big" data-act="enter">Войти в игру</button><button class="lnk" data-act="chDel" data-id="${esc(PICK)}">Удалить персонажа</button>`:''}
 <div class="lg-art"><img src="${loginArt()}" alt=""></div><p class="mute ver">v${VERSION} · Powered by VantaStack</p></div>`;
}
ACT.chPick=d=>{if(PICK==d.id)return ACT.enter();PICK=d.id;showLogin()};
ACT.enter=()=>{if(!PICK)return;if(!loadChar(PICK))return toast(TAMPER?'Сохранение было изменено вручную и не прошло проверку подлинности. Восстановите прогресс кодом сохранения':'Не удалось загрузить персонажа');
 daily();mailSync();SCR='home';SP={};render();save();setTimeout(welcomeBack,700)};
ACT.chNew=()=>{if(chars().filter(c=>(c.srv||'eu1')==SRV).length>=MAX_CHARS)return toast('Все места заняты');UI.nm='';newGame()};
ACT.chDel=d=>{const c=chars().find(x=>x.id==d.id);if(!c)return;ask(`Удалить персонажа «${esc(c.name)}» навсегда? Прогресс нельзя будет вернуть.`,()=>{deleteChar(d.id);PICK=null;showLogin();toast('Персонаж удалён')},'Удалить')};
ACT.srvPick=()=>modal(`<h3>Сервер</h3><div class="stack" style="margin-top:10px">${SERVERS.map(s=>`<button class="srv ${s.id==SRV?'on':''}" data-act="srvSet" data-id="${s.id}" ${s.on?'':'disabled'}><span class="dotg ${s.on?'':'off'}"></span><b>${s.n}</b><span>${s.s}</span></button>`).join('')}</div><p class="mute" style="font-size:12px;margin:10px 0 0">Сейчас игра работает без интернета: персонажи хранятся на этом устройстве. Другие регионы откроются вместе с онлайн-режимом.</p>`);
ACT.srvSet=d=>{SRV=d.id;closeModal();showLogin()};
ACT.langPick=()=>modal(`<h3>Language · Язык</h3><div class="langs">${LANGS.map(([c,n])=>`<button class="chip ${c==LANG?'on':''}" data-act="langSet" data-l="${c}">${n}</button>`).join('')}</div>`);
ACT.langSet=d=>{if(d.l==LANG)return closeModal();save();setLang(d.l)};
function boot(data){
 legacyImport();
 document.querySelectorAll('[data-t]').forEach(e=>{const v=T(e.dataset.t);if(e.dataset.br){const w=v.split(' '),h=Math.ceil(w.length/2);e.innerHTML=w.length>1?esc(w.slice(0,h).join(' '))+'<br>'+esc(w.slice(h).join(' ')):esc(v)}else e.textContent=v});
 document.querySelectorAll('[data-ta]').forEach(e=>e.setAttribute('aria-label',T(e.dataset.ta)));document.title=T('Небесный Престол');
 setTimeout(hideSplash,1700);$('#splash').addEventListener('click',hideSplash);
 if(data&&data.S&&data.CID){S=data.S;CID=data.CID;migrate();daily();mailSync();SCR='home';render()}else showLogin();
 setInterval(()=>{if(!S)return;save();if(SCR=='home'&&!BT.active&&$('#modal').hidden){const y=$('#screen').scrollTop;render();$('#screen').scrollTop=y}},15000);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});addEventListener('pagehide',save);
}
