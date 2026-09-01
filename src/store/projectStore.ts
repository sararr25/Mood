import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentSuggestion, ColorToken, CreatedBy, DesignDecision, DesignSystem, Direction, Phase, Project, Reference, SuggestionMutation, TypographyToken } from '../core/types'
import { wanderwellDemo } from '../data/wanderwellDemo'
import { activeDirection, synchronizeDesign, updatePalette as applyPalette, updatePaletteToken, updateSelectedDirection, updateTypography as applyTypography } from '../core/actions/designActions'

type DirectionPatch = Partial<Pick<Direction, 'title' | 'statement' | 'descriptors' | 'referenceIds' | 'palette' | 'typography' | 'approved'>>
type DecisionPatch = Partial<Pick<DesignDecision, 'category' | 'statement' | 'supportingReferenceIds' | 'status'>>
type ProjectInput = { name: string; brief: string; avoid?: string[] }
type ProjectStore = {
  projects: Project[]
  activeProjectId: string | null
  /** Compatibility projection of the active item; persisted project data lives in projects. */
  project: Project
  createProject: (input: ProjectInput) => Project
  openProject: (id: string) => boolean
  updateProject: (id: string, patch: Partial<Pick<Project, 'title' | 'brief' | 'avoid'>>) => boolean
  duplicateProject: (id: string) => Project | null
  deleteProject: (id: string) => boolean
  resetDemoProject: () => void
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
  updatePalette: (colors: string[], actor?: CreatedBy, labels?: Array<Partial<ColorToken>>) => void
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
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
export const getActiveProject = (state: Pick<ProjectStore, 'projects' | 'activeProjectId'>): Project | null => state.projects.find((project) => project.id === state.activeProjectId) ?? null

export const createEmptyProject = ({ name, brief, avoid = [] }: ProjectInput): Project => ({
  id: id('project'), title: name.trim(), brief: brief.trim(), avoid, currentPhase: 'explore', projectVersion: 1,
  references: [], referenceOrder: [], referenceGroups: [], directions: [], selectedDirectionId: null, designDecisions: [], ignoredCritiqueIds: [], suggestions: [], activity: [{ id: id('activity'), label: 'Project created', actor: 'human', at: new Date().toISOString() }],
  designSystem: { mood: ['Clear', 'Intentional', 'Human'], colors: [{ id: 'primary', name: 'Ink', value: '#251913', role: 'Primary', description: 'Primary type and action.' }, { id: 'secondary', name: 'Cobalt', value: '#0040E0', role: 'Secondary', description: 'Interaction accent.' }, { id: 'tertiary', name: 'Olive', value: '#4D6328', role: 'Tertiary', description: 'Organic accent.' }, { id: 'surface', name: 'Paper', value: '#FFF8F6', role: 'Surface', description: 'Primary surface.' }, { id: 'neutral', name: 'Clay', value: '#E0C0B2', role: 'Neutral', description: 'Quiet support.' }], typography: [{ id: 'display', role: 'Display', family: 'Bricolage Grotesque', weight: 800, size: '64px', lineHeight: '1.1' }, { id: 'head', role: 'Heading', family: 'EB Garamond', weight: 600, size: '48px', lineHeight: '1.2' }, { id: 'body', role: 'Body', family: 'Manrope', weight: 400, size: '16px', lineHeight: '1.6' }], shapeLanguage: 'Structured forms with generous space and clear hierarchy.', photography: 'Honest, useful imagery with a human point of view.', graphicLanguage: 'Simple annotations and confident contrast.', principles: ['Start with a clear point of view', 'Make every contrast purposeful', 'Keep the system human'] }
})

const stamp = (project: Project, label: string, actor: CreatedBy = 'human'): Project => ({ ...project, projectVersion: project.projectVersion + 1, activity: [{ id: id('activity'), label, actor, at: new Date().toISOString() }, ...project.activity].slice(0, 30) })
const selected = activeDirection
const withSelected = (project: Project, fn: (direction: Direction) => Direction): Project => ({ ...project, directions: project.directions.map((direction) => direction.id === project.selectedDirectionId ? fn(direction) : direction) })
const deriveSystem = synchronizeDesign

const applyMutation = (project: Project, mutation: SuggestionMutation): { project: Project; undo: SuggestionMutation } => {
  switch (mutation.type) {
    case 'add_references': return { project: { ...project, references: [...project.references, ...mutation.references.filter((reference) => !project.references.some((item) => item.id === reference.id))], referenceOrder: [...project.referenceOrder, ...mutation.references.map((reference) => reference.id).filter((referenceId) => !project.referenceOrder.includes(referenceId))] }, undo: mutation }
    case 'update_palette': return { project: applyPalette(project, mutation.palette), undo: { type: 'update_palette', palette: selected(project)?.palette ?? [] } }
    case 'create_decision': return { project: { ...project, designDecisions: project.designDecisions.some((decision) => decision.id === mutation.decision.id) ? project.designDecisions : [...project.designDecisions, mutation.decision] }, undo: mutation }
    case 'update_typography': return { project: applyTypography(project, mutation.tokenId, mutation.patch), undo: { type: 'update_typography', tokenId: mutation.tokenId, patch: project.designSystem.typography.find((token) => token.id === mutation.tokenId) ?? {} } }
    case 'add_principle': return { project: { ...project, designSystem: { ...project.designSystem, principles: Array.from(new Set([...project.designSystem.principles, mutation.principle])) } }, undo: mutation }
  }
}
const undoMutation = (project: Project, mutation: SuggestionMutation): Project => {
  switch (mutation.type) {
    case 'add_references': return { ...project, references: project.references.filter((item) => !mutation.references.some((reference) => reference.id === item.id)), referenceOrder: project.referenceOrder.filter((referenceId) => !mutation.references.some((reference) => reference.id === referenceId)) }
    case 'update_palette': return applyPalette(project, mutation.palette)
    case 'create_decision': return { ...project, designDecisions: project.designDecisions.filter((item) => item.id !== mutation.decision.id || item.locked) }
    case 'update_typography': return applyTypography(project, mutation.tokenId, mutation.patch)
    case 'add_principle': return { ...project, designSystem: { ...project.designSystem, principles: project.designSystem.principles.filter((principle) => principle !== mutation.principle) } }
  }
}

export const useProjectStore = create<ProjectStore>()(persist((set, get) => {
  const mutateActive = (label: string, fn: (project: Project) => Project, actor: CreatedBy = 'human') => set((state) => {
    const active = getActiveProject(state); if (!active) return state
    const next = stamp(fn(active), label, actor)
    return { projects: state.projects.map((project) => project.id === active.id ? next : project), project: next }
  })
  return {
    projects: [clone(wanderwellDemo)], activeProjectId: wanderwellDemo.id, project: clone(wanderwellDemo),
    createProject: (input) => { const project = createEmptyProject(input); set((state) => ({ projects: [...state.projects, project], activeProjectId: project.id, project })); return project },
    openProject: (projectId) => { const project = get().projects.find((item) => item.id === projectId); if (!project) return false; set({ activeProjectId: projectId, project }); return true },
    updateProject: (projectId, patch) => { if (!get().projects.some((project) => project.id === projectId)) return false; set((state) => { const updated = stamp({ ...(state.projects.find((item) => item.id === projectId)!), ...patch }, 'Updated project'); return { projects: state.projects.map((item) => item.id === projectId ? updated : item), project: state.activeProjectId === projectId ? updated : state.project } }); return true },
    duplicateProject: (projectId) => { const source = get().projects.find((project) => project.id === projectId); if (!source) return null; const duplicate = { ...clone(source), id: id('project'), title: `${source.title} copy`, isDemo: false, projectVersion: 1, activity: [{ id: id('activity'), label: `Duplicated from ${source.title}`, actor: 'human' as const, at: new Date().toISOString() }] }; set((state) => ({ projects: [...state.projects, duplicate], activeProjectId: duplicate.id, project: duplicate })); return duplicate },
    deleteProject: (projectId) => { const target = get().projects.find((project) => project.id === projectId); if (!target || target.isDemo) return false; set((state) => { const projects = state.projects.filter((project) => project.id !== projectId); const activeProjectId = state.activeProjectId === projectId ? projects[0]?.id ?? null : state.activeProjectId; return { projects, activeProjectId, project: projects.find((item) => item.id === activeProjectId) ?? clone(wanderwellDemo) } }); return true },
    resetDemoProject: () => set((state) => { const demo = clone(wanderwellDemo); return { projects: state.projects.map((project) => project.id === wanderwellDemo.id ? demo : project), activeProjectId: wanderwellDemo.id, project: demo } }),
    setPhase: (phase) => { if (getActiveProject(get())?.currentPhase === phase) return; mutateActive(`Moved to ${phase} phase`, (project) => ({ ...project, currentPhase: phase })) },
    keepReference: (referenceId) => mutateActive('Kept a reference', (project) => ({ ...project, references: project.references.map((reference) => reference.id === referenceId ? { ...reference, status: 'kept' } : reference) })),
    rejectReference: (referenceId) => mutateActive('Rejected a reference', (project) => ({ ...project, references: project.references.map((reference) => reference.id === referenceId ? { ...reference, status: 'rejected' } : reference) })),
    restoreReference: (referenceId) => mutateActive('Restored a reference', (project) => ({ ...project, references: project.references.map((reference) => reference.id === referenceId ? { ...reference, status: 'neutral' } : reference) })),
    removeReference: (referenceId) => mutateActive('Removed a reference', (project) => ({ ...project, references: project.references.filter((reference) => reference.id !== referenceId), referenceOrder: project.referenceOrder.filter((id) => id !== referenceId), directions: project.directions.map((direction) => ({ ...direction, referenceIds: direction.referenceIds.filter((id) => id !== referenceId) })) })),
    reorderReferences: (activeId, overId) => mutateActive('Reordered references', (project) => { const order = project.referenceOrder.length ? [...project.referenceOrder] : project.references.map((reference) => reference.id); const from = order.indexOf(activeId); const to = order.indexOf(overId); if (from < 0 || to < 0) return project; order.splice(from, 1); order.splice(to, 0, activeId); return { ...project, referenceOrder: order } }),
    addReferenceNote: (referenceId, notes) => mutateActive('Added a reference note', (project) => ({ ...project, references: project.references.map((reference) => reference.id === referenceId ? { ...reference, notes } : reference) })),
    addReference: (reference, actor = 'human') => mutateActive('Added a reference', (project) => ({ ...project, references: project.references.some((item) => item.id === reference.id) ? project.references : [...project.references, { ...reference, createdBy: actor }], referenceOrder: project.referenceOrder.includes(reference.id) ? project.referenceOrder : [...project.referenceOrder, reference.id] }), actor),
    createDirection: (direction) => mutateActive('Created a direction', (project) => ({ ...project, directions: [...project.directions, direction], selectedDirectionId: direction.id }), direction.createdBy),
    updateDirection: (directionId, patch) => mutateActive('Updated a direction', (project) => updateSelectedDirection(project, directionId, patch)),
    selectDirection: (directionId) => mutateActive('Selected a direction', (project) => deriveSystem({ ...project, selectedDirectionId: project.directions.some((direction) => direction.id === directionId) ? directionId : project.selectedDirectionId })),
    approveDirection: (directionId) => mutateActive('Approved a direction', (project) => deriveSystem({ ...project, directions: project.directions.map((direction) => ({ ...direction, approved: direction.id === directionId })), selectedDirectionId: directionId })),
    updateStatement: (statement) => mutateActive('Edited direction statement', (project) => deriveSystem(withSelected(project, (direction) => ({ ...direction, statement })))),
    createDecision: (decision) => mutateActive('Created a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.some((item) => item.id === decision.id) ? project.designDecisions : [...project.designDecisions, decision] }), decision.createdBy),
    updateDecision: (decisionId, patch) => { const current = getActiveProject(get())?.designDecisions.find((decision) => decision.id === decisionId); if (current?.locked) return { success: false, reason: 'Locked human decisions cannot be overwritten.' }; mutateActive('Updated a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.map((decision) => decision.id === decisionId ? { ...decision, ...patch } : decision) })); return { success: true } },
    lockDecision: (decisionId) => mutateActive('Locked a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.map((decision) => decision.id === decisionId ? { ...decision, locked: true, status: 'approved' } : decision) })),
    rejectDecision: (decisionId) => mutateActive('Rejected a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.map((decision) => decision.id === decisionId && !decision.locked ? { ...decision, status: 'rejected' } : decision) })),
    removeDecision: (decisionId) => mutateActive('Removed a design decision', (project) => ({ ...project, designDecisions: project.designDecisions.filter((decision) => decision.id !== decisionId || decision.locked) })),
    updatePalette: (palette, actor = 'human', labels) => mutateActive('Updated the direction palette', (project) => applyPalette(project, palette, labels), actor),
    updateTypographyWeight: (tokenId, weight) => mutateActive('Updated typography weight', (project) => applyTypography(project, tokenId, { weight })),
    setDesignSystem: (designSystem) => mutateActive('Set design system metadata', (project) => synchronizeDesign({ ...project, designSystem: { ...project.designSystem, mood: designSystem.mood, shapeLanguage: designSystem.shapeLanguage, photography: designSystem.photography, graphicLanguage: designSystem.graphicLanguage, principles: designSystem.principles } })),
    updateColorToken: (tokenId, patch) => mutateActive('Updated a color token', (project) => updatePaletteToken(project, tokenId, patch)),
    updateTypographyToken: (tokenId, patch) => mutateActive('Updated a typography token', (project) => applyTypography(project, tokenId, patch)),
    updateDesignPrinciple: (index, principle) => mutateActive('Updated a design principle', (project) => ({ ...project, designSystem: { ...project.designSystem, principles: project.designSystem.principles.map((item, itemIndex) => itemIndex === index ? principle : item) } })),
    applySuggestion: (suggestionId) => { const suggestion = getActiveProject(get())?.suggestions.find((item) => item.id === suggestionId); if (!suggestion || suggestion.status !== 'proposed') return { success: false, reason: 'Suggestion is no longer proposed.' }; mutateActive(`Applied suggestion: ${suggestion.title}`, (project) => { const current = project.suggestions.find((item) => item.id === suggestionId); if (!current || current.status !== 'proposed') return project; const applied = applyMutation(project, current.mutation); return { ...applied.project, suggestions: applied.project.suggestions.map((item) => item.id === suggestionId ? { ...item, status: 'applied', undo: applied.undo } : item) } }, 'agent'); return { success: true } },
    rejectSuggestion: (suggestionId) => mutateActive('Rejected an agent suggestion', (project) => ({ ...project, suggestions: project.suggestions.map((suggestion) => suggestion.id === suggestionId ? { ...suggestion, status: 'rejected' } : suggestion) })),
    undoSuggestion: (suggestionId) => mutateActive('Undid an agent suggestion', (project) => { const suggestion = project.suggestions.find((item) => item.id === suggestionId); if (!suggestion?.undo || suggestion.status !== 'applied') return project; const reverted = undoMutation(project, suggestion.undo); return { ...reverted, suggestions: reverted.suggestions.map((item) => item.id === suggestionId ? { ...item, status: 'proposed', undo: undefined } : item) } }),
    addSuggestion: (suggestion) => mutateActive(suggestion.origin === 'agent' ? 'Created a site-tool suggestion' : suggestion.origin === 'critique' ? 'Created a local critique suggestion' : 'Created a demo suggestion', (project) => ({ ...project, suggestions: [...project.suggestions, suggestion] }), suggestion.origin === 'agent' ? 'agent' : 'human'),
    ignoreCritique: (critiqueId) => mutateActive('Ignored a critique', (project) => ({ ...project, ignoredCritiqueIds: Array.from(new Set([...project.ignoredCritiqueIds, critiqueId])) }))
  }
}, { name: 'mood-projects-v1', version: 1 }))
