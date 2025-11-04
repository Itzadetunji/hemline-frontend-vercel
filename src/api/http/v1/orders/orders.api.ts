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
	GetAllOrdersParams,
} from "./orders.types";

const ORDERS_ENDPOINTS = {
	list: "/orders",
	create: (clientId: string) => `/clients/${clientId}/orders`,
	createGeneral: "/orders",
	show: (clientId: string, orderId: string) => `/${clientId}/orders/${orderId}`,
	update: (clientId: string, orderId: string) =>
		`/${clientId}/orders/${orderId}`,
	delete: (orderId: string) => `/orders/${orderId}`,
	bulkDelete: "/orders/bulk_delete",
	markAsDone: (orderId: string) => `/orders/${orderId}/mark_done`,
	markAsPending: (orderId: string) => `/orders/${orderId}/mark_pending`,
} as const;

export const ORDERS_API = {
	GET_ALL: async (params?: GetAllOrdersParams): Promise<ListOrdersResponse> =>
		await $http.get(ORDERS_ENDPOINTS.list, { params }).then((res) => res.data),

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

	DELETE: async (orderId: string): Promise<DeleteOrderResponse> =>
		await $http
			.delete(ORDERS_ENDPOINTS.delete(orderId))
			.then((res) => res.data),

	BULK_DELETE: async (
		data: DeleteOrdersPayload
	): Promise<DeleteOrdersResponse> =>
		await $http
			.delete(ORDERS_ENDPOINTS.bulkDelete, { data })
			.then((res) => res.data),

	MARK_AS_DONE: async (orderId: string): Promise<UpdateOrderResponse> =>
		await $http
			.patch(ORDERS_ENDPOINTS.markAsDone(orderId))
			.then((res) => res.data),

	MARK_AS_PENDING: async (orderId: string): Promise<UpdateOrderResponse> =>
		await $http
			.patch(ORDERS_ENDPOINTS.markAsPending(orderId))
			.then((res) => res.data),
};
