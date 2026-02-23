import { Browser } from "@capacitor/browser";
import { Clipboard } from "@capacitor/clipboard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const KB = 1024;
export const MB = 1024 * KB;
export const GB = 1024 * MB;

export const getInitials = (name: string, includeSecondNameInitial: boolean = false): string => {
  if (!name) return "";
  const nameParts = name?.trim().split(" ");
  let initials = nameParts[0]?.charAt(0).toUpperCase() || "";
  if (includeSecondNameInitial && nameParts.length > 1) {
    initials += nameParts[1]?.charAt(0).toUpperCase() || "";
  }
  return initials;
};

/** Opens link in in-app browser */
export const openLink = async (path: string) => {
  await Browser.open({ url: `https://hemline.studio/${path}` });
};

/** Copies text to clipboard */
export const copyToClipboard = async (text: string): Promise<void> => {
  await Clipboard.write({ string: text });
};
