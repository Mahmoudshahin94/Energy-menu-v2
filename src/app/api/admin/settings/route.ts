import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { upsertSettings } from "@/lib/menu-repo";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = (await req.json()) as { entries?: Record<string, unknown> };
    const entries: Record<string, string> = {};
    for (const [key, value] of Object.entries(body.entries ?? {})) {
      entries[key] = String(value ?? "");
    }
    await upsertSettings(entries);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/admin/settings failed:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
