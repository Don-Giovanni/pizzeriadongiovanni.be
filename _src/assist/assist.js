/* «Assistance» – pulsante e chat del sito Pizzeria Don Giovanni. Nessun dato salvato (solo blocco 1 h se fuori tema). */
(function () {
  const W = window.DG_ASSIST || {};
  const API = W.api || "https://assistance-dg.pizzeriadongiovannithuin.workers.dev";
  const SITEKEY = W.sitekey || "0x4AAAAAAF5BzSwMW34UAihL";
  const PAGE = location.pathname.indexOf("/prova/") === 0 ? "prova" : "main";
  const TEL = "0455 11 16 77", TELH = "tel:+32455111677";
  const LS = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch (e) { } } };
  /* 14.11 (titolare): SOLO su /prova/, per le prove: ?assist=reset azzera conto dei messaggi, blocchi, «richiesta già inviata» e conversazione */
  if (PAGE === "prova" && /[?&]assist=reset(&|$)/.test(location.search)) {
    try { ["dg_assist_n", "dg_assist_block", "dg_assist_blockn", "dg_assist_sent", "dg_assist_chat"].forEach(k => localStorage.removeItem(k)) } catch (e) { }
    try { history.replaceState(null, "", location.pathname) } catch (e) { }
    const show = () => { const d = document.createElement("div"); d.textContent = "✅ Leporello : compteur remis à zéro"; d.style.cssText = "position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:99;background:#1f7a3a;color:#fff;padding:10px 16px;border-radius:10px;font:600 15px system-ui,sans-serif"; document.body.appendChild(d); setTimeout(() => d.remove(), 4000) };
    if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
  }
  /* 14.11 (titolare): se il cliente scrive in un'altra lingua, anche la finestra della chat (titolo, avviso, pulsanti, campo) passa a quella lingua */
  let chatL = null;
  let reg = null; /* 14.11 (titolare): "tu" o "vous" come l'ultimo messaggio del cliente (lo dice il Worker); null = Lei / vous */
  const lang = () => { if (chatL && T[chatL]) return chatL; const l = LS.get("dg_lang") || (navigator.language || "fr").slice(0, 2); return T[l] ? l : "fr" };
  const T = {
    fr: { pnote: "Note personnelle (facultatif, 300 caractères max.)", ai: "Agent IA", big: "Agrandir", small: "Réduire", sens: "Réponses automatiques, des erreurs sont possibles. Ne partagez pas de données sensibles.", priv: "Confidentialité", fnote: "Vos coordonnées servent à répondre à votre demande. Votre conversation avec l'assistant est jointe à la demande.", fok: "J'accepte que ma conversation soit transmise à la pizzeria, avec les informations de santé (allergies…) qu'elle peut contenir.", btn: "Assistance", hello: "Bonjour ! Je suis Leporello, l'assistant de la Pizzeria Don Giovanni. En quoi puis-je vous aider ?", q: ["Menu et prix", "Livraison chez moi", "Allergènes", "Horaires et adresse", "Commande pour une fête / un groupe"], ph: "Votre message…", send: "Envoyer", clr: "Effacer le chat", clrOk: "Confirmer ?", clrT: "Effacer la conversation", warn5: "Limite presque atteinte : il vous reste 5 messages.", prepAsk: "Voulez-vous que je prépare une demande pour la pizzeria ?", prepYes: "Oui, préparer la demande", prepNo: "Non, continuer", prepMsg: "Oui, une demande pour la pizzeria, merci.", noSend: "Ne pas envoyer", closed: "Merci. La conversation est fermée.", close: "Fermer", call: "Appelez le " + TEL, down: "L'assistant n'est pas disponible pour le moment. Appelez-nous :", wait: "…", ended: "La conversation est terminée. Rouvrez l'assistant pour recommencer.", idle: "Conversation fermée après 10 minutes sans message.", off2: "Encore une question hors sujet et la conversation sera fermée.", blocked: "L'assistant est indisponible pour l'instant. Pour la pizzeria, appelez le " + TEL + ".", askReq: "Cela vous convient ? Vous pouvez envoyer la demande telle quelle ou ajouter des détails.", sendReq: "Envoyer la demande", addDet: "Ajouter des détails", cancel: "Annuler", name: "Nom et prénom", phone: "Téléphone (facultatif, si vous souhaitez être rappelé)", email: "E-mail", getCode: "Recevoir le code par e-mail", codeSent: "Code envoyé à", code: "Code à 6 chiffres", confirm: "Confirmer et envoyer", sent: "Merci ! Votre demande{n} est envoyée. Vous recevez une copie par e-mail. La pizzeria vous répond le plus vite possible, en général dans les 72 heures. Pour ajouter quelque chose, répondez simplement à l'e-mail reçu.", added: "Merci ! Votre message a été ajouté à votre demande en cours{n}. Vous recevez une confirmation par e-mail. La pizzeria vous répond le plus vite possible, en général dans les 72 heures. Pour ajouter quelque chose, répondez simplement à l'e-mail reçu.", errEmail: "Adresse e-mail non valable.", errPhone: "Numéro de téléphone non valable.", errCode: "Code incorrect.", errExp: "Code expiré, demandez-en un nouveau.", err: "Une erreur est survenue. Réessayez ou appelez le " + TEL + ".", robot: "Vérification…", note: "Réponses simples à vos questions sur la pizzeria.", limit: "Vous avez atteint la limite de 20 messages en 24 heures. Pour toute question, appelez la pizzeria." },
    nl: { pnote: "Persoonlijke opmerking (optioneel, max. 300 tekens)", ai: "AI-agent", big: "Vergroten", small: "Verkleinen", sens: "Automatische antwoorden, fouten zijn mogelijk. Deel geen gevoelige gegevens.", priv: "Privacy", fnote: "Uw gegevens dienen om uw aanvraag te beantwoorden. Uw gesprek met de assistent wordt bij de aanvraag gevoegd.", fok: "Ik ga ermee akkoord dat mijn gesprek naar de pizzeria wordt gestuurd, met de gezondheidsgegevens (allergieën…) die het kan bevatten.", btn: "Hulp", hello: "Hallo! Ik ben Leporello, de assistent van Pizzeria Don Giovanni. Waarmee kan ik u helpen?", q: ["Menu en prijzen", "Levering bij mij", "Allergenen", "Openingsuren en adres", "Bestelling voor een feest / groep"], ph: "Uw bericht…", send: "Versturen", clr: "Chat wissen", clrOk: "Bevestigen?", clrT: "Gesprek wissen", warn5: "Limiet bijna bereikt: u hebt nog 5 berichten.", prepAsk: "Wilt u dat ik een aanvraag voor de pizzeria voorbereid?", prepYes: "Ja, aanvraag voorbereiden", prepNo: "Nee, verdergaan", prepMsg: "Ja, graag een aanvraag voor de pizzeria.", noSend: "Niet versturen", closed: "Dank u. Het gesprek is gesloten.", close: "Sluiten", call: "Bel " + TEL, down: "De assistent is momenteel niet beschikbaar. Bel ons:", wait: "…", ended: "Het gesprek is beëindigd. Open de assistent opnieuw om te herbeginnen.", idle: "Gesprek gesloten na 10 minuten zonder bericht.", off2: "Nog één vraag buiten het onderwerp en het gesprek wordt gesloten.", blocked: "De assistent is momenteel niet beschikbaar. Bel de pizzeria op " + TEL + ".", askReq: "Is dit goed zo? U kunt de aanvraag zo versturen of details toevoegen.", sendReq: "Aanvraag versturen", addDet: "Details toevoegen", cancel: "Annuleren", name: "Naam en voornaam", phone: "Telefoon (optioneel, als u teruggebeld wilt worden)", email: "E-mail", getCode: "Code per e-mail ontvangen", codeSent: "Code verstuurd naar", code: "Code van 6 cijfers", confirm: "Bevestigen en versturen", sent: "Bedankt! Uw aanvraag{n} is verstuurd. U ontvangt een kopie per e-mail. De pizzeria antwoordt zo snel mogelijk, meestal binnen 72 uur. Wilt u iets toevoegen? Beantwoord dan gewoon die e-mail.", added: "Bedankt! Uw bericht is toegevoegd aan uw lopende aanvraag{n}. U ontvangt een bevestiging per e-mail. De pizzeria antwoordt zo snel mogelijk, meestal binnen 72 uur. Wilt u iets toevoegen? Beantwoord dan gewoon die e-mail.", errEmail: "Ongeldig e-mailadres.", errPhone: "Ongeldig telefoonnummer.", errCode: "Verkeerde code.", errExp: "Code verlopen, vraag een nieuwe aan.", err: "Er ging iets mis. Probeer opnieuw of bel " + TEL + ".", robot: "Controle…", note: "Eenvoudige antwoorden op uw vragen over de pizzeria.", limit: "U hebt de limiet van 20 berichten in 24 uur bereikt. Bel de pizzeria als u een vraag hebt." },
    en: { pnote: "Personal note (optional, max. 300 characters)", ai: "AI agent", big: "Enlarge", small: "Reduce", sens: "Automatic answers, mistakes are possible. Do not share sensitive data.", priv: "Privacy", fnote: "Your details are used to reply to your request. Your conversation with the assistant is attached to the request.", fok: "I agree that my conversation is sent to the pizzeria, including any health information (allergies…) it may contain.", btn: "Help", hello: "Hello! I'm Leporello, the Pizzeria Don Giovanni assistant. How can I help you?", q: ["Menu and prices", "Delivery to my place", "Allergens", "Opening hours and address", "Order for a party / group"], ph: "Your message…", send: "Send", clr: "Clear chat", clrOk: "Confirm?", clrT: "Clear the conversation", warn5: "Limit almost reached: you have 5 messages left.", prepAsk: "Would you like me to prepare a request for the pizzeria?", prepYes: "Yes, prepare the request", prepNo: "No, continue", prepMsg: "Yes, please prepare the request for the pizzeria.", noSend: "Do not send", closed: "Thank you. The conversation is closed.", close: "Close", call: "Call " + TEL, down: "The assistant is not available right now. Call us:", wait: "…", ended: "The conversation has ended. Reopen the assistant to start again.", idle: "Conversation closed after 10 minutes without a message.", off2: "One more off-topic question and the conversation will close.", blocked: "The assistant is unavailable for now. For the pizzeria, call " + TEL + ".", askReq: "Is this fine? You can send the request as it is or add details.", sendReq: "Send the request", addDet: "Add details", cancel: "Cancel", name: "Full name", phone: "Phone (optional, if you would like a call back)", email: "E-mail", getCode: "Get the code by e-mail", codeSent: "Code sent to", code: "6-digit code", confirm: "Confirm and send", sent: "Thank you! Your request{n} has been sent. You will get a copy by e-mail. The pizzeria replies as soon as possible, usually within 72 hours. To add something, simply reply to that e-mail.", added: "Thank you! Your message has been added to your open request{n}. You will get a confirmation by e-mail. The pizzeria replies as soon as possible, usually within 72 hours. To add something, simply reply to that e-mail.", errEmail: "Invalid e-mail address.", errPhone: "Invalid phone number.", errCode: "Wrong code.", errExp: "Code expired, ask for a new one.", err: "Something went wrong. Try again or call " + TEL + ".", robot: "Checking…", note: "Simple answers to your questions about the pizzeria.", limit: "You have reached the limit of 20 messages in 24 hours. For any question, please call the pizzeria." },
    de: { pnote: "Persönliche Notiz (optional, max. 300 Zeichen)", ai: "KI-Agent", big: "Vergrößern", small: "Verkleinern", sens: "Automatische Antworten, Fehler sind möglich. Teilen Sie keine sensiblen Daten.", priv: "Datenschutz", fnote: "Ihre Angaben dienen zur Beantwortung Ihrer Anfrage. Ihr Gespräch mit dem Assistenten wird der Anfrage beigefügt.", fok: "Ich bin einverstanden, dass mein Gespräch an die Pizzeria übermittelt wird, einschließlich der Gesundheitsangaben (Allergien…), die es enthalten kann.", btn: "Hilfe", hello: "Hallo! Ich bin Leporello, der Assistent der Pizzeria Don Giovanni. Wie kann ich helfen?", q: ["Menü und Preise", "Lieferung zu mir", "Allergene", "Öffnungszeiten und Adresse", "Bestellung für ein Fest / eine Gruppe"], ph: "Ihre Nachricht…", send: "Senden", clr: "Chat leeren", clrOk: "Bestätigen?", clrT: "Unterhaltung löschen", warn5: "Grenze fast erreicht: Sie haben noch 5 Nachrichten.", prepAsk: "Soll ich eine Anfrage an die Pizzeria vorbereiten?", prepYes: "Ja, Anfrage vorbereiten", prepNo: "Nein, weiter", prepMsg: "Ja, gerne eine Anfrage an die Pizzeria.", noSend: "Nicht senden", closed: "Danke. Die Unterhaltung ist geschlossen.", close: "Schließen", call: "Rufen Sie " + TEL + " an", down: "Der Assistent ist gerade nicht verfügbar. Rufen Sie uns an:", wait: "…", ended: "Das Gespräch ist beendet. Öffnen Sie den Assistenten neu, um neu zu beginnen.", idle: "Gespräch nach 10 Minuten ohne Nachricht geschlossen.", off2: "Noch eine Frage zu einem anderen Thema und das Gespräch wird geschlossen.", blocked: "Der Assistent ist im Moment nicht verfügbar. Für die Pizzeria: " + TEL + ".", askReq: "Passt das so? Sie können die Anfrage so senden oder Details hinzufügen.", sendReq: "Anfrage senden", addDet: "Details hinzufügen", cancel: "Abbrechen", name: "Vor- und Nachname", phone: "Telefon (freiwillig, wenn Sie einen Rückruf wünschen)", email: "E-Mail", getCode: "Code per E-Mail erhalten", codeSent: "Code gesendet an", code: "6-stelliger Code", confirm: "Bestätigen und senden", sent: "Danke! Ihre Anfrage{n} wurde gesendet. Sie erhalten eine Kopie per E-Mail. Die Pizzeria antwortet so schnell wie möglich, in der Regel innerhalb von 72 Stunden. Um etwas hinzuzufügen, antworten Sie einfach auf diese E-Mail.", added: "Danke! Ihre Nachricht wurde zu Ihrer laufenden Anfrage{n} hinzugefügt. Sie erhalten eine Bestätigung per E-Mail. Die Pizzeria antwortet so schnell wie möglich, in der Regel innerhalb von 72 Stunden. Um etwas hinzuzufügen, antworten Sie einfach auf diese E-Mail.", errEmail: "Ungültige E-Mail-Adresse.", errPhone: "Ungültige Telefonnummer.", errCode: "Falscher Code.", errExp: "Code abgelaufen, fordern Sie einen neuen an.", err: "Ein Fehler ist aufgetreten. Versuchen Sie es erneut oder rufen Sie " + TEL + " an.", robot: "Prüfung…", note: "Einfache Antworten auf Ihre Fragen zur Pizzeria.", limit: "Sie haben die Grenze von 20 Nachrichten in 24 Stunden erreicht. Bei Fragen rufen Sie bitte die Pizzeria an." },
    it: { pnote: "Nota personale (facoltativa, max 300 caratteri)", ai: "Agente IA", big: "Ingrandisci", small: "Riduci", sens: "Risposte automatiche, sono possibili errori. Non condivida dati sensibili.", priv: "Privacy", fnote: "I suoi dati servono a rispondere alla sua richiesta. La sua conversazione con l'assistente viene allegata alla richiesta.", fok: "Accetto che la mia conversazione sia trasmessa alla pizzeria, con le informazioni sulla salute (allergie…) che può contenere.", btn: "Assistenza", hello: "Buongiorno! Sono Leporello, l'assistente della Pizzeria Don Giovanni. Come posso aiutarla?", q: ["Menu e prezzi", "Consegna a casa mia", "Allergeni", "Orari e indirizzo", "Ordine per una festa / un gruppo"], ph: "Il suo messaggio…", send: "Invia", clr: "Pulisci chat", clrOk: "Conferma?", clrT: "Cancella la conversazione", warn5: "Limite quasi raggiunto: le restano 5 messaggi.", prepAsk: "Vuole che prepari una richiesta per la pizzeria?", prepYes: "Sì, prepara la richiesta", prepNo: "No, continuo", prepMsg: "Sì, una richiesta per la pizzeria, grazie.", noSend: "Non inviare", closed: "Grazie. La conversazione è chiusa.", close: "Chiudi", call: "Chiami il " + TEL, down: "L'assistente non è disponibile al momento. Ci chiami:", wait: "…", ended: "La conversazione è terminata. Riapra l'assistente per ricominciare.", idle: "Conversazione chiusa dopo 10 minuti senza messaggi.", off2: "Ancora una domanda fuori tema e la conversazione verrà chiusa.", blocked: "L'assistente non è disponibile per ora. Per la pizzeria chiami il " + TEL + ".", askReq: "Va bene così? Può inviare la richiesta così com'è o aggiungere dettagli.", sendReq: "Invia la richiesta", addDet: "Aggiungi dettagli", cancel: "Annulla", name: "Nome e cognome", phone: "Telefono (facoltativo, se desidera essere richiamato)", email: "Email", getCode: "Ricevi il codice per email", codeSent: "Codice inviato a", code: "Codice di 6 cifre", confirm: "Conferma e invia", sent: "Grazie! La sua richiesta{n} è stata inviata. Riceve una copia per email. La pizzeria le risponde il prima possibile, di solito entro 72 ore. Per aggiungere qualcosa, risponda semplicemente a quell'email.", added: "Grazie! Il suo messaggio è stato aggiunto alla sua richiesta in corso{n}. Riceve una conferma per email. La pizzeria le risponde il prima possibile, di solito entro 72 ore. Per aggiungere qualcosa, risponda semplicemente a quell'email.", errEmail: "Email non valida.", errPhone: "Numero di telefono non valido.", errCode: "Codice errato.", errExp: "Codice scaduto, ne chieda uno nuovo.", err: "Si è verificato un errore. Riprovi o chiami il " + TEL + ".", robot: "Verifica…", note: "Risposte semplici alle sue domande sulla pizzeria.", limit: "Ha raggiunto il limite di 20 messaggi in 24 ore. Per qualsiasi domanda chiami la pizzeria." },
    es: { pnote: "Nota personal (opcional, máx. 300 caracteres)", ai: "Agente IA", big: "Ampliar", small: "Reducir", sens: "Respuestas automáticas, puede haber errores. No comparta datos sensibles.", priv: "Privacidad", fnote: "Sus datos sirven para responder a su solicitud. Su conversación con el asistente se adjunta a la solicitud.", fok: "Acepto que mi conversación se envíe a la pizzería, con la información de salud (alergias…) que pueda contener.", btn: "Ayuda", hello: "¡Hola! Soy Leporello, el asistente de la Pizzeria Don Giovanni. ¿En qué puedo ayudarle?", q: ["Menú y precios", "Entrega a domicilio", "Alérgenos", "Horario y dirección", "Pedido para una fiesta / un grupo"], ph: "Su mensaje…", send: "Enviar", clr: "Limpiar chat", clrOk: "¿Confirmar?", clrT: "Borrar la conversación", warn5: "Límite casi alcanzado: le quedan 5 mensajes.", prepAsk: "¿Quiere que prepare una solicitud para la pizzería?", prepYes: "Sí, preparar la solicitud", prepNo: "No, continuar", prepMsg: "Sí, una solicitud para la pizzería, gracias.", noSend: "No enviar", closed: "Gracias. La conversación está cerrada.", close: "Cerrar", call: "Llame al " + TEL, down: "El asistente no está disponible ahora. Llámenos:", wait: "…", ended: "La conversación ha terminado. Vuelva a abrir el asistente para empezar de nuevo.", idle: "Conversación cerrada tras 10 minutos sin mensajes.", off2: "Una pregunta más fuera de tema y la conversación se cerrará.", blocked: "El asistente no está disponible por ahora. Para la pizzería, llame al " + TEL + ".", askReq: "¿Le parece bien? Puede enviar la solicitud tal cual o añadir detalles.", sendReq: "Enviar la solicitud", addDet: "Añadir detalles", cancel: "Cancelar", name: "Nombre y apellido", phone: "Teléfono (opcional, si desea que le llamemos)", email: "Correo electrónico", getCode: "Recibir el código por correo", codeSent: "Código enviado a", code: "Código de 6 cifras", confirm: "Confirmar y enviar", sent: "¡Gracias! Su solicitud{n} ha sido enviada. Recibirá una copia por correo. La pizzería responde lo antes posible, normalmente en 72 horas. Para añadir algo, responda simplemente a ese correo.", added: "¡Gracias! Su mensaje se ha añadido a su solicitud en curso{n}. Recibirá una confirmación por correo. La pizzería responde lo antes posible, normalmente en 72 horas. Para añadir algo, responda simplemente a ese correo.", errEmail: "Correo no válido.", errPhone: "Número de teléfono no válido.", errCode: "Código incorrecto.", errExp: "Código caducado, pida uno nuevo.", err: "Ha ocurrido un error. Inténtelo de nuevo o llame al " + TEL + ".", robot: "Verificación…", note: "Respuestas sencillas a sus preguntas sobre la pizzería.", limit: "Ha alcanzado el límite de 20 mensajes en 24 horas. Para cualquier pregunta, llame a la pizzería." }
  };
  /* 14.11 (titolare): gli stessi testi col «tu», usati quando il cliente dà del tu (reg "tu"); gli altri restano come in T */
  const TU = {
    it: { sens: "Risposte automatiche, sono possibili errori. Non condividere dati sensibili.", fnote: "I tuoi dati servono a rispondere alla tua richiesta. La tua conversazione con l'assistente viene allegata alla richiesta.", hello: "Ciao! Sono Leporello, l'assistente della Pizzeria Don Giovanni. Come posso aiutarti?", ph: "Il tuo messaggio…", warn5: "Limite quasi raggiunto: ti restano 5 messaggi.", prepAsk: "Vuoi che prepari una richiesta per la pizzeria?", call: "Chiama il " + TEL, down: "L'assistente non è disponibile al momento. Chiamaci:", ended: "La conversazione è terminata. Riapri l'assistente per ricominciare.", blocked: "L'assistente non è disponibile per ora. Per la pizzeria chiama il " + TEL + ".", askReq: "Va bene così? Puoi inviare la richiesta così com'è o aggiungere dettagli.", phone: "Telefono (facoltativo, se vuoi essere richiamato)", sent: "Grazie! La tua richiesta{n} è stata inviata. Ricevi una copia per email. La pizzeria ti risponde il prima possibile, di solito entro 72 ore. Per aggiungere qualcosa, rispondi semplicemente a quell'email.", added: "Grazie! Il tuo messaggio è stato aggiunto alla tua richiesta in corso{n}. Ricevi una conferma per email. La pizzeria ti risponde il prima possibile, di solito entro 72 ore. Per aggiungere qualcosa, rispondi semplicemente a quell'email.", errExp: "Codice scaduto, chiedine uno nuovo.", err: "Si è verificato un errore. Riprova o chiama il " + TEL + ".", note: "Risposte semplici alle tue domande sulla pizzeria.", limit: "Hai raggiunto il limite di 20 messaggi in 24 ore. Per qualsiasi domanda chiama la pizzeria." },
    fr: { sens: "Réponses automatiques, des erreurs sont possibles. Ne partage pas de données sensibles.", fnote: "Tes coordonnées servent à répondre à ta demande. Ta conversation avec l'assistant est jointe à la demande.", hello: "Salut ! Je suis Leporello, l'assistant de la Pizzeria Don Giovanni. Comment je peux t'aider ?", ph: "Ton message…", warn5: "Limite presque atteinte : il te reste 5 messages.", prepAsk: "Tu veux que je prépare une demande pour la pizzeria ?", call: "Appelle le " + TEL, down: "L'assistant n'est pas disponible pour le moment. Appelle-nous :", ended: "La conversation est terminée. Rouvre l'assistant pour recommencer.", blocked: "L'assistant est indisponible pour l'instant. Pour la pizzeria, appelle le " + TEL + ".", askReq: "Ça te convient ? Tu peux envoyer la demande telle quelle ou ajouter des détails.", phone: "Téléphone (facultatif, si tu souhaites être rappelé)", sent: "Merci ! Ta demande{n} est envoyée. Tu reçois une copie par e-mail. La pizzeria te répond le plus vite possible, en général dans les 72 heures. Pour ajouter quelque chose, réponds simplement à l'e-mail reçu.", added: "Merci ! Ton message a été ajouté à ta demande en cours{n}. Tu reçois une confirmation par e-mail. La pizzeria te répond le plus vite possible, en général dans les 72 heures. Pour ajouter quelque chose, réponds simplement à l'e-mail reçu.", errExp: "Code expiré, demandes-en un nouveau.", err: "Une erreur est survenue. Réessaie ou appelle le " + TEL + ".", note: "Réponses simples à tes questions sur la pizzeria.", limit: "Tu as atteint la limite de 20 messages en 24 heures. Pour toute question, appelle la pizzeria." },
    nl: { fnote: "Je gegevens dienen om je aanvraag te beantwoorden. Je gesprek met de assistent wordt bij de aanvraag gevoegd.", hello: "Hoi! Ik ben Leporello, de assistent van Pizzeria Don Giovanni. Waarmee kan ik je helpen?", ph: "Je bericht…", warn5: "Limiet bijna bereikt: je hebt nog 5 berichten.", prepAsk: "Wil je dat ik een aanvraag voor de pizzeria voorbereid?", askReq: "Is dit goed zo? Je kunt de aanvraag zo versturen of details toevoegen.", phone: "Telefoon (optioneel, als je teruggebeld wilt worden)", sent: "Bedankt! Je aanvraag{n} is verstuurd. Je ontvangt een kopie per e-mail. De pizzeria antwoordt zo snel mogelijk, meestal binnen 72 uur. Wil je iets toevoegen? Beantwoord dan gewoon die e-mail.", added: "Bedankt! Je bericht is toegevoegd aan je lopende aanvraag{n}. Je ontvangt een bevestiging per e-mail. De pizzeria antwoordt zo snel mogelijk, meestal binnen 72 uur. Wil je iets toevoegen? Beantwoord dan gewoon die e-mail.", note: "Eenvoudige antwoorden op je vragen over de pizzeria.", limit: "Je hebt de limiet van 20 berichten in 24 uur bereikt. Bel de pizzeria als je een vraag hebt." },
    de: { sens: "Automatische Antworten, Fehler sind möglich. Teile keine sensiblen Daten.", fnote: "Deine Angaben dienen zur Beantwortung deiner Anfrage. Dein Gespräch mit dem Assistenten wird der Anfrage beigefügt.", hello: "Hallo! Ich bin Leporello, der Assistent der Pizzeria Don Giovanni. Wie kann ich dir helfen?", ph: "Deine Nachricht…", warn5: "Grenze fast erreicht: Du hast noch 5 Nachrichten.", call: "Ruf " + TEL + " an", down: "Der Assistent ist gerade nicht verfügbar. Ruf uns an:", ended: "Das Gespräch ist beendet. Öffne den Assistenten neu, um neu zu beginnen.", askReq: "Passt das so? Du kannst die Anfrage so senden oder Details hinzufügen.", phone: "Telefon (freiwillig, wenn du einen Rückruf wünschst)", sent: "Danke! Deine Anfrage{n} wurde gesendet. Du erhältst eine Kopie per E-Mail. Die Pizzeria antwortet so schnell wie möglich, in der Regel innerhalb von 72 Stunden. Um etwas hinzuzufügen, antworte einfach auf diese E-Mail.", added: "Danke! Deine Nachricht wurde zu deiner laufenden Anfrage{n} hinzugefügt. Du erhältst eine Bestätigung per E-Mail. Die Pizzeria antwortet so schnell wie möglich, in der Regel innerhalb von 72 Stunden. Um etwas hinzuzufügen, antworte einfach auf diese E-Mail.", errExp: "Code abgelaufen, fordere einen neuen an.", err: "Ein Fehler ist aufgetreten. Versuch es erneut oder ruf " + TEL + " an.", note: "Einfache Antworten auf deine Fragen zur Pizzeria.", limit: "Du hast die Grenze von 20 Nachrichten in 24 Stunden erreicht. Bei Fragen ruf bitte die Pizzeria an." },
    es: { sens: "Respuestas automáticas, puede haber errores. No compartas datos sensibles.", fnote: "Tus datos sirven para responder a tu solicitud. Tu conversación con el asistente se adjunta a la solicitud.", hello: "¡Hola! Soy Leporello, el asistente de la Pizzeria Don Giovanni. ¿En qué puedo ayudarte?", ph: "Tu mensaje…", warn5: "Límite casi alcanzado: te quedan 5 mensajes.", prepAsk: "¿Quieres que prepare una solicitud para la pizzería?", call: "Llama al " + TEL, down: "El asistente no está disponible ahora. Llámanos:", ended: "La conversación ha terminado. Vuelve a abrir el asistente para empezar de nuevo.", blocked: "El asistente no está disponible por ahora. Para la pizzería, llama al " + TEL + ".", askReq: "¿Te parece bien? Puedes enviar la solicitud tal cual o añadir detalles.", phone: "Teléfono (opcional, si quieres que te llamemos)", sent: "¡Gracias! Tu solicitud{n} ha sido enviada. Recibirás una copia por correo. La pizzería responde lo antes posible, normalmente en 72 horas. Para añadir algo, responde simplemente a ese correo.", added: "¡Gracias! Tu mensaje se ha añadido a tu solicitud en curso{n}. Recibirás una confirmación por correo. La pizzería responde lo antes posible, normalmente en 72 horas. Para añadir algo, responde simplemente a ese correo.", errExp: "Código caducado, pide uno nuevo.", err: "Ha ocurrido un error. Inténtalo de nuevo o llama al " + TEL + ".", note: "Respuestas sencillas a tus preguntas sobre la pizzería.", limit: "Has alcanzado el límite de 20 mensajes en 24 horas. Para cualquier pregunta, llama a la pizzería." }
  };
  const t = k => { const l = lang(); return reg === "tu" && TU[l] && TU[l][k] !== undefined ? TU[l][k] : (T[l] || T.fr)[k] };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const css = `
.dga-btn{position:fixed;right:12px;bottom:16px;z-index:40;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1px solid #2c2622;background:#171412;color:#fbf4e6;font:500 13px Poppins,system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.35);cursor:pointer;opacity:.92}
.dga-btn:hover{opacity:1;border-color:#b7ab98}
.dga{position:fixed;inset:auto 12px 12px auto;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100dvh - 24px));z-index:60;display:flex;flex-direction:column;background:#0d0b0a;color:#fbf4e6;border:1px solid #2c2622;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.6);font:15px/1.45 Poppins,system-ui,sans-serif;overflow:hidden}
@media (max-width:520px){.dga{inset:0;width:auto;height:100dvh;border-radius:0;border:0}}
.dga.full{inset:0;width:auto;height:100dvh;border-radius:0;border:0;font-size:16px}
.dga.full .dga-h,.dga.full .dga-p,.dga.full .dga-m,.dga.full .dga-f{padding-left:max(12px,calc(50% - 420px));padding-right:max(12px,calc(50% - 420px))}
.dga.full .dga-h small,.dga.full .dga-p{font-size:13px}
.dga-z{background:none;border:0;color:#b7ab98;font-size:19px;line-height:1;cursor:pointer;padding:2px 6px}
.dga.kb .dga-q,.dga.kb .dga-h small{display:none}
.dga{overscroll-behavior:contain}.dga-m{overscroll-behavior:contain}
.dga-h{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #2c2622;background:#171412}
.dga-h b{flex:1;font-weight:600}.dga-h small{color:#b7ab98;font-size:11px;display:block;font-weight:400}
.dga-cl{background:none;border:1px solid #3a322c;border-radius:999px;color:#b7ab98;font:inherit;font-size:11px;line-height:1;cursor:pointer;padding:5px 9px;white-space:nowrap}.dga-cl.ok{color:#fbf4e6;border-color:#d0362a}
.dga-x{background:none;border:1px solid #3a322c;border-radius:999px;color:#fbf4e6;font:inherit;font-size:11px;line-height:1;cursor:pointer;padding:5px 9px;white-space:nowrap}
.dga-h{flex-wrap:wrap}.dga-h>small{flex:1 0 100%;color:#b7ab98;font-size:11px;font-weight:400;margin-top:-4px}.dga.full .dga-h>small{font-size:13px}.dga.kb .dga-h>small{display:none}
.dga-m{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.dga-b{max-width:88%;padding:8px 11px;border-radius:12px;white-space:pre-wrap;word-wrap:break-word}
.dga-a{background:#171412;border:1px solid #2c2622;align-self:flex-start;border-bottom-left-radius:4px}
.dga-u{background:#e3201b;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.dga-s{align-self:center;color:#b7ab98;font-size:12px;text-align:center}
.dga-c{display:flex;flex-wrap:wrap;gap:6px}
.dga-ask{flex:1 0 100%;font-size:13.5px;line-height:1.35;opacity:.85}
.dga-c button,.dga-k{background:none;border:1px solid #2c2622;color:#fbf4e6;border-radius:999px;padding:6px 10px;font:inherit;font-size:13px;cursor:pointer}
.dga-c button:hover{border-color:#f2b33d}
.dga-k.p{background:#1f9a4b;border-color:#1f9a4b;color:#fff;font-weight:600}
.dga-call{display:inline-block;margin-top:6px;background:#e3201b;color:#fff;border-radius:8px;padding:8px 12px;text-decoration:none;font-weight:600}
.dga-f{display:flex;gap:6px;padding:10px;border-top:1px solid #2c2622;background:#171412}
.dga-f textarea{flex:1;resize:none;height:66px;min-height:66px;max-height:45dvh;overflow-y:auto;background:#0d0b0a;color:#fbf4e6;border:1px solid #2c2622;border-radius:10px;padding:10px;font:inherit}
.dga-f button{background:#e3201b;color:#fff;border:0;border-radius:10px;padding:0 14px;font:inherit;font-weight:600;cursor:pointer}
.dga-f button:disabled,.dga-k:disabled{opacity:.5;cursor:default}
.dga-ok{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:1.4;color:#eee3cf;cursor:pointer}.dga-form .dga-ok input{flex:0 0 auto;width:18px;height:18px;margin:1px 0 0;padding:0;accent-color:#e3201b}
.dga-form{display:flex;flex-direction:column;gap:6px;align-self:stretch;background:#171412;border:1px solid #2c2622;border-radius:12px;padding:10px}
.dga-form input,.dga-form textarea{background:#0d0b0a;color:#fbf4e6;border:1px solid #2c2622;border-radius:8px;padding:9px;font:inherit}
.dga-form textarea{resize:vertical;min-height:60px}
.dga-e{color:#f2b33d;font-size:12px}
.dga-ts{align-self:center}
.dga-p{padding:6px 12px;font-size:11px;color:#b7ab98;border-bottom:1px solid #2c2622}.dga-p a,.dga-p2 a{color:#f2b33d}
.dga .dga-m .dga-p{flex:none;padding:0 0 8px}
.dga-p2{font-size:11px;color:#b7ab98}`;

  let S = null, MSGS = [], busy = false, sess = null, idleT = null, startT = 0, off = 0, req = null, addMode = false, ended = false;

  function placeBtn(b) {
    let h = 0;
    document.querySelectorAll("body *").forEach(e => {
      if (e === b || e.closest(".dga")) return;
      const cs = getComputedStyle(e);
      if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden") return;
      const r = e.getBoundingClientRect();
      if (r.height > 0 && r.height < 160 && r.bottom >= innerHeight - 2 && r.width > innerWidth * 0.6) h = Math.max(h, innerHeight - r.top);
    });
    b.style.bottom = (h + 10) + "px";
  }

  function init() {
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    // Confidentialité in «Voir aussi» (pagina di arrivo)
    const alg = document.querySelector('.card a.lk[href="allergenes.html"]');
    if (alg && !document.querySelector('.card a.lk[href="confidentialite.html"]')) {
      const a = document.createElement("a"); a.className = "lk"; a.href = "confidentialite.html"; alg.after(a);
      const pl = () => a.textContent = t("priv") + " →"; pl(); setInterval(pl, 800);
    }
    // Barra in basso (pagina di arrivo): voce «Assistance» a sinistra di «Appeler»
    const bar = document.querySelector("nav.bot .in"), tel = bar && bar.querySelector("a.tel");
    if (bar && tel) {
      const a = document.createElement("a"); a.href = "#"; a.className = "dga-nav";
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/><circle cx="8.5" cy="12" r=".6" fill="currentColor"/><circle cx="12" cy="12" r=".6" fill="currentColor"/><circle cx="15.5" cy="12" r=".6" fill="currentColor"/></svg><span class="t"></span>';
      bar.insertBefore(a, tel); bar.style.gridTemplateColumns = "repeat(6,1fr)";
      const lbl = () => { a.querySelector(".t").textContent = t("btn"); a.setAttribute("aria-label", t("btn")) }; lbl(); setInterval(lbl, 800);
      a.addEventListener("click", e => { e.preventDefault(); open() });
      return;
    }
    // Pagina Menu: chip «💬 Assistance» nella barra in alto, accanto ad Allergènes (resta bloccata in alto)
    const chips = document.getElementById("chips");
    if (chips) {
      const ensure = () => {
        let c = chips.querySelector(".dga-chip");
        if (!c) {
          c = document.createElement("a"); c.className = "chip dga-chip"; c.href = "#";
          c.addEventListener("click", e => { e.preventDefault(); open() });
          const alg = chips.querySelector('a[href="allergenes.html"]');
          if (alg) alg.after(c); else chips.appendChild(c);
        }
        const txt = "💬 " + t("btn"); if (c.textContent !== txt) c.textContent = txt;
      };
      ensure(); new MutationObserver(ensure).observe(chips, { childList: true }); setInterval(ensure, 800);
      return;
    }
    const b = document.createElement("button");
    b.type = "button"; b.className = "dga-btn"; b.setAttribute("aria-label", t("btn"));
    b.innerHTML = '<span aria-hidden="true">💬</span><span class="dga-bl"></span>';
    const lbl = () => b.querySelector(".dga-bl").textContent = t("btn"); lbl();
    document.body.appendChild(b);
    placeBtn(b); setInterval(() => { placeBtn(b); lbl() }, 800); addEventListener("resize", () => placeBtn(b));
    b.onclick = open;
  }

  function el(html) { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild }
  function add(cls, text) { const n = el(`<div class="dga-b ${cls}"></div>`); n.textContent = text; S.m.appendChild(n); S.m.scrollTop = 1e6; return n }
  function addNode(n) { S.m.appendChild(n); S.m.scrollTop = 1e6; return n }
  function sys(text) { return add("dga-s", text) }
  function callBox(msg) { addNode(el(`<div class="dga-b dga-a">${esc(msg)}<br><a class="dga-call" href="${TELH}">📞 ${TEL}</a></div>`)) }

  /* 14.11 (titolare): la conversazione resta nel browser del cliente per 24 ore al massimo (ricaricando o cambiando pagina la ritrova);
     si cancella col pulsante «Effacer», dopo l'invio di una richiesta, o da sola dopo 24 ore. Mai i dati del modulo (nome, telefono, email). */
  const CK = "dg_assist_chat", CMAX = 24 * 3600000;
  function saveChat() { try { if (!MSGS.length) return; const o = loadChat(); localStorage.setItem(CK, JSON.stringify({ t: o ? o.t : Date.now(), m: MSGS, l: chatL, g: reg, o: off, r: req })) } catch (e) { } }
  function loadChat() { try { const o = JSON.parse(localStorage.getItem(CK) || "null"); if (!o || !Array.isArray(o.m) || !o.m.length || !(Date.now() - o.t < CMAX) || o.t > Date.now()) { if (o) localStorage.removeItem(CK); return null } return o } catch (e) { return null } }
  function dropChat() { try { localStorage.removeItem(CK) } catch (e) { } }
  /* 14.11 (titolare): 20 messaggi al massimo in 24 ore, contati nel browser; «Effacer» NON azzera il conto. Arrivati a 20: pausa di 24 ore. */
  const NK = "dg_assist_n", NMAX = 20, NWARN = 15;
  function cnt() { try { const o = JSON.parse(localStorage.getItem(NK) || "null"), now = Date.now(); if (!o || o.t > now || (o.p ? now >= o.p : now - o.t >= CMAX)) return { t: now, n: 0, p: 0 }; return { t: +o.t, n: +o.n || 0, p: +o.p || 0 } } catch (e) { return { t: Date.now(), n: 0, p: 0 } } }
  function paused() { return cnt().p > Date.now() }
  function cntUp() { const o = cnt(); o.n++; if (o.n >= NMAX) o.p = Date.now() + CMAX; try { localStorage.setItem(NK, JSON.stringify(o)) } catch (e) { } }
  /* 14.11 (titolare): dopo una richiesta inviata, per 24 ore non se ne preparano altre: per aggiungere qualcosa il cliente risponde all'email di conferma */
  const SK = "dg_assist_sent";
  function sentRec() { try { const o = JSON.parse(localStorage.getItem(SK) || "null"); return o && Date.now() - o.t < CMAX && o.t <= Date.now() ? o : null } catch (e) { return null } }
  function clrShow() { if (S) { const b = S.box.querySelector(".dga-cl"); if (b) b.hidden = !MSGS.length } }

  function blockedUntil() { return +(LS.get("dg_assist_block") || 0) }

  function open() {
    if (S) return;
    ended = false; MSGS = []; sess = null; off = 0; req = null; addMode = false; startT = Date.now(); chatL = null; reg = null;
    const box = el(`<div class="dga" role="dialog" aria-label="Assistance"><div class="dga-h"><b>Pizzeria Don Giovanni<small>${esc(t("ai"))} · ${esc(t("note"))}</small></b><button class="dga-cl" type="button" hidden title="${esc(t("clrT"))}" aria-label="${esc(t("clrT"))}">${esc(t("clr"))}</button><button class="dga-z" type="button" aria-label="${esc(t("big"))}" title="${esc(t("big"))}">⤢</button><button class="dga-x" type="button">${esc(t("close"))}</button></div><div class="dga-p">${esc(t("sens"))} <a href="confidentialite.html" target="_blank" rel="noopener">${esc(t("priv"))} →</a></div><div class="dga-m" aria-live="polite"></div><form class="dga-f"><textarea rows="2" maxlength="600" placeholder="${esc(t("ph"))}"></textarea><button type="submit">${esc(t("send"))}</button></form></div>`);
    document.body.appendChild(box);
    S = { box, m: box.querySelector(".dga-m"), f: box.querySelector(".dga-f"), ta: box.querySelector("textarea") };
    box.querySelector(".dga-h").append(box.querySelector(".dga-h small")); /* la riga «Agent IA · …» va sotto, su tutta la larghezza: accanto al nome restano i pulsanti */
    S.m.prepend(box.querySelector(".dga-p")); /* 14.11: l'avviso scorre con i messaggi: si vede all'inizio e risalendo in cima */
    /* 14.11 (titolare): su telefoni e tablet la chat è sempre a tutto schermo (si esce solo con ×); sul computer resta un riquadro
       che si può ingrandire o ridurre col bottone; finché la chat è aperta la pagina sotto non scorre */
    const z = box.querySelector(".dga-z"), touch = matchMedia("(max-width:520px), (pointer:coarse)").matches;
    if (touch) { box.classList.add("full"); z.hidden = true; }
    else z.onclick = () => { const f = box.classList.toggle("full"); z.textContent = f ? "⤡" : "⤢"; z.title = t(f ? "small" : "big"); z.setAttribute("aria-label", z.title); };
    document.documentElement.style.overflow = document.body.style.overflow = "hidden";
    /* 14.11 (titolare): con la tastiera aperta la chat si stringe sulla parte visibile dello schermo, così il campo dove si scrive
       resta sempre sopra la tastiera; i suggerimenti rapidi si nascondono finché la tastiera è aperta */
    const vv = window.visualViewport;
    const taMax = () => { const kb = box.classList.contains("kb"), h = vv ? vv.height : innerHeight; return Math.max(66, Math.round(h * (kb ? 0.3 : 0.45))); }; /* con la tastiera aperta la casella non supera il 30% dello spazio visibile */
    const fit = () => { if (!S) return;
      if (vv && box.classList.contains("full")) { box.style.height = Math.round(vv.height) + "px"; box.style.top = Math.round(vv.offsetTop) + "px"; box.style.bottom = "auto"; box.classList.toggle("kb", vv.height < 480); S.ta.style.maxHeight = taMax() + "px"; if (S.ta.offsetHeight > taMax()) S.ta.style.height = taMax() + "px"; S.m.scrollTop = S.m.scrollHeight; }
      else { box.style.height = box.style.top = box.style.bottom = ""; box.classList.remove("kb"); if (S.ta) S.ta.style.maxHeight = ""; } };
    S.fit = fit; if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }
    if (!touch) z.addEventListener("click", fit);
    fit();
    box.querySelector(".dga-x").onclick = close;
    const cl = box.querySelector(".dga-cl"); let clT = null; /* primo tocco: chiede conferma per 4 secondi; secondo tocco: cancella e riparte dal saluto */
    cl.onclick = () => { if (busy) return; if (!cl.classList.contains("ok")) { cl.classList.add("ok"); cl.textContent = t("clrOk"); clT = setTimeout(() => { if (S) { cl.classList.remove("ok"); cl.textContent = t("clr") } }, 4000); return }
      clearTimeout(clT); dropChat(); close(); open() };
    document.addEventListener("keydown", escKey);
    if (blockedUntil() > Date.now()) { dropChat(); callBox(t("blocked")); S.f.hidden = true; return }
    const old = loadChat();
    if (old) { MSGS = old.m.filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"); off = Math.min(+old.o || 0, 2); req = old.r && typeof old.r.resume === "string" ? { title: String(old.r.title || ""), resume: old.r.resume } : null; if (old.l && T[old.l]) chatL = old.l; if (old.g === "tu" || old.g === "vous") reg = old.g; relabel(); }
    /* 14.11 (titolare): niente più saluto fisso all'apertura; Leporello si presenta nella prima risposta. Se il cliente scrive solo un saluto,
       risponde la finestra (senza consumare un messaggio) e ripropone i suggerimenti */
    if (MSGS.length) { MSGS.forEach(m => add(m.role === "user" ? "dga-u" : "dga-a", m.content)); if (req) reqButtons(); clrShow(); } else if (!paused()) sugg();
    if (paused()) limBox();
    S.f.onsubmit = e => { e.preventDefault(); const v = S.ta.value.trim(); if (v) { S.ta.value = ""; S.ta.style.height = ""; ask(v) } };
    /* 14.11 (titolare): il campo parte da 2 righe e cresce mentre si scrive, fino a far leggere tutti i 600 caratteri */
    S.ta.addEventListener("input", () => { if (!S) return; S.ta.style.height = "auto"; S.ta.style.height = Math.min(S.ta.scrollHeight + 2, taMax()) + "px"; });
    S.ta.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); S.f.requestSubmit() } });
    resetIdle();
  }
  function limBox() { ended = true; if (!S) return; callBox(t("limit")); S.f.hidden = true; clearTimeout(idleT) }
  function sugg() { if (!S) return; S.m.querySelectorAll(".dga-q").forEach(x => x.remove());
    const c = el('<div class="dga-c dga-q"></div>');
    t("q").forEach(q => { const x = document.createElement("button"); x.type = "button"; x.textContent = q; x.onclick = () => ask(q); c.appendChild(x) });
    addNode(c); }
  /* solo un saluto come primo messaggio: lingua riconosciuta dalla parola (hallo: olandese, tedesco se il sito è in tedesco) */
  const HI = { it: "ciao|buongiorno|buonasera|buon giorno|buona sera|salve|buond[iì]", fr: "bonjour|bonsoir|salut|coucou|bjr", nl: "hallo|hoi|dag|goedendag|goeiedag|goedemorgen|goedemiddag|goedenavond", en: "hello|hi|hey|good morning|good afternoon|good evening", de: "guten tag|guten morgen|guten abend|servus|moin|gr[uü]ß gott", es: "hola|buenas|buenos d[ií]as|buenas tardes|buenas noches" };
  /* 14.11: dopo le 18 (ora di Bruxelles) il saluto della finestra dice «Bonsoir» / «Buonasera» */
  function helloTxt() { const h = +new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).find(x => x.type === "hour").value;
    const s = t("hello"); return h >= 18 || h < 4 ? s.replace(/^Bonjour/, "Bonsoir").replace(/^Buongiorno/, "Buonasera") : s }
  function hiLang(text) { const v = String(text).toLowerCase().replace(/[!.,;:?¡¿\s]+$/g, "").replace(/^[\s¡¿]+/, ""); if (v.length > 20) return null;
    for (const k in HI) if (new RegExp("^(" + HI[k] + ")$").test(v)) return k === "nl" && v === "hallo" && lang() === "de" ? "de" : k; return null }
  function escKey(e) { if (e.key === "Escape") close() }
  function relabel() { if (!S) return; const b = S.box, q = (x) => b.querySelector(x);
    q(".dga-h small").textContent = t("ai") + " · " + t("note");
    q(".dga-p").innerHTML = '<span class="dga-pt">' + esc(t("sens")) + ' </span><a href="confidentialite.html" target="_blank" rel="noopener">' + esc(t("priv")) + " →</a>";
    S.ta.placeholder = t("ph"); q(".dga-f button").textContent = t("send"); { const k = q(".dga-cl"); if (k) { k.classList.remove("ok"); k.textContent = t("clr"); k.title = t("clrT"); k.setAttribute("aria-label", t("clrT")); } } q(".dga-x").textContent = t("close");
    const z = q(".dga-z"); if (z) { z.title = t(b.classList.contains("full") ? "small" : "big"); z.setAttribute("aria-label", z.title); } }
  function close() { if (!S) return; if (window.visualViewport && S.fit) { visualViewport.removeEventListener("resize", S.fit); visualViewport.removeEventListener("scroll", S.fit); } S.box.remove(); S = null; document.documentElement.style.overflow = document.body.style.overflow = ""; clearTimeout(idleT); document.removeEventListener("keydown", escKey) }
  function end(msg) { ended = true; if (!S) return; sys(msg); S.f.hidden = true; clearTimeout(idleT) }
  /* mentre il modulo (dati o codice) è aperto la conversazione non si chiude per inattività: il cliente sta aspettando l'email */
  function resetIdle() { clearTimeout(idleT); idleT = setTimeout(() => { if (S && S.m.querySelector(".dga-form")) resetIdle(); else end(t("idle")) }, 10 * 60000) }

  function turnstile() {
    return new Promise((res, rej) => {
      const go = () => {
        const holder = el('<div class="dga-ts"></div>'); addNode(holder);
        window.turnstile.render(holder, { sitekey: SITEKEY, size: "flexible", language: lang(), appearance: "interaction-only", callback: tok => { holder.remove(); res(tok) }, "error-callback": () => { holder.remove(); rej(new Error("ts")) } });
      };
      if (window.turnstile) return go();
      const s = document.createElement("script"); s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; s.async = true; s.onload = go; s.onerror = () => rej(new Error("ts")); document.head.appendChild(s);
    });
  }
  async function post(path, data) {
    const r = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return r.json();
  }
  async function session() {
    if (sess) return sess;
    const tok = await turnstile();
    const r = await post("/start", { ts: tok });
    if (r.err === "blocked") { LS.set("dg_assist_block", String(r.until || Date.now() + 6 * 3600000)); throw new Error("blocked"); }
    if (!r.s) { console.log("assist start", JSON.stringify(r)); window.DG_ASSIST_LAST = r; throw new Error(r.err || "start"); }
    return sess = r.s;
  }

  async function ask(text) {
    if (busy || ended || !S) return;
    if (Date.now() - startT > 30 * 60000) return end(t("ended"));
    if (paused()) return limBox();
    S.m.querySelectorAll(".dga-q").forEach(x => x.remove());
    if (!MSGS.length) { const hl = hiLang(text); if (hl) { resetIdle(); add("dga-u", text); if (T[hl]) { chatL = hl; reg = /^(ciao|salut|coucou|hoi|hola|hey|hi|servus|moin)\b/i.test(String(text).trim()) ? "tu" : "vous"; relabel(); }
      const hh = helloTxt(); add("dga-a", hh); MSGS.push({ role: "user", content: text }, { role: "assistant", content: hh }); sugg(); saveChat(); clrShow(); return } }
    busy = true; S.f.querySelector("button").disabled = true; resetIdle();
    add("dga-u", text); MSGS.push({ role: "user", content: text });
    const w = add("dga-a", t("wait"));
    const last = cnt().n >= NMAX - 1; /* ultimo messaggio prima del limite: Leporello chiude con la richiesta pronta o con un grazie */
    try {
      await session();
      const chat1 = () => post("/chat", { s: sess, messages: MSGS, lang: lang(), page: PAGE, last, sent: !!sentRec() });
      let r = await chat1();
      if (r.err === "expired") { sess = null; await session(); r = await chat1(); }
      w.remove();
      if (r.err === "blocked") { LS.set("dg_assist_block", String(r.until || Date.now() + 6 * 3600000)); MSGS.pop(); end(t("blocked")); }
      else if (r.err === "down" || r.err === "error") { MSGS.pop(); callBox(t("down")); }
      else if (r.err === "limit") { MSGS.pop(); limBox(); }
      else if (r.err) { MSGS.pop(); callBox(t("err")); }
      else {
        { const l0 = lang(), g0 = reg; if (r.lang && T[r.lang]) chatL = r.lang; if (r.reg === "tu" || r.reg === "vous") reg = r.reg; if (lang() !== l0 || reg !== g0) relabel(); }
        const txt = r.text || t("call");
        add("dga-a", txt); MSGS.push({ role: "assistant", content: txt }); cntUp();
        if (r.blocked) { LS.set("dg_assist_block", String(r.blocked)); end(t("ended")); } /* blocco deciso dal server (abusi ripetuti) */
        else if (r.action === "hors_sujet") {
          off++;
          if (off === 2) sys(t("off2"));
          if (off >= 3) { const n = +(LS.get("dg_assist_blockn") || 0) + 1; LS.set("dg_assist_blockn", String(n)); LS.set("dg_assist_block", String(Date.now() + [6, 12, 24][Math.min(n, 3) - 1] * 3600000 /* abusi: 6 h, poi 12 h, poi 24 h (titolare, 14.11) */)); end(t("ended")); }
        } else if (r.action === "demande" && !sentRec()) { req = { title: r.title, resume: txt }; addMode = false; reqButtons(); }
        else if (req && addMode) { addMode = false; reqButtons(); } /* dopo «Ajouter des détails» i pulsanti tornano sempre */
        else if (req && last) reqButtons(); /* ultimo messaggio con una richiesta già pronta: restano i due pulsanti finali */
        if (!ended && cnt().n === NWARN) warn5();
      }
    } catch (e) { if (e && e.message === "blocked") { w.remove(); MSGS.pop(); end(t("blocked")); busy = false; return; } console.log("assist", e && e.message); window.DG_ASSIST_ERR = String(e && e.message); w.remove(); MSGS.pop(); callBox(t("down") + (PAGE === "prova" ? " [" + String(e && e.message) + " " + JSON.stringify(window.DG_ASSIST_LAST || "") + "]" : "")); }
    busy = false; if (S) S.f.querySelector("button").disabled = false;
    if (ended && blockedUntil() > Date.now()) dropChat(); else saveChat(); clrShow();
    if (S && !ended && paused()) limBox(); /* al 20° messaggio l'avviso di pausa esce subito; una richiesta già preparata si può ancora inviare */
  }

  /* 14.11 (titolare): al 15° messaggio avviso «restano 5 messaggi»; se non c'è ancora una richiesta pronta si propone di prepararla */
  function warn5() {
    sys(t("warn5")); if (req || sentRec()) return;
    const c = el('<div class="dga-c"></div>'), b1 = el(`<button type="button" class="dga-k p">${esc(t("prepYes"))}</button>`), b2 = el(`<button type="button" class="dga-k">${esc(t("prepNo"))}</button>`);
    b1.onclick = () => { c.remove(); ask(t("prepMsg")) }; b2.onclick = () => c.remove();
    c.append(el(`<div class="dga-ask">${esc(t("prepAsk"))}</div>`), b1, b2); addNode(c);
  }
  function reqButtons() {
    if (S) S.m.querySelectorAll(".dga-rq").forEach(x => x.remove()); /* mai due file di pulsanti della richiesta */
    const c = el('<div class="dga-c dga-rq"></div>');
    const b1 = el(`<button type="button" class="dga-k p">${esc(t("sendReq"))}</button>`), b2 = el(`<button type="button" class="dga-k">${esc(t("addDet"))}</button>`), b3 = el(`<button type="button" class="dga-k">${esc(t("cancel"))}</button>`);
    b1.onclick = () => { c.remove(); reqForm() };
    b2.onclick = () => { c.remove(); addMode = true; S.ta.focus() };
    b3.onclick = () => { c.remove(); req = null; saveChat() };
    if (paused()) { /* limite raggiunto: solo «Envoyer la demande» e «Ne pas envoyer»; in tutti e due i casi la conversazione è chiusa */
      const bn = el(`<button type="button" class="dga-k">${esc(t("noSend"))}</button>`);
      bn.onclick = () => { c.remove(); req = null; add("dga-a", t("closed")); MSGS.push({ role: "assistant", content: t("closed") }); saveChat() };
      c.append(b1, bn); } else c.append(el(`<div class="dga-ask">${esc(t("askReq"))}</div>`), b1, b2, b3); addNode(c);
  }
  function reqForm() {
    const f = el(`<form class="dga-form"><input name="n" required maxlength="80" autocomplete="name" placeholder="${esc(t("name"))}"><input name="p" maxlength="30" type="tel" autocomplete="tel" placeholder="${esc(t("phone"))}"><input name="e" required maxlength="120" type="email" autocomplete="email" placeholder="${esc(t("email"))}"><textarea name="x" maxlength="300" rows="3" placeholder="${esc(t("pnote"))}"></textarea><div class="dga-p2">${esc(t("fnote"))} <a href="confidentialite.html" target="_blank" rel="noopener">${esc(t("priv"))} →</a></div><label class="dga-ok"><input type="checkbox" name="ok" required><span>${esc(t("fok"))}</span></label><div class="dga-e" hidden></div><button type="submit" class="dga-k p">${esc(t("getCode"))}</button></form>`);
    addNode(f); f.n.focus();
    const err = m => { const e = f.querySelector(".dga-e"); e.textContent = m; e.hidden = !m };
    f.onsubmit = async e => {
      e.preventDefault(); err("");
      const phone = f.p.value.trim(), d = phone.replace(/[\s./()-]/g, "").replace(/^00/, "+");
      if (phone && !/^(\+3[23]|\+31|\+49|\+352|0)\d{8,12}$/.test(d)) return err(t("errPhone")); if (!f.ok.checked) return; /* 14.11: telefono facoltativo */
      const btn = f.querySelector("button"); btn.disabled = true;
      try {
        const ask1 = async () => post("/code", { s: sess, ts: await turnstile() /* nuovo controllo anti-robot per ogni email col codice */, email: f.e.value.trim(), phone, lang: lang(), reg });
        if (!sess) await session();
        let r = await ask1();
        if (r.err === "expired") { sess = null; await session(); r = await ask1(); } /* sessione di 30 minuti scaduta: se ne prende una nuova e si riprova */
        if (r.err) { btn.disabled = false; return err(r.err === "email" ? t("errEmail") : r.err === "phone" ? t("errPhone") : t("err")) }
        const data = { name: f.n.value.trim(), phone, email: f.e.value.trim().toLowerCase(), note: f.x.value.trim().slice(0, 300), c: r.c };
        f.remove(); codeForm(data);
      } catch (_) { btn.disabled = false; err(t("err")) }
    };
  }
  function codeForm(data) {
    const extra = MSGS.slice(MSGS.findIndex(m => m.content === req.resume) + 1).filter(m => m.role === "user").map(m => m.content).join("\n");
    const f = el(`<form class="dga-form"><div>${esc(t("codeSent"))} ${esc(data.email)}</div><input name="c" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" placeholder="${esc(t("code"))}"><div class="dga-e" hidden></div><button type="submit" class="dga-k p">${esc(t("confirm"))}</button></form>`);
    addNode(f); f.c.focus();
    const err = m => { const e = f.querySelector(".dga-e"); e.textContent = m; e.hidden = !m };
    f.onsubmit = async e => {
      e.preventDefault(); err(""); const btn = f.querySelector("button"); btn.disabled = true;
      try {
        const send1 = () => post("/send", { s: sess, c: data.c, ok: 1 /* 15.11: casella del consenso spuntata (obbligatoria nel modulo) */, code: f.c.value.trim(), name: data.name, phone: data.phone, email: data.email, title: req.title, resume: req.resume, extra, note: data.note, lang: lang(), reg, conv: MSGS.slice(-24).map(m => ({ r: m.role === "user" ? "u" : "a", t: String(m.content || "").slice(0, 1500) })) /* 14.11: la conversazione è allegata alla richiesta (scritto nel modulo e nella Confidentialité) */ });
        let r = await send1();
        if (r.err === "expired") { sess = null; await session(); r = await send1(); } /* sessione scaduta mentre arrivava l'email: il codice resta valido */
        if (r.ok) { /* 14.11 (titolare): conferma col numero della richiesta, poi la conversazione si chiude (resta solo ×) */
          f.remove(); add("dga-a", t(r.added ? "added" : "sent").replace("{n}", r.id ? " " + r.id : "")); req = null; ended = true; dropChat(); try { localStorage.setItem(SK, JSON.stringify({ t: Date.now(), id: r.id || "" })) } catch (e) { } if (S) { S.f.hidden = true; const k = S.box.querySelector(".dga-cl"); if (k) k.hidden = true; } clearTimeout(idleT); return }
        btn.disabled = false;
        if (r.err === "code_expired") { f.remove(); sys(t("errExp")); reqForm(); return }
        err(r.err === "code" ? t("errCode") : t("err"));
      } catch (_) { btn.disabled = false; err(t("err")) }
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
