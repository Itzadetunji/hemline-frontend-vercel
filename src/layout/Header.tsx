import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";

import { useGetUserProfile, useLogout } from "@/api/http/v1/users/users.hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageCache } from "@/hooks/useImageCache";
import { cn, getInitials } from "@/lib/utils";

// Signal for header content that can be accessed anywhere
interface headerContentSignalType {
  title: any;
  showHeader: boolean;
  showNavbar: boolean;
  headerContent?: any;
  tab?: "gallery" | "clients" | "folders";
}
export const headerContentSignal = signal<headerContentSignalType>({
  showHeader: true,
  showNavbar: true,
  title: "Gallery",
  tab: "gallery",
});

export const selectingSignal = signal<{
  isSelecting: boolean;
  selectedItems: string[];
}>({
  isSelecting: false,
  selectedItems: [],
});

export const Header = () => {
  const getUserProfile = useGetUserProfile();
  const logoutMutation = useLogout();
  const { cachedUrl, isLoading: loading } = useImageCache(getUserProfile.data?.data.user.business_image);

  if (!headerContentSignal.value.showHeader) return null;

  const headerContent = typeof headerContentSignal.value.headerContent === "function" ? headerContentSignal.value.headerContent() : headerContentSignal.value.headerContent;
  const headerTitleContent = typeof headerContentSignal.value.title === "function" ? headerContentSignal.value.title() : headerContentSignal.value.title;

  return (
    <header class="sticky top-0 z-50 flex items-center justify-between gap-2 bg-white px-4 pt-4 pb-3">
      {headerTitleContent}
      <ul class="flex items-center justify-end gap-3">
        {headerContent}
        <Popover>
          <PopoverTrigger asChild>
            <li class="relative size-9 overflow-hidden rounded-full">
              {getUserProfile.data?.data.user.business_image ? (
                <>
                  {loading && <Skeleton class="absolute inset-0 size-9 h-full w-full rounded-full" />}

                  <img
                    src={cachedUrl}
                    alt="Business Logo"
                    class={cn("size-9 h-full w-full object-cover transition-opacity duration-300", loading ? "opacity-0" : "opacity-100")}
                    crossOrigin="anonymous"
                  />
                </>
              ) : (
                <div class="grid size-9 place-content-center rounded-full bg-primary text-center font-medium text-white text-xl">
                  {getUserProfile.data?.data.user && getInitials(getUserProfile.data?.data.user.business_name ?? getUserProfile.data?.data.user.full_name)}
                </div>
              )}
            </li>
          </PopoverTrigger>
          <PopoverContent className="!top-14 !right-124 mr-4 flex w-40 flex-col items-stretch rounded-sm border-line-400 bg-white/70 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg">
            <ul class="flex flex-col gap-3">
              <a href="/profile" class="flex cursor-pointer items-center justify-between gap-2 text-grey-500 hover:bg-secondary">
                <p class="font-medium text-sm">Profile</p>
                <div class="min-w-5 p-1">
                  <Icon icon="hugeicons:user-02" className="h-4 w-4 text-black" />
                </div>
              </a>
              <button
                type="button"
                class="flex cursor-pointer items-center justify-between gap-2 text-destructive hover:bg-secondary"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <p class="font-medium text-sm">Logout</p>

                <div class="min-w-5 p-1">
                  <Icon icon="ion:log-out-outline" className="h-4 w-4" />
                </div>
              </button>
            </ul>
          </PopoverContent>
        </Popover>
      </ul>
    </header>
  );
};

const Tabs = [
  { title: "gallery", link: "gallery" },
  { title: "clients", link: "clients" },
  { title: "folders", link: "gallery/folders" },
] as const;
type Tab = (typeof Tabs)[number];

export const NavBar = () => {
  if (!headerContentSignal.value.showNavbar) return null;
  if (!headerContentSignal.value.showHeader) return null;

  if (selectingSignal.value.isSelecting) return null;

  return (
    <ul class="-translate-x-1/2 fixed bottom-6 left-1/2 flex items-center border border-line-500 bg-white p-0.5">
      {Tabs.map((tab) => (
        <NavbarCard tab={tab} />
      ))}
    </ul>
  );
};

const NavbarCard = (props: { tab: Tab }) => {
  return (
    <a href={`/${props.tab.link}`}>
      <li
        class={cn("bg-primary px-4 py-2.5 text-white capitalize transition-colors", {
          "bg-transparent text-grey-500": headerContentSignal.value.tab !== props.tab.title,
        })}
      >
        {props.tab.title}
      </li>
    </a>
  );
};
