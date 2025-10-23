import { type Dispatch, type StateUpdater, useLayoutEffect, useState } from "preact/hooks";

import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { userSignal } from "@/stores/userStore";
import type { Folder } from "@/api/http/v1/gallery/folders.types";
import { useGetFolders } from "@/api/http/v1/gallery/folders.hooks";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteFolderDialog } from "./components/DeleteFolderDialog";
import { EditFolderDialog } from "./components/EditFolderDialog";
import { cn } from "@/lib/utils";

export const Folders = () => {
  const [step, setStep] = useState(2);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const getUserProfile = useGetUserProfile();

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
          {selectingSignal.value.isSelecting && selectingSignal.value.selectedItems.length > 0 && (
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
          )}
          <a href="/folders">
            <li class="relative min-h-5 min-w-5 p-1">
              <Icon icon="bi:folder" className="h-4 w-4 text-black" />
              <p class="-top-0.5 -right-0.5 absolute grid min-h-3.5 min-w-3.5 place-content-center rounded-full bg-primary text-[0.625rem] text-white leading-0">
                {getUserProfile.data?.data.user.total_folders || 0}
              </p>
            </li>
          </a>
        </>
      ),
    };
  }, []);

  return (
    <div class="flex flex-1 flex-col gap-10 px-4 pb-8">
      <button class="flex items-center gap-2" type="button" onClick={() => setStep(1)}>
        <Icon icon="material-symbols-light:help-outline-rounded" className="text-black" fontSize={16} />
        <p class="font-medium text-sm">What is a folder?</p>
      </button>
      {userSignal.value?.user?.total_folders === 0 && <NoFolders step={step} setStep={setStep} />}
      {Boolean(userSignal.value?.user?.total_folders) && (
        <AllFolders step={step} setStep={setStep} setShowDeleteDialog={setShowDeleteDialog} setShowRenameDialog={setShowRenameDialog} setSelectedFolder={setSelectedFolder} />
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && <DeleteFolderDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} selectedFolder={selectedFolder} />}

      {/* Rename Dialog */}
      {showRenameDialog && selectedFolder && <EditFolderDialog open={showRenameDialog} onOpenChange={setShowRenameDialog} folder={selectedFolder} />}
    </div>
  );
};

interface Mainprops {
  step: number;
  setStep: Dispatch<StateUpdater<number>>;
  setShowDeleteDialog?: Dispatch<StateUpdater<boolean>>;
  setShowRenameDialog?: Dispatch<StateUpdater<boolean>>;
  setSelectedFolder?: Dispatch<StateUpdater<Folder | null>>;
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
          <button class="flex items-center gap-2 py-2" type="button">
            <p class="font-medium text-sm">Upload</p>
            <Icon icon="si:add-duotone" className="h-5 w-5 text-black" />
          </button>
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

interface FolderCardProps {
  folder: Folder;
  setShowDeleteDialog?: Dispatch<StateUpdater<boolean>>;
  setShowRenameDialog?: Dispatch<StateUpdater<boolean>>;
  setSelectedFolder?: Dispatch<StateUpdater<Folder | null>>;
}

const AllFolders = (props: Mainprops) => {
  const getFoldersQuery = useGetFolders();
  if (props.step === 1) return <FoldersStep1 step={props.step} setStep={props.setStep} />;

  if (props.step === 2)
    return (
      getFoldersQuery.data &&
      getFoldersQuery.data.data.length > 0 && (
        <>
          {selectingSignal.value.isSelecting && <DeleteManyBar setSelectedFolder={props.setSelectedFolder} setShowDeleteDialog={props.setShowDeleteDialog} />}
          <div class="grid grid-cols-3 gap-8">
            {getFoldersQuery.data.data.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                setShowDeleteDialog={props.setShowDeleteDialog}
                setShowRenameDialog={props.setShowRenameDialog}
                setSelectedFolder={props.setSelectedFolder}
              />
            ))}
          </div>
        </>
      )
    );
};

const FolderCard = (props: FolderCardProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
    <a
      href={selectingSignal.value.isSelecting ? undefined : `/folders/${props.folder.id}`}
      onClick={(e) => {
        if (selectingSignal.value.isSelecting) {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      <figure class="flex flex-col items-center gap-1 overflow-hidden">
        <div class="relative cursor-pointer overflow-hidden">
          <img src={`/assets/folder-icons/folder-${folderIconNumber}.png`} alt={props.folder.name} class="h-15.5 w-17.25" />
          {props.folder.cover_image && (
            <img src={props.folder.cover_image} alt={props.folder.name} class="-translate-x-1/2 absolute top-6 left-1/2 h-8 w-11 bg-[red] object-cover" />
          )}
        </div>
        <figcaption class="flex w-full flex-col items-center text-center">
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
                  <PopoverTrigger asChild>
                    <button type="button" onClick={(e) => e.stopPropagation()}>
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
        </figcaption>
      </figure>
    </a>
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
