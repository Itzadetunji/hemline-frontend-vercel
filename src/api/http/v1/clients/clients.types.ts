import { z } from "zod";
import { OrderSchema, type OrderAttributes } from "../orders/orders.types";

// Gender choices
export const Gender = ["Male", "Female"] as const;
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
    data: { id: string; type: "client"; attributes: ClientAttributes };
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
    id: string;
    type: "client";
    attributes: ClientAttributes;
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
    email: z.email().optional().or(z.literal("")),
    shoulder_width: z.string().optional(),
    bust_chest: z.string().optional(),
    round_underbust: z.string().optional(),
    neck_circumference: z.string().optional(),
    armhole_circumference: z.string().optional(),
    arm_length_full_three_quarter: z.string().optional(),
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
    custom_fields: z.record(z.string(), z.string().optional()).optional(),
    orders: z.array(OrderSchema.omit({ client_id: true, is_done: true })).optional(),
  }),
});

export type CreateClientPayload = z.infer<typeof CreateClientSchema>;

// Update client payload schema
const UpdateClientSchemaStringOrNumber = z.union([z.string(), z.number()]);
export const UpdateClientSchema = z.object({
  client: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    gender: z.enum(Gender, {
      error: "Please select a valid gender",
    }),
    measurement_unit: z.enum(MeasurementUnit, {
      error: "Please select a valid measurement unit",
    }),
    phone_number: z.string().optional().nullable(),
    email: z.email().optional().or(z.literal("")).nullable(),
    shoulder_width: UpdateClientSchemaStringOrNumber.optional().nullable(),
    bust_chest: UpdateClientSchemaStringOrNumber.optional().nullable(),
    round_underbust: UpdateClientSchemaStringOrNumber.optional().nullable(),
    neck_circumference: UpdateClientSchemaStringOrNumber.optional().nullable(),
    armhole_circumference: UpdateClientSchemaStringOrNumber.optional().nullable(),
    arm_length_full: UpdateClientSchemaStringOrNumber.optional().nullable(),
    arm_length_three_quarter: UpdateClientSchemaStringOrNumber.optional().nullable(),
    sleeve_length: UpdateClientSchemaStringOrNumber.optional().nullable(),
    round_sleeve_bicep: UpdateClientSchemaStringOrNumber.optional().nullable(),
    elbow_circumference: UpdateClientSchemaStringOrNumber.optional().nullable(),
    wrist_circumference: UpdateClientSchemaStringOrNumber.optional().nullable(),
    top_length: UpdateClientSchemaStringOrNumber.optional().nullable(),
    bust_point_nipple_to_nipple: UpdateClientSchemaStringOrNumber.optional().nullable(),
    shoulder_to_bust_point: UpdateClientSchemaStringOrNumber.optional().nullable(),
    shoulder_to_waist: UpdateClientSchemaStringOrNumber.optional().nullable(),
    round_chest_upper_bust: UpdateClientSchemaStringOrNumber.optional().nullable(),
    back_width: UpdateClientSchemaStringOrNumber.optional().nullable(),
    back_length: UpdateClientSchemaStringOrNumber.optional().nullable(),
    tommy_waist: UpdateClientSchemaStringOrNumber.optional().nullable(),
    waist: UpdateClientSchemaStringOrNumber.optional().nullable(),
    high_hip: UpdateClientSchemaStringOrNumber.optional().nullable(),
    hip_full: UpdateClientSchemaStringOrNumber.optional().nullable(),
    lap_thigh: UpdateClientSchemaStringOrNumber.optional().nullable(),
    knee_circumference: UpdateClientSchemaStringOrNumber.optional().nullable(),
    calf_circumference: UpdateClientSchemaStringOrNumber.optional().nullable(),
    ankle_circumference: UpdateClientSchemaStringOrNumber.optional().nullable(),
    skirt_length: UpdateClientSchemaStringOrNumber.optional().nullable(),
    trouser_length_outseam: UpdateClientSchemaStringOrNumber.optional().nullable(),
    inseam: UpdateClientSchemaStringOrNumber.optional().nullable(),
    crotch_depth: UpdateClientSchemaStringOrNumber.optional().nullable(),
    waist_to_hip: UpdateClientSchemaStringOrNumber.optional().nullable(),
    waist_to_floor: UpdateClientSchemaStringOrNumber.optional().nullable(),
    slit_height: UpdateClientSchemaStringOrNumber.optional().nullable(),
    bust_apex_to_waist: UpdateClientSchemaStringOrNumber.optional().nullable(),
    custom_fields: z.record(z.string(), UpdateClientSchemaStringOrNumber.optional()).optional().nullable(),
  }),
});

export type UpdateClientPayload = z.infer<typeof UpdateClientSchema>;

// Delete clients payload schema
export const DeleteClientsSchema = z.object({
  client_ids: z.array(z.string()).min(1, "At least one client ID is required"),
});

export type DeleteClientsPayload = z.infer<typeof DeleteClientsSchema>;

export interface GetAllClientsParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: "a-z" | "z-a" | "last_updated";
  include_trashed?: boolean;
}

export interface MeasurementFieldType {
  id: string;
  title: string;
  female_only?: boolean;
}

export const Measurements: {
  upper_measurements: MeasurementFieldType[];
  lower_measurements: MeasurementFieldType[];
} = {
  upper_measurements: [
    { id: "shoulder_width", title: "Shoulder Width" },
    { id: "bust_chest", title: "Bust / Chest" },
    { id: "round_underbust", title: "Round Underbust" },
    { id: "neck_circumference", title: "Neck Circumference" },
    { id: "armhole_circumference", title: "Armhole / Arm Circumference" },
    { id: "arm_length_full_three_quarter", title: "Arm Length (Full & ¾)" },
    { id: "sleeve_length", title: "Sleeve Length" },
    { id: "round_sleeve_bicep", title: "Round Sleeve / Bicep" },
    { id: "elbow_circumference", title: "Elbow Circumference" },
    { id: "wrist_circumference", title: "Wrist Circumference" },
    { id: "top_length", title: "Top Length / Blouse Length" },
    {
      id: "bust_point_nipple_to_nipple",
      title: "Bust Point (Nipple to Nipple)",
    },
    { id: "shoulder_to_bust_point", title: "Shoulder to Bust Point" },
    { id: "shoulder_to_waist", title: "Shoulder to Waist" },
    { id: "round_chest_upper_bust", title: "Round Chest / Upper Bust" },
    { id: "back_width", title: "Back Width" },
    { id: "back_length", title: "Back Length" },
    { id: "tommy_waist", title: "Tommy / Waist" },
    { id: "bust_apex_to_waist", title: "Bust Apex to Waist" },
  ],
  lower_measurements: [
    { id: "waist", title: "Waist" },
    { id: "high_hip", title: "High Hip" },
    { id: "hip_full", title: "Hip / Full Hip" },
    { id: "lap_thigh", title: "Lap / Thigh" },
    { id: "knee_circumference", title: "Knee Circumference" },
    { id: "calf_circumference", title: "Calf Circumference" },
    { id: "ankle_circumference", title: "Ankle Circumference" },
    { id: "skirt_length", title: "Skirt Length" },
    { id: "trouser_length_outseam", title: "Trouser Length / Outseam" },
    { id: "inseam", title: "Inseam" },
    { id: "crotch_depth", title: "Crotch Depth" },
    { id: "waist_to_hip", title: "Waist to Hip" },
    { id: "waist_to_floor", title: "Waist to Floor" },
    { id: "slit_height", title: "Slit Height", female_only: true },
  ],
};
