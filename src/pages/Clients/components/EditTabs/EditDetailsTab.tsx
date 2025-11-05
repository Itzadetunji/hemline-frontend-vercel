import { useRoute } from "preact-iso";
import { Controller, useFormContext } from "react-hook-form";

import { useGetClient } from "@/api/http/v1/clients/clients.hooks";
import type { UpdateClientPayload } from "@/api/http/v1/clients/clients.types";
import { Gender, MeasurementUnit } from "@/api/http/v1/clients/clients.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EditingClientSignal } from "../../view-client";

export const EditDetailsTab = () => {
  const { params } = useRoute();
  const formMethods = useFormContext<UpdateClientPayload>();

  const getClientQuery = useGetClient(params.client_id as string);

  const onCancel = () => {
    formMethods.reset({
      client: {
        ...(getClientQuery.data?.data.data.attributes as UpdateClientPayload["client"]),
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
    EditingClientSignal.value.setIsEditing(false);
  };

  return (
    <>
      <div class="mt-8">
        <p class="font-medium text-base">Client info</p>
        <p class="text-grey text-sm">Edit your clients basic info below</p>
      </div>
      <ul class="mt-7 flex flex-col gap-6">
        <div class="flex items-start justify-between gap-4">
          <Label class="flex min-w-0 flex-1 flex-col items-stretch gap-4">
            <p class="font-medium text-sm leading-0">First Name</p>
            <Controller
              name="client.first_name"
              control={formMethods.control}
              render={({ field }) =>
                (
                  <div class="flex flex-col gap-1.5">
                    <input
                      {...field}
                      placeholder="First Name"
                      class="flex min-h-10.5 flex-1 items-center gap-3.5 border border-line-700 px-3 text-sm placeholder:text-grey-400 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!EditingClientSignal.value.isEditing}
                    />
                    {formMethods.formState.errors.client?.first_name && <p class="text-red-500 text-xs">{formMethods.formState.errors.client.first_name.message}</p>}
                  </div>
                ) as any
              }
            />
          </Label>
          <Label class="flex min-w-0 flex-1 flex-col items-stretch gap-4">
            <p class="font-medium text-sm leading-0">Last Name</p>
            <Controller
              name="client.last_name"
              control={formMethods.control}
              render={({ field }) =>
                (
                  <div class="flex flex-col gap-1.5">
                    <input
                      {...field}
                      placeholder="Last Name"
                      class="flex min-h-10.5 flex-1 items-center gap-3.5 border border-line-700 px-3 text-sm placeholder:text-grey-400 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!EditingClientSignal.value.isEditing}
                    />
                    {formMethods.formState.errors.client?.last_name && <p class="text-red-500 text-xs">{formMethods.formState.errors.client.last_name.message}</p>}
                  </div>
                ) as any
              }
            />
          </Label>
        </div>
        {/* Gender */}
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Gender</p>
          <Controller
            name="client.gender"
            control={formMethods.control}
            render={({ field }) =>
              (
                <div class="flex flex-col gap-2">
                  <Select
                    options={Gender.map((gender) => ({
                      label: gender,
                      value: gender,
                    }))}
                    value={field.value ? [field.value] : []}
                    onChange={(selected) => field.onChange(selected[0] || "")}
                    placeholder="Select gender"
                    icon={null}
                    maxItems={1}
                    disabled={!EditingClientSignal.value.isEditing}
                  />
                  {formMethods.formState.errors.client?.gender && <p class="text-red-500 text-xs">{formMethods.formState.errors.client.gender.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>
        {/* Measurement Unit */}
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Measurement Unit</p>
          <Controller
            name="client.measurement_unit"
            control={formMethods.control}
            render={({ field }) =>
              (
                <div class="flex flex-col gap-2">
                  <Select
                    options={MeasurementUnit.map((unit) => ({
                      label: unit.charAt(0).toUpperCase() + unit.slice(1),
                      value: unit,
                    }))}
                    value={field.value ? [field.value] : []}
                    onChange={(selected) => field.onChange(selected[0] || "")}
                    placeholder="Select measurement unit"
                    icon={null}
                    maxItems={1}
                    disabled={!EditingClientSignal.value.isEditing}
                  />
                  {formMethods.formState.errors.client?.measurement_unit && <p class="text-red-500 text-xs">{formMethods.formState.errors.client.measurement_unit.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Phone Number</p>
          <Controller
            name="client.phone_number"
            control={formMethods.control}
            render={({ field }) =>
              (
                <div class="flex flex-col gap-1.5">
                  <input
                    {...field}
                    value={field.value ?? ""}
                    class="flex min-h-10.5 flex-1 items-center gap-3.5 border border-line-700 px-3 text-sm placeholder:text-grey-400 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!EditingClientSignal.value.isEditing}
                  />
                  {formMethods.formState.errors.client?.phone_number && <p class="text-red-500 text-xs">{formMethods.formState.errors.client.phone_number.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Email</p>
          <Controller
            name="client.email"
            control={formMethods.control}
            render={({ field }) =>
              (
                <div class="flex flex-col gap-1.5">
                  <input
                    {...field}
                    value={field.value ?? ""}
                    type="email"
                    class="flex min-h-10.5 flex-1 items-center gap-3.5 border border-line-700 px-3 text-sm placeholder:text-grey-400 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!EditingClientSignal.value.isEditing}
                  />
                  {formMethods.formState.errors.client?.email && <p class="text-red-500 text-xs">{formMethods.formState.errors.client.email.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>
      </ul>
      {EditingClientSignal.value.isEditing ? (
        <ul class="flex items-center gap-4">
          <Button class="mt-7 h-9.5 flex-1" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button class="mt-7 h-9.5 flex-1" type="submit" disabled={!formMethods.formState.isDirty}>
            Save
          </Button>
        </ul>
      ) : (
        <Button
          class="mt-7 h-9.5"
          type="button"
          onClick={() => {
            EditingClientSignal.value.setIsEditing(true);
          }}
        >
          Edit
        </Button>
      )}
    </>
  );
};
