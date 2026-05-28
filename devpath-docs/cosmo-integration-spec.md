# Cosmo Integration Spec

> Output of Prompt 1.5.1 — exhaustive audit of every Pixel reference + prop-API diff + per-site emotion mapping. Serves as the blueprint for Prompts 1.5.2 (batch-1 swap-in), 1.5.3 (batch-2 swap-in + Pixel deletion), and 1.5.4 (QA + CLAUDE.md refresh).
>
> Audit performed 2026-05-06. Source-of-truth grep: `grep -ri "PixelMascot|pixel-mascot|Pixel" src/` (case-insensitive).

---

## 1. Audit corrections vs. BLOCK2-3 plan

The execution plan listed 16 files. The actual count is **16 files** but the membership differs in two places:

| Plan said | Reality | Action |
|---|---|---|
| `src/components/course/lesson-page-client.tsx` | **False positive** — file has zero `PixelMascot` references | **Remove from list** |
| Not listed | `src/app/api/onboarding/welcome-message/route.ts` — AI system prompt says **"Ești Pixel, mascota prietenoasă a platformei DevPath RO"** | **Add to list** (string update) |

Plus one extra string-only update inside `landing-page.tsx` that the plan didn't explicitly call out: the user-facing line `<p>Pixel te ajută!</p>` (line 343) — must become `Cosmo te ajută!`.

---

## 2. Prop-shape diff: PixelMascot vs CosmoMascot

| Prop | PixelMascot | CosmoMascot | Migration impact |
|---|---|---|---|
| `emotion` | `PixelEmotion` (10 values) — default `"idle"` | `CosmoEmotion` (8 values) — default `"happy"` | **Two emotions retired:** `"proud"` → map to `"celebrating"`. `"idle"` → map to `"happy"`. |
| `size` | `number` — default `80` | `number` — default `200` | Default differs but every call site passes its own size. **No site relies on the default.** |
| `withSparks` | `boolean` — default `false` | **PROP DOES NOT EXIST** | Cosmo's particle overlay is per-emotion (sparks for `excited`, rainbow for `celebrating`, zzz for `sleeping`). Drop the prop; if the call site needs sparks, ensure the chosen emotion is `excited` or `celebrating`. |
| `className` | `string` | `string` | Identical. |
| — | — | `enableIdleAnimations` — default `true` | New, optional. Leave default (`true`) at every site; gives breathing/blink/ear-twitch for free. |
| — | — | `enableInteraction` — default `false` | New, optional. Set `true` only on sites where mouse-gaze tracking adds value (landing hero, dashboard greeter). Skip for toasts and modals — they're transient. |

### Retired-emotion mapping (locked)

| PixelEmotion (retired) | CosmoEmotion replacement | Reasoning |
|---|---|---|
| `"proud"` | `"celebrating"` | Same achievement vibe; Cosmo's celebrating includes rainbow confetti + squint-happy eyes |
| `"idle"` | `"happy"` | Cosmo's `happy` is the natural rest state; `idle` was Pixel's neutral default |

### `withSparks` usages

Three call sites currently pass `withSparks`:
- `pricing/success/page.tsx` — `excited` + `withSparks` → becomes `celebrating` (rainbow particles fit "payment succeeded" better than sparks)
- `minigame-modal.tsx` — `excited` + `withSparks` → becomes `excited` alone (Cosmo's built-in teal sparks)
- `landing-page.tsx` (line 341) — `excited` + `withSparks` → becomes `waving` (hero entrance per plan)

---

## 3. Definitive 16-file list with usage context

Every entry below shows the full JSX call site, the exact line, and the migration plan.

### A. Definition file — to delete

| # | File | What's there | Action |
|---|---|---|---|
| 1 | `src/components/mascot/pixel-mascot.tsx` | The component definition (~382 lines) | **Delete** at the end of Prompt 1.5.3 — only after every importer has been migrated and TypeScript is clean. |

### B. Stateless call sites — Batch 1 (Prompt 1.5.2, 8 files)

These have a single JSX usage with hard-coded props, no state-driven logic. Easiest swap-ins.

| # | File | Current usage | Cosmo replacement |
|---|---|---|---|
| 2 | `src/components/landing/landing-page.tsx` | **Line 341:** `<PixelMascot emotion="excited" size={120} withSparks />` (hero entrance, wrapped in `motion.div` with infinite hover-bob) | `<CosmoMascot emotion="waving" size={120} enableInteraction />` |
| 2 | `src/components/landing/landing-page.tsx` | **Line 527:** `<PixelMascot emotion="happy" size={80} />` (CTA strip) | `<CosmoMascot emotion="happy" size={80} />` |
| 2 | `src/components/landing/landing-page.tsx` | **Line 343 (string):** `<p>Pixel te ajută!</p>` | `<p>Cosmo te ajută!</p>` |
| 3 | `src/components/pricing/pricing-cards.tsx` | `<PixelMascot emotion="excited" size={80} />` | `<CosmoMascot emotion="happy" size={80} />` |
| 4 | `src/app/pricing/success/page.tsx` | `<PixelMascot emotion="excited" size={100} withSparks />` | `<CosmoMascot emotion="celebrating" size={100} />` |
| 5 | `src/app/pricing/cancel/page.tsx` | `<PixelMascot emotion="sad" size={100} />` | `<CosmoMascot emotion="encouraging" size={100} />` |
| 6 | `src/components/onboarding/step-welcome.tsx` | `<PixelMascot emotion="waving" size={120} />` (welcome step) | `<CosmoMascot emotion="waving" size={120} enableInteraction />` |
| 7 | `src/components/minigame/minigame-modal.tsx` | `<PixelMascot emotion="excited" size={90} withSparks />` (unlock screen) | `<CosmoMascot emotion="excited" size={90} />` |
| 8 | `src/components/mascot/mascot-celebration-overlay.tsx` | `<PixelMascot emotion={leveledUp ? "celebrating" : "excited"} size={160} />` | `<CosmoMascot emotion={leveledUp ? "celebrating" : "excited"} size={160} />` (no behavior change — direct emotion match) |
| 9 | `src/components/minigame/minigame-result-screen.tsx` | `<PixelMascot emotion={isPerfect ? "excited" : passed ? "proud" : "thinking"} size={100} />` | `<CosmoMascot emotion={isPerfect ? "celebrating" : passed ? "celebrating" : "encouraging"} size={100} />` |

### C. Stateful + cross-cutting call sites — Batch 2 (Prompt 1.5.3, 7 files + Pixel deletion)

These either are inside conditional rendering, depend on component state, or are cross-cutting (CSS, server route).

| # | File | Current usage | Cosmo replacement |
|---|---|---|---|
| 10 | `src/components/course/ai-coach-chat.tsx` | `<PixelMascot emotion="thinking" size={32} />` rendered only when `isLoading` (line 370) | `<CosmoMascot emotion="thinking" size={32} />` — same gating. State-driven future ("encouraging at rest") is out-of-scope for the swap. |
| 11 | `src/components/course/lesson-gate.tsx` | `<PixelMascot emotion="sad" size={44} />` rendered only when `lastAnswerWrong` (line 172) | `<CosmoMascot emotion="encouraging" size={44} />` — `encouraging` better matches the "Nu-i bai! Citește din nou…" copy than `sad`. Multi-state pass/fail/question variant is out-of-scope here. |
| 12 | `src/components/dashboard/absence-mascot.tsx` | `<PixelMascot emotion="sleeping" size={56} />` (rendered when user has been absent) | `<CosmoMascot emotion="sleeping" size={56} />` — direct map. State-escalation (`sad` >7 days, `waving` on return) deferred to a future feature prompt. |
| 13 | `src/components/gamification/level-up-toast.tsx` | `<PixelMascot emotion="proud" size={56} />` | `<CosmoMascot emotion="celebrating" size={56} />` — `proud` retired; `celebrating` is the level-up vibe. |
| 14 | `src/components/gamification/streak-toast.tsx` | `<PixelMascot emotion="proud" size={56} />` | `<CosmoMascot emotion="excited" size={56} />` — `proud` retired; `excited` better fits the streak-energy tone than `celebrating` (used for level-up). Distinguishes the two toasts visually. |
| 15 | `src/app/globals.css` | **Lines 265–296:** `pixel-mascot-breathe` and `pixel-mascot-blink` keyframes + classes + reduced-motion override | **Delete the entire block.** Cosmo's breathing, blinking, ear-twitch, head-drift are all JS-driven inside the component — no CSS dependency. |
| 16 | `src/app/api/onboarding/welcome-message/route.ts` | **Line 55 (system prompt):** `system: \`Ești Pixel, mascota prietenoasă a platformei DevPath RO.` | Replace `Pixel` with `Cosmo` in the string. The AI-generated welcome text uses the mascot's name; keeping it as "Pixel" would be a Romanian-language continuity bug. |

### D. False positives that came up in the grep

For completeness — these matched the literal "Pixel" or "pixel" string but are NOT mascot references and need no changes:

| File | What it actually is |
|---|---|
| `src/components/mascot/cosmo-mascot.tsx` | Uses `window.devicePixelRatio` (canvas DPR) — not the mascot |
| `src/components/dashboard/three/side-decorations-canvas.tsx` | Uses Three.js `renderer.setPixelRatio()` — not the mascot |
| `src/components/ui/shine-border.tsx` | Comment "Width of the border in pixels" — not the mascot |

---

## 4. Per-site emotion mapping summary (executive table)

| Site | Old (Pixel) | New (Cosmo) | Why |
|---|---|---|---|
| Landing — hero | `excited` + sparks | `waving` + interaction | Hero greets the user; `waving` is more inviting than generic excited |
| Landing — CTA | `happy` | `happy` | Direct map |
| Landing — text | "Pixel te ajută!" | "Cosmo te ajută!" | Name change |
| Pricing cards | `excited` | `happy` | Pricing pages aren't celebratory; warm + inviting fits |
| Pricing success | `excited` + sparks | `celebrating` | Payment success — full rainbow celebration |
| Pricing cancel | `sad` | `encouraging` | "Hai să mai vorbim" tone, not pity |
| Onboarding welcome | `waving` | `waving` + interaction | First impression — gaze-tracking adds delight |
| Minigame modal | `excited` + sparks | `excited` | Pre-game energy; Cosmo's excited has built-in sparks |
| Minigame result | conditional 3-way | conditional 3-way (`celebrating`/`celebrating`/`encouraging`) | `proud` retired; `encouraging` is kinder than `thinking` for fails |
| Celebration overlay | conditional 2-way | conditional 2-way (unchanged) | Direct map |
| AI Coach (loading) | `thinking` | `thinking` | Direct map |
| Lesson gate (wrong) | `sad` | `encouraging` | "Nu-i bai!" copy needs encouraging energy, not sadness |
| Absence (returning) | `sleeping` | `sleeping` | Direct map |
| Level-up toast | `proud` | `celebrating` | `proud` retired; `celebrating` is the level-up signal |
| Streak toast | `proud` | `excited` | `proud` retired; differentiate from level-up |
| Welcome AI prompt | "Ești Pixel" | "Ești Cosmo" | Mascot name change |
| globals.css | pixel-mascot CSS | (deleted) | Cosmo handles all idle anims internally |

---

## 5. Risks surfaced during audit

| Risk | Mitigation |
|---|---|
| Cosmo's bigger default size (200 vs 80) could surprise any future call site that omits `size`. | Every existing site passes an explicit `size` — no immediate issue. Add a note to CLAUDE.md when we're there. |
| Removing `pixel-mascot-breathe` / `pixel-mascot-blink` CSS could affect any element outside Pixel that imported the class. | Verified by grep: only `pixel-mascot.tsx` itself uses these classes. Safe to delete. |
| The AI welcome-message route is server-side; the `Ești Pixel` string change only takes effect on **new** welcome generations — any cached welcomes in `users.ai_welcome_message` (if cached) keep the old name. | Check whether welcome messages are persisted. If yes, add a one-shot migration in 1.5.4 to clear stale cached welcomes. |
| `mascot-celebration-overlay.tsx` accepts emotion via prop — verify all callers pass an emotion that's valid in the new `CosmoEmotion` union. Specifically, no caller passes `"proud"` or `"idle"`. | Grep: callers only pass `"celebrating"` and `"excited"` (line 56 of overlay) — both valid in CosmoEmotion. Safe. |
| Landing page's hero `motion.div` adds a `y` bobbing animation around the mascot. Cosmo's body-bounce on `excited`/`celebrating` could double-bounce when stacked. | Use `waving` for hero (no body-bounce) — sidesteps the issue. Already in the mapping above. |

---

## 6. Verification checklist for Prompts 1.5.2 / 1.5.3 / 1.5.4

After every file is migrated:

- [ ] `grep -ri "PixelMascot" src/` returns **zero** matches
- [ ] `grep -ri "pixel-mascot" src/` returns **zero** matches  
- [ ] `grep -ri "Ești Pixel" src/` returns **zero** matches
- [ ] `grep -ri "Pixel te ajută" src/` returns **zero** matches
- [ ] `src/components/mascot/pixel-mascot.tsx` does not exist
- [ ] `src/app/globals.css` no longer contains `pixel-mascot-breathe` / `pixel-mascot-blink`
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean (no new errors vs Block 1 baseline)
- [ ] Manual visual check: every page in the 16-file list renders Cosmo in the spec'd emotion

(False-positive files in §3.D are exempt — they'll keep their `devicePixelRatio` / `setPixelRatio` / "in pixels" mentions.)
