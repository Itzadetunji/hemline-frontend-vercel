/**
 * RxDB database for offline-first mobile storage.
 * Uses Dexie.js (IndexedDB) - compatible with Capacitor WebView.
 */
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { addRxPlugin } from "rxdb/plugins/core";
import {
  clientSchema,
  orderSchema,
  customFieldSchema,
  syncQueueSchema,
} from "./schemas";

addRxPlugin(RxDBDevModePlugin);

import type { OfflineDb } from "./types";

let dbInstance: OfflineDb | null = null;

async function createDb() {
  const storage = getRxStorageDexie();

  const db = await createRxDatabase({
    name: "hemline_offline_db",
    storage,
    multiInstance: false,
  });

  await db.addCollections({
    clients: {
      schema: clientSchema,
    },
    orders: {
      schema: orderSchema,
    },
    custom_fields: {
      schema: customFieldSchema,
    },
    sync_queue: {
      schema: syncQueueSchema,
    },
  });

  return db as unknown as OfflineDb;
}

export async function initDatabase(): Promise<OfflineDb> {
  if (dbInstance) return dbInstance;
  dbInstance = await createDb();
  return dbInstance;
}

export async function getDb(): Promise<OfflineDb> {
  return dbInstance ?? (await initDatabase());
}

export async function closeDatabase() {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
}
