#!/bin/bash
# deploy.sh main|prova  — pubblica menu + pagine (statistiche Umami solo con consenso: stats/; prova con noindex e etichetta «prova»)
# 15.11.2026: la copia di prova NON sta più in questo repository (era pubblica su /prova/): si scrive nel repository PRIVATO
# Don-Giovanni/prova-sito (cartella public/prova/, clonato accanto a questo o indicato con PROVA_DIR), protetto da Cloudflare Access.
set -e
S=$(cd "$(dirname "$0")" && pwd)
R=$(dirname "$S")
# Statistiche SOLO con consenso (15.11.2026): consent.js mostra la fascia e carica umami.js (copia ospitata sul sito) solo dopo «Accepter»
CV=$(md5sum $S/stats/consent.js | cut -c1-8); UV=$(md5sum $S/stats/umami.js | cut -c1-8)
UM='<script defer src="consent.js?v='$CV'" data-wid="8402e497-f6e1-4759-8890-e445a13ff93b" data-uv="'$UV'"></script>'
UMP='<script defer src="consent.js?v='$CV'" data-wid="8402e497-f6e1-4759-8890-e445a13ff93b" data-uv="'$UV'" data-tag="prova"></script>'
UML='<script defer src="consent.js?v='$CV'" data-link></script>'
git -C $R pull -q
if [ "$1" = main ]; then D=$R; EXTRA="$UM
"; else D=${PROVA_DIR:-$(dirname "$R")/prova-sito/public/prova}; [ -d "$D" ] || { echo "ERRORE: manca la copia di prova privata ($D). Clonare Don-Giovanni/prova-sito accanto a questo repository."; exit 1; }; EXTRA='<meta name="robots" content="noindex">
'"$UMP"'
'; fi
cp $S/stats/consent.js $S/stats/umami.js $D/
python3 $S/make_site.py $S/menu/index.html $D/menu.html "$EXTRA"; python3 $S/site/menu_page.py $D/menu.html
python3 $S/site/gen_home.py $S/menu/index.html $D/index.html "$EXTRA"; mkdir -p $D/img; cp $S/site/img/*.jpg $S/site/img/*.webp $D/img/
# SEO: titolo del menu, canonical, scheda ristorante; sul sito vero anche sitemap.xml, robots.txt, 404.html
python3 $S/seo/gen_seo.py $S/menu/index.html $D ${1:-prova}
for f in allergenes.html livraison.html; do
  if [ "$1" = main ]; then python3 - "$S/menu/$f" "$D/$f" "$UM" <<'P'
import sys;s=open(sys.argv[1]).read();s=s.replace('<meta name="description"',sys.argv[3]+'\n<meta name="description"',1).replace('id="back" href="index.html"','id="back" href="menu.html"');open(sys.argv[2],'w').write(s)
P
  else python3 - "$S/menu/$f" "$D/$f" "$UMP" <<'P'
import sys;s=open(sys.argv[1]).read();s=s.replace('<meta name="description"','<meta name="robots" content="noindex">\n'+sys.argv[3]+'\n<meta name="description"',1).replace('id="back" href="index.html"','id="back" href="menu.html"');open(sys.argv[2],'w').write(s)
P
  fi
done
# PAGINA INTERNA estimation-livraison TOLTA (titolare, 24.11.2026): non serve più, il calcolo è quello del carrello del menu
rm -f $D/estimation-livraison.html
mkdir -p $D/fonts; cp $S/menu/fonts/* $D/fonts/
cp $S/menu/logo-dark.png $S/menu/logo-light.png $S/menu/logo-mix.png $S/menu/logo-glow.png $S/menu/logo-dark.webp $S/menu/logo-light.webp $S/menu/logo-glow.webp $S/menu/favicon.ico $S/menu/icon-512.png $S/menu/apple-touch-icon.png $D/
if [ "$1" = main ]; then cp $S/menu/favicon.ico $S/qr/og-image.jpg $R/; fi
# Assistance (assistente IA): dati pubblici del menu + pulsante. Sul sito vero solo se esiste _src/assist/ONLINE (ok del titolare)
node $S/assist/gen_kb.js $S/menu/index.html $D/assistance-kb.txt
if [ "$1" != main ] || [ -f $S/assist/ONLINE ]; then
  cp $S/assist/assist.js $S/assist/confidentialite.html $D/; AV=$(md5sum $S/assist/assist.js | cut -c1-8)
  # CONFIDENTIALITÉ COL CADEAU CACHÉ (titolare, 16.11.2026): la versione con la sezione del gioco è salvata in assist/confidentialite_cadeau.html.
  # Va nella prova sempre; sul sito vero SOLO quando si pubblica il gioco (_src/gift/ONLINE). Ogni modifica della Confidentialité va fatta in TUTTI E DUE i file.
  if [ "$1" != main ] || [ -f $S/gift/ONLINE ]; then cp $S/assist/confidentialite_cadeau.html $D/confidentialite.html; fi
  for f in index.html menu.html; do python3 - "$D/$f" "$AV" <<'P'
import sys,re;p=sys.argv[1];s=open(p).read();s=re.sub(r'<script src="assist.js[^"]*" defer></script>\n','',s)
s=s.replace('</body>','<script src="assist.js?v='+sys.argv[2]+'" defer></script>\n</body>',1)
open(p,'w').write(s)
P
  done
  if [ "$1" != main ]; then sed -i 's|<meta name="description"|<meta name="robots" content="noindex">\n<meta name="description"|' $D/confidentialite.html; fi
  # MENTIONS LÉGALES (titolare, 16.11.2026): pagina in 6 lingue, come la Confidentialité (solo il link alle statistiche)
  cp $S/assist/mentions-legales.html $D/
  # CONDITIONS GÉNÉRALES DE VENTE (titolare, 18.11.2026): PDF in francese, linkato dalle Mentions légales (sezione «Conditions générales de vente»)
  cp $S/cgv/cgv.pdf $D/
  # QUI SOMMES-NOUS ? (titolare, 18.11.2026): pagina in 6 lingue (testi assist/qsn_text.py, si rigenera con assist/gen_qsn.py)
  cp $S/assist/qui-sommes-nous.html $D/
  if [ "$1" != main ]; then sed -i 's|<meta name="description"|<meta name="robots" content="noindex">\n<meta name="description"|' $D/qui-sommes-nous.html; fi
  if [ "$1" != main ]; then sed -i 's|<meta name="description"|<meta name="robots" content="noindex">\n<meta name="description"|' $D/mentions-legales.html; fi
  for f in confidentialite.html mentions-legales.html qui-sommes-nous.html; do python3 - "$D/$f" "$UML" <<'P'
import sys;p=sys.argv[1];s=open(p).read();s=s.replace('<link rel="icon"',sys.argv[2]+'\n<link rel="icon"',1);open(p,'w').write(s)
P
  done
fi
# «Cadeau caché» (buoni regalo del sito, gift.js): su /prova/ sempre, sul sito vero solo se esiste _src/gift/ONLINE (ok del titolare)
if [ "$1" != main ] || [ -f $S/gift/ONLINE ]; then
  cp $S/gift/gift.js $D/; GV=$(md5sum $S/gift/gift.js | cut -c1-8)
  for f in index.html menu.html; do python3 - "$D/$f" "$GV" <<'P'
import sys,re;p=sys.argv[1];s=open(p).read();s=re.sub(r'<script src="gift.js[^"]*" defer></script>\n','',s)
s=s.replace('</body>','<script src="gift.js?v='+sys.argv[2]+'" defer></script>\n</body>',1)
open(p,'w').write(s)
P
  done
else rm -f $D/gift.js; for f in index.html menu.html; do sed -i '/<script src="gift.js/d' $D/$f; done
fi
# TESTO FRANCESE NELL'HTML (15.11.2026): SEMPRE ULTIMO PASSO. Scrive nelle pagine il testo che JavaScript disegna (seo/prerender.py; serve Playwright + Chromium)
python3 $S/seo/prerender.py $D
# BOTTONE «RESET» (titolare, 15.11.2026): SOLO nella copia di prova privata, su tutte le pagine; MAI sul sito vero. Dopo prerender: è solo una riga <script>.
if [ "$1" != main ]; then
  cp $S/prova_reset/reset.js $D/; RV=$(md5sum $S/prova_reset/reset.js | cut -c1-8)
  for f in $D/*.html; do python3 - "$f" "$RV" <<'P'
import sys,re;p=sys.argv[1];s=open(p).read();s=re.sub(r'<script src="reset.js[^"]*" defer></script>\n','',s)
if '</body>' in s: s=s.replace('</body>','<script src="reset.js?v='+sys.argv[2]+'" defer></script>\n</body>',1);open(p,'w').write(s)
P
  done
else rm -f $D/reset.js; if grep -l 'reset.js' $D/*.html 2>/dev/null; then echo "ERRORE: reset.js in una pagina del sito vero"; exit 1; fi
  # NOVITÀ EVIDENZIATE (titolare, 15.11.2026): nelle sorgenti i testi nuovi stanno tra {{+ e +}}; nella prova diventano gialli (reset.js).
  # Sul sito vero i segni si TOLGONO da tutti i file pubblicati; se ne resta anche uno solo, non si pubblica.
  for f in $D/*.html $D/*.js $D/*.txt $D/*.xml; do [ -f "$f" ] && sed -i 's/{{+//g; s/+}}//g; s/{{\*//g; s/\*}}//g' "$f"; done
  if grep -l -e '{{+' -e '+}}' -e '{{\*' -e '\*}}' -e 'mark class="dgn"' $D/*.html $D/*.js $D/*.txt 2>/dev/null; then echo "ERRORE: segni di novità in un file del sito vero"; exit 1; fi
fi
# PDF DA SCARICARE (titolare, 16.11.2026): Confidentialité e Mentions légales nelle 6 lingue, SEMPRE ULTIMO PASSO
# (sul sito vero dopo aver tolto i segni di novità; serve Playwright + Chromium). Se fallisce, non si pubblica.
if [ -f $D/confidentialite.html ]; then python3 $S/assist/make_pdf.py $D ${1:-prova}; fi
