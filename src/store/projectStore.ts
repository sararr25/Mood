import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentSuggestion, ColorToken, CreatedBy, DesignDecision, DesignSystem, Direction, Phase, Project, Reference, SuggestionMutation, TypographyToken } from '../core/types'
import { wanderwellDemo } from '../data/wanderwellDemo'

type DirectionPatch = Partial<Pick<Direction, 'title' | 'statement' | 'descriptors' | 'referenceIds' | 'palette' | 'typography' | 'approved'>>
type DecisionPatch = Partial<Pick<DesignDecision, 'category' | 'statement' | 'supportingReferenceIds' | 'status'>>
type ProjectStore = {
  project: Project
  setPhase: (phase: Phase) => void
  keepReference: (id: string) => void
  rejectReference: (id: string) => void
  restoreReference: (id: string) => void
  removeReference: (id: string) => void
  reorderReferences: (activeId: string, overId: string) => void
  addReferenceNote: (id: string, notes: string) => void
  addReference: (reference: Reference, actor?: CreatedBy) => void
  createDirection: (direction: Direction) => void
  updateDirection: (id: string, patch: DirectionPatch) => void
  selectDirection: (id: string) => void
  approveDirection: (id: string) => void
  updateStatement: (statement: string) => void
  createDecision: (decision: DesignDecision) => void
  updateDecision: (id: string, patch: DecisionPatch) => { success: boolean; reason?: string }
  lockDecision: (id: string) => void
  rejectDecision: (id: string) => void
  removeDecision: (id: string) => void
  updatePalette: (colors: string[]) => void
  updateTypographyWeight: (id: string, weight: number) => void
  setDesignSystem: (system: DesignSystem) => void
  updateColorToken: (id: string, patch: Partial<ColorToken>) => void
  updateTypographyToken: (id: string, patch: Partial<TypographyToken>) => void
  updateDesignPrinciple: (index: number, principle: string) => void
  applySuggestion: (id: string) => { success: boolean; reason?: string }
  rejectSuggestion: (id: string) => void
  undoSuggestion: (id: string) => void
  addSuggestion: (suggestion: AgentSuggestion) => void
  ignoreCritique: (id: string) => void
  resetDemo: () => void
}

const stamp = (project: Project, label: string, actor: CreatedBy = 'human'): Project => ({
  ...project,
  projectVersion: project.projectVersion + 1,
  activity: [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, actor, at: new Date().toISOString() }, ...project.activity].slice(0, 30)
})

const mutate = (set: (partial: ProjectStore | Partial<ProjectStore> | ((state: ProjectStore) => ProjectStore | Partial<ProjectStore>), replace?: false) => void, label: string, fn: (project: Project) => Project, actor: CreatedBy = 'human') => {
  set(({ project }) => ({ project: stamp(fn(project), label, actor) }))
}

const selected = (project: Project) => project.directions.find((direction) => direction.id === project.selectedDirectionId)
const withSelected = (project: Project, fn: (direction: Direction) => Direction): Project => ({ ...project, directions: project.directions.map((direction) => direction.id === project.selectedDirectionId ? fn(direction) : direction) })
const derivedSystem = (project: Project, direction = selected(project)): Project => {
  if (!direction) return project
  const approved = project.designDecisions.filter((decision) => decision.status === 'approved' || decision.locked)
  return {
    ...project,
    designSystem: {
      ...project.designSystem,
      mood: direction.descriptors,
      colors: project.designSystem.colors.map((token, index) => direction.palette[index] ? { ...token, value: direction.palette[index] } : token),
      typography: direction.typography.map((token) => ({ ...token })),
      principles: Array.from(new Set([...project.designSystem.principles, ...approved.map((decision) => decision.statement)]))
    }
  }
}

const applyMutation = (project: Project, mutation: SuggestionMutation): { project: Project; undo: SuggestionMutation } => {
  switch (mutation.type) {
    case 'add_references':
      return { project: { ...project, references: [...project.references, ...mutation.references.filter((reference) => !project.references.some((item) => item.id === reference.id))], referenceOrder: [...project.referenceOrder, ...mutation.references.map((reference) => reference.id).filter((id) => !project.referenceOrder.includes(id))] }, undo: { type: 'add_references', references: mutation.references } }
    case 'update_palette': {
      const prior = selected(project)?.palette ?? []
      return { project: derivedSystem(withSelected(project, (direction) => ({ ...direction, palette: mutation.palette }))), undo: { type: 'update_palette', palette: prior } }
    }
    case 'create_decision':
      return { project: { ...project, designDecisions: project.designDecisions.some((item) => item.id === mutation.decision.id) ? project.designDecisions : [...project.designDecisions, mutation.decision] }, undo: { type: 'create_decision', decision: mutation.decision } }
    case 'update_typography': {
      const prior = project.designSystem.typography.find((token) => token.id === mutation.tokenId)
      return { project: { ...project, designSystem: { ...project.designSystem, typography: project.designSystem.typography.map((token) => token.id === mutation.tokenId ? { ...token, ...mutation.patch } : token) } }, undo: { type: 'update_typography', tokenId: mutation.tokenId, patch: prior ?? {} } }
    }
    case 'add_principle':
      return { project: { ...project, designSystem: { ...project.designSystem, principles: Array.from(new Set([...project.designSystem.principles, mutation.principle])) } }, undo: { type: 'add_principle', principle: mutation.principle } }
  }
}

const undoMutation = (project: Project, mutation: SuggestionMutation): Project => {
  switch (mutation.type) {
    case 'add_references': return { ...project, references: project.references.filter((item) => !mutation.references.some((reference) => reference.id === item.id)), referenceOrder: project.referenceOrder.filter((id) => !mutation.references.some((reference) => reference.id === id)) }
    case 'update_palette': return derivedSystem(withSelected(project, (direction) => ({ ...direction, palette: mutation.palette })))
    case 'create_decision': return { ...project, designDecisions: project.designDecisions.filter((item) => item.id !== mutation.decision.id || item.locked) }
    case 'update_typography': return { ...project, designSystem: { ...project.designSystem, typography: project.designSystem.typography.map((token) => token.id === mutation.tokenId ? { ...token, ...mutation.patch } : token) } }
    case 'add_principle': return { ...project, designSystem: { ...project.designSystem, principles: project.designSystem.principles.filter((principle) => principle !== mutation.principle) } }
  }
}

export const useProjectStore = create<ProjectStore>()(persist((set) => ({
  project: wanderwellDemo,
  setPhase: (phase) => mutate(set, `Moved to ${phase} phase`, (project) => ({ ...project, currentPhase: phase })),
  keepReference: (id) => mutate(set, 'Kept a reference', (project) => ({ ...project, references: project.references.map((reference) => reference.id === id ? { ...reference, status: 'kept' } : reference) })),
  rejectReference: (id) => mutate(set, 'Rejected a reference', (project) => ({ ...project, references: project.references.map((reference) => reference.id === id ? { ...reference, status: 'rejected' } : reference) })),
  restoreReference: (id) => mutate(set, 'Restored a reference', (project) => ({ ...project, references: project.references.map((reference) => reference.id === id ? { ...reference, status: 'neutral' } : reference) })),
  removeReference: (id) => mutate(set, 'Removed a reference', (project) => ({ ...project, references: project.references.filter((reference) => reference.id !== id), referenceOrder: project.referenceOrder.filter((referenceId) => referenceId !== id), directions: project.directions.map((direction) => ({ ...direction, referenceIds: direction.referenceIds.filter((referenceId) => referenceId !== id) })) })),
  reorderReferences: (activeId, overId) => mutate(set, 'Reordered references', (project) => {
    const order = project.referenceOrder.length ? [...project.referenceOrder] : project.references.map((reference) => reference.id)
    const oldIndex = order.indexOf(activeId); const newIndex = order.indexOf(overId)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return project
    order.splice(oldIndex, 1); order.splice(newIndex, 0, activeId)
    return { ...project, referenceOrder: order }
  }),
  addReferenceNote: (id, notes) => mutate(set, 'Added a reference note', (project) => ({ ...project, references: project.references.map((reference) => reference.id === id ? { ...reference, notes } : reference) })),
  addReference: (reference, actor = 'human') => mutate(set, 'Added a reference', (project) => ({ ...project, references: project.references.some((item) => item.id === reference.id) ? project.references : [...project.references, { ...reference, createdBy: actor }], referenceOrder: project.referenceOrder.includes(reference.id) ? project.referenceOrder : [...project.referenceOrder, reference.id] }), actor),
  createDirection: (direction) => mutate(set, 'Created a direction', (project) => ({ ...project, directions: [...project.directions, direction], selectedDirectionId: direction.id }), direction.createdBy),
  updateDirection: (id, patch) => mutate(set, 'Updated a direction', (project) => derivedSystem({ ...project, directions: project.directions.map((direction) => direction.id === id ? { ...direction, ...patch } : direction) })),
  selectDirection: (id) => mutate(set, 'Selected a direction', (project) => derivedSystem({ ...project, selectedDirectionId: project.directions.some((direction) => direction.id === id) ? id : project.selectedDirectionId })),
  approveDirection: (id) => mutate(set, 'Approved a direction', (project) => derivedSystem({ ...project, directions: project.directions.map((direction) => ({ ...direction, approved: direction.id === id })), selectedDirectionId: id })),
  updateStatement: (statement) => mutate(set, 'Edited direction statement', (project) => derivedSystem(withSelected(project, (direction) => ({ ...direction, statement })))),
  createDecision: (decision) => mutate(set, 'Created a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.some((item) => item.id === decision.id) ? project.designDecisions : [...project.designDecisions, decision] }), decision.createdBy),
  updateDecision: (id, patch) => {
    const existing = useProjectStore.getState().project.designDecisions.find((decision) => decision.id === id)
    if (existing?.locked) return { success: false, reason: 'Locked human decisions cannot be overwritten.' }
    mutate(set, 'Updated a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.map((decision) => decision.id === id ? { ...decision, ...patch } : decision) }))
    return { success: true }
  },
  lockDecision: (id) => mutate(set, 'Locked a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.map((decision) => decision.id === id ? { ...decision, locked: true, status: 'approved' } : decision) })),
  rejectDecision: (id) => {
    const existing = useProjectStore.getState().project.designDecisions.find((decision) => decision.id === id)
    if (existing?.locked) return
    mutate(set, 'Rejected a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.map((decision) => decision.id === id ? { ...decision, status: 'rejected' } : decision) }))
  },
  removeDecision: (id) => mutate(set, 'Removed a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.filter((decision) => decision.id !== id || decision.locked) })),
  updatePalette: (palette) => mutate(set, 'Updated the direction palette', (project) => derivedSystem(withSelected(project, (direction) => ({ ...direction, palette })))),
  updateTypographyWeight: (id, weight) => mutate(set, 'Updated typography weight', (project) => ({ ...project, designSystem: { ...project.designSystem, typography: project.designSystem.typography.map((token) => token.id === id ? { ...token, weight } : token) } })),
  setDesignSystem: (designSystem) => mutate(set, 'Set design system', (project) => ({ ...project, designSystem })),
  updateColorToken: (id, patch) => mutate(set, 'Updated a color token', (project) => ({ ...project, designSystem: { ...project.designSystem, colors: project.designSystem.colors.map((token) => token.id === id ? { ...token, ...patch } : token) } })),
  updateTypographyToken: (id, patch) => mutate(set, 'Updated a typography token', (project) => ({ ...project, designSystem: { ...project.designSystem, typography: project.designSystem.typography.map((token) => token.id === id ? { ...token, ...patch } : token) } })),
  updateDesignPrinciple: (index, principle) => mutate(set, 'Updated a design principle', (project) => ({ ...project, designSystem: { ...project.designSystem, principles: project.designSystem.principles.map((item, itemIndex) => itemIndex === index ? principle : item) } })),
  applySuggestion: (id) => {
    const suggestion = useProjectStore.getState().project.suggestions.find((item) => item.id === id)
    if (!suggestion || suggestion.status !== 'proposed') return { success: false, reason: 'Suggestion is no longer proposed.' }
    mutate(set, `Applied suggestion: ${suggestion.title}`, (project) => {
      const current = project.suggestions.find((item) => item.id === id)
      if (!current || current.status !== 'proposed') return project
      const applied = applyMutation(project, current.mutation)
      return { ...applied.project, suggestions: applied.project.suggestions.map((item) => item.id === id ? { ...item, status: 'applied', undo: applied.undo } : item) }
    }, 'agent')
    return { success: true }
  },
  rejectSuggestion: (id) => mutate(set, 'Rejected an agent suggestion', (project) => ({ ...project, suggestions: project.suggestions.map((suggestion) => suggestion.id === id ? { ...suggestion, status: 'rejected' } : suggestion) })),
  undoSuggestion: (id) => mutate(set, 'Undid an agent suggestion', (project) => {
    const suggestion = project.suggestions.find((item) => item.id === id)
    if (!suggestion?.undo || suggestion.status !== 'applied') return project
    const reverted = undoMutation(project, suggestion.undo)
    return { ...reverted, suggestions: reverted.suggestions.map((item) => item.id === id ? { ...item, status: 'proposed', undo: undefined } : item) }
  }),
  addSuggestion: (suggestion) => mutate(set, 'Created an agent suggestion', (project) => ({ ...project, suggestions: [...project.suggestions, suggestion] }), 'agent'),
  ignoreCritique: (id) => mutate(set, 'Ignored a critique', (project) => ({ ...project, ignoredCritiqueIds: Array.from(new Set([...project.ignoredCritiqueIds, id])) })),
  resetDemo: () => set({ project: wanderwellDemo })
}), { name: 'mood-project-v2', version: 2 }))
