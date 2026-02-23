/**
 * Initializes app state on mount: auth from storage, network listener, RxDB.
 * Mobile-only: always uses Capacitor storage and offline layer.
 */
import { useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { loadUserFromStorage } from "@/stores/userStore";
import { loadEmailFromStorage } from "@/stores/authStore";
import { initNetworkListener } from "@/stores/networkStore";
import { initDatabase } from "@/lib/db/rxdb";

export function AppInit({ children }: { children: ComponentChildren }) {
  useEffect(() => {
    const init = async () => {
      await loadUserFromStorage();
      await loadEmailFromStorage();
      await initNetworkListener();
      await initDatabase();
    };
    init();
  }, []);

  return <>{children}</>;
}
