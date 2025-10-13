import type { AxiosResponse } from "axios";
import $http from "../../xhr";
import { RequestMagicLinkPayload, VerifyMagicCodePayload } from "./users.types";
import { verify } from "crypto";

export const APIVersion1GetUserProfile = async (
	data: unknown
): Promise<AxiosResponse<Record<string, string>>> =>
	$http.post("/auth/profile", data).then((res) => res.data);

export const APIVersion1PatchUserProfile = async (
	data: unknown
): Promise<AxiosResponse<Record<string, string>>> =>
	$http.patch("/auth/profile", data).then((res) => res.data);

const USERS_ENDPOINTS = {
	getMagicLink: "/auth/request_magic_link",
	verifyMagicCode: "/auth/verify_code",
} as const;

export const USERS_API = {
	GET_MAGIC_LINK: async (
		data: RequestMagicLinkPayload
	): Promise<{ message: string }> =>
		await $http
			.post(USERS_ENDPOINTS.getMagicLink, data)
			.then((res) => res.data),
	VERIFY_MAGIC_CODE: async (
		params: VerifyMagicCodePayload
	): Promise<{ message: string }> =>
		await $http
			.post(USERS_ENDPOINTS.verifyMagicCode, undefined, {
				params,
			})
			.then((res) => res.data),
};
