# CURRICULUM-STRUCTURE.md
> Structura curriculară DevPath RO — referință pentru implementare
> 13 cursuri · 245 lecții (150 în cursurile 1–6, 95 în cursurile 7–13) · Rescris 2026-10-09 pe baza DB live (`zgofeajewktwmswckgup`) + `MASTER-PLAN.md`

---

## Cum se citește documentul

- **`#`** = poziția FINALĂ a lecției în curs (ce vede studentul când cursul e complet).
- **`DB acum`** (doar cursurile 1–6) = `lessons.order_index` real în baza live, azi. `—` = rândul nu există încă în DB.
- **Stare**:
  - `✅ scrisă` — rând în DB, `is_published = true`, `content_md` completat, fișier `.mdx` în `content/` (la lab/boss: după `·`, componenta apelată din `.mdx`).
  - `🔲 slot · …` — lab/boss **planificat**, încă inexistent în DB (se creează în P3+). După `·`: starea componentei.
  - `🔲 schelet` — rând în DB (sau creat de migrarea P1 pentru C7), `content_md = ''`, `is_published = false`.
- Pentru cursurile 1–3, `#` = `DB acum` (sloturile lab/boss sunt exact găurile din numerotare; în C1 au fost umplute în P3, 2026-10-09). Pentru cursurile 4–6, lecțiile existente se **vor renumerota** când se inserează sloturile (P3+; progresul e legat de `lesson.id`, nu de `order_index`) — de aceea coloanele diferă.
- **Sursa de adevăr:** structura (ordine, titluri, sloturi) = acest fișier + `MASTER-PLAN.md`; starea (ce e scris/publicat) = DB live.

## Convenții

- **course_slug**: kebab-case, unic, folosit în URL (`/courses/[slug]`)
- **difficulty**: număr 1.0–5.0 (nu string, nu label)
- **lesson_type**: `lesson` | `lab` | `boss` (CHECK-ul din DB mai acceptă și `theory|quiz|exercise|project`, nefolosite). `lab` = exercițiu interactiv / simulator / `python-editor`; `boss` = sinteză la final de curs.
- **order**: 1-indexed, per curs; `UNIQUE(course_id, order_index)` în DB.
- **Boss Fight** = ultima lecție din fiecare curs, type `boss` — excepție C1: are 2 boss-uri (poz. 16 și 29), iar lecția 30 ("De la binar la Assembly") rămâne după boss-ul final ca punte spre Cursul 2.
- **Cursuri**: `courses.order_index` unic și contiguu 1–13 (nu există constrângere în DB — se menține prin migrări).
- Lecțiile-schelet au `content_md = ''` (coloana e `NOT NULL`), `is_published = false`, `is_free = false`, `module_index` = `ceil(order/5)` limitat la 3.
- **Parser:** `scripts/seed-curriculum.mjs` citește acest fișier (`## CURSUL N`, primul bloc ```` ``` ```` de metadate, rânduri `| # | Titlu | Type | …`). Păstrează primele 3 coloane ale tabelelor și câmpul `total_lessons` = numărul de rânduri din tabel (planificate incluse).
- `data-engineering-ml-clasic` a fost scos din traseul principal (decizie 2026-10-09); eventual curs opțional, mai târziu. Nu are rând în DB.

---

## CURSUL 1
```
slug: hardware-fizica
title: Hardware & Fizică
description: De la electronul fizic la primul procesor virtual asamblat de tine
difficulty: 2.0
order: 1
total_lessons: 30
written: 30
planned_slots: 0
```
| # | Titlu | Type | Stare | DB acum |
|---|---|---|---|---|
| 1 | Cum funcționează ecranul telefonului tău? | lesson | ✅ scrisă | 1 |
| 2 | Ce este electricitatea? | lesson | ✅ scrisă | 2 |
| 3 | Circuitul închis | lesson | ✅ scrisă | 3 |
| 4 | Conductoare vs. Izolatoare | lesson | ✅ scrisă | 4 |
| 5 | Analogic vs. Digital | lesson | ✅ scrisă | 5 |
| 6 | Semiconductorii — de la nisip la siliciu | lesson | ✅ scrisă | 6 |
| 7 | Tranzistorul — robinet electric controlat de tensiune | lesson | ✅ scrisă | 7 |
| 8 | LAB: Aprinde tranzistorul | lab | ✅ scrisă · `<TransistorLab />` | 8 |
| 9 | Sistemul Binar | lesson | ✅ scrisă | 9 |
| 10 | JOC: Traducătorul Binar | lab | ✅ scrisă · `<BinaryTranslator />` | 10 |
| 11 | Poarta NOT | lesson | ✅ scrisă | 11 |
| 12 | Poarta AND | lesson | ✅ scrisă | 12 |
| 13 | Poarta OR | lesson | ✅ scrisă | 13 |
| 14 | Poarta XOR | lesson | ✅ scrisă | 14 |
| 15 | NAND — cărămida Lego universală | lesson | ✅ scrisă | 15 |
| 16 | BOSS: Alarma de Seif | boss | ✅ scrisă · `<BossFightAlarmaSef />` | 16 |
| 17 | Half-Adder — când porțile încep să calculeze | lesson | ✅ scrisă | 17 |
| 18 | Full-Adder — primul circuit care înțelege trecutul | lesson | ✅ scrisă | 18 |
| 19 | Multiplexorul — circuitul care alege | lesson | ✅ scrisă | 19 |
| 20 | Ceasul de sistem — dirijorul care face ordinea | lesson | ✅ scrisă | 20 |
| 21 | Flip-Flop — primul bit de memorie | lesson | ✅ scrisă | 21 |
| 22 | Registrele — cuvintele cu care gândește procesorul | lesson | ✅ scrisă | 22 |
| 23 | JOC: Grila Memoriei RAM | lab | ✅ scrisă · `<RAMGridGame />` | 23 |
| 24 | Unitatea Aritmetică (ALU) — când totul face click | lesson | ✅ scrisă | 24 |
| 25 | Unitatea de Control: Dirijorul din silicon | lesson | ✅ scrisă | 25 |
| 26 | Program Counter: indexul degetului care citește codul | lesson | ✅ scrisă | 26 |
| 27 | Ciclul Fetch-Decode-Execute: bătaia inimii din silicon | lesson | ✅ scrisă | 27 |
| 28 | Arhitectura Von Neumann: blueprint-ul din 1945 care rulează pe telefonul tău | lesson | ✅ scrisă | 28 |
| 29 | BOSS: Asamblează CPU | boss | ✅ scrisă · `<BossFightAsambleazaCPU />` | 29 |
| 30 | De la binar la Assembly: prima limbă pe care o înțelege siliciul | lesson | ✅ scrisă | 30 |

---

## CURSUL 2
```
slug: sisteme-de-operare
title: Sisteme de Operare
description: Ce se întâmplă în interiorul mașinii tale după ce apeși butonul de pornire
difficulty: 2.5
order: 2
total_lessons: 22
written: 19
planned_slots: 3
```
| # | Titlu | Type | Stare | DB acum |
|---|---|---|---|---|
| 1 | Procesul de Boot: Cum Prinde Viață un Calculator | lesson | ✅ scrisă | 1 |
| 2 | Anatomia OS-ului: Kernel vs. Shell | lesson | ✅ scrisă | 2 |
| 3 | User Mode vs. Kernel Mode | lesson | ✅ scrisă | 3 |
| 4 | Nașterea unui Proces | lesson | ✅ scrisă | 4 |
| 5 | Context Switching | lesson | ✅ scrisă | 5 |
| 6 | Firele de Execuție (Threads) | lesson | ✅ scrisă | 6 |
| 7 | Deadlock-uri | lesson | ✅ scrisă | 7 |
| 8 | Race Conditions | lesson | ✅ scrisă | 8 |
| 9 | Fragmentarea Memoriei | lesson | ✅ scrisă | 9 |
| 10 | Simulatorul de Paginare | lab | 🔲 slot · de construit | — |
| 11 | Memoria Virtuală și Swap | lesson | ✅ scrisă | 11 |
| 12 | Garbage Collector: Cine curăță după tine | lesson | ✅ scrisă | 12 |
| 13 | Arhitectura Sistemelor de Fișiere: Ce se întâmplă când scrii un fișier | lesson | ✅ scrisă | 13 |
| 14 | Permisiuni Unix: Cei 12 biți care controlează totul | lesson | ✅ scrisă | 14 |
| 15 | Mașini Virtuale și Hypervisors: Cum rulezi un OS în interiorul altui OS | lesson | ✅ scrisă | 15 |
| 16 | Containere Docker vs VM: Aceeași mașină, altă iluzie | lesson | ✅ scrisă | 16 |
| 17 | Kubernetes: Orchestratorul care nu doarme niciodată | lesson | ✅ scrisă | 17 |
| 18 | Shell-ul și primele comenzi: Terminalul explicat fără mistere | lesson | ✅ scrisă | 18 |
| 19 | Scripturi Bash | lab | 🔲 slot · de construit | — |
| 20 | SSH: Canalul criptat care ține internetul în viață | lesson | ✅ scrisă | 20 |
| 21 | Variabile de mediu și .env: Unde trăiesc secretele aplicației tale | lesson | ✅ scrisă | 21 |
| 22 | BOSS: Administratorul de Sistem | boss | 🔲 slot · de construit | — |

---

## CURSUL 3
```
slug: retele-internet
title: Rețele & Internet
description: Cum ajunge un pachet de date de la tastatura ta la un server din Tokyo în 80ms
difficulty: 2.5
order: 3
total_lessons: 26
written: 24
planned_slots: 2
```
| # | Titlu | Type | Stare | DB acum |
|---|---|---|---|---|
| 1 | Trimiți un mesaj pe WhatsApp — ce se întâmplă? | lesson | ✅ scrisă | 1 |
| 2 | LAN și adresele MAC | lesson | ✅ scrisă | 2 |
| 3 | Adresele IP | lesson | ✅ scrisă | 3 |
| 4 | DNS — agenda telefonică globală | lesson | ✅ scrisă | 4 |
| 5 | Lățime de bandă vs. Latență | lesson | ✅ scrisă | 5 |
| 6 | TCP vs. UDP | lesson | ✅ scrisă | 6 |
| 7 | SIMULATOR: TCP/IP Exhaustiv | lab | 🔲 slot · de construit | — |
| 8 | Modelul OSI — cele 7 straturi | lesson | ✅ scrisă | 8 |
| 9 | Porturile și socket-urile | lesson | ✅ scrisă | 9 |
| 10 | Rutarea pachetelor | lesson | ✅ scrisă | 10 |
| 11 | NAT — Network Address Translation | lesson | ✅ scrisă | 11 |
| 12 | Proxy Forward | lesson | ✅ scrisă | 12 |
| 13 | Reverse Proxy | lesson | ✅ scrisă | 13 |
| 14 | Load Balancer | lesson | ✅ scrisă | 14 |
| 15 | CDN — Content Delivery Network | lesson | ✅ scrisă | 15 |
| 16 | Criptografia Asimetrică — două chei, o revoluție | lesson | ✅ scrisă | 16 |
| 17 | SSL/TLS Handshake: Cum se încred doi străini în 4 pași | lesson | ✅ scrisă | 17 |
| 18 | Firewall: Portarul care citește fiecare pachet | lesson | ✅ scrisă | 18 |
| 19 | VPN: Un tunel privat printr-o rețea publică | lesson | ✅ scrisă | 19 |
| 20 | HTTP: Limbajul comun al întregului web | lesson | ✅ scrisă | 20 |
| 21 | REST vs. GraphQL: Aceleași date, două filozofii de acces | lesson | ✅ scrisă | 21 |
| 22 | API: Contractul care ascunde complexitatea | lesson | ✅ scrisă | 22 |
| 23 | WebSockets: Când serverul vorbește primul | lesson | ✅ scrisă | 23 |
| 24 | Webhooks: Nu suna tu, te sun eu | lesson | ✅ scrisă | 24 |
| 25 | JSON-RPC: Protocolul din spatele agenților AI | lesson | ✅ scrisă | 25 |
| 26 | BOSS: Arhitectul de Cloud | boss | 🔲 slot · de construit | — |

---

## CURSUL 4
```
slug: python-inginerie-software
title: Python & Inginerie Software
description: Python de la zero până la nivelul necesar pentru AI — sintaxă, OOP, async, requests, Git
difficulty: 2.0
order: 4
total_lessons: 29
written: 26
planned_slots: 3
```
> Renumerotare necesară la inserarea sloturilor: lecțiile DB 12–16 → 13–17, DB 17–26 → 19–28.

| # | Titlu | Type | Stare | DB acum |
|---|---|---|---|---|
| 1 | 3 linii de Python care ating internetul | lesson | ✅ scrisă | 1 |
| 2 | Sintaxa: Instrucțiuni rigide vs. limbaj natural | lesson | ✅ scrisă | 2 |
| 3 | Variabile: Cutii de carton cu etichete în RAM | lesson | ✅ scrisă | 3 |
| 4 | Tipuri de date primitive: int, float, str, bool | lesson | ✅ scrisă | 4 |
| 5 | Operatori aritmetici și logici | lesson | ✅ scrisă | 5 |
| 6 | Structuri decizionale: If/Elif/Else | lesson | ✅ scrisă | 6 |
| 7 | Bucle FOR: Repetiție peste orice colecție | lesson | ✅ scrisă | 7 |
| 8 | Bucle WHILE și pericolul buclei infinite | lesson | ✅ scrisă | 8 |
| 9 | Funcții: Fabrici de mini-cod | lesson | ✅ scrisă | 9 |
| 10 | Scope: Local vs. Global | lesson | ✅ scrisă | 10 |
| 11 | Try/Except: Plasa de siguranță | lesson | ✅ scrisă | 11 |
| 12 | LAB: Calculator cu validare | lab | 🔲 slot · `python-editor` (Pyodide) | — |
| 13 | Liste: Rafturile ordonate, indexare de la 0 | lesson | ✅ scrisă | 12 |
| 14 | Dicționare (Hash Maps): Acces O(1) | lesson | ✅ scrisă | 13 |
| 15 | Tuple-uri: Listele imutabile | lesson | ✅ scrisă | 14 |
| 16 | Set-uri: Colecția fără duplicate | lesson | ✅ scrisă | 15 |
| 17 | Mutabilitate vs. Imutabilitate | lesson | ✅ scrisă | 16 |
| 18 | LAB: Agenda de contacte | lab | 🔲 slot · `python-editor` (Pyodide) | — |
| 19 | Clase: Cât să citești un model PyTorch | lesson | ✅ scrisă | 17 |
| 20 | List Comprehensions | lesson | ✅ scrisă | 18 |
| 21 | Generatoare și yield: Baza DataLoaders | lesson | ✅ scrisă | 19 |
| 22 | Decoratori: Recunoști @torch.no_grad() și @app.get() | lesson | ✅ scrisă | 20 |
| 23 | Async/Await: Pentru apeluri LLM și streaming | lesson | ✅ scrisă | 21 |
| 24 | Gestionarea Fișierelor (File I/O) | lesson | ✅ scrisă | 22 |
| 25 | Modulul requests: Conectezi Python la orice API | lesson | ✅ scrisă | 23 |
| 26 | JSON + Pydantic: Validare și structured outputs | lesson | ✅ scrisă | 24 |
| 27 | uv + Virtual Environments: Setup practic în 6 minute | lesson | ✅ scrisă | 25 |
| 28 | Git: Commit, branch, pull, cum să nu-ți pierzi munca | lesson | ✅ scrisă | 26 |
| 29 | BOSS: Analizorul de loguri | boss | 🔲 slot · `python-editor` (Pyodide) | — |

---

## CURSUL 5
```
slug: algoritmi-structuri-date
title: Algoritmi & Structuri de Date
description: Algoritmi și structuri de date esențiale — Big-O, sortări, arbori, grafuri, programare dinamică
difficulty: 2.5
order: 5
total_lessons: 19
written: 16
planned_slots: 3
```
> Renumerotare necesară la inserarea sloturilor: lecțiile DB 7–11 → 8–12, DB 12–16 → 14–18.

| # | Titlu | Type | Stare | DB acum |
|---|---|---|---|---|
| 1 | De ce aplicația ta îngheață la 10.000 de utilizatori? | lesson | ✅ scrisă | 1 |
| 2 | Căutare Liniară vs. Binară | lesson | ✅ scrisă | 2 |
| 3 | Notarea Big O — și de ce atenția e O(n²) | lesson | ✅ scrisă | 3 |
| 4 | Space-Time Tradeoff | lesson | ✅ scrisă | 4 |
| 5 | Bubble Sort — villain-ul O(n²) | lesson | ✅ scrisă | 5 |
| 6 | Merge Sort — eroul O(n log n) | lesson | ✅ scrisă | 6 |
| 7 | LAB: Bubble vs Merge — numără operațiile | lab | 🔲 slot · `python-editor` (Pyodide) | — |
| 8 | Arbori Binari de Căutare (BST) | lesson | ✅ scrisă | 7 |
| 9 | Heap — cel mai mare/mic element la vârf | lesson | ✅ scrisă | 8 |
| 10 | Grafuri — noduri și muchii | lesson | ✅ scrisă | 9 |
| 11 | BFS vs. DFS | lesson | ✅ scrisă | 10 |
| 12 | Algoritmul lui Dijkstra | lesson | ✅ scrisă | 11 |
| 13 | LAB: Drumul cel mai scurt — BFS și Dijkstra pe un graf real | lab | 🔲 slot · `python-editor` (Pyodide) | — |
| 14 | Trie — autocomplete și dicționare | lesson | ✅ scrisă | 12 |
| 15 | Recursivitate — intuiția din spatele backprop | lesson | ✅ scrisă | 13 |
| 16 | Memoization — intuiția din spatele KV cache | lesson | ✅ scrisă | 14 |
| 17 | Programare Dinamică — sub-probleme suprapuse, rezolvate sistematic | lesson | ✅ scrisă | 15 |
| 18 | Algoritmi Greedy — alegerea rapidă, nu întotdeauna cea mai simplă | lesson | ✅ scrisă | 16 |
| 19 | BOSS: 3 probleme cu complexitate impusă | boss | 🔲 slot · `python-editor` (Pyodide) | — |

---

## CURSUL 6
```
slug: matematica-ai
title: Matematică pentru AI
description: Matematica din spatele AI — algebră liniară, probabilitate, derivate și gradient descent
difficulty: 3.0
order: 6
total_lessons: 24
written: 21
planned_slots: 3
```
> Renumerotare necesară la inserarea sloturilor: lecțiile DB 8–13 → 9–14, DB 14–21 → 16–23.

| # | Titlu | Type | Stare | DB acum |
|---|---|---|---|---|
| 1 | De ce AI-ul nu înțelege cuvinte — înțelege vectori | lesson | ✅ scrisă | 1 |
| 2 | Scalari și Vectori — săgeți în spațiu | lesson | ✅ scrisă | 2 |
| 3 | Produsul Scalar (Dot Product) — măsori similaritatea | lesson | ✅ scrisă | 3 |
| 4 | Shapes, axe și Broadcasting — de ce tensorul e (32, 512, 768) | lesson | ✅ scrisă | 4 |
| 5 | Matrici — spațiul ca o foaie elastică | lesson | ✅ scrisă | 5 |
| 6 | Înmulțirea Matricială — combini transformările | lesson | ✅ scrisă | 6 |
| 7 | Transpusa, Inversa și Determinantul | lesson | ✅ scrisă | 7 |
| 8 | LAB: Algebră liniară cu NumPy | lab | 🔲 slot · `python-editor` (NumPy preîncărcat) | — |
| 9 | Distribuția Normală — clopotul lui Gauss | lesson | ✅ scrisă | 8 |
| 10 | Teorema lui Bayes — probabilitatea condiționată | lesson | ✅ scrisă | 9 |
| 11 | Entropie Shannon | lesson | ✅ scrisă | 10 |
| 12 | Cross-Entropie — funcția de pierdere | lesson | ✅ scrisă | 11 |
| 13 | Softmax — funcția de peste tot (atenție, clasificare) | lesson | ✅ scrisă | 12 |
| 14 | Divergența KL | lesson | ✅ scrisă | 13 |
| 15 | LAB: Entropie și cross-entropie | lab | 🔲 slot · `python-editor` (NumPy) | — |
| 16 | Funcții și continuitate | lesson | ✅ scrisă | 14 |
| 17 | Derivata — panta muntelui sub schior | lesson | ✅ scrisă | 15 |
| 18 | Regula Lanțului (Chain Rule) — vital pentru Backpropagation | lesson | ✅ scrisă | 16 |
| 19 | Intuiție Jacobian — de la derivate la multi-dimensional | lesson | ✅ scrisă | 17 |
| 20 | Gradienți — busola spre cel mai abrupt coborâș | lesson | ✅ scrisă | 18 |
| 21 | Vizualizarea gradient descent | lesson | ✅ scrisă | 19 |
| 22 | Vectori și geometrie semantică — puntea spre embeddings | lesson | ✅ scrisă | 20 |
| 23 | Recapitulare vizuală: de la vector la rețea | lesson | ✅ scrisă | 21 |
| 24 | BOSS: Gradient descent manual de la zero | boss | 🔲 slot · `python-editor` (NumPy + matplotlib) | — |

---

## CURSUL 7
> **NOU (2026-10-09).** Inserat între `matematica-ai` și Computer Vision: fără PyTorch Core studentul sare de la "ce e o derivată" direct la "fine-tune ResNet". Definiția e cea din documentul vechi (era Cursul 6 în planul ML/PyTorch), neschimbată.
```
slug: pytorch-core
title: PyTorch Core
description: Inima cursului — tensori, Autograd și primul Training Loop scris manual, de la zero
difficulty: 3.0
order: 7
total_lessons: 16
```
| # | Titlu | Type | Stare |
|---|---|---|---|
| 1 | De ce PyTorch — tensori vs NumPy, GPU, graf dinamic | lesson | 🔲 schelet |
| 2 | Tensori — creare, shape, dtype, device (CPU/GPU) | lesson | 🔲 schelet |
| 3 | Operații cu tensori — broadcasting, reshape, indexare | lesson | 🔲 schelet |
| 4 | LAB: Portează cod NumPy în PyTorch | lab | 🔲 schelet |
| 5 | Autograd — requires_grad, .backward(), .grad | lesson | 🔲 schelet |
| 6 | Graful de calcul dinamic | lesson | 🔲 schelet |
| 7 | Gradient descent manual cu Autograd | lesson | 🔲 schelet |
| 8 | nn.Module — primul model | lesson | 🔲 schelet |
| 9 | Funcții de pierdere (loss) — MSE, CrossEntropy | lesson | 🔲 schelet |
| 10 | Optimizatori — SGD, Adam, optimizer.step() | lesson | 🔲 schelet |
| 11 | Training Loop manual — forward, loss, backward, step | lesson | 🔲 schelet |
| 12 | LAB: Scrie un training loop de la zero | lab | 🔲 schelet |
| 13 | Dataset & DataLoader — batching, shuffle | lesson | 🔲 schelet |
| 14 | Dataset custom — clasa Dataset personalizată | lesson | 🔲 schelet |
| 15 | GPU training — .to(device), bune practici | lesson | 🔲 schelet |
| 16 | BOSS: Rețea neuronală de la zero (MNIST) cu training loop propriu | boss | 🔲 schelet |

---

## CURSUL 8
> Era Cursul 7 (renumerotat +1, definiție neschimbată).
```
slug: computer-vision-cnn
title: Computer Vision & CNN
description: Cum vede o rețea imaginile — de la convoluție la arhitecturi clasice și transfer learning
difficulty: 3.0
order: 8
total_lessons: 15
```
| # | Titlu | Type | Stare |
|---|---|---|---|
| 1 | Cum vede o rețea imaginile — pixeli, canale, tensori de imagine | lesson | 🔲 schelet |
| 2 | De la MLP la convoluție — de ce fully-connected nu scalează | lesson | 🔲 schelet |
| 3 | Operația de convoluție — kernel, stride, padding | lesson | 🔲 schelet |
| 4 | Pooling & feature maps | lesson | 🔲 schelet |
| 5 | LAB: Construiește un CNN simplu în PyTorch | lab | 🔲 schelet |
| 6 | Arhitectura unui CNN complet | lesson | 🔲 schelet |
| 7 | Torchvision — datasets, transforms, augmentare | lesson | 🔲 schelet |
| 8 | Antrenează un CNN pe imagini (CIFAR-10) | lesson | 🔲 schelet |
| 9 | Batch Normalization & Dropout | lesson | 🔲 schelet |
| 10 | Arhitecturi clasice — LeNet, AlexNet, VGG, ResNet | lesson | 🔲 schelet |
| 11 | Transfer learning — folosește un model pre-antrenat | lesson | 🔲 schelet |
| 12 | LAB: Fine-tune ResNet pe dataset propriu | lab | 🔲 schelet |
| 13 | Data augmentation & combaterea overfitting-ului | lesson | 🔲 schelet |
| 14 | Interpretabilitate CNN — Grad-CAM și vizualizarea filtrelor | lesson | 🔲 schelet |
| 15 | BOSS: Clasificator de imagini end-to-end cu transfer learning | boss | 🔲 schelet |

---

## CURSUL 9
> Era Cursul 8 (renumerotat +1, definiție neschimbată).
```
slug: sequence-models-rnn
title: Sequence Models (RNN & LSTM)
description: Date în care ordinea contează — RNN, LSTM și puntea către Transformer
difficulty: 3.5
order: 9
total_lessons: 14
```
| # | Titlu | Type | Stare |
|---|---|---|---|
| 1 | Date secvențiale — text, serii temporale, de ce contează ordinea | lesson | 🔲 schelet |
| 2 | Reprezentarea textului — tokenizare, vocabular, indexare | lesson | 🔲 schelet |
| 3 | Embeddings — de la cuvinte la vectori (nn.Embedding) | lesson | 🔲 schelet |
| 4 | LAB: Pipeline de preprocesare text | lab | 🔲 schelet |
| 5 | RNN — cum funcționează starea ascunsă (hidden state) | lesson | 🔲 schelet |
| 6 | RNN în PyTorch — nn.RNN, secvențe, batching | lesson | 🔲 schelet |
| 7 | Vanishing gradient — de ce RNN-urile simple uită | lesson | 🔲 schelet |
| 8 | LSTM — porți (gates) și memorie pe termen lung | lesson | 🔲 schelet |
| 9 | GRU & comparație cu LSTM | lesson | 🔲 schelet |
| 10 | LAB: Antrenează un LSTM pentru clasificare de text | lab | 🔲 schelet |
| 11 | Generare de text cu un model secvențial (char-level) | lesson | 🔲 schelet |
| 12 | Seq2Seq & arhitectura encoder-decoder | lesson | 🔲 schelet |
| 13 | Serii temporale — predicție cu RNN/LSTM | lesson | 🔲 schelet |
| 14 | BOSS: Model de predicție pe secvențe | boss | 🔲 schelet |

---

## CURSUL 10
> Era Cursul 9 (renumerotat +1, definiție neschimbată).
```
slug: transformer-architecture
title: Arhitectura Transformer
description: Transformer-ul construit de la zero în PyTorch — atenție, QKV și blocul complet
difficulty: 4.0
order: 10
total_lessons: 13
```
| # | Titlu | Type | Stare |
|---|---|---|---|
| 1 | Limitele RNN/LSTM — de ce a apărut Transformer-ul | lesson | 🔲 schelet |
| 2 | Ideea de atenție (attention) — intuiție | lesson | 🔲 schelet |
| 3 | Self-attention — Query, Key, Value (QKV) | lesson | 🔲 schelet |
| 4 | Scoruri de atenție — scaled dot-product | lesson | 🔲 schelet |
| 5 | LAB: Self-attention de la zero în PyTorch | lab | 🔲 schelet |
| 6 | Multi-head attention | lesson | 🔲 schelet |
| 7 | Positional encoding — cum injectăm ordinea | lesson | 🔲 schelet |
| 8 | Blocul Transformer — attention + FFN + layer norm + residual | lesson | 🔲 schelet |
| 9 | Encoder vs Decoder — arhitectura completă | lesson | 🔲 schelet |
| 10 | LAB: Asamblează un bloc Transformer complet | lab | 🔲 schelet |
| 11 | Antrenarea unui mini-Transformer | lesson | 🔲 schelet |
| 12 | De la Transformer la modele mari (intuiție GPT/BERT) | lesson | 🔲 schelet |
| 13 | BOSS: Transformer complet de la zero pentru o sarcină simplă | boss | 🔲 schelet |

---

## CURSUL 11
> Era Cursul 10 (renumerotat +1, definiție neschimbată).
```
slug: modele-generative
title: Modele Generative
description: Rețele care creează, nu doar clasifică — autoencodere, VAE, GAN și bazele difuziei
difficulty: 4.0
order: 11
total_lessons: 13
```
| # | Titlu | Type | Stare |
|---|---|---|---|
| 1 | Ce e un model generativ — discriminativ vs generativ | lesson | 🔲 schelet |
| 2 | Autoencoder — encoder, bottleneck, decoder | lesson | 🔲 schelet |
| 3 | Antrenează un autoencoder (reconstrucție) | lesson | 🔲 schelet |
| 4 | LAB: Autoencoder pentru denoising | lab | 🔲 schelet |
| 5 | Variational Autoencoder (VAE) — spațiul latent, sampling | lesson | 🔲 schelet |
| 6 | GAN — generator vs discriminator | lesson | 🔲 schelet |
| 7 | Antrenarea unui GAN simplu | lesson | 🔲 schelet |
| 8 | LAB: Generează imagini cu un GAN | lab | 🔲 schelet |
| 9 | Generare condiționată (conditional VAE/GAN) | lesson | 🔲 schelet |
| 10 | Modele de difuzie — ideea de adăugare/eliminare de zgomot | lesson | 🔲 schelet |
| 11 | Forward & reverse diffusion process | lesson | 🔲 schelet |
| 12 | Implementarea unui mini-model de difuzie | lesson | 🔲 schelet |
| 13 | BOSS: Model generativ funcțional pe imagini | boss | 🔲 schelet |

---

## CURSUL 12
> Era Cursul 11 (renumerotat +1, definiție neschimbată).
```
slug: reinforcement-learning
title: Reinforcement Learning
description: Agenți care învață prin recompensă — de la Q-Learning tabelar la Deep Q-Networks
difficulty: 4.0
order: 12
total_lessons: 12
```
| # | Titlu | Type | Stare |
|---|---|---|---|
| 1 | Ce e RL — agent, mediu, stare, acțiune, recompensă | lesson | 🔲 schelet |
| 2 | Procese de decizie Markov (MDP) | lesson | 🔲 schelet |
| 3 | Politici & funcții de valoare | lesson | 🔲 schelet |
| 4 | Q-Learning — tabelul Q, ecuația Bellman | lesson | 🔲 schelet |
| 5 | LAB: Q-Learning tabelar pe un grid world | lab | 🔲 schelet |
| 6 | De la Q-table la Deep Q-Network (DQN) | lesson | 🔲 schelet |
| 7 | DQN în PyTorch — rețeaua ca aproximator | lesson | 🔲 schelet |
| 8 | Experience replay & target network | lesson | 🔲 schelet |
| 9 | LAB: Antrenează un agent DQN (CartPole) | lab | 🔲 schelet |
| 10 | Explorare vs exploatare — epsilon-greedy | lesson | 🔲 schelet |
| 11 | Policy Gradient (intuiție) | lesson | 🔲 schelet |
| 12 | BOSS: Agent RL care rezolvă un mediu Gym | boss | 🔲 schelet |

---

## CURSUL 13
> Era Cursul 12 (renumerotat +1, definiție neschimbată).
```
slug: pytorch-productie
title: PyTorch în Producție
description: De la model antrenat la model livrat — salvare, ONNX, serving și optimizare pentru producție
difficulty: 3.5
order: 13
total_lessons: 12
```
| # | Titlu | Type | Stare |
|---|---|---|---|
| 1 | Salvarea & încărcarea modelelor (state_dict, checkpoints) | lesson | 🔲 schelet |
| 2 | Eval vs train mode — inference corect | lesson | 🔲 schelet |
| 3 | Optimizare pentru inference — quantization, pruning | lesson | 🔲 schelet |
| 4 | TorchScript — tracing & scripting | lesson | 🔲 schelet |
| 5 | Export ONNX — interoperabilitate | lesson | 🔲 schelet |
| 6 | LAB: Exportă un model în ONNX și rulează inference | lab | 🔲 schelet |
| 7 | Servirea modelului — TorchServe / FastAPI | lesson | 🔲 schelet |
| 8 | Containerizare (Docker) pentru un model | lesson | 🔲 schelet |
| 9 | LAB: Deploy un model ca API | lab | 🔲 schelet |
| 10 | Monitorizare & versionare modele | lesson | 🔲 schelet |
| 11 | Bune practici MLOps — reproductibilitate, experiment tracking | lesson | 🔲 schelet |
| 12 | BOSS: Deploy complet — antrenează, exportă, servește un model | boss | 🔲 schelet |

---

## Sumar pentru validare seed

| Curs | Slug | Lecții (final) | Scrise | Sloturi lab/boss de adăugat | Schelete | Lab | Boss | Difficulty |
|---|---|---|---|---|---|---|---|---|
| 1 | hardware-fizica | 30 | 30 | 0 | — | 3 | 2 | 2.0 |
| 2 | sisteme-de-operare | 22 | 19 | 3 | — | 2 | 1 | 2.5 |
| 3 | retele-internet | 26 | 24 | 2 | — | 1 | 1 | 2.5 |
| 4 | python-inginerie-software | 29 | 26 | 3 | — | 2 | 1 | 2.0 |
| 5 | algoritmi-structuri-date | 19 | 16 | 3 | — | 2 | 1 | 2.5 |
| 6 | matematica-ai | 24 | 21 | 3 | — | 2 | 1 | 3.0 |
| 7 | pytorch-core | 16 | 0 | 0 | 16 | 2 | 1 | 3.0 |
| 8 | computer-vision-cnn | 15 | 0 | 0 | 15 | 2 | 1 | 3.0 |
| 9 | sequence-models-rnn | 14 | 0 | 0 | 14 | 2 | 1 | 3.5 |
| 10 | transformer-architecture | 13 | 0 | 0 | 13 | 2 | 1 | 4.0 |
| 11 | modele-generative | 13 | 0 | 0 | 13 | 2 | 1 | 4.0 |
| 12 | reinforcement-learning | 12 | 0 | 0 | 12 | 2 | 1 | 4.0 |
| 13 | pytorch-productie | 12 | 0 | 0 | 12 | 2 | 1 | 3.5 |
| **TOTAL** | | **245** | **136** | **14** | **95** | **26** | **14** | |

Stare DB live la 2026-10-09 (înainte de migrarea P1): 12 cursuri, 210 rânduri `lessons` = 131 scrise (C1–6) + 79 schelete (C7–12). După migrarea P1: 13 cursuri, 226 rânduri = 131 + 95 schelete. După P3 (2026-10-09): 231 rânduri = 136 scrise/publicate + 95 schelete; Cursul 1 are cele 30 de lecții (5 lab/boss inserate). Cele 14 sloturi lab/boss rămase (C2–C6) nu au încă rând în DB.

---

## Note pentru implementare

**Tipuri de lecții:**
- `lesson` — lecție standard cu teorie + analogie + exemplu
- `lab` — exercițiu practic interactiv (cod rulabil sau simulator)
- `boss` — sinteză practică la finalul cursului, implică toate conceptele din curs

**Progresie:**
- Cursurile sunt strict secvențiale (C1 → C13)
- Un curs nu devine disponibil până cursul anterior nu e completat 100%
- Excepție: C1-C4 pot fi parcurse în paralel de useri cu experiență (flag: `can_skip_prerequisites`)

**Conținut:**
- Lecțiile-schelet au `content_md = ''` și `is_published = false`; conținutul se adaugă separat, lecție cu lecție
- Cursurile cu zero lecții publicate nu apar pe harta de cursuri (apar ca "În curând")

**Sloturi lab/boss în C1–6:** componentele existente (`TransistorLab`, `BinaryTranslator`, `BossFightAlarmaSef`, `RAMGridGame`, `BossFightAsambleazaCPU`) sunt gata în cod; restul se construiesc ulterior. Harta (serpentina) randează deja corect `lab` → `Code2` și `boss` → `Trophy`. Detalii: `MASTER-PLAN.md`.

**Istoric:**
- Pivot PyTorch (2026-08-04): cursurile 4–12 rescrise pentru ML/DL/PyTorch; slug-urile ML au fost redenumite.
- Decizia D1 (2026-09-30): cursurile 4–6 păstrează slug-urile și conținutul v5 (`python-inginerie-software`, `algoritmi-structuri-date`, `matematica-ai`) — slug-urile planificate atunci pentru ele (`python-matematica-dl`, `data-engineering-ml-clasic`, `pytorch-core` ca C6) nu au fost folosite pentru C4–6.
- 2026-10-09 (P1): documentul rescris după realitate; `pytorch-core` inserat ca Cursul 7, cursurile ML mutate la 8–13; `data-engineering-ml-clasic` scos din traseul principal.
- Notă seeder: `scripts/seed-curriculum.mjs` are `IN_SCOPE_SLUGS` = 6 slug-uri ML (8–13 acum) și NU include `pytorch-core` — scheletele C7 vin din migrare, nu din seeder.
