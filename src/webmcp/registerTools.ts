import { z } from 'zod'
import { useProjectStore } from '../store/projectStore'

type WebMcpDocument = Document & { modelContext?: { registerTool?: (definition: { name: string; description: string; inputSchema: Record<string, unknown>; annotations?: Record<string, unknown>; execute: (input: unknown) => Promise<unknown> }) => Promise<void> } }
const empty = z.object({}).strict()
const id = z.object({ id: z.string().min(1) }).strict()

const schemaFor = (schema: z.ZodType): Record<string, unknown> => {
  if (schema === empty) return { type: 'object', properties: {}, additionalProperties: false }
  return { type: 'object', properties: { id: { type: 'string', minLength: 1 } }, required: ['id'], additionalProperties: false }
}

const register = async (name: string, description: string, schema: z.ZodType, execute: (value: unknown) => unknown, readOnly = false) => {
  const context = (document as WebMcpDocument).modelContext
  if (typeof context?.registerTool !== 'function') return
  await context.registerTool({ name, description, inputSchema: schemaFor(schema), annotations: readOnly ? { readOnlyHint: true } : undefined, execute: async (input) => execute(schema.parse(input)) })
}

export const registerMoodTools = async () => {
  try {
    await register('get_project_context', 'Read the active MOOD project and current phase.', empty, () => useProjectStore.getState().project, true)
    await register('get_references', 'Read the project references, including decisions and statuses.', empty, () => useProjectStore.getState().project.references, true)
    await register('get_design_decisions', 'Read traceable creative decisions and lock states.', empty, () => useProjectStore.getState().project.designDecisions, true)
    await register('keep_reference', 'Keep a reference in the current moodboard.', id, (input) => { useProjectStore.getState().keepReference((input as { id: string }).id); return { ok: true } })
    await register('reject_reference', 'Reject a reference from the current moodboard.', id, (input) => { useProjectStore.getState().rejectReference((input as { id: string }).id); return { ok: true } })
    await register('lock_design_decision', 'Lock a human-approved design decision.', id, (input) => { useProjectStore.getState().lockDecision((input as { id: string }).id); return { ok: true } })
    await register('apply_suggestion', 'Apply a reviewed suggestion to the MOOD workflow.', id, (input) => { useProjectStore.getState().applySuggestion((input as { id: string }).id); return { ok: true } })
  } catch (error) {
    console.warn('MOOD site tools could not register.', error)
  }
}
