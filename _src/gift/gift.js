/* «Cadeau caché» – pop-up dei buoni regalo del sito (pagina di arrivo e menu).
   Il Worker decide se c'è un buono adesso (max 3 al giorno, uno ogni 8 ore, momenti a caso): qui solo pop-up, immagine e «🎁 Mon bon».
   PRIVACY (titolare, 13.11.2026: rischio zero): nessun identificativo; nella memoria del browser (dg_gift) SOLO i buoni che il cliente
   salva lui con «Enregistrer». Il limite (un buono ogni 7 giorni per connessione) lo fa il Worker, che cancella tutto dopo 7 giorni.
   Chi chiude senza toccare «Enregistrer» non rivede più il buono (niente pulsante); il codice resta comunque valido nell'app.
   SCATOLINA CHE FLUTTUA (titolare, 15.11.2026): dopo 30 secondi il sito fa al Worker una sola DOMANDA «c'è un regalo adesso?» (sì o no:
   non manda niente del visitatore e il Worker non usa la connessione). Se «sì», una scatolina 🎁 gira per la pagina circa 8 secondi
   (piano, accelera, rallenta). Solo se il visitatore la TOCCA partono l'anti-robot (Turnstile) e la consegna del codice.
   Se non la tocca sparisce senza messaggi e il regalo passa al visitatore seguente. */
(function () {
  const API = (window.DG_ASSIST || {}).api || "https://assistance-dg.pizzeriadongiovannithuin.workers.dev";
  const PROVA = location.pathname.indexOf("/prova/") === 0, Q = new URLSearchParams(location.search).get("gift") || "";
  const WAIT = PROVA && Q === "now" ? 1500 : 30000;
  /* gioco della scatolina: durata e velocità (px al secondo). Nella prova si regolano dall'indirizzo: &gs=secondi &gv=velocità massima */
  const QN = (k, d, a, z) => { const v = PROVA ? parseFloat(new URLSearchParams(location.search).get(k)) : NaN; return v >= a && v <= z ? v : d; };
  /* 15.11 sera (titolare, prove dal telefono): 10 secondi; parte già svelta (prima partiva quasi ferma: si prendeva in mezzo secondo),
     accelera fino a 650 e rallenta (400-650, titolare 22:30). Era 50-230 in 8 secondi, poi 90-360, poi 300-650.
     Movimento più brusco (22:30): ogni mezzo secondo circa cambia direzione di colpo, con una curva stretta ma arrotondata e un piccolo scatto. */
  const GAME_MS = QN("gs", 10, 3, 30) * 1000, V_MAX = QN("gv", 650, 60, 900), V_MIN = Math.min(V_MAX, QN("gm", 400, 30, 900)), BOX = 68;
  const TEL = "0455 11 16 77", GOLD = "#f2b33d", INK = "#fbf4e6", MUTED = "#b7ab98";
  const LS = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch (e) { } }, del(k) { try { localStorage.removeItem(k) } catch (e) { } } };
  const trk = (a) => { try { window.umami && umami.track && umami.track("cadeau-site", { azione: a }) } catch (e) { } };
  const T = {
    fr: { h2: "Bien attrapé !", had: "Vous avez déjà reçu un cadeau cette semaine. Celui-ci attend quelqu'un d'autre !", gone: "Oups, ce cadeau vient de filer. Il se recachera bientôt !", grab: "Attraper le cadeau", wait: "Un instant…", cumul: "Non cumulable avec d'autres offres (carte de fidélité ou autre).", used: "Une fois utilisé en pizzeria, ce bon n'est plus valable.", del: "🗑 Retirer ce bon", del2: "Toucher encore pour retirer", stock: "Dans la limite des stocks du jour. Sinon, bon valable un autre jour ou contre un article équivalent.", cash: "non échangeable contre de l'argent", h: "Un petit cadeau caché", p: "Chaque jour, jusqu'à {{*six*}} petits cadeaux se cachent au hasard sur notre site. Aujourd'hui, {{*vous en avez trouvé un*}} !", save: "📥 Enregistrer mon bon", saved: "✓ Bon enregistré", hint: "Enregistrez votre bon et montrez-le quand vous venez chercher votre commande.", tel: "Commandes par téléphone au", keep: "En touchant ce bouton, le bon reste aussi sur ce téléphone jusqu'au {v} (bouton 🎁 Mon bon), même si vous n'enregistrez pas l'image. Si vous fermez sans le toucher, il ne s'affichera plus.", kept: "✓ Votre bon est gardé ici (bouton 🎁 Mon bon).", pill: "Mon bon", mine: "Mes bons cadeaux", until: "Valable jusqu'au", take: "à emporter uniquement", close: "Fermer" },
    nl: { h2: "Goed gevangen!", had: "U hebt deze week al een cadeautje gekregen. Dit cadeautje wacht op iemand anders!", gone: "Oeps, dit cadeautje is net ontsnapt. Het verstopt zich binnenkort opnieuw!", grab: "Het cadeautje vangen", wait: "Een ogenblik…", cumul: "Niet cumuleerbaar met andere aanbiedingen (getrouwheidskaart of andere).", used: "Eenmaal gebruikt in de pizzeria is deze bon niet meer geldig.", del: "🗑 Bon verwijderen", del2: "Tik nogmaals om te verwijderen", stock: "Zolang de dagvoorraad strekt. Anders geldig op een andere dag of voor een gelijkwaardig artikel.", cash: "niet inwisselbaar voor geld", h: "Een klein verborgen cadeautje", p: "{{*Elke dag verstoppen zich tot zes kleine cadeautjes op onze website. Vandaag hebt u er eentje gevonden!*}}", save: "📥 Mijn bon bewaren", saved: "✓ Bon bewaard", hint: "Bewaar uw bon en toon hem wanneer u uw bestelling komt afhalen.", tel: "Bestellen per telefoon op", keep: "Door op deze knop te tikken blijft de bon ook op deze telefoon tot {v} (knop 🎁 Mijn bon), ook als u de afbeelding niet bewaart. Sluit u zonder te tikken, dan verschijnt hij niet meer.", kept: "✓ Uw bon blijft hier bewaard (knop 🎁 Mijn bon).", pill: "Mijn bon", mine: "Mijn cadeaubonnen", until: "Geldig tot", take: "alleen afhalen", close: "Sluiten" },
    en: { h2: "Well caught!", had: "You have already received a gift this week. This one is waiting for someone else!", gone: "Oops, this gift just slipped away. It will hide again soon!", grab: "Catch the gift", wait: "One moment…", cumul: "Cannot be combined with other offers (loyalty card or other).", used: "Once used at the pizzeria, this voucher is no longer valid.", del: "🗑 Remove this voucher", del2: "Tap again to remove", stock: "While daily stocks last. Otherwise valid another day or for an equivalent item.", cash: "not exchangeable for cash", h: "A little hidden gift", p: "{{*Every day, up to six little gifts are hidden at random on our website – and today, you found one!*}}", save: "📥 Save my voucher", saved: "✓ Voucher saved", hint: "Save your voucher and show it when you come to pick up your order.", tel: "Orders by phone on", keep: "By tapping this button, the voucher also stays on this phone until {v} (🎁 My voucher button), even if you don't save the image. If you close without tapping it, it won't be shown again.", kept: "✓ Your voucher is kept here (🎁 My voucher button).", pill: "My voucher", mine: "My gift vouchers", until: "Valid until", take: "takeaway only", close: "Close" },
    de: { h2: "Gut gefangen!", had: "Sie haben diese Woche schon ein Geschenk erhalten. Dieses wartet auf jemand anderen!", gone: "Hoppla, dieses Geschenk ist gerade entwischt. Es versteckt sich bald wieder!", grab: "Das Geschenk fangen", wait: "Einen Moment…", cumul: "Nicht mit anderen Angeboten kombinierbar (Treuekarte oder andere).", used: "Nach der Einlösung in der Pizzeria ist dieser Gutschein nicht mehr gültig.", del: "🗑 Gutschein entfernen", del2: "Zum Entfernen erneut tippen", stock: "Solange der Tagesvorrat reicht. Sonst an einem anderen Tag oder für einen gleichwertigen Artikel gültig.", cash: "nicht gegen Bargeld eintauschbar", h: "Ein kleines verstecktes Geschenk", p: "{{*Jeden Tag verstecken sich bis zu sechs kleine Geschenke auf unserer Website. Heute haben Sie eines erwischt!*}}", save: "📥 Gutschein speichern", saved: "✓ Gutschein gespeichert", hint: "Speichern Sie Ihren Gutschein und zeigen Sie ihn, wenn Sie Ihre Bestellung abholen.", tel: "Bestellungen per Telefon unter", keep: "Wenn Sie auf diesen Knopf tippen, bleibt der Gutschein bis zum {v} auch auf diesem Telefon (Knopf 🎁 Mein Gutschein), selbst wenn Sie das Bild nicht speichern. Wenn Sie schließen, ohne zu tippen, wird er nicht mehr angezeigt.", kept: "✓ Ihr Gutschein bleibt hier gespeichert (Knopf 🎁 Mein Gutschein).", pill: "Mein Gutschein", mine: "Meine Gutscheine", until: "Gültig bis", take: "nur zum Mitnehmen", close: "Schließen" },
    it: { h2: "{{*Preso al volo!*}}", had: "{{*Un regalo è già arrivato qui questa settimana. Questo aspetta qualcun altro!*}}", gone: "Ops, questo regalo è appena scappato. Si nasconderà di nuovo presto!", grab: "{{*Acchiappare il regalo*}}", wait: "Un attimo…", cumul: "Non cumulabile con altre offerte (carta fedeltà o altro).", used: "Una volta usato in pizzeria, il buono non è più valido.", del: "{{*🗑 Togliere questo buono*}}", del2: "{{*Toccare ancora per toglierlo*}}", stock: "Fino a esaurimento delle scorte del giorno. Altrimenti valido un altro giorno o per un articolo equivalente.", cash: "non convertibile in denaro", h: "Un piccolo regalo nascosto", p: "{{*Ogni giorno sul nostro sito si nascondono a caso fino a sei piccoli regali. Eccone uno!*}}", save: "📥 Salva il mio buono", saved: "✓ Buono salvato", hint: "{{*Il buono si salva e si mostra al ritiro dell'ordinazione.*}}", tel: "Ordini per telefono al", keep: "{{*Con questo pulsante il buono resta anche su questo telefono fino al {v} (pulsante 🎁 Il mio buono), anche senza salvare l'immagine. Chiudendo senza toccarlo, non verrà più mostrato.*}}", kept: "✓ Il buono resta qui (pulsante 🎁 Il mio buono).", pill: "Il mio buono", mine: "I miei buoni", until: "Valido fino al", take: "solo da asporto", close: "Chiudi" },
    es: { h2: "{{*¡Atrapado!*}}", had: "Ya ha recibido un regalo esta semana. ¡Este espera a otra persona!", gone: "¡Uy, este regalo se acaba de escapar! Pronto volverá a esconderse.", grab: "Atrapar el regalo", wait: "Un momento…", cumul: "No acumulable con otras ofertas (tarjeta de fidelidad u otras).", used: "Una vez usado en la pizzería, este vale ya no es válido.", del: "🗑 Quitar este vale", del2: "Toque otra vez para quitarlo", stock: "Hasta agotar existencias del día. Si no, válido otro día o por un artículo equivalente.", cash: "no canjeable por dinero", h: "Un pequeño regalo escondido", p: "{{*Cada día, hasta seis pequeños regalos se esconden al azar en nuestra web. ¡Hoy le ha tocado a usted!*}}", save: "📥 Guardar mi vale", saved: "✓ Vale guardado", hint: "Guarde su vale y muéstrelo cuando venga a recoger su pedido.", tel: "Pedidos por teléfono al", keep: "Al tocar este botón, el vale también se queda en este teléfono hasta el {v} (botón 🎁 Mi vale), aunque no guarde la imagen. Si cierra sin tocarlo, ya no se mostrará.", kept: "✓ Su vale se queda aquí (botón 🎁 Mi vale).", pill: "Mi vale", mine: "Mis vales", until: "Válido hasta el", take: "solo para llevar", close: "Cerrar" }
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
  const disc = (type) => /\d\s*€[^=]*?(réduction|remise)|(réduction|remise)[^=]*?\d\s*€/i.test(type); /* sconto in euro: la frase delle scorte non serve */
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
    if (!disc(b.t)) {
      y += 44; x.fillText("Dans la limite des stocks du jour. Sinon, bon valable", W / 2, y);
      y += 44; x.fillText("un autre jour ou contre un article équivalent.", W / 2, y);
    }
    y += 44; x.fillText("Non cumulable avec d'autres offres", W / 2, y);
    y += 44; x.fillText("(carte de fidélité ou autre).", W / 2, y);
    const pl = pizzaLine(b.t); if (pl) { y += 44; x.fillText(pl, W / 2, y); }
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
.dgg-pill{position:fixed;left:12px;bottom:16px;z-index:41;padding:9px 15px;border:0;border-radius:999px;background:#f2b33d;color:#0d0b0a;font:600 14px Poppins,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.5);cursor:pointer}
.dgg-b{position:fixed;left:0;top:0;z-index:60;width:68px;height:68px;padding:0;border:2px solid #f2b33d;border-radius:50%;background:#171412;font-size:36px;line-height:1;cursor:pointer;box-shadow:0 0 0 6px rgba(242,179,61,.18),0 8px 26px rgba(0,0,0,.55);touch-action:none;-webkit-tap-highlight-color:transparent;will-change:transform;transition:opacity .35s}
.dgg-b.out{opacity:0;pointer-events:none}
.dgg-veil{position:fixed;inset:0;z-index:59;overflow:hidden;touch-action:none;transition:opacity .3s;-webkit-tap-highlight-color:transparent}
.dgg-veil.off{opacity:0}
.dgg-veil i{position:absolute;inset:0;background:rgba(0,0,0,.4);transform:translateY(-101%);transition:transform 1.3s cubic-bezier(.45,.05,.35,1)}
.dgg-veil.on i{transform:none}
.dgg-veil span{position:absolute;left:0;right:0;top:calc(34px + env(safe-area-inset-top,0px));text-align:center;color:#fbf4e6;font:600 17px Poppins,system-ui,sans-serif;text-shadow:0 2px 8px #000;pointer-events:none;opacity:0;transition:opacity .35s}
.dgg-veil.txt span{opacity:1}
.dgg-b b{display:block;animation:dggpop .5s cubic-bezier(.2,1.6,.4,1) both}
@keyframes dggpop{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.25) rotate(8deg)}100%{transform:none}}
@media (prefers-reduced-motion:reduce){.dgg-veil i{transition:none}.dgg-b b{animation:none}}
.dgg-veil button{position:absolute;right:10px;top:calc(22px + env(safe-area-inset-top,0px));width:44px;height:44px;border:0;border-radius:50%;background:rgba(23,20,18,.85);color:#fbf4e6;font-size:24px;line-height:1;cursor:pointer}
.dgg-b.got{border-color:#fbf4e6;box-shadow:0 0 0 10px rgba(242,179,61,.35),0 8px 26px rgba(0,0,0,.55)}
.dgg-n p{font-size:16px;margin:14px 6px 6px}`;
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
  const giftBox = (b) => `<div class="dgg-g"><b>${esc(b.t)}</b><div class="dgg-c"><span>DG-</span>${esc(b.code.replace(/^DG-/, ""))}</div><span class="dgg-v">${t("until")} ${dmy(b.v)} · ${t("take")} · ${t("cash")}<br>${disc(b.t) ? "" : t("stock") + "<br>"}${t("cumul")}</span></div>`;

  /* pop-up del buono trovato */
  function show(b) {
    style(); trk("mostrato");
    const blob = render(b); let saved = false, gone = false;
    const o = document.createElement("div"); o.className = "dgg"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
    o.innerHTML = `<div><button class="dgg-x" aria-label="${t("close")}">×</button><img src="logo-glow.png" alt="Pizzeria Don Giovanni"><h2>${t(Math.random() < 0.5 ? "h" : "h2")} 🎁</h2><p>${t("p")}</p>${giftBox(b)}<p>${t("hint")}</p><p class="dgg-t">${t("tel")} <a href="tel:+32455111677">${TEL}</a></p><button class="dgg-s">${t("save")}</button><small>${t("keep").replace("{v}", dmy(b.v))}</small></div>`;
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

  /* dopo 30 secondi di visita chiede al Worker se c'è un buono adesso; mai sopra una finestra aperta (carrello, Leporello, pop-up) */
  function busy() {
    const shown = (e) => { if (!e) return false; const c = getComputedStyle(e); if (c.display === "none" || c.visibility === "hidden") return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    /* «.dgc» = fascia del consenso alle statistiche: finché è aperta niente scatolina (nessun tocco per sbaglio su «Accepter») */
    return document.hidden || [...document.querySelectorAll(".intro,#intro,.sheet,.modal,.lb,.excpop,.dga,.dgg,.dgc")].some(shown);
  }
  /* piccolo messaggio gentile (stessa finestra dei buoni) */
  function note(txt) {
    style(); const o = document.createElement("div"); o.className = "dgg dgg-n"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
    o.innerHTML = `<div><button class="dgg-x" aria-label="${t("close")}">×</button><p>🎁 ${esc(txt)}</p><button class="dgg-f">${t("close")}</button></div>`;
    document.body.appendChild(o);
    const close = () => o.remove(); o.querySelector(".dgg-x").onclick = close; o.querySelector(".dgg-f").onclick = close; o.onclick = (e) => { if (e.target === o) close(); };
  }
  /* LA SCATOLINA: gira per la pagina GAME_MS millisecondi (piano, accelera, rallenta) e rimbalza sui bordi; resta lontana dall'alto e dal basso
     (barre, «Mon bon», carrello). Risponde: true se è stata toccata, false se è sfuggita. Con le animazioni spente nel telefono resta ferma. */
  function chase() {
    return new Promise((done) => {
      style(); trk("scatolina");
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const b = document.createElement("button"); b.className = "dgg-b"; b.type = "button"; b.innerHTML = "<b>🎁</b>"; b.setAttribute("aria-label", t("grab"));
      const area = () => ({ x0: 8, y0: 76, x1: Math.max(9, innerWidth - BOX - 8), y1: Math.max(77, innerHeight - BOX - 110) });
      let A = area(), x = A.x0 + Math.random() * (A.x1 - A.x0), y = A.y0 + Math.random() * (A.y1 - A.y0);
      if (still) { x = A.x1 - 8; y = (A.y0 + A.y1) / 2; }
      let ang = Math.random() * Math.PI * 2, t0 = 0, last = 0, end = false, tgt = ang, turn = 0, burst = 1;
      const put = () => { b.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)"; };
      /* VELO (titolare, 15.11 22:38): durante il gioco la pagina sotto non si può toccare né scorrere (un tocco mancato non apre
         più il menu o il telefono); sparisce con la scatolina. Chi non vuole giocare lo chiude con la ✕ (il regalo passa al prossimo). */
      const veil = document.createElement("div"); veil.className = "dgg-veil";
      veil.innerHTML = `<i></i><span>${esc(t("grab"))} 🎁</span><button type="button" aria-label="${t("close")}">×</button>`;
      const block = (e) => { if (e.cancelable) e.preventDefault(); };
      veil.addEventListener("touchmove", block, { passive: false }); veil.addEventListener("wheel", block, { passive: false });
      const unveil = () => { veil.classList.add("off"); setTimeout(() => veil.remove(), 320); };
      b.unveil = unveil;
      const stop = (got) => { if (end) return; end = true; if (!got) unveil(); if (got) { b.classList.add("got"); b.disabled = true; b.setAttribute("aria-label", t("wait")); } else { b.classList.add("out"); setTimeout(() => b.remove(), 400); } done(got ? b : null); };
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); stop(true); });
      b.addEventListener("click", () => stop(true)); /* tastiera e lettori di schermo */
      veil.querySelector("button").onclick = () => stop(false);
      /* ANIMAZIONE (titolare, 22:55): la pagina si blocca subito; il velo (40 %) scende piano dall'alto; quando è tutto giù compare
         la scritta, poi la scatolina «salta fuori» e solo allora partono i 10 secondi del gioco */
      const DOWN = still ? 0 : 1350, TXT = still ? 0 : 450;
      put(); document.body.appendChild(veil); requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add("on")));
      setTimeout(() => { if (!end) veil.classList.add("txt"); }, DOWN);
      setTimeout(() => { if (end) return; document.body.appendChild(b); requestAnimationFrame(step); }, DOWN + TXT);
      function step(now) {
        if (end) return;
        if (!t0) { t0 = now; last = now; }
        const k = (now - t0) / GAME_MS;
        if (k >= 1 || busy()) return stop(false);
        const dt = Math.min(50, now - last) / 1000; last = now;
        if (!still) {
          A = area();
          const v = V_MIN + (V_MAX - V_MIN) * Math.pow(Math.sin(Math.PI * k), 2);
          /* cambio di direzione improvviso ogni 0,4-0,9 secondi: da 60 a 140 gradi, a destra o a sinistra, con un piccolo scatto */
          if (now >= turn) { tgt = ang + (Math.random() < 0.5 ? -1 : 1) * (1.05 + Math.random() * 1.4); turn = now + 400 + Math.random() * 500; burst = 1.3; }
          const d = tgt - ang; ang += Math.sign(d) * Math.min(Math.abs(d), 10 * dt); /* curva stretta ma arrotondata */
          burst = 1 + (burst - 1) * Math.pow(0.03, dt);
          ang += Math.sin(now / 370) * 0.8 * dt; tgt += Math.sin(now / 370) * 0.8 * dt; /* leggera ondulazione */
          x += Math.cos(ang) * v * burst * dt; y += Math.sin(ang) * v * burst * dt;
          if (x < A.x0) { x = A.x0; ang = Math.PI - ang; tgt = ang; } else if (x > A.x1) { x = A.x1; ang = Math.PI - ang; tgt = ang; }
          if (y < A.y0) { y = A.y0; ang = -ang; tgt = ang; } else if (y > A.y1) { y = A.y1; ang = -ang; tgt = ang; }
          put();
        }
        requestAnimationFrame(step);
      }
    });
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
    /* DOMANDA sì/no: non manda niente del visitatore (solo la pagina, per riconoscere la copia di prova) */
    let r; try { r = await post("/gift", { p: location.pathname }); } catch (e) { return; }
    if (!r || !r.ready || !r.k || busy()) return;
    /* la scatolina: se nessuno la tocca finisce qui, senza altre richieste (il Worker libera il regalo da solo dopo un minuto) */
    const box = await chase();
    if (!box) { trk("sfuggita"); return; }
    trk("presa");
    /* solo dopo il tocco: anti-robot e consegna del codice */
    let g = null; try { g = await post("/gift/claim", { p: location.pathname, k: r.k, ts: await turnstile() }); } catch (e) { }
    box.remove(); box.unveil();
    if (g && g.code) return show(g);
    note(t(g && g.had ? "had" : "gone"));
  }

  function init() { pill(); setTimeout(ask, WAIT); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
