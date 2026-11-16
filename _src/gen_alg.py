import json
d=json.load(open('alg.json'))
UI={'fr':{'tap':'touchez un plat pour voir ses allergènes','back':'← Menu','print':'Imprimer','sub':'Tableau des allergènes','upd':'Mise à jour','legend':'Légende','x':'● = contient'},
'nl':{'tap':'tik op een gerecht om de allergenen te zien','back':'← Menu','print':'Afdrukken','sub':'Allergenentabel','upd':'Bijgewerkt','legend':'Legende','x':'● = bevat'},
'en':{'tap':'tap a dish to see its allergens','back':'← Menu','print':'Print','sub':'Allergen chart','upd':'Updated','legend':'Key','x':'● = contains'},
'de':{'tap':'Gericht antippen, um die Allergene zu sehen','back':'← Menü','print':'Drucken','sub':'Allergentabelle','upd':'Aktualisiert','legend':'Legende','x':'● = enthält'},
'es':{'tap':'toca un plato para ver sus alérgenos','back':'← Menú','print':'Imprimir','sub':'Tabla de alérgenos','upd':'Actualizada','legend':'Leyenda','x':'● = contiene'},
'it':{'tap':'tocca un piatto per vedere i suoi allergeni','back':'← Menu','print':'Stampa','sub':'Tabella degli allergeni','upd':'Aggiornata','legend':'Legenda','x':'● = contiene'}}
data={'d':d,'ui':UI}
html='''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Allergènes · Pizzeria Don Giovanni, Thuin</title>
<meta name="description" content="Tableau des 14 allergènes de tous les plats de la Pizzeria Don Giovanni, Thuin.">
<link rel="canonical" href="https://pizzeriadongiovanni.be/allergenes.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pizzeria Don Giovanni">
<meta property="og:title" content="Allergènes · Pizzeria Don Giovanni, Thuin">
<meta property="og:description" content="Tableau des 14 allergènes de tous les plats de la Pizzeria Don Giovanni, Thuin.">
<meta property="og:url" content="https://pizzeriadongiovanni.be/allergenes.html">
<meta property="og:image" content="https://pizzeriadongiovanni.be/og-image.jpg">
<meta property="og:locale" content="fr_BE">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/png" href="icon-512.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="stylesheet" href="fonts/fonts.css">
<style>
:root{--bg:#ffffff;--fg:#17120f;--muted:#5f5650;--line:#ddd3c8;--red:#c8231c;--green:#1f8a4c;--zebra:#f7f2ec;--amber:#8a5a00;--amberbg:#fff4dc;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.4 Poppins,system-ui,-apple-system,"Segoe UI",sans-serif}
html,body{height:100%}
body{display:flex;flex-direction:column}
.wrap{flex:1;min-height:0;display:flex;flex-direction:column;width:100%;max-width:1000px;margin:0 auto;padding-block:10px 10px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.flag{display:grid;grid-template-columns:1fr 1fr 1fr;height:6px}.flag i:nth-child(1){background:var(--green)}.flag i:nth-child(2){background:#eee}.flag i:nth-child(3){background:var(--red)}
.top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.btns{display:flex;gap:6px;flex-wrap:wrap}
.b{font:600 13px Poppins,system-ui,sans-serif;border:1px solid var(--line);background:#fff;color:var(--fg);border-radius:999px;padding:7px 13px;cursor:pointer;text-decoration:none}
.b[aria-pressed="true"]{background:var(--fg);color:#fff;border-color:var(--fg)}
header{display:flex;gap:16px;align-items:center;margin:14px 0 10px;border-bottom:3px solid var(--red);padding-bottom:10px}
header img{width:76px;height:auto}
h1{margin:0;font-size:22px;line-height:1.15;text-wrap:balance}
header p{margin:2px 0 0;color:var(--muted);font-size:13px}
.draft{background:var(--amberbg);color:var(--amber);border-left:4px solid #e0a100;padding:8px 12px;border-radius:0 8px 8px 0;margin:10px 0;font-size:13px}
.legend{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:2px 14px;margin:8px 0 12px;padding:0;list-style:none;font-size:13px}
.intro{text-align:center}
.legend b{display:inline-block;min-width:20px;color:var(--red)}
.legend li{display:flex;align-items:center}.legend .ai{width:17px;height:17px;fill:var(--red);flex:none;margin-right:5px}
.fixed{flex:0 0 auto}
.tw{flex:1;min-height:0;overflow:auto;border:1px solid var(--line);border-radius:10px;-webkit-overflow-scrolling:touch}
.tw .foot{padding:8px 10px;margin:0}
table{border-collapse:collapse;width:100%;font-size:12.5px;table-layout:fixed}
th,td{border-bottom:1px solid var(--line);padding:4px 5px;text-align:center}
th{background:var(--fg);color:#fff;font-weight:600;position:sticky;top:0}
th.n,td.n{text-align:left;width:50%}
th.n small{display:block;font-weight:400;font-size:10.5px;line-height:1.25;opacity:.9}
tr.cat td{background:#fde9e7;color:var(--red);font-weight:700;text-align:left;font-size:13px}
tbody tr:nth-child(even):not(.cat) td{background:var(--zebra)}
td.x{color:var(--red);font-weight:700}
.v{color:var(--amber);font-weight:700}
tbody tr[id]{cursor:pointer}
tbody tr.hl td{background:#ffe08a!important;font-weight:700}
th.hl{background:var(--red)!important}
.legend li.hl{background:#ffe08a;border-radius:5px;font-weight:700;padding:0 4px;margin:0 -4px}
tbody tr td,th,.legend li{transition:background-color .6s}
@media print{tbody tr.hl td,.legend li.hl{background:none!important;font-weight:inherit}}
.foot{margin-top:10px;color:var(--muted);font-size:12.5px}
@media (max-width:560px){table{font-size:11px}th,td{padding:4px 0}th:not(.n){font-size:10px;letter-spacing:-.3px}th.n,td.n{padding-left:5px}header{margin:8px 0 6px;padding-bottom:6px;gap:10px}header img{width:44px}h1{font-size:17px}header p{font-size:11px}.draft{font-size:12.5px;padding:5px 9px;margin:6px 0}.intro{font-size:12.5px}.legend{grid-template-columns:repeat(3,auto);justify-content:space-between;font-size:12.5px;gap:1px 10px;margin:6px 0 8px}.legend b{min-width:19px}.legend{gap:1px 6px}.legend .ai{width:15px;height:15px;margin-right:3px}.b{padding:5px 10px;font-size:12px}}
@media (max-width:380px){.legend{font-size:11.5px;gap:1px 4px}.legend b{min-width:17px}.legend .ai{width:14px;height:14px}}
@media (max-height:600px){.intro{display:none}header img{width:36px}header p{display:none}.draft{margin:4px 0}.legend{margin:2px 0 4px}}
@media (max-height:600px) and (min-width:561px){.legend{grid-template-columns:repeat(5,1fr);font-size:11px}.draft{font-size:12px;padding:4px 9px}}
/* pagina che scorre normalmente (05.11): con le note lunghe la tabella fissa non aveva più spazio */
html,body{height:auto}body{display:block}.wrap{display:block}.tw{overflow:visible;flex:none}
.lgs{position:sticky;top:0;z-index:3;background:#fff;padding:6px 8px 4px;border-bottom:1px solid var(--line)}.lgs .legend{margin:0}.tw{border-radius:10px}th{top:var(--lh,0px)!important;z-index:2}
@media print{.lgs{position:static}th{top:0!important}html,body{height:auto}body{display:block}.wrap{display:block;height:auto}.tw{overflow:visible;flex:none}@page{size:A4;margin:9mm}.noprint{display:none!important}body{font-size:11px}.wrap{max-width:none;padding:0}table{font-size:9.5px;min-width:0}th,td{padding:2px 3px}.tw{overflow:visible;border:0}th{position:static}h1{font-size:17px}header img{width:52px}tr{break-inside:avoid}}
.sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}.dgc-f{font-size:11.5px;color:#b7ab98;margin:6px 0 0}.dgc-f a{color:inherit;text-decoration:underline}@media print{.dgc-f{display:none!important}}</style></head><body>
__SPRITE__
<div class="flag"><i></i><i></i><i></i></div>
<div class="wrap">
<div class="fixed"><div class="top noprint"><a class="b" id="back" href="index.html"></a><div class="btns" id="langs"></div><button class="b" id="pr" type="button" hidden></button></div>
<header><img src="logo-light.webp" onerror="this.onerror=null;this.src=this.src.replace(/\.webp$/,'.png')" alt="Pizzeria Don Giovanni"><div><h1 id="h1"></h1><p>Pizzeria Don Giovanni · Grand'Rue 1 · 6530 Thuin · Tél. 0455 11 16 77</p></div></header>
<div id="fx"></div></div>
<div class="tw" id="tw"></div>
<p id="dgc-f" class="dgc-f"><a href="confidentialite.html">Confidentialité</a></p>
</div>
<script>
const DATA=__DATA__,UPD="__UPD__";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let L="fr";try{const s=localStorage.getItem("dg_lang");if(DATA.d.langs[s])L=s;else{const n=(navigator.language||"fr").slice(0,2);if(DATA.d.langs[n])L=n}}catch(e){}
function row(x,id){return `<tr${id?` id="r-${id}" tabindex="0"`:""}><td class="n">${esc(x.n)}${x.v?' <span class="v">*</span>':''}</td>${[...Array(14)].map((_,i)=>x.al.includes(i+1)?'<td class="x">●</td>':'<td></td>').join("")}</tr>`}
function draw(){const g=DATA.d.langs[L],u=DATA.ui[L];document.documentElement.lang=L;
 document.getElementById("h1").textContent=u.sub;document.getElementById("back").textContent=u.back;
 const pr=document.getElementById("pr");pr.textContent=u.print;
 document.getElementById("langs").innerHTML=["fr","nl","de","it","en","es"].map(l=>`<button class="b" type="button" data-l="${l}" aria-pressed="${l===L}">${l.toUpperCase()}</button>`).join("");
 const head=`<tr><th class="n" scope="col">${esc(g.T.dish)}<small class="tap noprint">${esc(u.tap)}</small></th>${[...Array(14)].map((_,i)=>`<th scope="col" title="${esc(g.alg[i])}">${i+1}</th>`).join("")}</tr>`;
 let body=g.cats.map(c=>`<tr class="cat"><td colspan="15">${esc(c.name)}</td></tr>`+c.items.map((x,i)=>row(x,x.id||c.id+"-"+i)).join("")).join("");
 body+=`<tr class="cat"><td colspan="15">${esc(DATA.d.supT[L])}</td></tr>`+DATA.d.supl[L].map((x,i)=>row(x,"sup-"+i)).join("");
 document.getElementById("fx").innerHTML=`${DATA.d.draft?`<p class="draft">${esc(g.T.draft)}</p>`:""}
 <p class="intro" style="margin:6px 0 0">${esc(g.T.intro)}</p>
 <p class="intro" style="margin:4px 0 0;font-size:12px">${esc(g.T.tr)}</p>
 <p class="intro" style="margin:4px 0 0;font-size:12px">${esc(g.T.resp).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")}</p>`;
 document.getElementById("tw").innerHTML=`<div class="lgs"><ol class="legend">${g.alg.map((a,i)=>`<li><b>${i+1}</b><svg class="ai" aria-hidden="true" focusable="false"><use href="#ai${i+1}"/></svg>${esc(a)}</li>`).join("")}</ol></div><table><caption class="sr">${esc(g.T.title)}</caption><thead>${head}</thead><tbody>${body}</tbody></table>
 <p class="foot">${esc(u.x)} · <span class="v">*</span> ${esc(g.T.v.replace(/^\\*\\s*/,""))}<br>${esc(u.upd)} : ${UPD}</p>`;}
document.addEventListener("click",e=>{const l=e.target.closest("[data-l]");if(l){L=l.dataset.l;try{localStorage.setItem("dg_lang",L)}catch(_){ }draw()}});
try{if(window.self===window.top){const pr=document.getElementById("pr");pr.hidden=false;pr.onclick=()=>window.print()}}catch(e){}
/* piatto scelto nel menu (allergenes.html#pizzas-3): riga al centro, riga e allergeni evidenziati per 10 secondi */
let HL=(location.hash||"").slice(1),HLT=0;
function hl(scroll){document.querySelectorAll(".hl").forEach(e=>e.classList.remove("hl"));if(!HL)return;
 const r=document.getElementById("r-"+HL);if(!r){HL="";return}
 r.classList.add("hl");const ths=document.querySelectorAll("thead th"),lis=document.querySelectorAll(".legend li");
 [...r.children].forEach((td,i)=>{if(i&&td.classList.contains("x")){if(ths[i])ths[i].classList.add("hl");if(lis[i-1])lis[i-1].classList.add("hl")}});
 if(scroll)r.scrollIntoView({block:"center"});
 if(!HLT)HLT=setTimeout(()=>{HLT=0;HL="";hl()},10000)}
/* tocco su un piatto della tabella (16.11.2026): si accende come quando si arriva dal menu; secondo tocco = si spegne */
function pick(r){const id=r.id.slice(2);clearTimeout(HLT);HLT=0;HL=HL===id?"":id;hl()}
document.addEventListener("click",e=>{const r=e.target.closest("tbody tr[id]");if(r)pick(r)});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("tbody tr[id]")){e.preventDefault();pick(e.target)}});
const draw0=draw;draw=function(){draw0();hl()};
draw();
function lh(){const e=document.querySelector(".lgs");if(e)document.documentElement.style.setProperty("--lh",e.offsetHeight+"px")}lh();addEventListener("resize",lh);document.addEventListener("click",()=>setTimeout(lh,50));
if(HL)setTimeout(()=>hl(1),80);
</script></body></html>'''
import datetime,zoneinfo
upd=datetime.datetime.now(zoneinfo.ZoneInfo("Europe/Brussels")).strftime("%d/%m/%Y")
import os
html=html.replace('__SPRITE__',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'alg_icons','sprite.html')).read())
html=html.replace('__DATA__',json.dumps(data,ensure_ascii=False)).replace('__UPD__',upd)
open('menu/allergenes.html','w').write(html);print(len(html))
