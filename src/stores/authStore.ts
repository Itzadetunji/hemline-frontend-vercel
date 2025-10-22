import { computed, signal } from "@preact/signals";
import { type UserSignal, userSignal } from "./userStore";

// Initialize email signal with value from localStorage
const getStoredEmail = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("email") || "";
  }
  return "";
};

export const emailSignal = signal<string>(getStoredEmail());

// Computed signal to check if user is authenticated
export const isAuthenticated = computed(() => {
  // Check if we have a valid user object with required properties
  const userStore = userSignal.value;
  console.log(userStore);
  if (!userStore?.user || !userStore?.token) {
    console.log(userStore);
    return false;
  }

  // Additional check with localStorage for persistence
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("user-storage");
      if (stored) {
        const { user: storedUser } = JSON.parse(stored) as UserSignal;
        return !!storedUser?.id;
      }
    } catch (error) {
      console.warn("Failed to parse stored auth data:", error);
    }
  }

  return false;
});

// Helper functions to manage email state and localStorage sync
export const setEmail = (email: string) => {
  emailSignal.value = email;
  if (typeof window !== "undefined") {
    if (email) {
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("email");
    }
  }
};

export const clearEmail = () => {
  setEmail("");
};

export const getEmail = () => emailSignal.value;
