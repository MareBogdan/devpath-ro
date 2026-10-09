# Archive — superseded documents

These files describe **worlds that no longer exist**: the pre-v5 structure (321 lessons, the old
12-course layout, the Pixel→Cosmo migration, early execution planning) and the finished MVP
deploy (`DEPLOY-PLAN.md`). They are kept for history.

**They are NOT the source of truth.** The current, authoritative documents are:

- [`../MASTER-PLAN.md`](../MASTER-PLAN.md) — the current plan (post-launch: bring courses 1–6 to launch quality).
- [`../CURRICULUM-STRUCTURE.md`](../CURRICULUM-STRUCTURE.md) — the curriculum (13 courses · 245 lessons), which the
  seeder (`scripts/seed-curriculum.mjs`) reads at runtime.

Do not use anything here for current state or for seeding. Nothing in this folder is
referenced by code, scripts, or the build.

## Contents

| File | What it is | Superseded by |
|---|---|---|
| `DEPLOY-PLAN.md` | MVP deploy plan (2026-10-03) — the deploy is finished | `../MASTER-PLAN.md` |
| `devpath-curriculum-v4-definitiv.md` | v4 "DEFINITIV" curriculum skeleton (12 courses · 321 lessons, old titles/order) | `../CURRICULUM-STRUCTURE.md` (13 courses · 245 lessons) |
| `seed-curriculum.sql.DEPRECATED` | Broken/retired raw-SQL curriculum seed (column/value mismatch; INSERT-only) | `scripts/seed-curriculum.mjs` |
| `BLOCK2-3-EXECUTION-PLAN.md` | Dated execution plan (2026-05-06) for the Pixel→Cosmo swap + curriculum work — now largely executed | — (historical record) |
| `20260804120000_rename_courses_4_12_slugs.sql.SKIPPED` | Slug-rename migration that was deliberately never applied | `scripts/seed-curriculum.mjs` (slugs now come from `CURRICULUM-STRUCTURE.md`) |
| `dailylog.code-workspace` | Personal VS Code multi-root workspace (points at other local projects) — not part of the app | — |
