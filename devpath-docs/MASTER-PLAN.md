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

## ▶️ DIRECȚIA CURENTĂ (decisă de owner, 2026-10-10 seara) — citește ÎNAINTE de orice altceva

**Faza 0 e încheiată (P1–P9). Lecția 7 din `hardware-fizica` este MODELUL.** De acum, singurul lucru la conținut este:
**rollout în loturi atomice de 2–3 lecții, în ordine, începând cu Cursul 1, lecția 1**, aplicând `devpath-docs/LESSON-STANDARD.md` + `scripts/validate-questions.mjs` ca poartă (aceeași calitate ca L7: headinguri reale, termeni `<Term>`, 3 întrebări D2/D3, `<Sub>`, diagrame/tabele fără placeholdere, erorile factuale corectate și raportate).
Orice alt punct din „UNDE AM RĂMAS” / „BACKLOG” (python-editor rulabil, C2/C3 labs, dashboard, rate limiting, Stripe…) **NU se începe** până nu spune owner-ul. Ordinea din roadmap veche NU mai contează.

- **Cadență curentă (override owner, 2026-10-11): LOTURI DE 5 LECȚII** (era 2; regula despre tipurile de întrebări alese pe concept e în `CLAUDE.md`), în sesiunea Claude Code, cu „go” al owner-ului între loturi (regula e în `CLAUDE.md`, „Workflow conversie lecții — rollout fără arhitect”) — suprascrie „lot de 3”. Permisiune permanentă (doar pentru acest workflow): commit + `sync-content` real (după `--dry-run`) + tranzacția din `questions-to-sql` via Supabase MCP pe `zgofeajewktwmswckgup`. `git push` = în loturi, la cererea owner-ului (~8–10 lecții), **cu excepția** unei lecții care cere o componentă MDX nouă (push imediat; niciun conținut sincronizat nu referă o componentă absentă de pe `origin/main`). Fără `<WowNote>`. Fără limită de timp. Rollout-ul C1 e **terminat** (L30 a fost ultima); următorul pas îl alege owner-ul (vezi „UNDE AM RĂMAS”).
- Lot = 3 lecții (Claude Pro) · scriitori paraleli (1/lecție) + 1 recenzor independent (obligatoriu primele 3 loturi, apoi ~25%) · nicio scriere în DB până nu trece validatorul pe tot lotul · un singur SQL/sync arătat owner-ului · Claude Code comite, NU face push.
- Lab/boss din C1 (poz. 8, 10, 16, 23, 29) se sar — sunt gata. L7 e gata.
- Ordinea loturilor C1 (pozițiile se verifică în DB înainte de fiecare lot): L1–3 · L4–6 · L9, L11, L12 · L13–15 · L17–19 · L20–22 · L24–26 · L27, L28, L30. După C1 → C2 → … → C6, același ritm.
- La integrarea lui L21–L23 se folosește `devpath-docs/archive/l07-memory-section-for-c1-l21-23.md` (vezi backlog C1).

### Urmărire loturi — Cursul 1

| Lot | Lecții (poz.) | Stare |
|---|---|---|
| C1-A | 1, 2, 3 | L1 ✅ (sincronizat 2026-10-11, pushed) · L2 ✅ · L3 ✅ (sincronizate 2026-10-11; așteaptă „go” de la owner) |
| C1-B | 4, 5, 6 | L4 ✅ · L5 ✅ · L6 ✅ (sincronizate 2026-10-11; așteaptă „go”) |
| C1-C | 9, 11, 12 | L9 ✅ · L11 ✅ · L12 ✅ (sincronizate 2026-10-11) |
| C1-D | 13, 14, 15 | L13 ✅ · L14 ✅ · L15 ✅ (sincronizate 2026-10-11) |
| C1-E | 17, 18, 19 | L17 ✅ · L18 ✅ · L19 ✅ (sincronizate 2026-10-11) |
| C1-F | 20, 21, 22 | L20 ✅ · L21 ✅ · L22 ✅ (sincronizate 2026-10-11; așteaptă „go”) |
| C1-G | 24, 25, 26 | L24 ✅ · L25 ✅ · L26 ✅ (sincronizate 2026-10-11; așteaptă „go”) |
| C1-H | 27, 28, 30 | L27 ✅ · L28 ✅ · L30 ✅ (sincronizate 2026-10-11) |

---

## ⏸️ UNDE AM RĂMAS — citește asta primul (2026-10-11, după C1 — toate cele 25 de lecții convertite)

**Actualizare 2026-10-13 (finalizare C1 — jocuri):** layout (cadrul jocului se oprește la 1000px, în afara șinelor decorative ≥1360px), contrast AA în ambele teme (cauza: `.prose` suprascria culorile jocurilor → `not-prose` pe `GameFrame` + lifturi de culoare), L16 unda 3 nu mai pornește rezolvată (poarta de sus NAND → multiplexor), L8 refăcut pe modelul MOSFET (G/D/S, V<sub>GS</sub>), L5 fără `<ADCSimulator />`, L29 header fără overflow pe telefon; detaliile și cifrele înainte/după în `PROGRESS.md`. **Conținutul (L5, L8) e sincronizat în DB și live; codul jocurilor NU e live până la `git push`** (commit `2fe5183`, împreună cu 3 commit-uri QA nepushate). **Întrebările L7 (Q2, `<Sub>`) sunt sincronizate în DB (2026-10-13, după push), prin UPDATE pe loc** — `questions-to-sql.mjs` nu merge pe o lecție care are deja întrebări.

**Actualizare 2026-10-11 (QA aprofundat C1, înainte de C2):** două defecte **live** găsite și reparate — **L6** (`</sub>` cu literă mică) și **L18** (`A<B` gol) nu compilau în MDX și se afișau ca text brut; reparate și resincronizate. Adăugat `scripts/check-mdx-compile.mjs` (validatorul nu compilează MDX), pus în `LESSON-STANDARD.md` §7 și în procedura din `CLAUDE.md`. Toate cele 75 de întrebări verificate (DB = fișiere, răspunsuri corecte, răspunse corect prin UI-ul real), cele 5 jocuri/boss jucate până la capăt, toate cele 30 de lecții randate la 1280 și 375 px fără erori de consolă. Toate SUSPECTED/TENSION din C1 rezolvate (corectate, nuanțate sau confirmate); 5 întrebări curățate de backtick-uri. **Nerezolvat / pentru owner:** (1) verificarea pe pagina reală autentificată (cere un cont de test sau permisiunea unui utilizator temporar); (2) `<ADCSimulator />` din L5 (stub vizibil + paragraful care trimite la el); (3) jocul L8 e un BJT (`2N2222`, „base”) deși L7 predă MOSFET-ul; L16 unda 3 pornește deja deschisă; L29 doar drag-and-drop; (4) trei lecții din `retele-internet` (c3-l2, c3-l5, c3-l15) nu compilează la prima încercare (reparate de sanitizer la runtime) — de reparat în trecerea C3; (5) `git push` (2–3 commit-uri locale: reparațiile QA + `check-mdx-compile.mjs` + documente; reparațiile de conținut sunt deja live prin sincronizare). Detalii: `PROGRESS.md`, ultima intrare. **Nu începe C2** până la „go”.

**Actualizare 2026-10-11 (L30 — rollout-ul Cursului 1 încheiat):** **L30** e convertită (−15,1% densitate, validator 0/0, 6 termeni, întrebări fill_blank/true_false/single_choice), **sincronizată în DB și live**. Toate cele 25 de lecții `lesson` din `hardware-fizica` sunt acum convertite la standardul L7, sincronizate și cu câte 3 întrebări; cele 5 lab/boss (L8, L10, L16, L23, L29) erau gata. Tipuri de întrebări pe curs (număr exact din fișierele `.questions.json`, 75): single_choice 19, short_answer 16, true_false 13, match_pairs 12, ordering 9, fill_blank 6. Nicio componentă nouă. **Nimic pushat de la `f98f024`**: 8 commit-uri locale (L18–L22, L24–L28, L30 + documentele lor). Decizii pentru owner: (1) `git push`; (2) stub-ul `<ADCSimulator />` din L5 (construit sau șters); (3) diagramele propuse în `PROGRESS.md` (fiecare cere o componentă SVG, deci push înainte de sync); (4) ce curs urmează (C2 …) — fără cerere explicită nu se începe nimic.

**Actualizare 2026-10-11 (al patrulea lot de 5):** **L24, L25, L26, L27, L28** sunt convertite (−14,7…−16,4% densitate, validator 0/0), **sincronizate în DB și live** (`estimated_minutes` 11/10/7/7/9), cu 3 întrebări fiecare (tipuri: L24 true_false/single_choice/match_pairs · L25 match_pairs/ordering/single_choice · L26 short_answer/fill_blank/single_choice · L27 true_false/single_choice/ordering · L28 short_answer/match_pairs/true_false). Peste 50 de erori factuale corectate și raportate în `PROGRESS.md` (de ex. L24 „187 de ani” era 174; L25 degradarea procesoarelor Intel a fost identificată în 2024 și un patch de microcod nu repară siliciul deja uzat; L27 EDSAC avea ~3.000 de tuburi și 11–12 kW, nu 550 și 3,5 kW; L28 brevetul ENIAC a fost invalidat în 1973 pe motiv că ideea derivă din Atanasoff, nu pentru că Von Neumann i-ar fi omis pe Eckert și Mauchly). Secțiunile din L24, L26 și L28 au fost **reordonate** ca ancorele să cadă în ferestre. Nicio componentă nouă; nimic pushat. **Următorul lot: C1 L30** (un singur lucru rămas din C1 după asta), după „go”.

**Actualizare 2026-10-11 (al treilea lot de 5):** **L18, L19, L20, L21, L22** sunt convertite (−15,6…−19,3% densitate, validator 0/0), **sincronizate în DB și live** (`estimated_minutes` 8/9/11/10/11), cu 3 întrebări fiecare (tipuri: L18 match_pairs/short_answer/true_false · L19 fill_blank/short_answer/ordering · L20 short_answer/match_pairs/true_false · L21 match_pairs/short_answer/single_choice · L22 fill_blank/ordering/single_choice). Peste 60 de erori factuale corectate și raportate în `PROGRESS.md` (de ex. L18 un lanț de Half-Adder-e dă 254, nu 0; L19 MDM de pe ISS era unitatea de rezervă, nu un multiplexor, iar fișele IBM 360 au microcod capacitiv, nu o matrice de MUX-uri; L20 recordul de 9,2 GHz s-a făcut cu heliu lichid; L21 studiul Google privește DRAM și erorile repetitive, nu raze cosmice; L22 Zenbleed lasă date vechi în fișierul fizic de registre). În L18 secțiunea de scădere/comparație a fost **mutată** înaintea zidului de viteză, iar în L19 secțiunea „MUX e universal” imediat după definiție, ca ancorele să cadă în ferestre. Nicio componentă nouă; nimic pushat. **Următorul lot: C1 L24, L25, L26, L27, L28**, după „go”.

**Actualizare 2026-10-11 (al doilea lot de 5):** **L12, L13, L14, L15, L17** sunt convertite (−15,0…−20,0% densitate, validator 0/0), **sincronizate în DB și live**, cu 3 întrebări fiecare (tipuri: L12 true_false/short_answer/match_pairs · L13 single_choice/fill_blank/true_false · L14 true_false/short_answer/ordering · L15 short_answer/match_pairs/single_choice · L17 short_answer/single_choice/true_false; fill_blank apare acum în 2 lecții, ordering în 5). Peste 40 de erori factuale corectate și raportate în `PROGRESS.md` (de ex. L12 cheile de lansare la 12 picioare, nu 8, iar azi rămân fizice; L13 naveta avea 4+1 computere, nu vot 3-din-5; L14 Vernam ≠ OTP (Mauborgne a adăugat cheia aleatoare); L15 efortul logic e de la Sutherland și Sproull, nu de la Stanford; L17 Pentium FDIV: eroare de la a 4-a zecimală, nu a 14-a). În L13 și L14 secțiunile au fost **reordonate** ca ancorele întrebărilor să cadă în ferestrele standardului. Nicio componentă nouă; nimic pushat de componente. **Următorul lot: C1 L18, L19, L20, L21, L22** (L21–L22 folosesc și `devpath-docs/archive/l07-memory-section-for-c1-l21-23.md`, vezi backlog), după „go”.

**Actualizare 2026-10-11 (lotul de 5):** lotul a crescut de la 2 la 5 lecții, iar tipul fiecărei întrebări se alege acum pe concept (regula e în `CLAUDE.md`; avertismentul `D2-SLOT` din validator a fost retras). **L4, L5, L6, L9, L11** sunt convertite (−15,0…−18,3% densitate, validator 0/0), **sincronizate în DB și live**, cu 3 întrebări fiecare (tipuri: L4 true_false/single_choice/short_answer · L5 single_choice/short_answer/ordering · L6 match_pairs/fill_blank/single_choice · L9 short_answer/match_pairs/true_false · L11 ordering/true_false/single_choice). Peste 50 de erori factuale corectate și raportate în `PROGRESS.md` (de ex. L11 „sub-picosecunde” → 3–4 ps, L9 „genomul încape pe un CD” → 800 MB vs 700 MB, L5 cablurile transatlantice erau telegrafice). L5 păstrează stub-ul `<ADCSimulator />` („🚧 în curând”) — de decis: construit sau șters. L1–L3 și L7 au tipuri de întrebări dinaintea regulii (L1 și L7 au același tipar single_choice/match_pairs/short_answer) și **nu au fost schimbate**. **Următorul lot: C1 L12, L13, L14, L15, L17**, după „go”.

**Actualizare 2026-10-11:** `origin/main` conține acum P8, P9 și L1 (L7 se randa defect live — conținutul folosea `<MosfetDiagram>`/`<Sub>` nepushate). **L1** corectată (13 `<WowNote>` scoase; „3 nm = dimensiune fizică” corectat: nume comercial, pas de poartă ~45 nm), sincronizată + 3 întrebări seed. **L2 (Ce este electricitatea?)** și **L3 (Circuitul închis)** convertite (−15,1% / −15,9% densitate, 8 / 9 termeni, validator 0/0), **sincronizate în DB și live**; erori factuale corectate și raportate în `PROGRESS.md` (L2: unghii, <1 ns, trilioane, 26 de ani, curentul descărcării statice; L3: borna negativă, LED la 1,5 V, Morse 61 km). Nepushate: commit-urile cu regulile din `CLAUDE.md` și L2+L3 (nicio componentă nouă). **Următorul lot: C1 L4 + L5**, după „go”.

**Actualizare C1 L1 (2026-10-10):** **L1 (`hardware-fizica`, „Cum funcționează ecranul telefonului tău?”) e convertită** după modelul L7 — 1.444 → 1.219 cuvinte (−15,6% densitate), 9 termeni, 1 bold, 3 întrebări (35% / 47% / 58%), validator 0 erori / 0 review; 11 erori factuale corectate și raportate (vezi `PROGRESS.md`). **Doar fișiere** (`.mdx` + `.questions.json`): DB neatins — `sync-content` și seed-ul întrebărilor se arată owner-ului separat. **Următoarea: C1 L2**, abia după „go” de la owner (o lecție pe rând).

**Actualizare P9 (2026-10-10):** **L7 e terminată ca lecție-pilot** — fără placeholdere: 3 cadre `<MosfetDiagram>` (structură · fără canal după Faza 1 · canal după paragraful stratului de inversie), tabelul regiunilor cu ecuațiile I<sub>DS</sub>, tabelul „Legea lui Moore” (5 rânduri, fiecare verificat pe surse), iar placeholderul de evoluție a arhitecturii a fost șters. Regula „un placeholder nu se livrează” e în validator (`PLACEHOLDER`, eroare) și în `LESSON-STANDARD.md` §6a; tabelele noi sunt „conținut adăugat”, ieșit din banda de densitate. Parcurs pilot: P7/P7b (trigger `<Term>`, bold, termeni), P8 (defecte de platformă), P9 (diagrame + tabele). Decizia următoare e tot a lui Bogdan: ultima privire pe L7 pe live, apoi rollout-ul.

**Git:** `origin/main` e la P7b (`7b9d435`); **nepushate local:** P8 (`0766222`) și P9 (ultimul). Push-ul îl dă owner-ul manual.

**DB live:** 13 cursuri; Cursul 1 are 30 de lecții publicate. **Lecția 7 (`hardware-fizica`, „Tranzistorul…")** e acum lecția pilot: `content_md` rescris (md5 verificat = fișierul, 12.804 caractere față de 14.353; celelalte 29 de lecții neatinse, md5 identic) + **3 rânduri în `inline_questions`** (prima intrare din acest tabel; citirea RLS verificată: utilizator autentificat vede 3 rânduri, anonim 0). Singurele scrieri în DB din P6: UPDATE-ul `content_md` al L7 (prin `sync-content.mjs`) și seed-ul de întrebări (tranzacție cu gărzi + post-verificări).

**Faza 0:** P1–P9 ✅. De aici lucrul e **condus de Bogdan, pagină cu pagină**. Ce are de decis acum:
1. **Pilotul** — citește L7 pe live (după push), apoi aprobă / cere schimbări în `devpath-docs/LESSON-STANDARD.md`. Standardul e documentul pe care subagenții îl vor aplica celorlalte 130 de lecții; regula nouă din el: **o eroare factuală găsită la conversie se corectează și se raportează, niciodată nu se păstrează**.
2. **`python-editor` rulabil pe baza blocului** (azi e read-only pe lecție/lab/boss; blochează D4 și cele 9 laburi Pyodide din C4–C6). Raportul de dimensionare e în `PROGRESS.md` (P6): ~3 prompturi mici (rulabil per bloc · lab cu verificări + `onComplete` · robustețe/mobil). De programat înainte de rollout-ul de conținut la C4–C6.
3. **Rollout de conținut** (1 prompt/curs, subagenți în paralel cu `LESSON-STANDARD.md` + `validate-questions.mjs` ca poartă), în ordinea aleasă de Bogdan.

**Ce s-a construit în P6:** componenta `<Term>` (definiții la click, `components/interactive/term.tsx`, înregistrată lângă `InlineQuestion`/`WowNote`), `scripts/validate-questions.mjs` (D2/D3 + structură lecție), `scripts/questions-to-sql.mjs` (SQL cu gărzi, fără conectare), `devpath-docs/LESSON-STANDARD.md`, lecția L7 finalizată (1.745 cuvinte, −15,0% față de 2.054; 5 termeni; 3 întrebări la 23% / 47% / 58%). Recenzia independentă (agent separat) e raportată integral în `PROGRESS.md`.

**Rămas deschis (de decis):** vezi „BACKLOG CUNOSCUT” — în special erorile/tensiunile factuale rămase în L7, bugul de light mode la capul de tabel, cele 91 de fișiere C2–C6 cu `module_index` vechi, gate-ul Complete doar în UI, și cele 2 rânduri 🔴 (Stripe `planType`, rate limiting AI) care rămân **blocking-for-marketing**.

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
- [x] **P6 · Lecția pilot** ✅ 2026-10-10 — `<Term>` + `validate-questions.mjs` + `questions-to-sql.mjs` + `LESSON-STANDARD.md`, aplicat pe `hardware-fizica` L7 (1.745 cuvinte, −15,0%; 5 termeni; 3 întrebări; recenzie independentă; erori factuale corectate). L7 și întrebările sunt live în DB; verificat cu un utilizator temporar (șters), inclusiv citirea RLS a lui `inline_questions`. `python-editor` rulabil per bloc = prompt separat (vezi „UNDE AM RĂMAS”).

- [x] **P9 · Diagrame și tabele în L7** ✅ 2026-10-10 — 4 placeholdere rezolvate: `<MosfetDiagram frame="structure|off|channel">` (SVG static, token-uri Aurora, contrast ≥ 13,5:1 în ambele teme, text ≥ 12,45 px la 390, `role=img` + `<title>`/`<desc>` în română, `<figcaption>`), tabelul ecuațiilor I<sub>DS</sub>, tabelul cipurilor (Intel 4004 → Apple M4, cifre verificate), placeholderul arhitecturii șters; validator: eroare `PLACEHOLDER`, tabelele noi nu mai intră în banda de densitate; `LESSON-STANDARD.md` §6a.
- [x] **P8 · Defecte de platformă găsite la citirea lui L7** ✅ 2026-10-10 — antet de tabel lizibil în light (Aurora tokens; 12,0:1), timp de citire real (autorat → `estimated_minutes`, altfel ~160 wpm pe proză; L7 = 12 min, era 20), fără quiz AI pe lecțiile cu întrebări curate, motivul blocării „Marchează completat” ca text vizibil, `<Sub>` pentru indici (V<sub>GS</sub>). Reguli în `LESSON-STANDARD.md` §4d / §7 / §9.
- [x] **P7b · Corecții de trigger/termeni** ✅ 2026-10-10 — tenta `<Term>` în light 6% → 14% (măsurat: ΔE 4,5 → 11,3; dark rămâne 8%, ΔE 9,4), termenul „tip P” fără prepoziție, perechea minoritari/majoritari acoperită de card; 3 reguli noi în standard (§4b, §4c). 
- [x] **P7 · Revizuirea pilotului** ✅ 2026-10-10 — 5 schimbări cerute de owner după citirea lui L7: trigger `<Term>` vizibil (2px, tentă, punct), buget de bold (41 → 13), 9 termeni prin mutarea glosărilor din proză în carduri, secțiunea de memorie arhivată (tăietură structurală), Q3 mutată după FactBox-ul Gelsinger + hook-ul verificat. Regulile intră în `LESSON-STANDARD.md` (§3, §3a, §4, §4a, §4b); validatorul numără separat tăietura de densitate și cea structurală.

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
| Cod / D4 | **`python-editor` rulabil pe baza blocului, nu a tipului de lecție** — azi e read-only pe `lesson`/`lab`/`boss` (Run doar pe `exercise`/`project`). Blochează D4 și cele 9 laburi Pyodide din C4–C6. Dimensionare (raport în `PROGRESS.md`, P6): (1) bloc rulabil prin tag de fence `python-editor-run` + namespace izolat per rulare + stdout păstrat la eroare · (2) lab cu verificări ascunse → `onComplete` (contractul din P5 + XP lab 25/boss 50 funcționează deja) · (3) robustețe: preîncărcare Pyodide, UX pe telefon, cost Monaco ×N blocuri. | ~3 prompturi mici |
| Conținut L7 | **Tensiune rămasă în L7** (lăsată intenționat): „zero consum static” vs paragraful despre scurgerea sub-prag și tunelarea prin oxid de ~1 nm — contradicție internă. (Hook-ul cu „de o sută de ori” a fost rezolvat în P7: „amplificat de ordinul a o sută de ori”, fără a numi mărimea — sursele nu spun dacă e tensiune, curent sau putere.) | decide owner |
| Conținut C1 | **Secțiunea de memorie scoasă din L7 (DRAM, Robert Dennard, 1T1C, SRAM, paradoxul scalării SRAM, CosmoHint flash)** — arhivată verbatim în `devpath-docs/archive/l07-memory-section-for-c1-l21-23.md`, de integrat în **L21 Flip-Flop / L22 Registrele / L23 Grila memoriei RAM** (nicio lecție C1 nu presupune că L7 a predat DRAM/1T1C/cache — verificat în P7; L21/L22/L15/L11 își introduc singure SRAM/cache). La integrare: reverifică cifrele, readaugă cardul „cache-ul” și reamintește „tunelare cuantică” (CosmoHint-ul o folosește). | 1 prompt mic |
| UI | **Light mode: textul capului de tabel e aproape alb pe fundal deschis** (`[&_th]:text-[#E2DDFF]` în `lesson-content.tsx`) — aproape ilizibil la orice tabel din lecții. Descoperit în P6, neatins. | 1 prompt mic |
| Întrebări / UI | **Indici în textul întrebărilor** — `inline_questions.content` e text simplu, deci Q2 din L7 arată „V_GS sub V_th” cu underscore (restul lecției folosește `<Sub>`). Fix: un mic randare pentru `_{…}`/`<Sub>` în prompt/opțiuni (sau cifre Unicode), apoi re-seed al lui L7 (atenție: re-seed-ul șterge încercările — vezi `questions-to-sql`). Nu s-a atins conținutul întrebărilor în P8. | 1 prompt mic |
| Conținut | **`duration` din frontmatter e un placeholder în toate cele 136 de fișiere** (mai ales 12; 1,1–1,9× timpul real de citire). `sync-content` îl scrie în `estimated_minutes` doar pentru lecțiile convertite (cu `.questions.json`); la conversie, agentul îl setează din linia `reading time` a validatorului. Lecțiile neconvertite au timpul calculat. | inclus în rollout |
| Întrebări | Corectul unei întrebări (`correct_index` etc.) ajunge în browser odată cu pagina (serverul notează, dar payload-ul e lizibil); iar `normalizeText` (`inline-scoring.ts`) elimină diacritice/majuscule/spații multiple dar NU punctuația — la `short_answer` trebuie listate toate variantele. Cunoscut, documentat în `LESSON-STANDARD.md`; fix opțional (normalizator mai larg / tip numeric). | opțional |
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
| 2026-10-10 | P6 | **Construit:** `<Term>` (click/tap/Enter/Space deschide, click în afară/Esc închide, un card la un moment dat, portal în `<body>` → nu e tăiat de tabele, fără mismatch de hidratare; refolosește stilul „term” din WowNote), `scripts/validate-questions.mjs` (D2/D3 + ancore/termeni/titluri/ritm + banda de tăiere 15–20% cu `--baseline`), `scripts/questions-to-sql.mjs`, `devpath-docs/LESSON-STANDARD.md`. **L7:** 2.054 → 1.745 cuvinte (−15,0%), 8 titluri reale, 5 termeni (nodurile, electronii minoritari, funcția de lucru, factorul de activitate, cache-ul), 3 întrebări la 23/47/58% (single_choice · match_pairs · short_answer); validatorul trece fără erori. **Recenzie independentă** (agent separat) → Q1/Q2/Q3 rescrise, 3 din 5 termeni înlocuiți (erau predați în L6), calificative restaurate, 4 titluri refăcute, validator întărit; raportată integral în PROGRESS. **Erori factuale corectate în L7** (regulă nouă în standard: corectează și raportează): 10⁷ cm/s = 360.000 km/h (corp + CosmoHint), „București–Beijing și înapoi” → „mai mult decât distanța”, rând TTL în tabelul V_th → NMOS/CMOS, „electronii masivi” → majoritari, câmp 1 V sub 100 nm → 100.000–1.000.000 V/cm; rămase raportate: tensiunea „zero consum static”, figura de 100× din 1947. **DB (aprobat):** `sync-content` L7 (`content_md`, md5 = fișier, ceilalți 29 neatinși) + seed 3 întrebări (tranzacție cu gărzi). **Verificat** cu utilizator temporar (șters, 0 rânduri rămase): RLS — anonim 0 rânduri, autentificat 3; răspunsuri corecte și greșite la fiecare întrebare → `inline_attempts` (2 încercări, best 100) + `lesson_scores.correct_questions = 3`; Complete rămâne blocat fără răspunsuri chiar după citire; 1440 și 390 × light/dark: 0 erori de consolă, fără scroll orizontal, 5 termeni funcționali. **Investigat (nefixat):** `python-editor` rulabil pe bloc — vezi PROGRESS. | tsc 0 · lint 0 err (2 warn) · build ✅ (copie izolată) |
| 2026-10-10 | P7 | **Trigger `<Term>`** (`term.tsx`): sublinierea punctată 1px/60% → 2px/100% violet, tentă permanentă ~6% (8% în dark), punct-marcaj de ~0,4em după cuvânt; verificat vizual la 1440 în light + dark (nu încarcă). **Bold:** 41 → 13 spans (−68%; −64% pe textul rămas), buget nou ≤ 1/100 cuvinte. **Termeni:** 5 → 9 (adăugați: DIBL, tunelarea cuantică, velocity saturation, de tip P, strat de inversie; *cache-ul* a plecat cu secțiunea arhivată; *1T1C* nu a mai fost adăugat — nu mai apare în L7); headingul „Viteza maximă — velocity saturation” retitlat în română. **Secțiunea de memorie** (195 cuvinte) arhivată verbatim → `devpath-docs/archive/l07-memory-section-for-c1-l21-23.md` + `l07-….cuts.json`; C1 verificat: nicio lecție nu presupune că L7 a predat DRAM/1T1C/cache. **Cifre (validator, vs `49cbe30`):** 2.054 → 1.501 = **−26,9% total = −17,4% densitate + −9,5% structural**. **Q3** mutată imediat după FactBox-ul Gelsinger (22% / 54% / 63%); `inline_questions` nu are coloană de poziție și conținutul nu s-a schimbat → **nicio re-seed**. **Hook:** „amplificat de ordinul a o sută de ori” (relatarea lui Brattain). **DB:** `sync-content` L7 `content_md` (aprobat în prompt; 29 neatinse). **Standard:** §3 (două feluri de tăiere), §3a (buget bold), §4 (6–10 termeni), §4a (glosă inline → card), §4b (vizibilitate). **Validator:** `MDX-BOLD`, `STRUCT-CUT`, densitate vs structural, termeni 6–10. | tsc 0 · lint 0 err · build ✅ (copie izolată) |
| 2026-10-10 | P7b | **Tentă (platformă):** light `bg-[#6C5CE7]/[0.14]` (era 0,06, inversat față de dark 0,08 pe un fundal deja lavandă), hover/open 22% / 30%; dark neschimbat 8% / 16% / 22%. **Măsurat** pe pixeli (mediană chip vs fundal): light 6% = 1,07:1 / ΔE 4,5 → **14% = 1,19:1 / ΔE 11,3** (dark 8% = 1,10:1 / ΔE 9,4); text pe chip 14:1; sublinierea+punctul pe chip 3,6:1 → **fără border** (nu a fost nevoie). **„de tip P” → „tip P”** ("dopat tip P"). **Minoritari/majoritari:** am ales *reformularea*, nu un termen dublu — cardul acoperă ambele jumătăți, propoziția devine „electronii minoritari din substrat și pe cei din Sursă” (cele două populații stau în locuri diferite din propoziție, un termen contiguu ar fi înfășurat jumătate din frază). **Standard:** §4b valori + regula de măsurare, §4c nouă (termenul = conceptul, fără prepoziție/articol în față; perechea contrastantă nu rămâne pe jumătate goală). **Validator:** eroare pentru termen care începe cu prepoziție/articol; avertisment pentru jumătate de pereche rămasă simplă în paragraf. **DB:** `sync-content` L7 (dry-run 1 lecție, apoi 30/30 neschimbate); întrebările neatinse. Verificat 1440 + 390 × light/dark: 9/9 termeni se deschid/închid, 0 suprapuneri, 0 scroll orizontal, 0 erori de consolă. | tsc 0 · lint 0 err · build ✅ (copie izolată) |
| 2026-10-10 | P8 | **1 · Tabele:** antetul era `text-[#E2DDFF]` fix (aproape alb pe lavandă); acum `text-aurora-text-primary` + borduri `aurora-border-medium` + zebra cu variantă light (`white/60`; dark neschimbat) → **contrast antet 12,0:1 light / 12,0:1 dark** (măsurat pe pixeli; înainte ≈ 1,3:1 light); eliminat și un gol de ~2em deasupra/dedesubtul fiecărui tabel (marginile `prose` în interiorul wrapperului). Extra de aceeași clasă (aprobat implicit de „celulele în sine”): `code` inline era `#A78BFA` pe lavandă = **2,0:1** în light → `aurora-primary-700` **5,7:1** (dark neschimbat 6,2:1). **2 · Timp de citire:** nou `src/lib/reading-time.ts` (autorat `estimated_minutes` → altfel proză/160 wpm + 0,5 min/întrebare, fără JSX/atribute/`Term def`/comentarii/cod); `sync-content` scrie `duration` → `estimated_minutes` doar la lecțiile convertite (vezi backlog); **L7: 20 → 12 min** (autorat; calculat ar fi 11), L15 neconvertită 18 → 10, medie pe cele 131 de lecții **20,4 → 11,0 min**; lab/boss/quiz păstrează valorile fixe (badge-ul apare doar la lecții). Validatorul avertizează (`DURATION`) dacă `duration` e departe de estimare. **3 · Quiz AI:** ascuns când lecția are rânduri în `inline_questions` (semnal automat); neconvertitele îl păstrează, lab/boss rămân fără. **4 · Gate Complete:** motivul e text vizibil sub buton (nu tooltip la hover): „Citește lecția până la capăt.” / „Răspunde la cele 3 întrebări din lecție.” (→ „Mai ai de răspuns la 2 din cele 3…” → „…la o întrebare…” live) / „Termină jocul…”; verificat la 390 px pe toate stările. **5 · `<Sub>`:** component `components/mdx/sub.tsx` înregistrat în `mdx-components.tsx`; 12 aplicări în L7 (proză, titlu, antet de tabel); regulă în standard §4d; validatorul numără `V<Sub>GS</Sub>` ca un cuvânt (L7 rămâne 1.501 cuvinte, −26,9%). **DB:** `sync-content` L7 (dry-run: exact 1 lecție, `[content_md, estimated_minutes]`; apoi 30/30 neschimbate); întrebările neatinse. Verificat 3 lecții (L7 convertită, L15 neconvertită cu 5 tabele, L8 lab) × 1440/390 × light/dark: 0 erori de consolă, 0 scroll orizontal. | tsc 0 · lint 0 err · build ✅ (copie izolată) |
| 2026-10-10 | P9 | **Diagrame:** `src/components/mdx/mosfet-diagram.tsx` (static, fără hooks/animație/JS client; viewBox 400 lat, `width:100%` max 480; culori doar prin token-uri Aurora cu variante `dark:`; starea prin formă + text: zonă de dezertare punctată vs bandă de inversie plină, gol ○+ vs electron ●−, „V<sub>GS</sub> < / > V<sub>th</sub>” scris), înregistrat în `mdx-components.tsx`; 3 cadre în L7: `structure` la placeholderul 1, `off` după paragraful Faza 1, `channel` după paragraful stratului de inversie. **Măsurat** (1440 + 390 × light/dark): contrast etichete ≥ 13,5:1, text minim randat 12,45 px la 390 (subindicii au fost 11,6 px → ridicați la 15 unități), 0 etichete tăiate. **Tabele:** ecuațiile (4 coloane, `<Sub>`, nota „k = …”) și cipurile (4 coloane, cronologic, nota „nm = denumire comercială…”); cifrele verificate pe surse: 4004 = 2.300 / 10 µm (Intel), Pentium = 3,1 milioane / 0,8 µm (Wikipedia + 2 surse), M1 = 16 mld / 5 nm, H100 = 80 mld / 4 nm, M4 = 28 mld / 3 nm N3E. Placeholderul 3 șters. **Validator:** `PLACEHOLDER` (eroare), tabelele cu antet nou față de baseline ies din banda de densitate și apar ca „− added”; L7 = −21,9% total = −17,4% densitate + −9,5% structural − 5,0% adăugat; ancorele Q1/Q2/Q3 la 21% / 57% / 66%, în aceleași ferestre. **UI:** padding de celulă mai mic sub `sm` (tabelul cipurilor încape la 390 fără scroll). **DB:** `sync-content` L7 (dry-run: exact 1 lecție, `[content_md]`). | tsc 0 · lint 0 err · build ✅ (copie izolată) |
| 2026-10-10 | C1 L1 | `l01-…mdx` restructurat + `l01-….questions.json` (single_choice · match_pairs · short_answer). 1.444 → 1.219 cuvinte = −15,6% densitate (0 structural, 0 adăugat), 16 → 1 bold, 9 termeni (plasmă, Tranzistorii, backlight, fotoni, condensator, capacitanța, framebuffer, frame drop, EUV), 9 titluri reale, 5 → 3 ancore de întrebări, 13 ancore `<WowNote>` păstrate neschimbate. **11 FIX factuale** (ADN ~2 nm, autobuz nu autoturism, iPhone 15 Pro + A17 Pro, AGC ~40.000 op/s → 27.000×, dark mode 39–47%/3–9%, preț ASML 150–380 M$, …), 9 SUSPECTED, 3 TENSION — toate în `PROGRESS.md`. Validator: 0 erori / 0 review. DB neatins. Regula de workflow „o lecție pe rând” adăugată în `CLAUDE.md`. | tsc 0 · lint 0 err · build ✅ (copie izolată) |
