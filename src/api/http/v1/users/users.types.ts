import { z } from "zod";

export const VerifyMagicCodeSchema = z.object({
	code: z.union([
		z.string().regex(/^\d{6}$/, "Must be exactly 6 digits"),
		z.number().int().min(100000).max(999999),
	]),
});

export type VerifyMagicCodePayload = z.infer<typeof VerifyMagicCodeSchema>;

export const RequestMagicLinkPayloadSchema = z.object({
	email: z.email(),
});

export type RequestMagicLinkPayload = z.infer<
	typeof RequestMagicLinkPayloadSchema
>;

export interface CustomFieldAttributes {
	id: string;
	field_name: string;
	field_type: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	user_id: string;
}

export interface CustomFieldData {
	id: string;
	type: string;
	attributes: CustomFieldAttributes;
}

export interface CustomField {
	data: CustomFieldData;
}

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	full_name: string;
	profession: ProfessionType;
	business_name: string;
	business_address: string;
	skills: SkillChoicesType[];
	has_onboarded: boolean;
	created_at: string;
	updated_at: string;
	custom_fields: CustomField[];
	total_folders: number;
	total_gallery_images: number;
}

export interface GetUserProfileResponse {
	message: string;
	success: boolean;
	data: {
		user: User;
		token: string;
	};
}

export const Profession = [
	"Tailors / Dressmakers",
	"Fashion Designers",
	"Costume Designers (Theater/Film/TV)",
	"Seamstresses",
	"Medical Garment Makers",
] as const;

export type ProfessionType = (typeof Profession)[number];

export const SkillChoices = [
	"Fashion Designing",
	"Textile Design",
	"Costume Design",
	"Fashion Illustration",
	"Fashion Stylist",
	"Pattern Maker",
	"Bespoke Tailoring",
	"Shoemaking",
	"Bag Designing",
	"Wardrobe Consultant",
	"Sample Maker",
	"CAD Fashion Designer",
	"Seamstress",
] as const;

export type SkillChoicesType = (typeof SkillChoices)[number];

// Theme choices for step 3
export const ThemeChoices = ["light", "dark", "system"] as const;
export type ThemeType = (typeof ThemeChoices)[number];

// Flattened form schema for react-hook-form (used across all steps)
export const OnboardingFormSchema = z.object({
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	profession: z.enum(Profession, {
		error: "Please select a valid profession",
	}),
	business_name: z.string().optional(),
	business_address: z.string().optional(),
	has_onboarded: z.literal(true),
	skills: z
		.array(z.enum(SkillChoices))
		.min(1, "At least one skill is required"),
	theme: z.enum(ThemeChoices).default("system"),
});

export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;

export interface OnboardingUserResponse {
	message: string;
	success: boolean;
	data: User;
}
