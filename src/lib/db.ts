import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

/** Lazy Neon client — server-side only (uses DATABASE_URL). */
export function getSql(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) throw new Error("DATABASE_URL is not set");
    // Next.js caches global fetch() results; the Neon HTTP driver uses fetch, so opt out
    // or reads would return stale rows after admin edits.
    client = neon(url, { fetchOptions: { cache: "no-store" } });
  }
  return client;
}
