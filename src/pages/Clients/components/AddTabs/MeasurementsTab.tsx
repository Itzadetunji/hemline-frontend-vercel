import { Measurements, MeasurementUnit, type CreateClientPayload, type GenderType, type MeasurementFieldType } from "@/api/http/v1/clients/clients.types";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import { Controller, useFormContext } from "react-hook-form";

export interface MeasurementSignalType {
  id: string;
  title: string;
  is_upper: boolean;
  is_custom: boolean;
  gender: "male" | "female";
}

export interface MeasurementDrawerSignalTypes {
  measurement?: MeasurementSignalType;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setMeasurement: (measurement: MeasurementSignalType) => void;
}

const measurementDrawerSignal = signal<MeasurementDrawerSignalTypes>({
  isOpen: false,
  setIsOpen: (isOpen) => {
    measurementDrawerSignal.value = {
      ...measurementDrawerSignal.value,
      isOpen,
    };
  },
  setMeasurement: (measurement) => {
    measurementDrawerSignal.value = {
      ...measurementDrawerSignal.value,
      measurement,
    };
  },
});

export const MeasurementsTab = () => {
  const getUserProfile = useGetUserProfile();
  const formMethods = useFormContext<CreateClientPayload>();

  const clientGender = formMethods.watch("client.gender");

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
            !!getUserProfile.data?.data.user.custom_fields.length &&
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
        <Button class="h-9.5" type="submit">
          Save
        </Button>
      </div>
      <MeasurementDrawer />
    </>
  );
};

export const MeasurementItem = (props: { fields: MeasurementFieldType[]; is_upper?: boolean; is_custom?: boolean; gender?: GenderType; disabled?: boolean }) => {
  const { watch } = useFormContext<CreateClientPayload>();
  console.log(props.fields);
  return (
    <AccordionContent className="pt-4">
      {
        (
          <ul class="flex flex-col items-stretch gap-4 pl-10">
            {/* Based on the gender, you would filter fields */}
            {props.fields
              .filter((f) => {
                // Filter based on gender
                if (props.gender === "Male") {
                  return !f.female_only;
                }
                // For Female and Other, show all fields
                return true;
              })
              .map((field) => {
                // Handle custom fields differently
                const fieldPath = props.is_custom
                  ? (`client.custom_fields.${field.id}` as any)
                  : (`client.measurements.${field.id}` as `client.measurements.${keyof CreateClientPayload["client"]}`);

                const fieldValue = props.is_custom ? watch("client.custom_fields")?.[field.id] : watch(fieldPath);

                return (
                  <button
                    type="button"
                    onClick={() => {
                      // Convert gender to lowercase for consistency with MeasurementSignalType
                      const genderValue = props.gender?.toLowerCase() === "male" ? "male" : "female";
                      measurementDrawerSignal.value.setMeasurement({
                        id: field.id,
                        title: field.title,
                        gender: genderValue,
                        is_upper: props.is_upper ?? false,
                        is_custom: props.is_custom ?? false,
                      } as MeasurementSignalType);
                      measurementDrawerSignal.value.setIsOpen(true);
                    }}
                    class="flex items-center justify-between gap-1 border-b border-b-line py-2 disabled:cursor-not-allowed"
                  >
                    <p class="font-medium text-base capitalize">{field.title}</p>

                    {fieldValue && (
                      <p class="bg-secondary px-1 py-1 font-medium text-base text-black leading-4">
                        {fieldValue} {watch("client.measurement_unit") === "inches" ? "in" : watch("client.measurement_unit") === "centimeters" ? "cm" : ""}
                      </p>
                    )}
                  </button>
                );
              })}
          </ul>
        ) as any
      }
    </AccordionContent>
  ) as any;
};

export const MeasurementDrawer = () => {
  const { control, setValue, watch } = useFormContext<CreateClientPayload>();
  const currentMeasurement = measurementDrawerSignal.value.measurement;

  const handleClose = () => {
    console.log(measurementDrawerSignal.value);
    measurementDrawerSignal.value.setIsOpen(false);
  };

  return (
    <Drawer
      isOpen={measurementDrawerSignal.value.isOpen}
      onClose={() => handleClose()}
      className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-5"
      drawerClass="h-[60%] min-h-fit"
    >
      <div class="flex flex-1 flex-col items-stretch gap-6">
        <div class="relative flex items-center justify-between">
          <button type="button" class="flex items-center gap-1" onClick={() => handleClose()}>
            <Icon icon="lucide:chevron-left" className="size-5" />
            <p>Back</p>
          </button>
        </div>
        <div class="flex flex-1 flex-col items-center justify-center">
          {!currentMeasurement?.is_custom && (
            <img
              src={`/assets/measurements/${currentMeasurement?.is_upper ? "upper" : "lower"} measurements/${currentMeasurement?.gender}/${currentMeasurement?.id}.svg`}
              alt="Illustration Figure"
              class="h-36"
            />
          )}
          <div class="flex w-1/2 flex-col items-center gap-2.5 border-line-700 border-t pt-2">
            <p class="font-medium text-black text-sm">{currentMeasurement?.title}</p>
            {currentMeasurement &&
              (currentMeasurement.is_custom ? (
                <Controller
                  key={currentMeasurement.id}
                  name={`client.custom_fields.${currentMeasurement.id}` as any}
                  control={control}
                  render={({ field }) =>
                    (
                      <input
                        type="number"
                        placeholder="0"
                        class="h-6 w-12 bg-secondary text-center plceholder:text-grey text-black"
                        inputMode="numeric"
                        value={String(field.value || "")}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          const customFields = watch("client.custom_fields") || {};
                          setValue(
                            "client.custom_fields",
                            {
                              ...customFields,
                              [currentMeasurement.id]: value,
                            },
                            {
                              shouldValidate: true,
                              shouldDirty: true,
                            }
                          );
                        }}
                        onBlur={field.onBlur}
                      />
                    ) as any
                  }
                />
              ) : (
                <Controller
                  key={currentMeasurement.id}
                  name={`client.measurements.${currentMeasurement.id}` as any}
                  control={control}
                  render={({ field }) =>
                    (
                      <input
                        {...field}
                        type="number"
                        placeholder="0"
                        class="h-6 w-12 bg-secondary text-center plceholder:text-grey text-black"
                        inputMode="decimal"
                        value={String(field.value || "")}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          field.onChange(value);
                        }}
                        onBlur={(e) => {
                          const value = e.currentTarget.value;
                          setValue(`client.measurements.${currentMeasurement.id}` as any, value as any, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          field.onBlur();
                        }}
                      />
                    ) as any
                  }
                />
              ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
