# Cadeau caché (gift.js)
Pop-up dei buoni regalo del sito (idea del titolare, 13.11.2026). Il «cervello» è nel Worker (repository privato leporello-worker, gift.js e gifts.json).
- deploy.sh lo mette su /prova/ sempre; sul sito vero solo se esiste `_src/gift/ONLINE` (da creare solo con l'ok del titolare).
- Prove su /prova/: `?gift=now` (pop-up dopo 1,5 s invece di 30), `?gift=reset` (cancella la memoria del buono sul dispositivo).
- Umami: evento «cadeau-site» (azione mostrato / salvato / perso).
