import "server-only";
import { generateText, Output } from "ai";
import type { z } from "zod";
import type { OutlineResponseBody, StoryboardResponseBody } from "@/lib/storyboard/apiTypes";
import { getModel, getModelId, getProviderOptions, LIMITS } from "./config";
import { buildOutlinePrompt, OUTLINE_INSTRUCTIONS } from "./prompts/outlinePrompt";
import { buildStoryboardPrompt, STORYBOARD_INSTRUCTIONS } from "./prompts/storyboardPrompt";
import {
  buildOutlineOutputSchema,
  buildStoryboardOutputSchema,
  type OutlineRequest,
  type StoryboardRequest,
} from "./schemas";

/** Thrown when the model returns valid JSON that is still unusable (e.g. empty). */
export class UnusableOutputError extends Error {
  name = "UnusableOutputError";
}

function logUsage(step: string, usage: { inputTokens?: number; outputTokens?: number } | undefined) {
  // Token counts only — useful for cost tracking; contains no user content or secrets.
  console.info(`[ai:${step}] model=${getModelId()} input_tokens=${usage?.inputTokens ?? "?"} output_tokens=${usage?.outputTokens ?? "?"}`);
}

const tidy = (s: string) => s.trim();
const tidyList = (list: string[]) => list.map(tidy).filter(Boolean).slice(0, 25);

export async function generateOutline(req: OutlineRequest): Promise<OutlineResponseBody> {
  const result = await generateText({
    model: getModel(),
    instructions: OUTLINE_INSTRUCTIONS,
    prompt: buildOutlinePrompt(req),
    output: Output.object({
      name: "design_outline",
      schema: buildOutlineOutputSchema(req.objectives.map((o) => o.id)),
    }),
    maxOutputTokens: LIMITS.outline.maxOutputTokens,
    timeout: LIMITS.outline.timeoutMs,
    maxRetries: 1,
    providerOptions: getProviderOptions(),
  });
  logUsage("outline", result.usage);

  const { items, missingInformation } = result.output;
  if (items.length === 0) throw new UnusableOutputError("The AI returned an empty outline. Please try again.");
  if (items.length > LIMITS.outlineItems) {
    throw new UnusableOutputError(`The AI returned ${items.length} outline items (limit ${LIMITS.outlineItems}). Please try again.`);
  }

  return {
    model: getModelId(),
    missingInformation: tidyList(missingInformation),
    items: items.map((item) => ({
      title: tidy(item.title),
      purpose: item.purpose,
      objectiveId: item.objectiveId,
      summary: tidy(item.summary),
      rationale: tidy(item.rationale),
    })),
  };
}

// ---------------------------------------------------------------------------
// Storyboard
// ---------------------------------------------------------------------------

type StoryboardOutput = z.infer<ReturnType<typeof buildStoryboardOutputSchema>>;
type GeneratedSlide = StoryboardOutput["outlineItems"][number]["slides"][number];
type OutlineEntry = StoryboardRequest["outline"][number];

/** Loose title comparison: tolerates case, punctuation, and light rewording. */
function titlesMatch(a: string, b: string): boolean {
  const words = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const wa = words(a);
  const wb = new Set(words(b));
  if (wa.length === 0 || wb.size === 0) return a.trim().toLowerCase() === b.trim().toLowerCase();
  const shared = wa.filter((w) => wb.has(w)).length;
  return shared / Math.min(wa.length, wb.size) >= 0.6;
}

/**
 * Hard check: every approved outline item maps to exactly one group with at
 * least one slide, no extra/renumbered items, and titles that match.
 * Returns the problems found (empty array = valid).
 */
function findCoverageProblems(groups: StoryboardOutput["outlineItems"], outline: OutlineEntry[]): string[] {
  const problems: string[] = [];
  outline.forEach((item, i) => {
    const n = i + 1;
    const matches = groups.filter((g) => g.outlineItemNumber === n);
    if (matches.length === 0) {
      problems.push(`Outline item ${n} (“${item.title}”) is missing.`);
    } else if (matches.length > 1) {
      problems.push(`Outline item ${n} (“${item.title}”) appears ${matches.length} times; put all of its slides in one entry.`);
    } else if (matches[0].slides.length === 0) {
      problems.push(`Outline item ${n} (“${item.title}”) has no slides.`);
    } else if (!titlesMatch(matches[0].outlineItemTitle, item.title)) {
      problems.push(
        `Entry ${n} is titled “${matches[0].outlineItemTitle}” but approved item ${n} is “${item.title}” — the numbering has shifted.`,
      );
    }
  });
  groups
    .filter((g) => g.outlineItemNumber < 1 || g.outlineItemNumber > outline.length)
    .forEach((g) =>
      problems.push(`Entry numbered ${g.outlineItemNumber} (“${g.outlineItemTitle}”) does not match any approved outline item; do not add items.`),
    );
  return problems;
}

/** Wording that signals an undecided build ("either one slide or three", "if preferred"). */
const UNDECIDED = /\beither\b[^.\n]*\bor\b|\bif preferred\b|\boptionally\b|\bcould (?:also )?be built\b|\bor alternatively\b/i;
const QUESTION_TYPES = new Set(["Practice Activity", "Knowledge Check", "Graded Assessment"]);

/**
 * Soft checks: flags (never edits) slides whose grading, alignment, or build
 * description is inconsistent, for the existing "Review before export" list.
 */
function reviewNotes(groups: StoryboardOutput["outlineItems"], outline: OutlineEntry[]): string[] {
  const notes: string[] = [];
  let index = 0;
  for (const group of groups) {
    const purpose = outline[group.outlineItemNumber - 1]?.purpose;
    const hasGradedQuestion = group.slides.some((s) => s.slideType === "Graded Assessment" && !/^results/i.test(s.title.trim()));
    for (const s of group.slides) {
      index += 1;
      const id = `S${String(index).padStart(2, "0")}`;
      const isResults = /^results/i.test(s.title.trim());
      if (purpose === "Assessment" && (s.slideType === "Knowledge Check" || s.slideType === "Practice Activity")) {
        notes.push(`${id}: slide in a graded Assessment item is typed “${s.slideType}” (ungraded) — confirm whether it should be scored.`);
      }
      if (purpose !== "Assessment" && s.slideType === "Graded Assessment") {
        notes.push(`${id}: graded slide inside an ungraded ${purpose ?? ""} item — confirm scoring.`);
      }
      if (isResults && !hasGradedQuestion) {
        notes.push(`${id}: Results Slide has no graded questions in its item to track.`);
      }
      if (!QUESTION_TYPES.has(s.slideType)) continue;
      if (s.objectiveId === "all" && !isResults) {
        notes.push(`${id}: question/practice slide is not linked to a specific objective — assign the objective it actually measures.`);
      }
      if (!isResults && /^n\/?a$/i.test(s.feedback.trim())) {
        notes.push(`${id}: practice/question slide has no feedback — add correct and incorrect feedback.`);
      }
      if (UNDECIDED.test(s.interaction) || UNDECIDED.test(s.devNotes)) {
        notes.push(`${id}: interaction or developer notes still offer alternative builds — choose one.`);
      }
    }
  }
  return notes;
}

async function callStoryboardModel(req: StoryboardRequest, repairNotes: string[]) {
  const repair = repairNotes.length
    ? `\n\nYOUR PREVIOUS RESPONSE FAILED VALIDATION and was discarded:\n${repairNotes.map((p) => `- ${p}`).join("\n")}\nReturn the COMPLETE storyboard again with exactly ${req.outline.length} outlineItems entries, numbered 1–${req.outline.length} in the approved order, each with at least one slide.`
    : "";
  const result = await generateText({
    model: getModel(),
    instructions: STORYBOARD_INSTRUCTIONS,
    prompt: buildStoryboardPrompt(req) + repair,
    output: Output.object({
      name: "storyboard",
      schema: buildStoryboardOutputSchema(req.objectives.map((o) => o.id)),
    }),
    maxOutputTokens: LIMITS.storyboard.maxOutputTokens,
    timeout: LIMITS.storyboard.timeoutMs,
    maxRetries: 1,
    providerOptions: getProviderOptions(),
  });
  logUsage(repairNotes.length ? "storyboard-repair" : "storyboard", result.usage);
  return result.output;
}

/**
 * Generates the storyboard and verifies every approved outline item is present.
 * One automatic repair attempt is made; if items are still missing, an error is
 * returned instead of an incomplete storyboard.
 */
export async function generateStoryboard(req: StoryboardRequest): Promise<StoryboardResponseBody> {
  let output = await callStoryboardModel(req, []);
  let problems = findCoverageProblems(output.outlineItems, req.outline);

  if (problems.length) {
    console.warn(`[ai:storyboard] coverage check failed (${problems.length} problem(s)); retrying once`);
    output = await callStoryboardModel(req, problems);
    problems = findCoverageProblems(output.outlineItems, req.outline);
  }

  if (problems.length) {
    const shown = problems.slice(0, 3).join(" ");
    const more = problems.length > 3 ? ` (+${problems.length - 3} more)` : "";
    throw new UnusableOutputError(
      `The AI storyboard did not cover every approved outline item, so it was not applied. ${shown}${more} Your outline is unchanged — please try again.`,
    );
  }

  // Valid: order groups by approved item number, then flatten for the editor.
  const groups = [...output.outlineItems].sort((a, b) => a.outlineItemNumber - b.outlineItemNumber);
  const slides: GeneratedSlide[] = groups.flatMap((g) => g.slides);
  if (slides.length > LIMITS.maxSlides) {
    throw new UnusableOutputError(`The AI returned ${slides.length} slides (limit ${LIMITS.maxSlides}). Please try again.`);
  }

  return {
    model: getModelId(),
    missingInformation: [...reviewNotes(groups, req.outline), ...tidyList(output.missingInformation)],
    slides: slides.map((s) => ({
      title: tidy(s.title),
      objectiveId: s.objectiveId,
      slideType: s.slideType,
      onScreenText: tidy(s.onScreenText),
      narration: tidy(s.narration),
      visualNotes: tidy(s.visualNotes),
      interaction: tidy(s.interaction),
      feedback: tidy(s.feedback),
      devNotes: tidy(s.devNotes),
    })),
  };
}
