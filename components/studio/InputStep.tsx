"use client";

import { useState } from "react";
import { SAMPLE_INPUT } from "@/lib/storyboard/sampleData";
import { EMPTY_INPUT, type Objective, type ProjectInput } from "@/lib/storyboard/types";
import { Button, Card, Eyebrow, Field, inputClass, Notice, Spinner } from "./ui";

export function InputStep({
  input,
  objectives,
  onChange,
  onGenerate,
  busy,
  hasOutline,
  onContinue,
  aiMode,
  errorMessage,
}: {
  input: ProjectInput;
  objectives: Objective[];
  onChange: (input: ProjectInput) => void;
  onGenerate: () => void;
  busy: boolean;
  hasOutline: boolean;
  onContinue: () => void;
  aiMode: boolean;
  errorMessage: string | null;
}) {
  const [submitted, setSubmitted] = useState(false);
  const set = (key: keyof ProjectInput) => (e: { target: { value: string } }) =>
    onChange({ ...input, [key]: e.target.value });

  const errors = {
    smeContent: input.smeContent.trim() ? undefined : "Add the SME content the course should cover.",
    objectives: objectives.length ? undefined : "Add at least one learning objective (one per line).",
    targetLearners: input.targetLearners.trim() ? undefined : "Describe who the learners are.",
  };
  const valid = !errors.smeContent && !errors.objectives && !errors.targetLearners;
  const show = (msg?: string) => (submitted ? msg : undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (valid) onGenerate();
  }

  function loadSample() {
    const dirty = Object.values(input).some((v) => v.trim());
    if (dirty && !window.confirm("Replace the current input with the sample nutrition-label lesson?")) return;
    onChange(SAMPLE_INPUT);
    setSubmitted(false);
  }

  function clearAll() {
    if (!window.confirm("Clear all input fields?")) return;
    onChange(EMPTY_INPUT);
    setSubmitted(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Step 1 of 3</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-forest sm:text-5xl">
            Project input
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            Paste the SME content and learning objectives. The studio will propose an instructional sequence
            for you to review before any slides are drafted.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={clearAll}>
            Clear
          </Button>
          <Button onClick={loadSample}>Load sample lesson</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <Card className="space-y-6 p-5 sm:p-8">
          <Field label="Course title" htmlFor="courseTitle" optional>
            <input
              id="courseTitle"
              className={inputClass}
              value={input.courseTitle}
              onChange={set("courseTitle")}
              placeholder="e.g., Reading Nutrition Facts Labels"
            />
          </Field>
          <Field
            label="SME content"
            htmlFor="smeContent"
            hint="Raw notes, transcripts, or reference text from the subject-matter expert."
            error={show(errors.smeContent)}
          >
            <textarea
              id="smeContent"
              rows={12}
              className={`${inputClass} leading-relaxed`}
              value={input.smeContent}
              onChange={set("smeContent")}
              placeholder="Paste SME notes here…"
              aria-invalid={!!show(errors.smeContent)}
            />
          </Field>
          <Field
            label="Learning objectives"
            htmlFor="objectives"
            hint="One objective per line. Numbering and bullets are removed automatically."
            error={show(errors.objectives)}
          >
            <textarea
              id="objectives"
              rows={4}
              className={inputClass}
              value={input.objectives}
              onChange={set("objectives")}
              placeholder={"Identify…\nExplain…\nApply…"}
              aria-invalid={!!show(errors.objectives)}
            />
          </Field>
          {objectives.length > 0 && (
            <div className="rounded-xl border border-forest/20 bg-forest-tint/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest">
                Detected objectives ({objectives.length})
              </p>
              <ul className="mt-2.5 space-y-1.5 text-sm leading-relaxed text-ink-soft">
                {objectives.map((o) => (
                  <li key={o.id} className="flex gap-2">
                    <span className="shrink-0 font-display font-semibold text-forest">{o.id}</span>
                    <span>{o.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-6 p-5 sm:p-7">
            <Field label="Target learners" htmlFor="targetLearners" error={show(errors.targetLearners)}>
              <textarea
                id="targetLearners"
                rows={3}
                className={inputClass}
                value={input.targetLearners}
                onChange={set("targetLearners")}
                placeholder="Role, prior knowledge, context, devices…"
                aria-invalid={!!show(errors.targetLearners)}
              />
            </Field>
            <Field label="Course duration" htmlFor="duration" optional>
              <input
                id="duration"
                className={inputClass}
                value={input.duration}
                onChange={set("duration")}
                placeholder="e.g., 10–12 minutes"
              />
            </Field>
            <Field label="Constraints" htmlFor="constraints" optional hint="Accessibility, branding, LMS, tone…">
              <textarea
                id="constraints"
                rows={3}
                className={inputClass}
                value={input.constraints}
                onChange={set("constraints")}
              />
            </Field>
          </Card>

          <Card tone="sage" className="p-5 sm:p-7">
            <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-forest">What happens next</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
              {[
                aiMode ? "AI drafts a design outline from your SME content for review." : "A mock design outline is proposed for your review.",
                "You edit, reorder, and approve the sequence.",
                "Approved items become editable Storyline slides.",
              ].map((text, i) => (
                <li key={text} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-forest font-display text-xs font-bold text-paper">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? (
                  <>
                    <Spinner /> {aiMode ? "Analyzing SME content…" : "Generating mock outline…"}
                  </>
                ) : hasOutline ? (
                  aiMode ? "Regenerate outline with AI" : "Regenerate outline (mock)"
                ) : aiMode ? (
                  "Generate outline with AI"
                ) : (
                  "Generate outline (mock)"
                )}
              </Button>
              {busy && aiMode && (
                <p className="text-xs leading-5 text-ink-muted" role="status">
                  This usually takes 15–60 seconds. Your current work is kept if anything fails.
                </p>
              )}
              {errorMessage && !busy && (
                <Notice tone="error" title="Outline generation failed">
                  {errorMessage}
                </Notice>
              )}
              {hasOutline && !busy && (
                <Button onClick={onContinue}>Continue to current outline →</Button>
              )}
              {submitted && !valid && (
                <p className="text-xs font-medium text-error" role="alert">
                  Complete the required fields above to continue.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
