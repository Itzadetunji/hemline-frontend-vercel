import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { schemas, type ClientDoc, type CustomFieldDoc, type FolderDoc, type GalleryDoc, type OrderDoc, type PendingSyncDoc } from "./schema";

export type HemlineDatabase = {
  clients: import("rxdb").RxCollection<ClientDoc>;
  orders: import("rxdb").RxCollection<OrderDoc>;
  galleries: import("rxdb").RxCollection<GalleryDoc>;
  folders: import("rxdb").RxCollection<FolderDoc>;
  custom_fields: import("rxdb").RxCollection<CustomFieldDoc>;
  pending_sync: import("rxdb").RxCollection<PendingSyncDoc>;
};

let dbInstance: import("rxdb").RxDatabase<HemlineDatabase> | null = null;

export async function initRxDb(): Promise<import("rxdb").RxDatabase<HemlineDatabase>> {
  if (dbInstance) return dbInstance;

  const db = await createRxDatabase<HemlineDatabase>({
    name: "hemline-offline",
    storage: getRxStorageDexie(),
    multiInstance: false,
    ignoreDuplicate: true,
  });

  await db.addCollections({
    clients: {
      schema: schemas.clients,
    },
    orders: {
      schema: schemas.orders,
    },
    galleries: {
      schema: schemas.galleries,
    },
    folders: {
      schema: schemas.folders,
    },
    custom_fields: {
      schema: schemas.custom_fields,
    },
    pending_sync: {
      schema: schemas.pending_sync,
    },
  });

  dbInstance = db;
  return db;
}

export function getRxDb(): import("rxdb").RxDatabase<HemlineDatabase> | null {
  return dbInstance;
}
