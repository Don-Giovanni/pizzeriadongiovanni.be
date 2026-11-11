// gen_kb.js <menu/index.html> <out.txt> — crea il testo pubblico che l'assistente «Assistance» legge
// (menu, prezzi, ingredienti, allergeni, supplementi, chiusure). Solo dati già pubblici sul sito.
const fs = require("fs");
const src = fs.readFileSync(process.argv[2], "utf8");
const a = src.indexOf("/* ================= dati");
const b = src.indexOf("const TX=");
const data = src.slice(a, b);
const ctx = {};
new Function("ctx", data + "\nObject.assign(ctx,{CLOSED,OPEN_EXTRA,NODELIV,TIERS,ALG,I,MENU,SUPS,PHONE});")(ctx);
const { CLOSED, OPEN_EXTRA, NODELIV, ALG, I, MENU, SUPS, PHONE } = ctx;
const eur = v => (Number.isInteger(v) ? v + ",00" : v.toFixed(2).replace(".", ",")) + " €";
const txt = v => (typeof v === "string" ? (I[v] ? I[v][0] : v) : v.fr);
const L = [];
L.push("# MENU (prix en euros, TVA comprise)");
for (const c of MENU) {
  if (c.sup) continue;
  L.push("\n## " + c.t.fr + (c.note ? " — " + c.note.fr : ""));
  for (const [n, ing, p, w, extra, ver] of c.items) {
    const keys = typeof ing === "string" && ing && ing.split(" ").every(k => I[k]) ? ing.split(" ") : null;
    const al = new Set([...(c.pz || c.pa ? [1] : []), ...(extra || [])]);
    let v = !!ver;
    if (keys) keys.forEach(k => { I[k][3].forEach(x => al.add(x)); if (I[k][4]) v = true; });
    const desc = keys ? keys.map(k => I[k][0]).join(", ") : ing ? txt(ing) : "";
    const alg = [...al].sort((x, y) => x - y).map(x => ALG.fr[x - 1]).join(", ");
    L.push(`- ${n}${w ? " (blanche)" : ""} : ${eur(p)}${desc ? " — " + desc : ""} | allergènes : ${alg || "aucun connu"}${v ? " (À VÉRIFIER : liste pas encore complète)" : ""}`);
  }
}
L.push("\n## Suppléments (sur les pizzas)");
for (const [p, list] of SUPS) L.push(`- ${p === 0 ? "gratuit" : eur(p)} : ${list.map(txt).join(", ")}`);
L.push("\n# FERMETURES EXCEPTIONNELLES");
L.push(CLOSED.length ? CLOSED.map(c => `- du ${c.from} au ${c.to}${c.note && c.note.fr ? " (" + c.note.fr + ")" : ""}`).join("\n") : "- aucune annoncée sur le site");
if (OPEN_EXTRA.length) L.push("Lundis ouverts exceptionnellement : " + OPEN_EXTRA.join(", "));
L.push("\n# SOIRS SANS LIVRAISON, EXCEPTIONNELLEMENT (pizzeria ouverte : à emporter seulement, jusqu'à 22h00)");
L.push(NODELIV.length ? NODELIV.map(d => "- le " + d).join("\n") : "- aucun annoncé sur le site");
L.push("\nTéléphone : " + PHONE);
fs.writeFileSync(process.argv[3], L.join("\n") + "\n");
console.log("kb:", L.length, "righe,", fs.statSync(process.argv[3]).size, "byte");
