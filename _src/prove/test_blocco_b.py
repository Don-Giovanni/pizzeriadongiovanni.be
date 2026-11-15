# test_blocco_b.py <cartella delle pagine, es. ../prova-sito/public/prova>  (blocco B degli audit del 15.11.2026)
# 83 controlli con Photon e openrouteservice finti: indirizzo fuori zona (6 lingue), «Thuin» per il CAP 6530, etichette degli allergeni,
# focus dentro le finestre, titoli della home, didascalia e scope delle tabelle, <main>, link Confidentialité e twitter:card scritti nell'HTML.
import subprocess,sys,time,json
from playwright.sync_api import sync_playwright
D=sys.argv[1];PORT=8791
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=D,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R=[]
def ok(n,c,d=''): R.append(bool(c));print('OK  ' if c else 'ERR ',n,d)
def feat(street,num,pc,city,district,lon,lat):
    return {"type":"Feature","geometry":{"type":"Point","coordinates":[lon,lat]},"properties":{"countrycode":"BE","street":street,"housenumber":num,"postcode":pc,"city":city,"district":district,"type":"house"}}
# indirizzi inventati (mai dati veri)
PH={'maladrie':[feat("Rue des Exemples","12","6530","Thuin","La Maladrie",4.2950,50.3360)],
    'fosteau':[feat("Rue des Exemples","3","6530","Thuin","Leers-et-Fosteau",4.2448,50.3042)],
    'gozee':[feat("Rue des Exemples","5","6534","Thuin","Gozée",4.3516,50.3332)],
    'lointain':[feat("Rue Lointaine","1","6000","Charleroi","Charleroi",4.49,50.47)],
    'bordure':[feat("Rue des Exemples","7","7130","Binche","Binche",4.1652,50.4107)],
    'rien':[]}
try:
  with sync_playwright() as p:
    br=p.chromium.launch()
    def ctx(lang,vp=(390,844)):
        c=br.new_context(viewport={'width':vp[0],'height':vp[1]})
        def route(r):
            u=r.request.url
            if '127.0.0.1' in u: return r.continue_()
            if 'photon.komoot.io' in u:
                q=u.lower()
                for k,v in PH.items():
                    if k in q: return r.fulfill(status=200,content_type='application/json',body=json.dumps({"features":v}))
                return r.fulfill(status=200,content_type='application/json',body='{"features":[]}')
            if 'openrouteservice' in u:
                return r.fulfill(status=200,content_type='application/json',body=json.dumps({"features":[{"properties":{"summary":{"distance":2100,"duration":300}}}]}))
            return r.abort()
        c.route('**/*',route)
        c.add_init_script("try{localStorage.setItem('dg_lang','%s');localStorage.setItem('dg_stats',JSON.stringify({v:0,t:Date.now()}))}catch(e){}"%lang)
        return c
    # ---------- menu: indirizzi
    for lang,far in(('fr','Adresse hors de notre zone de livraison'),('it','Indirizzo fuori dalla nostra zona di consegna'),('de','Adresse außerhalb unseres Liefergebiets'),('es','Dirección fuera de nuestra zona de reparto'),('nl','Adres buiten onze leveringszone'),('en','Address outside our delivery area')):
        c=ctx(lang);pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/menu.html'%PORT);pg.wait_for_timeout(700)
        pg.evaluate("document.querySelectorAll('.cwarn').forEach(e=>e.remove())")
        pg.locator('button.add').first.click();pg.wait_for_timeout(200)
        pg.evaluate("document.querySelectorAll('.modal').forEach(e=>e.hidden=true)")
        pg.locator('#openCart').click();pg.wait_for_timeout(300)
        # modalità consegna
        if pg.locator('#adr').count()==0:
            pg.evaluate("()=>{const b=[...document.querySelectorAll('#panel button')].find(x=>x.dataset.mode==='del'||/del/.test(x.dataset.m||''));if(b)b.click()}");pg.wait_for_timeout(200)
        if pg.locator('#adr').count()==0:
            pg.evaluate("localStorage.setItem('dg_mode','del')");pg.reload();pg.wait_for_timeout(700);pg.evaluate("document.querySelectorAll('.cwarn').forEach(e=>e.remove());document.querySelectorAll('.modal').forEach(e=>e.hidden=true)");pg.locator('#openCart').click();pg.wait_for_timeout(300)
        def typ(q):
            pg.fill('#adr','');pg.locator('#adr').type(q);pg.wait_for_timeout(2600);return pg.locator('#sug').inner_text()
        t=typ('rue lointain')
        ok(lang+': fuori zona → frase nuova',far in t and '0455 11 16 77' in t,repr(t[:90]))
        if lang=='fr':
            h=pg.locator('#sug').inner_html();ok('fr: numero in un pezzo solo (nowrap)','<span style="white-space:nowrap">0455 11 16 77</span>' in h)
            t=typ('rien du tout');ok('fr: niente trovato → «Adresse introuvable» come prima','Adresse introuvable' in t,repr(t[:60]))
            t=typ('rue des exemples maladrie');ok('fr: 6530 quartiere → Thuin','6530 Thuin' in t and 'Maladrie' not in t,repr(t))
            t=typ('rue des exemples fosteau');ok('fr: 6530 Leers-et-Fosteau resta','6530 Leers-et-Fosteau' in t,repr(t))
            t=typ('rue bordure');ok('fr: 11,7 km in linea d\'aria → ora si trova (limite 15 km)','7130 Binche' in t,repr(t))
            t=typ('rue des exemples gozee');ok('fr: 6534 Gozée invariato','6534 Gozée' in t,repr(t))
            pg.locator('#sug button').first.click();pg.wait_for_timeout(600)
            ok('fr: scelta indirizzo → km calcolati','2,1' in pg.locator('#kmbox').inner_text() or '2.1' in pg.locator('#kmbox').inner_text(),pg.locator('#kmbox').inner_text())
        ok(lang+': nessun errore JavaScript',not errs,str(errs[:2]));c.close()
    # ---------- menu: allergeni, bigOk, link privacy, focus
    c=ctx('fr',(1200,800));pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://127.0.0.1:%d/menu.html'%PORT);pg.wait_for_timeout(700)
    a=pg.eval_on_selector_all('a.alg','e=>e.map(x=>[x.getAttribute("aria-label"),x.textContent.trim()])')
    ok('menu: 68 link allergeni, tutti con i nomi',len(a)==68 and all((':' in l) or l.endswith('*') for l,_ in a),'%d · es. %r'%(len(a),a[0]))
    li=pg.locator('li.it',has_text='Pain pizza').first
    ok('menu: pain pizza = Gluten, Œufs, Lait',li.locator('a.alg').get_attribute('aria-label').replace(' ',' ')=='Allergènes : Gluten, Œufs, Lait',li.locator('a.alg').get_attribute('aria-label'))
    ok('menu: «bigOk» sparita',pg.evaluate("Object.values(TX).every(x=>!('bigOk' in x))"))
    ok('menu: adrFar in 6 lingue',pg.evaluate("Object.keys(TX).filter(k=>TX[k].adrFar).length")==6)
    ok('menu: link Confidentialité + Statistiques in fondo',pg.eval_on_selector('#dgc-f','e=>e.querySelector("a[href=\\"confidentialite.html\\"]")&&e.querySelector("button")?1:0')==1 and pg.locator('#dgc-f').count()==1)
    # 12-15 km di strada: 15 pizze o più = possibile dopo conferma al telefono (titolare, 15.11.2026)
    J="""(a)=>{const pz=ITEMS.find(x=>x.pizza),pa=ITEMS.find(x=>x.dish&&!x.pizza);MODE="del";ADR="Rue des Exemples 12, 9999 Villefictive";KM=String(a[0]);CART=[{id:pz.id,q:a[1],s:[]}].concat(a[2]?[{id:pa.id,q:a[2],s:[]}]:[]);const T=totals();const d=document.createElement("div");d.innerHTML=sumH(T);const dn=d.querySelector(".delno");return [T.st,T.ok,T.fee,T.msg===t("bigCall"),T.msg===t("bigOnly"),T.msg===t("outZone"),!!dn,T.msg,dn?dn.textContent:"",d.querySelectorAll(".msg").length]}"""
    r=pg.evaluate(J,[13,14,0]);ok('13 km, 14 pizze: riquadro rosso con la frase intera, niente «impossible», niente doppione sotto',r[0]=='no' and r[4] and r[6] and r[8]==r[7] and 'impossible' not in r[8] and r[9]==0 and '15 plats (pizzas ou pâtes) et de 230\u00a0€ de commande' in r[7].replace('230 €','230\u00a0€') and '0455\u00a011\u00a016\u00a077' in r[7],r[7])
    # servono ENTRAMBE: 15 piatti e 230 € (titolare, 15.11.2026). Quantità calcolate dai prezzi veri del menu.
    K="""(a)=>{const pz=ITEMS.find(x=>x.pizza),pa=ITEMS.find(x=>x.dish&&!x.pizza),ex=ITEMS.filter(x=>!x.dish).sort((x,y)=>y.p-x.p)[0];MODE="del";ADR="Rue des Exemples 12, 9999 Villefictive";KM="13";
      const mk=(np,npa,nex)=>{CART=[{id:pz.id,q:np,s:[]}].concat(npa?[{id:pa.id,q:npa,s:[]}]:[]).concat(nex?[{id:ex.id,q:nex,s:[]}]:[]);const T=totals();const d=document.createElement("div");d.innerHTML=sumH(T);return {st:T.st,npz:T.npz,food:T.sub+T.sup,red:!!d.querySelector(".delno"),fee:T.fee,ok:T.ok}};
      const nBig=Math.ceil(230/pz.p);return {p:pz.p,a:mk(15,0,0),b:mk(Math.max(15,nBig),0,0),c:mk(10,0,Math.ceil(230/ex.p)+1),d:mk(10,5,Math.ceil(230/ex.p)+1),e:mk(Math.max(15,nBig)-1,0,0),f:mk(10,4,Math.ceil(230/ex.p)+1)}}"""
    r=pg.evaluate(K,None)
    ok('15 pizze ma meno di 230 €: non basta (riquadro rosso)',r['a']['npz']==15 and r['a']['food']<230 and r['a']['st']=='no' and r['a']['red'],str(r['a']))
    ok('15 piatti o più e almeno 230 €: possibile dopo conferma, niente rosso, niente prezzo',r['b']['npz']>=15 and r['b']['food']>=230 and r['b']['st']=='call' and not r['b']['red'] and r['b']['fee']==0 and r['b']['ok'] is False,str(r['b']))
    ok('230 € ma solo 10 piatti: non basta',r['c']['npz']==10 and r['c']['food']>=230 and r['c']['st']=='no' and r['c']['red'],str(r['c']))
    ok('10 pizze + 5 paste = 15 piatti e 230 € con il resto: possibile dopo conferma',r['d']['npz']==15 and r['d']['food']>=230 and r['d']['st']=='call',str(r['d']))
    ok('10 pizze + 4 paste = 14 piatti e 230 €: non basta',r['f']['npz']==14 and r['f']['food']>=230 and r['f']['st']=='no',str(r['f']))
    pg.evaluate("KM='14.9'");
    r=pg.evaluate("""()=>{const pz=ITEMS.find(x=>x.pizza),pp=ITEMS.find(x=>/^Pain pizza/i.test(String(x.n))),ti=ITEMS.find(x=>/^Tiramis/i.test(String(x.n)));CART=[{id:pz.id,q:14,s:[]},{id:pp.id,q:20,s:[]},{id:ti.id,q:20,s:[]}];const T=totals();return [T.st,T.npz,pp.dish,ti.dish,T.sub+T.sup>=230]}""");ok('14 pizze + 20 pain pizza + 20 tiramisù (oltre 230 €): pain pizza e tiramisù non contano come piatti',r==['no',14,False,False,True],str(r))
    r=pg.evaluate(J,[15.1,20,0]);ok('15,1 km, 20 pizze: riquadro «Livraison impossible : hors zone.»',r[0]=='no' and r[5] and r[6] and r[8].replace('\u00a0',' ')=='Livraison impossible : hors zone.' and r[9]==1,r[8])
    r=pg.evaluate(J,[11.9,15,0]);ok('11,9 km, 15 pizze: consegna normale gratuita',r[0]=='ok' and r[1] and r[2]==0)
    r=pg.evaluate(J,[9,2,0]);ok('9 km, 2 pizze: riquadro «impossible pour cette commande» come prima','pour cette commande' in r[8],r[8])
    r=pg.evaluate(J,[9,2,0]);ok('9 km, 2 pizze: minimo 3 come prima',r[0]=='no' and not r[3] and not r[4])
    ok('bigCall e bigOnly nuove in 6 lingue, con i 230 €',pg.evaluate("Object.keys(TX).filter(k=>TX[k].bigCall&&/15/.test(TX[k].bigOnly)&&/230/.test(TX[k].bigOnly)&&/230/.test(TX[k].bigC)&&TX[k].bigCall.includes('0455\\u00a011\\u00a016\\u00a077')).length")==6)
    pg.evaluate("CART=[];MODE='take';KM='';ADR='';save()")
    pg.evaluate("document.querySelectorAll('.cwarn').forEach(e=>e.remove())")
    b=pg.locator('button.add').first;b.focus();pg.keyboard.press('Enter');pg.wait_for_timeout(300)
    pg.evaluate("document.querySelectorAll('.modal').forEach(e=>e.hidden=true)");pg.wait_for_timeout(200)
    pg.locator('#openCart').focus();pg.keyboard.press('Enter');pg.wait_for_timeout(400)
    ok('focus: entra nel carrello',pg.evaluate("document.getElementById('sheet').contains(document.activeElement)"))
    inside=True
    for i in range(40):
        pg.keyboard.press('Tab');inside=inside and pg.evaluate("document.getElementById('sheet').contains(document.activeElement)")
    ok('focus: 40 Tab restano nel carrello',inside)
    for i in range(10):
        pg.keyboard.press('Shift+Tab');inside=inside and pg.evaluate("document.getElementById('sheet').contains(document.activeElement)")
    ok('focus: 10 Maiusc+Tab restano nel carrello',inside)
    pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    ok('focus: alla chiusura torna al pulsante del carrello',pg.evaluate("document.activeElement&&document.activeElement.id")=='openCart',str(pg.evaluate("document.activeElement&&(document.activeElement.id||document.activeElement.tagName)")))
    ok('pagina sotto di nuovo scorrevole',pg.evaluate("document.body.style.overflow")=='')
    ok('menu desktop: nessun errore JavaScript',not errs,str(errs[:2]));c.close()
    # prima visita: scelta della lingua
    c=br.new_context(viewport={'width':390,'height':844});c.route('**/*',lambda r:r.continue_() if '127.0.0.1' in r.request.url else r.abort());pg=c.new_page()
    pg.goto('http://127.0.0.1:%d/menu.html'%PORT);pg.wait_for_timeout(700)
    ok('prima visita: focus nella scelta della lingua, pagina ferma',pg.evaluate("document.getElementById('intro').contains(document.activeElement)&&document.body.style.overflow==='hidden'"))
    pg.keyboard.press('Tab');ok('prima visita: Tab va sul primo pulsante lingua',pg.evaluate("document.activeElement.dataset.l")=='fr')
    c.close()
    # ---------- home
    c=ctx('fr');pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://127.0.0.1:%d/index.html'%PORT);pg.wait_for_timeout(700)
    hs=pg.eval_on_selector_all('h1,h2,h3','e=>e.filter(x=>!x.closest(".excpop,.dgg,.dga")).map(x=>+x.tagName[1])')
    ok('home: titoli in ordine (mai un salto)',hs[0]==1 and all(b-a<=1 for a,b in zip(hs,hs[1:])),str(hs))
    ok('home: link Confidentialité + Statistiques',pg.eval_on_selector('#dgc-f','e=>e.querySelector("a[href=\\"confidentialite.html\\"]")&&e.querySelector("button")?1:0')==1 and pg.locator('#dgc-f').count()==1)
    g=pg.locator('#gal button').first;g.scroll_into_view_if_needed();g.focus();pg.keyboard.press('Enter');pg.wait_for_timeout(300)
    ok('home: foto aperta, focus nella foto',pg.evaluate("document.activeElement.id")=='lb')
    pg.keyboard.press('Tab');ok('home: Tab non esce dalla foto',pg.evaluate("document.activeElement.id")=='lb')
    y=pg.evaluate("scrollY");pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    ok('home: chiusa la foto, focus sulla miniatura e stesso punto',pg.evaluate("document.activeElement.closest('#gal')!==null")and abs(pg.evaluate("scrollY")-y)<2)
    ok('home: nessun errore JavaScript',not errs,str(errs[:2]));c.close()
    # ---------- livraison, allergenes, confidentialité (6 lingue)
    for lang in('fr','nl','de','it','en','es'):
        c=ctx(lang);pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/livraison.html'%PORT);pg.wait_for_timeout(400)
        r1=pg.evaluate("()=>{const t=document.querySelector('table');const c=t.querySelector('caption');return [c&&c.textContent,c&&c.getBoundingClientRect().width,[...t.querySelectorAll('thead th')].every(x=>x.scope==='col'),document.querySelectorAll('#dgc-f').length,!!document.querySelector('#dgc-f a[href=\"confidentialite.html\"]'),document.getElementById('h1').textContent]}")
        pg.goto('http://127.0.0.1:%d/allergenes.html'%PORT);pg.wait_for_timeout(400)
        r2=pg.evaluate("()=>{const t=document.querySelector('table');const c=t.querySelector('caption');return [c&&c.textContent,c&&c.getBoundingClientRect().width,[...t.querySelectorAll('thead th')].every(x=>x.scope==='col'),document.querySelectorAll('#dgc-f').length,!!document.querySelector('#dgc-f a[href=\"confidentialite.html\"]'),t.querySelectorAll('thead th').length]}")
        pg.goto('http://127.0.0.1:%d/confidentialite.html'%PORT);pg.wait_for_timeout(400)
        r3=pg.evaluate("()=>[document.querySelectorAll('main').length,document.querySelector('main h1')?1:0,document.querySelectorAll('main h2').length]")
        ok(lang+': livraison didascalia, scope, link',bool(r1[0]) and r1[0]==r1[5] and r1[1]<=1 and r1[2] and r1[3]==1 and r1[4],str(r1))
        ok(lang+': allergenes didascalia, scope, link',bool(r2[0]) and r2[1]<=1 and r2[2] and r2[3]==1 and r2[4] and r2[5]==15,str(r2))
        ok(lang+': Confidentialité dentro <main>',r3==[1,1,12] or (r3[0]==1 and r3[1]==1),str(r3))
        ok(lang+': nessun errore JavaScript',not errs,str(errs[:2]));c.close()
    # meta twitter + link scritto nell'HTML (senza JavaScript)
    for f in('index','menu','livraison','allergenes','confidentialite'):
        s=open(D+'/'+f+'.html',encoding='utf-8').read()
        ok(f+'.html: twitter:card nel file',s.count('<meta name="twitter:card" content="summary_large_image">')==1)
        if f!='confidentialite': ok(f+'.html: link Confidentialité nel file (senza JavaScript)',s.count('<p id="dgc-f" class="dgc-f"><a href="confidentialite.html">Confidentialité</a></p>')==1)
    br.close()
finally:
    srv.terminate()
print('TOTALE',sum(R),'/',len(R))
