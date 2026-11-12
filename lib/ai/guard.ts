import "server-only";
import { LIMITS, RATE_LIMITS } from "./config";

/**
 * Basic abuse & cost protection for the paid AI routes.
 *
 * This is suitable for local development and course demos. It is NOT a
 * substitute for authentication: in-memory counters reset on restart and are
 * not shared between serverless instances. Public deployments are therefore
 * blocked unless ALLOW_PUBLIC_AI_ENDPOINTS=true is set deliberately.
 */

export function jsonError(status: number, error: string, headers?: Record<string, string>) {
  return Response.json({ error }, { status, headers });
}

/** Checks that run before the request body is read. Returns an error Response or null. */
export function preflight(request: Request): Response | null {
  if (process.env.VERCEL && process.env.ALLOW_PUBLIC_AI_ENDPOINTS !== "true") {
    return jsonError(
      403,
      "AI generation is disabled on this deployment. Add authentication and set ALLOW_PUBLIC_AI_ENDPOINTS=true before exposing paid endpoints publicly.",
    );
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return jsonError(
      500,
      "OPENAI_API_KEY is not set on the server. Add it to .env.local in the project root and restart the dev server.",
    );
  }

  // Only accept requests from this app's own pages (blocks cross-site browser calls).
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let sameOrigin = false;
  try {
    sameOrigin = !!origin && !!host && new URL(origin).host === host;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) return jsonError(403, "Requests must come from the AI Storyboard Studio app.");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > LIMITS.maxBodyChars * 4) return jsonError(413, "Request is too large.");

  return null;
}

/** Reads and JSON-parses the body with a size cap. */
export async function readJson(request: Request): Promise<{ data: unknown } | { response: Response }> {
  const text = await request.text();
  if (text.length > LIMITS.maxBodyChars) {
    return { response: jsonError(413, "Request is too large. Shorten the SME content or outline and try again.") };
  }
  try {
    return { data: JSON.parse(text) };
  } catch {
    return { response: jsonError(400, "Request body must be valid JSON.") };
  }
}

// ---- Rate limiting (in-memory) -------------------------------------------

const perClient = new Map<string, number[]>();
let daily: { day: string; count: number } = { day: "", count: 0 };

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

/** Call immediately before a paid model call. Returns an error Response or null. */
export function consumeRateLimit(request: Request): Response | null {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  if (daily.day !== today) daily = { day: today, count: 0 };
  if (daily.count >= RATE_LIMITS.dailyTotal) {
    return jsonError(
      429,
      `Daily AI request limit (${RATE_LIMITS.dailyTotal}) reached for this server. Raise AI_DAILY_REQUEST_LIMIT in .env.local if this is intentional.`,
    );
  }

  const key = clientKey(request);
  const { limit, windowMs } = RATE_LIMITS.perClient;
  const recent = (perClient.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
    return jsonError(
      429,
      `Too many AI requests. Please wait about ${Math.ceil(retryAfter / 60)} minute(s) and try again.`,
      { "Retry-After": String(retryAfter) },
    );
  }

  recent.push(now);
  perClient.set(key, recent);
  daily.count += 1;
  return null;
}
