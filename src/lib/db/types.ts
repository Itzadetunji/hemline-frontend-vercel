/**
 * Minimal RxDB database interface for offline storage.
 * Avoids pulling in full RxDB types that may cause compatibility issues.
 */
export interface OfflineDb {
  clients: {
    find: (args: { selector: Record<string, unknown> }) => { exec: () => Promise<Array<{ toJSON: () => Record<string, unknown>; patch: (u: Record<string, unknown>) => Promise<void>; remove: () => Promise<void>; get: (k: string) => unknown }>> };
    findOne: (id: string) => { exec: () => Promise<{ toJSON: () => Record<string, unknown>; patch: (u: Record<string, unknown>) => Promise<void>; remove: () => Promise<void>; get: (k: string) => unknown } | null> };
    insert: (doc: Record<string, unknown>) => Promise<unknown>;
  };
  orders: {
    find: (args: { selector: Record<string, unknown> }) => { exec: () => Promise<Array<{ toJSON: () => Record<string, unknown>; patch: (u: Record<string, unknown>) => Promise<void>; remove: () => Promise<void>; get: (k: string) => unknown }>> };
    findOne: (id: string) => { exec: () => Promise<{ toJSON: () => Record<string, unknown>; patch: (u: Record<string, unknown>) => Promise<void>; remove: () => Promise<void>; get: (k: string) => unknown } | null> };
    insert: (doc: Record<string, unknown>) => Promise<unknown>;
  };
  custom_fields: {
    find: (args: { selector: Record<string, unknown> }) => { exec: () => Promise<Array<{ toJSON: () => unknown }>> };
    findOne: (id: string) => { exec: () => Promise<{ toJSON: () => Record<string, unknown>; patch: (u: Record<string, unknown>) => Promise<void>; get: (k: string) => unknown } | null> };
    insert: (doc: Record<string, unknown>) => Promise<unknown>;
  };
  sync_queue: {
    find: () => { exec: () => Promise<Array<{ toJSON: () => Record<string, unknown> }>>; remove: () => Promise<unknown> };
    insert: (doc: Record<string, unknown>) => Promise<unknown>;
  };
  destroy: () => Promise<void>;
}
