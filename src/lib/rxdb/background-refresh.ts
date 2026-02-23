import { CLIENTS_API } from "@/api/http/v1/clients/clients.api";
import type { GetAllClientsParams } from "@/api/http/v1/clients/clients.types";
import { FOLDERS_API } from "@/api/http/v1/gallery/folders/folders.api";
import type { PaginationParams as FolderPaginationParams } from "@/api/http/v1/gallery/folders/folders.types";
import { GALLERY_API } from "@/api/http/v1/gallery/gallery.api";
import { ORDERS_API } from "@/api/http/v1/orders/orders.api";
import type { GetAllOrdersParams } from "@/api/http/v1/orders/orders.types";
import { getRxDb, initRxDb } from "./database";

export async function refreshClientsInBackground(params?: GetAllClientsParams): Promise<boolean> {
  try {
    await initRxDb();
    const db = getRxDb();
    if (!db) return false;

    const response = await CLIENTS_API.GET_ALL(params);
    await db.clients.bulkUpsert(
      response.data.map((client) => ({
        id: client.attributes.id,
        first_name: client.attributes.first_name,
        last_name: client.attributes.last_name,
        gender: client.attributes.gender,
        measurement_unit: client.attributes.measurement_unit,
        phone_number: client.attributes.phone_number,
        email: client.attributes.email,
        in_trash: client.attributes.in_trash,
        measurements: client.attributes.measurements ?? {},
        custom_fields: {},
        created_at: client.attributes.created_at,
        updated_at: client.attributes.updated_at,
      }))
    );
    return true;
  } catch {
    return false;
  }
}

export async function refreshOrdersInBackground(params?: GetAllOrdersParams): Promise<boolean> {
  try {
    await initRxDb();
    const db = getRxDb();
    if (!db) return false;

    const response = await ORDERS_API.GET_ALL(params);
    await db.orders.bulkUpsert(
      response.data.orders.map((order) => ({
        id: order.id,
        client_id: order.client_id,
        client_name: order.client_name,
        item: order.item,
        quantity: order.quantity,
        notes: order.notes,
        is_done: order.is_done,
        overdue: order.overdue,
        due_date: order.due_date,
        created_at: order.created_at,
        updated_at: order.updated_at,
      }))
    );
    return true;
  } catch {
    return false;
  }
}

export async function refreshGalleryInBackground(params?: { page?: number; per_page?: number }): Promise<boolean> {
  try {
    await initRxDb();
    const db = getRxDb();
    if (!db) return false;

    const response = await GALLERY_API.GET_GALLERIES(params);
    const now = new Date().toISOString();
    await db.galleries.bulkUpsert(
      response.data.map((img) => ({
        id: img.id,
        file_name: img.file_name,
        description: img.description,
        url: img.url,
        public_id: img.public_id,
        folder_ids: img.folder_ids ?? [],
        created_at: img.created_at,
        updated_at: img.created_at || now,
        meta: img.meta ?? {},
      }))
    );
    return true;
  } catch {
    return false;
  }
}

export async function refreshFoldersInBackground(params?: FolderPaginationParams): Promise<boolean> {
  try {
    await initRxDb();
    const db = getRxDb();
    if (!db) return false;

    const response = await FOLDERS_API.GET_FOLDERS(params);
    const now = new Date().toISOString();
    await db.folders.bulkUpsert(
      response.data.map((folder) => ({
        id: folder.id,
        name: folder.name,
        description: folder.description || "",
        image_ids: folder.image_ids ?? [],
        cover_image: folder.cover_image ?? null,
        created_at: folder.created_at,
        folder_color: folder.folder_color,
        is_public: folder.is_public,
        public_id: folder.public_id,
        public_url: folder.public_url,
        updated_at: now,
      }))
    );
    return true;
  } catch {
    return false;
  }
}

export async function refreshFolderInBackground(id: string, params?: FolderPaginationParams): Promise<boolean> {
  try {
    await initRxDb();
    const db = getRxDb();
    if (!db) return false;

    const response = await FOLDERS_API.GET_FOLDER(id, params);
    const now = new Date().toISOString();

    await db.folders.bulkUpsert([
      {
        id: response.data.folder.id,
        name: response.data.folder.name,
        description: response.data.folder.description || "",
        image_ids: response.data.folder.image_ids ?? [],
        cover_image: response.data.folder.cover_image ?? null,
        created_at: response.data.folder.created_at,
        folder_color: response.data.folder.folder_color,
        is_public: response.data.folder.is_public,
        public_id: response.data.folder.public_id,
        public_url: response.data.folder.public_url,
        updated_at: now,
      },
    ]);

    await db.galleries.bulkUpsert(
      response.data.images.map((img) => ({
        id: img.id,
        file_name: img.file_name,
        description: img.description,
        url: img.url,
        public_id: img.public_id,
        folder_ids: img.folder_ids ?? [],
        created_at: img.created_at,
        updated_at: img.created_at || now,
        meta: img.meta ?? {},
      }))
    );

    return true;
  } catch {
    return false;
  }
}
