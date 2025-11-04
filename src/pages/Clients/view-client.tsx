import { useGetClient, useUpdateClient } from "@/api/http/v1/clients/clients.hooks";
import { UpdateClientSchema, type UpdateClientPayload } from "@/api/http/v1/clients/clients.types";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useLocation, useRoute } from "preact-iso";
import { useLayoutEffect, useState } from "preact/hooks";
import { FormProvider, useForm } from "react-hook-form";
import { AddClientsTabs, type AddClientsTab } from "./components/AddTabs/AddClientsTabs";
import { EditDetailsTab } from "./components/EditTabs/EditDetailsTab";
import { EditMeasurementsTab } from "./components/EditTabs/EditMeasurementsTab";
import toast from "react-hot-toast";
import { signal } from "@preact/signals";

interface EditingClientSignalProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

export const EditingClientSignal = signal<EditingClientSignalProps>({
  isEditing: false,
  setIsEditing: (isEditing: boolean) => {
    EditingClientSignal.value = {
      ...EditingClientSignal.value,
      isEditing,
    };
  },
});

export const ViewClient = () => {
  const [activeTab, setActiveTab] = useState<AddClientsTab>("details");
  const { params } = useRoute();

  const getUserProfile = useGetUserProfile();
  const updateClientMutation = useUpdateClient();

  const getClientQuery = useGetClient(params.client_id as string);

  const formMethods = useForm<UpdateClientPayload>({
    resolver: zodResolver(UpdateClientSchema) as any,
    defaultValues: {
      client: {
        first_name: "",
        last_name: "",
        gender: "Male",
        measurement_unit: "centimeters",
        phone_number: "",
        email: "",
        custom_fields: {},
      },
    },
    mode: "onChange",
  });

  const onSubmit = async (payload: UpdateClientPayload) => {
    await updateClientMutation.mutateAsync(
      {
        id: params.client_id as string,
        payload: payload,
      },
      {
        onSuccess: (result) => {
          toast.success(`${result.data.attributes.first_name} updated successfully`);
          EditingClientSignal.value.setIsEditing(false);
        },
        onError: (error, variables) => {
          toast.success(`${variables.payload.client.first_name} updated successfully`);
          console.error("Client creation error:", error);
        },
      }
    );
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
        <div class="-ml-2 flex items-center" onClick={() => console.log(formMethods.getValues())}>
          <a href="/clients" class="size-6">
            <Icon icon="fluent:chevron-left-24-regular" fontSize={24} />
          </a>{" "}
          <h1 class="text-3xl text-black">{getClientQuery.data?.data.data.attributes.first_name}</h1>{" "}
        </div>
      ),
      tab: "clients",
      headerContent: () => (
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
      ),
    };
  }, []);

  useLayoutEffect(() => {
    if (getClientQuery.data) {
      formMethods.reset({
        client: {
          ...(getClientQuery.data.data.data.attributes as UpdateClientPayload["client"]),
          custom_fields:
            getClientQuery.data?.data.data.attributes.custom_fields?.reduce(
              (acc, field) => {
                acc[field.key] = field.value;
                return acc;
              },
              {} as Record<string, string>
            ) || {},
        },
      });
      headerContentSignal.value = {
        ...headerContentSignal.value,
        title: () => (
          <div class="-ml-2 flex items-center" onClick={() => console.log(formMethods.getValues(), formMethods.formState.errors)}>
            <a href="/clients" class="size-6">
              <Icon icon="fluent:chevron-left-24-regular" fontSize={24} />
            </a>{" "}
            <h1 class="text-3xl text-black">{getClientQuery.data?.data.data.attributes.first_name}</h1>{" "}
          </div>
        ),
      };
    }
  }, [getClientQuery.data]);

  return (
    <FormProvider {...formMethods}>
      {
        (
          <form onSubmit={handleSubmit} class="flex flex-1 flex-col px-4 pt-6">
            <AddClientsTabs activeTab={activeTab} setActiveTab={handleTabChange} />

            {getClientQuery.isLoading ? (
              <div class="flex flex-1 items-center justify-center">
                <img src="/assets/brand/logo.svg" class="animate-pulse" alt="Brand Logo" />
              </div>
            ) : (
              <>
                {activeTab === "details" && <EditDetailsTab />}
                {activeTab === "measurements" && <EditMeasurementsTab />}
              </>
            )}
          </form>
        ) as any
      }
    </FormProvider>
  );
};
