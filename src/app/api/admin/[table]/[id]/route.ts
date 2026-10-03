import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  deleteRow,
  isAdminTable,
  replaceItemImages,
  updateRow,
  type ImageInput,
} from "@/lib/menu-repo";

export const dynamic = "force-dynamic";

type Ctx = { params: { table: string; id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isAdminTable(params.table)) {
    return NextResponse.json({ error: "Unknown table" }, { status: 404 });
  }
  try {
    const body = (await req.json()) as Record<string, unknown> & { images?: ImageInput[] };
    const { images, ...fields } = body;
    await updateRow(params.table, params.id, fields);
    if (params.table === "items" && Array.isArray(images)) {
      await replaceItemImages(params.id, images);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`PATCH /api/admin/${params.table} failed:`, err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isAdminTable(params.table)) {
    return NextResponse.json({ error: "Unknown table" }, { status: 404 });
  }
  try {
    await deleteRow(params.table, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/admin/${params.table} failed:`, err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
