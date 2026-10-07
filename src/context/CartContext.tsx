"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  MAX_NOTE_LENGTH,
  MAX_QTY,
  lineKey,
  type CartLine,
  type PriceSize,
} from "@/lib/cart";

const STORAGE_KEY = "energy-cart-v1";

interface CartContextType {
  lines: CartLine[];
  /** Total number of units in the cart. */
  count: number;
  /** False until the saved cart has been read from localStorage. */
  ready: boolean;
  getQty: (itemId: string, size?: PriceSize) => number;
  add: (itemId: string, size?: PriceSize) => void;
  setQty: (key: string, qty: number) => void;
  setNote: (key: string, note: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType>({
  lines: [],
  count: 0,
  ready: false,
  getQty: () => 0,
  add: () => {},
  setQty: () => {},
  setNote: () => {},
  clear: () => {},
});

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is CartLine =>
          !!l && typeof l.key === "string" && typeof l.itemId === "string" && Number(l.qty) > 0
      )
      .map((l) => ({
        key: l.key,
        itemId: l.itemId,
        size: l.size === "small" || l.size === "large" ? l.size : undefined,
        qty: Math.min(MAX_QTY, Math.floor(Number(l.qty))),
        note: typeof l.note === "string" ? l.note.slice(0, MAX_NOTE_LENGTH) : "",
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStored());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — cart just won't persist */
    }
  }, [lines, ready]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((itemId: string, size?: PriceSize) => {
    const key = lineKey(itemId, size);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l));
      }
      return [...prev, { key, itemId, size, qty: 1, note: "" }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, Math.floor(qty)) } : l))
    );
  }, []);

  const setNote = useCallback((key: string, note: string) => {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, note: note.slice(0, MAX_NOTE_LENGTH) } : l))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const getQty = useCallback(
    (itemId: string, size?: PriceSize) =>
      lines.find((l) => l.key === lineKey(itemId, size))?.qty ?? 0,
    [lines]
  );

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const value = useMemo<CartContextType>(
    () => ({
      lines,
      count,
      ready,
      getQty,
      add,
      setQty,
      setNote,
      clear,
    }),
    [lines, count, ready, getQty, add, setQty, setNote, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
