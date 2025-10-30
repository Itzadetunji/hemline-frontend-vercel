import { signal } from "@preact/signals";

import { useGetUserProfile, useLogout } from "@/api/http/v1/users/users.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@iconify/react";

// Signal for header content that can be accessed anywhere
interface headerContentSignalType {
  title: any;
  showHeader: boolean;
  headerContent?: any;
  tab: "gallery" | "clients" | "folders";
}
export const headerContentSignal = signal<headerContentSignalType>({
  showHeader: true,
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
            <li class="-9 size-9 w-9 overflow-hidden rounded-full">
              <img src={getUserProfile.data?.data.user.business_image} alt="" />
              <Avatar>
                {(<AvatarImage src={getUserProfile.data?.data.user.business_image} />) as any}
                <AvatarFallback>
                  {getUserProfile.data?.data.user.full_name
                    ? getInitials(getUserProfile.data?.data.user.full_name, true)
                    : getInitials(getUserProfile.data?.data.user.email as string)}
                </AvatarFallback>
              </Avatar>
            </li>
          </PopoverTrigger>
          <PopoverContent className="!top-14 !right-124 mr-4 flex w-40 flex-col items-stretch rounded-sm border-line-400 bg-white/70 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg">
            <ul class="flex flex-col gap-3">
              <a href="/profile" class="flex cursor-pointer items-center justify-between gap-2 text-grey-500 hover:bg-secondary">
                <p class="font-medium text-sm">Profile</p>
                <div class="min-w-5 p-1">
                  <Icon icon="iconoir:download" className="h-4 w-4 text-black" />
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
