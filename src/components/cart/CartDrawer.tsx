"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice, itemThumb, lineKey, resolveCartLines } from "@/lib/cart";
import type { ItemImage, MenuItem } from "@/types";
import { BagIcon, CloseIcon } from "./icons";
import QuantityStepper from "./QuantityStepper";

interface CartDrawerProps {
  items: MenuItem[];
  itemImages: ItemImage[];
}

/** Slide-in cart panel (opened from the header cart button). */
export default function CartDrawer({ items, itemImages }: CartDrawerProps) {
  const { lines, count, drawerOpen, closeDrawer, setQty, clear } = useCart();
  const { t, lang, isRTL } = useLanguage();

  const resolved = useMemo(() => resolveCartLines(lines, items), [lines, items]);

  return (
    <AnimatePresence>
      {drawerOpen && count > 0 && (
        <div className="fixed inset-0 z-[60]" dir={isRTL ? "rtl" : "ltr"}>
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-label={t("cart")}
            className={`absolute inset-y-0 ${isRTL ? "left-0" : "right-0"} w-full max-w-sm bg-surface border-border ${
              isRTL ? "border-r" : "border-l"
            } shadow-2xl flex flex-col`}
            initial={{ x: isRTL ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? "-100%" : "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-primary"><BagIcon className="w-5 h-5" /></span>
                <h2 className="font-extrabold text-ink truncate">{t("cart")}</h2>
                <span className="text-primary font-extrabold text-sm tabular-nums">{count}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button type="button" onClick={clear} className="text-red-500 text-sm font-semibold hover:opacity-70">
                  {t("cart_clear")}
                </button>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label={t("cart_close")}
                  className="w-9 h-9 rounded-full bg-surface-2 border border-border text-ink-2 hover:text-ink flex items-center justify-center"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {resolved.lines.map(({ line, item, unit, total }) => {
                const thumb = itemThumb(item, itemImages);
                const name = lang === "ar" ? item.name_ar || item.name_en : item.name_en || item.name_ar;
                return (
                  <div key={line.key} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2/50 p-2.5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-2 flex-shrink-0">
                      {thumb && (
                        <Image src={thumb} alt={name} fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-sm font-bold text-ink leading-snug line-clamp-2">{name}</p>
                      <p className="text-xs font-extrabold text-primary tabular-nums">
                        {t("egp")}{formatPrice(total)}
                        {line.qty > 1 && (
                          <span className="text-ink-3 font-medium"> · {t("egp")}{formatPrice(unit)} {t("item_unit")}</span>
                        )}
                      </p>
                      <QuantityStepper qty={line.qty} size="sm" onChange={(q) => setQty(lineKey(line.itemId, line.size), q)} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer — no delivery fee shown */}
            <div className="border-t border-border px-5 pt-4 pb-5 space-y-3 bg-surface">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">{t("total")}</span>
                <span className="text-xl font-extrabold text-primary tabular-nums">
                  {t("egp")}{formatPrice(resolved.total)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="block w-full text-center rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold py-3.5 transition-colors shadow-lg shadow-primary/20"
              >
                {t("proceed_checkout")}
              </Link>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
