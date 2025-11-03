import { z } from "zod";

// Order status choices
export const OrderStatus = [
	"pending",
	"in_progress",
	"completed",
	"cancelled",
] as const;
export type OrderStatusType = (typeof OrderStatus)[number];

// Order attributes
export interface OrderAttributes {
	id: string;
	client_id?: string;
	item: string;
	quantity: number;
	notes?: string;
	is_done: boolean;
	due_date?: string;
	overdue: boolean;
	created_at: string;
	updated_at: string;
}

// Order data structure
export interface OrderData {
	id: string;
	type: "order";
	attributes: OrderAttributes;
}

// Order structure
export interface Order {
	data: OrderData;
}

// Pagination structure
export interface Pagination {
	current_page: number;
	total_pages: number;
	total_count: number;
	per_page: number;
}

// List all orders response
export interface ListOrdersResponse {
	success: boolean;
	message: string;
	data: {
		orders: OrderAttributes[];
		pagination: Pagination;
	};
}

// Single order response
export interface GetOrderResponse {
	success: boolean;
	message: string;
	data: {
		order: OrderAttributes;
	};
}

// Create order response
export interface CreateOrderResponse {
	success: boolean;
	message: string;
	data: {
		order: OrderAttributes;
	};
}

// Update order response
export interface UpdateOrderResponse {
	success: boolean;
	message: string;
	data: {
		order: OrderAttributes;
	};
}

// Delete order response
export interface DeleteOrderResponse {
	success: boolean;
	message: string;
}

// Delete orders response
export interface DeleteOrdersResponse {
	success: boolean;
	message: string;
}

// Create order payload schema
export const CreateOrderSchema = z.object({
	order: z.object({
		client_id: z.string().min(1, "Client ID is required"),
		item: z.string().min(1, "Item is required"),
		quantity: z.number().min(1, "Quantity must be at least 1"),
		notes: z.string().optional(),
		is_done: z.boolean().optional().default(false),
		due_date: z.string().optional(),
	}),
});

export type CreateOrderPayload = z.infer<typeof CreateOrderSchema>;

// Update order payload schema
export const UpdateOrderSchema = z.object({
	order: z.object({
		item: z.string().optional(),
		quantity: z.number().optional(),
		notes: z.string().optional(),
		is_done: z.boolean().optional(),
		due_date: z.string().optional(),
	}),
});

export type UpdateOrderPayload = z.infer<typeof UpdateOrderSchema>;

// Delete orders payload schema
export const DeleteOrdersSchema = z.object({
	order_ids: z.array(z.string()).min(1, "At least one order ID is required"),
});

export type DeleteOrdersPayload = z.infer<typeof DeleteOrdersSchema>;
