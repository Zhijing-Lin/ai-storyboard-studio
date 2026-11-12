/**
 * MOCK DATA — fictional sample lesson used by the prototype.
 * The organization (FreshStart Community Wellness) and SME are fictional.
 */
import { ALL_OBJECTIVES, type OutlineItem, type ProjectInput, type SlideContent } from "./types";

export const SAMPLE_INPUT: ProjectInput = {
  courseTitle: "Reading Nutrition Facts Labels",
  smeContent: `SME notes from Maya Chen, RD (fictional) for the FreshStart Community Wellness Program (fictional).

Serving size is the first thing to check. Every number on the label refers to ONE serving, not the whole package. If you eat two servings, double every number, including calories and % Daily Value.

Servings per container tells you how many servings are in the package. A 20 oz bottle of juice drink may list 2.5 servings.

Calories measure the energy in one serving. Look at calories relative to the serving size you actually eat.

% Daily Value (%DV) shows how much a nutrient in one serving contributes to a total daily diet, based on 2,000 calories a day. Quick rule: 5% DV or less is low; 20% DV or more is high.

Nutrients to get less of: saturated fat, sodium, and added sugars. Nutrients to get more of: dietary fiber, vitamin D, calcium, iron, and potassium.

Comparing products: first make sure serving sizes are similar, then compare %DV for the nutrients that matter for your goal.

Common learner mistakes: assuming the whole package is one serving; confusing grams with %DV; focusing only on calories.`,
  objectives: `Identify the serving size and servings per container on a Nutrition Facts label.
Use % Daily Value and the 5/20 rule to judge whether a food is high or low in a nutrient.
Compare two product labels to choose the option that better fits a stated health goal.`,
  targetLearners:
    "Adults in a community wellness program; mixed health literacy; many shop for families; limited time; access on phones and laptops.",
  duration: "10–12 minutes",
  constraints:
    "Build in Articulate Storyline 360. WCAG 2.1 AA, closed captions for all narration, plain language (grade 6–8 reading level), no external links.",
};

type SampleOutlineItem = Omit<OutlineItem, "uid">;

export const SAMPLE_OUTLINE: SampleOutlineItem[] = [
  {
    sampleKey: "welcome",
    title: "Welcome: What is on your label?",
    purpose: "Instruction",
    objectiveId: ALL_OBJECTIVES,
    summary:
      "Open with a relatable grocery-aisle moment, explain why labels matter for family shopping, and preview the three objectives.",
    rationale:
      "Gaining attention with a familiar scenario and stating objectives up front helps adult learners see immediate relevance (Gagné events 1–2; andragogy).",
  },
  {
    sampleKey: "serving",
    title: "Start with serving size",
    purpose: "Instruction",
    objectiveId: "LO1",
    summary:
      "Locate serving size and servings per container on an annotated label; show that all numbers refer to one serving.",
    rationale:
      "Serving size is the foundation for interpreting every other value, and the SME flags it as the most common mistake.",
  },
  {
    sampleKey: "servingPractice",
    title: "Practice: How much are you really eating?",
    purpose: "Practice",
    objectiveId: "LO1",
    summary:
      "Learners see a juice drink with 2.5 servings and calculate calories for the whole bottle.",
    rationale:
      "Immediate application with feedback targets the 'whole package = one serving' misconception before moving on.",
  },
  {
    sampleKey: "dv",
    title: "Decode % Daily Value: the 5/20 rule",
    purpose: "Instruction",
    objectiveId: "LO2",
    summary:
      "Explain %DV, introduce the 5/20 rule, and group nutrients to get less of vs. more of.",
    rationale:
      "A simple heuristic reduces cognitive load for learners with mixed health literacy and avoids math-heavy explanations.",
  },
  {
    sampleKey: "dvPractice",
    title: "Practice: High or low?",
    purpose: "Practice",
    objectiveId: "LO2",
    summary: "Learners sort nutrient values from a label into Low (≤5%), Moderate, or High (≥20%).",
    rationale:
      "Sorting gives quick, repeated retrieval of the 5/20 rule with corrective feedback on each item.",
  },
  {
    sampleKey: "compare",
    title: "Scenario: Choose a cereal for Rosa",
    purpose: "Practice",
    objectiveId: "LO3",
    summary:
      "Branching scenario: help a parent pick between two cereals to lower added sugar while keeping fiber high.",
    rationale:
      "A realistic decision integrates LO1 and LO2 skills and mirrors the transfer context (shopping for family).",
  },
  {
    sampleKey: "check",
    title: "Knowledge check",
    purpose: "Assessment",
    objectiveId: ALL_OBJECTIVES,
    summary: "Three graded multiple-choice questions, one per objective.",
    rationale:
      "Aligned assessment confirms each objective was met and provides data for the LMS completion rule.",
  },
  {
    sampleKey: "summary",
    title: "Summary and label checklist",
    purpose: "Instruction",
    objectiveId: ALL_OBJECTIVES,
    summary: "Recap the three-step label check and offer a printable checklist for shopping.",
    rationale: "A job aid supports transfer to real grocery trips after the course ends.",
  },
];

export const SAMPLE_SLIDE_CONTENT: Record<string, SlideContent> = {
  welcome: {
    slideType: "Title / Intro",
    onScreenText:
      "Reading Nutrition Facts Labels\n\nIn about 10 minutes, you will be able to:\n• Find the serving size\n• Use the 5/20 rule\n• Compare two foods",
    narration:
      "You are in the cereal aisle with two boxes in your hands. Which one is better for your family? The Nutrition Facts label can tell you — once you know where to look. Let’s learn three quick checks.",
    visualNotes:
      "Illustrated grocery aisle; a diverse adult holding two cereal boxes. Warm, friendly style. Course title over a semi-transparent panel.",
    interaction: "Start button.",
    feedback: "N/A",
    devNotes:
      "Start button triggers narration and timeline. Add CC toggle and volume in player. Alt text on hero image.",
  },
  serving: {
    slideType: "Content",
    onScreenText:
      "Step 1: Check the serving size\n• Serving size = the amount the numbers are based on\n• Servings per container = how many servings are in the package\n• Eat 2 servings? Double everything.",
    narration:
      "Start at the top of the label. The serving size tells you the amount all the numbers are based on. Servings per container tells you how many servings are in the whole package. If you eat two servings, you double everything — calories and nutrients too.",
    visualNotes:
      "Annotated Nutrition Facts label. Highlight serving size and servings per container in sequence, synced to narration.",
    interaction: "Learner-paced. Optional hotspots on each highlighted area reveal a short definition.",
    feedback: "N/A",
    devNotes:
      "Use cue points for highlight animations. Hotspots open layers; ensure keyboard focus order follows label order. Next button enabled after narration ends.",
  },
  servingPractice: {
    slideType: "Practice Activity",
    onScreenText:
      "This juice drink has 110 calories per serving and 2.5 servings per bottle.\nHow many calories are in the whole bottle?",
    narration:
      "Many people drink a whole bottle at once. Use the label to figure out how many calories are in the entire bottle.",
    visualNotes: "Juice bottle beside its label; serving info highlighted.",
    interaction:
      "Multiple choice (single select): 110 / 220 / 275 (correct) / 2.5. Two attempts.",
    feedback:
      "Correct: Yes — 110 × 2.5 = 275 calories for the whole bottle.\nIncorrect (1st): Look at servings per container. Try again.\nIncorrect (final): The bottle has 2.5 servings, so 110 × 2.5 = 275 calories.",
    devNotes:
      "Ungraded freeform MC, not included in results. Feedback layers with Continue button. Use variable PracticeAttempts if tracking.",
  },
  dv: {
    slideType: "Content",
    onScreenText:
      "Step 2: Use % Daily Value\n• 5% DV or less = LOW\n• 20% DV or more = HIGH\nGet less of: saturated fat, sodium, added sugars\nGet more of: fiber, vitamin D, calcium, iron, potassium",
    narration:
      "Percent Daily Value shows how much one serving adds to a full day of eating. You don’t need to do math — just remember five and twenty. Five percent or less is low. Twenty percent or more is high. Aim low for saturated fat, sodium, and added sugars, and high for fiber and key vitamins and minerals.",
    visualNotes:
      "%DV column highlighted. Simple 5/20 gauge graphic (low / high zones) — use labels and patterns, not color alone.",
    interaction: "Learner-paced; tabs for “Get less of” and “Get more of”.",
    feedback: "N/A",
    devNotes:
      "Two tab buttons show layers; set visited states. Gauge must have text labels for color-blind accessibility.",
  },
  dvPractice: {
    slideType: "Practice Activity",
    onScreenText:
      "Sort each value: Low (5% or less), In between, or High (20% or more)\n• Sodium 3%\n• Fiber 22%\n• Added sugars 24%\n• Calcium 10%",
    narration: "Drag each nutrient to the right group using the 5/20 rule.",
    visualNotes: "Three drop zones with labels; draggable nutrient cards styled like label rows.",
    interaction: "Drag-and-drop (freeform). Keyboard-accessible alternative: dropdown per item.",
    feedback:
      "Correct: Nice — Sodium is low, Fiber and Added sugars are high, Calcium is in between.\nIncorrect: Remember: 5% or less is low, 20% or more is high. Check the highlighted items and try again.",
    devNotes:
      "Freeform drag-and-drop with Submit; allow 2 attempts; snap items back on incorrect. Provide accessible alternative layer.",
  },
  compare: {
    slideType: "Scenario",
    onScreenText:
      "Rosa wants a breakfast cereal for her kids with less added sugar and more fiber.\nCereal A: Added sugars 24% DV, Fiber 4% DV\nCereal B: Added sugars 8% DV, Fiber 18% DV\nWhich should she choose?",
    narration:
      "Rosa is comparing two cereals. Both have the same serving size. She wants less added sugar and more fiber. Which one fits her goal?",
    visualNotes:
      "Rosa character (adult, casual) in store; two labels side by side with matching serving sizes highlighted.",
    interaction: "Branching choice: Cereal A / Cereal B. Each choice opens a consequence layer.",
    feedback:
      "Cereal B: Great choice — lower added sugars and much more fiber, with the same serving size.\nCereal A: Cereal A is high in added sugars (24%) and low in fiber (4%). Look again at the 5/20 rule.",
    devNotes:
      "Two consequence layers; Cereal A path offers Try Again that resets slide. Character states: thinking / happy / concerned.",
  },
  check: {
    slideType: "Graded Assessment",
    onScreenText:
      "Q1. A bag of chips lists 3 servings. You eat the whole bag. How do you find the total calories? (LO1)\nQ2. A soup has 35% DV sodium. Is that high or low? (LO2)\nQ3. Which yogurt better fits a “more calcium” goal: 8% DV or 25% DV calcium? (LO3)",
    narration: "Let’s check what you learned. Choose the best answer for each question.",
    visualNotes: "Clean question layout; small label snippet per question.",
    interaction: "Three graded multiple-choice questions, one per slide in Storyline.",
    feedback:
      "Correct / incorrect feedback after each question with a one-line explanation referencing the 5/20 rule or serving size.",
    devNotes:
      "Build as 3 graded MC slides in a question bank, randomize answer order. Results slide: pass at 80% (3/3 or 2/3 → configure per LMS). Report to LMS via SCORM 1.2.",
  },
  summary: {
    slideType: "Summary",
    onScreenText:
      "Your 3-step label check\n1. Serving size first\n2. Use 5/20 for %DV\n3. Compare like with like\n\nDownload: Label Checklist (PDF)",
    narration:
      "Next time you shop, remember three steps: check the serving size, use the five-twenty rule, and compare foods with similar serving sizes. Download the checklist to take with you.",
    visualNotes: "Three numbered icons; checklist thumbnail.",
    interaction: "Download checklist button; Exit course button.",
    feedback: "N/A",
    devNotes:
      "Attach checklist PDF as resource (no external links per constraints). Exit triggers course completion if results passed.",
  },
};
