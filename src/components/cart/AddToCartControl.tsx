"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { hasBothSizes, lineKey } from "@/lib/cart";
import type { MenuItem } from "@/types";
import { CartIcon } from "./icons";
import QuantityStepper from "./QuantityStepper";

/**
 * Cart control overlaid on an item card image: a round cart button that turns into
 * a quantity stepper once the item is in the cart. Items with two sizes just show the
 * cart icon and let the click fall through to the card link (size is chosen on the detail page).
 */
export default function AddToCartControl({ item }: { item: MenuItem }) {
  const { getQty, add, setQty } = useCart();
  const { t } = useLanguage();

  if (!item.available) return null;

  const wrap = "absolute bottom-2.5 inset-x-0 flex justify-center z-10 pointer-events-none";

  if (hasBothSizes(item)) {
    return (
      <div className={wrap}>
        <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
          <CartIcon />
        </span>
      </div>
    );
  }

  const qty = getQty(item.id);

  return (
    <div className={wrap}>
      {qty === 0 ? (
        <button
          type="button"
          aria-label={`${t("add_to_cart")}: ${item.name_en}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            add(item.id);
          }}
          className="pointer-events-auto w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-black/30 hover:bg-primary-dark active:scale-90 transition-all"
        >
          <CartIcon />
        </button>
      ) : (
        <div className="pointer-events-auto rounded-full bg-surface/95 backdrop-blur border border-border shadow-lg px-1.5 py-1">
          <QuantityStepper qty={qty} onChange={(q) => setQty(lineKey(item.id), q)} size="sm" />
        </div>
      )}
    </div>
  );
}
