import $http from "../../xhr";
import type {
	ListOrdersResponse,
	GetOrderResponse,
	CreateOrderResponse,
	UpdateOrderResponse,
	DeleteOrderResponse,
	DeleteOrdersResponse,
	CreateOrderPayload,
	UpdateOrderPayload,
	DeleteOrdersPayload,
} from "./orders.types";

const ORDERS_ENDPOINTS = {
	list: (clientId: string) => `/clients/${clientId}/orders`,
	create: (clientId: string) => `/clients/${clientId}/orders`,
	createGeneral: "/orders",
	show: (clientId: string, orderId: string) =>
		`/clients/${clientId}/orders/${orderId}`,
	update: (clientId: string, orderId: string) =>
		`/clients/${clientId}/orders/${orderId}`,
	delete: (clientId: string, orderId: string) =>
		`/clients/${clientId}/orders/${orderId}`,
	bulkDelete: (clientId: string) => `/clients/${clientId}/orders/bulk_delete`,
	markAsDone: (clientId: string, orderId: string) =>
		`/clients/${clientId}/orders/${orderId}/mark_as_done`,
	markAsPending: (clientId: string, orderId: string) =>
		`/clients/${clientId}/orders/${orderId}/mark_as_pending`,
} as const;

export const ORDERS_API = {
	GET_ALL: async (
		clientId: string,
		params?: {
			page?: number;
			per_page?: number;
		}
	): Promise<ListOrdersResponse> =>
		await $http
			.get(ORDERS_ENDPOINTS.list(clientId), { params })
			.then((res) => res.data),

	GET: async (clientId: string, orderId: string): Promise<GetOrderResponse> =>
		await $http
			.get(ORDERS_ENDPOINTS.show(clientId, orderId))
			.then((res) => res.data),

	CREATE: async (
		clientId: string,
		data: CreateOrderPayload
	): Promise<CreateOrderResponse> =>
		await $http
			.post(ORDERS_ENDPOINTS.create(clientId), data)
			.then((res) => res.data),

	CREATE_GENERAL: async (
		data: CreateOrderPayload
	): Promise<CreateOrderResponse> =>
		await $http
			.post(ORDERS_ENDPOINTS.createGeneral, data)
			.then((res) => res.data),

	UPDATE: async (
		clientId: string,
		orderId: string,
		data: UpdateOrderPayload
	): Promise<UpdateOrderResponse> =>
		await $http
			.patch(ORDERS_ENDPOINTS.update(clientId, orderId), data)
			.then((res) => res.data),

	DELETE: async (
		clientId: string,
		orderId: string
	): Promise<DeleteOrderResponse> =>
		await $http
			.delete(ORDERS_ENDPOINTS.delete(clientId, orderId))
			.then((res) => res.data),

	BULK_DELETE: async (
		clientId: string,
		data: DeleteOrdersPayload
	): Promise<DeleteOrdersResponse> =>
		await $http
			.delete(ORDERS_ENDPOINTS.bulkDelete(clientId), { data })
			.then((res) => res.data),

	MARK_AS_DONE: async (
		clientId: string,
		orderId: string
	): Promise<UpdateOrderResponse> =>
		await $http
			.patch(ORDERS_ENDPOINTS.markAsDone(clientId, orderId))
			.then((res) => res.data),

	MARK_AS_PENDING: async (
		clientId: string,
		orderId: string
	): Promise<UpdateOrderResponse> =>
		await $http
			.patch(ORDERS_ENDPOINTS.markAsPending(clientId, orderId))
			.then((res) => res.data),
};
