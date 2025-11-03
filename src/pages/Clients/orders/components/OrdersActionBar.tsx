import { Icon } from "@iconify/react";

import type { OrderAttributes } from "@/api/http/v1/orders/orders.types";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { deleteOrdersSignal } from "./DeleteOrders";

export const OrdersActionBar = (props: { allOrders: OrderAttributes[] }) => {
  const handleExportToCSV = () => {
    if (deleteOrdersSignal.value.orderIds.length === 0) {
      toast.error("Please select at least one order to export");
      return;
    }
    exportOrdersToCSV(props.allOrders, deleteOrdersSignal.value.orderIds);
  };
  const handleDeleteOrders = () => {
    if (deleteOrdersSignal.value.orderIds.length === 0) {
      toast("Please select at least one order to delete");
      return;
    }
    deleteOrdersSignal.value.setIsOpen(true);
  };

  return (
    <ul class="-translate-x-1/2 fixed bottom-6 left-1/2 flex items-center gap-0 border border-line-500">
      <Button class="gap-1 px-4 py-2.5 text-black capitalize" variant="secondary" onClick={handleExportToCSV}>
        <div class="min-w-4.5">
          <Icon icon="iconoir:download" className="size-4.5" />
        </div>
        <p class="leading-0">Export to CSV</p>
      </Button>
      <Button class="-ml-0.5 gap-1.5 bg-white px-4 py-2.5 text-destructive capitalize hover:bg-white/80" onClick={handleDeleteOrders}>
        <div class="min-w-4.5">
          <Icon icon="material-symbols-light:delete-outline-sharp" className="h-4.5 w-4.5" />
        </div>
        <p class="leading-0">Delete</p>
      </Button>
    </ul>
  );
};

// Utility function to export orders to CSV
export const exportOrdersToCSV = (orders: OrderAttributes[], orderIds: string[]) => {
  try {
    // Filter orders based on orderIds
    const ordersToExport = orders.filter((order) => orderIds.includes(order.id));

    if (ordersToExport.length === 0) {
      toast.error("No orders selected for export");
      return;
    }

    // Format date helper
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    };

    // CSV Headers
    const headers = ["Client Name", "Item", "Quantity", "Notes", "Completed", "Updated", "Overdue", "Created"];

    // CSV Rows
    const rows = ordersToExport.map((order) => [
      order.client_name,
      order.item,
      order.quantity.toString(),
      order.notes || "",
      order.is_done ? "Yes" : "No",
      formatDate(order.updated_at),
      order.overdue ? "Yes" : "No",
      formatDate(order.created_at),
    ]);

    // Escape CSV values (handle commas and quotes)
    const escapeCSVValue = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build CSV content
    const csvContent = [headers.join(","), ...rows.map((row) => row.map(escapeCSVValue).join(","))].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";

    // Add these attributes to prevent framework interception
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    URL.revokeObjectURL(url);

    toast.success(`Exported ${ordersToExport.length} order${ordersToExport.length > 1 ? "s" : ""} to CSV`);
  } catch (error) {
    toast.error("An error occurred while exporting orders");
    console.error("Error exporting orders to CSV:", error);
  }
};
