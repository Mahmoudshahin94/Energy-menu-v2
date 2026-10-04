"use client";

import { useLanguage } from "@/context/LanguageContext";
import { MinusIcon, PlusIcon, TrashIcon } from "./icons";

interface QuantityStepperProps {
  qty: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
  className?: string;
}

/** − / 🗑 (when qty is 1)  qty  + — layout is fixed LTR so the controls never swap sides. */
export default function QuantityStepper({ qty, onChange, size = "md", className = "" }: QuantityStepperProps) {
  const { t } = useLanguage();
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const btn = `${dim} rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0`;

  return (
    <div dir="ltr" className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(qty - 1);
        }}
        aria-label={qty <= 1 ? t("remove_item") : t("decrease")}
        className={`${btn} ${
          qty <= 1
            ? "bg-red-500/15 text-red-500 hover:bg-red-500/25"
            : "bg-surface-2 text-ink border border-border hover:border-ink-3"
        }`}
      >
        {qty <= 1 ? <TrashIcon className="w-3.5 h-3.5" /> : <MinusIcon className="w-3.5 h-3.5" />}
      </button>
      <span className="min-w-[1.25rem] text-center text-sm font-extrabold text-ink tabular-nums">{qty}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(qty + 1);
        }}
        aria-label={t("increase")}
        className={`${btn} bg-primary text-white hover:bg-primary-dark shadow-sm`}
      >
        <PlusIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
