# test_consigli.py <cartella delle pagine, es. ../prova-sito/public/prova>  (15.11.2026)
# Pain pizza: ogni 2 = 1 piatto in tutte le fasce (minimi, prezzo, gratuità, regola dei 35 €).
# Consigli del carrello: proposte a tutti (à emporter e livraison), al massimo due insieme, mai i pain pizza, «Non merci», riga nel riepilogo.
# Nessuna richiesta esterna: tutto bloccato. Nessun dato vero.
import subprocess,sys,time
from playwright.sync_api import sync_playwright
D=sys.argv[1];PORT=8793
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=D,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R=[]
def ok(n,c,d=''): R.append(bool(c));print('OK  ' if c else 'ERR ',n,d)
SET="""const pz=ITEMS.find(x=>x.pizza),pp=ITEMS.find(x=>/^Pain pizza/i.test(String(x.n))),ti=ITEMS.find(x=>/^Tiramis/i.test(String(x.n))),vin=ITEMS.find(x=>/^Vin/i.test(String(x.n))),can=ITEMS.filter(x=>/^Coca/i.test(String(x.n))).sort((a,b)=>a.p-b.p)[0];
const mk=(mode,km,np,npp,nti,nvin,ncan)=>{MODE=mode;ADR=mode==="del"?"Rue des Exemples 12, 9999 Villefictive":"";ADRCP="";KM=km?String(km):"";CART=[];if(np)CART.push({id:pz.id,q:np,s:[]});if(npp)CART.push({id:pp.id,q:npp,s:[]});if(nti)CART.push({id:ti.id,q:nti,s:[]});if(nvin)CART.push({id:vin.id,q:nvin,s:[]});if(ncan)CART.push({id:can.id,q:ncan,s:[]});
 const T=totals(),d=document.createElement("div");d.innerHTML=sumH(T);const q=s=>[...d.querySelectorAll(s)];
 return {st:T.st,npz:T.npz,fee:T.fee,ok:T.ok,food:T.sub+T.sup,gain:q(".gain").map(e=>e.textContent)[0]||"",props:q(".prop .pt").map(e=>e.textContent.replace(/\\u00a0/g," ")),chips:q(".prop .tchip,.tip .tchip").map(e=>e.textContent),tip:q(".tip").map(e=>e.textContent.replace(/\\u00a0/g," "))[0]||"",no:q("[data-tpno]").length,msg:q(".msg").length,all:d.textContent}};"""
try:
  with sync_playwright() as p:
    br=p.chromium.launch();ext=[]
    def page(lang):
        c=br.new_context(viewport={'width':390,'height':844})
        def route(r):
            if '127.0.0.1' in r.request.url: return r.continue_()
            ext.append(r.request.url);return r.abort()
        c.route('**/*',route);c.add_init_script("try{localStorage.setItem('dg_lang','%s')}catch(e){}"%lang)
        pg=c.new_page();pg.goto('http://127.0.0.1:%d/menu.html'%PORT);pg.wait_for_timeout(600);return pg
    pg=page('fr');errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    ev=lambda *a:pg.evaluate("(a)=>{NOTIP=false;TIPSEL={};"+SET+"return mk(...a)}",list(a))
    # ---- regola dei pain pizza
    r=ev('del',5,1,2,0,0,0);ok('5 km, 1 pizza + 2 pain pizza = 2 piatti: consegna a 5 €',r['st']=='ok' and r['npz']==2 and r['fee']==5,str(r['fee']))
    r=ev('del',5,1,1,0,0,0);ok('5 km, 1 pizza + 1 pain pizza = 1 piatto (1 solo non conta): niente consegna sotto 35 €',r['st']=='no' and r['npz']==1)
    r=ev('del',5,1,3,0,0,0);ok('5 km, 1 pizza + 3 pain pizza = 2 piatti (3 = 1)',r['st']=='ok' and r['npz']==2)
    r=ev('del',5,0,4,0,0,0);ok('5 km, solo 4 pain pizza = 2 piatti: consegna a 5 €',r['st']=='ok' and r['npz']==2 and r['fee']==5)
    r=ev('del',5,0,10,0,0,0);ok('5 km, solo 10 pain pizza = 5 piatti: consegna gratuita',r['st']=='ok' and r['npz']==5 and r['fee']==0)
    r=ev('del',5,3,2,0,0,0);ok('5 km, 3 pizze + 2 pain pizza = 4 piatti: 4 € invece di 5',r['fee']==4 and r['npz']==4)
    r=ev('del',5,0,2,0,0,0);ok('5 km, solo 2 pain pizza (14 €) = 1 piatto sotto 35 €: niente consegna, consiglio «Plus que 21,00 €»',r['st']=='no' and r['npz']==1 and '21,00' in r['tip'],r['tip'])
    r=ev('del',5,0,2,1,1,0);ok('5 km, 2 pain pizza + vino + tiramisù = 37 €: passa con la regola dei 35 € (prezzo come 2 piatti)',r['st']=='ok' and r['npz']==1 and r['food']==37 and r['fee']==5,str(r['food']))
    r=ev('del',9,0,2,1,1,0);ok('9 km: la regola dei 35 € non vale, 2 pain pizza = 1 piatto non basta',r['st']=='no')
    r=ev('del',9,0,6,0,0,0);ok('9 km, solo 6 pain pizza = 3 piatti: consegna a 7 €',r['st']=='ok' and r['fee']==7)
    r=ev('del',11,5,4,0,0,0);ok('11 km, 5 pizze + 4 pain pizza = 7 piatti: gratuita',r['st']=='ok' and r['fee']==0 and r['npz']==7)
    r=ev('del',5,2,0,5,0,0);ok('il tiramisù non conta mai: 2 pizze + 5 tiramisù = 2 piatti',r['npz']==2)
    # ---- consigli
    r=ev('del',5,4,0,0,0,0);ok('manca 1 piatto alla gratuità: riquadro verde con il risparmio vero (4,00 €) + bevande, 2 proposte',"Il ne manque qu'une pizza pour la livraison gratuite" in r['gain'] and '4,00' in r['gain'] and r['props']==['🥤 Une boisson avec ça ?'] and r['no']==1,r['gain']+str(r['props']))
    ok('da 3 piatti: bottiglie da 1,5 L e vino',sum('1,5 L' in c for c in r['chips'])==3 and any('Vin' in c for c in r['chips']) and not any('33 cl' in c for c in r['chips']),str(r['chips']))
    r=ev('del',9,5,0,0,0,0);ok('9 km, 5 piatti: risparmio 6,00 €','6,00' in r['gain'],r['gain'])
    r=ev('del',11,6,0,0,0,0);ok('11 km, 6 piatti: risparmio 7,00 €','7,00' in r['gain'],r['gain'])
    r=ev('del',5,2,4,0,0,0);ok('4 piatti con i pain pizza (2 pizze + 4 pain pizza): riquadro verde anche qui','livraison gratuite' in r['gain'])
    r=ev('del',5,5,0,0,0,0);ok('consegna già gratuita: niente riquadro verde, bevande + dessert',r['gain']=='' and len(r['props'])==2 and 'boisson' in r['props'][0] and 'dessert' in r['props'][1])
    r=ev('del',5,2,0,0,0,0);ok('fino a 2 piatti: tre lattine da 33 cl',sum('33 cl' in c for c in r['chips'])==3 and not any('1,5 L' in c for c in r['chips']),str(r['chips']))
    r=ev('del',5,3,0,0,0,1);ok('ha già una bevanda: solo i dessert',len(r['props'])==1 and 'dessert' in r['props'][0])
    r=ev('del',5,3,0,1,0,0);ok('ha già un dessert: solo le bevande',len(r['props'])==1 and 'boisson' in r['props'][0])
    r=ev('del',5,3,0,1,0,1);ok('ha bevanda e dessert: nessuna proposta, nessun «Non merci»',r['props']==[] and r['no']==0)
    r=ev('take',0,2,0,0,0,0);ok('à emporter: bevande + dessert anche qui',r['st']=='take' and len(r['props'])==2 and r['no']==1)
    r=ev('take',0,2,0,1,0,1);ok('à emporter con tutto: niente',r['props']==[])
    r=ev('del',0,3,0,0,0,0);ok('livraison senza indirizzo: resta il messaggio «scegli l\'indirizzo» e ci sono le proposte',r['msg']==1 and len(r['props'])==2)
    r=ev('del',0,1,0,0,0,0);ok('livraison senza indirizzo, 1 piatto: il messaggio del minimo resta',r['msg']==1)
    r=ev('del',9,2,0,0,0,0);ok('9 km, 2 piatti: «Encore 1 pizza(s) ou pâtes pour être livré» + una sola proposta (max 2 insieme)','Encore 1' in r['tip'] and len(r['props'])==1)
    r=ev('del',5,1,0,0,0,0);ok('1 piatto sotto 35 €: solo il consiglio dei 35 € con lattina, vino e dessert, niente altro','Plus que' in r['tip'] and r['props']==[] and any('33 cl' in c for c in r['chips']) and r['no']==0,r['tip'])
    r=ev('del',13,3,0,0,0,0);ok('12-15 km: proposte anche qui (aiutano ad arrivare a 230 €)',len(r['props'])==2)
    for a in (('del',5,4,2,0,0,0),('del',5,1,0,0,0,0),('take',0,2,0,0,0,0),('del',9,2,0,0,0,0),('del',5,0,2,0,0,0)):
        r=ev(*a)
        if 'pain' in (r['gain']+' '.join(r['props'])+' '.join(r['chips'])+r['tip']).lower() or 'Pain pizza' in ' '.join(r['chips']): ok('mai i pain pizza nei consigli',False,str(a));break
    else: ok('mai i pain pizza nei consigli (5 casi)',True)
    # ---- «Non merci», aggiunta dai consigli, riepilogo: nel carrello vero
    pg.evaluate("()=>{"+SET+"mk('take',0,3,0,0,0,0);save();bar();NOTIP=false;TIPSEL={};cart()}");pg.wait_for_timeout(200)
    ok('tre bottiglie divise nelle proposte: Coca-Cola, Fanta, Ice Tea da 1,5 L + vino',[x.strip() for x in pg.locator('#panel .prop').first.locator('.tchip').all_inner_texts()]==['+ Coca-Cola 1,5 L · 6,00 €','+ Fanta 1,5 L · 6,00 €','+ Ice Tea 1,5 L · 6,00 €','+ Vin rouge / rosé · 16,00 €'],str(pg.locator('#panel .prop').first.locator('.tchip').all_inner_texts()))
    ok('nessun secondo pulsante «Ajouter (n)»',pg.locator('#panel [data-tpok]').count()==0)
    pg.locator('#panel [data-tp="btlF"]').click();pg.wait_for_timeout(250)
    ok('UN tocco sulla Fanta da 1,5 L: 1 bottiglia di Fanta subito nel carrello',pg.evaluate("JSON.stringify(CART.filter(l=>byId[l.id].cat==='boissons').map(l=>[byId[l.id].n,byId[l.id].p,l.q]))")=='[["Fanta",6,1]]')
    ok('«Ajouté ✓ Fanta» appare',(not pg.locator('#toast').is_hidden()) and 'Ajouté' in pg.locator('#toast').inner_text() and 'Fanta' in pg.locator('#toast').inner_text())
    ok('riga del carrello con la misura: «Fanta (bouteille 1,5 L)»','Fanta (bouteille 1,5 L)' in pg.locator('#panel').inner_text())
    ok('la barra in basso conta anche la bottiglia',pg.evaluate("document.getElementById('barN').textContent")=='4')
    ok('dopo l\'aggiunta resta solo il dessert',pg.locator('#panel .prop').count()==1 and 'dessert' in pg.locator('#panel .prop .pt').inner_text())
    ls0=pg.evaluate("JSON.stringify([Object.keys(localStorage).sort(),Object.keys(sessionStorage).sort()])")
    pg.locator('#panel [data-tpno]').click();pg.wait_for_timeout(200)
    ok('«Non merci»: le proposte spariscono',pg.locator('#panel .prop').count()==0 and pg.locator('#panel [data-tpno]').count()==0)
    ok('«Non merci» non scrive niente nel telefono (stesse chiavi di prima)',pg.evaluate("JSON.stringify([Object.keys(localStorage).sort(),Object.keys(sessionStorage).sort()])")==ls0,ls0)
    pg.evaluate("()=>{"+SET+"mk('del',5,4,0,0,0,0);cart()}");pg.wait_for_timeout(200)
    ok('dopo «Non merci» il riquadro verde della gratuità resta (è un\'informazione sul prezzo), le altre proposte no',pg.locator('#panel .gain').count()==1 and pg.locator('#panel .prop').count()==0)
    def recap(js):
        pg.evaluate("()=>{"+SET+js+";ACK=true;cart();ready()}");pg.wait_for_timeout(200);return pg.locator('#mbox .rlast').count()
    ok('riepilogo dopo «Non merci»: nessuna riga in più',recap("mk('take',0,2,0,0,0,0)")==0)
    ok('riepilogo senza bevande né dessert (e senza «Non merci»): riga «Une boisson ou un dessert ?»',recap("NOTIP=false;mk('take',0,2,0,0,0,0)")==1 and 'Une boisson ou un dessert' in pg.locator('#mbox .rlast').inner_text().replace(' ',' '))
    pg.locator('#mback').click();pg.wait_for_timeout(200)
    ok('«Ajouter» nel riepilogo: torna al carrello con le proposte',pg.evaluate("document.getElementById('modal').hidden&&!document.getElementById('sheet').hidden") and pg.locator('#panel .prop').count()==2)
    ok('riepilogo con una bevanda già presa: nessuna riga',recap("NOTIP=false;mk('take',0,2,0,0,0,1)")==0)
    ok('riepilogo con un dessert già preso: nessuna riga',recap("NOTIP=false;mk('take',0,2,0,1,0,0)")==0)
    # ---- bevande divise nel menu (15.11.2026)
    pg.evaluate("document.getElementById('modal').hidden=true;document.getElementById('sheet').hidden=true;CART=[];save();draw()")
    m=pg.evaluate("[...document.querySelectorAll('#boissons li')].map(e=>e.classList.contains('grp')?'# '+e.textContent:e.querySelector('.nm').textContent+' | '+(e.querySelector('.ing')||{textContent:''}).textContent+' | '+e.querySelector('.pr').textContent.replace(/\u00a0/g,' '))")
    ok('menu Boissons: Eau, poi Soft 33 cl, Soft 1,5 L, Bières et vin',m==['Eau | 50 cl | 2,50 €','# Soft 33 cl','Coca-Cola | canette 33 cl | 2,50 €','Fanta | canette 33 cl | 2,50 €','Ice Tea | canette 33 cl | 2,50 €','# Soft 1,5 L','Coca-Cola | bouteille 1,5 L | 6,00 €','Fanta | bouteille 1,5 L | 6,00 €','Ice Tea | bouteille 1,5 L | 6,00 €','# Bières et vin','Jupiler | canette 33 cl | 2,50 €','Résilience | bouteille 33 cl | 5,00 €','Vin rouge / rosé | bouteille 75 cl | 16,00 €'],str(m))
    ok('numeri interni invariati per le bevande di prima (carrelli salvati)',pg.evaluate("JSON.stringify(['boissons-0','boissons-1','boissons-2','boissons-3','boissons-4','boissons-5'].map(i=>byId[i].n+' '+byId[i].p))")=='["Coca-Cola 2.5","Coca-Cola 6","Eau 2.5","Jupiler 2.5","Résilience 5","Vin rouge / rosé 16"]')
    ok('75 articoli, id tutti diversi',pg.evaluate("ITEMS.length===75&&new Set(ITEMS.map(x=>x.id)).size===75"))
    pg.locator('#boissons li.it:has-text("Ice Tea") button.add').last.click();pg.wait_for_timeout(200)
    ok('«+» sull\'Ice Tea da 1,5 L nel menu: nel carrello «Ice Tea (bouteille 1,5 L)» a 6 €',pg.evaluate("CART.length===1&&lnm(CART[0])==='Ice Tea (bouteille 1,5 L)'&&byId[CART[0].id].p===6"))
    pg.evaluate("document.querySelectorAll('.modal').forEach(e=>e.hidden=true)")
    for lang,can,btl in(('it','lattina 33 cl','bottiglia 1,5 L'),('nl','blikje 33 cl','fles 1,5 L'),('de','Dose 33 cl','Flasche 1,5 L'),('es','lata 33 cl','botella 1,5 L'),('en','can 33 cl','bottle 1.5 L')):
        g=page(lang);tx=g.evaluate("[...document.querySelectorAll('#boissons li.it .ing')].map(e=>e.textContent)");gr=g.evaluate("[...document.querySelectorAll('#boissons li.grp')].length")
        ok(lang+': 3 «'+can+'» + Jupiler, 3 «'+btl+'», 3 titoli di gruppo',tx.count(can)==4 and tx.count(btl)==3 and gr==3,str(tx));g.context.close()
    a=pg.evaluate("[...document.querySelectorAll('#boissons a.alg')].map(e=>e.getAttribute('href'))")
    gc=br.new_context(locale='fr-BE');gc.add_init_script("try{localStorage.setItem('dg_lang','fr')}catch(e){}");g=gc.new_page();g.goto('http://127.0.0.1:%d/allergenes.html'%PORT);g.wait_for_timeout(500)
    rows=g.evaluate("(ids)=>ids.map(h=>{const r=document.getElementById('r-'+h.split('#')[1]);return r?r.querySelector('td.n').textContent.trim():null})",a)
    ok('link degli allergeni delle bevande: arrivano sulla riga giusta (Jupiler, Résilience, Vin)',len(rows)==3 and rows[0].startswith('Jupiler') and rows[1].startswith('Résilience') and rows[2].startswith('Vin'),str(rows))
    ok('pagina Allergènes: sei righe soft con la misura',sorted(x for x in g.evaluate("[...document.querySelectorAll('td.n')].map(e=>e.textContent.trim())") if x.split(' (')[0] in('Coca-Cola','Fanta','Ice Tea'))==['Coca-Cola (bouteille 1,5 L)','Coca-Cola (canette 33 cl)','Fanta (bouteille 1,5 L)','Fanta (canette 33 cl)','Ice Tea (bouteille 1,5 L)','Ice Tea (canette 33 cl)'])
    gc.close()
    # ---- 6 lingue
    n=pg.evaluate("Object.keys(TX).filter(k=>['tipFree','tipSave','tipBoi','tipNo','tipLast','tipDes','tipOk'].every(x=>typeof TX[k][x]==='string'&&TX[k][x].length>3)&&TX[k].tipSave.includes('{0}')).length");ok('testi nuovi nelle 6 lingue',n==6,str(n))
    for lang,w in(('nl','Een drankje erbij?'),('en','A drink with that?'),('de','Ein Getränk dazu?'),('es','¿Una bebida para acompañar?'),('it','Qualcosa da bere?')):
        g=page(lang);r=g.evaluate("(a)=>{NOTIP=false;"+SET+"return mk(...a)}",['del',5,4,0,0,0,0]);ok(lang+': riquadro verde, risparmio e bevande tradotti',r['gain']!='' and '4' in r['gain'] and any(w in x for x in r['props']) and 'Il ne manque' not in r['gain'],r['gain']);g.context.close()
    ok('nessun errore JavaScript',not errs,str(errs))
    ok('nessuna richiesta esterna fatta dai consigli (tutto bloccato in prova)',not [u for u in ext if 'photon' in u or 'openrouteservice' in u or 'workers.dev' in u],str(ext[:3]))
    br.close()
finally: srv.terminate()
print('\nTOTALE: %d OK su %d'%(sum(R),len(R)));sys.exit(0 if all(R) else 1)
