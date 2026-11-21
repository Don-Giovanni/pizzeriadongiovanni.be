/* SOLO COPIA DI PROVA PRIVATA (titolare, 15.11.2026). deploy.sh NON lo mette MAI sul sito vero.
   1) Bottone «Reset» fisso in alto su tutte le pagine: a ogni tocco cancella TUTTO ciò che il sito ha salvato su questo dispositivo
      (conversazioni di Leporello, buoni di «Mon bon», scelta delle statistiche, lingua, carrello, indirizzo) e ricarica la pagina con
      ?gift=now (la scatolina esce dopo 1,5 secondi). Non tocca i cookie (quello di Cloudflare Access serve per restare nella prova).
   2) NOVITÀ EVIDENZIATE: nelle sorgenti ogni testo nuovo o cambiato sta tra {{+ e +}}. Qui diventa giallo; dentro una parte già approvata le parole cambiate DOPO l'approvazione stanno tra {{* e *}} e diventano ARANCIONI (titolare, 18.11.2026). Accanto a «Reset»
      compare «★ N» (tocco = salta alla novità seguente). Sul sito vero deploy.sh toglie i segni e si ferma se ne resta uno. */
(function () {
  if (location.pathname.indexOf("/prova/") !== 0) return;
  const bar = document.createElement("div"); bar.id = "dg-prova";
  bar.style.cssText = "position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:2147483600;display:flex;gap:4px;font:600 12px/24px system-ui,sans-serif";
  const mk = (id, bg, fg) => { const b = document.createElement("button"); b.type = "button"; b.id = id; b.style.cssText = "height:24px;padding:0 12px;border:0;border-radius:0 0 10px 10px;background:" + bg + ";color:" + fg + ";font:inherit;cursor:pointer;opacity:.95"; bar.appendChild(b); return b; };
  const r = mk("dg-reset", "#c62828", "#fff"); r.textContent = "↺ Reset";
  r.onclick = () => { try { localStorage.clear(); } catch (e) { } try { sessionStorage.clear(); } catch (e) { } location.href = location.pathname + "?gift=now"; };
  const n = mk("dg-new", "#ffe14d", "#000"); n.style.display = "none";
  const st = document.createElement("style"); st.textContent = "mark.dgn{background:#ffe14d!important;color:#000!important;border-radius:3px;padding:0 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}mark.dgn a{color:#00429d!important}mark.dgo{background:#ff9a2e!important;color:#000!important;border-radius:3px;padding:0 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}";
  document.head.appendChild(st);
  let cur = -1;
  const shown = (e) => { const c = e.getBoundingClientRect(); return c.width > 0 && c.height > 0; };
  n.onclick = () => { const m = [...document.querySelectorAll("mark.dgn")].filter(shown); if (!m.length) return; cur = (cur + 1) % m.length; m[cur].scrollIntoView({ block: "center", behavior: "smooth" }); };
  let busy = false;
  function paint() {
    if (busy) return; busy = true;
    try {
      /* gli elementi più interni il cui testo contiene un segno: lì dentro i segni diventano <mark> */
      const all = [...document.body.querySelectorAll("*")].filter((e) => !e.closest("script,style,#dg-prova") && e.tagName !== "MARK" && (e.innerHTML.indexOf("{{+") >= 0 || e.innerHTML.indexOf("{{*") >= 0));
      all.filter((e) => ![...e.children].some((c) => c.innerHTML.indexOf("{{+") >= 0 || c.innerHTML.indexOf("{{*") >= 0)).forEach((e) => {
        e.innerHTML = e.innerHTML.split("{{+").join('<mark class="dgn">').split("+}}").join("</mark>").split("{{*").join('<mark class="dgo">').split("*}}").join("</mark>");
      });
      /* 21.11.2026: segni rimasti in un testo che sta accanto a un elemento con altri segni (es. «Tous les détails :» + link, banner): si colorano nodo per nodo */
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), left = [];
      while (tw.nextNode()) { const x = tw.currentNode, v = x.nodeValue; if ((v.indexOf("{{+") >= 0 || v.indexOf("{{*") >= 0 || v.indexOf("+}}") >= 0 || v.indexOf("*}}") >= 0) && x.parentElement && !x.parentElement.closest("script,style,#dg-prova")) left.push(x); }
      left.forEach((x) => { const s = document.createElement("span"); s.innerHTML = x.nodeValue.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).split("{{+").join('<mark class="dgn">').split("+}}").join("</mark>").split("{{*").join('<mark class="dgo">').split("*}}").join("</mark>"); x.replaceWith(...s.childNodes); });
      const k = [...document.querySelectorAll("mark.dgn")].filter(shown).length;
      n.style.display = k ? "" : "none"; n.textContent = "★ " + k;
    } finally { busy = false; }
  }
  const start = () => { document.body.appendChild(bar); paint(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(paint, 120); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
