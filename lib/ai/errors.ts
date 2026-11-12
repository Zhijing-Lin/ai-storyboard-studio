import "server-only";
import { APICallError, LoadAPIKeyError, NoObjectGeneratedError, RetryError } from "ai";
import { getModelId } from "./config";
import { jsonError } from "./guard";

/** Removes anything that looks like an API key before logging or returning text. */
export function redact(text: string): string {
  return text.replace(/sk-[A-Za-z0-9_\-*]{4,}/g, "sk-***");
}

/**
 * Maps AI SDK / OpenAI errors to a user-facing JSON error response.
 * Logs a short, redacted line server-side (never the key, never the request body).
 */
export function toErrorResponse(error: unknown, step: "outline" | "storyboard"): Response {
  const err = RetryError.isInstance(error) && error.lastError ? error.lastError : error;
  const model = getModelId();

  const name = err instanceof Error ? err.name : "UnknownError";
  const message = err instanceof Error ? redact(err.message).slice(0, 300) : "";
  console.error(`[ai:${step}] ${name}${APICallError.isInstance(err) ? ` status=${err.statusCode}` : ""}: ${message}`);

  if (LoadAPIKeyError.isInstance(err)) {
    return jsonError(500, "OPENAI_API_KEY is missing. Add it to .env.local and restart the dev server.");
  }

  if (NoObjectGeneratedError.isInstance(err)) {
    const cutOff = err.finishReason === "length";
    return jsonError(
      502,
      cutOff
        ? "The AI response was too long and got cut off. Try again, or shorten the SME content / outline."
        : "The AI response did not match the expected storyboard structure. Please try again.",
    );
  }

  if (APICallError.isInstance(err)) {
    const status = err.statusCode ?? 0;
    const body = (err.responseBody ?? "").toLowerCase();
    if (status === 401) {
      return jsonError(502, "OpenAI rejected the API key (401). Check OPENAI_API_KEY in .env.local, then restart the dev server.");
    }
    if (status === 429 && body.includes("insufficient_quota")) {
      return jsonError(502, "Your OpenAI account has no remaining quota. Check billing at platform.openai.com.");
    }
    if (status === 429) {
      return jsonError(429, "OpenAI rate limit reached. Wait a minute and try again.");
    }
    if (status === 404 || body.includes("model_not_found") || body.includes("does not exist")) {
      return jsonError(
        502,
        `The model "${model}" is not available to your OpenAI account. Set OPENAI_MODEL in .env.local to a model you can access, then restart.`,
      );
    }
    if (status === 400) {
      return jsonError(502, `OpenAI rejected the request (400): ${message || "invalid request"}`);
    }
    if (status >= 500) {
      return jsonError(502, "OpenAI is having trouble right now. Please try again shortly.");
    }
    return jsonError(502, `OpenAI request failed (${status || "network error"}). Please try again.`);
  }

  if (name === "AbortError" || name === "TimeoutError" || /timed? ?out/i.test(message)) {
    return jsonError(504, "The AI request timed out. Try again, or shorten the input.");
  }

  return jsonError(500, "Unexpected server error while generating. Check the terminal running the app for details.");
}
