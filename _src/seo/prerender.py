#!/usr/bin/env python3
# prerender.py <cartella del sito (repository o repository/prova)>
# TESTO FRANCESE SCRITTO NELL'HTML (15.11.2026): ultimo passo di deploy.sh.
# Apre ogni pagina generata in un browser senza rete (Playwright + Chromium, lingua fr), legge il testo
# che JavaScript disegna e lo scrive dentro il file: chi legge solo l'HTML (motori di ricerca, strumenti)
# trova menu, prezzi, tariffe, allergeni e Confidentialité. JavaScript ridisegna tutto come prima
# (stesso contenuto, lingue comprese): l'aspetto non cambia.
# - Riempie solo elementi VUOTI nel file: quelli con data-t (testi) e i contenitori elencati in PAGES.
# - Niente che dipende dall'ora o dal visitatore (semaforo aperto/chiuso, carrello, fascia statistiche).
# - Chi ha scelto un'altra lingua non vede il francese nemmeno per un istante (classe «dgpre» tolta a fine pagina).
# - menu.html: aggiunge i dati strutturati «Menu» (piatti e prezzi) presi dagli stessi dati del menu.
# Se Playwright manca lo script si ferma con un errore: MAI pubblicare pagine senza questo passo.
import sys, re, json, html, subprocess, time, os
from playwright.sync_api import sync_playwright

D = os.path.abspath(sys.argv[1])
B = 'https://pizzeriadongiovanni.be/'
PORT = 8779
# pagina -> id dei contenitori riempiti da JavaScript (oltre a tutti i [data-t])
PAGES = {
    'index.html': [],
    'menu.html': ['chips', 'menu'],
    'livraison.html': ['back', 'h1', 'main'],
    'allergenes.html': ['back', 'h1', 'fx', 'tw'],
    'confidentialite.html': ['c'],
}
HEAD = ('<script>try{var dgl=localStorage.getItem("dg_lang")||(navigator.language||"fr").slice(0,2);'
        'if(/^(nl|de|it|en|es)$/.test(dgl))document.documentElement.className+=" dgpre"}catch(e){}</script>'
        '<style>.dgpre [data-t],%s{visibility:hidden}</style>\n')
TAIL = '<script>document.documentElement.classList.remove("dgpre")</script>\n'


def fill_once(s, pat, inner, what):
    n = len(re.findall(pat, s))
    assert n == 1, (what, 'trovati', n)
    return re.sub(pat, lambda m: m.group(1) + inner + m.group(3), s, count=1)


srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '--bind', '127.0.0.1'], cwd=D,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
try:
    with sync_playwright() as p:
        br = p.chromium.launch()
        for page, ids in PAGES.items():
            f = os.path.join(D, page)
            if not os.path.exists(f):
                continue
            s = open(f, encoding='utf-8').read()
            assert 'dgpre' not in s, page + ': già riempita (rigenerare la pagina prima)'
            ctx = br.new_context(viewport={'width': 390, 'height': 844}, locale='fr-BE')
            ctx.route('**/*', lambda r: r.continue_() if '127.0.0.1' in r.request.url else r.abort())
            ctx.add_init_script("try{localStorage.setItem('dg_lang','fr')}catch(e){}")
            pg = ctx.new_page()
            pg.goto('http://127.0.0.1:%d/%s' % (PORT, page))
            pg.wait_for_timeout(600)
            # testi [data-t]
            pairs = pg.eval_on_selector_all('[data-t]', 'e=>e.map(x=>[x.dataset.t,x.textContent])')
            txt = {}
            bad = set()
            for k, v in pairs:
                if k in txt and txt[k] != v:
                    bad.add(k)
                txt[k] = v
            nt = 0

            def rep(m):
                global nt
                k = m.group(3)
                if k in bad or not txt.get(k):
                    return m.group(0)
                nt += 1
                return m.group(1) + html.escape(txt[k], quote=False) + m.group(4)
            s = re.sub(r'(<(\w+)\b[^>]*\bdata-t="(\w+)"[^>]*>)(</\2>)', rep, s)
            # contenitori
            for i in ids:
                inner = pg.eval_on_selector('#' + i, 'e=>e.innerHTML')
                assert inner.strip(), (page, i, 'vuoto nel browser')
                s = fill_once(s, r'(<(\w+)\b[^>]*\bid="%s"[^>]*>)(</\2>)' % i, inner, (page, i))
            # dati strutturati del menu
            if page == 'menu.html':
                data = pg.evaluate('''()=>MENU.filter(c=>!c.sup).map(c=>({name:c.t[L],items:ITEMS.filter(x=>x.cat===c.id).map(x=>({n:nm(x),d:ingTxt(x),p:x.p}))}))''')
                ld = {"@context": "https://schema.org", "@type": "Menu", "@id": B + "menu.html#menu",
                      "name": "Menu de la Pizzeria Don Giovanni", "inLanguage": "fr", "url": B + "menu.html",
                      "hasMenuSection": [{"@type": "MenuSection", "name": c['name'], "hasMenuItem": [
                          dict({"@type": "MenuItem", "name": str(x['n'])}, **({"description": x['d']} if x['d'] else {}),
                               **({"offers": {"@type": "Offer", "price": "%.2f" % x['p'], "priceCurrency": "EUR"}} if isinstance(x['p'], (int, float)) and x['p'] > 0 else {}))
                          for x in c['items']]} for c in data if c['items']]}
                tag = '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + '</script>\n'
                assert s.count('</head>') == 1
                s = s.replace('</head>', tag + '</head>')
                print('  dati strutturati Menu:', sum(len(c['hasMenuItem']) for c in ld['hasMenuSection']), 'piatti in', len(ld['hasMenuSection']), 'categorie')
            # niente francese visibile per chi ha un'altra lingua
            sel = ''.join(',.dgpre #' + i for i in ids)
            head = HEAD % ('.dgpre #dgpre0' + sel)
            assert s.count('</head>') == 1 and s.count('</body>') == 1, page
            s = s.replace('</head>', head + '</head>').replace('</body>', TAIL + '</body>')
            open(f, 'w', encoding='utf-8').write(s)
            ctx.close()
            print('prerender ok', page, '· testi', nt, '· contenitori', len(ids), '·', len(s), 'byte')
        br.close()
finally:
    srv.terminate()
