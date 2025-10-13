import type { AxiosResponse } from "axios";
import $http from "../../xhr";

export const APIVersion1GetUserProfile = async (
	data: unknown
): Promise<AxiosResponse<Record<string, string>>> =>
	$http.post("/auth/profile", data).then((res) => res.data);

export const APIVersion1PatchUserProfile = async (
	data: unknown
): Promise<AxiosResponse<Record<string, string>>> =>
	$http.patch("/auth/profile", data).then((res) => res.data);
