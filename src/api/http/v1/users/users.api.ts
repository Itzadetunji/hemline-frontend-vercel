import $http from "../../xhr";
import type {
	GetUserProfileResponse,
	OnboardingFormData,
	OnboardingUserResponse,
	RequestMagicLinkPayload,
	VerifyMagicCodePayload,
} from "./users.types";

const USERS_ENDPOINTS = {
	getUserProfile: "/auth/profile",
	getMagicLink: "/auth/request_magic_link",
	verifyMagicCode: "/auth/verify_code",
	updateUserProfile: "/users/profile",
	logout: "/auth/logout",
} as const;

export const USERS_API = {
	GET_USER_PROFILE: async (): Promise<GetUserProfileResponse> =>
		await $http.get(USERS_ENDPOINTS.getUserProfile).then((res) => res.data),

	GET_MAGIC_LINK: async (
		data: RequestMagicLinkPayload
	): Promise<{ message: string }> =>
		await $http
			.post(USERS_ENDPOINTS.getMagicLink, data)
			.then((res) => res.data),

	VERIFY_MAGIC_CODE: async (
		params: VerifyMagicCodePayload
	): Promise<GetUserProfileResponse> =>
		await $http
			.post(USERS_ENDPOINTS.verifyMagicCode, undefined, {
				params,
			})
			.then((res) => res.data),

	UPDATE_USER_PROFILE: async (
		data: OnboardingFormData
	): Promise<OnboardingUserResponse> =>
		await $http
			.patch(USERS_ENDPOINTS.updateUserProfile, data)
			.then((res) => res.data),

	LOGOUT: async (): Promise<OnboardingUserResponse> =>
		await $http.delete(USERS_ENDPOINTS.logout).then((res) => res.data),
};
