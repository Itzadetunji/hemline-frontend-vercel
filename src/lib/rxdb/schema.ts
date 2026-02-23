import type { RxJsonSchema } from "rxdb";

export interface ClientDoc {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  measurement_unit: string;
  phone_number?: string;
  email?: string;
  in_trash: boolean;
  measurements: Record<string, string | number | null>;
  custom_fields: Record<string, string | number>;
  created_at: string;
  updated_at: string;
}

export interface OrderDoc {
  id: string;
  client_id: string;
  client_name?: string;
  item: string;
  quantity: number;
  notes?: string;
  is_done: boolean;
  overdue?: boolean;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryDoc {
  id: string;
  file_name: string;
  description?: string;
  url: string;
  public_id: string;
  folder_ids: string[];
  created_at: string;
  updated_at: string;
  meta?: Record<string, unknown>;
}

export interface FolderDoc {
  id: string;
  name: string;
  description: string;
  image_ids: string[];
  cover_image: string | null;
  created_at: string;
  folder_color: number;
  is_public?: boolean;
  public_id?: string;
  public_url?: string;
  updated_at: string;
}

export interface CustomFieldDoc {
  id: string;
  field_name: string;
  field_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PendingSyncDoc {
  id: string;
  clients: { created: unknown[]; updated: unknown[]; deleted: { id: string; updated_at: string }[] };
  orders: { created: unknown[]; updated: unknown[]; deleted: { id: string; updated_at: string }[] };
  custom_fields: { created: unknown[]; updated: unknown[]; deleted: { id: string; updated_at: string }[] };
  user_profile: { updated: unknown[] };
  updated_at: string;
}

const clientSchema: RxJsonSchema<ClientDoc> = {
  title: "client",
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
    custom_fields: { type: "object" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
  },
  required: ["id", "first_name", "last_name", "gender", "measurement_unit", "in_trash", "measurements", "custom_fields", "created_at", "updated_at"],
  indexes: ["updated_at"],
};

const orderSchema: RxJsonSchema<OrderDoc> = {
  title: "order",
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    client_id: { type: "string", maxLength: 36 },
    client_name: { type: "string" },
    item: { type: "string" },
    quantity: { type: "number" },
    notes: { type: "string" },
    is_done: { type: "boolean" },
    overdue: { type: "boolean" },
    due_date: { type: "string" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
  },
  required: ["id", "client_id", "item", "quantity", "is_done", "created_at", "updated_at"],
  indexes: ["client_id", "updated_at"],
};

const gallerySchema: RxJsonSchema<GalleryDoc> = {
  title: "gallery",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    file_name: { type: "string" },
    description: { type: "string" },
    url: { type: "string" },
    public_id: { type: "string" },
    folder_ids: { type: "array", items: { type: "string" } },
    created_at: { type: "string" },
    updated_at: { type: "string" },
    meta: { type: "object" },
  },
  required: ["id", "file_name", "url", "public_id", "folder_ids", "created_at", "updated_at"],
  indexes: ["updated_at"],
};

const folderSchema: RxJsonSchema<FolderDoc> = {
  title: "folder",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    name: { type: "string" },
    description: { type: "string" },
    image_ids: { type: "array", items: { type: "string" } },
    cover_image: { type: ["string", "null"] },
    created_at: { type: "string" },
    folder_color: { type: "number" },
    is_public: { type: "boolean" },
    public_id: { type: "string" },
    public_url: { type: "string" },
    updated_at: { type: "string" },
  },
  required: ["id", "name", "description", "image_ids", "cover_image", "created_at", "folder_color", "updated_at"],
  indexes: ["updated_at"],
};

const customFieldSchema: RxJsonSchema<CustomFieldDoc> = {
  title: "custom_field",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    field_name: { type: "string" },
    field_type: { type: "string" },
    is_active: { type: "boolean" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
  },
  required: ["id", "field_name", "field_type", "is_active", "created_at", "updated_at"],
  indexes: ["updated_at"],
};

const pendingSyncSchema: RxJsonSchema<PendingSyncDoc> = {
  title: "pending_sync",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string" },
    clients: { type: "object" },
    orders: { type: "object" },
    custom_fields: { type: "object" },
    user_profile: { type: "object" },
    updated_at: { type: "string" },
  },
  required: ["id", "clients", "orders", "custom_fields", "user_profile", "updated_at"],
};

export const schemas = {
  clients: clientSchema,
  orders: orderSchema,
  galleries: gallerySchema,
  folders: folderSchema,
  custom_fields: customFieldSchema,
  pending_sync: pendingSyncSchema,
};
