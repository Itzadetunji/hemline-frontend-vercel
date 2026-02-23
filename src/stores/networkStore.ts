/**
 * Network status - always uses @capacitor/network for mobile.
 */
import { signal } from "@preact/signals";

export const isOnlineSignal = signal<boolean>(true);

export async function initNetworkListener() {
  try {
    const { Network } = await import("@capacitor/network");
    const status = await Network.getStatus();
    isOnlineSignal.value = status.connected;

    Network.addListener("networkStatusChange", (s) => {
      isOnlineSignal.value = s.connected;
    });
  } catch {
    isOnlineSignal.value = true;
  }
}
