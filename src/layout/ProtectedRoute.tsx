import type { ComponentChildren } from "preact";
import { AuthLayout } from "./AuthLayout";
import { Route, useLocation } from "preact-iso";
import { isAuthenticated } from "@/stores/authStore";
import { useEffect } from "preact/hooks";
import { Home } from "@/pages/Home/Home";
import { SignIn } from "@/pages/Auth/SignIn/page";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { get } from "http";

/**
 * ProtectedRoute component that wraps routes requiring authentication
 *
 * @param children - The components to render if authentication check passes
 * @param requireAuth - Whether authentication is required (default: true)
 * @param redirectTo - Where to redirect if authentication fails (default: "/sign-in")
 */
export const ProtectedRoute = (props: any) => {
	const location = useLocation();
	const isUserAuthenticated = isAuthenticated.value;
	const getUserProfile = useGetUserProfile();

	if (getUserProfile.isPending)
		return (
			<div class="flex items-center justify-center min-h-screen">
				<img
					src="/assets/brand/logo.svg"
					alt="Brand Logo"
				/>
			</div>
		);

	if (!isUserAuthenticated) return <SignIn />;

	if (!getUserProfile.data?.data.user?.has_onboarded) {
		location.route("/onboarding", true);
	}

	if (
		getUserProfile.data?.data.user?.has_onboarded &&
		location.path === "/onboarding"
	) {
		location.route("/", true);
	}

	return <Route {...props} />;
	// return <AuthLayout redirectTo={redirectTo}>{children}</AuthLayout>;
};
