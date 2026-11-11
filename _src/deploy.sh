#!/bin/bash
# deploy.sh main|prova  — pubblica menu + pagine (main con statistiche Umami, prova senza e noindex)
set -e
S=$(cd "$(dirname "$0")" && pwd)
R=$(dirname "$S")
UM='<script defer src="https://cloud.umami.is/script.js" data-website-id="8402e497-f6e1-4759-8890-e445a13ff93b" data-domains="pizzeriadongiovanni.be"></script>'
git -C $R pull -q
if [ "$1" = main ]; then D=$R; EXTRA="$UM
"; else D=$R/prova; EXTRA='<meta name="robots" content="noindex">
'; fi
python3 $S/make_site.py $S/menu/index.html $D/menu.html "$EXTRA"; python3 $S/site/menu_page.py $D/menu.html
python3 $S/site/gen_home.py $S/menu/index.html $D/index.html "$EXTRA"; mkdir -p $D/img; cp $S/site/img/*.jpg $D/img/
# SEO: titolo del menu, canonical, scheda ristorante; sul sito vero anche sitemap.xml, robots.txt, 404.html
python3 $S/seo/gen_seo.py $S/menu/index.html $D ${1:-prova}
for f in allergenes.html livraison.html; do
  if [ "$1" = main ]; then python3 - "$S/menu/$f" "$D/$f" "$UM" <<'P'
import sys;s=open(sys.argv[1]).read();s=s.replace('<meta name="description"',sys.argv[3]+'\n<meta name="description"',1).replace('id="back" href="index.html"','id="back" href="menu.html"');open(sys.argv[2],'w').write(s)
P
  else python3 - "$S/menu/$f" "$D/$f" <<'P'
import sys;s=open(sys.argv[1]).read();s=s.replace('<meta name="description"','<meta name="robots" content="noindex">\n<meta name="description"',1).replace('id="back" href="index.html"','id="back" href="menu.html"');open(sys.argv[2],'w').write(s)
P
  fi
done
cp $S/menu/estimation-livraison.html $D/
mkdir -p $D/fonts; cp $S/menu/fonts/* $D/fonts/
cp $S/menu/logo-dark.png $S/menu/logo-light.png $S/menu/logo-mix.png $S/menu/logo-glow.png $S/menu/favicon.ico $S/menu/icon-512.png $S/menu/apple-touch-icon.png $D/
if [ "$1" = main ]; then cp $S/menu/favicon.ico $S/qr/og-image.jpg $R/; fi
# Assistance (assistente IA): dati pubblici del menu + pulsante. Sul sito vero solo se esiste _src/assist/ONLINE (ok del titolare)
node $S/assist/gen_kb.js $S/menu/index.html $D/assistance-kb.txt
if [ "$1" != main ] || [ -f $S/assist/ONLINE ]; then
  cp $S/assist/assist.js $S/assist/confidentialite.html $D/; AV=$(md5sum $S/assist/assist.js | cut -c1-8)
  for f in index.html menu.html; do python3 - "$D/$f" "$AV" <<'P'
import sys,re;p=sys.argv[1];s=open(p).read();s=re.sub(r'<script src="assist.js[^"]*" defer></script>\n','',s)
s=s.replace('</body>','<script src="assist.js?v='+sys.argv[2]+'" defer></script>\n</body>',1)
open(p,'w').write(s)
P
  done
  if [ "$1" != main ]; then sed -i 's|<meta name="description"|<meta name="robots" content="noindex">\n<meta name="description"|' $D/confidentialite.html; fi
fi
