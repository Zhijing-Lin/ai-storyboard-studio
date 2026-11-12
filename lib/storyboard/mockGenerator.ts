/**
 * MOCK GENERATION — no AI model is called.
 * Returns curated sample output for the built-in nutrition lesson, or a
 * template-based draft built from the user's own objectives. A short delay
 * simulates request latency so loading states can be evaluated.
 */
import { SAMPLE_INPUT, SAMPLE_OUTLINE, SAMPLE_SLIDE_CONTENT } from "./sampleData";
import {
  ALL_OBJECTIVES,
  type GenerationMode,
  type OutlineItem,
  type ProjectInput,
  type Purpose,
  type Slide,
  type SlideContent,
  type SlideType,
} from "./types";
import { parseObjectives, truncate, uid } from "./utils";

const MOCK_DELAY_MS = 900;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function isSampleInput(input: ProjectInput): boolean {
  return input.smeContent.trim() === SAMPLE_INPUT.smeContent.trim();
}

export async function mockGenerateOutline(
  input: ProjectInput,
): Promise<{ items: OutlineItem[]; mode: GenerationMode }> {
  await wait(MOCK_DELAY_MS);

  if (isSampleInput(input)) {
    return {
      mode: "curated-sample",
      items: SAMPLE_OUTLINE.map((item) => ({ ...item, uid: uid() })),
    };
  }

  const objectives = parseObjectives(input.objectives);
  const paragraphs = input.smeContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const excerpt = (i: number) =>
    paragraphs.length ? truncate(paragraphs[i % paragraphs.length], 160) : "";
  const audience = input.targetLearners.trim() || "the target learners";

  const items: OutlineItem[] = [
    {
      uid: uid(),
      title: `Introduction${input.courseTitle ? `: ${input.courseTitle}` : ""}`,
      purpose: "Instruction",
      objectiveId: ALL_OBJECTIVES,
      summary: `Hook ${audience} with why this topic matters to them and preview the objectives.`,
      rationale:
        "Gaining attention and stating objectives helps learners orient and see relevance (Gagné events 1–2).",
    },
  ];

  objectives.forEach((o, i) => {
    items.push({
      uid: uid(),
      title: `Explain: ${truncate(o.text, 60)}`,
      purpose: "Instruction",
      objectiveId: o.id,
      summary: `Present the key concepts needed for ${o.id}.${
        excerpt(i) ? ` Draw on SME content: “${excerpt(i)}”` : ""
      }`,
      rationale: "Direct instruction establishes the knowledge learners need before practice.",
    });
    items.push({
      uid: uid(),
      title: `Practice: ${truncate(o.text, 60)}`,
      purpose: "Practice",
      objectiveId: o.id,
      summary: `Learners apply ${o.id} in a short, realistic activity with immediate feedback.`,
      rationale: "Retrieval practice with corrective feedback strengthens learning before assessment.",
    });
  });

  items.push(
    {
      uid: uid(),
      title: "Knowledge check",
      purpose: "Assessment",
      objectiveId: ALL_OBJECTIVES,
      summary: `Graded questions aligned to ${
        objectives.length ? objectives.map((o) => o.id).join(", ") : "each objective"
      }.`,
      rationale: "Aligned assessment verifies each objective was met.",
    },
    {
      uid: uid(),
      title: "Summary and next steps",
      purpose: "Instruction",
      objectiveId: ALL_OBJECTIVES,
      summary: "Recap key takeaways and suggest how to apply them on the job.",
      rationale: "A closing recap and job aid support retention and transfer.",
    },
  );

  return { mode: "template", items };
}

const TYPE_BY_PURPOSE: Record<Purpose, SlideType> = {
  Instruction: "Content",
  Practice: "Practice Activity",
  Assessment: "Graded Assessment",
};

function templateContent(item: OutlineItem): SlideContent {
  const base = { slideType: TYPE_BY_PURPOSE[item.purpose] };
  switch (item.purpose) {
    case "Practice":
      return {
        ...base,
        onScreenText: `${item.title}\n[Scenario or prompt for the learner]\n[Answer options]`,
        narration: `Now try it yourself. ${item.summary}`,
        visualNotes: "Realistic workplace or everyday context image; clear answer targets.",
        interaction: "Multiple choice or drag-and-drop. Two attempts.",
        feedback:
          "Correct: [Reinforce why the answer is right.]\nIncorrect: [Hint pointing back to the key concept.] Try again.",
        devNotes:
          "Ungraded freeform question with feedback layers. Allow 2 attempts; show correct answer after final attempt.",
      };
    case "Assessment":
      return {
        ...base,
        onScreenText: "Knowledge check\n[Question 1]\n[Question 2]\n[Question 3]",
        narration: "Let’s check what you learned. Choose the best answer for each question.",
        visualNotes: "Clean, distraction-free question layout.",
        interaction: "Graded multiple-choice questions, one per objective.",
        feedback: "Correct / incorrect feedback with a one-line explanation per question.",
        devNotes:
          "Build as graded question slides in a question bank. Add a results slide and configure LMS reporting.",
      };
    default:
      return {
        ...base,
        onScreenText: `${item.title}\n• ${item.summary}`,
        narration: item.summary,
        visualNotes: `Supporting image or diagram illustrating “${item.title}”.`,
        interaction: "Learner-paced; Next button.",
        feedback: "N/A",
        devNotes: "Sync on-screen text animations to narration cue points. Add alt text to all images.",
      };
  }
}

export async function mockGenerateStoryboard(outline: OutlineItem[]): Promise<Slide[]> {
  await wait(MOCK_DELAY_MS);
  return outline.map((item) => {
    const curated = item.sampleKey ? SAMPLE_SLIDE_CONTENT[item.sampleKey] : undefined;
    // If the user changed an item's purpose, curated content may no longer fit.
    const sampleStillFits =
      curated && SAMPLE_OUTLINE.some((s) => s.sampleKey === item.sampleKey && s.purpose === item.purpose);
    return {
      uid: uid(),
      title: item.title,
      objectiveId: item.objectiveId,
      reviewed: false,
      ...(sampleStillFits && curated ? curated : templateContent(item)),
    };
  });
}

export function blankSlide(): Slide {
  return {
    uid: uid(),
    title: "New slide",
    objectiveId: ALL_OBJECTIVES,
    slideType: "Content",
    onScreenText: "",
    narration: "",
    visualNotes: "",
    interaction: "",
    feedback: "",
    devNotes: "",
    reviewed: false,
  };
}
