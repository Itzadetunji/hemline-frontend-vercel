import { useDeleteImages } from "@/api/http/v1/gallery/gallery.hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { selectingImagesSignal } from "@/layout/Header";
import { Icon } from "@iconify/react";
import type { Dispatch, StateUpdater } from "preact/hooks";
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
          toast.success(data.message || `${data.count} image(s) deleted successfully`);
          selectingImagesSignal.value = {
            isSelecting: false,
            selectedItems: [],
          };
          props.setDeleteImages(false);
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.error || "Failed to delete images";
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
      <DialogContent showClose={false} class="flex flex-col gap-8">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <DialogClose>
              <Icon icon="ix:cancel" fontSize={16} />
            </DialogClose>
            <p class="font-medium text-sm">Delete</p>
          </div>
        </DialogHeader>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4">
            <p class="!font-primary text-2xl leading-0">
              Delete {imageCount} selected work{imageCount > 1 && "s"}
            </p>
            <p class="font-medium text-sm">This is permanent, all works will be deleted here and on all active links sent to client.</p>
          </div>
          <DialogFooter class="flex flex-row-reverse justify-stretch gap-3">
            <Button class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={() => props.setDeleteImages(false)} disabled={deleteImagesMutation.isPending}>
              Keep
            </Button>

            <Button variant="outline" class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={handleDelete} disabled={deleteImagesMutation.isPending}>
              {deleteImagesMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
