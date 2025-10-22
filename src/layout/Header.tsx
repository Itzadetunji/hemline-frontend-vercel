import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import { useRef, useState } from "preact/hooks";

import { useUploadImages } from "@/api/http/v1/gallery/gallery.hooks";
import { AddToFolder } from "@/components/AddToFolder";
import { DeleteImages } from "@/components/DeleteImages";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import toast from "react-hot-toast";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Signal for header content that can be accessed anywhere
interface headerContentSignalType {
    title: string;
    showHeader: boolean;
    headerContent?: any;
    tab: Tab;
}
export const headerContentSignal = signal<headerContentSignalType>({
    showHeader: true,
    title: "Gallery",
    tab: "gallery",
});
export const selectingImagesSignal = signal<{
    isSelecting: boolean;
    selectedItems: string[];
}>({
    isSelecting: false,
    selectedItems: [],
});

export const Header = () => {
    const getUserProfile = useGetUserProfile();

    if (!headerContentSignal.value.showHeader) return null;

    return (
        <header class="sticky top-0 z-50 flex items-center justify-between gap-2 bg-white px-4 pt-4 pb-3">
            <h1 class="text-3xl text-[2rem] text-black">{headerContentSignal.value.title}</h1>
            <ul class="flex flex-1 items-center justify-end gap-3">
                {headerContentSignal.value.headerContent}
                <a href="/profile">
                    <li class="rounded-full size-9 -9 w-9 overflow-hidden">
                        <img src={getUserProfile.data?.data.user.business_image} alt="" />
                        <Avatar>
                            {(<AvatarImage src={getUserProfile.data?.data.user.business_image} />) as any}
                            <AvatarFallback>{getUserProfile.data?.data.user.full_name ? getInitials(getUserProfile.data?.data.user.full_name, true) : getInitials(getUserProfile.data?.data.user.email as string)}</AvatarFallback>
                        </Avatar>
                    </li>
                </a>
            </ul>
        </header>
    );
};

const Tabs = ["gallery", "clients", "folders"] as const;
type Tab = (typeof Tabs)[number];

export const NavBar = () => {
    if (!headerContentSignal.value.showHeader) return null;

    if (selectingImagesSignal.value.isSelecting) return <AddToFolderBar />;

    return (
        <ul class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-line-500 flex items-center p-0.5">
            {Tabs.map((tab) => (
                <NavbarCard tab={tab} />
            ))}
        </ul>
    );
};

const NavbarCard = (props: { tab: Tab }) => {
    return (
        <a href={`/${props.tab}`}>
            <li
                class={cn("capitalize bg-primary py-2.5 text-white px-4 transition-colors", {
                    "bg-transparent text-grey-500": headerContentSignal.value.tab !== props.tab,
                })}
            >
                {props.tab}
            </li>
        </a>
    );
};

export const AddToFolderBar = () => {
    const [addToFolder, setAddToFolder] = useState(false);
    const [deleteImages, setDeleteImages] = useState(false);

    const handleAddToFolder = () => {
        if (selectingImagesSignal.value.selectedItems.length === 0) {
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
        setAddToFolder(true);
    };

    const handleDeleteImages = () => {
        if (selectingImagesSignal.value.selectedItems.length === 0) {
            toast("Please select at least one image to delete", {
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
        setDeleteImages(true);
    };

    return (
        <>
            <ul class="fixed bottom-6 left-1/2 -translate-x-1/2 border border-line-500 flex items-center gap-0">
                <Button class="capitalize py-2.5 text-black px-4 gap-1" variant="secondary" onClick={handleAddToFolder}>
                    <div class="min-w-4.5">
                        <Icon icon="si:add-duotone" className="size-4.5" />
                    </div>
                    <p class="leading-0">Add To Folder</p>
                </Button>
                <Button class="capitalize py-2.5 text-destructive px-4 bg-white hover:bg-white/80 -ml-0.5 gap-1.5" onClick={handleDeleteImages}>
                    <div class="min-w-4.5">
                        <Icon icon="material-symbols-light:delete-outline-sharp" className="h-4.5 w-4.5" />
                    </div>
                    <p class="leading-0">Delete</p>
                </Button>
            </ul>

            <AddToFolder image_ids={selectingImagesSignal.value.selectedItems} addToFolder={addToFolder} setAddToFolder={setAddToFolder} />

            <DeleteImages image_ids={selectingImagesSignal.value.selectedItems} deleteImages={deleteImages} setDeleteImages={setDeleteImages} />
        </>
    );
};
