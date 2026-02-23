/** biome-ignore-all lint/style/useFilenamingConvention: This is just an authstore */

import { computed, signal } from "@preact/signals";
import { userSignal } from "./userStore";
import { capacitorStorage } from "@/lib/storage/capacitor-storage";

export const emailSignal = signal<string>("");

export async function loadEmailFromStorage() {
  try {
    const email = await capacitorStorage.getEmail();
    emailSignal.value = email || "";
  } catch {
    emailSignal.value = "";
  }
}

export const isAuthenticated = computed(() => {
  const store = userSignal.value;
  return !!(store?.user?.id && store?.access_token);
});

export const setEmail = async (email: string) => {
  emailSignal.value = email;
  try {
    if (email) await capacitorStorage.setEmail(email);
    else await capacitorStorage.removeEmail();
  } catch (err) {
    console.warn("Failed to persist email:", err);
  }
};

export const clearEmail = () => {
  setEmail("");
};

export const getEmail = () => emailSignal.value;
