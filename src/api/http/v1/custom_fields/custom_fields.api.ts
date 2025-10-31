import $http from "../../xhr";
import type {
	CustomFieldsListResponse,
	CustomFieldResponse,
	CreateCustomFieldPayload,
	UpdateCustomFieldPayload,
} from "./custom_fields.types";

const CUSTOM_FIELDS_ENDPOINTS = {
	list: "/custom_fields",
	create: "/custom_fields",
	show: (id: string) => `/custom_fields/${id}`,
	update: (id: string) => `/custom_fields/${id}`,
	delete: (id: string) => `/custom_fields/${id}`,
} as const;

export const CUSTOM_FIELDS_API = {
	GET_ALL: async (): Promise<CustomFieldsListResponse> =>
		await $http.get(CUSTOM_FIELDS_ENDPOINTS.list).then((res) => res.data),

	CREATE: async (
		data: CreateCustomFieldPayload
	): Promise<CustomFieldResponse> =>
		await $http
			.post(CUSTOM_FIELDS_ENDPOINTS.create, data)
			.then((res) => res.data),

	GET: async (id: string): Promise<CustomFieldResponse> =>
		await $http.get(CUSTOM_FIELDS_ENDPOINTS.show(id)).then((res) => res.data),

	UPDATE: async (
		id: string,
		data: UpdateCustomFieldPayload
	): Promise<CustomFieldResponse> =>
		await $http
			.patch(CUSTOM_FIELDS_ENDPOINTS.update(id), data)
			.then((res) => res.data),

	DEACTIVATE: async (id: string): Promise<{ message: string }> =>
		await $http
			.delete(CUSTOM_FIELDS_ENDPOINTS.delete(id))
			.then((res) => res.data),
};
