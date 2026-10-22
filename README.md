# Father McKenzie — La messa è infinita

Arena di sopravvivenza in pixel art con umorismo nero. Il prete si muove nel terzo centrale del cimitero, davanti alla chiesa; i nemici arrivano da entrambi i lati senza un ultimo livello. Grafica Canvas 2D, mazza animata, nemici in volo e particelle di esplosione.

## Regole e comandi

- **← / →**: tieni premuto per camminare e girarti. Movimento limitato fra un terzo e due terzi della larghezza del campo.
- **A oppure Spazio**: tieni per caricare, rilascia per colpire il nemico più vicino davanti a te, entro il cerchio tratteggiato. La carica massima richiede 1,25 secondi; il colpo impiega un breve swing prima dell’impatto.
- Colpo debole: respinge il nemico, che torna all’attacco. Nessun punto.
- Rilascio nella fascia dorata illuminata **68–80%**: lancia il nemico. La finestra dura circa **150 millisecondi**. Fuori da questa fascia, sotto il 90%, il colpo respinge senza segnare. **+1 solo quando esce lateralmente dall’arena**.
- Carica dal **90% al 100%**: il nemico esplode. **0 punti**, anche se vicino al bordo.
- **Esc / Menu**: pausa e ripresa. **R**: nuova partita.
- Su touch usa i pulsanti sotto il campo; tieni premute le frecce per camminare, tieni premuto il pulsante centrale per caricare.

Cinque vite; breve invulnerabilità dopo ogni danno. A zero vite termina la partita, con punteggio e tempo. Il record è salvato localmente quando il browser lo consente. Cambio scheda o perdita di focus mettono in pausa senza colpire involontariamente.

## Nemici

| Tipo | Arrivo | Comportamento | Zona fuoricampo |
|---|---|---|---|
| Scheletro | Da subito | Veloce, passo regolare, leggero | 68–80% |
| Zombie | Dopo 20 secondi | Lento e barcollante, resta stordito più a lungo | 68–80% |
| Mostro | Dopo 45 secondi | Attesa seguita da scatto, segnalato da `!` | 68–80% |

Ogni 20 secondi aumenta l’orda: intervalli più brevi, gruppi via via più numerosi e velocità crescente. Gli esplosi non danno punti e i nemici già in volo non possono essere colpiti di nuovo.

## Musica ed effetti

Colonna sonora originale sintetizzata nel browser: organo a più registri, progressione in la minore, melodia, bassi e riverbero da chiesa. Inizia con il pulsante di avvio della partita. **AUDIO ON/OFF** controlla musica ed effetti; il menu mette in pausa la musica. Colpi a vuoto, respinte, fuoricampo, esplosioni, danni e fine partita hanno effetti distinti. Nessun file remoto o servizio esterno.

## Sviluppo

Node.js 24 e npm. Nessuna API o credenziale necessaria.

```sh
npm ci
npm test
npm run build
npm run dev
```

`src/audio.js` contiene musica ed effetti. `src/arena.js` contiene simulazione e punteggio, `src/main.js` gestisce rendering, input, audio e menu. I test verificano la finestra dorata per ogni nemico, punteggio all’uscita, esplosioni a zero punti, invulnerabilità, game over e progressione infinita. Il test dell’interfaccia usa un DOM/canvas simulato: non sostituisce una verifica visiva nel browser.

Vercel importa `der1988/fathermckenzie`, branch `main`, preset Vite, build `npm run build`, output `dist`. Nessuna variabile d’ambiente. I push sul branch pubblicano il gioco.
