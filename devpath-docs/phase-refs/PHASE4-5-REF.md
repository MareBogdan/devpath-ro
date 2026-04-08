# Phase 4-5 Quick Reference

## GOAL: Mini-games + Python execution + Neural viz + Portfolio + Social
## ESTIMATED TASKS: ~50

## TASK GROUPS:

### GROUP A — DB Migration (P4.0) — run first
New tables: minigame_sessions (with RLS)
Extend: flashcards, user_flashcard_progress (IF NOT EXISTS)
Add: search_vector tsvector columns on lessons + courses (GIN index)

### GROUP B — Mini-Games (P4.1.x)
New files: src/components/minigame/
  minigame-modal.tsx, game-sort-concepts.tsx, game-fill-blank.tsx,
  game-match-pairs.tsx, game-true-false.tsx, game-build-network.tsx,
  game-write-prompt.tsx, minigame-result-screen.tsx
New action: recordMinigameSession() → awards XP, checks jucaus_perfect badge

GAME CYCLE (lesson order_index % 3 === 0):
3→sort_concepts, 6→fill_blank, 9→match_pairs, 12→true_false,
15→build_network, 18→write_prompt, 21→sort_concepts (repeats)

Extend MarkCompleteResult: minigameReady, gameType, triggerLessonIndex

### GROUP C — Flashcard Spaced Repetition (P4.2.x)
SM-2 algorithm: ease_factor, interval_days, repetitions, due_date
New page: src/app/(dashboard)/flashcards/page.tsx
New component: src/components/flashcards/flashcard-review.tsx
New action: updateFlashcardProgress(flashcardId, quality: 0|1|2|3|4|5)
Award cartele_dibace badge after first 10-card session

### GROUP D — F2 Adaptive Quiz (P4.3.x)
Tables exist from Phase 0: quiz_wrong_answers, ai_generated_questions
New API: src/app/api/ai/generate-quiz/route.ts
  Uses generateObject() with Zod schema, saves to ai_generated_questions
New component: src/components/course/adaptive-quiz-section.tsx
  Shows after failed quiz (score < 80%), fetches personalized questions

### GROUP E — F3 Neural Network Visualiser (P4.4.x)
Zero new packages — pure SVG + framer-motion
New files: src/components/visualiser/
  neural-network-visualiser.tsx, network-svg.tsx,
  forward-pass-animation.tsx, network-controls.tsx
MDX interceptor in lesson-content.tsx: language-neural-network-viz
Used in lessons 10, 11, 12

### GROUP F — F1 Python Execution (P4.5.x)
Package: pyodide@0.27.0 (load from CDN, NOT bundled)
New hook: src/hooks/use-pyodide.ts (singleton, lazy load)
New API: src/app/api/execute-code/route.ts (Piston proxy for PyTorch)
New component: src/components/course/output-panel.tsx
Modify: src/components/course/code-editor.tsx (add Run button + OutputPanel)
Award cod_rulat badge on first successful execution

### GROUP G — Search Cmd+K (P4.6.x)
New component: src/components/search/command-palette.tsx
  Uses Radix UI Dialog (already installed)
  Queries lessons + courses via full-text search on search_vector
Global shortcut: Cmd+K / Ctrl+K

### GROUP H — Portfolio Public Page (P5.1.x through P5.3.x)
New route: src/app/u/[username]/page.tsx (NO auth required)
Components:
  activity-heatmap.tsx (52x7 SVG grid, green scale)
  learning-dna-radar.tsx (6-axis SVG radar chart, framer-motion)
  portfolio-header.tsx, portfolio-stats.tsx

### GROUP I — Certificate PDF (P5.4.x)
Packages (request approval): @react-pdf/renderer@^4.1.6, qrcode@^1.5.4
New API: src/app/api/certificate/[courseSlug]/route.ts
New table: certificates (id, user_id, course_id, code uuid, created_at)
Verify page: src/app/verify/[code]/page.tsx (public, no auth)

### GROUP J — Comments + Referral + Social (P5.5.x through P5.8.x)
Comments: src/components/course/lesson-comments.tsx (threaded, upvotes)
  Award vocea_comunitatii badge on first comment
Referral: src/app/join/page.tsx (?ref= query param handling)
  Award ambasador/recrutorul badges on referral count milestones
Share button: triggers vitrina_deschisa badge

## DONE WHEN:
- Mini-game appears after every 3rd lesson
- Python code runs in browser via Pyodide
- Neural viz renders in lessons 10/11/12
- Portfolio page /u/[username] loads without login
- Certificate PDF downloadable after course completion
