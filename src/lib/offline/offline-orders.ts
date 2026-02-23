/**
 * Offline-first orders API. When online: calls backend + caches. When offline: RxDB + sync queue.
 */
import { getDb } from "@/lib/db/rxdb";
import { addToSyncQueue } from "@/lib/sync/sync-service";
import { isOnlineSignal } from "@/stores/networkStore";
import { userSignal } from "@/stores/userStore";
import { v4 as uuidv4 } from "uuid";
import { ORDERS_API } from "@/api/http/v1/orders/orders.api";
import type {
  ListOrdersResponse,
  GetOrderResponse,
  CreateOrderResponse,
  UpdateOrderResponse,
  DeleteOrderResponse,
  DeleteOrdersResponse,
  CreateOrderPayload,
  UpdateOrderPayload,
  DeleteOrdersPayload,
  GetAllOrdersParams,
} from "@/api/http/v1/orders/orders.types";

function getUserId() {
  return userSignal.value?.user?.id;
}

export async function getOrders(params?: GetAllOrdersParams): Promise<ListOrdersResponse> {
  if (isOnlineSignal.value) {
    try {
      return await ORDERS_API.GET_ALL(params);
    } catch (err) {
      const isNetworkError =
        !(err as { response?: unknown }).response ||
        (err as { code?: string }).code === "ERR_NETWORK" ||
        (err as { message?: string }).message?.includes("Network Error");
      if (!isNetworkError) throw err;
      const userId = getUserId();
      if (!userId) throw err;
      const db = await getDb();
      const docs = await db.orders.find({ selector: { user_id: userId } }).exec();
      const orders = docs.map((d: { toJSON: () => Record<string, unknown> }) => {
        const j = d.toJSON();
        const dueDate = j.due_date;
        const isOverdue = typeof dueDate === "string" && dueDate ? new Date(dueDate) < new Date() && !j.is_done : false;
        return { ...j, client_name: "", overdue: !!isOverdue };
      }) as import("@/api/http/v1/orders/orders.types").OrderAttributes[];
      return {
        success: true,
        message: "",
        data: {
          orders,
          pagination: { current_page: 1, total_pages: 1, total_count: orders.length, per_page: orders.length },
        },
      };
    }
  }

  const db = await getDb();
  const userId = getUserId();
  if (!userId) {
    return {
      success: true,
      message: "",
      data: { orders: [], pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: 20 } },
    };
  }

  const docs = await db.orders.find({ selector: { user_id: userId } }).exec();
  const orders: import("@/api/http/v1/orders/orders.types").OrderAttributes[] = docs.map((d: { toJSON: () => Record<string, unknown> }) => {
    const j = d.toJSON();
    const dueDate = j.due_date;
    const isOverdue = typeof dueDate === "string" && dueDate ? new Date(dueDate) < new Date() && !j.is_done : false;
    return {
      ...j,
      client_name: "",
      overdue: !!isOverdue,
    } as import("@/api/http/v1/orders/orders.types").OrderAttributes;
  });
  return {
    success: true,
    message: "",
    data: {
      orders,
      pagination: { current_page: 1, total_pages: 1, total_count: orders.length, per_page: orders.length },
    },
  };
}

export async function getOrder(clientId: string, orderId: string): Promise<GetOrderResponse> {
  if (isOnlineSignal.value) {
    return ORDERS_API.GET(clientId, orderId);
  }

  const db = await getDb();
  const doc = await db.orders.findOne(orderId).exec();
  if (!doc) throw new Error("Order not found");
  const j = doc.toJSON() as Record<string, unknown>;
  const dueDate = j.due_date;
  const isOverdue = typeof dueDate === "string" && dueDate ? new Date(dueDate) < new Date() && !j.is_done : false;
  return {
    success: true,
    message: "",
    data: {
      order: {
        ...j,
        client_name: "",
        overdue: !!isOverdue,
      } as import("@/api/http/v1/orders/orders.types").OrderAttributes,
    },
  };
}

export async function createOrder(clientId: string, payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  const orderPayload = payload.order;
  const id = uuidv4();
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return ORDERS_API.CREATE(clientId, payload);
  }

  const db = await getDb();
  const orderData = {
    id,
    client_id: clientId,
    user_id: userId,
    item: orderPayload.item,
    quantity: orderPayload.quantity ?? 1,
    notes: orderPayload.notes ?? "",
    is_done: orderPayload.is_done ?? false,
    due_date: orderPayload.due_date ?? null,
    created_at: now,
    updated_at: now,
    is_local: true,
    sync_status: "pending",
  };

  await db.orders.insert(orderData);
  await addToSyncQueue("order", "create", { ...orderData, updated_at: now });

  return {
    success: true,
    message: "Order created (offline)",
    data: {
      order: {
        ...orderData,
        due_date: orderData.due_date ?? undefined,
        client_name: "",
        overdue: false,
      },
    },
  };
}

export async function updateOrder(orderId: string, payload: UpdateOrderPayload): Promise<UpdateOrderResponse> {
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return ORDERS_API.UPDATE(orderId, payload);
  }

  const db = await getDb();
  const doc = await db.orders.findOne(orderId).exec();
  if (!doc) throw new Error("Order not found");

  const orderPayload = payload.order;
  const updates: Record<string, unknown> = {
    item: orderPayload?.item ?? doc.get("item"),
    quantity: orderPayload?.quantity ?? doc.get("quantity"),
    notes: orderPayload?.notes ?? doc.get("notes"),
    is_done: orderPayload?.is_done ?? doc.get("is_done"),
    due_date: orderPayload?.due_date ?? doc.get("due_date"),
    updated_at: now,
    sync_status: "pending",
  };

  await doc.patch(updates);
  await addToSyncQueue("order", "update", { id: orderId, ...updates, updated_at: now });

  return {
    success: true,
    message: "Order updated (offline)",
    data: { ...doc.toJSON(), ...updates } as unknown as import("@/api/http/v1/orders/orders.types").OrderAttributes,
  };
}

export async function deleteOrder(orderId: string): Promise<DeleteOrderResponse> {
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return ORDERS_API.DELETE(orderId);
  }

  const db = await getDb();
  const doc = await db.orders.findOne(orderId).exec();
  if (doc) {
    await doc.remove();
    await addToSyncQueue("order", "delete", { id: orderId, updated_at: now });
  }

  return { success: true, message: "Order deleted (offline)" };
}

export async function bulkDeleteOrders(payload: DeleteOrdersPayload): Promise<DeleteOrdersResponse> {
  const now = new Date().toISOString();

  if (isOnlineSignal.value) {
    return ORDERS_API.BULK_DELETE(payload);
  }

  const db = await getDb();
  for (const orderId of payload.order_ids) {
    const doc = await db.orders.findOne(orderId).exec();
    if (doc) {
      await doc.remove();
      await addToSyncQueue("order", "delete", { id: orderId, updated_at: now });
    }
  }

  return { success: true, message: "Orders deleted (offline)", data: { affected_count: payload.order_ids.length } };
}

export async function markOrderAsDone(orderId: string): Promise<UpdateOrderResponse> {
  const db = await getDb();
  const doc = await db.orders.findOne(orderId).exec();
  if (!doc) throw new Error("Order not found");
  return updateOrder(orderId, {
    order: {
      item: String(doc.get("item") ?? ""),
      quantity: (doc.get("quantity") as number) ?? 1,
      notes: (doc.get("notes") as string) ?? undefined,
      is_done: true,
      due_date: (doc.get("due_date") as string) ?? undefined,
    },
  });
}

export async function markOrderAsPending(orderId: string): Promise<UpdateOrderResponse> {
  const db = await getDb();
  const doc = await db.orders.findOne(orderId).exec();
  if (!doc) throw new Error("Order not found");
  return updateOrder(orderId, {
    order: {
      item: String(doc.get("item") ?? ""),
      quantity: (doc.get("quantity") as number) ?? 1,
      notes: (doc.get("notes") as string) ?? undefined,
      is_done: false,
      due_date: (doc.get("due_date") as string) ?? undefined,
    },
  });
}
