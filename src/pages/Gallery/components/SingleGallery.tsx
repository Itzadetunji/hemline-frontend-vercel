import { GalleryImage } from "@/api/http/v1/gallery/gallery.types";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer } from "@/components/ui/drawer";
import { Icon } from "@iconify/react";
import { Dispatch, StateUpdater, useState, useEffect } from "preact/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateGalleryImage } from "@/api/http/v1/gallery/gallery.hooks";
import { useImageCache } from "@/hooks/useImageCache";

interface SingleGalleryProps {
	currentSelectedImage?: GalleryImage;
	setCurrentSelectedImage: Dispatch<StateUpdater<GalleryImage | undefined>>;
	setSelectedImages: Dispatch<StateUpdater<string[]>>;
	setAddToFolder: Dispatch<StateUpdater<boolean>>;
	setDeleteImages: Dispatch<StateUpdater<boolean>>;
}

export const SingleGallery = (props: SingleGalleryProps) => {
	const isOpen = !!props.currentSelectedImage;
	const [isEditing, setIsEditing] = useState(false);
	const [description, setDescription] = useState("");

	const updateMutation = useUpdateGalleryImage();

	// Use the image cache hook
	const { cachedUrl, isLoading: loading } = useImageCache(
		props.currentSelectedImage?.url
	);

	const handleImageLoad = () => {
		// Image load handler for additional processing if needed
	};

	const handleEdit = () => {
		setIsEditing(true);
		setDescription(props.currentSelectedImage?.description || "");
	};

	const handleSave = async () => {
		if (!props.currentSelectedImage?.id) return;

		try {
			await updateMutation.mutateAsync({
				id: props.currentSelectedImage.id,
				data: {
					gallery: {
						description,
					},
				},
			});
			setIsEditing(false);
		} catch (error) {
			console.error("Failed to update image:", error);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setDescription(props.currentSelectedImage?.description || "");
	};

	// Reset states when drawer opens/closes or image changes
	useEffect(() => {
		if (props.currentSelectedImage) {
			setDescription(props.currentSelectedImage.description || "");
			setIsEditing(false);
		}
	}, [props.currentSelectedImage?.id]);

	return (
		<Drawer
			isOpen={isOpen}
			onClose={() => props.setCurrentSelectedImage(undefined)}
			className="flex flex-col gap-6 pb-6 overflow-y-auto pt-6 flex-1"
		>
			<div class="flex flex-col gap-6 items-stretch flex-1">
				<div class="relative flex items-center justify-between px-4">
					<button
						type="button"
						class="flex items-center gap-2"
						onClick={() => {
							props.setCurrentSelectedImage(undefined);
						}}
					>
						<Icon
							icon="solar:arrow-left-linear"
							className="size-6"
						/>
						<p>Exit</p>
					</button>

					<Popover>
						<PopoverTrigger asChild>
							<button class="">
								<Icon
									icon="pepicons-pencil:dots-x"
									className="text-black size-6"
								/>
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-40 mr-4 flex flex-col items-stretch border-line-400 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg bg-white/70 rounded-sm !top-14 !right-124">
							<ul class="flex flex-col gap-3">
								<button
									onClick={() => {
										props.setSelectedImages(() => [
											props.currentSelectedImage?.id as string,
										]);
										props.setAddToFolder(true);
										props.setCurrentSelectedImage(undefined);
									}}
									type="button"
									class="flex items-center gap-2 hover:bg-secondary cursor-pointer justify-between"
								>
									<p class="font-medium text-sm">Add to Folder</p>
									<div class="p-1 min-w-5">
										<Icon
											icon="bi:folder"
											className="h-4 w-4 text-black"
										/>
									</div>
								</button>
								<button
									onClick={() => {
										props.setSelectedImages(() => [
											props.currentSelectedImage?.id as string,
										]);
										props.setDeleteImages(true);
										props.setCurrentSelectedImage(undefined);
									}}
									type="button"
									class="flex items-center gap-2 hover:bg-secondary cursor-pointer justify-between"
								>
									<p class="text-destructive font-medium text-sm">Delete</p>
									<div class="p-1 min-w-5">
										<Icon
											icon="material-symbols-light:delete-outline-sharp"
											className="h-4 w-4 text-destructive"
										/>
									</div>
								</button>
								<li class="flex items-center gap-2 hover:bg-secondary cursor-pointer justify-between text-grey-500">
									<p class="font-medium text-sm">Uploaded</p>
									<span class="text-sm">
										{props.currentSelectedImage &&
											new Intl.DateTimeFormat("en-GB", {
												day: "2-digit",
												month: "2-digit",
												year: "2-digit",
											}).format(
												new Date(
													(props.currentSelectedImage?.created_at as string) ??
														undefined
												)
											)}
									</span>
								</li>
							</ul>
						</PopoverContent>
					</Popover>
				</div>
				<div class="flex flex-col flex-1 gap-6 justify-between">
					<div class="relative flex-1">
						{loading && (
							<Skeleton class="absolute inset-0 h-full w-full rounded-none" />
						)}
						<img
							src={cachedUrl}
							alt={props.currentSelectedImage?.file_name}
							onLoad={handleImageLoad}
							class="flex-1 w-full h-full object-contain"
							style={{ display: loading ? "none" : "block" }}
						/>
					</div>
					<div class="flex flex-col gap-4 px-4 flex-1 justify-end">
						<ul class="flex items-center justify-between gap-4">
							<h2 class="text-2xl leading-5">Work Details</h2>
							{!isEditing ? (
								<Button
									class="py-1.5 px-2 h-6 text-black"
									variant="secondary"
									onClick={handleEdit}
								>
									<p class="text-sm">Edit</p>
									<i class="size-3 grid place-content-center">
										<Icon icon="iconoir:edit" />
									</i>
								</Button>
							) : (
								<div class="flex items-center gap-2">
									<Button
										class="py-1.5 px-2 h-6 text-black"
										variant="secondary"
										onClick={handleCancel}
										disabled={updateMutation.isPending}
									>
										<p class="text-sm">Cancel</p>
									</Button>
									<Button
										class="py-1.5 px-2 h-6"
										onClick={handleSave}
										disabled={updateMutation.isPending}
									>
										<p class="text-sm">
											{updateMutation.isPending ? "Saving..." : "Save"}
										</p>
									</Button>
								</div>
							)}
						</ul>
						<textarea
							class="px-3 py-3.5 placeholder:text-grey-500 text-sm border border-line flex-1 max-h-32"
							placeholder="add some info about this work"
							value={description}
							onInput={(e) =>
								setDescription((e.target as HTMLTextAreaElement).value)
							}
							disabled={!isEditing}
						/>
					</div>
				</div>
			</div>
		</Drawer>
	);
};
