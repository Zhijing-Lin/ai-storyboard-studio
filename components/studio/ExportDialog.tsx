"use client";

import { useEffect, useMemo, useState } from "react";
import { buildMarkdown } from "@/lib/storyboard/markdown";
import type { Objective, ProjectInput, Slide } from "@/lib/storyboard/types";
import { Button } from "./ui";

export function ExportDialog({
  input,
  objectives,
  slides,
  generatedBy,
  onClose,
}: {
  input: ProjectInput;
  objectives: Objective[];
  slides: Slide[];
  generatedBy: string;
  onClose: () => void;
}) {
  const markdown = useMemo(
    () => buildMarkdown(input, objectives, slides, generatedBy),
    [input, objectives, slides, generatedBy],
  );
  const [copied, setCopied] = useState(false);
  const unreviewed = slides.filter((s) => !s.reviewed).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert("Copy failed — select the text and copy it manually.");
    }
  }

  function download() {
    const slug =
      (input.courseTitle || "storyboard")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "storyboard";
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-storyboard.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-t-2xl border border-line bg-paper shadow-lift sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
          <div>
            <h2 id="export-title" className="font-display text-xl font-semibold tracking-[-0.01em] text-forest">
              Export storyboard (Markdown)
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              {slides.length} slides
              {unreviewed > 0 && (
                <span className="font-medium text-ember-dark"> · {unreviewed} not yet marked reviewed</span>
              )}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close export dialog">
            ✕
          </Button>
        </div>
        <pre className="mx-5 mt-5 flex-1 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-cream px-4 py-4 font-mono text-xs leading-relaxed text-ink-soft sm:mx-6">
          {markdown}
        </pre>
        <div className="flex flex-col-reverse gap-2 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
          <Button onClick={copy}>{copied ? "Copied ✓" : "Copy to clipboard"}</Button>
          <Button variant="primary" onClick={download} autoFocus>
            Download .md
          </Button>
        </div>
      </div>
    </div>
  );
}
