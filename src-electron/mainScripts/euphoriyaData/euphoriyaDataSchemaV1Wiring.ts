import type { I_euphoriyaSchemaDb } from 'app/types/I_euphoriyaSchemaDb'

import { EUPHORIYA_DATA_SCHEMA_V1_CORE_SQL } from './functions/euphoriyaDataSchemaV1CoreSql'
import { EUPHORIYA_DATA_SCHEMA_V1_EXTENSIONS_SQL } from './functions/euphoriyaDataSchemaV1ExtensionsSql'
import { EUPHORIYA_DATA_SCHEMA_V1_SEARCH_SQL } from './functions/euphoriyaDataSchemaV1SearchSql'

export const EUPHORIYA_DATA_SCHEMA_V1_SQL = [
  EUPHORIYA_DATA_SCHEMA_V1_CORE_SQL,
  EUPHORIYA_DATA_SCHEMA_V1_EXTENSIONS_SQL,
  EUPHORIYA_DATA_SCHEMA_V1_SEARCH_SQL
].join('')

const SEED_ENTITY_TYPES_SQL = `
INSERT OR IGNORE INTO entity_types(id, key, display_name, is_system) VALUES
  ('character', 'character', 'Character', 1),
  ('species', 'species', 'Species', 1),
  ('race', 'race', 'Race', 1),
  ('clan', 'clan', 'Clan', 1),
  ('family', 'family', 'Family', 1),
  ('faction', 'faction', 'Faction', 1),
  ('organization', 'organization', 'Organization', 1),
  ('location', 'location', 'Location', 1),
  ('item', 'item', 'Item', 1),
  ('artifact', 'artifact', 'Artifact', 1),
  ('creature', 'creature', 'Creature', 1),
  ('ability', 'ability', 'Ability', 1),
  ('magic-system', 'magic-system', 'Magic system', 1),
  ('culture', 'culture', 'Culture', 1),
  ('religion', 'religion', 'Religion', 1);
`

const SEED_RELATIONSHIP_TYPES_SQL = `
INSERT OR IGNORE INTO relationship_types(id, key, display_name, inverse_type_id, is_symmetric, is_system) VALUES
  ('parent_of', 'parent_of', 'Parent of', 'child_of', 0, 1),
  ('child_of', 'child_of', 'Child of', 'parent_of', 0, 1),
  ('spouse_of', 'spouse_of', 'Spouse of', 'spouse_of', 1, 1),
  ('friend_of', 'friend_of', 'Friend of', 'friend_of', 1, 1),
  ('enemy_of', 'enemy_of', 'Enemy of', 'enemy_of', 1, 1),
  ('member_of', 'member_of', 'Member of', 'has_member', 0, 1),
  ('has_member', 'has_member', 'Has member', 'member_of', 0, 1),
  ('located_in', 'located_in', 'Located in', 'contains', 0, 1),
  ('contains', 'contains', 'Contains', 'located_in', 0, 1),
  ('owns', 'owns', 'Owns', 'owned_by', 0, 1),
  ('owned_by', 'owned_by', 'Owned by', 'owns', 0, 1),
  ('mentor_of', 'mentor_of', 'Mentor of', 'mentored_by', 0, 1),
  ('mentored_by', 'mentored_by', 'Mentored by', 'mentor_of', 0, 1),
  ('allied_with', 'allied_with', 'Allied with', 'allied_with', 1, 1),
  ('rival_of', 'rival_of', 'Rival of', 'rival_of', 1, 1);
`

/** The caller must wrap schema creation and seed insertion in its migration transaction. */
export function applyEuphoriyaDataSchemaV1 (db: I_euphoriyaSchemaDb): void {
  db.exec(EUPHORIYA_DATA_SCHEMA_V1_SQL)
  db.exec(SEED_ENTITY_TYPES_SQL)
  db.exec(SEED_RELATIONSHIP_TYPES_SQL)
}
