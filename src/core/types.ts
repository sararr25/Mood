export type Phase = 'explore' | 'direction' | 'refine' | 'system'
export type ReferenceStatus = 'neutral' | 'kept' | 'rejected'
export type DecisionStatus = 'emerging' | 'locked' | 'resolved'

export interface Reference {
  id: string
  title: string
  image: string
  source: string
  tags: string[]
  notes: string
  status: ReferenceStatus
  group: string
  extractedColors: string[]
  rotation?: number
}

export interface ReferenceGroup { id: string; title: string; referenceIds: string[] }
export interface Direction { id: string; title: string; statement: string; descriptors: string[]; referenceIds: string[]; palette: string[]; typography: TypographyToken[] }
export interface DesignDecision { id: string; category: string; statement: string; supportingReferenceIds: string[]; status: DecisionStatus; locked: boolean; createdBy: 'human' | 'agent' }
export interface ColorToken { id: string; name: string; value: string; role: string; description: string }
export interface TypographyToken { id: string; role: string; family: string; weight: number; size: string; lineHeight: string }
export interface DesignSystem { mood: string[]; colors: ColorToken[]; typography: TypographyToken[]; shapeLanguage: string; photography: string; graphicLanguage: string; principles: string[] }
export interface AgentSuggestion { id: string; title: string; detail: string; kind: 'reference' | 'palette' | 'type'; applied: boolean; image?: string }
export interface Project { id: string; title: string; brief: string; currentPhase: Phase; references: Reference[]; referenceGroups: ReferenceGroup[]; directions: Direction[]; selectedDirectionId: string; designDecisions: DesignDecision[]; designSystem: DesignSystem; suggestions: AgentSuggestion[] }
