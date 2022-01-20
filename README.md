# Intelligenza Artificiale - Progetto d'esame

Studenti:

- Cristiano Di Bari - VR476576
- Matteo Cavaliere - VR??????

Anno Accademico: 2021/2022

## Documento di specifica e analisi dei requisti

### Definizione del problema

Scopo del progetto è la realizzazione di un Master Production Scheduler (MPS), ossia un algoritmo per la pianficazione della produzione nel reparto forni di un'azienda produttrice di oggetti in vetro.

Si vuole pianificare la produzione solo per i prodotti la cui richiesta, nei prossimi X giorni, non è coperta dalle scorte di magazzino. L'algoritmo deve quindi ordinare i prodotti sulle linee di produzione minimizzando il costo di cambio tra una lavorazione e la successiva.

#### Dati di input

- `L` **Linee di produzione** sulle quali è possibile produrre gli articoli, ogni linea è caratterizzata da:

  1.  _Forno_ a cui è associata la linea
  2.  _Diametro couvette_: il diametro del foro da cui esce il vetro per essere stampato
  3.  _Gabbia_: tipo di supporto pressante della macchina
  4.  _Altezza_ della linea
  5.  _Forma_
  6.  _Ribruciatrice_: la presenza o meno di questo componente, essenziale per alcuni tipi di produzione

- `M` **Matrici**: ogni matrice è formata da uno o più prodotti compatibili che andranno in disponibilità negativa nei prossimi `D` giorni:

  1.  _Setup linea_: la configurazione della linea necessaria per produrre la matrice
  2.  _Peso_:
  3.  _Colpi feeder ideali_:
  4.  _Ultimi colpi feeder usati_:
  5.  _Numero pezzi_: stima dei pezzi prodotti con la matrice.
  6.  _Linee compatibili_: lista delle linee su cui la matrice può essere prodotta.
  7.  _Data rottura di stock_: data in cui la matrice andrà in disponibilità negativa.
  8.  Giorni di produzione di una matrice: proporzione (colpi feeder/cf budget = pb ora/pb ora budget)

- **Calendario fabbrica**, per ogni giorni:

  1.  _Numero di linee disponibili_: quante sono
  2.  _Linee attivabili_ : quali sono
  3.  Giorni in cui posso effettuare il cambio matrice (Dove sono): il sabato e la domenica

- **Calendario matrici**: per ogni giorno quali matrici sono disponibili

- `t0`: tempo minimo per cui una matrice rimane in produzione

- `tm`: tempo massimo per cui una matrice rimane in produzione

- `tc` **Tempo di cooldown**: ovvero tempo minimo che intercorre fra due produzioni della stessa matrice

- `N` numero cambi di matrice massimi al giorno

- `D` giorni di durata dello schedule da generare

- `C` cavato massimo di un forno

- Delta massimo di incremento cavato di un forno in un giorno

#### Dati di output

- **Schedule**: una sequenza di
  - _Matrice_ da produrre
  - _Linea_ su cui produrre la matrice
  - _Giorno inizio_ della produzione
  - _Giorno fine_ della produzione
  - _Colpi feeder_ associati alla matrice

### Calcolo del costo di produzione

Ogni linea ha una serie di parametri modificabili, definiti _settaggi macchina_. Per mettere in produzione una matrice su una determinata linea è necessario che i settaggi macchina siano compatibili con il setup richiesto dalla matrice.
Ogni cambio del settaggio macchina ha un costo quantificato in punti.

| Tipo cambio   | Costo    |
| ------------- | -------- |
| Couvette (\*) | 30xSalto |
| Gabbia        | 65       |
| Altezza       | 10       |
| Forma         | 50       |
| Ribruciatrice | 1000     |

(\*) La couvette è definita come una sequenza di possibili valori del diametro `[d1, d2, ..., dn]`. La modifica del diametro dal valore attuale `di` al valore richiesto `di+k` (oppure `di-k`) comporta un costo di `30*k` in cui `k` corrisponde al numero di salti effettuati.

### Vincoli

- La stessa matrice non può essere in produzione contemporaneamente su due linee.

- Non è possibile sforare il cavato massimo giornaliero del forno, calcolato come la somma dei cavati delle linee associate. Cambiando il numero di colpi feeder della matrice è possibile bilanciare il vincolo del cavato producendo un numero superiore di pezzi.

- Il diametro couvette della linea di produzione deve essere uguale a quello della matrice da produrre.

- La gabbia della linea di produzione deve essere compatibile con quella della matrice da produrre.

- Le linee di produzione devono avere la configurazione adeguata per produrre una determinata matrice.

- Deve essere rispettato il calendario fabbrica.

- Vanno rispettati i vincoli determinati dai parametri tempo minimi e massimi relativi alle matrici.

### Definizioni

- **Cavato linea**: quantitativo di materia prima (vetro) utilizzata dalla linea nell’arco di una giornata calcolata in [tonnellate/giorno]. Calcolato come: (Colpi Feeder [colpo/1’] _ Peso Articolo [grammi] _ 60 [minuti] \* 24[ore]) / 10E6 [Ton]

- **Cavato forno**: sommatoria dei cavati delle linee appartenenti a quel forno (tonnellate / giorno).

- **Diametro couvette**: diametro del foro dal quale il vetro esce dal forno per poter essere stampato, dipende direttamente dal peso dell’articolo.

- **Gabbia**: supporto pressante della macchina legato all’attrezzatura.

- **Cambio articolo**: si intende il cambio totale di produzione ovvero c’è una variazione di cod. matrice tra la produzione attuale e la successiva.

- **Prodotti in rottura di stock**: prodotti che andranno in disponibilità negativa, per i quali la richiesta è maggiore delle scorte di magazzino.
