import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { RefObject } from "preact";
import { useRoute } from "preact-iso";
import { useEffect, useRef, useState, type Dispatch, type StateUpdater } from "preact/hooks";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useCreateOrder, useInfiniteGetOrders, useMarkOrderAsDone, useMarkOrderAsPending, useUpdateOrder } from "@/api/http/v1/orders/orders.hooks";
import { type CreateOrderPayload, CreateOrderSchema, UpdateOrderSchema, type OrderAttributes, type UpdateOrderPayload } from "@/api/http/v1/orders/orders.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateForOrderDueDate, handleSelectOrderChange, OrdersSkeleton } from "@/pages/Clients/orders/page";
import { DeleteOrders, deleteOrdersSignal } from "../../orders/components/DeleteOrders";
import { exportOrdersToCSV, OrdersActionBar } from "../../orders/components/OrdersActionBar";

export const EditOrdersTab = () => {
  const { params } = useRoute();
  const client_id = params.client_id as string;

  const [addingNewOrder, setAddingNewOrder] = useState(false);

  const getInfiniteOrdersQuery = useInfiniteGetOrders({ client_id });

  const observerTarget = useRef<HTMLLIElement>(null);

  const allOrders = getInfiniteOrdersQuery.data?.pages.flatMap((page) => page.data.orders) ?? [];

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && getInfiniteOrdersQuery.hasNextPage && !getInfiniteOrdersQuery.isFetchingNextPage) {
          getInfiniteOrdersQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [getInfiniteOrdersQuery.hasNextPage, getInfiniteOrdersQuery.isFetchingNextPage, getInfiniteOrdersQuery.fetchNextPage]);

  // Get the last order to attach the observer
  const lastOrder = allOrders[allOrders.length - 1];

  return (
    <div class="mt-8 flex flex-1 flex-col gap-6 pb-24">
      <div
        class={cn("flex flex-col", {
          "py-4": getInfiniteOrdersQuery.isLoading,
          "flex-1": !getInfiniteOrdersQuery.isLoading,
        })}
      >
        {addingNewOrder && !allOrders.length && <AddNewOrderItem setAddingNewOrder={setAddingNewOrder} />}

        {!getInfiniteOrdersQuery.isLoading && !!allOrders.length && (
          <div class="flex flex-1 flex-col gap-4">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col">
                <p class="font-medium text-base">Deliverables</p>
                <p class="text-grey text-sm">Add details about the client&apos;s request</p>
              </div>
              {!addingNewOrder && (
                <Button class="h-fit w-fit gap-1.5 px-3 py-1.5 text-black" variant="secondary" type="button" onClick={() => setAddingNewOrder(true)}>
                  <p>Add Item</p>
                  <span class="size-4.5">
                    <Icon icon="si:add-duotone" className="size-4.5" />
                  </span>
                </Button>
              )}
            </div>
            <div class="flex flex-col gap-5">
              {addingNewOrder && <AddNewOrderItem setAddingNewOrder={setAddingNewOrder} />}
              <ul class="flex flex-col gap-6">
                {allOrders.map((order) => {
                  const isLastItem = order.id === lastOrder.id;

                  return <OrdersListItem key={order.id} order={order} allOrders={allOrders} isLastItem={isLastItem} observerRef={isLastItem ? observerTarget : undefined} />;
                })}
              </ul>
            </div>
          </div>
        )}
        {!getInfiniteOrdersQuery.isLoading && !allOrders.length && !addingNewOrder && (
          <div class="flex flex-1 flex-col items-stretch">
            <div class="flex flex-1 flex-col items-center justify-center gap-4">
              <div class="flex flex-col items-center gap-4">
                <h2 class="text-2xl leading-0">No Deliverables</h2>
                <p class="max-w-8/10 text-center font-medium text-grey-500 text-sm">Add details about the client&apos;s request</p>
              </div>
              <Button class="flex items-center gap-2 py-2" type="button" onClick={() => setAddingNewOrder(true)} variant="ghost">
                <p class="font-medium text-sm">Add Order</p>
                <Icon icon="si:add-duotone" className="h-5 w-5 text-black" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteOrders />
      {deleteOrdersSignal.value.isSelecting && <OrdersActionBar allOrders={allOrders} />}
      {getInfiniteOrdersQuery.isFetching && <OrdersSkeleton />}
    </div>
  );
};

const OrdersListItem = (props: { order: OrderAttributes; allOrders: OrderAttributes[]; isLastItem: boolean; observerRef?: RefObject<HTMLLIElement> }) => {
  const [isChecked, setIsChecked] = useState(props.order.is_done);
  const markAsDoneMutation = useMarkOrderAsDone();
  const markAsPendingMutation = useMarkOrderAsPending();

  const [isEditing, setIsEditing] = useState(false);

  // Format the date in the requested format: "Tue, Oct 7 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleCheckboxChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newCheckedState = target.checked;
    setIsChecked(newCheckedState);

    // If we don't have a client_id, we can't make the API call
    if (!props.order.client_id) {
      console.error("Cannot update order status: client_id is missing");
      return;
    }

    try {
      if (newCheckedState) {
        await markAsDoneMutation.mutateAsync({
          clientId: props.order.client_id,
          orderId: props.order.id,
        });
      } else {
        await markAsPendingMutation.mutateAsync({
          orderId: props.order.id,
        });
      }
    } catch {
      // Revert the checkbox state on error
      setIsChecked(!newCheckedState);
    }
  };

  const handleDelete = () => {
    deleteOrdersSignal.value.setOrderDetails([props.order.id]);
    deleteOrdersSignal.value.setIsOpen(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleExportSingleOrder = () => {
    exportOrdersToCSV(props.allOrders, [props.order.id]);
  };

  if (!isEditing)
    return (
      <li ref={props.isLastItem ? props.observerRef : null} class="relative flex flex-col gap-3.5 border border-line-700 p-3">
        <div class="flex items-center justify-between border-line-700 border-b pb-3">
          <a href={`/clients/${props.order.client_id}`} class="!font-primary font-medium text-2xl leading-1">
            {props.order.client_name}
          </a>
          {deleteOrdersSignal.value.isSelecting ? (
            <label class="group top-1.5 left-1.5 cursor-pointer">
              <input type="checkbox" onChange={(e) => handleSelectOrderChange(e, props.order.id)} class="sr-only" />
              <div class="flex size-4.5 items-center justify-center border border-line-500 bg-white/40 transition-colors group-has-[:checked]:border-primary group-has-[:checked]:bg-primary">
                <Icon icon="heroicons:check-20-solid" className="h-3.5 w-3.5 text-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
              </div>
            </label>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" class="relative min-h-5 min-w-5 rounded-full border border-line">
                  <Icon icon="pepicons-pencil:dots-x" className="size-5 text-black" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="flex w-40 flex-col items-stretch rounded-sm border-line-400 bg-white/70 drop-shadow-[0.6px_0.8px_9px_rgba(0,0,0,0,95)] backdrop-blur-lg">
                <ul class="flex flex-col gap-3">
                  <button type="button" class="flex cursor-pointer items-center justify-between gap-2 hover:bg-secondary" onClick={handleEdit}>
                    <p class="font-medium text-sm">Edit</p>
                    <div class="grid min-w-5 place-content-center p-1">
                      <Icon icon="iconoir:edit" className="h-4 w-4 text-black" />
                    </div>
                  </button>
                  <button type="button" onClick={handleExportSingleOrder} class="flex cursor-pointer items-center justify-between gap-2 hover:bg-secondary">
                    <p class="font-medium text-sm">Download CSV</p>
                    <div class="grid min-w-5 place-content-center p-1">
                      <Icon icon="iconoir:download" className="h-4 w-4 text-black" />
                    </div>
                  </button>
                  <button type="button" onClick={handleDelete} class="flex cursor-pointer items-center justify-between gap-2 hover:bg-secondary">
                    <p class="font-medium text-destructive text-sm">Delete Order </p>
                    <div class="grid min-w-5 place-content-center p-1">
                      <Icon icon="material-symbols-light:delete-outline-sharp" className="h-4 w-4 text-destructive" />
                    </div>
                  </button>
                </ul>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <ul class="flex flex-col gap-1">
          <div class="flex font-medium text-sm">
            <p>
              {props.order.item} x{props.order.quantity}
            </p>
          </div>
          <li class="text-grey text-sm">Added: {formatDate(props.order.created_at)}</li>
          {props.order.due_date && (
            <li class={cn("text-sm", props.order.overdue ? "text-destructive" : "text-grey")}>
              Due: {formatDate(props.order.due_date)} {props.order.overdue && "(Overdue)"}
            </li>
          )}
          {props.order.notes && <li class="text-grey text-sm">Notes: {props.order.notes}</li>}
        </ul>
        <label class="flex items-center gap-2 font-medium text-sm">
          <p>Mark as completed</p>
          <div
            class={cn("flex cursor-pointer items-center justify-between gap-3 transition-colors hover:bg-secondary", {
              "bg-secondary/50": isChecked,
            })}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              disabled={markAsDoneMutation.isPending || markAsPendingMutation.isPending}
              class="size-4 cursor-pointer border-line-500 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </label>
      </li>
    );
  return <EditableOrderItem order={props.order} setIsEditing={setIsEditing} />;
};

const EditableOrderItem = (props: { order: OrderAttributes; setIsEditing: Dispatch<StateUpdater<boolean>> }) => {
  const updateOrderMutation = useUpdateOrder();
  const formMethods = useForm<UpdateOrderPayload>({
    resolver: zodResolver(UpdateOrderSchema),
    defaultValues: {
      order: {
        ...props.order,
      },
    },
  });

  const onSubmit = async (payload: UpdateOrderPayload) => {
    await updateOrderMutation.mutateAsync(
      {
        orderId: props.order.id,
        payload,
      },
      {
        onSuccess: () => {
          toast.success("Order updated successfully!");
          props.setIsEditing(false);
          // location.route("/clients");
        },
        onError: (error) => {
          toast.error("Order could not be updated");
          console.error("Client creation error:", error);
        },
      }
    );
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  return (
    <form class="flex flex-col gap-6 border-line-700 border-y py-5" onSubmit={handleSubmit}>
      <div class="flex flex-col gap-6">
        {/* Item Name */}
        <Label class="flex flex-col items-stretch gap-1">
          <div class="flex items-center justify-between">
            <p class="font-medium text-sm">Item Name</p>
          </div>
          <Controller
            name="order.item"
            control={formMethods.control}
            render={({ field: itemField }) =>
              (
                <div class="flex flex-col gap-1.5">
                  <input
                    {...itemField}
                    placeholder="blue senator"
                    class="flex min-h-10.5 flex-1 items-center gap-3.5 border border-line-700 px-3 text-sm placeholder:text-grey-400"
                  />
                  {formMethods.formState.errors.order?.item && <p class="text-red-500 text-xs">{formMethods.formState.errors.order?.item?.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>

        {/* Quantity */}
        <Label class="flex w-fit border border-line-700">
          <p class="border-line-700 border-r py-1.5 pr-2.5 pl-1">Quantity</p>
          <Controller
            name="order.quantity"
            control={formMethods.control}
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
            name="order.notes"
            control={formMethods.control}
            render={({ field: notesField }) =>
              (
                <div class="flex flex-col gap-1.5">
                  <textarea
                    {...notesField}
                    placeholder="The client want it to be fitted and the trousers should be very long and fitted"
                    class="flex min-h-20 flex-1 items-center gap-3.5 border border-line-700 px-3 py-3 text-sm placeholder:text-grey-400"
                  />
                  {formMethods.formState.errors.order?.notes && <p class="text-red-500 text-xs">{formMethods.formState.errors.order?.notes?.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>

        {/* Due Date */}
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Due Date</p>
          <Controller
            name="order.due_date"
            control={formMethods.control}
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
                      {formatDateForOrderDueDate(field.value)}
                    </button>
                    <input {...field} type="date" class="pointer-events-none absolute inset-0 opacity-0" />
                  </div>
                  {formMethods.formState.errors.order?.due_date && <p class="text-red-500 text-xs">{formMethods.formState.errors.order?.due_date.message}</p>}
                </div>
              ) as any;
            }}
          />
        </Label>
      </div>
      <ul class="flex items-center justify-between gap-4">
        <Button class="flex-1" type="button" onClick={() => props.setIsEditing(false)} disabled={updateOrderMutation.isPending}>
          Cancel
        </Button>
        <Button class="flex-1" disabled={!formMethods.formState.isDirty || updateOrderMutation.isPending} type="submit">
          Save
        </Button>
      </ul>
    </form>
  );
};

const AddNewOrderItem = (props: { setAddingNewOrder: Dispatch<StateUpdater<boolean>> }) => {
  const { params } = useRoute();
  const client_id = params.client_id as string;

  const createOrderMutation = useCreateOrder();

  const formMethods = useForm<CreateOrderPayload>({
    resolver: zodResolver(CreateOrderSchema) as any,
    defaultValues: {
      order: {
        client_id: client_id,
        quantity: 1,
      },
    },
  });

  const onSubmit = async (payload: CreateOrderPayload) => {
    await createOrderMutation.mutateAsync(
      {
        clientId: client_id,
        payload,
      },
      {
        onSuccess: () => {
          toast.success("Order created successfully!");
          props.setAddingNewOrder(false);
        },
        onError: (error) => {
          console.error("Client creation error:", error);
        },
      }
    );
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  return (
    <form class="flex flex-col gap-6 border-line-700 border-y py-5" onSubmit={handleSubmit}>
      <div class="flex flex-col gap-6">
        {/* Item Name */}
        <Label class="flex flex-col items-stretch gap-1">
          <div class="flex items-center justify-between">
            <p class="font-medium text-sm">Item Name</p>
            {/* <Button class="h-fit w-fit gap-2 p-0 text-grey" variant="ghost" type="button" onClick={() => props.setAddingNewOrder(false)}>
              <span class="size-4">
                <Icon icon="ix:cancel" />
              </span>
              <p>Remove</p>
            </Button> */}
          </div>
          <Controller
            name="order.item"
            control={formMethods.control}
            render={({ field: itemField }) =>
              (
                <div class="flex flex-col gap-1.5">
                  <input
                    {...itemField}
                    placeholder="blue senator"
                    class="flex min-h-10.5 flex-1 items-center gap-3.5 border border-line-700 px-3 text-sm placeholder:text-grey-400"
                  />
                  {formMethods.formState.errors.order?.item && <p class="text-red-500 text-xs">{formMethods.formState.errors.order?.item?.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>

        {/* Quantity */}
        <Label class="flex w-fit border border-line-700">
          <p class="border-line-700 border-r py-1.5 pr-2.5 pl-1">Quantity</p>
          <Controller
            name="order.quantity"
            control={formMethods.control}
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
            name="order.notes"
            control={formMethods.control}
            render={({ field: notesField }) =>
              (
                <div class="flex flex-col gap-1.5">
                  <textarea
                    {...notesField}
                    placeholder="The client want it to be fitted and the trousers should be very long and fitted"
                    class="flex min-h-20 flex-1 items-center gap-3.5 border border-line-700 px-3 py-3 text-sm placeholder:text-grey-400"
                  />
                  {formMethods.formState.errors.order?.notes && <p class="text-red-500 text-xs">{formMethods.formState.errors.order?.notes?.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>

        {/* Due Date */}
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Due Date</p>
          <Controller
            name="order.due_date"
            control={formMethods.control}
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
                      {formatDateForOrderDueDate(field.value)}
                    </button>
                    <input {...field} type="date" class="pointer-events-none absolute inset-0 opacity-0" />
                  </div>
                  {formMethods.formState.errors.order?.due_date && <p class="text-red-500 text-xs">{formMethods.formState.errors.order?.due_date.message}</p>}
                </div>
              ) as any;
            }}
          />
        </Label>
      </div>
      <ul class="flex items-center justify-between gap-4">
        <Button class="flex-1" type="button" onClick={() => props.setAddingNewOrder(false)} disabled={createOrderMutation.isPending}>
          Cancel
        </Button>
        <Button class="flex-1" disabled={!formMethods.formState.isDirty || createOrderMutation.isPending} type="submit">
          Save
        </Button>
      </ul>
      {console.log(formMethods.formState.errors)}
    </form>
  );
};
