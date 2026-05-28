# DevPath RO — Schelet Curricular v4 DEFINITIV
> 12 cursuri · 321 lecții · "De la electron la agenți autonomi"
> Versiune finală: Mai 2026 | Închis pentru adăugiri — urmează formatul lecțiilor

---

## Filozofia Curriculară

**Pedagogie validată:**
- **Karpathy / Zero-to-Hero** — code-first, construiești de la zero, teoria vine din ce ai construit
- **fast.ai** — aplicație reală în lecția 1, abstractizarea vine după
- **DeepLearning.AI 2026** — modular, aliniat cu stack-ul de producție real
- **HuggingFace Agents Course** — learning-by-doing cu artefacte publice reale

**Principii fixe:**
- 1 lecție = 1 concept = 8–15 min = un singur obiectiv de învățare
- Hook în primele 30 de secunde — "de ce contează asta AZI în piață"
- Fiecare curs se termină cu un Boss Fight (sinteză practică)
- Progresie strictă — fiecare curs presupune cursul anterior terminat
- Ton: conversațional tehnic — explici unui prieten deștept, nu citești un manual
- Dificultate: 1–5 numeric, niciodată etichete generice
- Framework primar: **PyTorch** (37.7% din postările AI jobs); TensorFlow menționat contextual

---

## CURSUL 1 — Hardware & Fizică
> *De la electronul fizic la primul procesor virtual asamblat de tine*
> **30 lecții** · Dificultate: 2/5

### Modul 1.0 — Hook
1. [HOOK] Cum funcționează ecranul telefonului tău? — pixeli, curent, tranzistori în 10 min

### Modul 1.1 — Electricitate & Semiconductori
2. Ce este electricitatea? (curent, tensiune, rezistență — analogia cu conducta de apă)
3. Circuitul închis (mini-joc: conectezi bateria la bec cu degetul)
4. Conductoare vs. izolatoare (testezi materiale, becul se aprinde sau nu)
5. Analogic vs. Digital (variatorul rotativ vs. întrerupătorul On/Off)
6. Semiconductorii — de la nisip la siliciu (animație narativă)
7. Tranzistorul — robinet electric controlat de tensiune, nu mecanic
8. [LAB] Aprinde tranzistorul — aplici tensiune pe Gate și observi efectul

### Modul 1.2 — Logică Binară & Porți Logice
9. Sistemul binar — becuri aprinse și stinse ca cifre
10. [JOC] Traducătorul Binar — zecimal → binar contracronometru
11. Poarta NOT — transformi 1 în 0
12. Poarta AND — becul se aprinde doar dacă AMBELE sunt active
13. Poarta OR — becul se aprinde dacă CEL PUȚIN UNA e activă
14. Poarta XOR — becul se aprinde dacă EXACT UNA e activă
15. NAND — cărămida Lego universală a logicii digitale
16. [BOSS] Alarma de Seif — combini AND + OR + NOT pentru o alarmă funcțională

### Modul 1.3 — Circuite Aritmetice & Memorie
17. Half-Adder — prima adunare matematică construită din porți logice
18. Full-Adder — adunăm numere mari cu carry propagat
19. Multiplexorul — macazul de date care alege un semnal din mai multe
20. Ceasul de sistem — ce înseamnă 3.6 GHz în realitate
21. Flip-Flop — primul bit de memorie dintr-o buclă de porți
22. Registrele — 8 flip-flop-uri = un caracter stocat
23. [JOC] Grila Memoriei RAM — scrii și citești din adrese numerice

### Modul 1.4 — Arhitectura CPU
24. Unitatea Aritmetică (ALU) — calculatorul de buzunar al procesorului
25. Unitatea de Control — dirijorul care citește și execută instrucțiunile
26. Program Counter — ține minte la ce linie de cod a ajuns execuția
27. Ciclul Fetch-Decode-Execute — animație completă pas cu pas
28. Arhitectura Von Neumann — de ce datele și codul stau în aceeași memorie
29. [BOSS] Asamblează CPU — puzzle drag-and-drop: ALU + Registre + Control Unit

### Modul 1.5 — Primul Contact cu Codul Mașinii
30. De la binar la Assembly — LOAD, ADD, JUMP (primul strat de abstracție)

---

## CURSUL 2 — Sisteme de Operare
> *Ce se întâmplă în interiorul mașinii tale după ce apeși butonul de pornire*
> **22 lecții** · Dificultate: 2.5/5
> Stack: Bash, SSH, Linux CLI

### Modul 2.1 — Boot & Structura OS
1. [HOOK] Procesul de Boot — de la curent electric la desktop în 45 de secunde
2. Anatomia OS-ului: Kernel vs. Shell (model 3D interactiv)
3. User Mode vs. Kernel Mode — punctul de control vamal pentru aplicații
4. Nașterea unui Proces — dublu-click: fișierul mort devine entitate vie în RAM

### Modul 2.2 — Procese & Concurență
5. Context Switching — bucătarul cu o singură mână care gătește 5 feluri simultan
6. Firele de Execuție (Threads) — robotul care se divide, toate firele împart aceeași memorie
7. Deadlock-uri — [ESCAPE ROOM] Procesul A vrea ce are B, B vrea ce are A
8. Race Conditions — doi programatori editează același fișier în același timp

### Modul 2.3 — Gestiunea Memoriei
9. Fragmentarea Memoriei — [JOC TETRIS] introduci și ștergi blocuri inegale din RAM
10. Simulatorul de Paginare — mapezi Pages în Frames manual cu un tabel de translație
11. Memoria Virtuală și Swap — scenariul de criză: RAM 100% plin, muți pe disc
12. Garbage Collector — robotul de curățenie care ridică referințele orfane

### Modul 2.4 — Sisteme de Fișiere
13. Arhitectura Sistemelor de Fișiere — modelul 3D: sectoare, foldere, permisiuni
14. Permisiuni Unix (rwx) — cine poate citi, scrie, executa și de ce contează

### Modul 2.5 — Virtualizare & Containere
15. Mașini Virtuale și Hypervisors — autobuzul care transportă mai multe OS-uri
16. Containere Docker vs. VM — împarți fundația, muți doar mobila
17. Orchestrare Kubernetes — [JOC TYCOON] scalezi containere când explodează traficul

### Modul 2.6 — Linia de Comandă
18. Shell-ul și primele comenzi — navigare, fișiere, procese (ghid practic)
19. Scripturi Bash — automatizezi sarcinile repetitive
20. SSH — conectare securizată la un server remote
21. Variabile de mediu și .env — secretele care nu intră niciodată în cod

### Recapitulare
22. [BOSS] Administratorul de Sistem — memory leak + deadlock + scalare container sub presiune

---

## CURSUL 3 — Rețele & Internet
> *Cum ajunge un pachet de date de la tastatura ta la un server din Tokyo în 80ms*
> **26 lecții** · Dificultate: 2.5/5
> Stack: DevTools Network tab, curl, Wireshark basic

### Modul 3.1 — Fundamentele Rețelelor
1. [HOOK] Trimiți un mesaj pe WhatsApp — ce se întâmplă în realitate în 80ms?
2. LAN și adresele MAC — identitatea fizică gravată pe placa de rețea
3. Adresele IP — codul poștal digital (de ce se schimbă la cafenea)
4. DNS — agenda telefonică globală ([JOC] vânătoare de comori la serverele DNS)
5. Lățime de bandă vs. Latență — diametrul țevii vs. viteza primei picături

### Modul 3.2 — Protocoale de Transport
6. TCP vs. UDP — firma de curierat cu semnătură vs. băiatul pe bicicletă
7. [SIMULATOR] TCP/IP Exhaustiv — o imagine tăiată în pachete, colorată binar, reasamblată
8. Modelul OSI — cele 7 straturi (piramida animată cu date coborând strat cu strat)
9. Porturile — clădirea cu 65.535 de uși numerotate

### Modul 3.3 — Arhitectura Internetului
10. Rutarea pachetelor — [LABIRINT] alegi calea cu cea mai mică congestie
11. NAT — 10 telefoane împart o singură adresă IP publică
12. Proxy Forward — asistentul personal care face cererea în locul tău
13. Reverse Proxy — recepția hotelului care ascunde serverele din spate
14. Load Balancer — șeful de sală care distribuie clienții uniform
15. CDN — depozitele regionale: conținutul e deja lângă tine

### Modul 3.4 — Securitate în Rețele
16. Criptografia Asimetrică — cutia cu lacăt deschis pe care oricine îl poate închide
17. SSL/TLS Handshake — [RHYTHM GAME] negociezi algoritm + cheie cu serverul
18. Firewall — [TOWER DEFENSE] scrii politici Allow/Drop pentru pachete
19. VPN — tunelul criptat prin internetul public

### Modul 3.5 — Web & API
20. HTTP — limbajul browserelor (GET, POST, coduri de răspuns 200/404/500)
21. REST vs. GraphQL — când trimiți mai mult decât ai nevoie vs. exact ce vrei
22. API — chelnerul care nu îți lasă să intri în bucătărie
23. WebSockets — ușa care rămâne deschisă permanent (chat real-time)
24. Webhooks — serverul care te sună el pe tine când se întâmplă ceva
25. JSON-RPC — protocolul din spatele MCP și al multor tool-uri moderne

### Recapitulare
26. [BOSS] Arhitectul de Cloud — desenezi pe tablă: DNS → LB → Reverse Proxy → Containere → DB

---

## CURSUL 4 — Python & Inginerie Software
> *Gândire algoritmică, cod curat și uneltele cu care lucrează orice inginer în 2026*
> **38 lecții** · Dificultate: 2.5/5
> Stack: Python 3.12+, Pydantic, FastAPI, pytest, uv, Git, asyncio

### Modul 4.1 — Fundamente Python
1. [HOOK] 3 linii de Python care ating internetul — primul program util imediat
2. Sintaxa — instrucțiuni rigide vs. limbaj natural ambiguu
3. Variabile — cutii de carton cu etichete în RAM
4. Tipuri de date primitive — [JOC SORTARE] int, float, str, bool în forme geometrice
5. Operatori aritmetici și logici (inclusiv Modulo, AND/OR în cod)
6. Structuri decizionale If/Elif/Else — macazul de tren
7. Bucle FOR — muncitorul care bate 100 de cuie fără oboseală
8. Bucle WHILE și pericolul buclei infinite — simulatorul inundației
9. Funcții — fabrici de mini-cod (parametri → procesare → return)
10. Scope: Local vs. Global — casa cu geamuri opace
11. Try/Except — plasa de siguranță pentru cod periculos

### Modul 4.2 — Structuri de Date Python
12. Liste — rafturile ordonate, indexare de la 0
13. Dicționare (Hash Maps) — garderoba cu tichet, acces O(1)
14. Tuple-uri — listele imutabile, de ce există
15. Set-uri — colecția fără duplicate
16. Mutabilitate vs. Imutabilitate — de ce trimiterea unei liste e periculoasă

### Modul 4.3 — OOP (Programare Orientată pe Obiecte)
17. Clase și Obiecte — matrița și piesele turnate din ea
18. Atribute și Metode — stările și acțiunile robotului tău
19. Encapsulare — carcasa aparatului de cafea (Public vs. Private)
20. Moștenire — arborele genealogic tehnologic
21. Polimorfism — dirijorul dă o comandă, fiecare instrument răspunde diferit

### Modul 4.4 — Design Patterns
22. Singleton — garantezi o singură instanță a conexiunii la baza de date
23. Factory — centrul de logistică care creează obiecte fără să expună complexitatea
24. Observer — clopotul satului la care sătenii se abonează (baza UI reactiv)
25. Strategy — înlocuiești algoritmul din zbor fără să schimbi codul din jur

### Modul 4.5 — Python Avansat
26. List Comprehensions — bucla de 5 linii într-o singură expresie elegantă
27. Generatoare și yield — o carte pe rând, nu biblioteca întreagă în RAM
28. Decoratori — superputeri la pachet cu @, fără să atingi funcția originală
29. Async/Await — bucătarul care nu stă cu mâinile încrucișate așteptând apa să fiarbă
30. Gestionarea Fișierelor (File I/O) — open(), with, read/write/append
31. Expresii Regulate (RegEx) — chirurgia textului, extragi email-uri din haos
32. Modulul requests — conectezi Python la orice API din lume
33. Serializare JSON + Pydantic — validare automată a datelor din API (standard în 2026)

### Modul 4.6 — Inginerie Software Profesională
34. uv + Virtual Environments + pyproject.toml — setup profesional de proiect Python în 2026
35. pytest — scrii teste automate, nu mai verifici manual de fiecare dată
36. FastAPI — primul tău API REST funcțional în 15 linii (GET, POST, validare Pydantic)
37. Git — commit, branch, merge, rebase (mașina timpului pentru cod)
38. [BOSS] Aplicația Completă — API meteo → Pydantic → FastAPI endpoint → pytest → Git commit

---

## CURSUL 5 — Algoritmi & Structuri de Date
> *Diferența dintre cod care merge și cod care scalează la milioane de utilizatori*
> **20 lecții** · Dificultate: 3/5
> Stack: Python pur, vizualizări algoritmice interactive

### Modul 5.1 — Complexitate Algoritmică
1. [HOOK] De ce aplicația ta îngheață la 10.000 de utilizatori? (O(N²) în producție)
2. Căutare Liniară vs. Binară — [JOC] ghicești numărul 1–100, câte încercări?
3. Notarea Big O — graficul curbelor de creștere (O(1) la O(2^N))
4. Space-Time Tradeoff — sacrifici RAM pentru viteză sau invers

### Modul 5.2 — Algoritmi de Sortare
5. Bubble Sort — eprubete împinse una câte una, O(N²), vizual și lent
6. Quick Sort — Divide et Impera, O(N log N) în medie
7. Merge Sort — împarți, sortezi bucăți, reunești garantat O(N log N)
8. Heap Sort și TimSort — ce folosesc Python și Java în realitate și de ce

### Modul 5.3 — Structuri de Date Avansate
9. Arbori Binari de Căutare (BST) — căutare O(log N) în structuri ierarhice
10. Heap — cel mai mare/mic element mereu la vârf, O(1) acces
11. Grafuri — noduri și muchii (rețele sociale, hărți, dependențe de cod)
12. BFS vs. DFS — explorezi în lățime (cel mai scurt drum) vs. în adâncime
13. Algoritmul lui Dijkstra — cel mai scurt drum în grafuri ponderate
14. Trie — structura optimă pentru autocomplete și dicționare

### Modul 5.4 — Tehnici Algoritmice
15. Recursivitate — păpușa Matrioșka care se apelează singură
16. Memoization — bilețelul cu răspunsuri deja calculate
17. Programare Dinamică — construiești soluția optimă din sub-soluții
18. Greedy Algorithms — alegi mereu ce pare cel mai bun local (când merge, când nu)
19. Two Pointers & Sliding Window — tehnici frecvente în interviuri tehnice

### Recapitulare
20. [BOSS] Optimizatorul — primești cod real lent O(N²), îl aduci la O(N log N) pas cu pas

---

## CURSUL 6 — Baze de Date & Ingineria Datelor
> *De la un tabel Excel la un pipeline care alimentează un model AI*
> **27 lecții** · Dificultate: 3/5
> Stack: PostgreSQL, MongoDB, Redis, pgvector, Pandas, Kafka basic

### Modul 6.1 — SQL & Baze Relaționale
1. [HOOK] Excel vs. Server Database — panica la 5 milioane de rânduri
2. Schema, rânduri, coloane — proiectezi baza unui magazin virtual de la zero
3. CRUD — CREATE, READ, UPDATE, DELETE (joc în linia de comandă)
4. Clauza WHERE și filtrarea — detectiv în tranzacții bancare suspecte
5. Chei Primare — de ce există doi "Popescu Ion" și cum rezolvi ambiguitatea
6. Foreign Keys și Normalizarea — nu scrii "București" de 3 milioane de ori
7. JOIN-uri — reunești tabelele separate (INNER, LEFT, RIGHT, FULL)
8. GROUP BY și Agregările — profitul pe departament dintr-o singură comandă
9. Indexarea — cuprinsul bazei, de la O(N) la O(log N) pe milioane de rânduri
10. Tranzacțiile ACID — transferul bancar când pică curentul la jumătate

### Modul 6.2 — NoSQL & Baze Specializate
11. De ce a apărut NoSQL — profilul de Facebook nu stă în tabele rigide
12. Baze Documentare (MongoDB) — JSON ca unitate de stocare, schema flexibilă
13. Baze de tip Graf (Neo4j) — "prietenii prietenilor" în milisecunde
14. Redis — caching volatil în RAM pentru 100.000 cereri/secundă
15. Teorema CAP — Consistency vs. Availability vs. Partition Tolerance

### Modul 6.3 — Ingineria Datelor (ETL)
16. Ce este un Data Pipeline — rafinăria de petrol digitală
17. Extract — conectare la API-uri externe, rate limits, autentificare OAuth
18. Transform — curățare date (Null, outlieri, tipuri greșite, duplicate)
19. Load — depozitarea curată în Data Warehouse / Data Lake
20. Automatizare — Cron Jobs și Airflow, rulezi noaptea la 3 AM
21. Data Streaming (Kafka) — de la batch zilnic la procesare real-time

### Modul 6.4 — Baze Vectoriale
22. Limitarea căutării exacte — "Mașină" nu găsește "Automobil"
23. Embeddings — cuvântul "Rege" devine 1536 de numere cu sens geometric
24. Geometria semantică — "Câine" și "Lup" stau aproape în spațiu N-dimensional
25. Cosine Similarity — unghiul dintre vectori măsoară înrudirea conceptelor
26. Vector Databases (pgvector, Qdrant, Pinecone) — indexare HNSW pentru miliarde de vectori
27. [BOSS] Sistemul de Căutare Semantică — PDF → chunks → embeddings → query → răspuns

---

## CURSUL 7 — Matematică pentru AI
> *Transformi ecuațiile din manual în instrumente vizuale pe care le simți*
> **21 lecții** · Dificultate: 3/5
> Stack: NumPy, Matplotlib, vizualizări 3D interactive

### Modul 7.1 — Algebră Liniară
1. [HOOK] De ce AI-ul nu înțelege cuvinte — înțelege vectori și unghiuri
2. Scalari și Vectori — săgeți cu magnitudine și direcție în spațiu
3. Produsul Scalar (Dot Product) — măsori similaritatea dintre două idei
4. Matrici — spațiul ca o foaie elastică (deformezi o grilă 2D vizual)
5. Înmulțirea Matricială — combini transformările (rotire × lățire = o singură operație)
6. Transpusa, Inversa și Determinantul — volumul deformat al spațiului informației

### Modul 7.2 — Probabilități & Statistică
7. Distribuția Normală — arunci 1000 de zaruri și apare clopotul lui Gauss
8. Teorema lui Bayes — probabilitatea condiționată ([JOC DETECTIV] updatezi suspectul)
9. Entropie Shannon — cutia cu monede identice vs. cutia cu 10 animale diferite
10. Cross-Entropie — cât de departe e predicția de realitate (funcția de pierdere)
11. Divergența KL — navighezi cu o hartă veche, măsori energia pierdută

### Modul 7.3 — Calcul Diferențial
12. Funcții și continuitate — mărești o curbă la microscop și devine dreaptă
13. Derivata — panta muntelui exact sub schior (rata de schimbare instantanee)
14. Regula Lanțului (Chain Rule) — angrenajele înlănțuite, vital pentru Backpropagation
15. Gradienți — busola multidimensională spre cel mai abrupt coborâș

### Modul 7.4 — Data Science & EDA
16. Introducere în Pandas — Excel pe steroizi, filtrezi 1M rânduri instantaneu
17. Curățarea Datelor — imputare NaN, triaj medical pe date incomplete
18. Detectarea Anomaliilor — cumpărătura de $1.000.000 în tabelul de cafele
19. Explorarea Datelor (EDA) — corelații invizibile ochiului liber
20. Vizualizări cu Matplotlib/Seaborn — datele care spun o poveste fără text

### Recapitulare
21. [BOSS] Coborârea pe Gradient — parașutat pe munte 3D, găsești valea minimă manual

---

## CURSUL 8 — Machine Learning
> *Primul tău model care învață din date, fără reguli scrise de tine*
> **22 lecții** · Dificultate: 3.5/5
> Stack: scikit-learn, PyTorch basic, Jupyter

### Modul 8.1 — ML Supervizat
1. [HOOK] De la IF/ELSE la Predicție — ce înseamnă "a învăța din date"
2. Regresia Liniară — tragi o linie prin haosul punctelor (prețuri de case)
3. Funcția de Pierdere (Loss) — termometrul erorii modelului
4. Gradient Descent — algoritmul care minimizează pierderea automat
5. Regresia Logistică — granița care separă câinii de pisici cu probabilitate
6. Arbori de Decizie — Akinator construit de tine
7. Random Forest — 100 de arbori votează democratic (Ensemble Learning)
8. Overfitting vs. Underfitting — haina mulată pe fiecare cută vs. haina sac
9. Cross-Validation și Hyperparameter Tuning — testezi pe date nevăzute

### Modul 8.2 — ML Nesupervizat
10. K-Means Clustering — magneții care grupează clienții mall-ului
11. Reducerea Dimensionalității (PCA) — umbra 3D a obiectului proiectată în 2D
12. Detectarea Anomaliilor Nesupervizate — Isolation Forest pentru fraude

### Modul 8.3 — Reinforcement Learning
13. Agentul și Mediul — cățelușul în labirint cu recompense și penalizări
14. Q-Learning — tabela de stări completată în timp real
15. Dilema Explorare vs. Exploatare — pizzeria bună vs. restaurantul necunoscut
16. Deep Q-Networks (DQN) — Q-Learning cu rețea neuronală ca tabel infinit

### Modul 8.4 — Hardware pentru ML
17. CPU vs. GPU — profesorul genial vs. armata de elevi de clasa a doua
18. Arhitectura GPU — autostrada de mii de benzi în paralel
19. VRAM și Bandwidth — gâtuiala nr. 1 din industria AI
20. CUDA — programezi direct placa video cu blocuri de threaduri
21. Quantizarea — de la FP32 la BF16 la INT8, LLaMA pe laptopul tău

### Recapitulare
22. [BOSS] Supraviețuirea Robotului — antrenezi un agent RL pe circuit virtual în 100 generații

---

## CURSUL 9 — Deep Learning & Computer Vision
> *De la perceptronul simplu la arhitecturile care au schimbat lumea*
> **22 lecții** · Dificultate: 4/5
> Stack: PyTorch, torchvision, HuggingFace transformers, HuggingFace Hub

### Modul 9.1 — Rețele Neuronale
1. [HOOK] De ce 2012 a schimbat totul — ImageNet și explozia Deep Learning
2. Perceptronul — decizia binară din înmulțiri și adunări simple
3. Rețeaua Multistrat (MLP) — straturi de perceptroni, abstractizare în creștere
4. Funcții de Activare (ReLU, Sigmoid, tanh) — non-liniaritatea care face magia posibilă
5. Backpropagation — unda de corecție de la coadă la cap (Regula Lanțului aplicată)
6. Optimizatori (SGD, Adam, AdamW) — variante îmbunătățite de Gradient Descent
7. Regularizare (Dropout, L2, Batch Norm) — previi supra-antrenarea

### Modul 9.2 — Computer Vision
8. Limitarea MLP pe imagini — 4 megapixeli = miliarde de parametri, imposibil
9. Convoluția — lanterna care scanează imaginea cu un filtru 3×3
10. Pooling — comprimi, păstrezi esența, devii imun la poziția obiectului
11. Arhitectura CNN completă (Conv → Pool → Flatten → Dense)
12. Transfer Learning — model antrenat pe 1M imagini, adaptat pentru diagnostice medicale
13. HuggingFace Hub + Spaces — 500.000+ modele publice, publici propriul model în 3 minute
14. Object Detection (YOLO) — identifici și localizezi simultan, real-time

### Modul 9.3 — Arhitecturi Moderne
15. ResNet — skip connections care permit rețele de 100+ straturi fără degradare
16. Vision Transformer (ViT) — pictura tăiată în patch-uri, analizate simultan
17. CNN vs. ViT — când folosești fiecare în 2025-2026
18. Mixture of Experts (MoE) — 671B parametri totali / 37B activi: de ce contează diferența

### Modul 9.4 — Aplicații Practice
19. Clasificare de imagini — antrenezi un model pe un dataset propriu
20. Segmentare semantică — fiecare pixel primește o etichetă de clasă
21. [LAB] Detector de emoții faciale pe webcam live (Transfer Learning, 50 linii PyTorch)
22. [BOSS] De la dataset brut la model deployat pe HuggingFace Spaces — pipeline complet

---

## CURSUL 10 — AI Generativ & LLMs
> *Cum gândește, vorbește și creează un model de limbaj modern*
> **38 lecții** · Dificultate: 4/5
> Stack: PyTorch, HuggingFace TRL, OpenAI API, Anthropic API, Ollama, instructor, Gradio

### Modul 10.1 — Predicția Textului
1. [HOOK] De ce ChatGPT nu știe să numere literele din "strawberry"?
2. Tokenizarea — "Incontestabil" tăiat în bucăți lingvistice cu ID-uri numerice
3. Predicția Următorului Token — ruleta probabilităților pe vocabular de 50.000 tokens
4. Temperatura și Top-P — cât de creativ sau determinist răspunde modelul

### Modul 10.2 — Arhitectura Transformer
5. Limitarea RNN — amnezia algoritmică la texte lungi (o lecție, context și motivație)
6. Mecanismul de Atenție (Self-Attention) — matchmaking-ul cuvintelor din context
7. Query, Key, Value — ce vreau, ce ofer, esența mea
8. Multi-Head Attention — 4 cititori cu perspective diferite simultan
9. Positional Encoding — modelul știe ordinea cuvintelor fără procesare secvențială
10. Arhitectura completă Transformer — Encoder, Decoder, Encoder-Decoder
11. Scaling Laws — de ce modelele mai mari sunt mai deștepte (legea puterii)

### Modul 10.3 — Antrenare, Fine-Tuning & Stack-ul de Producție
12. Pre-Training — citești tot internetul (cost: ~$100M, luni de GPU)
13. Post-Training Stack 2026: SFT → DPO → GRPO (de ce PPO clasic a cedat locul)
14. RLHF conceptual — cum înveți modelul să fie politicos prin feedback uman
15. Fine-Tuning vs. Pre-Training — specializarea de 2 zile vs. facultatea de 4 ani
16. LoRA (Low-Rank Adaptation) — post-it-uri pe matricea de 70B parametri
17. QLoRA — 4-bit quantization + LoRA: fine-tuning pe GPU de consumer, nu de datacenter
18. Model Selection Framework — GPT-4o vs. Claude vs. Llama vs. Mistral: cost, perf, privacy, latency
19. Prompt Engineering — zero-shot, few-shot, chain-of-thought, roluri, sistem prompts
20. Structured Outputs cu instructor+Pydantic — JSON garantat 100%, standard de producție
21. Context Window Management — ce faci când documentul e mai lung decât memoria modelului
22. Prompt Caching — 90% reducere cost pe prefixe stabile (Anthropic, OpenAI)
23. Modele Locale cu Ollama — rulezi LLaMA 4, Mistral, Gemma offline, privacy garantat

### Modul 10.4 — Reasoning Models & Frontiere
24. Reasoning Models (o1, o3, DeepSeek-R1) — modelele care gândesc înainte să răspundă
25. Chain-of-Thought — de ce "gândește pas cu pas" îmbunătățește dramatic răspunsurile
26. Long Context vs. RAG — decizia de arhitectură: 1M tokens sau retrieval? (framework complet)
27. Limitele actuale ale LLM-urilor — halucinații, math, context lung, reasoning gaps

### Modul 10.5 — RAG (Retrieval-Augmented Generation)
28. Halucinația — de ce modelul inventează cu convingere maximă
29. Arhitectura RAG — creierul amnezic + memoria externă din Vector DB
30. Chunking Strategies — fixed size vs. semantic chunking, ce alegi și când
31. Reranking — sortezi rezultatele semantice după relevanță reală
32. Advanced RAG — HyDE, Contextual Compression, Hybrid Search (BM25 + vector)
33. GraphRAG (Microsoft) — RAG pe grafuri pentru întrebări multi-hop complexe
34. Evaluarea unui sistem RAG (Faithfulness, Relevance, Groundedness)

### Modul 10.6 — Multimodal & Demo
35. Modele de Difuzie — sculptorul care extrage o imagine clară din zgomot pur (DALL-E, Stable Diffusion, procesul pas cu pas)
36. AI Multimodal — CLIP, patch-uri vizuale, GPT-4V, Claude Vision, Whisper (audio → spectrogramă → text)
37. Gradio — interfață AI interactivă în 5 linii, demo public pe HuggingFace Spaces
38. [BOSS] Sistem RAG Complet — documente proprii → embeddings → query → răspuns citat + Gradio UI

---

## CURSUL 11 — Agentic AI & MCP
> *Modelele care planifică, acționează și se corectează singure*
> **29 lecții** · Dificultate: 4.5/5
> Stack: MCP Python SDK, LangGraph, smolagents, OpenAI Agents SDK, Langfuse, ElevenLabs

### Modul 11.1 — Limitele LLM-ului Pur
1. [HOOK] Creierul în Borcan — de ce GPT nu știe vremea, ora sau fișierele tale
2. Tool Calling — echipezi modelul cu mâini (funcții Python apelabile cu JSON schema)
3. Structured Outputs — modelul răspunde strict în JSON validat cu Pydantic schema
4. ReAct Pattern — Reason + Act: gândește, acționează, observă, repetă

### Modul 11.2 — Model Context Protocol (MCP)
5. De ce MCP? — înainte scriai un cablu diferit pentru Slack, GitHub și SQL
6. Arhitectura MCP: Host, Client, Server — cum comunică cele 3 componente
7. Transport: STDIO vs. HTTP+SSE — local securizat vs. rețea globală
8. MCP Tools — ce poate face un server MCP (acțiuni apelabile cu parametri)
9. MCP Resources — ce poate citi un server MCP (date expuse structurat)
10. MCP Prompts — template-uri predefinite expuse de server
11. [LAB] Primul tău MCP Server — Python SDK, local, 50 de linii, funcțional în Claude Desktop
12. MCP în ecosistem — Notion, GitHub, Stripe, Postman, Cloudflare: mii de servere publice
13. Securitate MCP — validare JSON Schema, sandbox, human-in-the-loop obligatoriu

### Modul 11.3 — Sisteme Multi-Agent
14. De ce agenți multipli? — un singur agent obosește pe sarcini complexe lungi
15. Patterns de Orchestrare — Sequential, Parallel, Hierarchical, Evaluator-Optimizer
16. Agent Memory — Short-term (context), Long-term (DB), Shared (între agenți)
17. Durable Agent State — ce se întâmplă când agentul cade la mijlocul unui task lung
18. LangGraph — graful orientat de stări, control absolut al fluxului (producție)
19. smolagents (HuggingFace) — learning-friendly, cod simplu, ideal pentru prototipuri
20. LangGraph vs. smolagents vs. OpenAI Agents SDK — când alegi ce în 2026
21. [LAB] Echipa de 3 agenți — Cercetător + Scriitor + Editor în LangGraph cu MCP + Langfuse tracing

### Modul 11.4 — Frontierele Agentice 2025-2026
22. Computer Use / GUI Agents — Claude Computer Use, Operator: agenți vizuali pe desktop
23. Agent-to-Agent (A2A) Protocol — cum comunică agenții diferiților vendori între ei
24. Generative UI — agentul emite componente React ca output, nu text simplu
25. Voice Agents — arhitectura STT → LLM → TTS, turn detection, barge-in, latency budget
26. Synthetic Data cu LLM-uri — self-instruct, evol-instruct, rejection sampling pentru fine-tuning
27. Vibe Coding — tu ești arhitectul, AI-ul scrie sintaxa (Claude Code, Cursor, Copilot)
28. [LAB] Agent Complet — MCP Server + voice input + Gradio UI + Langfuse tracing end-to-end

### Recapitulare
29. [BOSS] Sistemul Multi-Agent Final — MCP + LangGraph + A2A + evaluare automată + UI complet

---

## CURSUL 12 — AI în Producție
> *De la experimentul local la sistemul care rulează 24/7 fără să cadă*
> **26 lecții** · Dificultate: 4/5
> Stack: vLLM, FastAPI, Langfuse, Braintrust, Phoenix, LiteLLM, Modal/RunPod, GitHub Actions, MLflow

### Modul 12.1 — MLOps & CI/CD
1. [HOOK] De ce modelele eșuează în producție — distribution shift, data drift, model rot
2. MLflow și Model Registry — mașina timpului pentru modele (rollback la v1.0 în 30 sec)
3. Automatizarea lansării — GitHub Actions rulează eval suite înainte de orice deploy
4. Monitoring — alertezi când modelul halucinează mai des decât ieri
5. A/B Testing pentru modele — compari două versiuni cu trafic real împărțit

### Modul 12.2 — LLMOps & Evaluare
6. LLM-as-a-Judge — GPT-4o evaluează automat agentul tău mai mic la scară
7. Evals cu Braintrust — suite de teste non-deterministe pentru text liber generat
8. Tracing cu Langfuse — fiecare apel LLM, fiecare tool call, fiecare cost: vizibil
9. Observability Stack complet — Langfuse vs. Braintrust vs. Phoenix: ce face fiecare, când alegi
10. Evals în CI/CD — testul de regresie care rulează automat la fiecare PR

### Modul 12.3 — Performanță, Serving & Cost
11. KV Cache — de ce decoding-ul e memory-bound și cum PagedAttention rezolvă asta
12. Continuous Batching — cum vLLM servește 100 cereri simultan fără coadă
13. Speculative Decoding — model mic ghicește, model mare validează: 2-3× latency reduction
14. MoE Serving — 671B total / 37B activi: cum afectează VRAM-ul și throughput-ul
15. vLLM în practică — deployezi un model open-source cu serving optimizat pe Modal/RunPod
16. FastAPI pentru AI — streaming responses cu Server-Sent Events, endpoints de producție
17. Latency Optimization — streaming, prompt caching, batching inteligent
18. Cost Optimization — matrix: model × context length × frecvența cererii → cost lunar

### Modul 12.4 — Securitate AI
19. Prompt Injection — [JOC GANDALF] tu ești hackerul, extragi parola ascunsă
20. Indirect Prompt Injection — PDF-ul otrăvit care redirecționează agentul
21. Defense in Depth — filtre externe, delimitatori XML, human-in-the-loop
22. Jailbreaking — tipare comune și contramasuri eficiente
23. EU AI Act — [ROLEPLAY] lansezi 3 produse AI, un ofițer legal le auditează
24. Bias și Etica Datelor — rețeaua antrenată pe bărbați respinge CV-urile femeilor

### Modul 12.5 — Edge AI & UX
25. Edge AI — quantizare INT4, sparse layers, modele sub 2GB pe telefon offline
26. UX pentru AI — streaming tokens, animații "Typing...", afișarea surselor RAG, feedback vizual

---

## Sumar Final

| # | Curs | Lecții | Dificultate |
|---|---|---|---|
| 1 | Hardware & Fizică | 30 | 2/5 |
| 2 | Sisteme de Operare | 22 | 2.5/5 |
| 3 | Rețele & Internet | 26 | 2.5/5 |
| 4 | Python & Inginerie Software | 38 | 2.5/5 |
| 5 | Algoritmi & Structuri de Date | 20 | 3/5 |
| 6 | Baze de Date & Ingineria Datelor | 27 | 3/5 |
| 7 | Matematică pentru AI | 21 | 3/5 |
| 8 | Machine Learning | 22 | 3.5/5 |
| 9 | Deep Learning & Computer Vision | 22 | 4/5 |
| 10 | AI Generativ & LLMs | 38 | 4/5 |
| 11 | Agentic AI & MCP | 29 | 4.5/5 |
| 12 | AI în Producție | 26 | 4/5 |
| **TOTAL** | | **321** | |

*321 lecții + quizuri intermediare per modul + 12 Boss Fights = ~355 unități de conținut*

---

## Stack-ul Complet Predat

| Domeniu | Tool-uri & Frameworks |
|---|---|
| Limbaj | Python 3.12+ cu type hints |
| Validare | Pydantic, instructor (structured outputs) |
| API Backend | FastAPI (REST + streaming SSE) |
| Testing | pytest |
| Package mgmt | uv, pyproject.toml |
| ML Framework | PyTorch (primar), scikit-learn |
| Fine-tuning | HuggingFace TRL, LoRA, QLoRA, PEFT |
| LLM APIs | OpenAI API, Anthropic API |
| Modele locale | Ollama (LLaMA 4, Mistral, Gemma 3) |
| Demo / UI rapid | Gradio + HuggingFace Spaces |
| Hub modele | HuggingFace Hub |
| Agent Framework | LangGraph (producție), smolagents (learning), OpenAI Agents SDK |
| MCP | Python MCP SDK, Claude Desktop, Cursor |
| Vector DB | pgvector, Qdrant, Pinecone |
| Observability | Langfuse (tracing), Braintrust (evals), Phoenix (retrieval eval) |
| Experiment tracking | MLflow |
| Model Serving | vLLM, Modal, RunPod |
| CI/CD | GitHub Actions |
| Data Processing | Pandas, NumPy |
| Version Control | Git |
| Containerizare | Docker, Kubernetes basic |
| Voice AI | ElevenLabs Agents, OpenAI gpt-realtime (conceptual) |

---

## Changelog față de v3

| Adăugit | Unde | De ce |
|---|---|---|
| uv + Virtual Environments + pyproject.toml | C4 L34 | Setup profesional Python 2026, complet absent |
| pytest + Unit Testing | C4 L35 | Standard engineering, menționat în stack dar nepredat |
| FastAPI basics | C4 L36 | Cel mai folosit framework Python pentru AI APIs |
| HuggingFace Hub + Spaces | C9 L13 | Ecosistemul central al modelelor open-source |
| QLoRA (4-bit + LoRA) | C10 L17 | LoRA fără QLoRA lasă impresia că ai nevoie de datacenter |
| Model Selection Framework | C10 L18 | "How to choose the right LLM" — decizia de la fiecare proiect |
| Advanced RAG (HyDE, Hybrid Search, Contextual Compression) | C10 L32 | Separă un RAG mediocru de unul performant |
| Modele de Difuzie | C10 L35 | Absent complet din v4 — DALL-E/Midjourney/SD sunt AI generativ de bază |
| AI Multimodal (CLIP, VLMs, Whisper) | C10 L36 | Absent complet din v4 — GPT-4V, Claude Vision, audio AI |
| Gradio | C10 L37 | Standard pentru demo-uri AI, apare în fiecare top AI course |
| FastAPI AI endpoints + streaming SSE | C12 L16 | Fără asta nu poți expune un model în producție |

---

> **Documentul este ÎNCHIS pentru adăugiri.**
> **Următorul pas:** Formatul standard al unei lecții → primele lecții pilot