import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { Icon } from "@iconify/react";
import { useLayoutEffect } from "preact/hooks";
import { ProfileTabs } from "./components/ProfileTabs";

export const Profile = () => {
  const getUserProfile = useGetUserProfile();

  useLayoutEffect(() => {
    selectingSignal.value = {
      isSelecting: false,
      selectedItems: [],
    };

    headerContentSignal.value = {
      ...headerContentSignal.value,
      showHeader: true,
      title: () => <h1 class="truncate text-3xl text-black">Profile</h1>,
      tab: undefined,
      headerContent: () => (
        <>
          <a href="/gallery">
            <li>
              <i>
                <Icon icon="iconoir:upload" className="h-4 w-4 text-black" />
              </i>
            </li>
          </a>
          <a href="/gallery/folders">
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
    <div class="flex flex-1 flex-col pt-6 px-4">
      <ProfileTabs />
    </div>
  );
};
