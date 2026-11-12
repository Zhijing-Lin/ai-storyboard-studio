"use client";

import { useState } from "react";
import { blankSlide } from "@/lib/storyboard/mockGenerator";
import {
  ALL_OBJECTIVES,
  SLIDE_TYPES,
  type Objective,
  type ProjectInput,
  type Slide,
  type SlideType,
} from "@/lib/storyboard/types";
import { moveItem, slideIdFor, uid } from "@/lib/storyboard/utils";
import { ExportDialog } from "./ExportDialog";
import { ObjectiveSelect } from "./OutlineStep";
import { Button, Card, Eyebrow, Field, inputClass, MockLabel, Notice } from "./ui";

type TextField = "onScreenText" | "narration" | "visualNotes" | "interaction" | "feedback" | "devNotes";

const TEXT_FIELDS: { key: TextField; label: string; hint: string; rows: number }[] = [
  { key: "onScreenText", label: "On-Screen Text", hint: "Exactly what learners read on the slide.", rows: 6 },
  { key: "narration", label: "Narration", hint: "Voice-over script. Also used for closed captions.", rows: 6 },
  { key: "visualNotes", label: "Visual Notes", hint: "Imagery, layout, characters, animation.", rows: 4 },
  { key: "interaction", label: "Interaction", hint: "What the learner does on this slide.", rows: 4 },
  { key: "feedback", label: "Feedback", hint: "Correct / incorrect messages, or N/A.", rows: 4 },
  {
    key: "devNotes",
    label: "Storyline Developer Notes",
    hint: "Triggers, layers, states, variables, question banks, accessibility.",
    rows: 4,
  },
];

export function StoryboardStep({
  input,
  slides,
  objectives,
  onChange,
  onBack,
  aiMode,
  model,
  missingInformation,
}: {
  input: ProjectInput;
  slides: Slide[];
  objectives: Objective[];
  onChange: (slides: Slide[]) => void;
  onBack: () => void;
  aiMode: boolean;
  model: string | null;
  missingInformation: string[];
}) {
  const [selectedUid, setSelectedUid] = useState<string | null>(slides[0]?.uid ?? null);
  const [exportOpen, setExportOpen] = useState(false);

  const foundIndex = slides.findIndex((s) => s.uid === selectedUid);
  const index = foundIndex === -1 ? 0 : foundIndex;
  const slide = slides[index];
  const reviewedCount = slides.filter((s) => s.reviewed).length;

  const select = (i: number) => {
    const target = slides[Math.max(0, Math.min(slides.length - 1, i))];
    if (target) setSelectedUid(target.uid);
  };
  const update = (patch: Partial<Slide>) =>
    onChange(slides.map((s) => (s.uid === slide.uid ? { ...s, ...patch } : s)));

  function addSlide() {
    const s = blankSlide();
    const next = [...slides];
    next.splice(index + 1, 0, s);
    onChange(next);
    setSelectedUid(s.uid);
  }

  function duplicateSlide() {
    const copy = { ...slide, uid: uid(), title: `${slide.title} (copy)`, reviewed: false };
    const next = [...slides];
    next.splice(index + 1, 0, copy);
    onChange(next);
    setSelectedUid(copy.uid);
  }

  function deleteSlide() {
    if (!window.confirm(`Delete ${slideIdFor(index)} “${slide.title}”? This cannot be undone.`)) return;
    const next = slides.filter((s) => s.uid !== slide.uid);
    onChange(next);
    setSelectedUid(next[Math.min(index, next.length - 1)]?.uid ?? null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Step 3 of 3</Eyebrow>
          <h1 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-forest sm:text-5xl">
            Storyboard editor <MockLabel>{aiMode ? "AI draft" : "Mock draft"}</MockLabel>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            Review and edit each slide. Mark slides as reviewed as you go, then export for your Storyline developer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onBack}>
            ← Back to outline
          </Button>
          <Button variant="primary" onClick={() => setExportOpen(true)} disabled={!slides.length}>
            Export Markdown
          </Button>
        </div>
      </div>

      {missingInformation.length > 0 && (
        <Notice
          title="Review before export: missing or unclear SME information"
          items={missingInformation}
        />
      )}

      <div>
        <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
          <span>
            {reviewedCount} of {slides.length} slides reviewed
          </span>
          {slides.length > 0 && reviewedCount === slides.length && (
            <span className="font-semibold text-forest">All slides reviewed ✓</span>
          )}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand ring-1 ring-inset ring-line/60">
          <div
            className="h-full rounded-full bg-forest transition-all"
            style={{ width: `${slides.length ? (reviewedCount / slides.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {!slide ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-ink-muted">This storyboard has no slides.</p>
          <Button className="mt-4" variant="primary" onClick={addSlide}>
            + Add slide
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Slide navigator: dropdown on small screens, list on large screens */}
          <div className="lg:hidden">
            <label htmlFor="slide-picker" className="sr-only">
              Select slide
            </label>
            <select
              id="slide-picker"
              className={inputClass}
              value={slide.uid}
              onChange={(e) => setSelectedUid(e.target.value)}
            >
              {slides.map((s, i) => (
                <option key={s.uid} value={s.uid}>
                  {slideIdFor(i)} · {s.title} {s.reviewed ? "✓" : ""}
                </option>
              ))}
            </select>
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-36 lg:self-start">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-sage-deep bg-sage px-4 py-3">
                <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-forest">Slides ({slides.length})</h2>
                <Button size="sm" variant="ghost" onClick={addSlide}>
                  + Add
                </Button>
              </div>
              <ol className="max-h-[calc(100vh-17rem)] space-y-0.5 overflow-y-auto p-1.5">
                {slides.map((s, i) => {
                  const active = s.uid === slide.uid;
                  return (
                    <li key={s.uid}>
                      <button
                        type="button"
                        onClick={() => setSelectedUid(s.uid)}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-start gap-3 rounded-xl border-l-[3px] px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-forest ${
                          active
                            ? "border-ember bg-forest-tint shadow-soft"
                            : "border-transparent hover:bg-sage/70"
                        }`}
                      >
                        <span className={`mt-0.5 font-mono text-xs font-medium ${active ? "text-forest" : "text-ink-subtle"}`}>
                          {slideIdFor(i)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm ${active ? "font-semibold text-forest" : "text-ink-soft"}`}>
                            {s.title || "Untitled slide"}
                          </span>
                          <span className={`block text-xs ${active ? "text-ink-soft" : "text-ink-muted"}`}>{s.slideType}</span>
                        </span>
                        <span
                          className={`mt-0.5 text-xs ${s.reviewed ? "font-bold text-forest" : "text-line-strong"}`}
                          aria-label={s.reviewed ? "Reviewed" : "Needs review"}
                        >
                          {s.reviewed ? "✓" : "○"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </aside>

          <Card>
            <div className="flex flex-col gap-3 rounded-t-2xl border-b border-sage-deep bg-sage px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-forest px-2.5 py-1 font-mono text-sm font-semibold text-cream">
                  {slideIdFor(index)}
                </span>
                <span className="text-sm font-medium text-ink-muted">
                  Slide {index + 1} of {slides.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => select(index - 1)} disabled={index === 0}>
                  ← Prev
                </Button>
                <Button size="sm" onClick={() => select(index + 1)} disabled={index === slides.length - 1}>
                  Next →
                </Button>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <Field label="Slide title" htmlFor="slide-title">
                <input
                  id="slide-title"
                  className={`${inputClass} font-display text-xl! font-semibold tracking-[-0.01em] text-forest!`}
                  value={slide.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Field label="Learning objective" htmlFor="slide-objective">
                  <ObjectiveSelect
                    id="slide-objective"
                    value={slide.objectiveId || ALL_OBJECTIVES}
                    objectives={objectives}
                    onChange={(objectiveId) => update({ objectiveId })}
                  />
                </Field>
                <Field label="Slide type" htmlFor="slide-type">
                  <select
                    id="slide-type"
                    className={inputClass}
                    value={slide.slideType}
                    onChange={(e) => update({ slideType: e.target.value as SlideType })}
                  >
                    {SLIDE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-x-6 gap-y-6 border-t border-line pt-6 xl:grid-cols-2">
                {TEXT_FIELDS.map((f) => (
                  <Field key={f.key} label={f.label} htmlFor={`slide-${f.key}`} hint={f.hint}>
                    <textarea
                      id={`slide-${f.key}`}
                      rows={f.rows}
                      className={`${inputClass} leading-relaxed`}
                      value={slide[f.key]}
                      onChange={(e) => update({ [f.key]: e.target.value })}
                    />
                  </Field>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-b-2xl border-t border-forest/20 bg-forest-tint/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  className="size-[18px] cursor-pointer rounded accent-forest"
                  checked={slide.reviewed}
                  onChange={(e) => update({ reviewed: e.target.checked })}
                />
                Mark slide as reviewed
              </label>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => {
                  onChange(moveItem(slides, index, index - 1));
                }} disabled={index === 0}>
                  Move up
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  onChange(moveItem(slides, index, index + 1));
                }} disabled={index === slides.length - 1}>
                  Move down
                </Button>
                <Button size="sm" variant="ghost" onClick={addSlide} className="lg:hidden">
                  Add slide
                </Button>
                <Button size="sm" variant="ghost" onClick={duplicateSlide}>
                  Duplicate
                </Button>
                <Button size="sm" variant="danger" onClick={deleteSlide}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {exportOpen && (
        <ExportDialog
          input={input}
          objectives={objectives}
          slides={slides}
          generatedBy={aiMode ? `OpenAI${model ? ` (${model})` : ""}` : "mock generation"}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  );
}
