import "server-only";
import { createOpenAI, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";

/**
 * Server-only AI configuration. Values come from .env.local; see .env.example.
 * Never import this file from a Client Component.
 */

/** Economical default for testing. Override with OPENAI_MODEL in .env.local. */
export const DEFAULT_MODEL = "gpt-5.4-mini";

const REASONING_EFFORTS = ["none", "minimal", "low", "medium", "high"] as const;
type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

export function getModelId(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

export function getModel() {
  // createOpenAI reads OPENAI_API_KEY from the server environment by default.
  return createOpenAI()(getModelId());
}

/**
 * Reasoning effort is only sent when configured, or when using the default
 * reasoning model. Non-reasoning models (e.g. gpt-4.1-mini) should leave
 * OPENAI_REASONING_EFFORT empty.
 */
export function getProviderOptions(): { openai: OpenAILanguageModelResponsesOptions } {
  const raw = process.env.OPENAI_REASONING_EFFORT?.trim();
  const effort: ReasoningEffort | undefined =
    raw && (REASONING_EFFORTS as readonly string[]).includes(raw)
      ? (raw as ReasoningEffort)
      : getModelId() === DEFAULT_MODEL
        ? "low"
        : undefined;
  return {
    openai: {
      store: false, // do not retain prompts/outputs on OpenAI for later retrieval
      ...(effort ? { reasoningEffort: effort, reasoningSummary: null } : {}),
    },
  };
}

/** Input/output limits — the main cost safeguards. */
export const LIMITS = {
  maxBodyChars: 120_000,
  courseTitle: 200,
  smeContent: 40_000,
  objectives: 15,
  objectiveText: 600,
  targetLearners: 2_000,
  duration: 200,
  constraints: 3_000,
  outlineItems: 40,
  outlineTitle: 300,
  outlineSummary: 3_000,
  outlineRationale: 2_000,
  maxSlides: 80,
  outline: { maxOutputTokens: 12_000, timeoutMs: 120_000 },
  // Per attempt; the storyboard may make one repair attempt, so 2 × 140s stays within the route's 300s maxDuration.
  storyboard: { maxOutputTokens: 40_000, timeoutMs: 140_000 },
} as const;

/** Basic in-memory rate limits (per server instance). */
export const RATE_LIMITS = {
  perClient: { limit: 8, windowMs: 10 * 60_000 },
  dailyTotal: Number(process.env.AI_DAILY_REQUEST_LIMIT) || 60,
} as const;
