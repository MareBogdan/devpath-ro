# DevPath RO — Tools & MCP Setup for Claude Code
# Read once at project start. Not needed for every task.

## MCPs ACTIVE (verify these work before starting Phase 0)

### 1. Supabase MCP ✅
Purpose: Live schema access, run queries, check RLS policies
Use for: Every DB migration — Claude Code sees tables directly
Command to verify: Ask Claude Code "what tables exist in my Supabase?"

### 2. Context7 MCP ✅
Purpose: Live documentation for libraries (Next.js, framer-motion, Supabase SDK, etc.)
Use for: Any time you need exact API syntax for a library
No need to paste docs in prompts — Claude Code fetches them

## RECOMMENDED ADDITIONAL SETUP

### Vercel MCP (optional but useful)
Purpose: Check deployment logs, env vars, cron job status directly
Install: https://vercel.com/docs/mcp
Useful for: Phase 6 (cron jobs), Phase 10 (production deploy)

### Stripe MCP (optional)
Purpose: Inspect products, prices, webhooks directly from Claude Code
Useful for: Phase 10 Stripe setup
Install: via Stripe dashboard developer tools

## SKILLS TO INSTALL IN CLAUDE CODE

Run these commands in your project root before starting implementation:

```bash
# These improve Claude Code output quality for specific file types
# Already handled by Context7 for most libraries

# For TypeScript strict mode assistance:
# No extra skill needed — CLAUDE.md + tsconfig.json handles this

# For Tailwind CSS class suggestions:
# No extra skill needed — Context7 fetches Tailwind docs on demand
```

## COMPACT SCHEDULE
Run /compact in Claude Code after completing each of these milestones:
- After Phase 0 GROUP C (DB migrations) — context gets large with SQL
- After Phase 1 GROUP C (14 simple MDX files written) — lots of content
- After Phase 1 GROUP D (16 new lessons) — very large context
- After Phase 2 all onboarding components
- After Phase 3 gamification.ts (large file)
- After Phase 4 GROUP B (mini-games — 8 files)
- After Phase 4 GROUP F (Pyodide integration)
- After Phase 9 GROUP D (60 MDX files — by far the most content-heavy task)

## PROMPT TEMPLATE FOR IMPLEMENTATION
Use this exact format for every implementation task:

---
Read devpath-docs/IMPLEMENTATION-INDEX.md to confirm current phase.
Read devpath-docs/phase-refs/PHASEX-REF.md for task group context.
Then read only the relevant section of devpath-docs/devpath-plan-phaseX.md.

Implement task [TASK-ID] only.
After completing, mark [TASK-ID] as done in devpath-docs/devpath-progress.md.
Run npx tsc --noEmit and fix any type errors before finishing.
---

## DO NOT INCLUDE IN PROMPTS (Claude Code knows these):
- Stack details (in CLAUDE.md)
- DB schema (Supabase MCP)
- Library APIs (Context7 MCP)
- General rules (in CLAUDE.md)
- Content from previous tasks (in phase-refs files)

## SESSION START CHECKLIST
Before starting a new Claude Code session:
1. Run /compact if previous session was long
2. Tell Claude Code which phase and task group you're in
3. Confirm which phase-refs file to read
4. Never start with "implement all of Phase X" — always one task group at a time
