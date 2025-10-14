import { useMutation } from "@tanstack/react-query";
import { APIVersion1PatchUserProfile, USERS_API } from "./users.api";
import { AxiosError } from "axios";
import type {
	RequestMagicLinkPayload,
	VerifyMagicCodePayload,
} from "./users.types";

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

export const useVeriftMagicCode = () => {
	return useMutation<
		{ message: string },
		AxiosError<{ error: string }>,
		VerifyMagicCodePayload
	>({
		mutationFn: USERS_API.VERIFY_MAGIC_CODE,
	});
};

// const usersQuerykeys = {
// 	all: ["user"] as const,
// } as const;
