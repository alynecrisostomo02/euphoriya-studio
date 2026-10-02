export type I_euphoriyaCanonStatus =
  | 'DRAFT'
  | 'PROPOSED'
  | 'CANON'
  | 'DISPUTED'
  | 'RUMOR'
  | 'RETCONNED'
  | 'DEPRECATED'

export type I_euphoriyaKnowledgeState =
  | 'KNOWS'
  | 'SUSPECTS'
  | 'BELIEVES'
  | 'BELIEVES_WRONGLY'
  | 'DENIES'
  | 'FORGOT'
  | 'UNKNOWN'

export type I_euphoriyaCustomFieldType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'ENTITY_REFERENCE'
  | 'ENTITY_REFERENCE_LIST'
  | 'MEDIA'
  | 'URL'

export interface I_euphoriyaEntity {
  id: string
  worldId: string
  typeId: string
  name: string
  slug: string
  summary: string | null
  description: string | null
  canonStatus: I_euphoriyaCanonStatus
  createdAtMs: number
  updatedAtMs: number
}

export interface I_euphoriyaCharacterPsychology {
  characterId: string
  desire: string | null
  need: string | null
  wound: string | null
  fear: string | null
  contradiction: string | null
  secret: string | null
  motivation: string | null
  values: string | null
  internalConflict: string | null
  externalGoal: string | null
}

export interface I_euphoriyaCharacter {
  entityId: string
  worldId: string
  status: string | null
  speciesEntityId: string | null
  raceEntityId: string | null
  age: string | null
  role: string | null
}

export interface I_euphoriyaRelationship {
  id: string
  worldId: string
  sourceEntityId: string
  targetEntityId: string
  relationshipTypeId: string
  isDirected: boolean
  validFrom: string | null
  validUntil: string | null
  validFromValue: number | null
  validUntilValue: number | null
  canonStatus: I_euphoriyaCanonStatus
  notes: string | null
}

export interface I_euphoriyaCharacterKnowledge {
  id: string
  worldId: string
  characterId: string
  factId: string
  state: I_euphoriyaKnowledgeState
  learnedAtEventId: string | null
  learnedAtSceneId: string | null
  sourceEntityId: string | null
  confidence: number | null
  notes: string | null
}
