-- Energy menu — Neon (PostgreSQL) schema.
-- Translated from the former InstantDB schema (instant.schema.ts). Idempotent.

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name_en     TEXT NOT NULL DEFAULT '',
  name_ar     TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT '',
  "order"     INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS items (
  id              TEXT PRIMARY KEY,
  name_en         TEXT NOT NULL DEFAULT '',
  name_ar         TEXT NOT NULL DEFAULT '',
  description_en  TEXT NOT NULL DEFAULT '',
  description_ar  TEXT NOT NULL DEFAULT '',
  price_small     DOUBLE PRECISION NOT NULL DEFAULT 0,
  price_large     DOUBLE PRECISION NOT NULL DEFAULT 0,
  image           TEXT NOT NULL DEFAULT '',
  available       BOOLEAN NOT NULL DEFAULT TRUE,
  "order"         INTEGER NOT NULL DEFAULT 0,
  category_id     TEXT REFERENCES categories(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS items_category_idx ON items (category_id);

CREATE TABLE IF NOT EXISTS item_images (
  id          TEXT PRIMARY KEY,
  item_id     TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  image       TEXT NOT NULL DEFAULT '',
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  "order"     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS item_images_item_idx ON item_images (item_id);

CREATE TABLE IF NOT EXISTS settings (
  id     TEXT PRIMARY KEY,
  key    TEXT NOT NULL UNIQUE,
  value  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS banners (
  id           TEXT PRIMARY KEY,
  title_en     TEXT NOT NULL DEFAULT '',
  title_ar     TEXT NOT NULL DEFAULT '',
  subtitle_en  TEXT NOT NULL DEFAULT '',
  subtitle_ar  TEXT NOT NULL DEFAULT '',
  image        TEXT NOT NULL DEFAULT '',
  link         TEXT NOT NULL DEFAULT '',
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  "order"      INTEGER NOT NULL DEFAULT 0
);
