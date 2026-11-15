/* Statistiche SOLO con il consenso (GDPR / ePrivacy, deciso dal titolare il 14.11.2026).
   - Niente parte verso Umami e niente si scrive nel telefono prima di un tocco su «Accepter» o «Refuser».
   - I due pulsanti sono uguali. Il link «Statistiques» in fondo alla pagina riapre la scelta.
   - La scelta resta nel browser (dg_stats) per 6 mesi, poi si richiede.
   - Lo script di Umami è ospitato sul sito (umami.js, copia bloccata; SHA-256 in _src/stats/LEGGIMI.md).
   data-wid = id del sito su Umami · data-tag = etichetta (solo /prova/) · data-link = solo il link, niente fascia né Umami (pagina Confidentialité) */
(function () {
  "use strict";
  var sc = document.currentScript, D = sc ? sc.dataset : {}, K = "dg_stats", MAX = 183 * 864e5, loaded = false, bar = null;
  var T = {
    fr: { q: "Pouvons-nous mesurer les visites du site avec Umami, sans cookies ? Rien n'est mesuré sans votre accord.", y: "Accepter", n: "Refuser", c: "Confidentialité", l: "Statistiques", a: "Choix pour les statistiques" },
    nl: { q: "Mogen we de bezoeken aan de site meten met Umami, zonder cookies? Zonder uw akkoord wordt niets gemeten.", y: "Aanvaarden", n: "Weigeren", c: "Privacy", l: "Statistieken", a: "Keuze voor de statistieken" },
    en: { q: "May we measure visits to the site with Umami, without cookies? Nothing is measured without your agreement.", y: "Accept", n: "Refuse", c: "Privacy", l: "Statistics", a: "Statistics choice" },
    de: { q: "Dürfen wir die Besuche der Website mit Umami messen, ohne Cookies? Ohne Ihre Zustimmung wird nichts gemessen.", y: "Akzeptieren", n: "Ablehnen", c: "Datenschutz", l: "Statistik", a: "Auswahl für die Statistik" },
    it: { q: "Possiamo misurare le visite del sito con Umami, senza cookie? Niente viene misurato senza il suo accordo.", y: "Accetta", n: "Rifiuta", c: "Privacy", l: "Statistiche", a: "Scelta per le statistiche" },
    es: { q: "¿Podemos medir las visitas del sitio con Umami, sin cookies? No se mide nada sin su acuerdo.", y: "Aceptar", n: "Rechazar", c: "Privacidad", l: "Estadísticas", a: "Elección para las estadísticas" }
  };
  function lang() { var l = ""; try { l = localStorage.getItem("dg_lang") || "" } catch (e) { } l = l || document.documentElement.lang || (navigator.language || "fr"); l = l.slice(0, 2); return T[l] ? l : "fr" }
  function get() { try { var o = JSON.parse(localStorage.getItem(K) || "null"); if (!o || (o.v !== 1 && o.v !== 0) || !(Date.now() - o.t < MAX) || o.t > Date.now()) return null; return o.v } catch (e) { return null } }
  function set(v) { try { localStorage.setItem(K, JSON.stringify({ v: v, t: Date.now() })) } catch (e) { } }
  function load() {
    if (loaded || window.umami || D.link != null || !D.wid) return; loaded = true;
    var s = document.createElement("script"); s.defer = true; s.src = new URL("umami.js", sc.src).href.split("?")[0] + "?v=" + (D.uv || "1");
    s.setAttribute("data-website-id", D.wid); s.setAttribute("data-domains", "pizzeriadongiovanni.be"); if (D.tag) s.setAttribute("data-tag", D.tag);
    document.head.appendChild(s);
  }
  function choose(v) { var had = loaded || !!window.umami; set(v); if (bar) { bar.remove(); bar = null } if (v === 1) load(); else if (had) location.reload() }
  function show() {
    if (bar) bar.remove(); var t = T[lang()];
    bar = document.createElement("div"); bar.className = "dgc"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-label", t.a);
    var p = document.createElement("p"); p.textContent = t.q + " ";
    if (D.link == null) { var a = document.createElement("a"); a.href = "confidentialite.html"; a.textContent = t.c + " →"; p.appendChild(a) }
    var w = document.createElement("div"); w.className = "dgc-b";
    [["n", 0], ["y", 1]].forEach(function (x) { var b = document.createElement("button"); b.type = "button"; b.textContent = t[x[0]]; b.onclick = function () { choose(x[1]) }; w.appendChild(b) });
    bar.appendChild(p); bar.appendChild(w); document.body.appendChild(bar);
  }
  function foot() {
    var t = T[lang()], f = document.getElementById("dgc-f");
    if (!f) {
      f = document.createElement("p"); f.id = "dgc-f"; f.className = "dgc-f";
      var pr = document.querySelector('[data-t="privacy"]'), wr = document.querySelector(".wrap");
      if (pr) pr.parentNode.insertBefore(f, pr.nextSibling); else (wr || document.body).appendChild(f);
    }
    f.textContent = "";
    if (D.link == null) { var a = document.createElement("a"); a.href = "confidentialite.html"; a.textContent = t.c; f.appendChild(a); f.appendChild(document.createTextNode(" · ")) }
    var b = document.createElement("button"); b.type = "button"; b.textContent = t.l; b.onclick = show; f.appendChild(b);
  }
  function init() {
    var st = document.createElement("style");
    st.textContent = ".dgc{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#171412;color:#fbf4e6;border-top:1px solid #2c2622;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));font:14px/1.45 Poppins,system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:center;box-shadow:0 -6px 24px rgba(0,0,0,.5)}.dgc p{margin:0;flex:1 1 260px;max-width:560px;color:#fbf4e6}.dgc a{color:#f2b33d}.dgc-b{display:flex;gap:10px;flex:0 0 auto}.dgc-b button{min-width:112px;padding:10px 14px;border-radius:10px;border:1px solid #fbf4e6;background:#fbf4e6;color:#0d0b0a;font:600 14px Poppins,system-ui,sans-serif;cursor:pointer}.dgc-f{font-size:11.5px;color:#b7ab98;margin:6px 0 0}.dgc-f a,.dgc-f button{color:inherit;text-decoration:underline;background:none;border:0;padding:0;font:inherit;cursor:pointer}@media print{.dgc,.dgc-f{display:none!important}}";
    document.head.appendChild(st); foot();
    document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-l]")) setTimeout(function () { foot(); if (bar) show() }, 0) });
    var v = get(); if (v === 1) load(); else if (v === null && D.link == null) show();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
