import { useEffect, useRef } from "preact/hooks";
import { Network } from "@capacitor/network";
import { isOnlineSignal } from "@/lib/network/useNetworkStatus";
import { initRxDb } from "@/lib/rxdb/database";
import { runSync } from "./sync-service";

const SYNC_INTERVAL_MS = 30_000;

/**
 * Initializes RxDB and runs sync when online.
 * Call once at app root (inside authenticated area).
 */
export function useSync(): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function doSync() {
      const { connected } = await Network.getStatus();
      if (!connected || cancelled) return;
      await runSync();
    }

    async function setup() {
      await initRxDb();
      if (cancelled) return;
      await doSync();
      intervalRef.current = setInterval(doSync, SYNC_INTERVAL_MS);
    }

    setup();

    const handleNetworkChange = async () => {
      if (cancelled) return;
      const status = await Network.getStatus();
      isOnlineSignal.value = status.connected;
      if (status.connected) {
        await doSync();
        if (!intervalRef.current) {
          intervalRef.current = setInterval(doSync, SYNC_INTERVAL_MS);
        }
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const listenerPromise = Network.addListener("networkStatusChange", handleNetworkChange);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      listenerPromise.then((l) => l.remove());
    };
  }, []);
}
