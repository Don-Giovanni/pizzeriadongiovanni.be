# Prove automatiche del sito (non pubblicate: la cartella _src è ignorata da GitHub Pages)
Servono prima di ogni pubblicazione che tocca dati (PRIMA REGOLA GDPR, progetto Claude «Pizzeria», regole/sito.md). Nessun dato vero: solo «Jean Exemple», servizi finti.

## Cosa serve
- Python 3 con Playwright e Chromium (`pip install playwright && playwright install chromium`).
- Il repository clonato; prima `bash _src/deploy.sh prova` (o `main`).

## test_gdpr.py: 40 controlli
`python3 _src/prove/test_gdpr.py <cartella del repository> prova/`   (per la copia del sito vero: ultimo argomento `""`)
- Apre un server locale e fa credere al browser che sia pizzeriadongiovanni.be (altrimenti Umami non parte).
- Worker, Turnstile, Umami, Photon e openrouteservice sono finti: niente esce davvero.
- Controlla: memoria vuota e nessuna richiesta esterna prima di un tocco (4 pagine), fascia con due pulsanti uguali, Umami solo dopo «Accepter», campi della visita, evento consegna solo paese e km, link «Statistiques», casella di consenso del modulo (senza spunta non parte e appare la frase con telefono ed email, con spunta invia ok:1), 12 sezioni e 18 link della Confidentialité nelle 6 lingue.
- Risultato atteso: /prova/ 40 OK; copia del sito vero 39 OK (manca solo l'etichetta «prova» di Umami, giusto così).

## test_allergeni.py
`python3 _src/prove/test_allergeni.py <cartella del repository>`
- Tocca i numeri degli allergeni della Mortadella nel menu del sito vero e controlla: pagina Allergeni aperta sul piatto, riga al centro, allergeni accesi, tutto spento dopo 10 secondi.

## test_blocco_b.py: 83 controlli (dal 15.11.2026)
`python3 _src/prove/test_blocco_b.py <cartella delle pagine>`   (es. `../prova-sito/public/prova`, oppure la cartella del repository per il sito vero)
- Indirizzo trovato ma fuori zona: frase «hors de notre zone de livraison» nelle 6 lingue, numero di telefono in un pezzo solo; «Adresse introuvable» resta quando non si trova niente.
- CAP 6530: «Thuin» al posto del quartiere; Leers-et-Fosteau e gli altri paesi invariati.
- 68 link degli allergeni con i nomi nell'etichetta; focus della tastiera dentro carrello, scelta della lingua e foto; titoli della home in ordine.
- Tabelle con didascalia nascosta e scope; Confidentialité dentro <main>; link Confidentialité e twitter:card scritti nei file.
- Carrello tra 12 e 15 km di strada: meno di 15 piatti (pizze o paste; pain pizza e dessert non contano) = riquadro rosso con la frase intera (minimo 15 pizze e conferma al telefono); oltre 15 km = «Livraison impossible : hors zone.»; 15 piatti o più E almeno 230 € di ordine (servono entrambe) = possibile solo dopo conferma al telefono, senza prezzo; ricerca fino a 15 km in linea d'aria.
