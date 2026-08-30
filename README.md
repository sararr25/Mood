# MOOD

MOOD is a local-first creative workspace built for the OpenAI WebMCP Challenge. It helps a designer move from visual references through a creative direction and refinement into a usable design system. The supplied Stitch export is the visual source of truth for this MVP.

## Stack

- React, TypeScript, Vite, React Router
- Zustand with localStorage persistence
- Zod schemas for site-tool input validation
- dnd-kit installed for board interaction foundations
- Culori for deterministic WCAG contrast analysis

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`; Vite writes it to `dist`.

## Architecture

- `src/core/types.ts` contains the shared project, reference, direction, decision, token, system, and suggestion models.
- `src/data/wanderwellDemo.ts` is the single Wanderwell demo source.
- `src/store/projectStore.ts` owns the local persisted state and the shared business actions used by both the UI and site tools.
- `src/app/App.tsx` contains the responsive four-stage interface and state-driven visual variants.
- `src/webmcp/registerTools.ts` registers focused page tools from the top-level page.

## WebMCP

MOOD does not include an internal chatbot. When the browser exposes `document.modelContext.registerTool`, the app registers project, reference, decision, and suggestion actions. Each calls the exact same Zustand actions as the interface, validates inputs through Zod, is feature-detected, and catches registration failures so standard browsers still work normally.

## MVP limits

The project intentionally has no authentication, database, payments, internal AI model, or server. Demo imagery uses remote image URLs. The visible reference order is ready for dnd-kit expansion; state mutation and all core operations are local-first.

## Vercel

Set framework to Vite, build command to `npm run build`, and output directory to `dist`. `vercel.json` rewrites direct client-side routes to the Vite entry point.
