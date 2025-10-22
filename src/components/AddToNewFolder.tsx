import { Icon } from "@iconify/react";
import type { Dispatch, StateUpdater } from "preact/hooks";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { useCreateFolder } from "@/api/http/v1/gallery/folders.hooks";
import { CreateFolderSchema, type CreateFolderPayload } from "@/api/http/v1/gallery/folders.types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "./ui/label";
import { RadioGroup } from "./ui/radio-group";
import { selectingSignal } from "@/layout/Header";

interface AddToNewFolderProps {
  addToNewFolder: boolean;
  image_ids?: string[];
  onSuccess: () => void;
  setAddToFolder?: Dispatch<StateUpdater<boolean>>;
  setAddToNewFolder: Dispatch<StateUpdater<boolean>>;
}

export const AddToNewFolder = (props: AddToNewFolderProps) => {
  const createFolderMutation = useCreateFolder();
  const randomColor = Math.floor(Math.random() * 9);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateFolderPayload>({
    resolver: zodResolver(CreateFolderSchema) as any,
    defaultValues: {
      folder: {
        folder_color: randomColor,
        name: "",
      },
    },
  });

  const onSubmit = async (formData: CreateFolderPayload) => {
    const payload = {
      ...formData,
      folder: {
        ...formData.folder,
        folder_color: formData.folder.folder_color + 1,
      },
      image_ids: props.image_ids || [],
    };

    console.log(payload);
    await createFolderMutation.mutateAsync(payload, {
      onSuccess: () => {
        props.onSuccess();
        toast.success("Images added to new folder", {
          style: {
            border: "1px solid var(--primary)",
            padding: "4px 4px",
            color: "var(--primary)",
            borderRadius: "0px",
          },
          icon: null,
        });
        selectingSignal.value = {
          isSelecting: false,
          selectedItems: [],
        };
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
        console.error("Error creating folder:", error);
      },
    });
  };

  return (
    <Dialog
      open={props.addToNewFolder}
      onOpenChange={(open) => {
        if (createFolderMutation.isPending) return;
        props.setAddToNewFolder(open);
        if (!open) reset();
      }}
    >
      <DialogContent showClose={false} class="flex flex-col gap-8">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                props.setAddToNewFolder(false);
                props.setAddToFolder?.(true);
              }}
            >
              <Icon icon="solar:arrow-left-linear" className="size-6" />
            </button>
            <p class="font-medium text-base">New folder</p>
          </div>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e as any);
          }}
          class="flex flex-col gap-6"
        >
          <Label class="flex flex-col items-stretch gap-4">
            <p>Folder name</p>
            <Controller
              name="folder.name"
              control={control}
              render={({ field }) =>
                (
                  <div class="flex flex-col gap-2">
                    <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                      <Icon icon="bi:folder" fontSize="18" className="flex-shrink-0" />
                      <input {...field} placeholder="Wedding works" class="min-w-0 flex-1 text-sm placeholder:text-grey-400" />
                    </div>
                    {errors.folder?.name && <p class="text-red-500 text-xs">{errors.folder?.name.message}</p>}
                  </div>
                ) as any
              }
            />
          </Label>
          <Label class="flex flex-col items-stretch gap-4">
            <p>Choose a folder color</p>
            <Controller
              name="folder.folder_color"
              control={control}
              render={({ field }) =>
                (
                  <div class="flex flex-col gap-2">
                    <RadioGroup
                      options={colors.map((_, index) => index)}
                      value={field.value}
                      onChange={(selectedIndex) => field.onChange(selectedIndex)}
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
                    {errors.folder?.folder_color && <p class="text-red-500 text-xs">{errors.folder?.folder_color.message}</p>}
                  </div>
                ) as any
              }
            />
          </Label>
          <DialogFooter class="flex flex-col items-stretch gap-3">
            <Button class="py-3.5 font-medium text-sm" type="submit" disabled={createFolderMutation.isPending}>
              {createFolderMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
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
