import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { Dispatch, StateUpdater } from "preact/hooks";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
	useAddImagesToFolder,
	useGetFolders,
} from "@/api/http/v1/gallery/folders.hooks";
import type { Folder } from "@/api/http/v1/gallery/folders.types";
import { Button } from "./ui/button";
import { CheckboxGroup } from "./ui/checkbox-group";
import toast from "react-hot-toast";

// Zod schema for form validation
const AddToExistingFolderSchema = z.object({
	folder_ids: z.array(z.uuid()).min(1, "Please select at least one folder"),
});

type AddToExistingFolderFormData = z.infer<typeof AddToExistingFolderSchema>;

interface AddToExistingFolderProps {
	image_ids?: string[];
	setHasUploaded?: Dispatch<StateUpdater<boolean>>;
	setAddToFolder: Dispatch<StateUpdater<boolean>>;
	setAddToExistingFolder: Dispatch<StateUpdater<boolean>>;
	setProgressSuccess?: Dispatch<StateUpdater<boolean>>;
}

export const AddToExistingFolder = (props: AddToExistingFolderProps) => {
	const getFoldersQuery = useGetFolders({ per_page: 100 });
	const addImagesToFolderMutation = useAddImagesToFolder();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
		reset,
		setError,
	} = useForm<AddToExistingFolderFormData>({
		resolver: zodResolver(AddToExistingFolderSchema) as any,
		defaultValues: {
			folder_ids: [],
		},
	});

	const onSubmit = async (formData: AddToExistingFolderFormData) => {
		if (!props.image_ids || props.image_ids.length === 0) {
			console.error("No images to add");
			return;
		}

		// Use the first folder ID as the endpoint parameter
		const firstFolderId = formData.folder_ids[0];

		const payload = {
			image_ids: props.image_ids,
			folder_ids: formData.folder_ids,
		};

		await addImagesToFolderMutation.mutateAsync(
			{
				id: firstFolderId,
				data: payload,
			},
			{
				onSuccess: () => {
					toast.success("Images added to folder", {
						style: {
							border: "1px solid var(--primary)",
							padding: "4px 4px",
							color: "var(--primary)",
							borderRadius: "0px",
						},
						icon: null,
					});
					props.setAddToExistingFolder(false);
					props.setHasUploaded?.(false);
					props.setProgressSuccess?.(false);
					reset();
				},
				onError: (error) => {
					toast.error(
						error.response?.data.errors?.[0] ||
							"Error adding images to folders",
						{
							style: {
								border: "1px solid var(--primary)",
								padding: "4px 4px",
								color: "var(--primary)",
								borderRadius: "0px",
							},
							icon: null,
						}
					);
					setError("folder_ids", {
						message:
							error.response?.data.errors?.[0] ||
							"Error adding images to folders",
					});
					console.error("Error adding images to folder:", error);
				},
			}
		);
	};

	const handleFormSubmit = (e: Event) => {
		e.preventDefault();
		handleSubmit(onSubmit)(e as any);
	};

	return (
		<div class="fixed flex flex-col z-50 w-screen -translate-x-1/2 left-1/2 h-[100dvh] justify-end items-center inset-0 mx-0 px-0 bg-black/50">
			<form
				onSubmit={handleFormSubmit}
				class="flex flex-col border-t border-t-line-500 rounded-t-2xl bg-white z-50 top-24 py-6 px-4 flex-1 gap-8 mt-24 w-full"
			>
				<div class="relative flex items-center justify-center">
					<button
						type="button"
						class="absolute left-0 top-1/2 -translate-y-1/2"
						onClick={() => {
							props.setAddToFolder(true);
							props.setAddToExistingFolder(false);
						}}
					>
						<Icon
							icon="solar:arrow-left-linear"
							className="size-6"
						/>
					</button>
					<p class="text-base font-semibold">Add to existing folder</p>
				</div>

				<div class="flex flex-col flex-1 gap-4">
					{getFoldersQuery.isLoading ? (
						<div class="flex items-center justify-center flex-1">
							<img
								src="/assets/brand/logo.svg"
								class="animate-pulse"
								alt="Brand Logo"
							/>
						</div>
					) : !getFoldersQuery.data ||
					  getFoldersQuery.data.data.length === 0 ? (
						<div class="flex flex-col items-center justify-center flex-1 gap-2">
							<Icon
								icon="bi:folder"
								fontSize={48}
								className="text-grey-400"
							/>
							<p class="text-grey-500 text-center">
								No folders available. Create one first!
							</p>
						</div>
					) : (
						<Controller
							name="folder_ids"
							control={control}
							render={({ field }) =>
								(
									<div class="flex flex-col gap-4 flex-1">
										<CheckboxGroup
											options={getFoldersQuery.data.data.map(
												(folder) => folder.id
											)}
											value={field.value}
											onChange={field.onChange}
											className="grid grid-cols-3 gap-4 flex-1 content-start place-items-center-safe"
											optionClassName="p-0 h-auto border-0 bg-transparent"
											selectedClassName=""
											unselectedClassName=""
											renderOption={(folderId: string, isSelected: boolean) => {
												const folder = getFoldersQuery.data.data.find(
													(f) => f.id === folderId
												);
												if (!folder) return null;
												return (
													<FolderCard
														folder={folder}
														isSelected={isSelected}
													/>
												);
											}}
										/>
										{errors.folder_ids && (
											<p class="text-xs text-red-500">
												{errors.folder_ids.message}
											</p>
										)}
									</div>
								) as any
							}
						/>
					)}

					<Button
						class="w-full gap-3"
						type="submit"
						disabled={
							isSubmitting ||
							addImagesToFolderMutation.isPending ||
							getFoldersQuery.isLoading ||
							!getFoldersQuery.data ||
							getFoldersQuery.data.data.length === 0 ||
							!isValid
						}
					>
						{isSubmitting || addImagesToFolderMutation.isPending
							? "Adding..."
							: "Add to Folders"}
					</Button>
				</div>
			</form>
		</div>
	);
};

interface FolderCardProps {
	folder: Folder;
	isSelected: boolean;
}

const FolderCard = (props: FolderCardProps) => {
	const folderIconNumber = props.folder.folder_color
		? props.folder.folder_color
		: Math.floor(Math.random() * 9);
	const itemCount = props.folder.image_ids?.length || 0;

	return (
		<figure class="flex flex-col items-center gap-1 overflow-hidden">
			<div class="relative overflow-hidden">
				<img
					src={`/assets/folder-icons/folder-${folderIconNumber}.png`}
					alt={props.folder.name}
					class="w-17.25 h-15.5"
				/>
				{props.folder.cover_image && (
					<img
						src={props.folder.cover_image}
						alt={props.folder.name}
						class="bg-[red] w-11 h-8 absolute top-6 left-1/2 -translate-x-1/2 object-cover"
					/>
				)}
			</div>
			<figcaption class="text-center w-full">
				<p class="truncate max-w-[10ch] text-sm font-medium">
					{props.folder.name}
				</p>
				<div class="flex items-center gap-3 justify-center">
					<p class="text-xs text-grey-500 leading-4">
						{itemCount} {itemCount === 1 ? "item" : "items"}
					</p>
					<div class="rounded-full border border-line-500 size-4.5 grid place-content-center">
						{props.isSelected && (
							<div class="size-4 bg-primary rounded-full flex items-center justify-center">
								<Icon
									icon="charm:tick"
									className="text-white size-3"
								/>
							</div>
						)}
					</div>
				</div>
			</figcaption>
		</figure>
	);
};
