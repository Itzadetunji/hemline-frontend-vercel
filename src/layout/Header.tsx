import { signal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { useLocation } from "preact-iso";
import { useRef, useState } from "preact/hooks";
import { Icon } from "@iconify/react";

import { useUploadImages } from "@/api/http/v1/gallery/gallery.hooks";
import { AddToExistingFolder } from "@/components/AddToExistingFolder";
import { AddToNewFolder } from "@/components/AddToNewFolder";
import { SelectIcon } from "@/components/svg-icons/select-icon";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Signal for header content that can be accessed anywhere
export const headerContentSignal = signal<ComponentChildren>("Gallery");

export const Header = () => {
	return (
		<header class="flex items-center gap-2 justify-between pt-4 sticky top-0 z-50 bg-white px-4 pb-3">
			<h1 class="text-black text-[2rem] text-3xl ">
				{headerContentSignal.value}
			</h1>
			<ul class="flex-1 flex items-center justify-end gap-3">
				<li>
					<button
						onClick={() => {}}
						class="p-1"
					>
						<SelectIcon class="h-4 w-4 fill-black" />
					</button>
				</li>
				<UploadImages />
				<li>
					<button
						onClick={() => {}}
						class="p-1"
					>
						<Icon
							icon="bi:folder"
							className="h-4 w-4 text-black"
						/>
					</button>
				</li>
				<a href="/profile">
					<li class="rounded-full size-9 -9 w-9 overflow-hidden">
						<img
							src="https://placehold.co/36x36"
							alt=""
						/>
					</li>
				</a>
			</ul>
		</header>
	);
};

const UploadImages = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [totalFiles, setTotalFiles] = useState(0);
	const [hasUploaded, setHasUploaded] = useState(true);
	const [showProgressSuccess, setProgressSuccess] = useState(true);
	const [addToFolder, setAddToFolder] = useState(false);
	const [addToNewFolder, setAddToNewFolder] = useState(false);
	const [addToExistingFolder, setAddToExistingFolder] = useState(true);

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

				await uploadImagesMutation.mutateAsync(formData);

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
					class="p-1"
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

								<Dialog
									open={addToFolder}
									onOpenChange={setAddToFolder}
								>
									<DialogTrigger asChild>
										<button class="flex items-center gap-1.5 bg-secondary-500 py-1.5 px-3">
											<p class="leading-09">Add To Folder</p>
											<Icon icon="si:add-duotone" />
										</button>
									</DialogTrigger>
									<DialogContent
										showClose={false}
										class="flex flex-col gap-8"
									>
										<DialogHeader class="p-0">
											<div class="flex items-center gap-2">
												<DialogClose>
													<Icon
														icon="ix:cancel"
														fontSize={16}
													/>
												</DialogClose>
												<p class="text-sm font-medium">Add to folder</p>
											</div>
										</DialogHeader>
										<div class="flex flex-col gap-6">
											<div class="flex flex-col gap-4">
												<p class="!font-primary text-2xl leading-0">
													Create Collection
												</p>
												<p class="font-medium text-sm">
													Keep your works organized by adding them to folders
												</p>
											</div>
											<DialogFooter class="flex flex-col gap-3 items-stretch">
												<Button
													variant="outline"
													class="text-sm font-medium py-3.5"
													type="button"
													onClick={() => {
														setAddToFolder(false);
														setAddToExistingFolder(true);
													}}
												>
													Add To Exisiting Folder
												</Button>

												<Button
													class="text-sm font-medium py-3.5"
													type="button"
													onClick={() => {
														setAddToFolder(false);
														setAddToNewFolder(true);
													}}
												>
													Create New Folder
												</Button>
											</DialogFooter>
										</div>
									</DialogContent>
								</Dialog>

								{addToNewFolder && (
									<AddToNewFolder
										image_ids={uploadImagesMutation.data?.data.map(
											(item) => item.id
										)}
										setHasUploaded={setHasUploaded}
										setAddToFolder={setAddToFolder}
										addToNewFolder={addToNewFolder}
										setAddToNewFolder={setAddToNewFolder}
										setProgressSuccess={setProgressSuccess}
									/>
								)}
							</>
						)}
					</div>
				)}
			</div>
			{addToExistingFolder && (
				<AddToExistingFolder
					image_ids={uploadImagesMutation.data?.data.map((item) => item.id)}
					setAddToExistingFolder={setAddToExistingFolder}
					setHasUploaded={setHasUploaded}
					setAddToFolder={setAddToFolder}
					setProgressSuccess={setProgressSuccess}
				/>
			)}
		</>
	);
};

const Tabs = ["gallery", "clients", "folders"];
type Tab = (typeof Tabs)[number];

export const NavBar = () => {
	const location = useLocation();

	const [activeNavBar, setActiveNavBar] = useState("gallery");

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
