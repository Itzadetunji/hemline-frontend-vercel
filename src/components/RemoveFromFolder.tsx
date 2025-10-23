import { useRemoveImagesFromFolder } from "@/api/http/v1/gallery/folders.hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { selectingSignal } from "@/layout/Header";
import { Icon } from "@iconify/react";
import type { Dispatch, StateUpdater } from "preact/hooks";
import toast from "react-hot-toast";

interface RemoveFromFolderProps {
  folderId: string;
  folderName?: string;
  image_ids?: string[];
  removeFromFolder: boolean;
  setRemoveFromFolder: Dispatch<StateUpdater<boolean>>;
}

export const RemoveFromFolder = (props: RemoveFromFolderProps) => {
  const removeImagesMutation = useRemoveImagesFromFolder();

  const handleRemove = async () => {
    if (!props.image_ids || props.image_ids.length === 0) {
      toast.error("No images selected");
      return;
    }

    await removeImagesMutation.mutateAsync(
      {
        id: props.folderId,
        data: { image_ids: props.image_ids },
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Image(s) removed from folder successfully");
          selectingSignal.value = {
            isSelecting: false,
            selectedItems: [],
          };
          props.setRemoveFromFolder(false);
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.error || "Failed to remove images from folder";
          toast.error(errorMessage);
        },
      }
    );
  };

  const imageCount = props.image_ids?.length || 0;

  return (
    <Dialog
      open={props.removeFromFolder}
      onOpenChange={(open) => {
        if (removeImagesMutation.isPending) return;
        props.setRemoveFromFolder(open);
      }}
    >
      <DialogContent showClose={false} class="flex flex-col gap-8 rounded-none">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <DialogClose>
              <Icon icon="ix:cancel" fontSize={16} />
            </DialogClose>
            <p class="font-medium text-sm">Remove from Folder</p>
          </div>
        </DialogHeader>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4">
            <p class="!font-primary text-2xl leading-6">
              Remove {imageCount} image{imageCount > 1 && "s"} from {props.folderName || "this folder"}
            </p>
            <p class="font-medium text-sm">{imageCount > 1 ? "These images" : "This image"} will be removed from the folder but will still be available in your gallery.</p>
          </div>
          <DialogFooter class="flex flex-row-reverse justify-stretch gap-3">
            <Button class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={() => props.setRemoveFromFolder(false)} disabled={removeImagesMutation.isPending}>
              Cancel
            </Button>

            <Button variant="outline" class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={handleRemove} disabled={removeImagesMutation.isPending}>
              {removeImagesMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
