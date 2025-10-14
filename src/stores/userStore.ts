import { User } from "@/api/http/v1/users/users.types";
import { ColorType } from "@/pages/Auth/Onboarding/page";
import { computed, effect, signal } from "@preact/signals";

// User type (same as before)
export interface UserSignal {
	user: User | null;
	theme: ColorType;
	token?: string;
}

const getInitialState = (): UserSignal => {
	try {
		const stored = localStorage.getItem("user-storage");
		if (stored) {
			console.log(JSON.parse(stored));
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error("Failed to parse user-storage:", error);
	}

	// Fallback to initial state
	return {
		user: null,
		theme: window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light",
		token: undefined,
	};
};

const initialState = getInitialState();

// Create signals for user state
export const userSignal = signal<UserSignal | null>(initialState);

export const userThemeSignal = computed(
	() => userSignal.value?.theme || "light"
);

// Actions
export const userStore = {
	updateUser: (updates: Partial<UserSignal>) => {
		const currentUser = userSignal.value;
		if (currentUser) {
			const updatedUser = { ...currentUser, ...updates };
			userSignal.value = updatedUser;

			// Persist changes
			localStorage.setItem("user-storage", JSON.stringify(updatedUser));
		}
	},

	logout: () => {
		userSignal.value = null;
		localStorage.removeItem("user-storage");
	},
};

// Auto-persist effect (optional)
effect(() => {
	try {
		if (userSignal.value) {
			localStorage.setItem("user-storage", JSON.stringify(userSignal.value));
		}
	} catch (error) {
		console.warn("Failed to persist user data to localStorage:", error);
	}
});
