# AI Storyboard Studio — PRD (Prototype v0.1)

Course: The AI Augmented Designer — Project 3

## Problem
Instructional designers (IDs) spend significant time translating raw subject-matter-expert (SME) content and learning objectives into a slide-by-slide storyboard that a Storyline 360 developer can build from. The work is repetitive in structure (sequence → slides → fields) but demands expert judgment at every step.

## Goal
Help IDs turn SME content and learning objectives into an **editable** e-learning storyboard for Articulate Storyline 360, with AI proposing a draft and the human reviewing, editing, and approving at each stage.

## Target user
Instructional designers and e-learning developers producing Storyline 360 courses, typically 5–30 minute microlearning modules.

## Core user flow
1. **Input** — Enter SME content, learning objectives (one per line), target learners, and optional duration / constraints. A sample lesson can be loaded.
2. **AI Design Outline** — Review a proposed instructional sequence. Each item has: title, purpose (Instruction / Practice / Assessment), related objective, content summary, and rationale. User can edit, reorder, add, remove, and change purpose. An objective-coverage panel flags objectives without practice or assessment.
3. **Storyboard Editor** — Approve the outline to convert it into slides. Each slide has: Slide ID, Title, Learning Objective, Slide Type, On-Screen Text, Narration, Visual Notes, Interaction, Feedback, Storyline Developer Notes. User can edit all fields, navigate, add / duplicate / reorder / delete slides, mark slides reviewed, and export a Markdown storyboard.

## Design principles
- **Human in control** — AI output is always a draft; every field is editable; destructive regeneration asks for confirmation; review status is tracked per slide.
- **Honest labeling** — This prototype uses mock data. The UI says so on every screen; no fake "AI" claims.
- **Clear hierarchy** — One step at a time, a visible stepper, primary action always obvious.
- **Responsive** — Usable from phone to wide desktop.

## Scope (v0.1)
In: three-step flow, mock generation (curated nutrition-label sample + template-based fallback for custom input), full editing, Markdown export (copy + download).

Out: authentication, database / persistence, collaboration, multi-agent systems, `.story` file export.

## Sample content
A fictional lesson, *Reading Nutrition Facts Labels*, for a fictional community wellness program (FreshStart). The SME and organization are fictional.

## Success criteria for this iteration
- A user can complete Input → Outline → Storyboard → Export without dead ends.
- All mock-generation and editing controls work.
- Exported Markdown contains every slide field in a developer-readable format.
- `npm run lint` and `npm run build` pass.

## v0.2 update
Real generation via OpenAI (Vercel AI SDK + Zod structured output) replaces mock data by default; mock mode remains at `/?mock=1`. See IMPLEMENTATION_PLAN.md.

## Next iterations
Local autosave; objective-alignment checks; per-field "regenerate" with human diff review; import of SME documents.
