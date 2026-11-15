import subprocess,sys,time
from playwright.sync_api import sync_playwright
srv=subprocess.Popen([sys.executable,'-m','http.server','8767','--bind','127.0.0.1'],cwd=sys.argv[1],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
try:
  with sync_playwright() as p:
    br=p.chromium.launch(args=['--host-resolver-rules=MAP pizzeriadongiovanni.be 127.0.0.1'])
    for L,vp in [('it',(390,800)),('fr',(1200,800)),('de',(360,640))]:
        c=br.new_context(viewport={'width':vp[0],'height':vp[1]});c.route('**/*',lambda r:r.continue_() if ':8767/' in r.request.url else r.abort())
        errs=[];pg=c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.add_init_script("try{localStorage.setItem('dg_lang','%s')}catch(e){}"%L)
        pg.goto('http://pizzeriadongiovanni.be:8767/menu.html');pg.wait_for_timeout(1000)
        pg.evaluate("document.querySelectorAll('.dgc,.cwarn,#intro').forEach(e=>e.remove())")
        li=pg.locator('li.it',has_text='Mortadella').first
        nums=li.locator('a.alg').inner_text().replace('\n',' ')
        li.locator('a.alg').click();pg.wait_for_timeout(900)
        r=pg.evaluate('''(()=>{const r=document.querySelector("tr.hl");if(!r)return null;const b=r.getBoundingClientRect();const tw=document.getElementById("tw").getBoundingClientRect();const lg=document.querySelector(".lgs").getBoundingClientRect();const th=document.querySelector("thead th").getBoundingClientRect();
          return {url:location.href.split("/").pop(),nome:r.children[0].innerText,rigaY:Math.round(b.top+b.height/2),visibileDa:Math.round(Math.max(th.bottom,0)),visibileA:Math.round(Math.min(innerHeight,tw.bottom)),th:[...document.querySelectorAll("thead th.hl")].map(e=>e.innerText).join(","),leg:[...document.querySelectorAll(".legend li.hl")].map(e=>e.innerText.replace(/\\n/g," ")).join(" · "),bg:getComputedStyle(r.children[0]).backgroundColor}})()''')
        print(L,vp,'numeri nel menu:',nums,'->',r)
        pg.screenshot(path='/tmp/alg_%s.png'%L)
        pg.wait_for_timeout(10200);print(L,'dopo 10 s evidenziati:',pg.locator('.hl').count(),'errori:',errs)
        pg.go_back();pg.wait_for_timeout(600);print(L,'indietro ->',pg.url.split('/')[-1],'scrollY',pg.evaluate('scrollY'))
        pg2=c.new_page();pg2.goto('http://pizzeriadongiovanni.be:8767/prova/allergenes.html');pg2.wait_for_timeout(500);print(L,'pagina aperta senza piatto: evidenziati',pg2.locator('.hl').count())
        c.close()
    br.close()
finally: srv.terminate()
