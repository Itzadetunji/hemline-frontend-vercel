import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import type { Folder } from "@/api/http/v1/gallery/folders.types";
import { useDeleteFolder } from "@/api/http/v1/gallery/folders.hooks";
import { selectingSignal } from "@/layout/Header";
import toast from "react-hot-toast";

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFolder: Folder | null;
}

export const DeleteFolderDialog = (props: DeleteFolderDialogProps) => {
  const deleteFolder = useDeleteFolder();

  const handleDelete = async () => {
    const foldersToDelete =
      selectingSignal.value.isSelecting && selectingSignal.value.selectedItems.length > 0
        ? selectingSignal.value.selectedItems
        : props.selectedFolder
          ? [props.selectedFolder.id]
          : [];

    if (foldersToDelete.length === 0) {
      toast.error("No folders selected");
      return;
    }

    // Delete folders one by one
    Promise.all(foldersToDelete.map((folderId) => deleteFolder.mutateAsync(folderId)))
      .then(() => {
        toast.success(`${foldersToDelete.length} folder${foldersToDelete.length > 1 ? "s" : ""} deleted successfully`);
        props.onOpenChange(false);
        selectingSignal.value = {
          isSelecting: false,
          selectedItems: [],
        };
      })
      .catch((error) => {
        console.error("Error deleting folders:", error);
        toast.error("Failed to delete folders");
      });
  };

  const selectedCount = selectingSignal.value.isSelecting && selectingSignal.value.selectedItems.length > 0 ? selectingSignal.value.selectedItems.length : 1;

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (deleteFolder.isPending) return;
        props.onOpenChange(open);
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
              Delete {selectedCount} selected folder{selectedCount > 1 && "s"}
            </p>
            <p class="font-medium text-sm">This is permanent, all works will be deleted here and on all active links sent to client.</p>
          </div>
          <DialogFooter class="flex flex-row-reverse justify-stretch gap-3">
            <Button class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={() => props.onOpenChange(false)} disabled={deleteFolder.isPending}>
              Keep
            </Button>

            <Button variant="outline" class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={handleDelete} disabled={deleteFolder.isPending}>
              {deleteFolder.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
