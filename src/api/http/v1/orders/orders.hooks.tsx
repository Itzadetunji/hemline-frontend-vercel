import type { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ORDERS_API } from "./orders.api";
import type {
  ListOrdersResponse,
  GetOrderResponse,
  CreateOrderResponse,
  UpdateOrderResponse,
  DeleteOrderResponse,
  DeleteOrdersResponse,
  CreateOrderPayload,
  UpdateOrderPayload,
  DeleteOrdersPayload,
} from "./orders.types";

export const ordersQueryKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersQueryKeys.all, "list"] as const,
  list: (clientId: string, params?: { page?: number; per_page?: number }) => [...ordersQueryKeys.lists(), clientId, params] as const,
  details: () => [...ordersQueryKeys.all, "detail"] as const,
  detail: (clientId: string, orderId: string) => [...ordersQueryKeys.details(), clientId, orderId] as const,
} as const;

export const useGetOrders = (
  clientId: string,
  params?: {
    page?: number;
    per_page?: number;
  }
) => {
  return useQuery<ListOrdersResponse, AxiosError>({
    queryKey: ordersQueryKeys.list(clientId, params),
    queryFn: () => ORDERS_API.GET_ALL(clientId, params),
    enabled: !!clientId,
  });
};

export const useGetOrder = (clientId: string, orderId: string) => {
  return useQuery<GetOrderResponse, AxiosError>({
    queryKey: ordersQueryKeys.detail(clientId, orderId),
    queryFn: () => ORDERS_API.GET(clientId, orderId),
    enabled: !!clientId && !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, AxiosError<{ error: string }>, { clientId: string; payload: CreateOrderPayload }>({
    mutationFn: ({ clientId, payload }) => ORDERS_API.CREATE(clientId, payload),
    onSuccess: () => {
      toast.success("Order created successfully!");

      // Invalidate and refetch orders list for this client
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateOrderResponse, AxiosError<{ error: string }>, { clientId: string; orderId: string; payload: UpdateOrderPayload }>({
    mutationFn: ({ clientId, orderId, payload }) => ORDERS_API.UPDATE(clientId, orderId, payload),
    onSuccess: (data, variables) => {
      toast.success("Order updated successfully!");

      // Update the specific order detail in cache
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.clientId, variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            order: data.data.order,
          },
        };
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.clientId, variables.orderId),
      });
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrderResponse, AxiosError<{ error: string }>, { clientId: string; orderId: string }>({
    mutationFn: ({ clientId, orderId }) => ORDERS_API.DELETE(clientId, orderId),
    onSuccess: () => {
      toast.success("Order deleted successfully!");

      // Invalidate and refetch orders list
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    },
  });
};

export const useBulkDeleteOrders = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrdersResponse, AxiosError<{ error: string }>, { clientId: string; payload: DeleteOrdersPayload }>({
    mutationFn: ({ clientId, payload }) => ORDERS_API.BULK_DELETE(clientId, payload),
    onSuccess: () => {
      toast.success("Orders deleted successfully!");

      // Invalidate and refetch orders list
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error deleting orders:", error);
      toast.error("Failed to delete orders");
    },
  });
};

export const useCreateGeneralOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, AxiosError<{ error: string }>, CreateOrderPayload>({
    mutationFn: (payload) => ORDERS_API.CREATE_GENERAL(payload),
    onSuccess: () => {
      toast.success("Order created successfully!");

      // Invalidate and refetch orders list
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    },
  });
};

export const useMarkOrderAsDone = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateOrderResponse, AxiosError<{ error: string }>, { clientId: string; orderId: string }>({
    mutationFn: ({ clientId, orderId }) => ORDERS_API.MARK_AS_DONE(clientId, orderId),
    onSuccess: (data, variables) => {
      toast.success("Order marked as done!");

      // Update the specific order detail in cache
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.clientId, variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            order: data.data.order,
          },
        };
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.clientId, variables.orderId),
      });
    },
    onError: (error) => {
      console.error("Error marking order as done:", error);
      toast.error("Failed to mark order as done");
    },
  });
};

export const useMarkOrderAsPending = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateOrderResponse, AxiosError<{ error: string }>, { clientId: string; orderId: string }>({
    mutationFn: ({ clientId, orderId }) => ORDERS_API.MARK_AS_PENDING(clientId, orderId),
    onSuccess: (data, variables) => {
      toast.success("Order marked as pending!");

      // Update the specific order detail in cache
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.clientId, variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            order: data.data.order,
          },
        };
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.clientId, variables.orderId),
      });
    },
    onError: (error) => {
      console.error("Error marking order as pending:", error);
      toast.error("Failed to mark order as pending");
    },
  });
};
