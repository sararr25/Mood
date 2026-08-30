# MOOD

MOOD is a local-first creative workspace built for the OpenAI WebMCP Challenge. It helps a designer move from visual references through a creative direction and refinement into a usable design system. The supplied Stitch export is the visual source of truth for this MVP.

## Stack

- React, TypeScript, Vite, React Router
- Zustand with localStorage persistence
- Zod schemas for site-tool input validation
- dnd-kit for persisted board reordering
- Culori for deterministic WCAG contrast analysis

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`; Vite writes it to `dist`.

## Architecture

- `src/core/types.ts` contains the shared project, reference, direction, decision, token, system, and suggestion models.
- `src/data/wanderwellDemo.ts` seeds three direction candidates and a local-first Wanderwell project.
- `src/data/referenceLibrary.ts` is a provider-shaped, 36-item structured reference library; it can be replaced with a permitted API later without changing the workflow.
- `src/store/projectStore.ts` owns the local persisted state and the shared business actions used by both the UI and site tools.
- `src/core/analysis.ts` provides deterministic contrast, Lab palette-distance, hierarchy, and reference-evidence critiques.
- `src/app/App.tsx` contains the responsive four-stage interface, reference import/note/recovery controls, and the human workflow.
- `src/webmcp/registerTools.ts` registers focused page tools from the top-level page.

## WebMCP

MOOD does not include an internal chatbot. When the browser exposes `document.modelContext.registerTool`, the app registers focused page tools from the top-level page. Each tool has a native JSON Schema plus Zod validation and calls the exact same Zustand actions as the UI. Registration is feature-detected and failures are isolated, so standard browsers work normally.

Read tools: `get_project_context`, `get_references`, `get_selected_references`, `get_directions`, `get_selected_direction`, `get_design_decisions`, `get_design_system`, `get_critiques`, and `search_reference_library`.

Mutation tools: `add_reference`, `keep_reference`, `reject_reference`, `restore_reference`, `add_reference_note`, `create_direction`, `update_direction`, `select_direction`, `create_design_decision`, `update_design_decision`, `lock_design_decision`, `reject_design_decision`, `evaluate_palette`, `evaluate_direction`, `create_suggestion`, `apply_suggestion`, `reject_suggestion`, `set_design_system`, `update_color_token`, `update_typography_token`, and `update_design_principle`.

Every successful mutation returns `{ success: true, ..., projectVersion }`. The active page shows “Agent connected” only when the host has a model context. On localhost, a development-only console diagnostic prints the available tool registry when the host provides `getTools`.

## MVP limits

The project intentionally has no authentication, database, payments, internal AI model, or server. State, including data-URL image imports, persists locally in browser storage. Demo imagery uses remote image URLs; the local reference library only uses structured metadata and can be swapped for an approved provider.

## Vercel

Set framework to Vite, build command to `npm run build`, and output directory to `dist`. `vercel.json` rewrites direct client-side routes to the Vite entry point.
