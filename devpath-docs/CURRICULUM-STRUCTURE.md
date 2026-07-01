# CURRICULUM-STRUCTURE.md
> Structura curriculară DevPath RO — referință pentru implementare
> 12 cursuri · 289 lecții · Citit de Claude Code la seed/implementare

---

## Convenții

- **course_slug**: kebab-case, unic, folosit în URL (`/courses/[slug]`)
- **difficulty**: număr 1.0–5.0 (nu string, nu label)
- **lesson_type**: `lesson` | `lab` | `boss` (boss = lecție sinteză la final de curs)
- **order**: 1-indexed, per curs
- Toate lecțiile au `content_mdx = null` la seed — conținutul vine separat
- Boss Fight = ultima lecție din fiecare curs, type `boss`

---

## CURSUL 1
```
slug: hardware-fizica
title: Hardware & Fizică
description: De la electronul fizic la primul procesor virtual asamblat de tine
difficulty: 2.0
order: 1
total_lessons: 30
```
| # | Titlu | Type |
|---|---|---|
| 1 | Cum funcționează ecranul telefonului tău? | lesson |
| 2 | Ce este electricitatea? | lesson |
| 3 | Circuitul închis | lesson |
| 4 | Conductoare vs. izolatoare | lesson |
| 5 | Analogic vs. Digital | lesson |
| 6 | Semiconductorii — de la nisip la siliciu | lesson |
| 7 | Tranzistorul — robinet electric controlat de tensiune | lesson |
| 8 | LAB: Aprinde tranzistorul | lab |
| 9 | Sistemul binar | lesson |
| 10 | JOC: Traducătorul Binar | lesson |
| 11 | Poarta NOT | lesson |
| 12 | Poarta AND | lesson |
| 13 | Poarta OR | lesson |
| 14 | Poarta XOR | lesson |
| 15 | NAND — cărămida Lego universală | lesson |
| 16 | BOSS: Alarma de Seif | boss |
| 17 | Half-Adder | lesson |
| 18 | Full-Adder | lesson |
| 19 | Multiplexorul | lesson |
| 20 | Ceasul de sistem | lesson |
| 21 | Flip-Flop — primul bit de memorie | lesson |
| 22 | Registrele | lesson |
| 23 | JOC: Grila Memoriei RAM | lesson |
| 24 | Unitatea Aritmetică (ALU) | lesson |
| 25 | Unitatea de Control | lesson |
| 26 | Program Counter | lesson |
| 27 | Ciclul Fetch-Decode-Execute | lesson |
| 28 | Arhitectura Von Neumann | lesson |
| 29 | BOSS: Asamblează CPU | boss |
| 30 | De la binar la Assembly | lesson |

---

## CURSUL 2
```
slug: sisteme-de-operare
title: Sisteme de Operare
description: Ce se întâmplă în interiorul mașinii tale după ce apeși butonul de pornire
difficulty: 2.5
order: 2
total_lessons: 22
```
| # | Titlu | Type |
|---|---|---|
| 1 | Procesul de Boot | lesson |
| 2 | Anatomia OS-ului: Kernel vs. Shell | lesson |
| 3 | User Mode vs. Kernel Mode | lesson |
| 4 | Nașterea unui Proces | lesson |
| 5 | Context Switching | lesson |
| 6 | Firele de Execuție (Threads) | lesson |
| 7 | Deadlock-uri | lesson |
| 8 | Race Conditions | lesson |
| 9 | Fragmentarea Memoriei | lesson |
| 10 | Simulatorul de Paginare | lab |
| 11 | Memoria Virtuală și Swap | lesson |
| 12 | Garbage Collector | lesson |
| 13 | Arhitectura Sistemelor de Fișiere | lesson |
| 14 | Permisiuni Unix (rwx) | lesson |
| 15 | Mașini Virtuale și Hypervisors | lesson |
| 16 | Containere Docker vs. VM | lesson |
| 17 | Orchestrare Kubernetes | lesson |
| 18 | Shell-ul și primele comenzi | lesson |
| 19 | Scripturi Bash | lab |
| 20 | SSH | lesson |
| 21 | Variabile de mediu și .env | lesson |
| 22 | BOSS: Administratorul de Sistem | boss |

---

## CURSUL 3
```
slug: retele-internet
title: Rețele & Internet
description: Cum ajunge un pachet de date de la tastatura ta la un server din Tokyo în 80ms
difficulty: 2.5
order: 3
total_lessons: 26
```
| # | Titlu | Type |
|---|---|---|
| 1 | Trimiți un mesaj pe WhatsApp — ce se întâmplă? | lesson |
| 2 | LAN și adresele MAC | lesson |
| 3 | Adresele IP | lesson |
| 4 | DNS — agenda telefonică globală | lesson |
| 5 | Lățime de bandă vs. Latență | lesson |
| 6 | TCP vs. UDP | lesson |
| 7 | SIMULATOR: TCP/IP Exhaustiv | lab |
| 8 | Modelul OSI — cele 7 straturi | lesson |
| 9 | Porturile — clădirea cu 65.535 de uși | lesson |
| 10 | Rutarea pachetelor | lesson |
| 11 | NAT | lesson |
| 12 | Proxy Forward | lesson |
| 13 | Reverse Proxy | lesson |
| 14 | Load Balancer | lesson |
| 15 | CDN | lesson |
| 16 | Criptografia Asimetrică | lesson |
| 17 | SSL/TLS Handshake | lesson |
| 18 | Firewall | lesson |
| 19 | VPN | lesson |
| 20 | HTTP | lesson |
| 21 | REST vs. GraphQL | lesson |
| 22 | API | lesson |
| 23 | WebSockets | lesson |
| 24 | Webhooks | lesson |
| 25 | JSON-RPC | lesson |
| 26 | BOSS: Arhitectul de Cloud | boss |

---

## CURSUL 4
```
slug: python-inginerie-software
title: Python pentru AI
description: Minimul viabil de Python cât să citești și modifici cod AI — nu să devii backend developer
difficulty: 2.5
order: 4
total_lessons: 26
```
| # | Titlu | Type |
|---|---|---|
| 1 | 3 linii de Python care ating internetul | lesson |
| 2 | Sintaxa — instrucțiuni rigide vs. limbaj natural | lesson |
| 3 | Variabile — cutii de carton cu etichete în RAM | lesson |
| 4 | Tipuri de date primitive (int, float, str, bool) | lesson |
| 5 | Operatori aritmetici și logici | lesson |
| 6 | Structuri decizionale If/Elif/Else | lesson |
| 7 | Bucle FOR | lesson |
| 8 | Bucle WHILE și pericolul buclei infinite | lesson |
| 9 | Funcții — fabrici de mini-cod | lesson |
| 10 | Scope: Local vs. Global | lesson |
| 11 | Try/Except — plasa de siguranță | lesson |
| 12 | Liste — rafturile ordonate, indexare de la 0 | lesson |
| 13 | Dicționare (Hash Maps) — acces O(1) | lesson |
| 14 | Tuple-uri — listele imutabile | lesson |
| 15 | Set-uri — colecția fără duplicate | lesson |
| 16 | Mutabilitate vs. Imutabilitate | lesson |
| 17 | Clase — cât să citești un model PyTorch | lesson |
| 18 | List Comprehensions | lesson |
| 19 | Generatoare și yield — baza DataLoaders | lesson |
| 20 | Decoratori — recunoști @torch.no_grad() și @app.get() | lesson |
| 21 | Async/Await — pentru apeluri LLM și streaming | lesson |
| 22 | Gestionarea Fișierelor (File I/O) | lesson |
| 23 | Modulul requests — conectezi Python la orice API | lesson |
| 24 | JSON + Pydantic — validare și structured outputs | lesson |
| 25 | uv + Virtual Environments — setup practic în 6 minute | lesson |
| 26 | Git — commit, branch, pull, cum să nu-ți pierzi munca | lesson |

---

## CURSUL 5
```
slug: algoritmi-structuri-date
title: Algoritmi & Structuri de Date
description: Big O ca instrument de intuiție pentru AI, nu ca pregătire de interviu
difficulty: 3.0
order: 5
total_lessons: 17
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce aplicația ta îngheață la 10.000 de utilizatori? | lesson |
| 2 | Căutare Liniară vs. Binară | lesson |
| 3 | Notarea Big O — și de ce atenția e O(n²) | lesson |
| 4 | Space-Time Tradeoff | lesson |
| 5 | Bubble Sort — villain-ul O(n²) | lesson |
| 6 | Merge Sort — eroul O(n log n) | lesson |
| 7 | Arbori Binari de Căutare (BST) | lesson |
| 8 | Heap — cel mai mare/mic element la vârf | lesson |
| 9 | Grafuri — noduri și muchii | lesson |
| 10 | BFS vs. DFS | lesson |
| 11 | Algoritmul lui Dijkstra | lesson |
| 12 | Trie — autocomplete și dicționare | lesson |
| 13 | Recursivitate — intuiția din spatele backprop | lesson |
| 14 | Memoization — intuiția din spatele KV cache | lesson |
| 15 | Programare Dinamică | lesson |
| 16 | Greedy Algorithms | lesson |
| 17 | BOSS: Optimizatorul | boss |

---

## CURSUL 6
```
slug: matematica-ai
title: Matematică pentru AI
description: Limbajul real al AI-ului — o rețea e înmulțire de matrici plus o neliniaritate, antrenată urmând gradienți
difficulty: 3.0
order: 6
total_lessons: 22
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce AI-ul nu înțelege cuvinte — înțelege vectori | lesson |
| 2 | Scalari și Vectori — săgeți în spațiu | lesson |
| 3 | Produsul Scalar (Dot Product) — măsori similaritatea | lesson |
| 4 | Shapes, axe și Broadcasting — de ce tensorul e (32, 512, 768) | lesson |
| 5 | Matrici — spațiul ca o foaie elastică | lesson |
| 6 | Înmulțirea Matricială — combini transformările | lesson |
| 7 | Transpusa, Inversa și Determinantul | lesson |
| 8 | Distribuția Normală — clopotul lui Gauss | lesson |
| 9 | Teorema lui Bayes — probabilitatea condiționată | lesson |
| 10 | Entropie Shannon | lesson |
| 11 | Cross-Entropie — funcția de pierdere | lesson |
| 12 | Softmax — funcția de peste tot (atenție, clasificare) | lesson |
| 13 | Divergența KL | lesson |
| 14 | Funcții și continuitate | lesson |
| 15 | Derivata — panta muntelui sub schior | lesson |
| 16 | Regula Lanțului (Chain Rule) — vital pentru Backpropagation | lesson |
| 17 | Intuiție Jacobian — de la derivate la multi-dimensional | lesson |
| 18 | Gradienți — busola spre cel mai abrupt coborâș | lesson |
| 19 | Vizualizarea gradient descent | lesson |
| 20 | Vectori și geometrie semantică — puntea spre embeddings | lesson |
| 21 | Recapitulare vizuală: de la vector la rețea | lesson |
| 22 | BOSS: Coborârea pe Gradient | boss |

---

## CURSUL 7
```
slug: baze-date-ingineria-datelor
title: Date & Embeddings
description: De la ce e o bază de date la meaning is math — unde matematica devine vizibil sens
difficulty: 3.0
order: 7
total_lessons: 18
```
| # | Titlu | Type |
|---|---|---|
| 1 | Excel vs. Server Database — panica la 5 milioane de rânduri | lesson |
| 2 | Schema, rânduri, coloane — proiectezi o bază de la zero | lesson |
| 3 | Query și filtrare (SELECT, WHERE) | lesson |
| 4 | JOIN — reunești tabele separate (conceptual) | lesson |
| 5 | Tranzacțiile ACID — când pică curentul la jumătate (conceptual) | lesson |
| 6 | De ce a apărut NoSQL — schema flexibilă | lesson |
| 7 | Redis — caching în RAM pentru viteză | lesson |
| 8 | Ce este un Data Pipeline | lesson |
| 9 | Extract, Transform, Load (ETL) | lesson |
| 10 | Introducere în Pandas — filtrezi 1M rânduri instantaneu | lesson |
| 11 | Curățarea Datelor (Null, outlieri, duplicate) | lesson |
| 12 | Explorarea Datelor (EDA) | lesson |
| 13 | Limitarea căutării exacte — "Mașină" nu găsește "Automobil" | lesson |
| 14 | Embeddings — cuvântul devine numere cu sens geometric | lesson |
| 15 | Geometria semantică — "Câine" și "Lup" stau aproape | lesson |
| 16 | Cosine Similarity — unghiul măsoară înrudirea | lesson |
| 17 | Vector Databases (pgvector, Qdrant, Pinecone) | lesson |
| 18 | BOSS: Sistemul de Căutare Semantică | boss |

---

## CURSUL 8
```
slug: machine-learning
title: Machine Learning
description: Primul tău model care învață din date, fără reguli scrise de tine
difficulty: 3.5
order: 8
total_lessons: 21
```
| # | Titlu | Type |
|---|---|---|
| 1 | De la IF/ELSE la Predicție | lesson |
| 2 | Regresia Liniară — o linie prin haosul punctelor | lesson |
| 3 | Funcția de Pierdere (Loss) — termometrul erorii | lesson |
| 4 | Gradient Descent — construit de mână, vezi loss-ul scăzând | lesson |
| 5 | Regresia Logistică — granița cu probabilitate | lesson |
| 6 | Arbori de Decizie și Random Forest | lesson |
| 7 | Overfitting vs. Underfitting | lesson |
| 8 | Cross-Validation și Hyperparameter Tuning | lesson |
| 9 | K-Means Clustering | lesson |
| 10 | Reducerea Dimensionalității (PCA) — puntea spre embeddings | lesson |
| 11 | Agentul și Mediul (Reinforcement Learning) | lesson |
| 12 | Q-Learning | lesson |
| 13 | Dilema Explorare vs. Exploatare | lesson |
| 14 | Deep Q-Networks (DQN) | lesson |
| 15 | CPU vs. GPU — de ce contează pentru AI | lesson |
| 16 | Arhitectura GPU — autostrada de mii de benzi | lesson |
| 17 | VRAM și Bandwidth — gâtuiala nr. 1 din AI | lesson |
| 18 | CUDA — programezi placa video | lesson |
| 19 | Quantizarea — LLaMA pe laptopul tău | lesson |
| 20 | RL revine: de la joc la antrenarea LLM-urilor să raționeze | lesson |
| 21 | BOSS: Supraviețuirea Robotului | boss |

---

## CURSUL 9
```
slug: deep-learning-computer-vision
title: Deep Learning & Computer Vision
description: De la perceptronul simplu la arhitecturile care au schimbat lumea
difficulty: 4.0
order: 9
total_lessons: 21
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce 2012 a schimbat totul — ImageNet | lesson |
| 2 | Perceptronul — decizia binară | lesson |
| 3 | Rețeaua Multistrat (MLP) | lesson |
| 4 | Funcții de Activare (ReLU, Sigmoid, tanh) | lesson |
| 5 | Backpropagation — unda de corecție de la coadă la cap | lesson |
| 6 | Optimizatori (SGD, Adam, AdamW) | lesson |
| 7 | Regularizare (Dropout, L2, Batch Norm) | lesson |
| 8 | Limitarea MLP pe imagini | lesson |
| 9 | Convoluția — lanterna care scanează imaginea | lesson |
| 10 | Pooling — comprimi, păstrezi esența | lesson |
| 11 | Arhitectura CNN completă | lesson |
| 12 | Transfer Learning | lesson |
| 13 | HuggingFace Hub + Spaces | lesson |
| 14 | Object Detection (YOLO) | lesson |
| 15 | ResNet — skip connections | lesson |
| 16 | Vision Transformer (ViT) — puntea spre LLM-uri | lesson |
| 17 | CNN vs. ViT — când folosești fiecare | lesson |
| 18 | Mixture of Experts (MoE) — 671B total / 37B activi | lesson |
| 19 | Clasificare și segmentare de imagini | lesson |
| 20 | De la dataset brut la model deployat | lesson |
| 21 | BOSS: Pipeline complet pe HuggingFace Spaces | boss |

---

## CURSUL 10
```
slug: ai-generativ-llms
title: AI Generativ & LLMs
description: Cum gândește, vorbește și creează un model de limbaj modern
difficulty: 4.0
order: 10
total_lessons: 36
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce ChatGPT nu numără literele din "strawberry"? | lesson |
| 2 | Tokenizarea | lesson |
| 3 | Predicția Următorului Token | lesson |
| 4 | Temperatura și Top-P | lesson |
| 5 | Limitarea RNN — amnezia la texte lungi | lesson |
| 6 | Mecanismul de Atenție (Self-Attention) | lesson |
| 7 | Query, Key, Value | lesson |
| 8 | Multi-Head Attention | lesson |
| 9 | Positional Encoding | lesson |
| 10 | Arhitectura completă Transformer | lesson |
| 11 | Scaling Laws | lesson |
| 12 | Pre-Training — citești tot internetul | lesson |
| 13 | Post-Training: SFT → DPO → GRPO și RLHF | lesson |
| 14 | Fine-Tuning vs. Pre-Training | lesson |
| 15 | LoRA — post-it-uri pe matricea de 70B | lesson |
| 16 | QLoRA — fine-tuning pe GPU de consumer | lesson |
| 17 | Model Selection — cum alegi (nu care câștigă) | lesson |
| 18 | Prompt Engineering | lesson |
| 19 | Structured Outputs cu instructor + Pydantic | lesson |
| 20 | Context Window Management | lesson |
| 21 | Prompt Caching | lesson |
| 22 | Modele Locale cu Ollama | lesson |
| 23 | Reasoning Models (o1, o3, DeepSeek-R1) | lesson |
| 24 | Chain-of-Thought | lesson |
| 25 | Long Context vs. RAG — decizia de arhitectură | lesson |
| 26 | Limitele actuale ale LLM-urilor | lesson |
| 27 | Halucinația — de ce modelul inventează | lesson |
| 28 | Arhitectura RAG | lesson |
| 29 | Chunking Strategies | lesson |
| 30 | Reranking | lesson |
| 31 | Advanced RAG (HyDE, Hybrid Search) | lesson |
| 32 | GraphRAG | lesson |
| 33 | Evaluarea unui sistem RAG | lesson |
| 34 | Modele de Difuzie (DALL-E, Stable Diffusion) | lesson |
| 35 | AI Multimodal (CLIP, GPT-4V, Whisper) | lesson |
| 36 | BOSS: Sistem RAG Complet + Gradio UI | boss |

---

## CURSUL 11
```
slug: agentic-ai-mcp
title: Agentic AI & MCP
description: Modelele care planifică, acționează și se corectează singure
difficulty: 4.5
order: 11
total_lessons: 28
```
| # | Titlu | Type |
|---|---|---|
| 1 | Creierul în Borcan — de ce GPT nu știe vremea | lesson |
| 2 | Tool Calling — echipezi modelul cu mâini | lesson |
| 3 | Structured Outputs — JSON validat cu Pydantic | lesson |
| 4 | ReAct Pattern — Reason + Act | lesson |
| 5 | De ce MCP? | lesson |
| 6 | Arhitectura MCP: Host, Client, Server | lesson |
| 7 | Transport: STDIO vs. HTTP+SSE | lesson |
| 8 | MCP Tools | lesson |
| 9 | MCP Resources | lesson |
| 10 | MCP Prompts | lesson |
| 11 | Primul tău MCP Server | lab |
| 12 | MCP în ecosistem — Notion, GitHub, Stripe | lesson |
| 13 | Securitate MCP | lesson |
| 14 | De ce agenți multipli? | lesson |
| 15 | Patterns de Orchestrare | lesson |
| 16 | Agent Memory — Short/Long/Shared | lesson |
| 17 | Durable Agent State | lesson |
| 18 | LangGraph — controlul fluxului (framework, exemplu înlocuibil) | lesson |
| 19 | smolagents — prototipare rapidă (framework, exemplu înlocuibil) | lesson |
| 20 | Alegerea framework-ului — concepte durabile, tool-uri swappable | lesson |
| 21 | Echipa de 3 agenți | lab |
| 22 | Computer Use / GUI Agents (conceptual) | lesson |
| 23 | Agent-to-Agent (A2A) Protocol | lesson |
| 24 | Generative UI | lesson |
| 25 | Voice Agents — STT → LLM → TTS | lesson |
| 26 | Synthetic Data cu LLM-uri | lesson |
| 27 | AI-Assisted Development (Vibe Coding) | lesson |
| 28 | BOSS: Sistemul Multi-Agent Final | boss |

---

## CURSUL 12
```
slug: ai-in-productie
title: AI în Producție
description: De la experimentul local la sistemul care rulează 24/7 fără să cadă
difficulty: 4.0
order: 12
total_lessons: 22
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce eșuează modelele în producție — drift, rot | lesson |
| 2 | MLflow și Model Registry (conceptual) | lesson |
| 3 | CI/CD și Monitoring pentru modele (conceptual) | lesson |
| 4 | LLM-as-a-Judge | lesson |
| 5 | Evals — versiunea AI-native a testării | lesson |
| 6 | Tracing cu Langfuse | lesson |
| 7 | Observability Stack — Langfuse vs. Braintrust vs. Phoenix | lesson |
| 8 | Evals în CI/CD | lesson |
| 9 | KV Cache — decoding memory-bound (rimează cu memoization) | lesson |
| 10 | Continuous Batching | lesson |
| 11 | Speculative Decoding | lesson |
| 12 | MoE Serving | lesson |
| 13 | Cum funcționează serving-ul (vLLM, FastAPI conceptual) | lesson |
| 14 | Latency Optimization | lesson |
| 15 | Cost Optimization | lesson |
| 16 | Prompt Injection (JOC Gandalf) | lesson |
| 17 | Indirect Prompt Injection | lesson |
| 18 | Defense in Depth | lesson |
| 19 | Jailbreaking | lesson |
| 20 | EU AI Act — forma reglementării | lesson |
| 21 | Bias și Etica Datelor | lesson |
| 22 | UX pentru AI — streaming, surse RAG, feedback vizual | lesson |

---

## Sumar pentru validare seed

| Curs | Slug | Lecții | Difficulty |
|---|---|---|---|
| 1 | hardware-fizica | 30 | 2.0 |
| 2 | sisteme-de-operare | 22 | 2.5 |
| 3 | retele-internet | 26 | 2.5 |
| 4 | python-inginerie-software | 26 | 2.5 |
| 5 | algoritmi-structuri-date | 17 | 3.0 |
| 6 | matematica-ai | 22 | 3.0 |
| 7 | baze-date-ingineria-datelor | 18 | 3.0 |
| 8 | machine-learning | 21 | 3.5 |
| 9 | deep-learning-computer-vision | 21 | 4.0 |
| 10 | ai-generativ-llms | 36 | 4.0 |
| 11 | agentic-ai-mcp | 28 | 4.5 |
| 12 | ai-in-productie | 22 | 4.0 |
| **TOTAL** | | **289** | |

---

## Note pentru implementare

**Tipuri de lecții:**
- `lesson` — lecție standard cu teorie + analogie + exemplu
- `lab` — exercițiu practic interactiv (cod rulabil sau simulator)
- `boss` — sinteză practică la finalul cursului, implică toate conceptele din curs

**Progresie:**
- Cursurile sunt strict secvențiale (C1 → C12)
- Un curs nu devine disponibil până cursul anterior nu e completat 100%
- Excepție: C1-C4 pot fi parcurse în paralel de useri cu experiență (flag: `can_skip_prerequisites`)

**Slug-uri lecții:**
- Generare automată din titlu: `{course_slug}-l{order}` (ex: `hardware-fizica-l1`)
- Sau slug custom per lecție dacă titlul e prea lung

**Conținut:**
- Toate lecțiile au `content_mdx = null` la seed
- Conținutul se adaugă separat, lecție cu lecție
- `is_published = false` la seed pentru toate