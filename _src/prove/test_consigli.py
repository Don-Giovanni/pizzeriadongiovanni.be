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
    ok('da 3 piatti: bottiglia da 1,5 L e vino',any('1,5 L' in c for c in r['chips']) and any('Vin' in c for c in r['chips']) and not any('33 cl' in c for c in r['chips']),str(r['chips']))
    r=ev('del',9,5,0,0,0,0);ok('9 km, 5 piatti: risparmio 6,00 €','6,00' in r['gain'],r['gain'])
    r=ev('del',11,6,0,0,0,0);ok('11 km, 6 piatti: risparmio 7,00 €','7,00' in r['gain'],r['gain'])
    r=ev('del',5,2,4,0,0,0);ok('4 piatti con i pain pizza (2 pizze + 4 pain pizza): riquadro verde anche qui','livraison gratuite' in r['gain'])
    r=ev('del',5,5,0,0,0,0);ok('consegna già gratuita: niente riquadro verde, bevande + dessert',r['gain']=='' and len(r['props'])==2 and 'boisson' in r['props'][0] and 'dessert' in r['props'][1])
    r=ev('del',5,2,0,0,0,0);ok('fino a 2 piatti: lattina da 33 cl',any('33 cl' in c for c in r['chips']) and not any('1,5 L' in c for c in r['chips']),str(r['chips']))
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
    pg.locator('#panel [data-tp="btl"]').click();pg.locator('#panel [data-tp="btl"]').click();pg.locator('#panel [data-tpok]').first.click();pg.wait_for_timeout(200)
    ok('due tocchi sulla bottiglia + «Ajouter (2)»: 2 bottiglie da 6 € nel carrello',pg.evaluate("CART.filter(l=>byId[l.id].cat==='boissons'&&byId[l.id].p===6).reduce((a,l)=>a+l.q,0)")==2)
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
    # ---- 6 lingue
    n=pg.evaluate("Object.keys(TX).filter(k=>['tipFree','tipSave','tipBoi','tipNo','tipLast','tipDes'].every(x=>typeof TX[k][x]==='string'&&TX[k][x].length>3)&&TX[k].tipSave.includes('{0}')).length");ok('testi nuovi nelle 6 lingue',n==6,str(n))
    for lang,w in(('nl','Een drankje erbij?'),('en','A drink with that?'),('de','Ein Getränk dazu?'),('es','¿Una bebida para acompañar?'),('it','Qualcosa da bere?')):
        g=page(lang);r=g.evaluate("(a)=>{NOTIP=false;"+SET+"return mk(...a)}",['del',5,4,0,0,0,0]);ok(lang+': riquadro verde, risparmio e bevande tradotti',r['gain']!='' and '4' in r['gain'] and any(w in x for x in r['props']) and 'Il ne manque' not in r['gain'],r['gain']);g.context.close()
    ok('nessun errore JavaScript',not errs,str(errs))
    ok('nessuna richiesta esterna fatta dai consigli (tutto bloccato in prova)',not [u for u in ext if 'photon' in u or 'openrouteservice' in u or 'workers.dev' in u],str(ext[:3]))
    br.close()
finally: srv.terminate()
print('\nTOTALE: %d OK su %d'%(sum(R),len(R)));sys.exit(0 if all(R) else 1)
