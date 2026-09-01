import type { ColorToken, Direction, Project, TypographyToken } from '../types'

/** The selected direction is canonical; System is a projection, never a second source of truth. */
export const activeDirection = (project: Project) => project.directions.find((item) => item.id === project.selectedDirectionId)

export const synchronizeDesign = (project: Project): Project => {
  const direction = activeDirection(project)
  if (!direction) return project
  const approved = project.designDecisions.filter((item) => item.status === 'approved' || item.locked)
  return { ...project, designSystem: { ...project.designSystem, mood: [...direction.descriptors], colors: direction.palette.map((value, index) => ({ ...(project.designSystem.colors[index] ?? { id: `color-${index + 1}`, name: `Color ${index + 1}`, role: `Color ${index + 1}`, description: '' }), value })), typography: direction.typography.map((token) => ({ ...token })), principles: Array.from(new Set([...project.designSystem.principles, ...approved.map((item) => item.statement)])) } }
}

export const updatePalette = (project: Project, palette: string[], labels?: Array<Partial<ColorToken>>): Project => synchronizeDesign({ ...project, designSystem: { ...project.designSystem, colors: project.designSystem.colors.map((token, index) => ({ ...token, ...labels?.[index] })) }, directions: project.directions.map((item) => item.id === project.selectedDirectionId ? { ...item, palette: [...palette] } : item) })
export const updateTypography = (project: Project, tokenId: string, patch: Partial<TypographyToken>): Project => synchronizeDesign({ ...project, directions: project.directions.map((item) => item.id === project.selectedDirectionId ? { ...item, typography: item.typography.map((token) => token.id === tokenId ? { ...token, ...patch } : token) } : item) })
export const updatePaletteToken = (project: Project, tokenId: string, patch: Partial<ColorToken>): Project => {
  const index = project.designSystem.colors.findIndex((token) => token.id === tokenId)
  if (index < 0) return project
  const metadata = project.designSystem.colors.map((token) => token.id === tokenId ? { ...token, ...patch } : token)
  const palette = activeDirection(project)?.palette ?? metadata.map((token) => token.value)
  const next = patch.value ? palette.map((value, i) => i === index ? patch.value! : value) : palette
  return synchronizeDesign({ ...updatePalette(project, next), designSystem: { ...project.designSystem, colors: metadata } })
}
export const updateSelectedDirection = (project: Project, id: string, patch: Partial<Direction>): Project => {
  const next = { ...project, directions: project.directions.map((item) => item.id === id ? { ...item, ...patch } : item) }
  return id === project.selectedDirectionId ? synchronizeDesign(next) : next
}
