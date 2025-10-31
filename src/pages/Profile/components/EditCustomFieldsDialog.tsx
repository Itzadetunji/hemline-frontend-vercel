import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import type { JSX } from "preact";
import { Controller, useForm } from "react-hook-form";

import { useUpdateCustomField } from "@/api/http/v1/custom_fields/custom_fields.hooks";
import { type CustomField, CustomFieldAttributeType, type UpdateCustomFieldPayload, UpdateCustomFieldSchema } from "@/api/http/v1/custom_fields/custom_fields.types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useLayoutEffect } from "preact/hooks";
import toast from "react-hot-toast";

interface EditCustomFieldSignalProps {
  isOpen: boolean;
  customField?: CustomField;
  setIsOpen: (open: boolean) => void;
  setCustomField: (customField: CustomField) => void;
}

export const editCustomFieldSignal = signal<EditCustomFieldSignalProps>({
  isOpen: false,
  setIsOpen: (isOpen) => {
    editCustomFieldSignal.value = {
      ...editCustomFieldSignal.value,
      isOpen,
    };
  },
  setCustomField: (customField) => {
    editCustomFieldSignal.value = {
      ...editCustomFieldSignal.value,
      customField,
    };
  },
});

export const EditCustomFieldsDialog = () => {
  const updateCustomFieldMutation = useUpdateCustomField();

  const formMethods = useForm<UpdateCustomFieldPayload>({
    resolver: zodResolver(UpdateCustomFieldSchema) as any,
    mode: "onChange",
  });

  const handleSubmit = (e: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  const onSubmit = async (payload: UpdateCustomFieldPayload) => {
    await updateCustomFieldMutation.mutateAsync(
      {
        id: editCustomFieldSignal.value.customField?.data.id as string,
        payload,
      },
      {
        onSuccess: () => {
          toast.success("Custom Field updated!");
          editCustomFieldSignal.value.setIsOpen(false);
        },
        onError: (error) => {
          const errorMessage = (error.response?.data as any).error || "Failed to update custom field";
          toast.error(errorMessage);
        },
      }
    );
  };

  useLayoutEffect(() => {
    if (editCustomFieldSignal.value.customField) {
      formMethods.reset({
        custom_field: {
          field_name: editCustomFieldSignal.value.customField.data.attributes.field_name,
          field_type: editCustomFieldSignal.value.customField.data.attributes.field_type,
        },
      });
    }
  }, [editCustomFieldSignal.value]);

  return (
    <Dialog
      open={editCustomFieldSignal.value.isOpen}
      onOpenChange={(open) => {
        if (updateCustomFieldMutation.isPending) return;
        editCustomFieldSignal.value.setIsOpen(open);
      }}
    >
      <DialogContent showClose={false} class="flex flex-col gap-8 rounded-none">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <DialogClose class="size-4">
              <Icon icon="ix:cancel" fontSize={16} />
            </DialogClose>
            <p class="font-medium text-sm">Edit custom field</p>
          </div>
        </DialogHeader>

        <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
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
          </div>

          <DialogFooter class="p-0">
            <Button type="submit" class="w-full bg-primary hover:bg-primary/90" disabled={updateCustomFieldMutation.isPending || !formMethods.formState.isValid}>
              {updateCustomFieldMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
