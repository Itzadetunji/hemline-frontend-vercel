import { useUpdateFolder } from "@/api/http/v1/gallery/folders/folders.hooks";
import type { Folder } from "@/api/http/v1/gallery/folders/folders.types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Icon } from "@iconify/react";
import { useState } from "preact/hooks";
import { cn } from "@/lib/utils";

interface EditFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder;
}

export const EditFolderDialog = (props: EditFolderDialogProps) => {
  const [folderName, setFolderName] = useState(props.folder.name);
  const [folderColor, setFolderColor] = useState(props.folder.folder_color - 1);
  const updateFolderMutation = useUpdateFolder();

  const handleRename = () => {
    if (!folderName.trim()) return;

    updateFolderMutation.mutate(
      {
        id: props.folder.id,
        data: {
          name: folderName.trim(),
          folder_color: folderColor + 1,
        },
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
            <DialogClose class="size-4">
              <Icon icon="ix:cancel" fontSize={16} />
            </DialogClose>
            <p class="font-medium text-sm">Edit Folder</p>
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

          <div class="flex flex-col gap-4">
            <Label class="font-medium text-sm">Choose a folder color</Label>
            <RadioGroup
              options={colors.map((_, index) => index)}
              value={folderColor}
              onChange={(selectedIndex) => setFolderColor(selectedIndex)}
              className="flex flex-wrap gap-3"
              optionClassName="p-0 h-auto border-0"
              selectedClassName=""
              unselectedClassName=""
              name="folder-color-selector"
              renderOption={(colorIndex: number, isSelected) => (
                <div
                  class={cn("size-8 cursor-pointer rounded-full transition-all", {
                    "ring-2 ring-primary ring-offset-2": isSelected,
                  })}
                  style={{
                    background: `linear-gradient(to bottom, ${colors[colorIndex].start} 0%, ${colors[colorIndex].end} 100%)`,
                  }}
                />
              )}
            />
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
