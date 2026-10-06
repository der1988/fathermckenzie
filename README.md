# Father McKenzie — Unholy in one

Gioco browser di golf/baseball in pixel art: un prete con tunica nera, croce e mazza di legno accompagna dieci scheletri all'inferno. Una campagna di **10 livelli**, con percorsi a piattaforme, portali rialzati, livelli verso sinistra e uno scheletro diverso per ogni tappa.

Grafica originale in Canvas 2D, personaggi compatti animati e scheletro ragdoll formato da sette corpi fisici. Ogni peccatore ha nome, palette e accessorio propri. Le animazioni includono camminata, tunica, salto, atterraggio e carica della mazza all'indietro. Aseprite non è necessario per avviare il progetto; il prototipo non contiene asset di My Friend Pedro.

## Comandi

Browser desktop e tastiera. Nel menu scegli **Nuova partita**.

| Tasto | Azione |
| --- | --- |
| **← / →** | Muovi il prete e scegli la direzione del colpo |
| **S** | Salta, anche dalle piattaforme |
| **Spazio** | Mostra/nasconde l'arco di previsione del lancio |
| **↑ / ↓**, tenuti premuti | Alza/abbassa l'angolo mentre la mira è visibile, da 5° a 80° |
| **A**, tenuto premuto | Carica portando la mazza indietro; rilascia per colpire |
| **R** | Ricomincia il livello corrente |
| **Esc** oppure **Menu** | Pausa; **Continua** riprende la partita |

Avvicinati allo scheletro, guardalo e premi spazio. L'arco parte dallo scheletro e simula la stessa fisica del colpo, inclusi gli urti sulle piattaforme. Senza caricare mostra un tiro al 50%; mentre tieni A, segue la potenza effettiva. Regola l'angolo con su/giù e rilascia A per colpire. L'angolo scelto resta attivo anche nascondendo l'arco. La traiettoria è una previsione: se lo scheletro si muove durante lo swing, il punto di partenza può cambiare.

Un colpo sbagliato non termina la partita: salta sulle piattaforme, raggiungi lo scheletro e colpiscilo di nuovo. Il prete non attiva il portale. **Audio ON/OFF** controlla gli effetti sintetizzati.

## La campagna

| Livello | Percorso | Scheletro |
| --- | --- | --- |
| 01 | Il primo peccato | Osvaldo il Pigro, con berretto |
| 02 | La scala dei sospiri | Tibio il Ladro, mascherato |
| 03 | Sotto le catacombe | Bruno il Minatore, con lampada |
| 04 | La via del ritorno | Ruggero il Pirata, con benda e tricorno |
| 05 | Il ponte spezzato | Ottavio il Conte, con cilindro |
| 06 | Le torri del silenzio | Arturo il Cavaliere, con elmo |
| 07 | La caduta del vescovo | Don Femore, con mitra |
| 08 | Il giardino velenoso | Viola la Botanica, con fiori |
| 09 | Il patto del giullare | Gigi il Giullare, con sonagli |
| 10 | L'ultima benedizione | Re Calcagno, con corona |

Dopo ogni portale scegli **Prossimo livello**, oppure riprova la tappa per migliorare il punteggio. Dopo la decima anima appare il finale con il totale dei colpi: non esiste un undicesimo livello. Puoi tornare al menu e iniziare una nuova campagna. Il progresso resta nella sessione corrente; ricaricare la pagina lo azzera.

## Sviluppo e test

Node.js 22.12+ (validato con Node 24), npm.

```sh
npm ci
npm run dev
```

Vite serve il progetto sulla porta 5173. Nessuna API, database, credenziale o variabile d'ambiente è necessaria. Le font sono incluse nel bundle; non ci sono CDN a runtime.

```sh
npm test
npm run build
npm run preview
```

La suite verifica fisica, piattaforme, angolo del tiro, previsione senza alterare il mondo, progressione e finale. Ogni livello viene completato da un test attraverso il suo vero mondo fisico.

Con il server di sviluppo attivo in un altro terminale e Chromium installato:

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

Il test browser usa solo i comandi reali per completare tutta la campagna. Verifica menu/ripresa, mira e limiti dell'angolo, riavvio, avanzamento, finale, nuova partita, audio, layout mobile e assenza di errori JavaScript. Puoi impostare `TEST_URL` per un server di preview o un deployment. Gli screenshot sono salvati in `/tmp/father-*.png`.

## Pubblicare su Vercel

1. In Vercel scegli **Add New → Project** e importa `der1988/fathermckenzie`.
2. Usa il branch `main` e la directory root del repository.
3. Preset **Vite**, build `npm run build`, output `dist`: già configurati in `vercel.json`.
4. Premi **Deploy**, senza variabili d'ambiente.

Con l'integrazione GitHub collegata, i push su `main` generano nuovi deployment. Un push non crea da solo un progetto Vercel.

## Struttura

- `src/main.js`: rendering, comandi, menu, animazioni e audio.
- `src/level.js`: dieci percorsi, scheletri e collisioni del prete.
- `src/campaign.js`: progressione, punteggi e conclusione della campagna.
- `src/physics.js`: mondo Matter.js, ragdoll, angolo e simulazione della traiettoria.
- `src/style.css`: interfaccia responsive.
- `tests/`: fisica e campagna automatizzata nel browser.

Il layout si adatta al telefono, ma il gioco richiede una tastiera: i comandi touch non sono implementati.
