import { z } from "zod";
import type { OrderAttributes } from "../orders/orders.types";

// Gender choices
export const Gender = ["Male", "Female", "Other"] as const;
export type GenderType = (typeof Gender)[number];

// Measurement unit choices
export const MeasurementUnit = ["inches", "centimeters"] as const;
export type MeasurementUnitType = (typeof MeasurementUnit)[number];

// Client attributes
export interface ClientAttributes {
	id: string;
	name: string;
	gender: GenderType;
	measurement_unit: MeasurementUnitType;
	phone_number?: string;
	email?: string;
	ankle?: number;
	bicep?: number;
	bottom?: number;
	chest?: number;
	head?: number;
	height?: number;
	hip?: number;
	inseam?: number;
	knee?: number;
	neck?: number;
	outseam?: number;
	shorts?: number;
	shoulder?: number;
	sleeve?: number;
	short_sleeve?: number;
	thigh?: number;
	top_length?: number;
	waist?: number;
	wrist?: number;
	custom_fields?: Record<string, string>;
	orders?: OrderAttributes[];
	created_at: string;
	updated_at: string;
}

// Client data structure
export interface ClientData {
	id: string;
	type: "client";
	attributes: ClientAttributes;
}

// Client structure
export interface Client {
	data: ClientData;
}

// Pagination structure
export interface Pagination {
	current_page: number;
	total_pages: number;
	total_count: number;
	per_page: number;
}

// List all clients response
export interface ListClientsResponse {
	success: boolean;
	message: string;
	data: {
		clients: ClientAttributes[];
		pagination: Pagination;
	};
}

// Single client response
export interface GetClientResponse {
	success: boolean;
	message: string;
	data: {
		client: ClientAttributes;
	};
}

// Create client response
export interface CreateClientResponse {
	success: boolean;
	message: string;
	data: {
		client: ClientAttributes;
	};
}

// Update client response
export interface UpdateClientResponse {
	success: boolean;
	message: string;
	data: {
		client: ClientAttributes;
	};
}

// Delete clients response
export interface DeleteClientsResponse {
	success: boolean;
	message: string;
}

// Create client payload schema
export const CreateClientSchema = z.object({
	client: z.object({
		first_name: z.string().min(1, "First name is required"),
		last_name: z.string().min(1, "Last name is required"),
		gender: z.enum(Gender, {
			error: "Please select a valid gender",
		}),
		measurement_unit: z.enum(MeasurementUnit, {
			error: "Please select a valid measurement unit",
		}),
		phone_number: z.string().optional(),
		email: z.string().email().optional().or(z.literal("")),
		ankle: z.number().optional(),
		bicep: z.number().optional(),
		bottom: z.number().optional(),
		chest: z.number().optional(),
		head: z.number().optional(),
		height: z.number().optional(),
		hip: z.number().optional(),
		inseam: z.number().optional(),
		knee: z.number().optional(),
		neck: z.number().optional(),
		outseam: z.number().optional(),
		shorts: z.number().optional(),
		shoulder: z.number().optional(),
		sleeve: z.number().optional(),
		short_sleeve: z.number().optional(),
		thigh: z.number().optional(),
		top_length: z.number().optional(),
		waist: z.number().optional(),
		wrist: z.number().optional(),
		custom_fields: z.record(z.string(), z.string()).optional(),
	}),
});

export type CreateClientPayload = z.infer<typeof CreateClientSchema>;

// Update client payload schema
export const UpdateClientSchema = z.object({
	client: z.object({
		first_name: z.string().optional(),
		last_name: z.string().optional(),
		gender: z.enum(Gender).optional(),
		measurement_unit: z.enum(MeasurementUnit).optional(),
		phone_number: z.string().optional(),
		email: z.string().email().optional().or(z.literal("")),
		ankle: z.number().optional(),
		bicep: z.number().optional(),
		bottom: z.number().optional(),
		chest: z.number().optional(),
		head: z.number().optional(),
		height: z.number().optional(),
		hip: z.number().optional(),
		inseam: z.number().optional(),
		knee: z.number().optional(),
		neck: z.number().optional(),
		outseam: z.number().optional(),
		shorts: z.number().optional(),
		shoulder: z.number().optional(),
		sleeve: z.number().optional(),
		short_sleeve: z.number().optional(),
		thigh: z.number().optional(),
		top_length: z.number().optional(),
		waist: z.number().optional(),
		wrist: z.number().optional(),
		custom_fields: z.record(z.string(), z.string()).optional(),
	}),
});

export type UpdateClientPayload = z.infer<typeof UpdateClientSchema>;

// Delete clients payload schema
export const DeleteClientsSchema = z.object({
	client_ids: z.array(z.string()).min(1, "At least one client ID is required"),
});

export type DeleteClientsPayload = z.infer<typeof DeleteClientsSchema>;
