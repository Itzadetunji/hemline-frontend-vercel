import { signal } from "@preact/signals";

import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

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

  if (!headerContentSignal.value.showHeader) return null;

  const headerContent = typeof headerContentSignal.value.headerContent === "function" ? headerContentSignal.value.headerContent() : headerContentSignal.value.headerContent;
  const headerTitleContent = typeof headerContentSignal.value.title === "function" ? headerContentSignal.value.title() : headerContentSignal.value.title;

  return (
    <header class="sticky top-0 z-50 flex items-center justify-between gap-2 bg-white px-4 pt-4 pb-3">
      {headerTitleContent}
      <ul class="flex items-center justify-end gap-3">
        {headerContent}
        <a href="/profile">
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
        </a>
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
