import { useUpdateFolder } from "@/api/http/v1/gallery/folders.hooks";
import type { Folder } from "@/api/http/v1/gallery/folders.types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { useState } from "preact/hooks";

interface RenameFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder;
}

export const RenameFolderDialog = (props: RenameFolderDialogProps) => {
  const [folderName, setFolderName] = useState(props.folder.name);
  const updateFolderMutation = useUpdateFolder();

  const handleRename = () => {
    if (!folderName.trim()) return;

    updateFolderMutation.mutate(
      {
        id: props.folder.id,
        data: { name: folderName.trim() },
      },
      {
        onSuccess: () => {
          props.onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (updateFolderMutation.isPending) return;
        props.onOpenChange(open);
      }}
    >
      <DialogContent showClose={false} class="flex flex-col gap-8 rounded-none">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <DialogClose>
              <Icon icon="ix:cancel" fontSize={16} />
            </DialogClose>
            <p class="font-medium text-sm">Rename</p>
          </div>
        </DialogHeader>

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <Label htmlFor="folder-name" class="font-medium text-sm">
              Folder name
            </Label>
            <div class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3">
              <i className="size-4.5">
                <Icon icon="bi:folder" fontSize={18} />
              </i>
              <input
                id="folder-name"
                type="text"
                value={folderName}
                onInput={(e) => setFolderName((e.target as HTMLInputElement).value)}
                class="flex-1 text-sm placeholder:text-grey-400"
                placeholder="Enter folder name"
              />
            </div>
          </div>

          <DialogFooter class="p-0">
            <Button onClick={handleRename} class="w-full bg-primary hover:bg-primary/90" disabled={updateFolderMutation.isPending || !folderName.trim()}>
              {updateFolderMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
