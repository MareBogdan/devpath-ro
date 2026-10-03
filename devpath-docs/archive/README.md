# Archive — pre-v5 documents

These files describe the **pre-v5 world** (321 lessons, the old 12-course structure,
the Pixel→Cosmo migration, and early execution planning). They are kept for history.

**They are NOT the source of truth.** The current, authoritative curriculum lives in
[`../CURRICULUM-STRUCTURE.md`](../CURRICULUM-STRUCTURE.md) (ML/PyTorch pivot, 205 lessons), which the
seeder (`scripts/seed-curriculum.mjs`) reads at runtime.

Do not use anything here for current state or for seeding. Nothing in this folder is
referenced by code, scripts, or the build.

## Contents

| File | What it is | Superseded by |
|---|---|---|
| `devpath-curriculum-v4-definitiv.md` | v4 "DEFINITIV" curriculum skeleton (12 courses · 321 lessons, old titles/order) | `../CURRICULUM-STRUCTURE.md` (ML/PyTorch pivot, 205) |
| `seed-curriculum.sql.DEPRECATED` | Broken/retired raw-SQL curriculum seed (column/value mismatch; INSERT-only) | `scripts/seed-curriculum.mjs` |
| `BLOCK2-3-EXECUTION-PLAN.md` | Dated execution plan (2026-05-06) for the Pixel→Cosmo swap + curriculum work — now largely executed | — (historical record) |
| `20260804120000_rename_courses_4_12_slugs.sql.SKIPPED` | Slug-rename migration that was deliberately never applied | `scripts/seed-curriculum.mjs` (slugs now come from `CURRICULUM-STRUCTURE.md`) |
| `dailylog.code-workspace` | Personal VS Code multi-root workspace (points at other local projects) — not part of the app | — |
