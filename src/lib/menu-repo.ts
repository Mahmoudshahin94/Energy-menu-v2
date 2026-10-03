import { randomUUID } from "crypto";
import { getSql } from "./db";
import type { Banner, Category, ItemImage, MenuItem, Settings } from "@/types";

export interface MenuPayload {
  categories: Category[];
  items: MenuItem[];
  item_images: ItemImage[];
  settings: Settings[];
  banners: Banner[];
}

/** Tables the admin API may create / update / delete rows in, with writable columns. */
export const TABLE_COLUMNS = {
  categories: ["name_en", "name_ar", "icon", "order", "active"],
  items: [
    "name_en",
    "name_ar",
    "description_en",
    "description_ar",
    "price_small",
    "price_large",
    "image",
    "available",
    "order",
    "category_id",
  ],
  banners: [
    "title_en",
    "title_ar",
    "subtitle_en",
    "subtitle_ar",
    "image",
    "link",
    "active",
    "order",
  ],
} as const;

export type AdminTable = keyof typeof TABLE_COLUMNS;

export function isAdminTable(value: string): value is AdminTable {
  return Object.prototype.hasOwnProperty.call(TABLE_COLUMNS, value);
}

export async function getMenuPayload(): Promise<MenuPayload> {
  const sql = getSql();
  const [categories, items, item_images, settings, banners] = await Promise.all([
    sql`SELECT id, name_en, name_ar, icon, "order", active FROM categories ORDER BY "order", name_en`,
    sql`SELECT id, name_en, name_ar, description_en, description_ar, price_small, price_large,
               image, available, "order", category_id FROM items ORDER BY "order", name_en`,
    sql`SELECT id, item_id, image, is_primary, "order" FROM item_images ORDER BY "order"`,
    sql`SELECT id, key, value FROM settings`,
    sql`SELECT id, title_en, title_ar, subtitle_en, subtitle_ar, image, link, active, "order"
        FROM banners ORDER BY "order"`,
  ]);
  return {
    categories: categories as Category[],
    items: items as MenuItem[],
    item_images: item_images as ItemImage[],
    settings: settings as Settings[],
    banners: banners as Banner[],
  };
}

type Row = Record<string, unknown>;

/** Keep only whitelisted columns from untrusted input. */
function pick(table: AdminTable, input: Row): Row {
  const out: Row = {};
  for (const col of TABLE_COLUMNS[table]) {
    if (input[col] !== undefined) out[col] = input[col];
  }
  return out;
}

const q = (col: string) => `"${col}"`;

export async function insertRow(table: AdminTable, input: Row): Promise<string> {
  const sql = getSql();
  const id = randomUUID();
  const data: Row = { id, ...pick(table, input) };
  if (table === "items" && !data["category_id"]) data["category_id"] = null;
  const cols = Object.keys(data);
  await sql.query(
    `INSERT INTO ${table} (${cols.map(q).join(", ")}) VALUES (${cols
      .map((_, i) => `$${i + 1}`)
      .join(", ")})`,
    cols.map((c) => data[c])
  );
  return id;
}

export async function updateRow(table: AdminTable, id: string, input: Row): Promise<void> {
  const sql = getSql();
  const data = pick(table, input);
  if (table === "items" && "category_id" in data && !data["category_id"]) data["category_id"] = null;
  const cols = Object.keys(data);
  if (cols.length === 0) return;
  await sql.query(
    `UPDATE ${table} SET ${cols.map((c, i) => `${q(c)} = $${i + 1}`).join(", ")} WHERE id = $${
      cols.length + 1
    }`,
    [...cols.map((c) => data[c]), id]
  );
}

export async function deleteRow(table: AdminTable, id: string): Promise<void> {
  const sql = getSql();
  await sql.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
}

export interface ImageInput {
  url: string;
  isPrimary: boolean;
}

/** Replace all item_images rows of an item with the given ordered list. */
export async function replaceItemImages(itemId: string, images: ImageInput[]): Promise<void> {
  const sql = getSql();
  await sql.transaction([
    sql`DELETE FROM item_images WHERE item_id = ${itemId}`,
    ...images.map(
      (img, i) =>
        sql`INSERT INTO item_images (id, item_id, image, is_primary, "order")
            VALUES (${randomUUID()}, ${itemId}, ${img.url}, ${img.isPrimary}, ${i})`
    ),
  ]);
}

export async function upsertSettings(entries: Record<string, string>): Promise<void> {
  const sql = getSql();
  const keys = Object.keys(entries);
  if (keys.length === 0) return;
  await sql.transaction(
    keys.map(
      (key) =>
        sql`INSERT INTO settings (id, key, value) VALUES (${randomUUID()}, ${key}, ${entries[key]})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
    )
  );
}
