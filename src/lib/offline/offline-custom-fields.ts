/**
 * Offline-first custom fields API. When online: calls backend. When offline: RxDB + sync queue.
 */
import { getDb } from "@/lib/db/rxdb";
import { addToSyncQueue } from "@/lib/sync/sync-service";
import { isOnlineSignal } from "@/stores/networkStore";
import { userSignal } from "@/stores/userStore";
import { v4 as uuidv4 } from "uuid";
import { CUSTOM_FIELDS_API } from "@/api/http/v1/custom_fields/custom-fields.api";
import type {
  CustomFieldsListResponse,
  CustomFieldResponse,
  CreateCustomFieldPayload,
  UpdateCustomFieldPayload,
} from "@/api/http/v1/custom_fields/custom-fields.types";

function getUserId() {
  return userSignal.value?.user?.id;
}

export async function getCustomFields(): Promise<CustomFieldsListResponse> {
  if (isOnlineSignal.value) {
    try {
      return await CUSTOM_FIELDS_API.GET_ALL();
    } catch (err) {
      const isNetworkError =
        !(err as { response?: unknown }).response ||
        (err as { code?: string }).code === "ERR_NETWORK" ||
        (err as { message?: string }).message?.includes("Network Error");
      if (!isNetworkError) throw err;
      const userId = getUserId();
      if (!userId) throw err;
      const db = await getDb();
      const docs = await db.custom_fields.find({ selector: { user_id: userId } }).exec();
      const data = docs.map((d: { toJSON: () => unknown }) => ({ data: d.toJSON() })) as CustomFieldsListResponse["data"];
      return { success: true, message: "", data };
    }
  }

  const db = await getDb();
  const userId = getUserId();
  if (!userId) return { success: true, message: "", data: [] };

  const docs = await db.custom_fields.find({ selector: { user_id: userId } }).exec();
  const data = docs.map((d: { toJSON: () => unknown }) => ({ data: d.toJSON() })) as CustomFieldsListResponse["data"];
  return { success: true, message: "", data };
}

export async function createCustomField(payload: CreateCustomFieldPayload): Promise<CustomFieldResponse> {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  const fieldPayload = payload.custom_field;
  const id = uuidv4();
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return CUSTOM_FIELDS_API.CREATE(payload);
  }

  const db = await getDb();
  const fieldData = {
    id,
    field_name: fieldPayload.field_name,
    field_type: fieldPayload.field_type ?? "measurement",
    is_active: true,
    user_id: userId,
    created_at: now,
    updated_at: now,
    is_local: true,
    sync_status: "pending",
  };

  await db.custom_fields.insert(fieldData);
  await addToSyncQueue("custom_field", "create", { ...fieldData, updated_at: now });

  return {
    success: true,
    message: "Custom field created (offline)",
    data: { id, type: "custom_field", attributes: fieldData },
  };
}

export async function updateCustomField(id: string, payload: UpdateCustomFieldPayload): Promise<CustomFieldResponse> {
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return CUSTOM_FIELDS_API.UPDATE(id, payload);
  }

  const db = await getDb();
  const doc = await db.custom_fields.findOne(id).exec();
  if (!doc) throw new Error("Custom field not found");

  const fieldPayload = payload.custom_field;
  const updates: Record<string, unknown> = {
    field_name: fieldPayload?.field_name ?? doc.get("field_name"),
    field_type: fieldPayload?.field_type ?? doc.get("field_type"),
    is_active: fieldPayload?.is_active ?? doc.get("is_active"),
    updated_at: now,
    sync_status: "pending",
  };

  await doc.patch(updates);
  await addToSyncQueue("custom_field", "update", { id, ...updates, updated_at: now });

  return {
    success: true,
    message: "Custom field updated (offline)",
    data: { id, type: "custom_field" as const, attributes: { ...doc.toJSON(), ...updates } } as unknown as import("@/api/http/v1/custom_fields/custom-fields.types").CustomFieldResponse["data"],
  };
}

export async function deactivateCustomField(id: string): Promise<{ message: string }> {
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return CUSTOM_FIELDS_API.DEACTIVATE(id);
  }

  const db = await getDb();
  const doc = await db.custom_fields.findOne(id).exec();
  if (doc) {
    await doc.patch({ is_active: false, updated_at: now, sync_status: "pending" });
    await addToSyncQueue("custom_field", "delete", { id, updated_at: now });
  }

  return { message: "Custom field deactivated (offline)" };
}
