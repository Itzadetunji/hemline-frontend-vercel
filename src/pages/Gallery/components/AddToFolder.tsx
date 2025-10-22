import { Icon } from "@iconify/react";
import { useState } from "preact/hooks";
import toast from "react-hot-toast";

import { AddToFolder } from "@/components/AddToFolder";
import { DeleteImages } from "@/components/DeleteImages";
import { Button } from "@/components/ui/button";
import { selectingSignal } from "@/layout/Header";

export const AddToFolderBar = () => {
  const [addToFolder, setAddToFolder] = useState(false);
  const [deleteImages, setDeleteImages] = useState(false);

  const handleAddToFolder = () => {
    if (selectingSignal.value.selectedItems.length === 0) {
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
    if (selectingSignal.value.selectedItems.length === 0) {
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
      <ul class="-translate-x-1/2 fixed bottom-6 left-1/2 flex items-center gap-0 border border-line-500">
        <Button class="gap-1 px-4 py-2.5 text-black capitalize" variant="secondary" onClick={handleAddToFolder}>
          <div class="min-w-4.5">
            <Icon icon="si:add-duotone" className="size-4.5" />
          </div>
          <p class="leading-0">Add To Folder</p>
        </Button>
        <Button class="-ml-0.5 gap-1.5 bg-white px-4 py-2.5 text-destructive capitalize hover:bg-white/80" onClick={handleDeleteImages}>
          <div class="min-w-4.5">
            <Icon icon="material-symbols-light:delete-outline-sharp" className="h-4.5 w-4.5" />
          </div>
          <p class="leading-0">Delete</p>
        </Button>
      </ul>

      <AddToFolder image_ids={selectingSignal.value.selectedItems} addToFolder={addToFolder} setAddToFolder={setAddToFolder} />

      <DeleteImages image_ids={selectingSignal.value.selectedItems} deleteImages={deleteImages} setDeleteImages={setDeleteImages} />
    </>
  );
};
