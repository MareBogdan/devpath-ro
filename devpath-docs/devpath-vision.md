# DevPath RO — Vision, Mascot & Principles
**Version:** 1.0
**Created:** 2026-03-28
**Referenced by:** all files in devpath-docs/

---

## PLATFORM VISION

DevPath RO is the platform through which any Romanian — regardless of background —
can understand and use AI. Not just IT people. Doctors, entrepreneurs,
students, curious retirees. Everyone.

Core principle: if a 45-year-old doctor does not understand a lesson,
the lesson is wrong — not the doctor.

### Target Audience
- **80% non-technical** — doctors, entrepreneurs, non-CS students, curious people
- **20% technical** — developers, CS students, data scientists
- The platform serves both groups through the Simple Mode / Technical Mode system

### Platform Goals
1. Any Romanian can understand AI regardless of background
2. Learning is enjoyable, not exhausting — real gamification
3. Users finish courses and get concrete results
4. Platform grows organically through referrals and portfolio sharing
5. Sustainable monetization — decision after full product audit

---

## TECH STACK

- **Framework:** Next.js 14 App Router, TypeScript strict
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Auth:** Supabase Auth (Google OAuth, GitHub OAuth, Email + password)
- **UI:** Tailwind CSS + shadcn/ui + framer-motion
- **Editor:** Monaco Editor (@monaco-editor/react)
- **AI:** OpenAI GPT-4o-mini (chat streaming + TTS voice "nova")
- **Voice:** Web Speech API (STT) + OpenAI TTS-1 (TTS)
- **Deploy:** Vercel
- **Email:** Resend API (added in Phase 6)
- **Payments:** Stripe (added in Phase 10)
- **Language:** Romanian only — next-intl REMOVED entirely

---

## MASCOT — PROPOSALS

### Option 1 — PIXEL

**Visual concept:** A small, perfectly rounded droplet of light — not a robot, not a human, somewhere between a friendly ghost and a living idea. Pixel is blue-violet by default (the platform's primary color), glows softly at the edges, and has two large expressive eyes that take up most of its face. No visible limbs — it floats and gestures by tilting, pulsing, and stretching. When happy it turns a warm green-gold. When thinking, its color deepens to indigo and small sparks orbit it. When sad (streak lost), it becomes a muted grey-blue and droops slightly downward.

**Personality:** Pixel is curious about literally everything, including the user. It asks questions back, celebrates small wins loudly, and never makes anyone feel stupid. It uses warm Romanian diminutives and casual register. It treats every user like a smart person who just hasn't been shown the right door yet. Example phrases:
- "Hai, că merge! Mai o dată!" (on wrong gate answer)
- "Uau! Chiar ai înțeles asta din prima?" (on first-try correct answer)
- "Știam eu că poți!" (on lesson completion)
- "Mi-a fost dor de tine!" (on return after 3+ days absent)

**How Pixel appears in 8 specific platform moments:**

1. **Lesson completion:** Pixel explodes into a burst of colored sparks, reforms in the center of the screen at 2x size, does a little spin, then floats back to its corner position. A speech bubble says the user's name + "Bravo!" A shower of confetti (canvas-confetti) fills the screen for 2.5 seconds.

2. **Wrong gate answer:** Pixel drops slightly, eyes go big and sympathetic, a small sweat drop appears. Speech bubble: "Nu-i bai! Citește din nou paragraful despre [concept] și încearcă." The mascot gently points toward the relevant section of the lesson.

3. **Mini-game host:** Pixel grows to 3x size, bounces with excitement, and speech bubble announces the game rules. During the game it watches from the corner and reacts to correct/wrong answers in real time (happy pulse vs sad droop).

4. **Streak milestone (7 days):** A tiny crown materializes on top of Pixel, it shakes with pride, and fireworks erupt behind it. Speech bubble: "7 zile la rând! Ești de neoprit!"

5. **Badge earned:** Pixel flies in from the right holding the badge above itself like a trophy. Sets it down in front of the user. Eyes sparkle. Speech bubble: "[Badge name] — Câștigat!"

6. **"Did you forget?" reminder (3+ days absent):** Pixel appears greyed-out, sitting with its equivalent of arms wrapped around itself, looking at a tiny calendar. Speech bubble: "Ne-a fost dor de tine... Ultima lecție: [lesson title]. Revii?"

7. **Certificate generated:** Pixel puts on a tiny graduation cap (it tilts comically to one side) and holds a miniature scroll. Stamps it dramatically. Speech bubble: "Oficial certificat de Pixel!"

8. **Onboarding welcome:** Pixel bounces in from the top of the screen on a spring animation, lands, looks left-right-left excitedly, then stares directly at the user. Speech bubble: "Salut! Eu sunt Pixel — ghidul tău AI. Să începem?"

9. **XP gain:** Pixel appears briefly as a small overlay near the XP bar, does a quick thumbs-up with its whole body, then fades. The "+10 XP" number floats up past it.

**Why it works for non-technical Romanians:** The non-humanoid, non-robotic shape removes the "AI = scary robot" association. The color palette (blue-violet → warm gold) feels modern and optimistic without being cold. The rounded shape and big eyes trigger immediate warmth. There is no gender, no age, no professional identity — Pixel belongs equally to a 60-year-old grandmother and a 22-year-old developer.

**Implementation note:** SVG component `<PixelMascot />` with framer-motion `animate` props for color, scale, and position. Emotion state controlled by prop: `emotion: "happy" | "sad" | "thinking" | "excited" | "proud"`. The spark explosion uses framer-motion `AnimatePresence` with staggered children.

---

### Option 2 — DORU

**Visual concept:** A rounded, slightly chubby brain with a friendly face living inside it — the face is at the front-center of the brain, framed by the brain's folds which look more like fluffy clouds than anatomy. Doru is warm grey with pink-lavender accents. He wears tiny wire-rimmed glasses that he adjusts when thinking. His eyes are underneath the glasses — warm brown, very expressive. When excited his glasses jump off his face and land back crooked. When he has a great idea, a lightbulb appears above him. He is visibly round and soft — nothing sharp or angular.

**Personality:** Doru is the professor you wish you had in school — the one who makes everything feel obvious in retrospect, who never made you feel stupid for asking a basic question. He is patient, slightly bookish, but with a dry humor that lands perfectly. He knows an enormous amount but his defining trait is that he is genuinely delighted when YOU understand something, not when he gets to explain it. Example phrases:
- "Exact asta e! Creierul tău tocmai a format o conexiune nouă." (on correct answer)
- "Hmm... interesant unghi. Dar gândeste-te la asta..." (redirecting a wrong answer)
- "Știi că și eu am confundat asta prima oară? Adevărat." (normalizing confusion)
- "Felicitări! Doru e mândru." (he refers to himself in third person occasionally)

**How Doru appears in 8 specific platform moments:**

1. **Lesson completion:** Doru claps with his small brain-hands (the folds animate like arms), glasses jump up and land crooked. Speech bubble: "Lecție terminată! [User name], Doru e mândru de tine."

2. **Wrong gate answer:** Glasses tilt thoughtfully. Doru taps his chin. Speech bubble: "Aproape! Gândește-te la analogia cu [concept from lesson]. Încearcă din nou — poți!"

3. **Mini-game host:** Doru appears with a small blackboard and chalk. Draws a quick diagram explaining the game rules. Then erases the board and gives a thumbs up. "Gata? START!"

4. **Streak milestone (7 days):** Doru pulls out a small trophy from behind himself — it was obviously hidden there. Speech bubble: "7 zile consecutiv! Știam eu că ești serios."

5. **Badge earned:** Doru examines the badge carefully through his glasses, nods approvingly, then presents it with both hands like a professor handing back an exam with a perfect score.

6. **"Did you forget?" reminder:** Doru sits at a tiny desk, pen in hand, looking at an empty chair (implicitly the user's spot). Speech bubble: "Locul tău e liber... Ne lipsești. Ultima lecție: [title]."

7. **Certificate generated:** Doru stamps the certificate with an oversized stamp ("APROBAT"), then does a small celebratory shuffle. "Oficial! Felicitări de la Doru."

8. **Onboarding welcome:** Doru adjusts his glasses, looks at his notes, then looks up at the user with genuine warmth. "Bine ai venit! Eu sunt Doru — știu mult despre AI și abia aștept să îți arăt ce contează cu adevărat."

9. **XP gain:** A mini-Doru appears next to the XP toast, gives a quick approving nod, and vanishes.

**Why it works:** The brain metaphor is perfect for a learning platform — immediately communicates "education" without being cold. The Romanian name "Doru" (which also means "longing/missing someone") creates subtle emotional resonance — when you have not visited the platform in days, seeing Doru's sad face hits differently because of the name's cultural weight.

**Implementation note:** SVG component `<DoruMascot />` with brain-fold animations as framer-motion path morphs. Glasses are a separate SVG element with `rotate` animation on trigger. The lightbulb above is an `AnimatePresence` element that appears/disappears.

---

### Option 3 — ROMI

**Visual concept:** A retro-style robot — not sleek sci-fi, but the kind of friendly robot from 1970s cartoons: boxy body, rounded corners, antennae with a glowing ball on top that pulses different colors. Red body with white panels and gold accents — the Romanian tricolor is subtly present (red body, yellow gold antenna ball, white panels). Romi has two small screen-eyes that display emoji-style expressions: `^_^` for happy, `>_<` for concentrating, `T_T` for sad, `*_*` for amazed. The antenna pulses blue when thinking, green when celebrating, orange when warning.

**Personality:** Romi is the most enthusiastic entity in any room, perpetually amazed by things it discovers alongside the user. It has a slight robotic affect in its text — formal constructions that then break into warmth — which plays as charming rather than cold. It celebrates the user's victories as if they are its own personal achievement. Romi is the friend who screams louder than you when YOU score a goal. Example phrases:
- "PROCESARE COMPLETĂ! Răspuns corect detectat. Bravo!" (on correct answer)
- "Eroare benignă. Retry recomandat. Tu poți!" (on wrong answer)
- "ALERTĂ: lecție terminată! Inițiez protocol de celebrare..." (on completion)
- "Sistemele mele de bucurie funcționează la capacitate maximă!" (on milestone)

**How Romi appears in 8 specific platform moments:**

1. **Lesson completion:** Antenna spins rapidly, eyes display `★_★`, arms (two short extendable robot arms) shoot up in victory. Confetti shoots from the top of its head. Speech bubble: "LECȚIE COMPLETĂ! Inițiez protocol de celebrare..."

2. **Wrong gate answer:** Eyes switch to `^_^;` (the sweat emoji). Antenna dims slightly. Speech bubble: "Eroare benignă detectată. Sistemele tale de înțelegere au nevoie de o mică ajustare. Retry!"

3. **Mini-game host:** Romi pulls out a tiny microphone and announces the game like a game show host. "Bun venit la [Game Name]! Regulile sunt simple..." The microphone is comically large relative to Romi's body.

4. **Streak milestone (7 days):** Romi holds up a scoreboard showing "7" with blinking lights around it. Eyes show `♥_♥`. "RECORD PERSONAL DETECTAT!"

5. **Badge earned:** Romi scans the badge with a laser beam from its eyes, confirms it authentic, then presents it on a little velvet cushion it produces from its interior.

6. **"Did you forget?" reminder:** Romi holds a sign that reads the number of days since last visit. Eyes show `T_T`. "UTILIZATOR ABSENT: [X] ZILE. Sistemele noastre te caută..."

7. **Certificate generated:** Romi stamps the certificate with a mechanical arm stamper, then salutes. "CERTIFICAT VALIDAT. Felicitări din partea Departamentului de Excelență."

8. **Onboarding welcome:** Romi boots up (screen flickers to life), eyes light up, does a quick self-calibration wiggle, then looks at the user. "Sistem pornit. Utilizator nou detectat. Pregătit să înveți? Și eu!"

9. **XP gain:** Romi appears tiny in the corner holding a "+XP" sign above its head, does a little dance, disappears.

**Why it works:** The Romanian tricolor embedded in the design creates immediate cultural ownership — this is ours, not imported. The retro aesthetic is appreciated ironically by younger users and nostalgically by older ones. The robotic speech pattern creates humor without excluding non-technical users — it is clearly a character choice, not intimidating terminology.

**Implementation note:** SVG component `<RomiMascot />`. The screen-eyes are SVG `<text>` elements that swap between expressions. Antenna glow is `filter: blur()` + color change via framer-motion. Arms are SVG paths that animate along a motion path.

---

### Option 4 — LUMINA

**Visual concept:** A modern LED lightbulb with a face — the face lives inside the glass of the bulb, surrounded by a soft golden glow. The base/socket is matte silver. The filament inside glows in the shape of a heart when happy. Lumina is golden-amber, pulsing softly when active, dim when sad, brilliantly white when having an idea. Small radiating lines (her "rays") appear and retract based on emotion — many rays = excited, no rays = uncertain. She has an elegantly simple face: two curved lines for eyes (like classic anime eyes) and a small round mouth. No nose. Floats and tilts.

**Personality:** Lumina is the eternal optimist who genuinely believes every person she meets is capable of more than they think. She transforms setbacks into learning moments without being fake or saccharine about it — she acknowledges difficulty but immediately focuses on what to do next. She connects everything to light metaphors naturally. Example phrases:
- "Tocmai s-a aprins o luminiță în mintea ta!" (on understanding a concept)
- "Și Edison a greșit de 10.000 de ori. Tu ești pe drumul bun." (after wrong answer)
- "Stins temporar — dar revenire garantată!" (when streak is broken)
- "Strălucitor! Asta e!" (on perfect score)

**How Lumina appears in 8 specific platform moments:**

1. **Lesson completion:** Lumina pulses from warm gold to brilliant white, rays extend in all directions, the filament-heart glows bright. Screen flares with warm light that fades gracefully. Speech bubble: "[User name], ai strălucit azi!"

2. **Wrong gate answer:** Rays retract halfway, glow dims slightly. Lumina tilts her head with a gentle, thoughtful expression. Speech bubble: "Edison a greșit de 10.000 de ori. Tu ești la [attempt number]. Încearcă din nou — știu că poți."

3. **Mini-game host:** Lumina grows bright and announces the game with rays flashing like stage lights. The entire screen border pulses gold briefly. "Pregătit? Să vedem ce ai reținut! Lumina prezintă: [Game Name]!"

4. **Streak milestone (7 days):** Lumina's filament changes from a heart shape to "7" then back to heart. Seven small stars orbit her. "Șapte zile de lumină consecutivă! Ești de neoplrit!"

5. **Badge earned:** Lumina shines the badge like a spotlight — the badge appears in a beam of Lumina's light from above. "Acest badge te reprezintă perfect."

6. **"Did you forget?" reminder:** Lumina is visibly dim — the glass is cloudy, the glow barely present. She peeks out with one eye. "Stinsă fără tine... Ultima lecție: [title]. Revii să ne aprindem?"

7. **Certificate generated:** Lumina illuminates the certificate from above like a stage spotlight, then bows. "Iluminat oficial de DevPath RO!"

8. **Onboarding welcome:** Lumina flickers on like a bulb being switched — the classic slow-flicker-to-bright animation. Once bright, she radiates warmth in all directions. "Bun venit! Eu sunt Lumina. Sunt aici să aprind ceva în tine."

9. **XP gain:** A tiny Lumina flash of warm light washes across the XP bar as it fills, leaving a brief sparkle trail.

**Why it works:** The lightbulb = understanding = learning is the most universal visual metaphor that exists, crossing every culture and age group. The name "Lumina" is a real Romanian word (meaning "light") — it feels native, not branded. Romanian speakers will instinctively use it in sentences: "Lumina zice că...", "Apelul lui Lumina", giving it organic social presence.

**Implementation note:** SVG component `<LuminaMascot />`. The glow effect uses `filter: drop-shadow()` with color and radius animated via framer-motion. The filament (heart/number shapes) is an SVG path with `pathLength` animation for draw-on effects. Rays are SVG lines with `scaleX` animated from 0 to 1 on appear.

---

## SIMPLE MODE / TECHNICAL MODE SYSTEM

### Definition
Every lesson exists in two parallel versions:

**Mod Simplu** (default for all new users)
- Zero Python code or any programming language
- Zero mathematical formulas
- Every concept has a real-life Romanian analogy
- Code blocks replaced with: infographics, stories, analogies, interactive activities
- Target length: 800-1000 words
- Tone: warm, encouraging, like a friend explaining something

**Mod Tehnic** (for users with IT background)
- Full technical content with Python code
- Precise terminology
- Real examples with libraries (PyTorch, sklearn, tiktoken)
- Target length: 1400-1600 words
- Tone: professional but accessible

### How the Toggle Works
- At onboarding: user answers 3 calibration questions — system sets mode automatically
- Toggle visible in every lesson (top-right): "Mod Simplu" / "Mod Tehnic"
- Mode change: saved to `users.learning_mode`, re-renders lesson immediately
- Fallback: if `content_simple_md` is null, show `content_md` with a notice

---

## DESIGN PRINCIPLES

### 1. Simple Mode is the default for everyone
No new user sees code or technical terminology in their first lesson.
Technical Mode is activated consciously via toggle or advanced onboarding path.

### 2. Never show code in Simple Mode
Every code block from Technical Mode is replaced in Simple Mode with:
an analogy, a story, an infographic description, or an interactive activity without code.
Zero exceptions. If the temptation is to leave "just a small snippet" — do not.

### 3. Every theory lesson has mandatory gate questions
1-2 questions at the bottom of every theory lesson.
User cannot press "Complete" without answering correctly.
Wrong answer does not penalize — allows immediate retry with mascot feedback.
Awards 5 XP on first correct attempt.

### 4. You cannot complete a lesson without reading it
Scroll tracking ensures user has reached 90% of content.
CompleteButton stays disabled with tooltip "Citeste lectia mai intai"
until 90% scroll is reached. Gate questions only appear at 90%.

### 5. Every technical concept has a Romanian real-life analogy
Before any abstract explanation: "Imagineaza-ti ca..." or "E ca si cand..."
with a concrete example from everyday life in Romania.
Not generic analogies — specific and memorable ones.

### 6. Immediate feedback on every action
No click goes without visual response:
XP toast, mascot animation, confetti, or at minimum a ripple effect.
The user must constantly feel they are progressing.

### 7. All user-facing text is in Romanian
Interface, error messages, AI Coach, notifications, emails — all Romanian.
Technical terms (Token, Transformer, RAG, API) stay in English
but are explained immediately in Romanian on first appearance.

### 8. Mobile-aware, desktop-first
Platform is built for desktop (where focused learning happens).
No component actively blocks mobile access.
Full mobile responsiveness comes in Phase 10.

### 9. Mascot appears at every celebration moment
Lesson completed, badge earned, streak milestone, perfect quiz,
mini-game finished, course completed, certificate generated.
Never let a victory pass without the mascot reacting.

### 10. Security is non-negotiable
Every new API route: Zod validation + supabase.auth.getUser() check.
Every new DB table: RLS policy. Zero exceptions. Zero shortcuts.

---

## GAMIFICATION SYSTEM

### XP Values (exact — never change these)

| Event | XP |
|---|---|
| First lesson ever (welcome bonus) | 50 XP |
| Lesson completed (Simple Mode) | 10 XP |
| Lesson completed (Technical Mode) | 15 XP |
| Gate question correct on first try | 5 XP |
| Module quiz perfect score (100%) | 25 XP |
| Module quiz good score (80-99%) | 10 XP |
| Daily streak maintained | 5 XP/day |
| 3-day streak milestone | 20 XP bonus |
| 7-day streak milestone | 50 XP bonus |
| 30-day streak milestone | 200 XP bonus |
| Course completed | 100 XP |
| Mini-game perfect score | 30 XP |
| Mini-game completed | 15 XP |
| Flashcard session (10+ cards) | 10 XP |
| Referral registered (both users) | 40 XP |
| First comment posted | 5 XP |
| Comment receives 5 upvotes | 10 XP |

---

### Level System (10 levels with Romanian names)

**Level 1 — "Curios" (0–199 XP)**
You just arrived and you are already asking the right questions.
Description shown at level-up: "Primul pas e cel mai important. Bine ai venit, Curios!"
Unlocks: access to AI Coach for the first time.

**Level 2 — "Explorator" (200–399 XP)**
You have tasted the first ideas and you want more.
Description shown at level-up: "Mintea ta a inceput sa exploreze. Continua!"
Unlocks: access to the Flashcard system.

**Level 3 — "Invatatel" (400–699 XP)**
You are learning with purpose now. Things are starting to connect.
Description shown at level-up: "Conexiunile se formeaza. Esti pe drumul cel bun, Invatatel!"
Unlocks: ability to post comments on lessons.

**Level 4 — "Descoperitor" (700–999 XP)**
You have found ideas that genuinely surprised you. That is the sign.
Description shown at level-up: "Ai descoperit ceva real. Descoperitorul merge mai departe!"
Unlocks: mini-games leaderboard visibility.

**Level 5 — "Practician" (1000–1399 XP)**
You do not just understand things — you can use them.
Description shown at level-up: "Cunoasterea ta devine practica. Felicitari, Practician!"
Unlocks: Interview Prep access.

**Level 6 — "Mestesugat" (1400–1799 XP)**
You are building something with what you know. The craft has begun.
Description shown at level-up: "Mestesugarul stie ca practica face maiestrie. Continua!"
Unlocks: ability to make portfolio public (if not already).

**Level 7 — "Cunoscator" (1800–2299 XP)**
People ask you questions now. You have earned that.
Description shown at level-up: "Cunoscatorul e cel pe care altii il intreaba. Esti acolo!"
Unlocks: exclusive "Cunoscator" badge + profile border.

**Level 8 — "Inovator" (2300–2899 XP)**
You are not just using what exists — you are thinking about what could exist.
Description shown at level-up: "Inovatorul vede dincolo de ce e. Extraordinar!"
Unlocks: early access badge for new features.

**Level 9 — "Vizionar" (2900–3499 XP)**
You see connections others miss. That is rare.
Description shown at level-up: "Vizionarul iti apartine acum. Putini ajung aici."
Unlocks: special gold profile frame + "Vizionar" title shown on all comments.

**Level 10 — "Maestrul AI" (3500+ XP)**
You have walked the full path. Share what you know.
Description shown at level-up: "Ai ajuns. Maestrul AI — titlu castigat, nu dat. Extraordinar!"
Unlocks: permanent "Maestrul AI" badge, unique animated profile border, ability to submit guest lesson ideas.

---

### Badges System (exactly 25 badges)

#### PROGRESS — 8 badges

**1. `prima_lectie`**
Name: "Prima Lectie"
Description: "Ai completat prima ta lectie pe DevPath RO. Totul incepe cu un singur pas."
Trigger: `user_progress` count reaches 1 for this user
Icon: 🌱

**2. `primul_modul`**
Name: "Primul Modul"
Description: "Ai terminat toate lectiile dintr-un modul intreg. Structura incepe sa apara."
Trigger: All lessons in any single module marked complete in `user_progress`
Icon: 📦

**3. `primul_curs`**
Name: "Primul Curs"
Description: "Un curs intreg completat. Aceasta e o realizare reala — nu oricine ajunge aici."
Trigger: All lessons in any course marked complete
Icon: 🎓

**4. `la_jumatate`**
Name: "La Jumatate"
Description: "Ai terminat jumatate dintr-un curs. Cea mai grea parte e depasita."
Trigger: 50% of lessons in any course marked complete
Icon: ⚡

**5. `tocilarul`**
Name: "Tocilarul"
Description: "Ai trecut toate quiz-urile dintr-un curs. Se vede ca ai citit cu atentie."
Trigger: All module quiz lessons in a course completed with score >= 60%
Icon: 📚

**6. `maini_murdare`**
Name: "Maini Murdare"
Description: "Ai completat primul tau exercitiu practic. Teoria e buna — practica e mai buna."
Trigger: First lesson of type `exercise` marked complete
Icon: 🛠️

**7. `constructor`**
Name: "Constructor"
Description: "Ai trimis primul tau proiect. Ai construit ceva cu propriile maini."
Trigger: First record inserted in `projects` table for this user
Icon: 🏗️

**8. `complet`**
Name: "Complet!"
Description: "Ai terminat toate modulele unui curs. Nu multi pot spune asta."
Trigger: All modules in any course fully completed (same as primul_curs, awarded together)
Icon: ✅

---

#### STREAK — 5 badges

**9. `trei_zile`**
Name: "Trei Zile La Rand"
Description: "Trei zile consecutive de invatare. Obisnuintele se formeaza in 21 de zile — esti la start."
Trigger: `users.streak_count` reaches 3
Icon: 🔥

**10. `o_saptamana`**
Name: "O Saptamana"
Description: "Sapte zile la rand. Saptamana asta a contat."
Trigger: `users.streak_count` reaches 7
Icon: 🔥🔥

**11. `doua_saptamani`**
Name: "Doua Saptamani"
Description: "14 zile consecutive. La aceasta rata, in 6 luni vei sti mai mult despre AI decat 95% din Romania."
Trigger: `users.streak_count` reaches 14
Icon: ⚡🔥

**12. `o_luna`**
Name: "O Luna"
Description: "30 de zile la rand. Aceasta nu mai e o incercare — e cine esti tu acum."
Trigger: `users.streak_count` reaches 30
Icon: 🏆🔥

**13. `legenda`**
Name: "Legenda"
Description: "100 de zile consecutive. Intr-un an de azi, vei privi inapoi la aceasta zi."
Trigger: `users.streak_count` reaches 100
Icon: 👑

---

#### SKILL — 6 badges

**14. `perfect_primul`**
Name: "Perfect!"
Description: "Primul quiz cu scor 100%. Se poate — si tu ai demonstrat-o."
Trigger: First quiz completed with score = 100%
Icon: 💯

**15. `geniu_in_formare`**
Name: "Geniu in Formare"
Description: "Cinci quiz-uri cu scor perfect. Nu e noroc — e cunoastere reala."
Trigger: 5 quizzes completed with score = 100% (cumulative)
Icon: 🧠

**16. `cod_rulat`**
Name: "Cod Rulat"
Description: "Primul tau cod Python executat in browser. Bun venit in lumea programatorilor."
Trigger: First code execution via Pyodide or Piston in an exercise lesson
Icon: 💻

**17. `jucaus_perfect`**
Name: "Jucaus Perfect"
Description: "Scor perfect la un mini-joc. Reflexele tale de invatare sunt ascutite."
Trigger: First mini-game completed with perfect score (30 XP awarded)
Icon: 🎮

**18. `cartele_dibace`**
Name: "Cartele Dibace"
Description: "Prima sesiune de flashcarduri completata. Memoria ta multumeste."
Trigger: First flashcard session of 10+ cards completed
Icon: 🃏

**19. `programator_in_formare`**
Name: "Programator in Formare"
Description: "Ai activat Modul Tehnic. Vrei sa mergi mai adanc — respectabil."
Trigger: `users.learning_mode` changed to 'technical' for the first time
Icon: ⚙️

---

#### SOCIAL — 4 badges

**20. `vocea_comunitatii`**
Name: "Vocea Comunitatii"
Description: "Primul comentariu postat. Cunoasterea ta ajuta acum si pe altii."
Trigger: First record inserted in `lesson_comments` for this user
Icon: 💬

**21. `ambasador`**
Name: "Ambasador"
Description: "Primul prieten adus pe platforma. Cel mai bun lucru pe care il poti face pentru cineva drag."
Trigger: First successful referral — `referral_events` record created with this user as referrer
Icon: 🤝

**22. `recrutorul`**
Name: "Recrutorul"
Description: "Trei prieteni adusi pe platforma. Construiesti o comunitate."
Trigger: 3 successful referrals with this user as referrer
Icon: 🌐

**23. `vitrina_deschisa`**
Name: "Vitrina Deschisa"
Description: "Profilul tau public e in lume. Invatarea ta e acum vizibila pentru oricine."
Trigger: User clicks the LinkedIn/social share button from portfolio page (tracked via server action)
Icon: 🌟

---

#### SECRET — 2 badges

**24. `bufnita_de_noapte`**
Name: "Bufnita de Noapte"
Description: "Ai completat o lectie intre miezul noptii si 4 dimineata. Unii invata cand lumea doarme."
Trigger: Lesson marked complete when server timestamp hour is between 00:00 and 03:59 Romanian time (Europe/Bucharest timezone)
Icon: 🦉

**25. `sarbatoare_cu_minte`**
Name: "Sarbatoare cu Minte"
Description: "Ai invatat intr-o zi de sarbatoare nationala. Dragobete, Craciun sau 1 Decembrie — mintea ta nu ia vacanta."
Trigger: Lesson marked complete on any Romanian national holiday. Holidays checked: Jan 1-2 (New Year), Jan 24 (Unification Day), Easter Monday (variable), May 1 (Labour Day), Jun 1 (Childrens Day), Aug 15 (Dormition), Nov 30 (Saint Andrew), Dec 1 (National Day), Dec 25-26 (Christmas). Holiday dates computed server-side.
Icon: 🎊

---

## MINI-GAMES SYSTEM

### When They Appear
Automatically after lessons: 3, 6, 9, 12, 15, 18, 21, 24, 27
User sees a checkpoint screen with mascot animation: "Joc de antrenament! Testeaza ce ai invatat!"

### The 6 Mini-Game Types

**Game 1 — "Sorteaza Conceptele"** (after lessons 1-3)
- Mechanic: drag and drop cards into correct categories
- Categories: "AI Clasic" vs "Machine Learning" — 8 cards to sort
- Timer: 60 seconds
- XP: 30 perfect / 15 completed
- Implementation: framer-motion drag, droppable zones with highlight on hover

**Game 2 — "Completeaza Propozitia"** (after lessons 4-6)
- Mechanic: fill in the blank from a word bank
- 5 sentences about ML with blanks, word bank of 8 words
- No timer — thoughtful completion
- XP: 30 perfect / 15 completed
- Implementation: draggable word chips snapping into blank slots

**Game 3 — "Potriveste Perechile"** (after lessons 7-9)
- Mechanic: click to match concept to its definition
- 8 pairs. Cards flip when matched. Wrong match: shake animation.
- XP: 30 perfect / 15 completed
- Implementation: card grid, click-to-select + match logic

**Game 4 — "Adevarat sau Fals Rapid"** (after lessons 10-12)
- Mechanic: rapid-fire true/false, 10 seconds per question
- 10 statements about neural networks
- Swipe left/right or click True/False buttons. Final score with explanations.
- XP: 30 perfect / 15 completed
- Implementation: framer-motion swipe gesture or keyboard arrow keys

**Game 5 — "Construieste Reteaua"** (after lessons 13-15)
- Mechanic: drag neurons onto canvas to build a working network
- User places: input neurons, hidden layer neurons, output neuron
- Connect them by drawing lines. Run animated forward pass to see result.
- XP: 30 perfect / 15 completed
- Implementation: SVG canvas with draggable nodes — simplified version of F3 visualiser

**Game 6 — "Scrie Promptul Perfect"** (after lessons 20-22)
- Mechanic: given a task, improve a bad prompt
- Show bad prompt + task description. User edits. AI scores 1-10 with explanation.
- Uses /api/ai/chat with a scoring system prompt
- XP: 30 perfect / 15 completed
- Implementation: textarea + real AI scoring call

---

## NOTIFICATIONS STRATEGY

### Email (Resend API — Phase 6)
- Weekly progress email: every Monday 09:00 Romanian time
- Streak lost email: next morning if no activity and streak > 2
- Course completion email: with certificate PDF attached
- Referral success email: when referred user completes first lesson

### Browser Push (Web Push API — Phase 6)
- Permission requested after first lesson complete (never on page load)
- Daily reminder: at user preferred time if no lesson today
- Streak at-risk: at 20:00 if no lesson today and streak > 2

---

## ONBOARDING FLOW OVERVIEW

### Step 1 — "Cine esti tu?"
6 profile types:
- Medical / healthcare (doctor, nurse, pharmacist, student medical)
- Entrepreneur / manager
- Student (non-CS field)
- CS student / developer
- Teacher / educator
- Just curious / other

### Step 2 — "Ce vrei sa obtii?"
4 goals:
- Understand how AI works (no intention to build)
- Build things with AI
- Advance career with AI
- General curiosity / stay informed

### Step 3 — "Cat stii despre tehnologie?" (3 calibration questions)
- "Ai folosit vreodata ChatGPT sau un asistent AI?" (Yes / Sometimes / No)
- "Ai scris vreodata cod?" (Yes / A little / Never)
- "Stii ce este un API?" (Yes / Heard of it / No)

### Step 3b — Daily learning goal
- 5 minute / 15 minute / 30 minute / Cand am timp

### Profile to Mode Mapping (exact logic)

| Profile | Answers | Assigned Mode | Starting Path |
|---|---|---|---|
| medical | any | Simple | AI Fundamentals then Prompt Engineering |
| entrepreneur | any | Simple | AI Fundamentals then Prompt Engineering |
| student_non_cs | any | Simple | AI Fundamentals then Prompt Engineering |
| teacher | any | Simple | AI Fundamentals then Prompt Engineering |
| curious | any | Simple | AI Fundamentals then Prompt Engineering |
| student_cs | heard-of + a-little | Simple with toggle hint | AI Fundamentals then ML Practic |
| student_cs | yes + yes | Technical | AI Fundamentals then ML Practic |
| developer | yes + yes + yes | Technical | AI Fundamentals from Module 3 then ML Practic |
| developer | yes + yes + heard-of | Technical | AI Fundamentals from Module 1 then ML Practic |

Toggle hint = onboarding completion screen shows: "Stim ca ai ceva experienta tehnica. Poti activa Modul Tehnic oricand din orice lectie."

---

## PORTFOLIO AND SOCIAL FEATURES OVERVIEW

### Public Portfolio at /u/[username]
- Visible without login
- Shows: level, XP, badges, activity heatmap (GitHub-style), Learning DNA radar chart
- Completed courses with scores, submitted projects
- Auto-generated shareable OG image card

### Activity Heatmap
- 52 weeks x 7 days grid
- Color intensity = lessons completed that day
- Green scale: 0=gray, 1=light green, 3+=dark green

### Learning DNA Radar Chart
- 6 axes = 6 modules of AI Fundamentals
- Score per axis = % module completed x avg quiz score
- Pure SVG + framer-motion (no new library)

### Course Completion Certificate
- PDF generated server-side
- Contains: user name, course name, date, unique ID, QR code
- QR links to /verify/[id] public verification page

---

## REFERRAL SYSTEM

- Every user gets unique referral_code on onboarding completion (8 alphanumeric chars)
- Referral link: devpath.ro/join?ref=[code]
- On registration with ref code: both users get 40 XP
- Referrer gets notification: "Ai adus un prieten! +40 XP"

---

## devpath-docs/ FILE STRUCTURE

```
devpath-docs/
├── devpath-vision.md          <- THIS FILE (foundation)
├── devpath-plan-phase0.md     <- Cleanup & Security
├── devpath-plan-phase1.md     <- Dual-Mode Content + All Lessons
├── devpath-plan-phase2-3.md   <- Onboarding + Gamification
├── devpath-plan-phase4-5.md   <- Interactive Learning + Social
├── devpath-plan-phase6-10.md  <- Notifications to SEO and Monetization
└── devpath-progress.md        <- Master checklist all tasks
```

---

## IMPLEMENTATION RULES FOR CLAUDE CODE

These are absolute rules — apply them on every implementation prompt:

1. **Phase 0 first** — do not touch other code until Phase 0 is fully complete
2. **Security non-negotiable** — Zod + auth check on every new API route
3. **RLS non-negotiable** — every new DB table gets an RLS policy
4. **Simple Mode first** — for new lessons, write Simple version before Technical
5. **No new npm packages** without explicit approval in the prompt
6. **TypeScript strict** — zero `any` types allowed
7. **All user-facing text in Romanian** — interface, errors, AI responses
8. **Mascot at every celebration** — never skip celebration moments
9. **Update progress tracker after implementation** — check off completed tasks in devpath-progress.md
10. **Test Realtime with two browser tabs** — after any Supabase Realtime change
11. **schema.sql must stay in sync** — update after every DB migration
12. **Read devpath-vision.md before implementing** any gamification,
    mascot, or content-related feature — it is the single source of truth
