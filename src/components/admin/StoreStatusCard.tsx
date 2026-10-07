"use client";

import { useEffect, useRef, useState } from "react";
import { saveSettings } from "@/lib/adminApi";
import { STORE_OPEN_KEY, isStoreOpen } from "@/lib/store";
import type { Settings } from "@/types";

interface StoreStatusCardProps {
  settings: Settings[] | undefined;
  loading: boolean;
}

/** Admin switch for the public Open / Closed badge (closed blocks ordering). */
export default function StoreStatusCard({ settings, loading }: StoreStatusCardProps) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  /** Value we just saved; ignore refetched settings until they catch up with it. */
  const expected = useRef<boolean | null>(null);

  useEffect(() => {
    if (!settings || saving) return;
    const fromServer = isStoreOpen(settings);
    if (expected.current !== null && fromServer !== expected.current) return;
    expected.current = null;
    setOpen(fromServer);
  }, [settings, saving]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    setSaving(true);
    expected.current = next;
    try {
      await saveSettings({ [STORE_OPEN_KEY]: next ? "true" : "false" });
    } catch (err) {
      expected.current = null;
      setOpen(!next);
      alert(err instanceof Error ? err.message : "Failed to update store status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-5 flex items-center gap-4 transition-colors ${
        open ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Store status</p>
        <p className={`text-xl font-extrabold mt-0.5 ${open ? "text-green-700" : "text-red-700"}`}>
          {loading ? "…" : open ? "Open — taking orders" : "Closed — orders blocked"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Customers see this on the menu. When closed, they can&apos;t add items or place orders.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={open}
        aria-label="Store open"
        disabled={loading || saving}
        onClick={toggle}
        className={`relative w-16 h-9 rounded-full flex-shrink-0 transition-colors disabled:opacity-60 ${
          open ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <span
          className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${
            open ? "left-8" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
