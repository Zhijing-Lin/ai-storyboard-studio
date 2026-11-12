/**
 * Browser-side calls to the server's AI routes. No API keys here — the key
 * stays on the server (see lib/ai/config.ts).
 */
import type {
  ApiErrorBody,
  OutlineRequestBody,
  OutlineResponseBody,
  StoryboardRequestBody,
  StoryboardResponseBody,
} from "./apiTypes";
import type { Objective, OutlineItem, ProjectInput } from "./types";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the app server. Make sure `npm run dev` is still running, then try again.");
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // fall through to the generic message below
  }

  if (!res.ok) {
    const message = (data as ApiErrorBody | null)?.error;
    throw new Error(message || `The server returned an error (${res.status}). Please try again.`);
  }
  return data as T;
}

function projectBody(input: ProjectInput, objectives: Objective[]): OutlineRequestBody {
  return {
    courseTitle: input.courseTitle,
    smeContent: input.smeContent,
    objectives,
    targetLearners: input.targetLearners,
    duration: input.duration,
    constraints: input.constraints,
  };
}

export function requestOutline(input: ProjectInput, objectives: Objective[]) {
  return postJson<OutlineResponseBody>("/api/ai/outline", projectBody(input, objectives));
}

export function requestStoryboard(input: ProjectInput, objectives: Objective[], outline: OutlineItem[]) {
  const body: StoryboardRequestBody = {
    ...projectBody(input, objectives),
    outline: outline.map(({ title, purpose, objectiveId, summary, rationale }) => ({
      title,
      purpose,
      objectiveId,
      summary,
      rationale,
    })),
  };
  return postJson<StoryboardResponseBody>("/api/ai/storyboard", body);
}
