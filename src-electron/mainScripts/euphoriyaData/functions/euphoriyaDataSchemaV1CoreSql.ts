export const EUPHORIYA_DATA_SCHEMA_V1_CORE_SQL = String.raw`
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

`
