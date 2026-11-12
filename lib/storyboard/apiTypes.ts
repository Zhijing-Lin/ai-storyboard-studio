/**
 * Shapes exchanged between the browser and the /api/ai/* route handlers.
 * Shared by client and server; contains no secrets and no server code.
 */
import type { Objective, OutlineItem, Purpose, Slide } from "./types";

export interface OutlineRequestBody {
  courseTitle: string;
  smeContent: string;
  objectives: Objective[];
  targetLearners: string;
  duration: string;
  constraints: string;
}

export interface StoryboardRequestBody extends OutlineRequestBody {
  outline: { title: string; purpose: Purpose; objectiveId: string; summary: string; rationale: string }[];
}

export interface OutlineResponseBody {
  items: Omit<OutlineItem, "uid" | "sampleKey">[];
  missingInformation: string[];
  model: string;
}

export interface StoryboardResponseBody {
  slides: Omit<Slide, "uid" | "reviewed">[];
  missingInformation: string[];
  model: string;
}

export interface ApiErrorBody {
  error: string;
}
