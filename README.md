# MOOD

MOOD is a local-first creative workspace for the OpenAI WebMCP Challenge. It takes a project from references to a direction, refinement, and a small design system while preserving the supplied Stitch layout as the visual baseline.

## Run and build

```bash
npm install
npm run dev
npm run build
```

The Vite production bundle is written to `dist`.

## Project model and routes

Browser storage persists a `projects: Project[]` collection plus `activeProjectId`. Each project owns its references, direction candidates, selected direction, decisions, design system, suggestions, activity, version and local reset state.

- `/` — project home: create, open, duplicate, or delete a project.
- `/project/:projectId/explore`
- `/project/:projectId/direction`
- `/project/:projectId/refine`
- `/project/:projectId/system`

`wanderwell` is the protected demo project. A new project starts empty and is valid in every stage. It can be reset without affecting the other projects.

## What is real vs demo

There is no internal chatbot or synthetic “agent connected” claim. The Explore panel identifies demo suggestions, local deterministic critiques, and suggestions created through Site tools separately. Its visible ready status is only `● Site tools ready`, and is rendered only after every WebMCP registration succeeds.

- UI changes and critique evaluation are local deterministic state changes.
- Demo suggestions are explicit seed/demo content.
- A `create_suggestion` Site-tool invocation is recorded as a Site-tool suggestion, and it still requires `apply_suggestion` before it mutates project data.

## WebMCP

At the top level, `src/webmcp/registerTools.ts` feature-detects `document.modelContext.registerTool`. Each registration has native JSON Schema, Zod validation, structured results, error isolation, and uses the same Zustand actions as the UI. The lifecycle store records detection, expected/registered counts, tool names, errors, and `getTools()` results. The implementation prevents duplicate registrations in the current WebMCP API; it does not invent an unregister operation where the host API does not provide one.

Open any workspace route with `?webmcpDebug=1` to inspect API availability, registration state, expected and successful counts, registered names, errors, `getTools()` output, and a guarded self-test. If the host exposes `executeTool`, the test invokes `get_project_context`; otherwise the panel explicitly reports that host limitation rather than pretending the tool ran.

Registered tools:

```text
get_project_context, get_references, get_selected_references, get_directions,
get_selected_direction, get_design_decisions, get_design_system, get_critiques,
search_reference_library, add_reference, keep_reference, reject_reference,
restore_reference, add_reference_note, create_direction, update_direction,
select_direction, create_design_decision, update_design_decision,
lock_design_decision, reject_design_decision, evaluate_palette,
evaluate_direction, create_suggestion, apply_suggestion, reject_suggestion,
set_design_system, update_color_token, update_typography_token,
update_design_principle, list_projects, create_project, open_project,
get_active_project
```

## Verification checklist

1. Open `/` and create a project with a name, brief, and optional avoid list.
2. Open that project and verify the empty Explore, Direction, Refine, and System states.
3. Use the project controls to duplicate or delete a non-demo project.
4. In the ChatGPT desktop built-in browser, open `?webmcpDebug=1`, inspect the registry, then call `get_project_context`, `get_references`, `add_reference`, `create_direction`, `create_design_decision`, `evaluate_palette`, and `get_design_decisions`.
5. Select and lock a decision manually in the UI, then rerun palette evaluation to confirm the human lock remains intact.

## Architecture

- `src/core/types.ts` — shared project, reference, direction, decision, token, and suggestion types.
- `src/data/wanderwellDemo.ts` — the resettable Wanderwell demo seed.
- `src/data/referenceLibrary.ts` — a provider-shaped local structured reference library.
- `src/store/projectStore.ts` — persisted multi-project Zustand state and shared actions.
- `src/core/analysis.ts` — deterministic contrast, palette-distance, hierarchy, and evidence critiques.
- `src/app/App.tsx` — responsive UI, route handling, human controls, and debug panel.
- `src/webmcp/lifecycle.ts` and `src/webmcp/registerTools.ts` — lifecycle diagnostics and top-level Site-tool registration.

## Limits

The MVP has no authentication, database, payments, internal model, or server-side storage. Project state and data-URL image imports remain in the browser’s local storage. Remote demo images are used only as supplied visual content; the structured reference library can be replaced by an approved provider.

## Vercel

Use Vite, `npm run build`, and `dist`. `vercel.json` rewrites direct client-side project routes to the Vite entry point.
