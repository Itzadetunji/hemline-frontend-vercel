import { signal } from "@preact/signals";
import { useRoute } from "preact-iso";
import { Controller, useFormContext } from "react-hook-form";

import { useGetClient } from "@/api/http/v1/clients/clients.hooks";
import { type MeasurementFieldType, Measurements, MeasurementUnit, type UpdateClientPayload } from "@/api/http/v1/clients/clients.types";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { Accordion, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EditingClientSignal } from "../../view-client";
import { MeasurementDrawer, type MeasurementDrawerSignalTypes, MeasurementItem } from "../AddTabs/MeasurementsTab";

const EditMeasurementDrawerSignal = signal<MeasurementDrawerSignalTypes>({
  isOpen: false,
  setIsOpen: (isOpen) => {
    EditMeasurementDrawerSignal.value = {
      ...EditMeasurementDrawerSignal.value,
      isOpen,
    };
  },
  setMeasurement: (measurement) => {
    EditMeasurementDrawerSignal.value = {
      ...EditMeasurementDrawerSignal.value,
      measurement,
    };
  },
});

export const EditMeasurementsTab = () => {
  const { params } = useRoute();
  const getUserProfile = useGetUserProfile();
  const formMethods = useFormContext<UpdateClientPayload>();

  const clientGender = formMethods.watch("client.gender");
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
      <div class="mt-8 flex flex-col gap-5 border-b border-b-line-700 pb-5">
        <div>
          <p class="font-medium text-base">Store Measurements</p>
          <p class="text-grey text-sm">Add the clients measurements and size</p>
        </div>

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
      </div>

      <div class="mt-6 flex flex-1 flex-col justify-between gap-6 pb-24">
        <Accordion type="single" collapsible className="flex flex-col gap-4">
          {
            (
              <AccordionItem value="upper_measurements" className="border-none">
                {(<AccordionTrigger className="!font-primary flex items-center rounded-none border-line border-b px-3 py-1 text-2xl">Upper Measurements</AccordionTrigger>) as any}
                <MeasurementItem fields={Measurements.upper_measurements} is_upper gender={clientGender} />
              </AccordionItem>
            ) as any
          }
          {
            (
              <AccordionItem value="lower_measurements" className="border-none">
                {(<AccordionTrigger className="!font-primary flex items-center rounded-none border-line border-b px-3 py-1 text-2xl">Lower Measurements</AccordionTrigger>) as any}
                <MeasurementItem fields={Measurements.lower_measurements} is_upper={false} gender={clientGender} />
              </AccordionItem>
            ) as any
          }
          {!getUserProfile.isLoading &&
            getUserProfile.data?.data.user.custom_fields.length &&
            ((
              <AccordionItem value="custom_measurements">
                {(<AccordionTrigger className="!font-primary flex items-center rounded-none border-line border-b px-3 py-1 text-2xl">Custom Measurements</AccordionTrigger>) as any}
                <MeasurementItem
                  fields={
                    getUserProfile.data?.data.user.custom_fields.map((custom_field) => ({
                      id: custom_field.data.attributes.id,
                      title: custom_field.data.attributes.field_name,
                    })) as MeasurementFieldType[]
                  }
                  is_custom
                  gender={clientGender}
                />
              </AccordionItem>
            ) as any)}
        </Accordion>
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
      </div>

      <MeasurementDrawer />
    </>
  );
};
