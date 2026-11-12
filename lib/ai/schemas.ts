import "server-only";
import { z } from "zod";
import { ALL_OBJECTIVES, PURPOSES, SLIDE_TYPES } from "@/lib/storyboard/types";
import { LIMITS } from "./config";

// ---------------------------------------------------------------------------
// Request validation (what the browser sends)
// ---------------------------------------------------------------------------

const text = (label: string, max: number, required = false) => {
  const base = z.string({ error: `${label} must be text.` }).trim().max(max, {
    error: `${label} is too long (max ${max.toLocaleString()} characters).`,
  });
  return required ? base.min(1, { error: `${label} is required.` }) : base;
};

export const outlineRequestSchema = z.object({
  courseTitle: text("Course title", LIMITS.courseTitle),
  smeContent: text("SME content", LIMITS.smeContent, true),
  objectives: z
    .array(
      z.object({
        id: z.string().regex(/^LO\d{1,2}$/, { error: "Invalid objective id." }),
        text: text("Learning objective", LIMITS.objectiveText, true),
      }),
    )
    .min(1, { error: "Add at least one learning objective." })
    .max(LIMITS.objectives, { error: `Use at most ${LIMITS.objectives} learning objectives.` }),
  targetLearners: text("Target learners", LIMITS.targetLearners, true),
  duration: text("Course duration", LIMITS.duration),
  constraints: text("Constraints", LIMITS.constraints),
});

export const storyboardRequestSchema = outlineRequestSchema.extend({
  outline: z
    .array(
      z.object({
        title: text("Outline item title", LIMITS.outlineTitle, true),
        purpose: z.enum(PURPOSES),
        objectiveId: z.string().max(10),
        summary: text("Outline item summary", LIMITS.outlineSummary),
        rationale: text("Outline item rationale", LIMITS.outlineRationale),
      }),
    )
    .min(1, { error: "The approved outline is empty." })
    .max(LIMITS.outlineItems, { error: `The outline can have at most ${LIMITS.outlineItems} items.` }),
});

export type OutlineRequest = z.infer<typeof outlineRequestSchema>;
export type StoryboardRequest = z.infer<typeof storyboardRequestSchema>;

/** Turns the first Zod issue into a readable message. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request.";
}

// ---------------------------------------------------------------------------
// Model output schemas (sent to OpenAI as strict JSON schema)
// OpenAI strict mode: every property required, no .optional(); keep schemas simple
// and enforce counts/lengths after generation.
// ---------------------------------------------------------------------------

function objectiveEnum(objectiveIds: string[]) {
  return z
    .enum([ALL_OBJECTIVES, ...objectiveIds] as [string, ...string[]])
    .describe(`Exactly one of the provided objective ids, or "${ALL_OBJECTIVES}" when the item serves every objective.`);
}

const missingInformation = z
  .array(z.string())
  .describe(
    "Specific gaps, ambiguities, or conflicts in the SME content that the instructional designer should resolve with the SME. Empty array if none.",
  );

export function buildOutlineOutputSchema(objectiveIds: string[]) {
  return z.object({
    items: z
      .array(
        z.object({
          title: z.string().describe("Short, learner-facing activity title."),
          purpose: z.enum(PURPOSES),
          objectiveId: objectiveEnum(objectiveIds),
          summary: z.string().describe("1–3 sentences: the specific SME content covered and what learners do."),
          rationale: z.string().describe("1–2 sentences naming the learning-science principle and why it fits."),
        }),
      )
      .describe("The instructional sequence, in delivery order."),
    missingInformation,
  });
}

/**
 * Slides are grouped by approved outline item so that every item must be
 * answered explicitly — an omitted item becomes a detectable missing group
 * instead of disappearing inside a flat slide list.
 */
export function buildStoryboardOutputSchema(objectiveIds: string[]) {
  const slide = z.object({
    title: z.string(),
    objectiveId: objectiveEnum(objectiveIds),
    slideType: z.enum(SLIDE_TYPES),
    onScreenText: z.string(),
    narration: z.string(),
    visualNotes: z.string(),
    interaction: z.string(),
    feedback: z.string(),
    devNotes: z.string(),
  });
  return z.object({
    outlineItems: z
      .array(
        z.object({
          outlineItemNumber: z.number().int().describe("The approved outline item's number (1, 2, 3, … in order)."),
          outlineItemTitle: z.string().describe("The approved outline item's title, copied exactly."),
          slides: z.array(slide).describe("One or more slides implementing this outline item, in delivery order."),
        }),
      )
      .describe("Exactly one entry per approved outline item, in the approved order."),
    missingInformation,
  });
}
