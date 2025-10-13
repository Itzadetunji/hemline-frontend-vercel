import { signal } from "@preact/signals";

// Initialize email signal with value from localStorage
const getStoredEmail = () => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("email") || "";
	}
	return "";
};

export const emailSignal = signal<string>(getStoredEmail());

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
