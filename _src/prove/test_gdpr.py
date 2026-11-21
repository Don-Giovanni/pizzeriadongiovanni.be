import json,subprocess,sys,time,os
from playwright.sync_api import sync_playwright
ROOT=sys.argv[1]
srv=subprocess.Popen([sys.executable,'-m','http.server','8765','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
B='http://pizzeriadongiovanni.be:8765/'+(sys.argv[2] if len(sys.argv)>2 else 'prova/')
R={}
def ok(n,c,d=''): R[n]=bool(c);print(('OK  ' if c else 'FAIL'),n,d)
# 15.11.2026: il bottone «Reset» esiste SOLO nella copia di prova, mai nella copia del sito vero
_PV=(sys.argv[2] if len(sys.argv)>2 else 'prova/');_D=os.path.join(ROOT,_PV)
_has=os.path.exists(os.path.join(_D,'reset.js')) or any('reset.js' in open(os.path.join(_D,f),encoding='utf-8').read() for f in os.listdir(_D) if f.endswith('.html'))
ok('0 bottone Reset: solo nella prova',_has==(_PV=='prova/'),'presente' if _has else 'assente')
_mk=[f for f in os.listdir(_D) if f.split('.')[-1] in ('html','js','txt') and f!='reset.js' and any(x in open(os.path.join(_D,f),encoding='utf-8').read() for x in ('{{+','+}}','{{*','*}}'))]
ok('0 segni di novità {{+ +}}: mai nella copia del sito vero',_PV=='prova/' or not _mk,str(_mk))
with sync_playwright() as p:
    br=p.chromium.launch(args=['--host-resolver-rules=MAP pizzeriadongiovanni.be 127.0.0.1'])
    def ctx():
        c=br.new_context(viewport={'width':390,'height':800},locale='fr-BE');ext=[];sent=[]
        def route(r):
            u=r.request.url
            if u.startswith('http://pizzeriadongiovanni.be:8765/'): return r.continue_()
            ext.append((r.request.method,u,r.request.post_data))
            if 'gateway.umami.is' in u: sent.append(json.loads(r.request.post_data));return r.fulfill(json={'cache':'x'})
            if 'turnstile' in u: return r.fulfill(content_type='text/javascript',body='window.turnstile={render:(e,o)=>{setTimeout(()=>o.callback("tok"),20);return "w"},remove(){},reset(){}}')
            if 'workers.dev' in u:
                path=u.split('workers.dev')[1]
                j={'/start':{'s':'S'},'/chat':{'text':'Récapitulatif de test','action':'demande','title':'Test','lang':'fr'},'/code':{'c':'C'},'/send':{'id':'DG-TEST-1'},'/gift':{'none':1}}.get(path,{})
                return r.fulfill(json=j,headers={'access-control-allow-origin':'*'})
            if 'photon' in u: return r.fulfill(json={'features':[{'type':'Feature','geometry':{'type':'Point','coordinates':[4.29,50.34]},'properties':{'name':'Rue des Exemples','street':'Rue des Exemples','housenumber':'12','postcode':'6530','city':'Thuin','country':'Belgique','countrycode':'BE','osm_key':'highway','type':'house'}}]},headers={'access-control-allow-origin':'*'})
            if 'heigit' in u or 'openrouteservice' in u: return r.fulfill(json={'features':[{'properties':{'summary':{'distance':3400,'duration':420}}}]},headers={'access-control-allow-origin':'*'})
            return r.abort()
        c.route('**/*',route);return c,ext,sent
    st=lambda pg:pg.evaluate('({l:Object.assign({},localStorage),s:Object.assign({},sessionStorage)})')
    # 1. nessun tocco: niente memoria, niente richieste esterne, fascia visibile (4 pagine)
    for f in ['index.html','menu.html','livraison.html','allergenes.html']:
        c,ext,sent=ctx();pg=c.new_page();pg.goto(B+f);pg.wait_for_timeout(2500)
        s=st(pg);um=[u for m,u,d in ext if 'umami' in u]
        reqs=[r for r in ext]
        ok('1 '+f+' senza tocco: memoria vuota',s=={'l':{},'s':{}},json.dumps(s))
        ok('1 '+f+' senza tocco: nessuna richiesta esterna',ext==[],str([u for m,u,d in ext]))
        # 16.11.2026: se è aperta la scelta della lingua, la finestra delle statistiche aspetta; poi scende dall'alto (1,5 s)
        if pg.locator('#intro').count() and pg.locator('#intro').is_visible():
            ok('1 '+f+' con la scelta della lingua aperta: finestra statistiche in attesa',pg.locator('.dgc').count()==0)
            pg.locator('#intro button[data-l="fr"]').click();pg.wait_for_timeout(1900)
        ok('1 '+f+' finestra al centro con velo al 40 % (scende dall\'alto)',pg.evaluate('(()=>{const d=document.querySelector(".dgc");if(!d)return false;const s=getComputedStyle(d);return s.position=="fixed"&&s.backgroundColor=="rgba(0, 0, 0, 0.4)"&&s.transitionDuration.indexOf("1.5s")==0&&d.classList.contains("in")&&getComputedStyle(document.documentElement).overflow=="hidden"})()'))
        ok('1 '+f+' fascia visibile, 2 pulsanti uguali',pg.locator('.dgc').is_visible() and pg.evaluate('(()=>{const b=[...document.querySelectorAll(".dgc-b button")];const g=e=>{const s=getComputedStyle(e);return [s.backgroundColor,s.color,s.fontSize,s.fontWeight,s.padding,s.borderTopColor,s.minWidth].join("|")};return b.length==2&&g(b[0])==g(b[1])&&Math.abs(b[0].getBoundingClientRect().top-b[1].getBoundingClientRect().top)<1})()'),pg.locator('.dgc').inner_text().replace('\n',' / '))
        ok('1 '+f+' umami.js NON caricato',not pg.evaluate('!!window.umami') and not pg.evaluate('!!document.querySelector("script[src*=umami]")'))
        ok('1 '+f+' link Confidentialité + Statistiques in fondo',pg.locator('#dgc-f').count()==1,pg.locator('#dgc-f').inner_text())
        # 16.11.2026: in fondo Mentions légales + Confidentialité in PDF; sul sito vero si scaricano, nella prova si aprono
        lk=pg.evaluate('[...document.querySelectorAll("#dgc-f a")].map(a=>[a.getAttribute("href"),a.hasAttribute("download"),a.target])')
        ok('1 '+f+' fondo pagina (21.11, tutto a sinistra): Qui sommes-nous, Confidentialité, CGV, Mentions, telefono; PDF solo da aprire',[x[0] for x in lk]==['qui-sommes-nous.html','confidentialite-fr.pdf','cgv.pdf','mentions-legales-fr.pdf','tel:+32455111677'] and all(x[1] is False and x[2]=='_blank' for x in lk if x[0].endswith('.pdf')),str(lk))
        ok('1 '+f+' fondo pagina: niente dati della società, Facebook, email né frase sulle statistiche',pg.evaluate('(()=>{const f=document.querySelector("footer");return !f||!/1036|facebook|info@|Statistiques de visite/i.test(f.innerText+f.innerHTML)})()'))
        ok('1 '+f+' «Statistiques» in fondo visibile a tutti (18.11)',pg.locator('#dgc-f button').count()==1)
        c.close()
    # 2. Refuser
    c,ext,sent=ctx();pg=c.new_page();pg.goto(B+'menu.html');pg.wait_for_timeout(800)
    pg.locator('#intro button[data-l="fr"]').click() if pg.locator('#intro button[data-l="fr"]').count() and pg.locator('#intro').is_visible() else None
    pg.locator('.dgc-b button').nth(0).click();pg.wait_for_timeout(800)
    s=st(pg);ok('2 Refuser: scelta salvata v=0, niente Umami',json.loads(s['l']['dg_stats'])['v']==0 and not sent and not pg.evaluate('!!window.umami'),s['l']['dg_stats'])
    pg.reload();pg.wait_for_timeout(1200);ok('2 dopo ricarica: niente fascia, niente Umami',pg.locator('.dgc').count()==0 and not sent and not [u for m,u,d in ext if 'umami' in u])
    ok('2 chi ha rifiutato vede «Statistiques» in fondo per cambiare idea (18.11)',pg.locator('#dgc-f button').count()==1)
    # scelta scaduta o cancellata → la finestra torna → Accepter
    pg.evaluate('localStorage.removeItem("dg_stats")');pg.reload();pg.wait_for_timeout(1900);ok('2 senza scelta salvata la finestra torna',pg.locator('.dgc').is_visible())
    pg.locator('.dgc-b button').nth(1).click();pg.wait_for_timeout(1500)
    ok('3 chi ha accettato vede «Statistiques» in fondo (per ritirare il consenso)',pg.locator('#dgc-f button').count()==1)
    ok('3 Accepter: umami.js dal sito e visita inviata',pg.evaluate('document.querySelector("script[src*=umami]").src').startswith(B+'umami.js') and len(sent)==1,json.dumps(sent[:1],ensure_ascii=False))
    ok('3 visita: solo i campi previsti',sent and set(sent[0]['payload'].keys())<={'website','screen','language','title','hostname','url','referrer','tag','id','salt'} and (sent[0]['payload'].get('tag')=='prova')==B.endswith('/prova/'),str(sorted(sent[0]['payload'].keys())) if sent else '')
    # 4. evento consegna
    n0=len(sent)
    try:
        pg.evaluate('localStorage.setItem("dg_mode","del")');pg.reload();pg.wait_for_timeout(1000)
        pg.evaluate('pick({properties:{rue:"Rue des Exemples",label:"Rue des Exemples 12, 6530 Thuin, Belgique",cp:"6530"},geometry:{coordinates:[4.29,50.34]}})');pg.wait_for_timeout(1500)
    except Exception as e: print('pick err',e)
    ev=[x for x in sent[n0:] if x['payload'].get('name')=='livraison-village']
    ok('4 evento livraison-village: solo village e km',len(ev)==1 and set(ev[0]['payload']['data'].keys())=={'village','km'},json.dumps(ev[0]['payload']['data'],ensure_ascii=False) if ev else 'nessun evento')
    # Refuser dopo Accepter → ricarica senza Umami
    pg.evaluate('document.getElementById("sheet").hidden=true')
    pg.locator('#dgc-f button').click();pg.locator('.dgc-b button').nth(0).click();pg.wait_for_timeout(1500);n1=len(sent)
    ok('3 cambio idea (Refuser): pagina ricaricata senza Umami',not pg.evaluate('!!window.umami') and json.loads(st(pg)['l']['dg_stats'])['v']==0)
    c.close()
    # 5. chat: avviso + modulo con casella
    c,ext,sent=ctx();pg=c.new_page();pg.goto(B+'menu.html');pg.wait_for_timeout(800)
    if pg.locator('#intro').is_visible(): pg.locator('#intro button[data-l="fr"]').click()
    pg.locator('.dgc-b button').nth(0).click()
    pg.locator('.dga-chip, .dga-nav, .dga-btn').first.click();pg.wait_for_timeout(500)
    av=pg.locator('.dga-p').first.inner_text()
    ok('5 avviso della chat senza «font foi»','font foi' not in av and 'Réponses automatiques' in av,av)
    ok('5 aprire la chat non manda niente',[u for m,u,d in ext if 'workers.dev/gift' not in u]==[],str([u for m,u,d in ext]))
    pg.locator('.dga-f textarea').fill('Bonjour, une fête pour 20 personnes');pg.locator('.dga-f button').click();pg.wait_for_timeout(1500)
    pg.locator('.dga-rq button').nth(0).click();pg.wait_for_timeout(300)
    fn=pg.locator('.dga-form .dga-p2').inner_text();lab=pg.locator('.dga-ok').inner_text()
    ok('3b modulo: frase senza «uniquement» + casella',('uniquement' not in fn) and pg.locator('.dga-ok input[type=checkbox][required]').count()==1 and not pg.locator('.dga-ok input').is_checked(),fn+' || '+lab)
    pg.locator('.dga-form input[name=n]').fill('Jean Exemple');pg.locator('.dga-form input[name=e]').fill('jean@exemple.test')
    pg.locator('.dga-form button[type=submit]').click();pg.wait_for_timeout(1200)
    ok('3b senza spunta: niente parte (né codice né invio)',not [u for m,u,d in ext if u.endswith('/code') or u.endswith('/send')] and pg.locator('.dga-form input[name=n]').count()==1)
    em=pg.locator('.dga-form .dga-e');emt=em.inner_text() if em.is_visible() else ''
    pg.locator('.dga-ok input').check();pg.wait_for_timeout(200)
    ok('3c senza spunta: frase nostra con telefono (che non va a capo) ed email, sparisce con la spunta',('Sans cette case cochée' in emt) and ('0455\u00a011\u00a016\u00a077' in emt) and ('info@pizzeriadongiovanni.be' in emt) and not em.is_visible(),emt)
    pg.locator('.dga-form button[type=submit]').click();pg.wait_for_timeout(1500)
    pg.locator('.dga-form input[name=c]').fill('123456');pg.locator('.dga-form button[type=submit]').click();pg.wait_for_timeout(1500)
    snd=[json.loads(d) for m,u,d in ext if u.endswith('/send')]
    ok('3b con spunta: codice chiesto e richiesta inviata con ok:1',len([1 for m,u,d in ext if u.endswith('/code')])==1 and len(snd)==1 and snd[0].get('ok')==1,str(sorted(snd[0].keys())) if snd else '')
    c.close()
    # 6. Confidentialité: 6 lingue, 12 sezioni, link, riga sul francese
    c,ext,sent=ctx();pg=c.new_page()
    for l in ['fr','nl','en','de','it','es']:
        pg.goto(B+'confidentialite.html?l='+l);pg.wait_for_timeout(400)
        n=pg.locator('#c h2').count();a=pg.locator('#c a').count();last=pg.locator('#c p').last.inner_text()
        _ns=13 if _PV=='prova/' else 12  # 16.11.2026: la sezione del cadeau caché solo nella prova (sul sito vero col gioco)
        ok('6 Confidentialité '+l+': '+str(_ns)+' sezioni, 18 link',n==_ns and a==18,f'{n} sezioni, {a} link · «{last[-70:]}»')
    ok('6 Confidentialité: niente fascia, niente Umami, «Statistiques» visibile (18.11)',pg.locator('.dgc').count()==0 and pg.locator('#dgc-f button').count()==1 and ext==[] and st(pg)=={'l':{},'s':{}})
    pg.screenshot(path='/home/claude/work/t/conf.png')
    # 7b. Conditions générales de vente (18.11.2026): PDF presente e linkato dalle Mentions légales
    try:
        _cg=open(os.path.join(_D,'cgv.pdf'),'rb').read(5)==b'%PDF-'
    except Exception: _cg=False
    ok('7b CGV: cgv.pdf presente e nelle Mentions légales',_cg and 'cgv:"cgv.pdf"' in open(os.path.join(_D,'mentions-legales.html'),encoding='utf-8').read(),'')
    # 7. Mentions légales (16.11.2026): 6 lingue, 12 sezioni (dal 18.11 con le CGV; dal 21.11 senza Hébergement, che sta solo nella Confidentialité), dati della SRL, niente finestra né Umami
    for l in ['fr','nl','en','de','it','es']:
        pg.goto(B+'mentions-legales.html?l='+l);pg.wait_for_timeout(400)
        n=pg.locator('#c h2').count();txt=pg.locator('#c').inner_text()
        ok('7 Mentions légales '+l+': 12 sezioni, BE 1036.749.658',n==12 and '1036.749.658' in txt and "Grand'Rue 1" in txt,f'{n} sezioni')
    ok('7 Mentions légales: niente finestra, niente Umami, «Statistiques» visibile (18.11)',pg.locator('.dgc').count()==0 and pg.locator('#dgc-f button').count()==1 and ext==[])
    c.close()
    _pdf=[k+'-'+l+'.pdf' for k in ('confidentialite','mentions-legales') for l in ('fr','nl','en','de','it','es')]
    _bad=[x for x in _pdf if not os.path.exists(os.path.join(_D,x)) or open(os.path.join(_D,x),'rb').read(5)!=b'%PDF-']
    ok('7 PDF: 12 file (2 testi × 6 lingue)',not _bad,str(_bad))
    # schermate
    c,ext,sent=ctx();pg=c.new_page();pg.goto(B+'index.html');pg.wait_for_timeout(1500);pg.screenshot(path='/home/claude/work/t/banner_home.png')
    pg.goto(B+'livraison.html');pg.wait_for_timeout(800);pg.screenshot(path='/home/claude/work/t/banner_liv.png');c.close()
    br.close()
srv.terminate()
print('TOTALE',sum(R.values()),'/',len(R))
