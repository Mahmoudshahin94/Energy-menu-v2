"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { BagIcon } from "./icons";

/** Header cart icon with a count badge. Renders nothing while the cart is empty. */
export default function CartButton() {
  const { count, openDrawer } = useCart();
  const { t } = useLanguage();

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`${t("cart")} (${count})`}
      className="relative w-9 h-9 rounded-full flex items-center justify-center bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition-colors"
    >
      <BagIcon className="w-[18px] h-[18px]" />
      <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
        {count > 99 ? "99+" : count}
      </span>
    </button>
  );
}
