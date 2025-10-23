import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "preact/hooks";

import { useInfiniteGetGalleries } from "@/api/http/v1/gallery/gallery.hooks";
import type { GalleryImageType } from "@/api/http/v1/gallery/gallery.types";
import { useAddImagesToFolder } from "@/api/http/v1/gallery/folders/folders.hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { preloadImages, useImageCache } from "@/hooks/useImageCache";
import toast from "react-hot-toast";
import { userSignal } from "@/stores/userStore";
import { Folder } from "@/api/http/v1/gallery/folders/folders.types";

interface AddImagesToFolderProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: Folder;
  excludeImageIds?: string[]; // Images to exclude from selection (already in folder)
}

export const AddImagesToFolder = (props: AddImagesToFolderProps) => {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const observerTarget = useRef<HTMLButtonElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteGetGalleries(20);
  const addImagesToFolderMutation = useAddImagesToFolder();

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into a single array of images
  const allImages = data?.pages.flatMap((page) => page.data) ?? [];

  // Filter out images that are already in the folder (if excludeImageIds is provided)
  const availableImages = props.excludeImageIds ? allImages.filter((img) => !props.excludeImageIds?.includes(img.id)) : allImages;

  // Preload images when they are fetched
  useEffect(() => {
    if (availableImages.length > 0) {
      const urls = availableImages.map((img) => img.url);
      preloadImages(urls);
    }
  }, [availableImages.length]);

  const handleSubmit = async () => {
    if (selectedImageIds.length === 0) {
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

    await addImagesToFolderMutation.mutateAsync(
      {
        id: props.folder?.id ?? "",
        data: {
          image_ids: selectedImageIds,
          folder_ids: [props.folder?.id ?? ""],
        },
      },
      {
        onSuccess: () => {
          toast.success("Images added to folder successfully", {
            style: {
              border: "1px solid var(--primary)",
              padding: "4px 4px",
              color: "var(--primary)",
              borderRadius: "0px",
            },
            icon: null,
          });
          setSelectedImageIds([]);
          props.onClose();
        },
        onError: (error) => {
          toast.error(error.response?.data?.error || "Failed to add images to folder", {
            style: {
              border: "1px solid var(--primary)",
              padding: "4px 4px",
              color: "var(--primary)",
              borderRadius: "0px",
            },
            icon: null,
          });
        },
      }
    );
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId);
      }
      return [...prev, imageId];
    });
  };

  return (
    <Drawer
      isOpen={props.isOpen}
      onClose={() => {
        setSelectedImageIds([]);
        props.onClose();
      }}
      className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-6"
    >
      <div class="flex flex-col gap-8">
        <div class="relative flex items-center justify-center">
          <button
            type="button"
            class="-translate-y-1/2 absolute top-1/2 left-0"
            onClick={() => {
              setSelectedImageIds([]);
              props.onClose();
            }}
          >
            <Icon icon="solar:arrow-left-linear" className="size-6" />
          </button>
          <p class="font-semibold text-base">Add to {props.folder?.name || "folder"}</p>
        </div>

        <div class="relative flex flex-1 flex-col gap-4">
          {isLoading && (
            <div class="grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} class="h-40 rounded-none" />
              ))}
            </div>
          )}

          {!isLoading && availableImages.length === 0 && (
            <>
              {" "}
              {/* <div class="flex flex-1 flex-col items-center justify-center gap-4 py-16">
                <Icon icon="solar:gallery-linear" fontSize={48} className="text-grey-400" />{" "}
                <p class="text-center text-grey-500">
                  {props.excludeImageIds && props.excludeImageIds.length > 0 ? "All images are already in this folder" : "No images in gallery"}{" "}
                </p>{" "}
              </div> */}
              <div class="flex flex-1 flex-col items-center justify-center gap-4">
                <div class="flex flex-col items-center gap-4">
                  <h2 class="text-2xl leading-0">No works to show.</h2>
                  <p class="font-medium text-grey-500 text-sm">Upload your best works from your gallery</p>
                </div>
                <a class="flex items-center gap-2 py-2" href="/gallery">
                  <p class="font-medium text-sm">Upload</p>
                  <Icon icon="si:add-duotone" className="h-5 w-5 text-black" />
                </a>
              </div>
            </>
          )}

          {availableImages.length > 0 && (
            <>
              <div class="flex items-center justify-between">
                <p class="text-grey-500 text-sm">
                  {selectedImageIds.length} of {(userSignal.value?.user?.total_gallery_images ?? 0) - (props.folder?.image_ids.length ?? 0)} selected
                </p>
                {selectedImageIds.length > 0 && (
                  <button type="button" class="text-primary text-sm" onClick={() => setSelectedImageIds([])}>
                    Clear selection
                  </button>
                )}
              </div>

              <div class="grid auto-rows-fr grid-cols-3 gap-1">
                {availableImages.map((img, idx) => (
                  <SelectableImage
                    key={img.id}
                    image={img}
                    isSelected={selectedImageIds.includes(img.id)}
                    onToggle={() => toggleImageSelection(img.id)}
                    isLastItem={idx === availableImages.length - 1}
                    observerRef={idx === availableImages.length - 1 ? observerTarget : undefined}
                  />
                ))}
              </div>
            </>
          )}

          {isFetchingNextPage && (
            <div class="mt-1 grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} class="h-40 rounded-none" />
              ))}
            </div>
          )}

          <Button class="-translate-x-1/2 fixed bottom-6 left-1/2 z-50 w-fit gap-3 px-6" type="button" onClick={handleSubmit}>
            {addImagesToFolderMutation.isPending ? "Adding..." : `Add ${selectedImageIds.length} image${selectedImageIds.length !== 1 ? "s" : ""} to folder`}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

interface SelectableImageProps {
  image: GalleryImageType;
  isSelected: boolean;
  onToggle: () => void;
  isLastItem?: boolean;
  observerRef?: preact.RefObject<HTMLButtonElement>;
}

const SelectableImage = (props: SelectableImageProps) => {
  const isLandscape = (props.image.meta?.width ?? 0) / (props.image.meta?.height ?? 0) > 1;

  // Use image cache hook
  const { cachedUrl, isLoading: loading } = useImageCache(props.image.url, {
    preloadNext: false,
  });

  return (
    <button
      type="button"
      ref={props.isLastItem ? props.observerRef : null}
      class={cn("relative h-40 cursor-pointer", {
        "col-span-2": isLandscape,
      })}
      onClick={props.onToggle}
    >
      <label class="group absolute top-1.5 left-1.5 z-10 cursor-pointer">
        <input type="checkbox" checked={props.isSelected} onChange={props.onToggle} class="sr-only" />
        <div class={cn("flex size-4.5 items-center justify-center border transition-colors", props.isSelected ? "border-primary bg-primary" : "border-line-500 bg-white/40")}>
          <Icon icon="heroicons:check-20-solid" className={cn("h-3.5 w-3.5 text-white transition-opacity", props.isSelected ? "opacity-100" : "opacity-0")} />
        </div>
      </label>

      {loading && <Skeleton class="absolute inset-0 h-full w-full rounded-none" />}

      <img
        src={cachedUrl}
        alt={props.image.file_name}
        class={cn("h-full w-full object-cover transition-opacity duration-300", loading ? "opacity-0" : "opacity-100", props.isSelected && "ring-2 ring-primary ring-inset")}
        crossOrigin="anonymous"
      />
    </button>
  );
};
