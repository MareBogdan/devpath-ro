# Phase 1 Quick Reference
# DO NOT read devpath-plan-phase1.md in full initially.
# Read sections only when implementing that specific task group.

## GOAL: Dual-Mode content system + all 46 MDX files + gate questions + flashcards
## ESTIMATED TASKS: 34 (P1.1.x through P1.7.x)

## TASK GROUPS — implement in this exact order:

### GROUP A — DB Migration (run first)
New tables: lesson_gate_questions, lesson_bookmarks, lesson_feedback
New function: increment_user_xp (Postgres function)
UPDATE schema.sql after.

### GROUP B — Core Components (P1.1.x) — read plan section 1.1 only
1. lesson-content.tsx → add learningMode + contentSimpleMd props
2. mode-toggle.tsx (new) + updateLearningMode server action
3. reading-progress.tsx (new) — scroll tracking, gates at 90%
4. lesson-gate.tsx (new) — gate questions with XP award
5. complete-button.tsx → disabled until scroll+gate complete
6. lesson-page-client.tsx (new) — client wrapper
7. bookmark-button.tsx (new) + toggleBookmark server action
8. lesson-feedback.tsx (new) + submitLessonFeedback server action
9. flashcard-deck.tsx (new) — 3D flip cards
10. Update lesson page RSC + sync-action.ts

### GROUP C — Simple Mode MDX files (P1.2.x/1.3.x)
Pattern: content/courses/ai-fundamentals/lesson-XX-slug-simple.mdx
Write 14 simple rewrites for existing lessons 1-14
Each file: 800-1000 words, zero code, Romanian analogies
Include ```flashcards JSON block in each file

### GROUP D — New Lessons 15-30 (P1.4.x)
Technical MDX: content/courses/ai-fundamentals/lesson-XX-slug.mdx (replaces stubs)
Simple MDX: content/courses/ai-fundamentals/lesson-XX-slug-simple.mdx
Both files per lesson, both modes

### GROUP E — Gate Questions SQL (P1.5.x)
Run INSERT statements for lesson_gate_questions — see plan section 1.4
All 30 theory lessons get 1-2 gate questions each

### GROUP F — Sync + QA (P1.6.x + 1.7.x)
Run sync-action to populate content_md and content_simple_md in DB
Run npx tsc --noEmit
Test all checklist items from plan section 1.7

## KEY INTERFACES (memorize these):
```typescript
// lesson-content.tsx
interface LessonContentProps {
  content: string;
  contentSimpleMd?: string | null;
  learningMode?: "simple" | "technical";
}

// lesson-gate.tsx
interface LessonGateProps {
  lessonId: string;
  questions: GateQuestion[];
  onAllCorrect: () => void;
}
```

## SIMPLE MODE RULES (non-negotiable):
- Zero Python code or programming syntax
- Zero mathematical formulas
- Every concept has a real-life Romanian analogy starting with "Imaginează-ți că..."
- Target length: 800-1000 words
- python-editor blocks → show placeholder "Disponibil în Modul Tehnic"

## DONE WHEN:
- Mode toggle works and persists in users.learning_mode
- Complete button locked until 90% scroll + gate answered correctly
- All 46 MDX files created and synced to DB
- npx tsc --noEmit passes with zero errors
