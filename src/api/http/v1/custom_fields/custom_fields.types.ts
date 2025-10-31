import { z } from "zod";
import type {
	CustomField as ExistingCustomField,
	CustomFieldData as ExistingCustomFieldData,
} from "@/api/http/v1/users/users.types";

// Responses
export interface CustomFieldsListResponse {
	message: string;
	success?: boolean;
	data: ExistingCustomField[];
}

export interface CustomFieldResponse {
	message: string;
	success?: boolean;
	data: ExistingCustomFieldData;
}

export type CustomField = ExistingCustomField;
export type CustomFieldData = ExistingCustomFieldData;

export const CustomFieldAttributeType = ["measurement", "text"] as const;
export type CustomFieldType = (typeof CustomFieldAttributeType)[number];

// Payload for creating a custom field
export const CreateCustomFieldSchema = z.object({
	custom_field: z.object({
		field_name: z.string().min(1, "Field name is required"),
		field_type: z.enum(CustomFieldAttributeType, {
			error: "Kindly select a type",
		}),
		is_active: z.boolean().optional(),
	}),
});

export type CreateCustomFieldPayload = z.infer<typeof CreateCustomFieldSchema>;

// Payload for updating a custom field
export const UpdateCustomFieldSchema = z.object({
	custom_field: z.object({
		field_name: z.string().optional(),
		field_type: z
			.enum(CustomFieldAttributeType, { error: "Kindly select a type" })
			.optional(),
		is_active: z.boolean().optional(),
	}),
});

export type UpdateCustomFieldPayload = z.infer<typeof UpdateCustomFieldSchema>;
