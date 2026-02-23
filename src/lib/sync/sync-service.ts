import { getRxDb } from "@/lib/rxdb/database";
import { SYNC_API } from "@/api/http/v1/sync/sync.api";
import { userSignal, userStore } from "@/stores/userStore";
import type { ClientDoc, CustomFieldDoc, OrderDoc, PendingSyncDoc } from "@/lib/rxdb/schema";

const PENDING_SYNC_ID = "singleton";

export async function pushPendingSync(): Promise<boolean> {
  const db = getRxDb();
  if (!db) return false;

  const pendingDoc = await db.pending_sync.findOne({ selector: { id: PENDING_SYNC_ID } }).exec();
  if (!pendingDoc) return true;

  const data = pendingDoc.toJSON();
  const payload: Record<string, unknown> = {};
  let hasData = false;

  if (data.clients && (data.clients.created?.length || data.clients.updated?.length || data.clients.deleted?.length)) {
    payload.clients = data.clients;
    hasData = true;
  }
  if (data.orders && (data.orders.created?.length || data.orders.updated?.length || data.orders.deleted?.length)) {
    payload.orders = data.orders;
    hasData = true;
  }
  if (data.custom_fields && (data.custom_fields.created?.length || data.custom_fields.updated?.length || data.custom_fields.deleted?.length)) {
    payload.custom_fields = data.custom_fields;
    hasData = true;
  }
  if (data.user_profile?.updated?.length) {
    payload.user_profile = data.user_profile;
    hasData = true;
  }

  if (!hasData) return true;

  const result = await SYNC_API.push({ sync: payload });
  if (result.success) {
    await pendingDoc.incrementalModify((docData: PendingSyncDoc) => {
      docData.clients = { created: [], updated: [], deleted: [] };
      docData.orders = { created: [], updated: [], deleted: [] };
      docData.custom_fields = { created: [], updated: [], deleted: [] };
      docData.user_profile = { updated: [] };
      docData.updated_at = new Date().toISOString();
      return docData;
    });
  }
  return result.success;
}

export async function pullAndMergeSync(): Promise<void> {
  const db = getRxDb();
  if (!db) return;

  const { data } = await SYNC_API.getFull();
  if (!data) return;

  if (data.clients?.length) {
    const toUpsert: ClientDoc[] = (data.clients as Record<string, unknown>[]).map((c) => ({
      id: c.id as string,
      first_name: (c.first_name as string) ?? "",
      last_name: (c.last_name as string) ?? "",
      gender: (c.gender as string) ?? "Male",
      measurement_unit: (c.measurement_unit as string) ?? "centimeters",
      phone_number: c.phone_number as string | undefined,
      email: c.email as string | undefined,
      in_trash: (c.in_trash as boolean) ?? false,
      measurements: (c.measurements as Record<string, string | number | null>) ?? {},
      custom_fields: (c.custom_fields as Record<string, string | number>) ?? {},
      created_at: c.created_at as string,
      updated_at: c.updated_at as string,
    }));
    await db.clients.bulkUpsert(toUpsert);
  }

  if (data.orders?.length) {
    const toUpsert: OrderDoc[] = (data.orders as Record<string, unknown>[]).map((o) => ({
      id: o.id as string,
      client_id: o.client_id as string,
      item: (o.item as string) ?? "",
      quantity: (o.quantity as number) ?? 1,
      notes: o.notes as string | undefined,
      is_done: (o.is_done as boolean) ?? false,
      due_date: o.due_date as string | undefined,
      created_at: o.created_at as string,
      updated_at: o.updated_at as string,
    }));
    await db.orders.bulkUpsert(toUpsert);
  }

  if (data.custom_fields?.length) {
    const toUpsert: CustomFieldDoc[] = (data.custom_fields as Record<string, unknown>[]).map((cf) => ({
      id: cf.id as string,
      field_name: (cf.field_name as string) ?? "",
      field_type: (cf.field_type as string) ?? "measurement",
      is_active: (cf.is_active as boolean) ?? true,
      created_at: cf.created_at as string,
      updated_at: cf.updated_at as string,
    }));
    await db.custom_fields.bulkUpsert(toUpsert);
  }

  if (data.user_profile) {
    const u = data.user_profile as Record<string, unknown>;
    userStore.updateUser({ user: u as any });
  }
}

export async function runSync(): Promise<void> {
  const token = userSignal.value?.access_token;
  if (!token) return;

  try {
    await pushPendingSync();
    await pullAndMergeSync();
  } catch (e) {
    console.warn("Sync failed:", e);
  }
}
