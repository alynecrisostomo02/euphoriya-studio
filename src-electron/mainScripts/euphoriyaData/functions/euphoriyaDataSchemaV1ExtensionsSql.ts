export const EUPHORIYA_DATA_SCHEMA_V1_EXTENSIONS_SQL = String.raw`CREATE TABLE IF NOT EXISTS media_assets (
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

`
