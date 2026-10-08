export const EUPHORIYA_DATA_SCHEMA_V1_SEARCH_SQL = String.raw`CREATE VIRTUAL TABLE IF NOT EXISTS euphoriya_search USING fts5(
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
