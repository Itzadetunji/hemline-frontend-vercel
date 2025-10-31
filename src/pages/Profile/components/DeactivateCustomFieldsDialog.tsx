import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

import { useDeactivateCustomField, useUpdateCustomField } from "@/api/http/v1/custom_fields/custom_fields.hooks";
import type { CustomField } from "@/api/http/v1/custom_fields/custom_fields.types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { signal } from "@preact/signals";

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

export const DeactivateCustomFieldsDialog = () => {
  const deactivateCustomFieldMutation = useDeactivateCustomField();
  const reactivateCustomFieldMutation = useUpdateCustomField();

  const handleDelete = async () => {
    if (!deactivateCustomFieldSignal.value.customField?.data.id) {
      toast.error("No custom field selected");
      return;
    }

    if (deactivateCustomFieldSignal.value.customField?.data.attributes.is_active) {
      await deactivateCustomFieldMutation.mutateAsync(deactivateCustomFieldSignal.value.customField?.data.id, {
        onSuccess: () => {
          toast.success("Custom Field de-activated!");
          deactivateCustomFieldSignal.value.setIsOpen(false);
        },
        onError: (error) => {
          const errorMessage = (error.response?.data as any).error || "Failed to de-activate custom field";
          toast.error(errorMessage);
        },
      });
    } else if (!deactivateCustomFieldSignal.value.customField?.data.attributes.is_active) {
      await reactivateCustomFieldMutation.mutateAsync(
        {
          id: deactivateCustomFieldSignal.value.customField?.data.id,
          payload: {
            custom_field: {
              is_active: true,
            },
          },
        },
        {
          onSuccess: () => {
            toast.success("Custom Field re-activated!");
            deactivateCustomFieldSignal.value.setIsOpen(false);
          },
          onError: (error) => {
            const errorMessage = (error.response?.data as any).error || "Failed to re-activate custom field";
            toast.error(errorMessage);
          },
        }
      );
    }
  };

  return (
    <Dialog
      open={deactivateCustomFieldSignal.value.isOpen}
      onOpenChange={(open) => {
        if (deactivateCustomFieldMutation.isPending) return;
        deactivateCustomFieldSignal.value.setIsOpen(open);
      }}
    >
      <DialogContent showClose={false} class="flex flex-col gap-8 rounded-none">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <DialogClose class="size-4">
              <Icon icon="ix:cancel" fontSize={16} />
            </DialogClose>
            <p class="font-medium text-sm">{deactivateCustomFieldSignal.value.customField?.data.attributes.is_active ? "De-activate" : "Re-activate"}</p>
          </div>
        </DialogHeader>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4">
            <p class="!font-primary text-2xl leading-0">
              {deactivateCustomFieldSignal.value.customField?.data.attributes.is_active ? "De-activate custom field" : "Re-activate custom field"}
            </p>
            <p class="font-medium text-sm">
              {deactivateCustomFieldSignal.value.customField?.data.attributes.is_active
                ? "This will pause this custom field and will temporary remove it from the client's end."
                : "This will add the custom field back to the client's end"}
            </p>
          </div>
          <DialogFooter class="flex flex-row-reverse justify-stretch gap-3">
            <Button
              class="flex-1 py-3.5 font-medium text-sm"
              type="button"
              onClick={() => deactivateCustomFieldSignal.value.setIsOpen(false)}
              disabled={deactivateCustomFieldMutation.isPending}
            >
              Cancel
            </Button>

            <Button variant="outline" class="flex-1 border-line py-3.5 font-medium text-sm" type="button" onClick={handleDelete} disabled={deactivateCustomFieldMutation.isPending}>
              {deactivateCustomFieldSignal.value.customField?.data.attributes.is_active
                ? deactivateCustomFieldMutation.isPending
                  ? "De-activating..."
                  : "De-activate"
                : deactivateCustomFieldMutation.isPending
                  ? "Re-activating..."
                  : "Re-activate"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
