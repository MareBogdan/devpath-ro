# Cosmo Mascot — Approach Analysis

**Date:** 2026-04-29
**Context:** The Phase 1 procedural Three.js Cosmo works but reads as "an assemblage of 3D primitives" rather than a lovable character. We're choosing a path before sinking more effort.

---

## TL;DR — Recommendation

**Use Rive (`@rive-app/react-canvas`).** It is the single best fit for the *DevPath RO use case*: a small mascot rendered at 32–340 px, embedded in 10+ different surfaces, with 8 emotion states and idle animations, that has to feel snappy on first paint and stay easy to iterate on.

If the owner wants the wow-factor of full 3D specifically — pick **Spline** as the second choice. If the owner is OK with 2D and wants the smallest possible bundle and fastest first paint — pick **Lottie** as the third choice.

Avoid: pre-made Sketchfab `.glb` (licensing + scope mismatch), AI-generated `.glb` (quality lottery + integration overhead), continuing the procedural approach (we already proved the ceiling), and pure CSS/SVG (regression from current PixelMascot).

The reasoning takes the rest of this document.

---

## What Cosmo actually has to do

Before evaluating tools, pin down the requirements — every option that doesn't match these is the wrong tool, regardless of how cool it is in isolation.

| Constraint | Detail | Implication |
|---|---|---|
| **Sizes** | 32–48 px (AI Coach typing avatar), 56–90 px (toasts, lesson gate), 120–180 px (onboarding, dashboard absence), 200–340 px (celebration, pricing pages) | Fidelity at 32 px matters as much as at 340 px. A photoreal 3D model loses all detail at small sizes. |
| **Emotions** | 8 distinct states: happy, excited, thinking, encouraging, celebrating, sleeping, waving, sad | Need genuine state machine, not just hardcoded variants |
| **Idle anim** | Breathing, blink, ear twitch, tail wag, head tilt — running constantly when on-screen | Animation runtime must be cheap (we have 5+ Cosmos visible simultaneously on /dev/components) |
| **Interaction** | Mouse-gaze tracking, cursor-close → tail-wag boost, idle 10s → curious tilt | Need *programmatic* control, not just play-from-start |
| **First paint** | Many sites are above-the-fold (dashboard absence, onboarding) | Must not block LCP. Lazy-load is mandatory; runtime size matters. |
| **Iteration speed** | We've already gone through 1 visual iteration. Will go through more. | Code-driven option = N hours per change. Visual-editor option = 5 minutes per change. |
| **Bundle ceiling** | Already paying for Three.js (dashboard 3D mesh) — but we don't want to *also* pay for a heavyweight runtime on every page | Anything > 200 KB compressed is a hard sell |

---

## Option 1 — Spline (`@splinetool/react-spline`)

> Visual 3D editor in the browser. Design Cosmo there, export, embed in React.

| Dimension | Score / Detail |
|---|---|
| **Visual quality (1–10)** | **9** — Spline is genuinely capable of beautiful, stylized 3D. The Spline community has tons of mascot examples and the editor has lighting, materials, and post-effects baked in. |
| **Bundle size** | ⚠️ **~300+ KB gzipped runtime**. The `@splinetool/react-spline` package itself is 26.8 KB but it depends on `@splinetool/runtime` which is large. Plus the actual scene file (`.splinecode`) — typically 200 KB to 2 MB depending on complexity. |
| **Animation capability** | ✅ Built-in event system: states, mouse-look, scroll-trigger, custom variables you can set from JS. Programmatic emotion switching is straightforward via `setVariable()`. |
| **Idle animations** | ✅ Native support — design timelines in the editor that loop. |
| **Mouse interaction** | ✅ Native — built into the editor's event system. Can also set rotation from JS. |
| **Iteration ease** | ✅ **The killer feature.** Visual editor → edit → re-export → drop in. Non-engineer can iterate on Cosmo's look. |
| **React/Next compat** | ✅ First-class. Has `'use client'` boundaries documented, supports lazy import, has render-on-demand mode (only renders frames when scene changes — huge perf win for static states). |
| **Performance** | ✅ Render-on-demand mode is excellent for mascots — most frames Cosmo is *not* changing, so we render zero frames per second between emotion transitions. |
| **External deps** | ⚠️ Requires Spline account (free tier exists). The exported `.splinecode` file is hosted on Spline's CDN by default but **can be self-hosted** in `/public/`. |
| **Risk** | Spline is a startup. If they pivot or shut down, the runtime still works, but the editor goes away. Low/medium risk. |

**Net:** Highest visual ceiling of any option. The bundle weight is real but we've already approved Three.js elsewhere. Iteration speed is the single biggest factor here — every other option except Rive requires a code change to tweak Cosmo's look.

---

## Option 2 — Pre-made `.glb` from Sketchfab

> Find a CC-licensed golden retriever model, load with `useGLTF` from `@react-three/drei`, customize materials and animate.

| Dimension | Score / Detail |
|---|---|
| **Visual quality (1–10)** | **6–8** depending on what we find. Realistic models look great but won't match Aurora's stylized aesthetic. |
| **Bundle size** | ⚠️ **The model itself is the bundle.** A decent rigged retriever `.glb` is 1–5 MB. Plus we still need Three.js + R3F (~180 KB). |
| **Animation capability** | ⚠️ **Fundamentally limited to whatever animations the original artist baked in.** We need 8 *specific* emotions. The Sketchfab "Golden Retriever Puppy Dog (GameReady)" model has 15 animations — but they're things like *idle*, *walk*, *bark*, *sit*. None of them are "thinking" or "encouraging." |
| **Idle animations** | ✅ Whatever's in the file |
| **Mouse interaction** | ⚠️ Custom code — same difficulty as procedural |
| **Iteration ease** | ❌ **Worst of all options.** Want to change Cosmo's color? Open Blender. Want a new emotion? Hire a 3D animator. |
| **React/Next compat** | ✅ Same as procedural Three.js — fine via `useGLTF` and dynamic import |
| **Performance** | ⚠️ Depends entirely on poly count and rigging complexity. A "GameReady" model is fine; a "high-poly" hero asset would tank perf. |
| **External deps** | ✅ Free CC0 models exist; download once and host in `/public/` |
| **Risk** | The biggest risk is **scope mismatch**. We don't need a *realistic* retriever — we need a *stylized DevPath mascot*. Most CC retrievers are realistic. |

**Net:** This is "use someone else's asset." Cheap to start, painful to iterate. The 8-emotion requirement is the deal-breaker — pre-made models almost never have the specific emotion set we need, and creating new ones requires Blender + a rigger. Every future tweak becomes a multi-day art task.

---

## Option 3 — AI-generated `.glb` (Meshy.ai / Tripo3D / Rodin)

> Generate Cosmo from a text prompt, download as `.glb`, integrate.

| Dimension | Score / Detail |
|---|---|
| **Visual quality (1–10)** | **5–7, highly variable**. Current state of the art (Meshy v4, Tripo v2.5) produces decent results for *single static models*. **Character animation** is still rough — auto-rigging works but emotional expressions are not in the toolset. |
| **Bundle size** | Same as pre-made: 1–5 MB for the model + ~180 KB R3F |
| **Animation capability** | ⚠️ Meshy has auto-rigging + a small library of canned animations (walk, idle, dance). **No facial expression rigs** at this size class. We'd be back to procedurally animating eye/mouth shapes — which is the exact problem we're trying to escape. |
| **Idle animations** | ⚠️ One or two canned ones; emotion-specific — no |
| **Mouse interaction** | ⚠️ Custom code, same as procedural |
| **Iteration ease** | ⚠️ Generation is fast (minutes) but **non-deterministic**. Want a slight color tweak? Re-prompt and hope. Iteration is "spin the wheel" not "tweak a slider." |
| **React/Next compat** | ✅ Same as Sketchfab path |
| **Performance** | ⚠️ Same as Sketchfab |
| **External deps** | ⚠️ Requires Meshy/Tripo subscription for higher-quality outputs ($20+/mo). Free tiers are watermarked or low-resolution. |
| **Risk** | **Highest output-quality variance.** Meshy and Tripo both generate "fine for a placeholder" models in seconds and "actually impressive hero asset" models in 30+ minutes of prompting + cleanup. The variance is too high for a hero mascot. |

**Net:** Good for bootstrapping a *static* hero illustration. Bad for an emotion-rich animated mascot. Same iteration problem as Sketchfab — once the `.glb` is generated, you're stuck with it unless you re-roll. The sweet spot for these tools is "I need a chair model for my game in 90 seconds," not "I need 8 distinct facial expressions on the same character."

---

## Option 4 — Rive (`@rive-app/react-canvas`)

> 2.5D animation tool with a built-in state machine. Compiled binary format. Single runtime + single `.riv` file.

| Dimension | Score / Detail |
|---|---|
| **Visual quality (1–10)** | **8** for stylized characters. Look at Rive's marketplace — Duolingo-tier mascots are made in Rive. *Specifically* designed for this use case. |
| **Bundle size** | ✅ **~200 KB gzipped runtime + tiny .riv file (~16 KB for our scope)**. Single fetch covers all 8 emotions plus all idle states. |
| **Animation capability** | ✅ **Best in class for our use case.** Rive's State Machine is literally designed for "character with emotion states + idle anims + interactive triggers." This is the tool's center-of-mass. |
| **Idle animations** | ✅ Native — set as default state, runs automatically |
| **Mouse interaction** | ✅ Native — Rive supports pointer-position inputs you can wire directly to "look at cursor" bones. No custom code. |
| **Iteration ease** | ✅ Visual editor (Rive Editor — free, web-based + desktop). Designer or engineer can tweak rigs in minutes. Re-export, drop in. |
| **React/Next compat** | ✅ First-class. `@rive-app/react-canvas` ships a clean React component. Works with `next/dynamic({ ssr: false })`. |
| **Performance** | ✅ **Excellent.** GPU-accelerated, lighter than Three.js, lighter than Lottie playback. Multiple Rive instances on a page is normal usage. |
| **External deps** | ⚠️ Rive editor requires an account (free tier exists, paid for team workflows). The `.riv` file is local — host in `/public/`. |
| **Risk** | Rive (the company) is well-funded and growing. The `.riv` format is open-source and the runtime is MIT. Low risk. |

**The killer feature for us:** Rive's State Machine speaks the same vocabulary as our `EmotionTargets` interface. We define states (`happy`, `excited`, etc.), transitions between them, and inputs (mouse-X, mouse-Y, isClose) — and the file *is* the animation. From React: `stateMachine.input("emotion").value = "celebrating"`. Done.

**Net:** Designed for exactly our use case. The only meaningful tradeoff is "it's not full 3D." Cosmo would be 2.5D — designed to look like he has depth, but technically rendered as 2D vector art. For a 32–340 px mascot rendered on screen, that distinction is invisible.

---

## Option 5 — Lottie (`lottie-react` / `dotlottie-react`)

> JSON-defined 2D animations exported from After Effects. Used by Duolingo's earliest mascot, Airbnb, etc.

| Dimension | Score / Detail |
|---|---|
| **Visual quality (1–10)** | **7** for stylized characters. Excellent for illustrative mascots. |
| **Bundle size** | ✅ **~60 KB gzipped runtime** (smallest of any animation option). `.lottie` files for 8 emotions: ~50–150 KB total. |
| **Animation capability** | ⚠️ **Lottie is "play-from-start" by design.** Switching emotions = swap files or use marker-based segments. Programmatic transitions exist but feel bolted-on. |
| **Idle animations** | ✅ Loop a segment |
| **Mouse interaction** | ❌ **Not native.** You can play different segments based on cursor position, but you can't *bind* a property to cursor-X. Mouse-gaze tracking would require a separate code path. |
| **Iteration ease** | ⚠️ After Effects + Bodymovin plugin is the standard pipeline. LottieFiles' new web Creator is improving but still less capable than Rive Editor. |
| **React/Next compat** | ✅ First-class |
| **Performance** | ✅ Lighter than Three.js. Multiple Lotties on a page is fine. |
| **External deps** | After Effects ($23/mo) for serious work, OR LottieFiles' free web tools |
| **Risk** | Mature, ubiquitous. Almost zero risk. |

**Net:** Smallest possible bundle, biggest mascot ecosystem (LottieFiles has thousands of CC mascots), but **the mouse-gaze interaction requirement maps poorly to Lottie's playback-only model**. We'd end up writing custom logic that fights the framework. If we drop the mouse-gaze requirement, Lottie becomes very competitive with Rive — but the requirement is in the spec.

---

## Option 6 — CSS/SVG with CSS 3D transforms

> Like the current `PixelMascot` but more sophisticated.

| Dimension | Score / Detail |
|---|---|
| **Visual quality (1–10)** | **5**. We've already proven this ceiling with PixelMascot. CSS 3D doesn't render real lighting or shading — at best you get layered SVG with pseudo-depth. |
| **Bundle size** | ✅ **~5 KB**. Just the SVG markup + CSS keyframes + a small React wrapper. |
| **Animation capability** | ⚠️ Multiple emotions = multiple SVG variants. CSS keyframes for idle anims. Mouse gaze possible via CSS variables driven by JS. |
| **Idle animations** | ✅ CSS keyframes |
| **Mouse interaction** | ⚠️ Possible via JS-driven CSS variables — but the "look-at-cursor" effect on flat SVG always reads as *flat eyes shifting position*, never as *a head turning*. |
| **Iteration ease** | ⚠️ Hand-edit SVG paths in code. Same as PixelMascot. |
| **React/Next compat** | ✅ Trivial — works with SSR, no client-only |
| **Performance** | ✅ Lightest possible |
| **External deps** | None |
| **Risk** | None |

**Net:** This is **a regression from PixelMascot, not a step up**. PixelMascot is already a polished SVG mascot with 10 emotions. The owner's complaint is that even the *3D* version doesn't look like a "lovable mascot." Going *backward* to 2D SVG is the wrong direction — even if our SVG is more sophisticated, it would still be 2D. The complaint isn't about polish, it's about ambition.

---

## Option 7 — Keep procedural, improve

> Same Three.js + R3F approach, but: better proportions, MeshToonMaterial, post-processing bloom, baked AO maps, proper hand-tuned eye/mouth shapes.

| Dimension | Score / Detail |
|---|---|
| **Visual quality (1–10)** | **7 ceiling**, realistically. With effort we can get to "decent stylized character" but **the fundamental problem is that we're an engineer modeling a character in code, not an artist modeling a character in a 3D editor.** Every iteration is a TypeScript change. |
| **Bundle size** | ✅ Slightly bigger than current (post-processing adds ~30 KB). Still fine. |
| **Animation capability** | ✅ Same as Phase 1 |
| **Iteration ease** | ❌ **The bottleneck.** Adjusting Cosmo's nose proportion is a number tweak in code, recompile, refresh, judge by eye. A 3D artist in Blender does the same tweak in 3 seconds with a slider. |
| **External deps** | None |

**Net:** The *animation* in Phase 1 is actually solid — eased emotion transitions, the emotion table is well thought out. The *modeling* is what falls flat. And we cannot improve the modeling significantly without leaving code, because we are not artists. **More Phase 1 work hits the same ceiling.**

---

## Comparison matrix

| Option | Visual | Bundle | Animation | Idle | Interaction | Iteration | First-paint | Cost | Score |
|---|---|---|---|---|---|---|---|---|---|
| **Spline** | 9 | 🟡 300+ KB + scene | ✅ | ✅ | ✅ | ✅✅ | 🟡 | Free tier | **8.5** |
| **Sketchfab GLB** | 6–8 | 🟡 1–5 MB | ⚠️ | ✅ | ⚠️ | ❌ | 🔴 | CC0 free | 5 |
| **AI-gen GLB** | 5–7 | 🟡 1–5 MB | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 🔴 | $0–20/mo | 4.5 |
| **Rive** | 8 | ✅ 200 KB | ✅✅ | ✅ | ✅ | ✅✅ | ✅ | Free tier | **9** |
| **Lottie** | 7 | ✅ 60 KB | ⚠️ | ✅ | ❌ | 🟡 | ✅✅ | Free / AE | 6.5 |
| **CSS/SVG** | 5 | ✅✅ 5 KB | ⚠️ | ✅ | ⚠️ | ⚠️ | ✅✅ | Free | 4 |
| **Procedural++** | 7 | ✅ +30 KB | ✅ | ✅ | ✅ | ❌ | ✅ | Free | 5.5 |

**Visual:** subjective ceiling at our use case. **Bundle:** runtime + assets. **Iteration:** how fast we can change the result. ✅✅ = excellent, ✅ = good, 🟡 = mixed, ⚠️ = problematic, ❌ = blocker.

---

## The decision

**Pick Rive.** Five reasons, in priority order:

1. **State machine is exactly the abstraction we already built.** Our `EmotionTargets` interface is hand-rolled state machine code — Rive ships that for free, with a visual editor. We stop maintaining the ease/lerp logic, the animation runtime takes over.
2. **Mouse-gaze, cursor-close → wag, idle-tilt — all native inputs.** Rive State Machines support continuous input variables out of the box. We bind cursor-X, cursor-Y, and isClose; the file does the rest. Less code than the current implementation.
3. **Bundle weight is acceptable.** 200 KB runtime + ~16 KB `.riv` file is competitive with Three.js + R3F (which we currently pay), and unlike Three.js, Rive is *only* loaded on pages that use Cosmo (lazy import).
4. **First paint is fast.** Rive renders 2.5D vector art with a tiny WASM kernel — no scene compilation, no GLB parsing, no shader compile. The mascot pops in.
5. **Iteration speed is the multiplier.** This will not be the last tweak. Rive editor → drag a slider → re-export → reload. Procedural Three.js was: open the file → find the magic number → tweak → compile → refresh.

**Tradeoff being accepted:** Cosmo will be 2.5D, not full 3D. At 32–340 px on web, this is invisible to users. The "wow" comes from personality and motion quality, not from polygons.

### If "must be 3D" is a hard requirement

Pick **Spline**. It's nearly tied with Rive on every dimension *except* bundle and first-paint, and it gives full 3D with the same iteration-speed advantage. The deal-breaker for Spline is *only* if we care about runtime weight on every page — for a mascot that loads on /onboarding and /pricing/success but not /dashboard, Spline is fine.

### What this means for the existing Phase 1 Cosmo

The procedural Cosmo file (`src/components/mascot/cosmo-mascot.tsx`) and showcase remain in place and functional. Useful as:
- Reference for the emotion table and per-emotion target values (these translate directly into Rive State Machine inputs)
- Proof that the **animation logic was the easy part**; the **character modeling was the hard part** — confirming Rive is the right escape route
- Fallback in case Rive turns out to have an unexpected blocker (e.g., licensing surprise, runtime issue) — we ship procedural Cosmo until the Rive version is ready

### What needs to happen if we proceed with Rive

(For the next prompt — not for this one.)

1. **Designer task** — open Rive Editor, design Cosmo with the 8-emotion State Machine. Roughly 1–3 days of focused design work. Could be the owner, could be outsourced (Rive has a marketplace of designers).
2. **Engineer task** — install `@rive-app/react-canvas` (~200 KB), write a thin `<CosmoMascot>` wrapper component with the same prop interface as the current procedural one (so the eventual wiring across 10 sites is a one-line import swap), wire State Machine inputs to props.
3. **Wiring task** — replace `PixelMascot` references with `CosmoMascot` across the 10 documented integration sites.

The wrapper component should keep the `CosmoEmotion` union and the `enableInteraction` prop API identical to the procedural version, so step 3 is mechanical.

---

## Sources

- [@splinetool/react-spline — npm](https://www.npmjs.com/package/@splinetool/react-spline)
- [splinetool/react-spline — Optimizing Performance (DeepWiki)](https://deepwiki.com/splinetool/react-spline/5.2-optimizing-performance)
- [Rive vs Lottie — Callstack](https://www.callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation)
- [Rive vs Lottie — Rive blog](https://rive.app/blog/rive-as-a-lottie-alternative)
- [Rive vs Lottie — Unicorn Icons (2026)](https://unicornicons.com/learn/rive-vs-lottie)
- [Why Rive Animations Convert Better Than Lottie for Interactive Mascots](https://dev.to/uianimation/-why-rive-animations-convert-better-than-lottie-for-interactive-mascots-2nkd)
- [Best AI Tools for 3D Game Assets (2026) — Meshy blog](https://www.meshy.ai/blog/best-ai-tools-for-3d-game-assets)
- [AI 3D Model Generators Compared: Tripo, Meshy, Rodin — Medium](https://medium.com/data-science-in-your-pocket/ai-3d-model-generators-compared-tripo-ai-meshy-ai-rodin-ai-and-more-8d42cc841049)
- [Sketchfab Golden Retriever Puppy Dog (GameReady)](https://sketchfab.com/3d-models/golden-retriever-puppy-dog-gameready-ae93d7be74b9470498bfad188ecd2116)
- [Sketchfab tag: golden-retriever](https://sketchfab.com/tags/golden-retriever)
