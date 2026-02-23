/**
 * RxDB schemas for offline storage.
 * Uses Dexie.js (IndexedDB) - works in Capacitor WebView.
 */
export const clientSchema = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    first_name: { type: "string" },
    last_name: { type: "string" },
    gender: { type: "string" },
    measurement_unit: { type: "string" },
    phone_number: { type: "string" },
    email: { type: "string" },
    in_trash: { type: "boolean" },
    measurements: { type: "object" },
    custom_fields: { type: "array" },
    orders: { type: "array" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
    user_id: { type: "string" },
    is_local: { type: "boolean" },
    sync_status: { type: "string", enum: ["synced", "pending", "conflict"] },
  } as const,
  required: ["id", "first_name", "last_name", "gender", "measurement_unit", "created_at", "updated_at"],
};

export const orderSchema = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    client_id: { type: "string" },
    user_id: { type: "string" },
    item: { type: "string" },
    quantity: { type: "number" },
    notes: { type: "string" },
    is_done: { type: "boolean" },
    due_date: { type: "string" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
    is_local: { type: "boolean" },
    sync_status: { type: "string", enum: ["synced", "pending", "conflict"] },
  } as const,
  required: ["id", "client_id", "item", "quantity", "is_done", "created_at", "updated_at"],
};

export const customFieldSchema = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    field_name: { type: "string" },
    field_type: { type: "string" },
    is_active: { type: "boolean" },
    user_id: { type: "string" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
    is_local: { type: "boolean" },
    sync_status: { type: "string", enum: ["synced", "pending", "conflict"] },
  } as const,
  required: ["id", "field_name", "field_type", "is_active", "created_at", "updated_at"],
};

/** Sync queue: pending changes to push when online */
export const syncQueueSchema = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    entity: { type: "string", enum: ["client", "order", "custom_field", "user_profile"] },
    action: { type: "string", enum: ["create", "update", "delete"] },
    payload: { type: "object" },
    updated_at: { type: "string" },
    created_at: { type: "string" },
  } as const,
  required: ["id", "entity", "action", "payload", "updated_at", "created_at"],
};
