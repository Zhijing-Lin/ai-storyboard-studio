# Implementation Plan — Prototype v0.1

Stack: existing Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. No new dependencies.

## Architecture
- `app/page.tsx` — Server Component that renders the client workspace.
- `components/studio/StudioApp.tsx` — Client Component holding all state (input, outline, slides, current step, generation status). Single route keeps edits intact while moving between steps.
- `components/studio/*Step.tsx` — one component per step (Input, Outline, Storyboard).
- `components/studio/ExportDialog.tsx` — Markdown preview, copy, download.
- `components/studio/ui.tsx` — small shared primitives (buttons, fields, badges).
- `lib/storyboard/types.ts` — domain types.
- `lib/storyboard/sampleData.ts` — fictional nutrition-label lesson (input, outline, slides).
- `lib/storyboard/mockGenerator.ts` — simulated generation with a short delay. Uses curated sample output when the SME content matches the sample; otherwise builds a template-based draft from the user's objectives. Clearly labeled as mock.
- `lib/storyboard/markdown.ts` — storyboard → Markdown.

## Steps
1. Write PRD and plan.
2. Types, sample data, mock generator, Markdown export.
3. UI primitives and header / stepper with mock-data notice.
4. Input step: form, validation, sample loader, detected-objectives preview.
5. Outline step: view/edit cards, reorder, add, remove, purpose change, coverage panel, approve.
6. Storyboard step: slide navigator (sidebar on desktop, dropdown on mobile), field editor, prev/next, reviewed toggle, add/duplicate/move/delete, export.
7. Run `npm run lint`, `npx tsc --noEmit`, `npm run build`; fix issues.

## Notes
- Slide IDs are auto-numbered by position (S01, S02…) so they stay consistent after reordering.
- Regenerating an outline or storyboard asks for confirmation before overwriting edits.
- No persistence: a page refresh resets the session (documented).

---

# v0.2 — Real AI generation (OpenAI)

Packages: `ai` (Vercel AI SDK v7), `@ai-sdk/openai`, `zod` v4.

## Flow
Browser (`lib/storyboard/aiClient.ts`) → Route Handlers (`app/api/ai/outline`, `app/api/ai/storyboard`) → `lib/ai/generate.ts` → OpenAI via `generateText` + `Output.object` with Zod schemas. The API key is read only on the server (`lib/ai/config.ts`, guarded by `import "server-only"`).

## Files
- `lib/ai/prompts/outlinePrompt.ts`, `storyboardPrompt.ts`, `shared.ts` — editable prompts and grounding rules.
- `lib/ai/schemas.ts` — request validation (with limits) and model output schemas. Objective IDs are constrained to the user's objectives.
- `lib/ai/config.ts` — model (`OPENAI_MODEL`, default `gpt-5.4-mini`), reasoning effort, token/time/input limits.
- `lib/ai/guard.ts` — same-origin check, body size cap, per-client and daily rate limits, public-deployment block.
- `lib/ai/errors.ts` — maps OpenAI/SDK errors to readable messages; redacts anything key-like from logs.

## Behavior
- Existing outline/slides are replaced only after a successful response; failures show an error and keep edits.
- Confirmation before overwriting existing outputs (unchanged).
- Missing SME information is returned as `missingInformation` and shown on the Outline and Storyboard screens; inline gaps use `[SME to confirm: …]`.
- Mock mode is kept for offline testing at `/?mock=1` and is labeled as mock everywhere. Real mode never falls back to mock.

## Safeguards (not production auth)
The AI routes are intentionally public (no login); the owner pays for usage. In-memory rate limits reset on restart and are per-instance, so the OpenAI dashboard budget limit is the hard spending cap.
