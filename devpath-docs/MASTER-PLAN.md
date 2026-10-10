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

## ⏸️ UNDE AM RĂMAS — citește asta primul (2026-10-10)

**Git:** 7 commit-uri locale, **NEPUSHATE** (`origin/main` e la `17c90b3`): P1 `8056793` → P2 `3654974` → P2b `612ca79` → P3 `216199c` → P4 `2070de0` → `dc871cd` (handoff) → **P4b+P5** (ultimul). Arborele e curat după commit. Push-ul îl dă owner-ul manual.

**DB live:** 13 cursuri. Cursul 1 are 30 de lecții publicate (3 lab, 2 boss); cele 5 lab/boss au acum **bold-ul din fișiere** (UPDATE aprobat, executat 2026-10-10; verificat md5: cele 5 rânduri = corpurile fișierelor, celelalte 25 neatinse). Nicio altă schimbare de schemă.

**Starea Fazei 0:** P1–P5 ✅. **Urmează P6 — lecția pilot** (standardul complet pe O SINGURĂ lecție, pentru aprobare); după aceea lucrul e condus de Bogdan, pagină cu pagină.

**Ce s-a închis în P4b + P5 (detalii în JURNAL / `PROGRESS.md`):**
- **Regula hărții:** un modul se închide cu **exact un nod mare**; ierarhie boss > ultima lecție a cursului > checkpoint la fiecare a 5-a (`resolveCheckpoints` în `lib/course-map.ts`). Noduri nemaipuse mari: C1 15 și 30, C4 25, C5 15, C6 20. Nodurile de după ultimul checkpoint al unui curs (lecția 30 de după boss-ul 29) se agață de modulul acelui checkpoint, nu mai deschid un modul singur (`serpentine-path.tsx`).
- **Complete legat de joc:** pe `lab`/`boss` butonul rămâne blocat (cu hint vizibil în română) până când jocul apelează `onComplete`. Contractul: `src/components/mdx/game-contract.ts`. Lecțiile obișnuite — neschimbate.
- **XP pe tip:** lecție 15 · lab 25 · boss 50 (plat, citit din rândul DB, scris cu service-role; același event `lesson_complete`, deci fără schimbare de schemă).
- **Fără quiz AI** pe lab/boss.
- **`scripts/sync-content.mjs`** setează acum `is_published` + `module_index`, compară înainte de scriere (re-rulabil, no-op pe C1) și are `--dry-run` / `--all`.

**Rămas deschis (de decis):** vezi „BACKLOG CUNOSCUT” — în special (1) cele 91 de fișiere C2–C6 cu `module_index` vechi în frontmatter (DB are alte valori), (2) gate-ul de Complete e doar în UI (serverul nu verifică jocul), (3) cele 2 rânduri 🔴 (Stripe `planType`, rate limiting AI) rămân **blocking-for-marketing**.

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
| D2 | Întrebări per lecție | **REVIZUIT 2026-10-09: 3 întrebări**, nu 5–7. Una per concept real. Q1 după primul concept (`true_false`/`single_choice`), Q2 la mijloc după mecanismul principal (`fill_blank`/`ordering`/`match_pairs`), Q3 spre final (`short_answer` sau `single_choice` greu). Pe `lab` și `boss`: ZERO întrebări — jocul e evaluarea. Motiv: 7 întrebări = ~50% overhead peste 14 min de citit, și 917 întrebări pe platformă nu se pot scrie la calitate. 3 × 131 = 393, fezabil. |
| D3 | Calitatea grilelor | **REVIZUIT 2026-10-09 — 6 reguli dure + script de validare.** (1) **3 variante, nu 4** — cu 4 apare mereu una de umplutură. (2) Paritate de lungime: toate variantele în ±15% caractere. (3) Răspunsul corect NU are voie să fie cel mai lung — dacă e, se rescrie. (4) Fiecare distractor = o confuzie reală, pe care autorul trebuie să o poată numi explicit („B o alege cine a confundat X cu Y"); dacă nu poate, distractorul se aruncă. (5) Interzis: „toate cele de mai sus", „niciuna", negații duble, variante care se exclud logic. (6) Paralelism gramatical între variante. Script de validare rulat per curs: respinge automat (2), (5) și cazul (3). |
| D4 | Unde merge `python-editor` | C4 python (26) + C5 algoritmi (16) + C6 matematică unde e numeric (~10) ≈ **52 lecții**. NU în hardware/OS/rețele. |
| D5 | Conținutul lecțiilor | Headinguri reale + tăiere 15–20% din text + spargerea paragrafelor. NU se rescrie de la zero. |
| D6 | Primul lucru după curățenie | Conectarea celor 5 lab/boss din Cursul 1. |
| D7 | `CURRICULUM-STRUCTURE.md` | Rescris cu realitatea, 13 cursuri, înainte de orice lucru la conținut. |

---

## FAZA 0 — FUNDAȚIE (fix, se face în ordine)

- [x] **P1 · Structura adevărată** ✅ 2026-10-09 — rescrie `CURRICULUM-STRUCTURE.md` (13 cursuri, sloturi lab/boss),
      inserează `pytorch-core` ca C7 în DB, reindexează C8–C13. Niciun fișier de conținut atins.
- [x] **P2 · Curățenie** ✅ 2026-10-09 (inclusiv cele 8 ștergeri din sweep și split-ul `PROGRESS.md`/`CHANGELOG.md`, aprobate de owner) — cod mort, fișiere nefolosite, docs/planuri vechi, `CLAUDE.md` + `PROJECT-STATE.md` aduse la zi.
- [x] **P3 · Cursul 1 — cele 5 lab/boss** ✅ 2026-10-09 — 5 fișiere `.mdx` + 5 rânduri publicate în DB (C1 = 30 lecții contigue, 136 publicate în total), verificat în serpentină (desktop + mobil). 6 defecte descoperite, vezi P4 și P5.
- [x] **P4 · Reparare defecte lab/boss** ✅ 2026-10-09 — hidratare RAMGrid (0 erori), cadru full-bleed + fullscreen partajat (boșii utilizabili pe telefon în landscape), iconițe/noduri hartă (tip peste poziție, boss = checkpoint mare), bold lizibil în light mode. **Leftover-urile P4 — închise 2026-10-10 (P4b):** UPDATE-ul DB cu bold-ul executat și verificat md5; regula „un modul = un singur nod mare” aplicată pe hartă (înălțimea desktop adusă înapoi sub nivelul de dinainte de P4).
- [x] **P5 · Integrare gameplay** ✅ 2026-10-10 — Complete legat de terminarea jocului (contract `onComplete`, 5 jocuri), XP lecție 15 / lab 25 / boss 50 din DB, fără quiz AI pe lab/boss, `sync-content.mjs` reparat (no-op pe C1), modulul-orfan al hărții eliminat. Verificat end-to-end cu un utilizator de test temporar (șters): cele 5 jocuri jucate până la capăt, `xp_events` = 25/25/50/25/50 + 15 pe o lecție obișnuită.
- [ ] **P6 · Lecția pilot** — standardul complet (termeni clickabili + **3** întrebări per D2 + python-editor unde e cazul) pe O SINGURĂ lecție, pentru aprobare.

**După P4, lucrul devine condus de Bogdan: pagină cu pagină, el decide ce urmează.**

---

## BACKLOG CUNOSCUT (ordinea o decide Bogdan după Faza 0)

| Zonă | Ce | Mărime |
|---|---|---|
| 🔴 Securitate · **blocking-for-marketing** | **P5-02 — Stripe checkout are încredere în `planType` (și `priceId`) trimise de client** (`src/app/api/stripe/checkout/route.ts`): un user poate plăti un preț ieftin și trimite `planType:"lifetime"` (escaladare de privilegii la cumpărare); webhook-ul se bazează pe `metadata.planType`. Latent cât timp Stripe nu e configurat în producție, dar **trebuie reparat înainte să se activeze plățile**. Fix: mapare server-side `planType` → price ID, ignoră `priceId` din client. | 1 prompt |
| 🔴 Cost · **blocking-for-marketing** | **Fără rate limiting pe rutele AI** — `/api/ai/chat`, `/api/ai/generate-quiz`, `/api/ai/coach-session`, `/api/onboarding/welcome-message` pot fi lovite de oricine pe creditele Anthropic ale owner-ului (verificat 2026-10-09: nu există nicio limitare în `src/app/api`). **Trebuie reparat înainte de orice campanie de marketing.** Fix minim: contor zilnic per user în DB (+ plafon global). | 1 prompt |
| Conținut | Aplică standardul pe restul de 130 lecții (1 prompt/curs) | 6 prompturi |
| Conținut | Rescrie headingurile HOOK/CONTEXT/… pe 114 lecții | inclus mai sus |
| Lab/Boss | Construiește cele 5 lab/boss pentru C2+C3 (simulatoare noi) | 3–5 prompturi |
| Lab/Boss | Scrie cele 9 lab/boss Pyodide pentru C4–C6 | 3 prompturi |
| Conținut / DB | **`module_index` vechi în frontmatter la C2–C6** (91 de fișiere; `sync-content.mjs --all --dry-run` le arată; corpul, titlul, tipul sunt identice cu DB). Fie se corectează frontmatter-ul după DB, fie DB după curriculum — de decis înainte de a rula sync pe aceste cursuri. | 1 prompt mic |
| Securitate | Gate-ul de Complete pe lab/boss e doar în UI (ca gate-ul de citire / întrebări inline): un client care apelează direct acțiunea serverului poate completa fără joc. Fix dacă devine o problemă: înregistrare server-side a rezultatului jocului. | opțional |
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
| 2026-10-09 | P2 | 4 fișiere moarte șterse; `.agents/` + skill React Native eliminate (rămâne `.claude/skills/`); `CLAUDE.md` + `PROJECT-STATE.md` la 13 cursuri/245 lecții + priorități noi; `DEPLOY-PLAN.md` arhivat; `COURSE_PALETTE`/`TOTAL_COURSES`/`COURSE_GEOMETRY`/banner+descriere `pytorch-core` pentru 13 cursuri; `@ai-sdk/openai` dezinstalat. Singura schimbare vizibilă: a 13-a bulină (corai) în hero-ul `/courses`. | tsc 0 · lint 0 err (2 warn) · build ✅ (copie izolată) |
| 2026-10-09 | P2b | Aprobat și executat: 8 fișiere moarte șterse (sidebar, course-card, sign-out-button, progress-ring, ui/{progress,separator,badge,button}) + 3 pachete Radix neutilizate dezinstalate; `PROGRESS.md` (108→~11 KB) și `CHANGELOG.md` (214 KB) arhivate cu stub, tăietura 2026-10-09; 2 rânduri 🔴 adăugate în BACKLOG (Stripe `planType`, rate limiting AI); `COURSE_DIFFICULTY` hardcodat înlocuit cu `courses.difficulty` din DB (afișajul dificultății se schimbă pe World Gate la pozițiile greșite); `CLAUDE.md`: serverul `mcp__supabase__*` e legat de proiectul VECHI (verificat). | tsc 0 · lint 0 err (2 warn) · build ✅ (copie izolată) |
| 2026-10-09 | P3 | 5 lecții lab/boss create (`l08/l10/l16/l23/l29`, 126–170 cuvinte fiecare, fără headinguri-șablon) și inserate în DB prin SQL aprobat (nu prin `sync-content.mjs`, care nu setează `is_published`/`module_index`): C1 = 30 lecții, 136 publicate, 231 rânduri; cele 25 existente neatinse. Verificat: 5 jocuri jucate fără erori (în afară de hidratarea `RAMGridGame`), serpentina 30 noduri (8/23 Code2, 16/29 Trophy; poz. 10 = checkpoint Network), 0 suprapuneri, 0 scroll orizontal. Descoperit: boșii 16 și 29 nefolosibili pe mobil, hidratare RAMGrid, iconița de checkpoint peste lab (poz. 10), bold invizibil în light mode, geometria desktop a C2–C6 se mută cu până la 47px orizontal, XP/Complete/quiz AI nelegate de joc. | tsc 0 · lint 0 err (2 warn) · build ✅ (copie izolată) |
| 2026-10-09 | P4 | `RAMGridGame`: hidratare reparată (`<style dangerouslySetInnerHTML>`). Nou: `GameFrame` + `use-fullscreen` (breakout până la 1200px, fullscreen nativ → Popover top-layer → fixed, lock landscape pe telefon), aplicat tuturor celor 5 jocuri via `withGameFrame`; BinaryTranslator refăcut pe același mecanism. Vault: scală 0,53→0,97 desktop, etichete 4,8→11,6px; telefon landscape fullscreen 1,08. CPU: tablă vizibilă 42%→100% (landscape fullscreen). Fonturi <9px aduse la 9px (CPU, RAM) și etichete circuit 9→12u. `course-map.ts`: tipul bate poziția (poz. 10 = Code2), boss = checkpoint mare cu Trophy, lecția 30 fără Trophy, `moduleIndex` numără checkpoint-urile. Bold lizibil în light (1,17:1 → 12,85:1). Bold readăugat în cele 5 `.mdx` (DB neatins → de sincronizat). 4 configurații × 5 jocuri, 0 erori. Cost: +1.139px înălțime hartă desktop. | tsc 0 · lint 0 err (2 warn) · build ✅ (copie izolată) |
| 2026-10-10 | P4b + P5 | **DB:** UPDATE aprobat executat (tranzacție cu gărzi + post-verificări): cele 5 `content_md` = fișierele (md5 verificat), celelalte 25 neatinse (`4c4b9109…` înainte = după). **Hartă:** `resolveCheckpoints` (boss > ultima lecție > a 5-a) — nu mai există două noduri mari adiacente în niciunul din cele 13 cursuri (și C4 25/26, C5 15/16, C6 20/21 rezolvate); lecția 30 se agață de modulul boss-ului 29 (fără modul orfan; `moduleIndex` corect); înălțime desktop 11.040 → **9.837 px** (container QA 1068px; pre-P4 era 10.506); 0 suprapuneri, 0 coliziuni cu porțile, 0 scroll orizontal la 1440 și 390, light + dark; poziții rotunjite la 0,01 (elimină un mismatch de hidratare Node↔Chrome pe date complete). **Complete:** contract `onComplete` (`game-contract.ts`) injectat din `withGameFrame`; 5 subagenți, fiecare doar prop + ref + un efect pe starea de victorie proprie (TransistorLab: "MISIUNE COMPLETĂ" la ≥3,5 V; BinaryTranslator: `victory` după nivelul 3; RAMGrid: `victory` după "Memory Dump"; Alarma de Seif: `all-waves-solved`; CPU: `victory` = CPU ONLINE). **XP:** 15/25/50 din tipul rândului DB. **Quiz AI** suprimat pe lab/boss. **`sync-content.mjs`**: `is_published` + `module_index`, diff înainte de scriere, `--dry-run`/`--all`, refuză proiectul vechi; frontmatter `module_index` corectat în 20 de fișiere C1 (valorile DB); dry-run C1 = 30/30 neschimbat. **Verificat** cu utilizator de test temporar (creat + șters, 0 rânduri rămase): fiecare joc jucat până la victorie, Complete blocat la fiecare pas intermediar și deblocat exact la victorie; `xp_events` 25/25/50/25/50 și 15 pe lecția obișnuită; fără secțiune quiz AI pe lab/boss, quiz AI prezent pe lecția obișnuită. | tsc 0 · lint 0 err (2 warn) · build ✅ (copie izolată) |
