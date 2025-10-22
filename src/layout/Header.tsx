import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import { useRef, useState } from "preact/hooks";

import { useUploadImages } from "@/api/http/v1/gallery/gallery.hooks";
import { AddToFolder } from "@/components/AddToFolder";
import { DeleteImages } from "@/components/DeleteImages";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import toast from "react-hot-toast";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { get } from "http";

// Signal for header content that can be accessed anywhere
export const headerContentSignal = signal<string>("Gallery");
export const selectingImagesSignal = signal<{
	isSelecting: boolean;
	selectedItems: string[];
}>({
	isSelecting: false,
	selectedItems: [],
});

export const Header = () => {
	const getUserProfile = useGetUserProfile();

	return (
		<header class="flex items-center gap-2 justify-between pt-4 sticky top-0 z-50 bg-white px-4 pb-3">
			<h1 class="text-black text-[2rem] text-3xl ">
				{headerContentSignal.value}
			</h1>
			<ul class="flex-1 flex items-center justify-end gap-3">
				<button
					class="flex items-center gap-1.5"
					type="button"
					onClick={() => {
						selectingImagesSignal.value = {
							selectedItems: [],
							isSelecting: !selectingImagesSignal.value.isSelecting,
						};
					}}
				>
					<div class="p-1 min-w-5 min-h-5">
						<Icon
							icon="gala:select"
							className="h-4 w-4 text-black"
						/>
					</div>
					{selectingImagesSignal.value.isSelecting && (
						<p class="text-sm font-medium">
							Deselect ({selectingImagesSignal.value.selectedItems.length})
						</p>
					)}
				</button>
				<UploadImages />
				<li>
					<button
						onClick={() => {}}
						class="p-1 relative min-w-5 min-h-5"
					>
						<Icon
							icon="bi:folder"
							className="h-4 w-4 text-black"
						/>
						<p class="text-white -top-0.5 -right-0.5 leading-0 text-[0.625rem] absolute min-w-3.5 min-h-3.5 bg-primary rounded-full grid place-content-center">
							{getUserProfile.data?.data.user.total_folders || 0}
						</p>
					</button>
				</li>
				<a href="/profile">
					<li class="rounded-full size-9 -9 w-9 overflow-hidden">
						<img
							src={getUserProfile.data?.data.user.business_image}
							alt=""
						/>
						<Avatar>
							{
								(
									<AvatarImage
										src={getUserProfile.data?.data.user.business_image}
									/>
								) as any
							}
							<AvatarFallback>
								{getUserProfile.data?.data.user.full_name
									? getInitials(getUserProfile.data?.data.user.full_name, true)
									: getInitials(getUserProfile.data?.data.user.email as string)}
							</AvatarFallback>
						</Avatar>
					</li>
				</a>
			</ul>
		</header>
	);
};

const UploadImages = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [totalFiles, setTotalFiles] = useState(0);
	const [hasUploaded, setHasUploaded] = useState(false);
	const [addToFolder, setAddToFolder] = useState(false);
	const [showProgressSuccess, setProgressSuccess] = useState(false);

	const uploadImagesMutation = useUploadImages();

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		const files = target.files;

		if (files && files.length > 0) {
			setTotalFiles(files.length);

			const formData = new FormData();

			// Add all files to FormData
			for (let i = 0; i < files.length; i++) {
				formData.append("images", files[i]);
			}

			try {
				setProgressSuccess(true);

				await uploadImagesMutation.mutateAsync(formData, {
					onError: () => setProgressSuccess(false),
				});

				setHasUploaded(true);
			} catch (error) {
				console.error("Upload failed:", error);
			}

			// Reset input
			target.value = "";
		}
	};

	// Calculate uploaded count based on progress
	const uploadedCount = Math.floor(
		(uploadImagesMutation.progress / 100) * totalFiles
	);

	return (
		<>
			<li>
				<button
					onClick={handleButtonClick}
					class="p-1 min-w-5"
					disabled={uploadImagesMutation.isPending}
				>
					<Icon
						icon="iconoir:upload"
						className="h-4 w-4 text-black"
					/>
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					disabled={uploadImagesMutation.isPending}
					class="hidden"
					onChange={handleFileChange}
				/>
			</li>

			<div class="fixed flex flex-col items-center z-50 w-full -mx-4 bottom-20">
				{showProgressSuccess && (
					<div class="bg-white border-t-line-500 border p-2 flex items-center gap-3">
						{uploadImagesMutation.isPending && (
							<>
								<div class="flex items-center gap-2 border-r border-r-line-500 pr-2">
									<p class="leading-0">Uploading</p>
									<Icon
										icon="iconoir:upload"
										className="h-4 w-4 text-black"
									/>
								</div>

								<div class="flex items-center gap-1.5">
									<p class="text-sm font-medium">
										{uploadedCount}{" "}
										<span class="text-grey-500">/{totalFiles}</span>
									</p>
									<div class="flex-1 bg-secondary flex h-1.5 w-16">
										<div
											class="bg-primary duration-200 ease-in-out transition-all"
											style={{
												width: `${uploadImagesMutation.progress}%`,
											}}
										/>
									</div>
									<p class="text-sm font-medium">
										{Math.round(uploadImagesMutation.progress)}%
									</p>
								</div>
							</>
						)}

						{hasUploaded && (
							<>
								<div class="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setHasUploaded(false)}
									>
										<Icon
											icon="ix:cancel"
											fontSize={14}
										/>
									</button>
									<p class="text-grey-500 text-sm">+{totalFiles} Uploaded</p>
								</div>

								<AddToFolder
									image_ids={
										uploadImagesMutation.data?.data.map((img) => img.id) || []
									}
									addToFolder={addToFolder}
									setHasUploaded={setHasUploaded}
									setProgressSuccess={setProgressSuccess}
									setAddToFolder={setAddToFolder}
									showAddFolderButton
								/>
							</>
						)}
					</div>
				)}
			</div>
		</>
	);
};

const Tabs = ["gallery", "clients", "folders"];
type Tab = (typeof Tabs)[number];

export const NavBar = () => {
	const [activeNavBar, setActiveNavBar] = useState("gallery");

	if (selectingImagesSignal.value.isSelecting) return <AddToFolderBar />;

	return (
		<ul class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-line-500 flex items-center p-0.5">
			{Tabs.map((tab) => (
				<NavbarCard
					tab={tab}
					activeNavBar={activeNavBar}
					setActiveNavBar={setActiveNavBar}
				/>
			))}
		</ul>
	);
};

const NavbarCard = (props: {
	tab: Tab;
	activeNavBar: string;
	setActiveNavBar: React.Dispatch<React.SetStateAction<string>>;
}) => {
	return (
		<a href={`/${props.tab}`}>
			<li
				class={cn(
					"capitalize bg-primary py-2.5 text-white px-4 transition-colors",
					{
						"bg-transparent text-grey-500": props.activeNavBar !== props.tab,
					}
				)}
			>
				{props.tab}
			</li>
		</a>
	);
};

export const AddToFolderBar = () => {
	const [addToFolder, setAddToFolder] = useState(false);
	const [deleteImages, setDeleteImages] = useState(false);

	const handleAddToFolder = () => {
		if (selectingImagesSignal.value.selectedItems.length === 0) {
			toast("Please select at least one image", {
				style: {
					border: "1px solid var(--primary)",
					padding: "4px 4px",
					color: "var(--primary)",
					borderRadius: "0px",
				},
				icon: null,
			});
			return;
		}
		setAddToFolder(true);
	};

	const handleDeleteImages = () => {
		if (selectingImagesSignal.value.selectedItems.length === 0) {
			toast("Please select at least one image to delete", {
				style: {
					border: "1px solid var(--primary)",
					padding: "4px 4px",
					color: "var(--primary)",
					borderRadius: "0px",
				},
				icon: null,
			});
			return;
		}
		setDeleteImages(true);
	};

	return (
		<>
			<ul class="fixed bottom-6 left-1/2 -translate-x-1/2 border border-line-500 flex items-center gap-0">
				<Button
					class="capitalize py-2.5 text-black px-4 gap-1"
					variant="secondary"
					onClick={handleAddToFolder}
				>
					<div class="min-w-4.5">
						<Icon
							icon="si:add-duotone"
							className="size-4.5"
						/>
					</div>
					<p class="leading-0">Add To Folder</p>
				</Button>
				<Button
					class="capitalize py-2.5 text-destructive px-4 bg-white hover:bg-white/80 -ml-0.5 gap-1.5"
					onClick={handleDeleteImages}
				>
					<div class="min-w-4.5">
						<Icon
							icon="material-symbols-light:delete-outline-sharp"
							className="h-4.5 w-4.5"
						/>
					</div>
					<p class="leading-0">Delete</p>
				</Button>
			</ul>

			<AddToFolder
				image_ids={selectingImagesSignal.value.selectedItems}
				addToFolder={addToFolder}
				setAddToFolder={setAddToFolder}
			/>

			<DeleteImages
				image_ids={selectingImagesSignal.value.selectedItems}
				deleteImages={deleteImages}
				setDeleteImages={setDeleteImages}
			/>
		</>
	);
};
