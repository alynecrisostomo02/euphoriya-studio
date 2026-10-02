import type { I_euphoriyaSchemaDb } from 'app/types/I_euphoriyaSchemaDb'

export const EUPHORIYA_DATA_SCHEMA_V1_SQL = String.raw`
CREATE TABLE IF NOT EXISTS entity_types (
  id TEXT NOT NULL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE CHECK (length(key) BETWEEN 1 AND 128),
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  parent_type_id TEXT REFERENCES entity_types(id) ON DELETE RESTRICT,
  is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1))
);

CREATE TABLE IF NOT EXISTS entities (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  type_id TEXT NOT NULL REFERENCES entity_types(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  slug TEXT NOT NULL CHECK (length(trim(slug)) > 0),
  summary TEXT,
  description TEXT,
  canon_status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (canon_status IN ('DRAFT', 'PROPOSED', 'CANON', 'DISPUTED', 'RUMOR', 'RETCONNED', 'DEPRECATED')),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  UNIQUE (world_id, slug),
  UNIQUE (world_id, id)
);

CREATE INDEX IF NOT EXISTS idx_entities_world_type_name
  ON entities(world_id, type_id, name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS entity_aliases (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  alias TEXT NOT NULL CHECK (length(trim(alias)) > 0),
  normalized_alias TEXT NOT NULL CHECK (length(trim(normalized_alias)) > 0),
  created_at_ms INTEGER NOT NULL,
  FOREIGN KEY (world_id, entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE,
  UNIQUE (world_id, normalized_alias)
);

CREATE INDEX IF NOT EXISTS idx_entity_aliases_entity
  ON entity_aliases(world_id, entity_id);

CREATE TABLE IF NOT EXISTS relationship_types (
  id TEXT NOT NULL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE CHECK (length(trim(key)) > 0),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
  inverse_type_id TEXT REFERENCES relationship_types(id) ON DELETE SET NULL,
  is_symmetric INTEGER NOT NULL DEFAULT 0 CHECK (is_symmetric IN (0, 1)),
  is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1))
);

CREATE TABLE IF NOT EXISTS relationships (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  source_entity_id TEXT NOT NULL,
  target_entity_id TEXT NOT NULL,
  relationship_type_id TEXT NOT NULL REFERENCES relationship_types(id) ON DELETE RESTRICT,
  label TEXT,
  is_directed INTEGER NOT NULL DEFAULT 1 CHECK (is_directed IN (0, 1)),
  valid_from TEXT,
  valid_until TEXT,
  valid_from_value REAL,
  valid_until_value REAL,
  canon_status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (canon_status IN ('DRAFT', 'PROPOSED', 'CANON', 'DISPUTED', 'RUMOR', 'RETCONNED', 'DEPRECATED')),
  notes TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  FOREIGN KEY (world_id, source_entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE,
  FOREIGN KEY (world_id, target_entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE,
  CHECK (valid_until_value IS NULL OR valid_from_value IS NULL OR valid_until_value >= valid_from_value)
);

CREATE INDEX IF NOT EXISTS idx_relationships_world_source
  ON relationships(world_id, source_entity_id, relationship_type_id);
CREATE INDEX IF NOT EXISTS idx_relationships_world_target
  ON relationships(world_id, target_entity_id, relationship_type_id);

CREATE TABLE IF NOT EXISTS characters (
  entity_id TEXT NOT NULL PRIMARY KEY REFERENCES entities(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  status TEXT,
  species_entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  race_entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  age TEXT,
  role TEXT,
  FOREIGN KEY (world_id, entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE,
  UNIQUE (world_id, entity_id)
);

CREATE TRIGGER IF NOT EXISTS euphoriya_characters_validate_references_insert
BEFORE INSERT ON characters
WHEN
  (new.species_entity_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM entities
    WHERE id = new.species_entity_id AND world_id = new.world_id AND type_id = 'species'
  ))
  OR (new.race_entity_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM entities
    WHERE id = new.race_entity_id AND world_id = new.world_id AND type_id = 'race'
  ))
BEGIN
  SELECT RAISE(ABORT, 'Character species and race references must match the world and entity type');
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_characters_validate_references_update
BEFORE UPDATE OF world_id, species_entity_id, race_entity_id ON characters
WHEN
  (new.species_entity_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM entities
    WHERE id = new.species_entity_id AND world_id = new.world_id AND type_id = 'species'
  ))
  OR (new.race_entity_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM entities
    WHERE id = new.race_entity_id AND world_id = new.world_id AND type_id = 'race'
  ))
BEGIN
  SELECT RAISE(ABORT, 'Character species and race references must match the world and entity type');
END;

CREATE TABLE IF NOT EXISTS character_psychology (
  character_id TEXT NOT NULL PRIMARY KEY REFERENCES characters(entity_id) ON DELETE CASCADE,
  desire TEXT,
  need TEXT,
  wound TEXT,
  fear TEXT,
  contradiction TEXT,
  secret TEXT,
  motivation TEXT,
  values_text TEXT,
  internal_conflict TEXT,
  external_goal TEXT
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  display_date TEXT,
  date_value REAL,
  date_precision TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  UNIQUE (world_id, id)
);

CREATE TABLE IF NOT EXISTS scenes (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  sequence_number INTEGER NOT NULL,
  timeline_event_id TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  FOREIGN KEY (timeline_event_id) REFERENCES timeline_events(id) ON DELETE SET NULL,
  UNIQUE (world_id, id)
);

CREATE TABLE IF NOT EXISTS canon_facts (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  statement TEXT NOT NULL CHECK (length(trim(statement)) > 0),
  canon_status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (canon_status IN ('DRAFT', 'PROPOSED', 'CANON', 'DISPUTED', 'RUMOR', 'RETCONNED', 'DEPRECATED')),
  valid_from TEXT,
  valid_until TEXT,
  valid_from_value REAL,
  valid_until_value REAL,
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  CHECK (valid_until_value IS NULL OR valid_from_value IS NULL OR valid_until_value >= valid_from_value),
  UNIQUE (world_id, id)
);

CREATE TABLE IF NOT EXISTS canon_fact_entities (
  world_id TEXT NOT NULL,
  fact_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'involved',
  PRIMARY KEY (fact_id, entity_id, role),
  FOREIGN KEY (world_id, fact_id) REFERENCES canon_facts(world_id, id) ON DELETE CASCADE,
  FOREIGN KEY (world_id, entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  relative_path TEXT NOT NULL CHECK (
    length(trim(relative_path)) > 0
    AND substr(relative_path, 1, 1) <> '/'
    AND substr(relative_path, 1, 1) <> char(92)
    AND relative_path NOT GLOB '[A-Za-z]:*'
    AND instr('/' || replace(relative_path, char(92), '/') || '/', '/../') = 0
    AND relative_path <> '..'
  ),
  media_type TEXT NOT NULL CHECK (length(trim(media_type)) > 0),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  canon_status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (canon_status IN ('DRAFT', 'PROPOSED', 'CANON', 'DISPUTED', 'RUMOR', 'RETCONNED', 'DEPRECATED')),
  story_period TEXT,
  content_hash TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  UNIQUE (world_id, relative_path),
  UNIQUE (world_id, id)
);

CREATE TABLE IF NOT EXISTS entity_media (
  world_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (entity_id, media_asset_id),
  FOREIGN KEY (world_id, entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE,
  FOREIGN KEY (world_id, media_asset_id) REFERENCES media_assets(world_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS canon_evidence (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL,
  fact_id TEXT NOT NULL,
  evidence_kind TEXT NOT NULL CHECK (length(trim(evidence_kind)) > 0),
  source_entity_id TEXT,
  source_media_asset_id TEXT,
  source_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  source_url TEXT,
  excerpt TEXT,
  notes TEXT,
  created_at_ms INTEGER NOT NULL,
  FOREIGN KEY (world_id, fact_id) REFERENCES canon_facts(world_id, id) ON DELETE CASCADE,
  FOREIGN KEY (source_entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  FOREIGN KEY (source_media_asset_id) REFERENCES media_assets(id) ON DELETE SET NULL,
  CHECK (
    source_entity_id IS NOT NULL OR source_media_asset_id IS NOT NULL
    OR source_document_id IS NOT NULL OR source_url IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS character_knowledge (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  fact_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('KNOWS', 'SUSPECTS', 'BELIEVES', 'BELIEVES_WRONGLY', 'DENIES', 'FORGOT', 'UNKNOWN')),
  learned_at_event_id TEXT,
  learned_at_scene_id TEXT,
  source_entity_id TEXT,
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  notes TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  FOREIGN KEY (world_id, character_id) REFERENCES characters(world_id, entity_id) ON DELETE CASCADE,
  FOREIGN KEY (world_id, fact_id) REFERENCES canon_facts(world_id, id) ON DELETE CASCADE,
  FOREIGN KEY (learned_at_event_id) REFERENCES timeline_events(id) ON DELETE SET NULL,
  FOREIGN KEY (learned_at_scene_id) REFERENCES scenes(id) ON DELETE SET NULL,
  FOREIGN KEY (source_entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  UNIQUE (character_id, fact_id)
);

CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id TEXT NOT NULL PRIMARY KEY,
  entity_type_id TEXT NOT NULL REFERENCES entity_types(id) ON DELETE RESTRICT,
  field_key TEXT NOT NULL CHECK (length(trim(field_key)) > 0),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
  field_type TEXT NOT NULL CHECK (field_type IN (
    'TEXT', 'LONG_TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'MULTI_SELECT',
    'ENTITY_REFERENCE', 'ENTITY_REFERENCE_LIST', 'MEDIA', 'URL'
  )),
  sort_order INTEGER NOT NULL DEFAULT 0,
  required INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0, 1)),
  config_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config_json)),
  deleted_at_ms INTEGER,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  UNIQUE (entity_type_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_type_active
  ON custom_field_definitions(entity_type_id, deleted_at_ms, sort_order);

CREATE TABLE IF NOT EXISTS custom_field_values (
  world_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_id TEXT NOT NULL REFERENCES custom_field_definitions(id) ON DELETE RESTRICT,
  value_text TEXT,
  value_number REAL,
  value_boolean INTEGER CHECK (value_boolean IS NULL OR value_boolean IN (0, 1)),
  value_date TEXT,
  value_json TEXT CHECK (value_json IS NULL OR json_valid(value_json)),
  updated_at_ms INTEGER NOT NULL,
  PRIMARY KEY (entity_id, field_id),
  FOREIGN KEY (world_id, entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE,
  CHECK (
    (value_text IS NOT NULL) + (value_number IS NOT NULL) + (value_boolean IS NOT NULL)
    + (value_date IS NOT NULL) + (value_json IS NOT NULL) = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_custom_field_values_field
  ON custom_field_values(field_id);

CREATE TABLE IF NOT EXISTS custom_field_entity_values (
  world_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_id TEXT NOT NULL REFERENCES custom_field_definitions(id) ON DELETE RESTRICT,
  target_entity_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (entity_id, field_id, target_entity_id),
  FOREIGN KEY (world_id, entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE,
  FOREIGN KEY (world_id, target_entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS custom_field_media_values (
  world_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_id TEXT NOT NULL REFERENCES custom_field_definitions(id) ON DELETE RESTRICT,
  media_asset_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (entity_id, field_id, media_asset_id),
  FOREIGN KEY (world_id, entity_id) REFERENCES entities(world_id, id) ON DELETE CASCADE,
  FOREIGN KEY (world_id, media_asset_id) REFERENCES media_assets(world_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entity_version_history (
  id TEXT NOT NULL PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version > 0),
  operation TEXT NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'IMPORT', 'RETCON')),
  changed_at_ms INTEGER NOT NULL,
  actor TEXT,
  source_reference TEXT,
  reason TEXT,
  snapshot_json TEXT NOT NULL CHECK (json_valid(snapshot_json)),
  UNIQUE (entity_id, version)
);

CREATE INDEX IF NOT EXISTS idx_entity_version_history_entity_version
  ON entity_version_history(entity_id, version DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS euphoriya_search USING fts5(
  source_type UNINDEXED,
  source_id UNINDEXED,
  world_id UNINDEXED,
  title,
  body,
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS euphoriya_entities_search_insert
AFTER INSERT ON entities BEGIN
  INSERT INTO euphoriya_search(source_type, source_id, world_id, title, body)
  VALUES ('entity', new.id, new.world_id, new.name, coalesce(new.summary, '') || ' ' || coalesce(new.description, ''));
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_entities_search_update
AFTER UPDATE ON entities BEGIN
  DELETE FROM euphoriya_search WHERE source_type = 'entity' AND source_id = old.id;
  INSERT INTO euphoriya_search(source_type, source_id, world_id, title, body)
  VALUES ('entity', new.id, new.world_id, new.name, coalesce(new.summary, '') || ' ' || coalesce(new.description, ''));
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_entities_search_delete
AFTER DELETE ON entities BEGIN
  DELETE FROM euphoriya_search WHERE source_type = 'entity' AND source_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_entity_aliases_search_insert
AFTER INSERT ON entity_aliases BEGIN
  INSERT INTO euphoriya_search(source_type, source_id, world_id, title, body)
  VALUES ('entity_alias', new.id, new.world_id, new.alias, '');
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_entity_aliases_search_update
AFTER UPDATE ON entity_aliases BEGIN
  DELETE FROM euphoriya_search WHERE source_type = 'entity_alias' AND source_id = old.id;
  INSERT INTO euphoriya_search(source_type, source_id, world_id, title, body)
  VALUES ('entity_alias', new.id, new.world_id, new.alias, '');
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_entity_aliases_search_delete
AFTER DELETE ON entity_aliases BEGIN
  DELETE FROM euphoriya_search WHERE source_type = 'entity_alias' AND source_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_canon_facts_search_insert
AFTER INSERT ON canon_facts BEGIN
  INSERT INTO euphoriya_search(source_type, source_id, world_id, title, body)
  VALUES ('canon_fact', new.id, new.world_id, new.statement, coalesce(new.notes, ''));
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_canon_facts_search_update
AFTER UPDATE ON canon_facts BEGIN
  DELETE FROM euphoriya_search WHERE source_type = 'canon_fact' AND source_id = old.id;
  INSERT INTO euphoriya_search(source_type, source_id, world_id, title, body)
  VALUES ('canon_fact', new.id, new.world_id, new.statement, coalesce(new.notes, ''));
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_canon_facts_search_delete
AFTER DELETE ON canon_facts BEGIN
  DELETE FROM euphoriya_search WHERE source_type = 'canon_fact' AND source_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_relationships_search_insert
AFTER INSERT ON relationships BEGIN
  INSERT INTO euphoriya_search(source_type, source_id, world_id, title, body)
  VALUES ('relationship', new.id, new.world_id, new.relationship_type_id || ' ' || coalesce(new.label, ''), coalesce(new.notes, ''));
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_relationships_search_update
AFTER UPDATE ON relationships BEGIN
  DELETE FROM euphoriya_search WHERE source_type = 'relationship' AND source_id = old.id;
  INSERT INTO euphoriya_search(source_type, source_id, world_id, title, body)
  VALUES ('relationship', new.id, new.world_id, new.relationship_type_id || ' ' || coalesce(new.label, ''), coalesce(new.notes, ''));
END;

CREATE TRIGGER IF NOT EXISTS euphoriya_relationships_search_delete
AFTER DELETE ON relationships BEGIN
  DELETE FROM euphoriya_search WHERE source_type = 'relationship' AND source_id = old.id;
END;
`

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
