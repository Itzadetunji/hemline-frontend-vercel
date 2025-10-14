import { useMutation, useQuery } from "@tanstack/react-query";
import { APIVersion1PatchUserProfile, USERS_API } from "./users.api";
import { AxiosError } from "axios";
import type {
	GetUserProfileResponse,
	RequestMagicLinkPayload,
	VerifyMagicCodePayload,
} from "./users.types";
import { useEffect } from "preact/hooks";
import { userStore } from "@/stores/userStore";

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
	const getUserProfileQuery = useQuery<GetUserProfileResponse, AxiosError>({
		queryFn: USERS_API.GET_USER_PROFILE,
		queryKey: usersQuerykeys.all,
	});

	useEffect(() => {
		if (getUserProfileQuery.status === "error") {
			console.error("Error fetching user profile:", getUserProfileQuery.error);
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

const usersQuerykeys = {
	all: ["user-profile"] as const,
} as const;
