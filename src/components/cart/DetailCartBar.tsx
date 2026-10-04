"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice, lineKey, type PriceSize } from "@/lib/cart";
import type { MenuItem } from "@/types";
import { CartIcon } from "./icons";
import QuantityStepper from "./QuantityStepper";

interface DetailCartBarProps {
  item: MenuItem;
  size?: PriceSize;
  price: number;
  className?: string;
}

/** Item-page call to action: "Add to cart" → stepper + "View cart". */
export default function DetailCartBar({ item, size, price, className = "" }: DetailCartBarProps) {
  const { getQty, add, setQty, openDrawer } = useCart();
  const { t } = useLanguage();

  if (!item.available || price <= 0) {
    return (
      <div className={`flex items-center justify-center w-full rounded-2xl bg-surface-2 border border-border text-ink-3 font-bold text-[15px] cursor-not-allowed py-4 ${className}`}>
        {t("unavailable")}
      </div>
    );
  }

  const qty = getQty(item.id, size);

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(item.id, size)}
        className={`flex items-center justify-center gap-2.5 w-full rounded-2xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold text-[15px] transition-all shadow-lg shadow-primary/25 py-4 ${className}`}
      >
        <CartIcon />
        {t("add_to_cart")}
        <span className="opacity-80">· {t("egp")}{formatPrice(price)}</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="rounded-2xl bg-surface-2 border border-border px-3 py-2.5">
        <QuantityStepper qty={qty} onChange={(q) => setQty(lineKey(item.id, size), q)} />
      </div>
      <button
        type="button"
        onClick={openDrawer}
        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold text-[15px] transition-all shadow-lg shadow-primary/25 py-4"
      >
        <CartIcon />
        {t("view_cart")}
        <span className="opacity-80">· {t("egp")}{formatPrice(price * qty)}</span>
      </button>
    </div>
  );
}
