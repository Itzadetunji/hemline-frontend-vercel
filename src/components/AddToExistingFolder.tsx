import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { Dispatch, StateUpdater } from "preact/hooks";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useAddImagesToFolder, useGetFolders } from "@/api/http/v1/gallery/folders.hooks";
import type { Folder } from "@/api/http/v1/gallery/folders.types";
import { Button } from "./ui/button";
import { CheckboxGroup } from "./ui/checkbox-group";
import { Drawer } from "./ui/drawer";
import toast from "react-hot-toast";
import { selectingImagesSignal } from "@/layout/Header";

// Zod schema for form validation
const AddToExistingFolderSchema = z.object({
  folder_ids: z.array(z.uuid()).min(1, "Please select at least one folder"),
});

type AddToExistingFolderFormData = z.infer<typeof AddToExistingFolderSchema>;

interface AddToExistingFolderProps {
  image_ids?: string[];
  addToExistingFolder: boolean;
  setHasUploaded?: Dispatch<StateUpdater<boolean>>;
  setAddToFolder: Dispatch<StateUpdater<boolean>>;
  setAddToExistingFolder: Dispatch<StateUpdater<boolean>>;
  setProgressSuccess?: Dispatch<StateUpdater<boolean>>;
}

export const AddToExistingFolder = (props: AddToExistingFolderProps) => {
  const getFoldersQuery = useGetFolders({ per_page: 100 });
  const addImagesToFolderMutation = useAddImagesToFolder();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setError,
  } = useForm<AddToExistingFolderFormData>({
    resolver: zodResolver(AddToExistingFolderSchema) as any,
    defaultValues: {
      folder_ids: [],
    },
  });

  const onSubmit = async (formData: AddToExistingFolderFormData) => {
    if (!props.image_ids || props.image_ids.length === 0) {
      console.error("No images to add");
      return;
    }

    // Use the first folder ID as the endpoint parameter
    const firstFolderId = formData.folder_ids[0];

    const payload = {
      image_ids: props.image_ids,
      folder_ids: formData.folder_ids,
    };

    await addImagesToFolderMutation.mutateAsync(
      {
        id: firstFolderId,
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success("Images added to folder", {
            style: {
              border: "1px solid var(--primary)",
              padding: "4px 4px",
              color: "var(--primary)",
              borderRadius: "0px",
            },
            icon: null,
          });
          selectingImagesSignal.value = {
            isSelecting: false,
            selectedItems: [],
          };
          props.setAddToExistingFolder(false);
          props.setHasUploaded?.(false);
          props.setProgressSuccess?.(false);
          reset();
        },
        onError: (error) => {
          toast.error(error.response?.data.errors?.[0] || "Error adding images to folders", {
            style: {
              border: "1px solid var(--primary)",
              padding: "4px 4px",
              color: "var(--primary)",
              borderRadius: "0px",
            },
            icon: null,
          });
          setError("folder_ids", {
            message: error.response?.data.errors?.[0] || "Error adding images to folders",
          });
          console.error("Error adding images to folder:", error);
        },
      }
    );
  };

  const handleFormSubmit = (e: Event) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e as any);
  };

  return (
    <Drawer isOpen={props.addToExistingFolder} onClose={() => props.setAddToExistingFolder(false)} className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-6">
      <form onSubmit={handleFormSubmit} class="flex flex-1 flex-col gap-8">
        <div class="relative flex items-center justify-center">
          <button
            type="button"
            class="-translate-y-1/2 absolute top-1/2 left-0"
            onClick={() => {
              props.setAddToFolder(true);
              props.setAddToExistingFolder(false);
            }}
          >
            <Icon icon="solar:arrow-left-linear" className="size-6" />
          </button>
          <p class="font-semibold text-base">Add to existing folder</p>
        </div>

        <div class="flex flex-1 flex-col gap-4">
          {getFoldersQuery.isLoading ? (
            <div class="flex flex-1 items-center justify-center">
              <img src="/assets/brand/logo.svg" class="animate-pulse" alt="Brand Logo" />
            </div>
          ) : !getFoldersQuery.data || getFoldersQuery.data.data.length === 0 ? (
            <div class="flex flex-1 flex-col items-center justify-center gap-2">
              <Icon icon="bi:folder" fontSize={48} className="text-grey-400" />
              <p class="text-center text-grey-500">No folders available. Create one first!</p>
            </div>
          ) : (
            <Controller
              name="folder_ids"
              control={control}
              render={({ field }) =>
                (
                  <div class="flex flex-1 flex-col gap-4">
                    <CheckboxGroup
                      options={getFoldersQuery.data.data.map((folder) => folder.id)}
                      value={field.value}
                      onChange={field.onChange}
                      className="place-items-center-safe grid flex-1 grid-cols-3 content-start gap-4"
                      optionClassName="p-0 h-auto border-0 bg-transparent"
                      selectedClassName=""
                      unselectedClassName=""
                      renderOption={(folderId: string, isSelected: boolean) => {
                        const folder = getFoldersQuery.data.data.find((f) => f.id === folderId);
                        if (!folder) return null;
                        return <FolderCard folder={folder} isSelected={isSelected} />;
                      }}
                    />
                    {errors.folder_ids && <p class="text-red-500 text-xs">{errors.folder_ids.message}</p>}
                  </div>
                ) as any
              }
            />
          )}

          <Button class="w-full gap-3" type="submit" disabled={isSubmitting || addImagesToFolderMutation.isPending || getFoldersQuery.isLoading || !getFoldersQuery.data || getFoldersQuery.data.data.length === 0 || !isValid}>
            {isSubmitting || addImagesToFolderMutation.isPending ? "Adding..." : "Add to Folders"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

interface FolderCardProps {
  folder: Folder;
  isSelected: boolean;
}

const FolderCard = (props: FolderCardProps) => {
  const folderIconNumber = props.folder.folder_color ? props.folder.folder_color : Math.floor(Math.random() * 9);
  const itemCount = props.folder.image_ids?.length || 0;

  return (
    <figure class="flex flex-col items-center gap-1 overflow-hidden">
      <div class="relative overflow-hidden">
        <img src={`/assets/folder-icons/folder-${folderIconNumber}.png`} alt={props.folder.name} class="h-15.5 w-17.25" />
        {props.folder.cover_image && <img src={props.folder.cover_image} alt={props.folder.name} class="-translate-x-1/2 absolute top-6 left-1/2 h-8 w-11 bg-[red] object-cover" />}
      </div>
      <figcaption class="w-full text-center">
        <p class="max-w-[10ch] truncate font-medium text-sm">{props.folder.name}</p>
        <div class="flex items-center justify-center gap-3">
          <p class="text-grey-500 text-xs leading-4">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <div class="grid size-4.5 place-content-center rounded-full border border-line-500">
            {props.isSelected && (
              <div class="flex size-4 items-center justify-center rounded-full bg-primary">
                <Icon icon="charm:tick" className="size-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </figcaption>
    </figure>
  );
};
