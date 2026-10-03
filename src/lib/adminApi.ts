"use client";

import { invalidateMenuData } from "./useMenuData";

type Table = "categories" | "items" | "banners";

async function request(url: string, method: string, body?: unknown): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => null))?.error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  invalidateMenuData();
  return res;
}

export async function createRow(table: Table, data: Record<string, unknown>): Promise<string> {
  const res = await request(`/api/admin/${table}`, "POST", data);
  return ((await res.json()) as { id: string }).id;
}

export async function updateRow(table: Table, id: string, data: Record<string, unknown>): Promise<void> {
  await request(`/api/admin/${table}/${id}`, "PATCH", data);
}

export async function deleteRow(table: Table, id: string): Promise<void> {
  await request(`/api/admin/${table}/${id}`, "DELETE");
}

export async function saveSettings(entries: Record<string, string>): Promise<void> {
  await request("/api/admin/settings", "PUT", { entries });
}
