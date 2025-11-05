import { Icon } from "@iconify/react";
import type { RefObject } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { useInfiniteGetOrders, useMarkOrderAsDone, useMarkOrderAsPending } from "@/api/http/v1/orders/orders.hooks";
import type { OrderAttributes } from "@/api/http/v1/orders/orders.types";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { cn } from "@/lib/utils";
import { useLocation } from "preact-iso";
import { DeleteOrders, deleteOrdersSignal } from "./components/DeleteOrders";
import { exportOrdersToCSV, OrdersActionBar } from "./components/OrdersActionBar";

export const Orders = () => {
  const getUserProfile = useGetUserProfile();
  const { data, isLoading, isFetchingNextPage, isFetching, hasNextPage, fetchNextPage } = useInfiniteGetOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const isSearching = debouncedSearchTerm.length > 0;
  const getIniniteOrdersSearchQuery = useInfiniteGetOrders({ search: debouncedSearchTerm, enabled: isSearching });

  // Flatten all pages into a single array of orders
  const allOrders = data?.pages.flatMap((page) => page.data.orders) ?? [];
  const allSearchingOrders = getIniniteOrdersSearchQuery.data?.pages.flatMap((page) => page.data.orders) ?? [];

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
          <h1 class="text-3xl text-black">All Orders</h1>{" "}
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
    <div class="flex flex-1 flex-col gap-10 px-4 pb-24">
      {!isLoading && allOrders.length === 0 && <NoOders />}
      <div
        class={cn("flex flex-col gap-6", {
          "flex-1": !(getIniniteOrdersSearchQuery.isFetching || isFetching),
        })}
      >
        <Label class="flex flex-col items-stretch gap-4">
          <div class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3">
            <i className="size-4.5">
              <Icon icon="lucide:search" fontSize="18" />
            </i>
            <input
              type="text"
              placeholder="Item, Notes, Client Name"
              class="flex-1 text-sm placeholder:text-grey-400"
              value={searchTerm}
              onInput={(e: Event) => setSearchTerm((e.currentTarget as HTMLInputElement).value)}
            />
          </div>
        </Label>
        {!isSearching && !isLoading && allOrders.length > 0 && (
          <OrdersList orders={allOrders} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} isFetching={isFetching} />
        )}

        {isSearching && (
          <OrdersList
            orders={allSearchingOrders}
            hasNextPage={getIniniteOrdersSearchQuery.hasNextPage}
            isFetchingNextPage={getIniniteOrdersSearchQuery.isFetchingNextPage}
            fetchNextPage={getIniniteOrdersSearchQuery.fetchNextPage}
            isFetching={getIniniteOrdersSearchQuery.isFetching}
          />
        )}
      </div>

      {(getIniniteOrdersSearchQuery.isFetching || isFetching) && <OrdersSkeleton />}
      <DeleteOrders />
      {deleteOrdersSignal.value.isSelecting && <OrdersActionBar allOrders={allOrders} />}
    </div>
  );
};

const NoOders = () => {
  return (
    <div class="flex flex-1 flex-col items-stretch">
      <div class="flex flex-1 flex-col items-center justify-center gap-4">
        <div class="flex flex-col items-center gap-4">
          <h2 class="text-2xl leading-0">No orders</h2>
          <p class="max-w-8/10 text-center font-medium text-grey-500 text-sm">Create an order in a client's profile</p>
        </div>
      </div>
    </div>
  );
};

const OrdersList = (props: { orders: OrderAttributes[]; hasNextPage: boolean; isFetchingNextPage: boolean; isFetching: boolean; fetchNextPage: () => void }) => {
  const observerTarget = useRef<HTMLLIElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && props.hasNextPage && !props.isFetchingNextPage) {
          props.fetchNextPage();
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
  }, [props.hasNextPage, props.isFetchingNextPage, props.fetchNextPage]);

  // Get the last order to attach the observer
  const lastOrder = props.orders[props.orders.length - 1];

  return (
    <>
      {!props.isFetching && props.orders.length > 0 && (
        <ul class="flex flex-1 flex-col gap-4">
          {props.orders.map((order) => {
            const isLastItem = order.id === lastOrder.id;
            return <OrdersListItem key={order.id} order={order} allOrders={props.orders} isLastItem={isLastItem} observerRef={isLastItem ? observerTarget : undefined} />;
          })}
          {props.isFetchingNextPage && <OrdersSkeleton />}
        </ul>
      )}

      {!props.isFetching && !props.isFetchingNextPage && !props.orders.length && (
        <div class="flex flex-1 flex-col items-center justify-center gap-4">
          <h2 class="text-2xl">No Orders Found</h2>
        </div>
      )}
    </>
  );
};

export const OrdersSkeleton = () => {
  return (
    <div class="relative flex flex-col gap-3.5 border border-line-700 p-3">
      <div class="flex items-center justify-between border-line-700 border-b pb-3">
        <Skeleton class="h-7 w-30 rounded-xs" />
        <Skeleton class="size-5 rounded-full" />
      </div>
      <ul class="flex flex-col gap-2">
        <Skeleton class="h-4 w-18 rounded-xs" />
        <Skeleton class="h-4 w-14 rounded-xs" />
        <Skeleton class="h-4 w-17 rounded-xs" />
      </ul>
      <div class="flex items-center gap-2">
        <Skeleton class="h-4 w-25 rounded-xs" />
        <Skeleton class="size-4 rounded-xs" />
      </div>
    </div>
  );
};

const OrdersListItem = (props: { order: OrderAttributes; allOrders: OrderAttributes[]; isLastItem: boolean; observerRef?: RefObject<HTMLLIElement> }) => {
  const [isChecked, setIsChecked] = useState(props.order.is_done);
  const markAsDoneMutation = useMarkOrderAsDone();
  const markAsPendingMutation = useMarkOrderAsPending();
  const location = useLocation();

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
    location.route(`/clients/${props.order.client_id}?tab=orders`, true);
  };

  const handleExportSingleOrder = () => {
    exportOrdersToCSV(props.allOrders, [props.order.id]);
  };

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
                  <div class="min-w-5 p-1">
                    <Icon icon="iconoir:edit" className="h-4 w-4 text-black" />
                  </div>
                </button>
                <button type="button" onClick={handleExportSingleOrder} class="flex cursor-pointer items-center justify-between gap-2 hover:bg-secondary">
                  <p class="font-medium text-sm">Download CSV</p>
                  <div class="min-w-5 p-1">
                    <Icon icon="iconoir:download" className="h-4 w-4 text-black" />
                  </div>
                </button>
                <button type="button" onClick={handleDelete} class="flex cursor-pointer items-center justify-between gap-2 hover:bg-secondary">
                  <p class="font-medium text-destructive text-sm">Delete Order </p>
                  <div class="min-w-5 p-1">
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
        <li class="text-grey text-sm">Added: {formatDateForOrderDueDate(props.order.created_at)}</li>
        {props.order.due_date && (
          <li class={cn("text-sm", props.order.overdue ? "text-destructive" : "text-grey")}>
            Due: {formatDateForOrderDueDate(props.order.due_date)} {props.order.overdue && "(Overdue)"}
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
};

export const handleSelectOrderChange = (e: Event, order_id: string) => {
  const target = e.target as HTMLInputElement;
  const currentSelected = deleteOrdersSignal.value.orderIds;

  if (target.checked) {
    // Add to selection
    deleteOrdersSignal.value = {
      ...deleteOrdersSignal.value,
      orderIds: [...currentSelected, order_id],
    };
  } else {
    // Remove from selection
    deleteOrdersSignal.value = {
      ...deleteOrdersSignal.value,
      orderIds: currentSelected.filter((id) => id !== order_id),
    };
  }
};

// Format the date in the requested format: "Tue, Oct 7 2025"
export const formatDateForOrderDueDate = (dateString?: string) => {
  if (!dateString) return "Select Date";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
