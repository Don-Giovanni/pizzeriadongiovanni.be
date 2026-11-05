const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.cwd()+'/menu/index.html');
const d=await p.evaluate(()=>{const out={langs:{}};for(const LL of ['fr','nl','de','it','en','es']){L=LL;
 out.langs[LL]={alg:ALG[LL],T:{title:t("algT"),intro:t("algIntro"),draft:t("algDraft"),v:t("algV"),dish:t("algDish"),none:t("algNone"),tr:t("algTr")},
 cats:MENU.map(c=>({id:c.id,name:c.t[LL],items:ITEMS.filter(x=>x.cat===c.id).map(x=>({n:nm(x),al:x.al,v:!!x.v}))})).filter(c=>c.items.length)}}
 out.supl={};for(const LL of ['fr','nl','de','it','en','es']){L=LL;out.supl[LL]=SUPL.map(s=>({n:supName(s),al:(typeof s.x==='string'&&I[s.x])?(I[s.x][3]||[]):[],v:(typeof s.x==='string'&&I[s.x])?!!I[s.x][4]:true,k:typeof s.x==='string'?s.x:null}))};out.supT={fr:'Suppléments',nl:'Supplementen',en:'Extras',it:'Supplementi',es:'Suplementos',de:'Extras'};out.sup=SUPL.length;out.items=ITEMS.length;out.draft=ALLERGEN_DRAFT;return out});
require('fs').writeFileSync('alg.json',JSON.stringify(d));console.log(d.items,d.sup,d.langs.fr.cats.map(c=>c.name+':'+c.items.length).join(' | '));
await b.close()})();
