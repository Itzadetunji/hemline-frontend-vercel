import { Icon } from "@iconify/react";
import type { RefObject } from "preact";
import {
	Dispatch,
	StateUpdater,
	useEffect,
	useRef,
	useState,
} from "preact/hooks";

import { useInfiniteGetGalleries } from "@/api/http/v1/gallery/gallery.hooks";
import type { GalleryImage } from "@/api/http/v1/gallery/gallery.types";
import { AddToFolder } from "@/components/AddToFolder";
import { DeleteImages } from "@/components/DeleteImages";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { selectingImagesSignal } from "@/layout/Header";

export const Gallery = () => {
	const [galleryLayout, setGalleryLayout] = useState<"fancy" | "grid">("fancy");
	const [selectedImages, setSelectedImages] = useState<string[]>([]);
	const [addToFolder, setAddToFolder] = useState<boolean>(false);
	const [deleteImages, setDeleteImages] = useState<boolean>(false);
	const observerTarget = useRef<HTMLDivElement>(null);

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useInfiniteGetGalleries(20);

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Flatten all pages into a single array of images
	const allImages = data?.pages.flatMap((page) => page.data) ?? [];

	return (
		<div class="flex flex-col flex-1 pb-8">
			<button class="flex items-center gap-2 px-4">
				<Icon
					icon="streamline-ultimate:layout"
					className="text-black"
				/>
				<p class="text-sm font-medium">Change Layout</p>
			</button>
			{isLoading && (
				<ul class="grid grid-cols-[auto_auto_auto] gap-1 mt-4">
					{Array.from({ length: 12 }).map((_, i) => (
						<Skeleton
							key={i}
							class="h-40 rounded-none"
						/>
					))}
				</ul>
			)}

			{!isLoading && allImages.length === 0 && <EmptyGallery />}

			{allImages.length > 0 && (
				<div class="grid grid-cols-3 gap-1 mt-4 auto-rows-fr">
					{allImages.map((img, idx) => (
						<GalleryImage
							key={img.id}
							image={img}
							nextImage={allImages[idx + 1] ?? undefined}
							isLastItem={idx === allImages.length - 1}
							observerRef={
								idx === allImages.length - 1 ? observerTarget : undefined
							}
							setSelectedImages={setSelectedImages}
							setAddToFolder={setAddToFolder}
							setDeleteImages={setDeleteImages}
						/>
					))}
				</div>
			)}

			{isFetchingNextPage && (
				<div class="grid grid-cols-[auto_auto_auto] gap-1 mt-1">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton
							key={i}
							class="h-40 rounded-none"
						/>
					))}
				</div>
			)}

			<AddToFolder
				image_ids={selectedImages}
				addToFolder={addToFolder}
				setAddToFolder={setAddToFolder}
			/>

			<DeleteImages
				image_ids={selectedImages}
				deleteImages={deleteImages}
				setDeleteImages={setDeleteImages}
			/>
		</div>
	);
};

const GalleryImage = (props: {
	image: GalleryImage;
	nextImage?: GalleryImage;
	isLastItem?: boolean;
	observerRef?: RefObject<HTMLDivElement>;
	setSelectedImages: Dispatch<StateUpdater<string[]>>;
	setAddToFolder: Dispatch<StateUpdater<boolean>>;
	setDeleteImages: Dispatch<StateUpdater<boolean>>;
}) => {
	const [isLandscape, setIsLandscape] = useState(false);
	const [iconColor, setIconColor] = useState("text-white");
	const [loading, setLoading] = useState(true); // Loading state for image

	const handleImageLoad = (e: Event) => {
		const img = e.target as HTMLImageElement;
		const aspectRatio = img.naturalWidth / img.naturalHeight;
		setIsLandscape(aspectRatio > 1);

		// Detect background color at icon position
		detectBackgroundColor(img, setIconColor);

		setLoading(false); // Hide skeleton when image loads
	};

	const handleCheckboxChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const currentSelected = selectingImagesSignal.value.selectedItems;

		if (target.checked) {
			// Add to selection
			selectingImagesSignal.value = {
				...selectingImagesSignal.value,
				selectedItems: [...currentSelected, props.image.id],
			};
		} else {
			// Remove from selection
			selectingImagesSignal.value = {
				...selectingImagesSignal.value,
				selectedItems: currentSelected.filter((id) => id !== props.image.id),
			};
		}
	};

	return (
		<div
			ref={props.isLastItem ? props.observerRef : null}
			class={cn("h-40 relative", {
				"col-span-2": isLandscape,
			})}
		>
			{selectingImagesSignal.value.isSelecting ? (
				<label class="absolute top-1.5 left-1.5 cursor-pointer group">
					<input
						type="checkbox"
						onChange={handleCheckboxChange}
						class="sr-only"
					/>
					<div class="border size-4.5 flex items-center justify-center transition-colors border-line-500 bg-white/40 group-has-[:checked]:border-primary group-has-[:checked]:bg-primary">
						<Icon
							icon="heroicons:check-20-solid"
							className="text-white h-3.5 w-3.5 opacity-0 transition-opacity group-has-[:checked]:opacity-100"
						/>
					</div>
				</label>
			) : (
				<Popover>
					<PopoverTrigger asChild>
						<button class="absolute top-3 left-2">
							<Icon
								icon="pepicons-pencil:dots-x"
								className={iconColor}
							/>
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-40 flex flex-col items-stretch border-line-400 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg bg-white/70 rounded-sm">
						<ul class="flex flex-col gap-3">
							<button
								onClick={() => {
									props.setSelectedImages(() => [props.image.id]);
									props.setAddToFolder(true);
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
								type="button"
								class="flex items-center gap-2 hover:bg-secondary cursor-pointer justify-between"
							>
								<p class="font-medium text-sm">Add Details</p>
								<div class="p-1 min-w-5">
									<Icon
										icon="iconamoon:screen-full-light"
										className="h-4 w-4 text-black"
									/>
								</div>
							</button>
							<button
								onClick={() => {
									props.setSelectedImages(() => [props.image.id]);
									props.setDeleteImages(true);
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
							<li class="flex items-center gap-2 hover:bg-secondary cursor-pointer justify-between">
								<p class="font-medium text-sm">Uploaded</p>
								<span class="text-sm">
									{new Intl.DateTimeFormat("en-GB", {
										day: "2-digit",
										month: "2-digit",
										year: "2-digit",
									}).format(new Date(props.image.created_at))}
								</span>
							</li>
						</ul>
					</PopoverContent>
				</Popover>
			)}

			{loading && (
				<Skeleton class="absolute inset-0 h-full w-full rounded-none" />
			)}

			<img
				src={props.image.url}
				alt={props.image.file_name}
				onLoad={handleImageLoad}
				class={cn(
					"w-full h-full object-cover transition-opacity duration-300",
					loading ? "opacity-0" : "opacity-100"
				)}
				crossOrigin="anonymous"
			/>
		</div>
	);
};

const EmptyGallery = () => (
	<div class="flex flex-col flex-1 justify-center items-center gap-4">
		<div class="flex flex-col gap-4 items-center">
			<h2 class="leading-0 text-2xl">No works to show.</h2>
			<p class="text-grey-500 font-medium text-sm">
				Upload your best works from your gallery
			</p>
		</div>
		<button class="flex items-center gap-2 py-2">
			<p class="font-medium text-sm">Upload</p>
			<Icon
				icon="iconoir:upload"
				className="h-5 w-5 text-black"
			/>
		</button>
	</div>
);

const detectBackgroundColor = (
	img: HTMLImageElement,
	setIconColor: Dispatch<StateUpdater<string>>
) => {
	try {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) return;

		// Set canvas size to image size
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;

		// Draw image on canvas
		ctx.drawImage(img, 0, 0);

		// Sample area where the icon will be (top-left corner)
		// Sample a small region around the icon position
		const sampleX = Math.floor(img.naturalWidth * 0.05); // 5% from left
		const sampleY = Math.floor(img.naturalHeight * 0.1); // 10% from top
		const sampleSize = 20;

		const imageData = ctx.getImageData(
			sampleX,
			sampleY,
			sampleSize,
			sampleSize
		);
		const data = imageData.data;

		// Calculate average color
		let r = 0,
			g = 0,
			b = 0;
		const pixelCount = data.length / 4;

		for (let i = 0; i < data.length; i += 4) {
			r += data[i];
			g += data[i + 1];
			b += data[i + 2];
		}

		r = Math.floor(r / pixelCount);
		g = Math.floor(g / pixelCount);
		b = Math.floor(b / pixelCount);

		// Calculate perceived brightness using relative luminance formula
		const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		// If background is light (bright), use black icon, otherwise use white
		setIconColor(brightness > 0.6 ? "text-black" : "text-white");
	} catch (error) {
		console.error("Error detecting background color:", error);
		// Fallback to white if detection fails
		setIconColor("text-white");
	}
};
