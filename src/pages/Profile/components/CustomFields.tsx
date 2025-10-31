import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "preact";
import { Controller, useForm } from "react-hook-form";

import { useCreateCustomField, useGetCustomFields } from "@/api/http/v1/custom_fields/custom_fields.hooks";
import { type CreateCustomFieldPayload, type CustomField, CustomFieldAttributeType, UpdateCustomFieldSchema } from "@/api/http/v1/custom_fields/custom_fields.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import { DeactivateCustomFields } from "./DeactivateCustomFields";
import { Skeleton } from "@/components/ui/skeleton";

interface DeactivateCustomFieldSignalProps {
  isOpen: boolean;
  customField?: CustomField;
  setIsOpen: (open: boolean) => void;
  setCustomField: (customField: CustomField) => void;
}

export const deactivateCustomFieldSignal = signal<DeactivateCustomFieldSignalProps>({
  isOpen: false,
  setIsOpen: (isOpen) => {
    deactivateCustomFieldSignal.value = {
      ...deactivateCustomFieldSignal.value,
      isOpen,
    };
  },
  setCustomField: (customField) => {
    deactivateCustomFieldSignal.value = {
      ...deactivateCustomFieldSignal.value,
      customField,
    };
  },
});

export const CustomFields = () => {
  const getCustomFields = useGetCustomFields();

  return (
    <>
      <div class="flex flex-1 flex-col gap-10 pt-8 pb-20">
        {getCustomFields.isLoading && (
          <div class="flex flex-1 items-center justify-center">
            <img src="/assets/brand/logo.svg" class="animate-pulse" alt="Brand Logo" />
          </div>
        )}

        <CreateCustomFields />
        <SavedCustomFields />
      </div>

      <DeactivateCustomFields />
    </>
  );
};

const CreateCustomFields = () => {
  const getCustomFields = useGetCustomFields();
  const createCustomFieldMutation = useCreateCustomField();
  const formMethods = useForm<CreateCustomFieldPayload>({
    resolver: zodResolver(UpdateCustomFieldSchema) as any,
    mode: "onChange",
  });

  const handleSubmit = (e: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  const onSubmit = async (payload: CreateCustomFieldPayload) => {
    await createCustomFieldMutation.mutateAsync(payload, {
      onSuccess: () => {
        // Store theme preference locally or in user store
        formMethods.reset();
      },
      onError: () => {
        // console.error("Onboarding error:", error);
      },
    });
  };

  console.log(formMethods.formState.errors, formMethods.getValues());

  return (
    <div class="flex flex-col gap-8">
      <form class="flex flex-col items-stretch gap-8" onSubmit={handleSubmit}>
        <div class="flex flex-col items-stretch gap-6">
          <div class="flex flex-col gap-2">
            <p class="font-medium text-base leading-none">Create your custom fields</p>
            <p class="font-medium text-grey-500 text-sm leading-none">
              We try to cover many possible measurement fields but we&apos;ve made it possible for you to add more yourself.
            </p>
          </div>
          <div class="flex w-full flex-1 flex-col gap-6">
            {/* Custom Field Title */}
            <Label class="flex flex-col items-stretch gap-4">
              <p class="font-medium text-sm leading-1">Enter title</p>
              <Controller
                name="custom_field.field_name"
                control={formMethods.control}
                render={({ field }) =>
                  (
                    <div class="flex flex-col gap-2">
                      <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                        <input {...field} placeholder="Rim Size" class="flex-1 text-sm placeholder:text-grey-400" />
                      </div>
                      {formMethods.formState.errors.custom_field?.field_name && <p class="text-red-500 text-xs">{formMethods.formState.errors.custom_field.field_name.message}</p>}
                    </div>
                  ) as any
                }
              />
            </Label>

            {/* Custom Field Type */}
            <Label class="flex flex-col items-stretch gap-4">
              <p class="font-medium text-sm leading-0">Select Type</p>
              <Controller
                name="custom_field.field_type"
                control={formMethods.control}
                render={({ field }) =>
                  (
                    <div class="flex flex-col gap-2">
                      <Select
                        options={CustomFieldAttributeType.map((custom_field) => ({
                          label: custom_field,
                          value: custom_field,
                        }))}
                        value={field.value ? [field.value] : []}
                        onChange={(selected) => field.onChange(selected[0] || "")}
                        placeholder="Measurement, Text"
                        valueClassName="capitalize"
                        icon={null}
                        itemClassName="capitalize"
                        maxItems={1}
                      />
                      {formMethods.formState.errors.custom_field?.field_type && <p class="text-red-500 text-xs">{formMethods.formState.errors.custom_field?.field_type.message}</p>}
                    </div>
                  ) as any
                }
              />
            </Label>
            {console.log(formMethods.formState.isValid)}
            <Button disabled={!formMethods.formState.isValid || createCustomFieldMutation.isPending || getCustomFields.isPending}>Save custom field</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

const SavedCustomFields = () => {
  const getCustomFields = useGetCustomFields();

  return (
    <div class="flex flex-1 flex-col">
      <p class="font-medium text-base">Saved custom fields</p>
      {getCustomFields.isLoading && (
        <div class="mt-6 flex flex-col items-stretch gap-3">
          <ul class="flex items-center justify-between gap-3">
            <Skeleton class="h-4 w-16 rounded-xs" />

            <ul class="flex items-center gap-2">
              <Skeleton class="size-4.5 rounded-xs" />
              <Skeleton class="size-4.5 rounded-xs" />
            </ul>
          </ul>
          <Skeleton class="h-10 w-full rounded-xs" />
        </div>
      )}

      {!getCustomFields.isLoading && !getCustomFields.data?.data.length && (
        <div class="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p class="font-medium text-black text-sm leading-2">No saved custom fields</p>
          <p class="max-w-7/10 font-medium text-grey-500 text-sm">Your saved custom fields will appear here. Create one above</p>
        </div>
      )}

      {!getCustomFields.isLoading && !!getCustomFields.data?.data.length && (
        <ul class="mt-6 flex flex-1 flex-col gap-6">
          {getCustomFields.data?.data.map((field) => (
            <SavedCustomField field={field} />
          ))}
        </ul>
      )}
    </div>
  );
};

const SavedCustomField = (props: { field: CustomField }) => {
  return (
    <Label class="flex flex-col items-stretch gap-3">
      <div class="flex items-center justify-between gap-4">
        <p class="font-medium text-sm leading-1">{props.field.data.attributes.field_name}</p>
        <ul class="flex items-center gap-2.5">
          <button type="button" class="size-4">
            <Icon icon="iconoir:edit" fontSize={16} />
          </button>
          <button
            type="button"
            class="size-5"
            onClick={() => {
              deactivateCustomFieldSignal.value.setIsOpen(true);
              deactivateCustomFieldSignal.value.setCustomField(props.field);
            }}
          >
            {!props.field.data.attributes.is_active ? (
              <Icon icon="material-symbols-light:play-arrow-outline" fontSize={20} />
            ) : (
              <Icon icon="material-symbols-light:pause-outline" fontSize={18} />
            )}
          </button>
        </ul>
      </div>
      <div class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3 text-grey-400 capitalize">{props.field.data.attributes.field_type}</div>
    </Label>
  );
};
