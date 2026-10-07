import type { Settings } from "@/types";

/** settings.key that holds the Open/Closed switch ("true" | "false"). */
export const STORE_OPEN_KEY = "store_open";

/** The store counts as open unless the admin explicitly set it to "false". */
export function isStoreOpen(settings: Settings[] | undefined): boolean {
  const entry = settings?.find((s) => s.key === STORE_OPEN_KEY);
  return entry?.value !== "false";
}
