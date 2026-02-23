import type { ClientAttributes, ClientData, GenderType, GetClientResponse, ListClientsResponse, MeasurementUnitType } from "@/api/http/v1/clients/clients.types";
import type { Folder, GetFolderResponse, GetFoldersResponse, PaginationParams as FolderPaginationParams } from "@/api/http/v1/gallery/folders/folders.types";
import type { GalleryImageType, GetGalleriesResponse, GetGalleryImageResponse } from "@/api/http/v1/gallery/gallery.types";
import type { GetAllOrdersParams, GetOrderResponse, ListOrdersResponse, OrderAttributes } from "@/api/http/v1/orders/orders.types";
import { getRxDb, initRxDb } from "./database";

const DEFAULT_PAGE_SIZE = 20;

const sortByUpdatedDesc = <T extends { updated_at?: string }>(a: T, b: T) => (b.updated_at || "").localeCompare(a.updated_at || "");

const mapClientAttributes = (r: {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  measurement_unit: string;
  phone_number?: string;
  email?: string;
  in_trash: boolean;
  measurements: Record<string, string | number | null>;
  created_at: string;
  updated_at: string;
}): ClientAttributes => ({
  id: r.id,
  first_name: r.first_name,
  last_name: r.last_name,
  full_name: `${r.first_name} ${r.last_name}`.trim(),
  gender: r.gender as GenderType,
  measurement_unit: r.measurement_unit as MeasurementUnitType,
  phone_number: r.phone_number,
  email: r.email,
  in_trash: r.in_trash,
  measurements: r.measurements as ClientAttributes["measurements"],
  custom_fields: [],
  created_at: r.created_at,
  updated_at: r.updated_at,
});

const mapGalleryRow = (r: {
  id: string;
  file_name: string;
  description?: string;
  url: string;
  public_id: string;
  folder_ids: readonly string[];
  created_at: string;
  meta?: Record<string, unknown>;
}): GalleryImageType => ({
  id: r.id,
  file_name: r.file_name,
  description: r.description || "",
  url: r.url,
  public_id: r.public_id,
  folder_ids: [...r.folder_ids],
  created_at: r.created_at,
  meta: (r.meta || {}) as GalleryImageType["meta"],
});

const mapFolderRow = (r: {
  id: string;
  name: string;
  description: string;
  image_ids: readonly string[];
  cover_image: string | null;
  created_at: string;
  folder_color: number;
  is_public?: boolean;
  public_id?: string;
  public_url?: string;
}): Folder => ({
  id: r.id,
  name: r.name,
  description: r.description,
  image_ids: [...r.image_ids],
  cover_image: r.cover_image,
  created_at: r.created_at,
  folder_color: r.folder_color,
  is_public: r.is_public,
  public_id: r.public_id,
  public_url: r.public_url,
});

export async function readClientsFromLocal(params?: { page?: number; per_page?: number; search?: string }): Promise<ListClientsResponse> {
  try {
    await initRxDb();
    const db = getRxDb();
    if (!db) {
      return {
        success: true,
        message: "Clients loaded from local database",
        data: [],
        pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: DEFAULT_PAGE_SIZE },
      };
    }

    const docs = await db.clients.find().exec();
    let rows = docs.map((d) => d.toJSON());

    if (params?.search?.trim()) {
      const s = params.search.trim().toLowerCase();
      rows = rows.filter((r) => [r.first_name, r.last_name, r.email, r.phone_number].some((v) => (v || "").toLowerCase().includes(s)));
    }

    rows.sort(sortByUpdatedDesc);

    const perPage = params?.per_page || DEFAULT_PAGE_SIZE;
    const page = params?.page || 1;
    const start = (page - 1) * perPage;
    const pageRows = rows.slice(start, start + perPage);

    const data: ClientData[] = pageRows.map((r) => ({
      id: r.id,
      type: "client",
      attributes: mapClientAttributes(r),
    }));

    return {
      success: true,
      message: "Clients loaded from local database",
      data,
      pagination: {
        current_page: page,
        total_pages: Math.max(1, Math.ceil(rows.length / perPage)),
        total_count: rows.length,
        per_page: perPage,
      },
    };
  } catch {
    return {
      success: true,
      message: "Clients loaded from local database",
      data: [],
      pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: DEFAULT_PAGE_SIZE },
    };
  }
}

export async function readClientFromLocal(id: string): Promise<GetClientResponse> {
  await initRxDb();
  const db = getRxDb();
  if (!db) {
    throw new Error("Local database not ready");
  }

  const doc = await db.clients.findOne(id).exec();
  if (!doc) {
    throw new Error("Client not found in local database");
  }

  const r = doc.toJSON();
  const attributes = mapClientAttributes(r);

  return {
    success: true,
    message: "Client loaded from local database",
    data: {
      data: {
        id: r.id,
        type: "client",
        attributes,
      },
    },
  };
}

export async function readOrdersFromLocal(params?: GetAllOrdersParams): Promise<ListOrdersResponse> {
  await initRxDb();
  const db = getRxDb();
  if (!db) {
    return {
      success: true,
      message: "Orders loaded from local database",
      data: {
        orders: [],
        pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: DEFAULT_PAGE_SIZE },
      },
    };
  }

  const docs = await db.orders.find().exec();
  let rows = docs.map((d) => d.toJSON());
  if (params?.client_id) {
    rows = rows.filter((r) => r.client_id === params.client_id);
  }
  if (params?.search?.trim()) {
    const s = params.search.trim().toLowerCase();
    rows = rows.filter((r) => [r.item, r.client_name, r.notes].some((v) => (v || "").toLowerCase().includes(s)));
  }
  if (params?.status === "completed") {
    rows = rows.filter((r) => r.is_done);
  }
  if (params?.status === "pending") {
    rows = rows.filter((r) => !r.is_done);
  }
  if (params?.status === "overdue") {
    rows = rows.filter((r) => !!r.overdue);
  }
  rows.sort(sortByUpdatedDesc);

  const perPage = params?.per_page || DEFAULT_PAGE_SIZE;
  const page = params?.page || 1;
  const start = (page - 1) * perPage;
  const pageRows = rows.slice(start, start + perPage);

  const orders: OrderAttributes[] = pageRows.map((r) => ({
    id: r.id,
    client_id: r.client_id,
    client_name: r.client_name || "",
    item: r.item,
    quantity: r.quantity,
    notes: r.notes,
    is_done: r.is_done,
    due_date: r.due_date,
    overdue: !!r.overdue,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  return {
    success: true,
    message: "Orders loaded from local database",
    data: {
      orders,
      pagination: {
        current_page: page,
        total_pages: Math.max(1, Math.ceil(rows.length / perPage)),
        total_count: rows.length,
        per_page: perPage,
      },
    },
  };
}

export async function readOrderFromLocal(orderId: string): Promise<GetOrderResponse> {
  await initRxDb();
  const db = getRxDb();
  if (!db) {
    throw new Error("Local database not ready");
  }

  const doc = await db.orders.findOne(orderId).exec();
  if (!doc) {
    throw new Error("Order not found in local database");
  }

  const r = doc.toJSON();
  const order: OrderAttributes = {
    id: r.id,
    client_id: r.client_id,
    client_name: r.client_name || "",
    item: r.item,
    quantity: r.quantity,
    notes: r.notes,
    is_done: r.is_done,
    due_date: r.due_date,
    overdue: !!r.overdue,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };

  return {
    success: true,
    message: "Order loaded from local database",
    data: { order },
  };
}

export async function readGalleryFromLocal(params?: { page?: number; per_page?: number }): Promise<GetGalleriesResponse> {
  await initRxDb();
  const db = getRxDb();
  if (!db) {
    return {
      message: "Gallery loaded from local database",
      data: [],
      pagination: { current_page: 1, per_page: DEFAULT_PAGE_SIZE, total: 0, total_pages: 1 },
    };
  }

  const docs = await db.galleries.find().exec();
  const rows = docs.map((d) => d.toJSON()).sort(sortByUpdatedDesc);

  const perPage = params?.per_page || DEFAULT_PAGE_SIZE;
  const page = params?.page || 1;
  const start = (page - 1) * perPage;
  const pageRows = rows.slice(start, start + perPage);

  const data: GalleryImageType[] = pageRows.map(mapGalleryRow);

  return {
    message: "Gallery loaded from local database",
    data,
    pagination: {
      current_page: page,
      per_page: perPage,
      total: rows.length,
      total_pages: Math.max(1, Math.ceil(rows.length / perPage)),
    },
  };
}

export async function readGalleryImageFromLocal(id: string): Promise<GetGalleryImageResponse> {
  await initRxDb();
  const db = getRxDb();
  if (!db) {
    throw new Error("Local database not ready");
  }

  const doc = await db.galleries.findOne(id).exec();
  if (!doc) {
    throw new Error("Gallery image not found in local database");
  }

  const row = doc.toJSON();
  return {
    message: "Gallery image loaded from local database",
    data: mapGalleryRow(row),
  };
}

export async function readFoldersFromLocal(params?: FolderPaginationParams): Promise<GetFoldersResponse> {
  await initRxDb();
  const db = getRxDb();
  if (!db) {
    return {
      message: "Folders loaded from local database",
      data: [],
      pagination: { current_page: 1, per_page: DEFAULT_PAGE_SIZE, total: 0, total_pages: 1 },
    };
  }

  const docs = await db.folders.find().exec();
  const rows = docs.map((d) => d.toJSON()).sort(sortByUpdatedDesc);

  const perPage = params?.per_page || DEFAULT_PAGE_SIZE;
  const page = params?.page || 1;
  const start = (page - 1) * perPage;
  const pageRows = rows.slice(start, start + perPage);

  return {
    message: "Folders loaded from local database",
    data: pageRows.map(mapFolderRow),
    pagination: {
      current_page: page,
      per_page: perPage,
      total: rows.length,
      total_pages: Math.max(1, Math.ceil(rows.length / perPage)),
    },
  };
}

export async function readFolderFromLocal(id: string, params?: FolderPaginationParams): Promise<GetFolderResponse> {
  await initRxDb();
  const db = getRxDb();
  if (!db) {
    throw new Error("Local database not ready");
  }

  const folderDoc = await db.folders.findOne(id).exec();
  if (!folderDoc) {
    throw new Error("Folder not found in local database");
  }

  const folder = mapFolderRow(folderDoc.toJSON());
  const galleryDocs = await db.galleries.find().exec();
  const folderImages = galleryDocs
    .map((d) => d.toJSON())
    .filter((g) => g.folder_ids.includes(id))
    .sort(sortByUpdatedDesc);

  const perPage = params?.per_page || DEFAULT_PAGE_SIZE;
  const page = params?.page || 1;
  const start = (page - 1) * perPage;
  const pageRows = folderImages.slice(start, start + perPage);

  return {
    message: "Folder loaded from local database",
    data: {
      folder,
      images: pageRows.map(mapGalleryRow),
    },
    pagination: {
      current_page: page,
      per_page: perPage,
      total: folderImages.length,
      total_pages: Math.max(1, Math.ceil(folderImages.length / perPage)),
    },
  };
}
