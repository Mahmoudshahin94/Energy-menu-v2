"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MenuPayload } from "./menu-repo";

const POLL_MS = 30_000;
const listeners = new Set<() => void>();

/** Ask every mounted useMenuData hook to re-fetch (call after an admin write). */
export function invalidateMenuData(): void {
  listeners.forEach((fn) => fn());
}

export interface MenuDataState {
  data: MenuPayload | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/** Fetches /api/menu, re-validating on focus, on an interval, and on invalidateMenuData(). */
export function useMenuData(): MenuDataState {
  const [data, setData] = useState<MenuPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/menu", { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as MenuPayload;
      if (!mounted.current) return;
      setData(json);
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refetch();
    const onFocus = () => void refetch();
    const timer = setInterval(() => void refetch(), POLL_MS);
    listeners.add(onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      listeners.delete(onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
