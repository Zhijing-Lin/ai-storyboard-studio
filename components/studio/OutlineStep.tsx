"use client";

import { useState } from "react";
import {
  ALL_OBJECTIVES,
  PURPOSES,
  type GenerationMode,
  type Objective,
  type OutlineItem,
  type Purpose,
} from "@/lib/storyboard/types";
import { moveItem, objectiveLabel, uid } from "@/lib/storyboard/utils";
import { Button, Card, Eyebrow, Field, inputClass, MockLabel, Notice, PurposeBadge, Spinner, Tag } from "./ui";

export function OutlineStep({
  items,
  objectives,
  mode,
  onChange,
  onBack,
  onApprove,
  busy,
  hasStoryboard,
  onContinue,
  model,
  missingInformation,
  errorMessage,
}: {
  items: OutlineItem[];
  objectives: Objective[];
  mode: GenerationMode | null;
  onChange: (items: OutlineItem[]) => void;
  onBack: () => void;
  onApprove: () => void;
  busy: boolean;
  hasStoryboard: boolean;
  onContinue: () => void;
  model: string | null;
  missingInformation: string[];
  errorMessage: string | null;
}) {
  const aiMode = mode === "openai";
  const [editing, setEditing] = useState<Set<string>>(new Set());

  const toggleEdit = (id: string) =>
    setEditing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const update = (id: string, patch: Partial<OutlineItem>) =>
    onChange(items.map((item) => (item.uid === id ? { ...item, ...patch } : item)));

  function addItem() {
    const item: OutlineItem = {
      uid: uid(),
      title: "New outline item",
      purpose: "Instruction",
      objectiveId: objectives[0]?.id ?? ALL_OBJECTIVES,
      summary: "",
      rationale: "Added by instructional designer.",
    };
    onChange([...items, item]);
    setEditing((prev) => new Set(prev).add(item.uid));
  }

  function removeItem(item: OutlineItem) {
    if (!window.confirm(`Remove “${item.title}” from the outline?`)) return;
    onChange(items.filter((i) => i.uid !== item.uid));
  }

  const counts = PURPOSES.map((p) => [p, items.filter((i) => i.purpose === p).length] as const);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Step 2 of 3</Eyebrow>
          <h1 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-forest sm:text-5xl">
            AI design outline <MockLabel>{aiMode ? "AI draft" : "Mock AI output"}</MockLabel>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            Review the proposed instructional sequence. Edit, reorder, add, or remove items, then approve it to
            draft the storyboard.
          </p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          ← Back to input
        </Button>
      </div>

      {mode && (
        <Notice>
          {mode === "openai"
            ? `Drafted by OpenAI${model ? ` (${model})` : ""} from your SME content. AI can misread or omit information — verify every item before approving.`
            : mode === "curated-sample"
              ? "Mock output: curated sample outline for the nutrition-label lesson. This was written in advance, not generated."
              : "Mock output: template-based draft built from your objectives. Content is placeholder structure, not real AI generation."}
        </Notice>
      )}
      {missingInformation.length > 0 && (
        <Notice title="Missing or unclear SME information" items={missingInformation} />
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="space-y-4">
          {items.length === 0 && (
            <Card className="p-10 text-center text-sm text-ink-muted">
              The outline is empty. Add an item to get started.
            </Card>
          )}
          {items.map((item, index) => (
            <OutlineCard
              key={item.uid}
              item={item}
              index={index}
              total={items.length}
              objectives={objectives}
              isEditing={editing.has(item.uid)}
              onToggleEdit={() => toggleEdit(item.uid)}
              onUpdate={(patch) => update(item.uid, patch)}
              onMove={(dir) => onChange(moveItem(items, index, index + dir))}
              onRemove={() => removeItem(item)}
            />
          ))}
          <button
            type="button"
            onClick={addItem}
            className="w-full rounded-2xl border-2 border-dashed border-forest/35 bg-paper/50 px-4 py-5 text-sm font-semibold text-forest transition-colors hover:border-forest/70 hover:bg-forest-tint/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            + Add outline item
          </button>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <Card tone="sage" className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-forest">Sequence summary</h2>
            <p className="mt-0.5 text-xs text-ink-muted">{items.length} items</p>
            <dl className="mt-4 space-y-2.5">
              {counts.map(([purpose, n]) => (
                <div key={purpose} className="flex items-center justify-between text-sm">
                  <dt>
                    <PurposeBadge purpose={purpose} />
                  </dt>
                  <dd className="font-display text-base font-semibold text-ink">{n}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card tone="sage" className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-forest">Objective coverage</h2>
            <p className="mt-0.5 text-xs leading-5 text-ink-muted">Each objective should have practice and assessment.</p>
            <ul className="mt-4 divide-y divide-sage-deep">
              {objectives.map((o) => {
                const related = items.filter(
                  (i) => i.objectiveId === o.id || i.objectiveId === ALL_OBJECTIVES,
                );
                const missing = (["Practice", "Assessment"] as Purpose[]).filter(
                  (p) => !related.some((i) => i.purpose === p),
                );
                return (
                  <li key={o.id} className="py-2.5 text-sm first:pt-0 last:pb-0">
                    <p className="font-semibold text-ink">
                      {o.id}{" "}
                      <span className="font-normal text-ink-muted">· {related.length} items</span>
                    </p>
                    {missing.length ? (
                      <p className="mt-0.5 text-xs font-medium text-ember-dark">⚠ No {missing.join(" or ")} item</p>
                    ) : (
                      <p className="mt-0.5 text-xs font-medium text-forest">✓ Practiced and assessed</p>
                    )}
                  </li>
                );
              })}
              {objectives.length === 0 && <li className="text-xs text-ink-muted">No objectives defined.</li>}
            </ul>
          </Card>

          <Card tone="forest" className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-forest">Approve outline</h2>
            <p className="mt-0.5 text-xs leading-5 text-ink-muted">
              Each outline item becomes one draft slide you can edit.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="primary" onClick={onApprove} disabled={busy || items.length === 0}>
                {busy ? (
                  <>
                    <Spinner /> {aiMode ? "Writing storyboard…" : "Drafting mock storyboard…"}
                  </>
                ) : hasStoryboard ? (
                  "Approve & regenerate storyboard"
                ) : (
                  "Approve & generate storyboard"
                )}
              </Button>
              {busy && aiMode && (
                <p className="text-xs leading-5 text-ink-muted" role="status">
                  Full storyboards usually take 1–3 minutes. Your outline is kept if anything fails.
                </p>
              )}
              {errorMessage && !busy && (
                <Notice tone="error" title="Storyboard generation failed">
                  {errorMessage}
                </Notice>
              )}
              {hasStoryboard && !busy && <Button onClick={onContinue}>Continue to current storyboard →</Button>}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function OutlineCard({
  item,
  index,
  total,
  objectives,
  isEditing,
  onToggleEdit,
  onUpdate,
  onMove,
  onRemove,
}: {
  item: OutlineItem;
  index: number;
  total: number;
  objectives: Objective[];
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (patch: Partial<OutlineItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const fid = (name: string) => `${item.uid}-${name}`;
  return (
    <Card className={`transition-shadow ${isEditing ? "border-forest/50 ring-4 ring-forest/15" : "hover:border-forest/30"}`}>
      <div className="flex gap-3 p-4 sm:gap-5 sm:p-6">
        <div className="flex flex-col items-center gap-1">
          <span className="flex size-8 items-center justify-center rounded-full bg-forest font-display text-sm font-bold text-paper">
            {index + 1}
          </span>
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move “${item.title}” up`}
            className="rounded-lg p-1 text-xs text-ink-muted transition-colors hover:bg-sage hover:text-forest focus-visible:outline-2 focus-visible:outline-forest disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Move “${item.title}” down`}
            className="rounded-lg p-1 text-xs text-ink-muted transition-colors hover:bg-sage hover:text-forest focus-visible:outline-2 focus-visible:outline-forest disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ▼
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <Field label="Title" htmlFor={fid("title")}>
                <input
                  id={fid("title")}
                  className={inputClass}
                  value={item.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="space-y-1.5">
                  <legend className="mb-2 text-[13px] font-semibold text-ink">Purpose</legend>
                  <div className="flex gap-1 rounded-xl border border-line-strong bg-field p-1">
                    {PURPOSES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={item.purpose === p}
                        onClick={() => onUpdate({ purpose: p })}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-forest sm:text-sm ${
                          item.purpose === p
                            ? "bg-forest text-cream shadow-soft"
                            : "text-ink-soft hover:bg-forest-tint"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <Field label="Related objective" htmlFor={fid("objective")}>
                  <ObjectiveSelect
                    id={fid("objective")}
                    value={item.objectiveId}
                    objectives={objectives}
                    onChange={(objectiveId) => onUpdate({ objectiveId })}
                  />
                </Field>
              </div>
              <Field label="Content summary" htmlFor={fid("summary")}>
                <textarea
                  id={fid("summary")}
                  rows={3}
                  className={inputClass}
                  value={item.summary}
                  onChange={(e) => onUpdate({ summary: e.target.value })}
                />
              </Field>
              <Field label="Rationale" htmlFor={fid("rationale")}>
                <textarea
                  id={fid("rationale")}
                  rows={2}
                  className={inputClass}
                  value={item.rationale}
                  onChange={(e) => onUpdate({ rationale: e.target.value })}
                />
              </Field>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <PurposeBadge purpose={item.purpose} />
                <Tag>{item.objectiveId === ALL_OBJECTIVES ? "All objectives" : item.objectiveId}</Tag>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-[-0.015em] text-ink">{item.title || "Untitled item"}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{item.summary || <em className="text-ink-subtle">No summary yet</em>}</p>
              <div className="mt-4 rounded-xl border-l-4 border-forest bg-sage px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest">Rationale</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.rationale || "—"}</p>
              </div>
              {item.objectiveId !== ALL_OBJECTIVES && !objectives.some((o) => o.id === item.objectiveId) && (
                <p className="mt-2 text-xs font-medium text-ember-dark">
                  ⚠ {objectiveLabel(item.objectiveId, objectives)}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" variant={isEditing ? "primary" : "secondary"} onClick={onToggleEdit}>
              {isEditing ? "Done" : "Edit"}
            </Button>
            <Button size="sm" variant="danger" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ObjectiveSelect({
  id,
  value,
  objectives,
  onChange,
}: {
  id: string;
  value: string;
  objectives: Objective[];
  onChange: (value: string) => void;
}) {
  const known = value === ALL_OBJECTIVES || objectives.some((o) => o.id === value);
  return (
    <select id={id} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value={ALL_OBJECTIVES}>All objectives</option>
      {objectives.map((o) => (
        <option key={o.id} value={o.id}>
          {o.id}: {o.text.length > 70 ? `${o.text.slice(0, 69)}…` : o.text}
        </option>
      ))}
      {!known && <option value={value}>{value} (not in current objectives)</option>}
    </select>
  );
}
