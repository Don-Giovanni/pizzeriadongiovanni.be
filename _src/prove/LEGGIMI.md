# Prove automatiche del sito (non pubblicate: la cartella _src è ignorata da GitHub Pages)
Servono prima di ogni pubblicazione che tocca dati (PRIMA REGOLA GDPR, progetto Claude «Pizzeria», regole/sito.md). Nessun dato vero: solo «Jean Exemple», servizi finti.

## Cosa serve
- Python 3 con Playwright e Chromium (`pip install playwright && playwright install chromium`).
- Il repository clonato; prima `bash _src/deploy.sh prova` (o `main`).

## test_gdpr.py: 39 controlli
`python3 _src/prove/test_gdpr.py <cartella del repository> prova/`   (per la copia del sito vero: ultimo argomento `""`)
- Apre un server locale e fa credere al browser che sia pizzeriadongiovanni.be (altrimenti Umami non parte).
- Worker, Turnstile, Umami, Photon e openrouteservice sono finti: niente esce davvero.
- Controlla: memoria vuota e nessuna richiesta esterna prima di un tocco (4 pagine), fascia con due pulsanti uguali, Umami solo dopo «Accepter», campi della visita, evento consegna solo paese e km, link «Statistiques», casella di consenso del modulo (senza spunta non parte, con spunta invia ok:1), 12 sezioni e 18 link della Confidentialité nelle 6 lingue.
- Risultato atteso: /prova/ 39 OK; copia del sito vero 38 OK (manca solo l'etichetta «prova» di Umami, giusto così).

## test_allergeni.py
`python3 _src/prove/test_allergeni.py <cartella del repository>`
- Tocca i numeri degli allergeni della Mortadella nel menu del sito vero e controlla: pagina Allergeni aperta sul piatto, riga al centro, allergeni accesi, tutto spento dopo 10 secondi.
