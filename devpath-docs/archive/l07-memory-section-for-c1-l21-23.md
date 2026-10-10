# Secțiunea de memorie scoasă din L7 — pentru C1 L21–L23

> **Statut:** arhivă, **nu** conținut live. Mutată textual (verbatim) din `content/courses/hardware-fizica/l07-tranzistorul-robinet-electric-controlat-de-tensiune.mdx` pe 2026-10-10 (tăietură **structurală**, nu de densitate — vezi `LESSON-STANDARD.md` §3).
> **De ce a ieșit:** L7 e despre tranzistor; secțiunea e a doua ca lungime din fișier și venea *după* concluzia naturală (limita fizică a siliciului), întârziind finalul cu ~230 de cuvinte.
> **Unde aparține:** în lecțiile de memorie din Cursul 1 — **L21 Flip-Flop** (SRAM = bucla de feedback; celula cu 6 tranzistoare e deja menționată acolo), **L22 Registrele** (ierarhia de latențe L1 / DRAM / SSD) și **L23 Grila memoriei RAM** (jocul). Cel mai natural loc pentru DRAM / 1T1C / Dennard: începutul lui L23 sau o secțiune dedicată în L21–L22.
> **Ce trebuie făcut la mutare:**
> - Termenul `<Term>` pentru **cache-ul** (definiția: „Memorie mică și foarte rapidă, construită chiar în procesor, unde se păstrează ce are nevoie procesorul în clipa următoare.”) a plecat odată cu secțiunea; **1T1C** nu era termen și nu a ajuns termen.
> - Paradoxul SRAM (0,021 µm² la N5 și N3E) cere ca lecția-gazdă să fi introdus deja noțiunea de „nod” (termenul „nodurile” e definit în L7).
> - `<CosmoHint>` de la final folosește „tunelare cuantică”, termen explicat în L7 („Sfârșitul drumului pe siliciu”); în lecția-gazdă trebuie reamintit într-o frază.
> - Cifrele nu au fost reverificate la mutare (aplicați regula „corectează și raportează” din standard).
>
> Textul dintre markerii de mai jos e **identic caracter cu caracter** cu secțiunea din L7 (după tăierea de densitate din P6). `scripts/validate-questions.mjs` numără cuvintele dintre markeri ca tăietură structurală.

<!-- verbatim:start -->
## Memoria care nu se micșorează odată cu logica

MOSFET-ul a revoluționat și memoria. În 1968, **Robert Dennard** la IBM a inventat prima memorie DRAM (Dynamic RAM), radicală: **un singur tranzistor + un condensator** per bit. Tranzistorul deschide calea și electronii umplu condensatorul — bit "1"; tranzistorul se închide și electronii rămân prinși. Fără condensator încărcat — bit "0". RAM-ul din telefon și laptop folosește și astăzi același principiu — celula 1T1C.

Memoria statică (SRAM) din <Term def="Memorie mică și foarte rapidă, construită chiar în procesor, unde se păstrează ce are nevoie procesorul în clipa următoare.">cache-ul</Term> procesorului nu pierde sarcina și nu cere reîmprospătare, dar costă mai mult spațiu: fiecare bit necesită **6 tranzistoare** pentru stabilitate și citire sigură, iar procesoarele moderne dedică **~50% din arie** cache-ului SRAM.

Paradoxul: de la N5 la N3E (5 nm → 3 nm) logica devine cu 20% mai densă, dar celula SRAM rămâne la **0,021 µm²** — identică la ambele noduri. Memoria nu scalează cu logica, așa că procesoarele cresc fizic din cauza cache-ului care nu se micșorează.

<CosmoHint emotion="thinking">
  Memoria flash din telefonul tău stochează biți prin tunelare cuantică.
  Un număr mare de electroni prinși într-o "insulă" izolată = bit "0". Zero electroni = bit "1".
  Electronii rămân închiși ani de zile, fără baterie.
  Același efect care distruge tranzistoarele la 2nm
  e exploatat deliberat pentru stocare în flash.
</CosmoHint>
<!-- verbatim:end -->
