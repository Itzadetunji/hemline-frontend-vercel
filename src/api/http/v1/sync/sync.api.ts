import $http from "../../xhr";

export interface SyncFullResponse {
  success: boolean;
  message: string;
  data: {
    clients: unknown[];
    orders: unknown[];
    custom_fields: unknown[];
    user_profile: unknown;
  };
}

export interface SyncPushPayload {
  sync: {
    clients?: { created?: unknown[]; updated?: unknown[]; deleted?: unknown[] };
    orders?: { created?: unknown[]; updated?: unknown[]; deleted?: unknown[] };
    custom_fields?: { created?: unknown[]; updated?: unknown[]; deleted?: unknown[] };
    user_profile?: { updated?: unknown[] };
  };
}

export const SYNC_API = {
  getFull: async (): Promise<SyncFullResponse> => $http.get("/sync/full").then((res) => res.data),

  push: async (payload: SyncPushPayload): Promise<{ success: boolean; message: string }> => $http.post("/sync", payload).then((res) => res.data),
};
