import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import type { CreateClientPayload } from "@/api/http/v1/clients/clients.types";

export const OrdersTab = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateClientPayload>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "client.orders",
  });

  const handleAddItem = () => {
    append({
      item: "",
      quantity: 1,
      notes: "",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Select date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div class="mt-8 flex flex-1 flex-col gap-6 pb-24">
      <div class="flex flex-1 flex-col">
        <div class="flex flex-col">
          <p class="font-medium text-base">Deliverables</p>
          <p class="text-grey text-sm">Add details about the client&apos;s request</p>
        </div>
        <div class="flex flex-col gap-5">
          <ul class="mt-7 flex flex-col gap-6">
            {fields.map((field, index) => (
              <li key={field.id} class="flex flex-col gap-6 border-b border-b-line-700 pb-5 last:border-b-0 last:pb-0">
                {/* Item Name */}
                <Label class="flex flex-col items-stretch gap-4">
                  <div class="flex items-center justify-between">
                    <p class="font-medium text-sm leading-0">Item {index + 1}</p>
                    <Button class="h-fit w-fit gap-2 p-0 text-grey" variant="ghost" type="button" onClick={() => remove(index)}>
                      <span class="size-4">
                        <Icon icon="ix:cancel" />
                      </span>
                      <p>Remove</p>
                    </Button>
                  </div>
                  <Controller
                    name={`client.orders.${index}.item`}
                    control={control}
                    render={({ field: itemField }) =>
                      (
                        <div class="flex flex-col gap-1.5">
                          <input
                            {...itemField}
                            placeholder="blue senator"
                            class="flex min-h-10.5 flex-1 items-center gap-3.5 border border-line-700 px-3 text-sm placeholder:text-grey-400"
                          />
                          {errors.client?.orders?.[index]?.item && <p class="text-red-500 text-xs">{errors.client.orders[index]?.item?.message}</p>}
                        </div>
                      ) as any
                    }
                  />
                </Label>

                {/* Quantity */}
                <Label class="flex w-fit border border-line-700">
                  <p class="border-line-700 border-r py-1.5 pr-2.5 pl-1">Quantity</p>
                  <Controller
                    name={`client.orders.${index}.quantity`}
                    control={control}
                    render={({ field: quantityField }) =>
                      (
                        <div class="flex items-center gap-2 pr-2 text-grey">
                          <button
                            type="button"
                            class="min-h-4.5 min-w-4.5"
                            onClick={() => {
                              const currentValue = quantityField.value || 1;
                              if (currentValue > 1) {
                                quantityField.onChange(currentValue - 1);
                              }
                            }}
                          >
                            <Icon icon="material-symbols:remove-rounded" className="size-4.5" />
                          </button>
                          <p class="font-medium text-black text-sm">{quantityField.value || 1}</p>
                          <button
                            type="button"
                            class="min-h-4.5 min-w-4.5"
                            onClick={() => {
                              const currentValue = quantityField.value || 1;
                              quantityField.onChange(currentValue + 1);
                            }}
                          >
                            <Icon icon="si:add-duotone" className="size-4.5" />
                          </button>
                        </div>
                      ) as any
                    }
                  />
                </Label>

                {/* Notes */}
                <Label class="flex flex-col items-stretch gap-4">
                  <p class="font-medium text-sm leading-0">My Notes</p>
                  <Controller
                    name={`client.orders.${index}.notes`}
                    control={control}
                    render={({ field: notesField }) =>
                      (
                        <div class="flex flex-col gap-1.5">
                          <textarea
                            {...notesField}
                            placeholder="The client want it to be fitted and the trousers should be very long and fitted"
                            class="flex min-h-20 flex-1 items-center gap-3.5 border border-line-700 px-3 py-3 text-sm placeholder:text-grey-400"
                          />
                          {errors.client?.orders?.[index]?.notes && <p class="text-red-500 text-xs">{errors.client.orders[index]?.notes?.message}</p>}
                        </div>
                      ) as any
                    }
                  />
                </Label>

                {/* Due Date */}
                <Label class="flex flex-col items-stretch gap-4">
                  <p class="font-medium text-sm leading-0">Due Date</p>
                  <Controller
                    name={`client.orders.${index}.due_date`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <div class="flex flex-col gap-1.5">
                          <div class="relative">
                            <button
                              type="button"
                              class="flex min-h-10.5 w-full items-center gap-3.5 border border-line-700 px-3 text-left text-sm placeholder:text-grey-400"
                              onClick={(e) => {
                                const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                                input?.showPicker();
                              }}
                            >
                              {formatDate(field.value)}
                            </button>
                            <input {...field} type="date" class="pointer-events-none absolute inset-0 opacity-0" />
                          </div>
                          {errors.client?.orders?.[index]?.due_date && <p class="text-red-500 text-xs">{errors.client.orders[index]?.due_date?.message}</p>}
                        </div>
                      ) as any;
                    }}
                  />
                </Label>
              </li>
            ))}
          </ul>
          <Button class="h-fit w-fit gap-1.5 px-3 py-1.5 text-black" variant="secondary" type="button" onClick={handleAddItem}>
            <p>Add Item</p>
            <span class="size-4.5">
              <Icon icon="si:add-duotone" className="size-4.5" />
            </span>
          </Button>
        </div>
      </div>
      <div class="flex flex-col gap-6">
        <Button class="h-9.5" type="submit">
          Save
        </Button>
      </div>
    </div>
  );
};
