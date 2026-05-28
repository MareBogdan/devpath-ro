# CURRICULUM-STRUCTURE.md
> Structura curriculară DevPath RO — referință pentru implementare
> 12 cursuri · 321 lecții · Citit de Claude Code la seed/implementare

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
title: Python & Inginerie Software
description: Gândire algoritmică, cod curat și uneltele cu care lucrează orice inginer în 2026
difficulty: 2.5
order: 4
total_lessons: 38
```
| # | Titlu | Type |
|---|---|---|
| 1 | 3 linii de Python care ating internetul | lesson |
| 2 | Sintaxa | lesson |
| 3 | Variabile | lesson |
| 4 | Tipuri de date primitive | lesson |
| 5 | Operatori aritmetici și logici | lesson |
| 6 | Structuri decizionale If/Elif/Else | lesson |
| 7 | Bucle FOR | lesson |
| 8 | Bucle WHILE și pericolul buclei infinite | lesson |
| 9 | Funcții | lesson |
| 10 | Scope: Local vs. Global | lesson |
| 11 | Try/Except | lesson |
| 12 | Liste | lesson |
| 13 | Dicționare (Hash Maps) | lesson |
| 14 | Tuple-uri | lesson |
| 15 | Set-uri | lesson |
| 16 | Mutabilitate vs. Imutabilitate | lesson |
| 17 | Clase și Obiecte | lesson |
| 18 | Atribute și Metode | lesson |
| 19 | Encapsulare | lesson |
| 20 | Moștenire | lesson |
| 21 | Polimorfism | lesson |
| 22 | Singleton | lesson |
| 23 | Factory | lesson |
| 24 | Observer | lesson |
| 25 | Strategy | lesson |
| 26 | List Comprehensions | lesson |
| 27 | Generatoare și yield | lesson |
| 28 | Decoratori | lesson |
| 29 | Async/Await | lesson |
| 30 | Gestionarea Fișierelor (File I/O) | lesson |
| 31 | Expresii Regulate (RegEx) | lesson |
| 32 | Modulul requests | lesson |
| 33 | Serializare JSON + Pydantic | lesson |
| 34 | uv + Virtual Environments + pyproject.toml | lesson |
| 35 | pytest + Unit Testing | lesson |
| 36 | FastAPI — primul API REST | lesson |
| 37 | Git — commit, branch, merge, rebase | lesson |
| 38 | BOSS: Aplicația Completă | boss |

---

## CURSUL 5
```
slug: algoritmi-structuri-date
title: Algoritmi & Structuri de Date
description: Diferența dintre cod care merge și cod care scalează la milioane de utilizatori
difficulty: 3.0
order: 5
total_lessons: 20
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce aplicația ta îngheață la 10.000 de utilizatori? | lesson |
| 2 | Căutare Liniară vs. Binară | lesson |
| 3 | Notarea Big O | lesson |
| 4 | Space-Time Tradeoff | lesson |
| 5 | Bubble Sort | lesson |
| 6 | Quick Sort | lesson |
| 7 | Merge Sort | lesson |
| 8 | Heap Sort și TimSort | lesson |
| 9 | Arbori Binari de Căutare (BST) | lesson |
| 10 | Heap | lesson |
| 11 | Grafuri | lesson |
| 12 | BFS vs. DFS | lesson |
| 13 | Algoritmul lui Dijkstra | lesson |
| 14 | Trie | lesson |
| 15 | Recursivitate | lesson |
| 16 | Memoization | lesson |
| 17 | Programare Dinamică | lesson |
| 18 | Greedy Algorithms | lesson |
| 19 | Two Pointers & Sliding Window | lesson |
| 20 | BOSS: Optimizatorul | boss |

---

## CURSUL 6
```
slug: baze-date-ingineria-datelor
title: Baze de Date & Ingineria Datelor
description: De la un tabel Excel la un pipeline care alimentează un model AI
difficulty: 3.0
order: 6
total_lessons: 27
```
| # | Titlu | Type |
|---|---|---|
| 1 | Excel vs. Server Database | lesson |
| 2 | Schema, rânduri, coloane | lesson |
| 3 | CRUD | lab |
| 4 | Clauza WHERE și filtrarea | lesson |
| 5 | Chei Primare | lesson |
| 6 | Foreign Keys și Normalizarea | lesson |
| 7 | JOIN-uri | lesson |
| 8 | GROUP BY și Agregările | lesson |
| 9 | Indexarea | lesson |
| 10 | Tranzacțiile ACID | lesson |
| 11 | De ce a apărut NoSQL | lesson |
| 12 | Baze Documentare (MongoDB) | lesson |
| 13 | Baze de tip Graf (Neo4j) | lesson |
| 14 | Redis | lesson |
| 15 | Teorema CAP | lesson |
| 16 | Ce este un Data Pipeline | lesson |
| 17 | Extract | lab |
| 18 | Transform | lab |
| 19 | Load | lesson |
| 20 | Automatizare — Cron Jobs și Airflow | lesson |
| 21 | Data Streaming (Kafka) | lesson |
| 22 | Limitarea căutării exacte | lesson |
| 23 | Embeddings | lesson |
| 24 | Geometria semantică | lesson |
| 25 | Cosine Similarity | lesson |
| 26 | Vector Databases | lesson |
| 27 | BOSS: Sistemul de Căutare Semantică | boss |

---

## CURSUL 7
```
slug: matematica-ai
title: Matematică pentru AI
description: Transformi ecuațiile din manual în instrumente vizuale pe care le simți
difficulty: 3.0
order: 7
total_lessons: 21
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce AI-ul nu înțelege cuvinte — înțelege vectori | lesson |
| 2 | Scalari și Vectori | lesson |
| 3 | Produsul Scalar (Dot Product) | lesson |
| 4 | Matrici | lesson |
| 5 | Înmulțirea Matricială | lesson |
| 6 | Transpusa, Inversa și Determinantul | lesson |
| 7 | Distribuția Normală | lesson |
| 8 | Teorema lui Bayes | lesson |
| 9 | Entropie Shannon | lesson |
| 10 | Cross-Entropie | lesson |
| 11 | Divergența KL | lesson |
| 12 | Funcții și continuitate | lesson |
| 13 | Derivata | lesson |
| 14 | Regula Lanțului (Chain Rule) | lesson |
| 15 | Gradienți | lesson |
| 16 | Introducere în Pandas | lesson |
| 17 | Curățarea Datelor | lab |
| 18 | Detectarea Anomaliilor | lab |
| 19 | Explorarea Datelor (EDA) | lesson |
| 20 | Vizualizări cu Matplotlib/Seaborn | lesson |
| 21 | BOSS: Coborârea pe Gradient | boss |

---

## CURSUL 8
```
slug: machine-learning
title: Machine Learning
description: Primul tău model care învață din date, fără reguli scrise de tine
difficulty: 3.5
order: 8
total_lessons: 22
```
| # | Titlu | Type |
|---|---|---|
| 1 | De la IF/ELSE la Predicție | lesson |
| 2 | Regresia Liniară | lesson |
| 3 | Funcția de Pierdere (Loss) | lesson |
| 4 | Gradient Descent | lesson |
| 5 | Regresia Logistică | lesson |
| 6 | Arbori de Decizie | lesson |
| 7 | Random Forest | lesson |
| 8 | Overfitting vs. Underfitting | lesson |
| 9 | Cross-Validation și Hyperparameter Tuning | lesson |
| 10 | K-Means Clustering | lesson |
| 11 | Reducerea Dimensionalității (PCA) | lesson |
| 12 | Detectarea Anomaliilor Nesupervizate | lesson |
| 13 | Agentul și Mediul | lesson |
| 14 | Q-Learning | lesson |
| 15 | Dilema Explorare vs. Exploatare | lesson |
| 16 | Deep Q-Networks (DQN) | lesson |
| 17 | CPU vs. GPU | lesson |
| 18 | Arhitectura GPU | lesson |
| 19 | VRAM și Bandwidth | lesson |
| 20 | CUDA | lesson |
| 21 | Quantizarea | lesson |
| 22 | BOSS: Supraviețuirea Robotului | boss |

---

## CURSUL 9
```
slug: deep-learning-computer-vision
title: Deep Learning & Computer Vision
description: De la perceptronul simplu la arhitecturile care au schimbat lumea
difficulty: 4.0
order: 9
total_lessons: 22
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce 2012 a schimbat totul | lesson |
| 2 | Perceptronul | lesson |
| 3 | Rețeaua Multistrat (MLP) | lesson |
| 4 | Funcții de Activare (ReLU, Sigmoid, tanh) | lesson |
| 5 | Backpropagation | lesson |
| 6 | Optimizatori (SGD, Adam, AdamW) | lesson |
| 7 | Regularizare (Dropout, L2, Batch Norm) | lesson |
| 8 | Limitarea MLP pe imagini | lesson |
| 9 | Convoluția | lesson |
| 10 | Pooling | lesson |
| 11 | Arhitectura CNN completă | lesson |
| 12 | Transfer Learning | lesson |
| 13 | HuggingFace Hub + Spaces | lesson |
| 14 | Object Detection (YOLO) | lesson |
| 15 | ResNet | lesson |
| 16 | Vision Transformer (ViT) | lesson |
| 17 | CNN vs. ViT | lesson |
| 18 | Mixture of Experts (MoE) | lesson |
| 19 | Clasificare de imagini | lab |
| 20 | Segmentare semantică | lesson |
| 21 | LAB: Detector de emoții faciale | lab |
| 22 | BOSS: De la dataset la model deployat | boss |

---

## CURSUL 10
```
slug: ai-generativ-llms
title: AI Generativ & LLMs
description: Cum gândește, vorbește și creează un model de limbaj modern
difficulty: 4.0
order: 10
total_lessons: 38
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce ChatGPT nu știe să numere literele din "strawberry"? | lesson |
| 2 | Tokenizarea | lesson |
| 3 | Predicția Următorului Token | lesson |
| 4 | Temperatura și Top-P | lesson |
| 5 | Limitarea RNN | lesson |
| 6 | Mecanismul de Atenție (Self-Attention) | lesson |
| 7 | Query, Key, Value | lesson |
| 8 | Multi-Head Attention | lesson |
| 9 | Positional Encoding | lesson |
| 10 | Arhitectura completă Transformer | lesson |
| 11 | Scaling Laws | lesson |
| 12 | Pre-Training | lesson |
| 13 | Post-Training Stack 2026: SFT → DPO → GRPO | lesson |
| 14 | RLHF conceptual | lesson |
| 15 | Fine-Tuning vs. Pre-Training | lesson |
| 16 | LoRA | lesson |
| 17 | QLoRA — 4-bit + LoRA | lesson |
| 18 | Model Selection Framework | lesson |
| 19 | Prompt Engineering | lesson |
| 20 | Structured Outputs cu instructor+Pydantic | lesson |
| 21 | Context Window Management | lesson |
| 22 | Prompt Caching | lesson |
| 23 | Modele Locale cu Ollama | lab |
| 24 | Reasoning Models (o1, o3, DeepSeek-R1) | lesson |
| 25 | Chain-of-Thought | lesson |
| 26 | Long Context vs. RAG | lesson |
| 27 | Limitele actuale ale LLM-urilor | lesson |
| 28 | Halucinația | lesson |
| 29 | Arhitectura RAG | lesson |
| 30 | Chunking Strategies | lesson |
| 31 | Reranking | lesson |
| 32 | Advanced RAG (HyDE, Hybrid Search, Contextual Compression) | lesson |
| 33 | GraphRAG | lesson |
| 34 | Evaluarea unui sistem RAG | lesson |
| 35 | Modele de Difuzie | lesson |
| 36 | AI Multimodal (CLIP, VLMs, Whisper) | lesson |
| 37 | Gradio | lab |
| 38 | BOSS: Sistem RAG Complet cu Gradio UI | boss |

---

## CURSUL 11
```
slug: agentic-ai-mcp
title: Agentic AI & MCP
description: Modelele care planifică, acționează și se corectează singure
difficulty: 4.5
order: 11
total_lessons: 29
```
| # | Titlu | Type |
|---|---|---|
| 1 | Creierul în Borcan | lesson |
| 2 | Tool Calling | lesson |
| 3 | Structured Outputs pentru Agenți | lesson |
| 4 | ReAct Pattern | lesson |
| 5 | De ce MCP? | lesson |
| 6 | Arhitectura MCP: Host, Client, Server | lesson |
| 7 | Transport: STDIO vs. HTTP+SSE | lesson |
| 8 | MCP Tools | lesson |
| 9 | MCP Resources | lesson |
| 10 | MCP Prompts | lesson |
| 11 | LAB: Primul tău MCP Server | lab |
| 12 | MCP în ecosistem | lesson |
| 13 | Securitate MCP | lesson |
| 14 | De ce agenți multipli? | lesson |
| 15 | Patterns de Orchestrare | lesson |
| 16 | Agent Memory | lesson |
| 17 | Durable Agent State | lesson |
| 18 | LangGraph | lesson |
| 19 | smolagents | lesson |
| 20 | LangGraph vs. smolagents vs. OpenAI Agents SDK | lesson |
| 21 | LAB: Echipa de 3 agenți | lab |
| 22 | Computer Use / GUI Agents | lesson |
| 23 | Agent-to-Agent (A2A) Protocol | lesson |
| 24 | Generative UI | lesson |
| 25 | Voice Agents | lesson |
| 26 | Synthetic Data cu LLM-uri | lesson |
| 27 | Vibe Coding | lesson |
| 28 | LAB: Agent Complet end-to-end | lab |
| 29 | BOSS: Sistemul Multi-Agent Final | boss |

---

## CURSUL 12
```
slug: ai-in-productie
title: AI în Producție
description: De la experimentul local la sistemul care rulează 24/7 fără să cadă
difficulty: 4.0
order: 12
total_lessons: 26
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce modelele eșuează în producție | lesson |
| 2 | MLflow și Model Registry | lesson |
| 3 | Automatizarea lansării (CI/CD) | lesson |
| 4 | Monitoring | lesson |
| 5 | A/B Testing pentru modele | lesson |
| 6 | LLM-as-a-Judge | lesson |
| 7 | Evals cu Braintrust | lab |
| 8 | Tracing cu Langfuse | lab |
| 9 | Observability Stack complet | lesson |
| 10 | Evals în CI/CD | lesson |
| 11 | KV Cache | lesson |
| 12 | Continuous Batching | lesson |
| 13 | Speculative Decoding | lesson |
| 14 | MoE Serving | lesson |
| 15 | vLLM în practică | lab |
| 16 | FastAPI pentru AI — streaming SSE | lab |
| 17 | Latency Optimization | lesson |
| 18 | Cost Optimization | lesson |
| 19 | Prompt Injection | lesson |
| 20 | Indirect Prompt Injection | lesson |
| 21 | Defense in Depth | lesson |
| 22 | Jailbreaking | lesson |
| 23 | EU AI Act | lesson |
| 24 | Bias și Etica Datelor | lesson |
| 25 | Edge AI | lesson |
| 26 | BOSS: UX pentru AI + Capstone Final | boss |

---

## Sumar pentru validare seed

| Curs | Slug | Lecții | Difficulty |
|---|---|---|---|
| 1 | hardware-fizica | 30 | 2.0 |
| 2 | sisteme-de-operare | 22 | 2.5 |
| 3 | retele-internet | 26 | 2.5 |
| 4 | python-inginerie-software | 38 | 2.5 |
| 5 | algoritmi-structuri-date | 20 | 3.0 |
| 6 | baze-date-ingineria-datelor | 27 | 3.0 |
| 7 | matematica-ai | 21 | 3.0 |
| 8 | machine-learning | 22 | 3.5 |
| 9 | deep-learning-computer-vision | 22 | 4.0 |
| 10 | ai-generativ-llms | 38 | 4.0 |
| 11 | agentic-ai-mcp | 29 | 4.5 |
| 12 | ai-in-productie | 26 | 4.0 |
| **TOTAL** | | **321** | |

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