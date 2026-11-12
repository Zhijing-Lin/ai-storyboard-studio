export const PURPOSES = ["Instruction", "Practice", "Assessment"] as const;
export type Purpose = (typeof PURPOSES)[number];

export const SLIDE_TYPES = [
  "Title / Intro",
  "Content",
  "Scenario",
  "Practice Activity",
  "Knowledge Check", // ungraded check of understanding (not scored)
  "Graded Assessment", // scored question or Results Slide
  "Summary",
] as const;
export type SlideType = (typeof SLIDE_TYPES)[number];

/** Sentinel objective id meaning "covers all objectives". */
export const ALL_OBJECTIVES = "all";

export type Step = "input" | "outline" | "storyboard";

/** How the output was produced — shown to the user for transparency. */
export type GenerationMode = "curated-sample" | "template" | "openai";

export interface ProjectInput {
  courseTitle: string;
  smeContent: string;
  objectives: string;
  targetLearners: string;
  duration: string;
  constraints: string;
}

export interface Objective {
  id: string;
  text: string;
}

export interface OutlineItem {
  uid: string;
  title: string;
  purpose: Purpose;
  objectiveId: string;
  summary: string;
  rationale: string;
  /** Links an item to curated sample slide content. */
  sampleKey?: string;
}

export interface Slide {
  uid: string;
  title: string;
  objectiveId: string;
  slideType: SlideType;
  onScreenText: string;
  narration: string;
  visualNotes: string;
  interaction: string;
  feedback: string;
  devNotes: string;
  reviewed: boolean;
}

export type SlideContent = Pick<
  Slide,
  | "slideType"
  | "onScreenText"
  | "narration"
  | "visualNotes"
  | "interaction"
  | "feedback"
  | "devNotes"
>;

export const EMPTY_INPUT: ProjectInput = {
  courseTitle: "",
  smeContent: "",
  objectives: "",
  targetLearners: "",
  duration: "",
  constraints: "",
};
