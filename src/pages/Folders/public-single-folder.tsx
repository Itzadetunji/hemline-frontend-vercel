import { Icon } from "@iconify/react";
import type { RefObject } from "preact";
import { useRoute } from "preact-iso";
import { type Dispatch, type StateUpdater, useEffect, useRef, useState } from "preact/hooks";

import { useGetPublicFolder, useInfiniteGetPublicFolderImages } from "@/api/http/v1/gallery/folders/folders.hooks";
import type { GalleryImageType } from "@/api/http/v1/gallery/gallery.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { preloadImages, useImageCache } from "@/hooks/useImageCache";
import { selectingSignal } from "@/layout/Header";
import { cn } from "@/lib/utils";
import { PublicSingleGallery } from "./components/PublicSingleGallery";
import { detectBackgroundColor } from "../Gallery/page";

export const PublicFolderGallery = () => {
  // Get folder ID from route params
  const { params } = useRoute();
  const folderId = params.public_id;

  const getPublicFolderQuery = useGetPublicFolder();

  const [currentSelectedImage, setCurrentSelectedImage] = useState<GalleryImageType | undefined>(undefined);
  const [_, setSelectedImages] = useState<string[]>([]);

  const observerTarget = useRef<HTMLDivElement>(null);

  const imagesInfiniteQuery = useInfiniteGetPublicFolderImages(folderId, 20, !!folderId);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && imagesInfiniteQuery.hasNextPage && !imagesInfiniteQuery.isFetchingNextPage) {
          imagesInfiniteQuery.fetchNextPage();
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
  }, [imagesInfiniteQuery.hasNextPage, imagesInfiniteQuery.isFetchingNextPage, imagesInfiniteQuery.fetchNextPage]);

  // Flatten all pages into a single array of images
  const allImages = imagesInfiniteQuery.data?.pages.flatMap((page) => page.data.images) ?? [];

  // Preload images when they are fetched
  useEffect(() => {
    if (allImages.length > 0) {
      const urls = allImages.map((img) => img.url);
      preloadImages(urls);
    }
  }, [allImages.length]);

  return (
    <>
      <NavBar />
      <div class="flex flex-1 flex-col">
        <header class="sticky top-0 z-50 flex items-center justify-between gap-2 bg-white px-4 pt-4 pb-3">
          {/* <div class="size-8 rounded-full bg-red-900" > */}
          <img src="/assets/brand/logo.svg" class="size-7 rounded-full bg-red-900" alt="Hemline Logo" />
          <ul class="flex items-center justify-end gap-3">
            <li>
              <button class="flex items-center gap-2" type="button">
                <Icon icon="streamline-ultimate:layout" className="text-black" />
                <p class="font-medium text-sm">Change Layout</p>
              </button>
            </li>
            <button type="button" class="size-6">
              <Icon icon="material-symbols:dark-mode" />
            </button>
          </ul>
        </header>
        <div class="flex flex-1 flex-col py-8">
          <div class="flex flex-col gap-4 px-4">
            {getPublicFolderQuery.data?.data.user.business_image && <img src={getPublicFolderQuery.data?.data.user.business_image} alt="" />}
            <div class="flex flex-col gap-3.5">
              <div class="flex flex-col gap-3.5">
                <h2 class="!font-cormorant text-2xl leading-1">{getPublicFolderQuery.data?.data.user.business_name ?? getPublicFolderQuery.data?.data.user.full_name} </h2>
                <p class="font-medium text-grey-500 text-sm">{getPublicFolderQuery.data?.data.user.business_address}</p>
              </div>
              <div class="flex flex-col gap-2">
                <p class="font-medium text-black text-sm">Skills</p>
                <ul class="flex flex-wrap gap-1">
                  {getPublicFolderQuery.data?.data.user.skills.map((skill) => (
                    <li key={skill} class="group text-grey-500 text-sm">
                      {skill} <span class="group-last:hidden">/</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {(imagesInfiniteQuery.isLoading || getPublicFolderQuery.isLoading) && (
            <ul class="mt-4 grid grid-cols-[auto_auto_auto] gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} class="h-40 rounded-none" />
              ))}
            </ul>
          )}

          {!imagesInfiniteQuery.isLoading && !getPublicFolderQuery.isLoading && allImages.length === 0 && <EmptyGallery folderName={getPublicFolderQuery.data?.data.folder.name} />}

          {allImages.length > 0 && (
            <div class="flex flex-1 flex-col items-stretch gap-8 pt-10">
              <p class="self-end px-4">{getPublicFolderQuery.data?.data.folder.name}</p>
              <div class="grid auto-rows-fr grid-cols-3 gap-1">
                {allImages.map((img, idx) => (
                  <FolderGalleryImage
                    key={img.id}
                    image={img}
                    nextImage={allImages[idx + 1] ?? undefined}
                    isLastItem={idx === allImages.length - 1}
                    observerRef={idx === allImages.length - 1 ? observerTarget : undefined}
                    setSelectedImages={setSelectedImages}
                    setCurrentSelectedImage={setCurrentSelectedImage}
                  />
                ))}
              </div>
            </div>
          )}

          {imagesInfiniteQuery.isFetchingNextPage && (
            <div class="mt-1 grid grid-cols-[auto_auto_auto] gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} class="h-40 rounded-none" />
              ))}
            </div>
          )}

          <PublicSingleGallery currentSelectedImage={currentSelectedImage} setCurrentSelectedImage={setCurrentSelectedImage} setSelectedImages={setSelectedImages} />
        </div>
      </div>
    </>
  );
};

const FolderGalleryImage = (props: {
  image: GalleryImageType;
  nextImage?: GalleryImageType;
  isLastItem?: boolean;
  observerRef?: RefObject<HTMLDivElement>;
  setSelectedImages: Dispatch<StateUpdater<string[]>>;
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

  const handleCheckboxChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const currentSelected = selectingSignal.value.selectedItems;

    if (target.checked) {
      // Add to selection
      selectingSignal.value = {
        ...selectingSignal.value,
        selectedItems: [...currentSelected, props.image.id],
      };
    } else {
      // Remove from selection
      selectingSignal.value = {
        ...selectingSignal.value,
        selectedItems: currentSelected.filter((id) => id !== props.image.id),
      };
    }
  };

  return (
    <div
      ref={props.isLastItem ? props.observerRef : null}
      class={cn("relative h-40", {
        "col-span-2": isLandscape,
      })}
    >
      {selectingSignal.value.isSelecting ? (
        <label class="group absolute top-1.5 left-1.5 cursor-pointer">
          <input type="checkbox" onChange={handleCheckboxChange} class="sr-only" />
          <div class="flex size-4.5 items-center justify-center border border-line-500 bg-white/40 transition-colors group-has-[:checked]:border-primary group-has-[:checked]:bg-primary">
            <Icon icon="heroicons:check-20-solid" className="h-3.5 w-3.5 text-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
          </div>
        </label>
      ) : (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button class="absolute top-3 left-2" type="button">
              <Icon icon="pepicons-pencil:dots-x" className={iconColor} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="flex w-40 flex-col items-stretch rounded-sm border-line-400 bg-white/70 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg">
            <ul class="flex flex-col gap-3">
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
              <a href={props.image.url} class="flex cursor-pointer items-center justify-between gap-2" target="_blank" onClick={() => setIsPopoverOpen(false)} download>
                <p class="font-medium text-sm">Download</p>
                <div class="min-w-5 p-1">
                  <Icon icon="iconoir:download" className="h-4 w-4 text-black" />
                </div>
              </a>
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
        crossOrigin="anonymous"
      />
    </div>
  );
};

const EmptyGallery = ({ folderName }: { folderName?: string }) => (
  <div class="flex flex-1 flex-col items-center justify-center gap-4">
    <div class="flex flex-col items-center gap-4">
      <h2 class="text-2xl leading-0">No images in this folder.</h2>
      <p class="font-medium text-grey-500 text-sm">Add images to {folderName || "this folder"} from your gallery</p>
    </div>
    <a href="/gallery" class="flex items-center gap-2 py-2">
      <p class="font-medium text-sm">Go to Gallery</p>
      <Icon icon="iconoir:arrow-right" className="h-5 w-5 text-black" />
    </a>
  </div>
);

const Tabs = ["solar:phone-linear", "ic:outline-whatsapp", "fluent:mail-20-regular"] as const;
type Tab = (typeof Tabs)[number];

export const NavBar = () => {
  // if (!headerContentSignal.value.showHeader) return null;

  if (selectingSignal.value.isSelecting) return null;

  return (
    <ul class="-translate-x-1/2 fixed bottom-6 left-1/2 flex items-center border border-line-500 bg-white p-0.5">
      <NavbarCard tab={Tabs[0]} />
      <NavbarCard tab={Tabs[1]} />
      <NavbarCard tab={Tabs[2]} />
    </ul>
  );
};

const NavbarCard = (props: { tab: Tab }) => {
  const getPublicFolderQuery = useGetPublicFolder();

  const user = getPublicFolderQuery.data?.data.user;

  const getLink = (tab: Tab) => {
    switch (tab) {
      case "solar:phone-linear":
        return `tel:${user?.phone_number}`;

      case "fluent:mail-20-regular":
        return `mailto:${user?.email}`;

      case "ic:outline-whatsapp":
        return `https://wa.me/${user?.phone_number}`;

      default:
        break;
    }
  };

  const link = getLink(props.tab);

  if (!link) return null;
  return (
    <>
      <a href={link} class="" target="_blank" rel="noreferrer">
        <li class={cn("grid h-9 w-14 place-content-center bg-white text-white capitalize transition-colors")}>
          <Icon icon={props.tab} fontSize={18} className="text-grey-500" />
        </li>
      </a>
      <div class="h-9 w-[1px] bg-line-500 last:hidden" />
    </>
  );
};
