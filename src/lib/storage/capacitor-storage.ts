/**
 * Capacitor Preferences storage - mobile-only.
 * All auth, email, and app state stored in native preferences.
 */
import { Preferences } from "@capacitor/preferences";

const AUTH_KEY = "hemline_user_storage";
const EMAIL_KEY = "hemline_email";

export async function getItem(key: string): Promise<string | null> {
  const { value } = await Preferences.get({ key });
  return value;
}

export async function setItem(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

export async function removeItem(key: string): Promise<void> {
  await Preferences.remove({ key });
}

export const capacitorStorage = {
  getUser: async () => {
    const value = await getItem(AUTH_KEY);
    return value ? JSON.parse(value) : null;
  },
  setUser: async (data: object) => {
    await setItem(AUTH_KEY, JSON.stringify(data));
  },
  removeUser: async () => {
    await removeItem(AUTH_KEY);
  },
  getEmail: async () => {
    return getItem(EMAIL_KEY);
  },
  setEmail: async (email: string) => {
    await setItem(EMAIL_KEY, email);
  },
  removeEmail: async () => {
    await removeItem(EMAIL_KEY);
  },
  /** Clear all app data (logout) */
  clearAll: async () => {
    await removeItem(AUTH_KEY);
    await removeItem(EMAIL_KEY);
  },
};
