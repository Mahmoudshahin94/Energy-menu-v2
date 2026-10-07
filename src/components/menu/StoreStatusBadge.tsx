"use client";

import { useLanguage } from "@/context/LanguageContext";

/** Green "Open now" / red "Closed" pill. */
export default function StoreStatusBadge({ open, className = "" }: { open: boolean; className?: string }) {
  const { t } = useLanguage();

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${
        open
          ? "border-green-500/40 bg-green-500/15 text-green-600 dark:text-green-400"
          : "border-red-500/40 bg-red-500/15 text-red-600 dark:text-red-400"
      } ${className}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${open ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
      {open ? t("store_open") : t("store_closed")}
    </span>
  );
}
