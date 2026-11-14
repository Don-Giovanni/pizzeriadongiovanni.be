/* «Cadeau caché» – pop-up dei buoni regalo del sito (pagina di arrivo e menu).
   Il Worker decide se c'è un buono adesso (max 3 al giorno, uno ogni 8 ore, momenti a caso): qui solo pop-up, immagine e «🎁 Mon bon».
   PRIVACY (titolare, 13.11.2026: rischio zero): nessun identificativo; nella memoria del browser (dg_gift) SOLO i buoni che il cliente
   salva lui con «Enregistrer». Il limite (un buono ogni 7 giorni per connessione) lo fa il Worker, che cancella tutto dopo 7 giorni.
   Chi chiude senza toccare «Enregistrer» non rivede più il buono (niente pulsante); il codice resta comunque valido nell'app. */
(function () {
  const API = (window.DG_ASSIST || {}).api || "https://assistance-dg.pizzeriadongiovannithuin.workers.dev";
  const PROVA = location.pathname.indexOf("/prova/") === 0, Q = new URLSearchParams(location.search).get("gift") || "";
  const WAIT = PROVA && Q === "now" ? 1500 : 30000;
  const TEL = "0455 11 16 77", GOLD = "#f2b33d", INK = "#fbf4e6", MUTED = "#b7ab98";
  const LS = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch (e) { } }, del(k) { try { localStorage.removeItem(k) } catch (e) { } } };
  const trk = (a) => { try { window.umami && umami.track && umami.track("cadeau-site", { azione: a }) } catch (e) { } };
  const T = {
    fr: { cumul: "Non cumulable avec d'autres offres (carte de fidélité ou autre).", used: "Une fois utilisé en pizzeria, ce bon n'est plus valable.", del: "🗑 Retirer ce bon", del2: "Toucher encore pour retirer", stock: "Dans la limite des stocks du jour. Sinon, bon valable un autre jour ou contre un article équivalent.", cash: "non échangeable contre de l'argent", beer: "Boisson alcoolisée interdite aux moins de 16 ans.", h: "Un petit cadeau caché", p: "Chaque jour, jusqu'à trois petits cadeaux se cachent au hasard sur notre site. Aujourd'hui, c'est vous qui êtes tombé dessus !", save: "📥 Enregistrer mon bon", saved: "✓ Bon enregistré", hint: "Enregistrez votre bon et montrez-le quand vous venez chercher votre commande.", tel: "Commandes par téléphone au", keep: "En touchant ce bouton, le bon reste aussi sur ce téléphone jusqu'au {v} (bouton 🎁 Mon bon), même si vous n'enregistrez pas l'image. Si vous fermez sans le toucher, il ne s'affichera plus.", kept: "✓ Votre bon est gardé ici (bouton 🎁 Mon bon).", pill: "Mon bon", mine: "Mes bons cadeaux", until: "Valable jusqu'au", take: "à emporter uniquement", close: "Fermer" },
    nl: { cumul: "Niet cumuleerbaar met andere aanbiedingen (getrouwheidskaart of andere).", used: "Eenmaal gebruikt in de pizzeria is deze bon niet meer geldig.", del: "🗑 Bon verwijderen", del2: "Tik nogmaals om te verwijderen", stock: "Zolang de dagvoorraad strekt. Anders geldig op een andere dag of voor een gelijkwaardig artikel.", cash: "niet inwisselbaar voor geld", beer: "Alcoholische drank verboden onder 16 jaar.", h: "Een klein verborgen cadeautje", p: "Elke dag verstoppen zich tot drie kleine cadeautjes op onze site. Vandaag hebt u er een gevonden!", save: "📥 Mijn bon bewaren", saved: "✓ Bon bewaard", hint: "Bewaar uw bon en toon hem wanneer u uw bestelling komt afhalen.", tel: "Bestellen per telefoon op", keep: "Door op deze knop te tikken blijft de bon ook op deze telefoon tot {v} (knop 🎁 Mijn bon), ook als u de afbeelding niet bewaart. Sluit u zonder te tikken, dan verschijnt hij niet meer.", kept: "✓ Uw bon blijft hier bewaard (knop 🎁 Mijn bon).", pill: "Mijn bon", mine: "Mijn cadeaubonnen", until: "Geldig tot", take: "alleen afhalen", close: "Sluiten" },
    en: { cumul: "Cannot be combined with other offers (loyalty card or other).", used: "Once used at the pizzeria, this voucher is no longer valid.", del: "🗑 Remove this voucher", del2: "Tap again to remove", stock: "While daily stocks last. Otherwise valid another day or for an equivalent item.", cash: "not exchangeable for cash", beer: "Alcoholic drink not allowed under 16.", h: "A little hidden gift", p: "Every day, up to three little gifts hide at random on our website. Today, you found one!", save: "📥 Save my voucher", saved: "✓ Voucher saved", hint: "Save your voucher and show it when you come to pick up your order.", tel: "Orders by phone on", keep: "By tapping this button, the voucher also stays on this phone until {v} (🎁 My voucher button), even if you don't save the image. If you close without tapping it, it won't be shown again.", kept: "✓ Your voucher is kept here (🎁 My voucher button).", pill: "My voucher", mine: "My gift vouchers", until: "Valid until", take: "takeaway only", close: "Close" },
    de: { cumul: "Nicht mit anderen Angeboten kombinierbar (Treuekarte oder andere).", used: "Nach der Einlösung in der Pizzeria ist dieser Gutschein nicht mehr gültig.", del: "🗑 Gutschein entfernen", del2: "Zum Entfernen erneut tippen", stock: "Solange der Tagesvorrat reicht. Sonst an einem anderen Tag oder für einen gleichwertigen Artikel gültig.", cash: "nicht gegen Bargeld eintauschbar", beer: "Alkoholisches Getränk verboten unter 16 Jahren.", h: "Ein kleines verstecktes Geschenk", p: "Jeden Tag verstecken sich bis zu drei kleine Geschenke zufällig auf unserer Website. Heute haben Sie eins gefunden!", save: "📥 Gutschein speichern", saved: "✓ Gutschein gespeichert", hint: "Speichern Sie Ihren Gutschein und zeigen Sie ihn, wenn Sie Ihre Bestellung abholen.", tel: "Bestellungen per Telefon unter", keep: "Wenn Sie auf diesen Knopf tippen, bleibt der Gutschein bis zum {v} auch auf diesem Telefon (Knopf 🎁 Mein Gutschein), selbst wenn Sie das Bild nicht speichern. Wenn Sie schließen, ohne zu tippen, wird er nicht mehr angezeigt.", kept: "✓ Ihr Gutschein bleibt hier gespeichert (Knopf 🎁 Mein Gutschein).", pill: "Mein Gutschein", mine: "Meine Gutscheine", until: "Gültig bis", take: "nur zum Mitnehmen", close: "Schließen" },
    it: { cumul: "Non cumulabile con altre offerte (carta fedeltà o altro).", used: "Una volta usato in pizzeria, il buono non è più valido.", del: "🗑 Togli questo buono", del2: "Tocca ancora per toglierlo", stock: "Fino a esaurimento delle scorte del giorno. Altrimenti valido un altro giorno o per un articolo equivalente.", cash: "non convertibile in denaro", beer: "Bevanda alcolica vietata ai minori di 16 anni.", h: "Un piccolo regalo nascosto", p: "Ogni giorno fino a tre piccoli regali si nascondono a caso sul nostro sito. Oggi l'hai trovato tu!", save: "📥 Salva il mio buono", saved: "✓ Buono salvato", hint: "Salva il buono e mostralo quando vieni a ritirare la tua ordinazione.", tel: "Ordini per telefono al", keep: "Toccando questo pulsante il buono resta anche su questo telefono fino al {v} (pulsante 🎁 Il mio buono), anche se non salvi l'immagine. Se chiudi senza toccarlo, non verrà più mostrato.", kept: "✓ Il buono resta qui (pulsante 🎁 Il mio buono).", pill: "Il mio buono", mine: "I miei buoni", until: "Valido fino al", take: "solo da asporto", close: "Chiudi" },
    es: { cumul: "No acumulable con otras ofertas (tarjeta de fidelidad u otras).", used: "Una vez usado en la pizzería, este vale ya no es válido.", del: "🗑 Quitar este vale", del2: "Toque otra vez para quitarlo", stock: "Hasta agotar existencias del día. Si no, válido otro día o por un artículo equivalente.", cash: "no canjeable por dinero", beer: "Bebida alcohólica prohibida a menores de 16 años.", h: "Un pequeño regalo escondido", p: "Cada día, hasta tres pequeños regalos se esconden al azar en nuestra web. ¡Hoy lo ha encontrado usted!", save: "📥 Guardar mi vale", saved: "✓ Vale guardado", hint: "Guarde su vale y muéstrelo cuando venga a recoger su pedido.", tel: "Pedidos por teléfono al", keep: "Al tocar este botón, el vale también se queda en este teléfono hasta el {v} (botón 🎁 Mi vale), aunque no guarde la imagen. Si cierra sin tocarlo, ya no se mostrará.", kept: "✓ Su vale se queda aquí (botón 🎁 Mi vale).", pill: "Mi vale", mine: "Mis vales", until: "Válido hasta el", take: "solo para llevar", close: "Cerrar" }
  };
  const lang = () => { const l = LS.get("dg_lang") || (navigator.language || "fr").slice(0, 2); return T[l] ? l : "fr" };
  const t = (k) => (T[lang()] || T.fr)[k];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const dmy = (iso) => iso.split("-").reverse().join("/");
  const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date());

  /* memoria del browser */
  if (PROVA && Q === "reset") LS.del("dg_gift");
  let M; try { M = JSON.parse(LS.get("dg_gift") || "null") } catch (e) { M = null }
  M = { bons: ((M && M.bons) || []).filter((b) => b && b.v >= today()).map((b) => ({ code: b.code, t: b.t, v: b.v, r: b.r || 0 })) };
  const save = () => { if (M.bons.length) LS.set("dg_gift", JSON.stringify(M)); else LS.del("dg_gift"); };
  save();

  /* frasi del buono (come sul tablet: buoni.md) */
  const beer = (type) => /bi[eè]re|\bbeer\b|\bbier\b|\bvin\b|\bwine\b|\bwijn\b|\bwein\b|\bvino\b|\bbirra\b|cerveza/i.test(type); /* solo se il regalo è birra o vino */
  function pizzaLine(type) {
    const g = (type.split(/=|\+|:/).slice(1).join(" ") || type).trim();
    if (!/pizza/i.test(g) || /pain pizza/i.test(g)) return "";
    const n = parseInt(g, 10);
    return n > 1 ? "Pizzas offertes : les moins chères de la commande." : "Pizza offerte : la moins chère de la commande.";
  }

  /* immagine del buono 1080 × 1350, fondo NERO PURO #000000 (richiesta del titolare) */
  let logo = null;
  function loadLogo() { return logo || (logo = new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = "logo-glow.png"; })); }
  async function render(b) {
    try { await Promise.all(['400 110px "DM Serif Display"', "600 50px Poppins", "400 30px Poppins"].map((f) => document.fonts.load(f))); } catch (e) { }
    const img = await loadLogo(), W = 1080, c = document.createElement("canvas"); let H = 1700; c.width = W; c.height = H; /* altezza finale calcolata sotto: il testo non tocca mai il piè di pagina */
    const x = c.getContext("2d"); x.fillStyle = "#000000"; x.fillRect(0, 0, W, H); x.textAlign = "center"; x.textBaseline = "alphabetic";
    let y = 50;
    if (img) { const w = 330, h = w * img.height / img.width; x.drawImage(img, (W - w) / 2, y, w, h); y += h; }
    y += 120; x.font = '400 110px "DM Serif Display", serif'; x.fillStyle = GOLD; x.fillText("Bon cadeau", W / 2, y);
    y += 62; x.font = "400 34px Poppins, sans-serif"; x.fillStyle = MUTED; x.fillText("Trouvé sur pizzeriadongiovanni.be", W / 2, y);
    x.font = "600 50px Poppins, sans-serif"; x.fillStyle = INK;
    const parts = b.t.includes("=") ? [b.t.slice(0, b.t.indexOf("=") + 1).trim(), b.t.slice(b.t.indexOf("=") + 1).trim()] : [b.t];
    const lines = []; parts.forEach((p) => { let cur = ""; p.split(" ").forEach((w) => { const s = cur ? cur + " " + w : w; if (x.measureText(s).width > 940 && cur) { lines.push(cur); cur = w; } else cur = s; }); lines.push(cur); });
    y += 40; lines.forEach((l) => { y += 64; x.fillText(l, W / 2, y); });
    /* codice in un riquadro oro, lettere spaziate */
    y += 50; const bh = 170, bw = 720, bx = (W - bw) / 2;
    x.strokeStyle = GOLD; x.lineWidth = 4; x.beginPath(); x.roundRect ? x.roundRect(bx, y, bw, bh, 28) : x.rect(bx, y, bw, bh); x.stroke();
    x.font = "600 96px Poppins, sans-serif"; const ch = b.code.split(""), sp = 12; let tw = ch.reduce((a, k) => a + x.measureText(k).width + sp, -sp);
    let cx = W / 2 - tw / 2; x.textAlign = "left"; ch.forEach((k, i) => { x.fillStyle = i < 3 ? GOLD : "#ffffff"; x.fillText(k, cx, y + bh / 2 + 34); cx += x.measureText(k).width + sp; });
    y += bh + 80; x.font = "400 40px Poppins, sans-serif"; const a1 = "Valable jusqu'au ", a2 = dmy(b.v);
    const w1 = x.measureText(a1).width; x.font = "600 40px Poppins, sans-serif"; const w2 = x.measureText(a2).width;
    let sx = W / 2 - (w1 + w2) / 2; x.font = "400 40px Poppins, sans-serif"; x.fillStyle = INK; x.fillText(a1, sx, y); x.font = "600 40px Poppins, sans-serif"; x.fillStyle = GOLD; x.fillText(a2, sx + w1, y);
    x.textAlign = "center"; x.font = "400 30px Poppins, sans-serif"; x.fillStyle = MUTED;
    y += 60; x.fillText("À emporter uniquement · non échangeable contre de l'argent", W / 2, y);
    y += 44; x.fillText("Dans la limite des stocks du jour. Sinon, bon valable", W / 2, y);
    y += 44; x.fillText("un autre jour ou contre un article équivalent.", W / 2, y);
    y += 44; x.fillText("Non cumulable avec d'autres offres", W / 2, y);
    y += 44; x.fillText("(carte de fidélité ou autre).", W / 2, y);
    const pl = pizzaLine(b.t); if (pl) { y += 44; x.fillText(pl, W / 2, y); }
    if (beer(b.t)) { y += 44; x.fillText("Boisson alcoolisée interdite aux moins de 16 ans.", W / 2, y); }
    /* in fondo: telefono e indirizzo, almeno 150 px sotto l'ultima riga (immagine più alta se serve) */
    H = Math.max(1350, y + 190); const c2 = document.createElement("canvas"); c2.width = W; c2.height = H;
    const x2 = c2.getContext("2d"); x2.fillStyle = "#000000"; x2.fillRect(0, 0, W, H); x2.drawImage(c, 0, 0); return foot(x2, c2);
  }
  function foot(x, c) {
    const W = c.width, H = c.height; let sx;
    x.font = "400 32px Poppins, sans-serif"; const f1 = "Commandes par téléphone ", f2 = TEL; const g1 = x.measureText(f1).width; x.font = "600 32px Poppins, sans-serif"; const g2 = x.measureText(f2).width;
    sx = W / 2 - (g1 + g2) / 2; x.textAlign = "left"; x.font = "400 32px Poppins, sans-serif"; x.fillStyle = INK; x.fillText(f1, sx, H - 112); x.font = "600 32px Poppins, sans-serif"; x.fillStyle = GOLD; x.fillText(f2, sx + g1, H - 112);
    x.textAlign = "center"; x.font = "400 32px Poppins, sans-serif"; x.fillStyle = INK; x.fillText("Grand'Rue 1 · 6530 Thuin", W / 2, H - 60);
    return new Promise((ok) => c.toBlob((bl) => ok(bl), "image/png"));
  }
  /* salva l'immagine: sul telefono menu di condivisione («Enregistrer l'image»), altrimenti download */
  async function store(blob, b) {
    const name = "bon-cadeau-don-giovanni-" + b.code.replace("DG-", "") + ".png", f = new File([blob], name, { type: "image/png" });
    const touch = matchMedia("(pointer:coarse)").matches;
    if (touch && navigator.canShare && navigator.canShare({ files: [f] })) {
      try { await navigator.share({ files: [f], title: "Bon cadeau Pizzeria Don Giovanni" }); return true; }
      catch (e) { if (e && e.name === "AbortError") return false; }
    }
    const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
    return true;
  }

  const css = `
.dgg{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}
.dgg>div{position:relative;background:#171412;color:#fbf4e6;border:2px solid #f2b33d;border-radius:18px;max-width:400px;width:100%;padding:20px 18px 16px;text-align:center;font-family:Poppins,system-ui,sans-serif;box-shadow:0 12px 50px rgba(0,0,0,.6);margin:auto}
.dgg-x{position:absolute;top:6px;right:8px;width:40px;height:40px;border:0;background:none;color:#b7ab98;font-size:26px;cursor:pointer}
.dgg img{width:110px;display:block;margin:0 auto 2px}
.dgg h2::before,.dgg h2::after{display:none!important;content:none!important}
.dgg h2{display:block;border:0;padding:0;background:none;text-transform:none;letter-spacing:0;margin:4px 0 8px;font:400 26px/1.15 "DM Serif Display",serif;color:#f2b33d}
.dgg p{margin:0 0 10px;font-size:15px;line-height:1.45}
.dgg-g{background:#0d0b0a;border:1px solid #2c2622;border-radius:12px;padding:12px;margin:10px 0}
.dgg-g b{display:block;font-weight:600;font-size:16px;line-height:1.35}
.dgg-c{font:600 30px/1 Poppins,sans-serif;letter-spacing:.12em;color:#fff;margin:12px 0 6px}.dgg-c span{color:#f2b33d}
.dgg-v,.dgg small{font-size:13px;color:#b7ab98;display:block;line-height:1.4}
.dgg-t{font-size:13px;color:#b7ab98;margin:0 0 12px}.dgg-t a{white-space:nowrap;color:#f2b33d;font-weight:600;text-decoration:none}
.dgg-s{width:100%;padding:13px;border:0;border-radius:12px;background:#f2b33d;color:#0d0b0a;font:600 16px Poppins,sans-serif;cursor:pointer;margin:4px 0 8px}
.dgg-s[disabled]{opacity:.85;cursor:default}
.dgg-f{width:100%;padding:11px;border:1px solid #2c2622;border-radius:12px;background:none;color:#fbf4e6;font:500 15px Poppins,sans-serif;cursor:pointer;margin-top:6px}
.dgg-pill{position:fixed;left:12px;bottom:16px;z-index:41;padding:9px 15px;border:0;border-radius:999px;background:#f2b33d;color:#0d0b0a;font:600 14px Poppins,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.5);cursor:pointer}`;
  let styled = false;
  function style() { if (styled) return; styled = true; const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); }
  function placePill(b) {
    let h = 0;
    document.querySelectorAll("body *").forEach((e) => {
      if (e === b || e.closest(".dgg") || e.closest(".dga")) return;
      const cs = getComputedStyle(e); if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden") return;
      const r = e.getBoundingClientRect();
      if (r.height > 0 && r.height < 160 && r.bottom >= innerHeight - 2 && r.width > innerWidth * 0.6) h = Math.max(h, innerHeight - r.top);
    });
    b.style.bottom = "calc(" + (h + 12) + "px + env(safe-area-inset-bottom,0px))";
  }
  function pill() {
    let p = document.querySelector(".dgg-pill");
    if (!M.bons.length) { if (p) p.remove(); return; }
    style();
    if (!p) { p = document.createElement("button"); p.className = "dgg-pill"; p.onclick = mine; document.body.appendChild(p); addEventListener("resize", () => placePill(p)); }
    p.textContent = "🎁 " + t("pill"); placePill(p); setTimeout(() => placePill(p), 1200);
  }
  const giftBox = (b) => `<div class="dgg-g"><b>${esc(b.t)}</b><div class="dgg-c"><span>DG-</span>${esc(b.code.replace(/^DG-/, ""))}</div><span class="dgg-v">${t("until")} ${dmy(b.v)} · ${t("take")} · ${t("cash")}<br>${t("stock")}<br>${t("cumul")}${beer(b.t) ? "<br>" + t("beer") : ""}</span></div>`;

  /* pop-up del buono trovato */
  function show(b) {
    style(); trk("mostrato");
    const blob = render(b); let saved = false, gone = false;
    const o = document.createElement("div"); o.className = "dgg"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
    o.innerHTML = `<div><button class="dgg-x" aria-label="${t("close")}">×</button><img src="logo-glow.png" alt="Pizzeria Don Giovanni"><h2>${t("h")} 🎁</h2><p>${t("p")}</p>${giftBox(b)}<p>${t("hint")}</p><p class="dgg-t">${t("tel")} <a href="tel:+32455111677">${TEL}</a></p><button class="dgg-s">${t("save")}</button><small>${t("keep").replace("{v}", dmy(b.v))}</small></div>`;
    document.body.appendChild(o);
    const btn = o.querySelector(".dgg-s"), small = o.querySelector("small");
    btn.onclick = async () => {
      /* il buono va in «🎁 Mon bon» appena si tocca il bottone, anche se poi l'immagine non viene salvata (titolare, 14.11) */
      if (!saved) {
        saved = true; M.bons = M.bons.filter((x) => x.code !== b.code).concat([{ code: b.code, t: b.t, v: b.v, r: Date.now() }]); save(); pill(); trk("salvato");
        small.textContent = t("kept");
        const f = document.createElement("button"); f.className = "dgg-f"; f.textContent = t("close"); f.onclick = close; btn.after(f);
      }
      await store(await blob, b);
    };
    function close() { if (!saved && !gone) { gone = true; trk("perso"); } o.remove(); }
    o.querySelector(".dgg-x").onclick = close;
  }

  /* «🎁 Mon bon»: i buoni salvati, validi */
  function mine() {
    style(); const o = document.createElement("div"); o.className = "dgg";
    o.innerHTML = `<div><button class="dgg-x" aria-label="${t("close")}">×</button><h2>${t("mine")} 🎁</h2>${M.bons.map((b, i) => giftBox(b) + `<button class="dgg-s" data-i="${i}">${t("save")}</button><small>${t("used")}</small><button class="dgg-f" data-d="${i}" style="margin:6px 0 14px">${t("del")}</button>`).join("")}<p class="dgg-t">${t("tel")} <a href="tel:+32455111677">${TEL}</a></p></div>`;
    document.body.appendChild(o);
    o.querySelector(".dgg-x").onclick = () => o.remove();
    o.onclick = (e) => { if (e.target === o) o.remove(); };
    o.querySelectorAll(".dgg-s").forEach((bt) => bt.onclick = async () => { const b = M.bons[+bt.dataset.i]; if (await store(await render(b), b)) { bt.textContent = t("saved"); } });
    /* il cliente toglie da solo un buono già usato (titolare, 14.11): primo tocco chiede conferma, il secondo lo toglie dal telefono */
    o.querySelectorAll("[data-d]").forEach((bt) => bt.onclick = () => {
      if (!bt.dataset.ok) { bt.dataset.ok = "1"; bt.textContent = t("del2"); return; }
      const b = M.bons[+bt.dataset.d]; M.bons = M.bons.filter((x) => x.code !== b.code); save(); trk("tolto"); o.remove(); pill(); if (M.bons.length) mine();
    });
  }

  /* dopo 30 secondi di visita chiede al Worker se c'è un buono adesso */
  function busy() {
    const vis = (s) => { const e = document.querySelector(s); return e && getComputedStyle(e).display !== "none" && e.offsetParent !== null; };
    return document.hidden || vis(".intro") || vis("#intro") || document.querySelector(".excpop") || document.querySelector(".dga") || document.querySelector(".dgg");
  }
  /* controllo anti-robot di Cloudflare (Turnstile), solo quando c'è davvero un buono: invisibile per le persone */
  const SITEKEY = "0x4AAAAAAF5BzSwMW34UAihL";
  function turnstile() {
    return new Promise((res, rej) => {
      const go = () => {
        const h = document.createElement("div"); h.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:96";
        document.body.appendChild(h);
        window.turnstile.render(h, { sitekey: SITEKEY, action: "cadeau", language: lang(), appearance: "interaction-only", callback: (tok) => { h.remove(); res(tok); }, "error-callback": () => { h.remove(); rej(new Error("ts")); } });
      };
      if (window.turnstile) return go();
      const sc = document.createElement("script"); sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.async = true; sc.onload = go; sc.onerror = () => rej(new Error("ts")); document.head.appendChild(sc);
    });
  }
  const post = async (path, data) => (await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })).json();
  async function ask() {
    /* se su questo telefono c'è già un buono ricevuto negli ultimi 7 giorni, non si chiede niente (stesso limite del Worker) */
    if (M.bons.some((b) => b.r && Date.now() - b.r < 7 * 86400000)) return;
    if (busy()) { setTimeout(ask, 4000); return; }
    let r; try {
      r = await post("/gift", { p: location.pathname });
      if (!r || !r.ready) return;
      r = await post("/gift/claim", { p: location.pathname, ts: await turnstile() });
    } catch (e) { return; }
    if (!r || !r.code) return;
    show(r);
  }

  function init() { pill(); setTimeout(ask, WAIT); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
