import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useEffect } from "preact/hooks";
import { getRxDb, initRxDb, type HemlineDatabase } from "./database";

type CollectionName = keyof HemlineDatabase;

type SubscriptionLike = {
  unsubscribe: () => void;
};

type SubscribableLike = {
  subscribe: (callback: () => void) => SubscriptionLike;
};

type UseRxReactiveQueryOptions<T> = {
  enabled?: boolean;
  queryKey: QueryKey;
  collectionName: CollectionName;
  loadLocalData: () => Promise<T>;
  buildObservable?: (db: import("rxdb").RxDatabase<HemlineDatabase>) => SubscribableLike;
};

/**
 * Keeps a TanStack query in sync with RxDB writes.
 * The local query still owns initial fetch; this hook only updates cache reactively.
 */
export function useRxReactiveQuery<T>({
  enabled = true,
  queryKey,
  collectionName,
  loadLocalData,
  buildObservable,
}: UseRxReactiveQueryOptions<T>) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let unsubscribe: (() => void) | null = null;

    const syncLocalToCache = async () => {
      const local = await loadLocalData();
      if (!disposed) {
        queryClient.setQueryData(queryKey, local);
      }
    };

    void (async () => {
      await initRxDb();
      const db = getRxDb();
      if (!db || disposed) return;

      const observable = buildObservable ? buildObservable(db) : db[collectionName].find().$;
      const subscription = observable.subscribe(() => {
        void syncLocalToCache();
      });
      unsubscribe = () => subscription.unsubscribe();
    })();

    return () => {
      disposed = true;
      if (unsubscribe) unsubscribe();
    };
  }, [buildObservable, collectionName, enabled, loadLocalData, queryClient, queryKey]);
}

