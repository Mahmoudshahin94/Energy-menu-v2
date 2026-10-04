import type { ItemImage, MenuItem } from "@/types";

export type PriceSize = "small" | "large";

export interface CartLine {
  key: string;
  itemId: string;
  size?: PriceSize;
  qty: number;
  note: string;
}

export const MAX_QTY = 99;
export const MAX_NOTE_LENGTH = 200;

export function lineKey(itemId: string, size?: PriceSize): string {
  return size ? `${itemId}:${size}` : itemId;
}

export function hasBothSizes(item: MenuItem): boolean {
  return (item.price_small ?? 0) > 0 && (item.price_large ?? 0) > 0;
}

/** Price of one unit. Single-price items keep it in price_large (price_small = 0). */
export function unitPrice(item: MenuItem, size?: PriceSize): number {
  if (size === "small") return item.price_small ?? 0;
  if (size === "large") return item.price_large ?? 0;
  return item.price_large || item.price_small || 0;
}

export function formatPrice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export interface PricedLine {
  line: CartLine;
  item: MenuItem;
  unit: number;
  total: number;
}

export interface ResolvedCart {
  lines: PricedLine[];
  /** Lines dropped because the item was deleted, unavailable or has no price. */
  dropped: number;
  total: number;
}

/** Joins cart lines with live menu data so prices/availability are always current. */
export function resolveCartLines(lines: CartLine[], items: MenuItem[]): ResolvedCart {
  const byId = new Map(items.map((i) => [i.id, i]));
  const priced: PricedLine[] = [];
  let dropped = 0;
  for (const line of lines) {
    const item = byId.get(line.itemId);
    const unit = item ? unitPrice(item, line.size) : 0;
    if (!item || !item.available || unit <= 0) {
      dropped += 1;
      continue;
    }
    priced.push({ line, item, unit, total: unit * line.qty });
  }
  return { lines: priced, dropped, total: priced.reduce((sum, l) => sum + l.total, 0) };
}

/** Primary image: item_images primary > first item_image > legacy item.image. */
export function itemThumb(item: MenuItem, images: ItemImage[]): string {
  const own = images
    .filter((img) => img.item_id === item.id)
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  return own[0]?.image || item.image || "";
}
