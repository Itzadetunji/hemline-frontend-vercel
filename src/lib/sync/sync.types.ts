/**
 * Sync payload types - industry-standard delta format.
 * Each feature has its own block for readability.
 * Last-write-wins via updated_at (ISO8601).
 */
export interface SyncPayload {
  clients?: SyncBlock<ClientSyncItem>;
  orders?: SyncBlock<OrderSyncItem>;
  custom_fields?: SyncBlock<CustomFieldSyncItem>;
  user_profile?: SyncBlock<UserProfileSyncItem>;
}

export interface SyncBlock<T> {
  created: T[];
  updated: T[];
  deleted: DeletedItem[];
}

export interface DeletedItem {
  id: string;
  updated_at: string;
}

export interface ClientSyncItem {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  measurement_unit: string;
  phone_number?: string;
  email?: string;
  in_trash: boolean;
  measurements?: Record<string, number>;
  custom_fields?: Record<string, string>;
  orders?: OrderSyncItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderSyncItem {
  id: string;
  client_id: string;
  item: string;
  quantity: number;
  notes?: string;
  is_done: boolean;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldSyncItem {
  id: string;
  field_name: string;
  field_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileSyncItem {
  id: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  business_address?: string;
  updated_at: string;
}
