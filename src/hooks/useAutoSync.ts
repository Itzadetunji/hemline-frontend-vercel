/**
 * Auto-sync when online and app is open. Runs pushSync to backend.
 */
import { useEffect, useRef } from "preact/hooks";
import { effect } from "@preact/signals";
import { isOnlineSignal } from "@/stores/networkStore";
import { userSignal } from "@/stores/userStore";
import { pushSync } from "@/lib/sync/sync-service";

const SYNC_INTERVAL_MS = 60_000;

export function useAutoSync() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const runSync = async () => {
      if (!isOnlineSignal.value) return;
      const token = userSignal.value?.access_token;
      if (!token) return;

      const result = await pushSync(token);
      if (!result.success) {
        console.warn("Auto-sync failed:", result.error);
      }
    };

    const startInterval = () => {
      if (intervalRef.current) return;
      runSync();
      intervalRef.current = setInterval(runSync, SYNC_INTERVAL_MS);
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const dispose = effect(() => {
      if (isOnlineSignal.value) startInterval();
      else stopInterval();
    });

    return () => {
      dispose();
      stopInterval();
    };
  }, []);
}
