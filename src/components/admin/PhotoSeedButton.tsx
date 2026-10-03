"use client";

import { useState } from "react";
import { seedItemPhotos } from "@/lib/seedPhotos";

export default function PhotoSeedButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ updated: number } | null>(null);
  const [error, setError] = useState("");

  const handleAddPhotos = async () => {
    if (!confirm("This will add nice photos to all menu items. Items that already have photos will also be updated. Continue?")) return;
    setStatus("loading");
    setError("");
    try {
      const res = await seedItemPhotos();
      setResult({ updated: res.updated });
      setStatus("done");
    } catch (err) {
      setError("Failed to add photos. Please try again.");
      console.error(err);
      setStatus("error");
    }
  };

  if (status === "done" && result) {
    return (
      <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-sm font-medium">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        ✅ {result.updated} items updated with photos!
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleAddPhotos}
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
      >
        {status === "loading" ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Adding photos…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add Photos to All Items
          </>
        )}
      </button>
      {status === "error" && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}
