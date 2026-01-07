import { Browser } from "@capacitor/browser";
import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const KB = 1024;
export const MB = 1024 * KB;
export const GB = 1024 * MB;

/**
 * Extracts the initials from a given name.
 *
 * @param {string} name - The full name from which to extract initials.
 * @param {boolean} [includeSecondNameInitial=false] - Whether to include the first letter of the second name.
 * @returns {string} The initials extracted from the name.
 *
 * @example
 * // returns 'J'
 * getInitials('John Doe');
 *
 * @example
 * // returns 'JD'
 * getInitials('John Doe', true);
 *
 * @example
 * // returns 'A'
 * getInitials('Alice');
 */
export const getInitials = (name: string, includeSecondNameInitial: boolean = false): string => {
  if (!name) return "";
  const nameParts = name?.trim().split(" ");

  // Extract the first letter of the first name
  let initials = nameParts[0]?.charAt(0).toUpperCase() || "";

  // If includeSecondNameInitial is true and there's a second name, add its initial
  if (includeSecondNameInitial && nameParts.length > 1) {
    initials += nameParts[1]?.charAt(0).toUpperCase() || "";
  }

  return initials;
};

/**
 * Opens a link either in the in-app browser (native) or a new tab (web).
 *
 * @param {string} path - The relative path to open (e.g., "terms-and-conditions").
 */
export const openLink = async (path: string) => {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    await Browser.open({ url: `https://hemline.studio/${path}` });
  } else {
    window.open(path, "_blank", "noopener,noreferrer");
  }
};

/**
 * Copies the given text to the clipboard.
 * Handles both native (Capacitor) and web environments.
 *
 * @param {string} text - The text to copy.
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    await Clipboard.write({ string: text });
  } else {
    await navigator.clipboard.writeText(text);
  }
};
