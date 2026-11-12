import { toErrorResponse } from "@/lib/ai/errors";
import { generateOutline, UnusableOutputError } from "@/lib/ai/generate";
import { consumeRateLimit, jsonError, preflight, readJson } from "@/lib/ai/guard";
import { firstIssue, outlineRequestSchema } from "@/lib/ai/schemas";

export const maxDuration = 150;

/** POST /api/ai/outline — generates a design outline with OpenAI (server-side only). */
export async function POST(request: Request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  const body = await readJson(request);
  if ("response" in body) return body.response;

  const parsed = outlineRequestSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(400, firstIssue(parsed.error));

  const limited = consumeRateLimit(request);
  if (limited) return limited;

  try {
    return Response.json(await generateOutline(parsed.data));
  } catch (error) {
    if (error instanceof UnusableOutputError) return jsonError(502, error.message);
    return toErrorResponse(error, "outline");
  }
}
