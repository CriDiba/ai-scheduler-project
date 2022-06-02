# Intelligenza Artificiale - Progetto d'esame

Scopo del progetto è la realizzazione di un Master Production Scheduler (_MPS_), ossia un algoritmo per la pianificazione della produzione di un'azienda produttrice di oggetti in vetro.
Il problema posto, difficilmente risolvibile in modo ottimale data la complessità e la numerosità dei vincoli, è stato approcciato applicando un meta-algoritmo di ricerca locale che, attraverso approcci probabilistici, esplora lo spazio degli stati alla ricerca di un massimo/minimo globale. L'ottimalità della soluzione finale non è ovviamente garantita ma, permettendo all'algoritmo di esplorare per abbastanza tempo, si può ottenere una buona soluzione.

## Indice

1. [Definizione del problema](#definizione-del-problema)
   1. [Dati di input](#dati-di-input)
   2. [Dati di output](#dati-di-output)
   3. [Assunzioni](#assunzioni)
2. [Definizione dei vincoli](#definizione-dei-vincoli)
   1. [Vincoli Hard](#vincoli-hard)
   2. [Vincoli Soft](#vincoli-soft)
3. [Approccio risolutivo](#approccio-risolutivo)
4. [Conclusioni](#conclusioni)
5. [Autori](#autori)

## Definizione del problema

Dato un insieme di prodotti, la cui richiesta non è coperta dalle scorte di magazzino, si vuole pianificarne la produzione.
L'algoritmo deve quindi ordinare i prodotti sulle linee di produzione disponibili minimizzando il costo di cambio (configurazione della linea) tra una lavorazione e la successiva e minimizzando il ritardo tra la fine della produzione e la data di consegna di ciascun prodotto.

Il problema in questione è un caso particolare del più famoso [Optimal Job Scheduling Problem](https://en.wikipedia.org/wiki/Optimal_job_scheduling), largamente trattato in letteratura.
Nel problema dello scheduling ottimo sono dati un insieme di $n$ _jobs_ (o _tasks_) ed un insieme di $m$ processori (o macchine). Ogni job ha associato un numero intero $\tau_i$ che rappresenta il tempo necessario alla sua esecuzione.
L'output del problema è uno schedule $\sigma$, che consiste in un assegnamento dei job alle macchine tale da ottimizzare una qualche funzione obiettivo.

### Dati di input

- Un insieme di $n$ jobs: $J = \left \{j_{1}, ... , j_{n}\right\}$

- Un insieme di $q$ macchine: $M = \{m_{1}, ... , m_{q}\}$
- Ogni job $j_i \in J$ ha una durata associata $\tau_i$, viene definito quindi l'insieme $T = \{\tau_{1}, ... , \tau_{n}\}$ delle durate di ciascun job, esse rappresentano il tempo di produzione in giorni relativo a quel job.
- Ogni job $j_i \in J$ ha una data di scadenza $d_i$ entro la quale è necessario produrlo, l'insieme $D = \{d_{1}, ... , d_{n}\}$ contiene le date di scadenza di ogni job.
- Ogni job può essere prodotto solo su un sottoinsieme delle macchine disponibili, viene definita quindi una matrice di compatibilità $C$ di dimensioni $m \times n$, tale che $c_{ij} = 1$ se il job $j_j$ è compatibile con la macchina $m_i$, $c_{ij} = 0$ altrimenti.
- Ogni job $j_i \in J$ necessita di una specifica configurazione della macchina per poter essere prodotto, in particolare si deve tener conto di:
  - _altezza della macchina_: $height \in \{0,1\}$
  - _forma della macchina_: $shape \in \{0,1\}$
  - _gabbia_, tipo di supporto pressante della macchina: $cage \in \{0,1\}$
  - _diametro couvette_, diametro del foro da cui esce il vetro: $couvette \in \{0,1,2,3,4,5\}$
  - _ribruciatrice_, indica la presenza o meno di questo componente, essenziale per alcuni tipi di produzione: $remeltingMachine \in \{0,1\}$
- L'insieme $S = \{s_{1}, ... , s_{n}\}$ associa ad ogni job la configurazione della macchina richiesta.
- Alcuni job sono correlati, si definisce quindi una matrice $R$ di dimensione $n \times n$ tale che $r_{ij} = 1$ se il job $j_i$ ed il job $j_j$ sono correlati fra loro, $r_{ij} = 0$ altrimenti.

### Dati di output

Lo schedule $\sigma$ è rappresentato da una sequenza di job che vengono assegnati ad ogni macchina. Per semplicità consideriamo uno schedule _left-justified_ in cui l'istante di inizio del primo job è il tempo 0 e tutti gli altri job sulla stessa macchina vengono eseguiti in successione).
A partire da questa rappresentazione è possibile costruire uno schedule in modo univoco. Un esempio di tale schedule è mostrato nella tabella seguente.

| M     |         |         |         |          |
| ----- | ------- | ------- | ------- | -------- |
| $m_1$ | $j_{2}$ | $j_{7}$ | $j_{4}$ | $j_{9}$  |
| $m_2$ | $j_{1}$ | $j_{2}$ | $j_{8}$ |          |
| $m_3$ | $j_{3}$ | $j_{5}$ | $j_{6}$ | $j_{10}$ |

### Assunzioni

Ogni job, per poter essere eseguito impiega un tempo $\tau_i$ uguale su ogni macchina.

**[Torna su](#indice)**

## Definizione dei vincoli

Si vuole produrre uno schedule $\sigma$ che tale che i vincoli hard siano soddisfatti ed i vincoli soft, rappresentati come funzioni di costo, siano minimizzati.

### Vincoli Hard

- **Compatibilità macchine**: ogni job può essere schedulato solo sulle macchine compatibili. Questo vincolo viene sempre rispettato dall'algoritmo durante la generazione dello schedule.

- **Tempo di cooldown**: i job correlati non possono essere in esecuzione contemporaneamente, ne possono essere programmati a meno di $CooldownTime$ giorni di distanza.
  Tale vincolo hard è mappato come una funzione obiettivo da minimizzare, per assicurarci che questo vincolo non venga violato viene assegnato un peso elevato.

### Vincoli Soft

- **Ritardo**: si vuole minimizzare il ritardo sulla consegna, si definisce quindi una funzione obiettivo da minimizzare che rappresenta la somma dei ritardi rispetto alla scadenza di ogni prodotto.
  $Tardiness(\sigma) = \sum_{i=1}^{n} \max(0, (\sigma_i + \tau_i) - d_i)$

- **Costo di cambio**: si vuole minimizzare il costo di configurazione totale delle macchine.
  Ogni cambio del settaggio macchina tra una produzione e la successiva ha un costo quantificato in punti.

| Tipo cambio   | Costo    |
| ------------- | -------- |
| Couvette (\*) | 30xSalto |
| Gabbia        | 65       |
| Altezza       | 10       |
| Forma         | 50       |
| Ribruciatrice | 1000     |

(\*) La couvette è definita come una sequenza di possibili valori del diametro $[d_1, d_2, ..., d_n]$. La modifica del diametro dal valore attuale $d_i$ al valore richiesto $d_{i+k}$ (oppure $d_{i-k}$ comporta un costo di $30 \times k$ in cui $k$ corrisponde al numero di salti effettuati.

- **Numero di cambi giornalieri/settimanali**: iniziare una nuova produzione su una macchina richiede una certa quantità di manodopera, che purtoppo è limitata, per effettuare il settaggio. Il numero di job che possono quindi essere inziati ogni giorno è limitato da un valore $MaxDailyChanges$. Lo stesso ragionamento vale per il numero di cambi effettuati nell'arco di una settimana.

**[Torna su](#indice)**

## Approccio risolutivo

La scelta dell'algoritmo con cui trattare il problema è stata quella del [**Simulated annealing**](https://en.wikipedia.org/wiki/Simulated_annealing): la motivazione deriva soprattutto dal fatto che per questo problema trovare l'ottimo risulta difficile e richiede un algoritmo esponenziale nella taglia dell'input.
Pertanto con questo approccio basato sulla probabilità si mira ad ottenere dei risultati sub-ottimi in un tempo ragionevole.
La ricerca locale inizia da uno _stato iniziale_ generato casualmente e la scelta dello stato successore è effettuata randomicamente scegliendo fra un insieme di _stati vicini_.
Per evitare lo stallo in situazioni di punti di massimo o minimo locali come accade in altri algoritmi di ricerca (es. hill climbing), simulated annealing ammette la possibilità di effettuare mosse peggiorative con una probabilità ponderata allo scarto del peggioramento e al tempo di esecuzione.

È necessario quindi definire alcune funzioni utilizzate dall'algoritmo:

- lo _stato_ del problema: la scelta più naturale è stata quella di usare uno schedule completo come stato; lo stato iniziale viene generato riempiendo lo schedule in maniera iterativa con tutti i job a disposizione.

- i _vicini_ dello stato: ovvero tutti quegli schedule che differiscono da quello dello stato attuale per uno scambio di posizione di due job; gli scambi di posizione dei job avvengono in tre modi: scambio di due job sulla stessa linea, scambio di job sulla stessa colonna e infine scambio casuale di due job.

- il _valore_ dello stato: questa misura dipende direttamente dalle funzioni di costo definite nella descrizione del problema e che vogliamo minimizzare; in base all'importanza che si attribuisce ad ogni funzione viene scelto un peso associato altrettanto significativo, inoltre tutti quei vincoli che sono definiti come _hard constraint_ vengono associati a _soft constraint_ con un peso di molto superiore rispetto agli altri.

**[Torna su](#indice)**

## Conclusioni

Grazie al progetto abbiamo potuto sperimentare l'applicabilità di un meta-algoritmo di ricerca come il _Simulated-Annealing_ in un contesto reale, riuscendo a generare uno schedule che non solo rispetta tutti i vincoli hard da noi imposti ma ottimizza le funzioni obiettivo.
Il problema presentato però non descrive completamente la complessità della situazione reale, in quanto sarebbe necessario introdurre ulteriori vincoli quali:

- Calendario fabbrica: rappresentato da una tabella contenente per ogni giorno:
  1.  Numero di macchine disponibili
  2.  Numero di macchine attivabili
  3.  Numero di cambi consentiti
- Vincoli sulla quantità massima prodotta nei diversi giorni
- ...

I suddetti vincoli però richiederebbero la costruzione di uno stato del simulated annealing ben più complesso, per riuscire a tenere traccia dell'andamento dei giorni del calendario. Questo renderebbe l'algoritmo da noi proposto meno performante.

**[Torna su](#indice)**

## Autori

- **[Cristiano Di Bari](https://github.com/CriDiba)**
- **[Matteo Cavaliere](https://github.com/Kaskeeeee)**

**[Torna su](#indice)**
