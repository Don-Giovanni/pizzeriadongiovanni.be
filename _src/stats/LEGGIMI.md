# Statistiche con consenso (dal 15.11.2026)
- consent.js: fascia «Accepter / Refuser» (pulsanti uguali), link «Statistiques» in fondo alla pagina, scelta salvata nel browser (dg_stats, 6 mesi). Umami parte SOLO dopo «Accepter».
- umami.js: copia BLOCCATA dello script di Umami Cloud (https://cloud.umami.is/script.js), ospitata sul sito. Copiata il 15.11.2026, 9.246 byte,
  SHA-256 c11c9d29ac15ee26ef07059add176fd7db95acbf8e8bdb1a79796b0ffdb58f18 (uguale al 14.11). Invia a https://gateway.umami.is/api/send.
  Per aggiornarla: riscaricarla, rileggere cosa invia e cosa scrive nel telefono, annotare il nuovo SHA-256 (regole/sito.md, punto 12).
- deploy.sh mette consent.js in index, menu, livraison, allergenes (con Umami) e in confidentialite (solo il link, data-link).
  Su /prova/ le visite hanno l'etichetta «prova» (data-tag).
