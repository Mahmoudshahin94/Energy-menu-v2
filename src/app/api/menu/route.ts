import { NextResponse } from "next/server";
import { getMenuPayload } from "@/lib/menu-repo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getMenuPayload(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("GET /api/menu failed:", err);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
