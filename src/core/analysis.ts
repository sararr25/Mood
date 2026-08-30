import type { Critique, Project } from './types'
import { contrastRatio, paletteDistance } from './color'

export const selectedDirection = (project: Project) => project.directions.find((direction) => direction.id === project.selectedDirectionId) ?? project.directions[0]

export const getCritiques = (project: Project): Critique[] => {
  const direction = selectedDirection(project)
  if (!direction) return []
  const critiques: Critique[] = []
  const surface = direction.palette[3] ?? '#FFFFFF'
  const ink = direction.palette[4] ?? direction.palette[0]
  const ratio = contrastRatio(ink, surface)
  critiques.push({
    id: 'contrast-primary-surface', type: 'contrast', severity: ratio >= 4.5 ? 'info' : 'critical', title: ratio >= 4.5 ? 'Primary ink clears readable contrast' : 'Primary ink needs more contrast',
    detail: `${ratio.toFixed(2)}:1 against the selected surface. ${ratio >= 4.5 ? 'This clears WCAG AA for normal text.' : 'Use the deep forest token for text on this surface.'}`,
    affectedIds: ['primary', 'surface'], action: ratio >= 4.5 ? undefined : { type: 'update_palette', palette: [...direction.palette.slice(0, 4), '#251913'] }
  })
  direction.palette.forEach((color, index) => direction.palette.slice(index + 1).forEach((other, nextIndex) => {
    const distance = paletteDistance(color, other)
    if (distance < 18) critiques.push({ id: `palette-${index}-${index + nextIndex + 1}`, type: 'palette', severity: 'warning', title: 'Two palette roles are very similar', detail: `${color} and ${other} are ${distance} Lab units apart. Keep them only if they have distinct semantic jobs.`, affectedIds: [color, other] })
  }))
  const display = direction.typography.find((token) => token.id === 'display') ?? direction.typography[0]
  const body = direction.typography.find((token) => token.id === 'body') ?? direction.typography[direction.typography.length - 1]
  if (display && body) critiques.push({ id: 'type-hierarchy', type: 'hierarchy', severity: display.weight - body.weight >= 250 ? 'info' : 'warning', title: display.weight - body.weight >= 250 ? 'Type hierarchy is visibly differentiated' : 'Increase the display-to-body hierarchy', detail: `${display.family} ${display.weight} is paired with ${body.family} ${body.weight}; a greater contrast keeps field information scannable.`, affectedIds: [display.id, body.id] })
  project.designDecisions.filter((decision) => decision.status !== 'rejected').forEach((decision) => {
    const activeEvidence = decision.supportingReferenceIds.filter((id) => project.references.some((reference) => reference.id === id && reference.status !== 'rejected'))
    if (activeEvidence.length === 0) critiques.push({ id: `evidence-${decision.id}`, type: 'evidence', severity: decision.locked ? 'warning' : 'critical', title: `${decision.category} lacks active reference evidence`, detail: decision.locked ? 'This locked human decision remains intact, but its original evidence is no longer active.' : 'Add or restore supporting references before approving this decision.', affectedIds: [decision.id, ...decision.supportingReferenceIds] })
  })
  return critiques.map((critique) => ({ ...critique, state: project.ignoredCritiqueIds.includes(critique.id) ? 'ignored' : 'open' }))
}

export const paletteEvaluation = (project: Project) => {
  const direction = selectedDirection(project)
  if (!direction) return { contrast: [], similarities: [] }
  return {
    contrast: direction.palette.map((color) => ({ color, againstSurface: contrastRatio(color, direction.palette[3] ?? '#FFFFFF') })),
    similarities: direction.palette.flatMap((color, index) => direction.palette.slice(index + 1).map((other) => ({ first: color, second: other, distance: paletteDistance(color, other) })))
  }
}
