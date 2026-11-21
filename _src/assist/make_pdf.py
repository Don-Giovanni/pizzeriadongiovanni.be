"""PDF di Confidentialité e Mentions légales nelle 6 lingue (16.11.2026, titolare).
Uso: python3 make_pdf.py <cartella pubblicata> prova|main
Crea <cartella>/confidentialite-<lingua>.pdf e mentions-legales-<lingua>.pdf dalle pagine già pubblicate in quella cartella.
- Sul sito vero (main) i segni {{+ +}} sono già stati tolti da deploy.sh; nella prova le novità restano evidenziate in giallo.
- I link interni diventano indirizzi completi del sito vero; la barra in alto (ritorno, lingue) non si stampa.
- Il link in fondo al sito li fa SCARICARE sul sito vero e li apre soltanto nella prova (consent.js)."""
import sys, pathlib
from playwright.sync_api import sync_playwright
D = pathlib.Path(sys.argv[1]).resolve(); MODE = sys.argv[2] if len(sys.argv) > 2 else "prova"
SITE = "https://pizzeriadongiovanni.be/" if MODE == "main" else "https://prova-dg.pizzeriadongiovannithuin.workers.dev/prova/"  # 21.11.2026: nella prova i link dei PDF portano alla prova (il sito vero non ha ancora cgv.pdf); file della prova protetti da Access
PAGES = [("confidentialite.html", "confidentialite"), ("mentions-legales.html", "mentions-legales")]
LANGS = ["fr", "nl", "en", "de", "it", "es"]
CSS = """@page{size:A4;margin:16mm 16mm 18mm}
html,body{background:#fff!important;color:#111!important}
body{font-size:11pt!important;line-height:1.5!important}
.top,#dg-prova,#dgc-f,.dgc{display:none!important}
.wrap{max-width:none!important;padding:0!important}
h1,h2{color:#111!important;break-after:avoid}h2{margin-top:18px!important}
p,li,small,.muted{color:#222!important}a{color:#0645ad!important}
.box{background:#f4f1ea!important;border:1px solid #ccc!important}
mark.dgn{background:#ffe14d!important;color:#000!important}mark.dgo{background:#ff9a2e!important;color:#000!important}"""
PAINT = """(prova)=>{const hm=h=>h.indexOf('{{+')>=0||h.indexOf('{{*')>=0;const all=[...document.body.querySelectorAll('*')].filter(e=>!e.closest('script,style')&&hm(e.innerHTML));
all.filter(e=>![...e.children].some(c=>hm(c.innerHTML))).forEach(e=>{e.innerHTML=prova?e.innerHTML.split('{{+').join('<mark class="dgn">').split('+}}').join('</mark>').split('{{*').join('<mark class="dgo">').split('*}}').join('</mark>'):e.innerHTML.split('{{+').join('').split('+}}').join('').split('{{*').join('').split('*}}').join('')});}"""
FIX = """(site)=>{document.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href');if(!/^(https?:|mailto:|tel:|#)/.test(h))a.href=site+h})}"""
with sync_playwright() as p:
    b = p.chromium.launch(); n = 0
    for page_name, kind in PAGES:
        src = D / page_name
        if not src.exists(): sys.exit("ERRORE: manca " + str(src))
        for l in LANGS:
            pg = b.new_page(); pg.goto(src.as_uri() + "?l=" + l); pg.wait_for_load_state("networkidle")
            pg.evaluate(PAINT, MODE != "main"); pg.evaluate(FIX, SITE); pg.add_style_tag(content=CSS); pg.emulate_media(media="print")
            out = D / f"{kind}-{l}.pdf"
            # 21.11.2026 (titolare): niente piè di pagina («pizzeriadongiovanni.be · 1/3»): chi siamo è già scritto in cima, niente ripetizioni
            pg.pdf(path=str(out), format="A4", print_background=True, display_header_footer=False,
                   margin={"top": "16mm", "bottom": "18mm", "left": "16mm", "right": "16mm"})
            pg.close(); n += 1
    b.close()
print(f"PDF: {n} file in {D}")
