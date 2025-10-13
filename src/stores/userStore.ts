import { computed, effect, signal } from "@preact/signals";

// User type (same as before)
export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role?: string;
	count: number;
	preferences?: {
		theme?: "light" | "dark";
		language?: string;
	};
}

// Create signals for user state
export const userSignal = signal<User | null>({
	count: 0,
} as User);

export const userThemeSignal = computed(
	() => userSignal.value?.preferences?.theme || "light"
);

// Actions
export const userStore = {
	setUser: (user: User) => {
		userSignal.value = user;

		// Persist to localStorage
		localStorage.setItem(
			"user-storage",
			JSON.stringify({
				user,
				isAuthenticated: true,
			})
		);
	},

	increment: (newValue: number) => {
		console.log(userSignal.value);
		const currentUser = userSignal.value;
		if (!currentUser) return;

		const updatedUser = {
			...userSignal.value,
			count: newValue,
		} as User;
		userSignal.value = updatedUser;

		// Persist to localStorage
		localStorage.setItem(
			"user-storage",
			JSON.stringify({
				user: {
					...userSignal.value,
					count: newValue,
				},
				isAuthenticated: true,
			})
		);
	},

	updateUser: (updates: Partial<User>) => {
		const currentUser = userSignal.value;
		if (currentUser) {
			const updatedUser = { ...currentUser, ...updates };
			userSignal.value = updatedUser;

			// Persist changes
			localStorage.setItem(
				"user-storage",
				JSON.stringify({
					user: updatedUser,
				})
			);
		}
	},

	logout: () => {
		userSignal.value = null;
		localStorage.removeItem("user-storage");
	},
};

// Initialize from localStorage
const initializeStore = () => {
	try {
		const stored = localStorage.getItem("user-storage");
		if (stored) {
			const { user, isAuthenticated } = JSON.parse(stored);
			if (user && isAuthenticated) {
				userSignal.value = user;
			}
		}
	} catch (error) {
		console.warn("Failed to load user data from localStorage:", error);
	}
};

// Initialize on module load
if (typeof window !== "undefined") {
	initializeStore();
}

// Auto-persist effect (optional)
effect(() => {
	if (userSignal.value) {
		localStorage.setItem(
			"user-storage",
			JSON.stringify({
				user: userSignal.value,
			})
		);
	}
});
