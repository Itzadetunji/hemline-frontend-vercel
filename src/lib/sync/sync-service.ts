/**
 * Sync service: builds delta payload from sync queue, pushes to backend when online.
 * Last-write-wins via updated_at.
 */
import { getDb } from "@/lib/db/rxdb";
import { capacitorStorage } from "@/lib/storage/capacitor-storage";
import { CONFIGS } from "@/configs";
import type { SyncPayload } from "./sync.types";
import { v4 as uuidv4 } from "uuid";

const baseURL = `${CONFIGS.URL.API_BASE_URL}/v${CONFIGS.URL.API_VERSION}`;

export async function buildSyncPayload(): Promise<SyncPayload | null> {
  const db = await getDb();
  const queue = await db.sync_queue.find().exec();
  if (queue.length === 0) return null;

  const payload: SyncPayload = {
    clients: { created: [], updated: [], deleted: [] },
    orders: { created: [], updated: [], deleted: [] },
    custom_fields: { created: [], updated: [], deleted: [] },
    user_profile: { created: [], updated: [], deleted: [] },
  };

  for (const item of queue) {
    const doc = item.toJSON() as {
      entity: string;
      action: string;
      payload: Record<string, unknown>;
      updated_at: string;
    };
    const block = payload[doc.entity as keyof SyncPayload];
    if (!block) continue;

    const { entity, action, payload: p } = doc;
    switch (action) {
      case "create":
        (block as { created: unknown[] }).created.push(p as never);
        break;
      case "update":
        (block as { updated: unknown[] }).updated.push(p as never);
        break;
      case "delete":
        (block as { deleted: { id: string; updated_at: string }[] }).deleted.push({
          id: (p.id ?? p) as string,
          updated_at: (p.updated_at ?? doc.updated_at) as string,
        });
        break;
      default:
        break;
    }
  }

  // Remove empty blocks
  for (const key of Object.keys(payload) as (keyof SyncPayload)[]) {
    const block = payload[key];
    if (block && "created" in block) {
      const b = block as { created: unknown[]; updated: unknown[]; deleted: unknown[] };
      if (b.created.length === 0 && b.updated.length === 0 && b.deleted.length === 0) {
        delete payload[key];
      }
    }
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

export async function pushSync(accessToken: string): Promise<{ success: boolean; error?: string }> {
  const payload = await buildSyncPayload();
  if (!payload) return { success: true };

  const res = await fetch(`${baseURL}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ sync: payload }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      success: false,
      error: body?.errors?.[0] ?? body?.message ?? `Sync failed: ${res.status}`,
    };
  }

  const db = await getDb();
  await db.sync_queue.find().remove();

  return { success: true };
}

export async function addToSyncQueue(
  entity: "client" | "order" | "custom_field" | "user_profile",
  action: "create" | "update" | "delete",
  payload: Record<string, unknown>
) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.sync_queue.insert({
    id: uuidv4(),
    entity,
    action,
    payload: { ...payload, updated_at: now },
    updated_at: now,
    created_at: now,
  });
}
