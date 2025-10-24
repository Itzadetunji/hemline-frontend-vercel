import { z } from "zod";
import type { GalleryImageType } from "../gallery.types";

// Folder Color Type
export type FolderColor = {
	start: string;
	end: string;
};

// Folder interface
export interface Folder {
	id: string;
	name: string;
	description: string;
	image_ids: string[];
	cover_image: string | null;
	created_at: string;
	folder_color: number;
	is_public?: boolean;
	public_id?: string;
	public_url?: string;
}

// Pagination query parameters
export interface PaginationParams {
	per_page?: number;
	page?: number;
}

// Pagination response
export interface PaginationReponse {
	current_page: number;
	per_page: number;
	total: number;
	total_pages: number;
}

// Get Folders - Response
export interface GetFoldersResponse {
	message: string;
	data: Folder[];
	pagination?: PaginationReponse;
}

// Get Single Folder - Response
export interface GetFolderResponse {
	message: string;
	data: { folder: Folder; images: GalleryImageType[] };
	pagination: PaginationReponse;
}

// Get Single Folder with Pagination Parameters
export interface GetFolderParams extends PaginationParams {
	id: string;
}

// Create Folder - Request
export const CreateFolderSchema = z.object({
	folder: z.object({
		name: z.string().min(1, "Folder name is required"),
		description: z.string().optional().default(""),
		folder_color: z.number().int().min(1).max(9),
		is_public: z.boolean().optional().default(false),
	}),
	image_ids: z.array(z.uuid()).optional(),
});

export type CreateFolderPayload = z.infer<typeof CreateFolderSchema>;

// Create Folder - Response
export interface CreateFolderResponse {
	message: string;
	data: Folder;
}

// Update Folder - Request
export const UpdateFolderSchema = z.object({
	name: z.string().min(1, "Folder name is required").optional(),
	description: z.string().optional(),
	folder_color: z.number().int().min(1).max(9).optional(),
	is_public: z.boolean().optional(),
});

export type UpdateFolderPayload = z.infer<typeof UpdateFolderSchema>;

// Update Folder - Response
export interface UpdateFolderResponse {
	message: string;
	data: Folder;
}

// Add Images to Folder - Request
export const AddImagesToFolderSchema = z.object({
	image_ids: z.array(z.uuid()).min(1, "At least one image ID required"),
	folder_ids: z.array(z.uuid()).min(1, "At least one folder ID required"),
});

export type AddImagesToFolderPayload = z.infer<typeof AddImagesToFolderSchema>;

// Add Images to Folder - Response
export interface AddImagesToFolderResponse {
	message: string;
	data: Folder;
}

// Set Folder Cover Image - Request
export const SetFolderCoverImageSchema = z.object({
	image_id: z.string().uuid("Invalid image ID format"),
});

export type SetFolderCoverImagePayload = z.infer<
	typeof SetFolderCoverImageSchema
>;

// Set Folder Cover Image - Response
export interface SetFolderCoverImageResponse {
	message: string;
	data: Folder;
}

// Remove Images from Folder - Request
export const RemoveImagesFromFolderSchema = z.object({
	image_ids: z
		.array(z.string().uuid())
		.min(1, "At least one image ID required"),
});

export type RemoveImagesFromFolderPayload = z.infer<
	typeof RemoveImagesFromFolderSchema
>;

// Remove Images from Folder - Response
export interface RemoveImagesFromFolderResponse {
	message: string;
}

// Delete Folder - Response
export interface DeleteFolderResponse {
	message: string;
}

// Public User Info
export interface PublicUserInfo {
	id: string;
	first_name: string;
	last_name: string;
	full_name: string;
	business_name: string;
	business_image: string;
	profession: string;
}

// Share Folder - Request
export const ShareFolderSchema = z.discriminatedUnion("share_type", [
	z.object({
		share_type: z.literal("email"),
		email: z.email("Invalid email address"),
		is_public: z.boolean(),
	}),
	z.object({
		share_type: z.literal("client"),
		client_id: z.string().uuid("Invalid client ID"),
		is_public: z.boolean(),
	}),
	z.object({
		share_type: z.literal("link"),
		is_public: z.boolean(),
	}),
]);

export type ShareFolderPayload = z.infer<typeof ShareFolderSchema>;

// Share Folder - Response
export interface ShareFolderResponse {
	message: string;
	data: { is_public: boolean; public_id: string; public_url: string };
}

// Get Public Folder - Response
export interface GetPublicFolderResponse {
	message: string;
	data: {
		folder: Folder;
		user: PublicUserInfo;
		images: GalleryImageType[];
		pagination: PaginationReponse;
	};
}

// Get Public Folder Images - Response
export interface GetPublicFolderImagesResponse {
	message: string;
	data: {
		images: GalleryImageType[];
		user: PublicUserInfo;
	};
	pagination: PaginationReponse;
}
