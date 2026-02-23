import type { ThemeType, User } from "@/api/http/v1/users/users.types";
import { computed, signal } from "@preact/signals";
import { capacitorStorage } from "@/lib/storage/capacitor-storage";

export interface UserSignal {
  user: User | null;
  theme: ThemeType;
  access_token?: string;
  to_be_deleted?: boolean;
}

const defaultTheme: ThemeType =
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const userSignal = signal<UserSignal | null>(null);
export const authLoadedSignal = signal(false);

export const userThemeSignal = computed(() => userSignal.value?.theme || defaultTheme);

async function persistUser(data: UserSignal | null) {
  try {
    if (data) {
      await capacitorStorage.setUser(data);
    } else {
      await capacitorStorage.removeUser();
    }
  } catch (err) {
    console.warn("Failed to persist user:", err);
  }
}

export async function loadUserFromStorage(): Promise<void> {
  try {
    const data = await capacitorStorage.getUser();
    if (data) {
      userSignal.value = {
        ...data,
        theme: data.theme || defaultTheme,
      };
    } else {
      userSignal.value = {
        user: null,
        theme: defaultTheme,
        access_token: undefined,
      };
    }
  } catch (err) {
    console.warn("Failed to load user from storage:", err);
    userSignal.value = { user: null, theme: defaultTheme, access_token: undefined };
  } finally {
    authLoadedSignal.value = true;
  }
}

export const userStore = {
  /** Updates user state and persists to storage. Returns a Promise so callers can await persistence. */
  updateUser: (updates: Partial<UserSignal>): Promise<void> => {
    const current = userSignal.value;
    if (current) {
      const updated = { ...current, ...updates };
      userSignal.value = updated;
      return persistUser(updated);
    } else {
      const newData = { ...updates } as UserSignal;
      userSignal.value = newData;
      return persistUser(newData);
    }
  },

  logout: (): Promise<void> => {
    userSignal.value = null;
    return persistUser(null);
  },
};
