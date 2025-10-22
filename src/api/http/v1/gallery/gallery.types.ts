import { z } from "zod";

// Gallery Image interface
export interface GalleryImageType {
  id: string;
  file_name: string;
  description: string;
  url: string;
  public_id: string;
  folder_ids: string[];
  created_at: string;
}

// Pagination query parameters
export interface PaginationParams {
  per_page?: number;
  page?: number;
}

// Get Images In Galleries - Response
export interface GetGalleriesResponse {
  message: string;
  data: GalleryImageType[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Get Single Image - Response
export interface GetGalleryImageResponse {
  message: string;
  data: GalleryImageType;
}

// Upload Image - Request (FormData handled separately)
export interface UploadImagesPayload {
  images: File[];
}

// Upload Image - Response
export interface UploadImagesResponse {
  message: string;
  data: GalleryImageType[];
  count: number;
}

// Update Gallery Image - Request
export const UpdateGalleryImageSchema = z.object({
  gallery: z.object({
    file_name: z.string().optional(),
    description: z.string().optional(),
  }),
});

export type UpdateGalleryImagePayload = z.infer<typeof UpdateGalleryImageSchema>;

// Update Gallery Image - Response
export interface UpdateGalleryImageResponse {
  message: string;
  data: GalleryImageType;
}

// Delete Images - Request
export const DeleteImagesSchema = z.object({
  image_ids: z.array(z.string().uuid()).min(1, "At least one image ID required"),
});

export type DeleteImagesPayload = z.infer<typeof DeleteImagesSchema>;

// Delete Images - Response
export interface DeleteImagesResponse {
  message: string;
  count: number;
}
