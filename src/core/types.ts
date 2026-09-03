export type Phase = 'explore' | 'direction' | 'refine' | 'system'
export type ReferenceStatus = 'neutral' | 'kept' | 'rejected'
export type DecisionStatus = 'emerging' | 'approved' | 'rejected'
export type CreatedBy = 'human' | 'agent'

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
  createdBy?: CreatedBy
}

export interface ReferenceGroup { id: string; title: string; referenceIds: string[] }
export interface Direction { id: string; title: string; statement: string; descriptors: string[]; referenceIds: string[]; palette: string[]; typography: TypographyToken[]; createdBy: CreatedBy; approved: boolean }
export interface DesignDecision { id: string; category: string; statement: string; supportingReferenceIds: string[]; status: DecisionStatus; locked: boolean; createdBy: CreatedBy }
export interface ColorToken { id: string; name: string; value: string; role: string; description: string }
export interface TypographyToken { id: string; role: string; family: string; weight: number; size: string; lineHeight: string }
export interface DesignSystem { mood: string[]; colors: ColorToken[]; typography: TypographyToken[]; shapeLanguage: string; photography: string; graphicLanguage: string; principles: string[] }

export type SuggestionMutation =
  | { type: 'add_references'; references: Reference[] }
  | { type: 'update_palette'; palette: string[] }
  | { type: 'create_decision'; decision: DesignDecision }
  | { type: 'update_typography'; tokenId: string; patch: Partial<TypographyToken> }
  | { type: 'add_principle'; principle: string }

export interface AgentSuggestion { id: string; title: string; detail: string; kind: 'reference' | 'palette' | 'type' | 'decision' | 'principle'; origin?: 'demo' | 'agent' | 'critique'; status: 'proposed' | 'applied' | 'rejected'; mutation: SuggestionMutation; evidenceIds?: string[]; changeSummary?: string; image?: string; undo?: SuggestionMutation }
export interface Critique { id: string; type: 'contrast' | 'palette' | 'hierarchy' | 'evidence'; severity: 'info' | 'warning' | 'critical'; title: string; detail: string; affectedIds: string[]; action?: SuggestionMutation; state?: 'open' | 'ignored' | 'applied' }
export interface ActivityEvent { id: string; label: string; actor: CreatedBy; at: string }
export interface Project { id: string; title: string; brief: string; avoid: string[]; isDemo?: boolean; currentPhase: Phase; projectVersion: number; references: Reference[]; referenceOrder: string[]; referenceGroups: ReferenceGroup[]; directions: Direction[]; selectedDirectionId: string | null; designDecisions: DesignDecision[]; designSystem: DesignSystem; suggestions: AgentSuggestion[]; ignoredCritiqueIds: string[]; activity: ActivityEvent[] }
