/**
 * Offline-first clients API. When online: calls backend + caches to RxDB.
 * When offline: reads from RxDB, queues writes to sync.
 */
import { getDb } from "@/lib/db/rxdb";
import { addToSyncQueue } from "@/lib/sync/sync-service";
import { isOnlineSignal } from "@/stores/networkStore";
import { userSignal } from "@/stores/userStore";
import { v4 as uuidv4 } from "uuid";
import { CLIENTS_API } from "@/api/http/v1/clients/clients.api";
import type {
  ListClientsResponse,
  GetClientResponse,
  CreateClientResponse,
  UpdateClientResponse,
  DeleteClientsResponse,
  CreateClientPayload,
  UpdateClientPayload,
  DeleteClientsPayload,
  GetAllClientsParams,
  ClientAttributes,
} from "@/api/http/v1/clients/clients.types";

function getUserId() {
  return userSignal.value?.user?.id;
}

/** Offline-first: read from local cache first, then sync from API when online */
function getLocalClients(userId: string) {
  return getDb().then(async (db) => {
    const docs = await db.clients.find({ selector: { user_id: userId } }).exec();
    return docs.map((d: { toJSON: () => Record<string, unknown> }) => {
      const j = d.toJSON();
      return {
        id: j.id as string,
        type: "client",
        attributes: {
          ...j,
          full_name: [j.first_name, j.last_name].filter(Boolean).join(" ").trim(),
        } as ClientAttributes,
      } as ListClientsResponse["data"][0];
    });
  });
}

export async function getClients(params?: GetAllClientsParams): Promise<ListClientsResponse> {
  const userId = getUserId();
  if (!userId) return { success: true, message: "", data: [], pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: 20 } };

  const db = await getDb();

  if (isOnlineSignal.value) {
    try {
      const res = await CLIENTS_API.GET_ALL(params);
      if (res.data?.length) {
        for (const item of res.data) {
          const attrs = (item.attributes ?? item) as unknown as Record<string, unknown>;
          const id = (attrs.id ?? (item as { id?: string }).id) as string;
          const existing = await db.clients.findOne(id).exec();
          const docData: Record<string, unknown> = {
            ...attrs,
            id,
            user_id: userId,
            is_local: false,
            sync_status: "synced",
          };
          if (existing) {
            await existing.patch(docData);
          } else {
            await db.clients.insert(docData);
          }
        }
      }
      return res;
    } catch (err) {
      const isNetworkError =
        !(err as { response?: unknown }).response ||
        (err as { code?: string }).code === "ERR_NETWORK" ||
        (err as { message?: string }).message?.includes("Network Error");
      if (isNetworkError) {
        const data = await getLocalClients(userId);
        return {
          success: true,
          message: "",
          data,
          pagination: { current_page: 1, total_pages: 1, total_count: data.length, per_page: data.length },
        };
      }
      throw err;
    }
  }

  const docs = await db.clients.find({ selector: { user_id: userId } }).exec();
  const data = docs.map((d: { toJSON: () => Record<string, unknown> }) => {
    const j = d.toJSON();
    return {
      id: j.id as string,
      type: "client",
      attributes: {
        ...j,
        full_name: [j.first_name, j.last_name].filter(Boolean).join(" ").trim(),
      } as ClientAttributes,
    } as ListClientsResponse["data"][0];
  });
  return {
    success: true,
    message: "",
    data,
    pagination: { current_page: 1, total_pages: 1, total_count: data.length, per_page: data.length },
  };
}

export async function getClient(id: string): Promise<GetClientResponse> {
  if (isOnlineSignal.value) {
    return CLIENTS_API.GET(id);
  }

  const db = await getDb();
  const doc = await db.clients.findOne(id).exec();
  if (!doc) throw new Error("Client not found");
  const j = doc.toJSON() as Record<string, unknown>;
  return {
    success: true,
    message: "",
    data: {
      data: {
        id: j.id as string,
        type: "client",
        attributes: { ...j, full_name: [j.first_name, j.last_name].filter(Boolean).join(" ").trim() } as unknown as ClientAttributes,
      },
    },
  };
}

export async function createClient(payload: CreateClientPayload): Promise<CreateClientResponse> {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  const clientPayload = payload.client;
  const id = uuidv4();
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    const res = await CLIENTS_API.CREATE(payload);
    return res;
  }

  const db = await getDb();
  const clientData = {
    id,
    first_name: clientPayload.first_name,
    last_name: clientPayload.last_name,
    gender: clientPayload.gender,
    measurement_unit: clientPayload.measurement_unit,
    phone_number: clientPayload.phone_number ?? "",
    email: clientPayload.email ?? "",
    in_trash: false,
    measurements: clientPayload.measurements ?? {},
    custom_fields: [],
    orders: (clientPayload.orders ?? []).map((o) => ({
      id: uuidv4(),
      client_id: id,
      item: o.item,
      quantity: o.quantity ?? 1,
      notes: o.notes,
      is_done: false,
      due_date: o.due_date,
      created_at: now,
      updated_at: now,
    })),
    created_at: now,
    updated_at: now,
    user_id: userId,
    is_local: true,
    sync_status: "pending",
  };

  await db.clients.insert(clientData);

  const syncPayload = {
    id,
    first_name: clientPayload.first_name,
    last_name: clientPayload.last_name,
    gender: clientPayload.gender,
    measurement_unit: clientPayload.measurement_unit,
    phone_number: clientPayload.phone_number,
    email: clientPayload.email,
    in_trash: false,
    measurements: clientPayload.measurements,
    custom_fields: clientPayload.custom_fields,
    orders: (clientPayload.orders ?? []).map((o) => ({
      id: uuidv4(),
      client_id: id,
      item: o.item,
      quantity: o.quantity ?? 1,
      notes: o.notes,
      is_done: false,
      due_date: o.due_date,
      created_at: now,
      updated_at: now,
    })),
    created_at: now,
    updated_at: now,
  };
  await addToSyncQueue("client", "create", syncPayload);

  const ordersWithMeta = (clientData.orders ?? []).map((o: Record<string, unknown>) => ({
    ...o,
    client_name: "",
    overdue: false,
  })) as unknown as ClientAttributes["orders"];

  return {
    success: true,
    message: "Client created (offline)",
    data: {
      client: {
        ...clientData,
        full_name: [clientData.first_name, clientData.last_name].filter(Boolean).join(" ").trim(),
        orders: ordersWithMeta,
      },
    },
  };
}

export async function updateClient(id: string, payload: UpdateClientPayload): Promise<UpdateClientResponse> {
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return CLIENTS_API.UPDATE(id, payload);
  }

  const db = await getDb();
  const doc = await db.clients.findOne(id).exec();
  if (!doc) throw new Error("Client not found");

  const clientPayload = payload.client;
  const updates: Record<string, unknown> = {
    first_name: clientPayload.first_name,
    last_name: clientPayload.last_name,
    gender: clientPayload.gender,
    measurement_unit: clientPayload.measurement_unit,
    phone_number: clientPayload.phone_number ?? null,
    email: clientPayload.email ?? null,
    measurements: clientPayload.measurements ?? doc.get("measurements"),
    custom_fields: clientPayload.custom_fields ?? doc.get("custom_fields"),
    updated_at: now,
    sync_status: "pending",
  };

  await doc.patch(updates);

  const syncPayload = {
    id,
    ...updates,
    updated_at: now,
  };
  await addToSyncQueue("client", "update", syncPayload);

  return {
    success: true,
    message: "Client updated (offline)",
    data: { id, type: "client", attributes: { ...doc.toJSON(), ...updates } as unknown as ClientAttributes },
  };
}

export async function bulkDeleteClients(payload: DeleteClientsPayload): Promise<DeleteClientsResponse> {
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return CLIENTS_API.BULK_DELETE(payload);
  }

  const db = await getDb();
  for (const clientId of payload.client_ids) {
    const doc = await db.clients.findOne(clientId).exec();
    if (doc) {
      await doc.patch({ in_trash: true, updated_at: now, sync_status: "pending" });
      await addToSyncQueue("client", "delete", { id: clientId, updated_at: now });
    }
  }

  return { success: true, message: "Clients moved to trash (offline)" };
}
