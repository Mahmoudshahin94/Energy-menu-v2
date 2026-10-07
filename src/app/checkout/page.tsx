"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuData } from "@/lib/useMenuData";
import { isStoreOpen } from "@/lib/store";
import {
  MAX_NOTE_LENGTH,
  formatPrice,
  itemThumb,
  lineKey,
  resolveCartLines,
} from "@/lib/cart";
import { buildOrderMessage, buildWhatsAppUrl, type FulfilmentMode } from "@/lib/orderMessage";
import QuantityStepper from "@/components/cart/QuantityStepper";
import LanguageToggle from "@/components/menu/LanguageToggle";

const inputClass =
  "w-full rounded-2xl bg-surface-2 border border-border px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.123 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface border border-border p-5 space-y-4 shadow-card">
      <h2 className="text-lg font-extrabold text-ink">{title}</h2>
      {children}
    </section>
  );
}

interface RadioCardProps {
  checked: boolean;
  onSelect: () => void;
  emoji: string;
  title: string;
  desc: string;
}

function RadioCard({ checked, onSelect, emoji, title, desc }: RadioCardProps) {
  return (
    <label
      className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 cursor-pointer transition-all ${
        checked ? "border-primary bg-primary/10" : "border-border bg-surface-2/40 hover:border-ink-3"
      }`}
    >
      <input type="radio" name="fulfilment" checked={checked} onChange={onSelect} className="sr-only" />
      <span className="text-2xl" aria-hidden>{emoji}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="block text-xs text-ink-3 mt-0.5">{desc}</span>
      </span>
      <span
        aria-hidden
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          checked ? "border-primary" : "border-ink-3"
        }`}
      >
        {checked && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </span>
    </label>
  );
}

export default function CheckoutPage() {
  const { t, lang, isRTL } = useLanguage();
  const { lines, ready, setQty, setNote, clear } = useCart();
  const { data, isLoading } = useMenuData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<FulfilmentMode>("delivery");
  const [address, setAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());
  const [removedNotice, setRemovedNotice] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const storeOpen = useMemo(() => isStoreOpen(data?.settings), [data?.settings]);
  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const itemImages = useMemo(() => data?.item_images ?? [], [data?.item_images]);
  const resolved = useMemo(() => resolveCartLines(lines, items), [lines, items]);

  // Drop lines whose item was deleted / became unavailable (once real menu data is loaded).
  useEffect(() => {
    if (!data || !ready || resolved.dropped === 0) return;
    const keep = new Set(resolved.lines.map((l) => l.line.key));
    lines.filter((l) => !keep.has(l.key)).forEach((l) => setQty(l.key, 0));
    setRemovedNotice(true);
  }, [data, ready, resolved, lines, setQty]);

  const toggleNote = (key: string) =>
    setOpenNotes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const placeOrder = () => {
    if (!storeOpen) return;
    const nextErrors: { name?: string; address?: string } = {};
    if (!name.trim()) nextErrors.name = t("err_name");
    if (mode === "delivery" && !address.trim()) nextErrors.address = t("err_address");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Bring the first invalid field into view (the sticky bar can hide errors on phones).
      const firstId = nextErrors.name ? "cust-name" : "cust-address";
      const el = document.getElementById(firstId);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }
    if (resolved.lines.length === 0) return;

    const message = buildOrderMessage({
      lang,
      name,
      phone,
      mode,
      address,
      pickupTime,
      lines: resolved.lines,
      total: resolved.total,
    });
    const url = buildWhatsAppUrl(message);
    window.open(url, "_blank", "noopener");
    setSentUrl(url);
    clear();
  };

  const loading = !ready || isLoading;

  return (
    <div className="min-h-screen bg-bg" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass-header h-14 flex items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink-2 hover:text-ink transition-colors"
          aria-label={t("back_to_menu")}
        >
          <svg className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-sm font-semibold">{t("back_to_menu")}</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 pb-32 space-y-5">
        <h1 className="text-2xl font-extrabold text-ink">{t("checkout_title")}</h1>

        {/* Confirmation after the order was sent to WhatsApp */}
        {sentUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-surface border border-border p-8 text-center space-y-4 shadow-card"
          >
            <div className="text-6xl">✅</div>
            <h2 className="text-xl font-extrabold text-ink">{t("order_sent_title")}</h2>
            <p className="text-ink-2 text-sm leading-relaxed">{t("order_sent_text")}</p>
            <a
              href={sentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3.5 transition-colors"
            >
              <WhatsAppIcon />
              {t("open_whatsapp_again")}
            </a>
            <Link href="/" className="block text-primary font-semibold text-sm hover:underline underline-offset-4">
              {t("back_to_menu")}
            </Link>
          </motion.div>
        ) : loading ? (
          <div className="space-y-4">
            <div className="skeleton h-56 rounded-3xl" />
            <div className="skeleton h-44 rounded-3xl" />
          </div>
        ) : resolved.lines.length === 0 ? (
          <div className="rounded-3xl bg-surface border border-border p-10 text-center space-y-3 shadow-card">
            <div className="text-6xl opacity-40">🛒</div>
            <h2 className="text-lg font-extrabold text-ink">{t("empty_cart_title")}</h2>
            <p className="text-ink-2 text-sm">{t("empty_cart_text")}</p>
            {removedNotice && <p className="text-amber-500 text-xs">{t("items_removed_notice")}</p>}
            <Link href="/" className="inline-block mt-2 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 transition-colors">
              {t("back_to_menu")}
            </Link>
          </div>
        ) : (
          <>
            {!storeOpen && (
              <div role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold px-4 py-3">
                {t("store_closed_notice")}
              </div>
            )}
            {removedNotice && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm px-4 py-3">
                {t("items_removed_notice")}
              </div>
            )}

            {/* 1. Order summary */}
            <SectionCard title={t("order_summary")}>
              <div className="space-y-3">
                {resolved.lines.map(({ line, item, unit, total }) => {
                  const thumb = itemThumb(item, itemImages);
                  const itemName =
                    lang === "ar" ? item.name_ar || item.name_en : item.name_en || item.name_ar;
                  const noteOpen = openNotes.has(line.key) || line.note.length > 0;
                  return (
                    <div key={line.key} className="rounded-2xl border border-border bg-surface-2/40 p-3 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-2 flex-shrink-0">
                          {thumb && <Image src={thumb} alt={itemName} fill sizes="64px" className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-ink leading-snug line-clamp-2">{itemName}</p>
                          <p className="text-sm font-extrabold text-primary mt-1 tabular-nums">
                            {t("egp")}{formatPrice(total)}
                            {line.qty > 1 && (
                              <span className="text-ink-3 text-xs font-medium"> · {t("egp")}{formatPrice(unit)} {t("item_unit")}</span>
                            )}
                          </p>
                        </div>
                        <QuantityStepper qty={line.qty} onChange={(q) => setQty(lineKey(line.itemId, line.size), q)} />
                      </div>

                      {noteOpen ? (
                        <div className="space-y-1">
                          <label htmlFor={`note-${line.key}`} className="text-xs font-semibold text-ink-3">
                            {t("note_label")}
                          </label>
                          <textarea
                            id={`note-${line.key}`}
                            value={line.note}
                            onChange={(e) => setNote(line.key, e.target.value)}
                            maxLength={MAX_NOTE_LENGTH}
                            rows={2}
                            placeholder={t("note_placeholder")}
                            className={`${inputClass} resize-none`}
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleNote(line.key)}
                          className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                        >
                          + {t("add_note")}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-bold text-ink">{t("total")}</span>
                <span className="text-2xl font-extrabold text-primary tabular-nums">
                  {t("egp")}{formatPrice(resolved.total)}
                </span>
              </div>
            </SectionCard>

            {/* 2. Customer details */}
            <SectionCard title={t("customer_details")}>
              <div className="space-y-1.5">
                <label htmlFor="cust-name" className="text-xs font-semibold text-ink-3">{t("your_name")} *</label>
                <input
                  id="cust-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  autoComplete="name"
                  maxLength={80}
                  aria-invalid={!!errors.name}
                  className={`${inputClass} ${errors.name ? "!border-red-500" : ""}`}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cust-phone" className="text-xs font-semibold text-ink-3">{t("your_phone")}</label>
                <input
                  id="cust-phone"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  maxLength={20}
                  className={`${inputClass} ${isRTL ? "text-end" : ""}`}
                />
              </div>
            </SectionCard>

            {/* 3. Delivery / pickup */}
            <SectionCard title={t("receive_method")}>
              <div className="space-y-3" role="radiogroup" aria-label={t("receive_method")}>
                <RadioCard
                  checked={mode === "delivery"}
                  onSelect={() => setMode("delivery")}
                  emoji="🚚"
                  title={t("delivery")}
                  desc={t("delivery_desc")}
                />
                {mode === "delivery" && (
                  <div className="space-y-1.5 ps-1">
                    <label htmlFor="cust-address" className="text-xs font-semibold text-ink-3">{t("address_label")} *</label>
                    <textarea
                      id="cust-address"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
                      }}
                      rows={3}
                      maxLength={300}
                      placeholder={t("address_placeholder")}
                      autoComplete="street-address"
                      aria-invalid={!!errors.address}
                      className={`${inputClass} resize-none ${errors.address ? "!border-red-500" : ""}`}
                    />
                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                  </div>
                )}

                <RadioCard
                  checked={mode === "pickup"}
                  onSelect={() => setMode("pickup")}
                  emoji="🏪"
                  title={t("pickup")}
                  desc={t("pickup_desc")}
                />
                {mode === "pickup" && (
                  <div className="space-y-1.5 ps-1">
                    <label htmlFor="pickup-time" className="text-xs font-semibold text-ink-3">{t("pickup_time")}</label>
                    <input
                      id="pickup-time"
                      type="time"
                      dir="ltr"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className={`${inputClass} ${isRTL ? "text-end" : ""}`}
                    />
                    <p className="text-xs text-ink-3">{t("pickup_hint")}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </>
        )}
      </main>

      {/* Sticky place-order bar */}
      {!sentUrl && !loading && resolved.lines.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-border px-4 py-3 pb-safe">
          <button
            type="button"
            onClick={placeOrder}
            disabled={!storeOpen}
            className="max-w-xl mx-auto flex items-center justify-center gap-2.5 w-full rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.98] text-white font-bold text-[15px] transition-all shadow-lg shadow-green-500/20 py-4 disabled:bg-surface-2 disabled:text-ink-3 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <WhatsAppIcon />
            {t("place_order")}
            <span className="opacity-90 tabular-nums">· {t("egp")}{formatPrice(resolved.total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
