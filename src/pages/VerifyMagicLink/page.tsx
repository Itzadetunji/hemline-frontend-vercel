import { useVerifyMagicLink } from "@/api/http/v1/users/users.hooks";
import { clearEmail } from "@/stores/authStore";
import { userStore } from "@/stores/userStore";
import { useLocation, useRoute } from "preact-iso";
import { useEffect } from "preact/hooks";

export const VerifyMagicLink = () => {
  const { query } = useRoute();
  const location = useLocation();

  const verifyMagicLinkMutation = useVerifyMagicLink();

  useEffect(() => {
    if (verifyMagicLinkMutation.data && verifyMagicLinkMutation.isSuccess) {
      clearEmail();
      if (verifyMagicLinkMutation.data.data.user.has_onboarded) location.route("/gallery", true);
      else location.route("/onboarding", true);

      clearEmail();
    }
  }, [verifyMagicLinkMutation.isSuccess]);

  useEffect(() => {
    const token = query.token;
    if (token) {
      verifyMagicLinkMutation.mutate(token);
    } else {
      clearEmail();
      userStore.logout();
      localStorage.clear();

      location.route("/sign-in", true);
    }
  }, [query.token]);

  return (
    <div class="flex min-h-[100dvh] items-center justify-center">
      <img src="/assets/brand/logo.svg" class="animate-pulse" alt="Brand Logo" />
    </div>
  );
};
