import type { ClientAttributes } from "@/api/http/v1/clients/clients.types";
import type { Folder } from "@/api/http/v1/gallery/folders/folders.types";
import type { GalleryImageType } from "@/api/http/v1/gallery/gallery.types";
import type { OrderAttributes } from "@/api/http/v1/orders/orders.types";
import { getRxDb, initRxDb } from "./database";

export async function upsertClientToLocal(client: ClientAttributes) {
  await initRxDb();
  const db = getRxDb();
  if (!db) return;

  await db.clients.bulkUpsert([
    {
      id: client.id,
      first_name: client.first_name,
      last_name: client.last_name,
      gender: client.gender,
      measurement_unit: client.measurement_unit,
      phone_number: client.phone_number,
      email: client.email,
      in_trash: client.in_trash,
      measurements: client.measurements ?? {},
      custom_fields: {},
      created_at: client.created_at,
      updated_at: client.updated_at,
    },
  ]);
}

export async function removeClientsFromLocal(ids: string[]) {
  await initRxDb();
  const db = getRxDb();
  if (!db) return;
  const docs = await Promise.all(ids.map((id) => db.clients.findOne(id).exec()));
  await Promise.all(docs.filter(Boolean).map((doc) => doc?.remove()));
}

export async function upsertOrderToLocal(order: OrderAttributes) {
  await initRxDb();
  const db = getRxDb();
  if (!db) return;

  await db.orders.bulkUpsert([
    {
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
    },
  ]);
}

export async function removeOrdersFromLocal(ids: string[]) {
  await initRxDb();
  const db = getRxDb();
  if (!db) return;
  const docs = await Promise.all(ids.map((id) => db.orders.findOne(id).exec()));
  await Promise.all(docs.filter(Boolean).map((doc) => doc?.remove()));
}

export async function upsertGalleryImagesToLocal(images: GalleryImageType[]) {
  await initRxDb();
  const db = getRxDb();
  if (!db || images.length === 0) return;
  const now = new Date().toISOString();

  await db.galleries.bulkUpsert(
    images.map((img) => ({
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
}

export async function upsertFoldersToLocal(folders: Folder[]) {
  await initRxDb();
  const db = getRxDb();
  if (!db || folders.length === 0) return;
  const now = new Date().toISOString();

  await db.folders.bulkUpsert(
    folders.map((folder) => ({
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
}

export async function upsertFolderToLocal(folder: Folder) {
  await upsertFoldersToLocal([folder]);
}

export async function removeFoldersFromLocal(ids: string[]) {
  await initRxDb();
  const db = getRxDb();
  if (!db) return;
  const docs = await Promise.all(ids.map((id) => db.folders.findOne(id).exec()));
  await Promise.all(docs.filter(Boolean).map((doc) => doc?.remove()));
}

export async function removeGalleryImagesFromLocal(ids: string[]) {
  await initRxDb();
  const db = getRxDb();
  if (!db) return;
  const docs = await Promise.all(ids.map((id) => db.galleries.findOne(id).exec()));
  await Promise.all(docs.filter(Boolean).map((doc) => doc?.remove()));
}
