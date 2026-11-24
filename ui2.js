'use strict';
/* Небесный Престол — интерфейс: битвы, арена, события, Союз, призыв, Колесо, магазин */

/* ---------- кампания и испытания ---------- */
VIEW.battle=()=>{
 const s=Math.min(S.stage,MAX_STAGE),c=chapOf(s),first=(c-1)*STAGES_PER_CH+1,et=stageTeam(s),ep=enemyPower(et),mp=teamPower(),boss=stageIn(s)%10==0,d=dots();
 const mode=(ic,t,sub,act,extra,dot)=>`<button class="card mode" data-act="${act}" ${extra||''}><span class="o">${icon(ic,24)}</span><span class="t"><b>${t}</b><span>${sub}</span></span>${dot?'<i class="dot" style="top:10px;right:10px"></i>':''}${icon('chev',18)}</button>`;
 return `<div class="stack">
 <div class="panel"><div class="lbl">Глава ${c} из ${CHAPTERS}</div><h2>${chapName(c)}</h2>
 <div class="path" style="margin-top:14px">${Array.from({length:STAGES_PER_CH},(_,i)=>{const n=first+i,b=stageIn(n)%10==0;return`<div class="node ${n<S.stage?'done':n==S.stage?'cur':''} ${b?'boss':''}"><span>${b?icon('skull',18):stageIn(n)}</span></div>`}).join('')}</div>
 <div class="row wrap" style="margin-top:14px"><div><div class="lbl">Этап ${c}-${stageIn(s)}${boss?' · Босс':''}</div><div style="font-size:13px">Враги <b class="num">${fmt(ep)}</b> · отряд <b class="num" style="color:${mp>=ep?'var(--good)':'var(--bad)'}">${fmt(mp)}</b></div></div><button class="btn sp" data-act="fight" ${S.stage>MAX_STAGE?'disabled':''}>В бой</button></div>
 <div style="margin-top:10px">${rwHtml(stageReward(s))}</div>
 ${(()=>{const h=counterHint(et);return h.fs.length?`<div class="hint">Враги: ${h.fs.map(f=>`<span style="color:${FAC[f].c}">${icon(FAC[f].ic,13)}${FAC[f].n}</span>`).join(' ')}${h.beat.length?` · сильнее против них: ${h.beat.map(f=>`<span style="color:${FAC[f].c}">${icon(FAC[f].ic,13)}${FAC[f].n}</span>`).join(' ')}`:''}</div>`:''})()}
 <div class="row wrap" style="margin-top:10px;gap:6px 10px"><span class="lbl">За главу</span>${rwHtml(CH_REWARD)}<button class="chip sp ${S.set.anx?'on':''}" data-act="anxToggle">${S.set.anx?'✓ ':''}Автопрохождение</button></div></div>
 ${mode('book','Летопись',storyNext()?`Доступна глава ${storyNext()}: «${STORY[storyNext()-1].t}»`:`Прочитано ${S.story.done.length} из ${CHAPTERS} глав`,'go','data-s="story"','',!!storyNext())}
 <div class="lbl">Испытания</div>
 ${mode('arena','Арена',`${league(S.arena.rt)} · рейтинг ${S.arena.rt} · билетов ${S.d.ar}/5`,'go','data-s="arena"',d.arena)}
 ${mode('event',EV_NAME,`Ступень ${S.ev.t}/30 · попыток ${S.d.ev}/5 · главный приз — скин USR`,'go','data-s="events" data-p="ev"',d.ev)}
 ${S.g?mode('skull','Титан Союза',`Уровень ${S.g.boss.lv} · попыток ${S.d.gb}/3`,'go','data-s="guild"'):mode('guild','Союз','Вступите, чтобы открыть Титана и войну кланов','go','data-s="guild"')}
 </div>`;
};
function startStage(){
 const s=S.stage;if(s>MAX_STAGE)return toast('Все главы пройдены. Новые главы появятся в обновлении');
 const team=allyTeam();if(!team.some(Boolean))return toast('Соберите отряд');
 closeModal();const c=chapOf(s);
 if(stageIn(s)==1&&!S.story.seen.includes(c)&&STORY[c-1]){if(BT.active)BT.close();return storyShow(c,'l',startStage)}
 if(stageIn(s)==STAGES_PER_CH&&STORY[c-1]&&STORY[c-1].b&&!S.story.bs.includes(c)){if(BT.active)BT.close();return storyShow(c,'b',startStage)}
 BT.start({title:`${chapName(chapOf(s))} · ${chapOf(s)}-${stageIn(s)}`,theme:themeOf(s),allies:team,enemies:stageTeam(s),onEnd:res=>{
  if(res.win){const r=stageReward(s);give(r);S.stage++;S.st.wins++;quest('win',1);let ch='';
   if(stageIn(s)==STAGES_PER_CH&&S.chr<chapOf(s)){S.chr=chapOf(s);give(CH_REWARD);ch=`<div class="lbl" style="margin-top:8px;color:var(--gold)">Глава ${chapOf(s)} пройдена!</div>${rwHtml(CH_REWARD,1)}`}
   save();const more=S.stage<=MAX_STAGE;
   return{html:`<div class="lbl" style="margin-top:6px">Награда</div>${rwHtml(r,1)}${ch}`,buttons:more?[{t:'Следующий этап',act:'nextStage'}]:[],auto:more&&S.set.anx&&!ch?'nextStage':null,toggle:more}}
  save();return{html:`<p class="mute">Усильте отряд: повысьте уровни и звёзды героев или призовите новых. Порядок в отряде тоже важен.</p>`,buttons:[{t:'Ещё раз',act:'nextStage',cls:'sec'},{t:'Улучшить отряд',act:'bGo',data:'data-s="heroes" data-p="team"'}]};
 }});
}
ACT.fight=()=>startStage();
ACT.nextStage=()=>{BT.close();render();startStage()};
ACT.bExit=()=>{BT.close();render()};
ACT.bGo=d=>{BT.close();go(d.s,d.p?{p:d.p}:null)};
ACT.bSpeed=()=>BT.speed();ACT.bAuto=()=>BT.auto();ACT.bSkip=()=>BT.skip();ACT.bUlt=d=>BT.ultTap(+d.i);ACT.bPause=()=>BT.pause();
ACT.anxStop=()=>BT.stopAuto();
ACT.anxToggle=(d,b)=>{S.set.anx=S.set.anx?0:1;save();if(BT.active){if(!S.set.anx)BT.stopAuto();if(b){b.classList.toggle('on',!!S.set.anx);b.textContent=(S.set.anx?'✓ ':'')+'Автопрохождение этапов'}toast(S.set.anx?'Автопрохождение включено: следующий этап начнётся сам':'Автопрохождение выключено')}else render()};

/* ---------- арена ---------- */
VIEW.arena=()=>{
 const o=arenaOpps(),mp=teamPower();
 return `<div class="stack"><div class="panel"><div class="row"><span class="em">${icon('arena',26)}</span><div style="flex:1"><div class="lbl">Лига</div><h2>${league(S.arena.rt)}</h2></div><div style="text-align:right"><b class="num" style="font-size:22px">${S.arena.rt}</b><div class="mute" style="font-size:12px">${S.arena.w} побед · ${S.arena.l} поражений</div></div></div>
 <div class="row" style="margin-top:12px"><span>Билеты: <b>${S.d.ar}</b>/5 · ${icon('acoin',15)} ${fmt(S.acoin)}</span><button class="btn sm sec sp" data-act="arTicket">+1 билет ${costHtml('gold',50)}</button></div>
 <div class="row" style="margin-top:10px"><div style="flex:1;min-width:0"><div class="lbl">Награда лиги за день</div>${rwHtml(ARENA_DAILY[leagueI(S.arena.rt)])}</div><button class="btn sm ${S.d.arr?'sec':''}" data-act="arDaily" ${S.d.arr?'disabled':''}>${S.d.arr?'Получено':'Забрать'}</button></div></div>
 ${o.map((x,i)=>`<div class="card"><div class="row"><div style="flex:1;min-width:0"><b>${esc(T(x.n))}</b><div class="mute" style="font-size:12px">Рейтинг ${x.rt} · мощь <span style="color:${(x.pw||mp*x.f)>mp*1.05?'var(--bad)':(x.pw||mp*x.f)<mp*.95?'var(--good)':'var(--gold)'}">${fmt(x.pw||mp*x.f)}</span></div></div><button class="btn sm" data-act="arFight" data-i="${i}">Бой</button></div>
 <div class="row" style="gap:4px;margin-top:8px">${x.ids.map(id=>`<img src="${ART.portrait(specOf(id),40,40,'head')}" alt="${HERO[id].n}" style="width:40px;height:40px;border-radius:9px;border:2px solid ${RAR[HERO[id].rar].c}">`).join('')}</div></div>`).join('')}
 <button class="btn sec" data-act="go" data-s="shop" data-p="arena">Лавка арены</button></div>`;
};
ACT.arTicket=()=>spend('gold',50,'Купить билет',()=>{pay('gold',50);S.d.ar++;save();render()});
ACT.arDaily=()=>{if(S.d.arr)return;S.d.arr=1;const r=ARENA_DAILY[leagueI(S.arena.rt)];give(r);save();sfx('coin');toast('Награда лиги «'+league(S.arena.rt)+'» получена');render()};
ACT.arFight=d=>{
 if(S.d.ar<=0)return toast('Билеты закончились: новые будут завтра');
 const o=arenaOpps()[+d.i];S.d.ar--;
 BT.start({title:'Арена · '+T(o.n),theme:THEMES[9],allies:allyTeam(),enemies:npcTeam(o),onEnd:res=>{
  quest('arena',1);S.arena.od=-1;
  if(res.win){const g=12+Math.round(18*o.f);S.arena.rt+=g;S.arena.w++;S.acoin+=60;quest('win',1);save();return{html:`<p>Рейтинг <b>+${g}</b> → ${S.arena.rt} (${league(S.arena.rt)})</p>${rwHtml({acoin:60},1)}`,buttons:[{t:'К арене',act:'bGo',data:'data-s="arena"'}]}}
  S.arena.rt=Math.max(0,S.arena.rt-8);S.arena.l++;S.acoin+=15;save();return{html:`<p>Рейтинг −8 → ${S.arena.rt}</p>${rwHtml({acoin:15},1)}`,buttons:[{t:'К арене',act:'bGo',data:'data-s="arena"'}]};
 }});
};

/* ---------- события ---------- */
VIEW.events=()=>{
 const p=SP.p||'ev',d=dots();
 if(p=='abyss')return `<div class="stack"><button class="btn sec sm" style="align-self:flex-start" data-act="tab" data-p="ev">${icon('chev',14)} Все события</button>${evView()}</div>`;
 return `<div class="stack">${tabs([['ev','Активности',d.ev],['quests','Ежедневно',d.quests],['login','Вход',d.login],['ach','Достижения',d.ach]],p)}${p=='login'?loginView():p=='quests'?questView():p=='ach'?achView():evCards()}</div>`;
};
function evCards(){
 const W=Math.round(Math.min(448,innerWidth)-32),H=98,dleft=7-((today()+3)%7),f=featured();
 const mon=(t,fac,b)=>({key:'m:'+t+':'+fac+(b?':b':''),look:ART.monLook(t,fac,!!b),big:!!b});
 const hero=id=>({key:'h:'+id,look:ART.heroLook(HERO[id])});
 const card=(key,title,sub,st,th,spec,act,data,off,tm)=>`<button class="evc ${off?'off':''}" data-act="${act}" ${data}><img src="${ART.banner(key,th,spec,W,H,off)}" alt=""><span class="t"><b>${title}</b><span>${sub}</span></span><span class="st">${st}</span>${tm?`<span class="tm">${tm}</span>`:''}</button>`;
 return [
  card('abyss',EV_NAME,'30 ступеней демонов Бездны · скин USR',`Ступень ${S.ev.t}/30 · попыток ${S.d.ev}/5`,THEMES[8],mon('dragon','dem',1),'tab','data-p="abyss"',false,'Ещё '+dleft+' дн.'),
  card('paid','Эпоха Легенд','Платные события: рулетка, пазл, путь',`Осколки Легенды: ${S.lrs} · герой LR — ${LR_UNLOCK}`,THEMES[19],hero(LR_IDS[S.paid.pz.i]),'go','data-s="paid"',false,'Неделя'),
  card('prem','Небесный призыв','Герой недели: '+f.n,`Гарантия USR: ${S.pity.prem}/90`,THEMES[9],hero(f.id),'go','data-s="summon" data-p="prem"',false,'Неделя'),
  card('wheel','Колесо Небес','Главный приз — герой USR',S.d.fw>0?'Бесплатное вращение доступно':`Жетонов: ${S.token}`,THEMES[7],hero('lumina'),'go','data-s="summon" data-p="wheel"',false,''),
  card('arena','Арена','Сражения с отрядами соперников',`${league(S.arena.rt)} · билетов ${S.d.ar}/5`,THEMES[2],hero('ragnar'),'go','data-s="arena"',false,'Ежедневно'),
  card('titan'+(S.g?1:0),'Титан Союза','Общий босс гильдии',S.g?`Уровень ${S.g.boss.lv} · попыток ${S.d.gb}/3`:'Откроется после вступления в союз',THEMES[6],mon('dragon','plm',1),'go','data-s="guild"',!S.g,''),
  card('war'+(S.g?1:0),'Война кланов','Недельная битва за рейтинг',S.g?`Место ${warRank()+1} · билетов ${S.d.war}/3`:'Откроется после вступления в союз',THEMES[5],hero('malfas'),'go','data-s="guild"',!S.g,'Пн–Вс')
 ].join('');
}
function loginView(){
 const idx=S.login.k%7,can=S.login.last!==today();
 return `<div class="panel"><h3>Награды за вход</h3><p class="mute" style="font-size:13px;margin:4px 0 12px">Заходите каждый день: на седьмой день — пачка купонов судьбы.</p>
 <div class="grid">${LOGIN.map((r,i)=>{const got=i<idx,cur=i==idx;return `<div class="card" style="padding:8px;text-align:center;${cur?'border-color:var(--gold);box-shadow:0 0 16px #f3cb6b55':''}${got?';opacity:.45':''}"><div class="lbl">День ${i+1}</div><div style="margin:6px 0">${Object.keys(r).map(k=>`<div>${icon(CUR[k].ic,22)}<br><b style="font-size:12px">${fmt(r[k])}</b></div>`).join('')}</div>${got?'<span style="color:var(--good);font-size:12px">Получено</span>':''}</div>`}).join('')}</div>
 <button class="btn wide" style="margin-top:12px" data-act="login" ${can?'':'disabled'}>${can?'Забрать награду дня '+(idx+1):'Возвращайтесь завтра'}</button></div>`;
}
ACT.login=()=>{if(S.login.last===today())return;const r=LOGIN[S.login.k%7];give(r);S.login.k++;S.login.last=today();save();sfx('coin');toast('Награда за вход получена');render()};
function questView(){
 const pts=questPts();
 return `<div class="panel"><div class="hdr"><h3>Задания дня</h3><small class="sp">${pts}/120 очков</small></div>
 <div class="bar" style="margin:10px 0"><i style="width:${pts/120*100}%"></i></div>
 <div class="row" style="justify-content:space-between">${QCHEST.map((c,i)=>{const ok=pts>=c.p,got=S.d.qc.includes(i);return `<button class="btn sm ${got?'sec':ok?'':'sec'}" data-act="qchest" data-i="${i}" ${ok&&!got?'':'disabled'}>${icon('chest',16)} ${c.p}${got?' ✓':''}</button>`}).join('')}</div></div>
 ${QUESTS.map(q=>{const v=Math.min(q.g,S.d.q[q.k]||0);return `<div class="card row"><div style="flex:1;min-width:0"><b>${q.n}</b><div class="bar" style="margin-top:6px"><i style="width:${v/q.g*100}%"></i></div></div><span class="num ${v>=q.g?'':'mute'}" style="${v>=q.g?'color:var(--good)':''}">${v}/${q.g}</span></div>`}).join('')}`;
}
ACT.qchest=d=>{const i=+d.i,c=QCHEST[i];if(questPts()<c.p||S.d.qc.includes(i))return;S.d.qc.push(i);give(c.r);save();sfx('coin');toast('Сундук открыт');render()};
function evView(){
 const t=S.ev.t,next=t<30?evReward(t+1):null,team=evTeam(Math.min(30,t+1)),ep=enemyPower(team);
 const rwText=r=>r.skin?`<span class="pill">${icon('skin',16)}<b>Скин «Демон пустоты» USR</b></span>`:rwHtml(r);
 return `<div class="panel" style="background:linear-gradient(180deg,#2a0a3a,#0f0820) padding-box,linear-gradient(140deg,#c05cff,#34437f 40%,#34437f 60%,#c05cff) border-box"><div class="lbl" style="color:#e0b0ff">Событие недели</div><h2 style="color:#f0d0ff">${EV_NAME}</h2>
 <p class="mute" style="font-size:13px;margin:4px 0 10px">Демоны Бездны штурмуют Престол. Пройдите 30 ступеней до конца недели. Каждая ступень сильнее предыдущей, прогресс сбрасывается в понедельник.</p>
 <div class="row"><span>Ступень <b>${t}</b>/30</span><span class="sp mute" style="font-size:13px">Попыток сегодня: ${S.d.ev}/5</span></div><div class="bar" style="margin:8px 0"><i style="width:${t/30*100}%;background:linear-gradient(90deg,#c05cff,#ff7ae0)"></i></div>
 ${next?`<div class="row wrap"><div><div class="lbl">Награда за ступень ${t+1}</div>${rwText(next)}</div><button class="btn sp" data-act="evFight" ${S.d.ev>0?'':'disabled'}>Бой · ${fmt(ep)}</button></div>`:'<b style="color:var(--good)">Все ступени пройдены на этой неделе</b>'}</div>
 <div class="card"><div class="lbl">Награды ступеней</div><div class="stack" style="gap:6px;margin-top:8px">${[5,10,15,20,25,30].map(n=>`<div class="row" style="${n<=t?'opacity:.45':''}"><b style="width:28px">${n}</b>${rwText(evReward(n))}${n<=t?'<span class="sp" style="color:var(--good)">✓</span>':''}</div>`).join('')}</div></div>`;
}
ACT.evFight=()=>{
 if(S.d.ev<=0||S.ev.t>=30)return;const t=S.ev.t+1;S.d.ev--;
 BT.start({title:EV_NAME+' · ступень '+t,theme:THEMES[8],allies:allyTeam(),enemies:evTeam(t),onEnd:res=>{
  if(res.win){S.ev.t=t;const r=evReward(t);let html;if(r.skin){if(!S.m.skins.includes('void')){S.m.skins.push('void');html='<p>Получен скин USR «Демон пустоты»! Наденьте его на экране героя.</p>'}else{S.gold+=2000;html=rwHtml({gold:2000},1)}}else{give(r);html=rwHtml(r,1)}quest('win',1);save();
   return{html:`<div class="lbl" style="margin-top:6px">Награда</div>${html}`,buttons:t<30&&S.d.ev>0?[{t:'Следующая ступень',act:'evNext'}]:[{t:'К событию',act:'bGo',data:'data-s="events" data-p="ev"'}]}}
  save();return{html:'<p class="mute">Попытка потрачена. Усильте отряд и возвращайтесь.</p>',buttons:[{t:'К событию',act:'bGo',data:'data-s="events" data-p="ev"'}]};
 }});
};
ACT.evNext=()=>{BT.close();ACT.evFight()};

/* ---------- Союз ---------- */
VIEW.guild=()=>{
 if(!S.g)return `<div class="stack"><div class="panel"><h2>Союз</h2><p class="mute" style="font-size:13px;margin:4px 0 0">Вступите в гильдию, чтобы сражаться с Титаном Союза, воевать с кланами и покупать редкие товары в Лавке Союза.</p></div>
 ${guildOffers().map(g=>`<div class="card row"><span class="em">${icon('guild',22)}</span><div style="flex:1;min-width:0"><b>${esc(T(g.n))}</b><div class="mute" style="font-size:12px">Уровень ${g.lv} · ${g.mem}/40 участников</div></div><button class="btn sm" data-act="gJoin" data-n="${g.n}" data-l="${g.lv}">Вступить</button></div>`).join('')}
 <div class="card"><div class="lbl">Свой союз</div><div class="row" style="margin-top:8px"><input id="gName" maxlength="20" placeholder="Название союза"><button class="btn sm" data-act="gCreate">${costHtml('gold',300)}</button></div></div></div>`;
 const g=S.g,b=g.boss,w=g.war,rk=warRank();
 const riv=w.riv.map((r,i)=>({...r,i,pts:rivPts(r)})).concat([{n:g.name,pts:w.pts,me:1}]).sort((a,b)=>b.pts-a.pts);
 return `<div class="stack">
 <div class="panel"><div class="row"><span class="em" style="width:56px;height:56px">${icon('guild',30)}</span><div style="flex:1;min-width:0"><div class="lbl">Союз · уровень ${g.lv}</div><h2 style="font-size:24px">${esc(T(g.name))}</h2></div><button class="btn sm ${S.d.ci?'sec':''}" data-act="gCheck" ${S.d.ci?'disabled':''}>${S.d.ci?'Отмечено':'Отметиться'}</button></div>
 <div class="bar" style="margin-top:10px"><i style="width:${g.xp/(g.lv*500)*100}%"></i></div><div class="row" style="margin-top:6px;font-size:12px"><span class="mute">Опыт союза ${g.xp}/${g.lv*500}</span><span class="sp">${icon('gcoin',14)} ${fmt(S.gcoin)}</span></div></div>
 ${S.gw?`<div class="card row" style="border-color:var(--gold)"><div style="flex:1"><b>Итоги войны кланов</b><div class="mute" style="font-size:12px">Место ${S.gw.rank+1} на прошлой неделе</div></div><button class="btn sm" data-act="gwClaim">${costHtml('gold',S.gw.gold)}</button></div>`:''}
 <div class="card"><div class="hdr"><h3>Титан Союза</h3><small class="sp">Уровень ${b.lv}</small></div><div class="bar" style="margin:10px 0"><i style="width:${b.hp/gbMax(b.lv)*100}%;background:linear-gradient(90deg,#ff5d6c,#ff9a4a)"></i></div>
 <div class="row"><span class="mute" style="font-size:13px">${fmt(b.hp)} / ${fmt(gbMax(b.lv))} · урон копится всем союзом</span><button class="btn sm sp" data-act="gBoss" ${S.d.gb>0?'':'disabled'}>Атака ${S.d.gb}/3</button></div></div>
 <div class="card"><div class="hdr"><h3>Война кланов</h3><small class="sp">Место ${rk+1} · билеты ${S.d.war}/3</small></div><p class="mute" style="font-size:12.5px;margin:4px 0 8px">Атакуйте защитников вражеских кланов. За первую победу над кланом — бонус 100 очков. Награда по итогам недели.</p>
 <div class="stack" style="gap:6px">${riv.map((r,i)=>`<div class="row" style="${r.me?'color:var(--gold)':''}"><b style="width:20px">${i+1}</b><span style="flex:1;min-width:0">${esc(T(r.n))}${r.beat?' <span style="color:var(--good)">✓</span>':''}</span><span class="num">${fmt(r.pts)}</span>${r.me?'<span style="width:62px"></span>':`<button class="btn sm sec" data-act="gWar" data-i="${r.i}" ${S.d.war>0?'':'disabled'} style="width:62px">Атака</button>`}</div>`).join('')}</div></div>
 <div class="card"><div class="hdr"><h3>Участники</h3><small class="sp">${g.mem.length+1}</small></div><div class="stack" style="gap:6px;margin-top:8px"><div class="row" style="color:var(--gold)"><span style="flex:1">${esc(S.name)} (вы)</span><span class="num">${fmt(teamPower())}</span></div>${g.mem.map(m=>`<div class="row"><span style="flex:1;min-width:0">${esc(T(m.n))} <span class="mute" style="font-size:12px">${esc(T(m.r))}</span></span><span class="num mute">${fmt(m.p)}</span></div>`).join('')}</div></div>
 <div class="row"><button class="btn sec" style="flex:1" data-act="go" data-s="shop" data-p="guild">Лавка Союза</button><button class="btn sec" data-act="gLeave">Покинуть</button></div></div>`;
};
ACT.gJoin=d=>{joinGuild(d.n,+d.l);toast('Вы вступили в союз «'+T(d.n)+'»');render()};
ACT.gCreate=()=>{const n=($('#gName').value||'').trim().slice(0,20);if(!n)return toast('Введите название');if(!canPay('gold',300))return spend('gold',300,'',()=>{});pay('gold',300);joinGuild(n,1);S.g.mem.forEach((m,i)=>m.r=i<2?K('Старейшина'):K('Участник'));render();toast('Союз «'+n+'» основан')};
ACT.gCheck=()=>{if(S.d.ci)return;S.d.ci=1;S.gcoin+=150;gXP(60);save();sfx('coin');toast(`Отметка: +150 ${icon('gcoin',14)}`);render()};
ACT.gwClaim=()=>{if(!S.gw)return;S.gold+=S.gw.gold;S.gw=null;save();sfx('coin');render()};
ACT.gLeave=()=>ask('Покинуть союз? Прогресс войны кланов и Титана будет потерян.',()=>{S.g=null;save();render()},'Покинуть');
ACT.gBoss=()=>{
 if(S.d.gb<=0)return;S.d.gb--;const b=S.g.boss,st=rawStats('mag',10+b.lv*9,1,2.4);st.hp=b.hp;st.mhp=gbMax(b.lv);
 const boss=monUnit('dragon','dem',st,{boss:1,name:'Титан Союза · ур. '+b.lv});
 BT.start({title:'Титан Союза',theme:THEMES[8],allies:allyTeam(),enemies:[null,null,null,boss,null],max:60,onEnd:res=>{
  const u=res.units.find(x=>x.side=='E'),dmg=Math.round(b.hp-u.hp);b.hp=Math.max(0,u.hp);
  const gc=Math.min(400,40+Math.floor(dmg/gbMax(b.lv)*1200));let extra='';
  if(b.hp<=0){S.gold+=200*b.lv;extra=`<p style="color:var(--good)">Титан повержен! +${200*b.lv} золота всем участникам</p>`;b.lv++;b.hp=gbMax(b.lv)}
  S.gcoin+=gc;gXP(30);save();return{title:b.lv>1&&extra?'Титан повержен':'Атака завершена',html:`<p>Нанесено урона: <b>${fmt(dmg)}</b></p>${extra}${rwHtml({gcoin:gc},1)}`,buttons:[{t:'К союзу',act:'bGo',data:'data-s="guild"'}]};
 }});
};
ACT.gWar=d=>{
 if(S.d.war<=0)return;const r=S.g.war.riv[+d.i],t=heroTeamAt(r.ids,teamPower()*r.f);S.d.war--;
 BT.start({title:'Война кланов · '+T(r.n),theme:THEMES[6],allies:allyTeam(),enemies:npcTeam({ids:r.ids,lv:t.lv,st:t.st}),onEnd:res=>{
  if(res.win){const p=Math.round(120*r.f)+(r.beat?0:100);r.beat=1;S.g.war.pts+=p;gXP(20);quest('win',1);save();return{html:`<p>Очки клана: <b>+${p}</b> · место ${warRank()+1}</p>`,buttons:[{t:'К союзу',act:'bGo',data:'data-s="guild"'}]}}
  save();return{html:'<p class="mute">Защитники устояли. Попробуйте клан послабее.</p>',buttons:[{t:'К союзу',act:'bGo',data:'data-s="guild"'}]};
 }});
};

/* ---------- призыв ---------- */
VIEW.summon=()=>{
 const p=SP.p||'std',d=dots();
 const head=tabs([['std','Звёзды',S.d.fs>0],['prem','Небесный'],['cpn','Купоны'],['wheel','Колесо',d.wheel]],p);
 if(p=='wheel')return `<div class="stack">${head}${wheelView()}</div>`;
 const b=BANNERS.find(x=>x.id==p),f=featured(),free=p=='std'&&S.d.fs>0,c1=b.c1,c10=b.c10;
 return `<div class="stack">${head}
 <div class="banner"><canvas id="banCv"></canvas><div class="bi"><div class="lbl" style="color:#fff3c8">${p=='prem'?'Герой недели: '+f.n:p=='cpn'?'Только UR, SSR и SSR+':'Обычный призыв'}</div><h2>${b.n}</h2><p>${b.d}</p></div></div>
 <div class="card"><div class="row wrap" style="gap:6px">${b.rates.map((r,i)=>r>0?`<span class="chip" style="color:${RAR[i].c}">${RAR[i].n} ${r}%</span>`:'').join('')}</div>
 ${b.pity?`<div class="row" style="margin-top:10px;font-size:13px"><span>Гарантия ${RAR[b.pr].n}</span><span class="sp num">${S.pity[b.pk]||0}/${b.pity}</span></div><div class="bar" style="margin-top:6px"><i style="width:${(S.pity[b.pk]||0)/b.pity*100}%;background:linear-gradient(90deg,#ff7ae0,#7ad8ff,#ffe27a)"></i></div>`:''}
 ${p=='std'&&S.first10?'<p class="mute" style="font-size:12.5px;margin:8px 0 0">Первый призыв ×10 гарантирует героя SSR.</p>':''}
 <div class="row" style="margin-top:10px;font-size:13px"><span class="mute">У вас:</span>${costHtml(b.cur,S[b.cur])}<button class="chip sp" data-act="sumHist">История призывов</button></div></div>
 <div class="row"><button class="btn sec" style="flex:1" data-act="sum" data-b="${p}" data-n="1">${free?'Бесплатно':'×1 '+costHtml(b.cur,c1)}</button><button class="btn" style="flex:1" data-act="sum" data-b="${p}" data-n="10">×10 ${costHtml(b.cur,c10)}</button></div></div>`;
};
AFTER.summon=()=>{
 const cv=$('#banCv');if(!cv)return;const w=cv.clientWidth,h=cv.clientHeight,c=cv.getContext('2d');cv.width=w*ART.DPR;cv.height=h*ART.DPR;c.scale(ART.DPR,ART.DPR);
 const p=SP.p||'std',th=p=='prem'?THEMES[9]:p=='cpn'?THEMES[7]:THEMES[3];ART.bg(c,w,h,th,'home',3);
 const ids=p=='prem'?[HEROES.filter(x=>x.rar==4&&x.id!=featured().id)[0].id,featured().id,HEROES.filter(x=>x.rar==4&&x.id!=featured().id)[3].id]:p=='cpn'?['tern','arden','mihaela']:['elvira','rin','lilit'];
 c.save();c.globalAlpha=.5;for(let i=0;i<12;i++){c.beginPath();c.moveTo(w/2,h*.35);c.arc(w/2,h*.35,w,i*.52,i*.52+.18);c.closePath();c.fillStyle='#fff3c8';c.fill()}c.restore();
 [[.2,.58,.22],[.8,.58,.22],[.5,.66,.3]].forEach(([x,y,s],i)=>{const sp=ART.sprite(unitSpec0(ids[i==2?1:i==0?0:2]),i==2?200:150),sz=w*s,ww=sz*1.15,hh=sz*1.3*1.15;c.drawImage(sp,w*x-ww/2,h*y-hh*.62,ww,hh)});
};
function unitSpec0(id){return{key:'h:'+id,look:ART.heroLook(HERO[id])}}
ACT.sum=d=>{const c=sumCost(d.b,+d.n),b=BANNERS.find(x=>x.id==d.b);
 spend(c.cur,c.n,`${b.n} ×${d.n}`,()=>{const res=summon(d.b,+d.n);if(!res)return toast('Не хватает: '+CUR[b.cur].n.toLowerCase());showSummon(res,d.b,+d.n);render()})};
ACT.sumHist=()=>{const L=S.hist.slice(0,100),bn={std:'Звёзды',prem:'Небесный',cpn:'Купоны',wheel:'Колесо',altar:'Алтарь'};
 modal(`<h3>История призывов</h3><p class="mute" style="font-size:12.5px;margin:4px 0 10px">Последние ${L.length} героев. Шансы каждого призыва указаны на его баннере.</p>
 ${L.length?`<div class="stack" style="gap:4px">${L.map(x=>{const h=HERO[x.id];return h?`<div class="row" style="font-size:12.5px"><b style="width:44px;color:${RAR[h.rar].c}">${RAR[h.rar].n}</b><span style="flex:1;min-width:0">${h.n}</span><span class="mute">${bn[x.b]||''} · ${new Date(x.t).toLocaleDateString(LOCALE,{day:'numeric',month:'short'})}</span></div>`:''}).join('')}</div>`:'<p class="mute">Пока пусто.</p>'}`)};
let sumT=[];
function showSummon(res,bid,n){
 sumT.forEach(clearTimeout);sumT=[];
 modal(`<h3 style="text-align:center">Призыв</h3><div class="sumres ${res.length==1?'one':''}" style="margin-top:12px">${res.map(r=>{const h=HERO[r.id];return `<div class="fc b${h.rar}" style="--rc:${RAR[h.rar].c}"><div class="bk">${icon('summon',24)}</div><div class="fr">${heroCard(r.id,{act:'noop',tag:r.nu?'НОВЫЙ':r.gold?'+'+r.gold+' ЗОЛ.':'+10 ОСК.'})}</div></div>`}).join('')}</div>
 ${res.some(r=>r.gold)?'<p class="mute" style="font-size:12px;text-align:center;margin:8px 0 0">Герои на 21★ больше не копят осколки: повторы превращаются в золото.</p>':''}
 <div class="row" style="margin-top:14px;justify-content:center">${n>1?'<button class="btn sec" data-act="sumAll">Показать всех</button>':''}<button class="btn sec" data-act="close">Готово</button><button class="btn" data-act="sum" data-b="${bid}" data-n="${n}">Ещё ×${n}</button></div>`);
 const reveal=(c,i)=>{if(!c.isConnected||c.classList.contains('show'))return;c.classList.add('show');const rar=HERO[res[i].id].rar;sfx(rar>=4?'usr':'reveal');if(rar>=3)haptic(rar>=4?60:20);if(rar>=4){const f=document.createElement('div');f.className='usrflash';$('#app').appendChild(f);setTimeout(()=>f.remove(),1200)}};
 const cs=[...document.querySelectorAll('#modal .fc')];cs.forEach((c,i)=>sumT.push(setTimeout(()=>reveal(c,i),250+i*200)));
 ACT.sumAll=()=>{sumT.forEach(clearTimeout);sumT=[];cs.forEach((c,i)=>reveal(c,i))};
}
function wheelView(){
 const tot=WHEEL.reduce((a,w)=>a+w.w,0),cost=S.d.fw>0?'Бесплатно':S.token>0?'Крутить · '+costHtml('token',1):'Крутить · '+costHtml('gold',150);
 return `<div class="panel" style="text-align:center"><h2>Колесо Небес</h2><p class="mute" style="font-size:13px;margin:4px 0 10px">Главный приз — герой USR. Гарантия через 100 вращений.</p>
 <div class="wheelbox"><canvas id="wheelCv" width="600" height="600" style="transform:rotate(${UI.wRot}deg)"></canvas><div class="pointer"></div></div>
 <div class="row" style="justify-content:center;font-size:13px;margin:6px 0 10px"><span>До гарантии: <b>${100-S.pity.wheel}</b></span><span>${costHtml('token',S.token)}</span></div>
 <div class="row"><button class="btn" style="flex:1" data-act="spin" ${UI.spinning?'disabled':''}>${cost}</button><button class="btn sec" data-act="spin10" ${UI.spinning?'disabled':''}>×10</button></div></div>
 <div class="card"><div class="lbl">Шансы</div><div class="stack" style="gap:4px;margin-top:8px;font-size:13px">${WHEEL.map(w=>`<div class="row"><span style="flex:1">${w.l}</span><span class="num mute">${(w.w/tot*100).toFixed(1).replace('.0','')}%</span></div>`).join('')}</div></div>`;
}
AFTER.summon0=AFTER.summon;
AFTER.summon=()=>{if((SP.p||'std')=='wheel')drawWheel();else AFTER.summon0()};
function drawWheel(){
 const cv=$('#wheelCv');if(!cv)return;const c=cv.getContext('2d'),n=WHEEL.length,sg=Math.PI*2/n,R=290;c.clearRect(0,0,600,600);c.save();c.translate(300,300);
 WHEEL.forEach((w,i)=>{const a0=-Math.PI/2+i*sg;c.beginPath();c.moveTo(0,0);c.arc(0,0,R,a0,a0+sg);c.closePath();
  const g=c.createRadialGradient(0,0,40,0,0,R);g.addColorStop(0,ART.dk(w.c,.5));g.addColorStop(1,w.k=='usr'?'#ff7ae0':w.k=='ssr'?'#ffd35a':ART.lt(w.c,.15));c.fillStyle=g;c.fill();c.lineWidth=3;c.strokeStyle='#f3cb6b';c.stroke();
  c.save();c.rotate(a0+sg/2);c.textAlign='right';c.fillStyle='#ffffff';c.font='700 24px Rubik,sans-serif';c.shadowColor='#000';c.shadowBlur=4;c.fillText(w.l,R-22,8);c.restore()});
 c.beginPath();c.arc(0,0,52,0,Math.PI*2);const hg=c.createRadialGradient(-12,-12,4,0,0,52);hg.addColorStop(0,'#fff3c8');hg.addColorStop(1,'#a8782a');c.fillStyle=hg;c.fill();c.lineWidth=4;c.strokeStyle='#6a4a14';c.stroke();
 c.fillStyle='#4a2f08';c.font='700 26px Forum,serif';c.textAlign='center';c.fillText('НЕБО',0,9);c.restore();
}
ACT.spin10=()=>{if(UI.spinning)return;const c=spinCost(10);
 const go10=()=>{const out=spinMany(10);if(!out.length)return toast('Нужны жетоны или золото');sfx(out.some(r=>WHEEL[r.i].k=='usr')?'usr':'coin');render();
  modal(`<h3 style="text-align:center">Колесо Небес ×${out.length}</h3><div class="stack" style="gap:5px;margin-top:10px">${out.map(r=>{const w=WHEEL[r.i];return `<div class="row" style="font-size:13px"><span style="width:10px;height:10px;background:${w.c};flex:none"></span><span style="flex:1">${esc(r.txt)}</span>${w.k=='usr'||w.k=='ssr'?'<b style="color:var(--gold)">★</b>':''}</div>`}).join('')}</div><div class="row" style="justify-content:center;margin-top:12px"><button class="btn" data-act="close">Отлично</button></div>`)};
 if(c.gold>0)spend('gold',c.gold,`10 вращений (жетонов ${c.tok}, остальное золотом)`,go10);else go10()};
ACT.spin=()=>{
 if(UI.spinning)return;if(S.d.fw<=0&&S.token<=0&&S.gold<150)return spend('gold',150,'Вращение',()=>{});const r=spinWheel();if(!r)return toast('Нужен жетон или 150 золота');
 UI.spinning=1;const seg=360/WHEEL.length,base=-(r.i+.5)*seg+(Math.random()-.5)*seg*.6,cur=UI.wRot;let tgt=Math.ceil((cur+1800-base)/360)*360+base;UI.wRot=tgt;
 const btn=document.querySelector('[data-act="spin"]');if(btn)btn.disabled=true;
 const cv=$('#wheelCv');if(cv)cv.style.transform=`rotate(${tgt}deg)`;
 setTimeout(()=>{UI.spinning=0;const w=WHEEL[r.i];sfx(w.k=='usr'?'usr':'coin');render();
  modal(`<div style="text-align:center"><div class="lbl">Колесо Небес</div><h2 style="margin:6px 0">${esc(r.txt)}</h2>${r.hero?`<div style="width:140px;margin:10px auto">${heroCard(r.hero.id,{act:'noop',tag:r.hero.nu?'НОВЫЙ':'+10 ОСК.'})}</div>`:''}<button class="btn" data-act="close">Отлично</button></div>`)},4300);
};

/* ---------- магазин ---------- */
const donPrice=g=>(g*(g<450?.0165:g<1000?.0151:g<2600?.0147:g<10000?.0152:g<1e5?.0135:g<1e6?.012:.0098));
VIEW.shop=()=>{
 const p=SP.p||'gold';
 let body='';
 if(p=='gold'&&NATIVE)body=`<div class="card"><div class="lbl">Золото</div><p style="font-size:13px;margin:6px 0 0">Покупка золота появится в одном из обновлений. Сейчас золото дают этапы кампании, добыча, вход, задания дня, достижения, почта и подарок дня во вкладке «Товары».</p></div>`;
 else if(p=='gold')body=`<div class="card"><div class="lbl" style="color:var(--bad)">Тестовый режим</div><p class="mute" style="font-size:12.5px;margin:4px 0 0">Оплата не подключена: кнопки выдают золото бесплатно, деньги не списываются. Перед выпуском в Google Play и App Store здесь подключаются их встроенные покупки.</p></div>
 <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${DON.map((x,i)=>`<button class="card" style="padding:10px;text-align:center" data-act="don" data-i="${i}"><div style="color:var(--gold)">${icon('gold',34)}</div><b class="num" style="display:block;font-size:17px">${fmt(x.g)}</b><span class="btn sm" style="margin-top:6px">$${x.p}</span></button>`).join('')}</div>
 <div class="card"><div class="lbl">Своя сумма</div><div class="row" style="margin-top:8px"><input id="dnIn" type="number" min="10" max="100000000" value="1000" inputmode="numeric"><span id="dnP" class="num" style="white-space:nowrap;color:var(--gold)">$${donPrice(1000).toFixed(2)}</span><button class="btn sm" data-act="donC">Купить</button></div><p class="mute" style="font-size:12px;margin:6px 0 0">От 10 до 100 000 000 золота. Чем больше, тем выгоднее.</p></div>`;
 else if(p=='items'){const g=DAILY_GIFT[today()%DAILY_GIFT.length];body=`<div class="card row" style="border-color:var(--gold2)"><span style="color:var(--gold)">${icon('gift',30)}</span><div style="flex:1;min-width:0"><b>Подарок дня</b><div style="margin-top:4px">${rwHtml(g)}</div></div><button class="btn sm ${S.d.gift?'sec':'jade'}" data-act="gift" ${S.d.gift?'disabled':''}>${S.d.gift?'Завтра':'Бесплатно'}</button></div>`+SHOP_ITEMS.map(it=>itemRow(it)).join('')}
 else if(p=='skins')body=`<div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${SKINS.filter(s=>s.r>=0).map(skinCard).join('')}</div>`;
 else if(p=='guild')body=`<div class="card row"><span>Монеты Союза</span><span class="sp">${costHtml('gcoin',S.gcoin)}</span></div>${S.g?GSHOP.map(it=>itemRow(it)).join(''):'<p class="mute">Лавка открывается после вступления в союз.</p>'}`;
 else body=`<div class="card row"><span>Знаки арены</span><span class="sp">${costHtml('acoin',S.acoin)}</span></div>${ASHOP.map(it=>itemRow(it)).join('')}`;
 return `<div class="stack">${tabs([['gold','Золото'],['items','Товары',!S.d.gift],['skins','Скины'],['guild','Союз'],['arena','Арена']],p)}${body}</div>`;
};
function itemRow(it){
 const k=Object.keys(it.r)[0],lk=it.id+':'+weekNo(),left=it.lim?it.lim-(S.lim[lk]||0):null;
 const name=k=='usrShard'?`10 осколков героя USR`:`${CUR[k].n} × ${fmt(it.r[k])}`;
 return `<div class="card row"><span style="color:var(--gold)">${icon(CUR[k].ic,30)}</span><div style="flex:1;min-width:0"><b>${name}</b>${left!=null?`<div class="mute" style="font-size:12px">Осталось на неделе: ${left}</div>`:''}</div><button class="btn sm" data-act="buy" data-id="${it.id}" ${left===0?'disabled':''}>${costHtml(it.cur,it.p)}</button></div>`;
}
ACT.buy=d=>{const list=[...SHOP_ITEMS,...GSHOP,...ASHOP];const it=list.find(x=>x.id==d.id);if(it.cur=='gcoin'&&!S.g)return toast('Нужен союз');
 const k=Object.keys(it.r)[0];spend(it.cur,it.p,`Купить «${k=='usrShard'?'осколки USR':CUR[k].n} × ${fmt(it.r[k])}»`,()=>{if(!buyItem(list,d.id))return toast('Не хватает: '+CUR[it.cur].n.toLowerCase());sfx('coin');toast('Покупка совершена');render()})};
ACT.gift=()=>{if(S.d.gift)return;S.d.gift=1;const g=DAILY_GIFT[today()%DAILY_GIFT.length];give(g);save();sfx('coin');toast('Подарок дня получен');render()};
ACT.don=d=>{const x=DON[+d.i];if(NATIVE)return;if(DONATE_LIVE)return toast('Платёжный провайдер не подключён');S.gold+=x.g;save();sfx('coin');toast(`Тестовый режим: +${fmt(x.g)} золота без оплаты`);render()};
ACT.donC=()=>{if(NATIVE)return;const v=Math.floor(+$('#dnIn').value||0);if(v<10||v>1e8)return toast('От 10 до 100 000 000');if(DONATE_LIVE)return toast('Платёжный провайдер не подключён');S.gold+=v;save();sfx('coin');toast(`Тестовый режим: +${fmt(v)} золота без оплаты`);render()};
document.addEventListener('input',e=>{if(e.target&&e.target.id=='dnIn'){const v=Math.max(0,Math.floor(+e.target.value||0));$('#dnP').textContent='$'+donPrice(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}});

