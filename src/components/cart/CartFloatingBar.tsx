"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice, resolveCartLines } from "@/lib/cart";
import type { MenuItem } from "@/types";
import { BagIcon } from "./icons";

interface CartFloatingBarProps {
  items: MenuItem[];
  storeOpen: boolean;
}

/** Green bottom button that appears while the cart has items and goes straight to checkout. */
export default function CartFloatingBar({ items, storeOpen }: CartFloatingBarProps) {
  const { lines, count } = useCart();
  const { t } = useLanguage();
  const total = useMemo(() => resolveCartLines(lines, items).total, [lines, items]);

  return (
    <AnimatePresence>
      {count > 0 && storeOpen && (
        <motion.div
          className="fixed bottom-0 inset-x-0 z-50 px-4 pt-3 pb-safe pointer-events-none"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
        >
          <Link
            href="/checkout"
            className="pointer-events-auto max-w-2xl mx-auto flex items-center justify-center gap-3 w-full rounded-2xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold text-[15px] transition-all shadow-xl shadow-black/30 py-4 px-5"
          >
            <span className="relative flex-shrink-0">
              <BagIcon className="w-6 h-6" />
              <span className="absolute -top-2 -end-2 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-primary-dark text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                {count > 99 ? "99+" : count}
              </span>
            </span>
            <span>{t("proceed_checkout_short")}</span>
            <span className="opacity-90 tabular-nums">· {t("egp")}{formatPrice(total)}</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
