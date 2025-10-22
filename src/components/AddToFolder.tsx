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
    setAddToFolder: Dispatch<StateUpdater<boolean>>;
    setHasUploaded?: Dispatch<StateUpdater<boolean>>;
    setProgressSuccess?: Dispatch<StateUpdater<boolean>>;
}

export const AddToFolder = (props: AddToFolderProps) => {
    const [addToNewFolder, setAddToNewFolder] = useState(false);
    const [addToExistingFolder, setAddToExistingFolder] = useState(false);

    return (
        <>
            <Dialog open={props.addToFolder} onOpenChange={props.setAddToFolder}>
                {props.showAddFolderButton &&
                    ((
                        <DialogTrigger asChild>
                            <button class="flex items-center gap-1.5 bg-secondary-500 py-1.5 px-3" type="button">
                                <p class="leading-09">Add To Folder</p>
                                <Icon icon="si:add-duotone" />
                            </button>
                        </DialogTrigger>
                    ) as any)}
                <DialogContent showClose={false} class="flex flex-col gap-8">
                    <DialogHeader class="p-0">
                        <div class="flex items-center gap-2">
                            <button type="button" onClick={() => props.setAddToFolder(false)}>
                                <Icon icon="ix:cancel" fontSize={16} />
                            </button>
                            <p class="text-sm font-medium">Add to folder</p>
                        </div>
                    </DialogHeader>
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-4">
                            <p class="!font-primary text-2xl leading-0">Create Collection</p>
                            <p class="font-medium text-sm">Keep your works organized by adding them to folders</p>
                        </div>
                        <DialogFooter class="flex flex-col gap-3 items-stretch">
                            <Button
                                variant="outline"
                                class="text-sm font-medium py-3.5"
                                type="button"
                                onClick={() => {
                                    props.setAddToFolder(false);
                                    setAddToExistingFolder(true);
                                }}
                            >
                                Add To Exisiting Folder
                            </Button>

                            <Button
                                class="text-sm font-medium py-3.5"
                                type="button"
                                onClick={() => {
                                    setAddToNewFolder(true);
                                }}
                            >
                                Create New Folder
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {addToNewFolder && (
                <AddToNewFolder
                    image_ids={props.image_ids}
                    setAddToFolder={props.setAddToFolder}
                    addToNewFolder={addToNewFolder}
                    setAddToNewFolder={setAddToNewFolder}
                    onSuccess={() => {
                        setAddToNewFolder(false);
                        props.setHasUploaded?.(false);
                        props.setProgressSuccess?.(false);
                    }}
                />
            )}

            <AddToExistingFolder
                image_ids={props.image_ids}
                addToExistingFolder={addToExistingFolder}
                setAddToExistingFolder={setAddToExistingFolder}
                setHasUploaded={props.setHasUploaded}
                setAddToFolder={props.setAddToFolder}
                setProgressSuccess={props.setProgressSuccess}
            />
        </>
    );
};
