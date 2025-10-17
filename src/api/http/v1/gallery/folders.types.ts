import { z } from "zod";

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
}

// Pagination query parameters
export interface PaginationParams {
	per_page?: number;
	page?: number;
}

// Get Folders - Response
export interface GetFoldersResponse {
	message: string;
	data: Folder[];
	pagination?: {
		current_page: number;
		per_page: number;
		total: number;
		total_pages: number;
	};
}

// Get Single Folder - Response
export interface GetFolderResponse {
	message: string;
	data: Folder;
}

// Create Folder - Request
export const CreateFolderSchema = z.object({
	folder: z.object({
		name: z.string().min(1, "Folder name is required"),
		description: z.string().optional().default(""),
		folder_color: z.number().int().min(1).max(9),
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
