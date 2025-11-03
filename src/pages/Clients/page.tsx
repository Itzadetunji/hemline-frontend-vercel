import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { Icon } from "@iconify/react";
import { useLayoutEffect } from "preact/hooks";

export const Clients = () => {
  const getUserProfile = useGetUserProfile();

  useLayoutEffect(() => {
    selectingSignal.value = {
      isSelecting: false,
      selectedItems: [],
    };
    headerContentSignal.value = {
      ...headerContentSignal.value,
      showHeader: true,
      title: () => <h1 class="text-3xl text-black">Clients</h1>,
      tab: "clients",
      headerContent: () => (
        <>
          {/* <button
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
          </button> */}
          <a href="/gallery" class="relative min-h-5 min-w-5 p-1">
            <Icon icon="iconoir:upload" className="h-4 w-4 text-black" />
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
    <div class="flex flex-1 flex-col gap-10 px-4 pb-8">
      <NoClients />
    </div>
  );
};

const NoClients = () => {
  return (
    <div class="flex flex-1 flex-col items-stretch">
      <div class="flex flex-1 flex-col items-center justify-center gap-4">
        <div class="flex flex-col items-center gap-4">
          <h2 class="text-2xl leading-0">No saved clients</h2>
          <p class="max-w-8/10 text-center font-medium text-grey-500 text-sm">Save your clients info here by clicking on the button below</p>
        </div>
        <a class="flex items-center gap-2 py-2" href="/clients/add">
          <p class="font-medium text-sm">Add Client</p>
          <Icon icon="si:add-duotone" className="h-5 w-5 text-black" />
        </a>
      </div>
    </div>
  );
};
