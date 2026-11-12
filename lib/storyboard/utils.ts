import { ALL_OBJECTIVES, type Objective } from "./types";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Parses one objective per line, stripping bullets, numbering, and "LO1:" prefixes. */
export function parseObjectives(text: string): Objective[] {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*(?:[-*•]\s*|\d+[.)]\s*|LO\s*\d+\s*[:.)-]?\s*)/i, "")
        .trim(),
    )
    .filter(Boolean)
    .map((text, i) => ({ id: `LO${i + 1}`, text }));
}

export function objectiveLabel(id: string, objectives: Objective[]): string {
  if (id === ALL_OBJECTIVES) return "All objectives";
  const match = objectives.find((o) => o.id === id);
  return match ? `${match.id}: ${match.text}` : `${id} (not in current objectives)`;
}

export function slideIdFor(index: number): string {
  return `S${String(index + 1).padStart(2, "0")}`;
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
