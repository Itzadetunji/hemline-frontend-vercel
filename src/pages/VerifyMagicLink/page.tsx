import { useVerifyMagicLink } from "@/api/http/v1/users/users.hooks";
import { capacitorStorage } from "@/lib/storage/capacitor-storage";
import { clearEmail } from "@/stores/authStore";
import { userStore } from "@/stores/userStore";
import { useLocation, useRoute } from "preact-iso";
import { useEffect } from "preact/hooks";
import { AccountDeletionPendingModal } from "../Auth/components/AccountDeletionPendingModal";
import type { MarkedForDeletionProfile, NotMarkedForDeletionProfile } from "@/api/http/v1/users/users.types";

export const VerifyMagicLink = () => {
  const { query } = useRoute();
  const location = useLocation();

  const verifyMagicLinkMutation = useVerifyMagicLink();

  useEffect(() => {
    if (verifyMagicLinkMutation.data && verifyMagicLinkMutation.isSuccess) {
      // If account is pending deletion, do not redirect yet
      if ((verifyMagicLinkMutation.data.data as MarkedForDeletionProfile).to_be_deleted) return;

      clearEmail();
      if ((verifyMagicLinkMutation.data.data as NotMarkedForDeletionProfile).user.has_onboarded) location.route("/gallery", true);
      else location.route("/onboarding", true);

      clearEmail();
    }
  }, [verifyMagicLinkMutation.isSuccess, verifyMagicLinkMutation.data]);

  useEffect(() => {
    const token = query.token;
    if (token) {
      verifyMagicLinkMutation.mutate(token);
    } else {
      clearEmail();
      userStore.logout();
      void capacitorStorage.clearAll();

      location.route("/sign-in", true);
    }
  }, [query.token]);

  return (
    <div class="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div class="flex flex-1 items-center justify-center">
        <img src="/assets/brand/logo.svg" class="animate-pulse" alt="Brand Logo" />
        <AccountDeletionPendingModal />
      </div>
    </div>
  );
};
