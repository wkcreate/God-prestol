'use strict';
/* Небесный Престол — состояние, экономика, прогресс */
const LEGACY_KEY='np_save_v1',IDX_KEY='np_chars',MAX_CHARS=4;
const SERVERS=[{id:'eu1',n:'EU · Европа',s:'Сервер 1',on:1},{id:'na1',n:'NA · Америка',s:'Скоро',on:0},{id:'as1',n:'ASIA · Азия',s:'Скоро',on:0}];
let CID=null;
let S=null;
const now=()=>Date.now();
const today=()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5)};
const weekNo=()=>Math.floor((today()+3)/7);
const R=n=>Math.floor(Math.random()*n);
const fmt=n=>{n=Math.floor(n||0);const a=Math.abs(n);return a>=1e12?(n/1e12).toFixed(a>=1e13?0:1)+'T':a>=1e9?(n/1e9).toFixed(a>=1e10?0:1)+'B':a>=1e6?(n/1e6).toFixed(a>=1e7?0:1)+'M':a>=1e4?Math.round(n/1e3)+'K':String(n)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CUR={silver:{n:'Серебро',ic:'silver'},gold:{n:'Золото',ic:'gold'},scroll:{n:'Свиток призыва',ic:'scroll'},coupon:{n:'Купон судьбы',ic:'coupon'},token:{n:'Жетон Колеса',ic:'token'},exp:{n:'Опыт героев',ic:'exp'},gcoin:{n:'Монеты Союза',ic:'gcoin'},acoin:{n:'Знаки арены',ic:'acoin'},tp:{n:'Очки талантов',ic:'star'},usrShard:{n:'Осколки USR',ic:'shard'},
 ore:{n:'Руда',ic:'ore'},divine:{n:'Божественная эссенция',ic:'divine'},ancient:{n:'Древние осколки',ic:'ancient'},lrs:{n:'Осколки Легенды',ic:'lrs'},ess:{n:'Звёздная эссенция',ic:'ess'},
 egg:{n:'Яйцо питомца',ic:'egg'},food:{n:'Корм питомцев',ic:'food'},feather:{n:'Перья',ic:'feather'},dust:{n:'Пыль артефактов',ic:'dust'},asc:{n:'Камни возвышения',ic:'asc'}};
const heroNew=()=>({lv:1,st:1,sh:0,tr:0,rl:0,zl:0,eq:{w:[0,0],a:[0,0],h:[0,0],m:[0,0]},dv:{s:0,e:0},an:{r:0,c:0}});
function heroFix(o){if(o.tr==null)o.tr=0;if(o.rl==null)o.rl=0;if(o.zl==null)o.zl=0;if(!o.eq)o.eq={w:[0,0],a:[0,0],h:[0,0],m:[0,0]};if(!o.dv)o.dv={s:0,e:0};if(!o.an)o.an={r:0,c:0};return o}

function newState(name,cls){
 const s={v:4,name,created:now(),m:heroFix({cls,lv:1,skin:'base',skins:['base'],tal:{atk:0,hp:0,crit:0},chg:0}),
  silver:30000,gold:3000,scroll:10,coupon:1,token:2,exp:20000,gcoin:0,acoin:0,tp:0,
  ore:500,divine:0,ancient:0,lrs:0,ess:0,egg:0,food:0,feather:0,dust:0,asc:0,
  pets:{},pet:null,wings:{},wing:null,relics:{},relEq:[null,null,null,null],story:{done:[],seen:[],bs:[]},
  paid:{rl:{n:0,p:0},pz:{i:0,open:0,n:0,done:0},ps:{wk:-1,prem:0,q:{},got:{f:[],v:[]}}},
  h:{lia:heroNew(),iskra:heroNew(),brandt:heroNew()},
  team:[null,null,null,null,null],stage:1,afkT:now(),afkF:0,pity:{prem:0,wheel:0,cpn:0},first10:1,
  d:{day:-1},login:{k:0,last:-1},arena:{rt:1000,w:0,l:0,opp:null,od:-1},
  g:null,gw:null,ev:{wk:-1,t:0},lim:{},set:{snd:1,mus:1,vib:1,spd:1,auto:1,anx:0},st:{wins:0,sum:0,usr:0,kills:0,lvls:0,afk:0,battles:0,maxHit:0,dupGold:0},tut:0,
  ach:{},mail:[],mailSeen:[],hist:[],chr:0,seenVer:VERSION};
 S=s;autoTeam();return s;
}
function migrate(){
 const cur=S,old=cur.v||1,d=newState(cur.name||'Герой',(cur.m&&cur.m.cls)||'war');S=cur;
 for(const k in d)if(S[k]===undefined)S[k]=d[k];
 if(!S.uid)S.uid=newId()+newId();
 for(const k of['m','set','st','pity','arena','login','ev','story','paid'])for(const j in d[k])if(S[k][j]===undefined)S[k][j]=d[k][j];
 heroFix(S.m);for(const k in S.h)heroFix(S.h[k]);if(!Array.isArray(S.relEq)||S.relEq.length!==4)S.relEq=[null,null,null,null];
 if(old<4)S.v=4;
 if(old<3){S.seenVer='';if(!S.mailSeen.includes('welcome'))S.mailSeen.push('welcome');S.tut=TUT.length;S.chr=chapOf(S.stage)-1}
 sanitize();
 if(!Array.isArray(S.team)||S.team.length!==5)autoTeam();
 S.team=S.team.map(k=>k&&(k=='@main'||S.h[k])?k:null);S.team=S.team.map((k,i)=>k&&S.team.indexOf(k)!==i?null:k);if(!S.team.includes('@main')){const e=S.team.indexOf(null);S.team[e>=0?e:4]='@main'}
}
/* защита от подделки: все числа приводятся к допустимым пределам, неизвестные id удаляются */
const CURS=['silver','gold','scroll','coupon','token','exp','gcoin','acoin','tp','ore','divine','ancient','lrs','ess','egg','food','feather','dust','asc'];
function sanitize(){
 const N=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.min(hi,Math.max(lo,Math.floor(v))):d};
 for(const k of CURS)S[k]=N(S[k],0,1e15,0);
 S.stage=N(S.stage,1,MAX_STAGE+1,1);S.name=String(S.name||'Hero').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,16)||'Hero';
 const gear=o=>{heroFix(o);o.tr=N(o.tr,0,2,0);o.rl=N(o.rl,0,300,0);o.zl=N(o.zl,0,100,0);for(const g of GEAR){const x=o.eq[g.k];o.eq[g.k]=Array.isArray(x)?[N(x[0],0,GEAR_Q.length-1,0),N(x[1],0,20,0)]:[0,0]}
  for(const g of DIVINE)o.dv[g.k]=N(o.dv[g.k],0,EXTRA_MAX,0);for(const g of ANCIENT)o.an[g.k]=N(o.an[g.k],0,EXTRA_MAX,0);return o};
 for(const k of Object.keys(S.h)){if(!HERO[k]||typeof S.h[k]!='object'||!S.h[k]){delete S.h[k];continue}const o=gear(S.h[k]);o.st=N(o.st,1,MAX_STAR,1);o.sh=N(o.sh,0,1e7,0);o.lv=N(o.lv,1,starCap(o.st),1);if(o.tr&&o.lv<500)o.tr=0}
 if(!MAIN_CLS.includes(S.m.cls))S.m.cls='war';gear(S.m);S.m.lv=N(S.m.lv,1,500,1);if(S.m.tr&&S.m.lv<500)S.m.tr=0;
 S.m.skins=(Array.isArray(S.m.skins)?S.m.skins:['base']).filter((id,i,a)=>SKINS.some(x=>x.id==id)&&a.indexOf(id)==i);if(!S.m.skins.includes('base'))S.m.skins.unshift('base');if(!S.m.skins.includes(S.m.skin))S.m.skin='base';
 for(const t of['atk','hp','crit'])S.m.tal[t]=N(S.m.tal[t],0,100,0);
 const own=(obj,list,max)=>{for(const id of Object.keys(obj||{})){if(!list.some(x=>x.id==id)||!obj[id]||typeof obj[id]!='object'){delete obj[id];continue}obj[id].lv=N(obj[id].lv,1,max,1)}};
 own(S.pets,PETS,PET_MAX);own(S.wings,WINGS,WING_MAX);own(S.relics,RELICS,RELIC_MAX);
 if(S.pet&&!S.pets[S.pet])S.pet=null;if(S.wing&&!S.wings[S.wing])S.wing=null;
 S.relEq=(Array.isArray(S.relEq)?S.relEq:[]).slice(0,4).map((id,i,a)=>id&&S.relics[id]&&a.indexOf(id)==i?id:null);while(S.relEq.length<4)S.relEq.push(null);
 S.story.done=(S.story.done||[]).filter((c,i,a)=>Number.isInteger(c)&&c>=1&&c<=CHAPTERS&&a.indexOf(c)==i);
 S.pity.prem=N(S.pity.prem,0,89,0);S.pity.wheel=N(S.pity.wheel,0,99,0);S.pity.cpn=N(S.pity.cpn,0,39,0);
 S.paid.rl.p=N(S.paid.rl.p,0,ROUL_PITY-1,0);S.paid.pz.open=N(S.paid.pz.open,0,0xFFFF,0);S.paid.pz.i=N(S.paid.pz.i,0,LR_IDS.length-1,0);
}
const validSave=o=>!!o&&typeof o=='object'&&o.m&&typeof o.m.lv=='number'&&MAIN_CLS.includes(o.m.cls)&&o.h&&typeof o.h=='object'&&typeof o.stage=='number'&&o.stage>=1;
/* ---------- защищённое хранение: шифрование и подпись сохранений ---------- */
function h53(str,seed){let a=0xdeadbeef^(seed||0),b=0x41c6ce57^(seed||0);for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}
 a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return(4294967296*(2097151&b)+(a>>>0)).toString(36)}
const SEC=(()=>{const base=RAR.map(r=>r.c+r.m).join('|')+CLS.war.spd+CLS.asn.crit+STAGES_PER_CH;return h53(base,0x5e7a)+h53(base,0x51c3)+'·vx'})();
const u8=s=>new TextEncoder().encode(s),s8=b=>new TextDecoder().decode(b);
function xorB(b,k){const kb=u8(k),o=new Uint8Array(b.length);for(let i=0;i<b.length;i++)o[i]=b[i]^kb[(i*7+(i>>3))%kb.length]^(i*31&255);return o}
const b64e=b=>{let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const b64d=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const r=atob(s),o=new Uint8Array(r.length);for(let i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o};
function enc(o){const j=JSON.stringify(o),n=h53(j+SEC,7);return'NP2.'+b64e(xorB(u8(j),SEC+n))+'.'+n+'.'+h53(n+j+SEC,3)}
function dec(s){if(typeof s!='string'||!s.startsWith('NP2.'))throw new Error('format');const p=s.split('.');if(p.length!==4)throw new Error('format');
 const j=s8(xorB(b64d(p[1]),SEC+p[2]));if(h53(j+SEC,7)!==p[2]||h53(p[2]+j+SEC,3)!==p[3])throw new Error('tamper');return JSON.parse(j)}
/* ---------- персонажи: сервер, список, загрузка, автосохранение ---------- */
const ckey=id=>'np_c_'+id,bkey=id=>'np_c_'+id+'_b';
/* журнал прогресса: для каждого персонажа (uid) — время последнего сохранения. Записи не удаляются вместе с персонажем,
   поэтому старый код сохранения нельзя загрузить поверх более нового прогресса (защита от «отката» после неудачного призыва) */
const LED_KEY='np_led';
function ledger(){try{const s=localStorage.getItem(LED_KEY);return s?dec(s):{}}catch(e){return{}}}
function ledgerPut(uid,ts){if(!uid)return;try{const L=ledger();if((L[uid]||0)<ts){L[uid]=ts;localStorage.setItem(LED_KEY,enc(L))}}catch(e){}}
function chars(){try{const a=JSON.parse(localStorage.getItem(IDX_KEY)||'[]');return Array.isArray(a)?a.filter(c=>c&&typeof c.id=='string'):[]}catch(e){return[]}}
function charsSave(a){try{localStorage.setItem(IDX_KEY,JSON.stringify(a))}catch(e){}}
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function charMeta(){return{id:CID,srv:S.srv||'eu1',name:S.name,cls:S.m.cls,lv:S.m.lv,tr:S.m.tr,rl:S.m.rl,zl:S.m.zl,pw:teamPower(),stage:S.stage,skin:S.m.skin,wing:S.wing||'',ts:now()}}
/* старые незашифрованные сохранения (версии до 2.2) не подписаны — при переносе ресурсы ограничиваются правдоподобными значениями */
function legacyCap(){const k=Math.max(1,S.stage||1),cap={gold:2e4+k*400,scroll:300+k,coupon:100+k/4,token:100,lrs:0,ess:k*5,asc:Math.floor(k/10),usrShard:k};
 for(const c in cap)if(typeof S[c]=='number')S[c]=Math.min(S[c],Math.floor(cap[c]))}
function legacyImport(){
 try{const j=localStorage.getItem(LEGACY_KEY)||localStorage.getItem(LEGACY_KEY+'_bak');if(!j)return;const o=JSON.parse(j);
  if(validSave(o)&&!NATIVE){const keep=S,kc=CID;S=o;CID=newId();migrate();S.srv='eu1';legacyCap();save();S=keep;CID=kc}
  localStorage.removeItem(LEGACY_KEY);localStorage.removeItem(LEGACY_KEY+'_bak')}catch(e){}
}
let LOAD_NOTE='',TAMPER=0;
function loadChar(id){TAMPER=0;
 for(const key of[ckey(id),bkey(id)]){try{const s=localStorage.getItem(key);if(!s)continue;const o=dec(s);if(!validSave(o))continue;S=o;CID=id;migrate();bakT=0;
  if(key==bkey(id))LOAD_NOTE='Основное сохранение повреждено или изменено — прогресс восстановлен из резервной копии';return true}catch(e){if(e.message=='tamper')TAMPER=1}}
 return false;
}
let bakT=0;
function save(){if(!S||!CID)return;S.ts=now();S.tsMax=Math.max(S.tsMax||0,S.ts);try{const s=enc(S);if(now()-bakT>3e5){const prev=localStorage.getItem(ckey(CID));if(prev)localStorage.setItem(bkey(CID),prev);bakT=now()}
 localStorage.setItem(ckey(CID),s);ledgerPut(S.uid,S.tsMax);const a=chars(),i=a.findIndex(c=>c.id==CID),m=charMeta();if(i>=0)a[i]=m;else a.push(m);charsSave(a)}catch(e){}}
function newChar(name,cls){CID=newId();bakT=0;newState(name,cls);S.srv='eu1';S.uid=newId()+newId();save()}
function deleteChar(id){try{localStorage.removeItem(ckey(id));localStorage.removeItem(bkey(id))}catch(e){}charsSave(chars().filter(c=>c.id!==id))}
function exportCode(){return enc(S)}
function importCode(code){const o=dec(String(code).replace(/\s+/g,''));if(!validSave(o))throw new Error('bad');
 if(o.uid&&(ledger()[o.uid]||0)>(o.tsMax||o.ts||0)+6e4)throw new Error('old');const prev=S;S=o;try{migrate();save()}catch(e){S=prev;throw e}}

/* ---------- сброс дня и недели ---------- */
/* время в игре (только когда окно на экране) копится в S.pt; новый игровой день наступает не раньше,
   чем через минуту игры после прошлого сброса — перевод часов вперёд день за днём становится очень долгим */
const DAY_PLAY=6e4;let PT0=performance.now();
setInterval(()=>{const n=performance.now(),d=Math.min(n-PT0,6e3);PT0=n;if(S&&!document.hidden)S.pt=(S.pt||0)+d},2e3);
function daily(){
 if(!S)return;const t=today();
 if(t<(S.dayMax||0))return; S.dayMax=Math.max(S.dayMax||0,t);
 if(S.d.day!==t&&S.d.day>0&&S.ptD!=null&&(S.pt||0)-S.ptD<DAY_PLAY)return;
 if(S.d.day!==t){S.ptD=S.pt||0;S.d={day:t,fs:1,fw:1,qa:1,ar:5,war:3,gb:3,ev:5,ci:0,q:{},qc:[],gift:0,arr:0}}
 const w=weekNo();
 if(S.ev.wk!==w)S.ev={wk:w,t:0};
 if(S.g&&S.g.war&&S.g.war.wk!==w){const rk=warRank();S.gw={rank:rk,gold:[800,500,320,200,120,60][rk]||60};S.g.war=newWar()}
}

/* ---------- характеристики ---------- */
/* звёзды: 1–6 как раньше (+25% за звезду), дальше прирост мягче; 21★ — слияние: ×1,3 */
function starMult(st){let m=1;for(let i=2;i<=Math.min(st,20);i++)m+=i<=6?.25:i<=10?.2:i<=15?.18:.15;return st>=21?m*1.3:m}
const growth=(lv,st,m)=>m*(1+.1*(lv-1))*Math.pow(1.012,lv-1)*starMult(st);
const starCap=st=>st<=6?30+st*20:Math.min(500,150+(st-6)*25);
const starTier=st=>st>=21?4:Math.floor((st-1)/5);
const starShown=st=>st>=21?1:((st-1)%5)+1;
const po=k=>k=='@main'?S.m:S.h[k];
/* возвышение: R1 (300 уровней) и Зенит (100 уровней) поверх 500-го уровня */
const ascMult=o=>!o||!o.tr?1:o.tr==1?1.2+o.rl*.004:2.5+o.zl*.015;
const effLv=o=>!o.tr?o.lv:o.tr==1?500+o.rl:800+o.zl*2;
const ASC=[null,{to:1,asc:10,silver:2e7,n:'R1'},{to:2,asc:30,silver:1e8,n:'Зенит'}];
function rawStats(cls,lv,st,m){const c=CLS[cls],g=growth(lv,st,m);return{hp:Math.round(650*c.hp*g),atk:Math.round(62*c.atk*g),def:Math.round(32*c.def*g),spd:c.spd,crit:c.crit}}
const mainStar=()=>S.m.tr>=1?21:Math.min(20,1+Math.floor((S.m.lv-1)/25));
function skinBonus(){const s=SKINS.find(x=>x.id==S.m.skin);return s&&s.r>=0?SKIN_BONUS[s.r]:0}
/* бонусы снаряжения героя */
const gearPts=x=>x[0]*20+x[1];
function gearB(o){const b={atk:0,hp:0,def:0,crit:0};if(!o||!o.eq)return b;
 GEAR.forEach(g=>{const p=gearPts(o.eq[g.k]);for(const s in g.st)b[s]+=g.st[s]*p});
 DIVINE.forEach(g=>{const l=(o.dv&&o.dv[g.k])||0;for(const s in g.st)b[s]+=g.st[s]*l});
 ANCIENT.forEach(g=>{const l=(o.an&&o.an[g.k])||0;for(const s in g.st)b[s]+=g.st[s]*l});
 return b}
/* бонусы всему отряду: питомцы, артефакты, коллекция крыльев */
function teamB(){const b={atk:0,hp:0,def:0,crit:0,spd:0};
 for(const id in S.pets){const P=PETS.find(p=>p.id==id);if(!P)continue;const v=PET_BONUS[P.rar]*S.pets[id].lv*(S.pet==id?1:.3);b.atk+=v;b.hp+=v;if(S.pet==id&&P.rar>=5)b.spd+=3}
 S.relEq.forEach(id=>{if(!id||!S.relics[id])return;const R=RELICS.find(r=>r.id==id);if(!R)return;const l=S.relics[id].lv;for(const s in R.st)b[s]+=R.st[s]*l});
 let wl=0;for(const id in S.wings)wl+=S.wings[id].lv;b.atk+=wl*.0005;b.hp+=wl*.0005;
 return b}
function wingMain(){if(!S.wing||!S.wings[S.wing])return 0;const W=WINGS.find(w=>w.id==S.wing);return W?WING_BONUS[W.rar]*S.wings[S.wing].lv:0}
function unitStats(k){
 const main=k=='@main',o=main?S.m:(S.h[k]||heroNew());let s;
 if(main){const t=S.m.tal,b=1+skinBonus()+wingMain();s=rawStats(S.m.cls,S.m.lv,mainStar(),2.2);
  s.hp=Math.round(s.hp*b*(1+.015*t.hp));s.atk=Math.round(s.atk*b*(1+.015*t.atk));s.def=Math.round(s.def*b);s.crit+=.002*t.crit}
 else{const h=HERO[k];s=rawStats(h.cls,o.lv,o.st,RAR[h.rar].m)}
 const st=main?mainStar():o.st,am=ascMult(o),g=gearB(o),t=teamB();
 s.hp=Math.round(s.hp*am*(1+g.hp+t.hp));s.atk=Math.round(s.atk*am*(1+g.atk+t.atk));s.def=Math.round(s.def*am*(1+g.def+t.def));
 s.crit=Math.min(.75,s.crit+g.crit+t.crit+(st>=21?.05:0));s.spd=Math.round(s.spd+t.spd+(st>=21?5:0));
 return s;
}
const powerOf=s=>Math.round(s.hp/6+s.atk*3+s.def*2.2);
function resonance(team){const c={};(team||S.team).forEach(k=>{if(k&&k!='@main'){const f=HERO[k].fac;c[f]=(c[f]||0)+1}});let n=0,f=null;for(const x in c)if(c[x]>n){n=c[x];f=x}return{f,n,b:n>=4?.15:n>=3?.08:0}}
function teamPower(team){team=team||S.team;const r=resonance(team);return Math.round(team.filter(Boolean).reduce((a,k)=>a+powerOf(unitStats(k)),0)*(1+r.b))}
const lvTxt=o=>!o.tr?'Ур. '+o.lv:o.tr==1?'R1 · '+o.rl:'Зенит '+o.zl;
function info(k){
 if(k=='@main'){const sk=SKINS.find(s=>s.id==S.m.skin),o=S.m;return{key:k,name:S.name,t:MAIN_INFO[S.m.cls].t,rar:2,fac:null,cls:S.m.cls,lv:o.lv,st:mainStar(),cap:capOf(k),tr:o.tr,rl:o.rl,zl:o.zl,lt:lvTxt(o),u:MAIN_INFO[S.m.cls].u,main:1,skin:sk}}
 const h=HERO[k],o=S.h[k]||heroNew();return{key:k,name:h.n,t:h.t,rar:h.rar,fac:h.fac,cls:h.cls,lv:o.lv,st:o.st,sh:o.sh,cap:starCap(o.st),tr:o.tr,rl:o.rl,zl:o.zl,lt:lvTxt(o),u:h.u,own:!!S.h[k]};
}
/* облик главного героя с надетыми крыльями */
function mainLookFull(){const L=ART.mainLook(S.m.cls,S.m.skin);const W=S.wing&&S.wings[S.wing]&&WINGS.find(w=>w.id==S.wing);if(W){L.wings=W.style;L.wingC=W.c;L.wingE=W.e}return L}
const mainSkinKey=()=>S.m.cls+':'+S.m.skin+':'+(S.wing||'');
function specOf(k){
 if(k=='@main')return{key:'main',skinKey:mainSkinKey(),fz:mainStar()>=21,look:mainLookFull()};
 return{key:'h:'+k,fz:!!(S.h[k]&&S.h[k].st>=21),look:ART.heroLook(HERO[k])};
}
const petSpec=id=>{const P=PETS.find(p=>p.id==id);return{key:'pet:'+id,look:{kind:'mon',type:P.type,c1:P.c1,c2:P.c2,pet:1}}};

/* ---------- прокачка ---------- */
const lvCost=lv=>({exp:Math.floor(60*Math.pow(lv,1.55)),silver:Math.floor(110*Math.pow(lv,1.6))});
const capOf=k=>k=='@main'?Math.min(500,50+Math.floor((Math.min(S.stage,MAX_STAGE+1)-1)*.75)):starCap(S.h[k].st);
const lvOf=k=>k=='@main'?S.m.lv:S.h[k].lv;
/* стоимость следующего уровня с учётом ступени: обычные уровни, R1, Зенит; null — предел */
function nextCost(k){const o=po(k);
 if(!o.tr){if(o.lv>=capOf(k))return null;return lvCost(o.lv)}
 if(o.tr==1){if(o.rl>=300)return null;const c=lvCost(500+o.rl);return{exp:Math.floor(c.exp*1.5),silver:Math.floor(c.silver*1.5)}}
 if(o.zl>=100)return null;const c=lvCost(800+o.zl*3);return{exp:c.exp*2,silver:c.silver*2,asc:1}}
const lvStep=o=>{if(!o.tr)o.lv++;else if(o.tr==1)o.rl++;else o.zl++};
const lvMax=k=>{const o=po(k);return!o.tr?capOf(k):o.tr==1?300:100};
const lvCur=k=>{const o=po(k);return!o.tr?o.lv:o.tr==1?o.rl:o.zl};
function levelUp(k,n){let c=0;const o=po(k);while(c<n){const q=nextCost(k);if(!q||S.exp<q.exp||S.silver<q.silver||(q.asc&&S.asc<q.asc))break;S.exp-=q.exp;S.silver-=q.silver;if(q.asc)S.asc-=q.asc;lvStep(o);c++}if(c){quest('lvl',c);S.st.lvls=(S.st.lvls||0)+c}return c}
/* сколько уровней можно взять прямо сейчас */
function maxLevels(k){const o=po(k),keep={lv:o.lv,rl:o.rl,zl:o.zl},r={exp:S.exp,silver:S.silver,asc:S.asc};let c=0;
 while(c<3000){const q=nextCost(k);if(!q||r.exp<q.exp||r.silver<q.silver||(q.asc&&r.asc<q.asc))break;r.exp-=q.exp;r.silver-=q.silver;if(q.asc)r.asc-=q.asc;lvStep(o);c++}Object.assign(o,keep);return c}
function ascInfo(k){const o=po(k);if(!o.tr&&o.lv>=500)return ASC[1];if(o.tr==1&&o.rl>=300)return ASC[2];return null}
function ascend(k){const a=ascInfo(k);if(!a||S.asc<a.asc||S.silver<a.silver)return false;S.asc-=a.asc;S.silver-=a.silver;const o=po(k);o.tr=a.to;if(a.to==1)o.rl=0;else o.zl=0;return true}
/* прокачка всего отряда по очереди: сначала самый отстающий */
function levelTeam(){let total=0;for(let guard=0;guard<2000;guard++){const ks=S.team.filter(k=>k&&(k=='@main'||S.h[k])&&lvOf(k)<capOf(k)).sort((a,b)=>lvOf(a)-lvOf(b));let did=0;for(const k of ks){if(levelUp(k,1)){did=1;total++;break}}if(!did)break}return total}
const canStar=k=>{const o=S.h[k];return!!o&&o.st<MAX_STAR&&o.sh>=starCost(o.st)};
const lvPower=k=>{const o=po(k),keep={lv:o.lv,rl:o.rl,zl:o.zl},a=powerOf(unitStats(k));lvStep(o);const b=powerOf(unitStats(k));Object.assign(o,keep);return b-a};
/* слияние дубликатов: стоимость следующей звезды в осколках (повтор героя = 10 осколков) */
const starCost=st=>st<=5?st*10:st<=10?60+(st-6)*10:st<=15?120+(st-11)*20:220+(st-16)*30;
function starUp(k,useEss){const o=S.h[k];if(!o||o.st>=MAX_STAR)return false;const need=starCost(o.st),sh=Math.min(o.sh,need),rest=need-sh;if(rest>0&&(!useEss||S.ess<rest))return false;o.sh-=sh;if(rest)S.ess-=rest;o.st++;return true}
const talCost=l=>({tp:1,silver:2000*(l+1)});
function talUp(k){const l=S.m.tal[k];if(l>=100)return false;const q=talCost(l);if(S.tp<q.tp||S.silver<q.silver)return false;S.tp-=q.tp;S.silver-=q.silver;S.m.tal[k]++;return true}
function talUpN(k,n){let c=0;while(c<n&&talUp(k))c++;return c}
function autoTeam(){
 const own=Object.keys(S.h).sort((a,b)=>powerOf(unitStats(b))-powerOf(unitStats(a))).slice(0,4);
 const all=['@main',...own],front=[],back=[];
 all.forEach(k=>{const c=k=='@main'?S.m.cls:HERO[k].cls;(c=='war'?front:back).push(k)});
 while(front.length<2&&back.length){const i=back.findIndex(k=>(k=='@main'?S.m.cls:HERO[k].cls)=='asn');front.push(back.splice(i>=0?i:0,1)[0])}
 while(front.length>2)back.unshift(front.pop());
 S.team=[front[0]||null,front[1]||null,back[0]||null,back[1]||null,back[2]||null];
}

/* ---------- валюты и награды ---------- */
function give(r){for(const k in r){if(k=='usrShard')continue;if(k=='pet'){givePet(r[k]);continue}if(k=='wing'){giveWing(r[k]);continue}if(k=='relic'){giveRelic(r[k]);continue}S[k]=(S[k]||0)+r[k]}}
function givePet(id){if(S.pets[id]){S.food+=200;return false}S.pets[id]={lv:1};if(!S.pet)S.pet=id;return true}
function giveWing(id){if(S.wings[id]){S.feather+=150;return false}S.wings[id]={lv:1};if(!S.wing)S.wing=id;return true}
function giveRelic(id){if(S.relics[id]){S.dust+=200;return false}S.relics[id]={lv:1};const e=S.relEq.indexOf(null);if(e>=0&&!S.relEq.includes(id))S.relEq[e]=id;return true}
function canPay(cur,n){return(S[cur]||0)>=n}
function pay(cur,n){if(!canPay(cur,n))return false;S[cur]-=n;return true}
function quest(k,n){if(!S.d.q)S.d.q={};S.d.q[k]=(S.d.q[k]||0)+(n||1);pq(k,n||1)}

/* ---------- призыв ---------- */
function rollRar(r){let x=Math.random()*100;for(let i=0;i<r.length;i++){x-=r[i];if(x<0&&r[i]>0)return i}return r.findIndex(v=>v>0)}
const featured=()=>{const u=HEROES.filter(h=>h.rar==4);return u[weekNo()%u.length]};
function pickHero(rar,bid){if(rar==4&&bid=='prem'&&Math.random()<.5)return featured();const L=HEROES.filter(h=>h.rar==rar);return L[R(L.length)]}
const DUP_GOLD=[20,40,80,120,200,300];
function grant(id){
 if(S.h[id]){const o=S.h[id];if(o.st>=MAX_STAR){const g=DUP_GOLD[HERO[id].rar];S.gold+=g;S.st.dupGold=(S.st.dupGold||0)+g;return{id,dup:1,gold:g}}o.sh+=10;return{id,dup:1}}
 S.h[id]=heroNew();if(HERO[id].rar==4)S.st.usr++;return{id,nu:1}}
const sumCost=(bid,n)=>{const b=BANNERS.find(x=>x.id==bid);return{cur:b.cur,n:bid=='std'&&n==1&&S.d.fs>0?0:n==10?b.c10:b.c1}};
function summon(bid,n){
 const b=BANNERS.find(x=>x.id==bid),free=bid=='std'&&n==1&&S.d.fs>0,cost=n==10?b.c10:b.c1;
 if(!free&&!canPay(b.cur,cost))return null;
 if(free)S.d.fs=0;else S[b.cur]-=cost;
 const out=[];for(let i=0;i<n;i++){let r=rollRar(b.rates);if(b.pity){S.pity[b.pk]=(S.pity[b.pk]||0)+1;if(S.pity[b.pk]>=b.pity)r=Math.max(r,b.pr);if(r>=b.pr)S.pity[b.pk]=0}out.push(r)}
 if(n==10){if(bid=='std'&&S.first10){if(!out.some(r=>r>=2))out[9]=2;S.first10=0}if(!out.some(r=>r>=1)&&b.rates[1]>0)out[9]=1}
 const res=out.map(r=>grant(pickHero(r,bid).id));S.st.sum+=n;quest('sum',1);
 res.forEach(x=>S.hist.unshift({t:now(),b:bid,id:x.id}));S.hist.length=Math.min(S.hist.length,100);
 save();return res;
}
function spinCost(n){let f=S.d.fw>0?1:0,t=S.token,g=0;for(let i=0;i<n;i++){if(f){f=0;continue}if(t>0){t--;continue}g+=150}return{tok:S.token-t,gold:g}}
function spinMany(n){const out=[];for(let i=0;i<n;i++){const r=spinWheel(1);if(!r)break;out.push(r)}if(out.length)save();return out}
function spinWheel(silent){
 const free=S.d.fw>0;
 if(free)S.d.fw=0;else if(S.token>0)S.token--;else if(!pay('gold',150))return null;
 S.pity.wheel++;let i;
 if(S.pity.wheel>=100)i=WHEEL.findIndex(w=>w.k=='usr');
 else{let x=Math.random()*WHEEL.reduce((a,w)=>a+w.w,0);i=0;for(;i<WHEEL.length;i++){x-=WHEEL[i].w;if(x<0)break}if(i>=WHEEL.length)i=0}
 const w=WHEEL[i];if(w.k=='usr')S.pity.wheel=0;
 let txt=w.l,hero=null;
 if(['silver','scroll','exp','gold','token','coupon'].includes(w.k))give({[w.k]:w.v});
 else if(w.k=='shard'){const L=HEROES.filter(h=>h.rar==2),h=L[R(L.length)];hero=grant(h.id);txt=hero.nu?'Новый герой: '+h.n:'+10 осколков: '+h.n}
 else if(w.k=='skin'){const L=SKINS.filter(s=>s.r>=0&&s.r<=2&&!S.m.skins.includes(s.id)&&s.src!='event');if(L.length){const s=L[R(L.length)];S.m.skins.push(s.id);txt='Скин: '+s.n}else{S.gold+=200;txt='200 золота (все скины уже есть)'}}
 else{const L=HEROES.filter(h=>h.rar==(w.k=='usr'?4:2)),h=L[R(L.length)];hero=grant(h.id);txt=(hero.nu?'Герой ':'Осколки героя ')+h.n}
 if(hero)S.hist.unshift({t:now(),b:'wheel',id:hero.id});S.hist.length=Math.min(S.hist.length,100);
 quest('spin',1);if(!silent)save();return{i,txt,hero};
}

/* ---------- добыча в отсутствие ---------- */
/* хранилище добычи: 12 часов, +1 час за каждые 2 главы, максимум 24; в выходные серебро и опыт ×1,5 */
const afkCap=()=>Math.min(24,12+Math.floor((chapOf(Math.min(S.stage,MAX_STAGE))-1)/2));
const weekend=()=>{const d=new Date().getDay();return d==0||d==6};
function afk(){const cap=afkCap(),raw=Math.max(0,(now()-S.afkT)/36e5),h=Math.min(cap,raw),s=Math.min(S.stage,MAX_STAGE),k=weekend()?1.5:1;return{h,cap,full:raw>=cap,wk:k>1,silver:Math.floor(h*(500+60*s)*k),exp:Math.floor(h*(600+80*s)*k),gold:Math.floor(h*6),ore:Math.floor(h*(10+s*.5)),food:Math.floor(h*3),scroll:Math.floor(h/8+S.afkF)}}
function claimAfk(){const a=afk();if(a.h<1/60)return null;S.silver+=a.silver;S.exp+=a.exp;S.gold+=a.gold;S.ore+=a.ore;S.food+=a.food;const sc=a.h/8+S.afkF;S.scroll+=Math.floor(sc);S.afkF=sc-Math.floor(sc);S.afkT=now();quest('afk',1);S.st.afk=(S.st.afk||0)+1;save();return a}
function quickAfk(){const s=Math.min(S.stage,MAX_STAGE);if(S.d.qa>0)S.d.qa--;else if(!pay('gold',60))return null;const r={silver:2*(500+60*s),exp:2*(600+80*s),ore:Math.floor(2*(10+s*.5))};give(r);S.st.afk=(S.st.afk||0)+1;save();return r}

/* ---------- главы и враги ---------- */
const chapOf=s=>Math.ceil(s/STAGES_PER_CH), stageIn=s=>(s-1)%STAGES_PER_CH+1;
const themeOf=s=>THEMES[(chapOf(s)-1)%THEMES.length];
const chapName=c=>THEMES[(c-1)%THEMES.length].n+(c>THEMES.length?' II':'');
const MAX_STAGE=STAGES_PER_CH*CHAPTERS;
function monUnit(type,fac,st,o){o=o||{};return Object.assign({key:'m:'+type+':'+fac+(o.boss?':b':''),name:o.name||MON[type].n,cls:MON[type].cls,fac,rar:o.boss?3:1,look:ART.monLook(type,fac,!!o.boss),big:!!o.boss},st)}
function stageTeam(s){
 const th=themeOf(s),lvl=1+(s-1)*.84,boss=stageIn(s)%10==0,m=1.45*(1+.004*s),team=[null,null,null,null,null];
 const n=boss?2:Math.min(5,3+Math.floor(s/4)),order=[0,1,3,2,4];
 for(let j=0;j<n;j++){const i=order[j],type=th.mon[(j+s)%th.mon.length],fac=th.fac[(j+s)%th.fac.length];team[i]=monUnit(type,fac,rawStats(MON[type].cls,lvl,1,m))}
 if(boss){const b=th.boss,st=rawStats(MON[b[0]].cls,lvl,1,m);st.hp*=3.6;st.atk=Math.round(st.atk*1.25);st.def=Math.round(st.def*1.1);team[3]=monUnit(b[0],th.fac[0],st,{boss:1,name:b[1]})}
 return team;
}
const stageReward=s=>{const b=stageIn(s)%10==0,c=chapOf(s);return{silver:300+50*s,exp:220+45*s,gold:b?80:10,ore:15+Math.floor(s*.6),scroll:s%5==0?1:0,coupon:s%20==0?1:0,tp:1,food:5,dust:b?20:0,divine:b&&c>=6?3:0,ancient:b&&c>=10?2:0,asc:stageIn(s)==STAGES_PER_CH&&s>300?1:0}};
function enemyPower(team){return Math.round(team.filter(Boolean).reduce((a,u)=>a+powerOf(u),0))}

/* ---------- отряд игрока для боя ---------- */
function unitSpec(k,b){
 const s=unitStats(k);b=1+(b||0);
 const base={hp:Math.round(s.hp*b),atk:Math.round(s.atk*b),def:s.def,spd:s.spd,crit:s.crit};
 if(k=='@main')return Object.assign({key:'main',skinKey:mainSkinKey(),id:'@main',name:S.name,cls:S.m.cls,fac:null,rar:2,main:1,st:mainStar(),look:mainLookFull(),ult:MAIN_INFO[S.m.cls].u,ultM:1.3},base);
 const h=HERO[k];return Object.assign({key:'h:'+k,id:k,name:h.n,cls:h.cls,fac:h.fac,rar:h.rar,st:S.h[k].st,look:ART.heroLook(h),ult:h.u,ultM:1+h.rar*.06},base);
}
function allyTeam(){const r=resonance();return S.team.map(k=>k&&(k=='@main'||S.h[k])?unitSpec(k,r.b):null)}

/* ---------- противники из героев (арена, войны кланов) ---------- */
function heroTeamAt(ids,target){
 let lv=1,st=1;const pw=(l,s)=>ids.reduce((a,id)=>a+powerOf(rawStats(HERO[id].cls,l,s,RAR[HERO[id].rar].m)),0);
 while(lv<400&&pw(lv,st)<target){lv+=lv<60?1:3;if(lv>20+st*20&&st<6)st++}
 return{lv,st};
}
function npcTeam(o){return o.ids.map(id=>{const h=HERO[id];return Object.assign({key:'h:'+id,id,name:h.n,cls:h.cls,fac:h.fac,rar:h.rar,look:ART.heroLook(h),ult:h.u,ultM:1+h.rar*.06},rawStats(h.cls,o.lv,o.st,RAR[h.rar].m))})}
function npcIds(seed){const pool=[...HEROES];const out=[];for(let i=0;i<5;i++){const j=(seed*7+i*13)%pool.length;out.push(pool.splice(j,1)[0].id)}
 const war=out.filter(id=>HERO[id].cls=='war'),rest=out.filter(id=>HERO[id].cls!='war');return[...war,...rest].slice(0,5)}
function arenaOpps(){
 if(S.arena.opp&&S.arena.od===today())return S.arena.opp;
 const p=teamPower(),fs=[.78,.92,1.05,1.2];
 S.arena.opp=fs.map((f,i)=>{const seed=R(997)+i,ids=npcIds(seed),t=heroTeamAt(ids,p*f*(.95+Math.random()*.1));return{n:NPC_NAMES[(seed+i)%NPC_NAMES.length],ids,lv:t.lv,st:t.st,f,pw:npcPower(ids,t.lv,t.st),rt:Math.round(S.arena.rt+(f-1)*300+R(40)-20)}});
 S.arena.od=today();return S.arena.opp;
}
const npcPower=(ids,lv,st)=>ids.reduce((a,id)=>a+powerOf(rawStats(HERO[id].cls,lv,st,RAR[HERO[id].rar].m)),0);
const LEAGUES=['Бронза','Серебро','Золото','Платина','Алмаз','Небожитель'];
const leagueI=rt=>Math.max(0,Math.min(5,Math.floor((rt-800)/300)));
const league=rt=>LEAGUES[leagueI(rt)];

/* ---------- Союз: гильдия, босс, война кланов ---------- */
const gbMax=l=>Math.round(3e5*Math.pow(1.6,l-1));
function guildOffers(){return GUILD_NAMES.slice(0,5).map((n,i)=>({n,lv:2+i,mem:18+i*3}))}
function joinGuild(name,lv){
 const mem=NPC_NAMES.slice(0,6+R(6)).map((n,i)=>({n,p:Math.round(teamPower()*(.5+Math.random()*1.2)),r:i==0?K('Лидер'):i<3?K('Старейшина'):K('Участник')}));
 S.g={name,lv:lv||1,xp:0,boss:{lv:1,hp:gbMax(1)},war:newWar(),mem};save();
}
function newWar(){const w=weekNo();return{wk:w,pts:0,d0:today(),riv:[.7,.85,1,1.2,1.45].map((f,i)=>({n:CLAN_NAMES[(w+i)%CLAN_NAMES.length],f,p0:80+R(160),beat:0,ids:npcIds(w*5+i+3)}))}}
const rivPts=r=>Math.round(r.p0+Math.max(0,today()-S.g.war.d0)*140*r.f);
function warRank(){if(!S.g)return 5;const me=S.g.war.pts;return S.g.war.riv.filter(r=>rivPts(r)>me).length}
function gXP(n){if(!S.g)return;S.g.xp+=n;while(S.g.xp>=S.g.lv*500){S.g.xp-=S.g.lv*500;S.g.lv++}}

/* ---------- событие недели ---------- */
const EV_NAME='Нашествие Бездны';
const evReward=t=>t==30?{skin:'void'}:t%5==0?{coupon:1,gold:100}:t%3==0?{token:2}:{gold:30+t*5};
function evTeam(t){
 const lvl=Math.max(1,(S.stage-1)*.92*.75)+t*2.2,m=1.45,team=[null,null,null,null,null];
 team[0]=monUnit('imp','dem',rawStats('mag',lvl,1,m));team[1]=monUnit('wraith','dem',rawStats('mag',lvl,1,m));
 const b=rawStats('mag',lvl,1,m*1.2);b.hp*=5;team[3]=monUnit('dragon','dem',b,{boss:1,name:'Вестник Бездны · '+t});return team;
}

/* ---------- магазины ---------- */
/* фракции врагов этапа и подсказка, кем их бить */
function counterHint(team){const fs=[...new Set(team.filter(Boolean).map(u=>u.fac).filter(Boolean))];const beat=fs.map(f=>Object.keys(BEATS).find(k=>BEATS[k]==f)).filter(Boolean);return{fs,beat:[...new Set(beat)]}}
/* достижения, обучение, почта */
const achReady=a=>!S.ach[a.id]&&(()=>{try{return a.f()}catch(e){return false}})();
function achClaim(id){const a=ACH.find(x=>x.id==id);if(!a||!achReady(a))return null;S.ach[id]=now();give(a.r);save();return a}
const tutStep=()=>S.tut<TUT.length?TUT[S.tut]:null;
function tutClaim(){const t=tutStep();if(!t||!t.f())return null;S.tut++;give(t.r);save();return t}
function mailSync(){for(const m of MAIL){if(S.mailSeen.includes(m.id))continue;S.mailSeen.push(m.id);S.mail.unshift({id:m.id,t:m.t,b:m.b,r:m.r,ts:now(),got:0,read:0})}}
function mailClaim(id){const m=S.mail.find(x=>x.id==id);if(!m||m.got)return null;m.got=1;m.read=1;if(m.r)give(m.r);save();return m}
function buyItem(list,id){
 const it=list.find(x=>x.id==id);if(!it)return false;const lk=id+':'+weekNo();
 if(it.lim&&(S.lim[lk]||0)>=it.lim)return false;
 if(!pay(it.cur,it.p))return false;
 if(it.r.usrShard){const own=HEROES.filter(h=>h.rar==4&&S.h[h.id]);const h=own.length?own[R(own.length)]:featured();if(S.h[h.id])S.h[h.id].sh+=it.r.usrShard;else grant(h.id)}
 give(it.r);if(it.lim)S.lim[lk]=(S.lim[lk]||0)+1;save();return true;
}

/* ===================== 2.2: снаряжение, питомцы, крылья, артефакты, сюжет, платные события ===================== */
const storyDone=c=>S.story.done.includes(c);
const featOn=f=>storyDone(FEAT[f]);
const curChap=()=>chapOf(Math.min(S.stage,MAX_STAGE));
function storyFinish(c){if(storyDone(c))return null;S.story.done.push(c);give(STORY[c-1].r);save();return STORY[c-1].r}
const divOn=k=>featOn('divine')&&effLv(po(k))>=DIV_LV, ancOn=k=>featOn('ancient')&&effLv(po(k))>=ANC_LV;
/* основное снаряжение: уровень 0–20 внутри качества, затем повышение качества */
const gearCost=x=>x[1]>=20?(x[0]>=GEAR_Q.length-1?null:{ore:200*(x[0]+1),silver:5e4*(x[0]+1),up:1}):{ore:10+gearPts(x)*6,silver:2000+gearPts(x)*1500};
function gearUp(k,slot){const x=po(k).eq[slot],c=gearCost(x);if(!c||S.ore<c.ore||S.silver<c.silver)return false;S.ore-=c.ore;S.silver-=c.silver;if(c.up){x[0]++;x[1]=0}else x[1]++;return true}
function gearAll(k){let n=0;const o=po(k);for(let g=0;g<600;g++){const sl=GEAR.map(x=>x.k).sort((a,b)=>gearPts(o.eq[a])-gearPts(o.eq[b]));let did=0;for(const s of sl){const c=gearCost(o.eq[s]);if(c&&!c.up&&gearUp(k,s)){did=1;n++;break}}if(!did)break}return n}
/* божественное и древнее: уровни 0–50 */
const divCost=l=>({divine:1+Math.floor(l/5),silver:2e4*(l+1)}), ancCost=l=>({ancient:1+Math.floor(l/4),silver:5e4*(l+1)});
function extraUp(k,kind,slot){const o=po(k),box=kind=='dv'?o.dv:o.an,l=box[slot]||0;if(l>=EXTRA_MAX)return false;if(kind=='dv'?!divOn(k):!ancOn(k))return false;
 const c=kind=='dv'?divCost(l):ancCost(l),cur=kind=='dv'?'divine':'ancient';if(S[cur]<c[cur]||S.silver<c.silver)return false;S[cur]-=c[cur];S.silver-=c.silver;box[slot]=l+1;return true}
/* питомцы */
const petCost=l=>5+l*2;
function petUp(id){const p=S.pets[id];if(!p||p.lv>=PET_MAX||S.food<petCost(p.lv))return false;S.food-=petCost(p.lv);p.lv++;return true}
function hatch(){if(S.egg<1)return null;S.egg--;const L=PETS.filter(p=>p.rar<5),w=L.map(p=>p.rar==2?60:p.rar==3?30:10);let x=Math.random()*w.reduce((a,b)=>a+b,0),i=0;for(;i<L.length-1;i++){x-=w[i];if(x<0)break}
 const P=L[i],nu=givePet(P.id);save();return{id:P.id,nu}}
/* крылья */
const wingCost=l=>3+l;
function wingUp(id){const w=S.wings[id];if(!w||w.lv>=WING_MAX||S.feather<wingCost(w.lv))return false;S.feather-=wingCost(w.lv);w.lv++;return true}
function wingCraft(id){const W=WINGS.find(x=>x.id==id);if(!W||!W.craft||S.wings[id]||S.feather<W.craft)return false;S.feather-=W.craft;giveWing(id);return true}
/* артефакты */
const relicCost=l=>10+l*5;
function relicUp(id){const r=S.relics[id];if(!r||r.lv>=RELIC_MAX||S.dust<relicCost(r.lv))return false;S.dust-=relicCost(r.lv);r.lv++;return true}
function relicCraft(id){const R=RELICS.find(x=>x.id==id);if(!R||!R.craft||S.relics[id]||S.dust<R.craft)return false;S.dust-=R.craft;giveRelic(id);return true}
function relicEquip(id){const i=S.relEq.indexOf(id);if(i>=0){S.relEq[i]=null;return'off'}const e=S.relEq.indexOf(null);if(e<0)return null;S.relEq[e]=id;return'on'}
/* платные события: Путь Легенды (недельный пропуск) */
function passSync(){const w=weekNo(),ps=S.paid&&S.paid.ps;if(ps&&ps.wk!==w)S.paid.ps={wk:w,prem:0,q:{},got:{f:[],v:[]}}}
function pq(k,n){if(!S.paid)return;passSync();const q=S.paid.ps.q;q[k]=(q[k]||0)+n}
const passPts=()=>{passSync();const q=S.paid.ps.q;return Math.floor(PASS_TASKS.reduce((a,t)=>a+Math.min(1,(q[t.k]||0)/t.g)*t.p,0))};
function passClaim(i,tr){passSync();const T=PASS_TIERS[i],ps=S.paid.ps;if(!T||passPts()<T.p||ps.got[tr].includes(i)||(tr=='v'&&!ps.prem))return null;ps.got[tr].push(i);give(tr=='v'?T.v:T.f);save();return tr=='v'?T.v:T.f}
function passBuy(){passSync();if(S.paid.ps.prem||!pay('gold',PASS_COST))return false;S.paid.ps.prem=1;save();return true}
/* Рулетка Легенд */
function roulSpin(n){const cost=n==10?ROUL_COST10:ROUL_COST*n;if(!pay('gold',cost))return null;const out=[],R=S.paid.rl,tot=ROUL.reduce((a,w)=>a+w.w,0),big=ROUL.findIndex(x=>x.k=='lrs'&&x.v==50);
 for(let i=0;i<n;i++){R.p++;R.n++;let j;if(R.p>=ROUL_PITY)j=big;else{let x=Math.random()*tot;j=0;for(;j<ROUL.length-1;j++){x-=ROUL[j].w;if(x<0)break}}if(j==big)R.p=0;give({[ROUL[j].k]:ROUL[j].v});out.push(j)}
 pq('rl',n);save();return out}
/* Пазл Небес: 16 плиток; линия — бонус, вся картина — герой LR почти целиком */
const LR_IDS=HEROES.filter(h=>h.rar==5).map(h=>h.id);
function pzOpen(t){const z=S.paid.pz;if(z.done||(z.open>>t)&1)return null;if(!pay('gold',PZ_COST))return null;z.open|=1<<t;
 let x=Math.random()*PZ_TILE.reduce((a,b)=>a+b.w,0),r=PZ_TILE[0].r;for(const it of PZ_TILE){x-=it.w;if(x<0){r=it.r;break}}give(r);
 const out={r,lines:0,full:false},row=Math.floor(t/4),col=t%4,full=m=>(z.open&m)==m;
 if(full(0xF<<(row*4))){out.lines++;give(PZ_LINE)}if(full((1|1<<4|1<<8|1<<12)<<col)){out.lines++;give(PZ_LINE)}
 if(z.open==0xFFFF){out.full=true;z.done=1;give(PZ_FULL)}pq('pz',1);save();return out}
function pzNext(){const z=S.paid.pz;if(!z.done)return;z.done=0;z.open=0;z.n++;z.i=(z.i+1)%LR_IDS.length;save()}
/* Алтарь Легенд: герои LR за Осколки Легенды */
function altarGet(id){if(S.h[id]||S.lrs<LR_UNLOCK||HERO[id].rar!=5)return false;S.lrs-=LR_UNLOCK;grant(id);S.hist.unshift({t:now(),b:'altar',id});save();return true}
function altarShards(id,n){if(!S.h[id]||S.lrs<n)return false;S.lrs-=n;S.h[id].sh+=n;save();return true}
