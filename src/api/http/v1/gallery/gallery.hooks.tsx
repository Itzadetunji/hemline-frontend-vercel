import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { AxiosError, type AxiosProgressEvent } from "axios";
import { useState } from "preact/hooks";
import { GALLERY_API } from "./gallery.api";
import type {
	DeleteImagesPayload,
	DeleteImagesResponse,
	GetGalleriesResponse,
	GetGalleryImageResponse,
	PaginationParams,
	UpdateGalleryImagePayload,
	UpdateGalleryImageResponse,
	UploadImagesResponse,
} from "./gallery.types";

// Query keys factory
const galleryQueryKeys = {
	all: ["gallery"] as const,
	lists: () => [...galleryQueryKeys.all, "list"] as const,
	list: (params?: PaginationParams) =>
		[...galleryQueryKeys.lists(), params] as const,
	details: () => [...galleryQueryKeys.all, "detail"] as const,
	detail: (id: string) => [...galleryQueryKeys.details(), id] as const,
	infinite: (perPage?: number) =>
		[...galleryQueryKeys.lists(), "infinite", perPage] as const,
} as const;

// GET: Fetch all gallery images with pagination
export const useGetGalleries = (params?: PaginationParams) => {
	return useQuery<GetGalleriesResponse, AxiosError>({
		queryKey: galleryQueryKeys.list(params),
		queryFn: () => GALLERY_API.GET_GALLERIES(params),
	});
};

// GET: Fetch gallery images with infinite scroll
export const useInfiniteGetGalleries = (perPage = 20) => {
	return useInfiniteQuery<GetGalleriesResponse, AxiosError>({
		queryKey: galleryQueryKeys.infinite(perPage),
		queryFn: ({ pageParam = 1 }) =>
			GALLERY_API.GET_GALLERIES({
				per_page: perPage,
				page: pageParam as number,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (!lastPage.pagination) return undefined;

			const { current_page, total_pages } = lastPage.pagination;
			return current_page < total_pages ? current_page + 1 : undefined;
		},
		getPreviousPageParam: (firstPage) => {
			if (!firstPage.pagination) return undefined;

			const { current_page } = firstPage.pagination;
			return current_page > 1 ? current_page - 1 : undefined;
		},
	});
};

// GET: Fetch a single gallery image by ID
export const useGetGalleryImage = (id: string, enabled = true) => {
	return useQuery<GetGalleryImageResponse, AxiosError>({
		queryKey: galleryQueryKeys.detail(id),
		queryFn: () => GALLERY_API.GET_GALLERY_IMAGE(id),
		enabled: enabled && !!id,
	});
};

// POST: Upload images
export const useUploadImages = () => {
	const queryClient = useQueryClient();
	const [progress, setProgress] = useState(0);

	const mutation = useMutation<
		UploadImagesResponse,
		AxiosError<{ error: string; errors?: string[] }>,
		FormData
	>({
		mutationFn: (formData: FormData) =>
			GALLERY_API.UPLOAD_IMAGES(formData, {
				onUploadProgress: (progressEvent: AxiosProgressEvent) => {
					if (progressEvent.total) {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
						setProgress(percentCompleted);
					}
				},
			}),
		onSuccess: (data) => {
			console.log("Images uploaded successfully:", data);
			setProgress(100);

			// Invalidate all gallery lists to refetch with new images
			queryClient.invalidateQueries({
				queryKey: galleryQueryKeys.lists(),
			});

			// Optionally, set the uploaded images in cache for detail queries
			data.data.forEach((image) => {
				queryClient.setQueryData<GetGalleryImageResponse>(
					galleryQueryKeys.detail(image.id),
					{
						message: "Gallery image retrieved successfully",
						data: image,
					}
				);
			});

			// Reset progress after a delay
			setTimeout(() => setProgress(0), 2000);
		},
		onError: (error) => {
			console.error("Error uploading images:", error);
			setProgress(0);
		},
	});

	return { ...mutation, progress };
};

// PATCH: Update a gallery image
export const useUpdateGalleryImage = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateGalleryImageResponse,
		AxiosError<{ error: string; errors?: string[] }>,
		{ id: string; data: UpdateGalleryImagePayload }
	>({
		mutationFn: ({ id, data }) => GALLERY_API.UPDATE_GALLERY_IMAGE(id, data),
		onSuccess: (response, variables) => {
			console.log("Gallery image updated successfully:", response);

			// Update the specific image in cache
			queryClient.setQueryData<GetGalleryImageResponse>(
				galleryQueryKeys.detail(variables.id),
				response
			);
		},
		onError: (error) => {
			console.error("Error updating gallery image:", error);
		},
	});
};

// DELETE: Delete multiple images
export const useDeleteImages = () => {
	const queryClient = useQueryClient();

	return useMutation<
		DeleteImagesResponse,
		AxiosError<{ error: string; errors?: string[] }>,
		DeleteImagesPayload
	>({
		mutationFn: GALLERY_API.DELETE_IMAGES,
		onSuccess: (data, variables) => {
			console.log("Images deleted successfully:", data);

			// Remove deleted images from cache
			variables.image_ids.forEach((id) => {
				queryClient.removeQueries({
					queryKey: galleryQueryKeys.detail(id),
				});
			});

			// Invalidate all lists to refetch without deleted images
			queryClient.invalidateQueries({
				queryKey: galleryQueryKeys.lists(),
			});
		},
		onError: (error) => {
			console.error("Error deleting images:", error);
		},
	});
};
