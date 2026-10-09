# DevPath RO — MASTER PLAN (post-lansare)

> **Sursa de adevăr pentru etapa curentă.** Înlocuiește `DEPLOY-PLAN.md` (arhivat — deploy-ul e făcut).
> Citit de: **Bogdan** (tracking) și **Claude Code** (execuție). Arhitect: Claude (Cowork), prompturi în engleză.
> Start: 2026-10-09 · Live: https://devpath-ro.vercel.app · DB: Supabase `zgofeajewktwmswckgup`
>
> **Obiectiv:** cursurile 1–6 duse la calitate de lansare. NU se lucrează la cursurile 7–13 până nu sunt gata 1–6.
> Marketing-ul începe abia după ce această etapă e ✅.

---

## REGULA DE LUCRU (toate prompturile)

Un obiectiv per prompt · gate la final: `npx tsc --noEmit` = 0 · `npm run lint` = 0 · `npm run build` cu lint ON,
în **copie izolată** (NU atinge serverul dev de pe :3000) · **Sonnet, efort High** · dacă pică gate-ul, se repară
în același prompt · la final Claude Code actualizează `PROGRESS.md` **și** bifează în acest fișier.

Push-ul se face manual de Bogdan (PowerShell): `cd "C:\DevPath RO"` → `del ".git\*.lock"` → `git push origin main`.

---

## STAREA REALĂ LA 2026-10-09 (audit complet)

| Ce | Stare |
|---|---|
| Lecții scrise (cursurile 1–6) | **131** `.mdx`, toate `type: lesson` |
| Boss fights / laburi **în conținut** | **0** |
| Boss fights / laburi **construite în cod** | **5** (~8.000 linii) — nefolosite |
| Întrebări inline în DB (`inline_questions`) | **0 rânduri** (sistemul de 7 tipuri e complet construit) |
| `python-editor` folosit în lecții | **0** din 131 (Pyodide funcțional, 331 blocuri python statice) |
| `wow_notes` / `flashcards` / `quiz_questions` | **0 / 0 / 0** |
| `glossar_terms` | 50 rânduri ✅ |
| Lecții cu headinguri template (HOOK/CONTEXT/MIEZUL/REVEAL/ÎNCHEIERE) | **114 din 131** |
| Lungime medie lecție | ~2.000 cuvinte (zid de text) |
| Dashboard | 10 secțiuni scroll lung — de refăcut |

---

## STRUCTURA DECISĂ — 13 CURSURI

**Decizie 2026-10-09:** se inserează `pytorch-core` ca **Cursul 7**; cursurile ML se mută cu +1 → 13 cursuri.
Motiv: fără PyTorch Core, studentul sare de la "ce e o derivată" (C6) direct la "fine-tune ResNet" (CV) — gaură
imposibil de trecut. `data-engineering-ml-clasic` rămâne în afara traseului principal (eventual curs opțional, mai târziu).

| # | Slug | Lecții (final) | Lab | Boss | Stare |
|---|---|---|---|---|---|
| 1 | `hardware-fizica` | 30 | 3 | 2 | publicat · 25 scrise, 5 de adăugat |
| 2 | `sisteme-de-operare` | 22 | 2 | 1 | publicat · 19 scrise, 3 de adăugat |
| 3 | `retele-internet` | 26 | 1 | 1 | publicat · 24 scrise, 2 de adăugat |
| 4 | `python-inginerie-software` | 29 | 2 | 1 | publicat · 26 scrise, 3 de adăugat |
| 5 | `algoritmi-structuri-date` | 19 | 2 | 1 | publicat · 16 scrise, 3 de adăugat |
| 6 | `matematica-ai` | 24 | 2 | 1 | publicat · 21 scrise, 3 de adăugat |
| 7 | `pytorch-core` | 16 | 2 | 1 | **NOU** — schelet gol |
| 8 | `computer-vision-cnn` | 15 | 2 | 1 | schelet gol (era 7) |
| 9 | `sequence-models-rnn` | 14 | 2 | 1 | schelet gol (era 8) |
| 10 | `transformer-architecture` | 13 | 2 | 1 | schelet gol (era 9) |
| 11 | `modele-generative` | 13 | 2 | 1 | schelet gol (era 10) |
| 12 | `reinforcement-learning` | 12 | 2 | 1 | schelet gol (era 11) |
| 13 | `pytorch-productie` | 12 | 2 | 1 | schelet gol (era 12) |
| | **TOTAL** | **245** | | | **150 în cursurile 1–6** |

### Sloturile lab/boss — cursurile 1–6

Serpentina le randează deja corect: `lab` → iconiță `Code2` + "Exercițiu · L{n}", `boss` → `Trophy` + nod mare.
**Nu e nimic de modificat în hartă.**

| Curs | Poz. | Titlu | Type | Componentă |
|---|---|---|---|---|
| C1 | 8 | LAB: Aprinde tranzistorul | lab | `TransistorLab.tsx` ✅ gata |
| C1 | 10 | JOC: Traducătorul Binar | lab | `BinaryTranslator.tsx` ✅ gata |
| C1 | 16 | BOSS: Alarma de Seif | boss | `BossFightAlarmaSef.tsx` ✅ gata |
| C1 | 23 | JOC: Grila Memoriei RAM | lab | `RAMGridGame.tsx` ✅ gata |
| C1 | 29 | BOSS: Asamblează CPU | boss | `BossFightAsambleazaCPU.tsx` ✅ gata |
| C2 | 10 | Simulatorul de Paginare | lab | de construit |
| C2 | 19 | Scripturi Bash | lab | de construit |
| C2 | 22 | BOSS: Administratorul de Sistem | boss | de construit |
| C3 | 7 | SIMULATOR: TCP/IP Exhaustiv | lab | de construit |
| C3 | 26 | BOSS: Arhitectul de Cloud | boss | de construit |
| C4 | 12 | LAB: Calculator cu validare | lab | `python-editor` (Pyodide) |
| C4 | 18 | LAB: Agenda de contacte | lab | `python-editor` (Pyodide) |
| C4 | 29 | BOSS: Analizorul de loguri | boss | `python-editor` (Pyodide) |
| C5 | 7 | LAB: Bubble vs Merge — numără operațiile | lab | `python-editor` (Pyodide) |
| C5 | 13 | LAB: Drumul cel mai scurt — BFS și Dijkstra pe un graf real | lab | `python-editor` (Pyodide) |
| C5 | 19 | BOSS: 3 probleme cu complexitate impusă | boss | `python-editor` (Pyodide) |
| C6 | 8 | LAB: Algebră liniară cu NumPy | lab | `python-editor` (NumPy e preîncărcat) |
| C6 | 15 | LAB: Entropie și cross-entropie | lab | `python-editor` (NumPy) |
| C6 | 24 | BOSS: Gradient descent manual de la zero | boss | `python-editor` (NumPy + matplotlib) |

> C1–C3: pozițiile sunt deja libere în numerotare → **zero renumerotare**.
> C4–C6: necesită renumerotarea lecțiilor următoare. **Sigur** — progresul e legat de `lesson.id` (UUID), nu de `order_index`.

---

## DECIZII LUATE (nu se redeschid fără motiv)

| # | Decizie | Ales |
|---|---|---|
| D1 | Sursa definițiilor pentru termeni clickabili | În MDX, lângă termen (`<Term def="...">`). `glossar_terms` rămâne doar pentru pagina de glosar. |
| D2 | Întrebări per lecție | 5–7, răspândite în text: 2× `single_choice`, 1× `fill_blank`, 1× `ordering`/`match_pairs`, 1× `true_false`, 1× `short_answer`. Grila ≤ 30%. |
| D3 | Calitatea grilelor | Spec strictă + script de validare: lungimi în ±20%, fără "toate cele de mai sus", fiecare distractor = o concepție greșită reală. |
| D4 | Unde merge `python-editor` | C4 python (26) + C5 algoritmi (16) + C6 matematică unde e numeric (~10) ≈ **52 lecții**. NU în hardware/OS/rețele. |
| D5 | Conținutul lecțiilor | Headinguri reale + tăiere 15–20% din text + spargerea paragrafelor. NU se rescrie de la zero. |
| D6 | Primul lucru după curățenie | Conectarea celor 5 lab/boss din Cursul 1. |
| D7 | `CURRICULUM-STRUCTURE.md` | Rescris cu realitatea, 13 cursuri, înainte de orice lucru la conținut. |

---

## FAZA 0 — FUNDAȚIE (fix, se face în ordine)

- [x] **P1 · Structura adevărată** ✅ 2026-10-09 — rescrie `CURRICULUM-STRUCTURE.md` (13 cursuri, sloturi lab/boss),
      inserează `pytorch-core` ca C7 în DB, reindexează C8–C13. Niciun fișier de conținut atins.
- [ ] **P2 · Curățenie** — cod mort, fișiere nefolosite, docs/planuri vechi, `CLAUDE.md` + `PROJECT-STATE.md` aduse la zi.
- [ ] **P3 · Cursul 1 — cele 5 lab/boss** — fișierele `.mdx` care cheamă componentele existente, sync DB, verificat în serpentină.
- [ ] **P4 · Lecția pilot** — standardul complet (termeni clickabili + 5–7 întrebări mixte + python-editor) pe O SINGURĂ lecție, pentru aprobare.

**După P4, lucrul devine condus de Bogdan: pagină cu pagină, el decide ce urmează.**

---

## BACKLOG CUNOSCUT (ordinea o decide Bogdan după Faza 0)

| Zonă | Ce | Mărime |
|---|---|---|
| Conținut | Aplică standardul pe restul de 130 lecții (1 prompt/curs) | 6 prompturi |
| Conținut | Rescrie headingurile HOOK/CONTEXT/… pe 114 lecții | inclus mai sus |
| Lab/Boss | Construiește cele 5 lab/boss pentru C2+C3 (simulatoare noi) | 3–5 prompturi |
| Lab/Boss | Scrie cele 9 lab/boss Pyodide pentru C4–C6 | 3 prompturi |
| Dashboard | Refacere completă (acum: 10 secțiuni scroll lung) | 2 prompturi |
| UI/UX | Animații, polish, serpentina pe desktop | 3–4 prompturi |
| Date goale | `flashcards` (pagină goală), `wow_notes`, quiz static | 1–2 prompturi |
| Landing | Cifre reale după ce apar boss-urile | 1 prompt |

---

## JURNAL (Claude Code adaugă o linie după fiecare prompt)

| Data | Prompt | Rezultat | Gate |
|---|---|---|---|
| 2026-10-09 | — | Audit complet + plan. Structura decisă: 13 cursuri. | — |
| 2026-10-09 | P1 | `CURRICULUM-STRUCTURE.md` rescris (13 cursuri, 245 lecții, 19 sloturi lab/boss marcate). DB live: `pytorch-core` inserat ca C7 (16 schelete nepublicate), C7–12 → C8–13; 13 cursuri, order 1–13 unic; 131 lecții publicate neatinse. Migrare `20261009120000_insert_pytorch_core_course.sql`. | tsc 0 · lint 0 err (2 warn) · build ✅ (copie izolată) |
