import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { Dispatch, StateUpdater, useLayoutEffect } from "preact/hooks";
import { Label } from "./ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	CreateFolderSchema,
	type CreateFolderPayload,
	type FolderColor,
} from "@/api/http/v1/gallery/folders.types";
import { RadioGroup } from "./ui/radio-group";
import { cn } from "@/lib/utils";
import { useCreateFolder } from "@/api/http/v1/gallery/folders.hooks";

interface AddToNewFolderProps {
	addToNewFolder: boolean;
	image_ids?: string[];
	setAddToFolder: Dispatch<StateUpdater<boolean>>;
	setHasUploaded: Dispatch<StateUpdater<boolean>>;
	setAddToNewFolder: Dispatch<StateUpdater<boolean>>;
	setProgressSuccess: Dispatch<StateUpdater<boolean>>;
}

export const AddToNewFolder = (props: AddToNewFolderProps) => {
	const createFolderMutation = useCreateFolder();
	const randomColor = Math.floor(Math.random() * 9);
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		getValues,
	} = useForm<CreateFolderPayload>({
		resolver: zodResolver(CreateFolderSchema) as any,
		defaultValues: {
			folder: {
				folder_color: randomColor,
				name: "",
			},
		},
	});

	const onSubmit = async (formData: CreateFolderPayload) => {
		// Store the color preference locally if needed
		// For now, we'll just submit the folder name and description
		// The color can be stored in description or handled separately

		const payload = {
			...formData,
			folder: {
				...formData.folder,
				folder_color: formData.folder.folder_color + 1,
			},
			image_ids: props.image_ids || [],
		};

		console.log(payload);
		await createFolderMutation.mutateAsync(payload, {
			onSuccess: () => {
				props.setAddToNewFolder(false);
				props.setHasUploaded(false);
				props.setProgressSuccess(false);
				reset();
			},
			onError: (error) => {
				console.error("Error creating folder:", error);
			},
		});
	};

	return (
		<Dialog
			open={props.addToNewFolder}
			onOpenChange={(open) => {
				if (createFolderMutation.isPending) return;
				props.setAddToNewFolder(open);
				if (!open) reset();
			}}
		>
			<DialogContent
				showClose={false}
				class="flex flex-col gap-8"
			>
				<DialogHeader class="p-0">
					<div class="flex items-center gap-2">
						<button
							type="button"
							onClick={() => {
								props.setAddToNewFolder(false);
								props.setAddToFolder(true);
							}}
						>
							<Icon
								icon="solar:arrow-left-linear"
								className="size-6"
							/>
						</button>
						<p class="text-base font-medium">New folder</p>
					</div>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(onSubmit)(e as any);
					}}
					class="flex flex-col gap-6"
				>
					<Label class="flex flex-col gap-4 items-stretch">
						<p>Folder name</p>
						<Controller
							name="folder.name"
							control={control}
							render={({ field }) =>
								(
									<div class="flex flex-col gap-2">
										<div class="flex items-center gap-2 border-line-700 border h-10.5 px-3">
											<Icon
												icon="bi:folder"
												fontSize="18"
												className="flex-shrink-0"
											/>
											<input
												{...field}
												placeholder="Wedding works"
												class="text-sm placeholder:text-grey-400 flex-1 min-w-0"
											/>
										</div>
										{errors.folder?.name && (
											<p class="text-xs text-red-500">
												{errors.folder?.name.message}
											</p>
										)}
									</div>
								) as any
							}
						/>
					</Label>
					<Label class="flex flex-col gap-4 items-stretch">
						<p>Choose a folder color</p>
						<Controller
							name="folder.folder_color"
							control={control}
							render={({ field }) =>
								(
									<div class="flex flex-col gap-2">
										<RadioGroup
											options={colors.map((_, index) => index)}
											value={field.value}
											onChange={(selectedIndex) =>
												field.onChange(selectedIndex)
											}
											className="flex flex-wrap gap-3"
											optionClassName="p-0 h-auto border-0"
											selectedClassName=""
											unselectedClassName=""
											name="folder-color-selector"
											renderOption={(colorIndex: number, isSelected) => (
												<div
													class={cn(
														"size-8 rounded-full cursor-pointer transition-all",
														{
															"ring-2 ring-primary ring-offset-2": isSelected,
														}
													)}
													style={{
														background: `linear-gradient(to bottom, ${colors[colorIndex].start} 0%, ${colors[colorIndex].end} 100%)`,
													}}
												/>
											)}
										/>
										{errors.folder?.folder_color && (
											<p class="text-xs text-red-500">
												{errors.folder?.folder_color.message}
											</p>
										)}
									</div>
								) as any
							}
						/>
					</Label>
					<DialogFooter class="flex flex-col gap-3 items-stretch">
						<Button
							class="text-sm font-medium py-3.5"
							type="submit"
							disabled={createFolderMutation.isPending}
						>
							{createFolderMutation.isPending ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

const colors = [
	{ start: "#73D7FF", end: "#6BCBF3" },
	{ start: "#72E2AD", end: "#3FCD89" },
	{ start: "#7CF08E", end: "#56DF6B" },
	{ start: "#FCDB65", end: "#FFD53E" },
	{ start: "#FBBC66", end: "#FFAD3E" },
	{ start: "#FF847C", end: "#FF685F" },
	{ start: "#CA81E4", end: "#B351D6" },
	{ start: "#C6C6C6", end: "#9B9E9F" },
	{ start: "#575757", end: "#323232" },
];
