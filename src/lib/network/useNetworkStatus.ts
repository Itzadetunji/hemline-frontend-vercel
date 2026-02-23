import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Network } from "@capacitor/network";

export const isOnlineSignal = signal(true);

export function useNetworkStatus(): boolean {
  useEffect(() => {
    let cancelled = false;

    async function updateStatus() {
      try {
        const status = await Network.getStatus();
        if (!cancelled) {
          isOnlineSignal.value = status.connected;
        }
      } catch {
        if (!cancelled) {
          isOnlineSignal.value = true;
        }
      }
    }

    updateStatus();

    const listener = Network.addListener("networkStatusChange", (status) => {
      if (!cancelled) {
        isOnlineSignal.value = status.connected;
      }
    });

    return () => {
      cancelled = true;
      listener.then((l) => l.remove());
    };
  }, []);

  return isOnlineSignal.value;
}
