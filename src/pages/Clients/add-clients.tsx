import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { Icon } from "@iconify/react";
import { useLayoutEffect, useState } from "preact/hooks";
import { deleteOrdersSignal } from "./orders/components/DeleteOrders";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { type AddClientsTab, AddClientsTabs } from "./components/AddTabs/AddClientsTabs";
import { DetailsTab } from "./components/AddTabs/DetailsTab";
import { OrdersTab } from "./components/AddTabs/OrdersTab";
import { MeasurementsTab } from "./components/AddTabs/MeasurementsTab";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateClientSchema, type CreateClientPayload } from "@/api/http/v1/clients/clients.types";
import { useCreateClient } from "@/api/http/v1/clients/clients.hooks";
import { useLocation } from "preact-iso";

export const AddClients = () => {
  const getUserProfile = useGetUserProfile();
  const [activeTab, setActiveTab] = useState<AddClientsTab>("details");
  const location = useLocation();
  const createClientMutation = useCreateClient();

  const formMethods = useForm<CreateClientPayload>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: {
      client: {
        first_name: "",
        last_name: "",
        gender: "Male",
        measurement_unit: "centimeters",
        phone_number: "",
        email: "",
        custom_fields: {},
        orders: [],
      },
    },
    mode: "onChange",
  });

  const onSubmit = async (payload: CreateClientPayload) => {
    await createClientMutation.mutateAsync(payload, {
      onSuccess: () => {
        location.route("/clients");
      },
      onError: (error) => {
        console.error("Client creation error:", error);
      },
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  const handleTabChange = async (newTab: AddClientsTab) => {
    // Validate current tab fields before switching
    if (activeTab === "details") {
      const isValid = await formMethods.trigger(["client.first_name", "client.last_name", "client.gender", "client.measurement_unit"]);
      if (!isValid) {
        return; // Don't switch tabs if validation fails
      }
    }
    setActiveTab(newTab);
  };

  useLayoutEffect(() => {
    selectingSignal.value = {
      isSelecting: false,
      selectedItems: [],
    };
    headerContentSignal.value = {
      ...headerContentSignal.value,
      showHeader: true,
      title: () => (
        <div class="-ml-2 flex items-center">
          <a href="/clients" class="size-6">
            <Icon icon="fluent:chevron-left-24-regular" fontSize={24} />
          </a>{" "}
          <h1 class="text-3xl text-black">Add Client</h1>{" "}
        </div>
      ),
      tab: "clients",
      headerContent: () => (
        <>
          <button
            class="flex items-center gap-1.5"
            type="button"
            onClick={() => {
              headerContentSignal.value = {
                ...headerContentSignal.value,
                showNavbar: !headerContentSignal.value.showNavbar,
              };
              deleteOrdersSignal.value = {
                ...deleteOrdersSignal.value,
                orderIds: [],
                isSelecting: !deleteOrdersSignal.value.isSelecting,
              };
            }}
          >
            <div class="min-h-5 min-w-5 p-1">
              <Icon icon="gala:select" className="h-4 w-4 text-black" />
            </div>
            {deleteOrdersSignal.value.isSelecting && <p class="font-medium text-sm">Deselect ({deleteOrdersSignal.value.orderIds?.length})</p>}
          </button>
          {!deleteOrdersSignal.value.isSelecting && (
            <>
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
          )}
        </>
      ),
    };
  }, []);
  return (
    <FormProvider {...formMethods}>
      {
        (
          <form onSubmit={handleSubmit} class="flex flex-1 flex-col px-4 pt-6">
            <AddClientsTabs activeTab={activeTab} setActiveTab={handleTabChange} />

            {activeTab === "details" && <DetailsTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "measurements" && <MeasurementsTab />}
          </form>
        ) as any
      }
    </FormProvider>
  );
};
