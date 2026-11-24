'use strict';
/* Небесный Престол — процедурная графика: персонажи, монстры, фоны, иконки */
const ICONS={
 home:'<path d="M3 11.5 12 3l9 8.5V21h-6.5v-6h-5v6H3z"/>',
 heroes:'<circle cx="9" cy="7.5" r="3.6"/><circle cx="17.2" cy="8.6" r="2.8"/><path d="M1.8 20.5c0-4.2 3.2-7.3 7.2-7.3s7.2 3.1 7.2 7.3zM16.6 20.5c.1-2.6-.6-4.5-1.9-6 4.4-1 8.5 1.1 8.5 6z"/>',
 battle:'<path d="M3 2.5h2.6l9 9-2.4 2.4-9-9zM21 2.5h-2.6l-9 9 2.4 2.4 9-9zM5.2 14.6l4.2 4.2-2.7 2.7-1.5-1.5-1.9 1.9-1.4-1.4 1.9-1.9-1.5-1.5zM18.8 14.6l-4.2 4.2 2.7 2.7 1.5-1.5 1.9 1.9 1.4-1.4-1.9-1.9 1.5-1.5z"/>',
 summon:'<path d="M12 1.8l2.5 7.2 7.3 2.5-7.3 2.5L12 21.2 9.5 14 2.2 11.5 9.5 9z"/><circle cx="19.5" cy="4" r="1.6"/><circle cx="4.5" cy="19.5" r="1.3"/>',
 guild:'<path d="M5 2h2.2v20H5zM8.2 3H21l-3.2 5.2L21 13.4H8.2z"/>',
 shop:'<path d="M4.5 8h15l-1.3 13.5H5.8zM8.4 8V6.6a3.6 3.6 0 017.2 0V8h-1.9V6.6a1.7 1.7 0 00-3.4 0V8z"/>',
 event:'<path d="M3 6h18v15H3z" opacity=".5"/><path d="M3 6h18v4H3zM7 2.5h2.2V8H7zM14.8 2.5H17V8h-2.2zM6.5 12.5h3.4v3.4H6.5zM11.4 12.5h3.4v3.4h-3.4z"/>',
 gift:'<path d="M3 8.5h18v4.2H3zM4.6 12.7h14.8V21H4.6z"/><path d="M10.8 8.5h2.4V21h-2.4z" opacity=".45"/><path d="M12 8.5C10 4.5 6 4 6 6.8s4 1.7 6 1.7c2 0 6 1.1 6-1.7S14 4.5 12 8.5z"/>',
 quest:'<path d="M5 2.5h12.5a2 2 0 012 2V21.5H7a2 2 0 01-2-2z"/><path d="M8.4 12.4l2.4 2.4 5-5.3" fill="none" stroke="#0b1030" stroke-width="2.2" stroke-linecap="round"/>',
 arena:'<path d="M7 2.5h10v6a5 5 0 01-10 0zM3.5 3.5H7V7a2.3 2.3 0 01-3.5-1.6zM17 3.5h3.5v1.9A2.3 2.3 0 0117 7zM10 13.6h4v3h3.3v3.6H6.7v-3.6H10z"/>',
 wheel:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="2.6"/>',
 gear:'<path d="M10.4 2h3.2l.5 2.7 2 .9 2.3-1.6 2.3 2.3-1.6 2.3.9 2 2.7.5v3.2l-2.7.5-.9 2 1.6 2.3-2.3 2.3-2.3-1.6-2 .9-.5 2.7h-3.2l-.5-2.7-2-.9-2.3 1.6-2.3-2.3 1.6-2.3-.9-2L2 13.6v-3.2l2.7-.5.9-2L4 5.6l2.3-2.3 2.3 1.6 2-.9z"/><circle cx="12" cy="12" r="3.3" fill="#0b1030"/>',
 star:'<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2.2"/><path d="M8 10V7.2a4 4 0 018 0V10" fill="none" stroke="currentColor" stroke-width="2.2"/>',
 close:'<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
 plus:'<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
 chev:'<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
 chest:'<path d="M3 9.5a3.5 3.5 0 013.5-3.5h11A3.5 3.5 0 0121 9.5V11H3z"/><path d="M3 11h18v9H3z" opacity=".8"/><path d="M10.4 9.6h3.2v4.6h-3.2z" fill="#fff8"/>',
 skull:'<path d="M12 2.5c5 0 8.5 3.4 8.5 8 0 2.7-1.3 4.6-3 5.6V20H6.5v-3.9c-1.7-1-3-2.9-3-5.6 0-4.6 3.5-8 8.5-8z"/><circle cx="8.6" cy="11" r="2.2" fill="#0b1030"/><circle cx="15.4" cy="11" r="2.2" fill="#0b1030"/>',
 silver:'<circle cx="12" cy="12" r="9.5" fill="#cfd8ea"/><circle cx="12" cy="12" r="6.6" fill="none" stroke="#7f8cb2" stroke-width="1.4"/><path d="M12 7.8l1.3 2.7 3 .4-2.2 2 .6 2.9L12 14.4l-2.7 1.4.6-2.9-2.2-2 3-.4z" fill="#7f8cb2"/>',
 gold:'<circle cx="12" cy="12" r="9.5" fill="#ffd35a"/><circle cx="12" cy="12" r="6.6" fill="none" stroke="#b07a1e" stroke-width="1.4"/><path d="M12 7.8l1.3 2.7 3 .4-2.2 2 .6 2.9L12 14.4l-2.7 1.4.6-2.9-2.2-2 3-.4z" fill="#b07a1e"/>',
 scroll:'<rect x="5" y="4" width="14" height="16" rx="2" fill="#f0dfb0"/><rect x="3" y="2.8" width="18" height="3.6" rx="1.8" fill="#b9853a"/><rect x="3" y="17.6" width="18" height="3.6" rx="1.8" fill="#b9853a"/><path d="M8 9.2h8M8 12h8M8 14.8h5" stroke="#9c7a40" stroke-width="1.3"/>',
 coupon:'<path d="M2.5 7h19v3.2a1.9 1.9 0 000 3.6V17h-19v-3.2a1.9 1.9 0 000-3.6z" fill="#ff8ad8"/><path d="M15 7.5v9" stroke="#ffffffaa" stroke-dasharray="1.6 1.6"/><path d="M8.5 9.3l.9 1.9 2.1.3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L5.5 11.5l2.1-.3z" fill="#fff"/>',
 token:'<circle cx="12" cy="12" r="9.5" fill="#62f0d2"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" stroke="#0b6b5c" stroke-width="1.2"/><circle cx="12" cy="12" r="3" fill="#0b6b5c"/>',
 exp:'<path d="M9 3h6v5.2l5 8.6a3 3 0 01-2.6 4.6H6.6A3 3 0 014 16.8l5-8.6z" fill="#8fdcff"/><path d="M6.1 14.6h11.8l1.6 2.7a2 2 0 01-1.8 3H6.3a2 2 0 01-1.8-3z" fill="#3a8fe0"/><rect x="8" y="1.8" width="8" height="2.2" rx="1.1" fill="#d8f0ff"/>',
 gcoin:'<path d="M12 2l8 3v6.2c0 5-3.5 8.9-8 10.8-4.5-1.9-8-5.8-8-10.8V5z" fill="#c9a0ff"/><path d="M12 6.4l1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 14.6l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#5a2a9a"/>',
 acoin:'<circle cx="12" cy="12" r="9.5" fill="#ff9a6a"/><path d="M7 9.5h10l-1.4 6H8.4z" fill="#7a2a10"/><path d="M7 9.5 5.5 6.5l3.5 1.5L12 5l3 3 3.5-1.5-1.5 3z" fill="#7a2a10"/>',
 shard:'<path d="M12 2l7 7.2L12 22 5 9.2z" fill="#b0e8ff"/><path d="M12 2l7 7.2H5z" fill="#ffffffaa"/>',
 skin:'<path d="M3 7.2c4.2-2.3 13.8-2.3 18 0 0 7.2-4 12-9 12S3 14.4 3 7.2z" fill="#ffd35a"/><path d="M6.4 10.6c1.6-1.1 3.5-1.1 4.1 0-1 1.6-3.1 1.6-4.1 0zM13.5 10.6c.6-1.1 2.5-1.1 4.1 0-1 1.6-3.1 1.6-4.1 0z" fill="#1a1030"/>',
 leaf:'<path d="M20.5 3C9.5 3 3.5 8.6 3.5 15.2c0 1.8.5 3.4 1.4 4.8L3.4 21.6l1.4.9 1.5-1.6c1.3.7 2.8 1.1 4.4 1.1C17.4 22 20.5 14 20.5 3zM7.2 18.4c2.5-4.4 5.6-7.6 9.8-10.2-3.6 3.2-6 6.6-7.9 11.1z"/>',
 flame:'<path d="M12 1.8c1.1 4.2 6.4 6.3 6.4 12.4A6.4 6.4 0 015.6 14.2c0-3.2 2-5.3 3.2-6.4 0 2.2 1 3.4 2.2 3.4 0-3.4-1-6.4 1-9.4z"/>',
 sun:'<circle cx="12" cy="12" r="5.2"/><path d="M11 .8h2v4.2h-2zM11 19h2v4.2h-2zM.8 11h4.2v2H.8zM19 11h4.2v2H19zM3.9 5.3l1.4-1.4 3 3-1.4 1.4zM15.7 17.1l1.4-1.4 3 3-1.4 1.4zM3.9 18.7l3-3 1.4 1.4-3 3zM15.7 6.9l3-3 1.4 1.4-3 3z"/>',
 wave:'<path d="M1.5 14.5c3 0 3-3.2 6-3.2s3 3.2 6 3.2 3-3.2 6-3.2c1.6 0 3 1 3 1v4.2s-1.4-1-3-1c-3 0-3 3.2-6 3.2s-3-3.2-6-3.2-3 3.2-6 3.2z"/><path d="M1.5 8c3 0 3-3.2 6-3.2s3 3.2 6 3.2 3-3.2 6-3.2c1.6 0 3 1 3 1v3.4s-1.4-1-3-1c-3 0-3 3.2-6 3.2S10.5 8.2 7.5 8.2s-3 3-6 3z" opacity=".55"/>',
 wing:'<path d="M22.5 3.5C14 3.5 5.5 7.5 2 18.5c3-2.2 5.2-2.3 7.4-2.2-1 1-2 2.3-2 4.2 3.8-3.2 7-3.4 9.2-4.3-1 0-2.1-1-2.1-2.1 3.2-1.2 6.6-4.4 8-10.6z"/>',
 horn:'<path d="M3.5 21.5C3.5 14 4.6 8 9.8 2.6c-1 5.2 0 9 2.2 12.2-2.4 2.6-5.3 4.5-8.5 6.7zM20.5 21.5c0-7.5-1.1-13.5-6.3-18.9 1 5.2 0 9-2.2 12.2 2.4 2.6 5.3 4.5 8.5 6.7z"/>',
 cWar:'<path d="M12 2l8 3v6.2c0 5-3.5 8.9-8 10.8-4.5-1.9-8-5.8-8-10.8V5z"/>',
 cMag:'<path d="M11 8.5h2V22h-2z"/><circle cx="12" cy="5.6" r="3.8"/>',
 cArc:'<path d="M6.5 2c8.4 3.4 8.4 16.6 0 20H4.4c7.3-4.4 7.3-15.6 0-20z"/><path d="M5 11h13l-2.6-2.4.9-.9L21 12l-4.7 4.3-.9-.9L18 13H5z"/>',
 cAsn:'<path d="M18.5 2H22v3.5l-9.6 9.6-3.5-3.5zM7.2 12.8l4 4-2 2-1.1-1.1-3.4 3.4-2-2 3.4-3.4-1-1z"/>',
 cHea:'<path d="M9.2 3h5.6v6.2H21v5.6h-6.2V21H9.2v-6.2H3V9.2h6.2z"/>',
 ore:'<path d="M4 15l4-8 6-2 6 5-2 8-8 2z" fill="#8a96b0"/><path d="M8 7l6-2 1 6-7 4z" fill="#c8d2e8"/><path d="M15 11l5-1-2 8-4-3z" fill="#5a6680"/><path d="M10 13l2 2-1 2z" fill="#ffd35a"/>',
 divine:'<path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffe9a0"/><circle cx="12" cy="11.5" r="3.2" fill="#fff"/><path d="M12 2l3 6 7 1-5 5" fill="none" stroke="#c8952f" stroke-width="1"/>',
 ancient:'<path d="M12 2l8 5v10l-8 5-8-5V7z" fill="#7a5a3a"/><path d="M12 5l5 3v8l-5 3-5-3V8z" fill="#c89a5a"/><path d="M12 8v8M9 10l6 4M15 10l-6 4" stroke="#4a2e14" stroke-width="1.2"/>',
 lrs:'<path d="M12 1.5l6.5 7L12 22.5 5.5 8.5z" fill="#ff5a3a"/><path d="M12 1.5l6.5 7h-13z" fill="#ffd0a0"/><path d="M12 8.5v14" stroke="#7a1a0a" stroke-width=".8"/>',
 ess:'<circle cx="12" cy="12" r="9" fill="#5a2a9a"/><path d="M12 3.5l2 6.3 6.3 2.2-6.3 2-2 6.5-2-6.5L3.7 12l6.3-2.2z" fill="#f0d0ff"/>',
 egg:'<path d="M12 2.5c4 0 7 6.5 7 11a7 7 0 01-14 0c0-4.5 3-11 7-11z" fill="#e8f0d8"/><path d="M5.6 12l2.4 2 2.5-2.4 2.5 2.4 2.5-2.4 2.5 2.4" fill="none" stroke="#5aa86a" stroke-width="1.6"/><circle cx="9" cy="8" r="1.3" fill="#5aa86a"/>',
 food:'<path d="M3 13h18a9 9 0 01-18 0z" fill="#c87a3a"/><path d="M6 13c0-3 2.5-5 6-5s6 2 6 5" fill="#ffd35a"/><circle cx="9" cy="10.5" r="1.3" fill="#ff7a4a"/><circle cx="14" cy="10" r="1.3" fill="#7ae04a"/>',
 feather:'<path d="M20 3C10 4 5 10 4.5 19.5L6 20c1.5-3 3-5 5-6.5-1.5 0-2.5-.3-3-.8 3 .2 5-.8 6.5-2.2-1.5 0-2.5-.3-3-.8 3-.2 5.5-2.2 8.5-6.7z" fill="#bfe8ff"/><path d="M4.5 21L14 9" stroke="#5a8aa8" stroke-width="1.2"/>',
 dust:'<circle cx="8" cy="15" r="3.2" fill="#9aa0ff"/><circle cx="15.5" cy="16.5" r="2.4" fill="#c0a0ff"/><circle cx="13" cy="9" r="2.8" fill="#7a8aff"/><path d="M18 4l.9 2.1L21 7l-2.1.9L18 10l-.9-2.1L15 7l2.1-.9z" fill="#fff"/>',
 asc:'<path d="M12 2l3.5 5H13v6h-2V7H8.5z" fill="#ff9ae0"/><path d="M5 14h14l-2 8H7z" fill="#a03a8a"/><path d="M8 14l4-3 4 3" fill="#ff7ae0"/>',
 crown:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><circle cx="12" cy="4" r="1.6"/><circle cx="3" cy="7.5" r="1.4"/><circle cx="21" cy="7.5" r="1.4"/>',
 gem:'<path d="M7 3h10l4 6-9 12L3 9z"/><path d="M3 9h18M12 21L8 9l4-6 4 6z" fill="none" stroke="#0b1030" stroke-width="1" opacity=".5"/>',
 puzzle:'<path d="M4 4h6a2.5 2.5 0 015 0h5v6a2.5 2.5 0 010 5v5h-6a2.5 2.5 0 00-5 0H4v-6a2.5 2.5 0 000-5z"/>',
 pet:'<path d="M5 9.5a2.2 2.6 0 104.4 0 2.2 2.6 0 10-4.4 0zM14.6 9.5a2.2 2.6 0 104.4 0 2.2 2.6 0 10-4.4 0zM8.5 5a2 2.4 0 104 0 2 2.4 0 10-4 0zM11.5 5a2 2.4 0 104 0 2 2.4 0 10-4 0z"/><path d="M12 11c3.5 0 6 3.5 6 6.2 0 2.3-2 3.3-3.6 2.6-1.1-.5-1.6-.8-2.4-.8s-1.3.3-2.4.8C8 20.5 6 19.5 6 17.2 6 14.5 8.5 11 12 11z"/>',
 relic:'<path d="M12 2l3 4h4l-2 4 2 4h-4l-3 4-3-4H5l2-4-2-4h4z"/><circle cx="12" cy="10" r="2.6" fill="#0b1030" opacity=".55"/>',
 book:'<path d="M3 4.5C6 3.5 9 3.8 11.3 5.5V20c-2.3-1.6-5.3-1.9-8.3-1z"/><path d="M21 4.5c-3-1-6-.7-8.3 1V20c2.3-1.6 5.3-1.9 8.3-1z" opacity=".75"/>',
 anvil:'<path d="M3 6h13c0 3 2.5 4 5 4v2c-3 0-5 1-6 3H9c-1-2-3-3-6-3z"/><path d="M8 15h8l1.5 5h-11z" opacity=".8"/>',
 globe:'<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.5 12h19M12 2.5c2.8 2.6 4.2 5.8 4.2 9.5s-1.4 6.9-4.2 9.5c-2.8-2.6-4.2-5.8-4.2-9.5s1.4-6.9 4.2-9.5z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
 mail:'<path d="M2.5 5.5h19v13h-19z" opacity=".55"/><path d="M2.5 5.5h19L12 13.2z"/><path d="M2.5 18.5l7.2-6.6L12 14l2.3-2.1 7.2 6.6z" opacity=".8"/>'
};
function icon(n,s,cls){s=s||18;return `<svg class="ic ${cls||''}" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true">${ICONS[n]||''}</svg>`}

const ART=(()=>{
const DPR=(()=>{let q=1;try{const v=localStorage.getItem('np_q');if(v!=null)q=+v}catch(e){}return q?Math.min(2,window.devicePixelRatio||1):1})();
const hexRgb=h=>{h=h.replace('#','');if(h.length==3)h=[...h].map(x=>x+x).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]};
const rgba=(h,a)=>{const[r,g,b]=hexRgb(h);return`rgba(${r},${g},${b},${a})`};
const mix=(h,t,p)=>{const a=hexRgb(h),b=hexRgb(t);return'#'+a.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(b[i]-v)*p))).toString(16).padStart(2,'0')).join('')};
const lt=(h,p)=>mix(h,'#ffffff',p), dk=(h,p)=>mix(h,'#000000',p);
const hash=s=>{let x=2166136261;for(const ch of String(s)){x^=ch.charCodeAt(0);x=Math.imul(x,16777619)}return x>>>0};
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const OUT='rgba(14,10,36,.82)';
const P=c=>c.beginPath();
let LWK=1;
function fs(c,fill,lw){c.fillStyle=fill;c.fill();if(lw!==0){c.lineWidth=(lw||1.6)*LWK;c.strokeStyle=OUT;c.stroke()}}
function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g}
function rg(c,x,y,r0,r1,st,x1,y1){const g=c.createRadialGradient(x,y,r0,x1==null?x:x1,y1==null?y:y1,r1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g}
function ell(c,x,y,rx,ry,fill,lw){P(c);c.ellipse(x,y,rx,ry,0,0,Math.PI*2);fs(c,fill,lw)}
function rr(c,x,y,w,h,r){P(c);c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function star4(c,x,y,r,col){P(c);c.moveTo(x,y-r);c.quadraticCurveTo(x,y,x+r,y);c.quadraticCurveTo(x,y,x,y+r);c.quadraticCurveTo(x,y,x-r,y);c.quadraticCurveTo(x,y,x,y-r);c.fillStyle=col;c.fill()}

/* ---------- облик ---------- */
function heroLook(h){
 const F=FAC[h.fac];
 const W={war:h.sex=='m'&&h.rar>=3?'gsword':'sword',mag:'staff',arc:'bow',asn:'daggers',hea:h.sex=='f'?'tome':'staff'}[h.cls];
 return {kind:'char',cls:h.cls,fac:h.fac,rar:h.rar,sex:h.sex,hair:h.hair,hc:h.hc,head:h.head,seed:hash(h.id),
  skin:h.fac=='dem'?'#ecd0e0':h.fac=='ang'?'#fbe4d4':'#f7d6bf',eyes:h.fac=='ang'?'#e8b840':h.fac=='dem'?'#ff3a5a':F.c,
  armor:F.a,armor2:F.a2,cape:h.rar>=1?dk(F.a,.25):null,weapon:W,shield:h.cls=='war'&&W=='sword',wc:F.c,
  aura:h.rar>=2?RAR[h.rar].c:null,wings:h.fac=='ang'?'angel':h.fac=='dem'?(h.id=='azael'?'fallen':(h.rar>=3?'demon':null)):null};
}
function mainLook(cls,skinId){
 const B={
  war:{sex:'m',hair:3,hc:'#2a2440',head:'circlet',armor:'#3b4f8f',armor2:'#f3cb6b',weapon:'sword',shield:1,cape:'#7a1f2f',wc:'#9ad8ff',eyes:'#5aa0ff'},
  mag:{sex:'f',hair:5,hc:'#c9d4ff',head:'circlet',armor:'#2a2f7a',armor2:'#9ad8ff',weapon:'staff',cape:'#1a1f50',wc:'#8fdcff',eyes:'#7a9aff'},
  arc:{sex:'f',hair:2,hc:'#e8e0ff',head:'hood',armor:'#2f6a5a',armor2:'#e8d8a0',weapon:'bow',cape:'#1f4a40',wc:'#bfffe8',eyes:'#3ad0a0'},
  asn:{sex:'m',hair:4,hc:'#1a1a2a',head:'mask',armor:'#1f1f33',armor2:'#c040ff',weapon:'daggers',cape:'#2a1040',wc:'#d070ff',eyes:'#c040ff'}
 }[cls];
 const sk=SKINS.find(s=>s.id==skinId)||SKINS[0];
 return Object.assign({kind:'char',cls,fac:null,rar:2,skin:'#f7d6bf',seed:hash('main'+cls),aura:'#f3cb6b'},B,sk.o,{rar:sk.r>=0?Math.max(2,sk.r):2});
}
function monLook(type,fac,boss){
 const F=FAC[fac]||FAC.dem;
 if(type=='goblin')return{kind:'char',cls:'arc',fac,rar:1,sex:'m',hair:-1,hc:null,head:'cap',skin:'#8fbf5a',eyes:'#ffe14a',armor:'#5a3a1a',armor2:F.c,weapon:'bow',wc:F.c,ears:1,seed:hash(type+fac),boss};
 if(type=='imp')return{kind:'char',cls:'mag',fac,rar:1,sex:'m',hair:3,hc:'#2a0a1a',head:'horns',skin:'#e0605a',eyes:'#ffe14a',armor:'#3a1020',armor2:F.c,weapon:'spear',wc:F.c,wings:'demon',ears:1,seed:hash(type+fac),boss};
 return {kind:'mon',type,fac,boss,c1:F.c,c2:F.d};
}

/* ---------- персонаж в героических пропорциях (поле 100×130, ступни на y=124) ---------- */
const BACKW=['staff','scythe','spear','gsword'];
const OUTL='rgba(6,4,14,.72)';
const HX=50,HY=17.5;
function fl(c,fill,lw){c.fillStyle=fill;c.fill();if(lw!==0){c.lineWidth=lw||.8;c.strokeStyle=OUTL;c.stroke()}}
const metal=(c,x0,y0,x1,y1,b)=>lg(c,x0,y0,x1,y1,[[0,dk(b,.6)],[.28,b],[.46,lt(b,.55)],[.58,b],[1,dk(b,.65)]]);
const cloth=(c,x0,y0,x1,y1,b)=>lg(c,x0,y0,x1,y1,[[0,lt(b,.16)],[.55,b],[1,dk(b,.55)]]);
const POSE={def:[[35,46],[33,61],[65,46],[67,61]],sword:[[35,46],[34,60],[65,46],[66,60]],staff:[[35,46],[34,61],[66,41],[67.5,49]],
 bow:[[31,37],[23,43],[61,39],[55,43]],tome:[[35,46],[38,53],[65,46],[67,60]],daggers:[[34,46],[30,58],[66,46],[70,58]],
 gsword:[[35,47],[36,62],[65,47],[64,62]],scythe:[[35,46],[34,61],[66,41],[67.5,49]],spear:[[35,46],[34,61],[66,41],[67.5,49]]};
function limb(c,pts,w,col){c.lineCap='round';c.lineJoin='round';P(c);c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.lineWidth=w+1.3;c.strokeStyle=OUTL;c.stroke();c.lineWidth=w;c.strokeStyle=col;c.stroke()}
function drawChar(c,L){
 const R=rng(L.seed||7),f=L.sex=='f',robe=L.cls=='mag'||L.cls=='hea';
 if(L.aura){P(c);c.rect(-20,-10,140,150);c.fillStyle=rg(c,50,62,3,72,[[0,rgba(L.aura,L.rar>=4?.5:.32)],[.5,rgba(L.aura,.1)],[1,rgba(L.aura,0)]]);c.fill()}
 ell(c,50,123.5,21,4.2,'rgba(0,0,0,.55)',0);
 if(L.rar>=3){c.save();P(c);c.ellipse(50,123.5,27,6.2,0,0,Math.PI*2);c.lineWidth=.9;c.strokeStyle=rgba(L.aura||'#e8c77a',.8);c.shadowColor=L.aura||'#e8c77a';c.shadowBlur=7;c.stroke();P(c);c.ellipse(50,123.5,20,4.4,0,0,Math.PI*2);c.lineWidth=.5;c.stroke();c.restore()}
 if(L.head=='sunhalo'){P(c);for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=i%2?11:16;c.lineTo(HX+Math.cos(a)*r,HY-1+Math.sin(a)*r)}c.closePath();c.fillStyle=rg(c,HX,HY,2,16,[[0,'rgba(255,246,200,.95)'],[1,'rgba(255,190,60,.25)']]);c.fill()}
 if(L.wings)wings(c,L);
 if(L.cape)cape(c,L,f);
 hairBack(c,L,f);
 if(BACKW.includes(L.weapon))weapon(c,L);
 legs(c,L,f,robe);torso(c,L,f,robe);arms(c,L,f,robe);
 if(!BACKW.includes(L.weapon))weapon(c,L);
 if(L.shield)shield(c,L);
 if(L.head=='pumpkin')pumpkin(c,L);else{head(c,L,f);hairFront(c,L,f)}
 headgear(c,L);
 if(L.rar>=2){const col=L.rar>=4?'#ffffff':RAR[L.rar].c;for(let i=0;i<(L.rar>=4?10:6);i++)star4(c,8+R()*84,6+R()*112,.8+R()*1.8,rgba(col,.5+R()*.45))}
 P(c);c.moveTo(50+13,31);c.quadraticCurveTo(50+16,60,50+10,72);c.lineWidth=.8;c.strokeStyle=rgba(L.aura||'#ffe9b0',.35);c.stroke();
}
function wings(c,L){
 const t=L.wings;
 [-1,1].forEach(d=>{c.save();c.translate(50+d*4,35);c.scale(d,1);
  if(t=='demon'){const col=L.wingC||L.armor2||'#b04dff';P(c);c.moveTo(0,0);c.lineTo(12,-26);c.lineTo(30,-34);c.lineTo(46,-30);c.lineTo(48,-6);c.quadraticCurveTo(42,-6,39,4);c.quadraticCurveTo(34,-2,30,10);c.quadraticCurveTo(24,2,20,14);c.quadraticCurveTo(12,6,6,16);c.closePath();
   fl(c,lg(c,0,-34,48,14,[[0,'#16061c'],[.6,dk(col,.45)],[1,col]]),.8);c.strokeStyle=rgba('#000000',.55);c.lineWidth=.9;[[39,4],[30,10],[20,14]].forEach(([x,y])=>{P(c);c.moveTo(12,-26);c.lineTo(x,y);c.stroke()});P(c);c.moveTo(30,-34);c.lineTo(46,-30);c.stroke()}
  else{const col=L.wingC||(t=='angel'?'#fbfaff':'#22203a'),ed=L.wingE||(t=='angel'?'#e8c77a':'#6a50a0');
   for(let row=0;row<3;row++)for(let i=7;i>=0;i--){c.save();c.rotate(-1.35+i*.2+row*.05);P(c);const len=36-i*2.2-row*8;c.ellipse(len*.55,0,len*.55,2.6-row*.4,0,0,Math.PI*2);fl(c,lg(c,0,0,len,0,[[0,mix(col,'#000000',row*.12)],[.7,mix(col,ed,.25)],[1,ed]]),.5);c.restore()}}
  c.restore()});
}
function cape(c,L,f){const w=f?10:12;P(c);c.moveTo(50-w,30);c.quadraticCurveTo(50,27,50+w,30);c.quadraticCurveTo(50+w+6,70,50+w+9,119);c.quadraticCurveTo(50+6,115,50,121);c.quadraticCurveTo(50-6,115,50-w-9,119);c.quadraticCurveTo(50-w-6,70,50-w,30);c.closePath();fl(c,lg(c,30,30,70,120,[[0,lt(L.cape,.12)],[.5,L.cape],[1,dk(L.cape,.6)]]))}
function hairBack(c,L,f){
 if(!L.hc||L.head=='pumpkin'||L.hair<0)return;const s=L.hair,g=lg(c,0,8,0,72,[[0,lt(L.hc,.18)],[1,dk(L.hc,.45)]]);
 if(s==1){P(c);c.moveTo(HX-6.8,HY-2);c.quadraticCurveTo(HX-9.5,30,HX-9,46);c.lineTo(HX+9,46);c.quadraticCurveTo(HX+9.5,30,HX+6.8,HY-2);c.closePath();fl(c,g)}
 else if(s==5){P(c);c.moveTo(HX-7,HY-3);c.bezierCurveTo(HX-12,32,HX-8,52,HX-12,70);c.quadraticCurveTo(HX,66,HX+12,70);c.bezierCurveTo(HX+8,52,HX+12,32,HX+7,HY-3);c.closePath();fl(c,g)}
 else if(s==2){P(c);c.moveTo(HX+3,HY-8);c.bezierCurveTo(HX+14,HY-6,HX+12,30,HX+8,46);c.quadraticCurveTo(HX+6,32,HX+2,HY-3);c.closePath();fl(c,g)}
 else{ell(c,HX,HY-1,7.4,8.2,g)}
}
function legs(c,L,f,robe){
 const bc=L.cls=='war'?L.armor:dk(L.armor2||L.armor,.55);
 if(robe){[-1,1].forEach(d=>{P(c);c.moveTo(50+d*2,119);c.lineTo(50+d*7,119);c.lineTo(50+d*8,123.5);c.lineTo(50+d*1.5,123.5);c.closePath();fl(c,dk(bc,.2),.6)});return}
 const lc=dk(L.armor,.5),gp=f?1.1:1.7;
 [-1,1].forEach(d=>{const x=50+d*(gp+3.3);
  P(c);c.moveTo(x-3.8,60);c.lineTo(x+3.8,60);c.lineTo(x+3,92);c.lineTo(x+2.5,116);c.lineTo(x-2.5,116);c.lineTo(x-3,92);c.closePath();fl(c,cloth(c,x-4,0,x+4,0,lc));
  P(c);c.moveTo(x-3.3,98);c.lineTo(x+3.3,98);c.lineTo(x+3,117);c.lineTo(x+d*5+(d>0?0:-1),123.6);c.lineTo(x-d*1-(d>0?3:-3),123.6);c.lineTo(x-3,117);c.closePath();fl(c,L.cls=='war'?metal(c,x-4,0,x+4,0,bc):cloth(c,x-4,98,x+4,124,bc));
  if(L.cls=='war')ell(c,x,92,3.3,2.7,metal(c,x-3,0,x+3,0,L.armor2||bc),.6)});
}
function torso(c,L,f,robe){
 const a=L.armor,a2=L.armor2||lt(a,.5),sw=f?10.5:12.8,ww=f?5.6:7.2,war=L.cls=='war';
 P(c);c.moveTo(50-sw,30.5);c.quadraticCurveTo(50,27.2,50+sw,30.5);c.lineTo(50+ww+1.5,45);c.quadraticCurveTo(50+ww,53,50+ww+2,60);c.lineTo(50-ww-2,60);c.quadraticCurveTo(50-ww,53,50-ww-1.5,45);c.closePath();
 fl(c,war?metal(c,50-sw,0,50+sw,0,a):cloth(c,50-sw,28,50+sw,60,a));
 if(robe){
  P(c);c.moveTo(50-ww-2,55);c.lineTo(50+ww+2,55);c.quadraticCurveTo(50+15,88,50+19.5,121);c.quadraticCurveTo(50,124.5,50-19.5,121);c.quadraticCurveTo(50-15,88,50-ww-2,55);c.closePath();fl(c,cloth(c,32,55,68,122,a));
  c.strokeStyle=rgba(dk(a,.65),.55);c.lineWidth=.6;[[43,62,36,119],[57,62,64,119],[47,70,44,120],[53,70,56,120]].forEach(([x0,y0,x1,y1])=>{P(c);c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2+(x1-x0)*.25,(y0+y1)/2,x1,y1);c.stroke()});
  P(c);c.moveTo(48.3,55);c.lineTo(51.7,55);c.lineTo(54.5,121.5);c.lineTo(45.5,121.5);c.closePath();fl(c,lg(c,45,0,55,0,[[0,dk(a2,.35)],[.5,lt(a2,.3)],[1,dk(a2,.35)]]),.5);
  P(c);c.moveTo(30.6,119.5);c.quadraticCurveTo(50,125,69.4,119.5);c.lineWidth=1.4;c.strokeStyle=a2;c.stroke();
  rr(c,50-ww-2,53.5,ww*2+4,3.2,1);fl(c,metal(c,40,0,60,0,a2),.5);
 }else{
  P(c);c.moveTo(50-ww-2,59.5);c.lineTo(50+ww+2,59.5);c.lineTo(50+ww+5,f?75:73);c.quadraticCurveTo(50,f?77:75,50-ww-5,f?75:73);c.closePath();fl(c,war?metal(c,40,0,60,0,dk(a,.12)):cloth(c,40,60,60,75,dk(a,.2)));
  rr(c,50-ww-2,56.5,ww*2+4,3.6,1);fl(c,dk(a2,.35),.5);rr(c,48.3,56,3.4,4.6,1);fl(c,metal(c,48,0,52,0,a2),.4);
  if(war){P(c);c.moveTo(50,30);c.lineTo(50,55);c.lineWidth=.7;c.strokeStyle=rgba(lt(a,.75),.55);c.stroke();P(c);c.moveTo(50-sw+2,42);c.quadraticCurveTo(50,46,50+sw-2,42);c.strokeStyle=rgba(dk(a,.65),.7);c.stroke();
   P(c);c.moveTo(50-sw,30.5);c.quadraticCurveTo(50,27.2,50+sw,30.5);c.lineWidth=1.3;c.strokeStyle=a2;c.stroke()}
  else{P(c);c.moveTo(46,29.5);c.lineTo(50,45);c.lineTo(54,29.5);c.lineWidth=1.1;c.strokeStyle=a2;c.stroke();
   if(L.cls=='asn'){P(c);c.moveTo(45,28);c.quadraticCurveTo(56,29,58,33);c.quadraticCurveTo(73,40,82,58);c.lineTo(76,57);c.quadraticCurveTo(67,44,52,36);c.closePath();fl(c,cloth(c,45,28,82,58,a2),.5)}}
 }
 c.save();c.shadowColor=L.wc||'#fff';c.shadowBlur=5;ell(c,50,37,1.7,1.7,rg(c,49.5,36.5,.2,2,[[0,'#ffffff'],[.5,L.wc||'#fff'],[1,dk(L.wc||'#888',.4)]]),0);c.restore();
}
function arms(c,L,f,robe){
 const sw=f?10.5:12.8,p=POSE[L.weapon]||POSE.def,w=f?3.3:4.1,war=L.cls=='war',col=war?lt(L.armor,.08):dk(L.armor,.12);
 [[50-sw+1.6,31.5,p[0],p[1]],[50+sw-1.6,31.5,p[2],p[3]]].forEach(([sx,sy,e,h])=>{
  limb(c,[[sx,sy],e,h],w,col);
  if(robe||L.cls=='hea'){P(c);c.moveTo(e[0]-2.4,e[1]-1);c.lineTo(h[0]-4.2,h[1]-1.5);c.quadraticCurveTo(h[0],h[1]+2,h[0]+4.2,h[1]-1.5);c.lineTo(e[0]+2.4,e[1]-1);c.closePath();fl(c,cloth(c,h[0]-4,e[1],h[0]+4,h[1],L.armor),.6);P(c);c.moveTo(h[0]-4.2,h[1]-1.5);c.quadraticCurveTo(h[0],h[1]+2,h[0]+4.2,h[1]-1.5);c.lineWidth=.9;c.strokeStyle=L.armor2||'#e8c77a';c.stroke()}
  else if(war){limb(c,[e,h],w+.6,metal(c,h[0]-3,0,h[0]+3,0,L.armor))}
  ell(c,h[0],h[1]+.6,1.8,2,L.skin,.5);
  if(war)ell(c,sx,sy+.5,5.8,4.6,metal(c,sx-6,0,sx+6,0,L.armor2||L.armor),.8);
  else ell(c,sx,sy+.4,3.4,2.6,cloth(c,sx-3,sy-2,sx+3,sy+3,dk(L.armor,.05)),.5);
 });
}
function weapon(c,L){
 const w=L.weapon,col=L.wc||'#cfe8ff';
 const glow=(x,y,r,a)=>{P(c);c.arc(x,y,r,0,Math.PI*2);c.fillStyle=rg(c,x,y,0,r,[[0,rgba(col,a||.95)],[.35,rgba(col,.45)],[1,rgba(col,0)]]);c.fill()};
 const blade=(len,wd)=>{P(c);c.moveTo(-wd,0);c.lineTo(-wd*.9,-len);c.lineTo(0,-len-wd*2.6);c.lineTo(wd*.9,-len);c.lineTo(wd,0);c.closePath();fl(c,lg(c,-wd,0,wd,0,[[0,'#dfe6f4'],[.48,'#ffffff'],[.52,lt(col,.35)],[1,'#5e6888']]),.6);
  c.save();c.shadowColor=col;c.shadowBlur=6;P(c);c.moveTo(0,-2);c.lineTo(0,-len);c.strokeStyle=rgba(col,.9);c.lineWidth=.6;c.stroke();c.restore()};
 const pole=(x0,y0,x1,y1)=>{P(c);c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineCap='round';c.lineWidth=2.6;c.strokeStyle=OUTL;c.stroke();c.lineWidth=1.6;c.strokeStyle=lg(c,0,y1,0,y0,[[0,'#c49a5a'],[1,'#3a2414']]);c.stroke()};
 if(w=='sword'){c.save();c.translate(66,61);c.rotate(Math.PI*.83);blade(38,1.7);c.restore();c.save();c.translate(66,61);c.rotate(Math.PI*.83+Math.PI);rr(c,-4.5,-.8,9,1.8,.8);fl(c,metal(c,-5,0,5,0,L.armor2||'#d8b050'),.5);rr(c,-.9,-6.5,1.8,6,.8);fl(c,'#3a2014',.4);ell(c,0,-7,1.2,1.2,L.armor2||'#d8b050',.4);c.restore()}
 else if(w=='gsword'){c.save();c.translate(52,70);c.rotate(-.5);blade(72,3);rr(c,-6,-.5,12,2.4,1);fl(c,metal(c,-6,0,6,0,L.armor2||'#d8b050'),.5);c.restore()}
 else if(w=='staff'||w=='scythe'||w=='spear'){
  pole(67.5,122,67.5,8);
  if(w=='staff'){P(c);c.moveTo(67.5,10);c.bezierCurveTo(60,8,60,-2,67.5,-3);c.bezierCurveTo(75,-2,75,8,67.5,10);c.lineWidth=1.2;c.strokeStyle=L.armor2||'#e8c77a';c.stroke();glow(67.5,3.5,11);c.save();c.shadowColor=col;c.shadowBlur=8;P(c);c.moveTo(67.5,-1);c.lineTo(70,3.5);c.lineTo(67.5,8);c.lineTo(65,3.5);c.closePath();fl(c,lg(c,65,0,70,0,[[0,lt(col,.6)],[1,dk(col,.3)]]),.4);c.restore()}
  if(w=='spear'){P(c);c.moveTo(67.5,-6);c.lineTo(70.4,9);c.lineTo(64.6,9);c.closePath();fl(c,lg(c,64,0,71,0,[[0,'#f6faff'],[1,'#6e78a0']]),.5);glow(67.5,4,7,.6)}
  if(w=='scythe'){P(c);c.moveTo(67.5,9);c.bezierCurveTo(62,-6,40,-6,26,8);c.bezierCurveTo(42,0,58,4,67.5,15);c.closePath();fl(c,lg(c,26,0,68,14,[[0,lt(col,.45)],[1,'#2e2e40']]),.6);glow(40,3,9,.5)}
 }
 else if(w=='bow'){c.save();c.translate(23,43);P(c);c.moveTo(3,-30);c.bezierCurveTo(-7,-22,-9,-8,-2,0);c.bezierCurveTo(-9,8,-7,22,3,30);c.lineWidth=2.6;c.strokeStyle=OUTL;c.stroke();c.lineWidth=1.6;c.strokeStyle=lg(c,0,-30,0,30,[[0,lt(col,.35)],[.5,'#6a4220'],[1,lt(col,.35)]]);c.stroke();
  P(c);c.moveTo(3,-30);c.lineTo(32,0);c.lineTo(3,30);c.lineWidth=.4;c.strokeStyle='rgba(255,255,255,.8)';c.stroke();
  c.save();c.shadowColor=col;c.shadowBlur=8;P(c);c.moveTo(34,0);c.lineTo(-8,0);c.lineWidth=.9;c.strokeStyle=lt(col,.4);c.stroke();P(c);c.moveTo(-11,0);c.lineTo(-6,-1.6);c.lineTo(-6,1.6);c.closePath();c.fillStyle='#ffffff';c.fill();c.restore();glow(-8,0,6,.7);c.restore()}
 else if(w=='daggers'){[[30,58,Math.PI*1.12],[70,58,-Math.PI*1.12]].forEach(([x,y,r])=>{c.save();c.translate(x,y);c.rotate(r);blade(13,1.3);rr(c,-2.8,-.4,5.6,1.4,.6);fl(c,metal(c,-3,0,3,0,L.armor2||'#999'),.4);c.restore()})}
 else if(w=='tome'){c.save();c.translate(36,49);c.rotate(-.25);glow(0,-1,12,.7);P(c);c.moveTo(-6,-4);c.quadraticCurveTo(-3,-5.5,0,-4);c.quadraticCurveTo(3,-5.5,6,-4);c.lineTo(6,3);c.quadraticCurveTo(3,1.5,0,3);c.quadraticCurveTo(-3,1.5,-6,3);c.closePath();fl(c,'#fff4dc',.5);P(c);c.moveTo(0,-4);c.lineTo(0,3);c.lineWidth=.4;c.strokeStyle='#a08050';c.stroke();
  c.fillStyle=rgba(col,.9);for(let i=0;i<3;i++){c.fillRect(-4.5,-2.4+i*1.6,3,.4);c.fillRect(1.5,-2.4+i*1.6,3,.4)}c.restore()}
}
function shield(c,L){c.save();c.translate(31.5,63);P(c);c.moveTo(0,-10);c.quadraticCurveTo(7.5,-10,8,-7.5);c.quadraticCurveTo(8,5,0,12);c.quadraticCurveTo(-8,5,-8,-7.5);c.quadraticCurveTo(-7.5,-10,0,-10);c.closePath();fl(c,metal(c,-8,0,8,0,L.armor2||'#e8c77a'),.8);
 P(c);c.moveTo(0,-7);c.quadraticCurveTo(5,-7,5.4,-5.4);c.quadraticCurveTo(5.4,3.5,0,8.4);c.quadraticCurveTo(-5.4,3.5,-5.4,-5.4);c.quadraticCurveTo(-5,-7,0,-7);c.closePath();fl(c,cloth(c,-5,-7,5,8,L.armor),.5);c.save();c.shadowColor=L.wc||'#fff';c.shadowBlur=6;star4(c,0,0,3.2,L.wc||'#fff');c.restore();c.restore()}
function head(c,L,f){
 const rx=f?5.6:6.1,ry=f?7.1:7.5,s=L.skin;
 rr(c,47.9,22.5,4.2,8,2);fl(c,lg(c,0,22,0,30,[[0,dk(s,.35)],[1,dk(s,.12)]]),.5);
 const pointy=L.ears||L.fac=='les'||L.fac=='dem';
 [-1,1].forEach(d=>{P(c);if(pointy){c.moveTo(HX+d*(rx-.6),16.2);c.lineTo(HX+d*(rx+4.6),11.2);c.lineTo(HX+d*(rx-.4),20.4)}else c.ellipse(HX+d*rx,18.4,1.2,1.9,0,0,Math.PI*2);c.closePath();fl(c,dk(s,.06),.5)});
 P(c);c.moveTo(HX-rx,HY-1);c.bezierCurveTo(HX-rx,HY-ry-1.6,HX+rx,HY-ry-1.6,HX+rx,HY-1);c.bezierCurveTo(HX+rx,HY+3.4,HX+2.5,HY+ry,HX,HY+ry);c.bezierCurveTo(HX-2.5,HY+ry,HX-rx,HY+3.4,HX-rx,HY-1);c.closePath();
 fl(c,rg(c,HX-1.8,HY-2.2,.4,7.2,[[0,lt(s,.22)],[.65,s],[1,dk(s,.28)]],HX,HY),.6);
 P(c);c.moveTo(HX+rx-.2,HY-1);c.bezierCurveTo(HX+rx,HY+3.2,HX+2.4,HY+ry-.2,HX+.6,HY+ry-.2);c.quadraticCurveTo(HX+3.6,HY+2,HX+rx-.2,HY-1);c.fillStyle=rgba(dk(s,.4),.35);c.fill();
 if(L.head=='visor')return;
 const ec=L.eyes||'#5a8aff',ey=HY+.7,glowE=L.fac=='dem'||L.fac=='ang'||L.rar>=4;
 [-1,1].forEach(d=>{const ex=HX+d*2.45;
  P(c);c.moveTo(ex-1.65,ey+.05);c.quadraticCurveTo(ex,ey-1.3,ex+1.65,ey-.05);c.quadraticCurveTo(ex,ey+.95,ex-1.65,ey+.05);c.closePath();c.fillStyle='#f2eef4';c.fill();
  c.save();if(glowE){c.shadowColor=ec;c.shadowBlur=3}P(c);c.arc(ex,ey-.08,.85,0,Math.PI*2);c.fillStyle=rg(c,ex,ey-.4,.1,.95,[[0,lt(ec,.45)],[1,dk(ec,.4)]]);c.fill();c.restore();
  ell(c,ex,ey-.05,.36,.44,'#0a0612',0);ell(c,ex-.32,ey-.38,.22,.22,'#ffffff',0);
  P(c);c.moveTo(ex-1.85,ey+.15);c.quadraticCurveTo(ex,ey-1.6,ex+1.85,ey-.12);c.lineWidth=f?.55:.42;c.strokeStyle='#160c14';c.stroke();
  if(f){P(c);c.moveTo(ex+d*1.7,ey-.25);c.lineTo(ex+d*2.45,ey-.9);c.lineWidth=.32;c.stroke()}
  const tilt=L.cls=='war'&&!f?.45:0;P(c);c.moveTo(ex-d*1.8,ey-2.1-tilt);c.quadraticCurveTo(ex,ey-(f?3:2.7),ex+d*1.9,ey-2.2+tilt*.2);c.lineWidth=f?.38:.6;c.strokeStyle=dk(L.hc||'#3a2a2a',.35);c.stroke();
 });
 P(c);c.moveTo(HX+.2,HY+1.4);c.lineTo(HX+.7,HY+3.7);c.lineTo(HX-.3,HY+4);c.lineWidth=.32;c.strokeStyle=rgba(dk(s,.5),.85);c.stroke();
 P(c);c.moveTo(HX-1.35,HY+5.35);c.quadraticCurveTo(HX,HY+(f?6.15:5.8),HX+1.35,HY+5.35);c.lineWidth=f?.62:.4;c.strokeStyle=f?'#b4485c':rgba(dk(s,.55),.85);c.stroke();
 if(f){ell(c,HX-3.6,HY+3.2,1.3,.6,'rgba(255,120,140,.22)',0);ell(c,HX+3.6,HY+3.2,1.3,.6,'rgba(255,120,140,.22)',0)}
}
const BANGS={0:[[5.8,-1],[4,-4.2],[2.5,-2.4],[.5,-4.8],[-1.5,-2.8],[-3.4,-4.6],[-5.8,-1.6]],
 1:[[6.2,2],[4.8,-3.4],[2.2,-4.9],[0,-6.1],[-2.2,-4.9],[-4.8,-3.4],[-6.2,2]],
 2:[[6,0],[4.4,-3.6],[2,-2.5],[0,-4.3],[-2,-2.5],[-4.4,-3.6],[-6,0]],
 3:[[6.7,-2.6],[6.4,-9.5],[3.6,-6.8],[2.2,-12.6],[0,-7.8],[-2.6,-13],[-3.8,-7.2],[-6.4,-10.4],[-6.7,-2.6]],
 4:[[6,1.4],[4.2,.8],[2.2,-1.1],[0,-3],[-2.4,-4.1],[-5,-4.1],[-6.2,-1]],
 5:[[6.4,3.2],[5.2,-2.6],[3,-4.5],[1.2,-5.7],[-1.5,-4.5],[-4.5,-4.7],[-6.4,3.2]]};
function hairFront(c,L,f){
 if(!L.hc||L.hair<0)return;const s=L.hair,g=lg(c,HX-6,HY-10,HX+6,HY+2,[[0,lt(L.hc,.32)],[.5,L.hc],[1,dk(L.hc,.3)]]);
 P(c);c.moveTo(HX-7,HY+1);c.bezierCurveTo(HX-8.4,HY-12.6,HX+8.4,HY-12.6,HX+7,HY+1);(BANGS[s]||BANGS[0]).forEach(([dx,dy])=>c.lineTo(HX+dx,HY+dy));c.closePath();fl(c,g,.6);
 c.strokeStyle=rgba(lt(L.hc,.55),.45);c.lineWidth=.35;for(let i=-2;i<=2;i++){P(c);c.moveTo(HX+i*1.6,HY-9);c.quadraticCurveTo(HX+i*2.4,HY-5,HX+i*2.8,HY-2.5);c.stroke()}
 P(c);c.moveTo(HX-3.5,HY-8.6);c.quadraticCurveTo(HX,HY-10.2,HX+3.5,HY-8.6);c.lineWidth=.9;c.strokeStyle='rgba(255,255,255,.28)';c.stroke();
 if(s==1||s==5)[-1,1].forEach(d=>{P(c);c.moveTo(HX+d*6.6,HY-1);c.quadraticCurveTo(HX+d*8,HY+12,HX+d*7,HY+(s==5?24:18));c.lineTo(HX+d*4.6,HY+(s==5?18:13));c.quadraticCurveTo(HX+d*5.4,HY+6,HX+d*5.2,HY);c.closePath();fl(c,g,.5)});
}
function pumpkin(c,L){
 rr(c,47.9,22.5,4.2,8,2);fl(c,'#2a1a10',.5);
 [[-3.4,4.4],[3.4,4.4],[0,5.2]].forEach(([dx,rx])=>ell(c,HX+dx,HY,rx,7,lg(c,HX-8,HY-7,HX+8,HY+7,[[0,'#ffb04a'],[1,'#a8420a']]),.6));
 P(c);c.moveTo(HX-.4,HY-7);c.quadraticCurveTo(HX,HY-10,HX+2.4,HY-11);c.lineWidth=1.2;c.strokeStyle='#3a6a1a';c.stroke();
 c.save();c.fillStyle='#ffe46a';c.shadowColor='#ffb020';c.shadowBlur=5;[-1,1].forEach(d=>{P(c);c.moveTo(HX+d*2.6-1.6,HY);c.lineTo(HX+d*2.6,HY-2.4);c.lineTo(HX+d*2.6+1.6,HY);c.closePath();c.fill()});
 P(c);c.moveTo(HX-3.6,HY+2.6);c.lineTo(HX-2.2,HY+3.6);c.lineTo(HX-1,HY+2.6);c.lineTo(HX,HY+3.8);c.lineTo(HX+1,HY+2.6);c.lineTo(HX+2.2,HY+3.6);c.lineTo(HX+3.6,HY+2.6);c.quadraticCurveTo(HX,HY+7,HX-3.6,HY+2.6);c.fill();c.restore();
}
function headgear(c,L){
 const h=L.head,a2=L.armor2||'#e8c77a',fc=L.wc||'#ffffff',gold=lg(c,0,3,0,11,[[0,'#fff3b8'],[.5,'#e8c77a'],[1,'#8a6a2a']]);
 if(h=='crown'){P(c);c.moveTo(HX-5,HY-7.6);c.lineTo(HX-5.4,HY-12);c.lineTo(HX-3,HY-9.8);c.lineTo(HX-1.6,HY-14.4);c.lineTo(HX,HY-10.4);c.lineTo(HX+1.6,HY-14.4);c.lineTo(HX+3,HY-9.8);c.lineTo(HX+5.4,HY-12);c.lineTo(HX+5,HY-7.6);c.quadraticCurveTo(HX,HY-6.4,HX-5,HY-7.6);c.closePath();fl(c,gold,.5);c.save();c.shadowColor=RAR[Math.max(0,L.rar)].c;c.shadowBlur=4;ell(c,HX,HY-8.4,.9,.9,RAR[Math.max(0,L.rar)].c,0);c.restore()}
 else if(h=='circlet'){P(c);c.moveTo(HX-6.3,HY-3);c.quadraticCurveTo(HX,HY-5.6,HX+6.3,HY-3);c.lineWidth=.8;c.strokeStyle='#e8c77a';c.stroke();c.save();c.shadowColor=fc;c.shadowBlur=4;P(c);c.moveTo(HX,HY-6.6);c.lineTo(HX+1,HY-4.9);c.lineTo(HX,HY-3.2);c.lineTo(HX-1,HY-4.9);c.closePath();fl(c,fc,.3);c.restore()}
 else if(h=='helmet'){P(c);c.moveTo(HX-7.4,HY+2.4);c.bezierCurveTo(HX-8.6,HY-13.6,HX+8.6,HY-13.6,HX+7.4,HY+2.4);c.lineTo(HX+6,HY+1.4);c.lineTo(HX+5.8,HY-2.6);c.quadraticCurveTo(HX,HY-4.6,HX-5.8,HY-2.6);c.lineTo(HX-6,HY+1.4);c.closePath();fl(c,metal(c,HX-8,0,HX+8,0,a2),.6);
  P(c);c.moveTo(HX,HY-11);c.quadraticCurveTo(HX+9,HY-18,HX+15,HY-9);c.quadraticCurveTo(HX+9,HY-12,HX+1.5,HY-8);c.closePath();fl(c,lg(c,HX,HY-18,HX+15,HY-8,[[0,lt(fc,.2)],[1,dk(fc,.4)]]),.5)}
 else if(h=='hood'){P(c);c.moveTo(HX-11,31);c.bezierCurveTo(HX-12,HY-16,HX+12,HY-16,HX+11,31);c.lineTo(HX+6.4,27);c.bezierCurveTo(HX+8.4,HY-6,HX-8.4,HY-6,HX-6.4,27);c.closePath();fl(c,cloth(c,HX-11,HY-14,HX+11,31,L.armor),.6)}
 else if(h=='mask'){P(c);c.moveTo(HX-5.9,HY+2.2);c.quadraticCurveTo(HX,HY+3.4,HX+5.9,HY+2.2);c.lineTo(HX+5,HY+5.6);c.quadraticCurveTo(HX,HY+8.6,HX-5,HY+5.6);c.closePath();fl(c,cloth(c,0,HY+2,0,HY+8,dk(L.armor,.1)),.5)}
 else if(h=='halo'){c.save();P(c);c.ellipse(HX,HY-13.5,6.4,1.8,0,0,Math.PI*2);c.lineWidth=1.1;c.strokeStyle='#ffe9a0';c.shadowColor='#ffd35a';c.shadowBlur=8;c.stroke();c.restore()}
 else if(h=='horns'){[-1,1].forEach(d=>{P(c);c.moveTo(HX+d*3.6,HY-6.6);c.bezierCurveTo(HX+d*8.8,HY-11,HX+d*12.6,HY-15,HX+d*9.6,HY-22);c.bezierCurveTo(HX+d*9,HY-16,HX+d*6.4,HY-11.6,HX+d*2,HY-8.4);c.closePath();fl(c,lg(c,HX,HY-6,HX+d*10,HY-22,[[0,'#1a0812'],[1,lt(fc,.25)]]),.5)})}
 else if(h=='hat'){ell(c,HX,HY-5,11.5,2.6,cloth(c,0,HY-7,0,HY-2,L.armor),.6);P(c);c.moveTo(HX-5.4,HY-5.6);c.quadraticCurveTo(HX-3,HY-15,HX+8,HY-22);c.quadraticCurveTo(HX+3,HY-14,HX+5.6,HY-5.6);c.closePath();fl(c,cloth(c,HX-5,HY-22,HX+8,HY-5,L.armor),.6);P(c);c.moveTo(HX-5.2,HY-6.8);c.quadraticCurveTo(HX,HY-5.6,HX+5.2,HY-6.8);c.lineWidth=1.2;c.strokeStyle=a2;c.stroke()}
 else if(h=='flower'){const cx=HX+5.6,cy=HY-4.4;for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ell(c,cx+Math.cos(a)*1.3,cy+Math.sin(a)*1.3,1.2,1.2,'#ffb0d0',.3)}ell(c,cx,cy,.8,.8,'#ffe46a',0)}
 else if(h=='feather'){[[-2.4,-.45],[0,0],[2.4,.45]].forEach(([dx,r])=>{c.save();c.translate(HX+dx,HY-8);c.rotate(r);P(c);c.moveTo(0,0);c.quadraticCurveTo(-2.2,-5,0,-10);c.quadraticCurveTo(2.2,-5,0,0);fl(c,lg(c,0,0,0,-10,[[0,'#ff4a1a'],[1,'#ffe07a']]),.4);c.restore()})}
 else if(h=='santa'){P(c);c.moveTo(HX-7,HY-2);c.bezierCurveTo(HX-6,HY-13,HX+6,HY-15,HX+12,HY-6);c.lineTo(HX+7,HY-2);c.closePath();fl(c,lg(c,HX-7,HY-14,HX+12,HY-2,[[0,'#ff4a4a'],[1,'#7a0e10']]),.6);rr(c,HX-7.4,HY-4,14.8,2.8,1.4);fl(c,'#ffffff',.5);ell(c,HX+12.2,HY-6,1.8,1.8,'#ffffff',.5)}
 else if(h=='tricorn'){P(c);c.moveTo(HX-12,HY-4);c.quadraticCurveTo(HX,HY-13,HX+12,HY-4);c.quadraticCurveTo(HX,HY-7,HX-12,HY-4);c.closePath();fl(c,'#2a1a14',.6);P(c);c.moveTo(HX-6.4,HY-5.6);c.bezierCurveTo(HX-6,HY-14,HX+6,HY-14,HX+6.4,HY-5.6);c.closePath();fl(c,lg(c,0,HY-14,0,HY-5,[[0,'#4a3020'],[1,'#1a100a']]),.6);star4(c,HX,HY-9,1.6,'#e8c77a')}
 else if(h=='visor'){rr(c,HX-6.6,HY-1.2,13.2,3.2,1.6);c.save();c.fillStyle=lg(c,HX-6.6,0,HX+6.6,0,[[0,'#0a1a2a'],[.5,fc],[1,'#0a1a2a']]);c.shadowColor=fc;c.shadowBlur=7;c.fill();c.restore()}
 else if(h=='cap'){P(c);c.moveTo(HX-6.6,HY-2.4);c.bezierCurveTo(HX-6.4,HY-11.6,HX+6.4,HY-11.6,HX+6.6,HY-2.4);c.closePath();fl(c,cloth(c,0,HY-11,0,HY-2,L.armor),.5);ell(c,HX+3.2,HY-2.6,5,1.1,dk(L.armor,.4),.4)}
}

/* ---------- монстры ---------- */
function drawMon(c,M){LWK=.5;try{drawMon0(c,M)}finally{LWK=1}}
function drawMon0(c,M){
 const c1=dk(M.c1,M.pet?.04:.22),c2=dk(M.c2,M.pet?.1:.3),eye=M.pet?'#7ff6ff':'#ff5a2a';
 if(M.boss){P(c);c.rect(-20,-10,140,150);c.fillStyle=rg(c,50,70,5,70,[[0,'rgba(255,70,40,.35)'],[.6,'rgba(160,20,60,.12)'],[1,'rgba(0,0,0,0)']]);c.fill()}
 ell(c,50,124,30,6,'rgba(0,0,0,.4)',0);
 const eyes=(pts,r)=>{c.save();c.shadowColor=eye;c.shadowBlur=7;pts.forEach(([x,y])=>{ell(c,x,y,r,r*.8,eye,0)});c.restore();pts.forEach(([x,y])=>ell(c,x,y,r*.35,r*.5,'#1a0a0a',0))};
 if(M.type=='slime'){P(c);c.moveTo(16,120);c.bezierCurveTo(8,84,30,44,50,44);c.bezierCurveTo(70,44,92,84,84,120);c.quadraticCurveTo(50,126,16,120);c.closePath();fs(c,lg(c,20,44,80,124,[[0,lt(c1,.45)],[.5,c1],[1,dk(c2,.1)]]),2);
  ell(c,36,66,8,12,'rgba(255,255,255,.45)',0);eyes([[40,88],[61,88]],5.2);P(c);c.moveTo(43,102);c.quadraticCurveTo(50,108,57,102);c.lineWidth=2;c.strokeStyle='#1a0a0a';c.stroke()}
 else if(M.type=='wolf'){ell(c,50,100,27,17,lg(c,0,84,0,118,[[0,c1],[1,c2]]),1.8);[30,42,58,70].forEach(x=>{rr(c,x-4,104,8,18,3);fs(c,dk(c2,.1),1.4)});
  P(c);c.moveTo(74,92);c.quadraticCurveTo(96,80,92,60);c.quadraticCurveTo(86,80,72,86);c.closePath();fs(c,c1,1.6);
  [[-1,38],[1,62]].forEach(([d,x])=>{P(c);c.moveTo(x-d*6,52);c.lineTo(x+d*2,28);c.lineTo(x+d*8,50);c.closePath();fs(c,dk(c1,.15),1.6)});
  ell(c,50,62,21,19,lg(c,30,44,70,80,[[0,lt(c1,.25)],[1,dk(c1,.25)]]),1.8);ell(c,50,74,11,8,lt(c1,.55),1.4);ell(c,50,70,3.6,2.6,'#1a0a0a',0);
  eyes([[42,58],[58,58]],3.4);P(c);c.moveTo(44,79);c.lineTo(46,85);c.lineTo(48,79);c.moveTo(52,79);c.lineTo(54,85);c.lineTo(56,79);c.fillStyle='#fff';c.fill()}
 else if(M.type=='treant'){P(c);c.moveTo(30,122);c.lineTo(36,60);c.quadraticCurveTo(50,52,64,60);c.lineTo(70,122);c.closePath();fs(c,lg(c,30,0,70,0,[[0,'#3a2412'],[.5,'#6a4426'],[1,'#2a180a']]),1.8);
  [[38,50],[62,50],[50,40],[30,40],[70,40]].forEach(([x,y],i)=>ell(c,x,y,17-i,14,lg(c,0,y-14,0,y+14,[[0,lt(c1,.25)],[1,c2]]),1.6));
  P(c);c.moveTo(36,72);c.quadraticCurveTo(18,70,12,58);c.moveTo(64,72);c.quadraticCurveTo(82,70,88,58);c.lineWidth=5;c.strokeStyle='#4a2c14';c.stroke();
  eyes([[43,78],[57,78]],3.4);P(c);c.moveTo(42,92);c.quadraticCurveTo(50,98,58,92);c.lineWidth=2.4;c.strokeStyle='#120804';c.stroke()}
 else if(M.type=='golem'){const st=lg(c,20,30,80,120,[[0,'#9aa0b8'],[.6,'#5a6078'],[1,'#2a2e40']]);
  rr(c,34,92,12,30,3);fs(c,st,1.8);rr(c,54,92,12,30,3);fs(c,st,1.8);rr(c,26,52,48,46,8);fs(c,st,2);rr(c,12,56,16,40,6);fs(c,st,1.8);rr(c,72,56,16,40,6);fs(c,st,1.8);rr(c,36,22,28,28,6);fs(c,st,1.8);
  c.save();c.shadowColor=c1;c.shadowBlur=10;ell(c,50,74,7,7,c1,0);P(c);c.moveTo(34,62);c.lineTo(42,70);c.lineTo(38,82);c.moveTo(66,60);c.lineTo(58,72);c.lineTo(64,86);c.lineWidth=1.6;c.strokeStyle=c1;c.stroke();c.restore();eyes([[44,36],[56,36]],3)}
 else if(M.type=='skeleton'){const bone='#ece6d2';
  P(c);c.moveTo(42,88);c.lineTo(40,120);c.moveTo(58,88);c.lineTo(60,120);c.moveTo(38,62);c.lineTo(30,88);c.moveTo(62,62);c.lineTo(70,88);c.lineCap='round';c.lineWidth=5;c.strokeStyle=OUT;c.stroke();c.lineWidth=3.2;c.strokeStyle=bone;c.stroke();
  rr(c,38,58,24,32,6);fs(c,'#1a1424',1.6);for(let i=0;i<4;i++){P(c);c.moveTo(40,64+i*6);c.quadraticCurveTo(50,68+i*6,60,64+i*6);c.lineWidth=2.4;c.strokeStyle=bone;c.stroke()}
  ell(c,50,40,16,15,lg(c,0,25,0,55,[[0,'#ffffff'],[1,'#b8b0a0']]),1.8);rr(c,43,48,14,9,3);fs(c,'#d8d0c0',1.4);eyes([[44,40],[56,40]],3.6);
  c.save();c.translate(71,88);c.rotate(.35);rr(c,-2.2,-36,4.4,36,1.5);fs(c,'#a8b0c8',1.2);rr(c,-6,-2,12,3,1);fs(c,'#6a4a2a',1);c.restore()}
 else if(M.type=='wraith'){c.globalAlpha=.88;P(c);c.moveTo(50,14);c.bezierCurveTo(22,16,22,60,26,82);c.lineTo(20,120);c.lineTo(32,110);c.lineTo(40,122);c.lineTo(50,110);c.lineTo(60,122);c.lineTo(68,110);c.lineTo(80,120);c.lineTo(74,82);c.bezierCurveTo(78,60,78,16,50,14);c.closePath();fs(c,lg(c,0,14,0,122,[[0,lt(c2,.25)],[.6,c2],[1,rgba(c2,.2)]]),1.6);c.globalAlpha=1;
  ell(c,50,44,13,15,'#07040f',0);eyes([[45,44],[55,44]],3.2);P(c);c.moveTo(30,70);c.quadraticCurveTo(16,78,14,94);c.moveTo(70,70);c.quadraticCurveTo(84,78,86,94);c.lineWidth=5;c.strokeStyle=rgba(c1,.6);c.stroke()}
 else if(M.type=='serpent'){for(let i=3;i>=0;i--)ell(c,50+(i%2?10:-10),112-i*15,24-i*2,10,lg(c,0,100-i*15,0,122-i*15,[[0,lt(c1,.2)],[1,c2]]),1.8);
  P(c);c.moveTo(36,44);c.lineTo(22,30);c.lineTo(38,36);c.moveTo(64,44);c.lineTo(78,30);c.lineTo(62,36);fs(c,lt(c1,.3),1.4);ell(c,50,46,17,14,lg(c,0,32,0,60,[[0,lt(c1,.3)],[1,c2]]),1.8);ell(c,50,54,9,5,lt(c1,.5),1.2);eyes([[43,44],[57,44]],3.4)}
 else if(M.type=='dragon'){
  [-1,1].forEach(d=>{c.save();c.translate(50+d*14,62);c.scale(d,1);P(c);c.moveTo(0,0);c.lineTo(16,-34);c.lineTo(44,-40);c.lineTo(48,-8);c.quadraticCurveTo(40,-10,36,2);c.quadraticCurveTo(30,-6,24,8);c.quadraticCurveTo(14,0,6,12);c.closePath();fs(c,lg(c,0,-40,48,10,[[0,dk(c2,.3)],[1,c1]]),1.6);c.restore()});
  ell(c,50,92,24,26,lg(c,26,66,74,118,[[0,lt(c1,.2)],[.6,c1],[1,c2]]),2);ell(c,50,96,12,18,lt(c1,.55),1.2);rr(c,32,108,12,16,4);fs(c,c2,1.6);rr(c,56,108,12,16,4);fs(c,c2,1.6);
  P(c);c.moveTo(42,74);c.quadraticCurveTo(40,54,50,44);c.quadraticCurveTo(60,54,58,74);c.closePath();fs(c,c1,1.6);
  [[-1,40],[1,60]].forEach(([d,x])=>{P(c);c.moveTo(x,30);c.quadraticCurveTo(x+d*10,18,x+d*8,6);c.quadraticCurveTo(x+d*3,18,x-d*3,26);c.closePath();fs(c,'#e8e0d0',1.3)});
  ell(c,50,36,15,13,lg(c,0,22,0,50,[[0,lt(c1,.3)],[1,c2]]),1.8);ell(c,50,45,9,6,lt(c1,.45),1.3);eyes([[44,34],[56,34]],3.2)}
 if(M.boss){c.save();P(c);c.ellipse(50,124,32,7,0,0,Math.PI*2);c.lineWidth=1.2;c.strokeStyle='rgba(255,90,60,.8)';c.shadowColor='#ff4a2a';c.shadowBlur=10;c.stroke();c.restore()}
}

/* ---------- кэш спрайтов и портретов ---------- */
const cache=new Map();
function draw(c,L){if(L.kind=='mon')drawMon(c,L);else drawChar(c,L)}
function sprite(spec,px){
 px=px||(spec.big?180:130);const key=spec.key+'|'+px+'|'+(spec.skinKey||'');
 if(cache.has(key))return cache.get(key);
 const cv=document.createElement('canvas');cv.width=Math.round(px*DPR*1.15);cv.height=Math.round(px*1.3*DPR*1.15);
 const c=cv.getContext('2d');c.scale(cv.width/115,cv.height/149.5);c.translate(7.5,9.75);draw(c,spec.look);
 cache.set(key,cv);return cv;
}
function portrait(spec,w,h,mode){
 const key='p|'+spec.key+'|'+(spec.skinKey||'')+'|'+w+'|'+h+'|'+(mode||'')+(spec.fz?'|fz':'');
 if(cache.has(key))return cache.get(key);
 const cv=document.createElement('canvas');cv.width=w*DPR;cv.height=h*DPR;const c=cv.getContext('2d');c.scale(DPR,DPR);
 const F=spec.look.fac?FAC[spec.look.fac]:{c:'#f3cb6b',d:'#2a2f7a'};
 P(c);c.rect(0,0,w,h);c.fillStyle=lg(c,0,0,0,h,[[0,lt(F.d,.18)],[1,dk(F.d,.55)]]);c.fill();
 c.save();c.globalAlpha=.22;for(let i=0;i<10;i++){P(c);c.moveTo(w/2,h*.38);c.arc(w/2,h*.38,w*1.2,i*.63,i*.63+.22);c.closePath();c.fillStyle=F.c;c.fill()}c.restore();
 P(c);c.rect(0,0,w,h);c.fillStyle=rg(c,w/2,h*.4,2,w*.7,[[0,rgba(F.c,.45)],[1,rgba(F.c,0)]]);c.fill();
 if(spec.fz){/* 21★ — слияние: радужное сияние за героем */
  const cx=w/2,cy=h*(mode=='head'?.55:.42),R=Math.max(w,h)*.62,cols=['#ff6ad0','#7ad0ff','#ffe27a','#9affc8'];
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<16;i++){P(c);c.moveTo(cx,cy);c.arc(cx,cy,R*1.3,i*.3927,i*.3927+.2);c.closePath();c.fillStyle=rgba(cols[i%4],.22);c.fill()}
  P(c);c.rect(0,0,w,h);c.fillStyle=rg(c,cx,cy,2,R,[[0,'rgba(255,246,255,.85)'],[.28,'rgba(255,122,224,.5)'],[.55,'rgba(122,208,255,.22)'],[1,'rgba(0,0,0,0)']]);c.fill();
  const RR=rng(7);for(let i=0;i<14;i++)star4(c,RR()*w,RR()*h,1.5+RR()*3.5*(w/120),rgba(cols[i%4],.9));c.restore()}
 const mon=spec.look.kind=='mon',head=mode=='head',full=mode=='full',sc=mon?(head?h/60:full?h/132:h/104):head?h/31:full?h/132:h/62;
 c.save();c.translate(w/2-50*sc,mon?(head?-14*sc:h*.03):head?-3.5*sc:full?0:-.5*sc);c.scale(sc,sc);draw(c,spec.look);c.restore();
 const url=cv.toDataURL('image/png');cache.set(key,url);return url;
}

/* ---------- фоны ---------- */
const bgCache=new Map();
function bgStatic(w,h,th,mode){
 const key=th.n+'|'+mode+'|'+w+'|'+h;if(bgCache.has(key))return bgCache.get(key);
 const cv=document.createElement('canvas');cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);const c=cv.getContext('2d');c.scale(DPR,DPR);
 const s=th.sky,R=rng(hash(th.n)),hz=mode=='battle'?.47:.7;
 P(c);c.rect(0,0,w,h);c.fillStyle=lg(c,0,0,0,h,[[0,s[0]],[hz*.75,s[1]],[hz,s[2]],[hz+.02,lt(th.gr,.15)],[1,dk(th.gr,.45)]]);c.fill();
 for(let i=0;i<110;i++){const x=R()*w,y=R()*h*hz*.85,r=R()*1.3+.25;P(c);c.arc(x,y,r,0,Math.PI*2);c.fillStyle=`rgba(255,255,255,${.25+R()*.6})`;c.fill()}
 const mx=w*.78,my=h*.11,mr=w*.085;P(c);c.arc(mx,my,mr*3.4,0,Math.PI*2);c.fillStyle=rg(c,mx,my,mr*.6,mr*3.4,[[0,rgba(lt(s[2],.5),.45)],[1,rgba(s[2],0)]]);c.fill();
 ell(c,mx,my,mr,mr,rg(c,mx-mr*.3,my-mr*.3,mr*.1,mr,[[0,'#ffffff'],[1,lt(s[2],.45)]]),0);
 for(let L=0;L<2;L++){const base=h*hz-(L?0:h*.04),col=mix(s[1],th.gr,L?.75:.45);P(c);c.moveTo(0,base);let x=0;while(x<w){const nx=x+w*(.08+R()*.12);c.lineTo((x+nx)/2,base-h*(.04+R()*(L?.05:.09)));c.lineTo(nx,base-h*R()*.02);x=nx}c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fillStyle=col;c.fill()}
 for(let i=0;i<3;i++){const x=w*(.12+i*.34+R()*.08),y=h*hz*(.35+R()*.25),r=w*(.05+R()*.04),col=mix(s[0],s[1],.6);P(c);c.moveTo(x-r,y);c.quadraticCurveTo(x-r*.6,y+r*.5,x-r*.2,y+r*1.05);c.lineTo(x,y+r*1.45);c.lineTo(x+r*.28,y+r*.95);c.quadraticCurveTo(x+r*.7,y+r*.45,x+r,y);c.closePath();c.fillStyle=lg(c,0,y,0,y+r*1.45,[[0,dk(col,.15)],[1,rgba(dk(col,.35),.15)]]);c.fill();ell(c,x,y,r,r*.28,lt(col,.12),0);ell(c,x,y-r*.05,r*.78,r*.15,rgba(lt(s[2],.35),.4),0)}
 if(mode=='battle'){
  const cy=h*.6,rx=w*.47,ry=h*.17;c.save();c.strokeStyle=rgba('#f3cb6b',.16);c.lineWidth=1.4;
  [1,.72,.44].forEach(k=>{P(c);c.ellipse(w/2,cy,rx*k,ry*k,0,0,Math.PI*2);c.stroke()});
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;P(c);c.moveTo(w/2+Math.cos(a)*rx*.44,cy+Math.sin(a)*ry*.44);c.lineTo(w/2+Math.cos(a)*rx,cy+Math.sin(a)*ry);c.stroke()}
  P(c);c.ellipse(w/2,cy,rx,ry,0,0,Math.PI*2);c.fillStyle=rg(c,w/2,cy,4,rx,[[0,rgba(s[2],.18)],[1,rgba(s[2],0)]]);c.fill();c.restore();
 }else{
  for(let i=0;i<14;i++){const x=R()*w,y=h*(.78+R()*.2),r=w*(.12+R()*.16);ell(c,x,y,r,r*.32,`rgba(255,255,255,${.06+R()*.08})`,0)}
 }
 bgCache.set(key,cv);return cv;
}
function bg(c,w,h,th,mode,t){
 c.drawImage(bgStatic(w,h,th,mode),0,0,w,h);
 for(let i=0;i<26;i++){const sp=6+(i%4)*5,x=((i*97)%100)/100*w+Math.sin(t*.4+i)*14,y=(((i*53)%100)/100*h-t*sp)%h,yy=y<0?y+h:y,a=.18+.22*Math.sin(t*1.3+i);
  P(c);c.arc(x,yy,1+(i%3)*.7,0,Math.PI*2);c.fillStyle=i%3?rgba('#f3cb6b',Math.max(0,a)):rgba('#62f0d2',Math.max(0,a));c.fill()}
}
function island(c,x,y,w,t){
 const rx=w*.44,ry=w*.085;
 P(c);c.moveTo(x-rx,y);c.bezierCurveTo(x-rx*.8,y+ry*3,x-rx*.25,y+ry*5.5,x,y+ry*7);c.bezierCurveTo(x+rx*.25,y+ry*5.5,x+rx*.8,y+ry*3,x+rx,y);c.closePath();c.fillStyle=lg(c,0,y,0,y+ry*7,[[0,'#3a3050'],[1,'#120c22']]);c.fill();
 ell(c,x,y,rx,ry,lg(c,0,y-ry,0,y+ry,[[0,'#6a7aa8'],[1,'#2a2f55']]),0);
 c.save();P(c);c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.lineWidth=2;c.strokeStyle=rgba('#f3cb6b',.5+.2*Math.sin(t*2));c.shadowColor='#f3cb6b';c.shadowBlur=14;c.stroke();c.restore();
 P(c);c.ellipse(x,y,rx*.62,ry*.6,0,0,Math.PI*2);c.lineWidth=1;c.strokeStyle=rgba('#62f0d2',.35);c.stroke();
 for(let i=0;i<4;i++){const a=t*.5+i*1.6,px=x+Math.cos(a)*rx*1.15,py=y+ry*3+Math.sin(a*1.3)*ry;ell(c,px,py,w*.02,w*.014,'#2a2440',0)}
}
function rings(c,x,y,w,t){
 c.save();c.lineCap='round';
 for(let i=0;i<4;i++){const rx=w*(.42+i*.06),ry=rx*(.22+.1*Math.sin(t*.25+i*1.7)),rot=t*.12*(i%2?1:-1)+i*.8;
  c.save();c.translate(x,y);c.rotate(rot*.25);P(c);c.ellipse(0,0,rx,Math.abs(ry),0,0,Math.PI*2);
  c.lineWidth=w*.018;c.strokeStyle=lg(c,-rx,0,rx,0,[[0,'rgba(120,90,40,.25)'],[.5,'rgba(255,220,140,.75)'],[1,'rgba(120,90,40,.25)']]);c.stroke();
  c.lineWidth=w*.004;c.strokeStyle='rgba(255,240,200,.55)';c.stroke();
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2+t*.2;c.fillStyle='rgba(255,230,160,.6)';c.fillRect(Math.cos(a)*rx-1,Math.sin(a)*Math.abs(ry)-1,2,2)}
  c.restore()}
 c.restore();
}
function banner(key,th,spec,w,h,gray){
 const k='b|'+key+'|'+w+'|'+h+'|'+(gray?1:0);if(cache.has(k))return cache.get(k);
 const cv=document.createElement('canvas');cv.width=w*DPR;cv.height=h*DPR;const c=cv.getContext('2d');c.scale(DPR,DPR);
 c.drawImage(bgStatic(w,h*2.2,th,'battle'),0,-h*.55,w,h*2.2);
 if(spec){const sp=sprite(spec,spec.big?200:160),sz=h*.95,ww=sz*1.15,hh=sz*1.3*1.15;c.drawImage(sp,w*.74-ww/2,h*1.12-hh*.895,ww,hh)}
 P(c);c.rect(0,0,w,h);c.fillStyle=lg(c,0,0,w,0,[[0,'rgba(8,8,12,.92)'],[.45,'rgba(8,8,12,.55)'],[1,'rgba(8,8,12,0)']]);c.fill();
 if(gray){const d=c.getImageData(0,0,cv.width,cv.height),p=d.data;for(let i=0;i<p.length;i+=4){const v=(p[i]*.3+p[i+1]*.59+p[i+2]*.11)*.7;p[i]=p[i+1]=p[i+2]=v}c.putImageData(d,0,0)}
 const url=cv.toDataURL('image/jpeg',.86);cache.set(k,url);return url;
}
return {DPR,rgba,mix,lt,dk,hash,heroLook,mainLook,monLook,sprite,portrait,bg,island,rings,banner};
})();
