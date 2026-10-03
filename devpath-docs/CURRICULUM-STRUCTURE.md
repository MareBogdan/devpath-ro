# CURRICULUM-STRUCTURE.md
> Structura curriculară DevPath RO — referință pentru implementare
> 12 cursuri · 205 lecții · Citit de Claude Code la seed/implementare

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
slug: python-matematica-dl
title: Python & Matematică pentru Deep Learning
description: De la Python esențial la algebra liniară și derivatele care fac o rețea neuronală să învețe
difficulty: 2.0
order: 4
total_lessons: 17
```
| # | Titlu | Type |
|---|---|---|
| 1 | Setup & mediul de lucru (Python, venv, Jupyter/Colab, NumPy) | lesson |
| 2 | Sintaxă esențială — variabile, tipuri, control flow | lesson |
| 3 | Structuri de date & comprehensions | lesson |
| 4 | Funcții — args, *args/**kwargs, lambda | lesson |
| 5 | OOP esențial — clase, __init__, moștenire (baza nn.Module) | lesson |
| 6 | LAB: Mini-proiect Python | lab |
| 7 | NumPy fundamentals — array-uri, shape, dtype, broadcasting | lesson |
| 8 | NumPy operații — indexare, slicing, vectorizare | lesson |
| 9 | LAB: Manipulare de date cu NumPy | lab |
| 10 | Algebră liniară I — scalari, vectori, matrici, tensori | lesson |
| 11 | Algebră liniară II — produs scalar și înmulțirea de matrici | lesson |
| 12 | Derivate & pantă — rata de schimbare | lesson |
| 13 | Gradient & derivate parțiale | lesson |
| 14 | Regula lanțului (chain rule) — fundația backpropagation | lesson |
| 15 | LAB: Gradient descent manual în NumPy | lab |
| 16 | Probabilitate & statistică esențială — softmax, distribuții | lesson |
| 17 | BOSS: Regresie liniară de la zero cu NumPy | boss |

---

## CURSUL 5
```
slug: data-engineering-ml-clasic
title: Data Engineering & ML Clasic
description: De la date brute la primul model care învață — Pandas, Scikit-learn și disciplina evaluării
difficulty: 2.5
order: 5
total_lessons: 15
```
| # | Titlu | Type |
|---|---|---|
| 1 | Pandas I — Series, DataFrame, citire CSV | lesson |
| 2 | Pandas II — selectare, filtrare, groupby, missing data | lesson |
| 3 | Curățare & preprocesare — normalizare, encoding categoric | lesson |
| 4 | LAB: Curăță un dataset real | lab |
| 5 | Vizualizare de date — Matplotlib/Seaborn | lesson |
| 6 | Ce e ML clasic — supervised vs unsupervised, train/test split | lesson |
| 7 | Regresie liniară cu Scikit-learn | lesson |
| 8 | Regresie logistică & clasificare | lesson |
| 9 | Metrici de evaluare — accuracy, precision, recall, MSE, R² | lesson |
| 10 | LAB: Antrenează un clasificator cu Scikit-learn | lab |
| 11 | Overfitting, regularizare & cross-validation | lesson |
| 12 | Feature engineering & scaling | lesson |
| 13 | Algoritmi clasici pe scurt — trees, k-NN, k-means | lesson |
| 14 | Pipeline-uri Scikit-learn & evitarea data leakage | lesson |
| 15 | BOSS: Proiect ML clasic end-to-end | boss |

---

## CURSUL 6
```
slug: pytorch-core
title: PyTorch Core
description: Inima cursului — tensori, Autograd și primul Training Loop scris manual, de la zero
difficulty: 3.0
order: 6
total_lessons: 16
```
| # | Titlu | Type |
|---|---|---|
| 1 | De ce PyTorch — tensori vs NumPy, GPU, graf dinamic | lesson |
| 2 | Tensori — creare, shape, dtype, device (CPU/GPU) | lesson |
| 3 | Operații cu tensori — broadcasting, reshape, indexare | lesson |
| 4 | LAB: Portează cod NumPy în PyTorch | lab |
| 5 | Autograd — requires_grad, .backward(), .grad | lesson |
| 6 | Graful de calcul dinamic | lesson |
| 7 | Gradient descent manual cu Autograd | lesson |
| 8 | nn.Module — primul model | lesson |
| 9 | Funcții de pierdere (loss) — MSE, CrossEntropy | lesson |
| 10 | Optimizatori — SGD, Adam, optimizer.step() | lesson |
| 11 | Training Loop manual — forward, loss, backward, step | lesson |
| 12 | LAB: Scrie un training loop de la zero | lab |
| 13 | Dataset & DataLoader — batching, shuffle | lesson |
| 14 | Dataset custom — clasa Dataset personalizată | lesson |
| 15 | GPU training — .to(device), bune practici | lesson |
| 16 | BOSS: Rețea neuronală de la zero (MNIST) cu training loop propriu | boss |

---

## CURSUL 7
```
slug: computer-vision-cnn
title: Computer Vision & CNN
description: Cum vede o rețea imaginile — de la convoluție la arhitecturi clasice și transfer learning
difficulty: 3.0
order: 7
total_lessons: 15
```
| # | Titlu | Type |
|---|---|---|
| 1 | Cum vede o rețea imaginile — pixeli, canale, tensori de imagine | lesson |
| 2 | De la MLP la convoluție — de ce fully-connected nu scalează | lesson |
| 3 | Operația de convoluție — kernel, stride, padding | lesson |
| 4 | Pooling & feature maps | lesson |
| 5 | LAB: Construiește un CNN simplu în PyTorch | lab |
| 6 | Arhitectura unui CNN complet | lesson |
| 7 | Torchvision — datasets, transforms, augmentare | lesson |
| 8 | Antrenează un CNN pe imagini (CIFAR-10) | lesson |
| 9 | Batch Normalization & Dropout | lesson |
| 10 | Arhitecturi clasice — LeNet, AlexNet, VGG, ResNet | lesson |
| 11 | Transfer learning — folosește un model pre-antrenat | lesson |
| 12 | LAB: Fine-tune ResNet pe dataset propriu | lab |
| 13 | Data augmentation & combaterea overfitting-ului | lesson |
| 14 | Interpretabilitate CNN — Grad-CAM și vizualizarea filtrelor | lesson |
| 15 | BOSS: Clasificator de imagini end-to-end cu transfer learning | boss |

---

## CURSUL 8
```
slug: sequence-models-rnn
title: Sequence Models (RNN & LSTM)
description: Date în care ordinea contează — RNN, LSTM și puntea către Transformer
difficulty: 3.5
order: 8
total_lessons: 14
```
| # | Titlu | Type |
|---|---|---|
| 1 | Date secvențiale — text, serii temporale, de ce contează ordinea | lesson |
| 2 | Reprezentarea textului — tokenizare, vocabular, indexare | lesson |
| 3 | Embeddings — de la cuvinte la vectori (nn.Embedding) | lesson |
| 4 | LAB: Pipeline de preprocesare text | lab |
| 5 | RNN — cum funcționează starea ascunsă (hidden state) | lesson |
| 6 | RNN în PyTorch — nn.RNN, secvențe, batching | lesson |
| 7 | Vanishing gradient — de ce RNN-urile simple uită | lesson |
| 8 | LSTM — porți (gates) și memorie pe termen lung | lesson |
| 9 | GRU & comparație cu LSTM | lesson |
| 10 | LAB: Antrenează un LSTM pentru clasificare de text | lab |
| 11 | Generare de text cu un model secvențial (char-level) | lesson |
| 12 | Seq2Seq & arhitectura encoder-decoder | lesson |
| 13 | Serii temporale — predicție cu RNN/LSTM | lesson |
| 14 | BOSS: Model de predicție pe secvențe | boss |

---

## CURSUL 9
```
slug: transformer-architecture
title: Arhitectura Transformer
description: Transformer-ul construit de la zero în PyTorch — atenție, QKV și blocul complet
difficulty: 4.0
order: 9
total_lessons: 13
```
| # | Titlu | Type |
|---|---|---|
| 1 | Limitele RNN/LSTM — de ce a apărut Transformer-ul | lesson |
| 2 | Ideea de atenție (attention) — intuiție | lesson |
| 3 | Self-attention — Query, Key, Value (QKV) | lesson |
| 4 | Scoruri de atenție — scaled dot-product | lesson |
| 5 | LAB: Self-attention de la zero în PyTorch | lab |
| 6 | Multi-head attention | lesson |
| 7 | Positional encoding — cum injectăm ordinea | lesson |
| 8 | Blocul Transformer — attention + FFN + layer norm + residual | lesson |
| 9 | Encoder vs Decoder — arhitectura completă | lesson |
| 10 | LAB: Asamblează un bloc Transformer complet | lab |
| 11 | Antrenarea unui mini-Transformer | lesson |
| 12 | De la Transformer la modele mari (intuiție GPT/BERT) | lesson |
| 13 | BOSS: Transformer complet de la zero pentru o sarcină simplă | boss |

---

## CURSUL 10
```
slug: modele-generative
title: Modele Generative
description: Rețele care creează, nu doar clasifică — autoencodere, VAE, GAN și bazele difuziei
difficulty: 4.0
order: 10
total_lessons: 13
```
| # | Titlu | Type |
|---|---|---|
| 1 | Ce e un model generativ — discriminativ vs generativ | lesson |
| 2 | Autoencoder — encoder, bottleneck, decoder | lesson |
| 3 | Antrenează un autoencoder (reconstrucție) | lesson |
| 4 | LAB: Autoencoder pentru denoising | lab |
| 5 | Variational Autoencoder (VAE) — spațiul latent, sampling | lesson |
| 6 | GAN — generator vs discriminator | lesson |
| 7 | Antrenarea unui GAN simplu | lesson |
| 8 | LAB: Generează imagini cu un GAN | lab |
| 9 | Generare condiționată (conditional VAE/GAN) | lesson |
| 10 | Modele de difuzie — ideea de adăugare/eliminare de zgomot | lesson |
| 11 | Forward & reverse diffusion process | lesson |
| 12 | Implementarea unui mini-model de difuzie | lesson |
| 13 | BOSS: Model generativ funcțional pe imagini | boss |

---

## CURSUL 11
```
slug: reinforcement-learning
title: Reinforcement Learning
description: Agenți care învață prin recompensă — de la Q-Learning tabelar la Deep Q-Networks
difficulty: 4.0
order: 11
total_lessons: 12
```
| # | Titlu | Type |
|---|---|---|
| 1 | Ce e RL — agent, mediu, stare, acțiune, recompensă | lesson |
| 2 | Procese de decizie Markov (MDP) | lesson |
| 3 | Politici & funcții de valoare | lesson |
| 4 | Q-Learning — tabelul Q, ecuația Bellman | lesson |
| 5 | LAB: Q-Learning tabelar pe un grid world | lab |
| 6 | De la Q-table la Deep Q-Network (DQN) | lesson |
| 7 | DQN în PyTorch — rețeaua ca aproximator | lesson |
| 8 | Experience replay & target network | lesson |
| 9 | LAB: Antrenează un agent DQN (CartPole) | lab |
| 10 | Explorare vs exploatare — epsilon-greedy | lesson |
| 11 | Policy Gradient (intuiție) | lesson |
| 12 | BOSS: Agent RL care rezolvă un mediu Gym | boss |

---

## CURSUL 12
```
slug: pytorch-productie
title: PyTorch în Producție
description: De la model antrenat la model livrat — salvare, ONNX, serving și optimizare pentru producție
difficulty: 3.5
order: 12
total_lessons: 12
```
| # | Titlu | Type |
|---|---|---|
| 1 | Salvarea & încărcarea modelelor (state_dict, checkpoints) | lesson |
| 2 | Eval vs train mode — inference corect | lesson |
| 3 | Optimizare pentru inference — quantization, pruning | lesson |
| 4 | TorchScript — tracing & scripting | lesson |
| 5 | Export ONNX — interoperabilitate | lesson |
| 6 | LAB: Exportă un model în ONNX și rulează inference | lab |
| 7 | Servirea modelului — TorchServe / FastAPI | lesson |
| 8 | Containerizare (Docker) pentru un model | lesson |
| 9 | LAB: Deploy un model ca API | lab |
| 10 | Monitorizare & versionare modele | lesson |
| 11 | Bune practici MLOps — reproductibilitate, experiment tracking | lesson |
| 12 | BOSS: Deploy complet — antrenează, exportă, servește un model | boss |

---

## Sumar pentru validare seed

| Curs | Slug | Lecții | Difficulty |
|---|---|---|---|
| 1 | hardware-fizica | 30 | 2.0 |
| 2 | sisteme-de-operare | 22 | 2.5 |
| 3 | retele-internet | 26 | 2.5 |
| 4 | python-matematica-dl | 17 | 2.0 |
| 5 | data-engineering-ml-clasic | 15 | 2.5 |
| 6 | pytorch-core | 16 | 3.0 |
| 7 | computer-vision-cnn | 15 | 3.0 |
| 8 | sequence-models-rnn | 14 | 3.5 |
| 9 | transformer-architecture | 13 | 4.0 |
| 10 | modele-generative | 13 | 4.0 |
| 11 | reinforcement-learning | 12 | 4.0 |
| 12 | pytorch-productie | 12 | 3.5 |
| **TOTAL** | | **205** | |

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

**Nota restructurare (pivot PyTorch, 2026-08-04):**
- Cursurile 1-3 rămân INTACTE (slug, titlu, lecții, ordine) — dețin date reale de user.
- Cursurile 4-12 au fost rescrise pentru focus pe ML/DL/PyTorch. Slug-urile 4-12 au fost redenumite pentru a reflecta noul conținut; redenumirea în DB se face printr-o migrare dedicată ÎNAINTE de rularea seeder-ului (altfel seeder-ul ar insera cursuri noi duplicate în loc să le actualizeze pe cele existente).
