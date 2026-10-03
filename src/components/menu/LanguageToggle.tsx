"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 bg-surface-2 rounded-full p-0.5 border border-border">
      <button
        onClick={() => setLang("ar")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
          lang === "ar"
            ? "bg-primary text-white shadow-sm"
            : "text-ink-2 hover:text-ink"
        }`}
      >
        عربي
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
          lang === "en"
            ? "bg-primary text-white shadow-sm"
            : "text-ink-2 hover:text-ink"
        }`}
      >
        EN
      </button>
    </div>
  );
}
