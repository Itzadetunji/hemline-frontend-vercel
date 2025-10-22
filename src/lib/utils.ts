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
  const nameParts = name.trim().split(" ");

  // Extract the first letter of the first name
  let initials = nameParts[0]?.charAt(0).toUpperCase() || "";

  // If includeSecondNameInitial is true and there's a second name, add its initial
  if (includeSecondNameInitial && nameParts.length > 1) {
    initials += nameParts[1]?.charAt(0).toUpperCase() || "";
  }

  return initials;
};
