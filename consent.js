/* Statistiche SOLO con il consenso (GDPR / ePrivacy, deciso dal titolare il 14.11.2026).
   - Niente parte verso Umami e niente si scrive nel telefono prima di un tocco su «Accepter» o «Refuser».
   - I due pulsanti sono uguali e TUTTI E DUE fanno entrare nel sito (mai un «cookie wall»: deciso il 16.11.2026).
   - FINESTRA (titolare, 16.11.2026): velo scuro al 40 % che scende dall'alto in 1,5 secondi con la domanda al centro;
     dopo la scelta si chiude scendendo verso il basso. Se è aperta la scelta della lingua, la finestra aspetta che sia chiusa.
     Con le animazioni spente nel telefono compare e sparisce senza movimento.
   - Il link «Statistiques» in fondo alla pagina riapre la scelta. La scelta resta nel browser (dg_stats) per 6 mesi, poi si richiede.
   - In fondo alla pagina: «Mentions légales · Politique de confidentialité» (16.11.2026): aprono il PDF nella lingua del visitatore,
     senza obbligo di scaricarlo (il telefono chiede «Apri» o «Scarica»: titolare, 16.11.2026, sito vero e prova uguali).
   - Il link «Statistiques» si vede a TUTTI (titolare, 18.11.2026): riapre la scelta, per ritirare o dare il consenso (art. 7.3 GDPR).
   - Lo script di Umami è ospitato sul sito (umami.js, copia bloccata; SHA-256 in _src/stats/LEGGIMI.md).
   data-wid = id del sito su Umami · data-tag = etichetta (solo /prova/) · data-link = solo i link, niente finestra né Umami (pagine legali) */
(function () {
  "use strict";
  var sc = document.currentScript, D = sc ? sc.dataset : {}, K = "dg_stats", MAX = 183 * 864e5, loaded = false, bar = null, waiting = false;
  var T = {
    fr: { qs: "Qui sommes-nous ?", g: "Conditions générales de vente", b1: "Notre pâte fraîche,", b2: "de notre four à bois à votre table, depuis la Grand'Rue", pt: "Nos partenaires", d: "Tous les détails :", h: "Statistiques du site", q: "Pouvons-nous compter les visites du site avec Umami ?", x: "Pas de cookies, pas de publicité, aucun suivi d'un site à l'autre. Nous voyons par exemple combien de personnes visitent le site, quelles pages et de quel pays ou de quelle ville. Jamais qui vous êtes !", y: "Accepter", n: "Refuser", c: "Politique de confidentialité", m: "Mentions légales", l: "Statistiques", a: "Choix pour les statistiques" },
    nl: { qs: "Over ons", g: "Algemene verkoopvoorwaarden", b1: "Ons verse deeg,", b2: "van onze houtoven tot op uw tafel, vanuit de Grand'Rue", pt: "Onze partners", d: "Alle details:", h: "Statistieken van de site", q: "Mogen we de bezoeken aan de site tellen met Umami?", x: "Geen cookies, geen reclame, geen volgen van site tot site. We zien bijvoorbeeld hoeveel mensen de site bezoeken, welke pagina's en uit welk land of welke stad. Nooit wie u bent!", y: "Aanvaarden", n: "Weigeren", c: "Privacybeleid", m: "Wettelijke vermeldingen", l: "Statistieken", a: "Keuze voor de statistieken" },
    en: { qs: "About us", g: "Terms and conditions of sale", b1: "Our fresh dough,", b2: "from our wood-fired oven to your table, from the Grand'Rue", pt: "Our partners", d: "All the details:", h: "Site statistics", q: "May we count visits to the site with Umami?", x: "No cookies, no advertising, no tracking from one site to another. We see, for example, how many people visit the site, which pages and from which country or city. Never who you are!", y: "Accept", n: "Refuse", c: "Privacy policy", m: "Legal notice", l: "Statistics", a: "Statistics choice" },
    de: { qs: "Über uns", g: "Allgemeine Verkaufsbedingungen", b1: "Unser frischer Teig,", b2: "aus unserem Holzofen auf Ihren Tisch, von der Grand'Rue", pt: "Unsere Partner", d: "Alle Einzelheiten:", h: "Statistik der Website", q: "Dürfen wir die Besuche der Website mit Umami zählen?", x: "Keine Cookies, keine Werbung, keine Verfolgung von Website zu Website. Wir sehen zum Beispiel, wie viele Personen die Website besuchen, welche Seiten und aus welchem Land oder welcher Stadt. Nie, wer Sie sind!", y: "Akzeptieren", n: "Ablehnen", c: "Datenschutzerklärung", m: "Impressum", l: "Statistik", a: "Auswahl für die Statistik" },
    it: { qs: "Chi siamo", g: "Condizioni generali di vendita", b1: "La nostra pasta fresca,", b2: "dal nostro forno a legna alla vostra tavola, dalla Grand'Rue", pt: "I nostri partner", d: "Tutti i dettagli:", h: "Statistiche del sito", q: "Possiamo contare le visite del sito con Umami?", x: "Niente cookie, niente pubblicità, nessun tracciamento da un sito all'altro. Vediamo per esempio quante persone visitano il sito, quali pagine e da quale paese o città. Mai chi è lei!", y: "Accetta", n: "Rifiuta", c: "Informativa sulla privacy", m: "Note legali", l: "Statistiche", a: "Scelta per le statistiche" },
    es: { qs: "Quiénes somos", g: "Condiciones generales de venta", b1: "Nuestra masa fresca,", b2: "de nuestro horno de leña a su mesa, desde la Grand'Rue", pt: "Nuestros socios", d: "Todos los detalles:", h: "Estadísticas del sitio", q: "¿Podemos contar las visitas del sitio con Umami?", x: "Sin cookies, sin publicidad, sin seguimiento de un sitio a otro. Vemos por ejemplo cuántas personas visitan el sitio, qué páginas y desde qué país o ciudad. ¡Nunca quién es usted!", y: "Aceptar", n: "Rechazar", c: "Política de privacidad", m: "Aviso legal", l: "Estadísticas", a: "Elección para las estadísticas" }
  };
  function lang() { var l = ""; try { l = localStorage.getItem("dg_lang") || "" } catch (e) { } l = l || document.documentElement.lang || (navigator.language || "fr"); l = l.slice(0, 2); return T[l] ? l : "fr" }
  function get() { try { var o = JSON.parse(localStorage.getItem(K) || "null"); if (!o || (o.v !== 1 && o.v !== 0) || !(Date.now() - o.t < MAX) || o.t > Date.now()) return null; return o.v } catch (e) { return null } }
  function set(v) { try { localStorage.setItem(K, JSON.stringify({ v: v, t: Date.now() })) } catch (e) { } }
  function calm() { try { return matchMedia("(prefers-reduced-motion: reduce)").matches } catch (e) { return false } }
  function load() {
    if (loaded || window.umami || D.link != null || !D.wid) return; loaded = true;
    var s = document.createElement("script"); s.defer = true; s.src = new URL("umami.js", sc.src).href.split("?")[0] + "?v=" + (D.uv || "1");
    s.setAttribute("data-website-id", D.wid); s.setAttribute("data-domains", "pizzeriadongiovanni.be"); if (D.tag) s.setAttribute("data-tag", D.tag);
    document.head.appendChild(s);
  }
  /* link al PDF nella lingua del visitatore: si apre (il telefono chiede se scaricarlo) */
  function pdf(kind, text) {
    var a = document.createElement("a"); a.href = kind + "-" + lang() + ".pdf"; a.textContent = text;
    a.target = "_blank"; a.rel = "noopener";
    return a;
  }
  /* pagina sotto ferma finché la finestra è aperta (classe con !important: la scelta della lingua rimette lo stile della pagina quando si chiude) */
  function lock(on) { document.documentElement.classList.toggle("dgc-lock", !!on) }
  function choose(v) {
    var had = loaded || !!window.umami; set(v); foot();
    if (bar) {
      var b = bar; bar = null; b.setAttribute("aria-hidden", "true");
      var done = function () { b.remove(); lock(false); if (v === 1) load(); else if (had) location.reload() };
      if (calm()) done(); else { b.classList.add("out"); setTimeout(done, 800) }
    } else { if (v === 1) load(); else if (had) location.reload() }
  }
  function fill() {
    var t = T[lang()], p = bar.querySelector(".dgc-p"); p.textContent = "";
    bar.setAttribute("aria-label", t.a);
    var h = document.createElement("h2"); h.textContent = t.h; p.appendChild(h);
    var q = document.createElement("p"); q.className = "dgc-q"; q.textContent = t.q; p.appendChild(q);
    var x = document.createElement("p"); x.className = "dgc-x"; x.textContent = t.x; p.appendChild(x);
    var w = document.createElement("div"); w.className = "dgc-b";
    [["n", 0], ["y", 1]].forEach(function (k) { var b = document.createElement("button"); b.type = "button"; b.textContent = t[k[0]]; b.onclick = function () { choose(k[1]) }; w.appendChild(b) });
    p.appendChild(w);
    var l = document.createElement("p"); l.className = "dgc-l"; l.appendChild(document.createTextNode(t.d + " ")); l.appendChild(pdf("confidentialite", t.c)); p.appendChild(l);
  }
  /* la scelta della lingua (#intro) viene prima: la finestra aspetta che sia chiusa */
  function introOpen() { var i = document.getElementById("intro"); return !!(i && !i.hidden && i.getBoundingClientRect().height > 0) }
  function show() {
    if (introOpen()) {
      if (!waiting) { waiting = true; var i = document.getElementById("intro"); var mo = new MutationObserver(function () { if (!introOpen()) { mo.disconnect(); waiting = false; show() } }); mo.observe(i, { attributes: true }) }
      return;
    }
    if (bar) { fill(); return }
    bar = document.createElement("div"); bar.className = "dgc"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-modal", "true");
    var p = document.createElement("div"); p.className = "dgc-p"; bar.appendChild(p); fill();
    document.body.appendChild(bar); lock(true);
    if (calm()) bar.classList.add("in"); else { void bar.offsetHeight; requestAnimationFrame(function () { bar && bar.classList.add("in") }) }
    var f = bar.querySelector(".dgc-b button"); if (f) try { f.focus({ preventScroll: true }) } catch (e) { }
  }
  /* FONDO PAGINA NUOVO (titolare, 18.11.2026): spazio «Nos partenaires» (solo se c'è almeno un partner), griglia di link in due colonne
     («Qui sommes-nous ?» al centro; sotto, a sinistra allineati a sinistra Mentions légales e CGV, a destra allineati a destra Politique de confidentialité e Statistiques, per TUTTI: titolare, 18.11)
     e banner col logo e la frase del titolare. Sulle pagine legali (data-link) solo «Statistiques».
     PARTNERS: [{n:"nome", u:"https://sito", i:"img/partner-xxx.webp"}]: logo ospitato sul sito, link segnato «sponsored», niente script loro. */
  var PARTNERS = [];
  function link(href, text, blank) { var a = document.createElement("a"); a.href = href; a.textContent = text; if (blank) { a.target = "_blank"; a.rel = "noopener" } return a }
  /* griglia: tutto su una riga per cella; se non entra, carattere più piccolo fino a 11 px, poi si va a capo */
  function fit(g) { var z = 14; g.classList.remove("wr"); g.style.fontSize = z + "px"; while (g.scrollWidth > g.clientWidth && z > 11) { z -= 0.25; g.style.fontSize = z + "px" } if (g.scrollWidth > g.clientWidth) g.classList.add("wr") }
  window.addEventListener("resize", function () { var g = document.querySelector(".dgf-g"); if (g) fit(g) });
  function foot() {
    var t = T[lang()], f = document.getElementById("dgc-f");
    if (!f) {
      f = document.createElement("div"); f.id = "dgc-f"; f.className = "dgc-f";
      var pr = document.querySelector('[data-t="privacy"]'), wr = document.querySelector(".wrap");
      if (pr) pr.parentNode.insertBefore(f, pr.nextSibling); else (wr || document.body).appendChild(f);
    }
    f.textContent = "";
    var st = document.createElement("button"); st.type = "button"; st.textContent = t.l; st.onclick = show;
    if (D.link != null) { f.appendChild(st); return }
    if (PARTNERS.length) {
      var ps = document.createElement("div"); ps.className = "dgf-pt";
      var h = document.createElement("p"); h.className = "dgf-h"; h.textContent = t.pt; ps.appendChild(h);
      var r = document.createElement("div"); r.className = "dgf-lg";
      PARTNERS.forEach(function (x) { var a = link(x.u + (x.u.indexOf("?") < 0 ? "?" : "&") + "utm_source=pizzeriadongiovanni.be", "", true); a.rel = "sponsored noopener"; var im = document.createElement("img"); im.src = x.i; im.alt = x.n; im.loading = "lazy"; a.appendChild(im); r.appendChild(a) });
      ps.appendChild(r); f.appendChild(ps);
    }
    var g = document.createElement("nav"); g.className = "dgf-g";
    [link("qui-sommes-nous.html", t.qs), pdf("confidentialite", t.c), link("cgv.pdf", t.g, true), pdf("mentions-legales", t.m), st].forEach(function (e) { g.appendChild(e) });
    f.appendChild(g); fit(g); try { document.fonts.ready.then(function () { fit(g) }) } catch (e) { }
    var bn = document.createElement("div"); bn.className = "dgf-b";
    var lg = document.createElement("img"); lg.src = "logo-glow.webp"; lg.alt = "Pizzeria Don Giovanni"; lg.width = 64; lg.height = 64; bn.appendChild(lg);
    var tx = document.createElement("p"), b1 = document.createElement("b"); b1.textContent = t.b1; tx.appendChild(b1); tx.appendChild(document.createElement("br")); tx.appendChild(document.createTextNode(t.b2));
    var tel = document.createElement("a"); tel.href = "tel:+32455111677"; tel.className = "dgf-t"; tel.textContent = "0455 11 16 77"; tx.appendChild(document.createElement("br")); tx.appendChild(tel);
    bn.appendChild(tx); f.appendChild(bn);
  }
  function init() {
    var st = document.createElement("style");
    st.textContent = "html.dgc-lock,html.dgc-lock body{overflow:hidden!important}.dgc{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:16px;transform:translateY(-100%);transition:transform 1.5s cubic-bezier(.22,.61,.36,1);font:14px/1.5 Poppins,system-ui,sans-serif}.dgc.in{transform:none}.dgc.out{transform:translateY(100%);transition:transform .8s cubic-bezier(.55,0,.85,.4)}@media (prefers-reduced-motion:reduce){.dgc,.dgc.out{transition:none}}.dgc-p{background:#171412;color:#fbf4e6;border:1px solid #2c2622;border-radius:16px;padding:20px 18px;max-width:440px;width:100%;max-height:calc(100% - 8px);overflow:auto;box-shadow:0 12px 40px rgba(0,0,0,.6);text-align:center}.dgc-p h2{margin:0 0 8px;font:400 22px/1.2 'DM Serif Display',serif;color:#fbf4e6}.dgc-p p{margin:0 0 10px;color:#eee3cf}.dgc-q{font-weight:600;color:#fbf4e6!important}.dgc-x{font-size:13px;color:#b7ab98!important}.dgc-b{display:flex;gap:10px;justify-content:center;margin:14px 0 10px}.dgc-b button{flex:1 1 0;max-width:180px;padding:11px 14px;border-radius:10px;border:1px solid #fbf4e6;background:#fbf4e6;color:#0d0b0a;font:600 14px Poppins,system-ui,sans-serif;cursor:pointer}.dgc-l{margin:0!important;font-size:12px}.dgc a{color:#f2b33d}.dgc-f{font-size:13px;color:#b7ab98;margin:18px 0 0}.dgc-f a,.dgc-f button{color:inherit;text-decoration:none;background:none;border:0;padding:0;font:inherit;cursor:pointer}.dgc-f a:hover,.dgc-f button:hover{text-decoration:underline}.dgf-g{display:grid;grid-template-columns:auto;justify-content:start;justify-items:start;row-gap:12px;padding:16px 0;border-top:1px solid #2c2622;overflow:hidden;text-align:left}.dgf-g>*{white-space:nowrap}.dgf-g.wr>*{white-space:normal}.dgf-pt{text-align:center;padding:14px 0;border-top:1px solid #2c2622}.dgf-h{margin:0 0 10px!important;font:400 18px 'DM Serif Display',serif;color:#fbf4e6}.dgf-lg{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:center}.dgf-lg img{max-height:56px;max-width:140px;display:block}.dgf-b{display:flex;align-items:center;gap:14px;background:linear-gradient(180deg,#2e2926 0%,#161311 55%,#0a0908 100%);color:#fff;border-radius:14px;padding:16px 18px;margin:8px 0 10px;border:1px solid #3a332e;border-top-color:#5a504a;box-shadow:0 1px 0 rgba(255,255,255,.08) inset,0 -2px 0 rgba(0,0,0,.6) inset,0 10px 22px rgba(0,0,0,.75),0 3px 6px rgba(0,0,0,.6)}.dgf-b img{width:64px;height:64px;flex:0 0 64px}.dgf-b p{margin:0!important;font-size:14px;line-height:1.45;color:#fff!important}.dgf-b b{font:400 19px 'DM Serif Display',serif}.dgf-b .dgf-t{color:#fff;font-weight:600;white-space:nowrap}@media print{.dgc,.dgc-f{display:none!important}}";
    document.head.appendChild(st); foot();
    document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-l]")) setTimeout(function () { foot(); if (bar) fill() }, 0) });
    var v = get(); if (v === 1) load(); else if (v === null && D.link == null) show();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
