# DevPath RO — Plan final de DEPLOY (handoff pentru Cowork + Claude Code)

> **Sursa de adevăr pentru ultima etapă.** Reparăm/adăugăm ce a rămas → curățenie → commit+push → pașii manuali Vercel → smoke-test pe live.
> Citit de: **Claude (Cowork)** = arhitect care dă prompturi; **Claude Code** = execută. Owner: **Bogdan** (vorbește română; prompturile Claude Code sunt în engleză, în formatul proiectului).
> Data: 2026-10-03 · DB activ: Supabase `zgofeajewktwmswckgup` (Frankfurt) · AI pe **Anthropic/Claude** (`claude-haiku-4-5`) · după deploy, fișierul poate fi arhivat.

---

## Unde suntem
Fazele 1–8 + review-ul owner-ului sunt făcute și verificate (vezi `PROGRESS.md`). Aplicația merge local pe `localhost:3000`. Mai rămâne doar etapa de lansare.

**STATUS TRACKER (în ordine strictă):**
1. ✅ **Prompt 1 (Claude Code)** — fix-uri vizuale. DONE 2026-10-03: BorderBeam root fix (nicio etichetă acoperită — hero, final CTA, card Pro, dashboard) + cifre reale în courses-hero (6 cursuri · 131 lecții · 6 Boss Fights). Gate verde (tsc 0 / lint 0 / build cu lint ON, copie izolată). Rest minor: pill-ul „~60h de conținut" încă hardcodat (real ≈22h la 131 lecții) — de decis înainte de commit.
2. ⏳ **Prompt 2 (Claude Code)** — curățenie fișiere + gate final + commit & push pe GitHub  ← URMĂTORUL
3. ⬜ **MANUAL (Bogdan)** — Vercel + Supabase + Google OAuth (pas cu pas, mai jos)
4. ⬜ **Prompt 3 (Claude Code)** — smoke-test amplu pe URL-ul LIVE + reparat ce iese

## Regula de lucru (toate prompturile)
Un obiectiv per prompt · gate la final: `tsc` 0 · `lint` 0 · `npm run build` cu lint ON · build în **copie izolată**, NU atinge serverul dev de pe :3000 · **Sonnet, efort High** · dacă pică gate-ul, se repară în același prompt. La final, Claude Code actualizează `PROGRESS.md`.

---

## PROMPT 1 (Claude Code) — Fix-uri vizuale finale

```
---START PROMPT---
**CONTEXT**
Final pre-deploy visual fixes. (1) BorderBeam clipping: in current Chrome the beam's clip to the 2px border fails, so the whole gradient square paints over the button label. The hero buttons were already patched per-instance; the FINAL-CTA button and the other BorderBeam usages (`src/components/landing/landing-page.tsx` ~lines 483, 561, 577) and the highlighted pricing card still show a blue square over their text. (2) The courses hero shows a hardcoded "12 cursuri / 12 Boss Fights" (`src/components/course/courses-hero.tsx`, `TOTAL_COURSES = 12`) but only 6 courses have published content — misleading on a CV.

**TASK**
1. Fix the BorderBeam clipping at the ROOT in `src/components/ui/border-beam.tsx` so the beam stays on the border and never covers content, in current Chrome — this fixes ALL usages at once. If the root fix makes the per-instance hero hacks redundant, remove them but keep the hero looking the same.
2. In `src/components/course/courses-hero.tsx`: the "{n} cursuri" and "{n} Boss Fights" stat pills must reflect REAL live content — the count of courses that have ≥1 published lesson (currently 6), not a hardcoded 12. Keep the 12-node roadmap visual as-is (coming-soon courses already marked "În curând" — that's clearly a roadmap). Use real data via props/query.

**TECHNICAL REQUIREMENTS**
- Verify with Playwright screenshots: the hero CTA, the final CTA, and the highlighted pricing card all show their labels fully with a tasteful border beam; the course pills show the real count (6).

**NEW PACKAGES TO INSTALL** — None.

**DO NOT**
- Do NOT change layouts, the other Phase 6/7/8 work, DB schema, or env.

**EXPECTED RESULT**
- No button anywhere has a blue square over its text; the course hero pills show real counts.
- Gate: `npx tsc --noEmit` = 0 · `npm run lint` = 0 · `npm run build` passes with lint ON (isolated copy; don't disturb :3000).
- Update `PROGRESS.md`: BorderBeam root fix, real course counts.
---END PROMPT---
```

---

## PROMPT 2 (Claude Code) — Curățenie + pre-flight + push

```
---START PROMPT---
**CONTEXT**
The repo has ~371 uncommitted changes (all of phases 1–8 + the review fixes). Before deploy: clean stray/obsolete files, run the final gate, then commit + push to GitHub `main` (origin `https://github.com/MareBogdan/devpath-ro.git`) so Vercel can deploy. Personal files must NOT become public.

**TASK**
1. **Cleanup — FIRST print a list, THEN act.** Scan the repo for stray/obsolete files: build artifacts not gitignored, scratch/QA files (e.g. `.qa-screenshots/`, `.playwright-mcp/`, any `*-build*` copies), duplicate or outdated docs, personal files that must never be public (CV PDFs, portfolio PNGs, `edunext-work.png`, LinkedIn banners), `graphify-out/`, `devpath-public/`. Print the proposed action + a one-line reason for each.
   - Remove the clearly-safe junk (build outputs, scratch, QA screenshots, duplicate copies).
   - MOVE questionable-but-maybe-useful docs into `devpath-docs/archive/` instead of deleting.
   - Ensure `.gitignore` covers anything that should never be committed; CONFIRM `.env.local` is gitignored (never commit secrets).
   - Do NOT remove: `CLAUDE.md`, `PROGRESS.md`, `README.md`, `DESIGN-SYSTEM.md`, `devpath-docs/DEPLOY-PLAN.md`, source code, `supabase/migrations/`, `content/`, scripts in use.
   - Refresh the stale `.claude/skills/devpath-ro-patterns/SKILL.md` (still mentions Piston/TTS) to match reality: Pyodide-only in a Web Worker, text AI on Anthropic/Claude, no TTS.
2. **Final gate:** `npx tsc --noEmit` = 0 · `npm run lint` = 0 · `npm run build` passes with lint ON (isolated copy; don't disturb :3000).
3. **Commit + push:** commit all work with clear messages, then `git push origin main`. Confirm the push succeeded and `git status` is clean.

**DO NOT**
- Do NOT force-push; do NOT delete load-bearing files; do NOT commit `.env.local` or any secret.

**EXPECTED RESULT**
- Repo cleaned of junk (or archived), `.gitignore` correct, gate green, ALL work pushed to GitHub `main`, `git status` clean.
- Update `PROGRESS.md`: cleanup done + pushed for deploy.
---END PROMPT---
```

---

## MANUAL (Bogdan) — Vercel + Supabase + Google, PAS CU PAS

Fă-le în ordinea asta. Ai nevoie de cheile din Supabase → **Project Settings → API**.

### A. Supabase (proiectul `devpath-ro`, ref `zgofeajewktwmswckgup`)
1. **Authentication → Sign In / Providers → Email → „Confirm email” = OFF → Save.** (Altfel signup-ul cu email e rupt pe prod.)
2. **Șterge userii de test:** Authentication → Users → caută `pw0930a/b`, `qa1001a/b`, orice `marebogdan+...` de test → Delete. (Sau îi spui lui Claude Code să-i șteargă cu service role.)
3. *(Site URL + redirect le pui la pasul C.6, după ce ai domeniul Vercel.)*

### B. Google Cloud Console (OAuth) — ai nevoie de domeniul Vercel, deci după pasul C
- APIs & Services → Credentials → clientul tău OAuth:
  - **Authorized redirect URIs:** confirmă că există `https://zgofeajewktwmswckgup.supabase.co/auth/v1/callback`.
  - **Authorized JavaScript origins:** adaugă `https://<domeniul-tău>.vercel.app`.

### C. Vercel
1. [vercel.com](https://vercel.com) → **Add New… → Project** → **Import Git Repository** → `MareBogdan/devpath-ro`.
2. Framework: **Next.js** (auto). Node **20+**.
3. **Environment Variables** (bifează Production + Preview) — exact astea, nimic Stripe/Resend/VAPID/CRON:

   | Nume | Valoare |
   |------|---------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://zgofeajewktwmswckgup.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(anon key din Supabase → Settings → API)* |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(service_role key — SECRET)* |
   | `ANTHROPIC_API_KEY` | *(cheia ta Anthropic)* |
   | `NEXT_PUBLIC_SITE_URL` | `https://<domeniul-tău>.vercel.app` |

4. **Deploy.** Aștepți build-ul (~2 min) → primești URL-ul live.
5. Dacă ai pus `NEXT_PUBLIC_SITE_URL` cu domeniul înainte să-l știi, revino și pune domeniul real, apoi **Redeploy** (ca să se aplice).
6. **Întoarce-te la Supabase → Authentication → URL Configuration:**
   - **Site URL** = `https://<domeniul-tău>.vercel.app`
   - **Redirect URLs:** adaugă `https://<domeniul>/auth/callback` și `https://*-<team>.vercel.app/auth/callback` (păstrează și `http://localhost:3000/auth/callback`).
7. Fă pasul **B** (Google) acum, cu domeniul real.

### Checklist manual
- [ ] Confirm email OFF · [ ] useri de test șterși · [ ] proiect Vercel + repo conectat · [ ] cele 5 env vars · [ ] deploy reușit · [ ] Supabase Site URL + redirects · [ ] Google origins/redirect

---

## PROMPT 3 (Claude Code) — Smoke-test amplu pe LIVE

> Înlocuiește `<LIVE_URL>` cu URL-ul de la Vercel.

```
---START PROMPT---
**CONTEXT**
The app is deployed at <LIVE_URL>. Run an EXTENSIVE smoke test against the LIVE URL (not localhost) and report + fix anything broken. Be thorough — the owner wants to know about anything that isn't OK before sharing the link on a CV.

**TASK**
With Playwright against <LIVE_URL>, exercise the full product and report every problem (console errors, 500s, broken UI/redirects, wrong data):
- Landing: loads, real stats, Cosmo looks right, every button label readable.
- Register (email) → with confirm-email OFF lands in onboarding → dashboard.
- Google login end-to-end on prod.
- Dashboard: XP/level/streak, course cards → course map (serpentine) scrolled to first lesson, "Vezi toate cursurile" (top + bottom), all published lessons clickable.
- A lesson: content renders, Python editor runs + infinite-loop timeout + Stop, AI Coach replies via Claude (no sound), the opt-in quiz generates via Claude and caches, Complete → XP/badge/next.
- Profile, /u/[referral] (signed out, no email leak), leaderboard, glossar, pricing, interview, flashcards, roadmap.
- Mobile 375px: landing, dashboard, a lesson — no horizontal scroll.
- 404 page + an error boundary.
- Security spot-check on prod: a non-admin can't PATCH their own role/plan via PostgREST, can't read other users' rows (re-run the key Phase 3 checks against prod).

For a REAL signed-in test on prod you need a session: either the owner logs into the Playwright browser, OR (owner approves) mint a test user via the Admin API against `zgofeajewktwmswckgup` and DELETE it + its rows afterward.

**EXPECTED RESULT**
- A clear, prioritized pass/fail report per area. Fix the quick issues in this same prompt; for bigger ones, propose a focused follow-up prompt.
- No console errors on the main flows; the live app works end-to-end.
- Delete any test user created. Update `PROGRESS.md` with the live smoke-test results.
---END PROMPT---
```

---

## După deploy — cum lucrezi mai departe (la fel de lejer)
Bucla rămâne identică: editezi cu Claude Code local → testezi pe `localhost:3000` → `git push` → Vercel rebuild-uiește automat în ~1–2 min. Griji în plus: testează local înainte de push (prod folosește același Supabase), iar schimbările de DB se fac cu SQL arătat întâi (ca până acum). Găzduirea e gratis (Vercel Hobby + Supabase Free); AI-ul e pay-per-use pe creditele tale (cenți la trafic de demo).
