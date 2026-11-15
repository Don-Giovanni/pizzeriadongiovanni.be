# Sorgenti del sito (non pubblicate: la cartella _src è ignorata da GitHub Pages)
- Modifiche: menu/index.html (menu), site/home.tpl.html (pagina di arrivo), gen_alg.py/alg.json (allergeni), gen_liv.py (tariffe).
- Pubblicare: `bash _src/deploy.sh prova` (copia di prova PRIVATA: scrive in ../prova-sito/public/prova/, repository privato Don-Giovanni/prova-sito, poi commit e push LÌ; in questo repository la cartella /prova/ non deve più esistere) oppure `bash _src/deploy.sh main` (sito vero, solo dopo l'ok del titolare), poi git add/commit/push.
- Foto: site/img (ritocchi colore con gli script in recolor/). QR: qr/make_qr.py <campagna> <file>.
- Stato completo del sito: progetto Claude «Pizzeria», file claude/sito.md.
