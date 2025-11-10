import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { SignIn } from "@/pages/Auth/SignIn/page";
import { isAuthenticated } from "@/stores/authStore";
import { userSignal } from "@/stores/userStore";
import { Route, useLocation } from "preact-iso";
import { Header, NavBar } from "./Header";

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
      <div class="flex min-h-[100dvh] items-center justify-center">
        <img src="/assets/brand/logo.svg" class="animate-pulse" alt="Brand Logo" />
      </div>
    );

  if (!isUserAuthenticated) return <SignIn />;

  if (!userSignal.value?.user?.has_onboarded) {
    location.route("/onboarding", true);
  }

  if (userSignal.value?.user?.has_onboarded && location.path === "/onboarding") {
    location.route("/gallery", true);
  }

  return (
    <main class="flex min-h-[100dvh] flex-col items-stretch">
      <Header />
      <div class="flex flex-1 flex-col">
        <Route {...props} />
      </div>
      <NavBar />
    </main>
  );
  // return <AuthLayout redirectTo={redirectTo}>{children}</AuthLayout>;
};
