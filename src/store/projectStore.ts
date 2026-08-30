import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentSuggestion, DesignDecision, Direction, Phase, Project, Reference } from '../core/types'
import { wanderwellDemo } from '../data/wanderwellDemo'

type ProjectStore = {
  project: Project
  setPhase: (phase: Phase) => void
  keepReference: (id: string) => void
  rejectReference: (id: string) => void
  addReferenceNote: (id: string, notes: string) => void
  addReference: (reference: Reference) => void
  createDirection: (direction: Direction) => void
  selectDirection: (id: string) => void
  updateStatement: (statement: string) => void
  createDecision: (decision: DesignDecision) => void
  lockDecision: (id: string) => void
  removeDecision: (id: string) => void
  updatePalette: (colors: string[]) => void
  updateTypographyWeight: (id: string, weight: number) => void
  applySuggestion: (id: string) => void
  addSuggestion: (suggestion: AgentSuggestion) => void
  resetDemo: () => void
}

const updateProject = (project: Project, patch: Partial<Project>): Project => ({ ...project, ...patch })

export const useProjectStore = create<ProjectStore>()(persist((set) => ({
  project: wanderwellDemo,
  setPhase: (currentPhase) => set(({ project }) => ({ project: updateProject(project, { currentPhase }) })),
  keepReference: (id) => set(({ project }) => ({ project: updateProject(project, { references: project.references.map((reference) => reference.id === id ? { ...reference, status: 'kept' } : reference) }) })),
  rejectReference: (id) => set(({ project }) => ({ project: updateProject(project, { references: project.references.map((reference) => reference.id === id ? { ...reference, status: 'rejected' } : reference) }) })),
  addReferenceNote: (id, notes) => set(({ project }) => ({ project: updateProject(project, { references: project.references.map((reference) => reference.id === id ? { ...reference, notes } : reference) }) })),
  addReference: (reference) => set(({ project }) => ({ project: updateProject(project, { references: [...project.references, reference] }) })),
  createDirection: (direction) => set(({ project }) => ({ project: updateProject(project, { directions: [...project.directions, direction], selectedDirectionId: direction.id }) })),
  selectDirection: (id) => set(({ project }) => ({ project: updateProject(project, { selectedDirectionId: id }) })),
  updateStatement: (statement) => set(({ project }) => ({ project: updateProject(project, { directions: project.directions.map((direction) => direction.id === project.selectedDirectionId ? { ...direction, statement } : direction) }) })),
  createDecision: (decision) => set(({ project }) => ({ project: updateProject(project, { designDecisions: [...project.designDecisions, decision] }) })),
  lockDecision: (id) => set(({ project }) => ({ project: updateProject(project, { designDecisions: project.designDecisions.map((decision) => decision.id === id ? { ...decision, locked: true, status: 'locked' } : decision) }) })),
  removeDecision: (id) => set(({ project }) => ({ project: updateProject(project, { designDecisions: project.designDecisions.filter((decision) => decision.id !== id) }) })),
  updatePalette: (palette) => set(({ project }) => ({ project: updateProject(project, { directions: project.directions.map((direction) => direction.id === project.selectedDirectionId ? { ...direction, palette } : direction), designSystem: { ...project.designSystem, colors: project.designSystem.colors.map((color, index) => palette[index] ? { ...color, value: palette[index] } : color) } }) })),
  updateTypographyWeight: (id, weight) => set(({ project }) => ({ project: updateProject(project, { designSystem: { ...project.designSystem, typography: project.designSystem.typography.map((token) => token.id === id ? { ...token, weight } : token) } }) })),
  applySuggestion: (id) => set(({ project }) => ({ project: updateProject(project, { suggestions: project.suggestions.map((suggestion) => suggestion.id === id ? { ...suggestion, applied: true } : suggestion) }) })),
  addSuggestion: (suggestion) => set(({ project }) => ({ project: updateProject(project, { suggestions: [...project.suggestions, suggestion] }) })),
  resetDemo: () => set({ project: wanderwellDemo })
}), { name: 'mood-project-v1', version: 1 }))
