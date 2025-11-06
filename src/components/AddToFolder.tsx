import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { type Dispatch, type StateUpdater, useState } from "preact/hooks";
import { AddToExistingFolder } from "./AddToExistingFolder";
import { AddToNewFolder } from "./AddToNewFolder";

interface AddToFolderProps {
  image_ids?: string[];
  addToFolder: boolean;
  showAddFolderButton?: boolean;
  disableAddToFolder?: boolean;
  setAddToFolder: Dispatch<StateUpdater<boolean>>;
  setHasUploaded?: Dispatch<StateUpdater<boolean>>;
  setProgressSuccess?: Dispatch<StateUpdater<boolean>>;
  onClose?: () => void;
}

export const AddToFolder = (props: AddToFolderProps) => {
  const [addToNewFolder, setAddToNewFolder] = useState(false);
  const [addToExistingFolder, setAddToExistingFolder] = useState(false);
  console.log(addToNewFolder, addToExistingFolder);
  return (
    <>
      <Dialog
        open={props.addToFolder}
        onOpenChange={(newValue) => {
          if (newValue) return props.onClose?.();
          console.log("here");
          props.setAddToFolder(newValue);
        }}
      >
        {props.showAddFolderButton &&
          ((
            <DialogTrigger onClick={() => props.setAddToFolder(true)} class="flex items-center gap-1.5 bg-secondary-500 px-3 py-1.5 leading-09">
              <p>Add To Folder</p>
              <Icon icon="si:add-duotone" />
            </DialogTrigger>
          ) as any)}
        <DialogContent showClose={false} class="flex flex-col gap-8">
          <DialogHeader class="p-0">
            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  props.onClose?.();
                  props.setAddToFolder(false);
                }}
              >
                <Icon icon="ix:cancel" fontSize={16} />
              </button>
              <p class="font-medium text-sm">Add to folder</p>
            </div>
          </DialogHeader>
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-4">
              <p class="!font-primary text-2xl leading-0">Create Collection</p>
              <p class="font-medium text-sm">Keep your works organized by adding them to folders</p>
            </div>
            <DialogFooter class="flex flex-col items-stretch gap-3">
              <Button
                variant="outline"
                class="py-3.5 font-medium text-sm"
                type="button"
                onClick={() => {
                  props.setAddToFolder(false);
                  setAddToExistingFolder(true);
                }}
              >
                Add To Exisiting Folder
              </Button>

              <Button
                class="py-3.5 font-medium text-sm"
                type="button"
                onClick={() => {
                  props.setAddToFolder(false);
                  setAddToNewFolder(true);
                }}
              >
                Create New Folder
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AddToNewFolder
        image_ids={props.image_ids}
        setAddToFolder={props.setAddToFolder}
        addToNewFolder={addToNewFolder}
        setAddToNewFolder={setAddToNewFolder}
        onSuccess={() => {
          setAddToNewFolder(false);
          props.setHasUploaded?.(false);
          props.setProgressSuccess?.(false);
          props.onClose?.();
        }}
      />

      <AddToExistingFolder
        image_ids={props.image_ids}
        addToExistingFolder={addToExistingFolder}
        setAddToExistingFolder={setAddToExistingFolder}
        setHasUploaded={props.setHasUploaded}
        setAddToFolder={props.setAddToFolder}
        setProgressSuccess={props.setProgressSuccess}
        onSuccess={() => {
          props.onClose?.();
        }}
      />
    </>
  );
};
