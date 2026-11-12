"use client";

import { useMemo, useState } from "react";
import { requestOutline, requestStoryboard } from "@/lib/storyboard/aiClient";
import { mockGenerateOutline, mockGenerateStoryboard } from "@/lib/storyboard/mockGenerator";
import {
  EMPTY_INPUT,
  type GenerationMode,
  type OutlineItem,
  type ProjectInput,
  type Slide,
  type Step,
} from "@/lib/storyboard/types";
import { parseObjectives, uid } from "@/lib/storyboard/utils";
import { Header } from "./Header";
import { InputStep } from "./InputStep";
import { OutlineStep } from "./OutlineStep";
import { StoryboardStep } from "./StoryboardStep";

const STEP_ORDER: Step[] = ["input", "outline", "storyboard"];

type GenerationError = { step: "outline" | "storyboard"; message: string } | null;

/**
 * @param mockMode When true (open the app at `/?mock=1`), generation uses the
 * offline mock generator instead of OpenAI. Mock output is always labeled.
 */
export default function StudioApp({ mockMode = false }: { mockMode?: boolean }) {
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState<ProjectInput>(EMPTY_INPUT);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [mode, setMode] = useState<GenerationMode | null>(null);
  const [busy, setBusy] = useState<null | "outline" | "storyboard">(null);
  const [error, setError] = useState<GenerationError>(null);
  const [outlineNotes, setOutlineNotes] = useState<string[]>([]);
  const [storyboardNotes, setStoryboardNotes] = useState<string[]>([]);
  const [model, setModel] = useState<string | null>(null);

  const objectives = useMemo(() => parseObjectives(input.objectives), [input.objectives]);
  const maxStepIndex = slides.length ? 2 : outline.length ? 1 : 0;

  function navigate(next: Step) {
    if (STEP_ORDER.indexOf(next) <= maxStepIndex) {
      setStep(next);
      window.scrollTo({ top: 0 });
    }
  }

  async function generateOutline() {
    if (busy) return;
    if (
      outline.length &&
      !window.confirm(
        "Generate a new outline? This replaces your current outline and storyboard, including any edits.",
      )
    ) {
      return;
    }
    setBusy("outline");
    setError(null);
    try {
      let items: OutlineItem[];
      let nextMode: GenerationMode;
      let notes: string[] = [];
      if (mockMode) {
        const result = await mockGenerateOutline(input);
        items = result.items;
        nextMode = result.mode;
        setModel(null);
      } else {
        const result = await requestOutline(input, objectives);
        items = result.items.map((item) => ({ ...item, uid: uid() }));
        nextMode = "openai";
        notes = result.missingInformation;
        setModel(result.model);
      }
      // Only replace existing work after a successful generation.
      setOutline(items);
      setMode(nextMode);
      setOutlineNotes(notes);
      setSlides([]);
      setStoryboardNotes([]);
      setStep("outline");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError({ step: "outline", message: e instanceof Error ? e.message : "Outline generation failed." });
    } finally {
      setBusy(null);
    }
  }

  async function generateStoryboard() {
    if (busy) return;
    if (
      slides.length &&
      !window.confirm(
        "Regenerate the storyboard from this outline? This replaces all current slides, including your edits.",
      )
    ) {
      return;
    }
    setBusy("storyboard");
    setError(null);
    try {
      let nextSlides: Slide[];
      let notes: string[] = [];
      if (mockMode) {
        nextSlides = await mockGenerateStoryboard(outline);
      } else {
        const result = await requestStoryboard(input, objectives, outline);
        nextSlides = result.slides.map((s) => ({ ...s, uid: uid(), reviewed: false }));
        notes = result.missingInformation;
        setModel(result.model);
      }
      setSlides(nextSlides);
      setStoryboardNotes(notes);
      setStep("storyboard");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError({ step: "storyboard", message: e instanceof Error ? e.message : "Storyboard generation failed." });
    } finally {
      setBusy(null);
    }
  }

  const aiMode = !mockMode;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream text-ink">
      <Header step={step} maxStepIndex={maxStepIndex} onNavigate={navigate} mockMode={mockMode} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {step === "input" && (
          <InputStep
            input={input}
            objectives={objectives}
            onChange={setInput}
            onGenerate={generateOutline}
            busy={busy === "outline"}
            hasOutline={outline.length > 0}
            onContinue={() => navigate("outline")}
            aiMode={aiMode}
            errorMessage={error?.step === "outline" ? error.message : null}
          />
        )}
        {step === "outline" && (
          <OutlineStep
            items={outline}
            objectives={objectives}
            mode={mode}
            onChange={setOutline}
            onBack={() => navigate("input")}
            onApprove={generateStoryboard}
            busy={busy === "storyboard"}
            hasStoryboard={slides.length > 0}
            onContinue={() => navigate("storyboard")}
            model={model}
            missingInformation={outlineNotes}
            errorMessage={error?.step === "storyboard" ? error.message : null}
          />
        )}
        {step === "storyboard" && (
          <StoryboardStep
            input={input}
            slides={slides}
            objectives={objectives}
            onChange={setSlides}
            onBack={() => navigate("outline")}
            aiMode={aiMode}
            model={model}
            missingInformation={storyboardNotes}
          />
        )}
      </main>
    </div>
  );
}
