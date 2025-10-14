import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const KB = 1024;
export const MB = 1024 * KB;
export const GB = 1024 * MB;
