import { Preferences } from "@capacitor/preferences";
import type { ThemeType, User } from "@/api/http/v1/users/users.types";

export interface StoredAuth {
  user: User | null;
  theme: ThemeType;
  access_token?: string;
  to_be_deleted?: boolean;
}

const KEYS = {
  AUTH: "auth:user_storage",
  EMAIL: "auth:email",
} as const;

const LEGACY_KEY = "user-storage";

/**
 * Load auth data from Capacitor Preferences (or localStorage fallback).
 */
export async function getAuthFromStorage(): Promise<StoredAuth | null> {
  try {
    const { value } = await Preferences.get({ key: KEYS.AUTH });
    if (value) {
      return JSON.parse(value) as StoredAuth;
    }

    // Fallback: localStorage (legacy or when Preferences fails/not available)
    if (typeof window !== "undefined") {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const data = JSON.parse(legacy) as StoredAuth;
        await setAuthToStorage(data);
        localStorage.removeItem(LEGACY_KEY);
        return data;
      }
    }

    return null;
  } catch (e) {
    console.warn("Failed to load auth from storage:", e);
    if (typeof window !== "undefined") {
      try {
        const fallback = localStorage.getItem(LEGACY_KEY);
        if (fallback) return JSON.parse(fallback) as StoredAuth;
      } catch {
        // ignore
      }
    }
    return null;
  }
}

export async function setAuthToStorage(data: StoredAuth): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    await Preferences.set({ key: KEYS.AUTH, value: serialized });
    if (typeof window !== "undefined") {
      localStorage.setItem(LEGACY_KEY, serialized);
    }
  } catch (e) {
    console.warn("Failed to persist auth:", e);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LEGACY_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  }
}

export async function clearAuthFromStorage(): Promise<void> {
  try {
    await Preferences.remove({ key: KEYS.AUTH });
    await Preferences.remove({ key: KEYS.EMAIL });
    if (typeof window !== "undefined") {
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch (e) {
    console.warn("Failed to clear auth:", e);
  }
}

export async function getEmailFromStorage(): Promise<string> {
  try {
    const legacy = typeof window !== "undefined" ? localStorage.getItem("email") : null;
    if (legacy) {
      await setEmailToStorage(legacy);
      localStorage.removeItem("email");
      return legacy;
    }
    const { value } = await Preferences.get({ key: KEYS.EMAIL });
    return value ?? "";
  } catch {
    return "";
  }
}

export async function setEmailToStorage(email: string): Promise<void> {
  try {
    if (email) {
      await Preferences.set({ key: KEYS.EMAIL, value: email });
    } else {
      await Preferences.remove({ key: KEYS.EMAIL });
    }
  } catch (e) {
    console.warn("Failed to persist email:", e);
  }
}
