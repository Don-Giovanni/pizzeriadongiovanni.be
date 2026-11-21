"""Genera assist/qui-sommes-nous.html dai testi di qsn_text.py (titolare, 18.11.2026).
Stessa grafica di mentions-legales.html (testata, lingue, ritorno). Ogni testo nuovo tra {{+ e +}} (novità gialle nella prova).
Uso: python3 gen_qsn.py   (da dentro _src/assist)"""
import json, pathlib, re
H = pathlib.Path(__file__).resolve().parent
from qsn_text import T
ml = (H / "mentions-legales.html").read_text(encoding="utf-8")
head = ml[:ml.index("<body>")]
head = head.replace("Mentions légales · Pizzeria Don Giovanni, Thuin", "Qui sommes-nous ? · Pizzeria Don Giovanni, Thuin")
head = head.replace("Mentions légales du site de la Pizzeria Don Giovanni à Thuin.", "L'histoire de la Pizzeria Don Giovanni à Thuin, sa pâte, son four à bois et ses produits.")
head = head.replace("mentions-legales.html", "qui-sommes-nous.html")
head = head.replace("</style>", ".sign{font:400 24px/1.2 \"DM Serif Display\",serif;color:#f2b33d;margin:28px 0 0;text-align:right}\n</style>")
mark = lambda x: "\n\n".join("{{+" + y + "+}}" for y in x.split("\n\n"))  # 21.11.2026: un segno per paragrafo
data = {l: dict(back=v["back"], h=mark(v["h"]), sign=mark(v["sign"]), s=[[mark(a), mark(b)] for a, b in v["s"]]) for l, v in T.items()}
body = """<body>
<div class="wrap">
<div class="top"><a class="back" href="index.html" onclick="return goBack()">← retour</a><span class="langs" id="langs"></span></div>
<main id="c"></main>
</div>
<script>
/* Qui sommes-nous ? (18.11.2026): testi in _src/assist/qsn_text.py; si rigenera con gen_qsn.py. Fa fede il francese. */
const T=""" + json.dumps(data, ensure_ascii=False, indent=0) + """;
function goBack(){const r=document.referrer;if(r&&r.indexOf(location.origin)===0&&history.length>1){history.back();return false}location.href=r&&r.indexOf(location.origin)===0?r.split("#")[0]:"index.html";return false}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let L=new URLSearchParams(location.search).get("l")||LS.get("dg_lang")||(navigator.language||"fr").slice(0,2);if(!T[L])L="fr";
function draw(){const t=T[L];document.documentElement.lang=L;document.title=t.h.replace(/\\{\\{\\+|\\+\\}\\}/g,"")+" · Pizzeria Don Giovanni, Thuin";
 document.querySelector(".back").textContent=t.back;
 document.getElementById("langs").innerHTML=Object.keys(T).map(k=>`<button type="button" data-l="${k}" class="${k===L?"on":""}">${k.toUpperCase()}</button>`).join(" ");
 document.getElementById("c").innerHTML=`<h1>${esc(t.h)}</h1>`+t.s.map(([a,b])=>`<h2>${esc(a)}</h2><p>${esc(b).split("\\n\\n").join("</p><p>")}</p>`).join("")+`<p class="sign">${esc(t.sign)}</p>`}
document.addEventListener("click",e=>{const b=e.target.closest("[data-l]");if(b){L=b.dataset.l;LS.set("dg_lang",L);draw()}});
draw();
</script>
</body>
</html>
"""
out = H / "qui-sommes-nous.html"
out.write_text(head + body, encoding="utf-8")
print("scritto", out, len(head + body), "byte")
