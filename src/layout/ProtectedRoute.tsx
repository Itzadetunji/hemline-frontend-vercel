import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { useAutoSync } from "@/hooks/useAutoSync";
import { SignIn } from "@/pages/Auth/SignIn/page";
import { isAuthenticated } from "@/stores/authStore";
import { authLoadedSignal, userSignal } from "@/stores/userStore";
import { isOnlineSignal } from "@/stores/networkStore";
import { Route, useLocation } from "preact-iso";
import { Header, NavBar } from "./Header";

/** ProtectedRoute - offline-aware auth. Uses cached user when offline. Skips profile fetch when offline. */
export const ProtectedRoute = (props: any) => {
  const location = useLocation();
  const authLoaded = authLoadedSignal.value;
  useAutoSync();
  const isOnline = isOnlineSignal.value;
  const isUserAuthenticated = isAuthenticated.value;
  const getUserProfile = useGetUserProfile({ enabled: isOnline });

  if (!authLoaded) {
    return (
      <div class="flex min-h-[100dvh] items-center justify-center">
        <img src="/assets/brand/logo.svg" class="animate-pulse" alt="Brand Logo" />
      </div>
    );
  }

  if (!isUserAuthenticated) return <SignIn />;

  if (getUserProfile.isPending && isOnline) {
    return (
      <div class="flex min-h-[100dvh] items-center justify-center">
        <img src="/assets/brand/logo.svg" class="animate-pulse" alt="Brand Logo" />
      </div>
    );
  }

  if (!userSignal.value?.user?.has_onboarded) {
    location.route("/onboarding", true);
  }

  if (userSignal.value?.user?.has_onboarded && location.path === "/onboarding") {
    location.route("/gallery", true);
  }

  return (
    <main class="flex flex-1 flex-col items-stretch">
      <div class="mx-auto flex w-full max-w-md flex-1 flex-col">
        <Header />
        <div class="flex flex-1 flex-col">
          <Route {...props} />
        </div>
      </div>
      <NavBar />
    </main>
  );
};
