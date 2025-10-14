import { userStore } from "@/stores/userStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "preact/hooks";
import { APIVersion1PatchUserProfile, USERS_API } from "./users.api";
import type {
	GetUserProfileResponse,
	OnboardingUserPayload,
	OnboardingUserResponse,
	RequestMagicLinkPayload,
	VerifyMagicCodePayload,
} from "./users.types";
import { useLocation } from "preact-iso";

export const useJoinWaitlist = () => {
	return useMutation({
		mutationFn: APIVersion1PatchUserProfile,
	});
};

export const useGetMagicLink = () => {
	return useMutation<{ message: string }, AxiosError, RequestMagicLinkPayload>({
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
				theme: window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light",
				token: undefined,
			});
			location.route("/", true);
		}
		if (getUserProfileQuery.status === "success") {
			console.log(
				"User profile fetched successfully:",
				getUserProfileQuery.data
			);
			userStore.updateUser({
				token: getUserProfileQuery.data.data.token,
				user: getUserProfileQuery.data.data.user,
			});
		}
	}, [getUserProfileQuery.status, getUserProfileQuery.data]);

	return getUserProfileQuery;
};

export const useVeriftMagicCode = () => {
	return useMutation<
		GetUserProfileResponse,
		AxiosError<{ error: string }>,
		VerifyMagicCodePayload
	>({
		mutationFn: USERS_API.VERIFY_MAGIC_CODE,
	});
};

export const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	return useMutation<
		OnboardingUserResponse,
		AxiosError<{ error: string }>,
		OnboardingUserPayload
	>({
		mutationFn: USERS_API.UPDATE_USER_PROFILE,
		onSuccess: (data) => {
			console.log("User profile updated successfully:", data);

			// Update the user store with the new user data
			userStore.updateUser({
				user: data.data,
			});

			// Update the query cache directly with the new user data
			queryClient.setQueryData<GetUserProfileResponse>(
				usersQuerykeys.all,
				(oldData) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						data: {
							...oldData.data,
							user: data.data,
						},
					};
				}
			);

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

const usersQuerykeys = {
	all: ["user-profile"] as const,
} as const;
