# DevPath RO — Context Rezumat pentru Conversație Nouă
**Ultima actualizare:** 30 martie 2026

---

## Ce este DevPath RO
Platformă română de învățare AI/IT. Public țintă: 80% non-tehnic (medici, antreprenori, curioși), 20% tehnic. Stack: Next.js 14 App Router, TypeScript strict, Supabase (PostgreSQL + Auth + Realtime), OpenAI GPT-4o-mini, Tailwind CSS, shadcn/ui, framer-motion, Monaco Editor.

---

## Regulile de lucru (IMPORTANT)

**Eu (Bogdan) vorbesc în română. Tu generezi prompturile ÎNTOTDEAUNA în engleză.**

### Format prompt obligatoriu:
```
---START PROMPT---
**CONTEXT** — doar ce e specific taskului
**TASK** — ce trebuie construit
**FILES TO CREATE** — path exact + ce face
**FILES TO MODIFY** — path exact + ce se schimbă
**TECHNICAL REQUIREMENTS** — specific taskului
**NEW PACKAGES TO INSTALL** — sau "None"
**DO NOT** — ce să nu strice
**EXPECTED RESULT** — ce vede utilizatorul
---END PROMPT---
```

### Reguli absolute:
- Claude Code are CLAUDE.md + Supabase MCP + Context7 MCP — NU repeta stack-ul în prompturi
- NU include schema DB în prompturi
- Task-uri mici și precise — un task group per prompt
- `/compact` după fiecare milestone major (vezi TOOLS-AND-MCP-SETUP.md)
- Când primești rezumat scurt: "✅ Înțeles — ce facem acum?"
- Când primești rezumat detaliat: "✅ Context actualizat — spune-mi ce urmează"

---

## Structura fișierelor în devpath-docs/

```
devpath-docs/
├── IMPLEMENTATION-INDEX.md    ← Claude Code citește PRIMUL în orice sesiune
├── TOOLS-AND-MCP-SETUP.md     ← MCPs, skills, compact schedule, prompt template
├── devpath-vision.md          ← viziune, mascotă PIXEL, gamification specs complete
├── devpath-plan-phase0.md     ✅ GATA (30 tasks)
├── devpath-plan-phase1.md     ✅ GATA (34 tasks, 1751 linii)
├── devpath-plan-phase2-3.md   ✅ GATA (2197 linii)
├── devpath-plan-phase4-5.md   ✅ GATA (2148 linii)
├── devpath-plan-phase6-7.md   ✅ GATA (1832 linii)
├── devpath-plan-phase8-9.md   ✅ GATA (2115 linii — cu fix role column)
├── devpath-plan-phase10.md    ✅ GATA (1062 linii)
├── devpath-progress.md        ✅ GATA (master checklist ~279 tasks)
└── phase-refs/
    ├── PHASE0-REF.md          ← compact cheatsheet Phase 0
    ├── PHASE1-REF.md          ← compact cheatsheet Phase 1
    ├── PHASE2-3-REF.md        ← compact cheatsheet Phase 2-3
    ├── PHASE4-5-REF.md        ← compact cheatsheet Phase 4-5
    └── PHASE6-10-REF.md       ← compact cheatsheet Phase 6-10
```

---

## Ce s-a implementat deja în cod

- ✅ Auth complet (email + Google + GitHub OAuth)
- ✅ Dashboard, sistem cursuri, progres tracking
- ✅ 14 lecții MDX reale (15-30 sunt stubs)
- ✅ AI Coach cu streaming
- ✅ F4 Voice AI Coach (Web Speech API + OpenAI TTS vocea "nova")
- ✅ F5 Real-time Social Presence (Supabase Realtime WebSockets)
- ✅ Stripe instalat (verifică package.json — poate fi deja acolo)
- ✅ CLAUDE.md complet
- ✅ Supabase MCP activ
- ✅ Context7 MCP activ
- ❌ next-intl instalat — ELIMINAT în Phase 0 task P0.1.x

---

## Decizii arhitecturale locked in

- **Mascotă: PIXEL** (Option 1 din devpath-vision.md)
- **Română only** — next-intl eliminat complet
- **Mod Simplu / Mod Tehnic** — toggle per lecție, users.learning_mode
- **Phase-refs files** — Claude Code citește PHASE-X-REF.md în loc de planul întreg
- **Monetizare** — Phase 10 (Free/Pro 99lei/Lifetime 599lei)

---

## Pachete noi aprobate / necesită aprobare

| Pachet | Faza | Status |
|---|---|---|
| pyodide@0.27.0 | Phase 4 | ✅ Pre-aprobat |
| @react-pdf/renderer | Phase 5 | ⚠️ Aprobare la P5.4 |
| qrcode | Phase 5 | ⚠️ Aprobare la P5.4 |
| resend | Phase 6 | ⚠️ Aprobare la P6.1 |
| web-push | Phase 6 | ⚠️ Aprobare la P6.2 |
| @react-email/components | Phase 6 | ⚠️ Aprobare la P6.1 |
| stripe@^16.x | Phase 10 | ⚠️ Verifică dacă e deja instalat |

---

## Strategia de implementare

1. **Claude Code citește IMPLEMENTATION-INDEX.md** la start fiecare sesiune
2. **Claude Code citește PHASE-X-REF.md** pentru faza curentă (nu planul întreg)
3. **Claude Code citește secțiunea specifică** din plan doar când implementează acel task
4. **Un task group per prompt** — nu o fază întreagă
5. **`/compact` la milestones** — conform TOOLS-AND-MCP-SETUP.md
6. **devpath-progress.md** — marcat după fiecare task

---

## Estimare costuri rămase

| Faze | Estimare |
|---|---|
| Phase 0-1 | $28-50 |
| Phase 2-3 | $15-25 |
| Phase 4-5 | $25-45 |
| Phase 6-7 | $10-20 |
| Phase 8-9 | $15-30 |
| Phase 10 | $15-25 |
| **Total estimat** | **$108-195 extra** |

Cu phase-refs files + `/compact` regulat → reducere estimată 30-40%.

---

## Mesaj de start pentru conversație nouă

```
Lucrez la DevPath RO — platformă română de învățare AI.
Toate planurile sunt complete (Phase 0-10 + progress.md + phase-refs files).

Suntem gata să începem implementarea.
Faza curentă: [SCRIE FAZA CURENTĂ]
Ultimul task completat: [SCRIE TASK-UL]

Te rog confirmă că înțelegi structura și spune-mi ce urmează.
```
