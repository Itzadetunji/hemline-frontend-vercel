import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { Icon } from "@iconify/react";
import { useLayoutEffect, useState } from "preact/hooks";
import { type ProfileTab, ProfileTabs } from "./components/ProfileTabs";
import { Account } from "./components/Account";
import { CustomFields } from "./components/CustomFields";

export const Profile = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>("custom_fields");
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
            <i>
              <Icon icon="iconoir:upload" className="h-4 w-4 text-black" />
            </i>
          </a>
          <a href="/gallery/folders" class="relative min-h-5 min-w-5 p-1">
            <Icon icon="bi:folder" className="h-4 w-4 text-black" />
            <p class="-top-0.5 -right-0.5 absolute grid min-h-3.5 min-w-3.5 place-content-center rounded-full bg-primary text-[0.625rem] text-white leading-0">
              {getUserProfile.data?.data.user.total_folders || 0}
            </p>
          </a>
        </>
      ),
    };
  }, []);

  return (
    <div class="flex flex-1 flex-col px-4 pt-6">
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "account" && <Account />}
      {activeTab === "custom_fields" && <CustomFields />}
    </div>
  );
};
