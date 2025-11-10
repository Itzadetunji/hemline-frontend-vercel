import { useGetGalleryImage } from "@/api/http/v1/gallery/gallery.hooks";
import type { GalleryImageType } from "@/api/http/v1/gallery/gallery.types";
import { Drawer } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageCache } from "@/hooks/useImageCache";
import { Icon } from "@iconify/react";
import type { Dispatch, StateUpdater } from "preact/hooks";

interface SingleGalleryProps {
  currentSelectedImage?: GalleryImageType;
  setCurrentSelectedImage: Dispatch<StateUpdater<GalleryImageType | undefined>>;
  setSelectedImages: Dispatch<StateUpdater<string[]>>;
}

export const PublicSingleGallery = (props: SingleGalleryProps) => {
  const isOpen = !!props.currentSelectedImage;

  const getGalleryQuery = useGetGalleryImage(props.currentSelectedImage?.id as string);

  // Use the image cache hook
  const { cachedUrl, isLoading: loading } = useImageCache(props.currentSelectedImage?.url);

  const handleImageLoad = () => {
    // Image load handler for additional processing if needed
  };

  return (
    <Drawer isOpen={isOpen} onClose={() => props.setCurrentSelectedImage(undefined)} className="flex flex-1 flex-col gap-6 overflow-y-auto pt-6 pb-6">
      <div class="flex flex-1 flex-col items-stretch gap-6">
        <div class="relative flex items-center justify-between px-4">
          <button
            type="button"
            class="flex items-center gap-2"
            onClick={() => {
              props.setCurrentSelectedImage(undefined);
            }}
          >
            <Icon icon="solar:arrow-left-linear" className="size-6" />
            <p>Back</p>
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button type="button">
                <Icon icon="pepicons-pencil:dots-x" className="size-6 text-black" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="!top-14 !right-124 mr-4 flex w-40 flex-col items-stretch rounded-sm border-line-400 bg-white/70 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg">
              <ul class="flex flex-col gap-3">
                <a href={props.currentSelectedImage?.url} class="flex cursor-pointer items-center justify-between gap-2" target="_blank" download>
                  <p class="font-medium text-sm">Download</p>
                  <div class="min-w-5 p-1">
                    <Icon icon="iconoir:download" className="h-4 w-4 text-black" />
                  </div>
                </a>
                <li class="flex cursor-pointer items-center justify-between gap-2 text-grey-500 hover:bg-secondary">
                  <p class="font-medium text-sm">Uploaded</p>
                  <span class="text-sm">
                    {props.currentSelectedImage &&
                      new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      }).format(new Date((props.currentSelectedImage?.created_at as string) ?? undefined))}
                  </span>
                </li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>
        <div class="flex flex-1 flex-col justify-between gap-6">
          <div class="relative max-h-[50vh] overflow-hidden">
            {loading && <Skeleton class="absolute inset-0 h-full w-full rounded-none" />}
            <img
              src={cachedUrl}
              alt={props.currentSelectedImage?.file_name}
              onLoad={handleImageLoad}
              class="h-full w-full object-contain"
              style={{ display: loading ? "none" : "block" }}
            />
          </div>
          {getGalleryQuery.data?.data.description && (
            <div class="flex flex-1 flex-col justify-end gap-4 px-4">
              <ul class="flex items-center justify-between gap-4">
                <h2 class="text-2xl leading-5">Work Details</h2>
              </ul>
              <div class="max-h-32 flex-1 px-3 py-3.5 text-sm">{getGalleryQuery.data?.data.description}</div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
