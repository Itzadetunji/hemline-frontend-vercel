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
	first_name: string;
	last_name: string;
	full_name: string;
	gender: GenderType;
	measurement_unit: MeasurementUnitType;
	phone_number?: string;
	email?: string;
	in_trash: boolean;
	shoulder_width?: string | null;
	bust_chest?: string | null;
	round_underbust?: string | null;
	neck_circumference?: string | null;
	armhole_circumference?: string | null;
	arm_length_full?: string | null;
	arm_length_three_quarter?: string | null;
	sleeve_length?: string | null;
	round_sleeve_bicep?: string | null;
	elbow_circumference?: string | null;
	wrist_circumference?: string | null;
	top_length?: string | null;
	bust_point_nipple_to_nipple?: string | null;
	shoulder_to_bust_point?: string | null;
	shoulder_to_waist?: string | null;
	round_chest_upper_bust?: string | null;
	back_width?: string | null;
	back_length?: string | null;
	tommy_waist?: string | null;
	waist?: string | null;
	high_hip?: string | null;
	hip_full?: string | null;
	lap_thigh?: string | null;
	knee_circumference?: string | null;
	calf_circumference?: string | null;
	ankle_circumference?: string | null;
	skirt_length?: string | null;
	trouser_length_outseam?: string | null;
	inseam?: string | null;
	crotch_depth?: string | null;
	waist_to_hip?: string | null;
	waist_to_floor?: string | null;
	slit_height?: string | null;
	bust_apex_to_waist?: string | null;
	custom_fields?: any[];
	orders?: OrderAttributes[];
	total_orders?: number;
	pending_orders_count?: number;
	completed_orders_count?: number;
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
	data: ClientData[];
	pagination: Pagination;
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
		shoulder_width: z.string().optional(),
		bust_chest: z.string().optional(),
		round_underbust: z.string().optional(),
		neck_circumference: z.string().optional(),
		armhole_circumference: z.string().optional(),
		arm_length_full: z.string().optional(),
		arm_length_three_quarter: z.string().optional(),
		sleeve_length: z.string().optional(),
		round_sleeve_bicep: z.string().optional(),
		elbow_circumference: z.string().optional(),
		wrist_circumference: z.string().optional(),
		top_length: z.string().optional(),
		bust_point_nipple_to_nipple: z.string().optional(),
		shoulder_to_bust_point: z.string().optional(),
		shoulder_to_waist: z.string().optional(),
		round_chest_upper_bust: z.string().optional(),
		back_width: z.string().optional(),
		back_length: z.string().optional(),
		tommy_waist: z.string().optional(),
		waist: z.string().optional(),
		high_hip: z.string().optional(),
		hip_full: z.string().optional(),
		lap_thigh: z.string().optional(),
		knee_circumference: z.string().optional(),
		calf_circumference: z.string().optional(),
		ankle_circumference: z.string().optional(),
		skirt_length: z.string().optional(),
		trouser_length_outseam: z.string().optional(),
		inseam: z.string().optional(),
		crotch_depth: z.string().optional(),
		waist_to_hip: z.string().optional(),
		waist_to_floor: z.string().optional(),
		slit_height: z.string().optional(),
		bust_apex_to_waist: z.string().optional(),
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
		shoulder_width: z.string().optional(),
		bust_chest: z.string().optional(),
		round_underbust: z.string().optional(),
		neck_circumference: z.string().optional(),
		armhole_circumference: z.string().optional(),
		arm_length_full: z.string().optional(),
		arm_length_three_quarter: z.string().optional(),
		sleeve_length: z.string().optional(),
		round_sleeve_bicep: z.string().optional(),
		elbow_circumference: z.string().optional(),
		wrist_circumference: z.string().optional(),
		top_length: z.string().optional(),
		bust_point_nipple_to_nipple: z.string().optional(),
		shoulder_to_bust_point: z.string().optional(),
		shoulder_to_waist: z.string().optional(),
		round_chest_upper_bust: z.string().optional(),
		back_width: z.string().optional(),
		back_length: z.string().optional(),
		tommy_waist: z.string().optional(),
		waist: z.string().optional(),
		high_hip: z.string().optional(),
		hip_full: z.string().optional(),
		lap_thigh: z.string().optional(),
		knee_circumference: z.string().optional(),
		calf_circumference: z.string().optional(),
		ankle_circumference: z.string().optional(),
		skirt_length: z.string().optional(),
		trouser_length_outseam: z.string().optional(),
		inseam: z.string().optional(),
		crotch_depth: z.string().optional(),
		waist_to_hip: z.string().optional(),
		waist_to_floor: z.string().optional(),
		slit_height: z.string().optional(),
		bust_apex_to_waist: z.string().optional(),
	}),
});

export type UpdateClientPayload = z.infer<typeof UpdateClientSchema>;

// Delete clients payload schema
export const DeleteClientsSchema = z.object({
	client_ids: z.array(z.string()).min(1, "At least one client ID is required"),
});

export type DeleteClientsPayload = z.infer<typeof DeleteClientsSchema>;
