import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-guard";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image is larger than 8 MB" }, { status: 413 });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Image storage is not configured" }, { status: 500 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "image";
    const blob = await put(`menu/${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
