import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { insertRow, isAdminTable, replaceItemImages, type ImageInput } from "@/lib/menu-repo";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { table: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isAdminTable(params.table)) {
    return NextResponse.json({ error: "Unknown table" }, { status: 404 });
  }
  try {
    const body = (await req.json()) as Record<string, unknown> & { images?: ImageInput[] };
    const { images, ...fields } = body;
    const id = await insertRow(params.table, fields);
    if (params.table === "items" && Array.isArray(images)) {
      await replaceItemImages(id, images);
    }
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error(`POST /api/admin/${params.table} failed:`, err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
