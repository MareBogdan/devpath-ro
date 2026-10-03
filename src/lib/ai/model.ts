import { anthropic } from "@ai-sdk/anthropic";

/**
 * The ONE place the text-AI model id lives. Every AI route imports `aiModel`, so
 * moving to a different tier (e.g. a Sonnet id for higher quality) is a one-line
 * change here.
 *
 * `claude-haiku-4-5` — the current low-cost Claude (Haiku tier). Use the alias
 * exactly as-is; no date suffix.
 */
export const AI_MODEL = "claude-haiku-4-5";

/**
 * Safe to create at import time: `@ai-sdk/anthropic` reads `ANTHROPIC_API_KEY` lazily
 * when a request is made (never on import), so a missing key can't fail the build or
 * crash a route on load — routes check `isAIConfigured()` first and answer 503.
 */
export const aiModel = anthropic(AI_MODEL);

/** Text AI ships enabled only when the owner has set ANTHROPIC_API_KEY. */
export const isAIConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);
