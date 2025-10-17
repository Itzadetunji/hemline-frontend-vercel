// Export all types
export type {
	GalleryImage,
	PaginationParams,
	GetGalleriesResponse,
	GetGalleryImageResponse,
	UploadImagesPayload,
	UploadImagesResponse,
	UpdateGalleryImagePayload,
	UpdateGalleryImageResponse,
	DeleteImagesPayload,
	DeleteImagesResponse,
} from "./gallery.types";

// Export schemas
export { UpdateGalleryImageSchema, DeleteImagesSchema } from "./gallery.types";

// Export API functions
export { GALLERY_API } from "./gallery.api";

// Export hooks
export {
	useGetGalleries,
	useGetGalleryImage,
	useUploadImages,
	useUpdateGalleryImage,
	useDeleteImages,
} from "./gallery.hooks";
