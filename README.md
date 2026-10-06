# Father McKenzie — Unholy in one

Prototipo browser di golf/baseball in pixel art: un prete con tunica nera, croce e mazza di legno deve spedire uno scheletro nel portale dell'inferno. Un livello fisso, sette corpi fisici collegati in un ragdoll, colpi caricabili, particelle, audio sintetizzato opzionale e contatore dei colpi.

Grafica originale disegnata con Canvas 2D. Ispirazione per il movimento: azione fisica e personaggi articolati; non vengono usati asset di My Friend Pedro. Aseprite non è necessario per avviare il progetto e non è stato usato per questo prototipo.

## Giocare

Browser desktop e tastiera. Premi **Inizia la missione**.

- **← / →**: muovi il prete.
- **↑**: salta.
- **Spazio tenuto premuto**: carica la mazza; rilascialo per colpire.
- **R** o **Ricomincia**: ripristina la partita.
- **Audio ON/OFF**: abilita o disabilita gli effetti.

Avvicinati allo scheletro e guarda nella sua direzione. Un colpo intorno al 35–50% può raggiungere il portale in un tiro; la massima potenza può superarlo. Se sbagli, raggiungi lo scheletro e colpiscilo di nuovo, anche verso sinistra. Vince lo scheletro che entra nel portale, non il prete. Non è necessario premere la freccia giù.

## Sviluppo

Node.js 22.12+ (validato con Node 24), npm.

```sh
npm ci
npm run dev
```

Vite serve il progetto sulla porta 5173. Nessuna API, database, variabile d'ambiente o credenziale è necessaria. Le font sono incluse nel bundle; il gioco non dipende da CDN a runtime.

```sh
npm test
npm run build
npm run preview
```

I test della fisica verificano colpi mancati, forza variabile, ragdoll, vittoria e colpi successivi. Per la verifica completa del browser, avvia il server di sviluppo in un altro terminale e usa un'installazione di Chromium:

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

Puoi impostare `TEST_URL` per verificare il server di preview o un deployment. Il test browser esegue una partita fino alla vittoria, verifica il riavvio, il controllo audio, l'assenza di errori JavaScript e il layout stretto. Gli screenshot di test sono salvati in `/tmp/father-*.png`.

## Pubblicare su Vercel

1. In Vercel scegli **Add New → Project** e importa `der1988/fathermckenzie`.
2. Seleziona il branch `main` e lascia la directory root del repository.
3. Il preset è **Vite**, il comando di build `npm run build` e l'output `dist`, già definiti in `vercel.json`.
4. Premi **Deploy**. Non servono variabili d'ambiente.

I push successivi su `main` generano automaticamente nuovi deployment se l'integrazione GitHub è collegata. Il caricamento del codice su GitHub non crea da solo il progetto Vercel.

## Struttura

- `src/main.js`: rendering pixel art, input, animazioni, audio e ciclo di gioco.
- `src/physics.js`: mondo Matter.js, articolazioni, colpi e rilevamento del portale.
- `src/style.css`: interfaccia responsive.
- `tests/`: test della fisica e partita automatizzata in Chromium.

Il prototipo usa tastiera: il layout si adatta al telefono, ma i comandi touch non sono ancora implementati.
