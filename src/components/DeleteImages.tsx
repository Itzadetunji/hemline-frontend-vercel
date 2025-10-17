import { useDeleteImages } from "@/api/http/v1/gallery/gallery.hooks";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { Dispatch, StateUpdater } from "preact/hooks";
import toast from "react-hot-toast";

interface DeleteImagesProps {
	image_ids?: string[];
	deleteImages: boolean;
	setDeleteImages: Dispatch<StateUpdater<boolean>>;
}

export const DeleteImages = (props: DeleteImagesProps) => {
	const deleteImagesMutation = useDeleteImages();

	const handleDelete = async () => {
		if (!props.image_ids || props.image_ids.length === 0) {
			toast.error("No images selected");
			return;
		}

		await deleteImagesMutation.mutateAsync(
			{ image_ids: props.image_ids },
			{
				onSuccess: (data) => {
					toast.success(
						data.message || `${data.count} image(s) deleted successfully`
					);
					props.setDeleteImages(false);
				},
				onError: (error) => {
					const errorMessage =
						error.response?.data?.error || "Failed to delete images";
					toast.error(errorMessage);
				},
			}
		);
	};

	const imageCount = props.image_ids?.length || 0;

	return (
		<Dialog
			open={props.deleteImages}
			onOpenChange={(open) => {
				if (deleteImagesMutation.isPending) return;
				props.setDeleteImages(open);
			}}
		>
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
						<p class="text-sm font-medium">Delete</p>
					</div>
				</DialogHeader>
				<div class="flex flex-col gap-6">
					<div class="flex flex-col gap-4">
						<p class="!font-primary text-2xl leading-0">
							Delete {imageCount} selected work{imageCount > 1 && "s"}
						</p>
						<p class="font-medium text-sm">
							This is permanent, all works will be deleted here and on all
							active links sent to client.
						</p>
					</div>
					<DialogFooter class="flex flex-row-reverse gap-3 justify-stretch">
						<Button
							class="text-sm font-medium py-3.5 flex-1"
							type="button"
							onClick={() => props.setDeleteImages(false)}
							disabled={deleteImagesMutation.isPending}
						>
							Keep
						</Button>

						<Button
							variant="outline"
							class="text-sm font-medium py-3.5 flex-1"
							type="button"
							onClick={handleDelete}
							disabled={deleteImagesMutation.isPending}
						>
							{deleteImagesMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
};
