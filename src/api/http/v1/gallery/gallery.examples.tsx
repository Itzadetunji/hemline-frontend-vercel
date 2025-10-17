/**
 * Gallery API Usage Examples
 *
 * This file demonstrates how to use the gallery API hooks in your components.
 * Import what you need from "@/api/http/v1/gallery"
 */

import {
	useGetGalleries,
	useGetGalleryImage,
	useUploadImages,
	useUpdateGalleryImage,
	useDeleteImages,
	type DeleteImagesPayload,
	type UpdateGalleryImagePayload,
} from "@/api/http/v1/gallery";

// Example 1: Fetch all gallery images with pagination
export const GalleryList = () => {
	const { data, isLoading, error } = useGetGalleries({
		per_page: 20,
		page: 1,
	});

	if (isLoading) return <div>Loading gallery...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div>
			<h2>{data?.message}</h2>
			<div class="grid grid-cols-3 gap-4">
				{data?.data.map((image) => (
					<img
						key={image.id}
						src={image.url}
						alt={image.file_name}
					/>
				))}
			</div>
			{data?.pagination && (
				<div>
					Page {data.pagination.current_page} of {data.pagination.total_pages}
				</div>
			)}
		</div>
	);
};

// Example 2: Fetch a single image by ID
export const GalleryImageDetail = ({ imageId }: { imageId: string }) => {
	const { data, isLoading, error } = useGetGalleryImage(imageId);

	if (isLoading) return <div>Loading image...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div>
			<h2>{data?.data.file_name}</h2>
			<img
				src={data?.data.url}
				alt={data?.data.file_name}
			/>
			<p>{data?.data.description}</p>
			<p>Created: {data?.data.created_at}</p>
		</div>
	);
};

// Example 3: Upload images
export const ImageUploadForm = () => {
	const uploadMutation = useUploadImages();

	const handleFileChange = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		const files = target.files;

		if (!files || files.length === 0) return;

		const formData = new FormData();
		Array.from(files).forEach((file) => {
			formData.append("images", file);
		});

		uploadMutation.mutate(formData, {
			onSuccess: (data) => {
				console.log(`${data.count} image(s) uploaded successfully!`);
			},
			onError: (error) => {
				console.error("Upload failed:", error);
			},
		});
	};

	return (
		<div>
			<input
				type="file"
				multiple
				accept="image/*"
				onChange={handleFileChange}
				disabled={uploadMutation.isPending}
			/>
			{uploadMutation.isPending && <p>Uploading...</p>}
			{uploadMutation.isSuccess && <p>Upload successful!</p>}
			{uploadMutation.isError && (
				<p>Upload failed: {uploadMutation.error.message}</p>
			)}
		</div>
	);
};

// Example 4: Update a gallery image
export const UpdateImageForm = ({ imageId }: { imageId: string }) => {
	const updateMutation = useUpdateGalleryImage();

	const handleUpdate = () => {
		const payload: UpdateGalleryImagePayload = {
			gallery: {
				file_name: "updated-image.jpg",
				description: "Updated description",
			},
		};

		updateMutation.mutate(
			{ id: imageId, data: payload },
			{
				onSuccess: (data) => {
					console.log("Image updated:", data.data.file_name);
				},
				onError: (error) => {
					console.error("Update failed:", error);
				},
			}
		);
	};

	return (
		<button
			onClick={handleUpdate}
			disabled={updateMutation.isPending}
		>
			{updateMutation.isPending ? "Updating..." : "Update Image"}
		</button>
	);
};

// Example 5: Delete images
export const DeleteImagesButton = ({ imageIds }: { imageIds: string[] }) => {
	const deleteMutation = useDeleteImages();

	const handleDelete = () => {
		const payload: DeleteImagesPayload = {
			image_ids: imageIds,
		};

		deleteMutation.mutate(payload, {
			onSuccess: (data) => {
				console.log(`${data.count} image(s) deleted successfully!`);
			},
			onError: (error) => {
				console.error("Delete failed:", error);
			},
		});
	};

	return (
		<button
			onClick={handleDelete}
			disabled={deleteMutation.isPending}
			class="bg-red-500 text-white px-4 py-2 rounded"
		>
			{deleteMutation.isPending
				? "Deleting..."
				: `Delete ${imageIds.length} image(s)`}
		</button>
	);
};

// Example 6: Using multiple hooks together
export const GalleryManager = () => {
	const { data: galleries, refetch } = useGetGalleries({
		per_page: 10,
		page: 1,
	});
	const uploadMutation = useUploadImages();
	const deleteMutation = useDeleteImages();

	// Auto-refetch after successful upload or delete
	const handleUpload = async (formData: FormData) => {
		uploadMutation.mutate(formData, {
			onSuccess: () => {
				refetch(); // Refresh the gallery list
			},
		});
	};

	const handleDelete = (imageIds: string[]) => {
		deleteMutation.mutate(
			{ image_ids: imageIds },
			{
				onSuccess: () => {
					refetch(); // Refresh the gallery list
				},
			}
		);
	};

	return (
		<div>
			<h1>Gallery Manager</h1>
			{/* Upload form */}
			{/* Gallery grid */}
			{/* Delete actions */}
		</div>
	);
};
