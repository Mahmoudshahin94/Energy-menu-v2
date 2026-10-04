import { WHATSAPP_NUMBER } from "./config";
import { formatPrice, type PricedLine } from "./cart";
import type { Language } from "@/types";

export type FulfilmentMode = "delivery" | "pickup";

export interface OrderDetails {
  lang: Language;
  name: string;
  phone?: string;
  mode: FulfilmentMode;
  address?: string;
  pickupTime?: string;
  lines: PricedLine[];
  total: number;
}

const COPY = {
  ar: {
    title: "طلب جديد",
    name: "الاسم",
    phone: "الهاتف",
    type: "نوع الطلب",
    delivery: "توصيل",
    pickup: "استلام من المطعم",
    address: "العنوان",
    time: "وقت الوصول",
    details: "تفاصيل الطلب",
    note: "ملاحظة",
    total: "المجموع",
    thanks: "شكراً لكم 🙏",
  },
  en: {
    title: "New Order",
    name: "Name",
    phone: "Phone",
    type: "Order type",
    delivery: "Delivery",
    pickup: "Pickup from the restaurant",
    address: "Address",
    time: "Arrival time",
    details: "Order details",
    note: "Note",
    total: "Total",
    thanks: "Thank you 🙏",
  },
} as const;

const DIVIDER = "━━━━━━━━━━━━━━";
const CURRENCY = "₪";

/** Builds the WhatsApp order text. Item names follow the customer's language. */
export function buildOrderMessage(order: OrderDetails): string {
  const c = COPY[order.lang];
  const out: string[] = [`🥗 *${c.title} — Energy*`, DIVIDER];

  out.push(`👤 *${c.name}:* ${order.name.trim()}`);
  if (order.phone?.trim()) out.push(`📞 *${c.phone}:* ${order.phone.trim()}`);

  if (order.mode === "delivery") {
    out.push(`🚚 *${c.type}:* ${c.delivery}`);
    out.push(`📍 *${c.address}:* ${(order.address ?? "").trim()}`);
  } else {
    out.push(`🏪 *${c.type}:* ${c.pickup}`);
    if (order.pickupTime?.trim()) out.push(`⏰ *${c.time}:* ${order.pickupTime.trim()}`);
  }

  out.push(DIVIDER, `🧾 *${c.details}:*`);
  order.lines.forEach(({ line, item, total }, index) => {
    const name =
      order.lang === "ar" ? item.name_ar || item.name_en : item.name_en || item.name_ar;
    out.push(`${index + 1}) ${name} × ${line.qty} — ${CURRENCY}${formatPrice(total)}`);
    if (line.note.trim()) out.push(`   📝 ${c.note}: ${line.note.trim()}`);
  });

  out.push(DIVIDER, `💰 *${c.total}:* ${CURRENCY}${formatPrice(order.total)}`, "", c.thanks);
  return out.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
