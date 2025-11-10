import type { AxiosError } from "axios";
import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clearEmail, setEmail } from "@/stores/authStore";
import { userSignal, userStore } from "@/stores/userStore";
import { USERS_API } from "./users.api";
import type { GetUserProfileResponse, OnboardingFormData, OnboardingUserResponse, RequestMagicLinkPayload, VerifyMagicCodePayload } from "./users.types";
import { createQueryKey } from "@/lib/queryClient";

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
        token: undefined,
      });
      setEmail("");
      location.route("/gallery", true);
    }
    if (getUserProfileQuery.status === "success") {
      // console.log("User profile fetched successfully:", getUserProfileQuery.data);
      userStore.updateUser({
        token: getUserProfileQuery.data.data.token,
        user: getUserProfileQuery.data.data.user,
      });
    }
  }, [getUserProfileQuery.status, getUserProfileQuery.data]);

  return getUserProfileQuery;
};

export const useVeriftMagicCode = () => {
  const queryClient = useQueryClient();

  return useMutation<GetUserProfileResponse, AxiosError<{ error: string }>, VerifyMagicCodePayload>({
    mutationFn: USERS_API.VERIFY_MAGIC_CODE,
    onSuccess: (data) => {
      console.log("Magic code verified successfully:", data);

      // Update the user store with the new user data
      userStore.updateUser({
        token: data.data.token,
        user: data.data.user,
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

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<OnboardingUserResponse, AxiosError<{ error: string }>, OnboardingFormData>({
    mutationFn: USERS_API.UPDATE_USER_PROFILE,
    onSuccess: (data) => {
      console.log("User profile updated successfully:", data);

      // Update the user store with the new user data
      userStore.updateUser({
        user: data.data,
      });

      // Update the query cache directly with the new user data
      queryClient.setQueryData<GetUserProfileResponse>(usersQuerykeys.all, (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            user: data.data,
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
        user: data.data,
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
            user: data.data,
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

export const usersQuerykeys = {
  all: createQueryKey(["user-profile"]),
} as const;
