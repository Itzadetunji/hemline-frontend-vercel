import $http from "../../xhr";
import type {
	ListClientsResponse,
	GetClientResponse,
	CreateClientResponse,
	UpdateClientResponse,
	DeleteClientsResponse,
	CreateClientPayload,
	UpdateClientPayload,
	DeleteClientsPayload,
	GetAllClientsParams,
} from "./clients.types";

const CLIENTS_ENDPOINTS = {
	list: "/clients",
	create: "/clients",
	show: (id: string) => `/clients/${id}`,
	update: (id: string) => `/clients/${id}`,
	bulkDelete: "/clients/bulk_delete",
} as const;

export const CLIENTS_API = {
	GET_ALL: async (params?: GetAllClientsParams): Promise<ListClientsResponse> =>
		await $http.get(CLIENTS_ENDPOINTS.list, { params }).then((res) => res.data),

	GET: async (id: string): Promise<GetClientResponse> =>
		await $http.get(CLIENTS_ENDPOINTS.show(id)).then((res) => res.data),

	CREATE: async (data: CreateClientPayload): Promise<CreateClientResponse> =>
		await $http.post(CLIENTS_ENDPOINTS.create, data).then((res) => res.data),

	UPDATE: async (
		id: string,
		data: UpdateClientPayload
	): Promise<UpdateClientResponse> =>
		await $http
			.patch(CLIENTS_ENDPOINTS.update(id), data)
			.then((res) => res.data),

	BULK_DELETE: async (
		data: DeleteClientsPayload
	): Promise<DeleteClientsResponse> =>
		await $http
			.delete(CLIENTS_ENDPOINTS.bulkDelete, { data })
			.then((res) => res.data),
};
