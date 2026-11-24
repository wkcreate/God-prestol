'use strict';
/* Небесный Престол — достижения, почта, обучение, «пока вас не было», справка, кнопка «Назад», офлайн-режим и запуск */

/* ---------- обучение ---------- */
function tutLine(){
 const t=tutStep();if(!t)return'';const done=t.f();
 return `<button class="qt tut ${done?'ok':''}" data-act="${done?'tutClaim':'tutGo'}"><b>[Обучение ${S.tut+1}/${TUT.length}]</b> ${t.n}<span>${done?'Готово! Нажмите, чтобы забрать награду':t.h}</span></button>`;
}
ACT.tutGo=()=>{const t=tutStep();if(!t)return;go(t.go[0],t.go[1]?{p:t.go[1]}:null)};
ACT.tutClaim=()=>{const t=tutClaim();if(!t)return;sfx('coin');haptic(15);toast(`Обучение: «${t.n}» — ${Object.keys(t.r).map(k=>icon(CUR[k].ic,14)+' '+fmt(t.r[k])).join(' ')}`);render()};

/* ---------- достижения ---------- */
function achView(){
 const got=ACH.filter(a=>S.ach[a.id]).length,L=ACH.map(a=>({a,st:S.ach[a.id]?2:achReady(a)?1:0})).sort((x,y)=>(y.st==1)-(x.st==1)||x.st-y.st);
 return `<div class="panel"><div class="hdr"><h3>Достижения</h3><small class="sp">${got}/${ACH.length}</small></div><div class="bar" style="margin-top:10px"><i style="width:${got/ACH.length*100}%"></i></div></div>
 ${L.map(({a,st})=>`<div class="card row ${st==2?'achdone':''}"><span class="em" style="width:40px;height:40px">${icon(st==2?'star':'quest',18)}</span><div style="flex:1;min-width:0"><b>${a.n}</b><div class="mute" style="font-size:12px">${a.d}</div><div style="margin-top:5px">${rwHtml(a.r)}</div></div>${st==1?`<button class="btn sm jade" data-act="achGet" data-id="${a.id}">Забрать</button>`:st==2?'<span style="color:var(--good);font-size:12px">Получено</span>':'<span class="mute" style="font-size:12px">В пути</span>'}</div>`).join('')}`;
}
ACT.achGet=d=>{const a=achClaim(d.id);if(!a)return;sfx('usr');haptic(25);toast('Достижение «'+a.n+'» получено');render()};

/* ---------- почта ---------- */
ACT.mail=()=>{
 mailSync();const L=S.mail;
 modal(`<h3>Почта</h3><p class="mute" style="font-size:12.5px;margin:4px 0 10px">Письма от Престола: подарки, компенсации и новости обновлений.</p>
 ${L.length?`<div class="stack" style="gap:8px">${L.map(m=>`<div class="card"><div class="row"><b style="flex:1;min-width:0;color:var(--gold)">${esc((MAIL.find(x=>x.id==m.id)||m).t)}</b><span class="mute" style="font-size:11px">${new Date(m.ts).toLocaleDateString(LOCALE,{day:'numeric',month:'short'})}</span></div><p style="font-size:13px;margin:6px 0 8px">${esc((MAIL.find(x=>x.id==m.id)||m).b)}</p>${m.r?`<div class="row">${rwHtml(m.r)}<button class="btn sm sp ${m.got?'sec':'jade'}" data-act="mailGet" data-id="${m.id}" ${m.got?'disabled':''}>${m.got?'Получено':'Забрать'}</button></div>`:''}</div>`).join('')}</div>
 ${L.some(m=>!m.got&&m.r)?'<button class="btn wide" style="margin-top:10px" data-act="mailAll">Забрать всё</button>':''}`:'<p class="mute">Писем нет.</p>'}`);
};
ACT.mailGet=d=>{if(mailClaim(d.id)){sfx('coin');toast('Подарок из письма получен');ACT.mail();nav();renderTop()}};
ACT.mailAll=()=>{let n=0;S.mail.forEach(m=>{if(!m.got&&mailClaim(m.id))n++});if(n){sfx('coin');toast('Получено писем: '+n)}ACT.mail();nav();renderTop()};

/* ---------- «пока вас не было» и «что нового» ---------- */
function welcomeBack(){
 if(!S||SCR=='new'||BT.active||!$('#modal').hidden)return;
 if(LOAD_NOTE){toast(LOAD_NOTE);LOAD_NOTE=''}
 if(S.seenVer!==VERSION){S.seenVer=VERSION;save();return ACT.whatsNew()}
 const a=afk();if(a.h<1)return;const h=Math.floor(a.h),m=Math.floor((a.h-h)*60);
 modal(`<div style="text-align:center"><div class="lbl">Пока вас не было</div><h2 style="margin:6px 0">${h} ч ${m} мин</h2><p class="mute" style="font-size:13px;margin:0 0 10px">Отряд сражался на этапе ${chapOf(Math.min(S.stage,MAX_STAGE))}-${stageIn(Math.min(S.stage,MAX_STAGE))}${a.full?'. Хранилище заполнено — заходите чаще, чтобы ничего не терять':''}.${a.wk?' Выходные: серебро и опыт ×1,5.':''}</p>
 ${rwHtml({silver:a.silver,exp:a.exp,gold:a.gold,scroll:a.scroll},1)}<button class="btn wide" style="margin-top:14px" data-act="wbClaim">Забрать</button></div>`);
}
ACT.wbClaim=()=>{closeModal();ACT.claimAfk()};
ACT.whatsNew=()=>modal(`<div class="lbl">Версия ${VERSION}</div><h3>Что нового</h3><ul class="wn">${WHATSNEW.map(x=>`<li>${x}</li>`).join('')}</ul><p class="mute" style="font-size:12px;margin:8px 0 0">Полный список изменений — в файле CHANGELOG проекта.</p><div class="row" style="justify-content:flex-end;margin-top:10px">${S.mail.some(m=>!m.got)?'<button class="btn jade" data-act="mail">Открыть почту</button>':''}<button class="btn" data-act="close">Понятно</button></div>`);

/* ---------- справка для магазинов приложений ---------- */
ACT.privacy=()=>modal(`<h3>Конфиденциальность</h3><div class="doc">
<p>«Небесный Престол» не собирает, не передаёт и не продаёт личные данные. Аккаунт не нужен.</p>
<p><b>Что хранится.</b> Прогресс игры (герои, ресурсы, настройки) и имя героя, которое вы ввели сами, хранятся только на вашем устройстве — в локальном хранилище приложения. Код сохранения создаётся только по вашей команде и копируется вручную.</p>
<p><b>Сеть.</b> Игра работает без интернета. Аналитики, рекламы и сторонних трекеров нет.</p>
<p><b>Покупки.</b> В текущей версии покупки золота работают в тестовом режиме, деньги не списываются. Если позже появятся настоящие покупки, их обработают Google Play или App Store по своим правилам; данные карт игре не передаются.</p>
<p><b>Дети.</b> Игра не предназначена для сбора данных детей и не собирает их.</p>
<p><b>Удаление данных.</b> Настройки → «Удалить персонажа» или удаление приложения стирают все данные.</p>
<p class="mute">Контакт разработчика указывается на странице приложения в магазине.</p></div>`);
ACT.terms=()=>modal(`<h3>Условия</h3><div class="doc">
<p>Игра предоставляется «как есть» для развлечения. Внутриигровые ресурсы, герои и скины не имеют денежной стоимости и не обмениваются на деньги.</p>
<p><b>Призыв.</b> Герои в призывах выпадают случайно. Шансы по редкостям указаны на каждом баннере и в Колесе Небес, гарантии отсчитываются счётчиками на тех же экранах. История последних 100 героев — в разделе «Призыв».</p>
<p><b>Соперники.</b> Арена, союзы и войны кланов в этой версии проходят против компьютерных соперников.</p>
<p><b>Сохранение.</b> Прогресс хранится на устройстве. Делайте копию кодом сохранения перед сменой телефона.</p></div>`);
ACT.errLog=()=>modal(`<h3>Журнал ошибок</h3><p class="mute" style="font-size:12.5px">Если игра повела себя странно, пришлите разработчику этот текст.</p><textarea rows="8" readonly>${esc(ERRLOG.join('\n'))}</textarea>`);

/* ---------- кнопка «Назад» (Android) и Esc ---------- */
function backAction(){
 if(!$('#modal').hidden){closeModal();return true}
 if(SCR=='login')return false;
 if(SCR=='new'){if(chars().length){showLogin();return true}return false}
 if(!$('#story').hidden){ACT.storySkip();return true}
 if(BT.active){if(BT.over){ACT.bExit();return true}BT.pause();return true}
 if(SCR=='hero'){go('heroes');return true}
 if(SCR=='story'){go('battle');return true}
 if(SCR!='home'){go('home');return true}
 return false;
}
function exitAsk(){const App=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App;ask('Выйти из игры? Прогресс сохранён.',()=>{save();App&&App.exitApp()},'Выйти')}
document.addEventListener('keydown',e=>{if(e.key=='Escape')backAction()});
try{const App=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App;if(App){App.addListener('backButton',()=>{if(!backAction())exitAsk()});App.addListener('pause',()=>{save();if(BT.active)BT.pause(true)})}}catch(e){}

/* ---------- офлайн-режим (PWA), если страница открыта как сайт ---------- */
try{if('serviceWorker' in navigator&&location.protocol=='https:'&&!window.Capacitor&&!(window.claude&&window.claude.hot)&&document.querySelector('link[rel="manifest"]'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}catch(e){}

/* ---------- запуск ---------- */
(()=>{let H=null;try{H=window.claude&&window.claude.hot;if(H&&H.snapshot)H.snapshot(()=>({S,CID}))}catch(e){H=null}
 if(H&&H.ready)H.ready(boot);else boot((H&&H.data)||{})})();
