import { signal } from "@preact/signals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useLocation, useRoute } from "preact-iso";
import { useEffect } from "preact/hooks";
import toast from "react-hot-toast";

import { createQueryKey } from "@/lib/queryClient";
import { clearEmail, setEmail } from "@/stores/authStore";
import { userSignal, userStore } from "@/stores/userStore";
import { USERS_API } from "./users.api";
import type {
  CancelDeleteAccountResponse,
  GetUserProfileResponse,
  MarkedForDeletionProfile,
  NotMarkedForDeletionProfile,
  OnboardingFormData,
  OnboardingUserResponse,
  RequestMagicLinkPayload,
  VerifyMagicCodePayload,
} from "./users.types";

export const accountDeletionPendingSignal = signal<{
  isOpen: boolean;
  date_requested_for_deletion?: string;
  userData: GetUserProfileResponse | null;
}>({
  isOpen: false,
  userData: null,
});

export const useLogout = () => {
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: USERS_API.LOGOUT,
    onMutate: () =>
      toast.loading("Logging out", {
        id: "log-out",
      }),
  });

  useEffect(() => {
    if (logoutMutation.data || logoutMutation.error) {
      toast.success("Logged out successfully!", { id: "log-out" });

      clearEmail();
      userStore.logout();
      localStorage.clear();

      queryClient.invalidateQueries();
    }
  }, [logoutMutation.data, logoutMutation.error]);

  return logoutMutation;
};

export const useGetMagicLink = () => {
  return useMutation<{ message: string }, AxiosError<{ error: string; errors?: string[] }>, RequestMagicLinkPayload>({
    mutationFn: USERS_API.GET_MAGIC_LINK,
  });
};

export const useGetUserProfile = () => {
  const location = useLocation();

  const getUserProfileQuery = useQuery<GetUserProfileResponse, AxiosError>({
    queryFn: USERS_API.GET_USER_PROFILE,
    queryKey: usersQuerykeys.all,
  });

  useEffect(() => {
    if (getUserProfileQuery.status === "error") {
      console.error("Error fetching user profile:", getUserProfileQuery.error);
      userStore.updateUser({
        user: null,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
        access_token: undefined,
      });
      setEmail("");
      location.route("/gallery", true);
    }
    if (getUserProfileQuery.status === "success") {
      // console.log("User profile fetched successfully:", getUserProfileQuery.data);
      userStore.updateUser({
        access_token: getUserProfileQuery.data.data.access_token,
        user: (getUserProfileQuery.data.data as NotMarkedForDeletionProfile).user,
      });
    }
  }, [getUserProfileQuery.status, getUserProfileQuery.data]);

  return getUserProfileQuery;
};

export const useVeriftMagicCode = () => {
  const queryClient = useQueryClient();

  return useMutation<GetUserProfileResponse, AxiosError<{ message: string; errors: string[] }>, VerifyMagicCodePayload>({
    mutationFn: USERS_API.VERIFY_MAGIC_CODE,
    onSuccess: (data) => {
      console.log("Magic code verified successfully:", data);

      // Store access token regardless of deletion status
      userStore.updateUser({
        access_token: data.data.access_token,
      });

      if ((data.data as MarkedForDeletionProfile).to_be_deleted) {
        accountDeletionPendingSignal.value = {
          isOpen: true,
          userData: data,
          date_requested_for_deletion: (data.data as MarkedForDeletionProfile).date_requested_for_deletion,
        };
        return;
      }

      // Update the user store with the new user data
      userStore.updateUser({
        access_token: data.data.access_token,
        user: (data.data as NotMarkedForDeletionProfile).user,
      });
      console.log(userSignal.value);
      // Update the query cache directly with the new user data
      queryClient.setQueryData<GetUserProfileResponse>(usersQuerykeys.all, data);

      // Invalidate queries to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: usersQuerykeys.all,
      });
    },
    onError: (error) => {
      console.error("Error verifying magic code:", error);
    },
  });
};

export const useVerifyMagicLink = () => {
  const location = useLocation();
  const { query } = useRoute();

  const queryClient = useQueryClient();

  const token = query.token as string;

  return useMutation<GetUserProfileResponse, AxiosError<Record<string, any>>, string>({
    mutationFn: () => USERS_API.VERIFY_MAGIC_LINK(token),
    onSuccess: (data) => {
      console.log("Magic link verified successfully:", data);

      // Store access token regardless of deletion status
      userStore.updateUser({
        access_token: data.data.access_token,
      });

      if ((data.data as MarkedForDeletionProfile).to_be_deleted) {
        accountDeletionPendingSignal.value = {
          isOpen: true,
          userData: data,
          date_requested_for_deletion: (data.data as MarkedForDeletionProfile).date_requested_for_deletion,
        };
        return;
      }

      // Update the user store with the new user data
      userStore.updateUser({
        access_token: data.data.access_token,
        user: (data.data as NotMarkedForDeletionProfile).user,
        to_be_deleted: false,
      });
      console.log(userSignal.value);
      // Update the query cache directly with the new user data
      queryClient.setQueryData<GetUserProfileResponse>(usersQuerykeys.all, data);

      // Invalidate queries to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: usersQuerykeys.all,
      });
    },
    onError: (error) => {
      console.error("Error verifying magic code:", error);
      clearEmail();
      userStore.logout();
      localStorage.clear();

      toast.error(error.response?.data.errors?.[0] ?? "Invalid or expired magic link");

      location.route("/sign-in", true);
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<OnboardingUserResponse, AxiosError<{ error: string }>, OnboardingFormData>({
    mutationFn: USERS_API.UPDATE_USER_PROFILE,
    onSuccess: (data) => {
      console.log("User profile updated successfully:", data);

      // Update the user store with the new user data
      userStore.updateUser({
        user: data.data.user,
      });

      // Update the query cache directly with the new user data
      queryClient.setQueryData<GetUserProfileResponse>(usersQuerykeys.all, (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            user: data.data.user,
          },
        };
      });

      // Invalidate queries to trigger a refetch for any other dependent queries
      queryClient.invalidateQueries({
        queryKey: usersQuerykeys.all,
      });
    },
    onError: (error) => {
      console.error("Error updating user profile:", error);
    },
  });
};

export const useUpdateBusinessImage = () => {
  const queryClient = useQueryClient();

  return useMutation<OnboardingUserResponse, AxiosError<{ error: string }>, FormData>({
    mutationFn: USERS_API.UPDATE_BUSINESS_IMAGE,
    onSuccess: (data) => {
      // Update the user store with the new user data
      userStore.updateUser({
        user: data.data.user,
      });

      toast.success("Business image updated successfully!", {
        id: `${usersQuerykeys.all[0]}-update`,
      });

      // Update the query cache directly with the new user data
      queryClient.setQueryData<GetUserProfileResponse>(usersQuerykeys.all, (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            user: data.data.user,
          },
        };
      });

      // Invalidate queries to trigger a refetch for any other dependent queries
      queryClient.invalidateQueries({
        queryKey: usersQuerykeys.all,
      });
    },
    onError: (error) => {
      toast.error("Failed to upload business logo", {
        id: `${usersQuerykeys.all[0]}-update`,
      });
      console.error("Error updating user profile:", error);
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  return useMutation<{ message: string }, AxiosError<{ error: string }>>({
    mutationFn: USERS_API.DELETE_ACCOUNT,
    onSuccess: (data) => {
      toast.success(data.message || "Account requested for deletion", {
        duration: 10000,
      });

      clearEmail();
      userStore.logout();
      localStorage.clear();

      queryClient.invalidateQueries();
      location.route("/sign-in", true);
    },
    onError: (error) => {
      console.error("Error requesting for deletion:", error);
      toast.error(error.response?.data?.error || "Failed to request for deletion");
    },
  });
};

export const useCancelDeleteAccount = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  return useMutation<CancelDeleteAccountResponse, AxiosError<{ error: string }>>({
    mutationFn: USERS_API.CANCEL_DELETE_ACCOUNT,
    onSuccess: (data) => {
      toast.success(data.message || "Account deletion cancelled successfully");

      // Update user store with the returned user data
      userStore.updateUser({
        access_token: data.data.access_token,
        user: data.data.user,
        to_be_deleted: false,
      });

      location.route("/gallery", true);

      // Construct the profile response for cache
      const userProfileResponse: GetUserProfileResponse = {
        message: data.message,
        success: data.success,
        data: {
          user: data.data.user,
          access_token: data.data.access_token,
        },
      };

      queryClient.setQueryData<GetUserProfileResponse>(usersQuerykeys.all, userProfileResponse);
      queryClient.invalidateQueries({
        queryKey: usersQuerykeys.all,
      });

      // Close the modal
      accountDeletionPendingSignal.value = {
        isOpen: false,
        userData: null,
        date_requested_for_deletion: undefined,
      };
    },
    onError: (error) => {
      console.error("Error cancelling account deletion:", error);
      toast.error(error.response?.data?.error || "Failed to cancel account deletion");
    },
  });
};

export const usersQuerykeys = {
  all: createQueryKey(["user-profile"]),
} as const;
