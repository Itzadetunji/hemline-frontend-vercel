import { useEffect } from "preact/hooks";

import { authReadySignal } from "./auth-signals";
import { getAuthFromStorage, getEmailFromStorage } from "./capacitor-auth-storage";
import { emailSignal } from "@/stores/authStore";
import { userSignal } from "@/stores/userStore";

/**
 * Loads auth from Capacitor Preferences on app init.
 * Must be called once at app root.
 */
/** Loads auth from Capacitor on mount. Call once at app root. */
export function useAuthInit(): void {
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [auth, email] = await Promise.all([getAuthFromStorage(), getEmailFromStorage()]);
      if (cancelled) return;

      if (auth) {
        const fallbackTheme = window?.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        userSignal.value = {
          user: auth.user,
          theme: auth.theme ?? fallbackTheme,
          access_token: auth.access_token,
          to_be_deleted: auth.to_be_deleted,
        };
      } else {
        const fallbackTheme = window?.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        userSignal.value = {
          user: null,
          theme: fallbackTheme,
          access_token: undefined,
        };
      }

      emailSignal.value = email ?? "";
      authReadySignal.value = true;
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);
}
