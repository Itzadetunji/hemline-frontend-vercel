import { Icon } from "@iconify/react";
import type { RefObject } from "preact";
import { type Dispatch, type StateUpdater, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { useInfiniteGetGalleries } from "@/api/http/v1/gallery/gallery.hooks";
import type { GalleryImageType } from "@/api/http/v1/gallery/gallery.types";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { AddToFolder } from "@/components/AddToFolder";
import { DeleteImages } from "@/components/DeleteImages";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { preloadImages, useImageCache } from "@/hooks/useImageCache";
import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { cn } from "@/lib/utils";
import { AddToFolderBar } from "./components/AddToFolderBar";
import { SingleGallery } from "./components/SingleGallery";
import { UploadImages, type UploadImagesHandle } from "./components/UploadImages";
import { useInfiniteGetClients } from "@/api/http/v1/clients/clients.hooks";
import { useInfiniteGetOrders } from "@/api/http/v1/orders/orders.hooks";
import { Button } from "@/components/ui/button";

export const Gallery = () => {
  // const [galleryLayout, setGalleryLayout] = useState<"fancy" | "grid">("fancy");
  const getUserProfile = useGetUserProfile();
  useInfiniteGetClients();
  useInfiniteGetOrders();

  const [currentSelectedImage, setCurrentSelectedImage] = useState<GalleryImageType | undefined>(undefined);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [addToFolder, setAddToFolder] = useState<boolean>(false);
  const [deleteImages, setDeleteImages] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const uploadImagesRef = useRef<UploadImagesHandle | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteGetGalleries(20);

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

  // Preload images when they are fetched
  useEffect(() => {
    if (allImages.length > 0) {
      const urls = allImages.map((img) => img.url);
      preloadImages(urls);
    }
  }, [allImages.length]);

  useLayoutEffect(() => {
    selectingSignal.value = {
      isSelecting: false,
      selectedItems: [],
    };

    headerContentSignal.value = {
      ...headerContentSignal.value,
      showHeader: true,
      title: () => <h1 class="truncate text-3xl text-black">Gallery</h1>,
      tab: "gallery",
      headerContent: () => (
        <>
          <button
            class="flex items-center gap-1.5"
            type="button"
            onClick={() => {
              selectingSignal.value = {
                selectedItems: [],
                isSelecting: !selectingSignal.value.isSelecting,
              };
            }}
          >
            <div class="min-h-5 min-w-5 p-1">
              <Icon icon="gala:select" className="h-4 w-4 text-black" />
            </div>
            {selectingSignal.value.isSelecting && <p class="font-medium text-sm">Deselect ({selectingSignal.value.selectedItems.length})</p>}
          </button>
          {!selectingSignal.value.isSelecting && (
            <>
              <UploadImages ref={uploadImagesRef} />
              <a href="/gallery/folders">
                <li class="relative min-h-5 min-w-5 p-1">
                  <Icon icon="bi:folder" className="h-4 w-4 text-black" />
                  <p class="-top-0.5 -right-0.5 absolute grid min-h-3.5 min-w-3.5 place-content-center rounded-full bg-primary text-[0.625rem] text-white leading-0">
                    {getUserProfile.data?.data.user.total_folders || 0}
                  </p>
                </li>
              </a>
            </>
          )}
        </>
      ),
    };
  }, []);

  return (
    <div class="flex flex-1 flex-col pb-8">
      <ul class="flex items-center justify-between gap-4 px-4">
        <Button class="!p-0 flex w-fit items-center gap-2" variant="ghost">
          <Icon icon="streamline-ultimate:layout" className="text-black" />
          <p class="font-medium text-sm">Change Layout</p>
        </Button>
        <Button class="!p-0 flex w-fit items-center gap-2" variant="ghost" onClick={() => uploadImagesRef.current?.triggerUpload()}>
          <Icon icon="si:add-duotone" className="size-4" />
          <p class="font-medium text-sm">Upload</p>
        </Button>
      </ul>
      {isLoading && (
        <ul class="mt-4 grid grid-cols-[auto_auto_auto] gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} class="h-40 rounded-none" />
          ))}
        </ul>
      )}

      {!isLoading && allImages.length === 0 && <EmptyGallery onUploadClick={() => uploadImagesRef.current?.triggerUpload()} />}

      {allImages.length > 0 && (
        <div class="mt-4 grid auto-rows-fr grid-cols-3 gap-1">
          {allImages.map((img, idx) => (
            <GalleryImage
              key={img.id}
              image={img}
              nextImage={allImages[idx + 1] ?? undefined}
              isLastItem={idx === allImages.length - 1}
              observerRef={idx === allImages.length - 1 ? observerTarget : undefined}
              setSelectedImages={setSelectedImages}
              setAddToFolder={setAddToFolder}
              setDeleteImages={setDeleteImages}
              setCurrentSelectedImage={setCurrentSelectedImage}
            />
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div class="mt-1 grid grid-cols-[auto_auto_auto] gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} class="h-40 rounded-none" />
          ))}
        </div>
      )}

      <AddToFolder image_ids={selectedImages} addToFolder={addToFolder} setAddToFolder={setAddToFolder} />

      <DeleteImages image_ids={selectedImages} deleteImages={deleteImages} setDeleteImages={setDeleteImages} />

      <SingleGallery
        currentSelectedImage={currentSelectedImage}
        setCurrentSelectedImage={setCurrentSelectedImage}
        setSelectedImages={setSelectedImages}
        setAddToFolder={setAddToFolder}
        setDeleteImages={setDeleteImages}
      />
    </div>
  );
};

const GalleryImage = (props: {
  image: GalleryImageType;
  nextImage?: GalleryImageType;
  isLastItem?: boolean;
  observerRef?: RefObject<HTMLDivElement>;
  setSelectedImages: Dispatch<StateUpdater<string[]>>;
  setAddToFolder: Dispatch<StateUpdater<boolean>>;
  setDeleteImages: Dispatch<StateUpdater<boolean>>;
  setCurrentSelectedImage: Dispatch<StateUpdater<GalleryImageType | undefined>>;
}) => {
  const isLandscape = (props.image.meta?.width ?? 0) / (props.image.meta?.height ?? 0) > 1;
  const [iconColor, setIconColor] = useState("text-white");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Use image cache hook with preloading for next image
  const { cachedUrl, isLoading: loading } = useImageCache(props.image.url, {
    preloadNext: !!props.nextImage,
    nextImageUrl: props.nextImage?.url,
  });

  const handleImageLoad = (e: Event) => {
    const img = e.target as HTMLImageElement;

    // Detect background color at icon position
    detectBackgroundColor(img, setIconColor);
  };

  return (
    <>
      {selectingSignal.value.isSelecting && <AddToFolderBar />}
      <div
        ref={props.isLastItem ? props.observerRef : null}
        class={cn("relative h-40", {
          "col-span-2": isLandscape,
        })}
      >
        {selectingSignal.value.isSelecting ? (
          <label class="group absolute top-1.5 left-1.5 cursor-pointer">
            <input type="checkbox" onChange={(e) => handleCheckboxChange(e, props.image.id)} class="sr-only" />
            <div class="flex size-4.5 items-center justify-center border border-line-500 bg-white/40 transition-colors group-has-[:checked]:border-primary group-has-[:checked]:bg-primary">
              <Icon icon="heroicons:check-20-solid" className="h-3.5 w-3.5 text-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
            </div>
          </label>
        ) : (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button class="absolute top-0 left-0 pt-3 pl-2" type="button">
                <Icon icon="pepicons-pencil:dots-x" className={iconColor} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="flex w-40 flex-col items-stretch rounded-sm border-line-400 bg-white/70 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg">
              <ul class="flex flex-col gap-3">
                <button
                  onClick={() => {
                    props.setSelectedImages(() => [props.image.id]);
                    props.setAddToFolder(true);
                  }}
                  type="button"
                  class="flex cursor-pointer items-center justify-between gap-2"
                >
                  <p class="font-medium text-sm">Add to Folder</p>
                  <div class="min-w-5 p-1">
                    <Icon icon="bi:folder" className="h-4 w-4 text-black" />
                  </div>
                </button>

                <button
                  type="button"
                  class="flex cursor-pointer items-center justify-between gap-2"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    props.setCurrentSelectedImage(props.image);
                  }}
                >
                  <p class="font-medium text-sm">View Details</p>
                  <div class="min-w-5 p-1">
                    <Icon icon="iconamoon:screen-full-light" className="h-4 w-4 text-black" />
                  </div>
                </button>
                <button
                  onClick={() => {
                    props.setSelectedImages(() => [props.image.id]);
                    props.setDeleteImages(true);
                  }}
                  type="button"
                  class="flex cursor-pointer items-center justify-between gap-2"
                >
                  <p class="font-medium text-destructive text-sm">Delete</p>
                  <div class="min-w-5 p-1">
                    <Icon icon="material-symbols-light:delete-outline-sharp" className="h-4 w-4 text-destructive" />
                  </div>
                </button>
                <li class="flex cursor-pointer items-center justify-between gap-2">
                  <p class="font-medium text-sm">Uploaded</p>
                  <span class="text-sm">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    }).format(new Date(props.image.created_at))}
                  </span>
                </li>
              </ul>
            </PopoverContent>
          </Popover>
        )}

        {loading && <Skeleton class="absolute inset-0 h-full w-full rounded-none" />}

        <img
          src={cachedUrl}
          alt={props.image.file_name}
          onLoad={handleImageLoad}
          class={cn("h-full w-full object-cover transition-opacity duration-300", loading ? "opacity-0" : "opacity-100")}
          onClick={() => {
            setIsPopoverOpen(false);
            props.setCurrentSelectedImage(props.image);
          }}
          crossOrigin="anonymous"
        />
      </div>
    </>
  );
};

const EmptyGallery = (props: { onUploadClick: () => void }) => (
  <div class="flex flex-1 flex-col items-center justify-center gap-4">
    <div class="flex flex-col items-center gap-4">
      <h2 class="text-2xl leading-0">No works to show.</h2>
      <p class="font-medium text-grey-500 text-sm">Upload your best works from your gallery</p>
    </div>
    <button class="flex items-center gap-2 py-2" type="button" onClick={props.onUploadClick}>
      <p class="font-medium text-sm">Upload</p>
      <Icon icon="iconoir:upload" className="h-5 w-5 text-black" />
    </button>
  </div>
);

export const detectBackgroundColor = (img: HTMLImageElement, setIconColor: Dispatch<StateUpdater<string>>) => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to image size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw image on canvas
    ctx.drawImage(img, 0, 0);

    // Sample area where the icon will be (top-left corner)
    // Sample a small region around the icon position
    const sampleX = Math.floor(img.naturalWidth * 0.05); // 5% from left
    const sampleY = Math.floor(img.naturalHeight * 0.1); // 10% from top
    const sampleSize = 20;

    const imageData = ctx.getImageData(sampleX, sampleY, sampleSize, sampleSize);
    const data = imageData.data;

    // Calculate average color
    let r = 0;
    let g = 0;
    let b = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);

    // Calculate perceived brightness using relative luminance formula
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // If background is light (bright), use black icon, otherwise use white
    setIconColor(brightness > 0.6 ? "text-black" : "text-white");
  } catch (error) {
    console.error("Error detecting background color:", error);
    // Fallback to white if detection fails
    setIconColor("text-white");
  }
};

const handleCheckboxChange = (e: Event, image_id: string) => {
  const target = e.target as HTMLInputElement;
  const currentSelected = selectingSignal.value.selectedItems;

  if (target.checked) {
    // Add to selection
    selectingSignal.value = {
      ...selectingSignal.value,
      selectedItems: [...currentSelected, image_id],
    };
  } else {
    // Remove from selection
    selectingSignal.value = {
      ...selectingSignal.value,
      selectedItems: currentSelected.filter((id) => id !== image_id),
    };
  }
};
