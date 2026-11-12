import type { Objective, ProjectInput, Slide } from "./types";
import { objectiveLabel, slideIdFor } from "./utils";

const orDash = (value: string) => value.trim() || "—";

/** Indents multi-line values so they render inside a list / block in Markdown. */
function block(value: string): string {
  const text = orDash(value);
  return text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

export function buildMarkdown(
  input: ProjectInput,
  objectives: Objective[],
  slides: Slide[],
  generatedBy = "mock generation",
): string {
  const title = input.courseTitle.trim() || "Untitled Course";
  const reviewed = slides.filter((s) => s.reviewed).length;
  const lines: string[] = [
    `# Storyboard: ${title}`,
    "",
    `_Target authoring tool: Articulate Storyline 360. Draft produced with AI Storyboard Studio prototype (${generatedBy}) and reviewed by an instructional designer._`,
    "",
    "## Project Summary",
    "",
    `- **Target learners:** ${orDash(input.targetLearners)}`,
    `- **Duration:** ${orDash(input.duration)}`,
    `- **Constraints:** ${orDash(input.constraints)}`,
    `- **Slides:** ${slides.length} (${reviewed} marked reviewed)`,
    "",
    "## Learning Objectives",
    "",
    ...(objectives.length ? objectives.map((o) => `- **${o.id}:** ${o.text}`) : ["- —"]),
    "",
    "## Slides",
    "",
  ];

  slides.forEach((slide, i) => {
    lines.push(
      `### ${slideIdFor(i)} — ${orDash(slide.title)}`,
      "",
      `- **Slide ID:** ${slideIdFor(i)}`,
      `- **Learning Objective:** ${objectiveLabel(slide.objectiveId, objectives)}`,
      `- **Slide Type:** ${slide.slideType}`,
      `- **Review status:** ${slide.reviewed ? "Reviewed" : "Needs review"}`,
      "",
      "**On-Screen Text**",
      "",
      block(slide.onScreenText),
      "",
      "**Narration**",
      "",
      block(slide.narration),
      "",
      "**Visual Notes**",
      "",
      block(slide.visualNotes),
      "",
      "**Interaction**",
      "",
      block(slide.interaction),
      "",
      "**Feedback**",
      "",
      block(slide.feedback),
      "",
      "**Storyline Developer Notes**",
      "",
      block(slide.devNotes),
      "",
      "---",
      "",
    );
  });

  return lines.join("\n");
}
