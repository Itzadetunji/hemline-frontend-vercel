import { useBulkDeleteOrders } from "@/api/http/v1/orders/orders.hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import toast from "react-hot-toast";

interface DeleteOrdersSignalProps {
  isOpen: boolean;
  orderIds?: string[];
  setIsOpen: (open: boolean) => void;
  setOrderDetails: (orderDetails?: string[]) => void;
}

export const deleteOrdersSignal = signal<DeleteOrdersSignalProps>({
  isOpen: false,
  setIsOpen: (isOpen) => {
    deleteOrdersSignal.value = {
      ...deleteOrdersSignal.value,
      isOpen,
    };
  },
  setOrderDetails: (orderIds) => {
    deleteOrdersSignal.value = {
      ...deleteOrdersSignal.value,
      orderIds,
    };
  },
});

export const DeleteOrders = () => {
  const deleteOrdersMutation = useBulkDeleteOrders();

  const handleDelete = async () => {
    if (!deleteOrdersSignal.value.orderIds || deleteOrdersSignal.value.orderIds.length === 0) {
      toast.error("No orders selected");
      return;
    }

    await deleteOrdersMutation.mutateAsync(
      { order_ids: deleteOrdersSignal.value.orderIds },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Order(s) deleted successfully");
          deleteOrdersSignal.value.setIsOpen(false);
          deleteOrdersSignal.value.setOrderDetails(undefined);
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.error || "Failed to delete orders";
          toast.error(errorMessage);
        },
      }
    );
  };

  const ordersCount = deleteOrdersSignal.value.orderIds?.length || 0;

  return (
    <Dialog
      open={deleteOrdersSignal.value.isOpen}
      onOpenChange={(open) => {
        if (deleteOrdersMutation.isPending) return;
        deleteOrdersSignal.value.setIsOpen(open);
      }}
    >
      <DialogContent showClose={false} class="flex flex-col gap-8 rounded-none">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <DialogClose class="size-4">
              <Icon icon="ix:cancel" fontSize={16} />
            </DialogClose>
            <p class="font-medium text-sm">Delete</p>
          </div>
        </DialogHeader>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4">
            <p class="!font-primary text-2xl leading-0">
              Delete {ordersCount} selected order{ordersCount > 1 && "s"}
            </p>
            <p class="font-medium text-sm">This is permanent, all saved deliverables will be deleted.</p>
          </div>
          <DialogFooter class="flex flex-row-reverse justify-stretch gap-3">
            <Button class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={() => deleteOrdersSignal.value.setIsOpen(false)} disabled={deleteOrdersMutation.isPending}>
              Keep
            </Button>

            <Button variant="outline" class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={handleDelete} disabled={deleteOrdersMutation.isPending}>
              {deleteOrdersMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
