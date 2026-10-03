"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import type { Category } from "@/types";

interface CategoryTabsProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

/* ─── Photo mapping ──────────────────────────────────
   Keyed by lowercase English name (partial match), then by emoji.
   All photos are from Unsplash (already in next.config.mjs remotePatterns).
   Dimensions are small (300px) for fast loading.
*/
const PHOTO_BY_NAME: Record<string, string> = {
  "hot":     "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80",
  "cold":    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80",
  "iced":    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80",
  "milk":    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80",
  "shake":   "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80",
  "smoothi": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&q=80",
  "juice":   "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=80",
  "عصير":    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=80",
  "cocktail":"https://images.unsplash.com/photo-1536935338788-846bb9981813?w=300&q=80",
  "كوكتيل":  "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=300&q=80",
  "mojito":  "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=300&q=80",
  "موهيتو":  "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=300&q=80",
  "sweet":   "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&q=80",
  "حلو":     "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&q=80",
  "dessert": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&q=80",
  "coffee":  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80",
  "قهوة":    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80",
  "tea":     "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80",
  "شاي":     "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80",
  "سموثي":   "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&q=80",
  "ميلك":    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80",
  "مشروب":   "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80",
};

const PHOTO_BY_EMOJI: Record<string, string> = {
  "☕": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80",
  "🍵": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80",
  "🥤": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80",
  "🧋": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80",
  "🍹": "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=300&q=80",
  "🍸": "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=300&q=80",
  "🍊": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=80",
  "🍰": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&q=80",
  "🍫": "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=300&q=80",
  "🧁": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&q=80",
};

/* Fallback gradient palette when no photo matches */
const FALLBACK_GRADIENTS = [
  "linear-gradient(145deg,#FF6B35,#FF9F1C)",
  "linear-gradient(145deg,#E53935,#FF7043)",
  "linear-gradient(145deg,#00897B,#26C6DA)",
  "linear-gradient(145deg,#7B1FA2,#CE93D8)",
  "linear-gradient(145deg,#F57F17,#FDD835)",
  "linear-gradient(145deg,#2E7D32,#66BB6A)",
  "linear-gradient(145deg,#1565C0,#42A5F5)",
  "linear-gradient(145deg,#AD1457,#EC407A)",
];

/* Resolve the best photo URL for a category */
function resolvePhoto(cat: Category): string | null {
  const nameLower = (cat.name_en || "").toLowerCase();
  const nameAr = cat.name_ar || "";
  const icon = cat.icon || "";

  // Try emoji first
  if (icon && PHOTO_BY_EMOJI[icon]) return PHOTO_BY_EMOJI[icon];

  // Try keyword match in English name
  for (const [key, url] of Object.entries(PHOTO_BY_NAME)) {
    if (nameLower.includes(key) || nameAr.includes(key)) return url;
  }
  return null;
}

/* "All" hero image — coffee beans */
const ALL_PHOTO = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80";

export default function CategoryTabs({ categories, activeId, onSelect }: CategoryTabsProps) {
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const sorted = [...categories].filter((c) => c.active).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const el = activeRef.current;
      const container = scrollRef.current;
      const elLeft = el.offsetLeft;
      const elRight = elLeft + el.offsetWidth;
      const visibleLeft = container.scrollLeft;
      const visibleRight = visibleLeft + container.offsetWidth;
      if (elLeft < visibleLeft + 12) {
        container.scrollTo({ left: elLeft - 12, behavior: "smooth" });
      } else if (elRight > visibleRight - 12) {
        container.scrollTo({ left: elRight - container.offsetWidth + 12, behavior: "smooth" });
      }
    }
  }, [activeId]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto scrollbar-hide py-3 px-4"
    >
      {/* ── "All" card ── */}
      <CategoryCard
        isActive={activeId === null}
        onClick={() => onSelect(null)}
        photoUrl={ALL_PHOTO}
        fallbackGradient="linear-gradient(145deg,#3E2723,#795548)"
        icon="☕"
        name={lang === "ar" ? "الكل" : "All"}
      />

      {sorted.map((cat, i) => {
        const photo = resolvePhoto(cat);
        /* Show only the active language name — no bilingual display */
        const name = lang === "ar"
          ? (cat.name_ar || cat.name_en)
          : (cat.name_en || cat.name_ar);

        return (
          <CategoryCard
            key={cat.id}
            ref={activeId === cat.id ? activeRef : undefined}
            isActive={activeId === cat.id}
            onClick={() => onSelect(cat.id)}
            photoUrl={photo}
            fallbackGradient={FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}
            icon={cat.icon}
            name={name || ""}
          />
        );
      })}
    </div>
  );
}

/* ── Individual category card ──────────────────────── */
interface CardProps {
  isActive: boolean;
  onClick: () => void;
  photoUrl: string | null;
  fallbackGradient: string;
  icon?: string;
  name: string;
  ref?: React.Ref<HTMLButtonElement>;
}

import { forwardRef } from "react";

const CategoryCard = forwardRef<HTMLButtonElement, CardProps>(function CategoryCard(
  { isActive, onClick, photoUrl, fallbackGradient, icon, name },
  ref
) {
  const hasPhoto = !!photoUrl;

  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-pressed={isActive}
      className={`cat-card ${isActive ? "active" : ""}`}
      style={!hasPhoto ? { background: fallbackGradient } : undefined}
    >
      {/* ── Photo background ── */}
      {hasPhoto && (
        <div className="absolute inset-0 rounded-[18px] overflow-hidden">
          <Image
            src={photoUrl!}
            alt={name}
            fill
            sizes="96px"
            className="object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isActive
                ? "linear-gradient(to top, rgba(8,3,1,0.88) 0%, rgba(8,3,1,0.50) 50%, rgba(8,3,1,0.15) 100%)"
                : "linear-gradient(to top, rgba(8,3,1,0.78) 0%, rgba(8,3,1,0.38) 50%, rgba(8,3,1,0.08) 100%)",
            }}
          />
        </div>
      )}

      {/* ── Noise overlay (gradient-only cards) ── */}
      {!hasPhoto && (
        <span
          className="absolute inset-0 rounded-[18px] opacity-[0.08]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      )}

      {/* ── Emoji — only on gradient cards (no photo) ── */}
      {!hasPhoto && icon && (
        <motion.span
          className="relative z-10 text-[30px] drop-shadow leading-none mb-1"
          animate={isActive ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {icon}
        </motion.span>
      )}

      {/* ── Name — single language, up to 2 lines ── */}
      <span className="relative z-10 w-full text-center px-1.5 leading-tight">
        <span
          className="block text-white text-[11.5px] font-bold drop-shadow"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            lineHeight: "1.3",
          }}
        >
          {name}
        </span>
      </span>

      {/* ── Active glow ring ── */}
      {isActive && (
        <motion.span
          layoutId="cat-active-ring"
          className="absolute inset-0 rounded-[18px] border-[2.5px] border-primary"
          style={{ boxShadow: "0 0 14px rgba(204,0,0,0.45)" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </button>
  );
});
