// Applies db/schema.sql to Neon and loads the Energy menu (db/energy-menu.json).
// Idempotent: rows have deterministic ids and are upserted.
//
// Run:  node --env-file=.env.local scripts/seed-energy.mjs
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const sql = neon(url);

// 1. Schema
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(";")
  .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);
for (const stmt of statements) await sql.query(stmt);
console.log(`Schema applied (${statements.length} statements).`);

// 2. Data
const { categories, items } = JSON.parse(
  readFileSync(new URL("../db/energy-menu.json", import.meta.url), "utf8")
);

const catId = (key) => `cat_${key}`;
const queries = [];

for (const c of categories) {
  queries.push(sql`
    INSERT INTO categories (id, name_en, name_ar, icon, "order", active)
    VALUES (${catId(c.key)}, ${c.name_en}, ${c.name_ar}, ${c.icon}, ${c.order}, TRUE)
    ON CONFLICT (id) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar,
      icon = EXCLUDED.icon, "order" = EXCLUDED."order"`);
}

for (const it of items) {
  const id = `item_${it.category}_${it.order}`;
  queries.push(sql`
    INSERT INTO items (id, name_en, name_ar, description_en, description_ar, price_small, price_large,
                       image, available, "order", category_id)
    VALUES (${id}, ${it.name_en}, ${it.name_ar}, '', '', 0, ${it.price}, ${it.image}, TRUE, ${it.order},
            ${catId(it.category)})
    ON CONFLICT (id) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar,
      price_large = EXCLUDED.price_large, image = EXCLUDED.image, "order" = EXCLUDED."order",
      category_id = EXCLUDED.category_id`);
  queries.push(sql`
    INSERT INTO item_images (id, item_id, image, is_primary, "order")
    VALUES (${"img_" + id}, ${id}, ${it.image}, TRUE, 0)
    ON CONFLICT (id) DO UPDATE SET image = EXCLUDED.image`);
}

const settings = {
  shop_name: "Energy",
  logo: "/logo.png",
  default_lang: "ar",
  carousel_interval: "5000",
};
for (const [key, value] of Object.entries(settings)) {
  queries.push(sql`
    INSERT INTO settings (id, key, value) VALUES (${"setting_" + key}, ${key}, ${value})
    ON CONFLICT (key) DO NOTHING`);
}

await sql.transaction(queries);

const [counts] = await sql`
  SELECT (SELECT count(*) FROM categories) AS categories,
         (SELECT count(*) FROM items) AS items,
         (SELECT count(*) FROM item_images) AS item_images,
         (SELECT count(*) FROM settings) AS settings`;
console.log("Row counts:", counts);
