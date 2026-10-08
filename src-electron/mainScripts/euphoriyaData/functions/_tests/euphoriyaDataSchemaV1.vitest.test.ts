import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyEuphoriyaDataSchemaV1 } from '../../euphoriyaDataSchemaV1Wiring'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

function openEuphoriyaTestDb (): Database {
  const connection = new Database(':memory:')
  connection.pragma('foreign_keys = ON')
  connection.exec(`
CREATE TABLE worlds (id TEXT NOT NULL PRIMARY KEY);
CREATE TABLE documents (id TEXT NOT NULL PRIMARY KEY);
INSERT INTO worlds (id) VALUES ('world-1'), ('world-2');
`)
  connection.transaction(() => {
    applyEuphoriyaDataSchemaV1(connection)
  })()
  return connection
}

test('creates Euphoriya entities and seeds extensible entity types idempotently', () => {
  db = openEuphoriyaTestDb()

  expect(db.prepare('SELECT key FROM entity_types ORDER BY key').all()).toHaveLength(15)
  expect(db.prepare('SELECT key FROM relationship_types ORDER BY key').all()).toHaveLength(15)

  db.transaction(() => {
    applyEuphoriyaDataSchemaV1(db!)
  })()
  expect(db.prepare('SELECT key FROM entity_types ORDER BY key').all()).toHaveLength(15)
  expect(db.prepare('SELECT key FROM relationship_types ORDER BY key').all()).toHaveLength(15)

  db.prepare(`
    INSERT INTO entities (id, world_id, type_id, name, slug, created_at_ms, updated_at_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('char-1', 'world-1', 'character', 'Emilly', 'emilly', 1, 1)
  db.prepare(`
    INSERT INTO entities (id, world_id, type_id, name, slug, created_at_ms, updated_at_ms)
    VALUES ('species-1', 'world-1', 'species', 'Sylvan', 'sylvan', 1, 1)
  `).run()
  db.prepare('INSERT INTO characters (entity_id, world_id, species_entity_id) VALUES (?, ?, ?)')
    .run('char-1', 'world-1', 'species-1')
  db.prepare('INSERT INTO character_psychology (character_id, desire, wound) VALUES (?, ?, ?)')
    .run('char-1', 'Freedom', 'Exile')
  db.prepare(`
    INSERT INTO entity_aliases (id, world_id, entity_id, alias, normalized_alias, created_at_ms)
    VALUES ('alias-1', 'world-1', 'char-1', 'Em', 'em', 1)
  `).run()

  const expectedPsychology = {
    desire: 'Freedom',
    wound: 'Exile'
  }
  expect(db.prepare('SELECT desire, wound FROM character_psychology WHERE character_id = ?')
    .get('char-1')).toEqual(expectedPsychology)
  expect(db.prepare("SELECT rowid FROM euphoriya_search WHERE euphoriya_search MATCH 'Emilly'")
    .all()).toHaveLength(1)
  expect(db.prepare("SELECT rowid FROM euphoriya_search WHERE euphoriya_search MATCH 'Em'")
    .all()).toHaveLength(1)
  db.prepare('UPDATE entities SET name = ? WHERE id = ?').run('Emilia', 'char-1')
  expect(db.prepare("SELECT rowid FROM euphoriya_search WHERE euphoriya_search MATCH 'Emilly'")
    .all()).toHaveLength(0)
})

test('enforces canon, relationship, knowledge, and media-reference integrity', () => {
  db = openEuphoriyaTestDb()
  const insertEntity = db.prepare(`
    INSERT INTO entities (id, world_id, type_id, name, slug, canon_status, created_at_ms, updated_at_ms)
    VALUES (?, ?, 'character', ?, ?, ?, 1, 1)
  `)
  insertEntity.run('char-1', 'world-1', 'Emilly', 'emilly', 'DRAFT')
  insertEntity.run('char-2', 'world-1', 'Alya', 'alya', 'DRAFT')
  insertEntity.run('char-3', 'world-2', 'Peter', 'peter', 'DRAFT')
  insertEntity.run('species-foreign', 'world-2', 'Wrong World Species', 'wrong-world-species', 'DRAFT')
  db.prepare(`
    INSERT INTO entities (id, world_id, type_id, name, slug, created_at_ms, updated_at_ms)
    VALUES ('wrong-type-species', 'world-1', 'location', 'Wrong Type', 'wrong-type', 1, 1)
  `).run()
  expect(() => db!.prepare('INSERT INTO characters (entity_id, world_id, species_entity_id) VALUES (?, ?, ?)')
    .run('char-1', 'world-1', 'species-foreign')).toThrow()
  expect(() => db!.prepare('INSERT INTO characters (entity_id, world_id, species_entity_id) VALUES (?, ?, ?)')
    .run('char-1', 'world-1', 'wrong-type-species')).toThrow()
  db.prepare('INSERT INTO characters (entity_id, world_id) VALUES (?, ?), (?, ?)')
    .run('char-1', 'world-1', 'char-2', 'world-1')
  db.prepare(`
    INSERT INTO relationships (id, world_id, source_entity_id, target_entity_id, relationship_type_id, created_at_ms, updated_at_ms)
    VALUES ('rel-1', 'world-1', 'char-1', 'char-2', 'friend_of', 1, 1)
  `).run()
  expect(db.prepare("SELECT rowid FROM euphoriya_search WHERE euphoriya_search MATCH 'friend_of'")
    .all()).toHaveLength(1)
  expect(() => db!.prepare(`
    INSERT INTO relationships (
      id, world_id, source_entity_id, target_entity_id, relationship_type_id,
      valid_from_value, valid_until_value, created_at_ms, updated_at_ms
    ) VALUES ('rel-invalid-range', 'world-1', 'char-1', 'char-2', 'friend_of', 2, 1, 1, 1)
  `).run()).toThrow()
  expect(() => db!.prepare(`
    INSERT INTO relationships (id, world_id, source_entity_id, target_entity_id, relationship_type_id, created_at_ms, updated_at_ms)
    VALUES ('rel-invalid-type', 'world-1', 'char-1', 'char-2', 'unknown_type', 1, 1)
  `).run()).toThrow()

  expect(() => db!.prepare(`
    INSERT INTO relationships (id, world_id, source_entity_id, target_entity_id, relationship_type_id, created_at_ms, updated_at_ms)
    VALUES ('rel-2', 'world-1', 'char-1', 'char-3', 'friend_of', 1, 1)
  `).run()).toThrow()
  expect(() => insertEntity.run('invalid', 'world-1', 'Unknown canon', 'unknown-canon', 'AUTOCANON'))
    .toThrow()
  expect(() => db!.prepare(`
    INSERT INTO media_assets (id, world_id, relative_path, media_type, title, created_at_ms, updated_at_ms)
    VALUES ('media-outside', 'world-1', '../outside.png', 'image/png', 'Outside', 1, 1)
  `).run()).toThrow()
  db!.prepare(`
    INSERT INTO media_assets (id, world_id, relative_path, media_type, title, created_at_ms, updated_at_ms)
    VALUES ('media-1', 'world-1', 'media/character.png', 'image/png', 'Character', 1, 1)
  `).run()
  expect(() => db!.prepare(`
    INSERT INTO entity_media (world_id, entity_id, media_asset_id)
    VALUES ('world-2', 'char-1', 'media-1')
  `).run()).toThrow()
  expect(db!.pragma('foreign_key_check')).toEqual([])
})

test('keeps canonical facts separate from character knowledge and defaults imported records to draft', () => {
  db = openEuphoriyaTestDb()
  db.prepare(`
    INSERT INTO entities (id, world_id, type_id, name, slug, created_at_ms, updated_at_ms)
    VALUES ('char-1', 'world-1', 'character', 'Emilly', 'emilly', 1, 1)
  `).run()
  db.prepare('INSERT INTO characters (entity_id, world_id) VALUES (?, ?)').run('char-1', 'world-1')
  db.prepare(`
    INSERT INTO canon_facts (id, world_id, statement, created_at_ms, updated_at_ms)
    VALUES ('fact-1', 'world-1', 'The moon is artificial', 1, 1)
  `).run()
  db.prepare(`
    INSERT INTO character_knowledge (id, world_id, character_id, fact_id, state, confidence, created_at_ms, updated_at_ms)
    VALUES ('knowledge-1', 'world-1', 'char-1', 'fact-1', 'BELIEVES_WRONGLY', 0.6, 1, 1)
  `).run()

  expect(db.prepare('SELECT canon_status FROM canon_facts WHERE id = ?').get('fact-1'))
    .toEqual({ canon_status: 'DRAFT' })
  expect(db.prepare('SELECT state FROM character_knowledge WHERE id = ?').get('knowledge-1'))
    .toEqual({ state: 'BELIEVES_WRONGLY' })
  expect(db.prepare("SELECT rowid FROM euphoriya_search WHERE euphoriya_search MATCH 'artificial'")
    .all()).toHaveLength(1)
})
