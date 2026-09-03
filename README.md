# MOOD

MOOD is a human-led creative workspace for the OpenAI WebMCP Challenge. It helps a designer turn a brief and visual evidence into a clear direction, tested decisions, and a traceable design system.

Through WebMCP, an agent can inspect the active project, its references, and design decisions; it can then suggest or perform bounded actions in the open workspace. The designer keeps approval and final creative control: suggestions wait for review, and locked human decisions cannot be overwritten.

## Run locally

Prerequisites: Node.js `20.19+` or `22.12+`.

```bash
git clone https://github.com/sararr25/Mood.git
cd Mood
npm ci
npm run dev
```

Vite prints the local URL (normally `http://localhost:5173`). To make a production bundle, run:

```bash
npm run build
npm run preview
```

The build is written to `dist`. No API key, environment file, account, database, or external service is required to run the app; project state stays in the browser's local storage.

## Project model and routes

Browser storage persists a `projects: Project[]` collection plus `activeProjectId`. Each project owns its references, directions, decisions, design system, suggestions, activity, version, and reset state.

- `/` — create, open, duplicate, or delete a project.
- `/project/:projectId/explore`
- `/project/:projectId/direction`
- `/project/:projectId/refine`
- `/project/:projectId/system`

`wanderwell` is a protected demo project. New projects start empty and can be reset without affecting other work.

## Human-agent collaboration

The Agent Suggestions panel records each proposal's evidence, scope, review status, and undo path. `create_suggestion` requires a rationale, evidence IDs, and a plain-language summary; it never applies its own proposal. `apply_suggestion` and `reject_suggestion` are explicit review actions.

MOOD's deterministic UI actions and WebMCP actions use the same Zustand store. Runtime WebMCP actions update the open application directly and persist in browser storage; they do not require a code edit, commit, rebuild, or redeploy. Development work, such as changing the palette editor itself, is separate and does require those steps.

The selected direction is canonical for palette and typography. `src/core/actions/designActions.ts` synchronizes the System projection in the same logical mutation so Direction, Refine, System, critiques, and WebMCP reads stay aligned.

## WebMCP

`src/webmcp/registerTools.ts` feature-detects `document.modelContext.registerTool`. Each tool has native JSON Schema, Zod input validation, structured results, isolated errors, and the same underlying actions as the UI. `src/webmcp/lifecycle.ts` records API detection, registration counts and names, errors, and `getTools()` results.

Open a workspace route with `?webmcpDebug=1` to inspect availability, registrations, errors, `getTools()` output, and a guarded self-test. When the host exposes `executeTool`, the test invokes `get_project_context`; otherwise the panel reports that limitation clearly.

The current registry contains 43 tools:

```text
update_palette, get_palette_context, get_current_phase, navigate_to_phase,
get_project_context, get_references, get_selected_references, get_directions,
get_selected_direction, get_design_decisions, get_design_system,
get_agent_suggestions, inspect_suggestion, get_critiques,
search_reference_library, add_reference, keep_reference, reject_reference,
restore_reference, add_reference_note, remove_reference, reorder_references,
create_direction, update_direction, select_direction, create_design_decision,
update_design_decision, lock_design_decision, reject_design_decision,
evaluate_palette, evaluate_direction, create_suggestion, apply_suggestion,
reject_suggestion, set_design_system, update_color_token,
update_typography_token, update_design_principle, list_projects,
update_project, create_project, open_project, get_active_project
```

Notable runtime tools include `update_palette` and `get_palette_context` for synchronized live palette work, `get_current_phase` and `navigate_to_phase` for the workflow, and `get_project_context` for the active brief, references, decisions, and state. Reference and project operations are similarly bounded to the currently open browser workspace.

## Verification checklist

1. Create a project with a name, brief, and optional avoid list.
2. Confirm its empty Explore, Direction, Refine, and System states.
3. Duplicate or delete a non-demo project.
4. In a WebMCP-capable browser, open `?webmcpDebug=1`, inspect the 43-tool registry, and call `get_project_context`, `get_references`, `add_reference`, `create_direction`, `create_design_decision`, and `evaluate_palette`.
5. Select and lock a decision in the UI, then rerun palette evaluation to confirm the lock remains intact.

## Architecture

- `src/core/types.ts` — shared project, reference, direction, decision, token, and suggestion types.
- `src/data/wanderwellDemo.ts` — resettable Wanderwell seed.
- `src/data/referenceLibrary.ts` — local structured reference library.
- `src/store/projectStore.ts` — persisted multi-project Zustand state and shared actions.
- `src/core/analysis.ts` — deterministic contrast, palette-distance, hierarchy, and evidence critiques.
- `src/app/App.tsx` — responsive UI, route handling, human controls, and debug panel.
- `src/webmcp/lifecycle.ts` and `src/webmcp/registerTools.ts` — diagnostics and WebMCP registration.

## Deployment

The project deploys as a Vite application. Configure the build command as `npm run build` and the output directory as `dist`; `vercel.json` rewrites direct project routes to the Vite entry point.

Live app: https://mood-rho-liart.vercel.app

## License

[MIT](LICENSE)
