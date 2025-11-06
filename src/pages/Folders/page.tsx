import { Icon } from "@iconify/react";
import { useLocation } from "preact-iso";
import { type Dispatch, type StateUpdater, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { useInfiniteGetFolders } from "@/api/http/v1/gallery/folders/folders.hooks";
import type { Folder } from "@/api/http/v1/gallery/folders/folders.types";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { cn } from "@/lib/utils";
import { userSignal } from "@/stores/userStore";
import { DeleteFolderDialog } from "./components/DeleteFolderDialog";
import { EditFolderDialog } from "./components/EditFolderDialog";
import { SelectFolderType } from "./components/SelectFolderType";
import { ShareToClientDialog } from "./components/ShareToClientDialog";

export const Folders = () => {
  const [step, setStep] = useState(2);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showSelectFolder, setShowSelectFolder] = useState(false);
  const [shareClientDialog, showShareClientDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const getUserProfile = useGetUserProfile();
  const { data, isLoading, isFetchingNextPage, isFetching, hasNextPage, fetchNextPage } = useInfiniteGetFolders(20);

  // Flatten all pages into a single array of folders
  const allFolders = data?.pages.flatMap((page) => page.data) ?? [];

  useLayoutEffect(() => {
    selectingSignal.value = {
      isSelecting: false,
      selectedItems: [],
    };
    headerContentSignal.value = {
      ...headerContentSignal.value,
      showHeader: true,
      title: () => <h1 class="text-3xl text-black">Folders</h1>,
      tab: "folders",
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
          {/* {selectingSignal.value.isSelecting && selectingSignal.value.selectedItems.length > 0 && (
            <button
              class="flex items-center gap-1.5"
              type="button"
              onClick={() => {
                setSelectedFolder(null);
                setShowDeleteDialog(true);
              }}
            >
              <Icon icon="material-symbols-light:delete-outline-sharp" className="h-5 w-5 text-destructive" />
            </button>
          )} */}
          {!selectingSignal.value.isSelecting && (
            <>
              {/* <button class="min-h-5 min-w-5 p-1" type="button" onClick={() => setShowSelectFolder(true)}>
                <Icon icon="iconoir:upload" className="h-4 w-4 text-black" />
              </button> */}
              <a href="/gallery">
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
    <div class="flex flex-1 flex-col gap-10 px-4 pb-8">
      <ul class="flex items-center justify-between gap-4">
        <Button class="!p-0 flex w-fit items-center gap-2" variant="ghost" onClick={() => setStep(1)}>
          <span class="size-4">
            <Icon icon="material-symbols-light:help-outline-rounded" className="text-black" fontSize={16} />
          </span>
          <p class="font-medium text-sm">What is a folder?</p>
        </Button>
        <Button class="!p-0 flex w-fit items-center gap-2" variant="ghost" onClick={() => setShowSelectFolder(true)}>
          <span class="size-4">
            <Icon icon="si:add-duotone" className="size-4" />
          </span>
          <p class="text-sm">Create New Folder</p>
        </Button>
      </ul>
      {!isLoading && allFolders.length === 0 && <NoFolders step={step} setStep={setStep} setShowSelectFolder={setShowSelectFolder} />}
      {!isLoading && allFolders.length > 0 && (
        <AllFolders
          step={step}
          setStep={setStep}
          setShowDeleteDialog={setShowDeleteDialog}
          setShowRenameDialog={setShowRenameDialog}
          setSelectedFolder={setSelectedFolder}
          showShareClientDialog={showShareClientDialog}
          allFolders={allFolders}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isFetching={isFetching}
        />
      )}

      {isFetching && !isFetchingNextPage && <FoldersSkeleton />}

      {/* Delete Dialog */}
      {showDeleteDialog && <DeleteFolderDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} selectedFolder={selectedFolder} />}

      {/* Rename Dialog */}
      {showRenameDialog && selectedFolder && <EditFolderDialog open={showRenameDialog} onOpenChange={setShowRenameDialog} folder={selectedFolder} />}

      {/* Select Folder Type Dialog */}

      <SelectFolderType
        isOpen={showSelectFolder}
        onClose={() => {
          setShowSelectFolder(false);
        }}
      />

      {shareClientDialog && selectedFolder && <ShareToClientDialog folder={selectedFolder} open={shareClientDialog} onOpenChange={showShareClientDialog} />}
    </div>
  );
};

interface Mainprops {
  step: number;
  setStep: Dispatch<StateUpdater<number>>;
  setShowDeleteDialog?: Dispatch<StateUpdater<boolean>>;
  setShowRenameDialog?: Dispatch<StateUpdater<boolean>>;
  setSelectedFolder?: Dispatch<StateUpdater<Folder | null>>;
  setShowSelectFolder?: Dispatch<StateUpdater<boolean>>;
  showShareClientDialog?: Dispatch<StateUpdater<boolean>>;
  allFolders?: Folder[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetching?: boolean;
}

const NoFolders = (props: Mainprops) => {
  useLayoutEffect(() => {
    userSignal.value?.user?.total_folders === 0 && props.setStep(1);
  }, []);

  if (props.step === 1) return <FoldersStep1 step={props.step} setStep={props.setStep} />;
  if (props.step === 2)
    return (
      <div class="flex flex-1 flex-col items-stretch">
        <div class="flex flex-1 flex-col items-center justify-center gap-4">
          <div class="flex flex-col items-center gap-4">
            <h2 class="text-2xl leading-0">Folder is empty</h2>
            <p class="max-w-8/10 text-center font-medium text-grey-500 text-sm">Create a folder by selecting from your uploaded works</p>
          </div>
          <a class="flex items-center gap-2 py-2" href="/gallery" onClick={() => props.setShowSelectFolder?.(true)}>
            <p class="font-medium text-sm">Upload</p>
            <Icon icon="si:add-duotone" className="h-5 w-5 text-black" />
          </a>
        </div>
      </div>
    );
};

const FoldersStep1 = (props: Mainprops) => {
  return (
    <div class="flex flex-col items-center gap-24">
      <div class="flex flex-1 flex-col gap-10">
        <h2 class="text-3xl">Benefits of uploading your works to folders</h2>
        <ul class="flex flex-col gap-8">
          {FOLDER_BENEFITS.map((benefit) => (
            <li key={benefit.icon} class="flex items-start gap-6">
              <i class="grid size-5.5 place-content-center">
                <Icon icon={benefit.icon} className="flex-shrink-0 text-primary" fontSize={22} />
              </i>
              <div class="flex flex-col gap-2">
                <p class="font-semibold text-base text-black">{benefit.title}</p>
                <p class="text-grey-500 text-sm">{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={() => props.setStep(2)} class="px-6">
        Continue
      </Button>
    </div>
  );
};

const FOLDER_BENEFITS = [
  {
    icon: "f7:square-stack-3d-down-right",
    title: "Keeps works organized",
    description: "Keep related work in the same folder. This helps to keep things more organized.",
  },
  {
    icon: "lineicons:share-1",
    title: "Share to clients easily",
    description: "We generate a copy link for each folder. You can share with your clients for them to view your works relating to what they need.",
  },
  {
    icon: "solar:hand-money-linear",
    title: "Win more clients",
    description: "Your folder is your online portfolio, upload your best works and impress your clients.",
  },
];

const AllFolders = (props: Mainprops) => {
  if (props.step === 1) return <FoldersStep1 step={props.step} setStep={props.setStep} />;

  if (props.step === 2)
    return (
      <>
        {selectingSignal.value.isSelecting && <DeleteManyBar setSelectedFolder={props.setSelectedFolder} setShowDeleteDialog={props.setShowDeleteDialog} />}
        <FoldersList
          folders={props.allFolders || []}
          hasNextPage={props.hasNextPage || false}
          isFetchingNextPage={props.isFetchingNextPage || false}
          fetchNextPage={
            props.fetchNextPage ||
            (() => {
              /* no-op */
            })
          }
          isFetching={props.isFetching || false}
          setShowDeleteDialog={props.setShowDeleteDialog}
          setShowRenameDialog={props.setShowRenameDialog}
          setSelectedFolder={props.setSelectedFolder}
          showShareClientDialog={props.showShareClientDialog}
        />
      </>
    );
};

interface FoldersListProps {
  folders: Folder[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  fetchNextPage: () => void;
  setShowDeleteDialog?: Dispatch<StateUpdater<boolean>>;
  setShowRenameDialog?: Dispatch<StateUpdater<boolean>>;
  setSelectedFolder?: Dispatch<StateUpdater<Folder | null>>;
  showShareClientDialog?: Dispatch<StateUpdater<boolean>>;
}

const FoldersList = (props: FoldersListProps) => {
  const observerTarget = useRef<HTMLButtonElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && props.hasNextPage && !props.isFetchingNextPage) {
          props.fetchNextPage();
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
  }, [props.hasNextPage, props.isFetchingNextPage, props.fetchNextPage]);

  // Get the last folder to attach the observer
  const lastFolder = props.folders[props.folders.length - 1];

  return (
    <>
      {!props.isFetching && props.folders.length > 0 && (
        <div class="grid grid-cols-3 gap-8">
          {props.folders.map((folder) => {
            const isLastItem = folder.id === lastFolder?.id;
            return (
              <FolderCard
                key={folder.id}
                folder={folder}
                setShowDeleteDialog={props.setShowDeleteDialog}
                setShowRenameDialog={props.setShowRenameDialog}
                setSelectedFolder={props.setSelectedFolder}
                showShareClientDialog={props.showShareClientDialog}
                isLastItem={isLastItem}
                observerRef={isLastItem ? observerTarget : undefined}
              />
            );
          })}
        </div>
      )}
      {props.isFetchingNextPage && <FoldersSkeleton />}
    </>
  );
};

export const FoldersSkeleton = () => {
  return (
    <div class="grid grid-cols-3 gap-8">
      <div class="flex flex-col items-center gap-1">
        <Skeleton class="h-15.5 w-17.25 rounded-xs" />
        <div class="flex w-full flex-col items-center gap-1">
          <Skeleton class="h-4 w-12.5 rounded-xs" />
          <div class="flex items-center gap-3">
            <Skeleton class="h-3 w-8 rounded-xs" />
            <Skeleton class="size-4 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FolderCardProps {
  folder: Folder;
  setShowDeleteDialog?: Dispatch<StateUpdater<boolean>>;
  setShowRenameDialog?: Dispatch<StateUpdater<boolean>>;
  setSelectedFolder?: Dispatch<StateUpdater<Folder | null>>;
  showShareClientDialog?: Dispatch<StateUpdater<boolean>>;
  isLastItem?: boolean;
  observerRef?: { current: HTMLButtonElement | null };
}

const FolderCard = (props: FolderCardProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const location = useLocation();

  const folderIconNumber = props.folder.folder_color ? props.folder.folder_color : Math.floor(Math.random() * 9);
  const itemCount = props.folder.image_ids?.length || 0;

  const isSelected = selectingSignal.value.selectedItems.includes(props.folder.id);

  const handleSelect = () => {
    if (selectingSignal.value.isSelecting) {
      if (isSelected) {
        // Remove from selection
        selectingSignal.value = {
          ...selectingSignal.value,
          selectedItems: selectingSignal.value.selectedItems.filter((id) => id !== props.folder.id),
        };
      } else {
        // Add to selection
        selectingSignal.value = {
          ...selectingSignal.value,
          selectedItems: [...selectingSignal.value.selectedItems, props.folder.id],
        };
      }
    }
  };

  return (
    <button
      class="flex flex-col items-center gap-1 overflow-hidden"
      onClick={(e) => {
        if (selectingSignal.value.isSelecting) {
          e.preventDefault();
          handleSelect();
          return;
        }
        location.route(`/gallery/folders/${props.folder.id}`);
      }}
      type="button"
      ref={props.isLastItem ? props.observerRef : null}
    >
      <div class="relative cursor-pointer overflow-hidden">
        <img src={`/assets/folder-icons/folder-${folderIconNumber}.png`} alt={props.folder.name} class="h-15.5 w-17.25" />
        {props.folder.cover_image && <img src={props.folder.cover_image} alt={props.folder.name} class="-translate-x-1/2 absolute top-6 left-1/2 h-8 w-11 bg-[red] object-cover" />}
      </div>
      <div class="flex w-full flex-col items-center text-center">
        <p class="max-w-[10ch] truncate text-center font-medium text-sm">{props.folder.name}</p>
        <div class="flex items-center justify-center gap-3">
          <p class="text-grey-500 text-xs leading-4">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <div class="grid size-4.5 place-content-center rounded-full border border-line-500">
            {selectingSignal.value.isSelecting ? (
              <button
                type="button"
                class={cn("flex size-4 items-center justify-center rounded-full", isSelected && "bg-primary")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect();
                }}
              >
                {isSelected && <Icon icon="charm:tick" className="size-3 text-white" />}
              </button>
            ) : (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild onClick={(e: Event) => e.stopPropagation()}>
                  <button type="button" class="min-h-4 min-w-4">
                    <Icon icon="pepicons-pencil:dots-x" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="flex w-40 flex-col items-stretch rounded-sm border-line-400 bg-white/70 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg">
                  <ul class="flex flex-col gap-3">
                    <button
                      type="button"
                      class="flex cursor-pointer items-center justify-between gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPopoverOpen(false);
                        props.setSelectedFolder?.(props.folder);
                        props.showShareClientDialog?.(true);
                      }}
                    >
                      <p class="font-medium text-sm">Share to Client</p>
                      <div class="min-w-5 p-1">
                        <Icon icon="lineicons:share-1" className="h-4 w-4 text-black" />
                      </div>
                    </button>
                    <button
                      type="button"
                      class="flex cursor-pointer items-center justify-between gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPopoverOpen(false);
                        props.setSelectedFolder?.(props.folder);
                        props.setShowRenameDialog?.(true);
                      }}
                    >
                      <p class="font-medium text-sm">Edit</p>
                      <div class="min-w-5 p-1">
                        <Icon icon="iconoir:edit" className="h-4 w-4 text-black" />
                      </div>
                    </button>
                    <button
                      type="button"
                      class="flex cursor-pointer items-center justify-between gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPopoverOpen(false);
                        props.setSelectedFolder?.(props.folder);
                        props.setShowDeleteDialog?.(true);
                      }}
                    >
                      <p class="font-medium text-destructive text-sm">Delete</p>
                      <div class="min-w-5 p-1">
                        <Icon icon="material-symbols-light:delete-outline-sharp" className="h-4 w-4 text-destructive" />
                      </div>
                    </button>
                    <li class="flex cursor-pointer items-center justify-between gap-2">
                      <p class="font-medium text-sm">Created</p>
                      <span class="text-sm">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        }).format(new Date(props.folder.created_at))}
                      </span>
                    </li>
                  </ul>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

const DeleteManyBar = (props: { setSelectedFolder?: Dispatch<StateUpdater<Folder | null>>; setShowDeleteDialog?: Dispatch<StateUpdater<boolean>> }) => {
  return (
    <ul class="-translate-x-1/2 fixed bottom-6 left-1/2 flex items-center gap-0 border border-line-500">
      <Button
        class="gap-1.5 bg-white px-4 py-2.5 text-destructive capitalize hover:bg-white/80"
        onClick={() => {
          props.setSelectedFolder?.(null);
          props.setShowDeleteDialog?.(true);
        }}
      >
        <div class="min-w-4.5">
          <Icon icon="material-symbols-light:delete-outline-sharp" className="h-4.5 w-4.5" />
        </div>
        <p class="leading-0">Delete</p>
      </Button>
    </ul>
  );
};
