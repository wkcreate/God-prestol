'use strict';
/* Небесный Престол 2.2 — уровни и возвышение, звёзды и слияние, снаряжение, крылья, питомцы, артефакты, платные события, сюжет */

const subTabs=(list,cur)=>`<div class="tabs sub">${list.map(([t,l,dot,lock])=>`<button class="tab ${cur==t?'on':''}" data-act="subT" data-t="${t}">${lock?icon('lock',11)+' ':''}${l}${dot?'<i class="dot"></i>':''}</button>`).join('')}</div>`;
ACT.subT=d=>{SP=Object.assign({},SP,{t:d.t});render()};
const pct=v=>(Math.round(v*1000)/10).toString().replace('.',DEC)+'%';
const lockNote=f=>`<div class="card lockc">${icon('lock',18)}<div><b>${FEAT_N[f]}</b><div class="mute" style="font-size:12.5px">Откроется после главы ${FEAT[f]} «${STORY[FEAT[f]-1].t}» в Летописи. ${storyAvail(FEAT[f])?'Глава уже доступна — прочитайте её.':'Сначала дойдите до главы '+FEAT[f]+' кампании.'}</div></div>${storyAvail(FEAT[f])?`<button class="btn sm" data-act="storyPlay" data-c="${FEAT[f]}">Читать</button>`:''}</div>`;
const storyAvail=c=>c<=curChap();

/* ---------- уровень, возвышение, слияние ---------- */
function capHint(k){const o=po(k);
 if(o.tr==2)return'Достигнут высший предел: Зенит 100';
 if(o.tr==1)return'R1 · 300 — откроется Зенит';
 if(k=='@main')return'Предел уровня растёт с прохождением глав кампании';
 return o.st>=MAX_STAR?'Предел уровня':`Предел ${capOf(k)} ур. Следующая звезда поднимет его до ${starCap(o.st+1)}`;
}
function lvSide(k){
 const a=ascInfo(k),mx=maxLevels(k);
 if(a)return`<button class="ib" data-act="asc" data-k="${k}"><span class="o asc">${icon('asc',22)}</span>Возвышение ${a.n}</button>`;
 return`<button class="ib" data-act="lvl" data-k="${k}" data-n="1"><span class="o">${icon('plus',20,'gi')}</span>Уровень</button><button class="ib" data-act="lvl" data-k="${k}" data-n="10"><span class="o">${icon('chev',20,'gi')}</span>+10</button><button class="ib" data-act="lvl" data-k="${k}" data-n="9999" ${mx?'':'disabled'}><span class="o">${icon('chest',20,'gi')}</span>Макс${mx?' +'+mx:''}</button>`;
}
function lvBlock(k){
 const d=info(k),o=po(k),c=nextCost(k),a=ascInfo(k),main=k=='@main';
 const ess=!main&&d.st<MAX_STAR?Math.max(0,starCost(d.st)-d.sh):0,canE=!main&&d.st<MAX_STAR&&!canStar(k)&&ess>0&&S.ess>=ess;
 return `<div class="row"><span>${o.tr?`<b class="trb t${o.tr}">${TIERS[o.tr].n}</b> `:''}Уровень: <b class="g">${lvCur(k)}/${lvMax(k)}</b></span>${stars(d.st)}<span class="sp mute" style="font-size:12px;text-align:right">${main?'Скин «'+d.skin.n+'»':HERO[k].t+' · '+CLS[d.cls].n}</span></div>
 ${main?'':`<div class="row" style="margin:6px 0 2px;font-size:12px"><span class="mute">Осколки ${d.sh}/${d.st>=MAX_STAR?'—':starCost(d.st)}</span><div class="bar" style="flex:1"><i style="width:${d.st>=MAX_STAR?100:Math.min(100,d.sh/starCost(d.st)*100)}%"></i></div></div>`}
 <div class="row wrap" style="margin-top:8px">${a?`<button class="btn orange" data-act="asc" data-k="${k}">Возвышение до ${a.n} ${costHtml('asc',a.asc)} ${costHtml('silver',a.silver)}</button>`
  :c?`<button class="btn" data-act="lvl" data-k="${k}" data-n="1">Повысить ${costHtml('exp',c.exp)} ${costHtml('silver',c.silver)}${c.asc?' '+costHtml('asc',c.asc):''}</button><span class="g" style="font-size:12px">+${fmt(lvPower(k))} мощи</span>`
  :`<span class="mute" style="font-size:12.5px">${capHint(k)}</span>`}
 ${!main&&d.st<MAX_STAR?`<button class="btn jade" data-act="star" data-k="${k}" ${canE?'data-e="1"':''} ${canStar(k)||canE?'':'disabled'}>Слияние → ${d.st+1}★${canE?' · '+costHtml('ess',ess):''}</button>`:''}</div>`;
}
ACT.asc=d=>{const a=ascInfo(d.k);if(!a)return;if(S.asc<a.asc||S.silver<a.silver)return toast(`Нужно: ${costHtml('asc',a.asc)} ${costHtml('silver',a.silver)}. Камни возвышения — в платных событиях, Лавке Союза, Пути Легенды и с боссов после этапа 300`);
 ask(`Возвысить до ${a.n}? Уровни продолжатся на новой ступени, характеристики вырастут.`,()=>{if(ascend(d.k)){sfx('usr');haptic(60);toast(`Возвышение: ${a.n}!`);save();render()}},'Возвысить')};
ACT.star=d=>{const k=d.k,before=S.h[k]?S.h[k].st:0;if(starUp(k,d.e=='1')){const st=S.h[k].st;sfx('usr');haptic(st>=21?80:30);
  if(st>=21){const f=document.createElement('div');f.className='usrflash';$('#app').appendChild(f);setTimeout(()=>f.remove(),1200);toast('СЛИЯНИЕ! Герой сияет силой 21 звезды')}
  else toast(st%5==1&&st>1?`Новый ранг звёзд: ${STAR_TIER[starTier(st)].n.toLowerCase()}!`:`Звезда ${st}★ · предел уровня ${starCap(st)}`);save();render()}
 else toast(S.h[k]&&S.h[k].st>=MAX_STAR?'Максимум: 21★':`Не хватает осколков: нужно ${starCost(before)}. Повтор героя даёт 10, Звёздная эссенция заменяет недостающие`)};

function starView(k){
 const o=S.h[k],st=o.st;
 const row=(t,from)=>`<div class="strow"><span class="stars t${t}">${[0,1,2,3,4].map(i=>`<i class="${st>=from+i?'':'off'}"></i>`).join('')}</span><span class="mute" style="font-size:12px">${from}–${from+4}★ · ${STAR_TIER[t].n}</span></div>`;
 return `<div class="stack" style="gap:6px;margin-top:10px">${row(0,1)}${row(1,6)}${row(2,11)}${row(3,16)}
 <div class="strow"><span class="stars t4 ${st>=21?'':'dim'}"><i></i><em>СЛИЯНИЕ</em></span><span class="mute" style="font-size:12px">21★ · сияние героя, характеристики ×1,3, крит +5%, скорость +5</span></div></div>
 <div class="card" style="margin-top:10px"><div class="stats"><div class="stat">Сила звёзд<b>×${starMult(st).toFixed(2).replace('.',DEC)}</b></div><div class="stat">Предел уровня<b>${starCap(st)}</b></div>${st<MAX_STAR?`<div class="stat">Следующая звезда<b>×${starMult(st+1).toFixed(2).replace('.',DEC)}</b></div><div class="stat">Слияние стоит<b>${starCost(st)} оск.</b></div>`:''}</div>
 <p class="mute" style="font-size:12px;margin:8px 0 0">Каждый повтор героя из призыва — 10 осколков. Недостающие осколки заменяет Звёздная эссенция (Рулетка Легенд, Пазл Небес, Путь Легенды). ${HERO[k].rar==5?'Осколки героев LR — на Алтаре Легенд.':''}</p></div>`;
}

/* ---------- снаряжение ---------- */
const stTxt=(stObj,mul)=>Object.keys(stObj).map(s=>({atk:'атака',hp:'здоровье',def:'защита',crit:'крит',spd:'скорость'}[s]+' +'+(s=='spd'?Math.round(stObj[s]*mul*10)/10:pct(stObj[s]*mul)))).join(', ');
function gearView(k){
 const o=po(k),dv=divOn(k),an=ancOn(k);
 const slot=g=>{const x=o.eq[g.k],c=gearCost(x),q=GEAR_Q[x[0]];return`<div class="gslot" style="--q:${q.c}"><span class="gi2">${icon(g.ic,22)}</span><div class="gt"><b>${g.n}</b><span style="color:${q.c}">${q.n} +${x[1]}</span><small>${stTxt(g.st,gearPts(x))}</small></div>
  ${c?`<button class="btn sm ${c.up?'orange':''}" data-act="gearUp" data-k="${k}" data-s="${g.k}">${c.up?'Качество ↑':'+1'} ${costHtml('ore',c.ore)}</button>`:'<span class="g" style="font-size:12px">Максимум</span>'}</div>`};
 const extra=(list,kind,on)=>list.map(g=>{const l=(kind=='dv'?o.dv:o.an)[g.k]||0,c=kind=='dv'?divCost(l):ancCost(l),cur=kind=='dv'?'divine':'ancient';
  return`<div class="gslot ${kind} ${on?'':'off'}"><span class="gi2">${icon(g.ic,22)}</span><div class="gt"><b>${g.n}</b><span>Уровень ${l}/${EXTRA_MAX}</span><small>${stTxt(g.st,Math.max(l,1))}${l?'':' за уровень'}</small></div>
  ${!on?icon('lock',16):l<EXTRA_MAX?`<button class="btn sm" data-act="exUp" data-k="${k}" data-x="${kind}" data-s="${g.k}">+1 ${costHtml(cur,c[cur])}</button>`:'<span class="g" style="font-size:12px">Максимум</span>'}</div>`}).join('');
 const req=(f,lv)=>featOn(f)?`<p class="mute exreq">Открывается с ${lv} уровня героя (R1 и Зенит считаются выше 500).</p>`:`<p class="mute exreq">Нужна глава ${FEAT[f]} «${STORY[FEAT[f]-1].t}» в Летописи и ${lv} уровень героя.</p>`;
 return `<div class="stack" style="gap:6px;margin-top:10px"><div class="row"><div class="lbl">Основное снаряжение</div><span class="sp">${costHtml('ore',S.ore)}</span></div>${GEAR.map(slot).join('')}
 <button class="btn jade wide" data-act="gearAll" data-k="${k}">Улучшить всё основное</button>
 <div class="row" style="margin-top:6px"><div class="lbl" style="color:#ffe9a0">Божественное снаряжение</div><span class="sp">${costHtml('divine',S.divine)}</span></div>${dv?'':req('divine',DIV_LV)}${extra(DIVINE,'dv',dv)}
 <div class="row" style="margin-top:6px"><div class="lbl" style="color:#e0b070">Древнее снаряжение</div><span class="sp">${costHtml('ancient',S.ancient)}</span></div>${an?'':req('ancient',ANC_LV)}${extra(ANCIENT,'an',an)}</div>`;
}
ACT.gearUp=d=>{if(gearUp(d.k,d.s)){sfx('coin');save();render()}else toast('Не хватает руды или серебра. Руда — с этапов кампании и в добыче')};
ACT.gearAll=d=>{const p0=powerOf(unitStats(d.k)),n=gearAll(d.k);if(!n)return toast('Не хватает руды или серебра, либо всё на пределе качества');sfx('coin');toast(`Снаряжение: +${n} ур., мощь +${fmt(powerOf(unitStats(d.k))-p0)}`);save();render()};
ACT.exUp=d=>{if(extraUp(d.k,d.x,d.s)){sfx('coin');save();render()}else toast(d.x=='dv'?'Нужна Божественная эссенция и серебро':'Нужны Древние осколки и серебро')};

/* ---------- крылья ---------- */
function wingsView(){
 if(!featOn('wings'))return lockNote('wings');
 const w=S.wing&&WINGS.find(x=>x.id==S.wing),lv=w?S.wings[w.id].lv:0;
 return `<div class="card"><div class="row"><div style="flex:1;min-width:0"><div class="lbl">Надеты</div><b class="gold" style="font-size:16px">${w?w.n:'Нет'}</b>${w?`<div class="g" style="font-size:12.5px">Главный герой: атака, здоровье, защита +${pct(wingMain())}</div>`:''}</div><span>${costHtml('feather',S.feather)}</span></div>
 ${w&&lv<WING_MAX?`<button class="btn wide" style="margin-top:8px" data-act="wingUp" data-id="${w.id}">Уровень ${lv} → ${lv+1} ${costHtml('feather',wingCost(lv))}</button>`:''}
 <p class="mute" style="font-size:12px;margin:8px 0 0">Каждый уровень любых полученных крыльев даёт всему отряду +0,05% к атаке и здоровью.</p></div>
 <div class="grid g3">${WINGS.map(W=>{const own=S.wings[W.id],on=S.wing==W.id;return`<button class="hc r${W.rar} ${on?'in':''} ${own?'':W.craft?'cr':'lock'}" data-act="wing" data-id="${W.id}"><img src="${ART.portrait({key:'wing:'+W.id+':'+S.m.cls,skinKey:S.m.skin,look:Object.assign(ART.mainLook(S.m.cls,S.m.skin),{wings:W.style,wingC:W.c,wingE:W.e})},120,160,'full')}" alt=""><span class="rb">${RAR[W.rar].n}</span>${on?'<span class="tag">НАДЕТЫ</span>':''}<span class="ft"><b>${W.n}</b>${own?'Ур. '+own.lv:W.craft?costHtml('feather',W.craft):'<span style="color:#ff9a7a">Платные события</span>'}</span></button>`}).join('')}</div>`;
}
ACT.wing=d=>{const W=WINGS.find(x=>x.id==d.id);if(S.wings[W.id]){S.wing=W.id;save();toast('Надеты: '+W.n);render();return}
 if(!W.craft)return toast('Эти крылья — в наборах платных событий');
 if(S.feather<W.craft)return toast(`Нужно ${W.craft} перьев. Перья — в Рулетке Легенд, Пазле, событии Бездны и в магазине`);
 ask(`Создать «${W.n}» за ${W.craft} перьев?`,()=>{if(wingCraft(W.id)){S.wing=W.id;sfx('usr');save();render();toast('Крылья созданы и надеты')}},'Создать')};
ACT.wingUp=d=>{if(wingUp(d.id)){sfx('coin');save();render()}else toast('Не хватает перьев')};

/* ---------- питомцы ---------- */
function petsView(){
 if(!featOn('pets'))return lockNote('pets');
 const P=S.pet&&PETS.find(p=>p.id==S.pet),me=P&&S.pets[P.id];
 return `<div class="card petc">${P?`<img src="${ART.portrait(petSpec(P.id),110,110,'card')}" alt="">`:''}<div style="flex:1;min-width:0"><div class="lbl">Ездовой питомец</div><b class="gold" style="font-size:16px">${P?P.n:'Не выбран'}</b>
 ${P?`<div class="g" style="font-size:12.5px">Отряду: атака и здоровье +${pct(PET_BONUS[P.rar]*me.lv)}${P.rar>=5?', скорость +3':''}</div><div class="mute" style="font-size:12px">Уровень ${me.lv}/${PET_MAX}</div>`:''}
 <div class="row wrap" style="margin-top:8px">${P&&me.lv<PET_MAX?`<button class="btn sm" data-act="petUp" data-id="${P.id}">+1 ${costHtml('food',petCost(me.lv))}</button><button class="btn sm sec" data-act="petUp" data-id="${P.id}" data-n="10">+10</button>`:''}<span class="sp">${costHtml('food',S.food)}</span></div></div></div>
 <div class="row"><span class="mute" style="font-size:12.5px;flex:1">Остальные питомцы дают отряду 30% своего бонуса.</span><button class="btn sm jade" data-act="hatch" ${S.egg>0?'':'disabled'}>Высидеть ${costHtml('egg',1)} · ${S.egg}</button></div>
 <div class="grid g3">${PETS.map(p=>{const o=S.pets[p.id],on=S.pet==p.id;return`<button class="hc r${p.rar} ${on?'in':''} ${o?'':p.rar>=5?'lock':'cr'}" data-act="pet" data-id="${p.id}"><img src="${ART.portrait(petSpec(p.id),120,160,'card')}" alt=""><span class="rb">${RAR[p.rar].n}</span>${on?'<span class="tag">ВЕРХОМ</span>':''}<span class="ft"><b>${p.n}</b>${o?'Ур. '+o.lv:p.rar>=5?'<span style="color:#ff9a7a">Платные события</span>':'Из яйца'}</span></button>`}).join('')}</div>`;
}
ACT.pet=d=>{if(S.pets[d.id]){S.pet=d.id;save();toast('Питомец выбран');render()}else toast(PETS.find(p=>p.id==d.id).rar>=5?'Звёздный дракон — в наборах платных событий':'Высиживайте яйца: они в Летописи, Рулетке Легенд, Пути Легенды и магазине')};
ACT.petUp=d=>{let n=0;for(let i=0;i<(+d.n||1);i++)if(petUp(d.id))n++;else break;if(n){sfx('coin');save();render()}else toast('Не хватает корма. Корм — в добыче, Рулетке и магазине')};
ACT.hatch=()=>{const r=hatch();if(!r)return toast('Нет яиц');const P=PETS.find(p=>p.id==r.id);sfx(P.rar>=4?'usr':'reveal');
 modal(`<div style="text-align:center"><div class="lbl">Из яйца вылупился</div><h2 style="margin:6px 0">${P.n}</h2><div style="width:150px;margin:8px auto"><div class="hc r${P.rar}"><img src="${ART.portrait(petSpec(P.id),120,160,'card')}" alt=""><span class="rb">${RAR[P.rar].n}</span></div></div><p class="mute" style="font-size:13px">${r.nu?'Новый питомец!':'Уже есть — получено 200 корма'}</p><button class="btn" data-act="close">Отлично</button></div>`);render()};

/* ---------- артефакты ---------- */
function relicsView(){
 if(!featOn('arts'))return lockNote('arts');
 const tb=teamB();
 return `<div class="card"><div class="row"><div class="lbl">Ячейки отряда · ${S.relEq.filter(Boolean).length}/${RELIC_SLOTS}</div><span class="sp">${costHtml('dust',S.dust)}</span></div>
 <div class="relslots">${S.relEq.map(id=>{const R=id&&RELICS.find(r=>r.id==id);return`<div class="rs ${R?'r'+R.rar:''}">${R?`${icon('relic',22)}<b>${R.n}</b><small>Ур. ${S.relics[id].lv}</small>`:`<span class="mute">Пусто</span>`}</div>`}).join('')}</div>
 <p class="g" style="font-size:12px;margin:8px 0 0">Сейчас отряду: атака +${pct(tb.atk)}, здоровье +${pct(tb.hp)}, защита +${pct(tb.def)}, крит +${pct(tb.crit)}${tb.spd?', скорость +'+Math.round(tb.spd*10)/10:''} (с питомцами и крыльями)</p></div>
 ${RELICS.map(R=>{const o=S.relics[R.id],on=S.relEq.includes(R.id);return`<div class="card row"><span class="em" style="width:44px;height:44px;color:${RAR[R.rar].c}">${icon('relic',22)}</span><div style="flex:1;min-width:0"><b>${R.n}</b> <small style="color:${RAR[R.rar].c}">${RAR[R.rar].n}</small><div class="mute" style="font-size:12px">${stTxt(R.st,o?o.lv:1)}${o?` · ур. ${o.lv}/${RELIC_MAX}`:' за уровень'}</div></div>
  ${o?`<div class="col2"><button class="btn sm ${on?'sec':''}" data-act="relEq" data-id="${R.id}">${on?'Снять':'Надеть'}</button>${o.lv<RELIC_MAX?`<button class="btn sm sec" data-act="relUp" data-id="${R.id}">+1 ${costHtml('dust',relicCost(o.lv))}</button>`:''}</div>`:R.craft?`<button class="btn sm" data-act="relCraft" data-id="${R.id}">Создать ${costHtml('dust',R.craft)}</button>`:'<span style="color:#ff9a7a;font-size:12px">Платные события</span>'}</div>`}).join('')}`;
}
ACT.relEq=d=>{const r=relicEquip(d.id);if(!r)return toast('Все 4 ячейки заняты: сначала снимите артефакт');save();render()};
ACT.relUp=d=>{if(relicUp(d.id)){sfx('coin');save();render()}else toast('Не хватает пыли артефактов')};
ACT.relCraft=d=>{const R=RELICS.find(r=>r.id==d.id);if(S.dust<R.craft)return toast(`Нужно ${R.craft} пыли. Пыль — с боссов, на арене и в Рулетке Легенд`);ask(`Создать «${R.n}» за ${R.craft} пыли?`,()=>{if(relicCraft(R.id)){sfx('usr');save();render();toast('Артефакт создан')}},'Создать')};

/* ---------- платные события ---------- */
const PAID_TABS=[['roul','Рулетка'],['pz','Пазл'],['pass','Путь Легенды'],['packs','Наборы'],['altar','Алтарь']];
VIEW.paid=()=>{const p=SP.p||'roul';
 const head=`<div class="panel lrhead"><div class="row"><span class="em lr">${icon('crown',24)}</span><div style="flex:1;min-width:0"><div class="lbl" style="color:#ffb8a0">Платные события · за золото</div><h2 style="color:#ffd8c8">Эпоха Легенд</h2></div><div style="text-align:right">${costHtml('lrs',S.lrs)}<div class="mute" style="font-size:11px">Осколки Легенды</div></div></div>
 <p class="mute" style="font-size:12.5px;margin:6px 0 0">Осколки Легенды есть только здесь. ${LR_UNLOCK} осколков — герой LR на Алтаре. Золото: ${costHtml('gold',S.gold)}</p></div>`;
 return `<div class="stack">${head}${tabs(PAID_TABS,p)}${p=='pz'?pzView():p=='pass'?passView():p=='packs'?packsView():p=='altar'?altarView():roulView()}</div>`;
};
const rLabel=w=>`${w.k=='lrs'?'':''}${fmt(w.v)} ${{lrs:'Осколков Легенды',ess:'Эссенции',feather:'Перьев',food:'Корма',dust:'Пыли',divine:'Божеств. эсс.',ancient:'Древних оск.',egg:'Яйцо',asc:'Камня возв.',gold:'Золота'}[w.k]}`;
function roulView(){
 const tot=ROUL.reduce((a,w)=>a+w.w,0),R=S.paid.rl;
 return `<div class="panel" style="text-align:center"><h3>Рулетка Легенд</h3><p class="mute" style="font-size:12.5px;margin:4px 0 8px">Гарантия: 50 Осколков Легенды через ${ROUL_PITY-R.p} вращ.</p>
 <div class="wheelbox"><canvas id="roulCv" width="600" height="600" style="transform:rotate(${UI.rRot||0}deg)"></canvas><div class="pointer"></div></div>
 <div class="bar" style="margin:8px 0"><i style="width:${R.p/ROUL_PITY*100}%;background:linear-gradient(90deg,#ff5a3a,#ffd35a)"></i></div>
 <div class="row"><button class="btn" style="flex:1" data-act="roul" data-n="1" ${UI.rSpin?'disabled':''}>Крутить ${costHtml('gold',ROUL_COST)}</button><button class="btn orange" style="flex:1" data-act="roul" data-n="10" ${UI.rSpin?'disabled':''}>×10 ${costHtml('gold',ROUL_COST10)}</button></div></div>
 <div class="card"><div class="lbl">Шансы</div><div class="stack" style="gap:3px;margin-top:6px;font-size:12.5px">${ROUL.map(w=>`<div class="row"><span style="width:10px;height:10px;background:${w.c};flex:none"></span><span style="flex:1">${rLabel(w)}</span><span class="num mute">${(w.w/tot*100).toFixed(1).replace('.0','').replace('.',DEC)}%</span></div>`).join('')}</div></div>`;
}
function drawRoul(){const cv=$('#roulCv');if(!cv)return;const c=cv.getContext('2d'),n=ROUL.length,sg=Math.PI*2/n,R=290;c.clearRect(0,0,600,600);c.save();c.translate(300,300);
 ROUL.forEach((w,i)=>{const a0=-Math.PI/2+i*sg;c.beginPath();c.moveTo(0,0);c.arc(0,0,R,a0,a0+sg);c.closePath();const g=c.createRadialGradient(0,0,40,0,0,R);g.addColorStop(0,ART.dk(w.c,.55));g.addColorStop(1,w.k=='lrs'?'#ff7a4a':ART.lt(w.c,.1));c.fillStyle=g;c.fill();c.lineWidth=3;c.strokeStyle='#ffcf9a';c.stroke();
  c.save();c.rotate(a0+sg/2);c.textAlign='right';c.fillStyle='#fff';c.font='700 23px Rubik,sans-serif';c.shadowColor='#000';c.shadowBlur=4;c.fillText(fmt(w.v)+' '+({lrs:'ЛЕГ.',ess:'ЭСС.',feather:'ПЕР.',food:'КОРМ',dust:'ПЫЛЬ',divine:'БОЖ.',ancient:'ДРЕВ.',egg:'ЯЙЦО',asc:'ВОЗВ.',gold:'ЗОЛ.'}[w.k]),R-20,8);c.restore()});
 c.beginPath();c.arc(0,0,54,0,Math.PI*2);const hg=c.createRadialGradient(-12,-12,4,0,0,54);hg.addColorStop(0,'#ffe0c8');hg.addColorStop(1,'#a8301a');c.fillStyle=hg;c.fill();c.lineWidth=4;c.strokeStyle='#5a1a0a';c.stroke();c.fillStyle='#3a0a04';c.font='700 24px Forum,serif';c.textAlign='center';c.fillText('LR',0,9);c.restore()}
ACT.roul=d=>{if(UI.rSpin)return;const n=+d.n,cost=n==10?ROUL_COST10:ROUL_COST;
 spend('gold',cost,`Рулетка Легенд ×${n}`,()=>{const out=roulSpin(n);if(!out)return;const seg=360/ROUL.length,last=out[out.length-1],base=-(last+.5)*seg+(Math.random()-.5)*seg*.6,cur=UI.rRot||0,tgt=Math.ceil((cur+1440-base)/360)*360+base;UI.rRot=tgt;UI.rSpin=1;
  document.querySelectorAll('[data-act="roul"]').forEach(b=>b.disabled=true);const cv=$('#roulCv');if(cv)cv.style.transform=`rotate(${tgt}deg)`;
  setTimeout(()=>{UI.rSpin=0;const big=out.some(j=>ROUL[j].k=='lrs'&&ROUL[j].v>=20);sfx(big?'usr':'coin');if(big)haptic(40);render();
   const sum={};out.forEach(j=>{const w=ROUL[j];sum[w.k]=(sum[w.k]||0)+w.v});modal(`<div style="text-align:center"><div class="lbl">Рулетка Легенд ×${n}</div><h3 style="margin:6px 0 10px">Награды</h3>${rwHtml(sum,1)}<button class="btn" style="margin-top:12px" data-act="close">Отлично</button></div>`)},n>1?2600:4300)})};
AFTER.paid=()=>{if((SP.p||'roul')=='roul')drawRoul()};

function pzView(){
 const z=S.paid.pz,id=LR_IDS[z.i],h=HERO[id],n=[...Array(16)].filter((_,i)=>(z.open>>i)&1).length;
 return `<div class="panel"><div class="row"><h3 style="flex:1">Пазл Небес №${z.n+1}</h3><span class="mute" style="font-size:12.5px">${n}/16</span></div><p class="mute" style="font-size:12.5px;margin:4px 0 8px">Картина: ${h.n} (LR). Плитка — ${costHtml('gold',PZ_COST)} и награда. Ряд или столбец — ${rwHtml(PZ_LINE)} Вся картина — ${rwHtml(PZ_FULL)}</p>
 <div class="pz" style="--img:url('${ART.portrait(specOf(id),320,320,'card')}')">${[...Array(16)].map((_,i)=>{const o=(z.open>>i)&1;return`<button class="pt ${o?'o':''}" data-act="pz" data-t="${i}" style="--x:${(i%4)*33.333}%;--y:${Math.floor(i/4)*33.333}%" ${o||z.done?'disabled':''}>${o?'':icon('puzzle',18)}</button>`}).join('')}</div>
 ${z.done?`<div class="card" style="text-align:center;margin-top:10px"><b class="gold">Картина собрана!</b><p class="mute" style="font-size:12.5px;margin:4px 0 8px">Следующий пазл — новый герой LR.</p><button class="btn" data-act="pzNext">Следующий пазл</button></div>`:''}</div>`;
}
ACT.pz=d=>{const t=+d.t;spend('gold',PZ_COST,'Открыть плитку',()=>{const r=pzOpen(t);if(!r)return;sfx(r.full?'usr':r.lines?'reveal':'coin');if(r.lines||r.full)haptic(30);
 toast(`Плитка: ${Object.keys(r.r).map(k=>icon(CUR[k].ic,14)+' '+fmt(r.r[k])).join(' ')}${r.lines?` · линии ×${r.lines}: +${5*r.lines} Осколков Легенды`:''}${r.full?' · КАРТИНА СОБРАНА!':''}`);render()})};
ACT.pzNext=()=>{pzNext();render()};

function passView(){
 passSync();const ps=S.paid.ps,pts=passPts(),q=ps.q,dleft=7-((today()+3)%7);
 return `<div class="panel"><div class="row"><h3 style="flex:1">Путь Легенды</h3><span class="mute" style="font-size:12.5px">ещё ${dleft} дн.</span></div>
 <div class="row" style="margin-top:6px"><span>Очки пути: <b class="gold">${pts}</b>/${PASS_TIERS[PASS_TIERS.length-1].p}</span>${ps.prem?'<span class="sp g">Легендарный путь открыт</span>':`<button class="btn sm orange sp" data-act="passBuy">Открыть ${costHtml('gold',PASS_COST)}</button>`}</div>
 <div class="bar" style="margin:8px 0"><i style="width:${pts/PASS_TIERS[PASS_TIERS.length-1].p*100}%;background:linear-gradient(90deg,#ff5a3a,#ffd35a)"></i></div>
 <div class="ptrack"><div class="ph"><span></span><span class="lbl">Обычный</span><span class="lbl" style="color:#ffb8a0">Легендарный</span></div>${PASS_TIERS.map((T,i)=>{const reached=pts>=T.p,gf=ps.got.f.includes(i),gv=ps.got.v.includes(i);
  return`<div class="pr ${reached?'ok':''}"><b>${T.p}</b><button class="pc" data-act="passGet" data-i="${i}" data-tr="f" ${reached&&!gf?'':'disabled'}>${rwHtml(T.f)}${gf?'<i>✓</i>':''}</button><button class="pc v" data-act="passGet" data-i="${i}" data-tr="v" ${reached&&!gv&&ps.prem?'':'disabled'}>${rwHtml(T.v)}${gv?'<i>✓</i>':ps.prem?'':'<i>'+icon('lock',12)+'</i>'}</button></div>`}).join('')}</div></div>
 <div class="card"><div class="lbl">Задания недели</div>${PASS_TASKS.map(t=>{const v=Math.min(t.g,q[t.k]||0);return`<div class="row" style="margin-top:8px;font-size:13px"><span style="flex:1;min-width:0">${t.n}<div class="bar" style="margin-top:4px"><i style="width:${v/t.g*100}%"></i></div></span><span class="num ${v>=t.g?'g':'mute'}">${v}/${t.g}</span><span class="mute" style="width:44px;text-align:right">+${t.p}</span></div>`}).join('')}</div>`;
}
ACT.passBuy=()=>spend('gold',PASS_COST,'Открыть Легендарный путь',()=>{if(passBuy()){sfx('usr');toast('Легендарный путь открыт');render()}});
ACT.passGet=d=>{const r=passClaim(+d.i,d.tr);if(r){sfx('coin');toast('Награда пути получена');render()}};

function packsView(){
 return PACKS.map(P=>{const lk=P.id+':'+weekNo(),left=P.lim-(S.lim[lk]||0),own=(P.r.pet&&S.pets[P.r.pet])||(P.r.wing&&S.wings[P.r.wing])||(P.r.relic&&S.relics[P.r.relic]);
  return`<div class="card row pack"><span class="em lr">${icon(P.r.pet?'pet':P.r.wing?'wing':P.r.relic?'relic':'gift',22)}</span><div style="flex:1;min-width:0"><b>${P.n}</b><div style="margin-top:4px">${rwHtml(P.r)}</div><div class="mute" style="font-size:11.5px;margin-top:3px">${own?'Уже есть':'Осталось на неделе: '+left}</div></div><button class="btn sm orange" data-act="pack" data-id="${P.id}" ${left>0&&!own?'':'disabled'}>${costHtml('gold',P.p)}</button></div>`}).join('');
}
ACT.pack=d=>{const P=PACKS.find(x=>x.id==d.id);spend('gold',P.p,`Купить «${P.n}»`,()=>{if(buyItem(PACKS,P.id)){sfx('usr');toast('Набор получен');render()}else toast('Не хватает золота')})};

function altarView(){
 return `<p class="mute" style="font-size:12.5px;margin:0">Первоначальные — герои ранга LR, сильнейшие в игре. Открыть героя: ${costHtml('lrs',LR_UNLOCK)}. Полученному герою Осколки Легенды переходят в его осколки 1:1 — для слияния звёзд.</p>
 <div class="grid g3">${LR_IDS.map(id=>{const own=!!S.h[id];return`<div class="altc">${heroCard(id,{act:own?'hero':'noop',tag:own?'':'LR'})}<button class="btn sm ${own?'sec':'orange'} wide" data-act="${own?'altarSh':'altarGet'}" data-id="${id}" ${(own?S.lrs>=10:S.lrs>=LR_UNLOCK)?'':'disabled'}>${own?'+10 оск. '+costHtml('lrs',10):'Открыть '+costHtml('lrs',LR_UNLOCK)}</button></div>`}).join('')}</div>`;
}
ACT.altarGet=d=>{ask(`Открыть героя «${HERO[d.id].n}» за ${LR_UNLOCK} Осколков Легенды?`,()=>{if(altarGet(d.id)){sfx('usr');haptic(80);const f=document.createElement('div');f.className='usrflash';$('#app').appendChild(f);setTimeout(()=>f.remove(),1200);toast(`${HERO[d.id].n} присоединяется к отряду легенд!`);render()}},'Открыть')};
ACT.altarSh=d=>{if(altarShards(d.id,10)){sfx('coin');toast('+10 осколков героя');render()}};

/* ---------- сюжет: эпизоды глав и Летопись ---------- */
let STORY_ST=null;
function spkInfo(k){const s=SPK[k]||{n:k};if(k=='@')return{n:S.name,img:ART.portrait(specOf('@main'),150,200)};
 if(s.h)return{n:s.n,img:ART.portrait(specOf(s.h),150,200)};if(s.pet)return{n:s.n,img:ART.portrait(petSpec(s.pet),150,200,'card')};
 if(s.m)return{n:s.n,img:ART.portrait({key:'m:'+s.m[0]+':'+s.m[1]+':b',look:ART.monLook(s.m[0],s.m[1],true),big:1},150,200)};return{n:s.n,img:''}}
function storyShow(c,kind,then){
 const E=STORY[c-1];if(!E)return then&&then();const lines=kind=='b'?(E.b||[]):E.l;if(!lines.length)return then&&then();
 STORY_ST={c,kind,i:0,lines,then};if(kind=='l'&&!S.story.seen.includes(c)){S.story.seen.push(c);save()}if(kind=='b'&&!S.story.bs.includes(c)){S.story.bs.push(c);save()}
 const el=$('#story');el.hidden=false;storyDraw();
}
function storyDraw(){
 const st=STORY_ST,el=$('#story');if(!st)return;const [who,txt]=st.lines[st.i],sp=spkInfo(who),E=STORY[st.c-1],th=themeOf((st.c-1)*STAGES_PER_CH+1),W=Math.min(480,innerWidth);
 el.innerHTML=`<div class="stbg" style="background-image:url('${ART.banner('st'+((st.c-1)%THEMES.length),th,null,W,Math.round(W*1.6))}')"></div>
 <div class="sttop"><span class="lbl">Глава ${st.c} · ${st.kind=='b'?'перед боем':'Летопись'}</span><b>${E.t}</b><button class="btn sm sec" data-act="storySkip">Пропустить</button></div>
 <div class="stbox ${who=='@'?'me':''}" data-act="storyNext">${sp.img?`<img src="${sp.img}" alt="">`:''}<div class="stt"><b>${esc(sp.n)}</b><p>${esc(txt.replace(/\{name\}/g,S.name))}</p><span class="mute">${st.i+1}/${st.lines.length} · нажмите, чтобы продолжить</span></div></div>`;
}
function storyEnd(full){
 const st=STORY_ST;STORY_ST=null;$('#story').hidden=true;$('#story').innerHTML='';if(!st)return;
 let after=st.then;
 if(st.kind=='l'&&full&&!storyDone(st.c)){const r=storyFinish(st.c);const unl=Object.keys(FEAT).filter(f=>FEAT[f]==st.c);sfx('usr');
  modal(`<div style="text-align:center"><div class="lbl">Глава ${st.c} прочитана</div><h3 style="margin:6px 0 10px">«${STORY[st.c-1].t}»</h3>${rwHtml(r,1)}${unl.length?`<p class="g" style="margin:10px 0 0">Открыто: ${unl.map(f=>FEAT_N[f]).join(', ')}</p>`:''}<button class="btn" style="margin-top:12px" data-act="storyClose">Дальше</button></div>`);
  UI.storyThen=after;render();return}
 if(st.kind=='l'&&!full&&!storyDone(st.c))toast('Глава пропущена. Её можно прочитать в Летописи — за чтение дают награду, а сюжет открывает новые системы');
 render();after&&after();
}
ACT.storyNext=()=>{const st=STORY_ST;if(!st)return;if(st.i<st.lines.length-1){st.i++;storyDraw()}else storyEnd(true)};
ACT.storySkip=()=>storyEnd(false);
ACT.storyClose=()=>{closeModal();const f=UI.storyThen;UI.storyThen=null;f&&f()};
ACT.storyPlay=d=>{closeModal();storyShow(+d.c,'l')};
function storyNext(){for(let c=1;c<=Math.min(CHAPTERS,curChap());c++)if(!storyDone(c))return c;return 0}
VIEW.story=()=>{
 const cur=curChap(),done=S.story.done.length;
 return `<div class="stack"><div class="panel"><div class="hdr"><h3>Летопись</h3><small class="sp">${done}/${CHAPTERS}</small></div><p class="mute" style="font-size:12.5px;margin:4px 0 0">Сюжет можно пропускать, но за чтение каждой главы дают награду, а главы 2, 3, 4, 6 и 10 открывают питомцев, крылья, артефакты, божественное и древнее снаряжение.</p></div>
 ${STORY.map((E,i)=>{const c=i+1,av=c<=cur,dn=storyDone(c),unl=Object.keys(FEAT).filter(f=>FEAT[f]==c);return`<div class="card row ${av?'':'locked'}"><b style="width:28px;color:var(--gold)">${c}</b><div style="flex:1;min-width:0"><b>${E.t}</b><div class="mute" style="font-size:12px">${chapName(c)}${unl.length?` · открывает: ${unl.map(f=>FEAT_N[f].toLowerCase()).join(', ')}`:''}</div>${dn?'':`<div style="margin-top:4px">${rwHtml(E.r)}</div>`}</div>
  ${!av?icon('lock',16):`<button class="btn sm ${dn?'sec':'jade'}" data-act="storyPlay" data-c="${c}">${dn?'Перечитать':'Читать'}</button>`}</div>`}).join('')}</div>`;
};
TITLES.story='Летопись';TITLES.paid='Платные события';
